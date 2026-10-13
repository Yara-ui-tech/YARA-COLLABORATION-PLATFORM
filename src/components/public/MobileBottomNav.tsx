import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, BookOpen, Globe, Calendar, User } from 'lucide-react';
import { useAuth } from '../AuthContext';
import { cn } from '../../lib/utils';

export default function MobileBottomNav() {
  const location = useLocation();
  const { user } = useAuth();

  const navItems = [
    { label: 'Home', path: '/', icon: Home, exact: true },
    { label: 'Learn', path: '/learning', icon: BookOpen, matchPrefix: ['/learn', '/curriculum', '/courses'] },
    { label: 'Chapters', path: '/chapters', icon: Globe, matchPrefix: ['/chapters'] },
    { label: 'Events', path: '/events', icon: Calendar, matchPrefix: ['/events', '/competitions'] },
    { 
      label: 'Me', 
      path: user ? '/profile' : '/auth', 
      icon: User, 
      matchPrefix: ['/profile', '/dashboard', '/auth', '/me'] 
    },
  ];

  const isCurrentActive = (item: typeof navItems[0]) => {
    if (item.exact) return location.pathname === item.path;
    if (location.pathname === item.path) return true;
    if (item.matchPrefix?.some(prefix => location.pathname.startsWith(prefix))) return true;
    return false;
  };

  return (
    <nav 
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-950/95 border-t border-slate-800/80 backdrop-blur-lg pb-[env(safe-area-inset-bottom,0px)] px-2 py-1.5 shadow-2xl"
    >
      <div className="grid grid-cols-5 items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isCurrentActive(item);

          return (
            <Link
              key={item.label}
              to={item.path}
              className={cn(
                "flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all select-none min-h-[48px]",
                active
                  ? "text-blue-400 font-bold"
                  : "text-slate-400 hover:text-slate-200"
              )}
            >
              <div className={cn(
                "p-1 rounded-xl transition-transform",
                active && "bg-blue-950/80 scale-105"
              )}>
                <Icon className={cn("w-5 h-5", active ? "text-blue-400" : "text-slate-400")} />
              </div>
              <span className="text-[10px] font-semibold tracking-tight mt-0.5">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
