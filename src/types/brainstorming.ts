export type BrainstormingCategory = 
  | 'pattern_recognition'
  | 'cause_and_effect'
  | 'spatial_reasoning'
  | 'logic_deduction'
  | 'lateral_thinking'
  | 'everyday_physics'
  | 'circuit_fault'
  | 'robot_navigation'
  | 'code_tracing'
  | 'mechanical_logic'
  | 'schematic_analysis';

export interface BrainstormingQuestion {
  id: string;
  title: string;
  category: BrainstormingCategory;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  image_url: string;
  question: string;
  options: string[];
  correctIndex: number;
  hint: string;
  critical_thinking_principle: string;
  explanation: string;
  points: number;
}

export interface BrainstormingAttempt {
  id?: string;
  user_id: string;
  user_name?: string;
  score: number;
  total_questions: number;
  streak: number;
  category_breakdown?: Record<string, number>;
  category?: string;
  created_at?: string;
}

