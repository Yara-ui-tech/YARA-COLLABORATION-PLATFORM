import React, { useEffect, useState } from 'react';
import { useAuth } from '../components/AuthContext';
import { supabase } from '../lib/supabase';
import { ASSETS } from '../constants/assets';
import { Lightbulb, Briefcase, Users, ArrowRight, Zap, TrendingUp, Clock, Calendar, BookOpen, Cpu, Code, Layers, Terminal, Info, BarChart3, Handshake, Phone, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import PlaceholderImage from '../components/PlaceholderImage';
import CountdownTimer from '../components/CountdownTimer';

export default function Home() {
  const { profile } = useAuth();
  const [recentIdeas, setRecentIdeas] = useState<any[]>([]);
  const [recentProjects, setRecentProjects] = useState<any[]>([]);

  const recommendations = {
    junior: [
      { title: 'Introduction to Arduino', type: 'Course', icon: Cpu, color: 'text-indigo-600', bg: 'bg-indigo-50' },
      { title: 'Simple LED Circuits', type: 'Project', icon: Zap, color: 'text-amber-600', bg: 'bg-amber-50' },
      { title: 'Block-based Coding', type: 'Resource', icon: Code, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    ],
    secondary: [
      { title: 'MicroPython for Robotics', type: 'Course', icon: Terminal, color: 'text-indigo-600', bg: 'bg-indigo-50' },
      { title: 'PCB Design with Proteus', type: 'Workshop', icon: Layers, color: 'text-amber-600', bg: 'bg-amber-50' },
      { title: 'Line Follower Robot', type: 'Project', icon: Briefcase, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    ],
    tertiary: [
      { title: 'Advanced Altium Designer', type: 'Masterclass', icon: Layers, color: 'text-indigo-600', bg: 'bg-indigo-50' },
      { title: 'Embedded Systems with C++', type: 'Course', icon: Code, color: 'text-amber-600', bg: 'bg-amber-50' },
      { title: 'AI in Robotics', type: 'Research', icon: Lightbulb, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    ],
  };

  const userLevel = profile?.educational_level || 'junior';
  const currentRecommendations = recommendations[userLevel as keyof typeof recommendations];

  const tools = [
    { name: 'Altium Designer', desc: 'Professional PCB Design', icon: Layers },
    { name: 'Proteus', desc: 'Circuit Simulation', icon: Zap },
    { name: 'Arduino IDE', desc: 'Microcontroller Coding', icon: Cpu },
    { name: 'MicroPython', desc: 'Python for Hardware', icon: Terminal },
  ];

  const [featuredMentors, setFeaturedMentors] = useState<any[]>([]);
  const [stats, setStats] = useState({
    projects: 0,
    innovators: 0,
    ideas: 0
  });

  const [latestEvent, setLatestEvent] = useState<any>(null);

  useEffect(() => {
    const fetchRecentData = async () => {
      const { data: ideas } = await supabase
        .from('ideas')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(3);
      setRecentIdeas(ideas || []);

      const { data: projects } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(3);
      setRecentProjects(projects || []);

      const { data: mentors } = await supabase
        .from('profiles')
        .select('avatar_url, display_name, rating, mentored_count')
        .eq('role', 'mentor')
        .limit(5);
      setFeaturedMentors(mentors || []);

      const { data: events } = await supabase
        .from('events')
        .select('*')
        .eq('is_upcoming', true)
        .order('date', { ascending: true })
        .limit(1);
      if (events && events.length > 0) setLatestEvent(events[0]);

      // Fetch stats
      const { count: projectCount } = await supabase.from('projects').select('*', { count: 'exact', head: true });
      const { count: profileCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
      const { count: ideaCount } = await supabase.from('ideas').select('*', { count: 'exact', head: true });
      
      setStats({
        projects: projectCount || 0,
        innovators: profileCount || 0,
        ideas: ideaCount || 0
      });
    };

    fetchRecentData();

    // Real-time subscriptions
    const ideasSubscription = supabase
      .channel('ideas_home')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'ideas' }, (payload) => {
        setRecentIdeas(prev => [payload.new, ...prev.slice(0, 2)]);
      })
      .subscribe();

    const projectsSubscription = supabase
      .channel('projects_home')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'projects' }, (payload) => {
        setRecentProjects(prev => [payload.new, ...prev.slice(0, 2)]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(ideasSubscription);
      supabase.removeChannel(projectsSubscription);
    };
  }, []);

  return (
    <div className="space-y-8 pb-12">
      {/* Welcome Hero */}
      <section className="relative overflow-hidden bg-indigo-600 rounded-[2.5rem] p-8 md:p-12 text-white shadow-2xl shadow-indigo-200">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-400/20 rounded-full -ml-32 -mb-32 blur-3xl" />
        
        <div className="relative z-10 max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full text-sm font-bold mb-6"
          >
            <Zap className="w-4 h-4 text-yellow-300 fill-yellow-300" />
            <span>Welcome back, {profile?.display_name?.split(' ')[0]}!</span>
          </motion.div>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 leading-tight">
            Ready to build the future of <span className="text-indigo-200">African Tech?</span>
          </h2>
          <p className="text-indigo-100 text-lg font-medium opacity-90 mb-8 max-w-lg">
            Connect with fellow innovators, share your groundbreaking ideas, and find the mentorship you need to scale.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              to="/ideas"
              className="bg-white text-indigo-600 px-8 py-4 rounded-2xl font-bold shadow-lg hover:bg-indigo-50 transition-all flex items-center space-x-2"
            >
              <span>Share an Idea</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/projects"
              className="bg-indigo-500/30 backdrop-blur-md text-white border border-white/20 px-8 py-4 rounded-2xl font-bold hover:bg-indigo-500/40 transition-all"
            >
              View Projects
            </Link>
          </div>
        </div>
      </section>

      {/* Launch Countdown */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <CountdownTimer targetDate={new Date('2026-04-14T15:37:09-07:00')} />
      </motion.section>

      {/* Recommended for You */}
      <motion.section 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="space-y-6"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center space-x-3">
            <TrendingUp className="w-6 h-6 text-indigo-600" />
            <span>Recommended for You ({userLevel})</span>
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {currentRecommendations.map((rec, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-white p-6 rounded-[2rem] border border-slate-100 hover:border-indigo-100 transition-all shadow-sm group"
            >
              <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-4", rec.bg, rec.color)}>
                <rec.icon className="w-6 h-6" />
              </div>
              <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">{rec.type}</p>
              <h4 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{rec.title}</h4>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Tools Showcase */}
      <motion.section 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="bg-slate-900 rounded-[3rem] p-8 md:p-12 text-white overflow-hidden relative"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full -mr-32 -mt-32 blur-3xl" />
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
            <div>
              <h3 className="text-3xl font-bold tracking-tight">Essential Tools</h3>
              <p className="text-slate-400 font-medium mt-2">Master the software used by top African engineers.</p>
            </div>
            <Link to="/resources" className="bg-white/10 hover:bg-white/20 px-6 py-3 rounded-xl font-bold text-sm transition-all backdrop-blur-md border border-white/10">
              Explore All Tools
            </Link>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {tools.map((tool, i) => (
              <div key={i} className="bg-white/5 border border-white/10 p-6 rounded-[2rem] hover:bg-white/10 transition-all group">
                <tool.icon className="w-8 h-8 text-indigo-400 mb-4 group-hover:scale-110 transition-transform" />
                <h4 className="font-bold text-lg">{tool.name}</h4>
                <p className="text-xs text-slate-400 mt-1">{tool.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link to="/events" className="bg-white p-8 rounded-[2rem] border border-slate-100 hover:border-indigo-100 hover:shadow-xl hover:shadow-indigo-50 transition-all group flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
              <Calendar className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">Upcoming Events</h3>
              <p className="text-slate-500 font-medium">{latestEvent ? latestEvent.title : 'Join our Micromouse Maze Competition!'}</p>
            </div>
          </div>
          <ArrowRight className="w-6 h-6 text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
        </Link>
        <Link to="/resources" className="bg-white p-8 rounded-[2rem] border border-slate-100 hover:border-indigo-100 hover:shadow-xl hover:shadow-indigo-50 transition-all group flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
              <BookOpen className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">Simulation Tools</h3>
              <p className="text-slate-500 font-medium">Master robotics with virtual simulators.</p>
            </div>
          </div>
          <ArrowRight className="w-6 h-6 text-slate-300 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
        </Link>
      </div>

      {/* Community Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Recent Ideas */}
        <div className="md:col-span-2 space-y-6">
          {/* Impact Outreach: Mashwest Province */}
          <section className="space-y-6 overflow-hidden">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center space-x-3">
                <Users className="w-6 h-6 text-indigo-600" />
                <span>Impact Outreach: Mashwest Province</span>
              </h3>
            </div>
            
            <div className="relative flex overflow-hidden group">
              <motion.div 
                className="flex space-x-4 py-4"
                animate={{
                  x: [0, -1000],
                }}
                transition={{
                  x: {
                    repeat: Infinity,
                    repeatType: "loop",
                    duration: 25,
                    ease: "linear",
                  },
                }}
              >
                {[...ASSETS.OUTREACH, ...ASSETS.OUTREACH].map((img, i) => (
                  <div
                    key={i}
                    className="w-64 h-64 flex-shrink-0 rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500"
                  >
                    <img 
                      src={img} 
                      alt={`Mashwest Outreach ${i + 1}`} 
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = ASSETS.PROJECT_PLACEHOLDER;
                      }}
                    />
                  </div>
                ))}
              </motion.div>
            </div>
          </section>

          <div className="flex items-center justify-between pt-8">
            <h3 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center space-x-3">
              <Lightbulb className="w-6 h-6 text-indigo-600" />
              <span>Trending Ideas</span>
            </h3>
            <Link to="/ideas" className="text-sm font-bold text-indigo-600 hover:text-indigo-700">View all</Link>
          </div>
          
          <div className="grid gap-4">
            {recentIdeas.map((idea, index) => (
              <motion.div
                key={idea.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white p-6 rounded-3xl border border-slate-100 hover:border-indigo-100 hover:shadow-xl hover:shadow-indigo-50 transition-all group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600">
                      {idea.author_name?.[0] || 'U'}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{idea.author_name}</p>
                      <p className="text-xs text-slate-500 flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {new Date(idea.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-xs font-bold">
                    New Idea
                  </div>
                </div>
                <p className="text-slate-600 line-clamp-2 font-medium leading-relaxed mb-4">
                  {idea.content}
                </p>
                <button className="text-sm font-bold text-indigo-600 group-hover:translate-x-1 transition-transform flex items-center space-x-1">
                  <span>Read more</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </div>

          {/* Recent Projects */}
          <div className="pt-8 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center space-x-3">
                <Briefcase className="w-6 h-6 text-indigo-600" />
                <span>Recent Projects</span>
              </h3>
              <Link to="/projects" className="text-sm font-bold text-indigo-600 hover:text-indigo-700">View all</Link>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {recentProjects.map((project, index) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-3xl border border-slate-100 overflow-hidden hover:shadow-xl hover:shadow-indigo-50 transition-all group"
                >
                  <div className="h-32 relative">
                    {project.image_url ? (
                      <img
                        src={project.image_url}
                        alt={project.title}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <PlaceholderImage text={project.title} className="h-32" type="project" />
                    )}
                  </div>
                  <div className="p-4">
                    <h4 className="font-bold text-slate-900 line-clamp-1">{project.title}</h4>
                    <p className="text-xs text-slate-500 mt-1">By {project.owner_name}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Community Stats */}
        <div className="space-y-6">
          <h3 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center space-x-3">
            <Users className="w-6 h-6 text-indigo-600" />
            <span>Community Gallery</span>
          </h3>
          <div className="bg-white rounded-[2rem] border border-slate-100 p-4 shadow-sm overflow-hidden">
            <motion.div 
              className="flex space-x-2"
              animate={{
                x: [0, -1200],
              }}
              transition={{
                x: {
                  repeat: Infinity,
                  repeatType: "loop",
                  duration: 40,
                  ease: "linear",
                },
              }}
            >
              {[...ASSETS.GALLERY, ...ASSETS.GALLERY].map((img, i) => (
                <div
                  key={i}
                  className="w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden bg-slate-100"
                >
                  <img 
                    src={img} 
                    alt={`Gallery ${i + 1}`} 
                    className="w-full h-full object-cover hover:scale-125 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = ASSETS.PROJECT_PLACEHOLDER;
                    }}
                  />
                </div>
              ))}
            </motion.div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest text-center mt-4">
              Our Community in Action
            </p>
          </div>

          <h3 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center space-x-3 pt-4">
            <Users className="w-6 h-6 text-indigo-600" />
            <span>Community Stats</span>
          </h3>
          
          <div className="bg-white rounded-[2rem] border border-slate-100 p-6 space-y-6 shadow-sm">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <span className="font-bold text-slate-700">Projects</span>
                </div>
                <span className="text-xl font-black text-slate-900">{stats.projects}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                    <Users className="w-5 h-5" />
                  </div>
                  <span className="font-bold text-slate-700">Innovators</span>
                </div>
                <span className="text-xl font-black text-slate-900">{stats.innovators}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600">
                    <Lightbulb className="w-5 h-5" />
                  </div>
                  <span className="font-bold text-slate-700">Ideas</span>
                </div>
                <span className="text-xl font-black text-slate-900">{stats.ideas}</span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <p className="text-sm font-bold text-slate-900 mb-4">Featured Mentors</p>
              <div className="flex -space-x-3">
                {featuredMentors.length > 0 ? (
                  featuredMentors.map((mentor, i) => (
                    <div key={i} className="w-10 h-10 rounded-full border-4 border-white bg-slate-200 flex items-center justify-center overflow-hidden" title={mentor.display_name}>
                      <img 
                        src={mentor.avatar_url || ASSETS.DEFAULT_AVATAR} 
                        alt={mentor.display_name} 
                        referrerPolicy="no-referrer" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-slate-400 font-medium italic">No mentors active yet</div>
                )}
                {featuredMentors.length >= 5 && (
                  <div className="w-10 h-10 rounded-full border-4 border-white bg-indigo-600 flex items-center justify-center text-[10px] font-bold text-white">
                    +
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <h3 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center space-x-3 pt-4">
            <Info className="w-6 h-6 text-indigo-600" />
            <span>Quick Links</span>
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'About YARA', path: '/about', icon: Info },
              { label: 'Programs', path: '/programs', icon: Cpu },
              { label: 'Impact', path: '/impact', icon: BarChart3 },
              { label: 'Partners', path: '/partners', icon: Handshake },
              { label: 'Contact', path: '/contact', icon: Phone }
            ].map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="flex items-center space-x-2 p-4 bg-white rounded-2xl border border-slate-100 hover:border-indigo-100 hover:shadow-md transition-all group"
              >
                <link.icon className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                <span className="text-sm font-bold text-slate-600 group-hover:text-slate-900 transition-colors">{link.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
