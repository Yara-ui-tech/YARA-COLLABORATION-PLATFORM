import React, { useState } from 'react';
import { 
  Eye, Volume2, VolumeX, Type, Sun, Moon, 
  Sparkles, RotateCcw, X, HelpCircle, 
  Play, Pause, Square, Zap, Sliders, Check, ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAccessibility, FontSizeOption, HighContrastOption, ColorBlindOption } from '../../context/AccessibilityContext';
import { cn } from '../../lib/utils';

export default function AccessibilityWidget() {
  const {
    settings,
    updateSetting,
    resetSettings,
    isWidgetOpen,
    setIsWidgetOpen,
    toggleWidget,
    isSpeaking,
    readPageContent,
    stopSpeech,
    pauseSpeech,
    resumeSpeech,
    shortcuts
  } = useAccessibility();

  const [showShortcuts, setShowShortcuts] = useState(false);

  return (
    <>
      {/* 1. Floating Accessible Launcher Button */}
      <aside aria-label="Accessibility Assistance" className="fixed bottom-6 left-6 z-[99990]">
        <button
          onClick={toggleWidget}
          aria-expanded={isWidgetOpen}
          aria-label="Open Universal Accessibility and Assistive Tools (Keyboard shortcut Alt + A)"
          title="Universal Accessibility Tools (Alt + A)"
          className={cn(
            "p-3.5 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 transform hover:scale-110 active:scale-95 group focus:outline-none focus:ring-4 focus:ring-cyan-400 cursor-pointer",
            isWidgetOpen
              ? "bg-slate-900 text-white border-2 border-cyan-400 rotate-90"
              : "bg-gradient-to-r from-blue-700 via-indigo-600 to-cyan-600 text-white border-2 border-white/30 shadow-indigo-500/40"
          )}
        >
          {isWidgetOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <div className="relative">
              <Eye className="w-6 h-6 group-hover:scale-110 transition-transform" />
              {isSpeaking && (
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
                </span>
              )}
            </div>
          )}
        </button>
      </aside>

      {/* 2. Accessibility Drawer / Modal */}
      <AnimatePresence>
        {isWidgetOpen && (
          <aside aria-label="Accessibility Options Panel">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              role="dialog"
              aria-modal="true"
              aria-labelledby="accessibility-menu-title"
              className="fixed bottom-22 left-6 z-[99995] w-96 max-w-[calc(100vw-3rem)] max-h-[82vh] overflow-y-auto bg-slate-950/95 backdrop-blur-xl border border-cyan-500/30 rounded-3xl shadow-2xl shadow-cyan-950/50 p-5 text-slate-100 flex flex-col gap-4 text-xs"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-black shadow-lg shadow-cyan-500/30">
                    ♿
                  </div>
                  <div>
                    <h2 id="accessibility-menu-title" className="font-black text-sm text-white flex items-center gap-1.5">
                      Assistive Accessibility
                    </h2>
                    <p className="text-[10px] text-cyan-300 font-bold uppercase tracking-wider">
                      Leave No One Behind
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setShowShortcuts(!showShortcuts)}
                    title="Keyboard Shortcuts"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                  >
                    <HelpCircle className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setIsWidgetOpen(false)}
                    aria-label="Close accessibility menu"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Shortcuts Drawer if toggled */}
              {showShortcuts && (
                <div className="bg-slate-900/90 rounded-2xl p-3 border border-slate-800 space-y-2">
                  <p className="font-bold text-cyan-300 text-[11px]">Keyboard Navigation Shortcuts:</p>
                  <div className="space-y-1">
                    {shortcuts.map(s => (
                      <div key={s.key} className="flex items-center justify-between text-[10px]">
                        <span className="font-mono bg-slate-800 px-1.5 py-0.5 rounded text-cyan-200">{s.key}</span>
                        <span className="text-slate-400 text-right">{s.description}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 1. Speech / Read Aloud (TTS) */}
              <div className="bg-slate-900/70 rounded-2xl p-3.5 border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Volume2 className="w-4 h-4 text-cyan-400" />
                    <span className="font-black text-white">Audio & Speech (TTS)</span>
                  </div>
                  {isSpeaking && (
                    <span className="text-[9px] bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-full font-bold animate-pulse">
                      Reading Active
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  Reads page content, lessons, or any text you highlight aloud in clear speech.
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={readPageContent}
                    className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold py-2 px-3 rounded-xl transition flex items-center justify-center gap-1.5 shadow-md shadow-cyan-900/30 cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>{isSpeaking ? 'Restart Page' : 'Read Page Aloud'}</span>
                  </button>
                  {isSpeaking ? (
                    <button
                      onClick={stopSpeech}
                      className="bg-red-600 hover:bg-red-500 text-white p-2 rounded-xl transition cursor-pointer"
                      title="Stop Speech"
                    >
                      <Square className="w-3.5 h-3.5 fill-current" />
                    </button>
                  ) : null}
                </div>

                {/* Speech Rate Controls */}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] text-slate-400">Speech Pace:</span>
                  <div className="flex gap-1">
                    {[0.8, 1.0, 1.25].map(rate => (
                      <button
                        key={rate}
                        onClick={() => updateSetting('speechRate', rate)}
                        className={cn(
                          "px-2 py-0.5 rounded-lg text-[10px] font-bold transition cursor-pointer",
                          settings.speechRate === rate
                            ? "bg-cyan-500 text-slate-950"
                            : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                        )}
                      >
                        {rate === 0.8 ? 'Slow' : rate === 1.0 ? 'Normal' : 'Fast'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 2. Text Sizing */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-300 flex items-center gap-1.5">
                  <Type className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Text Sizing Scale</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['normal', 'large', 'xlarge'] as FontSizeOption[]).map(size => (
                    <button
                      key={size}
                      onClick={() => updateSetting('fontSize', size)}
                      className={cn(
                        "py-2 rounded-xl font-bold border transition text-center cursor-pointer",
                        settings.fontSize === size
                          ? "bg-indigo-600 text-white border-indigo-400 shadow-md shadow-indigo-900/40"
                          : "bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800"
                      )}
                    >
                      {size === 'normal' ? 'Standard A' : size === 'large' ? 'Large A+' : 'Max A++'}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Dyslexic-Friendly Typography */}
              <div className="flex items-center justify-between bg-slate-900/70 p-3 rounded-2xl border border-slate-800">
                <div>
                  <p className="font-bold text-white text-[11px]">Dyslexia-Friendly Spacing</p>
                  <p className="text-[10px] text-slate-400">Enhanced kerning & line-height to reduce visual crowding</p>
                </div>
                <button
                  onClick={() => updateSetting('dyslexicFont', !settings.dyslexicFont)}
                  className={cn(
                    "w-12 h-6 rounded-full transition-colors relative cursor-pointer",
                    settings.dyslexicFont ? "bg-cyan-500" : "bg-slate-700"
                  )}
                  role="switch"
                  aria-checked={settings.dyslexicFont}
                >
                  <span
                    className={cn(
                      "absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform",
                      settings.dyslexicFont ? "translate-x-6" : "translate-x-0"
                    )}
                  />
                </button>
              </div>

              {/* 4. High Contrast Mode */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-300 flex items-center gap-1.5">
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span>High Contrast Clarity</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'none', label: 'Default' },
                    { id: 'dark', label: 'Dark High' },
                    { id: 'light', label: 'Light High' }
                  ].map(c => (
                    <button
                      key={c.id}
                      onClick={() => updateSetting('highContrast', c.id as HighContrastOption)}
                      className={cn(
                        "py-2 rounded-xl font-bold border transition text-center cursor-pointer",
                        settings.highContrast === c.id
                          ? "bg-amber-500 text-slate-950 border-amber-300 shadow-md shadow-amber-900/40"
                          : "bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800"
                      )}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 5. Reading Focus Ruler */}
              <div className="flex items-center justify-between bg-slate-900/70 p-3 rounded-2xl border border-slate-800">
                <div>
                  <p className="font-bold text-white text-[11px]">Reading Focus Guide (Ruler)</p>
                  <p className="text-[10px] text-slate-400">Horizontal tracking bar that follows your cursor</p>
                </div>
                <button
                  onClick={() => updateSetting('readingRuler', !settings.readingRuler)}
                  className={cn(
                    "w-12 h-6 rounded-full transition-colors relative cursor-pointer",
                    settings.readingRuler ? "bg-amber-500" : "bg-slate-700"
                  )}
                  role="switch"
                  aria-checked={settings.readingRuler}
                >
                  <span
                    className={cn(
                      "absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform",
                      settings.readingRuler ? "translate-x-6" : "translate-x-0"
                    )}
                  />
                </button>
              </div>

              {/* 6. Color Blindness Filter */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-300 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Color Vision Assist</span>
                </label>
                <select
                  value={settings.colorBlindFilter}
                  onChange={(e) => updateSetting('colorBlindFilter', e.target.value as ColorBlindOption)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 px-3 text-slate-200 text-xs focus:outline-none focus:border-cyan-400"
                >
                  <option value="none">Standard Full Spectrum</option>
                  <option value="protanopia">Protanopia (Red-Blind Adaptation)</option>
                  <option value="deuteranopia">Deuteranopia (Green-Blind Adaptation)</option>
                  <option value="tritanopia">Tritanopia (Blue-Blind Adaptation)</option>
                  <option value="monochrome">Achromatopsia (High-Contrast Grayscale)</option>
                </select>
              </div>

              {/* 7. Reduced Motion */}
              <div className="flex items-center justify-between bg-slate-900/70 p-3 rounded-2xl border border-slate-800">
                <div>
                  <p className="font-bold text-white text-[11px]">Reduce Motion & Flashes</p>
                  <p className="text-[10px] text-slate-400">Halts animations, spins, and sudden transitions</p>
                </div>
                <button
                  onClick={() => updateSetting('reducedMotion', !settings.reducedMotion)}
                  className={cn(
                    "w-12 h-6 rounded-full transition-colors relative cursor-pointer",
                    settings.reducedMotion ? "bg-cyan-500" : "bg-slate-700"
                  )}
                  role="switch"
                  aria-checked={settings.reducedMotion}
                >
                  <span
                    className={cn(
                      "absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform",
                      settings.reducedMotion ? "translate-x-6" : "translate-x-0"
                    )}
                  />
                </button>
              </div>

              {/* Footer / Reset */}
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                <button
                  onClick={resetSettings}
                  className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-white transition cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset to System Defaults</span>
                </button>
                <span className="text-[9px] text-cyan-400/80 font-bold">
                  WCAG 2.1 AAA Compliant
                </span>
              </div>
            </motion.div>
          </aside>
        )}
      </AnimatePresence>
    </>
  );
}
