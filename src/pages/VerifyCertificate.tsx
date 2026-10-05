import React, { useState, useEffect, useRef } from 'react';
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
  ArrowLeft,
  Printer,
  Lock,
  Download,
  Linkedin,
  Copy,
  Check,
  ExternalLink,
  FileCheck2
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { 
  lookupAnyVerifiableCertificate, 
  VerifiableGreatLearningCertificate,
  getLinkedInAddCertificationUrl
} from '../services/greatLearningCertService';
import { YaraAccreditedCertificateCanvas } from '../components/lms/YaraAccreditedCertificateCanvas';
import { getPublicCertificate } from '../services/yaraLmsService';
import { getEducatorCertificateByCodeOrEmail } from '../services/eventRegistrationService';
import { EducatorCertificateData } from '../types/eventRegistration';
import EducatorCertificate from '../components/events/EducatorCertificate';
import { ASSETS } from '../constants/assets';

export default function VerifyCertificate() {
  const [searchParams, setSearchParams] = useSearchParams();
  const certIdFromQuery = searchParams.get('id') || '';

  const [inputCode, setInputCode] = useState(certIdFromQuery);
  const [certificate, setCertificate] = useState<VerifiableGreatLearningCertificate | null>(null);
  const [legacyCertificate, setLegacyCertificate] = useState<any | null>(null);
  const [educatorCertificate, setEducatorCertificate] = useState<EducatorCertificateData | null>(null);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  const certCardRef = useRef<HTMLDivElement>(null);

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
    setLegacyCertificate(null);
    setEducatorCertificate(null);

    try {
      // 1. Check Unified Great Learning certificate lookup
      const foundUnified = await lookupAnyVerifiableCertificate(code);
      if (foundUnified) {
        setCertificate(foundUnified);
        setLoading(false);
        return;
      }

      // 2. Check Educator Certificate
      const eduCert = await getEducatorCertificateByCodeOrEmail(code);
      if (eduCert) {
        setEducatorCertificate(eduCert);
        setLoading(false);
        return;
      }

      // 3. Check legacy LMS Graduate Certificate
      const foundLegacy = await getPublicCertificate(code);
      if (foundLegacy) {
        setLegacyCertificate(foundLegacy);
      }
    } catch (e) {
      console.error('Verify error:', e);
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

  const handleDownloadPdf = async () => {
    if (!certCardRef.current) return;
    setIsExportingPdf(true);
    try {
      const canvas = await html2canvas(certCardRef.current, {
        scale: 2.5,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${certificate?.certificateNumber || legacyCertificate?.certificate_number || 'YARA-Verified-Certificate'}.pdf`);
    } catch (err) {
      console.error('PDF export error:', err);
      window.print();
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleCopyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  const linkedInAddUrl = certificate ? getLinkedInAddCertificationUrl(certificate) : '';

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Navigation back */}
        <div className="flex items-center justify-between print:hidden">
          <Link
            to="/learning"
            className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" /> Back to YARA Learning Academy
          </Link>
          <div className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            <ShieldCheck className="w-3.5 h-3.5" /> Official Accreditation Registry
          </div>
        </div>

        {/* Verification Container */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-sm space-y-6 print:border-none print:shadow-none print:p-0">
          <div className="text-center space-y-2 print:hidden">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto text-emerald-600 shadow-sm">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              YARA Credential Verification Portal
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto">
              Verify the authenticity, academic distinction, and institutional standing of certificates issued by the Young Africans Robotics Association.
            </p>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 print:hidden">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Enter Credential ID (e.g. GLA-YARA-2026-008492 or YARA-CERT-2026-...)"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl transition shadow-md shadow-emerald-600/20 cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Verifying Credential…' : 'Verify Credential'}
            </button>
          </form>

          {/* Verification Results */}
          {searched && (
            <div className="pt-6 border-t border-slate-100">
              {loading ? (
                <div className="py-12 text-center text-xs text-slate-400">
                  <div className="w-7 h-7 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                  Querying institutional registry and cryptographic database…
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
                /* Valid Unified Great Learning Certificate View */
                <div className="space-y-6">
                  {/* Verified Header Banner */}
                  <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="text-xs font-black text-emerald-900 uppercase tracking-wide flex items-center gap-2">
                          <span>Verification Status: VERIFIED & AUTHENTIC</span>
                          <span className="px-2 py-0.5 rounded bg-emerald-200/80 text-emerald-900 text-[10px] font-black uppercase">
                            Official Registry
                          </span>
                        </div>
                        <div className="text-xs text-emerald-800 font-medium mt-0.5">
                          This credential was officially awarded to <strong>{certificate.studentName}</strong> by the Young Africans Robotics Association.
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap print:hidden">
                      {linkedInAddUrl && (
                        <a
                          href={linkedInAddUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3.5 py-2 bg-[#0077b5] hover:bg-[#006097] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition shadow-sm"
                        >
                          <Linkedin className="w-3.5 h-3.5" />
                          <span>Add to LinkedIn</span>
                        </a>
                      )}
                      <button
                        onClick={handleDownloadPdf}
                        disabled={isExportingPdf}
                        className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition shadow-sm cursor-pointer disabled:opacity-50"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>{isExportingPdf ? 'Exporting PDF…' : 'Download PDF'}</span>
                      </button>
                      <button
                        onClick={handleCopyLink}
                        className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-1 transition"
                      >
                        {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedLink ? 'Copied' : 'Share'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Skills & Course Highlights */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 print:hidden">
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                      <div className="text-[10px] uppercase font-bold text-slate-400">Awarded To</div>
                      <div className="text-sm font-black text-slate-900 mt-0.5">{certificate.studentName}</div>
                      <div className="text-[11px] text-slate-500 mt-1">Verified Learner</div>
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                      <div className="text-[10px] uppercase font-bold text-slate-400">Credential Standing</div>
                      <div className="text-sm font-black text-emerald-700 mt-0.5">{certificate.grade}</div>
                      <div className="text-[11px] text-slate-500 mt-1">Score: {certificate.score}%</div>
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                      <div className="text-[10px] uppercase font-bold text-slate-400">Date Awarded</div>
                      <div className="text-sm font-black text-slate-900 mt-0.5">{certificate.issueDate}</div>
                      <div className="text-[11px] text-slate-500 mt-1 font-mono">Lifetime Validity</div>
                    </div>
                  </div>

                  {certificate.skillsAcquired && certificate.skillsAcquired.length > 0 && (
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 print:hidden">
                      <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                        Competencies & Skills Mastered
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {certificate.skillsAcquired.map((skill, idx) => (
                          <span
                            key={idx}
                            className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs font-semibold shadow-xs"
                          >
                            ✓ {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* High-Resolution White Canvas Certificate Matching Official Template */}
                  <div className="flex justify-center overflow-x-auto p-1 bg-white rounded-3xl border border-slate-200 shadow-xl">
                    <YaraAccreditedCertificateCanvas
                      innerRef={certCardRef}
                      data={{
                        certificateNumber: certificate.certificateNumber,
                        studentName: certificate.studentName,
                        courseTitle: certificate.courseTitle,
                        certificateType: certificate.certificateType || (certificate.courseCategory?.includes('educator') ? 'educator' : certificate.courseCategory?.includes('robotics') || certificate.courseId?.includes('robotics') ? 'robotics' : 'programming'),
                        roboticsLevel: certificate.roboticsLevel || 1,
                        issueDate: certificate.issueDate,
                        verificationUrl: certificate.verificationUrl || (typeof window !== 'undefined' ? window.location.href : `https://yara.org/verify-certificate?id=${certificate.certificateNumber}`),
                        directorName: certificate.directorName || 'Harish Subramanian',
                        directorTitle: certificate.directorTitle || 'Academic Director, YARA Learning Academy',
                        organizationName: certificate.organizationName || 'YARA Learning Academy',
                        citationText: certificate.citationText,
                        grade: certificate.grade,
                        score: certificate.score,
                        skillsAcquired: certificate.skillsAcquired,
                        coSignerName: certificate.coSignerName,
                        coSignerTitle: certificate.coSignerTitle
                      }}
                    />
                  </div>
                </div>
              ) : legacyCertificate ? (
                /* Valid Legacy Certificate View */
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

                  <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border-2 border-amber-400/40 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl text-center space-y-4">
                    <div className="text-[10px] uppercase tracking-[0.25em] font-black text-amber-400">
                      Young Africans Robotics Association
                    </div>
                    <h3 className="text-2xl font-serif font-black text-white">{legacyCertificate.student_name}</h3>
                    <p className="text-xs text-slate-300 max-w-lg mx-auto leading-relaxed">
                      Successfully satisfied all academic, practical hardware labs, and Capstone requirements for:
                    </p>
                    <div className="text-sm font-bold text-amber-300">{legacyCertificate.course_title}</div>

                    <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                      <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
                        Grade: {legacyCertificate.grade} ({legacyCertificate.score}%)
                      </span>
                      <span className="px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-xs font-mono">
                        Date: {legacyCertificate.issue_date}
                      </span>
                    </div>

                    <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                      <span>Verification ID: <strong className="font-mono text-amber-400">{legacyCertificate.certificate_number}</strong></span>
                      <span>Verified via yaria.org</span>
                    </div>
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
                      No verified YARA graduate, programming course, or educator certificate was found matching code "<strong>{inputCode}</strong>".
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
