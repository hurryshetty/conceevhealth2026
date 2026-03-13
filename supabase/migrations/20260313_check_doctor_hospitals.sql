-- ============================================================
-- DIAGNOSTIC: Check doctor hospitals vs location names
-- Run in Supabase SQL Editor for project: rjmuhomeqydszmerlqrh
-- This helps debug why doctor dropdown shows empty
-- ============================================================

-- 1. See all published locations (hospitals)
SELECT id, name, is_published
FROM public.locations
WHERE is_published = true
ORDER BY name;

-- 2. See all published doctors and their hospitals array
SELECT id, name, specialty, hospitals, is_published
FROM public.doctors
WHERE is_published = true
ORDER BY name;

-- 3. Show mismatches — doctors whose hospitals array contains names
--    that don't exactly match any location name
SELECT d.name AS doctor_name,
       unnest(d.hospitals) AS hospital_in_array,
       EXISTS (
         SELECT 1 FROM public.locations l
         WHERE l.name = unnest(d.hospitals)
         AND l.is_published = true
       ) AS exact_match_found
FROM public.doctors d
WHERE d.is_published = true
  AND d.hospitals IS NOT NULL
  AND array_length(d.hospitals, 1) > 0;

-- 4. Specifically check "Vriksh Fertility"
SELECT d.name AS doctor_name, d.hospitals
FROM public.doctors d
WHERE d.is_published = true
  AND d.hospitals @> ARRAY['Vriksh Fertility'];

-- If query 4 returns no rows, the doctors don't have 'Vriksh Fertility'
-- in their hospitals array (exact name mismatch or not assigned).
-- Compare with query 1 output to find the exact stored name.
