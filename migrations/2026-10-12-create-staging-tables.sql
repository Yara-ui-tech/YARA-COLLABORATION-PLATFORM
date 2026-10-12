-- migrations/2026-10-12-create-staging-tables.sql
-- Purpose: Provide staging tables and validation/import functions for bulk CSV uploads.
-- These tables are safe to use on existing production databases; they do not affect live data until import.

-- Enable the extension for JSON handling if not present
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================
-- Staging tables (admin‑only) – one per core entity that needs bulk upload.
-- Each staging table mirrors the production schema plus auxiliary columns:
--   raw_json   JSONB   – the original JSON representation of the row (useful for debugging)
--   is_valid   BOOLEAN – flag set by the validation function
--   error_msg  TEXT    – validation error details when is_valid = FALSE
-- =============================================================

-- Staging table for impact_ledger
CREATE TABLE IF NOT EXISTS public.staging_impact_ledger (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  metric_key TEXT NOT NULL,
  metric_title TEXT NOT NULL,
  verified_value NUMERIC,
  unit TEXT,
  verification_source TEXT,
  raw_json JSONB,
  is_valid BOOLEAN DEFAULT FALSE,
  error_msg TEXT
);

-- Staging table for testimonials
CREATE TABLE IF NOT EXISTS public.staging_testimonials (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  author_name TEXT NOT NULL,
  author_role TEXT DEFAULT 'STEM Educator',
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  category TEXT,
  content TEXT NOT NULL,
  is_featured BOOLEAN DEFAULT FALSE,
  is_approved BOOLEAN DEFAULT TRUE,
  raw_json JSONB,
  is_valid BOOLEAN DEFAULT FALSE,
  error_msg TEXT
);

-- Staging table for sponsors
CREATE TABLE IF NOT EXISTS public.staging_sponsors (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  organization_name TEXT NOT NULL,
  contact_person TEXT,
  email TEXT,
  tier TEXT CHECK (tier IN ('bronze','silver','gold','platinum')),
  contribution_type TEXT,
  committed_amount NUMERIC,
  received_amount NUMERIC,
  status TEXT,
  benefits_active BOOLEAN,
  description TEXT,
  raw_json JSONB,
  is_valid BOOLEAN DEFAULT FALSE,
  error_msg TEXT
);

-- =============================================================
-- Row‑Level Security: only admins may SELECT/INSERT/UPDATE these staging tables.
-- =============================================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE schemaname = 'public' AND tablename = 'staging_impact_ledger') THEN
    ALTER TABLE public.staging_impact_ledger ENABLE ROW LEVEL SECURITY;
    CREATE POLICY admin_only_staging_impact_ledger ON public.staging_impact_ledger
      FOR ALL TO public
      USING (public.is_admin());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE schemaname = 'public' AND tablename = 'staging_testimonials') THEN
    ALTER TABLE public.staging_testimonials ENABLE ROW LEVEL SECURITY;
    CREATE POLICY admin_only_staging_testimonials ON public.staging_testimonials
      FOR ALL TO public
      USING (public.is_admin());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE schemaname = 'public' AND tablename = 'staging_sponsors') THEN
    ALTER TABLE public.staging_sponsors ENABLE ROW LEVEL SECURITY;
    CREATE POLICY admin_only_staging_sponsors ON public.staging_sponsors
      FOR ALL TO public
      USING (public.is_admin());
  END IF;
END $$;

-- =============================================================
-- Validation functions – mark rows as valid/invalid and populate error_msg.
-- =============================================================

-- Validate impact_ledger staging rows
CREATE OR REPLACE FUNCTION public.validate_staging_impact_ledger()
RETURNS VOID AS $$
BEGIN
  UPDATE public.staging_impact_ledger SET
    is_valid = TRUE,
    error_msg = NULL
  WHERE metric_key IS NOT NULL
    AND metric_title IS NOT NULL;

  UPDATE public.staging_impact_ledger SET
    is_valid = FALSE,
    error_msg = 'metric_key and metric_title are required.'
  WHERE metric_key IS NULL OR metric_title IS NULL;
END $$ LANGUAGE plpgsql SECURITY DEFINER;

-- Validate testimonials staging rows
CREATE OR REPLACE FUNCTION public.validate_staging_testimonials()
RETURNS VOID AS $$
BEGIN
  UPDATE public.staging_testimonials SET
    is_valid = TRUE,
    error_msg = NULL
  WHERE author_name IS NOT NULL
    AND content IS NOT NULL
    AND rating BETWEEN 1 AND 5;

  UPDATE public.staging_testimonials SET
    is_valid = FALSE,
    error_msg = 'author_name, content and rating (1‑5) are required.'
  WHERE author_name IS NULL OR content IS NULL OR rating NOT BETWEEN 1 AND 5;
END $$ LANGUAGE plpgsql SECURITY DEFINER;

-- Validate sponsors staging rows
CREATE OR REPLACE FUNCTION public.validate_staging_sponsors()
RETURNS VOID AS $$
BEGIN
  UPDATE public.staging_sponsors SET
    is_valid = TRUE,
    error_msg = NULL
  WHERE organization_name IS NOT NULL
    AND tier IS NOT NULL;

  UPDATE public.staging_sponsors SET
    is_valid = FALSE,
    error_msg = 'organization_name and tier are required.'
  WHERE organization_name IS NULL OR tier IS NULL;
END $$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================
-- Import functions – move only valid rows into the production tables.
-- =============================================================

CREATE OR REPLACE FUNCTION public.import_staging_impact_ledger()
RETURNS INTEGER AS $$
DECLARE rows_inserted INTEGER := 0;
BEGIN
  INSERT INTO public.impact_ledger (metric_key, metric_title, verified_value, unit, verification_source)
  SELECT metric_key, metric_title, verified_value, unit, verification_source
  FROM public.staging_impact_ledger
  WHERE is_valid;
  GET DIAGNOSTICS rows_inserted = ROW_COUNT;
  DELETE FROM public.staging_impact_ledger WHERE is_valid;
  RETURN rows_inserted;
END $$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.import_staging_testimonials()
RETURNS INTEGER AS $$
DECLARE rows_inserted INTEGER := 0;
BEGIN
  INSERT INTO public.testimonials (author_name, author_role, rating, category, content, is_featured, is_approved)
  SELECT author_name, author_role, rating, category, content, is_featured, is_approved
  FROM public.staging_testimonials
  WHERE is_valid;
  GET DIAGNOSTICS rows_inserted = ROW_COUNT;
  DELETE FROM public.staging_testimonials WHERE is_valid;
  RETURN rows_inserted;
END $$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.import_staging_sponsors()
RETURNS INTEGER AS $$
DECLARE rows_inserted INTEGER := 0;
BEGIN
  INSERT INTO public.sponsors (organization_name, contact_person, email, tier, contribution_type, committed_amount, received_amount, status, benefits_active, description)
  SELECT organization_name, contact_person, email, tier, contribution_type, committed_amount, received_amount, status, benefits_active, description
  FROM public.staging_sponsors
  WHERE is_valid;
  GET DIAGNOSTICS rows_inserted = ROW_COUNT;
  DELETE FROM public.staging_sponsors WHERE is_valid;
  RETURN rows_inserted;
END $$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================
-- Helper: truncate staging tables (admin‑only, for repeated uploads)
-- =============================================================
CREATE OR REPLACE FUNCTION public.truncate_all_staging()
RETURNS VOID AS $$
BEGIN
  TRUNCATE TABLE public.staging_impact_ledger,
                public.staging_testimonials,
                public.staging_sponsors RESTART IDENTITY;
END $$ LANGUAGE plpgsql SECURITY DEFINER;

-- End of migration file
