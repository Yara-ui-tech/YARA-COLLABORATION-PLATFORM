import React, { createContext, useContext, useState, useEffect } from 'react';

interface RuralAccessibilityContextType {
  isLowDataMode: boolean;
  toggleLowDataMode: () => void;
  setLowDataMode: (enabled: boolean) => void;
  formatFileSize: (bytes?: number | null) => string;
}

const RuralAccessibilityContext = createContext<RuralAccessibilityContextType | undefined>(undefined);

export const RuralAccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLowDataMode, setIsLowDataModeState] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem('yara_low_data_mode');
      if (stored !== null) return stored === 'true';
      // Detect if user has Save-Data enabled in browser
      if (typeof navigator !== 'undefined' && (navigator as any).connection?.saveData) {
        return true;
      }
      return false;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('yara_low_data_mode', String(isLowDataMode));
      if (isLowDataMode) {
        document.documentElement.classList.add('low-data-mode');
      } else {
        document.documentElement.classList.remove('low-data-mode');
      }
    } catch (err) {
      console.error('Error persisting low-data mode:', err);
    }
  }, [isLowDataMode]);

  const toggleLowDataMode = () => {
    setIsLowDataModeState(prev => !prev);
  };

  const setLowDataMode = (enabled: boolean) => {
    setIsLowDataModeState(enabled);
  };

  const formatFileSize = (bytes?: number | null): string => {
    if (!bytes || bytes <= 0) return 'Unknown size';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <RuralAccessibilityContext.Provider
      value={{
        isLowDataMode,
        toggleLowDataMode,
        setLowDataMode,
        formatFileSize
      }}
    >
      {children}
    </RuralAccessibilityContext.Provider>
  );
};

export const useRuralAccessibility = (): RuralAccessibilityContextType => {
  const context = useContext(RuralAccessibilityContext);
  if (!context) {
    throw new Error('useRuralAccessibility must be used within a RuralAccessibilityProvider');
  }
  return context;
};
