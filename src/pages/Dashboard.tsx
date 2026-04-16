import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';
import LearnerDashboard from './LearnerDashboard';
import MentorDashboard from './MentorDashboard';
import { ASSETS } from '../constants/assets';

function DashboardHero({ name, role }: { name?: string; role?: string }) {
  return (
    <div className="rounded-3xl overflow-hidden relative mb-8">
      <img src={ASSETS.DASHBOARD_HERO_BG} alt="Hero" className="w-full h-44 object-cover brightness-75" />
      <div className="absolute inset-0 flex items-center justify-between px-8">
        <div className="text-white">
          <h2 className="text-2xl font-extrabold">Welcome{ name ? `, ${name}` : '' }</h2>
          <p className="text-sm opacity-90 mt-1">{role === 'mentor' ? 'Mentor Tools & Insights' : role === 'admin' ? 'Admin Console' : 'Your learning hub'}</p>
        </div>
        <div className="hidden md:flex items-center gap-4">
          <button className="bg-white/10 text-white px-4 py-2 rounded-full border border-white/20">Quick Actions</button>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { profile } = useAuth();

  if (!profile) return <div>Loading...</div>;

  if (profile.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }

  if (profile.role === 'mentor') {
    return (
      <div className="space-y-6">
        <DashboardHero name={profile.display_name} role={profile.role} />
        <MentorDashboard />
      </div>
    );
  }

  // default to learner/innovator
  return (
    <div className="space-y-6">
      <DashboardHero name={profile.display_name} role={profile.role} />
      <LearnerDashboard />
    </div>
  );
}
