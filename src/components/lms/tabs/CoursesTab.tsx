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
  Layers
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
import { getAllCourses, getCourseById } from '../../../services/unifiedCourseService';
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

  const allLmsCourses = useMemo(() => getAllCourses(), []);
  
  const filteredUnifiedCourses = useMemo(() => {
    return allLmsCourses.filter(c => {
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
    <div className="space-y-8 pb-12">
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 border border-slate-800 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-2xl">
        <div className="max-w-4xl space-y-4 relative z-10">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
              <Brain className="w-3.5 h-3.5" /> Interactive Learning Management System
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              YARA Learning Academy
            </span>
          </div>
          
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
            Robotics Courses & Labs
          </h1>
          
          <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed max-w-3xl">
            Step-by-step engineering pathway from electricity fundamentals to embedded C++ programming, sensor fusion, non-blocking state machines, autonomous robotics capstones, and deployed industrial systems across 4 authoritative tiers and 8 comprehensive levels.
          </p>

          {/* Quick Action Navigation Bar */}
          <div className="flex flex-wrap items-center gap-2.5 pt-2">
            <button
              onClick={() => setIsBrainstormingModalOpen(true)}
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-amber-500/20 flex items-center gap-2 transition cursor-pointer"
            >
              <Brain className="w-4 h-4" />
              <span>Brainstorming Image Quiz</span>
              <Zap className="w-3.5 h-3.5 fill-current" />
            </button>
            <button
              onClick={() => setIsExamModalOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-indigo-600/20 flex items-center gap-2 transition cursor-pointer"
            >
              <Award className="w-4 h-4" />
              <span>{examAttempt?.passed ? 'Review Final Exam' : 'Take Final Exam'}</span>
            </button>
            <button
              onClick={() => setIsProjectModalOpen(true)}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 transition cursor-pointer"
            >
              <Rocket className="w-4 h-4 text-emerald-400" />
              <span>{projectSubmission ? 'View Capstone Build' : 'Submit Capstone Build'}</span>
            </button>
            <button
              onClick={() => setIsCertModalOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-emerald-600/20 flex items-center gap-2 transition cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{certificate ? 'View Official Certificate' : 'Certificate Criteria & Claim'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Centralized LMS Track Switcher */}
      <div className="bg-white border border-slate-200 rounded-2xl p-2.5 shadow-xs flex items-center gap-2 overflow-x-auto scrollbar-none">
        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-2 shrink-0">
          Course Track:
        </span>
        {[
          { id: 'all', label: '🌟 All LMS Courses', count: allLmsCourses.length },
          { id: 'robotics', label: '🤖 Robotics Academy (L0–L8)', count: 4 },
          { id: 'technology', label: '💻 Technology & Coding', count: allLmsCourses.filter(c => c.track === 'technology').length },
          { id: 'stem', label: '🎓 STEM Education & Pedagogy', count: allLmsCourses.filter(c => c.track === 'stem').length },
          { id: 'specialized', label: '⚡ Specialized & Industrial', count: allLmsCourses.filter(c => c.track === 'specialized').length }
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

      {/* Conditional: Centralized Course Catalogue vs Robotics Sessions Explorer */}
      {activeCatalogTrack !== 'robotics' ? (
        <div className="space-y-6">
          {/* Featured Robotics Academy Banner on "All Courses" view */}
          {activeCatalogTrack === 'all' && (
            <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 border border-indigo-500/30 rounded-3xl p-6 sm:p-7 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
              <div className="space-y-2 max-w-2xl">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Flagship Core Programme
                  </span>
                  <span className="text-[11px] text-slate-300 font-bold">4 Tiers • Levels 0–8 • 42 Sessions</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white">YARA Robotics Academy</h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Complete hands-on engineering journey from electricity fundamentals, breadboard prototyping, embedded C++, and PID motor control, to edge AI vision, ROS 2, and defended African community hardware capstones.
                </p>
              </div>
              <button
                onClick={() => setActiveCatalogTrack('robotics')}
                className="px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs uppercase tracking-wider shadow-lg transition flex items-center gap-2 shrink-0 cursor-pointer"
              >
                <Cpu className="w-4 h-4" />
                <span>Explore Robotics Sessions & Labs →</span>
              </button>
            </div>
          )}

          {/* Search Bar for Unified Courses */}
          <div className="bg-white border border-slate-200 rounded-2xl p-3 shadow-xs">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search all courses by title, keywords, hardware required, or learning outcomes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
              />
            </div>
          </div>

          {/* Unified Courses Grid */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-600" />
                <span>Centralized LMS Course Catalogue ({filteredUnifiedCourses.length} Courses)</span>
              </h3>
            </div>

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
                    <div className="absolute top-3 right-3">
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border backdrop-blur-xs ${
                        course.membershipRequired
                          ? 'bg-amber-500/90 text-slate-950 border-amber-400'
                          : course.certificationFeeUsd > 0
                          ? 'bg-blue-600/90 text-white border-blue-400'
                          : 'bg-emerald-600/90 text-white border-emerald-400'
                      }`}>
                        {course.membershipRequired ? 'YARA Member' : course.certificationFeeUsd > 0 ? `$${course.certificationFeeUsd} Cert` : 'Free Enrol'}
                      </span>
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
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* 4 Official Robotics Learning Tiers */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Cpu className="w-4 h-4 text-emerald-600" />
            <span>Robotics Learning & Certification Tiers</span>
          </h3>
          {selectedTier !== 'all' && (
            <button
              onClick={() => setSelectedTier('all')}
              className="text-xs font-bold text-emerald-600 hover:text-emerald-700 underline cursor-pointer"
            >
              Show All Tiers
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {ROBOTICS_TIER_CATEGORIES.map(tier => {
            const isSelected = selectedTier === tier.id;
            return (
              <div
                key={tier.id}
                onClick={() => {
                  setSelectedTier(prev => (prev === tier.id ? 'all' : tier.id));
                  setSelectedLevel('all');
                }}
                className={`p-4 rounded-2xl border transition cursor-pointer flex flex-col justify-between ${
                  isSelected 
                    ? tier.activeColor + ' shadow-md scale-[1.02]' 
                    : tier.color + ' hover:border-slate-400 shadow-xs'
                }`}
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider opacity-85">
                      {tier.badge}
                    </span>
                    <span className="text-[10px] font-mono font-bold opacity-75">
                      {tier.sessionsSummary}
                    </span>
                  </div>
                  <h4 className="text-sm font-black tracking-tight leading-snug">
                    {tier.name}
                  </h4>
                  <p className="text-xs opacity-85 leading-relaxed pt-1">
                    {tier.description}
                  </p>
                </div>
                <div className="pt-3 text-[10px] font-bold flex items-center gap-1 opacity-90">
                  <span>{isSelected ? '✓ Filter Active (Click to reset)' : 'Click to filter sessions →'}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Graduation & Certification Milestone Card */}
      <section className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-slate-800">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-indigo-500/5 rounded-l-full blur-2xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 bg-amber-500/20 text-amber-300 font-bold text-xs rounded-full uppercase tracking-wider flex items-center space-x-1 border border-amber-500/30">
                <Award className="w-3.5 h-3.5" />
                <span>Graduation & Accreditation Milestone</span>
              </span>
              {certificate && (
                <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 font-bold text-xs rounded-full uppercase tracking-wider flex items-center space-x-1 border border-emerald-500/30">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Certified Graduate</span>
                </span>
              )}
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Final Examination & Official Technical Certification
            </h3>

            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Complete the course modules, pass the 12-question comprehensive robotics examination (70%+ passing threshold), and submit your final capstone robot build to earn an accredited, verified YARA Certificate of Technical Mastery.
            </p>

            {/* Checklist items */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
              <div className="flex items-center space-x-2 text-slate-300">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[11px] ${
                  examAttempt?.passed ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-400 border border-slate-700'
                }`}>
                  {examAttempt?.passed ? '✓' : '1'}
                </div>
                <span>Final Exam: {examAttempt?.passed ? `Passed (${examAttempt.percentage}%)` : 'Ready to take'}</span>
              </div>

              <div className="flex items-center space-x-2 text-slate-300">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[11px] ${
                  projectSubmission ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-400 border border-slate-700'
                }`}>
                  {projectSubmission ? '✓' : '2'}
                </div>
                <span>Capstone Project: {projectSubmission ? `Submitted (${projectSubmission.status})` : 'Pending'}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 w-full lg:w-auto shrink-0">
            <button
              onClick={() => setIsExamModalOpen(true)}
              className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center space-x-2 cursor-pointer"
            >
              <Award className="w-4 h-4" />
              <span>{examAttempt?.passed ? 'Review Final Exam' : 'Take Final Exam'}</span>
            </button>

            <button
              onClick={() => setIsProjectModalOpen(true)}
              className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs uppercase tracking-wider rounded-xl border border-slate-700 transition-all flex items-center justify-center space-x-2 cursor-pointer"
            >
              <Rocket className="w-4 h-4" />
              <span>{projectSubmission ? 'View Capstone Project' : 'Submit Capstone Project'}</span>
            </button>

            <button
              onClick={() => setIsCertModalOpen(true)}
              className="px-5 py-3 bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-xl shadow-amber-500/20 hover:scale-[1.02] transition-all flex items-center justify-center space-x-2 cursor-pointer"
            >
              <Award className="w-4 h-4 text-slate-950" />
              <span>{certificate ? 'View Official Certificate' : 'Certificate Criteria & Claim'}</span>
            </button>
          </div>
        </div>
      </section>

      {/* 2. Filter & Search Controls */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-4">
        {/* Search bar & Type pills */}
        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="relative w-full md:flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search sessions (e.g. 'ESP32', 'Ohm's Law', 'Obstacle Avoidance', '5 Whys')..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
            />
          </div>

          <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {[
              { id: 'all', label: 'All Types' },
              { id: 'online', label: 'Online Theory' },
              { id: 'practical', label: 'Hands-on Labs (P01–P05)' },
              { id: 'hardware', label: '🧰 Hardware Required' }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setFilterType(f.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                  filterType === f.id
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Level Selector Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1 border-t border-slate-100 scrollbar-none">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 shrink-0 mr-1">
            Levels:
          </span>
          <button
            onClick={() => setSelectedLevel('all')}
            className={`px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition ${
              selectedLevel === 'all'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Levels (0–8)
          </button>
          {YARA_LMS_LEVELS.map(lvl => (
            <button
              key={lvl.levelNumber}
              onClick={() => setSelectedLevel(lvl.levelNumber)}
              className={`px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 ${
                selectedLevel === lvl.levelNumber
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span>L{lvl.levelNumber}</span>
              <span className="opacity-80 text-[10px] font-normal">{lvl.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 3. Session List */}
      <div className="space-y-4">
        {filteredSessions.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center text-slate-500 text-xs">
            No course sessions match your current filter. Try resetting search or level filters.
          </div>
        ) : (
          filteredSessions.map((session) => {
            const completion = userCompletions[session.id] || {};
            const isCompleted = completion.isFullyCompleted;
            const { isUnlocked, missingPrerequisites } = checkSessionPrerequisites(userId, session.id, userCompletions);
            const isExpanded = expandedSessionId === session.id;

            return (
              <div
                key={session.id}
                className={`bg-white border rounded-2xl transition-all duration-200 overflow-hidden shadow-xs ${
                  isCompleted
                    ? 'border-emerald-200 bg-emerald-50/20'
                    : !isUnlocked
                    ? 'border-slate-200 opacity-80'
                    : 'border-slate-200 hover:border-emerald-400'
                }`}
              >
                {/* Main Session Bar */}
                <div className="p-5 sm:p-6 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-md bg-slate-900 text-white text-[11px] font-mono font-bold">
                        {session.id}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold">
                        Level {session.levelNumber} • {session.part}
                      </span>
                      <span className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
                        <Clock className="w-3 h-3" /> {session.durationMinutes} mins
                      </span>
                      {session.hasPhysicalComponents && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200 text-[10px] font-bold flex items-center gap-1">
                          🧰 COMPONENTS REQUIRED
                        </span>
                      )}
                    </div>

                    <div>
                      <h3 className="text-base font-black text-slate-900">{session.title}</h3>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">{session.subtitle}</p>
                    </div>

                    {/* Progress indicators */}
                    <div className="flex flex-wrap items-center gap-3 text-[11px] pt-1">
                      <span className={`flex items-center gap-1 font-semibold ${completion.videoCompleted ? 'text-emerald-600' : 'text-slate-400'}`}>
                        <CheckCircle2 className="w-3.5 h-3.5" /> Video
                      </span>
                      <span className={`flex items-center gap-1 font-semibold ${completion.quizPassed ? 'text-emerald-600' : 'text-slate-400'}`}>
                        <CheckCircle2 className="w-3.5 h-3.5" /> Quiz ({session.quizQuestions?.length || 0} Qs)
                      </span>
                      {session.assignment && (
                        <span className={`flex items-center gap-1 font-semibold ${completion.assignmentSubmitted ? 'text-emerald-600' : 'text-slate-400'}`}>
                          <CheckCircle2 className="w-3.5 h-3.5" /> Assignment
                        </span>
                      )}
                      {session.miniProject && (
                        <span className={`flex items-center gap-1 font-semibold ${completion.miniProjectSubmitted ? 'text-emerald-600' : 'text-slate-400'}`}>
                          <CheckCircle2 className="w-3.5 h-3.5" /> Mini-Project
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2.5 w-full lg:w-auto justify-between lg:justify-end pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100 flex-wrap">
                    {isAdmin && (
                      <button
                        onClick={() => setAdminVideoModalSession({ id: session.id, title: session.title })}
                        className="px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold flex items-center gap-1.5 rounded-xl transition"
                        title="Manage course videos for this session"
                      >
                        <Film className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Manage Videos</span>
                      </button>
                    )}

                    <button
                      onClick={() => toggleExpand(session.id)}
                      className="px-3 py-2 text-slate-600 hover:text-slate-900 text-xs font-bold flex items-center gap-1 rounded-xl hover:bg-slate-100 transition"
                    >
                      <span>{isExpanded ? 'Hide Details' : 'View Syllabus'}</span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>

                    {isUnlocked ? (
                      <button
                        onClick={() => onSelectSession(session.id)}
                        className={`px-5 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 transition shadow-xs ${
                          isCompleted
                            ? 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                            : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
                        }`}
                      >
                        <Play className={`w-3.5 h-3.5 ${isCompleted ? 'fill-slate-800' : 'fill-white'}`} />
                        <span>{isCompleted ? 'Review Session' : 'Start Session'}</span>
                      </button>
                    ) : (
                      <div className="px-4 py-2 bg-slate-100 text-slate-400 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-not-allowed">
                        <Lock className="w-3.5 h-3.5" />
                        <span>Locked</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Expanded Details Panel */}
                {isExpanded && (
                  <div className="px-6 pb-6 pt-2 bg-slate-50/70 border-t border-slate-100 space-y-4 text-xs text-slate-700">
                    {!isUnlocked && missingPrerequisites.length > 0 && (
                      <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <strong>Prerequisites Needed:</strong> Please complete {missingPrerequisites.join(', ')} before this session unlocks.
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                      <div>
                        <span className="font-bold text-slate-900 flex items-center mb-0.5">
                          <Target className="w-3.5 h-3.5 text-indigo-600 mr-1.5 shrink-0" />
                          <span>Learning Objective:</span>
                        </span>
                        <p className="text-slate-600 leading-relaxed">{session.learningObjective}</p>
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 flex items-center mb-0.5">
                          <Lightbulb className="w-3.5 h-3.5 text-amber-500 mr-1.5 shrink-0" />
                          <span>Industry Relevance:</span>
                        </span>
                        <p className="text-slate-600 leading-relaxed">{session.whyLearnThis}</p>
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 flex items-center mb-0.5">
                          <Wrench className="w-3.5 h-3.5 text-slate-700 mr-1.5 shrink-0" />
                          <span>Practical Implementation:</span>
                        </span>
                        <p className="text-slate-600 leading-relaxed">{session.whatYouWillBuild}</p>
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 flex items-center mb-0.5">
                          <Award className="w-3.5 h-3.5 text-emerald-600 mr-1.5 shrink-0" />
                          <span>Professional Outcome:</span>
                        </span>
                        <p className="text-slate-600 leading-relaxed">{session.innovatorContribution}</p>
                      </div>
                    </div>

                    {/* Component notice if required */}
                    {session.hasPhysicalComponents && (
                      <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 space-y-2">
                        <div className="font-bold flex items-center gap-1.5 text-xs text-emerald-900">
                          <Package className="w-4 h-4 text-emerald-700" />
                          <span>Required Hardware for this session:</span>
                        </div>
                        <ul className="list-disc list-inside space-y-0.5 text-[11px] text-emerald-800">
                          {session.componentsRequired?.map((c, i) => (
                            <li key={i}>{c.name} (Qty: {c.quantity}) — {c.purpose}</li>
                          ))}
                        </ul>
                        <div className="text-[11px] font-medium text-slate-700 pt-1 border-t border-emerald-200/60">
                          Need the components for this session? Contact YARA on <strong className="text-slate-900">0717468236</strong> to purchase/obtain the required learning components.
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
        {/* End of Sessions List */}
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
