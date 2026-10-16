import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { 
  Home, User, Briefcase, Users, 
  LogOut, Menu, X, Calendar, BookOpen, 
  MessageSquare, ShieldCheck, 
  BarChart3, Brain, Trophy, 
  Building2, GraduationCap, Globe, 
  QrCode, ArrowRight, Sparkles
} from 'lucide-react';
import { safeSignOut } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { ASSETS } from '../constants/assets';
import { OfflineBanner } from './OfflineBanner';
import { RuralDataSaverToggle } from './RuralDataSaverToggle';
import MobileBottomNav from './public/MobileBottomNav';
import { NotificationBell } from './notifications/NotificationCenter';
import SponsorPopups from './public/SponsorPopups';

interface NavItem {
  path: string;
  icon: any;
  label: string;
  badge?: string;
  adminOnly?: boolean;
  teacherOnly?: boolean;
  section?: string;
}

// Streamlined, categorized navigation structure
interface NavSection {
  title: string;
  items: NavItem[];
}

const categorizedNavSections: NavSection[] = [
  {
    title: 'LEARNING',
    items: [
      { path: '/dashboard', icon: BarChart3, label: 'Dashboard' },
      { path: '/learning', icon: Brain, label: 'Robotics Courses', badge: 'L0–L8' },
      { path: '/projects', icon: Briefcase, label: 'Hardware Projects' },
    ]
  },
  {
    title: 'COMMUNITY & ARENA',
    items: [
      { path: '/competitions', icon: Trophy, label: 'Competitions & Arena' },
      { path: '/mentorship', icon: Users, label: 'Mentorship' },
      { path: '/events', icon: Calendar, label: 'Events & Bootcamps' },
      { path: '/chapters', icon: Building2, label: 'Chapters & Clubs' },
    ]
  },
  {
    title: 'TOOLS & SUPPORT',
    items: [
      { path: '/library', icon: BookOpen, label: 'Resource Library' },
      { path: '/verify-certificate', icon: QrCode, label: 'Verify Certificate' },
      { path: '/feedback', icon: MessageSquare, label: 'Feedback & Reviews' },
    ]
  },
  {
    title: 'MANAGEMENT',
    items: [
      { path: '/educator-portal', icon: ShieldCheck, label: 'Teacher / Patron Hub', teacherOnly: true },
      { path: '/admin', icon: ShieldCheck, label: 'Admin Console', adminOnly: true },
    ]
  }
];

export default function Layout() {
  const location = useLocation();
  const { profile, signOut } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const handleLogout = async () => {
    if (signOut) {
      await signOut();
    } else {
      await safeSignOut();
      window.location.href = '/auth';
    }
  };

  const isAdmin = profile?.role === 'admin';
  const isTeacherOrAdmin = profile?.role === 'teacher' || profile?.role === 'mentor' || profile?.role === 'admin' || isAdmin;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 sticky top-0 h-screen shrink-0">
        {/* Brand Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-9 h-9 rounded-xl bg-slate-950 border border-slate-800 shadow-xs flex items-center justify-center text-white overflow-hidden p-0.5 group-hover:scale-105 transition-all">
              {ASSETS.LOGO ? (
                <img src={ASSETS.LOGO} alt="YARA" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
              ) : (
                <span className="text-lg font-black tracking-tighter text-amber-400">Y</span>
              )}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-sm font-black text-slate-900 tracking-tight leading-none">YARA</h1>
                <span className="text-[8px] font-bold px-1.5 py-0.2 rounded uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-200">
                  Africa
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium mt-0.5 truncate max-w-[130px]">
                Robotics &amp; AI Academy
              </p>
            </div>
          </Link>

          <NotificationBell />
        </div>

        {/* Clean Structured Navigation Items */}
        <nav className="flex-1 px-3 py-3 space-y-4 overflow-y-auto">
          {categorizedNavSections.map((section) => {
            const visibleItems = section.items.filter(
              item => (!item.adminOnly || isAdmin) && (!item.teacherOnly || isTeacherOrAdmin)
            );
            if (visibleItems.length === 0) return null;

            return (
              <div key={section.title} className="space-y-1">
                <div className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  {section.title}
                </div>
                <div className="space-y-0.5">
                  {visibleItems.map((item) => {
                    const isActive = location.pathname === item.path || 
                      (item.path !== '/' && location.pathname.startsWith(item.path));

                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        className={cn(
                          "flex items-center justify-between px-3 py-2 rounded-xl transition-colors duration-150 text-xs font-medium",
                          isActive
                            ? "bg-slate-900 text-white font-semibold shadow-xs"
                            : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
                        )}
                      >
                        <div className="flex items-center space-x-2.5 min-w-0">
                          <item.icon className={cn(
                            "w-4 h-4 shrink-0",
                            isActive ? "text-amber-400" : "text-slate-400"
                          )} />
                          <span className="truncate">{item.label}</span>
                        </div>

                        {item.badge && (
                          <span className={cn(
                            "px-2 py-0.5 rounded-full text-[9px] font-bold shrink-0",
                            isActive
                              ? "bg-amber-400/20 text-amber-300"
                              : "bg-amber-50 text-amber-800 border border-amber-200/60"
                          )}>
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        {/* User Footer */}
        <div className="p-3 border-t border-slate-100 bg-white space-y-2">
          <RuralDataSaverToggle variant="switch" />
          <div className="flex items-center space-x-2.5 px-2 py-1">
            <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 font-bold text-xs overflow-hidden border border-slate-200 shrink-0">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt={profile.display_name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                profile?.display_name?.[0] || 'U'
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-900 truncate">{profile?.display_name || 'Innovator'}</p>
              <p className="text-[10px] text-slate-400 truncate capitalize">{(profile as any)?.chapter_position || profile?.role || 'Member'}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 px-3 py-1.5 w-full rounded-lg text-xs text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors duration-150 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden bg-white border-b border-slate-200 px-4 py-2.5 flex items-center justify-between sticky top-0 z-40">
        <Link to="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-slate-950 rounded-lg flex items-center justify-center text-white overflow-hidden p-0.5 border border-slate-800">
            {ASSETS.LOGO ? (
              <img src={ASSETS.LOGO} alt="YARA" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
            ) : (
              <span className="text-sm font-black">Y</span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-sm font-bold text-slate-900 leading-none">YARA</h1>
              <span className="text-[8px] font-bold px-1 py-0.5 rounded uppercase bg-blue-100 text-blue-800">
                AFRICA
              </span>
            </div>
            <p className="text-[9px] text-slate-500 font-semibold">Robotics &amp; LMS Ecosystem</p>
          </div>
        </Link>

        <div className="flex items-center space-x-1.5">
          <NotificationBell />
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label="Toggle Navigation Menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden fixed inset-0 z-40 bg-white pt-16 overflow-y-auto"
          >
            {/* Quick Academy Link */}
            <div className="p-4 bg-slate-50 border-b border-slate-100">
              <Link
                to="/learning"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs"
              >
                <Brain className="w-4 h-4" />
                <span>Open Robotics Academy (LMS)</span>
              </Link>
            </div>

            <nav className="p-4 space-y-4">
              {categorizedNavSections.map((section) => {
                const visibleItems = section.items.filter(
                  item => (!item.adminOnly || isAdmin) && (!item.teacherOnly || isTeacherOrAdmin)
                );
                if (visibleItems.length === 0) return null;

                return (
                  <div key={section.title} className="space-y-1">
                    <div className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                      {section.title}
                    </div>
                    <div className="space-y-1">
                      {visibleItems.map((item) => {
                        const isActive = location.pathname === item.path || 
                          (item.path !== '/' && location.pathname.startsWith(item.path));
                        return (
                          <Link
                            key={item.path}
                            to={item.path}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={cn(
                              "flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all duration-200 text-xs font-semibold",
                              isActive
                                ? "bg-slate-900 text-white shadow-xs"
                                : "text-slate-600 hover:bg-slate-100"
                            )}
                          >
                            <div className="flex items-center space-x-2.5">
                              <item.icon className={cn("w-4 h-4", isActive ? "text-amber-400" : "text-slate-400")} />
                              <span>{item.label}</span>
                            </div>
                            {item.badge && (
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-amber-100 text-amber-800">
                                {item.badge}
                              </span>
                            )}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  handleLogout();
                }}
                className="flex items-center space-x-3 px-4 py-3 w-full rounded-2xl text-red-600 hover:bg-red-50 transition-colors duration-200 mt-4 text-xs font-bold"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto relative pb-16 md:pb-0">
        <OfflineBanner />
        <main className="flex-1 p-4 md:p-8">
          <div className="max-w-6xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
      <MobileBottomNav />
    </div>
  );
}

