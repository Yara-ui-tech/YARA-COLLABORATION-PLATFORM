import React, { useState, useEffect } from 'react';
import { 
  X, 
  Award, 
  CheckCircle, 
  AlertTriangle, 
  Lock, 
  Printer, 
  ExternalLink, 
  ShieldCheck, 
  QrCode,
  Sparkles,
  Download,
  CreditCard
} from 'lucide-react';
import { CertificateEligibilityCheck } from '../../types/yaraLms';
import { Certificate } from '../../types/curriculum';
import { checkCertificateEligibility, issueOrGetCertificate } from '../../services/yaraLmsService';

interface Props {
  userId: string;
  studentName: string;
  userEmail: string;
  isOpen: boolean;
  onClose: () => void;
  onNavigateToMembership?: () => void;
}

export const YaraLmsCertificateModal: React.FC<Props> = ({
  userId,
  studentName,
  userEmail,
  isOpen,
  onClose,
  onNavigateToMembership
}) => {
  const [eligibility, setEligibility] = useState<CertificateEligibilityCheck | null>(null);
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen, userId, userEmail]);

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

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-y-auto p-6 sm:p-8 text-white shadow-2xl relative my-6">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white transition"
        >
          <X size={18} />
        </button>

        <div className="mb-6">
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Accreditation & Certification</span>
          <h2 className="text-2xl font-black mt-1">Official YARA Graduate Certificate</h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Gated strictly by 8 comprehensive academic & institutional criteria.
          </p>
        </div>

        {loading ? (
          <div className="py-16 text-center text-xs text-slate-400">
            <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            Auditing graduation and institutional subscription records...
          </div>
        ) : !eligibility?.isEligible ? (
          /* Locked State with 8 Criteria Breakdown */
          <div className="space-y-6">
            <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs sm:text-sm flex items-start gap-3">
              <Lock size={22} className="text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block text-amber-200 mb-0.5">Certificate Locked</span>
                You have not yet satisfied all 8 mandatory graduation requirements. Complete the remaining items below to unlock your verified certificate.
              </div>
            </div>

            {/* 8 Criteria Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* 1. All sessions */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-start gap-3">
                <div className={`p-1.5 rounded-full mt-0.5 ${eligibility?.requirements.allSessionsCompleted.met ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-500'}`}>
                  {eligibility?.requirements.allSessionsCompleted.met ? <CheckCircle size={16} /> : <Lock size={16} />}
                </div>
                <div>
                  <div className="text-xs font-bold text-white">1. Complete All 42 Sessions</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {eligibility?.requirements.allSessionsCompleted.current} / {eligibility?.requirements.allSessionsCompleted.total} completed
                  </div>
                </div>
              </div>

              {/* 2. Quizzes */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-start gap-3">
                <div className={`p-1.5 rounded-full mt-0.5 ${eligibility?.requirements.allQuizzesPassed.met ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-500'}`}>
                  {eligibility?.requirements.allQuizzesPassed.met ? <CheckCircle size={16} /> : <Lock size={16} />}
                </div>
                <div>
                  <div className="text-xs font-bold text-white">2. Pass All Knowledge Quizzes</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {eligibility?.requirements.allQuizzesPassed.passedCount} / {eligibility?.requirements.allQuizzesPassed.totalCount} passed (≥70%)
                  </div>
                </div>
              </div>

              {/* 3. Assignments */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-start gap-3">
                <div className={`p-1.5 rounded-full mt-0.5 ${eligibility?.requirements.allAssignmentsSubmitted.met ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-500'}`}>
                  {eligibility?.requirements.allAssignmentsSubmitted.met ? <CheckCircle size={16} /> : <Lock size={16} />}
                </div>
                <div>
                  <div className="text-xs font-bold text-white">3. Submit All Assignments</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {eligibility?.requirements.allAssignmentsSubmitted.submittedCount} / {eligibility?.requirements.allAssignmentsSubmitted.totalCount} submitted
                  </div>
                </div>
              </div>

              {/* 4. Practical Labs */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-start gap-3">
                <div className={`p-1.5 rounded-full mt-0.5 ${eligibility?.requirements.practicalLabsCompleted.met ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-500'}`}>
                  {eligibility?.requirements.practicalLabsCompleted.met ? <CheckCircle size={16} /> : <Lock size={16} />}
                </div>
                <div>
                  <div className="text-xs font-bold text-white">4. Physical Laboratory Assessments</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {eligibility?.requirements.practicalLabsCompleted.completedCount} / {eligibility?.requirements.practicalLabsCompleted.totalCount} verified (P01–P05)
                  </div>
                </div>
              </div>

              {/* 5. Capstone Submitted */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-start gap-3">
                <div className={`p-1.5 rounded-full mt-0.5 ${eligibility?.requirements.capstoneSubmitted.met ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-500'}`}>
                  {eligibility?.requirements.capstoneSubmitted.met ? <CheckCircle size={16} /> : <Lock size={16} />}
                </div>
                <div>
                  <div className="text-xs font-bold text-white">5. Submit Final Capstone</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {eligibility?.requirements.capstoneSubmitted.met ? 'Package Submitted' : 'Pending Submission'}
                  </div>
                </div>
              </div>

              {/* 6. Capstone Approved */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-start gap-3">
                <div className={`p-1.5 rounded-full mt-0.5 ${eligibility?.requirements.capstoneApproved.met ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-500'}`}>
                  {eligibility?.requirements.capstoneApproved.met ? <CheckCircle size={16} /> : <Lock size={16} />}
                </div>
                <div>
                  <div className="text-xs font-bold text-white">6. Capstone Faculty Approval</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {eligibility?.requirements.capstoneApproved.met ? `Approved (${eligibility.requirements.capstoneApproved.score}%)` : 'Requires instructor review (≥75%)'}
                  </div>
                </div>
              </div>

              {/* 7. Registered Member */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-start gap-3">
                <div className="p-1.5 rounded-full mt-0.5 bg-emerald-500/20 text-emerald-400">
                  <CheckCircle size={16} />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">7. Registered YARA Learner</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">{userEmail}</div>
                </div>
              </div>

              {/* 8. Paid & Approved Subscription */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-start gap-3">
                <div className={`p-1.5 rounded-full mt-0.5 ${eligibility?.requirements.subscriptionPaidAndApproved.met ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                  {eligibility?.requirements.subscriptionPaidAndApproved.met ? <CheckCircle size={16} /> : <CreditCard size={16} />}
                </div>
                <div>
                  <div className="text-xs font-bold text-white">8. Paid & Approved YARA Membership</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Status: <span className="font-semibold text-emerald-400 uppercase">{eligibility?.requirements.subscriptionPaidAndApproved.status || 'Inactive'}</span>
                  </div>
                </div>
              </div>
            </div>

            {!eligibility?.requirements.subscriptionPaidAndApproved.met && onNavigateToMembership && (
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-xs font-bold text-white">Need to activate or verify your YARA Membership?</h4>
                  <p className="text-[11px] text-slate-400">Access EcoCash / Bank transfer details and submit your payment reference.</p>
                </div>
                <button
                  onClick={() => {
                    onClose();
                    onNavigateToMembership();
                  }}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-xl transition"
                >
                  Manage Membership →
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Prestigious Certificate Render */
          <div className="space-y-6">
            <div className="flex justify-end gap-2">
              <button
                onClick={handlePrint}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl flex items-center gap-2 transition"
              >
                <Printer size={14} /> Print Certificate
              </button>
            </div>

            <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border-4 border-amber-400/40 rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden shadow-2xl">
              {/* Outer decorative borders */}
              <div className="absolute inset-2 border border-amber-400/20 rounded-2xl pointer-events-none"></div>

              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 shadow-lg">
                  <Award size={28} />
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

              {/* Signatures & Verification */}
              <div className="mt-10 pt-8 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-6 text-left items-end">
                <div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider">Date of Award</div>
                  <div className="text-xs font-bold text-slate-300 mt-0.5">{certificate?.issue_date}</div>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 border border-amber-400/40 rounded-full mx-auto flex items-center justify-center text-amber-400/80 mb-1">
                    <ShieldCheck size={32} />
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
    </div>
  );
};
