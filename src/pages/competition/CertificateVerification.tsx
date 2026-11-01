import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Search, Award, CheckCircle2, XCircle, Calendar, ArrowRight } from 'lucide-react';
import { verifyCertificateById } from '../../services/competitionEcosystemService';
import { DigitalCertificate } from '../../types/competitionEcosystem';
import DigitalCertificateModal from '../../components/competition/DigitalCertificateModal';

export default function CertificateVerification() {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<DigitalCertificate | null>(null);
  const [searched, setSearched] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    try {
      const cert = await verifyCertificateById(query.trim());
      setResult(cert);
      setSearched(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-16 font-sans">
      {/* Header */}
      <div className="text-center space-y-3 pt-6">
        <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white mx-auto shadow-lg shadow-indigo-500/20">
          <ShieldCheck className="w-7 h-7" />
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Credential Verification
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
          Verify authentic certificates, medals, and qualifications issued by the Young Africans Robotics Association (YARA).
        </p>
      </div>

      {/* Search Input Box */}
      <div className="p-6 bg-white rounded-3xl border border-slate-200/90 shadow-sm">
        <form onSubmit={handleVerify} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter Credential ID (e.g. YARA-CERT-2026-004821)"
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-200 text-xs font-mono font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="px-7 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold text-xs shadow-md transition active:scale-95 whitespace-nowrap cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Verifying...' : 'Verify Credential'}
          </button>
        </form>

        <div className="mt-3 text-[11px] text-slate-400">
          Enter the official credential ID located at the bottom of your certificate or on the verification QR code.
        </div>
      </div>

      {/* Verification Result */}
      {searched && (
        <div>
          {result ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 sm:p-8 bg-white border border-emerald-200 rounded-3xl shadow-md space-y-6"
            >
              <div className="flex items-center justify-between flex-wrap gap-3 pb-4 border-b border-slate-100">
                <div className="flex items-center space-x-3 text-emerald-800">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-slate-900 tracking-tight">Verified Official Credential</h2>
                    <p className="text-xs text-emerald-700 font-mono font-bold">ID: {result.certificate_id}</p>
                  </div>
                </div>

                <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Official Record
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 font-bold block uppercase tracking-wider text-[10px]">Recipient</span>
                  <span className="text-lg font-black text-slate-900 block mt-0.5">{result.recipient_name}</span>
                  {result.team_name && (
                    <span className="text-slate-500 text-xs block mt-0.5">Team: {result.team_name}</span>
                  )}
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 font-bold block uppercase tracking-wider text-[10px]">Award & Distinction</span>
                  <span className="text-sm font-bold text-indigo-700 block mt-1">{result.achievement_title}</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 font-bold block uppercase tracking-wider text-[10px]">Event / Championship</span>
                  <span className="text-xs font-semibold text-slate-800 block mt-1">{result.event_name} ({result.edition_year})</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 font-bold block uppercase tracking-wider text-[10px]">Issued Date</span>
                  <span className="text-xs font-semibold text-slate-800 block mt-1">{result.issued_date || 'Official Record'}</span>
                </div>
              </div>

              <div className="flex items-center justify-end pt-2">
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs flex items-center space-x-2 shadow-md transition cursor-pointer"
                >
                  <Award className="w-4 h-4" />
                  <span>View Official Certificate</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          ) : (
            <div className="p-8 text-center bg-white border border-rose-200 rounded-3xl shadow-sm space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-2">
                <XCircle className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Unrecognized Credential ID</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                No active credential was found matching “{query}”. Please check the ID printed on the certificate.
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
