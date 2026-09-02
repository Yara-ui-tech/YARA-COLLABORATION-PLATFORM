-- =========================================================================
-- MIGRATION: M&E Impact Financial Ledger, Executive Auditors, 
-- Organization Rich Media Posts, and Educator Verification Schema
-- Date: 2026-09-02
-- =========================================================================

-- Enable UUID extension if not present
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =========================================================================
-- 1. Profiles Table Expansions for Permissions & Verification
-- =========================================================================
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_executive_auditor BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_verified_educator BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS educator_institution TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS educator_subject TEXT;

-- =========================================================================
-- 2. Monitoring & Evaluation (M&E) Impact & Financial Audit Ledger Table
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.impact_ledger (
  id TEXT PRIMARY KEY DEFAULT ('imp_' || floor(extract(epoch from now()))::text || '_' || substr(md5(random()::text), 1, 6)),
  reference_id TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT now(),
  transaction_type TEXT NOT NULL DEFAULT 'event_registration' 
    CHECK (transaction_type IN ('event_registration', 'competition_entry', 'hardware_deposit', 'lms_subscription', 'sponsorship_donation', 'chapter_grant', 'mentor_stipend')),
  source_module TEXT NOT NULL DEFAULT 'events' 
    CHECK (source_module IN ('events', 'competitions', 'lms', 'donations', 'chapters', 'finance')),
  title TEXT NOT NULL,
  payer_name TEXT NOT NULL,
  payer_email TEXT NOT NULL,
  school_institution TEXT,
  province TEXT,
  amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  currency TEXT NOT NULL DEFAULT 'USD',
  payment_method TEXT DEFAULT 'ecocash_usd',
  payment_status TEXT DEFAULT 'verified' 
    CHECK (payment_status IN ('verified', 'pending', 'audited', 'refunded')),
  approval_status TEXT DEFAULT 'approved' 
    CHECK (approval_status IN ('approved', 'pending', 'rejected')),
  approved_by TEXT,
  approved_at TIMESTAMPTZ,
  
  -- M&E (Monitoring & Evaluation) Metrics & SDG Alignment
  beneficiaries_count INTEGER DEFAULT 0,
  girls_count INTEGER DEFAULT 0,
  boys_count INTEGER DEFAULT 0,
  school_category TEXT DEFAULT 'public_urban'
    CHECK (school_category IN ('public_rural', 'public_urban', 'mission_school', 'private', 'university', 'other')),
  sdg_targets TEXT[] DEFAULT '{"SDG 4: Quality Education", "SDG 5: Gender Equality", "SDG 9: Industry & Innovation"}',
  m_and_e_notes TEXT,
  audit_hash TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.impact_ledger ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public cannot directly access ledger" ON public.impact_ledger;
DROP POLICY IF EXISTS "Admins and Executive Auditors can read impact ledger" ON public.impact_ledger;
CREATE POLICY "Admins and Executive Auditors can read impact ledger"
  ON public.impact_ledger FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND (role = 'admin' OR is_executive_auditor = true)
    )
    OR auth.role() = 'service_role'
  );

DROP POLICY IF EXISTS "Admins can manage impact ledger" ON public.impact_ledger;
CREATE POLICY "Admins can manage impact ledger"
  ON public.impact_ledger FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
    OR auth.role() = 'service_role'
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
    OR auth.role() = 'service_role'
  );

-- Indexes for lightning queries & exports
CREATE INDEX IF NOT EXISTS idx_impact_ledger_timestamp ON public.impact_ledger(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_impact_ledger_module ON public.impact_ledger(source_module);
CREATE INDEX IF NOT EXISTS idx_impact_ledger_status ON public.impact_ledger(payment_status, approval_status);
CREATE INDEX IF NOT EXISTS idx_impact_ledger_email ON public.impact_ledger(lower(payer_email));
CREATE INDEX IF NOT EXISTS idx_impact_ledger_ref ON public.impact_ledger(reference_id);

-- =========================================================================
-- 3. Executive Financial Auditors Clearance Roster Table
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.executive_auditors (
  id TEXT PRIMARY KEY DEFAULT ('exec_' || floor(extract(epoch from now()))::text || '_' || substr(md5(random()::text), 1, 6)),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  title TEXT NOT NULL,
  authorized_by TEXT NOT NULL,
  authorized_at TIMESTAMPTZ DEFAULT now(),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.executive_auditors ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can read executive auditors" ON public.executive_auditors;
CREATE POLICY "Admins can read executive auditors"
  ON public.executive_auditors FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    OR auth.role() = 'service_role'
  );

DROP POLICY IF EXISTS "Master Admins can manage executive auditors" ON public.executive_auditors;
CREATE POLICY "Master Admins can manage executive auditors"
  ON public.executive_auditors FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    OR auth.role() = 'service_role'
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    OR auth.role() = 'service_role'
  );

-- Seed Initial Executive Auditors
INSERT INTO public.executive_auditors (id, email, name, title, authorized_by, authorized_at, is_active)
VALUES 
  ('exec_1', 'goyaracorp@gmail.com', 'T. Mukombwe', 'Master Administrator & Lead Trustee', 'Board Resolution 2026/01', '2026-01-01T00:00:00Z', true),
  ('exec_2', 'director@yaria.org', 'Dr. C. Chidemo', 'Regional President & Executive Auditor', 'goyaracorp@gmail.com', '2026-02-15T00:00:00Z', true)
ON CONFLICT (email) DO UPDATE SET
  name = EXCLUDED.name,
  title = EXCLUDED.title,
  is_active = EXCLUDED.is_active;

-- =========================================================================
-- 4. Organization Posts Rich Media Expansions
-- =========================================================================
ALTER TABLE public.organization_posts ADD COLUMN IF NOT EXISTS video_url TEXT;
ALTER TABLE public.organization_posts ADD COLUMN IF NOT EXISTS media_type TEXT DEFAULT 'standard';
ALTER TABLE public.organization_posts ADD COLUMN IF NOT EXISTS gallery_urls TEXT[] DEFAULT '{}';
ALTER TABLE public.organization_posts ADD COLUMN IF NOT EXISTS attachments JSONB DEFAULT '[]'::jsonb;

-- =========================================================================
-- 5. Event Registrations Columns & Approvals Verification
-- =========================================================================
ALTER TABLE public.event_registrations ADD COLUMN IF NOT EXISTS approval_status TEXT DEFAULT 'pending';
ALTER TABLE public.event_registrations ADD COLUMN IF NOT EXISTS approved_by TEXT;
ALTER TABLE public.event_registrations ADD COLUMN IF NOT EXISTS approved_by_name TEXT;
ALTER TABLE public.event_registrations ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;
ALTER TABLE public.event_registrations ADD COLUMN IF NOT EXISTS certificate_unlocked BOOLEAN DEFAULT false;
ALTER TABLE public.event_registrations ADD COLUMN IF NOT EXISTS certificate_unlocked_at TIMESTAMPTZ;
ALTER TABLE public.event_registrations ADD COLUMN IF NOT EXISTS certificate_unlocked_by TEXT;
ALTER TABLE public.event_registrations ADD COLUMN IF NOT EXISTS certificate_number TEXT;
ALTER TABLE public.event_registrations ADD COLUMN IF NOT EXISTS attendance_status TEXT DEFAULT 'registered';
ALTER TABLE public.event_registrations ADD COLUMN IF NOT EXISTS live_room_access_granted BOOLEAN DEFAULT false;

-- =========================================================================
-- 6. Comprehensive M&E Impact & Revenue Analytics View
-- =========================================================================
CREATE OR REPLACE VIEW public.impact_ledger_summary_view AS
SELECT 
  source_module,
  transaction_type,
  COUNT(*) AS total_transactions,
  COALESCE(SUM(amount) FILTER (WHERE payment_status = 'verified' OR payment_status = 'audited'), 0) AS total_revenue_usd,
  COALESCE(SUM(beneficiaries_count), 0) AS total_beneficiaries,
  COALESCE(SUM(girls_count), 0) AS total_girls_reached,
  COALESCE(SUM(boys_count), 0) AS total_boys_reached
FROM public.impact_ledger
GROUP BY source_module, transaction_type;

GRANT SELECT ON public.impact_ledger_summary_view TO authenticated, service_role;
