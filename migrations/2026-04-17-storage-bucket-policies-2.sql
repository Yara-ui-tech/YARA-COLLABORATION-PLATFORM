-- Migration: 2026-04-17 - Additional Storage bucket RLS policies
-- Purpose: Add Row Level Security policies for `storage.objects` to allow
-- authenticated users to manage their own files under the buckets:
--   - resources
--   - event-banners
--   - project-images
--
-- IMPORTANT:
-- - Ensure the buckets (`resources`, `event-banners`, `project-images`) exist
--   in your Supabase Storage dashboard. This migration only manipulates
--   the Postgres `storage.objects` table policies.
-- - Review naming conventions. These policies expect uploads to be stored
--   under a prefix containing the uploader's user id (e.g. `userId/filename`).
-- - If a bucket is public, `getPublicUrl()` will work regardless of these policies.

-- Enable RLS on storage.objects (idempotent)
ALTER TABLE IF EXISTS storage.objects ENABLE ROW LEVEL SECURITY;

-- Remove any previous policies with these names if present
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'storage_select_additional_public') THEN
    EXECUTE 'DROP POLICY IF EXISTS "storage_select_additional_public" ON storage.objects';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'storage_insert_user_resources') THEN
    EXECUTE 'DROP POLICY IF EXISTS "storage_insert_user_resources" ON storage.objects';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'storage_insert_user_event_banners') THEN
    EXECUTE 'DROP POLICY IF EXISTS "storage_insert_user_event_banners" ON storage.objects';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'storage_insert_user_project_images') THEN
    EXECUTE 'DROP POLICY IF EXISTS "storage_insert_user_project_images" ON storage.objects';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'storage_update_owner_additional') THEN
    EXECUTE 'DROP POLICY IF EXISTS "storage_update_owner_additional" ON storage.objects';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'storage_delete_owner_additional') THEN
    EXECUTE 'DROP POLICY IF EXISTS "storage_delete_owner_additional" ON storage.objects';
  END IF;
END$$;

-- Allow public SELECT for these buckets (adjust if you want them private)
CREATE POLICY "storage_select_additional_public"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id IN ('resources', 'event-banners', 'project-images')
  );

-- Allow INSERT into `resources` only when object name starts with the
-- authenticated user's id followed by a slash (e.g. `auth.uid()/file.ext`).
CREATE POLICY "storage_insert_user_resources"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'resources'
    AND auth.uid() IS NOT NULL
    AND name LIKE auth.uid() || '/%'
  );

-- Allow INSERT into `event-banners` only when object name starts with user's id
CREATE POLICY "storage_insert_user_event_banners"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'event-banners'
    AND auth.uid() IS NOT NULL
    AND name LIKE auth.uid() || '/%'
  );

-- Allow INSERT into `project-images` only when object name starts with user's id
CREATE POLICY "storage_insert_user_project_images"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'project-images'
    AND auth.uid() IS NOT NULL
    AND name LIKE auth.uid() || '/%'
  );

-- Allow UPDATE only for owners (object name starting with their uid)
CREATE POLICY "storage_update_owner_additional"
  ON storage.objects
  FOR UPDATE
  USING (
    auth.uid() IS NOT NULL
    AND (
      name LIKE auth.uid() || '/%'
      OR name LIKE auth.uid() || '-%'
      OR name LIKE auth.uid() || '%'
    )
  )
  WITH CHECK (true);

-- Allow DELETE only for owners (object name starting with their uid)
CREATE POLICY "storage_delete_owner_additional"
  ON storage.objects
  FOR DELETE
  USING (
    auth.uid() IS NOT NULL
    AND (
      name LIKE auth.uid() || '/%'
      OR name LIKE auth.uid() || '-%'
      OR name LIKE auth.uid() || '%'
    )
  );

-- End of migration
