import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, HelpCircle, X, Search, Brain, ShieldCheck, 
  GraduationCap, Trophy, Users, MessageSquare, ArrowRight, 
  Phone, ExternalLink, BookOpen, Compass, CheckCircle2, ChevronRight,
  QrCode
} from 'lucide-react';

interface QuickAction {
  title: string;
  desc: string;
  icon: any;
  to: string;
  badge?: string;
  color: string;
  bg: string;
}

export default function FriendlyPlatformGuide() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const quickActions: QuickAction[] = [
    {
      title: 'Robotics Academy (LMS)',
      desc: 'Learn Level 0 to Level 8 robotics, embedded C++, and autonomous systems.',
      icon: Brain,
      to: '/learning',
      badge: 'Courses L0–L8',
      color: 'text-blue-400',
      bg: 'bg-blue-500/10 border-blue-500/30'
    },
    {
      title: 'Verify Certificate',
      desc: 'Scan QR code or enter credential ID to verify authentic certificates.',
      icon: QrCode,
      to: '/verify-certificate',
      badge: 'QR & ID Lookup',
      color: 'text-amber-400',
      bg: 'bg-amber-500/10 border-amber-500/30'
    },
    {
      title: 'AI for Educators',
      desc: 'National masterclass for teachers, handbook, lesson automation & credentials.',
      icon: GraduationCap,
      to: '/ai-for-educators',
      badge: 'Masterclass',
      color: 'text-purple-400',
      bg: 'bg-purple-500/10 border-purple-500/30'
    },
    {
      title: 'Championship 2026',
      desc: 'National robotics arena, game manual, registration & live scores.',
      icon: Trophy,
      to: '/competitions',
      badge: 'Arena 2026',
      color: 'text-amber-400',
      bg: 'bg-amber-500/10 border-amber-500/30'
    },
    {
      title: 'Free Mentorship Hub',
      desc: 'Connect 1-on-1 with robotics engineers, ask questions & schedule guidance.',
      icon: Users,
      to: '/mentorship',
      badge: '1-on-1 Guidance',
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10 border-emerald-500/30'
    },
    {
      title: 'Feedback & Reviews',
      desc: 'Share your ideas, suggest improvements, or leave a review for the team.',
      icon: MessageSquare,
      to: '/feedback',
      badge: 'We Listen',
      color: 'text-pink-400',
      bg: 'bg-pink-500/10 border-pink-500/30'
    }
  ];

  const filteredActions = quickActions.filter(action =>
    action.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    action.desc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleActionClick = (path: string) => {
    setIsOpen(false);
    navigate(path);
  };

  return (
    <>
      {/* Discreet Help Button */}
      <div className="fixed bottom-5 right-5 z-40 print:hidden">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-10 h-10 rounded-full bg-slate-900/90 hover:bg-slate-900 text-amber-400 border border-slate-700/80 shadow-lg flex items-center justify-center transition-transform hover:scale-105 cursor-pointer backdrop-blur-xs"
          title="Platform Quick Guide"
          aria-label="Platform Help"
        >
          {isOpen ? <X className="w-4 h-4 text-white" /> : <HelpCircle className="w-4 h-4 text-amber-400" />}
        </button>
      </div>

      {/* Friendly Guide Modal Dialog */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto print:hidden">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-slate-900 text-white rounded-3xl max-w-2xl w-full border border-slate-700 shadow-2xl overflow-hidden my-auto font-sans relative"
            >
              {/* Top Banner */}
              <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 p-6 text-slate-950 flex items-start justify-between">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-slate-950 text-amber-400 flex items-center justify-center shadow-lg border border-amber-300/40 shrink-0">
                    <Compass className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-950/15 text-slate-950 text-[10px] font-black uppercase tracking-wider mb-1">
                      <Sparkles className="w-3 h-3" /> Friendly Platform Compass
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black tracking-tight leading-tight">
                      How can we help you today?
                    </h3>
                    <p className="text-xs font-semibold text-slate-900/90 mt-0.5">
                      Fast 1-click access to learning, certificates, mentorship, and support.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-xl bg-slate-950/20 hover:bg-slate-950/30 text-slate-950 transition cursor-pointer"
                  title="Close Guide"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-6">
                {/* Search / Filter input */}
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search courses, certificates, AI tools, or features..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* 6 Friendly Pathway Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[380px] overflow-y-auto pr-1">
                  {filteredActions.map((action) => (
                    <button
                      key={action.title}
                      onClick={() => handleActionClick(action.to)}
                      className="p-4 rounded-2xl bg-slate-950/70 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 text-left transition-all duration-200 group flex items-start justify-between gap-3 cursor-pointer shadow-xs"
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-9 h-9 rounded-xl ${action.bg} flex items-center justify-center ${action.color} shrink-0 mt-0.5`}>
                          <action.icon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors">
                              {action.title}
                            </span>
                            {action.badge && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-slate-800 text-amber-300 border border-slate-700">
                                {action.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                            {action.desc}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-1 transition-all shrink-0 mt-1" />
                    </button>
                  ))}
                </div>

                {/* Direct Patron / Contact Strip */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-200">Need Immediate Assistance?</p>
                      <p className="text-[11px] text-slate-400">Patron line &amp; WhatsApp: <strong className="text-emerald-400 font-mono">0717468236</strong></p>
                    </div>
                  </div>

                  <a
                    href="https://wa.me/263717468236?text=Hello%20YARA%20Team%2C%20I%20need%20assistance%20on%20the%20platform."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black text-xs transition flex items-center gap-1.5 shadow-xs shrink-0"
                  >
                    <span>Chat on WhatsApp</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                {/* Friendly Navigation Tips */}
                <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
                  <span>💡 Tip: Press <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 font-mono text-[10px]">⌘K</kbd> anywhere to search.</span>
                  <span>Official YARA Platform • 2026 Season</span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
