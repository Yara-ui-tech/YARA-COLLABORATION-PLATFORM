import React from 'react';
import { Link } from 'react-router-dom';

export default function LearnerDashboard() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Learner Dashboard</h1>
      <p className="text-slate-600">Quick links and progress overview for learners/innovators.</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link to="/curriculum" className="p-6 bg-white rounded-2xl border">View Curriculum & Progress</Link>
        <Link to="/projects" className="p-6 bg-white rounded-2xl border">My Projects</Link>
        <Link to="/resources" className="p-6 bg-white rounded-2xl border">Learning Resources</Link>
      </div>
    </div>
  );
}
