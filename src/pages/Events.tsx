import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Users, Trophy, ArrowRight, Clock, Zap, Loader2, Sparkles, Cpu, Code, Brain, ShieldCheck, Video, DollarSign, School, Plus, Edit3, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import PlaceholderImage from '../components/PlaceholderImage';
import { supabase } from '../lib/supabase';
import { ASSETS } from '../constants/assets';
import { INITIAL_COMPETITIONS, INITIAL_EVENTS } from '../constants/eventsData';
import { VirtualCompetition } from '../types/competition';
import VirtualCompetitionCard from '../components/competition/VirtualCompetitionCard';
import VirtualCompetitionModal from '../components/competition/VirtualCompetitionModal';
import TeamRegistrationModal from '../components/competition/TeamRegistrationModal';
import PublicTeamsList from '../components/competition/PublicTeamsList';
import EventSignupsManager from '../components/events/EventSignupsManager';
import EventEditModal from '../components/events/EventEditModal';
import { fetchAllEvents, saveEventItem, deleteEventItem, EventItem } from '../constants/eventsData';
import { useAuth } from '../components/AuthContext';

interface Event extends EventItem {}

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
  const { profile } = useAuth();
  const isAdmin = profile?.role === 'admin' || profile?.email === 'manongwasimbarashe394@gmail.com' || profile?.email === 'goyaracorp@gmail.com';

  const [events, setEvents] = useState<Event[]>([]);
  const [competitions, setCompetitions] = useState<Competition[]>(INITIAL_COMPETITIONS as Competition[]);
  const [virtualCompetitions, setVirtualCompetitions] = useState<VirtualCompetition[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'all' | 'virtual' | 'physical'>('all');

  // Modal for Event Editing / Adding
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);

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
      const eventsData = await fetchAllEvents();
      setEvents(eventsData);

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

      if (compsData && compsData.length > 0) {
        setCompetitions(compsData.filter(c => !deletedCompIds.includes(c.id)));
      } else {
        const filtered = (INITIAL_COMPETITIONS as Competition[]).filter(c => !deletedCompIds.includes(c.id));
        setCompetitions(filtered);
      }

      setVirtualCompetitions(vCompsData || []);
    } catch (error) {
      console.error('Error fetching events:', error);
      const eventsData = await fetchAllEvents();
      setEvents(eventsData);
      setVirtualCompetitions([]);
    } finally {
      setLoading(false);
    }
  }

  const handleSaveEvent = async (saved: EventItem) => {
    await saveEventItem(saved);
    await fetchData();
  };

  const handleDeleteEvent = async (eventId: string, title: string) => {
    if (confirm(`Are you sure you want to remove event "${title}"?`)) {
      await deleteEventItem(eventId);
      await fetchData();
    }
  };

  const handleOpenVirtualChallenge = (vComp: VirtualCompetition) => {
    setSelectedVirtualComp(vComp);
    setIsVirtualModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-10">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-800/80 pb-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-cyan-400 font-black text-xs uppercase tracking-widest">
              <Trophy className="w-4 h-4 text-cyan-400" />
              <span>Competitive Arena & Educational Bootcamps</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight">
              Events & Bootcamps Hub
            </h2>
            <p className="text-slate-400 font-medium text-sm max-w-xl leading-relaxed">
              Explore professional development bootcamps, hardware hackathons, and virtual simulation challenges.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {isAdmin && (
              <button
                onClick={() => {
                  setEditingEvent(null);
                  setIsEventModalOpen(true);
                }}
                className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 px-5 py-2.5 rounded-2xl font-black text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/20 flex items-center space-x-2 transition-all hover:scale-105"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Event</span>
              </button>
            )}

            {/* Filter Pills */}
            <div className="flex items-center space-x-1.5 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800 shrink-0">
              {[
                { id: 'all', label: 'All Events' },
                { id: 'virtual', label: 'Virtual Challenges', badge: virtualCompetitions.length },
                { id: 'physical', label: 'Physical & Online Events', badge: events.length }
              ].map(filter => (
                <button
                  key={filter.id}
                  onClick={() => setActiveFilter(filter.id as any)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                    activeFilter === filter.id
                      ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <span>{filter.label}</span>
                  {filter.badge !== undefined && filter.badge > 0 && (
                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                      activeFilter === filter.id ? 'bg-slate-950 text-cyan-400' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {filter.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </header>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-cyan-400 animate-spin mb-4" />
            <p className="text-slate-400 font-bold text-sm">Loading arena events...</p>
          </div>
        ) : (
          <div className="space-y-10">
            {/* FEATURED EVENT: AI FOR EDUCATORS ONLINE BOOTCAMP */}
            <div className="p-6 sm:p-8 md:p-10 rounded-3xl bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 border border-indigo-500/30 text-white shadow-2xl relative overflow-hidden">
              <div className="absolute -right-10 -bottom-10 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
              
              <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
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
                    <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white mt-1">
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
                      <span>Access Verification Enforced</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
                  {isAdmin && (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          const bootcampEvt = events.find(e => e.id === 'ai-for-educators-2026') || {
                            id: 'ai-for-educators-2026',
                            title: 'AI for Educators – Online Bootcamp',
                            description: 'A high-impact 5-day professional development programme equipping teachers and lecturers with practical AI tools.',
                            date: '31 Aug – 4 Sep 2026',
                            location: 'Live Google Meet Hall',
                            image_url: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1200&q=80',
                            registration_link: '/events/ai-for-educators',
                            is_upcoming: true,
                            category: 'Virtual Bootcamp'
                          };
                          setEditingEvent(bootcampEvt);
                          setIsEventModalOpen(true);
                        }}
                        className="px-3.5 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 font-bold rounded-xl text-xs border border-cyan-500/30 flex items-center space-x-1.5 transition-all"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit Event</span>
                      </button>

                      <button
                        onClick={() => handleDeleteEvent('ai-for-educators-2026', 'AI for Educators – Online Bootcamp')}
                        className="px-3.5 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 font-bold rounded-xl text-xs border border-red-500/30 flex items-center space-x-1.5 transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  )}

                  <Link
                    to="/events/ai-for-educators"
                    className="px-6 py-3.5 bg-gradient-to-r from-cyan-400 via-cyan-300 to-cyan-400 hover:from-cyan-300 hover:to-cyan-200 text-slate-950 font-black rounded-2xl text-xs uppercase tracking-wider shadow-lg shadow-cyan-400/20 flex items-center justify-center space-x-2 transition-all hover:scale-105"
                  >
                    <Brain className="w-4 h-4" />
                    <span>View Event & Register</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    to="/events/ai-for-educators"
                    className="px-5 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-2xl text-xs border border-white/20 flex items-center justify-center space-x-2 transition-all text-center"
                  >
                    <Video className="w-4 h-4" />
                    <span>Enter Live Event Room</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* AI FOR EDUCATORS SIGNUPS & REGISTRATION MANAGER */}
            <EventSignupsManager />

            {/* SECTION 1: VIRTUAL ONLINE COMPETITIONS */}
            {(activeFilter === 'all' || activeFilter === 'virtual') && (
              <section className="space-y-6">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white tracking-tight">
                      Virtual Online Challenges &amp; Sprints
                    </h3>
                    <p className="text-xs text-slate-400 font-medium">
                      Simulate, wire, and code in Wokwi, Tinkercad, or EasyEDA within timed windows
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {virtualCompetitions.length === 0 ? (
                    <div className="col-span-full flex flex-col items-center justify-center py-12 bg-slate-900/60 rounded-3xl border border-slate-800">
                      <Zap className="w-8 h-8 text-slate-500 mb-3" />
                      <h4 className="text-base font-bold text-slate-300 mb-1">No Virtual Challenges Available Yet</h4>
                      <p className="text-xs text-slate-400 max-w-xs text-center">
                        Virtual simulation challenges will appear here once created. Check back soon!
                      </p>
                    </div>
                  ) : (
                    virtualCompetitions.map(vComp => (
                      <VirtualCompetitionCard
                        key={vComp.id}
                        competition={vComp}
                        onOpen={handleOpenVirtualChallenge}
                      />
                    ))
                  )}
                </div>
              </section>
            )}

            {/* SECTION 2: PHYSICAL & VIRTUAL EVENTS */}
            {(activeFilter === 'all' || activeFilter === 'physical') && (
              <section className="space-y-6">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white tracking-tight">
                      On-Site Events &amp; Community Hackathons
                    </h3>
                    <p className="text-xs text-slate-400 font-medium">
                      Hands-on build days, showcase pitches, and regional robotics exhibitions
                    </p>
                  </div>
                </div>

                {events.length === 0 ? (
                  <div className="bg-slate-900/60 rounded-3xl p-10 text-center border border-slate-800">
                    <Calendar className="w-10 h-10 text-slate-500 mx-auto mb-3" />
                    <h3 className="text-lg font-bold text-white mb-1">No Upcoming Physical Events</h3>
                    <p className="text-slate-400 text-xs">Check back later for new workshops and exhibitions!</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Competitions Hub Banner (Directs to Competitions) */}
                    <div className="bg-gradient-to-r from-amber-500/10 via-slate-900 to-indigo-950 border border-amber-500/30 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
                          <Trophy className="w-4 h-4" />
                          <span>Continental Flagship Championship</span>
                        </div>
                        <h4 className="text-xl sm:text-2xl font-black text-white">YARA Educational Robotics Competition 2026</h4>
                        <p className="text-slate-300 text-xs sm:text-sm max-w-xl leading-relaxed">
                          Looking for official competition guidelines, team registration (2 Boys + 2 Girls), Underwater Drone missions, and dynamic arena scoreboards? The YARA 2026 Championship is housed under the <strong>Competitions Hub</strong>.
                        </p>
                      </div>
                      <Link
                        to="/competitions/yara-2026"
                        className="shrink-0 px-6 py-3.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black rounded-2xl text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 flex items-center space-x-2 transition-all hover:scale-105"
                      >
                        <span>Explore Competitions Hub</span>
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>

                    {/* Events Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                      {events.map((event, index) => (
                        <motion.div
                          key={event.id}
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="bg-slate-900/90 border border-slate-800 rounded-3xl overflow-hidden shadow-xl hover:border-cyan-500/40 transition-all flex flex-col justify-between group"
                        >
                          <div>
                            <div className="relative h-48 overflow-hidden">
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
                              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                              <div className="absolute bottom-4 left-6 right-6">
                                <div className="flex items-center space-x-2 mb-1.5">
                                  <span className="px-2.5 py-0.5 bg-cyan-500 text-slate-950 rounded-full text-[10px] font-black uppercase tracking-wider">
                                    {event.category || 'Event'}
                                  </span>
                                  <span className="px-2.5 py-0.5 bg-white/20 backdrop-blur-md text-white rounded-full text-[10px] font-bold">
                                    {event.date}
                                  </span>
                                </div>
                                <h3 className="text-xl font-bold text-white tracking-tight line-clamp-1">{event.title}</h3>
                              </div>
                            </div>

                            <div className="p-6 space-y-4">
                              <div className="grid grid-cols-2 gap-3 text-xs text-slate-300">
                                <div className="flex items-center space-x-2">
                                  <MapPin className="w-4 h-4 text-cyan-400 shrink-0" />
                                  <span className="truncate font-medium">{event.location}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Calendar className="w-4 h-4 text-emerald-400 shrink-0" />
                                  <span className="truncate font-medium">{event.date}</span>
                                </div>
                              </div>

                              <p className="text-slate-300 text-xs leading-relaxed line-clamp-3">
                                {event.description}
                              </p>
                            </div>
                          </div>

                          <div className="p-6 pt-0 border-t border-slate-800/60 mt-4 flex items-center justify-between gap-3">
                            {event.registration_link ? (
                              <a 
                                href={event.registration_link}
                                className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider shadow-md shadow-cyan-500/20 transition-all flex items-center space-x-1.5"
                              >
                                <span>Register</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                              </a>
                            ) : (
                              <span className="text-xs font-bold text-slate-400">Open Admission</span>
                            )}

                            {isAdmin && (
                              <div className="flex items-center space-x-1.5">
                                <button
                                  onClick={() => {
                                    setEditingEvent(event);
                                    setIsEventModalOpen(true);
                                  }}
                                  className="p-2 bg-slate-800 hover:bg-slate-700 text-cyan-400 rounded-xl text-xs border border-slate-700 transition-all"
                                  title="Edit Event"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteEvent(event.id, event.title)}
                                  className="p-2 bg-slate-800 hover:bg-slate-700 text-red-400 rounded-xl text-xs border border-slate-700 transition-all"
                                  title="Delete Event"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </section>
            )}

            {/* Public Teams Registry Section */}
            <section className="space-y-6 pt-4">
              <PublicTeamsList />
            </section>
          </div>
        )}
      </div>

      {/* Event Edit & Add Modal */}
      <EventEditModal
        event={editingEvent}
        isOpen={isEventModalOpen}
        onClose={() => {
          setIsEventModalOpen(false);
          setEditingEvent(null);
        }}
        onSave={handleSaveEvent}
      />

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
