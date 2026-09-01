import React, { useRef } from 'react';
import { 
  Award, ShieldCheck, CheckCircle2, Download, Printer, 
  Share2, ExternalLink, Sparkles, Building2, Calendar, 
  Lock, AlertTriangle, FileText, Check 
} from 'lucide-react';
import { EducatorCertificateData } from '../../types/eventRegistration';
import { ASSETS } from '../../constants/assets';

interface EducatorCertificateProps {
  data: EducatorCertificateData;
  onClose?: () => void;
  showPrintActions?: boolean;
}

export default function EducatorCertificate({
  data,
  onClose,
  showPrintActions = true
}: EducatorCertificateProps) {
  const certificateRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = React.useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(data.verification_url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const isLocked = data.status === 'locked';

  return (
    <div className="flex flex-col items-center w-full max-w-5xl mx-auto font-sans">
      {/* Top Action Bar */}
      {showPrintActions && (
        <div className="w-full flex flex-wrap items-center justify-between gap-3 bg-slate-900 text-white px-6 py-4 rounded-2xl mb-6 shadow-xl print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-slate-100">Official Certificate of Completion</span>
                {isLocked ? (
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                    <Lock className="w-3 h-3" /> Approval Pending
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Verified & Issued
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">Unique Credential ID: <span className="font-mono text-amber-300">{data.certificate_number}</span></p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isLocked && (
              <>
                <button
                  onClick={handlePrint}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-indigo-600/30 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  Print / Save PDF
                </button>
                <button
                  onClick={handleCopyLink}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
                  {copied ? 'Link Copied!' : 'Share Link'}
                </button>
              </>
            )}

            <a
              href={data.verification_url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-bold transition flex items-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              Public Verification
            </a>

            {onClose && (
              <button
                onClick={onClose}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl text-xs font-bold transition ml-2 cursor-pointer"
              >
                Close
              </button>
            )}
          </div>
        </div>
      )}

      {/* Locked Warning Banner if not unlocked */}
      {isLocked && (
        <div className="w-full bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 flex items-start gap-3 text-amber-900 print:hidden">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <p className="font-bold text-sm text-amber-950">Certificate Pending Admin Completion Verification</p>
            <p>
              Your official certificate has been drafted and registered in our database under ID <strong className="font-mono">{data.certificate_number}</strong>. 
              Once the YARA Executive Board verifies your bootcamp participation and capstone project submission, an administrator will unlock your high-resolution printable credential.
            </p>
          </div>
        </div>
      )}

      {/* =========================================================================
          THE CERTIFICATE CANVAS (Standard 4:3 / A4 Landscape Proportion)
          Designed with luxury navy & gold vector aesthetics, guilloche border, 
          authentic signatures, dynamic QR code, and official seal.
         ========================================================================= */}
      <div 
        ref={certificateRef}
        id="educator-certificate-document"
        className={`relative w-full aspect-[1.414/1] min-h-[640px] bg-gradient-to-br from-amber-50/50 via-white to-amber-50/30 rounded-3xl p-8 sm:p-12 shadow-2xl border-[12px] border-double border-amber-600/80 overflow-hidden flex flex-col justify-between select-none ${
          isLocked ? 'opacity-90 filter grayscale-[20%]' : ''
        }`}
        style={{
          boxShadow: '0 25px 50px -12px rgba(180, 83, 9, 0.25), inset 0 0 80px rgba(245, 158, 11, 0.05)'
        }}
      >
        {/* Background Watermark Crest & Guilloche Pattern */}
        <div className="absolute inset-0 opacity-[0.035] pointer-events-none flex items-center justify-center">
          <svg viewBox="0 0 500 500" className="w-[85%] h-[85%] text-slate-950 fill-current">
            <circle cx="250" cy="250" r="230" stroke="currentColor" strokeWidth="4" fill="none" strokeDasharray="10, 5" />
            <circle cx="250" cy="250" r="190" stroke="currentColor" strokeWidth="6" fill="none" />
            <polygon points="250,50 300,180 440,180 330,260 370,390 250,310 130,390 170,260 60,180 200,180" fill="currentColor" />
          </svg>
        </div>

        {/* Ornate Corner Accents */}
        <div className="absolute top-4 left-4 w-16 h-16 border-t-4 border-l-4 border-amber-700 pointer-events-none"></div>
        <div className="absolute top-4 right-4 w-16 h-16 border-t-4 border-r-4 border-amber-700 pointer-events-none"></div>
        <div className="absolute bottom-4 left-4 w-16 h-16 border-b-4 border-l-4 border-amber-700 pointer-events-none"></div>
        <div className="absolute bottom-4 right-4 w-16 h-16 border-b-4 border-r-4 border-amber-700 pointer-events-none"></div>

        {/* Watermark Ribbon Overlay if Locked */}
        {isLocked && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
            <div className="rotate-[-25deg] bg-amber-600/90 text-white font-black tracking-widest text-3xl sm:text-4xl py-3 px-16 shadow-2xl border-4 border-white/80 rounded-xl">
              PREVIEW ONLY • UNLOCK PENDING
            </div>
          </div>
        )}

        {/* ================= HEADER SECTION ================= */}
        <div className="relative z-10 flex flex-col items-center text-center">
          {/* Organization Official Logo & Brand Header */}
          <div className="flex items-center gap-3.5 mb-2">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white p-1 shadow-md border border-amber-300 flex items-center justify-center overflow-hidden shrink-0">
              <img 
                src={ASSETS.LOGO} 
                alt="YARA Official Logo" 
                className="w-full h-full object-contain rounded-xl"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="text-left">
              <span className="text-base sm:text-xl font-black tracking-wider text-slate-900 uppercase block">
                YARA ACADEMY OF ADVANCED ROBOTICS & AI
              </span>
              <p className="text-[10px] sm:text-xs tracking-widest uppercase text-amber-700 font-bold">
                In Collaboration with YARA Zimbabwe • Executive Directorate
              </p>
            </div>
          </div>

          <div className="w-28 h-0.5 bg-gradient-to-r from-transparent via-amber-500 to-transparent my-1"></div>

          {/* Certificate Title */}
          <h1 className="text-2xl sm:text-4xl font-serif font-black text-slate-900 tracking-wide mt-2 uppercase">
            Certificate of Professional Mastery
          </h1>
          <p className="text-xs sm:text-sm font-semibold tracking-widest text-amber-800 uppercase mt-0.5">
            AI FOR EDUCATORS NATIONAL BOOTCAMP & PEDAGOGICAL CAPSTONE
          </p>
        </div>

        {/* ================= RECIPIENT BODY SECTION ================= */}
        <div className="relative z-10 text-center my-auto py-2">
          <p className="text-xs sm:text-sm text-slate-600 italic">This is to officially certify that</p>
          
          {/* Recipient Full Name */}
          <div className="my-2">
            <span className="text-2xl sm:text-4xl lg:text-5xl font-serif font-bold text-slate-900 px-6 py-1 border-b-2 border-amber-600/60 inline-block">
              {data.recipient_name}
            </span>
          </div>

          {/* Institution & Province */}
          <p className="text-xs sm:text-sm font-medium text-slate-700 mt-1 flex items-center justify-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-amber-600" />
            <span>Representing: <strong className="text-slate-900">{data.institution_name}</strong></span>
            {data.province && <span className="text-slate-500">({data.province})</span>}
          </p>

          {/* Citation Body - Duration omitted as requested */}
          <p className="text-[11px] sm:text-xs text-slate-600 max-w-3xl mx-auto mt-3 leading-relaxed px-4">
            has successfully completed the comprehensive national masterclass curriculum on <strong className="text-slate-800">Generative AI Tools for Education, Advanced Prompt Engineering, Automated Lesson Planning, Intelligent Student Assessment Systems</strong>, and ethical AI integration in primary & secondary classrooms, satisfying all evaluation criteria with:
          </p>

          {/* Distinction Honors Badge */}
          <div className="mt-2 inline-flex items-center gap-2 bg-gradient-to-r from-amber-100/80 via-amber-200/80 to-amber-100/80 border border-amber-400 px-4 py-1 rounded-full text-xs font-bold text-amber-950 shadow-sm">
            <Award className="w-4 h-4 text-amber-700" />
            <span>{data.grade || 'Distinction with Honors'}</span>
          </div>
        </div>

        {/* ================= SIGNATURES & SEAL FOOTER ================= */}
        <div className="relative z-10 flex flex-row items-end justify-between gap-4 pt-4 border-t border-amber-600/30">
          
          {/* 1. Founder & Lead Instructor Signature Block */}
          <div className="flex flex-col items-center text-center w-1/3">
            {/* Signature Graphic */}
            <div className="h-12 flex items-end justify-center mb-1">
              <svg className="w-36 h-10 text-indigo-950" viewBox="0 0 160 50">
                <path 
                  d="M10,35 C25,10 40,40 55,15 C70,30 85,10 100,25 C115,15 130,35 150,20 M20,40 C60,45 110,40 140,42" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2.2" 
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <div className="w-40 border-t border-slate-900/60 pt-1">
              <p className="text-xs sm:text-sm font-bold text-slate-900">{data.founder_name}</p>
              <p className="text-[9px] sm:text-[10px] font-semibold text-slate-600 leading-tight">
                {data.founder_title}
              </p>
            </div>
          </div>

          {/* 2. Official Certified Gold & Blue Foil Seal (From Uploaded Badge) */}
          <div className="flex flex-col items-center justify-center shrink-0">
            <div className="relative w-28 h-28 sm:w-32 sm:h-32 flex items-center justify-center">
              <img 
                src={ASSETS.EDUCATOR_SEAL} 
                alt="Certified AI for Educators Seal" 
                className="w-full h-full object-contain drop-shadow-xl select-none pointer-events-none transform transition-transform hover:scale-105"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="mt-1 text-center">
              <span className="text-[8px] sm:text-[9px] font-mono text-slate-500 font-semibold block">
                Issued: {data.issue_date}
              </span>
              <span className="text-[8px] sm:text-[9px] font-mono text-amber-800 font-bold block">
                {data.certificate_number}
              </span>
            </div>
          </div>

          {/* 3. Regional President (YARA Zimbabwe) Signature Block */}
          <div className="flex flex-col items-center text-center w-1/3">
            {/* Signature Graphic */}
            <div className="h-12 flex items-end justify-center mb-1">
              <svg className="w-36 h-10 text-indigo-950" viewBox="0 0 160 50">
                <path 
                  d="M15,25 C30,5 50,45 75,10 C90,35 110,20 125,30 C135,15 145,25 155,18 M10,42 C50,40 100,43 145,39" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <div className="w-40 border-t border-slate-900/60 pt-1">
              <p className="text-xs sm:text-sm font-bold text-slate-900">{data.regional_president_name}</p>
              <p className="text-[9px] sm:text-[10px] font-semibold text-slate-600 leading-tight">
                {data.regional_president_title}
              </p>
            </div>
          </div>

        </div>

      </div>

      {/* Print CSS to guarantee clean single-page certificate print */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #educator-certificate-document, #educator-certificate-document * {
            visibility: visible;
          }
          #educator-certificate-document {
            position: fixed;
            left: 0;
            top: 0;
            width: 100vw;
            height: 100vh;
            margin: 0;
            padding: 2.5cm 2cm;
            border-width: 8px;
            box-shadow: none;
            page-break-inside: avoid;
            background: white !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      `}</style>
    </div>
  );
}
