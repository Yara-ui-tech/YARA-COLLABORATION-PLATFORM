-- =========================
-- 0) Extensions
-- =========================
DROP TABLE IF EXISTS public.events CASCADE;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =========================
-- 1) Drop dependent tables first (data-loss migration)
-- =========================
DROP TABLE IF EXISTS public.chapter_reports CASCADE;
DROP TABLE IF EXISTS public.chapter_activities CASCADE;
DROP TABLE IF EXISTS public.chapter_projects CASCADE;
DROP TABLE IF EXISTS public.chapter_leaders CASCADE;
DROP TABLE IF EXISTS public.chapters CASCADE;
DROP TABLE IF EXISTS public.competition_scores CASCADE;
DROP TABLE IF EXISTS public.competition_judges CASCADE;
DROP TABLE IF EXISTS public.competition_team_members CASCADE;
DROP TABLE IF EXISTS public.competition_teams CASCADE;
DROP TABLE IF EXISTS public.competitions CASCADE;
DROP TABLE IF EXISTS public.virtual_competition_submissions CASCADE;
DROP TABLE IF EXISTS public.virtual_competitions CASCADE;
DROP TABLE IF EXISTS public.events CASCADE;
DROP TABLE IF EXISTS public.event_registrations CASCADE;
DROP TABLE IF EXISTS public.event_meetings CASCADE;
DROP TABLE IF EXISTS public.bootcamp_curriculum_modules CASCADE;
DROP TABLE IF EXISTS public.organization_posts CASCADE;
DROP TABLE IF EXISTS public.system_settings CASCADE;
DROP TABLE IF EXISTS public.partners CASCADE;
DROP TABLE IF EXISTS public.partnership_requests CASCADE;
DROP TABLE IF EXISTS public.donations_sponsorships CASCADE;
DROP TABLE IF EXISTS public.volunteers CASCADE;
DROP TABLE IF EXISTS public.investments CASCADE;
DROP TABLE IF EXISTS public.mentor_payouts CASCADE;
DROP TABLE IF EXISTS public.finance_investments CASCADE;
DROP TABLE IF EXISTS public.finance_mentor_payouts CASCADE;
DROP TABLE IF EXISTS public.subscriptions CASCADE;
DROP TABLE IF EXISTS public.idea_comments CASCADE;
DROP TABLE IF EXISTS public.idea_reactions CASCADE;
DROP TABLE IF EXISTS public.brainstorming_attempts CASCADE;
DROP TABLE IF EXISTS public.brainstorming_quizzes CASCADE;
DROP TABLE IF EXISTS public.brainstorming_questions CASCADE;
DROP TABLE IF EXISTS public.certificates CASCADE;
DROP TABLE IF EXISTS public.final_project_submissions CASCADE;
DROP TABLE IF EXISTS public.final_exam_attempts CASCADE;
DROP TABLE IF EXISTS public.curriculum_submissions CASCADE;
DROP TABLE IF EXISTS public.curriculum_sessions CASCADE;
DROP TABLE IF EXISTS public.curriculum_feedback CASCADE;
DROP TABLE IF EXISTS public.mentorship_messages CASCADE;
DROP TABLE IF EXISTS public.uploads CASCADE;
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
  role TEXT CHECK (role IN ('innovator', 'mentor', 'admin', 'teacher')) DEFAULT 'innovator',
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

  -- Executive Auditor & Educator Credentials
  is_executive_auditor BOOLEAN DEFAULT false,
  is_verified_educator BOOLEAN DEFAULT false,
  educator_institution TEXT,
  educator_subject TEXT,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Idempotent column migrations for existing profiles tables (since profiles is never dropped)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_executive_auditor BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_verified_educator BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS educator_institution TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS educator_subject TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS contact_phone TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS member_id TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS amount_paid DECIMAL(10,2) DEFAULT 0.00;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS total_dues DECIMAL(10,2) DEFAULT 15.00;

-- Idempotent check constraint update for existing profiles tables
DO $$
BEGIN
  ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
  ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('innovator', 'mentor', 'admin', 'teacher'));
EXCEPTION
  WHEN OTHERS THEN NULL;
END $$;

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
    educational_level,
    contact_phone,
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
      WHEN NEW.raw_user_meta_data->>'role' IN ('teacher', 'mentor', 'innovator', 'admin') THEN NEW.raw_user_meta_data->>'role'
      ELSE 'innovator'
    END,
    CASE
      WHEN NEW.raw_user_meta_data->>'role' = 'teacher' THEN 'teacher'
      WHEN NEW.raw_user_meta_data->>'educational_level' IN ('junior', 'intermediate', 'senior', 'tertiary', 'teacher') THEN NEW.raw_user_meta_data->>'educational_level'
      ELSE NULL
    END,
    NEW.raw_user_meta_data->>'contact_phone',
    CASE
      WHEN pre_app.email IS NOT NULL AND pre_app.member_id IS NOT NULL THEN pre_app.member_id
      ELSE COALESCE(
        NEW.raw_user_meta_data->>'member_id',
        'YARA-' || to_char(now(), 'YYYY') || '-' || floor(random() * 9000 + 1000)::text
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
  slug TEXT UNIQUE,
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT NOT NULL,
  category TEXT DEFAULT 'flagship_robotics',
  format TEXT CHECK (format IN ('in_person', 'virtual', 'hybrid')) DEFAULT 'hybrid',
  status TEXT CHECK (status IN ('upcoming', 'active', 'completed', 'archived')) DEFAULT 'upcoming',
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  registration_deadline TIMESTAMPTZ,
  location TEXT DEFAULT 'Harare, Zimbabwe',
  image_url TEXT,
  banner_url TEXT,
  registration_link TEXT,
  internal_route TEXT,
  prize_pool TEXT DEFAULT '$10,000 + Tech Grants',
  entry_fee DECIMAL(10,2) DEFAULT 0.00,
  currency TEXT DEFAULT 'USD',
  max_teams INTEGER DEFAULT 50,
  registered_teams_count INTEGER DEFAULT 0,
  eligibility TEXT DEFAULT 'Open to High Schools, Universities, and Youth Clubs (2 Boys + 2 Girls per team)',
  rules_summary TEXT,
  is_featured BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.competitions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Competitions are viewable by everyone." ON public.competitions;
CREATE POLICY "Competitions are viewable by everyone." ON public.competitions FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage competitions." ON public.competitions;
CREATE POLICY "Admins can manage competitions." ON public.competitions FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

DROP TRIGGER IF EXISTS update_competitions_updated_at ON public.competitions;
CREATE TRIGGER update_competitions_updated_at
  BEFORE UPDATE ON public.competitions
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

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

-- 8. Brainstorming & Critical Thinking Image Quizzes
CREATE TABLE IF NOT EXISTS public.brainstorming_quizzes (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL, -- 'cause_and_effect', 'pattern_recognition', 'spatial_reasoning', 'logic_deduction', 'lateral_thinking', 'everyday_physics'
  difficulty TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'advanced', 'easy', 'medium', 'hard')) DEFAULT 'beginner',
  image_url TEXT NOT NULL,
  question TEXT NOT NULL,
  options JSONB NOT NULL,
  "correctIndex" INTEGER NOT NULL DEFAULT 0,
  correct_index INTEGER DEFAULT 0,
  hint TEXT,
  critical_thinking_principle TEXT,
  explanation TEXT NOT NULL,
  points INTEGER DEFAULT 100,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Backwards compatibility view/table
CREATE TABLE IF NOT EXISTS public.brainstorming_questions (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  options JSONB NOT NULL,
  correct_index INTEGER NOT NULL DEFAULT 0,
  explanation TEXT NOT NULL,
  difficulty TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'advanced', 'easy', 'medium', 'hard')) DEFAULT 'beginner',
  points INTEGER DEFAULT 100,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.brainstorming_quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brainstorming_questions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view brainstorming quizzes" ON public.brainstorming_quizzes;
CREATE POLICY "Anyone can view brainstorming quizzes"
  ON public.brainstorming_quizzes FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can manage brainstorming quizzes" ON public.brainstorming_quizzes;
CREATE POLICY "Admins can manage brainstorming quizzes"
  ON public.brainstorming_quizzes FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

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
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  user_name TEXT,
  score INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  streak INTEGER DEFAULT 0,
  category TEXT,
  time_spent_seconds INTEGER,
  answers JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.brainstorming_attempts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own attempts" ON public.brainstorming_attempts;
CREATE POLICY "Users can view own attempts"
  ON public.brainstorming_attempts FOR SELECT
  USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "Anyone can insert own attempts" ON public.brainstorming_attempts;
CREATE POLICY "Anyone can insert own attempts"
  ON public.brainstorming_attempts FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can manage brainstorming attempts" ON public.brainstorming_attempts;
CREATE POLICY "Admins can manage brainstorming attempts"
  ON public.brainstorming_attempts FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Seed Initial General Critical Thinking Image Quizzes
INSERT INTO public.brainstorming_quizzes (
  id, title, category, difficulty, image_url, question, options, "correctIndex", correct_index, hint, critical_thinking_principle, explanation, points
) VALUES
(
  'bq_01',
  'The Interlocking Gear Train Rotation',
  'cause_and_effect',
  'beginner',
  'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=800&q=80',
  'Consider a linear row of 5 interlocking gears touching in a sequence (Gear 1 meshes with Gear 2, Gear 2 with 3, and so on up to Gear 5). If Gear 1 is turned CLOCKWISE, in which direction will Gear 5 rotate?',
  '["Clockwise (Same direction as Gear 1)", "Counter-Clockwise (Opposite direction to Gear 1)", "It will remain stationary due to mechanical locking", "It will oscillate back and forth depending on gear teeth count"]'::jsonb,
  0, 0,
  'Every time two gears mesh, the rotation direction inverses (Clockwise ⇄ Counter-Clockwise). Count the odd/even position of Gear 5.',
  'Parity & Alternation of States in Linked Systems',
  'In a single chain of meshed gears: Gear 1 = Clockwise (CW), Gear 2 = Counter-Clockwise (CCW), Gear 3 = CW, Gear 4 = CCW, and Gear 5 = CW. All odd-numbered gears in a single line rotate in the exact same direction regardless of their diameter or tooth count.',
  100
),
(
  'bq_02',
  'The Connected Water Tanks & Valves',
  'everyday_physics',
  'beginner',
  'https://images.unsplash.com/photo-1584905066893-7d5c142ba4e1?auto=format&fit=crop&w=800&q=80',
  'Water is steadily poured into Tank 1 from a top faucet. Tank 1 connects to Tank 2 via a pipe at its bottom. Tank 2 connects to Tank 3 via a pipe at its middle, and Tank 3 connects to Tank 4 via an open pipe at its top. All tank sizes are equal. Which tank fills to the top first?',
  '["Tank 2 fills first because liquid seeks the lowest open connection before Tank 1 can fill", "Tank 1 fills first because it receives the primary flow directly", "Tank 4 fills first because gravity pushes fluid to the end of the line", "All tanks fill simultaneously at the identical level"]'::jsonb,
  0, 0,
  'Liquid cannot rise past an open pipe opening until water flows through into the next container. Water always seeks the lowest path first.',
  'Hydrostatic Equilibrium & Bottleneck Routing',
  'Water in Tank 1 immediately exits through the bottom pipe into Tank 2 before Tank 1 can rise. Because the outlet pipe from Tank 2 to Tank 3 is located higher (at the middle), Tank 2 will accumulate water and fill up to its top rim first before excess water can spill or rise further up the system.',
  100
),
(
  'bq_03',
  'The 3D Orthographic Cube Projection',
  'spatial_reasoning',
  'intermediate',
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
  'Imagine a 3D staircase sculpture constructed from solid 1x1 unit cubes: Column A is 3 cubes high, Column B (to the right) is 2 cubes high, and Column C is 1 cube high. If you look at this structure strictly from directly above (top-down birds-eye view), what will you see?',
  '["A flat 1x3 horizontal rectangle showing 3 square faces of equal area", "A triangular slope showing descending stair steps with height depth", "A single square representing the tallest column only", "A 3D perspective with shadows on the left edges"]'::jsonb,
  0, 0,
  'Top-down (orthographic) projection flattens the Z-axis (height). You only observe the horizontal X and Y boundaries of the exposed top surfaces.',
  'Orthographic Projection & Dimensional Flattening',
  'In an orthogonal top-down view, all vertical elevation (height difference) disappears. Each column presents exactly one square top face of identical size, forming a flat 1-row by 3-column rectangle consisting of 3 equal squares.',
  120
),
(
  'bq_04',
  'The 9 Coins & 2-Pan Scale Optimization',
  'lateral_thinking',
  'intermediate',
  'https://images.unsplash.com/photo-1610375461246-83df859d849d?auto=format&fit=crop&w=800&q=80',
  'You have 9 visually identical gold coins. Exactly one coin is counterfeit and weighs slightly LESS than the real ones. Using an uncalibrated two-pan balance scale, what is the absolute MINIMUM number of weighings guaranteed to find the fake coin?',
  '["2 weighings (Divide into 3 groups of 3)", "3 weighings (Divide into pairs and eliminate one by one)", "4 weighings (Binary search comparison)", "8 weighings (Compare each coin against a benchmark)"]'::jsonb,
  0, 0,
  'A balance scale has 3 possible outcomes: Left is lighter, Right is lighter, or Both balance equally. You can eliminate two-thirds of candidates in one step!',
  'Ternary Tree Branching & Information Theory',
  'Divide the 9 coins into three piles of 3 (Piles A, B, C). Weigh A vs B. If one is lighter, the fake is in that pile; if they balance, the fake is in pile C (1st weighing reduces to 3 coins). Take the remaining 3 coins, put 1 on the left pan and 1 on the right. If one is lighter, it is the fake; if they balance, the 3rd unweighed coin is the fake (2nd weighing guarantees the answer).',
  150
),
(
  'bq_05',
  'The Balance Scale Algebraic Deduction',
  'logic_deduction',
  'beginner',
  'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80',
  'On a balance scale: Balance #1 shows 2 Cubes = 3 Spheres. Balance #2 shows 1 Cylinder = 1 Cube + 1 Sphere. How many Spheres are needed to perfectly balance 2 Cylinders?',
  '["5 Spheres", "4 Spheres", "6 Spheres", "3 Spheres"]'::jsonb,
  0, 0,
  'Express everything in terms of Spheres: From Balance 1, 1 Cube = 1.5 Spheres. Substitute this into Balance 2!',
  'Variable Substitution & Proportional Equivalence',
  'If 2 Cubes = 3 Spheres, then 1 Cube = 1.5 Spheres. In Balance #2, 1 Cylinder = 1 Cube + 1 Sphere = 1.5 Spheres + 1 Sphere = 2.5 Spheres. Therefore, 2 Cylinders = 2 × 2.5 Spheres = 5 Spheres.',
  110
),
(
  'bq_06',
  'The Closed Room & 3 Light Switches Riddle',
  'lateral_thinking',
  'intermediate',
  'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80',
  'Outside a sealed room with no windows, there are 3 wall switches (A, B, C) all in the OFF position. Inside is a single incandescent filament light bulb. You may only open the door and enter the room ONCE. How can you definitively determine which switch controls the bulb?',
  '["Turn switch A ON for 10 minutes, turn it OFF, turn switch B ON, then enter the room and check light & bulb warmth", "Turn all 3 switches ON simultaneously, enter the room, and measure the voltage with a multimeter", "Toggle switch A rapidly 100 times to create a visible spark under the door gap", "Leave switch A and B OFF and turn switch C ON; if it is dark, switch A must be the one"]'::jsonb,
  0, 0,
  'Incandescent bulbs emit both visible optical light AND thermal heat energy that lingers after turning off.',
  'Multi-Sensory State Detection (Latent Thermal Energy)',
  'Turn Switch A ON for 10 minutes (allowing the bulb to get hot). Turn Switch A OFF, and turn Switch B ON. Immediately enter the room: If the light is ON, Switch B is the controller. If the light is OFF but the bulb is warm to the touch, Switch A is the controller. If the light is OFF and the bulb is cold, Switch C is the controller.',
  150
),
(
  'bq_07',
  'The Sundial Shadow Angle Anomaly',
  'everyday_physics',
  'beginner',
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
  'In an open outdoor plaza at 12:00 PM solar noon in the Northern Hemisphere, a vertical 2-meter stick casts a crisp 0.5-meter shadow due North. A nearby tree casts a shadow pointing South-East. What is the logical deduction?',
  '["The tree is illuminated by a secondary artificial light source (e.g. powerful spotlight or glass building reflection)", "The tree has a curved trunk causing gravitational shadow bending", "The sun moves in reverse during midday hours", "The tree shadow is an optical mirage caused by ground heat convection"]'::jsonb,
  0, 0,
  'All outdoor objects illuminated solely by the Sun at the same location and time must cast shadows pointing in the exact same direction.',
  'Anomaly Detection & Uniform Reference Vectors',
  'Because sunlight rays arrive essentially parallel across a local area, all natural solar shadows at a given moment point in the identical direction (due North at solar noon in the Northern Hemisphere). A shadow pointing South-East proves an external localized light source (such as architectural floodlights or reflective mirror glass).',
  100
),
(
  'bq_08',
  'The Pulley Mechanical Advantage Lift',
  'cause_and_effect',
  'intermediate',
  'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80',
  'A worker uses a 2-pulley block-and-tackle system (with 2 supporting rope strands) to lift a heavy 60 kg stone block. If the worker pulls 6 meters of rope, how high will the stone block rise above the ground?',
  '["3 meters (Distance is divided by the 2 supporting rope strands)", "6 meters (Distance pulled equals height lifted)", "12 meters (Mechanical leverage doubles vertical distance)", "1.5 meters (Quartered due to pulley friction)"]'::jsonb,
  0, 0,
  'Conservation of Work: Work = Force × Distance. When a 2-pulley system cuts the required lifting force in half, the distance pulled must double.',
  'Conservation of Energy & Mechanical Trade-offs',
  'A 2-rope pulley system provides a 2:1 mechanical advantage. You exert half the force, but you must pull twice the length of rope to shorten the two supporting loops. Pulling 6 meters of rope shortens each strand by 3 meters, raising the stone block exactly 3 meters.',
  120
),
(
  'bq_09',
  'The River Crossing & Boat Weight Constraint',
  'logic_deduction',
  'intermediate',
  'https://images.unsplash.com/photo-1508873696983-2df5293cb32b?auto=format&fit=crop&w=800&q=80',
  'An adult weighing 80 kg and two children weighing 40 kg each need to cross a river. Their small rowboat has a strict maximum capacity of 80 kg. What is the MINIMUM number of one-way river crossings required to transport all three across?',
  '["5 one-way trips", "3 one-way trips", "7 one-way trips", "4 one-way trips"]'::jsonb,
  0, 0,
  'Both children can ride together (40kg + 40kg = 80kg), and one child can row the boat back!',
  'State Space Search & Cyclic Bottleneck Navigation',
  'Trip 1: Both children row across to the far bank (2 children across). Trip 2: Child 1 rows back with the boat (1 child across). Trip 3: Adult rows across alone (Adult + 1 child across). Trip 4: Child 2 rows back to the start bank (Adult across). Trip 5: Both children row across together. Total = 5 one-way trips.',
  130
),
(
  'bq_10',
  'The Geometric Pattern Matrix Sequence',
  'pattern_recognition',
  'beginner',
  'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=800&q=80',
  'In a visual pattern sequence: Tile 1 is a Triangle (3 sides) with 1 dot. Tile 2 is a Square (4 sides) with 2 dots. Tile 3 is a Pentagon (5 sides) with 4 dots. Tile 4 is a Hexagon (6 sides) with 8 dots. Following this exact rule, what is Tile 5?',
  '["Heptagon (7 sides) with 16 dots", "Heptagon (7 sides) with 10 dots", "Octagon (8 sides) with 16 dots", "Hexagon (6 sides) with 12 dots"]'::jsonb,
  0, 0,
  'Track both rules independently: Shape sides increase by +1 (3, 4, 5, 6...). Inner dot count doubles each step (1, 2, 4, 8...).',
  'Multi-Variable Sequence Progression',
  'Two concurrent arithmetic and geometric sequences govern this pattern: Polygon vertices increase linearly by +1 (3 → 4 → 5 → 6 → 7 sides = Heptagon), while dot count follows exponential doubling 2^(n-1) (1 → 2 → 4 → 8 → 16 dots). Tile 5 is a Heptagon with 16 dots.',
  100
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  category = EXCLUDED.category,
  difficulty = EXCLUDED.difficulty,
  image_url = EXCLUDED.image_url,
  question = EXCLUDED.question,
  options = EXCLUDED.options,
  "correctIndex" = EXCLUDED."correctIndex",
  correct_index = EXCLUDED.correct_index,
  hint = EXCLUDED.hint,
  critical_thinking_principle = EXCLUDED.critical_thinking_principle,
  explanation = EXCLUDED.explanation,
  points = EXCLUDED.points,
  updated_at = now();

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

-- =========================================================================
-- 12. SUBSCRIPTIONS & PAYMENT VERIFICATION
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  user_email TEXT NOT NULL,
  user_name TEXT,
  member_id TEXT,
  plan_type TEXT DEFAULT 'monthly',
  amount DECIMAL(10,2) DEFAULT 15.00,
  currency TEXT DEFAULT 'USD',
  payment_method TEXT NOT NULL, -- 'ecocash_0788953986', 'bank_transfer', 'usd_cash', 'card'
  payment_reference TEXT NOT NULL,
  proof_url TEXT,
  status TEXT CHECK (status IN ('active', 'pending_verification', 'expired', 'rejected')) DEFAULT 'pending_verification',
  starts_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ DEFAULT (now() + interval '30 days'),
  verified_by UUID REFERENCES public.profiles(id),
  verified_at TIMESTAMPTZ,
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view and create their own subscriptions" ON public.subscriptions;
CREATE POLICY "Users can view and create their own subscriptions"
  ON public.subscriptions FOR SELECT
  USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "Anyone authenticated can submit subscription payment" ON public.subscriptions;
CREATE POLICY "Anyone authenticated can submit subscription payment"
  ON public.subscriptions FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can manage all subscriptions" ON public.subscriptions;
CREATE POLICY "Admins can manage all subscriptions"
  ON public.subscriptions FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- =========================================================================
-- 13. PARTNERSHIP REQUESTS & COLLABORATION PORTAL
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.partnership_requests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  organization_name TEXT NOT NULL,
  contact_person TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  specialty_area TEXT NOT NULL, -- 'Robotics & Hardware', 'AI & Software', 'STEM Education', 'Renewable Energy', 'Government & Policy', 'Corporate Social Responsibility', 'Media & Outreach', 'Other'
  partnership_type TEXT NOT NULL, -- 'Technical Partner', 'Equipment Sponsor', 'Venue & Pool Facility', 'Curriculum Co-Developer', 'Prize Sponsor', 'Funding Partner', 'Academic Partner'
  logo_url TEXT,
  expectations TEXT NOT NULL,
  website_url TEXT,
  country TEXT DEFAULT 'Zimbabwe',
  status TEXT CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  display_on_website BOOLEAN DEFAULT false,
  admin_notes TEXT,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.partnership_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view approved partners" ON public.partnership_requests;
CREATE POLICY "Public can view approved partners"
  ON public.partnership_requests FOR SELECT
  USING (status = 'approved' OR display_on_website = true OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "Anyone can submit partnership request" ON public.partnership_requests;
CREATE POLICY "Anyone can submit partnership request"
  ON public.partnership_requests FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can manage all partnership requests" ON public.partnership_requests;
CREATE POLICY "Admins can manage all partnership requests"
  ON public.partnership_requests FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- =========================================================================
-- 14. DONATIONS & SPONSORSHIPS PORTAL (EcoCash 0788953986 & In-Kind Support)
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.donations_sponsorships (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  donor_name TEXT NOT NULL,
  organization TEXT,
  email TEXT,
  phone TEXT,
  support_type TEXT NOT NULL, -- 'financial', 'in_kind_hardware', 'venue_pool_facility', 'mentorship_coaching', 'student_meals_transport', 'other'
  amount DECIMAL(12,2),
  currency TEXT DEFAULT 'USD',
  payment_method TEXT, -- 'ecocash_0788953986', 'bank_transfer', 'usd_cash', 'card', 'in_kind_delivery'
  transaction_reference TEXT,
  in_kind_description TEXT,
  message TEXT,
  is_anonymous BOOLEAN DEFAULT false,
  status TEXT CHECK (status IN ('pending', 'approved', 'received')) DEFAULT 'pending',
  pop_on_homepage BOOLEAN DEFAULT true,
  display_on_wall BOOLEAN DEFAULT true,
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.donations_sponsorships ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view approved donations and sponsorships" ON public.donations_sponsorships;
CREATE POLICY "Public can view approved donations and sponsorships"
  ON public.donations_sponsorships FOR SELECT
  USING (status IN ('approved', 'received') OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "Anyone can submit a donation or sponsorship" ON public.donations_sponsorships;
CREATE POLICY "Anyone can submit a donation or sponsorship"
  ON public.donations_sponsorships FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can manage donations and sponsorships" ON public.donations_sponsorships;
CREATE POLICY "Admins can manage donations and sponsorships"
  ON public.donations_sponsorships FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- =========================================================================
-- 15. VOLUNTEER RECRUITMENT PORTAL
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.volunteers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  category TEXT NOT NULL, -- 'judge_technical', 'robotics_mentor', 'event_logistics', 'media_photo_video', 'underwater_drone_safety', 'community_outreach', 'medical_first_aid'
  country TEXT DEFAULT 'Zimbabwe',
  province TEXT,
  district TEXT,
  skills_background TEXT,
  availability TEXT,
  motivation TEXT,
  status TEXT CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.volunteers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can apply to volunteer" ON public.volunteers;
CREATE POLICY "Anyone can apply to volunteer"
  ON public.volunteers FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can manage volunteers" ON public.volunteers;
CREATE POLICY "Admins can manage volunteers"
  ON public.volunteers FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- =========================================================================
-- 16. INVESTMENTS & MENTOR PAYOUTS (FINANCE ENGINE)
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.investments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  source_name TEXT NOT NULL,
  amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  currency TEXT NOT NULL DEFAULT 'USD',
  investment_type TEXT CHECK (investment_type IN ('grant', 'angel', 'sponsor', 'venture', 'equipment', 'other')) DEFAULT 'grant',
  purpose TEXT NOT NULL,
  date_received DATE DEFAULT CURRENT_DATE,
  status TEXT CHECK (status IN ('received', 'pledged', 'processing')) DEFAULT 'received',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.investments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage investments" ON public.investments;
CREATE POLICY "Admins can manage investments"
  ON public.investments FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE TABLE IF NOT EXISTS public.mentor_payouts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  mentor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  mentor_name TEXT NOT NULL,
  mentor_email TEXT,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  sessions_completed INTEGER DEFAULT 1,
  payment_method TEXT NOT NULL DEFAULT 'mobile_money',
  payment_reference TEXT,
  status TEXT CHECK (status IN ('completed', 'pending', 'cancelled')) DEFAULT 'completed',
  payout_date DATE DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.mentor_payouts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage mentor payouts" ON public.mentor_payouts;
CREATE POLICY "Admins can manage mentor payouts"
  ON public.mentor_payouts FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- =========================================================================
-- 17. IDEA REACTIONS & COMMENTS (COLLABORATIVE INNOVATION)
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.idea_reactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  idea_id UUID REFERENCES public.ideas(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  user_name TEXT,
  reaction_type TEXT CHECK (reaction_type IN ('like', 'love', 'insightful', 'rocket', 'fire')) DEFAULT 'like',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(idea_id, user_id, reaction_type)
);

ALTER TABLE public.idea_reactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view idea reactions" ON public.idea_reactions;
CREATE POLICY "Anyone can view idea reactions"
  ON public.idea_reactions FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can manage own reactions" ON public.idea_reactions;
CREATE POLICY "Authenticated users can manage own reactions"
  ON public.idea_reactions FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.idea_comments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  idea_id UUID REFERENCES public.ideas(id) ON DELETE CASCADE NOT NULL,
  author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  author_name TEXT NOT NULL,
  author_avatar TEXT,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.idea_comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view idea comments" ON public.idea_comments;
CREATE POLICY "Anyone can view idea comments"
  ON public.idea_comments FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert comments" ON public.idea_comments;
CREATE POLICY "Authenticated users can insert comments"
  ON public.idea_comments FOR INSERT
  WITH CHECK (auth.uid() = author_id);

DROP POLICY IF EXISTS "Authors and admins can delete comments" ON public.idea_comments;
CREATE POLICY "Authors and admins can delete comments"
  ON public.idea_comments FOR DELETE
  USING (auth.uid() = author_id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- =========================================================================
-- 20. COMPETITION JUDGES, SCORING & STRICT ADMIN-ONLY UNLOCK MECHANISM
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.competition_judges (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  institution TEXT,
  technical_domain TEXT DEFAULT 'Robotics & Embedded Systems', -- e.g., 'Aquatic Robotics', 'Autonomous Algorithms', 'Hardware Engineering', 'Sustainability Pitch'
  assigned_categories TEXT[] DEFAULT '{"flagship_robotics", "underwater_rov", "autonomous_vehicles"}',
  pin_code TEXT DEFAULT '2026', -- Verification passcode
  is_approved BOOLEAN DEFAULT true,
  can_unlock_scores BOOLEAN DEFAULT false, -- Strict security: Only true for admin role
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.competition_judges ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view approved judges" ON public.competition_judges;
CREATE POLICY "Anyone can view approved judges"
  ON public.competition_judges FOR SELECT
  USING (is_approved = true OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "Admins can manage judges" ON public.competition_judges;
CREATE POLICY "Admins can manage judges"
  ON public.competition_judges FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Competition Scores with Locking Mechanism
CREATE TABLE IF NOT EXISTS public.competition_scores (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  competition_id TEXT NOT NULL, -- e.g. 'yara-2026-flagship' or UUID
  team_id UUID REFERENCES public.competition_teams(id) ON DELETE CASCADE NOT NULL,
  team_name TEXT NOT NULL,
  judge_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  judge_name TEXT NOT NULL,
  
  -- 3 Core Scoring Pillars (0-100 total)
  underwater_score DECIMAL(5,2) DEFAULT 0.00, -- Pillar 1 (35%)
  autonomous_score DECIMAL(5,2) DEFAULT 0.00, -- Pillar 2 (35%)
  presentation_score DECIMAL(5,2) DEFAULT 0.00, -- Pillar 3 (30%)
  total_score DECIMAL(5,2) DEFAULT 0.00,
  
  rubric_breakdown JSONB DEFAULT '{}'::jsonb,
  feedback_notes TEXT,
  
  -- Locking Controls
  is_locked BOOLEAN DEFAULT false,
  locked_at TIMESTAMPTZ,
  locked_by TEXT, -- Judge name
  
  -- Admin-only Unlock Audit Trail
  unlocked_by UUID REFERENCES public.profiles(id),
  unlocked_by_name TEXT,
  unlocked_at TIMESTAMPTZ,
  unlock_reason TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Ensure is_locked column exists even if table already existed from earlier schema
ALTER TABLE public.competition_scores ADD COLUMN IF NOT EXISTS is_locked BOOLEAN DEFAULT false;

ALTER TABLE public.competition_scores ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view scores" ON public.competition_scores;
CREATE POLICY "Public can view scores"
  ON public.competition_scores FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Judges can insert scores" ON public.competition_scores;
CREATE POLICY "Judges can insert scores"
  ON public.competition_scores FOR INSERT
  WITH CHECK (true);

-- CRITICAL RULE: A locked score cannot be updated by normal judges. ONLY Admins can modify locked records!
DROP POLICY IF EXISTS "Judges can update unlocked scores, admins can update any" ON public.competition_scores;
CREATE POLICY "Judges can update unlocked scores, admins can update any"
  ON public.competition_scores FOR UPDATE
  USING (
    (is_locked = false) 
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  )
  WITH CHECK (
    (is_locked = false) 
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "Admins can delete scores" ON public.competition_scores;
CREATE POLICY "Admins can delete scores"
  ON public.competition_scores FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Trigger to recalculate total score
CREATE OR REPLACE FUNCTION public.calculate_competition_total_score()
RETURNS TRIGGER AS $$
BEGIN
  NEW.total_score = (
    COALESCE(NEW.underwater_score, 0) * 0.35 +
    COALESCE(NEW.autonomous_score, 0) * 0.35 +
    COALESCE(NEW.presentation_score, 0) * 0.30
  );
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_competition_score_update ON public.competition_scores;
CREATE TRIGGER on_competition_score_update
BEFORE INSERT OR UPDATE ON public.competition_scores
FOR EACH ROW EXECUTE FUNCTION public.calculate_competition_total_score();

-- =========================================================================
-- 21. EVENT REGISTRATIONS & AI FOR EDUCATORS BOOTCAMP GATEWAY
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.event_registrations (
  id TEXT PRIMARY KEY DEFAULT ('evt_reg_' || floor(extract(epoch from now()))::text || '_' || substr(md5(random()::text), 1, 6)),
  registration_code TEXT UNIQUE NOT NULL DEFAULT ('YARA-AI-' || upper(substr(md5(random()::text), 1, 4))),
  event_id TEXT NOT NULL DEFAULT 'ai-for-educators-2026',
  event_title TEXT NOT NULL DEFAULT 'AI for Educators – Online Bootcamp',
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  school_institution TEXT,
  role_title TEXT, -- e.g. Teacher, School Head, Education Officer, Trainer
  teaching_level TEXT DEFAULT 'secondary',
  years_experience TEXT DEFAULT '3-5 years',
  province TEXT DEFAULT 'Harare',
  city_province TEXT,
  country TEXT DEFAULT 'Zimbabwe',
  registration_fee DECIMAL(10,2) DEFAULT 10.00,
  currency TEXT DEFAULT 'USD',
  continuous_support_opt_in BOOLEAN DEFAULT false, -- US$15 per term
  
  -- Payment Verification
  payment_status TEXT CHECK (payment_status IN ('pending', 'submitted', 'verified', 'rejected')) DEFAULT 'pending',
  payment_method TEXT,
  payment_reference TEXT,
  payment_notes TEXT,
  proof_of_payment_url TEXT,
  paid_at TIMESTAMPTZ,
  receipt_number TEXT,
  receipt_issued_at TIMESTAMPTZ,
  
  -- Admin Approval (Required alongside verified payment for Google Meet access)
  approval_status TEXT CHECK (approval_status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  approved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  approved_by_name TEXT,
  approved_at TIMESTAMPTZ,
  rejection_reason TEXT,
  admin_notes TEXT,
  
  -- Certificate Generation & Unlock Control
  certificate_unlocked BOOLEAN DEFAULT false,
  certificate_unlocked_at TIMESTAMPTZ,
  certificate_unlocked_by TEXT,
  certificate_number TEXT,
  certificate_grade TEXT DEFAULT 'Certified Educator - AI & Digital Pedagogy',
  certificate_title TEXT DEFAULT 'Certificate of Completion - AI for Educators',

  -- Live Attendance Tracking
  has_entered_event BOOLEAN DEFAULT false,
  last_entered_at TIMESTAMPTZ,
  entry_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Idempotent column migrations for existing databases
ALTER TABLE public.event_registrations ADD COLUMN IF NOT EXISTS approval_status TEXT DEFAULT 'pending';
ALTER TABLE public.event_registrations ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL;
ALTER TABLE public.event_registrations ADD COLUMN IF NOT EXISTS approved_by_name TEXT;
ALTER TABLE public.event_registrations ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;
ALTER TABLE public.event_registrations ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
ALTER TABLE public.event_registrations ADD COLUMN IF NOT EXISTS admin_notes TEXT;
ALTER TABLE public.event_registrations ADD COLUMN IF NOT EXISTS certificate_unlocked BOOLEAN DEFAULT false;
ALTER TABLE public.event_registrations ADD COLUMN IF NOT EXISTS certificate_unlocked_at TIMESTAMPTZ;
ALTER TABLE public.event_registrations ADD COLUMN IF NOT EXISTS certificate_unlocked_by TEXT;
ALTER TABLE public.event_registrations ADD COLUMN IF NOT EXISTS certificate_number TEXT;
ALTER TABLE public.event_registrations ADD COLUMN IF NOT EXISTS certificate_grade TEXT DEFAULT 'Certified Educator - AI & Digital Pedagogy';
ALTER TABLE public.event_registrations ADD COLUMN IF NOT EXISTS certificate_title TEXT DEFAULT 'Certificate of Completion - AI for Educators';
ALTER TABLE public.event_registrations ADD COLUMN IF NOT EXISTS has_entered_event BOOLEAN DEFAULT false;
ALTER TABLE public.event_registrations ADD COLUMN IF NOT EXISTS last_entered_at TIMESTAMPTZ;
ALTER TABLE public.event_registrations ADD COLUMN IF NOT EXISTS entry_count INTEGER DEFAULT 0;

ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can insert event registrations" ON public.event_registrations;
CREATE POLICY "Public can insert event registrations"
  ON public.event_registrations FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Users can view their own registrations or admins view all" ON public.event_registrations;
DROP POLICY IF EXISTS "Users can view their own registrations, verified certs, or admins view all" ON public.event_registrations;
CREATE POLICY "Users can view their own registrations, verified certs, or admins view all"
  ON public.event_registrations FOR SELECT
  USING (
    auth.uid() = user_id 
    OR lower(email) = lower(COALESCE(auth.jwt()->>'email', ''))
    OR certificate_unlocked = true
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "Users can update their own pending payment or admins update all" ON public.event_registrations;
CREATE POLICY "Users can update their own pending payment or admins update all"
  ON public.event_registrations FOR UPDATE
  USING (
    (auth.uid() = user_id AND payment_status IN ('pending', 'submitted'))
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "Admins can delete event registrations" ON public.event_registrations;
CREATE POLICY "Admins can delete event registrations"
  ON public.event_registrations FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Trigger for auto-generating registration code if null
CREATE OR REPLACE FUNCTION public.ensure_registration_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.registration_code IS NULL OR trim(NEW.registration_code) = '' THEN
    NEW.registration_code = 'YARA-AI-' || upper(substr(md5(random()::text), 1, 4));
  END IF;
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_ensure_registration_code ON public.event_registrations;
CREATE TRIGGER trg_ensure_registration_code
BEFORE INSERT OR UPDATE ON public.event_registrations
FOR EACH ROW EXECUTE PROCEDURE public.ensure_registration_code();

-- Indexes for lightning fast lookups
CREATE INDEX IF NOT EXISTS idx_event_registrations_code ON public.event_registrations(upper(registration_code));
CREATE INDEX IF NOT EXISTS idx_event_registrations_email ON public.event_registrations(lower(email));
CREATE INDEX IF NOT EXISTS idx_event_registrations_cert_num ON public.event_registrations(upper(certificate_number));
CREATE INDEX IF NOT EXISTS idx_event_registrations_event_id ON public.event_registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_event_registrations_user_id ON public.event_registrations(user_id);
CREATE INDEX IF NOT EXISTS idx_event_registrations_status ON public.event_registrations(payment_status, approval_status);
CREATE INDEX IF NOT EXISTS idx_event_registrations_cert ON public.event_registrations(certificate_unlocked);

-- RPC Function for Public Certificate Verification
CREATE OR REPLACE FUNCTION public.verify_educator_certificate(p_lookup TEXT)
RETURNS TABLE (
  is_valid BOOLEAN,
  certificate_number TEXT,
  recipient_name TEXT,
  school_institution TEXT,
  province TEXT,
  course_title TEXT,
  grade_honors TEXT,
  issue_date TEXT,
  status_message TEXT
) AS $$
DECLARE
  v_rec RECORD;
BEGIN
  SELECT 
    er.certificate_number,
    er.full_name,
    er.school_institution,
    er.province,
    er.certificate_title,
    er.certificate_grade,
    to_char(COALESCE(er.certificate_unlocked_at, er.updated_at, er.created_at), 'DD Month YYYY') as formatted_date,
    er.certificate_unlocked,
    er.approval_status
  INTO v_rec
  FROM public.event_registrations er
  WHERE (
    upper(er.registration_code) = upper(trim(p_lookup))
    OR upper(COALESCE(er.certificate_number, '')) = upper(trim(p_lookup))
    OR lower(er.email) = lower(trim(p_lookup))
  )
  ORDER BY er.created_at DESC
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN QUERY SELECT 
      false, 
      NULL::TEXT, 
      NULL::TEXT, 
      NULL::TEXT, 
      NULL::TEXT, 
      NULL::TEXT, 
      NULL::TEXT, 
      NULL::TEXT, 
      'Certificate record not found. Please verify the code or contact YARA Secretariat.'::TEXT;
    RETURN;
  END IF;

  IF v_rec.certificate_unlocked = true AND v_rec.approval_status = 'approved' THEN
    RETURN QUERY SELECT 
      true,
      v_rec.certificate_number,
      v_rec.full_name,
      v_rec.school_institution,
      v_rec.province,
      COALESCE(v_rec.certificate_title, 'AI for Educators Masterclass'),
      COALESCE(v_rec.certificate_grade, 'Certified Educator - AI & Digital Pedagogy'),
      v_rec.formatted_date,
      'Valid & Officially Authenticated by YARA Academy & YARA Zimbabwe'::TEXT;
  ELSE
    RETURN QUERY SELECT 
      false, 
      v_rec.certificate_number,
      v_rec.full_name,
      v_rec.school_institution,
      v_rec.province,
      COALESCE(v_rec.certificate_title, 'AI for Educators Masterclass'),
      COALESCE(v_rec.certificate_grade, 'Certified Educator - AI & Digital Pedagogy'),
      v_rec.formatted_date,
      'Certificate is pending administrative approval and completion verification.'::TEXT;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =========================================================================
-- 22. EVENT MEETINGS & GOOGLE MEET ACCESS CONTROL CONFIGURATION
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.event_meetings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  event_id TEXT UNIQUE NOT NULL, -- e.g. 'ai-for-educators-2026', 'ai_educators_bootcamp_2026'
  meeting_title TEXT NOT NULL DEFAULT 'AI for Educators Online Bootcamp — Google Meet Live Hall',
  meeting_url TEXT NOT NULL DEFAULT 'https://meet.google.com/new',
  meeting_code TEXT DEFAULT 'yara-ai-educators-2026',
  passcode TEXT DEFAULT 'YARA2026',
  platform TEXT CHECK (platform IN ('google_meet', 'zoom', 'teams', 'custom')) DEFAULT 'google_meet',
  daily_schedule_time TEXT DEFAULT '17:00 – 19:30 CAT (Daily: 31 Aug – 4 Sep 2026)',
  instructions TEXT DEFAULT 'Please ensure your microphone is muted upon entry. Enable camera during interactive practical exercises and discussions.',
  updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  updated_by_name TEXT DEFAULT 'YARA Academic Secretariat',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.event_meetings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view event meeting configurations" ON public.event_meetings;
CREATE POLICY "Public can view event meeting configurations"
  ON public.event_meetings FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can manage event meetings" ON public.event_meetings;
CREATE POLICY "Admins can manage event meetings"
  ON public.event_meetings FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

DROP TRIGGER IF EXISTS update_event_meetings_updated_at ON public.event_meetings;
CREATE TRIGGER update_event_meetings_updated_at
  BEFORE UPDATE ON public.event_meetings
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

-- Seed initial meeting configs for both common event ID aliases
INSERT INTO public.event_meetings (
  event_id,
  meeting_title,
  meeting_url,
  meeting_code,
  passcode,
  platform,
  daily_schedule_time,
  instructions,
  updated_by_name
) VALUES 
(
  'ai-for-educators-2026',
  'AI for Educators Online Bootcamp — Google Meet Live Hall',
  'https://meet.google.com/new',
  'yara-ai-educators-2026',
  'YARA2026',
  'google_meet',
  '17:00 – 19:30 CAT (Daily: 31 Aug – 4 Sep 2026)',
  'Please ensure your microphone is muted upon entry. Enable camera during interactive practical exercises and discussions.',
  'YARA Academic Secretariat'
),
(
  'ai_educators_bootcamp_2026',
  'AI for Educators Online Bootcamp — Google Meet Live Hall',
  'https://meet.google.com/new',
  'yara-ai-educators-2026',
  'YARA2026',
  'google_meet',
  '17:00 – 19:30 CAT (Daily: 31 Aug – 4 Sep 2026)',
  'Please ensure your microphone is muted upon entry. Enable camera during interactive practical exercises and discussions.',
  'YARA Academic Secretariat'
)
ON CONFLICT (event_id) DO UPDATE SET
  meeting_title = EXCLUDED.meeting_title,
  daily_schedule_time = EXCLUDED.daily_schedule_time,
  instructions = EXCLUDED.instructions,
  updated_at = now();

-- =========================================================================
-- 23. ORGANIZATION POSTS & MULTI-CHANNEL BROADCAST ENGINE
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.organization_posts (
  id TEXT PRIMARY KEY DEFAULT ('post_' || floor(extract(epoch from now()))::text || '_' || substr(md5(random()::text), 1, 6)),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  category TEXT DEFAULT 'general', -- e.g. 'announcement', 'competition', 'bootcamp', 'partnership', 'showcase'
  tags TEXT[] DEFAULT '{}',
  is_pinned BOOLEAN DEFAULT false,
  social_channels TEXT[] DEFAULT '{}', -- e.g. '["twitter", "facebook", "linkedin", "whatsapp"]'
  broadcast_status TEXT DEFAULT 'draft', -- e.g. 'draft', 'published', 'broadcasted'
  author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  author_name TEXT DEFAULT 'YARA Leadership',
  views_count INTEGER DEFAULT 0,
  likes_count INTEGER DEFAULT 0,
  video_url TEXT,
  media_type TEXT DEFAULT 'standard',
  gallery_urls TEXT[] DEFAULT '{}',
  attachments JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Idempotent column migrations for organization_posts
ALTER TABLE public.organization_posts ADD COLUMN IF NOT EXISTS video_url TEXT;
ALTER TABLE public.organization_posts ADD COLUMN IF NOT EXISTS media_type TEXT DEFAULT 'standard';
ALTER TABLE public.organization_posts ADD COLUMN IF NOT EXISTS gallery_urls TEXT[] DEFAULT '{}';
ALTER TABLE public.organization_posts ADD COLUMN IF NOT EXISTS attachments JSONB DEFAULT '[]'::jsonb;

ALTER TABLE public.organization_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view organization posts" ON public.organization_posts;
CREATE POLICY "Public can view organization posts"
  ON public.organization_posts FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can manage organization posts" ON public.organization_posts;
CREATE POLICY "Admins can manage organization posts"
  ON public.organization_posts FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

DROP TRIGGER IF EXISTS update_organization_posts_updated_at ON public.organization_posts;
CREATE TRIGGER update_organization_posts_updated_at
  BEFORE UPDATE ON public.organization_posts
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

-- RPC function to increment post likes atomically
CREATE OR REPLACE FUNCTION public.increment_post_likes(post_id TEXT)
RETURNS INTEGER AS $$
DECLARE
  new_count INTEGER;
BEGIN
  UPDATE public.organization_posts
  SET likes_count = COALESCE(likes_count, 0) + 1
  WHERE id = post_id
  RETURNING likes_count INTO new_count;

  RETURN COALESCE(new_count, 1);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =========================================================================
-- 24. BOOTCAMP CURRICULUM MODULES & PRACTICAL SESSIONS
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.bootcamp_curriculum_modules (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  event_id TEXT NOT NULL DEFAULT 'ai-for-educators-2026',
  day_number INTEGER NOT NULL,
  date_display TEXT NOT NULL,
  title TEXT NOT NULL,
  duration TEXT DEFAULT '2.5 Hours (16:00 - 18:30 CAT)',
  description TEXT,
  topics TEXT[] DEFAULT '{}',
  trainer TEXT DEFAULT 'YARA Senior AI Faculty',
  resources JSONB DEFAULT '[]'::jsonb,
  is_live BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.bootcamp_curriculum_modules ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view bootcamp modules" ON public.bootcamp_curriculum_modules;
CREATE POLICY "Public can view bootcamp modules"
  ON public.bootcamp_curriculum_modules FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can manage bootcamp modules" ON public.bootcamp_curriculum_modules;
CREATE POLICY "Admins can manage bootcamp modules"
  ON public.bootcamp_curriculum_modules FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

DROP TRIGGER IF EXISTS update_bootcamp_modules_updated_at ON public.bootcamp_curriculum_modules;
CREATE TRIGGER update_bootcamp_modules_updated_at
  BEFORE UPDATE ON public.bootcamp_curriculum_modules
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

-- =========================================================================
-- 25. YARA CHAPTERS, LEADERSHIP ACCESS & FINANCIAL/ACTIVITY REPORTS
-- =========================================================================

-- Chapters Registry
CREATE TABLE IF NOT EXISTS public.chapters (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('university', 'high_school', 'primary_school', 'community_youth', 'polytechnic', 'provincial_hub')),
  institution_or_community TEXT NOT NULL,
  province TEXT NOT NULL,
  district_or_city TEXT NOT NULL,
  banner_url TEXT,
  logo_url TEXT,
  description TEXT NOT NULL,
  established_date DATE DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'chartered' CHECK (status IN ('active', 'chartered', 'forming', 'probation', 'archived')),
  total_members_count INTEGER DEFAULT 0,
  active_projects_count INTEGER DEFAULT 0,
  public_email TEXT,
  public_phone TEXT,
  public_social_links JSONB DEFAULT '{}'::jsonb,
  meeting_schedule TEXT,
  physical_location TEXT,
  focus_areas TEXT[] DEFAULT '{}',
  patron_advisor JSONB DEFAULT '{}'::jsonb,
  confidential_info JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Chapter Leadership Roster & Admin-Assigned Access Control
CREATE TABLE IF NOT EXISTS public.chapter_leaders (
  id TEXT PRIMARY KEY DEFAULT ('lead_' || floor(extract(epoch from now()))::text || '_' || substr(md5(random()::text), 1, 6)),
  chapter_id TEXT REFERENCES public.chapters(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('chairperson', 'vice_chair', 'secretary', 'vice_secretary', 'treasurer', 'tech_lead', 'public_relations', 'patron_advisor')),
  email TEXT,
  phone TEXT,
  avatar_url TEXT,
  department_or_grade TEXT,
  is_public_contact BOOLEAN DEFAULT true,
  is_approved_by_admin BOOLEAN DEFAULT false,
  approved_by_admin_at TIMESTAMPTZ,
  approved_by_admin_name TEXT,
  access_pin TEXT,
  can_submit_general_reports BOOLEAN DEFAULT false,
  can_submit_financial_reports BOOLEAN DEFAULT false,
  approval_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Chapter Projects
CREATE TABLE IF NOT EXISTS public.chapter_projects (
  id TEXT PRIMARY KEY DEFAULT ('proj_' || floor(extract(epoch from now()))::text || '_' || substr(md5(random()::text), 1, 6)),
  chapter_id TEXT REFERENCES public.chapters(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('robotics_hardware', 'iot_automation', 'renewable_energy', 'drone_tech', 'coding_ai', 'community_outreach')),
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'testing', 'ideation')),
  image_url TEXT,
  hardware_stack TEXT[] DEFAULT '{}',
  github_or_demo_link TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Chapter Activities & Community Outreach
CREATE TABLE IF NOT EXISTS public.chapter_activities (
  id TEXT PRIMARY KEY DEFAULT ('act_' || floor(extract(epoch from now()))::text || '_' || substr(md5(random()::text), 1, 6)),
  chapter_id TEXT REFERENCES public.chapters(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  description TEXT NOT NULL,
  impact_metric TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Chapter Official Reports & Financial Statements
CREATE TABLE IF NOT EXISTS public.chapter_reports (
  id TEXT PRIMARY KEY DEFAULT ('rep_' || floor(extract(epoch from now()))::text || '_' || substr(md5(random()::text), 1, 6)),
  chapter_id TEXT REFERENCES public.chapters(id) ON DELETE CASCADE NOT NULL,
  chapter_name TEXT NOT NULL,
  chapter_category TEXT,
  report_title TEXT NOT NULL,
  report_category TEXT DEFAULT 'general' CHECK (report_category IN ('general', 'financial', 'project_milestone', 'annual')),
  period_type TEXT NOT NULL DEFAULT 'monthly' CHECK (period_type IN ('monthly', 'quarterly', 'annual', 'special_event', 'project_milestone', 'financial')),
  period_date TEXT NOT NULL,
  submitted_by_name TEXT NOT NULL,
  submitted_by_role TEXT NOT NULL,
  submitted_by_email TEXT NOT NULL,
  submitted_by_leader_id TEXT REFERENCES public.chapter_leaders(id) ON DELETE SET NULL,
  submitted_at TIMESTAMPTZ DEFAULT now(),
  executive_summary TEXT NOT NULL,
  activities_undertaken TEXT,
  attendance_count INTEGER DEFAULT 0,
  hardware_projects_update TEXT,
  challenges_and_needs TEXT,
  report_document_url TEXT NOT NULL,
  financial_statement_url TEXT,
  financial_data JSONB DEFAULT '{}'::jsonb,
  supporting_images TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'submitted' CHECK (status IN ('submitted', 'under_review', 'assessed', 'revisions_requested', 'approved')),
  executive_assessment JSONB,
  is_locked BOOLEAN DEFAULT true,
  locked_at TIMESTAMPTZ,
  locked_by_name TEXT,
  leadership_verified BOOLEAN DEFAULT true,
  leadership_approved_by_admin BOOLEAN DEFAULT true,
  leadership_verification_method TEXT DEFAULT 'access_pin',
  document_seal_code TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Ensure is_locked column exists even if table already existed from earlier schema
ALTER TABLE public.chapter_reports ADD COLUMN IF NOT EXISTS is_locked BOOLEAN DEFAULT true;

-- Enable RLS
ALTER TABLE public.chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chapter_leaders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chapter_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chapter_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chapter_reports ENABLE ROW LEVEL SECURITY;

-- Chapters Policies
DROP POLICY IF EXISTS "Public can view chapters" ON public.chapters;
CREATE POLICY "Public can view chapters"
  ON public.chapters FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can manage chapters" ON public.chapters;
CREATE POLICY "Admins can manage chapters"
  ON public.chapters FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Chapter Leaders Policies
DROP POLICY IF EXISTS "Public can view chapter leaders" ON public.chapter_leaders;
CREATE POLICY "Public can view chapter leaders"
  ON public.chapter_leaders FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can manage chapter leaders" ON public.chapter_leaders;
CREATE POLICY "Admins can manage chapter leaders"
  ON public.chapter_leaders FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Chapter Projects Policies
DROP POLICY IF EXISTS "Public can view chapter projects" ON public.chapter_projects;
CREATE POLICY "Public can view chapter projects"
  ON public.chapter_projects FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can manage chapter projects" ON public.chapter_projects;
CREATE POLICY "Admins can manage chapter projects"
  ON public.chapter_projects FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Chapter Activities Policies
DROP POLICY IF EXISTS "Public can view chapter activities" ON public.chapter_activities;
CREATE POLICY "Public can view chapter activities"
  ON public.chapter_activities FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can manage chapter activities" ON public.chapter_activities;
CREATE POLICY "Admins can manage chapter activities"
  ON public.chapter_activities FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Chapter Reports Policies
DROP POLICY IF EXISTS "Public can view assessed reports" ON public.chapter_reports;
CREATE POLICY "Public can view assessed reports"
  ON public.chapter_reports FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Anyone can insert chapter reports" ON public.chapter_reports;
CREATE POLICY "Anyone can insert chapter reports"
  ON public.chapter_reports FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admins and leaders can update chapter reports" ON public.chapter_reports;
CREATE POLICY "Admins and leaders can update chapter reports"
  ON public.chapter_reports FOR UPDATE
  USING (
    (is_locked = false) 
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  )
  WITH CHECK (
    (is_locked = false) 
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "Admins can manage all chapter reports" ON public.chapter_reports;
CREATE POLICY "Admins can manage all chapter reports"
  ON public.chapter_reports FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_chapters_updated_at ON public.chapters;
CREATE TRIGGER update_chapters_updated_at
  BEFORE UPDATE ON public.chapters
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_chapter_leaders_updated_at ON public.chapter_leaders;
CREATE TRIGGER update_chapter_leaders_updated_at
  BEFORE UPDATE ON public.chapter_leaders
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_chapter_reports_updated_at ON public.chapter_reports;
CREATE TRIGGER update_chapter_reports_updated_at
  BEFORE UPDATE ON public.chapter_reports
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

-- =========================================================================
-- 26. SITE SETTINGS & GLOBAL CERTIFICATE TEMPLATE ENGINE
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.site_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}'::jsonb,
  description TEXT,
  updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  updated_by_name TEXT DEFAULT 'YARA Administration',
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view site settings" ON public.site_settings;
CREATE POLICY "Public can view site settings"
  ON public.site_settings FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can manage site settings" ON public.site_settings;
CREATE POLICY "Admins can manage site settings"
  ON public.site_settings FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    OR auth.role() = 'service_role'
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    OR auth.role() = 'service_role'
  );

DROP TRIGGER IF EXISTS update_site_settings_updated_at ON public.site_settings;
CREATE TRIGGER update_site_settings_updated_at
  BEFORE UPDATE ON public.site_settings
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

-- Seed initial certificate template configuration
INSERT INTO public.site_settings (key, value, description, updated_by_name)
VALUES (
  'certificate_template_config',
  '{
    "id": "yara_default_educator_template",
    "organization_name": "YARA ACADEMY OF ADVANCED ROBOTICS & AI",
    "sub_organization_name": "In Collaboration with YARA Zimbabwe • Executive Directorate",
    "certificate_title": "CERTIFICATE OF COMPLETION",
    "certificate_subtitle": "AI FOR EDUCATORS MASTERCLASS & PEDAGOGY ACCREDITATION",
    "citation_text": "has successfully completed the comprehensive national masterclass curriculum on Generative AI Tools for Education, Advanced Prompt Engineering, Automated Lesson Planning, Intelligent Student Assessment Systems, and ethical AI integration in primary & secondary classrooms, satisfying all evaluation criteria with:",
    "honors_badge_text": "Certified Educator - AI & Digital Pedagogy (Honors)",
    "default_grade": "Certified Educator - AI & Digital Pedagogy",
    "founder_name": "Mr. S.O. Manongwa",
    "founder_title": "Founder & Lead Instructor\nYoung Africans Robotics Association (YARA)",
    "founder_signature_url": "/assets/signature-manongwa.jpg",
    "regional_president_name": "Ms. A.M. Chiambiro",
    "regional_president_title": "Regional President\nYARA Zimbabwe",
    "regional_president_signature_url": "/assets/signature-chiambiro.jpg",
    "seal_url": "/assets/seal-certified-ai-educators.jpg",
    "logo_url": "/assets/logo-yara-official.jpg",
    "updated_by_name": "YARA Executive Administration"
  }'::jsonb,
  'Official executive layout, signatures, gold seal, and citation copy for YARA Educator Accreditation Certificates',
  'YARA Executive Administration'
)
ON CONFLICT (key) DO UPDATE SET
  value = EXCLUDED.value,
  description = EXCLUDED.description,
  updated_at = now();

-- =========================================================================
-- 27. SUPABASE STORAGE BUCKETS & ASSET SECURITY POLICIES
-- =========================================================================
-- Ensure storage extension and schema are active
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('event-proofs', 'event-proofs', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']),
  ('certificates', 'certificates', true, 15728640, ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']),
  ('chapter-media', 'chapter-media', true, 20971520, ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf', 'video/mp4']),
  ('lesson-plans', 'lesson-plans', true, 26214400, ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 'text/plain', 'image/jpeg', 'image/png'])
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Storage RLS: Public Read Access
DROP POLICY IF EXISTS "Public can view event proofs" ON storage.objects;
CREATE POLICY "Public can view event proofs"
  ON storage.objects FOR SELECT
  USING (bucket_id IN ('event-proofs', 'certificates', 'chapter-media', 'lesson-plans'));

-- Storage RLS: Anyone can upload event proof or lesson plan submissions
DROP POLICY IF EXISTS "Public upload to event proofs" ON storage.objects;
CREATE POLICY "Public upload to event proofs"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id IN ('event-proofs', 'chapter-media', 'lesson-plans'));

-- Storage RLS: Admins have full control over all storage buckets
DROP POLICY IF EXISTS "Admins have full storage access" ON storage.objects;
CREATE POLICY "Admins have full storage access"
  ON storage.objects FOR ALL
  USING (
    bucket_id IN ('event-proofs', 'certificates', 'chapter-media', 'lesson-plans')
    AND (
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
      OR auth.role() = 'service_role'
    )
  );

-- =========================================================================
-- 28. ADMINISTRATIVE REAL-TIME ANALYTICS & REGISTRATION STATS VIEW
-- =========================================================================
CREATE OR REPLACE VIEW public.admin_event_analytics_summary AS
SELECT 
  event_id,
  COUNT(*) AS total_registrations,
  COUNT(*) FILTER (WHERE payment_status = 'verified') AS verified_paid_count,
  COUNT(*) FILTER (WHERE payment_status = 'submitted') AS proof_submitted_count,
  COUNT(*) FILTER (WHERE payment_status = 'pending') AS pending_payment_count,
  COUNT(*) FILTER (WHERE approval_status = 'approved') AS admin_approved_count,
  COUNT(*) FILTER (WHERE certificate_unlocked = true) AS certificates_unlocked_count,
  COUNT(*) FILTER (WHERE continuous_support_opt_in = true) AS continuous_support_count,
  COALESCE(SUM(registration_fee) FILTER (WHERE payment_status = 'verified'), 0) AS total_revenue_usd,
  COUNT(*) FILTER (WHERE has_entered_event = true) AS live_attendees_entered
FROM public.event_registrations
GROUP BY event_id;

-- Grant select permissions on analytics view to authenticated admins and service role
GRANT SELECT ON public.admin_event_analytics_summary TO authenticated, service_role;

-- =========================================================================
-- 29. MONITORING & EVALUATION (M&E) IMPACT & FINANCIAL AUDIT LEDGER
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

CREATE INDEX IF NOT EXISTS idx_impact_ledger_timestamp ON public.impact_ledger(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_impact_ledger_module ON public.impact_ledger(source_module);
CREATE INDEX IF NOT EXISTS idx_impact_ledger_status ON public.impact_ledger(payment_status, approval_status);
CREATE INDEX IF NOT EXISTS idx_impact_ledger_email ON public.impact_ledger(lower(payer_email));
CREATE INDEX IF NOT EXISTS idx_impact_ledger_ref ON public.impact_ledger(reference_id);

-- =========================================================================
-- 30. EXECUTIVE FINANCIAL AUDITORS ROSTER
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

INSERT INTO public.executive_auditors (id, email, name, title, authorized_by, authorized_at, is_active)
VALUES 
  ('exec_1', 'goyaracorp@gmail.com', 'T. Mukombwe', 'Master Administrator & Lead Trustee', 'Board Resolution 2026/01', '2026-01-01T00:00:00Z', true),
  ('exec_2', 'director@yaria.org', 'Dr. C. Chidemo', 'Regional President & Executive Auditor', 'goyaracorp@gmail.com', '2026-02-15T00:00:00Z', true)
ON CONFLICT (email) DO UPDATE SET
  name = EXCLUDED.name,
  title = EXCLUDED.title,
  is_active = EXCLUDED.is_active;

-- =========================================================================
-- 31. M&E IMPACT SUMMARY ANALYTICS VIEW
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

-- =========================================================================
-- END OF YARA INSTITUTIONAL DATABASE SCHEMA & MIGRATION SCRIPT
-- =========================================================================


