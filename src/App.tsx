import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './components/AuthContext';
import { safeSignOut } from './lib/supabase';
import { Lock } from 'lucide-react';
import Layout from './components/Layout';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Ideas from './pages/Ideas';
import Projects from './pages/Projects';
import Mentorship from './pages/Mentorship';
import Events from './pages/Events';
import Resources from './pages/Resources';
import { useSearchParams } from 'react-router-dom';
import Auth from './pages/Auth';
import Feedback from './pages/Feedback';
import Admin from './pages/Admin';
import Dashboard from './pages/Dashboard';
import LiveRoom from './pages/LiveRoom';
import YaraRoboticsCompetition2026 from './pages/YaraRoboticsCompetition2026';
import About from './pages/About';
import Programs from './pages/Programs';
import Impact from './pages/Impact';
import ImpactGalleryPage from './pages/ImpactGallery';
import Partners from './pages/Partners';
import Contact from './pages/Contact';
import DonationsAndSponsorships from './pages/DonationsAndSponsorships';
import VolunteerPortal from './pages/VolunteerPortal';
import ParticipantPortal from './pages/competition/ParticipantPortal';
import SponsorPortal from './pages/competition/SponsorPortal';
import JudgePortal from './pages/competition/JudgePortal';
import LiveResultsScreen from './pages/competition/LiveResultsScreen';
import CertificateVerification from './pages/competition/CertificateVerification';
import ImpactAndFinancials from './pages/competition/ImpactAndFinancials';
import SubscriptionLockoutView from './components/auth/SubscriptionLockoutView';
import YaraLearning from './pages/YaraLearning';
import VerifyCertificate from './pages/VerifyCertificate';
import Posts from './pages/Posts';
import Chapters from './pages/Chapters';
import Competitions from './pages/Competitions';
import AiForEducatorsBootcamp from './pages/events/AiForEducatorsBootcamp';
import EducatorPortal from './pages/EducatorPortal';
import YaraLiveHub from './pages/YaraLiveHub';
import YaraKids from './pages/YaraKids';
import { PortalProvider } from './context/PortalContext';
import { PortalGatewaySelector } from './components/portal/PortalGatewaySelector';

import PublicLayout from './components/public/PublicLayout';
import Training from './pages/Training';
import SchoolManagement from './pages/SchoolManagement';

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, profile, loading, isAuthReady, isHalted, isSubscriptionExpired, isTrialExpired } = useAuth();

  if (!isAuthReady || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" />;
  }

  if (isHalted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-8 text-center">
        <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center text-red-600 mb-6">
          <Lock className="w-10 h-10" />
        </div>
        <h2 className="text-3xl font-bold text-slate-900 mb-4">Account Halted</h2>
        <p className="text-slate-500 max-w-md mb-8">
          Your account has been halted by an administrator. Please contact support or your administrator to resolve this.
        </p>
        <button 
          onClick={() => safeSignOut()}
          className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-bold hover:bg-indigo-700 transition-all"
        >
          Sign Out
        </button>
      </div>
    );
  }

  if (isTrialExpired && profile?.role !== 'admin' && profile?.role !== 'mentor') {
    return <SubscriptionLockoutView type="trial_expired" />;
  }

  if (isSubscriptionExpired && profile?.role !== 'admin' && profile?.role !== 'mentor') {
    return <SubscriptionLockoutView type="subscription_expired" />;
  }

  return <>{children}</>;
};

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  const isAdmin = profile?.role === 'admin' || 
    user?.email === 'manongwasimbarashe394@gmail.com' || 
    user?.email === 'goyaracorp@gmail.com' ||
    profile?.email === 'manongwasimbarashe394@gmail.com' ||
    profile?.email === 'goyaracorp@gmail.com';

  if (!user || !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

// Smart redirector unifying legacy /curriculum links into the unified YARA Robotics Academy
const CurriculumRedirect: React.FC = () => {
  const [searchParams] = useSearchParams();
  const cert = searchParams.get('cert');
  const session = searchParams.get('session');

  if (cert) {
    return <Navigate to={`/verify-certificate?cert=${encodeURIComponent(cert)}`} replace />;
  }
  if (session) {
    return <Navigate to={`/learning?session=${encodeURIComponent(session)}`} replace />;
  }
  return <Navigate to="/learning?tab=courses" replace />;
};

const AppContent = () => {
  return (
    <Router>
      <PortalProvider>
        <PortalGatewaySelector />
        <Routes>
          {/* ========================================================= */}
          {/* PUBLIC YARA WEBSITE (Freely accessible without login)      */}
          {/* ========================================================= */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/programs" element={<Programs />} />
            <Route path="/training" element={<Training />} />
            <Route path="/schools" element={<SchoolManagement />} />
            <Route path="/school-management" element={<SchoolManagement />} />
            <Route path="/clubs" element={<SchoolManagement />} />

            {/* Competitions Ecosystem */}
            <Route path="/competitions" element={<Competitions />} />
            <Route path="/all-competitions" element={<Competitions />} />
            <Route path="/competitions/yara-2026" element={<YaraRoboticsCompetition2026 />} />
            <Route path="/yara-competition-2026" element={<YaraRoboticsCompetition2026 />} />
            <Route path="/competition" element={<YaraRoboticsCompetition2026 />} />
            <Route path="/competition/participant" element={<ParticipantPortal />} />
            <Route path="/competition/sponsors" element={<SponsorPortal />} />
            <Route path="/sponsors" element={<SponsorPortal />} />
            <Route path="/competition/volunteers" element={<VolunteerPortal />} />
            <Route path="/volunteer" element={<VolunteerPortal />} />
            <Route path="/volunteers" element={<VolunteerPortal />} />
            <Route path="/competition/judges" element={<JudgePortal />} />
            <Route path="/judges" element={<JudgePortal />} />
            <Route path="/competition/live-results" element={<LiveResultsScreen />} />
            <Route path="/live-results" element={<LiveResultsScreen />} />
            <Route path="/competition/impact" element={<ImpactAndFinancials />} />

            {/* Public Events & Bootcamps */}
            <Route path="/events" element={<Events />} />
            <Route path="/events/ai-for-educators" element={<AiForEducatorsBootcamp />} />
            <Route path="/events/ai-for-educators-bootcamp" element={<AiForEducatorsBootcamp />} />
            <Route path="/ai-for-educators" element={<AiForEducatorsBootcamp />} />
            <Route path="/bootcamp" element={<AiForEducatorsBootcamp />} />

            {/* Impact & Projects & Community */}
            <Route path="/impact" element={<Impact />} />
            <Route path="/impact-gallery" element={<ImpactGalleryPage />} />
            <Route path="/impact-galleries" element={<ImpactGalleryPage />} />
            <Route path="/gallery" element={<ImpactGalleryPage />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/partners" element={<Partners />} />
            <Route path="/donate" element={<DonationsAndSponsorships />} />
            <Route path="/sponsorship" element={<DonationsAndSponsorships />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/posts" element={<Posts />} />
            <Route path="/news" element={<Posts />} />
            <Route path="/announcements" element={<Posts />} />
            <Route path="/chapters" element={<Chapters />} />
            <Route path="/yara-chapters" element={<Chapters />} />
            <Route path="/kids" element={<YaraKids />} />
            <Route path="/yara-kids" element={<YaraKids />} />
            <Route path="/infants" element={<YaraKids />} />
            <Route path="/verify" element={<VerifyCertificate />} />
            <Route path="/verify-certificate" element={<VerifyCertificate />} />
          </Route>

          {/* ========================================================= */}
          {/* AUTHENTICATION & ACCESS ENTRY POINTS                      */}
          {/* ========================================================= */}
          <Route path="/auth" element={<Auth />} />
          <Route path="/login" element={<Auth />} />
          <Route path="/register" element={<Auth />} />
          <Route path="/join" element={<Auth />} />

          {/* ========================================================= */}
          {/* YARA LMS & MEMBER DASHBOARDS (Secured behind PrivateRoute) */}
          {/* ========================================================= */}
          <Route
            element={
              <PrivateRoute>
                <Layout />
              </PrivateRoute>
            }
          >
            {/* Student & Role Dashboard */}
            <Route path="/dashboard" element={<Dashboard />} />

            {/* Unified Learning Academy & Modules */}
            <Route path="/learning" element={<YaraLearning />} />
            <Route path="/learning/*" element={<YaraLearning />} />
            <Route path="/lms" element={<Navigate to="/learning" replace />} />
            <Route path="/academy" element={<Navigate to="/learning" replace />} />
            <Route path="/curriculum" element={<CurriculumRedirect />} />
            <Route path="/curriculum/*" element={<CurriculumRedirect />} />
            <Route path="/tracks" element={<CurriculumRedirect />} />
            <Route path="/curriculum-tracks" element={<CurriculumRedirect />} />
            <Route path="/robotics-curriculum" element={<CurriculumRedirect />} />
            <Route path="/courses" element={<CurriculumRedirect />} />

            {/* Innovation & Mentorship */}
            <Route path="/ideas" element={<Ideas />} />
            <Route path="/mentorship" element={<Mentorship />} />
            <Route path="/resources" element={<Resources />} />
            <Route path="/feedback" element={<Feedback />} />
            <Route path="/profile" element={<Profile />} />

            {/* Teacher / Patron Hub & Competition Prep Suite */}
            <Route path="/educator-portal" element={<EducatorPortal />} />
            <Route path="/educators" element={<EducatorPortal />} />
            <Route path="/educator" element={<EducatorPortal />} />
            <Route path="/teacher" element={<EducatorPortal />} />
            <Route path="/teachers" element={<EducatorPortal />} />
            <Route path="/educators-portal" element={<EducatorPortal />} />

            {/* Live Interactive Hub */}
            <Route path="/live" element={<YaraLiveHub />} />
            <Route path="/live-sessions" element={<YaraLiveHub />} />
            <Route path="/live/:roomId" element={<LiveRoom />} />

            {/* Admin Console */}
            <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
          </Route>

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </PortalProvider>
    </Router>
  );
};

import ErrorBoundary from './components/ErrorBoundary';
import ConfirmDialogHost from './components/ConfirmDialogHost';

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppContent />
        <ConfirmDialogHost />
      </AuthProvider>
    </ErrorBoundary>
  );
}
