-- ============================================================
-- FIX: Ensure locations and doctors are readable by all authenticated users
-- Run in Supabase SQL Editor for project: rjmuhomeqydszmerlqrh
-- ============================================================

-- ── Step 1: Check current policies ────────────────────────────────────────────
-- (Run this first to see what exists)
SELECT policyname, cmd, qual
FROM pg_policies
WHERE schemaname = 'public' AND tablename IN ('locations', 'doctors')
ORDER BY tablename, policyname;

-- ── Step 2: Drop and recreate locations SELECT policy ─────────────────────────
DROP POLICY IF EXISTS "locations_authenticated_read" ON public.locations;
DROP POLICY IF EXISTS "locations_coord_select" ON public.locations;

CREATE POLICY "locations_read_all_auth" ON public.locations FOR SELECT
  USING (auth.role() = 'authenticated');

-- ── Step 3: Drop and recreate doctors SELECT policy ───────────────────────────
-- First enable RLS on doctors if not already enabled
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "doctors_authenticated_read" ON public.doctors;
DROP POLICY IF EXISTS "doctors_coord_select" ON public.doctors;

CREATE POLICY "doctors_read_all_auth" ON public.doctors FOR SELECT
  USING (auth.role() = 'authenticated');

-- Admin/coordinator can also INSERT/UPDATE/DELETE doctors
DROP POLICY IF EXISTS "doctors_admin_coord_all" ON public.doctors;

CREATE POLICY "doctors_admin_coord_write" ON public.doctors FOR ALL
  USING (
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'coordinator')
  );

-- ── Step 4: Verify published hospital count ────────────────────────────────────
SELECT COUNT(*) AS total_hospitals,
       COUNT(*) FILTER (WHERE is_published = true) AS published_hospitals
FROM public.locations;

SELECT COUNT(*) AS total_doctors,
       COUNT(*) FILTER (WHERE is_published = true) AS published_doctors
FROM public.doctors;

-- ── Step 5: Reload schema ──────────────────────────────────────────────────────
NOTIFY pgrst, 'reload schema';
