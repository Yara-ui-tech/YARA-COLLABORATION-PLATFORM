import { supabase } from '../lib/supabase';

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

export interface EventItem {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  image_url: string;
  registration_link: string;
  is_upcoming: boolean;
  category: string;
  created_at?: string;
}

export const INITIAL_EVENTS: EventItem[] = [
  {
    id: 'ai-for-educators-2026',
    title: 'AI for Educators – Online Bootcamp',
    description: 'A high-impact 5-day professional development programme equipping teachers and lecturers with practical AI tools to automate lesson plans, design differentiated assessments, generate visual aids, and master robotics code pedagogy.',
    date: '31 Aug – 4 Sep 2026',
    location: 'Live Google Meet Hall',
    image_url: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1200&q=80',
    registration_link: '/events/ai-for-educators',
    is_upcoming: true,
    category: 'Virtual Bootcamp'
  },
  {
    id: 'yara-workshop-01',
    title: 'YARA National Robotics Hardware Lab & ROV Buoyancy Masterclass',
    description: 'Practical training on waterproofing, brushless thruster integration, underwater acoustics, and ESP32 telemetry control ahead of the 2026 Underwater Drone Mission Challenge.',
    date: '12 Sep 2026',
    location: 'YARA National Science Arena & Live Stream',
    image_url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80',
    registration_link: '/events',
    is_upcoming: true,
    category: 'Physical Tournament'
  },
  {
    id: 'yara-outreach-02',
    title: 'Autonomous Navigation & Maze Algorithms Hack Session',
    description: 'Hands-on algorithmic workshop for secondary school and youth club programmers exploring PID control loops, ultrasonic sensor arrays, and micromouse labyrinth solving.',
    date: '26 Sep 2026',
    location: 'STEM Innovation Hub & Virtual Sim Lab',
    image_url: 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?auto=format&fit=crop&w=1200&q=80',
    registration_link: '/events',
    is_upcoming: true,
    category: 'Seminar & Workshop'
  }
];

export const INITIAL_COMPETITIONS: FallbackCompetition[] = [
  {
    id: 'yara-competition-2026',
    title: 'YARA Educational Robotics Competition 2026',
    description: '“Engineering Opportunity: Robotics and Innovation for Underserved Youth”. Flagship continental championship featuring Underwater Drone Missions (35%), Autonomous Maze Solving (35%), and Technology for the Underserved Innovation Pitches (30%).',
    start_date: '2026-10-16T08:00:00.000Z',
    end_date: '2026-10-18T18:00:00.000Z',
    registration_link: '/competitions/yara-2026',
    image_url: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=80',
    status: 'upcoming',
    category: 'Robotics & STEM Championship'
  }
];

const EVENTS_STORAGE_KEY = 'yara_custom_events_store';
const DELETED_EVENTS_KEY = 'yara_deleted_event_ids_store';

function getDeletedEventIds(): string[] {
  try {
    const raw = localStorage.getItem(DELETED_EVENTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function getLocalEvents(): EventItem[] {
  try {
    const raw = localStorage.getItem(EVENTS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalEvents(list: EventItem[]): void {
  try {
    localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(list));
  } catch (e) {
    console.warn('Error saving local events:', e);
  }
}

export async function fetchAllEvents(): Promise<EventItem[]> {
  const deleted = getDeletedEventIds();
  const localList = getLocalEvents();

  const eventMap = new Map<string, EventItem>();
  INITIAL_EVENTS.forEach(evt => {
    if (!deleted.includes(evt.id)) {
      eventMap.set(evt.id, evt);
    }
  });

  localList.forEach(evt => {
    if (!deleted.includes(evt.id)) {
      eventMap.set(evt.id, evt);
    }
  });

  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('date', { ascending: true });

    if (!error && data && data.length > 0) {
      data.forEach((item: any) => {
        if (!deleted.includes(item.id)) {
          eventMap.set(item.id, {
            id: item.id,
            title: item.title,
            description: item.description || '',
            date: item.date || 'Upcoming 2026',
            location: item.location || 'YARA Arena',
            image_url: item.image_url || 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1200&q=80',
            registration_link: item.registration_link || '/events',
            is_upcoming: item.is_upcoming !== undefined ? item.is_upcoming : true,
            category: item.category || 'Virtual Bootcamp'
          });
        }
      });
    }
  } catch (err) {
    console.warn('Supabase fetch events notice:', err);
  }

  return Array.from(eventMap.values());
}

export async function saveEventItem(eventData: EventItem): Promise<EventItem> {
  const localList = getLocalEvents();
  const idx = localList.findIndex(e => e.id === eventData.id);
  if (idx >= 0) {
    localList[idx] = { ...localList[idx], ...eventData };
  } else {
    localList.unshift(eventData);
  }
  saveLocalEvents(localList);

  try {
    await supabase.from('events').upsert({
      id: eventData.id,
      title: eventData.title,
      description: eventData.description,
      date: eventData.date,
      location: eventData.location,
      image_url: eventData.image_url,
      registration_link: eventData.registration_link,
      is_upcoming: eventData.is_upcoming,
      category: eventData.category
    }, { onConflict: 'id' });
  } catch (err) {
    console.warn('Supabase save event notice:', err);
  }

  return eventData;
}

export async function deleteEventItem(eventId: string): Promise<boolean> {
  const deleted = getDeletedEventIds();
  if (!deleted.includes(eventId)) {
    deleted.push(eventId);
    localStorage.setItem(DELETED_EVENTS_KEY, JSON.stringify(deleted));
  }

  const localList = getLocalEvents().filter(e => e.id !== eventId);
  saveLocalEvents(localList);

  try {
    await supabase.from('events').delete().eq('id', eventId);
  } catch (err) {
    console.warn('Supabase delete event notice:', err);
  }

  return true;
}
