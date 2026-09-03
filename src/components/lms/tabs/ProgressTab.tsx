import React, { useState } from 'react';
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
  ShieldCheck, 
  Layers, 
  Cpu, 
  Bot, 
  Wrench, 
  Lightbulb, 
  Printer
} from 'lucide-react';
import { LearnerLevelNumber } from '../../../types/yaraLms';
import { COMPLETE_YARA_SESSIONS } from '../../../constants/yaraLmsCatalog';
import { YARA_LMS_LEVELS } from '../../../constants/yaraLmsData';
import { checkSessionPrerequisites } from '../../../services/yaraLmsService';

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
}

export const ProgressTab: React.FC<Props> = ({
  userId,
  userOverall,
  userCompletions,
  onSelectSession
}) => {
  const [expandedLevels, setExpandedLevels] = useState<Record<number, boolean>>({
    0: true,
    1: true,
    2: true,
    3: true,
    4: true,
    5: true,
    6: true,
    7: true,
    8: true
  });

  const toggleLevel = (lvl: number) => {
    setExpandedLevels(prev => ({ ...prev, [lvl]: !prev[lvl] }));
  };

  const levelBadges = [
    { level: 0, title: 'Curious Beginner', icon: Bot, color: 'emerald' },
    { level: 1, title: 'Electronics Beginner', icon: Cpu, color: 'blue' },
    { level: 2, title: 'Block Programmer', icon: Layers, color: 'indigo' },
    { level: 3, title: 'Embedded Programmer', icon: Cpu, color: 'cyan' },
    { level: 4, title: 'Robot Builder', icon: Wrench, color: 'purple' },
    { level: 5, title: 'Robot Engineer', icon: Bot, color: 'pink' },
    { level: 6, title: 'IoT/AI Explorer', icon: Zap, color: 'teal' },
    { level: 7, title: 'Problem Solver', icon: Lightbulb, color: 'amber' },
    { level: 8, title: 'Young Innovator', icon: Award, color: 'emerald' }
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* 1. Header with Print button */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-2">
            <TrendingUp className="w-3.5 h-3.5" /> Official Mastery Pathway
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">Level 0 to Level 8 Progress Tree</h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Complete sequential progression from foundation concepts to verified hardware innovation.
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 flex items-center gap-2 transition"
        >
          <Printer className="w-4 h-4" /> Print Progress Report
        </button>
      </div>

      {/* 2. Visual Level Node Roadmap */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs">
        <h2 className="text-base font-black text-slate-900 mb-6">Mastery Milestones</h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          {levelBadges.map(item => {
            const Icon = item.icon;
            const isCompleted = userOverall.currentLevel > item.level;
            const isCurrent = userOverall.currentLevel === item.level;

            return (
              <div
                key={item.level}
                className={`p-4 rounded-2xl border text-center flex flex-col items-center justify-between space-y-2 transition ${
                  isCompleted
                    ? 'bg-emerald-50/60 border-emerald-300 text-emerald-950'
                    : isCurrent
                    ? 'bg-indigo-50/70 border-indigo-300 ring-2 ring-indigo-500/20 text-indigo-950 shadow-sm'
                    : 'bg-slate-50 border-slate-200 text-slate-400'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                  isCompleted ? 'bg-emerald-600 text-white' : isCurrent ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'
                }`}>
                  {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : `L${item.level}`}
                </div>

                <div>
                  <div className="text-xs font-black text-slate-900 leading-tight">Level {item.level}</div>
                  <div className="text-[10px] font-semibold text-slate-500 mt-0.5">{item.title}</div>
                </div>

                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                  isCompleted ? 'bg-emerald-100 text-emerald-800' : isCurrent ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-100 text-slate-500'
                }`}>
                  {isCompleted ? 'Passed' : isCurrent ? 'Active' : 'Locked'}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Deep Level Breakdown Accordions */}
      <div className="space-y-4">
        {YARA_LMS_LEVELS.map(level => {
          const isExpanded = expandedLevels[level.levelNumber] !== false;
          const levelSessions = COMPLETE_YARA_SESSIONS.filter(s => s.levelNumber === level.levelNumber);
          const completedInLevel = levelSessions.filter(s => userCompletions[s.id]?.isFullyCompleted).length;
          const levelPercentage = levelSessions.length > 0 ? Math.round((completedInLevel / levelSessions.length) * 100) : 0;
          const isLevelMastered = completedInLevel === levelSessions.length && levelSessions.length > 0;

          return (
            <div
              key={level.levelNumber}
              className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs"
            >
              {/* Level Accordion Header */}
              <div
                onClick={() => toggleLevel(level.levelNumber)}
                className="p-5 sm:p-6 bg-slate-50/60 hover:bg-slate-100/60 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition"
              >
                <div className="flex items-center gap-3.5">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shrink-0 ${
                    isLevelMastered ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-white'
                  }`}>
                    L{level.levelNumber}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-black text-slate-900">{level.title}</h3>
                      <span className="text-xs text-slate-500 font-medium">— {level.tagline}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{level.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 self-end sm:self-center">
                  <div className="text-right">
                    <div className="text-xs font-black text-slate-900">{completedInLevel} / {levelSessions.length} Sessions</div>
                    <div className="text-[10px] text-slate-500">{levelPercentage}% Complete</div>
                  </div>
                  <div className="w-20 bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${levelPercentage}%` }} />
                  </div>
                  {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </div>
              </div>

              {/* Sessions List within Level */}
              {isExpanded && (
                <div className="divide-y divide-slate-100 border-t border-slate-100">
                  {levelSessions.map(session => {
                    const comp = userCompletions[session.id] || {};
                    const isSessionDone = comp.isFullyCompleted;
                    const { isUnlocked } = checkSessionPrerequisites(userId, session.id);

                    return (
                      <div
                        key={session.id}
                        className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-slate-50/50 transition"
                      >
                        <div className="flex items-start gap-3">
                          <div className={`p-1 rounded-full mt-0.5 ${isSessionDone ? 'text-emerald-600' : 'text-slate-300'}`}>
                            {isSessionDone ? <CheckCircle2 className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-bold text-slate-800">{session.id}</span>
                              <span className="text-xs font-bold text-slate-900">{session.title}</span>
                              {session.hasPhysicalComponents && (
                                <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 text-[9px] font-bold">
                                  🧰 Hardware
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500 mt-0.5">{session.learningObjective}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 self-end sm:self-center">
                          <span className="text-[11px] text-slate-400 font-medium">
                            {session.durationMinutes} mins
                          </span>
                          {isUnlocked ? (
                            <button
                              onClick={() => onSelectSession(session.id)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition ${
                                isSessionDone ? 'bg-slate-100 hover:bg-slate-200 text-slate-700' : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                              }`}
                            >
                              <Play className="w-3 h-3" />
                              <span>{isSessionDone ? 'Review' : 'Start'}</span>
                            </button>
                          ) : (
                            <span className="px-3 py-1.5 bg-slate-100 text-slate-400 text-xs font-bold rounded-lg cursor-not-allowed">
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
  );
};
