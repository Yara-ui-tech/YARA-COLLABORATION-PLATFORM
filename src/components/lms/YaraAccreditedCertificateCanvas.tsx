import React from 'react';
import { ASSETS } from '../../constants/assets';
import { Award, Cpu, Code, GraduationCap } from 'lucide-react';
import { useQrCode } from '../../utils/qrCodeHelper';
import { CertificateSecurityWatermark } from '../certificates/CertificateSecurityWatermark';

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
    tag: 'LEVEL 1 — BEGINNER & EXPLORER',
    title: 'Beginner & Explorer',
    badgeBg: 'bg-amber-50',
    badgeText: 'text-amber-900',
    badgeBorder: 'border-amber-300',
    defaultCitation: 'For successfully mastering electronics fundamentals, circuit prototyping, and visual robotics programming in'
  },
  2: {
    tag: 'LEVEL 2 — INTERMEDIATE LEARNER',
    title: 'Intermediate Learner',
    badgeBg: 'bg-amber-50',
    badgeText: 'text-amber-900',
    badgeBorder: 'border-amber-300',
    defaultCitation: 'For demonstrated proficiency in embedded C++ engineering, microcontroller interfacing, and mobile robotics in'
  },
  3: {
    tag: 'LEVEL 3 — ADVANCED LEARNER',
    title: 'Advanced Learner',
    badgeBg: 'bg-amber-50',
    badgeText: 'text-amber-900',
    badgeBorder: 'border-amber-300',
    defaultCitation: 'For demonstrated competence in autonomous mobile robotics, PID control algorithms, and edge telemetry in'
  },
  4: {
    tag: 'LEVEL 4 — MASTERCLASS & DEPLOYMENT',
    title: 'Masterclass for Real World Applications',
    badgeBg: 'bg-amber-50',
    badgeText: 'text-amber-900',
    badgeBorder: 'border-amber-300',
    defaultCitation: 'For demonstrated mastery in applied robotics engineering, automation prototyping, and defended capstone deployment in'
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
    directorTitle = 'Founder & Executive Director',
    organizationName = 'YOUNG AFRICANS ROBOTICS ASSOCIATION',
    signatureUrl = ASSETS.SIGNATURE_MANONGWA,
    coSignerName = 'Ms. A.M. Chiambiro',
    coSignerTitle = 'Regional President, YARA',
    coSignerSignatureUrl = ASSETS.SIGNATURE_CHIAMBIRO,
    logoUrl = ASSETS.LOGO,
    sealEnabled = true,
    hasPartner = false,
    partnerName,
    partnerLogoUrl,
    partnerBadgeLabel = 'In Collaboration With'
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
      citation = `${roboticsConfig.defaultCitation} the official YARA Robotics Academy curriculum with distinguished performance.`;
    }
  } else if (isProgramming) {
    certificateCategoryLabel = 'SOFTWARE & COMPUTATIONAL ENGINEERING';
    if (!citation) {
      citation = 'For successfully mastering modern software development, data structures, and practical software engineering with distinction.';
    }
  } else if (isEducator) {
    certificateCategoryLabel = 'AI FOR EDUCATORS NATIONAL ACCREDITATION';
    if (!citation) {
      citation = 'For successfully completing comprehensive professional development in educational artificial intelligence, pedagogy, and curriculum integration.';
    }
  } else if (!citation) {
    citation = 'For successfully fulfilling all curriculum requirements, technical benchmarks, and practical capstone defense with distinction.';
  }

  const targetVerificationUrl = verificationUrl || `https://yara.org/verify-certificate?id=${certificateNumber}`;
  const qrCodeDataUrl = useQrCode(targetVerificationUrl, { width: 140, darkColor: '#0f172a' });

  return (
    <div
      ref={innerRef}
      id="yara-accredited-certificate-canvas"
      className={`relative w-full aspect-[1.414/1] min-h-[540px] sm:min-h-[600px] bg-gradient-to-br from-[#fffdfa] via-white to-[#faf6ef] rounded-2xl p-6 sm:p-10 md:p-12 shadow-xl border-2 border-amber-600/40 overflow-hidden flex flex-col justify-between select-none font-sans text-slate-900 mx-auto ${className}`}
      style={{
        maxWidth: '940px',
        boxSizing: 'border-box'
      }}
    >
      {/* Inner Elegant Border */}
      <div className="absolute inset-3 sm:inset-4 rounded-xl border border-amber-600/25 pointer-events-none" />

      {/* Unique Banknote-Grade Embedded Security Watermark with Guilloche waves and micro-text */}
      <CertificateSecurityWatermark
        certificateNumber={certificateNumber}
        recipientName={studentName}
        issueDate={issueDate}
      />

      {/* Elegant Corner Accents */}
      <div className="absolute top-5 left-5 w-8 h-8 border-t-2 border-l-2 border-amber-600/70 pointer-events-none" />
      <div className="absolute top-5 right-5 w-8 h-8 border-t-2 border-r-2 border-amber-600/70 pointer-events-none" />
      <div className="absolute bottom-5 left-5 w-8 h-8 border-b-2 border-l-2 border-amber-600/70 pointer-events-none" />
      <div className="absolute bottom-5 right-5 w-8 h-8 border-b-2 border-r-2 border-amber-600/70 pointer-events-none" />

      {/* ================= HEADER ================= */}
      <div className="relative z-10 flex flex-col items-center text-center">
        {/* Brand Header */}
        <div className="flex items-center justify-center gap-3 mb-1">
          <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-xl bg-white p-1 shadow-xs border border-amber-200/80 flex items-center justify-center overflow-hidden shrink-0">
            <img 
              src={logoUrl || ASSETS.LOGO} 
              alt="YARA" 
              className="w-full h-full object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="text-left">
            <span className="text-xs sm:text-sm font-bold tracking-[0.2em] text-slate-800 uppercase block">
              {organizationName}
            </span>
            <p className="text-[9px] sm:text-[10px] tracking-wider uppercase text-amber-700 font-semibold">
              Academy of Advanced Robotics &amp; AI
            </p>
          </div>

          {/* Optional Partner */}
          {hasPartner && (partnerName || partnerLogoUrl) && (
            <div className="flex items-center gap-2 ml-3 border-l border-amber-300/60 pl-3">
              {partnerLogoUrl ? (
                <img
                  src={partnerLogoUrl}
                  alt={partnerName || 'Partner'}
                  className="h-8 w-auto max-w-[90px] object-contain"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <span className="font-bold text-xs text-slate-800">
                  {partnerName}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Certificate Title */}
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif font-black text-slate-900 tracking-wide mt-2 uppercase">
          Certificate of Completion
        </h1>
        <p className="text-[10px] sm:text-xs font-semibold tracking-widest text-amber-800 uppercase mt-0.5">
          {certificateCategoryLabel}
        </p>
      </div>

      {/* ================= RECIPIENT BODY ================= */}
      <div className="relative z-10 text-center my-auto py-2">
        <p className="text-xs text-slate-500 italic">This is to officially certify that</p>
        
        {/* Recipient Full Name */}
        <div className="my-1.5 sm:my-2">
          <span className="text-2xl sm:text-4xl lg:text-5xl font-serif font-bold text-slate-900 px-6 py-0.5 border-b border-amber-500/50 inline-block">
            {studentName || 'Learner Name'}
          </span>
        </div>

        {/* Track Title */}
        <p className="text-xs sm:text-sm font-semibold text-slate-800 mt-1 flex items-center justify-center gap-1.5">
          {isRobotics ? <Cpu className="w-3.5 h-3.5 text-amber-600 shrink-0" /> : isProgramming ? <Code className="w-3.5 h-3.5 text-amber-600 shrink-0" /> : <GraduationCap className="w-3.5 h-3.5 text-amber-600 shrink-0" />}
          <span>Curriculum Track: <strong className="text-slate-900">{courseTitle}</strong></span>
        </p>

        {/* Clean Citation Text */}
        <p className="text-[11px] sm:text-xs text-slate-600 max-w-2xl mx-auto mt-2 leading-relaxed px-4">
          {citation}
        </p>

        {/* Single Refined Honors Pill */}
        <div className="mt-2.5 inline-flex items-center gap-1.5 px-3.5 py-0.5 bg-amber-50 border border-amber-300 rounded-full text-xs font-bold text-amber-950 shadow-xs">
          <Award className="w-3.5 h-3.5 text-amber-600" />
          <span>
            {data.grade || (data.score ? `Distinction (${data.score}%)` : 'Graduated with Distinction')}
          </span>
        </div>
      </div>

      {/* ================= FOOTER ================= */}
      <div className="relative z-10 flex flex-col gap-2 pt-3 border-t border-amber-600/20">
        <div className="flex flex-row items-end justify-between gap-3">
          
          {/* Founder Signature */}
          <div className="flex flex-col items-center text-center w-1/3">
            <div className="h-11 sm:h-13 flex items-end justify-center mb-1 w-full max-w-[160px]">
              {signatureUrl ? (
                <img 
                  src={signatureUrl} 
                  alt={directorName} 
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
              <p className="text-[11px] sm:text-xs font-bold text-slate-900 leading-tight">{directorName}</p>
              <p className="text-[8px] sm:text-[9px] text-slate-500 leading-tight">
                {directorTitle}
              </p>
            </div>
          </div>

          {/* Official Gold Seal & QR Code */}
          <div className="flex items-center justify-center gap-3 sm:gap-4 shrink-0 pb-1">
            {sealEnabled && (
              <div className="relative w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center">
                <img 
                  src={ASSETS.OFFICIAL_GOLD_SEAL || ASSETS.EDUCATOR_SEAL} 
                  alt="Official YARA Seal" 
                  className="w-full h-full object-contain select-none pointer-events-none drop-shadow-sm"
                  referrerPolicy="no-referrer"
                />
              </div>
            )}

            <div className="flex items-center gap-1.5 p-1 bg-white border border-amber-300 rounded-lg shadow-xs">
              <img 
                src={qrCodeDataUrl} 
                alt="QR Verification" 
                className="w-10 h-10 sm:w-12 sm:h-12 object-contain rounded"
              />
              <div className="text-left pr-1">
                <span className="text-[7px] font-mono text-amber-800 font-bold block uppercase tracking-wide">
                  Verify
                </span>
                <span className="text-[7px] font-mono text-slate-500 block">
                  {certificateNumber}
                </span>
              </div>
            </div>
          </div>

          {/* Co-Signer Signature */}
          <div className="flex flex-col items-center text-center w-1/3">
            <div className="h-11 sm:h-13 flex items-end justify-center mb-1 w-full max-w-[160px]">
              {coSignerSignatureUrl ? (
                <img 
                  src={coSignerSignatureUrl} 
                  alt={coSignerName} 
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
              <p className="text-[11px] sm:text-xs font-bold text-slate-900 leading-tight">{coSignerName}</p>
              <p className="text-[8px] sm:text-[9px] text-slate-500 leading-tight">
                {coSignerTitle}
              </p>
            </div>
          </div>

        </div>

        {/* Minimal Clean Bottom Strip */}
        <div className="text-center pt-1 flex items-center justify-between text-[8px] text-slate-400 font-mono px-2">
          <span>YARA Credential ID: <strong className="text-slate-700">{certificateNumber}</strong></span>
          <span>Issued: {issueDate || 'October 2026'}</span>
          <span>yara.org/verify</span>
        </div>
      </div>

    </div>
  );
};
