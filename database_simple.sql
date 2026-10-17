-- ==============================================================================
-- YARA COLLABORATION PLATFORM — SIMPLE MASTER DATABASE SCHEMA
-- Purpose: Clean, fast, zero-error SQL setup for Supabase SQL Editor.
-- Covers: Profiles, Posts/News, YARA Kids, Live Sessions, Testimonials, Feedback, Events, Competitions.
-- ==============================================================================

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  display_name TEXT,
  member_id TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'innovator',
  chapter_position TEXT DEFAULT 'Member',
  is_national_executive BOOLEAN DEFAULT false,
  registration_paid BOOLEAN DEFAULT false,
  is_halted BOOLEAN DEFAULT false,
  subscription_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Profiles open access" ON public.profiles;
CREATE POLICY "Profiles open access" ON public.profiles FOR ALL USING (true) WITH CHECK (true);

-- Ensure national executive exemption fields exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='profiles' AND column_name='is_national_executive') THEN
    ALTER TABLE public.profiles ADD COLUMN is_national_executive BOOLEAN DEFAULT false;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='profiles' AND column_name='chapter_position') THEN
    ALTER TABLE public.profiles ADD COLUMN chapter_position TEXT DEFAULT 'Member';
  END IF;
END $$;

-- 2. ORGANIZATION POSTS & NEWS (Home Page Feed)
CREATE TABLE IF NOT EXISTS public.organization_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT DEFAULT 'Announcement',
  author_name TEXT DEFAULT 'YARA Directorate',
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  image_url TEXT,
  attachments JSONB DEFAULT '[]'::jsonb,
  is_pinned BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.organization_posts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Posts open access" ON public.organization_posts;
CREATE POLICY "Posts open access" ON public.organization_posts FOR ALL USING (true) WITH CHECK (true);

-- 3. YARA KIDS CONTENT (Videos, Songs, Flashcards, STEM Challenges)
CREATE TABLE IF NOT EXISTS public.yara_kids_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL CHECK (category IN ('video', 'audio', 'flashcard', 'challenge')),
  title TEXT NOT NULL,
  description TEXT,
  content_url TEXT NOT NULL,
  thumbnail_url TEXT,
  age_group TEXT DEFAULT 'Ages 3-8',
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.yara_kids_content ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Kids content open access" ON public.yara_kids_content;
CREATE POLICY "Kids content open access" ON public.yara_kids_content FOR ALL USING (true) WITH CHECK (true);

-- 4. LIVE STREAMING SESSIONS
CREATE TABLE IF NOT EXISTS public.live_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id TEXT NOT NULL DEFAULT 'yara-main-stream',
  title TEXT NOT NULL,
  description TEXT,
  mentor_name TEXT DEFAULT 'Eng. Simbarashe Manongwa',
  mentor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'live', 'ended')),
  is_approved BOOLEAN DEFAULT true,
  scheduled_at TIMESTAMPTZ DEFAULT now(),
  student_count INTEGER DEFAULT 0,
  stream_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.live_sessions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Live sessions open access" ON public.live_sessions;
CREATE POLICY "Live sessions open access" ON public.live_sessions FOR ALL USING (true) WITH CHECK (true);

-- 5. TESTIMONIALS & PUBLIC REVIEWS
CREATE TABLE IF NOT EXISTS public.testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  author_name TEXT NOT NULL,
  author_avatar TEXT,
  role TEXT DEFAULT 'Innovator / Student',
  content TEXT NOT NULL,
  rating INTEGER DEFAULT 5,
  is_approved BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Testimonials open access" ON public.testimonials;
CREATE POLICY "Testimonials open access" ON public.testimonials FOR ALL USING (true) WITH CHECK (true);

-- 6. USER FEEDBACK REPORTS
CREATE TABLE IF NOT EXISTS public.system_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_name TEXT,
  user_email TEXT,
  feedback_type TEXT DEFAULT 'general' CHECK (feedback_type IN ('general', 'bug', 'feature', 'curriculum', 'complaint')),
  rating INTEGER DEFAULT 5,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved')),
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.system_feedback ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Feedback open access" ON public.system_feedback;
CREATE POLICY "Feedback open access" ON public.system_feedback FOR ALL USING (true) WITH CHECK (true);

-- 7. EVENTS & BOOTCAMPS
CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  date TIMESTAMPTZ,
  location TEXT,
  image_url TEXT,
  registration_link TEXT,
  is_upcoming BOOLEAN DEFAULT true,
  category TEXT DEFAULT 'Bootcamp',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Events open access" ON public.events;
CREATE POLICY "Events open access" ON public.events FOR ALL USING (true) WITH CHECK (true);

-- 8. COMPETITIONS (YARA 2026 Arena)
CREATE TABLE IF NOT EXISTS public.competitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  start_date DATE,
  end_date DATE,
  registration_link TEXT,
  image_url TEXT,
  status TEXT DEFAULT 'upcoming',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.competitions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Competitions open access" ON public.competitions;
CREATE POLICY "Competitions open access" ON public.competitions FOR ALL USING (true) WITH CHECK (true);

-- 9. MENTORSHIP REQUESTS & REAL-TIME SESSIONS
CREATE TABLE IF NOT EXISTS public.mentorship_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  requester_name TEXT NOT NULL,
  requester_email TEXT,
  whatsapp_number TEXT,
  mentor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  mentor_name TEXT,
  topic TEXT NOT NULL,
  message TEXT NOT NULL,
  preferred_time TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'completed', 'declined', 'cancelled')),
  meeting_link TEXT,
  mentor_response TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.mentorship_requests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Mentorship requests open access" ON public.mentorship_requests;
CREATE POLICY "Mentorship requests open access" ON public.mentorship_requests FOR ALL USING (true) WITH CHECK (true);

-- 10. MENTORSHIP REAL-TIME MESSAGES
CREATE TABLE IF NOT EXISTS public.mentorship_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES public.mentorship_requests(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  sender_name TEXT,
  sender_role TEXT DEFAULT 'mentor',
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.mentorship_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Mentorship messages open access" ON public.mentorship_messages;
CREATE POLICY "Mentorship messages open access" ON public.mentorship_messages FOR ALL USING (true) WITH CHECK (true);

-- 11. MENTOR COMMISSION & SESSION LOGS
CREATE TABLE IF NOT EXISTS public.mentor_session_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  amount_received NUMERIC(10,2) DEFAULT 0.00,
  description TEXT,
  admin_approved BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.mentor_session_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Mentor session logs open access" ON public.mentor_session_logs;
CREATE POLICY "Mentor session logs open access" ON public.mentor_session_logs FOR ALL USING (true) WITH CHECK (true);

-- 12. STARTER SEED DATA (Only inserted if empty)
INSERT INTO public.organization_posts (title, content, category, author_name)
SELECT 
  'Welcome to the YARA Robotics & Innovation Platform',
  'Empowering over 100,000 young African robotics and hardware engineers by 2030. Connect, learn, build, and compete.',
  'Announcement',
  'YARA Directorate'
WHERE NOT EXISTS (SELECT 1 FROM public.organization_posts LIMIT 1);

INSERT INTO public.yara_kids_content (category, title, description, content_url, age_group)
SELECT 
  'video',
  'Fun with Electricity & Magic Circuits',
  'Learn how electrons flow through conductors in this simple, animated STEM lesson!',
  'https://www.youtube.com/watch?v=mC_e0V5tSsc',
  'Ages 4-8'
WHERE NOT EXISTS (SELECT 1 FROM public.yara_kids_content WHERE category = 'video' LIMIT 1);

INSERT INTO public.live_sessions (title, description, mentor_name, status, is_approved)
SELECT 
  'YARA AI & Robotics National Masterclass 2026',
  'Live interactive session covering Autonomous Navigation, Sensors, and Circuit Design.',
  'Eng. Simbarashe Manongwa',
  'upcoming',
  true
WHERE NOT EXISTS (SELECT 1 FROM public.live_sessions LIMIT 1);

-- ==============================================================================
-- DONE! All tables created cleanly with full open read/write access.
-- ==============================================================================
