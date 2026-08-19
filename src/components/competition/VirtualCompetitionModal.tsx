import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  Clock, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink, 
  Send, 
  Link as LinkIcon, 
  FileText, 
  Video, 
  Cpu, 
  X, 
  Award, 
  Users, 
  ChevronRight, 
  ShieldCheck, 
  Code
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { VirtualCompetition, VirtualSubmission } from '../../types/competition';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../AuthContext';

interface VirtualCompetitionModalProps {
  competition: VirtualCompetition | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmissionSuccess?: () => void;
}

export default function VirtualCompetitionModal({ 
  competition, 
  isOpen, 
  onClose, 
  onSubmissionSuccess 
}: VirtualCompetitionModalProps) {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState<'brief' | 'submit' | 'leaderboard'>('brief');
  
  // Submission form state
  const [simulationUrl, setSimulationUrl] = useState('');
  const [repoUrl, setRepoUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [schematicUrl, setSchematicUrl] = useState('');
  const [writeup, setWriteup] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [userSubmission, setUserSubmission] = useState<VirtualSubmission | null>(null);

  // Leaderboard state
  const [submissions, setSubmissions] = useState<VirtualSubmission[]>([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);

  // Countdown timer state
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number } | null>(null);

  useEffect(() => {
    if (competition) {
      // Calculate remaining time
      const targetTime = new Date(Date.now() + (competition.duration_hours || 48) * 3600 * 1000).getTime();
      const updateTimer = () => {
        const diff = targetTime - Date.now();
        if (diff <= 0) {
          setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
        } else {
          const hours = Math.floor(diff / (1000 * 60 * 60));
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((diff % (1000 * 60)) / 1000);
          setTimeLeft({ hours, minutes, seconds });
        }
      };
      updateTimer();
      const interval = setInterval(updateTimer, 1000);
      return () => clearInterval(interval);
    }
  }, [competition]);

  useEffect(() => {
    if (competition && profile?.id) {
      fetchUserSubmission();
      fetchLeaderboard();
    }
  }, [competition, profile?.id]);

  const fetchUserSubmission = async () => {
    if (!competition || !profile?.id) return;
    try {
      const { data } = await supabase
        .from('virtual_competition_submissions')
        .select('*')
        .eq('competition_id', competition.id)
        .eq('user_id', profile.id)
        .maybeSingle();

      if (data) {
        setUserSubmission(data);
        setSimulationUrl(data.simulation_url || '');
        setRepoUrl(data.repo_url || '');
        setVideoUrl(data.video_url || '');
        setSchematicUrl(data.schematic_url || '');
        setWriteup(data.writeup || '');
      }
    } catch (err) {
      console.error('Error fetching user submission:', err);
    }
  };

  const fetchLeaderboard = async () => {
    if (!competition) return;
    setLoadingLeaderboard(true);
    try {
      const { data } = await supabase
        .from('virtual_competition_submissions')
        .select('*')
        .eq('competition_id', competition.id)
        .order('score', { ascending: false });

      setSubmissions(data || []);
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
    } finally {
      setLoadingLeaderboard(false);
    }
  };

  if (!isOpen || !competition) return null;

  const handleSubmitEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.id || !competition) return;
    if (!simulationUrl && !repoUrl) {
      alert('Please provide a Simulation URL or Repository link.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        competition_id: competition.id,
        user_id: profile.id,
        user_name: profile.display_name || 'Anonymous Innovator',
        user_avatar: profile.avatar_url,
        user_email: profile.email,
        simulation_url: simulationUrl,
        repo_url: repoUrl,
        video_url: videoUrl,
        schematic_url: schematicUrl,
        writeup,
        status: 'submitted' as const,
        created_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('virtual_competition_submissions')
        .upsert(payload, { onConflict: 'competition_id,user_id' })
        .select()
        .single();

      if (error) throw error;
      setUserSubmission(data || payload);
      alert('Your virtual competition entry has been submitted for evaluation!');
      if (onSubmissionSuccess) onSubmissionSuccess();
      fetchLeaderboard();
      setActiveTab('leaderboard');
    } catch (err: any) {
      console.error('Error submitting competition entry:', err);
      alert(err.message || 'Failed to submit entry.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 md:p-6 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl overflow-hidden my-auto border border-slate-100 flex flex-col max-h-[90vh]"
      >
        {/* Header with Background Accent */}
        <div className="bg-slate-900 text-white p-6 pb-4 relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-0.5 bg-amber-500/20 text-amber-400 font-bold text-xs rounded-lg uppercase tracking-wider flex items-center space-x-1">
                    <Trophy className="w-3.5 h-3.5" />
                    <span>Virtual Online Arena</span>
                  </span>
                  <span className="px-2.5 py-0.5 bg-indigo-500/20 text-indigo-400 font-bold text-xs rounded-lg capitalize">
                    {competition.category_label || competition.category.replace('_', ' ')}
                  </span>
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-white tracking-tight pt-1">
                  {competition.title}
                </h3>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-white rounded-xl transition-colors shrink-0 ml-4"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Timeframe Countdown Banner */}
            {timeLeft && (
              <div className="mt-4 p-3 bg-slate-800/80 backdrop-blur-md rounded-2xl border border-slate-700/80 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center space-x-2 text-slate-300">
                  <Clock className="w-4 h-4 text-amber-400 animate-pulse" />
                  <span>Timeframe Remaining:</span>
                </div>
                <div className="flex items-center space-x-2 font-mono font-black text-amber-400 text-sm">
                  <span className="px-2 py-0.5 bg-slate-900 rounded-lg">{String(timeLeft.hours).padStart(2, '0')}h</span>
                  <span>:</span>
                  <span className="px-2 py-0.5 bg-slate-900 rounded-lg">{String(timeLeft.minutes).padStart(2, '0')}m</span>
                  <span>:</span>
                  <span className="px-2 py-0.5 bg-slate-900 rounded-lg">{String(timeLeft.seconds).padStart(2, '0')}s</span>
                </div>
                {competition.prize && (
                  <div className="flex items-center space-x-1 text-emerald-400 font-bold text-xs">
                    <Award className="w-3.5 h-3.5" />
                    <span>{competition.prize}</span>
                  </div>
                )}
              </div>
            )}

            {/* Tabs Navigation */}
            <div className="flex items-center space-x-2 mt-5 border-b border-slate-800 pb-1">
              {[
                { id: 'brief', label: 'Challenge Brief & Rules', icon: FileText },
                { id: 'submit', label: 'Submit Solution', icon: Send, badge: userSubmission ? 'Submitted' : undefined },
                { id: 'leaderboard', label: 'Live Leaderboard', icon: Trophy, count: submissions.length }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  <tab.icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span className="px-1.5 py-0.2 bg-emerald-500 text-white text-[10px] rounded-full">
                      ✓
                    </span>
                  )}
                  {tab.count !== undefined && tab.count > 0 && (
                    <span className="px-1.5 py-0.2 bg-slate-800 text-slate-300 text-[10px] rounded-full">
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 md:p-8 overflow-y-auto flex-1 text-slate-700">
          {/* TAB 1: BRIEF */}
          {activeTab === 'brief' && (
            <div className="space-y-6">
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Problem Statement & Goal</h4>
                <p className="text-sm md:text-base text-slate-900 leading-relaxed font-medium">
                  {competition.description}
                </p>
              </div>

              {/* Starter Sandbox */}
              {competition.starter_url && (
                <div className="p-4 bg-indigo-50/80 rounded-2xl border border-indigo-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
                      <Code className="w-5 h-5" />
                    </div>
                    <div>
                      <h5 className="font-bold text-sm text-indigo-950">Official Starter Simulation Template</h5>
                      <p className="text-xs text-indigo-700">Pre-configured circuit and hardware components ready to test.</p>
                    </div>
                  </div>
                  <a
                    href={competition.starter_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center space-x-1.5 shrink-0"
                  >
                    <span>Launch Simulator</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}

              {/* Rules & Constraints */}
              {competition.rules && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Technical Rules & Constraints</h4>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs font-medium text-slate-800 whitespace-pre-line leading-relaxed">
                    {competition.rules}
                  </div>
                </div>
              )}

              {/* Evaluation Criteria */}
              {competition.criteria && competition.criteria.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Judging & Scoring Rubric</h4>
                  <div className="grid gap-2">
                    {competition.criteria.map((cr, idx) => (
                      <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 flex items-center space-x-2">
                        <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                        <span>{cr}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: SUBMIT */}
          {activeTab === 'submit' && (
            <form onSubmit={handleSubmitEntry} className="space-y-5">
              {userSubmission && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs text-emerald-900">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Your solution has been submitted! You can update your links anytime before the deadline.</span>
                  </div>
                  {userSubmission.score !== undefined && (
                    <span className="px-2.5 py-1 bg-emerald-200 text-emerald-950 font-bold rounded-lg">
                      Score: {userSubmission.score}/100
                    </span>
                  )}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1 flex items-center space-x-1">
                  <LinkIcon className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Interactive Simulation URL (Wokwi / Tinkercad)</span>
                </label>
                <input
                  type="url"
                  value={simulationUrl}
                  onChange={e => setSimulationUrl(e.target.value)}
                  placeholder="https://wokwi.com/projects/..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-900 mb-1 flex items-center space-x-1">
                    <Code className="w-3.5 h-3.5 text-indigo-600" />
                    <span>GitHub Source Code Repository</span>
                  </label>
                  <input
                    type="url"
                    value={repoUrl}
                    onChange={e => setRepoUrl(e.target.value)}
                    placeholder="https://github.com/username/challenge-repo"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-900 mb-1 flex items-center space-x-1">
                    <Video className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Demo / Walkthrough Video Link (YouTube / Loom)</span>
                  </label>
                  <input
                    type="url"
                    value={videoUrl}
                    onChange={e => setVideoUrl(e.target.value)}
                    placeholder="https://youtube.com/watch?v=..."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1 flex items-center space-x-1">
                  <Cpu className="w-3.5 h-3.5 text-indigo-600" />
                  <span>EasyEDA / KiCad PCB Gerber Link (if applicable)</span>
                </label>
                <input
                  type="url"
                  value={schematicUrl}
                  onChange={e => setSchematicUrl(e.target.value)}
                  placeholder="https://easyeda.com/editor#id=..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1">
                  Technical Architecture & Solution Writeup
                </label>
                <textarea
                  rows={4}
                  value={writeup}
                  onChange={e => setWriteup(e.target.value)}
                  placeholder="Describe your algorithm, state machine, sensor filtering methods, and circuit calculations."
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-lg shadow-indigo-200 transition-all flex items-center space-x-2 disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{submitting ? 'Submitting...' : userSubmission ? 'Update Entry' : 'Submit Challenge Entry'}</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: LEADERBOARD */}
          {activeTab === 'leaderboard' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Challenge Ranked Scoreboard</h4>
                  <p className="text-xs text-slate-500">Live evaluation results evaluated by YARIA technical judges.</p>
                </div>
                <button
                  onClick={fetchLeaderboard}
                  className="text-xs font-bold text-indigo-600 hover:underline"
                >
                  Refresh
                </button>
              </div>

              {submissions.length === 0 ? (
                <div className="bg-slate-50 rounded-2xl p-8 text-center border border-slate-200">
                  <Trophy className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-slate-700">No submissions yet</p>
                  <p className="text-xs text-slate-400">Be the first innovator to submit a working solution!</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {submissions.map((sub, index) => {
                    const rank = index + 1;
                    const isPodium = rank <= 3;
                    return (
                      <div
                        key={sub.id || index}
                        className={`p-4 rounded-2xl border transition-all flex items-center justify-between ${
                          rank === 1
                            ? 'bg-amber-50/80 border-amber-300 shadow-sm'
                            : rank === 2
                            ? 'bg-slate-50 border-slate-300'
                            : rank === 3
                            ? 'bg-amber-50/30 border-amber-200'
                            : 'bg-white border-slate-200'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs ${
                            rank === 1 ? 'bg-amber-500 text-slate-900 shadow-sm' :
                            rank === 2 ? 'bg-slate-300 text-slate-800' :
                            rank === 3 ? 'bg-amber-700 text-white' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : rank}
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <h5 className="font-bold text-sm text-slate-900">{sub.user_name || 'Innovator'}</h5>
                              {sub.simulation_url && (
                                <a
                                  href={sub.simulation_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[10px] px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded font-bold hover:bg-indigo-100 flex items-center space-x-0.5"
                                >
                                  <span>View Code/Simulation</span>
                                  <ExternalLink className="w-2.5 h-2.5" />
                                </a>
                              )}
                            </div>
                            {sub.feedback && (
                              <p className="text-xs text-slate-500 italic mt-0.5">"{sub.feedback}"</p>
                            )}
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-lg font-black text-indigo-600">
                            {sub.score !== undefined ? `${sub.score} pts` : 'Under Review'}
                          </span>
                          <span className="block text-[10px] text-slate-400 uppercase font-bold">
                            {sub.status}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
