// ============================================================================
// YARA LMS — Unified Course Architecture Types
// Canonical types for all courses, modules, lessons, labs, assessments & certificates
// Single Source of Truth for the entire YARA Educational Ecosystem
// ============================================================================

export type CourseTrack =
  | 'robotics_academy'  // YARA Robotics Academy (Levels 0–8 / 4 Tiers)
  | 'technology'        // Python, Scratch, JavaScript, Web, Embedded, AI, IoT
  | 'stem'              // STEM Education, Pedagogy for Educators, Patron Coaching
  | 'specialized';      // Industrial Automation, CAD, Computer Vision, PLC/SCADA

export type CourseCategory =
  // Robotics Academy
  | 'robotics_beginner'
  | 'robotics_intermediate'
  | 'robotics_advanced'
  | 'robotics_masterclass'
  // Technology
  | 'python'
  | 'javascript'
  | 'scratch'
  | 'web_development'
  | 'ai'
  | 'iot'
  | 'electronics'
  | 'embedded_systems'
  | 'data_science'
  // STEM
  | 'stem_education'
  | 'engineering'
  | 'digital_literacy'
  // Specialized
  | 'industrial_automation'
  | 'cad'
  | 'computer_vision'
  | 'plc_scada';

export type CourseLevel = 'Beginner' | 'Intermediate' | 'Advanced' | 'Masterclass' | 'All Levels';

export type CourseAccessRule = 
  | 'free'                  // Free enrolment & learning
  | 'membership_required'   // Unlocked with active $15 YARA Membership
  | 'prerequisite_locked';  // Unlocked upon completing prerequisite course

export type CourseModuleComponent =
  | 'theory'
  | 'video'
  | 'resource'
  | 'practical_lab'
  | 'assignment'
  | 'quiz'
  | 'project'
  | 'troubleshooting';

export interface CourseQuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
  questionType?: 'multiple_choice' | 'true_false' | 'code_output';
}

export interface GuidedPracticalLab {
  id: string;
  title: string;
  objective: string;
  equipment: string[];
  safetyRules: string[];
  circuitDiagramUrl?: string;
  simulationUrl?: string; // e.g. Wokwi / Tinkercad / Falstad
  instructions: string;
  expectedResult: string;
  troubleshootingTips: string[];
}

export interface PracticalAssignment {
  id: string;
  title: string;
  instructions: string;
  rubric: Array<{ criteria: string; points: number }>;
  maxPoints: number;
  submissionRequirements: string[]; // e.g. ["Code file or link", "Circuit schematic", "30-sec demo video"]
}

export interface SupportingResource {
  id: string;
  title: string;
  type: 'pdf' | 'document' | 'schematic' | 'code' | 'cad' | 'presentation' | 'datasheet' | 'link';
  fileUrl: string;
  sizeBytes?: number;
  description?: string;
}

export interface CourseModule {
  id: string;
  courseId: string;
  moduleNumber: number;
  order: number;
  title: string;
  coherentSkillArea: string;
  description: string;
  durationMinutes: number;

  // 1. Theory Overview & Key Concepts
  theoryOverview: string;
  theoryKeyConcepts: string[];

  // 2. Short Micro-Lesson Video (3–8 minutes)
  videoUrl?: string;
  videoTitle?: string;
  videoDurationSeconds?: number;

  // 3. Supporting Learning Resources
  resources: SupportingResource[];

  // 4. Guided Practical Lab
  guidedLab?: GuidedPracticalLab;

  // 5. Practical Assignment
  assignment?: PracticalAssignment;

  // 6. Knowledge Assessment / Quiz
  quizQuestions: CourseQuizQuestion[];
  quizPassingPercentage?: number;

  // 7. Troubleshooting Guidance
  troubleshootingGuide?: string;

  // 8. Mentor Support Topic
  mentorSupportTopic?: string;
}

export interface CourseProjectSpec {
  id: string;
  courseId: string;
  projectType: 'research_and_design' | 'assigned_final_design' | 'capstone_build';
  title: string;
  description: string;
  guidelines: string;
  rubric: Array<{ criteria: string; maxPoints: number }>;
  deliverablesRequired: string[];
}

export interface UnifiedCourse {
  id: string;
  code: string; // e.g. 'YARA-ROB-001', 'YARA-TECH-PY101'
  title: string;
  slug: string;
  version: string; // e.g. '1.0'
  track: CourseTrack;
  category: CourseCategory;
  level: CourseLevel;
  tierNumber?: number; // 1 to 4 for Robotics Academy
  shortSummary: string;
  description: string;
  thumbnailUrl: string;
  bannerUrl?: string;

  // Instructor & Mentors
  instructorName: string;
  instructorTitle: string;
  instructorAvatarUrl?: string;

  // Metrics & Requirements
  estimatedDurationHours: number;
  totalModulesCount: number;
  hardwareRequired: string[];
  learningOutcomes: string[];
  prerequisites: string[];

  // Access & Certification Rules
  accessRule: CourseAccessRule;
  membershipRequired: boolean;
  certificationEnabled: boolean;
  certificationTitle: string;
  certificationFeeUsd: number; // 0 for member-included, 5 for $5 certificate

  // Governance & Publishing
  isPublished: boolean;
  isDraft: boolean;
  isFeatured: boolean;
  enrolledCount: number;
  rating: number; // e.g. 4.9

  // Curriculum Units
  modules: CourseModule[];
  researchProject?: CourseProjectSpec;
  finalDesignProject?: CourseProjectSpec;

  createdAt: string;
  updatedAt: string;
}

export interface UnifiedEnrollment {
  id: string;
  userId: string;
  courseId: string;
  status: 'active' | 'completed' | 'dropped';
  enrolledAt: string;
  lastAccessedAt: string;
  completedAt?: string;

  // Progress metrics
  completedModuleIds: string[];
  completedLabIds: string[];
  completedAssignmentIds: string[];
  quizScores: Record<string, number>; // moduleId -> score %
  labSubmissions: Record<string, { notes: string; submittedAt: string }>;
  assignmentSubmissions: Record<string, { text: string; fileUrl?: string; score?: number; feedback?: string }>;

  researchProjectSubmitted?: boolean;
  finalDesignProjectSubmitted?: boolean;
  certificateIssued?: boolean;
  certificateId?: string;

  progressPercentage: number;
}

export interface MentorHelpRequest {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  courseId: string;
  courseTitle: string;
  moduleId?: string;
  moduleTitle?: string;
  topic: string;
  message: string;
  status: 'pending' | 'in_progress' | 'resolved';
  mentorName?: string;
  createdAt: string;
}

export interface LmsReportingOverview {
  totalCourses: number;
  totalPublishedCourses: number;
  totalLearnersEnrolled: number;
  totalCourseCompletions: number;
  totalCertificatesIssued: number;
  totalLabsCompleted: number;
  totalAssignmentsSubmitted: number;
  averageQuizScore: number;
  coursesByTrack: Record<CourseTrack, number>;
}
