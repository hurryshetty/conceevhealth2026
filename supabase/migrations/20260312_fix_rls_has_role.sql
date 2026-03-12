-- ============================================================
-- FIX: Add has_role() policies to all case-related tables
-- The app uses user_roles table (has_role()), not app_metadata JWT.
-- Run in Supabase SQL Editor for project: rjmuhomeqydszmerlqrh
-- ============================================================

-- ── case_timeline ──────────────────────────────────────────────────────────────
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'case_timeline' AND policyname = 'timeline_admin_coord_role'
  ) THEN
    CREATE POLICY "timeline_admin_coord_role" ON public.case_timeline FOR ALL
      USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'coordinator'));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'case_timeline' AND policyname = 'timeline_patient_read'
  ) THEN
    CREATE POLICY "timeline_patient_read" ON public.case_timeline FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM public.patient_cases pc
          WHERE pc.id = case_timeline.case_id AND pc.patient_id = auth.uid()
        )
      );
  END IF;
END $$;


-- ── case_tasks ─────────────────────────────────────────────────────────────────
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'case_tasks' AND policyname = 'tasks_admin_coord_role'
  ) THEN
    CREATE POLICY "tasks_admin_coord_role" ON public.case_tasks FOR ALL
      USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'coordinator'));
  END IF;
END $$;


-- ── case_notes ─────────────────────────────────────────────────────────────────
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'case_notes' AND policyname = 'notes_admin_coord_role'
  ) THEN
    CREATE POLICY "notes_admin_coord_role" ON public.case_notes FOR ALL
      USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'coordinator'));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'case_notes' AND policyname = 'notes_patient_read'
  ) THEN
    CREATE POLICY "notes_patient_read" ON public.case_notes FOR SELECT
      USING (
        is_internal = false AND
        EXISTS (
          SELECT 1 FROM public.patient_cases pc
          WHERE pc.id = case_notes.case_id AND pc.patient_id = auth.uid()
        )
      );
  END IF;
END $$;


-- ── case_documents ─────────────────────────────────────────────────────────────
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'case_documents' AND policyname = 'docs_admin_coord_role'
  ) THEN
    CREATE POLICY "docs_admin_coord_role" ON public.case_documents FOR ALL
      USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'coordinator'));
  END IF;
END $$;


-- ── case_billing ───────────────────────────────────────────────────────────────
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'case_billing' AND policyname = 'billing_admin_coord_role'
  ) THEN
    CREATE POLICY "billing_admin_coord_role" ON public.case_billing FOR ALL
      USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'coordinator'));
  END IF;
END $$;


-- ── settlements ────────────────────────────────────────────────────────────────
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'settlements' AND policyname = 'settlements_admin_role'
  ) THEN
    CREATE POLICY "settlements_admin_role" ON public.settlements FOR ALL
      USING (public.has_role(auth.uid(), 'admin'));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'settlements' AND policyname = 'settlements_coord_read_role'
  ) THEN
    CREATE POLICY "settlements_coord_read_role" ON public.settlements FOR SELECT
      USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'coordinator'));
  END IF;
END $$;


-- ── appointments ───────────────────────────────────────────────────────────────
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'appointments' AND policyname = 'appointments_admin_coord_role'
  ) THEN
    CREATE POLICY "appointments_admin_coord_role" ON public.appointments FOR ALL
      USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'coordinator'));
  END IF;
END $$;


-- ── locations (hospital reference data) ───────────────────────────────────────
-- Allow all authenticated users to read locations (it's reference/lookup data)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'locations' AND policyname = 'locations_authenticated_read'
  ) THEN
    CREATE POLICY "locations_authenticated_read" ON public.locations FOR SELECT
      USING (auth.uid() IS NOT NULL);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'locations' AND policyname = 'locations_admin_all'
  ) THEN
    CREATE POLICY "locations_admin_all" ON public.locations FOR ALL
      USING (public.has_role(auth.uid(), 'admin'));
  END IF;
END $$;


-- ── doctors ────────────────────────────────────────────────────────────────────
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'doctors' AND policyname = 'doctors_authenticated_read'
  ) THEN
    CREATE POLICY "doctors_authenticated_read" ON public.doctors FOR SELECT
      USING (auth.uid() IS NOT NULL);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'doctors' AND policyname = 'doctors_admin_coord_all'
  ) THEN
    CREATE POLICY "doctors_admin_coord_all" ON public.doctors FOR ALL
      USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'coordinator'));
  END IF;
END $$;


-- ── profiles: allow coordinator to read all (for name lookups) ─────────────────
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'profiles' AND policyname = 'profiles_coord_read_role'
  ) THEN
    CREATE POLICY "profiles_coord_read_role" ON public.profiles FOR SELECT
      USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'coordinator'));
  END IF;
END $$;


-- ── Reload schema ──────────────────────────────────────────────────────────────
NOTIFY pgrst, 'reload schema';
