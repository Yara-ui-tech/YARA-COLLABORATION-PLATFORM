import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';
import { supabase } from '../lib/supabase';
import PlaceholderImage from '../components/PlaceholderImage';
import { Star, MessageSquare, Award, CheckCircle2, User, RefreshCw } from 'lucide-react';

export default function MentorDashboard() {
  const { profile, refreshProfile } = useAuth();
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<any[]>([]);
  const [assignedSessions, setAssignedSessions] = useState<any[]>([]);
  const [mentorReviews, setMentorReviews] = useState<any[]>([]);

  const commissionTotal = profile?.total_commission || 0;
  const amountPaid = profile?.amount_paid || 0;
  const commissionDue = (Number(commissionTotal) - Number(amountPaid)).toFixed(2);

  useEffect(() => {
    if (profile) {
      fetchLogs();
      fetchAssignedSessions();
      fetchReviews();

      // Realtime channel for mentor reviews
      const channel = supabase
        .channel(`mentor-reviews-${profile.id}`)
        .on('postgres_changes', { 
          event: '*', 
          schema: 'public', 
          table: 'mentor_reviews'
        }, () => {
          fetchReviews();
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [profile]);

  async function fetchReviews() {
    if (!profile) return;
    try {
      const { data, error } = await supabase
        .from('mentor_reviews')
        .select(`
          *,
          student:profiles!student_id(display_name, email, avatar_url)
        `)
        .eq('mentor_id', profile.id)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setMentorReviews(data);
      }
    } catch (err) {
      console.error('Error fetching mentor reviews:', err);
    }
  }

  async function fetchLogs() {
    if (!profile) return;
    const { data, error } = await supabase
      .from('mentor_session_logs')
      .select('*')
      .eq('mentor_id', profile.id)
      .order('created_at', { ascending: false });
    if (!error) setLogs(data || []);
  }

  async function fetchAssignedSessions() {
    if (!profile) return;
    try {
      const { data, error } = await supabase
        .from('session_assignments')
        .select('*, session:live_sessions(*)')
        .eq('mentor_id', profile.id)
        .in('status', ['assigned', 'pending'])
        .order('created_at', { ascending: true });
      if (!error) setAssignedSessions(data || []);
    } catch (err) {
      console.error('Error fetching assigned sessions', err);
    }
  }

  const markDelivered = async (assignmentId: string) => {
    try {
      const { error } = await supabase.from('session_assignments').update({ status: 'delivered', mentor_marked_delivered_at: new Date().toISOString() }).eq('id', assignmentId);
      if (error) throw error;
      fetchAssignedSessions();
      alert('Marked delivered');
    } catch (err: any) {
      console.warn('Failed to mark delivered:', err?.message || err);
      alert(err?.message || 'Failed to mark delivered');
    }
  };

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
      console.warn('Failed to submit commission log:', err?.message || err);
      alert(err?.message || 'Failed to submit');
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
      <div className="p-6 bg-white rounded-3xl border shadow-sm">
        <h3 className="font-bold">Assigned Sessions</h3>
        <ul className="mt-4 space-y-3">
          {assignedSessions.length === 0 && (
            <div className="py-12 text-center text-slate-400">No assigned sessions.</div>
          )}
          {assignedSessions.map(a => (
            <li key={a.id} className="p-3 border rounded-lg">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-bold">{a.session?.title || a.session?.name || 'Untitled session'}</div>
                  <div className="text-xs text-slate-500">{a.session?.starts_at ? new Date(a.session.starts_at).toLocaleString() : ''}</div>
                  <div className="text-sm text-slate-600 mt-2">{a.admin_notes || ''}</div>
                </div>
                <div className="space-y-2 text-right">
                  <div className="text-sm font-semibold">Status: <span className="text-amber-600">{a.status}</span></div>
                  {a.status !== 'delivered' && (
                    <button onClick={() => markDelivered(a.id)} className="bg-emerald-600 text-white px-3 py-1 rounded-lg text-sm">Mark Delivered</button>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link to="/resources" className="group block p-6 bg-white rounded-3xl border border-slate-100 shadow hover:shadow-lg transform hover:-translate-y-1 transition">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl overflow-hidden bg-gradient-to-br from-indigo-50 to-indigo-100 flex items-center justify-center">
              <BookOpen className="w-8 h-8 text-indigo-600" />
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
              <Users className="w-8 h-8 text-emerald-600" />
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
              <Radio className="w-8 h-8 text-amber-600" />
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

      {/* Real-time Student Reviews & Ratings */}
      <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-1">
              <Star className="w-4 h-4 fill-current text-amber-400" />
              <span>Real-Time Feedback</span>
            </div>
            <h3 className="text-xl font-black text-slate-900">Student Reviews &amp; Ratings</h3>
            <p className="text-xs text-slate-500">Live evaluations submitted by your mentees across all completed sessions.</p>
          </div>

          <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-100">
            <div className="text-center">
              <span className="text-2xl font-black text-slate-900">
                {mentorReviews.length > 0 
                  ? (mentorReviews.reduce((sum, r) => sum + (r.rating || 5), 0) / mentorReviews.length).toFixed(1) 
                  : '5.0'}
              </span>
              <span className="text-xs text-amber-500 font-bold block">★ Rating</span>
            </div>
            <div className="w-px h-8 bg-slate-200" />
            <div className="text-center">
              <span className="text-2xl font-black text-indigo-600">{mentorReviews.length}</span>
              <span className="text-xs text-slate-500 font-bold block">Reviews</span>
            </div>
          </div>
        </div>

        {mentorReviews.length === 0 ? (
          <div className="py-12 text-center text-slate-400 space-y-2">
            <MessageSquare className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-sm font-medium">No student reviews received yet.</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">When learners complete mentorship sessions with you and submit reviews, they will appear here in real time.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {mentorReviews.map((rev) => (
              <div key={rev.id} className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs overflow-hidden">
                      {rev.student?.avatar_url ? (
                        <img src={rev.student.avatar_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <span className="font-bold text-slate-900 text-xs block">{rev.student?.display_name || 'YARA Learner'}</span>
                      <span className="text-[10px] text-slate-400">{new Date(rev.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center text-amber-400">
                    {Array.from({ length: rev.rating || 5 }).map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-current" />
                    ))}
                  </div>
                </div>
                {rev.comment && (
                  <p className="text-xs text-slate-700 leading-relaxed font-medium bg-white p-3 rounded-xl border border-slate-200/60">
                    "{rev.comment}"
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
