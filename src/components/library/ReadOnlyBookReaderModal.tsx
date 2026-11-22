import React, { useState, useEffect } from 'react';
import { 
  X, BookOpen, ShieldCheck, Lock, ShoppingBag, 
  AlertTriangle, Truck, CheckCircle2, ChevronLeft, ChevronRight,
  Maximize2, Minimize2, ZoomIn, ZoomOut, Phone, CreditCard
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../AuthContext';
import { ShopOrderModal } from '../shop/ShopOrderModal';
import { ShopProduct } from '../../types/shop';

export interface ProtectedBookItem {
  id: string;
  title: string;
  author?: string;
  description?: string;
  category?: string;
  file_url: string;
  thumbnail_url?: string;
  target_level?: string;
  pages_count?: number;
  hardcopy_available?: boolean;
  hardcopy_price_usd?: number;
}

interface Props {
  book: ProtectedBookItem;
  isOpen: boolean;
  onClose: () => void;
  onOrderHardcopy?: () => void;
}

export const ReadOnlyBookReaderModal: React.FC<Props> = ({
  book,
  isOpen,
  onClose,
  onOrderHardcopy
}) => {
  const { user, profile } = useAuth();
  const [showWarningAlert, setShowWarningAlert] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Disable right-click, saving, and printing keyboard shortcuts
  useEffect(() => {
    if (!isOpen) return;

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      triggerSecurityWarning('Right-click inspection & downloading are strictly disabled on YARA publications.');
      return false;
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      const isCmdOrCtrl = e.metaKey || e.ctrlKey;
      
      // Intercept Ctrl+S (Save), Ctrl+P (Print), Ctrl+U (Source), F12 (DevTools)
      if (
        (isCmdOrCtrl && ['s', 'S', 'p', 'P', 'u', 'U'].includes(e.key)) ||
        e.key === 'F12'
      ) {
        e.preventDefault();
        e.stopPropagation();
        triggerSecurityWarning('Digital downloading and printing are disabled. Please order a physical hardcopy.');
      }
    };

    // Inject print-protection CSS dynamically
    const styleEl = document.createElement('style');
    styleEl.id = 'yara-print-protection';
    styleEl.innerHTML = `
      @media print {
        body * { display: none !important; }
        body:after {
          content: "Printing of YARA digital educational publications is strictly prohibited. Please order an official printed hardcopy.";
          display: block !important;
          font-size: 24pt;
          font-weight: bold;
          text-align: center;
          padding: 50pt;
        }
      }
    `;
    document.head.appendChild(styleEl);

    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('keydown', handleKeyDown);
      const existing = document.getElementById('yara-print-protection');
      if (existing) existing.remove();
    };
  }, [isOpen]);

  const triggerSecurityWarning = (msg: string) => {
    setWarningMessage(msg);
    setShowWarningAlert(true);
    setTimeout(() => setShowWarningAlert(false), 4500);
  };

  if (!isOpen) return null;

  const hardcopyPrice = Number(book.hardcopy_price_usd) || 15.0;

  // Prepare product for ShopOrderModal
  const shopProductPayload: ShopProduct = {
    id: `book-${book.id}`,
    title: `${book.title} (Official Printed Hardcopy)`,
    subtitle: `Author: ${book.author || 'YARA Faculty'} • ${book.category || 'Robotics & STEM'}`,
    category: 'components',
    categoryLabel: 'Printed Book & Manual',
    priceUsd: hardcopyPrice,
    description: `Official published hardcopy of "${book.title}". Full color printed edition, spiral/thermal bound with official YARA ISBN and curriculum certification.`,
    imageUrl: book.thumbnail_url || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=800',
    inStock: true
  };

  // Append parameters to disable Adobe/Chrome built-in toolbar buttons
  const secureFileUrl = book.file_url?.includes('#')
    ? book.file_url
    : `${book.file_url}#toolbar=0&navpanes=0&scrollbar=1`;

  return (
    <>
      <div 
        className="fixed inset-0 z-50 flex flex-col bg-slate-950 text-white select-none overflow-hidden"
        onContextMenu={(e) => {
          e.preventDefault();
          triggerSecurityWarning('Right-click is disabled to protect copyrighted content.');
        }}
        onDragStart={(e) => e.preventDefault()}
      >
        {/* Top Header Bar */}
        <div className="bg-slate-900 border-b border-slate-800 px-4 sm:px-6 py-3 flex items-center justify-between gap-4 shrink-0 shadow-md">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="overflow-hidden">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Read-Only Digital Edition
                </span>
                <span className="text-[10px] text-slate-400 font-bold hidden sm:inline">
                  • Downloads Strictly Disabled
                </span>
              </div>
              <h2 className="text-sm sm:text-base font-black text-white truncate mt-0.5">
                {book.title}
              </h2>
            </div>
          </div>

          {/* Header Action Tools */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Hardcopy Purchase Button in Header */}
            <button
              onClick={() => setIsOrderModalOpen(true)}
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm flex items-center gap-1.5 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
            >
              <Truck className="w-4 h-4" />
              <span>Get Hardcopy (${hardcopyPrice.toFixed(2)})</span>
            </button>

            {/* Zoom Controls */}
            <div className="hidden md:flex items-center gap-1 bg-slate-800/80 rounded-xl p-1 border border-slate-700">
              <button
                onClick={() => setZoomLevel(prev => Math.max(70, prev - 15))}
                className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-300 hover:text-white"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-xs font-mono font-bold px-1.5 text-slate-300">
                {zoomLevel}%
              </span>
              <button
                onClick={() => setZoomLevel(prev => Math.min(160, prev + 15))}
                className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-300 hover:text-white"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
              title="Close Reader"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Security Warning Toast Notification */}
        <AnimatePresence>
          {showWarningAlert && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-16 left-1/2 -translate-x-1/2 z-50 bg-red-600 text-white px-5 py-3 rounded-2xl shadow-2xl border border-red-400 flex items-center gap-3 text-xs sm:text-sm font-bold max-w-md text-center"
            >
              <AlertTriangle className="w-5 h-5 shrink-0 text-amber-200" />
              <span>{warningMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Notice Bar for Copyright Protection & Hardcopy Information */}
        <div className="bg-indigo-950/70 border-b border-indigo-900/50 px-4 sm:px-6 py-2 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-indigo-200 gap-2 shrink-0">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              <strong>Copyright Protected:</strong> Free in-browser read-only access for verified learners. No PDF download available.
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-amber-300 font-semibold">
              Need a physical printed book for your classroom or robotics workshop?
            </span>
            <button
              onClick={() => setIsOrderModalOpen(true)}
              className="underline text-white font-bold hover:text-amber-300 cursor-pointer"
            >
              Order Hardcopy
            </button>
          </div>
        </div>

        {/* Main Document Reading Canvas */}
        <div className="flex-1 relative bg-slate-900 overflow-hidden flex items-center justify-center">
          {/* Subtle Watermark Overlay to prevent screenshots / unauthorized republication */}
          <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center opacity-[0.035] rotate-[-25deg] select-none text-white font-black text-4xl sm:text-6xl tracking-widest leading-loose text-center">
            YARA PAN-AFRICAN ROBOTICS ACADEMY<br />
            READ-ONLY DIGITAL COPY • DO NOT DISTRIBUTE<br />
            {profile?.display_name || user?.email || 'OFFICIAL LEARNER ACCESS'}
          </div>

          {/* Secure Document Embed / Iframe */}
          <div 
            className="w-full h-full transition-transform duration-200 flex items-center justify-center"
            style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'center center' }}
          >
            <iframe
              src={secureFileUrl}
              title={book.title}
              className="w-full h-full border-0 bg-white"
              style={{ pointerEvents: 'auto' }}
            />
          </div>
        </div>

        {/* Bottom Bar — Hardcopy Purchase Call-To-Action */}
        <div className="bg-slate-950 border-t border-slate-800 p-3 sm:p-4 shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-xs text-slate-400 space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="font-bold text-white">{book.title}</span>
              {book.author && <span className="text-slate-400">• By {book.author}</span>}
              {book.pages_count && book.pages_count > 0 && (
                <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] font-mono text-slate-300">
                  {book.pages_count} Pages
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500">
              Printed hardcopies are manufactured with high-durability thermal binding, full-color diagrams, and shipped nationwide across Africa.
            </p>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto">
            <div className="text-right">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Printed Hardcopy</span>
              <span className="text-lg font-black text-amber-400">${hardcopyPrice.toFixed(2)} USD</span>
            </div>

            <button
              onClick={() => setIsOrderModalOpen(true)}
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black px-5 py-2.5 rounded-xl text-sm flex items-center gap-2 shadow-lg shadow-amber-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Order Physical Hardcopy</span>
            </button>
          </div>
        </div>
      </div>

      {/* Shop Order Modal for Hardcopy Purchasing */}
      {isOrderModalOpen && (
        <ShopOrderModal
          product={shopProductPayload}
          isOpen={isOrderModalOpen}
          onClose={() => setIsOrderModalOpen(false)}
        />
      )}
    </>
  );
};

