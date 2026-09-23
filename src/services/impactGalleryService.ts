import { supabase } from '../lib/supabase';
import { ImpactGallery } from '../types/impactGallery';
import { ASSETS } from '../constants/assets';

const STORAGE_KEY = 'yara_impact_galleries_store';
const DELETED_KEY = 'yara_deleted_impact_gallery_ids';

export const INITIAL_IMPACT_GALLERIES: ImpactGallery[] = [
  {
    id: 'mashwest_2025_gallery',
    title: '2025 Impact Outreach: Mashwest Province Gallery',
    subtitle: 'Chinhoyi, Karoi & Banket Hands-On Robotics & AI Bootcamp',
    province: 'Mashonaland West',
    year: 2025,
    description: 'Hands-on STEM and autonomous robotics training delivered across high schools, primary schools, and community youth hubs in Mashonaland West Province. Over 450 students built ESP32 micro-rovers and learned C++ firmware logic.',
    cover_image_url: ASSETS.OUTREACH[0] || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80',
    video_url: 'https://www.youtube.com/watch?v=FCMxA3m_Imc',
    gallery_urls: [
      ASSETS.OUTREACH[0] || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80',
      ASSETS.OUTREACH[1] || 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?auto=format&fit=crop&w=1200&q=80',
      ASSETS.OUTREACH[2] || 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1200&q=80',
      ASSETS.OUTREACH[3] || 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=80',
      ASSETS.OUTREACH[4] || 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1200&q=80',
      ASSETS.OUTREACH[5] || 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=1200&q=80'
    ],
    achievements: [
      '450+ Youth Trained in Micro-Rover Fabrication',
      '62% Female Student Participation Rate',
      '12 High School Robotics Clubs Established',
      '3 Provincial Competition Qualifying Teams'
    ],
    people_reached: 450,
    girls_reached: 280,
    boys_reached: 170,
    schools_impacted: 14,
    is_featured: true,
    created_at: new Date('2025-11-15').toISOString(),
    updated_at: new Date('2025-11-15').toISOString()
  }
];

function getDeletedGalleryIds(): string[] {
  try {
    const raw = localStorage.getItem(DELETED_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function getLocalGalleries(): ImpactGallery[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalGalleries(list: ImpactGallery[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch (e) {
    console.warn('Error saving local impact galleries:', e);
  }
}

export async function getImpactGalleries(): Promise<ImpactGallery[]> {
  const deletedIds = getDeletedGalleryIds();
  const localList = getLocalGalleries();

  const galleryMap = new Map<string, ImpactGallery>();

  INITIAL_IMPACT_GALLERIES.forEach(gal => {
    if (!deletedIds.includes(gal.id)) {
      galleryMap.set(gal.id, gal);
    }
  });

  localList.forEach(gal => {
    if (!deletedIds.includes(gal.id)) {
      galleryMap.set(gal.id, gal);
    }
  });

  try {
    const { data, error } = await supabase
      .from('impact_galleries')
      .select('*')
      .order('year', { ascending: false });

    if (!error && data && data.length > 0) {
      data.forEach((item: any) => {
        if (!deletedIds.includes(item.id)) {
          galleryMap.set(item.id, {
            id: item.id,
            title: item.title,
            subtitle: item.subtitle || '',
            province: item.province || 'Mashonaland West',
            year: item.year || 2025,
            description: item.description || '',
            cover_image_url: item.cover_image_url || ASSETS.OUTREACH[0],
            video_url: item.video_url || '',
            gallery_urls: Array.isArray(item.gallery_urls) ? item.gallery_urls : [],
            achievements: Array.isArray(item.achievements) ? item.achievements : [],
            people_reached: item.people_reached || 0,
            girls_reached: item.girls_reached || 0,
            boys_reached: item.boys_reached || 0,
            schools_impacted: item.schools_impacted || 0,
            is_featured: !!item.is_featured,
            created_at: item.created_at || new Date().toISOString(),
            updated_at: item.updated_at || new Date().toISOString()
          });
        }
      });
    }
  } catch (err) {
    console.warn('Supabase fetch impact galleries notice:', err);
  }

  return Array.from(galleryMap.values());
}

export async function saveImpactGallery(gal: Partial<ImpactGallery>): Promise<ImpactGallery> {
  const newId = gal.id || `gal_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  
  const savedGallery: ImpactGallery = {
    id: newId,
    title: gal.title || 'Untitled Impact Outreach Gallery',
    subtitle: gal.subtitle || '',
    province: gal.province || 'Mashonaland West',
    year: gal.year || 2025,
    description: gal.description || '',
    cover_image_url: gal.cover_image_url || ASSETS.OUTREACH[0],
    video_url: gal.video_url || '',
    gallery_urls: gal.gallery_urls || [],
    achievements: gal.achievements || [],
    people_reached: gal.people_reached || 0,
    girls_reached: gal.girls_reached || 0,
    boys_reached: gal.boys_reached || 0,
    schools_impacted: gal.schools_impacted || 0,
    is_featured: gal.is_featured !== undefined ? gal.is_featured : true,
    created_at: gal.created_at || new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  const locals = getLocalGalleries();
  const idx = locals.findIndex(g => g.id === newId);
  if (idx >= 0) {
    locals[idx] = savedGallery;
  } else {
    locals.unshift(savedGallery);
  }
  saveLocalGalleries(locals);

  try {
    await supabase.from('impact_galleries').upsert(savedGallery, { onConflict: 'id' });
  } catch (err) {
    console.warn('Supabase upsert impact gallery notice:', err);
  }

  return savedGallery;
}

export async function deleteImpactGallery(id: string): Promise<boolean> {
  const deleted = getDeletedGalleryIds();
  if (!deleted.includes(id)) {
    deleted.push(id);
    localStorage.setItem(DELETED_KEY, JSON.stringify(deleted));
  }

  const locals = getLocalGalleries().filter(g => g.id !== id);
  saveLocalGalleries(locals);

  try {
    await supabase.from('impact_galleries').delete().eq('id', id);
  } catch (err) {
    console.warn('Supabase delete impact gallery notice:', err);
  }

  return true;
}

export const impactGalleryService = {
  getAllGalleries: getImpactGalleries,
  getImpactGalleries,
  saveImpactGallery,
  deleteImpactGallery
};
