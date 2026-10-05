import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, User, Lightbulb, Briefcase, Users, CreditCard, 
  LogOut, Menu, X, Calendar, BookOpen, ShieldAlert, 
  MessageSquare, ShieldCheck, Info, Cpu, BarChart3, 
  Handshake, Phone, Brain, Trophy, Heart, UserCheck,
  Award, MonitorPlay, QrCode, DollarSign, Radio, Building2,
  GraduationCap, Camera, Globe, ArrowRight, Layers
} from 'lucide-react';
import { safeSignOut } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { usePortal } from '../context/PortalContext';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { ASSETS } from '../constants/assets';
import { OfflineBanner } from './OfflineBanner';

interface NavItem {
  path: string;
  icon: any;
  label: string;
  badge?: string;
  adminOnly?: boolean;
}

const webpageNavItems: NavItem[] = [
  { path: '/', icon: Home, label: 'Home' },
  { path: '/impact-gallery', icon: Camera, label: 'Impact Gallery', badge: 'Outreach' },
  { path: '/live', icon: Radio, label: 'YARA Live', badge: 'Stream' },
  { path: '/kids', icon: Heart, label: 'YARA Kids', badge: 'Ages 3-8' },
  { path: '/competitions', icon: Trophy, label: 'Competitions', badge: 'Championship' },
  { path: '/events', icon: Calendar, label: 'Events & Bootcamps' },
  { path: '/chapters', icon: Building2, label: 'YARA Chapters', badge: '12 Hubs' },
  { path: '/ideas', icon: Lightbulb, label: 'Ideas Hub' },
  { path: '/posts', icon: Radio, label: 'Organization Feed' },
  { path: '/projects', icon: Briefcase, label: 'Hardware Projects' },
  { path: '/resources', icon: BookOpen, label: 'Resources' },
  { path: '/about', icon: Info, label: 'About YARA' },
  { path: '/contact', icon: Phone, label: 'Contact & Inquiries' },
  { path: '/profile', icon: User, label: 'Profile' },
  { path: '/admin', icon: ShieldCheck, label: 'Admin Console', adminOnly: true },
];

const lmsNavItems: NavItem[] = [
  { path: '/learning', icon: Brain, label: 'YARA Learning Academy', badge: '42 Sessions' },
  { path: '/curriculum', icon: BookOpen, label: 'Curriculum & Tracks' },
  { path: '/mentorship', icon: Users, label: 'Industrial Mentorship', badge: 'Faculty' },
  { path: '/verify-certificate', icon: QrCode, label: 'Verify Credentials', badge: 'Accredited' },
  { path: '/projects', icon: Briefcase, label: 'Hardware Capstones' },
  { path: '/posts', icon: Radio, label: 'Academic Announcements' },
  { path: '/profile', icon: User, label: 'My Learning Profile' },
  { path: '/admin', icon: ShieldCheck, label: 'Admin Console', adminOnly: true },
];

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();
  const { portalMode, setPortalMode, openPortalSelector } = usePortal();
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
  const currentNavItems = portalMode === 'lms' ? lmsNavItems : webpageNavItems;

  const handleSwitchToLms = () => {
    setPortalMode('lms');
    navigate('/learning');
  };

  const handleSwitchToWebpage = () => {
    setPortalMode('webpage');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-72 bg-white border-r border-slate-200 sticky top-0 h-screen shrink-0">
        {/* Brand Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <Link to={portalMode === 'lms' ? '/learning' : '/'} className="flex items-center space-x-3 group">
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md transition-all overflow-hidden p-0.5",
              portalMode === 'lms'
                ? "bg-slate-950 border border-emerald-500/40 shadow-emerald-900/20"
                : "bg-slate-950 border border-blue-500/40 shadow-blue-900/20"
            )}>
              {ASSETS.LOGO ? (
                <img src={ASSETS.LOGO} alt="YARA" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
              ) : (
                <span className="text-xl font-black tracking-tighter text-blue-400">Y</span>
              )}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-base font-black text-slate-900 tracking-tight leading-none">YARA</h1>
                <span className={cn(
                  "text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider",
                  portalMode === 'lms' ? "bg-emerald-100 text-emerald-800" : "bg-blue-100 text-blue-800"
                )}>
                  {portalMode === 'lms' ? 'LMS' : 'Web'}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-semibold mt-0.5">
                {portalMode === 'lms' ? 'YARA Learning Academy' : 'Robotics Ecosystem'}
              </p>
            </div>
          </Link>

          <button
            onClick={openPortalSelector}
            title="Open Gateway Switcher"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <Layers className="w-4 h-4" />
          </button>
        </div>

        {/* Dual-Portal Mode Switcher Segmented Control */}
        <div className="px-3 py-2.5 bg-slate-50/80 border-b border-slate-100">
          <div className="flex items-center justify-between mb-1.5 px-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Select Platform Mode</span>
            <button 
              onClick={openPortalSelector}
              className="text-[10px] font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-0.5"
            >
              <span>Selector</span>
              <ArrowRight className="w-2.5 h-2.5" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-1 p-1 bg-slate-200/70 rounded-xl">
            <button
              onClick={handleSwitchToWebpage}
              className={cn(
                "flex items-center justify-center space-x-1.5 py-1.5 px-2 rounded-lg text-xs font-bold transition-all",
                portalMode === 'webpage'
                  ? "bg-white text-blue-700 shadow-xs border border-slate-200/80"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
              )}
            >
              <Globe className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Webpage</span>
            </button>
            <button
              onClick={handleSwitchToLms}
              className={cn(
                "flex items-center justify-center space-x-1.5 py-1.5 px-2 rounded-lg text-xs font-bold transition-all",
                portalMode === 'lms'
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
              )}
            >
              <GraduationCap className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">YARA LMS</span>
            </button>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {currentNavItems
            .filter(item => !item.adminOnly || isAdmin)
            .map((item) => {
              const isActive = location.pathname === item.path || 
                (item.path !== '/' && location.pathname.startsWith(item.path));
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center justify-between px-3 py-2 rounded-xl transition-all duration-200 group text-xs",
                    isActive
                      ? portalMode === 'lms'
                        ? "bg-emerald-50 text-emerald-800 font-bold border-l-4 border-emerald-600"
                        : "bg-blue-50 text-blue-700 font-bold border-l-4 border-blue-600"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium"
                  )}
                >
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <item.icon className={cn(
                      "w-4 h-4 shrink-0 transition-transform duration-200 group-hover:scale-110",
                      isActive 
                        ? portalMode === 'lms' ? "text-emerald-600" : "text-blue-600"
                        : "text-slate-400"
                    )} />
                    <span className="truncate">{item.label}</span>
                  </div>

                  {item.badge && (
                    <span className={cn(
                      "px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider shrink-0",
                      portalMode === 'lms'
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-amber-100 text-amber-800"
                    )}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}

          {/* Quick Context Card */}
          <div className="pt-4">
            {portalMode === 'webpage' ? (
              <div 
                onClick={handleSwitchToLms}
                className="p-3 bg-gradient-to-br from-emerald-950/90 to-slate-900 rounded-xl text-white cursor-pointer hover:shadow-md transition-all group border border-emerald-800/40"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                    <GraduationCap className="w-3 h-3" />
                    YARA Learning Academy
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-emerald-400 group-hover:translate-x-1 transition-transform" />
                </div>
                <p className="text-xs font-bold text-white leading-tight">Master Robotics & Automation</p>
                <p className="text-[10px] text-slate-300 mt-1">42 curriculum sessions, simulator lab, and accredited certificates.</p>
              </div>
            ) : (
              <div 
                onClick={handleSwitchToWebpage}
                className="p-3 bg-gradient-to-br from-blue-950/90 to-slate-900 rounded-xl text-white cursor-pointer hover:shadow-md transition-all group border border-blue-800/40"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1">
                    <Globe className="w-3 h-3" />
                    Public Platform
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-blue-400 group-hover:translate-x-1 transition-transform" />
                </div>
                <p className="text-xs font-bold text-white leading-tight">Explore YARA Webpage</p>
                <p className="text-[10px] text-slate-300 mt-1">2026 Championship, regional chapters, live streams, and outreach.</p>
              </div>
            )}
          </div>
        </nav>

        {/* User Footer */}
        <div className="p-3 border-t border-slate-100 bg-white">
          <div className="flex items-center space-x-2.5 px-2 py-1.5 mb-1.5">
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs overflow-hidden border border-slate-200 shrink-0">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt={profile.display_name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                profile?.display_name?.[0] || 'U'
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-900 truncate">{profile?.display_name || 'Innovator'}</p>
              <p className="text-[10px] text-slate-500 truncate capitalize">{profile?.role || 'Member'}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 px-3 py-1.5 w-full rounded-lg text-xs text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors duration-200"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden bg-white border-b border-slate-200 px-4 py-2.5 flex items-center justify-between sticky top-0 z-40">
        <Link to={portalMode === 'lms' ? '/learning' : '/'} className="flex items-center space-x-2">
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
              <span className={cn(
                "text-[8px] font-bold px-1 py-0.5 rounded uppercase",
                portalMode === 'lms' ? "bg-emerald-100 text-emerald-800" : "bg-blue-100 text-blue-800"
              )}>
                {portalMode === 'lms' ? 'LMS' : 'Web'}
              </span>
            </div>
            <p className="text-[9px] text-slate-500 font-semibold">{portalMode === 'lms' ? 'YARA LMS' : 'Robotics 2026'}</p>
          </div>
        </Link>

        <div className="flex items-center space-x-1.5">
          <button
            onClick={openPortalSelector}
            className="p-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-bold flex items-center gap-1"
          >
            <Layers className="w-3.5 h-3.5 text-blue-600" />
            <span className="text-[11px]">Portal</span>
          </button>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
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
            {/* Mobile Mode Switcher */}
            <div className="p-4 bg-slate-50 border-b border-slate-100">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">Switch Active Portal</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    handleSwitchToWebpage();
                    setIsMobileMenuOpen(false);
                  }}
                  className={cn(
                    "flex items-center justify-center space-x-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all",
                    portalMode === 'webpage'
                      ? "bg-blue-600 text-white shadow-sm"
                      : "bg-white text-slate-700 border border-slate-200"
                  )}
                >
                  <Globe className="w-4 h-4" />
                  <span>YARA Webpage</span>
                </button>
                <button
                  onClick={() => {
                    handleSwitchToLms();
                    setIsMobileMenuOpen(false);
                  }}
                  className={cn(
                    "flex items-center justify-center space-x-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all",
                    portalMode === 'lms'
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "bg-white text-slate-700 border border-slate-200"
                  )}
                >
                  <GraduationCap className="w-4 h-4" />
                  <span>YARA LMS</span>
                </button>
              </div>
            </div>

            <nav className="p-4 space-y-1">
              {currentNavItems
                .filter(item => !item.adminOnly || isAdmin)
                .map((item) => {
                  const isActive = location.pathname === item.path || 
                    (item.path !== '/' && location.pathname.startsWith(item.path));
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center justify-between px-4 py-3 rounded-2xl transition-all duration-200 text-sm",
                        isActive
                          ? portalMode === 'lms' ? "bg-emerald-50 text-emerald-800 font-bold" : "bg-blue-50 text-blue-700 font-bold"
                          : "text-slate-600 hover:bg-slate-50 font-medium"
                      )}
                    >
                      <div className="flex items-center space-x-3">
                        <item.icon className="w-5 h-5" />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-800">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  handleLogout();
                }}
                className="flex items-center space-x-3 px-4 py-3 w-full rounded-2xl text-red-600 hover:bg-red-50 transition-colors duration-200 mt-4 text-sm font-semibold"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto relative">
        <OfflineBanner />
        <main className="flex-1 p-4 md:p-8">
          <div className="max-w-6xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
