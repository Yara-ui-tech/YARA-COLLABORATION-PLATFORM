import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface AdminDeleteConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  itemName?: string;
  confirmLabel?: string;
  isProcessing?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export default function AdminDeleteConfirmModal({
  isOpen,
  title,
  message,
  itemName,
  confirmLabel = 'Delete Permanently',
  isProcessing = false,
  onConfirm,
  onClose
}: AdminDeleteConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-red-100 space-y-4"
        >
          <div className="flex items-start justify-between">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <button
              onClick={onClose}
              disabled={isProcessing}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div>
            <h4 className="font-black text-slate-900 text-lg">{title}</h4>
            {itemName && (
              <div className="mt-1 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-900 font-mono text-xs font-bold border border-slate-200 truncate">
                {itemName}
              </div>
            )}
            <p className="text-xs text-slate-600 font-medium mt-2 leading-relaxed">
              {message}
            </p>
          </div>

          <div className="p-3 bg-red-50/80 border border-red-200/70 rounded-xl text-red-800 text-[11px] font-bold">
            ⚠️ Warning: As an Administrator, this change will immediately update the database and registry.
          </div>

          <div className="flex items-center justify-end space-x-2 pt-2">
            <button
              onClick={onClose}
              disabled={isProcessing}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isProcessing}
              className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center space-x-1.5 shadow-md shadow-red-200 transition-all disabled:opacity-50"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{isProcessing ? 'Removing...' : confirmLabel}</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

