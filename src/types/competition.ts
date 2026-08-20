export interface VirtualCompetition {
  id: string;
  title: string;
  category: 'robot_simulation' | 'pcb_design' | 'embedded_code' | 'ai_vision' | 'iot_automation';
  category_label?: string;
  description: string;
  rules: string;
  starter_url?: string;
  starter_repo_url?: string;
  start_time: string;
  end_time: string;
  duration_hours: number;
  max_score: number;
  status: 'upcoming' | 'active' | 'evaluating' | 'completed';
  prize?: string;
  image_url?: string;
  criteria?: string[];
  created_at?: string;
}

export interface VirtualSubmission {
  id?: string;
  competition_id: string;
  user_id: string;
  user_name?: string;
  user_avatar?: string;
  user_email?: string;
  simulation_url: string;
  repo_url?: string;
  video_url?: string;
  schematic_url?: string;
  writeup: string;
  score?: number;
  status: 'submitted' | 'under_review' | 'evaluated' | 'disqualified';
  feedback?: string;
  rank?: number;
  created_at?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  gender: 'boy' | 'girl';
  is_captain: boolean;
  age?: number | string;
  grade_or_level?: string;
  email?: string;
  phone?: string;
}

export interface CompetitionTeam {
  id: string;
  competition_id: string;
  competition_title: string;
  competition_category: string;
  team_name: string;
  school_organization: string;
  province: string;
  registered_by: string;
  leader_name: string;
  leader_email: string;
  leader_phone?: string;
  mentor_name?: string;
  mentor_email?: string;
  mentor_phone?: string;
  members: TeamMember[];
  boys_count: number;
  girls_count: number;
  total_members: number;
  is_eligible: boolean;
  eligibility_notes?: string;
  status: 'submitted' | 'approved' | 'rejected' | 'pending_revision';
  admin_notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface TeamCompositionStatus {
  totalCount: number;
  boysCount: number;
  girlsCount: number;
  hasMinTotal: boolean;
  hasMinBoys: boolean;
  hasMinGirls: boolean;
  hasCaptain: boolean;
  isEligible: boolean;
  reasons: string[];
}

