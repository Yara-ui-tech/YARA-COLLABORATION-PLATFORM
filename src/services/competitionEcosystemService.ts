import { supabase } from '../lib/supabase';
import {
  SponsorRecord,
  VolunteerApplication,
  JudgeRecord,
  DigitalScoreSubmission,
  FinancialTransaction,
  DigitalCertificate,
  CompetitionAnnouncement
} from '../types/competitionEcosystem';
import { YaraCompetitionRegistration } from '../types/yaraCompetition';
import { getRegistrations } from './yaraCompetitionService';

// Default initial datasets - zeroed out / empty as requested (no mock sponsors or fake money)
const DEFAULT_ANNOUNCEMENTS: CompetitionAnnouncement[] = [
  {
    id: 'ann-1',
    title: '🔔 Technical Submissions Open for All 2026 Challenges',
    body: 'All registered teams may now prepare robot specifications, circuit schematics, and pitch decks ahead of the 2026 Continental Championship.',
    target_audience: 'all',
    priority: 'high',
    created_at: new Date().toISOString(),
    author: 'YARA Organizing Committee'
  },
  {
    id: 'ann-2',
    title: '🌊 Underwater Drone Test Tank Dimensions & Water Salinity Guidelines',
    body: 'The official test tank specifications have been published. Depth: 2.2m, Salinity: Fresh chlorinated water. Review the ROV buoyancy guidance in the Rules section.',
    target_audience: 'teams',
    priority: 'normal',
    created_at: new Date().toISOString(),
    author: 'Lead Technical Judge'
  }
];

const DEFAULT_SPONSORS: SponsorRecord[] = [];

const DEFAULT_VOLUNTEERS: VolunteerApplication[] = [];

const DEFAULT_JUDGES: JudgeRecord[] = [];

const DEFAULT_FINANCIALS: FinancialTransaction[] = [];

const DEFAULT_SCORES: DigitalScoreSubmission[] = [];

const DEFAULT_CERTIFICATES: DigitalCertificate[] = [];

// Helper to get / set LocalStorage safely
function getLocal<T>(key: string, fallback: T): T {
  try {
    const data = localStorage.getItem(key);
    if (!data) return fallback;
    return JSON.parse(data) as T;
  } catch {
    return fallback;
  }
}

function setLocal<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn(`Local storage save error for ${key}:`, e);
  }
}

// ==========================================
// 1. SPONSOR OPERATIONS
// ==========================================
export async function getSponsors(): Promise<SponsorRecord[]> {
  const local = getLocal<SponsorRecord[]>('yara_comp_sponsors', DEFAULT_SPONSORS);
  try {
    const { data, error } = await supabase.from('sponsors').select('*').order('created_at', { ascending: false });
    if (!error && data && data.length > 0) {
      return data as SponsorRecord[];
    }
  } catch {
    // fallback
  }
  return local;
}

export async function submitSponsorApplication(application: Omit<SponsorRecord, 'id' | 'created_at' | 'status' | 'benefits_active'>): Promise<SponsorRecord> {
  const record: SponsorRecord = {
    ...application,
    id: 'sp_' + Date.now().toString(36),
    status: 'pending',
    benefits_active: false,
    created_at: new Date().toISOString()
  };

  const list = await getSponsors();
  const updated = [record, ...list];
  setLocal('yara_comp_sponsors', updated);

  try {
    await supabase.from('sponsors').insert(record);
  } catch {
    // safe fallback
  }

  return record;
}

export async function updateSponsorStatus(id: string, status: SponsorRecord['status']): Promise<boolean> {
  const list = await getSponsors();
  const updated = list.map(s => s.id === id ? { ...s, status, benefits_active: status === 'approved' || status === 'received' } : s);
  setLocal('yara_comp_sponsors', updated);

  try {
    await supabase.from('sponsors').update({ status, benefits_active: status === 'approved' || status === 'received' }).eq('id', id);
  } catch {
    // safe fallback
  }
  return true;
}

// ==========================================
// 2. VOLUNTEER OPERATIONS
// ==========================================
export async function getVolunteerApplications(): Promise<VolunteerApplication[]> {
  const local = getLocal<VolunteerApplication[]>('yara_comp_volunteers', DEFAULT_VOLUNTEERS);
  try {
    const { data, error } = await supabase.from('volunteers').select('*').order('created_at', { ascending: false });
    if (!error && data && data.length > 0) {
      return data as VolunteerApplication[];
    }
  } catch {
    // fallback
  }
  return local;
}

export async function submitVolunteerApplication(app: Omit<VolunteerApplication, 'id' | 'created_at' | 'status'>): Promise<VolunteerApplication> {
  const record: VolunteerApplication = {
    ...app,
    id: 'vol_' + Date.now().toString(36),
    status: 'approved', // instant friendly enrollment
    assigned_department: app.preferred_department,
    assigned_supervisor: 'Department Field Marshal',
    shift_time: 'Competition Day (08:00 - 17:00)',
    checked_in_event_day: false,
    certificate_issued: false,
    created_at: new Date().toISOString()
  };

  const list = await getVolunteerApplications();
  const updated = [record, ...list];
  setLocal('yara_comp_volunteers', updated);

  try {
    await supabase.from('volunteers').insert(record);
  } catch {
    // safe fallback
  }

  return record;
}

export async function toggleVolunteerCheckIn(id: string): Promise<VolunteerApplication | null> {
  const list = await getVolunteerApplications();
  let modified: VolunteerApplication | null = null;
  const updated = list.map(v => {
    if (v.id === id) {
      const checkedIn = !v.checked_in_event_day;
      modified = {
        ...v,
        checked_in_event_day: checkedIn,
        checked_in_at: checkedIn ? new Date().toISOString() : undefined,
        certificate_issued: checkedIn ? true : v.certificate_issued
      };
      return modified;
    }
    return v;
  });

  setLocal('yara_comp_volunteers', updated);
  return modified;
}

// ==========================================
// 3. JUDGE & SCORING OPERATIONS
// ==========================================
export async function getJudges(): Promise<JudgeRecord[]> {
  const local = getLocal<JudgeRecord[]>('yara_comp_judges', DEFAULT_JUDGES);
  try {
    const { data, error } = await supabase.from('judges').select('*').order('created_at', { ascending: false });
    if (!error && data && data.length > 0) {
      return data as JudgeRecord[];
    }
  } catch {
    // fallback
  }
  return local;
}

export async function registerJudge(judge: Omit<JudgeRecord, 'id' | 'created_at' | 'status'>): Promise<JudgeRecord> {
  const record: JudgeRecord = {
    ...judge,
    id: 'jd_' + Date.now().toString(36),
    status: 'active',
    created_at: new Date().toISOString()
  };

  const list = await getJudges();
  const updated = [record, ...list];
  setLocal('yara_comp_judges', updated);
  return record;
}

export async function getDigitalScores(): Promise<DigitalScoreSubmission[]> {
  const local = getLocal<DigitalScoreSubmission[]>('yara_comp_scores', DEFAULT_SCORES);
  try {
    const { data, error } = await supabase.from('scores').select('*').order('submitted_at', { ascending: false });
    if (!error && data && data.length > 0) {
      return data as DigitalScoreSubmission[];
    }
  } catch {
    // fallback
  }
  return local;
}

export async function submitJudgeScore(score: Omit<DigitalScoreSubmission, 'id' | 'submitted_at' | 'total_score'>): Promise<DigitalScoreSubmission> {
  const total = score.engineering_design + score.innovation + score.performance + score.safety + score.teamwork;
  const record: DigitalScoreSubmission = {
    ...score,
    id: 'sc_' + Date.now().toString(36),
    total_score: Math.min(100, Math.max(0, total)),
    submitted_at: new Date().toISOString()
  };

  const list = await getDigitalScores();
  // replace if exists for same team and category and judge
  const existingIdx = list.findIndex(s => s.team_id === score.team_id && s.category === score.category && s.judge_id === score.judge_id);
  let updated: DigitalScoreSubmission[];
  if (existingIdx >= 0) {
    updated = [...list];
    updated[existingIdx] = record;
  } else {
    updated = [record, ...list];
  }

  setLocal('yara_comp_scores', updated);

  try {
    await supabase.from('scores').insert(record);
  } catch {
    // safe fallback
  }

  return record;
}

export async function toggleScoreLock(scoreId: string, locked: boolean): Promise<boolean> {
  const list = await getDigitalScores();
  const updated = list.map(s => s.id === scoreId ? { ...s, is_locked: locked } : s);
  setLocal('yara_comp_scores', updated);
  return true;
}

// ==========================================
// 4. FINANCIAL LEDGER & BUDGET
// ==========================================
export async function getFinancialTransactions(): Promise<FinancialTransaction[]> {
  return getLocal<FinancialTransaction[]>('yara_comp_finances', DEFAULT_FINANCIALS);
}

export async function addFinancialTransaction(tx: Omit<FinancialTransaction, 'id'>): Promise<FinancialTransaction> {
  const record: FinancialTransaction = {
    ...tx,
    id: 'tx_' + Date.now().toString(36)
  };
  const list = await getFinancialTransactions();
  const updated = [record, ...list];
  setLocal('yara_comp_finances', updated);
  return record;
}

export async function calculateFinancialSummary() {
  const transactions = await getFinancialTransactions();
  let totalIncome = 0;
  let totalExpenses = 0;

  for (const t of transactions) {
    if (t.status === 'confirmed' || t.status === 'projected') {
      if (t.type === 'income') totalIncome += t.amount;
      if (t.type === 'expense') totalExpenses += t.amount;
    }
  }

  const netBalance = totalIncome - totalExpenses;
  // Estimated budget target is $4,000 for entire national championship
  const targetBudget = 4000;
  const fundingGap = Math.max(0, targetBudget - totalIncome);

  return {
    totalIncome,
    totalExpenses,
    netBalance,
    targetBudget,
    fundingGap,
    coveragePercent: Math.min(100, Math.round((totalIncome / targetBudget) * 100))
  };
}

// ==========================================
// 5. ANNOUNCEMENTS
// ==========================================
export async function getAnnouncements(): Promise<CompetitionAnnouncement[]> {
  return getLocal<CompetitionAnnouncement[]>('yara_comp_announcements', DEFAULT_ANNOUNCEMENTS);
}

export async function postAnnouncement(ann: Omit<CompetitionAnnouncement, 'id' | 'created_at'>): Promise<CompetitionAnnouncement> {
  const record: CompetitionAnnouncement = {
    ...ann,
    id: 'ann_' + Date.now().toString(36),
    created_at: new Date().toISOString()
  };
  const list = await getAnnouncements();
  const updated = [record, ...list];
  setLocal('yara_comp_announcements', updated);
  return record;
}

// ==========================================
// 6. DIGITAL CERTIFICATE SYSTEM
// ==========================================
export async function getCertificates(): Promise<DigitalCertificate[]> {
  return getLocal<DigitalCertificate[]>('yara_comp_certificates', DEFAULT_CERTIFICATES);
}

export async function generateCertificate(cert: Omit<DigitalCertificate, 'qr_code_hash' | 'is_verified'>): Promise<DigitalCertificate> {
  const hash = `YARA-${cert.edition_year}-${cert.type.toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;
  const record: DigitalCertificate = {
    ...cert,
    qr_code_hash: hash,
    is_verified: true
  };

  const list = await getCertificates();
  const updated = [record, ...list];
  setLocal('yara_comp_certificates', updated);
  return record;
}

export async function verifyCertificateById(certId: string): Promise<DigitalCertificate | null> {
  const list = await getCertificates();
  const normalized = certId.trim().toUpperCase();
  const found = list.find(c => c.certificate_id.toUpperCase() === normalized || c.qr_code_hash.toUpperCase() === normalized);
  return found || null;
}

// ==========================================
// 7. REAL-TIME IMPACT METRICS CALCULATOR
// ==========================================
export async function calculateLiveCompetitionImpact() {
  const [teams, sponsors, volunteers, financials, scores] = await Promise.all([
    getRegistrations(),
    getSponsors(),
    getVolunteerApplications(),
    getFinancialTransactions(),
    getDigitalScores()
  ]);

  let totalInnovators = 0;
  let totalBoys = 0;
  let totalGirls = 0;
  const uniqueSchools = new Set<string>();
  const uniqueProvinces = new Set<string>();
  let underservedCount = 0;

  for (const team of teams) {
    totalBoys += team.boys_count || 0;
    totalGirls += team.girls_count || 0;
    totalInnovators += (team.total_members || (team.boys_count + team.girls_count)) || 4;

    if (team.school_organization) uniqueSchools.add(team.school_organization.trim());
    if (team.province) uniqueProvinces.add(team.province.trim());

    if (team.participant_type === 'Community Innovation Group' || team.participant_type === 'Independent Youth Team' || team.province !== 'Harare') {
      underservedCount += (team.total_members || 4);
    }
  }

  let totalFundsRaised = 0;
  financials.filter(f => f.type === 'income').forEach(f => totalFundsRaised += f.amount);

  return {
    totalInnovators: totalInnovators,
    totalTeams: teams.length,
    totalSchools: uniqueSchools.size,
    totalProvinces: uniqueProvinces.size,
    girlsInRobotics: totalGirls,
    fundsInvested: totalFundsRaised,
    underservedLearners: underservedCount,
    roboticsProjects: teams.length * 2,
    volunteersCount: volunteers.length,
    sponsorsCount: sponsors.length,
    scoresSubmitted: scores.length
  };
}

export async function calculateImpactMetrics() {
  const live = await calculateLiveCompetitionImpact();
  const boys = Math.max(0, live.totalInnovators - live.girlsInRobotics);
  const girls = live.girlsInRobotics;
  const total = live.totalInnovators;
  const pct = total > 0 ? Math.round((girls / total) * 100) : 50;

  return {
    total_innovators: total,
    girls_count: girls,
    boys_count: boys,
    girls_percentage: pct,
    underserved_schools_count: live.totalSchools,
    provinces_represented: live.totalProvinces,
    total_sponsorship_raised: live.fundsInvested,
    total_budget_allocated: live.fundsInvested,
    prizes_funds: Math.round(live.fundsInvested * 0.38),
    kits_and_hardware_funds: Math.round(live.fundsInvested * 0.33),
    bursaries_and_meals_funds: Math.round(live.fundsInvested * 0.20),
    operations_funds: Math.round(live.fundsInvested * 0.09)
  };
}

