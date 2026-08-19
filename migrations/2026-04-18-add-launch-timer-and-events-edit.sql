-- Migration: Add launch settings and ensure event/competition edit permissions
INSERT INTO public.system_settings (key, value)
VALUES 
  ('launch_time', '{"duration_hours": 72, "launch_date": "2026-04-20T12:00:00.000Z", "title": "Official YARIA Global Launch", "is_enabled": true, "banner_text": "Countdown to the Official YARIA Platform Launch — 72 Hours to Global Innovation!"}')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- Ensure RLS policies for events and competitions allow admin UPDATE and INSERT
DROP POLICY IF EXISTS "Admins can manage events." ON public.events;
CREATE POLICY "Admins can manage events."
ON public.events FOR ALL
USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
)
WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

DROP POLICY IF EXISTS "Admins can manage competitions." ON public.competitions;
CREATE POLICY "Admins can manage competitions."
ON public.competitions FOR ALL
USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
)
WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
