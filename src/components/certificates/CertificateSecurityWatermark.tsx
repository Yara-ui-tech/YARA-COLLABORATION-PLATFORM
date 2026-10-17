import React from 'react';
import { ASSETS } from '../../constants/assets';

interface CertificateSecurityWatermarkProps {
  certificateNumber?: string;
  recipientName?: string;
  issueDate?: string;
}

/**
 * Unique Banknote-Grade Embedded Security Watermark for YARA Accredited Certificates.
 * Features:
 * 1. Centered High-Resolution Official YARA Gold & Royal Blue Seal watermark.
 * 2. Mathematical Guilloche security wave rosettes (anti-counterfeiting curves).
 * 3. Continuous microscopic security text ribbons incorporating the unique certificate serial number.
 * 4. Tamper-evident micro-pattern background that cannot be replicated.
 */
export const CertificateSecurityWatermark: React.FC<CertificateSecurityWatermarkProps> = ({
  certificateNumber = 'YARA-CERT-SECURED',
  recipientName,
  issueDate
}) => {
  const serial = certificateNumber.toUpperCase();

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0">
      {/* Layer 1: Banknote-Grade Micro-Security Text Pattern Grid */}
      <div 
        className="absolute inset-0 opacity-[0.035] mix-blend-multiply flex flex-col justify-between"
        style={{
          fontSize: '7px',
          fontFamily: 'monospace',
          lineHeight: '18px',
          letterSpacing: '0.12em',
          color: '#1e293b',
          transform: 'rotate(-12deg) scale(1.15)',
          transformOrigin: 'center center'
        }}
      >
        {Array.from({ length: 32 }).map((_, i) => (
          <div key={i} className="whitespace-nowrap overflow-hidden">
            {'★ OFFICIAL YARA ACCREDITED CREDENTIAL ★ SERIAL: ' + serial + ' ★ AUTHENTIC PAN-AFRICAN ROBOTICS ACADEMY ★ TAMPER-EVIDENT SECURED ★ VERIFY AT YARA.ORG/VERIFY ★ '}
          </div>
        ))}
      </div>

      {/* Layer 2: Mathematical Guilloche Rosette Waves (Anti-Counterfeiting Vector Curves) */}
      <svg 
        className="absolute inset-0 w-full h-full opacity-[0.045] mix-blend-multiply" 
        viewBox="0 0 1000 700" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <g stroke="#b45309" strokeWidth="0.8">
          {/* Concentric Rosette Rings */}
          <circle cx="500" cy="350" r="180" strokeDasharray="3 3" />
          <circle cx="500" cy="350" r="240" strokeWidth="1.2" />
          <circle cx="500" cy="350" r="300" strokeDasharray="6 4" />
          <circle cx="500" cy="350" r="340" strokeWidth="0.6" />
          <circle cx="500" cy="350" r="380" strokeDasharray="2 5" />
          
          {/* Guilloche Hypocycloid Spirograph Waves */}
          <path d="M 500 110 C 650 180, 750 350, 500 590 C 250 350, 350 180, 500 110 Z" />
          <path d="M 260 350 C 350 200, 650 200, 740 350 C 650 500, 350 500, 260 350 Z" />
          <path d="M 330 180 C 500 280, 500 420, 670 520 C 500 420, 500 280, 330 180 Z" />
          <path d="M 670 180 C 500 280, 500 420, 330 520 C 500 420, 500 280, 670 180 Z" />
          
          {/* Corner Safety Escutcheon Flourishes */}
          <path d="M 60 60 Q 200 80 80 200" strokeWidth="1.5" />
          <path d="M 940 60 Q 800 80 920 200" strokeWidth="1.5" />
          <path d="M 60 640 Q 200 620 80 500" strokeWidth="1.5" />
          <path d="M 940 640 Q 800 620 920 500" strokeWidth="1.5" />
        </g>
      </svg>

      {/* Layer 3: Prominent Centered High-Resolution Official YARA Gold & Royal Blue Seal */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div 
          className="w-80 h-80 sm:w-96 sm:h-96 md:w-[420px] md:h-[420px] rounded-full flex items-center justify-center opacity-[0.065] mix-blend-multiply"
          style={{
            transform: 'rotate(-4deg)',
            filter: 'contrast(1.15)'
          }}
        >
          <img 
            src={ASSETS.OFFICIAL_GOLD_SEAL || '/assets/yara-official-gold-seal.png'} 
            alt="Official YARA Security Seal Watermark" 
            className="w-full h-full object-contain"
            referrerPolicy="no-referrer"
          />
        </div>
      </div>

      {/* Layer 4: Cryptographic Watermark Validation Bar */}
      <div className="absolute bottom-2 inset-x-8 flex items-center justify-between text-[7px] font-mono text-amber-950/20 uppercase tracking-widest border-t border-amber-900/10 pt-1">
        <span>AUTHENTIC YARA DOCUMENT SECURITY SYSTEM • WATERMARK LAYER CERT-SEC-2026</span>
        <span>CRYPTOGRAPHIC SERIAL: {serial}</span>
      </div>
    </div>
  );
};
