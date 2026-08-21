import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
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
import { YaraLmsSessionPlayer } from '../components/lms/YaraLmsSessionPlayer';
import { YaraLmsCapstoneSubmissionModal } from '../components/lms/YaraLmsCapstoneSubmissionModal';
import { YaraLmsCertificateModal } from '../components/lms/YaraLmsCertificateModal';
import { 
  calculateUserOverallProgress, 
  getAllUserCompletions, 
  getLearnerPortfolio, 
  getUserCapstoneSubmission,
  checkCertificateEligibility
} from '../services/yaraLmsService';
import { COMPLETE_YARA_SESSIONS, getSessionById } from '../constants/yaraLmsCatalog';
import { checkAndVerifyUserSubscription } from '../services/partnershipDonationService';

export default function YaraLearning() {
  const { user, profile } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const userId = user?.id || 'demo_learner_01';
  const studentName = profile?.name || user?.email?.split('@')[0] || 'YARA Learner';
  const userEmail = user?.email || 'learner@yara.org';

  // Active Tab from URL search params
  const tabFromQuery = (searchParams.get('tab') as LearningTabId) || 'dashboard';
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
    if (searchParams.get('tab')) {
      setActiveTab(searchParams.get('tab') as LearningTabId);
    }
    if (searchParams.get('session')) {
      setActiveSessionId(searchParams.get('session'));
    } else {
      setActiveSessionId(null);
    }
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
    setActiveTab(tab);
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      next.set('tab', tab);
      next.delete('session');
      return next;
    });
  };

  const handleStartSession = (sessionId: string) => {
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
      {/* 1. Sticky Navigation Tab Bar */}
      <YaraLearningNavigation
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        progressPercent={overallProgress.percentage}
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
      </main>

      {/* 3. Session Player Modal */}
      {currentPlayingSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-6xl max-h-[96vh] my-auto bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-800">
            <YaraLmsSessionPlayer
              session={currentPlayingSession}
              userId={userId}
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

      {/* 5. Certificate Modal */}
      <YaraLmsCertificateModal
        userId={userId}
        studentName={studentName}
        userEmail={userEmail}
        isOpen={isCertModalOpen}
        onClose={() => setIsCertModalOpen(false)}
        onNavigateToMembership={() => handleSelectTab('subscription')}
      />
    </div>
  );
}
