import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';
import { supabase } from '../lib/supabase';
import { CURRICULUM, CurriculumSession, COURSE_LEVELS } from '../constants/curriculum';
import { 
  CheckCircle2, 
  Clock, 
  HelpCircle, 
  ChevronRight, 
  Monitor, 
  Zap, 
  Box, 
  Users, 
  ArrowRight, 
  TrendingUp, 
  Brain, 
  BookOpen, 
  Award, 
  Rocket, 
  Video, 
  FileText, 
  Sparkles, 
  Check, 
  ExternalLink,
  Flame,
  Layers
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import SessionModal from '../components/curriculum/SessionModal';
import FinalExamModal from '../components/curriculum/FinalExamModal';
import FinalProjectModal from '../components/curriculum/FinalProjectModal';
import CertificateModal from '../components/curriculum/CertificateModal';
import BrainstormingQuizModal from '../components/brainstorming/BrainstormingQuizModal';
import { FinalExamAttempt, FinalProjectSubmission, Certificate } from '../types/curriculum';

interface SessionFeedback {
  session_id: string;
  status: 'done' | 'partially' | 'struggling';
  success_comment?: string;
  struggle_comment?: string;
}

export default function Curriculum() {
  const { user, profile } = useAuth();
  const location = useLocation();

  const [selectedLevelId, setSelectedLevelId] = useState<string>('course_level_1');
  const [sessions, setSessions] = useState<CurriculumSession[]>(CURRICULUM);
  const [feedbacks, setFeedbacks] = useState<Record<string, SessionFeedback>>({});
  const [submissionsCount, setSubmissionsCount] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  // Modals state
  const [selectedSession, setSelectedSession] = useState<CurriculumSession | null>(null);
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
  const [isExamModalOpen, setIsExamModalOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);
  const [isBrainstormingModalOpen, setIsBrainstormingModalOpen] = useState(false);

  // User Graduation Records
  const [examAttempt, setExamAttempt] = useState<FinalExamAttempt | null>(null);
  const [projectSubmission, setProjectSubmission] = useState<FinalProjectSubmission | null>(null);
  const [certificate, setCertificate] = useState<Certificate | null>(null);

  useEffect(() => {
    fetchCurriculumData();
  }, [user]);

  // Handle direct certificate link (e.g., /curriculum?cert=YARIA-CERT-...)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const certParam = params.get('cert');
    if (certParam) {
      fetchCertificateByNumber(certParam);
    }
  }, [location.search]);

  async function fetchCertificateByNumber(certNum: string) {
    try {
      const { data } = await supabase
        .from('certificates')
        .select('*')
        .eq('certificate_number', certNum)
        .maybeSingle();

      if (data) {
        setCertificate(data);
        setIsCertModalOpen(true);
      }
    } catch (err) {
      console.error('Error fetching cert by number:', err);
    }
  }

  async function fetchCurriculumData() {
    setLoading(true);
    try {
      // 1. Fetch any custom session overrides / videos from Supabase
      const { data: dbSessions } = await supabase
        .from('curriculum_sessions')
        .select('*');

      if (dbSessions && dbSessions.length > 0) {
        const merged = CURRICULUM.map(s => {
          const custom = dbSessions.find((db: any) => db.session_id === s.id);
          if (custom) {
            return {
              ...s,
              video_url: custom.video_url || s.video_url,
              resources: custom.resources || s.resources,
              questions: custom.questions || s.questions,
              assignments: custom.assignments || s.assignments,
              projects: custom.projects || s.projects
            };
          }
          return s;
        });
        setSessions(merged);
      }

      if (user?.id) {
        // 2. Fetch feedback
        const { data: fbData } = await supabase
          .from('curriculum_feedback')
          .select('*')
          .eq('user_id', user.id);

        const fbMap: Record<string, SessionFeedback> = {};
        fbData?.forEach((fb: any) => {
          fbMap[fb.session_id] = {
            session_id: fb.session_id,
            status: fb.status,
            success_comment: fb.success_comment,
            struggle_comment: fb.struggle_comment
          };
        });
        setFeedbacks(fbMap);

        // 3. Fetch submissions count
        const { data: subData } = await supabase
          .from('curriculum_submissions')
          .select('session_id')
          .eq('user_id', user.id);

        const subMap: Record<string, number> = {};
        subData?.forEach((sub: any) => {
          subMap[sub.session_id] = (subMap[sub.session_id] || 0) + 1;
        });
        setSubmissionsCount(subMap);

        // 4. Fetch final exam attempt
        const { data: examData } = await supabase
          .from('final_exam_attempts')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (examData) setExamAttempt(examData);

        // 5. Fetch capstone project submission
        const { data: projData } = await supabase
          .from('final_project_submissions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (projData) setProjectSubmission(projData);

        // 6. Fetch certificate
        const { data: certData } = await supabase
          .from('certificates')
          .select('*')
          .eq('user_id', user.id)
          .order('issue_date', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (certData) setCertificate(certData);
      }
    } catch (error) {
      console.error('Error fetching curriculum data:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleOpenSession = (session: CurriculumSession) => {
    setSelectedSession(session);
    setIsSessionModalOpen(true);
  };

  const sessionsDone = Object.values(feedbacks).filter((f: any) => f.status === 'done').length;
  const progressPercent = Math.round((sessionsDone / sessions.length) * 100);
  const isEligibleForGraduation = progressPercent >= 80 || examAttempt?.passed || certificate !== null;

  return (
    <div className="space-y-12 pb-24">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-indigo-600 font-black text-xs uppercase tracking-widest">
            <Brain className="w-4 h-4" />
            <span>Interactive Learning Management System</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
            Robotics Mastery Curriculum
          </h2>
          <p className="text-slate-500 font-medium max-w-2xl text-sm leading-relaxed">
            Step-by-step engineering pathway from electricity fundamentals to embedded C++ programming, sensor fusion, non-blocking state machines, and autonomous robotics capstones.
          </p>
        </div>

        {/* Progress Box */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xl shadow-indigo-50/50 min-w-[260px]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Mastery Progress</span>
            <span className="text-lg font-black text-indigo-600">{progressPercent}%</span>
          </div>
          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full"
            />
          </div>
          <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-wider">
            {sessionsDone} OF {sessions.length} SESSIONS COMPLETED
          </p>
        </div>
      </header>

      {/* Course Level Switcher & Brainstorming Banner */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-100 p-2 rounded-3xl">
          <div className="flex items-center gap-2 overflow-x-auto p-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider px-3 shrink-0">Pathway:</span>
            {COURSE_LEVELS.map(lvl => (
              <button
                key={lvl.id}
                onClick={() => setSelectedLevelId(lvl.id)}
                className={cn(
                  "px-5 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center space-x-2",
                  selectedLevelId === lvl.id
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200"
                    : "bg-white text-slate-600 hover:bg-slate-50"
                )}
              >
                <span>{lvl.title}</span>
                {lvl.levelNumber === 1 && (
                  <span className="px-1.5 py-0.5 rounded-md text-[9px] bg-amber-400 text-slate-950 font-black">
                    Zero Coding
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Brainstorming Quiz Quick Action */}
          <button
            onClick={() => setIsBrainstormingModalOpen(true)}
            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black text-xs px-6 py-3 rounded-2xl shadow-lg shadow-amber-500/20 flex items-center justify-center space-x-2 transition-all shrink-0"
          >
            <Brain className="w-4 h-4" />
            <span>Brainstorming Image Quiz</span>
            <Sparkles className="w-3.5 h-3.5 fill-current" />
          </button>
        </div>

        {/* Selected Level Info Banner */}
        {(() => {
          const currentLvl = COURSE_LEVELS.find(l => l.id === selectedLevelId) || COURSE_LEVELS[0];
          return (
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 font-black text-[10px] rounded-lg uppercase tracking-wider">
                    {currentLvl.targetAudience}
                  </span>
                  <span className="text-xs font-bold text-slate-400">Awarded Badge: <strong className="text-indigo-600">{currentLvl.badge}</strong></span>
                </div>
                <p className="text-sm font-bold text-slate-800">{currentLvl.description}</p>
              </div>
            </div>
          );
        })()}
      </div>
      {/* Graduation & Certification Milestone Card */}
      <section className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-[2.5rem] p-8 md:p-10 text-white shadow-2xl shadow-indigo-950/20 relative overflow-hidden border border-slate-800">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-indigo-500/5 rounded-l-full blur-2xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 bg-amber-500/20 text-amber-300 font-bold text-xs rounded-full uppercase tracking-wider flex items-center space-x-1 border border-amber-500/30">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Graduation Milestone</span>
              </span>
              {certificate && (
                <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 font-bold text-xs rounded-full uppercase tracking-wider flex items-center space-x-1 border border-emerald-500/30">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Certified Graduate</span>
                </span>
              )}
            </div>

            <h3 className="text-2xl md:text-3xl font-black text-white tracking-tight">
              Final Examination & Official Certification
            </h3>

            <p className="text-slate-300 text-sm leading-relaxed">
              Complete the curriculum modules, pass the 12-question comprehensive robotics examination (70%+ passing threshold), and submit your final capstone robot build to earn an accredited, verified YARIA Certificate of Technical Mastery.
            </p>

            {/* Checklist items */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
              <div className="flex items-center space-x-2 text-slate-300">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center font-bold ${
                  examAttempt?.passed ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-400'
                }`}>
                  {examAttempt?.passed ? '✓' : '1'}
                </div>
                <span>Final Exam: {examAttempt?.passed ? `Passed (${examAttempt.percentage}%)` : 'Ready to take'}</span>
              </div>

              <div className="flex items-center space-x-2 text-slate-300">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center font-bold ${
                  projectSubmission ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-400'
                }`}>
                  {projectSubmission ? '✓' : '2'}
                </div>
                <span>Capstone Project: {projectSubmission ? `Submitted (${projectSubmission.status})` : 'Pending'}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 w-full lg:w-auto shrink-0">
            <button
              onClick={() => setIsExamModalOpen(true)}
              className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center space-x-2"
            >
              <Award className="w-4 h-4" />
              <span>{examAttempt?.passed ? 'Review Final Exam' : 'Take Final Exam'}</span>
            </button>

            <button
              onClick={() => setIsProjectModalOpen(true)}
              className="px-6 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs uppercase tracking-wider rounded-2xl border border-slate-700 transition-all flex items-center justify-center space-x-2"
            >
              <Rocket className="w-4 h-4" />
              <span>{projectSubmission ? 'View Capstone Project' : 'Submit Capstone Project'}</span>
            </button>

            {certificate && (
              <button
                onClick={() => setIsCertModalOpen(true)}
                className="px-6 py-3.5 bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-2xl shadow-xl shadow-amber-500/20 hover:scale-[1.02] transition-all flex items-center justify-center space-x-2"
              >
                <Award className="w-4 h-4 text-slate-950" />
                <span>View Official Certificate</span>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Main Sessions Timeline & Sidebar */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left: Sessions by Parts */}
        <div className="lg:col-span-8 space-y-10">
          {['Electronics', 'Programming', 'Innovation + Build'].map((part) => {
            const partSessions = sessions.filter(s => s.part === part);
            return (
              <div key={part} className="space-y-4">
                <div className="flex items-center space-x-3 ml-2">
                  <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-sm">
                    {part === 'Electronics' && <Zap className="w-5 h-5" />}
                    {part === 'Programming' && <Monitor className="w-5 h-5" />}
                    {part === 'Innovation + Build' && <Box className="w-5 h-5" />}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                      {part} Mastery
                    </h3>
                    <p className="text-xs text-slate-400 font-medium">
                      {partSessions.length} interactive sessions & practical lab activities
                    </p>
                  </div>
                </div>

                <div className="grid gap-4">
                  {partSessions.map((session) => {
                    const fb = feedbacks[session.id];
                    const subCount = submissionsCount[session.id] || 0;
                    const hasQuestions = (session.questions?.length || 0) > 0;
                    const hasAssignments = (session.assignments?.length || 0) > 0;
                    const hasProjects = (session.projects?.length || 0) > 0;
                    const hasVideo = !!session.video_url;

                    return (
                      <motion.div
                        key={session.id}
                        whileHover={{ x: 4 }}
                        onClick={() => handleOpenSession(session)}
                        className={cn(
                          "group cursor-pointer bg-white p-6 rounded-[2rem] border-2 transition-all flex items-center gap-5 shadow-sm hover:shadow-md",
                          fb?.status === 'done' ? "border-emerald-100 bg-emerald-50/10" : 
                          fb?.status === 'partially' ? "border-amber-100 bg-amber-50/10" :
                          fb?.status === 'struggling' ? "border-rose-100 bg-rose-50/10" :
                          "border-slate-100 hover:border-indigo-100"
                        )}
                      >
                        {/* Session ID Pill */}
                        <div className={cn(
                          "w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xs shrink-0 transition-all",
                          fb?.status === 'done' ? "bg-emerald-500 text-white shadow-lg shadow-emerald-100" :
                          fb?.status === 'partially' ? "bg-amber-500 text-white shadow-lg shadow-amber-100" :
                          fb?.status === 'struggling' ? "bg-rose-500 text-white shadow-lg shadow-rose-100" :
                          "bg-slate-100 text-slate-600 group-hover:bg-indigo-600 group-hover:text-white"
                        )}>
                          {fb?.status === 'done' ? <Check className="w-6 h-6 stroke-[3]" /> : session.id}
                        </div>

                        {/* Title & Features */}
                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex flex-wrap items-center gap-1.5 mb-1">
                            <span className={cn(
                              "text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md",
                              session.type === 'online' ? "bg-indigo-50 text-indigo-700" : "bg-purple-50 text-purple-700"
                            )}>
                              {session.type === 'online' ? 'Online' : 'Physical Lab'}
                            </span>

                            {hasVideo && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-50 text-rose-600 flex items-center space-x-1">
                                <Video className="w-3 h-3" />
                                <span>Video</span>
                              </span>
                            )}

                            {hasQuestions && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-600 flex items-center space-x-1">
                                <HelpCircle className="w-3 h-3" />
                                <span>{session.questions?.length} Quiz</span>
                              </span>
                            )}

                            {hasAssignments && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 flex items-center space-x-1">
                                <FileText className="w-3 h-3" />
                                <span>Assignment</span>
                              </span>
                            )}

                            {hasProjects && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 flex items-center space-x-1">
                                <Rocket className="w-3 h-3" />
                                <span>Mini-Project</span>
                              </span>
                            )}
                          </div>

                          <h4 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1 text-sm md:text-base">
                            {session.topic}
                          </h4>
                          <p className="text-xs text-slate-500 font-medium line-clamp-1 italic">
                            {session.outcome}
                          </p>
                        </div>

                        {/* Right Arrow */}
                        <div className="shrink-0">
                          <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Sidebar: Legend & Mentor Support */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-indigo-950/20">
            <h3 className="font-bold text-lg mb-6 flex items-center space-x-2 text-white">
              <TrendingUp className="w-5 h-5 text-indigo-400" />
              <span>Learning Legend</span>
            </h3>
            <div className="space-y-5 text-xs">
              <div className="flex items-start space-x-3.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0">
                  <Check className="w-4 h-4 stroke-[3]" />
                </div>
                <div>
                  <p className="font-bold text-slate-100 text-sm">Completed (Done)</p>
                  <p className="text-slate-400 mt-0.5">Understood the concepts and verified results.</p>
                </div>
              </div>

              <div className="flex items-start space-x-3.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-slate-100 text-sm">Partially Done</p>
                  <p className="text-slate-400 mt-0.5">Started exercises but need more practice.</p>
                </div>
              </div>

              <div className="flex items-start space-x-3.5">
                <div className="w-8 h-8 rounded-xl bg-rose-500 text-white flex items-center justify-center shrink-0">
                  <HelpCircle className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-slate-100 text-sm">Need Assistance</p>
                  <p className="text-slate-400 mt-0.5">Mentors are automatically notified to help you.</p>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-800 text-[11px] text-slate-400 leading-relaxed italic">
              Each session includes study videos, datasheet references, interactive questions, and submission portals.
            </div>
          </div>

          {/* Quick Mentorship Banner */}
          <div className="bg-indigo-50/80 rounded-[2.5rem] p-8 border-2 border-indigo-100">
            <Users className="w-8 h-8 text-indigo-600 mb-3" />
            <h4 className="font-bold text-slate-900 mb-1">Live Mentor Support</h4>
            <p className="text-xs text-slate-600 mb-5 leading-relaxed font-medium">
              Have technical roadblocks wiring motors or writing non-blocking C++ code? Connect 1-on-1 with an accredited YARIA robotics mentor.
            </p>
            <a 
              href="/mentorship"
              className="inline-flex items-center space-x-2 text-indigo-600 hover:text-indigo-700 font-bold text-xs uppercase tracking-wider group"
            >
              <span>Connect with a Mentor</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        </div>
      </section>

      {/* MODALS */}
      <SessionModal
        session={selectedSession}
        isOpen={isSessionModalOpen}
        onClose={() => {
          setIsSessionModalOpen(false);
          setSelectedSession(null);
        }}
        onSessionUpdated={fetchCurriculumData}
      />

      <FinalExamModal
        isOpen={isExamModalOpen}
        onClose={() => setIsExamModalOpen(false)}
        existingAttempt={examAttempt}
        onExamPassed={(newCert) => {
          setCertificate(newCert);
          fetchCurriculumData();
          setIsCertModalOpen(true);
        }}
      />

      <FinalProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        existingSubmission={projectSubmission}
        onSubmissionSuccess={(newSub) => {
          setProjectSubmission(newSub);
          fetchCurriculumData();
        }}
      />

      {certificate && (
        <CertificateModal
          isOpen={isCertModalOpen}
          onClose={() => setIsCertModalOpen(false)}
          certificate={certificate}
        />
      )}

      <BrainstormingQuizModal
        isOpen={isBrainstormingModalOpen}
        onClose={() => setIsBrainstormingModalOpen(false)}
      />
    </div>
  );
}

