import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export type FontSizeOption = 'normal' | 'large' | 'xlarge';
export type HighContrastOption = 'none' | 'dark' | 'light';
export type ColorBlindOption = 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia' | 'monochrome';
export type DisabilityType = 'none' | 'visual' | 'hearing' | 'motor' | 'cognitive_dyslexia' | 'other';

export interface AccessibilitySettings {
  fontSize: FontSizeOption;
  highContrast: HighContrastOption;
  dyslexicFont: boolean;
  readingRuler: boolean;
  reducedMotion: boolean;
  colorBlindFilter: ColorBlindOption;
  disabilityType: DisabilityType;
  speechRate: number;
}

interface AccessibilityContextType {
  settings: AccessibilitySettings;
  updateSetting: <K extends keyof AccessibilitySettings>(key: K, value: AccessibilitySettings[K]) => void;
  resetSettings: () => void;
  isWidgetOpen: boolean;
  setIsWidgetOpen: (open: boolean) => void;
  toggleWidget: () => void;
  
  // Speech / TTS
  isSpeaking: boolean;
  speakText: (text: string) => void;
  stopSpeech: () => void;
  pauseSpeech: () => void;
  resumeSpeech: () => void;
  readPageContent: () => void;

  // Shortcuts Info
  shortcuts: { key: string; description: string }[];
}

const DEFAULT_SETTINGS: AccessibilitySettings = {
  fontSize: 'normal',
  highContrast: 'none',
  dyslexicFont: false,
  readingRuler: false,
  reducedMotion: false,
  colorBlindFilter: 'none',
  disabilityType: 'none',
  speechRate: 1.0,
};

const STORAGE_KEY = 'yara_accessibility_preferences_v1';

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export const AccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AccessibilitySettings>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
      }
      // Check system reduced motion
      const prefersReduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      return { ...DEFAULT_SETTINGS, reducedMotion: prefersReduced };
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  const [isWidgetOpen, setIsWidgetOpen] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [rulerY, setRulerY] = useState(200);

  // Apply settings to DOM
  useEffect(() => {
    const root = document.documentElement;

    // Font size
    root.classList.remove('text-size-large', 'text-size-xlarge');
    if (settings.fontSize === 'large') root.classList.add('text-size-large');
    if (settings.fontSize === 'xlarge') root.classList.add('text-size-xlarge');

    // High contrast
    root.classList.remove('high-contrast-dark', 'high-contrast-light');
    if (settings.highContrast === 'dark') root.classList.add('high-contrast-dark');
    if (settings.highContrast === 'light') root.classList.add('high-contrast-light');

    // Dyslexic font
    if (settings.dyslexicFont) {
      root.classList.add('dyslexic-friendly');
    } else {
      root.classList.remove('dyslexic-friendly');
    }

    // Reduced motion
    if (settings.reducedMotion) {
      root.classList.add('reduced-motion');
    } else {
      root.classList.remove('reduced-motion');
    }

    // Color blind filters
    root.classList.remove('cb-protanopia', 'cb-deuteranopia', 'cb-tritanopia', 'cb-monochrome');
    if (settings.colorBlindFilter !== 'none') {
      root.classList.add(`cb-${settings.colorBlindFilter}`);
    }

    // Persist
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (e) {
      console.warn('Could not store accessibility settings:', e);
    }
  }, [settings]);

  // Reading ruler mouse tracking
  useEffect(() => {
    if (!settings.readingRuler) return;
    const handleMouseMove = (e: MouseEvent) => {
      setRulerY(e.clientY);
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [settings.readingRuler]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore when user is actively typing in inputs or textareas
      const target = e.target as HTMLElement;
      if (target && ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) {
        return;
      }

      // Alt + A: Toggle Accessibility Widget
      if (e.altKey && (e.key === 'a' || e.key === 'A')) {
        e.preventDefault();
        setIsWidgetOpen(prev => !prev);
      }

      // Alt + S: Speak selected text or toggle speech
      if (e.altKey && (e.key === 's' || e.key === 'S')) {
        e.preventDefault();
        const selected = window.getSelection()?.toString().trim();
        if (selected) {
          speakText(selected);
        } else if (isSpeaking) {
          stopSpeech();
        } else {
          readPageContent();
        }
      }

      // Alt + C: Toggle High Contrast
      if (e.altKey && (e.key === 'c' || e.key === 'C')) {
        e.preventDefault();
        setSettings(prev => {
          const next = prev.highContrast === 'none' ? 'dark' : prev.highContrast === 'dark' ? 'light' : 'none';
          return { ...prev, highContrast: next };
        });
      }

      // Alt + R: Toggle Reading Ruler
      if (e.altKey && (e.key === 'r' || e.key === 'R')) {
        e.preventDefault();
        setSettings(prev => ({ ...prev, readingRuler: !prev.readingRuler }));
      }

      // Escape to close widget or stop speech
      if (e.key === 'Escape') {
        if (isWidgetOpen) setIsWidgetOpen(false);
        if (isSpeaking) stopSpeech();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isWidgetOpen, isSpeaking]);

  const updateSetting = useCallback(<K extends keyof AccessibilitySettings>(
    key: K,
    value: AccessibilitySettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  }, []);

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
    stopSpeech();
  }, []);

  const toggleWidget = useCallback(() => {
    setIsWidgetOpen(prev => !prev);
  }, []);

  // Text to Speech
  const speakText = useCallback((text: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      console.warn('Speech synthesis is not supported on this browser.');
      return;
    }
    window.speechSynthesis.cancel();
    if (!text.trim()) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = settings.speechRate || 1.0;
    utterance.pitch = 1.0;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  }, [settings.speechRate]);

  const stopSpeech = useCallback(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, []);

  const pauseSpeech = useCallback(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.pause();
      setIsSpeaking(false);
    }
  }, []);

  const resumeSpeech = useCallback(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.resume();
      setIsSpeaking(true);
    }
  }, []);

  const readPageContent = useCallback(() => {
    // Collect main headings and paragraphs
    const main = document.querySelector('main') || document.body;
    const elements = main.querySelectorAll('h1, h2, h3, p');
    const texts: string[] = [];
    elements.forEach(el => {
      const t = el.textContent?.trim();
      if (t && t.length > 5 && !el.closest('nav') && !el.closest('footer')) {
        texts.push(t);
      }
    });

    const fullText = texts.slice(0, 10).join('. ');
    if (fullText) {
      speakText(fullText);
    }
  }, [speakText]);

  const shortcuts = [
    { key: 'Alt + A', description: 'Open / Close Accessibility & Assistive Tools' },
    { key: 'Alt + S', description: 'Read Aloud Page or Selected Text (TTS)' },
    { key: 'Alt + C', description: 'Cycle High Contrast Modes (Dark / Light / Normal)' },
    { key: 'Alt + R', description: 'Toggle Reading Focus Ruler' },
    { key: 'Escape', description: 'Stop Speech / Close Accessibility Menu' },
  ];

  return (
    <AccessibilityContext.Provider
      value={{
        settings,
        updateSetting,
        resetSettings,
        isWidgetOpen,
        setIsWidgetOpen,
        toggleWidget,
        isSpeaking,
        speakText,
        stopSpeech,
        pauseSpeech,
        resumeSpeech,
        readPageContent,
        shortcuts,
      }}
    >
      {children}

      {/* Interactive Reading Ruler Overlay */}
      {settings.readingRuler && (
        <div
          id="yara-reading-ruler"
          aria-hidden="true"
          style={{ top: `${rulerY}px` }}
          className="fixed left-0 w-full pointer-events-none z-[99999] transition-all duration-75"
        >
          <div className="w-full h-10 bg-amber-400/20 border-y-2 border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.25)]" />
        </div>
      )}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = (): AccessibilityContextType => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
};
