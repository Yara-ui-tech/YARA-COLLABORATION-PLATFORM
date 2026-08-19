import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Rocket, Clock, Sparkles, Calendar, Zap, AlertCircle, RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';

interface LaunchConfig {
  duration_hours?: number;
  launch_date?: string;
  title?: string;
  is_enabled?: boolean;
  banner_text?: string;
}

export default function LaunchCountdown() {
  const [launchDate, setLaunchDate] = useState<Date | null>(null);
  const [config, setConfig] = useState<LaunchConfig>({
    duration_hours: 72,
    title: 'Official YARIA Global Launch',
    is_enabled: true,
    banner_text: 'Countdown to the Official YARIA Platform Launch — 72 Hours of Innovation & Robotics'
  });
  
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    totalSeconds: 0,
    isExpired: false,
  });

  useEffect(() => {
    const fetchLaunchConfig = async () => {
      try {
        const { data, error } = await supabase
          .from('system_settings')
          .select('value')
          .eq('key', 'launch_time')
          .single();

        let target: Date;
        if (data?.value) {
          const val = data.value;
          setConfig(prev => ({ ...prev, ...val }));
          
          if (val.launch_date) {
            target = new Date(val.launch_date);
            // If the date in DB is in the past, reset to 72 hours from now
            if (isNaN(target.getTime()) || target.getTime() < Date.now() - 3600000) {
              target = new Date(Date.now() + 72 * 60 * 60 * 1000);
            }
          } else {
            target = new Date(Date.now() + (val.duration_hours || 72) * 60 * 60 * 1000);
          }
        } else {
          // Check localStorage as local fallback
          const localStored = localStorage.getItem('yaria_official_launch_target');
          if (localStored && !isNaN(new Date(localStored).getTime()) && new Date(localStored).getTime() > Date.now()) {
            target = new Date(localStored);
          } else {
            target = new Date(Date.now() + 72 * 60 * 60 * 1000);
            localStorage.setItem('yaria_official_launch_target', target.toISOString());
          }
        }
        setLaunchDate(target);
      } catch (e) {
        const target = new Date(Date.now() + 72 * 60 * 60 * 1000);
        setLaunchDate(target);
      }
    };

    fetchLaunchConfig();
  }, []);

  useEffect(() => {
    if (!launchDate) return;

    const calculateTime = () => {
      const now = new Date().getTime();
      const difference = launchDate.getTime() - now;

      if (difference <= 0) {
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          totalSeconds: 0,
          isExpired: true,
        });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);
      const totalSeconds = Math.floor(difference / 1000);

      setTimeLeft({
        days,
        hours,
        minutes,
        seconds,
        totalSeconds,
        isExpired: false,
      });
    };

    calculateTime();
    const timer = setInterval(calculateTime, 1000);
    return () => clearInterval(timer);
  }, [launchDate]);

  if (config.is_enabled === false) return null;

  // Calculate percentage of 72 hours completed
  const total72HoursSeconds = (config.duration_hours || 72) * 3600;
  const progressPercent = Math.min(100, Math.max(0, ((total72HoursSeconds - timeLeft.totalSeconds) / total72HoursSeconds) * 100));

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-6 md:p-10 text-white shadow-2xl border border-indigo-500/20"
    >
      {/* Background glow & accents */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
        {/* Left info */}
        <div className="space-y-4 max-w-xl text-center lg:text-left">
          <div className="inline-flex items-center space-x-2 bg-indigo-500/20 border border-indigo-400/30 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider text-indigo-300">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>Official Launch Countdown • 72-Hour Timer</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white flex flex-wrap items-center justify-center lg:justify-start gap-2">
            <span>{config.title || 'Official YARIA Launch'}</span>
            <Rocket className="w-7 h-7 text-indigo-400 animate-bounce inline-block" />
          </h2>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            {config.banner_text || 'Official platform launch countdown in progress. Join upcoming robotic challenges, mentorship networks, and project incubators across Africa!'}
          </p>

          {/* Progress Bar */}
          <div className="space-y-2 pt-2">
            <div className="flex justify-between text-xs font-semibold text-slate-400">
              <span>Launch Progress</span>
              <span className="text-indigo-300">{Math.round(progressPercent)}% of 72h window</span>
            </div>
            <div className="w-full h-2.5 bg-slate-800/80 rounded-full overflow-hidden border border-white/5">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 rounded-full transition-all duration-1000"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Right: Counter Cards */}
        <div className="shrink-0 flex items-center gap-3 sm:gap-4">
          {timeLeft.isExpired ? (
            <div className="bg-emerald-500/20 border border-emerald-500/40 p-6 rounded-3xl text-center">
              <Zap className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
              <p className="text-xl font-bold text-white">We are LIVE! 🚀</p>
              <p className="text-xs text-emerald-300 mt-1">Platform officially launched.</p>
            </div>
          ) : (
            <>
              {/* Days */}
              <div className="flex flex-col items-center">
                <div className="w-18 sm:w-20 md:w-24 h-20 sm:h-24 md:h-28 bg-white/10 backdrop-blur-md rounded-2xl md:rounded-3xl border border-white/10 flex items-center justify-center shadow-lg">
                  <span className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-white font-mono">
                    {String(timeLeft.days).padStart(2, '0')}
                  </span>
                </div>
                <span className="text-[10px] sm:text-xs uppercase font-bold tracking-wider text-indigo-300 mt-2">Days</span>
              </div>

              <span className="text-2xl sm:text-3xl font-black text-indigo-400/60 -mt-6">:</span>

              {/* Hours */}
              <div className="flex flex-col items-center">
                <div className="w-18 sm:w-20 md:w-24 h-20 sm:h-24 md:h-28 bg-white/10 backdrop-blur-md rounded-2xl md:rounded-3xl border border-white/10 flex items-center justify-center shadow-lg">
                  <span className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-white font-mono">
                    {String(timeLeft.hours).padStart(2, '0')}
                  </span>
                </div>
                <span className="text-[10px] sm:text-xs uppercase font-bold tracking-wider text-indigo-300 mt-2">Hours</span>
              </div>

              <span className="text-2xl sm:text-3xl font-black text-indigo-400/60 -mt-6">:</span>

              {/* Minutes */}
              <div className="flex flex-col items-center">
                <div className="w-18 sm:w-20 md:w-24 h-20 sm:h-24 md:h-28 bg-white/10 backdrop-blur-md rounded-2xl md:rounded-3xl border border-white/10 flex items-center justify-center shadow-lg">
                  <span className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-white font-mono">
                    {String(timeLeft.minutes).padStart(2, '0')}
                  </span>
                </div>
                <span className="text-[10px] sm:text-xs uppercase font-bold tracking-wider text-indigo-300 mt-2">Mins</span>
              </div>

              <span className="text-2xl sm:text-3xl font-black text-indigo-400/60 -mt-6">:</span>

              {/* Seconds */}
              <div className="flex flex-col items-center">
                <div className="w-18 sm:w-20 md:w-24 h-20 sm:h-24 md:h-28 bg-indigo-600/30 backdrop-blur-md rounded-2xl md:rounded-3xl border border-indigo-400/40 flex items-center justify-center shadow-lg">
                  <span className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-emerald-400 font-mono animate-pulse">
                    {String(timeLeft.seconds).padStart(2, '0')}
                  </span>
                </div>
                <span className="text-[10px] sm:text-xs uppercase font-bold tracking-wider text-emerald-400 mt-2">Secs</span>
              </div>
            </>
          )}
        </div>
      </div>
    </motion.section>
  );
}
