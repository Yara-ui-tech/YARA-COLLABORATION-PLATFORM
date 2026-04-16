import React from 'react';
import { Link } from 'react-router-dom';

export default function MentorDashboard() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Mentor Dashboard</h1>
      <p className="text-slate-600">Tools for mentors: manage resources, view mentee requests, and schedule sessions.</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link to="/resources" className="p-6 bg-white rounded-2xl border">Manage Resources</Link>
        <Link to="/mentorship" className="p-6 bg-white rounded-2xl border">Mentee Requests</Link>
        <Link to="/live" className="p-6 bg-white rounded-2xl border">Live Sessions</Link>
      </div>
    </div>
  );
}
