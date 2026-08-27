import { supabase } from '../lib/supabase';
import { Competition } from '../types/competition';

const STORAGE_KEY = 'yara_custom_competitions';
const DELETED_KEY = 'yara_deleted_competition_ids';

export const DEFAULT_COMPETITIONS: Competition[] = [
  {
    id: 'yara-2026-flagship',
    slug: 'yara-2026',
    title: 'YARA Educational Robotics Competition 2026',
    subtitle: '“Engineering Opportunity: Robotics and Autonomous Innovation for Underserved Youth”',
    description: 'The premier continental robotics and STEM championship. Features Underwater Drone Navigation (35%), Autonomous Maze Solving (35%), and Community Innovation Pitches (30%). Teams must strictly comprise 4+ members with a balanced 2 Boys + 2 Girls gender parity ratio.',
    category: 'flagship_robotics',
    format: 'hybrid',
    status: 'upcoming',
    start_date: '2026-10-16T08:00:00.000Z',
    end_date: '2026-10-18T18:00:00.000Z',
    registration_deadline: '2026-09-30T23:59:59.000Z',
    location: 'YARA National Science Arena & Innovation Pool, Harare',
    image_url: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=80',
    banner_url: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1600&q=80',
    internal_route: '/competitions/yara-2026',
    registration_link: '/competition/participant',
    prize_pool: '$15,000 Prize Pool & STEM Grants',
    entry_fee: 0.00,
    currency: 'USD',
    max_teams: 64,
    registered_teams_count: 14,
    eligibility: 'High Schools, Polytechnics, Universities, and Community Youth Chapters (Mandatory 2B + 2G ratio)',
    rules_summary: 'Underwater Drone buoyancy payload recovery (35%), Micromouse ultrasonic maze solving (35%), and Community Impact technology pitch (30%).',
    is_featured: true,
    display_order: 1,
    tags: ['Flagship', 'Underwater ROV', 'Autonomous Navigation', 'Innovation Pitch']
  },
  {
    id: 'yara-underwater-rov-open',
    slug: 'underwater-rov-challenge',
    title: 'YARA Aquatic ROV & Submersible Navigation Open',
    subtitle: 'Underwater Marine Telemetry, Waterproofing & Depth Buoyancy Challenge',
    description: 'Specialized aquatic robotics championship focused on submersible exploration, underwater acoustics, brushless thruster control, and ecological water sensor retrieval in deep pool courses.',
    category: 'underwater_rov',
    format: 'in_person',
    status: 'upcoming',
    start_date: '2026-11-06T09:00:00.000Z',
    end_date: '2026-11-07T17:00:00.000Z',
    registration_deadline: '2026-10-25T23:59:59.000Z',
    location: 'Lake Chivero Aquatic Science Centre & Training Pool',
    image_url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1200&q=80',
    banner_url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1600&q=80',
    internal_route: '/competitions/yara-2026',
    registration_link: '/competition/participant',
    prize_pool: '$5,000 + Aquatic Electronics Toolkits',
    entry_fee: 0.00,
    currency: 'USD',
    max_teams: 32,
    registered_teams_count: 8,
    eligibility: 'Student robotics teams with functional waterproof submersibles',
    rules_summary: 'Submersible must perform submerged pipe inspections, retrieve seabed markers at 3.5m depth, and beam live optical telemetry.',
    is_featured: true,
    display_order: 2,
    tags: ['Aquatic Drone', 'Waterproofing', 'Marine Tech', 'Telemetry']
  },
  {
    id: 'yara-maze-derby-2026',
    slug: 'high-school-maze-derby',
    title: 'National High School Autonomous Maze Derby 2026',
    subtitle: 'Precision Micromouse, Wall Following & Speed Labyrinth Solving',
    description: 'High-octane autonomous rover race where high school teams code ground robots to navigate complex dynamic labyrinths using ultrasonic, LiDAR, and PID loop algorithms.',
    category: 'autonomous_vehicles',
    format: 'in_person',
    status: 'upcoming',
    start_date: '2026-09-25T08:30:00.000Z',
    end_date: '2026-09-26T16:30:00.000Z',
    registration_deadline: '2026-09-15T23:59:59.000Z',
    location: 'National University of Science & Technology (NUST), Bulawayo',
    image_url: 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?auto=format&fit=crop&w=1200&q=80',
    banner_url: 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?auto=format&fit=crop&w=1600&q=80',
    internal_route: '/competitions/yara-2026',
    registration_link: '/competition/participant',
    prize_pool: '$3,500 STEM Equipment Grants',
    entry_fee: 0.00,
    currency: 'USD',
    max_teams: 40,
    registered_teams_count: 14,
    eligibility: 'All high school chapters across Zimbabwe’s 10 provinces',
    rules_summary: 'Strictly zero manual control. Time penalties applied for collisions. Best 2 out of 3 runs scored.',
    is_featured: false,
    display_order: 3,
    tags: ['Micromouse', 'High School', 'PID Control', 'Sensors']
  },
  {
    id: 'yara-smart-agri-hack',
    slug: 'smart-agro-hackathon',
    title: 'Zimbabwe Smart Agro-Robotics & Drone Hackathon',
    subtitle: 'Autonomous Agriculture: Precision Spraying, Crop Disease AI & Solar Irrigation',
    description: 'Practical hackathon tackling real food security challenges across rural and commercial farming through affordable agro-drones, sensor networks, and autonomous harvesters.',
    category: 'hackathon',
    format: 'hybrid',
    status: 'upcoming',
    start_date: '2026-11-20T08:00:00.000Z',
    end_date: '2026-11-22T18:00:00.000Z',
    registration_deadline: '2026-11-10T23:59:59.000Z',
    location: 'Chinhoyi University of Technology (CUT) Innovation Hub',
    image_url: 'https://images.unsplash.com/photo-1586771107445-d3ca888129ff?auto=format&fit=crop&w=1200&q=80',
    banner_url: 'https://images.unsplash.com/photo-1586771107445-d3ca888129ff?auto=format&fit=crop&w=1600&q=80',
    internal_route: '/competitions/yara-2026',
    registration_link: '/competition/participant',
    prize_pool: '$7,500 AgTech Commercialization Seed Fund',
    entry_fee: 0.00,
    currency: 'USD',
    max_teams: 30,
    registered_teams_count: 6,
    eligibility: 'Open to youth innovators, tertiary students, and agrarian innovators',
    rules_summary: 'Deploy hardware and computer vision prototypes tested on crop beds or calibrated simulation rigs.',
    is_featured: false,
    display_order: 4,
    tags: ['Agro-Tech', 'Drones', 'IoT', 'Food Security']
  }
];

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

    if (!error && data && data.length > 0) {
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

  // Combine default with custom and exclude deleted
  const baseMap = new Map<string, Competition>();
  DEFAULT_COMPETITIONS.forEach(c => {
    if (!deletedIds.includes(c.id) && !deletedIds.includes(c.slug)) {
      baseMap.set(c.id, c);
    }
  });
  localCustom.forEach(c => {
    if (!deletedIds.includes(c.id)) {
      baseMap.set(c.id, c);
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
