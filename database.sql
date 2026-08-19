-- =========================
-- 0) Extensions
-- =========================
DROP TABLE IF EXISTS public.events CASCADE;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =========================
-- 1) Drop dependent tables first (data-loss migration)
-- =========================
DROP TABLE IF EXISTS public.competitions CASCADE;
DROP TABLE IF EXISTS public.events CASCADE;
DROP TABLE IF EXISTS public.system_settings CASCADE;


DROP TABLE IF EXISTS public.user_sessions CASCADE;
DROP TABLE IF EXISTS public.feedback CASCADE;
DROP TABLE IF EXISTS public.study_materials CASCADE;
DROP TABLE IF EXISTS public.mentor_reviews CASCADE;
DROP TABLE IF EXISTS public.mentorship_requests CASCADE;
DROP TABLE IF EXISTS public.projects CASCADE;
DROP TABLE IF EXISTS public.ideas CASCADE;
DROP TABLE IF EXISTS public.live_session_mentor_requests CASCADE;
DROP TABLE IF EXISTS public.mentor_session_logs CASCADE;
DROP TABLE IF EXISTS public.live_sessions CASCADE;
-- Do NOT drop profiles to preserve existing users

-- =========================
-- 2) Profiles (root table for FKs)
-- =========================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  email TEXT,
  avatar_url TEXT,
  avatar_storage_path TEXT,
  avatar_size BIGINT,
  avatar_mime_type TEXT,
  social_links JSONB,
  contact_phone TEXT,
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
  amount_paid DECIMAL(10,2) DEFAULT 0.00,
  total_dues DECIMAL(10,2) DEFAULT 15.00,

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
CREATE TABLE IF NOT EXISTS public.ideas (
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
CREATE TABLE IF NOT EXISTS public.projects (
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
CREATE TABLE IF NOT EXISTS public.mentorship_requests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  requester_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  requester_name TEXT,
  mentor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  status TEXT CHECK (status IN ('pending', 'accepted', 'declined', 'completed')) DEFAULT 'pending',
  message TEXT,
  whatsapp_number TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =========================
-- 6) Mentor Reviews
-- =========================
CREATE TABLE IF NOT EXISTS public.mentor_reviews (
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
CREATE TABLE IF NOT EXISTS public.study_materials (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  mentor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  mentor_name TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT NOT NULL,
  storage_path TEXT,
  file_size BIGINT,
  file_type TEXT CHECK (file_type IN ('pdf', 'doc', 'video', 'audio', 'image', 'other')) DEFAULT 'pdf',
  thumbnail_url TEXT,
  visibility TEXT CHECK (visibility IN ('public','private','unlisted')) DEFAULT 'public',
  price DECIMAL(10,2) DEFAULT 0.00,
  downloads INTEGER DEFAULT 0,
  tags TEXT[],
  approved BOOLEAN DEFAULT false,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Generic uploads table to track all uploaded files (avatars, resources, misc)
CREATE TABLE IF NOT EXISTS public.uploads (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  uploader_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  file_name TEXT NOT NULL,
  url TEXT NOT NULL,
  storage_path TEXT,
  mime_type TEXT,
  size BIGINT,
  purpose TEXT,
  related_table TEXT,
  related_id UUID,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Ephemeral mentorship messages
CREATE TABLE IF NOT EXISTS public.mentorship_messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  request_id UUID REFERENCES public.mentorship_requests(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ DEFAULT (now() + interval '24 hours')
);

-- =========================
-- Curriculum Feedback
-- =========================
CREATE TABLE IF NOT EXISTS public.curriculum_feedback (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  session_id TEXT NOT NULL,
  status TEXT CHECK (status IN ('done','partially','struggling')) DEFAULT 'done',
  success_comment TEXT,
  struggle_comment TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, session_id)
);

-- =========================
-- 8) Feedback
-- =========================
CREATE TABLE IF NOT EXISTS public.feedback (
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
CREATE TABLE IF NOT EXISTS public.user_sessions (
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

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_ideas_updated_at ON public.ideas;
CREATE TRIGGER update_ideas_updated_at
BEFORE UPDATE ON public.ideas
FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_projects_updated_at ON public.projects;
CREATE TRIGGER update_projects_updated_at
BEFORE UPDATE ON public.projects
FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_study_materials_updated_at ON public.study_materials;
CREATE TRIGGER update_study_materials_updated_at
BEFORE UPDATE ON public.study_materials
FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_uploads_updated_at ON public.uploads;
CREATE TRIGGER update_uploads_updated_at
BEFORE UPDATE ON public.uploads
FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_curriculum_feedback_updated_at ON public.curriculum_feedback;
CREATE TRIGGER update_curriculum_feedback_updated_at
BEFORE UPDATE ON public.curriculum_feedback
FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

-- Trigger for mentorship_messages updated_at
DROP TRIGGER IF EXISTS update_mentorship_messages_updated_at ON public.mentorship_messages;
CREATE TRIGGER update_mentorship_messages_updated_at
BEFORE UPDATE ON public.mentorship_messages
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
ALTER TABLE public.uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.curriculum_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentorship_messages ENABLE ROW LEVEL SECURITY;

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

DROP POLICY IF EXISTS "Mentors can update their own study materials." ON public.study_materials;
CREATE POLICY "Mentors can update their own study materials."
ON public.study_materials FOR UPDATE
USING (auth.uid() = mentor_id)
WITH CHECK (auth.uid() = mentor_id);

DROP POLICY IF EXISTS "Admins can approve study materials." ON public.study_materials;
CREATE POLICY "Admins can approve study materials."
ON public.study_materials FOR UPDATE
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));


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

-- Uploads
DROP POLICY IF EXISTS "Uploads are viewable by uploader or admin." ON public.uploads;
CREATE POLICY "Uploads are viewable by uploader or admin."
ON public.uploads FOR SELECT
USING (auth.uid() = uploader_id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "Users can insert uploads." ON public.uploads;
CREATE POLICY "Users can insert uploads."
ON public.uploads FOR INSERT
WITH CHECK (auth.uid() = uploader_id);

DROP POLICY IF EXISTS "Users can update their uploads." ON public.uploads;
CREATE POLICY "Users can update their uploads."
ON public.uploads FOR UPDATE
USING (auth.uid() = uploader_id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "Users can delete their uploads." ON public.uploads;
CREATE POLICY "Users can delete their uploads."
ON public.uploads FOR DELETE
USING (auth.uid() = uploader_id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Curriculum Feedback policies
DROP POLICY IF EXISTS "Users can manage their own curriculum feedback" ON public.curriculum_feedback;
CREATE POLICY "Users can manage their own curriculum feedback"
ON public.curriculum_feedback FOR ALL
USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))
WITH CHECK (auth.uid() = user_id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "Public can view aggregated curriculum feedback" ON public.curriculum_feedback;
CREATE POLICY "Public can view aggregated curriculum feedback"
ON public.curriculum_feedback FOR SELECT
USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Mentorship Messages (ephemeral)
DROP POLICY IF EXISTS "Mentorship messages are readable by participants or admin" ON public.mentorship_messages;
CREATE POLICY "Mentorship messages are readable by participants or admin"
ON public.mentorship_messages FOR SELECT
USING (
  EXISTS (SELECT 1 FROM public.mentorship_requests mr WHERE mr.id = request_id AND (mr.requester_id = auth.uid() OR mr.mentor_id = auth.uid()))
  OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
);

DROP POLICY IF EXISTS "Users can insert mentorship messages" ON public.mentorship_messages;
CREATE POLICY "Users can insert mentorship messages"
ON public.mentorship_messages FOR INSERT
WITH CHECK (
  EXISTS (SELECT 1 FROM public.mentorship_requests mr WHERE mr.id = request_id AND (mr.requester_id = auth.uid() OR mr.mentor_id = auth.uid()))
);

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
CREATE TABLE IF NOT EXISTS public.events (
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
CREATE TABLE IF NOT EXISTS public.competitions (
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
CREATE POLICY "Competitions are viewable by everyone." ON public.competitions FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage competitions." ON public.competitions;
CREATE POLICY "Admins can manage competitions." ON public.competitions FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Competition Teams
CREATE TABLE IF NOT EXISTS public.competition_teams (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  competition_id TEXT NOT NULL,
  team_name TEXT NOT NULL,
  school_organization TEXT NOT NULL,
  category TEXT NOT NULL,
  province TEXT NOT NULL,
  mentor_name TEXT,
  mentor_email TEXT,
  mentor_phone TEXT,
  captain_id TEXT,
  is_eligible BOOLEAN DEFAULT false,
  status TEXT CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.competition_teams ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view competition teams" ON public.competition_teams;
CREATE POLICY "Anyone can view competition teams" ON public.competition_teams FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can register competition team" ON public.competition_teams;
CREATE POLICY "Anyone can register competition team" ON public.competition_teams FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can update competition teams" ON public.competition_teams;
CREATE POLICY "Admins can update competition teams" ON public.competition_teams FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Competition Team Members
CREATE TABLE IF NOT EXISTS public.competition_team_members (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  team_id UUID REFERENCES public.competition_teams(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  gender TEXT CHECK (gender IN ('boy', 'girl')) NOT NULL,
  age INTEGER,
  email TEXT,
  phone TEXT,
  is_captain BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.competition_team_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view all team members" ON public.competition_team_members;
CREATE POLICY "Admins can view all team members" ON public.competition_team_members FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "Anyone can insert team members" ON public.competition_team_members;
CREATE POLICY "Anyone can insert team members" ON public.competition_team_members FOR INSERT WITH CHECK (true);


-- Partners
CREATE TABLE IF NOT EXISTS public.partners (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  website_url TEXT,
  description TEXT,
  logo_url TEXT,
  contact_email TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage partners" ON public.partners;
CREATE POLICY "Admins can manage partners"
ON public.partners FOR ALL
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))
WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

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
CREATE TABLE IF NOT EXISTS public.system_settings (
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
VALUES 
  ('course_fee', '{"amount": 15, "currency": "USD", "message": "To continue after your trial, the platform subscription and Virtual Training sessions cost USD$15."}'),
  ('launch_time', '{"duration_hours": 72, "launch_date": "2026-04-20T12:00:00.000Z", "title": "Official YARIA Global Launch", "is_enabled": true, "banner_text": "Countdown to the Official YARIA Platform Launch — 72 Hours to Global Innovation!"}')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- =========================
-- Live Sessions (Google Meet Clone)
-- =========================
CREATE TABLE IF NOT EXISTS public.live_sessions (
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
CREATE TABLE IF NOT EXISTS public.live_session_mentor_requests (
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
DROP TABLE IF EXISTS public.mentor_session_logs CASCADE;

CREATE TRIGGER on_student_count_increase
AFTER UPDATE OF student_count ON public.live_sessions
FOR EACH ROW EXECUTE FUNCTION public.handle_auto_mentor_request();

-- =========================
-- Mentor Session Logs
-- =========================
CREATE TABLE IF NOT EXISTS public.mentor_session_logs (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  mentor_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  session_id text NOT NULL, 
  amount_received DECIMAL(10,2) NOT NULL,
  session_date TIMESTAMPTZ DEFAULT now(),
  description text,
  admin_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.mentor_session_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Mentors can see their own logs" ON public.mentor_session_logs;
CREATE POLICY "Mentors can see their own logs"
  ON public.mentor_session_logs FOR SELECT
  USING (auth.uid() = mentor_id);

DROP POLICY IF EXISTS "Mentors can insert their own logs" ON public.mentor_session_logs;
CREATE POLICY "Mentors can insert their own logs"
  ON public.mentor_session_logs FOR INSERT
  WITH CHECK (auth.uid() = mentor_id);

DROP POLICY IF EXISTS "Admins can view and manage all logs" ON public.mentor_session_logs;
CREATE POLICY "Admins can view and manage all logs"
  ON public.mentor_session_logs FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- =========================================================================
-- CURRICULUM LMS, VIRTUAL COMPETITIONS, CAPSTONE & CERTIFICATION SYSTEM
-- =========================================================================

-- 1. Curriculum Sessions (Admin dynamic materials, video URLs, questions, assignments)
CREATE TABLE IF NOT EXISTS public.curriculum_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  session_id TEXT UNIQUE NOT NULL, -- e.g. 'L01', 'L02'
  topic TEXT NOT NULL,
  part TEXT,
  type TEXT,
  video_url TEXT,
  resources JSONB DEFAULT '[]'::jsonb,
  questions JSONB DEFAULT '[]'::jsonb,
  assignments JSONB DEFAULT '[]'::jsonb,
  projects JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.curriculum_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read curriculum sessions" ON public.curriculum_sessions;
CREATE POLICY "Anyone can read curriculum sessions"
  ON public.curriculum_sessions FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can manage curriculum sessions" ON public.curriculum_sessions;
CREATE POLICY "Admins can manage curriculum sessions"
  ON public.curriculum_sessions FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- 2. Curriculum Submissions (Student session assignments and mini-projects)
CREATE TABLE IF NOT EXISTS public.curriculum_submissions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  session_id TEXT NOT NULL,
  submission_type TEXT CHECK (submission_type IN ('assignment', 'project')) NOT NULL,
  submission_id TEXT NOT NULL, -- specific assignment/project identifier
  content TEXT,
  submission_link TEXT,
  status TEXT CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  grade_score INTEGER,
  mentor_feedback TEXT,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, session_id, submission_type, submission_id)
);

ALTER TABLE public.curriculum_submissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Students can view their own submissions" ON public.curriculum_submissions;
CREATE POLICY "Students can view their own submissions"
  ON public.curriculum_submissions FOR SELECT
  USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'mentor')));

DROP POLICY IF EXISTS "Students can insert their own submissions" ON public.curriculum_submissions;
CREATE POLICY "Students can insert their own submissions"
  ON public.curriculum_submissions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Students can update their own submissions" ON public.curriculum_submissions;
CREATE POLICY "Students can update their own submissions"
  ON public.curriculum_submissions FOR UPDATE
  USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'mentor')));

-- 3. Final Exam Attempts
CREATE TABLE IF NOT EXISTS public.final_exam_attempts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  score INTEGER NOT NULL,
  passed BOOLEAN NOT NULL DEFAULT false,
  answers JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.final_exam_attempts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users view own exam attempts" ON public.final_exam_attempts;
CREATE POLICY "Users view own exam attempts"
  ON public.final_exam_attempts FOR SELECT
  USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "Users insert exam attempts" ON public.final_exam_attempts;
CREATE POLICY "Users insert exam attempts"
  ON public.final_exam_attempts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 4. Final Project Submissions (Capstone Project)
CREATE TABLE IF NOT EXISTS public.final_project_submissions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  project_title TEXT NOT NULL,
  description TEXT NOT NULL,
  simulation_url TEXT,
  code_url TEXT,
  video_url TEXT,
  status TEXT CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  score INTEGER,
  feedback TEXT,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.final_project_submissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users view own final project" ON public.final_project_submissions;
CREATE POLICY "Users view own final project"
  ON public.final_project_submissions FOR SELECT
  USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'mentor')));

DROP POLICY IF EXISTS "Users insert final project" ON public.final_project_submissions;
CREATE POLICY "Users insert final project"
  ON public.final_project_submissions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users and admins update final project" ON public.final_project_submissions;
CREATE POLICY "Users and admins update final project"
  ON public.final_project_submissions FOR UPDATE
  USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- 5. Certificates Table (Verified graduation credentials)
CREATE TABLE IF NOT EXISTS public.certificates (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  certificate_number TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  student_name TEXT NOT NULL,
  course_title TEXT NOT NULL DEFAULT 'Full Robotics & Embedded Systems Mastery',
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  exam_score INTEGER NOT NULL,
  project_title TEXT,
  instructor_signature TEXT DEFAULT 'Eng. YARIA Director of Robotics',
  is_verified BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can verify and view certificates" ON public.certificates;
CREATE POLICY "Public can verify and view certificates"
  ON public.certificates FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can manage certificates" ON public.certificates;
CREATE POLICY "Admins can manage certificates"
  ON public.certificates FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- 6. Virtual Competitions & Online Simulation Challenges
CREATE TABLE IF NOT EXISTS public.virtual_competitions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'robot_simulation',
  category_label TEXT,
  description TEXT NOT NULL,
  duration_hours INTEGER DEFAULT 48,
  starter_url TEXT,
  rules TEXT,
  criteria JSONB DEFAULT '[]'::jsonb,
  max_score INTEGER DEFAULT 100,
  prize TEXT,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.virtual_competitions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view active virtual competitions" ON public.virtual_competitions;
CREATE POLICY "Anyone can view active virtual competitions"
  ON public.virtual_competitions FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can manage virtual competitions" ON public.virtual_competitions;
CREATE POLICY "Admins can manage virtual competitions"
  ON public.virtual_competitions FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- 7. Virtual Competition Submissions
CREATE TABLE IF NOT EXISTS public.virtual_competition_submissions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  competition_id TEXT NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  user_name TEXT,
  user_email TEXT,
  simulation_url TEXT,
  repo_url TEXT,
  video_url TEXT,
  writeup TEXT,
  score INTEGER,
  feedback TEXT,
  status TEXT CHECK (status IN ('submitted', 'evaluated')) DEFAULT 'submitted',
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(competition_id, user_id)
);

ALTER TABLE public.virtual_competition_submissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view leaderboard submissions" ON public.virtual_competition_submissions;
CREATE POLICY "Anyone can view leaderboard submissions"
  ON public.virtual_competition_submissions FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Students can submit to competitions" ON public.virtual_competition_submissions;
CREATE POLICY "Students can submit to competitions"
  ON public.virtual_competition_submissions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Students and admins update submissions" ON public.virtual_competition_submissions;
CREATE POLICY "Students and admins update submissions"
  ON public.virtual_competition_submissions FOR UPDATE
  USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Seed Initial Virtual Competitions
INSERT INTO public.virtual_competitions (title, category, category_label, description, duration_hours, starter_url, rules, criteria, max_score, prize)
VALUES
(
  'Autonomous Maze Solver Simulation Sprint',
  'robot_simulation',
  'Robot Simulation Sprint',
  'Program a differential-drive robot in Wokwi with ultrasonic & IR sensors to traverse and map an unknown randomized maze in under 45 seconds.',
  48,
  'https://wokwi.com/projects/new/arduino-uno',
  'Must use standard Arduino C++. No external hardware modules beyond standard servo & ultrasonic.',
  '["Wall-following precision (35%)", "Non-blocking execution time (35%)", "Memory efficiency & clean code (30%)"]'::jsonb,
  100,
  '$100 Hardware Grant + Verified Gold Badge'
),
(
  'Ultra-Low Power IoT Telemetry PCB Sprint',
  'pcb_design',
  'PCB Design & Circuitry',
  'Design an ESP32 power-optimized node with solar harvesting circuitry, deep-sleep triggers, and LiFePO4 battery protection.',
  72,
  'https://easyeda.com/editor',
  'Schematic and 2-layer PCB layout must pass DRC check without clearance errors.',
  '["Power integrity & decoupling (40%)", "Trace routing & thermal relief (30%)", "BOM cost optimization (30%)"]'::jsonb,
  100,
  '$150 PCB Prototyping Voucher + Verified Hardware Badge'
),
(
  'PID Line Tracker & Dynamic Speed Control',
  'embedded_c',
  'Embedded Algorithm Sprint',
  'Implement a deterministic Proportional-Integral-Derivative (PID) loop for an 8-array optical sensor line following robot on simulated tracks with acute hairpins.',
  36,
  'https://wokwi.com/projects/new/arduino-uno',
  'Sampling rate must exceed 100Hz with zero oscillation on sharp 90-degree transitions.',
  '["PID tuning stability (40%)", "Lap completion velocity (35%)", "Noise filtering implementation (25%)"]'::jsonb,
  100,
  '$75 Hardware Voucher + Verified Algorithm Badge'
) ON CONFLICT DO NOTHING;
-- 8. Brainstorming & Critical Thinking Image Quizzes
CREATE TABLE IF NOT EXISTS public.brainstorming_questions (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT NOT NULL,
  options JSONB NOT NULL,
  correct_index INTEGER NOT NULL,
  explanation TEXT NOT NULL,
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')) DEFAULT 'medium',
  points INTEGER DEFAULT 10,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.brainstorming_questions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view brainstorming questions" ON public.brainstorming_questions;
CREATE POLICY "Anyone can view brainstorming questions"
  ON public.brainstorming_questions FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can manage brainstorming questions" ON public.brainstorming_questions;
CREATE POLICY "Admins can manage brainstorming questions"
  ON public.brainstorming_questions FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- 9. Brainstorming Attempts
CREATE TABLE IF NOT EXISTS public.brainstorming_attempts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  score INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  time_spent_seconds INTEGER,
  answers JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.brainstorming_attempts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own attempts" ON public.brainstorming_attempts;
CREATE POLICY "Users can view own attempts"
  ON public.brainstorming_attempts FOR SELECT
  USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "Users can insert own attempts" ON public.brainstorming_attempts;
CREATE POLICY "Users can insert own attempts"
  ON public.brainstorming_attempts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 10. Finance: Investments & Grants
CREATE TABLE IF NOT EXISTS public.finance_investments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  source_name TEXT NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  category TEXT CHECK (category IN ('grant', 'venture', 'angel', 'sponsorship', 'equipment', 'other')) DEFAULT 'grant',
  date TIMESTAMPTZ NOT NULL,
  description TEXT,
  target_project TEXT,
  reference_code TEXT,
  status TEXT CHECK (status IN ('received', 'pledged', 'processing')) DEFAULT 'received',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.finance_investments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage finance investments" ON public.finance_investments;
CREATE POLICY "Admins can manage finance investments"
  ON public.finance_investments FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- 11. Finance: Mentor Payouts & Commissions
CREATE TABLE IF NOT EXISTS public.finance_mentor_payouts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  mentor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  mentor_name TEXT,
  mentor_email TEXT,
  amount DECIMAL(10,2) NOT NULL,
  sessions_covered INTEGER DEFAULT 1,
  payment_method TEXT NOT NULL,
  status TEXT CHECK (status IN ('paid', 'pending', 'cancelled')) DEFAULT 'pending',
  notes TEXT,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.finance_mentor_payouts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins and mentors can view payouts" ON public.finance_mentor_payouts;
CREATE POLICY "Admins and mentors can view payouts"
  ON public.finance_mentor_payouts FOR SELECT
  USING (auth.uid() = mentor_id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "Admins can manage mentor payouts" ON public.finance_mentor_payouts;
CREATE POLICY "Admins can manage mentor payouts"
  ON public.finance_mentor_payouts FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

