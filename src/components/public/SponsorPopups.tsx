import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, HeartHandshake, ExternalLink, X, Building2, Award, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export interface SponsorPopupItem {
  id: string;
  name: string;
  tier: string;
  badgeColor: string;
  message: string;
  impactTag: string;
  logoUrl?: string;
  websiteUrl?: string;
}

const DEFAULT_SPONSORS: SponsorPopupItem[] = [
  {
    id: 'sp_liquid',
    name: 'Liquid Intelligent Technologies',
    tier: 'Platinum Connectivity Sponsor',
    badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
    message: 'Empowering Pan-African youth with high-speed cloud telemetry and low-latency robotics competition servers.',
    impactTag: 'High-Speed Fiber Telemetry',
    websiteUrl: 'https://liquid.tech'
  },
  {
    id: 'sp_hit',
    name: 'Harare Institute of Technology (HIT)',
    tier: 'Premier Academic & Lab Partner',
    badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
    message: 'Providing state-of-the-art mechatronics testing labs and joint engineering curriculum accreditation.',
    impactTag: 'Hardware Testing & Fabrication',
    websiteUrl: 'https://hit.ac.zw'
  },
  {
    id: 'sp_stem_africa',
    name: 'STEM For Africa Initiative',
    tier: 'Hardware Grant & Lab Kits Partner',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    message: 'Co-funding 150+ Arduino & ESP32 starter kits for underserved rural schools and girl-led STEM clubs.',
    impactTag: '150+ School Starter Kits',
    websiteUrl: '/donate'
  },
  {
    id: 'sp_cut',
    name: 'Chinhoyi University of Technology (CUT)',
    tier: 'Provincial Lead & Innovation Hub',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    message: 'Hosting provincial robotics hackathons and providing hands-on university engineering mentors.',
    impactTag: 'Provincial Arena Host',
    websiteUrl: 'https://cut.ac.zw'
  },
  {
    id: 'sp_econet',
    name: 'Econet Wireless Zimbabwe',
    tier: 'Digital Inclusion & Connectivity Partner',
    badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
    message: 'Supporting zero-rated educational data access and mobile IoT telemetry across Zimbabwe.',
    impactTag: 'Zero-Rated STEM Data',
    websiteUrl: '/partners'
  }
];

export default function SponsorPopups() {
  const [sponsors, setSponsors] = useState<SponsorPopupItem[]>(DEFAULT_SPONSORS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  // Load any custom approved partners or sponsors from local/backend cache
  useEffect(() => {
    try {
      const stored = localStorage.getItem('yara_approved_partners_cache');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const mapped: SponsorPopupItem[] = parsed.slice(0, 5).map((p: any, idx: number) => ({
            id: p.id || `custom_sp_${idx}`,
            name: p.organization_name || p.name || 'Official Partner',
            tier: p.partnership_type || 'Strategic Partner',
            badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
            message: p.expectations || 'Backing young African innovators and robotics education across Zimbabwe.',
            impactTag: p.specialty_area || 'STEM Education',
            logoUrl: p.logo_url,
            websiteUrl: p.website_url || '/partners'
          }));
          setSponsors([...DEFAULT_SPONSORS, ...mapped]);
        }
      }
    } catch {}
  }, []);

  // Check if previously dismissed
  useEffect(() => {
    try {
      if (localStorage.getItem('yara_hide_sponsor_popups') === 'true') {
        setIsDismissed(true);
      }
    } catch {}
  }, []);

  // Show only once gently after 12 seconds if not previously dismissed
  useEffect(() => {
    if (isDismissed) return;

    const initialTimer = setTimeout(() => {
      setIsVisible(true);
    }, 12000);

    return () => clearTimeout(initialTimer);
  }, [isDismissed]);

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
    try {
      localStorage.setItem('yara_hide_sponsor_popups', 'true');
    } catch {}
  };

  if (isDismissed || sponsors.length === 0) return null;

  const current = sponsors[currentIndex % sponsors.length];

  return (
    <aside
      aria-label="Sponsor and partner notifications"
      className="hidden md:block fixed bottom-6 left-6 z-40 max-w-sm pointer-events-none"
    >
      <AnimatePresence>
        {isVisible && current && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            className="pointer-events-auto bg-slate-900/95 backdrop-blur-xl border border-indigo-500/30 rounded-2xl p-4 shadow-2xl text-white relative overflow-hidden ring-1 ring-white/10"
          >
            {/* Subtle glow accent */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

            {/* Header with badge & dismiss button */}
            <div className="flex items-center justify-between gap-2 mb-2 relative z-10">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  Partner Spotlight
                </span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={handleDismiss}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                  title="Dismiss partner spotlight"
                  aria-label="Dismiss sponsor message"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Sponsor Info */}
            <div className="space-y-1.5 relative z-10">
              <div className="flex items-start gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-900 to-slate-800 border border-indigo-400/30 flex items-center justify-center shrink-0 text-white font-black text-xs overflow-hidden">
                  {current.logoUrl ? (
                    <img
                      src={current.logoUrl}
                      alt={current.name}
                      className="w-full h-full object-contain p-1"
                      referrerPolicy="no-referrer"
                      onError={(e: any) => { e.currentTarget.style.display = 'none'; }}
                    />
                  ) : (
                    <Building2 className="w-4 h-4 text-cyan-300" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <h4 className="font-bold text-xs text-white leading-tight truncate">
                    {current.name}
                  </h4>
                  <span className={`inline-block mt-0.5 px-2 py-0.5 rounded-full text-[9px] font-bold border ${current.badgeColor}`}>
                    {current.tier}
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-slate-300 leading-relaxed font-normal pt-1">
                "{current.message}"
              </p>

              {/* Impact Pill & Link */}
              <div className="pt-2 flex items-center justify-between gap-2 border-t border-slate-800/80">
                <span className="text-[10px] font-bold text-cyan-400 truncate">
                  ⚡ {current.impactTag}
                </span>

                {current.websiteUrl?.startsWith('http') ? (
                  <a
                    href={current.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] font-bold text-indigo-300 hover:text-white flex items-center gap-1 shrink-0 transition-colors"
                  >
                    <span>Visit Partner</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                ) : (
                  <Link
                    to="/partners"
                    className="text-[10px] font-bold text-indigo-300 hover:text-white flex items-center gap-1 shrink-0 transition-colors"
                  >
                    <span>Partner Hub</span>
                    <ArrowRight className="w-2.5 h-2.5" />
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </aside>
  );
}
