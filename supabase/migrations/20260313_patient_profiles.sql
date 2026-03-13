-- ============================================================
-- Patient Profiles table — full pre-surgery patient data
-- Run in Supabase SQL Editor for project: rjmuhomeqydszmerlqrh
-- ============================================================

CREATE TABLE IF NOT EXISTS public.patient_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid UNIQUE NOT NULL REFERENCES public.patient_cases(id) ON DELETE CASCADE,

  -- Basic Details
  full_name               text,
  date_of_birth           date,
  age                     integer,
  gender                  text CHECK (gender IN ('male','female','other')),
  phone                   text,
  email                   text,
  address                 text,
  city                    text,
  state                   text,
  emergency_contact_name  text,
  emergency_contact_number text,
  emergency_contact_relation text,

  -- KYC & Identity
  id_proof_type           text,
  id_number               text,
  id_proof_path           text,
  patient_photo_path      text,

  -- Medical Details
  diagnosis               text,
  planned_procedure       text,
  previous_surgeries      text,
  existing_conditions     text,
  current_medications     text,
  allergies               text,
  blood_group             text,
  height_cm               numeric(5,1),
  weight_kg               numeric(5,1),
  pregnancy_status        text,

  -- Treatment & Hospital Details
  procedure_type          text,
  estimated_surgery_date  date,
  admission_date          date,
  room_category           text,

  -- Insurance & Payment
  insurance_provider      text,
  policy_number           text,
  coverage_amount         numeric(12,2),
  payment_type            text CHECK (payment_type IN ('cashless','reimbursement','self_pay')),
  advance_paid            numeric(12,2),
  payment_mode            text,

  -- Consent & Pre-Surgery
  surgery_consent         boolean DEFAULT false,
  anesthesia_consent      boolean DEFAULT false,
  risk_disclosure         boolean DEFAULT false,
  privacy_consent         boolean DEFAULT false,
  preop_tests_status      text DEFAULT 'pending',
  fasting_confirmation    boolean DEFAULT false,
  fitness_clearance       boolean DEFAULT false,
  final_doctor_approval   boolean DEFAULT false,

  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_patient_profiles_case_id ON public.patient_profiles(case_id);

ALTER TABLE public.patient_profiles ENABLE ROW LEVEL SECURITY;

-- Admin + Coordinator: full access
CREATE POLICY "patient_profiles_admin_coord" ON public.patient_profiles FOR ALL
  USING (
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'coordinator')
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'coordinator')
  );

-- Doctor: read their assigned patient profiles
CREATE POLICY "patient_profiles_doctor_read" ON public.patient_profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.patient_cases pc
      JOIN public.doctors d ON d.id = pc.doctor_id
      WHERE pc.id = patient_profiles.case_id AND d.user_id = auth.uid()
    )
  );

NOTIFY pgrst, 'reload schema';
