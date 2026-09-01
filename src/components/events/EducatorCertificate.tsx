import React, { useRef, useState } from 'react';
import { 
  Award, ShieldCheck, CheckCircle2, Download, Printer, 
  Share2, ExternalLink, Sparkles, Building2, Calendar, 
  Lock, AlertTriangle, FileText, Check, Image as ImageIcon, Loader2
} from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { EducatorCertificateData } from '../../types/eventRegistration';
import { ASSETS } from '../../constants/assets';

interface EducatorCertificateProps {
  data: EducatorCertificateData;
  onClose?: () => void;
  showPrintActions?: boolean;
  isAdmin?: boolean;
}

export default function EducatorCertificate({
  data,
  onClose,
  showPrintActions = true,
  isAdmin = false
}: EducatorCertificateProps) {
  const certificateRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [isGeneratingPng, setIsGeneratingPng] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const isLocked = data.status === 'locked' && !isAdmin;

  // Direct High-Resolution PNG Export (No surrounding webpage artifacts)
  const handleDownloadPng = async () => {
    if (isLocked) return;
    if (!certificateRef.current) return;
    setIsGeneratingPng(true);
    try {
      const element = certificateRef.current;
      const canvas = await html2canvas(element, {
        scale: 2.5,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        onclone: (clonedDoc) => {
          const clonedElem = clonedDoc.getElementById('educator-certificate-document');
          if (clonedElem) {
            clonedElem.style.borderRadius = '0px';
            clonedElem.style.boxShadow = 'none';
            clonedElem.style.transform = 'none';
          }
        }
      });

      const imgData = canvas.toDataURL('image/png', 1.0);
      const link = document.createElement('a');
      const safeName = (data.recipient_name || 'Educator').replace(/[^a-zA-Z0-9]/g, '_');
      const safeCert = (data.certificate_number || 'YARA_CERT').replace(/[^a-zA-Z0-9]/g, '_');
      link.download = `YARA_Certified_AI_Educator_${safeName}_${safeCert}.png`;
      link.href = imgData;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Failed to generate certificate PNG:', err);
      alert('Could not render PNG automatically. Please use the Print / Save PDF option.');
    } finally {
      setIsGeneratingPng(false);
    }
  };

  // Direct 1-Page Vector/Image PDF Export (A4 Landscape 297mm x 210mm)
  const handleDownloadPdf = async () => {
    if (isLocked) return;
    if (!certificateRef.current) return;
    setIsGeneratingPdf(true);
    try {
      const element = certificateRef.current;
      const canvas = await html2canvas(element, {
        scale: 2.5,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        onclone: (clonedDoc) => {
          const clonedElem = clonedDoc.getElementById('educator-certificate-document');
          if (clonedElem) {
            clonedElem.style.borderRadius = '0px';
            clonedElem.style.boxShadow = 'none';
            clonedElem.style.transform = 'none';
          }
        }
      });

      const imgData = canvas.toDataURL('image/png', 1.0);
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      // Exactly 1 page: A4 landscape dimensions 297mm x 210mm
      pdf.addImage(imgData, 'PNG', 0, 0, 297, 210, undefined, 'FAST');
      const safeName = (data.recipient_name || 'Educator').replace(/[^a-zA-Z0-9]/g, '_');
      const safeCert = (data.certificate_number || 'YARA_CERT').replace(/[^a-zA-Z0-9]/g, '_');
      pdf.save(`YARA_Certificate_${safeName}_${safeCert}.pdf`);
    } catch (err) {
      console.error('Failed to generate PDF:', err);
      window.print();
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handlePrint = () => {
    if (isLocked) return;
    window.print();
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(data.verification_url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // If locked and not an administrator, strictly forbid access/viewing
  if (isLocked) {
    return (
      <div className="flex flex-col items-center justify-center w-full max-w-2xl mx-auto p-8 sm:p-12 bg-white rounded-3xl shadow-2xl border border-amber-200 text-center font-sans">
        <div className="w-16 h-16 rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-700 mb-4 shadow-inner">
          <Lock className="w-8 h-8" />
        </div>
        <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300 mb-3">
          Certificate Locked
        </span>
        <h2 className="text-2xl font-black text-slate-900 mb-2">
          Administrative Approval Pending
        </h2>
        <p className="text-sm text-slate-600 max-w-md leading-relaxed mb-6">
          This certificate is currently locked and cannot be viewed or downloaded until your attendance, evaluation, and capstone project have been formally verified and unlocked by a YARA Administrator.
        </p>

        <div className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs text-left text-slate-700 space-y-2 mb-6 font-mono">
          <div className="flex justify-between">
            <span className="text-slate-500 font-sans">Recipient Name:</span>
            <strong className="text-slate-900 font-sans">{data.recipient_name}</strong>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 font-sans">Credential ID:</span>
            <strong className="text-amber-700">{data.certificate_number}</strong>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 font-sans">Status:</span>
            <span className="text-amber-600 font-bold font-sans">Locked (Awaiting Board Sign-Off)</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          {onClose && (
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition shadow-md cursor-pointer"
            >
              Close Window
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center w-full max-w-5xl mx-auto font-sans">
      {/* Top Action Bar (Never clipped, fully responsive) */}
      {showPrintActions && (
        <div className="w-full bg-slate-900 text-white px-4 sm:px-6 py-4 rounded-2xl mb-4 sm:mb-6 shadow-2xl border border-slate-800 print:hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            {/* Left: Credential Info Badge */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-slate-100">Official Certificate of Completion</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Verified & Unlocked
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Credential ID: <span className="font-mono text-amber-300 font-semibold">{data.certificate_number}</span>
                </p>
              </div>
            </div>

            {/* Right: Quick Action Download / Print Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              {/* 1. Download PNG Button */}
              <button
                onClick={handleDownloadPng}
                disabled={isGeneratingPng}
                className="px-3.5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 rounded-xl text-xs font-black transition flex items-center gap-1.5 shadow-md shadow-amber-500/20 cursor-pointer disabled:opacity-50"
                title="Download pristine high-resolution PNG image"
              >
                {isGeneratingPng ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Rendering PNG...</span>
                  </>
                ) : (
                  <>
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>Download PNG</span>
                  </>
                )}
              </button>

              {/* 2. Download 1-Page PDF Button */}
              <button
                onClick={handleDownloadPdf}
                disabled={isGeneratingPdf}
                className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-indigo-600/25 cursor-pointer disabled:opacity-50"
                title="Download 1-Page A4 landscape PDF"
              >
                {isGeneratingPdf ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving PDF...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5" />
                    <span>Download PDF</span>
                  </>
                )}
              </button>

              {/* 3. Print / Save as PDF */}
              <button
                onClick={handlePrint}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                title="Open browser print dialog"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print</span>
              </button>

              {/* 4. Share Verification Link */}
              <button
                onClick={handleCopyLink}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                title="Copy public verification link"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Share'}</span>
              </button>

              {/* 5. Public Verification URL */}
              <a
                href={data.verification_url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                title="View on public verification registry"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Verify</span>
              </a>

              {onClose && (
                <button
                  onClick={onClose}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl text-xs font-bold transition cursor-pointer ml-1"
                >
                  Close
                </button>
              )}
            </div>

          </div>
        </div>
      )}

      {/* =========================================================================
          THE CERTIFICATE CANVAS (Standard A4 Landscape Proportion)
          Pristine vector document: NO surrounding web elements, NO URLs, NO clutter.
         ========================================================================= */}
      <div 
        ref={certificateRef}
        id="educator-certificate-document"
        className="relative w-full aspect-[1.414/1] min-h-[580px] sm:min-h-[640px] bg-gradient-to-br from-amber-50/50 via-white to-amber-50/30 rounded-3xl p-6 sm:p-10 md:p-12 shadow-2xl border-[10px] sm:border-[12px] border-double border-amber-600/80 overflow-hidden flex flex-col justify-between select-none"
        style={{
          boxShadow: '0 25px 50px -12px rgba(180, 83, 9, 0.25), inset 0 0 80px rgba(245, 158, 11, 0.05)'
        }}
      >
        {/* Background Watermark Crest */}
        <div className="absolute inset-0 opacity-[0.035] pointer-events-none flex items-center justify-center">
          <svg viewBox="0 0 500 500" className="w-[85%] h-[85%] text-slate-950 fill-current">
            <circle cx="250" cy="250" r="230" stroke="currentColor" strokeWidth="4" fill="none" strokeDasharray="10, 5" />
            <circle cx="250" cy="250" r="190" stroke="currentColor" strokeWidth="6" fill="none" />
            <polygon points="250,50 300,180 440,180 330,260 370,390 250,310 130,390 170,260 60,180 200,180" fill="currentColor" />
          </svg>
        </div>

        {/* Ornate Corner Accents */}
        <div className="absolute top-4 left-4 w-12 sm:w-16 h-12 sm:h-16 border-t-4 border-l-4 border-amber-700 pointer-events-none"></div>
        <div className="absolute top-4 right-4 w-12 sm:w-16 h-12 sm:h-16 border-t-4 border-r-4 border-amber-700 pointer-events-none"></div>
        <div className="absolute bottom-4 left-4 w-12 sm:w-16 h-12 sm:h-16 border-b-4 border-l-4 border-amber-700 pointer-events-none"></div>
        <div className="absolute bottom-4 right-4 w-12 sm:w-16 h-12 sm:h-16 border-b-4 border-r-4 border-amber-700 pointer-events-none"></div>

        {/* ================= HEADER SECTION ================= */}
        <div className="relative z-10 flex flex-col items-center text-center">
          {/* Organization Official Logo & Brand Header */}
          <div className="flex items-center gap-3.5 mb-2">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-white p-1 shadow-md border border-amber-300 flex items-center justify-center overflow-hidden shrink-0">
              <img 
                src={data.logo_url || ASSETS.LOGO} 
                alt="YARA Official Logo" 
                className="w-full h-full object-contain rounded-xl"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="text-left">
              <span className="text-sm sm:text-xl font-black tracking-wider text-slate-900 uppercase block">
                {data.organization_name || 'YARA ACADEMY OF ADVANCED ROBOTICS & AI'}
              </span>
              <p className="text-[9px] sm:text-xs tracking-widest uppercase text-amber-700 font-bold">
                {data.sub_organization_name || 'In Collaboration with YARA Zimbabwe • Executive Directorate'}
              </p>
            </div>
          </div>

          <div className="w-28 h-0.5 bg-gradient-to-r from-transparent via-amber-500 to-transparent my-1"></div>

          {/* Certificate Title */}
          <h1 className="text-2xl sm:text-4xl font-serif font-black text-slate-900 tracking-wide mt-1 sm:mt-2 uppercase">
            {data.certificate_title || 'Certificate of Completion'}
          </h1>
          <p className="text-[10px] sm:text-sm font-semibold tracking-widest text-amber-800 uppercase mt-0.5">
            {data.certificate_subtitle || 'AI FOR EDUCATORS NATIONAL BOOTCAMP & PEDAGOGICAL CAPSTONE'}
          </p>
        </div>

        {/* ================= RECIPIENT BODY SECTION ================= */}
        <div className="relative z-10 text-center my-auto py-2">
          <p className="text-xs sm:text-sm text-slate-600 italic">This is to officially certify that</p>
          
          {/* Recipient Full Name */}
          <div className="my-1.5 sm:my-2">
            <span className="text-2xl sm:text-4xl lg:text-5xl font-serif font-bold text-slate-900 px-6 py-1 border-b-2 border-amber-600/60 inline-block">
              {data.recipient_name}
            </span>
          </div>

          {/* Institution & Province */}
          <p className="text-xs sm:text-sm font-medium text-slate-700 mt-1 flex items-center justify-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>Representing: <strong className="text-slate-900">{data.institution_name}</strong></span>
            {data.province && <span className="text-slate-500">({data.province})</span>}
          </p>

          {/* Citation Body */}
          <p className="text-[10px] sm:text-xs text-slate-600 max-w-3xl mx-auto mt-2.5 sm:mt-3 leading-relaxed px-4">
            {data.citation_text || 'has successfully completed the comprehensive national masterclass curriculum on Generative AI Tools for Education, Advanced Prompt Engineering, Automated Lesson Planning, Intelligent Student Assessment Systems, and ethical AI integration in primary & secondary classrooms, satisfying all evaluation criteria with:'}
          </p>

          {/* Distinction Honors Badge */}
          <div className="mt-2 inline-flex items-center gap-2 bg-gradient-to-r from-amber-100/80 via-amber-200/80 to-amber-100/80 border border-amber-400 px-4 py-1 rounded-full text-xs font-bold text-amber-950 shadow-sm">
            <Award className="w-4 h-4 text-amber-700" />
            <span>{data.grade || data.honors || 'Certified Educator - AI & Digital Pedagogy (Honors)'}</span>
          </div>
        </div>

        {/* ================= SIGNATURES & SEAL FOOTER ================= */}
        <div className="relative z-10 flex flex-row items-end justify-between gap-2 sm:gap-4 pt-3 sm:pt-4 border-t border-amber-600/30">
          
          {/* 1. Founder & Lead Instructor Signature Block (Mr. S.O. Manongwa) */}
          <div className="flex flex-col items-center text-center w-1/3">
            <div className="h-14 sm:h-16 flex items-end justify-center mb-1 w-full max-w-[200px]">
              {data.founder_signature || ASSETS.SIGNATURE_MANONGWA ? (
                <img 
                  src={data.founder_signature || ASSETS.SIGNATURE_MANONGWA} 
                  alt="Mr S.O. Manongwa Signature" 
                  className="max-h-12 sm:max-h-14 max-w-full object-contain mix-blend-multiply drop-shadow-xs"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <svg className="w-32 sm:w-36 h-10 text-indigo-950" viewBox="0 0 160 50">
                  <path 
                    d="M10,35 C25,10 40,40 55,15 C70,30 85,10 100,25 C115,15 130,35 150,20 M20,40 C60,45 110,40 140,42" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2.2" 
                    strokeLinecap="round"
                  />
                </svg>
              )}
            </div>
            <div className="w-36 sm:w-44 border-t border-slate-900/60 pt-1">
              <p className="text-[11px] sm:text-sm font-bold text-slate-900">{data.founder_name || 'Mr. S.O. Manongwa'}</p>
              <p className="text-[8px] sm:text-[10px] font-semibold text-slate-600 leading-tight whitespace-pre-line">
                {data.founder_title || 'Founder & Lead Instructor\nYoung Africans Robotics Association (YARA)'}
              </p>
            </div>
          </div>

          {/* 2. Official Certified Gold & Blue Foil Seal */}
          <div className="flex flex-col items-center justify-center shrink-0">
            <div className="relative w-20 h-20 sm:w-28 sm:h-28 flex items-center justify-center">
              <img 
                src={data.seal_url || ASSETS.EDUCATOR_SEAL} 
                alt="Certified AI for Educators Seal" 
                className="w-full h-full object-contain drop-shadow-xl select-none pointer-events-none transform transition-transform hover:scale-105"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="mt-1 text-center">
              <span className="text-[7px] sm:text-[9px] font-mono text-slate-500 font-semibold block">
                Issued: {data.issue_date}
              </span>
              <span className="text-[8px] sm:text-[9px] font-mono text-amber-800 font-bold block">
                {data.certificate_number}
              </span>
            </div>
          </div>

          {/* 3. Regional President Signature Block (Ms. A.M. Chiambiro) */}
          <div className="flex flex-col items-center text-center w-1/3">
            <div className="h-14 sm:h-16 flex items-end justify-center mb-1 w-full max-w-[200px]">
              {data.regional_president_signature || ASSETS.SIGNATURE_CHIAMBIRO ? (
                <img 
                  src={data.regional_president_signature || ASSETS.SIGNATURE_CHIAMBIRO} 
                  alt="Ms A.M. Chiambiro Signature" 
                  className="max-h-12 sm:max-h-14 max-w-full object-contain mix-blend-multiply drop-shadow-xs"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <svg className="w-32 sm:w-36 h-10 text-indigo-950" viewBox="0 0 160 50">
                  <path 
                    d="M15,25 C30,5 50,45 75,10 C90,35 110,20 125,30 C135,15 145,25 155,18 M10,42 C50,40 100,43 145,39" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round"
                  />
                </svg>
              )}
            </div>
            <div className="w-36 sm:w-44 border-t border-slate-900/60 pt-1">
              <p className="text-[11px] sm:text-sm font-bold text-slate-900">{data.regional_president_name || 'Ms. A.M. Chiambiro'}</p>
              <p className="text-[8px] sm:text-[10px] font-semibold text-slate-600 leading-tight whitespace-pre-line">
                {data.regional_president_title || 'Regional President\nYARA Zimbabwe'}
              </p>
            </div>
          </div>

        </div>

      </div>

      {/* Strict 1-Page A4 Print Stylesheet (Eliminates multi-page overflow and browser URL headers) */}
      <style>{`
        @page {
          size: A4 landscape;
          margin: 0mm;
        }
        @media print {
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            height: 100vh !important;
            overflow: hidden !important;
            background: #ffffff !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          body * {
            visibility: hidden !important;
          }
          #educator-certificate-document, #educator-certificate-document * {
            visibility: visible !important;
          }
          #educator-certificate-document {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            max-width: 100vw !important;
            max-height: 100vh !important;
            margin: 0 !important;
            padding: 2.2cm 2cm !important;
            border-width: 8px !important;
            box-shadow: none !important;
            page-break-inside: avoid !important;
            page-break-before: avoid !important;
            page-break-after: avoid !important;
            break-inside: avoid !important;
            border-radius: 0 !important;
            background: #ffffff !important;
          }
        }
      `}</style>
    </div>
  );
}

