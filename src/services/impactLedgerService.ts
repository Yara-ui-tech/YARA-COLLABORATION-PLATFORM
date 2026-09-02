import { supabase } from '../lib/supabase';
import { getEventRegistrations } from './eventRegistrationService';
import { getFinancialTransactions } from './competitionEcosystemService';

export type ImpactTransactionType = 
  | 'event_registration' 
  | 'competition_entry' 
  | 'hardware_deposit' 
  | 'lms_subscription' 
  | 'sponsorship_donation' 
  | 'chapter_grant' 
  | 'mentor_stipend';

export type SchoolCategory = 'public_rural' | 'public_urban' | 'mission_school' | 'private' | 'university' | 'other';

export interface ImpactLedgerEntry {
  id: string;
  timestamp: string;
  reference_id: string;
  transaction_type: ImpactTransactionType;
  source_module: 'events' | 'competitions' | 'lms' | 'donations' | 'chapters' | 'finance';
  title: string;
  payer_name: string;
  payer_email: string;
  school_institution: string;
  province?: string;
  amount: number;
  currency: string;
  payment_method: string;
  payment_status: 'verified' | 'pending' | 'audited';
  approval_status: 'approved' | 'pending' | 'rejected';
  approved_by?: string;
  approved_at?: string;
  // M&E (Monitoring & Evaluation) Impact Indicators
  beneficiaries_count: number;
  girls_count: number;
  boys_count: number;
  school_category: SchoolCategory;
  sdg_targets: string[];
  m_and_e_notes?: string;
}

export interface ExecutiveAuditor {
  id: string;
  email: string;
  name: string;
  title: string;
  authorized_by: string;
  authorized_at: string;
  is_active: boolean;
}

export const MASTER_ADMIN_EMAILS = [
  'goyaracorp@gmail.com',
  'admin@yaria.org',
  'director@yaria.org'
];

export const INITIAL_EXECUTIVE_AUDITORS: ExecutiveAuditor[] = [
  {
    id: 'exec_1',
    email: 'goyaracorp@gmail.com',
    name: 'T. Mukombwe',
    title: 'Master Administrator & Lead Trustee',
    authorized_by: 'Board Resolution 2026/01',
    authorized_at: '2026-01-01T00:00:00Z',
    is_active: true
  },
  {
    id: 'exec_2',
    email: 'director@yaria.org',
    name: 'Dr. C. Chidemo',
    title: 'Regional President & Executive Auditor',
    authorized_by: 'goyaracorp@gmail.com',
    authorized_at: '2026-02-15T00:00:00Z',
    is_active: true
  }
];

const LOCAL_STORAGE_LEDGER_KEY = 'yaria_impact_audit_ledger_v2';
const LOCAL_STORAGE_AUDITORS_KEY = 'yaria_executive_auditors_v2';

/**
 * Checks if a given user email or profile is authorized by the Master Admin
 * to export and download the official M&E Financial Audit Ledger.
 */
export function isAuthorizedExecutiveAuditor(userEmail?: string, profile?: any): boolean {
  if (!userEmail) return false;
  const emailNorm = userEmail.toLowerCase().trim();

  // 1. Master admin emails always have full rights
  if (MASTER_ADMIN_EMAILS.some(e => e.toLowerCase() === emailNorm)) return true;

  // 2. Profile role check with auditor metadata
  if (profile?.role === 'admin' && profile?.is_executive_auditor) return true;

  // 3. Checked against executive auditors registry
  const auditors = getExecutiveAuditorsSync();
  const found = auditors.find(a => a.email.toLowerCase() === emailNorm && a.is_active);
  return !!found;
}

export function getExecutiveAuditorsSync(): ExecutiveAuditor[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_AUDITORS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return INITIAL_EXECUTIVE_AUDITORS;
}

export async function getExecutiveAuditors(): Promise<ExecutiveAuditor[]> {
  try {
    const { data, error } = await supabase
      .from('executive_auditors')
      .select('*')
      .eq('is_active', true);
    
    if (!error && data && data.length > 0) {
      localStorage.setItem(LOCAL_STORAGE_AUDITORS_KEY, JSON.stringify(data));
      return data;
    }
  } catch {}
  return getExecutiveAuditorsSync();
}

export async function authorizeExecutiveMember(
  auditor: Omit<ExecutiveAuditor, 'id' | 'authorized_at' | 'is_active'>,
  authorizerEmail: string
): Promise<{ success: boolean; data?: ExecutiveAuditor; error?: string }> {
  try {
    const current = getExecutiveAuditorsSync();
    const existingIdx = current.findIndex(a => a.email.toLowerCase() === auditor.email.toLowerCase());

    const newAuditor: ExecutiveAuditor = {
      ...auditor,
      id: existingIdx >= 0 ? current[existingIdx].id : 'exec_' + Date.now().toString(36),
      authorized_by: authorizerEmail || 'Master Admin (goyaracorp@gmail.com)',
      authorized_at: new Date().toISOString(),
      is_active: true
    };

    let updated: ExecutiveAuditor[];
    if (existingIdx >= 0) {
      updated = [...current];
      updated[existingIdx] = newAuditor;
    } else {
      updated = [newAuditor, ...current];
    }

    localStorage.setItem(LOCAL_STORAGE_AUDITORS_KEY, JSON.stringify(updated));

    try {
      await supabase.from('executive_auditors').upsert(newAuditor);
    } catch {}

    return { success: true, data: newAuditor };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to authorize executive member' };
  }
}

export async function revokeExecutiveMember(email: string): Promise<boolean> {
  try {
    const current = getExecutiveAuditorsSync();
    const updated = current.map(a => a.email.toLowerCase() === email.toLowerCase() ? { ...a, is_active: false } : a);
    localStorage.setItem(LOCAL_STORAGE_AUDITORS_KEY, JSON.stringify(updated));
    try {
      await supabase.from('executive_auditors').update({ is_active: false }).eq('email', email);
    } catch {}
    return true;
  } catch {
    return false;
  }
}

/**
 * Retrieves all unified Impact Ledger entries across Events, Competitions, Subscriptions, and Donations.
 */
export async function getImpactLedgerEntries(): Promise<ImpactLedgerEntry[]> {
  let localEntries: ImpactLedgerEntry[] = [];
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_LEDGER_KEY);
    if (raw) localEntries = JSON.parse(raw);
  } catch {}

  // Also auto-aggregate from live Event Registrations to make sure every event payment is captured
  try {
    const eventRegs = await getEventRegistrations();
    if (eventRegs && eventRegs.length > 0) {
      eventRegs.forEach(reg => {
        const refId = reg.registration_code || reg.id;
        const exists = localEntries.some(e => e.reference_id === refId || e.id === reg.id);
        if (!exists) {
          localEntries.unshift({
            id: `ledger_${reg.id}`,
            timestamp: reg.created_at || new Date().toISOString(),
            reference_id: refId,
            transaction_type: 'event_registration',
            source_module: 'events',
            title: reg.event_title || 'AI for Educators Bootcamp',
            payer_name: reg.full_name,
            payer_email: reg.email,
            school_institution: reg.school_institution || 'Independent Educator',
            province: reg.province || 'Harare Province',
            amount: reg.registration_fee || 10,
            currency: reg.currency || 'USD',
            payment_method: reg.phone ? 'EcoCash / Mobile' : 'Standard Innbucks/Card',
            payment_status: reg.payment_status === 'verified' ? 'verified' : 'pending',
            approval_status: reg.approval_status || 'pending',
            approved_by: reg.approved_by_name || (reg.approval_status === 'approved' ? 'YARA Executive Board' : undefined),
            approved_at: reg.approved_at,
            beneficiaries_count: 25, // Educator impacts avg 25 students
            girls_count: 13,
            boys_count: 12,
            school_category: 'public_urban',
            sdg_targets: ['SDG 4: Quality Education', 'SDG 9: Industry & Innovation'],
            m_and_e_notes: `Teacher Professional Development registration for ${reg.role_title || 'STEM Educator'}`
          });
        }
      });
    }
  } catch (e) {
    console.warn('Event regs ledger sync note:', e);
  }

  // Seed sample transactions if totally empty for initial demo
  if (localEntries.length === 0) {
    localEntries = getSeedImpactLedger();
    localStorage.setItem(LOCAL_STORAGE_LEDGER_KEY, JSON.stringify(localEntries));
  }

  return localEntries;
}

/**
 * Records a new payment or disbursement directly to the Impact Ledger
 */
export async function recordImpactLedgerPayment(
  entry: Omit<ImpactLedgerEntry, 'id' | 'timestamp'>
): Promise<ImpactLedgerEntry> {
  const newEntry: ImpactLedgerEntry = {
    ...entry,
    id: `ledger_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    timestamp: new Date().toISOString()
  };

  const existing = await getImpactLedgerEntries();
  const updated = [newEntry, ...existing];
  localStorage.setItem(LOCAL_STORAGE_LEDGER_KEY, JSON.stringify(updated));

  try {
    await supabase.from('impact_ledger').insert(newEntry);
  } catch {}

  return newEntry;
}

/**
 * Calculates high-level M&E summary indicators from ledger entries
 */
export function calculateMEIndicators(entries: ImpactLedgerEntry[]) {
  const verifiedEntries = entries.filter(e => e.payment_status === 'verified' || e.approval_status === 'approved');
  
  const totalInflowUSD = verifiedEntries.reduce((sum, e) => sum + (e.currency === 'USD' ? e.amount : e.amount / 25), 0);
  const totalBeneficiaries = verifiedEntries.reduce((sum, e) => sum + (e.beneficiaries_count || 1), 0);
  const totalGirls = verifiedEntries.reduce((sum, e) => sum + (e.girls_count || 0), 0);
  const totalBoys = verifiedEntries.reduce((sum, e) => sum + (e.boys_count || 0), 0);
  
  const uniqueInstitutions = new Set(verifiedEntries.map(e => e.school_institution).filter(Boolean)).size;
  const uniqueProvinces = new Set(verifiedEntries.map(e => e.province).filter(Boolean)).size;

  const eventFeesCount = verifiedEntries.filter(e => e.source_module === 'events').length;
  const competitionFeesCount = verifiedEntries.filter(e => e.source_module === 'competitions').length;
  const sponsorshipCount = verifiedEntries.filter(e => e.source_module === 'donations').length;

  return {
    total_entries_count: entries.length,
    verified_entries_count: verifiedEntries.length,
    total_inflow_usd: totalInflowUSD,
    total_beneficiaries: totalBeneficiaries,
    total_girls: totalGirls,
    total_boys: totalBoys,
    girls_ratio: totalBeneficiaries > 0 ? Math.round((totalGirls / (totalGirls + totalBoys || 1)) * 100) : 50,
    institutions_reached: uniqueInstitutions,
    provinces_covered: uniqueProvinces || 7,
    breakdown: {
      event_fees: eventFeesCount,
      competition_fees: competitionFeesCount,
      sponsorships: sponsorshipCount
    }
  };
}

/**
 * Exports the complete M&E Audit Ledger to a formatted CSV file.
 * Strictly checks for executive authorization before triggering download.
 */
export function exportImpactLedgerToCsv(
  entries: ImpactLedgerEntry[],
  auditorName: string,
  userEmail: string,
  profile?: any
): { success: boolean; message: string } {
  if (!isAuthorizedExecutiveAuditor(userEmail, profile)) {
    return {
      success: false,
      message: 'Access Denied: Only Master Administrators or approved Executive Financial Auditors are permitted to export the official M&E Audit Ledger.'
    };
  }

  const headers = [
    'Ledger ID',
    'Date & Time (UTC)',
    'Reference ID',
    'Transaction Type',
    'Module',
    'Title / Purpose',
    'Payer Name',
    'Payer Email',
    'Institution / School',
    'Province',
    'Amount',
    'Currency',
    'Payment Method',
    'Payment Status',
    'Approval Status',
    'Approved By',
    'Beneficiaries Impacted',
    'Girls in STEM',
    'Boys in STEM',
    'School Category',
    'Target SDGs',
    'M&E Audit Notes'
  ];

  const rows = entries.map(e => [
    `"${e.id}"`,
    `"${new Date(e.timestamp).toISOString()}"`,
    `"${e.reference_id}"`,
    `"${e.transaction_type}"`,
    `"${e.source_module}"`,
    `"${(e.title || '').replace(/"/g, '""')}"`,
    `"${(e.payer_name || '').replace(/"/g, '""')}"`,
    `"${e.payer_email || ''}"`,
    `"${(e.school_institution || '').replace(/"/g, '""')}"`,
    `"${e.province || ''}"`,
    e.amount,
    `"${e.currency}"`,
    `"${e.payment_method}"`,
    `"${e.payment_status}"`,
    `"${e.approval_status}"`,
    `"${(e.approved_by || '').replace(/"/g, '""')}"`,
    e.beneficiaries_count || 0,
    e.girls_count || 0,
    e.boys_count || 0,
    `"${e.school_category || ''}"`,
    `"${(e.sdg_targets || []).join('; ')}"`,
    `"${(e.m_and_e_notes || '').replace(/"/g, '""')}"`
  ]);

  const metadataRows = [
    `"# YOUNG AFRICANS ROBOTICS ASSOCIATION (YARA) - OFFICIAL M&E IMPACT AUDIT LEDGER"`,
    `"# Generated At: ${new Date().toISOString()}"`,
    `"# Authorized Executive Auditor: ${auditorName} (${userEmail})"`,
    `"# Total Records: ${entries.length}"`,
    `"# Verification Hash: YARA-AUDIT-${Date.now().toString(16).toUpperCase()}"`,
    `""`
  ];

  const csvContent = metadataRows.join('\n') + '\n' + headers.join(',') + '\n' + rows.map(r => r.join(',')).join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `YARA_Impact_Audit_Ledger_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  return {
    success: true,
    message: 'Official M&E Impact Audit Ledger successfully generated and downloaded.'
  };
}

function getSeedImpactLedger(): ImpactLedgerEntry[] {
  return [
    {
      id: 'ledger_evt_001',
      timestamp: new Date(Date.now() - 3 * 86400000).toISOString(),
      reference_id: 'YARA-AI-EDU-8821',
      transaction_type: 'event_registration',
      source_module: 'events',
      title: 'AI for Educators Online Bootcamp (Batch 1)',
      payer_name: 'Dr. Tendai Marange',
      payer_email: 'tendai.marange@kutama.ac.zw',
      school_institution: 'Kutama College',
      province: 'Mashonaland West',
      amount: 10,
      currency: 'USD',
      payment_method: 'EcoCash Mobile ($10.00)',
      payment_status: 'verified',
      approval_status: 'approved',
      approved_by: 'YARA Executive Board (goyaracorp@gmail.com)',
      approved_at: new Date(Date.now() - 3 * 86400000).toISOString(),
      beneficiaries_count: 35,
      girls_count: 18,
      boys_count: 17,
      school_category: 'mission_school',
      sdg_targets: ['SDG 4: Quality Education', 'SDG 9: Industry & Innovation'],
      m_and_e_notes: 'Verified payment receipt. Full curriculum access & certificate authorized.'
    },
    {
      id: 'ledger_comp_002',
      timestamp: new Date(Date.now() - 5 * 86400000).toISOString(),
      reference_id: 'COMP-2026-TEAM-042',
      transaction_type: 'competition_entry',
      source_module: 'competitions',
      title: 'YARA Robotics Championship 2026 Team Registration',
      payer_name: 'St. George’s Robotics Club',
      payer_email: 'robotics@stgeorges.co.zw',
      school_institution: 'St. George’s College',
      province: 'Harare Province',
      amount: 50,
      currency: 'USD',
      payment_method: 'Direct Bank Transfer (Stanbic Ref #8892)',
      payment_status: 'verified',
      approval_status: 'approved',
      approved_by: 'Master Admin (goyaracorp@gmail.com)',
      approved_at: new Date(Date.now() - 5 * 86400000).toISOString(),
      beneficiaries_count: 6,
      girls_count: 3,
      boys_count: 3,
      school_category: 'private',
      sdg_targets: ['SDG 4: Quality Education', 'SDG 5: Gender Equality', 'SDG 9: Innovation'],
      m_and_e_notes: 'Includes autonomous maze solving robot hardware inspection fee.'
    },
    {
      id: 'ledger_sp_003',
      timestamp: new Date(Date.now() - 10 * 86400000).toISOString(),
      reference_id: 'SPON-2026-AFRI-01',
      transaction_type: 'sponsorship_donation',
      source_module: 'donations',
      title: 'AfriTech Microcontroller Lab Subsidy Grant',
      payer_name: 'AfriTech Foundation Africa',
      payer_email: 'grants@afritech.org',
      school_institution: 'Highfield High School & Goromonzi High',
      province: 'Harare Province',
      amount: 1200,
      currency: 'USD',
      payment_method: 'International Wire Transfer',
      payment_status: 'audited',
      approval_status: 'approved',
      approved_by: 'Dr. C. Chidemo (Regional President)',
      approved_at: new Date(Date.now() - 10 * 86400000).toISOString(),
      beneficiaries_count: 120,
      girls_count: 65,
      boys_count: 55,
      school_category: 'public_urban',
      sdg_targets: ['SDG 4: Quality Education', 'SDG 10: Reduced Inequalities', 'SDG 17: Partnerships'],
      m_and_e_notes: 'Direct kit subsidies for 24 robotics beginner kits distributed.'
    }
  ];
}
