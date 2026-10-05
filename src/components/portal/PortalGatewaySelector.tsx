import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Globe, GraduationCap, ArrowRight, CheckCircle2, ShieldCheck, 
  Trophy, Building2, Radio, BookOpen, Cpu, Users, 
  X, ExternalLink, Activity, Award, Flame
} from 'lucide-react';
import { usePortal } from '../../context/PortalContext';
import { cn } from '../../lib/utils';
import { ASSETS } from '../../constants/assets';

export const PortalGatewaySelector: React.FC = () => {
  const { isSelectorOpen, closePortalSelector, setPortalMode, portalMode, portalStats } = usePortal();
  const navigate = useNavigate();

  if (!isSelectorOpen) return null;

  const handleSelectWebpage = () => {
    setPortalMode('webpage');
    closePortalSelector();
    navigate('/');
  };

  const handleSelectLms = () => {
    setPortalMode('lms');
    closePortalSelector();
    navigate('/learning');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10 overflow-y-auto bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="relative w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden text-slate-100 my-auto"
        >
          {/* Header Banner */}
          <div className="relative px-6 py-8 sm:px-10 border-b border-slate-800 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950/60">
            <button
              onClick={closePortalSelector}
              className="absolute top-6 right-6 p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              aria-label="Close portal selector"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 p-1.5">
                {ASSETS.LOGO ? (
                  <img src={ASSETS.LOGO} alt="YARA" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                ) : (
                  <Globe className="w-5 h-5 text-blue-400" />
                )}
              </div>
              <span className="text-xs font-mono font-bold tracking-widest uppercase text-blue-400">
                YARA Dual-Gateway Ecosystem
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Select Your Gateway Destination
            </h2>
            <p className="mt-1 text-sm text-slate-400 max-w-2xl">
              Choose between exploring our public organization initiatives or entering the YARA Learning Academy.
            </p>
          </div>

          {/* Cards Grid */}
          <div className="p-6 sm:p-10 grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-900/50">
            {/* Gateway 1: Main Public Webpage */}
            <div 
              onClick={handleSelectWebpage}
              className={cn(
                "group relative rounded-2xl border p-6 flex flex-col justify-between transition-all duration-300 cursor-pointer overflow-hidden",
                portalMode === 'webpage' 
                  ? "bg-gradient-to-b from-blue-950/40 via-slate-900 to-slate-900 border-blue-500 shadow-xl shadow-blue-950/50 ring-2 ring-blue-500/20" 
                  : "bg-slate-950/50 border-slate-800 hover:border-blue-500/60 hover:bg-slate-900/80"
              )}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-blue-500/20 transition-all" />

              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
                    <Globe className="w-6 h-6" />
                  </div>
                  <span className="px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-blue-950 text-blue-400 border border-blue-800">
                    Public Portal
                  </span>
                </div>

                <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors flex items-center gap-2">
                  YARA Public Webpage
                  <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Discover Zimbabwe’s premier youth robotics ecosystem, upcoming 2026 championships, regional school chapters, outreach stories, and live broadcasts.
                </p>

                {/* Key Highlights */}
                <div className="mt-5 space-y-2.5">
                  <div className="flex items-center text-xs text-slate-300">
                    <Trophy className="w-4 h-4 text-amber-400 mr-2 shrink-0" />
                    <span>2026 National Robotics Championship</span>
                  </div>
                  <div className="flex items-center text-xs text-slate-300">
                    <Building2 className="w-4 h-4 text-blue-400 mr-2 shrink-0" />
                    <span>{portalStats?.webpage?.registeredChapters || 12} Grassroots Regional Chapters</span>
                  </div>
                  <div className="flex items-center text-xs text-slate-300">
                    <Radio className="w-4 h-4 text-red-400 mr-2 shrink-0" />
                    <span>YARA Live & Outreach Media Galleries</span>
                  </div>
                  <div className="flex items-center text-xs text-slate-300">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 mr-2 shrink-0" />
                    <span>Donations & Universal EcoCash/Card Gateways</span>
                  </div>
                </div>
              </div>

              {/* Bottom Metrics & Action */}
              <div className="mt-8 pt-5 border-t border-slate-800">
                <div className="grid grid-cols-2 gap-2 mb-4 text-center">
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                    <p className="text-base font-black text-white">{portalStats?.webpage?.totalOutreachStudents || '1,420+'}</p>
                    <p className="text-[10px] text-slate-400 uppercase font-semibold">Innovators Reached</p>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                    <p className="text-base font-black text-white">{portalStats?.webpage?.activeCompetitions || '3'}</p>
                    <p className="text-[10px] text-slate-400 uppercase font-semibold">Active Tournaments</p>
                  </div>
                </div>

                <button
                  type="button"
                  className={cn(
                    "w-full py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2",
                    portalMode === 'webpage'
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30 hover:bg-blue-500"
                      : "bg-slate-800 text-slate-200 hover:bg-blue-600 hover:text-white"
                  )}
                >
                  <span>Enter YARA Webpage</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Gateway 2: YARA Learning Academy */}
            <div 
              onClick={handleSelectLms}
              className={cn(
                "group relative rounded-2xl border p-6 flex flex-col justify-between transition-all duration-300 cursor-pointer overflow-hidden",
                portalMode === 'lms' 
                  ? "bg-gradient-to-b from-indigo-950/40 via-slate-900 to-slate-900 border-emerald-500 shadow-xl shadow-emerald-950/50 ring-2 ring-emerald-500/20" 
                  : "bg-slate-950/50 border-slate-800 hover:border-emerald-500/60 hover:bg-slate-900/80"
              )}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-emerald-500/20 transition-all" />

              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                    <GraduationCap className="w-6 h-6" />
                  </div>
                  <span className="px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    Learning Academy
                  </span>
                </div>

                <h3 className="text-xl font-bold text-white group-hover:text-emerald-400 transition-colors flex items-center gap-2">
                  YARA Learning Academy
                  <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Rigorous robotics and embedded engineering curriculum. Stream 42 structured sessions across 4 progression tiers, simulate circuits on Wokwi, match with industrial mentors, and earn accredited certificates.
                </p>

                {/* Key Highlights */}
                <div className="mt-5 space-y-2.5">
                  <div className="flex items-center text-xs text-slate-300">
                    <BookOpen className="w-4 h-4 text-emerald-400 mr-2 shrink-0" />
                    <span>42 Structured Engineering Sessions (4 Progression Tiers)</span>
                  </div>
                  <div className="flex items-center text-xs text-slate-300">
                    <Cpu className="w-4 h-4 text-indigo-400 mr-2 shrink-0" />
                    <span>Interactive Wokwi Circuit & Firmware Simulator</span>
                  </div>
                  <div className="flex items-center text-xs text-slate-300">
                    <Award className="w-4 h-4 text-amber-400 mr-2 shrink-0" />
                    <span>Verifiable Accredited YARA Certificates</span>
                  </div>
                  <div className="flex items-center text-xs text-slate-300">
                    <Users className="w-4 h-4 text-sky-400 mr-2 shrink-0" />
                    <span>1-on-1 Faculty Mentorship & Smart Matching</span>
                  </div>
                </div>
              </div>

              {/* Bottom Metrics & Action */}
              <div className="mt-8 pt-5 border-t border-slate-800">
                <div className="grid grid-cols-2 gap-2 mb-4 text-center">
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                    <p className="text-base font-black text-white">{portalStats?.lms?.totalSessions || 42}</p>
                    <p className="text-[10px] text-slate-400 uppercase font-semibold">Video Sessions</p>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                    <p className="text-base font-black text-white">{portalStats?.lms?.avgStudentRating ? `${portalStats.lms.avgStudentRating}/5.0` : '4.93/5.0'}</p>
                    <p className="text-[10px] text-slate-400 uppercase font-semibold">Student Satisfaction</p>
                  </div>
                </div>

                <button
                  type="button"
                  className={cn(
                    "w-full py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2",
                    portalMode === 'lms'
                      ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 hover:bg-emerald-500"
                      : "bg-slate-800 text-slate-200 hover:bg-emerald-600 hover:text-white"
                  )}
                >
                  <span>Launch YARA LMS</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Footer note */}
          <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
            <span className="flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              <span>Backend Express Engine Status: Operational on Port 5000</span>
            </span>
            <span>You can toggle between the Webpage and LMS anytime using the portal switcher in the navigation.</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
