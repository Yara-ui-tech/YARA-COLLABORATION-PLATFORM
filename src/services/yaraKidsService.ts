import { supabase } from '../lib/supabase';

export interface KidsVideo {
  id: string;
  title: string;
  description: string;
  video_url: string;
  thumbnail_url: string;
  age_group: string;
  category: string;
}

export interface KidsSong {
  id: string;
  title: string;
  audio_url: string;
  lyrics?: string;
  duration: string;
  category: string;
}

export interface KidsFlashcard {
  id: string;
  word: string;
  definition: string;
  image_url: string;
  fun_fact: string;
  category: string;
}

export interface KidsChallenge {
  id: string;
  title: string;
  description: string;
  difficulty: 'Easy' | 'Fun' | 'Super Hero';
  reward_stars: number;
  question: string;
  options: string[];
  correct_option: number;
}

export const DEFAULT_KIDS_VIDEOS: KidsVideo[] = [];
export const DEFAULT_KIDS_SONGS: KidsSong[] = [];
export const DEFAULT_KIDS_FLASHCARDS: KidsFlashcard[] = [];
export const DEFAULT_KIDS_CHALLENGES: KidsChallenge[] = [];

// Helper to fetch all kids content by type
export async function getKidsContentByType(contentType: 'video' | 'song' | 'flashcard' | 'challenge'): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('yara_kids_content')
      .select('*')
      .eq('type', contentType)
      .order('created_at', { ascending: false });

    if (data && data.length > 0 && !error) {
      if (contentType === 'video') {
        return data.map(d => ({
          id: d.id,
          title: d.title,
          description: d.description || '',
          video_url: d.media_url || d.video_url || '',
          thumbnail_url: d.thumbnail_url || 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=800&q=80',
          age_group: d.age_group || '3-8 Years',
          category: d.category || 'General STEM'
        }));
      }
      if (contentType === 'song') {
        return data.map(d => ({
          id: d.id,
          title: d.title,
          audio_url: d.media_url || d.audio_url || '',
          lyrics: d.lyrics || '',
          duration: d.duration || '2:00',
          category: d.category || 'Rhymes'
        }));
      }
      if (contentType === 'flashcard') {
        return data.map(d => ({
          id: d.id,
          word: d.word || d.title,
          definition: d.definition || d.description || '',
          image_url: d.thumbnail_url || d.media_url || 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=600&q=80',
          fun_fact: d.fun_fact || '',
          category: d.category || 'General'
        }));
      }
      if (contentType === 'challenge') {
        return data.map(d => ({
          id: d.id,
          title: d.title,
          description: d.description || '',
          difficulty: d.difficulty || 'Fun',
          reward_stars: d.reward_stars || 10,
          question: d.question || d.title,
          options: Array.isArray(d.options) ? d.options : ['Option 1', 'Option 2', 'Option 3'],
          correct_option: d.correct_option || 0
        }));
      }
    }
  } catch (e) {
    console.warn(`Error loading kids content for ${contentType}:`, e);
  }

  // Fallback defaults
  if (contentType === 'video') return DEFAULT_KIDS_VIDEOS;
  if (contentType === 'song') return DEFAULT_KIDS_SONGS;
  if (contentType === 'flashcard') return DEFAULT_KIDS_FLASHCARDS;
  return DEFAULT_KIDS_CHALLENGES;
}

export async function addKidsContentItem(item: any): Promise<any> {
  try {
    const { data, error } = await supabase
      .from('yara_kids_content')
      .insert([item])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (e) {
    console.warn('DB insert fallback for kids content:', e);
    return { ...item, id: `kids-${Date.now()}` };
  }
}

export async function deleteKidsContentItem(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('yara_kids_content')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (e) {
    console.warn('Error deleting kids content item:', e);
    return false;
  }
}

