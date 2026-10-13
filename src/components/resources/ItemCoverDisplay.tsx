import React, { useState } from 'react';
import { 
  BookOpen, Video, FileText, Play, Cpu, 
  ExternalLink, Layers, Sparkles, CheckCircle2, Bookmark, Flame
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useRuralAccessibility } from '../../context/RuralAccessibilityContext';

export interface ItemCoverDisplayProps {
  type?: 'book' | 'pdf' | 'doc' | 'video' | 'schematic' | 'tool' | 'code' | 'presentation' | 'other' | string;
  title: string;
  subtitle?: string;
  category?: string;
  author?: string;
  imageUrl?: string | null;
  aspectRatio?: 'book' | 'video' | 'square' | 'auto';
  duration?: string;
  fileSize?: string;
  level?: string;
  className?: string;
  showBadge?: boolean;
  onPlay?: () => void;
  tags?: string[];
}

export default function ItemCoverDisplay({
  type = 'pdf',
  title,
  subtitle,
  category,
  author,
  imageUrl,
  aspectRatio = 'auto',
  duration,
  fileSize,
  level,
  className,
  showBadge = true,
  onPlay,
  tags
}: ItemCoverDisplayProps) {
  const { isLowDataMode } = useRuralAccessibility();
  const [imgError, setImgError] = useState(false);

  // Normalize item kind
  const normalizedType = (type || 'pdf').toLowerCase();
  const isVideo = normalizedType === 'video' || title.toLowerCase().includes('video') || title.toLowerCase().includes('masterclass');
  const isBookOrDoc = !isVideo && (
    normalizedType === 'book' || 
    normalizedType === 'pdf' || 
    normalizedType === 'doc' || 
    title.toLowerCase().includes('book') || 
    title.toLowerCase().includes('handbook') || 
    title.toLowerCase().includes('guide') ||
    title.toLowerCase().includes('manual')
  );
  const isSchematic = !isVideo && !isBookOrDoc && (
    normalizedType === 'schematic' || 
    category?.toLowerCase().includes('schematic') || 
    title.toLowerCase().includes('schematic') || 
    title.toLowerCase().includes('pinout') ||
    title.toLowerCase().includes('blueprint')
  );

  // Determine aspect ratio class
  const resolvedAspect = aspectRatio === 'auto' 
    ? (isVideo ? 'aspect-video' : isBookOrDoc ? 'aspect-[3/4] sm:aspect-[4/5]' : 'aspect-video')
    : aspectRatio === 'book' ? 'aspect-[3/4]'
    : aspectRatio === 'video' ? 'aspect-video'
    : 'aspect-square';

  // Seeded color schemes for book covers based on title
  const getBookCoverTheme = (str: string) => {
    const themes = [
      {
        bg: 'bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900',
        border: 'border-indigo-400/30',
        accent: 'text-amber-300',
        ribbon: 'bg-amber-400',
        badge: 'bg-amber-400/20 text-amber-300 border-amber-400/40',
        spine: 'from-amber-500/60 via-amber-300/30 to-transparent'
      },
      {
        bg: 'bg-gradient-to-br from-emerald-950 via-slate-900 to-teal-950',
        border: 'border-emerald-400/30',
        accent: 'text-emerald-300',
        ribbon: 'bg-emerald-400',
        badge: 'bg-emerald-400/20 text-emerald-300 border-emerald-400/40',
        spine: 'from-emerald-500/60 via-emerald-300/30 to-transparent'
      },
      {
        bg: 'bg-gradient-to-br from-blue-950 via-slate-900 to-cyan-950',
        border: 'border-cyan-400/30',
        accent: 'text-cyan-300',
        ribbon: 'bg-cyan-400',
        badge: 'bg-cyan-400/20 text-cyan-300 border-cyan-400/40',
        spine: 'from-cyan-500/60 via-cyan-300/30 to-transparent'
      },
      {
        bg: 'bg-gradient-to-br from-purple-950 via-slate-900 to-pink-950',
        border: 'border-purple-400/30',
        accent: 'text-pink-300',
        ribbon: 'bg-pink-400',
        badge: 'bg-pink-400/20 text-pink-300 border-pink-400/40',
        spine: 'from-purple-500/60 via-purple-300/30 to-transparent'
      }
    ];
    let hash = 0;
    for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
    return themes[Math.abs(hash) % themes.length];
  };

  const theme = getBookCoverTheme(title);

  // If a valid image URL is supplied and hasn't errored
  if (imageUrl && !imgError && (!isLowDataMode || !isBookOrDoc)) {
    return (
      <div className={cn("relative overflow-hidden group select-none", resolvedAspect, className)}>
        {/* Real Cover Image */}
        <img
          src={imageUrl}
          alt={title}
          onError={() => setImgError(true)}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          referrerPolicy="no-referrer"
          loading="lazy"
        />

        {/* Ambient Vignette Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-black/30 pointer-events-none" />

        {/* Realistic Book Spine Effect for Books */}
        {isBookOrDoc && (
          <div className="absolute top-0 bottom-0 left-0 w-3 bg-gradient-to-r from-black/60 via-white/20 to-transparent shadow-inner pointer-events-none z-10" />
        )}

        {/* Video Overlay with Play Trigger */}
        {isVideo && (
          <div 
            onClick={onPlay}
            className="absolute inset-0 flex items-center justify-center bg-black/25 group-hover:bg-black/40 transition-colors cursor-pointer"
          >
            <div className="w-14 h-14 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-xl shadow-red-600/40 transform group-hover:scale-110 transition-transform backdrop-blur-xs border border-white/30">
              <Play className="w-6 h-6 fill-current ml-1 text-white" />
            </div>
            {duration && (
              <span className="absolute bottom-3 right-3 px-2 py-0.5 rounded-md bg-slate-950/90 text-white font-mono text-[10px] font-bold border border-white/20 backdrop-blur-xs">
                {duration}
              </span>
            )}
          </div>
        )}

        {/* Badge Overlay */}
        {showBadge && (
          <div className="absolute top-3 left-3 flex items-center gap-1.5 z-20">
            {isVideo ? (
              <span className="px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider bg-red-600 text-white shadow-md flex items-center gap-1">
                <Video className="w-3 h-3" /> VIDEO
              </span>
            ) : isBookOrDoc ? (
              <span className="px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider bg-indigo-600/90 text-white border border-white/20 backdrop-blur-xs shadow-md flex items-center gap-1">
                <BookOpen className="w-3 h-3 text-amber-300" /> BOOK / GUIDE
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider bg-slate-900/90 text-white border border-white/20 backdrop-blur-xs shadow-md">
                {normalizedType.toUpperCase()}
              </span>
            )}
          </div>
        )}

        {/* Bottom Title Bar on Image */}
        <div className="absolute bottom-2.5 left-3 right-3 z-10">
          <p className="text-white font-black text-xs sm:text-sm line-clamp-1 drop-shadow-md">
            {title}
          </p>
          {(author || category) && (
            <p className="text-slate-300 text-[10px] font-medium line-clamp-1 opacity-90 drop-shadow-xs">
              {author || category}
            </p>
          )}
        </div>
      </div>
    );
  }

  // --- DYNAMIC HIGH-AESTHETIC COVER GENERATION ---

  // 1. VIDEO COVER GENERATOR
  if (isVideo) {
    return (
      <div 
        onClick={onPlay}
        className={cn(
          "relative overflow-hidden bg-gradient-to-br from-slate-950 via-zinc-900 to-neutral-950 border border-slate-800 text-white flex flex-col justify-between p-4 group select-none shadow-lg cursor-pointer",
          resolvedAspect,
          className
        )}
      >
        {/* Subtle Scanline / Tech Matrix Backdrop */}
        <div 
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.2) 1px, transparent 0)`,
            backgroundSize: '16px 16px'
          }}
        />

        {/* Ambient Top Glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/15 rounded-full blur-3xl pointer-events-none" />

        {/* Top Video Header */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-wider bg-red-600 text-white shadow-md flex items-center gap-1">
              <Video className="w-3 h-3" /> VIDEO LESSON
            </span>
            {level && (
              <span className="px-2 py-0.5 rounded-md text-[9px] font-bold bg-slate-800/80 text-slate-300 border border-slate-700">
                {level}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 text-[10px] font-bold text-red-400 bg-red-950/60 px-2 py-0.5 rounded-md border border-red-800/40">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            <span>HD VIDEO</span>
          </div>
        </div>

        {/* Center Glowing Play Trigger */}
        <div className="relative z-10 my-auto flex flex-col items-center justify-center">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-red-500 to-rose-700 text-white flex items-center justify-center shadow-xl shadow-red-600/30 group-hover:scale-110 group-hover:shadow-red-600/60 transition-all border-2 border-white/20 backdrop-blur-xs">
            <Play className="w-7 h-7 sm:w-8 sm:h-8 fill-current ml-1 text-white" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-2 opacity-80 group-hover:text-white transition-colors">
            Tap To Watch
          </span>
        </div>

        {/* Bottom Banner */}
        <div className="relative z-10 pt-2 border-t border-slate-800/80">
          <h4 className="font-black text-white text-xs sm:text-sm line-clamp-1 group-hover:text-red-300 transition-colors">
            {title}
          </h4>
          <div className="flex items-center justify-between text-[10px] text-slate-400 mt-0.5">
            <span className="line-clamp-1">{author || category || 'YARA Masterclass Series'}</span>
            <span className="font-mono font-bold text-red-400 shrink-0 ml-2">
              {duration || '18:45'}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // 2. SCHEMATIC / BLUEPRINT COVER GENERATOR
  if (isSchematic) {
    return (
      <div 
        className={cn(
          "relative overflow-hidden bg-slate-950 border border-cyan-500/30 text-cyan-100 flex flex-col justify-between p-4 group select-none shadow-lg",
          resolvedAspect,
          className
        )}
      >
        {/* Technical Blueprint Grid Background */}
        <div 
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(to right, rgba(6, 182, 212, 0.3) 1px, transparent 1px), linear-gradient(to bottom, rgba(6, 182, 212, 0.3) 1px, transparent 1px)`,
            backgroundSize: '14px 14px'
          }}
        />

        <div className="relative z-10 flex items-center justify-between">
          <span className="px-2.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-widest bg-cyan-950 text-cyan-300 border border-cyan-500/40">
            SCHEMATIC • BLUEPRINT
          </span>
          <span className="text-[9px] font-mono text-cyan-400">DWG. NO. YARA-{title.slice(0, 4).toUpperCase()}</span>
        </div>

        <div className="relative z-10 my-auto text-center space-y-1.5 py-2">
          <div className="w-10 h-10 rounded-xl bg-cyan-900/40 border border-cyan-400/40 text-cyan-300 flex items-center justify-center mx-auto">
            <Cpu className="w-5 h-5" />
          </div>
          <h4 className="font-mono font-bold text-white text-xs sm:text-sm line-clamp-2 px-2">
            {title}
          </h4>
          <p className="text-[9px] font-mono text-cyan-400/80">
            PINOUT CONFIGURATION & POWER RAIL SPEC
          </p>
        </div>

        <div className="relative z-10 pt-2 border-t border-cyan-900/60 flex items-center justify-between text-[9px] font-mono text-cyan-400">
          <span>YARA HARDWARE LAB</span>
          <span>{fileSize || 'VERIFIED'}</span>
        </div>
      </div>
    );
  }

  // 3. MASTER BOOK COVER PAGE GENERATOR (For Books, E-Books, Handbooks & PDF Guides)
  return (
    <div 
      className={cn(
        "relative overflow-hidden rounded-r-2xl rounded-l-md border text-white flex flex-col justify-between p-4 sm:p-5 group select-none shadow-xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-0.5",
        theme.bg,
        theme.border,
        resolvedAspect,
        className
      )}
    >
      {/* 3D Realistic Book Spine Ridge on the Left */}
      <div 
        className={cn(
          "absolute top-0 bottom-0 left-0 w-3.5 bg-gradient-to-r shadow-inner pointer-events-none z-20",
          theme.spine
        )} 
      />
      
      {/* Subtle Inner Spine Crease Shadow */}
      <div className="absolute top-0 bottom-0 left-3 w-1 bg-black/40 pointer-events-none z-20" />

      {/* Tactile Diagonal Book Fabric Texture */}
      <div 
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `repeating-linear-gradient(45deg, rgba(255,255,255,0.1) 0, rgba(255,255,255,0.1) 1px, transparent 0, transparent 8px)`
        }}
      />

      {/* Gold/Silver Foil Top Header */}
      <div className="relative z-10 pl-2">
        <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-2">
          <div className="flex items-center gap-1.5">
            <div className={cn("w-2 h-2 rounded-full", theme.ribbon)} />
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-300">
              YARA ACADEMY PRESS
            </span>
          </div>
          <span className={cn("text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border", theme.badge)}>
            {level || 'OFFICIAL BOOK'}
          </span>
        </div>
      </div>

      {/* Central Book Cover Emblem & Embossed Title */}
      <div className="relative z-10 my-auto text-center pl-2 space-y-2 py-3">
        {/* Book Insignia Icon */}
        <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white flex items-center justify-center mx-auto shadow-inner group-hover:scale-105 transition-transform">
          <BookOpen className={cn("w-6 h-6", theme.accent)} />
        </div>

        {/* Embossed Title */}
        <h3 className="font-serif font-black text-white text-sm sm:text-base leading-snug tracking-tight px-1 drop-shadow-md line-clamp-3">
          {title}
        </h3>

        {/* Decorative Divider */}
        <div className="flex items-center justify-center gap-1.5 opacity-60">
          <div className="w-8 h-[1px] bg-white/40" />
          <Sparkles className={cn("w-3 h-3", theme.accent)} />
          <div className="w-8 h-[1px] bg-white/40" />
        </div>

        {/* Subtitle / Topics */}
        <p className="text-[10px] text-slate-300 font-medium leading-relaxed px-2 line-clamp-2 opacity-90">
          {subtitle || category || 'Curriculum Handbooks, Circuits & Laboratory Worksheets'}
        </p>
      </div>

      {/* Book Footnote / Author & Certification Seal */}
      <div className="relative z-10 pl-2 border-t border-white/10 pt-2 flex items-center justify-between text-[9px] text-slate-400">
        <div className="flex items-center gap-1 font-bold text-slate-300">
          <Bookmark className={cn("w-3 h-3", theme.accent)} />
          <span className="truncate max-w-[140px]">{author || 'Young Africans Robotics Association'}</span>
        </div>

        {fileSize ? (
          <span className="font-mono text-slate-400 shrink-0 font-semibold">{fileSize}</span>
        ) : (
          <span className="font-mono text-amber-300/80 shrink-0">EDITION 2026</span>
        )}
      </div>

      {/* Book Corner Bookmark Ribbon */}
      <div className="absolute top-0 right-4 w-3.5 h-6 bg-gradient-to-b from-amber-400 to-amber-600 rounded-b-sm shadow-md pointer-events-none z-20" />
    </div>
  );
}
