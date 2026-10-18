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

export const INITIAL_EVENTS: EventItem[] = [];

export const INITIAL_COMPETITIONS: FallbackCompetition[] = [];

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
  const mockEventIds = ['yara-workshop-01', 'yara-outreach-02'];
  const localList = getLocalEvents().filter(e => !mockEventIds.includes(e.id));

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
