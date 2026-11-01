import React from 'react';
import { ASSETS } from '../../constants/assets';

interface CertificateSecurityWatermarkProps {
  certificateNumber?: string;
  recipientName?: string;
  issueDate?: string;
}

/**
 * Clean, modern, professional digital certificate security watermark.
 * Minimalist, elegant, and uncluttered.
 */
export const CertificateSecurityWatermark: React.FC<CertificateSecurityWatermarkProps> = ({
  certificateNumber = 'YARA-CERT-SECURED'
}) => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0">
      {/* Subtle modern geometric accent lines */}
      <svg 
        className="absolute inset-0 w-full h-full opacity-[0.03]" 
        viewBox="0 0 1000 700" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="500" cy="350" r="220" stroke="#0f172a" strokeWidth="1" strokeDasharray="6 6" />
        <circle cx="500" cy="350" r="300" stroke="#0f172a" strokeWidth="0.8" />
      </svg>

      {/* Prominent, clean centered watermark emblem */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-72 h-72 sm:w-80 sm:h-80 opacity-[0.04] mix-blend-multiply flex items-center justify-center">
          <img 
            src={ASSETS.OFFICIAL_GOLD_SEAL || ASSETS.LOGO} 
            alt="YARA Credential Emblem" 
            className="w-full h-full object-contain"
            referrerPolicy="no-referrer"
          />
        </div>
      </div>
    </div>
  );
};
