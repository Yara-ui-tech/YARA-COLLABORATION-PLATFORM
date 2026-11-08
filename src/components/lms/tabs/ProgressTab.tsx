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
  Layers, 
  Cpu, 
  Bot, 
  Wrench, 
  Lightbulb, 
  ArrowRight,
  Sparkles
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
  // By default, expand only the current active level to keep it clean and simple!
  const [expandedLevels, setExpandedLevels] = useState<Record<number, boolean>>(() => {
    const init: Record<number, boolean> = {};
    for (let i = 0; i <= 8; i++) {
      init[i] = i === userOverall.currentLevel;
    }
    return init;
  });

  const toggleLevel = (lvl: number) => {
    setExpandedLevels(prev => ({ ...prev, [lvl]: !prev[lvl] }));
  };

  const levelBadges = [
    { level: 0, title: 'Curious Beginner', desc: 'What is Robotics & Sensors', icon: Bot },
    { level: 1, title: 'Electronics', desc: 'Breadboards, LEDs & Resistors', icon: Cpu },
    { level: 2, title: 'Block Coding', desc: 'Scratch Logic & Sequences', icon: Layers },
    { level: 3, title: 'Microcontrollers', desc: 'Arduino C++ & MicroPython', icon: Cpu },
    { level: 4, title: 'Robot Builder', desc: 'Motors, Chassis & Drivers', icon: Wrench },
    { level: 5, title: 'Autonomous Systems', desc: 'Ultrasonic & Maze Solving', icon: Bot },
    { level: 6, title: 'IoT & Telemetry', desc: 'Wi-Fi, Bluetooth & Clouds', icon: Zap },
    { level: 7, title: 'Computer Vision / AI', desc: 'Line & Object Tracking', icon: Lightbulb },
    { level: 8, title: 'Capstone Innovator', desc: 'Continental Grand Showcase', icon: Award }
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Clean Simple Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Curriculum Roadmap</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Level 0 to Level 8 Master Pathway</h1>
          <p className="text-xs sm:text-sm text-slate-300 font-normal">
            Clean progressive trajectory from beginner circuits to verified continental robotics graduation.
          </p>
        </div>

        {userOverall.nextSession && (
          <button
            onClick={() => onSelectSession(userOverall.nextSession!.id)}
            className="px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2 cursor-pointer shrink-0"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Continue Next: {userOverall.nextSession.id}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* 2. Sleek Visual Level Milestones Ribbon */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">Level Milestones</h2>
          <span className="text-xs font-bold text-emerald-600">
            {userOverall.completedCount} of {userOverall.totalSessions} Sessions Completed ({userOverall.percentage}%)
          </span>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-2.5">
          {levelBadges.map(item => {
            const isCompleted = userOverall.currentLevel > item.level;
            const isCurrent = userOverall.currentLevel === item.level;

            return (
              <button
                key={item.level}
                onClick={() => toggleLevel(item.level)}
                className={`p-3 rounded-2xl border text-center flex flex-col items-center justify-between space-y-1.5 transition-all cursor-pointer ${
                  isCompleted
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-950 hover:bg-emerald-100/60'
                    : isCurrent
                    ? 'bg-slate-900 border-slate-900 text-white shadow-md ring-2 ring-emerald-500/50'
                    : 'bg-slate-50 border-slate-200 text-slate-400 hover:bg-slate-100/80'
                }`}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                  isCompleted ? 'bg-emerald-600 text-white' : isCurrent ? 'bg-emerald-500 text-slate-950' : 'bg-slate-200 text-slate-600'
                }`}>
                  {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : `L${item.level}`}
                </div>

                <div className="w-full">
                  <div className={`text-[11px] font-black leading-none truncate ${isCurrent ? 'text-white' : 'text-slate-900'}`}>
                    Level {item.level}
                  </div>
                  <div className="text-[9px] truncate opacity-75 mt-0.5">{item.title}</div>
                </div>

                <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                  isCompleted ? 'bg-emerald-200 text-emerald-900' : isCurrent ? 'bg-emerald-400 text-slate-950' : 'bg-slate-200 text-slate-600'
                }`}>
                  {isCompleted ? 'Done' : isCurrent ? 'Active' : 'Locked'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Clean, Streamlined Level Breakdown */}
      <div className="space-y-3">
        {YARA_LMS_LEVELS.map(level => {
          const isExpanded = expandedLevels[level.levelNumber];
          const levelSessions = COMPLETE_YARA_SESSIONS.filter(s => s.levelNumber === level.levelNumber);
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
              {/* Clean Level Header */}
              <div
                onClick={() => toggleLevel(level.levelNumber)}
                className="p-4 sm:p-5 bg-white hover:bg-slate-50 cursor-pointer flex items-center justify-between gap-4 transition"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
                    isLevelMastered ? 'bg-emerald-600 text-white' : isCurrent ? 'bg-slate-950 text-emerald-400' : 'bg-slate-100 text-slate-600'
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
                  {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </div>
              </div>

              {/* Sessions List (Clean & Compact) */}
              {isExpanded && (
                levelSessions.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400 bg-slate-50/50 border-t border-slate-100">
                    No curriculum sessions uploaded for Level {level.levelNumber} yet.
                  </div>
                ) : (
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
                              {session.hasPhysicalComponents && (
                                <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 text-[8px] font-bold shrink-0">
                                  Hardware
                                </span>
                              )}
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
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition cursor-pointer ${
                                isSessionDone ? 'bg-slate-200 hover:bg-slate-300 text-slate-800' : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs'
                              }`}
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
                )
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
