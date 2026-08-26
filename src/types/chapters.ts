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
  | 'patron_advisor';

export interface ChapterLeader {
  id: string;
  name: string;
  role: ChapterLeaderRole;
  email?: string;
  phone?: string;
  avatar_url?: string;
  department_or_grade?: string;
  is_public_contact: boolean;
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
  projects: ChapterProject[];
  activities: ChapterActivity[];
  patron_advisor?: {
    name: string;
    title: string;
    organization: string;
    email?: string;
  };
  confidential_info?: ConfidentialChapterData;
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

export interface ChapterReport {
  id: string;
  chapter_id: string;
  chapter_name: string;
  chapter_category: ChapterCategory;
  report_title: string;
  period_type: ReportPeriodType;
  period_date: string; // e.g. "2026-03" or "Q1 2026"
  submitted_by_name: string;
  submitted_by_role: string;
  submitted_by_email: string;
  submitted_at: string;
  executive_summary: string;
  activities_undertaken: string;
  attendance_count: number;
  hardware_projects_update: string;
  challenges_and_needs: string;
  report_document_url: string; // Google Drive / PDF / Doc link
  financial_statement_url?: string;
  supporting_images?: string[];
  status: ReportStatus;
  executive_assessment?: NationalExecutiveAssessment;
}
