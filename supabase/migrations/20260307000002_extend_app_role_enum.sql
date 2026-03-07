
-- Extend app_role enum to support all RBAC roles used in the application.
-- The original enum only had 'admin' and 'user'.
-- ADD VALUE IF NOT EXISTS is safe to run multiple times.

ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'coordinator';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'doctor';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'hospital';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'patient';
