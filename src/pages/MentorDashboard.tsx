import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';
import { supabase } from '../lib/supabase';
import PlaceholderImage from '../components/PlaceholderImage';

export default function MentorDashboard() {
  const { profile, refreshProfile } = useAuth();
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<any[]>([]);

  const commissionTotal = profile?.total_commission || 0;
  const amountPaid = profile?.amount_paid || 0;
  const commissionDue = (Number(commissionTotal) - Number(amountPaid)).toFixed(2);

  useEffect(() => {
    if (profile) fetchLogs();
  }, [profile]);

  async function fetchLogs() {
    if (!profile) return;
    const { data, error } = await supabase
      .from('mentor_session_logs')
      .select('*')
      .eq('mentor_id', profile.id)
      .order('created_at', { ascending: false });
    if (!error) setLogs(data || []);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!profile) return;
    if (!amount) return alert('Enter amount');
    setLoading(true);
    try {
      const { error } = await supabase.from('mentor_session_logs').insert([{ 
        mentor_id: profile.id,
        session_id: profile.id + '-' + Date.now(),
        amount_received: parseFloat(amount),
        description,
        admin_approved: false
      }]);
      if (error) throw error;
      setAmount('');
      setDescription('');
      fetchLogs();
      // refresh profile so commission totals show updated values if changed
      if (refreshProfile) await refreshProfile();
      alert('Commission log submitted — admin will review.');
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Failed to submit');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold">Mentor Dashboard</h1>
          <p className="text-slate-500 mt-1">Tools for mentors: manage resources, view mentee requests, and submit commission requests.</p>
        </div>
        <div className="text-sm text-slate-400">Balance due: <strong className="text-indigo-600">${commissionDue}</strong></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link to="/resources" className="group block p-6 bg-white rounded-3xl border border-slate-100 shadow hover:shadow-lg transform hover:-translate-y-1 transition">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl overflow-hidden bg-gradient-to-br from-indigo-50 to-indigo-100 flex items-center justify-center">
              <PlaceholderImage type="resource" className="w-full h-full" />
            </div>
            <div>
              <h3 className="font-bold">Manage Resources</h3>
              <p className="text-sm text-slate-500 mt-1">Upload and manage study materials.</p>
            </div>
          </div>
        </Link>

        <Link to="/mentorship" className="group block p-6 bg-white rounded-3xl border border-slate-100 shadow hover:shadow-lg transform hover:-translate-y-1 transition">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl overflow-hidden bg-gradient-to-br from-emerald-50 to-emerald-100 flex items-center justify-center">
              <PlaceholderImage text="Mentors" className="w-full h-full" />
            </div>
            <div>
              <h3 className="font-bold">Mentee Requests</h3>
              <p className="text-sm text-slate-500 mt-1">Respond to mentorship requests from learners.</p>
            </div>
          </div>
        </Link>

        <Link to="/live" className="group block p-6 bg-white rounded-3xl border border-slate-100 shadow hover:shadow-lg transform hover:-translate-y-1 transition">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl overflow-hidden bg-gradient-to-br from-amber-50 to-amber-100 flex items-center justify-center">
              <PlaceholderImage type="project" className="w-full h-full" />
            </div>
            <div>
              <h3 className="font-bold">Live Sessions</h3>
              <p className="text-sm text-slate-500 mt-1">Create and manage live teaching sessions.</p>
            </div>
          </div>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-white rounded-3xl border shadow-sm">
          <h3 className="font-bold">Commission Summary</h3>
          <div className="mt-4 space-y-2">
            <p className="text-sm text-slate-500">Total Commission Earned: <strong className="text-emerald-600">${commissionTotal}</strong></p>
            <p className="text-sm text-slate-500">Amount Paid: <strong className="text-slate-900">${amountPaid}</strong></p>
            <p className="text-sm text-slate-500">Commission Due: <strong className="text-indigo-600">${commissionDue}</strong></p>
          </div>
        </div>

        <div className="p-6 bg-white rounded-3xl border shadow-sm">
          <h3 className="font-bold">Submit Commission Request</h3>
          <form onSubmit={handleSubmit} className="mt-4 space-y-3">
            <div>
              <label className="text-sm font-medium">Amount</label>
              <input value={amount} onChange={e=>setAmount(e.target.value)} className="w-full mt-1 p-3 border rounded-lg" />
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <input value={description} onChange={e=>setDescription(e.target.value)} className="w-full mt-1 p-3 border rounded-lg" />
            </div>
            <div>
              <button type="submit" disabled={loading} className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold">{loading? 'Submitting...' : 'Submit Request'}</button>
            </div>
          </form>
        </div>
      </div>

      <div className="p-6 bg-white rounded-3xl border shadow-sm">
        <h3 className="font-bold">Your Commission Logs</h3>
        <ul className="mt-4 space-y-3">
          {logs.length === 0 && (
            <div className="py-12 text-center text-slate-400">No commission logs yet — submit one above.</div>
          )}
          {logs.map(l => (
            <li key={l.id} className="p-3 border rounded-lg flex items-center justify-between">
              <div>
                <div className="font-bold">${l.amount_received} — {l.description}</div>
                <div className="text-xs text-slate-500">{new Date(l.created_at).toLocaleString()}</div>
              </div>
              <div className={`text-sm font-semibold ${l.admin_approved ? 'text-emerald-600' : 'text-amber-600'}`}>
                {l.admin_approved ? 'Approved' : 'Pending'}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
