-- ============================================================
-- Add author_role to case_notes + create case_note_replies table
-- Run in Supabase SQL Editor for project: rjmuhomeqydszmerlqrh
-- ============================================================

-- Add author_role to existing notes
ALTER TABLE public.case_notes
  ADD COLUMN IF NOT EXISTS author_role text;

-- Fix author_id FK to reference profiles (if not done already)
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
    WHERE tc.table_name = 'case_notes' AND kcu.column_name = 'author_id'
      AND tc.constraint_type = 'FOREIGN KEY'
  ) THEN
    ALTER TABLE public.case_notes DROP CONSTRAINT IF EXISTS case_notes_author_id_fkey;
    ALTER TABLE public.case_notes DROP CONSTRAINT IF EXISTS case_notes_author_id_profiles_fkey;
  END IF;
END $$;

ALTER TABLE public.case_notes
  ADD CONSTRAINT case_notes_author_id_profiles_fkey
  FOREIGN KEY (author_id) REFERENCES public.profiles(id) ON DELETE SET NULL;

-- Note replies table
CREATE TABLE IF NOT EXISTS public.case_note_replies (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  note_id     uuid NOT NULL REFERENCES public.case_notes(id) ON DELETE CASCADE,
  author_id   uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  author_role text,
  content     text NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_note_replies_note_id ON public.case_note_replies(note_id);

ALTER TABLE public.case_note_replies ENABLE ROW LEVEL SECURITY;

-- Admin + Coordinator: full access
CREATE POLICY "replies_admin_coord" ON public.case_note_replies FOR ALL
  USING (
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'coordinator')
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'coordinator')
  );

-- Doctor: read non-internal note replies (linked via case doctor assignment)
CREATE POLICY "replies_doctor_read" ON public.case_note_replies FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.case_notes cn
      JOIN public.patient_cases pc ON pc.id = cn.case_id
      JOIN public.doctors d ON d.id = pc.doctor_id
      WHERE cn.id = case_note_replies.note_id AND d.user_id = auth.uid()
    )
  );

-- Doctor: insert their own replies
CREATE POLICY "replies_doctor_insert" ON public.case_note_replies FOR INSERT
  WITH CHECK (
    author_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.case_notes cn
      JOIN public.patient_cases pc ON pc.id = cn.case_id
      JOIN public.doctors d ON d.id = pc.doctor_id
      WHERE cn.id = note_id AND d.user_id = auth.uid()
    )
  );

-- Fix case_notes RLS to use has_role()
DROP POLICY IF EXISTS "notes_admin_coord" ON public.case_notes;
CREATE POLICY "notes_admin_coord_role" ON public.case_notes FOR ALL
  USING (
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'coordinator')
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'coordinator')
  );

NOTIFY pgrst, 'reload schema';
