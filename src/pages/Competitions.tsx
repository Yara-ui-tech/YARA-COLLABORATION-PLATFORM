import React, { useEffect, useState, useMemo } from 'react';
import { 
  Trophy, Calendar, MapPin, Users, ArrowRight, Clock, 
  Loader2, Zap, Search, Filter, ShieldCheck, CheckCircle2, 
  ExternalLink, Layers, Award, Waves, Compass, Lightbulb, 
  HelpCircle, ChevronRight, X, DollarSign, BookOpen, Star, AlertCircle, Lock, Trash2,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { Competition } from '../types/competition';
import { getCompetitions, deleteCompetition } from '../services/competitionsService';
import { cn } from '../lib/utils';
import TeamRegistrationModal from '../components/competition/TeamRegistrationModal';
import { useAuth } from '../components/AuthContext';
import Breadcrumbs from '../components/Breadcrumbs';

const CATEGORY_CHIPS = [
  { id: 'ALL', label: 'All Tournaments' },
  { id: 'flagship_robotics', label: 'Flagship Championships' },
  { id: 'underwater_rov', label: 'Underwater Drone & ROV' },
  { id: 'autonomous_vehicles', label: 'Autonomous & Micromouse' },
  { id: 'hackathon', label: 'Agro-Tech & AI Hackathons' },
  { id: 'junior_stem', label: 'Junior & Primary STEM' }
];

export default function Competitions() {
  const { profile } = useAuth();
  const isAdmin = profile?.role === 'admin' || profile?.email === 'manongwasimbarashe394@gmail.com' || profile?.email === 'goyaracorp@gmail.com';
  const isTrialExpired = Boolean(
    profile &&
    !profile.registration_paid &&
    profile.trial_ends_at &&
    new Date(profile.trial_ends_at) < new Date() &&
    profile.role !== 'admin'
  );

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

  // Trial Lock Modal State
  const [trialLockModalOpen, setTrialLockModalOpen] = useState(false);
  const [lockedCompName, setLockedCompName] = useState('');

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

  // Priority to active/upcoming tournaments so expired events are never spotlit
  const featuredCompetition = useMemo(() => {
    return (
      competitions.find(c => c.status !== 'completed' && c.is_featured) ||
      competitions.find(c => c.status !== 'completed') ||
      competitions[0]
    );
  }, [competitions]);

  const openDetails = (comp: Competition) => {
    setSelectedComp(comp);
    setIsDetailModalOpen(true);
  };

  const openRegister = (comp: Competition) => {
    if (isTrialExpired) {
      setLockedCompName(comp.title);
      setTrialLockModalOpen(true);
      return;
    }
    setRegisteringComp({
      id: comp.id,
      title: comp.title,
      category: comp.category
    });
    setIsRegisterModalOpen(true);
  };

  const handleDeleteCompetition = async (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to remove competition "${title}" from the site? This will permanently delete it.`)) {
      setLoading(true);
      await deleteCompetition(id);
      const updated = await getCompetitions();
      setCompetitions(updated);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-24">
      {/* Top Header Hero */}
      <div className="relative overflow-hidden border-b border-slate-800/80 bg-gradient-to-b from-slate-950 via-indigo-950/20 to-slate-950">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-gradient-to-tr from-blue-600/20 via-cyan-500/15 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:28px_28px]" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-14 relative z-10 space-y-6">
          <Breadcrumbs
            items={[
              { label: 'Home', href: '/' },
              { label: 'Competitions & Arena' }
            ]}
          />

          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-black uppercase tracking-widest shadow-xs">
              <Trophy className="w-4 h-4 text-cyan-400" />
              <span>National &amp; Continental Championship Hub</span>
            </div>
            
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1]">
              Robotics &amp; Autonomous <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-300">
                Innovation Arena
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-300 font-normal leading-relaxed max-w-2xl">
              Africa's premier platform for young builders: aquatic ROV exploration, micromouse autonomous maze navigation, and high-impact rural agro-tech hackathons.
            </p>

            {/* Quick Ecosystem Navigation Badges */}
            <div className="flex flex-wrap items-center gap-2.5 pt-2">
              <Link
                to="/competition/participant"
                className="px-4 py-2 bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white rounded-xl font-bold text-xs border border-slate-800 hover:border-cyan-500/40 transition-all flex items-center space-x-2"
              >
                <Users className="w-4 h-4 text-cyan-400" />
                <span>Team Portal (2B+2G)</span>
              </Link>
              <Link
                to="/competition/live-results"
                className="px-4 py-2 bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white rounded-xl font-bold text-xs border border-slate-800 hover:border-emerald-500/40 transition-all flex items-center space-x-2"
              >
                <Zap className="w-4 h-4 text-emerald-400" />
                <span>Live Arena Screen</span>
              </Link>
              <Link
                to="/competition/judges"
                className="px-4 py-2 bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white rounded-xl font-bold text-xs border border-slate-800 hover:border-amber-500/40 transition-all flex items-center space-x-2"
              >
                <Award className="w-4 h-4 text-amber-400" />
                <span>Judge Scoring Portal</span>
              </Link>
              <Link
                to="/competition/sponsors"
                className="px-4 py-2 bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white rounded-xl font-bold text-xs border border-slate-800 hover:border-pink-500/40 transition-all flex items-center space-x-2"
              >
                <DollarSign className="w-4 h-4 text-pink-400" />
                <span>Sponsors &amp; Grants</span>
              </Link>
              <Link
                to="/competition/impact"
                className="px-4 py-2 bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white rounded-xl font-bold text-xs border border-slate-800 hover:border-indigo-500/40 transition-all flex items-center space-x-2"
              >
                <Layers className="w-4 h-4 text-indigo-400" />
                <span>Impact &amp; Ledger</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 space-y-12">
        {/* PINNACLE SPOTLIGHT: ACTIVE FEATURED TOURNAMENT */}
        {featuredCompetition && (
          <div className="bg-gradient-to-br from-slate-950 via-indigo-950/70 to-slate-900 rounded-3xl p-6 sm:p-10 lg:p-12 text-white border border-indigo-500/30 shadow-2xl relative overflow-hidden">
            <div className="absolute right-0 top-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute left-1/3 bottom-0 w-80 h-80 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
              <div className="lg:col-span-7 space-y-5">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-black uppercase tracking-wider border border-cyan-500/40 flex items-center space-x-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Active Spotlight Championship</span>
                  </span>
                  
                  <span className={cn(
                    "px-3 py-1 rounded-full text-xs font-bold border",
                    featuredCompetition.status === 'upcoming' 
                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40" 
                      : featuredCompetition.status === 'active' 
                      ? "bg-amber-500/20 text-amber-300 border-amber-500/40" 
                      : "bg-slate-800 text-slate-300 border-slate-700"
                  )}>
                    {featuredCompetition.status === 'upcoming' ? '● Registrations Open' : 
                     featuredCompetition.status === 'active' ? '⚡ Live Arena In Progress' : 'Concluded'}
                  </span>

                  <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-500/30 capitalize">
                    {featuredCompetition.format} Arena
                  </span>
                </div>

                <div>
                  <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white leading-tight">
                    {featuredCompetition.title}
                  </h2>
                  {featuredCompetition.subtitle && (
                    <p className="text-cyan-300 font-bold text-sm sm:text-base mt-2">
                      {featuredCompetition.subtitle}
                    </p>
                  )}
                  <p className="text-slate-300 text-xs sm:text-sm mt-3 leading-relaxed">
                    {featuredCompetition.description}
                  </p>
                </div>

                {/* Tournament Metadata Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3.5">
                    <div className="flex items-center space-x-2 text-cyan-400 mb-1">
                      <Calendar className="w-4 h-4" />
                      <span className="text-[11px] font-bold uppercase tracking-wider">Tournament Dates</span>
                    </div>
                    <p className="text-xs text-slate-100 font-bold">
                      {new Date(featuredCompetition.start_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>

                  <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3.5">
                    <div className="flex items-center space-x-2 text-amber-400 mb-1">
                      <MapPin className="w-4 h-4" />
                      <span className="text-[11px] font-bold uppercase tracking-wider">Venue</span>
                    </div>
                    <p className="text-xs text-slate-100 font-bold truncate">
                      {featuredCompetition.location || 'Harare Arena'}
                    </p>
                  </div>

                  <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3.5">
                    <div className="flex items-center space-x-2 text-emerald-400 mb-1">
                      <Award className="w-4 h-4" />
                      <span className="text-[11px] font-bold uppercase tracking-wider">Prize &amp; Grants</span>
                    </div>
                    <p className="text-xs text-emerald-300 font-black">
                      {featuredCompetition.prize_pool || '$6,500 + Toolkits'}
                    </p>
                  </div>
                </div>

                {/* Key Parity Indicator */}
                <div className="flex items-center space-x-2 text-xs text-slate-400 pt-1">
                  <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>Mandatory YARA Equality Standard: <strong className="text-white">2 Boys + 2 Girls</strong> minimum per registered team</span>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-3 pt-3">
                  {featuredCompetition.status !== 'completed' ? (
                    <button
                      onClick={() => openRegister(featuredCompetition)}
                      className="px-6 py-3.5 bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 hover:from-cyan-300 hover:to-indigo-500 text-slate-950 font-black text-xs uppercase tracking-wider rounded-2xl shadow-xl shadow-cyan-500/20 transition-all flex items-center space-x-2 cursor-pointer hover:scale-105 active:scale-95"
                    >
                      <Users className="w-4 h-4 text-slate-950" />
                      <span>Register 4-Person Team</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <Link
                      to="/competition/live-results"
                      className="px-6 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-2xl shadow-xl shadow-emerald-500/20 transition-all flex items-center space-x-2"
                    >
                      <Trophy className="w-4 h-4" />
                      <span>View Certified Results &amp; Winners</span>
                    </Link>
                  )}

                  <button
                    onClick={() => openDetails(featuredCompetition)}
                    className="px-5 py-3.5 bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white font-bold text-xs rounded-2xl border border-slate-800 hover:border-slate-700 transition-all cursor-pointer"
                  >
                    View Complete Rules &amp; Rubric
                  </button>

                  {isAdmin && (
                    <button
                      onClick={() => handleDeleteCompetition(featuredCompetition.id, featuredCompetition.title)}
                      className="px-4 py-3.5 bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 rounded-2xl font-bold text-xs flex items-center space-x-1.5 transition-all cursor-pointer"
                      title="Delete competition"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Right Side Visual Banner & Quick Links */}
              <div className="lg:col-span-5 space-y-4">
                <div className="rounded-3xl overflow-hidden border border-indigo-500/30 shadow-2xl relative group bg-slate-950">
                  <img
                    src={featuredCompetition.image_url || 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1200&q=80'}
                    alt="Featured Arena"
                    className="w-full h-64 sm:h-72 object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider">Tournament Arena</p>
                      <p className="text-sm font-black text-white">{featuredCompetition.title}</p>
                    </div>
                    <Link
                      to="/competition/live-results"
                      className="px-3 py-1.5 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-black text-[10px] uppercase tracking-wider rounded-xl flex items-center space-x-1 transition shadow-md"
                    >
                      <span>Live Board</span>
                      <ChevronRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>

                {/* Sub-portals Quick Grid */}
                <div className="grid grid-cols-2 gap-2.5">
                  <Link
                    to="/competition/sponsors"
                    className="p-3 bg-slate-900/90 hover:bg-slate-800/90 rounded-2xl border border-slate-800 hover:border-slate-700 flex items-center space-x-2.5 transition text-xs text-slate-300 hover:text-white"
                  >
                    <DollarSign className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="font-bold">Sponsor Tiers</span>
                  </Link>
                  <Link
                    to="/volunteer"
                    className="p-3 bg-slate-900/90 hover:bg-slate-800/90 rounded-2xl border border-slate-800 hover:border-slate-700 flex items-center space-x-2.5 transition text-xs text-slate-300 hover:text-white"
                  >
                    <Users className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span className="font-bold">Volunteer Corps</span>
                  </Link>
                  <Link
                    to="/competition/judges"
                    className="p-3 bg-slate-900/90 hover:bg-slate-800/90 rounded-2xl border border-slate-800 hover:border-slate-700 flex items-center space-x-2.5 transition text-xs text-slate-300 hover:text-white"
                  >
                    <Award className="w-4 h-4 text-amber-400 shrink-0" />
                    <span className="font-bold">Judge Scoring</span>
                  </Link>
                  <Link
                    to="/competition/impact"
                    className="p-3 bg-slate-900/90 hover:bg-slate-800/90 rounded-2xl border border-slate-800 hover:border-slate-700 flex items-center space-x-2.5 transition text-xs text-slate-300 hover:text-white"
                  >
                    <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span className="font-bold">Impact Ledger</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SEARCH, CATEGORY FILTER & STATUS TABS */}
        <div className="space-y-4 pt-4 border-t border-slate-800/80">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                <Trophy className="w-5 h-5 text-cyan-400" />
                <span>Tournament Directory &amp; Arenas</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Explore active robotic leagues, aquatic challenges, and student hackathons across all 10 provinces.</p>
            </div>

            {/* Search Bar */}
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search tournaments, arenas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-cyan-500 transition"
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
                    "px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer",
                    selectedCategory === chip.id
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-900/30"
                      : "bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800"
                  )}
                >
                  {chip.label}
                </button>
              ))}
            </div>

            <div className="flex items-center space-x-1.5 bg-slate-900/90 p-1 rounded-xl border border-slate-800 w-fit self-start sm:self-auto">
              {(['ALL', 'upcoming', 'active', 'completed'] as const).map(st => (
                <button
                  key={st}
                  onClick={() => setSelectedStatus(st)}
                  className={cn(
                    "px-3 py-1 rounded-lg text-xs font-bold uppercase transition-all cursor-pointer",
                    selectedStatus === st
                      ? "bg-cyan-500 text-slate-950 font-black shadow-xs"
                      : "text-slate-400 hover:text-white"
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
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-cyan-400" />
            <p className="font-bold text-sm">Loading arena tournaments...</p>
          </div>
        ) : filteredCompetitions.length === 0 ? (
          <div className="bg-slate-900/80 rounded-3xl p-12 text-center border border-slate-800">
            <Trophy className="w-12 h-12 mx-auto mb-3 text-slate-600" />
            <h4 className="text-lg font-bold text-white">No tournaments found</h4>
            <p className="text-xs text-slate-400 mt-1">Try resetting the category filter or searching different keywords.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCompetitions.map((comp) => {
              const isCompleted = comp.status === 'completed';
              return (
                <motion.div
                  key={comp.id}
                  layout
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "bg-slate-900/90 rounded-3xl overflow-hidden border transition-all duration-300 hover:shadow-2xl flex flex-col justify-between group",
                    isCompleted 
                      ? "border-slate-800/80 opacity-80 hover:opacity-100" 
                      : "border-slate-800 hover:border-cyan-500/50 hover:shadow-cyan-500/10"
                  )}
                >
                  {/* Card Media */}
                  <div>
                    <div className="relative h-48 w-full overflow-hidden bg-slate-950">
                      <img
                        src={comp.image_url || 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=800&q=80'}
                        alt={comp.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

                      {/* Top Badges */}
                      <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                        <span className={cn(
                          "px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm",
                          comp.status === 'active' ? "bg-amber-400 text-slate-950" :
                          comp.status === 'upcoming' ? "bg-emerald-500 text-slate-950" :
                          "bg-slate-800 text-slate-300 border border-slate-700"
                        )}>
                          {comp.status === 'completed' ? 'Concluded' : comp.status}
                        </span>

                        <span className="px-2.5 py-1 rounded-full bg-slate-950/80 backdrop-blur-xs text-white text-[10px] font-bold capitalize border border-slate-800">
                          {comp.format} Arena
                        </span>
                      </div>

                      {/* Bottom Banner Info */}
                      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs">
                        <div className="flex items-center space-x-1.5 font-bold text-slate-200">
                          <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                          <span>{new Date(comp.start_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        </div>
                        <span className="font-black text-cyan-300">{comp.prize_pool || '$5,000'}</span>
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-6 space-y-4">
                      <div>
                        <h4 className="text-base sm:text-lg font-black text-white leading-snug line-clamp-1 group-hover:text-cyan-300 transition-colors">
                          {comp.title}
                        </h4>
                        {comp.subtitle && (
                          <p className="text-xs font-semibold text-cyan-400/90 mt-1 line-clamp-1">
                            {comp.subtitle}
                          </p>
                        )}
                        <p className="text-xs text-slate-300 mt-2 line-clamp-2 leading-relaxed">
                          {comp.description}
                        </p>
                      </div>

                      {/* Location & Teams */}
                      <div className="space-y-1.5 text-xs text-slate-400 border-t border-slate-800 pt-3">
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                          <span className="truncate">{comp.location || 'Harare Arena'}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Users className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                          <span>{comp.registered_teams_count || 0} / {comp.max_teams || 50} Registered Teams</span>
                        </div>
                      </div>

                      {/* Tags */}
                      {comp.tags && comp.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {comp.tags.slice(0, 3).map((tag, idx) => (
                            <span key={idx} className="px-2 py-0.5 bg-slate-950 text-slate-400 border border-slate-800 rounded-md text-[10px] font-semibold">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card Actions */}
                  <div className="p-6 pt-0 space-y-2">
                    {!isCompleted ? (
                      <button
                        onClick={() => openRegister(comp)}
                        className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center space-x-2 transition-all shadow-md shadow-blue-900/30 cursor-pointer"
                      >
                        <Users className="w-4 h-4" />
                        <span>Register Team (2B+2G)</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <Link
                        to="/competition/live-results"
                        className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl font-bold text-xs flex items-center justify-center space-x-2 transition-all border border-slate-700"
                      >
                        <Trophy className="w-4 h-4 text-amber-400" />
                        <span>View Results &amp; Archives</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    )}

                    <button
                      onClick={() => openDetails(comp)}
                      className="w-full py-2 bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl font-bold text-xs transition-colors border border-slate-800 cursor-pointer"
                    >
                      View Dossier &amp; Rubric
                    </button>

                    {isAdmin && (
                      <button
                        onClick={() => handleDeleteCompetition(comp.id, comp.title)}
                        className="w-full py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-300 rounded-xl font-bold text-xs transition-colors flex items-center justify-center space-x-1.5 border border-red-500/20 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-red-400" />
                        <span>Delete Tournament</span>
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* COMPLETE DETAILS & RULES MODAL (Modern Dark Glassmorphism) */}
      <AnimatePresence>
        {isDetailModalOpen && selectedComp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 md:p-8 shadow-2xl my-8 max-h-[90vh] overflow-y-auto text-white"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center">
                    <Trophy className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white">{selectedComp.title}</h3>
                    <p className="text-xs text-slate-400 font-medium">{selectedComp.subtitle || 'Tournament Dossier & Guidelines'}</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsDetailModalOpen(false)}
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6 mt-6 text-xs text-slate-300">
                {/* Visual Banner */}
                <div className="h-44 rounded-2xl overflow-hidden relative border border-slate-800">
                  <img
                    src={selectedComp.image_url || 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=80'}
                    alt={selectedComp.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                  <div className="absolute bottom-3 left-4 right-4 text-white flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider">Tournament Format</span>
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
                  <h4 className="font-bold text-white uppercase tracking-wider text-[11px] mb-1.5">Overview &amp; Mission</h4>
                  <p className="leading-relaxed text-slate-300 bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
                    {selectedComp.description}
                  </p>
                </div>

                {/* Eligibility & Rules */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-indigo-950/40 rounded-2xl border border-indigo-500/30">
                    <h5 className="font-bold text-indigo-300 mb-1 flex items-center space-x-1.5">
                      <ShieldCheck className="w-4 h-4 text-indigo-400" />
                      <span>Eligibility Criteria</span>
                    </h5>
                    <p className="text-slate-300 leading-relaxed">
                      {selectedComp.eligibility || 'Open to all youth robotics chapters, schools, and STEM clubs.'}
                    </p>
                  </div>

                  <div className="p-4 bg-amber-950/40 rounded-2xl border border-amber-500/30">
                    <h5 className="font-bold text-amber-300 mb-1 flex items-center space-x-1.5">
                      <Award className="w-4 h-4 text-amber-400" />
                      <span>Rules &amp; Scoring</span>
                    </h5>
                    <p className="text-slate-300 leading-relaxed">
                      {selectedComp.rules_summary || 'Standard YARA competitive robotics and autonomous telemetry rubric.'}
                    </p>
                  </div>
                </div>

                {/* Schedule & Location Details */}
                <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-400">Tournament Dates:</span>
                    <span className="font-black text-white">
                      {new Date(selectedComp.start_date).toLocaleString()} — {new Date(selectedComp.end_date).toLocaleString()}
                    </span>
                  </div>
                  {selectedComp.registration_deadline && (
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-400">Registration Deadline:</span>
                      <span className="font-black text-amber-400">
                        {new Date(selectedComp.registration_deadline).toLocaleString()}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-400">Venue / Location:</span>
                    <span className="font-black text-cyan-300">{selectedComp.location || 'Harare Arena'}</span>
                  </div>
                </div>

                {/* Action CTA inside modal */}
                <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
                  <button
                    onClick={() => setIsDetailModalOpen(false)}
                    className="px-5 py-2.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl font-bold transition cursor-pointer"
                  >
                    Close
                  </button>
                  {selectedComp.status !== 'completed' ? (
                    <button
                      onClick={() => {
                        setIsDetailModalOpen(false);
                        openRegister(selectedComp);
                      }}
                      className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-black uppercase tracking-wider shadow-lg shadow-blue-900/30 flex items-center space-x-2 transition cursor-pointer"
                    >
                      <Users className="w-4 h-4" />
                      <span>Register Team (2B+2G)</span>
                    </button>
                  ) : (
                    <Link
                      to="/competition/live-results"
                      className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl font-black uppercase tracking-wider shadow-md flex items-center space-x-2 transition"
                    >
                      <Trophy className="w-4 h-4" />
                      <span>View Results</span>
                    </Link>
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

      {/* Trial Expired Team Registration Lock Modal */}
      {trialLockModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 sm:p-8 text-center space-y-5 shadow-2xl relative text-white">
            <button 
              onClick={() => setTrialLockModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-800 transition cursor-pointer"
            >
              ✕
            </button>

            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto shadow-lg shadow-amber-500/10">
              <Lock className="w-8 h-8" />
            </div>

            <div>
              <span className="px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full text-[11px] font-black uppercase tracking-wider">
                Active Membership Required
              </span>
              <h3 className="text-xl font-bold text-white mt-2">
                Tournament Registration Locked
              </h3>
              {lockedCompName && (
                <p className="text-xs text-cyan-400 font-semibold mt-1">"{lockedCompName}"</p>
              )}
            </div>

            <p className="text-xs text-slate-300 leading-relaxed text-left bg-slate-950 p-4 rounded-2xl border border-slate-800">
              Your 14-day free trial has expired. You are free to browse all tournament guidelines, mission challenge rules, public scoring rubrics, and updates! However, official team registration (2 Boys + 2 Girls) and arena qualifiers require an active YARA membership ($15 USD once-off).
            </p>

            <div className="space-y-2.5 pt-2">
              <Link
                to="/learner-dashboard"
                onClick={() => setTrialLockModalOpen(false)}
                className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-blue-900/30 transition"
              >
                <span>Activate Membership ($15 USD)</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="https://wa.me/263772000000?text=Hello%20YARA%20Admin,%20my%20free%20trial%20has%20expired%20and%20I%20would%20like%20to%20activate%20my%20membership%20subscription%20to%20register%20my%20robotics%20team."
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs flex items-center justify-center gap-2 border border-slate-700 transition"
              >
                <span>Contact Admin on WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
