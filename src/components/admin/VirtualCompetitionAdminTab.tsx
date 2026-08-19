import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  Plus, 
  Trash2, 
  Edit2, 
  Save, 
  Clock, 
  ExternalLink, 
  CheckCircle2, 
  Code, 
  Check, 
  X, 
  Users, 
  Award,
  AlertCircle
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { VirtualCompetition, VirtualSubmission } from '../../types/competition';
import { INITIAL_VIRTUAL_COMPETITIONS } from '../../constants/curriculum';

export default function VirtualCompetitionAdminTab() {
  const [competitions, setCompetitions] = useState<VirtualCompetition[]>([]);
  const [submissions, setSubmissions] = useState<VirtualSubmission[]>([]);
  const [activeSubTab, setActiveSubTab] = useState<'challenges' | 'submissions'>('challenges');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Challenge Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingCompId, setEditingCompId] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: '',
    category: 'robot_simulation',
    category_label: 'Robot Simulation Sprint',
    description: '',
    duration_hours: 48,
    starter_url: '',
    rules: '',
    criteria: 'Functional accuracy (40%)\nCode cleanliness (30%)\nSpeed/Optimization (30%)',
    max_score: 100,
    prize: '$100 Hardware Grant + Verified Badge',
    image_url: ''
  });

  // Grading Modal / State
  const [gradingSubmission, setGradingSubmission] = useState<VirtualSubmission | null>(null);
  const [gradeScore, setGradeScore] = useState<number>(90);
  const [gradeFeedback, setGradeFeedback] = useState<string>('');

  useEffect(() => {
    fetchCompetitions();
    fetchSubmissions();
  }, []);

  const fetchCompetitions = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('virtual_competitions')
        .select('*')
        .order('created_at', { ascending: false });

      if (data && data.length > 0) {
        setCompetitions(data);
      } else {
        // Fallback / initial seeds
        setCompetitions(INITIAL_VIRTUAL_COMPETITIONS as VirtualCompetition[]);
      }
    } catch (err) {
      console.error('Error fetching virtual competitions:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubmissions = async () => {
    try {
      const { data } = await supabase
        .from('virtual_competition_submissions')
        .select('*')
        .order('created_at', { ascending: false });

      setSubmissions(data || []);
    } catch (err) {
      console.error('Error fetching virtual submissions:', err);
    }
  };

  const openCreateModal = () => {
    setEditingCompId(null);
    setForm({
      title: '',
      category: 'robot_simulation',
      category_label: 'Robot Simulation Sprint',
      description: '',
      duration_hours: 48,
      starter_url: 'https://wokwi.com/projects/',
      rules: '- Must use specified microcontroller\n- No external libraries beyond standard servo/wire\n- Working Wokwi or Tinkercad URL required',
      criteria: 'Sensor filtering & noise immunity (35%)\nNon-blocking state logic (35%)\nCircuit schematic precision (30%)',
      max_score: 100,
      prize: 'Verified Badge + $100 Hardware Voucher',
      image_url: ''
    });
    setShowModal(true);
  };

  const openEditModal = (comp: VirtualCompetition) => {
    setEditingCompId(comp.id);
    setForm({
      title: comp.title,
      category: comp.category,
      category_label: comp.category_label || '',
      description: comp.description,
      duration_hours: comp.duration_hours,
      starter_url: comp.starter_url || '',
      rules: comp.rules || '',
      criteria: Array.isArray(comp.criteria) ? comp.criteria.join('\n') : (comp.criteria || ''),
      max_score: comp.max_score || 100,
      prize: comp.prize || '',
      image_url: comp.image_url || ''
    });
    setShowModal(true);
  };

  const handleSaveChallenge = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const criteriaArray = form.criteria.split('\n').map(s => s.trim()).filter(Boolean);
      const payload = {
        title: form.title,
        category: form.category,
        category_label: form.category_label,
        description: form.description,
        duration_hours: Number(form.duration_hours),
        starter_url: form.starter_url,
        rules: form.rules,
        criteria: criteriaArray,
        max_score: Number(form.max_score),
        prize: form.prize,
        image_url: form.image_url,
        is_active: true,
        updated_at: new Date().toISOString()
      };

      if (editingCompId && !editingCompId.startsWith('vcomp_')) {
        const { error } = await supabase
          .from('virtual_competitions')
          .update(payload)
          .eq('id', editingCompId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('virtual_competitions')
          .insert(payload);
        if (error) throw error;
      }

      setShowModal(false);
      fetchCompetitions();
      setMessage({ type: 'success', text: 'Virtual competition challenge saved successfully.' });
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      alert('Error saving challenge: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteChallenge = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this virtual competition challenge?')) return;
    try {
      await supabase.from('virtual_competitions').delete().eq('id', id);
      setCompetitions(prev => prev.filter(c => c.id !== id));
      setMessage({ type: 'success', text: 'Challenge deleted.' });
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      alert('Error deleting: ' + err.message);
    }
  };

  const handleGradeSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gradingSubmission) return;

    try {
      await supabase
        .from('virtual_competition_submissions')
        .update({
          score: gradeScore,
          feedback: gradeFeedback,
          status: 'evaluated',
          reviewed_at: new Date().toISOString()
        })
        .eq('id', gradingSubmission.id);

      setGradingSubmission(null);
      fetchSubmissions();
      setMessage({ type: 'success', text: 'Competition entry evaluated and scored!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      alert('Error grading entry: ' + err.message);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header & Sub-Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
        <div className="flex items-center space-x-2">
          {[
            { id: 'challenges', label: 'Virtual Online Challenges', icon: Trophy, count: competitions.length },
            { id: 'submissions', label: 'Student Challenge Entries', icon: Users, count: submissions.length }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center space-x-2 ${
                activeSubTab === tab.id
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                  activeSubTab === tab.id ? 'bg-indigo-700 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        <button
          onClick={openCreateModal}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-2xl shadow-md shadow-indigo-200 transition-all flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>New Virtual Challenge</span>
        </button>
      </div>

      {message && (
        <div className={`p-4 rounded-2xl text-xs font-bold flex items-center space-x-2 ${
          message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
        }`}>
          <CheckCircle2 className="w-4 h-4" />
          <span>{message.text}</span>
        </div>
      )}

      {/* SUB-TAB 1: CHALLENGES LIST */}
      {activeSubTab === 'challenges' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {competitions.map(comp => (
            <div key={comp.id} className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold rounded-lg uppercase">
                    {comp.category_label || comp.category}
                  </span>
                  <div className="flex items-center space-x-1 text-xs text-slate-400 font-bold">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{comp.duration_hours}h limit</span>
                  </div>
                </div>

                <h4 className="font-bold text-slate-900 text-base">{comp.title}</h4>
                <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">{comp.description}</p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => openEditModal(comp)}
                    className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl text-xs font-bold transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteChallenge(comp.id)}
                    className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-xs font-bold transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {comp.starter_url && (
                  <a
                    href={comp.starter_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-bold text-indigo-600 hover:underline flex items-center space-x-1"
                  >
                    <span>Starter Link</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SUB-TAB 2: SUBMISSIONS & EVALUATION */}
      {activeSubTab === 'submissions' && (
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-lg font-bold text-slate-900">Virtual Challenge Student Submissions</h4>
              <p className="text-xs text-slate-500">Evaluate simulation circuits, code repositories, and assign leaderboard scores.</p>
            </div>
            <button onClick={fetchSubmissions} className="text-xs font-bold text-indigo-600 hover:underline">
              Refresh
            </button>
          </div>

          {submissions.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 text-slate-500 text-xs font-medium">
              No virtual challenge entries submitted yet.
            </div>
          ) : (
            <div className="space-y-4">
              {submissions.map(sub => (
                <div key={sub.id} className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h5 className="font-bold text-base text-slate-900">
                        {sub.user_name || 'Student Innovator'} ({sub.user_email})
                      </h5>
                      <span className="text-[10px] text-slate-400">
                        Challenge ID: {sub.competition_id} • Submitted: {new Date(sub.created_at).toLocaleString()}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-lg font-black text-indigo-600">
                        {sub.score !== undefined ? `${sub.score} pts` : 'Pending Score'}
                      </span>
                      <span className="block text-[10px] font-bold text-slate-400 uppercase">
                        {sub.status}
                      </span>
                    </div>
                  </div>

                  {sub.writeup && (
                    <p className="text-xs text-slate-700 bg-white p-3.5 rounded-xl border border-slate-200 whitespace-pre-line">
                      {sub.writeup}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-4 text-xs font-bold">
                    {sub.simulation_url && (
                      <a href={sub.simulation_url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline flex items-center space-x-1">
                        <span>Interactive Simulation Link</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                    {sub.repo_url && (
                      <a href={sub.repo_url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline flex items-center space-x-1">
                        <span>GitHub Code Repo</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                    {sub.video_url && (
                      <a href={sub.video_url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline flex items-center space-x-1">
                        <span>Demo Video</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-200 flex justify-end">
                    <button
                      onClick={() => {
                        setGradingSubmission(sub);
                        setGradeScore(sub.score || 90);
                        setGradeFeedback(sub.feedback || '');
                      }}
                      className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
                    >
                      {sub.score !== undefined ? 'Update Score & Feedback' : 'Score & Review Entry'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* CREATE/EDIT CHALLENGE MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-8 shadow-2xl border border-slate-100 space-y-6 my-auto max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-xl font-bold text-slate-900">
                {editingCompId ? 'Edit Virtual Challenge' : 'Create Virtual Challenge'}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-2 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveChallenge} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1">Challenge Title</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Autonomous Maze Solver Simulation Sprint"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-900 mb-1">Category</label>
                  <select
                    value={form.category}
                    onChange={e => setForm({ ...form, category: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="robot_simulation">Robot Simulation (Wokwi)</option>
                    <option value="pcb_design">PCB Design (EasyEDA/KiCad)</option>
                    <option value="embedded_c">Embedded C/C++ Optimization</option>
                    <option value="iot_telemetry">IoT Telemetry & Cloud</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-900 mb-1">Timeframe (Hours)</label>
                  <input
                    type="number"
                    required
                    value={form.duration_hours}
                    onChange={e => setForm({ ...form, duration_hours: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1">Problem Statement & Objectives</label>
                <textarea
                  rows={3}
                  required
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="Describe the challenge goals, sensor constraints, and requirements..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1">Starter Template URL (Wokwi / Tinkercad)</label>
                <input
                  type="url"
                  value={form.starter_url}
                  onChange={e => setForm({ ...form, starter_url: e.target.value })}
                  placeholder="https://wokwi.com/projects/..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1">Technical Rules & Constraints</label>
                <textarea
                  rows={2}
                  value={form.rules}
                  onChange={e => setForm({ ...form, rules: e.target.value })}
                  placeholder="e.g. Standard Arduino UNO only. Ultrasonic sensor on pins 9 & 10."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1">Judging & Scoring Rubric (1 per line)</label>
                <textarea
                  rows={3}
                  value={form.criteria}
                  onChange={e => setForm({ ...form, criteria: e.target.value })}
                  placeholder="Sensor filtering & noise immunity (35%)\nNon-blocking state logic (35%)\nClean wiring (30%)"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-900 mb-1">Prize & Award Description</label>
                  <input
                    type="text"
                    value={form.prize}
                    onChange={e => setForm({ ...form, prize: e.target.value })}
                    placeholder="e.g. $100 Hardware Grant + 🥇 Badge"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-900 mb-1">Max Score</label>
                  <input
                    type="number"
                    value={form.max_score}
                    onChange={e => setForm({ ...form, max_score: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-200"
                >
                  {saving ? 'Saving...' : 'Save Challenge'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* GRADING MODAL */}
      {gradingSubmission && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-8 shadow-2xl border border-slate-100 space-y-6 my-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Score Challenge Submission</h3>
              <button onClick={() => setGradingSubmission(null)} className="p-2 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGradeSubmission} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1">Score (0 - 100)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  required
                  value={gradeScore}
                  onChange={e => setGradeScore(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-black text-indigo-600 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1">Technical Reviewer Feedback</label>
                <textarea
                  rows={3}
                  value={gradeFeedback}
                  onChange={e => setGradeFeedback(e.target.value)}
                  placeholder="Great state machine implementation and accurate timer calculations!"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setGradingSubmission(null)}
                  className="px-5 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-200"
                >
                  Save Score & Post to Leaderboard
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
