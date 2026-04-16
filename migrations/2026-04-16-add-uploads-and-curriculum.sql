BEGIN;

-- Add avatar/contact columns to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS avatar_storage_path TEXT,
  ADD COLUMN IF NOT EXISTS avatar_size BIGINT,
  ADD COLUMN IF NOT EXISTS avatar_mime_type TEXT,
  ADD COLUMN IF NOT EXISTS social_links JSONB,
  ADD COLUMN IF NOT EXISTS contact_phone TEXT;

-- Extend study_materials (idempotent)
ALTER TABLE public.study_materials
  ADD COLUMN IF NOT EXISTS storage_path TEXT,
  ADD COLUMN IF NOT EXISTS file_size BIGINT,
  ADD COLUMN IF NOT EXISTS file_type TEXT,
  ADD COLUMN IF NOT EXISTS visibility TEXT,
  ADD COLUMN IF NOT EXISTS price DECIMAL(10,2),
  ADD COLUMN IF NOT EXISTS downloads INTEGER,
  ADD COLUMN IF NOT EXISTS tags TEXT[],
  ADD COLUMN IF NOT EXISTS approved BOOLEAN,
  ADD COLUMN IF NOT EXISTS metadata JSONB,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ;

-- Create uploads table
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

-- Create curriculum_feedback
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

-- Ensure update_updated_at function exists
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers
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

-- Enable RLS where appropriate
ALTER TABLE IF EXISTS public.uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.curriculum_feedback ENABLE ROW LEVEL SECURITY;

-- Policies for uploads
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

-- Policies for curriculum_feedback
DROP POLICY IF EXISTS "Users can manage their own curriculum feedback" ON public.curriculum_feedback;
CREATE POLICY "Users can manage their own curriculum feedback"
ON public.curriculum_feedback FOR ALL
USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))
WITH CHECK (auth.uid() = user_id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "Public can view aggregated curriculum feedback" ON public.curriculum_feedback;
CREATE POLICY "Public can view aggregated curriculum feedback"
ON public.curriculum_feedback FOR SELECT
USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

COMMIT;
