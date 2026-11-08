import React, { useState, useEffect } from 'react';
import { 
  Award, 
  CheckCircle2, 
  Lock, 
  Download, 
  ExternalLink, 
  ShieldCheck, 
  Copy, 
  Check, 
  BookOpen, 
  Linkedin, 
  GraduationCap,
  Code2,
  Sparkles,
  Loader2
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { ProgrammingCertificate } from '../../../types/lmsCourseTypes';
import { COURSE_CATEGORY_LABELS, COURSE_CATEGORY_COLORS } from '../../../types/lmsCourseTypes';
import { 
  getAllUserProgrammingCertificates 
} from '../../../services/programmingCoursesService';
import { 
  getAllUnifiedCertificates, 
  VerifiableGreatLearningCertificate,
  getLinkedInAddCertificationUrl
} from '../../../services/greatLearningCertService';
import { 
  fetchCoursesFromDatabase, 
  getAllCourses, 
  getEnrollment 
} from '../../../services/unifiedCourseService';
import { UnifiedCourse } from '../../../types/unifiedCourseTypes';
import { useAuth } from '../../AuthContext';
import { CertificateUnlockAdminManager } from '../../admin/CertificateUnlockAdminManager';
import { GreatLearningCertificateModal } from '../GreatLearningCertificateModal';

interface Props {
  userId: string;
  studentName: string;
  userEmail: string;
  onNavigateTab: (tab: any) => void;
  isAdmin?: boolean;
}

const CopiedCheck: React.FC<{ copied: boolean }> = ({ copied }) =>
  copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />;

interface CourseEligibilityItem {
  courseId: string;
  courseTitle: string;
  track: string;
  level: string;
  completionPercentage: number;
  totalModules: number;
  completedModules: number;
  quizzesTotal: number;
  quizzesPassed: number;
  isEligible: boolean;
  isClaimed: boolean;
}

export const CertificatesTab: React.FC<Props> = ({
  userId,
  studentName,
  userEmail,
  onNavigateTab,
  isAdmin = false
}) => {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [unifiedCerts, setUnifiedCerts] = useState<VerifiableGreatLearningCertificate[]>([]);
  const [programmingCerts, setProgrammingCerts] = useState<ProgrammingCertificate[]>([]);
  const [courses, setCourses] = useState<UnifiedCourse[]>([]);
  const [courseEligibilities, setCourseEligibilities] = useState<CourseEligibilityItem[]>([]);

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
      // 1. Load Earned Certificates
      const allUnified = getAllUnifiedCertificates().filter(c => c.userId === userId);
      setUnifiedCerts(allUnified);

      const progCerts = getAllUserProgrammingCertificates(userId);
      setProgrammingCerts(progCerts);

      // 2. Load Real Published Courses from Database
      let dbCourses: UnifiedCourse[] = [];
      try {
        dbCourses = await fetchCoursesFromDatabase();
      } catch {
        dbCourses = getAllCourses();
      }

      const activePublished = (dbCourses || []).filter(c => c.isPublished !== false);
      setCourses(activePublished);

      // 3. Dynamically evaluate real criteria for published courses
      const eligList: CourseEligibilityItem[] = activePublished.map(course => {
        const enrollment = getEnrollment(userId, course.id);
        const totalMods = course.modules?.length || course.totalModulesCount || 1;
        const completedModIds = enrollment?.completedModuleIds || [];
        const completedCount = completedModIds.length;
        const pct = totalMods > 0 ? Math.min(100, Math.round((completedCount / totalMods) * 100)) : 0;

        const quizMods = (course.modules || []).filter(
          m => m.type === 'quiz' || (m.quizQuestions && m.quizQuestions.length > 0)
        );
        const quizzesTotal = quizMods.length;
        let quizzesPassed = 0;
        quizMods.forEach(m => {
          const score = enrollment?.quizScores?.[m.id];
          if (score !== undefined && score >= 70) {
            quizzesPassed++;
          }
        });

        const isEligible = totalMods > 0 && completedCount >= totalMods && (quizzesTotal === 0 || quizzesPassed >= quizzesTotal);
        const isClaimed = allUnified.some(c => c.courseId === course.id);

        return {
          courseId: course.id,
          courseTitle: course.title,
          track: course.track || 'Robotics',
          level: course.level || 'Beginner',
          completionPercentage: pct,
          totalModules: totalMods,
          completedModules: completedCount,
          quizzesTotal,
          quizzesPassed,
          isEligible,
          isClaimed
        };
      });

      setCourseEligibilities(eligList);
    } catch (e) {
      console.error('Certificates data load error:', e);
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
  const hasPublishedCourses = courses.length > 0;

  return (
    <div className="space-y-6 pb-12">
      {/* Admin Certification Council Panel */}
      {isAdmin && (
        <div className="border border-amber-500/30 rounded-3xl p-4 sm:p-6 bg-slate-900/90 shadow-2xl">
          <CertificateUnlockAdminManager />
        </div>
      )}

      {/* Clean Simple Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1.5 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
            <Award className="w-3.5 h-3.5" />
            <span>YARA Credential Standard</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            My Certifications &amp; Credentials
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 font-normal">
            Verifiable digital certificates and accredited STEM credentials co-signed by YARA.
          </p>
        </div>

        <div className="flex items-center gap-4 bg-slate-950/80 border border-slate-800 rounded-2xl p-4 shrink-0 shadow-xs">
          <div className="text-center">
            <div className="text-3xl sm:text-4xl font-black text-amber-400 font-mono">{totalEarned}</div>
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Earned</div>
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

      {loading ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-16 text-center shadow-xs">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mx-auto mb-3" />
          <p className="text-xs font-bold text-slate-700">Loading certificate records from database...</p>
        </div>
      ) : !hasPublishedCourses && totalEarned === 0 ? (
        /* Clean Empty State when no courses have been published */
        <div className="bg-white border border-dashed border-slate-200 rounded-3xl p-16 text-center shadow-xs space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
            <Award className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">No Certificates or Enrolled Courses Yet</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
              The Academy is currently clean and ready to receive uploaded courses. Once you publish courses and complete them, your certificate eligibility and verified credentials will appear here.
            </p>
          </div>
          {isAdmin && (
            <button
              onClick={() => onNavigateTab('admin-center')}
              className="mt-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition inline-flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <span>Open Admin LMS Studio</span>
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-8">
          {/* Section 1: In-Progress Tracks & Certificate Readiness (Rendered ONLY when real courses exist) */}
          {hasPublishedCourses && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
                    <Award className="w-4 h-4 text-emerald-600" />
                    <span>Course Completion &amp; Certificate Eligibility</span>
                  </h2>
                  <p className="text-xs text-slate-500">
                    Real-time criteria progress to unlock and claim your credentials.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {courseEligibilities.map(item => (
                  <div
                    key={item.courseId}
                    className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4 flex flex-col justify-between hover:shadow-md transition"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-slate-100 text-slate-800 border border-slate-200">
                          {item.track} · {item.level}
                        </span>
                        <span className="text-xs font-mono font-bold text-slate-900">
                          {item.completionPercentage}% Done
                        </span>
                      </div>

                      <h3 className="text-sm font-bold text-slate-900">{item.courseTitle}</h3>

                      {/* Progress Bar */}
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden my-3">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${item.completionPercentage}%`,
                            background: item.isEligible ? '#059669' : '#4f46e5'
                          }}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600">
                        <div>• {item.completedModules}/{item.totalModules} Modules Complete</div>
                        <div>
                          • {item.quizzesTotal > 0 ? `${item.quizzesPassed}/${item.quizzesTotal} Quizzes Passed` : 'Knowledge checks ready'}
                        </div>
                        <div>• Pass mark: 70%+</div>
                        <div>• Verifiable Digital Certificate</div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-500">
                        {item.isClaimed ? 'Claimed' : item.isEligible ? 'Ready to Claim' : 'In Progress'}
                      </span>
                      <button
                        onClick={() => handleOpenClaimModal(item.courseId, item.courseTitle)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                          item.isEligible
                            ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black shadow-md'
                            : 'bg-slate-900 hover:bg-slate-800 text-white'
                        }`}
                      >
                        <Award size={13} />
                        <span>{item.isClaimed ? 'View Certificate' : item.isEligible ? 'Claim Certificate' : 'View Criteria'}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 2: Earned Verifiable Certificates */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-500" />
                  <span>Earned &amp; Verified Credentials ({totalEarned})</span>
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
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition inline-flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <BookOpen size={14} />
                  <span>Start Learning Now</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Unified Minted Certificates */}
                {unifiedCerts.map(cert => {
                  const linkedInUrl = getLinkedInAddCertificationUrl(cert);
                  const isCopied = copiedId === cert.certificateNumber;
                  const isExporting = exportingCertId === cert.certificateNumber;

                  return (
                    <div 
                      key={cert.id}
                      className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-lg transition-all flex flex-col justify-between group"
                    >
                      <div 
                        id={`cert-card-${cert.certificateNumber}`}
                        className="p-6 text-white relative overflow-hidden text-center"
                        style={{ background: 'linear-gradient(135deg, #090e1a, #1a1e3a)' }}
                      >
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

                      <div className="p-5 space-y-3 bg-slate-50/50">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-500">Verification Status:</span>
                          <span className="inline-flex items-center gap-1 text-emerald-700 font-bold">
                            <CheckCircle2 size={13} /> Verified Authentic
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
                            className="flex-1 py-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer"
                          >
                            <CopiedCheck copied={isCopied} />
                            <span>{isCopied ? 'Link Copied!' : 'Copy Share Link'}</span>
                          </button>
                          <a
                            href={cert.verificationUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl transition cursor-pointer"
                            title="Open public verification page"
                          >
                            <ExternalLink size={14} />
                          </a>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Programming Certificates */}
                {programmingCerts.map(cert => {
                  const isCopied = copiedId === cert.certificateNumber;
                  const isExporting = exportingCertId === cert.certificateNumber;
                  const colors = COURSE_CATEGORY_COLORS[cert.courseCategory] || { bg: 'bg-indigo-50', text: 'text-indigo-800', border: 'border-indigo-200' };

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
                    instructorName: 'YARA Faculty',
                    instructorTitle: 'Lead Instructor',
                    coSignerName: 'YARA Directorate',
                    coSignerTitle: 'Accreditation Board',
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

                        <span className={`inline-block px-2.5 py-0.5 rounded-full ${colors.bg} ${colors.text} ${colors.border} border text-[9px] font-bold mb-2`}>
                          {COURSE_CATEGORY_LABELS[cert.courseCategory] || 'Course'}
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
                            className="flex-1 py-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer"
                          >
                            <CopiedCheck copied={isCopied} />
                            <span>{isCopied ? 'Link Copied!' : 'Copy Share Link'}</span>
                          </button>
                          <a
                            href={`${window.location.origin}/verify-certificate?id=${cert.certificateNumber}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl transition cursor-pointer"
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

      {/* Certificate Claim Modal */}
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
