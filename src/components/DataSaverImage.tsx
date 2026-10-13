import React, { useState } from 'react';
import { Image as ImageIcon, Download } from 'lucide-react';
import { useRuralAccessibility } from '../context/RuralAccessibilityContext';
import { cn } from '../lib/utils';

interface DataSaverImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  lowResSrc?: string;
  alt: string;
  estimatedBytes?: number;
  className?: string;
}

export default function DataSaverImage({
  src,
  lowResSrc,
  alt,
  estimatedBytes,
  className,
  ...props
}: DataSaverImageProps) {
  const { isLowDataMode, formatFileSize } = useRuralAccessibility();
  const [isLoaded, setIsLoaded] = useState(false);
  const [userLoaded, setUserLoaded] = useState(false);

  // If low data mode is active, don't auto-download unless user tapped or low-res is available
  if (isLowDataMode && !userLoaded) {
    const sizeLabel = estimatedBytes ? formatFileSize(estimatedBytes) : '45 KB';

    return (
      <div 
        onClick={() => setUserLoaded(true)}
        className={cn(
          "relative flex flex-col items-center justify-center p-4 bg-slate-900 border border-slate-800 rounded-2xl cursor-pointer hover:bg-slate-850 hover:border-amber-500/40 transition group text-center min-h-[140px]",
          className
        )}
        title="Tap to load high-res image"
      >
        <div className="w-10 h-10 rounded-xl bg-amber-400/10 text-amber-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
          <ImageIcon className="w-5 h-5" />
        </div>
        <span className="text-xs font-bold text-slate-200 group-hover:text-amber-400 transition-colors">
          Tap to load image
        </span>
        <span className="text-[10px] text-slate-500 font-medium mt-0.5">
          Data Saver Mode · ~{sizeLabel}
        </span>
      </div>
    );
  }

  const effectiveSrc = isLowDataMode && lowResSrc ? lowResSrc : src;

  return (
    <img
      src={effectiveSrc}
      alt={alt}
      loading="lazy"
      onLoad={() => setIsLoaded(true)}
      className={cn(
        "transition-opacity duration-300",
        !isLoaded ? "opacity-0" : "opacity-100",
        className
      )}
      {...props}
    />
  );
}
