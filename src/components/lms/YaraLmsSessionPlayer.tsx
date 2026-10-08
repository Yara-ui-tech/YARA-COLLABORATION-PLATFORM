import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  CheckCircle, 
  Lock, 
  AlertTriangle, 
  BookOpen, 
  HelpCircle, 
  FileText, 
  Cpu, 
  ArrowLeft, 
  ArrowRight, 
  Award, 
  Clock, 
  ExternalLink,
  ShieldCheck, 
  Check, 
  UploadCloud, 
  ChevronRight, 
  ChevronLeft,
  Package, 
  Wrench, 
  Settings, 
  Film, 
  SkipForward, 
  SkipBack, 
  ListVideo, 
  Zap, 
  Layers,
  MessageSquare,
  Send,
  ThumbsUp,
  Bookmark,
  Share2,
  Maximize2,
  Users,
  CheckCircle2,
  AlertCircle,
  X,
  LifeBuoy
} from 'lucide-react';
import { YARALmsSession, SessionVideoClip } from '../../types/yaraLms';
import { 
  getSessionCompletion, 
  updateVideoProgress, 
  generateRandomizedQuiz, 
  evaluateQuizSubmission,
  submitSessionAssignment,
  submitSessionMiniProject,
  checkSessionPrerequisites,
  RandomizedQuestionPayload,
  getSessionVideos,
  getClipWatchProgress,
  updateClipWatchProgress,
  calculateUserOverallProgress,
  getAllUserCompletions
} from '../../services/yaraLmsService';
import { COMPLETE_YARA_SESSIONS } from '../../constants/yaraLmsCatalog';
import { useAuth } from '../AuthContext';
import { AdminSessionVideoModal } from './AdminSessionVideoModal';
import { GreatLearningCertificateModal } from './GreatLearningCertificateModal';
import { supabase } from '../../lib/supabase';

interface Props {
  session: YARALmsSession;
  userId: string;
  studentName?: string;
  userEmail?: string;
  onBack: () => void;
  onNavigateSession: (sessionId: string) => void;
  onRefreshProgress: () => void;
}

interface DoubtQuestion {
  id: string;
  authorName: string;
  authorRole: 'student' | 'mentor' | 'faculty';
  timestamp: string;
  question: string;
  upvotes: number;
  hasUpvoted?: boolean;
  replies: {
    id: string;
    authorName: string;
    authorRole: 'student' | 'mentor' | 'faculty';
    timestamp: string;
    reply: string;
  }[];
}

const DEFAULT_DOUBTS_STORAGE_KEY = 'yara_academy_session_doubts';

export const YaraLmsSessionPlayer: React.FC<Props> = ({
  session,
  userId,
  studentName = 'YARA Learner',
  userEmail = 'learner@yara.org',
  onBack,
  onNavigateSession,
  onRefreshProgress
}) => {
  const { profile } = useAuth();
  const isAdmin = profile?.role === 'admin';

  const [activeTab, setActiveTab] = useState<'video' | 'reading' | 'quiz' | 'assignment' | 'project' | 'components' | 'discussion'>('video');
  const [completion, setCompletion] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Curriculum Drawer State (Collapsible Syllabus)
  const [isSyllabusDrawerOpen, setIsSyllabusDrawerOpen] = useState(true);

  // YARA Accredited Certificate Modal
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);

  // Micro-lesson Video Clips state (max 7 mins each)
  const [videoClips, setVideoClips] = useState<SessionVideoClip[]>([]);
  const [activeClipIndex, setActiveClipIndex] = useState(0);
  const [isAdminVideoModalOpen, setIsAdminVideoModalOpen] = useState(false);
  const [clipCompletedMap, setClipCompletedMap] = useState<Record<string, boolean>>({});

  // Video watch state & anti-cheat
  const [watchedSeconds, setWatchedSeconds] = useState(0);
  const [watchPercent, setWatchPercent] = useState(0);
  const [isVideoDone, setIsVideoDone] = useState(false);
  const [videoTimerRunning, setVideoTimerRunning] = useState(false);
  const watchedSegmentsRef = useRef<[number, number][]>([]);
  const segmentStartRef = useRef<number>(0);

  // Quiz state
  const [quizData, setQuizData] = useState<{ sessionId: string; questions: RandomizedQuestionPayload[]; passingScore: number } | null>(null);
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizResult, setQuizResult] = useState<any>(null);
  const [quizSubmitting, setQuizSubmitting] = useState(false);

  // Assignment state
  const [assignmentText, setAssignmentText] = useState('');
  const [assignmentFileUrl, setAssignmentFileUrl] = useState('');
  const [assignmentSubmittedSuccess, setAssignmentSubmittedSuccess] = useState(false);

  // Mini-project state
  const [projectUrl, setProjectUrl] = useState('');
  const [projectNotes, setProjectNotes] = useState('');
  const [projectSubmittedSuccess, setProjectSubmittedSuccess] = useState(false);

  // Doubt Clearing / Mentor Discussion State
  const [doubts, setDoubts] = useState<DoubtQuestion[]>([]);
  const [newDoubtText, setNewDoubtText] = useState('');
  const [replyTextMap, setReplyTextMap] = useState<Record<string, string>>({});

  // Section 22: Universal [NEED HELP?] Mentor & Troubleshooting Modal
  const [isNeedHelpModalOpen, setIsNeedHelpModalOpen] = useState(false);
  const [helpCategory, setHelpCategory] = useState<'troubleshooting' | 'mentor' | 'faq'>('troubleshooting');
  const [mentorDomain, setMentorDomain] = useState('Arduino & ESP32 Microcontrollers');
  const [helpQuestion, setHelpQuestion] = useState('');
  const [helpWhatsapp, setHelpWhatsapp] = useState('');
  const [helpSubmitting, setHelpSubmitting] = useState(false);
  const [helpSubmittedSuccess, setHelpSubmittedSuccess] = useState(false);

  const handleSubmitMentorHelp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!helpQuestion.trim()) return;
    setHelpSubmitting(true);
    try {
      const formattedMessage = `[YARA Academy Help Request | Course: YARA Robotics Academy | Level: Level ${session.levelNumber} | Module: ${session.id} - ${session.title} | Activity: ${activeTab.toUpperCase()} | Specialization: ${mentorDomain}] ${helpQuestion.trim()}`;
      
      await supabase.from('mentorship_requests').insert({
        requester_id: userId,
        requester_name: studentName,
        status: 'pending',
        message: formattedMessage,
        whatsapp_number: helpWhatsapp.trim() || undefined
      });

      setHelpSubmittedSuccess(true);
      setTimeout(() => {
        setHelpSubmittedSuccess(false);
        setIsNeedHelpModalOpen(false);
        setHelpQuestion('');
        setHelpWhatsapp('');
      }, 2500);
    } catch (err) {
      console.error('Error submitting help request:', err);
      setHelpSubmittedSuccess(true);
      setTimeout(() => {
        setHelpSubmittedSuccess(false);
        setIsNeedHelpModalOpen(false);
      }, 2000);
    } finally {
      setHelpSubmitting(false);
    }
  };

  // Prerequisites & Navigation Index
  const { isUnlocked, missingPrerequisites } = checkSessionPrerequisites(userId, session.id);
  const sessionIndex = COMPLETE_YARA_SESSIONS.findIndex(s => s.id === session.id);
  const prevSession = sessionIndex > 0 ? COMPLETE_YARA_SESSIONS[sessionIndex - 1] : null;
  const nextSession = sessionIndex < COMPLETE_YARA_SESSIONS.length - 1 ? COMPLETE_YARA_SESSIONS[sessionIndex + 1] : null;

  // Overall Program Progress
  const overallProgress = calculateUserOverallProgress(userId);
  const allUserCompletions = getAllUserCompletions(userId);

  useEffect(() => {
    loadSessionState();
    loadDoubts();
  }, [session.id, userId]);

  const loadDoubts = () => {
    try {
      const raw = localStorage.getItem(`${DEFAULT_DOUBTS_STORAGE_KEY}_${session.id}`);
      if (raw) {
        setDoubts(JSON.parse(raw));
      } else {
        // Starter initial sample doubts to jumpstart discussion
        const initial: DoubtQuestion[] = [
          {
            id: 'd1',
            authorName: 'Tinashe Moyo',
            authorRole: 'student',
            timestamp: 'Yesterday at 3:15 PM',
            question: `What is the most effective approach to calibrate the sensors for this session without external oscilloscope equipment?`,
            upvotes: 4,
            replies: [
              {
                id: 'r1',
                authorName: 'Mr. S.O. Manongwa',
                authorRole: 'faculty',
                timestamp: 'Yesterday at 4:30 PM',
                reply: `Great question, Tinashe! You can use the Arduino Serial Plotter (9600 baud) to monitor live analog readings in real time and establish baseline thresholds.`
              }
            ]
          }
        ];
        setDoubts(initial);
        localStorage.setItem(`${DEFAULT_DOUBTS_STORAGE_KEY}_${session.id}`, JSON.stringify(initial));
      }
    } catch {
      setDoubts([]);
    }
  };

  const handlePostDoubt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDoubtText.trim()) return;

    const newQ: DoubtQuestion = {
      id: `doubt_${Date.now()}`,
      authorName: studentName || 'Student',
      authorRole: isAdmin ? 'faculty' : 'student',
      timestamp: 'Just now',
      question: newDoubtText.trim(),
      upvotes: 1,
      replies: []
    };

    const updated = [newQ, ...doubts];
    setDoubts(updated);
    setNewDoubtText('');
    localStorage.setItem(`${DEFAULT_DOUBTS_STORAGE_KEY}_${session.id}`, JSON.stringify(updated));
  };

  const handlePostReply = (doubtId: string) => {
    const text = replyTextMap[doubtId];
    if (!text || !text.trim()) return;

    const updated = doubts.map(d => {
      if (d.id === doubtId) {
        return {
          ...d,
          replies: [
            ...d.replies,
            {
              id: `rep_${Date.now()}`,
              authorName: isAdmin ? 'YARA Faculty' : (studentName || 'Student'),
              authorRole: (isAdmin ? 'faculty' : 'student') as any,
              timestamp: 'Just now',
              reply: text.trim()
            }
          ]
        };
      }
      return d;
    });

    setDoubts(updated);
    setReplyTextMap(prev => ({ ...prev, [doubtId]: '' }));
    localStorage.setItem(`${DEFAULT_DOUBTS_STORAGE_KEY}_${session.id}`, JSON.stringify(updated));
  };

  const handleUpvote = (doubtId: string) => {
    const updated = doubts.map(d => {
      if (d.id === doubtId) {
        const hasUpvoted = d.hasUpvoted;
        return {
          ...d,
          upvotes: hasUpvoted ? d.upvotes - 1 : d.upvotes + 1,
          hasUpvoted: !hasUpvoted
        };
      }
      return d;
    });
    setDoubts(updated);
    localStorage.setItem(`${DEFAULT_DOUBTS_STORAGE_KEY}_${session.id}`, JSON.stringify(updated));
  };

  const loadSessionState = async () => {
    setLoading(true);
    const comp = await getSessionCompletion(userId, session.id);
    setCompletion(comp);
    
    // Load modular video clips
    const clips = getSessionVideos(session.id);
    setVideoClips(clips);
    if (activeClipIndex >= clips.length) {
      setActiveClipIndex(0);
    }

    // Load progress for each clip
    const completedMap: Record<string, boolean> = {};
    clips.forEach(clip => {
      const prog = getClipWatchProgress(userId, session.id, clip.id);
      completedMap[clip.id] = prog.isCompleted;
    });
    setClipCompletedMap(completedMap);

    setIsVideoDone(comp.videoCompleted || clips.length === 0);
    if (comp.assignmentSubmissionText) setAssignmentText(comp.assignmentSubmissionText);
    if (comp.assignmentFileUrl) setAssignmentFileUrl(comp.assignmentFileUrl);
    if (comp.miniProjectUrl) setProjectUrl(comp.miniProjectUrl);
    if (comp.miniProjectNotes) setProjectNotes(comp.miniProjectNotes);

    // Initialize Quiz
    const generated = generateRandomizedQuiz(session.id);
    setQuizData(generated);
    setUserAnswers({});
    setQuizSubmitted(false);
    setQuizResult(null);

    setLoading(false);
  };

  const activeClip = videoClips[activeClipIndex] || videoClips[0];
  const activeClipDuration = activeClip?.durationSeconds || 240;

  // Sync watch timer when switching clips
  useEffect(() => {
    if (activeClip) {
      const prog = getClipWatchProgress(userId, session.id, activeClip.id);
      setWatchedSeconds(prog.watchedSeconds || 0);
      setWatchPercent(prog.percent || 0);
      setVideoTimerRunning(false);
    }
  }, [activeClipIndex, activeClip?.id, session.id, userId]);

  // Micro-lesson Video watch timer simulator / watcher
  useEffect(() => {
    let interval: any;
    if (videoTimerRunning && activeClip) {
      interval = setInterval(() => {
        setWatchedSeconds(prev => {
          const next = prev + 1;
          const totalDur = activeClip.durationSeconds || 240;
          const pct = Math.min(100, Math.round((next / totalDur) * 100));
          setWatchPercent(pct);

          const segStart = segmentStartRef.current;
          const currentSegments: [number, number][] = [...watchedSegmentsRef.current, [segStart, next]];

          if (pct >= 85) {
            updateClipWatchProgress(userId, session.id, activeClip.id, next, totalDur);
            setClipCompletedMap(prevMap => ({ ...prevMap, [activeClip.id]: true }));

            const updatedClips = getSessionVideos(session.id);
            const allDone = updatedClips.every(c => c.id === activeClip.id || clipCompletedMap[c.id]);
            if (allDone) {
              setIsVideoDone(true);
              updateVideoProgress(userId, session.id, next, totalDur, currentSegments).then(() => {
                onRefreshProgress();
              });
            }
          }
          return next;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [videoTimerRunning, activeClip, clipCompletedMap, session.id, userId, onRefreshProgress]);

  const handleStartWatching = () => {
    segmentStartRef.current = watchedSeconds;
    setVideoTimerRunning(true);
  };

  const handlePauseWatching = () => {
    setVideoTimerRunning(false);
    if (activeClip) {
      const totalDur = activeClip.durationSeconds || 240;
      watchedSegmentsRef.current.push([segmentStartRef.current, watchedSeconds]);
      updateClipWatchProgress(userId, session.id, activeClip.id, watchedSeconds, totalDur);
    }
  };

  const handleMarkClipComplete = () => {
    if (!activeClip) return;
    const dur = activeClip.durationSeconds || 240;
    setWatchedSeconds(dur);
    setWatchPercent(100);
    updateClipWatchProgress(userId, session.id, activeClip.id, dur, dur);
    setClipCompletedMap(prev => ({ ...prev, [activeClip.id]: true }));

    const allDone = videoClips.every(c => c.id === activeClip.id || clipCompletedMap[c.id]);
    if (allDone) {
      setIsVideoDone(true);
      updateVideoProgress(userId, session.id, dur, dur, [[0, dur]]).then(() => {
        onRefreshProgress();
      });
    }
  };

  const handleNextClip = () => {
    if (activeClipIndex < videoClips.length - 1) {
      setActiveClipIndex(prev => prev + 1);
    }
  };

  const handlePrevClip = () => {
    if (activeClipIndex > 0) {
      setActiveClipIndex(prev => prev - 1);
    }
  };

  const handleVideosUpdated = () => {
    loadSessionState();
    onRefreshProgress();
  };

  const formatSecs = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleQuizOptionSelect = (questionId: string, optionIdx: number) => {
    if (quizSubmitted) return;
    setUserAnswers(prev => ({ ...prev, [questionId]: optionIdx }));
  };

  const handleSubmitQuiz = async () => {
    if (!quizData) return;
    setQuizSubmitting(true);
    try {
      const result = await evaluateQuizSubmission(userId, session.id, userAnswers, 120);
      setQuizResult(result);
      setQuizSubmitted(true);
      await loadSessionState();
      onRefreshProgress();
    } catch (e) {
      console.error('Quiz submit error:', e);
    } finally {
      setQuizSubmitting(false);
    }
  };

  const handleSubmitAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignmentText.trim()) return;
    await submitSessionAssignment(userId, session.id, assignmentText, assignmentFileUrl);
    setAssignmentSubmittedSuccess(true);
    await loadSessionState();
    onRefreshProgress();
    setTimeout(() => setAssignmentSubmittedSuccess(false), 4000);
  };

  const handleSubmitProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectUrl.trim()) return;
    await submitSessionMiniProject(userId, session.id, projectUrl, projectNotes);
    setProjectSubmittedSuccess(true);
    await loadSessionState();
    onRefreshProgress();
    setTimeout(() => setProjectSubmittedSuccess(false), 4000);
  };

  if (!isUnlocked) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-3xl mx-auto my-12 text-center text-white shadow-2xl">
        <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-center mx-auto mb-6 text-amber-400">
          <Lock size={32} />
        </div>
        <h2 className="text-2xl font-bold mb-3">Session Locked</h2>
        <p className="text-slate-400 text-sm max-w-md mx-auto mb-6">
          To maintain strict academic integrity and build competence sequentially, you must complete the prerequisite sessions first.
        </p>
        <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-4 text-left mb-8 max-w-lg mx-auto">
          <div className="text-xs font-semibold uppercase tracking-wider text-amber-400 mb-2 flex items-center gap-1.5">
            <AlertTriangle size={14} /> Missing Prerequisites:
          </div>
          <ul className="space-y-1.5 text-xs text-slate-300">
            {missingPrerequisites.map((p, idx) => (
              <li key={idx} className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                {p}
              </li>
            ))}
          </ul>
        </div>
        <button
          onClick={onBack}
          className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-sm font-semibold rounded-xl transition cursor-pointer"
        >
          Back to Curriculum
        </button>
      </div>
    );
  }

  const isEligibleForCert = overallProgress.percentage >= 100;

  return (
    <div className="flex flex-col min-h-[85vh] bg-slate-900 text-slate-100 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl">
      {/* ─── 1. TOP LMS BAR ────────────────────────────────────── */}
      <header className="bg-slate-950/90 border-b border-slate-800 px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-3 sticky top-0 z-30 backdrop-blur-md">
        {/* Left: Breadcrumbs & Syllabus Drawer Toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-slate-850 hover:bg-slate-800 text-slate-300 hover:text-white transition flex items-center gap-1.5 text-xs font-bold"
            title="Back to Course Overview"
          >
            <ArrowLeft size={14} />
            <span className="hidden sm:inline">Back</span>
          </button>

          <button
            onClick={() => setIsSyllabusDrawerOpen(!isSyllabusDrawerOpen)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition ${
              isSyllabusDrawerOpen 
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                : 'bg-slate-850 border-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            <ListVideo size={13} />
            <span>{isSyllabusDrawerOpen ? 'Hide Syllabus' : 'Show Syllabus'}</span>
          </button>

          {/* Breadcrumbs */}
          <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-400">
            <span>Robotics Academy</span>
            <ChevronRight size={12} />
            <span className="text-slate-300 font-medium">Level {session.levelNumber}</span>
            <ChevronRight size={12} />
            <span className="text-white font-bold line-clamp-1 max-w-[220px]">{session.title}</span>
          </div>
        </div>

        {/* Right: Progress & Great Learning Certificate Button */}
        <div className="flex items-center gap-3">
          {/* Real-time progress metric */}
          <div className="hidden sm:flex items-center gap-2 text-xs">
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block font-bold uppercase">Course Progress</span>
              <span className="font-mono font-bold text-emerald-400">{overallProgress.percentage}% Complete</span>
            </div>
            <div className="w-16 h-2 bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                style={{ width: `${overallProgress.percentage}%` }}
              />
            </div>
          </div>

          {/* Universal [NEED HELP?] Action (Section 22) */}
          <button
            onClick={() => setIsNeedHelpModalOpen(true)}
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1.5 transition shadow-sm border border-indigo-400/40 cursor-pointer"
            title="Request mentor support, view troubleshooting, or ask clarification"
          >
            <LifeBuoy size={14} className="text-indigo-200" />
            <span>NEED HELP?</span>
          </button>

          {/* Great Learning "Claim Certificate" prominent action */}
          <button
            onClick={() => setIsCertModalOpen(true)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition shadow-lg cursor-pointer ${
              isEligibleForCert
                ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 animate-pulse shadow-amber-500/30'
                : 'bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700'
            }`}
            title="View certificate criteria or claim your accredited credential"
          >
            <Award size={14} className={isEligibleForCert ? 'text-slate-950' : 'text-amber-400'} />
            <span>{isEligibleForCert ? 'Claim Certificate' : 'Certificate Criteria'}</span>
          </button>

          {/* Admin Manage Videos Action */}
          {isAdmin && (
            <button
              onClick={() => setIsAdminVideoModalOpen(true)}
              className="p-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 transition"
              title="Admin Video Studio"
            >
              <Film size={14} />
            </button>
          )}
        </div>
      </header>

      {/* ─── 2. MAIN BODY (SYLLABUS SIDEBAR + CONTENT STAGE) ──────────────────────── */}
      <div className="flex-1 flex overflow-hidden">
        {/* Collapsible Curriculum Drawer (Left) */}
        {isSyllabusDrawerOpen && (
          <aside className="w-80 shrink-0 bg-slate-950 border-r border-slate-800 flex flex-col justify-between overflow-y-auto no-scrollbar hidden md:flex">
            <div className="p-4 space-y-4">
              {/* Pinned Certificate Qualification Status Card */}
              <div 
                onClick={() => setIsCertModalOpen(true)}
                className="p-3.5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-amber-500/30 hover:border-amber-400 cursor-pointer transition shadow-md group"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
                    <Award size={14} />
                    <span>Certificate Progress</span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 font-bold">{overallProgress.percentage}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mb-2">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${overallProgress.percentage}%` }} />
                </div>
                <div className="text-[10px] text-slate-400 flex items-center justify-between">
                  <span>{overallProgress.completedCount} of {overallProgress.totalSessions} sessions</span>
                  <span className="text-amber-300 font-bold group-hover:underline flex items-center gap-0.5">
                    View checklist <ChevronRight size={10} />
                  </span>
                </div>
              </div>

              {/* Module Syllabus List */}
              <div className="space-y-1.5">
                <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-1 mb-1">
                  Foundation Curriculum (42 Sessions)
                </div>

                <div className="space-y-1 max-h-[55vh] overflow-y-auto pr-1">
                  {COMPLETE_YARA_SESSIONS.map((s, idx) => {
                    const isCurrent = s.id === session.id;
                    const comp = (allUserCompletions[s.id] || {}) as any;
                    const isDone = comp.isFullyCompleted;
                    const { isUnlocked: sUnlocked } = checkSessionPrerequisites(userId, s.id, allUserCompletions);

                    return (
                      <button
                        key={s.id}
                        disabled={!sUnlocked}
                        onClick={() => onNavigateSession(s.id)}
                        className={`w-full text-left p-2.5 rounded-xl border text-xs transition flex items-center justify-between gap-2 cursor-pointer disabled:cursor-not-allowed ${
                          isCurrent
                            ? 'bg-emerald-950/40 border-emerald-500 text-white font-bold shadow-sm'
                            : isDone
                            ? 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                            : sUnlocked
                            ? 'bg-slate-900/30 border-slate-800/60 text-slate-400 hover:text-white hover:border-slate-700'
                            : 'bg-slate-950/40 border-slate-900 text-slate-600 opacity-60'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold ${
                            isDone 
                              ? 'bg-emerald-500 text-slate-950' 
                              : isCurrent 
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' 
                              : 'bg-slate-800 text-slate-400'
                          }`}>
                            {isDone ? <Check size={11} className="stroke-[3]" /> : idx + 1}
                          </div>

                          <div className="truncate">
                            <div className="truncate text-xs font-semibold leading-tight">{s.title}</div>
                            <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                              {s.id} • {s.durationMinutes}m
                            </div>
                          </div>
                        </div>

                        {!sUnlocked ? (
                          <Lock size={12} className="text-slate-600 shrink-0" />
                        ) : isCurrent ? (
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
              <span>Standard: YARA Learning Academy</span>
              <span className="text-emerald-400 font-mono font-bold">L0–L8</span>
            </div>
          </aside>
        )}

        {/* Content Stage (Center) */}
        <main className="flex-1 flex flex-col overflow-y-auto no-scrollbar p-4 sm:p-6 space-y-6">
          {/* Session Header Banner */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1.5">
                <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                  {session.id} • Level {session.levelNumber}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
                  {session.part}
                </span>
                <span className="flex items-center gap-1 text-[11px] text-slate-400">
                  <Clock size={12} /> {session.durationMinutes} mins
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-white">{session.title}</h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">{session.subtitle}</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsNeedHelpModalOpen(true)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition shadow-sm cursor-pointer border border-indigo-400/30"
              >
                <LifeBuoy size={14} className="text-indigo-200" />
                <span>NEED HELP?</span>
              </button>
              <button
                onClick={handleMarkClipComplete}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-xs font-bold rounded-xl flex items-center gap-1.5 transition shadow-sm cursor-pointer"
              >
                <Check size={14} />
                <span>Mark Lesson Complete</span>
              </button>
            </div>
          </div>

          {/* Stage Tabs (Great Learning Standard) */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800 no-scrollbar">
            <button
              onClick={() => setActiveTab('video')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition cursor-pointer ${
                activeTab === 'video'
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'bg-slate-950 text-slate-300 hover:bg-slate-850 border border-slate-800'
              }`}
            >
              <Film size={13} />
              <span>Video Lecture ({videoClips.length})</span>
              {isVideoDone && <Check size={12} className="stroke-[3]" />}
            </button>

            <button
              onClick={() => setActiveTab('reading')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition cursor-pointer ${
                activeTab === 'reading'
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'bg-slate-950 text-slate-300 hover:bg-slate-850 border border-slate-800'
              }`}
            >
              <BookOpen size={13} />
              <span>Study Notes & Formulas</span>
            </button>

            {session.quizQuestions && session.quizQuestions.length > 0 && (
              <button
                onClick={() => setActiveTab('quiz')}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition cursor-pointer ${
                  activeTab === 'quiz'
                    ? 'bg-emerald-500 text-slate-950 shadow-md'
                    : 'bg-slate-950 text-slate-300 hover:bg-slate-850 border border-slate-800'
                }`}
              >
                <HelpCircle size={13} />
                <span>Graded Quiz</span>
                {completion?.quizPassed && <Check size={12} className="stroke-[3]" />}
              </button>
            )}

            <button
              onClick={() => setActiveTab('discussion')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition cursor-pointer ${
                activeTab === 'discussion'
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'bg-slate-950 text-slate-300 hover:bg-slate-850 border border-slate-800'
              }`}
            >
              <MessageSquare size={13} />
              <span>Ask Faculty & Mentors ({doubts.length})</span>
            </button>

            {session.hasPhysicalComponents && (
              <button
                onClick={() => setActiveTab('components')}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition cursor-pointer ${
                  activeTab === 'components'
                    ? 'bg-emerald-500 text-slate-950 shadow-md'
                    : 'bg-slate-950 text-slate-300 hover:bg-slate-850 border border-slate-800'
                }`}
              >
                <Package size={13} />
                <span>Hardware Components</span>
              </button>
            )}

            {session.assignment && (
              <button
                onClick={() => setActiveTab('assignment')}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition cursor-pointer ${
                  activeTab === 'assignment'
                    ? 'bg-emerald-500 text-slate-950 shadow-md'
                    : 'bg-slate-950 text-slate-300 hover:bg-slate-850 border border-slate-800'
                }`}
              >
                <FileText size={13} />
                <span>Assignment</span>
                {completion?.assignmentSubmitted && <Check size={12} className="stroke-[3]" />}
              </button>
            )}

            {session.miniProject && (
              <button
                onClick={() => setActiveTab('project')}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition cursor-pointer ${
                  activeTab === 'project'
                    ? 'bg-emerald-500 text-slate-950 shadow-md'
                    : 'bg-slate-950 text-slate-300 hover:bg-slate-850 border border-slate-800'
                }`}
              >
                <Cpu size={13} />
                <span>Hands-on Project</span>
                {completion?.miniProjectSubmitted && <Check size={12} className="stroke-[3]" />}
              </button>
            )}
          </div>

          {/* ─── TAB 1: VIDEO MICRO-LESSONS ─────────────────────────────────────── */}
          {activeTab === 'video' && (
            <div className="space-y-4">
              <div className="bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl relative">
                {/* Micro-Lesson Header */}
                <div className="px-5 py-3 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-xs flex items-center justify-center">
                      {activeClipIndex + 1}
                    </span>
                    <div>
                      <h3 className="text-xs font-bold text-white line-clamp-1">
                        {activeClip?.title || session.title}
                      </h3>
                      <span className="text-[10px] text-slate-400">
                        Lesson {activeClipIndex + 1} of {videoClips.length} • Max 7 Min Micro-Lesson Standard
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={handlePrevClip}
                      disabled={activeClipIndex === 0}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-300 transition"
                      title="Previous Micro-Lesson"
                    >
                      <SkipBack size={14} />
                    </button>
                    <button
                      onClick={handleNextClip}
                      disabled={activeClipIndex === videoClips.length - 1}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-300 transition"
                      title="Next Micro-Lesson"
                    >
                      <SkipForward size={14} />
                    </button>
                  </div>
                </div>

                {/* Video Stage Player */}
                <div className="aspect-video w-full bg-slate-950 relative overflow-hidden flex items-center justify-center">
                  {!activeClip?.videoUrl || !activeClip.videoUrl.trim() ? (
                    <div className="p-8 text-center space-y-3 max-w-md">
                      <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center mx-auto">
                        <Play className="w-8 h-8 text-indigo-400 ml-1" />
                      </div>
                      <div>
                        <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-400/20 text-amber-300 border border-amber-400/30 inline-block mb-2">
                          Video Lecture Ready
                        </span>
                        <h4 className="text-base font-bold text-white">
                          "{activeClip?.title || session.title}"
                        </h4>
                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                          Follow the study guide, interactive pinouts, and firmware walkthrough below. Use the watch logger below to log time and claim credit.
                        </p>
                      </div>
                    </div>
                  ) : activeClip.videoUrl.includes('youtube.com') || activeClip.videoUrl.includes('youtu.be') ? (
                    <iframe
                      src={activeClip.videoUrl.replace('watch?v=', 'embed/').replace('youtu.be/', 'www.youtube.com/embed/')}
                      title={activeClip?.title || session.title}
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <video
                      src={activeClip?.videoUrl}
                      controls
                      className="w-full h-full object-contain"
                    />
                  )}
                </div>

                {/* Micro-Lesson Watch Bar & Logger */}
                <div className="p-4 bg-slate-900/90 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="w-full sm:w-1/2">
                    <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                      <span className="text-slate-300 flex items-center gap-1.5">
                        <ShieldCheck size={14} className="text-emerald-400" /> Watch Verification ({formatSecs(watchedSeconds)} / {formatSecs(activeClipDuration)})
                      </span>
                      <span className={watchPercent >= 85 ? 'text-emerald-400 font-bold' : 'text-amber-400'}>
                        {watchPercent}% {watchPercent >= 85 ? '✓ Verified' : '(85% required)'}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${watchPercent >= 85 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                        style={{ width: `${watchPercent}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap justify-end">
                    {!videoTimerRunning ? (
                      <button
                        onClick={handleStartWatching}
                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-sm cursor-pointer"
                      >
                        <Play size={13} /> Log Watch Time
                      </button>
                    ) : (
                      <button
                        onClick={handlePauseWatching}
                        className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <Clock size={13} /> Pause Logger
                      </button>
                    )}

                    <button
                      onClick={handleMarkClipComplete}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition flex items-center gap-1 cursor-pointer"
                    >
                      <Check size={13} className="text-emerald-400" /> Complete Clip
                    </button>

                    {activeClipIndex < videoClips.length - 1 && (
                      <button
                        onClick={handleNextClip}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition flex items-center gap-1 cursor-pointer"
                      >
                        Next <ChevronRight size={13} />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Micro-Lesson Description & Takeaway */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                    Core Learning Objective
                  </h3>
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-slate-400 capitalize">
                    {activeClip?.clipType || 'Concept'}
                  </span>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed">
                  {activeClip?.description || session.learningObjective}
                </p>
              </div>
            </div>
          )}

          {/* ─── TAB 2: TECHNICAL READING & SUMMARY ─────────────────────────────── */}
          {activeTab === 'reading' && (
            <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 text-slate-200">
              <div className="border-b border-slate-800 pb-4">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Lecture Study Guide</span>
                <h2 className="text-2xl font-bold text-white mt-1">{session.title}</h2>
              </div>

              <div className="prose prose-invert prose-emerald max-w-none text-sm sm:text-base leading-relaxed space-y-4">
                <div className="whitespace-pre-line font-sans text-slate-300">
                  {session.reading_markdown}
                </div>
              </div>

              <div className="bg-emerald-950/20 border border-emerald-500/20 rounded-2xl p-5 mt-6 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-emerald-400">Understood the concept?</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Test your comprehension in the graded assessment.</p>
                </div>
                {session.quizQuestions && session.quizQuestions.length > 0 && (
                  <button
                    onClick={() => setActiveTab('quiz')}
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-xl transition cursor-pointer"
                  >
                    Take Graded Quiz →
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ─── TAB 3: GRADED ASSESSMENT QUIZ ──────────────────────────────────── */}
          {activeTab === 'quiz' && quizData && (
            <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Accredited Evaluation</span>
                  <h2 className="text-xl font-bold text-white mt-1">Graded Module Assessment</h2>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400 block">Passing Mark</span>
                  <span className="text-sm font-bold text-emerald-400">{quizData.passingScore}% (Required for Certificate)</span>
                </div>
              </div>

              {/* Quiz Result Banner */}
              {quizSubmitted && quizResult && (
                <div className={`p-5 rounded-2xl border ${quizResult.passed ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300' : 'bg-red-950/30 border-red-500/40 text-red-300'}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-bold flex items-center gap-2">
                        {quizResult.passed ? <CheckCircle size={20} className="text-emerald-400" /> : <AlertTriangle size={20} className="text-red-400" />}
                        {quizResult.passed ? 'Quiz Cleared with Distinction!' : 'Passing Score Not Met'}
                      </h3>
                      <p className="text-xs mt-1 text-slate-300">
                        You scored {quizResult.score} / {quizResult.totalQuestions} ({quizResult.percentage}%).
                      </p>
                    </div>
                    {!quizResult.passed && (
                      <button
                        onClick={() => {
                          const generated = generateRandomizedQuiz(session.id);
                          setQuizData(generated);
                          setUserAnswers({});
                          setQuizSubmitted(false);
                          setQuizResult(null);
                        }}
                        className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl transition cursor-pointer"
                      >
                        Retake Assessment
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Questions */}
              <div className="space-y-6">
                {quizData.questions.map((q, qIndex) => {
                  const resultFeedback = quizResult?.feedback?.find((f: any) => f.questionId === q.id);
                  return (
                    <div key={q.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
                      <div className="text-xs font-semibold text-slate-400">
                        Question {qIndex + 1} of {quizData.questions.length}
                      </div>
                      <h3 className="text-sm sm:text-base font-bold text-white">{q.question}</h3>

                      <div className="space-y-2.5">
                        {q.options.map((opt, optIndex) => {
                          const isSelected = userAnswers[q.id] === optIndex;
                          let btnStyle = 'bg-slate-950 hover:bg-slate-850 text-slate-300 border-slate-800';

                          if (quizSubmitted && resultFeedback) {
                            if (optIndex === resultFeedback.correctChoice) {
                              btnStyle = 'bg-emerald-950/50 border-emerald-500 text-emerald-300 font-semibold';
                            } else if (isSelected && !resultFeedback.isCorrect) {
                              btnStyle = 'bg-red-950/50 border-red-500 text-red-300';
                            }
                          } else if (isSelected) {
                            btnStyle = 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-semibold';
                          }

                          return (
                            <button
                              key={optIndex}
                              onClick={() => handleQuizOptionSelect(q.id, optIndex)}
                              disabled={quizSubmitted}
                              className={`w-full text-left p-3.5 rounded-xl border text-xs sm:text-sm transition flex items-center justify-between cursor-pointer ${btnStyle}`}
                            >
                              <span>{opt}</span>
                              {isSelected && <Check size={14} className="text-emerald-400 shrink-0" />}
                            </button>
                          );
                        })}
                      </div>

                      {quizSubmitted && resultFeedback && (
                        <div className="bg-slate-950 rounded-xl p-3.5 border border-slate-800 text-xs text-slate-300 mt-3">
                          <span className="font-bold text-emerald-400 block mb-1">Explanation:</span>
                          {resultFeedback.explanation}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {!quizSubmitted && (
                <div className="pt-4 flex justify-end">
                  <button
                    onClick={handleSubmitQuiz}
                    disabled={quizSubmitting || Object.keys(userAnswers).length < quizData.questions.length}
                    className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 text-xs font-bold rounded-xl shadow-lg transition cursor-pointer"
                  >
                    {quizSubmitting ? 'Evaluating Submission…' : 'Submit Answers for Grading'}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ─── TAB 4: DOUBT CLEARING & MENTOR Q&A ──────────────────────────────── */}
          {activeTab === 'discussion' && (
            <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
              <div className="border-b border-slate-800 pb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">YARA Academic Mentorship Forum</span>
                  <h2 className="text-xl font-bold text-white mt-0.5">Doubt Resolution & Discussion</h2>
                </div>
                <span className="px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold">
                  Active Faculty & Peer Assistance
                </span>
              </div>

              {/* Ask a Question Input */}
              <form onSubmit={handlePostDoubt} className="space-y-3 p-4 bg-slate-900 border border-slate-800 rounded-2xl">
                <label className="text-xs font-bold text-slate-300 block">
                  Have a question or concept doubt on this lesson?
                </label>
                <textarea
                  rows={3}
                  value={newDoubtText}
                  onChange={e => setNewDoubtText(e.target.value)}
                  placeholder="Ask a technical doubt or request guidance from YARA mentors and faculty..."
                  className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 resize-none"
                  required
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 transition shadow-sm cursor-pointer"
                  >
                    <Send size={13} />
                    <span>Post Question to Mentors</span>
                  </button>
                </div>
              </form>

              {/* Doubt Threads */}
              <div className="space-y-4">
                {doubts.map(d => (
                  <div key={d.id} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3.5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white">{d.authorName}</span>
                          <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                            d.authorRole === 'faculty' 
                              ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30' 
                              : 'bg-slate-800 text-slate-400'
                          }`}>
                            {d.authorRole}
                          </span>
                          <span className="text-[10px] text-slate-500">{d.timestamp}</span>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-200 mt-2 font-medium leading-relaxed">
                          {d.question}
                        </p>
                      </div>

                      <button
                        onClick={() => handleUpvote(d.id)}
                        className={`p-2 rounded-xl border text-xs font-bold flex items-center gap-1 transition cursor-pointer ${
                          d.hasUpvoted ? 'bg-indigo-600/30 border-indigo-500 text-indigo-300' : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        <ThumbsUp size={12} />
                        <span>{d.upvotes}</span>
                      </button>
                    </div>

                    {/* Replies */}
                    {d.replies.length > 0 && (
                      <div className="pl-4 border-l-2 border-emerald-500/40 space-y-2.5 pt-1">
                        {d.replies.map(r => (
                          <div key={r.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-bold text-emerald-400">{r.authorName}</span>
                              <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded font-bold uppercase">
                                Verified {r.authorRole}
                              </span>
                              <span className="text-[10px] text-slate-500">{r.timestamp}</span>
                            </div>
                            <p className="text-xs text-slate-300 leading-relaxed">{r.reply}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Quick Reply Form */}
                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="text"
                        placeholder="Write a reply or answer..."
                        value={replyTextMap[d.id] || ''}
                        onChange={e => setReplyTextMap(prev => ({ ...prev, [d.id]: e.target.value }))}
                        className="flex-1 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                      <button
                        onClick={() => handlePostReply(d.id)}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-bold rounded-lg transition"
                      >
                        Reply
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─── TAB 5: HARDWARE COMPONENTS ─────────────────────────────────────── */}
          {activeTab === 'components' && session.componentsRequired && (
            <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
              <div>
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Hardware Lab Checklist</span>
                <h2 className="text-xl font-bold text-white mt-1">Physical Starter Kit Components</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {session.componentsRequired.map((comp, idx) => (
                  <div key={idx} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                      <Wrench size={18} />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        {comp.name}
                        {comp.inStarterKit && (
                          <span className="px-1.5 py-0.2 rounded text-[10px] bg-emerald-500/20 text-emerald-300">In Starter Kit</span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">Qty: {comp.quantity} • {comp.purpose}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─── TAB 6: ASSIGNMENT ──────────────────────────────────────────────── */}
          {activeTab === 'assignment' && session.assignment && (
            <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
              <div>
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Technical Deliverable</span>
                <h2 className="text-xl font-bold text-white mt-1">{session.assignment.title}</h2>
                <p className="text-xs text-slate-300 mt-1">{session.assignment.description}</p>
              </div>

              {assignmentSubmittedSuccess && (
                <div className="p-4 bg-emerald-950/40 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle size={16} /> Assignment recorded to your portfolio!
                </div>
              )}

              <form onSubmit={handleSubmitAssignment} className="space-y-4">
                <textarea
                  value={assignmentText}
                  onChange={e => setAssignmentText(e.target.value)}
                  placeholder="Paste your calculation, formula analysis, or written answer here..."
                  rows={5}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                  required
                />
                <input
                  type="url"
                  value={assignmentFileUrl}
                  onChange={e => setAssignmentFileUrl(e.target.value)}
                  placeholder="Optional Google Drive / GitHub repository link..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-xl transition flex items-center gap-2 cursor-pointer"
                >
                  <UploadCloud size={14} /> Submit Assignment
                </button>
              </form>
            </div>
          )}

          {/* ─── TAB 7: PROJECT ─────────────────────────────────────────────────── */}
          {activeTab === 'project' && session.miniProject && (
            <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
              <div>
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Hands-On Innovation Lab</span>
                <h2 className="text-xl font-bold text-white mt-1">{session.miniProject.title}</h2>
                <p className="text-xs text-slate-300 mt-1">{session.miniProject.description}</p>
              </div>

              {projectSubmittedSuccess && (
                <div className="p-4 bg-emerald-950/40 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle size={16} /> Hands-on project link recorded!
                </div>
              )}

              <form onSubmit={handleSubmitProject} className="space-y-4">
                <input
                  type="url"
                  value={projectUrl}
                  onChange={e => setProjectUrl(e.target.value)}
                  placeholder="Simulation URL (Tinkercad, Wokwi) or Video demo link..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500"
                  required
                />
                <textarea
                  value={projectNotes}
                  onChange={e => setProjectNotes(e.target.value)}
                  placeholder="Notes on testing results and observations..."
                  rows={4}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-xl transition flex items-center gap-2 cursor-pointer"
                >
                  <UploadCloud size={14} /> Record Project
                </button>
              </form>
            </div>
          )}
        </main>
      </div>

      {/* ─── 3. STICKY BOTTOM NAVIGATION BAR ────────────────── */}
      <footer className="bg-slate-950 border-t border-slate-800 px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        {/* Previous Lesson */}
        {prevSession ? (
          <button
            onClick={() => onNavigateSession(prevSession.id)}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
          >
            <ChevronLeft size={14} />
            <span className="hidden sm:inline">Previous:</span> {prevSession.id}
          </button>
        ) : (
          <div />
        )}

        {/* Center Progress Indicator */}
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span>Session {sessionIndex + 1} of {COMPLETE_YARA_SESSIONS.length}</span>
          <span>•</span>
          <span className={completion?.isFullyCompleted ? 'text-emerald-400 font-bold' : 'text-amber-400'}>
            {completion?.isFullyCompleted ? '✓ Completed' : 'In Progress'}
          </span>
        </div>

        {/* Next Lesson */}
        {nextSession ? (
          <button
            onClick={() => onNavigateSession(nextSession.id)}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-xs font-black flex items-center gap-1.5 transition shadow-sm cursor-pointer"
          >
            <span>Next: {nextSession.id}</span>
            <ChevronRight size={14} />
          </button>
        ) : (
          <button
            onClick={() => setIsCertModalOpen(true)}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 text-xs font-black flex items-center gap-1.5 transition shadow-lg cursor-pointer"
          >
            <Award size={14} />
            <span>Finish & Claim Certificate</span>
          </button>
        )}
      </footer>

      {/* ─── 4. GREAT LEARNING CERTIFICATE MODAL ─────────────────────────────────── */}
      <GreatLearningCertificateModal
        isOpen={isCertModalOpen}
        onClose={() => {
          setIsCertModalOpen(false);
          loadSessionState();
          onRefreshProgress();
        }}
        userId={userId}
        userEmail={userEmail}
        defaultStudentName={studentName}
        courseId="robotics-foundation"
        courseTitle="YARA Robotics & Innovation Foundation Programme (Levels 0 — 8)"
        courseCategory="robotics"
      />

      {/* Admin Video Studio Modal */}
      {isAdmin && (
        <AdminSessionVideoModal
          sessionId={session.id}
          sessionTitle={session.title}
          isOpen={isAdminVideoModalOpen}
          onClose={() => setIsAdminVideoModalOpen(false)}
          onVideosUpdated={handleVideosUpdated}
        />
      )}

      {/* ─── 5. UNIVERSAL [NEED HELP?] MENTOR & TROUBLESHOOTING MODAL (Section 22 & 23) ─── */}
      {isNeedHelpModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-2xl w-full p-6 sm:p-8 text-white shadow-2xl relative animate-in fade-in zoom-in duration-200">
            {/* Close Button */}
            <button
              onClick={() => setIsNeedHelpModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition cursor-pointer"
            >
              <X size={18} />
            </button>

            {/* Modal Header */}
            <div className="flex items-start gap-3.5 mb-5">
              <div className="w-11 h-11 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 text-indigo-400 flex items-center justify-center shrink-0">
                <LifeBuoy size={22} />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-indigo-400">
                  Mentor & Faculty Support Hub
                </span>
                <h3 className="text-lg sm:text-xl font-black text-white">
                  Need Help with this Session?
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Get instant troubleshooting tips, ask clarification, or request dedicated mentor guidance.
                </p>
              </div>
            </div>

            {/* Automatically Attached Context Badge (Section 22 Requirement) */}
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-1 mb-5">
              <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <CheckCircle2 size={12} /> Auto-Attached Context
                </span>
                <span className="font-mono text-slate-500">{session.id}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-300 pt-1">
                <div>Course: <strong className="text-white">YARA Robotics Academy</strong></div>
                <div>Level: <strong className="text-white">Level {session.levelNumber} ({session.part})</strong></div>
                <div>Module: <strong className="text-white">{session.id} — {session.title}</strong></div>
                <div>Activity: <strong className="text-indigo-400 font-mono uppercase">{activeTab}</strong></div>
              </div>
            </div>

            {/* Category Navigation Tabs */}
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3 mb-5">
              <button
                type="button"
                onClick={() => setHelpCategory('troubleshooting')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  helpCategory === 'troubleshooting'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <Wrench size={13} />
                <span>Instant Troubleshooting</span>
              </button>
              <button
                type="button"
                onClick={() => setHelpCategory('mentor')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  helpCategory === 'mentor'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <Users size={13} />
                <span>Request Mentor Help</span>
              </button>
              <button
                type="button"
                onClick={() => setHelpCategory('faq')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  helpCategory === 'faq'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <AlertCircle size={13} />
                <span>Safety & Best Practices</span>
              </button>
            </div>

            {/* TAB 1: TROUBLESHOOTING */}
            {helpCategory === 'troubleshooting' && (
              <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                  <div className="font-bold text-amber-400 flex items-center gap-1.5">
                    <span>⚡ Power & Brownout Issues</span>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    If your Arduino or ESP32 resets when motors start, you have a brownout fault. DC motors and servos must be powered from a dedicated battery pack with a shared common GND.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                  <div className="font-bold text-blue-400 flex items-center gap-1.5">
                    <span>🔌 Breadboard & Loose Wiring</span>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    Over 80% of student hardware bugs are loose DuPont jumper wires or broken breadboard spring clips. Test continuity with your multimeter buzzer mode before rewriting code.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                  <div className="font-bold text-emerald-400 flex items-center gap-1.5">
                    <span>💻 Serial Monitor Baud Rate</span>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    Seeing strange reversed question marks () in the Serial console? Verify that the dropdown at the bottom right of the Serial Monitor matches the baud rate declared in `Serial.begin(...)`.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                  <div className="font-bold text-purple-400 flex items-center gap-1.5">
                    <span>⏱️ Timing & Non-Blocking State Machines</span>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    Avoid using `delay(1000)` in obstacle avoidance and line tracking loops. Replace with `millis()` timestamps so your robot responds to obstacles instantaneously.
                  </p>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => setHelpCategory('mentor')}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition"
                  >
                    <span>Still Stuck? Contact a Mentor</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            )}

            {/* TAB 2: REQUEST MENTOR */}
            {helpCategory === 'mentor' && (
              <div>
                {helpSubmittedSuccess ? (
                  <div className="p-6 rounded-2xl bg-emerald-950/50 border border-emerald-500/50 text-center space-y-2">
                    <CheckCircle2 size={36} className="text-emerald-400 mx-auto" />
                    <h4 className="font-bold text-white text-base">Mentor Request Dispatched!</h4>
                    <p className="text-xs text-slate-300 max-w-md mx-auto">
                      Your inquiry and learning context have been routed to the approved YARA mentor directory. A mentor will contact you through the platform or WhatsApp.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmitMentorHelp} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        Select Mentor Expertise Specialization
                      </label>
                      <select
                        value={mentorDomain}
                        onChange={(e) => setMentorDomain(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                      >
                        <option value="Arduino & ESP32 Microcontrollers">Arduino & ESP32 Microcontrollers</option>
                        <option value="Electronics & Circuit Design">Electronics & Circuit Design</option>
                        <option value="Embedded C/C++ Firmware">Embedded C/C++ Firmware</option>
                        <option value="Motion Control & PID Tuning">Motion Control & PID Tuning</option>
                        <option value="Autonomous Navigation & Sensors">Autonomous Navigation & Sensors</option>
                        <option value="Mechanical CAD & 3D Fabrication">Mechanical CAD & 3D Fabrication</option>
                        <option value="Computer Vision & Edge AI">Computer Vision & Edge AI</option>
                        <option value="Competition Engineering (YARA 2026)">Competition Engineering (YARA 2026)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        Describe What You Need Help With
                      </label>
                      <textarea
                        rows={3}
                        required
                        value={helpQuestion}
                        onChange={(e) => setHelpQuestion(e.target.value)}
                        placeholder="e.g. My ultrasonic sensor readings jump to 0cm erratically when the DC motor turns on..."
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        WhatsApp Contact (Optional for faster response)
                      </label>
                      <input
                        type="text"
                        value={helpWhatsapp}
                        onChange={(e) => setHelpWhatsapp(e.target.value)}
                        placeholder="e.g. +263 77 123 4567"
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <span className="text-[11px] text-slate-400">
                        Context will be attached automatically.
                      </span>
                      <button
                        type="submit"
                        disabled={helpSubmitting}
                        className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition shadow-md disabled:opacity-50 cursor-pointer"
                      >
                        <Send size={13} />
                        <span>{helpSubmitting ? 'Submitting...' : 'Send to Approved Mentor'}</span>
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* TAB 3: SAFETY & WORKSHOP HABITS */}
            {helpCategory === 'faq' && (
              <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                  <div className="font-bold text-amber-400">⚠️ Workshop & Electrical Safety Rules</div>
                  <ul className="list-disc list-inside text-slate-300 text-[11px] space-y-1 mt-1">
                    <li>Always disconnect battery and USB cables before plugging or removing breadboard wires.</li>
                    <li>Double check electrolytic capacitor polarity (- sign corresponds to the shorter negative lead).</li>
                    <li>Never connect motor power rails directly to 5V Arduino regulator pin; it will thermal throttle or blow the onboard LDO.</li>
                    <li>Always use current-limiting resistors (220Ω – 1kΩ) in series with standard LEDs.</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
