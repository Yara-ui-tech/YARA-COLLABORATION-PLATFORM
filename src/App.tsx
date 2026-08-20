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

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, profile, loading, isAuthReady, isHalted, isSubscriptionExpired, isTrialExpired, refreshProfile } = useAuth();

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

  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const handleRefreshStatus = async () => {
    setIsRefreshing(true);
    if (refreshProfile) {
      await refreshProfile();
    }
    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
  };

  if (isTrialExpired && profile?.role !== 'admin' && profile?.role !== 'mentor') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-8 text-center">
        <div className="w-20 h-20 bg-amber-50 rounded-3xl flex items-center justify-center text-amber-600 mb-6 shadow-sm border border-amber-100">
          <Lock className="w-10 h-10" />
        </div>
        <h2 className="text-3xl font-bold text-slate-900 mb-3">Trial Period Ended</h2>
        <p className="text-slate-500 max-w-md mb-2 text-sm leading-relaxed">
          Your 4-day free trial period has concluded. If you have subscribed or an administrator has updated your account, please click below to refresh your access.
        </p>
        <p className="text-xs text-slate-400 font-mono mb-8">
          Member ID: <span className="text-indigo-600 font-bold">{profile?.member_id || 'Generating...'}</span>
        </p>
        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm">
          <button 
            onClick={handleRefreshStatus}
            disabled={isRefreshing}
            className="w-full bg-indigo-600 text-white px-8 py-3.5 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center justify-center space-x-2"
          >
            <span>{isRefreshing ? "Checking Subscription..." : "I've Subscribed / Refresh Status"}</span>
          </button>
          <button 
            onClick={() => supabase.auth.signOut()}
            className="w-full bg-white text-red-600 border-2 border-red-100 px-8 py-3.5 rounded-2xl font-bold hover:bg-red-50 transition-all"
          >
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  if (isSubscriptionExpired && profile?.role !== 'admin' && profile?.role !== 'mentor') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-8 text-center">
        <div className="w-20 h-20 bg-amber-50 rounded-3xl flex items-center justify-center text-amber-600 mb-6 shadow-sm border border-amber-100">
          <Lock className="w-10 h-10" />
        </div>
        <h2 className="text-3xl font-bold text-slate-900 mb-3">Subscription Expired</h2>
        <p className="text-slate-500 max-w-md mb-2 text-sm leading-relaxed">
          Your subscription expired on {profile?.subscription_expires_at ? new Date(profile.subscription_expires_at).toLocaleDateString() : 'N/A'}. Please renew your subscription to continue using YARIA.
        </p>
        <p className="text-xs text-slate-400 font-mono mb-8">
          Member ID: <span className="text-indigo-600 font-bold">{profile?.member_id || 'N/A'}</span>
        </p>
        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm">
          <button 
            onClick={handleRefreshStatus}
            disabled={isRefreshing}
            className="w-full bg-indigo-600 text-white px-8 py-3.5 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center justify-center space-x-2"
          >
            <span>{isRefreshing ? "Checking..." : "I've Renewed / Refresh Status"}</span>
          </button>
          <button 
            onClick={() => supabase.auth.signOut()}
            className="w-full bg-white text-red-600 border-2 border-red-100 px-8 py-3.5 rounded-2xl font-bold hover:bg-red-50 transition-all"
          >
            Sign Out
          </button>
        </div>
      </div>
    );
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
          <Route path="competitions/yara-2026" element={<YaraRoboticsCompetition2026 />} />
          <Route path="yara-competition-2026" element={<YaraRoboticsCompetition2026 />} />
          <Route path="competition" element={<YaraRoboticsCompetition2026 />} />
          <Route path="resources" element={<Resources />} />
          <Route path="curriculum" element={<Curriculum />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="feedback" element={<Feedback />} />
          <Route path="about" element={<About />} />
          <Route path="programs" element={<Programs />} />
          <Route path="impact" element={<Impact />} />
          <Route path="partners" element={<Partners />} />
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
