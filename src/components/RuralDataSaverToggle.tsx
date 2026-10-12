import React from 'react';
import { Wifi, SignalLow, Zap, Info } from 'lucide-react';
import { useRuralAccessibility } from '../context/RuralAccessibilityContext';
import { cn } from '../lib/utils';

interface Props {
  variant?: 'badge' | 'compact' | 'switch';
  className?: string;
}

export const RuralDataSaverToggle: React.FC<Props> = ({ variant = 'badge', className }) => {
  const { isLowDataMode, toggleLowDataMode } = useRuralAccessibility();

  if (variant === 'switch') {
    return (
      <div className={cn("flex items-center justify-between p-3 rounded-2xl border transition-all", isLowDataMode ? "bg-amber-500/10 border-amber-500/30 text-amber-900" : "bg-slate-50 border-slate-200 text-slate-700", className)}>
        <div className="flex items-center space-x-2.5">
          <div className={cn("p-1.5 rounded-xl", isLowDataMode ? "bg-amber-500 text-slate-950 font-bold" : "bg-slate-200 text-slate-600")}>
            <SignalLow className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-black block">Rural Low-Data Mode (2G/3G)</span>
            <span className="text-[10px] text-slate-500 block leading-tight">
              Compresses media, pauses autoplay videos & maximizes text notes
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={toggleLowDataMode}
          className={cn(
            "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden",
            isLowDataMode ? "bg-amber-500" : "bg-slate-300"
          )}
          role="switch"
          aria-checked={isLowDataMode}
        >
          <span
            aria-hidden="true"
            className={cn(
              "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out",
              isLowDataMode ? "translate-x-5" : "translate-x-0"
            )}
          />
        </button>
      </div>
    );
  }

  // Default: interactive badge
  return (
    <button
      type="button"
      onClick={toggleLowDataMode}
      title={isLowDataMode ? "Low-Data Mode active: Click to enable full media" : "Enable Rural Low-Data Mode for 2G/3G connections and saved data"}
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black transition-all cursor-pointer shadow-xs border",
        isLowDataMode
          ? "bg-amber-400 text-slate-950 border-amber-300 shadow-amber-400/20 animate-pulse"
          : "bg-slate-800/80 hover:bg-slate-800 text-slate-300 border-slate-700 hover:text-white",
        className
      )}
    >
      <SignalLow className={cn("w-3.5 h-3.5", isLowDataMode ? "text-slate-950" : "text-amber-400")} />
      <span>{isLowDataMode ? "Low-Data Mode ON" : "Data Saver"}</span>
    </button>
  );
};
