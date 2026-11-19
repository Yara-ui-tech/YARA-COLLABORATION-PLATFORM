import { supabase } from '../lib/supabase';
import {
  SafeguardingReport,
  SafeguardingReportCategory,
  SafeguardingReportStatus,
  SafeguardingReportPriority,
  SafeguardingMessage,
  SafeguardingCaseNote,
  SafeguardingAuditLog,
  SafeguardingEmergencyContact,
  SafeguardingResource,
  SafeguardingCampaign,
  SafeguardingPartner,
  SafeguardingChapterCompliance,
  SafeguardingReportPublicView
} from '../types/safeguarding';

const STORAGE_KEYS = {
  REPORTS: 'yara_safeguarding_reports',
  MESSAGES: 'yara_safeguarding_messages',
  NOTES: 'yara_safeguarding_case_notes',
  AUDIT_LOGS: 'yara_safeguarding_audit_logs',
  EMERGENCY: 'yara_safeguarding_emergency_contacts',
  RESOURCES: 'yara_safeguarding_resources',
  CAMPAIGNS: 'yara_safeguarding_campaigns',
  PARTNERS: 'yara_safeguarding_partners',
  CHAPTERS: 'yara_safeguarding_chapters',
  OFFICER_SESSION: 'yara_safeguarding_officer_auth'
};

// ============================================================================
// BASELINE VERIFIED EMERGENCY DIRECTORY (ZIMBABWE & REGIONAL HELPLINES)
// ============================================================================
export const DEFAULT_EMERGENCY_CONTACTS: SafeguardingEmergencyContact[] = [
  {
    id: 'em-childline',
    name: 'Childline Zimbabwe',
    category: 'child_protection',
    phone: '116',
    secondary_phone: '+263 242 701 111',
    toll_free: true,
    availability: '24 Hours / 7 Days a Week',
    description: 'National dedicated child helpline providing free, confidential counseling, rescue, and protection from abuse, neglect, and exploitation.',
    website: 'https://www.childline.org.zw',
    location: 'Harare, Bulawayo & National Outreach',
    is_verified: true
  },
  {
    id: 'em-musasa',
    name: 'Musasa Project',
    category: 'gbv',
    phone: '08080074',
    secondary_phone: '+263 242 708 721',
    toll_free: true,
    availability: '24/7 Crisis Hotline',
    description: 'Specialist emergency shelter, legal counsel, and psychological support for survivors of gender-based violence, sexual assault, and domestic abuse.',
    website: 'https://musasa.co.zw',
    location: 'Offices in Harare, Bulawayo, Gweru, Mutare, Chinhoyi',
    is_verified: true
  },
  {
    id: 'em-zrp-child',
    name: 'Zimbabwe Republic Police (ZRP) Child Friendly Bureau',
    category: 'police',
    phone: '+263 242 703 631',
    secondary_phone: '+263 242 777 777',
    toll_free: false,
    availability: '24/7 National Operations',
    description: 'Specialized police division trained in child-friendly investigation, victim friendly courts liaison, and urgent physical intervention.',
    website: 'https://www.zrp.gov.zw',
    location: 'All ZRP Provincial & District Headquarters',
    is_verified: true
  },
  {
    id: 'em-arc',
    name: 'Adult Rape Clinic (ARC) Parirenyatwa',
    category: 'medical',
    phone: '+263 242 795 869',
    secondary_phone: '+263 772 384 100',
    toll_free: false,
    availability: '24/7 Emergency Medical Response',
    description: 'Critical post-exposure medical prophylaxis (PEP within 72h), forensic documentation, STI prevention, and emergency trauma care.',
    location: 'Parirenyatwa Group of Hospitals, Mazowe St, Harare',
    is_verified: true
  },
  {
    id: 'em-friendship-bench',
    name: 'Friendship Bench Zimbabwe',
    category: 'counselling',
    phone: '+263 779 584 755',
    secondary_phone: '+263 784 845 220',
    toll_free: true,
    availability: 'Mon - Sun: 8:00 AM - 6:00 PM',
    description: 'Evidence-based community psychological therapy, youth emotional distress counseling, and anxiety/depression support.',
    website: 'https://www.friendshipbenchzimbabwe.org',
    location: 'Primary Health Clinics across Zimbabwe',
    is_verified: true
  },
  {
    id: 'em-national-emergency',
    name: 'National Emergency Response (Ambulance & Fire)',
    category: 'medical',
    phone: '999',
    secondary_phone: '993',
    toll_free: true,
    availability: '24/7 Immediate Dispatch',
    description: 'National emergency call dispatch for immediate life-threatening physical danger, trauma, and medical ambulance rescue.',
    location: 'Nationwide dispatch',
    is_verified: true
  }
];

// ============================================================================
// BASELINE POLICIES & GOVERNANCE DOCUMENTATION
// ============================================================================
export const DEFAULT_SAFEGUARDING_RESOURCES: SafeguardingResource[] = [
  {
    id: 'pol-child-safeguarding',
    title: 'YARA Child Protection & Safeguarding Policy',
    category: 'policy',
    description: 'Official institutional protocol governing adult-to-minor conduct, reporting obligations, risk assessments, and child-safe robotics lab environments.',
    format: 'pdf',
    version: 'v2.4',
    file_url: '/assets/policies/YARA_Child_Safeguarding_Policy_v2.4.pdf',
    file_size: '1.4 MB',
    approval_status: 'approved',
    approved_by: 'YARA National Executive Board',
    review_date: 'March 2027',
    download_count: 342
  },
  {
    id: 'pol-gbv-prevention',
    title: 'YARA Gender-Based Violence & Sexual Harassment Prevention Policy',
    category: 'gbv',
    description: 'Zero-tolerance charter defining prohibited gender-discriminatory conduct, victim protection protocols, anonymous reporting pathways, and disciplinary sanctions.',
    format: 'pdf',
    version: 'v2.1',
    file_url: '/assets/policies/YARA_GBV_Harassment_Policy_v2.1.pdf',
    file_size: '1.2 MB',
    approval_status: 'approved',
    approved_by: 'National Safeguarding Committee',
    review_date: 'November 2026',
    download_count: 289
  },
  {
    id: 'pol-code-conduct',
    title: 'Mentor, Educator & Volunteer Code of Conduct',
    category: 'code_of_conduct',
    description: 'Binding ethical standard required for all club mentors, judges, university chapter leads, and competition volunteers working with young builders.',
    format: 'pdf',
    version: 'v3.0',
    file_url: '/assets/policies/YARA_Mentor_Code_of_Conduct_v3.0.pdf',
    file_size: '890 KB',
    approval_status: 'approved',
    approved_by: 'YARA Governance Secretariat',
    review_date: 'January 2027',
    download_count: 512
  },
  {
    id: 'pol-photo-consent',
    title: 'Photography, Media & Digital Identity Consent Protocol',
    category: 'guideline',
    description: 'Guidelines on photographing minors at competitions, safe online representation, parental consent slips, and prohibited public tagging of vulnerable students.',
    format: 'pdf',
    version: 'v2.0',
    file_url: '/assets/policies/YARA_Media_Photography_Consent_v2.0.pdf',
    file_size: '760 KB',
    approval_status: 'approved',
    approved_by: 'Communications & Child Safety Taskforce',
    review_date: 'December 2026',
    download_count: 198
  },
  {
    id: 'pol-whistleblower',
    title: 'Whistleblowing & Independent Escalation Procedure',
    category: 'policy',
    description: 'Protective escalation mechanism allowing any member to report abuse of authority or leadership misconduct without fear of reprisal or victimization.',
    format: 'pdf',
    version: 'v1.8',
    file_url: '/assets/policies/YARA_Whistleblowing_Escalation_v1.8.pdf',
    file_size: '640 KB',
    approval_status: 'approved',
    approved_by: 'Independent Legal Advisory Council',
    review_date: 'October 2027',
    download_count: 174
  },
  {
    id: 'pol-mental-wellness',
    title: 'Youth Emotional Resilience & Peer Support Guide',
    category: 'mental_health',
    description: 'Practical handbook on managing competition anxiety, academic stress, peer bullying defense, and building psychological confidence in STEM.',
    format: 'guide',
    version: 'v2.2',
    file_url: '/assets/policies/YARA_Youth_Wellbeing_Guide_v2.2.pdf',
    file_size: '2.1 MB',
    approval_status: 'approved',
    approved_by: 'Youth Advisory Board',
    review_date: 'June 2027',
    download_count: 421
  }
];

// ============================================================================
// BASELINE CAMPAIGNS & ADVOCACY INITIATIVES
// ============================================================================
export const DEFAULT_SAFEGUARDING_CAMPAIGNS: SafeguardingCampaign[] = [
  {
    id: 'camp-safe-girls-stem',
    title: 'Safe Labs, Empowered Girls in Robotics',
    category: 'Gender Equality & GBV Prevention',
    description: 'Continental advocacy campaign ensuring high school robotics labs and maker spaces are completely free from intimidation, male dominance, and sexual harassment.',
    cover_image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1200&q=80',
    start_date: '2026-11-25T08:00:00Z',
    end_date: '2026-12-10T17:00:00Z',
    venue: 'All YARA High School & University Chapters Across Zimbabwe',
    target_audience: 'Girls in Secondary Schools, University Female Coders, Mentors',
    organising_partners: ['YARA Gender Committee', 'Musasa Project (Prospective)'],
    status: 'active'
  },
  {
    id: 'camp-cyber-defense',
    title: 'Digital Safety & Anti-Cyberbullying Tour 2026',
    category: 'Online Protection & Minor Safety',
    description: 'Workshops for student programmers on identifying online predatory behaviour, preventing cyber-harassment on Discord/WhatsApp, and safe collaborative coding.',
    cover_image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80',
    start_date: '2026-12-05T09:00:00Z',
    end_date: '2026-12-08T15:00:00Z',
    venue: 'Dreamers Community Center, Mt Pleasant Harare & Virtual Stream',
    target_audience: 'Ages 10–19, Club Leaders, Parents, Educators',
    organising_partners: ['YARA Child Protection Unit', 'Childline Zimbabwe (Prospective)'],
    status: 'upcoming'
  },
  {
    id: 'camp-mentor-vetting',
    title: 'Educator & Mentor Safeguarding Certification Series',
    category: 'Professional Ethics & Child Rights',
    description: 'Mandatory safeguarding accreditation for teachers, volunteer patrons, and university lab instructors on mandatory child abuse reporting and boundary ethics.',
    cover_image: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=80',
    start_date: '2027-01-15T08:30:00Z',
    end_date: '2027-01-18T16:00:00Z',
    venue: 'University of Zimbabwe STEM Center & Online LMS',
    target_audience: 'STEM Teachers, Chapter Patrons, Robotics Judges',
    organising_partners: ['YARA Academy', 'ZNCWC Technical Liaison'],
    status: 'upcoming'
  }
];

// ============================================================================
// BASELINE PARTNERS & COLLABORATIONS DIRECTORY
// ============================================================================
export const DEFAULT_SAFEGUARDING_PARTNERS: SafeguardingPartner[] = [
  {
    id: 'part-childline',
    name: 'Childline Zimbabwe',
    type: 'child_protection',
    logo_url: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=300&q=80',
    website: 'https://www.childline.org.zw',
    description: 'Premier national non-profit dedicated to defending child rights, toll-free crisis response, and child protection advocacy across all 10 provinces.',
    areas_of_collaboration: ['Toll-Free Helpline Referrals', 'Child Protection Club Curricula', 'Emergency Rescue Liaison'],
    contact_email: 'info@childline.org.zw',
    contact_phone: '+263 242 701 111',
    status: 'confirmed'
  },
  {
    id: 'part-musasa',
    name: 'Musasa Project',
    type: 'gbv_support',
    logo_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
    website: 'https://musasa.co.zw',
    description: 'Foremost authority on gender-based violence response, legal counseling, clinical referral, and safe shelter for women and young girls in Zimbabwe.',
    areas_of_collaboration: ['GBV Case Support & Shelters', 'Girls in Robotics Safety Workshops', 'Confidential Legal Guidance'],
    contact_email: 'advocacy@musasa.co.zw',
    contact_phone: '+263 242 708 721',
    status: 'confirmed'
  },
  {
    id: 'part-unicef',
    name: 'UNICEF Zimbabwe (Prospective Engagement)',
    type: 'development',
    logo_url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=300&q=80',
    website: 'https://www.unicef.org/zimbabwe',
    description: 'International United Nations agency working for the survival, protection, and equitable development of every child.',
    areas_of_collaboration: ['Child-Friendly Tech Lab Standards', 'Youth Digital Inclusion', 'Adolescent Wellbeing Frameworks'],
    status: 'prospective'
  },
  {
    id: 'part-unfpa',
    name: 'UNFPA Zimbabwe (Prospective Engagement)',
    type: 'gbv_support',
    logo_url: 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?auto=format&fit=crop&w=300&q=80',
    website: 'https://zimbabwe.unfpa.org',
    description: 'UN sexual and reproductive health agency promoting gender equality and ending gender-based violence against young women.',
    areas_of_collaboration: ['Adolescent Girl Empowerment in Tech', 'GBV Prevention in Communities'],
    status: 'prospective'
  },
  {
    id: 'part-redcross',
    name: 'Zimbabwe Red Cross Society (Prospective Engagement)',
    type: 'counselling',
    logo_url: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=300&q=80',
    website: 'https://redcrosszim.org.zw',
    description: 'Humanitarian community agency providing psychological first aid, emergency medical triage, and youth volunteer protection.',
    areas_of_collaboration: ['Arena Event Medical First Aid', 'Youth Volunteer Safeguarding'],
    status: 'prospective'
  }
];

// ============================================================================
// BASELINE CHAPTER SAFEGUARDING AUDIT COMPLIANCE
// ============================================================================
export const DEFAULT_CHAPTER_COMPLIANCE: SafeguardingChapterCompliance[] = [
  {
    chapter_id: 'ch-uz',
    chapter_name: 'University of Zimbabwe Robotics Chapter',
    province: 'Harare',
    designated_officer_name: 'Dr. T. Sithole',
    designated_officer_email: 'sithole.safeguard@uz.ac.zw',
    designated_officer_phone: '+263 77 234 5678',
    code_of_conduct_signed: true,
    last_training_date: '2026-09-12',
    status: 'compliant'
  },
  {
    chapter_id: 'ch-nust',
    chapter_name: 'NUST Mechatronics & AI Club',
    province: 'Bulawayo',
    designated_officer_name: 'Eng. P. Ndlovu',
    designated_officer_email: 'p.ndlovu@nust.ac.zw',
    designated_officer_phone: '+263 78 345 6789',
    code_of_conduct_signed: true,
    last_training_date: '2026-10-05',
    status: 'compliant'
  },
  {
    chapter_id: 'ch-kutama',
    chapter_name: 'Kutama College Robotics Society',
    province: 'Mashonaland West',
    designated_officer_name: 'Mr. C. Matambanadzo',
    designated_officer_email: 'cmatamba@kutama.edu.zw',
    designated_officer_phone: '+263 71 456 7890',
    code_of_conduct_signed: true,
    last_training_date: '2026-11-01',
    status: 'compliant'
  },
  {
    chapter_id: 'ch-gweru-poly',
    chapter_name: 'Gweru Polytechnic Innovation Chapter',
    province: 'Midlands',
    designated_officer_name: 'Ms. R. Chimombe',
    designated_officer_email: 'rchimombe@gwerupoly.ac.zw',
    designated_officer_phone: '+263 77 567 8901',
    code_of_conduct_signed: false,
    status: 'pending_training'
  },
  {
    chapter_id: 'ch-manicaland-stem',
    chapter_name: 'Mutare High STEM & Coding Guild',
    province: 'Manicaland',
    designated_officer_name: 'Mrs. S. Mutasa',
    designated_officer_email: 'mutasahigh.safe@yara.org',
    designated_officer_phone: '+263 78 678 9012',
    code_of_conduct_signed: true,
    last_training_date: '2026-08-20',
    status: 'compliant'
  }
];

// ============================================================================
// HELPER UTILITIES: CRYPTO & GENERATORS
// ============================================================================

// Generate Case Reference Number: YARA-SAFE-2026-XXXXXX
export function generateCaseNumber(): string {
  const randomSuffix = Math.floor(100000 + Math.random() * 900000);
  return `YARA-SAFE-2026-${randomSuffix}`;
}

// Generate separate Secret Access Key / PIN: e.g., "K7M9-P4Q2"
export function generateSecretAccessKey(): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let p1 = '';
  let p2 = '';
  for (let i = 0; i < 4; i++) {
    p1 += chars.charAt(Math.floor(Math.random() * chars.length));
    p2 += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${p1}-${p2}`;
}

// Simple deterministic hash for secret key comparison
export function hashSecretKey(key: string): string {
  const normalized = key.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
  let hash = 0;
  for (let i = 0; i < normalized.length; i++) {
    const char = normalized.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return `h_${Math.abs(hash).toString(36)}_${normalized.length}`;
}

function getLocal<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function setLocal<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.warn(`LocalStorage write error for ${key}:`, err);
  }
}

// ============================================================================
// 1. REPORT SUBMISSION (ANONYMOUS & CONFIDENTIAL)
// ============================================================================

export interface SubmitReportPayload {
  category: SafeguardingReportCategory;
  incident_description: string;
  incident_date?: string;
  chapter_or_location?: string;
  is_child_at_risk: boolean;
  is_immediate_danger: boolean;
  is_ongoing: boolean;
  is_anonymous: boolean;
  reporter_name?: string;
  reporter_email?: string;
  reporter_phone?: string;
  reporter_role?: SafeguardingReport['reporter_role'];
  evidence_files?: SafeguardingReport['evidence_files'];
}

export interface SubmitReportResult {
  success: boolean;
  case_number: string;
  secret_access_key: string;
  message: string;
  report?: SafeguardingReport;
}

export async function submitSafeguardingReport(payload: SubmitReportPayload): Promise<SubmitReportResult> {
  const caseNumber = generateCaseNumber();
  const secretKey = generateSecretAccessKey();
  const keyHash = hashSecretKey(secretKey);

  // Determine initial triage priority based on urgency flags
  let priority: SafeguardingReportPriority = 'medium';
  if (payload.is_immediate_danger || (payload.is_child_at_risk && payload.is_ongoing)) {
    priority = 'urgent';
  } else if (payload.is_child_at_risk || payload.is_ongoing || payload.category === 'child_abuse' || payload.category === 'gbv') {
    priority = 'high';
  } else if (payload.category === 'other' || payload.category === 'bullying') {
    priority = 'medium';
  }

  const now = new Date().toISOString();

  const newReport: SafeguardingReport = {
    id: 'rep_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6),
    case_number: caseNumber,
    secret_key_hash: keyHash,
    is_anonymous: payload.is_anonymous,
    category: payload.category,
    incident_description: payload.incident_description.trim(),
    incident_date: payload.incident_date?.trim(),
    chapter_or_location: payload.chapter_or_location?.trim(),
    is_child_at_risk: payload.is_child_at_risk,
    is_immediate_danger: payload.is_immediate_danger,
    is_ongoing: payload.is_ongoing,
    reporter_name: payload.is_anonymous ? undefined : payload.reporter_name?.trim(),
    reporter_email: payload.is_anonymous ? undefined : payload.reporter_email?.trim(),
    reporter_phone: payload.is_anonymous ? undefined : payload.reporter_phone?.trim(),
    reporter_role: payload.is_anonymous ? undefined : payload.reporter_role,
    evidence_files: payload.evidence_files || [],
    status: 'received',
    priority: priority,
    created_at: now,
    updated_at: now
  };

  // 1. Save to LocalStorage
  const reports = getLocal<SafeguardingReport[]>(STORAGE_KEYS.REPORTS, []);
  setLocal(STORAGE_KEYS.REPORTS, [newReport, ...reports]);

  // Initial welcome message from Safeguarding Team
  const initialMessage: SafeguardingMessage = {
    id: 'msg_' + Date.now().toString(36),
    report_id: newReport.id,
    case_number: caseNumber,
    sender_type: 'officer',
    sender_display_name: 'Safeguarding Secretariat',
    message: `Thank you for reaching out to YARA Safeguarding & Child Protection. Your report has been officially logged under reference ${caseNumber}. Our designated safeguarding triage officer is reviewing the details in accordance with our Child Protection and GBV policies. You may return to this secure portal anytime using your reference number and secret key to view non-confidential updates or submit additional information.`,
    created_at: now
  };
  const messages = getLocal<SafeguardingMessage[]>(STORAGE_KEYS.MESSAGES, []);
  setLocal(STORAGE_KEYS.MESSAGES, [initialMessage, ...messages]);

  // Initial audit log
  await logSafeguardingAction({
    report_id: newReport.id,
    case_number: caseNumber,
    officer_name: 'System Automated Ingestion',
    action: `New ${newReport.is_anonymous ? 'Anonymous' : 'Confidential'} Report Logged`,
    details: `Category: ${newReport.category}, Priority: ${newReport.priority}, Minor at Risk: ${newReport.is_child_at_risk}`
  });

  // 2. Sync to Supabase (if table exists)
  try {
    await supabase.from('safeguarding_reports').insert(newReport);
    await supabase.from('safeguarding_messages').insert(initialMessage);
  } catch (err) {
    // Graceful fallback to LocalStorage
    console.warn('Supabase safeguarding sync fallback:', err);
  }

  return {
    success: true,
    case_number: caseNumber,
    secret_access_key: secretKey,
    message: 'Report received securely. Please store your Case Reference Number and Secret Key in a safe place.',
    report: newReport
  };
}

// ============================================================================
// 2. REPORT TRACKING (SECURE CREDENTIAL-BASED LOOKUP)
// ============================================================================

export interface TrackingResult {
  found: boolean;
  error?: string;
  report?: SafeguardingReportPublicView;
  messages?: SafeguardingMessage[];
  canMessage?: boolean;
}

export async function lookupReportByCredentials(caseNumber: string, secretKey: string): Promise<TrackingResult> {
  const cleanCase = caseNumber.trim().toUpperCase();
  const cleanKey = secretKey.trim().toUpperCase();
  const expectedHash = hashSecretKey(cleanKey);

  // Check LocalStorage first
  const reports = getLocal<SafeguardingReport[]>(STORAGE_KEYS.REPORTS, []);
  let matched = reports.find(r => r.case_number === cleanCase && r.secret_key_hash === expectedHash);

  // If not found in LocalStorage, attempt Supabase lookup
  if (!matched) {
    try {
      const { data, error } = await supabase
        .from('safeguarding_reports')
        .select('*')
        .eq('case_number', cleanCase)
        .eq('secret_key_hash', expectedHash)
        .single();
      if (!error && data) {
        matched = data as SafeguardingReport;
      }
    } catch (err) {
      // ignore
    }
  }

  if (!matched) {
    return {
      found: false,
      error: 'Invalid Case Reference Number or Secret Key. Please verify your credentials and try again.'
    };
  }

  // Load associated safe messages
  const allMessages = getLocal<SafeguardingMessage[]>(STORAGE_KEYS.MESSAGES, []);
  let reportMessages = allMessages.filter(m => m.case_number === cleanCase);

  try {
    const { data } = await supabase
      .from('safeguarding_messages')
      .select('*')
      .eq('case_number', cleanCase)
      .order('created_at', { ascending: true });
    if (data && data.length > 0) {
      reportMessages = data as SafeguardingMessage[];
    }
  } catch (err) {}

  // Strip internal notes, officer names, and victim raw contact details for public tracking view
  const publicView: SafeguardingReportPublicView = {
    case_number: matched.case_number,
    category: matched.category,
    is_anonymous: matched.is_anonymous,
    status: matched.status,
    priority: matched.priority,
    is_child_at_risk: matched.is_child_at_risk,
    is_immediate_danger: matched.is_immediate_danger,
    created_at: matched.created_at,
    updated_at: matched.updated_at
  };

  return {
    found: true,
    report: publicView,
    messages: reportMessages.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()),
    canMessage: matched.status !== 'closed'
  };
}

export async function sendReporterFollowupMessage(caseNumber: string, secretKey: string, messageText: string): Promise<boolean> {
  const lookup = await lookupReportByCredentials(caseNumber, secretKey);
  if (!lookup.found || !lookup.report) return false;

  const cleanCase = caseNumber.trim().toUpperCase();
  const reports = getLocal<SafeguardingReport[]>(STORAGE_KEYS.REPORTS, []);
  const report = reports.find(r => r.case_number === cleanCase);

  const newMessage: SafeguardingMessage = {
    id: 'msg_' + Date.now().toString(36),
    report_id: report?.id || 'rep_' + cleanCase,
    case_number: cleanCase,
    sender_type: 'reporter',
    sender_display_name: 'Reporter',
    message: messageText.trim(),
    created_at: new Date().toISOString()
  };

  // Local storage
  const allMessages = getLocal<SafeguardingMessage[]>(STORAGE_KEYS.MESSAGES, []);
  setLocal(STORAGE_KEYS.MESSAGES, [...allMessages, newMessage]);

  // Touch report updated_at
  if (report) {
    report.updated_at = new Date().toISOString();
    setLocal(STORAGE_KEYS.REPORTS, reports.map(r => r.id === report.id ? report : r));
  }

  // Supabase sync
  try {
    await supabase.from('safeguarding_messages').insert(newMessage);
  } catch (err) {}

  await logSafeguardingAction({
    case_number: cleanCase,
    officer_name: 'Reporter Follow-Up',
    action: 'Additional information submitted by reporter',
    details: 'Encrypted message appended to case'
  });

  return true;
}

// ============================================================================
// 3. SAFEGUARDING OFFICER & ADMIN CONSOLE (RESTRICTED ACCESS)
// ============================================================================

export interface OfficerAuthCredentials {
  pin: string;
  officer_email?: string;
}

export const SAFEGUARDING_SECRET_PIN = 'YARA-SAFE-2026';

export function verifySafeguardingOfficerAuth(credentials: OfficerAuthCredentials): boolean {
  if (credentials.pin && credentials.pin.trim() === SAFEGUARDING_SECRET_PIN) {
    return true;
  }
  // Check if session is stored
  const session = localStorage.getItem(STORAGE_KEYS.OFFICER_SESSION);
  if (session === 'authorized_safeguarding_officer') return true;
  return false;
}

export function saveOfficerSession(): void {
  localStorage.setItem(STORAGE_KEYS.OFFICER_SESSION, 'authorized_safeguarding_officer');
}

export function clearOfficerSession(): void {
  localStorage.removeItem(STORAGE_KEYS.OFFICER_SESSION);
}

export async function getAllSafeguardingReports(auth: OfficerAuthCredentials): Promise<SafeguardingReport[]> {
  if (!verifySafeguardingOfficerAuth(auth)) {
    throw new Error('Unauthorized: Safeguarding Officer credentials required.');
  }

  let list = getLocal<SafeguardingReport[]>(STORAGE_KEYS.REPORTS, []);
  try {
    const { data, error } = await supabase.from('safeguarding_reports').select('*').order('created_at', { ascending: false });
    if (!error && data && data.length > 0) {
      list = data as SafeguardingReport[];
    }
  } catch (err) {}

  return list;
}

export async function updateReportStatusByOfficer(
  reportId: string,
  newStatus: SafeguardingReportStatus,
  newPriority: SafeguardingReportPriority,
  assignedOfficerName: string,
  externalUpdateMessage?: string,
  auth?: OfficerAuthCredentials
): Promise<boolean> {
  const reports = getLocal<SafeguardingReport[]>(STORAGE_KEYS.REPORTS, []);
  const target = reports.find(r => r.id === reportId);
  if (!target) return false;

  const previousStatus = target.status;
  target.status = newStatus;
  target.priority = newPriority;
  target.assigned_officer_name = assignedOfficerName;
  target.updated_at = new Date().toISOString();

  setLocal(STORAGE_KEYS.REPORTS, reports.map(r => r.id === reportId ? target : r));

  // If officer drafted an external message for the reporter
  if (externalUpdateMessage && externalUpdateMessage.trim()) {
    const msg: SafeguardingMessage = {
      id: 'msg_' + Date.now().toString(36),
      report_id: target.id,
      case_number: target.case_number,
      sender_type: 'officer',
      sender_display_name: assignedOfficerName || 'Safeguarding Officer',
      message: externalUpdateMessage.trim(),
      created_at: new Date().toISOString()
    };
    const allMessages = getLocal<SafeguardingMessage[]>(STORAGE_KEYS.MESSAGES, []);
    setLocal(STORAGE_KEYS.MESSAGES, [...allMessages, msg]);
    try {
      await supabase.from('safeguarding_messages').insert(msg);
    } catch {}
  }

  // Audit log
  await logSafeguardingAction({
    report_id: target.id,
    case_number: target.case_number,
    officer_name: assignedOfficerName || 'Authorized Officer',
    action: `Status updated from ${previousStatus} to ${newStatus}`,
    details: `Priority set to ${newPriority}`
  });

  try {
    await supabase.from('safeguarding_reports').update({
      status: newStatus,
      priority: newPriority,
      assigned_officer_name: assignedOfficerName,
      updated_at: target.updated_at
    }).eq('id', reportId);
  } catch {}

  return true;
}

export async function addCaseInternalNote(reportId: string, noteText: string, officerName: string): Promise<boolean> {
  const newNote: SafeguardingCaseNote = {
    id: 'note_' + Date.now().toString(36),
    report_id: reportId,
    officer_name: officerName,
    note: noteText.trim(),
    is_sensitive: true,
    created_at: new Date().toISOString()
  };

  const allNotes = getLocal<SafeguardingCaseNote[]>(STORAGE_KEYS.NOTES, []);
  setLocal(STORAGE_KEYS.NOTES, [newNote, ...allNotes]);

  try {
    await supabase.from('safeguarding_case_notes').insert(newNote);
  } catch {}

  await logSafeguardingAction({
    report_id: reportId,
    officer_name: officerName,
    action: 'Internal Case Note Logged',
    details: 'Confidential investigative note appended'
  });

  return true;
}

export async function getCaseInternalNotes(reportId: string): Promise<SafeguardingCaseNote[]> {
  const allNotes = getLocal<SafeguardingCaseNote[]>(STORAGE_KEYS.NOTES, []);
  let filtered = allNotes.filter(n => n.report_id === reportId);

  try {
    const { data } = await supabase.from('safeguarding_case_notes').select('*').eq('report_id', reportId).order('created_at', { ascending: true });
    if (data && data.length > 0) {
      filtered = data as SafeguardingCaseNote[];
    }
  } catch {}

  return filtered;
}

export async function logSafeguardingAction(log: Omit<SafeguardingAuditLog, 'id' | 'timestamp'>): Promise<void> {
  const record: SafeguardingAuditLog = {
    ...log,
    id: 'log_' + Date.now().toString(36),
    timestamp: new Date().toISOString()
  };

  const allLogs = getLocal<SafeguardingAuditLog[]>(STORAGE_KEYS.AUDIT_LOGS, []);
  setLocal(STORAGE_KEYS.AUDIT_LOGS, [record, ...allLogs.slice(0, 300)]);

  try {
    await supabase.from('safeguarding_audit_logs').insert(record);
  } catch {}
}

export async function getSafeguardingAuditLogs(): Promise<SafeguardingAuditLog[]> {
  const allLogs = getLocal<SafeguardingAuditLog[]>(STORAGE_KEYS.AUDIT_LOGS, []);
  return allLogs;
}

// ============================================================================
// 4. STATS & ANALYTICS FOR SAFEGUARDING DASHBOARD
// ============================================================================

export interface SafeguardingStats {
  total: number;
  newCount: number;
  underReview: number;
  referred: number;
  closed: number;
  urgentCount: number;
  childAtRiskCount: number;
  anonymousRatio: number;
}

export function computeSafeguardingStats(reports: SafeguardingReport[]): SafeguardingStats {
  const total = reports.length;
  if (total === 0) {
    return {
      total: 0,
      newCount: 0,
      underReview: 0,
      referred: 0,
      closed: 0,
      urgentCount: 0,
      childAtRiskCount: 0,
      anonymousRatio: 0
    };
  }

  const newCount = reports.filter(r => r.status === 'received' || r.status === 'awaiting_assessment').length;
  const underReview = reports.filter(r => r.status === 'under_review' || r.status === 'action_in_progress').length;
  const referred = reports.filter(r => r.status === 'referred').length;
  const closed = reports.filter(r => r.status === 'closed').length;
  const urgentCount = reports.filter(r => r.priority === 'urgent').length;
  const childAtRiskCount = reports.filter(r => r.is_child_at_risk).length;
  const anonymousCount = reports.filter(r => r.is_anonymous).length;

  return {
    total,
    newCount,
    underReview,
    referred,
    closed,
    urgentCount,
    childAtRiskCount,
    anonymousRatio: Math.round((anonymousCount / total) * 100)
  };
}

// ============================================================================
// 5. PUBLIC DIRECTORIES: EMERGENCY, POLICIES, CAMPAIGNS, PARTNERS, CHAPTERS
// ============================================================================

export async function getEmergencyContacts(): Promise<SafeguardingEmergencyContact[]> {
  return getLocal<SafeguardingEmergencyContact[]>(STORAGE_KEYS.EMERGENCY, DEFAULT_EMERGENCY_CONTACTS);
}

export async function getSafeguardingResources(): Promise<SafeguardingResource[]> {
  return getLocal<SafeguardingResource[]>(STORAGE_KEYS.RESOURCES, DEFAULT_SAFEGUARDING_RESOURCES);
}

export async function getSafeguardingCampaigns(): Promise<SafeguardingCampaign[]> {
  return getLocal<SafeguardingCampaign[]>(STORAGE_KEYS.CAMPAIGNS, DEFAULT_SAFEGUARDING_CAMPAIGNS);
}

export async function getSafeguardingPartners(): Promise<SafeguardingPartner[]> {
  return getLocal<SafeguardingPartner[]>(STORAGE_KEYS.PARTNERS, DEFAULT_SAFEGUARDING_PARTNERS);
}

export async function getChapterComplianceRecords(): Promise<SafeguardingChapterCompliance[]> {
  return getLocal<SafeguardingChapterCompliance[]>(STORAGE_KEYS.CHAPTERS, DEFAULT_CHAPTER_COMPLIANCE);
}

// ============================================================================
// 6. UNIFIED SAFEGUARDING SERVICE EXPORT
// ============================================================================

export const safeguardingService = {
  // Public Directories
  getResources: getSafeguardingResources,
  getCampaigns: getSafeguardingCampaigns,
  getPartners: getSafeguardingPartners,
  getChapterCompliance: getChapterComplianceRecords,
  getEmergencyContacts,

  incrementResourceDownload: async (resourceId: string): Promise<void> => {
    const resources = getLocal<SafeguardingResource[]>(STORAGE_KEYS.RESOURCES, DEFAULT_SAFEGUARDING_RESOURCES);
    const updated = resources.map(r => r.id === resourceId ? { ...r, download_count: (r.download_count || 0) + 1 } : r);
    setLocal(STORAGE_KEYS.RESOURCES, updated);
    try {
      await supabase.from('safeguarding_resources').update({ download_count: (resources.find(r => r.id === resourceId)?.download_count || 0) + 1 }).eq('id', resourceId);
    } catch {}
  },

  // Officer Authentication
  verifyOfficerPin: (pin: string): boolean => {
    return pin.trim() === SAFEGUARDING_SECRET_PIN;
  },

  // Reports Management for Authorized Officers
  getAllReports: async (): Promise<SafeguardingReport[]> => {
    return getAllSafeguardingReports({ pin: SAFEGUARDING_SECRET_PIN });
  },

  getMessages: async (reportId: string): Promise<SafeguardingMessage[]> => {
    const msgs = getLocal<SafeguardingMessage[]>(STORAGE_KEYS.MESSAGES, []);
    let filtered = msgs.filter(m => m.report_id === reportId);
    try {
      const { data } = await supabase.from('safeguarding_messages').select('*').eq('report_id', reportId).order('created_at', { ascending: true });
      if (data && data.length > 0) {
        filtered = data as SafeguardingMessage[];
      }
    } catch {}
    return filtered;
  },

  getCaseNotes: async (reportId: string): Promise<SafeguardingCaseNote[]> => {
    return getCaseInternalNotes(reportId);
  },

  getAuditLogs: async (reportId?: string): Promise<SafeguardingAuditLog[]> => {
    const logs = await getSafeguardingAuditLogs();
    if (reportId) {
      return logs.filter(l => l.report_id === reportId);
    }
    return logs;
  },

  logAuditAction: async (reportId: string, action: string, performedBy: string, details?: string): Promise<void> => {
    await logSafeguardingAction({
      report_id: reportId,
      case_number: reportId,
      officer_name: performedBy,
      action,
      details: details || ''
    });
  },

  updateReportStatus: async (reportId: string, status: any, officerName: string): Promise<SafeguardingReport | null> => {
    const reports = getLocal<SafeguardingReport[]>(STORAGE_KEYS.REPORTS, []);
    const target = reports.find(r => r.id === reportId);
    if (!target) return null;

    target.status = status;
    target.assigned_officer_name = officerName;
    target.updated_at = new Date().toISOString();
    setLocal(STORAGE_KEYS.REPORTS, reports.map(r => r.id === reportId ? target : r));

    try {
      await supabase.from('safeguarding_reports').update({ status, updated_at: target.updated_at }).eq('id', reportId);
    } catch {}

    return target;
  },

  updateReportPriority: async (reportId: string, priority: any, officerName: string): Promise<SafeguardingReport | null> => {
    const reports = getLocal<SafeguardingReport[]>(STORAGE_KEYS.REPORTS, []);
    const target = reports.find(r => r.id === reportId);
    if (!target) return null;

    target.priority = priority;
    target.updated_at = new Date().toISOString();
    setLocal(STORAGE_KEYS.REPORTS, reports.map(r => r.id === reportId ? target : r));

    try {
      await supabase.from('safeguarding_reports').update({ priority, updated_at: target.updated_at }).eq('id', reportId);
    } catch {}

    return target;
  },

  postMessage: async (payload: { report_id: string; sender_type: 'reporter' | 'officer'; sender_name: string; message: string }): Promise<SafeguardingMessage> => {
    const msg: SafeguardingMessage = {
      id: 'msg_' + Date.now().toString(36),
      report_id: payload.report_id,
      case_number: payload.report_id,
      sender_type: payload.sender_type,
      sender_display_name: payload.sender_name,
      message: payload.message,
      created_at: new Date().toISOString()
    };
    const all = getLocal<SafeguardingMessage[]>(STORAGE_KEYS.MESSAGES, []);
    setLocal(STORAGE_KEYS.MESSAGES, [...all, msg]);
    try {
      await supabase.from('safeguarding_messages').insert(msg);
    } catch {}
    return msg;
  },

  addCaseNote: async (reportId: string, officerName: string, note: string, confidential: boolean = true): Promise<SafeguardingCaseNote> => {
    const noteObj: SafeguardingCaseNote = {
      id: 'note_' + Date.now().toString(36),
      report_id: reportId,
      officer_name: officerName,
      note_text: note,
      created_at: new Date().toISOString()
    };
    const all = getLocal<SafeguardingCaseNote[]>(STORAGE_KEYS.NOTES, []);
    setLocal(STORAGE_KEYS.NOTES, [...all, noteObj]);
    try {
      await supabase.from('safeguarding_case_notes').insert(noteObj);
    } catch {}
    return noteObj;
  }
};

