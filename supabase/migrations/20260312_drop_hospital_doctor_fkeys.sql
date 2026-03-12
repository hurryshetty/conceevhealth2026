-- ============================================================
-- DROP hospital_id and doctor_id FK constraints on patient_cases
-- These were added to enable PostgREST joins, but we use client-side
-- derived lookups instead. The FKs block coordinator from saving
-- assignments when the UUID doesn't match the referenced table.
-- Run in Supabase SQL Editor for project: rjmuhomeqydszmerlqrh
-- ============================================================

-- Check what currently exists
SELECT
  tc.constraint_name,
  kcu.column_name,
  ccu.table_name AS foreign_table,
  ccu.column_name AS foreign_column
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
  ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage ccu
  ON tc.constraint_name = ccu.constraint_name AND tc.table_schema = ccu.table_schema
WHERE tc.table_name = 'patient_cases'
  AND tc.constraint_type = 'FOREIGN KEY'
  AND kcu.column_name IN ('hospital_id', 'doctor_id');

-- Drop the blocking constraints
ALTER TABLE public.patient_cases DROP CONSTRAINT IF EXISTS patient_cases_hospital_id_fkey;
ALTER TABLE public.patient_cases DROP CONSTRAINT IF EXISTS patient_cases_doctor_id_fkey;

NOTIFY pgrst, 'reload schema';
