-- YARIA Collaboration Platform Database Schema
-- Run these SQL commands in your Supabase SQL editor

-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Create custom types
CREATE TYPE user_role AS ENUM ('innovator', 'mentor', 'admin');
CREATE TYPE mentorship_status AS ENUM ('pending', 'accepted', 'rejected', 'completed');
CREATE TYPE feedback_category AS ENUM ('general', 'mentorship', 'platform', 'events');

-- Profiles table (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  display_name TEXT,
  email TEXT UNIQUE,
  avatar_url TEXT,
  bio TEXT,
  role user_role DEFAULT 'innovator',
  educational_level TEXT DEFAULT 'junior',
  skills TEXT[] DEFAULT '{}',
  interests TEXT[] DEFAULT '{}',
  member_id TEXT UNIQUE,
  rating DECIMAL(3,2) DEFAULT 0,
  mentored_count INTEGER DEFAULT 0,
  total_commission DECIMAL(10,2) DEFAULT 0,
  commission_rate DECIMAL(5,2) DEFAULT 0,
  is_halted BOOLEAN DEFAULT false,
  registration_paid BOOLEAN DEFAULT false,
  subscription_expires_at TIMESTAMPTZ,
  trial_ends_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '4 days'),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ideas table
CREATE TABLE ideas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content TEXT NOT NULL,
  author_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Projects table
CREATE TABLE projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  owner_name TEXT NOT NULL,
  image_url TEXT,
  tags TEXT[] DEFAULT '{}',
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Mentorship requests table
CREATE TABLE mentorship_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  requester_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  mentor_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  message TEXT,
  status mentorship_status DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Live sessions table
CREATE TABLE live_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  mentor_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category TEXT DEFAULT 'general',
  room_id TEXT UNIQUE NOT NULL,
  required_skills TEXT[] DEFAULT '{}',
  video_url TEXT,
  is_external BOOLEAN DEFAULT false,
  description TEXT,
  is_live BOOLEAN DEFAULT true,
  is_approved BOOLEAN DEFAULT false,
  student_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Study materials table
CREATE TABLE study_materials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT NOT NULL,
  file_type TEXT,
  uploaded_by UUID REFERENCES profiles(id) ON DELETE CASCADE,
  category TEXT DEFAULT 'general',
  tags TEXT[] DEFAULT '{}',
  download_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Mentor reviews table
CREATE TABLE mentor_reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  mentor_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  reviewer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Events table
CREATE TABLE events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  date TIMESTAMPTZ NOT NULL,
  location TEXT,
  image_url TEXT,
  registration_link TEXT,
  is_upcoming BOOLEAN DEFAULT true,
  category TEXT DEFAULT 'workshop',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Competitions table
CREATE TABLE competitions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  registration_link TEXT,
  image_url TEXT,
  status TEXT DEFAULT 'upcoming',
  rules TEXT,
  prizes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Feedback table
CREATE TABLE feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  category feedback_category DEFAULT 'general',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User sessions table (for analytics)
CREATE TABLE user_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  session_start TIMESTAMPTZ DEFAULT NOW(),
  session_end TIMESTAMPTZ,
  device_info JSONB,
  page_views JSONB DEFAULT '[]'
);

-- Enable Row Level Security on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentorship_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE live_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentor_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- Create storage bucket for uploads
INSERT INTO storage.buckets (id, name, public) VALUES ('uploads', 'uploads', true);

-- Row Level Security Policies

-- Profiles: Users can read all profiles, update their own
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Ideas: Everyone can read, authenticated users can create, only authors can update/delete
CREATE POLICY "Ideas are viewable by everyone" ON ideas FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create ideas" ON ideas FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update own ideas" ON ideas FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "Users can delete own ideas" ON ideas FOR DELETE USING (auth.uid() = author_id);

-- Projects: Everyone can read, authenticated users can create, only owners can update/delete
CREATE POLICY "Projects are viewable by everyone" ON projects FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create projects" ON projects FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update own projects" ON projects FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Users can delete own projects" ON projects FOR DELETE USING (auth.uid() = owner_id);

-- Mentorship requests: Users can see their own requests, mentors can see requests to them
CREATE POLICY "Users can view their own requests" ON mentorship_requests FOR SELECT USING (auth.uid() = requester_id);
CREATE POLICY "Mentors can view requests to them" ON mentorship_requests FOR SELECT USING (auth.uid() = mentor_id);
CREATE POLICY "Users can create requests" ON mentorship_requests FOR INSERT WITH CHECK (auth.uid() = requester_id);
CREATE POLICY "Mentors can update requests to them" ON mentorship_requests FOR UPDATE USING (auth.uid() = mentor_id);

-- Live sessions: Approved sessions are public, mentors can manage their own
CREATE POLICY "Approved live sessions are viewable by everyone" ON live_sessions FOR SELECT USING (is_approved = true);
CREATE POLICY "Mentors can view their own sessions" ON live_sessions FOR SELECT USING (auth.uid() = mentor_id);
CREATE POLICY "Mentors can create sessions" ON live_sessions FOR INSERT WITH CHECK (auth.uid() = mentor_id);
CREATE POLICY "Mentors can update their sessions" ON live_sessions FOR UPDATE USING (auth.uid() = mentor_id);

-- Study materials: Everyone can read, mentors can create
CREATE POLICY "Study materials are viewable by everyone" ON study_materials FOR SELECT USING (true);
CREATE POLICY "Mentors can upload materials" ON study_materials FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'mentor')
);

-- Mentor reviews: Everyone can read, authenticated users can create
CREATE POLICY "Reviews are viewable by everyone" ON mentor_reviews FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create reviews" ON mentor_reviews FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Events: Everyone can read, admins can manage
CREATE POLICY "Events are viewable by everyone" ON events FOR SELECT USING (true);
CREATE POLICY "Admins can manage events" ON events FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Competitions: Everyone can read, admins can manage
CREATE POLICY "Competitions are viewable by everyone" ON competitions FOR SELECT USING (true);
CREATE POLICY "Admins can manage competitions" ON competitions FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Feedback: Everyone can read, authenticated users can create
CREATE POLICY "Feedback is viewable by everyone" ON feedback FOR SELECT USING (true);
CREATE POLICY "Authenticated users can submit feedback" ON feedback FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- User sessions: Users can only see their own sessions
CREATE POLICY "Users can view their own sessions" ON user_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own sessions" ON user_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own sessions" ON user_sessions FOR UPDATE USING (auth.uid() = user_id);

-- Storage policies for uploads bucket
CREATE POLICY "Anyone can view uploads" ON storage.objects FOR SELECT USING (bucket_id = 'uploads');
CREATE POLICY "Authenticated users can upload files" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'uploads' AND auth.role() = 'authenticated'
);

-- Create indexes for better performance
CREATE INDEX idx_ideas_author_id ON ideas(author_id);
CREATE INDEX idx_ideas_created_at ON ideas(created_at DESC);
CREATE INDEX idx_projects_owner_id ON projects(owner_id);
CREATE INDEX idx_projects_created_at ON projects(created_at DESC);
CREATE INDEX idx_mentorship_requests_requester ON mentorship_requests(requester_id);
CREATE INDEX idx_mentorship_requests_mentor ON mentorship_requests(mentor_id);
CREATE INDEX idx_mentorship_requests_status ON mentorship_requests(status);
CREATE INDEX idx_live_sessions_mentor ON live_sessions(mentor_id);
CREATE INDEX idx_live_sessions_approved ON live_sessions(is_approved);
CREATE INDEX idx_live_sessions_live ON live_sessions(is_live);
CREATE INDEX idx_study_materials_category ON study_materials(category);
CREATE INDEX idx_events_date ON events(date);
CREATE INDEX idx_events_upcoming ON events(is_upcoming);
CREATE INDEX idx_competitions_dates ON competitions(start_date, end_date);
CREATE INDEX idx_feedback_rating ON feedback(rating);
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_email ON profiles(email);

-- Create functions for automatic profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, email)
  VALUES (new.id, new.raw_user_meta_data->>'display_name', new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger AS $$
BEGIN
  new.updated_at = NOW();
  RETURN new;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers to relevant tables
CREATE TRIGGER set_updated_at ON profiles BEFORE UPDATE FOR EACH ROW EXECUTE PROCEDURE handle_updated_at();
CREATE TRIGGER set_updated_at ON ideas BEFORE UPDATE FOR EACH ROW EXECUTE PROCEDURE handle_updated_at();
CREATE TRIGGER set_updated_at ON projects BEFORE UPDATE FOR EACH ROW EXECUTE PROCEDURE handle_updated_at();
CREATE TRIGGER set_updated_at ON mentorship_requests BEFORE UPDATE FOR EACH ROW EXECUTE PROCEDURE handle_updated_at();
CREATE TRIGGER set_updated_at ON live_sessions BEFORE UPDATE FOR EACH ROW EXECUTE PROCEDURE handle_updated_at();

-- Function to calculate mentor rating
CREATE OR REPLACE FUNCTION calculate_mentor_rating(mentor_uuid UUID)
RETURNS DECIMAL(3,2) AS $$
DECLARE
  avg_rating DECIMAL(3,2);
BEGIN
  SELECT AVG(rating)::DECIMAL(3,2) INTO avg_rating
  FROM mentor_reviews
  WHERE mentor_id = mentor_uuid;

  RETURN COALESCE(avg_rating, 0);
END;
$$ LANGUAGE plpgsql;

-- Function to update mentor stats after review
CREATE OR REPLACE FUNCTION update_mentor_stats()
RETURNS trigger AS $$
BEGIN
  UPDATE profiles
  SET rating = calculate_mentor_rating(NEW.mentor_id),
      mentored_count = mentored_count + 1
  WHERE id = NEW.mentor_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_mentor_stats_on_review
  AFTER INSERT ON mentor_reviews
  FOR EACH ROW EXECUTE PROCEDURE update_mentor_stats();