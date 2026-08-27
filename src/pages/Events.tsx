import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Users, Trophy, ArrowRight, Clock, Zap, Loader2, Sparkles, Cpu, Code, Brain, ShieldCheck, Video, DollarSign, School } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import PlaceholderImage from '../components/PlaceholderImage';
import { supabase } from '../lib/supabase';
import { ASSETS } from '../constants/assets';
import { INITIAL_COMPETITIONS, INITIAL_EVENTS } from '../constants/eventsData';
import { VirtualCompetition } from '../types/competition';
import { INITIAL_VIRTUAL_COMPETITIONS } from '../constants/curriculum';
import VirtualCompetitionCard from '../components/competition/VirtualCompetitionCard';
import VirtualCompetitionModal from '../components/competition/VirtualCompetitionModal';
import TeamRegistrationModal from '../components/competition/TeamRegistrationModal';
import PublicTeamsList from '../components/competition/PublicTeamsList';

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  image_url: string;
  registration_link: string;
  is_upcoming: boolean;
  category: string;
}

interface Competition {
  id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  registration_link: string;
  image_url: string;
  status: string;
}

export default function Events() {
  const [events, setEvents] = useState<Event[]>(INITIAL_EVENTS as Event[]);
  const [competitions, setCompetitions] = useState<Competition[]>(INITIAL_COMPETITIONS as Competition[]);
  const [virtualCompetitions, setVirtualCompetitions] = useState<VirtualCompetition[]>(INITIAL_VIRTUAL_COMPETITIONS as VirtualCompetition[]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'all' | 'virtual' | 'physical'>('all');

  // Modal for Virtual Challenge
  const [selectedVirtualComp, setSelectedVirtualComp] = useState<VirtualCompetition | null>(null);
  const [isVirtualModalOpen, setIsVirtualModalOpen] = useState(false);

  // Modal for Team Registration (Mandatory 4+ members, 2 boys + 2 girls)
  const [selectedTeamComp, setSelectedTeamComp] = useState<{ id: string; title: string; category?: string } | null>(null);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      const { data: eventsData } = await supabase
        .from('events')
        .select('*')
        .eq('is_upcoming', true)
        .order('date', { ascending: true });

      const { data: compsData } = await supabase
        .from('competitions')
        .select('*')
        .order('start_date', { ascending: true });

      const { data: vCompsData } = await supabase
        .from('virtual_competitions')
        .select('*')
        .order('created_at', { ascending: false });

      let deletedCompIds: string[] = [];
      try {
        const raw = localStorage.getItem('yaria_deleted_competitions');
        if (raw) deletedCompIds = JSON.parse(raw);
      } catch {
        deletedCompIds = [];
      }

      if (eventsData && eventsData.length > 0) {
        setEvents(eventsData);
      } else {
        setEvents(INITIAL_EVENTS as Event[]);
      }

      if (compsData && compsData.length > 0) {
        setCompetitions(compsData.filter(c => !deletedCompIds.includes(c.id)));
      } else {
        const filtered = (INITIAL_COMPETITIONS as Competition[]).filter(c => !deletedCompIds.includes(c.id));
        setCompetitions(filtered);
      }
      
      if (vCompsData && vCompsData.length > 0) {
        setVirtualCompetitions(vCompsData);
      } else {
        setVirtualCompetitions(INITIAL_VIRTUAL_COMPETITIONS as VirtualCompetition[]);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      let deletedCompIds: string[] = [];
      try {
        const raw = localStorage.getItem('yaria_deleted_competitions');
        if (raw) deletedCompIds = JSON.parse(raw);
      } catch {
        deletedCompIds = [];
      }
      setEvents(INITIAL_EVENTS as Event[]);
      setCompetitions((INITIAL_COMPETITIONS as Competition[]).filter(c => !deletedCompIds.includes(c.id)));
    } finally {
      setLoading(false);
    }
  }

  const handleOpenVirtualChallenge = (vComp: VirtualCompetition) => {
    setSelectedVirtualComp(vComp);
    setIsVirtualModalOpen(true);
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-indigo-600 font-black text-xs uppercase tracking-widest">
            <Trophy className="w-4 h-4" />
            <span>Competitive Arena & Hackathons</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
            Events & Competitions
          </h2>
          <p className="text-slate-500 font-medium text-sm max-w-xl">
            Compete in virtual simulation sprints, PCB design challenges, hardware showcases, and robotics hackathons.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center space-x-2 bg-white p-1.5 rounded-2xl border border-slate-100 shadow-sm shrink-0">
          {[
            { id: 'all', label: 'All Arena Events' },
            { id: 'virtual', label: 'Virtual Challenges', badge: virtualCompetitions.length },
            { id: 'physical', label: 'Physical Events', badge: events.length + competitions.length }
          ].map(filter => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                activeFilter === filter.id
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <span>{filter.label}</span>
              {filter.badge !== undefined && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  activeFilter === filter.id ? 'bg-indigo-700 text-white' : 'bg-slate-100 text-slate-500'
                }`}>
                  {filter.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </header>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
          <p className="text-slate-500 font-bold text-sm">Loading arena events...</p>
        </div>
      ) : (
        <div className="space-y-12">
          {/* FEATURED EVENT: AI FOR EDUCATORS ONLINE BOOTCAMP */}
          <div className="p-8 md:p-10 rounded-3xl bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 border-2 border-indigo-500/30 text-white shadow-2xl relative overflow-hidden">
            <div className="absolute -right-10 -bottom-10 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
            
            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
              <div className="space-y-4 max-w-2xl">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 bg-amber-400 text-slate-950 rounded-full text-[10px] font-black uppercase tracking-wider">
                    ★ Featured YARA Event
                  </span>
                  <span className="px-3 py-1 bg-white/10 text-slate-200 border border-white/15 rounded-full text-[10px] font-black uppercase tracking-wider">
                    Live Online Training
                  </span>
                  <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-[10px] font-black uppercase tracking-wider">
                    31 Aug – 4 Sep 2026
                  </span>
                </div>

                <div>
                  <p className="text-xs font-bold text-indigo-300 uppercase tracking-widest">
                    Young Africans Robotics Association (YARA) • Empower. Educate. Innovate.
                  </p>
                  <h3 className="text-2xl sm:text-4xl font-black tracking-tight text-white mt-1">
                    AI for Educators – Online Bootcamp
                  </h3>
                </div>

                <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                  A high-impact 5-day professional development programme equipping teachers and lecturers with practical AI tools to automate lesson plans, design differentiated assessments, generate visual aids, and master robotics code pedagogy.
                </p>

                <div className="flex flex-wrap items-center gap-4 text-xs">
                  <div className="flex items-center space-x-1.5 text-emerald-400 font-bold">
                    <DollarSign className="w-4 h-4" />
                    <span>Fee: US$10 Once-off</span>
                  </div>
                  <div className="flex items-center space-x-1.5 text-purple-300 font-medium">
                    <Sparkles className="w-4 h-4" />
                    <span>Continuous Support: US$15 per term</span>
                  </div>
                  <div className="flex items-center space-x-1.5 text-amber-300 font-medium">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Strict Access Verification Enforced</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
                <Link
                  to="/events/ai-for-educators"
                  className="px-8 py-4 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 hover:from-amber-300 hover:to-amber-200 text-slate-950 font-black rounded-2xl text-xs uppercase tracking-wider shadow-lg shadow-amber-400/20 flex items-center justify-center space-x-2 transition-all transform hover:scale-[1.02]"
                >
                  <Brain className="w-4 h-4" />
                  <span>View Event & Register</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/events/ai-for-educators"
                  className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-2xl text-xs border border-white/20 flex items-center justify-center space-x-2 transition-all text-center"
                >
                  <Video className="w-4 h-4" />
                  <span>Enter Live Event Room</span>
                </Link>
              </div>
            </div>
          </div>

          {/* SECTION 1: VIRTUAL ONLINE COMPETITIONS */}
          {(activeFilter === 'all' || activeFilter === 'virtual') && (
            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                      Virtual Online Challenges & Sprints
                    </h3>
                    <p className="text-xs text-slate-400 font-medium">
                      Simulate, wire, and code in Wokwi, Tinkercad, or EasyEDA within timed windows
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {virtualCompetitions.map(vComp => (
                  <VirtualCompetitionCard
                    key={vComp.id}
                    competition={vComp}
                    onOpen={handleOpenVirtualChallenge}
                  />
                ))}
              </div>
            </section>
          )}

          {/* SECTION 2: PHYSICAL COMPETITIONS & EVENTS */}
          {(activeFilter === 'all' || activeFilter === 'physical') && (
            <section className="space-y-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                    On-Site Events & Community Hackathons
                  </h3>
                  <p className="text-xs text-slate-400 font-medium">
                    Hands-on build days, showcase pitches, and regional robotics exhibitions
                  </p>
                </div>
              </div>

              {events.length === 0 && competitions.length === 0 ? (
                <div className="bg-white rounded-[2.5rem] p-12 text-center border border-slate-100">
                  <Calendar className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-slate-900 mb-2">No Upcoming Physical Events</h3>
                  <p className="text-slate-500 text-sm">Check back later for new workshops and exhibitions!</p>
                </div>
              ) : (
                <div className="grid gap-8">
                  {/* Competitions */}
                  {competitions.map((comp, index) => (
                    <motion.div
                      key={comp.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-xl shadow-indigo-50/50 group"
                    >
                      <div className="relative h-64 md:h-80 overflow-hidden">
                        {comp.image_url ? (
                          <img
                            src={comp.image_url}
                            alt={comp.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = ASSETS.EVENT_PLACEHOLDER;
                            }}
                          />
                        ) : (
                          <PlaceholderImage type="project" text={comp.title} />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent" />
                        <div className="absolute bottom-8 left-8 right-8">
                          <div className="flex items-center space-x-3 mb-2">
                            <span className="px-3 py-1 bg-amber-500 text-white rounded-full text-xs font-bold uppercase tracking-wider">
                              Competition
                            </span>
                            <span className="px-3 py-1 bg-white/20 backdrop-blur-md text-white rounded-full text-xs font-bold uppercase tracking-wider">
                              {comp.status}
                            </span>
                          </div>
                          <h3 className="text-2xl md:text-3xl font-bold text-white tracking-tight">{comp.title}</h3>
                        </div>
                      </div>

                      <div className="p-8 md:p-12">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                              <Calendar className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Duration</p>
                              <p className="text-sm font-bold text-slate-700">
                                {new Date(comp.start_date).toLocaleDateString()} - {new Date(comp.end_date).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                              <Trophy className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Status</p>
                              <p className="text-sm font-bold text-slate-700 capitalize">{comp.status}</p>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-6">
                          <p className="text-slate-600 font-medium leading-relaxed text-sm md:text-base">
                            {comp.description}
                          </p>

                          <div className="pt-4 flex flex-wrap items-center gap-3">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedTeamComp({
                                  id: comp.id,
                                  title: comp.title,
                                  category: 'Robotics & STEM Arena'
                                });
                                setIsTeamModalOpen(true);
                              }}
                              className="bg-indigo-600 text-white px-6 py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all flex items-center space-x-2"
                            >
                              <Users className="w-4 h-4" />
                              <span>Register Team (2 Boys + 2 Girls)</span>
                            </button>

                            {comp.registration_link && (
                              <a 
                                href={comp.registration_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-slate-100 text-slate-700 hover:bg-slate-200 px-5 py-3.5 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all flex items-center space-x-1.5"
                              >
                                <span>Official Guide</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}

                  {/* Events */}
                  {events.map((event, index) => (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-xl shadow-indigo-50/50 group"
                    >
                      <div className="relative h-64 md:h-80 overflow-hidden">
                        {event.image_url ? (
                          <img
                            src={event.image_url}
                            alt={event.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = ASSETS.EVENT_PLACEHOLDER;
                            }}
                          />
                        ) : (
                          <PlaceholderImage type="project" text={event.title} />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent" />
                        <div className="absolute bottom-8 left-8 right-8">
                          <div className="flex items-center space-x-3 mb-2">
                            <span className="px-3 py-1 bg-indigo-600 text-white rounded-full text-xs font-bold uppercase tracking-wider">
                              {event.category}
                            </span>
                            <span className="px-3 py-1 bg-white/20 backdrop-blur-md text-white rounded-full text-xs font-bold uppercase tracking-wider">
                              {new Date(event.date).toLocaleDateString()}
                            </span>
                          </div>
                          <h3 className="text-2xl md:text-3xl font-bold text-white tracking-tight">{event.title}</h3>
                        </div>
                      </div>

                      <div className="p-8 md:p-12">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                              <MapPin className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Location</p>
                              <p className="text-sm font-bold text-slate-700">{event.location}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                              <Calendar className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Date & Time</p>
                              <p className="text-sm font-bold text-slate-700">
                                {new Date(event.date).toLocaleDateString(undefined, { 
                                  weekday: 'long', 
                                  year: 'numeric', 
                                  month: 'long', 
                                  day: 'numeric' 
                                })}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-6">
                          <p className="text-slate-600 font-medium leading-relaxed text-sm md:text-base">
                            {event.description}
                          </p>

                          {event.registration_link && (
                            <div className="pt-4 flex flex-wrap gap-4">
                              <a 
                                href={event.registration_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-indigo-600 text-white px-8 py-3.5 rounded-2xl font-bold text-xs uppercase tracking-wider shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all flex items-center space-x-2"
                              >
                                <span>Register For Event</span>
                                <ArrowRight className="w-4 h-4" />
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* Public Teams Registry Section */}
          <section className="space-y-6 pt-6">
            <PublicTeamsList />
          </section>
        </div>
      )}

      {/* Virtual Challenge Modal */}
      <VirtualCompetitionModal
        competition={selectedVirtualComp}
        isOpen={isVirtualModalOpen}
        onClose={() => {
          setIsVirtualModalOpen(false);
          setSelectedVirtualComp(null);
        }}
        onSubmissionSuccess={fetchData}
      />

      {/* Team Registration Modal (Mandatory 4+ members, 2 boys + 2 girls) */}
      {selectedTeamComp && (
        <TeamRegistrationModal
          isOpen={isTeamModalOpen}
          competition={selectedTeamComp}
          onClose={() => {
            setIsTeamModalOpen(false);
            setSelectedTeamComp(null);
          }}
          onSuccess={() => {
            fetchData();
          }}
        />
      )}
    </div>
  );
}
