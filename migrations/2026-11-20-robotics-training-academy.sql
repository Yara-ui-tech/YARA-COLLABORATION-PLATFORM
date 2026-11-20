-- ==============================================================================
-- MIGRATION: YARA ACADEMY - ROBOTICS & ENGINEERING TRAINING PROGRAMME
-- Integrates Robotics Training, Certification Pathways, Learner Passports,
-- School Partnerships, and Teacher CPD into YARA Academy.
-- ==============================================================================

-- 1. ROBOTICS PROGRAMMES CATALOG
CREATE TABLE IF NOT EXISTS public.robotics_programmes (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL, -- 'curriculum', 'club', 'workshop', 'certification', 'bootcamp'
  target_audience TEXT NOT NULL,
  age_range TEXT NOT NULL,
  fee_per_learner NUMERIC(10,2) NOT NULL DEFAULT 0,
  fee_structure TEXT NOT NULL, -- 'complete_programme', 'per_session', 'per_lesson'
  duration_description TEXT NOT NULL,
  minimum_lessons_or_sessions INTEGER DEFAULT 10,
  description TEXT NOT NULL,
  features JSONB DEFAULT '[]'::jsonb,
  syllabus_topics JSONB DEFAULT '[]'::jsonb,
  badge TEXT NOT NULL,
  is_popular BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. ROBOTICS CERTIFICATION LEVELS
CREATE TABLE IF NOT EXISTS public.robotics_certification_levels (
  id TEXT PRIMARY KEY,
  level_number INTEGER NOT NULL,
  level_title TEXT NOT NULL,
  target_audience TEXT NOT NULL,
  minimum_requirements TEXT NOT NULL,
  required_lessons_or_sessions INTEGER NOT NULL DEFAULT 10,
  fee_per_unit NUMERIC(10,2) NOT NULL DEFAULT 5,
  minimum_cost NUMERIC(10,2) NOT NULL DEFAULT 50,
  is_provisional_pricing BOOLEAN DEFAULT false,
  description TEXT NOT NULL,
  learning_outcomes JSONB DEFAULT '[]'::jsonb,
  sample_project TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. ROBOTICS LEARNER ENROLMENTS (Individual, Parent/Guardian, and School Groups)
CREATE TABLE IF NOT EXISTS public.robotics_enrolments (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  enrolment_type TEXT NOT NULL DEFAULT 'individual', -- 'individual', 'parent_guardian', 'school_group', 'teacher'
  primary_contact_name TEXT NOT NULL,
  primary_contact_email TEXT NOT NULL,
  primary_contact_phone TEXT NOT NULL,
  parent_guardian_name TEXT,
  school_or_chapter_name TEXT NOT NULL,
  grade_or_education_level TEXT NOT NULL,
  programme_id TEXT REFERENCES public.robotics_programmes(id) ON DELETE SET NULL,
  programme_title TEXT NOT NULL,
  certification_level_id TEXT REFERENCES public.robotics_certification_levels(id) ON DELETE SET NULL,
  location_option TEXT NOT NULL DEFAULT 'school_lab', -- 'school_lab', 'yara_hub_harare', 'bulawayo_center', 'community_center', 'virtual_hybrid'
  preferred_schedule TEXT NOT NULL DEFAULT 'weekday_afternoon', -- 'weekday_afternoon', 'saturday_morning', 'holiday_intensive', 'custom'
  students_list JSONB DEFAULT '[]'::jsonb, -- Array of { id, fullName, ageOrGrade, gender, guardianPhone }
  learner_count INTEGER NOT NULL DEFAULT 1,
  calculated_fee NUMERIC(10,2) NOT NULL DEFAULT 0,
  include_hardware_kit BOOLEAN DEFAULT false,
  hardware_kit_fee NUMERIC(10,2) NOT NULL DEFAULT 0,
  total_payable_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  payment_status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'paid', 'sponsored', 'partial'
  enrolment_status TEXT NOT NULL DEFAULT 'submitted', -- 'submitted', 'confirmed', 'active', 'graduated', 'cancelled'
  assigned_trainer_name TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. ROBOTICS TEACHER ENROLMENTS (CPD)
CREATE TABLE IF NOT EXISTS public.robotics_teacher_enrolments (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  teacher_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  school_name TEXT NOT NULL,
  subject_taught TEXT NOT NULL,
  province TEXT NOT NULL,
  city TEXT NOT NULL,
  sessions_completed INTEGER NOT NULL DEFAULT 0,
  required_sessions INTEGER NOT NULL DEFAULT 5,
  purchased_robotics_kit BOOLEAN DEFAULT true,
  total_cost NUMERIC(10,2) NOT NULL DEFAULT 100,
  status TEXT NOT NULL DEFAULT 'enrolled', -- 'enrolled', 'in_training', 'certified'
  certificate_number TEXT,
  payment_status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. ROBOTICS SCHOOL PARTNERSHIPS
CREATE TABLE IF NOT EXISTS public.robotics_school_partnerships (
  id TEXT PRIMARY KEY,
  school_name TEXT NOT NULL,
  contact_person_name TEXT NOT NULL,
  contact_role TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  province TEXT NOT NULL,
  district TEXT,
  city TEXT NOT NULL,
  school_type TEXT NOT NULL DEFAULT 'combined',
  estimated_learners INTEGER NOT NULL DEFAULT 30,
  requested_offerings JSONB DEFAULT '[]'::jsonb,
  has_existing_lab BOOLEAN DEFAULT false,
  preferred_start_date DATE,
  additional_message TEXT,
  status TEXT NOT NULL DEFAULT 'submitted', -- 'submitted', 'under_review', 'contacted', 'approved', 'active'
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 6. ROBOTICS ATTENDANCE & LAB SESSIONS
CREATE TABLE IF NOT EXISTS public.robotics_attendance (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  enrolment_id TEXT REFERENCES public.robotics_enrolments(id) ON DELETE CASCADE,
  session_date DATE NOT NULL DEFAULT CURRENT_DATE,
  session_title TEXT NOT NULL,
  programme_id TEXT,
  learner_name TEXT NOT NULL,
  present BOOLEAN NOT NULL DEFAULT true,
  trainer_name TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. ROBOTICS PRACTICAL ASSESSMENTS & JURY RUBRICS
CREATE TABLE IF NOT EXISTS public.robotics_assessments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  enrolment_id TEXT REFERENCES public.robotics_enrolments(id) ON DELETE CASCADE,
  learner_name TEXT NOT NULL,
  level_id TEXT REFERENCES public.robotics_certification_levels(id) ON DELETE SET NULL,
  assessment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  circuit_score INTEGER DEFAULT 0,
  coding_score INTEGER DEFAULT 0,
  mechanical_score INTEGER DEFAULT 0,
  problem_solving_score INTEGER DEFAULT 0,
  total_score INTEGER NOT NULL DEFAULT 0,
  grade TEXT NOT NULL DEFAULT 'Distinction',
  assessor_name TEXT NOT NULL,
  feedback TEXT,
  is_approved_for_certification BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.robotics_programmes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.robotics_certification_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.robotics_enrolments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.robotics_teacher_enrolments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.robotics_school_partnerships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.robotics_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.robotics_assessments ENABLE ROW LEVEL SECURITY;

-- Public read access for programmes & pathways
CREATE POLICY "Public can view robotics programmes" 
  ON public.robotics_programmes FOR SELECT USING (true);

CREATE POLICY "Public can view certification pathways" 
  ON public.robotics_certification_levels FOR SELECT USING (true);

-- Enrolments & Partnerships: Public can insert, users can view own, admins can manage all
CREATE POLICY "Anyone can submit enrolment" 
  ON public.robotics_enrolments FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view own enrolments" 
  ON public.robotics_enrolments FOR SELECT USING (
    auth.uid() = user_id 
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can update enrolments" 
  ON public.robotics_enrolments FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Anyone can submit school partnership" 
  ON public.robotics_school_partnerships FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view and manage school partnerships" 
  ON public.robotics_school_partnerships FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Anyone can submit teacher enrolment" 
  ON public.robotics_teacher_enrolments FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view and manage teacher enrolments" 
  ON public.robotics_teacher_enrolments FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can manage attendance" 
  ON public.robotics_attendance FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can manage assessments" 
  ON public.robotics_assessments FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ==============================================================================
-- SEED INITIAL PROGRAMMES AND PATHWAYS
-- ==============================================================================
INSERT INTO public.robotics_programmes (id, title, category, target_audience, age_range, fee_per_learner, fee_structure, duration_description, minimum_lessons_or_sessions, description, badge, is_popular)
VALUES
  ('curriculum_primary', 'Curriculum-Based Robotics (Primary)', 'curriculum', 'Primary School (Grades 1 – 7)', '6 – 12 Years', 25.00, 'complete_programme', 'Full Primary Syllabus (Term-based)', 10, 'Structured, hands-on foundational robotics syllabus integrating block coding, visual electronics, simple machines, and creative motor control.', '$25 Complete Syllabus', true),
  ('curriculum_highschool', 'Curriculum-Based Robotics (High School)', 'curriculum', 'High School (Forms 1 – 6)', '13 – 19 Years', 40.00, 'complete_programme', 'Full Secondary Syllabus (Term-based)', 12, 'Rigorous STEM curriculum bridging embedded C++, Arduino/ESP32 architecture, robotic kinematics, autonomous algorithms, and real-world engineering design.', '$40 Complete Syllabus', true),
  ('weekly_club_primary', 'Weekly Robotics Clubs (Primary)', 'club', 'Primary School Clubs', '7 – 12 Years', 5.00, 'per_session', 'Weekly 90-minute Sessions (Term-long)', 10, 'Energetic after-school club where kids build, race, and code fun robot contraptions each week in small collaborative peer squads.', '$5 Per Session', false),
  ('weekly_club_secondary', 'Weekly Robotics Clubs (Secondary)', 'club', 'Secondary & High School Clubs', '13 – 18 Years', 5.00, 'per_session', 'Weekly 2-hour Sessions (Term-long)', 12, 'Advanced innovation lab sessions focusing on competitive robotics, autonomous maze exploration, and underwater drone prototyping.', '$5 Per Session', false),
  ('monthly_workshop_primary', 'Monthly Robotics Workshops (Primary)', 'workshop', 'Weekend Learners & Beginners', '6 – 12 Years', 5.00, 'per_session', 'Monthly Saturday Intensives (3 Hours)', 1, 'Immersive weekend discovery workshops where young innovators dive deep into a specific invention topic from biomimicry to robotic arms.', '$5 Per Session', false),
  ('monthly_workshop_secondary', 'Monthly Robotics Workshops (Secondary)', 'workshop', 'Secondary Students & STEM Hobbyists', '13 – 19 Years', 5.00, 'per_session', 'Monthly Saturday Intensives (4 Hours)', 1, 'Intensive deep-dive masterclasses covering sensor calibration, edge AI, computer vision camera tracking, and industrial automation.', '$5 Per Session', false),
  ('comprehensive_certification', 'Comprehensive Robotics Training & Certification', 'certification', 'Learners seeking formal accredited milestones', 'All Ages (ECD to Tertiary)', 5.00, 'per_lesson', 'Flexible lesson schedule with progressive assessment gates', 10, 'The standard pathway for structured, audited robotics credentials. Certification is awarded after mandatory attendance, skill evaluations, and project defenses.', '$5 Per Lesson', true),
  ('holiday_bootcamp_junior', 'Holiday Robotics Bootcamp (Junior Explorer)', 'bootcamp', 'Holiday break learners (ECD – Grade 7)', '6 – 12 Years', 20.00, 'complete_programme', '3-Day Intensive Holiday Build Camp (9:00 AM – 1:00 PM)', 6, 'An action-packed holiday experience where learners spend school break turning ideas into moving robots, building friend networks, and presenting team creations.', 'Holiday Accelerator', true),
  ('holiday_bootcamp_senior', 'Holiday Robotics Bootcamp (Senior Innovators)', 'bootcamp', 'Holiday break learners (High School & Tertiary)', '13 – 20 Years', 35.00, 'complete_programme', '5-Day Full-Week Holiday Sprint (9:00 AM – 3:30 PM)', 10, 'Fast-paced, team-based hardware sprint where high schoolers and university innovators build an autonomous rescue or underwater robot from scratch.', 'Holiday Intensive', false)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  fee_per_learner = EXCLUDED.fee_per_learner,
  fee_structure = EXCLUDED.fee_structure,
  description = EXCLUDED.description,
  updated_at = now();

INSERT INTO public.robotics_certification_levels (id, level_number, level_title, target_audience, minimum_requirements, required_lessons_or_sessions, fee_per_unit, minimum_cost, is_provisional_pricing, description, sample_project)
VALUES
  ('level_1_explorer', 1, 'Level 1 – Robotics Explorer Certificate', 'ECD / Infants / Early Primary', 'Minimum 10 lessons completed + practical mini-build', 10, 5.00, 50.00, false, 'Foundational introduction to cause-and-effect electronics, visual block logic, and motor movements for our youngest learners.', 'Light-Seeking Bug Bot & Musical Doorbell'),
  ('level_2_junior', 2, 'Level 2 – Junior Robotics Certificate', 'Grades 3 – 7 (Primary)', 'Minimum 10 lessons completed + sensor obstacle project', 10, 5.00, 50.00, false, 'Intermediate robotic design with input sensors, logic decisions, and autonomous two-wheel drive chassis mechanics.', 'Autonomous Obstacle-Evading Rover'),
  ('level_3_secondary', 3, 'Level 3 – Secondary Robotics Certificate', 'High School (Forms 1 – 6)', 'Minimum 12 sessions completed + autonomous maze defense', 12, 5.00, 60.00, true, 'Text-based embedded C++ programming, Arduino/ESP32 systems, PID control loops, and national robotics competition trials.', 'Precision Line-Tracking & Maze-Navigating Robot'),
  ('level_4_advanced', 4, 'Level 4 – Advanced Robotics & Engineering Certificate', 'Tertiary & Advanced High School Innovators', 'Custom training duration + practical engineering prototype & jury defense', 16, 7.50, 120.00, false, 'Applied robotics engineering including computer vision, ROS/ESP-IDF, underwater robotics (ROV), and societal impact deployment in African communities.', 'Underwater Exploration ROV or Agri-Tech Crop Scouting Drone'),
  ('teacher_cpd', 5, 'Teacher Professional Development Certificate', 'Educators, Club Patrons & STEM Facilitators', 'Minimum 5 intensive sessions ($10/session = $50 min) + curriculum delivery assessment', 5, 10.00, 50.00, false, 'Professional accreditation empowering classroom teachers to lead school robotics clubs, teach STEM curricula, and prepare teams for competitions.', 'School Robotics Club Term Curriculum & Lesson Plan Portfolio')
ON CONFLICT (id) DO UPDATE SET
  level_title = EXCLUDED.level_title,
  minimum_requirements = EXCLUDED.minimum_requirements,
  minimum_cost = EXCLUDED.minimum_cost;

