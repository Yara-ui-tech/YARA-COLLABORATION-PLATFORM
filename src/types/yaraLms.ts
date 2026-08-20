import { SessionQuestion, SessionAssignment, SessionProject, SessionStudyResource } from './curriculum';

export type LearnerLevelNumber = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export interface YARACourseLevel {
  levelNumber: LearnerLevelNumber;
  code: string;
  title: string;
  tagline: string;
  description: string;
  badge: string;
  badgeIcon: string;
  color: string;
  targetOutcome: string;
  sessions: string[]; // array of session IDs (e.g. ['S00'], ['S01', 'S02', ...], ['P01'])
  prerequisiteLevel?: LearnerLevelNumber;
}

export type SessionType = 'online' | 'physical_lab' | 'capstone' | 'showcase';

export interface RequiredComponentItem {
  name: string;
  quantity: number;
  purpose: string;
  estimatedCostUsd?: number;
  inStarterKit?: boolean;
}

export interface YARALmsSession {
  id: string; // e.g. 'S00', 'S01', ... 'P01', 'P05'
  levelNumber: LearnerLevelNumber;
  order: number;
  title: string;
  subtitle: string;
  type: SessionType;
  part: 'Foundations' | 'Electronics' | 'Block Programming' | 'Embedded Systems' | 'Robotics & Hardware' | 'IoT & AI' | 'Research & Design' | 'Innovation & Capstone';
  durationMinutes: number;
  prerequisites: string[]; // previous session IDs required
  
  // 5 Essential Session Questions
  learningObjective: string;
  whyLearnThis: string;
  whatYouWillBuild: string;
  whatYouWillSubmit: string;
  innovatorContribution: string;

  // Instructional Content
  video_url: string;
  video_duration_seconds: number;
  reading_markdown: string;
  simulation_embed_url?: string;
  simulation_platform?: 'Tinkercad' | 'Wokwi' | 'Falstad' | 'Scratch' | 'Custom';
  
  // Physical components requirement
  hasPhysicalComponents: boolean;
  componentsRequired?: RequiredComponentItem[];
  
  // Assessment & Practical Deliverables
  quizQuestions: SessionQuestion[];
  quizPassingScore: number; // e.g., 70%
  assignment: SessionAssignment;
  miniProject: SessionProject;
  resources: SessionStudyResource[];

  // Practical activities
  practicalSteps?: string[];
  safetyGuidelines?: string[];
}

export interface VideoWatchProgress {
  sessionId: string;
  userId: string;
  maxWatchedTimeSeconds: number;
  totalDurationSeconds: number;
  watchedSegments: [number, number][]; // [start, end]
  percentCompleted: number;
  isCompleted: boolean;
  lastUpdated: string;
}

export interface SessionCompletionRecord {
  sessionId: string;
  userId: string;
  videoCompleted: boolean;
  quizPassed: boolean;
  quizScore: number;
  quizAttempts: number;
  assignmentSubmitted: boolean;
  assignmentSubmissionText?: string;
  assignmentFileUrl?: string;
  miniProjectSubmitted: boolean;
  miniProjectUrl?: string;
  miniProjectNotes?: string;
  isFullyCompleted: boolean;
  completedAt?: string;
  practicalVerifiedByInstructor?: boolean;
}

export interface QuizAttemptRecord {
  attemptId: string;
  userId: string;
  sessionId: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  passed: boolean;
  questionsPresented: string[]; // Question IDs in randomized order
  userAnswers: Record<string, number>;
  timeSpentSeconds: number;
  timestamp: string;
}

export interface CapstoneProjectSubmission {
  id: string;
  userId: string;
  userEmail: string;
  studentName: string;
  thematicArea: 'Agriculture' | 'Water' | 'Education' | 'Environment' | 'Accessibility' | 'Healthcare' | 'Energy' | 'Safety' | 'Transport' | 'Community Development' | 'Youth Empowerment';
  
  // 21-point comprehensive documentation fields
  title: string;
  problemStatement: string;
  backgroundResearch: string;
  objectives: string[];
  targetUsers: string;
  proposedSolution: string;
  systemArchitectureDescription: string;
  circuitDiagramUrl?: string;
  bomItems: { component: string; quantity: number; unitCost: number; totalCost: number; purpose: string }[];
  totalBomCostUsd: number;
  softwareRepoUrl?: string;
  sourceCodeSnippet?: string;
  mechanicalDesignDescription: string;
  buildProcessSteps: string[];
  testingProcedureAndResults: string;
  challengesEncountered: string;
  improvementsAndFutureWork: string;
  socialImpactStatement: string;
  researchReferences: string[];
  photos: string[];
  prototypeVideoUrl: string;
  pitchDurationSeconds: number;
  pitchVideoUrl: string;

  // Evaluation & Grading
  status: 'draft' | 'submitted' | 'under_review' | 'revision_requested' | 'approved' | 'rejected';
  rubricScores?: {
    problemDefinition: number; // /10
    researchQuality: number; // /10
    designThinking: number; // /10
    engineeringDesign: number; // /10
    electronicsExecution: number; // /10
    programmingLogic: number; // /10
    functionality: number; // /10
    innovationFactor: number; // /10
    testingRigor: number; // /10
    documentationCompleteness: number; // /10
    socialImpact: number; // /10
    pitchPresentation: number; // /10
  };
  totalScorePercentage?: number;
  instructorFeedback?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  submittedAt: string;
}

export interface LearnerPortfolio {
  userId: string;
  studentName: string;
  currentLevel: LearnerLevelNumber;
  completedSessionsCount: number;
  totalSessionsCount: number;
  researchNotes: { sessionId: string; title: string; notes: string; date: string }[];
  problemStatements: { id: string; problem: string; rootCauses: string[]; hmwQuestion: string }[];
  designThinkingArtifacts: { empathize: string; define: string; ideate: string; prototype: string; test: string }[];
  circuitDesigns: { title: string; url: string; platform: string; date: string }[];
  codeRepositories: { title: string; url: string; language: string }[];
  hardwareBuilds: { title: string; photoUrl: string; description: string }[];
  capstone?: CapstoneProjectSubmission;
  badgesUnlocked: string[];
}

export interface YARAKitItem {
  id: string;
  title: string;
  subtitle: string;
  priceUsd: number;
  description: string;
  imageUrl?: string;
  includedComponents: string[];
  suitableLevels: LearnerLevelNumber[];
  inStock: boolean;
  contactInquiryPhone: string;
}

export interface CertificateEligibilityCheck {
  isEligible: boolean;
  requirements: {
    allSessionsCompleted: { met: boolean; current: number; total: number };
    allQuizzesPassed: { met: boolean; passedCount: number; totalCount: number };
    allAssignmentsSubmitted: { met: boolean; submittedCount: number; totalCount: number };
    practicalLabsCompleted: { met: boolean; completedCount: number; totalCount: number };
    capstoneSubmitted: { met: boolean; status?: string };
    capstoneApproved: { met: boolean; score?: number };
    isRegisteredYaraMember: { met: boolean };
    subscriptionPaidAndApproved: { met: boolean; status: string; expiresAt?: string };
  };
  unmetReasons: string[];
}
