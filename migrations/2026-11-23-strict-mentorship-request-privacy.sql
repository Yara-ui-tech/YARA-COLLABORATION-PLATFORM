-- ==============================================================================
-- 2026-11-23: STRICT MENTORSHIP REQUEST PRIVACY & PERMISSIONS
-- "When someone requests mentorship, the only person to see the request is
-- the target mentor if specified, the requester, and the admin."
-- ==============================================================================

-- 1. Ensure columns exist and index properly
ALTER TABLE public.mentorship_requests ADD COLUMN IF NOT EXISTS mentor_id TEXT;
ALTER TABLE public.mentorship_requests ADD COLUMN IF NOT EXISTS requester_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.mentorship_requests ADD COLUMN IF NOT EXISTS mentor_name TEXT;
ALTER TABLE public.mentorship_requests ADD COLUMN IF NOT EXISTS requester_name TEXT;
ALTER TABLE public.mentorship_requests ADD COLUMN IF NOT EXISTS session_type TEXT;
ALTER TABLE public.mentorship_requests ADD COLUMN IF NOT EXISTS session_date TEXT;
ALTER TABLE public.mentorship_requests ADD COLUMN IF NOT EXISTS session_time_slot TEXT;
ALTER TABLE public.mentorship_requests ADD COLUMN IF NOT EXISTS meeting_link TEXT;

-- 2. Enforce strict Row Level Security (RLS) on mentorship_requests
ALTER TABLE public.mentorship_requests ENABLE ROW LEVEL SECURITY;

-- Drop any legacy overly-permissive or ambiguous policies
DROP POLICY IF EXISTS "Participants view own mentorship requests" ON public.mentorship_requests;
DROP POLICY IF EXISTS "Participants and admins can read mentorship requests" ON public.mentorship_requests;
DROP POLICY IF EXISTS "Mentors and students read requests" ON public.mentorship_requests;
DROP POLICY IF EXISTS "Public and authenticated can insert mentorship requests" ON public.mentorship_requests;
DROP POLICY IF EXISTS "Users create mentorship requests" ON public.mentorship_requests;
DROP POLICY IF EXISTS "Participants and admins can update mentorship requests" ON public.mentorship_requests;
DROP POLICY IF EXISTS "Participants update mentorship requests" ON public.mentorship_requests;

-- INSERT: Authenticated users can create a mentorship request
CREATE POLICY "Users can create mentorship requests" ON public.mentorship_requests
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND (auth.uid() = requester_id OR public.is_admin())
  );

-- SELECT: Only the target mentor (mentor_id), the requester (requester_id), or admin can view
CREATE POLICY "Strict target mentor and admin view mentorship requests" ON public.mentorship_requests
  FOR SELECT USING (
    auth.uid() IS NOT NULL AND (
      auth.uid() = requester_id 
      OR (mentor_id IS NOT NULL AND auth.uid()::text = mentor_id::text)
      OR public.is_admin()
    )
  );

-- UPDATE: Only the target mentor, requester, or admin can update status or meeting link
CREATE POLICY "Strict target mentor and admin update mentorship requests" ON public.mentorship_requests
  FOR UPDATE USING (
    auth.uid() IS NOT NULL AND (
      auth.uid() = requester_id 
      OR (mentor_id IS NOT NULL AND auth.uid()::text = mentor_id::text)
      OR public.is_admin()
    )
  );

-- 3. Enforce strict Row Level Security on mentorship_messages
ALTER TABLE public.mentorship_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Participants and admins read messages" ON public.mentorship_messages;
DROP POLICY IF EXISTS "Participants and admins send messages" ON public.mentorship_messages;
DROP POLICY IF EXISTS "Participants and admins can read mentorship messages" ON public.mentorship_messages;
DROP POLICY IF EXISTS "Participants and admins can insert mentorship messages" ON public.mentorship_messages;

-- SELECT messages: Only target mentor, requester, or admin can read messages in that thread
CREATE POLICY "Strict target mentor and admin view mentorship messages" ON public.mentorship_messages
  FOR SELECT USING (
    auth.uid() IS NOT NULL AND (
      EXISTS (
        SELECT 1 FROM public.mentorship_requests mr
        WHERE mr.id = request_id AND (
          mr.requester_id = auth.uid() 
          OR (mr.mentor_id IS NOT NULL AND mr.mentor_id::text = auth.uid()::text)
        )
      )
      OR public.is_admin()
    )
  );

-- INSERT messages: Only target mentor, requester, or admin can send messages to that thread
CREATE POLICY "Strict target mentor and admin insert mentorship messages" ON public.mentorship_messages
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND (
      EXISTS (
        SELECT 1 FROM public.mentorship_requests mr
        WHERE mr.id = request_id AND (
          mr.requester_id = auth.uid() 
          OR (mr.mentor_id IS NOT NULL AND mr.mentor_id::text = auth.uid()::text)
        )
      )
      OR public.is_admin()
    )
  );

