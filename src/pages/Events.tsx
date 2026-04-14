import React, { useEffect, useState } from 'react';
import { Calendar, MapPin, Users, Trophy, ArrowRight, Clock, Zap, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import PlaceholderImage from '../components/PlaceholderImage';
import { supabase } from '../lib/supabase';
import { ASSETS } from '../constants/assets';

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
  const [events, setEvents] = useState<Event[]>([]);
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [loading, setLoading] = useState(true);

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

      setEvents(eventsData || []);
      setCompetitions(compsData || []);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8 pb-12">
      <header>
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Events & Competitions</h2>
        <p className="text-slate-500 font-medium">Join our upcoming events and showcase your skills.</p>
      </header>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
          <p className="text-slate-500 font-bold">Loading upcoming events...</p>
        </div>
      ) : (
        <div className="grid gap-12">
          {events.length === 0 && competitions.length === 0 && (
            <div className="bg-white rounded-[2.5rem] p-12 text-center border border-slate-100">
              <Calendar className="w-12 h-12 text-slate-200 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-900 mb-2">No Upcoming Events</h3>
              <p className="text-slate-500">Check back later for new workshops and competitions!</p>
            </div>
          )}

          {/* Render Competitions First */}
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
                  <h3 className="text-3xl font-bold text-white tracking-tight">{comp.title}</h3>
                </div>
              </div>

              <div className="p-8 md:p-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
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
                  <p className="text-slate-600 font-medium leading-relaxed text-lg">
                    {comp.description}
                  </p>

                  <div className="pt-8 flex flex-wrap gap-4">
                    {comp.registration_link && (
                      <a 
                        href={comp.registration_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all flex items-center space-x-2"
                      >
                        <span>Register Now</span>
                        <ArrowRight className="w-5 h-5" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}

          {/* Render Events */}
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
                  <h3 className="text-3xl font-bold text-white tracking-tight">{event.title}</h3>
                </div>
              </div>

              <div className="p-8 md:p-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Date</p>
                      <p className="text-sm font-bold text-slate-700">{new Date(event.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Location</p>
                      <p className="text-sm font-bold text-slate-700">{event.location}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                      <Users className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Participants</p>
                      <p className="text-sm font-bold text-slate-700">Open to All</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <p className="text-slate-600 font-medium leading-relaxed text-lg">
                    {event.description}
                  </p>

                  <div className="pt-8 flex flex-wrap gap-4">
                    {event.registration_link && (
                      <a 
                        href={event.registration_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all flex items-center space-x-2"
                      >
                        <span>Register Now</span>
                        <ArrowRight className="w-5 h-5" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Past Events / Gallery */}
      <section className="pt-12">
        <h3 className="text-2xl font-bold text-slate-900 mb-8 tracking-tight">Past Highlights</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {ASSETS.GALLERY.slice(0, 8).map((img, i) => (
            <div key={i} className="aspect-square rounded-3xl overflow-hidden group relative bg-slate-100">
              <img 
                src={img} 
                alt={`Highlight ${i + 1}`} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = ASSETS.EVENT_PLACEHOLDER;
                }}
              />
              <div className="absolute inset-0 bg-indigo-600/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
