-- ============================================================
-- Settlements improvements: payment_method, payment_reference,
-- payment_proof_path, settlement_percentage
-- Run in Supabase SQL Editor for project: rjmuhomeqydszmerlqrh
-- ============================================================

ALTER TABLE public.settlements
  ADD COLUMN IF NOT EXISTS payment_method      text CHECK (payment_method IN ('upi','bank_transfer','card','cash','cheque','other')),
  ADD COLUMN IF NOT EXISTS payment_reference   text,
  ADD COLUMN IF NOT EXISTS payment_proof_path  text,
  ADD COLUMN IF NOT EXISTS settlement_percentage numeric(5,2);

-- Fix RLS: coordinator should be able to INSERT settlements
DROP POLICY IF EXISTS "settlements_admin"      ON public.settlements;
DROP POLICY IF EXISTS "settlements_coord_read" ON public.settlements;

CREATE POLICY "settlements_admin_coord" ON public.settlements FOR ALL
  USING (
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'coordinator')
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'coordinator')
  );

NOTIFY pgrst, 'reload schema';
