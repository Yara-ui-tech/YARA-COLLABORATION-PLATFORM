import React, { useState, useEffect } from 'react';
// YARA Unified Single-Page Platform
import { Link } from 'react-router-dom';
import { 
  Cpu, 
  Brain, 
  Trophy, 
  Users, 
  Calendar, 
  ArrowRight, 
  ShieldCheck, 
  CheckCircle2, 
  ChevronRight, 
  GraduationCap, 
  Sparkles, 
  Globe, 
  BookOpen, 
  Phone, 
  Mail, 
  CreditCard, 
  MapPin, 
  RotateCcw,
  Trash2,
  Award
} from 'lucide-react';
import { useAuth } from '../components/AuthContext';
import { ASSETS } from '../constants/assets';
import { DynamicSectionRenderer } from '../components/DynamicSectionRenderer';
import { OrganizationPost } from '../types/organizationPosts';
import { getOrganizationPosts } from '../services/organizationPostsService';
import QuickAuthCard from '../components/home/QuickAuthCard';
import QuickCertVerify from '../components/home/QuickCertVerify';

export default function Home() {
  const { user, profile } = useAuth();
  const isAdmin = profile?.role === 'admin' || profile?.email === 'manongwasimbarashe394@gmail.com' || profile?.email === 'goyaracorp@gmail.com';
  
  const [isFlagshipDismissed, setIsFlagshipDismissed] = useState(() => {
    return localStorage.getItem('yara_hide_home_flagship') === 'true';
  });
  
  const [recentPosts, setRecentPosts] = useState<OrganizationPost[]>([]);
  const [trendingPopup, setTrendingPopup] = useState<OrganizationPost | null>(null);

  useEffect(() => {
    async function loadFeed() {
      try {
        const posts = await getOrganizationPosts();
        if (posts && posts.length > 0) {
          setRecentPosts(posts.slice(0, 3));
          const seen = sessionStorage.getItem('yara_trending_popup_seen');
          if (!seen && posts[0]) {
            setTrendingPopup(posts[0]);
          }
        }
      } catch {}
    }
    loadFeed();
  }, []);

  const impactMetrics = [
    { value: '1,200+', label: 'Students Reached', sub: 'Hands-on hardware labs' },
    { value: '14+', label: 'School Clubs', sub: 'Mashwest & Harare network' },
    { value: '100%', label: 'Gender Parity', sub: '2 Boys + 2 Girls team rule' },
    { value: '42', label: 'Micro-Modules', sub: 'Tiers 1 to 4 mastered' },
  ];

  const quickNavTabs = [
    { label: 'LMS Academy', target: 'lms', icon: BookOpen },
    { label: '2026 Championship', target: 'competitions', icon: Trophy },
    { label: 'School Clubs', target: 'clubs', icon: GraduationCap },
    { label: 'Verify Certificate', target: 'verify', icon: ShieldCheck },
    { label: 'About & Contact', target: 'contact', icon: Phone },
  ];

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-16 pb-20 text-slate-100">
      
      {/* =========================================================================
          1. HERO & INSTANT LMS SIGN IN / SIGN UP (Everything on the first screen)
         ========================================================================= */}
      <section id="top" className="relative overflow-hidden pt-8 pb-16 lg:pt-14 lg:pb-20 border-b border-slate-800/80">
        {/* Glow Effects */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-gradient-to-tr from-blue-600/20 via-indigo-600/15 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left Column: Organization Identity & Mission */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              
              {/* Motto Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs font-bold tracking-wide">
                <Globe className="w-4 h-4 text-blue-400" />
                <span>YOUNG AFRICANS ROBOTICS ASSOCIATION</span>
                <span className="text-slate-500 hidden sm:inline">•</span>
                <span className="text-amber-400 italic font-semibold hidden sm:inline">"Innovate Local, Build Global"</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-3xl sm:text-5xl lg:text-5xl xl:text-6xl font-black text-white tracking-tight leading-[1.15]">
                Empowering Africa's <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-indigo-300">
                  Next Generation
                </span> of Robotics Innovators.
              </h1>

              {/* Concise Mission Paragraph */}
              <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto lg:mx-0 font-normal leading-relaxed">
                We equip young Africans, teachers, and schools with hands-on technical skills in <strong className="text-white">Robotics</strong>, <strong className="text-white">Engineering</strong>, <strong className="text-white">Artificial Intelligence</strong>, <strong className="text-white">IoT</strong>, and <strong className="text-white">STEM Education</strong> to solve real local challenges.
              </p>

              {/* Action Jump Buttons */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-1">
                <button
                  onClick={() => scrollToSection('lms')}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-blue-900/30 transition-all hover:scale-105 flex items-center gap-2 cursor-pointer"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Explore Courses Below</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => scrollToSection('competitions')}
                  className="px-5 py-3 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Trophy className="w-4 h-4 text-amber-400" />
                  <span>2026 Championship Arena</span>
                </button>
              </div>

              {/* Trust Indicators */}
              <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-4 sm:gap-6 text-xs text-slate-400 font-medium">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Accredited STEM Certificates</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Verified 2B+2G Gender Parity</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Authentic School Hardware Labs</span>
                </div>
              </div>

              {/* Impact Metrics strip */}
              <div className="pt-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
                {impactMetrics.map((m, i) => (
                  <div key={i} className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 text-center lg:text-left">
                    <span className="text-xl sm:text-2xl font-black text-cyan-400 block">
                      {m.value}
                    </span>
                    <span className="text-xs font-bold text-white block mt-0.5">{m.label}</span>
                    <span className="text-[10px] text-slate-400 block">{m.sub}</span>
                  </div>
                ))}
              </div>

            </div>

            {/* Right Column: Direct On-Page Sign In / Sign Up to LMS */}
            <div className="lg:col-span-5 flex justify-center">
              <QuickAuthCard onGuestExplore={() => scrollToSection('lms')} />
            </div>

          </div>
        </div>
      </section>

      {/* =========================================================================
          OFFICIAL NEWS & ANNOUNCEMENTS AT FOREFRONT
         ========================================================================= */}
      {recentPosts && recentPosts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
              <h2 className="text-base sm:text-lg font-black text-white uppercase tracking-wider">
                Official News &amp; Announcements
              </h2>
            </div>
            <Link to="/posts" className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1">
              <span>View All News</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recentPosts.map((post) => (
              <div 
                key={post.id} 
                className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition shadow-md flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span className="px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-300 border border-amber-400/20 font-bold text-[10px] uppercase">
                      {post.category || 'Announcement'}
                    </span>
                    <span>{new Date(post.created_at).toLocaleDateString()}</span>
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-white line-clamp-2 leading-snug">
                    {post.title}
                  </h3>
                  <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed">
                    {post.content}
                  </p>
                </div>
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                  <span>{post.author_name || 'YARA Directorate'}</span>
                  <Link to="/posts" className="text-blue-400 hover:underline font-semibold flex items-center gap-1">
                    <span>Read</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* =========================================================================
          2. QUICK IN-PAGE NAVIGATION (Jump directly to any section on the same page)
         ========================================================================= */}
      <nav aria-label="Page Sections" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center gap-2 overflow-x-auto py-2 scrollbar-none">
          {quickNavTabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.target}
                onClick={() => scrollToSection(tab.target)}
                className="px-4 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-blue-500/40 text-xs font-bold text-slate-300 hover:text-white flex items-center gap-2 transition shrink-0 cursor-pointer shadow-sm"
              >
                <Icon className="w-3.5 h-3.5 text-blue-400" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* =========================================================================
          3. LMS ACADEMY & COURSES EXPLORER (Same Page)
         ========================================================================= */}
      <section id="lms" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 scroll-mt-24">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs font-bold uppercase tracking-wider">
              <BookOpen className="w-3.5 h-3.5 text-blue-400" />
              <span>YARA Learning Platform (LMS) • 42 Micro-Modules</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Curriculum Stages &amp; Hands-On Pathways
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
              From absolute breadboard circuits to autonomous maze mapping, embedded C++, and accredited STEM credentials. Works in Data-Saver mode.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/learn"
              className="px-5 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-blue-900/30 flex items-center gap-2 transition shrink-0"
            >
              <span>Open Full LMS Screen</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* 4 Progressive Learning Stages */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Stage 1 */}
          <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 hover:border-sky-500/40 transition-all flex flex-col justify-between space-y-4">
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded-full bg-sky-950 text-sky-400 border border-sky-800 text-[10px] font-black uppercase">
                  Stage 1 • S00–S07
                </span>
                <span className="text-[10px] font-bold text-emerald-400">Low Data ~3.2 MB</span>
              </div>
              <h3 className="text-base font-black text-white">Tier 1: Curious Beginner</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Foundations of robotics, Ohm’s law, breadboarding, safety protocols, and block-based coding logic.
              </p>
              <div className="p-3 bg-slate-950 rounded-xl text-[11px] text-slate-300 space-y-1 border border-slate-800/80">
                <div className="flex justify-between"><span className="text-slate-400">Modules:</span><span className="font-bold text-white">8 Sessions</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Kit:</span><span className="font-bold text-emerald-400">Simulation / Free</span></div>
              </div>
            </div>

            <Link
              to="/learn?tab=courses&tier=1"
              className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs font-bold text-sky-400 hover:text-sky-300 transition"
            >
              <span>Start Stage 1</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Stage 2 */}
          <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 hover:border-indigo-500/40 transition-all flex flex-col justify-between space-y-4">
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-400 border border-indigo-800 text-[10px] font-black uppercase">
                  Stage 2 • S08–S19
                </span>
                <span className="text-[10px] font-bold text-indigo-300">12 Sessions</span>
              </div>
              <h3 className="text-base font-black text-white">Tier 2: Intermediate Maker</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Embedded C++, Arduino &amp; ESP32 architecture, ultrasonic range sensors, motor drivers, and chassis geometry.
              </p>
              <div className="p-3 bg-slate-950 rounded-xl text-[11px] text-slate-300 space-y-1 border border-slate-800/80">
                <div className="flex justify-between"><span className="text-slate-400">Modules:</span><span className="font-bold text-white">12 Sessions</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Focus:</span><span className="font-bold text-indigo-400">Microcontrollers</span></div>
              </div>
            </div>

            <Link
              to="/learn?tab=courses&tier=2"
              className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs font-bold text-indigo-400 hover:text-indigo-300 transition"
            >
              <span>Start Stage 2</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Stage 3 */}
          <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 hover:border-purple-500/40 transition-all flex flex-col justify-between space-y-4">
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded-full bg-purple-950 text-purple-400 border border-purple-800 text-[10px] font-black uppercase">
                  Stage 3 • S20–S27
                </span>
                <span className="text-[10px] font-bold text-purple-300">8 High-Order</span>
              </div>
              <h3 className="text-base font-black text-white">Tier 3: Autonomous Systems</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Autonomous maze solving, PID line-following algorithms, IoT environmental telemetry, and TinyML Edge AI.
              </p>
              <div className="p-3 bg-slate-950 rounded-xl text-[11px] text-slate-300 space-y-1 border border-slate-800/80">
                <div className="flex justify-between"><span className="text-slate-400">Control:</span><span className="font-bold text-white">Closed-Loop PID</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Telemetry:</span><span className="font-bold text-purple-400">IoT Cloud</span></div>
              </div>
            </div>

            <Link
              to="/learn?tab=courses&tier=3"
              className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs font-bold text-purple-400 hover:text-purple-300 transition"
            >
              <span>Start Stage 3</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Stage 4 */}
          <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 hover:border-amber-500/40 transition-all flex flex-col justify-between space-y-4">
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded-full bg-amber-950 text-amber-400 border border-amber-800 text-[10px] font-black uppercase">
                  Stage 4 • S28–S36
                </span>
                <span className="text-[10px] font-bold text-amber-300">Capstone</span>
              </div>
              <h3 className="text-base font-black text-white">Tier 4: Capstone &amp; Defense</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Physical prototype engineering defense, 21-point technical writeup, accredited certificates &amp; championship entry.
              </p>
              <div className="p-3 bg-slate-950 rounded-xl text-[11px] text-slate-300 space-y-1 border border-slate-800/80">
                <div className="flex justify-between"><span className="text-slate-400">Outcome:</span><span className="font-bold text-amber-300">Verified Certificate</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Arena:</span><span className="font-bold text-white">Championship Entry</span></div>
              </div>
            </div>

            <Link
              to="/learn?tab=courses&tier=4"
              className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs font-bold text-amber-400 hover:text-amber-300 transition"
            >
              <span>Start Stage 4</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* =========================================================================
          4. 2026 CHAMPIONSHIP & ROBOTICS ARENA (Same Page)
         ========================================================================= */}
      <section id="competitions" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24">
        {!isFlagshipDismissed ? (
          <div className="rounded-3xl bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 border border-slate-800 p-6 sm:p-10 text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Admin Delete Action Button */}
            {isAdmin && (
              <div className="absolute top-4 right-4 z-20">
                <button
                  onClick={() => {
                    if (window.confirm("Remove Flagship Event banner?")) {
                      localStorage.setItem('yara_hide_home_flagship', 'true');
                      setIsFlagshipDismissed(true);
                    }
                  }}
                  className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Banner</span>
                </button>
              </div>
            )}

            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
              <div className="space-y-3.5 max-w-2xl">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 text-xs font-black uppercase tracking-wider">
                    Flagship Event
                  </span>
                  <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold">
                    ● Team Registration Open
                  </span>
                </div>

                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-tight">
                  YARA Educational Robotics Competition 2026
                </h3>

                <p className="text-amber-300 text-xs sm:text-sm font-bold">
                  Theme: “Engineering Opportunity: Robotics and Innovation for Underserved Youth”
                </p>

                <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                  Featuring 3 premier categories: <strong>Underwater Drone Missions</strong> (35%), <strong>Autonomous Maze Solving</strong> (35%), and <strong>Innovation Pitch Defense</strong> (30%). Mandatory 2 boys + 2 girls gender parity team composition.
                </p>

                <div className="flex flex-wrap gap-4 text-xs font-semibold text-slate-300 pt-1">
                  <span>• October 16–18, 2026</span>
                  <span>• National Championship Arena</span>
                  <span>• Hardware Grants &amp; Lab Kits</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
                <Link
                  to="/competitions/yara-2026"
                  className="px-6 py-3.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black text-xs uppercase tracking-wider rounded-2xl shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2 transition hover:-translate-y-0.5"
                >
                  <Trophy className="w-4 h-4" />
                  <span>Enter Team &amp; Read Rules</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  to="/competitions"
                  className="px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-2xl flex items-center justify-center gap-2 transition border border-white/10"
                >
                  <span>All Competitions</span>
                </Link>
              </div>
            </div>
          </div>
        ) : (
          isAdmin && (
            <div className="p-3 bg-slate-900 border border-dashed border-slate-800 rounded-2xl flex items-center justify-between text-xs text-slate-400">
              <span>Flagship banner hidden from homepage.</span>
              <button
                onClick={() => {
                  localStorage.removeItem('yara_hide_home_flagship');
                  setIsFlagshipDismissed(false);
                }}
                className="text-cyan-400 font-bold hover:underline flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restore Banner</span>
              </button>
            </div>
          )
        )}
      </section>

      {/* =========================================================================
          5. SCHOOL CLUBS & CHAPTERS (Same Page)
         ========================================================================= */}
      <section id="clubs" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24">
        <div className="p-6 sm:p-10 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <GraduationCap className="w-3.5 h-3.5" />
              <span>School Clubs &amp; Chapters</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-white">
              Start an Official Robotics Club in Your School
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              We provide accredited club charters, hardware starter kits (Arduino/ESP32, ultrasonic sensors, chassis), and complete lesson plans with mandatory 2 boys + 2 girls gender parity.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 text-xs">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="font-bold text-emerald-400 block">1. Charter Club</span>
                <span className="text-slate-400 text-[11px]">Primary or secondary school registration</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="font-bold text-emerald-400 block">2. Receive Kits</span>
                <span className="text-slate-400 text-[11px]">Subsidized school lab starter hardware</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="font-bold text-emerald-400 block">3. Compete in Arena</span>
                <span className="text-slate-400 text-[11px]">Participate in provincial hackathons</span>
              </div>
            </div>
          </div>

          <div className="shrink-0 flex flex-col sm:flex-row md:flex-col gap-3 w-full sm:w-auto">
            <Link
              to="/chapters"
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-black px-6 py-3.5 rounded-2xl text-xs uppercase tracking-wider shadow-lg shadow-emerald-950/40 transition-all flex items-center justify-center gap-2 hover:scale-102"
            >
              <GraduationCap className="w-4 h-4" />
              <span>Register School Club</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/educator-portal"
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold px-6 py-3.5 rounded-2xl text-xs text-center transition-all"
            >
              Teacher / Patron Workbench
            </Link>
          </div>
        </div>
      </section>

      {/* =========================================================================
          6. CERTIFICATE VERIFICATION REGISTRY (Embedded on the same page)
         ========================================================================= */}
      <section id="verify" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24">
        <QuickCertVerify />
      </section>

      {/* =========================================================================
          7. ABOUT YARA & DIRECT LEADERSHIP CONTACT (Same Page)
         ========================================================================= */}
      <section id="contact" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs font-bold uppercase tracking-wider">
            <Phone className="w-3.5 h-3.5 text-blue-400" />
            <span>Direct Access &amp; Governance</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            About YARA &amp; Direct Leadership Contact
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Reach out directly to the executive directorate for school setups, sponsorship, or general inquiries.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Executive Leadership */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">YARA Executive Directorate</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Pan-African coalition dedicated to nurturing 100,000 young African robotics and hardware engineers by 2030.
            </p>
            <div className="pt-2 text-xs text-slate-300 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>Chinhoyi University of Technology (CUT), Zimbabwe</span>
            </div>
          </div>

          {/* Telephone Lines */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Phone className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Direct Phone Lines</h3>
            <p className="text-xs text-slate-400">
              Available Monday to Friday, 08:00 – 17:00 CAT for student and school support:
            </p>
            <div className="space-y-1.5 pt-1 text-xs">
              <a href="tel:0719199274" className="flex items-center gap-2 text-emerald-300 hover:underline font-mono font-bold">
                <Phone className="w-3.5 h-3.5" />
                <span>0719 199 274</span>
              </a>
              <a href="tel:0717468236" className="flex items-center gap-2 text-emerald-300 hover:underline font-mono font-bold">
                <Phone className="w-3.5 h-3.5" />
                <span>0717 468 236</span>
              </a>
            </div>
          </div>

          {/* Payments & Subscriptions */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <CreditCard className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">EcoCash &amp; Payments</h3>
            <p className="text-xs text-slate-400">
              Official EcoCash line for course subscriptions, starter kits, and club dues:
            </p>
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1 text-xs">
              <div className="text-amber-300 font-mono font-bold">0788953986</div>
              <div className="text-[11px] text-slate-400">Name: Simbarashe Manongwa</div>
            </div>
            <a href="mailto:inforyaraorg@gmail.com" className="flex items-center gap-2 text-xs text-blue-400 hover:underline pt-1">
              <Mail className="w-3.5 h-3.5" />
              <span>inforyaraorg@gmail.com</span>
            </a>
          </div>
        </div>
      </section>

      {/* Trending News Alert Modal Popup */}
      {trendingPopup && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative border border-slate-700">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 bg-amber-400/20 border border-amber-400/40 text-amber-300 text-[10px] font-black uppercase tracking-wider rounded-full">
                🔥 Trending News Alert
              </span>
              <button
                onClick={() => {
                  sessionStorage.setItem('yara_trending_popup_seen', 'true');
                  setTrendingPopup(null);
                }}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 text-sm"
              >
                ✕
              </button>
            </div>

            <div>
              <h3 className="text-lg font-bold text-white leading-snug">
                {trendingPopup.title}
              </h3>
              <p className="text-xs text-slate-300 line-clamp-4 mt-2 leading-relaxed">
                {trendingPopup.content}
              </p>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-800">
              <button
                onClick={() => {
                  sessionStorage.setItem('yara_trending_popup_seen', 'true');
                  setTrendingPopup(null);
                }}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl"
              >
                Dismiss
              </button>
              <Link
                to="/posts"
                onClick={() => {
                  sessionStorage.setItem('yara_trending_popup_seen', 'true');
                  setTrendingPopup(null);
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5"
              >
                <span>Read Full Press</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Dynamic Sections from Admin */}
      <DynamicSectionRenderer page="home" />

    </div>
  );
}
