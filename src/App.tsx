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
import About from './pages/About';
import Programs from './pages/Programs';
import Impact from './pages/Impact';
import Partners from './pages/Partners';
import Contact from './pages/Contact';

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

  if (isTrialExpired && profile?.role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-8 text-center">
        <div className="w-20 h-20 bg-amber-50 rounded-3xl flex items-center justify-center text-amber-600 mb-6">
          <Lock className="w-10 h-10" />
        </div>
        <h2 className="text-3xl font-bold text-slate-900 mb-4">Trial Period Ended</h2>
        <p className="text-slate-500 max-w-md mb-8">
          Your 4-day free trial has expired. Please subscribe to continue your journey with YARIA.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <button 
            onClick={() => window.location.reload()}
            className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-bold hover:bg-indigo-700 transition-all"
          >
            I've Subscribed
          </button>
          <button 
            onClick={() => supabase.auth.signOut()}
            className="bg-white text-red-600 border-2 border-red-50 px-8 py-3 rounded-2xl font-bold hover:bg-red-50 transition-all"
          >
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  if (isSubscriptionExpired && profile?.role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-8 text-center">
        <div className="w-20 h-20 bg-amber-50 rounded-3xl flex items-center justify-center text-amber-600 mb-6">
          <Lock className="w-10 h-10" />
        </div>
        <h2 className="text-3xl font-bold text-slate-900 mb-4">Subscription Expired</h2>
        <p className="text-slate-500 max-w-md mb-8">
          Your subscription expired on {new Date(profile?.subscription_expires_at || '').toLocaleDateString()}. Please renew your subscription to continue using YARIA.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <button 
            onClick={() => window.location.reload()}
            className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-bold hover:bg-indigo-700 transition-all"
          >
            I've Renewed
          </button>
          <button 
            onClick={() => supabase.auth.signOut()}
            className="bg-white text-red-600 border-2 border-red-50 px-8 py-3 rounded-2xl font-bold hover:bg-red-50 transition-all"
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
