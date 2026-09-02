import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  Search, 
  Award, 
  Calendar, 
  User, 
  BookOpen, 
  Sparkles, 
  ArrowLeft,
  Printer,
  Lock,
  AlertTriangle
} from 'lucide-react';
import { getPublicCertificate } from '../services/yaraLmsService';
import { getEducatorCertificateByCodeOrEmail } from '../services/eventRegistrationService';
import { Certificate } from '../types/curriculum';
import { EducatorCertificateData } from '../types/eventRegistration';
import EducatorCertificate from '../components/events/EducatorCertificate';

export default function VerifyCertificate() {
  const [searchParams, setSearchParams] = useSearchParams();
  const certIdFromQuery = searchParams.get('id') || '';

  const [inputCode, setInputCode] = useState(certIdFromQuery);
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [educatorCertificate, setEducatorCertificate] = useState<EducatorCertificateData | null>(null);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (certIdFromQuery) {
      handleVerify(certIdFromQuery);
    }
  }, [certIdFromQuery]);

  const handleVerify = async (codeToVerify: string) => {
    const code = codeToVerify.trim();
    if (!code) return;

    setLoading(true);
    setSearched(true);
    setCertificate(null);
    setEducatorCertificate(null);

    try {
      // 1. Check Educator Certificate first
      const eduCert = await getEducatorCertificateByCodeOrEmail(code);
      if (eduCert) {
        setEducatorCertificate(eduCert);
        setLoading(false);
        return;
      }

      // 2. Check LMS Graduate Certificate
      const found = await getPublicCertificate(code);
      setCertificate(found);
    } catch (e) {
      console.error('Verify error:', e);
      setCertificate(null);
      setEducatorCertificate(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputCode.trim()) {
      setSearchParams({ id: inputCode.trim() });
      handleVerify(inputCode.trim());
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Navigation back */}
        <div className="flex items-center justify-between print:hidden">
          <Link
            to="/learning"
            className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" /> Back to YARA Learning Academy
          </Link>
          <div className="text-[10px] font-black uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            Public Registry
          </div>
        </div>

        {/* Verification Card */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-sm space-y-6 print:border-none print:shadow-none print:p-0">
          <div className="text-center space-y-2 print:hidden">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto text-emerald-600 shadow-xs">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-black text-slate-900">
              YARA Official Certificate Verification
            </h1>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Verify the authenticity and academic standing of certificates issued by the Young Africans Robotics Association.
            </p>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 print:hidden">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Enter Certificate ID (e.g. YARA-CERT-2026-000123 or YARA-AI-EDU-2026-...)"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl transition shadow-md shadow-emerald-600/20 cursor-pointer"
            >
              {loading ? 'Verifying...' : 'Verify Credential'}
            </button>
          </form>

          {/* Verification Results */}
          {searched && (
            <div className="pt-6 border-t border-slate-100">
              {loading ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                  Querying institutional registry and cryptographic database...
                </div>
              ) : educatorCertificate ? (
                /* Educator Certificate View */
                educatorCertificate.status === 'locked' ? (
                  <div className="p-6 rounded-2xl bg-amber-50 border border-amber-300 text-amber-950 flex items-start gap-3.5">
                    <Lock className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-black text-amber-900">
                          Certificate Status: Pending Administrative Approval & Sign-Off
                        </h4>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-200/80 text-amber-900">
                          Not Issued
                        </span>
                      </div>
                      <p className="text-xs text-amber-800 leading-relaxed">
                        A participant registration record for <strong>{educatorCertificate.recipient_name}</strong> was found ({educatorCertificate.certificate_number}), but this certificate has <strong>NOT</strong> been approved and unlocked by an authorized YARA Administrator yet. Unapproved credentials are not valid and cannot be authenticated.
                      </p>
                      <div className="text-[11px] text-amber-700 pt-1 border-t border-amber-200/60 flex flex-wrap gap-4">
                        <span>Institution: <strong>{educatorCertificate.institution_name}</strong></span>
                        <span>Event: <strong>{educatorCertificate.event_title}</strong></span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <EducatorCertificate 
                      data={educatorCertificate} 
                      showPrintActions={true}
                    />
                  </div>
                )
              ) : certificate ? (
                /* Valid Certificate View */
                <div className="space-y-6">
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                      <div>
                        <div className="text-xs font-black text-emerald-900 uppercase tracking-wide">
                          Verification Status: VERIFIED & AUTHENTIC
                        </div>
                        <div className="text-[11px] text-emerald-700 font-medium">
                          This credential is authentic and was officially awarded by the Young Africans Robotics Association.
                        </div>
                      </div>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wider shrink-0">
                      Official Seal
                    </span>
                  </div>

                  {/* Certificate Summary Card */}
                  <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border-2 border-amber-400/40 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl text-center space-y-4">
                    <div className="text-[10px] uppercase tracking-[0.25em] font-black text-amber-400">
                      Young Africans Robotics Association
                    </div>
                    <h3 className="text-2xl font-serif font-black text-white">{certificate.student_name}</h3>
                    <p className="text-xs text-slate-300 max-w-lg mx-auto leading-relaxed">
                      Successfully satisfied all academic, practical hardware labs, and Capstone requirements for:
                    </p>
                    <div className="text-sm font-bold text-amber-300">{certificate.course_title}</div>

                    <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                      <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
                        Grade: {certificate.grade} ({certificate.score}%)
                      </span>
                      <span className="px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-xs font-mono">
                        Date: {certificate.issue_date}
                      </span>
                    </div>

                    <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                      <span>Verification ID: <strong className="font-mono text-amber-400">{certificate.certificate_number}</strong></span>
                      <span>Verified via yaria.org</span>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={() => window.print()}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5" /> Print Verification Summary
                    </button>
                  </div>
                </div>
              ) : (
                /* Invalid Certificate View */
                <div className="p-6 rounded-2xl bg-red-50 border border-red-200 text-red-950 flex items-start gap-3.5">
                  <XCircle className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-black text-red-900">
                      Invalid Certificate ID / No Record Found
                    </h4>
                    <p className="text-xs text-red-700 mt-1">
                      No verified YARA graduate or educator certificate was found matching code "<strong>{inputCode}</strong>".
                      Please check the ID code for typos or contact the YARA registry at <strong>0717468236</strong>.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
