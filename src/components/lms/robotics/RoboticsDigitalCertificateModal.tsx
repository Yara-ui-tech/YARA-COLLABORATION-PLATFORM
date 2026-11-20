import React, { useRef } from 'react';
import { 
  X, 
  Download, 
  Share2, 
  CheckCircle2, 
  ShieldCheck, 
  ExternalLink,
  Award,
  QrCode
} from 'lucide-react';
import { useQrCode } from '../../../utils/qrCodeHelper';
import { ASSETS } from '../../../constants/assets';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  certificateNumber: string;
  learnerName: string;
  levelTitle: string;
  programmeCompleted: string;
  schoolName?: string;
  issueDate?: string;
  grade?: string;
  duration?: string;
}

export const RoboticsDigitalCertificateModal: React.FC<Props> = ({
  isOpen,
  onClose,
  certificateNumber,
  learnerName,
  levelTitle,
  programmeCompleted,
  schoolName = 'YARA Robotics & Engineering Chapter',
  issueDate = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
  grade = 'Distinction',
  duration = '12 Practical Sessions (24 Hours Laboratory Instruction)'
}) => {
  const certRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const verificationUrl = `${window.location.origin}/verify-certificate?cert=${encodeURIComponent(certificateNumber)}`;
  const qrDataUrl = useQrCode(verificationUrl, { width: 120 });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto flex flex-col">
        {/* Modal Top Bar */}
        <div className="px-6 py-4 bg-[#0A1B4D] text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-[#00C6FF]" />
            <h3 className="text-sm font-bold tracking-wide">
              Official YARA Digital Credential
            </h3>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <Download className="w-3.5 h-3.5" />
              Print / Save PDF
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Certificate Canvas */}
        <div className="p-6 sm:p-10 bg-slate-100 flex items-center justify-center">
          <div 
            ref={certRef}
            className="w-full max-w-3xl bg-white rounded-2xl p-8 sm:p-12 shadow-xl border-8 border-double border-[#0A1B4D] relative overflow-hidden text-center"
          >
            {/* Watermark Crest */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03]">
              <img 
                src={ASSETS.LOGO} 
                alt="YARA Watermark" 
                className="w-96 h-96 object-contain"
              />
            </div>

            {/* Corner Decorative Borders */}
            <div className="absolute top-3 left-3 w-8 h-8 border-t-2 border-l-2 border-[#00C6FF]" />
            <div className="absolute top-3 right-3 w-8 h-8 border-t-2 border-r-2 border-[#00C6FF]" />
            <div className="absolute bottom-3 left-3 w-8 h-8 border-b-2 border-l-2 border-[#00C6FF]" />
            <div className="absolute bottom-3 right-3 w-8 h-8 border-b-2 border-r-2 border-[#00C6FF]" />

            {/* Header / Logo */}
            <div className="flex items-center justify-center gap-4 mb-4">
              <img 
                src={ASSETS.LOGO} 
                alt="YARA Logo" 
                className="w-16 h-16 object-contain"
              />
              <div className="text-left">
                <div className="text-xl font-black text-[#0A1B4D] tracking-wider uppercase">
                  Young Africans Robotics Association
                </div>
                <div className="text-[11px] font-bold text-[#1976D2] uppercase tracking-widest">
                  Robotics & Engineering Academy • Directorate of Academic Standards
                </div>
              </div>
            </div>

            <div className="my-6">
              <div className="inline-block px-4 py-1 rounded-full bg-[#E8F4FF] border border-[#1976D2]/30 text-[#0D47A1] text-xs font-black uppercase tracking-widest mb-3">
                Certificate of Technical Competency
              </div>
              <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold">
                This is officially conferred upon
              </p>
              <h2 className="text-2xl sm:text-3xl font-black text-[#0A1B4D] my-2 font-serif underline decoration-[#00C6FF] decoration-2 underline-offset-8">
                {learnerName}
              </h2>
              <p className="text-xs text-slate-600 font-medium max-w-xl mx-auto mt-3">
                of <span className="font-bold text-slate-800">{schoolName}</span>, who has successfully completed the prescribed coursework, practical laboratory assemblies, and assessment gates for
              </p>
              <h3 className="text-lg sm:text-xl font-extrabold text-[#0D47A1] mt-2 mb-1">
                {levelTitle}
              </h3>
              <p className="text-xs text-slate-500 font-semibold">
                Programme: {programmeCompleted} • Awarded with <strong className="text-emerald-700">{grade}</strong>
              </p>
            </div>

            {/* Details Footer Grid */}
            <div className="pt-6 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-6 items-end mt-8">
              {/* QR Code */}
              <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
                <div className="p-1 bg-white rounded-lg border border-slate-200 shadow-sm inline-block">
                  <img src={qrDataUrl} alt="Verification QR Code" className="w-16 h-16 object-contain" />
                </div>
                <span className="text-[10px] font-mono text-slate-500 mt-1 font-bold">
                  {certificateNumber}
                </span>
                <span className="text-[9px] text-slate-400">
                  Scan to verify online authenticity
                </span>
              </div>

              {/* Dates & Verification */}
              <div className="text-center">
                <div className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 mb-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Verified Credential
                </div>
                <p className="text-[11px] text-slate-500">
                  Issue Date: <strong className="text-slate-700">{issueDate}</strong>
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Duration: {duration}
                </p>
              </div>

              {/* Signature */}
              <div className="text-center sm:text-right">
                <div className="font-serif italic text-lg font-bold text-[#0A1B4D] border-b border-slate-300 pb-1 inline-block min-w-[140px]">
                  Simbarashe Manongwa
                </div>
                <div className="text-[11px] font-bold text-slate-700 mt-1">
                  Technical Director & President
                </div>
                <div className="text-[9px] text-slate-400 uppercase tracking-wider">
                  Young Africans Robotics Association
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Bottom Action Bar */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="text-slate-500 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              Permanent Record registered in YARA Digital Registry under #{certificateNumber}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={verificationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-xl bg-[#0D47A1] text-white font-bold hover:bg-[#0A1B4D] transition flex items-center gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Open Verification Page
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

