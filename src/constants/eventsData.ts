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
  // Filter out any past mock or expired events
  const expiredOrMockIds = ['yara-workshop-01', 'yara-outreach-02', 'ai-for-educators-2026'];
  const localList = getLocalEvents().filter(e => !expiredOrMockIds.includes(e.id) && !deleted.includes(e.id));

  const eventMap = new Map<string, EventItem>();
  INITIAL_EVENTS.forEach(evt => {
    if (!deleted.includes(evt.id) && !expiredOrMockIds.includes(evt.id)) {
      eventMap.set(evt.id, evt);
    }
  });

  localList.forEach(evt => {
    if (!deleted.includes(evt.id) && !expiredOrMockIds.includes(evt.id)) {
      eventMap.set(evt.id, evt);
    }
  });

  try {
    const { data, error } = await supabase
      .from('events')
      .select('*');

    if (!error && data && data.length > 0) {
      data.forEach((item: any) => {
        if (!deleted.includes(item.id) && !expiredOrMockIds.includes(item.id)) {
          eventMap.set(item.id, {
            id: item.id,
            title: item.title,
            description: item.description || '',
            date: item.date || (item.event_date ? new Date(item.event_date).toLocaleDateString() : 'Upcoming 2026'),
            location: item.location || item.venue || 'YARA Arena',
            image_url: item.image_url || 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1200&q=80',
            registration_link: item.registration_link || '/events',
            is_upcoming: item.is_upcoming !== undefined ? item.is_upcoming : true,
            category: item.category || 'Physical Tournament'
          });
        }
      });
    }
  } catch (err) {
    console.warn('Supabase fetch events notice:', err);
  }

  // Also query system_settings catalog for events
  try {
    const { data: setVal } = await supabase
      .from('system_settings')
      .select('value')
      .eq('key', 'yara_events_catalog')
      .maybeSingle();

    if (setVal?.value?.events && Array.isArray(setVal.value.events)) {
      setVal.value.events.forEach((item: any) => {
        if (!deleted.includes(item.id) && !expiredOrMockIds.includes(item.id)) {
          eventMap.set(item.id, {
            id: item.id,
            title: item.title,
            description: item.description || '',
            date: item.date || 'Upcoming 2026',
            location: item.location || item.venue || 'YARA Arena',
            image_url: item.image_url || 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1200&q=80',
            registration_link: item.registration_link || '/events',
            is_upcoming: item.is_upcoming !== undefined ? item.is_upcoming : true,
            category: item.category || 'Physical Tournament'
          });
        }
      });
    }
  } catch { }

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

  const nowIso = new Date().toISOString();
  try {
    await supabase.from('events').upsert({
      id: eventData.id,
      title: eventData.title,
      description: eventData.description,
      date: eventData.date,
      event_date: eventData.date && !isNaN(Date.parse(eventData.date)) ? new Date(eventData.date).toISOString() : nowIso,
      location: eventData.location,
      venue: eventData.location,
      image_url: eventData.image_url,
      registration_link: eventData.registration_link,
      is_upcoming: eventData.is_upcoming ?? true,
      is_published: true,
      category: eventData.category || 'Physical Tournament'
    }, { onConflict: 'id' });
  } catch (err) {
    console.warn('Supabase save event notice:', err);
  }

  // Sync to system_settings catalog
  try {
    const all = Array.from((await getPublicEvents()));
    await supabase.from('system_settings').upsert({
      key: 'yara_events_catalog',
      value: { events: all, updated_at: nowIso },
      description: 'YARA Public Events Catalog'
    }, { onConflict: 'key' });
  } catch { }

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
