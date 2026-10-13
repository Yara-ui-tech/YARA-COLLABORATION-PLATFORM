import React, { useState } from 'react';
import { Play, Volume2, FileText, Video, Eye, EyeOff, Sparkles, CheckCircle2 } from 'lucide-react';
import { cn } from '../lib/utils';

interface RuralVideoPlayerProps {
  title?: string;
  videoUrl?: string;
  videoLowUrl?: string;
  audioUrl?: string;
  transcript?: string;
  estimatedDataMb?: number;
  unpluggedActivity?: string;
  printablePdfPath?: string;
  lowCostAlternatives?: string;
  className?: string;
}

export default function RuralVideoPlayer({
  title = 'Lesson Media & Instructions',
  videoUrl,
  videoLowUrl,
  audioUrl,
  transcript,
  estimatedDataMb = 8,
  unpluggedActivity,
  printablePdfPath,
  lowCostAlternatives,
  className
}: RuralVideoPlayerProps) {
  type Mode = 'idle' | 'watch_low' | 'watch_hd' | 'listen' | 'read';
  const [activeMode, setActiveMode] = useState<Mode>('idle');

  return (
    <div className={cn("bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 text-white shadow-xl", className)}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div>
          <h4 className="text-sm font-black text-white flex items-center gap-2">
            <Video className="w-4 h-4 text-blue-400" />
            <span>{title}</span>
          </h4>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Rural 2G/3G optimized: Choose your preferred format to conserve data.
          </p>
        </div>
        <div className="text-[10px] font-black text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-full border border-amber-400/20 self-start sm:self-auto">
          Est. HD Data: ~{estimatedDataMb} MB
        </div>
      </div>

      {/* Mode Selectors */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {/* 1. Read Transcript */}
        <button
          type="button"
          onClick={() => setActiveMode(activeMode === 'read' ? 'idle' : 'read')}
          className={cn(
            "p-3 rounded-2xl border text-left transition flex flex-col justify-between min-h-[72px]",
            activeMode === 'read'
              ? "bg-emerald-950/80 border-emerald-500/50 text-white"
              : "bg-slate-850 hover:bg-slate-800 border-slate-750 text-slate-300"
          )}
        >
          <div className="flex items-center justify-between">
            <FileText className="w-4 h-4 text-emerald-400" />
            <span className="text-[9px] font-black text-emerald-400 uppercase">0 MB</span>
          </div>
          <div>
            <div className="text-xs font-bold leading-tight">Read Notes</div>
            <div className="text-[10px] text-slate-400">Zero video data</div>
          </div>
        </button>

        {/* 2. Listen Audio */}
        {audioUrl ? (
          <button
            type="button"
            onClick={() => setActiveMode(activeMode === 'listen' ? 'idle' : 'listen')}
            className={cn(
              "p-3 rounded-2xl border text-left transition flex flex-col justify-between min-h-[72px]",
              activeMode === 'listen'
                ? "bg-purple-950/80 border-purple-500/50 text-white"
                : "bg-slate-850 hover:bg-slate-800 border-slate-750 text-slate-300"
            )}
          >
            <div className="flex items-center justify-between">
              <Volume2 className="w-4 h-4 text-purple-400" />
              <span className="text-[9px] font-black text-purple-400 uppercase">~1.2 MB</span>
            </div>
            <div>
              <div className="text-xs font-bold leading-tight">Listen Audio</div>
              <div className="text-[10px] text-slate-400">Low bandwidth</div>
            </div>
          </button>
        ) : null}

        {/* 3. Watch Low Quality */}
        {videoLowUrl || videoUrl ? (
          <button
            type="button"
            onClick={() => setActiveMode(activeMode === 'watch_low' ? 'idle' : 'watch_low')}
            className={cn(
              "p-3 rounded-2xl border text-left transition flex flex-col justify-between min-h-[72px]",
              activeMode === 'watch_low'
                ? "bg-blue-950/80 border-blue-500/50 text-white"
                : "bg-slate-850 hover:bg-slate-800 border-slate-750 text-slate-300"
            )}
          >
            <div className="flex items-center justify-between">
              <Play className="w-4 h-4 text-blue-400" />
              <span className="text-[9px] font-black text-blue-400 uppercase">~{(estimatedDataMb * 0.35).toFixed(1)} MB</span>
            </div>
            <div>
              <div className="text-xs font-bold leading-tight">Watch Low Res</div>
              <div className="text-[10px] text-slate-400">2G / 3G friendly</div>
            </div>
          </button>
        ) : null}

        {/* 4. Watch HD Video */}
        {videoUrl ? (
          <button
            type="button"
            onClick={() => setActiveMode(activeMode === 'watch_hd' ? 'idle' : 'watch_hd')}
            className={cn(
              "p-3 rounded-2xl border text-left transition flex flex-col justify-between min-h-[72px]",
              activeMode === 'watch_hd'
                ? "bg-amber-950/80 border-amber-500/50 text-white"
                : "bg-slate-850 hover:bg-slate-800 border-slate-750 text-slate-300"
            )}
          >
            <div className="flex items-center justify-between">
              <Video className="w-4 h-4 text-amber-400" />
              <span className="text-[9px] font-black text-amber-400 uppercase">~{estimatedDataMb} MB</span>
            </div>
            <div>
              <div className="text-xs font-bold leading-tight">Watch Full HD</div>
              <div className="text-[10px] text-slate-400">High bandwidth</div>
            </div>
          </button>
        ) : null}
      </div>

      {/* Active Content Display Area */}
      {activeMode === 'read' && (
        <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2 animate-in fade-in duration-200">
          <div className="text-xs font-black uppercase text-emerald-400 tracking-wider">Lesson Transcript & Text Guide</div>
          <div className="text-xs text-slate-300 leading-relaxed whitespace-pre-line max-h-80 overflow-y-auto pr-2">
            {transcript || 'No full text transcript provided for this lesson yet. Please refer to theory notes above.'}
          </div>
        </div>
      )}

      {activeMode === 'listen' && audioUrl && (
        <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2 animate-in fade-in duration-200">
          <div className="text-xs font-black uppercase text-purple-400 tracking-wider">Audio Narration</div>
          <audio controls className="w-full mt-2" src={audioUrl}>
            Your browser does not support the audio element.
          </audio>
        </div>
      )}

      {activeMode === 'watch_low' && (videoLowUrl || videoUrl) && (
        <div className="relative rounded-2xl overflow-hidden bg-black aspect-video border border-slate-800 animate-in fade-in duration-200">
          <video controls className="w-full h-full object-contain" src={videoLowUrl || videoUrl}>
            Your browser does not support the video tag.
          </video>
        </div>
      )}

      {activeMode === 'watch_hd' && videoUrl && (
        <div className="relative rounded-2xl overflow-hidden bg-black aspect-video border border-slate-800 animate-in fade-in duration-200">
          <video controls className="w-full h-full object-contain" src={videoUrl}>
            Your browser does not support the video tag.
          </video>
        </div>
      )}

      {/* Unplugged & Low Cost Alternatives Banner */}
      {(unpluggedActivity || lowCostAlternatives || printablePdfPath) && (
        <div className="p-3 bg-amber-400/5 border border-amber-400/20 rounded-2xl space-y-2 text-xs">
          {printablePdfPath && (
            <div className="flex items-center justify-between">
              <span className="text-slate-300 font-bold">Printable Offline Lesson Sheet</span>
              <a
                href={printablePdfPath}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] font-black text-amber-400 hover:underline flex items-center gap-1"
              >
                <span>Print / Save PDF</span>
              </a>
            </div>
          )}

          {unpluggedActivity && (
            <div>
              <span className="text-amber-400 font-black uppercase text-[10px] block">Unplugged Practical Activity:</span>
              <p className="text-slate-300 mt-0.5">{unpluggedActivity}</p>
            </div>
          )}

          {lowCostAlternatives && (
            <div>
              <span className="text-emerald-400 font-black uppercase text-[10px] block">No Kit? Low-Cost Alternative:</span>
              <p className="text-slate-300 mt-0.5">{lowCostAlternatives}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
