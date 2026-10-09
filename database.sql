-- ==============================================================================
-- YOUNG AFRICANS ROBOTICS ASSOCIATION (YARA)
-- ENTERPRISE PRODUCTION DATABASE SCHEMA & MASTER MIGRATION SPECIFICATION
-- Motto: "Innovate Local, Build Global"
-- Version: 3.1.0-PROD (Curriculum Structure & Dynamic Module Architecture Update)
-- Target: PostgreSQL 14+ / Supabase
--
-- ARCHITECTURE & CURRICULUM RULES:
-- 1. MINIMUM 6 MODULES BASELINE:
--    Each Robotics Level must have a MINIMUM of 6 theory modules.
--    Use 6 modules as the baseline, but ADD MORE MODULES whenever they are
--    educationally necessary to properly exhaust knowledge, practical competencies,
--    and project requirements expected at that level.
--    (e.g., Beginner: 6-10+ modules, Intermediate: 6-12+ modules, Advanced: 6-15+ modules).
-- 2. ONE MODULE = ONE COHERENT SKILL / KNOWLEDGE AREA.
-- 3. EACH MODULE MUST CONTAIN ALL 8 COMPONENTS:
--    - Theory lessons & key concepts
--    - Short learning videos (<= 7 mins micro-lessons)
--    - Supporting learning resources (PDFs, schematics, datasheets)
--    - Knowledge checks / assessment quizzes
--    - Guided practical laboratory
--    - Practical assignment with rubrics
--    - Troubleshooting guidance & bench debugging
--    - "Need Help?" / mentor support option
-- 4. LEVEL CAPSTONE PROJECT REQUIREMENTS:
--    After completing theory modules:
--    - RESEARCH & DESIGN PROJECT (Problem discovery, 5 Whys, engineering feasibility)
--    - ASSIGNED FINAL DESIGN PROJECT (Complete physical/simulated prototype build)
--    N modules -> N practical labs -> N assignments -> Research Project -> Final Design Project -> Level Exam -> Certificate.
-- 5. DYNAMIC COMPLETION ENGINE:
--    Never hardcode "6 modules". Progress is calculated dynamically based on total modules
--    defined for that level in the database (e.g. 0/8, 0/11, 0/14).
-- 6. ADMIN & INSTRUCTOR CURRICULUM CONTROL:
--    Admins can add, reorder, publish/unpublish modules, lessons, labs, assignments, and projects
--    directly in the database without frontend code changes.
-- ==============================================================================

-- ==============================================================================
-- 00. SYSTEM EXTENSIONS & CONFIGURATION
-- ==============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 01. AUTHENTICATION, ROLES & PROFILES
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  email TEXT UNIQUE,
  contact_phone TEXT,
  member_id TEXT UNIQUE, -- e.g. YARA-2026-1042
  avatar_url TEXT,
  avatar_storage_path TEXT,
  avatar_size BIGINT,
  avatar_mime_type TEXT,
  bio TEXT,
  skills TEXT[] DEFAULT '{}',
  interests TEXT[] DEFAULT '{}',
  social_links JSONB DEFAULT '{}',
  
  -- Role & Educational Level
  role TEXT DEFAULT 'student' CHECK (
    role IN ('super_admin', 'admin', 'instructor', 'coach', 'teacher', 'school_admin', 'student', 'innovator', 'partner', 'mentor')
  ),
  educational_level TEXT CHECK (
    educational_level IN ('junior', 'intermediate', 'senior', 'tertiary', 'teacher', 'professional')
  ),
  school_id UUID, -- Foreign Key to public.schools(id) if affiliated
  
  -- Account Security & Status
  is_verified BOOLEAN DEFAULT FALSE,
  is_halted BOOLEAN DEFAULT FALSE,
  is_executive_auditor BOOLEAN DEFAULT FALSE,
  is_verified_educator BOOLEAN DEFAULT FALSE,
  educator_institution TEXT,
  educator_subject TEXT,
  
  -- Subscriptions & Dues
  registration_paid BOOLEAN DEFAULT FALSE,
  amount_paid DECIMAL(10,2) DEFAULT 0.00,
  total_dues DECIMAL(10,2) DEFAULT 15.00,
  trial_ends_at TIMESTAMPTZ DEFAULT (now() + interval '7 days'),
  subscription_expires_at TIMESTAMPTZ DEFAULT (now() + interval '30 days'),
  
  -- Faculty & Mentorship Metrics
  rating DECIMAL(3,2) DEFAULT 5.0,
  mentored_count INTEGER DEFAULT 0,
  total_commission DECIMAL(10,2) DEFAULT 0.00,
  commission_rate DECIMAL(10,2) DEFAULT 2.00,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);


ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS school_id UUID;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS contact_phone TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS province TEXT DEFAULT 'National';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS approval_status TEXT DEFAULT 'approved';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS registration_paid BOOLEAN DEFAULT FALSE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_blocked BOOLEAN DEFAULT FALSE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS commission_due NUMERIC(10,2) DEFAULT 0.00;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS whatsapp_number TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_verified_educator BOOLEAN DEFAULT FALSE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS educator_institution TEXT;

-- ==============================================================================
-- 02. INSTITUTIONS & SCHOOL MANAGEMENT
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.schools (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  province TEXT NOT NULL,
  district TEXT,
  city TEXT,
  address TEXT,
  school_type TEXT DEFAULT 'Secondary' CHECK (school_type IN ('Primary', 'Secondary', 'High School', 'Vocational / TVET', 'University / Tertiary')),
  principal_name TEXT,
  patron_name TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  robotics_club_name TEXT,
  club_established_year INTEGER DEFAULT 2025,
  is_active BOOLEAN DEFAULT TRUE,
  kits_deployed_count INTEGER DEFAULT 0,
  students_enrolled_count INTEGER DEFAULT 0,
  teams_registered_2026 INTEGER DEFAULT 0,
  verified_badge BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.schools ADD COLUMN IF NOT EXISTS patron_phone TEXT;
ALTER TABLE public.schools ADD COLUMN IF NOT EXISTS club_status TEXT DEFAULT 'active';
ALTER TABLE public.schools ADD COLUMN IF NOT EXISTS established_year INTEGER DEFAULT 2025;
ALTER TABLE public.schools ADD COLUMN IF NOT EXISTS kits_assigned_count INTEGER DEFAULT 0;
ALTER TABLE public.schools ADD COLUMN IF NOT EXISTS active_teams_count INTEGER DEFAULT 0;

CREATE TABLE IF NOT EXISTS public.school_clubs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  club_name TEXT NOT NULL,
  patron_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  president_student_name TEXT,
  meeting_day TEXT DEFAULT 'Friday',
  meeting_time TEXT DEFAULT '14:30 - 16:30',
  lab_location TEXT DEFAULT 'Science Lab 2 / Computer Room',
  active_members_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'in_formation', 'inactive')),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.school_rosters (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role_in_school TEXT DEFAULT 'student' CHECK (role_in_school IN ('patron', 'teacher', 'captain', 'student', 'mentor')),
  grade_or_form TEXT, -- e.g. Form 3, Form 4, Lower 6
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(school_id, user_id)
);

-- ==============================================================================
-- 03. TRAINING MANAGEMENT SYSTEM
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.training_programs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  target_audience TEXT NOT NULL CHECK (target_audience IN ('Students', 'Teachers / Patrons', 'Schools', 'Coaches', 'Enthusiasts', 'All')),
  category TEXT DEFAULT 'Robotics' CHECK (category IN ('Robotics', 'Coding', 'AI & IoT', 'STEM Education', 'Competition Coaching', 'Digital Literacy')),
  format TEXT DEFAULT 'Blended' CHECK (format IN ('In-Person', 'Online', 'Blended', 'Bootcamp')),
  duration_weeks INTEGER DEFAULT 4,
  total_hours INTEGER DEFAULT 16,
  start_date DATE,
  end_date DATE,
  registration_deadline DATE,
  venue TEXT DEFAULT 'Harare / Regional Centers + Online Portal',
  instructor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  instructor_name TEXT DEFAULT 'YARA Technical Faculty',
  capacity INTEGER DEFAULT 100,
  enrolled_count INTEGER DEFAULT 0,
  fee_usd DECIMAL(10,2) DEFAULT 0.00,
  is_free BOOLEAN GENERATED ALWAYS AS (fee_usd = 0.00) STORED,
  learning_outcomes TEXT[] DEFAULT '{}',
  curriculum_syllabus JSONB DEFAULT '[]',
  prerequisites TEXT[] DEFAULT '{}',
  certification_awarded BOOLEAN DEFAULT TRUE,
  status TEXT DEFAULT 'open_for_registration' CHECK (status IN ('draft', 'open_for_registration', 'in_progress', 'completed', 'archived')),
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Idempotent Column Existence Guards for training_programs
ALTER TABLE public.training_programs ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE public.training_programs ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE public.training_programs ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.training_programs ADD COLUMN IF NOT EXISTS target_audience TEXT DEFAULT 'All';
ALTER TABLE public.training_programs ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'Robotics';
ALTER TABLE public.training_programs ADD COLUMN IF NOT EXISTS format TEXT DEFAULT 'Blended';
ALTER TABLE public.training_programs ADD COLUMN IF NOT EXISTS duration_weeks INTEGER DEFAULT 4;
ALTER TABLE public.training_programs ADD COLUMN IF NOT EXISTS total_hours INTEGER DEFAULT 16;
ALTER TABLE public.training_programs ADD COLUMN IF NOT EXISTS fee_usd DECIMAL(10,2) DEFAULT 0.00;
ALTER TABLE public.training_programs ADD COLUMN IF NOT EXISTS capacity INTEGER DEFAULT 100;
ALTER TABLE public.training_programs ADD COLUMN IF NOT EXISTS venue TEXT DEFAULT 'Harare / Regional Centers + Online Portal';
ALTER TABLE public.training_programs ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'open_for_registration';
ALTER TABLE public.training_programs ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE;

CREATE TABLE IF NOT EXISTS public.training_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  program_id UUID NOT NULL REFERENCES public.training_programs(id) ON DELETE CASCADE,
  session_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER DEFAULT 90,
  venue_or_link TEXT,
  meeting_recording_url TEXT,
  presentation_slides_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.training_registrations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  program_id UUID NOT NULL REFERENCES public.training_programs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  school_id UUID REFERENCES public.schools(id) ON DELETE SET NULL,
  registration_status TEXT DEFAULT 'pending' CHECK (registration_status IN ('pending', 'confirmed', 'attended', 'cancelled')),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'verified', 'waived', 'sponsored')),
  amount_paid DECIMAL(10,2) DEFAULT 0.00,
  payment_reference TEXT,
  certificate_issued BOOLEAN DEFAULT FALSE,
  certificate_id TEXT,
  registered_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(program_id, user_id)
);

-- ==============================================================================
-- 04. LMS CORE — COURSES & DYNAMIC COMPLETION ENGINE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.courses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL, -- e.g. 'YARA-ROB-BEG', 'YARA-ROB-INT', 'YARA-ROB-ADV'
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  track TEXT DEFAULT 'Robotics' CHECK (track IN ('Robotics', 'Coding', 'Artificial Intelligence', 'IoT', 'Engineering', 'STEM', 'Digital Literacy', 'Kids')),
  tier INTEGER DEFAULT 1 CHECK (tier IN (1, 2, 3, 4)),
  level TEXT DEFAULT 'Beginner' CHECK (level IN ('Beginner', 'Intermediate', 'Advanced', 'Master', 'All Levels')),
  short_summary TEXT,
  description TEXT,
  thumbnail_url TEXT,
  video_preview_url TEXT,
  instructor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  
  -- Dynamic Module Policy & Metrics
  min_theory_modules INTEGER DEFAULT 6, -- Strict baseline: Minimum 6 theory modules required
  total_modules INTEGER DEFAULT 0,      -- Computed dynamically from course_modules
  total_labs INTEGER DEFAULT 0,         -- Computed dynamically
  total_assignments INTEGER DEFAULT 0,  -- Computed dynamically
  
  -- Mandatory Project & Exam Completion Requirements
  requires_research_project BOOLEAN DEFAULT TRUE,
  requires_final_design_project BOOLEAN DEFAULT TRUE,
  requires_level_exam BOOLEAN DEFAULT TRUE,
  
  estimated_duration_hours INTEGER DEFAULT 20,
  hardware_required TEXT[] DEFAULT '{}',
  learning_outcomes TEXT[] DEFAULT '{}',
  prerequisites TEXT[] DEFAULT '{}',
  
  is_published BOOLEAN DEFAULT TRUE,
  is_draft BOOLEAN DEFAULT FALSE,
  is_featured BOOLEAN DEFAULT FALSE,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Upgrades for dynamic module fields and backward compatibility with existing databases
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS code TEXT;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS track TEXT DEFAULT 'Robotics';
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS tier INTEGER DEFAULT 1;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS level TEXT DEFAULT 'Beginner';
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS short_summary TEXT;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS video_preview_url TEXT;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS instructor_id UUID;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS min_theory_modules INTEGER DEFAULT 6;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS total_modules INTEGER DEFAULT 0;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS total_labs INTEGER DEFAULT 0;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS total_assignments INTEGER DEFAULT 0;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS requires_research_project BOOLEAN DEFAULT TRUE;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS requires_final_design_project BOOLEAN DEFAULT TRUE;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS requires_level_exam BOOLEAN DEFAULT TRUE;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS estimated_duration_hours INTEGER DEFAULT 20;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS hardware_required TEXT[] DEFAULT '{}';
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS learning_outcomes TEXT[] DEFAULT '{}';
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS prerequisites TEXT[] DEFAULT '{}';
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT TRUE;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS is_draft BOOLEAN DEFAULT FALSE;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS order_index INTEGER DEFAULT 0;

-- ==============================================================================
-- 05. LMS CORE — MODULE SPECIFICATION (8 REQUIRED COMPONENTS PER MODULE)
-- ==============================================================================
-- Rule: Every theory module, whether Module 1, 6, 7, 8, 12, etc., MUST contain:
-- 1. Theory overview & concepts
-- 2. Short learning video (<= 7 mins micro-lesson)
-- 3. Supporting learning resources
-- 4. Knowledge checks / assessment
-- 5. Guided practical laboratory
-- 6. Practical assignment
-- 7. Troubleshooting guidance
-- 8. "Need Help?" / mentor support option
CREATE TABLE IF NOT EXISTS public.course_modules (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  module_number INTEGER NOT NULL, -- 1, 2, 3... N
  order_index INTEGER NOT NULL DEFAULT 1,
  title TEXT NOT NULL,
  coherent_skill_area TEXT NOT NULL, -- Principle: ONE MODULE = ONE COHERENT SKILL/KNOWLEDGE AREA
  description TEXT,
  duration_minutes INTEGER DEFAULT 60,
  
  -- Component 1: Theory Overview & Key Concepts
  theory_overview TEXT,
  theory_key_concepts TEXT[] DEFAULT '{}',
  
  -- Component 2: Short Learning Video (Micro-Lesson)
  video_url TEXT,
  video_title TEXT,
  video_duration_seconds INTEGER DEFAULT 360,
  
  -- Component 5: Guided Practical Laboratory
  guided_lab_title TEXT,
  guided_lab_instructions TEXT,
  guided_lab_equipment TEXT[] DEFAULT '{}',
  guided_lab_steps JSONB DEFAULT '[]',
  guided_lab_safety_rules TEXT[] DEFAULT '{}',
  guided_lab_simulation_url TEXT, -- e.g. Wokwi / Tinkercad embed
  
  -- Component 6: Practical Assignment
  assignment_title TEXT,
  assignment_instructions TEXT,
  assignment_rubric JSONB DEFAULT '[]',
  assignment_max_points INTEGER DEFAULT 100,
  
  -- Component 7: Troubleshooting Guidance
  troubleshooting_guide TEXT,
  troubleshooting_bench_tests JSONB DEFAULT '[]',
  
  -- Component 8: "Need Help?" / Mentor Support Option
  mentor_support_topic TEXT,
  mentor_support_channel TEXT DEFAULT 'live_room_or_discord',
  
  -- Publishing & Governance (Admin Curriculum Control)
  is_published BOOLEAN DEFAULT TRUE,
  is_draft BOOLEAN DEFAULT FALSE,
  prerequisites UUID[] DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(course_id, module_number)
);

ALTER TABLE public.course_modules ADD COLUMN IF NOT EXISTS coherent_skill_area TEXT;
ALTER TABLE public.course_modules ADD COLUMN IF NOT EXISTS guided_lab_title TEXT;
ALTER TABLE public.course_modules ADD COLUMN IF NOT EXISTS guided_lab_instructions TEXT;
ALTER TABLE public.course_modules ADD COLUMN IF NOT EXISTS guided_lab_equipment TEXT[] DEFAULT '{}';
ALTER TABLE public.course_modules ADD COLUMN IF NOT EXISTS guided_lab_steps JSONB DEFAULT '[]';
ALTER TABLE public.course_modules ADD COLUMN IF NOT EXISTS guided_lab_safety_rules TEXT[] DEFAULT '{}';
ALTER TABLE public.course_modules ADD COLUMN IF NOT EXISTS guided_lab_simulation_url TEXT;
ALTER TABLE public.course_modules ADD COLUMN IF NOT EXISTS assignment_title TEXT;
ALTER TABLE public.course_modules ADD COLUMN IF NOT EXISTS assignment_instructions TEXT;
ALTER TABLE public.course_modules ADD COLUMN IF NOT EXISTS assignment_rubric JSONB DEFAULT '[]';
ALTER TABLE public.course_modules ADD COLUMN IF NOT EXISTS assignment_max_points INTEGER DEFAULT 100;
ALTER TABLE public.course_modules ADD COLUMN IF NOT EXISTS troubleshooting_guide TEXT;
ALTER TABLE public.course_modules ADD COLUMN IF NOT EXISTS troubleshooting_bench_tests JSONB DEFAULT '[]';
ALTER TABLE public.course_modules ADD COLUMN IF NOT EXISTS mentor_support_topic TEXT;
ALTER TABLE public.course_modules ADD COLUMN IF NOT EXISTS mentor_support_channel TEXT DEFAULT 'live_room_or_discord';
ALTER TABLE public.course_modules ADD COLUMN IF NOT EXISTS is_draft BOOLEAN DEFAULT FALSE;
ALTER TABLE public.course_modules ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT TRUE;
ALTER TABLE public.course_modules ADD COLUMN IF NOT EXISTS module_number INTEGER;
ALTER TABLE public.course_modules ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE public.course_modules ADD COLUMN IF NOT EXISTS coherent_skill_area TEXT;
ALTER TABLE public.course_modules ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.course_modules ADD COLUMN IF NOT EXISTS theory_overview TEXT;
ALTER TABLE public.course_modules ADD COLUMN IF NOT EXISTS video_url TEXT;
ALTER TABLE public.course_modules ADD COLUMN IF NOT EXISTS video_title TEXT;
ALTER TABLE public.course_modules ADD COLUMN IF NOT EXISTS video_duration_seconds INTEGER DEFAULT 360;

-- ==============================================================================
-- 06. LMS CORE — LESSONS & LEARNING RESOURCES
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.course_lessons (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  module_id UUID NOT NULL REFERENCES public.course_modules(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  lesson_number INTEGER NOT NULL DEFAULT 1,
  order_index INTEGER NOT NULL DEFAULT 1,
  description TEXT,
  content_markdown TEXT,
  video_url TEXT,
  video_duration_seconds INTEGER DEFAULT 0,
  audio_url TEXT,
  is_free_preview BOOLEAN DEFAULT FALSE,
  practical_activity TEXT,
  simulation_link TEXT,
  code_snippet TEXT,
  language TEXT DEFAULT 'cpp',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Component 3: Supporting Learning Resources
CREATE TABLE IF NOT EXISTS public.course_resources (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  module_id UUID REFERENCES public.course_modules(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES public.course_lessons(id) ON DELETE CASCADE,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  resource_type TEXT NOT NULL CHECK (resource_type IN ('pdf', 'document', 'image', 'presentation', 'link', 'code', 'schematic', 'datasheet')),
  file_url TEXT NOT NULL,
  file_size_bytes BIGINT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ==============================================================================
-- 07. LMS CORE — ASSESSMENTS & KNOWLEDGE CHECKS (Component 4)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.quizzes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  module_id UUID REFERENCES public.course_modules(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES public.course_lessons(id) ON DELETE CASCADE,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  passing_score_percentage INTEGER DEFAULT 70,
  time_limit_minutes INTEGER DEFAULT 15,
  is_mandatory BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.quiz_questions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type TEXT DEFAULT 'multiple_choice' CHECK (question_type IN ('multiple_choice', 'true_false', 'code_output', 'short_answer')),
  options JSONB NOT NULL, -- Array of strings
  correct_option_index INTEGER NOT NULL,
  explanation TEXT,
  order_index INTEGER DEFAULT 0,
  points INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS public.quiz_submissions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  score_percentage INTEGER NOT NULL,
  passed BOOLEAN NOT NULL,
  answers JSONB NOT NULL,
  submitted_at TIMESTAMPTZ DEFAULT now()
);

-- ==============================================================================
-- 08. LMS CORE — LEVEL CAPSTONE PROJECTS
-- ==============================================================================
-- Requirement:
-- After the necessary theory modules have been completed, the learner must complete:
-- 1. RESEARCH & DESIGN PROJECT
-- followed by:
-- 2. ASSIGNED FINAL DESIGN PROJECT
-- The projects must integrate knowledge from ALL modules in that level.
CREATE TABLE IF NOT EXISTS public.course_projects (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  project_type TEXT NOT NULL CHECK (project_type IN ('research_and_design', 'assigned_final_design')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  guidelines TEXT NOT NULL,
  rubric JSONB NOT NULL DEFAULT '[]',
  deliverables_required TEXT[] NOT NULL DEFAULT '{}',
  order_index INTEGER DEFAULT 1,
  is_mandatory BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Idempotent Column Existence Guards for course_projects
ALTER TABLE public.course_projects ADD COLUMN IF NOT EXISTS course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE;
ALTER TABLE public.course_projects ADD COLUMN IF NOT EXISTS project_type TEXT;
ALTER TABLE public.course_projects ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE public.course_projects ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.course_projects ADD COLUMN IF NOT EXISTS guidelines TEXT;
ALTER TABLE public.course_projects ADD COLUMN IF NOT EXISTS rubric JSONB DEFAULT '[]';
ALTER TABLE public.course_projects ADD COLUMN IF NOT EXISTS deliverables_required TEXT[] DEFAULT '{}';
ALTER TABLE public.course_projects ADD COLUMN IF NOT EXISTS order_index INTEGER DEFAULT 1;
ALTER TABLE public.course_projects ADD COLUMN IF NOT EXISTS is_mandatory BOOLEAN DEFAULT TRUE;

CREATE TABLE IF NOT EXISTS public.course_project_submissions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.course_projects(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  problem_statement TEXT NOT NULL,
  background_research TEXT,
  system_architecture_doc_url TEXT,
  schematic_or_simulation_url TEXT,
  source_code_repo_url TEXT,
  prototype_demo_video_url TEXT,
  bom_items JSONB DEFAULT '[]',
  total_bom_cost_usd DECIMAL(10,2) DEFAULT 0.00,
  testing_results_summary TEXT,
  status TEXT DEFAULT 'submitted' CHECK (status IN ('draft', 'submitted', 'under_review', 'revision_requested', 'approved', 'rejected')),
  score_percentage INTEGER,
  rubric_evaluations JSONB DEFAULT '{}',
  evaluator_feedback TEXT,
  reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  submitted_at TIMESTAMPTZ DEFAULT now()
);

-- ==============================================================================
-- 09. LMS CORE — DYNAMIC PROGRESS & COMPLETION TRACKING
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.module_progress (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  module_id UUID NOT NULL REFERENCES public.course_modules(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  
  -- Progress on all 8 components
  theory_completed BOOLEAN DEFAULT FALSE,
  video_watched BOOLEAN DEFAULT FALSE,
  quiz_passed BOOLEAN DEFAULT FALSE,
  quiz_score INTEGER DEFAULT 0,
  guided_lab_completed BOOLEAN DEFAULT FALSE,
  guided_lab_notes TEXT,
  assignment_submitted BOOLEAN DEFAULT FALSE,
  assignment_submission_url TEXT,
  assignment_score INTEGER,
  troubleshooting_reviewed BOOLEAN DEFAULT FALSE,
  
  is_fully_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, module_id)
);

CREATE TABLE IF NOT EXISTS public.course_enrollments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'dropped')),
  
  -- Dynamic Completion Metrics
  completed_modules INTEGER DEFAULT 0,
  total_modules INTEGER DEFAULT 0,
  completed_labs INTEGER DEFAULT 0,
  completed_assignments INTEGER DEFAULT 0,
  research_project_passed BOOLEAN DEFAULT FALSE,
  final_design_project_passed BOOLEAN DEFAULT FALSE,
  level_exam_passed BOOLEAN DEFAULT FALSE,
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage BETWEEN 0 AND 100),
  
  enrolled_at TIMESTAMPTZ DEFAULT now(),
  last_accessed_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  certificate_id TEXT,
  UNIQUE(course_id, user_id)
);

-- Idempotent column upgrades for enrollments
ALTER TABLE public.course_enrollments ADD COLUMN IF NOT EXISTS completed_modules INTEGER DEFAULT 0;
ALTER TABLE public.course_enrollments ADD COLUMN IF NOT EXISTS completed_labs INTEGER DEFAULT 0;
ALTER TABLE public.course_enrollments ADD COLUMN IF NOT EXISTS completed_assignments INTEGER DEFAULT 0;
ALTER TABLE public.course_enrollments ADD COLUMN IF NOT EXISTS research_project_passed BOOLEAN DEFAULT FALSE;
ALTER TABLE public.course_enrollments ADD COLUMN IF NOT EXISTS final_design_project_passed BOOLEAN DEFAULT FALSE;
ALTER TABLE public.course_enrollments ADD COLUMN IF NOT EXISTS level_exam_passed BOOLEAN DEFAULT FALSE;
ALTER TABLE public.course_enrollments ADD COLUMN IF NOT EXISTS total_modules INTEGER DEFAULT 0;
ALTER TABLE public.course_enrollments ADD COLUMN IF NOT EXISTS progress_percentage INTEGER DEFAULT 0;
ALTER TABLE public.course_enrollments ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';
ALTER TABLE public.course_enrollments ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;
ALTER TABLE public.course_enrollments ADD COLUMN IF NOT EXISTS last_accessed_at TIMESTAMPTZ DEFAULT now();

-- MASTER DYNAMIC COURSE COMPLETION STORED PROCEDURE
-- Rule: The LMS must dynamically determine the total number of modules.
-- Do not mark a Robotics Level complete merely because the learner completed 6 modules.
-- The learner must complete ALL N modules defined for that level + 2 Projects + Exam.
CREATE OR REPLACE FUNCTION public.refresh_course_progress(
  p_user_id UUID,
  p_course_id UUID
) RETURNS VOID AS $$
DECLARE
  v_total_modules INTEGER;
  v_completed_modules INTEGER;
  v_total_labs INTEGER;
  v_completed_labs INTEGER;
  v_total_assignments INTEGER;
  v_completed_assignments INTEGER;
  v_research_passed BOOLEAN;
  v_final_passed BOOLEAN;
  v_exam_passed BOOLEAN;
  v_pct INTEGER := 0;
  v_is_all_done BOOLEAN := FALSE;
BEGIN
  -- 1. Dynamically count total published modules defined for this course
  SELECT COUNT(*) INTO v_total_modules
  FROM public.course_modules
  WHERE course_id = p_course_id AND is_published = TRUE;

  IF v_total_modules IS NULL OR v_total_modules = 0 THEN
    v_total_modules := 1;
  END IF;

  -- 2. Count completed modules
  SELECT COUNT(*) INTO v_completed_modules
  FROM public.module_progress mp
  JOIN public.course_modules cm ON mp.module_id = cm.id
  WHERE mp.user_id = p_user_id AND cm.course_id = p_course_id AND mp.is_fully_completed = TRUE;

  -- 3. Count completed guided practical labs
  SELECT COUNT(*) INTO v_completed_labs
  FROM public.module_progress mp
  JOIN public.course_modules cm ON mp.module_id = cm.id
  WHERE mp.user_id = p_user_id AND cm.course_id = p_course_id AND mp.guided_lab_completed = TRUE;

  -- 4. Count completed practical assignments
  SELECT COUNT(*) INTO v_completed_assignments
  FROM public.module_progress mp
  JOIN public.course_modules cm ON mp.module_id = cm.id
  WHERE mp.user_id = p_user_id AND cm.course_id = p_course_id AND mp.assignment_submitted = TRUE;

  -- 5. Check Research & Design Project approval
  SELECT EXISTS(
    SELECT 1 FROM public.course_project_submissions cps
    JOIN public.course_projects cp ON cps.project_id = cp.id
    WHERE cps.user_id = p_user_id AND cp.course_id = p_course_id 
      AND cp.project_type = 'research_and_design' AND cps.status = 'approved'
  ) INTO v_research_passed;

  -- 6. Check Assigned Final Design Project approval
  SELECT EXISTS(
    SELECT 1 FROM public.course_project_submissions cps
    JOIN public.course_projects cp ON cps.project_id = cp.id
    WHERE cps.user_id = p_user_id AND cp.course_id = p_course_id 
      AND cp.project_type = 'assigned_final_design' AND cps.status = 'approved'
  ) INTO v_final_passed;

  -- 7. Check Level Exam
  SELECT EXISTS(
    SELECT 1 FROM public.quiz_submissions qs
    JOIN public.quizzes q ON qs.quiz_id = q.id
    WHERE qs.user_id = p_user_id AND q.course_id = p_course_id AND qs.passed = TRUE
  ) INTO v_exam_passed;

  -- 8. Compute weighted progress percentage
  -- Theory Modules: 60%, Research Project: 15%, Final Design Project: 15%, Level Exam: 10%
  v_pct := ROUND(
    (LEAST(v_completed_modules, v_total_modules)::DECIMAL / v_total_modules::DECIMAL * 60.0) +
    (CASE WHEN v_research_passed THEN 15.0 ELSE 0.0 END) +
    (CASE WHEN v_final_passed THEN 15.0 ELSE 0.0 END) +
    (CASE WHEN v_exam_passed THEN 10.0 ELSE 0.0 END)
  );

  IF v_pct > 100 THEN v_pct := 100; END IF;

  -- Course is completed ONLY when ALL modules, BOTH projects, and exam are completed
  v_is_all_done := (v_completed_modules >= v_total_modules) AND v_research_passed AND v_final_passed AND v_exam_passed;

  -- 9. Upsert into enrollments table
  INSERT INTO public.course_enrollments (
    user_id, course_id, total_modules, completed_modules, completed_labs,
    completed_assignments, research_project_passed, final_design_project_passed,
    level_exam_passed, progress_percentage, status, completed_at, last_accessed_at
  ) VALUES (
    p_user_id, p_course_id, v_total_modules, v_completed_modules, v_completed_labs,
    v_completed_assignments, v_research_passed, v_final_passed,
    v_exam_passed, v_pct,
    CASE WHEN v_is_all_done THEN 'completed' ELSE 'active' END,
    CASE WHEN v_is_all_done THEN now() ELSE NULL END,
    now()
  ) ON CONFLICT (course_id, user_id) DO UPDATE SET
    total_modules = EXCLUDED.total_modules,
    completed_modules = EXCLUDED.completed_modules,
    completed_labs = EXCLUDED.completed_labs,
    completed_assignments = EXCLUDED.completed_assignments,
    research_project_passed = EXCLUDED.research_project_passed,
    final_design_project_passed = EXCLUDED.final_design_project_passed,
    level_exam_passed = EXCLUDED.level_exam_passed,
    progress_percentage = EXCLUDED.progress_percentage,
    status = EXCLUDED.status,
    completed_at = CASE WHEN EXCLUDED.status = 'completed' AND public.course_enrollments.completed_at IS NULL THEN now() ELSE public.course_enrollments.completed_at END,
    last_accessed_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================================================
-- 10. ADMIN & INSTRUCTOR CURRICULUM CONTROL
-- ==============================================================================
-- Stored procedures allowing curriculum expansion without frontend changes:
CREATE OR REPLACE FUNCTION public.admin_add_course_module(
  p_course_id UUID,
  p_title TEXT,
  p_coherent_skill_area TEXT,
  p_description TEXT,
  p_theory_overview TEXT,
  p_video_url TEXT,
  p_guided_lab_title TEXT,
  p_guided_lab_instructions TEXT,
  p_assignment_title TEXT,
  p_assignment_instructions TEXT,
  p_troubleshooting_guide TEXT,
  p_mentor_support_topic TEXT
) RETURNS UUID AS $$
DECLARE
  v_next_num INTEGER;
  v_new_id UUID;
BEGIN
  SELECT COALESCE(MAX(module_number), 0) + 1 INTO v_next_num
  FROM public.course_modules
  WHERE course_id = p_course_id;

  INSERT INTO public.course_modules (
    course_id, module_number, order_index, title, coherent_skill_area,
    description, theory_overview, video_url, guided_lab_title,
    guided_lab_instructions, assignment_title, assignment_instructions,
    troubleshooting_guide, mentor_support_topic, is_published, is_draft
  ) VALUES (
    p_course_id, v_next_num, v_next_num, p_title, p_coherent_skill_area,
    p_description, p_theory_overview, p_video_url, p_guided_lab_title,
    p_guided_lab_instructions, p_assignment_title, p_assignment_instructions,
    p_troubleshooting_guide, p_mentor_support_topic, TRUE, FALSE
  ) RETURNING id INTO v_new_id;

  -- Update course total_modules count
  UPDATE public.courses
  SET total_modules = (SELECT COUNT(*) FROM public.course_modules WHERE course_id = p_course_id AND is_published = TRUE),
      updated_at = now()
  WHERE id = p_course_id;

  RETURN v_new_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================================================
-- 11. TEACHER & ROBOTICS PATRON HUB
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.teacher_lesson_plans (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  curriculum_framework TEXT DEFAULT 'ZIMSEC / Cambridge STEM',
  grade_level TEXT NOT NULL,
  subject TEXT DEFAULT 'Robotics & Computer Science',
  duration_minutes INTEGER DEFAULT 45,
  learning_objectives TEXT[] NOT NULL,
  materials_required TEXT[] NOT NULL,
  hook_5_mins TEXT NOT NULL,
  direct_instruction_15_mins TEXT NOT NULL,
  guided_practice_15_mins TEXT NOT NULL,
  exit_ticket_5_mins TEXT NOT NULL,
  document_url TEXT,
  is_verified_by_yara BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.competition_prep_guides (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Differential Drive Chassis', 'Underwater ROV Buoyancy', 'PID Line Following', 'Finite State Machines', 'Bench Troubleshooting', 'Pre-Arena Inspection', '6-Week Drill Schedule')),
  difficulty TEXT DEFAULT 'All Levels',
  reading_time_mins INTEGER DEFAULT 12,
  summary TEXT NOT NULL,
  content_markdown TEXT NOT NULL,
  schematic_or_diagram_url TEXT,
  downloadable_pdf_url TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.robotics_inspection_checklists (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  team_id UUID,
  inspector_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  chassis_dimensions_passed BOOLEAN DEFAULT FALSE,
  weight_under_limit_passed BOOLEAN DEFAULT FALSE,
  power_switch_accessible_passed BOOLEAN DEFAULT FALSE,
  wiring_insulated_passed BOOLEAN DEFAULT FALSE,
  fail_safe_estop_passed BOOLEAN DEFAULT FALSE,
  gender_parity_verified BOOLEAN DEFAULT FALSE,
  overall_status TEXT DEFAULT 'pending' CHECK (overall_status IN ('pending', 'passed', 'reinspection_required')),
  inspector_notes TEXT,
  inspected_at TIMESTAMPTZ
);

-- ==============================================================================
-- 12. COMPETITION MANAGEMENT ECOSYSTEM (YARA 2026 ARENA)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.competitions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  year INTEGER NOT NULL DEFAULT 2026,
  theme TEXT NOT NULL,
  description TEXT NOT NULL,
  venue TEXT NOT NULL,
  banner_url TEXT,
  registration_deadline TIMESTAMPTZ,
  competition_date TIMESTAMPTZ,
  prize_pool_summary TEXT,
  status TEXT DEFAULT 'registration_open' CHECK (status IN ('draft', 'registration_open', 'registration_closed', 'live', 'completed')),
  rulebook_pdf_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Idempotent Column Existence Guards for competitions
ALTER TABLE public.competitions ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE public.competitions ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE public.competitions ADD COLUMN IF NOT EXISTS year INTEGER DEFAULT 2026;
ALTER TABLE public.competitions ADD COLUMN IF NOT EXISTS theme TEXT;
ALTER TABLE public.competitions ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.competitions ADD COLUMN IF NOT EXISTS venue TEXT;
ALTER TABLE public.competitions ADD COLUMN IF NOT EXISTS banner_url TEXT;
ALTER TABLE public.competitions ADD COLUMN IF NOT EXISTS registration_deadline TIMESTAMPTZ;
ALTER TABLE public.competitions ADD COLUMN IF NOT EXISTS competition_date TIMESTAMPTZ;
ALTER TABLE public.competitions ADD COLUMN IF NOT EXISTS prize_pool_summary TEXT;
ALTER TABLE public.competitions ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'registration_open';
ALTER TABLE public.competitions ADD COLUMN IF NOT EXISTS rulebook_pdf_url TEXT;
ALTER TABLE public.competitions ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT TRUE;
ALTER TABLE public.competitions ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE public.competitions ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

CREATE TABLE IF NOT EXISTS public.competition_categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  competition_id UUID NOT NULL REFERENCES public.competitions(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  weight_percentage INTEGER DEFAULT 33,
  max_score INTEGER DEFAULT 100,
  order_index INTEGER DEFAULT 0
);

-- Idempotent Column Existence Guards for competition_categories
ALTER TABLE public.competition_categories ADD COLUMN IF NOT EXISTS competition_id UUID REFERENCES public.competitions(id) ON DELETE CASCADE;
ALTER TABLE public.competition_categories ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE public.competition_categories ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.competition_categories ADD COLUMN IF NOT EXISTS weight_percentage INTEGER DEFAULT 33;
ALTER TABLE public.competition_categories ADD COLUMN IF NOT EXISTS max_score INTEGER DEFAULT 100;
ALTER TABLE public.competition_categories ADD COLUMN IF NOT EXISTS order_index INTEGER DEFAULT 0;

CREATE TABLE IF NOT EXISTS public.competition_teams (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  competition_id UUID NOT NULL REFERENCES public.competitions(id) ON DELETE CASCADE,
  school_id UUID REFERENCES public.schools(id) ON DELETE SET NULL,
  team_name TEXT NOT NULL,
  team_code TEXT UNIQUE,
  school_name TEXT NOT NULL,
  coach_name TEXT NOT NULL,
  coach_email TEXT NOT NULL,
  coach_phone TEXT,
  robot_name TEXT,
  category_id UUID REFERENCES public.competition_categories(id) ON DELETE SET NULL,
  
  -- Mandatory Gender Parity Rule: 2 Boys + 2 Girls (4 members)
  boy1_name TEXT NOT NULL,
  boy2_name TEXT NOT NULL,
  girl1_name TEXT NOT NULL,
  girl2_name TEXT NOT NULL,
  
  technical_summary TEXT,
  robot_photo_url TEXT,
  registration_status TEXT DEFAULT 'pending' CHECK (registration_status IN ('pending', 'approved', 'rejected', 'waitlist')),
  checked_in_at_venue BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.competition_teams ADD COLUMN IF NOT EXISTS boy1_name TEXT;
ALTER TABLE public.competition_teams ADD COLUMN IF NOT EXISTS boy2_name TEXT;
ALTER TABLE public.competition_teams ADD COLUMN IF NOT EXISTS girl1_name TEXT;
ALTER TABLE public.competition_teams ADD COLUMN IF NOT EXISTS girl2_name TEXT;
ALTER TABLE public.competition_teams ADD COLUMN IF NOT EXISTS school_name TEXT;
ALTER TABLE public.competition_teams ADD COLUMN IF NOT EXISTS coach_name TEXT;
ALTER TABLE public.competition_teams ADD COLUMN IF NOT EXISTS coach_email TEXT;
ALTER TABLE public.competition_teams ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE public.competition_teams ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';
ALTER TABLE public.competition_teams ADD COLUMN IF NOT EXISTS province TEXT DEFAULT 'National';
ALTER TABLE public.competition_teams ADD COLUMN IF NOT EXISTS district TEXT;
ALTER TABLE public.competition_teams ADD COLUMN IF NOT EXISTS city_town TEXT;
ALTER TABLE public.competition_teams ADD COLUMN IF NOT EXISTS participant_type TEXT DEFAULT 'School';
ALTER TABLE public.competition_teams ADD COLUMN IF NOT EXISTS boys_count INTEGER DEFAULT 2;
ALTER TABLE public.competition_teams ADD COLUMN IF NOT EXISTS girls_count INTEGER DEFAULT 2;
ALTER TABLE public.competition_teams ADD COLUMN IF NOT EXISTS total_members INTEGER DEFAULT 4;
ALTER TABLE public.competition_teams ADD COLUMN IF NOT EXISTS is_gender_eligible BOOLEAN DEFAULT TRUE;
ALTER TABLE public.competition_teams ADD COLUMN IF NOT EXISTS underwater_drone_info JSONB DEFAULT '{}';
ALTER TABLE public.competition_teams ADD COLUMN IF NOT EXISTS autonomous_maze_info JSONB DEFAULT '{}';
ALTER TABLE public.competition_teams ADD COLUMN IF NOT EXISTS innovation_pitch_info JSONB DEFAULT '{}';
ALTER TABLE public.competition_teams ADD COLUMN IF NOT EXISTS documents JSONB DEFAULT '[]';
ALTER TABLE public.competition_teams ADD COLUMN IF NOT EXISTS consents JSONB DEFAULT '{}';
ALTER TABLE public.competition_teams ADD COLUMN IF NOT EXISTS video_demo_url TEXT;
ALTER TABLE public.competition_teams ADD COLUMN IF NOT EXISTS admin_notes TEXT;
ALTER TABLE public.competition_teams ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

DO $$
BEGIN
  BEGIN ALTER TABLE public.competition_teams ALTER COLUMN boy1_name DROP NOT NULL; EXCEPTION WHEN OTHERS THEN NULL; END;
  BEGIN ALTER TABLE public.competition_teams ALTER COLUMN boy2_name DROP NOT NULL; EXCEPTION WHEN OTHERS THEN NULL; END;
  BEGIN ALTER TABLE public.competition_teams ALTER COLUMN girl1_name DROP NOT NULL; EXCEPTION WHEN OTHERS THEN NULL; END;
  BEGIN ALTER TABLE public.competition_teams ALTER COLUMN girl2_name DROP NOT NULL; EXCEPTION WHEN OTHERS THEN NULL; END;
  BEGIN ALTER TABLE public.competition_teams ALTER COLUMN school_name DROP NOT NULL; EXCEPTION WHEN OTHERS THEN NULL; END;
  BEGIN ALTER TABLE public.competition_teams ALTER COLUMN coach_name DROP NOT NULL; EXCEPTION WHEN OTHERS THEN NULL; END;
  BEGIN ALTER TABLE public.competition_teams ALTER COLUMN coach_email DROP NOT NULL; EXCEPTION WHEN OTHERS THEN NULL; END;
END $$;

CREATE TABLE IF NOT EXISTS public.competition_scores (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  team_id UUID NOT NULL REFERENCES public.competition_teams(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.competition_categories(id) ON DELETE CASCADE,
  judge_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  judge_name TEXT NOT NULL,
  run_number INTEGER DEFAULT 1,
  
  -- Scoring rubric dimensions
  engineering_design_score INTEGER DEFAULT 0 CHECK (engineering_design_score BETWEEN 0 AND 30),
  autonomous_navigation_score INTEGER DEFAULT 0 CHECK (autonomous_navigation_score BETWEEN 0 AND 35),
  community_pitch_score INTEGER DEFAULT 0 CHECK (community_pitch_score BETWEEN 0 AND 20),
  gender_collaboration_score INTEGER DEFAULT 0 CHECK (gender_collaboration_score BETWEEN 0 AND 15),
  
  penalties INTEGER DEFAULT 0,
  total_score INTEGER GENERATED ALWAYS AS (
    engineering_design_score + autonomous_navigation_score + community_pitch_score + gender_collaboration_score - penalties
  ) STORED,
  time_seconds DECIMAL(6,2),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ==============================================================================
-- 13. ACCREDITED DIGITAL CERTIFICATES & VERIFICATION
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.certificates (
  id TEXT PRIMARY KEY, -- e.g. 'YARA-CERT-2026-8492'
  certificate_number TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  student_name TEXT NOT NULL,
  course_id UUID REFERENCES public.courses(id) ON DELETE SET NULL,
  course_title TEXT NOT NULL,
  level_number INTEGER DEFAULT 1,
  score INTEGER NOT NULL DEFAULT 85,
  grade TEXT NOT NULL DEFAULT 'Distinction' CHECK (grade IN ('Distinction', 'Merit', 'Pass', 'Excellence')),
  issue_date TIMESTAMPTZ DEFAULT now(),
  issuing_authority TEXT DEFAULT 'Young Africans Robotics Association (YARA)',
  president_signature_name TEXT DEFAULT 'Simbarashe Manongwa',
  president_title TEXT DEFAULT 'President & Technical Director, YARA',
  verification_qr_hash TEXT UNIQUE,
  pdf_download_url TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.certificate_verification_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  certificate_number TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  queried_at TIMESTAMPTZ DEFAULT now()
);

-- ==============================================================================
-- 14. EVENTS & WORKSHOPS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  event_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  venue TEXT NOT NULL,
  image_url TEXT,
  registration_link TEXT,
  capacity INTEGER DEFAULT 100,
  registered_count INTEGER DEFAULT 0,
  fee_usd DECIMAL(10,2) DEFAULT 0.00,
  is_upcoming BOOLEAN DEFAULT TRUE,
  category TEXT DEFAULT 'stem',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.event_registrations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  institution TEXT,
  status TEXT DEFAULT 'confirmed' CHECK (status IN ('pending', 'confirmed', 'attended', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ==============================================================================
-- 15. IN-APP NOTIFICATIONS & REAL-TIME ALERTS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'system' CHECK (type IN ('system', 'competition', 'course', 'assignment', 'event', 'certificate', 'mention')),
  action_url TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ==============================================================================
-- 16. HARDWARE PROJECTS, IDEAS & COMMUNITY COLLABORATION
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  thematic_area TEXT DEFAULT 'Agriculture',
  components_used TEXT[] DEFAULT '{}',
  cost_estimate_usd DECIMAL(10,2) DEFAULT 0.00,
  status TEXT DEFAULT 'in_progress' CHECK (status IN ('idea', 'in_progress', 'completed', 'prototyped')),
  github_url TEXT,
  schematic_url TEXT,
  video_demo_url TEXT,
  photo_urls TEXT[] DEFAULT '{}',
  upvotes_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.ideas (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  problem_solved TEXT,
  african_context TEXT,
  tags TEXT[] DEFAULT '{}',
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.ideas ADD COLUMN IF NOT EXISTS author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.ideas ADD COLUMN IF NOT EXISTS author_name TEXT;
ALTER TABLE public.ideas ADD COLUMN IF NOT EXISTS content TEXT;
ALTER TABLE public.ideas ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE public.ideas ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.ideas ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;

DO $$
BEGIN
  BEGIN ALTER TABLE public.ideas ALTER COLUMN title DROP NOT NULL; EXCEPTION WHEN OTHERS THEN NULL; END;
  BEGIN ALTER TABLE public.ideas ALTER COLUMN description DROP NOT NULL; EXCEPTION WHEN OTHERS THEN NULL; END;
  BEGIN ALTER TABLE public.ideas ALTER COLUMN user_id DROP NOT NULL; EXCEPTION WHEN OTHERS THEN NULL; END;
END $$;

-- ==============================================================================
-- 17. INDUSTRIAL MENTORSHIP & LIVE BROADCAST WORKSPACES
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.mentorship_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  mentor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER DEFAULT 45,
  topic TEXT NOT NULL,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('pending', 'scheduled', 'completed', 'cancelled')),
  meeting_room_id TEXT,
  mentor_notes TEXT,
  student_feedback TEXT,
  rating INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.live_rooms (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  host_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  host_name TEXT NOT NULL,
  description TEXT,
  is_live BOOLEAN DEFAULT FALSE,
  participants_count INTEGER DEFAULT 0,
  recording_url TEXT,
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ
);

-- ==============================================================================
-- 18. PROVINCIAL & UNIVERSITY CHAPTERS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.chapters (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  province TEXT NOT NULL,
  city TEXT NOT NULL,
  lead_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT,
  members_count INTEGER DEFAULT 0,
  schools_mentored_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'forming', 'inactive')),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.chapters ADD COLUMN IF NOT EXISTS code TEXT;
ALTER TABLE public.chapters ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'university';
ALTER TABLE public.chapters ADD COLUMN IF NOT EXISTS institution_or_community TEXT;
ALTER TABLE public.chapters ADD COLUMN IF NOT EXISTS district_or_city TEXT;
ALTER TABLE public.chapters ADD COLUMN IF NOT EXISTS banner_url TEXT;
ALTER TABLE public.chapters ADD COLUMN IF NOT EXISTS logo_url TEXT;
ALTER TABLE public.chapters ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.chapters ADD COLUMN IF NOT EXISTS established_date DATE DEFAULT CURRENT_DATE;
ALTER TABLE public.chapters ADD COLUMN IF NOT EXISTS approval_status TEXT DEFAULT 'approved';
ALTER TABLE public.chapters ADD COLUMN IF NOT EXISTS registration_request_id UUID;
ALTER TABLE public.chapters ADD COLUMN IF NOT EXISTS is_provincial_lead_university BOOLEAN DEFAULT FALSE;
ALTER TABLE public.chapters ADD COLUMN IF NOT EXISTS assigned_provincial_university_id UUID;
ALTER TABLE public.chapters ADD COLUMN IF NOT EXISTS assigned_provincial_university_name TEXT;
ALTER TABLE public.chapters ADD COLUMN IF NOT EXISTS supervised_chapter_count INTEGER DEFAULT 0;
ALTER TABLE public.chapters ADD COLUMN IF NOT EXISTS total_members_count INTEGER DEFAULT 0;
ALTER TABLE public.chapters ADD COLUMN IF NOT EXISTS active_projects_count INTEGER DEFAULT 0;
ALTER TABLE public.chapters ADD COLUMN IF NOT EXISTS motto TEXT;
ALTER TABLE public.chapters ADD COLUMN IF NOT EXISTS website_url TEXT;
ALTER TABLE public.chapters ADD COLUMN IF NOT EXISTS public_email TEXT;
ALTER TABLE public.chapters ADD COLUMN IF NOT EXISTS public_phone TEXT;
ALTER TABLE public.chapters ADD COLUMN IF NOT EXISTS public_social_links JSONB DEFAULT '{}';
ALTER TABLE public.chapters ADD COLUMN IF NOT EXISTS meeting_schedule TEXT;
ALTER TABLE public.chapters ADD COLUMN IF NOT EXISTS physical_location TEXT;
ALTER TABLE public.chapters ADD COLUMN IF NOT EXISTS focus_areas TEXT[] DEFAULT '{}';
ALTER TABLE public.chapters ADD COLUMN IF NOT EXISTS leaders JSONB DEFAULT '[]';
ALTER TABLE public.chapters ADD COLUMN IF NOT EXISTS members JSONB DEFAULT '[]';
ALTER TABLE public.chapters ADD COLUMN IF NOT EXISTS projects JSONB DEFAULT '[]';
ALTER TABLE public.chapters ADD COLUMN IF NOT EXISTS activities JSONB DEFAULT '[]';
ALTER TABLE public.chapters ADD COLUMN IF NOT EXISTS patron_advisor JSONB DEFAULT '{}';
ALTER TABLE public.chapters ADD COLUMN IF NOT EXISTS confidential_info JSONB DEFAULT '{}';
ALTER TABLE public.chapters ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- ==============================================================================
-- 19. CMS, ANNOUNCEMENTS, IMPACT LEDGER & PARTNERS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.organization_posts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  slug TEXT UNIQUE,
  summary TEXT,
  content_markdown TEXT NOT NULL,
  category TEXT DEFAULT 'announcement' CHECK (category IN ('announcement', 'press_release', 'impact_story', 'competition_update', 'curriculum')),
  featured_image_url TEXT,
  is_published BOOLEAN DEFAULT TRUE,
  views_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Idempotent Column Existence Guards for organization_posts
ALTER TABLE IF EXISTS public.organization_posts ADD COLUMN IF NOT EXISTS author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;
ALTER TABLE IF EXISTS public.organization_posts ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE IF EXISTS public.organization_posts ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE IF EXISTS public.organization_posts ADD COLUMN IF NOT EXISTS summary TEXT;
ALTER TABLE IF EXISTS public.organization_posts ADD COLUMN IF NOT EXISTS content_markdown TEXT;
ALTER TABLE IF EXISTS public.organization_posts ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'announcement';
ALTER TABLE IF EXISTS public.organization_posts ADD COLUMN IF NOT EXISTS featured_image_url TEXT;
ALTER TABLE IF EXISTS public.organization_posts ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT TRUE;
ALTER TABLE IF EXISTS public.organization_posts ADD COLUMN IF NOT EXISTS views_count INTEGER DEFAULT 0;
ALTER TABLE IF EXISTS public.organization_posts ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE IF EXISTS public.organization_posts ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

CREATE TABLE IF NOT EXISTS public.partners (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  partner_type TEXT NOT NULL CHECK (partner_type IN ('corporate', 'academic', 'government', 'ngo', 'international')),
  logo_url TEXT,
  website_url TEXT,
  description TEXT,
  country TEXT DEFAULT 'Zimbabwe',
  is_active BOOLEAN DEFAULT TRUE,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.site_content (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.impact_ledger (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  metric_key TEXT UNIQUE NOT NULL,
  metric_title TEXT NOT NULL,
  verified_value BIGINT NOT NULL,
  unit TEXT NOT NULL,
  verification_source TEXT NOT NULL,
  last_audited_at TIMESTAMPTZ DEFAULT now(),
  audited_by_title TEXT DEFAULT 'YARA Executive Secretariat'
);

-- Idempotent Column Existence Guards for impact_ledger
ALTER TABLE public.impact_ledger ADD COLUMN IF NOT EXISTS metric_key TEXT;
ALTER TABLE public.impact_ledger ADD COLUMN IF NOT EXISTS metric_title TEXT;
ALTER TABLE public.impact_ledger ADD COLUMN IF NOT EXISTS verified_value BIGINT;
ALTER TABLE public.impact_ledger ADD COLUMN IF NOT EXISTS unit TEXT;
ALTER TABLE public.impact_ledger ADD COLUMN IF NOT EXISTS verification_source TEXT;
ALTER TABLE public.impact_ledger ADD COLUMN IF NOT EXISTS last_audited_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE public.impact_ledger ADD COLUMN IF NOT EXISTS audited_by_title TEXT DEFAULT 'YARA Executive Secretariat';

-- ==============================================================================
-- 20. FINANCIAL TRANSACTIONS, GRANTS & AUDITING
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.financial_records (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  school_id UUID REFERENCES public.schools(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('registration_dues', 'hardware_grant', 'sponsorship_inflow', 'competition_entry', 'mentor_payout')),
  amount_usd DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  reference_code TEXT UNIQUE NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ==============================================================================
-- 21. PERFORMANCE INDEXES & QUERY OPTIMIZATIONS
-- ==============================================================================
-- Idempotent Column Harmonization before Performance Indexes
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'student';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS member_id TEXT;
ALTER TABLE public.schools ADD COLUMN IF NOT EXISTS province TEXT;
ALTER TABLE public.schools ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS track TEXT DEFAULT 'Robotics';
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS level TEXT DEFAULT 'Beginner';
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT TRUE;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS is_draft BOOLEAN DEFAULT FALSE;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS order_index INTEGER DEFAULT 0;
ALTER TABLE public.course_modules ADD COLUMN IF NOT EXISTS course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE;
ALTER TABLE public.course_modules ADD COLUMN IF NOT EXISTS order_index INTEGER DEFAULT 1;
ALTER TABLE public.course_modules ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT TRUE;
ALTER TABLE public.course_modules ADD COLUMN IF NOT EXISTS is_draft BOOLEAN DEFAULT FALSE;
ALTER TABLE public.course_lessons ADD COLUMN IF NOT EXISTS module_id UUID REFERENCES public.course_modules(id) ON DELETE CASCADE;
ALTER TABLE public.course_lessons ADD COLUMN IF NOT EXISTS course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE;
ALTER TABLE public.course_lessons ADD COLUMN IF NOT EXISTS order_index INTEGER DEFAULT 1;
ALTER TABLE public.course_lessons ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT TRUE;
ALTER TABLE public.module_progress ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.module_progress ADD COLUMN IF NOT EXISTS course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE;
ALTER TABLE public.course_enrollments ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.course_enrollments ADD COLUMN IF NOT EXISTS course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE;
ALTER TABLE public.course_projects ADD COLUMN IF NOT EXISTS course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE;
ALTER TABLE public.course_project_submissions ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.competition_teams ADD COLUMN IF NOT EXISTS competition_id UUID REFERENCES public.competitions(id) ON DELETE CASCADE;
ALTER TABLE public.competition_scores ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES public.competition_teams(id) ON DELETE CASCADE;
ALTER TABLE public.certificates ADD COLUMN IF NOT EXISTS certificate_number TEXT;
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT FALSE;
ALTER TABLE public.organization_posts ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT TRUE;
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_member_id ON public.profiles(member_id);
CREATE INDEX IF NOT EXISTS idx_schools_province ON public.schools(province);
CREATE INDEX IF NOT EXISTS idx_schools_is_active ON public.schools(is_active);
CREATE INDEX IF NOT EXISTS idx_courses_track ON public.courses(track);
CREATE INDEX IF NOT EXISTS idx_courses_level ON public.courses(level);
CREATE INDEX IF NOT EXISTS idx_courses_is_published ON public.courses(is_published);
CREATE INDEX IF NOT EXISTS idx_course_modules_course_id ON public.course_modules(course_id);
CREATE INDEX IF NOT EXISTS idx_course_modules_order ON public.course_modules(order_index);
CREATE INDEX IF NOT EXISTS idx_course_lessons_module_id ON public.course_lessons(module_id);
CREATE INDEX IF NOT EXISTS idx_module_progress_user ON public.module_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_module_progress_user_course ON public.module_progress(user_id, course_id);
CREATE INDEX IF NOT EXISTS idx_course_enrollments_user ON public.course_enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_course_enrollments_course ON public.course_enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_course_projects_course ON public.course_projects(course_id);
CREATE INDEX IF NOT EXISTS idx_project_submissions_user ON public.course_project_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_competition_teams_comp ON public.competition_teams(competition_id);
CREATE INDEX IF NOT EXISTS idx_competition_scores_team ON public.competition_scores(team_id);
CREATE INDEX IF NOT EXISTS idx_certificates_cert_num ON public.certificates(certificate_number);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON public.notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_org_posts_published ON public.organization_posts(is_published);

-- ==============================================================================
-- 22. ROW LEVEL SECURITY (RLS) POLICIES & BACKEND AUTHORIZATION
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_project_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.module_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competition_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_posts ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user is an admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND (
      role IN ('admin', 'super_admin') 
      OR email IN ('goyaracorp@gmail.com', 'admin@yara.org', 'director@yara.org')
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles: Public read, Self/Admin write
DO $$ BEGIN
  DROP POLICY IF EXISTS "Public profiles read" ON public.profiles;
  CREATE POLICY "Public profiles read" ON public.profiles FOR SELECT USING (true);
  
  DROP POLICY IF EXISTS "Users update own profile" ON public.profiles;
  CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id OR public.is_admin());
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- Schools: Public read, Admin write
DO $$ BEGIN
  DROP POLICY IF EXISTS "Schools viewable by all" ON public.schools;
  CREATE POLICY "Schools viewable by all" ON public.schools FOR SELECT USING (true);
  
  DROP POLICY IF EXISTS "Admins manage schools" ON public.schools;
  CREATE POLICY "Admins manage schools" ON public.schools FOR ALL USING (public.is_admin());
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- Courses: Published courses viewable by all, Admins/Instructors manage
DO $$ BEGIN
  DROP POLICY IF EXISTS "Published courses viewable by all" ON public.courses;
  CREATE POLICY "Published courses viewable by all" ON public.courses FOR SELECT USING (is_published = true OR public.is_admin());
  
  DROP POLICY IF EXISTS "Admins manage courses" ON public.courses;
  CREATE POLICY "Admins manage courses" ON public.courses FOR ALL USING (public.is_admin());
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- Modules: Published modules viewable by all, Admins/Instructors manage
DO $$ BEGIN
  DROP POLICY IF EXISTS "Published modules viewable by all" ON public.course_modules;
  CREATE POLICY "Published modules viewable by all" ON public.course_modules FOR SELECT USING (is_published = true OR public.is_admin());
  
  DROP POLICY IF EXISTS "Admins manage modules" ON public.course_modules;
  CREATE POLICY "Admins manage modules" ON public.course_modules FOR ALL USING (public.is_admin());
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- Projects: Viewable by enrolled students, Admins manage
DO $$ BEGIN
  DROP POLICY IF EXISTS "Projects viewable by all" ON public.course_projects;
  CREATE POLICY "Projects viewable by all" ON public.course_projects FOR SELECT USING (true);
  
  DROP POLICY IF EXISTS "Admins manage course projects" ON public.course_projects;
  CREATE POLICY "Admins manage course projects" ON public.course_projects FOR ALL USING (public.is_admin());
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- Project Submissions: User views/edits own, Admins evaluate
DO $$ BEGIN
  DROP POLICY IF EXISTS "Users view own submissions" ON public.course_project_submissions;
  CREATE POLICY "Users view own submissions" ON public.course_project_submissions FOR SELECT USING (auth.uid() = user_id OR public.is_admin());
  
  DROP POLICY IF EXISTS "Users submit project" ON public.course_project_submissions;
  CREATE POLICY "Users submit project" ON public.course_project_submissions FOR INSERT WITH CHECK (auth.uid() = user_id);

  DROP POLICY IF EXISTS "Users update draft submission" ON public.course_project_submissions;
  CREATE POLICY "Users update draft submission" ON public.course_project_submissions FOR UPDATE USING (auth.uid() = user_id OR public.is_admin());
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- Module Progress: User owns their progress
DO $$ BEGIN
  DROP POLICY IF EXISTS "Users view own module progress" ON public.module_progress;
  CREATE POLICY "Users view own module progress" ON public.module_progress FOR SELECT USING (auth.uid() = user_id OR public.is_admin());
  
  DROP POLICY IF EXISTS "Users upsert own module progress" ON public.module_progress;
  CREATE POLICY "Users upsert own module progress" ON public.module_progress FOR ALL USING (auth.uid() = user_id OR public.is_admin());
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- Enrollments: User owns their enrollment
DO $$ BEGIN
  DROP POLICY IF EXISTS "Users view own enrollments" ON public.course_enrollments;
  CREATE POLICY "Users view own enrollments" ON public.course_enrollments FOR SELECT USING (auth.uid() = user_id OR public.is_admin());
  
  DROP POLICY IF EXISTS "Users update own enrollments" ON public.course_enrollments;
  CREATE POLICY "Users update own enrollments" ON public.course_enrollments FOR ALL USING (auth.uid() = user_id OR public.is_admin());
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- Certificates: Public verification
DO $$ BEGIN
  DROP POLICY IF EXISTS "Certificates are verifiable by anyone" ON public.certificates;
  CREATE POLICY "Certificates are verifiable by anyone" ON public.certificates FOR SELECT USING (true);
  
  DROP POLICY IF EXISTS "Only admins issue certificates" ON public.certificates;
  CREATE POLICY "Only admins issue certificates" ON public.certificates FOR ALL USING (public.is_admin());
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- Notifications: User reads own
DO $$ BEGIN
  DROP POLICY IF EXISTS "Users read own notifications" ON public.notifications;
  CREATE POLICY "Users read own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
  
  DROP POLICY IF EXISTS "Users update own notifications" ON public.notifications;
  CREATE POLICY "Users update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- ==============================================================================
-- CHECK CONSTRAINT HARMONIZATION & BACKWARD COMPATIBILITY
-- Drops restrictive legacy CHECK constraints and installs inclusive variants
-- ==============================================================================
-- Competitions
ALTER TABLE IF EXISTS public.competitions DROP CONSTRAINT IF EXISTS competitions_status_check;
ALTER TABLE IF EXISTS public.competitions DROP CONSTRAINT IF EXISTS competitions_format_check;

-- Profiles
ALTER TABLE IF EXISTS public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

-- Training Programs
ALTER TABLE IF EXISTS public.training_programs DROP CONSTRAINT IF EXISTS training_programs_status_check;
ALTER TABLE IF EXISTS public.training_programs DROP CONSTRAINT IF EXISTS training_programs_format_check;
ALTER TABLE IF EXISTS public.training_programs DROP CONSTRAINT IF EXISTS training_programs_category_check;
ALTER TABLE IF EXISTS public.training_programs DROP CONSTRAINT IF EXISTS training_programs_target_audience_check;

-- Competition Teams & Members
ALTER TABLE IF EXISTS public.competition_teams DROP CONSTRAINT IF EXISTS competition_teams_status_check;
ALTER TABLE IF EXISTS public.competition_team_members DROP CONSTRAINT IF EXISTS competition_team_members_gender_check;

-- Chapters
ALTER TABLE IF EXISTS public.chapters DROP CONSTRAINT IF EXISTS chapters_status_check;
ALTER TABLE IF EXISTS public.chapters DROP CONSTRAINT IF EXISTS chapters_category_check;

-- Course Enrollments
ALTER TABLE IF EXISTS public.course_enrollments DROP CONSTRAINT IF EXISTS course_enrollments_status_check;

-- Curriculum Submissions
ALTER TABLE IF EXISTS public.curriculum_submissions DROP CONSTRAINT IF EXISTS curriculum_submissions_submission_type_check;
ALTER TABLE IF EXISTS public.curriculum_submissions DROP CONSTRAINT IF EXISTS curriculum_submissions_status_check;

-- Virtual Competitions & Submissions
ALTER TABLE IF EXISTS public.virtual_competitions DROP CONSTRAINT IF EXISTS virtual_competitions_category_check;
ALTER TABLE IF EXISTS public.virtual_competition_submissions DROP CONSTRAINT IF EXISTS virtual_competition_submissions_status_check;

-- Sponsors & Donations
ALTER TABLE IF EXISTS public.sponsors DROP CONSTRAINT IF EXISTS sponsors_status_check;
ALTER TABLE IF EXISTS public.sponsors DROP CONSTRAINT IF EXISTS sponsors_tier_check;
ALTER TABLE IF EXISTS public.donations_sponsorships DROP CONSTRAINT IF EXISTS donations_sponsorships_status_check;
ALTER TABLE IF EXISTS public.donations_sponsorships DROP CONSTRAINT IF EXISTS donations_sponsorships_support_type_check;

-- Organization Posts & Events
ALTER TABLE IF EXISTS public.organization_posts DROP CONSTRAINT IF EXISTS organization_posts_category_check;
ALTER TABLE IF EXISTS public.events DROP CONSTRAINT IF EXISTS events_category_check;

-- Chapter Requests
ALTER TABLE IF EXISTS public.chapter_registration_requests DROP CONSTRAINT IF EXISTS chapter_registration_requests_status_check;
ALTER TABLE IF EXISTS public.chapter_join_requests DROP CONSTRAINT IF EXISTS chapter_join_requests_status_check;

-- Brainstorming
ALTER TABLE IF EXISTS public.brainstorming_quizzes DROP CONSTRAINT IF EXISTS brainstorming_quizzes_difficulty_check;

-- ==============================================================================
-- 23. OFFICIAL YARA SEED DATA — FULL COMPREHENSIVE CURRICULUM
-- ==============================================================================
-- Pre-Seed Column Existence Harmonization for Core Curriculum & Competitions
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS id UUID DEFAULT uuid_generate_v4();
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS code TEXT;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS track TEXT DEFAULT 'Robotics';
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS tier INTEGER DEFAULT 1;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS level TEXT DEFAULT 'Beginner';
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS min_theory_modules INTEGER DEFAULT 6;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS total_modules INTEGER DEFAULT 0;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS short_summary TEXT;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS hardware_required TEXT[] DEFAULT '{}';
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT TRUE;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS order_index INTEGER DEFAULT 0;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS estimated_duration_hours INTEGER DEFAULT 20;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS is_draft BOOLEAN DEFAULT FALSE;

ALTER TABLE public.competitions ADD COLUMN IF NOT EXISTS id UUID DEFAULT uuid_generate_v4();
ALTER TABLE public.competitions ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE public.competitions ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE public.competitions ADD COLUMN IF NOT EXISTS year INTEGER DEFAULT 2026;
ALTER TABLE public.competitions ADD COLUMN IF NOT EXISTS theme TEXT;
ALTER TABLE public.competitions ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.competitions ADD COLUMN IF NOT EXISTS venue TEXT;
ALTER TABLE public.competitions ADD COLUMN IF NOT EXISTS prize_pool_summary TEXT;
ALTER TABLE public.competitions ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'registration_open';

ALTER TABLE public.competition_categories ADD COLUMN IF NOT EXISTS competition_id UUID REFERENCES public.competitions(id) ON DELETE CASCADE;
ALTER TABLE public.competition_categories ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE public.competition_categories ADD COLUMN IF NOT EXISTS weight_percentage INTEGER DEFAULT 33;
ALTER TABLE public.competition_categories ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.competition_categories ADD COLUMN IF NOT EXISTS order_index INTEGER DEFAULT 0;

ALTER TABLE public.training_programs ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE public.training_programs ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE public.training_programs ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.training_programs ADD COLUMN IF NOT EXISTS target_audience TEXT DEFAULT 'All';
ALTER TABLE public.training_programs ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'Robotics';
ALTER TABLE public.training_programs ADD COLUMN IF NOT EXISTS format TEXT DEFAULT 'Blended';
ALTER TABLE public.training_programs ADD COLUMN IF NOT EXISTS duration_weeks INTEGER DEFAULT 4;
ALTER TABLE public.training_programs ADD COLUMN IF NOT EXISTS total_hours INTEGER DEFAULT 16;
ALTER TABLE public.training_programs ADD COLUMN IF NOT EXISTS fee_usd DECIMAL(10,2) DEFAULT 0.00;
ALTER TABLE public.training_programs ADD COLUMN IF NOT EXISTS capacity INTEGER DEFAULT 100;
ALTER TABLE public.training_programs ADD COLUMN IF NOT EXISTS venue TEXT DEFAULT 'Harare / Regional Centers + Online Portal';
ALTER TABLE public.training_programs ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'open_for_registration';
ALTER TABLE public.training_programs ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE;

ALTER TABLE public.impact_ledger ADD COLUMN IF NOT EXISTS metric_key TEXT;
ALTER TABLE public.impact_ledger ADD COLUMN IF NOT EXISTS metric_title TEXT;
ALTER TABLE public.impact_ledger ADD COLUMN IF NOT EXISTS verified_value BIGINT;
ALTER TABLE public.impact_ledger ADD COLUMN IF NOT EXISTS unit TEXT;
ALTER TABLE public.impact_ledger ADD COLUMN IF NOT EXISTS verification_source TEXT;

ALTER TABLE public.chapters ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE public.chapters ADD COLUMN IF NOT EXISTS province TEXT;
ALTER TABLE public.chapters ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE public.chapters ADD COLUMN IF NOT EXISTS lead_name TEXT;
ALTER TABLE public.chapters ADD COLUMN IF NOT EXISTS contact_email TEXT;
ALTER TABLE public.chapters ADD COLUMN IF NOT EXISTS members_count INTEGER DEFAULT 0;
ALTER TABLE public.chapters ADD COLUMN IF NOT EXISTS schools_mentored_count INTEGER DEFAULT 0;
ALTER TABLE public.chapters ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';

-- ------------------------------------------------------------------------------
-- A. SEED COURSES (BEGINNER, INTERMEDIATE, ADVANCED)
-- ------------------------------------------------------------------------------
INSERT INTO public.courses (
  id, code, title, slug, track, tier, level, min_theory_modules, total_modules,
  short_summary, description, hardware_required, is_published, is_featured, order_index
) VALUES
  (
    '00000000-0000-0000-0000-000000000001',
    'YARA-ROB-BEG',
    'Level 1: Robotics Foundations & Embedded Systems (Beginner)',
    'robotics-foundations-beginner',
    'Robotics',
    1,
    'Beginner',
    6, -- Minimum baseline
    10, -- 10 Full Modules created to exhaust the level
    'Master electrical circuit theory, microcontrollers, breadboarding, actuators, chassis mechanics, and bench troubleshooting.',
    'A rigorous beginner engineering curriculum. Learners build an autonomous mobile robot from first principles, master Ohm’s law, solder-free breadboarding, C++ microcontroller programming, and bench debugging before completing a Research & Design Project and an Assigned Final Design Project.',
    ARRAY['Arduino Uno / Nano Kit', 'Half-size Breadboard', 'Ultrasonic HC-SR04', '2x DC Gearmotors + Wheels', 'L298N Motor Driver', '9V / 7.4V Battery Holder', 'Digital Multimeter'],
    TRUE,
    TRUE,
    1
  ),
  (
    '00000000-0000-0000-0000-000000000002',
    'YARA-ROB-INT',
    'Level 2: Autonomous Systems, PID Control & Aquatic Robotics (Intermediate)',
    'autonomous-systems-intermediate',
    'Robotics',
    2,
    'Intermediate',
    6, -- Minimum baseline
    12, -- 12 Full Modules created to exhaust the level
    'Master closed-loop PID control, quadrature encoders, state machines, serial bus protocols, PCB design, and underwater ROV buoyancy mechanics.',
    'Advanced intermediate curriculum developing autonomous navigation, precision motor control, custom circuit design with KiCad, and underwater drone buoyancy mechanics. Concludes with a Research & Design Project and an Assigned Final Design Project.',
    ARRAY['ESP32 NodeMCU', 'Magnetic Quadrature Encoders', 'MPU6050 6-DOF IMU', 'Waterproof Ultrasonic Sensors', 'LiPo 2S 1000mAh Battery', 'Logic Level Converter', 'KiCad EDA'],
    TRUE,
    TRUE,
    2
  ),
  (
    '00000000-0000-0000-0000-000000000003',
    'YARA-ROB-ADV',
    'Level 3: ROS 2, Computer Vision & Industrial Edge Robotics (Advanced)',
    'ros2-computer-vision-advanced',
    'Robotics',
    3,
    'Advanced',
    6, -- Minimum baseline
    15, -- 15 Full Modules created to exhaust the level
    'Master ROS 2, single board Linux computers, edge computer vision, LiDAR SLAM, manipulator kinematics, and real-time multithreaded robotics.',
    'Elite advanced robotics specialization preparing learners for autonomous industrial systems, agricultural robotics, and national/global championships. Covers embedded Linux, ROS 2 nodes, OpenCV, SLAM, FreeRTOS, and safety-critical fail-safe architecture. Concludes with a Research & Design Project and an Assigned Final Design Project.',
    ARRAY['Raspberry Pi 4 / 5', 'RPLiDAR A1M8 360-degree Scanner', 'RPi Wide-Angle Camera Module', '6-DOF Robotic Arm Kit', 'High-Torque Brushless Motors & ESCs', 'FreeRTOS / ROS 2 Humble'],
    TRUE,
    TRUE,
    3
  )
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  min_theory_modules = EXCLUDED.min_theory_modules,
  total_modules = EXCLUDED.total_modules;

-- ------------------------------------------------------------------------------
-- B. SEED BEGINNER LEVEL MODULES (10 FULL COMPREHENSIVE MODULES)
-- ------------------------------------------------------------------------------
-- Every module contains: Theory, Video, Guided Lab, Assignment, Troubleshooting, Mentor Support
INSERT INTO public.course_modules (
  course_id, module_number, order_index, title, coherent_skill_area,
  description, theory_overview, video_url, video_title, video_duration_seconds,
  guided_lab_title, guided_lab_instructions, guided_lab_equipment, guided_lab_simulation_url,
  assignment_title, assignment_instructions, assignment_max_points,
  troubleshooting_guide, mentor_support_topic, is_published
) VALUES
  (
    '00000000-0000-0000-0000-000000000001',
    1, 1,
    'Introduction to Robotics & Systems Architecture',
    'Systems Engineering & Robotics Taxonomy',
    'Understand what constitutes a robotic system: sensors (input), processors (logic), actuators (output), and physical structure (chassis).',
    'Robotics is the intersection of mechanical engineering, electrical engineering, and computer science. A robot perceives its environment through sensors, makes decisions using computational logic, and acts on the physical world via actuators.',
    'https://www.youtube.com/watch?v=0hYg4q6MvdE', 'Anatomy of a Modern Robot: Sensors, Actuators & Compute', 360,
    'Lab 1: Deconstructing a Real-World Automated Mechanism',
    'Identify and categorize inputs, processing chips, and output actuators in everyday consumer hardware (e.g. microwave turntable, automatic dispenser, or disk drive).',
    ARRAY['Screwdriver set', 'Sample broken consumer device or breadboard starter', 'Notebook'],
    'https://wokwi.com',
    'Practical Assignment 1: 1-Page Systems Block Diagram',
    'Select an African problem (e.g. automated borehole water pump or crop security bird-scarer) and draw a formal block diagram showing Power Source, Sensor Inputs, Microcontroller Core, and Actuator Outputs.',
    100,
    'Common Beginner Pitfall: Confusing passive automation (timers) with closed-loop robotics (feedback from sensors). Remember: a true robot must sense and react dynamically.',
    'Topic: Differentiating open-loop timers from closed-loop robotic feedback systems',
    TRUE
  ),
  (
    '00000000-0000-0000-0000-000000000001',
    2, 2,
    'Electrical Engineering, Safety & Circuit Theory',
    'Circuit Fundamentals & Ohm’s Law',
    'Master voltage, current, resistance, Ohm’s Law (V=I*R), power dissipation (P=V*I), short circuits, and bench safety protocol.',
    'Understanding electrical circuits is the prerequisite to all hardware development. Voltage is potential difference, current is charge flow, and resistance opposes flow. Exceeding current ratings destroys components.',
    'https://www.youtube.com/watch?v=8jB8hEDLk5A', 'Ohm’s Law & Bench Electrical Safety', 420,
    'Lab 2: Resistor Color Codes & Multimeter Resistance Validation',
    'Measure 5 different resistors using both the 4-band color code formula and a digital multimeter. Verify manufacturing tolerances within 5%.',
    ARRAY['Digital Multimeter', 'Assorted Resistors (220R, 1k, 10k, 100k)', 'Breadboard'],
    'https://www.falstad.com/circuit/',
    'Practical Assignment 2: LED Current-Limiting Resistor Calculation',
    'Given a 5V power supply and a red LED with forward voltage 2.0V and maximum forward current 20mA, calculate the ideal series resistor. Show all mathematical working and select the closest standard E12 resistor.',
    100,
    'Common Bench Bug: Multimeter reads 0 ohms or infinite ohms (OL). Ensure test probes are plugged into COM and V/Ohm jacks, not the 10A current jack! Never measure resistance on an energized live circuit.',
    'Topic: Multimeter measurement modes and preventing meter fuse blowouts',
    TRUE
  ),
  (
    '00000000-0000-0000-0000-000000000001',
    3, 3,
    'Breadboarding & Prototyping Laboratory',
    'Solderless Prototyping & Electrical Continuity',
    'Understand internal breadboard rail architecture (power buses vs terminal tie-point strips), jumper wire best practices, and clean circuit layout.',
    'Breadboards allow rapid solderless circuit prototyping. Power rails run vertically along the sides, while terminal strips run horizontally in groups of five pins. Jumper wires must be color-coded (Red for VCC, Black for GND).',
    'https://www.youtube.com/watch?v=6WReFkfrUIk', 'Mastering the Breadboard Architecture', 340,
    'Lab 3: Building a Dual-Rail Pushbutton Switch Circuit',
    'Wire a manual pushbutton switch circuit that lights an LED when pressed, utilizing a pull-down resistor to prevent floating logic states.',
    ARRAY['Half-size Breadboard', 'Pushbutton switch', 'LED (5mm)', '330R Resistor', '10k Resistor', '9V Battery with 5V breadboard regulator'],
    'https://www.tinkercad.com/circuits',
    'Practical Assignment 3: Breadboarded Voltage Divider Circuit',
    'Construct a 2-resistor voltage divider that drops a 9V battery voltage to precisely 4.5V. Measure both voltages with your multimeter and submit photo evidence with calculations.',
    100,
    'Common Bench Bug: LED does not light up. Check polarity: long leg (anode) goes to positive, flat rim/short leg (cathode) goes to ground. Verify breadboard power rails are continuous across the center split.',
    'Topic: Floating pins, pull-up/pull-down resistors and breadboard split rails',
    TRUE
  ),
  (
    '00000000-0000-0000-0000-000000000001',
    4, 4,
    'Microcontroller Architecture (Arduino & ESP32)',
    'Digital Compute & GPIO Hardware Interfacing',
    'Understand the microcontroller brain: ATmega328P / ESP32, CPU clock frequency, Flash vs SRAM vs EEPROM, and General Purpose Input/Output (GPIO) pins.',
    'Unlike microprocessors which require external RAM and storage, microcontrollers integrate CPU, memory, clock, and peripherals onto a single silicon die, making them ideal for embedded real-time robotics.',
    'https://www.youtube.com/watch?v=nL34zDTPkcs', 'Microcontroller Architecture: Inside the Chip', 410,
    'Lab 4: Flashing Bare-Metal Blink & Custom Morse Code',
    'Connect an Arduino Uno via USB, install board definitions in the IDE, configure COM port baud rates, and flash firmware that blinks the onboard LED in an SOS Morse code pattern.',
    ARRAY['Arduino Uno / Nano with USB Cable', 'Computer with Arduino IDE installed'],
    'https://wokwi.com/projects/new/arduino-uno',
    'Practical Assignment 4: Multi-LED Traffic Sequence Controller',
    'Wire Red, Yellow, and Green LEDs to Digital Pins 11, 12, and 13. Write firmware establishing standard traffic light timing sequences (Red 4s, Red+Yellow 1s, Green 4s, Yellow 1.5s). Submit clean C++ source code.',
    100,
    'Common Bench Bug: "avrdude: ser_open(): can''t open device COM3". Fix: Unplug USB, restart IDE, check Device Manager for correct CH340 or FTDI driver installation.',
    'Topic: Resolving USB-to-UART driver conflicts and baud rate mismatches',
    TRUE
  ),
  (
    '00000000-0000-0000-0000-000000000001',
    5, 5,
    'Firmware Programming (C++ & Computational Logic)',
    'Embedded C++ Logic, Loops, Functions & State',
    'Master embedded programming syntax: setup() vs loop(), pinMode, digitalWrite, digitalRead, data types (bool, uint8_t, int, unsigned long), and non-blocking timing.',
    'C++ is the global industry standard for embedded robotics. Firmwares must run reliably without memory leaks or uncontrolled infinite hangs. Avoid delay() in production firmware.',
    'https://www.youtube.com/watch?v=fJWR7dBucJY', 'C++ for Robotics: Control Logic & State', 390,
    'Lab 5: Digital Input Debouncing with Pushbutton',
    'Interface a physical tactile pushbutton to Digital Pin 2 and write an edge-detection debouncing routine that toggles a relay state cleanly on each press without switch-bounce chatter.',
    ARRAY['Arduino Uno', 'Tactile switch', '10k Pull-up Resistor', '100nF Ceramic Capacitor', 'Jumper wires'],
    'https://wokwi.com',
    'Practical Assignment 5: Interactive Reaction Timer Game',
    'Write a C++ game firmware where a random LED illuminates after an unpredictable delay (1-5s). The player must press a button as fast as possible. Output the reaction time in milliseconds over Serial Monitor.',
    100,
    'Common Bench Bug: Switch triggers multiple times on a single click. Mechanical contacts oscillate for 5-20 milliseconds. Add software debouncing logic checking if millis() - lastDebounceTime > 50.',
    'Topic: Mechanical contact bounce and non-blocking debounce algorithms',
    TRUE
  ),
  (
    '00000000-0000-0000-0000-000000000001',
    6, 6,
    'Sensors & Environmental Perception',
    'Transducers, Analog vs Digital & Signal Conditioning',
    'Explore how robots perceive reality: Ultrasonic rangefinders (HC-SR04), Infrared proximity sensors, Light Dependent Resistors (LDRs), and Analog-to-Digital Conversion (ADC).',
    'Sensors convert physical phenomena into electrical signals. The ATmega328P ADC has 10-bit resolution (0 to 1023) corresponding to 0V to 5V (approx 4.88mV per step).',
    'https://www.youtube.com/watch?v=ZejQOX69K5M', 'How Ultrasonic & IR Sensors Work', 400,
    'Lab 6: Calibrating the HC-SR04 Ultrasonic Sensor in Metric Units',
    'Wire HC-SR04 Trigger and Echo pins. Send a 10-microsecond trigger pulse, read echo duration via pulseIn(), and calculate distance using the speed of sound formula: Distance = (Time * 0.0343) / 2.',
    ARRAY['Arduino Uno', 'HC-SR04 Ultrasonic Sensor', 'Metric Ruler / Measuring Tape', 'Cardboard target'],
    'https://wokwi.com/projects/new/arduino-uno',
    'Practical Assignment 6: Smart Distance Proximity Alarm',
    'Build an obstacle proximity warning system: Green LED when distance > 30cm, Yellow LED between 15-30cm, Red LED + Buzzer beeping frantically when distance < 15cm. Submit working video and code.',
    100,
    'Common Bench Bug: Ultrasonic sensor returns 0cm or 3000cm false readings. Sound waves reflect off soft surfaces or angled walls. Place target perpendicular and filter out zero-value spikes in software.',
    'Topic: Acoustic reflection angles and median filtering for sensor noise',
    TRUE
  ),
  (
    '00000000-0000-0000-0000-000000000001',
    7, 7,
    'Motors, Actuators & Motor Drivers',
    'Electromechanical Actuation & H-Bridge Control',
    'Understand why microcontrollers cannot directly drive motors: inductive back-EMF spikes, high current draw, and H-Bridge drivers (L298N / TB6612FNG).',
    'Microcontroller pins output max 20-40mA, while DC gearmotors draw 200mA to 2A under stall. An H-Bridge uses transistors to reverse motor polarity and Pulse Width Modulation (PWM) to regulate motor speed.',
    'https://www.youtube.com/watch?v=J6mQz6qj9Q8', 'Motors & H-Bridges: Driving High Current Loads', 420,
    'Lab 7: Speed and Direction Control of Dual DC Motors',
    'Connect an L298N H-Bridge driver to an external battery pack and Arduino PWM pins (Pins 5, 6, 9, 10). Write routines for FORWARD, REVERSE, PIVOT LEFT, PIVOT RIGHT, and SOFT STOP.',
    ARRAY['Arduino Uno', 'L298N Dual Motor Driver', '2x TT Geared DC Motors', '7.4V Li-ion or 4x AA Battery Pack'],
    'https://wokwi.com',
    'Practical Assignment 7: Differential Drive Skid-Steer Maneuvers',
    'Implement a smooth acceleration and deceleration curve using PWM duty cycles (0 to 255) to prevent physical wheel slip and mechanical gear stripping during rapid direction reversals.',
    100,
    'Common Bench Bug: Arduino resets whenever motors start spinning. Motor stall current causes battery voltage to sag, causing microcontroller brownout reset. Connect separate power for motors and tie GNDs together!',
    'Topic: Ground loops, common ground requirements, and inductive isolation',
    TRUE
  ),
  (
    '00000000-0000-0000-0000-000000000001',
    8, 8,
    'Mechanical Chassis Design & Structural Rigidity',
    'Robot Mechanics, Center of Mass & Drive Trains',
    'Learn robot chassis physics: differential drive vs four-wheel drive, caster wheels, ground clearance, center of mass (CoM), gear ratios, and torque calculation.',
    'A robot with excellent code will fail if its mechanical chassis flexes, wheels wobble, or its center of gravity is too high, causing it to tip under acceleration.',
    'https://www.youtube.com/watch?v=jW0iP632x6w', 'Chassis Physics: Stability, Traction & Center of Mass', 380,
    'Lab 8: Assembling the 2-Wheel Differential Rover Base',
    'Assemble acrylic/3D-printed chassis plates, mount DC gearmotors rigidly with M3 bolts, install the front passive caster wheel, and verify perfect horizontal alignment with a bubble level.',
    ARRAY['2WD Rover Chassis Kit', 'M3 Screws, Nuts & Spacers', 'Screwdriver', 'Ruler'],
    'https://www.tinkercad.com/things',
    'Practical Assignment 8: Payload & Stability Calculation Report',
    'Calculate the static tipping angle of your assembled rover when equipped with battery pack, Arduino, motor driver, and breadboard. Submit a labeled engineering sketch showing Center of Gravity.',
    100,
    'Common Bench Bug: Rover drifts to the left when commanded straight. In cheap TT DC gearmotors, manufacturing tolerances cause speed variations of 5-15%. Mechanical friction on axles must be minimized.',
    'Topic: Motor manufacturing variations and mechanical drag compensation',
    TRUE
  ),
  (
    '00000000-0000-0000-0000-000000000001',
    9, 9,
    'Hardware Debugging, Bench Testing & Multimeter Diagnostics',
    'Systematic Fault Isolation & Bench Test Instruments',
    'Become an autonomous troubleshooter: voltage drop checks, continuity testing, tracing intermittent wire breaks, and cold solder joint detection.',
    'Debugging is 60% of robotics engineering. Professional roboticists do not guess; they form hypotheses, measure voltages systematically at test points, and isolate hardware from software.',
    'https://www.youtube.com/watch?v=p4v3gYl4xYI', 'Professional Bench Debugging for Robots', 360,
    'Lab 9: Simulating & Isolating 3 Injected Hardware Faults',
    'Take a non-functioning mobile robot with 3 hidden faults (loose GND wire, blown fuse/dead battery cell, reversed motor polarity). Follow the 5-Step YARA Fault Isolation Protocol to diagnose and repair each fault.',
    ARRAY['Digital Multimeter', 'Continuity buzzer probe', 'Assembled Rover', 'Jumper wires'],
    'https://wokwi.com',
    'Practical Assignment 9: Standard Operating Procedure (SOP) Bench Checklist',
    'Draft a 10-point Pre-Power Inspection Checklist for your robotics club. Detail every test point that must be verified before connecting battery power to avoid burning chips.',
    100,
    'Common Bench Bug: Circuit works on USB power but dies on battery. The battery connector wire has high internal resistance or the 9V PP3 alkaline battery cannot supply necessary motor current.',
    'Topic: Internal battery resistance and high-drain power requirements',
    TRUE
  ),
  (
    '00000000-0000-0000-0000-000000000001',
    10, 10,
    'Basic Autonomous Logic & Open-Loop Navigation',
    'Algorithmic Motion Planning & Obstacle Reflexes',
    'Synthesize all modules: combine sensor perception, motor actuation, and conditional decision loops to build an autonomous obstacle-avoiding mobile robot.',
    'The robot now operates without human teleoperation. It measures forward distance continuously; if an obstacle is closer than 20cm, it halts, backs up, scans left/right, and steers toward clear space.',
    'https://www.youtube.com/watch?v=3g8K1Y3nO4w', 'Autonomous Obstacle Avoidance Architecture', 420,
    'Lab 10: Programming the Autonomous Reflex Loop',
    'Deploy complete obstacle avoidance firmware to your rover. Test it inside an enclosed 2m x 2m testing pen and observe autonomous wall deflection without human intervention.',
    ARRAY['Assembled 2WD Autonomous Rover', 'Battery pack', 'Obstacle pen (cardboard walls)'],
    'https://wokwi.com',
    'Practical Assignment 10: Dead-Reckoning Square Navigation Challenge',
    'Program your rover to navigate an exact 1-meter square perimeter (Forward 1m -> 90-degree Right Turn -> Repeat 4 times) using precise motor calibration. Record video and measure positional error at the end.',
    100,
    'Common Bench Bug: Robot gets stuck in corners. The single ultrasonic sensor has a narrow cone of view (15-30 degrees) and misses diagonal walls. Mount sensor on a servo to sweep 180 degrees.',
    'Topic: Sensor blind spots, acoustic beam divergence, and servo panning',
    TRUE
  )
ON CONFLICT (course_id, module_number) DO UPDATE SET
  title = EXCLUDED.title,
  coherent_skill_area = EXCLUDED.coherent_skill_area,
  description = EXCLUDED.description,
  theory_overview = EXCLUDED.theory_overview,
  guided_lab_title = EXCLUDED.guided_lab_title,
  assignment_title = EXCLUDED.assignment_title;

-- ------------------------------------------------------------------------------
-- C. SEED BEGINNER LEVEL CAPSTONE PROJECTS (RESEARCH + ASSIGNED FINAL DESIGN)
-- ------------------------------------------------------------------------------
INSERT INTO public.course_projects (
  course_id, project_type, title, description, guidelines, rubric, deliverables_required, order_index
) VALUES
  (
    '00000000-0000-0000-0000-000000000001',
    'research_and_design',
    'Beginner Level Capstone 1: Community Robotics Needs & Feasibility Analysis',
    'Conduct a thorough community research investigation into a local agricultural, environmental, or household challenge that can be solved with robotic automation.',
    'Learners must identify a real user, conduct a 5 Whys root cause analysis, write a formal Problem Statement, determine quantifiable engineering constraints (size, weight, battery life, cost under $50), and draft a full system architecture diagram.',
    '[{"criterion": "Problem Definition & 5 Whys", "max_points": 25}, {"criterion": "Engineering Requirements & Constraints", "max_points": 25}, {"criterion": "System Architecture & Block Diagram", "max_points": 25}, {"criterion": "Bill of Materials & Cost Budget", "max_points": 25}]',
    ARRAY['1-Page Problem-Solution Canvas', 'Engineering Constraints Matrix', 'System Architecture Block Diagram', 'Preliminary Bill of Materials (BOM) under $50'],
    1
  ),
  (
    '00000000-0000-0000-0000-000000000001',
    'assigned_final_design',
    'Beginner Level Capstone 2: Autonomous Obstacle-Avoidance Mobile Rover Build',
    'Build, program, and rigorously benchmark a fully functioning autonomous mobile robot that integrates all skills from Modules 1 through 10.',
    'The robot must navigate a dynamic obstacle course autonomously for 60 seconds without human touching, detect obstacles reliably at 20cm, execute non-blocking avoidance maneuvers, feature a rigid chassis, and have a safe master power switch.',
    '[{"criterion": "Mechanical Rigidity & Wire Dressing", "max_points": 20}, {"criterion": "Electrical Safety & Power Stability", "max_points": 20}, {"criterion": "Firmware Code Quality & Non-Blocking Loops", "max_points": 20}, {"criterion": "60-Second Autonomous Obstacle Traversal", "max_points": 30}, {"criterion": "90-Second Demonstration Video & Git Repo", "max_points": 10}]',
    ARRAY['Working Physical or Tinkercad Rover', 'Documented C++ Source Code Repository', 'Full Circuit Schematic (KiCad/Tinkercad)', '90-Second Uncut Video Demonstration showing 60s autonomous run'],
    2
  )
ON CONFLICT DO NOTHING;

-- ------------------------------------------------------------------------------
-- D. SEED INTERMEDIATE LEVEL MODULES (12 FULL COMPREHENSIVE MODULES)
-- ------------------------------------------------------------------------------
INSERT INTO public.course_modules (
  course_id, module_number, order_index, title, coherent_skill_area,
  description, theory_overview, video_url, video_title, video_duration_seconds,
  guided_lab_title, guided_lab_instructions, guided_lab_equipment, guided_lab_simulation_url,
  assignment_title, assignment_instructions, assignment_max_points,
  troubleshooting_guide, mentor_support_topic, is_published
) VALUES
  (
    '00000000-0000-0000-0000-000000000002',
    1, 1,
    'Advanced Embedded C++ & Interrupt Service Routines (ISRs)',
    'Real-Time Hardware Interrupts & Timers',
    'Move beyond polling: master hardware interrupts (RISING, FALLING, CHANGE), volatile variables, timer prescalers, and atomic operations.',
    'Polling wastes CPU cycles and misses rapid microsecond sensor transitions. Hardware interrupts preempt the CPU immediately when an event occurs on a dedicated pin.',
    'https://www.youtube.com/watch?v=QtyLMbW53qQ', 'Hardware Interrupts & ISR Architecture in C++', 420,
    'Lab 1: High-Speed Optical Encoder RPM Counter',
    'Attach an optical slotted disc to a motor shaft and write an ISR that increments tick counters on every FALLING edge without missing counts at 3000 RPM.',
    ARRAY['ESP32 / Arduino Uno', 'Optical Speed Sensor Module', 'Slotted Disc on DC motor'],
    'https://wokwi.com',
    'Practical Assignment 1: Non-Blocking Tachometer Firmware',
    'Build a non-blocking digital tachometer that calculates and displays real-time RPM on an OLED screen every 500ms using timer interrupts.',
    100,
    'Common Bug: Microcontroller crashes or hangs inside ISR. Golden rule of interrupts: Keep ISRs extremely short! Never use delay(), Serial.print(), or memory allocations inside an ISR.',
    'Topic: Atomic access, volatile keyword semantics, and ISR execution deadlines',
    TRUE
  ),
  (
    '00000000-0000-0000-0000-000000000002',
    2, 2,
    'Closed-Loop Control Systems & PID Tuning',
    'Proportional-Integral-Derivative Control Algorithms',
    'Master the mathematical cornerstone of control engineering: Error = Setpoint - ProcessValue, P (reaction), I (steady-state elimination), and D (damping oscillation).',
    'Open-loop control cannot handle disturbances. A PID controller continuously computes an error value and applies a correction based on proportional, integral, and derivative terms.',
    'https://www.youtube.com/watch?v=wkfEZmsQqiA', 'PID Control from Mathematical Theory to C++', 450,
    'Lab 2: Tuning PID Constants on a Single-Axis Balancing Arm',
    'Set up a motorized lever arm with an angle sensor. Tune Kp, Ki, and Kd systematically using the Ziegler-Nichols method until the arm holds a 45-degree angle steadily against wind disturbances.',
    ARRAY['ESP32', 'Potentiometer Angle Sensor', 'Motorized arm / Fan setup'],
    'https://wokwi.com',
    'Practical Assignment 2: High-Speed Line Tracking PID Rover',
    'Implement a PID line-following algorithm reading a 5-sensor IR array. Benchmark straightaway velocity vs tight turn damping without track derailment.',
    100,
    'Common Bug: Robot oscillates violently side to side. Proportional gain Kp is too high, or derivative term Kd is too low. Reduce Kp by 50% and increment Kd gradually.',
    'Topic: Ziegler-Nichols tuning heuristics and derivative noise filtering',
    TRUE
  ),
  (
    '00000000-0000-0000-0000-000000000002',
    3, 3,
    'Rotary Encoders & Wheel Odometry',
    'Kinematic State Estimation & Position Tracking',
    'Understand quadrature encoders (Channel A and Channel B phase shift), calculating wheel displacement, linear distance, and heading angle changes via odometry equations.',
    'Wheel encoders allow a mobile robot to estimate its position (X, Y, Theta) in 2D space relative to its starting coordinates through dead-reckoning odometry integration.',
    'https://www.youtube.com/watch?v=q3wGeq7F1vA', 'Quadrature Encoders & Wheel Odometry Kinematics', 390,
    'Lab 3: Calibrating Encoder Pulses Per Revolution (PPR)',
    'Rotate a robot wheel manually 10 full turns. Count total encoder state transitions (4x decoding) and calculate exact millimeters traveled per tick.',
    ARRAY['Motors with Magnetic Quadrature Encoders', 'ESP32', 'Dual H-Bridge Driver'],
    'https://wokwi.com',
    'Practical Assignment 3: Odometric Straight-Line Driver',
    'Write a closed-loop controller that forces both left and right wheels to rotate at identical tick rates, ensuring the robot travels 3 meters in a straight line with under 2cm angular deviation.',
    100,
    'Common Bug: Odometric drift accumulates over time due to wheel slip, floor roughness, and tire compression. Encoders measure wheel rotation, NOT absolute ground travel.',
    'Topic: Non-systematic odometry errors and wheel slip compensation',
    TRUE
  ),
  (
    '00000000-0000-0000-0000-000000000002',
    4, 4,
    'Finite State Machines & Non-Blocking Architecture',
    'State Transition Diagrams & Clean Software Design',
    'Replace spaghetti code with professional Finite State Machines (FSM): States, Events, Transitions, and Actions using C++ enum classes and switch statements.',
    'Real-time autonomous robots must juggle multiple concurrent behaviors (navigation, sensor monitoring, telemetry broadcasting, safety checks) without ever blocking execution.',
    'https://www.youtube.com/watch?v=E43-CfukEgs', 'Finite State Machines for Autonomous Robotics', 360,
    'Lab 4: Building a 5-State Autonomous Rover FSM',
    'Construct an FSM featuring states: IDLE, FORWARD_SEARCH, WALL_AVOID_LEFT, WALL_AVOID_RIGHT, and EMERGENCY_ESTOP with clean state transition logs printed over serial.',
    ARRAY['ESP32', '2x Distance Sensors', 'Motors + Driver'],
    'https://wokwi.com',
    'Practical Assignment 4: State Machine Architecture Blueprint',
    'Submit a formal UML State Transition Diagram and accompanying C++ implementation for a robotic vacuum cleaner that handles low-battery returns and edge-dropoff retreats.',
    100,
    'Common Bug: FSM gets trapped in an unhandled state or oscillates between two states on the boundary threshold. Always add hysteresis thresholds and a robust DEFAULT state.',
    'Topic: Boundary hysteresis and state race condition prevention',
    TRUE
  ),
  (
    '00000000-0000-0000-0000-000000000002',
    5, 5,
    'Serial Communication Protocols (I2C, SPI, UART)',
    'Hardware Bus Architectures & Bit-Level Protocols',
    'Master hardware bus communication: I2C (SDA/SCL, addressing, pull-ups), SPI (MOSI, MISO, SCK, CS), and asynchronous UART (Tx, Rx, Baud rates, parity).',
    'Robots contain multiple specialized chips. Microcontrollers communicate with IMUs, displays, and coprocessors over synchronous multi-drop digital buses.',
    'https://www.youtube.com/watch?v=BA70b8wPqgA', 'I2C vs SPI vs UART: When to Use Which', 410,
    'Lab 5: Reading an I2C MPU6050 Accelerometer & Driving an SPI OLED Display',
    'Connect an MPU6050 6-axis IMU over I2C (Address 0x68) and an SSD1306 OLED over SPI. Read real-time pitch and roll angles and render an artificial horizon display at 60 FPS.',
    ARRAY['ESP32', 'MPU6050 IMU', '0.96 inch OLED Display', 'Breadboard'],
    'https://wokwi.com',
    'Practical Assignment 5: Dual-Microcontroller UART Telemetry Bridge',
    'Establish a bidirectional packet protocol (Header, Length, Payload, Checksum) between two microcontrollers over UART at 115200 baud. Transmit sensor packets with checksum verification.',
    100,
    'Common Bug: I2C bus hangs and freezes the processor. Cause: Missing 4.7k pull-up resistors on SDA/SCL lines, or a slave device holding SDA low indefinitely. Implement I2C timeout recovery.',
    'Topic: I2C bus lockup recovery routines and bus line capacitance limits',
    TRUE
  ),
  (
    '00000000-0000-0000-0000-000000000002',
    6, 6,
    'Multi-Sensor Fusion & Calibration',
    'Signal Conditioning, Complementary Filters & Noise',
    'Combine noisy sensors to achieve clean state perception: fusing accelerometer gravity vectors with gyroscope angular rates using a Complementary Filter.',
    'Accelerometers are noisy in the short term but stable long term. Gyroscopes are smooth in the short term but drift over time. Sensor fusion merges their complementary strengths.',
    'https://www.youtube.com/watch?v=0rlvvYgmTvI', 'Sensor Fusion: Complementary & Kalman Filtering', 430,
    'Lab 6: Calibrating Gyro Zero-Rate Bias & Implementing a Complementary Filter',
    'Sample 1000 stationary IMU readings on startup to compute zero-rate bias offsets. Implement angle = 0.98 * (angle + gyro * dt) + 0.02 * accel_angle.',
    ARRAY['ESP32', 'MPU6050 IMU', 'Serial Plotter tool'],
    'https://wokwi.com',
    'Practical Assignment 6: Pitch & Roll Robot Tilt Safety Cutoff',
    'Write a safety firmware module that continuously calculates fused vehicle tilt angle. If vehicle pitch exceeds 35 degrees (imminent tip-over), cut all motor PWM outputs instantly.',
    100,
    'Common Bug: Drift continues even with filter. Ensure sampling delta time dt is measured dynamically with micros() rather than hardcoded with a fixed assumption.',
    'Topic: Dynamic delta time integration and accelerometer vibration dampening',
    TRUE
  ),
  (
    '00000000-0000-0000-0000-000000000002',
    7, 7,
    'Power Systems, Battery Chemistry & Voltage Regulation',
    'Lithium Chemistries, C-Ratings, BMS & Buck Converters',
    'Master robot power engineering: Li-ion vs LiFePO4 vs Lead Acid, discharge C-ratings, internal resistance, Battery Management Systems (BMS), and efficient Buck/Boost converters.',
    'Poor power design is the #1 killer of robotics prototypes. Linear regulators waste excess voltage as heat (P=(Vin-Vout)*I), whereas switching buck regulators achieve 90%+ efficiency.',
    'https://www.youtube.com/watch?v=wXW_m9LzF1A', 'Robot Power Architecture: Batteries & Regulators', 400,
    'Lab 7: Characterizing Battery Discharge Curves & Buck Converter Thermal Efficiency',
    'Power an LM2596 switching buck converter with a 12V supply. Step it down to 5.0V under a 1A load. Measure input vs output power to calculate efficiency, and monitor thermal rise with an infrared thermometer.',
    ARRAY['12V Battery / Supply', 'LM2596 Buck Converter', 'Load Resistor', 'Multimeter'],
    'https://www.falstad.com/circuit/',
    'Practical Assignment 7: 12-Hour Mission Power Budget Calculation',
    'Build a full power budget spreadsheet for an autonomous agricultural rover: list every sensor, MCU, motor driver, and wireless module with idle and peak current draw. Determine required battery capacity in Amp-hours.',
    100,
    'Common Bug: Buck converter outputs noisy voltage ripple that corrupts ADC sensor readings. Add low-ESR electrolytic and 100nF ceramic decoupling capacitors directly across supply rails.',
    'Topic: High-frequency switching noise suppression and ground star-wiring',
    TRUE
  ),
  (
    '00000000-0000-0000-0000-000000000002',
    8, 8,
    'Autonomous Maze Solving & Wall-Following Algorithms',
    'Grid Mapping, Wall-Following & Flood-Fill Heuristics',
    'Explore autonomous navigation in constrained environments: Right-Hand Wall Following rules, detecting dead-ends, and introduction to the Micromouse Flood-Fill algorithm.',
    'A robot inside a maze must maintain wall distances using side-mounted rangefinders while detecting junctions and dead-ends through stateful maze traversal rules.',
    'https://www.youtube.com/watch?v=0k5G6FmP7z8', 'Micromouse Maze Navigation & Flood-Fill', 440,
    'Lab 8: Left-Wall Follower Robot in a Modular Wooden Maze',
    'Position two ultrasonic sensors on the left and front of the rover. Write a closed-loop PD wall follower that holds an exact 12cm distance from the left wall while executing clean 90-degree right turns at obstacles.',
    ARRAY['ESP32 Autonomous Rover', '2x Ultrasonic Sensors', 'Cardboard/wooden maze walls'],
    'https://wokwi.com',
    'Practical Assignment 8: Dead-End Detection & 180-Degree Pivot Maneuver',
    'Enhance your maze rover firmware to detect dead-ends (walls detected on front, left, and right). Execute an autonomous 180-degree pivot within the corridor width without scraping walls.',
    100,
    'Common Bug: Front sensor detects the corner too late, causing the rover to crash into the wall before turning. Increase forward lookahead threshold and decrease straightaway velocity as walls approach.',
    'Topic: Lookahead deceleration curves and corner clearance radii',
    TRUE
  ),
  (
    '00000000-0000-0000-0000-000000000002',
    9, 9,
    'Custom PCB Design & KiCad Schematics',
    'Electronic CAD, Trace Routing & Design for Manufacturing',
    'Transition from messy breadboards to custom Printed Circuit Boards (PCBs): KiCad schematic capture, footprint assignment, PCB layout rules, trace widths for motor current, and Gerber generation.',
    'A competition robot cannot have loose jumper wires that unplug during arena vibrations. Custom PCBs provide mechanical rigidity, electrical reliability, and compact form factor.',
    'https://www.youtube.com/watch?v=vaCVh2SAZY4', 'KiCad PCB Design: From Schematic to Gerber', 450,
    'Lab 9: Designing a Custom Sensor & Motor Carrier Board in KiCad',
    'Capture a clean schematic in KiCad including an ESP32, L298N/TB6612 motor driver headers, I2C sensor headers, reverse-polarity protection diode, and power indicator LED.',
    ARRAY['Computer with KiCad 8.0+ installed', 'KiCad component libraries'],
    'https://kicad.org',
    'Practical Assignment 9: 2-Layer Routed PCB Layout & DRC Verification',
    'Route a compact 2-layer PCB layout. Ensure motor power traces are at least 1.5mm wide to handle 2A current. Pass Design Rule Checks (DRC) with zero clearance or unrouted errors, and generate manufacturing Gerbers.',
    100,
    'Common Bug: Ground loops and noisy sensor traces caused by split ground returns. Always use a solid, unbroken ground plane on the bottom layer of your 2-layer PCB layout.',
    'Topic: Ground plane integrity, trace current capacity formulas, and decoupling layout',
    TRUE
  ),
  (
    '00000000-0000-0000-0000-000000000002',
    10, 10,
    'Underwater ROV Principles & Aquatic Buoyancy Mechanics',
    'Archimedes’ Principle, Ballast, Waterproofing & Thrusters',
    'Explore marine engineering for the YARA 2026 Underwater Drone category: positive vs neutral vs negative buoyancy, center of buoyancy (CoB) vs center of gravity (CoG), and O-ring sealing.',
    'Water is 800 times denser than air and exerts 1 atmosphere of pressure every 10 meters of depth. An Underwater Remotely Operated Vehicle (ROV) must be slightly positively buoyant and have its CoB placed well above its CoG to prevent inversion.',
    'https://www.youtube.com/watch?v=CqFvOQ2_o20', 'Underwater ROVs: Buoyancy, Sealing & Stability', 410,
    'Lab 10: Archimedes Buoyancy & Ballast Calibration Tank Test',
    'Construct a sealed cylindrical PVC/acrylic hull. Measure total weight in air and submerged displaced volume in water. Calculate and add ballast weights until the vessel achieves neutral buoyancy (floats just below water line).',
    ARRAY['Sealed cylinder hull / ROV frame', 'Water tank / Bucket', 'Lead / Stainless steel ballast weights', 'Digital kitchen scale'],
    'https://wokwi.com',
    'Practical Assignment 10: 3-Axis Thruster Vectoring Allocation Scheme',
    'Design a thruster allocation scheme with 4 horizontal thrusters (vectored at 45 degrees) and 2 vertical thrusters. Write firmware routines mapping joystick surge, sway, heave, and yaw commands to individual PWM motor signals.',
    100,
    'Common Bug: Hull flips upside down in water. Center of Gravity (CoG) is higher than Center of Buoyancy (CoB). Move heavy batteries to the lowest point of the frame and place buoyancy foam at the highest point.',
    'Topic: Metacentric height, hydrostatic restoring moment, and dynamic roll stability',
    TRUE
  ),
  (
    '00000000-0000-0000-0000-000000000002',
    11, 11,
    'Wireless Telemetry & RF Communication (NRF24L01 / Bluetooth)',
    'Radio Frequency Links, Packet Framing & Telemetry Dashboards',
    'Cut the umbilical cord: implement robust wireless 2.4GHz RF communication using NRF24L01+ transceivers, packet serialization, CRC error checking, and real-time telemetry streaming.',
    'Wireless links drop packets and suffer from interference. A production robotics protocol must use structured frames, acknowledge packets (ACK), and implement auto-retransmission with fail-safe timeouts.',
    'https://www.youtube.com/watch?v=0k5G6FmP7z8', 'NRF24L01 & Wireless Robotics Telemetry', 370,
    'Lab 11: Establishing a 100-Meter Wireless RF Telemetry Link',
    'Wire two NRF24L01+ modules with 10uF bypass capacitors on 3.3V lines. Establish a continuous 50Hz telemetry stream transmitting rover battery voltage, heading, and wheel speeds to a base station.',
    ARRAY['2x ESP32 / Arduino', '2x NRF24L01+ modules', '10uF Electrolytic Capacitors'],
    'https://wokwi.com',
    'Practical Assignment 11: Wireless Fail-Safe Emergency Stop Watchdog',
    'Write a safety watchdog timer in the robot firmware. If no valid RF telemetry packet is received for more than 500 milliseconds (loss of signal), cut all thruster/motor power automatically and illuminate a warning beacon.',
    100,
    'Common Bug: NRF24L01 fails to transmit intermittently. 3.3V power rails experience sudden current dips during radio transmission bursts. Solder a 10uF capacitor directly across the VCC and GND pins of the radio module.',
    'Topic: RF power supply transient decoupling and wireless watchdog timeouts',
    TRUE
  ),
  (
    '00000000-0000-0000-0000-000000000002',
    12, 12,
    'Competition Arena Tactics & Pre-Inspection Engineering',
    'Competition Strategy, Pit Readiness & Engineering Defense',
    'Prepare for the YARA National Robotics Championship: rulebook interpretation, arena lighting variations, battery turnaround protocols, pit area tools, and defending engineering decisions before judges.',
    'Championships are won in the pit area through preparation, rigorous checklists, and team coordination. Teams with strict gender parity and well-documented engineering notebooks score the highest.',
    'https://www.youtube.com/watch?v=Y8kK8YmP1v4', 'Winning Robotics Competitions: Strategy, Pits & Rules', 430,
    'Lab 12: Executing a 5-Minute Timed Match Simulation Drill',
    'Perform a mock competition match drill: unbox robot, conduct 60-second pre-match checks, place on starting tile, execute autonomous run, and pack up within the strict competition time limit.',
    ARRAY['Competition Robot', 'Spare Battery', 'Stopwatch', 'Official YARA Inspection Checklist'],
    'https://yara.org/competition',
    'Practical Assignment 12: Complete 20-Page Engineering Design Notebook',
    'Compile your team’s official Engineering Notebook: document the complete journey through all 12 modules, design trade-offs, schematic revisions, testing logs, failed iterations, and 2B+2G member contributions.',
    100,
    'Common Bug: Robot performs perfectly at home school but fails at arena. Cause: Arena lighting glare confuses optical/IR sensors. Always calibrate threshold values in the competition arena during practice periods!',
    'Topic: Ambient light calibration routines and environmental variance handling',
    TRUE
  )
ON CONFLICT (course_id, module_number) DO UPDATE SET
  title = EXCLUDED.title,
  coherent_skill_area = EXCLUDED.coherent_skill_area,
  description = EXCLUDED.description,
  theory_overview = EXCLUDED.theory_overview,
  guided_lab_title = EXCLUDED.guided_lab_title,
  assignment_title = EXCLUDED.assignment_title;

-- ------------------------------------------------------------------------------
-- E. SEED INTERMEDIATE LEVEL CAPSTONE PROJECTS
-- ------------------------------------------------------------------------------
INSERT INTO public.course_projects (
  course_id, project_type, title, description, guidelines, rubric, deliverables_required, order_index
) VALUES
  (
    '00000000-0000-0000-0000-000000000002',
    'research_and_design',
    'Intermediate Level Capstone 1: Agricultural / Aquatic Autonomous Mission Blueprint',
    'Author a complete technical specification for an autonomous robotic system addressing an African agricultural or water resource challenge.',
    'Students must research soil sensors, water quality monitoring, or aquatic debris clearance. Detail complete kinematic model, custom KiCad PCB schematics, component selection, wireless telemetry architecture, and total cost analysis.',
    '[{"criterion": "Technical Specification Depth", "max_points": 25}, {"criterion": "Custom KiCad Circuit Design", "max_points": 25}, {"criterion": "Firmware State Machine Architecture", "max_points": 25}, {"criterion": "Economic & Impact Assessment", "max_points": 25}]',
    ARRAY['Complete System Architecture Document', 'KiCad Schematic & PCB Layout Files', 'UML State Machine Diagram', 'Bill of Materials with African Vendor Sourcing'],
    1
  ),
  (
    '00000000-0000-0000-0000-000000000002',
    'assigned_final_design',
    'Intermediate Level Capstone 2: Autonomous Micromouse Maze Rover or Aquatic ROV Build',
    'Fabricate and calibrate an advanced physical or high-fidelity simulated robot featuring closed-loop PID control and autonomous navigation.',
    'Build either a high-speed PID Micromouse that solves a multi-branch maze autonomously, or a tethered Underwater ROV with neutral buoyancy and 3-axis thruster vectoring. Must include custom PCB or perfboard wiring, wireless telemetry, and fail-safe watchdog.',
    '[{"criterion": "Mechanical Rigidity & Waterproofing / Dynamics", "max_points": 20}, {"criterion": "Closed-Loop PID Control Performance", "max_points": 25}, {"criterion": "Firmware FSM & Wireless Telemetry", "max_points": 25}, {"criterion": "Autonomous Mission Execution", "max_points": 20}, {"criterion": "Engineering Notebook & Defense Video", "max_points": 10}]',
    ARRAY['Working Rover or ROV Prototype', 'Git Repository with Clean C++ Code & Tests', 'Engineering Notebook PDF', '3-Minute Video Defense demonstrating autonomous performance'],
    2
  )
ON CONFLICT DO NOTHING;

-- ------------------------------------------------------------------------------
-- F. SEED ADVANCED LEVEL MODULES (15 FULL COMPREHENSIVE MODULES)
-- ------------------------------------------------------------------------------
INSERT INTO public.course_modules (
  course_id, module_number, order_index, title, coherent_skill_area,
  description, theory_overview, video_url, video_title, video_duration_seconds,
  guided_lab_title, guided_lab_instructions, guided_lab_equipment, guided_lab_simulation_url,
  assignment_title, assignment_instructions, assignment_max_points,
  troubleshooting_guide, mentor_support_topic, is_published
) VALUES
  (
    '00000000-0000-0000-0000-000000000003',
    1, 1,
    'Embedded Linux & Single Board Computers (Raspberry Pi)',
    'Linux System Architecture & Headless Embedded Systems',
    'Transition from microcontrollers to full operating systems: Linux kernel, headless SSH, systemd services, GPIO memory mapping, and IPC.',
    'Complex robotics algorithms (computer vision, SLAM, neural nets) require operating systems with virtual memory, multi-core scheduling, and high-level networking stacks.',
    'https://www.youtube.com/watch?v=kY3n_vG_4z0', 'Embedded Linux for Robotics: From Boot to Shell', 420,
    'Lab 1: Headless Linux Setup & Real-Time Serial Bridge to Microcontroller',
    'Configure a Raspberry Pi with Debian/Ubuntu Server. Establish an automated systemd service that boots a Python/C++ daemon reading UART telemetry from an ESP32 at 921600 baud.',
    ARRAY['Raspberry Pi 4 / 5', 'MicroSD Card', 'ESP32 coprocessor', 'USB-to-UART bridge'],
    'https://wokwi.com',
    'Practical Assignment 1: Automated Watchdog System Service',
    'Write a production-grade systemd unit file and monitoring script that restarts the robotics process automatically if memory leaks exceed 500MB or CPU hangs occur.',
    100,
    'Common Bug: SD card corrupts when power is disconnected abruptly. Robots get powered off with switches. Configure the root filesystem as Read-Only or use an overlayfs architecture.',
    'Topic: Read-only filesystems and graceful shutdown procedures for mobile robots',
    TRUE
  ),
  (
    '00000000-0000-0000-0000-000000000003',
    2, 2,
    'Robot Operating System 2 (ROS 2) Core Architecture',
    'DDS Middleware, Nodes, Topics, Services & Actions',
    'Master the global robotics industry standard: ROS 2 Humble/Iron, Data Distribution Service (DDS), publisher/subscriber topics, services, actions, and colcon build systems.',
    'ROS 2 is a distributed modular framework. Instead of a single monolithic script, robotic tasks are divided into isolated nodes that communicate over asynchronous typed topics.',
    'https://www.youtube.com/watch?v=0k5G6FmP7z8', 'ROS 2 Core Architecture: Nodes, Topics & Actions', 450,
    'Lab 2: Creating a Custom ROS 2 Package with Publisher and Subscriber Nodes',
    'Create a C++ or Python ROS 2 package. Build a sensor_node that publishes custom telemetry messages at 50Hz and a motor_controller_node that consumes commands and computes motor velocities.',
    ARRAY['Linux / Ubuntu 22.04 environment', 'ROS 2 Humble SDK'],
    'https://docs.ros.org/en/humble',
    'Practical Assignment 2: Multi-Node Teleoperation with Action Server',
    'Implement a ROS 2 Action Server for a linear actuator extension: provides continuous feedback percentage during movement and allows client cancellation midway.',
    100,
    'Common Bug: ROS 2 nodes cannot find each other across the network. Check ROS_DOMAIN_ID environment variable! All nodes must share identical domain IDs to communicate over DDS multicast.',
    'Topic: DDS multicast network configurations and ROS_DOMAIN_ID isolation',
    TRUE
  ),
  (
    '00000000-0000-0000-0000-000000000003',
    3, 3,
    'Computer Vision & OpenCV on the Edge',
    'Pixel Pipelines, Color Space Filtering & Contours',
    'Equip robots with vision: camera matrix calibration, undistortion, HSV color space segmentation, morphological opening/closing, and contour bounding boxes.',
    'RGB color space is sensitive to shadows and sunlight. Converting camera frames to HSV (Hue, Saturation, Value) separates color chrominance from brightness, enabling robust visual detection.',
    'https://www.youtube.com/watch?v=oXlwWbU8l2o', 'OpenCV for Robotics: From Pixels to Spatial Coordinates', 420,
    'Lab 3: Real-Time Ball/Fruit Detection with HSV Masking',
    'Stream camera frames at 30 FPS. Apply Gaussian blur, threshold HSV bounds for a bright orange ball or green crop, extract contours, and compute the (X, Y) pixel centroid in real time.',
    ARRAY['Raspberry Pi + Camera Module', 'OpenCV 4.8+', 'Target colored object'],
    'https://opencv.org',
    'Practical Assignment 3: Visual Servoing Centroid Tracker',
    'Connect OpenCV centroid coordinates to robot steering logic: if the target object moves to the right of frame center, compute an angular error and steer the rover to keep the object centered.',
    100,
    'Common Bug: High latency and camera frame buffer backlog. In OpenCV, cap.read() reads stale frames from the OS buffer. Run frame capture in a dedicated threaded worker pool.',
    'Topic: Threaded video frame capture and camera buffer flushing techniques',
    TRUE
  ),
  (
    '00000000-0000-0000-0000-000000000003',
    4, 4,
    'Object Detection & Edge Machine Learning (TensorFlow Lite)',
    'Neural Networks, Model Quantization & Coral Edge TPU',
    'Deploy machine learning models on constrained edge hardware: MobileNet SSD, YOLOv8-nano, INT8 quantization, and hardware acceleration with Google Coral TPU.',
    'Traditional computer vision fails in chaotic outdoor African environments. Convolutional neural networks recognize objects (weeds, crops, humans, livestock) regardless of lighting or angle variations.',
    'https://www.youtube.com/watch?v=kY3n_vG_4z0', 'Edge AI for Robots: Quantized Neural Networks', 440,
    'Lab 4: Deploying a Quantized MobileNet Crop Weed Classifier',
    'Load an INT8 quantized TFLite object detection model on Raspberry Pi. Benchmark inference time on CPU vs hardware accelerator, achieving 25+ FPS real-time classification.',
    ARRAY['Raspberry Pi 4 / 5', 'Camera Module', 'TensorFlow Lite runtime'],
    'https://tensorflow.org/lite',
    'Practical Assignment 4: Autonomous Robotic Harvesting Gatekeeper',
    'Build an edge AI vision pipeline that classifies ripe vs unripe produce (e.g. tomatoes). Only trigger the harvesting actuator when confidence score exceeds 85%.',
    100,
    'Common Bug: Model inference consumes 100% of all CPU cores, causing throttling and frame drops. Pin inference threads and use INT8 quantization rather than full FP32 float models.',
    'Topic: Model quantization trade-offs and CPU thread pinning for embedded inference',
    TRUE
  ),
  (
    '00000000-0000-0000-0000-000000000003',
    5, 5,
    'Kinematics, Dynamics & Robotic Manipulator Arms',
    'Forward/Inverse Kinematics, Denavit-Hartenberg & Trajectories',
    'Master robotic arm mathematics: Forward Kinematics (FK via DH parameters), Inverse Kinematics (IK via trigonometric and Jacobian methods), and cubic polynomial trajectory smoothing.',
    'To pick up an object at coordinate (X, Y, Z), a robotic arm cannot guess joint angles. Inverse Kinematics calculates the exact servo angles required for the end-effector to reach the target position.',
    'https://www.youtube.com/watch?v=VusKAxfJgls', 'Robotic Arms: Forward & Inverse Kinematics Solvers', 460,
    'Lab 5: Programming a 3-DOF Planar Arm Inverse Kinematics Solver',
    'Build an analytic IK solver in C++/Python for a 3-link arm. Provide desired Cartesian end-effector coordinates (X, Y, Z) and calculate servo angles theta1, theta2, theta3 in real time.',
    ARRAY['3-DOF / 4-DOF Robotic Arm Kit', 'Servo Drivers', 'Microcontroller / RPi'],
    'https://wokwi.com',
    'Practical Assignment 5: Pick-and-Place Trajectory Execution',
    'Program the robotic arm to pick a colored block from Position A, lift along a smooth parabolic arc (preventing object slippage), and place it precisely into Bin B with sub-centimeter repeatability.',
    100,
    'Common Bug: Mathematical singularities. At joint limits or full arm extension, the Jacobian matrix becomes singular and joint velocities approach infinity. Add singularity workspace guards.',
    'Topic: Workspace boundary clamping and singularity avoidance algorithms',
    TRUE
  ),
  (
    '00000000-0000-0000-0000-000000000003',
    6, 6,
    'SLAM (Simultaneous Localization and Mapping) & LiDAR Navigation',
    '2D/3D LiDAR, Cartographer SLAM & Costmaps',
    'Solve the fundamental robotics challenge: How can a robot navigate an unknown environment when it doesn’t know where it is and doesn’t have a map? Master 2D LiDAR, scan matching, and Cartographer.',
    'SLAM uses probabilistic filtering and graph optimization to build an occupancy grid map while simultaneously estimating the robot’s pose within that emerging map.',
    'https://www.youtube.com/watch?v=saVZtgPyyJQ', 'LiDAR SLAM: Building 2D Maps with ROS 2', 450,
    'Lab 6: Mapping an Indoor Arena with a 360-Degree LiDAR',
    'Mount an RPLiDAR A1 on your mobile robot. Run Cartographer or SlamToolbox in ROS 2. Drive the rover through a complex room to generate a high-resolution 2D occupancy grid map.',
    ARRAY['Raspberry Pi', 'RPLiDAR A1 / A2 Scanner', 'Differential Drive Rover Base'],
    'https://ros.org',
    'Practical Assignment 6: Autonomous Waypoint Navigation in Nav2',
    'Load your saved occupancy map into the ROS 2 Nav2 stack. Send Cartesian goal coordinates across the arena; observe the robot calculate an optimal global path and dynamically detour around unexpected obstacles.',
    100,
    'Common Bug: Map becomes sheared or rotated out of alignment. Cause: Inaccurate wheel odometry or wheels slipping on slick arena tiles. Tune scan-matching weights in the SLAM configuration.',
    'Topic: Scan-to-map correlation thresholds and odometry covariance calibration',
    TRUE
  ),
  (
    '00000000-0000-0000-0000-000000000003',
    7, 7,
    'High-Power Actuation, Brushless Motors & ESC Systems',
    'BLDC Motors, Electronic Speed Controllers & Field-Oriented Control',
    'Step up to industrial actuation: Brushless DC (BLDC) motors, 3-phase stator winding commutation, Electronic Speed Controllers (ESCs), Back-EMF sensing, and Field-Oriented Control (FOC).',
    'Brushed motors wear out and lack torque density. High-speed competition rovers, drones, and heavy agricultural rovers use brushless motors commutated by high-frequency MOSFET inverters.',
    'https://www.youtube.com/watch?v=bCEiOnuODac', 'Brushless DC Motors & Field-Oriented Control (FOC)', 420,
    'Lab 7: Programming Closed-Loop BLDC FOC Velocity Control',
    'Interface a high-torque gimbal BLDC motor with an AS5600 magnetic angle sensor. Use SimpleFOC library to drive 3-phase MOSFET bridges with smooth, cog-free rotation at 1 RPM up to 1000 RPM.',
    ARRAY['Brushless Motor', 'SimpleFOC Shield / Driver', 'AS5600 Magnetic Encoder', '12V Power Supply'],
    'https://simplefoc.com',
    'Practical Assignment 7: High-Power ESC Throttle Calibration & Telemetry',
    'Calibrate an industrial 30A BLDC ESC using 1000us - 2000us PWM pulses. Log current draw under variable torque loads and demonstrate active regenerative braking.',
    100,
    'Common Bug: High current draw burns motor driver instantaneously. High-inductance BLDC leads generate massive voltage spikes during rapid deceleration. Always install low-ESR bulk electrolytic capacitors!',
    'Topic: Flyback voltage protection and regenerative braking current dissipation',
    TRUE
  ),
  (
    '00000000-0000-0000-0000-000000000003',
    8, 8,
    'RTOS (FreeRTOS) & Real-Time Multithreading',
    'Real-Time Operating Systems, Semaphores & Preemptive Priority',
    'When Linux is too slow: deploy FreeRTOS on dual-core microcontrollers (ESP32 / STM32). Master tasks, preemptive priority scheduling, mutexes, semaphores, and message queues.',
    'General-purpose OS kernels cannot guarantee microsecond response times. A Real-Time Operating System guarantees that high-priority safety-critical tasks execute deterministically within guaranteed deadlines.',
    'https://www.youtube.com/watch?v=F321087yYy4', 'FreeRTOS for Robotics: Multithreading & Queues', 410,
    'Lab 8: Architecting a Dual-Core Multi-Tasking Robotics Kernel',
    'On an ESP32, pin a high-speed 1kHz motor PID loop to Core 0 with high priority. Run sensor parsing, wireless telemetry, and display rendering on Core 1 using FreeRTOS queues for thread-safe data passing.',
    ARRAY['ESP32 NodeMCU Development Board', 'Dual-core FreeRTOS C++ environment'],
    'https://freertos.org',
    'Practical Assignment 8: Priority Inversion Prevention with Mutexes',
    'Demonstrate the classic Priority Inversion problem and solve it using FreeRTOS Priority Inheritance Mutexes. Submit timing logic analyzer traces.',
    100,
    'Common Bug: FreeRTOS Stack Overflow crash (Guru Meditation Error). Each task allocates its own stack memory. Allocate at least 4096 bytes for tasks using floating-point math or sprintf.',
    'Topic: Task stack depth sizing, watermarks, and memory heap management in RTOS',
    TRUE
  ),
  (
    '00000000-0000-0000-0000-000000000003',
    9, 9,
    'Industrial Automation, PLCs & Fieldbus Communication',
    'Industrial Control, 24V Logic, Modbus TCP & CAN Bus',
    'Bridge youth innovation with industrial automation: Programmable Logic Controllers (PLCs), ladder logic, 24V industrial sensor interfacing, Modbus TCP/RTU, and automotive CAN Bus (ISO 11898).',
    'Factories, mines, and automated commercial farms in Africa run on industrial fieldbus protocols. CAN Bus allows tens of electronic control units to communicate reliably across noisy industrial environments.',
    'https://www.youtube.com/watch?v=nL34zDTPkcs', 'Industrial Robotics: PLCs, CAN Bus & Modbus', 430,
    'Lab 9: Interfacing Microcontrollers to an Automotive CAN Bus Network',
    'Connect two MCP2515 CAN Bus transceivers over a differential twisted-pair cable (CAN_H and CAN_L with 120-ohm termination resistors). Transmit priority automotive sensor frames at 500 kbps.',
    ARRAY['2x ESP32 / Arduino', '2x MCP2515 CAN Bus Modules', 'Twisted-pair cable'],
    'https://wokwi.com',
    'Practical Assignment 9: Modbus TCP Industrial Remote Terminal Unit (RTU)',
    'Implement a Modbus TCP server on an ESP32. Expose robot telemetry variables as Modbus Holding Registers and read them using an industrial SCADA dashboard (e.g. Node-RED).',
    100,
    'Common Bug: CAN Bus communication errors. CAN lines must have exactly two 120-ohm termination resistors—one at each physical end of the bus—yielding an equivalent resistance of 60 ohms.',
    'Topic: Differential signaling, bus termination, and common-mode industrial noise',
    TRUE
  ),
  (
    '00000000-0000-0000-0000-000000000003',
    10, 10,
    'Swarm Robotics & Multi-Agent Coordination',
    'Distributed Algorithms, Consensus & Flocking Behaviors',
    'Beyond single robots: coordinate decentralized multi-robot swarms using bio-inspired algorithms (Reynolds Flocking: Separation, Alignment, Cohesion) and mesh networking.',
    'In large-scale agricultural mapping or disaster search-and-rescue, a swarm of 10 low-cost collaborative robots outperforms a single expensive robot while providing massive fault tolerance.',
    'https://www.youtube.com/watch?v=0rlvvYgmTvI', 'Swarm Robotics: Flocking & Decentralized Consensus', 390,
    'Lab 10: Programming Multi-Robot Boids Flocking in Webots Simulation',
    'In Webots open-source simulator, program 5 autonomous rovers that navigate an open environment together while maintaining equal spacing and avoiding obstacles through local consensus without a central server.',
    ARRAY['Computer with Webots / Gazebo simulation installed'],
    'https://cyberbotics.com',
    'Practical Assignment 10: Decentralized Grid Search & Boundary Coverage Algorithm',
    'Design an algorithmic protocol where 3 rovers divide a 100m x 100m field into dynamic search sectors. If one rover fails, the remaining two detect the timeout and repartition the remaining area automatically.',
    100,
    'Common Bug: Swarm agents collide during convergence. Reynolds Separation force must have higher priority and steeper exponential repulsion curves at close proximities than cohesion forces.',
    'Topic: Spatial repulsion dynamics and mesh message collision mitigation',
    TRUE
  ),
  (
    '00000000-0000-0000-0000-000000000003',
    11, 11,
    'Fail-Safe Engineering, Redundancy & Safety-Critical Systems',
    'ISO 13849 Safety Integrity, Hardware Interlocks & E-Stops',
    'Safety engineering for heavy autonomous systems: dual-channel hardwired Emergency Stops (E-Stop), independent hardware watchdog timers, fault trees, and fail-safe default states.',
    'When an autonomous robot weighs 30+ kg or carries sharp harvesting blades, software crashes cannot be allowed to cause injury. Safety systems must be hardwired into the power rail, bypassing microcontrollers.',
    'https://www.youtube.com/watch?v=p4v3gYl4xYI', 'Safety-Critical Engineering: Fail-Safes & Hardwired E-Stops', 400,
    'Lab 11: Wiring an ISO-Compliant Dual-Channel Safety Relay E-Stop',
    'Wire a physical industrial mushroom E-Stop button with dual normally-closed (NC) contacts into a safety power contactor. Verify that opening either contact cuts actuator power within 15 milliseconds.',
    ARRAY['Industrial E-Stop Pushbutton', '24V Contactor / Heavy-duty Relay', 'Multimeter', 'Power supply'],
    'https://www.falstad.com/circuit/',
    'Practical Assignment 11: Failure Modes and Effects Analysis (FMEA)',
    'Conduct a formal FMEA risk assessment on your competition robot: identify 10 potential failure modes (e.g. sensor wire disconnect, stuck throttle, battery thermal runaway), compute Risk Priority Numbers (RPN), and engineer mitigation safeguards.',
    100,
    'Common Bug: E-Stop button wired as an input to a microcontroller pin that turns off motors in code. Software can freeze in an infinite loop! E-Stop contacts must physically disconnect actuator power directly.',
    'Topic: Hardwired safety interlocks vs software supervisory loops',
    TRUE
  ),
  (
    '00000000-0000-0000-0000-000000000003',
    12, 12,
    'Biomimetic Robotics & Soft Actuation',
    'Bio-Inspired Locomotion, Pneumatics & Compliant Grippers',
    'Learn from biological evolution: quadruped trotting kinematics, serpentine crawling, fish-fin aquatic propulsion, and silicone pneumatic soft grippers for gentle agricultural harvesting.',
    'Rigid metal grippers bruise delicate fruits like tomatoes or avocados. Biomimetic soft robotics uses compliant elastic materials that deform naturally around irregular organic shapes.',
    'https://www.youtube.com/watch?v=CqFvOQ2_o20', 'Biomimetic Robotics: Soft Grippers & Bio-Locomotion', 380,
    'Lab 12: Casting a Silicone Pneumatic Fin-Ray Robotic Gripper',
    'Cast a compliant silicone rubber gripper finger using a 3D-printed mold. Apply air pressure from a small diaphragm pump to achieve 90-degree compliant curling around delicate objects.',
    ARRAY['Silicone casting kit / 3D-printed Fin-Ray finger', 'Miniature 12V Air Pump & Solenoid'],
    'https://wokwi.com',
    'Practical Assignment 12: Delicate Fruit Harvesting Benchmark',
    'Test your soft gripper on fragile raw eggs and ripe fruit. Measure grip force, cycle speed, and verify zero surface bruising or cracking across 20 continuous grasping cycles.',
    100,
    'Common Bug: Uneven silicone wall thickness causes the soft actuator to balloon outward rather than curling inwards. Degas silicone in a vacuum chamber before pouring to eliminate air bubbles.',
    'Topic: Silicone curing degassing and pneumatic pressure regulation',
    TRUE
  ),
  (
    '00000000-0000-0000-0000-000000000003',
    13, 13,
    'Digital Twins & Gazebo Simulation Modeling',
    'URDF Modeling, Physics Engines & Virtual Prototyping',
    'Develop and validate robots before spending money on hardware: Unified Robot Description Format (URDF), inertial matrices, Gazebo physics simulation, and virtual sensor plugins.',
    'Digital twins accelerate engineering. Developing algorithms in high-fidelity physics simulations allows teams to run thousands of test hours without breaking expensive real-world motors or frames.',
    'https://www.youtube.com/watch?v=saVZtgPyyJQ', 'Building Digital Twins with Gazebo & URDF', 440,
    'Lab 13: Authoring a Full Robot URDF Model with Physics Properties',
    'Write a complete XML URDF file defining chassis links, wheel joints, mass properties, collision geometries, and Gazebo differential drive transmission plugins.',
    ARRAY['Computer with ROS 2 and Gazebo Classic / Fortress installed'],
    'https://gazebosim.org',
    'Practical Assignment 13: Virtual Arena Simulation Benchmark Run',
    'Spawn your digital twin inside a 3D replica of the YARA 2026 National Championship Arena. Record simulation telemetry proving your navigation algorithms clear the virtual course.',
    100,
    'Common Bug: Robot explodes or vibrates uncontrollably upon spawning in Gazebo. Cause: Calculated inertia tensor moments are too small or non-physical. Compute accurate inertia tensors using CAD software.',
    'Topic: Inertia tensor calculation formulas and Gazebo ODE physics solver stability',
    TRUE
  ),
  (
    '00000000-0000-0000-0000-000000000003',
    14, 14,
    'Engineering Economics, Rapid Prototyping & DFM (Design for Manufacturing)',
    'Unit Economics, Injection Molding, CNC & Scale Production',
    'Transitioning an African prototype into a commercial product: Design for Manufacturing (DFM), CNC milling vs 3D printing tolerances, sheet metal bending, injection mold draft angles, and unit cost curves.',
    'Building 1 robot in a lab is prototyping; building 1,000 reliable robots for African farmers requires manufacturing engineering, supply chain redundancy, and unit economic discipline.',
    'https://www.youtube.com/watch?v=vaCVh2SAZY4', 'Design for Manufacturing: Scaling Robotics Hardware', 410,
    'Lab 14: DFM Optimization of a 3D-Printed Robotic Arm Bracket',
    'Take a complex machined bracket and redesign it for 3D printing and sheet metal bending: eliminate overhangs, orient print layer lines against shear stresses, and minimize print duration by 40%.',
    ARRAY['CAD Software (Fusion 360 / FreeCAD / Onshape)', '3D Slicer software'],
    'https://onshape.com',
    'Practical Assignment 14: Comprehensive Cost-Reduction & Scaling Audit',
    'Take your capstone robot BOM and perform a complete DFM cost reduction audit. Identify 5 components that can be consolidated or replaced with local African materials to cut production cost by 30%.',
    100,
    'Common Bug: 3D printed parts snap along layer lines under motor torque. FDM prints are anisotropic; they are 50% weaker along the Z-axis. Orient print layers parallel to primary tensile forces.',
    'Topic: Anisotropic mechanical strength in rapid prototyping and grain orientation',
    TRUE
  ),
  (
    '00000000-0000-0000-0000-000000000003',
    15, 15,
    'National & Global Robotics Competition Engineering Defense',
    'International Regulations, Engineering Notebook & Technical Defense',
    'The pinnacle of competitive robotics: defending complex engineering solutions before international judges, handling live technical grill sessions, and preparing for global robotics olympiads.',
    'Judges look beyond flashy demos. They interrogate the team’s mathematical modeling, trade-off justifications, code architecture, and individual contributions of both male and female team members.',
    'https://www.youtube.com/watch?v=Y8kK8YmP1v4', 'International Robotics Defense: Pitching to Engineering Judges', 450,
    'Lab 15: Executing a 10-Minute Technical Defense & Live Code Audit',
    'Present your team’s complete robotic system in a simulated championship judging room: 3-minute executive presentation, 2-minute live hardware demonstration, and 5 minutes defending technical architectural choices.',
    ARRAY['Completed Advanced Robot', 'Official Engineering Notebook', 'Live display screen'],
    'https://yara.org/competition',
    'Practical Assignment 15: Master 40-Page Engineering Thesis Document',
    'Compile the comprehensive Master Engineering Thesis covering all 15 modules: theoretical kinematics, circuit schematics, ROS 2 architecture, sensor fusion filters, FMEA safety analysis, and field test validation data.',
    100,
    'Common Bug: Only one vocal member answers all judge questions. International judges penalize teams where members don’t demonstrate equal mastery. All 4 team members (2 boys, 2 girls) must present specialized domains.',
    'Topic: Cross-functional domain presentation and gender parity presentation defense',
    TRUE
  )
ON CONFLICT (course_id, module_number) DO UPDATE SET
  title = EXCLUDED.title,
  coherent_skill_area = EXCLUDED.coherent_skill_area,
  description = EXCLUDED.description,
  theory_overview = EXCLUDED.theory_overview,
  guided_lab_title = EXCLUDED.guided_lab_title,
  assignment_title = EXCLUDED.assignment_title;

-- ------------------------------------------------------------------------------
-- G. SEED ADVANCED LEVEL CAPSTONE PROJECTS
-- ------------------------------------------------------------------------------
INSERT INTO public.course_projects (
  course_id, project_type, title, description, guidelines, rubric, deliverables_required, order_index
) VALUES
  (
    '00000000-0000-0000-0000-000000000003',
    'research_and_design',
    'Advanced Level Capstone 1: Industrial AMR or Agricultural Harvester System Architecture',
    'Develop an enterprise-grade Autonomous Mobile Robot (AMR) or Agricultural Smart-Harvester architecture for African commercial deployment.',
    'Complete an end-to-end technical system architecture: 3D CAD model, finite element analysis (FEA), ROS 2 node computation topology, dual-channel E-Stop safety interlocks, and economic return-on-investment (ROI) analysis for end users.',
    '[{"criterion": "System Architecture & ROS 2 Topology", "max_points": 25}, {"criterion": "Mechanical Engineering & DFM Rigor", "max_points": 25}, {"criterion": "Safety Interlocks & FMEA Analysis", "max_points": 25}, {"criterion": "Commercial ROI & Supply Chain Viability", "max_points": 25}]',
    ARRAY['40-Page Master Technical Architecture Document', '3D CAD Model & Stress Analysis', 'ROS 2 Computation Graph', 'FMEA Risk Assessment Matrix'],
    1
  ),
  (
    '00000000-0000-0000-0000-000000000003',
    'assigned_final_design',
    'Advanced Level Capstone 2: Autonomous Mobile Robot with Computer Vision & SLAM Navigation',
    'Engineer, program, and demonstrate a fully autonomous production-grade Autonomous Mobile Robot (AMR) integrating all 15 Advanced Modules.',
    'The robot must autonomously navigate dynamic unknown environments using 2D/3D LiDAR SLAM, recognize and interact with target objects using Edge AI Computer Vision, execute real-time multithreading, and incorporate hardwired fail-safe safety systems.',
    '[{"criterion": "Mechanical Rigidity & Electrical Engineering", "max_points": 20}, {"criterion": "LiDAR SLAM & Path Planning Autonomous Performance", "max_points": 25}, {"criterion": "Edge AI Object Classification & Servoing Accuracy", "max_points": 25}, {"criterion": "Fail-Safe Safety Compliance & E-Stop Interlocks", "max_points": 20}, {"criterion": "Master Technical Defense & Demonstration", "max_points": 10}]',
    ARRAY['Fully Operational Autonomous AMR Robot', 'Complete Git Repository with ROS 2 Nodes & Unit Tests', 'Full Engineering Notebook & Documentation', '5-Minute Comprehensive Technical Defense Video'],
    2
  )
ON CONFLICT DO NOTHING;

-- ------------------------------------------------------------------------------
-- H. SEED FLAGSHIP COMPETITION & TRAINING PROGRAMS
-- ------------------------------------------------------------------------------
ALTER TABLE IF EXISTS public.competitions DROP CONSTRAINT IF EXISTS competitions_status_check;
ALTER TABLE IF EXISTS public.competitions DROP CONSTRAINT IF EXISTS competitions_format_check;

INSERT INTO public.competitions (
  id, title, slug, year, theme, description, status, venue, prize_pool_summary
) VALUES (
  'c0000000-0000-0000-0000-000000002026',
  'YARA Educational Robotics Competition 2026',
  'yara-competition-2026',
  2026,
  'Engineering Opportunity: Robotics and Innovation for Underserved Youth',
  'Zimbabwe premier multi-tier robotics championship. Featuring Autonomous Maze Solving, Underwater Drone Simulations, and Community Innovation Pitch Defense. Strict 2 boys + 2 girls gender parity composition required.',
  'active',
  'National Championship Arena & Hybrid Regional Centers',
  '$5,000 in Hardware Grants, STEM Lab Kits & International Travel Sponsorship'
) ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  theme = EXCLUDED.theme,
  description = EXCLUDED.description,
  status = EXCLUDED.status;

ALTER TABLE IF EXISTS public.competition_categories DROP CONSTRAINT IF EXISTS competition_categories_weight_check;

INSERT INTO public.competition_categories (competition_id, name, weight_percentage, description, order_index)
VALUES 
  ('c0000000-0000-0000-0000-000000002026', 'Underwater Drone Missions', 35, 'Buoyancy control, obstacle traversal, and precision payload retrieval simulated in dynamic aquatic conditions.', 1),
  ('c0000000-0000-0000-0000-000000002026', 'Autonomous Maze Solving (Micromouse)', 35, 'High-speed autonomous maze mapping, IR/Ultrasonic line tracking, and PID wall following without teleoperation.', 2),
  ('c0000000-0000-0000-0000-000000002026', 'Innovation Pitch Defense', 30, 'Defense of real community engineering solutions before a panel of industrial engineering judges and investors.', 3)
ON CONFLICT DO NOTHING;

ALTER TABLE IF EXISTS public.training_programs DROP CONSTRAINT IF EXISTS training_programs_status_check;
ALTER TABLE IF EXISTS public.training_programs DROP CONSTRAINT IF EXISTS training_programs_format_check;
ALTER TABLE IF EXISTS public.training_programs DROP CONSTRAINT IF EXISTS training_programs_category_check;
ALTER TABLE IF EXISTS public.training_programs DROP CONSTRAINT IF EXISTS training_programs_target_audience_check;

INSERT INTO public.training_programs (
  title, slug, description, target_audience, category, format, duration_weeks, total_hours, fee_usd, capacity, venue, status, is_featured
) VALUES
  (
    'AI for Educators & Robotics Patrons Bootcamp',
    'ai-for-educators-bootcamp',
    'Specialized pedagogical certification equipping teachers and patrons with practical AI lesson planning, microcontroller lab instruction, and robotics competition coaching skills.',
    'Teachers / Patrons',
    'AI & IoT',
    'Blended',
    4, 16, 10.00, 150,
    'Live Virtual Workshop + Provincial Chapter Centers',
    'open_for_registration',
    TRUE
  ),
  (
    'Junior Robotics Engineering & Embedded C++ Sprint',
    'junior-robotics-engineering-sprint',
    'Hands-on introductory sprint for secondary school learners. Covers circuit fundamentals, motor drivers, sensor arrays, and microcontroller programming.',
    'Students',
    'Robotics',
    'Blended',
    6, 24, 15.00, 200,
    'School Robotics Clubs & Online Portal',
    'open_for_registration',
    TRUE
  ),
  (
    'School Robotics Patron & Coach Certification',
    'school-patron-coach-certification',
    'Comprehensive training program for school coordinators establishing or expanding school robotics clubs, managing kit hardware, and preparing teams for national championships.',
    'Coaches',
    'STEM Education',
    'Blended',
    3, 12, 0.00, 80,
    'Provincial Innovation Centers',
    'open_for_registration',
    TRUE
  )
ON CONFLICT (slug) DO NOTHING;

-- Seed Verified Impact Metrics for Mashwest and Zimbabwe
INSERT INTO public.impact_ledger (metric_key, metric_title, verified_value, unit, verification_source)
VALUES
  ('learners_reached_mashwest', 'Learners Trained in Mashonaland West (2025)', 1200, 'Students', 'Mashwest Outreach Verification Report Oct 2025'),
  ('teachers_upskilled', 'Robotics Patrons & Educators Upskilled', 48, 'Educators', 'Ministry of Primary & Secondary Education MoUs'),
  ('secondary_schools_equipped', 'Secondary Schools with Active STEM Clubs', 14, 'Schools', 'YARA School Network Directory 2025'),
  ('girls_in_robotics_percentage', 'Female Participation Rate in Competition Teams', 50, 'Percent', 'YARA 2026 2B+2G Parity Enforcement Rule')
ON CONFLICT (metric_key) DO UPDATE SET
  verified_value = EXCLUDED.verified_value;

-- Seed Mashwest Provincial Chapter
INSERT INTO public.chapters (
  name, province, city, lead_name, contact_email, members_count, schools_mentored_count, status
) VALUES (
  'Mashonaland West Provincial Chapter',
  'Mashonaland West',
  'Chinhoyi',
  'Simbarashe Manongwa',
  'goyaracorp@gmail.com',
  1200,
  14,
  'active'
) ON CONFLICT DO NOTHING;

-- Complete Schema Refresh Log
COMMENT ON SCHEMA public IS 'Young Africans Robotics Association (YARA) - Enterprise Master Architecture v3.1.0';

-- ==============================================================================
-- 18. LMS CENTRALIZATION — SINGLE SOURCE OF TRUTH COURSE SEEDS
-- ==============================================================================
-- Rule: ALL YARA courses must be managed, delivered, and completed inside the LMS.
-- The LMS database is the single source of truth for all educational content.

-- Ensure all required course columns and constraints exist even on existing database instances
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS code TEXT;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS track TEXT DEFAULT 'Robotics';
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS tier INTEGER DEFAULT 1;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS level TEXT DEFAULT 'Beginner';
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS short_summary TEXT;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS estimated_duration_hours INTEGER DEFAULT 20;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT TRUE;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS is_draft BOOLEAN DEFAULT FALSE;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS order_index INTEGER DEFAULT 0;

DO $$
BEGIN
  -- Ensure unique constraint on slug exists for ON CONFLICT (slug)
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'courses_slug_key'
  ) THEN
    BEGIN
      ALTER TABLE public.courses ADD CONSTRAINT courses_slug_key UNIQUE (slug);
    EXCEPTION
      WHEN OTHERS THEN NULL;
    END;
  END IF;

  -- Relax track check constraint safely to allow all central LMS catalog tracks
  ALTER TABLE IF EXISTS public.courses DROP CONSTRAINT IF EXISTS courses_track_check;
  ALTER TABLE IF EXISTS public.courses ADD CONSTRAINT courses_track_check 
    CHECK (track IN ('Robotics', 'Coding', 'Technology', 'Artificial Intelligence', 'IoT', 'Engineering', 'STEM', 'Specialized', 'Industrial Automation', 'Digital Literacy', 'Kids'));
EXCEPTION
  WHEN OTHERS THEN NULL;
END $$;


-- Seed canonical courses into public.courses
INSERT INTO public.courses (
  code, title, slug, track, tier, level, short_summary, description,
  estimated_duration_hours, is_published, is_draft, is_featured, order_index
) VALUES 
  (
    'YARA-ROB-BEG',
    'Robotics Mastery: Beginner (Tier 1)',
    'robotics-beginner',
    'Robotics',
    1,
    'Beginner',
    'Foundations of robotics, electronics, breadboarding, and visual block logic.',
    'Master physical computing fundamentals from Ohm''s Law and breadboard circuit assembly to microcontroller interfacing, motor drivers, and obstacle-avoidance rovers.',
    30,
    TRUE,
    FALSE,
    TRUE,
    1
  ),
  (
    'YARA-ROB-INT',
    'Robotics Mastery: Intermediate (Tier 2 & 3)',
    'robotics-intermediate',
    'Robotics',
    2,
    'Intermediate',
    'Embedded C++, PID closed-loop control, sensor telemetry, and maze navigation.',
    'Advance from basic circuits to autonomous algorithmic navigation. Covers PID speed/steering control, ultrasonic obstacle routing, infrared line sensors, and underwater ROV buoyancy systems.',
    45,
    TRUE,
    FALSE,
    TRUE,
    2
  ),
  (
    'YARA-ROB-ADV',
    'Robotics Mastery: Advanced Capstone (Tier 4)',
    'robotics-advanced',
    'Robotics',
    4,
    'Advanced',
    'Autonomous arena rovers, 5 Whys engineering defense, and competition capstones.',
    'The pinnacle of the YARA Robotics Academy. Complete multi-phase research, 21-point engineering reports, prototype stress tests, and defend your autonomous robot before technical judges.',
    60,
    TRUE,
    FALSE,
    TRUE,
    3
  ),
  (
    'YARA-TECH-PY',
    'Python & MicroPython for Robotics',
    'python-robotics',
    'Technology',
    2,
    'Intermediate',
    'Control hardware with Python, sensor libraries, serial telemetry, and MicroPython.',
    'A hands-on programming track bridging modern Python with microcontrollers (ESP32 and Raspberry Pi Pico). Learn non-blocking loops, sensor calibration, and serial telemetry dashboards.',
    25,
    TRUE,
    FALSE,
    FALSE,
    4
  ),
  (
    'YARA-TECH-SCR',
    'Scratch Visual Block Coding for Junior Engineers',
    'scratch-junior',
    'Technology',
    1,
    'Beginner',
    'Algorithmic thinking, interactive games, logic flow, and virtual robotics for kids.',
    'Inspiring youth aged 8–14 with visual block programming. Develop computational thinking, event-driven animation, maze navigation logic, and interactive STEM games.',
    15,
    TRUE,
    FALSE,
    FALSE,
    5
  ),
  (
    'YARA-TECH-JS',
    'JavaScript & Web Interfaces for Robotics Telemetry',
    'javascript-web-dev',
    'Technology',
    2,
    'Intermediate',
    'Build real-time robot dashboards, WebSerial connections, and telemetry graphing.',
    'Connect web applications directly to robotics hardware using WebSerial, WebSockets, and Canvas gauges. Build responsive telemetry stations for autonomous rovers.',
    20,
    TRUE,
    FALSE,
    FALSE,
    6
  ),
  (
    'YARA-STEM-EDU',
    'AI for Educators Masterclass & Pedagogical Tools',
    'ai-for-educators',
    'STEM',
    1,
    'All Levels',
    'Save 15+ hours weekly with prompt engineering, automated rubrics, and STEM pedagogy.',
    'Equip primary and secondary teachers with practical Artificial Intelligence tools for lesson planning, differentiated student support, microcontroller lab prep, and robotics coaching.',
    16,
    TRUE,
    FALSE,
    TRUE,
    7
  ),
  (
    'YARA-STEM-PAT',
    'School Robotics Club Patron & Coach Certification',
    'school-robotics-patron',
    'STEM',
    1,
    'All Levels',
    'Charter establishment, 2B+2G team recruitment, kit maintenance, and competition rules.',
    'Official accreditation for school teachers, patrons, and STEM coordinators establishing recognized YARA clubs. Covers lab safety, kit stewardship, and national qualifier logistics.',
    12,
    TRUE,
    FALSE,
    FALSE,
    8
  ),
  (
    'YARA-IND-PLC',
    'Industrial Automation, PLC & SCADA Systems',
    'industrial-automation-plc',
    'Specialized',
    3,
    'Advanced',
    'Ladder logic programming, industrial sensors, HMI design, and SCADA monitoring.',
    'Professional automation track exploring IEC 61131-3 PLC programming, relay logic, industrial networking (Modbus/Ethernet/IP), and SCADA supervisory control for factories and mines.',
    40,
    TRUE,
    FALSE,
    FALSE,
    9
  ),
  (
    'YARA-IND-CAD',
    'CAD Mechanical Prototyping & KiCad PCB Design',
    'cad-pcb-design',
    'Specialized',
    2,
    'Intermediate',
    'From breadboard to custom PCB and 3D printed robot chassis modeling.',
    'Move from prototype breadboards to custom 2-layer manufactured printed circuit boards. Learn KiCad schematic capture, PCB layout routing, and mechanical CAD 3D modeling.',
    30,
    TRUE,
    FALSE,
    FALSE,
    10
  )
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  track = EXCLUDED.track,
  tier = EXCLUDED.tier,
  level = EXCLUDED.level,
  short_summary = EXCLUDED.short_summary,
  description = EXCLUDED.description,
  estimated_duration_hours = EXCLUDED.estimated_duration_hours,
  is_published = EXCLUDED.is_published,
  is_featured = EXCLUDED.is_featured;

-- ==============================================================================
-- 24. EXTENDED LMS CURRICULUM, LEARNER PROGRESSION & ACCREDITED CERTIFICATES
-- ==============================================================================

-- Interactive Curriculum Sessions
CREATE TABLE IF NOT EXISTS public.curriculum_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  session_id TEXT UNIQUE NOT NULL, -- e.g. 'S01', 'S02', 'S42'
  course_id TEXT,
  course_level INTEGER DEFAULT 1,
  topic TEXT NOT NULL,
  part TEXT DEFAULT 'Electronics',
  type TEXT DEFAULT 'online' CHECK (type IN ('online', 'physical', 'physical_lab')),
  outcome TEXT,
  description TEXT,
  video_url TEXT,
  resources JSONB DEFAULT '[]',
  questions JSONB DEFAULT '[]',
  assignments JSONB DEFAULT '[]',
  projects JSONB DEFAULT '[]',
  details JSONB DEFAULT '{}',
  order_index INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.curriculum_sessions ADD COLUMN IF NOT EXISTS session_id TEXT;
ALTER TABLE public.curriculum_sessions ADD COLUMN IF NOT EXISTS course_id TEXT;
ALTER TABLE public.curriculum_sessions ADD COLUMN IF NOT EXISTS course_level INTEGER DEFAULT 1;
ALTER TABLE public.curriculum_sessions ADD COLUMN IF NOT EXISTS topic TEXT;
ALTER TABLE public.curriculum_sessions ADD COLUMN IF NOT EXISTS part TEXT DEFAULT 'Electronics';
ALTER TABLE public.curriculum_sessions ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'online';
ALTER TABLE public.curriculum_sessions ADD COLUMN IF NOT EXISTS outcome TEXT;
ALTER TABLE public.curriculum_sessions ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.curriculum_sessions ADD COLUMN IF NOT EXISTS video_url TEXT;
ALTER TABLE public.curriculum_sessions ADD COLUMN IF NOT EXISTS resources JSONB DEFAULT '[]';
ALTER TABLE public.curriculum_sessions ADD COLUMN IF NOT EXISTS questions JSONB DEFAULT '[]';
ALTER TABLE public.curriculum_sessions ADD COLUMN IF NOT EXISTS assignments JSONB DEFAULT '[]';
ALTER TABLE public.curriculum_sessions ADD COLUMN IF NOT EXISTS projects JSONB DEFAULT '[]';
ALTER TABLE public.curriculum_sessions ADD COLUMN IF NOT EXISTS details JSONB DEFAULT '{}';
ALTER TABLE public.curriculum_sessions ADD COLUMN IF NOT EXISTS order_index INTEGER DEFAULT 0;
ALTER TABLE public.curriculum_sessions ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT TRUE;

-- Real-Time Session Completion & Progress Engine
CREATE TABLE IF NOT EXISTS public.curriculum_progress (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  video_progress NUMERIC DEFAULT 0,
  quiz_status TEXT DEFAULT 'pending' CHECK (quiz_status IN ('pending', 'in_progress', 'passed', 'failed')),
  quiz_score INTEGER DEFAULT 0,
  assignment_status TEXT DEFAULT 'pending' CHECK (assignment_status IN ('pending', 'submitted', 'graded', 'approved')),
  project_status TEXT DEFAULT 'pending' CHECK (project_status IN ('pending', 'submitted', 'graded', 'approved')),
  is_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, session_id)
);

-- Practical Laboratory & Assignment Submissions
CREATE TABLE IF NOT EXISTS public.curriculum_submissions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  submission_type TEXT NOT NULL CHECK (submission_type IN ('assignment', 'project', 'quiz', 'lab')),
  item_id TEXT NOT NULL,
  content TEXT,
  submission_link TEXT,
  status TEXT DEFAULT 'submitted' CHECK (status IN ('submitted', 'under_review', 'graded', 'approved', 'rejected')),
  grade NUMERIC(5,2),
  feedback TEXT,
  reviewer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, session_id, submission_type, item_id)
);

-- Curriculum Session Feedback & Struggle Diagnostic
CREATE TABLE IF NOT EXISTS public.curriculum_feedback (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  status TEXT DEFAULT 'completed' CHECK (status IN ('completed', 'in_progress', 'struggling', 'needs_help')),
  success_comment TEXT,
  struggle_comment TEXT,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, session_id)
);

-- Knowledge Check Quiz Attempts
CREATE TABLE IF NOT EXISTS public.quiz_attempts (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  score INTEGER NOT NULL DEFAULT 0,
  total_questions INTEGER NOT NULL DEFAULT 0,
  percentage NUMERIC(5,2) NOT NULL DEFAULT 0.00,
  passed BOOLEAN NOT NULL DEFAULT FALSE,
  answers JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Comprehensive Robotics Final Examination Attempts
CREATE TABLE IF NOT EXISTS public.final_exam_attempts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  score INTEGER NOT NULL DEFAULT 0,
  total_questions INTEGER NOT NULL DEFAULT 0,
  percentage NUMERIC(5,2) NOT NULL DEFAULT 0.00,
  passed BOOLEAN NOT NULL DEFAULT FALSE,
  answers JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Capstone Robotics Engineering Project Submissions
CREATE TABLE IF NOT EXISTS public.final_project_submissions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  problem_statement TEXT,
  simulation_url TEXT,
  repo_url TEXT,
  video_url TEXT,
  documentation TEXT,
  status TEXT DEFAULT 'submitted' CHECK (status IN ('submitted', 'under_review', 'approved', 'revision_requested', 'rejected')),
  grade NUMERIC(5,2),
  feedback TEXT,
  reviewer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- YARA & Great Learning Accredited Digital Certificates
CREATE TABLE IF NOT EXISTS public.yara_accredited_certificates (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  certificate_number TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  user_email TEXT,
  student_name TEXT NOT NULL,
  course_id TEXT,
  course_title TEXT NOT NULL,
  course_category TEXT,
  certificate_type TEXT DEFAULT 'programming',
  robotics_level INTEGER,
  grade TEXT DEFAULT 'Distinction',
  score NUMERIC(5,2) DEFAULT 90.00,
  issue_date TIMESTAMPTZ DEFAULT now(),
  verification_url TEXT,
  payload JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Brainstorming & Critical Thinking Quizzes
CREATE TABLE IF NOT EXISTS public.brainstorming_quizzes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  difficulty TEXT DEFAULT 'beginner' CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  image_url TEXT,
  question TEXT NOT NULL,
  options JSONB DEFAULT '[]',
  correct_index INTEGER DEFAULT 0,
  hint TEXT,
  critical_thinking_principle TEXT,
  explanation TEXT,
  points INTEGER DEFAULT 10,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Brainstorming Learner Streaks & Attempts
CREATE TABLE IF NOT EXISTS public.brainstorming_attempts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  user_name TEXT,
  score INTEGER DEFAULT 0,
  total_questions INTEGER DEFAULT 0,
  streak INTEGER DEFAULT 0,
  category_breakdown JSONB DEFAULT '{}',
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- STEM Educator & Patron Training Registrations
CREATE TABLE IF NOT EXISTS public.training_registrations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  program_id TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  school_institution TEXT,
  registration_status TEXT DEFAULT 'confirmed' CHECK (registration_status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('waived', 'pending', 'paid', 'refunded')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Early Childhood STEM & Robotics Content (Ages 3-8)
CREATE TABLE IF NOT EXISTS public.yara_kids_content (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('video', 'song', 'flashcard', 'challenge')),
  description TEXT,
  media_url TEXT,
  video_url TEXT,
  audio_url TEXT,
  thumbnail_url TEXT,
  age_group TEXT DEFAULT '3-8 Years',
  category TEXT DEFAULT 'General STEM',
  lyrics TEXT,
  duration TEXT,
  word TEXT,
  definition TEXT,
  fun_fact TEXT,
  difficulty TEXT DEFAULT 'Fun',
  reward_stars INTEGER DEFAULT 10,
  question TEXT,
  options JSONB DEFAULT '[]',
  correct_option INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.yara_kids_content ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE public.yara_kids_content ADD COLUMN IF NOT EXISTS type TEXT;
ALTER TABLE public.yara_kids_content ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.yara_kids_content ADD COLUMN IF NOT EXISTS media_url TEXT;
ALTER TABLE public.yara_kids_content ADD COLUMN IF NOT EXISTS video_url TEXT;
ALTER TABLE public.yara_kids_content ADD COLUMN IF NOT EXISTS age_group TEXT DEFAULT '7-12';
ALTER TABLE public.yara_kids_content ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT TRUE;

-- ==============================================================================
-- 25. INDUSTRIAL MENTORSHIP, LIVE ROOMS & COLLABORATIVE COMMISSIONS
-- ==============================================================================

-- Live Video Mentorship Broadcasts
CREATE TABLE IF NOT EXISTS public.live_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  mentor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category TEXT DEFAULT 'Robotics & Hardware',
  room_id TEXT UNIQUE NOT NULL,
  video_url TEXT,
  required_skills TEXT[] DEFAULT '{}',
  is_live BOOLEAN DEFAULT TRUE,
  is_approved BOOLEAN DEFAULT FALSE,
  description TEXT,
  is_external BOOLEAN DEFAULT FALSE,
  scheduled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Student Live Broadcast Mentorship Requests
CREATE TABLE IF NOT EXISTS public.live_session_mentor_requests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  session_id UUID REFERENCES public.live_sessions(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  message TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'admitted', 'declined')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- One-on-One Mentorship Bookings & Inquiries
CREATE TABLE IF NOT EXISTS public.mentorship_requests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  requester_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  requester_name TEXT,
  mentor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'completed', 'cancelled')),
  message TEXT,
  whatsapp_number TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Threaded Mentorship Chat Messages
CREATE TABLE IF NOT EXISTS public.mentorship_messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  request_id TEXT NOT NULL,
  sender_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Mentee Ratings & Testimonials for Mentors
CREATE TABLE IF NOT EXISTS public.mentor_reviews (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  mentor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  request_id TEXT,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Commission Logs for Mentors
CREATE TABLE IF NOT EXISTS public.mentor_session_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  mentor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  amount_received NUMERIC(10,2) DEFAULT 0.00,
  description TEXT,
  admin_approved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Mentor Payout Ledger
CREATE TABLE IF NOT EXISTS public.mentor_payouts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  mentor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  mentor_name TEXT,
  mentor_email TEXT,
  amount NUMERIC(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  sessions_completed INTEGER DEFAULT 1,
  payment_method TEXT DEFAULT 'bank_transfer' CHECK (payment_method IN ('bank_transfer', 'mobile_money', 'paypal', 'crypto', 'cash')),
  payment_reference TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('completed', 'pending', 'processing', 'failed', 'rejected')),
  payout_date DATE DEFAULT CURRENT_DATE,
  notes TEXT,
  approved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Official Session Assignments for Mentors
CREATE TABLE IF NOT EXISTS public.session_assignments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  mentor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  session_id UUID REFERENCES public.live_sessions(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'assigned' CHECK (status IN ('assigned', 'pending', 'delivered', 'cancelled')),
  mentor_marked_delivered_at TIMESTAMPTZ,
  admin_verified_at TIMESTAMPTZ,
  payout_amount NUMERIC(10,2) DEFAULT 0.00,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Study Guides, Circuit Diagrams & Engineering Materials
CREATE TABLE IF NOT EXISTS public.study_materials (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  mentor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  mentor_name TEXT,
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT NOT NULL,
  file_type TEXT DEFAULT 'pdf',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ==============================================================================
-- 26. PAN-AFRICAN CHAPTERS, CHARTERS & REPORTING SYSTEM
-- ==============================================================================

-- New Chapter Charter Applications
CREATE TABLE IF NOT EXISTS public.chapter_registration_requests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  proposed_name TEXT NOT NULL,
  category TEXT DEFAULT 'university' CHECK (category IN ('university', 'high_school', 'primary_school', 'community_youth', 'polytechnic', 'provincial_hub')),
  institution_or_community TEXT NOT NULL,
  province TEXT NOT NULL,
  district_or_city TEXT NOT NULL,
  logo_url TEXT,
  banner_url TEXT,
  description TEXT,
  physical_location TEXT,
  meeting_schedule TEXT,
  focus_areas TEXT[] DEFAULT '{}',
  public_email TEXT NOT NULL,
  public_phone TEXT NOT NULL,
  total_members_count INTEGER DEFAULT 0,
  members JSONB DEFAULT '[]',
  leaders JSONB DEFAULT '[]',
  available_equipment TEXT,
  patron_advisor JSONB DEFAULT '{}',
  assigned_provincial_university_id UUID REFERENCES public.schools(id) ON DELETE SET NULL,
  assigned_provincial_university_name TEXT,
  submitted_by_name TEXT,
  submitted_by_email TEXT,
  submitted_by_phone TEXT,
  submitted_at TIMESTAMPTZ DEFAULT now(),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_review_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Chapter Membership Join Applications
CREATE TABLE IF NOT EXISTS public.chapter_join_requests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  chapter_id UUID REFERENCES public.chapters(id) ON DELETE CASCADE,
  chapter_name TEXT,
  chapter_code TEXT,
  province TEXT,
  chapter_category TEXT,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  institution TEXT NOT NULL,
  grade_or_year TEXT,
  role_applying_for TEXT DEFAULT 'Member',
  skills TEXT[] DEFAULT '{}',
  motivation TEXT,
  student_id TEXT,
  id_document_url TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  reviewed_by TEXT,
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,
  submitted_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Periodic Chapter Activity & Financial Reports
CREATE TABLE IF NOT EXISTS public.chapter_reports (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  chapter_id UUID REFERENCES public.chapters(id) ON DELETE CASCADE,
  chapter_name TEXT NOT NULL,
  chapter_category TEXT,
  report_title TEXT NOT NULL,
  report_category TEXT DEFAULT 'general' CHECK (report_category IN ('general', 'financial', 'project_milestone')),
  period_type TEXT DEFAULT 'monthly' CHECK (period_type IN ('monthly', 'quarterly', 'annual', 'special_event', 'project_milestone', 'financial')),
  period_date TEXT NOT NULL,
  submitted_by_name TEXT NOT NULL,
  submitted_by_role TEXT NOT NULL,
  submitted_by_email TEXT NOT NULL,
  submitted_by_leader_id TEXT,
  submitted_at TIMESTAMPTZ DEFAULT now(),
  executive_summary TEXT NOT NULL,
  activities_undertaken TEXT,
  attendance_count INTEGER DEFAULT 0,
  hardware_projects_update TEXT,
  challenges_and_needs TEXT,
  report_document_url TEXT,
  financial_statement_url TEXT,
  financial_data JSONB DEFAULT '{}',
  supporting_images TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'submitted' CHECK (status IN ('submitted', 'under_review', 'assessed', 'revisions_requested', 'approved')),
  executive_assessment JSONB DEFAULT '{}',
  is_locked BOOLEAN DEFAULT FALSE,
  locked_at TIMESTAMPTZ,
  locked_by_name TEXT,
  leadership_verified BOOLEAN DEFAULT FALSE,
  leadership_approved_by_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ==============================================================================
-- 27. COMPETITION ECOSYSTEM, VIRTUAL SPRINT ARENAS & SCORING
-- ==============================================================================

-- Centralized Competition Events & Editions
CREATE TABLE IF NOT EXISTS public.competition_events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  edition_year INTEGER DEFAULT 2026,
  theme TEXT,
  tagline TEXT,
  description TEXT,
  organizer TEXT DEFAULT 'Young Africans Robotics Association (YARA)',
  date_display TEXT,
  venue_display TEXT,
  registration_deadline_display TEXT,
  is_registration_open BOOLEAN DEFAULT TRUE,
  is_leaderboard_published BOOLEAN DEFAULT FALSE,
  categories JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Dynamic Competition Team Members & Gender Parity Verification
CREATE TABLE IF NOT EXISTS public.competition_team_members (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  team_id UUID REFERENCES public.competition_teams(id) ON DELETE CASCADE,
  registration_id UUID,
  full_name TEXT NOT NULL,
  age INTEGER,
  gender TEXT CHECK (gender IN ('boy', 'girl', 'male', 'female')),
  school_organization TEXT,
  grade_level TEXT,
  email TEXT,
  phone TEXT,
  role TEXT DEFAULT 'Team Member',
  is_captain BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Full Competition Team Registrations Dossier
CREATE TABLE IF NOT EXISTS public.yara_competition_registrations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  registration_id TEXT UNIQUE NOT NULL, -- e.g. YARA-RC26-000123
  event_id TEXT DEFAULT 'yara_rc_2026',
  event_name TEXT DEFAULT 'YARA Educational Robotics Competition 2026',
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  participant_type TEXT NOT NULL,
  participant_type_other TEXT,
  team_name TEXT NOT NULL,
  school_organization TEXT NOT NULL,
  province TEXT NOT NULL,
  district TEXT,
  city_town TEXT,
  team_leader_name TEXT NOT NULL,
  team_leader_email TEXT NOT NULL,
  team_leader_phone TEXT NOT NULL,
  mentor_name TEXT,
  mentor_email TEXT,
  mentor_phone TEXT,
  selected_categories TEXT[] DEFAULT '{}',
  members JSONB DEFAULT '[]',
  boys_count INTEGER DEFAULT 2,
  girls_count INTEGER DEFAULT 2,
  total_members INTEGER DEFAULT 4,
  is_gender_eligible BOOLEAN DEFAULT TRUE,
  underwater_drone_info JSONB DEFAULT '{}',
  autonomous_maze_info JSONB DEFAULT '{}',
  innovation_pitch_info JSONB DEFAULT '{}',
  documents JSONB DEFAULT '[]',
  video_demo_url TEXT,
  consents JSONB DEFAULT '{}',
  status TEXT DEFAULT 'Submitted' CHECK (status IN ('Draft', 'Submitted', 'Under Review', 'Approved', 'Corrections Required', 'Rejected', 'Withdrawn', 'Finalist', 'Winner')),
  admin_notes TEXT,
  correction_requests TEXT[] DEFAULT '{}',
  assigned_judge_ids TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Accredited Competition Judges
CREATE TABLE IF NOT EXISTS public.judges (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  specialty TEXT,
  assigned_categories TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Rubric Category Score Sheets
CREATE TABLE IF NOT EXISTS public.scores (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  registration_id TEXT,
  team_id UUID REFERENCES public.competition_teams(id) ON DELETE CASCADE,
  team_name TEXT,
  category TEXT NOT NULL,
  judge_id UUID REFERENCES public.judges(id) ON DELETE SET NULL,
  judge_name TEXT,
  score_data JSONB DEFAULT '{}',
  underwater_scores JSONB DEFAULT '{}',
  maze_scores JSONB DEFAULT '{}',
  pitch_scores JSONB DEFAULT '{}',
  final_category_score NUMERIC(5,2) DEFAULT 0.00,
  is_locked BOOLEAN DEFAULT FALSE,
  notes TEXT,
  submitted_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Virtual Robotics & Simulation Sprints (Wokwi & CAD)
CREATE TABLE IF NOT EXISTS public.virtual_competitions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT DEFAULT 'robot_simulation',
  category_label TEXT DEFAULT 'Robot Simulation Sprint',
  description TEXT,
  duration_hours INTEGER DEFAULT 48,
  starter_url TEXT DEFAULT 'https://wokwi.com/projects/',
  rules TEXT,
  criteria TEXT,
  max_score INTEGER DEFAULT 100,
  prize TEXT DEFAULT 'Verified Badge + $100 Hardware Voucher',
  image_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.virtual_competitions ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE public.virtual_competitions ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'robot_simulation';
ALTER TABLE public.virtual_competitions ADD COLUMN IF NOT EXISTS category_label TEXT DEFAULT 'Robot Simulation Sprint';
ALTER TABLE public.virtual_competitions ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.virtual_competitions ADD COLUMN IF NOT EXISTS duration_hours INTEGER DEFAULT 48;
ALTER TABLE public.virtual_competitions ADD COLUMN IF NOT EXISTS starter_url TEXT DEFAULT 'https://wokwi.com/projects/';
ALTER TABLE public.virtual_competitions ADD COLUMN IF NOT EXISTS rules TEXT;
ALTER TABLE public.virtual_competitions ADD COLUMN IF NOT EXISTS criteria TEXT;
ALTER TABLE public.virtual_competitions ADD COLUMN IF NOT EXISTS max_score INTEGER DEFAULT 100;
ALTER TABLE public.virtual_competitions ADD COLUMN IF NOT EXISTS prize TEXT;
ALTER TABLE public.virtual_competitions ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE public.virtual_competitions ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- Virtual Competition Student Entries
CREATE TABLE IF NOT EXISTS public.virtual_competition_submissions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  competition_id UUID REFERENCES public.virtual_competitions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  participant_name TEXT,
  project_title TEXT NOT NULL,
  simulation_url TEXT,
  repo_url TEXT,
  video_demo_url TEXT,
  documentation TEXT,
  score INTEGER,
  feedback TEXT,
  status TEXT DEFAULT 'submitted' CHECK (status IN ('submitted', 'under_review', 'evaluated', 'winner')),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ==============================================================================
-- 28. COMMUNITY, INNOVATION BOARD & FEEDBACK REPOSITORY
-- ==============================================================================

-- Comments on Community Ideas
CREATE TABLE IF NOT EXISTS public.idea_comments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  idea_id UUID NOT NULL REFERENCES public.ideas(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  author_name TEXT,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Reactions / Upvotes on Community Ideas
CREATE TABLE IF NOT EXISTS public.idea_reactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  idea_id UUID NOT NULL REFERENCES public.ideas(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reaction_type TEXT DEFAULT 'like',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(idea_id, user_id, reaction_type)
);

-- Community Testimonials & Success Stories
CREATE TABLE IF NOT EXISTS public.testimonials (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  author_name TEXT NOT NULL,
  author_role TEXT DEFAULT 'STEM Educator',
  rating INTEGER DEFAULT 5,
  category TEXT DEFAULT 'general',
  content TEXT NOT NULL,
  avatar_url TEXT,
  is_featured BOOLEAN DEFAULT FALSE,
  is_approved BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- User Satisfaction Feedback & Bug Reports
CREATE TABLE IF NOT EXISTS public.feedback (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  user_name TEXT,
  user_email TEXT,
  category TEXT DEFAULT 'general',
  rating INTEGER DEFAULT 5,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Provincial Impact Photo & Video Galleries
CREATE TABLE IF NOT EXISTS public.impact_galleries (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT,
  province TEXT DEFAULT 'National',
  year INTEGER DEFAULT 2026,
  description TEXT,
  cover_image_url TEXT,
  video_url TEXT,
  gallery_urls TEXT[] DEFAULT '{}',
  achievements TEXT[] DEFAULT '{}',
  people_reached INTEGER DEFAULT 0,
  girls_reached INTEGER DEFAULT 0,
  boys_reached INTEGER DEFAULT 0,
  schools_impacted INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Public & Masterclass Events Calendar
CREATE TABLE IF NOT EXISTS public.events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE,
  description TEXT,
  category TEXT DEFAULT 'workshop' CHECK (category IN ('workshop', 'masterclass', 'competition', 'bootcamp', 'webinar', 'exhibition')),
  event_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ,
  venue TEXT,
  is_virtual BOOLEAN DEFAULT TRUE,
  virtual_meeting_url TEXT,
  registration_fee_usd NUMERIC(10,2) DEFAULT 0.00,
  capacity INTEGER,
  is_published BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.events ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'workshop';
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS event_date TIMESTAMPTZ;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS end_date TIMESTAMPTZ;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS venue TEXT;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS is_virtual BOOLEAN DEFAULT TRUE;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS virtual_meeting_url TEXT;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS registration_fee_usd NUMERIC(10,2) DEFAULT 0.00;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS capacity INTEGER;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT TRUE;

-- Event & AI Bootcamp Attendee Registrations
CREATE TABLE IF NOT EXISTS public.event_registrations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  registration_code TEXT UNIQUE,
  event_id TEXT NOT NULL,
  event_title TEXT NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  school_institution TEXT NOT NULL,
  role_title TEXT DEFAULT 'Educator',
  province TEXT DEFAULT 'National',
  registration_fee NUMERIC(10,2) DEFAULT 0.00,
  currency TEXT DEFAULT 'USD',
  continuous_support_opt_in BOOLEAN DEFAULT FALSE,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'submitted', 'verified', 'rejected', 'unpaid')),
  payment_method TEXT DEFAULT 'ecocash',
  payment_reference TEXT,
  payment_notes TEXT,
  proof_of_payment_url TEXT,
  paid_at TIMESTAMPTZ,
  approval_status TEXT DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected')),
  approved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  approved_by_name TEXT,
  approved_at TIMESTAMPTZ,
  rejection_reason TEXT,
  admin_notes TEXT,
  certificate_unlocked BOOLEAN DEFAULT FALSE,
  certificate_unlocked_at TIMESTAMPTZ,
  certificate_unlocked_by TEXT,
  certificate_number TEXT,
  certificate_grade TEXT,
  certificate_title TEXT,
  certificate_custom_links JSONB DEFAULT '[]',
  certificate_custom_fields JSONB DEFAULT '[]',
  certificate_custom_notes TEXT,
  certificate_endorsement_text TEXT,
  has_entered_event BOOLEAN DEFAULT FALSE,
  last_entered_at TIMESTAMPTZ,
  entry_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Event Live Broadcast & Virtual Meeting Credentials
CREATE TABLE IF NOT EXISTS public.event_meetings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  event_id TEXT NOT NULL,
  meeting_title TEXT NOT NULL,
  meeting_url TEXT NOT NULL,
  meeting_code TEXT,
  passcode TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Public Contact Form Messages
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'responded', 'archived')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ==============================================================================
-- 29. PARTNERSHIPS, SPONSORSHIPS, GOVERNANCE & AUDITING
-- ==============================================================================

-- Competition & Ecosystem Sponsors
CREATE TABLE IF NOT EXISTS public.sponsors (
  id TEXT PRIMARY KEY,
  organization_name TEXT NOT NULL,
  contact_person TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  website TEXT,
  tier TEXT DEFAULT 'silver_sponsor' CHECK (tier IN ('title_sponsor', 'gold_sponsor', 'silver_sponsor', 'tech_sponsor', 'food_sponsor', 'awards_sponsor', 'education_sponsor')),
  contribution_type TEXT DEFAULT 'cash' CHECK (contribution_type IN ('cash', 'in_kind', 'hybrid')),
  committed_amount NUMERIC(12,2) DEFAULT 0.00,
  received_amount NUMERIC(12,2) DEFAULT 0.00,
  in_kind_description TEXT,
  target_focus TEXT,
  logo_url TEXT,
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'received', 'declined')),
  benefits_active BOOLEAN DEFAULT FALSE,
  allocations JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Public & Corporate Donations & Sponsorships
CREATE TABLE IF NOT EXISTS public.donations_sponsorships (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  donor_name TEXT NOT NULL,
  organization TEXT,
  email TEXT,
  phone TEXT,
  support_type TEXT DEFAULT 'financial' CHECK (support_type IN ('financial', 'in_kind_hardware', 'venue_pool_facility', 'mentorship_coaching', 'student_meals_transport', 'other')),
  amount NUMERIC(12,2),
  currency TEXT DEFAULT 'USD',
  payment_method TEXT DEFAULT 'ecocash_0788953986',
  transaction_reference TEXT,
  in_kind_description TEXT,
  message TEXT,
  is_anonymous BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'received')),
  pop_on_homepage BOOLEAN DEFAULT FALSE,
  display_on_wall BOOLEAN DEFAULT TRUE,
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.donations_sponsorships ADD COLUMN IF NOT EXISTS donor_name TEXT;
ALTER TABLE public.donations_sponsorships ADD COLUMN IF NOT EXISTS organization TEXT;
ALTER TABLE public.donations_sponsorships ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.donations_sponsorships ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.donations_sponsorships ADD COLUMN IF NOT EXISTS support_type TEXT DEFAULT 'financial';
ALTER TABLE public.donations_sponsorships ADD COLUMN IF NOT EXISTS amount NUMERIC(12,2);
ALTER TABLE public.donations_sponsorships ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'USD';
ALTER TABLE public.donations_sponsorships ADD COLUMN IF NOT EXISTS transaction_reference TEXT;
ALTER TABLE public.donations_sponsorships ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';
ALTER TABLE public.donations_sponsorships ADD COLUMN IF NOT EXISTS display_on_wall BOOLEAN DEFAULT TRUE;
ALTER TABLE public.donations_sponsorships ADD COLUMN IF NOT EXISTS is_anonymous BOOLEAN DEFAULT FALSE;

-- Strategic Partnership Proposals
CREATE TABLE IF NOT EXISTS public.partnership_requests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  organization_name TEXT NOT NULL,
  contact_person TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  specialty_area TEXT NOT NULL,
  partnership_type TEXT NOT NULL,
  logo_url TEXT,
  expectations TEXT,
  website_url TEXT,
  country TEXT DEFAULT 'Zimbabwe',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  display_on_website BOOLEAN DEFAULT TRUE,
  admin_notes TEXT,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Volunteers & Technical Officials Roster
CREATE TABLE IF NOT EXISTS public.volunteers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('judge_technical', 'robotics_mentor', 'event_logistics', 'media_photo_video', 'underwater_drone_safety', 'community_outreach', 'medical_first_aid')),
  country TEXT DEFAULT 'Zimbabwe',
  province TEXT DEFAULT 'National',
  district TEXT,
  skills_background TEXT,
  availability TEXT,
  motivation TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Annual Innovator & Learner Subscriptions
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  user_email TEXT NOT NULL,
  user_name TEXT,
  member_id TEXT,
  plan_type TEXT DEFAULT 'annual_innovator',
  amount NUMERIC(10,2) DEFAULT 5.00,
  currency TEXT DEFAULT 'USD',
  payment_method TEXT DEFAULT 'ecocash',
  payment_reference TEXT,
  proof_url TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'pending_verification', 'expired', 'rejected')),
  starts_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ DEFAULT (now() + interval '1 year'),
  verified_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  verified_at TIMESTAMPTZ,
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Pre-Approved Member Whitelist
CREATE TABLE IF NOT EXISTS public.pre_approvals (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  role TEXT DEFAULT 'student' CHECK (role IN ('admin', 'educator', 'student', 'mentor', 'partner', 'volunteer')),
  member_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Authorized Executive Auditors & Trustees
CREATE TABLE IF NOT EXISTS public.executive_auditors (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  title TEXT NOT NULL,
  authorized_by TEXT,
  authorized_at TIMESTAMPTZ DEFAULT now(),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Financial Inflows & Capital Investments
CREATE TABLE IF NOT EXISTS public.investments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  source_name TEXT NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  investment_type TEXT DEFAULT 'grant' CHECK (investment_type IN ('grant', 'angel', 'sponsor', 'government', 'donation')),
  purpose TEXT,
  date_received DATE DEFAULT CURRENT_DATE,
  status TEXT DEFAULT 'received' CHECK (status IN ('received', 'pledged', 'allocated')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- System Dynamic Configurations & Feature Flags
CREATE TABLE IF NOT EXISTS public.system_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Site Configuration Store (Certificates, Portals, Legal)
CREATE TABLE IF NOT EXISTS public.site_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- User Sessions & Active Device Tracking
CREATE TABLE IF NOT EXISTS public.user_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  device_id TEXT NOT NULL,
  last_active TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, device_id)
);

-- Notification Dispatch Queue
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'system' CHECK (type IN ('system', 'competition', 'course', 'event', 'announcement', 'achievement', 'certificate')),
  link TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ==============================================================================
-- 30. FUTURE-PROOF PLATFORM ASSETS
-- ==============================================================================

-- Hardware Kits & Microcontroller Inventory Management
CREATE TABLE IF NOT EXISTS public.hardware_inventories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  kit_code TEXT UNIQUE NOT NULL, -- e.g. 'YARA-KIT-UNO-042'
  kit_name TEXT NOT NULL,
  category TEXT DEFAULT 'Robotics Foundation Kit',
  assigned_to_school_id UUID REFERENCES public.schools(id) ON DELETE SET NULL,
  assigned_to_chapter_id UUID REFERENCES public.chapters(id) ON DELETE SET NULL,
  components_manifest JSONB DEFAULT '[]',
  condition TEXT DEFAULT 'good' CHECK (condition IN ('new', 'good', 'needs_repair', 'retired')),
  serial_numbers TEXT[] DEFAULT '{}',
  assigned_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- School Club Patrons & STEM Coaches Accreditation
CREATE TABLE IF NOT EXISTS public.patron_accreditations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  patron_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
  accreditation_number TEXT UNIQUE NOT NULL,
  level TEXT DEFAULT 'Certified Robotics Coach' CHECK (level IN ('Club Patron', 'Certified Robotics Coach', 'National Technical Judge', 'Master Instructor')),
  issued_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ DEFAULT (now() + interval '2 years'),
  is_active BOOLEAN DEFAULT TRUE,
  verified_by TEXT DEFAULT 'YARA Academic Directorate',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Comprehensive Security & System Audit Logs
CREATE TABLE IF NOT EXISTS public.system_audit_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  old_data JSONB,
  new_data JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Community Newsletter Subscribers
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  province TEXT DEFAULT 'National',
  is_active BOOLEAN DEFAULT TRUE,
  subscribed_at TIMESTAMPTZ DEFAULT now()
);

-- ==============================================================================
-- 31. PERFORMANCE INDEXES
-- ==============================================================================
-- Idempotent Column Harmonization before Section 31 Indexes
ALTER TABLE public.curriculum_sessions ADD COLUMN IF NOT EXISTS course_id TEXT;
ALTER TABLE public.curriculum_sessions ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT TRUE;
ALTER TABLE public.curriculum_progress ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.curriculum_submissions ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.quiz_attempts ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.final_exam_attempts ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.final_project_submissions ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.live_sessions ADD COLUMN IF NOT EXISTS mentor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.live_sessions ADD COLUMN IF NOT EXISTS room_id TEXT;
ALTER TABLE public.mentorship_requests ADD COLUMN IF NOT EXISTS mentor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.mentorship_requests ADD COLUMN IF NOT EXISTS requester_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.chapter_registration_requests ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';
ALTER TABLE public.chapter_join_requests ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';
ALTER TABLE public.chapter_join_requests ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.chapter_reports ADD COLUMN IF NOT EXISTS chapter_id UUID REFERENCES public.chapters(id) ON DELETE CASCADE;
ALTER TABLE public.yara_competition_registrations ADD COLUMN IF NOT EXISTS event_id TEXT DEFAULT 'yara_rc_2026';
ALTER TABLE public.yara_competition_registrations ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.competition_team_members ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES public.competition_teams(id) ON DELETE CASCADE;
ALTER TABLE public.event_registrations ADD COLUMN IF NOT EXISTS registration_code TEXT;
ALTER TABLE public.event_registrations ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT FALSE;
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_curr_sessions_course ON public.curriculum_sessions(course_id);
CREATE INDEX IF NOT EXISTS idx_curr_progress_user ON public.curriculum_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_curr_submissions_user ON public.curriculum_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user ON public.quiz_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_final_exam_user ON public.final_exam_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_final_proj_user ON public.final_project_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_live_sessions_mentor ON public.live_sessions(mentor_id);
CREATE INDEX IF NOT EXISTS idx_live_sessions_room ON public.live_sessions(room_id);
CREATE INDEX IF NOT EXISTS idx_mentorship_req_mentor ON public.mentorship_requests(mentor_id);
CREATE INDEX IF NOT EXISTS idx_mentorship_req_user ON public.mentorship_requests(requester_id);
CREATE INDEX IF NOT EXISTS idx_chapter_reg_status ON public.chapter_registration_requests(status);
CREATE INDEX IF NOT EXISTS idx_chapter_join_status ON public.chapter_join_requests(status);
CREATE INDEX IF NOT EXISTS idx_chapter_reports_chap ON public.chapter_reports(chapter_id);
CREATE INDEX IF NOT EXISTS idx_comp_teams_event ON public.yara_competition_registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_comp_members_team ON public.competition_team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_event_reg_code ON public.event_registrations(registration_code);
CREATE INDEX IF NOT EXISTS idx_event_reg_user ON public.event_registrations(user_id);
CREATE INDEX IF NOT EXISTS idx_notifs_user_read ON public.notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_subs_user ON public.subscriptions(user_id);

-- ==============================================================================
-- 32. ROW LEVEL SECURITY (RLS) POLICIES FOR ALL TABLES
-- ==============================================================================
-- Idempotent Column Harmonization before Section 32 RLS Policies
ALTER TABLE public.curriculum_sessions ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT TRUE;
ALTER TABLE public.curriculum_sessions ADD COLUMN IF NOT EXISTS course_id TEXT;
ALTER TABLE public.curriculum_progress ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.curriculum_submissions ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.curriculum_feedback ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.quiz_attempts ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.final_exam_attempts ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.final_project_submissions ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.brainstorming_attempts ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.yara_kids_content ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT TRUE;
ALTER TABLE public.live_sessions ADD COLUMN IF NOT EXISTS mentor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.mentorship_requests ADD COLUMN IF NOT EXISTS mentor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.mentorship_requests ADD COLUMN IF NOT EXISTS requester_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.study_materials ADD COLUMN IF NOT EXISTS mentor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.chapter_join_requests ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.yara_competition_registrations ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.virtual_competitions ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
ALTER TABLE public.virtual_competition_submissions ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.idea_comments ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.idea_reactions ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.testimonials ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT TRUE;
ALTER TABLE public.testimonials ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT TRUE;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS is_virtual BOOLEAN DEFAULT TRUE;
ALTER TABLE public.event_registrations ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;
ALTER TABLE public.donations_sponsorships ADD COLUMN IF NOT EXISTS display_on_wall BOOLEAN DEFAULT TRUE;
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.user_sessions ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.curriculum_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.curriculum_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.curriculum_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.curriculum_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.final_exam_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.final_project_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.yara_accredited_certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brainstorming_quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brainstorming_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.yara_kids_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_session_mentor_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentorship_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentorship_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentor_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentor_session_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentor_payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chapter_registration_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chapter_join_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chapter_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competition_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competition_team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.yara_competition_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.judges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.virtual_competitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.virtual_competition_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.idea_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.idea_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.impact_galleries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sponsors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donations_sponsorships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partnership_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.volunteers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pre_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.executive_auditors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hardware_inventories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patron_accreditations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Helper macro to safely execute RLS creation without throwing if already existing
DO $$
BEGIN
  -- Curriculum Sessions
  DROP POLICY IF EXISTS "Public can view curriculum sessions" ON public.curriculum_sessions;
  CREATE POLICY "Public can view curriculum sessions" ON public.curriculum_sessions FOR SELECT USING (is_published = true OR public.is_admin());
  DROP POLICY IF EXISTS "Admins manage curriculum sessions" ON public.curriculum_sessions;
  CREATE POLICY "Admins manage curriculum sessions" ON public.curriculum_sessions FOR ALL USING (public.is_admin());

  -- Curriculum Progress
  DROP POLICY IF EXISTS "Users manage own curriculum progress" ON public.curriculum_progress;
  CREATE POLICY "Users manage own curriculum progress" ON public.curriculum_progress FOR ALL USING (auth.uid() = user_id OR public.is_admin());

  -- Curriculum Submissions
  DROP POLICY IF EXISTS "Users manage own submissions" ON public.curriculum_submissions;
  CREATE POLICY "Users manage own submissions" ON public.curriculum_submissions FOR ALL USING (auth.uid() = user_id OR public.is_admin());

  -- Curriculum Feedback
  DROP POLICY IF EXISTS "Users manage own feedback" ON public.curriculum_feedback;
  CREATE POLICY "Users manage own feedback" ON public.curriculum_feedback FOR ALL USING (auth.uid() = user_id OR public.is_admin());

  -- Quiz Attempts
  DROP POLICY IF EXISTS "Users view own quiz attempts" ON public.quiz_attempts;
  CREATE POLICY "Users view own quiz attempts" ON public.quiz_attempts FOR ALL USING (auth.uid() = user_id OR public.is_admin());

  -- Final Exam Attempts
  DROP POLICY IF EXISTS "Users view own final exam attempts" ON public.final_exam_attempts;
  CREATE POLICY "Users view own final exam attempts" ON public.final_exam_attempts FOR ALL USING (auth.uid() = user_id OR public.is_admin());

  -- Final Project Submissions
  DROP POLICY IF EXISTS "Users manage own capstone submissions" ON public.final_project_submissions;
  CREATE POLICY "Users manage own capstone submissions" ON public.final_project_submissions FOR ALL USING (auth.uid() = user_id OR public.is_admin());

  -- Certificates
  DROP POLICY IF EXISTS "Public can verify accredited certificates" ON public.yara_accredited_certificates;
  CREATE POLICY "Public can verify accredited certificates" ON public.yara_accredited_certificates FOR SELECT USING (true);
  DROP POLICY IF EXISTS "Admins issue accredited certificates" ON public.yara_accredited_certificates;
  CREATE POLICY "Admins issue accredited certificates" ON public.yara_accredited_certificates FOR ALL USING (public.is_admin());

  -- Brainstorming Quizzes & Attempts
  DROP POLICY IF EXISTS "Public can read brainstorming quizzes" ON public.brainstorming_quizzes;
  CREATE POLICY "Public can read brainstorming quizzes" ON public.brainstorming_quizzes FOR SELECT USING (true);
  DROP POLICY IF EXISTS "Users record brainstorming attempts" ON public.brainstorming_attempts;
  CREATE POLICY "Users record brainstorming attempts" ON public.brainstorming_attempts FOR ALL USING (auth.uid() = user_id OR public.is_admin());

  -- Kids Content
  DROP POLICY IF EXISTS "Public can read kids content" ON public.yara_kids_content;
  CREATE POLICY "Public can read kids content" ON public.yara_kids_content FOR SELECT USING (is_published = true OR public.is_admin());
  DROP POLICY IF EXISTS "Admins manage kids content" ON public.yara_kids_content;
  CREATE POLICY "Admins manage kids content" ON public.yara_kids_content FOR ALL USING (public.is_admin());

  -- Live Sessions & Rooms
  DROP POLICY IF EXISTS "Public can view live sessions" ON public.live_sessions;
  CREATE POLICY "Public can view live sessions" ON public.live_sessions FOR SELECT USING (true);
  DROP POLICY IF EXISTS "Mentors and admins manage live sessions" ON public.live_sessions;
  CREATE POLICY "Mentors and admins manage live sessions" ON public.live_sessions FOR ALL USING (auth.uid() = mentor_id OR public.is_admin());

  -- Mentorship Requests & Messages
  DROP POLICY IF EXISTS "Participants view own mentorship requests" ON public.mentorship_requests;
  CREATE POLICY "Participants view own mentorship requests" ON public.mentorship_requests FOR SELECT USING (auth.uid() = requester_id OR auth.uid() = mentor_id OR public.is_admin());
  DROP POLICY IF EXISTS "Users create mentorship requests" ON public.mentorship_requests;
  CREATE POLICY "Users create mentorship requests" ON public.mentorship_requests FOR INSERT WITH CHECK (auth.uid() = requester_id OR public.is_admin());
  DROP POLICY IF EXISTS "Participants update mentorship requests" ON public.mentorship_requests;
  CREATE POLICY "Participants update mentorship requests" ON public.mentorship_requests FOR UPDATE USING (auth.uid() = requester_id OR auth.uid() = mentor_id OR public.is_admin());

  DROP POLICY IF EXISTS "Participants read mentorship messages" ON public.mentorship_messages;
  CREATE POLICY "Participants read mentorship messages" ON public.mentorship_messages FOR SELECT USING (true);
  DROP POLICY IF EXISTS "Authenticated users send mentorship messages" ON public.mentorship_messages;
  CREATE POLICY "Authenticated users send mentorship messages" ON public.mentorship_messages FOR INSERT TO authenticated WITH CHECK (true);

  -- Study Materials
  DROP POLICY IF EXISTS "Public can view study materials" ON public.study_materials;
  CREATE POLICY "Public can view study materials" ON public.study_materials FOR SELECT USING (true);
  DROP POLICY IF EXISTS "Mentors upload study materials" ON public.study_materials;
  CREATE POLICY "Mentors upload study materials" ON public.study_materials FOR ALL USING (auth.uid() = mentor_id OR public.is_admin());

  -- Chapter Charters & Requests
  DROP POLICY IF EXISTS "Public can submit chapter registration" ON public.chapter_registration_requests;
  CREATE POLICY "Public can submit chapter registration" ON public.chapter_registration_requests FOR INSERT WITH CHECK (true);
  DROP POLICY IF EXISTS "Admins review chapter registrations" ON public.chapter_registration_requests;
  CREATE POLICY "Admins review chapter registrations" ON public.chapter_registration_requests FOR ALL USING (public.is_admin());

  DROP POLICY IF EXISTS "Public can submit chapter join request" ON public.chapter_join_requests;
  CREATE POLICY "Public can submit chapter join request" ON public.chapter_join_requests FOR INSERT WITH CHECK (true);
  DROP POLICY IF EXISTS "Admins and leaders manage join requests" ON public.chapter_join_requests;
  CREATE POLICY "Admins and leaders manage join requests" ON public.chapter_join_requests FOR ALL USING (auth.uid() = user_id OR public.is_admin());

  DROP POLICY IF EXISTS "Public view chapter reports" ON public.chapter_reports;
  CREATE POLICY "Public view chapter reports" ON public.chapter_reports FOR SELECT USING (true);
  DROP POLICY IF EXISTS "Leadership and admins manage reports" ON public.chapter_reports;
  CREATE POLICY "Leadership and admins manage reports" ON public.chapter_reports FOR ALL USING (public.is_admin());

  -- Competitions
  DROP POLICY IF EXISTS "Public can view competition events" ON public.competition_events;
  CREATE POLICY "Public can view competition events" ON public.competition_events FOR SELECT USING (true);
  DROP POLICY IF EXISTS "Admins manage competition events" ON public.competition_events;
  CREATE POLICY "Admins manage competition events" ON public.competition_events FOR ALL USING (public.is_admin());

  DROP POLICY IF EXISTS "Public can register competition teams" ON public.yara_competition_registrations;
  CREATE POLICY "Public can register competition teams" ON public.yara_competition_registrations FOR INSERT WITH CHECK (true);
  DROP POLICY IF EXISTS "Participants and admins manage competition registrations" ON public.yara_competition_registrations;
  CREATE POLICY "Participants and admins manage competition registrations" ON public.yara_competition_registrations FOR ALL USING (auth.uid() = user_id OR public.is_admin());

  DROP POLICY IF EXISTS "Public can view virtual competitions" ON public.virtual_competitions;
  CREATE POLICY "Public can view virtual competitions" ON public.virtual_competitions FOR SELECT USING (is_active = true OR public.is_admin());
  DROP POLICY IF EXISTS "Students submit to virtual competitions" ON public.virtual_competition_submissions;
  CREATE POLICY "Students submit to virtual competitions" ON public.virtual_competition_submissions FOR ALL USING (auth.uid() = user_id OR public.is_admin());

  -- Ideas & Reactions
  DROP POLICY IF EXISTS "Public can view idea comments" ON public.idea_comments;
  CREATE POLICY "Public can view idea comments" ON public.idea_comments FOR SELECT USING (true);
  DROP POLICY IF EXISTS "Users create idea comments" ON public.idea_comments;
  CREATE POLICY "Users create idea comments" ON public.idea_comments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id OR public.is_admin());

  DROP POLICY IF EXISTS "Public can view idea reactions" ON public.idea_reactions;
  CREATE POLICY "Public can view idea reactions" ON public.idea_reactions FOR SELECT USING (true);
  DROP POLICY IF EXISTS "Users toggle idea reactions" ON public.idea_reactions;
  CREATE POLICY "Users toggle idea reactions" ON public.idea_reactions FOR ALL USING (auth.uid() = user_id OR public.is_admin());

  -- Testimonials & Feedback
  DROP POLICY IF EXISTS "Public can view approved testimonials" ON public.testimonials;
  CREATE POLICY "Public can view approved testimonials" ON public.testimonials FOR SELECT USING (is_approved = true OR public.is_admin());
  DROP POLICY IF EXISTS "Users submit testimonials" ON public.testimonials;
  CREATE POLICY "Users submit testimonials" ON public.testimonials FOR INSERT WITH CHECK (true);
  DROP POLICY IF EXISTS "Admins manage testimonials" ON public.testimonials;
  CREATE POLICY "Admins manage testimonials" ON public.testimonials FOR ALL USING (public.is_admin());

  DROP POLICY IF EXISTS "Users submit feedback" ON public.feedback;
  CREATE POLICY "Users submit feedback" ON public.feedback FOR INSERT WITH CHECK (true);
  DROP POLICY IF EXISTS "Admins view feedback" ON public.feedback;
  CREATE POLICY "Admins view feedback" ON public.feedback FOR ALL USING (public.is_admin());

  -- Impact Galleries
  DROP POLICY IF EXISTS "Public can view impact galleries" ON public.impact_galleries;
  CREATE POLICY "Public can view impact galleries" ON public.impact_galleries FOR SELECT USING (true);
  DROP POLICY IF EXISTS "Admins manage impact galleries" ON public.impact_galleries;
  CREATE POLICY "Admins manage impact galleries" ON public.impact_galleries FOR ALL USING (public.is_admin());

  -- Events & Registrations
  DROP POLICY IF EXISTS "Public can view events" ON public.events;
  CREATE POLICY "Public can view events" ON public.events FOR SELECT USING (is_published = true OR public.is_admin());
  DROP POLICY IF EXISTS "Admins manage events" ON public.events;
  CREATE POLICY "Admins manage events" ON public.events FOR ALL USING (public.is_admin());

  DROP POLICY IF EXISTS "Attendees manage own event registrations" ON public.event_registrations;
  CREATE POLICY "Attendees manage own event registrations" ON public.event_registrations FOR ALL USING (auth.uid() = user_id OR public.is_admin());

  -- Contact Messages
  DROP POLICY IF EXISTS "Public can submit contact messages" ON public.contact_messages;
  CREATE POLICY "Public can submit contact messages" ON public.contact_messages FOR INSERT WITH CHECK (true);
  DROP POLICY IF EXISTS "Admins read contact messages" ON public.contact_messages;
  CREATE POLICY "Admins read contact messages" ON public.contact_messages FOR ALL USING (public.is_admin());

  -- Sponsors & Donations
  DROP POLICY IF EXISTS "Public view approved sponsors" ON public.sponsors;
  CREATE POLICY "Public view approved sponsors" ON public.sponsors FOR SELECT USING (true);
  DROP POLICY IF EXISTS "Public submit sponsor applications" ON public.sponsors;
  CREATE POLICY "Public submit sponsor applications" ON public.sponsors FOR INSERT WITH CHECK (true);
  DROP POLICY IF EXISTS "Admins manage sponsors" ON public.sponsors;
  CREATE POLICY "Admins manage sponsors" ON public.sponsors FOR ALL USING (public.is_admin());

  DROP POLICY IF EXISTS "Public submit donations" ON public.donations_sponsorships;
  CREATE POLICY "Public submit donations" ON public.donations_sponsorships FOR INSERT WITH CHECK (true);
  DROP POLICY IF EXISTS "Public view donor wall" ON public.donations_sponsorships;
  CREATE POLICY "Public view donor wall" ON public.donations_sponsorships FOR SELECT USING (display_on_wall = true OR public.is_admin());
  DROP POLICY IF EXISTS "Admins manage donations" ON public.donations_sponsorships;
  CREATE POLICY "Admins manage donations" ON public.donations_sponsorships FOR ALL USING (public.is_admin());

  -- Volunteers
  DROP POLICY IF EXISTS "Public submit volunteer applications" ON public.volunteers;
  CREATE POLICY "Public submit volunteer applications" ON public.volunteers FOR INSERT WITH CHECK (true);
  DROP POLICY IF EXISTS "Admins manage volunteers" ON public.volunteers;
  CREATE POLICY "Admins manage volunteers" ON public.volunteers FOR ALL USING (public.is_admin());

  -- Subscriptions
  DROP POLICY IF EXISTS "Users view own subscriptions" ON public.subscriptions;
  CREATE POLICY "Users view own subscriptions" ON public.subscriptions FOR SELECT USING (auth.uid() = user_id OR public.is_admin());
  DROP POLICY IF EXISTS "Users create subscriptions" ON public.subscriptions;
  CREATE POLICY "Users create subscriptions" ON public.subscriptions FOR INSERT WITH CHECK (auth.uid() = user_id OR public.is_admin());
  DROP POLICY IF EXISTS "Admins manage subscriptions" ON public.subscriptions;
  CREATE POLICY "Admins manage subscriptions" ON public.subscriptions FOR ALL USING (public.is_admin());

  -- Settings & Audit
  DROP POLICY IF EXISTS "Public can read system settings" ON public.system_settings;
  CREATE POLICY "Public can read system settings" ON public.system_settings FOR SELECT USING (true);
  DROP POLICY IF EXISTS "Admins manage system settings" ON public.system_settings;
  CREATE POLICY "Admins manage system settings" ON public.system_settings FOR ALL USING (public.is_admin());

  DROP POLICY IF EXISTS "Public can read site settings" ON public.site_settings;
  CREATE POLICY "Public can read site settings" ON public.site_settings FOR SELECT USING (true);
  DROP POLICY IF EXISTS "Admins manage site settings" ON public.site_settings;
  CREATE POLICY "Admins manage site settings" ON public.site_settings FOR ALL USING (public.is_admin());

  -- User Sessions & Notifications
  DROP POLICY IF EXISTS "Users manage own sessions" ON public.user_sessions;
  CREATE POLICY "Users manage own sessions" ON public.user_sessions FOR ALL USING (auth.uid() = user_id OR public.is_admin());

  DROP POLICY IF EXISTS "Users manage own notifications" ON public.notifications;
  CREATE POLICY "Users manage own notifications" ON public.notifications FOR ALL USING (auth.uid() = user_id OR public.is_admin());
EXCEPTION
  WHEN OTHERS THEN NULL;
END $$;

-- ==============================================================================
-- 33. SUPABASE STORAGE BUCKETS & STORAGE OBJECT POLICIES
-- ==============================================================================

-- Create public storage buckets if missing
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('avatars', 'avatars', true),
  ('materials', 'materials', true),
  ('resources', 'resources', true),
  ('certificates', 'certificates', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage RLS Policies
DO $$
BEGIN
  DROP POLICY IF EXISTS "Public read storage access" ON storage.objects;
  CREATE POLICY "Public read storage access" 
    ON storage.objects FOR SELECT 
    USING (bucket_id IN ('avatars', 'materials', 'resources', 'certificates'));

  DROP POLICY IF EXISTS "Authenticated users upload storage objects" ON storage.objects;
  CREATE POLICY "Authenticated users upload storage objects" 
    ON storage.objects FOR INSERT 
    TO authenticated 
    WITH CHECK (bucket_id IN ('avatars', 'materials', 'resources', 'certificates'));

  DROP POLICY IF EXISTS "Owners or admins update storage objects" ON storage.objects;
  CREATE POLICY "Owners or admins update storage objects" 
    ON storage.objects FOR UPDATE 
    TO authenticated 
    USING (bucket_id IN ('avatars', 'materials', 'resources', 'certificates'));

  DROP POLICY IF EXISTS "Owners or admins delete storage objects" ON storage.objects;
  CREATE POLICY "Owners or admins delete storage objects" 
    ON storage.objects FOR DELETE 
    TO authenticated 
    USING (bucket_id IN ('avatars', 'materials', 'resources', 'certificates') AND (owner = auth.uid() OR public.is_admin()));
EXCEPTION
  WHEN OTHERS THEN NULL;
END $$;

-- ==============================================================================
-- 34. SUPABASE REALTIME REPLICATION CONFIGURATION
-- ==============================================================================

DO $$
BEGIN
  -- Safely add tables to supabase_realtime publication
  ALTER PUBLICATION supabase_realtime ADD TABLE 
    public.live_sessions,
    public.mentorship_messages,
    public.ideas,
    public.idea_comments,
    public.notifications,
    public.curriculum_progress,
    public.scores,
    public.virtual_competition_submissions;
EXCEPTION
  WHEN OTHERS THEN NULL;
END $$;

-- ==============================================================================
-- 35. CANONICAL SYSTEM & PLATFORM SEED INITIALIZATIONS
-- ==============================================================================
-- Idempotent Column Harmonization before Seed Inserts
ALTER TABLE public.executive_auditors ADD COLUMN IF NOT EXISTS id TEXT;
ALTER TABLE public.executive_auditors ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.executive_auditors ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE public.executive_auditors ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE public.executive_auditors ADD COLUMN IF NOT EXISTS authorized_by TEXT;
ALTER TABLE public.executive_auditors ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

ALTER TABLE public.system_settings ADD COLUMN IF NOT EXISTS key TEXT;
ALTER TABLE public.system_settings ADD COLUMN IF NOT EXISTS value JSONB;
ALTER TABLE public.system_settings ADD COLUMN IF NOT EXISTS description TEXT;

ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS key TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS value JSONB;

ALTER TABLE public.testimonials ADD COLUMN IF NOT EXISTS author_name TEXT;
ALTER TABLE public.testimonials ADD COLUMN IF NOT EXISTS author_role TEXT DEFAULT 'STEM Educator';
ALTER TABLE public.testimonials ADD COLUMN IF NOT EXISTS rating INTEGER DEFAULT 5;
ALTER TABLE public.testimonials ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'general';
ALTER TABLE public.testimonials ADD COLUMN IF NOT EXISTS content TEXT;
ALTER TABLE public.testimonials ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE;
ALTER TABLE public.testimonials ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT TRUE;

ALTER TABLE public.sponsors ADD COLUMN IF NOT EXISTS id TEXT;
ALTER TABLE public.sponsors ADD COLUMN IF NOT EXISTS organization_name TEXT;
ALTER TABLE public.sponsors ADD COLUMN IF NOT EXISTS contact_person TEXT;
ALTER TABLE public.sponsors ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.sponsors ADD COLUMN IF NOT EXISTS tier TEXT DEFAULT 'silver_sponsor';
ALTER TABLE public.sponsors ADD COLUMN IF NOT EXISTS contribution_type TEXT DEFAULT 'cash';
ALTER TABLE public.sponsors ADD COLUMN IF NOT EXISTS committed_amount NUMERIC(12,2) DEFAULT 0.00;
ALTER TABLE public.sponsors ADD COLUMN IF NOT EXISTS received_amount NUMERIC(12,2) DEFAULT 0.00;
ALTER TABLE public.sponsors ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';
ALTER TABLE public.sponsors ADD COLUMN IF NOT EXISTS benefits_active BOOLEAN DEFAULT FALSE;
ALTER TABLE public.sponsors ADD COLUMN IF NOT EXISTS description TEXT;

ALTER TABLE public.brainstorming_quizzes ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE public.brainstorming_quizzes ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE public.brainstorming_quizzes ADD COLUMN IF NOT EXISTS difficulty TEXT DEFAULT 'beginner';
ALTER TABLE public.brainstorming_quizzes ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE public.brainstorming_quizzes ADD COLUMN IF NOT EXISTS question TEXT;
ALTER TABLE public.brainstorming_quizzes ADD COLUMN IF NOT EXISTS options JSONB DEFAULT '[]';
ALTER TABLE public.brainstorming_quizzes ADD COLUMN IF NOT EXISTS correct_index INTEGER DEFAULT 0;
ALTER TABLE public.brainstorming_quizzes ADD COLUMN IF NOT EXISTS hint TEXT;
ALTER TABLE public.brainstorming_quizzes ADD COLUMN IF NOT EXISTS critical_thinking_principle TEXT;
ALTER TABLE public.brainstorming_quizzes ADD COLUMN IF NOT EXISTS explanation TEXT;
ALTER TABLE public.brainstorming_quizzes ADD COLUMN IF NOT EXISTS points INTEGER DEFAULT 10;

-- Initial Executive Auditors
INSERT INTO public.executive_auditors (id, email, name, title, authorized_by, is_active)
VALUES 
  ('exec_1', 'goyaracorp@gmail.com', 'T. Mukombwe', 'Master Administrator & Lead Trustee', 'Board Resolution 2026/01', true),
  ('exec_2', 'director@yara.org', 'Dr. C. Chidemo', 'Regional President & Executive Auditor', 'goyaracorp@gmail.com', true)
ON CONFLICT (email) DO NOTHING;

-- Initial System Settings
INSERT INTO public.system_settings (key, value, description)
VALUES 
  ('platform_metadata', '{"name": "YARA Pan-African Platform", "version": "3.1.0", "motto": "Innovate Local, Build Global"}', 'Core system branding and metadata'),
  ('launch_countdown', '{"target_date": "2026-10-31T09:00:00Z", "event_title": "YARA National Robotics & AI Finals 2026", "is_active": true}', 'Countdown banner target on public portal'),
  ('portal_mode_defaults', '{"default_portal": "webpage", "lms_public": true, "registrations_open": true}', 'Default gateway mode configurations')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- Initial Site Settings for Certificate Designer & Templates
INSERT INTO public.site_settings (key, value)
VALUES 
  ('certificate_template_config', '{
    "organization_name": "Young Africans Robotics Association",
    "sub_organization_name": "YARA Learning Academy & Technology Council",
    "certificate_title": "Certificate of Completion & Technical Competence",
    "certificate_subtitle": "Autonomous Robotics, Embedded Systems & Physical Computing",
    "citation_text": "For demonstrating exemplary theoretical comprehension, successful hardware breadboarding, autonomous microcontroller firmware implementation, and defended capstone execution.",
    "founder_name": "Simbarashe Manongwa",
    "founder_title": "Founder & Technical Director",
    "regional_president_name": "Dr. C. Chidemo",
    "regional_president_title": "Regional President & Executive Auditor",
    "default_grade": "Distinction"
  }')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- Seed Default Community Testimonials
INSERT INTO public.testimonials (author_name, author_role, rating, category, content, is_featured, is_approved)
VALUES 
  (
    'Farai Chitepo',
    'High School STEM Coordinator, Mashonaland East',
    5,
    'curriculum',
    'The YARA 42-session robotics syllabus transformed our classroom. Our students built their first obstacle-avoidance rovers within 6 weeks, progressing directly from Ohm’s Law to embedded C++ state machines.',
    true,
    true
  ),
  (
    'Ruvimbo Masawi',
    'Robotics Competitor & Junior Engineer',
    5,
    'competitions',
    'The underwater drone challenge forced us to solve real buoyancy and waterproofing engineering problems. YARA gave us the components, mentorship, and platform to compete with confidence.',
    true,
    true
  ),
  (
    'Eng. Kudakwashe Moyo',
    'Industrial Automation Mentor, Bulawayo',
    5,
    'mentorship',
    'Mentoring youth through YARA’s Live Room and reviewing their hardware schematics has been deeply rewarding. The level of critical thinking in these young African innovators is exceptional.',
    true,
    true
  )
ON CONFLICT DO NOTHING;

-- Seed Default Ecosystem Sponsors
INSERT INTO public.sponsors (id, organization_name, contact_person, email, tier, contribution_type, committed_amount, received_amount, status, benefits_active, description)
VALUES 
  (
    'sp_stem_advance_2026',
    'African STEM Advancement Foundation',
    'Dr. Tariro Ndlovu',
    'partnerships@stemafrica.org',
    'title_sponsor',
    'cash',
    5000.00,
    5000.00,
    'approved',
    true,
    'Foundational grant supporting 42 schools with free Arduino Uno microcontroller kits and ultrasonic sensors across 10 provinces.'
  ),
  (
    'sp_iot_hardware_labs',
    'Apex Microelectronics & Robotics Lab',
    'Simba Kanyemba',
    'labs@apexmicro.co.zw',
    'tech_sponsor',
    'in_kind',
    2500.00,
    2500.00,
    'approved',
    true,
    'Hardware component sponsorship providing motor drivers, chassis kits, breadboards, and digital multimeters for regional qualifers.'
  )
ON CONFLICT (id) DO NOTHING;

-- Seed Canonical Brainstorming Diagnostic Quizzes
INSERT INTO public.brainstorming_quizzes (title, category, difficulty, image_url, question, options, correct_index, hint, critical_thinking_principle, explanation, points)
VALUES 
  (
    'Circuit Voltage Division Under Load',
    'circuit_fault',
    'beginner',
    'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?auto=format&fit=crop&w=800&q=80',
    'When you connect a 5V microcontroller pin directly to a motor pulling 800mA, the microcontroller resets immediately. Why does this occur?',
    '["The microcontroller is overheating instantly", "The motor draws excessive current causing a brownout voltage drop below 4.2V", "The DC motor has reverse polarity", "The code enters an infinite while loop"]',
    1,
    'Consider how internal power rails behave when current demands exceed regulator limits.',
    'Brownout Detection & Power Rail Isolation',
    'Motors draw heavy inductive stall currents that cause supply rail voltage dips (brownout), tripping the microcontroller''s internal brownout detector reset. Microcontrollers must use isolated motor drivers (e.g. L298N) and flyback diodes.',
    15
  ),
  (
    'Sensor Noise & Non-Blocking Ultrasonic Ranging',
    'robot_navigation',
    'intermediate',
    'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=800&q=80',
    'Why is using delay(1000) inside an autonomous rover obstacle detection loop considered a critical engineering flaw?',
    '["It uses up too much EEPROM flash memory", "It stops the processor from monitoring emergency sensors or adjusting steering during that second", "It causes clock drift in the crystal oscillator", "The ultrasonic wave will travel slower in air"]',
    1,
    'Think about what happens to a moving robot while the CPU is frozen.',
    'Non-Blocking State Machines (millis() vs delay())',
    'Using delay() halts the CPU thread. If a rover is moving at 0.5 m/s, it will blindly travel 50 cm before reading the sensor again, making collision avoidance impossible. Non-blocking state loops using millis() allow continuous real-time reaction.',
    20
  )
ON CONFLICT DO NOTHING;
