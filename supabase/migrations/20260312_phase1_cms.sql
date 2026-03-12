-- ============================================================
-- PHASE 1: CONCEEV HEALTH CMS — DATABASE MIGRATIONS
-- Run this in Supabase SQL Editor for project: rjmuhomeqydszmerlqrh
-- ============================================================

-- ── 1. PROFILES TABLE ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id         uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name  text,
  phone      text,
  email      text,
  role       text NOT NULL DEFAULT 'patient'
               CHECK (role IN ('admin','coordinator','doctor','hospital','patient','user')),
  hospital_id uuid REFERENCES public.locations(id) ON DELETE SET NULL,
  doctor_id   uuid REFERENCES public.doctors(id)   ON DELETE SET NULL,
  is_active   boolean NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_app_meta_data->>'role', 'patient')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Backfill profiles for existing users
INSERT INTO public.profiles (id, email, role)
SELECT id, email, COALESCE(raw_app_meta_data->>'role', 'patient')
FROM auth.users
ON CONFLICT (id) DO NOTHING;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_own_select"  ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_own_update"  ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_admin_all"   ON public.profiles FOR ALL
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
CREATE POLICY "profiles_coord_read"  ON public.profiles FOR SELECT
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin','coordinator'));


-- ── 2. EXTEND LEADS TABLE ──────────────────────────────────────────────────────
ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS lead_code              text UNIQUE,
  ADD COLUMN IF NOT EXISTS email                  text,
  ADD COLUMN IF NOT EXISTS age                    integer,
  ADD COLUMN IF NOT EXISTS gender                 text CHECK (gender IN ('male','female','other')),
  ADD COLUMN IF NOT EXISTS preferred_city         text,
  ADD COLUMN IF NOT EXISTS qualification_status   text NOT NULL DEFAULT 'unqualified'
                             CHECK (qualification_status IN ('unqualified','qualified','not_a_fit')),
  ADD COLUMN IF NOT EXISTS assigned_coordinator_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS updated_at             timestamptz DEFAULT now();

-- Lead code auto-generation
CREATE OR REPLACE FUNCTION public.set_lead_code()
RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE
  yr  text := to_char(current_date, 'YYYY');
  seq bigint;
BEGIN
  IF NEW.lead_code IS NULL THEN
    SELECT COUNT(*) + 1 INTO seq
    FROM public.leads
    WHERE extract(year from created_at)::text = yr;
    NEW.lead_code := 'CH-LEAD-' || yr || '-' || lpad(seq::text, 4, '0');
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_lead_code ON public.leads;
CREATE TRIGGER trg_lead_code
  BEFORE INSERT ON public.leads
  FOR EACH ROW EXECUTE FUNCTION public.set_lead_code();

-- Backfill lead_code for existing leads
DO $$
DECLARE r RECORD; i bigint := 1; yr text;
BEGIN
  FOR r IN SELECT id, created_at FROM public.leads WHERE lead_code IS NULL ORDER BY created_at LOOP
    yr := to_char(r.created_at, 'YYYY');
    UPDATE public.leads
    SET lead_code = 'CH-LEAD-' || yr || '-' || lpad(i::text, 4, '0')
    WHERE id = r.id;
    i := i + 1;
  END LOOP;
END;
$$;


-- ── 3. EXTEND patient_cases TABLE ──────────────────────────────────────────────
ALTER TABLE public.patient_cases
  ADD COLUMN IF NOT EXISTS case_code               text UNIQUE,
  ADD COLUMN IF NOT EXISTS lead_id                 uuid REFERENCES public.leads(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS doctor_id               uuid REFERENCES public.doctors(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS treatment_type          text,
  ADD COLUMN IF NOT EXISTS case_stage              text NOT NULL DEFAULT 'case_created'
                             CHECK (case_stage IN (
                               'case_created','assignment_pending','assigned',
                               'consultation_scheduled','consultation_completed',
                               'pre_treatment','treatment_confirmed','admitted',
                               'treatment_in_progress','recovery','discharged',
                               'followup','billing_pending','closed','cancelled',
                               'on_hold','escalated'
                             )),
  ADD COLUMN IF NOT EXISTS estimated_package_cost  numeric(12,2),
  ADD COLUMN IF NOT EXISTS final_package_cost      numeric(12,2),
  ADD COLUMN IF NOT EXISTS expected_treatment_date date,
  ADD COLUMN IF NOT EXISTS consultation_status     text NOT NULL DEFAULT 'pending'
                             CHECK (consultation_status IN ('pending','scheduled','completed','cancelled')),
  ADD COLUMN IF NOT EXISTS document_status         text NOT NULL DEFAULT 'pending'
                             CHECK (document_status IN ('pending','partial','complete')),
  ADD COLUMN IF NOT EXISTS payment_status          text NOT NULL DEFAULT 'pending'
                             CHECK (payment_status IN ('pending','partial','paid','refunded')),
  ADD COLUMN IF NOT EXISTS discharge_status        text NOT NULL DEFAULT 'pending'
                             CHECK (discharge_status IN ('pending','admitted','discharged')),
  ADD COLUMN IF NOT EXISTS closure_reason          text,
  ADD COLUMN IF NOT EXISTS outcome                 text
                             CHECK (outcome IN ('successful','unsuccessful','cancelled','on_hold')),
  ADD COLUMN IF NOT EXISTS is_escalated            boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS updated_at              timestamptz DEFAULT now();

-- Case code auto-generation
CREATE OR REPLACE FUNCTION public.set_case_code()
RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE
  yr  text := to_char(current_date, 'YYYY');
  seq bigint;
BEGIN
  IF NEW.case_code IS NULL OR NEW.case_code = '' THEN
    SELECT COUNT(*) + 1 INTO seq
    FROM public.patient_cases
    WHERE extract(year from created_at)::text = yr;
    NEW.case_code := 'CH-CASE-' || yr || '-' || lpad(seq::text, 4, '0');
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_case_code ON public.patient_cases;
CREATE TRIGGER trg_case_code
  BEFORE INSERT ON public.patient_cases
  FOR EACH ROW EXECUTE FUNCTION public.set_case_code();

-- Backfill case_code from case_number for existing rows
UPDATE public.patient_cases
SET case_code = case_number
WHERE case_code IS NULL AND case_number IS NOT NULL AND case_number != '';


-- ── 4. CASE TIMELINE ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.case_timeline (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id      uuid NOT NULL REFERENCES public.patient_cases(id) ON DELETE CASCADE,
  action_type  text NOT NULL,
  description  text,
  performed_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  metadata     jsonb NOT NULL DEFAULT '{}',
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_case_timeline_case_id    ON public.case_timeline(case_id);
CREATE INDEX IF NOT EXISTS idx_case_timeline_created_at ON public.case_timeline(created_at DESC);

ALTER TABLE public.case_timeline ENABLE ROW LEVEL SECURITY;
CREATE POLICY "timeline_admin_coord" ON public.case_timeline FOR ALL
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin','coordinator'));
CREATE POLICY "timeline_doctor_read" ON public.case_timeline FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.patient_cases pc
      JOIN public.doctors d ON d.id = pc.doctor_id
      WHERE pc.id = case_timeline.case_id AND d.user_id = auth.uid()
    )
  );


-- ── 5. CASE TASKS ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.case_tasks (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id     uuid NOT NULL REFERENCES public.patient_cases(id) ON DELETE CASCADE,
  task_title  text NOT NULL,
  assigned_to uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  due_date    date,
  priority    text NOT NULL DEFAULT 'medium'
                CHECK (priority IN ('low','medium','high','critical')),
  status      text NOT NULL DEFAULT 'pending'
                CHECK (status IN ('pending','in_progress','completed','cancelled')),
  notes       text,
  sort_order  integer NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_case_tasks_case_id ON public.case_tasks(case_id);
CREATE INDEX IF NOT EXISTS idx_case_tasks_status  ON public.case_tasks(status);

ALTER TABLE public.case_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tasks_admin_coord" ON public.case_tasks FOR ALL
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin','coordinator'));
CREATE POLICY "tasks_doctor_read" ON public.case_tasks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.patient_cases pc
      JOIN public.doctors d ON d.id = pc.doctor_id
      WHERE pc.id = case_tasks.case_id AND d.user_id = auth.uid()
    )
  );


-- ── 6. CASE NOTES (create if not exists) ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.case_notes (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id     uuid NOT NULL REFERENCES public.patient_cases(id) ON DELETE CASCADE,
  author_id   uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  content     text NOT NULL,
  is_internal boolean NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_case_notes_case_id ON public.case_notes(case_id);

ALTER TABLE public.case_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "notes_admin_coord" ON public.case_notes FOR ALL
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin','coordinator'));
CREATE POLICY "notes_doctor_ext" ON public.case_notes FOR SELECT
  USING (
    is_internal = false AND
    EXISTS (
      SELECT 1 FROM public.patient_cases pc
      JOIN public.doctors d ON d.id = pc.doctor_id
      WHERE pc.id = case_notes.case_id AND d.user_id = auth.uid()
    )
  );


-- ── 7. INDEXES ─────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_leads_phone       ON public.leads(phone);
CREATE INDEX IF NOT EXISTS idx_leads_email       ON public.leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_crm_status  ON public.leads(crm_status);
CREATE INDEX IF NOT EXISTS idx_leads_coord       ON public.leads(assigned_coordinator_id);
CREATE INDEX IF NOT EXISTS idx_cases_case_code   ON public.patient_cases(case_code);
CREATE INDEX IF NOT EXISTS idx_cases_lead        ON public.patient_cases(lead_id);
CREATE INDEX IF NOT EXISTS idx_cases_coordinator ON public.patient_cases(coordinator_id);
CREATE INDEX IF NOT EXISTS idx_cases_hospital    ON public.patient_cases(hospital_id);
CREATE INDEX IF NOT EXISTS idx_cases_doctor      ON public.patient_cases(doctor_id);
CREATE INDEX IF NOT EXISTS idx_cases_stage       ON public.patient_cases(case_stage);


-- ── 8. RELOAD SCHEMA ───────────────────────────────────────────────────────────
NOTIFY pgrst, 'reload schema';
