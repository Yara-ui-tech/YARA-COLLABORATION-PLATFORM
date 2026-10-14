import React, { useRef, useState } from 'react';
import { Award, Download, Share2, CheckCircle2, ShieldCheck, Printer, X as CloseIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Certificate } from '../../types/curriculum';
import { ASSETS } from '../../constants/assets';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import { RequireInternetModal } from '../OfflineBanner';
import { useQrCode } from '../../utils/qrCodeHelper';

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

        {/* Certificate Body (AI for Educators Style with Ornate Double Amber Border and QR Code) */}
        <div className="p-4 sm:p-8 bg-slate-100 flex justify-center">
          <div 
            ref={certRef}
            id="curriculum-certificate-document"
            className="relative w-full aspect-[1.414/1] min-h-[580px] sm:min-h-[640px] bg-gradient-to-br from-amber-50/50 via-white to-amber-50/30 rounded-3xl p-6 sm:p-10 md:p-12 shadow-2xl border-[10px] sm:border-[12px] border-double border-amber-600/80 overflow-hidden flex flex-col justify-between select-none text-slate-900"
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

            {/* Corner Decorative Accents */}
            <div className="absolute top-4 left-4 w-12 sm:w-16 h-12 sm:h-16 border-t-4 border-l-4 border-amber-700 pointer-events-none" />
            <div className="absolute top-4 right-4 w-12 sm:w-16 h-12 sm:h-16 border-t-4 border-r-4 border-amber-700 pointer-events-none" />
            <div className="absolute bottom-4 left-4 w-12 sm:w-16 h-12 sm:h-16 border-b-4 border-l-4 border-amber-700 pointer-events-none" />
            <div className="absolute bottom-4 right-4 w-12 sm:w-16 h-12 sm:h-16 border-b-4 border-r-4 border-amber-700 pointer-events-none" />

            {/* Logo and Institution Header */}
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="flex items-center justify-center gap-3 mb-1.5">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-white p-1 shadow-md border border-amber-300 flex items-center justify-center overflow-hidden shrink-0">
                  <img src={ASSETS.LOGO} alt="YARA" className="w-full h-full object-contain rounded-xl" />
                </div>
                <div className="text-left">
                  <span className="text-sm sm:text-xl font-black tracking-wider text-slate-900 uppercase block">
                    YARA ACADEMY OF ADVANCED ROBOTICS &amp; AI
                  </span>
                  <p className="text-[9px] sm:text-xs tracking-widest uppercase text-amber-700 font-bold">
                    In Collaboration with YARA Zimbabwe • Executive Directorate
                  </p>
                </div>
              </div>

              <div className="w-28 h-0.5 bg-gradient-to-r from-transparent via-amber-500 to-transparent my-1" />

              <h1 className="text-2xl sm:text-4xl font-serif font-black text-slate-900 tracking-wide mt-1 uppercase">
                Certificate of Completion
              </h1>
              <p className="text-[10px] sm:text-xs font-semibold tracking-widest text-amber-800 uppercase mt-0.5">
                NATIONAL TECHNICAL CURRICULUM &amp; CAPSTONE ACCREDITATION
              </p>
            </div>

            {/* Certificate Core Statement */}
            <div className="relative z-10 text-center my-auto py-2">
              <p className="text-xs sm:text-sm text-slate-600 italic">This is to officially certify that</p>
              
              <div className="my-1.5 sm:my-2">
                <span className="text-2xl sm:text-4xl lg:text-5xl font-serif font-bold text-slate-900 px-6 py-1 border-b-2 border-amber-600/60 inline-block capitalize">
                  {certificate.student_name}
                </span>
              </div>

              <p className="text-xs sm:text-sm font-semibold text-slate-800 mt-1">
                Curriculum Track: <strong className="text-slate-900">{certificate.course_title}</strong>
              </p>

              <p className="text-[10px] sm:text-xs text-slate-600 max-w-3xl mx-auto mt-2 leading-relaxed px-4">
                has successfully fulfilled all curriculum requirements, practical hardware laboratory sessions, technical assignments, examination benchmarks, and defended real-world engineering capstone demonstration with:
              </p>

              {/* Distinction Honors Badge */}
              <div className="mt-2.5 flex flex-wrap items-center justify-center gap-2">
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-100/80 via-amber-200/80 to-amber-100/80 border border-amber-400 px-4 py-1 rounded-full text-xs font-bold text-amber-950 shadow-sm">
                  <Award className="w-4 h-4 text-amber-700" />
                  <span>Standing: {certificate.grade || 'Distinction'} (Score: {certificate.score}%)</span>
                </div>
              </div>
            </div>

            {/* Signatures, Official Gold Seal & Scannable QR Code */}
            <div className="relative z-10 flex flex-col gap-2 pt-3 sm:pt-4 border-t border-amber-600/30">
              <div className="flex flex-row items-end justify-between gap-2 sm:gap-4">
                {/* 1. Founder & Lead Instructor */}
                <div className="flex flex-col items-center text-center w-1/3">
                  <div className="h-12 sm:h-14 flex items-end justify-center mb-1 w-full max-w-[180px]">
                    <img 
                      src={ASSETS.EXECUTIVE_SIGNATURE} 
                      alt="Simbarashe O Manongwa Signature" 
                      className="max-h-11 sm:max-h-13 max-w-full object-contain mix-blend-multiply drop-shadow-xs" 
                    />
                  </div>
                  <div className="w-32 sm:w-40 border-t border-slate-900/60 pt-1">
                    <p className="text-[11px] sm:text-xs font-bold text-slate-900">Mr. S.O. Manongwa</p>
                    <p className="text-[8px] sm:text-[9px] font-semibold text-slate-600 leading-tight">
                      Founder &amp; Executive Director
                    </p>
                  </div>
                </div>

                {/* 2. Official Seal + Scannable QR Code */}
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
                        Issued: {new Date(certificate.issue_date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  </div>

                  {/* High-DPI Verification QR Code */}
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
                        {certificate.certificate_number}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 3. Academic Director */}
                <div className="flex flex-col items-center text-center w-1/3">
                  <div className="h-12 sm:h-14 flex items-end justify-center mb-1 w-full max-w-[180px]">
                    <img 
                      src={ASSETS.SIGNATURE_CHIAMBIRO} 
                      alt="Regional President Signature" 
                      className="max-h-11 sm:max-h-13 max-w-full object-contain mix-blend-multiply drop-shadow-xs" 
                    />
                  </div>
                  <div className="w-32 sm:w-40 border-t border-slate-900/60 pt-1">
                    <p className="text-[11px] sm:text-xs font-bold text-slate-900">Ms. A.M. Chiambiro</p>
                    <p className="text-[8px] sm:text-[9px] font-semibold text-slate-600 leading-tight">
                      Regional President, YARA
                    </p>
                  </div>
                </div>
              </div>

              {/* Footnote / Accreditation Note Strip */}
              <div className="text-center pt-1 border-t border-amber-900/10 flex flex-col sm:flex-row items-center justify-between gap-1 text-[7px] sm:text-[8px] text-slate-500 font-medium px-2">
                <span>Official Credential • Young Africans Robotics &amp; Innovators Academy</span>
                <span className="font-mono text-amber-800">
                  Verify online: {verificationUrl}
                </span>
                <span>Credential ID: <strong className="text-slate-800 font-mono">{certificate.certificate_number}</strong></span>
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
