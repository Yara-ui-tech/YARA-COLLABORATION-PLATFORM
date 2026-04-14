import React, { useState } from 'react';
import { Image as ImageIcon, Code2, Users, BookOpen, Zap, Trophy, Rocket } from 'lucide-react';
import { cn } from '../lib/utils';
import { ASSETS } from '../constants/assets';

interface PlaceholderImageProps {
  className?: string;
  text?: string;
  type?: 'project' | 'avatar' | 'resource' | 'event' | 'mentor';
  seed?: string;
}

// Tech-themed gradient backgrounds for different types
const getGradient = (type: string, seed?: string) => {
  const gradients: Record<string, string[]> = {
    project: ['from-indigo-600 to-purple-600', 'from-cyan-500 to-indigo-600', 'from-purple-600 to-pink-600'],
    avatar: ['from-emerald-500 to-teal-600', 'from-orange-500 to-red-600', 'from-blue-600 to-cyan-600', 'from-pink-600 to-rose-600'],
    event: ['from-amber-500 to-orange-600', 'from-rose-600 to-pink-600', 'from-lime-500 to-green-600'],
    mentor: ['from-indigo-600 to-blue-600', 'from-violet-600 to-purple-600', 'from-cyan-600 to-blue-600'],
    resource: ['from-blue-600 to-indigo-600', 'from-green-600 to-emerald-600', 'from-purple-600 to-indigo-600'],
  };

  const typeGradients = gradients[type] || gradients.project;
  const index = seed 
    ? seed.charCodeAt(0) % typeGradients.length 
    : Math.floor(Math.random() * typeGradients.length);
  
  return typeGradients[index];
};

// Icon mapping for different types
const getIcon = (type: string) => {
  const icons: Record<string, React.ReactNode> = {
    project: <Code2 className="w-12 h-12" />,
    avatar: <Users className="w-12 h-12" />,
    event: <Trophy className="w-12 h-12" />,
    mentor: <Zap className="w-12 h-12" />,
    resource: <BookOpen className="w-12 h-12" />,
  };
  return icons[type] || <ImageIcon className="w-12 h-12" />;
};

export default function PlaceholderImage({ 
  className, 
  text, 
  type = 'project',
  seed 
}: PlaceholderImageProps) {
  const [isLoading, setIsLoading] = useState(false);
  const placeholderSrc = type === 'avatar' ? ASSETS.DEFAULT_AVATAR : 
                        type === 'resource' ? ASSETS.RESOURCE_PLACEHOLDER : 
                        type === 'event' ? ASSETS.EVENT_PLACEHOLDER :
                        ASSETS.PROJECT_PLACEHOLDER;

  const gradient = getGradient(type, seed);
  const icon = getIcon(type);

  return (
    <div className={cn(
      `w-full h-full relative overflow-hidden transition-all duration-500`,
      `bg-gradient-to-br ${gradient}`,
      className
    )}>
      {/* Animated tech grid background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(0deg, transparent 24%, rgba(255,255,255,.05) 25%, rgba(255,255,255,.05) 26%, transparent 27%, transparent 74%, rgba(255,255,255,.05) 75%, rgba(255,255,255,.05) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(255,255,255,.05) 25%, rgba(255,255,255,.05) 26%, transparent 27%, transparent 74%, rgba(255,255,255,.05) 75%, rgba(255,255,255,.05) 76%, transparent 77%, transparent)',
          backgroundSize: '50px 50px'
        }} />
      </div>

      {/* Glowing orbs for tech aesthetic */}
      <div className="absolute top-2 right-2 w-16 h-16 bg-white/10 rounded-full blur-2xl animate-pulse" />
      <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-white/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '0.5s' }} />

      {/* Content */}
      <div className="relative z-10 w-full h-full flex flex-col items-center justify-center gap-3 p-4">
        <div className="text-white/90 transform transition-transform duration-500 hover:scale-110">
          {icon}
        </div>
        
        {text && (
          <div className="text-white font-bold text-center">
            <p className="text-sm opacity-90 tracking-wider uppercase">{text}</p>
          </div>
        )}
        
        {/* Type label */}
        <div className="text-white/60 text-xs font-medium mt-1 uppercase tracking-widest">
          {type}
        </div>
      </div>

      {/* Shimmer animation on hover */}
      <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-500">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 animate-shimmer" />
      </div>
    </div>
  );
}
