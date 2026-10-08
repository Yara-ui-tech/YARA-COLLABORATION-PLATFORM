import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Cpu, Code, Brain, Radio, Wrench, GraduationCap, 
  ShieldCheck, Lightbulb, CheckCircle2, ArrowRight, 
  Calendar, Users, BookOpen, Clock, Trophy, Sparkles
} from 'lucide-react';
import { cn } from '../lib/utils';
import { DynamicSectionRenderer } from '../components/DynamicSectionRenderer';

export interface ProgrammeTrack {
  id: string;
  name: string;
  tagline: string;
  icon: any;
  color: string;
  badgeBg: string;
  badgeColor: string;
  description: string;
  whoItsFor: string[];
  skillsGained: string[];
  trainingFormat: string;
  duration: string;
  availableCourses: Array<{
    title: string;
    level: string;
    duration: string;
    path: string;
  }>;
  upcomingSessions: Array<{
    title: string;
    date: string;
    format: string;
  }>;
  ctaText: string;
  ctaPath: string;
}

export const YARA_PROGRAMMES: ProgrammeTrack[] = [
  {
    id: 'robotics',
    name: 'Robotics Engineering',
    tagline: 'Autonomous land rovers, micromouse maze solvers, and aquatic ROVs',
    icon: Cpu,
    color: 'from-blue-600 to-indigo-600',
    badgeBg: 'bg-blue-500/10 border-blue-500/30',
    badgeColor: 'text-blue-400',
    description: 'Our flagship engineering track covering the entire physical computing lifecycle: chassis kinematics, motor drivers, sensor telemetry (Infrared arrays, Sonar, IMUs), power delivery, and closed-loop control algorithms. Students transform raw components into intelligent autonomous machines.',
    whoItsFor: [
      'Primary & secondary school learners (Ages 10–19)',
      'School robotics club members & team captains',
      'STEM educators establishing school robotics labs'
    ],
    skillsGained: [
      'Circuit schematic capture & breadboard prototyping',
      'DC motor, stepper motor, and servo H-bridge interfacing',
      'PID line-tracking and autonomous maze traversal',
      'Underwater ROV buoyancy & waterproof seal design'
    ],
    trainingFormat: 'Hands-on Physical Hardware Lab & Wokwi/Tinkercad Virtual Simulation',
    duration: '14-Session Core Programme (8 to 12 Weeks)',
    availableCourses: [
      { title: 'Foundations of Robotics & Circuits (Tier 1)', level: 'Beginner', duration: '4 Weeks', path: '/learning?course=robotics-beginner' },
      { title: 'Embedded C++ & Motor Driver Integration (Tier 2)', level: 'Intermediate', duration: '6 Weeks', path: '/learning?course=robotics-intermediate' },
      { title: 'Autonomous Micromouse Maze Navigation (Tier 3)', level: 'Advanced', duration: '4 Weeks', path: '/learning?course=robotics-advanced' }
    ],
    upcomingSessions: [
      { title: 'Junior Robotics Saturday Lab Cohort', date: 'Starts Sept 12, 2026', format: 'Provincial Chapter Centers' },
      { title: 'YARA 2026 National Arena Bootcamp', date: 'Oct 02 – 04, 2026', format: 'National Science Arena' }
    ],
    ctaText: 'Enroll in Robotics Track in LMS',
    ctaPath: '/learning?course=robotics-beginner'
  },
  {
    id: 'coding',
    name: 'Coding & Embedded Firmware',
    tagline: 'MicroPython, C++, and hardware algorithmic control',
    icon: Code,
    color: 'from-emerald-600 to-teal-600',
    badgeBg: 'bg-emerald-500/10 border-emerald-500/30',
    badgeColor: 'text-emerald-400',
    description: 'Demystifying the software layer of hardware. Moving from visual block-based logic for juniors to industry-standard MicroPython and embedded C/C++ on ESP32, Raspberry Pi Pico, and STM32 architectures.',
    whoItsFor: [
      'Junior innovators starting programming (Ages 8+)',
      'High school Computer Science & ZIMSEC ICT students',
      'University engineering enthusiasts seeking firmware fluency'
    ],
    skillsGained: [
      'Non-blocking asynchronous control loops & timer interrupts',
      'Hardware communication buses (I2C, SPI, UART, PWM)',
      'State-machine architecture for autonomous navigation',
      'Debugging firmware memory leaks & watchdog timers'
    ],
    trainingFormat: 'Online Code Workbench + Live Instructor Code-Alongs',
    duration: '8 Weeks (Self-Paced or Guided Cohorts)',
    availableCourses: [
      { title: 'Visual Block Coding for Young Minds', level: 'Junior', duration: '3 Weeks', path: '/learning?course=scratch-junior' },
      { title: 'MicroPython for Hardware & Sensor Interfacing', level: 'Intermediate', duration: '5 Weeks', path: '/learning?course=python-robotics' },
      { title: 'Real-Time Embedded C++ for Robotics Competitions', level: 'Advanced', duration: '6 Weeks', path: '/learning?course=robotics-intermediate' }
    ],
    upcomingSessions: [
      { title: 'Virtual Firmware Sprint (MicroPython)', date: 'Starts Sept 18, 2026', format: 'Online Live Stream' }
    ],
    ctaText: 'Start Coding Hardware in LMS',
    ctaPath: '/learning?course=python-robotics'
  },
  {
    id: 'ai-iot',
    name: 'Artificial Intelligence & IoT',
    tagline: 'Edge AI vision, environmental sensor grids, and automated cloud telemetry',
    icon: Brain,
    color: 'from-purple-600 to-indigo-600',
    badgeBg: 'bg-purple-500/10 border-purple-500/30',
    badgeColor: 'text-purple-400',
    description: 'Empowering African youth to leverage modern Artificial Intelligence and Internet of Things to solve continental challenges in agriculture, water distribution, energy management, and wildlife conservation.',
    whoItsFor: [
      'Secondary & tertiary students seeking cutting-edge skills',
      'Teachers seeking AI pedagogical automation tools',
      'Aspiring tech entrepreneurs prototyping smart devices'
    ],
    skillsGained: [
      'Edge AI TinyML models for object and weed classification',
      'IoT cloud dashboards (MQTT, REST APIs, WebSockets)',
      'Agricultural soil moisture & telemetry automation',
      'Prompt engineering & generative AI for lesson design'
    ],
    trainingFormat: 'Blended Masterclass + Real Cloud Sensor Projects',
    duration: '6 Weeks (Intensive Project Track)',
    availableCourses: [
      { title: 'AI for Educators: Prompt Engineering & Automation', level: 'All Levels', duration: '1 Week', path: '/learning?course=ai-for-educators' },
      { title: 'TinyML: Machine Learning on Microcontrollers', level: 'Intermediate', duration: '4 Weeks', path: '/learning?course=python-robotics' },
      { title: 'IoT Connected Systems for African Agriculture', level: 'Advanced', duration: '5 Weeks', path: '/learning?course=iot-cloud-telemetry' }
    ],
    upcomingSessions: [
      { title: 'AI for Educators National Bootcamp', date: 'Aug 31 – Sep 04, 2026', format: 'Live Google Meet' }
    ],
    ctaText: 'Explore AI & IoT Courses in LMS',
    ctaPath: '/learning?course=iot-cloud-telemetry'
  },
  {
    id: 'stem',
    name: 'STEM Education & School Clubs',
    tagline: 'Institutional club charters, patron training, and lab setup',
    icon: GraduationCap,
    color: 'from-amber-500 to-orange-600',
    badgeBg: 'bg-amber-500/10 border-amber-500/30',
    badgeColor: 'text-amber-400',
    description: 'Our foundational institutional outreach framework. We partner directly with primary and secondary schools to establish continuous Robotics and STEM Clubs with verified teacher patrons, sustainable kit rotation, and inter-school qualifiers.',
    whoItsFor: [
      'School Principals & STEM Department Heads',
      'Primary & Secondary School Teachers (Patrons)',
      'Community Centers & Youth Development NGOs'
    ],
    skillsGained: [
      'Establishing accredited school robotics club charters',
      'Maintaining 100% gender-balanced student participation (2B + 2G)',
      'Hardware kit stewardship & low-cost component sourcing',
      'Running school-level robotics exhibitions and hack days'
    ],
    trainingFormat: 'In-Person School Visits + Patron Certification Portal',
    duration: 'Year-Round Ongoing Institutional Partnership',
    availableCourses: [
      { title: 'School Patron & Coach Certification', level: 'Teacher', duration: '2 Weeks', path: '/learning?course=school-robotics-patron' },
      { title: 'Differentiated STEM Lesson Planning Workbench', level: 'Teacher', duration: 'Self-Paced', path: '/learning?course=ai-for-educators' }
    ],
    upcomingSessions: [
      { title: 'Mashwest Provincial School Patrons Assembly', date: 'Sept 15, 2026', format: 'Chinhoyi Provincial Hall' }
    ],
    ctaText: 'Enrol in Patron Course in LMS',
    ctaPath: '/learning?course=school-robotics-patron'
  },
  {
    id: 'engineering',
    name: 'Engineering & PCB Hardware Design',
    tagline: 'Schematic capture, board layout, soldering, and mechanical CAD',
    icon: Wrench,
    color: 'from-rose-600 to-red-600',
    badgeBg: 'bg-rose-500/10 border-rose-500/30',
    badgeColor: 'text-rose-400',
    description: 'Transitioning from breadboards to manufactured printed circuit boards. Students learn schematic design in EDA software, Gerber file generation, surface mount soldering, and 3D CAD parametric modeling for custom robot chassis.',
    whoItsFor: [
      'Senior secondary & polytechnic students',
      'Aspiring electrical & mechanical hardware engineers',
      'Makers building commercializable hardware prototypes'
    ],
    skillsGained: [
      'Schematic capture & 2-layer PCB layout routing',
      'Bill of Materials (BOM) optimization & component selection',
      'Through-hole and SMD soldering inspection',
      '3D printing tolerances and mechanical stress analysis'
    ],
    trainingFormat: 'Interactive Hardware Masterclasses + Lab Practical Sessions',
    duration: '8 Weeks',
    availableCourses: [
      { title: 'PCB Design with KiCad & Altium Basics', level: 'Intermediate', duration: '4 Weeks', path: '/learning?course=cad-pcb-design' },
      { title: 'CAD 3D Modeling for Robot Mechanisms', level: 'Intermediate', duration: '4 Weeks', path: '/learning?course=cad-pcb-design' }
    ],
    upcomingSessions: [
      { title: 'PCB Fabrication & Assembly Masterclass', date: 'Sept 26, 2026', format: 'Innovation Lab Chinhoyi' }
    ],
    ctaText: 'Join CAD & PCB Course in LMS',
    ctaPath: '/learning?course=cad-pcb-design'
  },
  {
    id: 'digital-literacy',
    name: 'Digital Literacy & Cybersecurity',
    tagline: 'Equipping rural & urban youth with essential computing & internet safety',
    icon: ShieldCheck,
    color: 'from-cyan-600 to-blue-600',
    badgeBg: 'bg-cyan-500/10 border-cyan-500/30',
    badgeColor: 'text-cyan-400',
    description: 'Ensuring that no African child is left behind in the digital transformation. We bridge the digital divide by teaching essential computer architecture, online safety, information evaluation, and ethical digital citizenship.',
    whoItsFor: [
      'Rural & underserved community learners',
      'Young minds entering digital spaces for the first time',
      'Parents & community stakeholders'
    ],
    skillsGained: [
      'Operating system navigation & office productivity tools',
      'Safe online communication & phishing defense',
      'Basic data ethics and digital responsibility',
      'Accessing verified educational resources independently'
    ],
    trainingFormat: 'Community Outreach Workshops & Offline Learning Modules',
    duration: '4 Weeks',
    availableCourses: [
      { title: 'Digital Literacy Foundations for African Youth', level: 'Beginner', duration: '4 Weeks', path: '/learning?course=scratch-junior' },
      { title: 'Web Architecture & Coding for Young Innovators', level: 'Beginner', duration: '2 Weeks', path: '/learning?course=javascript-web-dev' }
    ],
    upcomingSessions: [
      { title: 'Grassroots Community Digital Workshop', date: 'Oct 10, 2026', format: 'Rural Chapter Centers' }
    ],
    ctaText: 'Explore Coding in LMS',
    ctaPath: '/learning?course=javascript-web-dev'
  },
  {
    id: 'innovation',
    name: 'Youth Innovation & Capstones',
    tagline: 'Translating STEM skills into viable, community-transforming solutions',
    icon: Lightbulb,
    color: 'from-amber-400 to-yellow-500',
    badgeBg: 'bg-amber-500/10 border-amber-500/30',
    badgeColor: 'text-amber-400',
    description: 'We encourage young Africans to identify pressing local challenges—such as agricultural post-harvest loss, solar water pumping, or medical cold chains—and engineer working robotic solutions backed by rigorous technical documentation.',
    whoItsFor: [
      'Capstone students completing YARA Level 8 programme',
      'Youth innovation teams pitching for grant funding',
      'Independent African inventors'
    ],
    skillsGained: [
      '5-Whys root cause problem analysis in local context',
      'Rapid prototype validation and field stress testing',
      'Writing professional 21-point technical engineering reports',
      '90-second innovation defense before corporate judges'
    ],
    trainingFormat: 'Mentorship Incubator & Pitch Competitions',
    duration: '8 Weeks Project Sprint',
    availableCourses: [
      { title: 'Hardware Capstone Project Incubator', level: 'Advanced', duration: '8 Weeks', path: '/learning?course=industrial-automation-plc' },
      { title: 'Autonomous Robotics Defense Masterclass', level: 'All Levels', duration: '2 Weeks', path: '/learning?course=robotics-advanced' }
    ],
    upcomingSessions: [
      { title: 'YARA 2026 Innovation Pitch Defense', date: 'Oct 16 – 18, 2026', format: 'National Championship Arena' }
    ],
    ctaText: 'Explore Capstones in LMS',
    ctaPath: '/learning?tab=projects'
  }
];

export default function Programs() {
  const [searchParams, setSearchParams] = useSearchParams();
  const trackParam = searchParams.get('track') || 'robotics';

  const [activeTrackId, setActiveTrackId] = useState<string>(() => {
    const matched = YARA_PROGRAMMES.find(p => p.id === trackParam);
    return matched ? matched.id : 'robotics';
  });

  useEffect(() => {
    const param = searchParams.get('track');
    if (param && YARA_PROGRAMMES.some(p => p.id === param)) {
      setActiveTrackId(param);
    }
  }, [searchParams]);

  const activeTrack = YARA_PROGRAMMES.find(p => p.id === activeTrackId) || YARA_PROGRAMMES[0];

  const handleSelectTrack = (id: string) => {
    setActiveTrackId(id);
    setSearchParams({ track: id }, { replace: true });
  };

  return (
    <div className="space-y-12 pb-24">
      {/* Header Banner */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-blue-950/40 to-slate-950 pt-16 pb-20 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="max-w-7xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold uppercase tracking-wider">
            <Cpu className="w-4 h-4" />
            <span>YARA Educational Architecture</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
            Comprehensive <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">STEM &amp; Robotics Programmes</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-3xl mx-auto font-normal leading-relaxed">
            From first electronic circuit foundations to autonomous competitive robotics and community innovation capstones. Explore our 8 structured learning tracks.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <Link
              to="/auth"
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black px-6 py-3.5 rounded-2xl text-xs uppercase tracking-wider shadow-xl shadow-blue-900/40 transition-all flex items-center gap-2 hover:scale-105"
            >
              <span>Enroll in a Programme</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/training"
              className="bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 font-bold px-6 py-3.5 rounded-2xl text-xs transition-all"
            >
              View Upcoming Training Dates
            </Link>
          </div>
        </div>
      </section>

      {/* Admin Custom Sections */}
      <DynamicSectionRenderer page="programs" />

      {/* Structured Tracks Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Track Selection Tabs */}
        <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-900 border border-slate-800 rounded-2xl overflow-x-auto">
          {YARA_PROGRAMMES.map((prog) => {
            const Icon = prog.icon;
            const isSelected = prog.id === activeTrackId;
            return (
              <button
                key={prog.id}
                onClick={() => handleSelectTrack(prog.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all whitespace-nowrap",
                  isSelected
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-900/40"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                )}
              >
                <Icon className="w-4 h-4" />
                <span>{prog.name}</span>
              </button>
            );
          })}
        </div>

        {/* Selected Track Detailed View Card */}
        <div className="rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden shadow-2xl space-y-8 p-6 sm:p-10">
          {/* Top Banner */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-slate-800 pb-8">
            <div className="space-y-3 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className={cn("px-3 py-1 rounded-full text-xs font-bold border", activeTrack.badgeBg, activeTrack.badgeColor)}>
                  Official YARA Track
                </span>
                <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-semibold">
                  {activeTrack.duration}
                </span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                {activeTrack.name}
              </h2>

              <p className="text-base text-blue-400 font-semibold">
                {activeTrack.tagline}
              </p>

              <p className="text-sm text-slate-300 leading-relaxed font-normal">
                {activeTrack.description}
              </p>
            </div>

            <div className="shrink-0 flex flex-col sm:flex-row lg:flex-col gap-3">
              <Link
                to={activeTrack.ctaPath}
                className="bg-blue-600 hover:bg-blue-500 text-white font-black px-6 py-3.5 rounded-2xl text-xs uppercase tracking-wider shadow-xl shadow-blue-900/40 transition-all flex items-center justify-center gap-2 hover:scale-105"
              >
                <span>{activeTrack.ctaText}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                to="/contact"
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold px-6 py-3.5 rounded-2xl text-xs text-center transition-all"
              >
                Inquire for School
              </Link>
            </div>
          </div>

          {/* Key Columns: Who It's For & Skills Gained */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Who It's For */}
            <div className="p-6 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-4">
              <div className="flex items-center gap-2 text-white font-bold text-sm uppercase tracking-wider">
                <Users className="w-4 h-4 text-blue-400" />
                <span>Target Audience (Who It's For)</span>
              </div>
              <ul className="space-y-2.5 text-xs text-slate-300">
                {activeTrack.whoItsFor.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Skills Gained */}
            <div className="p-6 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-4">
              <div className="flex items-center gap-2 text-white font-bold text-sm uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Core Competencies & Skills Gained</span>
              </div>
              <ul className="space-y-2.5 text-xs text-slate-300">
                {activeTrack.skillsGained.map((skill, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{skill}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Training Format & Methodology */}
          <div className="p-6 rounded-2xl bg-blue-950/20 border border-blue-900/40 text-xs space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">
              Training Delivery Format:
            </span>
            <p className="text-sm font-bold text-white">{activeTrack.trainingFormat}</p>
          </div>

          {/* Available Courses & Upcoming Sessions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-4">
            {/* Available Courses */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-white font-bold text-sm uppercase tracking-wider">
                <BookOpen className="w-4 h-4 text-indigo-400" />
                <span>Available Courses &amp; Modules</span>
              </div>
              <div className="space-y-2.5">
                {activeTrack.availableCourses.map((c, idx) => (
                  <Link
                    key={idx}
                    to={c.path}
                    className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-blue-500/40 transition-all flex items-center justify-between group"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-white group-hover:text-blue-400 transition-colors">
                        {c.title}
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Level: <span className="text-slate-300 font-semibold">{c.level}</span> • Duration: {c.duration}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400 group-hover:translate-x-1 transition-all shrink-0" />
                  </Link>
                ))}
              </div>
            </div>

            {/* Upcoming Cohorts */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-white font-bold text-sm uppercase tracking-wider">
                <Calendar className="w-4 h-4 text-amber-400" />
                <span>Upcoming Cohorts &amp; Live Sessions</span>
              </div>
              <div className="space-y-2.5">
                {activeTrack.upcomingSessions.map((s, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-white">{s.title}</h4>
                      <p className="text-[11px] text-amber-400 font-medium mt-0.5">{s.date}</p>
                      <p className="text-[10px] text-slate-500">{s.format}</p>
                    </div>
                    <Link
                      to="/training"
                      className="px-3 py-1.5 rounded-lg bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white border border-blue-500/30 text-xs font-bold transition"
                    >
                      View
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Grid of All 8 Programmes at a Glance */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        <div className="border-t border-slate-800 pt-10">
          <h3 className="text-2xl font-black text-white">All 8 YARA Programmes at a Glance</h3>
          <p className="text-xs text-slate-400 mt-1">Select any card to explore full track details above</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {YARA_PROGRAMMES.map((prog) => {
            const Icon = prog.icon;
            const isSelected = prog.id === activeTrackId;
            return (
              <button
                key={prog.id}
                onClick={() => handleSelectTrack(prog.id)}
                className={cn(
                  "p-5 rounded-2xl border text-left transition-all flex flex-col justify-between space-y-3",
                  isSelected
                    ? "bg-blue-950/60 border-blue-500 shadow-lg"
                    : "bg-slate-900 border-slate-800 hover:border-slate-700 hover:bg-slate-800/60"
                )}
              >
                <div>
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-3", prog.badgeBg, prog.badgeColor)}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-bold text-white">{prog.name}</h4>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {prog.tagline}
                  </p>
                </div>
                <div className="text-[11px] font-bold text-blue-400 flex items-center gap-1">
                  <span>Explore Track</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
