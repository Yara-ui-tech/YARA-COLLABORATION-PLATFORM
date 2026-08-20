import React, { useState, useEffect } from 'react';
import { Clock, Calendar, Flame, AlertCircle } from 'lucide-react';

interface CountdownProps {
  targetDate?: string; // Default: October 16, 2026 08:00:00 CAT
  registrationDeadline?: string; // Default: September 20, 2026
}

export default function LiveCountdownTimer({ 
  targetDate = '2026-10-16T08:00:00+02:00',
  registrationDeadline = '2026-09-20T23:59:59+02:00'
}: CountdownProps) {
  const [compTimeLeft, setCompTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  const [regTimeLeft, setRegTimeLeft] = useState<{
    days: number;
    hours: number;
  }>({ days: 0, hours: 0 });

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
        setCompTimeLeft({ days, hours, minutes, seconds });
      }

      // Registration countdown
      const regDiff = regTarget - now;
      if (regDiff > 0) {
        const regDays = Math.floor(regDiff / (1000 * 60 * 60 * 24));
        const regHours = Math.floor((regDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        setRegTimeLeft({ days: regDays, hours: regHours });
      }
    };

    calculate();
    const interval = setInterval(calculate, 1000);
    return () => clearInterval(interval);
  }, [targetDate, registrationDeadline]);

  return (
    <div className="p-5 sm:p-6 rounded-3xl bg-slate-900 border border-indigo-500/30 backdrop-blur-md shadow-2xl text-white">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
          <Flame className="w-4 h-4 text-amber-400 animate-bounce" />
          <span>Championship Arena Countdown</span>
        </div>
        <div className="flex items-center space-x-3 text-xs">
          <div className="px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full font-bold">
            ⏳ Reg Closes in: {regTimeLeft.days}d {regTimeLeft.hours}h (Sept 20)
          </div>
          <div className="hidden md:flex items-center space-x-1 text-slate-400 font-semibold">
            <Calendar className="w-3.5 h-3.5" />
            <span>Oct 16 - 18, 2026</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2 sm:gap-4 text-center">
        <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
          <span className="text-2xl sm:text-4xl font-black text-amber-400 font-mono block">
            {String(compTimeLeft.days).padStart(2, '0')}
          </span>
          <span className="text-[10px] sm:text-xs uppercase font-bold text-slate-400 tracking-wider">
            Days
          </span>
        </div>

        <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
          <span className="text-2xl sm:text-4xl font-black text-white font-mono block">
            {String(compTimeLeft.hours).padStart(2, '0')}
          </span>
          <span className="text-[10px] sm:text-xs uppercase font-bold text-slate-400 tracking-wider">
            Hours
          </span>
        </div>

        <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
          <span className="text-2xl sm:text-4xl font-black text-white font-mono block">
            {String(compTimeLeft.minutes).padStart(2, '0')}
          </span>
          <span className="text-[10px] sm:text-xs uppercase font-bold text-slate-400 tracking-wider">
            Mins
          </span>
        </div>

        <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
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
