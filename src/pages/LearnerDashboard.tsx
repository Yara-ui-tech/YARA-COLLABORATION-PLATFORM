import React from 'react';
import { Link } from 'react-router-dom';
import PlaceholderImage from '../components/PlaceholderImage';

export default function LearnerDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold">Learner Dashboard</h1>
          <p className="text-slate-500 mt-1">Quick links and progress overview for learners/innovators.</p>
        </div>
        <div className="text-sm text-slate-400">Tip: Visit Curriculum to update your progress</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link to="/curriculum" className="group block p-6 bg-white rounded-3xl border border-slate-100 shadow hover:shadow-lg transform hover:-translate-y-1 transition">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-xl overflow-hidden bg-gradient-to-br from-indigo-50 to-indigo-100 flex items-center justify-center">
              <PlaceholderImage type="resource" className="w-full h-full" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900">Curriculum & Progress</h3>
              <p className="text-sm text-slate-500 mt-1">Continue your learning path and track completion.</p>
            </div>
          </div>
        </Link>

        <Link to="/projects" className="group block p-6 bg-white rounded-3xl border border-slate-100 shadow hover:shadow-lg transform hover:-translate-y-1 transition">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-xl overflow-hidden bg-gradient-to-br from-emerald-50 to-emerald-100 flex items-center justify-center">
              <PlaceholderImage text="Project" className="w-full h-full" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900">My Projects</h3>
              <p className="text-sm text-slate-500 mt-1">Showcase your builds and collaborate with mentors.</p>
            </div>
          </div>
        </Link>

        <Link to="/resources" className="group block p-6 bg-white rounded-3xl border border-slate-100 shadow hover:shadow-lg transform hover:-translate-y-1 transition">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-xl overflow-hidden bg-gradient-to-br from-amber-50 to-amber-100 flex items-center justify-center">
              <PlaceholderImage type="resource" className="w-full h-full" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900">Learning Resources</h3>
              <p className="text-sm text-slate-500 mt-1">Download materials and study guides from mentors.</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
