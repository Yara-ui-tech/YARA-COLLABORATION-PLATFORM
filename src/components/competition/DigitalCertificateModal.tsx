import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Award, CheckCircle2, Download, Printer, ShieldCheck } from 'lucide-react';
import { DigitalCertificate } from '../../types/competitionEcosystem';
import { ASSETS } from '../../constants/assets';
import { useQrCode } from '../../utils/qrCodeHelper';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  certificate: DigitalCertificate | null;
}

export default function DigitalCertificateModal({ isOpen, onClose, certificate }: Props) {
  const printRef = useRef<HTMLDivElement>(null);

  const verificationUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/verify-certificate?id=${certificate?.certificate_id}`
    : `https://yara.org/verify-certificate?id=${certificate?.certificate_id}`;

  const qrCodeDataUrl = useQrCode(verificationUrl, { width: 180, darkColor: '#0f172a' });

  if (!isOpen || !certificate) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-3xl border border-slate-800 shadow-2xl max-w-4xl w-full overflow-hidden flex flex-col font-sans"
        >
          {/* Action Bar */}
          <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs font-bold text-amber-400">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>Verified YARA Championship Credential</span>
              <span className="text-slate-400 font-mono text-[11px]">({certificate.certificate_id})</span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handlePrint}
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black flex items-center space-x-1.5 transition shadow-sm cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print / Save PDF</span>
              </button>
              <button
                onClick={onClose}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Certificate Printable Canvas (Clean Minimalist AI for Educators Style) */}
          <div className="p-4 sm:p-6 bg-slate-100 flex justify-center">
            <div 
              ref={printRef} 
              id="competition-certificate-document"
              className="relative w-full aspect-[1.414/1] min-h-[540px] sm:min-h-[600px] bg-gradient-to-br from-[#fffdfa] via-white to-[#faf6ef] rounded-2xl p-6 sm:p-10 md:p-12 shadow-xl border-2 border-amber-600/40 overflow-hidden flex flex-col justify-between select-none text-slate-900 font-sans"
              style={{
                maxWidth: '940px',
                boxSizing: 'border-box'
              }}
            >
              {/* Inner Border */}
              <div className="absolute inset-3 sm:inset-4 rounded-xl border border-amber-600/25 pointer-events-none" />

              {/* Background Crest Watermark */}
              <div className="absolute inset-0 opacity-[0.025] pointer-events-none flex items-center justify-center">
                <svg viewBox="0 0 500 500" className="w-[75%] h-[75%] text-slate-950 fill-current">
                  <circle cx="250" cy="250" r="230" stroke="currentColor" strokeWidth="4" fill="none" strokeDasharray="10, 5" />
                  <circle cx="250" cy="250" r="190" stroke="currentColor" strokeWidth="6" fill="none" />
                  <polygon points="250,50 300,180 440,180 330,260 370,390 250,310 130,390 170,260 60,180 200,180" fill="currentColor" />
                </svg>
              </div>

              {/* Corner Accents */}
              <div className="absolute top-5 left-5 w-8 h-8 border-t-2 border-l-2 border-amber-600/70 pointer-events-none" />
              <div className="absolute top-5 right-5 w-8 h-8 border-t-2 border-r-2 border-amber-600/70 pointer-events-none" />
              <div className="absolute bottom-5 left-5 w-8 h-8 border-b-2 border-l-2 border-amber-600/70 pointer-events-none" />
              <div className="absolute bottom-5 right-5 w-8 h-8 border-b-2 border-r-2 border-amber-600/70 pointer-events-none" />

              {/* Header */}
              <div className="relative z-10 flex flex-col items-center text-center">
                <div className="flex items-center justify-center gap-3 mb-1">
                  <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-xl bg-white p-1 shadow-xs border border-amber-200/80 flex items-center justify-center overflow-hidden shrink-0">
                    <img src={ASSETS.LOGO} alt="YARA" className="w-full h-full object-contain" />
                  </div>
                  <div className="text-left">
                    <span className="text-xs sm:text-sm font-bold tracking-[0.2em] text-slate-800 uppercase block">
                      YOUNG AFRICANS ROBOTICS ASSOCIATION
                    </span>
                    <p className="text-[9px] sm:text-[10px] tracking-wider uppercase text-amber-700 font-semibold">
                      National Championship Arena Directorate
                    </p>
                  </div>
                </div>

                <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif font-black text-slate-900 tracking-wide mt-2 uppercase">
                  Certificate of Achievement
                </h1>
                <p className="text-[10px] sm:text-xs font-semibold tracking-widest text-amber-800 uppercase mt-0.5">
                  {certificate.event_name} • Edition {certificate.edition_year}
                </p>
              </div>

              {/* Presented To */}
              <div className="relative z-10 text-center my-auto py-2">
                <p className="text-xs text-slate-500 italic">This is proudly awarded to</p>
                
                <div className="my-1.5 sm:my-2">
                  <span className="text-2xl sm:text-4xl lg:text-5xl font-serif font-bold text-slate-900 px-6 py-0.5 border-b border-amber-500/50 inline-block">
                    {certificate.recipient_name}
                  </span>
                </div>

                {certificate.team_name && (
                  <p className="text-xs sm:text-sm font-semibold text-slate-700 mt-1">
                    Team: <strong className="text-slate-900">{certificate.team_name}</strong>
                  </p>
                )}

                <p className="text-[11px] sm:text-xs text-slate-600 max-w-2xl mx-auto mt-2 leading-relaxed px-4">
                  In recognition of outstanding dedication, technical excellence, and innovative contribution during the flagship national championship.
                </p>

                {/* Recognition Title */}
                <div className="mt-2.5 inline-flex items-center gap-1.5 px-3.5 py-0.5 bg-amber-50 border border-amber-300 rounded-full text-xs font-bold text-amber-950 shadow-xs">
                  <Award className="w-3.5 h-3.5 text-amber-600" />
                  <span>{certificate.achievement_title}</span>
                </div>
              </div>

              {/* Signatures & Security Verification with QR Code */}
              <div className="relative z-10 flex flex-col gap-2 pt-3 border-t border-amber-600/20">
                <div className="flex flex-row items-end justify-between gap-3">
                  {/* Lead Technical Judge */}
                  <div className="flex flex-col items-center text-center w-1/3">
                    <div className="h-11 sm:h-13 flex items-end justify-center mb-1 w-full max-w-[160px]">
                      <img 
                        src={ASSETS.EXECUTIVE_SIGNATURE} 
                        alt="Judge Signature" 
                        className="max-h-10 sm:max-h-12 max-w-full object-contain mix-blend-multiply" 
                      />
                    </div>
                    <div className="w-28 sm:w-36 border-t border-slate-700/50 pt-1">
                      <p className="text-[11px] sm:text-xs font-bold text-slate-900 leading-tight">K. M. Mutasa</p>
                      <p className="text-[8px] sm:text-[9px] text-slate-500 leading-tight">
                        Lead Technical Judge
                      </p>
                    </div>
                  </div>

                  {/* Seal & QR Code */}
                  <div className="flex items-center justify-center gap-3 sm:gap-4 shrink-0 pb-1">
                    <div className="relative w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center">
                      <img 
                        src={ASSETS.EDUCATOR_SEAL} 
                        alt="Official Seal" 
                        className="w-full h-full object-contain select-none pointer-events-none drop-shadow-sm"
                      />
                    </div>

                    <div className="flex items-center gap-1.5 p-1 bg-white border border-amber-300 rounded-lg shadow-xs">
                      <img 
                        src={qrCodeDataUrl} 
                        alt="Scan to Verify" 
                        className="w-10 h-10 sm:w-12 sm:h-12 object-contain rounded"
                      />
                      <div className="text-left pr-1">
                        <span className="text-[7px] font-mono text-amber-800 font-bold block uppercase tracking-wide">
                          Verify
                        </span>
                        <span className="text-[7px] font-mono text-slate-500 block">
                          {certificate.certificate_id}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* YARA President */}
                  <div className="flex flex-col items-center text-center w-1/3">
                    <div className="h-11 sm:h-13 flex items-end justify-center mb-1 w-full max-w-[160px]">
                      <img 
                        src={ASSETS.SIGNATURE_CHIAMBIRO} 
                        alt="President Signature" 
                        className="max-h-10 sm:max-h-12 max-w-full object-contain mix-blend-multiply" 
                      />
                    </div>
                    <div className="w-28 sm:w-36 border-t border-slate-700/50 pt-1">
                      <p className="text-[11px] sm:text-xs font-bold text-slate-900 leading-tight">Ms. A.M. Chiambiro</p>
                      <p className="text-[8px] sm:text-[9px] text-slate-500 leading-tight">
                        President, YARA Zimbabwe
                      </p>
                    </div>
                  </div>
                </div>

                {/* Minimal Footnote */}
                <div className="text-center pt-1 flex items-center justify-between text-[8px] text-slate-400 font-mono px-2">
                  <span>YARA Credential ID: <strong className="text-slate-700">{certificate.certificate_id}</strong></span>
                  <span>Season {certificate.edition_year}</span>
                  <span>yara.org/verify</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
