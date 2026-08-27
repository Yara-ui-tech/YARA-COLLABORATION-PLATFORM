import React, { useState, useEffect } from 'react';
import { 
  Calendar, Clock, DollarSign, ShieldCheck, CheckCircle2, 
  AlertCircle, Sparkles, BookOpen, Brain, Users, Award, 
  Video, ArrowRight, Lock, Check, FileText, Send, HelpCircle, 
  School, Laptop, Star, RefreshCw, XCircle, Share2, Layers, Cpu, Building2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../components/AuthContext';
import { 
  AI_FOR_EDUCATORS_EVENT, 
  EventRegistration, 
  EventAccessResult 
} from '../../types/eventRegistration';
import { 
  checkEventAccess, 
  registerForEvent, 
  getEventRegistrationByEmail,
  recordEventEntry,
  getEventTimelineStatus,
  updateRegistrationStatus
} from '../../services/eventRegistrationService';

export default function AiForEducatorsBootcamp() {
  const { user, profile } = useAuth();
  
  // Lookup states
  const [emailInput, setEmailInput] = useState<string>(user?.email || '');
  const [accessResult, setAccessResult] = useState<EventAccessResult | null>(null);
  const [isCheckingAccess, setIsCheckingAccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'curriculum' | 'automation' | 'outcomes' | 'support' | 'live_stage'>('overview');
  const [selectedDay, setSelectedDay] = useState<number>(1);

  // Registration Form State
  const [showRegModal, setShowRegModal] = useState(false);
  const [isSubmittingReg, setIsSubmittingReg] = useState(false);
  const [regSuccessNotice, setRegSuccessNotice] = useState<string | null>(null);
  const [regForm, setRegForm] = useState({
    full_name: profile?.display_name || '',
    email: user?.email || '',
    phone: '',
    school_institution: '',
    role_title: 'Secondary Teacher',
    teaching_level: 'secondary' as const,
    years_experience: '3-5 years',
    country: 'Zimbabwe',
    city_province: 'Harare',
    continuous_support_opt_in: true,
    payment_method: 'ecocash',
    payment_reference: ''
  });

  // Direct Live Stage Entry state
  const [isInLiveStage, setIsInLiveStage] = useState(false);
  const [entryMessage, setEntryMessage] = useState<string | null>(null);
  const [testingMode, setTestingMode] = useState(false);

  // Check access whenever user or email changes
  const verifyCurrentAccess = async (targetEmail?: string) => {
    const emailToUse = (targetEmail || emailInput || user?.email || '').trim().toLowerCase();
    if (!emailToUse) {
      setAccessResult({
        is_granted: false,
        reason: 'unregistered',
        message: 'Enter your email address to check your registration and access status.',
        timeline_status: getEventTimelineStatus(AI_FOR_EDUCATORS_EVENT.start_date, AI_FOR_EDUCATORS_EVENT.close_date)
      });
      return;
    }

    setIsCheckingAccess(true);
    try {
      const result = await checkEventAccess(AI_FOR_EDUCATORS_EVENT.id, emailToUse, user?.id);
      setAccessResult(result);
    } catch (err) {
      console.error('Error verifying event access:', err);
    } finally {
      setIsCheckingAccess(false);
    }
  };

  useEffect(() => {
    if (user?.email) {
      setEmailInput(user.email);
      verifyCurrentAccess(user.email);
    } else {
      verifyCurrentAccess();
    }
  }, [user]);

  // Handle new registration
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingReg(true);
    setRegSuccessNotice(null);

    try {
      const res = await registerForEvent({
        event_id: AI_FOR_EDUCATORS_EVENT.id,
        event_title: AI_FOR_EDUCATORS_EVENT.title,
        user_id: user?.id,
        full_name: regForm.full_name.trim(),
        email: regForm.email.trim(),
        phone: regForm.phone.trim(),
        school_institution: regForm.school_institution.trim() || 'Independent Educator',
        role_title: regForm.role_title.trim(),
        province: regForm.city_province || 'Harare',
        continuous_support_opt_in: regForm.continuous_support_opt_in,
        payment_reference: regForm.payment_reference || undefined
      });

      if (res && res.id) {
        setEmailInput(regForm.email);
        setShowRegModal(false);
        setRegSuccessNotice('Registration successfully submitted! Please ensure payment of US$10 is submitted for verification.');
        await verifyCurrentAccess(regForm.email);
      } else {
        alert('Registration failed. Please try again.');
      }
    } catch (err: any) {
      alert(err.message || 'Error processing registration');
    } finally {
      setIsSubmittingReg(false);
    }
  };

  // Handle Enter Event click
  const handleEnterEvent = async () => {
    if (!accessResult || !accessResult.is_granted || !accessResult.registration) {
      return;
    }

    try {
      await recordEventEntry(accessResult.registration.id);
      setIsInLiveStage(true);
      setEntryMessage('Welcome to the Live Training Stage of the AI for Educators Online Bootcamp!');
    } catch (err) {
      console.error('Error recording entry:', err);
      setIsInLiveStage(true);
    }
  };

  // Simulator helper for testing scenarios
  const handleSimulateStatus = async (payment_status: any, approval_status: any) => {
    if (!accessResult?.registration) {
      // Create quick test registration
      const testEmail = user?.email || 'educator.test@yara.org';
      const created = await registerForEvent({
        event_id: AI_FOR_EDUCATORS_EVENT.id,
        event_title: AI_FOR_EDUCATORS_EVENT.title,
        user_id: user?.id,
        full_name: profile?.display_name || 'Dr. Test Educator',
        email: testEmail,
        phone: '+263 77 123 4567',
        school_institution: 'Harare High School',
        role_title: 'Secondary Teacher',
        province: 'Harare',
        continuous_support_opt_in: true
      });
      if (created && created.id) {
        await updateRegistrationStatus(created.id, {
          payment_status,
          approval_status
        });
      }
      await verifyCurrentAccess(testEmail);
    } else {
      await updateRegistrationStatus(accessResult.registration.id, {
        payment_status,
        approval_status
      });
      await verifyCurrentAccess(accessResult.registration.email);
    }
  };

  const timelineStatus = accessResult?.timeline_status || 'upcoming';

  return (
    <div className="space-y-10 pb-20 max-w-7xl mx-auto">
      {/* Top Breadcrumb & Status Notice */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-2 text-xs text-slate-500">
          <span>Events</span>
          <span>/</span>
          <span className="text-indigo-600 font-bold">AI for Educators – Online Bootcamp</span>
        </div>

        <div className="flex items-center space-x-3">
          <span className="px-3 py-1 bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold rounded-full flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse"></span>
            <span>Mode: Live Online Training</span>
          </span>
          <span className="px-3 py-1 bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold rounded-full">
            Fee: US$10 | Continuous Support: US$15/term
          </span>
        </div>
      </div>

      {/* Hero Section */}
      <div className="p-8 md:p-12 rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white border border-slate-800 shadow-2xl relative overflow-hidden">
        {/* Ambient Glows */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Event Core Info */}
          <div className="lg:col-span-7 space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3.5 py-1 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full text-xs font-black uppercase tracking-wider">
                Young Africans Robotics Association (YARA)
              </span>
              <span className="px-3 py-1 bg-amber-400/20 text-amber-300 border border-amber-400/30 rounded-full text-xs font-black uppercase tracking-wider">
                Empower. Educate. Innovate.
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              AI for Educators <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-indigo-200 to-cyan-300">
                Online Bootcamp
              </span>
            </h1>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Equip yourself with practical Artificial Intelligence skills to save hours of lesson preparation, craft interactive STEM learning materials, generate automated assessments and differentiated student feedback, and master classroom AI pedagogy.
            </p>

            {/* Quick Fact Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Schedule</span>
                <p className="text-xs font-bold text-white flex items-center space-x-1">
                  <Calendar className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>31 Aug – 4 Sep 2026</span>
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Registration Fee</span>
                <p className="text-xs font-bold text-emerald-400 flex items-center space-x-1">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>US$10 Once-off</span>
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Continuous Support</span>
                <p className="text-xs font-bold text-purple-300 flex items-center space-x-1">
                  <Sparkles className="w-3.5 h-3.5 text-purple-300 shrink-0" />
                  <span>US$15 per term</span>
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Protected Live Access Card */}
          <div className="lg:col-span-5">
            <div className="p-6 md:p-7 rounded-3xl bg-slate-900/90 border border-slate-700/80 shadow-2xl backdrop-blur-md space-y-5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="w-5 h-5 text-amber-400" />
                  <h3 className="text-sm font-black text-white uppercase tracking-wider">
                    Event Access Clearance
                  </h3>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                  accessResult?.is_granted
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                }`}>
                  {accessResult?.is_granted ? 'Access Granted' : 'Verification Required'}
                </span>
              </div>

              {/* Email Lookup Input if checking another email */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Participant Email
                </label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={emailInput}
                    onChange={e => setEmailInput(e.target.value)}
                    placeholder="Enter registered email..."
                    className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    onClick={() => verifyCurrentAccess()}
                    disabled={isCheckingAccess}
                    className="px-3.5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition-all flex items-center justify-center cursor-pointer"
                  >
                    {isCheckingAccess ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Check'}
                  </button>
                </div>
              </div>

              {/* Status Display Area */}
              <div className={`p-4 rounded-2xl border transition-all ${
                accessResult?.is_granted
                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                  : accessResult?.reason === 'payment_pending' || accessResult?.reason === 'pending_approval'
                  ? 'bg-amber-950/40 border-amber-500/40 text-amber-200'
                  : accessResult?.reason === 'rejected'
                  ? 'bg-rose-950/40 border-rose-500/40 text-rose-200'
                  : 'bg-slate-950/50 border-slate-800 text-slate-300'
              }`}>
                <div className="flex items-start space-x-3">
                  {accessResult?.is_granted ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  ) : accessResult?.reason === 'rejected' ? (
                    <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                  ) : (
                    <Lock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  )}
                  <div className="space-y-1 text-xs">
                    <p className="font-black text-white">
                      {accessResult?.is_granted 
                        ? 'Bootcamp Access Verified & Approved'
                        : accessResult?.reason === 'unpaid'
                        ? 'Registration Recorded — US$10 Fee Due'
                        : accessResult?.reason === 'payment_pending'
                        ? 'Payment Under Verification'
                        : accessResult?.reason === 'pending_approval'
                        ? 'Payment Verified — Awaiting Admin Approval'
                        : accessResult?.reason === 'rejected'
                        ? 'Registration Not Approved'
                        : 'Not Registered for this Event'}
                    </p>
                    <p className="text-[11px] leading-relaxed opacity-90">
                      {accessResult?.message || 'Please register or enter your email to view clearance.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* PRIMARY ACTION BUTTON: ENTER EVENT OR REGISTER */}
              {accessResult?.is_granted ? (
                <button
                  onClick={handleEnterEvent}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-sm uppercase tracking-wider shadow-lg shadow-emerald-500/25 flex items-center justify-center space-x-2 transition-all transform hover:scale-[1.02] cursor-pointer"
                >
                  <Video className="w-5 h-5" />
                  <span>ENTER LIVE BOOTCAMP EVENT</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <div className="space-y-2">
                  <button
                    onClick={() => setShowRegModal(true)}
                    className="w-full py-3.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs uppercase tracking-wider shadow-md flex items-center justify-center space-x-2 transition-all cursor-pointer"
                  >
                    <span>Register for Event (US$10)</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <p className="text-[10px] text-center text-slate-400">
                    Access is strictly granted once the US$10 fee is verified and an admin approves your registration.
                  </p>
                </div>
              )}

              {/* Developer / Testing Simulator Sandbox Toggle */}
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
                <button
                  onClick={() => setTestingMode(!testingMode)}
                  className="hover:text-indigo-300 underline font-medium flex items-center space-x-1"
                >
                  <span>🛠️ {testingMode ? 'Hide Access Simulator' : 'Access Scenario Simulator'}</span>
                </button>
                <span>Event Status: <strong>{timelineStatus.toUpperCase()}</strong></span>
              </div>

              {/* Scenario Testing Bar */}
              {testingMode && (
                <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-2 text-[10px]">
                  <p className="font-bold text-slate-300">Quickly test all access conditions:</p>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      onClick={() => handleSimulateStatus('unpaid', 'pending')}
                      className="p-1.5 bg-rose-950/60 border border-rose-800 text-rose-300 rounded font-bold hover:bg-rose-900"
                    >
                      1. Unpaid ($10 Due)
                    </button>
                    <button
                      onClick={() => handleSimulateStatus('pending_verification', 'pending')}
                      className="p-1.5 bg-amber-950/60 border border-amber-800 text-amber-300 rounded font-bold hover:bg-amber-900"
                    >
                      2. Payment Submitted
                    </button>
                    <button
                      onClick={() => handleSimulateStatus('verified', 'pending')}
                      className="p-1.5 bg-blue-950/60 border border-blue-800 text-blue-300 rounded font-bold hover:bg-blue-900"
                    >
                      3. Paid, Pending Admin
                    </button>
                    <button
                      onClick={() => handleSimulateStatus('verified', 'approved')}
                      className="p-1.5 bg-emerald-950/60 border border-emerald-800 text-emerald-300 rounded font-bold hover:bg-emerald-900"
                    >
                      4. Verified & Approved
                    </button>
                    <button
                      onClick={() => handleSimulateStatus('verified', 'rejected')}
                      className="p-1.5 bg-slate-900 border border-slate-700 text-slate-300 rounded font-bold hover:bg-slate-800"
                    >
                      5. Rejected Status
                    </button>
                    <button
                      onClick={() => {
                        setEmailInput('notregistered@test.com');
                        verifyCurrentAccess('notregistered@test.com');
                      }}
                      className="p-1.5 bg-slate-900 border border-slate-700 text-slate-400 rounded font-bold hover:bg-slate-800"
                    >
                      6. Unregistered Email
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 overflow-x-auto gap-2">
        {[
          { id: 'overview', label: 'Programme Overview & Objectives', icon: BookOpen },
          { id: 'curriculum', label: 'Five-Day Learning Programme', icon: Brain },
          { id: 'automation', label: 'Practical Automation Areas', icon: Cpu },
          { id: 'outcomes', label: 'Expected Outcomes & Philosophy', icon: Award },
          { id: 'support', label: 'Continuous Support (US$15/term)', icon: Sparkles },
          ...(accessResult?.is_granted ? [{ id: 'live_stage', label: '🔴 Live Stage Portal', icon: Video }] : [])
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-5 py-3 font-bold text-xs flex items-center space-x-2 border-b-2 whitespace-nowrap transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: PROGRAMME OVERVIEW & OBJECTIVES */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Core Philosophy Banner */}
          <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-amber-500 via-amber-600 to-indigo-700 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2">
              <span className="px-3 py-1 bg-white/20 text-white rounded-full text-[10px] font-black uppercase tracking-wider">
                Core Course Philosophy
              </span>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
                AI DOES NOT REPLACE THE EDUCATOR.
              </h2>
              <p className="text-amber-100 text-xs sm:text-sm max-w-3xl leading-relaxed">
                This introductory course gives educators practical tools to work smarter, automate responsibly and focus more on teaching and learners.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/20 shrink-0 text-center space-y-1">
              <span className="text-[10px] uppercase font-bold text-amber-200">Course Level</span>
              <p className="text-lg font-black text-white">INTRODUCTORY</p>
              <span className="text-[10px] text-amber-100 block">No coding required</span>
            </div>
          </div>

          {/* Course Level Introductory Note */}
          <div className="p-6 bg-indigo-50/80 rounded-3xl border border-indigo-100 text-slate-800 space-y-2">
            <div className="flex items-center space-x-2 text-indigo-800 font-bold text-xs uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>Course Purpose & Entry Criteria</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              This is an introductory, practical course for educators and education professionals who are beginning their journey with Artificial Intelligence and digital tools. No advanced technical or programming knowledge is required. The purpose is to build confidence, demonstrate practical possibilities and help participants begin using AI and digital tools responsibly in their everyday educational work.
            </p>
          </div>

          {/* Programme Overview Card */}
          <div className="p-8 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center space-x-2 text-indigo-600 font-black text-xs uppercase tracking-wider">
              <BookOpen className="w-4 h-4" />
              <span>Programme Overview</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900">
              Transforming Everyday Educational Practice with Artificial Intelligence
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              The YARA AI for Educators Online Bootcamp introduces educators to practical uses of Artificial Intelligence and digital technologies across teaching, assessment, administration, communication, research, content creation and productivity. Participants will learn where automation can reduce repetitive work, where human judgement must remain central, and how to combine AI with familiar digital tools to improve educational practice.
            </p>
          </div>

          {/* Target Participants */}
          <div className="p-8 bg-slate-50 rounded-3xl border border-slate-200 space-y-6">
            <div>
              <span className="text-indigo-600 font-black text-xs uppercase tracking-wider">Target Participants</span>
              <h3 className="text-xl font-black text-slate-900 mt-1">Who Is This Bootcamp Designed For?</h3>
              <p className="text-xs text-slate-500 mt-0.5">Open to all educators, administrative leaders, and education professionals across Africa.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              {[
                { title: 'Teachers and educators', desc: 'Primary and secondary subject teachers seeking to streamline lesson creation and student support.', icon: School },
                { title: 'School heads and administrators', desc: 'Principals, deputy heads, and senior leadership managing school-wide workflows.', icon: Building2 },
                { title: 'Ministry and education delegates', desc: 'Curriculum officials and policy delegates implementing educational technology frameworks.', icon: Award },
                { title: 'Education officers', desc: 'District and regional inspectors monitoring teaching standards and modern methodology.', icon: ShieldCheck },
                { title: 'Teacher trainers', desc: 'Educators in teachers colleges equipping pre-service and in-service teachers with digital tools.', icon: Users },
                { title: 'ICT / digital learning coordinators', desc: 'Computer lab heads and technology champions driving classroom digital integration.', icon: Laptop },
                { title: 'Lecturers', desc: 'University and polytechnic faculty integrating AI into higher education coursework.', icon: BookOpen },
                { title: 'Education support personnel', desc: 'Librarians, counselors, academic secretaries, and learning support assistants.', icon: HelpCircle }
              ].map((role, idx) => {
                const RoleIcon = role.icon;
                return (
                  <div key={idx} className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-2 hover:border-indigo-300 transition-colors">
                    <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                      <RoleIcon className="w-4 h-4" />
                    </div>
                    <h4 className="font-bold text-slate-900">{role.title}</h4>
                    <p className="text-slate-500 leading-relaxed text-[11px]">{role.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Learning Objectives */}
          <div className="p-8 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-indigo-600 font-black text-xs uppercase tracking-wider">Course Curriculum Core</span>
                <h3 className="text-xl font-black text-slate-900 mt-1">Learning Objectives</h3>
              </div>
              <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-full">
                9 Core Competencies
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {AI_FOR_EDUCATORS_EVENT.learning_objectives.map((obj, i) => (
                <div key={i} className="flex items-start space-x-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-indigo-50/40 hover:border-indigo-100 transition-all">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center shrink-0 text-[11px] mt-0.5">
                    {i + 1}
                  </div>
                  <p className="text-slate-700 leading-relaxed">{obj}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Certification Note */}
          <div className="p-6 md:p-8 rounded-3xl bg-slate-900 text-white border border-slate-800 space-y-3">
            <div className="flex items-center space-x-2">
              <Award className="w-5 h-5 text-amber-400" />
              <h4 className="text-base font-black text-white">YARA Certification of Completion</h4>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {AI_FOR_EDUCATORS_EVENT.certification_note}
            </p>
          </div>
        </div>
      )}

      {/* TAB 2: FIVE-DAY LEARNING PROGRAMME (DETAILED SESSION BREAKDOWN) */}
      {activeTab === 'curriculum' && (
        <div className="space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
            <div>
              <span className="text-indigo-600 font-black text-xs uppercase tracking-wider">
                Full 5-Day Curriculum Schedule
              </span>
              <h2 className="text-2xl font-black text-slate-900 mt-1">
                Five-Day Learning Programme
              </h2>
              <p className="text-xs text-slate-500">
                31 August – 4 September 2026 | Comprehensive session-by-session breakdown
              </p>
            </div>

            {/* Day Selector Pills */}
            <div className="flex flex-wrap gap-1.5">
              {[1, 2, 3, 4, 5].map(d => (
                <button
                  key={d}
                  onClick={() => setSelectedDay(d)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedDay === d
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Day {d}
                </button>
              ))}
            </div>
          </div>

          {/* Selected Day View & Complete Programme List */}
          <div className="space-y-6">
            {AI_FOR_EDUCATORS_EVENT.five_day_programme.map((progDay) => (
              <div 
                key={progDay.day} 
                className={`p-6 md:p-8 bg-white rounded-3xl border transition-all ${
                  selectedDay === progDay.day 
                    ? 'border-indigo-600 shadow-md ring-2 ring-indigo-600/10' 
                    : 'border-slate-200 shadow-xs opacity-90'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-4 mb-6">
                  <div>
                    <span className="px-3 py-1 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-full text-[10px] font-black uppercase tracking-wider">
                      {progDay.date}
                    </span>
                    <h3 className="text-lg sm:text-xl font-black text-slate-900 mt-2">
                      {progDay.title}
                    </h3>
                  </div>
                  <span className="text-xs font-bold text-slate-400">
                    {progDay.sessions.length} Structured Sessions
                  </span>
                </div>

                {/* Day 5 Certification Callout */}
                {progDay.certificate_note && (
                  <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start space-x-3 text-xs text-amber-900">
                    <Award className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block font-black text-amber-950">Certificate Note:</strong>
                      <span>{progDay.certificate_note}</span>
                    </div>
                  </div>
                )}

                {/* 2-Column Table of SESSION & PRACTICAL FOCUS */}
                <div className="overflow-x-auto rounded-2xl border border-slate-200">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-900 text-white font-bold uppercase text-[10px] tracking-wider">
                        <th className="p-4 w-1/3 border-b border-slate-800">SESSION</th>
                        <th className="p-4 w-2/3 border-b border-slate-800">PRACTICAL FOCUS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {progDay.sessions.map((sess, sIdx) => (
                        <tr key={sIdx} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-4 font-bold text-slate-900 align-top flex items-start space-x-2">
                            <span className="w-5 h-5 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                              {sIdx + 1}
                            </span>
                            <span>{sess.session}</span>
                          </td>
                          <td className="p-4 text-slate-600 leading-relaxed align-top">
                            {sess.practical_focus}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: PRACTICAL AUTOMATION AREAS */}
      {activeTab === 'automation' && (
        <div className="space-y-8">
          <div className="p-8 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white rounded-3xl border border-slate-800 space-y-4">
            <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full text-xs font-black uppercase tracking-wider">
              Everyday Classroom & Administrative Efficiency
            </span>
            <h2 className="text-2xl sm:text-3xl font-black">
              Practical Automation Areas
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm max-w-3xl leading-relaxed">
              Explore key areas across teaching, assessment, administration, and communication where educators can automate repetitive workflows while retaining critical human oversight and decision-making.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            {AI_FOR_EDUCATORS_EVENT.practical_automation_areas.map((area, idx) => (
              <div key={idx} className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-2 hover:border-indigo-400 hover:shadow-md transition-all">
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">
                    {idx + 1}
                  </div>
                  <h4 className="font-black text-slate-900 text-sm">{area}</h4>
                </div>
                <p className="text-slate-500 text-[11px] leading-relaxed">
                  Automate formatting, generate high-quality drafts, create structured templates, and reduce manual time consumption.
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: EXPECTED OUTCOMES & PHILOSOPHY */}
      {activeTab === 'outcomes' && (
        <div className="space-y-8">
          {/* Header */}
          <div className="border-b border-slate-200 pb-4">
            <span className="text-indigo-600 font-black text-xs uppercase tracking-wider">Measurable Results</span>
            <h2 className="text-2xl font-black text-slate-900 mt-1">Expected Course Outcomes</h2>
            <p className="text-xs text-slate-500">By the end of this 5-day bootcamp, every educator will achieve the following outcomes:</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {AI_FOR_EDUCATORS_EVENT.expected_outcomes.map((outcome, idx) => (
              <div key={idx} className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-start space-x-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0 font-bold">
                  <Check className="w-4 h-4" />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Outcome {idx + 1}</span>
                  <p className="text-slate-800 font-medium leading-relaxed">{outcome}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Philosophy Statement in Depth */}
          <div className="p-8 bg-slate-50 rounded-3xl border border-slate-200 space-y-4">
            <h3 className="text-xl font-black text-slate-900">
              AI Does Not Replace the Educator: Human-in-the-Loop Pedagogy
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Artificial Intelligence serves as a cognitive assistant and productivity accelerator. Empathy, contextual nuance, moral guidance, and final educational decisions remain strictly in the hands of the educator. This course provides practical tools to work smarter, automate responsibly, and dedicate more quality time to mentoring students.
            </p>
          </div>
        </div>
      )}

      {/* TAB 4: CONTINUOUS SUPPORT */}
      {activeTab === 'support' && (
        <div className="p-8 bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 text-white rounded-3xl border border-indigo-900 shadow-xl space-y-6">
          <div className="max-w-2xl space-y-2">
            <span className="px-3.5 py-1 bg-purple-400/20 text-purple-300 border border-purple-400/30 rounded-full text-xs font-black uppercase tracking-wider">
              US$15 per term Continuous Mentorship
            </span>
            <h2 className="text-3xl font-black">Continuous Educator Support & AI Updates</h2>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Education technology moves rapidly. Enrolling in Continuous Support ensures you and your school receive ongoing quarterly prompt packs, priority live technical assistance, monthly teacher masterclasses, and curated AI classroom modules all year round.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
            <div className="p-5 rounded-2xl bg-white/10 border border-white/10 space-y-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <h4 className="font-bold text-sm">Monthly Live Masterclasses</h4>
              <p className="text-xs text-slate-300">Deep-dive clinics on emerging tools, offline AI models, and student coding aids.</p>
            </div>

            <div className="p-5 rounded-2xl bg-white/10 border border-white/10 space-y-2">
              <FileText className="w-5 h-5 text-indigo-400" />
              <h4 className="font-bold text-sm">Termly Resource Drop</h4>
              <p className="text-xs text-slate-300">Fresh prompt vaults, syllabus updates, and pre-formatted termly test repositories.</p>
            </div>

            <div className="p-5 rounded-2xl bg-white/10 border border-white/10 space-y-2">
              <Users className="w-5 h-5 text-emerald-400" />
              <h4 className="font-bold text-sm">Dedicated WhatsApp Helpline</h4>
              <p className="text-xs text-slate-300">Direct technical and troubleshooting assistance from YARA educational engineers.</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5 / MODAL: LIVE STAGE (FOR APPROVED USERS ONLY) */}
      {accessResult?.is_granted && isInLiveStage && (
        <div className="p-8 bg-slate-950 text-white rounded-3xl border border-emerald-500/40 shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-full bg-red-500 animate-ping"></span>
                <span className="text-xs font-black text-red-400 uppercase tracking-wider">LIVE BOOTCAMP STAGE</span>
              </div>
              <h2 className="text-2xl font-black mt-1">AI for Educators — Interactive Live Hall</h2>
              <p className="text-xs text-slate-400">Welcome, {accessResult.registration?.full_name} ({accessResult.registration?.school_institution})</p>
            </div>

            <button
              onClick={() => setIsInLiveStage(false)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-bold rounded-xl text-slate-300"
            >
              Exit Live Stage
            </button>
          </div>

          {/* Virtual Stage Video Frame */}
          <div className="aspect-video w-full rounded-2xl bg-slate-900 border border-slate-800 flex flex-col items-center justify-center p-8 text-center space-y-4 relative overflow-hidden">
            <div className="w-20 h-20 rounded-3xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <Video className="w-10 h-10 animate-pulse" />
            </div>
            <div className="space-y-1 max-w-md">
              <h3 className="text-lg font-black text-white">Live Stream & Interactive Virtual Workshop</h3>
              <p className="text-xs text-slate-400">
                The live video broadcast connects directly via YARA Daily/WebRTC video mesh. Session room: <strong className="text-indigo-300 font-mono">yara-ai-educators-2026</strong>.
              </p>
            </div>
            <div className="flex gap-3">
              <a
                href={`https://meet.google.com/new`}
                target="_blank"
                rel="noreferrer"
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs flex items-center space-x-2"
              >
                <span>Launch Interactive Workshop Bridge</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Quick Session Downloads */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Participant Resource</span>
              <p className="text-xs font-bold text-white">📘 50+ Prompt Vault (PDF)</p>
              <button className="text-xs text-indigo-400 hover:underline font-bold">Download Vault</button>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Interactive Workspace</span>
              <p className="text-xs font-bold text-white">💻 Arduino AI Code Starter Kit</p>
              <button className="text-xs text-indigo-400 hover:underline font-bold">View GitHub Repo</button>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Attendance & Certificate</span>
              <p className="text-xs font-bold text-emerald-400">✅ Entry Logged on Server</p>
              <span className="text-[10px] text-slate-500">Certificate unlocked upon completion</span>
            </div>
          </div>
        </div>
      )}

      {/* REGISTRATION MODAL */}
      {showRegModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-xl w-full p-6 md:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-[10px] font-black uppercase tracking-wider">
                  Registration & Enrollment
                </span>
                <h3 className="text-xl font-black text-slate-900 mt-1">AI for Educators Online Bootcamp</h3>
              </div>
              <button 
                onClick={() => setShowRegModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRegisterSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1 uppercase tracking-wider">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={regForm.full_name}
                    onChange={e => setRegForm({ ...regForm, full_name: e.target.value })}
                    placeholder="e.g. Tendai Mupfumi"
                    className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1 uppercase tracking-wider">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={regForm.email}
                    onChange={e => setRegForm({ ...regForm, email: e.target.value })}
                    placeholder="educator@school.ac.zw"
                    className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1 uppercase tracking-wider">Phone / WhatsApp *</label>
                  <input
                    type="tel"
                    required
                    value={regForm.phone}
                    onChange={e => setRegForm({ ...regForm, phone: e.target.value })}
                    placeholder="+263 77 123 4567"
                    className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1 uppercase tracking-wider">School / Institution *</label>
                  <input
                    type="text"
                    required
                    value={regForm.school_institution}
                    onChange={e => setRegForm({ ...regForm, school_institution: e.target.value })}
                    placeholder="e.g. Churchill High School / Independent"
                    className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1 uppercase tracking-wider">Teaching Level</label>
                  <select
                    value={regForm.teaching_level}
                    onChange={e => setRegForm({ ...regForm, teaching_level: e.target.value as any })}
                    className="w-full p-3 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  >
                    <option value="primary">Primary School</option>
                    <option value="secondary">Secondary / High School</option>
                    <option value="tertiary">Tertiary / University</option>
                    <option value="tvet">TVET / Technical Institute</option>
                    <option value="non_formal">Non-Formal / Community STEM</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1 uppercase tracking-wider">Province / Region</label>
                  <select
                    value={regForm.city_province}
                    onChange={e => setRegForm({ ...regForm, city_province: e.target.value })}
                    className="w-full p-3 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  >
                    <option value="Harare">Harare</option>
                    <option value="Bulawayo">Bulawayo</option>
                    <option value="Manicaland">Manicaland</option>
                    <option value="Mashonaland Central">Mashonaland Central</option>
                    <option value="Mashonaland East">Mashonaland East</option>
                    <option value="Mashonaland West">Mashonaland West</option>
                    <option value="Masvingo">Masvingo</option>
                    <option value="Matabeleland North">Matabeleland North</option>
                    <option value="Matabeleland South">Matabeleland South</option>
                    <option value="Midlands">Midlands</option>
                    <option value="International">International / Other</option>
                  </select>
                </div>
              </div>

              {/* Fee Notice */}
              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 space-y-2">
                <div className="flex items-center justify-between text-amber-900 font-bold">
                  <span>Registration Fee</span>
                  <span className="text-base font-black text-amber-950">US$10.00</span>
                </div>
                <p className="text-[11px] text-amber-800">
                  Payment instructions: Pay via EcoCash Merchant / Innbucks / Bank Swipe / Card. Enter your confirmation reference below.
                </p>
                <div>
                  <label className="block font-bold text-amber-950 mb-1 uppercase tracking-wider">Payment Reference / EcoCash Txn ID (Optional)</label>
                  <input
                    type="text"
                    value={regForm.payment_reference}
                    onChange={e => setRegForm({ ...regForm, payment_reference: e.target.value })}
                    placeholder="e.g. MP260831.1234.H00001"
                    className="w-full p-2.5 rounded-xl border border-amber-300 bg-white focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="p-3 bg-purple-50 rounded-2xl border border-purple-100 flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="modal_continuous_support"
                  checked={regForm.continuous_support_opt_in}
                  onChange={e => setRegForm({ ...regForm, continuous_support_opt_in: e.target.checked })}
                  className="w-4 h-4 text-indigo-600 rounded"
                />
                <label htmlFor="modal_continuous_support" className="text-xs text-purple-900 font-bold cursor-pointer">
                  Include Continuous Support (US$15 per term ongoing AI prompt drops, termly webinar masterclasses & educator mentorship)
                </label>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowRegModal(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReg}
                  className="px-7 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black shadow-md disabled:opacity-50 transition-all cursor-pointer"
                >
                  {isSubmittingReg ? 'Submitting Registration...' : 'Complete Registration'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
