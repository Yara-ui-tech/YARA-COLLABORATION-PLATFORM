import React from 'react';
import { ASSETS } from '../../constants/assets';
import { Award, ShieldCheck, Code, GraduationCap, Cpu, CheckCircle } from 'lucide-react';

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
    badgeBg: 'bg-sky-50',
    badgeText: 'text-sky-800',
    badgeBorder: 'border-sky-300',
    defaultCitation: 'For successfully mastering the foundations of electronics, Ohm’s law, breadboarding, sensor mechanics, and visual logic programming in'
  },
  2: {
    tag: 'LEVEL 2 — INTERMEDIATE LEARNER',
    title: 'Intermediate Learner',
    badgeBg: 'bg-indigo-50',
    badgeText: 'text-indigo-800',
    badgeBorder: 'border-indigo-300',
    defaultCitation: 'For successfully completing embedded C++ firmware engineering, Arduino/ESP32 microcontroller interfacing, PWM motor drivers, and mobile chassis assembly in'
  },
  3: {
    tag: 'LEVEL 3 — ADVANCED LEARNER',
    title: 'Advanced Learner',
    badgeBg: 'bg-purple-50',
    badgeText: 'text-purple-800',
    badgeBorder: 'border-purple-300',
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
    directorName = 'Harish Subramanian',
    directorTitle = 'Academic Director, YARA Learning Academy',
    organizationName = 'YARA Learning Academy',
    signatureUrl = ASSETS.SIGNATURE_MANONGWA,
    coSignerName,
    coSignerTitle,
    coSignerSignatureUrl = ASSETS.SIGNATURE_CHIAMBIRO
  } = data;

  // Type configuration
  const isRobotics = certificateType === 'robotics';
  const isProgramming = certificateType === 'programming';
  const isEducator = certificateType === 'educator';

  // Specific ribbon accent colors
  const chevronColor = isProgramming ? '#10b981' : isEducator ? '#f59e0b' : '#f59e0b';
  const ribbonColor = '#0b4ea2';

  // Subtitle / tag config
  const roboticsConfig = ROBOTICS_LEVEL_CONFIG[roboticsLevel] || ROBOTICS_LEVEL_CONFIG[1];

  let certificateCategoryLabel = 'PROFESSIONAL CREDENTIAL';
  let citation = data.citationText || 'For successfully completing an online course';

  if (isRobotics) {
    certificateCategoryLabel = roboticsConfig.tag;
    if (!data.citationText) {
      citation = roboticsConfig.defaultCitation;
    }
  } else if (isProgramming) {
    certificateCategoryLabel = 'PROFESSIONAL PROGRAMMING CERTIFICATE';
    if (!data.citationText) {
      citation = 'For successfully mastering modern software development, data structures, algorithm design, and computational engineering in';
    }
  } else if (isEducator) {
    certificateCategoryLabel = 'AI FOR EDUCATORS PROFESSIONAL ACCREDITATION';
    if (!data.citationText) {
      citation = 'For successfully completing comprehensive professional development training in educational artificial intelligence, pedagogy, and classroom curriculum design in';
    }
  }

  // QR Code URL: QuickChart / QRServer API with verification URL
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=140x140&margin=0&data=${encodeURIComponent(
    verificationUrl || `https://yara.org/verify-certificate?id=${certificateNumber}`
  )}`;

  return (
    <div
      ref={innerRef}
      id="yara-accredited-certificate-canvas"
      className={`relative bg-white text-slate-900 overflow-hidden shadow-2xl select-none mx-auto ${className}`}
      style={{
        width: '100%',
        maxWidth: '880px',
        aspectRatio: '1.414 / 1', // Standard A4 Landscape ratio
        minHeight: '560px',
        boxSizing: 'border-box'
      }}
    >
      {/* 1. Delicate Guilloche Arc Lines Background (Matching User Image 1) */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 880 620"
        preserveAspectRatio="none"
        style={{ opacity: 0.55 }}
      >
        <g stroke="#93c5fd" strokeWidth="0.5" fill="none">
          {Array.from({ length: 42 }).map((_, i) => {
            const angle = (i * 8.5 * Math.PI) / 180;
            const r = 260 + i * 11;
            const cx = 70 + Math.cos(angle) * 40;
            const cy = 200 + Math.sin(angle) * 35;
            return (
              <circle
                key={`guilloche-1-${i}`}
                cx={cx}
                cy={cy}
                r={r}
                strokeDasharray={i % 3 === 0 ? '4 2' : undefined}
                opacity={0.35 + (i % 5) * 0.08}
              />
            );
          })}
          {Array.from({ length: 28 }).map((_, i) => (
            <path
              key={`spiral-${i}`}
              d={`M -20,${100 + i * 18} Q ${250 + i * 12},${180 + (i % 2 === 0 ? 90 : -60)} ${720 + i * 8},${320 + i * 10}`}
              stroke="#bae6fd"
              strokeWidth="0.45"
              opacity={0.3}
            />
          ))}
        </g>
      </svg>

      {/* 2. Hanging Vertical Royal Blue Ribbon on Right (Signature Feature from User Image 1) */}
      <div
        className="absolute top-0 right-14 sm:right-20 w-20 sm:w-24 pointer-events-none z-10 flex flex-col items-center"
        style={{ filter: 'drop-shadow(0 6px 12px rgba(11, 78, 162, 0.25))' }}
      >
        {/* Ribbon Body */}
        <div
          className="w-full flex flex-col items-center"
          style={{
            height: '350px',
            backgroundColor: ribbonColor
          }}
        >
          {/* Subtle vertical texture line on ribbon */}
          <div className="w-[85%] h-full border-x border-blue-400/20" />
        </div>

        {/* Chevron Inverted-V Tip */}
        <div
          className="w-full"
          style={{
            width: '100%',
            height: '28px',
            backgroundColor: ribbonColor,
            clipPath: 'polygon(0 0, 100% 0, 50% 100%)'
          }}
        />

        {/* Golden Chevron Accent Tip */}
        <div
          className="-mt-3.5"
          style={{
            width: '100%',
            height: '24px',
            backgroundColor: chevronColor,
            clipPath: 'polygon(0 0, 100% 0, 50% 100%)'
          }}
        />

        {/* Circular Verified Certificate Badge Superimposed on Ribbon */}
        <div
          className="absolute top-[170px] flex items-center justify-center pointer-events-auto"
          style={{
            width: '100px',
            height: '100px'
          }}
        >
          {/* Outer circular badge container */}
          <div className="relative w-full h-full rounded-full bg-white border-2 border-[#0b4ea2] flex items-center justify-center shadow-lg p-1">
            {/* Inner dashed ring */}
            <div className="w-full h-full rounded-full border border-dashed border-[#0b4ea2] flex flex-col items-center justify-center relative p-1">
              {/* Circular SVG text: VERIFIED CERTIFICATE */}
              <svg className="absolute inset-0 w-full h-full animate-none" viewBox="0 0 100 100">
                <path
                  id={`seal-curve-top-${certificateNumber}`}
                  d="M 18,50 A 32,32 0 0,1 82,50"
                  fill="none"
                />
                <path
                  id={`seal-curve-bot-${certificateNumber}`}
                  d="M 82,50 A 32,32 0 0,1 18,50"
                  fill="none"
                />
                <text className="text-[7.5px] font-black uppercase fill-[#0b4ea2] tracking-[0.22em]">
                  <textPath href={`#seal-curve-top-${certificateNumber}`} startOffset="50%" textAnchor="middle">
                    ★ VERIFIED ★
                  </textPath>
                </text>
                <text className="text-[7px] font-black uppercase fill-[#0b4ea2] tracking-[0.18em]">
                  <textPath href={`#seal-curve-bot-${certificateNumber}`} startOffset="50%" textAnchor="middle">
                    CERTIFICATE
                  </textPath>
                </text>
              </svg>

              {/* Central Blue Monogram Emblem */}
              <div className="w-10 h-10 rounded-full bg-[#0b4ea2] text-white flex items-center justify-center font-serif font-black text-xl shadow-inner z-10">
                {isRobotics ? (
                  <span className="font-bold text-lg tracking-tighter">Y</span>
                ) : isProgramming ? (
                  <span className="font-mono font-bold text-sm tracking-tighter">&lt;/&gt;</span>
                ) : (
                  <span className="font-bold text-lg tracking-tighter">Y</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Main Certificate Content Container */}
      <div className="relative z-10 h-full flex flex-col justify-between p-8 sm:p-12 pr-28 sm:pr-36">
        {/* Top Header Row: Logo & Category */}
        <div className="flex items-start justify-between">
          {/* YARA Learning Academy Logo (Mimicking Great Learning Clean Standard) */}
          <div className="flex items-center gap-3">
            {/* Geometric Modern YARA Tech Emblem */}
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#0b4ea2] to-[#1e40af] flex items-center justify-center text-white shadow-md shadow-blue-900/20">
              <span className="font-serif font-black text-2xl tracking-tight">Y</span>
            </div>
            <div>
              <div className="font-black text-xl sm:text-2xl text-[#0b4ea2] tracking-tight leading-none">
                YARA
              </div>
              <div className="font-bold text-xs sm:text-sm text-slate-800 tracking-normal leading-tight">
                Learning Academy
              </div>
            </div>
          </div>
        </div>

        {/* Certificate Center Body */}
        <div className="my-auto pt-4 sm:pt-6 space-y-4 max-w-xl text-left">
          {/* Prominent Serif Heading (Exact Great Learning Style) */}
          <div>
            <h1 className="font-serif text-2xl sm:text-4xl font-bold tracking-[0.14em] text-slate-900 uppercase">
              Certificate of Completion
            </h1>

            {/* Distinct Sub-Classification Badge */}
            <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] sm:text-[11px] font-black tracking-wider uppercase bg-blue-50 text-[#0b4ea2] border border-blue-200">
              {isRobotics && <Cpu className="w-3.5 h-3.5" />}
              {isProgramming && <Code className="w-3.5 h-3.5" />}
              {isEducator && <GraduationCap className="w-3.5 h-3.5" />}
              <span>{certificateCategoryLabel}</span>
            </div>
          </div>

          {/* "Presented to" subtitle */}
          <div className="pt-2">
            <span className="text-xs sm:text-sm text-slate-500 font-sans tracking-wide">
              Presented to
            </span>
          </div>

          {/* Recipient Full Legal Name (Royal Blue Serif) */}
          <div className="pb-1">
            <h2 className="font-serif text-2xl sm:text-4xl lg:text-[40px] font-semibold text-[#1d4ed8] tracking-normal leading-tight">
              {studentName || 'Recipient Name'}
            </h2>
          </div>

          {/* Citation Text */}
          <p className="text-xs sm:text-[13px] text-slate-600 font-sans leading-relaxed max-w-lg">
            {citation}
          </p>

          {/* Course / Program Title */}
          <div>
            <h3 className="text-base sm:text-xl font-bold text-slate-950 tracking-tight leading-snug">
              {courseTitle}
            </h3>
          </div>

          {/* Course Completion Date */}
          <div className="pt-0.5">
            <span className="text-xs sm:text-[13px] text-slate-600 font-sans">
              Course completed on {issueDate || 'October 04, 2026'}
            </span>
          </div>
        </div>

        {/* Bottom Section: Signatures (Left) & QR Code (Right) */}
        <div className="pt-6 flex items-end justify-between border-t border-slate-200/80">
          {/* Signatures Container (Academic Director & Co-Signer) */}
          <div className="flex items-end gap-8 sm:gap-12">
            {/* Primary Signer: Academic Director */}
            <div className="flex flex-col items-start">
              {signatureUrl ? (
                <div className="h-10 flex items-end mb-1">
                  <img
                    src={signatureUrl}
                    alt={directorName}
                    className="max-h-9 object-contain"
                  />
                </div>
              ) : (
                <div className="h-10 flex items-end mb-1 font-serif italic text-lg text-slate-800">
                  {directorName}
                </div>
              )}
              <div className="w-44 border-t border-slate-400 pt-1">
                <div className="font-bold text-xs sm:text-sm text-slate-900 leading-tight">
                  {directorName}
                </div>
                <div className="text-[10px] sm:text-[11px] text-slate-500 leading-tight">
                  {directorTitle}
                </div>
              </div>
            </div>

            {/* Optional Co-Signer / Regional President */}
            {coSignerName && (
              <div className="flex flex-col items-start hidden sm:flex">
                {coSignerSignatureUrl ? (
                  <div className="h-10 flex items-end mb-1">
                    <img
                      src={coSignerSignatureUrl}
                      alt={coSignerName}
                      className="max-h-9 object-contain"
                    />
                  </div>
                ) : (
                  <div className="h-10 flex items-end mb-1 font-serif italic text-lg text-slate-800">
                    {coSignerName}
                  </div>
                )}
                <div className="w-44 border-t border-slate-400 pt-1">
                  <div className="font-bold text-xs sm:text-sm text-slate-900 leading-tight">
                    {coSignerName}
                  </div>
                  <div className="text-[10px] sm:text-[11px] text-slate-500 leading-tight">
                    {coSignerTitle || 'President, YARA'}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* QR Code on Bottom Right (Below Ribbon) */}
          <div className="flex flex-col items-end">
            <div className="p-1 bg-white border border-slate-300 rounded shadow-xs">
              <img
                src={qrCodeUrl}
                alt="Certificate Verification QR Code"
                className="w-16 h-16 sm:w-[72px] sm:h-[72px] object-contain"
              />
            </div>
            <span className="text-[8px] font-mono text-slate-500 mt-1 uppercase">
              ID: {certificateNumber}
            </span>
          </div>
        </div>
      </div>

      {/* 4. Dual-Tone Bottom Horizontal Bar & Verification Link (Matching User Image 1) */}
      <div className="absolute bottom-0 left-0 right-0">
        {/* Dual-Tone Horizontal Bar: 82% Deep Blue, 18% Golden Yellow */}
        <div className="w-full h-1.5 flex">
          <div className="h-full bg-[#0b4ea2]" style={{ width: '80%' }} />
          <div className="h-full bg-[#f59e0b]" style={{ width: '20%' }} />
        </div>

        {/* Small Verification Link Right Aligned */}
        <div className="bg-white px-8 sm:px-12 py-1 flex items-center justify-between text-[9px] sm:text-[10px] text-slate-500">
          <span className="font-mono text-slate-400">
            Official Credential • YARA Learning Academy
          </span>
          <span className="truncate">
            To verify this certificate visit{' '}
            <a
              href={verificationUrl || `https://yara.org/verify-certificate?id=${certificateNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#0b4ea2] hover:underline font-mono"
            >
              {verificationUrl || `https://yara.org/verify-certificate?id=${certificateNumber}`}
            </a>
          </span>
        </div>
      </div>
    </div>
  );
};
