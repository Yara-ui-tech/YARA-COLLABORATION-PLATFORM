-- ==============================================================================
-- 00_cleanup_mock_data.sql
-- YARA Pan-African Platform - Master Cleanup Migration
-- Purpose: Safely delete all legacy mock, demo, and test data from live database
--          and relax legacy NOT NULL constraints that block new operations.
-- Safe & Idempotent: Does NOT drop tables or touch genuine user registrations.
-- ==============================================================================

BEGIN;

DO $$
DECLARE
  v_del_impact INTEGER := 0;
  v_del_chapters INTEGER := 0;
  v_del_sponsors INTEGER := 0;
  v_del_quizzes INTEGER := 0;
  v_del_testimonials INTEGER := 0;
  v_del_auditors INTEGER := 0;
  v_del_dup_courses INTEGER := 0;
  v_cleaned_modules INTEGER := 0;
BEGIN
  RAISE NOTICE '>>> Starting YARA Mock Data Cleanup...';

  -- 1. Relax legacy NOT NULL constraint on impact_ledger.reference_id (Fixes ERROR 23502)
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'impact_ledger' 
      AND column_name = 'reference_id'
      AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE public.impact_ledger ALTER COLUMN reference_id DROP NOT NULL;
    RAISE NOTICE 'Relaxed NOT NULL on public.impact_ledger.reference_id';
  END IF;

  -- Relax legacy NOT NULL constraints on other potential legacy columns in impact_ledger
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'impact_ledger' AND column_name = 'payer_name' AND is_nullable = 'NO') THEN
    ALTER TABLE public.impact_ledger ALTER COLUMN payer_name DROP NOT NULL;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'impact_ledger' AND column_name = 'payer_email' AND is_nullable = 'NO') THEN
    ALTER TABLE public.impact_ledger ALTER COLUMN payer_email DROP NOT NULL;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'impact_ledger' AND column_name = 'title' AND is_nullable = 'NO') THEN
    ALTER TABLE public.impact_ledger ALTER COLUMN title DROP NOT NULL;
  END IF;

  -- 2. Remove Mock Impact Ledger Metrics
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'impact_ledger') THEN
    DELETE FROM public.impact_ledger
    WHERE (
      metric_key IN (
        'learners_reached_mashwest',
        'teachers_upskilled',
        'secondary_schools_equipped',
        'girls_in_robotics_percentage'
      )
      OR metric_key LIKE 'demo_%'
      OR metric_title ILIKE '%placeholder%'
      OR metric_title ILIKE '%mock%'
      OR verification_source ILIKE '%Verification Report Oct 2025%'
    );
    GET DIAGNOSTICS v_del_impact = ROW_COUNT;
    RAISE NOTICE 'Removed % mock rows from public.impact_ledger', v_del_impact;
  END IF;

  -- 3. Remove Mock Chapters
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'chapters') THEN
    DELETE FROM public.chapters
    WHERE (
      name IN ('Mashonaland West Provincial Chapter')
      OR name ILIKE '%demo%'
      OR name ILIKE '%placeholder%'
      OR contact_email IN ('goyaracorp@gmail.com')
    );
    GET DIAGNOSTICS v_del_chapters = ROW_COUNT;
    RAISE NOTICE 'Removed % mock rows from public.chapters', v_del_chapters;
  END IF;

  -- 4. Remove Mock Sponsors
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'sponsors') THEN
    DELETE FROM public.sponsors
    WHERE (
      id IN ('sp_stem_advance_2026', 'sp_iot_hardware_labs')
      OR organization_name IN (
        'African STEM Advancement Foundation',
        'Apex Microelectronics & Robotics Lab'
      )
      OR organization_name ILIKE '%demo%'
      OR organization_name ILIKE '%mock%'
      OR email IN ('partnerships@stemafrica.org', 'labs@apexmicro.co.zw')
    );
    GET DIAGNOSTICS v_del_sponsors = ROW_COUNT;
    RAISE NOTICE 'Removed % mock rows from public.sponsors', v_del_sponsors;
  END IF;

  -- 5. Remove Mock Brainstorming Quizzes
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'brainstorming_quizzes') THEN
    DELETE FROM public.brainstorming_quizzes
    WHERE (
      title IN (
        'Circuit Voltage Division Under Load',
        'Sensor Noise & Non-Blocking Ultrasonic Ranging'
      )
      OR image_url ILIKE '%unsplash.com%'
    );
    GET DIAGNOSTICS v_del_quizzes = ROW_COUNT;
    RAISE NOTICE 'Removed % mock rows from public.brainstorming_quizzes', v_del_quizzes;
  END IF;

  -- 6. Remove Mock Testimonials
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'testimonials') THEN
    DELETE FROM public.testimonials
    WHERE (
      author_name IN ('Farai Chitepo', 'Ruvimbo Masawi', 'Eng. Kudakwashe Moyo')
      OR author_name ILIKE '%demo%'
      OR author_name ILIKE '%placeholder%'
    );
    GET DIAGNOSTICS v_del_testimonials = ROW_COUNT;
    RAISE NOTICE 'Removed % mock rows from public.testimonials', v_del_testimonials;
  END IF;

  -- 7. Remove Mock Executive Auditors
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'executive_auditors') THEN
    DELETE FROM public.executive_auditors
    WHERE (
      id IN ('exec_1', 'exec_2')
      OR email IN ('goyaracorp@gmail.com', 'director@yara.org')
      OR authorized_by = 'Board Resolution 2026/01'
    );
    GET DIAGNOSTICS v_del_auditors = ROW_COUNT;
    RAISE NOTICE 'Removed % mock rows from public.executive_auditors', v_del_auditors;
  END IF;

  -- 8. Remove Duplicate Courses Seeded under Non-Canonical Slugs
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'courses') THEN
    DELETE FROM public.courses
    WHERE slug IN (
      'robotics-beginner',
      'robotics-intermediate',
      'robotics-advanced'
    );
    GET DIAGNOSTICS v_del_dup_courses = ROW_COUNT;
    RAISE NOTICE 'Removed % duplicate course rows from public.courses', v_del_dup_courses;
  END IF;

  -- 9. Neutralize Placeholder URLs in Course Modules while preserving curriculum text
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'course_modules') THEN
    UPDATE public.course_modules
    SET 
      video_url = NULL,
      guided_lab_simulation_url = NULL
    WHERE (
      video_url ILIKE '%youtube.com%' 
      OR video_url ILIKE '%example.com%'
      OR guided_lab_simulation_url ILIKE '%wokwi.com%'
      OR guided_lab_simulation_url ILIKE '%example.com%'
    );
    GET DIAGNOSTICS v_cleaned_modules = ROW_COUNT;
    RAISE NOTICE 'Cleared placeholder video/simulation URLs on % modules', v_cleaned_modules;
  END IF;

  RAISE NOTICE '>>> Cleanup Complete: Database is purged of mock and test records.';
END $$;

COMMIT;
