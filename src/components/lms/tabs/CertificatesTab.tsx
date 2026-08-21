import React, { useState, useEffect } from 'react';
import { 
  Award, 
  CheckCircle2, 
  Lock, 
  Printer, 
  Download, 
  ExternalLink, 
  ShieldCheck, 
  Sparkles, 
  AlertTriangle,
  CreditCard,
  QrCode,
  Share2
} from 'lucide-react';
import { CertificateEligibilityCheck } from '../../../types/yaraLms';
import { Certificate } from '../../../types/curriculum';
import { checkCertificateEligibility, issueOrGetCertificate } from '../../../services/yaraLmsService';

interface Props {
  userId: string;
  studentName: string;
  userEmail: string;
  onNavigateTab: (tab: any) => void;
}

export const CertificatesTab: React.FC<Props> = ({
  userId,
  studentName,
  userEmail,
  onNavigateTab
}) => {
  const [eligibility, setEligibility] = useState<CertificateEligibilityCheck | null>(null);
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedLink, setCopiedLink] = useState(false);

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
    } catch (e) {
      console.error('Cert check error:', e);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    if (!certificate) return;
    const verifyUrl = `${window.location.origin}/verify-certificate?id=${certificate.certificate_number}`;
    navigator.clipboard.writeText(verifyUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* 1. Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
              <Award className="w-3.5 h-3.5" /> Official Accreditation & Verification
            </div>
            <h1 className="text-2xl sm:text-3xl font-black">Official YARA Graduate Certificate</h1>
            <p className="text-xs sm:text-sm text-slate-300">
              Gated strictly by 8 comprehensive academic, practical, and institutional verification standards.
            </p>
          </div>

          {eligibility?.isEligible && certificate && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleShare}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 flex items-center gap-2 transition"
              >
                <Share2 className="w-4 h-4" />
                <span>{copiedLink ? 'Link Copied!' : 'Share Verification'}</span>
              </button>
              <button
                onClick={handlePrint}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded-xl flex items-center gap-2 transition shadow-lg shadow-emerald-600/20"
              >
                <Printer className="w-4 h-4" /> Print Certificate
              </button>
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-16 text-center text-xs text-slate-500 shadow-xs">
          <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          Auditing graduation criteria and verified YARA institutional records...
        </div>
      ) : !eligibility?.isEligible ? (
        /* Locked State with 8 Criteria & Blurred Preview */
        <div className="space-y-8">
          {/* Warning Banner */}
          <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <Lock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-xs font-bold text-amber-950 mb-0.5">
                  Complete the course to become certificate eligible. A valid and approved YARA membership subscription is required before your certificate can be issued.
                </strong>
                <p className="text-[11px] text-amber-800">
                  Please review the 8 mandatory completion criteria below. Once fulfilled and verified by faculty, your credential will be minted instantly.
                </p>
              </div>
            </div>

            <button
              onClick={() => onNavigateTab('subscription')}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl transition shrink-0 shadow-xs"
            >
              SUBSCRIBE TO YARA
            </button>
          </div>

          {/* 8 Mandatory Criteria Grid */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <h3 className="text-base font-black text-slate-900">
              8-Point Graduation & Accreditation Checklist
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* 1. All sessions */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                <div className={`p-1.5 rounded-full mt-0.5 ${eligibility?.requirements.allSessionsCompleted.met ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-400'}`}>
                  {eligibility?.requirements.allSessionsCompleted.met ? <CheckCircle2 className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">1. Complete All 42 Sessions</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {eligibility?.requirements.allSessionsCompleted.current} / {eligibility?.requirements.allSessionsCompleted.total} completed
                  </div>
                </div>
              </div>

              {/* 2. Quizzes */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                <div className={`p-1.5 rounded-full mt-0.5 ${eligibility?.requirements.allQuizzesPassed.met ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-400'}`}>
                  {eligibility?.requirements.allQuizzesPassed.met ? <CheckCircle2 className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">2. Pass All Knowledge Quizzes</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {eligibility?.requirements.allQuizzesPassed.passedCount} / {eligibility?.requirements.allQuizzesPassed.totalCount} passed (≥70%)
                  </div>
                </div>
              </div>

              {/* 3. Assignments */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                <div className={`p-1.5 rounded-full mt-0.5 ${eligibility?.requirements.allAssignmentsSubmitted.met ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-400'}`}>
                  {eligibility?.requirements.allAssignmentsSubmitted.met ? <CheckCircle2 className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">3. Submit All Assignments</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {eligibility?.requirements.allAssignmentsSubmitted.submittedCount} / {eligibility?.requirements.allAssignmentsSubmitted.totalCount} submitted
                  </div>
                </div>
              </div>

              {/* 4. Practical Labs */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                <div className={`p-1.5 rounded-full mt-0.5 ${eligibility?.requirements.practicalLabsCompleted.met ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-400'}`}>
                  {eligibility?.requirements.practicalLabsCompleted.met ? <CheckCircle2 className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">4. Physical Laboratory Assessments</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {eligibility?.requirements.practicalLabsCompleted.completedCount} / {eligibility?.requirements.practicalLabsCompleted.totalCount} verified (P01–P05)
                  </div>
                </div>
              </div>

              {/* 5. Capstone Submitted */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                <div className={`p-1.5 rounded-full mt-0.5 ${eligibility?.requirements.capstoneSubmitted.met ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-400'}`}>
                  {eligibility?.requirements.capstoneSubmitted.met ? <CheckCircle2 className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">5. Submit Final Capstone (P04)</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {eligibility?.requirements.capstoneSubmitted.met ? 'Package Submitted' : 'Pending Submission'}
                  </div>
                </div>
              </div>

              {/* 6. Capstone Approved */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                <div className={`p-1.5 rounded-full mt-0.5 ${eligibility?.requirements.capstoneApproved.met ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-400'}`}>
                  {eligibility?.requirements.capstoneApproved.met ? <CheckCircle2 className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">6. Capstone Faculty Approval</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {eligibility?.requirements.capstoneApproved.met
                      ? `Approved (${eligibility.requirements.capstoneApproved.score}%)`
                      : 'Requires instructor review (≥75%)'}
                  </div>
                </div>
              </div>

              {/* 7. Registered Member */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                <div className="p-1.5 rounded-full mt-0.5 bg-emerald-100 text-emerald-700">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">7. Registered YARA Learner Account</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">{userEmail}</div>
                </div>
              </div>

              {/* 8. Paid & Approved Subscription */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                <div className={`p-1.5 rounded-full mt-0.5 ${eligibility?.requirements.subscriptionPaidAndApproved.met ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                  {eligibility?.requirements.subscriptionPaidAndApproved.met ? <CheckCircle2 className="w-4 h-4" /> : <CreditCard className="w-4 h-4" />}
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">8. Paid & Approved YARA Membership</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Status: <span className="font-semibold uppercase text-emerald-600">{eligibility?.requirements.subscriptionPaidAndApproved.status || 'Inactive'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Blurred Locked Certificate Preview */}
          <div className="relative rounded-3xl overflow-hidden border border-slate-200 shadow-xl bg-slate-900 p-8 text-center">
            <div className="filter blur-md select-none opacity-40 space-y-4">
              <div className="text-amber-400 text-xs font-black uppercase tracking-widest">
                Young Africans Robotics Association
              </div>
              <h2 className="text-3xl font-serif font-black text-white">{studentName}</h2>
              <p className="text-slate-300 text-xs max-w-md mx-auto">
                Has completed the YARA Robotics & Innovation Foundation Programme
              </p>
              <div className="w-24 h-24 border border-amber-400/30 rounded-full mx-auto my-4"></div>
            </div>

            {/* Centered Lock Overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-slate-950/60 backdrop-blur-xs text-white space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                <Lock className="w-6 h-6" />
              </div>
              <h4 className="text-base font-black">Accredited Certificate Locked</h4>
              <p className="text-xs text-slate-300 max-w-sm text-center">
                Satisfy all 8 graduation criteria and ensure your YARA membership is active and approved to unlock and mint your official credential.
              </p>
              <button
                onClick={() => onNavigateTab('subscription')}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition shadow-lg"
              >
                SUBSCRIBE TO YARA / CHECK MEMBERSHIP
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Full Unlocked Certificate */
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border-4 border-amber-400/40 rounded-3xl p-8 sm:p-14 text-center relative overflow-hidden shadow-2xl text-white">
            <div className="absolute inset-3 border border-amber-400/20 rounded-2xl pointer-events-none"></div>

            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-14 h-14 rounded-full bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 shadow-lg">
                <Award className="w-8 h-8" />
              </div>
            </div>

            <h3 className="text-xs uppercase tracking-[0.25em] font-black text-amber-400 mb-1">
              Young Africans Robotics Association
            </h3>
            <h4 className="text-[11px] text-slate-400 uppercase tracking-widest mb-6">
              Directorate of Robotics, Hardware Engineering & STEM Innovation
            </h4>

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

            {/* Signatures & Verification Row */}
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
                <div className="text-[9px] text-slate-500 mt-0.5">yaria.org/verify-certificate</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
