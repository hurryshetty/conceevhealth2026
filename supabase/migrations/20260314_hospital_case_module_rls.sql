-- ============================================================
-- Add hospital RLS policies for case modules
-- Allows hospital users to read/write billing, appointments,
-- documents, settlements for cases assigned to their hospital
-- Run in Supabase SQL Editor for project: rjmuhomeqydszmerlqrh
-- ============================================================

-- Helper: checks if current user belongs to the hospital of a given case
-- Used inline in each policy below via EXISTS subquery.

-- ── case_billing ──────────────────────────────────────────────────────────────
-- Hospital can read all billing for their cases
DROP POLICY IF EXISTS "billing_hospital_read" ON public.case_billing;
CREATE POLICY "billing_hospital_read" ON public.case_billing FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.patient_cases pc
      JOIN public.hospital_members hm ON hm.hospital_id = pc.hospital_id
      WHERE pc.id = case_billing.case_id
        AND hm.user_id = auth.uid()
    )
  );

-- Hospital can add billing items for their cases
DROP POLICY IF EXISTS "billing_hospital_insert" ON public.case_billing;
CREATE POLICY "billing_hospital_insert" ON public.case_billing FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.patient_cases pc
      JOIN public.hospital_members hm ON hm.hospital_id = pc.hospital_id
      WHERE pc.id = case_billing.case_id
        AND hm.user_id = auth.uid()
    )
  );

-- Hospital can update billing items (status, payment, etc.) for their cases
DROP POLICY IF EXISTS "billing_hospital_update" ON public.case_billing;
CREATE POLICY "billing_hospital_update" ON public.case_billing FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.patient_cases pc
      JOIN public.hospital_members hm ON hm.hospital_id = pc.hospital_id
      WHERE pc.id = case_billing.case_id
        AND hm.user_id = auth.uid()
    )
  );


-- ── appointments ──────────────────────────────────────────────────────────────
-- Hospital can read appointments for their cases
DROP POLICY IF EXISTS "appointments_hospital_all" ON public.appointments;
CREATE POLICY "appointments_hospital_all" ON public.appointments FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.patient_cases pc
      JOIN public.hospital_members hm ON hm.hospital_id = pc.hospital_id
      WHERE pc.id = appointments.case_id
        AND hm.user_id = auth.uid()
    )
  );


-- ── case_documents ────────────────────────────────────────────────────────────
-- Hospital can read documents for their cases
DROP POLICY IF EXISTS "docs_hospital_read" ON public.case_documents;
CREATE POLICY "docs_hospital_read" ON public.case_documents FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.patient_cases pc
      JOIN public.hospital_members hm ON hm.hospital_id = pc.hospital_id
      WHERE pc.id = case_documents.case_id
        AND hm.user_id = auth.uid()
    )
  );


-- ── settlements ───────────────────────────────────────────────────────────────
-- Hospital can read settlements where they are the payee
DROP POLICY IF EXISTS "settlements_hospital_read" ON public.settlements;
CREATE POLICY "settlements_hospital_read" ON public.settlements FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.hospital_members hm
      WHERE hm.hospital_id = settlements.hospital_id
        AND hm.user_id = auth.uid()
    )
  );


-- ── case_notes (if it exists) ─────────────────────────────────────────────────
DROP POLICY IF EXISTS "notes_hospital_all" ON public.case_notes;
CREATE POLICY "notes_hospital_all" ON public.case_notes FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.patient_cases pc
      JOIN public.hospital_members hm ON hm.hospital_id = pc.hospital_id
      WHERE pc.id = case_notes.case_id
        AND hm.user_id = auth.uid()
    )
  );

NOTIFY pgrst, 'reload schema';
