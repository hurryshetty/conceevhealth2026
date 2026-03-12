-- ============================================================
-- PHASES 2–4: CONCEEV HEALTH CMS
-- Run in Supabase SQL Editor for project: rjmuhomeqydszmerlqrh
-- ============================================================

-- ── PHASE 2A: CASE DOCUMENTS ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.case_documents (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id       uuid NOT NULL REFERENCES public.patient_cases(id) ON DELETE CASCADE,
  uploaded_by   uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  document_type text NOT NULL DEFAULT 'other'
                  CHECK (document_type IN (
                    'medical_report','lab_report','prescription','insurance',
                    'id_proof','consent_form','discharge_summary','invoice','other'
                  )),
  file_name     text NOT NULL,
  file_path     text NOT NULL,
  file_size     bigint,
  mime_type     text,
  notes         text,
  is_verified   boolean NOT NULL DEFAULT false,
  verified_by   uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  verified_at   timestamptz,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_case_docs_case_id ON public.case_documents(case_id);

ALTER TABLE public.case_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "docs_admin_coord" ON public.case_documents FOR ALL
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin','coordinator'));
CREATE POLICY "docs_doctor_read" ON public.case_documents FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.patient_cases pc
      JOIN public.doctors d ON d.id = pc.doctor_id
      WHERE pc.id = case_documents.case_id AND d.user_id = auth.uid()
    )
  );


-- ── PHASE 2B: APPOINTMENTS ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.appointments (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id          uuid NOT NULL REFERENCES public.patient_cases(id) ON DELETE CASCADE,
  doctor_id        uuid REFERENCES public.doctors(id) ON DELETE SET NULL,
  hospital_id      uuid REFERENCES public.locations(id) ON DELETE SET NULL,
  appointment_type text NOT NULL DEFAULT 'consultation'
                     CHECK (appointment_type IN (
                       'consultation','follow_up','procedure',
                       'admission','discharge','other'
                     )),
  scheduled_at     timestamptz NOT NULL,
  duration_minutes integer NOT NULL DEFAULT 30,
  status           text NOT NULL DEFAULT 'scheduled'
                     CHECK (status IN ('scheduled','confirmed','completed','cancelled','no_show')),
  notes            text,
  created_by       uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_appointments_case_id   ON public.appointments(case_id);
CREATE INDEX IF NOT EXISTS idx_appointments_scheduled ON public.appointments(scheduled_at);

ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "appointments_admin_coord" ON public.appointments FOR ALL
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin','coordinator'));
CREATE POLICY "appointments_doctor_all" ON public.appointments FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.doctors d
      WHERE d.id = appointments.doctor_id AND d.user_id = auth.uid()
    )
  );


-- ── PHASE 3A: BILLING ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.case_billing (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id        uuid NOT NULL REFERENCES public.patient_cases(id) ON DELETE CASCADE,
  billing_type   text NOT NULL DEFAULT 'other'
                   CHECK (billing_type IN (
                     'consultation','procedure','hospital_stay','medicine','lab','other'
                   )),
  description    text NOT NULL,
  amount         numeric(12,2) NOT NULL DEFAULT 0,
  currency       text NOT NULL DEFAULT 'INR',
  status         text NOT NULL DEFAULT 'pending'
                   CHECK (status IN ('pending','invoiced','paid','waived','refunded')),
  due_date       date,
  paid_at        timestamptz,
  payment_method text CHECK (payment_method IN ('cash','upi','card','bank_transfer','insurance','other')),
  invoice_number text,
  notes          text,
  created_by     uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_billing_case_id ON public.case_billing(case_id);
CREATE INDEX IF NOT EXISTS idx_billing_status  ON public.case_billing(status);

ALTER TABLE public.case_billing ENABLE ROW LEVEL SECURITY;
CREATE POLICY "billing_admin_coord" ON public.case_billing FOR ALL
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin','coordinator'));
-- Patient can view their own billing
CREATE POLICY "billing_patient_read" ON public.case_billing FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.patient_cases pc
      WHERE pc.id = case_billing.case_id AND pc.patient_id = auth.uid()
    )
  );


-- ── PHASE 3B: SETTLEMENTS ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.settlements (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id          uuid NOT NULL REFERENCES public.patient_cases(id) ON DELETE CASCADE,
  payee_type       text NOT NULL CHECK (payee_type IN ('hospital','doctor','lab','other')),
  hospital_id      uuid REFERENCES public.locations(id) ON DELETE SET NULL,
  doctor_id        uuid REFERENCES public.doctors(id) ON DELETE SET NULL,
  amount           numeric(12,2) NOT NULL DEFAULT 0,
  currency         text NOT NULL DEFAULT 'INR',
  status           text NOT NULL DEFAULT 'pending'
                     CHECK (status IN ('pending','processing','paid','failed')),
  settled_at       timestamptz,
  reference_number text,
  notes            text,
  created_by       uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_settlements_case_id ON public.settlements(case_id);
CREATE INDEX IF NOT EXISTS idx_settlements_status  ON public.settlements(status);

ALTER TABLE public.settlements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "settlements_admin" ON public.settlements FOR ALL
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
CREATE POLICY "settlements_coord_read" ON public.settlements FOR SELECT
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin','coordinator'));


-- ── PHASE 4A: NOTIFICATIONS ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.notifications (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title          text NOT NULL,
  body           text,
  type           text NOT NULL DEFAULT 'system'
                   CHECK (type IN (
                     'case_update','task_assigned','appointment',
                     'document','billing','system'
                   )),
  reference_type text,
  reference_id   uuid,
  is_read        boolean NOT NULL DEFAULT false,
  created_at     timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id    ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread     ON public.notifications(user_id) WHERE NOT is_read;
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "notifications_own" ON public.notifications FOR ALL
  USING (auth.uid() = user_id);


-- ── PHASE 4B: AUDIT LOGS ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id    uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action      text NOT NULL,
  entity_type text NOT NULL,
  entity_id   uuid,
  old_data    jsonb,
  new_data    jsonb,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_entity  ON public.audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_actor   ON public.audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_created ON public.audit_logs(created_at DESC);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "audit_admin_only" ON public.audit_logs FOR SELECT
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');


-- ── STORAGE BUCKET REMINDER ───────────────────────────────────────────────────
-- Manually create a Storage bucket named "case-documents" in the Supabase
-- dashboard with the following policies:
--   SELECT (download): authenticated users where path starts with case_id they have access to
--   INSERT (upload):   roles 'admin' and 'coordinator'
--   DELETE:            roles 'admin' and 'coordinator'
-- Or use these SQL policies against storage.objects:
INSERT INTO storage.buckets (id, name, public)
VALUES ('case-documents', 'case-documents', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "case_docs_upload" ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'case-documents'
    AND (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin','coordinator')
  );
CREATE POLICY "case_docs_read" ON storage.objects FOR SELECT
  USING (
    bucket_id = 'case-documents'
    AND (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin','coordinator','doctor')
  );
CREATE POLICY "case_docs_delete" ON storage.objects FOR DELETE
  USING (
    bucket_id = 'case-documents'
    AND (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin','coordinator')
  );


-- ── RELOAD SCHEMA ─────────────────────────────────────────────────────────────
NOTIFY pgrst, 'reload schema';
