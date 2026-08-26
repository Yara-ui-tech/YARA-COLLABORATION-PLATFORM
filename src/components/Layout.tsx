import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { 
  Home, User, Lightbulb, Briefcase, Users, CreditCard, 
  LogOut, Menu, X, Calendar, BookOpen, ShieldAlert, 
  MessageSquare, ShieldCheck, Info, Cpu, BarChart3, 
  Handshake, Phone, Brain, Trophy, Heart, UserCheck,
  Award, MonitorPlay, QrCode, DollarSign, Radio, Building2
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { ASSETS } from '../constants/assets';

interface NavItem {
  path: string;
  icon: any;
  label: string;
  badge?: string;
  adminOnly?: boolean;
}

const mainNavItems: NavItem[] = [
  { path: '/', icon: Home, label: 'Home' },
  { path: '/learning', icon: Brain, label: 'Learning Academy', badge: 'L0-L8' },
  { path: '/chapters', icon: Building2, label: 'YARA Chapters', badge: 'Nationwide' },
  { path: '/competitions', icon: Trophy, label: 'Competitions', badge: 'Hub' },
  { path: '/competitions/yara-2026', icon: Trophy, label: '↳ YARA 2026 Arena', badge: 'Flagship' },
  { path: '/competition/participant', icon: Users, label: '↳ Team Portal (2B+2G)' },
  { path: '/competition/sponsors', icon: DollarSign, label: '↳ Sponsors & Tiers' },
  { path: '/volunteer', icon: UserCheck, label: '↳ Volunteer Corps' },
  { path: '/competition/judges', icon: Award, label: '↳ Judge Panel' },
  { path: '/competition/live-results', icon: MonitorPlay, label: '↳ Live Arena Screen' },
  { path: '/competition/impact', icon: BarChart3, label: '↳ Impact & Ledger' },
  { path: '/verify-certificate', icon: QrCode, label: 'Verify Credentials' },
  { path: '/ideas', icon: Lightbulb, label: 'Ideas Hub' },
  { path: '/posts', icon: Radio, label: 'Organization Feed', badge: 'Live' },
  { path: '/projects', icon: Briefcase, label: 'Hardware Projects' },
  { path: '/mentorship', icon: Users, label: 'Mentorship' },
  { path: '/curriculum', icon: BookOpen, label: 'Legacy Curriculum' },
  { path: '/events', icon: Calendar, label: 'Events' },
  { path: '/resources', icon: BookOpen, label: 'Resources' },
  { path: '/about', icon: Info, label: 'About YARA' },
  { path: '/contact', icon: Phone, label: 'Contact & Inquiries' },
  { path: '/profile', icon: User, label: 'Profile' },
  { path: '/admin', icon: ShieldCheck, label: 'Admin Console', adminOnly: true },
];

export default function Layout() {
  const location = useLocation();
  const { profile, isAccountActive } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const isAdmin = profile?.role === 'admin';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 sticky top-0 h-screen">
        <div className="p-5 border-b border-slate-100">
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200 group-hover:scale-110 transition-all overflow-hidden">
              {ASSETS.LOGO ? (
                <img src={ASSETS.LOGO} alt="YARA" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <span className="text-xl font-black tracking-tighter">Y</span>
              )}
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 tracking-tight leading-none">YARA</h1>
              <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mt-1">Robotics Ecosystem</p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {mainNavItems
            .filter(item => !item.adminOnly || isAdmin)
            .map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all duration-200 group text-xs",
                location.pathname === item.path
                  ? "bg-indigo-50 text-indigo-600 font-bold shadow-xs"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium"
              )}
            >
              <div className="flex items-center space-x-2.5 min-w-0">
                <item.icon className={cn(
                  "w-4 h-4 shrink-0 transition-transform duration-200 group-hover:scale-110",
                  location.pathname === item.path ? "text-indigo-600" : "text-slate-400"
                )} />
                <span className="truncate">{item.label}</span>
              </div>

              {item.badge && (
                <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-amber-100 text-amber-800 shrink-0">
                  {item.badge}
                </span>
              )}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center space-x-3 px-3 py-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs overflow-hidden border border-slate-200">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt={profile.display_name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                profile?.display_name?.[0] || 'U'
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-900 truncate">{profile?.display_name || 'Competitor'}</p>
              <p className="text-[10px] text-slate-500 truncate capitalize">{profile?.role || 'Guest'}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 px-3 py-2 w-full rounded-xl text-xs text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors duration-200"
          >
            <LogOut className="w-4 h-4" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-50">
        <Link to="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white overflow-hidden">
            {ASSETS.LOGO ? (
              <img src={ASSETS.LOGO} alt="YARA" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              <span className="text-sm font-black">Y</span>
            )}
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900 tracking-tight leading-none">YARA</h1>
            <p className="text-[9px] text-slate-400 font-bold">Robotics 2026</p>
          </div>
        </Link>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
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
            <nav className="p-4 space-y-1">
              {mainNavItems
                .filter(item => !item.adminOnly || isAdmin)
                .map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center justify-between px-4 py-3 rounded-2xl transition-all duration-200 text-sm",
                    location.pathname === item.path
                      ? "bg-indigo-50 text-indigo-600 font-bold shadow-xs"
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
              ))}
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

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-y-auto relative">
        <main className="flex-1 p-4 md:p-8">
          <div className="max-w-6xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
