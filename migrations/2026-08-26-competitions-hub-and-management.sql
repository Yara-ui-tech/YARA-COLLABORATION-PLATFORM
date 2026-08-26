-- =========================================================================
-- MIGRATION: 2026-08-26-competitions-hub-and-management.sql
-- DESCRIPTION: Enhanced Competitions Hub schema, admin management, and seeds
-- =========================================================================

-- 1. Create or enhance the public.competitions table
CREATE TABLE IF NOT EXISTS public.competitions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  slug TEXT UNIQUE,
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT NOT NULL,
  category TEXT DEFAULT 'flagship_robotics',
  format TEXT CHECK (format IN ('in_person', 'virtual', 'hybrid')) DEFAULT 'hybrid',
  status TEXT CHECK (status IN ('upcoming', 'active', 'completed', 'archived')) DEFAULT 'upcoming',
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  registration_deadline TIMESTAMPTZ,
  location TEXT DEFAULT 'Harare, Zimbabwe',
  image_url TEXT,
  banner_url TEXT,
  registration_link TEXT,
  internal_route TEXT,
  prize_pool TEXT DEFAULT '$10,000 + Tech Grants',
  entry_fee DECIMAL(10,2) DEFAULT 0.00,
  currency TEXT DEFAULT 'USD',
  max_teams INTEGER DEFAULT 50,
  registered_teams_count INTEGER DEFAULT 0,
  eligibility TEXT DEFAULT 'Open to High Schools, Universities, and Youth Clubs (2 Boys + 2 Girls per team)',
  rules_summary TEXT,
  is_featured BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add any missing columns if table already existed
ALTER TABLE public.competitions ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE public.competitions ADD COLUMN IF NOT EXISTS subtitle TEXT;
ALTER TABLE public.competitions ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'flagship_robotics';
ALTER TABLE public.competitions ADD COLUMN IF NOT EXISTS format TEXT DEFAULT 'hybrid';
ALTER TABLE public.competitions ADD COLUMN IF NOT EXISTS registration_deadline TIMESTAMPTZ;
ALTER TABLE public.competitions ADD COLUMN IF NOT EXISTS location TEXT DEFAULT 'Harare, Zimbabwe';
ALTER TABLE public.competitions ADD COLUMN IF NOT EXISTS banner_url TEXT;
ALTER TABLE public.competitions ADD COLUMN IF NOT EXISTS internal_route TEXT;
ALTER TABLE public.competitions ADD COLUMN IF NOT EXISTS prize_pool TEXT DEFAULT '$10,000 + Tech Grants';
ALTER TABLE public.competitions ADD COLUMN IF NOT EXISTS entry_fee DECIMAL(10,2) DEFAULT 0.00;
ALTER TABLE public.competitions ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'USD';
ALTER TABLE public.competitions ADD COLUMN IF NOT EXISTS max_teams INTEGER DEFAULT 50;
ALTER TABLE public.competitions ADD COLUMN IF NOT EXISTS registered_teams_count INTEGER DEFAULT 0;
ALTER TABLE public.competitions ADD COLUMN IF NOT EXISTS eligibility TEXT;
ALTER TABLE public.competitions ADD COLUMN IF NOT EXISTS rules_summary TEXT;
ALTER TABLE public.competitions ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;
ALTER TABLE public.competitions ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;
ALTER TABLE public.competitions ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- Create index on slug and status
CREATE INDEX IF NOT EXISTS idx_competitions_slug ON public.competitions(slug);
CREATE INDEX IF NOT EXISTS idx_competitions_status ON public.competitions(status);
CREATE INDEX IF NOT EXISTS idx_competitions_is_featured ON public.competitions(is_featured);

-- Enable RLS
ALTER TABLE public.competitions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Competitions are viewable by everyone." ON public.competitions;
CREATE POLICY "Competitions are viewable by everyone."
  ON public.competitions FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can manage competitions." ON public.competitions;
CREATE POLICY "Admins can manage competitions."
  ON public.competitions FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_competitions_updated_at ON public.competitions;
CREATE TRIGGER update_competitions_updated_at
  BEFORE UPDATE ON public.competitions
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

-- Seed Core Competitions
INSERT INTO public.competitions (
  slug,
  title,
  subtitle,
  description,
  category,
  format,
  status,
  start_date,
  end_date,
  registration_deadline,
  location,
  image_url,
  internal_route,
  registration_link,
  prize_pool,
  entry_fee,
  max_teams,
  registered_teams_count,
  eligibility,
  rules_summary,
  is_featured,
  display_order,
  tags
) VALUES 
(
  'yara-2026-flagship',
  'YARA Educational Robotics Competition 2026',
  'Engineering Opportunity: Robotics & Autonomous Innovation for Underserved Youth',
  'The premier continental championship bringing together top young minds across Zimbabwe and Africa. Features Underwater Drone Submersible Navigation (35%), Autonomous Maze Solving (35%), and Community Innovation Pitches (30%). Teams must strictly comprise at least 4 members with a balanced 2 Boys + 2 Girls ratio.',
  'flagship_robotics',
  'hybrid',
  'upcoming',
  '2026-10-16T08:00:00.000Z',
  '2026-10-18T18:00:00.000Z',
  '2026-09-30T23:59:59.000Z',
  'YARA National Science Arena & Innovation Pool, Harare',
  'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=80',
  '/competitions/yara-2026',
  '/competition/participant',
  '$15,000 Prize Pool & University Scholarships',
  0.00,
  64,
  12,
  'Open to Primary, High School, Tertiary & Community Youth Teams (2B+2G ratio mandatory)',
  'Complete 3 core challenges: Aquatic ROV buoyancy & payload recovery, LiDAR/Ultrasonic maze solving, and Sustainable STEM community solution pitch.',
  true,
  1,
  ARRAY['Underwater ROV', 'Autonomous Navigation', 'Innovation Pitch', 'Flagship']
),
(
  'yara-underwater-drone-challenge',
  'YARA Aquatic ROV & Submersible Navigation Open',
  'Underwater Marine Engineering, Hydrodynamics & Sub-surface Telemetry',
  'Specialized robotics cup dedicated to underwater drone exploration, waterproof electronics, buoyancy physics, thruster telemetry, and ecological water sampling.',
  'underwater_rov',
  'in_person',
  'upcoming',
  '2026-11-06T09:00:00.000Z',
  '2026-11-07T17:00:00.000Z',
  '2026-10-25T23:59:59.000Z',
  'Lake Chivero Aquatic Science Centre, Zimbabwe',
  'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1200&q=80',
  '/competitions/yara-2026',
  '/competition/participant',
  '$5,000 + Marine Tech Kits',
  0.00,
  32,
  8,
  'High school & tertiary robotics teams with waterproof ROV prototypes',
  'Submersible must navigate underwater obstacle course and retrieve simulated environmental sensors from 3m depth.',
  true,
  2,
  ARRAY['Aquatic Drone', 'Waterproofing', 'ESP32', 'Marine Tech']
),
(
  'yara-high-school-maze-derby',
  'National High School Autonomous Maze Derby 2026',
  'Precision Micromouse, Wall Following & Speed Labyrinth Solving',
  'High-speed autonomous navigation derby where student-designed rovers must navigate complex blind mazes using ultrasonic, infrared, or LiDAR algorithms without manual tele-operation.',
  'autonomous_vehicles',
  'in_person',
  'upcoming',
  '2026-09-25T08:30:00.000Z',
  '2026-09-26T16:30:00.000Z',
  '2026-09-15T23:59:59.000Z',
  'National University of Science & Technology (NUST), Bulawayo',
  'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?auto=format&fit=crop&w=1200&q=80',
  '/competitions/yara-2026',
  '/competition/participant',
  '$3,500 STEM Laboratory Equipment Grant',
  0.00,
  40,
  14,
  'All registered High School Robotics Chapters across all 10 provinces',
  'Rovers must be fully autonomous. Max dimensions 25x25cm. Fastest time through the labyrinth wins.',
  false,
  3,
  ARRAY['Micromouse', 'PID Control', 'High School', 'Algorithms']
),
(
  'yara-smart-agri-hackathon',
  'Zimbabwe Smart Agro-Robotics & Drone Hackathon',
  'Autonomous Agriculture: Soil Sensors, Weed Detection & Crop Spraying Drones',
  'Hackathon and prototype challenge focused on addressing food security, precision irrigation, automated crop monitoring, and pest defense through accessible agricultural robotics.',
  'hackathon',
  'hybrid',
  'upcoming',
  '2026-11-20T08:00:00.000Z',
  '2026-11-22T18:00:00.000Z',
  '2026-11-10T23:59:59.000Z',
  'Chinhoyi University of Technology (CUT) Innovation Hub',
  'https://images.unsplash.com/photo-1586771107445-d3ca888129ff?auto=format&fit=crop&w=1200&q=80',
  '/competitions/yara-2026',
  '/competition/participant',
  '$7,500 AgTech Commercialization Seed Fund',
  0.00,
  30,
  6,
  'Open to student developers, agronomists, and robotics chapter innovators',
  'Functional hardware/software prototype deployed in real field conditions or simulation.',
  false,
  4,
  ARRAY['Agro-Tech', 'Drones', 'IoT', 'Food Security']
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  subtitle = EXCLUDED.subtitle,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  format = EXCLUDED.format,
  status = EXCLUDED.status,
  start_date = EXCLUDED.start_date,
  end_date = EXCLUDED.end_date,
  registration_deadline = EXCLUDED.registration_deadline,
  location = EXCLUDED.location,
  image_url = EXCLUDED.image_url,
  internal_route = EXCLUDED.internal_route,
  registration_link = EXCLUDED.registration_link,
  prize_pool = EXCLUDED.prize_pool,
  eligibility = EXCLUDED.eligibility,
  rules_summary = EXCLUDED.rules_summary,
  is_featured = EXCLUDED.is_featured,
  display_order = EXCLUDED.display_order,
  tags = EXCLUDED.tags,
  updated_at = now();
