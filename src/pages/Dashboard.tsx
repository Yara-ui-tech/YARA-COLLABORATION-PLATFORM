import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';
import LearnerDashboard from './LearnerDashboard';
import MentorDashboard from './MentorDashboard';

export default function Dashboard() {
  const { profile } = useAuth();

  if (!profile) return <div>Loading...</div>;

  if (profile.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }

  if (profile.role === 'mentor') {
    return <MentorDashboard />;
  }

  // default to learner/innovator
  return <LearnerDashboard />;
}
