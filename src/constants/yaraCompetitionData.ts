import { CompetitionEventConfig } from '../types/yaraCompetition';

export const YARA_EVENT_2026_DEFAULT: CompetitionEventConfig = {
  id: 'yara-competition-2026',
  name: 'YARA EDUCATIONAL ROBOTICS COMPETITION 2026',
  edition_year: 2026,
  theme: 'Engineering Opportunity: Robotics and Innovation for Underserved Youth',
  tagline: 'Innovate for Inclusion. Build for Impact.',
  description: 'The flagship national and continental championship organized by the Young Africans Robotics Association (YARA). Bringing together brilliant student builders, schools, and youth tech teams to compete in Underwater Robotics, Autonomous Maze Solving, and Technology for the Underserved innovation pitches.',
  organizer: 'Young Africans Robotics Association (YARA)',
  date_display: 'October 16 – 18, 2026 (Dates subject to official finalization by organizing committee)',
  venue_display: 'National Science & Innovation Arena / Virtual Live Stream',
  registration_deadline_display: 'September 20, 2026 (Early Team Registration Open)',
  is_registration_open: true,
  is_leaderboard_published: true,
  categories: [
    {
      id: 'underwater_drone',
      title: 'Underwater Drone Mission Challenge',
      weight_percentage: 35,
      description: 'Participants design, build, and program an underwater remotely operated vehicle (ROV) to complete mission objectives including object localization, submerged course navigation, precision target retrieval, and recovery.',
      skills_assessed: [
        'Mechanical design & waterproofing',
        'Buoyancy & electronics',
        'Robotics & embedded controllers',
        'Tethered communication & control systems',
        'Real-time piloting & teamwork'
      ],
      rules_summary: 'Teams pilot custom or configured ROVs in a controlled test tank. Missions scored on precision handling, time efficiency, target retrieval accuracy, and engineering robustness.',
      is_active: true
    },
    {
      id: 'autonomous_maze',
      title: 'Autonomous Maze Solving Challenge',
      weight_percentage: 35,
      description: 'Teams build an autonomous ground robot capable of navigating complex unbeknown labyrinth corridors without remote human control. Uses sensor feedback, wall-following algorithms, and error recovery routines.',
      skills_assessed: [
        'Ultrasonic / LiDAR / IR sensors',
        'Microcontroller programming (C++/Python/MicroPython)',
        'Autonomous decision algorithms (FloodFill / PID / Wall Tracking)',
        'Chassis & motor control dynamics',
        'Dynamic error recovery'
      ],
      rules_summary: 'Autonomous robots start inside an arena maze and must navigate from start to destination autonomously. Scored on completion, route optimization, time, and independence from external aids.',
      is_active: true
    },
    {
      id: 'innovation_pitch',
      title: 'Innovation Pitch Challenge',
      weight_percentage: 30,
      description: 'Theme: "Technology for the Underserved: How Can We Use Robotics, AI and Innovation to Create Opportunities for Young People with Limited Access to Resources?" Propose a technology solution for rural education, digital access, agriculture, healthcare, or disability inclusion.',
      skills_assessed: [
        'Problem definition & stakeholder empathy',
        'Technological innovation & feasibility',
        'Prototype / Proof of concept quality',
        'Social impact potential & scalability',
        '5-min pitch presentation & 3-min Q&A defense'
      ],
      rules_summary: '5-minute live or virtual pitch followed by 3 minutes of judges questions. Judged on problem clarity, technical depth, social benefit for underserved youth, and prototype readiness.',
      is_active: true
    }
  ]
};

export const ZIMBABWE_PROVINCES_AND_DISTRICTS: Record<string, string[]> = {
  'Harare': ['Harare Urban', 'Harare Rural', 'Chitungwiza', 'Epworth'],
  'Bulawayo': ['Bulawayo Urban', 'Mzilikazi', 'Reigate', 'Imbizo'],
  'Manicaland': ['Mutare', 'Buhera', 'Chimanimani', 'Chipinge', 'Makoni', 'Mutasa', 'Nyanga'],
  'Mashonaland Central': ['Bindura', 'Guruve', 'Mazowe', 'Mount Darwin', 'Muzarabani', 'Rushinga', 'Shamva'],
  'Mashonaland East': ['Marondera', 'Chikomba', 'Goromonzi', 'Hwedza', 'Mudzi', 'Murehwa', 'Mutoko', 'Seke', 'Uzumba-Maramba-Pfungwe'],
  'Mashonaland West': ['Chinhoyi', 'Chegutu', 'Hurungwe', 'Kariba', 'Makonde', 'Mhondoro-Ngezi', 'Zvimba'],
  'Masvingo': ['Masvingo', 'Bikita', 'Chiredzi', 'Chivi', 'Gutu', 'Mwenezi', 'Zaka'],
  'Matabeleland North': ['Bubi', 'Binga', 'Hwange', 'Lupane', 'Nkayi', 'Tsholotsho', 'Umguza'],
  'Matabeleland South': ['Beitbridge', 'Bulilima', 'Gwanda', 'Insiza', 'Mangwe', 'Matobo', 'Umzingwane'],
  'Midlands': ['Gweru', 'Chirumhanzu', 'Gokwe North', 'Gokwe South', 'Kwekwe', 'Mberengwa', 'Shurugwi', 'Zvishavane'],
  'Other / Regional African Diaspora': ['SADC Region', 'East Africa', 'West Africa', 'International Youth Cohort']
};

export const COMPETITION_AWARDS = [
  {
    title: 'YARA Robotics Champion 2026',
    badge: '🏆',
    description: 'Grand Overall Champion calculated from weighted performances in Underwater (35%), Maze (35%), and Innovation Pitch (30%).'
  },
  {
    title: 'Best Underwater Robotics Team',
    badge: '🌊',
    description: 'Excellence in underwater maneuverability, buoyancy balance, and mission target retrieval.'
  },
  {
    title: 'Best Autonomous Robot',
    badge: '⚡',
    description: 'Highest autonomous efficiency, zero wall collisions, and fastest maze resolution time.'
  },
  {
    title: 'Best Innovation for Underserved Youth',
    badge: '💡',
    description: 'Top-ranking technology pitch directly advancing opportunities for youth in resource-constrained communities.'
  },
  {
    title: 'Best Engineering Design',
    badge: '⚙️',
    description: 'Superior mechanical design, wiring neatness, reliability, and structural ingenuity.'
  },
  {
    title: 'Best Programming & Algorithm',
    badge: '💻',
    description: 'Cleanest firmware architecture, efficient algorithmic logic, and robust error handling.'
  },
  {
    title: 'Best Social Impact',
    badge: '🌍',
    description: 'Demonstrated real-world community applicability, affordability, and empowerment potential.'
  },
  {
    title: 'Best Female-Led Team',
    badge: '👑',
    description: 'Outstanding technical execution and team captaincy led by inspiring young female engineers.'
  },
  {
    title: 'Most Promising Young Innovators',
    badge: '🚀',
    description: 'Junior secondary or rookie cohort displaying extraordinary creative grit and inventiveness.'
  },
  {
    title: 'Best School Robotics Programme',
    badge: '🏫',
    description: 'Recognizing the institution fostering exemplary STEM mentorship, diversity, and lab excellence.'
  }
];
