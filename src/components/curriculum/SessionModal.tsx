import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Video, 
  HelpCircle, 
  FileText, 
  Rocket, 
  CheckCircle2, 
  ExternalLink, 
  Send, 
  AlertCircle, 
  Sparkles, 
  X, 
  Code, 
  Link as LinkIcon,
  Check,
  RotateCcw,
  MessageSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CurriculumSession } from '../../constants/curriculum';
import { SessionQuestion, SessionAssignment, SessionProject } from '../../types/curriculum';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../AuthContext';

interface SessionModalProps {
  session: CurriculumSession | null;
  isOpen: boolean;
  onClose: () => void;
  onSessionUpdated?: () => void;
}

type TabType = 'overview' | 'videos' | 'questions' | 'assignments' | 'projects' | 'feedback';

export default function SessionModal({ session, isOpen, onClose, onSessionUpdated }: SessionModalProps) {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  
  // Interactive Questions state
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});
  const [checkedQuestions, setCheckedQuestions] = useState<Record<string, boolean>>({});

  // Assignment submission state
  const [assignmentSubmissions, setAssignmentSubmissions] = useState<Record<string, {
    content: string;
    link: string;
    submitted: boolean;
  }>>({});

  // Project submission state
  const [projectSubmissions, setProjectSubmissions] = useState<Record<string, {
    content: string;
    link: string;
    submitted: boolean;
  }>>({});

  // Feedback state
  const [feedbackStatus, setFeedbackStatus] = useState<'done' | 'partially' | 'struggling'>('done');
  const [successComment, setSuccessComment] = useState('');
  const [struggleComment, setStruggleComment] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [feedbackSaved, setFeedbackSaved] = useState(false);

  useEffect(() => {
    if (session && profile?.id) {
      fetchUserSessionData();
    }
  }, [session, profile?.id]);

  const fetchUserSessionData = async () => {
    if (!session || !profile?.id) return;
    try {
      // Fetch feedback
      const { data: fb } = await supabase
        .from('curriculum_feedback')
        .select('*')
        .eq('user_id', profile.id)
        .eq('session_id', session.id)
        .maybeSingle();

      if (fb) {
        setFeedbackStatus(fb.status || 'done');
        setSuccessComment(fb.success_comment || '');
        setStruggleComment(fb.struggle_comment || '');
        setFeedbackSaved(true);
      }

      // Fetch submissions
      const { data: subs } = await supabase
        .from('curriculum_submissions')
        .select('*')
        .eq('user_id', profile.id)
        .eq('session_id', session.id);

      if (subs) {
        const asMap: Record<string, any> = {};
        const prMap: Record<string, any> = {};
        subs.forEach(s => {
          if (s.submission_type === 'assignment') {
            asMap[s.item_id || 'default'] = {
              content: s.content || '',
              link: s.submission_link || '',
              submitted: true
            };
          } else if (s.submission_type === 'project') {
            prMap[s.item_id || 'default'] = {
              content: s.content || '',
              link: s.submission_link || '',
              submitted: true
            };
          }
        });
        setAssignmentSubmissions(asMap);
        setProjectSubmissions(prMap);
      }
    } catch (err) {
      console.error('Error fetching session details:', err);
    }
  };

  if (!isOpen || !session) return null;

  const handleSelectAnswer = (qId: string, optIdx: number) => {
    setUserAnswers(prev => ({ ...prev, [qId]: optIdx }));
    setCheckedQuestions(prev => ({ ...prev, [qId]: true }));
  };

  const handleSaveFeedback = async () => {
    if (!profile?.id || !session) return;
    setSubmittingFeedback(true);
    try {
      await supabase.from('curriculum_feedback').upsert({
        user_id: profile.id,
        session_id: session.id,
        status: feedbackStatus,
        success_comment: successComment,
        struggle_comment: struggleComment,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id,session_id' });

      setFeedbackSaved(true);
      if (onSessionUpdated) onSessionUpdated();
    } catch (err) {
      console.error('Error saving feedback:', err);
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const handleSubmitAssignment = async (assignmentId: string) => {
    if (!profile?.id || !session) return;
    const item = assignmentSubmissions[assignmentId] || { content: '', link: '' };
    if (!item.content && !item.link) {
      alert('Please enter your response or provide a link.');
      return;
    }

    try {
      await supabase.from('curriculum_submissions').upsert({
        user_id: profile.id,
        session_id: session.id,
        submission_type: 'assignment',
        item_id: assignmentId,
        content: item.content,
        submission_link: item.link,
        status: 'submitted',
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id,session_id,submission_type,item_id' });

      setAssignmentSubmissions(prev => ({
        ...prev,
        [assignmentId]: { ...item, submitted: true }
      }));
      alert('Assignment submitted successfully!');
      if (onSessionUpdated) onSessionUpdated();
    } catch (err) {
      console.error('Error submitting assignment:', err);
    }
  };

  const handleSubmitProject = async (projectId: string) => {
    if (!profile?.id || !session) return;
    const item = projectSubmissions[projectId] || { content: '', link: '' };
    if (!item.content && !item.link) {
      alert('Please provide project details or simulation link.');
      return;
    }

    try {
      await supabase.from('curriculum_submissions').upsert({
        user_id: profile.id,
        session_id: session.id,
        submission_type: 'project',
        item_id: projectId,
        content: item.content,
        submission_link: item.link,
        status: 'submitted',
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id,session_id,submission_type,item_id' });

      setProjectSubmissions(prev => ({
        ...prev,
        [projectId]: { ...item, submitted: true }
      }));
      alert('Project submitted successfully!');
      if (onSessionUpdated) onSessionUpdated();
    } catch (err) {
      console.error('Error submitting project:', err);
    }
  };

  // Helper to format video URL (e.g. YouTube embed)
  const getEmbedUrl = (url: string) => {
    if (url.includes('youtube.com/watch?v=')) {
      return url.replace('watch?v=', 'embed/');
    }
    if (url.includes('youtu.be/')) {
      return url.replace('youtu.be/', 'www.youtube.com/embed/');
    }
    return url;
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 md:p-6 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl overflow-hidden my-auto border border-slate-100 flex flex-col max-h-[90vh]"
      >
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-6 pb-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 bg-indigo-500/20 text-indigo-400 font-mono font-bold text-xs rounded-lg border border-indigo-500/30">
                  {session.id}
                </span>
                <span className="px-2.5 py-0.5 bg-slate-800 text-slate-300 font-bold text-xs rounded-lg uppercase">
                  {session.part}
                </span>
                <span className={`px-2.5 py-0.5 font-bold text-xs rounded-lg ${
                  session.type === 'online' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                }`}>
                  {session.type === 'online' ? 'Virtual Session' : 'Physical Lab Day'}
                </span>
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-white tracking-tight pt-1">
                {session.topic}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl transition-colors shrink-0 ml-4"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center space-x-1 sm:space-x-2 mt-6 overflow-x-auto no-scrollbar border-b border-slate-800 pb-1">
            {[
              { id: 'overview', label: 'Lesson', icon: BookOpen },
              { id: 'videos', label: 'Videos & Resources', icon: Video, count: (session.resources?.length || 0) + (session.video_url ? 1 : 0) },
              { id: 'questions', label: 'Questions & Quiz', icon: HelpCircle, count: session.questions?.length || 0 },
              { id: 'assignments', label: 'Assignments', icon: FileText, count: session.assignments?.length || 0 },
              { id: 'projects', label: 'Mini-Projects', icon: Rocket, count: session.projects?.length || 0 },
              { id: 'feedback', label: 'Feedback & Done', icon: MessageSquare }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <tab.icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {tab.count !== undefined && tab.count > 0 && (
                  <span className={`px-1.5 py-0.2 text-[10px] rounded-full font-bold ${
                    activeTab === tab.id ? 'bg-indigo-700 text-white' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content Body */}
        <div className="p-6 md:p-8 overflow-y-auto flex-1 text-slate-700">
          {/* TAB 1: OVERVIEW & THEORY */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 md:p-5">
                <h4 className="text-xs font-bold text-indigo-900 uppercase tracking-wider mb-1">Key Learning Outcome</h4>
                <p className="text-sm font-semibold text-indigo-950">{session.outcome}</p>
              </div>

              {session.description && (
                <div className="text-sm leading-relaxed text-slate-600">
                  {session.description}
                </div>
              )}

              {session.details?.theory && session.details.theory.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
                    <BookOpen className="w-4 h-4 text-indigo-600" />
                    <span>Theoretical Foundations & Concepts</span>
                  </h4>
                  <div className="grid gap-2.5">
                    {session.details.theory.map((item, idx) => (
                      <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs font-medium text-slate-800 flex items-start space-x-2.5">
                        <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold shrink-0 text-[10px]">
                          {idx + 1}
                        </span>
                        <span className="mt-0.5">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {session.details?.formulas && session.details.formulas.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
                    <Code className="w-4 h-4 text-emerald-600" />
                    <span>Formulas & Calculations</span>
                  </h4>
                  <div className="grid gap-2">
                    {session.details.formulas.map((formula, idx) => (
                      <div key={idx} className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100 text-xs font-mono font-bold text-emerald-900">
                        {formula}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {session.details?.safetyRules && session.details.safetyRules.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-bold text-amber-900 text-sm flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                    <span>Non-Negotiable Safety Rules</span>
                  </h4>
                  <div className="grid gap-2">
                    {session.details.safetyRules.map((rule, idx) => (
                      <div key={idx} className="p-3 bg-amber-50 rounded-xl border border-amber-200/80 text-xs font-semibold text-amber-900 flex items-start space-x-2">
                        <span className="w-4 h-4 rounded-full bg-amber-200 text-amber-900 flex items-center justify-center text-[10px] shrink-0 font-bold">!</span>
                        <span>{rule}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {session.details?.activities && session.details.activities.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    <span>Laboratory & Practical Activities</span>
                  </h4>
                  <div className="grid gap-2">
                    {session.details.activities.map((act, idx) => (
                      <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs font-medium text-slate-700 flex items-start space-x-2.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{act}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: VIDEOS & STUDY SOURCES */}
          {activeTab === 'videos' && (
            <div className="space-y-6">
              {/* Main Video Lecture */}
              {session.video_url ? (
                <div className="space-y-3">
                  <h4 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
                    <Video className="w-4 h-4 text-indigo-600" />
                    <span>Session Video Lecture & Walkthrough</span>
                  </h4>
                  <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm aspect-video bg-black">
                    <iframe
                      src={getEmbedUrl(session.video_url)}
                      title={session.topic}
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                  <div className="flex justify-end">
                    <a
                      href={session.video_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center space-x-1"
                    >
                      <span>Open on external player</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-50 rounded-2xl p-8 text-center border border-slate-200">
                  <Video className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-slate-700">No video attached yet</p>
                  <p className="text-xs text-slate-400">The instructor will upload live session recordings here.</p>
                </div>
              )}

              {/* Study Materials & Starters */}
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <h4 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
                  <LinkIcon className="w-4 h-4 text-indigo-600" />
                  <span>Curated Study Sources, Simulators & Datasheets</span>
                </h4>

                {session.resources && session.resources.length > 0 ? (
                  <div className="grid gap-3">
                    {session.resources.map((res, idx) => (
                      <a
                        key={idx}
                        href={res.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-4 bg-slate-50 hover:bg-indigo-50/50 rounded-2xl border border-slate-200 hover:border-indigo-200 transition-all flex items-center justify-between group"
                      >
                        <div className="space-y-1 pr-4">
                          <div className="flex items-center space-x-2">
                            <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 font-bold text-[10px] rounded uppercase">
                              {res.type}
                            </span>
                            <h5 className="font-bold text-sm text-slate-900 group-hover:text-indigo-600 transition-colors">
                              {res.title}
                            </h5>
                          </div>
                          {res.description && (
                            <p className="text-xs text-slate-500">{res.description}</p>
                          )}
                        </div>
                        <div className="w-8 h-8 rounded-xl bg-white group-hover:bg-indigo-600 group-hover:text-white text-slate-400 flex items-center justify-center shrink-0 border border-slate-200 transition-all">
                          <ExternalLink className="w-4 h-4" />
                        </div>
                      </a>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">No external resource links attached.</p>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: QUESTIONS & QUIZ */}
          {activeTab === 'questions' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between bg-indigo-50/70 p-4 rounded-2xl border border-indigo-100">
                <div>
                  <h4 className="font-bold text-sm text-indigo-950">Session Concept Checks</h4>
                  <p className="text-xs text-indigo-700">Answer each question to verify understanding before moving to the next session.</p>
                </div>
                <HelpCircle className="w-6 h-6 text-indigo-500 shrink-0 ml-3" />
              </div>

              {session.questions && session.questions.length > 0 ? (
                <div className="space-y-5">
                  {session.questions.map((q, qIdx) => {
                    const selected = userAnswers[q.id];
                    const isChecked = checkedQuestions[q.id];
                    const isCorrect = selected === q.correctIndex;

                    return (
                      <div key={q.id} className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80 space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <h5 className="font-bold text-sm text-slate-900">
                            {qIdx + 1}. {q.question}
                          </h5>
                        </div>

                        <div className="space-y-2">
                          {q.options.map((opt, optIdx) => {
                            const isOptSelected = selected === optIdx;
                            return (
                              <button
                                key={optIdx}
                                onClick={() => handleSelectAnswer(q.id, optIdx)}
                                className={`w-full text-left p-3 rounded-xl border text-xs font-medium transition-all flex items-start space-x-2.5 ${
                                  isChecked && optIdx === q.correctIndex
                                    ? 'border-emerald-500 bg-emerald-50 text-emerald-950 font-bold'
                                    : isChecked && isOptSelected && !isCorrect
                                    ? 'border-rose-400 bg-rose-50 text-rose-950 font-bold'
                                    : isOptSelected
                                    ? 'border-indigo-600 bg-indigo-50 text-indigo-950 font-semibold'
                                    : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                                }`}
                              >
                                <span className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                                  isChecked && optIdx === q.correctIndex
                                    ? 'border-emerald-600 bg-emerald-600 text-white'
                                    : isChecked && isOptSelected && !isCorrect
                                    ? 'border-rose-500 bg-rose-500 text-white'
                                    : isOptSelected
                                    ? 'border-indigo-600 bg-indigo-600 text-white'
                                    : 'border-slate-300'
                                }`}>
                                  {isOptSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                                </span>
                                <span>{opt}</span>
                              </button>
                            );
                          })}
                        </div>

                        {/* Explanation Box */}
                        {isChecked && (
                          <div className={`p-3 rounded-xl border text-xs leading-relaxed ${
                            isCorrect ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-rose-50 border-rose-200 text-rose-900'
                          }`}>
                            <div className="font-bold mb-1 flex items-center space-x-1.5">
                              {isCorrect ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
                              <span>{isCorrect ? 'Correct!' : 'Incorrect'}</span>
                            </div>
                            <p>{q.explanation}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-slate-50 rounded-2xl p-8 text-center border border-slate-200">
                  <p className="text-xs text-slate-500">No questions posted for this session yet.</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: ASSIGNMENTS */}
          {activeTab === 'assignments' && (
            <div className="space-y-6">
              {session.assignments && session.assignments.length > 0 ? (
                session.assignments.map((as, idx) => {
                  const subData = assignmentSubmissions[as.id] || { content: '', link: '', submitted: false };
                  return (
                    <div key={as.id} className="bg-slate-50 rounded-2xl p-6 border border-slate-200 space-y-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 font-bold text-[10px] rounded uppercase">
                            Assignment {idx + 1}
                          </span>
                          <h4 className="text-base font-bold text-slate-900">{as.title}</h4>
                        </div>
                        {subData.submitted && (
                          <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full flex items-center space-x-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Submitted</span>
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed">{as.description}</p>

                      {as.instructions && as.instructions.length > 0 && (
                        <div className="space-y-2">
                          <h5 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Instructions</h5>
                          <ul className="list-disc list-inside space-y-1 text-xs text-slate-700 pl-1">
                            {as.instructions.map((ins, iIdx) => (
                              <li key={iIdx}>{ins}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {as.deliverables && as.deliverables.length > 0 && (
                        <div className="space-y-1.5 p-3 bg-white rounded-xl border border-slate-200 text-xs">
                          <span className="font-bold text-slate-900">Required Deliverables:</span>
                          <p className="text-slate-600">{as.deliverables.join(' • ')}</p>
                        </div>
                      )}

                      {/* Submission Box */}
                      <div className="pt-3 border-t border-slate-200/80 space-y-3">
                        <h5 className="text-xs font-bold text-slate-900">Your Submission</h5>
                        <textarea
                          rows={3}
                          value={subData.content}
                          onChange={e => setAssignmentSubmissions({
                            ...assignmentSubmissions,
                            [as.id]: { ...subData, content: e.target.value }
                          })}
                          placeholder="Write your calculations, explanation, or code summary here..."
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-indigo-500 outline-none text-xs text-slate-900"
                        />
                        <div className="flex flex-col sm:flex-row items-center gap-3">
                          <div className="relative flex-1 w-full">
                            <LinkIcon className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                            <input
                              type="url"
                              value={subData.link}
                              onChange={e => setAssignmentSubmissions({
                                ...assignmentSubmissions,
                                [as.id]: { ...subData, link: e.target.value }
                              })}
                              placeholder="Simulation URL / GitHub repo / Cloud drive link"
                              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-indigo-500 outline-none text-xs text-slate-900"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => handleSubmitAssignment(as.id)}
                            className="w-full sm:w-auto px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-200 transition-all flex items-center justify-center space-x-1.5 shrink-0"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>{subData.submitted ? 'Update Submission' : 'Submit Assignment'}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="bg-slate-50 rounded-2xl p-8 text-center border border-slate-200">
                  <p className="text-xs text-slate-500">No assignments assigned for this session.</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: MINI-PROJECTS */}
          {activeTab === 'projects' && (
            <div className="space-y-6">
              {session.projects && session.projects.length > 0 ? (
                session.projects.map((proj, idx) => {
                  const prSub = projectSubmissions[proj.id] || { content: '', link: '', submitted: false };
                  return (
                    <div key={proj.id} className="bg-slate-50 rounded-2xl p-6 border border-slate-200 space-y-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="px-2 py-0.5 bg-purple-100 text-purple-700 font-bold text-[10px] rounded uppercase">
                              Mini-Project
                            </span>
                            {proj.simulationPlatform && (
                              <span className="px-2 py-0.5 bg-slate-200 text-slate-700 font-bold text-[10px] rounded">
                                {proj.simulationPlatform}
                              </span>
                            )}
                          </div>
                          <h4 className="text-base font-bold text-slate-900">{proj.title}</h4>
                        </div>
                        {prSub.submitted && (
                          <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full flex items-center space-x-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Submitted</span>
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed">{proj.description}</p>

                      {proj.objectives && proj.objectives.length > 0 && (
                        <div className="space-y-2">
                          <h5 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Project Objectives</h5>
                          <div className="grid gap-2">
                            {proj.objectives.map((obj, oIdx) => (
                              <div key={oIdx} className="p-2.5 bg-white rounded-xl border border-slate-200 text-xs text-slate-700 flex items-start space-x-2">
                                <span className="w-4 h-4 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-[10px] shrink-0">✓</span>
                                <span>{obj}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {proj.starterLink && (
                        <a
                          href={proj.starterLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-xl border border-indigo-200 hover:bg-indigo-100 transition-colors text-xs font-bold"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Open Starter Simulation Sandbox</span>
                        </a>
                      )}

                      {/* Project Submission Form */}
                      <div className="pt-3 border-t border-slate-200/80 space-y-3">
                        <h5 className="text-xs font-bold text-slate-900">Project Deliverables & Working Link</h5>
                        <textarea
                          rows={3}
                          value={prSub.content}
                          onChange={e => setProjectSubmissions({
                            ...projectSubmissions,
                            [proj.id]: { ...prSub, content: e.target.value }
                          })}
                          placeholder="Describe how you met the objectives, challenges overcome, and component wiring."
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-indigo-500 outline-none text-xs text-slate-900"
                        />
                        <div className="flex flex-col sm:flex-row items-center gap-3">
                          <div className="relative flex-1 w-full">
                            <LinkIcon className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                            <input
                              type="url"
                              value={prSub.link}
                              onChange={e => setProjectSubmissions({
                                ...projectSubmissions,
                                [proj.id]: { ...prSub, link: e.target.value }
                              })}
                              placeholder="Wokwi project URL / Tinkercad link / Video demo"
                              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-indigo-500 outline-none text-xs text-slate-900"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => handleSubmitProject(proj.id)}
                            className="w-full sm:w-auto px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-200 transition-all flex items-center justify-center space-x-1.5 shrink-0"
                          >
                            <Rocket className="w-3.5 h-3.5" />
                            <span>{prSub.submitted ? 'Update Project' : 'Submit Project'}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="bg-slate-50 rounded-2xl p-8 text-center border border-slate-200">
                  <p className="text-xs text-slate-500">No mini-projects for this session.</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 6: FEEDBACK & DONE */}
          {activeTab === 'feedback' && (
            <div className="space-y-6">
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 space-y-4">
                <h4 className="font-bold text-sm text-slate-900">Session Progress Status</h4>
                
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'done', label: 'Done / Mastered', color: 'emerald' },
                    { id: 'partially', label: 'Partially Done', color: 'amber' },
                    { id: 'struggling', label: 'Need Assistance', color: 'rose' }
                  ].map(s => (
                    <button
                      key={s.id}
                      onClick={() => setFeedbackStatus(s.id as any)}
                      className={`p-3 rounded-xl border text-xs font-bold transition-all text-center ${
                        feedbackStatus === s.id
                          ? s.id === 'done' 
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-200'
                            : s.id === 'partially'
                            ? 'bg-amber-500 text-white border-amber-500 shadow-md shadow-amber-200'
                            : 'bg-rose-600 text-white border-rose-600 shadow-md shadow-rose-200'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>

                <div className="space-y-3 pt-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-900 mb-1">
                      What went well or what did you learn?
                    </label>
                    <textarea
                      rows={2}
                      value={successComment}
                      onChange={e => setSuccessComment(e.target.value)}
                      placeholder="e.g. Mastered Ohm's law and wired Tinkercad LEDs cleanly!"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-900 mb-1">
                      What was challenging or where do you need help?
                    </label>
                    <textarea
                      rows={2}
                      value={struggleComment}
                      onChange={e => setStruggleComment(e.target.value)}
                      placeholder="e.g. Understanding pull-up resistor voltage drops..."
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  {feedbackSaved && (
                    <span className="text-xs text-emerald-600 font-bold flex items-center space-x-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Progress recorded in profile</span>
                    </span>
                  )}
                  <button
                    onClick={handleSaveFeedback}
                    disabled={submittingFeedback}
                    className="ml-auto px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-200 transition-all flex items-center space-x-2"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{submittingFeedback ? 'Saving...' : 'Save Progress'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
