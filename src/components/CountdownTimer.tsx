import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Clock } from 'lucide-react';

interface CountdownTimerProps {
  targetDate: Date;
  title?: string;
}

export default function CountdownTimer({ targetDate, title = "Official Launch In" }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate.getTime() - now;

      if (distance < 0) {
        clearInterval(timer);
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setTimeLeft({ hours, minutes, seconds });
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  return (
    <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] border border-white/10 relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-indigo-500/30 transition-all duration-700" />
      
      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Clock className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h3 className="text-xl font-bold tracking-tight">{title}</h3>
            <p className="text-slate-400 text-sm font-medium">Join us for the next big milestone.</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <TimeUnit value={timeLeft.hours} label="Hours" />
          <div className="text-2xl font-black text-slate-700 self-start mt-2">:</div>
          <TimeUnit value={timeLeft.minutes} label="Mins" />
          <div className="text-2xl font-black text-slate-700 self-start mt-2">:</div>
          <TimeUnit value={timeLeft.seconds} label="Secs" />
        </div>
      </div>
    </div>
  );
}

function TimeUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <motion.div 
        key={value}
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-4xl md:text-5xl font-black tracking-tighter text-indigo-400"
      >
        {value.toString().padStart(2, '0')}
      </motion.div>
      <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 mt-1">{label}</span>
    </div>
  );
}
