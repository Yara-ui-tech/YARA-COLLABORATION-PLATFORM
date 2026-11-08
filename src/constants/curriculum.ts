import { 
  SessionStudyResource, 
  SessionQuestion, 
  SessionAssignment, 
  SessionProject, 
  FinalExamQuestion,
  CourseLevel,
  CurriculumSession
} from '../types/curriculum';

export type { CurriculumSession };

// Dynamic Curriculum: Loaded from Supabase database
export const COURSE_LEVELS: CourseLevel[] = [];

export const CURRICULUM: CurriculumSession[] = [];

export const FINAL_EXAM_QUESTIONS: FinalExamQuestion[] = [];
