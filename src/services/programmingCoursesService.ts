import {
  ProgrammingCourse,
  CourseEnrollment,
  ProgrammingCertificate,
  CourseModule,
  STARTER_PROGRAMMING_COURSES,
  CourseDifficulty,
} from '../types/lmsCourseTypes';

// ============================================================================
// Storage Keys
// ============================================================================
const STORAGE_KEYS = {
  COURSES: 'yara_prog_courses',
  ENROLLMENTS: 'yara_prog_enrollments',
  MODULE_COMPLETIONS: 'yara_prog_module_completions',
  CERTIFICATES: 'yara_prog_certificates',
};

// ============================================================================
// Course CRUD (Admin)
// ============================================================================

export function getAllCourses(): ProgrammingCourse[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.COURSES);
    if (stored) {
      const parsed = JSON.parse(stored) as ProgrammingCourse[];
      if (parsed.length > 0) return parsed;
    }
    // Initialize with starter courses
    localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(STARTER_PROGRAMMING_COURSES));
    return STARTER_PROGRAMMING_COURSES;
  } catch {
    return STARTER_PROGRAMMING_COURSES;
  }
}

export function getPublishedCourses(): ProgrammingCourse[] {
  return getAllCourses().filter((c) => c.isPublished);
}

export function getCourseById(courseId: string): ProgrammingCourse | undefined {
  return getAllCourses().find((c) => c.id === courseId);
}

export function saveCourse(course: ProgrammingCourse): ProgrammingCourse {
  const courses = getAllCourses();
  const existingIdx = courses.findIndex((c) => c.id === course.id);
  const now = new Date().toISOString();
  const updated = { ...course, updatedAt: now };

  if (existingIdx >= 0) {
    courses[existingIdx] = updated;
  } else {
    updated.createdAt = now;
    courses.push(updated);
  }

  localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(courses));
  return updated;
}

export function deleteCourse(courseId: string): void {
  const courses = getAllCourses().filter((c) => c.id !== courseId);
  localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(courses));
}

export function generateCourseId(): string {
  return `yara-prog-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
}

export function generateModuleId(): string {
  return `mod-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
}

export function toggleCoursePublish(courseId: string): ProgrammingCourse | null {
  const course = getCourseById(courseId);
  if (!course) return null;
  return saveCourse({ ...course, isPublished: !course.isPublished });
}

// ============================================================================
// Enrollment
// ============================================================================

function getAllEnrollments(): CourseEnrollment[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.ENROLLMENTS) || '[]');
  } catch {
    return [];
  }
}

function saveEnrollments(enrollments: CourseEnrollment[]): void {
  localStorage.setItem(STORAGE_KEYS.ENROLLMENTS, JSON.stringify(enrollments));
}

export function getUserEnrollments(userId: string): CourseEnrollment[] {
  return getAllEnrollments().filter((e) => e.userId === userId);
}

export function getEnrollment(userId: string, courseId: string): CourseEnrollment | undefined {
  return getAllEnrollments().find((e) => e.userId === userId && e.courseId === courseId);
}

export function enrollUserInCourse(userId: string, courseId: string): CourseEnrollment {
  const existing = getEnrollment(userId, courseId);
  if (existing) return existing;

  const enrollment: CourseEnrollment = {
    id: `enr-${Date.now()}`,
    userId,
    courseId,
    enrolledAt: new Date().toISOString(),
    isCompleted: false,
    progressPercent: 0,
    completedModuleIds: [],
    quizScores: {},
    lastAccessedAt: new Date().toISOString(),
  };

  const all = getAllEnrollments();
  all.push(enrollment);
  saveEnrollments(all);

  // Increment enrolled count on course
  const course = getCourseById(courseId);
  if (course) {
    saveCourse({ ...course, enrolledCount: (course.enrolledCount || 0) + 1 });
  }

  return enrollment;
}

export function unenrollUser(userId: string, courseId: string): void {
  const all = getAllEnrollments().filter((e) => !(e.userId === userId && e.courseId === courseId));
  saveEnrollments(all);
}

// ============================================================================
// Module Completion & Progress
// ============================================================================

export function completeModule(
  userId: string,
  courseId: string,
  moduleId: string,
  quizScore?: number
): { enrollment: CourseEnrollment; certificateEarned: boolean } {
  const all = getAllEnrollments();
  const idx = all.findIndex((e) => e.userId === userId && e.courseId === courseId);

  if (idx < 0) {
    const newEnrollment = enrollUserInCourse(userId, courseId);
    return completeModule(userId, courseId, moduleId, quizScore);
  }

  const enrollment = { ...all[idx] };

  // Add module to completed list if not already there
  if (!enrollment.completedModuleIds.includes(moduleId)) {
    enrollment.completedModuleIds.push(moduleId);
  }

  // Record quiz score
  if (quizScore !== undefined) {
    enrollment.quizScores[moduleId] = quizScore;
  }

  enrollment.lastAccessedAt = new Date().toISOString();

  // Calculate progress
  const course = getCourseById(courseId);
  const totalModules = course?.modules.length || 1;
  enrollment.progressPercent = Math.round((enrollment.completedModuleIds.length / totalModules) * 100);

  // Check if course is now complete
  const isNowComplete =
    enrollment.progressPercent >= 100 &&
    (course?.modules.every((m) => enrollment.completedModuleIds.includes(m.id)) ?? false);

  let certificateEarned = false;

  if (isNowComplete && !enrollment.isCompleted) {
    enrollment.isCompleted = true;
    enrollment.completedAt = new Date().toISOString();

    // Issue certificate if enabled
    if (course?.certificationEnabled) {
      issueProgrammingCertificate(userId, '', userId, course);
      certificateEarned = true;
    }
  }

  all[idx] = enrollment;
  saveEnrollments(all);

  return { enrollment, certificateEarned };
}

// ============================================================================
// Certificates
// ============================================================================

export function getAllUserProgrammingCertificates(userId: string): ProgrammingCertificate[] {
  try {
    const all: ProgrammingCertificate[] = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.CERTIFICATES) || '[]'
    );
    return all.filter((c) => c.userId === userId);
  } catch {
    return [];
  }
}

export function getProgrammingCertificate(
  userId: string,
  courseId: string
): ProgrammingCertificate | undefined {
  try {
    const all: ProgrammingCertificate[] = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.CERTIFICATES) || '[]'
    );
    return all.find((c) => c.userId === userId && c.courseId === courseId);
  } catch {
    return undefined;
  }
}

export function getProgrammingCertificateByNumber(
  certNumber: string
): ProgrammingCertificate | undefined {
  try {
    const all: ProgrammingCertificate[] = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.CERTIFICATES) || '[]'
    );
    return all.find((c) => c.certificateNumber === certNumber);
  } catch {
    return undefined;
  }
}

export function issueProgrammingCertificate(
  userId: string,
  userEmail: string,
  studentName: string,
  course: ProgrammingCourse
): ProgrammingCertificate {
  // Check if already issued
  const existing = getProgrammingCertificate(userId, course.id);
  if (existing) return existing;

  // Calculate score from quiz scores in enrollment
  const enrollment = getEnrollment(userId, course.id);
  const scores = Object.values(enrollment?.quizScores || {});
  const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 85;

  const grade = avgScore >= 90 ? 'Distinction' : avgScore >= 75 ? 'Merit' : 'Pass';
  const certNumber = generateCertificateNumber(course.category);
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://yara.org';

  const cert: ProgrammingCertificate = {
    id: `pc-${Date.now()}`,
    userId,
    userEmail,
    studentName,
    courseId: course.id,
    courseTitle: course.certificationTitle || course.title,
    courseCategory: course.category,
    certificateNumber: certNumber,
    issueDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    grade,
    score: avgScore,
    verifyUrl: `${origin}/verify-certificate?id=${certNumber}`,
    isVerified: true,
  };

  const all: ProgrammingCertificate[] = JSON.parse(
    localStorage.getItem(STORAGE_KEYS.CERTIFICATES) || '[]'
  );
  all.push(cert);
  localStorage.setItem(STORAGE_KEYS.CERTIFICATES, JSON.stringify(all));

  return cert;
}

function generateCertificateNumber(category: string): string {
  const catCode = category.toUpperCase().slice(0, 4);
  const year = new Date().getFullYear();
  const num = Math.floor(10000 + Math.random() * 90000);
  return `YARA-${catCode}-${year}-${num}`;
}

// ============================================================================
// Stats helpers
// ============================================================================

export function getUserCourseStats(userId: string): {
  enrolled: number;
  completed: number;
  certificatesEarned: number;
  inProgress: number;
} {
  const enrollments = getUserEnrollments(userId);
  const certs = getAllUserProgrammingCertificates(userId);
  return {
    enrolled: enrollments.length,
    completed: enrollments.filter((e) => e.isCompleted).length,
    certificatesEarned: certs.length,
    inProgress: enrollments.filter((e) => !e.isCompleted && e.progressPercent > 0).length,
  };
}
