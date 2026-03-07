
-- Change user_roles.role from app_role enum to TEXT.
-- Allows any role string without needing to extend the enum.

-- 1. Recreate has_role() with TEXT param and explicit cast in WHERE
--    (cast is needed while column is still app_role enum type)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role::TEXT = _role
  )
$$;

-- 2. Convert the column (now safe, function no longer depends on enum type)
ALTER TABLE public.user_roles
  ALTER COLUMN role TYPE TEXT USING role::TEXT;

-- 3. Re-enforce NOT NULL
ALTER TABLE public.user_roles
  ALTER COLUMN role SET NOT NULL;
