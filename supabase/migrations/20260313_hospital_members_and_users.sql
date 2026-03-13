-- ============================================================
-- hospital_members table + test user setup
-- Run in Supabase SQL Editor for project: rjmuhomeqydszmerlqrh
-- ============================================================

-- ── 1. Create hospital_members table ────────────────────────
CREATE TABLE IF NOT EXISTS public.hospital_members (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  hospital_id  uuid NOT NULL REFERENCES public.locations(id) ON DELETE CASCADE,
  member_role  text NOT NULL DEFAULT 'staff' CHECK (member_role IN ('admin', 'staff')),
  created_at   timestamptz DEFAULT now(),
  UNIQUE (user_id, hospital_id)
);

CREATE INDEX IF NOT EXISTS idx_hospital_members_user_id ON public.hospital_members(user_id);
CREATE INDEX IF NOT EXISTS idx_hospital_members_hospital_id ON public.hospital_members(hospital_id);

ALTER TABLE public.hospital_members ENABLE ROW LEVEL SECURITY;

-- Hospital members can see members of their own hospital
CREATE POLICY "hospital_members_read_own" ON public.hospital_members FOR SELECT
  USING (
    user_id = auth.uid() OR
    hospital_id IN (
      SELECT hospital_id FROM public.hospital_members WHERE user_id = auth.uid()
    ) OR
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'coordinator')
  );

-- Admin + coordinator can manage all
CREATE POLICY "hospital_members_admin_coord" ON public.hospital_members FOR ALL
  USING (
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'coordinator')
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'coordinator')
  );

-- ── 2. Create test users (hospital + doctor) ─────────────────
-- Passwords: Hospital → ConceevH2026!  |  Doctor → ConceevD2026!
DO $$
DECLARE
  v_hospital_uid uuid;
  v_doctor_uid   uuid;
  v_hospital_id  uuid;
  v_doctor_id    uuid;
BEGIN

  -- ── Create hospital@conceevdigital.com ──────────────────────
  INSERT INTO auth.users (
    id, instance_id, aud, role, email, encrypted_password,
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at, is_super_admin, is_sso_user, is_anonymous
  )
  VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated',
    'hospital@conceevdigital.com',
    crypt('ConceevH2026!', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    now(), now(), false, false, false
  )
  ON CONFLICT (email) DO NOTHING;

  SELECT id INTO v_hospital_uid FROM auth.users WHERE email = 'hospital@conceevdigital.com';

  -- Identity record (needed for email login)
  INSERT INTO auth.identities (
    id, user_id, provider_id, provider,
    identity_data, last_sign_in_at, created_at, updated_at
  )
  SELECT
    gen_random_uuid(), v_hospital_uid,
    v_hospital_uid::text, 'email',
    jsonb_build_object('sub', v_hospital_uid::text, 'email', 'hospital@conceevdigital.com'),
    now(), now(), now()
  WHERE NOT EXISTS (
    SELECT 1 FROM auth.identities WHERE user_id = v_hospital_uid AND provider = 'email'
  );

  -- ── Create doctor@conceevdigital.com ────────────────────────
  INSERT INTO auth.users (
    id, instance_id, aud, role, email, encrypted_password,
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at, is_super_admin, is_sso_user, is_anonymous
  )
  VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated',
    'doctor@conceevdigital.com',
    crypt('ConceevD2026!', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    now(), now(), false, false, false
  )
  ON CONFLICT (email) DO NOTHING;

  SELECT id INTO v_doctor_uid FROM auth.users WHERE email = 'doctor@conceevdigital.com';

  INSERT INTO auth.identities (
    id, user_id, provider_id, provider,
    identity_data, last_sign_in_at, created_at, updated_at
  )
  SELECT
    gen_random_uuid(), v_doctor_uid,
    v_doctor_uid::text, 'email',
    jsonb_build_object('sub', v_doctor_uid::text, 'email', 'doctor@conceevdigital.com'),
    now(), now(), now()
  WHERE NOT EXISTS (
    SELECT 1 FROM auth.identities WHERE user_id = v_doctor_uid AND provider = 'email'
  );

  -- ── Create profiles ─────────────────────────────────────────
  INSERT INTO public.profiles (id, full_name, email, role, is_active, created_at, updated_at)
  VALUES (v_hospital_uid, 'Vriksh Fertility', 'hospital@conceevdigital.com', 'hospital', true, now(), now())
  ON CONFLICT (id) DO UPDATE SET role = 'hospital', is_active = true, updated_at = now();

  INSERT INTO public.profiles (id, full_name, email, role, is_active, created_at, updated_at)
  VALUES (v_doctor_uid, 'Dr. Sneha Shetty', 'doctor@conceevdigital.com', 'doctor', true, now(), now())
  ON CONFLICT (id) DO UPDATE SET role = 'doctor', is_active = true, updated_at = now();

  -- ── Set roles in user_roles ─────────────────────────────────
  INSERT INTO public.user_roles (user_id, role)
  VALUES (v_hospital_uid, 'hospital')
  ON CONFLICT (user_id, role) DO NOTHING;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (v_doctor_uid, 'doctor')
  ON CONFLICT (user_id, role) DO NOTHING;

  -- ── Link hospital user to Vriksh Fertility ──────────────────
  SELECT id INTO v_hospital_id FROM public.locations
  WHERE name ILIKE '%vriksh%'
  LIMIT 1;

  IF v_hospital_id IS NOT NULL THEN
    INSERT INTO public.hospital_members (user_id, hospital_id, member_role)
    VALUES (v_hospital_uid, v_hospital_id, 'admin')
    ON CONFLICT (user_id, hospital_id) DO NOTHING;

    RAISE NOTICE 'Hospital user linked to location id: %', v_hospital_id;
  ELSE
    RAISE NOTICE 'WARNING: No location found matching Vriksh Fertility — link manually.';
  END IF;

  -- ── Link doctor user to Dr. Sneha Shetty ───────────────────
  SELECT id INTO v_doctor_id FROM public.doctors
  WHERE name ILIKE '%sneha shetty%'
  LIMIT 1;

  IF v_doctor_id IS NOT NULL THEN
    UPDATE public.doctors
    SET user_id = v_doctor_uid
    WHERE id = v_doctor_id;

    RAISE NOTICE 'Doctor user linked to doctor id: %', v_doctor_id;
  ELSE
    RAISE NOTICE 'WARNING: No doctor found matching Sneha Shetty — link manually.';
  END IF;

END $$;

NOTIFY pgrst, 'reload schema';
