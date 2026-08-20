import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Award, CheckCircle2, Download, Printer, ShieldCheck, QrCode } from 'lucide-react';
import { DigitalCertificate } from '../../types/competitionEcosystem';
import { ASSETS } from '../../constants/assets';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  certificate: DigitalCertificate | null;
}

export default function DigitalCertificateModal({ isOpen, onClose, certificate }: Props) {
  const printRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !certificate) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col"
        >
          {/* Action Bar */}
          <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs font-bold text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
              <span>Verified YARA Digital Credential</span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handlePrint}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center space-x-1.5 transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print / Save PDF</span>
              </button>
              <button
                onClick={onClose}
                className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Certificate Printable Canvas */}
          <div ref={printRef} className="p-8 sm:p-12 bg-[#faf8f5] text-slate-900 relative overflow-hidden border-8 border-double border-amber-800/30 m-4 rounded-2xl">
            {/* Watermark Logo */}
            <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
              <div className="w-80 h-80 rounded-full border-8 border-slate-900 flex items-center justify-center font-black text-9xl">
                Y
              </div>
            </div>

            <div className="relative z-10 text-center space-y-6">
              {/* Header */}
              <div className="space-y-1">
                <div className="w-12 h-12 mx-auto mb-2 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-black text-xl shadow-md">
                  {ASSETS.LOGO ? (
                    <img src={ASSETS.LOGO} alt="YARA" className="w-full h-full object-cover rounded-2xl" referrerPolicy="no-referrer" />
                  ) : (
                    'Y'
                  )}
                </div>
                <p className="text-[11px] font-black uppercase tracking-[0.25em] text-amber-700">
                  Young Africans Robotics Association (YARA)
                </p>
                <h1 className="text-2xl sm:text-3xl font-serif font-black tracking-tight text-slate-900">
                  Certificate of Achievement
                </h1>
                <p className="text-xs text-slate-500 font-medium">
                  {certificate.event_name} • Edition {certificate.edition_year}
                </p>
              </div>

              {/* Presented To */}
              <div className="space-y-2 py-2">
                <p className="text-xs text-slate-600 italic">This is proudly awarded to</p>
                <h2 className="text-2xl sm:text-3xl font-bold text-indigo-950 underline decoration-amber-400 decoration-2 underline-offset-8">
                  {certificate.recipient_name}
                </h2>
                {certificate.team_name && (
                  <p className="text-xs font-semibold text-slate-600">
                    Team: {certificate.team_name}
                  </p>
                )}
              </div>

              {/* Achievement description */}
              <p className="text-xs sm:text-sm text-slate-700 max-w-md mx-auto leading-relaxed">
                In recognition of outstanding dedication, technical excellence, and innovative contribution during the flagship national robotics championship held under the theme <span className="font-semibold text-slate-900">“Engineering Opportunity: Robotics & Innovation for Underserved Youth”</span>.
              </p>

              {/* Recognition Title */}
              <div className="py-2 inline-block px-6 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-xs font-black uppercase tracking-wider">
                ⭐ {certificate.achievement_title}
              </div>

              {/* Signatures & Security Verification */}
              <div className="pt-6 border-t border-slate-300 grid grid-cols-3 gap-4 items-end text-center text-xs">
                <div>
                  <div className="h-10 flex items-center justify-center font-serif italic text-sm text-slate-700">
                    K. M. Mutasa
                  </div>
                  <div className="border-t border-slate-400 pt-1 font-bold text-[10px] text-slate-700">
                    Lead Technical Judge
                  </div>
                </div>

                <div className="flex flex-col items-center">
                  <div className="p-1.5 bg-white rounded-lg border border-slate-300 shadow-xs mb-1">
                    <QrCode className="w-8 h-8 text-slate-800" />
                  </div>
                  <span className="text-[9px] font-mono text-slate-500 font-semibold">
                    {certificate.certificate_id}
                  </span>
                </div>

                <div>
                  <div className="h-10 flex items-center justify-center font-serif italic text-sm text-slate-700">
                    Dr. F. Ndhlovu
                  </div>
                  <div className="border-t border-slate-400 pt-1 font-bold text-[10px] text-slate-700">
                    YARA President
                  </div>
                </div>
              </div>

              <div className="text-[10px] text-slate-400 font-mono">
                Verify authentic certificate credential at: <span className="font-bold text-slate-600">yara.org/verify</span> with code <span className="font-bold text-indigo-600">{certificate.certificate_id}</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
