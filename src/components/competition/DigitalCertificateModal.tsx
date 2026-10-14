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

          {/* Certificate Printable Canvas (AI for Educators Style with Ornate Double Amber Border & QR Code) */}
          <div className="p-4 sm:p-8 bg-slate-100 flex justify-center">
            <div 
              ref={printRef} 
              id="competition-certificate-document"
              className="relative w-full aspect-[1.414/1] min-h-[580px] sm:min-h-[620px] bg-gradient-to-br from-amber-50/50 via-white to-amber-50/30 rounded-3xl p-6 sm:p-10 shadow-2xl border-[10px] sm:border-[12px] border-double border-amber-600/80 overflow-hidden flex flex-col justify-between select-none text-slate-900"
              style={{
                boxShadow: '0 25px 50px -12px rgba(180, 83, 9, 0.25), inset 0 0 80px rgba(245, 158, 11, 0.05)'
              }}
            >
              {/* Background Crest Watermark */}
              <div className="absolute inset-0 opacity-[0.035] pointer-events-none flex items-center justify-center">
                <svg viewBox="0 0 500 500" className="w-[85%] h-[85%] text-slate-950 fill-current">
                  <circle cx="250" cy="250" r="230" stroke="currentColor" strokeWidth="4" fill="none" strokeDasharray="10, 5" />
                  <circle cx="250" cy="250" r="190" stroke="currentColor" strokeWidth="6" fill="none" />
                  <polygon points="250,50 300,180 440,180 330,260 370,390 250,310 130,390 170,260 60,180 200,180" fill="currentColor" />
                </svg>
              </div>

              {/* Ornate Corner Accents */}
              <div className="absolute top-4 left-4 w-12 sm:w-16 h-12 sm:h-16 border-t-4 border-l-4 border-amber-700 pointer-events-none" />
              <div className="absolute top-4 right-4 w-12 sm:w-16 h-12 sm:h-16 border-t-4 border-r-4 border-amber-700 pointer-events-none" />
              <div className="absolute bottom-4 left-4 w-12 sm:w-16 h-12 sm:h-16 border-b-4 border-l-4 border-amber-700 pointer-events-none" />
              <div className="absolute bottom-4 right-4 w-12 sm:w-16 h-12 sm:h-16 border-b-4 border-r-4 border-amber-700 pointer-events-none" />

              {/* Header */}
              <div className="relative z-10 flex flex-col items-center text-center">
                <div className="flex items-center justify-center gap-3 mb-1.5">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-white p-1 shadow-md border border-amber-300 flex items-center justify-center overflow-hidden shrink-0">
                    <img src={ASSETS.LOGO} alt="YARA" className="w-full h-full object-contain rounded-xl" />
                  </div>
                  <div className="text-left">
                    <span className="text-sm sm:text-xl font-black tracking-wider text-slate-900 uppercase block">
                      YOUNG AFRICANS ROBOTICS ASSOCIATION (YARA)
                    </span>
                    <p className="text-[9px] sm:text-xs tracking-widest uppercase text-amber-700 font-bold">
                      National Robotics Championship &amp; Arena Directorate
                    </p>
                  </div>
                </div>

                <div className="w-28 h-0.5 bg-gradient-to-r from-transparent via-amber-500 to-transparent my-1" />

                <h1 className="text-2xl sm:text-4xl font-serif font-black text-slate-900 tracking-wide mt-1 uppercase">
                  Certificate of Achievement
                </h1>
                <p className="text-[10px] sm:text-xs font-semibold tracking-widest text-amber-800 uppercase mt-0.5">
                  {certificate.event_name} • Edition {certificate.edition_year}
                </p>
              </div>

              {/* Presented To */}
              <div className="relative z-10 text-center my-auto py-2">
                <p className="text-xs sm:text-sm text-slate-600 italic">This is proudly awarded to</p>
                
                <div className="my-1.5 sm:my-2">
                  <span className="text-2xl sm:text-4xl lg:text-5xl font-serif font-bold text-slate-900 px-6 py-1 border-b-2 border-amber-600/60 inline-block">
                    {certificate.recipient_name}
                  </span>
                </div>

                {certificate.team_name && (
                  <p className="text-xs sm:text-sm font-semibold text-slate-700 mt-1">
                    Team: <strong className="text-slate-900">{certificate.team_name}</strong>
                  </p>
                )}

                <p className="text-[10px] sm:text-xs text-slate-600 max-w-2xl mx-auto mt-2 leading-relaxed px-4">
                  In recognition of outstanding dedication, technical excellence, and innovative contribution during the flagship national championship under the theme <em>“Engineering Opportunity: Robotics &amp; Innovation for Underserved Youth”</em>.
                </p>

                {/* Recognition Title */}
                <div className="mt-2.5 inline-flex items-center gap-2 bg-gradient-to-r from-amber-100/80 via-amber-200/80 to-amber-100/80 border border-amber-400 px-4 py-1 rounded-full text-xs font-bold text-amber-950 shadow-sm">
                  <Award className="w-4 h-4 text-amber-700" />
                  <span>⭐ {certificate.achievement_title}</span>
                </div>
              </div>

              {/* Signatures & Security Verification with QR Code */}
              <div className="relative z-10 flex flex-col gap-2 pt-3 sm:pt-4 border-t border-amber-600/30">
                <div className="flex flex-row items-end justify-between gap-2 sm:gap-4">
                  {/* Lead Technical Judge */}
                  <div className="flex flex-col items-center text-center w-1/3">
                    <div className="h-12 sm:h-14 flex items-end justify-center mb-1 w-full max-w-[180px]">
                      <img 
                        src={ASSETS.EXECUTIVE_SIGNATURE} 
                        alt="Judge Signature" 
                        className="max-h-11 sm:max-h-13 max-w-full object-contain mix-blend-multiply drop-shadow-xs" 
                      />
                    </div>
                    <div className="w-32 sm:w-40 border-t border-slate-900/60 pt-1">
                      <p className="text-[11px] sm:text-xs font-bold text-slate-900">K. M. Mutasa</p>
                      <p className="text-[8px] sm:text-[9px] font-semibold text-slate-600 leading-tight">
                        Lead Technical Judge
                      </p>
                    </div>
                  </div>

                  {/* Seal & QR Code */}
                  <div className="flex items-center justify-center gap-2.5 sm:gap-5 shrink-0">
                    <div className="flex flex-col items-center">
                      <div className="relative w-14 h-14 sm:w-20 sm:h-20 flex items-center justify-center">
                        <img 
                          src={ASSETS.EDUCATOR_SEAL} 
                          alt="Official Certified Seal" 
                          className="w-full h-full object-contain drop-shadow-xl select-none pointer-events-none transform transition-transform hover:scale-105"
                        />
                      </div>
                      <div className="mt-0.5 text-center">
                        <span className="text-[7px] sm:text-[8px] font-mono text-slate-500 font-semibold block">
                          Season {certificate.edition_year}
                        </span>
                      </div>
                    </div>

                    {/* Scannable High-DPI QR Code */}
                    <div className="flex flex-col items-center">
                      <div className="p-1 sm:p-1.5 bg-white border-2 border-amber-600/70 rounded-xl shadow-md">
                        <img 
                          src={qrCodeDataUrl} 
                          alt="Scan to Verify Official Credential" 
                          className="w-12 h-12 sm:w-16 sm:h-16 object-contain rounded-md"
                        />
                      </div>
                      <div className="mt-0.5 text-center">
                        <span className="text-[7px] sm:text-[8px] font-mono text-amber-900 font-black block uppercase tracking-wider">
                          Scan to Verify
                        </span>
                        <span className="text-[7px] sm:text-[8px] font-mono text-slate-600 font-bold block">
                          {certificate.certificate_id}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* YARA President */}
                  <div className="flex flex-col items-center text-center w-1/3">
                    <div className="h-12 sm:h-14 flex items-end justify-center mb-1 w-full max-w-[180px]">
                      <img 
                        src={ASSETS.SIGNATURE_CHIAMBIRO} 
                        alt="YARA President Signature" 
                        className="max-h-11 sm:max-h-13 max-w-full object-contain mix-blend-multiply drop-shadow-xs" 
                      />
                    </div>
                    <div className="w-32 sm:w-40 border-t border-slate-900/60 pt-1">
                      <p className="text-[11px] sm:text-xs font-bold text-slate-900">Ms. A.M. Chiambiro</p>
                      <p className="text-[8px] sm:text-[9px] font-semibold text-slate-600 leading-tight">
                        President, YARA Zimbabwe
                      </p>
                    </div>
                  </div>
                </div>

                {/* Footnote */}
                <div className="text-center pt-1 border-t border-amber-900/10 flex flex-col sm:flex-row items-center justify-between gap-1 text-[7px] sm:text-[8px] text-slate-500 font-medium px-2">
                  <span>Official Credential • YARA National Championship Arena</span>
                  <span className="font-mono text-amber-800">
                    Verify online: {verificationUrl}
                  </span>
                  <span>Credential ID: <strong className="text-slate-800 font-mono">{certificate.certificate_id}</strong></span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
