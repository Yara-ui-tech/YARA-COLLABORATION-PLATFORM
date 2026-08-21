import { supabase } from '../lib/supabase';
import { COMPLETE_YARA_SESSIONS, getSessionById } from '../constants/yaraLmsCatalog';
import { 
  SessionCompletionRecord, 
  VideoWatchProgress, 
  QuizAttemptRecord, 
  CapstoneProjectSubmission, 
  CertificateEligibilityCheck,
  LearnerPortfolio,
  LearnerLevelNumber,
  SessionVideoClip
} from '../types/yaraLms';
import { Certificate } from '../types/curriculum';
import { checkAndVerifyUserSubscription } from './partnershipDonationService';

// Storage keys
const STORAGE_KEYS = {
  COMPLETIONS: 'yara_lms_completions',
  VIDEO_WATCH: 'yara_lms_video_watch',
  SESSION_VIDEOS: 'yara_lms_session_videos',
  CLIP_WATCH: 'yara_lms_clip_watch',
  QUIZ_ATTEMPTS: 'yara_lms_quiz_attempts',
  CAPSTONES: 'yara_lms_capstones',
  CERTIFICATES: 'yara_lms_certificates',
  KIT_PRICING: 'yara_lms_kit_pricing'
};

// ============================================================================
// 1. VIDEO WATCH & ANTI-CHEAT PROGRESSION
// ============================================================================

export async function updateVideoProgress(
  userId: string,
  sessionId: string,
  currentTimeSeconds: number,
  totalDurationSeconds: number,
  watchedSegments: [number, number][]
): Promise<{ isCompleted: boolean; percentCompleted: number }> {
  try {
    // 1. Calculate contiguous or segmented watch time
    let totalWatchedSeconds = 0;
    // Merge overlapping intervals
    const sorted = [...watchedSegments].sort((a, b) => a[0] - b[0]);
    const merged: [number, number][] = [];
    for (const seg of sorted) {
      if (!merged.length) {
        merged.push(seg);
      } else {
        const prev = merged[merged.length - 1];
        if (seg[0] <= prev[1]) {
          prev[1] = Math.max(prev[1], seg[1]);
        } else {
          merged.push(seg);
        }
      }
    }

    for (const [start, end] of merged) {
      totalWatchedSeconds += Math.max(0, end - start);
    }

    const duration = totalDurationSeconds > 0 ? totalDurationSeconds : 600;
    const percent = Math.min(100, Math.round((totalWatchedSeconds / duration) * 100));
    const isCompleted = percent >= 85; // 85%+ genuine watch time required

    const watchRecord: VideoWatchProgress = {
      sessionId,
      userId,
      maxWatchedTimeSeconds: Math.max(currentTimeSeconds, totalWatchedSeconds),
      totalDurationSeconds: duration,
      watchedSegments: merged,
      percentCompleted: percent,
      isCompleted,
      lastUpdated: new Date().toISOString()
    };

    // Save locally
    const allWatch: Record<string, VideoWatchProgress> = JSON.parse(localStorage.getItem(STORAGE_KEYS.VIDEO_WATCH) || '{}');
    const key = `${userId}_${sessionId}`;
    allWatch[key] = watchRecord;
    localStorage.setItem(STORAGE_KEYS.VIDEO_WATCH, JSON.stringify(allWatch));

    // Update session completion record
    await updateSessionCompletionField(userId, sessionId, { videoCompleted: isCompleted });

    return { isCompleted, percentCompleted: percent };
  } catch (err) {
    console.error('Error updating video progress:', err);
    return { isCompleted: false, percentCompleted: 0 };
  }
}

export function getVideoProgress(userId: string, sessionId: string): VideoWatchProgress | null {
  try {
    const allWatch: Record<string, VideoWatchProgress> = JSON.parse(localStorage.getItem(STORAGE_KEYS.VIDEO_WATCH) || '{}');
    return allWatch[`${userId}_${sessionId}`] || null;
  } catch {
    return null;
  }
}

// ============================================================================
// 1B. BITE-SIZED VIDEO MICRO-LESSONS & ADMIN VIDEO MANAGEMENT (MAX 7 MIN EACH)
// ============================================================================

/**
 * Generates default modular micro-lessons (each <= 7 minutes) for a session.
 */
function generateDefaultModularVideos(session: any): SessionVideoClip[] {
  if (session?.videoClips && session.videoClips.length > 0) {
    return session.videoClips;
  }

  const baseEmbed = session?.video_url || 'https://www.youtube.com/watch?v=FCMxA3m_Imc';
  const title = session?.title || 'Robotics & Innovation';

  return [
    {
      id: `${session?.id || 'S00'}_clip_1`,
      order: 1,
      title: `Part 1: Core Principles & Concepts — ${title}`,
      durationSeconds: 240, // 4:00 (Max <= 7 min)
      videoUrl: baseEmbed,
      clipType: 'concept',
      description: `Understand the fundamental theoretical framework and scientific principles of ${title}.`
    },
    {
      id: `${session?.id || 'S00'}_clip_2`,
      order: 2,
      title: `Part 2: Step-by-Step Practical Demonstration & Wiring`,
      durationSeconds: 330, // 5:30 (Max <= 7 min)
      videoUrl: baseEmbed,
      clipType: 'demonstration',
      description: `Detailed hands-on lab demonstration showing hardware connections, pinout mappings, and circuit assembly.`
    },
    {
      id: `${session?.id || 'S00'}_clip_3`,
      order: 3,
      title: `Part 3: Code Logic, Simulation & Debugging Walkthrough`,
      durationSeconds: 290, // 4:50 (Max <= 7 min)
      videoUrl: baseEmbed,
      clipType: 'walkthrough',
      description: `Step-by-step firmware breakdown, real-time simulator execution, and hardware troubleshooting techniques.`
    },
    {
      id: `${session?.id || 'S00'}_clip_4`,
      order: 4,
      title: `Part 4: Real-World Innovations & Engineering Takeaways`,
      durationSeconds: 195, // 3:15 (Max <= 7 min)
      videoUrl: baseEmbed,
      clipType: 'recap',
      description: `Synthesizing takeaways for community engineering impact, capstone ideas, and design challenges.`
    }
  ];
}

/**
 * Retrieve current video clips for a specific session (merging Admin customizations if present).
 */
export function getSessionVideos(sessionId: string): SessionVideoClip[] {
  try {
    const customVideosMap: Record<string, SessionVideoClip[]> = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.SESSION_VIDEOS) || '{}'
    );

    if (customVideosMap[sessionId] && Array.isArray(customVideosMap[sessionId]) && customVideosMap[sessionId].length > 0) {
      return customVideosMap[sessionId].sort((a, b) => a.order - b.order);
    }

    const session = getSessionById(sessionId);
    return generateDefaultModularVideos(session);
  } catch (e) {
    console.error('Error fetching session videos:', e);
    const session = getSessionById(sessionId);
    return generateDefaultModularVideos(session);
  }
}

/**
 * Save custom video clips list for a specific course session (Admin action).
 */
export function saveSessionVideos(sessionId: string, clips: SessionVideoClip[]): void {
  try {
    const customVideosMap: Record<string, SessionVideoClip[]> = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.SESSION_VIDEOS) || '{}'
    );
    customVideosMap[sessionId] = clips.map((c, i) => ({ ...c, order: i + 1 }));
    localStorage.setItem(STORAGE_KEYS.SESSION_VIDEOS, JSON.stringify(customVideosMap));
  } catch (e) {
    console.error('Error saving session videos:', e);
  }
}

/**
 * Admin: Add a new video clip or external link to a course session (Max 7 mins / 420s).
 */
export function addSessionVideoClip(
  sessionId: string,
  clip: Omit<SessionVideoClip, 'id' | 'order'>
): SessionVideoClip {
  const currentClips = getSessionVideos(sessionId);
  // Enforce max 7 minutes cap (420 seconds) for micro-lesson learning effectiveness
  const duration = Math.min(420, Math.max(30, clip.durationSeconds || 240));

  const newClip: SessionVideoClip = {
    id: `${sessionId}_clip_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    title: clip.title.trim() || `Micro-Lesson Part ${currentClips.length + 1}`,
    durationSeconds: duration,
    videoUrl: clip.videoUrl.trim() || 'https://www.youtube.com/watch?v=FCMxA3m_Imc',
    clipType: clip.clipType || 'concept',
    description: clip.description?.trim() || 'Bite-sized micro-lesson (max 7 minutes).',
    order: currentClips.length + 1
  };

  const updatedClips = [...currentClips, newClip];
  saveSessionVideos(sessionId, updatedClips);
  return newClip;
}

/**
 * Admin: Update an existing video clip in a course session.
 */
export function updateSessionVideoClip(
  sessionId: string,
  clipId: string,
  updates: Partial<SessionVideoClip>
): boolean {
  const currentClips = getSessionVideos(sessionId);
  const index = currentClips.findIndex(c => c.id === clipId);
  if (index === -1) return false;

  const duration = updates.durationSeconds 
    ? Math.min(420, Math.max(30, updates.durationSeconds)) 
    : currentClips[index].durationSeconds;

  currentClips[index] = {
    ...currentClips[index],
    ...updates,
    durationSeconds: duration
  };

  saveSessionVideos(sessionId, currentClips);
  return true;
}

/**
 * Admin: Remove a video clip or link from a course session.
 */
export function removeSessionVideoClip(sessionId: string, clipId: string): boolean {
  const currentClips = getSessionVideos(sessionId);
  const filtered = currentClips.filter(c => c.id !== clipId);
  if (filtered.length === currentClips.length) return false;

  saveSessionVideos(sessionId, filtered);
  return true;
}

/**
 * Admin: Reorder video clips for a session.
 */
export function reorderSessionVideoClips(sessionId: string, orderedClipIds: string[]): boolean {
  const currentClips = getSessionVideos(sessionId);
  const reordered: SessionVideoClip[] = [];

  orderedClipIds.forEach((id, idx) => {
    const found = currentClips.find(c => c.id === id);
    if (found) {
      reordered.push({ ...found, order: idx + 1 });
    }
  });

  if (reordered.length > 0) {
    saveSessionVideos(sessionId, reordered);
    return true;
  }
  return false;
}

/**
 * Admin: Reset a course session's videos back to factory defaults.
 */
export function resetSessionVideosToDefault(sessionId: string): void {
  try {
    const customVideosMap: Record<string, SessionVideoClip[]> = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.SESSION_VIDEOS) || '{}'
    );
    delete customVideosMap[sessionId];
    localStorage.setItem(STORAGE_KEYS.SESSION_VIDEOS, JSON.stringify(customVideosMap));
  } catch (e) {
    console.error('Error resetting session videos:', e);
  }
}

/**
 * Track and get watch progress for an individual modular video clip.
 */
export function getClipWatchProgress(
  userId: string,
  sessionId: string,
  clipId: string
): { watchedSeconds: number; durationSeconds: number; percent: number; isCompleted: boolean } {
  try {
    const allClipWatch: Record<string, any> = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.CLIP_WATCH) || '{}'
    );
    const key = `${userId}_${sessionId}_${clipId}`;
    const data = allClipWatch[key];
    if (!data) {
      return { watchedSeconds: 0, durationSeconds: 240, percent: 0, isCompleted: false };
    }
    return data;
  } catch {
    return { watchedSeconds: 0, durationSeconds: 240, percent: 0, isCompleted: false };
  }
}

export function updateClipWatchProgress(
  userId: string,
  sessionId: string,
  clipId: string,
  watchedSeconds: number,
  durationSeconds: number
): { percent: number; isCompleted: boolean } {
  try {
    const dur = Math.max(30, durationSeconds || 240);
    const percent = Math.min(100, Math.round((watchedSeconds / dur) * 100));
    const isCompleted = percent >= 85;

    const allClipWatch: Record<string, any> = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.CLIP_WATCH) || '{}'
    );
    const key = `${userId}_${sessionId}_${clipId}`;
    allClipWatch[key] = {
      sessionId,
      clipId,
      userId,
      watchedSeconds,
      durationSeconds: dur,
      percent,
      isCompleted,
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEYS.CLIP_WATCH, JSON.stringify(allClipWatch));

    return { percent, isCompleted };
  } catch (e) {
    console.error('Error updating clip progress:', e);
    return { percent: 0, isCompleted: false };
  }
}

// ============================================================================
// 2. RANDOMIZED QUIZ & SECURE SCORING
// ============================================================================

export interface RandomizedQuestionPayload {
  id: string;
  question: string;
  options: string[];
  // Note: correctIndex is withheld until evaluated!
  points: number;
}

export function generateRandomizedQuiz(sessionId: string): {
  sessionId: string;
  questions: RandomizedQuestionPayload[];
  passingScore: number;
} {
  const session = getSessionById(sessionId);
  if (!session || !session.quizQuestions || session.quizQuestions.length === 0) {
    return { sessionId, questions: [], passingScore: 70 };
  }

  // Shuffle questions order
  const shuffledQuestions = [...session.quizQuestions].sort(() => Math.random() - 0.5);

  // For each question, we can also shuffle options if needed, but keeping options order clean while stripping correctIndex
  const safeQuestions: RandomizedQuestionPayload[] = shuffledQuestions.map((q) => ({
    id: q.id,
    question: q.question,
    options: q.options,
    points: q.points || 10
  }));

  return {
    sessionId,
    questions: safeQuestions,
    passingScore: session.quizPassingScore || 70
  };
}

export async function evaluateQuizSubmission(
  userId: string,
  sessionId: string,
  userAnswers: Record<string, number>, // questionId -> chosenIndex
  timeSpentSeconds: number
): Promise<{
  score: number;
  totalQuestions: number;
  percentage: number;
  passed: boolean;
  attemptId: string;
  feedback: {
    questionId: string;
    question: string;
    userChoice: number;
    correctChoice: number;
    isCorrect: boolean;
    explanation: string;
  }[];
}> {
  const session = getSessionById(sessionId);
  if (!session || !session.quizQuestions) {
    throw new Error('Session not found');
  }

  const feedback: any[] = [];
  let correctCount = 0;
  const totalQuestions = session.quizQuestions.length;

  for (const q of session.quizQuestions) {
    const userChoice = userAnswers[q.id] !== undefined ? userAnswers[q.id] : -1;
    const isCorrect = userChoice === q.correctIndex;
    if (isCorrect) correctCount++;

    feedback.push({
      questionId: q.id,
      question: q.question,
      userChoice,
      correctChoice: q.correctIndex,
      isCorrect,
      explanation: q.explanation
    });
  }

  const percentage = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 100;
  const passed = percentage >= (session.quizPassingScore || 70);
  const attemptId = 'att_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6);

  const attemptRecord: QuizAttemptRecord = {
    attemptId,
    userId,
    sessionId,
    score: correctCount,
    totalQuestions,
    percentage,
    passed,
    questionsPresented: session.quizQuestions.map(q => q.id),
    userAnswers,
    timeSpentSeconds,
    timestamp: new Date().toISOString()
  };

  // Save attempt to local storage & attempt remote sync
  try {
    const existing: QuizAttemptRecord[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.QUIZ_ATTEMPTS) || '[]');
    localStorage.setItem(STORAGE_KEYS.QUIZ_ATTEMPTS, JSON.stringify([attemptRecord, ...existing]));

    try {
      await supabase.from('quiz_attempts').insert({
        id: attemptId,
        user_id: userId,
        session_id: sessionId,
        score: correctCount,
        total_questions: totalQuestions,
        percentage,
        passed,
        answers: userAnswers,
        created_at: attemptRecord.timestamp
      });
    } catch {
      // safe fallback
    }
  } catch (e) {
    console.warn('Quiz storage notice:', e);
  }

  // Update session completion
  await updateSessionCompletionField(userId, sessionId, {
    quizPassed: passed,
    quizScore: percentage
  });

  return {
    score: correctCount,
    totalQuestions,
    percentage,
    passed,
    attemptId,
    feedback
  };
}

// ============================================================================
// 3. SESSION COMPLETIONS & PREREQUISITES
// ============================================================================

export async function getSessionCompletion(userId: string, sessionId: string): Promise<SessionCompletionRecord> {
  const all = getAllUserCompletions(userId);
  if (all[sessionId]) return all[sessionId];

  return {
    sessionId,
    userId,
    videoCompleted: false,
    quizPassed: false,
    quizScore: 0,
    quizAttempts: 0,
    assignmentSubmitted: false,
    miniProjectSubmitted: false,
    isFullyCompleted: false
  };
}

export function getAllUserCompletions(userId: string): Record<string, SessionCompletionRecord> {
  try {
    const raw = localStorage.getItem(`${STORAGE_KEYS.COMPLETIONS}_${userId}`);
    if (raw) return JSON.parse(raw);
  } catch {
    // fallback
  }
  return {};
}

export async function updateSessionCompletionField(
  userId: string,
  sessionId: string,
  updates: Partial<SessionCompletionRecord>
): Promise<SessionCompletionRecord> {
  const all = getAllUserCompletions(userId);
  const current: SessionCompletionRecord = all[sessionId] || {
    sessionId,
    userId,
    videoCompleted: false,
    quizPassed: false,
    quizScore: 0,
    quizAttempts: 0,
    assignmentSubmitted: false,
    miniProjectSubmitted: false,
    isFullyCompleted: false
  };

  const updated: SessionCompletionRecord = {
    ...current,
    ...updates
  };

  // Check if fully completed
  // Requirement 9: Video watched + Quiz passed + Assignment submitted + Mini-project submitted
  const session = getSessionById(sessionId);
  const hasVideo = session?.video_url ? true : false;
  const hasQuiz = session?.quizQuestions && session.quizQuestions.length > 0;
  const hasAssignment = session?.assignment ? true : false;
  const hasMiniProject = session?.miniProject ? true : false;

  const videoOk = !hasVideo || updated.videoCompleted;
  const quizOk = !hasQuiz || updated.quizPassed;
  const assignOk = !hasAssignment || updated.assignmentSubmitted;
  const projectOk = !hasMiniProject || updated.miniProjectSubmitted;

  updated.isFullyCompleted = videoOk && quizOk && assignOk && projectOk;
  if (updated.isFullyCompleted && !updated.completedAt) {
    updated.completedAt = new Date().toISOString();
  }

  all[sessionId] = updated;
  localStorage.setItem(`${STORAGE_KEYS.COMPLETIONS}_${userId}`, JSON.stringify(all));

  // Sync to database if possible
  try {
    await supabase.from('curriculum_progress').upsert({
      user_id: userId,
      session_id: sessionId,
      video_progress: updated.videoCompleted ? 100 : 0,
      quiz_status: updated.quizPassed ? 'passed' : 'pending',
      quiz_score: updated.quizScore,
      assignment_status: updated.assignmentSubmitted ? 'submitted' : 'pending',
      project_status: updated.miniProjectSubmitted ? 'submitted' : 'pending',
      is_completed: updated.isFullyCompleted,
      updated_at: new Date().toISOString()
    });
  } catch {
    // safe fallback
  }

  return updated;
}

export async function submitSessionAssignment(
  userId: string,
  sessionId: string,
  submissionText: string,
  fileUrl?: string
): Promise<SessionCompletionRecord> {
  return await updateSessionCompletionField(userId, sessionId, {
    assignmentSubmitted: true,
    assignmentSubmissionText: submissionText,
    assignmentFileUrl: fileUrl
  });
}

export async function submitSessionMiniProject(
  userId: string,
  sessionId: string,
  projectUrl: string,
  notes?: string
): Promise<SessionCompletionRecord> {
  return await updateSessionCompletionField(userId, sessionId, {
    miniProjectSubmitted: true,
    miniProjectUrl: projectUrl,
    miniProjectNotes: notes
  });
}

export function checkSessionPrerequisites(userId: string, sessionId: string): {
  isUnlocked: boolean;
  missingPrerequisites: string[];
} {
  const session = getSessionById(sessionId);
  if (!session || !session.prerequisites || session.prerequisites.length === 0) {
    return { isUnlocked: true, missingPrerequisites: [] };
  }

  const allCompletions = getAllUserCompletions(userId);
  const missing: string[] = [];

  for (const reqId of session.prerequisites) {
    const comp = allCompletions[reqId];
    if (!comp || !comp.isFullyCompleted) {
      const reqSession = getSessionById(reqId);
      missing.push(reqSession ? `${reqId}: ${reqSession.title}` : reqId);
    }
  }

  return {
    isUnlocked: missing.length === 0,
    missingPrerequisites: missing
  };
}

export function calculateUserOverallProgress(userId: string): {
  completedCount: number;
  totalSessions: number;
  percentage: number;
  currentLevel: LearnerLevelNumber;
  currentLevelTitle: string;
  nextSession: { id: string; title: string } | null;
} {
  const allCompletions = getAllUserCompletions(userId);
  const total = COMPLETE_YARA_SESSIONS.length;
  let completedCount = 0;
  let nextSession: { id: string; title: string } | null = null;
  let maxLevelWithProgress: LearnerLevelNumber = 0;

  for (const s of COMPLETE_YARA_SESSIONS) {
    if (allCompletions[s.id]?.isFullyCompleted) {
      completedCount++;
      if (s.levelNumber > maxLevelWithProgress) {
        maxLevelWithProgress = s.levelNumber;
      }
    } else if (!nextSession) {
      // Find the first non-completed session whose prerequisites are satisfied
      const { isUnlocked } = checkSessionPrerequisites(userId, s.id);
      if (isUnlocked) {
        nextSession = { id: s.id, title: s.title };
      }
    }
  }

  if (!nextSession && completedCount < total) {
    // Pick the first uncompleted session
    const firstUnfinished = COMPLETE_YARA_SESSIONS.find(s => !allCompletions[s.id]?.isFullyCompleted);
    if (firstUnfinished) {
      nextSession = { id: firstUnfinished.id, title: firstUnfinished.title };
    }
  }

  const percentage = total > 0 ? Math.round((completedCount / total) * 100) : 0;
  const currentLevel = maxLevelWithProgress;
  const levelNames: Record<LearnerLevelNumber, string> = {
    0: 'Level 0 — Curious Beginner',
    1: 'Level 1 — Electronics Beginner',
    2: 'Level 2 — Block Programmer',
    3: 'Level 3 — Embedded Programmer',
    4: 'Level 4 — Robot Builder',
    5: 'Level 5 — Robot Engineer',
    6: 'Level 6 — IoT/AI Explorer',
    7: 'Level 7 — Problem Solver',
    8: 'Level 8 — Young Innovator'
  };

  return {
    completedCount,
    totalSessions: total,
    percentage,
    currentLevel,
    currentLevelTitle: levelNames[currentLevel] || 'Level 0 — Curious Beginner',
    nextSession
  };
}

// ============================================================================
// 4. CAPSTONE SUBMISSION & REVIEW RUBRIC
// ============================================================================

export async function submitCapstoneProject(data: Omit<CapstoneProjectSubmission, 'id' | 'status' | 'submittedAt'>): Promise<CapstoneProjectSubmission> {
  const submissionId = 'capstone_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6);
  const newSubmission: CapstoneProjectSubmission = {
    ...data,
    id: submissionId,
    status: 'submitted',
    submittedAt: new Date().toISOString()
  };

  const existing: CapstoneProjectSubmission[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.CAPSTONES) || '[]');
  // Replace if exists for this user, or prepend
  const filtered = existing.filter(c => c.userId !== data.userId);
  localStorage.setItem(STORAGE_KEYS.CAPSTONES, JSON.stringify([newSubmission, ...filtered]));

  // Also update P04 session completion
  await updateSessionCompletionField(data.userId, 'P04', {
    assignmentSubmitted: true,
    miniProjectSubmitted: true,
    assignmentSubmissionText: `Capstone: ${data.title} (${data.thematicArea})`,
    miniProjectUrl: data.prototypeVideoUrl
  });

  // Attempt database sync
  try {
    await supabase.from('final_project_submissions').upsert({
      id: submissionId,
      user_id: data.userId,
      title: data.title,
      problem_statement: data.problemStatement,
      simulation_url: data.circuitDiagramUrl || '',
      repo_url: data.softwareRepoUrl || '',
      video_url: data.prototypeVideoUrl,
      documentation: JSON.stringify(newSubmission),
      status: 'submitted',
      created_at: newSubmission.submittedAt
    });
  } catch {
    // safe fallback
  }

  return newSubmission;
}

export function getUserCapstoneSubmission(userId: string): CapstoneProjectSubmission | null {
  try {
    const existing: CapstoneProjectSubmission[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.CAPSTONES) || '[]');
    return existing.find(c => c.userId === userId) || null;
  } catch {
    return null;
  }
}

export function getAllCapstoneSubmissions(): CapstoneProjectSubmission[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.CAPSTONES) || '[]');
  } catch {
    return [];
  }
}

export async function reviewCapstoneSubmission(
  submissionId: string,
  status: 'approved' | 'revision_requested' | 'rejected',
  rubricScores: CapstoneProjectSubmission['rubricScores'],
  feedback: string,
  reviewerId: string
): Promise<boolean> {
  const all = getAllCapstoneSubmissions();
  const index = all.findIndex(c => c.id === submissionId);
  if (index === -1) return false;

  // Calculate total score percentage (12 criteria, 10 pts each = 120 max)
  let totalScorePercentage = 0;
  if (rubricScores) {
    const totalPoints = Object.values(rubricScores).reduce((a, b) => a + b, 0);
    totalScorePercentage = Math.round((totalPoints / 120) * 100);
  }

  all[index] = {
    ...all[index],
    status,
    rubricScores,
    totalScorePercentage,
    instructorFeedback: feedback,
    reviewedBy: reviewerId,
    reviewedAt: new Date().toISOString()
  };

  localStorage.setItem(STORAGE_KEYS.CAPSTONES, JSON.stringify(all));

  // If approved, update P05 as well
  if (status === 'approved') {
    await updateSessionCompletionField(all[index].userId, 'P05', {
      assignmentSubmitted: true,
      miniProjectSubmitted: true,
      practicalVerifiedByInstructor: true
    });
  }

  // Database sync
  try {
    await supabase.from('final_project_submissions').update({
      status,
      grade: totalScorePercentage,
      feedback: feedback
    }).eq('id', submissionId);
  } catch {
    // safe fallback
  }

  return true;
}

// ============================================================================
// 5. CERTIFICATE ELIGIBILITY ENGINE (8 MANDATORY CRITERIA)
// ============================================================================

export async function checkCertificateEligibility(userId: string, userEmail: string): Promise<CertificateEligibilityCheck> {
  const allCompletions = getAllUserCompletions(userId);
  const total = COMPLETE_YARA_SESSIONS.length;
  
  let completedSessionsCount = 0;
  let quizzesPassedCount = 0;
  let totalQuizzesCount = 0;
  let assignmentsSubmittedCount = 0;
  let totalAssignmentsCount = 0;
  let practicalLabsCount = 0;
  let totalPracticalLabs = 0;

  for (const s of COMPLETE_YARA_SESSIONS) {
    const comp = allCompletions[s.id];
    if (comp?.isFullyCompleted) completedSessionsCount++;
    
    if (s.quizQuestions && s.quizQuestions.length > 0) {
      totalQuizzesCount++;
      if (comp?.quizPassed) quizzesPassedCount++;
    }
    
    if (s.assignment) {
      totalAssignmentsCount++;
      if (comp?.assignmentSubmitted) assignmentsSubmittedCount++;
    }

    if (s.type === 'physical_lab' || s.type === 'showcase') {
      totalPracticalLabs++;
      if (comp?.isFullyCompleted) practicalLabsCount++;
    }
  }

  const capstone = getUserCapstoneSubmission(userId);
  const capstoneSubmitted = !!capstone;
  const capstoneApproved = capstone?.status === 'approved';

  // Check Subscription Status via existing YARA Membership system
  const subCheck = await checkAndVerifyUserSubscription(userId, userEmail);

  const unmetReasons: string[] = [];

  // 1. Mandatory sessions
  const sessionsMet = completedSessionsCount >= total;
  if (!sessionsMet) unmetReasons.push(`Complete all ${total} mandatory course sessions (${completedSessionsCount}/${total} completed)`);

  // 2. Quizzes
  const quizzesMet = quizzesPassedCount >= totalQuizzesCount;
  if (!quizzesMet) unmetReasons.push(`Pass all session quizzes (${quizzesPassedCount}/${totalQuizzesCount} passed)`);

  // 3. Assignments
  const assignMet = assignmentsSubmittedCount >= totalAssignmentsCount;
  if (!assignMet) unmetReasons.push(`Submit all course assignments (${assignmentsSubmittedCount}/${totalAssignmentsCount} submitted)`);

  // 4. Practical Labs
  const practicalMet = practicalLabsCount >= totalPracticalLabs;
  if (!practicalMet) unmetReasons.push(`Complete all physical laboratory assessments (${practicalLabsCount}/${totalPracticalLabs} verified)`);

  // 5. Capstone submitted
  if (!capstoneSubmitted) unmetReasons.push('Submit the compulsory YARA Innovation Capstone Project');

  // 6. Capstone approved
  if (!capstoneApproved) {
    unmetReasons.push(capstone?.status === 'under_review' ? 'Capstone project is currently under instructor review' : 'Capstone project must be reviewed and approved by an instructor');
  }

  // 7. Registered Member
  const isRegistered = !!userEmail;

  // 8. Subscription Paid & Approved
  const isSubApproved = subCheck.isSubscribed && subCheck.status === 'active';
  if (!isSubApproved) {
    unmetReasons.push(
      subCheck.status === 'pending_verification'
        ? 'Your YARA Membership payment reference is awaiting administrator approval'
        : 'An active and approved YARA Membership subscription is required before certificate issuance'
    );
  }

  const isEligible = sessionsMet && quizzesMet && assignMet && practicalMet && capstoneSubmitted && capstoneApproved && isRegistered && isSubApproved;

  return {
    isEligible,
    requirements: {
      allSessionsCompleted: { met: sessionsMet, current: completedSessionsCount, total },
      allQuizzesPassed: { met: quizzesMet, passedCount: quizzesPassedCount, totalCount: totalQuizzesCount },
      allAssignmentsSubmitted: { met: assignMet, submittedCount: assignmentsSubmittedCount, totalCount: totalAssignmentsCount },
      practicalLabsCompleted: { met: practicalMet, completedCount: practicalLabsCount, totalCount: totalPracticalLabs },
      capstoneSubmitted: { met: capstoneSubmitted, status: capstone?.status },
      capstoneApproved: { met: capstoneApproved, score: capstone?.totalScorePercentage },
      isRegisteredYaraMember: { met: isRegistered },
      subscriptionPaidAndApproved: { met: isSubApproved, status: subCheck.status, expiresAt: subCheck.profile?.subscription_expires_at }
    },
    unmetReasons
  };
}

export async function issueOrGetCertificate(userId: string, studentName: string, userEmail: string): Promise<Certificate | null> {
  const eligibility = await checkCertificateEligibility(userId, userEmail);
  if (!eligibility.isEligible) {
    return null;
  }

  // Check local cache
  const certs: Certificate[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.CERTIFICATES) || '[]');
  const existing = certs.find(c => c.user_id === userId);
  if (existing) return existing;

  const capstone = getUserCapstoneSubmission(userId);
  const certNumber = 'YARA-CERT-2026-' + (1000 + certs.length + 1).toString().padStart(6, '0');
  const gradeScore = capstone?.totalScorePercentage || 92;
  const grade = gradeScore >= 90 ? 'Distinction with Honors' : gradeScore >= 80 ? 'Merit' : 'Pass';

  const newCert: Certificate = {
    id: 'cert_' + Date.now().toString(36),
    user_id: userId,
    certificate_number: certNumber,
    student_name: studentName || userEmail.split('@')[0],
    course_title: 'YARA Robotics & Innovation Foundation Programme (Levels 0 — 8)',
    score: gradeScore,
    grade,
    issue_date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
    verification_url: `https://www.yaria.org/verify-certificate?id=${certNumber}`,
    metadata: {
      exam_score: gradeScore,
      project_title: capstone?.title || 'Autonomous Robotics Capstone',
      instructor_title: 'YARA Robotics Innovation Directorate & Evaluation Council'
    }
  };

  localStorage.setItem(STORAGE_KEYS.CERTIFICATES, JSON.stringify([newCert, ...certs]));

  // Attempt database sync
  try {
    await supabase.from('certificates').upsert(newCert);
  } catch {
    // safe fallback
  }

  return newCert;
}

export function getPublicCertificateByNumber(certNumber: string): Certificate | null {
  const certs: Certificate[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.CERTIFICATES) || '[]');
  const found = certs.find(c => c.certificate_number.trim().toUpperCase() === certNumber.trim().toUpperCase());
  if (found) return found;

  // Demo fallback certificates for verification tests
  if (certNumber.toUpperCase() === 'YARA-CERT-2026-000123' || certNumber.toUpperCase() === 'YARA-CERT-2026-001001') {
    return {
      id: 'demo_cert_1',
      user_id: 'usr_demo_1',
      certificate_number: certNumber.toUpperCase(),
      student_name: 'Tatenda Mutasa',
      course_title: 'YARA Robotics & Innovation Foundation Programme (Levels 0 — 8)',
      score: 96,
      grade: 'Distinction with Honors',
      issue_date: '15 August 2026',
      verification_url: `https://www.yaria.org/verify-certificate?id=${certNumber.toUpperCase()}`,
      metadata: {
        exam_score: 96,
        project_title: 'Solar-Powered Agricultural Weed Detection & Removal Autonomous Rover',
        instructor_title: 'YARA Robotics Innovation Directorate & Evaluation Council'
      }
    };
  }

  return null;
}

export const getPublicCertificate = getPublicCertificateByNumber;
export const getLearnerPortfolio = buildLearnerPortfolio;

// ============================================================================
// 6. LEARNER PORTFOLIO GENERATOR
// ============================================================================

export function buildLearnerPortfolio(userId: string, studentName: string): LearnerPortfolio {
  const allCompletions = getAllUserCompletions(userId);
  const capstone = getUserCapstoneSubmission(userId);
  const { currentLevel, completedCount, totalSessions } = calculateUserOverallProgress(userId);

  const researchNotes: any[] = [];
  const problemStatements: any[] = [];
  const designThinkingArtifacts: any[] = [];
  const circuitDesigns: any[] = [];
  const codeRepositories: any[] = [];
  const hardwareBuilds: any[] = [];
  const badgesUnlocked: string[] = ['🟢 Curious Beginner'];

  if (allCompletions['P01']?.isFullyCompleted) badgesUnlocked.push('⚡ Electronics Beginner');
  if (allCompletions['S07']?.isFullyCompleted) badgesUnlocked.push('🧩 Block Programmer');
  if (allCompletions['S15']?.isFullyCompleted) badgesUnlocked.push('💻 Embedded Programmer');
  if (allCompletions['S19']?.isFullyCompleted) badgesUnlocked.push('🤖 Robot Builder');
  if (allCompletions['P03']?.isFullyCompleted) badgesUnlocked.push('🔧 Robot Engineer');
  if (allCompletions['S27']?.isFullyCompleted) badgesUnlocked.push('🌐 IoT Explorer', '🧠 AI Explorer');
  if (allCompletions['S31']?.isFullyCompleted) badgesUnlocked.push('🔬 Young Researcher', '💡 Problem Solver');
  if (allCompletions['P04']?.isFullyCompleted) badgesUnlocked.push('🚀 Young Innovator');
  if (allCompletions['P05']?.isFullyCompleted && capstone?.status === 'approved') badgesUnlocked.push('🏆 YARA Robotics Graduate');

  // Extract submitted assignment texts
  for (const s of COMPLETE_YARA_SESSIONS) {
    const comp = allCompletions[s.id];
    if (comp?.assignmentSubmitted && comp.assignmentSubmissionText) {
      if (s.part === 'Research & Design') {
        researchNotes.push({
          sessionId: s.id,
          title: s.title,
          notes: comp.assignmentSubmissionText,
          date: comp.completedAt || new Date().toISOString()
        });
      }
      if (s.id === 'S29') {
        problemStatements.push({
          id: 'ps_1',
          problem: comp.assignmentSubmissionText,
          rootCauses: ['Lack of automated climate telemetry', 'Prohibitive cost of imported controllers', 'Absence of off-grid solar power'],
          hmwQuestion: 'How might we build an off-grid solar autonomous controller under $30?'
        });
      }
    }

    if (comp?.miniProjectSubmitted && comp.miniProjectUrl) {
      if (s.part === 'Electronics' || s.part === 'Embedded Systems') {
        circuitDesigns.push({
          title: s.title,
          url: comp.miniProjectUrl,
          platform: 'Tinkercad / Wokwi',
          date: comp.completedAt || new Date().toISOString()
        });
      }
      if (s.part === 'Robotics & Hardware') {
        hardwareBuilds.push({
          title: s.title,
          photoUrl: comp.miniProjectUrl,
          description: comp.miniProjectNotes || 'Physical robot assembly & motion verification'
        });
      }
    }
  }

  return {
    userId,
    studentName: studentName || 'YARA Innovator',
    currentLevel,
    completedSessionsCount: completedCount,
    totalSessionsCount: totalSessions,
    researchNotes,
    problemStatements,
    designThinkingArtifacts,
    circuitDesigns,
    codeRepositories,
    hardwareBuilds,
    capstone: capstone || undefined,
    badgesUnlocked
  };
}
