-- ============================================================
-- Add created_by + completed_at to case_tasks
-- Run in Supabase SQL Editor for project: rjmuhomeqydszmerlqrh
-- ============================================================

ALTER TABLE public.case_tasks
  ADD COLUMN IF NOT EXISTS created_by  uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS completed_at timestamptz;

-- Backfill completed_at for already-completed tasks
UPDATE public.case_tasks
SET completed_at = updated_at
WHERE status = 'completed' AND completed_at IS NULL;

NOTIFY pgrst, 'reload schema';
