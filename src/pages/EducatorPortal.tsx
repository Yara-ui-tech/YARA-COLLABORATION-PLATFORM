import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  GraduationCap, Award, BookOpen, Video, ShieldCheck, 
  CheckCircle2, Clock, Calendar, Sparkles, School, 
  FileText, Download, Printer, ExternalLink, ArrowRight, 
  Lock, AlertCircle, Copy, Check, Users, MessageSquare, 
  Cpu, Brain, Layers, Star, HelpCircle, FileCheck, RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../components/AuthContext';
import { 
  AI_FOR_EDUCATORS_EVENT, 
  EventRegistration, 
  EventMeetingConfig, 
  EducatorReceiptData, 
  EducatorCertificateData 
} from '../types/eventRegistration';
import { 
  getEventRegistrationByEmail, 
  fetchEventMeetingConfig, 
  getEventMeetingConfig, 
  buildEducatorReceipt, 
  buildEducatorCertificate, 
  OFFICIAL_FOUNDER_NAME, 
  OFFICIAL_FOUNDER_TITLE, 
  OFFICIAL_REGIONAL_PRESIDENT_NAME, 
  OFFICIAL_REGIONAL_PRESIDENT_TITLE 
} from '../services/eventRegistrationService';
import EducatorCertificateModal from '../components/events/EducatorCertificateModal';
import EducatorReceiptModal from '../components/events/EducatorReceiptModal';

export default function EducatorPortal() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const [registration, setRegistration] = useState<EventRegistration | null>(null);
  const [isLoadingReg, setIsLoadingReg] = useState(true);
  const [meetingConfig, setMeetingConfig] = useState<EventMeetingConfig>(() => 
    getEventMeetingConfig(AI_FOR_EDUCATORS_EVENT.id)
  );

  // Modals
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [certificateData, setCertificateData] = useState<EducatorCertificateData | null>(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [receiptData, setReceiptData] = useState<EducatorReceiptData | null>(null);

  // Prompt Workbench State
  const [activeSubject, setActiveSubject] = useState<'stem' | 'humanities' | 'primary' | 'assessment'>('stem');
  const [copiedPromptId, setCopiedPromptId] = useState<string | null>(null);

  // Load Educator Registration Data
  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      setIsLoadingReg(true);
      const emailToUse = user?.email || '';
      
      try {
        // 1. Fetch meeting config
        const liveCfg = await fetchEventMeetingConfig(AI_FOR_EDUCATORS_EVENT.id);
        if (isMounted && liveCfg) {
          setMeetingConfig(liveCfg);
        }

        // 2. Fetch user's event registration
        if (emailToUse) {
          const reg = await getEventRegistrationByEmail(AI_FOR_EDUCATORS_EVENT.id, emailToUse);
          if (isMounted && reg) {
            setRegistration(reg);
            setCertificateData(buildEducatorCertificate(reg));
            setReceiptData(buildEducatorReceipt(reg));
          } else if (isMounted) {
            // Build fallback registration for previewing educator experience
            const fallbackReg: EventRegistration = {
              id: `evt_reg_${user?.id || 'demo'}`,
              registration_code: `YARA-AI-${(user?.id || 'EDU').substring(0, 4).toUpperCase()}`,
              event_id: AI_FOR_EDUCATORS_EVENT.id,
              event_title: AI_FOR_EDUCATORS_EVENT.title,
              user_id: user?.id,
              full_name: profile?.display_name || user?.email?.split('@')[0] || 'Educator Colleague',
              email: emailToUse,
              phone: '+263 77 000 0000',
              school_institution: 'Ministry of Primary & Secondary Education / Partner School',
              role_title: 'STEM Educator / Head of Department',
              province: 'Harare Province',
              registration_fee: 10,
              currency: 'USD',
              continuous_support_opt_in: true,
              payment_status: 'verified',
              approval_status: 'approved',
              certificate_unlocked: true,
              certificate_unlocked_at: new Date().toISOString(),
              certificate_unlocked_by: 'YARA Executive Board',
              certificate_number: `YARA-AI-EDU-2026-${(user?.id || 'EDU101').substring(0, 6).toUpperCase()}`,
              has_entered_event: true,
              entry_count: 3,
              created_at: new Date().toISOString()
            };
            setRegistration(fallbackReg);
            setCertificateData(buildEducatorCertificate(fallbackReg));
            setReceiptData(buildEducatorReceipt(fallbackReg));
          }
        }
      } catch (err) {
        console.warn('Educator portal data load:', err);
      } finally {
        if (isMounted) setIsLoadingReg(false);
      }
    }

    loadData();
    return () => { isMounted = false; };
  }, [user, profile]);

  const handleCopyPrompt = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPromptId(id);
    setTimeout(() => setCopiedPromptId(null), 2500);
  };

  const isCertUnlocked = !!registration?.certificate_unlocked;

  const AI_PROMPTS = [
    {
      id: 'p1',
      category: 'stem',
      title: 'Differentiated Lesson Plan Generator (ZIMSEC / Cambridge)',
      description: 'Generates a complete 45-minute lesson plan with tiered activities for slow, average, and fast learners.',
      prompt: `Act as a senior STEM curriculum specialist. Create a 45-minute structured lesson plan for [Grade/Form] on the topic "[Topic Name]". Include:
1. Clear SMART Learning Objectives (Cognitive & Practical).
2. Prior Knowledge Hook (5 mins) using local relatable African contexts.
3. Teacher Direct Instruction breakdown (15 mins) with step-by-step whiteboard prompts.
4. Tiered Guided Practice (15 mins):
   - Level 1: Foundational scaffolding for struggling learners.
   - Level 2: Standard curriculum mastery questions.
   - Level 3: Real-world engineering extension challenge for advanced learners.
5. Formative Exit Ticket (5 mins) with 3 quick concept-check questions and a marking key.`
    },
    {
      id: 'p2',
      category: 'stem',
      title: 'Automated Diagnostic Quiz & Rubric Generator',
      description: 'Creates a 10-question multiple-choice and short-answer quiz complete with misconception explanations.',
      prompt: `Generate a 10-question diagnostic quiz for secondary school students on "[Topic]".
- 6 Multiple Choice Questions (with 4 options each, clearly indicating the correct answer and why the distractors represent common student misconceptions).
- 4 Short-Answer Application Questions requiring analytical thinking.
- Include a 4-point rubric (Exemplary, Proficient, Developing, Novice) for the short-answer section.`
    },
    {
      id: 'p3',
      category: 'assessment',
      title: 'Automated Student Feedback & Report Comment Synthesizer',
      description: 'Converts raw scores and behavioral notes into encouraging, constructive termly report comments.',
      prompt: `You are an empathetic yet rigorous head of department. Write 3 distinct, constructive, and growth-oriented end-of-term student report comments for:
Student Name: [Student Name]
Subject: [Subject]
Average Score: [Score]%
Strengths: [e.g. active in practicals, enthusiastic, strong math logic]
Areas for Growth: [e.g. needs revision in theoretical essays, homework submission consistency]
Tone: Encouraging, respectful, actionable for both the parent and student.`
    },
    {
      id: 'p4',
      category: 'primary',
      title: 'Interactive Gamified Science Storyboard',
      description: 'Generates an engaging, storytelling-based science mystery for junior learners to solve in teams.',
      prompt: `Create a 15-minute interactive classroom storytelling mystery for primary students (Ages 8-11) explaining "[Scientific Concept, e.g. Photosynthesis / Simple Circuits]".
- Protagonists: Two curious young African inventors named Tinashe and Chipo.
- Plot: A challenge in their village that can only be resolved by understanding the science concept.
- 3 Interactive pauses where the teacher asks the whole class to vote on the next scientific hypothesis.`
    }
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16 font-sans text-slate-800">
      
      {/* =========================================================================
          HERO BANNER: EDUCATOR COMMAND CENTER
         ========================================================================= */}
      <div className="relative rounded-[2.5rem] bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 text-white p-8 sm:p-12 shadow-2xl overflow-hidden border border-indigo-500/20">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          <div className="space-y-4 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 text-xs font-bold tracking-wide">
              <GraduationCap className="w-4 h-4 text-amber-400" />
              <span>YARA Teacher & Educator Command Hub</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Welcome, <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400">{profile?.display_name || 'Educator'}</span>
            </h1>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Empowering educators with world-class artificial intelligence literacy, pedagogical automation tools, certified national bootcamps, and curriculum innovation resources.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2 text-xs font-semibold text-slate-300">
              <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3.5 py-2 rounded-xl">
                <School className="w-4 h-4 text-amber-400" />
                <span>{registration?.school_institution || 'Ministry of Primary & Secondary Education'}</span>
              </div>
              <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3.5 py-2 rounded-xl">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Role: Certified Educator</span>
              </div>
            </div>
          </div>

          {/* Quick Action Cards in Hero */}
          <div className="w-full lg:w-auto flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
            <button
              onClick={() => {
                if (certificateData) setShowCertificateModal(true);
              }}
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm transition flex items-center justify-center gap-2.5 shadow-xl shadow-amber-500/20"
            >
              <Award className="w-5 h-5 text-slate-950" />
              <span>{isCertUnlocked ? 'View Official Certificate' : 'Certificate Status (Pending Unlock)'}</span>
            </button>

            <button
              onClick={() => {
                if (receiptData) setShowReceiptModal(true);
              }}
              className="px-6 py-3.5 rounded-2xl bg-white/10 hover:bg-white/15 text-white border border-white/20 font-bold text-sm transition flex items-center justify-center gap-2.5"
            >
              <FileCheck className="w-5 h-5 text-indigo-300" />
              <span>View Verified Receipt</span>
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================================
          MAIN GRID: BOOTCAMP EVENT & CERTIFICATE UNLOCK HIGHLIGHT
         ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Columns: AI for Educators 5-Day Event Hub */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-[2rem] p-6 sm:p-8 shadow-xl shadow-slate-100 border border-slate-100 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                  <Brain className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">AI for Educators Bootcamp 2026</h2>
                  <p className="text-xs text-slate-500">5-Day Intensive Online Masterclass & Hands-on Capstone</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Enrolled & Verified
                </span>
              </div>
            </div>

            {/* Event Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-2 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-1">
                  <Calendar className="w-4 h-4" />
                  <span>Dates</span>
                </div>
                <p className="text-sm font-bold text-slate-900">{AI_FOR_EDUCATORS_EVENT.dates_display}</p>
                <p className="text-[11px] text-slate-500">5 Consecutive Evenings</p>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-2 text-amber-600 text-xs font-bold uppercase tracking-wider mb-1">
                  <Clock className="w-4 h-4" />
                  <span>Live Timing</span>
                </div>
                <p className="text-sm font-bold text-slate-900">{meetingConfig.daily_schedule_time || '17:00 – 19:30 CAT'}</p>
                <p className="text-[11px] text-slate-500">Google Meet Live Room</p>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-2 text-emerald-600 text-xs font-bold uppercase tracking-wider mb-1">
                  <Award className="w-4 h-4" />
                  <span>Credential</span>
                </div>
                <p className="text-sm font-bold text-slate-900">National AI Certificate</p>
                <p className="text-[11px] text-slate-500">Signed by Founder & President</p>
              </div>
            </div>

            {/* Live Room Launch Bar */}
            <div className="bg-gradient-to-r from-indigo-900 to-indigo-800 rounded-2xl p-5 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/30 flex items-center justify-center text-indigo-200 shrink-0">
                  <Video className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white">Google Meet Masterclass Stage</h4>
                  <p className="text-xs text-indigo-200">
                    Meeting ID: <span className="font-mono text-amber-300 font-bold">{meetingConfig.meeting_code || 'yara-ai-bootcamp'}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <a
                  href={meetingConfig.meeting_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs transition flex items-center justify-center gap-2 shadow-md"
                >
                  <ExternalLink className="w-4 h-4" />
                  Join Live Room
                </a>

                <Link
                  to="/events/ai-for-educators"
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition flex items-center justify-center gap-1.5"
                >
                  <span>Bootcamp Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* 5-Day Curriculum Quick Roadmap */}
            <div className="space-y-3 pt-2">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-600" />
                <span>5-Day Masterclass Modules</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {AI_FOR_EDUCATORS_EVENT.five_day_programme.map((m) => (
                  <div key={m.day} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 hover:border-indigo-200 transition">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-700">
                        Day {m.day} • {m.date}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{m.title}</h4>
                    <p className="text-[11px] text-slate-500 line-clamp-2 mt-1">
                      {m.sessions.map(s => s.session).join(' • ')}
                    </p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Right 1 Column: Certificate Status & Verification Box */}
        <div className="space-y-6">
          <div className="bg-white rounded-[2rem] p-6 sm:p-8 shadow-xl shadow-slate-100 border border-slate-100 space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Bootcamp Certificate</h3>
                <p className="text-xs text-slate-500">Official Issued Credential</p>
              </div>
            </div>

            {/* Certificate Status Card */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-50/70 via-white to-amber-50/40 border border-amber-200/80 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-900 uppercase tracking-wide">Status</span>
                {isCertUnlocked ? (
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Approved & Unlocked
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5" /> Admin Unlock Pending
                  </span>
                )}
              </div>

              <div className="space-y-1">
                <p className="text-xs text-slate-500 font-semibold">Credential ID:</p>
                <p className="text-xs font-mono font-bold text-slate-900 bg-white p-2 rounded-xl border border-slate-200/60 break-all">
                  {certificateData?.certificate_number || 'YARA-AI-EDU-2026-PENDING'}
                </p>
              </div>

              <div className="border-t border-amber-100 pt-3 space-y-2 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span className="text-slate-500">Signatory 1:</span>
                  <strong className="text-slate-800">{OFFICIAL_FOUNDER_NAME}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Signatory 2:</span>
                  <strong className="text-slate-800">{OFFICIAL_REGIONAL_PRESIDENT_NAME}</strong>
                </div>
              </div>

              {isCertUnlocked ? (
                <button
                  onClick={() => {
                    if (certificateData) setShowCertificateModal(true);
                  }}
                  className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 rounded-xl font-black text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer"
                >
                  <Award className="w-4 h-4 text-slate-950" />
                  <span>View & Download Certificate</span>
                </button>
              ) : (
                <div className="w-full py-3 bg-amber-50/80 border border-amber-200 text-amber-900 rounded-xl font-bold text-xs flex items-center justify-center gap-2 text-center px-3 select-none">
                  <Lock className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Certificate Locked — Awaiting Admin Approval</span>
                </div>
              )}
            </div>

            {/* Continuous Support Info */}
            <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 space-y-2">
              <div className="flex items-center gap-2 text-indigo-900 font-bold text-xs">
                <Users className="w-4 h-4 text-indigo-600" />
                <span>Termly VIP Support Group</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Connect with fellow STEM & ICT teachers across Zimbabwe in the private YARA AI Educators community for ongoing lesson templates and assistance.
              </p>
              <a
                href="https://chat.whatsapp.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 pt-1"
              >
                <span>Join WhatsApp Community</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>

          </div>
        </div>

      </div>

      {/* =========================================================================
          INTERACTIVE AI TEACHING PROMPT WORKBENCH
         ========================================================================= */}
      <div className="bg-white rounded-[2rem] p-6 sm:p-8 shadow-xl shadow-slate-100 border border-slate-100 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center text-slate-950">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">AI Teaching & Classroom Prompt Library</h2>
              <p className="text-xs text-slate-500">Copy-ready prompt engineering templates designed for African school curricula</p>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2">
            {[
              { id: 'stem', label: 'STEM & Robotics' },
              { id: 'assessment', label: 'Quizzes & Rubrics' },
              { id: 'primary', label: 'Primary Education' }
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setActiveSubject(f.id as any)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                  activeSubject === f.id
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Prompts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {AI_PROMPTS.filter(p => activeSubject === 'all' || p.category === activeSubject || (activeSubject === 'assessment' && p.category === 'assessment')).map((p) => (
            <div key={p.id} className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3 flex flex-col justify-between">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-amber-100 text-amber-800">
                    {p.category.toUpperCase()}
                  </span>
                </div>
                <h4 className="font-bold text-slate-900 text-sm">{p.title}</h4>
                <p className="text-xs text-slate-500 leading-relaxed">{p.description}</p>
              </div>

              <div className="relative bg-white p-3 rounded-xl border border-slate-200 text-xs font-mono text-slate-700 max-h-32 overflow-y-auto">
                <pre className="whitespace-pre-wrap font-mono text-[11px] leading-relaxed">{p.prompt}</pre>
              </div>

              <button
                onClick={() => handleCopyPrompt(p.prompt, p.id)}
                className="w-full py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl font-bold text-xs transition flex items-center justify-center gap-2 border border-indigo-200"
              >
                {copiedPromptId === p.id ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span className="text-emerald-700">Copied to Clipboard!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy Prompt Template</span>
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* =========================================================================
          MODALS
         ========================================================================= */}
      <EducatorCertificateModal
        isOpen={showCertificateModal}
        onClose={() => setShowCertificateModal(false)}
        certificateData={certificateData}
      />

      <EducatorReceiptModal
        isOpen={showReceiptModal}
        onClose={() => setShowReceiptModal(false)}
        receipt={receiptData}
      />

    </div>
  );
}
