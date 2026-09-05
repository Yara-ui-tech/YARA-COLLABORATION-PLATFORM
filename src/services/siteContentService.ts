import { supabase } from '../lib/supabase';

export type SectionType = 
  | 'hero_banner'
  | 'feature_grid'
  | 'text_block'
  | 'card_list'
  | 'faq_accordion'
  | 'call_to_action'
  | 'stats_counter'
  | 'custom_html';

export type PageTarget = 
  | 'all'
  | 'home'
  | 'about'
  | 'programs'
  | 'resources'
  | 'events'
  | 'competitions'
  | 'contact';

export interface SiteSectionItem {
  id: string;
  title: string;
  description?: string;
  icon?: string;
  imageUrl?: string;
  linkUrl?: string;
  linkText?: string;
  badge?: string;
}

export interface SiteContentSection {
  id: string;
  page: PageTarget;
  sectionType: SectionType;
  title: string;
  subtitle?: string;
  content?: string;
  badgeText?: string;
  themeColor?: string; // 'indigo' | 'emerald' | 'amber' | 'rose' | 'slate' | 'violet' | 'cyan'
  imageUrl?: string;
  ctaText?: string;
  ctaLink?: string;
  secondaryCtaText?: string;
  secondaryCtaLink?: string;
  items?: SiteSectionItem[];
  sortOrder: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

const STORAGE_KEY = 'yaria_site_content_sections';

// Default built-in starter sections that can be edited or removed by admin
const DEFAULT_SECTIONS: SiteContentSection[] = [
  {
    id: 'sec_home_announcement',
    page: 'home',
    sectionType: 'hero_banner',
    title: 'Pan-African Robotics & AI Challenge 2026',
    subtitle: 'Registrations are now open for teams and mentors across Africa.',
    badgeText: '🌟 Major Announcement',
    themeColor: 'indigo',
    content: 'Join over 5,000 innovators building high-impact robotics, IoT, and embedded AI solutions tailored for African industry and agriculture.',
    ctaText: 'Register Competition Team',
    ctaLink: '/competitions',
    secondaryCtaText: 'Download Starter Kit',
    secondaryCtaLink: '/resources',
    sortOrder: 1,
    isActive: true
  },
  {
    id: 'sec_home_pillars',
    page: 'home',
    sectionType: 'feature_grid',
    title: 'Why Innovators Choose YARA',
    subtitle: 'A fully integrated ecosystem designed to transition African youth from learners to creators.',
    badgeText: 'Core Pillars',
    themeColor: 'emerald',
    items: [
      {
        id: 'p1',
        title: 'Hardware-First Learning',
        description: 'Hands-on kits with ESP32, Arduino, and sensors shipped directly to school labs and university clubs.',
        badge: 'Hands-on'
      },
      {
        id: 'p2',
        title: '1-on-1 Expert Mentorship',
        description: 'Direct live office hours and code reviews with senior robotics and embedded systems engineers.',
        badge: 'Mentorship'
      },
      {
        id: 'p3',
        title: 'Institutional Certification',
        description: 'Verifiable cryptographic credentials accredited for academic portfolios and global engineering roles.',
        badge: 'Accredited'
      }
    ],
    sortOrder: 2,
    isActive: true
  },
  {
    id: 'sec_about_mission',
    page: 'about',
    sectionType: 'text_block',
    title: 'Our Vision for 2030',
    subtitle: 'Nurturing 100,000 African Hardware & AI Engineers',
    badgeText: 'Strategic Roadmap',
    themeColor: 'violet',
    content: 'YARA was founded to bridge the critical hardware engineering and robotics deficit in sub-Saharan Africa. By equipping educators, distributing accessible modular hardware kits, and establishing high-school chapters, we empower African problem-solvers to invent local solutions for agriculture, renewable energy, and industrial automation.',
    ctaText: 'Join a Chapter',
    ctaLink: '/chapters',
    sortOrder: 1,
    isActive: true
  },
  {
    id: 'sec_programs_faq',
    page: 'programs',
    sectionType: 'faq_accordion',
    title: 'Frequently Asked Questions',
    subtitle: 'Everything you need to know about our curriculums, tiers, and certification.',
    badgeText: 'Got Questions?',
    themeColor: 'cyan',
    items: [
      {
        id: 'faq_1',
        title: 'Who can join the YARA Robotics Academy?',
        description: 'Anyone from primary school juniors (Tier 1-2) to tertiary university researchers (Tier 5-6) and accredited STEM educators.'
      },
      {
        id: 'faq_2',
        title: 'Do I need physical hardware kits to participate?',
        description: 'You can start with our interactive simulators (Wokwi & Virtual Lab), and request subsidized hardware kits delivered to your local chapter or institution.'
      },
      {
        id: 'faq_3',
        title: 'How does the certificate verification work?',
        description: 'Every certificate comes with a cryptographic verification hash queryable at /verify-certificate.'
      }
    ],
    sortOrder: 3,
    isActive: true
  }
];

export const getSiteSections = async (page?: PageTarget): Promise<SiteContentSection[]> => {
  let sections: SiteContentSection[] = [];

  // 1. Try fetching from Supabase system_settings
  try {
    const { data, error } = await supabase
      .from('system_settings')
      .select('value')
      .eq('key', 'site_content_sections')
      .maybeSingle();

    if (!error && data?.value && Array.isArray(data.value)) {
      sections = data.value;
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(sections));
      }
    } else {
      const local = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
      if (local) {
        sections = JSON.parse(local);
      } else {
        sections = DEFAULT_SECTIONS;
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_SECTIONS));
        }
      }
    }
  } catch {
    const local = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
    sections = local ? JSON.parse(local) : DEFAULT_SECTIONS;
  }

  // Filter by target page if specified
  if (page && page !== 'all') {
    return sections
      .filter(s => (s.page === page || s.page === 'all') && s.isActive)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }

  return sections.sort((a, b) => a.sortOrder - b.sortOrder);
};

export const getAllSiteSectionsForAdmin = async (): Promise<SiteContentSection[]> => {
  try {
    const { data, error } = await supabase
      .from('system_settings')
      .select('value')
      .eq('key', 'site_content_sections')
      .maybeSingle();

    if (!error && data?.value && Array.isArray(data.value)) {
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data.value));
      }
      return (data.value as SiteContentSection[]).sort((a, b) => a.sortOrder - b.sortOrder);
    }
  } catch {
    // fallback
  }

  const local = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
  if (local) {
    try {
      return (JSON.parse(local) as SiteContentSection[]).sort((a, b) => a.sortOrder - b.sortOrder);
    } catch {
      return DEFAULT_SECTIONS;
    }
  }

  return DEFAULT_SECTIONS;
};

export const saveSiteSections = async (sections: SiteContentSection[]): Promise<boolean> => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sections));
  }

  try {
    const { error } = await supabase
      .from('system_settings')
      .upsert({
        key: 'site_content_sections',
        value: sections,
        updated_at: new Date().toISOString()
      }, { onConflict: 'key' });

    if (error) {
      console.warn('Could not sync sections to remote DB:', error.message);
    }
    return true;
  } catch (err) {
    console.warn('Network notice while saving sections:', err);
    return true;
  }
};

export const addSiteSection = async (section: Omit<SiteContentSection, 'id'>): Promise<SiteContentSection> => {
  const current = await getAllSiteSectionsForAdmin();
  const newSection: SiteContentSection = {
    ...section,
    id: `sec_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    sortOrder: section.sortOrder ?? (current.length + 1),
    isActive: section.isActive ?? true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const updated = [...current, newSection];
  await saveSiteSections(updated);
  return newSection;
};

export const updateSiteSection = async (id: string, updates: Partial<SiteContentSection>): Promise<SiteContentSection | null> => {
  const current = await getAllSiteSectionsForAdmin();
  let found: SiteContentSection | null = null;
  const updated = current.map(item => {
    if (item.id === id) {
      found = { ...item, ...updates, updatedAt: new Date().toISOString() };
      return found;
    }
    return item;
  });

  if (found) {
    await saveSiteSections(updated);
  }
  return found;
};

export const deleteSiteSection = async (id: string): Promise<boolean> => {
  const current = await getAllSiteSectionsForAdmin();
  const updated = current.filter(item => item.id !== id);
  await saveSiteSections(updated);
  return true;
};

export const toggleSectionStatus = async (id: string, isActive: boolean): Promise<boolean> => {
  await updateSiteSection(id, { isActive });
  return true;
};
