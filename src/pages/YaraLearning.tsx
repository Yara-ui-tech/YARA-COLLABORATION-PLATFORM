import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';
import { YaraLearningNavigation, LearningTabId } from '../components/lms/YaraLearningNavigation';
import { LearningDashboardTab } from '../components/lms/tabs/LearningDashboardTab';
import { CoursesTab } from '../components/lms/tabs/CoursesTab';
import { MyCoursesTab } from '../components/lms/tabs/MyCoursesTab';
import { ProgressTab } from '../components/lms/tabs/ProgressTab';
import { AssessmentsTab } from '../components/lms/tabs/AssessmentsTab';
import { ProjectsTab } from '../components/lms/tabs/ProjectsTab';
import { CertificatesTab } from '../components/lms/tabs/CertificatesTab';
import { SubscriptionTab } from '../components/lms/tabs/SubscriptionTab';
import { ResourcesTab } from '../components/lms/tabs/ResourcesTab';
import { ProgrammingCoursesTab } from '../components/lms/tabs/ProgrammingCoursesTab';
import { LearningAcademyAdminCenter } from '../components/admin/LearningAcademyAdminCenter';
import { YaraLmsSessionPlayer } from '../components/lms/YaraLmsSessionPlayer';
import { YaraLmsCapstoneSubmissionModal } from '../components/lms/YaraLmsCapstoneSubmissionModal';
import { GreatLearningCertificateModal } from '../components/lms/GreatLearningCertificateModal';
import { LmsMembershipLockModal } from '../components/lms/LmsMembershipLockModal';
import { 
  calculateUserOverallProgress, 
  getAllUserCompletions, 
  getLearnerPortfolio, 
  getUserCapstoneSubmission,
  checkCertificateEligibility,
  checkLmsCourseAccess
} from '../services/yaraLmsService';
import { COMPLETE_YARA_SESSIONS, getSessionById } from '../constants/yaraLmsCatalog';
import { checkAndVerifyUserSubscription } from '../services/partnershipDonationService';
import { usePortal } from '../context/PortalContext';
import { Globe, ArrowRight, Layers, GraduationCap, ShieldCheck } from 'lucide-react';

export default function YaraLearning() {
  const { user, profile } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setPortalMode, openPortalSelector } = usePortal();

  const userId = user?.id || 'demo_learner_01';
  const studentName = profile?.display_name || user?.email?.split('@')[0] || 'YARA Learner';
  const userEmail = user?.email || 'learner@yara.org';
  const isAdmin = profile?.role === 'admin' || 
    profile?.email === 'manongwasimbarashe394@gmail.com' || 
    profile?.email === 'goyaracorp@gmail.com' || 
    user?.email === 'manongwasimbarashe394@gmail.com' || 
    user?.email === 'goyaracorp@gmail.com';

  // Membership Lock Modal State
  const [isLockModalOpen, setIsLockModalOpen] = useState(false);
  const [lockedCourseTitle, setLockedCourseTitle] = useState('');
  const [isPendingApproval, setIsPendingApproval] = useState(false);

  // Active Tab from URL search params
  const tabFromQuery = (searchParams.get('tab') as LearningTabId) || (searchParams.get('course') ? 'courses' : 'dashboard');
  const [activeTab, setActiveTab] = useState<LearningTabId>(tabFromQuery);

  // Active Session Player modal
  const sessionFromQuery = searchParams.get('session');
  const [activeSessionId, setActiveSessionId] = useState<string | null>(sessionFromQuery);

  // Capstone & Certificate Modals
  const [isCapstoneModalOpen, setIsCapstoneModalOpen] = useState(false);
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);

  // State calculations
  const [overallProgress, setOverallProgress] = useState<any>({
    completedCount: 0,
    totalSessions: 42,
    percentage: 0,
    currentLevel: 0,
    currentLevelTitle: 'Level 0 — Curious Beginner',
    nextSession: { id: 'S00', title: 'What Is Robotics?' }
  });
  const [userCompletions, setUserCompletions] = useState<Record<string, any>>({});
  const [subscriptionStatus, setSubscriptionStatus] = useState({
    isActive: true,
    statusText: 'Active',
    tier: 'Innovator'
  });
  const [certificateStatus, setCertificateStatus] = useState({
    isEligible: false,
    issued: false
  });
  const [quizStats, setQuizStats] = useState({
    averageScore: 82,
    quizzesPassed: 0,
    totalQuizzes: 0
  });

  const [portfolio, setPortfolio] = useState<any>(null);
  const [capstoneSubmission, setCapstoneSubmission] = useState<any>(null);

  useEffect(() => {
    loadLmsData();
  }, [userId, userEmail]);

  useEffect(() => {
    const tabParam = searchParams.get('tab') as LearningTabId | null;
    const courseParam = searchParams.get('course');
    const sessionParam = searchParams.get('session');

    React.startTransition(() => {
      if (tabParam) {
        setActiveTab(prev => (prev !== tabParam ? tabParam : prev));
      } else if (courseParam) {
        setActiveTab(prev => (prev !== 'courses' ? 'courses' : prev));
      }
      setActiveSessionId(prev => (prev !== sessionParam ? (sessionParam || null) : prev));
    });
  }, [searchParams]);

  const loadLmsData = async () => {
    try {
      const overall = calculateUserOverallProgress(userId);
      setOverallProgress(overall);

      const comps = getAllUserCompletions(userId);
      setUserCompletions(comps);

      // Quiz statistics
      const allQuizzes = COMPLETE_YARA_SESSIONS.filter(s => s.quizQuestions && s.quizQuestions.length > 0);
      let passedQuizzes = 0;
      let totalScores = 0;
      let evaluatedCount = 0;

      for (const s of allQuizzes) {
        const c = comps[s.id];
        if (c?.quizPassed) {
          passedQuizzes++;
        }
        if (c?.quizScore !== undefined && c.quizScore > 0) {
          totalScores += c.quizScore;
          evaluatedCount++;
        }
      }

      setQuizStats({
        averageScore: evaluatedCount > 0 ? Math.round(totalScores / evaluatedCount) : 80,
        quizzesPassed: passedQuizzes,
        totalQuizzes: allQuizzes.length
      });

      // Subscription check
      const subCheck = await checkAndVerifyUserSubscription(userId, userEmail);
      setSubscriptionStatus({
        isActive: subCheck.isSubscribed || true,
        statusText: subCheck.isSubscribed ? 'Active' : 'Payment Submitted',
        tier: 'Annual Innovator'
      });

      // Certificate eligibility
      const certCheck = await checkCertificateEligibility(userId, userEmail);
      setCertificateStatus({
        isEligible: certCheck.isEligible,
        issued: certCheck.isEligible
      });

      // Portfolio & Capstone
      const port = getLearnerPortfolio(userId, studentName);
      setPortfolio(port);

      const cap = getUserCapstoneSubmission(userId);
      setCapstoneSubmission(cap);
    } catch (e) {
      console.error('Error loading LMS data:', e);
    }
  };

  const handleSelectTab = (tab: LearningTabId) => {
    React.startTransition(() => {
      setActiveTab(tab);
      setSearchParams(prev => {
        const currentTab = prev.get('tab');
        const currentSession = prev.get('session');
        if (currentTab === tab && !currentSession) return prev;
        const next = new URLSearchParams(prev);
        next.set('tab', tab);
        next.delete('session');
        return next;
      }, { replace: true });
    });
  };

  const handleStartSession = (sessionId: string) => {
    const session = getSessionById(sessionId);
    const access = checkLmsCourseAccess(
      userId,
      userEmail,
      sessionId,
      subscriptionStatus.isActive || Boolean(profile?.registration_paid),
      profile?.role === 'admin' || (profile as any)?.approval_status === 'approved' || profile?.registration_paid
    );

    if (!access.isGranted && profile?.role !== 'admin') {
      setLockedCourseTitle(session?.title || `Session ${sessionId}`);
      setIsPendingApproval(access.reason === 'pending_approval');
      setIsLockModalOpen(true);
      return;
    }

    setActiveSessionId(sessionId);
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      next.set('session', sessionId);
      return next;
    });
  };

  const handleCloseSession = () => {
    setActiveSessionId(null);
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      next.delete('session');
      return next;
    });
    loadLmsData();
  };

  const currentPlayingSession = activeSessionId ? getSessionById(activeSessionId) : null;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Portal Mode Switcher Header Banner */}
      <div className="bg-slate-950 border-b border-slate-800 text-white px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 shadow-md">
        <div className="flex items-center space-x-3">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Active Portal: YARA Learning Academy</span>
          </div>
          <span className="hidden md:inline text-xs text-slate-400">
            Professional Academic Platform • 42 Robotics & Embedded Systems Sessions
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {isAdmin && (
            <Link
              to="/admin?tab=learning_academy"
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white border border-purple-500/40 text-xs font-bold transition-all"
              title="Open Learners & Approvals in Admin Portal"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
              <span>Learners &amp; Approvals</span>
            </Link>
          )}

          <button
            onClick={() => {
              setPortalMode('webpage');
              navigate('/');
            }}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white border border-blue-500/40 text-xs font-semibold transition-all"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Switch to YARA Webpage</span>
          </button>

          <button
            onClick={openPortalSelector}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs transition-colors"
            title="Open Gateway Selector"
          >
            <Layers className="w-4 h-4 text-emerald-400" />
          </button>
        </div>
      </div>

      {/* 1. Sticky Navigation Tab Bar */}
      <YaraLearningNavigation
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        progressPercent={overallProgress.percentage}
        isAdmin={isAdmin}
      />

      {/* 2. Main Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 pt-6">
        {/* Render Tab based on selection */}
        {activeTab === 'dashboard' && (
          <LearningDashboardTab
            userOverall={overallProgress}
            subscriptionStatus={subscriptionStatus}
            certificateStatus={certificateStatus}
            quizStats={quizStats}
            onStartSession={handleStartSession}
            onNavigateTab={handleSelectTab}
          />
        )}

        {activeTab === 'courses' && (
          <CoursesTab
            userId={userId}
            userCompletions={userCompletions}
            onSelectSession={handleStartSession}
            onNavigateTab={handleSelectTab}
            initialCourseId={searchParams.get('course')}
          />
        )}

        {activeTab === 'my-courses' && (
          <MyCoursesTab
            userOverall={overallProgress}
            onStartSession={handleStartSession}
            onNavigateTab={handleSelectTab}
          />
        )}

        {activeTab === 'progress' && (
          <ProgressTab
            userId={userId}
            userOverall={overallProgress}
            userCompletions={userCompletions}
            onSelectSession={handleStartSession}
          />
        )}

        {activeTab === 'assessments' && (
          <AssessmentsTab
            userId={userId}
            onNavigateSession={handleStartSession}
          />
        )}

        {activeTab === 'projects' && (
          <ProjectsTab
            portfolio={portfolio || getLearnerPortfolio(userId, studentName)}
            capstoneSubmission={capstoneSubmission}
            onOpenCapstoneModal={() => setIsCapstoneModalOpen(true)}
            onOpenSession={handleStartSession}
          />
        )}

        {activeTab === 'certificates' && (
          <CertificatesTab
            userId={userId}
            studentName={studentName}
            userEmail={userEmail}
            onNavigateTab={handleSelectTab}
          />
        )}

        {activeTab === 'subscription' && (
          <SubscriptionTab
            userId={userId}
            userEmail={userEmail}
            subscriptionStatus={subscriptionStatus}
          />
        )}

        {activeTab === 'resources' && (
          <ResourcesTab />
        )}

        {activeTab === 'programming' && (
          <ProgrammingCoursesTab
            userId={userId}
            studentName={studentName}
            userEmail={userEmail}
            onNavigateTab={handleSelectTab}
          />
        )}

        {activeTab === 'admin-center' && (
          isAdmin ? (
            <LearningAcademyAdminCenter adminUserId={userId} />
          ) : (
            <div className="bg-white border border-slate-200 rounded-3xl p-10 text-center max-w-lg mx-auto my-12 space-y-4 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-slate-900">Administrator Access Required</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Learner records, approvals, and curriculum management are restricted to YARA administrators only.
              </p>
              <button
                onClick={() => handleSelectTab('dashboard')}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition cursor-pointer"
              >
                Return to Dashboard
              </button>
            </div>
          )
        )}
      </main>

      {/* 3. Session Player Modal */}
      {currentPlayingSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-6xl max-h-[96vh] my-auto bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-800">
            <YaraLmsSessionPlayer
              session={currentPlayingSession}
              userId={userId}
              studentName={studentName}
              userEmail={userEmail}
              onBack={handleCloseSession}
              onNavigateSession={(nextId) => handleStartSession(nextId)}
              onRefreshProgress={loadLmsData}
            />
          </div>
        </div>
      )}

      {/* 4. Capstone 21-Point Submission Modal */}
      <YaraLmsCapstoneSubmissionModal
        userId={userId}
        isOpen={isCapstoneModalOpen}
        onClose={() => {
          setIsCapstoneModalOpen(false);
          loadLmsData();
        }}
        onSubmissionSuccess={() => {
          setIsCapstoneModalOpen(false);
          loadLmsData();
        }}
      />

      {/* 5. Great Learning Certificate Modal */}
      <GreatLearningCertificateModal
        isOpen={isCertModalOpen}
        onClose={() => setIsCertModalOpen(false)}
        userId={userId}
        userEmail={userEmail}
        defaultStudentName={studentName}
        courseId="robotics-foundation"
        courseTitle="YARA Robotics & Innovation Foundation Programme (Levels 0 — 8)"
      />

      {/* 6. Membership Lock Modal (Free Trial Course 1 vs Course 2+) */}
      <LmsMembershipLockModal
        isOpen={isLockModalOpen}
        onClose={() => setIsLockModalOpen(false)}
        courseTitle={lockedCourseTitle}
        isPendingApproval={isPendingApproval}
      />
    </div>
  );
}
