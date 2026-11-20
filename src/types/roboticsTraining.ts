// ==============================================================================
// YARA ACADEMY: ROBOTICS & ENGINEERING TRAINING PROGRAMME TYPES
// ==============================================================================

export type RoboticsProgrammeId = 
  | 'curriculum_primary'
  | 'curriculum_highschool'
  | 'weekly_club_primary'
  | 'weekly_club_secondary'
  | 'monthly_workshop_primary'
  | 'monthly_workshop_secondary'
  | 'comprehensive_certification'
  | 'holiday_bootcamp_junior'
  | 'holiday_bootcamp_senior';

export type RoboticsCertificationLevelId = 
  | 'level_1_explorer'
  | 'level_2_junior'
  | 'level_3_secondary'
  | 'level_4_advanced'
  | 'teacher_cpd';

export type EnrolmentType = 'individual' | 'parent_guardian' | 'school_group' | 'teacher';

export type TrainingLocationOption = 
  | 'school_lab' 
  | 'yara_hub_harare' 
  | 'bulawayo_center' 
  | 'community_center' 
  | 'virtual_hybrid';

export interface RoboticsProgramme {
  id: RoboticsProgrammeId;
  title: string;
  category: 'curriculum' | 'club' | 'workshop' | 'certification' | 'bootcamp';
  targetAudience: string;
  ageRange: string;
  feePerLearner: number;
  feeStructure: 'complete_programme' | 'per_session' | 'per_lesson';
  durationDescription: string;
  minimumLessonsOrSessions?: number;
  description: string;
  features: string[];
  syllabusTopics: string[];
  badge: string;
  isPopular?: boolean;
}

export interface RoboticsCertificationPathway {
  id: RoboticsCertificationLevelId;
  levelNumber: number;
  levelTitle: string;
  targetAudience: string;
  minimumRequirements: string;
  requiredLessonsOrSessions: number;
  feePerUnit: number;
  minimumCost: number;
  isProvisionalPricing?: boolean;
  color: string;
  accentColor: string;
  description: string;
  learningOutcomes: string[];
  prerequisites?: string;
  sampleProject: string;
}

export interface StudentGroupEntry {
  id: string;
  fullName: string;
  ageOrGrade: string;
  gender?: 'boy' | 'girl' | 'other';
  guardianPhone?: string;
}

export interface RoboticsLearnerEnrolment {
  id: string;
  created_at: string;
  userId?: string;
  enrolmentType: EnrolmentType;
  primaryContactName: string;
  primaryContactEmail: string;
  primaryContactPhone: string;
  parentOrGuardianName?: string;
  schoolOrChapterName: string;
  gradeOrEducationLevel: string;
  programmeId: RoboticsProgrammeId;
  programmeTitle: string;
  certificationLevelId?: RoboticsCertificationLevelId;
  locationOption: TrainingLocationOption;
  preferredSchedule: 'weekday_afternoon' | 'saturday_morning' | 'holiday_intensive' | 'custom';
  studentsList: StudentGroupEntry[];
  learnerCount: number;
  calculatedFee: number;
  includeHardwareKit: boolean;
  hardwareKitFee: number;
  totalPayableAmount: number;
  paymentStatus: 'pending' | 'paid' | 'sponsored' | 'partial';
  enrolmentStatus: 'submitted' | 'confirmed' | 'active' | 'graduated' | 'cancelled';
  assignedTrainerName?: string;
  notes?: string;
}

export interface RoboticsLearningPassport {
  learnerId: string;
  learnerName: string;
  schoolName: string;
  gradeLevel: string;
  currentLevel: RoboticsCertificationLevelId;
  levelTitle: string;
  sessionsAttended: number;
  requiredSessions: number;
  lessonsCompleted: number;
  totalLessonsRequired: number;
  progressPercentage: number;
  projectsCompleted: Array<{
    id: string;
    title: string;
    description: string;
    completedDate: string;
    score: number;
    badge: string;
  }>;
  skillsAcquired: string[];
  assessmentResults: Array<{
    assessmentName: string;
    score: number;
    maxScore: number;
    date: string;
    feedback: string;
  }>;
  isEligibleForCertificate: boolean;
  certificatesEarned: Array<{
    certificateNumber: string;
    levelTitle: string;
    issueDate: string;
    verificationQrHash: string;
    grade: string;
    downloadUrl?: string;
  }>;
}

export interface RoboticsTeacherEnrolment {
  id: string;
  created_at: string;
  userId?: string;
  teacherName: string;
  email: string;
  phone: string;
  schoolName: string;
  subjectTaught: string;
  province: string;
  city: string;
  sessionsCompleted: number;
  requiredSessions: number; // 5 sessions min ($50)
  purchasedRoboticsKit: boolean; // $50
  totalCost: number;
  status: 'enrolled' | 'in_training' | 'certified';
  certificateNumber?: string;
  paymentStatus: 'pending' | 'paid';
}

export interface RoboticsSchoolPartnershipRequest {
  id: string;
  created_at: string;
  schoolName: string;
  contactPersonName: string;
  contactRole: string;
  email: string;
  phone: string;
  province: string;
  district?: string;
  city: string;
  schoolType: 'primary' | 'secondary' | 'combined' | 'tertiary';
  estimatedLearners: number;
  requestedOfferings: Array<
    | 'curriculum_training'
    | 'weekly_robotics_club'
    | 'monthly_workshops'
    | 'holiday_bootcamps'
    | 'teacher_training'
    | 'stem_competitions'
  >;
  hasExistingLab: boolean;
  preferredStartDate: string;
  additionalMessage?: string;
  status: 'submitted' | 'under_review' | 'contacted' | 'approved' | 'active';
  adminNotes?: string;
}

export interface RoboticsAttendanceRecord {
  id: string;
  sessionId: string;
  sessionDate: string;
  sessionTitle: string;
  programmeId: string;
  enrolmentId: string;
  learnerName: string;
  present: boolean;
  notes?: string;
}

export interface RoboticsAssessmentRecord {
  id: string;
  enrolmentId: string;
  learnerName: string;
  levelId: RoboticsCertificationLevelId;
  assessmentDate: string;
  rubricScores: {
    circuitDesign: number;
    codingLogic: number;
    mechanicalBuild: number;
    problemSolving: number;
  };
  totalScore: number;
  grade: 'Distinction' | 'Merit' | 'Pass';
  assessorName: string;
  feedback: string;
  isApprovedForCertification: boolean;
}

