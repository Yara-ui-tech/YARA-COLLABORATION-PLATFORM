import React, { useState, useEffect } from 'react';
import { Trophy, Clock, ArrowRight, Award, Cpu, Code, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';
import { VirtualCompetition } from '../../types/competition';

interface VirtualCompetitionCardProps {
  key?: React.Key;
  competition: VirtualCompetition;
  onOpen: (competition: VirtualCompetition) => void;
}

export default function VirtualCompetitionCard({ competition, onOpen }: VirtualCompetitionCardProps) {
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number } | null>(null);

  useEffect(() => {
    const targetTime = new Date(Date.now() + (competition.duration_hours || 48) * 3600 * 1000).getTime();
    const update = () => {
      const diff = targetTime - Date.now();
      if (diff <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft({ hours, minutes, seconds });
      }
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [competition]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-100/60 overflow-hidden flex flex-col group hover:shadow-2xl hover:shadow-indigo-50/50 transition-all duration-300"
    >
      {/* Visual Header */}
      <div className="relative h-48 overflow-hidden bg-slate-900">
        {competition.image_url ? (
          <img
            src={competition.image_url}
            alt={competition.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-80"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-tr from-indigo-900 via-slate-900 to-indigo-950 flex items-center justify-center">
            <Cpu className="w-16 h-16 text-indigo-400/30" />
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent"></div>

        {/* Top Badges */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
          <span className="px-3 py-1 bg-amber-500/90 backdrop-blur-md text-slate-950 font-bold text-xs rounded-full uppercase tracking-wider flex items-center space-x-1 shadow-sm">
            <Trophy className="w-3 h-3" />
            <span>Virtual Challenge</span>
          </span>

          <span className="px-3 py-1 bg-slate-900/80 backdrop-blur-md text-slate-200 font-bold text-xs rounded-full capitalize">
            {competition.category_label || competition.category.replace('_', ' ')}
          </span>
        </div>

        {/* Live Timer Pill */}
        {timeLeft && (
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs text-white">
            <div className="flex items-center space-x-1.5 bg-slate-950/80 backdrop-blur-md px-3 py-1 rounded-xl border border-slate-700/50">
              <Clock className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span className="font-mono font-bold text-amber-300">
                {String(timeLeft.hours).padStart(2, '0')}h : {String(timeLeft.minutes).padStart(2, '0')}m : {String(timeLeft.seconds).padStart(2, '0')}s left
              </span>
            </div>
            {competition.prize && (
              <span className="text-[11px] font-bold text-emerald-300 bg-emerald-950/60 backdrop-blur-md px-2.5 py-1 rounded-xl border border-emerald-500/30 truncate max-w-[150px]">
                {competition.prize}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          <h4 className="text-lg font-bold text-slate-900 tracking-tight group-hover:text-indigo-600 transition-colors line-clamp-2">
            {competition.title}
          </h4>
          <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">
            {competition.description}
          </p>
        </div>

        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs font-bold text-slate-400">
            <span>Score: {competition.max_score} pts</span>
          </div>

          <button
            onClick={() => onOpen(competition)}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-200 transition-all flex items-center space-x-1.5 group-hover:px-6"
          >
            <span>Enter Challenge</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
