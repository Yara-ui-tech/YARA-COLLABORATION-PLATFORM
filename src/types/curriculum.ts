export interface CourseLevel {
  id: string;
  levelNumber: number;
  title: string;
  description: string;
  targetAudience: string;
  badge: string;
  sessionsCount?: number;
}

export interface CurriculumSession {
  id: string;
  course_id?: string;
  course_level?: number;
  type: 'online' | 'physical';
  topic: string;
  outcome: string;
  description: string;
  part: 'Electronics' | 'Programming' | 'Innovation + Build' | 'Robotics & Hardware' | 'IoT & Networking';
  video_url?: string;
  resources?: SessionStudyResource[];
  questions?: SessionQuestion[];
  assignments?: SessionAssignment[];
  projects?: SessionProject[];
  details?: {
    theory?: string[];
    activities?: string[];
    checkpoints?: string[];
    safetyRules?: string[];
    formulas?: string[];
  };
}

export interface SessionStudyResource {
  id?: string;
  title: string;
  url: string;
  type: 'video' | 'simulation' | 'doc' | 'github' | 'tool' | 'simulator' | 'datasheet' | 'other';
  description?: string;
}

export type SessionResource = SessionStudyResource;

export interface SessionQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  points?: number;
}

export interface SessionAssignment {
  id: string;
  title: string;
  description: string;
  starterLink?: string;
  instructions?: string[];
  deliverables?: string[];
}

export interface SessionProject {
  id: string;
  title: string;
  description: string;
  starterLink?: string;
  objectives: string[];
  simulationPlatform?: string;
}

export interface FinalExamQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  category: 'Electronics' | 'Programming' | 'Robotics Architecture' | 'Safety & Innovation';
}

export interface FinalExamAttempt {
  id?: string;
  user_id: string;
  score: number;
  total_questions: number;
  percentage: number;
  passed: boolean;
  answers: Record<string, number>;
  created_at?: string;
}

export interface FinalProjectSubmission {
  id?: string;
  user_id: string;
  title: string;
  problem_statement: string;
  simulation_url: string;
  repo_url: string;
  video_url: string;
  documentation: string;
  status: 'submitted' | 'under_review' | 'approved' | 'revision_requested';
  grade?: number;
  feedback?: string;
  created_at?: string;
}

export interface Certificate {
  id: string;
  user_id: string;
  certificate_number: string;
  student_name: string;
  course_title: string;
  score: number;
  grade: string;
  issue_date: string;
  verification_url?: string;
  metadata?: {
    exam_score?: number;
    project_title?: string;
    instructor_title?: string;
  };
}
