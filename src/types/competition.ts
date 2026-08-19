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

export interface CompetitionTeamMember {
  id?: string;
  team_id?: string;
  full_name: string;
  gender: 'boy' | 'girl';
  age?: number;
  email?: string;
  phone?: string;
  is_captain?: boolean;
}

export interface CompetitionTeam {
  id: string;
  competition_id: string;
  team_name: string;
  school_organization: string;
  category: string;
  province: string;
  mentor_name?: string;
  mentor_email?: string;
  mentor_phone?: string;
  captain_id?: string;
  is_eligible: boolean;
  status: 'pending' | 'approved' | 'rejected';
  admin_notes?: string;
  created_at?: string;
  members?: CompetitionTeamMember[];
}

export interface TeamEligibilityCheck {
  totalMembers: number;
  boysCount: number;
  girlsCount: number;
  hasMinMembers: boolean;
  hasMinBoys: boolean;
  hasMinGirls: boolean;
  isEligible: boolean;
}

