import React, { useRef, useState } from 'react';
import { Award, Download, Share2, CheckCircle2, ShieldCheck, Printer, X as CloseIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Certificate } from '../../types/curriculum';
import { ASSETS } from '../../constants/assets';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import { RequireInternetModal } from '../OfflineBanner';
import { useQrCode } from '../../utils/qrCodeHelper';
import { CertificateSecurityWatermark } from '../certificates/CertificateSecurityWatermark';

interface CertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  certificate: Certificate;
}

export default function CertificateModal({ isOpen, onClose, certificate }: CertificateModalProps) {
  const certRef = useRef<HTMLDivElement>(null);
  const isOnline = useOnlineStatus();
  const [showInternetNeeded, setShowInternetNeeded] = useState(false);
  const [copied, setCopied] = useState(false);

  const verificationUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/verify-certificate?id=${certificate.certificate_number}`
    : `https://yara.org/verify-certificate?id=${certificate.certificate_number}`;

  const qrCodeDataUrl = useQrCode(verificationUrl, { width: 180, darkColor: '#0f172a' });

  if (!isOpen) return null;

  const handlePrint = () => {
    if (!isOnline) {
      setShowInternetNeeded(true);
      return;
    }
    setTimeout(() => {
      window.print();
    }, 50);
  };

  const handleCopyLink = () => {
    if (!isOnline) {
      setShowInternetNeeded(true);
      return;
    }
    navigator.clipboard.writeText(verificationUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 md:p-8 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-3xl max-w-5xl w-full shadow-2xl overflow-hidden my-auto border border-slate-800 relative font-sans"
      >
        {/* Action Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between no-print">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-100">Verified Certificate of Completion</h4>
              <p className="text-xs text-slate-400 font-mono">ID: <span className="text-amber-300 font-bold">{certificate.certificate_number}</span></p>
            </div>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-3">
            <button
              onClick={handleCopyLink}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition flex items-center space-x-1.5 cursor-pointer"
              title="Copy share link"
            >
              {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{copied ? 'Link Copied!' : 'Share'}</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black rounded-xl transition flex items-center space-x-1.5 shadow-md shadow-amber-500/25 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl transition-colors cursor-pointer"
            >
              <CloseIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Certificate Body (Clean Minimalist AI for Educators Style) */}
        <div className="p-4 sm:p-6 bg-slate-100 flex justify-center">
          <div 
            ref={certRef}
            id="curriculum-certificate-document"
            className="relative w-full aspect-[1.414/1] min-h-[540px] sm:min-h-[600px] bg-gradient-to-br from-[#fffdfa] via-white to-[#faf6ef] rounded-2xl p-6 sm:p-10 md:p-12 shadow-xl border-2 border-amber-600/40 overflow-hidden flex flex-col justify-between select-none text-slate-900 font-sans"
            style={{
              maxWidth: '940px',
              boxSizing: 'border-box'
            }}
          >
            {/* Inner Border */}
            <div className="absolute inset-3 sm:inset-4 rounded-xl border border-amber-600/25 pointer-events-none" />

            {/* Unique Banknote-Grade Embedded Security Watermark with Guilloche waves and micro-text */}
            <CertificateSecurityWatermark
              certificateNumber={certificate.certificate_number}
              recipientName={certificate.student_name}
              issueDate={certificate.issue_date}
            />

            {/* Corner Decorative Accents */}
            <div className="absolute top-5 left-5 w-8 h-8 border-t-2 border-l-2 border-amber-600/70 pointer-events-none" />
            <div className="absolute top-5 right-5 w-8 h-8 border-t-2 border-r-2 border-amber-600/70 pointer-events-none" />
            <div className="absolute bottom-5 left-5 w-8 h-8 border-b-2 border-l-2 border-amber-600/70 pointer-events-none" />
            <div className="absolute bottom-5 right-5 w-8 h-8 border-b-2 border-r-2 border-amber-600/70 pointer-events-none" />

            {/* Logo and Institution Header */}
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
                    Academy of Advanced Robotics &amp; AI
                  </p>
                </div>
              </div>

              <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif font-black text-slate-900 tracking-wide mt-2 uppercase">
                Certificate of Completion
              </h1>
              <p className="text-[10px] sm:text-xs font-semibold tracking-widest text-amber-800 uppercase mt-0.5">
                NATIONAL TECHNICAL CURRICULUM ACCREDITATION
              </p>
            </div>

            {/* Certificate Core Statement */}
            <div className="relative z-10 text-center my-auto py-2">
              <p className="text-xs text-slate-500 italic">This is to officially certify that</p>
              
              <div className="my-1.5 sm:my-2">
                <span className="text-2xl sm:text-4xl lg:text-5xl font-serif font-bold text-slate-900 px-6 py-0.5 border-b border-amber-500/50 inline-block capitalize">
                  {certificate.student_name}
                </span>
              </div>

              <p className="text-xs sm:text-sm font-semibold text-slate-800 mt-1">
                Curriculum Track: <strong className="text-slate-900">{certificate.course_title}</strong>
              </p>

              <p className="text-[11px] sm:text-xs text-slate-600 max-w-2xl mx-auto mt-2 leading-relaxed px-4">
                has successfully fulfilled all curriculum benchmarks, hardware laboratory engineering sessions, and defended practical technical assignments with distinction.
              </p>

              {/* Single Distinction Honors Badge */}
              <div className="mt-2.5 inline-flex items-center gap-1.5 px-3.5 py-0.5 bg-amber-50 border border-amber-300 rounded-full text-xs font-bold text-amber-950 shadow-xs">
                <Award className="w-3.5 h-3.5 text-amber-600" />
                <span>Standing: {certificate.grade || 'Distinction'} ({certificate.score}%)</span>
              </div>
            </div>

            {/* Signatures, Official Gold Seal & Scannable QR Code */}
            <div className="relative z-10 flex flex-col gap-2 pt-3 border-t border-amber-600/20">
              <div className="flex flex-row items-end justify-between gap-3">
                {/* 1. Founder & Lead Instructor */}
                <div className="flex flex-col items-center text-center w-1/3">
                  <div className="h-11 sm:h-13 flex items-end justify-center mb-1 w-full max-w-[160px]">
                    <img 
                      src={ASSETS.EXECUTIVE_SIGNATURE} 
                      alt="Founder Signature" 
                      className="max-h-10 sm:max-h-12 max-w-full object-contain mix-blend-multiply" 
                    />
                  </div>
                  <div className="w-28 sm:w-36 border-t border-slate-700/50 pt-1">
                    <p className="text-[11px] sm:text-xs font-bold text-slate-900 leading-tight">Mr. S.O. Manongwa</p>
                    <p className="text-[8px] sm:text-[9px] text-slate-500 leading-tight">
                      Founder &amp; Executive Director
                    </p>
                  </div>
                </div>

                {/* 2. Official Seal + Scannable QR Code */}
                <div className="flex items-center justify-center gap-3 sm:gap-4 shrink-0 pb-1">
                  <div className="relative w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center">
                    <img 
                      src={ASSETS.OFFICIAL_GOLD_SEAL || ASSETS.EDUCATOR_SEAL} 
                      alt="Official YARA Seal" 
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
                        {certificate.certificate_number}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 3. Academic Director */}
                <div className="flex flex-col items-center text-center w-1/3">
                  <div className="h-11 sm:h-13 flex items-end justify-center mb-1 w-full max-w-[160px]">
                    <img 
                      src={ASSETS.SIGNATURE_CHIAMBIRO} 
                      alt="Regional President Signature" 
                      className="max-h-10 sm:max-h-12 max-w-full object-contain mix-blend-multiply" 
                    />
                  </div>
                  <div className="w-28 sm:w-36 border-t border-slate-700/50 pt-1">
                    <p className="text-[11px] sm:text-xs font-bold text-slate-900 leading-tight">Ms. A.M. Chiambiro</p>
                    <p className="text-[8px] sm:text-[9px] text-slate-500 leading-tight">
                      Regional President, YARA
                    </p>
                  </div>
                </div>
              </div>

              {/* Minimal Footnote */}
              <div className="text-center pt-1 flex items-center justify-between text-[8px] text-slate-400 font-mono px-2">
                <span>YARA Credential ID: <strong className="text-slate-700">{certificate.certificate_number}</strong></span>
                <span>Issued: {new Date(certificate.issue_date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                <span>yara.org/verify</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <RequireInternetModal
        isOpen={showInternetNeeded}
        onClose={() => setShowInternetNeeded(false)}
        featureName="Official Certificate PDF Download & Verification"
      />
    </div>
  );
}
