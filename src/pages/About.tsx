import React from 'react';
import { motion } from 'motion/react';
import { 
  Info, Target, Eye, Heart, ShieldCheck, Zap, Users, 
  Sparkles, Award, Globe, Rocket, ArrowRight, CheckCircle2,
  Cpu, Wrench, School
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { DynamicSectionRenderer } from '../components/DynamicSectionRenderer';
import Breadcrumbs from '../components/Breadcrumbs';

export default function About() {
  const pillars = [
    {
      title: 'Grassroots Hardware Labs',
      desc: 'Deploying real microcontrollers, motors, sensors, and breadboards to students who would otherwise only see theory.',
      icon: Cpu,
      color: 'text-cyan-400',
      border: 'border-cyan-500/30'
    },
    {
      title: '100% Gender Parity (2B + 2G)',
      desc: 'Strict 2 Boys + 2 Girls team composition in every tournament, ensuring equal hands-on engineering opportunities.',
      icon: ShieldCheck,
      color: 'text-emerald-400',
      border: 'border-emerald-500/30'
    },
    {
      title: 'African Solutions for Local Needs',
      desc: 'Directing robotics and AI toward pressing continental challenges: agricultural automation, clean water, and solar telemetry.',
      icon: Globe,
      color: 'text-amber-400',
      border: 'border-amber-500/30'
    },
    {
      title: 'Continental Competitive Arena',
      desc: 'Rigorous national qualifiers and championships bridging primary/secondary schools, polytechnics, and industry.',
      icon: Trophy,
      color: 'text-purple-400',
      border: 'border-purple-500/30'
    }
  ];

  const milestones = [
    {
      year: 'Phase 1: Inception',
      title: 'Grassroots Inception at CUT',
      desc: 'Founded by youth innovators at Chinhoyi University of Technology to dismantle the high cost barrier to practical robotics education.'
    },
    {
      year: 'Phase 2: Expansion',
      title: 'Provincial School Chapters',
      desc: 'Expanded to over 14 school charters across Harare, Bulawayo, and Mashonaland West, training teacher patrons.'
    },
    {
      year: 'Phase 3: Arena Era',
      title: 'Aquatic & Autonomous Arena Tournaments',
      desc: 'Pioneered Zimbabwe’s first underwater drone submersible tests at Lake Chivero and autonomous micromouse maze derbies.'
    },
    {
      year: 'Phase 4: Continental',
      title: 'Pan-African SADC Openings',
      desc: 'Unifying youth tech teams across Southern and Eastern Africa under the official motto: "Innovate Local, Build Global".'
    }
  ];

  const values = [
    { title: 'Bold Innovation', desc: 'Encouraging fearlessness in prototyping, iterative bench testing, and failure analysis.' },
    { title: 'Radical Inclusivity', desc: 'Proactively prioritizing under-resourced rural schools and enforcing gender parity.' },
    { title: 'Open Hardware & Ethics', desc: 'Championing transparent documentation, open-source principles, and ethical technological stewardship.' },
    { title: 'Engineering Rigor', desc: 'Insisting on clean schematic design, safe battery handling, and verified code logic.' },
    { title: 'Community Impact', desc: 'Building systems that serve families, commercial farmers, and communal water grids.' }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-24">
      {/* Header & Breadcrumbs */}
      <div className="relative overflow-hidden border-b border-slate-800/80 bg-gradient-to-b from-slate-950 via-indigo-950/20 to-slate-950">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-gradient-to-tr from-blue-600/20 via-cyan-500/15 to-transparent rounded-full blur-3xl pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-14 relative z-10 space-y-6">
          <Breadcrumbs
            items={[
              { label: 'Home', href: '/' },
              { label: 'About YARA' }
            ]}
          />

          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs font-black uppercase tracking-widest shadow-xs">
              <Globe className="w-4 h-4 text-blue-400" />
              <span>Pan-African Youth Movement</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1]">
              Democratizing Robotics &amp; <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-indigo-300">
                AI Across Africa.
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-300 font-normal leading-relaxed max-w-2xl">
              Young Africans Robotics Association (YARA) is a youth-driven movement transforming young people from passive technology consumers into world-class creators and innovators.
            </p>

            <div className="pt-2 flex flex-wrap gap-4 text-xs text-slate-400 font-medium">
              <span className="flex items-center gap-1.5 text-cyan-400">
                <CheckCircle2 className="w-4 h-4" /> Official Motto: "Innovate Local, Build Global"
              </span>
              <span className="flex items-center gap-1.5 text-emerald-400">
                <CheckCircle2 className="w-4 h-4" /> Non-Profit &amp; Volunteer Led
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 space-y-16">
        {/* Admin Managed Dynamic Sections */}
        <DynamicSectionRenderer page="about" />

        {/* SECTION 1: WHO WE ARE (Interactive Presentation) */}
        <section className="bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950/70 rounded-3xl p-8 sm:p-12 border border-slate-800 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            <div className="lg:col-span-7 space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>Our Origin &amp; Conviction</span>
              </div>

              <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                Practical Engineering Belongs to Every Child.
              </h2>

              <div className="space-y-4 text-slate-300 text-sm leading-relaxed">
                <p>
                  Across Africa, millions of brilliant young minds study computing on chalkboards or memorise theoretical science formulas without ever touching a microcontroller, sensor, or motor driver.
                </p>
                <p>
                  <strong className="text-white">YARA was created to bridge this divide.</strong> By combining low-cost reusable hardware kits, browser-based simulation workbenches (Wokwi, Tinkercad, EasyEDA), and structured curriculum stages, we give students direct physical computing power.
                </p>
                <p>
                  From building autonomous agricultural rovers that detect crop disease to designing waterproof aquatic drone submersibles, our members solve real continental problems from day one.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  to="/programs"
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-blue-900/30 flex items-center gap-2 transition"
                >
                  <span>Explore Learning Tracks</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/impact"
                  className="px-5 py-3 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white font-bold text-xs rounded-xl border border-slate-800 transition"
                >
                  <span>View Verified Impact</span>
                </Link>
              </div>
            </div>

            {/* Right Side Visual Stats Strip */}
            <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
                <span className="text-3xl font-black text-cyan-400 block font-mono">1,200+</span>
                <span className="text-xs font-black text-white uppercase tracking-wider block">Students Trained</span>
                <span className="text-[11px] text-slate-400 block">Across 10 provinces</span>
              </div>

              <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
                <span className="text-3xl font-black text-emerald-400 block font-mono">100%</span>
                <span className="text-xs font-black text-white uppercase tracking-wider block">Gender Parity</span>
                <span className="text-[11px] text-slate-400 block">Mandatory 2B + 2G rule</span>
              </div>

              <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
                <span className="text-3xl font-black text-amber-400 block font-mono">14+</span>
                <span className="text-xs font-black text-white uppercase tracking-wider block">School Clubs</span>
                <span className="text-[11px] text-slate-400 block">Certified active chapters</span>
              </div>

              <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
                <span className="text-3xl font-black text-purple-400 block font-mono">42</span>
                <span className="text-xs font-black text-white uppercase tracking-wider block">LMS Modules</span>
                <span className="text-[11px] text-slate-400 block">Tiers 1 to 4 mastered</span>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2: FOUR CORE PILLARS */}
        <section className="space-y-6">
          <div className="border-b border-slate-800/80 pb-4">
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <Cpu className="w-5 h-5 text-cyan-400" />
              <span>The Four Pillars of the YARA Framework</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">Our comprehensive blueprint to engineer generational technical capability.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {pillars.map((pil, idx) => {
              const Icon = pil.icon;
              return (
                <div
                  key={idx}
                  className={`p-6 rounded-3xl bg-slate-900 border ${pil.border} hover:border-cyan-400/60 transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between shadow-xl space-y-4`}
                >
                  <div className="space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                      <Icon className={`w-6 h-6 ${pil.color}`} />
                    </div>
                    <h3 className="text-base font-black text-white">
                      {pil.title}
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {pil.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* SECTION 3: MISSION & VISION ILLUMINATED */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.section 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-blue-950 via-slate-900 to-indigo-950 rounded-3xl p-8 text-white border border-blue-600/30 shadow-2xl space-y-4"
          >
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-500/20 border border-blue-500/40 rounded-2xl flex items-center justify-center text-blue-400">
                <Target className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-black text-white">Our Mission</h3>
            </div>
            <p className="text-blue-100/90 text-sm sm:text-base leading-relaxed font-normal">
              To equip young Africans with practical STEM, physical computing, and robotics engineering capacity to solve critical local challenges, bridge the digital divide, and compete at the highest continental and global levels.
            </p>
          </motion.section>

          <motion.section 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 rounded-3xl p-8 text-white border border-indigo-600/30 shadow-2xl space-y-4"
          >
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-amber-500/20 border border-amber-500/40 rounded-2xl flex items-center justify-center text-amber-400">
                <Eye className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-black text-white">Our Vision</h3>
            </div>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed font-normal">
              To build Africa's premier youth-led robotics and technology movement, establishing vibrant innovation laboratories in every school and producing ethical, globally competitive technological champions.
            </p>
          </motion.section>
        </div>

        {/* SECTION 4: MILESTONES JOURNEY */}
        <section className="space-y-6">
          <div className="border-b border-slate-800/80 pb-4">
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <Rocket className="w-5 h-5 text-cyan-400" />
              <span>Our Evolutionary Journey</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">Tracing our growth from university workshop to pan-African robotics arena.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {milestones.map((m, idx) => (
              <div 
                key={idx}
                className="p-6 rounded-3xl bg-slate-900 border border-slate-800 hover:border-slate-700 shadow-xl space-y-3 transition-all"
              >
                <span className="px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 text-[11px] font-black uppercase font-mono">
                  {m.year}
                </span>
                <h3 className="text-base font-black text-white pt-1">
                  {m.title}
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {m.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 5: CORE VALUES */}
        <section className="space-y-6">
          <div className="border-b border-slate-800/80 pb-4">
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <Heart className="w-5 h-5 text-red-400" />
              <span>Guiding Principles</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">The bedrock values that guide every YARA chapter, lab, and competition.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {values.map((val, i) => (
              <div
                key={i}
                className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-blue-500/40 shadow-xl space-y-2 transition-all"
              >
                <h4 className="text-base font-bold text-cyan-400">{val.title}</h4>
                <p className="text-xs text-slate-300 leading-relaxed">{val.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA SECTION */}
        <section className="rounded-3xl bg-gradient-to-r from-blue-950 via-indigo-950 to-slate-900 border border-indigo-700/40 p-8 sm:p-12 text-center text-white space-y-6 shadow-2xl relative overflow-hidden">
          <div className="max-w-2xl mx-auto space-y-3 relative z-10">
            <h3 className="text-2xl sm:text-4xl font-black tracking-tight">
              Ready to Build the Future with Us?
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
              Whether you are a student ready to code your first robot, a teacher establishing a school club, or a sponsor backing young builders.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 relative z-10 pt-2">
            <Link
              to="/learn"
              className="px-6 py-3.5 bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 hover:from-cyan-300 hover:to-indigo-500 text-slate-950 font-black text-xs uppercase tracking-wider rounded-2xl shadow-xl shadow-cyan-500/20 transition-all hover:scale-105"
            >
              <span>Explore LMS Academy</span>
            </Link>
            <Link
              to="/contact"
              className="px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-2xl border border-white/20 transition-all"
            >
              <span>Contact Directorate</span>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}

function Trophy(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/>
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
      <path d="M4 22h16"/>
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/>
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>
    </svg>
  );
}
