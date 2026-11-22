-- ==============================================================================
-- 2026-11-23: MENTOR REAL REVIEWS & PROTECTED READ-ONLY BOOKS (PAID HARDCOPY)
-- ==============================================================================

-- 1. Ensure mentor_reviews table has all necessary columns for real user ratings
CREATE TABLE IF NOT EXISTS public.mentor_reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  mentor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  student_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  mentor_name TEXT,
  learner_name TEXT,
  request_id TEXT,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  review_text TEXT,
  category TEXT DEFAULT 'General Mentorship',
  is_approved BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Ensure all columns exist if table was already created
ALTER TABLE public.mentor_reviews ADD COLUMN IF NOT EXISTS mentor_name TEXT;
ALTER TABLE public.mentor_reviews ADD COLUMN IF NOT EXISTS learner_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;
ALTER TABLE public.mentor_reviews ADD COLUMN IF NOT EXISTS learner_name TEXT;
ALTER TABLE public.mentor_reviews ADD COLUMN IF NOT EXISTS review_text TEXT;
ALTER TABLE public.mentor_reviews ADD COLUMN IF NOT EXISTS comment TEXT;
ALTER TABLE public.mentor_reviews ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'General Mentorship';
ALTER TABLE public.mentor_reviews ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT TRUE;
ALTER TABLE public.mentor_reviews ALTER COLUMN student_id DROP NOT NULL;
ALTER TABLE public.mentor_reviews ALTER COLUMN mentor_id DROP NOT NULL;

-- Enable RLS and setup permissive policies so authenticated learners can submit reviews
ALTER TABLE public.mentor_reviews ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'mentor_reviews' AND policyname = 'Public view approved mentor reviews') THEN
    CREATE POLICY "Public view approved mentor reviews" ON public.mentor_reviews FOR SELECT USING (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'mentor_reviews' AND policyname = 'Anyone submit mentor review') THEN
    CREATE POLICY "Anyone submit mentor review" ON public.mentor_reviews FOR INSERT WITH CHECK (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'mentor_reviews' AND policyname = 'Admins manage mentor reviews') THEN
    CREATE POLICY "Admins manage mentor reviews" ON public.mentor_reviews FOR ALL USING (public.is_admin());
  END IF;
END $$;

-- 2. Extend study_materials table with book publishing & hardcopy ecommerce fields
ALTER TABLE public.study_materials ADD COLUMN IF NOT EXISTS author TEXT DEFAULT 'YARA Robotics Faculty';
ALTER TABLE public.study_materials ADD COLUMN IF NOT EXISTS is_book BOOLEAN DEFAULT FALSE;
ALTER TABLE public.study_materials ADD COLUMN IF NOT EXISTS hardcopy_available BOOLEAN DEFAULT FALSE;
ALTER TABLE public.study_materials ADD COLUMN IF NOT EXISTS hardcopy_price_usd NUMERIC(10,2) DEFAULT 15.00;
ALTER TABLE public.study_materials ADD COLUMN IF NOT EXISTS pages_count INTEGER DEFAULT 0;
ALTER TABLE public.study_materials ADD COLUMN IF NOT EXISTS isbn TEXT;
ALTER TABLE public.study_materials ADD COLUMN IF NOT EXISTS preview_mode TEXT DEFAULT 'read_only';
ALTER TABLE public.study_materials ADD COLUMN IF NOT EXISTS is_downloadable BOOLEAN DEFAULT FALSE;

-- Ensure RLS on study_materials allows public viewing and authenticated upload
ALTER TABLE public.study_materials ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'study_materials' AND policyname = 'Public view study materials') THEN
    CREATE POLICY "Public view study materials" ON public.study_materials FOR SELECT USING (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'study_materials' AND policyname = 'Authenticated insert study materials') THEN
    CREATE POLICY "Authenticated insert study materials" ON public.study_materials FOR INSERT WITH CHECK (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'study_materials' AND policyname = 'Admins manage study materials') THEN
    CREATE POLICY "Admins manage study materials" ON public.study_materials FOR ALL USING (public.is_admin());
  END IF;
END $$;

-- 3. Ensure shop_orders table exists for hardcopy book purchases
CREATE TABLE IF NOT EXISTS public.shop_orders (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL,
  product_title TEXT NOT NULL,
  quantity INTEGER DEFAULT 1,
  total_price_usd NUMERIC(10,2) NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  delivery_address TEXT NOT NULL,
  city_or_province TEXT NOT NULL,
  school_or_club_name TEXT,
  payment_method TEXT DEFAULT 'ecocash',
  status TEXT DEFAULT 'pending',
  order_type TEXT DEFAULT 'hardcopy_book',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.shop_orders ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'shop_orders' AND policyname = 'Anyone can insert shop orders') THEN
    CREATE POLICY "Anyone can insert shop orders" ON public.shop_orders FOR INSERT WITH CHECK (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'shop_orders' AND policyname = 'Public view own shop orders') THEN
    CREATE POLICY "Public view own shop orders" ON public.shop_orders FOR SELECT USING (true);
  END IF;
END $$;

