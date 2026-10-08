import React, { useState, useEffect, useRef } from 'react';
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
  ChevronRight,
  Linkedin,
  FileCheck2,
  FileText,
  Cpu
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { CertificateEligibilityCheck } from '../../../types/yaraLms';
import { Certificate } from '../../../types/curriculum';
import { ProgrammingCertificate } from '../../../types/lmsCourseTypes';
import { COURSE_CATEGORY_LABELS, COURSE_CATEGORY_COLORS } from '../../../types/lmsCourseTypes';
import { 
  checkCertificateEligibility, 
  issueOrGetCertificate, 
  isCertificateUnlockedByAdmin 
} from '../../../services/yaraLmsService';
import { 
  getAllUserProgrammingCertificates, 
  getAllCourses 
} from '../../../services/programmingCoursesService';
import { 
  getAllUnifiedCertificates, 
  VerifiableGreatLearningCertificate,
  evaluateGreatLearningCourseEligibility,
  getLinkedInAddCertificationUrl
} from '../../../services/greatLearningCertService';
import { useAuth } from '../../AuthContext';
import { CertificateUnlockAdminManager } from '../../admin/CertificateUnlockAdminManager';
import { GreatLearningCertificateModal } from '../GreatLearningCertificateModal';
import { ASSETS } from '../../../constants/assets';

interface Props {
  userId: string;
  studentName: string;
  userEmail: string;
  onNavigateTab: (tab: any) => void;
}

const CopiedCheck: React.FC<{ copied: boolean }> = ({ copied }) =>
  copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />;

export const CertificatesTab: React.FC<Props> = ({
  userId,
  studentName,
  userEmail,
  onNavigateTab
}) => {
  const { profile } = useAuth();
  const isAdmin = profile?.role === 'admin' || profile?.email === 'manongwasimbarashe394@gmail.com' || profile?.email === 'goyaracorp@gmail.com';

  const [loading, setLoading] = useState(true);
  const [unifiedCerts, setUnifiedCerts] = useState<VerifiableGreatLearningCertificate[]>([]);
  const [programmingCerts, setProgrammingCerts] = useState<ProgrammingCertificate[]>([]);
  const [legacyCert, setLegacyCert] = useState<Certificate | null>(null);

  // In-progress tracks eligibility
  const [roboticsEligibility, setRoboticsEligibility] = useState<any>(null);
  const [pythonEligibility, setPythonEligibility] = useState<any>(null);

  // Modal claim trigger
  const [modalCourseId, setModalCourseId] = useState<string | null>(null);
  const [modalCourseTitle, setModalCourseTitle] = useState<string>('');

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [exportingCertId, setExportingCertId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [userId, userEmail]);

  const loadData = async () => {
    setLoading(true);
    try {
      // 1. Load Unified Great Learning Certificates
      const allUnified = getAllUnifiedCertificates().filter(c => c.userId === userId);
      setUnifiedCerts(allUnified);

      // 2. Load Programming Certificates
      const progCerts = getAllUserProgrammingCertificates(userId);
      setProgrammingCerts(progCerts);

      // 3. Load Robotics Foundation Eligibility
      const robElig = await evaluateGreatLearningCourseEligibility(userId, userEmail, 'robotics-foundation');
      setRoboticsEligibility(robElig);

      // 4. Load Python course eligibility if available
      const courses = getAllCourses();
      const pythonCourse = courses.find(c => c.category === 'python') || courses[0];
      if (pythonCourse) {
        const pyElig = await evaluateGreatLearningCourseEligibility(userId, userEmail, pythonCourse.id);
        setPythonEligibility(pyElig);
      }
    } catch (e) {
      console.error('Cert check error:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleShareLink = (certNumber: string) => {
    const origin = window.location.origin;
    const url = `${origin}/verify-certificate?id=${certNumber}`;
    navigator.clipboard.writeText(url);
    setCopiedId(certNumber);
    setTimeout(() => setCopiedId(null), 3000);
  };

  const handleDownloadPdf = async (certNumber: string) => {
    const el = document.getElementById(`cert-card-${certNumber}`);
    if (!el) {
      setTimeout(() => window.print(), 50);
      return;
    }
    setExportingCertId(certNumber);
    // CRITICAL FOR INP: Yield to the paint loop so React renders loading state immediately
    await new Promise(resolve => requestAnimationFrame(() => setTimeout(resolve, 0)));
    try {
      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#090d16'
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
      pdf.save(`${certNumber}.pdf`);
    } catch (err) {
      console.error('PDF export error:', err);
      setTimeout(() => window.print(), 50);
    } finally {
      setExportingCertId(null);
    }
  };

  const handleOpenClaimModal = (courseId: string, title: string) => {
    setModalCourseId(courseId);
    setModalCourseTitle(title);
  };

  const totalEarned = unifiedCerts.length + programmingCerts.length;

  return (
    <div className="space-y-8 pb-12">
      {/* ─── Admin Certification Council Panel ─────────────────────────────────── */}
      {isAdmin && (
        <div className="border border-amber-500/30 rounded-3xl p-4 sm:p-6 bg-slate-900/90 shadow-2xl">
          <CertificateUnlockAdminManager />
        </div>
      )}

      {/* ─── Great Learning Academy Hero Header ───────────────────────────────── */}
      <div 
        className="relative overflow-hidden rounded-3xl text-white border border-slate-800 p-6 sm:p-10 shadow-2xl"
        style={{ background: 'linear-gradient(135deg, #090e1a 0%, #171d3d 50%, #0d281e 100%)' }}
      >
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-20 blur-3xl pointer-events-none" style={{ background: '#f59e0b' }} />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 rounded-full opacity-15 blur-3xl pointer-events-none" style={{ background: '#10b981' }} />

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold">
              <Award className="w-3.5 h-3.5" /> YARA Learning Academy Credential Standard
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              My Certifications & Credentials
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Every course you complete unlocks an accredited, verifiable certificate co-signed by YARA and academic partners. Download high-resolution PDFs or add directly to your LinkedIn profile with 1 click.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-slate-950/60 border border-white/10 rounded-2xl p-4 backdrop-blur-md shrink-0">
            <div className="text-center">
              <div className="text-4xl font-black text-amber-400">{totalEarned}</div>
              <div className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Earned</div>
            </div>
            <div className="h-10 w-px bg-slate-800" />
            <div>
              <a
                href="/verify"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
              >
                <span>Verify Registry</span>
                <ExternalLink size={12} />
              </a>
              <div className="text-[10px] text-slate-500 mt-0.5">Publicly verifiable</div>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-16 text-center text-xs text-slate-500">
          <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          Auditing course certifications and official credentials…
        </div>
      ) : (
        <div className="space-y-10">
          {/* ─── Section 1: In-Progress Tracks & Certificate Readiness ──────────── */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <Award className="w-4 h-4 text-emerald-600" />
                  Course Completion & Certificate Eligibility
                </h2>
                <p className="text-xs text-slate-500">
                  Track your real-time criteria progress to unlock and claim your credentials.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Robotics Foundation Card */}
              {roboticsEligibility && (
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4 flex flex-col justify-between hover:shadow-md transition">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 border border-emerald-200">
                        Flagship Track • Levels 0–8
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-900">
                        {roboticsEligibility.completionPercentage}% Done
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900">{roboticsEligibility.courseTitle}</h3>

                    {/* Progress Bar */}
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden my-3">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${roboticsEligibility.completionPercentage}%`,
                          background: 'linear-gradient(90deg, #10b981, #059669)'
                        }}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600">
                      <div>• {roboticsEligibility.completedModules}/{roboticsEligibility.totalModules} Sessions Complete</div>
                      <div>• {roboticsEligibility.quizzesPassed}/{roboticsEligibility.quizzesTotal} Quizzes Passed</div>
                      <div>• Practical Labs Verified</div>
                      <div>• Capstone Submission Required</div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500">
                      {roboticsEligibility.isEligible ? 'Ready to Claim' : 'In Progress'}
                    </span>
                    <button
                      onClick={() => handleOpenClaimModal('robotics-foundation', roboticsEligibility.courseTitle)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                        roboticsEligibility.isEligible
                          ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black shadow-md'
                          : 'bg-slate-900 hover:bg-slate-800 text-white'
                      }`}
                    >
                      <Award size={13} />
                      <span>{roboticsEligibility.isEligible ? 'Claim Certificate' : 'View Criteria'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Python Course Card */}
              {pythonEligibility && (
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4 flex flex-col justify-between hover:shadow-md transition">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-indigo-100 text-indigo-800 border border-indigo-200">
                        Programming Specialization
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-900">
                        {pythonEligibility.completionPercentage}% Done
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900">{pythonEligibility.courseTitle}</h3>

                    {/* Progress Bar */}
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden my-3">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${pythonEligibility.completionPercentage}%`,
                          background: 'linear-gradient(90deg, #4f46e5, #059669)'
                        }}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600">
                      <div>• {pythonEligibility.completedModules}/{pythonEligibility.totalModules} Modules Finished</div>
                      <div>• {pythonEligibility.quizzesPassed}/{pythonEligibility.quizzesTotal} Quizzes Cleared</div>
                      <div>• Pass mark: 70%+</div>
                      <div>• Instant PDF Certificate</div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500">
                      {pythonEligibility.isEligible ? 'Ready to Claim' : 'In Progress'}
                    </span>
                    <button
                      onClick={() => handleOpenClaimModal(pythonEligibility.courseId, pythonEligibility.courseTitle)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                        pythonEligibility.isEligible
                          ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black shadow-md'
                          : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                      }`}
                    >
                      <Award size={13} />
                      <span>{pythonEligibility.isEligible ? 'Claim Certificate' : 'View Criteria'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ─── Section 2: Earned Verifiable Certificates ───────────────────────── */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-500" />
                  Earned & Verified Credentials ({totalEarned})
                </h2>
                <p className="text-xs text-slate-500">
                  Official certificates issued in your name with 1-click LinkedIn Add to Profile.
                </p>
              </div>
            </div>

            {totalEarned === 0 ? (
              <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center space-y-3">
                <GraduationCap className="w-12 h-12 text-slate-300 mx-auto" />
                <div>
                  <h3 className="text-base font-bold text-slate-700">No Certificates Earned Yet</h3>
                  <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
                    Complete all modules and clear the graded quizzes with ≥70% score on any course to instantly generate your accredited certificate.
                  </p>
                </div>
                <button
                  onClick={() => onNavigateTab('courses')}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition inline-flex items-center gap-1.5 shadow-sm"
                >
                  <BookOpen size={14} />
                  <span>Start Learning Now</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 1. Unified Minted Certificates */}
                {unifiedCerts.map(cert => {
                  const linkedInUrl = getLinkedInAddCertificationUrl(cert);
                  const isCopied = copiedId === cert.certificateNumber;
                  const isExporting = exportingCertId === cert.certificateNumber;

                  return (
                    <div 
                      key={cert.id}
                      className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-lg transition-all flex flex-col justify-between group"
                    >
                      {/* Certificate Visual Banner */}
                      <div 
                        id={`cert-card-${cert.certificateNumber}`}
                        className="p-6 text-white relative overflow-hidden text-center"
                        style={{ background: 'linear-gradient(135deg, #090e1a, #1a1e3a)' }}
                      >
                        <div className="absolute top-0 right-0 w-40 h-40 rounded-full blur-2xl opacity-20 bg-amber-400 pointer-events-none" />

                        <div className="w-12 h-12 rounded-2xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center mx-auto text-amber-400 mb-3 shadow-md">
                          <Award size={26} />
                        </div>

                        <div className="text-[9px] uppercase tracking-[0.25em] font-black text-amber-400 mb-1">
                          Young Africans Robotics Association
                        </div>
                        <h4 className="text-sm font-serif font-black text-white line-clamp-2">
                          {cert.courseTitle}
                        </h4>
                        <div className="text-xs font-serif italic text-slate-300 mt-2">
                          Awarded to <strong className="text-white font-sans">{cert.studentName}</strong>
                        </div>

                        <div className="inline-block bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 px-3 py-0.5 rounded-full text-[10px] font-bold mt-2">
                          {cert.grade} ({cert.score}%)
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                          <span>{cert.issueDate}</span>
                          <span className="text-amber-400 font-bold">{cert.certificateNumber}</span>
                        </div>
                      </div>

                      {/* Card Actions & Sharing Suite */}
                      <div className="p-5 space-y-3 bg-slate-50/50">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-500">Verification Status:</span>
                          <span className="inline-flex items-center gap-1 text-emerald-700 font-bold">
                            <CheckCircle2 size={13} /> Verified Authentic
                          </span>
                        </div>

                        {/* Great Learning Action Buttons */}
                        <div className="grid grid-cols-2 gap-2 pt-1">
                          {/* 1-Click Add to LinkedIn */}
                          <a
                            href={linkedInUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="py-2.5 px-3 bg-[#0077b5] hover:bg-[#006097] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition shadow-xs"
                          >
                            <Linkedin size={14} />
                            <span>Add to LinkedIn</span>
                          </a>

                          {/* Download PDF */}
                          <button
                            onClick={() => handleDownloadPdf(cert.certificateNumber)}
                            disabled={isExporting}
                            className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition shadow-xs cursor-pointer disabled:opacity-50"
                          >
                            <Download size={14} />
                            <span>{isExporting ? 'Exporting…' : 'Download PDF'}</span>
                          </button>
                        </div>

                        <div className="flex items-center gap-2 pt-1">
                          <button
                            onClick={() => handleShareLink(cert.certificateNumber)}
                            className="flex-1 py-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition"
                          >
                            <CopiedCheck copied={isCopied} />
                            <span>{isCopied ? 'Link Copied!' : 'Copy Share Link'}</span>
                          </button>
                          <a
                            href={cert.verificationUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl transition"
                            title="Open public verification page"
                          >
                            <ExternalLink size={14} />
                          </a>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* 2. Programming Certificates */}
                {programmingCerts.map(cert => {
                  const isCopied = copiedId === cert.certificateNumber;
                  const isExporting = exportingCertId === cert.certificateNumber;
                  const colors = COURSE_CATEGORY_COLORS[cert.courseCategory];

                  const dummyCertObj: VerifiableGreatLearningCertificate = {
                    id: cert.id,
                    certificateNumber: cert.certificateNumber,
                    userId: cert.userId,
                    studentName: cert.studentName,
                    userEmail: '',
                    courseId: cert.courseId,
                    courseTitle: cert.courseTitle,
                    courseCategory: cert.courseCategory,
                    grade: cert.grade,
                    score: cert.score,
                    issueDate: cert.issueDate,
                    verificationUrl: `${window.location.origin}/verify-certificate?id=${cert.certificateNumber}`,
                    skillsAcquired: [cert.courseCategory.toUpperCase(), 'Software Engineering', 'Code Logic'],
                    instructorName: 'Mr. S.O. Manongwa',
                    instructorTitle: 'Founder & Lead Instructor',
                    coSignerName: 'Ms. A.M. Chiambiro',
                    coSignerTitle: 'Regional President',
                    credentialType: 'programming'
                  };

                  const linkedInUrl = getLinkedInAddCertificationUrl(dummyCertObj);

                  return (
                    <div 
                      key={cert.id}
                      className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-lg transition-all flex flex-col justify-between group"
                    >
                      <div 
                        id={`cert-card-${cert.certificateNumber}`}
                        className="p-6 text-white relative overflow-hidden text-center"
                        style={{ background: 'linear-gradient(135deg, #090e1a, #1e1b4b)' }}
                      >
                        <div className="w-12 h-12 rounded-2xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center mx-auto text-amber-400 mb-3 shadow-md">
                          <Code2 size={26} />
                        </div>

                        <span className={`inline-block badge ${colors.bg} ${colors.text} ${colors.border} border text-[9px] mb-2`}>
                          {COURSE_CATEGORY_LABELS[cert.courseCategory]}
                        </span>
                        <h4 className="text-sm font-serif font-black text-white line-clamp-2">
                          {cert.courseTitle}
                        </h4>
                        <div className="text-xs font-serif italic text-slate-300 mt-2">
                          Awarded to <strong className="text-white font-sans">{cert.studentName}</strong>
                        </div>

                        <div className="inline-block bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 px-3 py-0.5 rounded-full text-[10px] font-bold mt-2">
                          {cert.grade} ({cert.score}%)
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                          <span>{cert.issueDate}</span>
                          <span className="text-amber-400 font-bold">{cert.certificateNumber}</span>
                        </div>
                      </div>

                      <div className="p-5 space-y-3 bg-slate-50/50">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-500">Accredited Standing:</span>
                          <span className="inline-flex items-center gap-1 text-emerald-700 font-bold">
                            <CheckCircle2 size={13} /> Verified by YARA Academy
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 pt-1">
                          <a
                            href={linkedInUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="py-2.5 px-3 bg-[#0077b5] hover:bg-[#006097] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition shadow-xs"
                          >
                            <Linkedin size={14} />
                            <span>Add to LinkedIn</span>
                          </a>

                          <button
                            onClick={() => handleDownloadPdf(cert.certificateNumber)}
                            disabled={isExporting}
                            className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition shadow-xs cursor-pointer disabled:opacity-50"
                          >
                            <Download size={14} />
                            <span>{isExporting ? 'Exporting…' : 'Download PDF'}</span>
                          </button>
                        </div>

                        <div className="flex items-center gap-2 pt-1">
                          <button
                            onClick={() => handleShareLink(cert.certificateNumber)}
                            className="flex-1 py-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition"
                          >
                            <CopiedCheck copied={isCopied} />
                            <span>{isCopied ? 'Link Copied!' : 'Copy Share Link'}</span>
                          </button>
                          <a
                            href={`${window.location.origin}/verify-certificate?id=${cert.certificateNumber}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl transition"
                          >
                            <ExternalLink size={14} />
                          </a>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── Great Learning Certificate Claim Modal ─────────────────────────────── */}
      {modalCourseId && (
        <GreatLearningCertificateModal
          isOpen={true}
          onClose={() => {
            setModalCourseId(null);
            loadData();
          }}
          userId={userId}
          userEmail={userEmail}
          defaultStudentName={studentName}
          courseId={modalCourseId}
          courseTitle={modalCourseTitle}
          onNavigateToCourse={() => onNavigateTab('courses')}
        />
      )}
    </div>
  );
};
