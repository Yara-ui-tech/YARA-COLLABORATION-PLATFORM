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
  Wrench
} from 'lucide-react';
import { YARALmsSession } from '../../types/yaraLms';
import { 
  getSessionCompletion, 
  updateVideoProgress, 
  generateRandomizedQuiz, 
  evaluateQuizSubmission,
  submitSessionAssignment,
  submitSessionMiniProject,
  checkSessionPrerequisites,
  RandomizedQuestionPayload
} from '../../services/yaraLmsService';

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
  const [activeTab, setActiveTab] = useState<'video' | 'reading' | 'quiz' | 'assignment' | 'project' | 'components'>('video');
  const [completion, setCompletion] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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
    setIsVideoDone(comp.videoCompleted || !session.video_url);
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

  // Video watch timer simulator / watcher
  useEffect(() => {
    let interval: any;
    if (videoTimerRunning && !isVideoDone) {
      interval = setInterval(() => {
        setWatchedSeconds(prev => {
          const next = prev + 1;
          const totalDur = session.video_duration_seconds || 600;
          const pct = Math.min(100, Math.round((next / totalDur) * 100));
          setWatchPercent(pct);

          // Update segment
          const segStart = segmentStartRef.current;
          const currentSegments: [number, number][] = [...watchedSegmentsRef.current, [segStart, next]];

          if (pct >= 85) {
            setIsVideoDone(true);
            updateVideoProgress(userId, session.id, next, totalDur, currentSegments).then(() => {
              onRefreshProgress();
            });
          }
          return next;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [videoTimerRunning, isVideoDone, session.id, session.video_duration_seconds, userId]);

  const handleStartWatching = () => {
    segmentStartRef.current = watchedSeconds;
    setVideoTimerRunning(true);
  };

  const handlePauseWatching = () => {
    setVideoTimerRunning(false);
    const totalDur = session.video_duration_seconds || 600;
    watchedSegmentsRef.current.push([segmentStartRef.current, watchedSeconds]);
    updateVideoProgress(userId, session.id, watchedSeconds, totalDur, watchedSegmentsRef.current);
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
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white mt-1.5">{session.title}</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">{session.subtitle}</p>
        </div>

        {/* Completion Badge */}
        <div className="flex items-center gap-3 self-stretch sm:self-auto justify-between sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-800">
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
        {session.video_url && (
          <button
            onClick={() => setActiveTab('video')}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition ${
              activeTab === 'video'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <Play size={14} /> Video Lesson {isVideoDone && <Check size={12} className="text-emerald-950 font-bold" />}
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

      {/* TAB CONTENT: VIDEO WITH ANTI-CHEAT */}
      {activeTab === 'video' && session.video_url && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl relative">
              <div className="aspect-video w-full bg-slate-950 relative">
                {/* Embed YouTube / MP4 */}
                <iframe
                  src={session.video_url.replace('watch?v=', 'embed/')}
                  title={session.title}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>

              {/* Anti-Cheat Progress Bar */}
              <div className="p-4 bg-slate-900/90 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="w-full sm:w-2/3">
                  <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                    <span className="text-slate-300 flex items-center gap-1.5">
                      <ShieldCheck size={14} className="text-emerald-400" /> Active Watch Validation
                    </span>
                    <span className={watchPercent >= 85 ? 'text-emerald-400' : 'text-amber-400'}>
                      {watchPercent}% watched {watchPercent >= 85 ? '(Verified)' : '(Minimum 85% required)'}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${watchPercent >= 85 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                      style={{ width: `${watchPercent}%` }}
                    ></div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {!videoTimerRunning ? (
                    <button
                      onClick={handleStartWatching}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-xs font-bold rounded-xl transition flex items-center gap-1.5"
                    >
                      <Play size={14} /> Log Watch Time
                    </button>
                  ) : (
                    <button
                      onClick={handlePauseWatching}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-bold rounded-xl transition flex items-center gap-1.5"
                    >
                      <Clock size={14} /> Pause Logger
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Session Objectives Banner */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider text-emerald-400">
                Learning Objective
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">{session.learningObjective}</p>
            </div>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-4">
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Award size={16} className="text-emerald-400" /> Why Learn This?
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">{session.whyLearnThis}</p>

              <div className="border-t border-slate-800 pt-3">
                <h4 className="text-xs font-semibold text-white mb-1">What You Will Build</h4>
                <p className="text-xs text-slate-400">{session.whatYouWillBuild}</p>
              </div>

              <div className="border-t border-slate-800 pt-3">
                <h4 className="text-xs font-semibold text-white mb-1">Innovator Contribution</h4>
                <p className="text-xs text-slate-400">{session.innovatorContribution}</p>
              </div>
            </div>

            {session.resources && session.resources.length > 0 && (
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-3">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Resources & Docs</h3>
                <div className="space-y-2">
                  {session.resources.map((res, i) => (
                    <a
                      key={i}
                      href={res.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 flex items-center justify-between text-xs text-slate-300 transition group"
                    >
                      <span className="font-medium group-hover:text-emerald-400 truncate max-w-[200px]">{res.title}</span>
                      <ExternalLink size={12} className="text-slate-500 group-hover:text-emerald-400 flex-shrink-0" />
                    </a>
                  ))}
                </div>
              </div>
            )}
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
    </div>
  );
};
