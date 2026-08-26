import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './components/AuthContext';
import { supabase } from './lib/supabase';
import { Lock } from 'lucide-react';
import Layout from './components/Layout';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Ideas from './pages/Ideas';
import Projects from './pages/Projects';
import Mentorship from './pages/Mentorship';
import Events from './pages/Events';
import Resources from './pages/Resources';
import Curriculum from './pages/Curriculum';
import Auth from './pages/Auth';
import Feedback from './pages/Feedback';
import Admin from './pages/Admin';
import Dashboard from './pages/Dashboard';
import LiveRoom from './pages/LiveRoom';
import YaraRoboticsCompetition2026 from './pages/YaraRoboticsCompetition2026';
import About from './pages/About';
import Programs from './pages/Programs';
import Impact from './pages/Impact';
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
          onClick={() => supabase.auth.signOut()}
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

const AppContent = () => {
  return (
    <Router>
      <Routes>
        <Route path="/auth" element={<Auth />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }
        >
          <Route index element={<Home />} />
          <Route path="profile" element={<Profile />} />
          <Route path="ideas" element={<Ideas />} />
          <Route path="projects" element={<Projects />} />
          <Route path="mentorship" element={<Mentorship />} />
          <Route path="events" element={<Events />} />
          <Route path="posts" element={<Posts />} />
          <Route path="news" element={<Posts />} />
          <Route path="announcements" element={<Posts />} />
          <Route path="chapters" element={<Chapters />} />
          <Route path="yara-chapters" element={<Chapters />} />

          {/* YARA Learning Academy */}
          <Route path="learning" element={<YaraLearning />} />
          <Route path="learning/*" element={<YaraLearning />} />
          <Route path="lms" element={<Navigate to="/learning" replace />} />
          <Route path="academy" element={<Navigate to="/learning" replace />} />

          {/* YARA Competitions Ecosystem & Hub */}
          <Route path="competitions" element={<Competitions />} />
          <Route path="all-competitions" element={<Competitions />} />
          <Route path="competitions/yara-2026" element={<YaraRoboticsCompetition2026 />} />
          <Route path="yara-competition-2026" element={<YaraRoboticsCompetition2026 />} />
          <Route path="competition" element={<YaraRoboticsCompetition2026 />} />
          <Route path="competition/participant" element={<ParticipantPortal />} />
          <Route path="competition/sponsors" element={<SponsorPortal />} />
          <Route path="sponsors" element={<SponsorPortal />} />
          <Route path="competition/volunteers" element={<VolunteerPortal />} />
          <Route path="volunteer" element={<VolunteerPortal />} />
          <Route path="volunteers" element={<VolunteerPortal />} />
          <Route path="competition/judges" element={<JudgePortal />} />
          <Route path="judges" element={<JudgePortal />} />
          <Route path="competition/live-results" element={<LiveResultsScreen />} />
          <Route path="live-results" element={<LiveResultsScreen />} />
          <Route path="competition/impact" element={<ImpactAndFinancials />} />
          <Route path="verify" element={<VerifyCertificate />} />
          <Route path="verify-certificate" element={<VerifyCertificate />} />

          <Route path="resources" element={<Resources />} />
          <Route path="curriculum" element={<Curriculum />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="feedback" element={<Feedback />} />
          <Route path="about" element={<About />} />
          <Route path="programs" element={<Programs />} />
          <Route path="impact" element={<Impact />} />
          <Route path="partners" element={<Partners />} />
          <Route path="donate" element={<DonationsAndSponsorships />} />
          <Route path="sponsorship" element={<DonationsAndSponsorships />} />
          <Route path="contact" element={<Contact />} />
          <Route path="admin" element={<Admin />} />
          <Route path="live/:roomId" element={<LiveRoom />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
