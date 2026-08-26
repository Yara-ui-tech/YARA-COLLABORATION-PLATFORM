-- =========================================================================
-- MIGRATION: Confidentiality, Organization Posts, Idea Reactions & Comments,
-- Competitions Management & Finance Investments Fix
-- =========================================================================

-- 1. Create or ensure investments table compatible with FinanceAdminTab
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

-- 2. Mentor Payouts table
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

DROP POLICY IF EXISTS "Mentors can view own payouts" ON public.mentor_payouts;
CREATE POLICY "Mentors can view own payouts"
  ON public.mentor_payouts FOR SELECT
  USING (auth.uid() = mentor_id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- 3. Idea Reactions & Comments
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

-- 4. Organization Posts & Social Broadcast Feed
CREATE TABLE IF NOT EXISTS public.organization_posts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  category TEXT DEFAULT 'announcement', -- 'announcement', 'milestone', 'gallery', 'event', 'press'
  tags TEXT[] DEFAULT '{}',
  is_pinned BOOLEAN DEFAULT false,
  social_channels JSONB DEFAULT '{"twitter": true, "facebook": true, "linkedin": true, "instagram": false}'::jsonb,
  broadcast_status TEXT DEFAULT 'published', -- 'draft', 'published', 'broadcasted'
  author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  author_name TEXT DEFAULT 'YARA Executive Leadership',
  views_count INTEGER DEFAULT 0,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.organization_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view published organization posts" ON public.organization_posts;
CREATE POLICY "Anyone can view published organization posts"
  ON public.organization_posts FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can manage organization posts" ON public.organization_posts;
CREATE POLICY "Admins can manage organization posts"
  ON public.organization_posts FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- 5. Social Media Broadcast Configuration & Webhook Settings
INSERT INTO public.system_settings (key, value, updated_at)
VALUES (
  'social_broadcast_config',
  '{
    "auto_broadcast_enabled": true,
    "webhook_url": "",
    "facebook_page_url": "https://facebook.com/yaraorg",
    "twitter_handle": "https://twitter.com/yara_robotics",
    "linkedin_page_url": "https://linkedin.com/company/young-africans-robotics-association",
    "instagram_handle": "https://instagram.com/yara_robotics",
    "youtube_channel": "https://youtube.com/@yara_robotics",
    "hashtags": "#YARA2026 #AfricanRobotics #STEMInclusion #YouthEngineering"
  }'::jsonb,
  now()
)
ON CONFLICT (key) DO NOTHING;
