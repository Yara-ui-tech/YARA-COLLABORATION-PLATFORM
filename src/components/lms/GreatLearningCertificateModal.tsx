import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Award, 
  CheckCircle2, 
  AlertCircle, 
  Lock, 
  Printer, 
  Download, 
  Share2, 
  ExternalLink, 
  ShieldCheck, 
  Copy, 
  Check, 
  ChevronRight, 
  Linkedin, 
  Twitter, 
  Send, 
  FileText, 
  BookOpen, 
  GraduationCap,
  QrCode as QrCodeIcon,
  Edit3,
  Sliders,
  RotateCcw,
  Save,
  Cpu,
  Code
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { ASSETS } from '../../constants/assets';
import { 
  GreatLearningCourseEligibility, 
  VerifiableGreatLearningCertificate,
  evaluateGreatLearningCourseEligibility,
  claimGreatLearningCertificate,
  updateGreatLearningCertificate,
  getLinkedInAddCertificationUrl,
  getSocialShareLinks
} from '../../services/greatLearningCertService';
import { 
  YaraAccreditedCertificateCanvas, 
  CertificateType, 
  RoboticsLevel 
} from './YaraAccreditedCertificateCanvas';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userEmail: string;
  defaultStudentName: string;
  courseId: string;
  courseTitle?: string;
  courseCategory?: string;
  onNavigateToCourse?: (courseId: string) => void;
}

export const GreatLearningCertificateModal: React.FC<Props> = ({
  isOpen,
  onClose,
  userId,
  userEmail,
  defaultStudentName,
  courseId,
  courseTitle,
  courseCategory,
  onNavigateToCourse
}) => {
  const [loading, setLoading] = useState(true);
  const [eligibility, setEligibility] = useState<GreatLearningCourseEligibility | null>(null);
  const [certificate, setCertificate] = useState<VerifiableGreatLearningCertificate | null>(null);

  // Workflow steps: 1 = 'audit' (checklist), 2 = 'confirm_name', 3 = 'minted' (certificate display & share)
  const [step, setStep] = useState<'audit' | 'confirm_name' | 'minted'>('audit');
  const [confirmedName, setConfirmedName] = useState(defaultStudentName || '');
  const [isMinting, setIsMinting] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isExportingPng, setIsExportingPng] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Live Certificate Customization State
  const [isEditingCert, setIsEditingCert] = useState(false);
  const [isSavingEdits, setIsSavingEdits] = useState(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState('');
  const [editForm, setEditForm] = useState({
    studentName: '',
    courseTitle: '',
    certificateType: 'robotics' as CertificateType,
    roboticsLevel: 1 as RoboticsLevel,
    directorName: 'Harish Subramanian',
    directorTitle: 'Academic Director, YARA Learning Academy',
    organizationName: 'YARA Learning Academy',
    directorateSubtitle: 'Academy Directorate of Robotics, Software Engineering & STEM Innovation',
    grade: 'Distinction with Honors',
    score: 92,
    issueDate: '',
    certificateNumber: '',
    instructorName: 'Mr. S.O. Manongwa',
    instructorTitle: 'Founder & Lead Robotics Instructor',
    coSignerName: 'Ms. A.M. Chiambiro',
    coSignerTitle: 'Regional President & Evaluation Chair',
    citationText: '',
    skillsAcquired: '',
    sealLabel: 'Official YARA Seal'
  });

  const certRenderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen, userId, courseId, defaultStudentName]);

  const loadData = async () => {
    setLoading(true);
    try {
      const elig = await evaluateGreatLearningCourseEligibility(userId, userEmail, courseId);
      setEligibility(elig);

      if (elig.existingCertificate) {
        setCertificate(elig.existingCertificate);
        setConfirmedName(elig.existingCertificate.studentName);
        syncEditFormWithCert(elig.existingCertificate);
        setStep('minted');
      } else if (elig.isEligible) {
        setConfirmedName(defaultStudentName || userEmail.split('@')[0]);
        setStep('confirm_name');
      } else {
        setStep('audit');
      }
    } catch (e) {
      console.error('Error loading certificate eligibility:', e);
    } finally {
      setLoading(false);
    }
  };

  const syncEditFormWithCert = (cert: VerifiableGreatLearningCertificate) => {
    const inferredType: CertificateType = cert.certificateType 
      || (cert.courseCategory?.includes('educator') ? 'educator' 
      : cert.courseCategory?.includes('robotics') || cert.courseId?.includes('robotics') ? 'robotics' 
      : 'programming');

    const inferredRoboticsLevel: RoboticsLevel = cert.roboticsLevel || 1;

    setEditForm({
      studentName: cert.studentName || defaultStudentName || '',
      courseTitle: cert.courseTitle || courseTitle || '',
      certificateType: inferredType,
      roboticsLevel: inferredRoboticsLevel,
      directorName: cert.directorName || 'Harish Subramanian',
      directorTitle: cert.directorTitle || 'Academic Director, YARA Learning Academy',
      organizationName: cert.organizationName || 'YARA Learning Academy',
      directorateSubtitle: cert.directorateSubtitle || 'Academy Directorate of Robotics, Software Engineering & STEM Innovation',
      grade: cert.grade || 'Distinction with Honors',
      score: cert.score ?? 92,
      issueDate: cert.issueDate || new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }),
      certificateNumber: cert.certificateNumber || '',
      instructorName: cert.instructorName || 'Mr. S.O. Manongwa',
      instructorTitle: cert.instructorTitle || 'Founder & Lead Robotics Instructor',
      coSignerName: cert.coSignerName || 'Ms. A.M. Chiambiro',
      coSignerTitle: cert.coSignerTitle || 'Regional President & Evaluation Chair',
      citationText: cert.citationText || '',
      skillsAcquired: (cert.skillsAcquired || []).join(', '),
      sealLabel: cert.sealLabel || 'Official YARA Seal'
    });
  };

  if (!isOpen) return null;

  const handleClaimAndMint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmedName.trim()) return;

    setIsMinting(true);
    try {
      const minted = await claimGreatLearningCertificate({
        userId,
        userEmail,
        confirmedStudentName: confirmedName.trim(),
        courseId,
        courseTitle: courseTitle || eligibility?.courseTitle,
        courseCategory
      });
      setCertificate(minted);
      syncEditFormWithCert(minted);
      setStep('minted');
    } catch (err) {
      console.error('Error minting certificate:', err);
    } finally {
      setIsMinting(false);
    }
  };

  // Compute active real-time certificate with live edits applied
  const activeCert: VerifiableGreatLearningCertificate = certificate ? {
    ...certificate,
    studentName: editForm.studentName.trim() || certificate.studentName,
    courseTitle: editForm.courseTitle.trim() || certificate.courseTitle,
    certificateType: editForm.certificateType,
    roboticsLevel: Number(editForm.roboticsLevel) as RoboticsLevel,
    directorName: editForm.directorName,
    directorTitle: editForm.directorTitle,
    organizationName: editForm.organizationName.trim() || 'YARA Learning Academy',
    directorateSubtitle: editForm.directorateSubtitle.trim() || 'Academy Directorate of Robotics, Software Engineering & STEM Innovation',
    grade: editForm.grade.trim() || certificate.grade,
    score: Number(editForm.score) || certificate.score,
    issueDate: editForm.issueDate.trim() || certificate.issueDate,
    certificateNumber: editForm.certificateNumber.trim() || certificate.certificateNumber,
    instructorName: editForm.instructorName.trim() || certificate.instructorName,
    instructorTitle: editForm.instructorTitle.trim() || certificate.instructorTitle,
    coSignerName: editForm.coSignerName.trim() || certificate.coSignerName,
    coSignerTitle: editForm.coSignerTitle.trim() || certificate.coSignerTitle,
    citationText: editForm.citationText.trim() || certificate.citationText,
    skillsAcquired: editForm.skillsAcquired.trim()
      ? editForm.skillsAcquired.split(',').map(s => s.trim()).filter(Boolean)
      : certificate.skillsAcquired,
    sealLabel: editForm.sealLabel.trim() || 'Official YARA Seal'
  } : null as any;

  const handleSaveEdits = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCert) return;
    setIsSavingEdits(true);
    try {
      const saved = await updateGreatLearningCertificate(activeCert);
      setCertificate(saved);
      syncEditFormWithCert(saved);
      setSaveSuccessMessage('Certificate customized & saved to official registry!');
      setTimeout(() => setSaveSuccessMessage(''), 3500);
    } catch (err: any) {
      console.error('Error saving edits:', err);
    } finally {
      setIsSavingEdits(false);
    }
  };

  const handleResetEdits = () => {
    if (certificate) {
      syncEditFormWithCert(certificate);
    }
  };

  const handleDownloadPdf = async () => {
    if (!certRenderRef.current || !activeCert) return;
    setIsExportingPdf(true);
    try {
      const canvas = await html2canvas(certRenderRef.current, {
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
      pdf.save(`${activeCert.certificateNumber || 'YARA-Certificate'}.pdf`);
    } catch (err) {
      console.error('PDF export error:', err);
      window.print();
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleDownloadPng = async () => {
    if (!certRenderRef.current || !activeCert) return;
    setIsExportingPng(true);
    try {
      const canvas = await html2canvas(certRenderRef.current, {
        scale: 2.5,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });
      const link = document.createElement('a');
      link.download = `${activeCert.certificateNumber || 'YARA-Certificate'}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error('PNG export error:', err);
    } finally {
      setIsExportingPng(false);
    }
  };

  const handleCopyLink = () => {
    if (!activeCert) return;
    navigator.clipboard.writeText(activeCert.verificationUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  const linkedInAddUrl = activeCert ? getLinkedInAddCertificationUrl(activeCert) : '';
  const socialLinks = activeCert ? getSocialShareLinks(activeCert) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-4xl w-full max-h-[94vh] overflow-y-auto p-5 sm:p-8 text-white shadow-2xl relative my-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer z-20"
        >
          <X size={18} />
        </button>

        {/* Great Learning Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                Official Credential
              </span>
              <span className="text-[10px] font-bold text-slate-400">
                YARA Learning Academy Standard
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white mt-0.5">
              Course Certificate of Completion
            </h2>
          </div>
        </div>

        {loading ? (
          <div className="py-20 text-center text-xs text-slate-400">
            <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            Auditing syllabus completion and verification criteria…
          </div>
        ) : step === 'audit' && eligibility && !eligibility.isEligible ? (
          /* STEP 1: CRITERIA CHECKLIST (When not yet eligible) */
          <div className="space-y-6">
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-3">
              <Lock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-sm font-bold text-amber-200 mb-0.5">
                  Certificate Locked: Course Completion Required
                </strong>
                Complete all video lectures, reading modules, and pass the graded assessments with ≥70% score to instantly unlock your shareable certificate.
              </div>
            </div>

            {/* Live Progress Bar */}
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-300">Course Completion Progress</span>
                <span className="font-mono font-bold text-emerald-400">{eligibility.completionPercentage}%</span>
              </div>
              <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${eligibility.completionPercentage}%`,
                    background: 'linear-gradient(90deg, #10b981, #059669, #4f46e5)'
                  }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>{eligibility.completedModules} of {eligibility.totalModules} Lessons Completed</span>
                <span>{eligibility.quizzesPassed} of {eligibility.quizzesTotal} Quizzes Passed</span>
              </div>
            </div>

            {/* 4-Step Checklist */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-start gap-3">
                <div className={`p-1.5 rounded-full mt-0.5 shrink-0 ${eligibility.completedModules >= eligibility.totalModules ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-500'}`}>
                  {eligibility.completedModules >= eligibility.totalModules ? <CheckCircle2 size={16} /> : <Lock size={16} />}
                </div>
                <div>
                  <div className="text-xs font-bold text-white">1. Complete All Lessons</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {eligibility.completedModules} / {eligibility.totalModules} completed
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-start gap-3">
                <div className={`p-1.5 rounded-full mt-0.5 shrink-0 ${eligibility.quizzesTotal === 0 || eligibility.quizzesPassed >= eligibility.quizzesTotal ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-500'}`}>
                  {eligibility.quizzesTotal === 0 || eligibility.quizzesPassed >= eligibility.quizzesTotal ? <CheckCircle2 size={16} /> : <Lock size={16} />}
                </div>
                <div>
                  <div className="text-xs font-bold text-white">2. Pass Graded Quizzes</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {eligibility.quizzesPassed} / {eligibility.quizzesTotal} passed (≥70% mark)
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-start gap-3">
                <div className={`p-1.5 rounded-full mt-0.5 shrink-0 ${eligibility.projectSubmitted ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-500'}`}>
                  {eligibility.projectSubmitted ? <CheckCircle2 size={16} /> : <Lock size={16} />}
                </div>
                <div>
                  <div className="text-xs font-bold text-white">3. Hands-On Project / Lab</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {eligibility.projectSubmitted ? 'Submitted & Cleared' : 'Pending Submission'}
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-start gap-3">
                <div className="p-1.5 rounded-full mt-0.5 shrink-0 bg-emerald-500/20 text-emerald-400">
                  <CheckCircle2 size={16} />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">4. Registered Learner Profile</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">{userEmail}</div>
                </div>
              </div>
            </div>

            {/* Jump into Course action */}
            <div className="flex justify-end pt-2">
              <button
                onClick={() => {
                  onClose();
                  if (onNavigateToCourse) onNavigateToCourse(courseId);
                }}
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black text-xs rounded-xl flex items-center gap-2 transition shadow-lg cursor-pointer"
              >
                <span>Continue Course & Complete Requirements</span>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        ) : step === 'confirm_name' ? (
          /* STEP 2: NAME VERIFICATION */
          <form onSubmit={handleClaimAndMint} className="space-y-6">
            <div className="p-5 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 space-y-2">
              <div className="flex items-center gap-2 font-bold text-indigo-200 text-sm">
                <Award className="w-4 h-4 text-amber-400" />
                Congratulations! You are eligible for this certificate!
              </div>
              <p className="text-xs text-indigo-200/90 leading-relaxed">
                Before your official credential is cryptographically minted, please confirm your <strong>Full Legal Name</strong> exactly as you want it to appear on your verified certificate and LinkedIn accreditation.
              </p>
            </div>

            {/* Name Input Form */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                Full Legal Name on Certificate
              </label>
              <input
                type="text"
                required
                value={confirmedName}
                onChange={e => setConfirmedName(e.target.value)}
                placeholder="e.g. Johnathan Tanaka Doe"
                className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
              <p className="text-[11px] text-slate-400 italic">
                Note: Once minted, this name will be permanently written to the public verification registry.
              </p>
            </div>

            {/* Live Certificate Preview Snippet */}
            <div className="p-5 rounded-2xl bg-slate-950 border border-amber-400/30 text-center space-y-2">
              <div className="text-[10px] uppercase tracking-widest text-amber-400 font-bold">Preview on Certificate</div>
              <div className="text-2xl font-serif font-black text-white tracking-wide">
                {confirmedName.trim() || 'Your Name Here'}
              </div>
              <div className="text-xs text-slate-400">
                Has successfully completed {courseTitle || eligibility?.courseTitle}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isMinting || !confirmedName.trim()}
                className="px-6 py-2.5 rounded-xl text-slate-950 text-xs font-black transition flex items-center gap-2 shadow-lg disabled:opacity-50 cursor-pointer"
                style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}
              >
                <ShieldCheck size={14} />
                <span>{isMinting ? 'Minting Credential…' : 'Mint Official Certificate'}</span>
              </button>
            </div>
          </form>
        ) : (
          /* STEP 3 & 4: MINTED CERTIFICATE & GREAT LEARNING 1-CLICK SHARING SUITE */
          <div className="space-y-6">
            {/* Quick Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-slate-950 border border-slate-800 rounded-2xl">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-mono font-bold text-slate-300">
                  ID: <span className="text-amber-400">{activeCert?.certificateNumber}</span>
                </span>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {/* Live Customizer Toggle */}
                <button
                  type="button"
                  onClick={() => setIsEditingCert(!isEditingCert)}
                  className={`px-3.5 py-2 text-xs font-bold rounded-xl flex items-center gap-1.5 transition cursor-pointer border ${
                    isEditingCert 
                      ? 'bg-amber-400 text-slate-950 border-amber-300 font-black shadow-md' 
                      : 'bg-slate-800 hover:bg-slate-700 text-amber-300 border-amber-400/30'
                  }`}
                  title="Customize student name, titles, dates, signatures, grade, and citations on this certificate"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>{isEditingCert ? 'Hide Customizer' : 'Edit Certificate'}</span>
                </button>

                {/* 1-Click Add to LinkedIn */}
                <a
                  href={linkedInAddUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 bg-[#0077b5] hover:bg-[#006097] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition shadow-sm"
                  title="Add this certificate directly to your LinkedIn Profile credentials section"
                >
                  <Linkedin className="w-3.5 h-3.5" />
                  <span>Add to LinkedIn</span>
                </a>

                {/* Download PDF */}
                <button
                  onClick={handleDownloadPdf}
                  disabled={isExportingPdf}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-xs font-bold rounded-xl flex items-center gap-1.5 transition shadow-sm cursor-pointer disabled:opacity-50"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{isExportingPdf ? 'Generating PDF…' : 'Download PDF'}</span>
                </button>

                {/* Download Image (PNG) */}
                <button
                  onClick={handleDownloadPng}
                  disabled={isExportingPng}
                  className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>{isExportingPng ? 'Saving…' : 'PNG'}</span>
                </button>

                {/* Copy Link */}
                <button
                  onClick={handleCopyLink}
                  className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl flex items-center gap-1.5 transition cursor-pointer"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
                </button>
              </div>
            </div>

            {/* LIVE CERTIFICATE CUSTOMIZER DRAWER */}
            {isEditingCert && (
              <form onSubmit={handleSaveEdits} className="p-6 rounded-3xl bg-slate-950 border border-amber-400/40 shadow-2xl space-y-5">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-amber-400" />
                    <h4 className="text-sm font-black text-white uppercase tracking-wider">
                      Live Certificate Customizer
                    </h4>
                    <span className="text-[10px] text-amber-300 font-bold bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20">
                      Real-Time Canvas Sync
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleResetEdits}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold flex items-center gap-1 transition"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Reset</span>
                    </button>
                    <button
                      type="submit"
                      disabled={isSavingEdits}
                      className="px-4 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black flex items-center gap-1.5 transition shadow-sm disabled:opacity-50 cursor-pointer"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>{isSavingEdits ? 'Saving…' : 'Save Changes'}</span>
                    </button>
                  </div>
                </div>

                {saveSuccessMessage && (
                  <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs font-bold flex items-center gap-2">
                    <CheckCircle2 size={16} />
                    <span>{saveSuccessMessage}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-left">
                  {/* Certificate Classification Type */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-amber-300 uppercase tracking-wider block">
                      Certificate Classification
                    </label>
                    <select
                      value={editForm.certificateType}
                      onChange={e => setEditForm({ ...editForm, certificateType: e.target.value as CertificateType })}
                      className="w-full px-3 py-2 bg-slate-900 border border-amber-500/50 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-amber-400"
                    >
                      <option value="robotics">Robotics & STEM Certificate</option>
                      <option value="programming">Professional Programming Certificate</option>
                      <option value="educator">AI for Educators Professional Accreditation</option>
                    </select>
                  </div>

                  {/* Robotics Progression Tier (Only if Robotics) */}
                  {editForm.certificateType === 'robotics' && (
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-amber-300 uppercase tracking-wider block">
                        Robotics Progression Tier (1–4)
                      </label>
                      <select
                        value={editForm.roboticsLevel}
                        onChange={e => setEditForm({ ...editForm, roboticsLevel: Number(e.target.value) as RoboticsLevel })}
                        className="w-full px-3 py-2 bg-slate-900 border border-amber-500/50 rounded-xl text-xs font-bold text-emerald-400 focus:outline-none focus:border-amber-400"
                      >
                        <option value={1}>Level 1: Absolute Beginner or Explorer</option>
                        <option value={2}>Level 2: Intermediate Learner</option>
                        <option value={3}>Level 3: Advanced Learner</option>
                        <option value={4}>Level 4: Robotics Masterclass for Real World Applications and Deployment</option>
                      </select>
                    </div>
                  )}

                  {/* Recipient Name */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                      Student / Recipient Name
                    </label>
                    <input
                      type="text"
                      value={editForm.studentName}
                      onChange={e => setEditForm({ ...editForm, studentName: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-amber-400"
                      placeholder="e.g. Tendai M. Moyo"
                    />
                  </div>

                  {/* Course Title */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                      Course / Program Title
                    </label>
                    <input
                      type="text"
                      value={editForm.courseTitle}
                      onChange={e => setEditForm({ ...editForm, courseTitle: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-bold text-amber-300 focus:outline-none focus:border-amber-400"
                      placeholder="e.g. Autonomous Robotics & Embedded Systems"
                    />
                  </div>

                  {/* Credential Number */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                      Credential ID
                    </label>
                    <input
                      type="text"
                      value={editForm.certificateNumber}
                      onChange={e => setEditForm({ ...editForm, certificateNumber: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono font-bold text-white focus:outline-none focus:border-amber-400"
                      placeholder="GLA-YARA-2026-XXXXXX"
                    />
                  </div>

                  {/* Issue Date */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                      Issue Date
                    </label>
                    <input
                      type="text"
                      value={editForm.issueDate}
                      onChange={e => setEditForm({ ...editForm, issueDate: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-amber-400"
                      placeholder="e.g. October 4, 2026"
                    />
                  </div>

                  {/* Academic Director Name */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                      Academic Director Name
                    </label>
                    <input
                      type="text"
                      value={editForm.directorName}
                      onChange={e => setEditForm({ ...editForm, directorName: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-amber-400"
                      placeholder="e.g. Harish Subramanian"
                    />
                  </div>

                  {/* Academic Director Title */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                      Academic Director Title
                    </label>
                    <input
                      type="text"
                      value={editForm.directorTitle}
                      onChange={e => setEditForm({ ...editForm, directorTitle: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-amber-400"
                      placeholder="e.g. Academic Director, YARA Learning Academy"
                    />
                  </div>

                  {/* Co-Signer Name */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                      Co-Signer / Dean Name
                    </label>
                    <input
                      type="text"
                      value={editForm.coSignerName}
                      onChange={e => setEditForm({ ...editForm, coSignerName: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-amber-400"
                      placeholder="e.g. Ms. A.M. Chiambiro"
                    />
                  </div>

                  {/* Co-Signer Title */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                      Co-Signer Title
                    </label>
                    <input
                      type="text"
                      value={editForm.coSignerTitle}
                      onChange={e => setEditForm({ ...editForm, coSignerTitle: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-amber-400"
                      placeholder="e.g. Regional President"
                    />
                  </div>

                  {/* Citation text */}
                  <div className="space-y-1 md:col-span-2 lg:col-span-3">
                    <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                      Citation / Certification Statement Text (Leave empty for intelligent default)
                    </label>
                    <textarea
                      rows={2}
                      value={editForm.citationText}
                      onChange={e => setEditForm({ ...editForm, citationText: e.target.value })}
                      placeholder="Optional custom citation text on certificate..."
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-medium text-white focus:outline-none focus:border-amber-400 leading-relaxed"
                    />
                  </div>
                </div>
              </form>
            )}

            {/* PRESTIGIOUS HIGH-DEFINITION WHITE CANVAS CERTIFICATE (Matching Official Template) */}
            <div className="flex justify-center overflow-x-auto p-1 bg-slate-950/60 rounded-3xl border border-slate-800">
              <YaraAccreditedCertificateCanvas
                innerRef={certRenderRef}
                data={{
                  certificateNumber: activeCert?.certificateNumber || 'GLA-YARA-2026-000000',
                  studentName: activeCert?.studentName || 'Recipient Name',
                  courseTitle: activeCert?.courseTitle || 'Robotics & STEM Engineering',
                  certificateType: (editForm.certificateType as CertificateType) || 'robotics',
                  roboticsLevel: (Number(editForm.roboticsLevel) as RoboticsLevel) || 1,
                  issueDate: activeCert?.issueDate || 'October 04, 2026',
                  verificationUrl: activeCert?.verificationUrl || `https://yara.org/verify-certificate?id=${activeCert?.certificateNumber}`,
                  directorName: editForm.directorName || 'Harish Subramanian',
                  directorTitle: editForm.directorTitle || 'Academic Director, YARA Learning Academy',
                  organizationName: editForm.organizationName || 'YARA Learning Academy',
                  citationText: editForm.citationText,
                  grade: activeCert?.grade,
                  score: activeCert?.score,
                  skillsAcquired: activeCert?.skillsAcquired,
                  coSignerName: editForm.coSignerName,
                  coSignerTitle: editForm.coSignerTitle
                }}
              />
            </div>

            {/* Social Share Callout */}
            {socialLinks && (
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-xs text-slate-300">
                  <strong className="text-white block">Share your achievement with your network</strong>
                  Celebrate this milestone on your social profiles.
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={socialLinks.linkedInFeed}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-xl bg-slate-800 hover:bg-[#0077b5] text-slate-300 hover:text-white transition"
                    title="Share on LinkedIn Feed"
                  >
                    <Linkedin size={16} />
                  </a>
                  <a
                    href={socialLinks.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-xl bg-slate-800 hover:bg-[#1da1f2] text-slate-300 hover:text-white transition"
                    title="Share on X (Twitter)"
                  >
                    <Twitter size={16} />
                  </a>
                  <a
                    href={socialLinks.whatsApp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-xl bg-slate-800 hover:bg-[#25d366] text-slate-300 hover:text-white transition"
                    title="Share via WhatsApp"
                  >
                    <Send size={16} />
                  </a>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
