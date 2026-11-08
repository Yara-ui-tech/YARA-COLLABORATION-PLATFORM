import { supabase } from '../lib/supabase';
import { Competition } from '../types/competition';

const STORAGE_KEY = 'yara_custom_competitions';
const DELETED_KEY = 'yara_deleted_competition_ids';

export const DEFAULT_COMPETITIONS: Competition[] = [];

function getDeletedIds(): string[] {
  try {
    const raw = localStorage.getItem(DELETED_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function getLocalCustomCompetitions(): Competition[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      const clean = parsed.filter(c => !isDisallowedCompetition(c));
      if (clean.length !== parsed.length) {
        saveLocalCustomCompetitions(clean);
      }
      return clean;
    }
    return [];
  } catch {
    return [];
  }
}

function saveLocalCustomCompetitions(comps: Competition[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(comps));
  } catch (err) {
    console.error('Failed to save to localStorage', err);
  }
}

const isDisallowedCompetition = (c: any): boolean => {
  const id = (c?.id || '').toLowerCase();
  const slug = (c?.slug || '').toLowerCase();
  const title = (c?.title || '').toLowerCase();
  const desc = (c?.description || '').toLowerCase();
  if (
    id === 'c0000000-0000-0000-0000-000000002026' ||
    id === 'yara-2026-flagship' ||
    slug === 'yara-competition-2026' ||
    slug === 'yara-2026'
  ) {
    return true;
  }
  if (
    title.includes('educational robotics competition') ||
    title.includes('yara educational robotics')
  ) {
    return true;
  }
  if (
    desc.includes('zimbabwe premier multi-tier') || 
    desc.includes('autonomous maze solving') ||
    desc.includes('underwater drone simulations') ||
    desc.includes('strict 2 boys + 2 girls')
  ) {
    return true;
  }
  return false;
};

export async function getCompetitions(): Promise<Competition[]> {
  const deletedIds = getDeletedIds();
  const localCustom = getLocalCustomCompetitions().filter(c => !isDisallowedCompetition(c));
  const now = new Date();

  // Helper to dynamically calculate if competition is expired
  const computeStatus = (c: any): 'upcoming' | 'active' | 'completed' => {
    if (c.status === 'completed') return 'completed';
    const endDate = c.end_date ? new Date(c.end_date) : null;
    const startDate = c.start_date ? new Date(c.start_date) : null;
    if (endDate && endDate < now) {
      return 'completed';
    }
    if (startDate && startDate <= now && endDate && endDate >= now) {
      return 'active';
    }
    return c.status || 'upcoming';
  };

  try {
    const { data, error } = await supabase
      .from('competitions')
      .select('*')
      .order('display_order', { ascending: true })
      .order('start_date', { ascending: true });

    if (!error && data && data.length > 0) {
      // Merge with custom fields and ensure defaults
      const formatted: Competition[] = data
        .filter(c => !deletedIds.includes(c.id) && !deletedIds.includes(c.slug) && !isDisallowedCompetition(c))
        .map((c: any) => ({
          id: c.id,
          slug: c.slug || c.id,
          title: c.title,
          subtitle: c.subtitle || '',
          description: c.description || '',
          category: c.category || 'flagship_robotics',
          format: c.format || 'hybrid',
          status: computeStatus(c),
          start_date: c.start_date || new Date().toISOString(),
          end_date: c.end_date || new Date().toISOString(),
          registration_deadline: c.registration_deadline || null,
          location: c.location || 'Harare, Zimbabwe',
          image_url: c.image_url || 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=80',
          banner_url: c.banner_url || c.image_url,
          registration_link: c.registration_link || '/competition/participant',
          internal_route: c.internal_route || (c.slug === 'yara-2026' || c.id === 'yara-2026-flagship' ? '/competitions/yara-2026' : undefined),
          prize_pool: c.prize_pool || '$5,000',
          entry_fee: Number(c.entry_fee) || 0,
          currency: c.currency || 'USD',
          max_teams: c.max_teams || 50,
          registered_teams_count: c.registered_teams_count || 0,
          eligibility: c.eligibility || 'Open to registered YARA teams',
          rules_summary: c.rules_summary || '',
          is_featured: !!c.is_featured,
          display_order: c.display_order || 0,
          tags: Array.isArray(c.tags) ? c.tags : [],
          created_at: c.created_at,
          updated_at: c.updated_at
        }));

      // Merge with any extra local ones not in DB
      const dbIds = new Set(formatted.map(f => f.id));
      const extras = localCustom
        .filter(lc => !dbIds.has(lc.id) && !deletedIds.includes(lc.id))
        .map(c => ({ ...c, status: computeStatus(c) }));
      return [...formatted, ...extras];
    }
  } catch (err) {
    console.warn('Competitions DB fetch fallback:', err);
  }

  // Combine default with custom and exclude deleted
  const baseMap = new Map<string, Competition>();
  DEFAULT_COMPETITIONS.forEach(c => {
    if (!deletedIds.includes(c.id) && !deletedIds.includes(c.slug)) {
      baseMap.set(c.id, { ...c, status: computeStatus(c) });
    }
  });
  localCustom.forEach(c => {
    if (!deletedIds.includes(c.id)) {
      baseMap.set(c.id, { ...c, status: computeStatus(c) });
    }
  });

  return Array.from(baseMap.values()).sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
}

export async function createCompetition(compData: Partial<Competition>): Promise<Competition> {
  const newId = crypto.randomUUID();
  const slug = compData.slug || compData.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `comp-${Date.now()}`;

  const newComp: Competition = {
    id: newId,
    slug,
    title: compData.title || 'Untitled Competition',
    subtitle: compData.subtitle || '',
    description: compData.description || '',
    category: compData.category || 'robotics_open',
    format: compData.format || 'hybrid',
    status: compData.status || 'upcoming',
    start_date: compData.start_date || new Date().toISOString(),
    end_date: compData.end_date || new Date(Date.now() + 7 * 86400000).toISOString(),
    registration_deadline: compData.registration_deadline,
    location: compData.location || 'Harare, Zimbabwe',
    image_url: compData.image_url || 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=80',
    banner_url: compData.banner_url || compData.image_url,
    registration_link: compData.registration_link || '/competition/participant',
    internal_route: compData.internal_route,
    prize_pool: compData.prize_pool || '$5,000',
    entry_fee: compData.entry_fee || 0,
    currency: compData.currency || 'USD',
    max_teams: compData.max_teams || 50,
    registered_teams_count: 0,
    eligibility: compData.eligibility || 'Open to all youth and students',
    rules_summary: compData.rules_summary || '',
    is_featured: !!compData.is_featured,
    display_order: compData.display_order || 10,
    tags: compData.tags || [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  // Try saving to Supabase
  try {
    const { error } = await supabase.from('competitions').insert({
      id: newComp.id,
      slug: newComp.slug,
      title: newComp.title,
      subtitle: newComp.subtitle,
      description: newComp.description,
      category: newComp.category,
      format: newComp.format,
      status: newComp.status,
      start_date: newComp.start_date,
      end_date: newComp.end_date,
      registration_deadline: newComp.registration_deadline,
      location: newComp.location,
      image_url: newComp.image_url,
      banner_url: newComp.banner_url,
      registration_link: newComp.registration_link,
      internal_route: newComp.internal_route,
      prize_pool: newComp.prize_pool,
      entry_fee: newComp.entry_fee,
      currency: newComp.currency,
      max_teams: newComp.max_teams,
      registered_teams_count: newComp.registered_teams_count,
      eligibility: newComp.eligibility,
      rules_summary: newComp.rules_summary,
      is_featured: newComp.is_featured,
      display_order: newComp.display_order,
      tags: newComp.tags
    });
    if (error) console.warn('Supabase create competition note:', error.message);
  } catch (err) {
    console.warn('Supabase insert failed, persisting to local store:', err);
  }

  // Update local storage
  const locals = getLocalCustomCompetitions();
  saveLocalCustomCompetitions([newComp, ...locals]);

  return newComp;
}

export async function updateCompetition(id: string, updates: Partial<Competition>): Promise<Competition | null> {
  const payload = {
    ...updates,
    updated_at: new Date().toISOString()
  };

  // Update Supabase
  try {
    const { error } = await supabase
      .from('competitions')
      .update(payload)
      .eq('id', id);
    if (error) console.warn('Supabase update note:', error.message);
  } catch (err) {
    console.warn('Supabase update failed:', err);
  }

  // Update localStorage
  const locals = getLocalCustomCompetitions();
  const existingIdx = locals.findIndex(l => l.id === id);
  if (existingIdx >= 0) {
    locals[existingIdx] = { ...locals[existingIdx], ...payload };
    saveLocalCustomCompetitions(locals);
  } else {
    // If it was a default competition, save its override
    const defaultOne = DEFAULT_COMPETITIONS.find(d => d.id === id);
    if (defaultOne) {
      saveLocalCustomCompetitions([{ ...defaultOne, ...payload }, ...locals]);
    }
  }

  const all = await getCompetitions();
  return all.find(c => c.id === id) || null;
}

export async function deleteCompetition(id: string): Promise<boolean> {
  // Mark in deletedIds
  const deletedIds = getDeletedIds();
  if (!deletedIds.includes(id)) {
    deletedIds.push(id);
    localStorage.setItem(DELETED_KEY, JSON.stringify(deletedIds));
  }

  // Remove from custom local list
  const locals = getLocalCustomCompetitions();
  saveLocalCustomCompetitions(locals.filter(l => l.id !== id));

  // Delete from Supabase
  try {
    await supabase.from('competitions').delete().eq('id', id);
  } catch (err) {
    console.warn('Supabase delete competition error:', err);
  }

  return true;
}

export async function clearAllCompetitions(): Promise<boolean> {
  saveLocalCustomCompetitions([]);
  try {
    await supabase.from('competitions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  } catch (err) {
    console.warn('Supabase clear all competitions error:', err);
  }
  return true;
}
