import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Award, Printer, ShieldCheck, Trophy, Sparkles } from 'lucide-react';
import { DigitalCertificate } from '../../types/competitionEcosystem';
import { ASSETS } from '../../constants/assets';
import { useQrCode } from '../../utils/qrCodeHelper';
import { CertificateSecurityWatermark } from '../certificates/CertificateSecurityWatermark';

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

  const qrCodeDataUrl = useQrCode(verificationUrl, { width: 160, darkColor: '#0f172a' });

  if (!isOpen || !certificate) return null;

  const handlePrint = () => {
    window.print();
  };

  const formattedDate = certificate.issued_date || (certificate as any).issued_at || new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-3xl border border-slate-800 shadow-2xl max-w-4xl w-full overflow-hidden flex flex-col font-sans"
        >
          {/* Top Control Bar */}
          <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs font-bold text-amber-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="text-white">Official Credential</span>
              <span className="text-slate-400 font-mono text-[11px]">({certificate.certificate_id})</span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handlePrint}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center space-x-1.5 transition shadow-sm cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print / Save PDF</span>
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Certificate Printable Canvas (Clean, Modern & Professional) */}
          <div className="p-4 sm:p-6 bg-slate-100 flex justify-center">
            <div 
              ref={printRef} 
              id="competition-certificate-document"
              className="relative w-full aspect-[1.414/1] min-h-[520px] sm:min-h-[580px] bg-white rounded-2xl p-8 sm:p-12 shadow-xl border border-slate-200 overflow-hidden flex flex-col justify-between select-none text-slate-900 font-sans"
              style={{
                maxWidth: '920px',
                boxSizing: 'border-box'
              }}
            >
              {/* Subtle Modern Inset Frame */}
              <div className="absolute inset-3 sm:inset-4 rounded-xl border border-slate-200 pointer-events-none" />

              {/* Minimal Clean Watermark */}
              <CertificateSecurityWatermark
                certificateNumber={certificate.certificate_id}
                recipientName={certificate.recipient_name}
                issueDate={formattedDate}
              />

              {/* ================= HEADER ================= */}
              <div className="relative z-10 flex flex-col items-center text-center">
                {/* Organization Branding */}
                <div className="flex items-center justify-center gap-3 mb-2">
                  <div className="w-12 h-12 rounded-xl bg-slate-50 p-1.5 border border-slate-200 flex items-center justify-center overflow-hidden shrink-0 shadow-xs">
                    <img src={ASSETS.LOGO} alt="YARA" className="w-full h-full object-contain" />
                  </div>
                  <div className="text-left">
                    <span className="text-xs sm:text-sm font-black tracking-[0.18em] text-slate-900 uppercase block">
                      YOUNG AFRICANS ROBOTICS ASSOCIATION
                    </span>
                    <p className="text-[10px] tracking-wider uppercase text-indigo-600 font-bold">
                      National Championship Directorate
                    </p>
                  </div>
                </div>

                <h1 className="text-2xl sm:text-4xl font-black text-slate-950 uppercase tracking-tight mt-3">
                  Certificate of Achievement
                </h1>
                <p className="text-xs font-semibold tracking-wider text-slate-500 uppercase mt-1">
                  {certificate.event_name} • {certificate.edition_year}
                </p>
              </div>

              {/* ================= RECIPIENT BODY ================= */}
              <div className="relative z-10 text-center my-auto py-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-400 mb-2">
                  Awarded To
                </p>
                
                <h2 className="text-3xl sm:text-5xl font-black text-slate-950 tracking-tight px-4 leading-tight">
                  {certificate.recipient_name}
                </h2>

                {certificate.team_name && (
                  <p className="text-xs sm:text-sm font-semibold text-slate-600 mt-2">
                    Team: <strong className="text-slate-900">{certificate.team_name}</strong>
                  </p>
                )}

                {/* Achievement Badge */}
                <div className="mt-4 inline-flex items-center gap-2 px-4 py-1.5 bg-slate-900 text-white rounded-full text-xs font-bold shadow-sm">
                  <Trophy className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>{certificate.achievement_title}</span>
                </div>
              </div>

              {/* ================= SIGNATURE & VERIFICATION FOOTER ================= */}
              <div className="relative z-10 pt-4 border-t border-slate-200">
                <div className="flex flex-row items-end justify-between gap-4">
                  
                  {/* Authorized Evaluator */}
                  <div className="flex flex-col items-center text-center w-1/3">
                    <div className="h-10 sm:h-12 flex items-end justify-center mb-1 w-full max-w-[140px]">
                      <img 
                        src={ASSETS.EXECUTIVE_SIGNATURE} 
                        alt="Authorized Signature" 
                        className="max-h-9 sm:max-h-11 max-w-full object-contain" 
                      />
                    </div>
                    <div className="w-28 sm:w-36 border-t border-slate-300 pt-1">
                      <p className="text-xs font-bold text-slate-900 leading-tight">K. M. Mutasa</p>
                      <p className="text-[9px] text-slate-500 font-medium">Lead Technical Evaluator</p>
                    </div>
                  </div>

                  {/* Official Seal */}
                  <div className="flex items-center justify-center shrink-0">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center">
                      <img 
                        src={ASSETS.OFFICIAL_GOLD_SEAL || ASSETS.EDUCATOR_SEAL} 
                        alt="Official Seal" 
                        className="w-full h-full object-contain drop-shadow-xs"
                      />
                    </div>
                  </div>

                  {/* Verified QR Code */}
                  <div className="flex items-center justify-end w-1/3">
                    <div className="flex items-center gap-2 p-1.5 bg-slate-50 border border-slate-200 rounded-xl">
                      <img 
                        src={qrCodeDataUrl} 
                        alt="Scan to Verify" 
                        className="w-10 h-10 sm:w-11 sm:h-11 object-contain rounded"
                      />
                      <div className="text-left pr-1 hidden sm:block">
                        <span className="text-[8px] font-mono font-bold text-indigo-600 block uppercase tracking-wider">
                          Digital Verify
                        </span>
                        <span className="text-[8px] font-mono text-slate-500 block truncate max-w-[100px]">
                          {certificate.certificate_id}
                        </span>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Minimal Footer Metadata */}
                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[9px] text-slate-400 font-mono px-1">
                  <span>ID: <strong className="text-slate-700">{certificate.certificate_id}</strong></span>
                  <span>Issued: {formattedDate}</span>
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
