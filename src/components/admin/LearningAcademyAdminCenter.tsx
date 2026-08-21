import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Video, 
  Film, 
  Award, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  Search, 
  Sliders, 
  ExternalLink, 
  Users, 
  Package, 
  Phone, 
  DollarSign, 
  ChevronDown, 
  ChevronUp, 
  AlertCircle,
  HelpCircle,
  FileText,
  Play,
  Save,
  Check,
  RefreshCw,
  Eye,
  ShieldCheck
} from 'lucide-react';
import { COMPLETE_YARA_SESSIONS, YARA_LEARNING_LEVELS, YARA_HARDWARE_KITS } from '../../constants/yaraLmsCatalog';
import { YARALmsSession, CapstoneProjectSubmission } from '../../types/yaraLms';
import { 
  getAllCapstoneSubmissions, 
  reviewCapstoneSubmission, 
  getSessionVideos,
  getAllUserCompletions
} from '../../services/yaraLmsService';
import { AdminSessionVideoModal } from '../lms/AdminSessionVideoModal';
import { supabase } from '../../lib/supabase';

interface Props {
  adminUserId: string;
}

const RUBRIC_CRITERIA = [
  { key: 'problemSignificance', label: '1. Problem Significance & 5 Whys Depth', max: 10 },
  { key: 'hardwareCircuitDesign', label: '2. Electrical Circuit & Power Design', max: 10 },
  { key: 'firmwareArchitecture', label: '3. Firmware Algorithms & Code Quality', max: 10 },
  { key: 'mechanicalExecution', label: '4. Mechanical Design & Stability', max: 10 },
  { key: 'prototypeVideoQuality', label: '5. Working Prototype Demonstration', max: 10 },
  { key: 'technicalReportQuality', label: '6. 21-Point Technical Report Rigor', max: 10 },
  { key: 'pitchPresentationQuality', label: '7. 90-Second Innovation Pitch', max: 10 },
  { key: 'economicFeasibility', label: '8. Unit Economics & BOM Optimization', max: 10 },
  { key: 'socialImpactInAfrica', label: '9. African Community Societal Impact', max: 10 },
  { key: 'stressTestingVerification', label: '10. Experimental Testing & Data', max: 10 },
  { key: 'innovationNovelty', label: '11. Innovation Novelty & Creativity', max: 10 },
  { key: 'defenseReadiness', label: '12. Project Defense Readiness', max: 10 }
];

export const LearningAcademyAdminCenter: React.FC<Props> = ({ adminUserId }) => {
  const [activeSection, setActiveSection] = useState<'curriculum' | 'capstones' | 'students' | 'kits' | 'certificates'>('curriculum');
  const [selectedLevel, setSelectedLevel] = useState<number | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null);

  // Video Management Studio Modal
  const [videoModalSession, setVideoModalSession] = useState<{ id: string; title: string } | null>(null);

  // Capstone review state
  const [submissions, setSubmissions] = useState<CapstoneProjectSubmission[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<CapstoneProjectSubmission | null>(null);
  const [rubricScores, setRubricScores] = useState<Record<string, number>>({});
  const [feedback, setFeedback] = useState('');
  const [reviewStatus, setReviewStatus] = useState<'approved' | 'revision_requested' | 'rejected'>('approved');
  const [savingReview, setSavingReview] = useState(false);

  // Students Progress state
  const [students, setStudents] = useState<any[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);

  // Kits state
  const [kits, setKits] = useState(YARA_HARDWARE_KITS);
  const [kitSavedNotice, setKitSavedNotice] = useState(false);

  // Feedback notification banner
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadSubmissions();
    loadStudents();
  }, []);

  const loadSubmissions = () => {
    const list = getAllCapstoneSubmissions();
    setSubmissions(list);
  };

  const loadStudents = async () => {
    setLoadingStudents(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, display_name, email, member_id, role, created_at')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setStudents(data);
      }
    } catch (e) {
      console.error('Error loading students:', e);
    } finally {
      setLoadingStudents(false);
    }
  };

  const showNotification = (type: 'success' | 'error', text: string) => {
    setNotification({ type, text });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleSelectSubmission = (sub: CapstoneProjectSubmission) => {
    setSelectedSubmission(sub);
    setReviewStatus(sub.status === 'approved' ? 'approved' : 'approved');
    setFeedback(sub.instructorFeedback || '');

    const initialScores: Record<string, number> = {};
    RUBRIC_CRITERIA.forEach(c => {
      initialScores[c.key] = sub.rubricScores?.[c.key as keyof typeof sub.rubricScores] || 8;
    });
    setRubricScores(initialScores);
  };

  const calculateTotalScore = () => {
    const total = (Object.values(rubricScores) as number[]).reduce((a: number, b: number) => a + (Number(b) || 0), 0);
    return Math.round((total / 120) * 100);
  };

  const handleSaveReview = async () => {
    if (!selectedSubmission) return;
    setSavingReview(true);
    try {
      await reviewCapstoneSubmission(
        selectedSubmission.id,
        reviewStatus,
        rubricScores as any,
        feedback,
        adminUserId
      );
      loadSubmissions();
      showNotification('success', `Capstone review for "${selectedSubmission.title}" saved successfully!`);
      setSelectedSubmission(null);
    } catch (e) {
      console.error('Review error:', e);
      showNotification('error', 'Failed to save review.');
    } finally {
      setSavingReview(false);
    }
  };

  // Filtered Sessions
  const filteredSessions = COMPLETE_YARA_SESSIONS.filter(session => {
    const matchesLevel = selectedLevel === 'all' || session.levelNumber === selectedLevel;
    const matchesQuery = 
      session.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.part.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.learningObjective.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesLevel && matchesQuery;
  });

  // Calculate high-level stats for summary cards
  const totalSessionsCount = COMPLETE_YARA_SESSIONS.length;
  const pendingCapstonesCount = submissions.filter(s => s.status === 'submitted' || s.status === 'under_review').length;
  const approvedCapstonesCount = submissions.filter(s => s.status === 'approved').length;

  return (
    <div className="space-y-8">
      {/* Top Banner: Easy Layman-Friendly Introduction */}
      <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-slate-900 rounded-[2.5rem] p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Central Learning & LMS Management Hub</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-black tracking-tight text-white">
              YARA Learning Academy Administration
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl mt-1 leading-relaxed">
              Complete control center for managing robotics courses, micro-lesson video clips (upload, replace, reorder), 
              evaluating capstone project submissions with the 12-criterion rubric, and tracking learner progress.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <a
              href="/lms"
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-2 backdrop-blur-sm transition border border-white/10"
              title="Open LMS in a new student tab"
            >
              <Eye className="w-4 h-4" />
              <span>Open Student LMS View</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-70" />
            </a>
          </div>
        </div>

        {/* 4 Stat Overview Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-white/10">
          <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider">Courses</span>
              <BookOpen className="w-4 h-4 text-indigo-400" />
            </div>
            <p className="text-2xl font-black text-white">{totalSessionsCount}</p>
            <p className="text-[11px] text-indigo-300 mt-0.5">Across 3 Core Levels</p>
          </div>

          <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider">Capstones</span>
              <Award className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-2xl font-black text-emerald-400">{submissions.length}</p>
            <p className="text-[11px] text-slate-300 mt-0.5">{pendingCapstonesCount} pending grading</p>
          </div>

          <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider">Graduates</span>
              <ShieldCheck className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-2xl font-black text-amber-400">{approvedCapstonesCount}</p>
            <p className="text-[11px] text-slate-300 mt-0.5">Certified innovators</p>
          </div>

          <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider">Starter Kits</span>
              <Package className="w-4 h-4 text-sky-400" />
            </div>
            <p className="text-2xl font-black text-sky-400">{kits.length}</p>
            <p className="text-[11px] text-slate-300 mt-0.5">Hardware packages active</p>
          </div>
        </div>
      </div>

      {/* Feedback Banner */}
      {notification && (
        <div className={`p-4 rounded-2xl flex items-center gap-3 font-bold text-sm ${
          notification.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {notification.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <AlertCircle className="w-5 h-5 text-red-600" />}
          <span>{notification.text}</span>
        </div>
      )}

      {/* Sub-Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 bg-slate-100 p-2 rounded-2xl border border-slate-200">
        <button
          onClick={() => setActiveSection('curriculum')}
          className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition ${
            activeSection === 'curriculum'
              ? 'bg-white text-indigo-600 shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
          }`}
        >
          <BookOpen className="w-4 h-4 text-indigo-600" />
          <span>1. Curriculum & Course Videos</span>
        </button>

        <button
          onClick={() => setActiveSection('capstones')}
          className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition ${
            activeSection === 'capstones'
              ? 'bg-white text-emerald-600 shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
          }`}
        >
          <Award className="w-4 h-4 text-emerald-600" />
          <span>2. Capstone Grading Queue</span>
          {pendingCapstonesCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[11px] font-black">
              {pendingCapstonesCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveSection('students')}
          className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition ${
            activeSection === 'students'
              ? 'bg-white text-indigo-600 shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
          }`}
        >
          <Users className="w-4 h-4 text-indigo-600" />
          <span>3. Learner Progress & Rosters</span>
        </button>

        <button
          onClick={() => setActiveSection('kits')}
          className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition ${
            activeSection === 'kits'
              ? 'bg-white text-sky-600 shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
          }`}
        >
          <Package className="w-4 h-4 text-sky-600" />
          <span>4. Starter Kits & Hardware Store</span>
        </button>
      </div>

      {/* SECTION 1: CURRICULUM & VIDEO STUDIO */}
      {activeSection === 'curriculum' && (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            {/* Level Selector */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-bold text-slate-500 mr-1">Level:</span>
              <button
                onClick={() => setSelectedLevel('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  selectedLevel === 'all'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All Levels ({COMPLETE_YARA_SESSIONS.length})
              </button>
              {YARA_LEARNING_LEVELS.map(lvl => (
                <button
                  key={lvl.levelNumber}
                  onClick={() => setSelectedLevel(lvl.levelNumber)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    selectedLevel === lvl.levelNumber
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Level {lvl.levelNumber}: {lvl.title.split(':')[0]}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search session title, ID, topic..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Sessions List */}
          <div className="space-y-4">
            {filteredSessions.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 text-slate-500">
                <AlertCircle className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                <p className="font-bold">No sessions found matching your filter.</p>
              </div>
            ) : (
              filteredSessions.map((session) => {
                const isExpanded = expandedSessionId === session.id;
                const clips = getSessionVideos(session.id);
                const quizCount = session.quizQuestions?.length || 0;

                return (
                  <div
                    key={session.id}
                    className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition overflow-hidden"
                  >
                    <div className="p-6">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 font-mono text-xs font-black rounded-lg border border-indigo-100">
                              {session.id}
                            </span>
                            <span className="px-2.5 py-1 bg-slate-100 text-slate-700 text-xs font-bold rounded-lg">
                              Level {session.levelNumber}
                            </span>
                            <span className="px-2.5 py-1 bg-amber-50 text-amber-700 text-xs font-bold rounded-lg">
                              {session.part}
                            </span>
                            <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-lg uppercase">
                              {session.type}
                            </span>
                          </div>

                          <h3 className="text-base font-bold text-slate-900">
                            {session.title}
                          </h3>
                          <p className="text-xs text-slate-500 line-clamp-2">
                            {session.subtitle}
                          </p>

                          <div className="flex items-center gap-4 text-xs text-slate-500 pt-1 flex-wrap">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-slate-400" />
                              Duration: <strong>{session.durationMinutes} mins</strong>
                            </span>
                            <span className="flex items-center gap-1">
                              <Film className="w-3.5 h-3.5 text-indigo-500" />
                              Video Micro-Lessons: <strong>{clips.length} clips</strong>
                            </span>
                            <span className="flex items-center gap-1">
                              <HelpCircle className="w-3.5 h-3.5 text-emerald-500" />
                              Quiz Questions: <strong>{quizCount} items</strong>
                            </span>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2 flex-wrap pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                          {/* Manage Videos Button */}
                          <button
                            onClick={() => setVideoModalSession({ id: session.id, title: session.title })}
                            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition"
                            title="Manage video clips, upload lessons, adjust duration"
                          >
                            <Film className="w-4 h-4" />
                            <span>Manage Course Videos ({clips.length})</span>
                          </button>

                          {/* Preview Button */}
                          <a
                            href={`/lms?session=${session.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
                            title="Preview this session in player"
                          >
                            <Play className="w-3.5 h-3.5 text-slate-600" />
                            <span>Preview</span>
                          </a>

                          {/* Expand Details */}
                          <button
                            onClick={() => setExpandedSessionId(isExpanded ? null : session.id)}
                            className="p-2.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition"
                            title="View full details"
                          >
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      {/* Expanded View */}
                      {isExpanded && (
                        <div className="mt-6 pt-6 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                          {/* Left: Video Clips list */}
                          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3">
                            <div className="flex items-center justify-between font-bold text-slate-900">
                              <span className="flex items-center gap-1.5 text-indigo-700">
                                <Film className="w-4 h-4" />
                                Configured Micro-Lessons ({clips.length})
                              </span>
                              <button
                                onClick={() => setVideoModalSession({ id: session.id, title: session.title })}
                                className="text-[11px] text-indigo-600 hover:underline font-bold"
                              >
                                Edit Clips →
                              </button>
                            </div>
                            <div className="space-y-2">
                              {clips.map((clip, idx) => (
                                <div key={clip.id} className="p-2.5 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
                                  <div className="truncate pr-2">
                                    <span className="font-bold text-slate-900">{idx + 1}. {clip.title}</span>
                                    <span className="block text-[10px] text-slate-500 uppercase">{clip.clipType} • {Math.floor(clip.durationSeconds / 60)}m {clip.durationSeconds % 60}s</span>
                                  </div>
                                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 font-mono text-slate-600 truncate max-w-[120px]">
                                    {clip.videoUrl.slice(0, 20)}...
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Right: Quiz & Objectives */}
                          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3">
                            <span className="font-bold text-slate-900 flex items-center gap-1.5 text-emerald-700">
                              <HelpCircle className="w-4 h-4" />
                              Learning Objectives & Rubric
                            </span>
                            <div className="space-y-2 text-slate-600 leading-relaxed">
                              <p><strong>Learning Objective:</strong> {session.learningObjective}</p>
                              <p><strong>What You Build:</strong> {session.whatYouWillBuild}</p>
                              {session.assignment && (
                                <p><strong>Assignment:</strong> {session.assignment.title}</p>
                              )}
                              {session.miniProject && (
                                <p><strong>Mini Project:</strong> {session.miniProject.title}</p>
                              )}
                              <p><strong>Total Quiz Questions:</strong> {quizCount} questions configured.</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* SECTION 2: CAPSTONE GRADING QUEUE */}
      {activeSection === 'capstones' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Submissions List */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Award className="w-4 h-4 text-emerald-600" />
                  <span>Capstone Submissions</span>
                </h3>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold">
                  {submissions.length} Total
                </span>
              </div>

              {submissions.length === 0 ? (
                <div className="text-center py-12 text-xs text-slate-400">
                  No student capstones currently submitted.
                </div>
              ) : (
                <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                  {submissions.map(sub => (
                    <button
                      key={sub.id}
                      onClick={() => handleSelectSubmission(sub)}
                      className={`w-full text-left p-4 rounded-2xl border transition ${
                        selectedSubmission?.id === sub.id
                          ? 'bg-emerald-50 border-emerald-400 shadow-sm'
                          : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-indigo-100 text-indigo-800">
                          {sub.thematicArea}
                        </span>
                        <span className={`text-[10px] font-black uppercase ${
                          sub.status === 'approved' ? 'text-emerald-700' : 'text-amber-700'
                        }`}>
                          {sub.status}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{sub.title}</h4>
                      <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
                        <span>{sub.studentName}</span>
                        <span>{new Date(sub.submittedAt).toLocaleDateString()}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Rubric Evaluation Form */}
            <div className="lg:col-span-2">
              {selectedSubmission ? (
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
                  {/* Submission Header */}
                  <div className="border-b border-slate-100 pb-5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                        {selectedSubmission.thematicArea} • Student: {selectedSubmission.studentName}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">ID: {selectedSubmission.id}</span>
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 mt-1">{selectedSubmission.title}</h2>
                    <p className="text-xs text-slate-600 mt-2 leading-relaxed">{selectedSubmission.problemStatement}</p>

                    {/* Deliverables Links */}
                    <div className="flex items-center gap-2 flex-wrap mt-4">
                      {selectedSubmission.prototypeVideoUrl && (
                        <a
                          href={selectedSubmission.prototypeVideoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center gap-1.5 transition"
                        >
                          <Video className="w-3.5 h-3.5 text-emerald-600" /> Prototype Video <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                      {selectedSubmission.pitchVideoUrl && (
                        <a
                          href={selectedSubmission.pitchVideoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-xs font-semibold text-amber-800 flex items-center gap-1.5 transition"
                        >
                          <Video className="w-3.5 h-3.5 text-amber-600" /> 90s Pitch <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                      {selectedSubmission.technicalReportPdfUrl && (
                        <a
                          href={selectedSubmission.technicalReportPdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 rounded-xl bg-sky-50 hover:bg-sky-100 border border-sky-200 text-xs font-semibold text-sky-800 flex items-center gap-1.5 transition"
                        >
                          <FileText className="w-3.5 h-3.5 text-sky-600" /> 21-Point Report <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                      {selectedSubmission.softwareRepoUrl && (
                        <a
                          href={selectedSubmission.softwareRepoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-xs font-semibold text-purple-800 flex items-center gap-1.5 transition"
                        >
                          <BookOpen className="w-3.5 h-3.5 text-purple-600" /> Source Code <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>

                  {/* 12-Criterion Rubric */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <Sliders className="w-4 h-4 text-emerald-600" /> 12-Criterion Rubric (120 Points Max)
                      </h3>
                      <div className="text-right">
                        <span className="text-xs text-slate-500">Calculated Score: </span>
                        <span className="text-lg font-black text-emerald-700">{calculateTotalScore()}%</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {RUBRIC_CRITERIA.map(crit => (
                        <div key={crit.key} className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-1.5">
                          <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                            <span className="truncate pr-2">{crit.label}</span>
                            <span className="text-emerald-700 font-bold font-mono">{rubricScores[crit.key] || 0}/10</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="10"
                            step="1"
                            value={rubricScores[crit.key] || 0}
                            onChange={e => setRubricScores({ ...rubricScores, [crit.key]: Number(e.target.value) })}
                            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Feedback & Status Controls */}
                  <div className="space-y-4 pt-4 border-t border-slate-100">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Instructor Evaluation Feedback & Recommendations:
                      </label>
                      <textarea
                        value={feedback}
                        onChange={e => setFeedback(e.target.value)}
                        placeholder="Provide detailed feedback on hardware assembly, firmware algorithms, and societal impact..."
                        rows={4}
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 leading-relaxed"
                      />
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <select
                          value={reviewStatus}
                          onChange={e => setReviewStatus(e.target.value as any)}
                          className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none"
                        >
                          <option value="approved">Approved (Issue Certificate)</option>
                          <option value="revision_requested">Revision Requested</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      </div>

                      <button
                        onClick={handleSaveReview}
                        disabled={savingReview}
                        className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition"
                      >
                        <Save className="w-4 h-4" />
                        <span>{savingReview ? 'Saving...' : 'Finalize & Save Review'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-3xl p-12 border border-slate-200 text-center text-slate-400">
                  <Award className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                  <p className="font-bold text-slate-700">No project selected</p>
                  <p className="text-xs text-slate-500 mt-1">Select a student submission from the left queue to review.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: STUDENTS PROGRESS ROSTER */}
      {activeSection === 'students' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">Registered Students & Learning Progression</h3>
              <p className="text-xs text-slate-500">Track student course completions, quiz passing scores, and capstone status.</p>
            </div>
            <button
              onClick={loadStudents}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-2 w-fit"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh Roster</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Member ID</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">LMS Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loadingStudents ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">Loading student list...</td>
                  </tr>
                ) : students.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">No registered students found.</td>
                  </tr>
                ) : (
                  students.map(std => (
                    <tr key={std.id} className="hover:bg-slate-50/50">
                      <td className="py-3.5 px-4 font-bold text-slate-900">{std.display_name || 'Innovator'}</td>
                      <td className="py-3.5 px-4 text-slate-600">{std.email}</td>
                      <td className="py-3.5 px-4 font-mono font-bold text-indigo-600">
                        {std.member_id || <span className="text-slate-400 italic">None</span>}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold capitalize">
                          {std.role || 'innovator'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <a
                          href={`/lms`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-600 hover:text-indigo-800 font-bold inline-flex items-center gap-1"
                        >
                          <span>Open Profile</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SECTION 4: HARDWARE KITS & STORE MANAGER */}
      {activeSection === 'kits' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">Robotics Starter Kits & Equipment Store</h3>
                <p className="text-xs text-slate-500">Configure prices, in-stock status, and WhatsApp phone inquiries.</p>
              </div>
              <div className="text-xs text-slate-600 flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-600" />
                <span>Default Hotline: <strong>0717468236</strong></span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {kits.map((kit, index) => (
                <div key={kit.id} className="bg-slate-50 rounded-2xl border border-slate-200 p-5 space-y-4">
                  <div className="w-full h-36 rounded-xl overflow-hidden bg-slate-200">
                    <img src={kit.imageUrl} alt={kit.title} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-sky-100 text-sky-800">
                      Levels {kit.suitableLevels.join(', ')}
                    </span>
                    <h4 className="font-bold text-slate-900 text-sm mt-1">{kit.title}</h4>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">{kit.subtitle}</p>
                  </div>

                  <div className="space-y-3 pt-3 border-t border-slate-200">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700">Price (USD):</span>
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-bold text-slate-400">$</span>
                        <input
                          type="number"
                          value={kit.priceUsd}
                          onChange={e => {
                            const newKits = [...kits];
                            newKits[index].priceUsd = Number(e.target.value);
                            setKits(newKits);
                          }}
                          className="w-20 bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold text-slate-900 text-right"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700">Stock Status:</span>
                      <button
                        onClick={() => {
                          const newKits = [...kits];
                          newKits[index].inStock = !newKits[index].inStock;
                          setKits(newKits);
                        }}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                          kit.inStock ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {kit.inStock ? 'In Stock' : 'Out of Stock'}
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700">WhatsApp Inquiry:</span>
                      <input
                        type="text"
                        value={kit.contactInquiryPhone || '0717468236'}
                        onChange={e => {
                          const newKits = [...kits];
                          newKits[index].contactInquiryPhone = e.target.value;
                          setKits(newKits);
                        }}
                        className="w-28 bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold text-slate-900"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-4">
              <button
                onClick={() => {
                  setKitSavedNotice(true);
                  showNotification('success', 'Starter kit prices and inventory updated successfully!');
                  setTimeout(() => setKitSavedNotice(false), 3000);
                }}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs flex items-center gap-2 shadow-sm"
              >
                <Save className="w-4 h-4" />
                <span>{kitSavedNotice ? 'Saved!' : 'Save Store Changes'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Session Video Modal Studio */}
      {videoModalSession && (
        <AdminSessionVideoModal
          sessionId={videoModalSession.id}
          sessionTitle={videoModalSession.title}
          isOpen={true}
          onClose={() => setVideoModalSession(null)}
          onVideosUpdated={() => {
            showNotification('success', 'Video micro-lessons updated successfully!');
          }}
        />
      )}
    </div>
  );
};
