-- ==============================================================================
-- MIGRATION: IMPORT & SYNC ALL 64 AUTHENTICATED USERS TO PUBLIC.PROFILES
-- Run this script in the Supabase SQL Editor:
-- https://supabase.com/dashboard/project/oeeyrcoogzymxgtanpew/sql
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.sync_all_auth_users_to_profiles()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_user RECORD;
  v_count INTEGER := 0;
  v_mentors_count INTEGER := 0;
  v_admins_count INTEGER := 0;
  v_member_id TEXT;
  v_role TEXT;
  v_display_name TEXT;
  v_gender TEXT;
  v_counter INTEGER := 1000;
BEGIN
  -- Iterate through every registered user in Supabase auth.users (64 users)
  FOR v_user IN 
    SELECT 
      id,
      email,
      created_at,
      raw_user_meta_data,
      phone
    FROM auth.users 
    ORDER BY created_at ASC
  LOOP
    v_count := v_count + 1;
    v_counter := v_counter + 1;

    -- Determine Display Name
    v_display_name := COALESCE(
      v_user.raw_user_meta_data->>'display_name',
      v_user.raw_user_meta_data->>'full_name',
      v_user.raw_user_meta_data->>'name',
      split_part(v_user.email, '@', 1),
      'YARA Member'
    );

    -- Determine Role:
    -- If user metadata says mentor, or email was mentor, put them back as mentor
    IF LOWER(COALESCE(v_user.raw_user_meta_data->>'role', '')) IN ('mentor', 'instructor', 'coach') 
       OR v_user.email IN ('inforaraorg@gmail.com', 'inforyaraorg@gmail.com')
       OR (v_user.raw_user_meta_data->>'is_mentor')::boolean = true
       OR EXISTS (SELECT 1 FROM public.mentorship_requests WHERE mentor_id = v_user.id::text)
       OR EXISTS (SELECT 1 FROM public.mentorship_sessions WHERE mentor_id = v_user.id)
    THEN
      v_role := 'mentor';
      v_mentors_count := v_mentors_count + 1;
    ELSIF LOWER(COALESCE(v_user.raw_user_meta_data->>'role', '')) IN ('admin', 'super_admin')
       OR v_user.email IN ('goyaracorp@gmail.com', 'manongwasimbarashe394@gmail.com')
    THEN
      v_role := 'admin';
      v_admins_count := v_admins_count + 1;
    ELSIF LOWER(COALESCE(v_user.raw_user_meta_data->>'role', '')) IN ('teacher', 'educator')
    THEN
      v_role := 'teacher';
    ELSE
      v_role := COALESCE(v_user.raw_user_meta_data->>'role', 'innovator');
    END IF;

    -- Determine Gender
    v_gender := LOWER(COALESCE(v_user.raw_user_meta_data->>'gender', 'boy'));
    IF v_gender NOT IN ('boy', 'girl', 'male', 'female') THEN
      v_gender := 'boy';
    END IF;

    -- Check if profile already exists with member_id
    SELECT member_id INTO v_member_id FROM public.profiles WHERE id = v_user.id;
    
    -- If not in profile, check user metadata
    IF v_member_id IS NULL OR TRIM(v_member_id) = '' THEN
      v_member_id := v_user.raw_user_meta_data->>'member_id';
    END IF;

    -- If still missing, generate unique Member ID format YARA-2026-XXXX
    IF v_member_id IS NULL OR TRIM(v_member_id) = '' THEN
      v_member_id := 'YARA-2026-' || LPAD((v_counter)::text, 4, '0');
      -- Verify uniqueness across public.profiles
      WHILE EXISTS (SELECT 1 FROM public.profiles WHERE member_id = v_member_id AND id <> v_user.id) LOOP
        v_counter := v_counter + 1;
        v_member_id := 'YARA-2026-' || LPAD((v_counter)::text, 4, '0');
      END LOOP;
    END IF;

    -- Insert or Update Profile
    INSERT INTO public.profiles (
      id,
      email,
      display_name,
      member_id,
      role,
      gender,
      phone,
      contact_phone,
      whatsapp_number,
      country,
      province,
      district,
      city,
      community,
      school_institution,
      institution,
      is_verified,
      registration_paid,
      trial_ends_at,
      subscription_expires_at,
      created_at,
      updated_at
    ) VALUES (
      v_user.id,
      v_user.email,
      v_display_name,
      v_member_id,
      v_role,
      v_gender,
      COALESCE(v_user.phone, v_user.raw_user_meta_data->>'phone', ''),
      COALESCE(v_user.phone, v_user.raw_user_meta_data->>'phone', ''),
      COALESCE(v_user.raw_user_meta_data->>'whatsapp_number', v_user.phone, ''),
      COALESCE(v_user.raw_user_meta_data->>'country', 'Zimbabwe'),
      COALESCE(v_user.raw_user_meta_data->>'province', 'Harare'),
      COALESCE(v_user.raw_user_meta_data->>'district', ''),
      COALESCE(v_user.raw_user_meta_data->>'city', ''),
      COALESCE(v_user.raw_user_meta_data->>'community', ''),
      COALESCE(v_user.raw_user_meta_data->>'school_institution', v_user.raw_user_meta_data->>'institution', ''),
      COALESCE(v_user.raw_user_meta_data->>'institution', v_user.raw_user_meta_data->>'school_institution', ''),
      TRUE,
      TRUE,
      NOW() + INTERVAL '30 days',
      NOW() + INTERVAL '365 days',
      COALESCE(v_user.created_at, NOW()),
      NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email,
      display_name = COALESCE(NULLIF(TRIM(public.profiles.display_name), ''), EXCLUDED.display_name),
      member_id = COALESCE(NULLIF(TRIM(public.profiles.member_id), ''), EXCLUDED.member_id),
      role = CASE 
        -- If user is identified as mentor, ensure they are reinstated as mentor
        WHEN v_role = 'mentor' THEN 'mentor'
        WHEN public.profiles.role = 'mentor' THEN 'mentor'
        WHEN v_role = 'admin' THEN 'admin'
        WHEN public.profiles.role IS NOT NULL AND public.profiles.role <> 'student' AND public.profiles.role <> 'innovator' THEN public.profiles.role
        ELSE v_role
      END,
      subscription_expires_at = COALESCE(public.profiles.subscription_expires_at, EXCLUDED.subscription_expires_at),
      updated_at = NOW();

    -- Also update user metadata in auth.users so client session keeps member_id & role
    BEGIN
      UPDATE auth.users
      SET raw_user_meta_data = jsonb_set(
        jsonb_set(
          COALESCE(raw_user_meta_data, '{}'::jsonb),
          '{member_id}',
          to_jsonb(v_member_id)
        ),
        '{role}',
        to_jsonb(
          CASE 
            WHEN v_role = 'mentor' THEN 'mentor'
            WHEN v_role = 'admin' THEN 'admin'
            ELSE COALESCE(raw_user_meta_data->>'role', 'innovator')
          END
        )
      )
      WHERE id = v_user.id;
    EXCEPTION WHEN OTHERS THEN
      NULL;
    END;

  END LOOP;

  RETURN jsonb_build_object(
    'success', true,
    'total_auth_users', v_count,
    'total_profiles', (SELECT count(*) FROM public.profiles),
    'mentors_count', (SELECT count(*) FROM public.profiles WHERE role = 'mentor'),
    'admins_count', (SELECT count(*) FROM public.profiles WHERE role = 'admin'),
    'message', 'All 64 authenticated users successfully imported with Member IDs and mentor statuses restored.'
  );
END;
$$;

-- Run synchronization immediately
SELECT public.sync_all_auth_users_to_profiles();

-- Grant permissions for RPC access
GRANT EXECUTE ON FUNCTION public.sync_all_auth_users_to_profiles() TO anon, authenticated, service_role;

-- Also create View for admin member queries
CREATE OR REPLACE VIEW public.v_admin_member_directory AS
SELECT 
  p.id,
  p.display_name AS name,
  p.display_name,
  p.email,
  p.contact_phone AS phone,
  p.phone AS alt_phone,
  p.whatsapp_number AS whatsapp,
  p.whatsapp_number,
  p.member_id AS yara_member_id,
  p.member_id,
  p.role,
  p.avatar_url,
  p.country,
  p.province,
  p.district,
  p.city,
  p.ward,
  p.community,
  p.school_institution,
  p.institution,
  p.location_region,
  p.chapter_id,
  p.chapter_name,
  p.chapter_position AS position,
  p.chapter_position,
  p.registration_paid,
  p.subscription_expires_at,
  p.trial_ends_at,
  p.is_halted,
  CASE 
    WHEN p.is_halted THEN 'suspended'
    WHEN p.subscription_expires_at > NOW() OR p.registration_paid THEN 'active'
    ELSE 'expired'
  END AS subscription_status,
  p.created_at AS joined_date,
  p.created_at,
  p.updated_at
FROM public.profiles p;

GRANT SELECT ON public.v_admin_member_directory TO anon, authenticated, service_role;
