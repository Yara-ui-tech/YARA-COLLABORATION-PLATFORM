import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Menu, X, ChevronDown, GraduationCap, Trophy, Calendar, 
  Sparkles, Layers, ShieldCheck, ArrowRight, User, BookOpen, 
  ExternalLink, Users, Phone, Search, CreditCard, MessageSquare
} from 'lucide-react';
import { useAuth } from '../AuthContext';
import { ASSETS } from '../../constants/assets';
import { NotificationBell } from '../notifications/NotificationCenter';
import { RuralDataSaverToggle } from '../RuralDataSaverToggle';
import GlobalSearchModal from '../GlobalSearchModal';
import UniversalPaymentGatewayModal from '../payment/UniversalPaymentGatewayModal';
import { cn } from '../../lib/utils';

export default function PublicHeader() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProgrammesDropdownOpen, setIsProgrammesDropdownOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  // Smooth navigation for all-in-one unified page
  const handleNavClick = (e: React.MouseEvent, targetId?: string, fallbackPath?: string) => {
    if (targetId) {
      if (location.pathname === '/') {
        e.preventDefault();
        const el = document.getElementById(targetId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
          setIsMobileMenuOpen(false);
          return;
        }
      } else if (fallbackPath) {
        navigate(`/#${targetId}`);
        setIsMobileMenuOpen(false);
        return;
      }
    }
    if (fallbackPath) {
      navigate(fallbackPath);
      setIsMobileMenuOpen(false);
    }
  };

  // Streamlined primary navigation
  const navLinks = [
    { label: 'Home', path: '/', targetId: 'top' },
    { label: 'Academy', path: '/learn', targetId: 'lms' },
    { label: 'Competitions', path: '/competitions', targetId: 'competitions' },
    { label: 'School Clubs', path: '/chapters', targetId: 'clubs' },
    { label: 'Verify Cert', path: '/verify-certificate', targetId: 'verify' },
    { label: 'Contact', path: '/contact', targetId: 'contact' },
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 text-white transition-all">
      {/* Top Banner Ticker */}
      <div className="bg-gradient-to-r from-blue-900/80 via-indigo-900/60 to-slate-900 text-blue-200 text-xs py-1.5 px-4 text-center border-b border-blue-800/40">
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
          <div className="flex items-center gap-2.5 shrink-0 text-[11px] font-semibold text-blue-300">
            <RuralDataSaverToggle variant="badge" />
            <span className="text-slate-600 hidden sm:inline">|</span>
            <Link to="/verify-certificate" className="hover:text-white flex items-center gap-1 transition-colors hidden sm:flex">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>Verify Certificate</span>
            </Link>
            <span className="text-slate-600 hidden sm:inline">|</span>
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
            <div className="w-11 h-11 rounded-2xl bg-white p-1 flex items-center justify-center shadow-lg shadow-blue-500/10 border border-slate-700/60 group-hover:scale-105 transition-all overflow-hidden">
              <img 
                src={ASSETS.LOGO} 
                alt="Young Africans Robotics Association (YARA)" 
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-black tracking-tight text-white group-hover:text-blue-400 transition-colors">
                  YARA
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  AFRICA
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium tracking-wide truncate max-w-[190px] sm:max-w-none">
                Young Africans Robotics Association
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1 font-semibold text-xs">
            {navLinks.map((item) => (
              <a
                key={item.label}
                href={item.targetId ? `#${item.targetId}` : item.path}
                onClick={(e) => handleNavClick(e, item.targetId, item.path)}
                className={cn(
                  "px-3 py-2 rounded-xl transition-all cursor-pointer",
                  isActive(item.path)
                    ? "text-blue-400 bg-blue-950/60 font-bold"
                    : "text-slate-300 hover:text-white hover:bg-slate-900"
                )}
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* Actions: Search + Quick Pay + Sign In / Join */}
          <div className="hidden lg:flex items-center gap-2">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 text-xs font-medium transition cursor-pointer"
              title="Search courses, library and chapters (Cmd+K)"
            >
              <Search className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden xl:inline">Search</span>
              <kbd className="hidden xl:inline px-1 py-0.5 bg-slate-800 border border-slate-700 text-[9px] text-slate-400 rounded">⌘K</kbd>
            </button>

            <NotificationBell />

            {/* Pay Online Quick Button */}
            <button
              onClick={() => setIsPaymentModalOpen(true)}
              className="px-3 py-1.5 rounded-xl text-xs font-bold text-emerald-300 hover:text-white bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-500/30 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="Pay Online for Kits, Subscriptions & Dues"
            >
              <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden xl:inline">Pay Online</span>
            </button>

            {user ? (
              <div className="flex items-center gap-2 ml-1">
                <Link
                  to="/dashboard"
                  className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-3.5 py-2 rounded-xl font-bold text-xs shadow-md transition-all hover:scale-102"
                >
                  <GraduationCap className="w-4 h-4" />
                  <span>Dashboard</span>
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
              <div className="flex items-center gap-2 ml-1">
                <a
                  href="#auth-box"
                  onClick={(e) => handleNavClick(e, 'auth-box', '/auth')}
                  className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-900 transition-all cursor-pointer"
                >
                  <span>Sign In</span>
                </a>

                <a
                  href="#auth-box"
                  onClick={(e) => handleNavClick(e, 'auth-box', '/auth')}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-4 py-2 rounded-xl font-black text-xs uppercase tracking-wider shadow-md shadow-blue-900/30 transition-all hover:scale-102 flex items-center gap-1.5 shrink-0 cursor-pointer"
                >
                  <span>JOIN YARA</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="flex items-center gap-1.5 lg:!hidden">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
              title="Search"
            >
              <Search className="w-5 h-5 text-blue-400" />
            </button>
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
        <div className="lg:!hidden border-t border-slate-800 bg-slate-950 px-4 pt-3 pb-6 space-y-2 animate-in slide-in-from-top-4 duration-200">
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
                <a
                  href="#auth-box"
                  onClick={(e) => handleNavClick(e, 'auth-box', '/auth')}
                  className="flex items-center justify-center gap-2 bg-slate-900 text-slate-200 py-3 rounded-xl font-bold text-xs border border-slate-800 cursor-pointer"
                >
                  <GraduationCap className="w-4 h-4 text-emerald-400" />
                  <span>LMS Login</span>
                </a>
                <a
                  href="#auth-box"
                  onClick={(e) => handleNavClick(e, 'auth-box', '/auth')}
                  className="flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-xl font-black text-xs uppercase tracking-wider cursor-pointer"
                >
                  <span>Join YARA</span>
                </a>
              </>
            )}
          </div>

          <div className="grid grid-cols-2 gap-1 pt-2">
            {navLinks.map((item) => (
              <a
                key={item.label}
                href={item.targetId ? `#${item.targetId}` : item.path}
                onClick={(e) => handleNavClick(e, item.targetId, item.path)}
                className={cn(
                  "px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer",
                  isActive(item.path)
                    ? "bg-blue-950 text-blue-400 font-bold"
                    : "text-slate-300 hover:bg-slate-900"
                )}
              >
                {item.label}
              </a>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <a 
              href="#verify" 
              onClick={(e) => handleNavClick(e, 'verify', '/verify-certificate')}
              className="text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Verify Certificate</span>
            </a>
            <a 
              href="#competitions" 
              onClick={(e) => handleNavClick(e, 'competitions', '/competitions/yara-2026')}
              className="text-blue-400 hover:underline cursor-pointer"
            >
              YARA Arena 2026
            </a>
          </div>
        </div>
      )}

      <GlobalSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      <UniversalPaymentGatewayModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
      />
    </header>
  );
}
