import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Play, BookOpen, CheckCircle2, Clock, Trophy, Award, 
  ArrowRight, Brain, Cpu, Code, DollarSign, Bell, Star, 
  Sparkles, ShieldCheck, FileText, Check, AlertCircle, Users
} from 'lucide-react';
import { useAuth } from '../components/AuthContext';
import { supabase } from '../lib/supabase';
import { CURRICULUM } from '../constants/curriculum';
import { ASSETS } from '../constants/assets';

export default function LearnerDashboard() {
  const { profile, user } = useAuth();
  const navigate = useNavigate();

  const [feedbacks, setFeedbacks] = useState<Record<string, any>>({});
  const [completedCount, setCompletedCount] = useState(0);
  const [loadingProgress, setLoadingProgress] = useState(true);

  useEffect(() => {
    async function loadUserProgress() {
      if (!user?.id) return;
      try {
        const { data, error } = await supabase
          .from('curriculum_feedback')
          .select('*')
          .eq('user_id', user.id);

        if (!error && data) {
          const map = data.reduce((acc: any, item: any) => ({
            ...acc,
            [item.session_id]: item
          }), {});
          setFeedbacks(map);
          setCompletedCount(data.filter((d: any) => d.status === 'confident' || d.status === 'completed').length);
        }
      } catch {
        // Fallback
      } finally {
        setLoadingProgress(false);
      }
    }
    loadUserProgress();
  }, [user?.id]);

  // Find next unfinished session in curriculum
  const nextSession = CURRICULUM.find(s => 
    !feedbacks[s.id] || 
    feedbacks[s.id].status === 'struggling' || 
    feedbacks[s.id].status === 'partially'
  ) || CURRICULUM[0];

  const totalSessions = CURRICULUM.length;
  const progressPercent = Math.min(100, Math.round((completedCount / totalSessions) * 100));

  const courses = [
    {
      id: 'rob_beg',
      title: 'Level 1: Robotics Foundations & Embedded Systems (Beginner)',
      level: 'Beginner (10 Modules + 2 Capstones)',
      completedLessons: Math.min(completedCount, 10),
      totalLessons: 10,
      progress: Math.min(100, Math.round((Math.min(completedCount, 10) / 10) * 100)),
      currentLesson: nextSession ? `${nextSession.id}: ${nextSession.topic}` : 'Module 1: Systems Architecture',
      path: '/learning?tab=courses',
      icon: Cpu,
      color: 'from-blue-600 to-indigo-600'
    },
    {
      id: 'rob_int',
      title: 'Level 2: Autonomous Systems, PID Control & Aquatic Robotics (Intermediate)',
      level: 'Intermediate (12 Modules + 2 Capstones)',
      completedLessons: Math.max(0, Math.min(completedCount - 10, 12)),
      totalLessons: 12,
      progress: Math.min(100, Math.round((Math.max(0, Math.min(completedCount - 10, 12)) / 12) * 100)),
      currentLesson: 'Module 1: Advanced Embedded C++ & Interrupts',
      path: '/learning?tab=courses',
      icon: Brain,
      color: 'from-purple-600 to-indigo-600'
    },
    {
      id: 'rob_adv',
      title: 'Level 3: ROS 2, Computer Vision & Industrial Edge Robotics (Advanced)',
      level: 'Advanced (15 Modules + 2 Capstones)',
      completedLessons: Math.max(0, Math.min(completedCount - 22, 15)),
      totalLessons: 15,
      progress: Math.min(100, Math.round((Math.max(0, Math.min(completedCount - 22, 15)) / 15) * 100)),
      currentLesson: 'Module 1: Embedded Linux & Single Board Computers',
      path: '/learning?tab=courses',
      icon: Code,
      color: 'from-emerald-600 to-teal-600'
    }
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16 font-sans">
      
      {/* =========================================================================
          1. WELCOME & CONTINUE LEARNING HERO BANNER
         ========================================================================= */}
      <div className="relative rounded-[2.5rem] bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 text-white p-8 sm:p-10 border border-blue-500/20 shadow-2xl overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-bold uppercase tracking-wider">
                YARA Robotics Academy
              </span>
              <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-mono font-bold">
                ID: {profile?.member_id || 'YARA-2026-MEMBER'}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white leading-tight">
              Welcome back, <span className="text-blue-400">{profile?.display_name || 'Innovator'}</span>!
            </h1>

            <p className="text-slate-300 text-sm leading-relaxed">
              Continue your robotics engineering journey. Master circuit schematics, embedded programming, and autonomous navigation algorithms.
            </p>

            {/* Quick Metrics */}
            <div className="flex flex-wrap items-center gap-4 pt-2 text-xs font-semibold text-slate-300">
              <div className="flex items-center gap-2 bg-slate-900/80 border border-slate-800 px-3 py-1.5 rounded-xl">
                <BookOpen className="w-4 h-4 text-blue-400" />
                <span>{completedCount} / {totalSessions} Sessions Done ({progressPercent}%)</span>
              </div>
              <div className="flex items-center gap-2 bg-slate-900/80 border border-slate-800 px-3 py-1.5 rounded-xl">
                <Trophy className="w-4 h-4 text-amber-400" />
                <span>Level: {(profile?.educational_level || 'Junior').toUpperCase()}</span>
              </div>
            </div>
          </div>

          {/* 1-Click Continue Learning Card */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-blue-500/30 shadow-xl space-y-4 w-full lg:w-80 shrink-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Next Up In Your Roadmap</span>
            </span>

            <div>
              <h3 className="text-sm font-bold text-white line-clamp-2">
                {nextSession ? `${nextSession.id}: ${nextSession.topic}` : 'Courses Complete!'}
              </h3>
              <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                {nextSession ? nextSession.description : 'You have completed all core robotics sessions.'}
              </p>
            </div>

            <Link
              to={nextSession ? `/learning?session=${nextSession.id}` : '/learning?tab=courses'}
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black py-3 rounded-2xl text-xs uppercase tracking-wider shadow-lg shadow-emerald-950/40 transition-all flex items-center justify-center gap-2 hover:scale-105"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Continue Lesson</span>
            </Link>
          </div>
        </div>
      </div>

      {/* =========================================================================
          2. CURRENT ENROLLED COURSES
         ========================================================================= */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-600" />
            <span>My Current Courses</span>
          </h2>
          <Link to="/learning" className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
            <span>Explore All Academy Courses</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {courses.map((c) => {
            const Icon = c.icon;
            return (
              <div 
                key={c.id}
                className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all space-y-5 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-bold">
                      {c.level}
                    </span>
                    <span className="text-xs font-bold text-slate-600">
                      {c.progress}% Completed
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 leading-snug">{c.title}</h3>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-blue-600 h-full rounded-full transition-all duration-700" 
                      style={{ width: `${c.progress}%` }}
                    />
                  </div>

                  <p className="text-xs text-slate-500 font-medium">
                    Current Step: <strong className="text-slate-800">{c.currentLesson}</strong>
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-medium">
                    {c.completedLessons} of {c.totalLessons} Sessions Complete
                  </span>
                  <Link
                    to={c.path}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center gap-1.5"
                  >
                    <span>Resume Course</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* =========================================================================
          3. LEARNING PILLARS & QUICK ACCESS
         ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Link 
          to="/learning?tab=courses" 
          className="p-5 bg-white rounded-2xl border border-slate-200 hover:border-indigo-400 hover:shadow-md transition group"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 mb-3 group-hover:scale-110 transition-transform">
            <Cpu className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-slate-900 text-sm">Robotics Academy</h4>
          <p className="text-xs text-slate-500 mt-0.5">Complete 3-Level Pathway (37 Modules)</p>
        </Link>

        <Link 
          to="/projects" 
          className="p-5 bg-white rounded-2xl border border-slate-200 hover:border-emerald-400 hover:shadow-md transition group"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 mb-3 group-hover:scale-110 transition-transform">
            <Trophy className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-slate-900 text-sm">Hardware Capstones</h4>
          <p className="text-xs text-slate-500 mt-0.5">Submit your robot build</p>
        </Link>

        <Link 
          to="/verify-certificate" 
          className="p-5 bg-white rounded-2xl border border-slate-200 hover:border-amber-400 hover:shadow-md transition group"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 mb-3 group-hover:scale-110 transition-transform">
            <Award className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-slate-900 text-sm">Earned Certificates</h4>
          <p className="text-xs text-slate-500 mt-0.5">Verified online credentials</p>
        </Link>

        <Link 
          to="/competitions/yara-2026" 
          className="p-5 bg-white rounded-2xl border border-slate-200 hover:border-purple-400 hover:shadow-md transition group"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 mb-3 group-hover:scale-110 transition-transform">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-slate-900 text-sm">YARA 2026 Arena</h4>
          <p className="text-xs text-slate-500 mt-0.5">National team qualifiers</p>
        </Link>
      </div>

      {/* =========================================================================
          4. STUDENT ACCOUNT & DUES (Properly Placed in Student Dashboard)
         ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Investment & Membership Status */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-slate-900 text-white border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-indigo-400" />
              <h3 className="font-bold text-white text-base">Membership &amp; Training Dues</h3>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              Status: {profile?.registration_paid ? 'Active Member' : 'Trial Active'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Paid</span>
              <p className="text-2xl font-black text-white mt-1">
                <span className="text-indigo-400">$</span>{profile?.amount_paid || '0.00'} <span className="text-xs text-slate-400 font-normal">USD</span>
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Target Dues</span>
              <p className="text-2xl font-black text-white mt-1">
                <span className="text-indigo-400">$</span>{profile?.total_dues || '15.00'} <span className="text-xs text-slate-400 font-normal">USD</span>
              </p>
            </div>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed font-normal">
            Platform membership covers your access to the virtual simulator, accredited exam grading, capstone review, and live mentor rooms.
          </p>
        </div>

        {/* Live Mentor Support */}
        <div className="p-6 rounded-3xl bg-indigo-50 border border-indigo-100 space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 text-base">1-on-1 Mentor Support</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Encountering motor driver brownouts or I2C communication errors? Connect with verified YARA robotics mentors for real-time guidance.
            </p>
          </div>

          <Link
            to="/mentorship"
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold text-center transition block shadow-sm"
          >
            Book Mentorship Session
          </Link>
        </div>
      </div>

    </div>
  );
}
