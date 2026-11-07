import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Globe, 
  BookOpen, 
  Trophy, 
  GraduationCap, 
  ArrowRight, 
  ChevronRight,
  Sparkles,
  ShieldCheck,
  Cpu,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import { DynamicSectionRenderer } from '../components/DynamicSectionRenderer';
import { OrganizationPost } from '../types/organizationPosts';
import { getOrganizationPosts } from '../services/organizationPostsService';

export default function Home() {
  const [recentPosts, setRecentPosts] = useState<OrganizationPost[]>([]);

  useEffect(() => {
    async function loadFeed() {
      try {
        const posts = await getOrganizationPosts();
        if (posts && posts.length > 0) {
          setRecentPosts(posts.slice(0, 3));
        }
      } catch {}
    }
    loadFeed();
  }, []);

  return (
    <div className="bg-slate-950 text-white font-sans selection:bg-amber-400 selection:text-black">
      
      {/* =========================================================================
          1. FERRARI-STYLE MINIMALIST HERO
          Bold, cinematic, razor-sharp typography, ultra-clean presentation
         ========================================================================= */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden border-b border-slate-900">
        {/* Cinematic Background Lighting */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(37,99,235,0.22),rgba(255,255,255,0))] pointer-events-none" />
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-10 -right-32 w-96 h-96 bg-amber-500/10 rounded-full blur-[140px] pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center relative z-10 space-y-8">
          
          {/* Subtle Tagline */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-slate-300 text-xs font-semibold tracking-widest uppercase">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span>YOUNG AFRICANS ROBOTICS ASSOCIATION</span>
            <span className="text-slate-600">•</span>
            <span className="text-amber-400 font-bold">2026 SEASON</span>
          </div>

          {/* Primary High-Impact Headline */}
          <div className="space-y-3">
            <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tighter uppercase leading-[0.95] text-white">
              INNOVATE LOCAL.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-amber-300">
                BUILD GLOBAL.
              </span>
            </h1>
            <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-400 font-light tracking-wide leading-relaxed pt-2">
              Equipping Africa’s next generation of builders with hands-on technical skills in <span className="text-white font-medium">Robotics</span>, <span className="text-white font-medium">Autonomous Systems</span>, and <span className="text-white font-medium">AI Engineering</span>.
            </p>
          </div>

          {/* Two Clean, Confident CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              to="/learn"
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-white text-slate-950 hover:bg-slate-200 font-black text-xs uppercase tracking-widest transition-all duration-300 shadow-xl shadow-white/5 flex items-center justify-center gap-2 group cursor-pointer"
            >
              <span>EXPLORE ACADEMY</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              to="/competitions"
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-slate-900 hover:bg-slate-800 text-white border border-slate-800 hover:border-slate-700 font-bold text-xs uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>2026 CHAMPIONSHIP</span>
            </Link>
          </div>

          {/* Minimalist Stats Strip */}
          <div className="pt-12 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto border-t border-slate-900 text-left">
            <div>
              <p className="text-3xl font-black text-white tracking-tight">1,200+</p>
              <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mt-0.5">Innovators Reached</p>
            </div>
            <div>
              <p className="text-3xl font-black text-white tracking-tight">14+</p>
              <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mt-0.5">Provincial Hubs</p>
            </div>
            <div>
              <p className="text-3xl font-black text-white tracking-tight">100%</p>
              <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mt-0.5">Gender Parity</p>
            </div>
            <div>
              <p className="text-3xl font-black text-cyan-400 tracking-tight">42</p>
              <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mt-0.5">Micro-Modules</p>
            </div>
          </div>

        </div>
      </section>

      {/* =========================================================================
          2. THE THREE PILLARS (Clean, Architectural, Minimalist)
         ========================================================================= */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Card 1: Academy */}
          <Link
            to="/learn"
            className="group relative p-8 rounded-3xl bg-slate-900/60 border border-slate-800/80 hover:border-blue-500/60 hover:bg-slate-900 transition-all duration-300 flex flex-col justify-between space-y-8"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="text-2xl font-black text-white tracking-tight group-hover:text-blue-400 transition-colors">
                Robotics Academy
              </h3>
              <p className="text-sm text-slate-400 font-light leading-relaxed">
                Step-by-step curriculum from foundational electronics to embedded MicroPython, C++, and accredited STEM graduation.
              </p>
            </div>
            <div className="pt-4 flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-blue-400 group-hover:gap-2.5 transition-all">
              <span>Enter Academy</span>
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </Link>

          {/* Card 2: Competitions */}
          <Link
            to="/competitions"
            className="group relative p-8 rounded-3xl bg-slate-900/60 border border-slate-800/80 hover:border-amber-500/60 hover:bg-slate-900 transition-all duration-300 flex flex-col justify-between space-y-8"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Trophy className="w-5 h-5" />
              </div>
              <h3 className="text-2xl font-black text-white tracking-tight group-hover:text-amber-400 transition-colors">
                Championship Arena
              </h3>
              <p className="text-sm text-slate-400 font-light leading-relaxed">
                Annual flagship tournaments featuring Underwater Drone ROVs, Autonomous Micromouse Maze solving, and Youth Innovation Pitches.
              </p>
            </div>
            <div className="pt-4 flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-amber-400 group-hover:gap-2.5 transition-all">
              <span>View Arena</span>
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </Link>

          {/* Card 3: School Chapters */}
          <Link
            to="/chapters"
            className="group relative p-8 rounded-3xl bg-slate-900/60 border border-slate-800/80 hover:border-emerald-500/60 hover:bg-slate-900 transition-all duration-300 flex flex-col justify-between space-y-8"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <GraduationCap className="w-5 h-5" />
              </div>
              <h3 className="text-2xl font-black text-white tracking-tight group-hover:text-emerald-400 transition-colors">
                School Chapters
              </h3>
              <p className="text-sm text-slate-400 font-light leading-relaxed">
                Charter an official robotics club at your school or university with kits, mentorship, and regional league qualifiers.
              </p>
            </div>
            <div className="pt-4 flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-emerald-400 group-hover:gap-2.5 transition-all">
              <span>Explore Chapters</span>
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </Link>

        </div>
      </section>

      {/* =========================================================================
          3. SLEEK CINEMATIC SPOTLIGHT: 2026 CHAMPIONSHIP
         ========================================================================= */}
      <section className="border-t border-b border-slate-900 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-6">
            <span className="text-xs font-black tracking-widest uppercase text-amber-400">Flagship Season</span>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight uppercase text-white">
              YARA Continental Robotics Championship
            </h2>
            <p className="text-slate-400 font-light text-base leading-relaxed">
              Showcasing practical engineering prowess across Africa: Underwater Drone Navigation (35%), Autonomous Maze Solving (35%), and Community Innovation Pitches (30%).
            </p>
            <div className="pt-2">
              <Link
                to="/competitions/yara-2026"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-amber-400 text-slate-950 hover:bg-amber-300 font-black text-xs uppercase tracking-wider transition-all"
              >
                <span>Arena Overview &amp; Guidelines</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          4. MINIMALIST PRESS / DISPATCH (Only if available)
         ========================================================================= */}
      {recentPosts && recentPosts.length > 0 && (
        <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex items-center justify-between border-b border-slate-900 pb-4">
            <h2 className="text-xs font-black tracking-widest uppercase text-slate-400">Official Dispatches</h2>
            <Link to="/posts" className="text-xs font-bold text-blue-400 hover:text-white flex items-center gap-1 transition-colors">
              <span>All News</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recentPosts.map((post) => (
              <Link 
                key={post.id} 
                to="/posts"
                className="group p-6 rounded-2xl bg-slate-900/40 border border-slate-900 hover:border-slate-800 transition space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span className="font-bold text-amber-400/90">{post.category || 'Announcement'}</span>
                    <span>{new Date(post.created_at).toLocaleDateString()}</span>
                  </div>
                  <h3 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-2 font-light">
                    {post.content}
                  </p>
                </div>
                <div className="text-[11px] font-semibold text-slate-500 group-hover:text-white flex items-center gap-1 pt-2">
                  <span>Read update</span>
                  <ChevronRight className="w-3 h-3" />
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Dynamic Sections from Admin if configured */}
      <DynamicSectionRenderer page="home" />

    </div>
  );
}
