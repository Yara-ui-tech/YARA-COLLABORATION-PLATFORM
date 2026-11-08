import React, { useState, useEffect, useMemo } from 'react';
import { 
  TrendingUp, 
  CheckCircle2, 
  Lock, 
  Play, 
  Zap, 
  Award, 
  ChevronDown, 
  ChevronUp, 
  Clock, 
  Layers, 
  Cpu, 
  Bot, 
  Wrench, 
  Lightbulb, 
  ArrowRight,
  Sparkles,
  BookOpen,
  Loader2,
  Compass
} from 'lucide-react';
import { LearnerLevelNumber } from '../../../types/yaraLms';
import { COMPLETE_YARA_SESSIONS } from '../../../constants/yaraLmsCatalog';
import { YARA_LMS_LEVELS } from '../../../constants/yaraLmsData';
import { checkSessionPrerequisites } from '../../../services/yaraLmsService';
import { 
  UnifiedCourse, 
  UnifiedEnrollment 
} from '../../../types/unifiedCourseTypes';
import { 
  fetchCoursesFromDatabase, 
  getAllCourses, 
  getUserEnrollments 
} from '../../../services/unifiedCourseService';
import { useAuth } from '../../AuthContext';
import { UniversalCoursePlayerModal } from '../UniversalCoursePlayerModal';

interface Props {
  userId: string;
  userOverall: {
    completedCount: number;
    totalSessions: number;
    percentage: number;
    currentLevel: LearnerLevelNumber;
    currentLevelTitle: string;
    nextSession: { id: string; title: string } | null;
  };
  userCompletions: Record<string, any>;
  onSelectSession: (sessionId: string) => void;
  onNavigateTab?: (tabId: any) => void;
  isAdmin?: boolean;
}

export const ProgressTab: React.FC<Props> = ({
  userId,
  userOverall,
  userCompletions,
  onSelectSession,
  onNavigateTab,
  isAdmin = false
}) => {
  const { user, profile } = useAuth();
  const [courses, setCourses] = useState<UnifiedCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [activePlayerCourse, setActivePlayerCourse] = useState<UnifiedCourse | null>(null);
  const [expandedCourseIds, setExpandedCourseIds] = useState<Record<string, boolean>>({});

  useEffect(() => {
    let mounted = true;
    async function loadRoadmapCourses() {
      setLoading(true);
      try {
        const dbCourses = await fetchCoursesFromDatabase();
        if (mounted) {
          setCourses(dbCourses.filter(c => c.isPublished !== false));
        }
      } catch {
        if (mounted) {
          const local = getAllCourses();
          setCourses(local.filter(c => c.isPublished !== false));
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadRoadmapCourses();
  }, []);

  const enrollmentsMap = useMemo(() => {
    const enrolls = getUserEnrollments(userId);
    const map: Record<string, UnifiedEnrollment> = {};
    enrolls.forEach(e => {
      map[e.courseId] = e;
    });
    return map;
  }, [userId]);

  const toggleCourseExpand = (courseId: string) => {
    setExpandedCourseIds(prev => ({
      ...prev,
      [courseId]: !prev[courseId]
    }));
  };

  // Only include legacy sessions if any exist in catalog
  const activeLegacySessions = COMPLETE_YARA_SESSIONS || [];
  const activeLegacyLevels = YARA_LMS_LEVELS.filter(level => 
    activeLegacySessions.some(s => s.levelNumber === level.levelNumber)
  );

  const hasContent = courses.length > 0 || activeLegacySessions.length > 0;

  // Calculate live roadmap totals
  const totalRoadmapModules = useMemo(() => {
    const unifiedMods = courses.reduce((sum, c) => sum + (c.modules?.length || c.totalModulesCount || 1), 0);
    return unifiedMods + activeLegacySessions.length;
  }, [courses, activeLegacySessions]);

  const completedRoadmapModules = useMemo(() => {
    let completed = 0;
    courses.forEach(c => {
      const enroll = enrollmentsMap[c.id];
      if (enroll) {
        completed += (enroll.completedModuleIds?.length || 0);
      }
    });
    activeLegacySessions.forEach(s => {
      if (userCompletions[s.id]?.isFullyCompleted) {
        completed++;
      }
    });
    return completed;
  }, [courses, enrollmentsMap, activeLegacySessions, userCompletions]);

  const roadmapPercentage = totalRoadmapModules > 0 
    ? Math.min(100, Math.round((completedRoadmapModules / totalRoadmapModules) * 100))
    : 0;

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Clean Simple Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Curriculum Roadmap</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Progressive Learning Pathway
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 font-normal">
            Clean progressive trajectory from fundamentals to verified robotics graduation.
          </p>
        </div>

        {hasContent && totalRoadmapModules > 0 && (
          <div className="px-5 py-3 rounded-2xl bg-slate-800/80 border border-slate-700/60 text-right shrink-0">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
              Roadmap Progress
            </span>
            <span className="text-sm sm:text-base font-black text-emerald-400">
              {completedRoadmapModules} / {totalRoadmapModules} Modules ({roadmapPercentage}%)
            </span>
          </div>
        )}
      </div>

      {loading ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-16 text-center shadow-xs">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mx-auto mb-3" />
          <p className="text-xs font-bold text-slate-700">Loading curriculum roadmap from database...</p>
        </div>
      ) : !hasContent ? (
        /* Clean Empty State when no courses have been added */
        <div className="bg-white border border-dashed border-slate-200 rounded-3xl p-16 text-center shadow-xs space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
            <TrendingUp className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">No Curriculum Roadmap Published Yet</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
              The curriculum roadmap and level milestones will automatically generate and appear here when courses are added and published in the database.
            </p>
          </div>
          {isAdmin && onNavigateTab && (
            <button
              onClick={() => onNavigateTab('admin-center')}
              className="mt-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition inline-flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <span>Open Admin LMS Studio</span>
            </button>
          )}
        </div>
      ) : (
        /* Real dynamic content populated strictly from published courses */
        <div className="space-y-6">
          {/* Milestone Ribbons for Existing Courses */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                Published Level Milestones
              </h2>
              <span className="text-xs font-bold text-emerald-600">
                {completedRoadmapModules} of {totalRoadmapModules} Modules Completed ({roadmapPercentage}%)
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
              {courses.map((course, idx) => {
                const enrollment = enrollmentsMap[course.id];
                const totalCourseMods = course.modules?.length || course.totalModulesCount || 1;
                const completedCourseMods = enrollment?.completedModuleIds?.length || 0;
                const isCompleted = completedCourseMods >= totalCourseMods && totalCourseMods > 0;
                const isCurrent = completedCourseMods > 0 && !isCompleted;
                const isExpanded = !!expandedCourseIds[course.id];

                return (
                  <button
                    key={course.id}
                    onClick={() => toggleCourseExpand(course.id)}
                    className={`p-3 rounded-2xl border text-center flex flex-col items-center justify-between space-y-1.5 transition-all cursor-pointer ${
                      isCompleted
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-950 hover:bg-emerald-100/60'
                        : isCurrent
                        ? 'bg-slate-900 border-slate-900 text-white shadow-md ring-2 ring-emerald-500/50'
                        : isExpanded
                        ? 'bg-indigo-50 border-indigo-300 text-indigo-950'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100/80'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                      isCompleted 
                        ? 'bg-emerald-600 text-white' 
                        : isCurrent 
                        ? 'bg-emerald-500 text-slate-950' 
                        : 'bg-slate-200 text-slate-700'
                    }`}>
                      {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : `M${idx + 1}`}
                    </div>

                    <div className="w-full">
                      <div className={`text-[11px] font-black leading-tight truncate ${isCurrent ? 'text-white' : 'text-slate-900'}`}>
                        {course.title}
                      </div>
                      <div className="text-[9px] truncate opacity-75 mt-0.5">
                        {course.level || 'Standard'} · {totalCourseMods} mod
                      </div>
                    </div>

                    <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                      isCompleted 
                        ? 'bg-emerald-200 text-emerald-900' 
                        : isCurrent 
                        ? 'bg-emerald-400 text-slate-950' 
                        : 'bg-slate-200 text-slate-600'
                    }`}>
                      {isCompleted ? 'Done' : isCurrent ? 'Active' : 'Roadmap'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Detailed Course & Level Cards */}
          <div className="space-y-4">
            {courses.map((course, idx) => {
              const isExpanded = expandedCourseIds[course.id] ?? (idx === 0);
              const enrollment = enrollmentsMap[course.id];
              const totalCourseMods = course.modules?.length || course.totalModulesCount || 1;
              const completedCourseMods = enrollment?.completedModuleIds?.length || 0;
              const coursePercentage = totalCourseMods > 0 ? Math.round((completedCourseMods / totalCourseMods) * 100) : 0;
              const isCourseMastered = completedCourseMods >= totalCourseMods && totalCourseMods > 0;

              return (
                <div
                  key={course.id}
                  className={`bg-white border rounded-2xl overflow-hidden transition-all duration-200 shadow-xs ${
                    isExpanded ? 'border-slate-300 ring-1 ring-slate-200' : 'border-slate-200'
                  }`}
                >
                  {/* Clean Level / Course Header */}
                  <div
                    onClick={() => toggleCourseExpand(course.id)}
                    className="p-4 sm:p-5 bg-white hover:bg-slate-50 cursor-pointer flex items-center justify-between gap-4 transition"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
                        isCourseMastered 
                          ? 'bg-emerald-600 text-white' 
                          : 'bg-slate-950 text-emerald-400'
                      }`}>
                        M{idx + 1}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-sm font-black text-slate-900 truncate">{course.title}</h3>
                          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[9px] font-bold uppercase">
                            {course.level || 'All Levels'}
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[9px] font-bold uppercase">
                            {course.track || 'Robotics'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                          {course.shortSummary || course.description || 'Hands-on curriculum milestone.'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right hidden sm:block">
                        <span className="text-xs font-bold text-slate-700">
                          {completedCourseMods}/{totalCourseMods}
                        </span>
                        <span className="text-[10px] text-slate-400 block">{coursePercentage}%</span>
                      </div>
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                    </div>
                  </div>

                  {/* Modules List inside Course */}
                  {isExpanded && (
                    <div className="border-t border-slate-100 bg-slate-50/50 p-4 sm:p-5 space-y-3">
                      {course.modules && course.modules.length > 0 ? (
                        <div className="divide-y divide-slate-100 bg-white rounded-xl border border-slate-200 overflow-hidden">
                          {course.modules.map((module) => {
                            const isDone = enrollment?.completedModuleIds?.includes(module.id);

                            return (
                              <div
                                key={module.id}
                                className="p-3.5 sm:px-4 flex items-center justify-between gap-3 hover:bg-slate-50/80 transition"
                              >
                                <div className="flex items-center gap-3 min-w-0">
                                  <div className={`shrink-0 ${isDone ? 'text-emerald-600' : 'text-slate-300'}`}>
                                    {isDone ? <CheckCircle2 className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                                  </div>
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-2">
                                      <span className="font-mono text-[10px] font-bold text-slate-400">
                                        MOD {module.moduleNumber || 1}
                                      </span>
                                      <span className="text-xs font-bold text-slate-900 truncate">
                                        {module.title}
                                      </span>
                                      {module.skillArea && (
                                        <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 text-[8px] font-bold shrink-0">
                                          {module.skillArea}
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-[10px] text-slate-500 truncate mt-0.5">
                                      {module.description || module.theoryOverview || 'Practical engineering module.'}
                                    </p>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                  {module.durationMinutes && (
                                    <span className="text-[10px] text-slate-400 font-medium hidden sm:inline">
                                      {module.durationMinutes}m
                                    </span>
                                  )}
                                  <button
                                    onClick={() => setActivePlayerCourse(course)}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition cursor-pointer ${
                                      isDone
                                        ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                                        : 'bg-slate-900 hover:bg-indigo-600 text-white shadow-xs'
                                    }`}
                                  >
                                    <Play className="w-3 h-3 fill-current" />
                                    <span>{isDone ? 'Review' : 'Start'}</span>
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="p-6 text-center text-xs text-slate-400 bg-white rounded-xl border border-slate-200">
                          Course overview enrolled. Open course player to begin learning.
                        </div>
                      )}

                      <div className="pt-2 flex justify-end">
                        <button
                          onClick={() => setActivePlayerCourse(course)}
                          className="px-4 py-2 bg-slate-900 hover:bg-indigo-600 text-white text-xs font-bold rounded-xl transition flex items-center gap-2 cursor-pointer shadow-xs"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>Open Course Player</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Legacy Sessions (if any exist in database/catalog) */}
            {activeLegacyLevels.map(level => {
              const levelSessions = activeLegacySessions.filter(s => s.levelNumber === level.levelNumber);
              const completedInLevel = levelSessions.filter(s => userCompletions[s.id]?.isFullyCompleted).length;
              const levelPercentage = levelSessions.length > 0 ? Math.round((completedInLevel / levelSessions.length) * 100) : 0;
              const isLevelMastered = completedInLevel === levelSessions.length && levelSessions.length > 0;
              const isCurrent = userOverall.currentLevel === level.levelNumber;

              return (
                <div
                  key={level.levelNumber}
                  className={`bg-white border rounded-2xl overflow-hidden transition-all duration-200 shadow-xs ${
                    isCurrent ? 'border-emerald-500/50 ring-1 ring-emerald-500/20' : 'border-slate-200'
                  }`}
                >
                  <div
                    onClick={() => toggleCourseExpand(`legacy-${level.levelNumber}`)}
                    className="p-4 sm:p-5 bg-white hover:bg-slate-50 cursor-pointer flex items-center justify-between gap-4 transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
                        isLevelMastered ? 'bg-emerald-600 text-white' : 'bg-slate-950 text-emerald-400'
                      }`}>
                        L{level.levelNumber}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-black text-slate-900">{level.title}</h3>
                          {isCurrent && (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[9px] font-black uppercase">
                              Current Level
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 line-clamp-1">{level.tagline}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right hidden sm:block">
                        <span className="text-xs font-bold text-slate-700">{completedInLevel}/{levelSessions.length}</span>
                        <span className="text-[10px] text-slate-400 block">{levelPercentage}%</span>
                      </div>
                      {expandedCourseIds[`legacy-${level.levelNumber}`] ? (
                        <ChevronUp className="w-4 h-4 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      )}
                    </div>
                  </div>

                  {expandedCourseIds[`legacy-${level.levelNumber}`] && (
                    <div className="divide-y divide-slate-100 border-t border-slate-100 bg-slate-50/50">
                      {levelSessions.map(session => {
                        const comp = userCompletions[session.id] || {};
                        const isSessionDone = comp.isFullyCompleted;
                        const { isUnlocked } = checkSessionPrerequisites(userId, session.id, userCompletions);

                        return (
                          <div
                            key={session.id}
                            className="p-3.5 sm:px-5 flex items-center justify-between gap-3 hover:bg-white transition"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className={`shrink-0 ${isSessionDone ? 'text-emerald-600' : 'text-slate-300'}`}>
                                {isSessionDone ? <CheckCircle2 className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="font-mono text-[11px] font-bold text-slate-500">{session.id}</span>
                                  <span className="text-xs font-bold text-slate-900 truncate">{session.title}</span>
                                </div>
                                <p className="text-[10px] text-slate-500 truncate">{session.learningObjective}</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <span className="text-[10px] text-slate-400 font-medium hidden sm:inline">
                                {session.durationMinutes}m
                              </span>
                              {isUnlocked ? (
                                <button
                                  onClick={() => onSelectSession(session.id)}
                                  className="px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition cursor-pointer bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs"
                                >
                                  <Play className="w-3 h-3 fill-current" />
                                  <span>{isSessionDone ? 'Review' : 'Start'}</span>
                                </button>
                              ) : (
                                <span className="px-2.5 py-1 bg-slate-100 text-slate-400 text-[10px] font-bold rounded-lg cursor-not-allowed">
                                  Locked
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Universal LMS Course Player Modal for Courses in Roadmap */}
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
