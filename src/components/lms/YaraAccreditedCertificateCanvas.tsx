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
    badgeBg: 'bg-indigo-50',
    badgeText: 'text-indigo-900',
    badgeBorder: 'border-indigo-200',
    defaultCitation: 'For successfully mastering electronics fundamentals, circuit prototyping, and visual robotics programming in'
  },
  2: {
    tag: 'LEVEL 2 — INTERMEDIATE LEARNER',
    title: 'Intermediate Learner',
    badgeBg: 'bg-indigo-50',
    badgeText: 'text-indigo-900',
    badgeBorder: 'border-indigo-200',
    defaultCitation: 'For demonstrated proficiency in embedded C++ engineering, microcontroller interfacing, and mobile robotics in'
  },
  3: {
    tag: 'LEVEL 3 — ADVANCED LEARNER',
    title: 'Advanced Learner',
    badgeBg: 'bg-indigo-50',
    badgeText: 'text-indigo-900',
    badgeBorder: 'border-indigo-200',
    defaultCitation: 'For demonstrated competence in autonomous mobile robotics, PID control algorithms, and edge telemetry in'
  },
  4: {
    tag: 'LEVEL 4 — MASTERCLASS & DEPLOYMENT',
    title: 'Masterclass for Real World Applications',
    badgeBg: 'bg-indigo-50',
    badgeText: 'text-indigo-900',
    badgeBorder: 'border-indigo-200',
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
    partnerLogoUrl
  } = data;

  const isRobotics = certificateType === 'robotics';
  const isProgramming = certificateType === 'programming';

  const roboticsConfig = ROBOTICS_LEVEL_CONFIG[roboticsLevel] || ROBOTICS_LEVEL_CONFIG[1];

  let certificateCategoryLabel = 'PROFESSIONAL CREDENTIAL';

  if (isRobotics) {
    certificateCategoryLabel = roboticsConfig.tag;
  } else if (isProgramming) {
    certificateCategoryLabel = 'SOFTWARE & COMPUTATIONAL ENGINEERING';
  } else {
    certificateCategoryLabel = 'AI FOR EDUCATORS NATIONAL ACCREDITATION';
  }

  const targetVerificationUrl = verificationUrl || `https://yara.org/verify-certificate?id=${certificateNumber}`;
  const qrCodeDataUrl = useQrCode(targetVerificationUrl, { width: 140, darkColor: '#0f172a' });

  return (
    <div
      ref={innerRef}
      id="yara-accredited-certificate-canvas"
      className={`relative w-full aspect-[1.414/1] min-h-[520px] sm:min-h-[580px] bg-white rounded-2xl p-8 sm:p-12 shadow-xl border border-slate-200 overflow-hidden flex flex-col justify-between select-none font-sans text-slate-900 mx-auto ${className}`}
      style={{
        maxWidth: '920px',
        boxSizing: 'border-box'
      }}
    >
      {/* Subtle Inset Border */}
      <div className="absolute inset-3 sm:inset-4 rounded-xl border border-slate-200 pointer-events-none" />

      {/* Modern Minimal Watermark */}
      <CertificateSecurityWatermark
        certificateNumber={certificateNumber}
        recipientName={studentName}
        issueDate={issueDate}
      />

      {/* ================= HEADER ================= */}
      <div className="relative z-10 flex flex-col items-center text-center">
        {/* Brand Header */}
        <div className="flex items-center justify-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-slate-50 p-1.5 border border-slate-200 flex items-center justify-center overflow-hidden shrink-0 shadow-xs">
            <img 
              src={logoUrl || ASSETS.LOGO} 
              alt="YARA" 
              className="w-full h-full object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="text-left">
            <span className="text-xs sm:text-sm font-black tracking-[0.18em] text-slate-900 uppercase block">
              {organizationName}
            </span>
            <p className="text-[10px] tracking-wider uppercase text-indigo-600 font-bold">
              Academy of Advanced Robotics &amp; AI
            </p>
          </div>

          {/* Optional Partner */}
          {hasPartner && (partnerName || partnerLogoUrl) && (
            <div className="flex items-center gap-2 ml-3 border-l border-slate-200 pl-3">
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
        <h1 className="text-2xl sm:text-4xl font-black text-slate-950 uppercase tracking-tight mt-2">
          Certificate of Completion
        </h1>
        <p className="text-xs font-semibold tracking-wider text-slate-500 uppercase mt-0.5">
          {certificateCategoryLabel}
        </p>
      </div>

      {/* ================= RECIPIENT BODY ================= */}
      <div className="relative z-10 text-center my-auto py-4">
        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-400 mb-2">
          Awarded To
        </p>
        
        {/* Recipient Full Name */}
        <h2 className="text-3xl sm:text-5xl font-black text-slate-950 tracking-tight px-4 leading-tight">
          {studentName || 'Learner Name'}
        </h2>

        {/* Track Title */}
        <p className="text-xs sm:text-sm font-semibold text-slate-700 mt-2 flex items-center justify-center gap-1.5">
          {isRobotics ? <Cpu className="w-4 h-4 text-indigo-600 shrink-0" /> : <Code className="w-4 h-4 text-indigo-600 shrink-0" />}
          <span>Curriculum Track: <strong className="text-slate-900">{courseTitle}</strong></span>
        </p>

        {/* Honors Badge */}
        <div className="mt-3 inline-flex items-center gap-2 px-4 py-1.5 bg-slate-900 text-white rounded-full text-xs font-bold shadow-sm">
          <Award className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            {data.grade || (data.score ? `Distinction (${data.score}%)` : 'Graduated with Distinction')}
          </span>
        </div>
      </div>

      {/* ================= FOOTER ================= */}
      <div className="relative z-10 pt-4 border-t border-slate-200">
        <div className="flex flex-row items-end justify-between gap-4">
          
          {/* Executive Director Signature */}
          <div className="flex flex-col items-center text-center w-1/3">
            <div className="h-10 sm:h-12 flex items-end justify-center mb-1 w-full max-w-[140px]">
              {signatureUrl ? (
                <img 
                  src={signatureUrl} 
                  alt={directorName} 
                  className="max-h-9 sm:max-h-11 max-w-full object-contain"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="text-xs font-serif italic text-slate-600">{directorName}</div>
              )}
            </div>
            <div className="w-28 sm:w-36 border-t border-slate-300 pt-1">
              <p className="text-xs font-bold text-slate-900 leading-tight">{directorName}</p>
              <p className="text-[9px] text-slate-500 font-medium">{directorTitle}</p>
            </div>
          </div>

          {/* Official Gold Seal */}
          <div className="flex items-center justify-center shrink-0">
            {sealEnabled && (
              <div className="w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center">
                <img 
                  src={ASSETS.OFFICIAL_GOLD_SEAL || ASSETS.EDUCATOR_SEAL} 
                  alt="Official YARA Seal" 
                  className="w-full h-full object-contain drop-shadow-xs"
                  referrerPolicy="no-referrer"
                />
              </div>
            )}
          </div>

          {/* QR Code Verification */}
          <div className="flex items-center justify-end w-1/3">
            <div className="flex items-center gap-2 p-1.5 bg-slate-50 border border-slate-200 rounded-xl">
              <img 
                src={qrCodeDataUrl} 
                alt="QR Verification" 
                className="w-10 h-10 sm:w-11 sm:h-11 object-contain rounded"
              />
              <div className="text-left pr-1 hidden sm:block">
                <span className="text-[8px] font-mono font-bold text-indigo-600 block uppercase tracking-wider">
                  Verify
                </span>
                <span className="text-[8px] font-mono text-slate-500 block truncate max-w-[90px]">
                  {certificateNumber}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Minimal Footnote */}
        <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[9px] text-slate-400 font-mono px-1">
          <span>Certificate ID: <strong className="text-slate-700">{certificateNumber}</strong></span>
          <span>Issued: {issueDate}</span>
          <span>yara.org/verify</span>
        </div>
      </div>
    </div>
  );
};
