import React, { useState, useEffect } from 'react';
import { Clock, Calendar, Flame, CheckCircle2 } from 'lucide-react';

interface CountdownProps {
  targetDate?: string;
  registrationDeadline?: string;
  eventTitle?: string;
}

export default function LiveCountdownTimer({ 
  targetDate = '2027-03-26T08:00:00+02:00',
  registrationDeadline = '2026-11-28T23:59:59+02:00',
  eventTitle = 'Championship Arena Countdown'
}: CountdownProps) {
  const [compTimeLeft, setCompTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isPast: boolean;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0, isPast: false });

  const [regTimeLeft, setRegTimeLeft] = useState<{
    days: number;
    hours: number;
    isPast: boolean;
  }>({ days: 0, hours: 0, isPast: false });

  useEffect(() => {
    const calculate = () => {
      const target = new Date(targetDate).getTime();
      const regTarget = new Date(registrationDeadline).getTime();
      const now = new Date().getTime();

      // Competition countdown
      const compDiff = target - now;
      if (compDiff > 0) {
        const days = Math.floor(compDiff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((compDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((compDiff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((compDiff % (1000 * 60)) / 1000);
        setCompTimeLeft({ days, hours, minutes, seconds, isPast: false });
      } else {
        setCompTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true });
      }

      // Registration countdown
      const regDiff = regTarget - now;
      if (regDiff > 0) {
        const regDays = Math.floor(regDiff / (1000 * 60 * 60 * 24));
        const regHours = Math.floor((regDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        setRegTimeLeft({ days: regDays, hours: regHours, isPast: false });
      } else {
        setRegTimeLeft({ days: 0, hours: 0, isPast: true });
      }
    };

    calculate();
    const interval = setInterval(calculate, 1000);
    return () => clearInterval(interval);
  }, [targetDate, registrationDeadline]);

  return (
    <div className="p-5 sm:p-7 rounded-3xl bg-slate-900/90 border border-indigo-500/30 backdrop-blur-xl shadow-2xl text-white">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-slate-800">
        <div className="flex items-center space-x-2.5 text-amber-400 text-xs font-black uppercase tracking-wider">
          <Flame className="w-4 h-4 text-amber-400 animate-pulse" />
          <span>{eventTitle}</span>
        </div>
        <div className="flex items-center space-x-3 text-xs">
          {regTimeLeft.isPast ? (
            <div className="px-3.5 py-1.5 bg-slate-800/80 text-slate-300 border border-slate-700 rounded-full font-bold flex items-center space-x-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Cohort Registration Concluded</span>
            </div>
          ) : (
            <div className="px-3.5 py-1.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full font-bold flex items-center space-x-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400 animate-spin" />
              <span>Registration Closes in: {regTimeLeft.days}d {regTimeLeft.hours}h</span>
            </div>
          )}
          <div className="hidden md:flex items-center space-x-1.5 text-slate-400 font-semibold">
            <Calendar className="w-3.5 h-3.5 text-indigo-400" />
            <span>March 26 – 28, 2027</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2 sm:gap-4 text-center">
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-amber-500/30 transition-all">
          <span className="text-2xl sm:text-4xl font-black text-amber-400 font-mono block">
            {String(compTimeLeft.days).padStart(2, '0')}
          </span>
          <span className="text-[10px] sm:text-xs uppercase font-bold text-slate-400 tracking-wider">
            Days
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-indigo-500/30 transition-all">
          <span className="text-2xl sm:text-4xl font-black text-white font-mono block">
            {String(compTimeLeft.hours).padStart(2, '0')}
          </span>
          <span className="text-[10px] sm:text-xs uppercase font-bold text-slate-400 tracking-wider">
            Hours
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-indigo-500/30 transition-all">
          <span className="text-2xl sm:text-4xl font-black text-white font-mono block">
            {String(compTimeLeft.minutes).padStart(2, '0')}
          </span>
          <span className="text-[10px] sm:text-xs uppercase font-bold text-slate-400 tracking-wider">
            Mins
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-indigo-500/30 transition-all">
          <span className="text-2xl sm:text-4xl font-black text-indigo-400 font-mono block">
            {String(compTimeLeft.seconds).padStart(2, '0')}
          </span>
          <span className="text-[10px] sm:text-xs uppercase font-bold text-slate-400 tracking-wider">
            Secs
          </span>
        </div>
      </div>
    </div>
  );
}
