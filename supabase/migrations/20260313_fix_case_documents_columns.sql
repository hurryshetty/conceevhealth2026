-- ============================================================
-- FIX: Rename file_url → file_path in case_documents
-- Fix case_notes author_id to reference profiles instead of auth.users
-- Run in Supabase SQL Editor for project: rjmuhomeqydszmerlqrh
-- ============================================================

-- See current case_documents columns
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'case_documents'
ORDER BY ordinal_position;

-- Rename file_url → file_path (if file_url exists and file_path doesn't)
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'case_documents' AND column_name = 'file_url'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'case_documents' AND column_name = 'file_path'
  ) THEN
    ALTER TABLE public.case_documents RENAME COLUMN file_url TO file_path;
  END IF;
END $$;

-- If both exist, drop file_path (empty default) and keep renamed file_url
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'case_documents' AND column_name = 'file_url'
  ) AND EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'case_documents' AND column_name = 'file_path'
  ) THEN
    -- Drop the new empty default one, rename the original
    ALTER TABLE public.case_documents DROP COLUMN file_path;
    ALTER TABLE public.case_documents RENAME COLUMN file_url TO file_path;
  END IF;
END $$;

-- Fix case_notes: change author_id to reference profiles instead of auth.users
-- so that profiles!author_id(full_name) join works
DO $$ BEGIN
  -- Drop existing FK if it references auth.users
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
    WHERE tc.table_name = 'case_notes' AND kcu.column_name = 'author_id'
      AND tc.constraint_type = 'FOREIGN KEY'
  ) THEN
    ALTER TABLE public.case_notes DROP CONSTRAINT IF EXISTS case_notes_author_id_fkey;
  END IF;
END $$;

-- Add FK from case_notes.author_id to profiles.id (enables PostgREST join)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'case_notes' AND constraint_name = 'case_notes_author_id_profiles_fkey'
  ) THEN
    ALTER TABLE public.case_notes
      ADD CONSTRAINT case_notes_author_id_profiles_fkey
      FOREIGN KEY (author_id) REFERENCES public.profiles(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Verify final columns
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'case_documents'
ORDER BY ordinal_position;

NOTIFY pgrst, 'reload schema';
