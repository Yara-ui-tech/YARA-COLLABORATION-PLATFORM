import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Menu, X, ChevronDown, GraduationCap, Trophy, Calendar, 
  Sparkles, Layers, ShieldCheck, ArrowRight, User, BookOpen, 
  ExternalLink, Users, Phone
} from 'lucide-react';
import { useAuth } from '../AuthContext';
import { ASSETS } from '../../constants/assets';
import { NotificationBell } from '../notifications/NotificationCenter';
import { cn } from '../../lib/utils';

export default function PublicHeader() {
  const location = useLocation();
  const { user, profile } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProgrammesDropdownOpen, setIsProgrammesDropdownOpen] = useState(false);

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'About', path: '/about' },
    { 
      label: 'Programmes', 
      path: '/programs',
      hasDropdown: true,
      subItems: [
        { label: 'All Programmes Overview', path: '/programs' },
        { label: 'Robotics Engineering', path: '/programs?track=robotics' },
        { label: 'Artificial Intelligence & IoT', path: '/programs?track=ai-iot' },
        { label: 'STEM Education & School Clubs', path: '/programs?track=stem' },
        { label: 'Coding & Firmware Development', path: '/programs?track=coding' },
        { label: 'Digital Literacy & Innovation', path: '/programs?track=digital-literacy' }
      ]
    },
    { label: 'Competitions', path: '/competitions' },
    { label: 'Training', path: '/training' },
    { label: 'Events', path: '/events' },
    { label: 'Impact', path: '/impact' },
    { label: 'Projects', path: '/projects' },
    { label: 'Partners', path: '/partners' },
    { label: 'News', path: '/posts' },
    { label: 'Contact', path: '/contact' },
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 text-white transition-all">
      {/* Top Banner Ticker */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-blue-200 text-xs py-1.5 px-4 text-center border-b border-blue-800/40">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 truncate">
            <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-[10px] uppercase tracking-wider">
              2026 Season
            </span>
            <span className="truncate hidden sm:inline">
              Young Africans Robotics Association — <em>"Innovate Local, Build Global"</em>
            </span>
            <span className="sm:hidden truncate font-semibold">
              YARA • Innovate Local, Build Global
            </span>
          </div>
          <div className="flex items-center gap-3 shrink-0 text-[11px] font-semibold text-blue-300">
            <Link to="/verify-certificate" className="hover:text-white flex items-center gap-1 transition-colors">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>Verify Certificate</span>
            </Link>
            <span className="text-slate-600">|</span>
            <Link to="/competitions/yara-2026" className="text-amber-400 hover:text-amber-300 flex items-center gap-1 font-bold">
              <Trophy className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Championship 2026</span>
              <span className="md:hidden">Arena</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Brand Identity */}
          <Link to="/" className="flex items-center gap-3.5 group shrink-0">
            <div className="w-12 h-12 rounded-2xl bg-white p-1 flex items-center justify-center shadow-lg shadow-blue-500/10 border border-slate-700/60 group-hover:scale-105 transition-all overflow-hidden">
              <img 
                src={ASSETS.LOGO} 
                alt="Young Africans Robotics Association (YARA)" 
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl sm:text-2xl font-black tracking-tight text-white group-hover:text-blue-400 transition-colors">
                  YARA
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  AFRICA
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-slate-400 font-medium tracking-wide truncate max-w-[210px] sm:max-w-none">
                Young Africans Robotics Association
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden xl:flex items-center space-x-1 font-semibold text-xs">
            {navLinks.map((item) => {
              if (item.hasDropdown) {
                return (
                  <div 
                    key={item.label}
                    className="relative"
                    onMouseEnter={() => setIsProgrammesDropdownOpen(true)}
                    onMouseLeave={() => setIsProgrammesDropdownOpen(false)}
                  >
                    <Link
                      to={item.path}
                      className={cn(
                        "px-3 py-2 rounded-xl flex items-center gap-1 transition-all",
                        isActive(item.path)
                          ? "text-blue-400 bg-blue-950/60 font-bold"
                          : "text-slate-300 hover:text-white hover:bg-slate-900"
                      )}
                    >
                      <span>{item.label}</span>
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                    </Link>

                    {isProgrammesDropdownOpen && (
                      <div className="absolute left-0 mt-1 w-64 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95">
                        {item.subItems?.map((sub) => (
                          <Link
                            key={sub.label}
                            to={sub.path}
                            onClick={() => setIsProgrammesDropdownOpen(false)}
                            className="block px-3 py-2.5 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors"
                          >
                            {sub.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <Link
                  key={item.label}
                  to={item.path}
                  className={cn(
                    "px-3 py-2 rounded-xl transition-all",
                    isActive(item.path)
                      ? "text-blue-400 bg-blue-950/60 font-bold"
                      : "text-slate-300 hover:text-white hover:bg-slate-900"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Actions: Notifications + LMS Entrypoint + Join */}
          <div className="hidden sm:flex items-center gap-3">
            <NotificationBell />

            {user ? (
              <div className="flex items-center gap-2">
                <Link
                  to="/dashboard"
                  className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-lg shadow-emerald-950/40 transition-all hover:scale-105"
                >
                  <GraduationCap className="w-4 h-4" />
                  <span>My Dashboard</span>
                </Link>
                <Link
                  to="/profile"
                  className="p-2 rounded-xl bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800"
                  title="My Profile"
                >
                  <User className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <Link
                  to="/auth"
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-200 hover:text-white hover:bg-slate-900 border border-slate-800 transition-all flex items-center gap-1.5"
                >
                  <GraduationCap className="w-4 h-4 text-emerald-400" />
                  <span>LMS Login</span>
                </Link>

                <Link
                  to="/auth"
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider shadow-lg shadow-blue-900/40 transition-all hover:scale-105 flex items-center gap-1.5"
                >
                  <span>JOIN YARA</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="flex items-center gap-2 xl:hidden">
            <NotificationBell />
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="xl:hidden border-t border-slate-800 bg-slate-950 px-4 pt-3 pb-6 space-y-2 animate-in slide-in-from-top-4 duration-200">
          <div className="grid grid-cols-2 gap-2 pb-3 border-b border-slate-800">
            {user ? (
              <Link
                to="/dashboard"
                onClick={() => setIsMobileMenuOpen(false)}
                className="col-span-2 flex items-center justify-center gap-2 bg-emerald-600 text-white py-3 rounded-xl font-bold text-xs shadow-md"
              >
                <GraduationCap className="w-4 h-4" />
                <span>Go to LMS Dashboard</span>
              </Link>
            ) : (
              <>
                <Link
                  to="/auth"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 bg-slate-900 text-slate-200 py-3 rounded-xl font-bold text-xs border border-slate-800"
                >
                  <GraduationCap className="w-4 h-4 text-emerald-400" />
                  <span>LMS Login</span>
                </Link>
                <Link
                  to="/auth"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-xl font-black text-xs uppercase tracking-wider"
                >
                  <span>Join YARA</span>
                </Link>
              </>
            )}
          </div>

          <div className="grid grid-cols-2 gap-1 pt-2">
            {navLinks.map((item) => (
              <Link
                key={item.label}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={cn(
                  "px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors",
                  isActive(item.path)
                    ? "bg-blue-950 text-blue-400 font-bold"
                    : "text-slate-300 hover:bg-slate-900"
                )}
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <Link 
              to="/verify-certificate" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-amber-400 hover:underline flex items-center gap-1"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Verify Certificate</span>
            </Link>
            <Link 
              to="/competitions/yara-2026" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-blue-400 hover:underline"
            >
              YARA Arena 2026
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
