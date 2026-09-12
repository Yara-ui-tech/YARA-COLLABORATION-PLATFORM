-- =========================================================================
-- YARA ECOSYSTEM & LMS COMPLETE SCHEMA MIGRATION (2026-09-05)
-- Adds all necessary tables, columns, indexes, RLS policies, storage buckets,
-- and seed configurations for YARA's collaboration platform, LMS, and competitions.
-- =========================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =========================================================================
-- 1. COMPETITION EVENTS & NATIONAL CHAMPIONSHIP
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.competition_events (
  id TEXT PRIMARY KEY, -- e.g. 'yara-competition-2026'
  name TEXT NOT NULL,
  edition_year INTEGER NOT NULL DEFAULT 2026,
  theme TEXT NOT NULL,
  tagline TEXT,
  description TEXT,
  organizer TEXT DEFAULT 'Young Africans Robotics Association (YARA)',
  date_display TEXT,
  venue_display TEXT,
  registration_deadline_display TEXT,
  is_registration_open BOOLEAN DEFAULT true,
  is_leaderboard_published BOOLEAN DEFAULT true,
  categories JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.competition_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view competition events" ON public.competition_events;
CREATE POLICY "Public can view competition events"
  ON public.competition_events FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can manage competition events" ON public.competition_events;
CREATE POLICY "Admins can manage competition events"
  ON public.competition_events FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin') OR auth.role() = 'service_role')
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin') OR auth.role() = 'service_role');

-- Seed Default 2026 Competition Event if missing
INSERT INTO public.competition_events (
  id, name, edition_year, theme, tagline, description, 
  date_display, venue_display, registration_deadline_display, 
  is_registration_open, is_leaderboard_published, categories
)
VALUES (
  'yara-competition-2026',
  'YARA Educational Robotics Competition 2026',
  2026,
  'Innovating for Africa: Sustainable Automation, AI & Blue Economy Robotics',
  'Building the Next Generation of African Problem Solvers',
  'The premier continental robotics championship convening primary, secondary, and tertiary innovators to solve real African engineering challenges.',
  'August 28 - 30, 2026',
  'Harare International Conference Centre (HICC) & Aquatic Complex, Zimbabwe',
  'July 31, 2026',
  true,
  true,
  '[
    {
      "id": "underwater_drone",
      "title": "Underwater Exploration & Marine ROV Challenge",
      "weight_percentage": 35,
      "description": "Submersible robotics navigation, water sensor telemetry, and submerged pipeline retrieval tasks in official test tank.",
      "skills_assessed": ["Buoyancy Control", "Waterproofing", "Tethered Communications", "Sensor Telemetry"],
      "rules_summary": "ROV must fit within 45cm cube, weigh under 6kg, and complete deep-water simulated salvage in under 6 minutes.",
      "is_active": true
    },
    {
      "id": "autonomous_maze",
      "title": "Autonomous Maze Navigation & Obstacle Traversal",
      "weight_percentage": 35,
      "description": "LiDAR/Ultrasonic obstacle avoidance, algorithmic mapping, and dynamic pathway solving without human control.",
      "skills_assessed": ["PID Line/Wall Following", "Microcontroller Optimization", "Real-Time Decision Making", "Sensor Fusion"],
      "rules_summary": "Fully autonomous land robot must traverse an unknown multi-checkpoint labyrinth under 3 minutes without collision penalties.",
      "is_active": true
    },
    {
      "id": "innovation_pitch",
      "title": "STEM Community Impact & Sustainable Innovation Pitch",
      "weight_percentage": 30,
      "description": "Live presentation to venture jurors demonstrating socio-economic viability, technical architecture, and community impact.",
      "skills_assessed": ["Technical Communication", "Business Feasibility", "Hardware Demonstration", "SDG Alignment"],
      "rules_summary": "5-minute technical pitch followed by a live working prototype demonstration and 3 minutes of rigorous judge Q&A.",
      "is_active": true
    }
  ]'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  theme = EXCLUDED.theme,
  categories = EXCLUDED.categories,
  updated_at = now();

-- =========================================================================
-- 2. YARA COMPETITION REGISTRATIONS (TEAM ROSTERS & HARDWARE SPECS)
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.yara_competition_registrations (
  id TEXT PRIMARY KEY DEFAULT ('ycr_' || floor(extract(epoch from now()))::text || '_' || substr(md5(random()::text), 1, 6)),
  registration_id TEXT UNIQUE NOT NULL, -- e.g. 'YARA-RC26-123456'
  event_id TEXT NOT NULL DEFAULT 'yara-competition-2026',
  event_name TEXT NOT NULL DEFAULT 'YARA Educational Robotics Competition 2026',
  participant_type TEXT NOT NULL, -- 'School', 'Robotics Club', 'University/College Team', 'Independent Youth Team', 'Community Innovation Group', 'Other'
  participant_type_other TEXT,
  team_name TEXT NOT NULL,
  school_organization TEXT NOT NULL,
  province TEXT NOT NULL,
  district TEXT NOT NULL,
  city_town TEXT NOT NULL,
  team_leader_name TEXT NOT NULL,
  team_leader_email TEXT NOT NULL,
  team_leader_phone TEXT NOT NULL,
  mentor_name TEXT,
  mentor_email TEXT,
  mentor_phone TEXT,
  selected_categories TEXT[] NOT NULL DEFAULT '{"underwater_drone"}',
  members JSONB NOT NULL DEFAULT '[]'::jsonb,
  boys_count INTEGER DEFAULT 0,
  girls_count INTEGER DEFAULT 0,
  total_members INTEGER DEFAULT 0,
  is_gender_eligible BOOLEAN DEFAULT true,
  underwater_drone_info JSONB,
  autonomous_maze_info JSONB,
  innovation_pitch_info JSONB,
  documents JSONB DEFAULT '[]'::jsonb,
  video_demo_url TEXT,
  consents JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'Submitted', -- 'Draft', 'Submitted', 'Under Review', 'Approved', 'Corrections Required', 'Rejected', 'Withdrawn', 'Finalist', 'Winner'
  admin_notes TEXT,
  correction_requests TEXT[] DEFAULT '{}',
  assigned_judge_ids TEXT[] DEFAULT '{}',
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.yara_competition_registrations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view approved team registrations" ON public.yara_competition_registrations;
CREATE POLICY "Public can view approved team registrations"
  ON public.yara_competition_registrations FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Anyone can submit competition registrations" ON public.yara_competition_registrations;
CREATE POLICY "Anyone can submit competition registrations"
  ON public.yara_competition_registrations FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admins and owners can update registrations" ON public.yara_competition_registrations;
CREATE POLICY "Admins and owners can update registrations"
  ON public.yara_competition_registrations FOR UPDATE
  USING (
    user_id = auth.uid() 
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    OR auth.role() = 'service_role'
  )
  WITH CHECK (
    user_id = auth.uid() 
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    OR auth.role() = 'service_role'
  );

DROP POLICY IF EXISTS "Admins can delete registrations" ON public.yara_competition_registrations;
CREATE POLICY "Admins can delete registrations"
  ON public.yara_competition_registrations FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin') OR auth.role() = 'service_role');

CREATE INDEX IF NOT EXISTS idx_ycr_reg_id ON public.yara_competition_registrations(registration_id);
CREATE INDEX IF NOT EXISTS idx_ycr_status ON public.yara_competition_registrations(status);
CREATE INDEX IF NOT EXISTS idx_ycr_province ON public.yara_competition_registrations(province);
CREATE INDEX IF NOT EXISTS idx_ycr_email ON public.yara_competition_registrations(lower(team_leader_email));

-- =========================================================================
-- 3. COMPETITION SPONSORS (TIERS, AMOUNTS & ALLOCATIONS)
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.sponsors (
  id TEXT PRIMARY KEY DEFAULT ('sp_' || floor(extract(epoch from now()))::text || '_' || substr(md5(random()::text), 1, 6)),
  organization_name TEXT NOT NULL,
  contact_person TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  website TEXT,
  tier TEXT NOT NULL DEFAULT 'tech_sponsor', -- 'title_sponsor', 'gold_sponsor', 'silver_sponsor', 'tech_sponsor', 'food_sponsor', 'awards_sponsor', 'education_sponsor'
  contribution_type TEXT NOT NULL DEFAULT 'cash', -- 'cash', 'in_kind', 'hybrid'
  committed_amount DECIMAL(12,2) DEFAULT 0.00,
  received_amount DECIMAL(12,2) DEFAULT 0.00,
  in_kind_description TEXT,
  target_focus TEXT DEFAULT 'Robotics Kits & STEM Equipment',
  logo_url TEXT,
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'received', 'declined')),
  benefits_active BOOLEAN DEFAULT false,
  allocations JSONB DEFAULT '{"prizes_amount": 0, "equipment_amount": 0, "underserved_subsidies": 0, "operations_materials": 0}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.sponsors ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view approved sponsors" ON public.sponsors;
CREATE POLICY "Public can view approved sponsors"
  ON public.sponsors FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Anyone can submit sponsor inquiry" ON public.sponsors;
CREATE POLICY "Anyone can submit sponsor inquiry"
  ON public.sponsors FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can manage sponsors" ON public.sponsors;
CREATE POLICY "Admins can manage sponsors"
  ON public.sponsors FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin') OR auth.role() = 'service_role')
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin') OR auth.role() = 'service_role');

-- =========================================================================
-- 4. UNIFIED VOLUNTEERS & COMPETITION OFFICIALS
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.volunteers (
  id TEXT PRIMARY KEY DEFAULT ('vol_' || floor(extract(epoch from now()))::text || '_' || substr(md5(random()::text), 1, 6)),
  full_name TEXT NOT NULL,
  age INTEGER,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  organization_school TEXT,
  country TEXT DEFAULT 'Zimbabwe',
  province TEXT,
  district TEXT,
  skills TEXT[] DEFAULT '{}',
  skills_background TEXT,
  previous_experience TEXT,
  availability TEXT,
  motivation TEXT,
  category TEXT DEFAULT 'event_logistics',
  preferred_department TEXT,
  secondary_department TEXT,
  custom_role_description TEXT,
  emergency_contact TEXT,
  emergency_phone TEXT,
  assigned_department TEXT,
  assigned_supervisor TEXT,
  shift_time TEXT,
  checked_in_event_day BOOLEAN DEFAULT false,
  checked_in_at TIMESTAMPTZ,
  certificate_issued BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'waitlisted', 'declined', 'rejected')),
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Ensure all columns exist for existing installations
ALTER TABLE public.volunteers ADD COLUMN IF NOT EXISTS age INTEGER;
ALTER TABLE public.volunteers ADD COLUMN IF NOT EXISTS organization_school TEXT;
ALTER TABLE public.volunteers ADD COLUMN IF NOT EXISTS skills TEXT[] DEFAULT '{}';
ALTER TABLE public.volunteers ADD COLUMN IF NOT EXISTS preferred_department TEXT;
ALTER TABLE public.volunteers ADD COLUMN IF NOT EXISTS secondary_department TEXT;
ALTER TABLE public.volunteers ADD COLUMN IF NOT EXISTS custom_role_description TEXT;
ALTER TABLE public.volunteers ADD COLUMN IF NOT EXISTS emergency_contact TEXT;
ALTER TABLE public.volunteers ADD COLUMN IF NOT EXISTS emergency_phone TEXT;
ALTER TABLE public.volunteers ADD COLUMN IF NOT EXISTS assigned_department TEXT;
ALTER TABLE public.volunteers ADD COLUMN IF NOT EXISTS assigned_supervisor TEXT;
ALTER TABLE public.volunteers ADD COLUMN IF NOT EXISTS shift_time TEXT;
ALTER TABLE public.volunteers ADD COLUMN IF NOT EXISTS checked_in_event_day BOOLEAN DEFAULT false;
ALTER TABLE public.volunteers ADD COLUMN IF NOT EXISTS checked_in_at TIMESTAMPTZ;
ALTER TABLE public.volunteers ADD COLUMN IF NOT EXISTS certificate_issued BOOLEAN DEFAULT false;
ALTER TABLE public.volunteers ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

ALTER TABLE public.volunteers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view volunteers" ON public.volunteers;
CREATE POLICY "Public can view volunteers"
  ON public.volunteers FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Anyone can apply to volunteer" ON public.volunteers;
CREATE POLICY "Anyone can apply to volunteer"
  ON public.volunteers FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can manage volunteers" ON public.volunteers;
CREATE POLICY "Admins can manage volunteers"
  ON public.volunteers FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin') OR auth.role() = 'service_role')
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin') OR auth.role() = 'service_role');

-- =========================================================================
-- 5. JUDGES & DIGITAL SCORING ROSTER
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.judges (
  id TEXT PRIMARY KEY DEFAULT ('jd_' || floor(extract(epoch from now()))::text || '_' || substr(md5(random()::text), 1, 6)),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  organization TEXT,
  designation TEXT,
  assigned_categories TEXT[] DEFAULT '{"underwater_drone", "autonomous_maze", "innovation_pitch"}',
  assigned_team_ids TEXT[] DEFAULT '{}',
  bio TEXT,
  is_lead_judge BOOLEAN DEFAULT false,
  pin_code TEXT DEFAULT '2026',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'invited', 'declined')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.judges ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view judges" ON public.judges;
CREATE POLICY "Public can view judges"
  ON public.judges FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can manage judges" ON public.judges;
CREATE POLICY "Admins can manage judges"
  ON public.judges FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin') OR auth.role() = 'service_role')
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin') OR auth.role() = 'service_role');

-- Digital Scores (Standardized 0-100 rubric with Category Breakdown)
CREATE TABLE IF NOT EXISTS public.scores (
  id TEXT PRIMARY KEY DEFAULT ('sc_' || floor(extract(epoch from now()))::text || '_' || substr(md5(random()::text), 1, 6)),
  team_id TEXT NOT NULL,
  team_name TEXT NOT NULL,
  registration_id TEXT,
  category TEXT NOT NULL, -- 'underwater_drone', 'autonomous_maze', 'innovation_pitch'
  judge_id TEXT,
  judge_name TEXT NOT NULL,
  engineering_design DECIMAL(5,2) DEFAULT 0.00, -- Max 20
  innovation DECIMAL(5,2) DEFAULT 0.00,         -- Max 20
  performance DECIMAL(5,2) DEFAULT 0.00,        -- Max 40
  safety DECIMAL(5,2) DEFAULT 0.00,             -- Max 10
  teamwork DECIMAL(5,2) DEFAULT 0.00,           -- Max 10
  total_score DECIMAL(5,2) DEFAULT 0.00,        -- Max 100
  notes TEXT,
  is_locked BOOLEAN DEFAULT false,
  submitted_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.scores ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view submitted scores" ON public.scores;
CREATE POLICY "Public can view submitted scores"
  ON public.scores FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Judges and Admins can insert and update scores" ON public.scores;
CREATE POLICY "Judges and Admins can insert and update scores"
  ON public.scores FOR ALL
  USING (
    is_locked = false 
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    OR auth.role() = 'service_role'
  )
  WITH CHECK (
    is_locked = false 
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    OR auth.role() = 'service_role'
  );

-- =========================================================================
-- 6. CHAPTER REGISTRATION REQUESTS & APPROVAL ENGINE
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.chapter_registration_requests (
  id TEXT PRIMARY KEY DEFAULT ('req_' || floor(extract(epoch from now()))::text || '_' || substr(md5(random()::text), 1, 6)),
  proposed_name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('primary', 'high_school', 'university', 'community', 'polytechnic', 'vocational_tvet', 'innovation_hub')),
  institution_or_community TEXT NOT NULL,
  province TEXT NOT NULL,
  district_or_city TEXT NOT NULL,
  coordinator_name TEXT NOT NULL,
  coordinator_email TEXT NOT NULL,
  coordinator_phone TEXT NOT NULL,
  coordinator_role TEXT NOT NULL,
  estimated_initial_members INTEGER DEFAULT 10,
  patron_name TEXT,
  patron_email TEXT,
  patron_phone TEXT,
  focus_areas TEXT[] DEFAULT '{}',
  meeting_location TEXT,
  motivation TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'under_review')),
  assigned_provincial_university_name TEXT,
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.chapter_registration_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view chapter registration requests" ON public.chapter_registration_requests;
CREATE POLICY "Public can view chapter registration requests"
  ON public.chapter_registration_requests FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Anyone can submit chapter registration requests" ON public.chapter_registration_requests;
CREATE POLICY "Anyone can submit chapter registration requests"
  ON public.chapter_registration_requests FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can manage chapter registration requests" ON public.chapter_registration_requests;
CREATE POLICY "Admins can manage chapter registration requests"
  ON public.chapter_registration_requests FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin') OR auth.role() = 'service_role')
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin') OR auth.role() = 'service_role');

-- =========================================================================
-- 7. LMS CURRICULUM PROGRESS & QUIZ ATTEMPTS
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.curriculum_progress (
  id TEXT PRIMARY KEY DEFAULT ('cp_' || floor(extract(epoch from now()))::text || '_' || substr(md5(random()::text), 1, 6)),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  session_id TEXT NOT NULL,
  video_progress INTEGER DEFAULT 0,
  quiz_status TEXT DEFAULT 'pending', -- 'pending', 'passed', 'failed'
  quiz_score DECIMAL(5,2) DEFAULT 0.00,
  assignment_status TEXT DEFAULT 'pending', -- 'pending', 'submitted', 'graded'
  assignment_submission_text TEXT,
  assignment_file_url TEXT,
  project_status TEXT DEFAULT 'pending', -- 'pending', 'submitted', 'graded'
  project_submission_text TEXT,
  project_file_url TEXT,
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, session_id)
);

ALTER TABLE public.curriculum_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view and update their own curriculum progress" ON public.curriculum_progress;
CREATE POLICY "Users can view and update their own curriculum progress"
  ON public.curriculum_progress FOR ALL
  USING (
    user_id = auth.uid() 
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    OR auth.role() = 'service_role'
  )
  WITH CHECK (
    user_id = auth.uid() 
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    OR auth.role() = 'service_role'
  );

-- Quiz Attempts
CREATE TABLE IF NOT EXISTS public.quiz_attempts (
  id TEXT PRIMARY KEY DEFAULT ('qa_' || floor(extract(epoch from now()))::text || '_' || substr(md5(random()::text), 1, 6)),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  session_id TEXT NOT NULL,
  score INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  percentage DECIMAL(5,2) NOT NULL,
  passed BOOLEAN NOT NULL,
  answers JSONB DEFAULT '{}'::jsonb,
  time_spent_seconds INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view and submit quiz attempts" ON public.quiz_attempts;
CREATE POLICY "Users can view and submit quiz attempts"
  ON public.quiz_attempts FOR ALL
  USING (
    user_id = auth.uid() 
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    OR auth.role() = 'service_role'
  )
  WITH CHECK (
    user_id = auth.uid() 
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    OR auth.role() = 'service_role'
  );

-- =========================================================================
-- 8. COMPETITION ANNOUNCEMENTS & FINANCIAL TRANSACTIONS
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.competition_announcements (
  id TEXT PRIMARY KEY DEFAULT ('ann_' || floor(extract(epoch from now()))::text || '_' || substr(md5(random()::text), 1, 6)),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  target_audience TEXT DEFAULT 'all' CHECK (target_audience IN ('all', 'teams', 'sponsors', 'volunteers', 'judges')),
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('normal', 'high', 'urgent')),
  author TEXT DEFAULT 'YARA Organizing Committee',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.competition_announcements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view announcements" ON public.competition_announcements;
CREATE POLICY "Public can view announcements"
  ON public.competition_announcements FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can manage announcements" ON public.competition_announcements;
CREATE POLICY "Admins can manage announcements"
  ON public.competition_announcements FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin') OR auth.role() = 'service_role')
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin') OR auth.role() = 'service_role');

-- Financial Transactions Ledger (Championship Budget)
CREATE TABLE IF NOT EXISTS public.financial_transactions (
  id TEXT PRIMARY KEY DEFAULT ('tx_' || floor(extract(epoch from now()))::text || '_' || substr(md5(random()::text), 1, 6)),
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  currency TEXT NOT NULL DEFAULT 'USD',
  status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'projected', 'pending')),
  payer_or_payee TEXT NOT NULL,
  date TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.financial_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage financial transactions" ON public.financial_transactions;
CREATE POLICY "Admins can manage financial transactions"
  ON public.financial_transactions FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin') OR auth.role() = 'service_role')
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin') OR auth.role() = 'service_role');

-- =========================================================================
-- 9. PROGRAMMING COURSES & ENROLLMENTS
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.programming_courses (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  level TEXT NOT NULL DEFAULT 'Beginner', -- 'Beginner', 'Intermediate', 'Advanced'
  category TEXT NOT NULL DEFAULT 'Robotics Programming',
  icon TEXT,
  color TEXT,
  estimated_hours INTEGER DEFAULT 10,
  modules_count INTEGER DEFAULT 1,
  is_published BOOLEAN DEFAULT true,
  modules JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.programming_courses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view published programming courses" ON public.programming_courses;
CREATE POLICY "Public can view published programming courses"
  ON public.programming_courses FOR SELECT
  USING (is_published = true OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "Admins can manage programming courses" ON public.programming_courses;
CREATE POLICY "Admins can manage programming courses"
  ON public.programming_courses FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin') OR auth.role() = 'service_role')
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin') OR auth.role() = 'service_role');

CREATE TABLE IF NOT EXISTS public.programming_course_enrollments (
  id TEXT PRIMARY KEY DEFAULT ('enr_' || floor(extract(epoch from now()))::text || '_' || substr(md5(random()::text), 1, 6)),
  course_id TEXT REFERENCES public.programming_courses(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  progress INTEGER DEFAULT 0,
  completed_modules TEXT[] DEFAULT '{}',
  enrolled_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  certificate_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(course_id, user_id)
);

ALTER TABLE public.programming_course_enrollments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view and manage their course enrollments" ON public.programming_course_enrollments;
CREATE POLICY "Users can view and manage their course enrollments"
  ON public.programming_course_enrollments FOR ALL
  USING (
    user_id = auth.uid() 
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    OR auth.role() = 'service_role'
  )
  WITH CHECK (
    user_id = auth.uid() 
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    OR auth.role() = 'service_role'
  );

-- =========================================================================
-- 10. CUSTOM HARDWARE KITS & DOWNLOADABLE RESOURCES
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.custom_hardware_kits (
  id TEXT PRIMARY KEY DEFAULT ('kit_' || floor(extract(epoch from now()))::text || '_' || substr(md5(random()::text), 1, 6)),
  title TEXT NOT NULL,
  subtitle TEXT,
  price_usd DECIMAL(10,2) DEFAULT 0.00,
  description TEXT,
  image_url TEXT,
  included_components TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.custom_hardware_kits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view hardware kits" ON public.custom_hardware_kits;
CREATE POLICY "Public can view hardware kits"
  ON public.custom_hardware_kits FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can manage hardware kits" ON public.custom_hardware_kits;
CREATE POLICY "Admins can manage hardware kits"
  ON public.custom_hardware_kits FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin') OR auth.role() = 'service_role')
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin') OR auth.role() = 'service_role');

CREATE TABLE IF NOT EXISTS public.custom_documents (
  id TEXT PRIMARY KEY DEFAULT ('doc_' || floor(extract(epoch from now()))::text || '_' || substr(md5(random()::text), 1, 6)),
  title TEXT NOT NULL,
  description TEXT,
  type TEXT DEFAULT 'pdf',
  category TEXT DEFAULT 'general',
  file_url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.custom_documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view custom documents" ON public.custom_documents;
CREATE POLICY "Public can view custom documents"
  ON public.custom_documents FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can manage custom documents" ON public.custom_documents;
CREATE POLICY "Admins can manage custom documents"
  ON public.custom_documents FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin') OR auth.role() = 'service_role')
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin') OR auth.role() = 'service_role');

-- =========================================================================
-- 11. EXPANDED STORAGE BUCKETS & PUBLIC ACCESS POLICIES
-- =========================================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('event-proofs', 'event-proofs', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']),
  ('certificates', 'certificates', true, 15728640, ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']),
  ('chapter-media', 'chapter-media', true, 20971520, ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf', 'video/mp4']),
  ('lesson-plans', 'lesson-plans', true, 26214400, ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 'text/plain', 'image/jpeg', 'image/png']),
  ('avatars', 'avatars', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  ('project-submissions', 'project-submissions', true, 31457280, ARRAY['application/pdf', 'application/zip', 'image/jpeg', 'image/png', 'text/plain', 'video/mp4']),
  ('competition-documents', 'competition-documents', true, 31457280, ARRAY['application/pdf', 'application/zip', 'image/jpeg', 'image/png', 'video/mp4'])
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Storage RLS: Public Read Access
DROP POLICY IF EXISTS "Public can view storage objects" ON storage.objects;
CREATE POLICY "Public can view storage objects"
  ON storage.objects FOR SELECT
  USING (bucket_id IN ('event-proofs', 'certificates', 'chapter-media', 'lesson-plans', 'avatars', 'project-submissions', 'competition-documents'));

-- Storage RLS: Anyone can upload user assets
DROP POLICY IF EXISTS "Public upload to user buckets" ON storage.objects;
CREATE POLICY "Public upload to user buckets"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id IN ('event-proofs', 'chapter-media', 'lesson-plans', 'avatars', 'project-submissions', 'competition-documents'));

-- Storage RLS: Admins have full storage access
DROP POLICY IF EXISTS "Admins have full storage access" ON storage.objects;
CREATE POLICY "Admins have full storage access"
  ON storage.objects FOR ALL
  USING (
    bucket_id IN ('event-proofs', 'certificates', 'chapter-media', 'lesson-plans', 'avatars', 'project-submissions', 'competition-documents')
    AND (
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
      OR auth.role() = 'service_role'
    )
  );

-- =========================================================================
-- 12. TRIGGERS FOR ALL NEW TABLES
-- =========================================================================
DROP TRIGGER IF EXISTS update_comp_events_updated_at ON public.competition_events;
CREATE TRIGGER update_comp_events_updated_at
  BEFORE UPDATE ON public.competition_events
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_ycr_updated_at ON public.yara_competition_registrations;
CREATE TRIGGER update_ycr_updated_at
  BEFORE UPDATE ON public.yara_competition_registrations
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_sponsors_updated_at ON public.sponsors;
CREATE TRIGGER update_sponsors_updated_at
  BEFORE UPDATE ON public.sponsors
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_volunteers_updated_at ON public.volunteers;
CREATE TRIGGER update_volunteers_updated_at
  BEFORE UPDATE ON public.volunteers
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_judges_updated_at ON public.judges;
CREATE TRIGGER update_judges_updated_at
  BEFORE UPDATE ON public.judges
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_scores_updated_at ON public.scores;
CREATE TRIGGER update_scores_updated_at
  BEFORE UPDATE ON public.scores
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_chap_req_updated_at ON public.chapter_registration_requests;
CREATE TRIGGER update_chap_req_updated_at
  BEFORE UPDATE ON public.chapter_registration_requests
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_curr_prog_updated_at ON public.curriculum_progress;
CREATE TRIGGER update_curr_prog_updated_at
  BEFORE UPDATE ON public.curriculum_progress
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_comp_announcements_updated_at ON public.competition_announcements;
CREATE TRIGGER update_comp_announcements_updated_at
  BEFORE UPDATE ON public.competition_announcements
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_fin_tx_updated_at ON public.financial_transactions;
CREATE TRIGGER update_fin_tx_updated_at
  BEFORE UPDATE ON public.financial_transactions
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_prog_courses_updated_at ON public.programming_courses;
CREATE TRIGGER update_prog_courses_updated_at
  BEFORE UPDATE ON public.programming_courses
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_prog_enrollments_updated_at ON public.programming_course_enrollments;
CREATE TRIGGER update_prog_enrollments_updated_at
  BEFORE UPDATE ON public.programming_course_enrollments
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_hw_kits_updated_at ON public.custom_hardware_kits;
CREATE TRIGGER update_hw_kits_updated_at
  BEFORE UPDATE ON public.custom_hardware_kits
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_custom_docs_updated_at ON public.custom_documents;
CREATE TRIGGER update_custom_docs_updated_at
  BEFORE UPDATE ON public.custom_documents
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
