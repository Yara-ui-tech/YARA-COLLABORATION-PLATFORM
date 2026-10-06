import { ASSETS } from '../constants/assets';

export interface CertificateTemplate {
  id: string;
  name: string;
  section: string;
  subtitle: string;
  description: string;
  recipient_label: string;
  completion_text: string;
  
  // Brand Corporate Colors (from YARA Logo)
  primary_color: string;   // Deep Navy #0f172a
  secondary_color: string; // Royal Blue #0b4ea2
  accent_color: string;    // Gold / Amber #f59e0b
  
  // Logo & Branding
  logo_url?: string;       // Default: ASSETS.LOGO
  
  // Seal Configuration (Editable)
  seal_enabled?: boolean;
  seal_type?: 'gold_embossed' | 'royal_navy' | 'gold_ribbon' | 'emerald_verified';
  seal_label?: string;
  seal_emblem_text?: string;
  
  // Background Pattern & Watermark (Editable)
  bg_pattern?: 'guilloche' | 'circuit' | 'crest_waves' | 'minimal';
  watermark_enabled?: boolean;
  watermark_text?: string;
  watermark_opacity?: number;
  
  // Partner Training & Co-Branding (Editable)
  has_partner?: boolean;
  partner_name?: string;
  partner_logo_url?: string;
  partner_badge_label?: string;
  
  // Signatories (Editable)
  signatory_1_name: string;
  signatory_1_title: string;
  signatory_1_signature_url?: string;
  
  signatory_2_name: string;
  signatory_2_title: string;
  signatory_2_signature_url?: string;
  
  signatory_partner_name?: string;
  signatory_partner_title?: string;
  signatory_partner_signature_url?: string;
  
  footer_text: string;
  badge_text: string;
  is_active: boolean;
}

export const STORAGE_KEY = 'yara_certificate_templates';

export const DEFAULT_TEMPLATES: CertificateTemplate[] = [
  {
    id: 'cert-lms-robotics',
    name: 'YARA Robotics LMS Certificate',
    section: 'Learning Academy & LMS',
    subtitle: 'Completion of Robotics Learning Management System Programme',
    description: 'Awarded to learners who complete the YARA Robotics Academy modules, including embedded systems, drone telemetry, and autonomous robotics.',
    recipient_label: 'This is to certify that',
    completion_text: 'has successfully completed the YARA Robotics Academy LMS Programme and demonstrated proficiency in robotics engineering, embedded systems, and autonomous systems design.',
    primary_color: '#0f172a',
    secondary_color: '#0b4ea2',
    accent_color: '#f59e0b',
    logo_url: ASSETS.LOGO,
    seal_enabled: true,
    seal_type: 'gold_embossed',
    seal_label: '★ VERIFIED ★ CERTIFICATE',
    seal_emblem_text: 'Y',
    bg_pattern: 'guilloche',
    watermark_enabled: true,
    watermark_text: 'YARA',
    watermark_opacity: 0.06,
    has_partner: false,
    signatory_1_name: 'Eng. T. Chidzero',
    signatory_1_title: 'National Director, YARA Academy',
    signatory_1_signature_url: ASSETS.SIGNATURE_MANONGWA,
    signatory_2_name: 'Mr. S.O. Manongwa',
    signatory_2_title: 'Lead Robotics Instructor & Patron',
    signatory_2_signature_url: ASSETS.SIGNATURE_CHIAMBIRO,
    footer_text: 'YARA — Young African Robotics Association | yara.org.zw',
    badge_text: 'ROBOTICS',
    is_active: true
  },
  {
    id: 'cert-coding',
    name: 'YARA Coding & Programming Certificate',
    section: 'Coding Bootcamp & Software',
    subtitle: 'Certificate of Completion — Coding & Software Engineering Track',
    description: 'Awarded to participants who complete the YARA Coding curriculum covering Python, C++, web development, and application engineering.',
    recipient_label: 'This certifies that',
    completion_text: 'has demonstrated mastery of programming fundamentals, software design principles, and practical computational thinking through the YARA Coding & Programming Track.',
    primary_color: '#0f172a',
    secondary_color: '#0b4ea2',
    accent_color: '#10b981',
    logo_url: ASSETS.LOGO,
    seal_enabled: true,
    seal_type: 'emerald_verified',
    seal_label: '★ VERIFIED ★ PROGRAMMING',
    seal_emblem_text: '</>',
    bg_pattern: 'circuit',
    watermark_enabled: true,
    watermark_text: 'YARA CODE',
    watermark_opacity: 0.05,
    has_partner: false,
    signatory_1_name: 'Eng. T. Chidzero',
    signatory_1_title: 'National Director, YARA Academy',
    signatory_1_signature_url: ASSETS.SIGNATURE_MANONGWA,
    signatory_2_name: 'Ms. R. Mutongi',
    signatory_2_title: 'Lead Software Instructor, YARA',
    signatory_2_signature_url: ASSETS.SIGNATURE_CHIAMBIRO,
    footer_text: 'YARA — Young African Robotics Association | yara.org.zw',
    badge_text: 'PROGRAMMING',
    is_active: true
  },
  {
    id: 'cert-ai-educators',
    name: 'AI for Educators Certificate',
    section: 'Educator Portal & AI Bootcamp',
    subtitle: 'Certificate of Completion — Artificial Intelligence for Educators Programme',
    description: 'Awarded to educators who complete the YARA AI for Educators bootcamp, equipping them with skills to teach AI concepts in schools and communities across Zimbabwe.',
    recipient_label: 'This is to certify that',
    completion_text: 'has successfully completed the AI for Educators Programme and is now accredited to deliver foundational Artificial Intelligence and STEM education in their institution.',
    primary_color: '#0f172a',
    secondary_color: '#0b4ea2',
    accent_color: '#f59e0b',
    logo_url: ASSETS.LOGO,
    seal_enabled: true,
    seal_type: 'gold_embossed',
    seal_label: '★ VERIFIED ★ AI EDUCATOR',
    seal_emblem_text: 'Y',
    bg_pattern: 'guilloche',
    watermark_enabled: true,
    watermark_text: 'AI EDU',
    watermark_opacity: 0.06,
    has_partner: true,
    partner_name: 'Ministry of Primary & Secondary Education STEM Initiative',
    partner_badge_label: 'Endorsed in Partnership With',
    signatory_1_name: 'Eng. T. Chidzero',
    signatory_1_title: 'National Director, YARA Academy',
    signatory_1_signature_url: ASSETS.SIGNATURE_MANONGWA,
    signatory_2_name: 'Prof. M. Chikosi',
    signatory_2_title: 'AI Programme Lead, YARA',
    signatory_2_signature_url: ASSETS.SIGNATURE_CHIAMBIRO,
    signatory_partner_name: 'Director of STEM Education',
    signatory_partner_title: 'National Ministry of Education Patron',
    footer_text: 'YARA — Young African Robotics Association | yara.org.zw',
    badge_text: 'AI EDU',
    is_active: true
  },
  {
    id: 'cert-capstone',
    name: 'YARA Capstone Project Certificate',
    section: 'Hardware & Capstone Projects',
    subtitle: 'Certificate of Excellence — Capstone Innovation Project',
    description: 'Awarded to teams and individuals who successfully design, build, and present a completed capstone robotics or technology project.',
    recipient_label: 'This certifies that',
    completion_text: 'has successfully designed, built, and defended a Capstone Innovation Project, demonstrating exceptional engineering skill, teamwork, and creative problem-solving.',
    primary_color: '#0f172a',
    secondary_color: '#0b4ea2',
    accent_color: '#f59e0b',
    logo_url: ASSETS.LOGO,
    seal_enabled: true,
    seal_type: 'gold_ribbon',
    seal_label: '★ HONORS ★ CAPSTONE',
    seal_emblem_text: 'Y',
    bg_pattern: 'crest_waves',
    watermark_enabled: true,
    watermark_text: 'CAPSTONE',
    watermark_opacity: 0.06,
    has_partner: false,
    signatory_1_name: 'Eng. T. Chidzero',
    signatory_1_title: 'National Director, YARA Academy',
    signatory_1_signature_url: ASSETS.SIGNATURE_MANONGWA,
    signatory_2_name: 'Engr. B. Moyo',
    signatory_2_title: 'Capstone Evaluation Committee Chair',
    signatory_2_signature_url: ASSETS.SIGNATURE_CHIAMBIRO,
    footer_text: 'YARA — Young African Robotics Association | yara.org.zw',
    badge_text: 'CAPSTONE',
    is_active: true
  },
  {
    id: 'cert-competition',
    name: 'YARA National Robotics Competition Certificate',
    section: 'Competitions & Micromouse Arena',
    subtitle: 'Certificate of Achievement — YARA Robotics Championship',
    description: 'Awarded to participants and teams taking part in the YARA Educational Robotics Competition and Micromouse Maze Solving Arena.',
    recipient_label: 'This is to certify that',
    completion_text: 'has participated in the YARA National Robotics Competition, demonstrating outstanding performance in autonomous navigation, engineering design, and teamwork.',
    primary_color: '#0f172a',
    secondary_color: '#0b4ea2',
    accent_color: '#f59e0b',
    logo_url: ASSETS.LOGO,
    seal_enabled: true,
    seal_type: 'gold_embossed',
    seal_label: '★ ARENA 2026 ★ CHAMPIONSHIP',
    seal_emblem_text: '🏆',
    bg_pattern: 'crest_waves',
    watermark_enabled: true,
    watermark_text: 'YARA 2026',
    watermark_opacity: 0.07,
    has_partner: false,
    signatory_1_name: 'Eng. T. Chidzero',
    signatory_1_title: 'National Director, YARA',
    signatory_1_signature_url: ASSETS.SIGNATURE_MANONGWA,
    signatory_2_name: 'Dr. G. Mpofu',
    signatory_2_title: 'Chief Competition Judge',
    signatory_2_signature_url: ASSETS.SIGNATURE_CHIAMBIRO,
    footer_text: 'YARA — Young African Robotics Association | yara.org.zw',
    badge_text: 'ARENA 2026',
    is_active: true
  },
  {
    id: 'cert-kids',
    name: 'YARA Kids Early STEM Explorer Certificate',
    section: 'YARA Kids Track (Ages 3-8)',
    subtitle: 'Certificate of Discovery — Junior STEM & Robotics Explorer',
    description: 'Awarded to young children completing introductory YARA Kids interactive STEM challenges and logic activities.',
    recipient_label: 'Super STEM Star Certificate for',
    completion_text: 'has completed the YARA Kids Early STEM Exploration Track and shown awesome curiosity, creativity, and problem-solving skills!',
    primary_color: '#0f172a',
    secondary_color: '#0b4ea2',
    accent_color: '#f59e0b',
    logo_url: ASSETS.LOGO,
    seal_enabled: true,
    seal_type: 'gold_embossed',
    seal_label: '★ STEM STAR ★ EXPLORER',
    seal_emblem_text: '★',
    bg_pattern: 'guilloche',
    watermark_enabled: true,
    watermark_text: 'YARA KIDS',
    watermark_opacity: 0.05,
    has_partner: false,
    signatory_1_name: 'Eng. T. Chidzero',
    signatory_1_title: 'National Director, YARA',
    signatory_1_signature_url: ASSETS.SIGNATURE_MANONGWA,
    signatory_2_name: 'Auntie Sarah',
    signatory_2_title: 'YARA Kids Learning Specialist',
    signatory_2_signature_url: ASSETS.SIGNATURE_CHIAMBIRO,
    footer_text: 'YARA Kids — Young African Robotics Association | yara.org.zw',
    badge_text: 'KIDS STEM',
    is_active: true
  },
  {
    id: 'cert-mentorship',
    name: 'YARA Certified Mentor & Peer Educator Certificate',
    section: 'Mentorship & Leadership',
    subtitle: 'Certificate of Recognition — Master Mentor & Peer Leader',
    description: 'Awarded to verified robotics mentors who contribute peer guidance, technical assistance, and chapter support.',
    recipient_label: 'This certificate of honor is presented to',
    completion_text: 'in recognition of exemplary leadership, selfless technical mentorship, and dedication to raising the next generation of African technology leaders.',
    primary_color: '#0f172a',
    secondary_color: '#0b4ea2',
    accent_color: '#f59e0b',
    logo_url: ASSETS.LOGO,
    seal_enabled: true,
    seal_type: 'gold_embossed',
    seal_label: '★ CERTIFIED ★ MENTOR',
    seal_emblem_text: 'Y',
    bg_pattern: 'guilloche',
    watermark_enabled: true,
    watermark_text: 'YARA MENTOR',
    watermark_opacity: 0.06,
    has_partner: false,
    signatory_1_name: 'Eng. T. Chidzero',
    signatory_1_title: 'National Director, YARA',
    signatory_1_signature_url: ASSETS.SIGNATURE_MANONGWA,
    signatory_2_name: 'Mr. P. Mutero',
    signatory_2_title: 'Mentorship Council President',
    signatory_2_signature_url: ASSETS.SIGNATURE_CHIAMBIRO,
    footer_text: 'YARA — Young African Robotics Association | yara.org.zw',
    badge_text: 'MENTOR',
    is_active: true
  }
];

export function getAllCertificateTemplates(): CertificateTemplate[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_TEMPLATES));
      return DEFAULT_TEMPLATES;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_TEMPLATES));
      return DEFAULT_TEMPLATES;
    }
    return parsed;
  } catch {
    return DEFAULT_TEMPLATES;
  }
}

export function saveCertificateTemplate(template: CertificateTemplate): CertificateTemplate[] {
  const templates = getAllCertificateTemplates();
  const idx = templates.findIndex(t => t.id === template.id);
  let updated: CertificateTemplate[];
  if (idx >= 0) {
    updated = templates.map(t => (t.id === template.id ? template : t));
  } else {
    updated = [template, ...templates];
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
}

export function deleteCertificateTemplate(id: string): CertificateTemplate[] {
  const templates = getAllCertificateTemplates();
  const updated = templates.filter(t => t.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
}

export function createCertificateTemplate(
  data: Omit<CertificateTemplate, 'id'> & { id?: string }
): CertificateTemplate {
  const id = data.id || `cert-cat-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const newTemplate: CertificateTemplate = {
    ...data,
    id,
    logo_url: data.logo_url || ASSETS.LOGO,
    primary_color: data.primary_color || '#0f172a',
    secondary_color: data.secondary_color || '#0b4ea2',
    accent_color: data.accent_color || '#f59e0b',
    seal_enabled: data.seal_enabled !== false,
    seal_type: data.seal_type || 'gold_embossed',
    seal_label: data.seal_label || '★ VERIFIED ★ CERTIFICATE',
    seal_emblem_text: data.seal_emblem_text || 'Y',
    bg_pattern: data.bg_pattern || 'guilloche',
    watermark_enabled: data.watermark_enabled !== false,
    watermark_text: data.watermark_text || 'YARA',
    watermark_opacity: data.watermark_opacity ?? 0.06,
    footer_text: data.footer_text || 'YARA — Young African Robotics Association | yara.org.zw',
    badge_text: data.badge_text || 'CERTIFIED',
    is_active: data.is_active !== false
  };

  saveCertificateTemplate(newTemplate);
  return newTemplate;
}

/**
 * Automatically creates a matching corporate certificate template when a new course is added.
 */
export function autoCreateCertificateTemplateForCourse(course: {
  id: string;
  title: string;
  category?: string;
  instructorName?: string;
  instructorTitle?: string;
}): CertificateTemplate {
  const templates = getAllCertificateTemplates();
  const expectedId = `cert-course-${course.id}`;
  
  const existing = templates.find(t => t.id === expectedId || t.name.toLowerCase() === `${course.title.toLowerCase()} certificate`);
  if (existing) {
    return existing;
  }

  const categoryName = course.category ? course.category.toUpperCase() : 'LMS';
  
  const newTemplate: CertificateTemplate = {
    id: expectedId,
    name: `${course.title} Certificate`,
    section: 'Learning Academy & LMS',
    subtitle: `Certificate of Completion — ${course.title}`,
    description: `Official YARA accredited certificate awarded upon completion of all modules, assessments, and technical projects in ${course.title}.`,
    recipient_label: 'This is to certify that',
    completion_text: `has successfully completed the ${course.title} curriculum and demonstrated verified technical competence and engineering excellence.`,
    primary_color: '#0f172a',
    secondary_color: '#0b4ea2',
    accent_color: '#f59e0b',
    logo_url: ASSETS.LOGO,
    seal_enabled: true,
    seal_type: 'gold_embossed',
    seal_label: '★ VERIFIED ★ ACCREDITED',
    seal_emblem_text: 'Y',
    bg_pattern: 'guilloche',
    watermark_enabled: true,
    watermark_text: 'YARA',
    watermark_opacity: 0.06,
    has_partner: false,
    signatory_1_name: 'Eng. T. Chidzero',
    signatory_1_title: 'National Director, YARA Academy',
    signatory_1_signature_url: ASSETS.SIGNATURE_MANONGWA,
    signatory_2_name: course.instructorName || 'Mr. S.O. Manongwa',
    signatory_2_title: course.instructorTitle || 'Lead Instructor & Evaluation Patron',
    signatory_2_signature_url: ASSETS.SIGNATURE_CHIAMBIRO,
    footer_text: 'YARA — Young African Robotics Association | yara.org.zw',
    badge_text: categoryName,
    is_active: true
  };

  saveCertificateTemplate(newTemplate);
  return newTemplate;
}
