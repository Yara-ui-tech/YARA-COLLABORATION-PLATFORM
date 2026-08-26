import React, { useEffect, useState, useMemo } from 'react';
import { 
  Trophy, Calendar, MapPin, Users, ArrowRight, Clock, 
  Sparkles, Search, Filter, ShieldCheck, CheckCircle2, 
  ExternalLink, Layers, Award, Waves, Compass, Lightbulb, 
  HelpCircle, ChevronRight, X, DollarSign, BookOpen, Star, AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { Competition } from '../types/competition';
import { getCompetitions } from '../services/competitionsService';
import { cn } from '../lib/utils';
import TeamRegistrationModal from '../components/competition/TeamRegistrationModal';

const CATEGORY_CHIPS = [
  { id: 'ALL', label: 'All Tournaments' },
  { id: 'flagship_robotics', label: 'Flagship Championships' },
  { id: 'underwater_rov', label: 'Underwater Drone & ROV' },
  { id: 'autonomous_vehicles', label: 'Autonomous & Micromouse' },
  { id: 'hackathon', label: 'Agro-Tech & AI Hackathons' },
  { id: 'junior_stem', label: 'Junior & Primary STEM' }
];

export default function Competitions() {
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState<'ALL' | 'upcoming' | 'active' | 'completed'>('ALL');

  // Detail Modal State
  const [selectedComp, setSelectedComp] = useState<Competition | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Quick Register Modal State
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [registeringComp, setRegisteringComp] = useState<{ id: string; title: string; category?: string } | null>(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const data = await getCompetitions();
      setCompetitions(data);
      setLoading(false);
    }
    loadData();
  }, []);

  const filteredCompetitions = useMemo(() => {
    return competitions.filter(c => {
      const matchSearch = (c.title + ' ' + (c.subtitle || '') + ' ' + (c.description || '') + ' ' + (c.location || ''))
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchCategory = selectedCategory === 'ALL' || c.category === selectedCategory;
      const matchStatus = selectedStatus === 'ALL' || c.status === selectedStatus;
      return matchSearch && matchCategory && matchStatus;
    });
  }, [competitions, searchQuery, selectedCategory, selectedStatus]);

  const featuredCompetition = useMemo(() => {
    return competitions.find(c => c.slug === 'yara-2026' || c.id === 'yara-2026-flagship' || c.is_featured) || competitions[0];
  }, [competitions]);

  const openDetails = (comp: Competition) => {
    setSelectedComp(comp);
    setIsDetailModalOpen(true);
  };

  const openRegister = (comp: Competition) => {
    setRegisteringComp({
      id: comp.id,
      title: comp.title,
      category: comp.category
    });
    setIsRegisterModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      {/* Top Header */}
      <div className="bg-slate-900 text-white relative overflow-hidden border-b border-slate-800">
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#4f46e5_1px,transparent_1px)] [background-size:24px_24px]" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20 relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider mb-6">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>National & Continental Championships</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
              Robotics & Autonomous Innovation Hub
            </h1>
            <p className="mt-4 text-base sm:text-lg text-slate-300 font-normal leading-relaxed">
              Empowering Africa's youth through high-impact robotics tournaments, aquatic ROV challenges, micromouse autonomous maze derbies, and grassroots agro-tech hackathons.
            </p>

            {/* Quick Ecosystem Links */}
            <div className="flex flex-wrap items-center gap-3 mt-8">
              <Link
                to="/competitions/yara-2026"
                className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-2xl font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 transition-all flex items-center space-x-2"
              >
                <Trophy className="w-4 h-4" />
                <span>YARA 2026 Flagship Arena</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
              <Link
                to="/competition/participant"
                className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-bold text-xs border border-slate-700 transition-all flex items-center space-x-2"
              >
                <Users className="w-4 h-4 text-indigo-400" />
                <span>Team Registration (2B+2G)</span>
              </Link>
              <Link
                to="/competition/live-results"
                className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-bold text-xs border border-slate-700 transition-all flex items-center space-x-2"
              >
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>Live Arena Screen</span>
              </Link>
              <Link
                to="/competition/judges"
                className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-bold text-xs border border-slate-700 transition-all flex items-center space-x-2"
              >
                <Award className="w-4 h-4 text-cyan-400" />
                <span>Judge Panel</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 space-y-12">
        {/* PINNACLE SPOTLIGHT: YARA 2026 ROBOTICS CHAMPIONSHIP */}
        {featuredCompetition && (
          <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 rounded-3xl p-8 sm:p-10 lg:p-12 text-white border border-indigo-500/20 shadow-2xl relative overflow-hidden">
            <div className="absolute right-0 top-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute left-1/3 bottom-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
              <div className="lg:col-span-7 space-y-6">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-black uppercase tracking-wider border border-amber-500/30 flex items-center space-x-1.5">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>Featured Flagship Championship</span>
                  </span>
                  <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-500/30">
                    Hybrid Arena & Pool
                  </span>
                  <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
                    Active Registrations
                  </span>
                </div>

                <div>
                  <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
                    {featuredCompetition.title}
                  </h2>
                  <p className="text-amber-400 font-bold text-sm sm:text-base mt-2">
                    {featuredCompetition.subtitle || 'Engineering Opportunity: Robotics & Innovation for Underserved Youth'}
                  </p>
                  <p className="text-slate-300 text-xs sm:text-sm mt-3 leading-relaxed">
                    {featuredCompetition.description}
                  </p>
                </div>

                {/* 3 Core Pillars */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div className="bg-slate-800/70 border border-slate-700/80 rounded-2xl p-3.5">
                    <div className="flex items-center space-x-2 text-cyan-400 mb-1">
                      <Waves className="w-4 h-4" />
                      <span className="text-xs font-bold uppercase">Pillar 1 (35%)</span>
                    </div>
                    <p className="text-xs text-slate-200 font-medium">Underwater Drone Buoyancy & Payload Mission</p>
                  </div>
                  <div className="bg-slate-800/70 border border-slate-700/80 rounded-2xl p-3.5">
                    <div className="flex items-center space-x-2 text-amber-400 mb-1">
                      <Compass className="w-4 h-4" />
                      <span className="text-xs font-bold uppercase">Pillar 2 (35%)</span>
                    </div>
                    <p className="text-xs text-slate-200 font-medium">Autonomous Maze & Micromouse Labyrinth</p>
                  </div>
                  <div className="bg-slate-800/70 border border-slate-700/80 rounded-2xl p-3.5">
                    <div className="flex items-center space-x-2 text-emerald-400 mb-1">
                      <Lightbulb className="w-4 h-4" />
                      <span className="text-xs font-bold uppercase">Pillar 3 (30%)</span>
                    </div>
                    <p className="text-xs text-slate-200 font-medium">Sustainable Technology & Innovation Pitch</p>
                  </div>
                </div>

                {/* Metadata & Key Badges */}
                <div className="flex flex-wrap items-center gap-6 pt-2 text-xs text-slate-300">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-amber-400" />
                    <span>October 16–18, 2026</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-indigo-400" />
                    <span>National Science Arena, Harare</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Award className="w-4 h-4 text-emerald-400" />
                    <span className="font-bold text-white">{featuredCompetition.prize_pool || '$15,000 Prize Pool'}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <ShieldCheck className="w-4 h-4 text-cyan-400" />
                    <span className="font-semibold text-cyan-300">Mandatory 2 Boys + 2 Girls Ratio</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-3 pt-4">
                  <Link
                    to="/competitions/yara-2026"
                    className="px-6 py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-2xl shadow-xl shadow-amber-500/20 transition-all flex items-center space-x-2"
                  >
                    <Trophy className="w-4 h-4" />
                    <span>Enter 2026 Flagship Arena Hub</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>

                  <Link
                    to="/competition/participant"
                    className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-2xl shadow-lg shadow-indigo-600/30 transition-all flex items-center space-x-2"
                  >
                    <Users className="w-4 h-4" />
                    <span>Register 4-Person Team</span>
                  </Link>

                  <button
                    onClick={() => openDetails(featuredCompetition)}
                    className="px-5 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs rounded-2xl border border-slate-700 transition-all"
                  >
                    View Complete Rubric & Rules
                  </button>
                </div>
              </div>

              {/* Right Side Visual & Portal Quick Access Grid */}
              <div className="lg:col-span-5 space-y-4">
                <div className="rounded-2xl overflow-hidden border-2 border-indigo-500/30 shadow-2xl relative group">
                  <img
                    src={featuredCompetition.image_url || 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=80'}
                    alt="Flagship Arena"
                    className="w-full h-64 sm:h-72 object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-mono text-amber-400 uppercase tracking-wider">Live Registrations Active</p>
                      <p className="text-sm font-black text-white">YARA Continental Arena</p>
                    </div>
                    <Link
                      to="/competition/live-results"
                      className="px-3 py-1.5 bg-emerald-500 text-slate-950 font-black text-[10px] uppercase tracking-wider rounded-xl flex items-center space-x-1"
                    >
                      <span>Live Results</span>
                      <ChevronRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>

                {/* Sub-portals Quick Grid */}
                <div className="grid grid-cols-2 gap-2.5">
                  <Link
                    to="/competition/sponsors"
                    className="p-3 bg-slate-800/80 hover:bg-slate-800 rounded-xl border border-slate-700/80 flex items-center space-x-2.5 transition-colors text-xs text-slate-300 hover:text-white"
                  >
                    <DollarSign className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="font-bold">Sponsor Tiers</span>
                  </Link>
                  <Link
                    to="/volunteer"
                    className="p-3 bg-slate-800/80 hover:bg-slate-800 rounded-xl border border-slate-700/80 flex items-center space-x-2.5 transition-colors text-xs text-slate-300 hover:text-white"
                  >
                    <Users className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span className="font-bold">Volunteer Corps</span>
                  </Link>
                  <Link
                    to="/competition/judges"
                    className="p-3 bg-slate-800/80 hover:bg-slate-800 rounded-xl border border-slate-700/80 flex items-center space-x-2.5 transition-colors text-xs text-slate-300 hover:text-white"
                  >
                    <Award className="w-4 h-4 text-amber-400 shrink-0" />
                    <span className="font-bold">Judge Scoring Portal</span>
                  </Link>
                  <Link
                    to="/competition/impact"
                    className="p-3 bg-slate-800/80 hover:bg-slate-800 rounded-xl border border-slate-700/80 flex items-center space-x-2.5 transition-colors text-xs text-slate-300 hover:text-white"
                  >
                    <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span className="font-bold">Impact & Financials</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SEARCH, CATEGORY FILTER & STATUS TABS */}
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-2xl font-black text-slate-900">National Competitions & Tournaments</h3>
              <p className="text-xs text-slate-500 mt-0.5">Explore active robotic leagues, aquatic challenges, and student hackathons across all 10 provinces.</p>
            </div>

            {/* Search Bar */}
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search competitions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs font-medium focus:outline-none focus:border-indigo-500 shadow-xs"
              />
            </div>
          </div>

          {/* Category Chips & Status Filters */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
            <div className="flex flex-wrap items-center gap-1.5">
              {CATEGORY_CHIPS.map(chip => (
                <button
                  key={chip.id}
                  onClick={() => setSelectedCategory(chip.id)}
                  className={cn(
                    "px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all",
                    selectedCategory === chip.id
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                  )}
                >
                  {chip.label}
                </button>
              ))}
            </div>

            <div className="flex items-center space-x-1.5 bg-slate-200/70 p-1 rounded-xl w-fit self-start sm:self-auto">
              {(['ALL', 'upcoming', 'active', 'completed'] as const).map(st => (
                <button
                  key={st}
                  onClick={() => setSelectedStatus(st)}
                  className={cn(
                    "px-3 py-1 rounded-lg text-xs font-bold uppercase transition-all",
                    selectedStatus === st
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-500 hover:text-slate-800"
                  )}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* COMPETITIONS DIRECTORY CARDS */}
        {loading ? (
          <div className="py-20 text-center text-slate-400">
            <Sparkles className="w-8 h-8 animate-spin mx-auto mb-3 text-indigo-500" />
            <p className="font-bold text-sm">Loading competitions roster...</p>
          </div>
        ) : filteredCompetitions.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
            <Trophy className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <h4 className="text-lg font-bold text-slate-800">No competitions found</h4>
            <p className="text-xs text-slate-500 mt-1">Try resetting the category filter or search keywords.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCompetitions.map((comp) => {
              const isFlagship = comp.slug === 'yara-2026' || comp.id === 'yara-2026-flagship';
              return (
                <motion.div
                  key={comp.id}
                  layout
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "bg-white rounded-3xl overflow-hidden border transition-all hover:shadow-xl flex flex-col justify-between",
                    isFlagship ? "border-amber-300 shadow-md ring-2 ring-amber-400/20" : "border-slate-200/80 shadow-xs"
                  )}
                >
                  {/* Card Header & Media */}
                  <div>
                    <div className="relative h-48 w-full overflow-hidden bg-slate-100 group">
                      <img
                        src={comp.image_url || 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=800&q=80'}
                        alt={comp.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />

                      {/* Top Badges */}
                      <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                        <span className={cn(
                          "px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm",
                          comp.status === 'active' ? "bg-emerald-500 text-white" :
                          comp.status === 'upcoming' ? "bg-indigo-600 text-white" :
                          "bg-slate-700 text-white"
                        )}>
                          {comp.status}
                        </span>

                        <span className="px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold capitalize">
                          {comp.format}
                        </span>
                      </div>

                      {/* Bottom Banner Info */}
                      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs">
                        <div className="flex items-center space-x-1.5 font-bold">
                          <Calendar className="w-3.5 h-3.5 text-amber-400" />
                          <span>{new Date(comp.start_date).toLocaleDateString()}</span>
                        </div>
                        <span className="font-black text-amber-400">{comp.prize_pool || '$5,000'}</span>
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-6 space-y-4">
                      <div>
                        <h4 className="text-lg font-black text-slate-900 leading-snug line-clamp-1">
                          {comp.title}
                        </h4>
                        {comp.subtitle && (
                          <p className="text-xs font-semibold text-indigo-600 mt-1 line-clamp-1">
                            {comp.subtitle}
                          </p>
                        )}
                        <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                          {comp.description}
                        </p>
                      </div>

                      {/* Location & Teams */}
                      <div className="space-y-1.5 text-xs text-slate-500 border-t border-slate-100 pt-3">
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{comp.location || 'Harare, Zimbabwe'}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{comp.registered_teams_count || 0} / {comp.max_teams || 50} Registered Teams</span>
                        </div>
                      </div>

                      {/* Tags */}
                      {comp.tags && comp.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {comp.tags.slice(0, 3).map((tag, idx) => (
                            <span key={idx} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md text-[10px] font-semibold">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card Actions */}
                  <div className="p-6 pt-0 space-y-2">
                    {isFlagship || comp.internal_route ? (
                      <Link
                        to={comp.internal_route || '/competitions/yara-2026'}
                        className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs flex items-center justify-center space-x-2 transition-colors shadow-sm"
                      >
                        <Trophy className="w-4 h-4" />
                        <span>Enter Competition Arena</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    ) : (
                      <button
                        onClick={() => openRegister(comp)}
                        className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs flex items-center justify-center space-x-2 transition-colors shadow-sm"
                      >
                        <Users className="w-4 h-4" />
                        <span>Register Team</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <button
                      onClick={() => openDetails(comp)}
                      className="w-full py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 rounded-xl font-bold text-xs transition-colors"
                    >
                      View Details & Rules
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* COMPLETE DETAILS & RULES MODAL */}
      <AnimatePresence>
        {isDetailModalOpen && selectedComp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-2xl w-full p-6 md:p-8 shadow-2xl border border-slate-200 my-8 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                    <Trophy className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900">{selectedComp.title}</h3>
                    <p className="text-xs text-slate-500 font-medium">{selectedComp.subtitle || 'Tournament Dossier & Guidelines'}</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsDetailModalOpen(false)}
                  className="p-2 text-slate-400 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6 mt-6 text-xs text-slate-700">
                {/* Visual Banner */}
                <div className="h-44 rounded-2xl overflow-hidden relative">
                  <img
                    src={selectedComp.image_url || 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=80'}
                    alt={selectedComp.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-4 right-4 text-white flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono text-amber-400 uppercase tracking-wider">Tournament Format</span>
                      <p className="text-sm font-black capitalize">{selectedComp.format} ({selectedComp.status})</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider">Total Prize Pool</span>
                      <p className="text-sm font-black text-emerald-300">{selectedComp.prize_pool || '$5,000'}</p>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-1.5">Overview & Mission</h4>
                  <p className="leading-relaxed text-slate-600 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                    {selectedComp.description}
                  </p>
                </div>

                {/* Eligibility & Rules */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100">
                    <h5 className="font-bold text-indigo-900 mb-1 flex items-center space-x-1.5">
                      <ShieldCheck className="w-4 h-4 text-indigo-600" />
                      <span>Eligibility Criteria</span>
                    </h5>
                    <p className="text-indigo-950/80 leading-relaxed">
                      {selectedComp.eligibility || 'Open to all youth robotics chapters, schools, and STEM clubs.'}
                    </p>
                  </div>

                  <div className="p-4 bg-amber-50/50 rounded-2xl border border-amber-100">
                    <h5 className="font-bold text-amber-900 mb-1 flex items-center space-x-1.5">
                      <Award className="w-4 h-4 text-amber-600" />
                      <span>Rules & Scoring</span>
                    </h5>
                    <p className="text-amber-950/80 leading-relaxed">
                      {selectedComp.rules_summary || 'Standard YARA competitive robotics and autonomous telemetry rubric.'}
                    </p>
                  </div>
                </div>

                {/* Schedule & Location Details */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-500">Tournament Dates:</span>
                    <span className="font-black text-slate-900">
                      {new Date(selectedComp.start_date).toLocaleString()} — {new Date(selectedComp.end_date).toLocaleString()}
                    </span>
                  </div>
                  {selectedComp.registration_deadline && (
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-500">Registration Deadline:</span>
                      <span className="font-black text-rose-600">
                        {new Date(selectedComp.registration_deadline).toLocaleString()}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-500">Venue / Location:</span>
                    <span className="font-black text-slate-900">{selectedComp.location || 'Harare, Zimbabwe'}</span>
                  </div>
                </div>

                {/* Action CTA inside modal */}
                <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
                  <button
                    onClick={() => setIsDetailModalOpen(false)}
                    className="px-5 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl font-bold transition-colors"
                  >
                    Close
                  </button>
                  {selectedComp.internal_route ? (
                    <Link
                      to={selectedComp.internal_route}
                      className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md shadow-indigo-200 flex items-center space-x-2 transition-colors"
                    >
                      <Trophy className="w-4 h-4" />
                      <span>Enter Arena Hub</span>
                    </Link>
                  ) : (
                    <button
                      onClick={() => {
                        setIsDetailModalOpen(false);
                        openRegister(selectedComp);
                      }}
                      className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md shadow-indigo-200 flex items-center space-x-2 transition-colors"
                    >
                      <Users className="w-4 h-4" />
                      <span>Register Team (2B+2G)</span>
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* QUICK TEAM REGISTRATION MODAL */}
      {isRegisterModalOpen && registeringComp && (
        <TeamRegistrationModal
          isOpen={isRegisterModalOpen}
          onClose={() => setIsRegisterModalOpen(false)}
          competition={registeringComp}
          onSuccess={() => {
            setIsRegisterModalOpen(false);
          }}
        />
      )}
    </div>
  );
}
