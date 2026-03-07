
-- Change user_roles.role from app_role enum to TEXT.
-- This allows any role string (admin, coordinator, doctor, hospital, patient, user)
-- without needing to extend the enum each time a new role is added.

-- 1. Update has_role() to accept TEXT instead of app_role enum
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- 2. Change the column type (casting existing values to text)
ALTER TABLE public.user_roles
  ALTER COLUMN role TYPE TEXT USING role::TEXT;

-- 3. Re-add NOT NULL constraint
ALTER TABLE public.user_roles
  ALTER COLUMN role SET NOT NULL;
