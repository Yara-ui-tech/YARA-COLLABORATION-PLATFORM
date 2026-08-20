import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Search, Award, CheckCircle2, XCircle, QrCode, Printer, FileText } from 'lucide-react';
import { verifyCertificateById } from '../../services/competitionEcosystemService';
import { DigitalCertificate } from '../../types/competitionEcosystem';
import DigitalCertificateModal from '../../components/competition/DigitalCertificateModal';

export default function CertificateVerification() {
  const [query, setQuery] = useState('YARA-CERT-2026-004821');
  const [result, setResult] = useState<DigitalCertificate | null>(null);
  const [searched, setSearched] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    const cert = await verifyCertificateById(query.trim());
    setResult(cert);
    setSearched(true);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-16">
      {/* Header */}
      <div className="text-center space-y-3 pt-4">
        <div className="w-14 h-14 bg-indigo-600 rounded-3xl flex items-center justify-center text-white mx-auto shadow-xl shadow-indigo-200">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Official Certificate Verification Portal
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto">
          Verify authentic certificates, medals, and credentials awarded by the Young Africans Robotics Association (YARA).
        </p>
      </div>

      {/* Search Input Box */}
      <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-md">
        <form onSubmit={handleVerify} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. YARA-CERT-2026-004821"
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-200 text-xs font-mono font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
            />
          </div>

          <button
            type="submit"
            className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-xs shadow-md transition-transform active:scale-95 whitespace-nowrap"
          >
            Verify Credential
          </button>
        </form>

        <div className="mt-3 flex items-center space-x-2 text-[11px] text-slate-400">
          <span>Sample verification codes:</span>
          <button
            onClick={() => { setQuery('YARA-CERT-2026-004821'); }}
            className="underline text-indigo-600 font-mono"
          >
            YARA-CERT-2026-004821
          </button>
          <span>•</span>
          <button
            onClick={() => { setQuery('YARA-CERT-2026-001094'); }}
            className="underline text-indigo-600 font-mono"
          >
            YARA-CERT-2026-001094
          </button>
        </div>
      </div>

      {/* Verification Result */}
      {searched && (
        <div>
          {result ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 sm:p-8 bg-emerald-50/80 border-2 border-emerald-300 rounded-3xl shadow-sm space-y-6"
            >
              <div className="flex items-center space-x-3 text-emerald-800">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 shrink-0" />
                <div>
                  <h2 className="text-xl font-bold">Authentic & Verified YARA Credential</h2>
                  <p className="text-xs text-emerald-700 font-mono">ID: {result.certificate_id}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-white p-5 rounded-2xl border border-emerald-200">
                <div>
                  <span className="text-slate-400 font-bold block uppercase tracking-wider text-[10px]">Recipient Name</span>
                  <span className="text-base font-bold text-slate-900">{result.recipient_name}</span>
                </div>

                <div>
                  <span className="text-slate-400 font-bold block uppercase tracking-wider text-[10px]">Achievement & Category</span>
                  <span className="text-sm font-semibold text-indigo-700">{result.achievement_title}</span>
                </div>

                <div>
                  <span className="text-slate-400 font-bold block uppercase tracking-wider text-[10px]">Event & Year</span>
                  <span className="text-slate-800 font-semibold">{result.event_name} ({result.edition_year})</span>
                </div>

                <div>
                  <span className="text-slate-400 font-bold block uppercase tracking-wider text-[10px]">Cryptographic Hash</span>
                  <span className="font-mono text-[11px] text-slate-600 font-semibold">{result.qr_code_hash}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-emerald-800 font-medium">
                  Verified against official YARA Registry database
                </span>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs flex items-center space-x-2 shadow-sm"
                >
                  <Award className="w-4 h-4" />
                  <span>View Full Certificate</span>
                </button>
              </div>
            </motion.div>
          ) : (
            <div className="p-8 text-center bg-red-50 border border-red-200 rounded-3xl text-red-800 space-y-2">
              <XCircle className="w-8 h-8 text-red-600 mx-auto" />
              <h3 className="font-bold text-base">Invalid or Unrecognized Certificate ID</h3>
              <p className="text-xs text-red-600 max-w-md mx-auto">
                No active credential was found matching “{query}”. Please double check the ID stamped on the certificate.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Certificate Modal */}
      <DigitalCertificateModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        certificate={result}
      />
    </div>
  );
}
