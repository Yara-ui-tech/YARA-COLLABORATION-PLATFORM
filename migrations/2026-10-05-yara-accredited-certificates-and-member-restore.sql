-- =========================================================================
-- SECTION 39: YARA Learning Academy Accredited Certificates
-- Distinct certificate types (robotics / programming / educator) and the
-- 4 Robotics tiers. Also restores the real logged bootcamp member.
-- Idempotent: safe to run multiple times.
-- =========================================================================

CREATE TABLE IF NOT EXISTS public.yara_accredited_certificates (
    certificate_number TEXT PRIMARY KEY,
    user_id TEXT,
    user_email TEXT,
    student_name TEXT NOT NULL,
    course_id TEXT,
    course_title TEXT NOT NULL,
    course_category TEXT,
    certificate_type TEXT NOT NULL DEFAULT 'programming'
      CHECK (certificate_type IN ('robotics', 'programming', 'educator')),
    robotics_level SMALLINT CHECK (robotics_level IS NULL OR robotics_level BETWEEN 1 AND 4),
    grade TEXT,
    score INTEGER,
    issue_date TEXT,
    verification_url TEXT,
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON COLUMN public.yara_accredited_certificates.robotics_level IS
  '1 = Absolute Beginner / Explorer, 2 = Intermediate Learner, 3 = Advanced Learner, 4 = Robotics Masterclass for Real World Applications and Deployment';

CREATE INDEX IF NOT EXISTS idx_yara_acc_certs_email ON public.yara_accredited_certificates(lower(user_email));
CREATE INDEX IF NOT EXISTS idx_yara_acc_certs_user ON public.yara_accredited_certificates(user_id);
CREATE INDEX IF NOT EXISTS idx_yara_acc_certs_type ON public.yara_accredited_certificates(certificate_type, robotics_level);

ALTER TABLE public.yara_accredited_certificates ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can verify accredited certificates" ON public.yara_accredited_certificates;
DROP POLICY IF EXISTS "Learners can mint accredited certificates" ON public.yara_accredited_certificates;
DROP POLICY IF EXISTS "Owners or admins can update accredited certificates" ON public.yara_accredited_certificates;
DROP POLICY IF EXISTS "Admins can delete accredited certificates" ON public.yara_accredited_certificates;

-- Public verification (QR code / verify page) must work for anyone
CREATE POLICY "Public can verify accredited certificates"
  ON public.yara_accredited_certificates FOR SELECT
  USING (true);

CREATE POLICY "Learners can mint accredited certificates"
  ON public.yara_accredited_certificates FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Owners or admins can update accredited certificates"
  ON public.yara_accredited_certificates FOR UPDATE
  USING (
    user_id = auth.uid()::text
    OR lower(user_email) = lower(COALESCE(auth.jwt()->>'email', ''))
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can delete accredited certificates"
  ON public.yara_accredited_certificates FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Restore the logged bootcamp member (does nothing if already present)
INSERT INTO public.event_registrations (
  id, registration_code, event_id, event_title, full_name, email,
  country, payment_status, approval_status, certificate_unlocked,
  certificate_number, certificate_title, admin_notes
)
SELECT
  'evt_reg_simbarashe_2026', 'RBWHMNGF', 'ai-for-educators-2026',
  'AI for Educators - Online Bootcamp', 'Simbarashe Obvious Manongwa',
  'manongwasimbarashe394@gmail.com', 'Zimbabwe', 'verified', 'approved', true,
  'RBWHMNGF', 'Certificate of Completion - Introduction to RAG',
  'Restored logged member registration.'
WHERE NOT EXISTS (
  SELECT 1 FROM public.event_registrations
  WHERE upper(registration_code) = 'RBWHMNGF'
     OR lower(email) = 'manongwasimbarashe394@gmail.com'
);

-- Seed the member's accredited certificate (RBWHMNGF)
INSERT INTO public.yara_accredited_certificates (
  certificate_number, user_email, student_name, course_id, course_title,
  course_category, certificate_type, grade, score, issue_date, payload
) VALUES (
  'RBWHMNGF', 'manongwasimbarashe394@gmail.com', 'Simbarashe Obvious Manongwa',
  'intro-to-rag', 'Introduction to RAG', 'ai-engineering', 'programming',
  'Distinction with Honors', 96, 'October 04, 2026', '{}'::jsonb
)
ON CONFLICT (certificate_number) DO NOTHING;

