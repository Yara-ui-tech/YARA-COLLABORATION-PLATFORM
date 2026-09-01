import React from 'react';
import { X, Lock } from 'lucide-react';
import { EducatorCertificateData } from '../../types/eventRegistration';
import EducatorCertificate from './EducatorCertificate';

interface EducatorCertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  certificateData: EducatorCertificateData | null;
  isAdmin?: boolean;
}

export default function EducatorCertificateModal({
  isOpen,
  onClose,
  certificateData,
  isAdmin = false
}: EducatorCertificateModalProps) {
  if (!isOpen || !certificateData) return null;

  const isLocked = certificateData.status === 'locked' && !isAdmin;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/90 backdrop-blur-md p-2 sm:p-4 md:p-6 print:p-0 print:bg-white flex flex-col items-center justify-start min-h-screen">
      <div className="relative w-full max-w-5xl my-auto py-4">
        {/* Modal Top Floating Close Button for Mobile & Desktop */}
        <div className="flex justify-end mb-2 print:hidden">
          <button
            onClick={onClose}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-bold border border-slate-700 transition shadow-lg cursor-pointer"
            title="Close Certificate View"
          >
            <X className="w-4 h-4" />
            <span>Close</span>
          </button>
        </div>

        <EducatorCertificate 
          data={certificateData} 
          onClose={onClose} 
          showPrintActions={true}
          isAdmin={isAdmin}
        />
      </div>
    </div>
  );
}

