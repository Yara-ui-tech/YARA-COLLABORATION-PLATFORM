export interface FallbackCompetition {
  id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  registration_link?: string;
  image_url: string;
  status: 'upcoming' | 'active' | 'completed';
  category?: string;
}

export interface FallbackEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  image_url: string;
  registration_link: string;
  is_upcoming: boolean;
  category: 'competition' | 'workshop' | 'outreach' | 'other';
}

export const INITIAL_COMPETITIONS: FallbackCompetition[] = [
  {
    id: 'yara-competition-2026',
    title: 'YARA Educational Robotics Competition 2026',
    description: '“Engineering Opportunity: Robotics and Innovation for Underserved Youth”. Flagship continental championship featuring Underwater Drone Missions (35%), Autonomous Maze Solving (35%), and Technology for the Underserved Innovation Pitches (30%).',
    start_date: '2026-10-16T08:00:00.000Z',
    end_date: '2026-10-18T18:00:00.000Z',
    registration_link: '/competitions/yara-robotics-2026',
    image_url: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=80',
    status: 'upcoming',
    category: 'Robotics & STEM Championship'
  }
];

export const INITIAL_EVENTS: FallbackEvent[] = [
  {
    id: 'yara-workshop-01',
    title: 'YARA National Robotics Hardware Lab & ROV Buoyancy Masterclass',
    description: 'Practical training on waterproofing, brushless thruster integration, underwater acoustics, and ESP32 telemetry control ahead of the 2026 Underwater Drone Mission Challenge.',
    date: '2026-09-12T09:00:00.000Z',
    location: 'YARA National Science Arena & Live Stream',
    image_url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80',
    registration_link: '/events',
    is_upcoming: true,
    category: 'workshop'
  },
  {
    id: 'yara-outreach-02',
    title: 'Autonomous Navigation & Maze Algorithms Hack Session',
    description: 'Hands-on algorithmic workshop for secondary school and youth club programmers exploring PID control loops, ultrasonic sensor arrays, and micromouse labyrinth solving.',
    date: '2026-09-26T10:00:00.000Z',
    location: 'STEM Innovation Hub & Virtual Sim Lab',
    image_url: 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?auto=format&fit=crop&w=1200&q=80',
    registration_link: '/events',
    is_upcoming: true,
    category: 'workshop'
  }
];
