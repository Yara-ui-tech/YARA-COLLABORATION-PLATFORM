import React, { useState, useEffect } from 'react';
import { Bell, Check, ExternalLink, Info, Trophy, BookOpen, Calendar, Award, AlertTriangle, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { supabase } from '../../lib/supabase';
import { cn } from '../../lib/utils';

export interface AppNotification {
  id: string;
  user_id?: string;
  title: string;
  message: string;
  notification_type: 'course' | 'assignment' | 'deadline' | 'competition' | 'event' | 'approval' | 'certificate' | 'announcement' | 'system';
  action_link?: string;
  is_read: boolean;
  created_at: string;
}

const DEFAULT_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif_comp_2026',
    title: 'YARA Robotics Competition 2026',
    message: 'Official team registrations are open for Autonomous Maze Solving & Underwater Drone challenges.',
    notification_type: 'competition',
    action_link: '/competitions/yara-2026',
    is_read: false,
    created_at: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: 'notif_bootcamp',
    title: 'AI for Educators & Patrons Bootcamp',
    message: 'Registration confirmed. Review your syllabus and automated lesson planning workbench.',
    notification_type: 'event',
    action_link: '/educator-portal',
    is_read: false,
    created_at: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: 'notif_curriculum',
    title: 'Robotics Mastery Tier 1 Released',
    message: 'Master introductory circuits, motor drivers, and sensor telemetry in Level 1 of the YARA Academy.',
    notification_type: 'course',
    action_link: '/learning',
    is_read: false,
    created_at: new Date(Date.now() - 172800000).toISOString()
  },
  {
    id: 'notif_cert_verify',
    title: 'Online Certificate Registry Live',
    message: 'Digital technical credentials can now be verified instantly via official YARA QR codes and ID lookup.',
    notification_type: 'certificate',
    action_link: '/verify-certificate',
    is_read: true,
    created_at: new Date(Date.now() - 259200000).toISOString()
  }
];

export function NotificationBell() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    try {
      const stored = localStorage.getItem('yara_notifications_cache');
      return stored ? JSON.parse(stored) : DEFAULT_NOTIFICATIONS;
    } catch {
      return DEFAULT_NOTIFICATIONS;
    }
  });
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    async function fetchNotifications() {
      try {
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(10);
        
        if (!error && data && data.length > 0) {
          setNotifications(data as AppNotification[]);
        }
      } catch {
        // Fallback to cached notifications
      }
    }
    fetchNotifications();
  }, [user]);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const markAllAsRead = () => {
    const updated = notifications.map(n => ({ ...n, is_read: true }));
    setNotifications(updated);
    try {
      localStorage.setItem('yara_notifications_cache', JSON.stringify(updated));
    } catch {}
  };

  const markAsRead = (id: string) => {
    const updated = notifications.map(n => n.id === id ? { ...n, is_read: true } : n);
    setNotifications(updated);
    try {
      localStorage.setItem('yara_notifications_cache', JSON.stringify(updated));
    } catch {}
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'competition':
        return <Trophy className="w-4 h-4 text-amber-500" />;
      case 'course':
        return <BookOpen className="w-4 h-4 text-blue-500" />;
      case 'event':
        return <Calendar className="w-4 h-4 text-emerald-500" />;
      case 'certificate':
        return <Award className="w-4 h-4 text-purple-500" />;
      default:
        return <Info className="w-4 h-4 text-indigo-500" />;
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
        title="Notifications"
        aria-label="View notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[10px] font-black text-slate-950">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl z-50 overflow-hidden text-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-blue-400" />
                <h3 className="font-bold text-sm text-white">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-[10px] font-bold">
                    {unreadCount} new
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-slate-400 hover:text-white transition-colors"
                  >
                    Mark all read
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="max-h-96 overflow-y-auto divide-y divide-slate-800/60">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-sm">
                  No notifications at this time.
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className={cn(
                      "p-3.5 hover:bg-slate-800/50 transition-colors flex gap-3 text-left",
                      !n.is_read && "bg-blue-950/20"
                    )}
                    onClick={() => markAsRead(n.id)}
                  >
                    <div className="mt-0.5 shrink-0 w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center">
                      {getIcon(n.notification_type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-1">
                        <h4 className="text-xs font-bold text-white truncate">{n.title}</h4>
                        <span className="text-[10px] text-slate-500 shrink-0">
                          {new Date(n.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-0.5 line-clamp-2 leading-relaxed">
                        {n.message}
                      </p>
                      {n.action_link && (
                        <Link
                          to={n.action_link}
                          onClick={() => setIsOpen(false)}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-400 hover:text-blue-300 mt-1.5"
                        >
                          <span>View details</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-2.5 bg-slate-950 border-t border-slate-800 text-center">
              <span className="text-[11px] text-slate-400">
                Young Africans Robotics Association (YARA)
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
