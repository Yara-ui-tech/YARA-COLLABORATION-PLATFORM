import React, { useState, useEffect } from 'react';
import { 
  BookOpen, Lock, ShieldCheck, Search, ChevronRight, 
  Sparkles, FileText, CheckCircle2, AlertTriangle, HelpCircle, 
  Layers, Copy, Eye, Bookmark, X, AlertCircle, ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { BootcampDocument, OFFICIAL_AI_HANDBOOK, getBootcampDocuments } from '../../services/bootcampDocumentService';

interface SecuredHandbookViewerProps {
  isAccessGranted: boolean;
  userEmail?: string;
  userName?: string;
  selectedDocId?: string;
}

export default function SecuredHandbookViewer({
  isAccessGranted,
  userEmail,
  userName,
  selectedDocId
}: SecuredHandbookViewerProps) {
  const [documents, setDocuments] = useState<BootcampDocument[]>([]);
  const [activeDoc, setActiveDoc] = useState<BootcampDocument>(OFFICIAL_AI_HANDBOOK);
  const [activeModuleIndex, setActiveModuleIndex] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSecurityAlert, setShowSecurityAlert] = useState(false);

  // Load documents on mount and listen for admin updates
  useEffect(() => {
    const docs = getBootcampDocuments();
    setDocuments(docs);
    if (selectedDocId) {
      const match = docs.find(d => d.id === selectedDocId);
      if (match) setActiveDoc(match);
    }

    const handleUpdate = () => {
      const updated = getBootcampDocuments();
      setDocuments(updated);
    };

    window.addEventListener('yara_bootcamp_docs_updated', handleUpdate);
    return () => window.removeEventListener('yara_bootcamp_docs_updated', handleUpdate);
  }, [selectedDocId]);

  // Keyboard shortcut listener to prevent Ctrl+P, Ctrl+S, Inspect
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isAccessGranted) return;
      const isCmdOrCtrl = e.metaKey || e.ctrlKey;
      if (
        (isCmdOrCtrl && (e.key === 'p' || e.key === 'P' || e.key === 's' || e.key === 'S' || e.key === 'u' || e.key === 'U')) ||
        e.key === 'F12'
      ) {
        e.preventDefault();
        e.stopPropagation();
        setShowSecurityAlert(true);
        setTimeout(() => setShowSecurityAlert(false), 4000);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAccessGranted]);

  if (!isAccessGranted) {
    return (
      <div className="p-8 bg-slate-900 text-white rounded-3xl border border-slate-800 text-center max-w-2xl mx-auto shadow-2xl space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 mx-auto">
          <Lock className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <span className="px-3 py-1 bg-amber-500/20 text-amber-300 rounded-full text-[10px] font-black uppercase tracking-wider">
            Restricted Content — Admin Approval Required
          </span>
          <h3 className="text-2xl font-black text-white">AI for Educators Official Handbook</h3>
          <p className="text-xs text-slate-300 leading-relaxed max-w-md mx-auto">
            This official 80-page training handbook and bootcamp document vault is strictly reserved for educators who have registered and been approved by the YARA Administrator.
          </p>
        </div>

        <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 text-left text-xs text-slate-400 space-y-2">
          <div className="flex items-center space-x-2 text-emerald-400 font-bold">
            <ShieldCheck className="w-4 h-4" />
            <span>How to gain immediate access:</span>
          </div>
          <ul className="space-y-1 list-disc list-inside text-slate-300 text-[11px]">
            <li>Register for the AI for Educators Bootcamp ($10 USD fee).</li>
            <li>Submit your payment reference for administrator review.</li>
            <li>Once verified by admin, full handbook access is automatically unlocked.</li>
          </ul>
        </div>
      </div>
    );
  }

  const currentModule = activeDoc.modules[activeModuleIndex] || activeDoc.modules[0];

  // Filter sections by search term
  const filteredSections = currentModule?.sections?.filter(sec => 
    !searchTerm || 
    sec.heading.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (typeof sec.content === 'string' && sec.content.toLowerCase().includes(searchTerm.toLowerCase()))
  ) || [];

  return (
    <div 
      className="relative bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden select-none"
      onContextMenu={(e) => {
        e.preventDefault();
        setShowSecurityAlert(true);
        setTimeout(() => setShowSecurityAlert(false), 3000);
      }}
      style={{
        WebkitUserSelect: 'none',
        MozUserSelect: 'none',
        msUserSelect: 'none',
        userSelect: 'none'
      }}
    >
      {/* SECURITY WATERMARK OVERLAY */}
      <div 
        className="absolute inset-0 pointer-events-none z-10 opacity-[0.03] flex items-center justify-center rotate-[-25deg] overflow-hidden"
        aria-hidden="true"
      >
        <p className="text-4xl font-black uppercase text-slate-950 whitespace-nowrap tracking-widest">
          CONFIDENTIAL • APPROVED EDUCATOR ACCESS ONLY • DO NOT DISTRIBUTE • YARA {userEmail ? `(${userEmail})` : ''}
        </p>
      </div>

      {/* NO-DOWNLOAD SECURITY NOTIFICATION BANNER */}
      <AnimatePresence>
        {showSecurityAlert && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 bg-slate-950 text-white rounded-2xl border border-amber-500/50 shadow-2xl flex items-center space-x-3 text-xs"
          >
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <div>
              <span className="font-bold text-amber-300">Protected Document Access:</span>
              <p className="text-[11px] text-slate-300">Downloading, printing, and copying are disabled to preserve document integrity.</p>
            </div>
            <button 
              onClick={() => setShowSecurityAlert(false)}
              className="text-slate-400 hover:text-white p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HEADER BAR */}
      <div className="bg-slate-950 text-white p-6 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 text-[10px] font-black uppercase tracking-wider">
              {activeDoc.version}
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> Protected • Read-Only
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-black tracking-tight text-white">{activeDoc.title}</h2>
          <p className="text-xs text-slate-300">{activeDoc.subtitle}</p>
        </div>

        {/* Document Selector if multiple exist */}
        {documents.length > 1 && (
          <div className="shrink-0">
            <select
              value={activeDoc.id}
              onChange={(e) => {
                const found = documents.find(d => d.id === e.target.value);
                if (found) {
                  setActiveDoc(found);
                  setActiveModuleIndex(0);
                }
              }}
              className="bg-slate-900 text-slate-200 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-blue-500"
            >
              {documents.map(d => (
                <option key={d.id} value={d.id}>
                  {d.title} ({d.category})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* SUB-HEADER CONTROLS & SEARCH */}
      <div className="bg-slate-50 border-b border-slate-200 p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center space-x-2 overflow-x-auto max-w-full scrollbar-none py-1">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider shrink-0 mr-1">Modules:</span>
          {activeDoc.modules.map((m, idx) => (
            <button
              key={m.id}
              onClick={() => {
                setActiveModuleIndex(idx);
                setSearchTerm('');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                activeModuleIndex === idx
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {typeof m.number === 'number' ? `Mod ${m.number}` : m.number}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64 shrink-0">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search handbook topics..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-600 placeholder-slate-400"
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* MAIN READER CONTAINER */}
      <div className="grid grid-cols-1 lg:grid-cols-4 min-h-[500px]">
        {/* MODULE TOC SIDEBAR */}
        <div className="p-4 bg-slate-50 border-r border-slate-200 space-y-2 overflow-y-auto max-h-[600px]">
          <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider px-2">Table of Contents</span>
          <div className="space-y-1">
            {activeDoc.modules.map((m, idx) => (
              <button
                key={m.id}
                onClick={() => {
                  setActiveModuleIndex(idx);
                  setSearchTerm('');
                }}
                className={`w-full text-left p-3 rounded-2xl transition-all flex items-start space-x-2.5 cursor-pointer ${
                  activeModuleIndex === idx
                    ? 'bg-white border-2 border-blue-600 shadow-sm text-slate-900 font-bold'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-transparent'
                }`}
              >
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5 ${
                  activeModuleIndex === idx ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'
                }`}>
                  {m.number}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold leading-tight truncate">{m.title}</p>
                  {m.summary && (
                    <p className="text-[10px] text-slate-400 truncate mt-0.5">{m.summary}</p>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* MODULE CONTENT AREA */}
        <div className="lg:col-span-3 p-6 md:p-8 space-y-6 overflow-y-auto max-h-[600px] bg-white">
          {/* Module Banner */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-950 text-white space-y-2 shadow-lg">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-[10px] font-black uppercase tracking-wider border border-blue-500/30">
                Module {currentModule.number}
              </span>
              <span className="text-[10px] text-slate-400 font-bold">Published by {activeDoc.author}</span>
            </div>
            <h3 className="text-2xl font-black text-white">{currentModule.title}</h3>
            {currentModule.summary && (
              <p className="text-xs text-slate-300 leading-relaxed">{currentModule.summary}</p>
            )}
          </div>

          {/* Sections List */}
          <div className="space-y-6">
            {filteredSections.length === 0 ? (
              <div className="text-center py-12 text-slate-400 space-y-2">
                <BookOpen className="w-8 h-8 mx-auto text-slate-300" />
                <p className="text-xs font-bold">No sections found matching "{searchTerm}"</p>
                <button 
                  onClick={() => setSearchTerm('')}
                  className="text-xs text-blue-600 font-bold hover:underline"
                >
                  Clear search query
                </button>
              </div>
            ) : (
              filteredSections.map((sec, idx) => (
                <div key={idx} className="p-6 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-4 hover:border-slate-300 transition-all">
                  <h4 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                    <span>{sec.heading}</span>
                  </h4>

                  {/* Body Paragraphs */}
                  {Array.isArray(sec.content) ? (
                    <ul className="space-y-2 list-none">
                      {sec.content.map((item, i) => (
                        <li key={i} className="text-xs text-slate-700 leading-relaxed flex items-start space-x-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-slate-700 leading-relaxed">{sec.content}</p>
                  )}

                  {/* Table Data if available */}
                  {sec.tableData && (
                    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-900 text-white uppercase text-[10px] font-bold">
                          <tr>
                            {sec.tableData.headers.map((h, i) => (
                              <th key={i} className="p-3">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {sec.tableData.rows.map((row, i) => (
                            <tr key={i} className="hover:bg-slate-50">
                              {row.map((cell, cIdx) => (
                                <td key={cIdx} className="p-3 text-slate-700 font-medium">{cell}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Callout Banner */}
                  {sec.callout && (
                    <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold flex items-start space-x-2.5">
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <span>{sec.callout}</span>
                    </div>
                  )}

                  {/* Example Prompt Box */}
                  {sec.examplePrompt && (
                    <div className="p-4 rounded-xl bg-slate-900 text-white space-y-1.5 border border-slate-800">
                      <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider flex items-center space-x-1">
                        <Sparkles className="w-3 h-3" />
                        <span>Example Prompt Template</span>
                      </span>
                      <p className="text-xs font-mono text-slate-200 leading-relaxed">"{sec.examplePrompt}"</p>
                    </div>
                  )}

                  {/* Key Takeaway Badge */}
                  {sec.keyTakeaway && (
                    <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs font-bold space-y-1">
                      <span className="text-[9px] uppercase tracking-wider text-blue-600 font-black">Key Takeaway</span>
                      <p className="text-xs leading-relaxed">{sec.keyTakeaway}</p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Module Navigation Footer */}
          <div className="pt-6 border-t border-slate-200 flex items-center justify-between">
            <button
              disabled={activeModuleIndex === 0}
              onClick={() => setActiveModuleIndex(prev => Math.max(0, prev - 1))}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              ← Previous Module
            </button>
            <span className="text-xs text-slate-500 font-bold">
              Module {activeModuleIndex + 1} of {activeDoc.modules.length}
            </span>
            <button
              disabled={activeModuleIndex === activeDoc.modules.length - 1}
              onClick={() => setActiveModuleIndex(prev => Math.min(activeDoc.modules.length - 1, prev + 1))}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs disabled:opacity-40 disabled:cursor-not-allowed flex items-center space-x-1 cursor-pointer"
            >
              <span>Next Module</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
