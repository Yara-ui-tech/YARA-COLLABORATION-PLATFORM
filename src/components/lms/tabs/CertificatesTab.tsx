import React, { useState, useEffect } from 'react';
import { 
  Award, 
  CheckCircle2, 
  Lock, 
  Printer, 
  Download, 
  ExternalLink, 
  ShieldCheck, 
  Zap, 
  AlertTriangle,
  CreditCard,
  Share2,
  Code2,
  GraduationCap,
  Clock,
  Copy,
  Check,
  BookOpen,
  ChevronRight
} from 'lucide-react';
import { CertificateEligibilityCheck } from '../../../types/yaraLms';
import { Certificate } from '../../../types/curriculum';
import { ProgrammingCertificate } from '../../../types/lmsCourseTypes';
import { COURSE_CATEGORY_LABELS, COURSE_CATEGORY_COLORS } from '../../../types/lmsCourseTypes';
import { checkCertificateEligibility, issueOrGetCertificate } from '../../../services/yaraLmsService';
import { getAllUserProgrammingCertificates } from '../../../services/programmingCoursesService';

interface Props {
  userId: string;
  studentName: string;
  userEmail: string;
  onNavigateTab: (tab: any) => void;
}

const CopiedCheck: React.FC<{ copied: boolean }> = ({ copied }) =>
  copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />;

export const CertificatesTab: React.FC<Props> = ({
  userId,
  studentName,
  userEmail,
  onNavigateTab
}) => {
  const [eligibility, setEligibility] = useState<CertificateEligibilityCheck | null>(null);
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [programmingCerts, setProgrammingCerts] = useState<ProgrammingCertificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCertId, setCopiedCertId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [userId, userEmail]);

  const loadData = async () => {
    setLoading(true);
    try {
      const elig = await checkCertificateEligibility(userId, userEmail);
      setEligibility(elig);

      if (elig.isEligible) {
        const cert = await issueOrGetCertificate(userId, studentName, userEmail);
        setCertificate(cert);
      }

      const progCerts = getAllUserProgrammingCertificates(userId);
      setProgrammingCerts(progCerts);
    } catch (e) {
      console.error('Cert check error:', e);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => window.print();

  const handleShare = () => {
    if (!certificate) return;
    const verifyUrl = `${window.location.origin}/verify-certificate?id=${certificate.certificate_number}`;
    navigator.clipboard.writeText(verifyUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  const handleShareProgCert = (cert: ProgrammingCertificate) => {
    const url = `${window.location.origin}/verify-certificate?id=${cert.certificateNumber}`;
    navigator.clipboard.writeText(url);
    setCopiedCertId(cert.id);
    setTimeout(() => setCopiedCertId(null), 3000);
  };

  const totalCerts = (certificate ? 1 : 0) + programmingCerts.length;

  return (
    <div className="space-y-8 pb-12">
      {/* ─── Hero Header ─────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl text-white border border-slate-800"
        style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0c1a2e 100%)' }}>
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full opacity-20 blur-3xl" style={{ background: 'radial-gradient(circle, #f59e0b, transparent)' }} />
        <div className="absolute bottom-0 left-1/4 w-60 h-60 rounded-full opacity-10 blur-3xl" style={{ background: 'radial-gradient(circle, #4f46e5, transparent)' }} />

        <div className="relative z-10 p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold">
                <Award className="w-3.5 h-3.5" /> Official Accreditation & Verification
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white">My Certificates</h1>
              <p className="text-xs sm:text-sm text-slate-300">
                {totalCerts > 0
                  ? `You have ${totalCerts} certificate${totalCerts > 1 ? 's' : ''} — all verifiable and shareable.`
                  : 'Complete courses and meet all graduation criteria to earn your official credentials.'}
              </p>
            </div>

            <div className="flex items-center gap-3">
              {totalCerts > 0 && (
                <div className="text-center">
                  <div className="text-4xl font-black text-amber-400">{totalCerts}</div>
                  <div className="text-[11px] text-slate-400 font-medium">Earned</div>
                </div>
              )}
              {eligibility?.isEligible && certificate && (
                <div className="flex flex-col gap-2">
                  <button onClick={handleShare}
                    className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 flex items-center gap-2 transition">
                    <CopiedCheck copied={copiedLink} />
                    <span>{copiedLink ? 'Copied!' : 'Share'}</span>
                  </button>
                  <button onClick={handlePrint}
                    className="px-4 py-2.5 text-white text-xs font-black rounded-xl flex items-center gap-2 transition"
                    style={{ background: 'linear-gradient(135deg, #d97706, #f59e0b)' }}>
                    <Printer className="w-4 h-4" /> Print
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-16 text-center text-xs text-slate-500">
          <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          Verifying graduation criteria and certificates…
        </div>
      ) : (
        <div className="space-y-8">
          {/* ─── Section 1: Programming Certificates ───────────────────────────── */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-100 flex items-center justify-center">
                  <Code2 className="w-4 h-4 text-indigo-600" />
                </div>
                <div>
                  <h2 className="text-base font-black text-slate-900">Programming Course Certificates</h2>
                  <p className="text-[11px] text-slate-500">Earned by completing YARA programming courses</p>
                </div>
              </div>
              <button onClick={() => onNavigateTab('programming')}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
                Browse Courses <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {programmingCerts.length === 0 ? (
              <div className="bg-white border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center space-y-3">
                <Code2 className="w-10 h-10 text-slate-300 mx-auto" />
                <div>
                  <p className="text-sm font-bold text-slate-500">No programming certificates yet</p>
                  <p className="text-xs text-slate-400 mt-1">Complete a Python, JavaScript, or Scratch course to earn your first certificate</p>
                </div>
                <button onClick={() => onNavigateTab('programming')}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-white text-xs font-black rounded-xl transition hover:opacity-90"
                  style={{ background: 'linear-gradient(135deg, #4f46e5, #059669)' }}>
                  <Code2 className="w-3.5 h-3.5" /> Explore Programming Courses
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {programmingCerts.map(cert => {
                  const colors = COURSE_CATEGORY_COLORS[cert.courseCategory];
                  const isCopied = copiedCertId === cert.id;
                  return (
                    <div key={cert.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition group">
                      {/* Card header */}
                      <div className="p-5 text-white relative overflow-hidden"
                        style={{ background: 'linear-gradient(135deg, #0f172a, #1e1b4b)' }}>
                        <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-2xl opacity-20" style={{ background: '#f59e0b' }} />
                        <div className="relative z-10 flex items-start justify-between gap-3">
                          <div className="space-y-1 min-w-0">
                            <span className={`inline-block badge ${colors.bg} ${colors.text} ${colors.border} border text-[9px] mb-1`}>
                              {COURSE_CATEGORY_LABELS[cert.courseCategory]}
                            </span>
                            <h3 className="text-sm font-black text-white leading-snug">{cert.courseTitle}</h3>
                            <p className="text-[11px] text-slate-400">{cert.studentName}</p>
                          </div>
                          <div className="w-12 h-12 rounded-2xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center shrink-0">
                            <Award className="w-6 h-6 text-amber-400" />
                          </div>
                        </div>
                      </div>

                      {/* Card body */}
                      <div className="p-4 space-y-3">
                        <div className="grid grid-cols-3 gap-2 text-center">
                          <div className="p-2 bg-slate-50 rounded-xl">
                            <div className="text-xs font-black text-slate-900">{cert.grade}</div>
                            <div className="text-[10px] text-slate-500">Grade</div>
                          </div>
                          <div className="p-2 bg-emerald-50 rounded-xl">
                            <div className="text-xs font-black text-emerald-700">{cert.score}%</div>
                            <div className="text-[10px] text-slate-500">Score</div>
                          </div>
                          <div className="p-2 bg-indigo-50 rounded-xl">
                            <div className="text-[9px] font-black text-indigo-700 truncate">{cert.issueDate.split(',')[1]?.trim() || cert.issueDate}</div>
                            <div className="text-[10px] text-slate-500">Awarded</div>
                          </div>
                        </div>

                        <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                          <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Credential ID</div>
                          <div className="text-[11px] font-mono font-bold text-slate-900 break-all">{cert.certificateNumber}</div>
                        </div>

                        <div className="flex gap-2">
                          <button onClick={() => handleShareProgCert(cert)}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition">
                            <CopiedCheck copied={isCopied} />
                            {isCopied ? 'Copied!' : 'Share Link'}
                          </button>
                          <button onClick={handlePrint}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2 text-white text-xs font-bold rounded-xl transition hover:opacity-90"
                            style={{ background: 'linear-gradient(135deg, #d97706, #f59e0b)' }}>
                            <Printer className="w-3.5 h-3.5" /> Print
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ─── Section 2: Robotics Foundation Certificate ─────────────────────── */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center">
                <GraduationCap className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <h2 className="text-base font-black text-slate-900">Robotics Foundation Certificate</h2>
                <p className="text-[11px] text-slate-500">8-point gated graduation credential — our most prestigious award</p>
              </div>
            </div>

            {!eligibility?.isEligible ? (
              <div className="space-y-6">
                {/* Warning Banner */}
                <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <Lock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block text-xs font-bold text-amber-950 mb-0.5">
                        8 mandatory criteria must be met before your Robotics certificate can be issued.
                      </strong>
                      <p className="text-[11px] text-amber-800">
                        A valid YARA membership subscription is also required. Review the checklist below.
                      </p>
                    </div>
                  </div>
                  <button onClick={() => onNavigateTab('subscription')}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl transition shrink-0">
                    SUBSCRIBE TO YARA
                  </button>
                </div>

                {/* 8-Point Checklist */}
                <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
                  <h3 className="text-base font-black text-slate-900">8-Point Graduation & Accreditation Checklist</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { label: '1. Complete All 42 Sessions', detail: `${eligibility?.requirements.allSessionsCompleted.current} / ${eligibility?.requirements.allSessionsCompleted.total} completed`, met: eligibility?.requirements.allSessionsCompleted.met },
                      { label: '2. Pass All Knowledge Quizzes', detail: `${eligibility?.requirements.allQuizzesPassed.passedCount} / ${eligibility?.requirements.allQuizzesPassed.totalCount} passed (≥70%)`, met: eligibility?.requirements.allQuizzesPassed.met },
                      { label: '3. Submit All Assignments', detail: `${eligibility?.requirements.allAssignmentsSubmitted.submittedCount} / ${eligibility?.requirements.allAssignmentsSubmitted.totalCount} submitted`, met: eligibility?.requirements.allAssignmentsSubmitted.met },
                      { label: '4. Physical Laboratory Assessments', detail: `${eligibility?.requirements.practicalLabsCompleted.completedCount} / ${eligibility?.requirements.practicalLabsCompleted.totalCount} verified (P01–P05)`, met: eligibility?.requirements.practicalLabsCompleted.met },
                      { label: '5. Submit Final Capstone (P04)', detail: eligibility?.requirements.capstoneSubmitted.met ? 'Package Submitted' : 'Pending Submission', met: eligibility?.requirements.capstoneSubmitted.met },
                      { label: '6. Capstone Faculty Approval', detail: eligibility?.requirements.capstoneApproved.met ? `Approved (${eligibility.requirements.capstoneApproved.score}%)` : 'Requires instructor review (≥75%)', met: eligibility?.requirements.capstoneApproved.met },
                      { label: '7. Registered YARA Learner Account', detail: userEmail, met: true },
                      { label: '8. Paid & Approved YARA Membership', detail: `Status: ${eligibility?.requirements.subscriptionPaidAndApproved.status || 'Inactive'}`, met: eligibility?.requirements.subscriptionPaidAndApproved.met, isSpecial: true },
                    ].map((item, i) => (
                      <div key={i} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                        <div className={`p-1.5 rounded-full mt-0.5 shrink-0 ${item.met ? 'bg-emerald-100 text-emerald-700' : item.isSpecial ? 'bg-amber-100 text-amber-700' : 'bg-slate-200 text-slate-400'}`}>
                          {item.met ? <CheckCircle2 className="w-4 h-4" /> : item.isSpecial ? <CreditCard className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900">{item.label}</div>
                          <div className="text-[11px] text-slate-500 mt-0.5">{item.detail}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Blurred preview */}
                <div className="relative rounded-3xl overflow-hidden border border-slate-800 shadow-xl p-8 text-center"
                  style={{ background: 'linear-gradient(135deg, #0f172a, #1e1b4b)' }}>
                  <div className="filter blur-md select-none opacity-30 space-y-4">
                    <div className="text-amber-400 text-xs font-black uppercase tracking-widest">Young Africans Robotics Association</div>
                    <h2 className="text-3xl font-serif font-black text-white">{studentName}</h2>
                    <p className="text-slate-300 text-xs max-w-md mx-auto">Has completed the YARA Robotics & Innovation Foundation Programme</p>
                    <div className="w-24 h-24 border border-amber-400/30 rounded-full mx-auto my-4" />
                  </div>
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-white space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                      <Lock className="w-6 h-6" />
                    </div>
                    <h4 className="text-base font-black">Accredited Certificate Locked</h4>
                    <p className="text-xs text-slate-300 max-w-sm text-center">
                      Satisfy all 8 graduation criteria and ensure your YARA membership is active and approved.
                    </p>
                    <button onClick={() => onNavigateTab('subscription')}
                      className="px-5 py-2.5 text-white text-xs font-bold rounded-xl transition hover:opacity-90"
                      style={{ background: 'linear-gradient(135deg, #059669, #10b981)' }}>
                      SUBSCRIBE TO YARA / CHECK MEMBERSHIP
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* Full Unlocked Certificate */
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border-4 border-amber-400/40 rounded-3xl p-8 sm:p-14 text-center relative overflow-hidden shadow-2xl text-white">
                  <div className="absolute inset-3 border border-amber-400/20 rounded-2xl pointer-events-none" />
                  <div className="absolute top-0 right-0 w-80 h-80 rounded-full blur-3xl opacity-10" style={{ background: '#f59e0b' }} />

                  <div className="flex items-center justify-center gap-3 mb-4">
                    <div className="w-14 h-14 rounded-full bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 shadow-lg">
                      <Award className="w-8 h-8" />
                    </div>
                  </div>

                  <h3 className="text-xs uppercase tracking-[0.25em] font-black text-amber-400 mb-1">Young Africans Robotics Association</h3>
                  <h4 className="text-[11px] text-slate-400 uppercase tracking-widest mb-6">Directorate of Robotics, Hardware Engineering & STEM Innovation</h4>

                  <div className="text-xs text-slate-300 italic mb-2">This is to certify that</div>
                  <h1 className="text-2xl sm:text-4xl font-serif font-black text-white tracking-wide border-b border-amber-400/30 pb-3 max-w-xl mx-auto">
                    {certificate?.student_name}
                  </h1>

                  <div className="text-xs text-slate-300 mt-4 max-w-lg mx-auto leading-relaxed">
                    has successfully completed all 42 theoretical, laboratory, and research sessions, passed all examinations, built and stress-tested physical autonomous robotics hardware, and successfully defended an original Capstone Innovation Project in:
                  </div>

                  <div className="text-base sm:text-lg font-bold text-amber-300 mt-3 max-w-xl mx-auto">
                    {certificate?.course_title}
                  </div>

                  <div className="inline-block bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-4 py-1 rounded-full text-xs font-bold mt-4">
                    Grade Awarded: {certificate?.grade} ({certificate?.score}%)
                  </div>

                  <div className="mt-12 pt-8 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-6 text-left items-end">
                    <div>
                      <div className="text-[10px] text-slate-500 uppercase tracking-wider">Date of Award</div>
                      <div className="text-xs font-bold text-slate-300 mt-0.5">{certificate?.issue_date}</div>
                    </div>
                    <div className="text-center">
                      <div className="w-16 h-16 border border-amber-400/40 rounded-full mx-auto flex items-center justify-center text-amber-400/80 mb-1">
                        <ShieldCheck className="w-8 h-8" />
                      </div>
                      <div className="text-[9px] uppercase tracking-widest text-amber-400 font-bold">Official YARA Seal</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] text-slate-500 uppercase tracking-wider">Verification ID</div>
                      <div className="text-xs font-mono font-bold text-amber-400 mt-0.5">{certificate?.certificate_number}</div>
                      <div className="text-[9px] text-slate-500 mt-0.5">yara.org/verify-certificate</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};


