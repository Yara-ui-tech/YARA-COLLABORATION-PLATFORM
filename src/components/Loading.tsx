import React from 'react';
import { motion } from 'motion/react';

interface LoadingProps {
  text?: string;
  fullScreen?: boolean;
}

export default function Loading({ text = 'Loading...', fullScreen = false }: LoadingProps) {
  const containerClass = fullScreen 
    ? 'fixed inset-0 z-50' 
    : '';

  return (
    <div className={`flex items-center justify-center ${containerClass} ${fullScreen ? 'bg-white/80 backdrop-blur-sm' : ''}`}>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-4"
      >
        {/* Animated gradient orbs */}
        <div className="relative w-16 h-16">
          <motion.div
            className="absolute inset-0 rounded-full border-4 border-transparent border-t-indigo-600 border-r-purple-600"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          />
          <motion.div
            className="absolute inset-2 rounded-full border-4 border-transparent border-b-cyan-600 border-l-blue-600"
            animate={{ rotate: -360 }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          />
          
          {/* Center dot */}
          <motion.div
            className="absolute top-1/2 left-1/2 w-3 h-3 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full"
            style={{ transform: 'translate(-50%, -50%)' }}
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        </div>

        {/* Text */}
        {text && (
          <motion.p
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-sm font-bold text-slate-600 text-center"
          >
            {text}
          </motion.p>
        )}
      </motion.div>
    </div>
  );
}
