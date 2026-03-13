-- ============================================================
-- FIX: Storage bucket policies for case-documents
-- Replace app_metadata JWT check with has_role() to match
-- the project's auth system (user_roles table).
-- Run in Supabase SQL Editor for project: rjmuhomeqydszmerlqrh
-- ============================================================

-- ── Ensure bucket exists ───────────────────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'case-documents',
  'case-documents',
  false,
  10485760,  -- 10 MB
  ARRAY['application/pdf','image/jpeg','image/png','image/jpg',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']
)
ON CONFLICT (id) DO NOTHING;

-- ── Drop old app_metadata policies ────────────────────────────────────────────
DROP POLICY IF EXISTS "case_docs_upload"  ON storage.objects;
DROP POLICY IF EXISTS "case_docs_read"    ON storage.objects;
DROP POLICY IF EXISTS "case_docs_delete"  ON storage.objects;

-- ── Recreate with has_role() ───────────────────────────────────────────────────
CREATE POLICY "case_docs_upload" ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'case-documents'
    AND (
      public.has_role(auth.uid(), 'admin') OR
      public.has_role(auth.uid(), 'coordinator')
    )
  );

CREATE POLICY "case_docs_read" ON storage.objects FOR SELECT
  USING (
    bucket_id = 'case-documents'
    AND (
      public.has_role(auth.uid(), 'admin') OR
      public.has_role(auth.uid(), 'coordinator') OR
      public.has_role(auth.uid(), 'doctor')
    )
  );

CREATE POLICY "case_docs_delete" ON storage.objects FOR DELETE
  USING (
    bucket_id = 'case-documents'
    AND (
      public.has_role(auth.uid(), 'admin') OR
      public.has_role(auth.uid(), 'coordinator')
    )
  );

-- ── Fix case_documents table INSERT policy (ensure WITH CHECK exists) ──────────
-- The FOR ALL policy needs WITH CHECK for INSERT operations
DROP POLICY IF EXISTS "docs_admin_coord_role" ON public.case_documents;

CREATE POLICY "docs_admin_coord_role" ON public.case_documents FOR ALL
  USING (
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'coordinator')
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'coordinator')
  );

-- ── Verify ─────────────────────────────────────────────────────────────────────
SELECT policyname, cmd FROM pg_policies
WHERE schemaname = 'storage' AND tablename = 'objects'
  AND policyname LIKE 'case_docs%';

NOTIFY pgrst, 'reload schema';
