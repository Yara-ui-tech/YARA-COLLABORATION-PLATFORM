-- 2026-10-14-relax-impact-ledger-reference-id.sql
-- Purpose: Make impact_ledger.reference_id nullable to support legacy inserts.
-- This migration is idempotent and safe for existing production data.

DO $$
BEGIN
  -- Only attempt to drop NOT NULL if it currently exists.
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'impact_ledger'
      AND column_name = 'reference_id'
      AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE public.impact_ledger ALTER COLUMN reference_id DROP NOT NULL;
    RAISE NOTICE 'Dropped NOT NULL constraint on impact_ledger.reference_id';
  END IF;
END $$;

COMMIT;
