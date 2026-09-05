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
}

const KITS_KEY = 'yara_custom_hardware_kits';
const DOCS_KEY = 'yara_custom_documents';

export const getCustomKits = (): CustomHardwareKit[] => {
  try {
    const data = localStorage.getItem(KITS_KEY);
    return data ? JSON.parse(data) : [];
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
  localStorage.setItem(KITS_KEY, JSON.stringify(kits));
  return newKit;
};

export const deleteCustomKit = (id: string): void => {
  const kits = getCustomKits();
  localStorage.setItem(KITS_KEY, JSON.stringify(kits.filter(k => k.id !== id)));
};

export const getCustomDocuments = (): CustomDocument[] => {
  try {
    const data = localStorage.getItem(DOCS_KEY);
    return data ? JSON.parse(data) : [];
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
  localStorage.setItem(DOCS_KEY, JSON.stringify(docs));
  return newDoc;
};

export const deleteCustomDocument = (id: string): void => {
  const docs = getCustomDocuments();
  localStorage.setItem(DOCS_KEY, JSON.stringify(docs.filter(d => d.id !== id)));
};
