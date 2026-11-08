// ============================================================================
// YARA LMS – Programming Course Types
// ============================================================================

export type CourseCategory =
  | 'python'
  | 'javascript'
  | 'scratch'
  | 'web_development'
  | 'data_science'
  | 'robotics_programming'
  | 'electronics';

export type CourseDifficulty = 'beginner' | 'intermediate' | 'advanced';

export type CourseModuleType = 'video' | 'reading' | 'quiz' | 'project';

export interface CourseQuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
}

export interface CourseModule {
  id: string;
  courseId: string;
  title: string;
  description: string;
  type: CourseModuleType;
  order: number;
  durationMinutes: number;
  videoUrl?: string;
  readingContent?: string;
  quizQuestions?: CourseQuizQuestion[];
  projectInstructions?: string;
}

export interface ProgrammingCourse {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  category: CourseCategory;
  difficulty: CourseDifficulty;
  coverImageUrl?: string;
  estimatedHours: number;
  instructorName: string;
  instructorTitle?: string;
  tags: string[];
  modules: CourseModule[];
  prerequisites?: string[];
  learningOutcomes: string[];
  certificationEnabled: boolean;
  certificationTitle?: string; // e.g. "Python Fundamentals Certificate"
  isPublished: boolean;
  enrolledCount: number;
  rating?: number; // 0-5
  createdAt: string;
  updatedAt: string;
  // Admin metadata
  createdBy?: string;
}

export interface CourseEnrollment {
  id: string;
  userId: string;
  courseId: string;
  enrolledAt: string;
  completedAt?: string;
  isCompleted: boolean;
  progressPercent: number;
  completedModuleIds: string[];
  quizScores: Record<string, number>; // moduleId → score
  lastAccessedAt: string;
}

export interface ProgrammingCertificate {
  id: string;
  userId: string;
  userEmail: string;
  studentName: string;
  courseId: string;
  courseTitle: string;
  courseCategory: CourseCategory;
  certificateNumber: string; // e.g. YARA-PROG-2026-001234
  issueDate: string;
  grade: string; // e.g. "Distinction", "Merit", "Pass"
  score: number; // 0-100
  verifyUrl: string;
  isVerified: boolean;
}

export interface CourseFormData {
  title: string;
  subtitle: string;
  description: string;
  category: CourseCategory;
  difficulty: CourseDifficulty;
  coverImageUrl: string;
  estimatedHours: number;
  instructorName: string;
  instructorTitle: string;
  tags: string;
  learningOutcomes: string;
  prerequisites: string;
  certificationEnabled: boolean;
  certificationTitle: string;
  isPublished: boolean;
}

export const COURSE_CATEGORY_LABELS: Record<CourseCategory, string> = {
  python: 'Python Programming',
  javascript: 'JavaScript / Web',
  scratch: 'Scratch / Block Coding',
  web_development: 'Web Development',
  data_science: 'Data Science & AI',
  robotics_programming: 'Robotics Programming',
  electronics: 'Electronics & Hardware',
};

export const COURSE_CATEGORY_COLORS: Record<CourseCategory, { bg: string; text: string; border: string }> = {
  python: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  javascript: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' },
  scratch: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  web_development: { bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-200' },
  data_science: { bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200' },
  robotics_programming: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  electronics: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
};

export const DIFFICULTY_LABELS: Record<CourseDifficulty, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
};

export const DIFFICULTY_COLORS: Record<CourseDifficulty, string> = {
  beginner: 'text-emerald-600',
  intermediate: 'text-amber-600',
  advanced: 'text-red-600',
};

// Clean slate course catalog - ready for admin uploads
export const STARTER_PROGRAMMING_COURSES: ProgrammingCourse[] = [];
