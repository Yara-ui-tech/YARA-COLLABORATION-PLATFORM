import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Globe, 
  BookOpen, 
  Trophy, 
  GraduationCap, 
  ArrowRight, 
  CheckCircle2, 
  ChevronRight,
  Sparkles,
  Users,
  ShieldCheck,
  Cpu,
  Award
} from 'lucide-react';
import { useAuth } from '../components/AuthContext';
import { DynamicSectionRenderer } from '../components/DynamicSectionRenderer';
import { OrganizationPost } from '../types/organizationPosts';
import { getOrganizationPosts } from '../services/organizationPostsService';
import QuickAuthCard from '../components/home/QuickAuthCard';

export default function Home() {
  const { user } = useAuth();
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
    { value: '14+', label: 'School Clubs', sub: 'Active provincial chapters' },
    { value: '100%', label: 'Gender Parity', sub: '2 Boys + 2 Girls team rule' },
    { value: '42', label: 'Micro-Modules', sub: 'Tiers 1 to 4 mastered' },
  ];

  return (
    <div className="space-y-16 pb-20 text-slate-100 font-sans">
      
      {/* =========================================================================
          1. HERO SECTION (Focused strictly on Home)
         ========================================================================= */}
      <section className="relative overflow-hidden pt-8 pb-16 lg:pt-14 lg:pb-20 border-b border-slate-800/80">
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

              {/* Direct Standalone Tab Navigation Buttons */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-1">
                <Link
                  to="/learn"
                  className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-blue-900/30 transition-all hover:scale-105 flex items-center gap-2 cursor-pointer"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Explore Academy</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  to="/competitions"
                  className="px-5 py-3.5 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Trophy className="w-4 h-4 text-amber-400" />
                  <span>2026 Championship</span>
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-4 sm:gap-6 text-xs text-slate-400 font-medium">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Accredited STEM Certificates</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Mandatory Gender Parity</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>School Hardware Labs</span>
                </div>
              </div>

              {/* Impact Metrics strip */}
              <div className="pt-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
                {impactMetrics.map((m, i) => (
                  <div key={i} className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 text-center lg:text-left">
                    <span className="text-xl sm:text-2xl font-black text-cyan-400 block">
                      {m.value}
                    </span>
                    <span className="text-xs font-bold text-white block mt-0.5">{m.label}</span>
                    <span className="text-[10px] text-slate-400 block">{m.sub}</span>
                  </div>
                ))}
              </div>

            </div>

            {/* Right Column: LMS Sign In / Sign Up Card */}
            <div className="lg:col-span-5 flex justify-center">
              <QuickAuthCard />
            </div>

          </div>
        </div>
      </section>

      {/* =========================================================================
          2. OFFICIAL NEWS & ANNOUNCEMENTS
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
              <span>View All Press</span>
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
                    <span>Read More</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* =========================================================================
          3. PLATFORM GATEWAYS (Concise previews linking to Standalone Tabs)
         ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-indigo-400">Explore YARA</span>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Our Core Ecosystem Programs
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Select a specialized tab to access self-contained tools, resources, and platforms.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Academy & LMS */}
          <Link
            to="/learn"
            className="group p-6 rounded-3xl bg-slate-900 border border-slate-800 hover:border-blue-500/50 transition-all flex flex-col justify-between space-y-6 hover:-translate-y-1 shadow-lg"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-white group-hover:text-blue-400 transition-colors">
                Robotics Academy &amp; LMS
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                42 structured micro-modules from beginner breadboarding to autonomous systems, embedded C++, and verified STEM graduation diplomas.
              </p>
            </div>
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs font-bold text-blue-400">
              <span>Open Academy Tab</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Card 2: Competitions Arena */}
          <Link
            to="/competitions"
            className="group p-6 rounded-3xl bg-slate-900 border border-slate-800 hover:border-amber-500/50 transition-all flex flex-col justify-between space-y-6 hover:-translate-y-1 shadow-lg"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                <Trophy className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-white group-hover:text-amber-400 transition-colors">
                2026 Championship Arena
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Flagship Underwater Drone Missions, Autonomous Maze Solving, and Innovation Pitches with strict 2 boys + 2 girls parity.
              </p>
            </div>
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs font-bold text-amber-400">
              <span>Open Competitions Tab</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Card 3: School Chapters */}
          <Link
            to="/chapters"
            className="group p-6 rounded-3xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 transition-all flex flex-col justify-between space-y-6 hover:-translate-y-1 shadow-lg"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                <GraduationCap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-white group-hover:text-emerald-400 transition-colors">
                School Clubs &amp; Chapters
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Charter an official YARA robotics club at your primary or secondary school. Access starter kits, lesson plans, and provincial leagues.
              </p>
            </div>
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs font-bold text-emerald-400">
              <span>Open Chapters Tab</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
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
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl cursor-pointer"
              >
                Dismiss
              </button>
              <Link
                to="/posts"
                onClick={() => {
                  sessionStorage.setItem('yara_trending_popup_seen', 'true');
                  setTrendingPopup(null);
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
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
