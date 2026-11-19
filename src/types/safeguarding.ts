export type SafeguardingReportCategory = 
  | 'child_abuse'
  | 'child_neglect'
  | 'gbv'
  | 'sexual_harassment'
  | 'bullying'
  | 'discrimination'
  | 'sexual_exploitation'
  | 'abuse_of_authority'
  | 'mentor_misconduct'
  | 'unsafe_environment'
  | 'other';

export type ReportStatus = 
  | 'new'
  | 'received'
  | 'awaiting_assessment'
  | 'under_review'
  | 'investigating'
  | 'action_taken'
  | 'referred'
  | 'referred_to_authorities'
  | 'action_in_progress'
  | 'closed';

export type ReportPriority = 
  | 'urgent'
  | 'critical'
  | 'high'
  | 'medium'
  | 'low';

export type SafeguardingReportStatus = ReportStatus;
export type SafeguardingReportPriority = ReportPriority;

export interface SafeguardingEvidenceFile {
  name: string;
  url: string;
  size?: number;
  type?: string;
}

export interface SafeguardingReport {
  id: string;
  case_number: string;
  secret_key_hash?: string;
  secret_pin_hash?: string;
  is_anonymous: boolean;
  category: SafeguardingReportCategory;
  incident_description: string;
  incident_date?: string;
  chapter_or_location?: string;
  location_or_chapter?: string;
  is_child_at_risk?: boolean;
  is_minor_at_risk?: boolean;
  is_immediate_danger?: boolean;
  is_ongoing?: boolean;
  
  // Optional confidential reporter contact info
  reporter_name?: string;
  reporter_email?: string;
  reporter_phone?: string;
  reporter_role?: 'student' | 'mentor' | 'volunteer' | 'parent' | 'teacher' | 'chapter_member' | 'guest';
  reporter_relationship?: string;

  evidence_files?: SafeguardingEvidenceFile[];
  evidence_urls?: string[];
  status: SafeguardingReportStatus;
  priority: SafeguardingReportPriority;
  assigned_officer_id?: string;
  assigned_officer_name?: string;
  referral_organization?: string;
  referral_notes?: string;

  created_at: string;
  updated_at: string;
}

export interface SafeguardingReportPublicView {
  case_number: string;
  category: SafeguardingReportCategory;
  is_anonymous: boolean;
  status: SafeguardingReportStatus;
  priority: SafeguardingReportPriority;
  is_child_at_risk?: boolean;
  is_minor_at_risk?: boolean;
  is_immediate_danger?: boolean;
  created_at: string;
  updated_at: string;
}

export interface SafeguardingMessage {
  id: string;
  report_id: string;
  case_number?: string;
  sender_type: 'reporter' | 'officer';
  sender_display_name?: string;
  sender_name?: string;
  message: string;
  attachment_url?: string;
  created_at: string;
}

export interface SafeguardingCaseNote {
  id: string;
  report_id: string;
  officer_name: string;
  note?: string;
  note_text?: string;
  is_sensitive?: boolean;
  is_confidential?: boolean;
  created_at: string;
}

export interface SafeguardingAuditLog {
  id: string;
  report_id?: string;
  case_number?: string;
  officer_name?: string;
  performed_by?: string;
  action: string;
  details?: string;
  timestamp?: string;
  created_at?: string;
}

export interface SafeguardingEmergencyContact {
  id: string;
  name: string;
  organization?: string;
  category: 'child_protection' | 'gbv' | 'police' | 'counselling' | 'medical' | 'childline' | 'mental_health' | 'ministry';
  phone: string;
  secondary_phone?: string;
  toll_free: boolean;
  availability?: string;
  available_hours?: string;
  description?: string;
  website?: string;
  location?: string;
  address?: string;
  is_verified?: boolean;
}

export interface SafeguardingResource {
  id: string;
  title: string;
  category: string;
  description: string;
  format?: string;
  version?: string;
  file_url?: string;
  file_size?: string;
  approval_status?: 'approved' | 'under_review';
  approved_by?: string;
  review_date?: string;
  download_count: number;
  target_audience?: string[];
  updated_at?: string;
}

export interface SafeguardingCampaign {
  id: string;
  title: string;
  category?: string;
  description: string;
  cover_image?: string;
  banner_image?: string;
  start_date: string;
  end_date: string;
  venue?: string;
  location?: string;
  target_audience?: string;
  target_participants?: number;
  registration_link?: string;
  organising_partners?: string[];
  status: 'upcoming' | 'active' | 'completed';
  downloadable_materials_url?: string;
}

export interface SafeguardingPartner {
  id: string;
  name: string;
  type?: string;
  partner_type?: string;
  logo_url?: string;
  website?: string;
  description: string;
  areas_of_collaboration?: string[];
  collaboration_scope?: string;
  contact_email?: string;
  contact_phone?: string;
  contact_person?: string;
  country?: string;
  status?: 'confirmed' | 'prospective';
}

export interface SafeguardingChapterCompliance {
  id?: string;
  chapter_id?: string;
  chapter_name: string;
  institution_type?: string;
  province?: string;
  designated_officer_name: string;
  designated_officer_email: string;
  designated_officer_phone?: string;
  code_of_conduct_signed?: boolean;
  pledge_signed?: boolean;
  last_training_date?: string;
  last_audit_date?: string;
  status?: 'compliant' | 'pending_training' | 'review_required';
  compliance_status?: 'compliant' | 'under_review' | 'overdue';
}
