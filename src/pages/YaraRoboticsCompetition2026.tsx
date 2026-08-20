import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Trophy, Calendar, MapPin, Clock, ArrowRight, ShieldCheck, 
  Sparkles, Waves, Compass, Lightbulb, Users, CheckCircle2, 
  Award, HelpCircle, Layers, FileText, ChevronRight, Share2, Info
} from 'lucide-react';
import { cn } from '../lib/utils';
import { ASSETS } from '../constants/assets';
import { getEventConfig, getRegistrations } from '../services/yaraCompetitionService';
import { CompetitionEventConfig, CompetitionCategoryType, YaraCompetitionRegistration } from '../types/yaraCompetition';
import { COMPETITION_AWARDS } from '../constants/yaraCompetitionData';
import MultiStepRegistrationModal from '../components/competition/MultiStepRegistrationModal';
import CompetitionLeaderboard from '../components/competition/CompetitionLeaderboard';
import PublicTeamsList from '../components/competition/PublicTeamsList';

export default function YaraRoboticsCompetition2026() {
  const [config, setConfig] = useState<CompetitionEventConfig | null>(null);
  const [registeredTeamsCount, setRegisteredTeamsCount] = useState<number>(0);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [selectedInitialCategory, setSelectedInitialCategory] = useState<CompetitionCategoryType | undefined>(undefined);
  const [activeTab, setActiveTab] = useState<'overview' | 'challenges' | 'awards' | 'leaderboard' | 'teams'>('overview');

  const fetchEventInfo = async () => {
    const [c, teams] = await Promise.all([
      getEventConfig(),
      getRegistrations()
    ]);
    setConfig(c);
    setRegisteredTeamsCount(teams.length);
  };

  useEffect(() => {
    fetchEventInfo();
  }, []);

  const openRegistration = (category?: CompetitionCategoryType) => {
    setSelectedInitialCategory(category);
    setIsRegisterModalOpen(true);
  };

  if (!config) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-16">
      {/* 1. HERO EVENT BANNER */}
      <div className="relative overflow-hidden rounded-3xl md:rounded-[2.5rem] bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 border border-slate-800 text-white shadow-2xl p-6 md:p-12">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 -mt-16 -mr-16 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-16 -ml-16 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6 max-w-4xl">
          {/* Badge & Organizer */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center overflow-hidden shadow-lg border border-indigo-400/30">
              {ASSETS.LOGO ? (
                <img src={ASSETS.LOGO} alt="YARA" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <span className="text-xl font-black text-white">Y</span>
              )}
            </div>

            <span className="px-3.5 py-1 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 text-xs font-black uppercase tracking-wider">
              {config.organizer}
            </span>

            <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Official Registration Open ({registeredTeamsCount} Teams Registered)</span>
            </span>
          </div>

          {/* Title & Tagline */}
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
              {config.name}
            </h1>
            <p className="text-amber-300 font-bold text-base sm:text-lg">
              Theme: “{config.theme}”
            </p>
            <p className="text-indigo-200 text-sm font-semibold tracking-wide uppercase">
              Tagline: “{config.tagline}”
            </p>
          </div>

          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-2xl">
            {config.description}
          </p>

          {/* Event Details Grid (Dynamic & Editable in Admin) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="flex items-center space-x-2 text-indigo-300 text-xs font-bold mb-1">
                <Calendar className="w-4 h-4" />
                <span>Competition Dates</span>
              </div>
              <p className="text-xs font-semibold text-slate-100">{config.date_display}</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="flex items-center space-x-2 text-amber-300 text-xs font-bold mb-1">
                <Clock className="w-4 h-4" />
                <span>Registration Deadline</span>
              </div>
              <p className="text-xs font-semibold text-slate-100">{config.registration_deadline_display}</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="flex items-center space-x-2 text-emerald-300 text-xs font-bold mb-1">
                <MapPin className="w-4 h-4" />
                <span>Venue & Arena</span>
              </div>
              <p className="text-xs font-semibold text-slate-100">{config.venue_display}</p>
            </div>
          </div>

          {/* Primary Action Button */}
          <div className="flex flex-wrap items-center gap-4 pt-4">
            <button
              onClick={() => openRegistration()}
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black text-sm uppercase tracking-wider shadow-xl shadow-amber-500/20 hover:scale-105 active:scale-95 transition-all flex items-center space-x-2"
            >
              <span>Register Team Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => setActiveTab('leaderboard')}
              className="px-6 py-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center space-x-2 transition-all"
            >
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>View Live Championship Standings</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. MANDATORY TEAM COMPOSITION REQUIREMENT BANNER */}
      <div className="p-5 bg-indigo-50/80 border border-indigo-200 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold shrink-0 shadow-sm">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-indigo-950">
              Mandatory Team Composition Rule (2 Boys + 2 Girls)
            </h3>
            <p className="text-xs text-indigo-800/80">
              Every team must register at least <strong>4 participants</strong> comprising a minimum of <strong>2 boys and 2 girls</strong>.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs font-bold text-indigo-900 shrink-0">
          <span className="px-3 py-1 bg-white rounded-xl border border-indigo-200 shadow-2xs">👦 Min 2 Boys</span>
          <span className="px-3 py-1 bg-white rounded-xl border border-indigo-200 shadow-2xs">👧 Min 2 Girls</span>
          <span className="px-3 py-1 bg-white rounded-xl border border-indigo-200 shadow-2xs">👥 Min 4 Total</span>
        </div>
      </div>

      {/* 3. SECTION NAVIGATION TABS */}
      <div className="flex space-x-2 border-b border-slate-200 pb-2 overflow-x-auto">
        {[
          { id: 'overview' as const, label: 'Overview & Format' },
          { id: 'challenges' as const, label: 'Competition Challenges (3)' },
          { id: 'awards' as const, label: 'Championship & Awards' },
          { id: 'leaderboard' as const, label: 'Live Leaderboard' },
          { id: 'teams' as const, label: 'Registered Teams Registry' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap",
              activeTab === tab.id
                ? "bg-slate-900 text-white shadow-md"
                : "text-slate-600 hover:bg-slate-100"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-white rounded-3xl border border-slate-200 space-y-3 shadow-sm">
              <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center">
                <Waves className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900">Underwater Drone Missions</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Design and pilot tethered remotely operated vehicles (ROVs) to navigate subaquatic obstacle courses, identify marked underwater targets, and recover objects. (35% Weight)
              </p>
            </div>

            <div className="p-6 bg-white rounded-3xl border border-slate-200 space-y-3 shadow-sm">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center">
                <Compass className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900">Autonomous Maze Solving</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Build sensor-guided autonomous rovers navigating labyrinth corridors with intelligent wall-following algorithms and dynamic dead-end recovery. (35% Weight)
              </p>
            </div>

            <div className="p-6 bg-white rounded-3xl border border-slate-200 space-y-3 shadow-sm">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <Lightbulb className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900">Innovation Pitch Challenge</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Theme: “Technology for the Underserved”. Pitch tech prototypes solving rural education, agriculture, digital access, and healthcare limitations for youth. (30% Weight)
              </p>
            </div>
          </div>

          {/* Championship Weighting Formula */}
          <div className="p-6 bg-slate-900 text-white rounded-3xl space-y-4">
            <div className="flex items-center space-x-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
              <Trophy className="w-4 h-4" />
              <span>Overall YARA Robotics Champion 2026 Formula</span>
            </div>

            <h3 className="text-xl font-bold">How the Grand Champion is Crowned</h3>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Teams are evaluated comprehensively across technical robustness, autonomous intelligence, and real-world social impact:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 font-mono text-xs">
              <div className="p-3 bg-white/10 rounded-2xl border border-white/10">
                <span className="text-blue-300 font-bold block">35% Weight</span>
                <span className="text-white">Underwater Drone Mission</span>
              </div>
              <div className="p-3 bg-white/10 rounded-2xl border border-white/10">
                <span className="text-amber-300 font-bold block">35% Weight</span>
                <span className="text-white">Autonomous Maze Solving</span>
              </div>
              <div className="p-3 bg-white/10 rounded-2xl border border-white/10">
                <span className="text-emerald-300 font-bold block">30% Weight</span>
                <span className="text-white">Innovation Pitch Defense</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: COMPETITION CHALLENGES */}
      {activeTab === 'challenges' && (
        <div className="space-y-6">
          {config.categories.map((cat, idx) => (
            <div key={cat.id} className="p-6 md:p-8 bg-white rounded-3xl border border-slate-200 space-y-6 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div className="flex items-center space-x-3">
                  <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg",
                    cat.id === 'underwater_drone' ? "bg-blue-100 text-blue-700" :
                    cat.id === 'autonomous_maze' ? "bg-amber-100 text-amber-700" :
                    "bg-emerald-100 text-emerald-700"
                  )}>
                    {cat.id === 'underwater_drone' ? <Waves className="w-6 h-6" /> :
                     cat.id === 'autonomous_maze' ? <Compass className="w-6 h-6" /> :
                     <Lightbulb className="w-6 h-6" />}
                  </div>
                  <div>
                    <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">Category {idx + 1} • Overall Weight: {cat.weight_percentage}%</span>
                    <h3 className="text-xl font-bold text-slate-900">{cat.title}</h3>
                  </div>
                </div>

                <button
                  onClick={() => openRegistration(cat.id)}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-200 self-start md:self-auto"
                >
                  Register for this Challenge
                </button>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {cat.description}
              </p>

              {/* Skills Assessed */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Skills Assessed:</h4>
                <div className="flex flex-wrap gap-2">
                  {cat.skills_assessed.map((skill, sIdx) => (
                    <span key={sIdx} className="px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium">
                      ✓ {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Rules summary */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-700 space-y-1">
                <span className="font-bold text-slate-900">Arena & Rules Brief:</span>
                <p>{cat.rules_summary}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: AWARDS DIRECTORY */}
      {activeTab === 'awards' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {COMPETITION_AWARDS.map(award => (
              <div key={award.title} className="p-5 bg-white rounded-3xl border border-slate-200 hover:border-indigo-300 transition-all shadow-sm space-y-2">
                <div className="flex items-center space-x-3">
                  <span className="text-3xl">{award.badge}</span>
                  <h4 className="font-bold text-sm text-slate-900">{award.title}</h4>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">{award.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: LEADERBOARD */}
      {activeTab === 'leaderboard' && (
        <CompetitionLeaderboard isPublished={config.is_leaderboard_published} />
      )}

      {/* TAB 5: PUBLIC TEAMS LIST */}
      {activeTab === 'teams' && (
        <PublicTeamsList onRegisterClick={() => openRegistration()} />
      )}

      {/* 7-STEP REGISTRATION MODAL */}
      <MultiStepRegistrationModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        initialCategory={selectedInitialCategory}
        onSuccess={() => {
          fetchEventInfo();
        }}
      />
    </div>
  );
}
