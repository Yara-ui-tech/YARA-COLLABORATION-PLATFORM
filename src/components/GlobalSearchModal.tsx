import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, BookOpen, Globe, FileText, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { yaraV3Service } from '../services/v3/yaraV3Service';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function GlobalSearchModal({ isOpen, onClose }: Props) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{ courses: any[]; library: any[]; chapters: any[] }>({
    courses: [],
    library: [],
    chapters: []
  });
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setResults({ courses: [], library: [], chapters: [] });
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!query.trim()) {
      setResults({ courses: [], library: [], chapters: [] });
      setLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await yaraV3Service.globalSearch(query);
        setResults(res);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (url: string) => {
    onClose();
    navigate(url);
  };

  const totalResults = results.courses.length + results.library.length + results.chapters.length;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-950/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
        >
          {/* Search Input Bar */}
          <div className="relative border-b border-slate-800 p-4 flex items-center gap-3">
            <Search className="w-5 h-5 text-slate-400 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search courses, library books, and YARA chapters..."
              className="w-full bg-transparent text-white placeholder-slate-500 text-sm focus:outline-hidden"
            />
            {loading && <Loader2 className="w-4 h-4 text-blue-400 animate-spin shrink-0" />}
            {query && !loading && (
              <button onClick={() => setQuery('')} className="text-slate-400 hover:text-white p-1">
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="text-xs bg-slate-800 text-slate-400 px-2 py-1 rounded-lg border border-slate-700 hover:text-white shrink-0"
            >
              Esc
            </button>
          </div>

          {/* Results Area */}
          <div className="p-4 overflow-y-auto space-y-6 flex-1">
            {!query && (
              <div className="py-8 text-center text-slate-500 text-xs">
                <Sparkles className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p>Type to search courses (`v_course_catalog`), library (`search_library`) and chapters (`v_chapter_directory`).</p>
              </div>
            )}

            {query && !loading && totalResults === 0 && (
              <div className="py-8 text-center text-slate-400 text-xs">
                No matching results found for "{query}".
              </div>
            )}

            {/* Courses */}
            {results.courses.length > 0 && (
              <div className="space-y-2">
                <div className="text-[10px] font-black uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Courses ({results.courses.length})</span>
                </div>
                <div className="space-y-1">
                  {results.courses.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => handleSelect(`/learning?course=${c.id}`)}
                      className="w-full text-left p-2.5 rounded-xl bg-slate-800/40 hover:bg-slate-800 border border-slate-800/80 hover:border-blue-500/30 flex items-center justify-between group transition"
                    >
                      <div>
                        <div className="text-xs font-bold text-white group-hover:text-blue-400 transition-colors">
                          {c.title}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate max-w-md">
                          {c.subtitle || c.level || 'Robotics Course'}
                        </div>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-blue-400 group-hover:translate-x-1 transition" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Library Items */}
            {results.library.length > 0 && (
              <div className="space-y-2">
                <div className="text-[10px] font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" />
                  <span>Library & Materials ({results.library.length})</span>
                </div>
                <div className="space-y-1">
                  {results.library.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleSelect(`/resources?id=${item.id}`)}
                      className="w-full text-left p-2.5 rounded-xl bg-slate-800/40 hover:bg-slate-800 border border-slate-800/80 hover:border-emerald-500/30 flex items-center justify-between group transition"
                    >
                      <div>
                        <div className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors">
                          {item.title}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate max-w-md">
                          {item.item_type || item.file_type || 'Document'} · {item.description || 'Library study material'}
                        </div>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Chapters */}
            {results.chapters.length > 0 && (
              <div className="space-y-2">
                <div className="text-[10px] font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5" />
                  <span>Chapters & Locations ({results.chapters.length})</span>
                </div>
                <div className="space-y-1">
                  {results.chapters.map((ch) => (
                    <button
                      key={ch.id}
                      onClick={() => handleSelect(`/chapters?chapter=${ch.id}`)}
                      className="w-full text-left p-2.5 rounded-xl bg-slate-800/40 hover:bg-slate-800 border border-slate-800/80 hover:border-amber-500/30 flex items-center justify-between group transition"
                    >
                      <div>
                        <div className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors">
                          {ch.name}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {ch.province} · {ch.institution_or_community || ch.district_or_city}
                        </div>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-1 transition" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="p-3 bg-slate-950 border-t border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
            <span>YARA Search v3.3</span>
            <span>Press Esc to close</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
