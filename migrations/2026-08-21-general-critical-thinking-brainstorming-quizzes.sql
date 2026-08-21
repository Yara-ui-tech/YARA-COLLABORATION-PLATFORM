-- =========================================================================
-- MIGRATION: General Critical Thinking & Brainstorming Image Quizzes
-- Date: 2026-08-21
-- Purpose: Schema, RLS policies, and seed data for general visual critical
--          thinking image quizzes, pattern logic, and learner attempts.
-- =========================================================================

-- 1. Create or update the brainstorming_quizzes table
CREATE TABLE IF NOT EXISTS public.brainstorming_quizzes (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL, -- 'cause_and_effect', 'pattern_recognition', 'spatial_reasoning', 'logic_deduction', 'lateral_thinking', 'everyday_physics'
  difficulty TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'advanced', 'easy', 'medium', 'hard')) DEFAULT 'beginner',
  image_url TEXT NOT NULL,
  question TEXT NOT NULL,
  options JSONB NOT NULL,
  "correctIndex" INTEGER NOT NULL DEFAULT 0,
  correct_index INTEGER DEFAULT 0,
  hint TEXT,
  critical_thinking_principle TEXT,
  explanation TEXT NOT NULL,
  points INTEGER DEFAULT 100,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Ensure correctIndex and correct_index stay in sync if one is updated
CREATE OR REPLACE FUNCTION sync_brainstorming_quiz_indices()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW."correctIndex" IS NOT NULL AND NEW.correct_index IS NULL THEN
    NEW.correct_index := NEW."correctIndex";
  ELSIF NEW.correct_index IS NOT NULL AND NEW."correctIndex" IS NULL THEN
    NEW."correctIndex" := NEW.correct_index;
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_brainstorming_quiz_indices ON public.brainstorming_quizzes;
CREATE TRIGGER trg_sync_brainstorming_quiz_indices
BEFORE INSERT OR UPDATE ON public.brainstorming_quizzes
FOR EACH ROW EXECUTE FUNCTION sync_brainstorming_quiz_indices();

-- Enable Row Level Security
ALTER TABLE public.brainstorming_quizzes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for brainstorming_quizzes
DROP POLICY IF EXISTS "Public can view brainstorming quizzes" ON public.brainstorming_quizzes;
CREATE POLICY "Public can view brainstorming quizzes"
  ON public.brainstorming_quizzes FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can manage brainstorming quizzes" ON public.brainstorming_quizzes;
CREATE POLICY "Admins can manage brainstorming quizzes"
  ON public.brainstorming_quizzes FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- 2. Brainstorming Quiz Learner Attempts & Streak Logs
CREATE TABLE IF NOT EXISTS public.brainstorming_attempts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  user_name TEXT,
  score INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  streak INTEGER DEFAULT 0,
  category TEXT,
  time_spent_seconds INTEGER,
  answers JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS for brainstorming_attempts
ALTER TABLE public.brainstorming_attempts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone authenticated can insert quiz attempts" ON public.brainstorming_attempts;
CREATE POLICY "Anyone authenticated can insert quiz attempts"
  ON public.brainstorming_attempts FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Users view own attempts or admins view all" ON public.brainstorming_attempts;
CREATE POLICY "Users view own attempts or admins view all"
  ON public.brainstorming_attempts FOR SELECT
  USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "Admins can manage brainstorming attempts" ON public.brainstorming_attempts;
CREATE POLICY "Admins can manage brainstorming attempts"
  ON public.brainstorming_attempts FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- 3. Seed the 10 General Critical Thinking Visual Image Quizzes
INSERT INTO public.brainstorming_quizzes (
  id,
  title,
  category,
  difficulty,
  image_url,
  question,
  options,
  "correctIndex",
  correct_index,
  hint,
  critical_thinking_principle,
  explanation,
  points
) VALUES
(
  'bq_01',
  'The Interlocking Gear Train Rotation',
  'cause_and_effect',
  'beginner',
  'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=800&q=80',
  'Consider a linear row of 5 interlocking gears touching in a sequence (Gear 1 meshes with Gear 2, Gear 2 with 3, and so on up to Gear 5). If Gear 1 is turned CLOCKWISE, in which direction will Gear 5 rotate?',
  '["Clockwise (Same direction as Gear 1)", "Counter-Clockwise (Opposite direction to Gear 1)", "It will remain stationary due to mechanical locking", "It will oscillate back and forth depending on gear teeth count"]'::jsonb,
  0,
  0,
  'Every time two gears mesh, the rotation direction inverses (Clockwise ⇄ Counter-Clockwise). Count the odd/even position of Gear 5.',
  'Parity & Alternation of States in Linked Systems',
  'In a single chain of meshed gears: Gear 1 = Clockwise (CW), Gear 2 = Counter-Clockwise (CCW), Gear 3 = CW, Gear 4 = CCW, and Gear 5 = CW. All odd-numbered gears in a single line rotate in the exact same direction regardless of their diameter or tooth count.',
  100
),
(
  'bq_02',
  'The Connected Water Tanks & Valves',
  'everyday_physics',
  'beginner',
  'https://images.unsplash.com/photo-1584905066893-7d5c142ba4e1?auto=format&fit=crop&w=800&q=80',
  'Water is steadily poured into Tank 1 from a top faucet. Tank 1 connects to Tank 2 via a pipe at its bottom. Tank 2 connects to Tank 3 via a pipe at its middle, and Tank 3 connects to Tank 4 via an open pipe at its top. All tank sizes are equal. Which tank fills to the top first?',
  '["Tank 2 fills first because liquid seeks the lowest open connection before Tank 1 can fill", "Tank 1 fills first because it receives the primary flow directly", "Tank 4 fills first because gravity pushes fluid to the end of the line", "All tanks fill simultaneously at the identical level"]'::jsonb,
  0,
  0,
  'Liquid cannot rise past an open pipe opening until water flows through into the next container. Water always seeks the lowest path first.',
  'Hydrostatic Equilibrium & Bottleneck Routing',
  'Water in Tank 1 immediately exits through the bottom pipe into Tank 2 before Tank 1 can rise. Because the outlet pipe from Tank 2 to Tank 3 is located higher (at the middle), Tank 2 will accumulate water and fill up to its top rim first before excess water can spill or rise further up the system.',
  100
),
(
  'bq_03',
  'The 3D Orthographic Cube Projection',
  'spatial_reasoning',
  'intermediate',
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
  'Imagine a 3D staircase sculpture constructed from solid 1x1 unit cubes: Column A is 3 cubes high, Column B (to the right) is 2 cubes high, and Column C is 1 cube high. If you look at this structure strictly from directly above (top-down birds-eye view), what will you see?',
  '["A flat 1x3 horizontal rectangle showing 3 square faces of equal area", "A triangular slope showing descending stair steps with height depth", "A single square representing the tallest column only", "A 3D perspective with shadows on the left edges"]'::jsonb,
  0,
  0,
  'Top-down (orthographic) projection flattens the Z-axis (height). You only observe the horizontal X and Y boundaries of the exposed top surfaces.',
  'Orthographic Projection & Dimensional Flattening',
  'In an orthogonal top-down view, all vertical elevation (height difference) disappears. Each column presents exactly one square top face of identical size, forming a flat 1-row by 3-column rectangle consisting of 3 equal squares.',
  120
),
(
  'bq_04',
  'The 9 Coins & 2-Pan Scale Optimization',
  'lateral_thinking',
  'intermediate',
  'https://images.unsplash.com/photo-1610375461246-83df859d849d?auto=format&fit=crop&w=800&q=80',
  'You have 9 visually identical gold coins. Exactly one coin is counterfeit and weighs slightly LESS than the real ones. Using an uncalibrated two-pan balance scale, what is the absolute MINIMUM number of weighings guaranteed to find the fake coin?',
  '["2 weighings (Divide into 3 groups of 3)", "3 weighings (Divide into pairs and eliminate one by one)", "4 weighings (Binary search comparison)", "8 weighings (Compare each coin against a benchmark)"]'::jsonb,
  0,
  0,
  'A balance scale has 3 possible outcomes: Left is lighter, Right is lighter, or Both balance equally. You can eliminate two-thirds of candidates in one step!',
  'Ternary Tree Branching & Information Theory',
  'Divide the 9 coins into three piles of 3 (Piles A, B, C). Weigh A vs B. If one is lighter, the fake is in that pile; if they balance, the fake is in pile C (1st weighing reduces to 3 coins). Take the remaining 3 coins, put 1 on the left pan and 1 on the right. If one is lighter, it is the fake; if they balance, the 3rd unweighed coin is the fake (2nd weighing guarantees the answer).',
  150
),
(
  'bq_05',
  'The Balance Scale Algebraic Deduction',
  'logic_deduction',
  'beginner',
  'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80',
  'On a balance scale: Balance #1 shows 2 Cubes = 3 Spheres. Balance #2 shows 1 Cylinder = 1 Cube + 1 Sphere. How many Spheres are needed to perfectly balance 2 Cylinders?',
  '["5 Spheres", "4 Spheres", "6 Spheres", "3 Spheres"]'::jsonb,
  0,
  0,
  'Express everything in terms of Spheres: From Balance 1, 1 Cube = 1.5 Spheres. Substitute this into Balance 2!',
  'Variable Substitution & Proportional Equivalence',
  'If 2 Cubes = 3 Spheres, then 1 Cube = 1.5 Spheres. In Balance #2, 1 Cylinder = 1 Cube + 1 Sphere = 1.5 Spheres + 1 Sphere = 2.5 Spheres. Therefore, 2 Cylinders = 2 × 2.5 Spheres = 5 Spheres.',
  110
),
(
  'bq_06',
  'The Closed Room & 3 Light Switches Riddle',
  'lateral_thinking',
  'intermediate',
  'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80',
  'Outside a sealed room with no windows, there are 3 wall switches (A, B, C) all in the OFF position. Inside is a single incandescent filament light bulb. You may only open the door and enter the room ONCE. How can you definitively determine which switch controls the bulb?',
  '["Turn switch A ON for 10 minutes, turn it OFF, turn switch B ON, then enter the room and check light & bulb warmth", "Turn all 3 switches ON simultaneously, enter the room, and measure the voltage with a multimeter", "Toggle switch A rapidly 100 times to create a visible spark under the door gap", "Leave switch A and B OFF and turn switch C ON; if it is dark, switch A must be the one"]'::jsonb,
  0,
  0,
  'Incandescent bulbs emit both visible optical light AND thermal heat energy that lingers after turning off.',
  'Multi-Sensory State Detection (Latent Thermal Energy)',
  'Turn Switch A ON for 10 minutes (allowing the bulb to get hot). Turn Switch A OFF, and turn Switch B ON. Immediately enter the room: If the light is ON, Switch B is the controller. If the light is OFF but the bulb is warm to the touch, Switch A is the controller. If the light is OFF and the bulb is cold, Switch C is the controller.',
  150
),
(
  'bq_07',
  'The Sundial Shadow Angle Anomaly',
  'everyday_physics',
  'beginner',
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
  'In an open outdoor plaza at 12:00 PM solar noon in the Northern Hemisphere, a vertical 2-meter stick casts a crisp 0.5-meter shadow due North. A nearby tree casts a shadow pointing South-East. What is the logical deduction?',
  '["The tree is illuminated by a secondary artificial light source (e.g. powerful spotlight or glass building reflection)", "The tree has a curved trunk causing gravitational shadow bending", "The sun moves in reverse during midday hours", "The tree shadow is an optical mirage caused by ground heat convection"]'::jsonb,
  0,
  0,
  'All outdoor objects illuminated solely by the Sun at the same location and time must cast shadows pointing in the exact same direction.',
  'Anomaly Detection & Uniform Reference Vectors',
  'Because sunlight rays arrive essentially parallel across a local area, all natural solar shadows at a given moment point in the identical direction (due North at solar noon in the Northern Hemisphere). A shadow pointing South-East proves an external localized light source (such as architectural floodlights or reflective mirror glass).',
  100
),
(
  'bq_08',
  'The Pulley Mechanical Advantage Lift',
  'cause_and_effect',
  'intermediate',
  'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80',
  'A worker uses a 2-pulley block-and-tackle system (with 2 supporting rope strands) to lift a heavy 60 kg stone block. If the worker pulls 6 meters of rope, how high will the stone block rise above the ground?',
  '["3 meters (Distance is divided by the 2 supporting rope strands)", "6 meters (Distance pulled equals height lifted)", "12 meters (Mechanical leverage doubles vertical distance)", "1.5 meters (Quartered due to pulley friction)"]'::jsonb,
  0,
  0,
  'Conservation of Work: Work = Force × Distance. When a 2-pulley system cuts the required lifting force in half, the distance pulled must double.',
  'Conservation of Energy & Mechanical Trade-offs',
  'A 2-rope pulley system provides a 2:1 mechanical advantage. You exert half the force, but you must pull twice the length of rope to shorten the two supporting loops. Pulling 6 meters of rope shortens each strand by 3 meters, raising the stone block exactly 3 meters.',
  120
),
(
  'bq_09',
  'The River Crossing & Boat Weight Constraint',
  'logic_deduction',
  'intermediate',
  'https://images.unsplash.com/photo-1508873696983-2df5293cb32b?auto=format&fit=crop&w=800&q=80',
  'An adult weighing 80 kg and two children weighing 40 kg each need to cross a river. Their small rowboat has a strict maximum capacity of 80 kg. What is the MINIMUM number of one-way river crossings required to transport all three across?',
  '["5 one-way trips", "3 one-way trips", "7 one-way trips", "4 one-way trips"]'::jsonb,
  0,
  0,
  'Both children can ride together (40kg + 40kg = 80kg), and one child can row the boat back!',
  'State Space Search & Cyclic Bottleneck Navigation',
  'Trip 1: Both children row across to the far bank (2 children across). Trip 2: Child 1 rows back with the boat (1 child across). Trip 3: Adult rows across alone (Adult + 1 child across). Trip 4: Child 2 rows back to the start bank (Adult across). Trip 5: Both children row across together. Total = 5 one-way trips.',
  130
),
(
  'bq_10',
  'The Geometric Pattern Matrix Sequence',
  'pattern_recognition',
  'beginner',
  'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=800&q=80',
  'In a visual pattern sequence: Tile 1 is a Triangle (3 sides) with 1 dot. Tile 2 is a Square (4 sides) with 2 dots. Tile 3 is a Pentagon (5 sides) with 4 dots. Tile 4 is a Hexagon (6 sides) with 8 dots. Following this exact rule, what is Tile 5?',
  '["Heptagon (7 sides) with 16 dots", "Heptagon (7 sides) with 10 dots", "Octagon (8 sides) with 16 dots", "Hexagon (6 sides) with 12 dots"]'::jsonb,
  0,
  0,
  'Track both rules independently: Shape sides increase by +1 (3, 4, 5, 6...). Inner dot count doubles each step (1, 2, 4, 8...).',
  'Multi-Variable Sequence Progression',
  'Two concurrent arithmetic and geometric sequences govern this pattern: Polygon vertices increase linearly by +1 (3 → 4 → 5 → 6 → 7 sides = Heptagon), while dot count follows exponential doubling 2^(n-1) (1 → 2 → 4 → 8 → 16 dots). Tile 5 is a Heptagon with 16 dots.',
  100
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  category = EXCLUDED.category,
  difficulty = EXCLUDED.difficulty,
  image_url = EXCLUDED.image_url,
  question = EXCLUDED.question,
  options = EXCLUDED.options,
  "correctIndex" = EXCLUDED."correctIndex",
  correct_index = EXCLUDED.correct_index,
  hint = EXCLUDED.hint,
  critical_thinking_principle = EXCLUDED.critical_thinking_principle,
  explanation = EXCLUDED.explanation,
  points = EXCLUDED.points,
  updated_at = now();
