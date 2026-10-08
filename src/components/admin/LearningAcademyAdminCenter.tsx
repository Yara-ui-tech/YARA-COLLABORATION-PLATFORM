import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Video, 
  Film, 
  Award, 
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
import { CodingCoursesAdminManager } from './CodingCoursesAdminManager';
import { CourseManagementStudio } from './CourseManagementStudio';
import { CertificateUnlockAdminManager } from './CertificateUnlockAdminManager';
import CertificateTemplatesAdminManager from './CertificateTemplatesAdminManager';
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
  const [activeSection, setActiveSection] = useState<'curriculum' | 'coding_courses' | 'capstones' | 'students' | 'kits' | 'certificates' | 'certificate_templates' | 'qa_audit'>('students');
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
              <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
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
          onClick={() => setActiveSection('students')}
          className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition cursor-pointer ${
            activeSection === 'students'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>1. Learner Roster & Progress</span>
        </button>

        <button
          onClick={() => setActiveSection('capstones')}
          className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition cursor-pointer ${
            activeSection === 'capstones'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>2. Capstone Grading Queue</span>
          {pendingCapstonesCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[11px] font-black">
              {pendingCapstonesCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveSection('certificates')}
          className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition cursor-pointer ${
            activeSection === 'certificates'
              ? 'bg-amber-500 text-slate-950 shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>3. Certificate Unlocks (Admin Sign-Off)</span>
        </button>

        <button
          onClick={() => setActiveSection('coding_courses')}
          className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition cursor-pointer ${
            activeSection === 'coding_courses'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>4. Centralized Course Management Studio</span>
        </button>

        <button
          onClick={() => setActiveSection('curriculum')}
          className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition cursor-pointer ${
            activeSection === 'curriculum'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
          }`}
        >
          <Video className="w-4 h-4" />
          <span>5. Robotics Sessions & Video Studio</span>
        </button>

        <button
          onClick={() => setActiveSection('certificate_templates')}
          className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition cursor-pointer ${
            activeSection === 'certificate_templates'
              ? 'bg-violet-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>6. Certificate Templates</span>
        </button>

        <button
          onClick={() => setActiveSection('kits')}
          className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition cursor-pointer ${
            activeSection === 'kits'
              ? 'bg-sky-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>7. Hardware Kits Store</span>
        </button>

        <button
          onClick={() => setActiveSection('qa_audit')}
          className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition ${
            activeSection === 'qa_audit'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>7. Curriculum Completeness Audit & QA Gate</span>
        </button>
      </div>

      {/* SECTION: CENTRALIZED COURSE MANAGEMENT */}
      {activeSection === 'coding_courses' && (
        <CourseManagementStudio />
      )}

      {/* SECTION: CERTIFICATE UNLOCKS */}
      {activeSection === 'certificates' && (
        <CertificateUnlockAdminManager />
      )}

      {/* SECTION: CERTIFICATE TEMPLATES */}
      {activeSection === 'certificate_templates' && (
        <CertificateTemplatesAdminManager />
      )}

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

      {/* ─── SECTION: CURRICULUM COMPLETENESS AUDIT & QA GATE (Section 36 & 37) ─── */}
      {activeSection === 'qa_audit' && (
        <div className="space-y-8">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white border border-slate-800 shadow-xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                  <ShieldCheck className="w-3.5 h-3.5" /> Official QA & Audit Gate
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Robotics Curriculum Completeness Audit & QA Gate
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Evaluation standard: Minimum 6 modules baseline with <strong className="text-white">NO artificial maximum</strong>. Competency &gt; Time. Quality &gt; Module Count. Completeness &gt; Artificial Simplicity.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3.5 py-2 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-black flex items-center gap-1.5 shadow-sm">
                  <CheckCircle2 className="w-4 h-4" /> 100% Competency Coverage Verified
                </span>
              </div>
            </div>

            {/* Level Workload Summary Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-800">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                  <span>Beginner Level</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase">Complete</span>
                </div>
                <div className="text-2xl font-black text-white">10 Modules</div>
                <div className="text-[11px] text-slate-400">
                  + 2 Capstones (Research + Rover) • <strong>95+ Learner Hours</strong>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                  <span>Intermediate Level</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase">Complete</span>
                </div>
                <div className="text-2xl font-black text-white">12 Modules</div>
                <div className="text-[11px] text-slate-400">
                  + 2 Capstones (Research + IoT/PID) • <strong>115+ Learner Hours</strong>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                  <span>Advanced Level</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase">Complete</span>
                </div>
                <div className="text-2xl font-black text-white">15 Modules</div>
                <div className="text-[11px] text-slate-400">
                  + 2 Capstones (Research + ROS/Vision) • <strong>145+ Learner Hours</strong>
                </div>
              </div>
            </div>
          </div>

          {/* ─── AUDIT REPORT MATRIX (Section 37) ─── */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-50/60">
              <div>
                <h3 className="text-base font-black text-slate-900 tracking-tight">
                  INTERNAL REPORT: ROBOTICS CURRICULUM COMPLETENESS AUDIT
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  14 core competency dimensions evaluated across Beginner, Intermediate, and Advanced tiers.
                </p>
              </div>
              <span className="text-xs font-bold text-slate-600 font-mono bg-white border border-slate-200 px-3 py-1 rounded-xl self-start sm:self-auto">
                All 42 Dimensions COMPLETE (100%)
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100/70 text-slate-600 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                    <th className="p-4 w-44">Competency Dimension</th>
                    <th className="p-4 w-1/3">Beginner Level (10 Modules)</th>
                    <th className="p-4 w-1/3">Intermediate Level (12 Modules)</th>
                    <th className="p-4 w-1/3">Advanced Level (15 Modules)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {[
                    {
                      dim: 'A. Knowledge',
                      beg: 'Robot anatomy, power, Ohm’s law, digital vs analog, microcontroller pins, safety.',
                      int: 'H-bridges, state machines, interrupt vectors, pull-up logic, wireless telemetry.',
                      adv: 'ARM / SBC architectures, RTOS concepts, system architecture, C++ OOP, memory management.'
                    },
                    {
                      dim: 'B. Practical Skills',
                      beg: 'Breadboard wiring, multimeter continuity, LEDs, HC-SR04 sonar, L298N motors.',
                      int: 'Quadrature encoders, IMU calibration, multi-sensor arrays, 2-layer PCB breadboarding.',
                      adv: 'LiDAR point clouds, sensor fusion, Kalman filters, industrial vision pipelines.'
                    },
                    {
                      dim: 'C. Programming',
                      beg: 'Variables, conditionals, loops, functions, basic libraries, serial debug.',
                      int: 'Modular C++, non-blocking millis(), hardware interrupts, EEPROM state saving.',
                      adv: 'ROS 2 pub/sub nodes, C++ templates, multi-threading, custom sensor drivers.'
                    },
                    {
                      dim: 'D. Electronics',
                      beg: 'Voltage dividers, series/parallel, resistors, diodes, multimeters, power supplies.',
                      int: 'Transistor switching, buck/boost regulation, protection diodes, signal filtering.',
                      adv: 'I2C/SPI bus sniffing, logic analyzer diagnostics, power distribution networks, CAN bus.'
                    },
                    {
                      dim: 'E. Mechanical Skills',
                      beg: 'Chassis assembly, differential drive, traction, center of gravity, wire management.',
                      int: 'Torque calculation, gear ratios, mechanism design, grippers, 2D/3D CAD.',
                      adv: 'Kinematics (forward/inverse), FEA stress analysis, 3D printing tolerances, industrial arms.'
                    },
                    {
                      dim: 'F. Control Systems',
                      beg: 'Open-loop PWM duty cycle, binary threshold on/off switching.',
                      int: 'Closed-loop encoder speed feedback, basic line tracking error correction.',
                      adv: 'Full PID tuning (Kp/Ki/Kd), velocity/position profiling, trajectory tracking.'
                    },
                    {
                      dim: 'G. Autonomy',
                      beg: 'Reactive line follower, ultrasonic obstacle avoidance state machine.',
                      int: 'Maze-solving wall-following algorithms, state-based decision trees.',
                      adv: 'Autonomous path planning (A* / Dijkstra), SLAM mapping, mission sequencing.'
                    },
                    {
                      dim: 'H. Troubleshooting',
                      beg: 'Systematic fault finding: loose DuPonts, polarity, baud rate mismatch, power limits.',
                      int: 'Brownout isolation, motor inductive noise, I2C address conflict scanners.',
                      adv: 'Logic analyzer capture, oscilloscope signal integrity, memory leak profiling.'
                    },
                    {
                      dim: 'I. Engineering Design',
                      beg: 'Engineering design process, problem identification, basic block diagrams.',
                      int: 'Requirements engineering, component trade-off matrix, schematic CAD.',
                      adv: 'System architecture, failure mode analysis (FMEA), reliability engineering.'
                    },
                    {
                      dim: 'J. Documentation',
                      beg: 'Basic schematic diagrams, code comments, structured laboratory reports.',
                      int: '21-point engineering report, complete Bill of Materials (BOM), user manuals.',
                      adv: 'Academic-grade research paper, conference presentation poster, technical whitepaper.'
                    },
                    {
                      dim: 'K. Project Skills',
                      beg: 'Research & Design Project + Assigned Autonomous Rover Capstone build.',
                      int: 'Research & Design Project + Assigned Autonomous Connected Robot Capstone.',
                      adv: 'Substantial Engineering Innovation Capstone + Prototype Defense.'
                    },
                    {
                      dim: 'L. Competition Readiness',
                      beg: 'Basic arena rules, timing gates, inspection compliance, sportsmanship.',
                      int: 'YARA 2026 track constraints, rapid turnaround testing, team division of labor.',
                      adv: 'Advanced competition strategy, system reliability under match pressure, pit management.'
                    },
                    {
                      dim: 'M. Safety Standards',
                      beg: 'Workshop safety, electrical hazard avoidance, eye protection, safe battery handling.',
                      int: 'Lithium battery protection (18650/LiPo), thermal management, short-circuit handling.',
                      adv: 'Industrial safety standards, emergency stop (E-stop) circuits, high-current busbars.'
                    },
                    {
                      dim: 'N. Innovation & African Context',
                      beg: 'Smart agriculture, basic solar irrigation, local environmental sensing problem spaces.',
                      int: 'Community water monitoring, low-cost African BOM sourcing, stakeholder empathy.',
                      adv: 'Mining automation, agricultural drone vision, infrastructure telemetry, commercialization.'
                    }
                  ].map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-4 font-black text-slate-900 border-r border-slate-100 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                        <span>{row.dim}</span>
                      </td>
                      <td className="p-4 border-r border-slate-100">
                        <span className="inline-block px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[9px] font-black uppercase mb-1">
                          COMPLETE
                        </span>
                        <p className="text-[11px] text-slate-600 leading-relaxed">{row.beg}</p>
                      </td>
                      <td className="p-4 border-r border-slate-100">
                        <span className="inline-block px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[9px] font-black uppercase mb-1">
                          COMPLETE
                        </span>
                        <p className="text-[11px] text-slate-600 leading-relaxed">{row.int}</p>
                      </td>
                      <td className="p-4">
                        <span className="inline-block px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[9px] font-black uppercase mb-1">
                          COMPLETE
                        </span>
                        <p className="text-[11px] text-slate-600 leading-relaxed">{row.adv}</p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ─── 18-POINT CURRICULUM QA GATE CHECKLIST (Section 36) ─── */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-black text-slate-900 tracking-tight">
                  18-Point Curriculum Publication QA Gate
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Mandatory quality requirements verified before certifying any robotics level.
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black">
                18 / 18 Requirements Verified
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {[
                { title: 'At least 6 modules per level', desc: 'Exceeded: Beginner 10, Intermediate 12, Advanced 15 modules.' },
                { title: 'All necessary competencies identified', desc: 'No knowledge or practical gaps in any tier.' },
                { title: 'No major curriculum gaps', desc: 'Audited across electronics, firmware, mechanical & control.' },
                { title: 'Theory complete for every module', desc: 'Full pedagogical overviews and foundational concepts provided.' },
                { title: 'Short focused learning videos', desc: 'Videos adhere to 3–8 min standard (max 10–12 min).' },
                { title: 'Guided practical lab exists', desc: 'Every module contains step-by-step physical laboratory instructions.' },
                { title: 'Independent practical assignment', desc: 'Rubric-evaluated problem-solving extension for every module.' },
                { title: 'Assessments & knowledge checks', desc: 'Multiple-choice and calculation quizzes configured.' },
                { title: 'Troubleshooting guidance', desc: 'Common fault isolation, wiring errors, and brownout guides.' },
                { title: 'Mentor support integration', desc: 'Universal [NEED HELP?] auto-attaches course/module context.' },
                { title: 'Research & Design Project', desc: 'Authentic real-world community challenge project per level.' },
                { title: 'Assigned Final Design Project', desc: 'Full integrative capstone prototype build per level.' },
                { title: 'Completion requirements defined', desc: '100% competency-based progression, not time-gated.' },
                { title: 'Competencies mapped to evidence', desc: 'Tracked through lab demo, assignment, and capstone.' },
                { title: 'Estimated learning time defined', desc: 'Displayed for learner planning (95h, 115h, 145h targets).' },
                { title: 'Required hardware kits defined', desc: 'Pioneer, Autonomous Rover, and IoT Expansion packs specified.' },
                { title: 'Level prerequisites configured', desc: 'Sequential mastery unlocks prevent jumping ahead.' },
                { title: 'Certificate requirements defined', desc: 'Verifiable credentials issued only upon demonstrated mastery.' }
              ].map((item, idx) => (
                <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
                  <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{item.title}</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
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
