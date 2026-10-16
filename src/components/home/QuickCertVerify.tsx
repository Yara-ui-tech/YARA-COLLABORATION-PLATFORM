import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Award, 
  Calendar, 
  User, 
  ExternalLink 
} from 'lucide-react';
import { lookupAnyVerifiableCertificate } from '../../services/greatLearningCertService';
import { yaraV3Service } from '../../services/v3/yaraV3Service';

export default function QuickCertVerify() {
  const [certCode, setCertCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    valid: boolean;
    name?: string;
    course?: string;
    date?: string;
    certNumber?: string;
    message?: string;
  } | null>(null);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = certCode.trim();
    if (!code) return;

    setLoading(true);
    setResult(null);

    try {
      // 1. Try v3 RPC check
      const v3 = await yaraV3Service.verifyCertificate(code);
      if (v3) {
        setResult({
          valid: true,
          name: v3.recipient_name || v3.profiles?.display_name || 'YARA Graduate',
          course: v3.course_title || v3.courses?.title || 'YARA Robotics & Emerging Technology',
          date: v3.issued_at || v3.created_at || new Date().toISOString(),
          certNumber: v3.certificate_number || code,
        });
        setLoading(false);
        return;
      }

      // 2. Try Great Learning / Unified cert
      const unified = await lookupAnyVerifiableCertificate(code);
      if (unified) {
        setResult({
          valid: true,
          name: unified.studentName,
          course: unified.courseTitle,
          date: unified.issueDate,
          certNumber: unified.certificateNumber,
        });
        setLoading(false);
        return;
      }

      setResult({
        valid: false,
        message: `No active accreditation found for "${code}". Please check your certificate code format (e.g. YARA-2026-XXXX).`
      });
    } catch (err: any) {
      setResult({
        valid: false,
        message: 'Could not complete verification lookup. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 space-y-6 shadow-2xl">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-bold uppercase tracking-wider">
          <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
          <span>Accreditation &amp; Credential Registry</span>
        </div>
        <h3 className="text-xl sm:text-2xl font-black text-white">
          Verify Official STEM Certificate
        </h3>
        <p className="text-xs sm:text-sm text-slate-400">
          Instant verification for universities, employers, school heads, and scholarship boards.
        </p>
      </div>

      <form onSubmit={handleVerify} className="flex flex-col sm:flex-row gap-2.5">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            required
            placeholder="Enter certificate number (e.g. YARA-2026-001)"
            value={certCode}
            onChange={(e) => setCertCode(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-10 pr-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 font-mono transition"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 bg-purple-600 hover:bg-purple-500 disabled:opacity-60 text-white font-bold text-xs uppercase tracking-wider rounded-2xl transition shadow-lg shadow-purple-900/30 flex items-center justify-center gap-2 shrink-0 cursor-pointer"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Verifying...</span>
            </>
          ) : (
            <>
              <ShieldCheck className="w-4 h-4" />
              <span>Verify Now</span>
            </>
          )}
        </button>
      </form>

      {/* Verification Result Card */}
      {result && (
        <div className={`p-5 rounded-2xl border transition-all ${
          result.valid 
            ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200' 
            : 'bg-red-950/40 border-red-500/40 text-red-200'
        }`}>
          {result.valid ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 font-black text-sm text-emerald-400">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>OFFICIAL YARA ACCREDITATION VERIFIED</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-950/70 p-4 rounded-xl border border-emerald-500/20">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Recipient:</span>
                  <span className="text-white font-bold text-sm flex items-center gap-1.5 mt-0.5">
                    <User className="w-3.5 h-3.5 text-emerald-400" />
                    {result.name}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Certificate Number:</span>
                  <span className="text-emerald-300 font-mono font-bold mt-0.5 block">
                    {result.certNumber}
                  </span>
                </div>

                <div className="sm:col-span-2">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Accredited Program / Milestone:</span>
                  <span className="text-white font-semibold flex items-center gap-1.5 mt-0.5">
                    <Award className="w-3.5 h-3.5 text-amber-400" />
                    {result.course}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Date Verified / Issued:</span>
                  <span className="text-slate-300 flex items-center gap-1.5 mt-0.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    {result.date ? new Date(result.date).toLocaleDateString() : 'Active'}
                  </span>
                </div>
              </div>

              <div className="text-right">
                <a
                  href={`/verify-certificate/${encodeURIComponent(result.certNumber || certCode)}`}
                  className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 hover:text-emerald-300 underline"
                >
                  <span>View Full Certificate PDF &amp; LinkedIn Badge &rarr;</span>
                </a>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-2.5 text-xs">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-red-300 font-bold mb-0.5">Verification Failed</strong>
                <p className="text-red-200/90">{result.message}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
