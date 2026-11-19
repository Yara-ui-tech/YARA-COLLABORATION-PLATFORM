import React from 'react';
import { PhoneCall, AlertTriangle, ShieldAlert, ExternalLink, X } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function EmergencyHelpBanner() {
  const handleQuickExit = () => {
    // Quick exit to protect someone browsing in an unsafe or monitored environment
    window.location.replace('https://www.google.com');
  };

  return (
    <div className="bg-gradient-to-r from-red-950 via-slate-900 to-indigo-950 border-b border-red-500/30 text-white py-3 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3 text-xs sm:text-sm">
          <div className="w-8 h-8 rounded-full bg-red-500/20 text-red-400 border border-red-500/40 flex items-center justify-center shrink-0 animate-pulse">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <span className="font-black text-red-400 uppercase tracking-wider text-[11px] block">
              Immediate Danger or Active Harm?
            </span>
            <p className="text-slate-300 text-xs">
              Online reporting is not an emergency dispatch service. For immediate rescue, call{' '}
              <a href="tel:116" className="font-black text-amber-400 underline hover:text-amber-300">
                Childline: 116
              </a>{' '}
              or{' '}
              <a href="tel:08080074" className="font-black text-emerald-400 underline hover:text-emerald-300">
                Musasa GBV: 0808 0074
              </a>{' '}
              (Both 100% Toll-Free, 24/7).
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 text-xs">
          <Link
            to="/safeguarding/emergency"
            className="px-3 py-1.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 font-bold transition flex items-center gap-1.5"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>Emergency Directory</span>
          </Link>

          <button
            onClick={handleQuickExit}
            title="Leaves this page immediately and opens a generic search engine"
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 font-bold transition flex items-center gap-1 cursor-pointer"
          >
            <span>Quick Safety Exit</span>
            <X className="w-3.5 h-3.5 text-red-400" />
          </button>
        </div>
      </div>
    </div>
  );
}
