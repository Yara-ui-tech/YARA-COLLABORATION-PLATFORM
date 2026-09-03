import React from 'react';
import { 
  GraduationCap, 
  Play, 
  CheckCircle2, 
  Clock, 
  Award, 
  Zap, 
  ArrowRight,
  TrendingUp,
  Bot,
  Cpu,
  Layers,
  Lightbulb
} from 'lucide-react';
import { LearnerLevelNumber } from '../../../types/yaraLms';
import { COMPLETE_YARA_SESSIONS } from '../../../constants/yaraLmsCatalog';

interface Props {
  userOverall: {
    completedCount: number;
    totalSessions: number;
    percentage: number;
    currentLevel: LearnerLevelNumber;
    currentLevelTitle: string;
    nextSession: { id: string; title: string } | null;
  };
  onStartSession: (sessionId: string) => void;
  onNavigateTab: (tab: any) => void;
}

export const MyCoursesTab: React.FC<Props> = ({
  userOverall,
  onStartSession,
  onNavigateTab
}) => {
  const tracks = [
    {
      id: 'foundation-primary',
      title: 'YARA Robotics & Innovation Foundation Programme',
      subtitle: 'From Zero to Robotics Innovator (Levels 0–8)',
      sessionsCount: 42,
      durationHours: 65,
      completed: userOverall.completedCount,
      percentage: userOverall.percentage,
      icon: Zap,
      color: 'emerald',
      status: 'Active Enrolled Track'
    },
    {
      id: 'electronics-track',
      title: 'Applied Electronics & Instrumentation Sub-Track',
      subtitle: "Ohm's Law, Breadboards, Multimeters & Sensors (Levels 0–1)",
      sessionsCount: 6,
      durationHours: 10,
      completed: Math.min(6, userOverall.completedCount),
      percentage: Math.min(100, Math.round((Math.min(6, userOverall.completedCount) / 6) * 100)),
      icon: Cpu,
      color: 'indigo',
      status: userOverall.completedCount >= 6 ? 'Mastered' : 'In Progress'
    },
    {
      id: 'robot-builder-track',
      title: 'Autonomous Mobile Robots & Motor Control Sub-Track',
      subtitle: 'Chassis, Kinematics, H-Bridges, Obstacle Avoidance & Line Following (Levels 4–5)',
      sessionsCount: 10,
      durationHours: 18,
      completed: Math.max(0, Math.min(10, userOverall.completedCount - 16)),
      percentage: Math.min(100, Math.round((Math.max(0, Math.min(10, userOverall.completedCount - 16)) / 10) * 100)),
      icon: Bot,
      color: 'blue',
      status: userOverall.completedCount >= 26 ? 'Mastered' : userOverall.completedCount >= 16 ? 'In Progress' : 'Prerequisites Pending'
    },
    {
      id: 'capstone-track',
      title: 'Design Thinking, 5 Whys & 21-Point Capstone Sub-Track',
      subtitle: 'Applied Engineering Research, Pitch Deck & Prototype Deployment (Levels 7–8)',
      sessionsCount: 11,
      durationHours: 22,
      completed: Math.max(0, Math.min(11, userOverall.completedCount - 31)),
      percentage: Math.min(100, Math.round((Math.max(0, Math.min(11, userOverall.completedCount - 31)) / 11) * 100)),
      icon: Lightbulb,
      color: 'amber',
      status: userOverall.completedCount >= 42 ? 'Mastered' : userOverall.completedCount >= 31 ? 'In Progress' : 'Prerequisites Pending'
    }
  ];

  return (
    <div className="space-y-8 pb-12">
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold mb-2">
              <GraduationCap className="w-3.5 h-3.5" /> Enrolled Learning Pathways
            </div>
            <h1 className="text-2xl font-black text-slate-900">My Robotics Learning Tracks</h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Active learning pathways with milestone synchronization and real-time laboratory progress.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigateTab('courses')}
              className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition"
            >
              Browse All Courses
            </button>
          </div>
        </div>

        {/* Tracks Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {tracks.map((track) => {
            const Icon = track.icon;
            return (
              <div 
                key={track.id}
                className="p-6 rounded-2xl border border-slate-200 bg-white hover:border-emerald-500/50 transition duration-200 shadow-xs flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="p-2.5 rounded-xl bg-slate-100 text-slate-800">
                      <Icon className="w-5 h-5" />
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      {track.status}
                    </span>
                  </div>

                  <h3 className="text-base font-black text-slate-900">{track.title}</h3>
                  <p className="text-xs text-slate-500 mt-1">{track.subtitle}</p>

                  <div className="flex items-center gap-4 text-xs text-slate-600 mt-4">
                    <span className="flex items-center gap-1 font-medium">
                      <Clock className="w-3.5 h-3.5 text-slate-400" /> ~{track.durationHours} Hours
                    </span>
                    <span className="flex items-center gap-1 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> {track.completed} / {track.sessionsCount} Sessions
                    </span>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-700">Track Mastery</span>
                    <span className="font-black text-emerald-600">{track.percentage}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-emerald-600 h-full rounded-full transition-all"
                      style={{ width: `${track.percentage}%` }}
                    />
                  </div>

                  <button
                    onClick={() => {
                      if (userOverall.nextSession?.id) {
                        onStartSession(userOverall.nextSession.id);
                      } else {
                        onNavigateTab('courses');
                      }
                    }}
                    className="w-full py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition"
                  >
                    <span>Continue Track</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
