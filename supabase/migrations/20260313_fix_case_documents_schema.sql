-- ============================================================
-- FIX: Add missing columns to existing case_documents table
-- The table exists but was created with a different schema.
-- Run in Supabase SQL Editor for project: rjmuhomeqydszmerlqrh
-- ============================================================

-- First, see what columns currently exist
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'case_documents'
ORDER BY ordinal_position;

-- Add all columns the app expects (safe with IF NOT EXISTS)
ALTER TABLE public.case_documents
  ADD COLUMN IF NOT EXISTS case_id       uuid REFERENCES public.patient_cases(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS uploaded_by   uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS document_type text NOT NULL DEFAULT 'other',
  ADD COLUMN IF NOT EXISTS file_name     text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS file_path     text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS file_size     bigint,
  ADD COLUMN IF NOT EXISTS mime_type     text,
  ADD COLUMN IF NOT EXISTS notes         text,
  ADD COLUMN IF NOT EXISTS is_verified   boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS verified_by   uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS verified_at   timestamptz,
  ADD COLUMN IF NOT EXISTS created_at    timestamptz NOT NULL DEFAULT now();

-- Ensure CHECK constraint on document_type exists
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints
    WHERE constraint_name = 'case_documents_document_type_check'
  ) THEN
    ALTER TABLE public.case_documents
      ADD CONSTRAINT case_documents_document_type_check
      CHECK (document_type IN (
        'medical_report','lab_report','prescription','insurance',
        'id_proof','consent_form','discharge_summary','invoice','other'
      ));
  END IF;
END $$;

-- Ensure indexes
CREATE INDEX IF NOT EXISTS idx_case_docs_case_id ON public.case_documents(case_id);

-- Ensure RLS is enabled
ALTER TABLE public.case_documents ENABLE ROW LEVEL SECURITY;

-- Recreate policies using has_role()
DROP POLICY IF EXISTS "docs_admin_coord"      ON public.case_documents;
DROP POLICY IF EXISTS "docs_admin_coord_role" ON public.case_documents;
DROP POLICY IF EXISTS "docs_doctor_read"      ON public.case_documents;

CREATE POLICY "docs_admin_coord_role" ON public.case_documents FOR ALL
  USING (
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'coordinator')
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'coordinator')
  );

-- Verify the columns now exist
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'case_documents'
ORDER BY ordinal_position;

NOTIFY pgrst, 'reload schema';
