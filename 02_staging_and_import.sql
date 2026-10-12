-- ==============================================================================
-- 02_staging_and_import.sql
-- YARA Pan-African Platform - Upload Containers, Staging & Ingestion Engine
-- Purpose: Bulk data upload via CSV into isolated staging tables,
--          field-level validation, and transactional upsert into production.
-- Security: Admin RBAC (public.is_admin()) strictly enforced on all tables & functions.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- Container: staging_courses
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.staging_courses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  code TEXT,
  title TEXT,
  slug TEXT,
  track TEXT,
  tier TEXT,
  level TEXT,
  short_summary TEXT,
  description TEXT,
  estimated_duration_hours TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'validated', 'rejected', 'imported')),
  error_message TEXT,
  batch_id UUID NOT NULL,
  uploaded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  uploaded_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.staging_courses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins manage staging_courses" ON public.staging_courses;
CREATE POLICY "Admins manage staging_courses" ON public.staging_courses FOR ALL USING (public.is_admin());

-- Validate staging_courses rows
CREATE OR REPLACE FUNCTION public.validate_courses(p_batch_id UUID)
RETURNS JSONB AS $$
DECLARE
  r RECORD;
  v_err TEXT;
  v_valid_cnt INTEGER := 0;
  v_invalid_cnt INTEGER := 0;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied: Administrator role required.';
  END IF;

  FOR r IN SELECT * FROM public.staging_courses WHERE batch_id = p_batch_id LOOP
    v_err := NULL;
    IF r.code IS NULL OR TRIM(r.code) = '' THEN
      v_err := COALESCE(v_err || '; ', '') || 'Field "code" is required';
    END IF;
    IF r.title IS NULL OR TRIM(r.title) = '' THEN
      v_err := COALESCE(v_err || '; ', '') || 'Field "title" is required';
    END IF;
    IF r.slug IS NULL OR TRIM(r.slug) = '' THEN
      v_err := COALESCE(v_err || '; ', '') || 'Field "slug" is required';
    END IF;

    IF v_err IS NOT NULL THEN
      UPDATE public.staging_courses SET status = 'rejected', error_message = v_err WHERE id = r.id;
      v_invalid_cnt := v_invalid_cnt + 1;
    ELSE
      UPDATE public.staging_courses SET status = 'validated', error_message = NULL WHERE id = r.id;
      v_valid_cnt := v_valid_cnt + 1;
    END IF;
  END LOOP;

  RETURN jsonb_build_object('batch_id', p_batch_id, 'validated', v_valid_cnt, 'rejected', v_invalid_cnt);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Import staging_courses rows into public.courses
CREATE OR REPLACE FUNCTION public.import_courses(p_batch_id UUID)
RETURNS JSONB AS $$
DECLARE
  r RECORD;
  v_imported_cnt INTEGER := 0;
  v_rejected_cnt INTEGER := 0;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied: Administrator role required.';
  END IF;

  -- Perform validation pass first
  PERFORM public.validate_courses(p_batch_id);

  FOR r IN SELECT * FROM public.staging_courses WHERE batch_id = p_batch_id AND status = 'validated' LOOP
    BEGIN
      INSERT INTO public.courses (
        code, title, slug, track, tier, level, short_summary, description, estimated_duration_hours
      ) VALUES (
        NULLIF(TRIM(r.code), ''),
        NULLIF(TRIM(r.title), ''),
        NULLIF(TRIM(r.slug), ''),
        NULLIF(TRIM(r.track), ''),
        NULLIF(TRIM(r.tier), '')::INTEGER,
        NULLIF(TRIM(r.level), ''),
        NULLIF(TRIM(r.short_summary), ''),
        NULLIF(TRIM(r.description), ''),
        NULLIF(TRIM(r.estimated_duration_hours), '')::INTEGER
      )
      ON CONFLICT (slug) DO UPDATE SET
        code = EXCLUDED.code,
          title = EXCLUDED.title,
          slug = EXCLUDED.slug,
          track = EXCLUDED.track,
          tier = EXCLUDED.tier,
          level = EXCLUDED.level,
          short_summary = EXCLUDED.short_summary,
          description = EXCLUDED.description,
          estimated_duration_hours = EXCLUDED.estimated_duration_hours;

      UPDATE public.staging_courses SET status = 'imported', error_message = NULL WHERE id = r.id;
      v_imported_cnt := v_imported_cnt + 1;
    EXCEPTION WHEN OTHERS THEN
      UPDATE public.staging_courses SET status = 'rejected', error_message = SQLERRM WHERE id = r.id;
      v_rejected_cnt := v_rejected_cnt + 1;
    END;
  END LOOP;

  RETURN jsonb_build_object('batch_id', p_batch_id, 'imported', v_imported_cnt, 'rejected', v_rejected_cnt);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ------------------------------------------------------------------------------
-- Container: staging_course_modules
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.staging_course_modules (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  course_id TEXT,
  module_number TEXT,
  order_index TEXT,
  title TEXT,
  coherent_skill_area TEXT,
  description TEXT,
  theory_overview TEXT,
  video_url TEXT,
  video_title TEXT,
  video_duration_seconds TEXT,
  guided_lab_title TEXT,
  guided_lab_instructions TEXT,
  guided_lab_simulation_url TEXT,
  assignment_title TEXT,
  assignment_instructions TEXT,
  assignment_max_points TEXT,
  troubleshooting_guide TEXT,
  mentor_support_topic TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'validated', 'rejected', 'imported')),
  error_message TEXT,
  batch_id UUID NOT NULL,
  uploaded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  uploaded_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.staging_course_modules ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins manage staging_course_modules" ON public.staging_course_modules;
CREATE POLICY "Admins manage staging_course_modules" ON public.staging_course_modules FOR ALL USING (public.is_admin());

-- Validate staging_course_modules rows
CREATE OR REPLACE FUNCTION public.validate_course_modules(p_batch_id UUID)
RETURNS JSONB AS $$
DECLARE
  r RECORD;
  v_err TEXT;
  v_valid_cnt INTEGER := 0;
  v_invalid_cnt INTEGER := 0;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied: Administrator role required.';
  END IF;

  FOR r IN SELECT * FROM public.staging_course_modules WHERE batch_id = p_batch_id LOOP
    v_err := NULL;
    IF r.course_id IS NULL OR TRIM(r.course_id) = '' THEN
      v_err := COALESCE(v_err || '; ', '') || 'Field "course_id" is required';
    END IF;
    IF r.module_number IS NULL OR TRIM(r.module_number) = '' THEN
      v_err := COALESCE(v_err || '; ', '') || 'Field "module_number" is required';
    END IF;
    IF r.title IS NULL OR TRIM(r.title) = '' THEN
      v_err := COALESCE(v_err || '; ', '') || 'Field "title" is required';
    END IF;

    IF v_err IS NOT NULL THEN
      UPDATE public.staging_course_modules SET status = 'rejected', error_message = v_err WHERE id = r.id;
      v_invalid_cnt := v_invalid_cnt + 1;
    ELSE
      UPDATE public.staging_course_modules SET status = 'validated', error_message = NULL WHERE id = r.id;
      v_valid_cnt := v_valid_cnt + 1;
    END IF;
  END LOOP;

  RETURN jsonb_build_object('batch_id', p_batch_id, 'validated', v_valid_cnt, 'rejected', v_invalid_cnt);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Import staging_course_modules rows into public.course_modules
CREATE OR REPLACE FUNCTION public.import_course_modules(p_batch_id UUID)
RETURNS JSONB AS $$
DECLARE
  r RECORD;
  v_imported_cnt INTEGER := 0;
  v_rejected_cnt INTEGER := 0;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied: Administrator role required.';
  END IF;

  -- Perform validation pass first
  PERFORM public.validate_course_modules(p_batch_id);

  FOR r IN SELECT * FROM public.staging_course_modules WHERE batch_id = p_batch_id AND status = 'validated' LOOP
    BEGIN
      INSERT INTO public.course_modules (
        course_id, module_number, order_index, title, coherent_skill_area, description, theory_overview, video_url, video_title, video_duration_seconds, guided_lab_title, guided_lab_instructions, guided_lab_simulation_url, assignment_title, assignment_instructions, assignment_max_points, troubleshooting_guide, mentor_support_topic
      ) VALUES (
        NULLIF(TRIM(r.course_id), '')::UUID,
        NULLIF(TRIM(r.module_number), '')::INTEGER,
        NULLIF(TRIM(r.order_index), '')::INTEGER,
        NULLIF(TRIM(r.title), ''),
        NULLIF(TRIM(r.coherent_skill_area), ''),
        NULLIF(TRIM(r.description), ''),
        NULLIF(TRIM(r.theory_overview), ''),
        NULLIF(TRIM(r.video_url), ''),
        NULLIF(TRIM(r.video_title), ''),
        NULLIF(TRIM(r.video_duration_seconds), '')::INTEGER,
        NULLIF(TRIM(r.guided_lab_title), ''),
        NULLIF(TRIM(r.guided_lab_instructions), ''),
        NULLIF(TRIM(r.guided_lab_simulation_url), ''),
        NULLIF(TRIM(r.assignment_title), ''),
        NULLIF(TRIM(r.assignment_instructions), ''),
        NULLIF(TRIM(r.assignment_max_points), '')::INTEGER,
        NULLIF(TRIM(r.troubleshooting_guide), ''),
        NULLIF(TRIM(r.mentor_support_topic), '')
      )
      ON CONFLICT (course_id, module_number) DO UPDATE SET
        course_id = EXCLUDED.course_id,
          module_number = EXCLUDED.module_number,
          order_index = EXCLUDED.order_index,
          title = EXCLUDED.title,
          coherent_skill_area = EXCLUDED.coherent_skill_area,
          description = EXCLUDED.description,
          theory_overview = EXCLUDED.theory_overview,
          video_url = EXCLUDED.video_url,
          video_title = EXCLUDED.video_title,
          video_duration_seconds = EXCLUDED.video_duration_seconds,
          guided_lab_title = EXCLUDED.guided_lab_title,
          guided_lab_instructions = EXCLUDED.guided_lab_instructions,
          guided_lab_simulation_url = EXCLUDED.guided_lab_simulation_url,
          assignment_title = EXCLUDED.assignment_title,
          assignment_instructions = EXCLUDED.assignment_instructions,
          assignment_max_points = EXCLUDED.assignment_max_points,
          troubleshooting_guide = EXCLUDED.troubleshooting_guide,
          mentor_support_topic = EXCLUDED.mentor_support_topic;

      UPDATE public.staging_course_modules SET status = 'imported', error_message = NULL WHERE id = r.id;
      v_imported_cnt := v_imported_cnt + 1;
    EXCEPTION WHEN OTHERS THEN
      UPDATE public.staging_course_modules SET status = 'rejected', error_message = SQLERRM WHERE id = r.id;
      v_rejected_cnt := v_rejected_cnt + 1;
    END;
  END LOOP;

  RETURN jsonb_build_object('batch_id', p_batch_id, 'imported', v_imported_cnt, 'rejected', v_rejected_cnt);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ------------------------------------------------------------------------------
-- Container: staging_course_projects
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.staging_course_projects (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  course_id TEXT,
  project_type TEXT,
  title TEXT,
  description TEXT,
  guidelines TEXT,
  rubric TEXT,
  order_index TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'validated', 'rejected', 'imported')),
  error_message TEXT,
  batch_id UUID NOT NULL,
  uploaded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  uploaded_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.staging_course_projects ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins manage staging_course_projects" ON public.staging_course_projects;
CREATE POLICY "Admins manage staging_course_projects" ON public.staging_course_projects FOR ALL USING (public.is_admin());

-- Validate staging_course_projects rows
CREATE OR REPLACE FUNCTION public.validate_course_projects(p_batch_id UUID)
RETURNS JSONB AS $$
DECLARE
  r RECORD;
  v_err TEXT;
  v_valid_cnt INTEGER := 0;
  v_invalid_cnt INTEGER := 0;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied: Administrator role required.';
  END IF;

  FOR r IN SELECT * FROM public.staging_course_projects WHERE batch_id = p_batch_id LOOP
    v_err := NULL;
    IF r.course_id IS NULL OR TRIM(r.course_id) = '' THEN
      v_err := COALESCE(v_err || '; ', '') || 'Field "course_id" is required';
    END IF;
    IF r.project_type IS NULL OR TRIM(r.project_type) = '' THEN
      v_err := COALESCE(v_err || '; ', '') || 'Field "project_type" is required';
    END IF;
    IF r.title IS NULL OR TRIM(r.title) = '' THEN
      v_err := COALESCE(v_err || '; ', '') || 'Field "title" is required';
    END IF;

    IF v_err IS NOT NULL THEN
      UPDATE public.staging_course_projects SET status = 'rejected', error_message = v_err WHERE id = r.id;
      v_invalid_cnt := v_invalid_cnt + 1;
    ELSE
      UPDATE public.staging_course_projects SET status = 'validated', error_message = NULL WHERE id = r.id;
      v_valid_cnt := v_valid_cnt + 1;
    END IF;
  END LOOP;

  RETURN jsonb_build_object('batch_id', p_batch_id, 'validated', v_valid_cnt, 'rejected', v_invalid_cnt);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Import staging_course_projects rows into public.course_projects
CREATE OR REPLACE FUNCTION public.import_course_projects(p_batch_id UUID)
RETURNS JSONB AS $$
DECLARE
  r RECORD;
  v_imported_cnt INTEGER := 0;
  v_rejected_cnt INTEGER := 0;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied: Administrator role required.';
  END IF;

  -- Perform validation pass first
  PERFORM public.validate_course_projects(p_batch_id);

  FOR r IN SELECT * FROM public.staging_course_projects WHERE batch_id = p_batch_id AND status = 'validated' LOOP
    BEGIN
      INSERT INTO public.course_projects (
        course_id, project_type, title, description, guidelines, rubric, order_index
      ) VALUES (
        NULLIF(TRIM(r.course_id), '')::UUID,
        NULLIF(TRIM(r.project_type), ''),
        NULLIF(TRIM(r.title), ''),
        NULLIF(TRIM(r.description), ''),
        NULLIF(TRIM(r.guidelines), ''),
        COALESCE(NULLIF(TRIM(r.rubric), '')::JSONB, '[]'::JSONB),
        NULLIF(TRIM(r.order_index), '')::INTEGER
      )
      ON CONFLICT (course_id, project_type) DO UPDATE SET
        course_id = EXCLUDED.course_id,
          project_type = EXCLUDED.project_type,
          title = EXCLUDED.title,
          description = EXCLUDED.description,
          guidelines = EXCLUDED.guidelines,
          rubric = EXCLUDED.rubric,
          order_index = EXCLUDED.order_index;

      UPDATE public.staging_course_projects SET status = 'imported', error_message = NULL WHERE id = r.id;
      v_imported_cnt := v_imported_cnt + 1;
    EXCEPTION WHEN OTHERS THEN
      UPDATE public.staging_course_projects SET status = 'rejected', error_message = SQLERRM WHERE id = r.id;
      v_rejected_cnt := v_rejected_cnt + 1;
    END;
  END LOOP;

  RETURN jsonb_build_object('batch_id', p_batch_id, 'imported', v_imported_cnt, 'rejected', v_rejected_cnt);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ------------------------------------------------------------------------------
-- Container: staging_impact_ledger
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.staging_impact_ledger (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  metric_key TEXT,
  metric_title TEXT,
  verified_value TEXT,
  unit TEXT,
  verification_source TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'validated', 'rejected', 'imported')),
  error_message TEXT,
  batch_id UUID NOT NULL,
  uploaded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  uploaded_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.staging_impact_ledger ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins manage staging_impact_ledger" ON public.staging_impact_ledger;
CREATE POLICY "Admins manage staging_impact_ledger" ON public.staging_impact_ledger FOR ALL USING (public.is_admin());

-- Validate staging_impact_ledger rows
CREATE OR REPLACE FUNCTION public.validate_impact_ledger(p_batch_id UUID)
RETURNS JSONB AS $$
DECLARE
  r RECORD;
  v_err TEXT;
  v_valid_cnt INTEGER := 0;
  v_invalid_cnt INTEGER := 0;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied: Administrator role required.';
  END IF;

  FOR r IN SELECT * FROM public.staging_impact_ledger WHERE batch_id = p_batch_id LOOP
    v_err := NULL;
    IF r.metric_key IS NULL OR TRIM(r.metric_key) = '' THEN
      v_err := COALESCE(v_err || '; ', '') || 'Field "metric_key" is required';
    END IF;
    IF r.metric_title IS NULL OR TRIM(r.metric_title) = '' THEN
      v_err := COALESCE(v_err || '; ', '') || 'Field "metric_title" is required';
    END IF;
    IF r.verified_value IS NULL OR TRIM(r.verified_value) = '' THEN
      v_err := COALESCE(v_err || '; ', '') || 'Field "verified_value" is required';
    END IF;
    IF r.unit IS NULL OR TRIM(r.unit) = '' THEN
      v_err := COALESCE(v_err || '; ', '') || 'Field "unit" is required';
    END IF;
    IF r.verification_source IS NULL OR TRIM(r.verification_source) = '' THEN
      v_err := COALESCE(v_err || '; ', '') || 'Field "verification_source" is required';
    END IF;

    IF v_err IS NOT NULL THEN
      UPDATE public.staging_impact_ledger SET status = 'rejected', error_message = v_err WHERE id = r.id;
      v_invalid_cnt := v_invalid_cnt + 1;
    ELSE
      UPDATE public.staging_impact_ledger SET status = 'validated', error_message = NULL WHERE id = r.id;
      v_valid_cnt := v_valid_cnt + 1;
    END IF;
  END LOOP;

  RETURN jsonb_build_object('batch_id', p_batch_id, 'validated', v_valid_cnt, 'rejected', v_invalid_cnt);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Import staging_impact_ledger rows into public.impact_ledger
CREATE OR REPLACE FUNCTION public.import_impact_ledger(p_batch_id UUID)
RETURNS JSONB AS $$
DECLARE
  r RECORD;
  v_imported_cnt INTEGER := 0;
  v_rejected_cnt INTEGER := 0;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied: Administrator role required.';
  END IF;

  -- Perform validation pass first
  PERFORM public.validate_impact_ledger(p_batch_id);

  FOR r IN SELECT * FROM public.staging_impact_ledger WHERE batch_id = p_batch_id AND status = 'validated' LOOP
    BEGIN
      INSERT INTO public.impact_ledger (
        metric_key, metric_title, verified_value, unit, verification_source
      ) VALUES (
        NULLIF(TRIM(r.metric_key), ''),
        NULLIF(TRIM(r.metric_title), ''),
        NULLIF(TRIM(r.verified_value), '')::BIGINT,
        NULLIF(TRIM(r.unit), ''),
        NULLIF(TRIM(r.verification_source), '')
      )
      ON CONFLICT (metric_key) DO UPDATE SET
        metric_key = EXCLUDED.metric_key,
          metric_title = EXCLUDED.metric_title,
          verified_value = EXCLUDED.verified_value,
          unit = EXCLUDED.unit,
          verification_source = EXCLUDED.verification_source;

      UPDATE public.staging_impact_ledger SET status = 'imported', error_message = NULL WHERE id = r.id;
      v_imported_cnt := v_imported_cnt + 1;
    EXCEPTION WHEN OTHERS THEN
      UPDATE public.staging_impact_ledger SET status = 'rejected', error_message = SQLERRM WHERE id = r.id;
      v_rejected_cnt := v_rejected_cnt + 1;
    END;
  END LOOP;

  RETURN jsonb_build_object('batch_id', p_batch_id, 'imported', v_imported_cnt, 'rejected', v_rejected_cnt);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ------------------------------------------------------------------------------
-- Container: staging_testimonials
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.staging_testimonials (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  author_name TEXT,
  author_role TEXT,
  rating TEXT,
  category TEXT,
  content TEXT,
  is_featured TEXT,
  is_approved TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'validated', 'rejected', 'imported')),
  error_message TEXT,
  batch_id UUID NOT NULL,
  uploaded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  uploaded_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.staging_testimonials ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins manage staging_testimonials" ON public.staging_testimonials;
CREATE POLICY "Admins manage staging_testimonials" ON public.staging_testimonials FOR ALL USING (public.is_admin());

-- Validate staging_testimonials rows
CREATE OR REPLACE FUNCTION public.validate_testimonials(p_batch_id UUID)
RETURNS JSONB AS $$
DECLARE
  r RECORD;
  v_err TEXT;
  v_valid_cnt INTEGER := 0;
  v_invalid_cnt INTEGER := 0;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied: Administrator role required.';
  END IF;

  FOR r IN SELECT * FROM public.staging_testimonials WHERE batch_id = p_batch_id LOOP
    v_err := NULL;
    IF r.author_name IS NULL OR TRIM(r.author_name) = '' THEN
      v_err := COALESCE(v_err || '; ', '') || 'Field "author_name" is required';
    END IF;
    IF r.content IS NULL OR TRIM(r.content) = '' THEN
      v_err := COALESCE(v_err || '; ', '') || 'Field "content" is required';
    END IF;

    IF v_err IS NOT NULL THEN
      UPDATE public.staging_testimonials SET status = 'rejected', error_message = v_err WHERE id = r.id;
      v_invalid_cnt := v_invalid_cnt + 1;
    ELSE
      UPDATE public.staging_testimonials SET status = 'validated', error_message = NULL WHERE id = r.id;
      v_valid_cnt := v_valid_cnt + 1;
    END IF;
  END LOOP;

  RETURN jsonb_build_object('batch_id', p_batch_id, 'validated', v_valid_cnt, 'rejected', v_invalid_cnt);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Import staging_testimonials rows into public.testimonials
CREATE OR REPLACE FUNCTION public.import_testimonials(p_batch_id UUID)
RETURNS JSONB AS $$
DECLARE
  r RECORD;
  v_imported_cnt INTEGER := 0;
  v_rejected_cnt INTEGER := 0;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied: Administrator role required.';
  END IF;

  -- Perform validation pass first
  PERFORM public.validate_testimonials(p_batch_id);

  FOR r IN SELECT * FROM public.staging_testimonials WHERE batch_id = p_batch_id AND status = 'validated' LOOP
    BEGIN
      INSERT INTO public.testimonials (
        author_name, author_role, rating, category, content, is_featured, is_approved
      ) VALUES (
        NULLIF(TRIM(r.author_name), ''),
        NULLIF(TRIM(r.author_role), ''),
        NULLIF(TRIM(r.rating), '')::INTEGER,
        NULLIF(TRIM(r.category), ''),
        NULLIF(TRIM(r.content), ''),
        COALESCE(LOWER(TRIM(r.is_featured)) = 'true', FALSE),
        COALESCE(LOWER(TRIM(r.is_approved)) = 'true', FALSE)
      )
      ON CONFLICT (author_name) DO UPDATE SET
        author_name = EXCLUDED.author_name,
          author_role = EXCLUDED.author_role,
          rating = EXCLUDED.rating,
          category = EXCLUDED.category,
          content = EXCLUDED.content,
          is_featured = EXCLUDED.is_featured,
          is_approved = EXCLUDED.is_approved;

      UPDATE public.staging_testimonials SET status = 'imported', error_message = NULL WHERE id = r.id;
      v_imported_cnt := v_imported_cnt + 1;
    EXCEPTION WHEN OTHERS THEN
      UPDATE public.staging_testimonials SET status = 'rejected', error_message = SQLERRM WHERE id = r.id;
      v_rejected_cnt := v_rejected_cnt + 1;
    END;
  END LOOP;

  RETURN jsonb_build_object('batch_id', p_batch_id, 'imported', v_imported_cnt, 'rejected', v_rejected_cnt);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ------------------------------------------------------------------------------
-- Container: staging_sponsors
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.staging_sponsors (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  organization_name TEXT,
  contact_person TEXT,
  email TEXT,
  tier TEXT,
  contribution_type TEXT,
  committed_amount TEXT,
  received_amount TEXT,
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'validated', 'rejected', 'imported')),
  error_message TEXT,
  batch_id UUID NOT NULL,
  uploaded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  uploaded_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.staging_sponsors ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins manage staging_sponsors" ON public.staging_sponsors;
CREATE POLICY "Admins manage staging_sponsors" ON public.staging_sponsors FOR ALL USING (public.is_admin());

-- Validate staging_sponsors rows
CREATE OR REPLACE FUNCTION public.validate_sponsors(p_batch_id UUID)
RETURNS JSONB AS $$
DECLARE
  r RECORD;
  v_err TEXT;
  v_valid_cnt INTEGER := 0;
  v_invalid_cnt INTEGER := 0;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied: Administrator role required.';
  END IF;

  FOR r IN SELECT * FROM public.staging_sponsors WHERE batch_id = p_batch_id LOOP
    v_err := NULL;
    IF r.organization_name IS NULL OR TRIM(r.organization_name) = '' THEN
      v_err := COALESCE(v_err || '; ', '') || 'Field "organization_name" is required';
    END IF;

    IF v_err IS NOT NULL THEN
      UPDATE public.staging_sponsors SET status = 'rejected', error_message = v_err WHERE id = r.id;
      v_invalid_cnt := v_invalid_cnt + 1;
    ELSE
      UPDATE public.staging_sponsors SET status = 'validated', error_message = NULL WHERE id = r.id;
      v_valid_cnt := v_valid_cnt + 1;
    END IF;
  END LOOP;

  RETURN jsonb_build_object('batch_id', p_batch_id, 'validated', v_valid_cnt, 'rejected', v_invalid_cnt);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Import staging_sponsors rows into public.sponsors
CREATE OR REPLACE FUNCTION public.import_sponsors(p_batch_id UUID)
RETURNS JSONB AS $$
DECLARE
  r RECORD;
  v_imported_cnt INTEGER := 0;
  v_rejected_cnt INTEGER := 0;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied: Administrator role required.';
  END IF;

  -- Perform validation pass first
  PERFORM public.validate_sponsors(p_batch_id);

  FOR r IN SELECT * FROM public.staging_sponsors WHERE batch_id = p_batch_id AND status = 'validated' LOOP
    BEGIN
      INSERT INTO public.sponsors (
        organization_name, contact_person, email, tier, contribution_type, committed_amount, received_amount, description
      ) VALUES (
        NULLIF(TRIM(r.organization_name), ''),
        NULLIF(TRIM(r.contact_person), ''),
        NULLIF(TRIM(r.email), ''),
        NULLIF(TRIM(r.tier), ''),
        NULLIF(TRIM(r.contribution_type), ''),
        NULLIF(TRIM(r.committed_amount), '')::NUMERIC,
        NULLIF(TRIM(r.received_amount), '')::NUMERIC,
        NULLIF(TRIM(r.description), '')
      )
      ON CONFLICT (organization_name) DO UPDATE SET
        organization_name = EXCLUDED.organization_name,
          contact_person = EXCLUDED.contact_person,
          email = EXCLUDED.email,
          tier = EXCLUDED.tier,
          contribution_type = EXCLUDED.contribution_type,
          committed_amount = EXCLUDED.committed_amount,
          received_amount = EXCLUDED.received_amount,
          description = EXCLUDED.description;

      UPDATE public.staging_sponsors SET status = 'imported', error_message = NULL WHERE id = r.id;
      v_imported_cnt := v_imported_cnt + 1;
    EXCEPTION WHEN OTHERS THEN
      UPDATE public.staging_sponsors SET status = 'rejected', error_message = SQLERRM WHERE id = r.id;
      v_rejected_cnt := v_rejected_cnt + 1;
    END;
  END LOOP;

  RETURN jsonb_build_object('batch_id', p_batch_id, 'imported', v_imported_cnt, 'rejected', v_rejected_cnt);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ------------------------------------------------------------------------------
-- Container: staging_partners
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.staging_partners (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT,
  category TEXT,
  website_url TEXT,
  logo_url TEXT,
  description TEXT,
  is_featured TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'validated', 'rejected', 'imported')),
  error_message TEXT,
  batch_id UUID NOT NULL,
  uploaded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  uploaded_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.staging_partners ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins manage staging_partners" ON public.staging_partners;
CREATE POLICY "Admins manage staging_partners" ON public.staging_partners FOR ALL USING (public.is_admin());

-- Validate staging_partners rows
CREATE OR REPLACE FUNCTION public.validate_partners(p_batch_id UUID)
RETURNS JSONB AS $$
DECLARE
  r RECORD;
  v_err TEXT;
  v_valid_cnt INTEGER := 0;
  v_invalid_cnt INTEGER := 0;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied: Administrator role required.';
  END IF;

  FOR r IN SELECT * FROM public.staging_partners WHERE batch_id = p_batch_id LOOP
    v_err := NULL;
    IF r.name IS NULL OR TRIM(r.name) = '' THEN
      v_err := COALESCE(v_err || '; ', '') || 'Field "name" is required';
    END IF;

    IF v_err IS NOT NULL THEN
      UPDATE public.staging_partners SET status = 'rejected', error_message = v_err WHERE id = r.id;
      v_invalid_cnt := v_invalid_cnt + 1;
    ELSE
      UPDATE public.staging_partners SET status = 'validated', error_message = NULL WHERE id = r.id;
      v_valid_cnt := v_valid_cnt + 1;
    END IF;
  END LOOP;

  RETURN jsonb_build_object('batch_id', p_batch_id, 'validated', v_valid_cnt, 'rejected', v_invalid_cnt);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Import staging_partners rows into public.partners
CREATE OR REPLACE FUNCTION public.import_partners(p_batch_id UUID)
RETURNS JSONB AS $$
DECLARE
  r RECORD;
  v_imported_cnt INTEGER := 0;
  v_rejected_cnt INTEGER := 0;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied: Administrator role required.';
  END IF;

  -- Perform validation pass first
  PERFORM public.validate_partners(p_batch_id);

  FOR r IN SELECT * FROM public.staging_partners WHERE batch_id = p_batch_id AND status = 'validated' LOOP
    BEGIN
      INSERT INTO public.partners (
        name, category, website_url, logo_url, description, is_featured
      ) VALUES (
        NULLIF(TRIM(r.name), ''),
        NULLIF(TRIM(r.category), ''),
        NULLIF(TRIM(r.website_url), ''),
        NULLIF(TRIM(r.logo_url), ''),
        NULLIF(TRIM(r.description), ''),
        COALESCE(LOWER(TRIM(r.is_featured)) = 'true', FALSE)
      )
      ON CONFLICT (name) DO UPDATE SET
        name = EXCLUDED.name,
          category = EXCLUDED.category,
          website_url = EXCLUDED.website_url,
          logo_url = EXCLUDED.logo_url,
          description = EXCLUDED.description,
          is_featured = EXCLUDED.is_featured;

      UPDATE public.staging_partners SET status = 'imported', error_message = NULL WHERE id = r.id;
      v_imported_cnt := v_imported_cnt + 1;
    EXCEPTION WHEN OTHERS THEN
      UPDATE public.staging_partners SET status = 'rejected', error_message = SQLERRM WHERE id = r.id;
      v_rejected_cnt := v_rejected_cnt + 1;
    END;
  END LOOP;

  RETURN jsonb_build_object('batch_id', p_batch_id, 'imported', v_imported_cnt, 'rejected', v_rejected_cnt);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ------------------------------------------------------------------------------
-- Container: staging_chapters
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.staging_chapters (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT,
  province TEXT,
  city TEXT,
  lead_name TEXT,
  contact_email TEXT,
  members_count TEXT,
  schools_mentored_count TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'validated', 'rejected', 'imported')),
  error_message TEXT,
  batch_id UUID NOT NULL,
  uploaded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  uploaded_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.staging_chapters ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins manage staging_chapters" ON public.staging_chapters;
CREATE POLICY "Admins manage staging_chapters" ON public.staging_chapters FOR ALL USING (public.is_admin());

-- Validate staging_chapters rows
CREATE OR REPLACE FUNCTION public.validate_chapters(p_batch_id UUID)
RETURNS JSONB AS $$
DECLARE
  r RECORD;
  v_err TEXT;
  v_valid_cnt INTEGER := 0;
  v_invalid_cnt INTEGER := 0;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied: Administrator role required.';
  END IF;

  FOR r IN SELECT * FROM public.staging_chapters WHERE batch_id = p_batch_id LOOP
    v_err := NULL;
    IF r.name IS NULL OR TRIM(r.name) = '' THEN
      v_err := COALESCE(v_err || '; ', '') || 'Field "name" is required';
    END IF;
    IF r.province IS NULL OR TRIM(r.province) = '' THEN
      v_err := COALESCE(v_err || '; ', '') || 'Field "province" is required';
    END IF;

    IF v_err IS NOT NULL THEN
      UPDATE public.staging_chapters SET status = 'rejected', error_message = v_err WHERE id = r.id;
      v_invalid_cnt := v_invalid_cnt + 1;
    ELSE
      UPDATE public.staging_chapters SET status = 'validated', error_message = NULL WHERE id = r.id;
      v_valid_cnt := v_valid_cnt + 1;
    END IF;
  END LOOP;

  RETURN jsonb_build_object('batch_id', p_batch_id, 'validated', v_valid_cnt, 'rejected', v_invalid_cnt);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Import staging_chapters rows into public.chapters
CREATE OR REPLACE FUNCTION public.import_chapters(p_batch_id UUID)
RETURNS JSONB AS $$
DECLARE
  r RECORD;
  v_imported_cnt INTEGER := 0;
  v_rejected_cnt INTEGER := 0;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied: Administrator role required.';
  END IF;

  -- Perform validation pass first
  PERFORM public.validate_chapters(p_batch_id);

  FOR r IN SELECT * FROM public.staging_chapters WHERE batch_id = p_batch_id AND status = 'validated' LOOP
    BEGIN
      INSERT INTO public.chapters (
        name, province, city, lead_name, contact_email, members_count, schools_mentored_count
      ) VALUES (
        NULLIF(TRIM(r.name), ''),
        NULLIF(TRIM(r.province), ''),
        NULLIF(TRIM(r.city), ''),
        NULLIF(TRIM(r.lead_name), ''),
        NULLIF(TRIM(r.contact_email), ''),
        NULLIF(TRIM(r.members_count), '')::INTEGER,
        NULLIF(TRIM(r.schools_mentored_count), '')::INTEGER
      )
      ON CONFLICT (name) DO UPDATE SET
        name = EXCLUDED.name,
          province = EXCLUDED.province,
          city = EXCLUDED.city,
          lead_name = EXCLUDED.lead_name,
          contact_email = EXCLUDED.contact_email,
          members_count = EXCLUDED.members_count,
          schools_mentored_count = EXCLUDED.schools_mentored_count;

      UPDATE public.staging_chapters SET status = 'imported', error_message = NULL WHERE id = r.id;
      v_imported_cnt := v_imported_cnt + 1;
    EXCEPTION WHEN OTHERS THEN
      UPDATE public.staging_chapters SET status = 'rejected', error_message = SQLERRM WHERE id = r.id;
      v_rejected_cnt := v_rejected_cnt + 1;
    END;
  END LOOP;

  RETURN jsonb_build_object('batch_id', p_batch_id, 'imported', v_imported_cnt, 'rejected', v_rejected_cnt);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ------------------------------------------------------------------------------
-- Container: staging_schools
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.staging_schools (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT,
  province TEXT,
  district TEXT,
  contact_person TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  robotics_club_active TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'validated', 'rejected', 'imported')),
  error_message TEXT,
  batch_id UUID NOT NULL,
  uploaded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  uploaded_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.staging_schools ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins manage staging_schools" ON public.staging_schools;
CREATE POLICY "Admins manage staging_schools" ON public.staging_schools FOR ALL USING (public.is_admin());

-- Validate staging_schools rows
CREATE OR REPLACE FUNCTION public.validate_schools(p_batch_id UUID)
RETURNS JSONB AS $$
DECLARE
  r RECORD;
  v_err TEXT;
  v_valid_cnt INTEGER := 0;
  v_invalid_cnt INTEGER := 0;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied: Administrator role required.';
  END IF;

  FOR r IN SELECT * FROM public.staging_schools WHERE batch_id = p_batch_id LOOP
    v_err := NULL;
    IF r.name IS NULL OR TRIM(r.name) = '' THEN
      v_err := COALESCE(v_err || '; ', '') || 'Field "name" is required';
    END IF;
    IF r.province IS NULL OR TRIM(r.province) = '' THEN
      v_err := COALESCE(v_err || '; ', '') || 'Field "province" is required';
    END IF;

    IF v_err IS NOT NULL THEN
      UPDATE public.staging_schools SET status = 'rejected', error_message = v_err WHERE id = r.id;
      v_invalid_cnt := v_invalid_cnt + 1;
    ELSE
      UPDATE public.staging_schools SET status = 'validated', error_message = NULL WHERE id = r.id;
      v_valid_cnt := v_valid_cnt + 1;
    END IF;
  END LOOP;

  RETURN jsonb_build_object('batch_id', p_batch_id, 'validated', v_valid_cnt, 'rejected', v_invalid_cnt);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Import staging_schools rows into public.schools
CREATE OR REPLACE FUNCTION public.import_schools(p_batch_id UUID)
RETURNS JSONB AS $$
DECLARE
  r RECORD;
  v_imported_cnt INTEGER := 0;
  v_rejected_cnt INTEGER := 0;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied: Administrator role required.';
  END IF;

  -- Perform validation pass first
  PERFORM public.validate_schools(p_batch_id);

  FOR r IN SELECT * FROM public.staging_schools WHERE batch_id = p_batch_id AND status = 'validated' LOOP
    BEGIN
      INSERT INTO public.schools (
        name, province, district, contact_person, contact_email, contact_phone, robotics_club_active
      ) VALUES (
        NULLIF(TRIM(r.name), ''),
        NULLIF(TRIM(r.province), ''),
        NULLIF(TRIM(r.district), ''),
        NULLIF(TRIM(r.contact_person), ''),
        NULLIF(TRIM(r.contact_email), ''),
        NULLIF(TRIM(r.contact_phone), ''),
        COALESCE(LOWER(TRIM(r.robotics_club_active)) = 'true', FALSE)
      )
      ON CONFLICT (name) DO UPDATE SET
        name = EXCLUDED.name,
          province = EXCLUDED.province,
          district = EXCLUDED.district,
          contact_person = EXCLUDED.contact_person,
          contact_email = EXCLUDED.contact_email,
          contact_phone = EXCLUDED.contact_phone,
          robotics_club_active = EXCLUDED.robotics_club_active;

      UPDATE public.staging_schools SET status = 'imported', error_message = NULL WHERE id = r.id;
      v_imported_cnt := v_imported_cnt + 1;
    EXCEPTION WHEN OTHERS THEN
      UPDATE public.staging_schools SET status = 'rejected', error_message = SQLERRM WHERE id = r.id;
      v_rejected_cnt := v_rejected_cnt + 1;
    END;
  END LOOP;

  RETURN jsonb_build_object('batch_id', p_batch_id, 'imported', v_imported_cnt, 'rejected', v_rejected_cnt);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ------------------------------------------------------------------------------
-- Container: staging_events
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.staging_events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT,
  slug TEXT,
  description TEXT,
  category TEXT,
  event_date TEXT,
  end_date TEXT,
  venue TEXT,
  is_virtual TEXT,
  registration_fee_usd TEXT,
  capacity TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'validated', 'rejected', 'imported')),
  error_message TEXT,
  batch_id UUID NOT NULL,
  uploaded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  uploaded_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.staging_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins manage staging_events" ON public.staging_events;
CREATE POLICY "Admins manage staging_events" ON public.staging_events FOR ALL USING (public.is_admin());

-- Validate staging_events rows
CREATE OR REPLACE FUNCTION public.validate_events(p_batch_id UUID)
RETURNS JSONB AS $$
DECLARE
  r RECORD;
  v_err TEXT;
  v_valid_cnt INTEGER := 0;
  v_invalid_cnt INTEGER := 0;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied: Administrator role required.';
  END IF;

  FOR r IN SELECT * FROM public.staging_events WHERE batch_id = p_batch_id LOOP
    v_err := NULL;
    IF r.title IS NULL OR TRIM(r.title) = '' THEN
      v_err := COALESCE(v_err || '; ', '') || 'Field "title" is required';
    END IF;
    IF r.slug IS NULL OR TRIM(r.slug) = '' THEN
      v_err := COALESCE(v_err || '; ', '') || 'Field "slug" is required';
    END IF;
    IF r.event_date IS NULL OR TRIM(r.event_date) = '' THEN
      v_err := COALESCE(v_err || '; ', '') || 'Field "event_date" is required';
    END IF;

    IF v_err IS NOT NULL THEN
      UPDATE public.staging_events SET status = 'rejected', error_message = v_err WHERE id = r.id;
      v_invalid_cnt := v_invalid_cnt + 1;
    ELSE
      UPDATE public.staging_events SET status = 'validated', error_message = NULL WHERE id = r.id;
      v_valid_cnt := v_valid_cnt + 1;
    END IF;
  END LOOP;

  RETURN jsonb_build_object('batch_id', p_batch_id, 'validated', v_valid_cnt, 'rejected', v_invalid_cnt);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Import staging_events rows into public.events
CREATE OR REPLACE FUNCTION public.import_events(p_batch_id UUID)
RETURNS JSONB AS $$
DECLARE
  r RECORD;
  v_imported_cnt INTEGER := 0;
  v_rejected_cnt INTEGER := 0;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied: Administrator role required.';
  END IF;

  -- Perform validation pass first
  PERFORM public.validate_events(p_batch_id);

  FOR r IN SELECT * FROM public.staging_events WHERE batch_id = p_batch_id AND status = 'validated' LOOP
    BEGIN
      INSERT INTO public.events (
        title, slug, description, category, event_date, end_date, venue, is_virtual, registration_fee_usd, capacity
      ) VALUES (
        NULLIF(TRIM(r.title), ''),
        NULLIF(TRIM(r.slug), ''),
        NULLIF(TRIM(r.description), ''),
        NULLIF(TRIM(r.category), ''),
        NULLIF(TRIM(r.event_date), '')::TIMESTAMPTZ,
        NULLIF(TRIM(r.end_date), '')::TIMESTAMPTZ,
        NULLIF(TRIM(r.venue), ''),
        COALESCE(LOWER(TRIM(r.is_virtual)) = 'true', FALSE),
        NULLIF(TRIM(r.registration_fee_usd), '')::NUMERIC,
        NULLIF(TRIM(r.capacity), '')::INTEGER
      )
      ON CONFLICT (slug) DO UPDATE SET
        title = EXCLUDED.title,
          slug = EXCLUDED.slug,
          description = EXCLUDED.description,
          category = EXCLUDED.category,
          event_date = EXCLUDED.event_date,
          end_date = EXCLUDED.end_date,
          venue = EXCLUDED.venue,
          is_virtual = EXCLUDED.is_virtual,
          registration_fee_usd = EXCLUDED.registration_fee_usd,
          capacity = EXCLUDED.capacity;

      UPDATE public.staging_events SET status = 'imported', error_message = NULL WHERE id = r.id;
      v_imported_cnt := v_imported_cnt + 1;
    EXCEPTION WHEN OTHERS THEN
      UPDATE public.staging_events SET status = 'rejected', error_message = SQLERRM WHERE id = r.id;
      v_rejected_cnt := v_rejected_cnt + 1;
    END;
  END LOOP;

  RETURN jsonb_build_object('batch_id', p_batch_id, 'imported', v_imported_cnt, 'rejected', v_rejected_cnt);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ------------------------------------------------------------------------------
-- Container: staging_competitions
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.staging_competitions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT,
  slug TEXT,
  theme TEXT,
  description TEXT,
  status TEXT,
  venue TEXT,
  prize_pool_summary TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'validated', 'rejected', 'imported')),
  error_message TEXT,
  batch_id UUID NOT NULL,
  uploaded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  uploaded_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.staging_competitions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins manage staging_competitions" ON public.staging_competitions;
CREATE POLICY "Admins manage staging_competitions" ON public.staging_competitions FOR ALL USING (public.is_admin());

-- Validate staging_competitions rows
CREATE OR REPLACE FUNCTION public.validate_competitions(p_batch_id UUID)
RETURNS JSONB AS $$
DECLARE
  r RECORD;
  v_err TEXT;
  v_valid_cnt INTEGER := 0;
  v_invalid_cnt INTEGER := 0;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied: Administrator role required.';
  END IF;

  FOR r IN SELECT * FROM public.staging_competitions WHERE batch_id = p_batch_id LOOP
    v_err := NULL;
    IF r.title IS NULL OR TRIM(r.title) = '' THEN
      v_err := COALESCE(v_err || '; ', '') || 'Field "title" is required';
    END IF;
    IF r.slug IS NULL OR TRIM(r.slug) = '' THEN
      v_err := COALESCE(v_err || '; ', '') || 'Field "slug" is required';
    END IF;

    IF v_err IS NOT NULL THEN
      UPDATE public.staging_competitions SET status = 'rejected', error_message = v_err WHERE id = r.id;
      v_invalid_cnt := v_invalid_cnt + 1;
    ELSE
      UPDATE public.staging_competitions SET status = 'validated', error_message = NULL WHERE id = r.id;
      v_valid_cnt := v_valid_cnt + 1;
    END IF;
  END LOOP;

  RETURN jsonb_build_object('batch_id', p_batch_id, 'validated', v_valid_cnt, 'rejected', v_invalid_cnt);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Import staging_competitions rows into public.competitions
CREATE OR REPLACE FUNCTION public.import_competitions(p_batch_id UUID)
RETURNS JSONB AS $$
DECLARE
  r RECORD;
  v_imported_cnt INTEGER := 0;
  v_rejected_cnt INTEGER := 0;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied: Administrator role required.';
  END IF;

  -- Perform validation pass first
  PERFORM public.validate_competitions(p_batch_id);

  FOR r IN SELECT * FROM public.staging_competitions WHERE batch_id = p_batch_id AND status = 'validated' LOOP
    BEGIN
      INSERT INTO public.competitions (
        title, slug, theme, description, status, venue, prize_pool_summary
      ) VALUES (
        NULLIF(TRIM(r.title), ''),
        NULLIF(TRIM(r.slug), ''),
        NULLIF(TRIM(r.theme), ''),
        NULLIF(TRIM(r.description), ''),
        NULLIF(TRIM(r.status), ''),
        NULLIF(TRIM(r.venue), ''),
        NULLIF(TRIM(r.prize_pool_summary), '')
      )
      ON CONFLICT (slug) DO UPDATE SET
        title = EXCLUDED.title,
          slug = EXCLUDED.slug,
          theme = EXCLUDED.theme,
          description = EXCLUDED.description,
          status = EXCLUDED.status,
          venue = EXCLUDED.venue,
          prize_pool_summary = EXCLUDED.prize_pool_summary;

      UPDATE public.staging_competitions SET status = 'imported', error_message = NULL WHERE id = r.id;
      v_imported_cnt := v_imported_cnt + 1;
    EXCEPTION WHEN OTHERS THEN
      UPDATE public.staging_competitions SET status = 'rejected', error_message = SQLERRM WHERE id = r.id;
      v_rejected_cnt := v_rejected_cnt + 1;
    END;
  END LOOP;

  RETURN jsonb_build_object('batch_id', p_batch_id, 'imported', v_imported_cnt, 'rejected', v_rejected_cnt);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ------------------------------------------------------------------------------
-- Container: staging_competition_categories
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.staging_competition_categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  competition_id TEXT,
  name TEXT,
  weight_percentage TEXT,
  description TEXT,
  order_index TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'validated', 'rejected', 'imported')),
  error_message TEXT,
  batch_id UUID NOT NULL,
  uploaded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  uploaded_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.staging_competition_categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins manage staging_competition_categories" ON public.staging_competition_categories;
CREATE POLICY "Admins manage staging_competition_categories" ON public.staging_competition_categories FOR ALL USING (public.is_admin());

-- Validate staging_competition_categories rows
CREATE OR REPLACE FUNCTION public.validate_competition_categories(p_batch_id UUID)
RETURNS JSONB AS $$
DECLARE
  r RECORD;
  v_err TEXT;
  v_valid_cnt INTEGER := 0;
  v_invalid_cnt INTEGER := 0;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied: Administrator role required.';
  END IF;

  FOR r IN SELECT * FROM public.staging_competition_categories WHERE batch_id = p_batch_id LOOP
    v_err := NULL;
    IF r.competition_id IS NULL OR TRIM(r.competition_id) = '' THEN
      v_err := COALESCE(v_err || '; ', '') || 'Field "competition_id" is required';
    END IF;
    IF r.name IS NULL OR TRIM(r.name) = '' THEN
      v_err := COALESCE(v_err || '; ', '') || 'Field "name" is required';
    END IF;

    IF v_err IS NOT NULL THEN
      UPDATE public.staging_competition_categories SET status = 'rejected', error_message = v_err WHERE id = r.id;
      v_invalid_cnt := v_invalid_cnt + 1;
    ELSE
      UPDATE public.staging_competition_categories SET status = 'validated', error_message = NULL WHERE id = r.id;
      v_valid_cnt := v_valid_cnt + 1;
    END IF;
  END LOOP;

  RETURN jsonb_build_object('batch_id', p_batch_id, 'validated', v_valid_cnt, 'rejected', v_invalid_cnt);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Import staging_competition_categories rows into public.competition_categories
CREATE OR REPLACE FUNCTION public.import_competition_categories(p_batch_id UUID)
RETURNS JSONB AS $$
DECLARE
  r RECORD;
  v_imported_cnt INTEGER := 0;
  v_rejected_cnt INTEGER := 0;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied: Administrator role required.';
  END IF;

  -- Perform validation pass first
  PERFORM public.validate_competition_categories(p_batch_id);

  FOR r IN SELECT * FROM public.staging_competition_categories WHERE batch_id = p_batch_id AND status = 'validated' LOOP
    BEGIN
      INSERT INTO public.competition_categories (
        competition_id, name, weight_percentage, description, order_index
      ) VALUES (
        NULLIF(TRIM(r.competition_id), '')::UUID,
        NULLIF(TRIM(r.name), ''),
        NULLIF(TRIM(r.weight_percentage), '')::INTEGER,
        NULLIF(TRIM(r.description), ''),
        NULLIF(TRIM(r.order_index), '')::INTEGER
      )
      ON CONFLICT (competition_id, name) DO UPDATE SET
        competition_id = EXCLUDED.competition_id,
          name = EXCLUDED.name,
          weight_percentage = EXCLUDED.weight_percentage,
          description = EXCLUDED.description,
          order_index = EXCLUDED.order_index;

      UPDATE public.staging_competition_categories SET status = 'imported', error_message = NULL WHERE id = r.id;
      v_imported_cnt := v_imported_cnt + 1;
    EXCEPTION WHEN OTHERS THEN
      UPDATE public.staging_competition_categories SET status = 'rejected', error_message = SQLERRM WHERE id = r.id;
      v_rejected_cnt := v_rejected_cnt + 1;
    END;
  END LOOP;

  RETURN jsonb_build_object('batch_id', p_batch_id, 'imported', v_imported_cnt, 'rejected', v_rejected_cnt);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ------------------------------------------------------------------------------
-- Container: staging_training_programs
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.staging_training_programs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT,
  slug TEXT,
  description TEXT,
  duration_hours TEXT,
  fee_usd TEXT,
  status TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'validated', 'rejected', 'imported')),
  error_message TEXT,
  batch_id UUID NOT NULL,
  uploaded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  uploaded_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.staging_training_programs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins manage staging_training_programs" ON public.staging_training_programs;
CREATE POLICY "Admins manage staging_training_programs" ON public.staging_training_programs FOR ALL USING (public.is_admin());

-- Validate staging_training_programs rows
CREATE OR REPLACE FUNCTION public.validate_training_programs(p_batch_id UUID)
RETURNS JSONB AS $$
DECLARE
  r RECORD;
  v_err TEXT;
  v_valid_cnt INTEGER := 0;
  v_invalid_cnt INTEGER := 0;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied: Administrator role required.';
  END IF;

  FOR r IN SELECT * FROM public.staging_training_programs WHERE batch_id = p_batch_id LOOP
    v_err := NULL;
    IF r.title IS NULL OR TRIM(r.title) = '' THEN
      v_err := COALESCE(v_err || '; ', '') || 'Field "title" is required';
    END IF;
    IF r.slug IS NULL OR TRIM(r.slug) = '' THEN
      v_err := COALESCE(v_err || '; ', '') || 'Field "slug" is required';
    END IF;

    IF v_err IS NOT NULL THEN
      UPDATE public.staging_training_programs SET status = 'rejected', error_message = v_err WHERE id = r.id;
      v_invalid_cnt := v_invalid_cnt + 1;
    ELSE
      UPDATE public.staging_training_programs SET status = 'validated', error_message = NULL WHERE id = r.id;
      v_valid_cnt := v_valid_cnt + 1;
    END IF;
  END LOOP;

  RETURN jsonb_build_object('batch_id', p_batch_id, 'validated', v_valid_cnt, 'rejected', v_invalid_cnt);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Import staging_training_programs rows into public.training_programs
CREATE OR REPLACE FUNCTION public.import_training_programs(p_batch_id UUID)
RETURNS JSONB AS $$
DECLARE
  r RECORD;
  v_imported_cnt INTEGER := 0;
  v_rejected_cnt INTEGER := 0;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied: Administrator role required.';
  END IF;

  -- Perform validation pass first
  PERFORM public.validate_training_programs(p_batch_id);

  FOR r IN SELECT * FROM public.staging_training_programs WHERE batch_id = p_batch_id AND status = 'validated' LOOP
    BEGIN
      INSERT INTO public.training_programs (
        title, slug, description, duration_hours, fee_usd, status
      ) VALUES (
        NULLIF(TRIM(r.title), ''),
        NULLIF(TRIM(r.slug), ''),
        NULLIF(TRIM(r.description), ''),
        NULLIF(TRIM(r.duration_hours), '')::INTEGER,
        NULLIF(TRIM(r.fee_usd), '')::NUMERIC,
        NULLIF(TRIM(r.status), '')
      )
      ON CONFLICT (slug) DO UPDATE SET
        title = EXCLUDED.title,
          slug = EXCLUDED.slug,
          description = EXCLUDED.description,
          duration_hours = EXCLUDED.duration_hours,
          fee_usd = EXCLUDED.fee_usd,
          status = EXCLUDED.status;

      UPDATE public.staging_training_programs SET status = 'imported', error_message = NULL WHERE id = r.id;
      v_imported_cnt := v_imported_cnt + 1;
    EXCEPTION WHEN OTHERS THEN
      UPDATE public.staging_training_programs SET status = 'rejected', error_message = SQLERRM WHERE id = r.id;
      v_rejected_cnt := v_rejected_cnt + 1;
    END;
  END LOOP;

  RETURN jsonb_build_object('batch_id', p_batch_id, 'imported', v_imported_cnt, 'rejected', v_rejected_cnt);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ------------------------------------------------------------------------------
-- Container: staging_brainstorming_quizzes
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.staging_brainstorming_quizzes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT,
  category TEXT,
  difficulty TEXT,
  question TEXT,
  options TEXT,
  correct_index TEXT,
  hint TEXT,
  critical_thinking_principle TEXT,
  explanation TEXT,
  points TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'validated', 'rejected', 'imported')),
  error_message TEXT,
  batch_id UUID NOT NULL,
  uploaded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  uploaded_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.staging_brainstorming_quizzes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins manage staging_brainstorming_quizzes" ON public.staging_brainstorming_quizzes;
CREATE POLICY "Admins manage staging_brainstorming_quizzes" ON public.staging_brainstorming_quizzes FOR ALL USING (public.is_admin());

-- Validate staging_brainstorming_quizzes rows
CREATE OR REPLACE FUNCTION public.validate_brainstorming_quizzes(p_batch_id UUID)
RETURNS JSONB AS $$
DECLARE
  r RECORD;
  v_err TEXT;
  v_valid_cnt INTEGER := 0;
  v_invalid_cnt INTEGER := 0;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied: Administrator role required.';
  END IF;

  FOR r IN SELECT * FROM public.staging_brainstorming_quizzes WHERE batch_id = p_batch_id LOOP
    v_err := NULL;
    IF r.title IS NULL OR TRIM(r.title) = '' THEN
      v_err := COALESCE(v_err || '; ', '') || 'Field "title" is required';
    END IF;
    IF r.question IS NULL OR TRIM(r.question) = '' THEN
      v_err := COALESCE(v_err || '; ', '') || 'Field "question" is required';
    END IF;
    IF r.options IS NULL OR TRIM(r.options) = '' THEN
      v_err := COALESCE(v_err || '; ', '') || 'Field "options" is required';
    END IF;

    IF v_err IS NOT NULL THEN
      UPDATE public.staging_brainstorming_quizzes SET status = 'rejected', error_message = v_err WHERE id = r.id;
      v_invalid_cnt := v_invalid_cnt + 1;
    ELSE
      UPDATE public.staging_brainstorming_quizzes SET status = 'validated', error_message = NULL WHERE id = r.id;
      v_valid_cnt := v_valid_cnt + 1;
    END IF;
  END LOOP;

  RETURN jsonb_build_object('batch_id', p_batch_id, 'validated', v_valid_cnt, 'rejected', v_invalid_cnt);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Import staging_brainstorming_quizzes rows into public.brainstorming_quizzes
CREATE OR REPLACE FUNCTION public.import_brainstorming_quizzes(p_batch_id UUID)
RETURNS JSONB AS $$
DECLARE
  r RECORD;
  v_imported_cnt INTEGER := 0;
  v_rejected_cnt INTEGER := 0;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied: Administrator role required.';
  END IF;

  -- Perform validation pass first
  PERFORM public.validate_brainstorming_quizzes(p_batch_id);

  FOR r IN SELECT * FROM public.staging_brainstorming_quizzes WHERE batch_id = p_batch_id AND status = 'validated' LOOP
    BEGIN
      INSERT INTO public.brainstorming_quizzes (
        title, category, difficulty, question, options, correct_index, hint, critical_thinking_principle, explanation, points
      ) VALUES (
        NULLIF(TRIM(r.title), ''),
        NULLIF(TRIM(r.category), ''),
        NULLIF(TRIM(r.difficulty), ''),
        NULLIF(TRIM(r.question), ''),
        COALESCE(NULLIF(TRIM(r.options), '')::JSONB, '[]'::JSONB),
        NULLIF(TRIM(r.correct_index), '')::INTEGER,
        NULLIF(TRIM(r.hint), ''),
        NULLIF(TRIM(r.critical_thinking_principle), ''),
        NULLIF(TRIM(r.explanation), ''),
        NULLIF(TRIM(r.points), '')::INTEGER
      )
      ON CONFLICT (title) DO UPDATE SET
        title = EXCLUDED.title,
          category = EXCLUDED.category,
          difficulty = EXCLUDED.difficulty,
          question = EXCLUDED.question,
          options = EXCLUDED.options,
          correct_index = EXCLUDED.correct_index,
          hint = EXCLUDED.hint,
          critical_thinking_principle = EXCLUDED.critical_thinking_principle,
          explanation = EXCLUDED.explanation,
          points = EXCLUDED.points;

      UPDATE public.staging_brainstorming_quizzes SET status = 'imported', error_message = NULL WHERE id = r.id;
      v_imported_cnt := v_imported_cnt + 1;
    EXCEPTION WHEN OTHERS THEN
      UPDATE public.staging_brainstorming_quizzes SET status = 'rejected', error_message = SQLERRM WHERE id = r.id;
      v_rejected_cnt := v_rejected_cnt + 1;
    END;
  END LOOP;

  RETURN jsonb_build_object('batch_id', p_batch_id, 'imported', v_imported_cnt, 'rejected', v_rejected_cnt);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

