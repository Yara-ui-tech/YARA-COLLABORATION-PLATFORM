import React from 'react';
import { X } from 'lucide-react';
import { EducatorCertificateData } from '../../types/eventRegistration';
import EducatorCertificate from './EducatorCertificate';

interface EducatorCertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  certificateData: EducatorCertificateData | null;
}

export default function EducatorCertificateModal({
  isOpen,
  onClose,
  certificateData
}: EducatorCertificateModalProps) {
  if (!isOpen || !certificateData) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 print:p-0 print:bg-white">
      <div className="relative w-full max-w-5xl bg-transparent">
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 p-2 text-slate-400 hover:text-white transition rounded-xl bg-slate-900/60 border border-slate-800 print:hidden"
          title="Close Certificate"
        >
          <X className="w-6 h-6" />
        </button>

        <EducatorCertificate 
          data={certificateData} 
          onClose={onClose} 
          showPrintActions={true} 
        />
      </div>
    </div>
  );
}
