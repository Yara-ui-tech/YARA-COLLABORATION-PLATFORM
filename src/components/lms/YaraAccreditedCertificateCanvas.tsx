import React from 'react';
import { ASSETS } from '../../constants/assets';
import { Award, ShieldCheck, Code, GraduationCap, Cpu, CheckCircle, Building2 } from 'lucide-react';
import { useQrCode } from '../../utils/qrCodeHelper';

export type CertificateType = 'robotics' | 'programming' | 'educator';
export type RoboticsLevel = 1 | 2 | 3 | 4;

export interface YaraCertificateData {
  certificateNumber: string;
  studentName: string;
  courseTitle: string;
  certificateType: CertificateType;
  roboticsLevel?: RoboticsLevel;
  issueDate: string;
  verificationUrl: string;
  directorName?: string;
  directorTitle?: string;
  organizationName?: string;
  citationText?: string;
  grade?: string;
  score?: number;
  skillsAcquired?: string[];
  signatureUrl?: string;
  coSignerName?: string;
  coSignerTitle?: string;
  coSignerSignatureUrl?: string;

  // Corporate Brand & Logo
  logoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;

  // Official Seal Configuration
  sealEnabled?: boolean;
  sealType?: 'gold_embossed' | 'royal_navy' | 'gold_ribbon' | 'emerald_verified';
  sealLabel?: string;
  sealEmblemText?: string;

  // Background Pattern & Watermark
  bgPattern?: 'guilloche' | 'circuit' | 'crest_waves' | 'minimal';
  watermarkEnabled?: boolean;
  watermarkText?: string;
  watermarkOpacity?: number;

  // Partner Training & Co-Branding
  hasPartner?: boolean;
  partnerName?: string;
  partnerLogoUrl?: string;
  partnerBadgeLabel?: string;
  partnerSignerName?: string;
  partnerSignerTitle?: string;
  partnerSignatureUrl?: string;
}

interface Props {
  data: YaraCertificateData;
  className?: string;
  innerRef?: React.RefObject<HTMLDivElement | null>;
}

export const ROBOTICS_LEVEL_CONFIG: Record<RoboticsLevel, {
  tag: string;
  title: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  defaultCitation: string;
}> = {
  1: {
    tag: 'LEVEL 1 — ABSOLUTE BEGINNER & EXPLORER',
    title: 'Absolute Beginner or Explorer',
    badgeBg: 'bg-amber-50',
    badgeText: 'text-amber-900',
    badgeBorder: 'border-amber-300',
    defaultCitation: 'For successfully mastering the foundations of electronics, Ohm’s law, breadboarding, sensor mechanics, and visual logic programming in'
  },
  2: {
    tag: 'LEVEL 2 — INTERMEDIATE LEARNER',
    title: 'Intermediate Learner',
    badgeBg: 'bg-amber-50',
    badgeText: 'text-amber-900',
    badgeBorder: 'border-amber-300',
    defaultCitation: 'For successfully completing embedded C++ firmware engineering, Arduino/ESP32 microcontroller interfacing, PWM motor drivers, and mobile chassis assembly in'
  },
  3: {
    tag: 'LEVEL 3 — ADVANCED LEARNER',
    title: 'Advanced Learner',
    badgeBg: 'bg-amber-50',
    badgeText: 'text-amber-900',
    badgeBorder: 'border-amber-300',
    defaultCitation: 'For demonstrating verified proficiency in autonomous mobile robotics, PID control algorithms, telemetry streaming, line tracking, and edge AI computer vision in'
  },
  4: {
    tag: 'LEVEL 4 — ROBOTICS MASTERCLASS FOR REAL WORLD APPLICATIONS AND DEPLOYMENT',
    title: 'Robotics Masterclass for Real World Applications and Deployment',
    badgeBg: 'bg-amber-50',
    badgeText: 'text-amber-900',
    badgeBorder: 'border-amber-300',
    defaultCitation: 'For successfully completing advanced applied engineering research, 21-point technical documentation, industrial automation prototyping, and defended real-world capstone deployment in'
  }
};

export const YaraAccreditedCertificateCanvas: React.FC<Props> = ({
  data,
  className = '',
  innerRef
}) => {
  const {
    certificateNumber,
    studentName,
    courseTitle,
    certificateType = 'robotics',
    roboticsLevel = 1,
    issueDate,
    verificationUrl,
    directorName = 'Mr. S.O. Manongwa',
    directorTitle = 'Founder & Lead Instructor, YARA',
    organizationName = 'YARA ACADEMY OF ADVANCED ROBOTICS & AI',
    signatureUrl = ASSETS.SIGNATURE_MANONGWA,
    coSignerName = 'Ms. A.M. Chiambiro',
    coSignerTitle = 'Regional President, YARA Zimbabwe',
    coSignerSignatureUrl = ASSETS.SIGNATURE_CHIAMBIRO,
    
    // Corporate Brand
    logoUrl = ASSETS.LOGO,

    // Seal
    sealEnabled = true,

    // Background & Watermark
    bgPattern = 'guilloche',
    watermarkEnabled = true,
    watermarkText = 'YARA',
    watermarkOpacity = 0.04,

    // Partners
    hasPartner = false,
    partnerName,
    partnerLogoUrl,
    partnerBadgeLabel = 'In Collaboration With',
    partnerSignerName,
    partnerSignerTitle,
    partnerSignatureUrl
  } = data;

  const isRobotics = certificateType === 'robotics';
  const isProgramming = certificateType === 'programming';
  const isEducator = certificateType === 'educator';

  const roboticsConfig = ROBOTICS_LEVEL_CONFIG[roboticsLevel] || ROBOTICS_LEVEL_CONFIG[1];

  let certificateCategoryLabel = 'PROFESSIONAL CREDENTIAL';
  let citation = data.citationText;

  if (isRobotics) {
    certificateCategoryLabel = roboticsConfig.tag;
    if (!citation) {
      citation = `${roboticsConfig.defaultCitation} the official YARA Robotics Academy curriculum, demonstrating verified hardware engineering and autonomous programming competence with distinction.`;
    }
  } else if (isProgramming) {
    certificateCategoryLabel = 'PROFESSIONAL SOFTWARE & COMPUTATIONAL ENGINEERING';
    if (!citation) {
      citation = 'For successfully mastering modern software development, data structures, algorithm design, computational thinking, and defended practical software applications in';
    }
  } else if (isEducator) {
    certificateCategoryLabel = 'AI FOR EDUCATORS NATIONAL ACCREDITATION';
    if (!citation) {
      citation = 'For successfully completing comprehensive professional development training in educational artificial intelligence, pedagogy, and classroom curriculum design in';
    }
  } else if (!citation) {
    citation = 'For successfully fulfilling all curriculum requirements, technical assignments, examination benchmarks, and capstone engineering deployment in';
  }

  // Verification URL for QR code
  const targetVerificationUrl = verificationUrl || `https://yara.org/verify-certificate?id=${certificateNumber}`;
  const qrCodeDataUrl = useQrCode(targetVerificationUrl, { width: 180, darkColor: '#0f172a' });

  return (
    <div
      ref={innerRef}
      id="yara-accredited-certificate-canvas"
      className={`relative w-full aspect-[1.414/1] min-h-[580px] sm:min-h-[640px] bg-gradient-to-br from-amber-50/50 via-white to-amber-50/30 rounded-3xl p-6 sm:p-10 md:p-12 shadow-2xl border-[10px] sm:border-[12px] border-double border-amber-600/80 overflow-hidden flex flex-col justify-between select-none font-sans text-slate-900 mx-auto ${className}`}
      style={{
        maxWidth: '960px',
        boxShadow: '0 25px 50px -12px rgba(180, 83, 9, 0.25), inset 0 0 80px rgba(245, 158, 11, 0.05)',
        boxSizing: 'border-box'
      }}
    >
      {/* 1. Background Watermark Pattern (AI for Educators Style) */}
      <div className="absolute inset-0 opacity-[0.035] pointer-events-none flex items-center justify-center">
        <svg viewBox="0 0 500 500" className="w-[85%] h-[85%] text-slate-950 fill-current">
          <circle cx="250" cy="250" r="230" stroke="currentColor" strokeWidth="4" fill="none" strokeDasharray="10, 5" />
          <circle cx="250" cy="250" r="190" stroke="currentColor" strokeWidth="6" fill="none" />
          <polygon points="250,50 300,180 440,180 330,260 370,390 250,310 130,390 170,260 60,180 200,180" fill="currentColor" />
        </svg>
      </div>

      {/* Background Guilloche Wave Accent */}
      {bgPattern === 'guilloche' && (
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.2]"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 880 620"
          preserveAspectRatio="none"
        >
          <g stroke="#d97706" strokeWidth="0.5" fill="none">
            {Array.from({ length: 24 }).map((_, i) => (
              <circle
                key={`guilloche-circle-${i}`}
                cx={440 + Math.sin(i * 0.4) * 60}
                cy={310 + Math.cos(i * 0.4) * 40}
                r={180 + i * 14}
                strokeDasharray={i % 2 === 0 ? '4 3' : undefined}
                opacity={0.25 + (i % 4) * 0.05}
              />
            ))}
          </g>
        </svg>
      )}

      {/* 2. Ornate Amber Corner Accents (Matching AI for Educators) */}
      <div className="absolute top-4 left-4 w-12 sm:w-16 h-12 sm:h-16 border-t-4 border-l-4 border-amber-700 pointer-events-none" />
      <div className="absolute top-4 right-4 w-12 sm:w-16 h-12 sm:h-16 border-t-4 border-r-4 border-amber-700 pointer-events-none" />
      <div className="absolute bottom-4 left-4 w-12 sm:w-16 h-12 sm:h-16 border-b-4 border-l-4 border-amber-700 pointer-events-none" />
      <div className="absolute bottom-4 right-4 w-12 sm:w-16 h-12 sm:h-16 border-b-4 border-r-4 border-amber-700 pointer-events-none" />

      {/* Central Watermark Text */}
      {watermarkEnabled && (
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 select-none overflow-hidden"
          style={{ opacity: watermarkOpacity ?? 0.04 }}
        >
          <div className="font-serif font-black text-[70px] sm:text-[110px] tracking-[0.2em] text-[#0f172a] uppercase rotate-[-15deg] whitespace-nowrap">
            {watermarkText || 'YARA'}
          </div>
        </div>
      )}

      {/* ================= HEADER SECTION ================= */}
      <div className="relative z-10 flex flex-col items-center text-center">
        {/* Brand Header: Logo + Title */}
        <div className="flex flex-wrap items-center justify-center gap-3.5 mb-1.5">
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-white p-1 shadow-md border border-amber-300 flex items-center justify-center overflow-hidden shrink-0">
            <img 
              src={logoUrl || ASSETS.LOGO} 
              alt="YARA Official Logo" 
              className="w-full h-full object-contain rounded-xl"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="text-left">
            <span className="text-sm sm:text-xl font-black tracking-wider text-slate-900 uppercase block">
              {organizationName || 'YARA ACADEMY OF ADVANCED ROBOTICS & AI'}
            </span>
            <p className="text-[9px] sm:text-xs tracking-widest uppercase text-amber-700 font-bold">
              In Collaboration with YARA Zimbabwe • Executive Directorate
            </p>
          </div>

          {/* Optional Partner Logo & Branding */}
          {hasPartner && (partnerName || partnerLogoUrl) && (
            <div className="flex items-center gap-2 ml-auto sm:ml-4 border-l border-amber-300/60 pl-3">
              <div className="flex flex-col items-start">
                <span className="text-[8px] font-black uppercase tracking-wider text-amber-800">
                  {partnerBadgeLabel || 'In Collaboration With'}
                </span>
                {partnerLogoUrl ? (
                  <img
                    src={partnerLogoUrl}
                    alt={partnerName || 'Partner'}
                    className="h-9 sm:h-11 w-auto max-w-[110px] object-contain mt-0.5"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <span className="font-black text-xs text-slate-900 tracking-tight">
                    {partnerName}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Golden Gradient Divider */}
        <div className="w-28 h-0.5 bg-gradient-to-r from-transparent via-amber-500 to-transparent my-1" />

        {/* Certificate Title */}
        <h1 className="text-2xl sm:text-4xl font-serif font-black text-slate-900 tracking-wide mt-1 uppercase">
          Certificate of Completion
        </h1>
        <p className="text-[10px] sm:text-xs font-semibold tracking-widest text-amber-800 uppercase mt-0.5">
          {certificateCategoryLabel}
        </p>
      </div>

      {/* ================= RECIPIENT BODY SECTION ================= */}
      <div className="relative z-10 text-center my-auto py-2">
        <p className="text-xs sm:text-sm text-slate-600 italic">This is to officially certify that</p>
        
        {/* Recipient Full Name in Bold Serif with Amber Underline */}
        <div className="my-1.5 sm:my-2">
          <span className="text-2xl sm:text-4xl lg:text-5xl font-serif font-bold text-slate-900 px-6 py-1 border-b-2 border-amber-600/60 inline-block">
            {studentName || 'Learner Name'}
          </span>
        </div>

        {/* Course / Program Title */}
        <p className="text-xs sm:text-sm font-semibold text-slate-800 mt-1 flex items-center justify-center gap-1.5">
          {isRobotics ? <Cpu className="w-3.5 h-3.5 text-amber-600 shrink-0" /> : isProgramming ? <Code className="w-3.5 h-3.5 text-amber-600 shrink-0" /> : <GraduationCap className="w-3.5 h-3.5 text-amber-600 shrink-0" />}
          <span>Curriculum Track: <strong className="text-slate-900">{courseTitle}</strong></span>
        </p>

        {/* Citation Body Text */}
        <p className="text-[10px] sm:text-xs text-slate-600 max-w-3xl mx-auto mt-2 sm:mt-2.5 leading-relaxed px-4">
          {citation}
        </p>

        {/* Distinction Honors Badge & Skills */}
        <div className="mt-2.5 flex flex-wrap items-center justify-center gap-2">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-100/80 via-amber-200/80 to-amber-100/80 border border-amber-400 px-4 py-1 rounded-full text-xs font-bold text-amber-950 shadow-sm">
            <Award className="w-4 h-4 text-amber-700" />
            <span>
              {data.grade || (data.score ? `Distinction with Honors (${data.score}%)` : 'Certified Graduate (Honors)')}
            </span>
          </div>

          {data.skillsAcquired && data.skillsAcquired.length > 0 && (
            <span className="inline-flex items-center gap-1.5 px-3 py-0.5 bg-indigo-50 border border-indigo-200 rounded-full text-[11px] font-semibold text-indigo-900">
              <CheckCircle className="w-3.5 h-3.5 text-indigo-600" />
              <span>{data.skillsAcquired.slice(0, 3).join(' • ')}</span>
            </span>
          )}
        </div>
      </div>

      {/* ================= SIGNATURES & SEAL & QR CODE FOOTER ================= */}
      <div className="relative z-10 flex flex-col gap-2 pt-3 sm:pt-4 border-t border-amber-600/30">
        <div className="flex flex-row items-end justify-between gap-2 sm:gap-4">
          
          {/* 1. Academic Director / Founder Signature Block */}
          <div className="flex flex-col items-center text-center w-1/3">
            <div className="h-12 sm:h-14 flex items-end justify-center mb-1 w-full max-w-[180px]">
              {signatureUrl ? (
                <img 
                  src={signatureUrl} 
                  alt={directorName} 
                  className="max-h-11 sm:max-h-13 max-w-full object-contain mix-blend-multiply drop-shadow-xs"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <svg className="w-28 sm:w-32 h-9 text-indigo-950" viewBox="0 0 160 50">
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
            <div className="w-32 sm:w-40 border-t border-slate-900/60 pt-1">
              <p className="text-[11px] sm:text-xs font-bold text-slate-900">{directorName}</p>
              <p className="text-[8px] sm:text-[9px] font-semibold text-slate-600 leading-tight truncate">
                {directorTitle}
              </p>
            </div>
          </div>

          {/* 2. Official Gold Seal + Cryptographic Verification QR Code */}
          <div className="flex items-center justify-center gap-2.5 sm:gap-5 shrink-0">
            {/* Official Gold Foil Seal */}
            {sealEnabled && (
              <div className="flex flex-col items-center">
                <div className="relative w-14 h-14 sm:w-20 sm:h-20 flex items-center justify-center">
                  <img 
                    src={ASSETS.EDUCATOR_SEAL} 
                    alt="Official Certified Seal" 
                    className="w-full h-full object-contain drop-shadow-xl select-none pointer-events-none transform transition-transform hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="mt-0.5 text-center">
                  <span className="text-[7px] sm:text-[8px] font-mono text-slate-500 font-semibold block">
                    Issued: {issueDate || 'October 2026'}
                  </span>
                </div>
              </div>
            )}

            {/* Scannable High-DPI Verification QR Code */}
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
                  {certificateNumber}
                </span>
              </div>
            </div>
          </div>

          {/* 3. Lead Instructor / Regional President Signature Block */}
          <div className="flex flex-col items-center text-center w-1/3">
            <div className="h-12 sm:h-14 flex items-end justify-center mb-1 w-full max-w-[180px]">
              {coSignerSignatureUrl ? (
                <img 
                  src={coSignerSignatureUrl} 
                  alt={coSignerName} 
                  className="max-h-11 sm:max-h-13 max-w-full object-contain mix-blend-multiply drop-shadow-xs"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <svg className="w-28 sm:w-32 h-9 text-indigo-950" viewBox="0 0 160 50">
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
            <div className="w-32 sm:w-40 border-t border-slate-900/60 pt-1">
              <p className="text-[11px] sm:text-xs font-bold text-slate-900">{coSignerName}</p>
              <p className="text-[8px] sm:text-[9px] font-semibold text-slate-600 leading-tight truncate">
                {coSignerTitle}
              </p>
            </div>
          </div>

        </div>

        {/* Footnote / Accreditation Note Strip */}
        <div className="text-center pt-1 border-t border-amber-900/10 flex flex-col sm:flex-row items-center justify-between gap-1 text-[7px] sm:text-[8px] text-slate-500 font-medium px-2">
          <span>Official Credential • YARA Academy of Advanced Robotics &amp; AI</span>
          <span className="font-mono text-amber-800 truncate max-w-sm">
            Verify online: {targetVerificationUrl}
          </span>
          <span>Credential ID: <strong className="text-slate-800 font-mono">{certificateNumber}</strong></span>
        </div>

      </div>

    </div>
  );
};
