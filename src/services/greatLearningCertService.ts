import { Certificate } from '../types/curriculum';
import { ProgrammingCertificate } from '../types/lmsCourseTypes';
import { COMPLETE_YARA_SESSIONS, getSessionById } from '../constants/yaraLmsCatalog';
import { 
  getAllUserCompletions, 
  getUserCapstoneSubmission,
  checkCertificateEligibility
} from './yaraLmsService';
import { 
  getAllCourses, 
  getCourseById, 
  getEnrollment,
  getAllUserProgrammingCertificates,
  getProgrammingCertificateByNumber
} from './programmingCoursesService';
import { getEducatorCertificateByCodeOrEmail } from './eventRegistrationService';
import { supabase } from '../lib/supabase';

// Unified storage key for all minted certificates
const STORAGE_KEY_UNIFIED_CERTS = 'yara_gla_unified_certificates';

export interface GreatLearningCourseEligibility {
  courseId: string;
  courseTitle: string;
  isEligible: boolean;
  isClaimed: boolean;
  completionPercentage: number;
  totalModules: number;
  completedModules: number;
  quizzesTotal: number;
  quizzesPassed: number;
  averageQuizScore: number;
  hasProject: boolean;
  projectSubmitted: boolean;
  existingCertificate?: VerifiableGreatLearningCertificate | null;
  unmetRequirements: string[];
}

export interface VerifiableGreatLearningCertificate {
  id: string;
  certificateNumber: string;
  userId: string;
  studentName: string;
  userEmail: string;
  courseId: string;
  courseTitle: string;
  courseCategory: string;
  grade: string;
  score: number;
  issueDate: string;
  verificationUrl: string;
  skillsAcquired: string[];
  instructorName: string;
  instructorTitle: string;
  coSignerName: string;
  coSignerTitle: string;
  credentialType: 'foundation_robotics' | 'programming' | 'educator' | 'competition';
  // Distinct Certificate Type & 4 Robotics Tiers
  certificateType?: 'robotics' | 'programming' | 'educator';
  roboticsLevel?: 1 | 2 | 3 | 4;
  directorName?: string;
  directorTitle?: string;
  // Full live customization fields
  organizationName?: string;
  directorateSubtitle?: string;
  citationText?: string;
  sealLabel?: string;
  instructorSignatureUrl?: string;
  coSignerSignatureUrl?: string;
}

export const DEFAULT_INITIAL_CERTIFICATES: VerifiableGreatLearningCertificate[] = [
  {
    id: 'cert_rbwhmngf',
    certificateNumber: 'RBWHMNGF',
    userId: 'user_simbarashe_2026',
    studentName: 'Simbarashe Obvious Manongwa',
    userEmail: 'manongwasimbarashe394@gmail.com',
    courseId: 'intro-to-rag',
    courseTitle: 'Introduction to RAG',
    courseCategory: 'ai-engineering',
    grade: 'Distinction with Honors',
    score: 96,
    issueDate: 'October 04, 2026',
    verificationUrl: typeof window !== 'undefined' ? `${window.location.origin}/verify-certificate?id=RBWHMNGF` : 'https://yara.org/verify-certificate?id=RBWHMNGF',
    skillsAcquired: ['Retrieval Augmented Generation', 'Vector Embeddings', 'LLM Prompt Engineering', 'Context Chunks', 'Semantic Search'],
    instructorName: 'Mr. S.O. Manongwa',
    instructorTitle: 'Founder & Lead Robotics Instructor',
    coSignerName: 'Ms. A.M. Chiambiro',
    coSignerTitle: 'Regional President & Evaluation Chair',
    credentialType: 'programming',
    certificateType: 'programming',
    directorName: 'Harish Subramanian',
    directorTitle: 'Academic Director, YARA Learning Academy',
    organizationName: 'YARA Learning Academy',
    citationText: 'For successfully completing an online course'
  }
];

const CERT_TABLE = 'yara_accredited_certificates';

function toCertRow(cert: VerifiableGreatLearningCertificate) {
  return {
    certificate_number: cert.certificateNumber,
    user_id: cert.userId || null,
    user_email: cert.userEmail || null,
    student_name: cert.studentName,
    course_id: cert.courseId || null,
    course_title: cert.courseTitle,
    course_category: cert.courseCategory || null,
    certificate_type: cert.certificateType || 'programming',
    robotics_level: cert.certificateType === 'robotics' ? (cert.roboticsLevel || 1) : null,
    grade: cert.grade,
    score: cert.score,
    issue_date: cert.issueDate,
    verification_url: cert.verificationUrl,
    payload: cert,
    updated_at: new Date().toISOString()
  };
}

function fromCertRow(row: any): VerifiableGreatLearningCertificate {
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://yara.org';
  const p = (row.payload && typeof row.payload === 'object') ? row.payload : {};
  return {
    id: p.id || `cert_${row.certificate_number}`,
    certificateNumber: row.certificate_number,
    userId: p.userId || row.user_id || '',
    studentName: p.studentName || row.student_name,
    userEmail: p.userEmail || row.user_email || '',
    courseId: p.courseId || row.course_id || '',
    courseTitle: p.courseTitle || row.course_title,
    courseCategory: p.courseCategory || row.course_category || '',
    grade: p.grade || row.grade || 'Distinction',
    score: p.score ?? row.score ?? 90,
    issueDate: p.issueDate || row.issue_date || '',
    verificationUrl: `${origin}/verify-certificate?id=${row.certificate_number}`,
    skillsAcquired: Array.isArray(p.skillsAcquired) ? p.skillsAcquired : [],
    instructorName: p.instructorName || 'Mr. S.O. Manongwa',
    instructorTitle: p.instructorTitle || 'Founder & Lead Robotics Instructor',
    coSignerName: p.coSignerName || 'Ms. A.M. Chiambiro',
    coSignerTitle: p.coSignerTitle || 'Regional President & Evaluation Chair',
    credentialType: p.credentialType || (row.certificate_type === 'robotics' ? 'foundation_robotics' : row.certificate_type),
    certificateType: row.certificate_type || p.certificateType || 'programming',
    roboticsLevel: row.robotics_level || p.roboticsLevel || 1,
    directorName: p.directorName || 'Harish Subramanian',
    directorTitle: p.directorTitle || 'Academic Director, YARA Learning Academy',
    organizationName: p.organizationName || 'YARA Learning Academy',
    directorateSubtitle: p.directorateSubtitle,
    citationText: p.citationText || 'For successfully completing an online course',
    sealLabel: p.sealLabel,
    instructorSignatureUrl: p.instructorSignatureUrl,
    coSignerSignatureUrl: p.coSignerSignatureUrl
  };
}

async function persistCertificate(cert: VerifiableGreatLearningCertificate): Promise<void> {
  try {
    const { error } = await supabase.from(CERT_TABLE).upsert(toCertRow(cert), { onConflict: 'certificate_number' });
    if (error) console.warn('Certificate sync notice:', error.message);
  } catch (err) {
    console.warn('Certificate sync failed:', err);
  }
}

/**
 * Fetch accredited certificates for a learner from Supabase and merge into the local cache
 */
export async function syncUserCertificatesFromCloud(userId?: string, userEmail?: string): Promise<VerifiableGreatLearningCertificate[]> {
  const local = getAllUnifiedCertificates();
  if (!userId && !userEmail) return local;
  try {
    const filters: string[] = [];
    if (userId) filters.push(`user_id.eq.${userId}`);
    if (userEmail) filters.push(`user_email.ilike.${userEmail}`);
    const { data, error } = await supabase.from(CERT_TABLE).select('*').or(filters.join(','));
    if (error || !data) return local;
    const map = new Map(local.map(c => [c.certificateNumber.toUpperCase(), c]));
    data.forEach(row => map.set(String(row.certificate_number).toUpperCase(), fromCertRow(row)));
    const merged = Array.from(map.values());
    saveUnifiedCertificates(merged);
    return merged;
  } catch {
    return local;
  }
}

/**
 * Helper to get all unified certificates from local storage
 */
export function getAllUnifiedCertificates(): VerifiableGreatLearningCertificate[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_UNIFIED_CERTS);
    if (!raw) {
      saveUnifiedCertificates(DEFAULT_INITIAL_CERTIFICATES);
      return DEFAULT_INITIAL_CERTIFICATES;
    }
    const list = JSON.parse(raw) as VerifiableGreatLearningCertificate[];
    // Ensure RBWHMNGF is included if missing
    if (!list.some(c => c.certificateNumber === 'RBWHMNGF')) {
      list.unshift(DEFAULT_INITIAL_CERTIFICATES[0]);
      saveUnifiedCertificates(list);
    }
    return list;
  } catch {
    return DEFAULT_INITIAL_CERTIFICATES;
  }
}

/**
 * Save unified certificates list
 */
export function saveUnifiedCertificates(certs: VerifiableGreatLearningCertificate[]) {
  try {
    localStorage.setItem(STORAGE_KEY_UNIFIED_CERTS, JSON.stringify(certs));
  } catch (e) {
    console.error('Error saving certificates:', e);
  }
}

/**
 * Evaluate certification eligibility for ANY course (Robotics Foundation or Programming Course)
 */
export async function evaluateGreatLearningCourseEligibility(
  userId: string,
  userEmail: string,
  courseId: string
): Promise<GreatLearningCourseEligibility> {
  // Check if course is the 42-Session Robotics Foundation Programme
  if (courseId === 'robotics-foundation' || courseId === 'yara-foundation-programme') {
    const allCompletions = getAllUserCompletions(userId);
    const totalSessions = COMPLETE_YARA_SESSIONS.length;
    let completedCount = 0;
    let quizzesPassed = 0;
    let totalQuizzes = 0;
    let quizScoreSum = 0;

    COMPLETE_YARA_SESSIONS.forEach(s => {
      const c = allCompletions[s.id];
      if (c?.isFullyCompleted) completedCount++;
      if (s.quizQuestions && s.quizQuestions.length > 0) {
        totalQuizzes++;
        if (c?.quizPassed) quizzesPassed++;
        if (c?.quizScore) quizScoreSum += c.quizScore;
      }
    });

    const capstone = getUserCapstoneSubmission(userId);
    const projectSubmitted = !!capstone;
    const projectApproved = capstone?.status === 'approved';

    const unmet: string[] = [];
    if (completedCount < totalSessions) {
      unmet.push(`Complete all ${totalSessions} syllabus sessions (${completedCount}/${totalSessions} done)`);
    }
    if (quizzesPassed < totalQuizzes) {
      unmet.push(`Pass all knowledge quizzes with ≥70% score (${quizzesPassed}/${totalQuizzes} passed)`);
    }
    if (!projectSubmitted) {
      unmet.push('Submit compulsory Capstone Innovation Project');
    }

    const pct = Math.min(100, Math.round((completedCount / totalSessions) * 100));
    const isEligible = completedCount >= totalSessions && quizzesPassed >= totalQuizzes && projectSubmitted;

    // Check if certificate was already claimed
    const existing = getAllUnifiedCertificates().find(
      c => c.userId === userId && (c.courseId === 'robotics-foundation' || c.courseId === 'yara-foundation-programme')
    );

    return {
      courseId: 'robotics-foundation',
      courseTitle: 'YARA Robotics & Innovation Foundation Programme',
      isEligible,
      isClaimed: !!existing,
      completionPercentage: pct,
      totalModules: totalSessions,
      completedModules: completedCount,
      quizzesTotal: totalQuizzes,
      quizzesPassed,
      averageQuizScore: totalQuizzes > 0 ? Math.round(quizScoreSum / Math.max(1, quizzesPassed)) : 85,
      hasProject: true,
      projectSubmitted,
      existingCertificate: existing || null,
      unmetRequirements: unmet
    };
  }

  // Otherwise, evaluate specific programming or modular course
  const course = getCourseById(courseId);
  const courseTitle = course?.title || 'Course';
  const enrollment = getEnrollment(userId, courseId);
  const modules = Array.isArray(course?.modules) ? course.modules : [];
  const totalMods = Math.max(1, modules.length);
  const completedModIds = enrollment?.completedModuleIds || [];
  const completedCount = completedModIds.length;
  const pct = Math.min(100, Math.round((completedCount / totalMods) * 100));

  const quizMods = modules.filter(m => m.type === 'quiz' || (m.quizQuestions && m.quizQuestions.length > 0));
  const quizzesTotal = quizMods.length;
  let quizzesPassed = 0;
  let quizScoresTotal = 0;

  quizMods.forEach(m => {
    const score = enrollment?.quizScores?.[m.id];
    if (score !== undefined && score >= 70) {
      quizzesPassed++;
      quizScoresTotal += score;
    }
  });

  const projectMods = modules.filter(m => m.type === 'project');
  const hasProject = projectMods.length > 0;
  const projectSubmitted = hasProject
    ? projectMods.every(m => completedModIds.includes(m.id))
    : true;

  const unmet: string[] = [];
  if (completedCount < totalMods) {
    unmet.push(`Complete all ${totalMods} modules (${completedCount}/${totalMods} finished)`);
  }
  if (quizzesTotal > 0 && quizzesPassed < quizzesTotal) {
    unmet.push(`Pass all module assessments with ≥70% score (${quizzesPassed}/${quizzesTotal} cleared)`);
  }
  if (hasProject && !projectSubmitted) {
    unmet.push('Submit hands-on coding project');
  }

  const isEligible = completedCount >= totalMods && (quizzesTotal === 0 || quizzesPassed >= quizzesTotal);

  // Check if claimed
  const existing = getAllUnifiedCertificates().find(
    c => c.userId === userId && c.courseId === courseId
  );

  return {
    courseId,
    courseTitle,
    isEligible,
    isClaimed: !!existing,
    completionPercentage: pct,
    totalModules: totalMods,
    completedModules: completedCount,
    quizzesTotal,
    quizzesPassed,
    averageQuizScore: quizzesPassed > 0 ? Math.round(quizScoresTotal / quizzesPassed) : 88,
    hasProject,
    projectSubmitted,
    existingCertificate: existing || null,
    unmetRequirements: unmet
  };
}

/**
 * Claim and Mint a Great Learning Accredited Certificate
 */
export async function claimGreatLearningCertificate(params: {
  userId: string;
  userEmail: string;
  confirmedStudentName: string;
  courseId: string;
  courseTitle?: string;
  courseCategory?: string;
}): Promise<VerifiableGreatLearningCertificate> {
  const { userId, userEmail, confirmedStudentName, courseId } = params;

  // Check if already generated
  const all = getAllUnifiedCertificates();
  const existingIdx = all.findIndex(c => c.userId === userId && c.courseId === courseId);
  
  const issueDateFormatted = new Date().toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  // Generate Great Learning Academy standard certificate number: GLA-YARA-2026-XXXXXX
  const randomSuffix = Math.floor(100000 + Math.random() * 900000);
  const certNumber = existingIdx >= 0 
    ? all[existingIdx].certificateNumber 
    : `GLA-YARA-2026-${randomSuffix}`;

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://yara.org';
  const verificationUrl = `${origin}/verify-certificate?id=${certNumber}`;

  // Determine course details & skills
  let title = params.courseTitle || 'Robotics & STEM Engineering';
  let category = params.courseCategory || 'robotics';
  let skills = ['Engineering Design', 'Robotics Systems', 'Problem Solving', 'STEM Innovation'];

  if (courseId === 'robotics-foundation' || courseId === 'yara-foundation-programme') {
    title = 'YARA Robotics & Innovation Foundation Programme (Levels 0 — 8)';
    category = 'robotics';
    skills = [
      'Autonomous Robotics Architecture',
      'Embedded C++ & ESP32 / Arduino',
      'Circuit Analysis & Sensor Fusion',
      'PID Control & Motor Drivers',
      'Computer Vision & Telemetry',
      'Capstone Innovation & Prototyping'
    ];
  } else {
    const course = getCourseById(courseId);
    if (course) {
      title = course.title;
      category = course.category;
      skills = Array.isArray(course.tags)
        ? course.tags
        : typeof course.tags === 'string'
        ? (course.tags as string).split(',').map(t => t.trim())
        : [
            course.category.toUpperCase(),
            'Software Architecture',
            'Algorithm Design',
            'Practical Implementation'
          ];
    }
  }

  // Determine certificate type & robotics level
  let certType: 'robotics' | 'programming' | 'educator' = 'programming';
  let robLevel: 1 | 2 | 3 | 4 = 1;

  if (courseId.includes('educator') || category.includes('educator')) {
    certType = 'educator';
  } else if (courseId.includes('robotics') || category.includes('robotics')) {
    certType = 'robotics';
    if (courseId.includes('lvl-4') || courseId.includes('masterclass')) robLevel = 4;
    else if (courseId.includes('lvl-3') || courseId.includes('advanced')) robLevel = 3;
    else if (courseId.includes('lvl-2') || courseId.includes('intermediate')) robLevel = 2;
    else robLevel = 1;
  } else {
    certType = 'programming';
  }

  const certificate: VerifiableGreatLearningCertificate = {
    id: `cert_gla_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    certificateNumber: certNumber,
    userId,
    studentName: confirmedStudentName.trim() || userEmail.split('@')[0],
    userEmail,
    courseId,
    courseTitle: title,
    courseCategory: category,
    grade: 'Distinction with Honors',
    score: 92,
    issueDate: issueDateFormatted,
    verificationUrl,
    skillsAcquired: skills,
    instructorName: 'Mr. S.O. Manongwa',
    instructorTitle: 'Founder & Lead Robotics Instructor',
    coSignerName: 'Ms. A.M. Chiambiro',
    coSignerTitle: 'Regional President & Evaluation Chair',
    credentialType: certType === 'robotics' ? 'foundation_robotics' : certType === 'educator' ? 'educator' : 'programming',
    certificateType: certType,
    roboticsLevel: robLevel,
    directorName: 'Harish Subramanian',
    directorTitle: 'Academic Director, YARA Learning Academy',
    organizationName: 'YARA Learning Academy'
  };

  if (existingIdx >= 0) {
    all[existingIdx] = certificate;
  } else {
    all.unshift(certificate);
  }

  saveUnifiedCertificates(all);

  // Persist to Supabase so the certificate verifies from any device
  await persistCertificate(certificate);

  return certificate;
}

/**
 * Universal Certificate Lookup by ID or verification code
 */
export async function lookupAnyVerifiableCertificate(
  code: string
): Promise<VerifiableGreatLearningCertificate | null> {
  const cleanCode = code.trim().toUpperCase();
  if (!cleanCode) return null;

  // 1. Check the cloud registry first (works on the live site from any device)
  try {
    const { data, error } = await supabase
      .from(CERT_TABLE)
      .select('*')
      .ilike('certificate_number', cleanCode)
      .maybeSingle();
    if (!error && data) {
      return fromCertRow(data);
    }
  } catch {
    // fall through to local cache
  }

  // 2. Check local cache of unified certificates
  const unified = getAllUnifiedCertificates();
  const foundUnified = unified.find(
    c => c.certificateNumber.toUpperCase() === cleanCode || c.certificateNumber.toUpperCase().includes(cleanCode)
  );
  if (foundUnified) {
    return {
      ...foundUnified,
      certificateType: foundUnified.certificateType || (foundUnified.courseCategory?.includes('educator') ? 'educator' : foundUnified.courseCategory?.includes('robotics') || foundUnified.courseId?.includes('robotics') ? 'robotics' : 'programming'),
      roboticsLevel: foundUnified.roboticsLevel || 1,
      directorName: foundUnified.directorName || 'Harish Subramanian',
      directorTitle: foundUnified.directorTitle || 'Academic Director, YARA Learning Academy',
      organizationName: foundUnified.organizationName || 'YARA Learning Academy'
    };
  }

  // 2. Check Programming Certificates in programmingCoursesService
  const progCert = getProgrammingCertificateByNumber(cleanCode);
  if (progCert) {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://yara.org';
    return {
      id: progCert.id,
      certificateNumber: progCert.certificateNumber,
      userId: progCert.userId,
      studentName: progCert.studentName,
      userEmail: '',
      courseId: progCert.courseId,
      courseTitle: progCert.courseTitle,
      courseCategory: progCert.courseCategory,
      grade: progCert.grade,
      score: progCert.score,
      issueDate: progCert.issueDate,
      verificationUrl: `${origin}/verify-certificate?id=${progCert.certificateNumber}`,
      skillsAcquired: [progCert.courseCategory.toUpperCase(), 'Software Development', 'Algorithms', 'Certification'],
      instructorName: 'Mr. S.O. Manongwa',
      instructorTitle: 'Founder & Lead Instructor',
      coSignerName: 'Ms. A.M. Chiambiro',
      coSignerTitle: 'Regional President',
      credentialType: 'programming',
      certificateType: 'programming',
      directorName: 'Harish Subramanian',
      directorTitle: 'Academic Director, YARA Learning Academy',
      organizationName: 'YARA Learning Academy'
    };
  }

  // 3. Check Educator Certificate
  const eduCert = await getEducatorCertificateByCodeOrEmail(cleanCode);
  if (eduCert && eduCert.status !== 'locked') {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://yara.org';
    return {
      id: eduCert.certificate_number,
      certificateNumber: eduCert.certificate_number,
      userId: eduCert.recipient_email || eduCert.certificate_number,
      studentName: eduCert.recipient_name,
      userEmail: eduCert.recipient_email || '',
      courseId: 'ai-educators-bootcamp',
      courseTitle: eduCert.event_title || 'AI for Educators Professional Development Bootcamp',
      courseCategory: 'ai-education',
      grade: 'Certified Educator',
      score: 95,
      issueDate: eduCert.issue_date,
      verificationUrl: `${origin}/verify-certificate?id=${eduCert.certificate_number}`,
      skillsAcquired: ['Pedagogical AI', 'Curriculum Automation', 'STEM Instruction', 'Ethics in AI'],
      instructorName: 'Mr. S.O. Manongwa',
      instructorTitle: 'Executive Director & Lead Facilitator',
      coSignerName: 'Ms. A.M. Chiambiro',
      coSignerTitle: 'President & Academic Dean',
      credentialType: 'educator',
      certificateType: 'educator',
      directorName: 'Harish Subramanian',
      directorTitle: 'Academic Director, YARA Learning Academy',
      organizationName: 'YARA Learning Academy'
    };
  }

  return null;
}

/**
 * 1-Click "Add to LinkedIn" URL generator
 * Format follows the official LinkedIn certification URL specification.
 */
export function getLinkedInAddCertificationUrl(cert: VerifiableGreatLearningCertificate): string {
  const issueDateObj = new Date(cert.issueDate);
  const issueYear = isNaN(issueDateObj.getFullYear()) ? 2026 : issueDateObj.getFullYear();
  const issueMonth = isNaN(issueDateObj.getMonth()) ? 1 : issueDateObj.getMonth() + 1;

  const params = new URLSearchParams({
    startTask: 'CERTIFICATION_NAME',
    name: cert.courseTitle,
    organizationName: 'Young Africans Robotics Association',
    issueYear: issueYear.toString(),
    issueMonth: issueMonth.toString(),
    certUrl: cert.verificationUrl,
    certId: cert.certificateNumber
  });

  return `https://www.linkedin.com/profile/add?${params.toString()}`;
}

/**
 * Generate Social Share Links (LinkedIn Post, Twitter/X, WhatsApp)
 */
export function getSocialShareLinks(cert: VerifiableGreatLearningCertificate) {
  const text = `I am proud to share that I have earned my official certification in "${cert.courseTitle}" from YARA Learning Academy! Verified credential: ${cert.verificationUrl}`;
  const encodedText = encodeURIComponent(text);
  const encodedUrl = encodeURIComponent(cert.verificationUrl);

  return {
    linkedInFeed: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodedText}`,
    whatsApp: `https://api.whatsapp.com/send?text=${encodedText}`
  };
}

/**
 * Live Update / Customize any field on an existing certificate
 */
export async function updateGreatLearningCertificate(
  updatedCert: VerifiableGreatLearningCertificate
): Promise<VerifiableGreatLearningCertificate> {
  const all = getAllUnifiedCertificates();
  const idx = all.findIndex(
    c => c.id === updatedCert.id || c.certificateNumber === updatedCert.certificateNumber
  );

  // Recompute verification URL if cert number changed
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://yara.org';
  const finalCert: VerifiableGreatLearningCertificate = {
    ...updatedCert,
    verificationUrl: `${origin}/verify-certificate?id=${updatedCert.certificateNumber}`
  };

  if (idx >= 0) {
    all[idx] = finalCert;
  } else {
    all.unshift(finalCert);
  }

  saveUnifiedCertificates(all);

  // Persist edits to Supabase
  await persistCertificate(finalCert);

  return finalCert;
}

