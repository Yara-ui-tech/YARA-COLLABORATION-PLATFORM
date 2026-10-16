import React, { useRef, useState } from 'react';
import { 
  Award, ShieldCheck, CheckCircle2, Download, Printer, 
  Share2, ExternalLink, Building2, Calendar, 
  Lock, AlertTriangle, FileText, Check, Image as ImageIcon, Loader2,
  MessageCircle, Link2, Bookmark, Globe, Tag
} from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { EducatorCertificateData } from '../../types/eventRegistration';
import { ASSETS } from '../../constants/assets';
import { useQrCode } from '../../utils/qrCodeHelper';

interface EducatorCertificateProps {
  data: EducatorCertificateData;
  onClose?: () => void;
  showPrintActions?: boolean;
  isAdmin?: boolean;
}

// Convert all images inside container to base64 Data URLs to prevent canvas tainting
async function convertImagesToBase64(container: HTMLElement): Promise<void> {
  const images = Array.from(container.querySelectorAll('img'));
  await Promise.all(images.map(async (img) => {
    try {
      if (img.src && !img.src.startsWith('data:')) {
        if (img.complete && img.naturalWidth > 0) {
          try {
            const canvas = document.createElement('canvas');
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(img, 0, 0);
              const dataUrl = canvas.toDataURL('image/png');
              if (dataUrl && dataUrl.startsWith('data:')) {
                img.src = dataUrl;
                return;
              }
            }
          } catch {
            // fallback to fetch
          }
        }
        
        const res = await fetch(img.src, { mode: 'cors' });
        const blob = await res.blob();
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
        if (dataUrl && dataUrl.startsWith('data:')) {
          img.src = dataUrl;
        }
      }
    } catch (err) {
      console.warn('Image base64 conversion note:', err);
    }
  }));
}

export default function EducatorCertificate({
  data,
  onClose,
  showPrintActions = true,
  isAdmin = false
}: EducatorCertificateProps) {
  const certificateRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [isGeneratingJpg, setIsGeneratingJpg] = useState(false);
  const [isGeneratingPng, setIsGeneratingPng] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const isLocked = data.status === 'locked' && !isAdmin;
  const qrVerificationUrl = data.verification_url || `https://yara.org/verify-certificate?id=${data.certificate_number}`;
  const qrCodeDataUrl = useQrCode(qrVerificationUrl, { width: 180, darkColor: '#0f172a' });

  // Helper to render high-resolution canvas with embedded assets
  const renderCertificateCanvas = async (element: HTMLElement) => {
    if (document.fonts && document.fonts.ready) {
      await document.fonts.ready;
    }

    return await html2canvas(element, {
      scale: 2, // High-DPI crisp resolution without thread freeze
      useCORS: true,
      allowTaint: false, // Critical: prevent canvas security errors on toDataURL
      backgroundColor: '#ffffff',
      logging: false,
      imageTimeout: 10000,
      onclone: async (clonedDoc) => {
        const clonedElem = clonedDoc.getElementById('educator-certificate-document');
        if (clonedElem) {
          clonedElem.style.borderRadius = '0px';
          clonedElem.style.boxShadow = 'none';
          clonedElem.style.transform = 'none';
          await convertImagesToBase64(clonedElem);
        }
      }
    });
  };

  // 1. Direct High-Resolution JPG Export (Ultra-sharp, compatible with all mobile/desktop devices)
  const handleDownloadJpg = async () => {
    if (isLocked || !certificateRef.current) return;
    setIsGeneratingJpg(true);
    // Yield to the paint loop so React renders loading state immediately
    await new Promise(resolve => requestAnimationFrame(() => setTimeout(resolve, 0)));
    try {
      const canvas = await renderCertificateCanvas(certificateRef.current);
      const imgData = canvas.toDataURL('image/jpeg', 0.98);
      const link = document.createElement('a');
      const safeName = (data.recipient_name || 'Educator').replace(/[^a-zA-Z0-9]/g, '_');
      const safeCert = (data.certificate_number || 'YARA_CERT').replace(/[^a-zA-Z0-9]/g, '_');
      link.download = `YARA_Certified_AI_Educator_${safeName}_${safeCert}.jpg`;
      link.href = imgData;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Failed to generate certificate JPG:', err);
      // Fallback directly to native print/save dialog
      setTimeout(() => window.print(), 50);
    } finally {
      setIsGeneratingJpg(false);
    }
  };

  // 2. Direct High-Resolution Lossless PNG Export
  const handleDownloadPng = async () => {
    if (isLocked || !certificateRef.current) return;
    setIsGeneratingPng(true);
    // Yield to the paint loop so React renders loading state immediately
    await new Promise(resolve => requestAnimationFrame(() => setTimeout(resolve, 0)));
    try {
      const canvas = await renderCertificateCanvas(certificateRef.current);
      const imgData = canvas.toDataURL('image/png');
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
      setTimeout(() => window.print(), 50);
    } finally {
      setIsGeneratingPng(false);
    }
  };

  // 3. Direct 1-Page Vector/Image PDF Export (A4 Landscape 297mm x 210mm)
  const handleDownloadPdf = async () => {
    if (isLocked || !certificateRef.current) return;
    setIsGeneratingPdf(true);
    // Yield to the paint loop so React renders loading state immediately
    await new Promise(resolve => requestAnimationFrame(() => setTimeout(resolve, 0)));
    try {
      const canvas = await renderCertificateCanvas(certificateRef.current);
      const imgData = canvas.toDataURL('image/jpeg', 0.98);
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      // Exactly 1 page: A4 landscape dimensions 297mm x 210mm
      pdf.addImage(imgData, 'JPEG', 0, 0, 297, 210, undefined, 'FAST');
      const safeName = (data.recipient_name || 'Educator').replace(/[^a-zA-Z0-9]/g, '_');
      const safeCert = (data.certificate_number || 'YARA_CERT').replace(/[^a-zA-Z0-9]/g, '_');
      pdf.save(`YARA_Certificate_${safeName}_${safeCert}.pdf`);
    } catch (err) {
      console.error('Failed to generate PDF:', err);
      setTimeout(() => window.print(), 50);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handlePrint = () => {
    if (isLocked) return;
    setTimeout(() => window.print(), 50);
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

  const whatsappUrl = data.official_whatsapp_link || 'https://whatsapp.com/channel/0029Vb66TBjBKfi5RoRGuo0T';

  return (
    <div className="flex flex-col items-center w-full max-w-5xl mx-auto font-sans">
      {/* Top Action Bar */}
      {showPrintActions && (
        <div className="w-full bg-slate-900 text-white px-5 py-3.5 rounded-2xl mb-4 shadow-xl border border-slate-800 print:hidden flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-xs text-slate-100">AI for Educators Credential</span>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Verified
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono">
                ID: <span className="text-amber-300 font-semibold">{data.certificate_number}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Download PDF */}
            <button
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf || isGeneratingJpg || isGeneratingPng}
              className="px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 rounded-xl text-xs font-black transition flex items-center gap-1.5 shadow-md shadow-amber-500/20 cursor-pointer disabled:opacity-50"
              title="Download high-resolution PDF document"
            >
              {isGeneratingPdf ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Generating PDF...</span>
                </>
              ) : (
                <>
                  <FileText className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </>
              )}
            </button>

            {/* Print */}
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>

            {/* Share */}
            <button
              onClick={handleCopyLink}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Share'}</span>
            </button>

            {onClose && (
              <button
                onClick={onClose}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl text-xs font-bold transition cursor-pointer ml-1"
              >
                Close
              </button>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          THE CERTIFICATE CANVAS (Minimalist, Prestigious, Uncrowded)
         ========================================================================= */}
      <div 
        ref={certificateRef}
        id="educator-certificate-document"
        className="relative w-full aspect-[1.414/1] min-h-[540px] sm:min-h-[600px] bg-gradient-to-br from-[#fffdfa] via-white to-[#faf6ef] rounded-2xl p-6 sm:p-10 md:p-12 shadow-xl border-2 border-amber-600/40 overflow-hidden flex flex-col justify-between select-none font-sans text-slate-900"
        style={{
          maxWidth: '940px',
          boxSizing: 'border-box'
        }}
      >
        {/* Inner Border */}
        <div className="absolute inset-3 sm:inset-4 rounded-xl border border-amber-600/25 pointer-events-none" />

        {/* Subtle Background Crest */}
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

        {/* ================= HEADER SECTION ================= */}
        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="flex items-center justify-center gap-3 mb-1">
            <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-xl bg-white p-1 shadow-xs border border-amber-200/80 flex items-center justify-center overflow-hidden shrink-0">
              <img 
                src={data.logo_url || ASSETS.LOGO} 
                alt="YARA" 
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="text-left">
              <span className="text-xs sm:text-sm font-bold tracking-[0.2em] text-slate-800 uppercase block">
                {data.organization_name || 'YOUNG AFRICANS ROBOTICS ASSOCIATION'}
              </span>
              <p className="text-[9px] sm:text-[10px] tracking-wider uppercase text-amber-700 font-semibold">
                AI for Educators Directorate
              </p>
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif font-black text-slate-900 tracking-wide mt-2 uppercase">
            {data.certificate_title || 'Certificate of Completion'}
          </h1>
          <p className="text-[10px] sm:text-xs font-semibold tracking-widest text-amber-800 uppercase mt-0.5">
            {data.certificate_subtitle || 'AI FOR EDUCATORS NATIONAL BOOTCAMP'}
          </p>
        </div>

        {/* ================= RECIPIENT BODY SECTION ================= */}
        <div className="relative z-10 text-center my-auto py-2">
          <p className="text-xs text-slate-500 italic">This is to officially certify that</p>
          
          <div className="my-1.5 sm:my-2">
            <span className="text-2xl sm:text-4xl lg:text-5xl font-serif font-bold text-slate-900 px-6 py-0.5 border-b border-amber-500/50 inline-block">
              {data.recipient_name}
            </span>
          </div>

          {data.institution_name && (
            <p className="text-xs sm:text-sm font-semibold text-slate-800 mt-1 flex items-center justify-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>Representing: <strong className="text-slate-900">{data.institution_name}</strong></span>
              {data.province && <span className="text-slate-500">({data.province})</span>}
            </p>
          )}

          {/* Clean Citation Body */}
          <p className="text-[11px] sm:text-xs text-slate-600 max-w-2xl mx-auto mt-2 leading-relaxed px-4">
            {data.citation_text || 'has successfully completed the comprehensive national masterclass curriculum in Generative AI for Education, pedagogical automation, and ethical classroom integration.'}
          </p>

          {/* Single Honors Badge */}
          <div className="mt-2.5 inline-flex items-center gap-1.5 px-3.5 py-0.5 bg-amber-50 border border-amber-300 rounded-full text-xs font-bold text-amber-950 shadow-xs">
            <Award className="w-3.5 h-3.5 text-amber-600" />
            <span>{data.grade || data.honors || 'Certified AI Educator (Honors)'}</span>
          </div>
        </div>

        {/* ================= SIGNATURES & SEAL FOOTER ================= */}
        <div className="relative z-10 flex flex-col gap-2 pt-3 border-t border-amber-600/20">
          
          <div className="flex flex-row items-end justify-between gap-3">
            {/* Founder Signature */}
            <div className="flex flex-col items-center text-center w-1/3">
              <div className="h-11 sm:h-13 flex items-end justify-center mb-1 w-full max-w-[160px]">
                {data.founder_signature || ASSETS.SIGNATURE_MANONGWA ? (
                  <img 
                    src={data.founder_signature || ASSETS.SIGNATURE_MANONGWA} 
                    alt="Founder Signature" 
                    className="max-h-10 sm:max-h-12 max-w-full object-contain mix-blend-multiply"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <svg className="w-24 sm:w-28 h-8 text-indigo-950" viewBox="0 0 160 50">
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
              <div className="w-28 sm:w-36 border-t border-slate-700/50 pt-1">
                <p className="text-[11px] sm:text-xs font-bold text-slate-900 leading-tight">{data.founder_name || 'Mr. S.O. Manongwa'}</p>
                <p className="text-[8px] sm:text-[9px] text-slate-500 leading-tight">
                  {data.founder_title || 'Founder & Lead Instructor'}
                </p>
              </div>
            </div>

            {/* Official Gold Seal & QR Code */}
            <div className="flex items-center justify-center gap-3 sm:gap-4 shrink-0 pb-1">
              <div className="relative w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center">
                <img 
                  src={data.seal_url || ASSETS.EDUCATOR_SEAL} 
                  alt="Official Certified Seal" 
                  className="w-full h-full object-contain select-none pointer-events-none drop-shadow-sm"
                  referrerPolicy="no-referrer"
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
                    {data.certificate_number}
                  </span>
                </div>
              </div>
            </div>

            {/* Regional President Signature */}
            <div className="flex flex-col items-center text-center w-1/3">
              <div className="h-11 sm:h-13 flex items-end justify-center mb-1 w-full max-w-[160px]">
                {data.regional_president_signature || ASSETS.SIGNATURE_CHIAMBIRO ? (
                  <img 
                    src={data.regional_president_signature || ASSETS.SIGNATURE_CHIAMBIRO} 
                    alt="Regional President Signature" 
                    className="max-h-10 sm:max-h-12 max-w-full object-contain mix-blend-multiply"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <svg className="w-24 sm:w-28 h-8 text-indigo-950" viewBox="0 0 160 50">
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
              <div className="w-28 sm:w-36 border-t border-slate-700/50 pt-1">
                <p className="text-[11px] sm:text-xs font-bold text-slate-900 leading-tight">{data.regional_president_name || 'Ms. A.M. Chiambiro'}</p>
                <p className="text-[8px] sm:text-[9px] text-slate-500 leading-tight">
                  {data.regional_president_title || 'Regional President, YARA'}
                </p>
              </div>
            </div>
          </div>

          {/* Minimal Footnote */}
          <div className="text-center pt-1 flex items-center justify-between text-[8px] text-slate-400 font-mono px-2">
            <span>YARA Credential ID: <strong className="text-slate-700">{data.certificate_number}</strong></span>
            <span>Issued: {data.issue_date}</span>
            <span>yara.org/verify</span>
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

