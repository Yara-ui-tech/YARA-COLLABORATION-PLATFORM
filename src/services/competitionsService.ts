import { supabase } from '../lib/supabase';
import { Competition } from '../types/competition';

const STORAGE_KEY = 'yara_custom_competitions';
const DELETED_KEY = 'yara_deleted_competition_ids';

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
    return raw ? JSON.parse(raw) : [];
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

export async function getCompetitions(): Promise<Competition[]> {
  const deletedIds = getDeletedIds();
  const localCustom = getLocalCustomCompetitions();

  try {
    const { data, error } = await supabase
      .from('competitions')
      .select('*')
      .order('display_order', { ascending: true })
      .order('start_date', { ascending: true });

    if (!error && data) {
      // Merge with custom fields and ensure defaults
      const formatted: Competition[] = data
        .filter(c => !deletedIds.includes(c.id) && !deletedIds.includes(c.slug))
        .map((c: any) => ({
          id: c.id,
          slug: c.slug || c.id,
          title: c.title,
          subtitle: c.subtitle || '',
          description: c.description || '',
          category: c.category || 'flagship_robotics',
          format: c.format || 'hybrid',
          status: c.status || 'upcoming',
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
      const extras = localCustom.filter(lc => !dbIds.has(lc.id) && !deletedIds.includes(lc.id));
      return [...formatted, ...extras];
    }
  } catch (err) {
    console.warn('Competitions DB fetch fallback:', err);
  }

  // Return only local custom competitions (no hardcoded defaults)
  return localCustom.filter(c => !deletedIds.includes(c.id));
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
