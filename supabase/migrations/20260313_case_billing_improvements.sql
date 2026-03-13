-- ============================================================
-- Billing improvements: billing_title, payment_reference,
-- payment_proof_path, auto-generated invoice numbers
-- Run in Supabase SQL Editor for project: rjmuhomeqydszmerlqrh
-- ============================================================

-- Add new columns
ALTER TABLE public.case_billing
  ADD COLUMN IF NOT EXISTS billing_title      text,
  ADD COLUMN IF NOT EXISTS payment_reference  text,
  ADD COLUMN IF NOT EXISTS payment_proof_path text;

-- Invoice number auto-generation via sequence
CREATE SEQUENCE IF NOT EXISTS public.invoice_seq START 1001;

CREATE OR REPLACE FUNCTION public.generate_invoice_number()
RETURNS text
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN 'INV-' || TO_CHAR(NOW(), 'YYYYMM') || '-' || LPAD(nextval('public.invoice_seq')::text, 4, '0');
END;
$$;

-- Set auto-generated default for invoice_number
ALTER TABLE public.case_billing
  ALTER COLUMN invoice_number SET DEFAULT public.generate_invoice_number();

-- Storage policy: allow payment proof uploads (reuse case-documents bucket)
-- Policy already exists for case-documents; payment proofs use same bucket.

NOTIFY pgrst, 'reload schema';
