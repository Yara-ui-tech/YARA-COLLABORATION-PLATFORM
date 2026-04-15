import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, User, Lightbulb, Briefcase, Users, CreditCard, LogOut, Menu, X, Calendar, BookOpen, ShieldAlert, MessageSquare, ShieldCheck, Info, Cpu, BarChart3, Handshake, Phone, Brain } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { ASSETS } from '../constants/assets';

const navItems = [
  { path: '/', icon: Home, label: 'Home' },
  { path: '/ideas', icon: Lightbulb, label: 'Ideas' },
  { path: '/projects', icon: Briefcase, label: 'Projects' },
  { path: '/mentorship', icon: Users, label: 'Mentorship' },
  { path: '/curriculum', icon: Brain, label: 'Curriculum' },
  { path: '/events', icon: Calendar, label: 'Events' },
  { path: '/resources', icon: BookOpen, label: 'Resources' },
  { path: '/feedback', icon: MessageSquare, label: 'Feedback' },
  { path: '/about', icon: Info, label: 'About YARA' },
  { path: '/programs', icon: Cpu, label: 'Programs' },
  { path: '/impact', icon: BarChart3, label: 'Impact' },
  { path: '/partners', icon: Handshake, label: 'Partners' },
  { path: '/contact', icon: Phone, label: 'Contact' },
  { path: '/profile', icon: User, label: 'Profile' },
  { path: '/admin', icon: ShieldCheck, label: 'Admin', adminOnly: true },
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
        <div className="p-6 border-b border-slate-100">
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200 group-hover:scale-110 transition-all overflow-hidden">
              {ASSETS.LOGO ? (
                <img src={ASSETS.LOGO} alt="YARIA" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <span className="text-xl font-black tracking-tighter">Y</span>
              )}
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight leading-none">YARIA</h1>
              <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider mt-1">Innovators Hub</p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems
            .filter(item => !item.adminOnly || isAdmin)
            .map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                location.pathname === item.path
                  ? "bg-indigo-50 text-indigo-600 shadow-sm"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <item.icon className={cn(
                "w-5 h-5 transition-transform duration-200 group-hover:scale-110",
                location.pathname === item.path ? "text-indigo-600" : "text-slate-400"
              )} />
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center space-x-3 px-4 py-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold overflow-hidden border border-slate-200">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt={profile.display_name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                profile?.display_name?.[0] || 'U'
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-900 truncate">{profile?.display_name}</p>
              <p className="text-xs text-slate-500 truncate capitalize">{profile?.role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 px-4 py-3 w-full rounded-xl text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors duration-200"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden bg-white border-b border-slate-200 px-4 py-4 flex items-center justify-between sticky top-0 z-50">
        <Link to="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white overflow-hidden">
            {ASSETS.LOGO ? (
              <img src={ASSETS.LOGO} alt="YARIA" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              <span className="text-sm font-black">Y</span>
            )}
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">YARIA</h1>
        </Link>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden fixed inset-0 z-40 bg-white pt-20 overflow-y-auto"
          >
            <nav className="p-6 space-y-2">
              {navItems
                .filter(item => !item.adminOnly || isAdmin)
                .map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center space-x-4 px-6 py-4 rounded-2xl transition-all duration-200",
                    location.pathname === item.path
                      ? "bg-indigo-50 text-indigo-600 shadow-sm"
                      : "text-slate-600 hover:bg-slate-50"
                  )}
                >
                  <item.icon className="w-6 h-6" />
                  <span className="text-lg font-semibold">{item.label}</span>
                </Link>
              ))}
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  handleLogout();
                }}
                className="flex items-center space-x-4 px-6 py-4 w-full rounded-2xl text-red-600 hover:bg-red-50 transition-colors duration-200 mt-4"
              >
                <LogOut className="w-6 h-6" />
                <span className="text-lg font-semibold">Logout</span>
              </button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-y-auto relative">
        <main className="flex-1 p-4 md:p-8">
          <div className="max-w-5xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
