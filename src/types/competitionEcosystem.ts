import { CompetitionCategoryType, YaraTeamMember } from './yaraCompetition';

// Sponsorship Types
export type SponsorshipTier = 
  | 'title_sponsor'      // $1,000+
  | 'gold_sponsor'       // $500
  | 'silver_sponsor'     // $250
  | 'tech_sponsor'       // In-kind
  | 'food_sponsor'       // Meals
  | 'awards_sponsor'     // Trophies/Prizes
  | 'education_sponsor'; // Underserved learners

export interface SponsorshipAllocationBreakdown {
  prizes_amount: number;
  equipment_amount: number;
  underserved_subsidies: number;
  operations_materials: number;
}

export interface SponsorRecord {
  id: string;
  organization_name: string;
  contact_person: string;
  email: string;
  phone: string;
  website?: string;
  tier: SponsorshipTier;
  contribution_type: 'cash' | 'in_kind' | 'hybrid';
  committed_amount: number;
  received_amount: number;
  in_kind_description?: string;
  target_focus: string;
  logo_url?: string;
  description: string;
  status: 'pending' | 'approved' | 'received' | 'declined';
  benefits_active: boolean;
  allocations: SponsorshipAllocationBreakdown;
  created_at: string;
}

// Volunteer Departments & Roles (Organizational & Competition Duties)
export type VolunteerDepartment =
  | 'regional_representative'          // Regional / Provincial YARA Representative
  | 'grants_donations_specialist'      // Grants, Funding & Donations Applications Volunteer
  | 'voluntary_internship'             // Voluntary Internship (Robotics R&D, STEM Software, Ops)
  | 'voluntary_driver_logistics'       // Voluntary Driving & Fleet Logistics
  | 'educator_trainer_facilitator'     // Educator STEM Training & AI Bootcamp Facilitator
  | 'chapter_patron_mentor'            // School / University Chapter Mentor & Patron
  | 'curriculum_translator'            // STEM Curriculum & Indigenous Language Translator
  | 'hardware_assembly_lab'            // Robotics Kit Assembly & Soldering Lab Assistant
  | 'registration'                     // Registration & Participant Welcome
  | 'competition_operations'           // Competition Operations & Field Marshals
  | 'technical_support'                // Technical Pit Support & Electronics
  | 'underwater_challenge'             // Underwater Drone & Aquatic Challenge Marshal
  | 'maze_challenge'                   // Maze & Autonomous Robotics Marshal
  | 'innovation_pitch'                 // Innovation Pitch Staging & Presentation
  | 'media_photography'                // Media, Videography & Photography
  | 'social_media'                     // Social Media, PR & Live Broadcasts
  | 'hospitality'                      // Hospitality & Catering
  | 'logistics'                        // Logistics, Venue Setup & Heavy Equipment
  | 'crowd_management'                 // Crowd Management & Safety Lines
  | 'first_aid_safety'                 // First Aid & Emergency Medical Support
  | 'it_support'                       // IT, Arena Wi-Fi & Live Scoring Server Support
  | 'protocol'                         // VIP Protocol & Dignitary Hosting
  | 'judging_support'                  // Judging Secretariat & Score Collation
  | 'custom_voluntary_duty';           // Custom / Open Voluntary Duty Specification

export interface VolunteerApplication {
  id: string;
  full_name: string;
  age: number;
  email: string;
  phone: string;
  organization_school: string;
  province?: string;
  custom_role_description?: string;
  skills: string[];
  previous_experience: string;
  availability: 'all_days' | 'day_1' | 'day_2' | 'day_3' | 'virtual_prep' | 'weekends' | 'flexible_ongoing';
  preferred_department: VolunteerDepartment;
  secondary_department?: VolunteerDepartment;
  emergency_contact: string;
  emergency_phone: string;
  status: 'pending' | 'approved' | 'waitlisted' | 'declined';
  assigned_department?: VolunteerDepartment;
  assigned_supervisor?: string;
  shift_time?: string;
  checked_in_event_day?: boolean;
  checked_in_at?: string;
  certificate_issued?: boolean;
  created_at: string;
}

// Judge Scoring & Rubric
export interface JudgeRecord {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  organization: string;
  designation: string;
  assigned_categories: CompetitionCategoryType[];
  assigned_team_ids: string[];
  bio: string;
  is_lead_judge: boolean;
  status: 'active' | 'invited' | 'declined';
  created_at: string;
}

export interface DigitalScoreSubmission {
  id: string;
  team_id: string;
  team_name: string;
  registration_id: string;
  category: CompetitionCategoryType;
  judge_id: string;
  judge_name: string;
  engineering_design: number; // Max 20
  innovation: number;         // Max 20
  performance: number;        // Max 40
  safety: number;             // Max 10
  teamwork: number;           // Max 10
  total_score: number;        // Max 100
  notes: string;
  is_locked: boolean;
  submitted_at: string;
}

// Financial Ledger & Budget
export interface FinancialTransaction {
  id: string;
  type: 'income' | 'expense';
  category: 
    | 'team_registration'
    | 'sponsorship_cash'
    | 'donation'
    | 'grant'
    | 'in_kind'
    | 'venue'
    | 'food_catering'
    | 'awards_trophies'
    | 'certificates'
    | 'robotics_equipment'
    | 'marketing_media'
    | 'transport_logistics'
    | 'safety_first_aid'
    | 'operations';
  title: string;
  amount: number;
  currency: 'USD' | 'ZiG';
  status: 'confirmed' | 'projected' | 'pending';
  payer_or_payee: string;
  date: string;
  notes?: string;
}

// Digital Certificate
export type CertificateType =
  | 'participant'
  | 'winner'
  | 'runner_up'
  | 'third_place'
  | 'judge'
  | 'volunteer'
  | 'mentor'
  | 'sponsor'
  | 'partner'
  | 'speaker';

export interface DigitalCertificate {
  certificate_id: string; // e.g. YARA-CERT-2026-004821
  recipient_name: string;
  recipient_email: string;
  type: CertificateType;
  event_name: string;
  edition_year: number;
  achievement_title: string;
  team_name?: string;
  category_name?: string;
  issued_date: string;
  qr_code_hash: string;
  is_verified: boolean;
}

// Global Announcement
export interface CompetitionAnnouncement {
  id: string;
  title: string;
  body: string;
  target_audience: 'all' | 'teams' | 'sponsors' | 'volunteers' | 'judges';
  priority: 'normal' | 'high' | 'urgent';
  created_at: string;
  author: string;
}
