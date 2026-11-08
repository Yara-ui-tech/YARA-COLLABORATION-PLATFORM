import React, { useState, useEffect, useMemo } from 'react';
import { 
  BookOpen, 
  Search, 
  Filter, 
  Play, 
  CheckCircle2, 
  Lock, 
  Clock, 
  Zap, 
  Cpu, 
  Bot, 
  Lightbulb, 
  Award, 
  Wrench, 
  Phone, 
  Package, 
  Check, 
  ChevronDown, 
  ChevronUp, 
  AlertCircle, 
  Film, 
  Target,
  GraduationCap,
  Brain,
  Rocket,
  ShieldCheck,
  Code2,
  Layers,
  Trash2,
  Loader2
} from 'lucide-react';
import { YARALmsSession, LearnerLevelNumber } from '../../../types/yaraLms';
import { COMPLETE_YARA_SESSIONS } from '../../../constants/yaraLmsCatalog';
import { YARA_LMS_LEVELS } from '../../../constants/yaraLmsData';
import { checkSessionPrerequisites } from '../../../services/yaraLmsService';
import { useAuth } from '../../AuthContext';
import { supabase } from '../../../lib/supabase';
import { AdminSessionVideoModal } from '../AdminSessionVideoModal';
import { GreatLearningCertificateModal } from '../GreatLearningCertificateModal';
import FinalExamModal from '../../curriculum/FinalExamModal';
import FinalProjectModal from '../../curriculum/FinalProjectModal';
import BrainstormingQuizModal from '../../brainstorming/BrainstormingQuizModal';
import { FinalExamAttempt, FinalProjectSubmission, Certificate } from '../../../types/curriculum';
import { 
  getAllCourses, 
  getCourseById, 
  fetchCoursesFromDatabase, 
  deleteCourse, 
  clearAllCourses 
} from '../../../services/unifiedCourseService';
import { UnifiedCourse } from '../../../types/unifiedCourseTypes';
import { UniversalCoursePlayerModal } from '../UniversalCoursePlayerModal';

export const ROBOTICS_TIER_CATEGORIES = [
  {
    id: 1,
    name: '1. Absolute Beginner or Explorer',
    badge: 'Tier 1 • Absolute Beginner',
    levels: [0, 1, 2],
    sessionsSummary: 'S00 – S07 (Labs P01)',
    color: 'border-sky-300 bg-sky-50/80 text-sky-900',
    activeColor: 'bg-sky-600 text-white border-sky-600',
    description: 'Foundations of robotics, Ohm’s law, breadboarding, and visual block coding.'
  },
  {
    id: 2,
    name: '2. Intermediate Learner',
    badge: 'Tier 2 • Intermediate',
    levels: [3, 4],
    sessionsSummary: 'S08 – S19',
    color: 'border-indigo-300 bg-indigo-50/80 text-indigo-900',
    activeColor: 'bg-indigo-600 text-white border-indigo-600',
    description: 'Embedded C++, Arduino/ESP32, sensor interfacing, PWM motors & chassis mechanics.'
  },
  {
    id: 3,
    name: '3. Advanced Learner',
    badge: 'Tier 3 • Advanced',
    levels: [5, 6],
    sessionsSummary: 'S20 – S27 (Labs P02, P03)',
    color: 'border-purple-300 bg-purple-50/80 text-purple-900',
    activeColor: 'bg-purple-600 text-white border-purple-600',
    description: 'Autonomous navigation, PID control, line tracking, cloud telemetry & edge AI computer vision.'
  },
  {
    id: 4,
    name: '4. Robotics Masterclass for Real World Applications and Deployment',
    badge: 'Tier 4 • Masterclass & Deployment',
    levels: [7, 8],
    sessionsSummary: 'S28 – S36 (Labs P04, P05)',
    color: 'border-amber-300 bg-amber-50/80 text-amber-950',
    activeColor: 'bg-amber-600 text-white border-amber-600',
    description: 'Applied research, 5 Whys analysis, 21-point engineering documentation & defended capstones.'
  }
];

interface Props {
  userId: string;
  userCompletions: Record<string, any>;
  onSelectSession: (sessionId: string) => void;
  onNavigateTab: (tab: any) => void;
  initialCourseId?: string | null;
}

export const CoursesTab: React.FC<Props> = ({
  userId,
  userCompletions,
  onSelectSession,
  onNavigateTab,
  initialCourseId
}) => {
  const { profile, user } = useAuth();
  const isAdmin = profile?.role === 'admin';

  const [activeCatalogTrack, setActiveCatalogTrack] = useState<'all' | 'robotics' | 'technology' | 'stem' | 'specialized'>('all');
  const [activePlayerCourse, setActivePlayerCourse] = useState<UnifiedCourse | null>(null);

  const [selectedTier, setSelectedTier] = useState<number | 'all'>('all');
  const [selectedLevel, setSelectedLevel] = useState<number | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'online' | 'practical' | 'hardware'>('all');
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null);
  const [adminVideoModalSession, setAdminVideoModalSession] = useState<{ id: string; title: string } | null>(null);

  // Modals state
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);
  const [isExamModalOpen, setIsExamModalOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isBrainstormingModalOpen, setIsBrainstormingModalOpen] = useState(false);

  // Milestone records
  const [examAttempt, setExamAttempt] = useState<FinalExamAttempt | null>(null);
  const [projectSubmission, setProjectSubmission] = useState<FinalProjectSubmission | null>(null);
  const [certificate, setCertificate] = useState<Certificate | null>(null);

  useEffect(() => {
    async function loadGraduationRecords() {
      const activeUid = user?.id || userId;
      if (!activeUid || activeUid === 'demo_learner_01') return;
      try {
        const { data: examData } = await supabase
          .from('final_exam_attempts')
          .select('*')
          .eq('user_id', activeUid)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        if (examData) setExamAttempt(examData);

        const { data: projData } = await supabase
          .from('final_project_submissions')
          .select('*')
          .eq('user_id', activeUid)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        if (projData) setProjectSubmission(projData);

        const { data: certData } = await supabase
          .from('certificates')
          .select('*')
          .eq('user_id', activeUid)
          .order('issue_date', { ascending: false })
          .limit(1)
          .maybeSingle();
        if (certData) setCertificate(certData);
      } catch (err) {
        console.error('Error fetching graduation records in CoursesTab:', err);
      }
    }
    loadGraduationRecords();
  }, [user?.id, userId]);

  useEffect(() => {
    if (initialCourseId) {
      const found = getCourseById(initialCourseId);
      if (found) {
        setActivePlayerCourse(found);
      }
    }
  }, [initialCourseId]);

  const [allLmsCourses, setAllLmsCourses] = useState<UnifiedCourse[]>(() => getAllCourses());
  const [loadingCourses, setLoadingCourses] = useState(true);

  const loadCourses = async () => {
    try {
      setLoadingCourses(true);
      const data = await fetchCoursesFromDatabase();
      setAllLmsCourses(data);
    } catch (err) {
      console.warn('Error loading LMS courses:', err);
    } finally {
      setLoadingCourses(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);
  
  const filteredUnifiedCourses = useMemo(() => {
    return allLmsCourses.filter(c => {
      if (activeCatalogTrack === 'robotics' && c.track !== 'robotics') return false;
      if (activeCatalogTrack === 'technology' && c.track !== 'technology') return false;
      if (activeCatalogTrack === 'stem' && c.track !== 'stem') return false;
      if (activeCatalogTrack === 'specialized' && c.track !== 'specialized') return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match = c.title.toLowerCase().includes(q) || c.code.toLowerCase().includes(q) || c.shortSummary.toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [allLmsCourses, activeCatalogTrack, searchQuery]);

  // Filter sessions (Memoized to prevent INP delays)
  const filteredSessions = useMemo(() => {
    return COMPLETE_YARA_SESSIONS.filter(session => {
      // 4-Tier category filter
      if (selectedTier !== 'all') {
        const activeCategory = ROBOTICS_TIER_CATEGORIES.find(t => t.id === selectedTier);
        if (activeCategory && !activeCategory.levels.includes(session.levelNumber)) {
          return false;
        }
      }

      if (selectedLevel !== 'all' && session.levelNumber !== selectedLevel) return false;
      if (filterType === 'online' && session.type !== 'online') return false;
      if (filterType === 'practical' && session.type !== 'physical_lab') return false;
      if (filterType === 'hardware' && !session.hasPhysicalComponents) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = session.title.toLowerCase().includes(q);
        const matchSub = session.subtitle.toLowerCase().includes(q);
        const matchId = session.id.toLowerCase().includes(q);
        const matchObj = session.learningObjective.toLowerCase().includes(q);
        return matchTitle || matchSub || matchId || matchObj;
      }
      return true;
    });
  }, [selectedTier, selectedLevel, filterType, searchQuery]);

  const toggleExpand = (sessionId: string) => {
    setExpandedSessionId(prev => (prev === sessionId ? null : sessionId));
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Clean Simple Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-lg">
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
          Robotics Courses &amp; Labs
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1 font-normal">
          Official practical robotics, coding, and hardware engineering modules.
        </p>
      </div>

      {loadingCourses ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-16 text-center shadow-xs">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-3" />
          <p className="text-xs font-bold text-slate-700">Loading courses from database...</p>
        </div>
      ) : allLmsCourses.length === 0 ? (
        /* Clean Empty State */
        <div className="bg-white border border-dashed border-slate-200 rounded-3xl p-16 text-center shadow-xs space-y-4">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
          <div>
            <h3 className="text-lg font-bold text-slate-900">No Courses Currently Published</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
              The Academy course catalog is completely fresh. When new courses are uploaded by the administrator in the LMS Studio, they will appear here.
            </p>
          </div>
          {isAdmin && (
            <button
              onClick={() => onNavigateTab('admin-center')}
              className="mt-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition inline-flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <span>Open Admin LMS Studio</span>
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {/* 2. LMS Track Switcher */}
          <div className="bg-white border border-slate-200 rounded-2xl p-2.5 shadow-xs flex items-center gap-2 overflow-x-auto scrollbar-none">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-2 shrink-0">
              Track:
            </span>
            {[
              { id: 'all', label: 'All Courses', count: allLmsCourses.length },
              { id: 'robotics', label: 'Robotics', count: allLmsCourses.filter(c => c.track === 'robotics').length },
              { id: 'technology', label: 'Technology & Coding', count: allLmsCourses.filter(c => c.track === 'technology').length },
              { id: 'stem', label: 'STEM Education', count: allLmsCourses.filter(c => c.track === 'stem').length },
              { id: 'specialized', label: 'Specialized', count: allLmsCourses.filter(c => c.track === 'specialized').length }
            ].map(t => (
              <button
                key={t.id}
                onClick={() => {
                  setActiveCatalogTrack(t.id as any);
                  setSelectedTier('all');
                  setSelectedLevel('all');
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
                  activeCatalogTrack === t.id
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <span>{t.label}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                  activeCatalogTrack === t.id ? 'bg-slate-800 text-emerald-400' : 'bg-slate-200/80 text-slate-500'
                }`}>
                  {t.count}
                </span>
              </button>
            ))}
          </div>

          {/* Search Bar for Unified Courses */}
          <div className="bg-white border border-slate-200 rounded-2xl p-3 shadow-xs">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
              />
            </div>
          </div>

          {/* Unified Courses Grid */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-600" />
                <span>Course Catalogue ({filteredUnifiedCourses.length})</span>
              </h3>

              {isAdmin && (
                <button
                  onClick={async () => {
                    if (confirm('Are you sure you want to delete ALL courses from the database to start completely fresh? This cannot be undone.')) {
                      await clearAllCourses();
                      setAllLmsCourses([]);
                    }
                  }}
                  className="text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 cursor-pointer w-fit"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Purge All Database Courses</span>
                </button>
              )}
            </div>

            {loadingCourses ? (
              <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center shadow-xs">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-3" />
                <p className="text-xs font-bold text-slate-700">Loading live courses from Supabase database...</p>
              </div>
            ) : filteredUnifiedCourses.length === 0 ? (
              <div className="bg-white border border-dashed border-slate-200 rounded-3xl p-12 text-center shadow-xs">
                <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h4 className="text-base font-black text-slate-800">No Courses Currently Published</h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                  The Academy course catalog is completely fresh. New robotics and coding courses published by the administrator will appear here.
                </p>
                {isAdmin && (
                  <button
                    onClick={() => onNavigateTab('admin-center')}
                    className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <span>Open Admin LMS Studio</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredUnifiedCourses.map(course => (
                  <div
                    key={course.id}
                    className="bg-white border border-slate-200 hover:border-indigo-400 rounded-3xl overflow-hidden shadow-xs hover:shadow-lg transition-all flex flex-col justify-between group"
                  >
                    <div className="relative h-44 overflow-hidden bg-slate-950">
                      <img
                        src={course.thumbnailUrl}
                        alt={course.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                      <div className="absolute top-3 left-3 flex items-center gap-1.5">
                        <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-slate-900/90 text-white border border-white/20 backdrop-blur-xs">
                          {course.track.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                      <div className="absolute top-3 right-3 flex items-center gap-1.5">
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border backdrop-blur-xs ${
                          course.membershipRequired
                            ? 'bg-amber-500/90 text-slate-950 border-amber-400'
                            : course.certificationFeeUsd > 0
                            ? 'bg-blue-600/90 text-white border-blue-400'
                            : 'bg-emerald-600/90 text-white border-emerald-400'
                        }`}>
                          {course.membershipRequired ? 'YARA Member' : course.certificationFeeUsd > 0 ? `$${course.certificationFeeUsd} Cert` : 'Free Enrol'}
                        </span>
                        {isAdmin && (
                          <button
                            onClick={async (e) => {
                              e.stopPropagation();
                              if (confirm(`Delete course "${course.title}" from database?`)) {
                                deleteCourse(course.id);
                                setAllLmsCourses(prev => prev.filter(c => c.id !== course.id));
                              }
                            }}
                            className="p-1 rounded-lg bg-red-600/90 hover:bg-red-700 text-white border border-red-400 transition cursor-pointer"
                            title="Delete course"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                      <div className="absolute bottom-3 left-3 right-3">
                        <span className="text-[10px] font-mono font-bold text-emerald-400">{course.code}</span>
                        <h4 className="text-sm font-black text-white leading-snug line-clamp-1">{course.title}</h4>
                      </div>
                    </div>

                    <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                      <div className="space-y-2.5">
                        <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                          {course.shortSummary}
                        </p>

                        <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 font-semibold pt-1">
                          <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-slate-400" /> {course.estimatedDurationHours}h</span>
                          <span className="flex items-center gap-1"><Layers className="w-3.5 h-3.5 text-slate-400" /> {course.modules.length} Modules</span>
                          <span className="flex items-center gap-1"><Award className="w-3.5 h-3.5 text-amber-500" /> Accredited</span>
                        </div>

                        {course.learningOutcomes.length > 0 && (
                          <div className="space-y-1 pt-1 border-t border-slate-100">
                            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Key Outcomes:</div>
                            <ul className="text-[11px] text-slate-600 space-y-0.5">
                              {course.learningOutcomes.slice(0, 2).map((outcome, i) => (
                                <li key={i} className="flex items-start gap-1.5 line-clamp-1">
                                  <span className="text-emerald-500 font-bold">✓</span>
                                  <span className="truncate">{outcome}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>

                      <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                        <button
                          onClick={() => setActivePlayerCourse(course)}
                          className="w-full bg-slate-900 hover:bg-indigo-600 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-sm group-hover:bg-indigo-600"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>Start Learning In LMS</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Admin Video Modal */}
      {isAdmin && adminVideoModalSession && (
        <AdminSessionVideoModal
          sessionId={adminVideoModalSession.id}
          sessionTitle={adminVideoModalSession.title}
          isOpen={true}
          onClose={() => setAdminVideoModalSession(null)}
          onVideosUpdated={() => {}}
        />
      )}

      {/* Great Learning Certificate Claim Modal */}
      {isCertModalOpen && (
        <GreatLearningCertificateModal
          isOpen={true}
          onClose={() => setIsCertModalOpen(false)}
          userId={userId}
          userEmail={profile?.email || 'learner@yara.org'}
          defaultStudentName={profile?.display_name || 'YARA Learner'}
          courseId="robotics-foundation"
          courseTitle="YARA Learning Academy — Robotics Programme (Levels 0 — 8)"
          courseCategory="robotics"
        />
      )}

      {/* Comprehensive Robotics Final Examination Modal */}
      {isExamModalOpen && (
        <FinalExamModal
          isOpen={true}
          onClose={() => setIsExamModalOpen(false)}
          existingAttempt={examAttempt}
          onExamPassed={(cert) => {
            setCertificate(cert);
            setIsExamModalOpen(false);
            setIsCertModalOpen(true);
          }}
        />
      )}

      {/* Capstone Robotics Build Submission Modal */}
      {isProjectModalOpen && (
        <FinalProjectModal
          isOpen={true}
          onClose={() => setIsProjectModalOpen(false)}
          existingSubmission={projectSubmission}
          onSubmissionSuccess={(sub) => {
            setProjectSubmission(sub);
            setIsProjectModalOpen(false);
          }}
        />
      )}

      {/* Brainstorming Image Quiz Modal */}
      {isBrainstormingModalOpen && (
        <BrainstormingQuizModal
          isOpen={true}
          onClose={() => setIsBrainstormingModalOpen(false)}
        />
      )}

      {/* Universal LMS Course Player Modal for Technology & STEM Courses */}
      {activePlayerCourse && (
        <UniversalCoursePlayerModal
          course={activePlayerCourse}
          isOpen={true}
          onClose={() => setActivePlayerCourse(null)}
          userId={userId}
          userName={profile?.display_name || user?.email?.split('@')[0] || 'YARA Learner'}
          userEmail={profile?.email || user?.email || 'learner@yara.org'}
        />
      )}
    </div>
  );
};
