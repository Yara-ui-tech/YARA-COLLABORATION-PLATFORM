import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Shield, Heart, Users, FileText, PhoneCall, 
  Sparkles, Award, Lock, BookOpen, AlertCircle, Compass
} from 'lucide-react';
import { cn } from '../../lib/utils';

export default function SafeguardingNav() {
  const location = useLocation();

  const links = [
    { label: 'Overview', path: '/safeguarding', icon: Compass },
    { label: 'Report Concern', path: '/safeguarding/report', icon: AlertCircle, highlight: true },
    { label: 'Track Report', path: '/safeguarding/track', icon: Lock },
    { label: 'Child Protection', path: '/safeguarding/child-protection', icon: Shield },
    { label: 'GBV Prevention', path: '/safeguarding/gbv', icon: Heart },
    { label: 'Mental Wellbeing', path: '/safeguarding/wellbeing', icon: Sparkles },
    { label: 'Emergency Helplines', path: '/safeguarding/emergency', icon: PhoneCall },
    { label: 'Policies & Library', path: '/safeguarding/resources', icon: BookOpen },
    { label: 'Campaigns', path: '/safeguarding/campaigns', icon: Award },
    { label: 'Partners', path: '/safeguarding/partners', icon: Users },
    { label: 'Chapter Safety', path: '/safeguarding/chapters', icon: FileText }
  ];

  return (
    <div className="bg-slate-900/90 border-b border-slate-800 backdrop-blur-md sticky top-20 z-40 py-2.5 px-4 overflow-x-auto scrollbar-none">
      <div className="max-w-7xl mx-auto flex items-center gap-1.5 sm:gap-2 min-w-max">
        {links.map(item => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border",
                item.highlight
                  ? isActive
                    ? "bg-red-600 text-white border-red-500 shadow-lg shadow-red-600/30"
                    : "bg-red-500/10 text-red-400 border-red-500/30 hover:bg-red-500/20"
                  : isActive
                    ? "bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/25"
                    : "bg-slate-950/60 text-slate-300 hover:text-white hover:bg-slate-800 border-slate-800"
              )}
            >
              <Icon className={cn("w-3.5 h-3.5", item.highlight && !isActive ? "text-red-400" : "")} />
              <span>{item.label}</span>
            </Link>
          );
        })}

        <div className="border-l border-slate-800 pl-2 ml-1">
          <Link
            to="/safeguarding/admin"
            className={cn(
              "px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border",
              location.pathname === '/safeguarding/admin'
                ? "bg-amber-400 text-slate-950 border-amber-300 shadow-md font-black"
                : "bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20"
            )}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Officer Portal</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
