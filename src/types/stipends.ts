export type RecipientCategory = 'mentor' | 'employee' | 'trainer' | 'coach' | 'judge' | 'volunteer';

export type StipendPaymentMethod = 'mobile_money' | 'bank_transfer' | 'cash' | 'paypal' | 'crypto';

export type StipendDisbursementStatus = 'completed' | 'processing' | 'pending' | 'flagged';

export interface StipendSlip {
  id: string; // e.g. STP-2026-XXXX
  recipient_id: string;
  recipient_name: string;
  recipient_email?: string;
  recipient_phone?: string;
  recipient_role: RecipientCategory;
  member_id?: string;
  
  // Financial breakdown
  currency: string;
  base_stipend: number;
  allowance_amount: number;
  travel_subsistence_ts: number;
  gross_amount: number;
  withholding_deductions: number;
  net_amount_received: number;

  // Budget categorization (NPO governance)
  budget_category: 'program_stipends' | 'training_allowances' | 'travel_and_subsistence' | 'admin_operations';

  // Payment details
  payment_method: StipendPaymentMethod;
  payment_reference: string;
  disbursement_date: string; // YYYY-MM-DD
  status: StipendDisbursementStatus;

  // Metadata & Audit
  approved_by_admin: string;
  notes?: string;
  created_at: string;

  // Bookkeeping & Audit Documentation
  reason_for_stipend?: string;       // Purpose/Reason for stipend disbursement
  location?: string;                 // Venue / Outreach Location (e.g. Harare Hub, Chinhoyi High School)
  number_of_days?: number;           // Duration/Days active in outreach/training
  activity_category?: 'outreach' | 'training_workshop' | 'mentorship_cohort' | 'curriculum_dev' | 'event_judging' | 'admin_support' | 'other';
  project_code?: string;             // Project / Audit reference code (e.g. YARA-OUT-2026-01)
  funding_source?: string;           // Funding grant or allocation source
  recorded_by_officer?: string;      // Appointed Finance Officer or Admin recording the disbursement
}

export interface NpoBudgetPercentages {
  direct_program_stipends_percent: number; // e.g. 50%
  allowances_percent: number;             // e.g. 15%
  travel_and_subsistence_percent: number; // e.g. 15%
  hardware_and_equipment_percent: number; // e.g. 10%
  admin_and_governance_percent: number;   // e.g. 10%
}

export const DEFAULT_NPO_BUDGET_PERCENTAGES: NpoBudgetPercentages = {
  direct_program_stipends_percent: 50,
  allowances_percent: 15,
  travel_and_subsistence_percent: 15,
  hardware_and_equipment_percent: 10,
  admin_and_governance_percent: 10
};

