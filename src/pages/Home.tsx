import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  Cpu, Code, Brain, Radio, Trophy, Users, Calendar, 
  ArrowRight, ShieldCheck, CheckCircle2, ChevronRight, 
  GraduationCap, Sparkles, Globe, BookOpen, Wrench, 
  Lightbulb, ExternalLink, Star, MapPin
} from 'lucide-react';
import { useAuth } from '../components/AuthContext';
import { ASSETS } from '../constants/assets';
import { DynamicSectionRenderer } from '../components/DynamicSectionRenderer';
import { supabase } from '../lib/supabase';
import { OrganizationPost } from '../types/organizationPosts';
import { getOrganizationPosts } from '../services/organizationPostsService';
import { cn } from '../lib/utils';

export default function Home() {
  const { user } = useAuth();
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

  const corePillars = [
    {
      title: 'Robotics & Engineering',
      desc: 'Autonomous rovers, maze mapping, motor drivers, and underwater aquatic drones built by young Africans.',
      icon: Cpu,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10 border-blue-500/30'
    },
    {
      title: 'AI & IoT Innovation',
      desc: 'Edge machine learning, computer vision, environmental sensor grids, and automated cloud telemetry.',
      icon: Brain,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10 border-purple-500/30'
    },
    {
      title: 'Inclusive STEM Education',
      desc: 'Establishing sustainable robotics clubs in schools with mandatory 2 boys + 2 girls gender parity.',
      icon: GraduationCap,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10 border-amber-500/30'
    },
    {
      title: 'Digital Skills & Coding',
      desc: 'From block-based logic for juniors to industry-standard MicroPython and embedded C++ on microcontrollers.',
      icon: Code,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10 border-emerald-500/30'
    }
  ];

  const impactMetrics = [
    { value: '1,200+', label: 'Students Reached', sub: 'Hands-on hardware labs' },
    { value: '14+', label: 'School Clubs', sub: 'Mashwest & Harare network' },
    { value: '100%', label: 'Gender Parity', sub: '2 Boys + 2 Girls team rule' },
    { value: '42', label: 'Academy Sessions', sub: 'Tiers 1 to 4 mastered' },
  ];

  const featuredProgrammes = [
    {
      id: 'robotics',
      title: 'Robotics Engineering',
      level: 'All Ages',
      desc: 'Kinematics, PID control, chassis design, and autonomous arena navigation.',
      link: '/programs?track=robotics',
      badge: 'Championship Track'
    },
    {
      id: 'ai-iot',
      title: 'Artificial Intelligence & IoT',
      level: 'Secondary & Tertiary',
      desc: 'TinyML microcontrollers, environmental telemetry, and real agricultural sensors.',
      link: '/programs?track=ai-iot',
      badge: 'Cutting Edge'
    },
    {
      id: 'coding',
      title: 'Coding & Firmware',
      level: 'Ages 8–19',
      desc: 'MicroPython and embedded C++ programming for sensors, motors, and displays.',
      link: '/programs?track=coding',
      badge: 'Core Skill'
    },
    {
      id: 'stem',
      title: 'School Clubs & Patron Labs',
      level: 'Schools & Teachers',
      desc: 'Accredited club charters, teacher lesson workbench, and hardware lab provisioning.',
      link: '/schools',
      badge: 'Institutional'
    }
  ];

  return (
    <div className="space-y-20 pb-20 text-slate-100">
      
      {/* =========================================================================
          1. HERO SECTION (High-Impact, First Screen Communication)
          Communicates: WHO YARA IS, WHAT YARA DOES, WHO IT SERVES, HOW TO JOIN
         ========================================================================= */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 border-b border-slate-800/80">
        {/* Glow Effects */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-blue-600/20 via-indigo-600/15 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content Column */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              {/* Organization Motto Pill */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs font-bold tracking-wide">
                <Globe className="w-4 h-4 text-blue-400" />
                <span>YOUNG AFRICANS ROBOTICS ASSOCIATION</span>
                <span className="text-slate-500">•</span>
                <span className="text-amber-400 italic font-semibold">"Innovate Local, Build Global"</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1]">
                Empowering Africa's <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-indigo-300">
                  Next Generation
                </span> of Robotics Innovators.
              </h1>

              {/* Concise Mission Paragraph */}
              <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto lg:mx-0 font-normal leading-relaxed">
                We equip young Africans, teachers, and schools with hands-on technical skills in <strong className="text-white">Robotics</strong>, <strong className="text-white">Engineering</strong>, <strong className="text-white">Artificial Intelligence</strong>, <strong className="text-white">IoT</strong>, and <strong className="text-white">STEM Education</strong> to solve real local problems.
              </p>

              {/* Primary & Secondary Call to Actions */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  to="/auth"
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs uppercase tracking-wider shadow-xl shadow-blue-900/40 transition-all hover:scale-105 flex items-center justify-center gap-2"
                >
                  <span>JOIN YARA</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  to="/programs"
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2"
                >
                  <BookOpen className="w-4 h-4 text-blue-400" />
                  <span>EXPLORE PROGRAMMES</span>
                </Link>

                <Link
                  to="/competitions/yara-2026"
                  className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2"
                >
                  <Trophy className="w-4 h-4 text-amber-400" />
                  <span>2026 Championship</span>
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-slate-400 font-medium">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Accredited STEM Certificates</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Verified 2B+2G Gender Parity</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Authentic School Hardware Labs</span>
                </div>
              </div>
            </div>

            {/* Right Visual Column (Real YARA Lab Photograph) */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-3xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-900 group">
                <img
                  src={ASSETS.DASHBOARD_HERO_BG}
                  alt="Young African students building autonomous robots"
                  className="w-full h-[420px] object-cover group-hover:scale-105 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                
                {/* Floating Badge */}
                <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-slate-900/90 border border-slate-800/80 backdrop-blur-md space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold text-white">
                    <span>Hands-On Robotics Build</span>
                    <span className="text-emerald-400 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      Mashwest Cohort
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Students assembling sensor mounts, wiring H-bridges, and programming motor control algorithms.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* =========================================================================
          2. IMPACT STATISTICS BAR (Real Verified Metrics)
         ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-slate-800/80 shadow-xl">
          {impactMetrics.map((m, i) => (
            <div key={i} className="space-y-1 text-center sm:text-left border-r border-slate-800/60 last:border-none pr-4">
              <span className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
                {m.value}
              </span>
              <h4 className="text-xs sm:text-sm font-bold text-white">{m.label}</h4>
              <p className="text-[11px] text-slate-400">{m.sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* =========================================================================
          3. WHAT WE DO: 4 FOUNDATIONAL PILLARS
         ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
            What YARA Does
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Building Africa's Digital &amp; Hardware Future
          </h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            We provide the tools, academy courses, competitions, and teacher mentorship necessary to transform raw curiosity into working robotics engineering.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {corePillars.map((p, i) => {
            const Icon = p.icon;
            return (
              <div 
                key={i}
                className="p-6 rounded-3xl bg-slate-900 border border-slate-800 hover:border-blue-500/40 transition-all shadow-xl space-y-4 flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center border", p.bg)}>
                    <Icon className={cn("w-6 h-6", p.color)} />
                  </div>
                  <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">
                    {p.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed font-normal">
                    {p.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* =========================================================================
          4. FLAGSHIP COMPETITION (YARA Educational Robotics Competition 2026)
         ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 border border-slate-800 p-8 sm:p-12 text-white shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="space-y-4 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 text-xs font-black uppercase tracking-wider">
                  Flagship Event
                </span>
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold">
                  ● Team Registration Open
                </span>
              </div>

              <h3 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
                YARA Educational Robotics Competition 2026
              </h3>

              <p className="text-amber-300 text-sm sm:text-base font-bold">
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
                className="px-7 py-4 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black text-xs uppercase tracking-wider rounded-2xl shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2 transition-all hover:scale-105"
              >
                <span>Enter Team &amp; Read Rules</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                to="/competitions"
                className="px-7 py-4 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-2xl flex items-center justify-center gap-2 transition-all border border-white/10"
              >
                <span>All Competitions</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          5. PROGRAMMES SHOWCASE
         ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
              Learning Academy
            </span>
            <h2 className="text-3xl font-black text-white">YARA Core Programmes</h2>
          </div>

          <Link
            to="/programs"
            className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1"
          >
            <span>View All Programmes</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProgrammes.map((p) => (
            <Link
              key={p.id}
              to={p.link}
              className="p-6 rounded-3xl bg-slate-900 border border-slate-800 hover:border-blue-500/40 p-6 flex flex-col justify-between space-y-4 transition-all shadow-xl group"
            >
              <div className="space-y-2">
                <span className="px-2.5 py-0.5 rounded-full bg-blue-950 text-blue-400 border border-blue-800 text-[10px] font-bold uppercase tracking-wider">
                  {p.badge}
                </span>
                <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">
                  {p.title}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed font-normal">
                  {p.desc}
                </p>
              </div>

              <div className="pt-2 text-xs font-bold text-blue-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                <span>Learn More</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* =========================================================================
          6. TRAINING SYSTEM SPOTLIGHT (Students, Teachers, Patrons, Schools)
         ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-10 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <GraduationCap className="w-3.5 h-3.5" />
              <span>YARA Training System</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-white">
              Specialized Training for Schools, Patrons &amp; Innovators
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              We run intensive training cohorts for secondary students, school club patrons, teachers, and competition coaches. Includes lesson plans, circuit kits, and accredited completion certificates.
            </p>
          </div>

          <div className="shrink-0 flex flex-col sm:flex-row gap-3">
            <Link
              to="/training"
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-black px-6 py-3.5 rounded-2xl text-xs uppercase tracking-wider shadow-lg shadow-emerald-950/40 transition-all flex items-center justify-center gap-2 hover:scale-105"
            >
              <span>Explore Training System</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/educator-portal"
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold px-6 py-3.5 rounded-2xl text-xs text-center transition-all"
            >
              Teacher / Patron Hub
            </Link>
          </div>
        </div>
      </section>

      {/* =========================================================================
          7. GENUINE OUTREACH GALLERY & REAL IMPACT (Mashwest Province 2025)
         ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
              Grassroots Outreach
            </span>
            <h2 className="text-3xl font-black text-white">2025 Provincial Outreach Impact</h2>
          </div>

          <Link
            to="/impact-gallery"
            className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1"
          >
            <span>View Full 18-Photo Gallery</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Real photo gallery grid from ASSETS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { img: ASSETS.GALLERY[0], label: 'Autonomous Rover Build Lab' },
            { img: ASSETS.GALLERY[1], label: 'Electronics & Circuit Wiring' },
            { img: ASSETS.GALLERY[2], label: 'Coding & Firmware Session' },
            { img: ASSETS.GALLERY[3], label: 'Mashwest School Assembly' },
          ].map((item, idx) => (
            <div key={idx} className="relative rounded-2xl overflow-hidden h-48 bg-slate-900 group border border-slate-800">
              <img
                src={item.img}
                alt={item.label}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />
              <span className="absolute bottom-3 left-3 right-3 text-xs font-bold text-white leading-snug">
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* =========================================================================
          8. OFFICIAL NEWS & ANNOUNCEMENTS FEED
         ========================================================================= */}
      {recentPosts && recentPosts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
                Official Updates
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white">Latest News &amp; Press</h2>
            </div>
            <Link to="/posts" className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1">
              <span>View All Updates</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recentPosts.map((post) => (
              <div
                key={post.id}
                className="rounded-2xl bg-slate-900 border border-slate-800 p-6 flex flex-col justify-between space-y-4 hover:border-slate-700 transition shadow-lg"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span className="text-amber-400 font-bold uppercase">{post.category || 'Press Release'}</span>
                    <span>{new Date(post.created_at).toLocaleDateString()}</span>
                  </div>
                  <h3 className="text-base font-bold text-white line-clamp-2 leading-snug">
                    {post.title}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                    {post.content}
                  </p>
                </div>
                <Link
                  to="/posts"
                  className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1"
                >
                  <span>Read Full Article</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Dynamic Sections from Admin */}
      <DynamicSectionRenderer page="home" />

      {/* =========================================================================
          9. BOTTOM CALL TO ACTION: READY TO BUILD THE FUTURE
         ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-10 sm:p-14 rounded-3xl bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-950 border border-blue-700/40 text-center space-y-6 shadow-2xl relative overflow-hidden">
          <div className="max-w-2xl mx-auto space-y-4">
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Ready to Join the Pan-African Robotics Movement?
            </h2>
            <p className="text-sm sm:text-base text-blue-200 leading-relaxed">
              Whether you are a student eager to build your first robot, a teacher launching a school club, or a sponsor backing young African engineering talent.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              to="/auth"
              className="px-8 py-4 bg-white text-slate-950 hover:bg-slate-100 font-black text-xs uppercase tracking-wider rounded-2xl shadow-xl transition-all hover:scale-105 flex items-center gap-2"
            >
              <span>REGISTER FOR YARA</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/contact"
              className="px-8 py-4 bg-blue-950/80 hover:bg-blue-900 text-white border border-blue-600/50 font-bold text-xs uppercase tracking-wider rounded-2xl transition-all"
            >
              Contact YARA Directorate
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
