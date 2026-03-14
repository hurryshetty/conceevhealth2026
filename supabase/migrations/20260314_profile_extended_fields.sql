-- ============================================================
-- Extend profiles table with role-specific and extended fields
-- Run in Supabase SQL Editor for project: rjmuhomeqydszmerlqrh
-- ============================================================

ALTER TABLE public.profiles
  -- Basic Info
  ADD COLUMN IF NOT EXISTS display_name          text,
  ADD COLUMN IF NOT EXISTS alternate_phone       text,
  ADD COLUMN IF NOT EXISTS date_of_birth         date,
  ADD COLUMN IF NOT EXISTS gender                text CHECK (gender IN ('male','female','other','prefer_not_to_say')),
  ADD COLUMN IF NOT EXISTS bio                   text,
  ADD COLUMN IF NOT EXISTS avatar_url            text,

  -- Address
  ADD COLUMN IF NOT EXISTS address_line1         text,
  ADD COLUMN IF NOT EXISTS address_line2         text,
  ADD COLUMN IF NOT EXISTS city                  text,
  ADD COLUMN IF NOT EXISTS state                 text,
  ADD COLUMN IF NOT EXISTS country               text DEFAULT 'India',
  ADD COLUMN IF NOT EXISTS pincode               text,

  -- Notifications
  ADD COLUMN IF NOT EXISTS notif_email           boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS notif_sms             boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS notif_whatsapp        boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS notif_case_updates    boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS notif_appointments    boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS notif_billing         boolean NOT NULL DEFAULT true,

  -- Patient / User specific
  ADD COLUMN IF NOT EXISTS emergency_contact_name         text,
  ADD COLUMN IF NOT EXISTS emergency_contact_phone        text,
  ADD COLUMN IF NOT EXISTS emergency_contact_relationship text,
  ADD COLUMN IF NOT EXISTS blood_group                    text,
  ADD COLUMN IF NOT EXISTS allergies                      text,
  ADD COLUMN IF NOT EXISTS medical_conditions             text,
  ADD COLUMN IF NOT EXISTS insurance_provider             text,
  ADD COLUMN IF NOT EXISTS insurance_number               text,

  -- Coordinator / Admin specific
  ADD COLUMN IF NOT EXISTS department            text,
  ADD COLUMN IF NOT EXISTS employee_id           text,
  ADD COLUMN IF NOT EXISTS assigned_region       text;

-- Ensure RLS allows users to read/update their own profile
DROP POLICY IF EXISTS "profiles_own_read"   ON public.profiles;
DROP POLICY IF EXISTS "profiles_own_update" ON public.profiles;

CREATE POLICY "profiles_own_read" ON public.profiles FOR SELECT
  USING (auth.uid() = id OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'superadmin'::app_role));

CREATE POLICY "profiles_own_update" ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

NOTIFY pgrst, 'reload schema';
