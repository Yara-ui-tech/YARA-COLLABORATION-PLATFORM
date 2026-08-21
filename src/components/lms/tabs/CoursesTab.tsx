import React, { useState } from 'react';
import { 
  BookOpen, 
  Search, 
  Filter, 
  Play, 
  CheckCircle2, 
  Lock, 
  Clock, 
  Sparkles, 
  Cpu, 
  Layers, 
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
  Film
} from 'lucide-react';
import { YARALmsSession, LearnerLevelNumber } from '../../../types/yaraLms';
import { COMPLETE_YARA_SESSIONS } from '../../../constants/yaraLmsCatalog';
import { YARA_LMS_LEVELS } from '../../../constants/yaraLmsData';
import { checkSessionPrerequisites } from '../../../services/yaraLmsService';
import { useAuth } from '../../AuthContext';
import { AdminSessionVideoModal } from '../AdminSessionVideoModal';

interface Props {
  userId: string;
  userCompletions: Record<string, any>;
  onSelectSession: (sessionId: string) => void;
  onNavigateTab: (tab: any) => void;
}

export const CoursesTab: React.FC<Props> = ({
  userId,
  userCompletions,
  onSelectSession,
  onNavigateTab
}) => {
  const { profile } = useAuth();
  const isAdmin = profile?.role === 'admin';

  const [selectedLevel, setSelectedLevel] = useState<number | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'online' | 'practical' | 'hardware'>('all');
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null);
  const [adminVideoModalSession, setAdminVideoModalSession] = useState<{ id: string; title: string } | null>(null);

  // Filter sessions
  const filteredSessions = COMPLETE_YARA_SESSIONS.filter(session => {
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

  const toggleExpand = (sessionId: string) => {
    setExpandedSessionId(prev => (prev === sessionId ? null : sessionId));
  };

  return (
    <div className="space-y-8 pb-12">
      {/* 1. Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl">
        <div className="max-w-3xl space-y-3 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
            <BookOpen className="w-3.5 h-3.5" /> Full Foundation Curriculum
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            YARA Robotics & Innovation Foundation Programme
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
            A continuous pathway spanning 42 structured sessions across 9 distinct progression tiers: 
            from Curious Beginner (Level 0) to verified Young Innovator (Level 8).
          </p>
          <div className="text-xs font-bold text-emerald-400 pt-1">
            Philosophy: Learn → Simulate → Build → Test → Debug → Research → Innovate → Demonstrate
          </div>
        </div>
      </div>

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
            No curriculum sessions match your current filter. Try resetting search or level filters.
          </div>
        ) : (
          filteredSessions.map((session) => {
            const completion = userCompletions[session.id] || {};
            const isCompleted = completion.isFullyCompleted;
            const { isUnlocked, missingPrerequisites } = checkSessionPrerequisites(userId, session.id);
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
                        <span className="font-bold text-slate-900 block mb-0.5">🎯 Learning Objective:</span>
                        <p className="text-slate-600 leading-relaxed">{session.learningObjective}</p>
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 block mb-0.5">💡 Why Learn This:</span>
                        <p className="text-slate-600 leading-relaxed">{session.whyLearnThis}</p>
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 block mb-0.5">🛠️ What You Will Build:</span>
                        <p className="text-slate-600 leading-relaxed">{session.whatYouWillBuild}</p>
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 block mb-0.5">🚀 Innovator Contribution:</span>
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
      </div>

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
    </div>
  );
};
