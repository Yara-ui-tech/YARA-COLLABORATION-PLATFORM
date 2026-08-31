export type ChapterCategory = 
  | 'university'
  | 'high_school'
  | 'primary_school'
  | 'community_youth'
  | 'polytechnic'
  | 'provincial_hub';

export type ChapterStatus = 'active' | 'chartered' | 'forming' | 'probation' | 'archived';

export type ChapterLeaderRole = 
  | 'chairperson'
  | 'vice_chair'
  | 'secretary'
  | 'vice_secretary'
  | 'treasurer'
  | 'tech_lead'
  | 'public_relations'
  | 'pr_lead'
  | 'patron_advisor'
  | 'lab_coordinator'
  | 'faculty_advisor'
  | 'advisor';

export type ChapterReportCategory = 'general' | 'financial' | 'project_milestone';

export interface ChapterLeader {
  id: string;
  name: string;
  role: ChapterLeaderRole;
  email?: string;
  phone?: string;
  avatar_url?: string;
  department_or_grade?: string;
  is_public_contact: boolean;
  
  // Admin Approval & Role-Based Access Control (Assigned by Admins in Dashboard)
  is_approved_by_admin?: boolean;
  approved_by_admin_at?: string;
  approved_by_admin_name?: string;
  access_pin?: string;
  secretary_access_pin?: string; // backward compat alias
  can_submit_general_reports?: boolean;
  can_submit_financial_reports?: boolean;
  approval_notes?: string;
}

export interface ChapterProject {
  id: string;
  title: string;
  description: string;
  category: 'robotics_hardware' | 'iot_automation' | 'renewable_energy' | 'drone_tech' | 'coding_ai' | 'community_outreach';
  status: 'in_progress' | 'completed' | 'testing' | 'ideation';
  image_url?: string;
  hardware_stack?: string[];
  github_or_demo_link?: string;
}

export interface ChapterActivity {
  id: string;
  title: string;
  date: string;
  description: string;
  impact_metric?: string; // e.g. "45 High School Girls Trained in Arduino"
  image_url?: string;
}

export interface ChapterMember {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  role: string; // e.g. 'President / Chairperson', 'Robotics Engineer', 'Member', 'Vice Secretary'
  department_or_grade?: string;
  student_or_staff_id?: string;
  joined_date?: string;
  is_leadership?: boolean;
  avatar_url?: string;
  skills?: string[];
  status?: 'active' | 'core_member' | 'alumni' | 'cadet';
}

export interface ConfidentialChapterData {
  internal_budget_balance_usd?: number;
  internal_bank_or_ecocash_details?: string;
  private_executive_notes?: string;
  inventory_access_code?: string;
  national_patron_supervisor?: string;
  internal_drive_link?: string;
  confidential_attachments?: {
    name: string;
    url: string;
    uploaded_at: string;
  }[];
}

export interface Chapter {
  id: string;
  name: string; // e.g. "YARA Chinhoyi University of Technology (CUT) Chapter"
  code: string; // e.g. "YARA-CUT-01"
  category: ChapterCategory;
  institution_or_community: string; // e.g. "Chinhoyi University of Technology"
  province: string;
  district_or_city: string;
  banner_url?: string;
  logo_url?: string;
  description: string;
  established_date: string;
  status: ChapterStatus;
  approval_status?: 'pending' | 'approved' | 'rejected';
  registration_request_id?: string;
  
  // Provincial University Lead Hierarchy
  is_provincial_lead_university?: boolean;
  assigned_provincial_university_id?: string;
  assigned_provincial_university_name?: string;
  supervised_chapter_count?: number;

  total_members_count: number;
  active_projects_count: number;
  public_email?: string;
  public_phone?: string;
  public_social_links?: {
    twitter?: string;
    linkedin?: string;
    facebook?: string;
    instagram?: string;
    website?: string;
    github?: string;
  };
  meeting_schedule?: string; // e.g. "Wednesdays 15:00 - 17:00, Innovation Hub Lab 2"
  physical_location?: string;
  focus_areas: string[];
  leaders: ChapterLeader[];
  members?: ChapterMember[];
  projects: ChapterProject[];
  activities: ChapterActivity[];
  patron_advisor?: {
    name: string;
    title: string;
    organization: string;
    email?: string;
    phone?: string;
  };
  confidential_info?: ConfidentialChapterData;
  created_at: string;
  updated_at: string;
}

export interface ChapterRegistrationRequest {
  id: string;
  proposed_name: string; // must start with or contain YARA
  category: ChapterCategory;
  institution_or_community: string;
  province: string;
  district_or_city: string;
  logo_url?: string;
  banner_url?: string;
  description: string;
  physical_location: string;
  meeting_schedule: string;
  focus_areas: string[];
  public_email: string;
  public_phone: string;
  
  // Member & Leadership structure
  total_members_count: number;
  number_of_members?: number; // alias
  members?: ChapterMember[];
  proposed_members?: ChapterMember[]; // alias
  leaders?: ChapterLeader[];
  proposed_leaders?: ChapterLeader[]; // alias
  available_equipment?: string;
  patron_advisor?: {
    name: string;
    title: string;
    organization: string;
    email?: string;
    phone?: string;
  };
  
  // Provincial University Lead Reference
  assigned_provincial_university_id?: string;
  assigned_provincial_university_name?: string;
  
  // Applicant details
  applicant_name?: string;
  applicant_email?: string;
  applicant_phone?: string;
  applicant_role?: string;
  submitted_by_name?: string;
  submitted_by_email?: string;
  submitted_by_phone?: string;
  submitted_at?: string;
  status: 'pending' | 'approved' | 'rejected';
  admin_notes?: string;
  admin_review_notes?: string;
  created_at: string;
  updated_at: string;
}

export type ReportPeriodType = 
  | 'monthly'
  | 'quarterly'
  | 'annual'
  | 'special_event'
  | 'project_milestone'
  | 'financial';

export type ReportStatus = 
  | 'submitted'
  | 'under_review'
  | 'assessed'
  | 'revisions_requested'
  | 'approved';

export interface NationalExecutiveAssessment {
  assessed_by_name: string;
  assessed_by_email: string;
  assessed_at: string;
  grade: 'Outstanding (A)' | 'Good (B)' | 'Satisfactory (C)' | 'Needs Improvement (D)';
  score_out_of_100: number;
  national_executive_feedback: string;
  action_items_for_chapter?: string;
  grant_allocation_recommended?: boolean;
  recommended_grant_usd?: number;
}

export interface ChapterFinancialData {
  opening_balance_usd?: number;
  total_inflow_usd?: number;
  total_expenditure_usd?: number;
  closing_balance_usd?: number;
  grant_received_usd?: number;
  grant_acquittal_notes?: string;
  category_breakdown?: {
    hardware_and_components_usd?: number;
    logistics_and_transport_usd?: number;
    competition_and_events_usd?: number;
    workshop_materials_and_catering_usd?: number;
    tools_and_equipment_usd?: number;
    miscellaneous_usd?: number;
  };
  treasurer_certified?: boolean;
  treasurer_name?: string;
  invoices_drive_link?: string;
}

export interface ChapterReport {
  id: string;
  chapter_id: string;
  chapter_name: string;
  chapter_category: ChapterCategory;
  report_title: string;
  report_category?: 'general' | 'financial' | 'project_milestone';
  period_type: ReportPeriodType;
  period_date: string; // e.g. "2026-03" or "Q1 2026"
  submitted_by_name: string;
  submitted_by_role: string;
  submitted_by_email: string;
  submitted_by_leader_id?: string;
  submitted_at: string;
  executive_summary: string;
  activities_undertaken?: string;
  attendance_count?: number;
  hardware_projects_update?: string;
  challenges_and_needs?: string;
  report_document_url: string; // Google Drive / PDF / Doc link
  financial_statement_url?: string;
  financial_data?: ChapterFinancialData;
  supporting_images?: string[];
  status: ReportStatus;
  executive_assessment?: NationalExecutiveAssessment;
  
  // Security & National Locking
  is_locked?: boolean;
  locked_at?: string;
  locked_by_name?: string;
  leadership_verified?: boolean;
  leadership_approved_by_admin?: boolean;
  secretary_verified?: boolean; // backward compat alias
  secretary_approved_by_admin?: boolean; // backward compat alias
  admin_approval_ref?: string;
  leadership_verification_method?: 'roster_email' | 'access_pin' | 'admin_override' | 'auth_session';
  secretary_verification_method?: 'roster_email' | 'access_pin' | 'admin_override' | 'auth_session';
  document_seal_code?: string;
}
