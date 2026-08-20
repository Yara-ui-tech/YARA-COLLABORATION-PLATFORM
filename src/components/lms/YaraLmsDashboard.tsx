import React, { useState, useEffect } from 'react';
import { 
  Compass, 
  BookOpen, 
  Award, 
  FolderGit2, 
  ShoppingBag, 
  Play, 
  CheckCircle, 
  Lock, 
  Clock, 
  Cpu, 
  Bot, 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  Search,
  Filter,
  Layers,
  HelpCircle,
  FileText
} from 'lucide-react';
import { 
  YARALmsSession, 
  LearnerLevelNumber, 
  LearnerPortfolio 
} from '../../types/yaraLms';
import { 
  YARA_LEARNING_LEVELS, 
  COMPLETE_YARA_SESSIONS, 
  getSessionsByLevel, 
  getSessionById 
} from '../../constants/yaraLmsCatalog';
import { 
  calculateUserOverallProgress, 
  getAllUserCompletions, 
  buildLearnerPortfolio,
  checkSessionPrerequisites
} from '../../services/yaraLmsService';
import { YaraLmsSessionPlayer } from './YaraLmsSessionPlayer';
import { YaraLmsPortfolioView } from './YaraLmsPortfolioView';
import { YaraLmsCapstoneSubmissionModal } from './YaraLmsCapstoneSubmissionModal';
import { YaraLmsCertificateModal } from './YaraLmsCertificateModal';
import { YaraLmsStarterKitStore } from './YaraLmsStarterKitStore';

interface Props {
  userId: string;
  studentName: string;
  userEmail: string;
  onNavigateToMembership?: () => void;
}

export const YaraLmsDashboard: React.FC<Props> = ({
  userId,
  studentName,
  userEmail,
  onNavigateToMembership
}) => {
  const [activeTab, setActiveTab] = useState<'pathway' | 'portfolio' | 'store'>('pathway');
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [selectedLevelFilter, setSelectedLevelFilter] = useState<number | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isCapstoneOpen, setIsCapstoneOpen] = useState(false);
  const [isCertificateOpen, setIsCertificateOpen] = useState(false);

  // Progress stats
  const [progressStats, setProgressStats] = useState<any>(null);
  const [portfolioData, setPortfolioData] = useState<LearnerPortfolio | null>(null);
  const [userCompletions, setUserCompletions] = useState<Record<string, any>>({});

  useEffect(() => {
    refreshProgress();
  }, [userId, studentName]);

  const refreshProgress = () => {
    const stats = calculateUserOverallProgress(userId);
    setProgressStats(stats);
    const comps = getAllUserCompletions(userId);
    setUserCompletions(comps);
    const port = buildLearnerPortfolio(userId, studentName);
    setPortfolioData(port);
  };

  const handleOpenSession = (sessionId: string) => {
    setSelectedSessionId(sessionId);
  };

  const handleCloseSession = () => {
    setSelectedSessionId(null);
    refreshProgress();
  };

  // If a session player is open, render player
  if (selectedSessionId) {
    const session = getSessionById(selectedSessionId);
    if (session) {
      return (
        <YaraLmsSessionPlayer
          session={session}
          userId={userId}
          onBack={handleCloseSession}
          onNavigateSession={(nextId) => setSelectedSessionId(nextId)}
          onRefreshProgress={refreshProgress}
        />
      );
    }
  }

  // Filtered sessions
  const filteredSessions = COMPLETE_YARA_SESSIONS.filter(s => {
    const matchLevel = selectedLevelFilter === 'all' || s.levelNumber === selectedLevelFilter;
    const matchSearch = searchQuery === '' || 
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      s.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.part.toLowerCase().includes(searchQuery.toLowerCase());
    return matchLevel && matchSearch;
  });

  return (
    <div className="space-y-8">
      {/* Top Banner & Hero Stats */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-2xl">
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
              <Sparkles size={14} /> YARA Robotics & Innovation Academy
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
              Welcome back, {studentName || 'Innovator'}!
            </h1>
            <p className="text-xs sm:text-sm text-slate-300">
              Your guided journey from <strong className="text-emerald-400">Level 0 (Curious Beginner)</strong> to <strong className="text-emerald-400">Level 8 (Young Innovator)</strong>.
            </p>
          </div>

          {/* Quick Action Badges */}
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => setIsCertificateOpen(true)}
              className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-bold rounded-xl shadow-lg flex items-center gap-2 transition"
            >
              <Award size={16} /> View Certificate
            </button>
            <button
              onClick={() => setIsCapstoneOpen(true)}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg flex items-center gap-2 transition"
            >
              <Bot size={16} /> Submit Capstone
            </button>
          </div>
        </div>

        {/* Progress Matrix */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-800">
          <div>
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Current Standing</div>
            <div className="text-sm sm:text-base font-bold text-white mt-1 truncate">
              {progressStats?.currentLevelTitle || 'Level 0 — Curious Beginner'}
            </div>
          </div>

          <div>
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Completed Sessions</div>
            <div className="text-sm sm:text-base font-bold text-emerald-400 mt-1">
              {progressStats?.completedCount || 0} / {progressStats?.totalSessions || 42}
            </div>
          </div>

          <div>
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Curriculum Progress</div>
            <div className="text-sm sm:text-base font-bold text-white mt-1 flex items-center gap-2">
              <span>{progressStats?.percentage || 0}%</span>
              <div className="w-16 h-2 bg-slate-800 rounded-full overflow-hidden inline-block">
                <div className="h-full bg-emerald-500" style={{ width: `${progressStats?.percentage || 0}%` }}></div>
              </div>
            </div>
          </div>

          <div>
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Up Next</div>
            {progressStats?.nextSession ? (
              <button
                onClick={() => handleOpenSession(progressStats.nextSession.id)}
                className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 mt-1 truncate"
              >
                {progressStats.nextSession.id} <ArrowRight size={12} />
              </button>
            ) : (
              <div className="text-xs font-bold text-emerald-400 mt-1">All Complete!</div>
            )}
          </div>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="flex items-center gap-3 border-b border-slate-800 pb-3 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('pathway')}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition ${
            activeTab === 'pathway'
              ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
              : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
          }`}
        >
          <Compass size={16} /> 8-Level Learning Pathway
        </button>

        <button
          onClick={() => setActiveTab('portfolio')}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition ${
            activeTab === 'portfolio'
              ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
              : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
          }`}
        >
          <FolderGit2 size={16} /> Automated Learner Portfolio
        </button>

        <button
          onClick={() => setActiveTab('store')}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition ${
            activeTab === 'store'
              ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
              : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
          }`}
        >
          <ShoppingBag size={16} /> Hardware Kits & Components Store
        </button>
      </div>

      {/* VIEW: PORTFOLIO */}
      {activeTab === 'portfolio' && portfolioData && (
        <YaraLmsPortfolioView
          portfolio={portfolioData}
          onOpenCapstone={() => setIsCapstoneOpen(true)}
        />
      )}

      {/* VIEW: HARDWARE STORE */}
      {activeTab === 'store' && (
        <YaraLmsStarterKitStore />
      )}

      {/* VIEW: 8-LEVEL PATHWAY */}
      {activeTab === 'pathway' && (
        <div className="space-y-8">
          {/* Level Filter & Search Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              <button
                onClick={() => setSelectedLevelFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                  selectedLevelFilter === 'all'
                    ? 'bg-emerald-500 text-slate-950'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                All Levels (0–8)
              </button>
              {YARA_LEARNING_LEVELS.map(lvl => (
                <button
                  key={lvl.levelNumber}
                  onClick={() => setSelectedLevelFilter(lvl.levelNumber)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-1 ${
                    selectedLevelFilter === lvl.levelNumber
                      ? 'bg-emerald-500 text-slate-950 font-bold'
                      : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  <span>{lvl.badgeIcon}</span>
                  <span>L{lvl.levelNumber}</span>
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative w-full sm:w-64">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search sessions, topics..."
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Level Roadmap Grid */}
          <div className="space-y-8">
            {YARA_LEARNING_LEVELS.filter(lvl => selectedLevelFilter === 'all' || lvl.levelNumber === selectedLevelFilter).map(lvl => {
              const sessionsInLevel = COMPLETE_YARA_SESSIONS.filter(s => {
                const inLvl = s.levelNumber === lvl.levelNumber;
                if (!inLvl) return false;
                if (searchQuery) {
                  return s.title.toLowerCase().includes(searchQuery.toLowerCase()) || s.id.toLowerCase().includes(searchQuery.toLowerCase());
                }
                return true;
              });

              if (sessionsInLevel.length === 0) return null;

              const levelCompletions = sessionsInLevel.filter(s => userCompletions[s.id]?.isFullyCompleted).length;
              const levelPct = Math.round((levelCompletions / sessionsInLevel.length) * 100);

              return (
                <div key={lvl.levelNumber} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6">
                  {/* Level Header */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-xl shadow-inner">
                        {lvl.badgeIcon}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 uppercase tracking-wider">
                            LEVEL {lvl.levelNumber}
                          </span>
                          <span className="text-xs text-slate-400">• {lvl.targetAudience}</span>
                        </div>
                        <h2 className="text-lg sm:text-xl font-bold text-white mt-0.5">{lvl.title}</h2>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-stretch sm:self-auto justify-between sm:justify-end">
                      <div className="text-right">
                        <div className="text-[11px] text-slate-400">Level Progress</div>
                        <div className="text-xs font-bold text-emerald-400">
                          {levelCompletions} / {sessionsInLevel.length} ({levelPct}%)
                        </div>
                      </div>
                      <div className="w-16 h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500" style={{ width: `${levelPct}%` }}></div>
                      </div>
                    </div>
                  </div>

                  {/* Sessions Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {sessionsInLevel.map(session => {
                      const comp = userCompletions[session.id];
                      const isComplete = comp?.isFullyCompleted;
                      const { isUnlocked } = checkSessionPrerequisites(userId, session.id);

                      return (
                        <div
                          key={session.id}
                          className={`rounded-2xl p-5 border flex flex-col justify-between transition-all ${
                            isComplete
                              ? 'bg-slate-950/80 border-emerald-500/30 shadow-sm'
                              : isUnlocked
                              ? 'bg-slate-950 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
                              : 'bg-slate-950/40 border-slate-800/40 opacity-70'
                          }`}
                        >
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-emerald-400">
                                {session.id}
                              </span>

                              {isComplete ? (
                                <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
                                  <CheckCircle size={14} /> Completed
                                </span>
                              ) : !isUnlocked ? (
                                <span className="flex items-center gap-1 text-[11px] font-semibold text-slate-500">
                                  <Lock size={12} /> Locked
                                </span>
                              ) : (
                                <span className="flex items-center gap-1 text-[11px] font-semibold text-amber-400">
                                  <Clock size={12} /> Ready
                                </span>
                              )}
                            </div>

                            <div>
                              <h3 className="text-sm font-bold text-white group-hover:text-emerald-400 transition line-clamp-2">
                                {session.title}
                              </h3>
                              <p className="text-xs text-slate-400 mt-1 line-clamp-2">{session.subtitle}</p>
                            </div>

                            {/* Indicators */}
                            <div className="flex items-center gap-2 flex-wrap text-[10px] text-slate-400 pt-1">
                              {session.video_url && (
                                <span className="flex items-center gap-1 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                                  <Play size={10} className="text-emerald-400" /> Video
                                </span>
                              )}
                              {session.quizQuestions && session.quizQuestions.length > 0 && (
                                <span className="flex items-center gap-1 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                                  <HelpCircle size={10} className="text-blue-400" /> Quiz
                                </span>
                              )}
                              {session.assignment && (
                                <span className="flex items-center gap-1 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                                  <FileText size={10} className="text-purple-400" /> Task
                                </span>
                              )}
                              {session.hasPhysicalComponents && (
                                <span className="flex items-center gap-1 bg-slate-900 px-2 py-0.5 rounded border border-slate-800 text-amber-300">
                                  <Cpu size={10} /> Kit Lab
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                            <span className="text-[11px] text-slate-500">{session.durationMinutes} mins</span>

                            <button
                              onClick={() => handleOpenSession(session.id)}
                              disabled={!isUnlocked}
                              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                                isComplete
                                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                                  : isUnlocked
                                  ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20'
                                  : 'bg-slate-900 text-slate-600 cursor-not-allowed'
                              }`}
                            >
                              {isComplete ? 'Review' : 'Launch'} <ArrowRight size={12} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modals */}
      <YaraLmsCapstoneSubmissionModal
        userId={userId}
        studentName={studentName}
        isOpen={isCapstoneOpen}
        onClose={() => setIsCapstoneOpen(false)}
        onSubmitted={refreshProgress}
      />

      <YaraLmsCertificateModal
        userId={userId}
        studentName={studentName}
        userEmail={userEmail}
        isOpen={isCertificateOpen}
        onClose={() => setIsCertificateOpen(false)}
        onNavigateToMembership={onNavigateToMembership}
      />
    </div>
  );
};
