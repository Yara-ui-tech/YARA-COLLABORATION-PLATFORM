-- ==============================================================================
-- 00_prerequisite_lms_core.sql
-- YARA Pan-African Platform - LMS Core Dependency Foundations
-- Purpose: Establishes the prerequisite LMS core tables in strict dependency order:
--          1. public.courses
--          2. public.course_modules (references courses)
--          3. public.course_lessons (references course_modules & courses)
--          4. public.course_resources (references course_modules, course_lessons & courses)
-- Safe & Non-Destructive: Contains NO DELETE statements, NO dropped constraints.
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- 04. LMS CORE — COURSES & DYNAMIC COMPLETION ENGINE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.courses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL, -- e.g. 'YARA-ROB-BEG', 'YARA-ROB-INT', 'YARA-ROB-ADV'
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  track TEXT DEFAULT 'Robotics' CHECK (track IN ('Robotics', 'Technology', 'Coding', 'Artificial Intelligence', 'IoT', 'Engineering', 'STEM', 'Digital Literacy', 'Kids', 'Specialized', 'General')),
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

ALTER TABLE public.course_lessons ADD COLUMN IF NOT EXISTS module_id UUID REFERENCES public.course_modules(id) ON DELETE CASCADE;
ALTER TABLE public.course_lessons ADD COLUMN IF NOT EXISTS course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE;
ALTER TABLE public.course_lessons ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE public.course_lessons ADD COLUMN IF NOT EXISTS lesson_number INTEGER DEFAULT 1;
ALTER TABLE public.course_lessons ADD COLUMN IF NOT EXISTS order_index INTEGER DEFAULT 1;
ALTER TABLE public.course_lessons ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.course_lessons ADD COLUMN IF NOT EXISTS content_markdown TEXT;
ALTER TABLE public.course_lessons ADD COLUMN IF NOT EXISTS video_url TEXT;
ALTER TABLE public.course_lessons ADD COLUMN IF NOT EXISTS video_duration_seconds INTEGER DEFAULT 0;
ALTER TABLE public.course_lessons ADD COLUMN IF NOT EXISTS audio_url TEXT;
ALTER TABLE public.course_lessons ADD COLUMN IF NOT EXISTS is_free_preview BOOLEAN DEFAULT FALSE;
ALTER TABLE public.course_lessons ADD COLUMN IF NOT EXISTS practical_activity TEXT;
ALTER TABLE public.course_lessons ADD COLUMN IF NOT EXISTS simulation_link TEXT;
ALTER TABLE public.course_lessons ADD COLUMN IF NOT EXISTS code_snippet TEXT;
ALTER TABLE public.course_lessons ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'cpp';

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

ALTER TABLE public.course_resources ADD COLUMN IF NOT EXISTS module_id UUID REFERENCES public.course_modules(id) ON DELETE CASCADE;
ALTER TABLE public.course_resources ADD COLUMN IF NOT EXISTS lesson_id UUID REFERENCES public.course_lessons(id) ON DELETE CASCADE;
ALTER TABLE public.course_resources ADD COLUMN IF NOT EXISTS course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE;
ALTER TABLE public.course_resources ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE public.course_resources ADD COLUMN IF NOT EXISTS resource_type TEXT;
ALTER TABLE public.course_resources ADD COLUMN IF NOT EXISTS file_url TEXT;
ALTER TABLE public.course_resources ADD COLUMN IF NOT EXISTS file_size_bytes BIGINT;
ALTER TABLE public.course_resources ADD COLUMN IF NOT EXISTS order_index INTEGER DEFAULT 0;
