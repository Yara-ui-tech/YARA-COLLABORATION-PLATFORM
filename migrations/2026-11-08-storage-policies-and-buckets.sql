-- ==============================================================================
-- YARA COLLABORATION PLATFORM - STORAGE BUCKETS & RLS POLICIES
-- Date: 2026-11-08
-- Description:
--   Creates all required application storage buckets (shop, courses, materials,
--   videos, flyers, avatars, certificates, resources) with public read access
--   and permissive upload/update/delete policies for authenticated users and admins.
-- ==============================================================================

-- 1. Ensure storage schema and tables exist
CREATE SCHEMA IF NOT EXISTS storage;

-- 2. Create / Upsert all needed storage buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('shop', 'shop', true, 52428800, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']),
  ('courses', 'courses', true, 52428800, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']),
  ('materials', 'materials', true, 104857600, NULL), -- PDFs, docs, schematics up to 100MB
  ('videos', 'videos', true, 524288000, ARRAY['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime']), -- Up to 500MB
  ('flyers', 'flyers', true, 52428800, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf']),
  ('avatars', 'avatars', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('certificates', 'certificates', true, 52428800, ARRAY['image/jpeg', 'image/png', 'application/pdf']),
  ('resources', 'resources', true, 104857600, NULL)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 3. Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 4. Clean up any conflicting legacy storage policies for these buckets
DROP POLICY IF EXISTS "Public Access All Public Buckets" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Upload All Buckets" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Update All Buckets" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Delete All Buckets" ON storage.objects;
DROP POLICY IF EXISTS "Allow All Read for YARA Buckets" ON storage.objects;
DROP POLICY IF EXISTS "Allow All Insert for YARA Buckets" ON storage.objects;
DROP POLICY IF EXISTS "Allow All Update for YARA Buckets" ON storage.objects;
DROP POLICY IF EXISTS "Allow All Delete for YARA Buckets" ON storage.objects;
DROP POLICY IF EXISTS "yara_public_select" ON storage.objects;
DROP POLICY IF EXISTS "yara_auth_insert" ON storage.objects;
DROP POLICY IF EXISTS "yara_auth_update" ON storage.objects;
DROP POLICY IF EXISTS "yara_auth_delete" ON storage.objects;
DROP POLICY IF EXISTS "yara_anon_insert_allowed" ON storage.objects;

-- 5. Public Read Access: Anyone can view assets in YARA public buckets
CREATE POLICY "yara_public_select"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id IN ('shop', 'courses', 'materials', 'videos', 'flyers', 'avatars', 'certificates', 'resources')
  );

-- 6. Insert Access: Authenticated users & admins upload
CREATE POLICY "yara_auth_insert"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id IN ('shop', 'courses', 'materials', 'videos', 'flyers', 'avatars', 'certificates', 'resources')
  );

-- 7. Update Access: Restricted to owners or administrators
CREATE POLICY "yara_auth_update"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id IN ('shop', 'courses', 'materials', 'videos', 'flyers', 'avatars', 'certificates', 'resources')
    AND (owner = auth.uid() OR public.is_admin())
  )
  WITH CHECK (
    bucket_id IN ('shop', 'courses', 'materials', 'videos', 'flyers', 'avatars', 'certificates', 'resources')
    AND (owner = auth.uid() OR public.is_admin())
  );

-- 8. Delete Access: Restricted to owners or administrators
CREATE POLICY "yara_auth_delete"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id IN ('shop', 'courses', 'materials', 'videos', 'flyers', 'avatars', 'certificates', 'resources')
    AND (owner = auth.uid() OR public.is_admin())
  );

-- Output confirmation
DO $$
BEGIN
  RAISE NOTICE 'YARA Storage Buckets and RLS policies configured successfully!';
END $$;

