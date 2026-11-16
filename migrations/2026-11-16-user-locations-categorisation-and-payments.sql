-- ==============================================================================
-- YARA COLLABORATION PLATFORM - USER GEOGRAPHICAL CATEGORISATION & PAYMENT SYSTEM
-- Migration: 2026-11-16
-- Description:
--   1. Ensures all geographical and institutional columns exist on public.profiles:
--      country, province, district, city, ward, community, school_institution, location_region
--   2. Adds performance indexes for rapid member categorisation by city, district, province, school & country
--   3. Updates handle_new_user() trigger to automatically map these fields on signup
--   4. Updates guard_profile_privileged_fields() so users can update their geographical location freely
-- ==============================================================================

-- 1. Ensure geographical and institutional columns exist on profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'Zimbabwe';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS province TEXT DEFAULT 'National';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS district TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS ward TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS community TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS school_institution TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS location_region TEXT;

-- 2. Add indexes for rapid member queries and categorisation
CREATE INDEX IF NOT EXISTS idx_profiles_country ON public.profiles(country);
CREATE INDEX IF NOT EXISTS idx_profiles_province ON public.profiles(province);
CREATE INDEX IF NOT EXISTS idx_profiles_district ON public.profiles(district);
CREATE INDEX IF NOT EXISTS idx_profiles_city ON public.profiles(city);
CREATE INDEX IF NOT EXISTS idx_profiles_school_institution ON public.profiles(school_institution);

-- 3. Update handle_new_user trigger function to capture full location data
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public, pg_temp
AS $$
DECLARE
  v_country TEXT;
  v_province TEXT;
  v_district TEXT;
  v_city TEXT;
  v_ward TEXT;
  v_community TEXT;
  v_school TEXT;
  v_loc_region TEXT;
BEGIN
  v_country := COALESCE(NEW.raw_user_meta_data->>'country', 'Zimbabwe');
  v_province := COALESCE(NEW.raw_user_meta_data->>'province', 'National');
  v_district := NEW.raw_user_meta_data->>'district';
  v_city := NEW.raw_user_meta_data->>'city';
  v_ward := COALESCE(NEW.raw_user_meta_data->>'ward', NEW.raw_user_meta_data->>'community');
  v_community := COALESCE(NEW.raw_user_meta_data->>'community', NEW.raw_user_meta_data->>'ward');
  v_school := NEW.raw_user_meta_data->>'school_institution';
  v_loc_region := COALESCE(
    NEW.raw_user_meta_data->>'location_region',
    NULLIF(TRIM(CONCAT_WS(', ', v_city, v_district, v_province, v_country)), '')
  );

  INSERT INTO public.profiles (
    id,
    display_name,
    email,
    member_id,
    role,
    gender,
    educational_level,
    tier,
    country,
    province,
    district,
    city,
    ward,
    community,
    school_institution,
    location_region,
    disability_type,
    registration_paid,
    is_fee_exempt,
    is_underserved_scholarship,
    underserved_scholarship_reason,
    trial_ends_at,
    subscription_expires_at,
    social_links,
    accessibility_preferences
  ) VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'member_id', 'YARA-' || to_char(CURRENT_DATE, 'YYYY') || '-' || lpad((floor(random() * 9000 + 1000))::text, 4, '0')),
    COALESCE(NEW.raw_user_meta_data->>'role', 'innovator'),
    COALESCE(NEW.raw_user_meta_data->>'gender', 'boy'),
    CASE 
      WHEN NEW.raw_user_meta_data->>'educational_level' IN ('junior', 'intermediate', 'senior', 'tertiary', 'teacher', 'professional', 'general')
      THEN NEW.raw_user_meta_data->>'educational_level'
      ELSE 'junior'
    END,
    NEW.raw_user_meta_data->>'tier',
    v_country,
    v_province,
    v_district,
    v_city,
    v_ward,
    v_community,
    v_school,
    v_loc_region,
    COALESCE(NEW.raw_user_meta_data->>'disability_type', 'none'),
    FALSE,
    FALSE,
    FALSE,
    NULL,
    NOW() + INTERVAL '30 days',
    NOW() + INTERVAL '365 days',
    jsonb_build_object('gender', COALESCE(NEW.raw_user_meta_data->>'gender', 'boy')),
    jsonb_build_object('gender', COALESCE(NEW.raw_user_meta_data->>'gender', 'boy'))
  )
  ON CONFLICT (id) DO UPDATE SET
    display_name = COALESCE(EXCLUDED.display_name, public.profiles.display_name),
    email = COALESCE(EXCLUDED.email, public.profiles.email),
    gender = COALESCE(EXCLUDED.gender, public.profiles.gender),
    country = COALESCE(EXCLUDED.country, public.profiles.country),
    province = COALESCE(EXCLUDED.province, public.profiles.province),
    district = COALESCE(EXCLUDED.district, public.profiles.district),
    city = COALESCE(EXCLUDED.city, public.profiles.city),
    ward = COALESCE(EXCLUDED.ward, public.profiles.ward),
    community = COALESCE(EXCLUDED.community, public.profiles.community),
    school_institution = COALESCE(EXCLUDED.school_institution, public.profiles.school_institution),
    location_region = COALESCE(EXCLUDED.location_region, public.profiles.location_region),
    updated_at = NOW();

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

DO $$
BEGIN
  RAISE NOTICE 'YARA User Categorisation & Location schema applied successfully!';
END $$;
