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
  Package,
  Wrench,
  Settings,
  Film,
  SkipForward,
  SkipBack,
  ListVideo,
  Zap,
  Layers
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
  updateClipWatchProgress
} from '../../services/yaraLmsService';
import { useAuth } from '../AuthContext';
import { AdminSessionVideoModal } from './AdminSessionVideoModal';

interface Props {
  session: YARALmsSession;
  userId: string;
  onBack: () => void;
  onNavigateSession: (sessionId: string) => void;
  onRefreshProgress: () => void;
}

export const YaraLmsSessionPlayer: React.FC<Props> = ({
  session,
  userId,
  onBack,
  onNavigateSession,
  onRefreshProgress
}) => {
  const { profile } = useAuth();
  const isAdmin = profile?.role === 'admin';

  const [activeTab, setActiveTab] = useState<'video' | 'reading' | 'quiz' | 'assignment' | 'project' | 'components'>('video');
  const [completion, setCompletion] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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

  // Prerequisites
  const { isUnlocked, missingPrerequisites } = checkSessionPrerequisites(userId, session.id);

  useEffect(() => {
    loadSessionState();
  }, [session.id, userId]);

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

          // Update segment
          const segStart = segmentStartRef.current;
          const currentSegments: [number, number][] = [...watchedSegmentsRef.current, [segStart, next]];

          if (pct >= 85) {
            // Mark this individual clip complete
            updateClipWatchProgress(userId, session.id, activeClip.id, next, totalDur);
            setClipCompletedMap(prevMap => ({ ...prevMap, [activeClip.id]: true }));

            // Check if all clips are now done
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

    // Check if all are complete
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
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                {p}
              </li>
            ))}
          </ul>
        </div>
        <button
          onClick={onBack}
          className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-sm font-semibold rounded-xl transition"
        >
          Back to Curriculum
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header & Navigation */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition mb-2"
          >
            <ArrowLeft size={14} /> Back to Learning Pathway
          </button>
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              {session.id} • Level {session.levelNumber}
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
              {session.part}
            </span>
            <span className="flex items-center gap-1 text-[11px] text-slate-400">
              <Clock size={12} /> {session.durationMinutes} mins
            </span>
            <span className="px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[10px] font-semibold flex items-center gap-1">
              <Film size={10} /> {videoClips.length} Micro-Lessons (&le;7m each)
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white mt-1.5">{session.title}</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">{session.subtitle}</p>
        </div>

        {/* Completion Badge & Admin Quick Actions */}
        <div className="flex items-center gap-3 self-stretch sm:self-auto justify-between sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-800">
          {isAdmin && (
            <button
              onClick={() => setIsAdminVideoModalOpen(true)}
              className="px-3 py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-bold flex items-center gap-1.5 transition"
              title="Admin Video Studio: Upload or edit videos for this course"
            >
              <Film size={14} className="text-indigo-400" />
              Manage Course Videos
            </button>
          )}

          <div className="text-right">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Status</div>
            <div className={`text-xs font-bold flex items-center gap-1.5 ${completion?.isFullyCompleted ? 'text-emerald-400' : 'text-amber-400'}`}>
              {completion?.isFullyCompleted ? (
                <>
                  <CheckCircle size={14} /> Completed
                </>
              ) : (
                <>
                  <Clock size={14} /> In Progress
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800 no-scrollbar">
        {videoClips.length > 0 && (
          <button
            onClick={() => setActiveTab('video')}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition ${
              activeTab === 'video'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20 font-bold'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <ListVideo size={14} /> Micro-Lessons ({videoClips.length}) {isVideoDone && <Check size={12} className="text-emerald-950 font-bold" />}
          </button>
        )}

        <button
          onClick={() => setActiveTab('reading')}
          className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition ${
            activeTab === 'reading'
              ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
              : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
          }`}
        >
          <BookOpen size={14} /> Technical Guide
        </button>

        {session.hasPhysicalComponents && (
          <button
            onClick={() => setActiveTab('components')}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition ${
              activeTab === 'components'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <Package size={14} /> Hardware Components
          </button>
        )}

        {session.quizQuestions && session.quizQuestions.length > 0 && (
          <button
            onClick={() => setActiveTab('quiz')}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition ${
              activeTab === 'quiz'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <HelpCircle size={14} /> Knowledge Quiz {completion?.quizPassed && <Check size={12} className="text-emerald-950 font-bold" />}
          </button>
        )}

        {session.assignment && (
          <button
            onClick={() => setActiveTab('assignment')}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition ${
              activeTab === 'assignment'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <FileText size={14} /> Assignment {completion?.assignmentSubmitted && <Check size={12} className="text-emerald-950 font-bold" />}
          </button>
        )}

        {session.miniProject && (
          <button
            onClick={() => setActiveTab('project')}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition ${
              activeTab === 'project'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <Cpu size={14} /> Hands-on Project {completion?.miniProjectSubmitted && <Check size={12} className="text-emerald-950 font-bold" />}
          </button>
        )}
      </div>

      {/* TAB CONTENT: BITE-SIZED VIDEO MICRO-LESSONS (MAX 7 MIN EACH) */}
      {activeTab === 'video' && videoClips.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Main Player Area (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl relative">
              
              {/* Micro-Lesson Header Banner */}
              <div className="px-5 py-3 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-xs flex items-center justify-center">
                    {activeClipIndex + 1}
                  </span>
                  <div>
                    <h3 className="text-xs font-bold text-white line-clamp-1">
                      {activeClip?.title || 'Course Micro-Lesson'}
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

              {/* Video Embed Player */}
              <div className="aspect-video w-full bg-slate-950 relative">
                {activeClip?.videoUrl?.includes('youtube.com') || activeClip?.videoUrl?.includes('youtu.be') ? (
                  <iframe
                    src={activeClip.videoUrl.replace('watch?v=', 'embed/').replace('youtu.be/', 'www.youtube.com/embed/')}
                    title={activeClip?.title || session.title}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                ) : (
                  <video
                    src={activeClip?.videoUrl}
                    controls
                    className="w-full h-full object-contain"
                  ></video>
                )}
              </div>

              {/* Anti-Cheat & Micro-Lesson Watch Progress */}
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
                    ></div>
                  </div>
                </div>

                {/* Control Actions */}
                <div className="flex items-center gap-2 flex-wrap justify-end">
                  {!videoTimerRunning ? (
                    <button
                      onClick={handleStartWatching}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-sm"
                    >
                      <Play size={13} /> Log Watch Time
                    </button>
                  ) : (
                    <button
                      onClick={handlePauseWatching}
                      className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-bold rounded-xl transition flex items-center gap-1.5"
                    >
                      <Clock size={13} /> Pause Logger
                    </button>
                  )}

                  <button
                    onClick={handleMarkClipComplete}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition flex items-center gap-1"
                    title="Mark this micro-lesson as watched"
                  >
                    <Check size={13} className="text-emerald-400" /> Complete Clip
                  </button>

                  {activeClipIndex < videoClips.length - 1 && (
                    <button
                      onClick={handleNextClip}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition flex items-center gap-1"
                    >
                      Next <ChevronRight size={13} />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Micro-Lesson Description & Objectives */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  Micro-Lesson Takeaway
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

          {/* Micro-Lessons Playlist & Course Info Sidebar (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            
            {/* Modular Playlist */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <ListVideo size={14} className="text-emerald-400" />
                  Course Micro-Lessons
                </h3>
                <span className="text-[10px] font-bold text-slate-400">
                  {videoClips.filter(c => clipCompletedMap[c.id]).length}/{videoClips.length} Completed
                </span>
              </div>

              {/* Admin Manage Videos Action */}
              {isAdmin && (
                <button
                  onClick={() => setIsAdminVideoModalOpen(true)}
                  className="w-full py-2 px-3 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 text-xs font-bold flex items-center justify-center gap-1.5 transition"
                >
                  <Film size={13} /> Manage / Upload Course Videos
                </button>
              )}

              {/* Clip Items List */}
              <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                {videoClips.map((clip, idx) => {
                  const isActive = idx === activeClipIndex;
                  const isDone = clipCompletedMap[clip.id];

                  return (
                    <button
                      key={clip.id}
                      onClick={() => setActiveClipIndex(idx)}
                      className={`w-full text-left p-3 rounded-xl border transition flex items-start justify-between gap-2.5 ${
                        isActive
                          ? 'bg-emerald-950/40 border-emerald-500/60 shadow-sm'
                          : isDone
                          ? 'bg-slate-950/40 border-slate-800/80 hover:border-slate-700'
                          : 'bg-slate-950/70 border-slate-800/60 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-start gap-2.5 flex-1 min-w-0">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold mt-0.5 ${
                          isDone 
                            ? 'bg-emerald-500 text-slate-950' 
                            : isActive 
                            ? 'bg-emerald-400/20 text-emerald-300 border border-emerald-400/30' 
                            : 'bg-slate-800 text-slate-400'
                        }`}>
                          {isDone ? <Check size={11} className="stroke-[3]" /> : idx + 1}
                        </div>

                        <div className="min-w-0 flex-1">
                          <h4 className={`text-xs font-semibold leading-tight line-clamp-2 ${
                            isActive ? 'text-emerald-300 font-bold' : 'text-slate-200'
                          }`}>
                            {clip.title}
                          </h4>
                          <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400">
                            <span className="flex items-center gap-1 font-mono text-emerald-400/90">
                              <Clock size={10} /> {formatSecs(clip.durationSeconds)}
                            </span>
                            <span className="capitalize text-slate-400">
                              {clip.clipType || 'Lesson'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {isActive && (
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 flex-shrink-0 animate-pulse"></div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Why Learn This & Resources Card */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-3">
              <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                <Award size={14} className="text-emerald-400" /> Engineering Impact
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">{session.whyLearnThis}</p>

              {session.resources && session.resources.length > 0 && (
                <div className="border-t border-slate-800 pt-3 space-y-2">
                  <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Official Documentation & Circuit Diagrams
                  </h4>
                  {session.resources.map((res, i) => (
                    <a
                      key={i}
                      href={res.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 flex items-center justify-between text-xs text-slate-300 transition group"
                    >
                      <span className="font-medium group-hover:text-emerald-400 truncate max-w-[200px] text-[11px]">{res.title}</span>
                      <ExternalLink size={11} className="text-slate-500 group-hover:text-emerald-400 flex-shrink-0" />
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: READING / GUIDE */}
      {activeTab === 'reading' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-4xl mx-auto space-y-6 text-slate-200">
          <div className="border-b border-slate-800 pb-4">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Technical Reading</span>
            <h2 className="text-2xl font-bold text-white mt-1">{session.title}</h2>
          </div>

          <div className="prose prose-invert prose-emerald max-w-none text-sm sm:text-base leading-relaxed space-y-4">
            <div className="whitespace-pre-line font-sans text-slate-300">
              {session.reading_markdown}
            </div>
          </div>

          <div className="bg-emerald-950/20 border border-emerald-500/20 rounded-2xl p-5 mt-8 flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-emerald-400">Completed the reading?</h4>
              <p className="text-xs text-slate-400 mt-0.5">Test your understanding in the knowledge quiz.</p>
            </div>
            {session.quizQuestions && session.quizQuestions.length > 0 && (
              <button
                onClick={() => setActiveTab('quiz')}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-xl transition"
              >
                Take Quiz →
              </button>
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT: HARDWARE COMPONENTS */}
      {activeTab === 'components' && session.componentsRequired && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-4xl mx-auto space-y-6">
          <div>
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Lab Hardware Checklist</span>
            <h2 className="text-xl font-bold text-white mt-1">Physical Components for this Session</h2>
            <p className="text-xs text-slate-400 mt-1">
              Verify you have the following components from your YARA Robotics Starter Kit before beginning physical assembly.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {session.componentsRequired.map((comp, idx) => (
              <div key={idx} className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 flex-shrink-0">
                  <Wrench size={18} />
                </div>
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    {comp.name}
                    {comp.inStarterKit && (
                      <span className="px-1.5 py-0.2 rounded text-[10px] bg-emerald-500/20 text-emerald-300">In Starter Kit</span>
                    )}
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">Qty: {comp.quantity} • Purpose: {comp.purpose}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: RANDOMIZED QUIZ */}
      {activeTab === 'quiz' && quizData && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-3xl mx-auto space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Server-Validated Exam</span>
              <h2 className="text-xl font-bold text-white mt-1">Knowledge Assessment</h2>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400 block">Passing Threshold</span>
              <span className="text-sm font-bold text-emerald-400">{quizData.passingScore}%</span>
            </div>
          </div>

          {/* Quiz Result Banner */}
          {quizSubmitted && quizResult && (
            <div className={`p-5 rounded-2xl border ${quizResult.passed ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300' : 'bg-red-950/30 border-red-500/40 text-red-300'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold flex items-center gap-2">
                    {quizResult.passed ? <CheckCircle size={20} className="text-emerald-400" /> : <AlertTriangle size={20} className="text-red-400" />}
                    {quizResult.passed ? 'Quiz Passed with Distinction!' : 'Quiz Not Passed'}
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
                    className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl transition"
                  >
                    Retake Quiz
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Question List */}
          <div className="space-y-6">
            {quizData.questions.map((q, qIndex) => {
              const resultFeedback = quizResult?.feedback?.find((f: any) => f.questionId === q.id);
              return (
                <div key={q.id} className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4">
                  <div className="text-xs font-semibold text-slate-400">
                    Question {qIndex + 1} of {quizData.questions.length}
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-white">{q.question}</h3>

                  <div className="space-y-2.5">
                    {q.options.map((opt, optIndex) => {
                      const isSelected = userAnswers[q.id] === optIndex;
                      let btnStyle = 'bg-slate-900 hover:bg-slate-850 text-slate-300 border-slate-800';

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
                          className={`w-full text-left p-3.5 rounded-xl border text-xs sm:text-sm transition flex items-center justify-between ${btnStyle}`}
                        >
                          <span>{opt}</span>
                          {isSelected && <Check size={14} className="text-emerald-400 flex-shrink-0" />}
                        </button>
                      );
                    })}
                  </div>

                  {quizSubmitted && resultFeedback && (
                    <div className="bg-slate-900/90 rounded-xl p-3.5 border border-slate-800 text-xs text-slate-300 mt-3">
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
                className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 text-xs font-bold rounded-xl shadow-lg transition"
              >
                {quizSubmitting ? 'Evaluating Submission...' : 'Submit Answers for Grading'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: ASSIGNMENT SUBMISSION */}
      {activeTab === 'assignment' && session.assignment && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-3xl mx-auto space-y-6">
          <div>
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Required Submission</span>
            <h2 className="text-xl font-bold text-white mt-1">{session.assignment.title}</h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-2">{session.assignment.description}</p>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4">
            <h4 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-2">Instructions</h4>
            <ul className="space-y-1 text-xs text-slate-300">
              {session.assignment.instructions.map((ins, i) => (
                <li key={i} className="flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-emerald-400"></span> {ins}
                </li>
              ))}
            </ul>
          </div>

          {assignmentSubmittedSuccess && (
            <div className="p-4 bg-emerald-950/40 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs font-semibold flex items-center gap-2">
              <CheckCircle size={16} /> Assignment successfully submitted and recorded to your learning portfolio!
            </div>
          )}

          <form onSubmit={handleSubmitAssignment} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Technical Write-up / Calculation / Code Text
              </label>
              <textarea
                value={assignmentText}
                onChange={e => setAssignmentText(e.target.value)}
                placeholder="Write or paste your detailed calculations, formulas, or written submission here..."
                rows={6}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500 font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Attachment / Google Drive / GitHub URL (Optional)
              </label>
              <input
                type="url"
                value={assignmentFileUrl}
                onChange={e => setAssignmentFileUrl(e.target.value)}
                placeholder="https://drive.google.com/... or https://github.com/..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <button
              type="submit"
              className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-xl transition flex items-center gap-2"
            >
              <UploadCloud size={14} /> Submit Assignment
            </button>
          </form>
        </div>
      )}

      {/* TAB CONTENT: HANDS-ON MINI PROJECT */}
      {activeTab === 'project' && session.miniProject && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-3xl mx-auto space-y-6">
          <div>
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Hands-on Mini Project</span>
            <h2 className="text-xl font-bold text-white mt-1">{session.miniProject.title}</h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-2">{session.miniProject.description}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4">
              <h4 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-2">Key Objectives</h4>
              <ul className="space-y-1 text-xs text-slate-300">
                {session.miniProject.objectives.map((obj, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-emerald-400"></span> {obj}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Simulation / Bench</h4>
              <p className="text-xs text-white font-medium">{session.miniProject.simulationPlatform || 'Tinkercad / Wokwi / Bench'}</p>
            </div>
          </div>

          {projectSubmittedSuccess && (
            <div className="p-4 bg-emerald-950/40 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs font-semibold flex items-center gap-2">
              <CheckCircle size={16} /> Hands-on project link recorded!
            </div>
          )}

          <form onSubmit={handleSubmitProject} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Simulation Link, Video Demo URL or GitHub Repo
              </label>
              <input
                type="url"
                value={projectUrl}
                onChange={e => setProjectUrl(e.target.value)}
                placeholder="https://www.tinkercad.com/things/... or https://wokwi.com/projects/..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Project Notes & Results Description
              </label>
              <textarea
                value={projectNotes}
                onChange={e => setProjectNotes(e.target.value)}
                placeholder="Describe how your circuit or code operated during testing..."
                rows={4}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <button
              type="submit"
              className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-xl transition flex items-center gap-2"
            >
              <UploadCloud size={14} /> Record Project Completion
            </button>
          </form>
        </div>
      )}

      {/* Admin Session Video Manager Studio Modal */}
      {isAdmin && (
        <AdminSessionVideoModal
          sessionId={session.id}
          sessionTitle={session.title}
          isOpen={isAdminVideoModalOpen}
          onClose={() => setIsAdminVideoModalOpen(false)}
          onVideosUpdated={handleVideosUpdated}
        />
      )}
    </div>
  );
};
