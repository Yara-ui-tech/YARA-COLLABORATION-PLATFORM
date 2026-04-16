import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';
import { supabase } from '../lib/supabase';

export default function MentorDashboard() {
  const { profile } = useAuth();
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
      <h1 className="text-3xl font-bold">Mentor Dashboard</h1>
      <p className="text-slate-600">Tools for mentors: manage resources, view mentee requests, and submit commission requests.</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link to="/resources" className="p-6 bg-white rounded-2xl border">Manage Resources</Link>
        <Link to="/mentorship" className="p-6 bg-white rounded-2xl border">Mentee Requests</Link>
        <Link to="/live" className="p-6 bg-white rounded-2xl border">Live Sessions</Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-white rounded-2xl border">
          <h3 className="font-bold">Commission Summary</h3>
          <p className="mt-3">Total Commission Earned: <strong>${commissionTotal}</strong></p>
          <p className="mt-1">Amount Paid: <strong>${amountPaid}</strong></p>
          <p className="mt-1">Commission Due: <strong>${commissionDue}</strong></p>
        </div>

        <div className="p-6 bg-white rounded-2xl border">
          <h3 className="font-bold">Submit Commission Request</h3>
          <form onSubmit={handleSubmit} className="mt-4 space-y-3">
            <div>
              <label className="text-sm font-medium">Amount</label>
              <input value={amount} onChange={e=>setAmount(e.target.value)} className="w-full mt-1 p-2 border rounded" />
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <input value={description} onChange={e=>setDescription(e.target.value)} className="w-full mt-1 p-2 border rounded" />
            </div>
            <div>
              <button type="submit" disabled={loading} className="bg-indigo-600 text-white px-4 py-2 rounded">{loading? 'Submitting...' : 'Submit Request'}</button>
            </div>
          </form>
        </div>
      </div>

      <div className="p-6 bg-white rounded-2xl border">
        <h3 className="font-bold">Your Commission Logs</h3>
        <ul className="mt-4 space-y-3">
          {logs.map(l => (
            <li key={l.id} className="p-3 border rounded flex justify-between">
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
