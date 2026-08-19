export interface FallbackCompetition {
  id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  registration_link: string;
  image_url: string;
  status: 'upcoming' | 'active' | 'completed';
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
    id: 'comp_01',
    title: 'Pan-African Youth Robotics Grand Prix 2026',
    description: 'The premier championship for young African tech builders. Compete across Autonomous Line-Tracing, Obstacle Navigation, and Agri-Robotics arenas for $5,000 in prototyping grants and international recognition.',
    start_date: new Date(Date.now() + 5 * 24 * 3600 * 1000).toISOString(),
    end_date: new Date(Date.now() + 8 * 24 * 3600 * 1000).toISOString(),
    registration_link: 'https://forms.google.com/yaria-grand-prix-2026',
    image_url: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=80',
    status: 'upcoming'
  },
  {
    id: 'comp_02',
    title: 'Autonomous Mobile Rover Circuit Sprint',
    description: 'A 48-hour hardware and simulation endurance challenge. Design and code a 4-wheel rover with ultrasonic pathfinding and PID steering algorithms to conquer rugged simulated terrain.',
    start_date: new Date(Date.now() + 12 * 24 * 3600 * 1000).toISOString(),
    end_date: new Date(Date.now() + 14 * 24 * 3600 * 1000).toISOString(),
    registration_link: 'https://forms.google.com/yaria-rover-sprint',
    image_url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80',
    status: 'upcoming'
  },
  {
    id: 'comp_03',
    title: 'Smart Agricultural IoT & Drone Hackathon',
    description: 'Build low-power solar telemetry nodes and autonomous drone payload mechanisms to monitor soil moisture, crop health, and automate precision irrigation in rural African farms.',
    start_date: new Date(Date.now() + 20 * 24 * 3600 * 1000).toISOString(),
    end_date: new Date(Date.now() + 23 * 24 * 3600 * 1000).toISOString(),
    registration_link: 'https://forms.google.com/yaria-agritech-hack',
    image_url: 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?auto=format&fit=crop&w=1200&q=80',
    status: 'upcoming'
  }
];

export const INITIAL_EVENTS: FallbackEvent[] = [
  {
    id: 'event_01',
    title: 'Hands-On Robotics Hardware Lab & PCB Prototyping Workshop',
    description: 'Intensive weekend masterclass: Solder real-world SMD components, design circuit boards in EasyEDA, and flash custom firmware to ESP32 microcontrollers.',
    date: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
    location: 'YARIA Innovation Hub / Virtual Broadcast',
    image_url: 'https://images.unsplash.com/photo-1555664424-778a1e5e1b48?auto=format&fit=crop&w=1200&q=80',
    registration_link: 'https://forms.google.com/yaria-hardware-lab',
    is_upcoming: true,
    category: 'workshop'
  },
  {
    id: 'event_02',
    title: 'National High-School STEM & Robotics Demo Day',
    description: 'Student innovators exhibit their self-driving rovers, solar trackers, and home automation prototypes to industry leaders, university faculty, and venture mentors.',
    date: new Date(Date.now() + 15 * 24 * 3600 * 1000).toISOString(),
    location: 'Main Science Auditorium & Live Stream',
    image_url: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=1200&q=80',
    registration_link: 'https://forms.google.com/yaria-stem-demo-day',
    is_upcoming: true,
    category: 'outreach'
  }
];
