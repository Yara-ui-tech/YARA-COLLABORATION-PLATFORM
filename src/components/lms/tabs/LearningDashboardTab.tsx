import React from 'react';
import { 
  Play, 
  CheckCircle2, 
  Lock, 
  Award, 
  Clock, 
  Zap, 
  ArrowRight, 
  Layers, 
  HelpCircle, 
  FileText, 
  Wrench, 
  Cpu, 
  ShieldCheck, 
  Bot, 
  Lightbulb, 
  ChevronRight,
  TrendingUp,
  AlertCircle,
  CreditCard,
  Package,
  Code2,
  Zap,
  GraduationCap
} from 'lucide-react';
import { LearnerLevelNumber } from '../../../types/yaraLms';
import { COMPLETE_YARA_SESSIONS } from '../../../constants/yaraLmsCatalog';
import { YARA_LMS_LEVELS } from '../../../constants/yaraLmsData';

interface Props {
  userOverall: {
    completedCount: number;
    totalSessions: number;
    percentage: number;
    currentLevel: LearnerLevelNumber;
    currentLevelTitle: string;
    nextSession: { id: string; title: string } | null;
  };
  subscriptionStatus: {
    isActive: boolean;
    statusText: string;
    tier: string;
  };
  certificateStatus: {
    isEligible: boolean;
    issued: boolean;
  };
  quizStats: {
    averageScore: number;
    quizzesPassed: number;
    totalQuizzes: number;
  };
  onStartSession: (sessionId: string) => void;
  onNavigateTab: (tab: any) => void;
}

export const LearningDashboardTab: React.FC<Props> = ({
  userOverall,
  subscriptionStatus,
  certificateStatus,
  quizStats,
  onStartSession,
  onNavigateTab
}) => {
  const nextSessionId = userOverall.nextSession?.id || 'S00';
  const nextSessionDetails = COMPLETE_YARA_SESSIONS.find(s => s.id === nextSessionId) || COMPLETE_YARA_SESSIONS[0];

  const lockedCount = Math.max(0, userOverall.totalSessions - userOverall.completedCount);

  // Skill matrices for all levels
  const skillDomains = [
    { title: 'Level 0: Curious Beginner', desc: 'Robotics anatomy, definitions, real-world systems', icon: Bot, level: 0 },
    { title: 'Level 1: Electronics Beginner', desc: "Ohm's Law, breadboards, multimeter, sensors & LEDs", icon: Cpu, level: 1 },
    { title: 'Level 2: Block Programmer', desc: 'Algorithms, event loops, logic blocks, simulators', icon: Layers, level: 2 },
    { title: 'Level 3: Embedded Programmer', desc: 'Arduino, ESP32, C++, GPIO, PWM, sensor calibration', icon: Cpu, level: 3 },
    { title: 'Level 4: Robot Builder', desc: 'Chassis mechanics, kinematics, H-Bridges, BOM costing', icon: Wrench, level: 4 },
    { title: 'Level 5: Robot Engineer', desc: 'Obstacle avoidance, line tracking, fault diagnosis labs', icon: Bot, level: 5 },
    { title: 'Level 6: IoT / AI Explorer', desc: 'Wi-Fi telemetry, MQTT, cloud dashboards, vision tracking', icon: Zap, level: 6 },
    { title: 'Level 7: Problem Solver', desc: '5 Whys discovery, stakeholder empathy, design thinking', icon: Lightbulb, level: 7 },
    { title: 'Level 8: Young Innovator', desc: '21-point documentation, 90-sec pitch, Capstone build', icon: Award, level: 8 }
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* 1. Flagship Primary Course Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl text-white p-6 sm:p-10 shadow-2xl border border-slate-800"
        style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 40%, #0c2c1e 100%)' }}>
        <div className="orb w-96 h-96 -top-20 -right-20" style={{ background: 'rgba(16,185,129,0.12)' }} />
        <div className="orb-reverse orb w-80 h-80 bottom-0 left-1/3" style={{ background: 'rgba(79,70,229,0.10)' }} />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          <div className="space-y-4 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-emerald-400 text-xs font-bold" style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)' }}>
              <Zap className="w-3.5 h-3.5" /> Flagship Course Track
            </div>

            <div>
              <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white leading-tight">
                YARA ROBOTICS & INNOVATION FOUNDATION
              </h1>
              <p className="text-sm sm:text-base font-semibold mt-1" style={{ color: 'rgba(52,211,153,0.9)' }}>
                From Zero to Robotics Innovator — Level 0 to Level 8
              </p>
            </div>

            {/* Philosophy Pill */}
            <div className="p-3.5 rounded-2xl" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">
                Foundational Learning Philosophy
              </div>
              <div className="text-xs sm:text-sm font-bold text-slate-200 flex flex-wrap items-center gap-1.5">
                <span className="text-emerald-400">Learn</span> → 
                <span className="text-cyan-400">Simulate</span> → 
                <span className="text-blue-400">Build</span> → 
                <span className="text-indigo-400">Test</span> → 
                <span className="text-purple-400">Debug</span> → 
                <span className="text-pink-400">Research</span> → 
                <span className="text-amber-400">Innovate</span> → 
                <span className="text-emerald-300 font-black">Demonstrate</span>
              </div>
            </div>

            {/* Status Summary row */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 pt-1">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Current: <strong className="text-white">{userOverall.currentLevelTitle}</strong></span>
              </div>
              <span>•</span>
              <div>
                Completed: <strong className="text-emerald-400">{userOverall.completedCount}</strong> / {userOverall.totalSessions} Sessions
              </div>
              <span>•</span>
              <div>
                Quiz Avg: <strong className="text-amber-300">{quizStats.averageScore}%</strong>
              </div>
            </div>
          </div>

          {/* Next Lesson Callout Card */}
          <div className="w-full lg:w-80 rounded-2xl p-5 shadow-xl flex flex-col justify-between shrink-0 space-y-4" style={{ background: 'rgba(15,23,42,0.9)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(12px)' }}>
            <div>
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                <span className="font-bold uppercase tracking-wider text-emerald-400">Next Milestone</span>
                <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] font-mono">{nextSessionDetails.id}</span>
              </div>
              <h3 className="text-sm font-bold text-white line-clamp-2">
                {nextSessionDetails.title}
              </h3>
              <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                {nextSessionDetails.learningObjective}
              </p>
            </div>

            <button
              onClick={() => onStartSession(nextSessionDetails.id)}
              className="w-full py-3 px-4 text-slate-950 text-xs font-black rounded-xl flex items-center justify-center gap-2 transition-all duration-200 shadow-lg active:scale-98"
              style={{ background: 'linear-gradient(135deg, #10b981, #059669)', boxShadow: '0 4px 16px rgba(16,185,129,0.3)' }}
            >
              <Play className="w-4 h-4 fill-slate-950" />
              <span>Resume Session ({nextSessionDetails.id})</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Key Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Progress */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between hover:shadow-md transition">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>Overall Progress</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-3">
            <div className="text-3xl font-black text-slate-900">{userOverall.percentage}%</div>
            <div className="w-full bg-slate-100 h-2 rounded-full mt-2 overflow-hidden">
              <div className="h-full rounded-full transition-all progress-animated"
                style={{ width: `${userOverall.percentage}%`, background: 'linear-gradient(90deg, #059669, #10b981)' }} />
            </div>
            <div className="text-[11px] text-slate-500 mt-2">
              {userOverall.completedCount} done • {lockedCount} remaining
            </div>
          </div>
        </div>

        {/* Quiz Performance */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between hover:shadow-md transition">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>Quiz Mastery</span>
            <CheckCircle2 className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="mt-3">
            <div className="text-3xl font-black text-slate-900">{quizStats.averageScore}%</div>
            <div className="text-[11px] text-slate-500 mt-2">
              {quizStats.quizzesPassed} of {quizStats.totalQuizzes} quizzes passed
            </div>
            <button
              onClick={() => onNavigateTab('assessments')}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 mt-2 transition"
            >
              Quiz Bank <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Subscription Status */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between hover:shadow-md transition">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>YARA Membership</span>
            <CreditCard className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-3">
            <div className="flex items-center gap-2">
              <span className={`inline-block w-2.5 h-2.5 rounded-full ${subscriptionStatus.isActive ? 'bg-emerald-500' : 'bg-amber-500'}`} />
              <div className="text-base font-black text-slate-900 capitalize">
                {subscriptionStatus.statusText}
              </div>
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Tier: <strong className="text-slate-700">{subscriptionStatus.tier}</strong>
            </div>
            <button
              onClick={() => onNavigateTab('subscription')}
              className="text-xs font-bold text-emerald-600 hover:text-emerald-800 flex items-center gap-1 mt-2 transition"
            >
              Manage <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Certificate Status */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between hover:shadow-md transition">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>Certificates</span>
            <Award className="w-4 h-4 text-purple-600" />
          </div>
          <div className="mt-3">
            <div className="text-base font-black text-slate-900 flex items-center gap-1.5">
              {certificateStatus.isEligible ? (
                <span className="text-emerald-600 flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4" /> Unlocked
                </span>
              ) : (
                <span className="text-slate-600 flex items-center gap-1">
                  <Lock className="w-4 h-4 text-slate-400" /> 8 Criteria
                </span>
              )}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              {certificateStatus.isEligible ? 'Ready to issue & verify' : 'Course + membership required'}
            </div>
            <button
              onClick={() => onNavigateTab('certificates')}
              className="text-xs font-bold text-purple-600 hover:text-purple-800 flex items-center gap-1 mt-2 transition"
            >
              View All <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* 3. Component Kit Requirement Callout */}
      <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-indigo-50 border border-emerald-200/80 rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-200/60 text-emerald-900 text-[10px] font-black uppercase tracking-wider mb-1">
              🧰 Official YARA Hardware Kits
            </div>
            <h4 className="text-sm font-bold text-slate-900">
              Need components for hands-on sessions (Breadboards, Arduino, ESP32, Motors & Sensors)?
            </h4>
            <p className="text-xs text-slate-600 mt-0.5">
              Contact YARA on <strong className="text-slate-900 font-bold">0717468236</strong> to purchase or obtain the official learning components.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => onNavigateTab('resources')}
            className="w-full sm:w-auto px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition shadow-xs flex items-center justify-center gap-1.5 shrink-0"
          >
            <Package className="w-4 h-4" /> View Hardware Kits
          </button>
        </div>
      </div>

      {/* 4. Level 0 → Level 8 Pathway Progression Grid */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight">
              Curriculum Roadmap: Level 0 to Level 8
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Structured progressive mastery from complete novice to verified robotics innovator.
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('progress')}
            className="text-xs font-bold text-emerald-600 hover:text-emerald-800 flex items-center gap-1"
          >
            View Full Pathway Graph <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {skillDomains.map((domain) => {
            const Icon = domain.icon;
            const levelInfo = YARA_LMS_LEVELS.find(l => l.levelNumber === domain.level);
            const isCurrent = userOverall.currentLevel === domain.level;
            const isCompleted = userOverall.currentLevel > domain.level;

            return (
              <div 
                key={domain.level}
                className={`p-4 rounded-2xl border transition-all duration-200 flex flex-col justify-between ${
                  isCurrent
                    ? 'bg-emerald-50/50 border-emerald-300 ring-2 ring-emerald-500/20 shadow-sm'
                    : isCompleted
                    ? 'bg-slate-50/80 border-slate-200 text-slate-700'
                    : 'bg-white border-slate-200/80 hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700 font-bold text-xs">
                      L{domain.level}
                    </span>
                    {isCompleted ? (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Mastered
                      </span>
                    ) : isCurrent ? (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold animate-pulse">
                        In Progress
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-bold flex items-center gap-1">
                        <Lock className="w-2.5 h-2.5" /> Locked
                      </span>
                    )}
                  </div>

                  <h3 className="text-xs font-bold text-slate-900">{domain.title}</h3>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{domain.desc}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">{levelInfo?.sessions.length || 4} Sessions</span>
                  <button
                    onClick={() => onNavigateTab('courses')}
                    className="font-bold text-emerald-600 hover:text-emerald-700"
                  >
                    View Sessions →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Quick Access Action Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div 
          onClick={() => onNavigateTab('projects')}
          className="bg-white border border-slate-200 hover:border-indigo-300 rounded-2xl p-5 shadow-sm cursor-pointer transition group hover:shadow-md"
        >
          <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3 group-hover:scale-105 transition">
            <Lightbulb className="w-5 h-5" />
          </div>
          <h4 className="text-xs font-bold text-slate-900">Innovation Portfolio & Capstone</h4>
          <p className="text-[11px] text-slate-500 mt-1">
            Curate your 5 Whys, schematics, and final Capstone project.
          </p>
        </div>

        <div 
          onClick={() => onNavigateTab('assessments')}
          className="bg-white border border-slate-200 hover:border-emerald-300 rounded-2xl p-5 shadow-sm cursor-pointer transition group hover:shadow-md"
        >
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 group-hover:scale-105 transition">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <h4 className="text-xs font-bold text-slate-900">Randomized Exam Bank</h4>
          <p className="text-[11px] text-slate-500 mt-1">
            Test your knowledge with multi-choice, hardware and code evaluations.
          </p>
        </div>

        <div 
          onClick={() => onNavigateTab('programming')}
          className="bg-white hover:border-violet-300 rounded-2xl p-5 shadow-sm cursor-pointer transition group hover:shadow-md overflow-hidden relative"
          style={{ border: '1.5px solid #e0e7ff', background: 'linear-gradient(135deg, #f5f3ff 0%, white 60%)' }}
        >
          <div className="absolute top-0 right-0 w-20 h-20 rounded-full blur-2xl opacity-30" style={{ background: '#7c3aed' }} />
          <div className="relative z-10">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3 group-hover:scale-105 transition" style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}>
              <Code2 className="w-5 h-5 text-white" />
            </div>
            <h4 className="text-xs font-bold text-slate-900">Programming Courses</h4>
            <p className="text-[11px] text-slate-500 mt-1">
              Python · JavaScript · Scratch — with instant certificates on completion.
            </p>
            <div className="mt-2 text-[10px] font-black text-indigo-600 flex items-center gap-0.5">
              Explore Courses <ChevronRight className="w-3 h-3" />
            </div>
          </div>
        </div>

        <div 
          onClick={() => onNavigateTab('certificates')}
          className="bg-white border border-slate-200 hover:border-amber-300 rounded-2xl p-5 shadow-sm cursor-pointer transition group hover:shadow-md"
        >
          <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3 group-hover:scale-105 transition">
            <Award className="w-5 h-5" />
          </div>
          <h4 className="text-xs font-bold text-slate-900">Official Certificates</h4>
          <p className="text-[11px] text-slate-500 mt-1">
            View robotics & programming certificates, share credentials.
          </p>
        </div>
      </div>
    </div>
  );
};
