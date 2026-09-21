import React, { useState } from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { WifiOff, AlertCircle, X, ShieldAlert, Wifi } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const OfflineBanner: React.FC = () => {
  const isOnline = useOnlineStatus();
  const [dismissed, setDismissed] = useState(false);

  if (isOnline) {
    return null;
  }

  return (
    <AnimatePresence>
      {!dismissed && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="bg-amber-500 text-slate-950 px-4 py-3 shadow-lg relative z-50 border-b border-amber-600/30"
        >
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center space-x-3 text-xs sm:text-sm font-black">
              <span className="p-1.5 bg-slate-950/10 rounded-lg shrink-0">
                <WifiOff className="w-4 h-4 text-slate-950" />
              </span>
              <span>
                ⚡ <strong>You are operating in Offline Mode.</strong> Curriculum, YARA Kids content, tools, and cached materials are available offline. 
                <span className="ml-1 opacity-90 hidden md:inline font-semibold">
                  (Features requiring internet like Official PDF Certificate Generation & Live Streaming will prompt for connection).
                </span>
              </span>
            </div>
            
            <button
              onClick={() => setDismissed(true)}
              className="p-1 hover:bg-slate-950/10 rounded-lg transition text-slate-950 shrink-0"
              title="Dismiss warning"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export const RequireInternetModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  featureName?: string;
}> = ({ isOpen, onClose, featureName = 'This feature' }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl relative border border-amber-200 overflow-hidden text-center"
      >
        <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto text-amber-600">
          <Wifi className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="inline-block px-3 py-1 bg-amber-100 text-amber-800 text-[10px] font-black uppercase tracking-widest rounded-full">
            Internet Connection Required
          </span>
          <h3 className="text-xl font-extrabold text-slate-900">
            {featureName} Needs Internet
          </h3>
          <p className="text-xs text-slate-600 font-medium leading-relaxed">
            Generating official cryptographic certificates, partner logo rendering, live streaming, or cloud downloads require an active online connection. Please connect to Wi-Fi or cellular data and try again.
          </p>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-lg transition"
        >
          Got it, I'll connect online
        </button>
      </motion.div>
    </div>
  );
};
