-- ============================================================
-- FIX: Lead-to-Case Visibility & RLS
-- Run in Supabase SQL Editor for project: rjmuhomeqydszmerlqrh
-- ============================================================

-- ── 1. Add converted_at to leads ──────────────────────────────────────────────
ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS converted_at timestamptz;

-- Backfill converted_at from updated_at for already-converted leads
UPDATE public.leads
SET converted_at = updated_at
WHERE crm_status = 'converted'
  AND converted_at IS NULL;

-- ── 2. Coordinator RLS on leads ───────────────────────────────────────────────
-- Coordinator can read all leads
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'leads' AND policyname = 'leads_coord_select'
  ) THEN
    CREATE POLICY "leads_coord_select" ON public.leads FOR SELECT
      USING ((auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'coordinator'));
  END IF;
END $$;

-- Coordinator can update leads (status, notes, follow-up, etc.)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'leads' AND policyname = 'leads_coord_update'
  ) THEN
    CREATE POLICY "leads_coord_update" ON public.leads FOR UPDATE
      USING ((auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'coordinator'));
  END IF;
END $$;

-- Admin can do everything on leads (covers insert/delete)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'leads' AND policyname = 'leads_admin_all'
  ) THEN
    CREATE POLICY "leads_admin_all" ON public.leads FOR ALL
      USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
  END IF;
END $$;

-- ── 3. Ensure patient_cases coordinator policy exists ─────────────────────────
-- (Was already created in Phase 1 migration but guard with IF NOT EXISTS)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'patient_cases' AND policyname = 'cases_admin_coord'
  ) THEN
    CREATE POLICY "cases_admin_coord" ON public.patient_cases FOR ALL
      USING ((auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'coordinator'));
  END IF;
END $$;

-- ── 4. Index for lead_id join performance ────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_patient_cases_lead_id ON public.patient_cases(lead_id);

-- ── 5. Reload schema ─────────────────────────────────────────────────────────
NOTIFY pgrst, 'reload schema';
