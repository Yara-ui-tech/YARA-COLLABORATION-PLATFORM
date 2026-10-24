import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  BarChart3, Rocket, Globe, CheckCircle2, ArrowRight, 
  Users, Trophy, GraduationCap, Cpu, ShieldCheck, Heart, 
  Sparkles, MapPin, Building2, School, Flame, Award, ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Breadcrumbs from '../components/Breadcrumbs';

export default function Impact() {
  const [activeProvince, setActiveProvince] = useState<string>('Mashonaland West');

  const kpis = [
    { value: '1,200+', label: 'Students Reached', desc: 'Direct hands-on physical computing and hardware lab sessions', icon: Users, color: 'text-cyan-400', border: 'border-cyan-500/30' },
    { value: '14+', label: 'Certified School Clubs', desc: 'Continuous active robotics charters with trained teacher patrons', icon: School, color: 'text-blue-400', border: 'border-blue-500/30' },
    { value: '100%', label: 'Gender Parity Enforced', desc: 'Mandatory 2 Boys + 2 Girls equality rule in every competitive team', icon: ShieldCheck, color: 'text-emerald-400', border: 'border-emerald-500/30' },
    { value: '10', label: 'Provinces Engaged', desc: 'Reaching urban centers, peri-urban zones, and underserved rural schools', icon: Globe, color: 'text-amber-400', border: 'border-amber-500/30' },
    { value: '42', label: 'Hands-on Micro-Modules', desc: 'From basic Ohm’s law breadboards to autonomous TinyML Edge AI', icon: Cpu, color: 'text-purple-400', border: 'border-purple-500/30' }
  ];

  const provinceData: Record<string, { schools: string; students: string; highlight: string; projects: string[] }> = {
    'Mashonaland West': {
      schools: '5 Partner Schools',
      students: '420+ Learners',
      highlight: 'Chinhoyi University of Technology (CUT) Innovation Hub partnership and grassroots school clubs.',
      projects: ['Agro-Drone Precision Soil Telemetry', 'Autonomous Maze Micromouse', 'Solar Pumping Telemetry']
    },
    'Harare Metropolitan': {
      schools: '4 Partner Schools',
      students: '380+ Learners',
      highlight: 'National Science Arena host province and high-density community youth maker workshops.',
      projects: ['Aquatic ROV Depth Explorer at Lake Chivero', 'High School Line-Follower Derby', 'AI Lesson Synthesis Labs']
    },
    'Bulawayo & Matabeleland': {
      schools: '3 Partner Schools',
      students: '260+ Learners',
      highlight: 'NUST Technology Center collaboration with focus on industrial embedded C++ hardware design.',
      projects: ['Industrial Pick-and-Place Robotic Arm', 'Obstacle Avoidance Rover', 'KiCad 2-Layer PCB Fabrication']
    },
    'Manicaland & Midlands': {
      schools: '2 Partner Schools',
      students: '140+ Learners',
      highlight: 'Rural electrification STEM pilot bringing low-power ESP32 kits to resource-constrained districts.',
      projects: ['Solar Energy Telemetry Logger', 'Smart Green-House Climate Monitor']
    }
  };

  const stories = [
    {
      title: 'Lake Chivero Aquatic Drone Mission Test',
      location: 'Harare Province',
      category: 'Marine Robotics',
      desc: 'High school teams successfully deployed a custom waterproof submersible with brushless thrusters, retrieving seabed telemetry markers at 3.5m depth.',
      image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80',
      tag: 'Field Proven'
    },
    {
      title: '100% Gender Parity in Action (2B + 2G Rule)',
      location: 'Chinhoyi Chapter',
      category: 'Inclusive Engineering',
      desc: 'Over 600 young women have wired their first microcontrollers, written non-blocking embedded C++, and pitched hardware prototypes on competition stages.',
      image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80',
      tag: 'Continental Standard'
    },
    {
      title: 'Autonomous Micromouse FloodFill Maze Solvers',
      location: 'National Arena',
      category: 'Autonomous Systems',
      desc: 'Learners implemented closed-loop PID control and ultrasonic sensor arrays, achieving sub-45-second autonomous maze traversal without external aid.',
      image: 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?auto=format&fit=crop&w=800&q=80',
      tag: 'Algorithm Mastery'
    }
  ];

  const strategicGoals = [
    {
      year: '2026 – 2027',
      title: 'Provincial Expansion to 50+ Schools',
      desc: 'Deploy 150 low-cost reusable hardware lab kits to rural district schools with solar-friendly simulation tools.'
    },
    {
      year: '2027 – 2028',
      title: 'Pan-African SADC Robotics League',
      desc: 'Host the Southern Africa regional qualifiers uniting youth tech teams from Zimbabwe, Zambia, Botswana, and South Africa.'
    },
    {
      year: '2028 – 2030',
      title: 'Youth Hardware Incubator & Seed Fund',
      desc: 'Bridge student prototypes into commercial agricultural and water-tech startups solving Africa’s critical infrastructure challenges.'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-24">
      {/* Header & Breadcrumbs */}
      <div className="relative overflow-hidden border-b border-slate-800/80 bg-gradient-to-b from-slate-950 via-indigo-950/20 to-slate-950">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-gradient-to-tr from-cyan-500/20 via-blue-600/15 to-transparent rounded-full blur-3xl pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-14 relative z-10 space-y-6">
          <Breadcrumbs
            items={[
              { label: 'Home', href: '/' },
              { label: 'Impact & Progress' }
            ]}
          />

          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-black uppercase tracking-widest shadow-xs">
              <BarChart3 className="w-4 h-4 text-cyan-400" />
              <span>Measurable Educational Transformation</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1]">
              Engineering Real Opportunity, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-300">
                District by District.
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-300 font-normal leading-relaxed max-w-2xl">
              We track our success not by vanity numbers, but by the physical robots built, circuits soldered, algorithms defended, and barriers broken by African youth.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 space-y-16">
        {/* SECTION 1: KEY PERFORMANCE INDICATORS */}
        <section className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
            <div className="flex items-center space-x-2.5">
              <Sparkles className="w-5 h-5 text-cyan-400" />
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">Verified Platform Metrics</h2>
            </div>
            <span className="text-xs text-slate-400 font-mono">Live Certified Data</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {kpis.map((kpi, i) => {
              const Icon = kpi.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className={`p-6 rounded-3xl bg-slate-900/90 border ${kpi.border} hover:border-cyan-400/60 shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between`}
                >
                  <div className="space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                      <Icon className={`w-6 h-6 ${kpi.color}`} />
                    </div>
                    <span className={`text-3xl sm:text-4xl font-black ${kpi.color} block tracking-tight`}>
                      {kpi.value}
                    </span>
                    <h3 className="text-sm font-black text-white leading-snug">
                      {kpi.label}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-400 mt-3 leading-relaxed border-t border-slate-800/80 pt-3">
                    {kpi.desc}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* SECTION 2: PROVINCIAL REACH BREAKDOWN */}
        <section className="p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950/60 border border-slate-800 shadow-2xl space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800/80 pb-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold uppercase tracking-wider">
                <MapPin className="w-3.5 h-3.5" />
                <span>Geographical Footprint</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Provincial Outreach Across Zimbabwe
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
                Explore hands-on student participation and school cluster developments across our active hubs.
              </p>
            </div>

            {/* Province Selector Tabs */}
            <div className="flex flex-wrap gap-2">
              {Object.keys(provinceData).map(prov => (
                <button
                  key={prov}
                  onClick={() => setActiveProvince(prov)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeProvince === prov
                      ? 'bg-gradient-to-r from-cyan-400 to-blue-600 text-slate-950 font-black shadow-md shadow-cyan-500/20'
                      : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {prov}
                </button>
              ))}
            </div>
          </div>

          {/* Active Province Detail Card */}
          {provinceData[activeProvince] && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 space-y-5">
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-black uppercase">
                    {provinceData[activeProvince].schools}
                  </span>
                  <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold">
                    {provinceData[activeProvince].students}
                  </span>
                </div>

                <h3 className="text-2xl sm:text-3xl font-black text-white">
                  {activeProvince} Chapter Hub
                </h3>

                <p className="text-sm text-slate-300 leading-relaxed">
                  {provinceData[activeProvince].highlight}
                </p>

                <div className="space-y-2 pt-2">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider">
                    Key Practical Projects Deployed:
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {provinceData[activeProvince].projects.map((proj, idx) => (
                      <div key={idx} className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl text-xs font-bold text-slate-200 flex items-center space-x-2">
                        <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                        <span className="truncate">{proj}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5 p-6 bg-slate-950/90 rounded-3xl border border-slate-800/80 space-y-4 text-center">
                <Globe className="w-12 h-12 text-cyan-400 mx-auto" />
                <h4 className="text-lg font-black text-white">Start a Club in Your School</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  We provide free curriculum modules, patron onboarding, and hardware starter kits to certified patron schools.
                </p>
                <Link
                  to="/chapters"
                  className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition"
                >
                  <span>Register School Chapter</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}
        </section>

        {/* SECTION 3: VISUAL IMPACT STORIES */}
        <section className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">Real Stories from the Arena</h2>
              <p className="text-xs text-slate-400 mt-1">First-hand engineering breakthroughs documented across our chapters.</p>
            </div>
            <Link to="/impact-gallery" className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1">
              <span>View Full Photo Gallery</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {stories.map((st, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-slate-900/90 rounded-3xl overflow-hidden border border-slate-800 hover:border-cyan-500/40 shadow-xl flex flex-col justify-between group transition-all"
              >
                <div>
                  <div className="relative h-48 overflow-hidden bg-slate-950">
                    <img 
                      src={st.image} 
                      alt={st.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                      <span className="px-2.5 py-0.5 rounded-full bg-cyan-500 text-slate-950 font-black text-[10px] uppercase">
                        {st.category}
                      </span>
                    </div>
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white">
                      <span className="font-bold flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                        <span>{st.location}</span>
                      </span>
                      <span className="text-[10px] font-mono text-amber-400 font-bold uppercase">{st.tag}</span>
                    </div>
                  </div>

                  <div className="p-6 space-y-3">
                    <h3 className="text-base font-black text-white group-hover:text-cyan-300 transition-colors leading-snug">
                      {st.title}
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {st.desc}
                    </p>
                  </div>
                </div>

                <div className="p-6 pt-0 border-t border-slate-800/60 mt-2">
                  <Link
                    to="/impact-gallery"
                    className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center justify-between transition"
                  >
                    <span>Read Full Case Study</span>
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* SECTION 4: STRATEGIC HORIZON 2026-2030 */}
        <section className="space-y-6">
          <div className="border-b border-slate-800/80 pb-4">
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <Rocket className="w-5 h-5 text-indigo-400" />
              <span>Strategic Horizon (2026 – 2030)</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">Our long-term roadmap to scale robotics capacity across the continent.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {strategicGoals.map((goal, idx) => (
              <div 
                key={idx}
                className="p-6 rounded-3xl bg-slate-900 border border-slate-800 hover:border-indigo-500/40 shadow-xl space-y-3 transition-all"
              >
                <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-black uppercase font-mono">
                  {goal.year}
                </span>
                <h3 className="text-lg font-black text-white pt-1">
                  {goal.title}
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {goal.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA BANNER */}
        <section className="rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 border border-blue-700/40 p-8 sm:p-12 text-center text-white space-y-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="max-w-2xl mx-auto space-y-3 relative z-10">
            <h3 className="text-2xl sm:text-4xl font-black tracking-tight">
              Help Us Equip the Next 1,000 African Roboticists
            </h3>
            <p className="text-xs sm:text-sm text-blue-200 leading-relaxed font-normal">
              Whether you are an educator, engineering mentor, donor, or school head, you have a vital role in expanding STEM education across Africa.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 relative z-10 pt-2">
            <Link
              to="/donations"
              className="px-6 py-3.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-2xl shadow-xl shadow-amber-500/20 transition-all hover:scale-105"
            >
              <span>Sponsor a Hardware Kit</span>
            </Link>
            <Link
              to="/volunteer"
              className="px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-2xl border border-white/20 transition-all"
            >
              <span>Join Volunteer Corps</span>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
