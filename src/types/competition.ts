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
