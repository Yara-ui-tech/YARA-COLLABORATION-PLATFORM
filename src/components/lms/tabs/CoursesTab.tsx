import React, { useState } from 'react';
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
  Film, 
  Target,
  GraduationCap
} from 'lucide-react';
import { YARALmsSession, LearnerLevelNumber } from '../../../types/yaraLms';
import { COMPLETE_YARA_SESSIONS } from '../../../constants/yaraLmsCatalog';
import { YARA_LMS_LEVELS } from '../../../constants/yaraLmsData';
import { checkSessionPrerequisites } from '../../../services/yaraLmsService';
import { useAuth } from '../../AuthContext';
import { AdminSessionVideoModal } from '../AdminSessionVideoModal';
import { GreatLearningCertificateModal } from '../GreatLearningCertificateModal';

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
}

export const CoursesTab: React.FC<Props> = ({
  userId,
  userCompletions,
  onSelectSession,
  onNavigateTab
}) => {
  const { profile } = useAuth();
  const isAdmin = profile?.role === 'admin';

  const [selectedTier, setSelectedTier] = useState<number | 'all'>('all');
  const [selectedLevel, setSelectedLevel] = useState<number | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'online' | 'practical' | 'hardware'>('all');
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null);
  const [adminVideoModalSession, setAdminVideoModalSession] = useState<{ id: string; title: string } | null>(null);
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);

  // Filter sessions
  const filteredSessions = COMPLETE_YARA_SESSIONS.filter(session => {
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
            A continuous pathway structured into 4 authoritative tiers: 
            from Absolute Beginner or Explorer through to our elite Robotics Masterclass for Real World Applications and Deployment.
          </p>
          <div className="text-xs font-bold text-emerald-400 pt-1">
            Philosophy: Learn → Simulate → Build → Test → Debug → Research → Innovate → Demonstrate
          </div>
        </div>
      </div>

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

      {/* YARA Learning Academy Certification Guarantee Banner */}
      <div className="bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-indigo-500/10 border border-amber-500/20 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-500 shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-200">
                YARA Learning Academy Verified
              </span>
              <span className="text-xs font-bold text-slate-800">
                Official Certificate of Completion Included
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              Complete theoretical & practical sessions and score ≥70% on quizzes to unlock your verified credential with 1-click LinkedIn Add and vector PDF download.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsCertModalOpen(true)}
          className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs rounded-xl shadow-md transition shrink-0 cursor-pointer flex items-center gap-1.5"
        >
          <Award size={14} />
          <span>Certificate Criteria & Claim</span>
        </button>
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

      {/* Great Learning Certificate Claim Modal */}
      <GreatLearningCertificateModal
        isOpen={isCertModalOpen}
        onClose={() => setIsCertModalOpen(false)}
        userId={userId}
        userEmail={profile?.email || 'learner@yara.org'}
        defaultStudentName={profile?.display_name || 'YARA Learner'}
        courseId="robotics-foundation"
        courseTitle="YARA Robotics & Innovation Foundation Programme (Levels 0 — 8)"
        courseCategory="robotics"
      />
    </div>
  );
};
