-- Migration: 2026-04-17 - Combined Storage Bucket RLS Policies
-- Purpose: Add Row-Level Security policies for Supabase `storage.objects`
-- for the app buckets: `materials`, `resources`, `event-banners`, `project-images`.
--
-- IMPORTANT:
-- - Run this as the database *owner* (or via the Supabase Dashboard SQL editor as project owner).
-- - You said `avatars` is already working, so this file excludes avatar-specific policy changes.
-- - The policies assume uploaded object keys use a user prefix like: `auth.uid()/filename.ext`.
-- - If a bucket is PUBLIC, SELECT/read policies are optional — public buckets still return working public URLs.
-- - Always backup your DB before running DDL that alters policies.

-- Enable RLS on storage.objects (idempotent)
ALTER TABLE IF EXISTS storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop old policies (idempotent safe) for these policy names if they exist
DROP POLICY IF EXISTS "materials_select_public" ON storage.objects;
DROP POLICY IF EXISTS "materials_insert_user" ON storage.objects;
DROP POLICY IF EXISTS "materials_update_owner" ON storage.objects;
DROP POLICY IF EXISTS "materials_delete_owner" ON storage.objects;

DROP POLICY IF EXISTS "storage_select_additional_public" ON storage.objects;
DROP POLICY IF EXISTS "storage_insert_user_resources" ON storage.objects;
DROP POLICY IF EXISTS "storage_insert_user_event_banners" ON storage.objects;
DROP POLICY IF EXISTS "storage_insert_user_project_images" ON storage.objects;
DROP POLICY IF EXISTS "storage_update_owner_additional" ON storage.objects;
DROP POLICY IF EXISTS "storage_delete_owner_additional" ON storage.objects;

-- -------------------------------
-- materials bucket policies
-- -------------------------------
-- Optional: allow public SELECT for `materials` (remove if you want materials private)
CREATE POLICY "materials_select_public"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'materials');

-- Allow authenticated users to INSERT into `materials` only if the object
-- name begins with their uid + '/'. Example object name: "<uid>/lecture1.pdf".
CREATE POLICY "materials_insert_user"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'materials'
    AND auth.uid() IS NOT NULL
    AND name LIKE auth.uid() || '/%'
  );

-- Allow owners to UPDATE their own objects in `materials`
CREATE POLICY "materials_update_owner"
  ON storage.objects
  FOR UPDATE
  USING (
    auth.uid() IS NOT NULL
    AND bucket_id = 'materials'
    AND name LIKE auth.uid() || '/%'
  )
  WITH CHECK (true);

-- Allow owners to DELETE their own objects in `materials`
CREATE POLICY "materials_delete_owner"
  ON storage.objects
  FOR DELETE
  USING (
    auth.uid() IS NOT NULL
    AND bucket_id = 'materials'
    AND name LIKE auth.uid() || '/%'
  );

-- -------------------------------
-- resources, event-banners, project-images policies
-- -------------------------------
-- Optional: allow public SELECT for the extra buckets (remove if you want private reads)
CREATE POLICY "storage_select_additional_public"
  ON storage.objects
  FOR SELECT
  USING (bucket_id IN ('resources','event-banners','project-images'));

-- Insert policies: require the object name to be prefixed with uploader uid
CREATE POLICY "storage_insert_user_resources"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'resources'
    AND auth.uid() IS NOT NULL
    AND name LIKE auth.uid() || '/%'
  );

CREATE POLICY "storage_insert_user_event_banners"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'event-banners'
    AND auth.uid() IS NOT NULL
    AND name LIKE auth.uid() || '/%'
  );

CREATE POLICY "storage_insert_user_project_images"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'project-images'
    AND auth.uid() IS NOT NULL
    AND name LIKE auth.uid() || '/%'
  );

-- Generic updates/deletes for owners across these buckets
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

-- -------------------------------
-- Notes & Troubleshooting
-- -------------------------------
-- If you get: ERROR: must be owner of table objects
--   -> Run this script as the database owner (Supabase project owner via SQL editor), not as a restricted user.
-- If client upload fails after applying policies:
--   - Confirm bucket exists and the bucket name matches exactly.
--   - Confirm the client writes object names prefixed with the uploader's uid, e.g. `auth.user().id + '/' + filename`.
--   - If you keep a bucket public, you may omit the SELECT policies above.

-- End of combined migration
