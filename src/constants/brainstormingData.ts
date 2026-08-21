import { BrainstormingQuestion } from '../types/brainstorming';

export const INITIAL_BRAINSTORMING_QUESTIONS: BrainstormingQuestion[] = [
  {
    id: 'bq_01',
    title: 'The Interlocking Gear Train Rotation',
    category: 'cause_and_effect',
    difficulty: 'beginner',
    image_url: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=800&q=80',
    question: 'Consider a linear row of 5 interlocking gears touching in a sequence (Gear 1 meshes with Gear 2, Gear 2 with 3, and so on up to Gear 5). If Gear 1 is turned CLOCKWISE, in which direction will Gear 5 rotate?',
    options: [
      'Clockwise (Same direction as Gear 1)',
      'Counter-Clockwise (Opposite direction to Gear 1)',
      'It will remain stationary due to mechanical locking',
      'It will oscillate back and forth depending on gear teeth count'
    ],
    correctIndex: 0,
    hint: 'Every time two gears mesh, the rotation direction inverses (Clockwise ⇄ Counter-Clockwise). Count the odd/even position of Gear 5.',
    critical_thinking_principle: 'Parity & Alternation of States in Linked Systems',
    explanation: 'In a single chain of meshed gears: Gear 1 = Clockwise (CW), Gear 2 = Counter-Clockwise (CCW), Gear 3 = CW, Gear 4 = CCW, and Gear 5 = CW. All odd-numbered gears in a single line rotate in the exact same direction regardless of their diameter or tooth count.',
    points: 100
  },
  {
    id: 'bq_02',
    title: 'The Connected Water Tanks & Valves',
    category: 'everyday_physics',
    difficulty: 'beginner',
    image_url: 'https://images.unsplash.com/photo-1584905066893-7d5c142ba4e1?auto=format&fit=crop&w=800&q=80',
    question: 'Water is steadily poured into Tank 1 from a top faucet. Tank 1 connects to Tank 2 via a pipe at its bottom. Tank 2 connects to Tank 3 via a pipe at its middle, and Tank 3 connects to Tank 4 via an open pipe at its top. All tank sizes are equal. Which tank fills to the top first?',
    options: [
      'Tank 2 fills first because liquid seeks the lowest open connection before Tank 1 can fill',
      'Tank 1 fills first because it receives the primary flow directly',
      'Tank 4 fills first because gravity pushes fluid to the end of the line',
      'All tanks fill simultaneously at the identical level'
    ],
    correctIndex: 0,
    hint: 'Liquid cannot rise past an open pipe opening until water flows through into the next container. Water always seeks the lowest path first.',
    critical_thinking_principle: 'Hydrostatic Equilibrium & Bottleneck Routing',
    explanation: 'Water in Tank 1 immediately exits through the bottom pipe into Tank 2 before Tank 1 can rise. Because the outlet pipe from Tank 2 to Tank 3 is located higher (at the middle), Tank 2 will accumulate water and fill up to its top rim first before excess water can spill or rise further up the system.',
    points: 100
  },
  {
    id: 'bq_03',
    title: 'The 3D Orthographic Cube Projection',
    category: 'spatial_reasoning',
    difficulty: 'intermediate',
    image_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
    question: 'Imagine a 3D staircase sculpture constructed from solid 1x1 unit cubes: Column A is 3 cubes high, Column B (to the right) is 2 cubes high, and Column C is 1 cube high. If you look at this structure strictly from directly above (top-down birds-eye view), what will you see?',
    options: [
      'A flat 1x3 horizontal rectangle showing 3 square faces of equal area',
      'A triangular slope showing descending stair steps with height depth',
      'A single square representing the tallest column only',
      'A 3D perspective with shadows on the left edges'
    ],
    correctIndex: 0,
    hint: 'Top-down (orthographic) projection flattens the Z-axis (height). You only observe the horizontal X and Y boundaries of the exposed top surfaces.',
    critical_thinking_principle: 'Orthographic Projection & Dimensional Flattening',
    explanation: 'In an orthogonal top-down view, all vertical elevation (height difference) disappears. Each column presents exactly one square top face of identical size, forming a flat 1-row by 3-column rectangle consisting of 3 equal squares.',
    points: 120
  },
  {
    id: 'bq_04',
    title: 'The 9 Coins & 2-Pan Scale Optimization',
    category: 'lateral_thinking',
    difficulty: 'intermediate',
    image_url: 'https://images.unsplash.com/photo-1610375461246-83df859d849d?auto=format&fit=crop&w=800&q=80',
    question: 'You have 9 visually identical gold coins. Exactly one coin is counterfeit and weighs slightly LESS than the real ones. Using an uncalibrated two-pan balance scale, what is the absolute MINIMUM number of weighings guaranteed to find the fake coin?',
    options: [
      '2 weighings (Divide into 3 groups of 3)',
      '3 weighings (Divide into pairs and eliminate one by one)',
      '4 weighings (Binary search comparison)',
      '8 weighings (Compare each coin against a benchmark)'
    ],
    correctIndex: 0,
    hint: 'A balance scale has 3 possible outcomes: Left is lighter, Right is lighter, or Both balance equally. You can eliminate two-thirds of candidates in one step!',
    critical_thinking_principle: 'Ternary Tree Branching & Information Theory',
    explanation: 'Divide the 9 coins into three piles of 3 (Piles A, B, C). Weigh A vs B. If one is lighter, the fake is in that pile; if they balance, the fake is in pile C (1st weighing reduces to 3 coins). Take the remaining 3 coins, put 1 on the left pan and 1 on the right. If one is lighter, it is the fake; if they balance, the 3rd unweighed coin is the fake (2nd weighing guarantees the answer).',
    points: 150
  },
  {
    id: 'bq_05',
    title: 'The Balance Scale Algebraic Deduction',
    category: 'logic_deduction',
    difficulty: 'beginner',
    image_url: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80',
    question: 'On a balance scale: Balance #1 shows 2 Cubes = 3 Spheres. Balance #2 shows 1 Cylinder = 1 Cube + 1 Sphere. How many Spheres are needed to perfectly balance 2 Cylinders?',
    options: [
      '5 Spheres',
      '4 Spheres',
      '6 Spheres',
      '3 Spheres'
    ],
    correctIndex: 0,
    hint: 'Express everything in terms of Spheres: From Balance 1, 1 Cube = 1.5 Spheres. Substitute this into Balance 2!',
    critical_thinking_principle: 'Variable Substitution & Proportional Equivalence',
    explanation: 'If 2 Cubes = 3 Spheres, then 1 Cube = 1.5 Spheres. In Balance #2, 1 Cylinder = 1 Cube + 1 Sphere = 1.5 Spheres + 1 Sphere = 2.5 Spheres. Therefore, 2 Cylinders = 2 × 2.5 Spheres = 5 Spheres.',
    points: 110
  },
  {
    id: 'bq_06',
    title: 'The Closed Room & 3 Light Switches Riddle',
    category: 'lateral_thinking',
    difficulty: 'intermediate',
    image_url: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80',
    question: 'Outside a sealed room with no windows, there are 3 wall switches (A, B, C) all in the OFF position. Inside is a single incandescent filament light bulb. You may only open the door and enter the room ONCE. How can you definitively determine which switch controls the bulb?',
    options: [
      'Turn switch A ON for 10 minutes, turn it OFF, turn switch B ON, then enter the room and check light & bulb warmth',
      'Turn all 3 switches ON simultaneously, enter the room, and measure the voltage with a multimeter',
      'Toggle switch A rapidly 100 times to create a visible spark under the door gap',
      'Leave switch A and B OFF and turn switch C ON; if it is dark, switch A must be the one'
    ],
    correctIndex: 0,
    hint: 'Incandescent bulbs emit both visible optical light AND thermal heat energy that lingers after turning off.',
    critical_thinking_principle: 'Multi-Sensory State Detection (Latent Thermal Energy)',
    explanation: 'Turn Switch A ON for 10 minutes (allowing the bulb to get hot). Turn Switch A OFF, and turn Switch B ON. Immediately enter the room: If the light is ON, Switch B is the controller. If the light is OFF but the bulb is warm to the touch, Switch A is the controller. If the light is OFF and the bulb is cold, Switch C is the controller.',
    points: 150
  },
  {
    id: 'bq_07',
    title: 'The Sundial Shadow Angle Anomaly',
    category: 'everyday_physics',
    difficulty: 'beginner',
    image_url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
    question: 'In an open outdoor plaza at 12:00 PM solar noon in the Northern Hemisphere, a vertical 2-meter stick casts a crisp 0.5-meter shadow due North. A nearby tree casts a shadow pointing South-East. What is the logical deduction?',
    options: [
      'The tree is illuminated by a secondary artificial light source (e.g. powerful spotlight or glass building reflection)',
      'The tree has a curved trunk causing gravitational shadow bending',
      'The sun moves in reverse during midday hours',
      'The tree shadow is an optical mirage caused by ground heat convection'
    ],
    correctIndex: 0,
    hint: 'All outdoor objects illuminated solely by the Sun at the same location and time must cast shadows pointing in the exact same direction.',
    critical_thinking_principle: 'Anomaly Detection & Uniform Reference Vectors',
    explanation: 'Because sunlight rays arrive essentially parallel across a local area, all natural solar shadows at a given moment point in the identical direction (due North at solar noon in the Northern Hemisphere). A shadow pointing South-East proves an external localized light source (such as architectural floodlights or reflective mirror glass).',
    points: 100
  },
  {
    id: 'bq_08',
    title: 'The Pulley Mechanical Advantage Lift',
    category: 'cause_and_effect',
    difficulty: 'intermediate',
    image_url: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80',
    question: 'A worker uses a 2-pulley block-and-tackle system (with 2 supporting rope strands) to lift a heavy 60 kg stone block. If the worker pulls 6 meters of rope, how high will the stone block rise above the ground?',
    options: [
      '3 meters (Distance is divided by the 2 supporting rope strands)',
      '6 meters (Distance pulled equals height lifted)',
      '12 meters (Mechanical leverage doubles vertical distance)',
      '1.5 meters (Quartered due to pulley friction)'
    ],
    correctIndex: 0,
    hint: 'Conservation of Work: Work = Force × Distance. When a 2-pulley system cuts the required lifting force in half, the distance pulled must double.',
    critical_thinking_principle: 'Conservation of Energy & Mechanical Trade-offs',
    explanation: 'A 2-rope pulley system provides a 2:1 mechanical advantage. You exert half the force, but you must pull twice the length of rope to shorten the two supporting loops. Pulling 6 meters of rope shortens each strand by 3 meters, raising the stone block exactly 3 meters.',
    points: 120
  },
  {
    id: 'bq_09',
    title: 'The River Crossing & Boat Weight Constraint',
    category: 'logic_deduction',
    difficulty: 'intermediate',
    image_url: 'https://images.unsplash.com/photo-1508873696983-2df5293cb32b?auto=format&fit=crop&w=800&q=80',
    question: 'An adult weighing 80 kg and two children weighing 40 kg each need to cross a river. Their small rowboat has a strict maximum capacity of 80 kg. What is the MINIMUM number of one-way river crossings required to transport all three across?',
    options: [
      '5 one-way trips',
      '3 one-way trips',
      '7 one-way trips',
      '4 one-way trips'
    ],
    correctIndex: 0,
    hint: 'Both children can ride together (40kg + 40kg = 80kg), and one child can row the boat back!',
    critical_thinking_principle: 'State Space Search & Cyclic Bottleneck Navigation',
    explanation: 'Trip 1: Both children row across to the far bank (2 children across). Trip 2: Child 1 rows back with the boat (1 child across). Trip 3: Adult rows across alone (Adult + 1 child across). Trip 4: Child 2 rows back to the start bank (Adult across). Trip 5: Both children row across together. Total = 5 one-way trips.',
    points: 130
  },
  {
    id: 'bq_10',
    title: 'The Geometric Pattern Matrix Sequence',
    category: 'pattern_recognition',
    difficulty: 'beginner',
    image_url: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=800&q=80',
    question: 'In a visual pattern sequence: Tile 1 is a Triangle (3 sides) with 1 dot. Tile 2 is a Square (4 sides) with 2 dots. Tile 3 is a Pentagon (5 sides) with 4 dots. Tile 4 is a Hexagon (6 sides) with 8 dots. Following this exact rule, what is Tile 5?',
    options: [
      'Heptagon (7 sides) with 16 dots',
      'Heptagon (7 sides) with 10 dots',
      'Octagon (8 sides) with 16 dots',
      'Hexagon (6 sides) with 12 dots'
    ],
    correctIndex: 0,
    hint: 'Track both rules independently: Shape sides increase by +1 (3, 4, 5, 6...). Inner dot count doubles each step (1, 2, 4, 8...).',
    critical_thinking_principle: 'Multi-Variable Sequence Progression',
    explanation: 'Two concurrent arithmetic and geometric sequences govern this pattern: Polygon vertices increase linearly by +1 (3 → 4 → 5 → 6 → 7 sides = Heptagon), while dot count follows exponential doubling 2^(n-1) (1 → 2 → 4 → 8 → 16 dots). Tile 5 is a Heptagon with 16 dots.',
    points: 100
  }
];

