import React, { useRef } from 'react';
import { Award, Download, Share2, CheckCircle2, ShieldCheck, Printer, X as CloseIcon, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Certificate } from '../../types/curriculum';
import { ASSETS } from '../../constants/assets';

interface CertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  certificate: Certificate;
}

export default function CertificateModal({ isOpen, onClose, certificate }: CertificateModalProps) {
  const certRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}/curriculum?cert=${certificate.certificate_number}`;
    navigator.clipboard.writeText(url);
    alert('Certificate verification link copied to clipboard!');
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 md:p-8 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl overflow-hidden my-auto border border-slate-100 relative"
      >
        {/* Action Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between no-print">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm">Verified Certificate of Completion</h4>
              <p className="text-xs text-slate-400">ID: {certificate.certificate_number}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleCopyLink}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-all flex items-center space-x-1.5"
              title="Copy share link"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Share</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all flex items-center space-x-1.5 shadow-lg shadow-indigo-500/30"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Download PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl transition-colors ml-2"
            >
              <CloseIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Certificate Body (Optimized for High-Res Print & Display) */}
        <div className="p-6 md:p-12 bg-amber-50/30">
          <div 
            ref={certRef}
            className="bg-white border-8 border-double border-amber-600/30 rounded-2xl p-8 md:p-14 relative shadow-sm text-center overflow-hidden"
            style={{ minHeight: '520px' }}
          >
            {/* Corner Decorative Accents */}
            <div className="absolute top-3 left-3 w-12 h-12 border-t-2 border-l-2 border-amber-600"></div>
            <div className="absolute top-3 right-3 w-12 h-12 border-t-2 border-r-2 border-amber-600"></div>
            <div className="absolute bottom-3 left-3 w-12 h-12 border-b-2 border-l-2 border-amber-600"></div>
            <div className="absolute bottom-3 right-3 w-12 h-12 border-b-2 border-r-2 border-amber-600"></div>

            {/* Background Watermark */}
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
              <Award className="w-96 h-96 text-slate-900" />
            </div>

            {/* Logo and Institution Header */}
            <div className="flex flex-col items-center space-y-2 mb-6">
              <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-md overflow-hidden mb-2">
                {ASSETS.LOGO ? (
                  <img src={ASSETS.LOGO} alt="YARIA" className="w-full h-full object-cover" />
                ) : (
                  <span>Y</span>
                )}
              </div>
              <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-wider uppercase font-serif">
                Young African Robotics & Innovators Academy
              </h2>
              <div className="h-0.5 w-32 bg-amber-500 mx-auto"></div>
              <p className="text-xs uppercase tracking-[0.25em] text-slate-500 font-bold">
                Official Certification of Technical Competence
              </p>
            </div>

            {/* Certificate Core Statement */}
            <p className="text-sm text-slate-500 italic mb-2">This is to certify that</p>
            
            <h1 className="text-3xl md:text-5xl font-black text-indigo-950 font-serif tracking-tight mb-4 capitalize">
              {certificate.student_name}
            </h1>

            <p className="text-sm md:text-base text-slate-600 max-w-xl mx-auto leading-relaxed mb-6 font-medium">
              has successfully fulfilled all curriculum requirements, practical laboratory sessions, assignments, final comprehensive examination, and capstone engineering demonstration in
            </p>

            <div className="inline-block bg-indigo-50/80 border border-indigo-200/80 rounded-2xl px-6 py-3 mb-8">
              <span className="text-lg md:text-xl font-black text-indigo-900 uppercase tracking-wide">
                {certificate.course_title}
              </span>
            </div>

            {/* Details & Grade */}
            <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto mb-10 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 block font-bold uppercase tracking-wider text-[10px]">Final Score</span>
                <span className="text-base font-black text-emerald-600">{certificate.score}%</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 block font-bold uppercase tracking-wider text-[10px]">Standing</span>
                <span className="text-base font-black text-indigo-600">{certificate.grade}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 block font-bold uppercase tracking-wider text-[10px]">Date Issued</span>
                <span className="text-xs font-bold text-slate-700 block mt-1">
                  {new Date(certificate.issue_date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                </span>
              </div>
            </div>

            {/* Signatures & Seal */}
            <div className="grid grid-cols-3 items-end gap-4 pt-6 border-t border-slate-200 text-xs">
              <div className="space-y-1">
                <div className="font-serif italic font-bold text-slate-800 text-sm">Simbarashe Manongwa</div>
                <div className="h-0.5 bg-slate-300 w-32 mx-auto"></div>
                <p className="text-[10px] text-slate-500 font-bold uppercase">President & Lead Instructor</p>
                <p className="text-[9px] text-slate-400">YARIA Robotics Council</p>
              </div>

              {/* Gold Verification Seal */}
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 p-1 shadow-lg flex items-center justify-center text-slate-900 relative">
                  <div className="w-full h-full rounded-full border-2 border-dashed border-amber-900/30 flex flex-col items-center justify-center p-2 text-center">
                    <ShieldCheck className="w-5 h-5 text-amber-900 mb-0.5" />
                    <span className="text-[7px] font-black uppercase tracking-tighter text-amber-950 leading-none">
                      VERIFIED<br/>OFFICIAL
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <div className="font-serif italic font-bold text-slate-800 text-sm">Goyara Directorate</div>
                <div className="h-0.5 bg-slate-300 w-32 mx-auto"></div>
                <p className="text-[10px] text-slate-500 font-bold uppercase">Academic & Tech Director</p>
                <p className="text-[9px] text-slate-400">Accreditation Board</p>
              </div>
            </div>

            <div className="mt-8 text-[10px] text-slate-400 font-mono">
              Verification Code: {certificate.certificate_number} • Issued by Young African Robotics & Innovators Academy
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
