-- =========================
-- 0) Extensions
-- =========================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =========================
-- 1) Drop dependent tables first (data-loss migration)
-- =========================
DROP TABLE IF EXISTS public.user_sessions CASCADE;
DROP TABLE IF EXISTS public.feedback CASCADE;
DROP TABLE IF EXISTS public.study_materials CASCADE;
DROP TABLE IF EXISTS public.mentor_reviews CASCADE;
DROP TABLE IF EXISTS public.mentorship_requests CASCADE;
DROP TABLE IF EXISTS public.projects CASCADE;
DROP TABLE IF EXISTS public.ideas CASCADE;
DROP TABLE IF EXISTS public.live_session_mentor_requests CASCADE;
DROP TABLE IF EXISTS public.live_sessions CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- =========================
-- 2) Profiles (root table for FKs)
-- =========================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  email TEXT,
  avatar_url TEXT,
  member_id TEXT UNIQUE,
  bio TEXT,
  skills TEXT[],
  interests TEXT[],
  role TEXT CHECK (role IN ('innovator', 'mentor', 'admin')) DEFAULT 'innovator',
  educational_level TEXT CHECK (educational_level IN ('junior', 'intermediate', 'senior', 'tertiary', 'teacher')),
  registration_paid BOOLEAN DEFAULT FALSE,
  subscription_expires_at TIMESTAMPTZ DEFAULT (now() + interval '30 days'),
  is_halted BOOLEAN DEFAULT FALSE,
  trial_ends_at TIMESTAMPTZ DEFAULT (now() + interval '4 days'),

  -- Mentor Stats
  rating DECIMAL(3,2) DEFAULT 0.0,
  mentored_count INTEGER DEFAULT 0,
  total_commission DECIMAL(10,2) DEFAULT 0.00,
  commission_rate DECIMAL(10,2) DEFAULT 2.00, -- Default $2 per 2.5 hours

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =========================
-- 3) Ideas
-- =========================
CREATE TABLE public.ideas (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  author_name TEXT,
  content TEXT NOT NULL,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =========================
-- 4) Projects
-- =========================
CREATE TABLE public.projects (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  owner_name TEXT,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =========================
-- 5) Mentorship Requests
-- =========================
CREATE TABLE public.mentorship_requests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  requester_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  requester_name TEXT,
  mentor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  status TEXT CHECK (status IN ('pending', 'accepted', 'declined', 'completed')) DEFAULT 'pending',
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =========================
-- 6) Mentor Reviews
-- =========================
CREATE TABLE public.mentor_reviews (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  mentor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  request_id UUID REFERENCES public.mentorship_requests(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =========================
-- 7) Study Materials
-- =========================
CREATE TABLE public.study_materials (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  mentor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  mentor_name TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT NOT NULL,
  file_type TEXT CHECK (file_type IN ('pdf', 'doc', 'video', 'other')) DEFAULT 'pdf',
  thumbnail_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =========================
-- 8) Feedback
-- =========================
CREATE TABLE public.feedback (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  user_name TEXT,
  content TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =========================
-- 9) User Sessions
-- =========================
CREATE TABLE public.user_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  device_id TEXT NOT NULL,
  last_active TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, device_id)
);

-- =========================
-- 10) Updated-at trigger function
-- =========================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

CREATE TRIGGER update_ideas_updated_at
BEFORE UPDATE ON public.ideas
FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

CREATE TRIGGER update_projects_updated_at
BEFORE UPDATE ON public.projects
FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

-- =========================
-- 10.5) Pre-approvals (for manual user addition)
-- =========================
CREATE TABLE IF NOT EXISTS public.pre_approvals (
  email TEXT PRIMARY KEY,
  role TEXT DEFAULT 'innovator',
  member_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =========================
-- 11) Automatic Profile Creation Trigger
-- =========================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  pre_app RECORD;
BEGIN
  -- Check if user is pre-approved
  SELECT * INTO pre_app
  FROM public.pre_approvals
  WHERE email = NEW.email;

  INSERT INTO public.profiles (
    id,
    email,
    display_name,
    role,
    member_id,
    registration_paid,
    subscription_expires_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    CASE
      WHEN NEW.email IN ('goyaracorp@gmail.com', 'yariaofficial@gmail.com') THEN 'admin'
      WHEN pre_app.email IS NOT NULL THEN pre_app.role
      ELSE 'innovator'
    END,
    CASE
      WHEN pre_app.email IS NOT NULL AND pre_app.member_id IS NOT NULL THEN pre_app.member_id
      ELSE COALESCE(
        NEW.raw_user_meta_data->>'member_id',
        'YARIA-' || to_char(now(), 'YYYY') || '-' || floor(random() * 9000 + 1000)::text
      )
    END,
    CASE
      WHEN pre_app.email IS NOT NULL THEN TRUE
      ELSE FALSE
    END,
    now() + interval '30 days'
  );

  -- Clean up pre-approval
  IF pre_app.email IS NOT NULL THEN
    DELETE FROM public.pre_approvals WHERE email = NEW.email;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =========================
-- 11.1) Mentor Stats & Commission Triggers
-- =========================

-- Function to update mentor rating
CREATE OR REPLACE FUNCTION public.update_mentor_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.profiles
  SET rating = (
    SELECT COALESCE(AVG(rating), 0.0)
    FROM public.mentor_reviews
    WHERE mentor_id = NEW.mentor_id
  )
  WHERE id = NEW.mentor_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_mentor_review_added
AFTER INSERT OR UPDATE OR DELETE ON public.mentor_reviews
FOR EACH ROW EXECUTE FUNCTION public.update_mentor_rating();

-- Function to update mentor commission and mentee count
CREATE OR REPLACE FUNCTION public.update_mentor_stats_on_completion()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.profiles
    SET
      mentored_count = mentored_count + 1,
      total_commission = total_commission + commission_rate
    WHERE id = NEW.mentor_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_mentorship_completed
AFTER UPDATE ON public.mentorship_requests
FOR EACH ROW EXECUTE FUNCTION public.update_mentor_stats_on_completion();

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =========================
-- 12) RLS
-- =========================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentorship_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentor_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

-- =========================
-- 13) Policies
-- =========================

-- Profiles
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone."
ON public.profiles FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Users can insert their own profile." ON public.profiles;
CREATE POLICY "Users can insert their own profile."
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile." ON public.profiles;
CREATE POLICY "Users can update their own profile."
ON public.profiles FOR UPDATE
USING (auth.uid() = id);

-- Ideas
DROP POLICY IF EXISTS "Ideas are viewable by everyone." ON public.ideas;
CREATE POLICY "Ideas are viewable by everyone."
ON public.ideas FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert ideas." ON public.ideas;
CREATE POLICY "Authenticated users can insert ideas."
ON public.ideas FOR INSERT
WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = author_id);

DROP POLICY IF EXISTS "Users can update their own ideas." ON public.ideas;
CREATE POLICY "Users can update their own ideas."
ON public.ideas FOR UPDATE
USING (auth.uid() = author_id);

DROP POLICY IF EXISTS "Users can delete their own ideas." ON public.ideas;
CREATE POLICY "Users can delete their own ideas."
ON public.ideas FOR DELETE
USING (auth.uid() = author_id);

-- Projects
DROP POLICY IF EXISTS "Projects are viewable by everyone." ON public.projects;
CREATE POLICY "Projects are viewable by everyone."
ON public.projects FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert projects." ON public.projects;
CREATE POLICY "Authenticated users can insert projects."
ON public.projects FOR INSERT
WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = owner_id);

DROP POLICY IF EXISTS "Users can update their own projects." ON public.projects;
CREATE POLICY "Users can update their own projects."
ON public.projects FOR UPDATE
USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Users can delete their own projects." ON public.projects;
CREATE POLICY "Users can delete their own projects."
ON public.projects FOR DELETE
USING (auth.uid() = owner_id);

-- Mentorship Requests
DROP POLICY IF EXISTS "Users can view their own mentorship requests." ON public.mentorship_requests;
CREATE POLICY "Users can view their own mentorship requests."
ON public.mentorship_requests FOR SELECT
USING (auth.uid() = requester_id OR auth.uid() = mentor_id);

DROP POLICY IF EXISTS "Students can insert mentorship requests." ON public.mentorship_requests;
CREATE POLICY "Students can insert mentorship requests."
ON public.mentorship_requests FOR INSERT
WITH CHECK (auth.uid() = requester_id);

DROP POLICY IF EXISTS "Mentors can update request status." ON public.mentorship_requests;
CREATE POLICY "Mentors can update request status."
ON public.mentorship_requests FOR UPDATE
USING (auth.uid() = mentor_id);

-- Mentor Reviews
DROP POLICY IF EXISTS "Reviews are viewable by everyone." ON public.mentor_reviews;
CREATE POLICY "Reviews are viewable by everyone."
ON public.mentor_reviews FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Students can insert reviews for their mentors." ON public.mentor_reviews;
CREATE POLICY "Students can insert reviews for their mentors."
ON public.mentor_reviews FOR INSERT
WITH CHECK (auth.uid() = student_id);

-- Study Materials
DROP POLICY IF EXISTS "Study materials are viewable by everyone." ON public.study_materials;
CREATE POLICY "Study materials are viewable by everyone."
ON public.study_materials FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Mentors can insert study materials." ON public.study_materials;
CREATE POLICY "Mentors can insert study materials."
ON public.study_materials FOR INSERT
WITH CHECK (auth.uid() = mentor_id);

DROP POLICY IF EXISTS "Mentors can delete their own study materials." ON public.study_materials;
CREATE POLICY "Mentors can delete their own study materials."
ON public.study_materials FOR DELETE
USING (auth.uid() = mentor_id);

-- Feedback
DROP POLICY IF EXISTS "Feedback is viewable by everyone." ON public.feedback;
CREATE POLICY "Feedback is viewable by everyone."
ON public.feedback FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert feedback." ON public.feedback;
CREATE POLICY "Authenticated users can insert feedback."
ON public.feedback FOR INSERT
WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = user_id);

-- User Sessions
DROP POLICY IF EXISTS "Users can manage their own sessions." ON public.user_sessions;
CREATE POLICY "Users can manage their own sessions."
ON public.user_sessions FOR ALL
USING (auth.uid() = user_id);

ALTER TABLE public.pre_approvals ENABLE ROW LEVEL SECURITY;

-- Pre-approvals (Admin only)
DROP POLICY IF EXISTS "Admins can manage pre-approvals" ON public.pre_approvals;
CREATE POLICY "Admins can manage pre-approvals"
ON public.pre_approvals FOR ALL
USING (
  auth.uid() IN (
    SELECT id FROM public.profiles WHERE role = 'admin'
  )
);

-- Profiles (Admin Delete)
DROP POLICY IF EXISTS "Admins can delete any profile" ON public.profiles;
CREATE POLICY "Admins can delete any profile"
ON public.profiles FOR DELETE
USING (
  auth.uid() IN (
    SELECT id FROM public.profiles WHERE role = 'admin'
  )
);

-- Ideas (Admin Delete)
DROP POLICY IF EXISTS "Admins can delete any idea" ON public.ideas;
CREATE POLICY "Admins can delete any idea"
ON public.ideas FOR DELETE
USING (
  auth.uid() IN (
    SELECT id FROM public.profiles WHERE role = 'admin'
  )
);

-- =========================
-- 12) Events
-- =========================
CREATE TABLE public.events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  date TIMESTAMPTZ NOT NULL,
  location TEXT,
  image_url TEXT,
  registration_link TEXT,
  is_upcoming BOOLEAN DEFAULT true,
  category TEXT CHECK (category IN ('competition', 'workshop', 'outreach', 'other')) DEFAULT 'other',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Events are viewable by everyone." ON public.events;
CREATE POLICY "Events are viewable by everyone."
ON public.events FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Admins can manage events." ON public.events;
CREATE POLICY "Admins can manage events."
ON public.events FOR ALL
USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- =========================
-- 13) Competitions
-- =========================
CREATE TABLE public.competitions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  registration_link TEXT,
  image_url TEXT,
  status TEXT CHECK (status IN ('upcoming', 'active', 'completed')) DEFAULT 'upcoming',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.competitions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Competitions are viewable by everyone." ON public.competitions;
CREATE POLICY "Competitions are viewable by everyone."
ON public.competitions FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Admins can manage competitions." ON public.competitions;
CREATE POLICY "Admins can manage competitions."
ON public.competitions FOR ALL
USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- =========================
-- 14) System Settings
-- =========================
CREATE TABLE public.system_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view system settings" ON public.system_settings;
CREATE POLICY "Anyone can view system settings"
ON public.system_settings FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Admins can manage system settings" ON public.system_settings;
CREATE POLICY "Admins can manage system settings"
ON public.system_settings FOR ALL
USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Initial settings
INSERT INTO public.system_settings (key, value)
VALUES ('course_fee', '{"amount": 15, "currency": "USD", "message": "To continue after your trial, the platform subscription and Virtual Training sessions cost USD$15."}')
ON CONFLICT (key) DO NOTHING;

-- =========================
-- Live Sessions (Google Meet Clone)
-- =========================
CREATE TABLE public.live_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mentor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category TEXT CHECK (category IN ('junior', 'intermediate', 'senior', 'teachers')) DEFAULT 'junior',
  room_id TEXT NOT NULL UNIQUE,
  is_live BOOLEAN DEFAULT true,
  is_approved BOOLEAN DEFAULT false, -- Admin must approve
  student_count INTEGER DEFAULT 0,
  required_skills TEXT[], -- Skills needed for additional mentors
  video_url TEXT, -- For recorded sessions or external links
  description TEXT, -- For announcements or session details
  is_external BOOLEAN DEFAULT false, -- Whether the session is on another platform
  created_at TIMESTAMPTZ DEFAULT now(),
  ended_at TIMESTAMPTZ
);

ALTER TABLE public.live_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view live sessions" ON public.live_sessions;
CREATE POLICY "Anyone can view live sessions"
ON public.live_sessions FOR SELECT
USING (
  is_approved = true
  OR auth.uid() = mentor_id
  OR EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

DROP POLICY IF EXISTS "Mentors can manage their own live sessions" ON public.live_sessions;
CREATE POLICY "Mentors can manage their own live sessions"
ON public.live_sessions FOR ALL
TO authenticated
USING (
  (auth.uid() = mentor_id AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'mentor')
  OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
)
WITH CHECK (
  (auth.uid() = mentor_id AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'mentor')
  OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Live Session Mentor Requests
CREATE TABLE public.live_session_mentor_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES public.live_sessions(id) ON DELETE CASCADE,
  student_count INTEGER NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.live_session_mentor_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view live mentor requests" ON public.live_session_mentor_requests;
CREATE POLICY "Anyone can view live mentor requests"
ON public.live_session_mentor_requests FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Admins can manage live mentor requests" ON public.live_session_mentor_requests;
CREATE POLICY "Admins can manage live mentor requests"
ON public.live_session_mentor_requests FOR ALL
USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Function to handle auto-mentor request
CREATE OR REPLACE FUNCTION public.handle_auto_mentor_request()
RETURNS TRIGGER AS $$
BEGIN
  -- For every 15 students, if it's a multiple of 15, we might need another mentor
  IF NEW.student_count > OLD.student_count AND (NEW.student_count % 15 = 0) THEN
    INSERT INTO public.live_session_mentor_requests (session_id, student_count)
    VALUES (NEW.id, NEW.student_count);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_student_count_increase ON public.live_sessions;

CREATE TRIGGER on_student_count_increase
AFTER UPDATE OF student_count ON public.live_sessions
FOR EACH ROW EXECUTE FUNCTION public.handle_auto_mentor_request();