export type ParticipantType = 
  | 'School'
  | 'Robotics Club'
  | 'University/College Team'
  | 'Independent Youth Team'
  | 'Community Innovation Group'
  | 'Other';

export type CompetitionCategoryType = 
  | 'underwater_drone'
  | 'autonomous_maze'
  | 'innovation_pitch';

export type TeamRegistrationStatus = 
  | 'Draft'
  | 'Submitted'
  | 'Under Review'
  | 'Approved'
  | 'Corrections Required'
  | 'Rejected'
  | 'Withdrawn'
  | 'Finalist'
  | 'Winner';

export interface CompetitionEventConfig {
  id: string;
  name: string;
  edition_year: number;
  theme: string;
  tagline: string;
  description: string;
  organizer: string;
  date_display: string;
  venue_display: string;
  registration_deadline_display: string;
  is_registration_open: boolean;
  is_leaderboard_published: boolean;
  categories: {
    id: CompetitionCategoryType;
    title: string;
    weight_percentage: number;
    description: string;
    skills_assessed: string[];
    rules_summary: string;
    is_active: boolean;
  }[];
}

export interface YaraTeamMember {
  id: string;
  full_name: string;
  age: number | string;
  gender: 'boy' | 'girl';
  school_organization?: string;
  grade_level?: string;
  email?: string;
  phone?: string;
  role: 'Team Leader' | 'Programmer' | 'Mechanical Engineer' | 'Electronics Engineer' | 'Designer' | 'Researcher' | 'Presenter' | 'Other';
  other_role?: string;
  is_captain?: boolean;
}

export interface UnderwaterDroneDetails {
  has_rov: boolean;
  will_build_own: boolean;
  robot_description: string;
  main_controller: string;
  sensors_used: string;
  communication_method: string;
  power_source: string;
  estimated_dimensions: string;
}

export interface AutonomousMazeDetails {
  robot_name: string;
  controller: string;
  sensors: string;
  programming_language: string;
  navigation_method: string;
  robot_dimensions: string;
}

export interface InnovationPitchDetails {
  project_title: string;
  problem_addressed: string;
  target_beneficiaries: string;
  proposed_solution: string;
  technology_used: string;
  expected_social_impact: string;
  project_stage: 'Concept' | 'Research' | 'Working Prototype' | 'Tested & Deployed';
  has_prototype: boolean;
  proposal_summary?: string;
}

export interface TeamUploadedDocument {
  id: string;
  name: string;
  type: 'project_proposal' | 'robot_description' | 'technical_doc' | 'image' | 'video_link' | 'pitch_deck_pdf';
  file_url: string;
  size_kb?: number;
  uploaded_at: string;
}

export interface TeamConsents {
  competition_rules_agreed: boolean;
  parent_guardian_consent_minor: boolean;
  event_participation_consent: boolean;
  media_photo_video_consent: boolean;
  promotional_educational_use_consent: boolean;
  consented_by_name: string;
  consented_at: string;
}

export interface YaraCompetitionRegistration {
  id: string;
  registration_id: string; // e.g. YARA-RC26-000123
  event_id: string;
  event_name: string;
  
  // Step 1: Participant Type
  participant_type: ParticipantType;
  participant_type_other?: string;

  // Step 2: Team Info
  team_name: string;
  school_organization: string;
  province: string;
  district: string;
  city_town: string;

  team_leader_name: string;
  team_leader_email: string;
  team_leader_phone: string;

  mentor_name?: string;
  mentor_email?: string;
  mentor_phone?: string;

  selected_categories: CompetitionCategoryType[];

  // Step 3: Members
  members: YaraTeamMember[];
  boys_count: number;
  girls_count: number;
  total_members: number;
  is_gender_eligible: boolean;

  // Step 4: Challenge specifics
  underwater_drone_info?: UnderwaterDroneDetails;
  autonomous_maze_info?: AutonomousMazeDetails;
  innovation_pitch_info?: InnovationPitchDetails;

  // Step 5: Documents
  documents: TeamUploadedDocument[];
  video_demo_url?: string;

  // Step 6: Consents
  consents: TeamConsents;

  // Status & Administration
  status: TeamRegistrationStatus;
  admin_notes?: string;
  correction_requests?: string[];
  assigned_judge_ids?: string[];
  
  created_at: string;
  updated_at: string;
  user_id?: string;
}

export interface CategoryScoreSheet {
  id: string;
  registration_id: string;
  team_id: string;
  team_name: string;
  category: CompetitionCategoryType;
  judge_id: string;
  judge_name: string;
  is_locked: boolean;
  submitted_at: string;
  notes?: string;

  // Underwater Drone Breakdown (0-100)
  underwater_scores?: {
    mission_completion: number; // 25
    navigation: number;         // 15
    precision: number;          // 15
    engineering_design: number; // 15
    innovation: number;         // 10
    reliability: number;        // 10
    safety: number;             // 5
    teamwork: number;           // 5
    total: number;
  };

  // Autonomous Maze Breakdown (0-100)
  maze_scores?: {
    completion: number;          // 25
    time_efficiency: number;     // 15
    navigation_accuracy: number; // 15
    autonomous_operation: number;// 15
    engineering_design: number;  // 10
    programming_cleanliness: number; // 10
    reliability: number;         // 10
    total: number;
  };

  // Innovation Pitch Breakdown (0-100)
  pitch_scores?: {
    problem_understanding: number; // 20%
    innovation: number;            // 20%
    technical_feasibility: number; // 20%
    social_impact: number;         // 20%
    sustainability: number;        // 10%
    presentation_delivery: number; // 10%
    total: number;
  };

  final_category_score: number; // normalized out of 100
}

export interface ChampionshipTeamStanding {
  team_id: string;
  registration_id: string;
  team_name: string;
  school_organization: string;
  province: string;
  selected_categories: CompetitionCategoryType[];
  underwater_score?: number; // out of 100
  maze_score?: number;       // out of 100
  pitch_score?: number;      // out of 100
  overall_championship_score: number; // calculated with 35% Underwater + 35% Maze + 30% Innovation
  rank_overall: number;
  rank_underwater?: number;
  rank_maze?: number;
  rank_pitch?: number;
  awarded_titles: string[];
}

export interface CompetitionEmailNotification {
  id: string;
  registration_id: string;
  team_name: string;
  recipient_email: string;
  subject: string;
  body: string;
  type: 'submission_confirmation' | 'approval' | 'corrections_requested' | 'general_announcement';
  sent_at: string;
}
