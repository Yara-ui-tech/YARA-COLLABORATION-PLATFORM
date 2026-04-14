import React from 'react';
import { Image as ImageIcon } from 'lucide-react';
import { cn } from '../lib/utils';
import { ASSETS } from '../constants/assets';

interface PlaceholderImageProps {
  className?: string;
  text?: string;
  type?: 'project' | 'avatar' | 'resource';
}

export default function PlaceholderImage({ className, text, type = 'project' }: PlaceholderImageProps) {
  const placeholderSrc = type === 'avatar' ? ASSETS.DEFAULT_AVATAR : 
                        type === 'resource' ? ASSETS.RESOURCE_PLACEHOLDER : 
                        ASSETS.PROJECT_PLACEHOLDER;

  return (
    <div className={cn(
      "w-full h-full bg-slate-100 flex flex-col items-center justify-center text-slate-400 gap-2 relative overflow-hidden group",
      className
    )}>
      <img 
        src={placeholderSrc} 
        alt="Placeholder" 
        className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
        referrerPolicy="no-referrer"
      />
      <div className="relative z-10 flex flex-col items-center justify-center gap-2">
        <ImageIcon className="w-8 h-8 opacity-20" />
        {text && <span className="text-[10px] font-bold uppercase tracking-widest opacity-40 bg-white/80 px-2 py-1 rounded-md backdrop-blur-sm">{text}</span>}
      </div>
    </div>
  );
}
