/**
 * Tech-themed color system and animation utilities
 */

export const TECH_COLORS = {
  primary: {
    50: '#eef2ff',
    600: '#4f46e5',
    700: '#4338ca',
    900: '#251566',
  },
  gradients: {
    indigo_purple: 'from-indigo-600 to-purple-600',
    cyan_blue: 'from-cyan-500 to-blue-600',
    emerald_teal: 'from-emerald-500 to-teal-600',
    rose_pink: 'from-rose-600 to-pink-600',
    amber_orange: 'from-amber-500 to-orange-600',
    violet_purple: 'from-violet-600 to-purple-600',
  },
  accents: {
    success: 'emerald',
    warning: 'amber',
    danger: 'red',
    info: 'blue',
    secondary: 'purple',
  }
};

export const ANIMATION_VARIANTS = {
  containerFade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.3 }
  },
  itemSlideUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  },
  itemScale: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
  },
  popIn: {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.8 },
    transition: { type: 'spring', stiffness: 200 }
  },
  float: {
    animate: {
      y: [0, -10, 0],
    },
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: 'easeInOut'
    }
  }
};

export const getRandomGradient = (seed?: number): string => {
  const gradients = Object.values(TECH_COLORS.gradients);
  const index = seed ? seed % gradients.length : Math.floor(Math.random() * gradients.length);
  return gradients[index];
};

export const getTechColor = (type: string, intensity: number = 600): string => {
  const colorMap: Record<string, string> = {
    primary: `indigo-${intensity}`,
    secondary: `purple-${intensity}`,
    success: `emerald-${intensity}`,
    warning: `amber-${intensity}`,
    danger: `red-${intensity}`,
    info: `blue-${intensity}`,
  };
  return colorMap[type] || `indigo-${intensity}`;
};
