# Supabase Setup Guide

## Storage Buckets Configuration

### Create the "avatars" Bucket

1. **Go to Supabase Dashboard**
   - Navigate to Storage in the left sidebar
   - Click "Create a new bucket"

2. **Bucket Name:** `avatars`
3. **Settings:**
   - ✅ Make it Public (toggle on)
   - File size limit: 5MB (recommended)

4. **Row Level Security (RLS) Policies:**

After creating the bucket, click the bucket name and go to the "Policies" tab. Add these policies:

#### Policy 1: Allow Upload (for authenticated users)

```sql
CREATE POLICY "Allow authenticated users to upload avatars" ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars' AND
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );
```

#### Policy 2: Allow Read (for all users)

```sql
CREATE POLICY "Allow public access to avatars" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'avatars');
```

#### Policy 3: Allow Update (for authenticated users)

```sql
CREATE POLICY "Allow users to update their own avatars" ON storage.objects
  FOR UPDATE
  WITH CHECK (
    bucket_id = 'avatars' AND
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );
```

#### Policy 4: Allow Delete (for authenticated users)

```sql
CREATE POLICY "Allow users to delete their own avatars" ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'avatars' AND
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );
```

### Additional Buckets (Optional but Recommended)

For a complete platform, also create:

1. **Bucket: `project-images`**
   - Make it Public
   - For storing project thumbnails/banners

2. **Bucket: `event-banners`**
   - Make it Public
   - For storing event images

3. **Bucket: `resources`**
   - Make it Public
   - For storing resource files/images

## Database Setup

Run the SQL from `database-schema.sql` in your Supabase SQL Editor:

1. Go to Supabase Dashboard
2. Click "SQL Editor" in the left sidebar
3. Click "New Query"
4. Paste the contents of `database-schema.sql`
5. Click "Run"

This will create:

- All necessary tables (profiles, ideas, projects, etc.)
- Custom types (user_role, etc.)
- Row Level Security policies
- Indexes for performance

## Environment Variables

Make sure `.env.local` has:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Get these from Supabase: Project Settings → API → Project URL and anon key

## Troubleshooting Profile Photo Upload

If upload fails:

1. **Check bucket exists:** Go to Supabase → Storage → Should see "avatars" bucket
2. **Check it's public:** Bucket name should show "Public" label
3. **Check RLS policies:** Click bucket → Policies tab → Should see 4 policies listed
4. **Check auth:** Make sure you're logged in before uploading
5. **Check file size:** Upload file should be < 5MB
6. **Check browser console:** Open DevTools → Console tab for error messages

## Quick Fix: Use Backend Upload Endpoint

If storage bucket continues to fail, use the backend upload endpoint instead:

```typescript
// In Profile.tsx handleAvatarUpload
const formDataFile = new FormData();
formDataFile.append("file", file);

const response = await fetch("http://localhost:5000/api/upload/avatar", {
  method: "POST",
  body: formDataFile,
});

const data = await response.json();
if (data.avatar_url) {
  setFormData((prev) => ({ ...prev, avatar_url: data.avatar_url }));
}
```

The backend endpoint handles file processing and returns the public URL.
