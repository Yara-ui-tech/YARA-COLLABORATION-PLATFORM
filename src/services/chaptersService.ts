import { 
  Chapter, ChapterReport, NationalExecutiveAssessment, ChapterLeader, 
  ChapterLeaderRole, ChapterFinancialData, ChapterMember, ChapterRegistrationRequest 
} from '../types/chapters';
import { supabase } from '../lib/supabase';

export const PROVINCIAL_LEAD_UNIVERSITIES: Record<string, { universityName: string; chapterCode: string; defaultChapterName: string }> = {
  'Mashonaland West': {
    universityName: 'Chinhoyi University of Technology (CUT)',
    chapterCode: 'YARA-CUT-01',
    defaultChapterName: 'YARA Chinhoyi University of Technology (CUT) Chapter'
  },
  'Harare': {
    universityName: 'University of Zimbabwe (UZ) & HIT',
    chapterCode: 'YARA-UZ-02',
    defaultChapterName: 'YARA University of Zimbabwe (UZ) Chapter'
  },
  'Bulawayo': {
    universityName: 'National University of Science and Technology (NUST)',
    chapterCode: 'YARA-NUST-01',
    defaultChapterName: 'YARA NUST Bulawayo Chapter'
  },
  'Midlands': {
    universityName: 'Midlands State University (MSU)',
    chapterCode: 'YARA-MSU-01',
    defaultChapterName: 'YARA Midlands State University (MSU) Chapter'
  },
  'Manicaland': {
    universityName: 'Manicaland State University of Applied Sciences (MSUAS)',
    chapterCode: 'YARA-MSUAS-01',
    defaultChapterName: 'YARA Manicaland State University Chapter'
  },
  'Masvingo': {
    universityName: 'Great Zimbabwe University (GZU)',
    chapterCode: 'YARA-GZU-01',
    defaultChapterName: 'YARA Great Zimbabwe University (GZU) Chapter'
  },
  'Mashonaland Central': {
    universityName: 'Bindura University of Science Education (BUSE)',
    chapterCode: 'YARA-BUSE-01',
    defaultChapterName: 'YARA Bindura University (BUSE) Chapter'
  },
  'Mashonaland East': {
    universityName: 'Marondera University of Agricultural Sciences and Technology (MUAST)',
    chapterCode: 'YARA-MUAST-01',
    defaultChapterName: 'YARA MUAST Mashonaland East Chapter'
  },
  'Matabeleland North': {
    universityName: 'Lupane State University (LSU)',
    chapterCode: 'YARA-LSU-01',
    defaultChapterName: 'YARA Lupane State University (LSU) Chapter'
  },
  'Matabeleland South': {
    universityName: 'Gwanda State University (GSU)',
    chapterCode: 'YARA-GSU-01',
    defaultChapterName: 'YARA Gwanda State University (GSU) Chapter'
  }
};

export function formatRoleName(role: ChapterLeaderRole | string): string {
  switch (role) {
    case 'chairperson':
      return 'President / Chairperson';
    case 'vice_chair':
      return 'Vice President / Vice Chair';
    case 'secretary':
      return 'Secretary General';
    case 'vice_secretary':
      return 'Vice Secretary';
    case 'treasurer':
      return 'Treasurer / Finance Lead';
    case 'tech_lead':
      return 'Technical Lead / Robotics Marshal';
    case 'public_relations':
      return 'Communications & PR';
    case 'patron_advisor':
      return 'Faculty Patron / Advisor';
    default:
      return role.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }
}

const INITIAL_CHAPTERS: Chapter[] = [];

const INITIAL_REGISTRATION_REQUESTS: ChapterRegistrationRequest[] = [];

export function getLocal<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    if (!item) return fallback;
    let parsed = JSON.parse(item);
    if (!parsed) return fallback;

    // Purge deprecated mock chapter IDs if present in cache
    if (key === 'yara_chapters_data' && Array.isArray(parsed)) {
      const mockIds = ['ch-cut-01', 'ch-kut-06', 'ch-chinhoyi-high-07', 'ch-uz-02', 'ch-byo-03', 'ch-pe-04', 'ch-pri-05'];
      parsed = parsed.filter((c: any) => !mockIds.includes(c?.id));
    }
    if (key === 'yara_chapter_registration_requests' && Array.isArray(parsed)) {
      parsed = parsed.filter((r: any) => r?.id !== 'req-msu-01');
    }
    if (key === 'yara_chapter_reports' && Array.isArray(parsed)) {
      const mockReportIds = ['rep-cut-2026-01', 'rep-cut-fin-2026', 'rep-pe-2026-02'];
      parsed = parsed.filter((r: any) => !mockReportIds.includes(r?.id));
    }
    return parsed as T;
  } catch {
    return fallback;
  }
}

export function setLocal<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore
  }
}

// -------------------------------------------------------------
// USER CHAPTER AUTO-DETECTION UPON SIGN-IN / SIGN-UP
// -------------------------------------------------------------

export interface DetectedUserAffiliation {
  chapter: Chapter;
  matchedMember?: ChapterMember;
  matchedLeader?: ChapterLeader;
  role: string;
  isLeader: boolean;
  matchField: 'email' | 'name' | 'phone';
  provincialLeadInfo?: {
    isLeadUniversity: boolean;
    assignedLeadName?: string;
  };
}

/**
 * Automatically inspects user's email, name, or phone number against all active chapters
 * to determine their registered chapter affiliation and role.
 */
export async function detectUserChapter(
  userQuery?: { email?: string | null; name?: string | null; phone?: string | null } | string
): Promise<DetectedUserAffiliation | null> {
  let email = '';
  let name = '';
  let phone = '';

  if (typeof userQuery === 'string') {
    const q = userQuery.trim().toLowerCase();
    if (q.includes('@')) {
      email = q;
    } else if (/^(\+?[0-9\s-]{7,})$/.test(q)) {
      phone = q.replace(/[\s-]/g, '');
    } else {
      name = q;
    }
  } else if (userQuery) {
    email = (userQuery.email || '').trim().toLowerCase();
    name = (userQuery.name || '').trim().toLowerCase();
    phone = (userQuery.phone || '').replace(/[\s-]/g, '');
  }

  if (!email && !name && !phone) return null;

  const chapters = await getChapters(true);

  for (const ch of chapters) {
    // 1. Check leaders list
    if (ch.leaders && ch.leaders.length > 0) {
      for (const leader of ch.leaders) {
        const lEmail = (leader.email || '').trim().toLowerCase();
        const lName = (leader.name || '').trim().toLowerCase();
        const lPhone = (leader.phone || '').replace(/[\s-]/g, '');

        if (email && lEmail && lEmail === email) {
          return {
            chapter: ch,
            matchedLeader: leader,
            role: formatRoleName(leader.role),
            isLeader: true,
            matchField: 'email',
            provincialLeadInfo: {
              isLeadUniversity: !!ch.is_provincial_lead_university,
              assignedLeadName: ch.assigned_provincial_university_name
            }
          };
        }

        if (name && lName && (lName === name || lName.includes(name) || name.includes(lName))) {
          return {
            chapter: ch,
            matchedLeader: leader,
            role: formatRoleName(leader.role),
            isLeader: true,
            matchField: 'name',
            provincialLeadInfo: {
              isLeadUniversity: !!ch.is_provincial_lead_university,
              assignedLeadName: ch.assigned_provincial_university_name
            }
          };
        }

        if (phone && lPhone && (lPhone === phone || lPhone.endsWith(phone.slice(-9)))) {
          return {
            chapter: ch,
            matchedLeader: leader,
            role: formatRoleName(leader.role),
            isLeader: true,
            matchField: 'phone',
            provincialLeadInfo: {
              isLeadUniversity: !!ch.is_provincial_lead_university,
              assignedLeadName: ch.assigned_provincial_university_name
            }
          };
        }
      }
    }

    // 2. Check general members roster
    if (ch.members && ch.members.length > 0) {
      for (const mem of ch.members) {
        const mEmail = (mem.email || '').trim().toLowerCase();
        const mName = (mem.name || '').trim().toLowerCase();
        const mPhone = (mem.phone || '').replace(/[\s-]/g, '');

        if (email && mEmail && mEmail === email) {
          return {
            chapter: ch,
            matchedMember: mem,
            role: mem.role || 'Member',
            isLeader: !!mem.is_leadership,
            matchField: 'email',
            provincialLeadInfo: {
              isLeadUniversity: !!ch.is_provincial_lead_university,
              assignedLeadName: ch.assigned_provincial_university_name
            }
          };
        }

        if (name && mName && (mName === name || mName.includes(name) || name.includes(mName))) {
          return {
            chapter: ch,
            matchedMember: mem,
            role: mem.role || 'Member',
            isLeader: !!mem.is_leadership,
            matchField: 'name',
            provincialLeadInfo: {
              isLeadUniversity: !!ch.is_provincial_lead_university,
              assignedLeadName: ch.assigned_provincial_university_name
            }
          };
        }

        if (phone && mPhone && (mPhone === phone || mPhone.endsWith(phone.slice(-9)))) {
          return {
            chapter: ch,
            matchedMember: mem,
            role: mem.role || 'Member',
            isLeader: !!mem.is_leadership,
            matchField: 'phone',
            provincialLeadInfo: {
              isLeadUniversity: !!ch.is_provincial_lead_university,
              assignedLeadName: ch.assigned_provincial_university_name
            }
          };
        }
      }
    }
  }

  return null;
}

// -------------------------------------------------------------
// CHAPTER REGISTRATION & ADMIN APPROVAL WORKFLOW
// -------------------------------------------------------------

export async function getChapterRegistrationRequests(): Promise<ChapterRegistrationRequest[]> {
  const localReqs = getLocal<ChapterRegistrationRequest[]>('yara_chapter_registration_requests', INITIAL_REGISTRATION_REQUESTS);
  try {
    const { data, error } = await supabase.from('chapter_registration_requests').select('*').order('created_at', { ascending: false });
    if (!error && data && data.length > 0) {
      return data;
    }
  } catch {
    // fallback to local
  }
  return localReqs;
}

export async function submitChapterRegistrationRequest(
  request: Omit<ChapterRegistrationRequest, 'id' | 'status' | 'created_at' | 'updated_at'>
): Promise<ChapterRegistrationRequest> {
  // Enforce YARA in proposed name
  let name = request.proposed_name.trim();
  if (!/^YARA\b/i.test(name) && !name.includes('YARA')) {
    name = `YARA ${name}`;
  }

  // Determine provincial university lead alignment
  const provinceLead = PROVINCIAL_LEAD_UNIVERSITIES[request.province];
  const isProvincialLead = request.category === 'university' && (!request.assigned_provincial_university_name || request.assigned_provincial_university_name.includes(request.institution_or_community));

  const newRequest: ChapterRegistrationRequest = {
    ...request,
    proposed_name: name,
    id: 'req-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 6),
    status: 'pending',
    assigned_provincial_university_name: isProvincialLead 
      ? `${request.institution_or_community} [Designated Provincial University Lead]`
      : (provinceLead ? provinceLead.defaultChapterName : request.assigned_provincial_university_name),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  const requests = getLocal<ChapterRegistrationRequest[]>('yara_chapter_registration_requests', INITIAL_REGISTRATION_REQUESTS);
  const updated = [newRequest, ...requests];
  setLocal('yara_chapter_registration_requests', updated);

  try {
    await supabase.from('chapter_registration_requests').insert(newRequest);
  } catch {
    // safe fallback
  }

  return newRequest;
}

export async function approveChapterRegistration(
  requestId: string,
  adminNotes?: string,
  adminName: string = 'National Executive Secretariat'
): Promise<Chapter | null> {
  const requests = getLocal<ChapterRegistrationRequest[]>('yara_chapter_registration_requests', INITIAL_REGISTRATION_REQUESTS);
  const reqIdx = requests.findIndex(r => r.id === requestId);
  if (reqIdx < 0) return null;

  const req = requests[reqIdx];
  req.status = 'approved';
  req.admin_notes = adminNotes || 'Approved by National Executive. Chapter is officially chartered.';
  req.updated_at = new Date().toISOString();
  setLocal('yara_chapter_registration_requests', requests);

  // Generate unique chapter code
  const provinceAbbr = (req.province || 'ZW').replace(/[^a-zA-Z]/g, '').substring(0, 3).toUpperCase();
  const instAbbr = (req.institution_or_community || 'CH').replace(/[^a-zA-Z]/g, '').substring(0, 3).toUpperCase();
  const code = `YARA-${provinceAbbr}-${instAbbr}-${Math.floor(10 + Math.random() * 90)}`;

  const isProvLead = req.category === 'university';

  // Prepare approved leaders list with pins
  const approvedLeaders = (req.leaders || []).map(l => ({
    ...l,
    is_approved_by_admin: true,
    approved_by_admin_at: new Date().toISOString(),
    approved_by_admin_name: adminName,
    access_pin: `${code}-${l.role.substring(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`,
    can_submit_general_reports: true,
    can_submit_financial_reports: ['chairperson', 'secretary', 'treasurer'].includes(l.role)
  }));

  // Build new chapter
  const newChapter: Chapter = {
    id: 'ch-' + Date.now().toString(36),
    name: req.proposed_name,
    code,
    category: req.category,
    institution_or_community: req.institution_or_community,
    province: req.province,
    district_or_city: req.district_or_city,
    banner_url: req.banner_url || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80',
    logo_url: req.logo_url || 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=200&q=80',
    description: req.description,
    established_date: new Date().toISOString().split('T')[0],
    status: 'chartered',
    approval_status: 'approved',
    registration_request_id: req.id,
    is_provincial_lead_university: isProvLead,
    assigned_provincial_university_name: req.assigned_provincial_university_name,
    total_members_count: req.total_members_count || (req.members?.length || 1),
    active_projects_count: 0,
    public_email: req.public_email,
    public_phone: req.public_phone,
    meeting_schedule: req.meeting_schedule,
    physical_location: req.physical_location,
    focus_areas: req.focus_areas && req.focus_areas.length > 0 ? req.focus_areas : ['Robotics', 'STEM', 'Community Innovation'],
    leaders: approvedLeaders,
    members: req.members || [],
    projects: [],
    activities: [],
    patron_advisor: req.patron_advisor,
    confidential_info: {
      internal_budget_balance_usd: 0,
      national_patron_supervisor: adminName,
      private_executive_notes: `Charter approved on ${new Date().toLocaleDateString()}. Initial setup grant pending.`
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  const chapters = getLocal<Chapter[]>('yara_chapters_data', INITIAL_CHAPTERS);
  const updatedChapters = [newChapter, ...chapters];
  setLocal('yara_chapters_data', updatedChapters);

  try {
    await supabase.from('chapters').insert(newChapter);
    await supabase.from('chapter_registration_requests').update({
      status: 'approved',
      admin_notes: req.admin_notes,
      updated_at: req.updated_at
    }).eq('id', requestId);
  } catch {
    // fallback
  }

  return newChapter;
}

export async function rejectChapterRegistration(
  requestId: string,
  adminNotes: string
): Promise<boolean> {
  const requests = getLocal<ChapterRegistrationRequest[]>('yara_chapter_registration_requests', INITIAL_REGISTRATION_REQUESTS);
  const reqIdx = requests.findIndex(r => r.id === requestId);
  if (reqIdx < 0) return false;

  requests[reqIdx].status = 'rejected';
  requests[reqIdx].admin_notes = adminNotes;
  requests[reqIdx].updated_at = new Date().toISOString();
  setLocal('yara_chapter_registration_requests', requests);

  try {
    await supabase.from('chapter_registration_requests').update({
      status: 'rejected',
      admin_notes: adminNotes,
      updated_at: requests[reqIdx].updated_at
    }).eq('id', requestId);
  } catch {
    // fallback
  }

  return true;
}

// -------------------------------------------------------------
// CHAPTER MEMBERS ROSTER MANAGEMENT
// -------------------------------------------------------------

export async function addChapterMember(
  chapterId: string,
  member: Omit<ChapterMember, 'id'>
): Promise<Chapter | null> {
  const chapters = getLocal<Chapter[]>('yara_chapters_data', INITIAL_CHAPTERS);
  const chIdx = chapters.findIndex(c => c.id === chapterId);
  if (chIdx < 0) return null;

  const newMember: ChapterMember = {
    ...member,
    id: 'mem-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 6),
    joined_date: member.joined_date || new Date().toISOString().split('T')[0],
    status: member.status || 'active'
  };

  const existingMembers = chapters[chIdx].members || [];
  chapters[chIdx].members = [newMember, ...existingMembers];
  chapters[chIdx].total_members_count = chapters[chIdx].members.length;
  chapters[chIdx].updated_at = new Date().toISOString();

  setLocal('yara_chapters_data', chapters);

  try {
    await supabase.from('chapters').update({
      members: chapters[chIdx].members,
      total_members_count: chapters[chIdx].total_members_count,
      updated_at: chapters[chIdx].updated_at
    }).eq('id', chapterId);
  } catch {
    // fallback
  }

  return chapters[chIdx];
}

export async function updateChapterMember(
  chapterId: string,
  memberId: string,
  updates: Partial<ChapterMember>
): Promise<Chapter | null> {
  const chapters = getLocal<Chapter[]>('yara_chapters_data', INITIAL_CHAPTERS);
  const chIdx = chapters.findIndex(c => c.id === chapterId);
  if (chIdx < 0) return null;

  const members = chapters[chIdx].members || [];
  const mIdx = members.findIndex(m => m.id === memberId);
  if (mIdx < 0) return null;

  members[mIdx] = { ...members[mIdx], ...updates };
  chapters[chIdx].members = members;
  chapters[chIdx].updated_at = new Date().toISOString();

  setLocal('yara_chapters_data', chapters);

  try {
    await supabase.from('chapters').update({
      members: chapters[chIdx].members,
      updated_at: chapters[chIdx].updated_at
    }).eq('id', chapterId);
  } catch {
    // fallback
  }

  return chapters[chIdx];
}

export async function deleteChapterMember(
  chapterId: string,
  memberId: string
): Promise<Chapter | null> {
  const chapters = getLocal<Chapter[]>('yara_chapters_data', INITIAL_CHAPTERS);
  const chIdx = chapters.findIndex(c => c.id === chapterId);
  if (chIdx < 0) return null;

  const members = (chapters[chIdx].members || []).filter(m => m.id !== memberId);
  chapters[chIdx].members = members;
  chapters[chIdx].total_members_count = members.length;
  chapters[chIdx].updated_at = new Date().toISOString();

  setLocal('yara_chapters_data', chapters);

  try {
    await supabase.from('chapters').update({
      members: chapters[chIdx].members,
      total_members_count: chapters[chIdx].total_members_count,
      updated_at: chapters[chIdx].updated_at
    }).eq('id', chapterId);
  } catch {
    // fallback
  }

  return chapters[chIdx];
}

// -------------------------------------------------------------
// CHAPTER RETRIEVAL & CRUD
// -------------------------------------------------------------

export async function getChapters(includeConfidential: boolean = false): Promise<Chapter[]> {
  // Load the persistent deleted-ID blacklist so deleted items never reappear
  const deletedIds = getLocal<string[]>('yara_chapters_deleted_ids', []);
  const applyDeleteFilter = (chs: Chapter[]) => 
    deletedIds.length > 0 ? chs.filter(c => !deletedIds.includes(c.id)) : chs;

  const local = applyDeleteFilter(getLocal<Chapter[]>('yara_chapters_data', INITIAL_CHAPTERS));
  try {
    const { data, error } = await supabase.from('chapters').select('*').order('created_at', { ascending: false });
    if (!error && data && data.length > 0) {
      const filtered = applyDeleteFilter(data);
      // Also update local cache with latest Supabase data
      setLocal('yara_chapters_data', filtered);
      if (!includeConfidential) {
        return filtered.map(ch => ({
          ...ch,
          confidential_info: undefined
        }));
      }
      return filtered;
    }
  } catch {
    // fallback to local
  }

  if (!includeConfidential) {
    return local.map(ch => ({
      ...ch,
      confidential_info: undefined
    }));
  }
  return local;
}

export async function getChapterById(id: string, includeConfidential: boolean = false): Promise<Chapter | null> {
  const chapters = await getChapters(includeConfidential);
  return chapters.find(c => c.id === id) || null;
}

export async function createChapter(chapter: Omit<Chapter, 'id' | 'created_at' | 'updated_at'>): Promise<Chapter> {
  const newChapter: Chapter = {
    ...chapter,
    id: 'ch-' + Date.now().toString(36),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  const chapters = getLocal<Chapter[]>('yara_chapters_data', INITIAL_CHAPTERS);
  const updated = [newChapter, ...chapters];
  setLocal('yara_chapters_data', updated);

  try {
    await supabase.from('chapters').insert(newChapter);
  } catch {
    // fallback
  }

  return newChapter;
}

export async function updateChapter(id: string, updates: Partial<Chapter>): Promise<Chapter | null> {
  const chapters = getLocal<Chapter[]>('yara_chapters_data', INITIAL_CHAPTERS);
  const idx = chapters.findIndex(c => c.id === id);
  if (idx < 0) return null;

  chapters[idx] = {
    ...chapters[idx],
    ...updates,
    updated_at: new Date().toISOString()
  };

  setLocal('yara_chapters_data', chapters);

  try {
    await supabase.from('chapters').update(chapters[idx]).eq('id', id);
  } catch {
    // fallback
  }

  return chapters[idx];
}

export async function deleteChapter(id: string): Promise<boolean> {
  // 1. Add to permanently-deleted blacklist so it doesn't reappear from seed data
  const deletedIds = getLocal<string[]>('yara_chapters_deleted_ids', []);
  if (!deletedIds.includes(id)) {
    setLocal('yara_chapters_deleted_ids', [...deletedIds, id]);
  }

  // 2. Remove from local chapters cache
  const chapters = getLocal<Chapter[]>('yara_chapters_data', INITIAL_CHAPTERS);
  const filtered = chapters.filter(c => c.id !== id);
  setLocal('yara_chapters_data', filtered);

  // 3. Delete from Supabase
  try {
    await supabase.from('chapters').delete().eq('id', id);
  } catch {
    // fallback
  }

  return true;
}

// -------------------------------------------------------------
// LEADERSHIP VERIFICATION & AUDIT PIN HELPERS
// -------------------------------------------------------------

export interface LeadershipVerificationResult {
  isAuthorized: boolean;
  isApprovedSecretary?: boolean;
  matchedLeaderId?: string;
  matchedLeaderName?: string;
  matchedRole?: string;
  matchedRoleType?: ChapterLeaderRole | string;
  verificationMethod?: 'roster_email' | 'access_pin' | 'admin_override' | 'auth_session';
  approvedAt?: string;
  approvedBy?: string;
  canSubmitGeneralReports?: boolean;
  canSubmitFinancialReports?: boolean;
  reason?: string;
}

export function verifyLeadershipAuthorization(
  chapter: Chapter,
  submitterEmail?: string,
  submitterName?: string,
  accessPin?: string,
  isAdmin: boolean = false,
  reportCategory: 'general' | 'financial' | 'project_milestone' = 'general',
  authenticatedUserEmail?: string
): LeadershipVerificationResult {
  if (isAdmin) {
    return {
      isAuthorized: true,
      isApprovedSecretary: true,
      matchedRole: 'National Executive Administrator',
      verificationMethod: 'admin_override',
      canSubmitGeneralReports: true,
      canSubmitFinancialReports: true
    };
  }

  const cleanPin = accessPin ? accessPin.trim().toUpperCase() : '';
  const authEmail = authenticatedUserEmail ? authenticatedUserEmail.trim().toLowerCase() : '';
  const cleanEmail = submitterEmail ? submitterEmail.trim().toLowerCase() : '';

  // 1. PIN verification (Highest authority for designated approved individuals)
  if (cleanPin && chapter.leaders && chapter.leaders.length > 0) {
    const pinMatchedLeader = chapter.leaders.find(
      l => (l.access_pin && l.access_pin.toUpperCase() === cleanPin) ||
           (l.secretary_access_pin && l.secretary_access_pin.toUpperCase() === cleanPin)
    );

    if (pinMatchedLeader) {
      if (pinMatchedLeader.is_approved_by_admin === false) {
        return {
          isAuthorized: false,
          isApprovedSecretary: false,
          reason: `Approval Pending: ${pinMatchedLeader.name} (${formatRoleName(pinMatchedLeader.role)}) is registered on ${chapter.name}, but has not been approved by the National Executive Administrator yet.`
        };
      }

      const isFinancialRole = ['treasurer', 'chairperson', 'secretary', 'vice_chair', 'vice_secretary'].includes(pinMatchedLeader.role);
      const isGeneralRole = ['secretary', 'vice_secretary', 'chairperson', 'vice_chair'].includes(pinMatchedLeader.role);

      const canDoFinancial = pinMatchedLeader.can_submit_financial_reports ?? isFinancialRole;
      const canDoGeneral = pinMatchedLeader.can_submit_general_reports ?? isGeneralRole;

      if (reportCategory === 'financial' && !canDoFinancial) {
        return {
          isAuthorized: false,
          isApprovedSecretary: false,
          reason: `Permission Restriction: ${pinMatchedLeader.name} (${formatRoleName(pinMatchedLeader.role)}) has not been granted administrative permission to submit financial statements.`
        };
      }

      if (reportCategory !== 'financial' && !canDoGeneral) {
        return {
          isAuthorized: false,
          isApprovedSecretary: false,
          reason: `Permission Restriction: ${pinMatchedLeader.name} (${formatRoleName(pinMatchedLeader.role)}) has not been granted administrative permission to submit general chapter reports.`
        };
      }

      return {
        isAuthorized: true,
        isApprovedSecretary: true,
        matchedLeaderId: pinMatchedLeader.id,
        matchedLeaderName: pinMatchedLeader.name,
        matchedRole: `${formatRoleName(pinMatchedLeader.role)} (Admin-Approved)`,
        matchedRoleType: pinMatchedLeader.role,
        verificationMethod: 'access_pin',
        approvedAt: pinMatchedLeader.approved_by_admin_at,
        approvedBy: pinMatchedLeader.approved_by_admin_name || 'National Executive Admin',
        canSubmitGeneralReports: canDoGeneral,
        canSubmitFinancialReports: canDoFinancial
      };
    } else {
      return {
        isAuthorized: false,
        isApprovedSecretary: false,
        reason: `Invalid Access PIN: The PIN entered does not match any admin-approved individual for ${chapter.name}.`
      };
    }
  }

  // 2. Authenticated user session verification (Logged-in user email matching approved leader on chapter)
  const effectiveEmail = authEmail || cleanEmail;
  if (effectiveEmail && chapter.leaders && chapter.leaders.length > 0) {
    const leaderByEmail = chapter.leaders.find(l => l.email?.toLowerCase() === effectiveEmail);

    if (leaderByEmail) {
      if (leaderByEmail.is_approved_by_admin === false) {
        return {
          isAuthorized: false,
          isApprovedSecretary: false,
          reason: `Approval Pending: ${leaderByEmail.name} is on the roster for ${chapter.name}, but report submission access has NOT been approved by the National Executive Admin in the dashboard.`
        };
      }

      const isFinancialRole = ['treasurer', 'chairperson', 'secretary', 'vice_chair', 'vice_secretary'].includes(leaderByEmail.role);
      const isGeneralRole = ['secretary', 'vice_secretary', 'chairperson', 'vice_chair'].includes(leaderByEmail.role);

      const canDoFinancial = leaderByEmail.can_submit_financial_reports ?? isFinancialRole;
      const canDoGeneral = leaderByEmail.can_submit_general_reports ?? isGeneralRole;

      if (reportCategory === 'financial' && !canDoFinancial) {
        return {
          isAuthorized: false,
          isApprovedSecretary: false,
          reason: `Permission Restriction: ${leaderByEmail.name} is registered as ${formatRoleName(leaderByEmail.role)}, but has not been granted permission by an administrator to submit financial statements.`
        };
      }

      if (reportCategory !== 'financial' && !canDoGeneral) {
        return {
          isAuthorized: false,
          isApprovedSecretary: false,
          reason: `Permission Restriction: ${leaderByEmail.name} is registered as ${formatRoleName(leaderByEmail.role)}, but has not been granted permission by an administrator to submit general chapter reports.`
        };
      }

      // If user is authenticated via session matching this leader's email
      if (authEmail && authEmail === leaderByEmail.email?.toLowerCase()) {
        return {
          isAuthorized: true,
          isApprovedSecretary: true,
          matchedLeaderId: leaderByEmail.id,
          matchedLeaderName: leaderByEmail.name,
          matchedRole: `${formatRoleName(leaderByEmail.role)} (Admin-Approved)`,
          matchedRoleType: leaderByEmail.role,
          verificationMethod: 'auth_session',
          approvedAt: leaderByEmail.approved_by_admin_at,
          approvedBy: leaderByEmail.approved_by_admin_name || 'National Executive Admin',
          canSubmitGeneralReports: canDoGeneral,
          canSubmitFinancialReports: canDoFinancial
        };
      }
    }
  }

  return {
    isAuthorized: false,
    isApprovedSecretary: false,
    reason: `Access Restricted: You are not authorized to submit reports for ${chapter.name}. Only individuals approved by a YARA National Administrator can submit reports. If you have been approved, please enter your Admin-Assigned Access PIN.`
  };
}

export function verifySecretaryAuthorization(
  chapter: Chapter,
  submitterEmail?: string,
  submitterName?: string,
  secretarialAccessPin?: string,
  isAdmin: boolean = false,
  reportCategory: 'general' | 'financial' | 'project_milestone' = 'general',
  authenticatedUserEmail?: string
): LeadershipVerificationResult {
  return verifyLeadershipAuthorization(
    chapter,
    submitterEmail,
    submitterName,
    secretarialAccessPin,
    isAdmin,
    reportCategory,
    authenticatedUserEmail
  );
}

export async function approveChapterLeader(
  chapterId: string, 
  leaderId: string, 
  permissions?: {
    can_submit_general_reports?: boolean;
    can_submit_financial_reports?: boolean;
    access_pin?: string;
  },
  adminName: string = 'National Executive Admin'
): Promise<Chapter | null> {
  const chapters = getLocal<Chapter[]>('yara_chapters_data', INITIAL_CHAPTERS);
  const chIdx = chapters.findIndex(c => c.id === chapterId);
  if (chIdx < 0) return null;

  const targetLeader = (chapters[chIdx].leaders || []).find(l => l.id === leaderId);
  if (!targetLeader) return null;

  const rolePrefix = targetLeader.role === 'treasurer' ? 'TREAS' : targetLeader.role === 'chairperson' ? 'PRES' : 'SEC';
  const cleanCode = chapters[chIdx].code.replace(/[^A-Z0-9]/gi, '');
  const generatedPin = permissions?.access_pin || `${cleanCode}-${rolePrefix}-${Math.floor(1000 + Math.random() * 9000)}`;

  const isFinancialDefault = ['treasurer', 'chairperson', 'secretary'].includes(targetLeader.role);
  const isGeneralDefault = ['secretary', 'vice_secretary', 'chairperson'].includes(targetLeader.role);

  targetLeader.is_approved_by_admin = true;
  targetLeader.approved_by_admin_at = new Date().toISOString();
  targetLeader.approved_by_admin_name = adminName;
  targetLeader.access_pin = generatedPin;
  targetLeader.secretary_access_pin = generatedPin;
  targetLeader.can_submit_general_reports = permissions?.can_submit_general_reports ?? isGeneralDefault;
  targetLeader.can_submit_financial_reports = permissions?.can_submit_financial_reports ?? isFinancialDefault;

  setLocal('yara_chapters_data', chapters);

  try {
    await supabase.from('chapters').update({
      leaders: chapters[chIdx].leaders,
      updated_at: new Date().toISOString()
    }).eq('id', chapterId);
  } catch {
    // fallback
  }

  return chapters[chIdx];
}

export async function revokeChapterLeaderApproval(
  chapterId: string,
  leaderId: string
): Promise<Chapter | null> {
  const chapters = getLocal<Chapter[]>('yara_chapters_data', INITIAL_CHAPTERS);
  const chIdx = chapters.findIndex(c => c.id === chapterId);
  if (chIdx < 0) return null;

  const targetLeader = (chapters[chIdx].leaders || []).find(l => l.id === leaderId);
  if (!targetLeader) return null;

  targetLeader.is_approved_by_admin = false;
  targetLeader.approved_by_admin_at = undefined;
  targetLeader.approved_by_admin_name = undefined;
  targetLeader.access_pin = undefined;
  targetLeader.secretary_access_pin = undefined;

  setLocal('yara_chapters_data', chapters);

  try {
    await supabase.from('chapters').update({
      leaders: chapters[chIdx].leaders,
      updated_at: new Date().toISOString()
    }).eq('id', chapterId);
  } catch {
    // fallback
  }

  return chapters[chIdx];
}

export const approveChapterSecretary = approveChapterLeader;
export const revokeChapterSecretary = revokeChapterLeaderApproval;

export async function addChapterLeader(
  chapterId: string,
  leader: Omit<ChapterLeader, 'id'>
): Promise<Chapter | null> {
  const chapters = getLocal<Chapter[]>('yara_chapters_data', INITIAL_CHAPTERS);
  const chIdx = chapters.findIndex(c => c.id === chapterId);
  if (chIdx < 0) return null;

  const cleanCode = chapters[chIdx].code.replace(/[^A-Z0-9]/gi, '');
  const rolePrefix = leader.role === 'treasurer' ? 'TREAS' : leader.role === 'chairperson' ? 'PRES' : 'SEC';
  const accessPin = leader.access_pin || `${cleanCode}-${rolePrefix}-${Math.floor(1000 + Math.random() * 9000)}`;

  const newLeader: ChapterLeader = {
    ...leader,
    id: 'lead-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 6),
    access_pin: accessPin,
    secretary_access_pin: accessPin,
    is_approved_by_admin: leader.is_approved_by_admin ?? true,
    approved_by_admin_at: leader.is_approved_by_admin ? new Date().toISOString() : undefined,
    approved_by_admin_name: leader.is_approved_by_admin ? 'National Executive Admin' : undefined
  };

  const leaders = chapters[chIdx].leaders || [];
  chapters[chIdx].leaders = [...leaders, newLeader];
  chapters[chIdx].updated_at = new Date().toISOString();

  setLocal('yara_chapters_data', chapters);

  try {
    await supabase.from('chapters').update({
      leaders: chapters[chIdx].leaders,
      updated_at: chapters[chIdx].updated_at
    }).eq('id', chapterId);
  } catch {
    // fallback
  }

  return chapters[chIdx];
}

export async function updateChapterLeader(
  chapterId: string,
  leaderId: string,
  updates: Partial<ChapterLeader>
): Promise<Chapter | null> {
  const chapters = getLocal<Chapter[]>('yara_chapters_data', INITIAL_CHAPTERS);
  const chIdx = chapters.findIndex(c => c.id === chapterId);
  if (chIdx < 0) return null;

  const leaders = chapters[chIdx].leaders || [];
  const lIdx = leaders.findIndex(l => l.id === leaderId);
  if (lIdx < 0) return null;

  leaders[lIdx] = { ...leaders[lIdx], ...updates };
  chapters[chIdx].leaders = leaders;
  chapters[chIdx].updated_at = new Date().toISOString();

  setLocal('yara_chapters_data', chapters);

  try {
    await supabase.from('chapters').update({
      leaders: chapters[chIdx].leaders,
      updated_at: chapters[chIdx].updated_at
    }).eq('id', chapterId);
  } catch {
    // fallback
  }

  return chapters[chIdx];
}

export async function deleteChapterLeader(
  chapterId: string,
  leaderId: string
): Promise<Chapter | null> {
  const chapters = getLocal<Chapter[]>('yara_chapters_data', INITIAL_CHAPTERS);
  const chIdx = chapters.findIndex(c => c.id === chapterId);
  if (chIdx < 0) return null;

  const leaders = (chapters[chIdx].leaders || []).filter(l => l.id !== leaderId);
  chapters[chIdx].leaders = leaders;
  chapters[chIdx].updated_at = new Date().toISOString();

  setLocal('yara_chapters_data', chapters);

  try {
    await supabase.from('chapters').update({
      leaders: chapters[chIdx].leaders,
      updated_at: chapters[chIdx].updated_at
    }).eq('id', chapterId);
  } catch {
    // fallback
  }

  return chapters[chIdx];
}

// -------------------------------------------------------------
// CHAPTER REPORTS
// -------------------------------------------------------------

const INITIAL_REPORTS: ChapterReport[] = [];

export async function getChapterReports(chapterId?: string): Promise<ChapterReport[]> {
  const local = getLocal<ChapterReport[]>('yara_chapter_reports', INITIAL_REPORTS);
  let allReports = local;

  try {
    const { data, error } = await supabase.from('chapter_reports').select('*').order('submitted_at', { ascending: false });
    if (!error && data && data.length > 0) {
      allReports = data;
    }
  } catch {
    // fallback
  }

  if (chapterId) {
    return allReports.filter(r => r.chapter_id === chapterId);
  }
  return allReports;
}

export async function submitChapterReport(
  reportData: Omit<ChapterReport, 'id' | 'submitted_at' | 'status' | 'is_locked' | 'locked_at' | 'locked_by_name' | 'document_seal_code' | 'leadership_verified' | 'leadership_approved_by_admin' | 'secretary_verified' | 'secretary_approved_by_admin'>,
  options?: {
    secretarialAccessPin?: string;
    isAdmin?: boolean;
    authenticatedUserEmail?: string;
  }
): Promise<ChapterReport> {
  const chapters = getLocal<Chapter[]>('yara_chapters_data', INITIAL_CHAPTERS);
  const chapter = chapters.find(c => c.id === reportData.chapter_id);
  if (!chapter) {
    throw new Error('Chapter not found in registry.');
  }

  const category = reportData.report_category || (reportData.period_type === 'financial' ? 'financial' : 'general');

  const verification = verifyLeadershipAuthorization(
    chapter,
    reportData.submitted_by_email,
    reportData.submitted_by_name,
    options?.secretarialAccessPin,
    options?.isAdmin || false,
    category,
    options?.authenticatedUserEmail
  );

  if (!verification.isAuthorized) {
    throw new Error(verification.reason || 'Unauthorized report submission.');
  }

  const now = new Date().toISOString();
  const shouldLock = true;
  const sealCode = `YARA-SEAL-${chapter.code.replace(/[^A-Z0-9]/gi, '')}-${Date.now().toString(36).toUpperCase()}`;

  const newReport: ChapterReport = {
    chapter_id: reportData.chapter_id,
    chapter_name: reportData.chapter_name,
    chapter_category: reportData.chapter_category,
    report_title: reportData.report_title,
    report_category: category,
    period_type: reportData.period_type,
    period_date: reportData.period_date,
    submitted_by_name: reportData.submitted_by_name,
    submitted_by_role: verification.matchedRole || reportData.submitted_by_role || 'Approved Chapter Leader',
    submitted_by_email: reportData.submitted_by_email,
    submitted_by_leader_id: verification.matchedLeaderId,
    executive_summary: reportData.executive_summary,
    activities_undertaken: reportData.activities_undertaken,
    attendance_count: reportData.attendance_count,
    hardware_projects_update: reportData.hardware_projects_update,
    challenges_and_needs: reportData.challenges_and_needs,
    report_document_url: reportData.report_document_url,
    financial_statement_url: reportData.financial_statement_url,
    financial_data: reportData.financial_data,
    supporting_images: reportData.supporting_images,
    id: 'rep-' + Date.now().toString(36),
    submitted_at: now,
    status: 'submitted',
    is_locked: shouldLock,
    locked_at: shouldLock ? now : undefined,
    locked_by_name: shouldLock ? `${reportData.submitted_by_name} (${verification.matchedRole || 'Approved Leader'})` : undefined,
    leadership_verified: true,
    leadership_approved_by_admin: true,
    secretary_verified: true,
    secretary_approved_by_admin: true,
    leadership_verification_method: verification.verificationMethod || 'roster_email',
    secretary_verification_method: verification.verificationMethod || 'roster_email',
    document_seal_code: sealCode
  };

  const reports = getLocal<ChapterReport[]>('yara_chapter_reports', INITIAL_REPORTS);
  const updated = [newReport, ...reports];
  setLocal('yara_chapter_reports', updated);

  try {
    await supabase.from('chapter_reports').insert(newReport);
  } catch {
    // fallback
  }

  return newReport;
}

export async function toggleChapterReportLock(
  reportId: string, 
  locked: boolean, 
  operatorName: string = 'National Executive'
): Promise<ChapterReport | null> {
  const reports = getLocal<ChapterReport[]>('yara_chapter_reports', INITIAL_REPORTS);
  const idx = reports.findIndex(r => r.id === reportId);
  if (idx < 0) return null;

  reports[idx].is_locked = locked;
  if (locked) {
    reports[idx].locked_at = new Date().toISOString();
    reports[idx].locked_by_name = operatorName;
    if (!reports[idx].document_seal_code) {
      reports[idx].document_seal_code = `YARA-SEAL-NAT-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    }
  }

  setLocal('yara_chapter_reports', reports);

  try {
    await supabase.from('chapter_reports').update({
      is_locked: locked,
      locked_at: reports[idx].locked_at,
      locked_by_name: reports[idx].locked_by_name,
      document_seal_code: reports[idx].document_seal_code
    }).eq('id', reportId);
  } catch {
    // fallback
  }

  return reports[idx];
}

export async function assessChapterReport(
  reportId: string,
  assessment: NationalExecutiveAssessment
): Promise<ChapterReport | null> {
  const reports = getLocal<ChapterReport[]>('yara_chapter_reports', INITIAL_REPORTS);
  const idx = reports.findIndex(r => r.id === reportId);
  if (idx < 0) return null;

  reports[idx].status = 'assessed';
  reports[idx].executive_assessment = assessment;
  reports[idx].is_locked = true;
  reports[idx].locked_at = new Date().toISOString();
  reports[idx].locked_by_name = assessment.assessed_by_name || 'National Executive Committee';

  setLocal('yara_chapter_reports', reports);

  try {
    await supabase.from('chapter_reports').update({
      status: 'assessed',
      executive_assessment: assessment,
      is_locked: true,
      locked_at: reports[idx].locked_at,
      locked_by_name: reports[idx].locked_by_name
    }).eq('id', reportId);
  } catch {
    // fallback
  }

  return reports[idx];
}

export async function updateChapterReportStatus(reportId: string, status: ChapterReport['status']): Promise<boolean> {
  const reports = getLocal<ChapterReport[]>('yara_chapter_reports', INITIAL_REPORTS);
  const idx = reports.findIndex(r => r.id === reportId);
  if (idx < 0) return false;

  reports[idx].status = status;
  setLocal('yara_chapter_reports', reports);
  return true;
}

export async function deleteChapterReport(reportId: string): Promise<boolean> {
  const reports = getLocal<ChapterReport[]>('yara_chapter_reports', INITIAL_REPORTS);
  const target = reports.find(r => r.id === reportId);
  if (target && target.is_locked) {
    throw new Error('Cannot delete a locked National submission. Unlock first in the National Admin Console.');
  }

  // Persist deleted report IDs so they don't come back from INITIAL_REPORTS
  const deletedReportIds = getLocal<string[]>('yara_chapter_reports_deleted_ids', []);
  if (!deletedReportIds.includes(reportId)) {
    setLocal('yara_chapter_reports_deleted_ids', [...deletedReportIds, reportId]);
  }

  const filtered = reports.filter(r => r.id !== reportId);
  setLocal('yara_chapter_reports', filtered);
  return true;
}

// -------------------------------------------------------------
// CHAPTER MEMBER JOIN REQUESTS
// -------------------------------------------------------------

import type { ChapterJoinRequest } from '../types/chapters';

const INITIAL_JOIN_REQUESTS: ChapterJoinRequest[] = [];

export async function getJoinRequests(chapterId?: string): Promise<ChapterJoinRequest[]> {
  const all = getLocal<ChapterJoinRequest[]>('yara_chapter_join_requests', INITIAL_JOIN_REQUESTS);
  try {
    const query = supabase.from('chapter_join_requests').select('*').order('submitted_at', { ascending: false });
    const { data, error } = chapterId ? await query.eq('chapter_id', chapterId) : await query;
    if (!error && data && data.length > 0) {
      // Merge with local: local may have items not yet synced
      const remoteIds = new Set(data.map((d: any) => d.id));
      const localOnly = all.filter(r => !remoteIds.has(r.id));
      const merged = [...data, ...localOnly];
      setLocal('yara_chapter_join_requests', merged);
      return chapterId ? merged.filter(r => r.chapter_id === chapterId) : merged;
    }
  } catch {
    // fallback
  }
  return chapterId ? all.filter(r => r.chapter_id === chapterId) : all;
}

export async function submitJoinRequest(
  req: Omit<ChapterJoinRequest, 'id' | 'status' | 'submitted_at' | 'created_at' | 'updated_at'>
): Promise<ChapterJoinRequest> {
  const newReq: ChapterJoinRequest = {
    ...req,
    id: 'join-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 6),
    status: 'pending',
    submitted_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  const all = getLocal<ChapterJoinRequest[]>('yara_chapter_join_requests', INITIAL_JOIN_REQUESTS);
  setLocal('yara_chapter_join_requests', [newReq, ...all]);

  try {
    await supabase.from('chapter_join_requests').insert(newReq);
  } catch {
    // safe fallback – stored locally
  }

  return newReq;
}

export async function approveJoinRequest(
  requestId: string,
  reviewerName: string,
  notes?: string
): Promise<ChapterJoinRequest | null> {
  const all = getLocal<ChapterJoinRequest[]>('yara_chapter_join_requests', INITIAL_JOIN_REQUESTS);
  const idx = all.findIndex(r => r.id === requestId);
  if (idx < 0) return null;

  all[idx].status = 'approved';
  all[idx].reviewed_by = reviewerName;
  all[idx].reviewed_at = new Date().toISOString();
  all[idx].review_notes = notes || 'Welcome to the chapter!';
  all[idx].updated_at = new Date().toISOString();

  setLocal('yara_chapter_join_requests', all);

  // Add approved applicant as chapter member
  const r = all[idx];
  const chapters = getLocal<Chapter[]>('yara_chapters_data', INITIAL_CHAPTERS);
  const chIdx = chapters.findIndex(c => c.id === r.chapter_id);
  if (chIdx >= 0) {
    const newMember: ChapterMember = {
      id: 'mem-' + Date.now().toString(36),
      name: r.full_name,
      email: r.email,
      phone: r.phone,
      role: r.role_applying_for || 'Member',
      department_or_grade: r.grade_or_year,
      student_or_staff_id: r.student_id,
      joined_date: new Date().toISOString().split('T')[0],
      status: 'active',
      skills: r.skills
    };
    chapters[chIdx].members = [...(chapters[chIdx].members || []), newMember];
    chapters[chIdx].total_members_count = (chapters[chIdx].members || []).length;
    chapters[chIdx].updated_at = new Date().toISOString();
    setLocal('yara_chapters_data', chapters);

    try {
      await supabase.from('chapters').update({
        members: chapters[chIdx].members,
        total_members_count: chapters[chIdx].total_members_count,
        updated_at: chapters[chIdx].updated_at
      }).eq('id', r.chapter_id);
    } catch { /* fallback */ }
  }

  try {
    await supabase.from('chapter_join_requests').update({
      status: 'approved',
      reviewed_by: reviewerName,
      reviewed_at: all[idx].reviewed_at,
      review_notes: all[idx].review_notes,
      updated_at: all[idx].updated_at
    }).eq('id', requestId);
  } catch { /* fallback */ }

  return all[idx];
}

export async function rejectJoinRequest(
  requestId: string,
  reviewerName: string,
  notes: string
): Promise<ChapterJoinRequest | null> {
  const all = getLocal<ChapterJoinRequest[]>('yara_chapter_join_requests', INITIAL_JOIN_REQUESTS);
  const idx = all.findIndex(r => r.id === requestId);
  if (idx < 0) return null;

  all[idx].status = 'rejected';
  all[idx].reviewed_by = reviewerName;
  all[idx].reviewed_at = new Date().toISOString();
  all[idx].review_notes = notes;
  all[idx].updated_at = new Date().toISOString();

  setLocal('yara_chapter_join_requests', all);

  try {
    await supabase.from('chapter_join_requests').update({
      status: 'rejected',
      reviewed_by: reviewerName,
      reviewed_at: all[idx].reviewed_at,
      review_notes: notes,
      updated_at: all[idx].updated_at
    }).eq('id', requestId);
  } catch { /* fallback */ }

  return all[idx];
}
