import React, { useEffect, useState } from 'react';
import { Calendar, MapPin, Users, Trophy, ArrowRight, Clock, Zap, Loader2, Sparkles, Cpu, Code } from 'lucide-react';
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
  const [activeFilter, setActiveFilter] = useState<'all' | 'virtual' | 'physical' | 'public_teams'>('all');

  // Modal for Virtual Challenge
  const [selectedVirtualComp, setSelectedVirtualComp] = useState<VirtualCompetition | null>(null);
  const [isVirtualModalOpen, setIsVirtualModalOpen] = useState(false);

  // Modal for Team Registration
  const [registeringComp, setRegisteringComp] = useState<{ id: string; title: string } | null>(null);
  const [isTeamRegModalOpen, setIsTeamRegModalOpen] = useState(false);


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

      if (eventsData && eventsData.length > 0) {
        setEvents(eventsData);
      } else {
        setEvents(INITIAL_EVENTS as Event[]);
      }

      if (compsData && compsData.length > 0) {
        setCompetitions(compsData);
      } else {
        setCompetitions(INITIAL_COMPETITIONS as Competition[]);
      }
      
      if (vCompsData && vCompsData.length > 0) {
        setVirtualCompetitions(vCompsData);
      } else {
        setVirtualCompetitions(INITIAL_VIRTUAL_COMPETITIONS as VirtualCompetition[]);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      setEvents(INITIAL_EVENTS as Event[]);
      setCompetitions(INITIAL_COMPETITIONS as Competition[]);
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
            { id: 'all', label: 'All Events & Challenges', badge: virtualCompetitions.length + events.length + competitions.length },
            { id: 'virtual', label: 'Virtual Challenges', badge: virtualCompetitions.length },
            { id: 'physical', label: 'Physical Events', badge: events.length + competitions.length },
            { id: 'public_teams', label: 'Registered Teams Directory' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id as any)}
              className={cn(
                'px-6 py-3 rounded-2xl text-xs font-bold transition-all flex items-center space-x-2',
                activeFilter === tab.id
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                  : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-100'
              )}
            >
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span
                  className={cn(
                    'px-2 py-0.5 rounded-full text-[10px]',
                    activeFilter === tab.id
                      ? 'bg-indigo-500 text-white'
                      : 'bg-slate-100 text-slate-500'
                  )}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </header>

      {/* LOADING STATE */}
      {loading ? (
        <div className="py-20 text-center flex flex-col items-center justify-center">
          <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
          <p className="text-slate-500 font-bold text-sm">Loading arena events...</p>
        </div>
      ) : (
        <div className="space-y-12">
          {/* PUBLIC TEAMS DIRECTORY TAB */}
          {activeFilter === 'public_teams' && (
            <section className="space-y-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                    Participating Teams Directory
                  </h3>
                  <p className="text-xs text-slate-400 font-medium">
                    Publicly verified teams competing in YARA STEM Challenges (Privacy Compliant)
                  </p>
                </div>
              </div>
              <PublicTeamsList />
            </section>
          )}

          {/* FEATURED EVENT BANNER */}
          {(activeFilter === 'all' || activeFilter === 'physical') && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-[2.5rem] p-8 md:p-12 text-white border border-indigo-500/20 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
              
              <div className="relative z-10 space-y-6 max-w-3xl">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="px-3.5 py-1 bg-amber-500 text-slate-950 font-black text-xs rounded-full uppercase tracking-wider shadow-lg shadow-amber-500/20 flex items-center space-x-1.5">
                    <Trophy className="w-3.5 h-3.5" />
                    <span>Featured Championship</span>
                  </span>
                  <span className="px-3.5 py-1 bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 font-bold text-xs rounded-full uppercase tracking-wider">
                    YARA 2026
                  </span>
                </div>

                <div className="space-y-2">
                  <h3 className="text-3xl md:text-5xl font-black tracking-tight text-white leading-tight">
                    YARA Educational Robotics Competition 2026
                  </h3>
                  <p className="text-indigo-300 font-bold text-base md:text-lg">
                    “Engineering Opportunity: Robotics and Innovation for Underserved Youth”
                  </p>
                  <p className="text-amber-400 font-medium text-xs md:text-sm uppercase tracking-widest">
                    “Innovate for Inclusion. Build for Impact.”
                  </p>
                </div>

                <p className="text-slate-300 text-sm md:text-base leading-relaxed">
                  Compete across three core categories: <strong>Underwater Drone Mission</strong>, <strong>Autonomous Maze Solving</strong>, and <strong>Innovation Pitch Challenge</strong>. Compete for overall championship ranking (35% Underwater + 35% Maze + 30% Pitch) and track awards.
                </p>

                <div className="pt-2 flex flex-wrap gap-4 items-center">
                  <button
                    onClick={() => {
                      setRegisteringComp({
                        id: 'yara_rc_2026',
                        title: 'YARA Educational Robotics Competition 2026'
                      });
                      setIsTeamRegModalOpen(true);
                    }}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-2xl font-bold text-sm uppercase tracking-wider shadow-xl shadow-indigo-600/30 transition-all flex items-center space-x-2.5"
                  >
                    <Users className="w-5 h-5 text-indigo-200" />
                    <span>Register Team Now (2B + 2G Min)</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setActiveFilter('public_teams')}
                    className="bg-slate-800/80 hover:bg-slate-800 text-slate-200 border border-slate-700 px-6 py-4 rounded-2xl font-bold text-sm transition-all"
                  >
                    View Registered Teams
                  </button>
                </div>
              </div>
            </motion.div>
          )}

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
                  <div key={vComp.id} className="flex flex-col space-y-2">
                    <VirtualCompetitionCard
                      competition={vComp}
                      onOpen={handleOpenVirtualChallenge}
                    />
                    <button
                      onClick={() => {
                        setRegisteringComp({ id: vComp.id, title: vComp.title });
                        setIsTeamRegModalOpen(true);
                      }}
                      className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-2.5 rounded-2xl transition border border-slate-800 flex items-center justify-center space-x-2"
                    >
                      <Users className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Register Team (2B + 2G Required)</span>
                    </button>
                  </div>
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

                          <div className="pt-4 flex flex-wrap gap-4">
                            <button 
                              onClick={() => {
                                setRegisteringComp({ id: comp.id, title: comp.title });
                                setIsTeamRegModalOpen(true);
                              }}
                              className="bg-indigo-600 text-white px-8 py-3.5 rounded-2xl font-bold text-xs uppercase tracking-wider shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all flex items-center space-x-2"
                            >
                              <Users className="w-4 h-4" />
                              <span>Register Team (2 Boys + 2 Girls Min)</span>
                              <ArrowRight className="w-4 h-4" />
                            </button>
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

      {/* Team Registration Modal */}
      {registeringComp && (
        <TeamRegistrationModal
          competitionId={registeringComp.id}
          competitionTitle={registeringComp.title}
          isOpen={isTeamRegModalOpen}
          onClose={() => {
            setIsTeamRegModalOpen(false);
            setRegisteringComp(null);
          }}
          onSuccess={fetchData}
        />
      )}
    </div>
  );
}

