import { supabase } from '../lib/supabase';

export interface CustomHardwareKit {
  id: string;
  title: string;
  subtitle: string;
  priceUsd: number;
  description: string;
  imageUrl: string; 
  includedComponents: string[];
}

export interface CustomDocument {
  id: string;
  title: string;
  desc: string;
  type: string; 
  category: string; 
  fileUrl: string; 
  imageUrl?: string;
}

const KITS_KEY = 'yara_custom_hardware_kits';
const DOCS_KEY = 'yara_custom_documents';

let inMemoryKits: CustomHardwareKit[] | null = null;
let inMemoryDocs: CustomDocument[] | null = null;

/**
 * Fetch custom hardware kits from Supabase system_settings so all users see custom kits.
 */
export async function fetchCustomKitsFromDatabase(): Promise<CustomHardwareKit[]> {
  try {
    const { data, error } = await supabase
      .from('system_settings')
      .select('value')
      .eq('key', KITS_KEY)
      .maybeSingle();

    if (!error && data?.value) {
      const items = Array.isArray(data.value) ? data.value : data.value.kits;
      if (Array.isArray(items)) {
        inMemoryKits = items;
        try {
          localStorage.setItem(KITS_KEY, JSON.stringify(items));
        } catch {}
        return items;
      }
    }
  } catch (err) {
    console.warn('[resourcesService] Notice fetching custom kits from DB:', err);
  }

  if (inMemoryKits !== null) return inMemoryKits;
  try {
    const local = localStorage.getItem(KITS_KEY);
    if (local) {
      inMemoryKits = JSON.parse(local);
      return inMemoryKits || [];
    }
  } catch {}
  return [];
}

/**
 * Fetch custom learning documents from Supabase system_settings.
 */
export async function fetchCustomDocumentsFromDatabase(): Promise<CustomDocument[]> {
  try {
    const { data, error } = await supabase
      .from('system_settings')
      .select('value')
      .eq('key', DOCS_KEY)
      .maybeSingle();

    if (!error && data?.value) {
      const items = Array.isArray(data.value) ? data.value : data.value.documents;
      if (Array.isArray(items)) {
        inMemoryDocs = items;
        try {
          localStorage.setItem(DOCS_KEY, JSON.stringify(items));
        } catch {}
        return items;
      }
    }
  } catch (err) {
    console.warn('[resourcesService] Notice fetching custom documents from DB:', err);
  }

  if (inMemoryDocs !== null) return inMemoryDocs;
  try {
    const local = localStorage.getItem(DOCS_KEY);
    if (local) {
      inMemoryDocs = JSON.parse(local);
      return inMemoryDocs || [];
    }
  } catch {}
  return [];
}

// Background auto-hydration on service load
fetchCustomKitsFromDatabase().catch(() => {});
fetchCustomDocumentsFromDatabase().catch(() => {});

export const getCustomKits = (): CustomHardwareKit[] => {
  if (inMemoryKits !== null) return inMemoryKits;
  try {
    const data = localStorage.getItem(KITS_KEY);
    inMemoryKits = data ? JSON.parse(data) : [];
    return inMemoryKits || [];
  } catch (e) {
    return [];
  }
};

export const addCustomKit = (kit: Omit<CustomHardwareKit, 'id'>): CustomHardwareKit => {
  const kits = getCustomKits();
  const newKit: CustomHardwareKit = {
    ...kit,
    id: `kit_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
  };
  kits.push(newKit);
  inMemoryKits = kits;
  try {
    localStorage.setItem(KITS_KEY, JSON.stringify(kits));
  } catch {}

  // Sync to Supabase system_settings so all users on all devices see this kit
  supabase
    .from('system_settings')
    .upsert({
      key: KITS_KEY,
      value: { kits, updated_at: new Date().toISOString() },
      description: 'YARA Custom Assembled Starter & Component Kits'
    }, { onConflict: 'key' })
    .catch(err => console.warn('[resourcesService] Custom kit DB sync note:', err));

  return newKit;
};

export const deleteCustomKit = (id: string): void => {
  const kits = getCustomKits().filter(k => k.id !== id);
  inMemoryKits = kits;
  try {
    localStorage.setItem(KITS_KEY, JSON.stringify(kits));
  } catch {}

  supabase
    .from('system_settings')
    .upsert({
      key: KITS_KEY,
      value: { kits, updated_at: new Date().toISOString() },
      description: 'YARA Custom Assembled Starter & Component Kits'
    }, { onConflict: 'key' })
    .catch(err => console.warn('[resourcesService] Custom kit delete DB sync note:', err));
};

export const getCustomDocuments = (): CustomDocument[] => {
  if (inMemoryDocs !== null) return inMemoryDocs;
  try {
    const data = localStorage.getItem(DOCS_KEY);
    inMemoryDocs = data ? JSON.parse(data) : [];
    return inMemoryDocs || [];
  } catch (e) {
    return [];
  }
};

export const addCustomDocument = (doc: Omit<CustomDocument, 'id'>): CustomDocument => {
  const docs = getCustomDocuments();
  const newDoc: CustomDocument = {
    ...doc,
    id: `doc_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
  };
  docs.push(newDoc);
  inMemoryDocs = docs;
  try {
    localStorage.setItem(DOCS_KEY, JSON.stringify(docs));
  } catch {}

  supabase
    .from('system_settings')
    .upsert({
      key: DOCS_KEY,
      value: { documents: docs, updated_at: new Date().toISOString() },
      description: 'YARA Educational Resources & Materials Catalog'
    }, { onConflict: 'key' })
    .catch(err => console.warn('[resourcesService] Custom doc DB sync note:', err));

  return newDoc;
};

export const deleteCustomDocument = (id: string): void => {
  const docs = getCustomDocuments().filter(d => d.id !== id);
  inMemoryDocs = docs;
  try {
    localStorage.setItem(DOCS_KEY, JSON.stringify(docs));
  } catch {}

  supabase
    .from('system_settings')
    .upsert({
      key: DOCS_KEY,
      value: { documents: docs, updated_at: new Date().toISOString() },
      description: 'YARA Educational Resources & Materials Catalog'
    }, { onConflict: 'key' })
    .catch(err => console.warn('[resourcesService] Custom doc delete DB sync note:', err));
};
