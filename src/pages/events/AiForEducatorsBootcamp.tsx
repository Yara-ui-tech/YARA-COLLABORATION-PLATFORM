import React, { useState, useEffect } from 'react';
import { 
  Calendar, Clock, DollarSign, ShieldCheck, CheckCircle2, 
  AlertCircle, Sparkles, BookOpen, Brain, Users, Award, 
  Video, ArrowRight, Lock, Check, FileText, Send, HelpCircle, 
  School, Laptop, Star, RefreshCw, XCircle, Share2, Layers, Cpu, 
  Building2, Key, Copy, ExternalLink, Link as LinkIcon, Info,
  Download, Printer, FileCheck, UploadCloud
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../components/AuthContext';
import { 
  AI_FOR_EDUCATORS_EVENT, 
  EventRegistration, 
  EventAccessResult,
  EventMeetingConfig,
  EducatorReceiptData,
  EducatorCertificateData
} from '../../types/eventRegistration';
import { 
  checkEventAccess, 
  registerForEvent, 
  getEventRegistrationByEmail,
  recordEventEntry,
  getEventTimelineStatus,
  getEventMeetingConfig,
  fetchEventMeetingConfig,
  subscribeToEventMeetingConfig,
  buildEducatorReceipt,
  buildEducatorCertificate,
  generateEducatorReceiptByNameAndRef,
  submitRegistrationPayment
} from '../../services/eventRegistrationService';
import EducatorReceiptModal from '../../components/events/EducatorReceiptModal';
import EducatorCertificateModal from '../../components/events/EducatorCertificateModal';

export default function AiForEducatorsBootcamp() {
  const { user, profile } = useAuth();
  
  // Lookup states
  const [codeInput, setCodeInput] = useState<string>('');
  const [accessResult, setAccessResult] = useState<EventAccessResult | null>(null);
  const [isCheckingAccess, setIsCheckingAccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'curriculum' | 'automation' | 'outcomes' | 'support' | 'live_stage'>('overview');
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [copiedLabel, setCopiedLabel] = useState<string | null>(null);

  // Receipt Modal State
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [receiptData, setReceiptData] = useState<EducatorReceiptData | null>(null);

  // Certificate Modal State
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [certificateData, setCertificateData] = useState<EducatorCertificateData | null>(null);
  
  // User Proof of Payment Submission Modal State
  const [showProofModal, setShowProofModal] = useState(false);
  const [isSubmittingProof, setIsSubmittingProof] = useState(false);
  const [proofForm, setProofForm] = useState({
    payment_method: 'EcoCash',
    payment_reference: '',
    notes: ''
  });

  // Quick Receipt Lookup Modal State (Name + Reference / Code)
  const [showReceiptLookupModal, setShowReceiptLookupModal] = useState(false);
  const [receiptLookupName, setReceiptLookupName] = useState('');
  const [receiptLookupRef, setReceiptLookupRef] = useState('');
  const [isLookingUpReceipt, setIsLookingUpReceipt] = useState(false);
  const [receiptLookupError, setReceiptLookupError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Meeting Link Configuration (managed by admins)
  const [meetingConfig, setMeetingConfig] = useState<EventMeetingConfig>(() => 
    getEventMeetingConfig(AI_FOR_EDUCATORS_EVENT.id)
  );

  // Registration Form State
  const [showRegModal, setShowRegModal] = useState(false);
  const [isSubmittingReg, setIsSubmittingReg] = useState(false);
  const [registeredResult, setRegisteredResult] = useState<EventRegistration | null>(null);
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

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLabel(label);
    setTimeout(() => setCopiedLabel(null), 2500);
  };

  // Real-time listener and periodic polling for Google Meet link updates
  useEffect(() => {
    let isMounted = true;

    // 1. Initial live fetch from Supabase
    fetchEventMeetingConfig(AI_FOR_EDUCATORS_EVENT.id).then(liveCfg => {
      if (isMounted && liveCfg) {
        setMeetingConfig(liveCfg);
      }
    });

    // 2. Real-time subscription (Supabase Realtime + BroadcastChannel + Window events)
    const unsubscribe = subscribeToEventMeetingConfig(AI_FOR_EDUCATORS_EVENT.id, (updatedCfg) => {
      if (isMounted && updatedCfg) {
        setMeetingConfig(updatedCfg);
      }
    });

    // 3. Fallback polling every 15 seconds to ensure instant synchronization
    const pollInterval = setInterval(() => {
      fetchEventMeetingConfig(AI_FOR_EDUCATORS_EVENT.id).then(liveCfg => {
        if (isMounted && liveCfg) {
          setMeetingConfig(liveCfg);
        }
      });
    }, 15000);

    return () => {
      isMounted = false;
      unsubscribe();
      clearInterval(pollInterval);
    };
  }, []);

  // Check access whenever user or code changes
  const verifyCurrentAccess = async (targetQuery?: string) => {
    const queryToUse = (targetQuery !== undefined ? targetQuery : (codeInput || user?.email || '')).trim();
    
    // Refresh meeting config from cloud
    try {
      const liveMeeting = await fetchEventMeetingConfig(AI_FOR_EDUCATORS_EVENT.id);
      if (liveMeeting) {
        setMeetingConfig(liveMeeting);
      }
    } catch {
      setMeetingConfig(getEventMeetingConfig(AI_FOR_EDUCATORS_EVENT.id));
    }

    if (!queryToUse) {
      setAccessResult({
        is_granted: false,
        reason: 'unregistered',
        message: 'Enter your registration code (e.g. YARA-AI-...) or registered email to verify approval and unlock the Google Meet link.',
        timeline_status: getEventTimelineStatus(AI_FOR_EDUCATORS_EVENT.start_date, AI_FOR_EDUCATORS_EVENT.close_date)
      });
      return;
    }

    setIsCheckingAccess(true);
    try {
      const result = await checkEventAccess(AI_FOR_EDUCATORS_EVENT.id, queryToUse, user?.id);
      setAccessResult(result);
    } catch (err) {
      console.error('Error verifying event access:', err);
    } finally {
      setIsCheckingAccess(false);
    }
  };

  useEffect(() => {
    if (user?.email) {
      setCodeInput(user.email);
      verifyCurrentAccess(user.email);
    } else {
      verifyCurrentAccess();
    }
  }, [user]);

  // Handle new registration
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingReg(true);

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
        setRegisteredResult(res);
        setCodeInput(res.registration_code || res.email);
        await verifyCurrentAccess(res.registration_code || res.email);
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
      setActiveTab('live_stage');
      setEntryMessage('Welcome to the Live Training Stage of the AI for Educators Online Bootcamp!');
    } catch (err) {
      console.error('Error recording entry:', err);
      setIsInLiveStage(true);
      setActiveTab('live_stage');
    }
  };

  // Open Official Receipt for verified / approved user
  const handleDownloadCurrentReceipt = () => {
    if (!accessResult?.registration) return;
    const rcpt = buildEducatorReceipt(accessResult.registration);
    setReceiptData(rcpt);
    setShowReceiptModal(true);
  };

  // Open Certificate Download Modal
  const handleDownloadCurrentCertificate = () => {
    if (!accessResult?.registration) return;
    const cert = buildEducatorCertificate(accessResult.registration);
    setCertificateData(cert);
    setShowCertificateModal(true);
  };

  // Submit proof of payment details
  const handleSubmitProofOfPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessResult?.registration) return;
    if (!proofForm.payment_reference.trim()) {
      alert('Please enter your transaction reference number.');
      return;
    }
    setIsSubmittingProof(true);
    try {
      await submitRegistrationPayment(accessResult.registration.id, {
        payment_method: proofForm.payment_method,
        payment_reference: proofForm.payment_reference.trim(),
        notes: proofForm.notes.trim() || undefined
      });
      setShowProofModal(false);
      setNotification({
        type: 'success',
        message: 'Payment proof submitted! An administrator will verify and approve your registration receipt and Google Meet clearance.'
      });
      setTimeout(() => setNotification(null), 6000);
      await verifyCurrentAccess(accessResult.registration.registration_code || accessResult.registration.email);
    } catch (err: any) {
      alert(err.message || 'Failed to submit payment proof.');
    } finally {
      setIsSubmittingProof(false);
    }
  };

  // Quick Receipt Lookup by Name and Ref Number
  const handleLookupReceiptSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!receiptLookupName.trim() || !receiptLookupRef.trim()) {
      setReceiptLookupError('Please enter both your Full Name and Payment Reference / Code.');
      return;
    }
    setIsLookingUpReceipt(true);
    setReceiptLookupError(null);
    try {
      const generated = await generateEducatorReceiptByNameAndRef(
        receiptLookupName.trim(),
        receiptLookupRef.trim()
      );
      setReceiptData(generated);
      setShowReceiptLookupModal(false);
      setShowReceiptModal(true);
    } catch (err: any) {
      setReceiptLookupError(err.message || 'Could not locate approved registration with the provided details.');
    } finally {
      setIsLookingUpReceipt(false);
    }
  };

  const timelineStatus = accessResult?.timeline_status || 'upcoming';

  return (
    <div className="space-y-10 pb-20 max-w-7xl mx-auto">
      {/* Toast Notification */}
      {notification && (
        <div 
          className={`p-4 rounded-2xl border text-xs font-bold flex items-center justify-between shadow-lg transition-all ${
            notification.type === 'success' 
              ? 'bg-emerald-50 border-emerald-300 text-emerald-900' 
              : 'bg-red-50 border-red-300 text-red-900'
          }`}
        >
          <div className="flex items-center space-x-2">
            {notification.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" /> : <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />}
            <span>{notification.message}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-slate-400 hover:text-slate-700 ml-4 cursor-pointer">✕</button>
        </div>
      )}

      {/* Top Breadcrumb & Status Notice */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-2 text-xs text-slate-500">
          <span>Events</span>
          <span>/</span>
          <span className="text-indigo-600 font-bold">AI for Educators – Online Bootcamp</span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowReceiptLookupModal(true)}
            className="px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 text-xs font-bold rounded-xl flex items-center space-x-1.5 transition-all cursor-pointer shadow-2xs"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Download Official Receipt / Check Status</span>
          </button>
          <span className="px-3 py-1 bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold rounded-full flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse"></span>
            <span>Google Meet Live Portal</span>
          </span>
          <span className="px-3 py-1 bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold rounded-full">
            Fee: US$10 | Mentorship: US$15/term
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

          {/* Right Column: Approval Portal & Google Meet Code Verification Card */}
          <div className="lg:col-span-5">
            <div className="p-6 md:p-7 rounded-3xl bg-slate-900/90 border border-slate-700/80 shadow-2xl backdrop-blur-md space-y-5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center space-x-2">
                  <Video className="w-5 h-5 text-indigo-400" />
                  <h3 className="text-sm font-black text-white uppercase tracking-wider">
                    Google Meet Access Portal
                  </h3>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                  accessResult?.is_granted
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                }`}>
                  {accessResult?.is_granted ? 'Clearance Granted' : 'Approval Required'}
                </span>
              </div>

              {/* Registration Code or Email Entry */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Enter Registration Code or Email
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Key className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={codeInput}
                      onChange={e => setCodeInput(e.target.value)}
                      placeholder="e.g. YARA-AI-1234 or email..."
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-mono"
                    />
                  </div>
                  <button
                    onClick={() => verifyCurrentAccess()}
                    disabled={isCheckingAccess}
                    className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition-all flex items-center justify-center cursor-pointer shadow-md"
                  >
                    {isCheckingAccess ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Unlock'}
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
                        ? 'Google Meet Clearance Granted'
                        : accessResult?.reason === 'unpaid'
                        ? 'Fee Required — US$10 Due'
                        : accessResult?.reason === 'payment_pending'
                        ? 'Payment Awaiting Verification in Admin Console'
                        : accessResult?.reason === 'pending_approval'
                        ? 'Awaiting Administrator Approval in Admin Console'
                        : accessResult?.reason === 'rejected'
                        ? 'Registration Restricted by Administrator'
                        : 'Enter Code to Unlock Google Meet Link'}
                    </p>
                    <p className="text-[11px] leading-relaxed opacity-90">
                      {accessResult?.message || 'Registrations are reviewed and approved by administrators in the Admin Console.'}
                    </p>
                    {accessResult?.registration && (
                      <p className="text-[10px] text-slate-400 pt-1 font-mono">
                        Educator: <strong className="text-white">{accessResult.registration.full_name}</strong> | Code: <strong className="text-amber-300">{accessResult.registration.registration_code || accessResult.registration.id}</strong>
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* UNLOCKED GOOGLE MEET PREVIEW CARD */}
              {accessResult?.is_granted && (
                <div className="p-4 rounded-2xl bg-indigo-950/60 border border-indigo-500/40 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider text-indigo-300 flex items-center space-x-1">
                      <Video className="w-3.5 h-3.5" />
                      <span>Google Meet Destination</span>
                    </span>
                    <button
                      onClick={() => handleCopy(meetingConfig.meeting_url, 'Meeting Link')}
                      className="text-[10px] text-indigo-300 hover:text-white font-bold flex items-center space-x-1 cursor-pointer"
                    >
                      <Copy className="w-3 h-3" />
                      <span>{copiedLabel === 'Meeting Link' ? 'Copied Link!' : 'Copy Link'}</span>
                    </button>
                  </div>

                  <a 
                    href={meetingConfig.meeting_url} 
                    target="_blank" 
                    rel="noreferrer"
                    className="block text-xs font-black text-amber-300 hover:underline truncate font-mono"
                  >
                    {meetingConfig.meeting_url}
                  </a>

                  <div className="flex items-center justify-between text-[11px] text-slate-300 pt-1 border-t border-indigo-900/60">
                    <span>Passcode: <strong className="font-mono text-white">{meetingConfig.passcode || 'None'}</strong></span>
                    <span>Time: <strong className="text-white">{meetingConfig.daily_schedule_time}</strong></span>
                  </div>
                </div>
              )}

              {/* PRIMARY ACTION BUTTON: ENTER EVENT, DOWNLOAD RECEIPT, OR REGISTER */}
              {accessResult?.is_granted ? (
                <div className="space-y-2.5">
                  <a
                    href={meetingConfig.meeting_url}
                    target="_blank"
                    rel="noreferrer"
                    onClick={handleEnterEvent}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-sm uppercase tracking-wider shadow-lg shadow-emerald-500/25 flex items-center justify-center space-x-2 transition-all transform hover:scale-[1.02] cursor-pointer"
                  >
                    <Video className="w-5 h-5" />
                    <span>JOIN LIVE GOOGLE MEET</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>

                  {accessResult.registration?.certificate_unlocked ? (
                    <button
                      onClick={handleDownloadCurrentCertificate}
                      className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center space-x-2 shadow-lg shadow-amber-500/25 transition-all cursor-pointer transform hover:scale-[1.01]"
                    >
                      <Award className="w-4 h-4 text-slate-950" />
                      <span>Download Official Diploma Certificate</span>
                      <Download className="w-3.5 h-3.5 text-slate-950" />
                    </button>
                  ) : null}

                  <button
                    onClick={handleDownloadCurrentReceipt}
                    className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center space-x-2 shadow-md transition-all cursor-pointer"
                  >
                    <FileCheck className="w-4 h-4 text-emerald-300" />
                    <span>Download Official Payment Receipt</span>
                    <Download className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={handleEnterEvent}
                    className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center justify-center space-x-1.5 cursor-pointer"
                  >
                    <span>Open Interactive Live Stage Portal & Materials</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : accessResult?.registration ? (
                <div className="space-y-2.5">
                  {accessResult.registration.payment_status !== 'verified' ? (
                    <button
                      onClick={() => {
                        setProofForm({
                          payment_method: accessResult.registration?.payment_method || 'EcoCash',
                          payment_reference: accessResult.registration?.payment_reference || '',
                          notes: accessResult.registration?.payment_notes || ''
                        });
                        setShowProofModal(true);
                      }}
                      className="w-full py-3.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs uppercase tracking-wider shadow-md flex items-center justify-center space-x-2 transition-all cursor-pointer"
                    >
                      <UploadCloud className="w-4 h-4" />
                      <span>Submit / Update Proof of Payment</span>
                    </button>
                  ) : (
                    <button
                      onClick={handleDownloadCurrentReceipt}
                      className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs uppercase tracking-wider shadow-md flex items-center justify-center space-x-2 transition-all cursor-pointer"
                    >
                      <FileCheck className="w-4 h-4" />
                      <span>Download Verified Payment Receipt</span>
                    </button>
                  )}

                  <button
                    onClick={() => verifyCurrentAccess()}
                    disabled={isCheckingAccess}
                    className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold flex items-center justify-center space-x-1 cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isCheckingAccess ? 'animate-spin' : ''}`} />
                    <span>Check Verification Status</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      setRegisteredResult(null);
                      setShowRegModal(true);
                    }}
                    className="w-full py-3.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs uppercase tracking-wider shadow-md flex items-center justify-center space-x-2 transition-all cursor-pointer"
                  >
                    <span>Register for Event (US$10)</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                    <span>Admin verifies payment & approves access</span>
                    <button
                      onClick={() => setShowReceiptLookupModal(true)}
                      className="text-indigo-400 hover:underline font-bold"
                    >
                      Already paid? Retrieve receipt
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
          ...(accessResult?.is_granted ? [{ id: 'live_stage', label: '🔴 Live Google Meet Stage', icon: Video }] : [])
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

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-8 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                  <Brain className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-black text-slate-900">Why AI for Educators?</h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Educators spend up to 40% of their working hours on administrative overhead: drafting lesson plans, preparing differentiated worksheets, grading assessments, compiling progress reports, and drafting communication. This bootcamp teaches you how to responsibly delegate routine tasks to AI while retaining human pedagogical insight.
              </p>
              <ul className="space-y-2 text-xs text-slate-700 font-medium">
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Save 10+ hours per week in routine lesson and test generation</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Build adaptive worksheets tailored to mixed-ability classrooms</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Integrate ethical AI guidelines and critical thinking into student tasks</span>
                </li>
              </ul>
            </div>

            <div className="p-8 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
                  <Award className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-black text-slate-900">Certification & Recognition</h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Every verified educator who completes the five-day live virtual training and submits the hands-on capstone project receives the official <strong>YARA Certified AI Educator (Foundations)</strong> credential, verified with a verifiable digital certificate ID.
              </p>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Official Certification</span>
                <p className="text-xs font-bold text-slate-900">YARA Certified AI Educator — Introductory Bootcamp 2026</p>
                <span className="text-[11px] text-slate-500">Issued by Young Africans Robotics Association</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CURRICULUM */}
      {activeTab === 'curriculum' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-black text-slate-900">5-Day Structured Curriculum</h3>
              <p className="text-xs text-slate-500">31 August – 4 September 2026 | Daily 17:00 – 19:30 CAT</p>
            </div>
            <div className="flex gap-1.5 bg-slate-100 p-1 rounded-2xl">
              {[1, 2, 3, 4, 5].map(d => (
                <button
                  key={d}
                  onClick={() => setSelectedDay(d)}
                  className={`px-3 py-1.5 rounded-xl font-black text-xs transition-all cursor-pointer ${
                    selectedDay === d ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Day {d}
                </button>
              ))}
            </div>
          </div>

          <div className="p-8 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-6">
            {selectedDay === 1 && (
              <div className="space-y-4">
                <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-black uppercase">
                  Day 1: Demystifying AI & Prompt Engineering for Teaching
                </span>
                <h4 className="text-2xl font-black text-slate-900">Introduction to Generative AI & Classroom Prompt Craft</h4>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Understand how Large Language Models (LLMs) function, their limitations, hallucination management, and master the 4-part pedagogical prompt architecture (Role, Context, Task, Constraints).
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                    <h5 className="font-bold text-xs text-slate-900">Core Hands-On Lab</h5>
                    <p className="text-xs text-slate-500">Crafting high-yield prompts for lesson plans and interactive student discussions.</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                    <h5 className="font-bold text-xs text-slate-900">Tools Covered</h5>
                    <p className="text-xs text-slate-500">ChatGPT, Claude, Google Gemini, and DeepSeek for educators.</p>
                  </div>
                </div>
              </div>
            )}

            {selectedDay === 2 && (
              <div className="space-y-4">
                <span className="px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-black uppercase">
                  Day 2: Lesson Planning & Differentiated Learning Material
                </span>
                <h4 className="text-2xl font-black text-slate-900">Automating Lesson Prep & Multilevel Worksheets</h4>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Generate full curriculum-aligned lesson schemes in minutes, create differentiated reading levels for mixed-ability classes, and build engaging classroom games and simulation prompts.
                </p>
              </div>
            )}

            {selectedDay === 3 && (
              <div className="space-y-4">
                <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-black uppercase">
                  Day 3: Assessment Design, Rubrics & Automated Feedback
                </span>
                <h4 className="text-2xl font-black text-slate-900">Modern Assessment Tools & Personalized Feedback Loops</h4>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Create rubrics aligned to Bloom's taxonomy, generate multi-choice and scenario test banks with answer rationales, and formulate constructive, individualized feedback for learners.
                </p>
              </div>
            )}

            {selectedDay === 4 && (
              <div className="space-y-4">
                <span className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-black uppercase">
                  Day 4: AI for School Administration & Teacher Productivity
                </span>
                <h4 className="text-2xl font-black text-slate-900">Drafting Letters, Reports & Data Summaries</h4>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Automate parent communication letters, school newsletters, termly progress report commentary, and summarize dense educational policy documents.
                </p>
              </div>
            )}

            {selectedDay === 5 && (
              <div className="space-y-4">
                <span className="px-3 py-1 bg-rose-50 text-rose-700 rounded-full text-xs font-black uppercase">
                  Day 5: Ethical AI, Plagiarism, Policy & Capstone Project
                </span>
                <h4 className="text-2xl font-black text-slate-900">AI Ethics, Academic Integrity & Capstone Presentation</h4>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Establish responsible classroom AI guidelines, detect misuse without flawed detector tools, evaluate student AI literacy, and present your custom AI educator workflow portfolio.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: AUTOMATION */}
      {activeTab === 'automation' && (
        <div className="space-y-6">
          <div className="max-w-2xl space-y-2">
            <h3 className="text-xl font-black text-slate-900">Practical Automation Areas for Educators</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Explore concrete workflows where educators save time every week using modern artificial intelligence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-white rounded-3xl border border-slate-200 space-y-3">
              <BookOpen className="w-6 h-6 text-indigo-600" />
              <h4 className="font-black text-base text-slate-900">Lesson Prep & Curricula</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Transform standard syllabus objectives into detailed 45-minute lesson outlines complete with discussion starters, vocabulary lists, and analogies.
              </p>
            </div>

            <div className="p-6 bg-white rounded-3xl border border-slate-200 space-y-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              <h4 className="font-black text-base text-slate-900">Assessment & Rubrics</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Generate 4-tier analytic rubrics, multiple-choice questions with distractor analysis, and essay prompts with model marking keys.
              </p>
            </div>

            <div className="p-6 bg-white rounded-3xl border border-slate-200 space-y-3">
              <FileText className="w-6 h-6 text-purple-600" />
              <h4 className="font-black text-base text-slate-900">Admin & Parent Comms</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Quickly draft professional letters, compassionate emails for struggling students, field trip notices, and meeting minutes.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: OUTCOMES */}
      {activeTab === 'outcomes' && (
        <div className="p-8 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <h3 className="text-xl font-black text-slate-900">Expected Course Outcomes</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              'Confidence in prompting generative AI models for academic and pedagogical tasks.',
              'Ability to generate individualized remedial and enrichment learning materials in minutes.',
              'Clear ethical frameworks to advise learners, parents, and school heads on AI usage.',
              'A ready-to-use digital toolkit of 50+ pre-built educator prompts and templates.',
              'Access to termly continuous updates and ongoing teacher mentorship.'
            ].map((outcome, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-start space-x-3">
                <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  ✓
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">{outcome}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: SUPPORT */}
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

      {/* TAB 6: LIVE GOOGLE MEET STAGE (UNLOCKED ONLY FOR APPROVED ATTENDEES) */}
      {(activeTab === 'live_stage' || isInLiveStage) && (
        accessResult?.is_granted ? (
          <div className="p-8 bg-slate-950 text-white rounded-3xl border border-emerald-500/40 shadow-2xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="text-xs font-black text-emerald-400 uppercase tracking-wider">LIVE BOOTCAMP ACCESS CLEARANCE</span>
                </div>
                <h2 className="text-2xl font-black mt-1">AI for Educators — Google Meet Live Hall</h2>
                <p className="text-xs text-slate-400">
                  Attendee: <strong className="text-white">{accessResult.registration?.full_name}</strong> ({accessResult.registration?.school_institution}) | Code: <strong className="text-amber-300 font-mono">{accessResult.registration?.registration_code || accessResult.registration?.id}</strong>
                </p>
              </div>

              <button
                onClick={() => {
                  setIsInLiveStage(false);
                  setActiveTab('overview');
                }}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-bold rounded-xl text-slate-300 cursor-pointer"
              >
                Close Live Portal
              </button>
            </div>

            {/* Virtual Stage Google Meet Card */}
            <div className="w-full rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950 border border-slate-800 p-8 text-center space-y-6 relative overflow-hidden">
              <div className="w-20 h-20 rounded-3xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mx-auto">
                <Video className="w-10 h-10 animate-pulse" />
              </div>

              <div className="space-y-2 max-w-lg mx-auto">
                <span className="px-3 py-1 bg-emerald-400/20 text-emerald-300 rounded-full text-[10px] font-black uppercase">
                  Direct Administrator-Configured Room
                </span>
                <h3 className="text-2xl font-black text-white">Join the Live Interactive Bootcamp</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Your live Google Meet room is ready. Click the button below to join the call, or copy the direct link.
                </p>
                <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 font-mono text-xs text-amber-300 flex items-center justify-between gap-2">
                  <span className="truncate">{meetingConfig.meeting_url}</span>
                  <button
                    onClick={() => handleCopy(meetingConfig.meeting_url, 'Direct Meet Link')}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded text-[10px] font-bold shrink-0 cursor-pointer"
                  >
                    {copiedLabel === 'Direct Meet Link' ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-4">
                <a
                  href={meetingConfig.meeting_url}
                  target="_blank"
                  rel="noreferrer"
                  className="px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-2xl text-sm uppercase tracking-wider flex items-center space-x-2 shadow-lg shadow-emerald-500/25 transition-all transform hover:scale-105 cursor-pointer"
                >
                  <Video className="w-5 h-5" />
                  <span>Launch Google Meet Room Now</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>

              {meetingConfig.instructions && (
                <div className="max-w-md mx-auto p-4 bg-slate-950/60 rounded-xl border border-slate-800/80 text-left text-xs text-slate-300 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Instructions from Instructor:</span>
                  <p>{meetingConfig.instructions}</p>
                </div>
              )}
            </div>

            {/* Quick Session Downloads & Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Daily Time Schedule</span>
                <p className="text-xs font-bold text-white">{meetingConfig.daily_schedule_time}</p>
                <span className="text-[10px] text-slate-400">CAT (Central Africa Time)</span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Room Passcode</span>
                <p className="text-xs font-mono font-bold text-amber-400">{meetingConfig.passcode || 'None Required'}</p>
                <span className="text-[10px] text-slate-400">Direct admission for approved users</span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Bootcamp Resources</span>
                <p className="text-xs font-bold text-emerald-400">📘 50+ Educator Prompt Vault</p>
                <span className="text-[10px] text-slate-400">Included with your enrollment</span>
              </div>
              <div className="p-4 rounded-2xl bg-indigo-950/80 border border-indigo-500/40 space-y-2 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold text-indigo-300 uppercase">Payment & Receipt</span>
                  <p className="text-xs font-black text-emerald-400">Verified & Approved</p>
                  <span className="text-[10px] text-slate-400">Official Receipt Issued</span>
                </div>
                <button
                  onClick={handleDownloadCurrentReceipt}
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-1.5 transition-all shadow-xs cursor-pointer"
                >
                  <FileCheck className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Download Receipt (PDF)</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-8 bg-slate-950 text-white rounded-3xl border border-amber-500/30 shadow-2xl space-y-6 text-center max-w-2xl mx-auto">
            <div className="w-16 h-16 rounded-3xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 mx-auto">
              <Lock className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <span className="px-3 py-1 bg-amber-400/20 text-amber-300 rounded-full text-[10px] font-black uppercase">
                Access Restricted — Verification Required
              </span>
              <h3 className="text-2xl font-black text-white">Live Hall Restricted to Paid & Approved Educators</h3>
              <p className="text-xs text-slate-300 leading-relaxed max-w-lg mx-auto">
                {accessResult?.message || 'Access to the live Google Meet room and downloadable digital toolkits is strictly reserved for educators with verified registration fee payment ($10.00) and administrator approval.'}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              {accessResult?.registration ? (
                <>
                  {accessResult.registration.payment_status !== 'verified' && (
                    <button
                      onClick={() => {
                        setProofForm({
                          payment_method: accessResult.registration?.payment_method || 'EcoCash',
                          payment_reference: accessResult.registration?.payment_reference || '',
                          notes: accessResult.registration?.payment_notes || ''
                        });
                        setShowProofModal(true);
                      }}
                      className="px-6 py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider flex items-center space-x-2 transition-all cursor-pointer"
                    >
                      <UploadCloud className="w-4 h-4" />
                      <span>Submit Payment Proof</span>
                    </button>
                  )}
                  <button
                    onClick={() => verifyCurrentAccess()}
                    disabled={isCheckingAccess}
                    className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs flex items-center space-x-1.5 cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isCheckingAccess ? 'animate-spin' : ''}`} />
                    <span>Re-Check Status</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    setRegisteredResult(null);
                    setShowRegModal(true);
                  }}
                  className="px-8 py-3.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider shadow-lg flex items-center space-x-2 transition-all cursor-pointer"
                >
                  <span>Register & Secure Seat (US$10)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )
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

            {registeredResult ? (
              /* Success / Registration Code Display */
              <div className="space-y-5 text-center py-4">
                <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xl font-black text-slate-900">Registration Successfully Submitted!</h4>
                  <p className="text-xs text-slate-600">
                    Your unique registration code for Google Meet room access and receipt generation is:
                  </p>
                </div>

                <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-200 space-y-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Your Registration Code</span>
                  <div className="flex items-center justify-center space-x-2">
                    <span className="text-2xl font-black text-indigo-900 font-mono tracking-wider">
                      {registeredResult.registration_code || registeredResult.id}
                    </span>
                    <button
                      onClick={() => handleCopy(registeredResult.registration_code || registeredResult.id, 'Registration Code')}
                      className="p-2 bg-white rounded-xl border border-indigo-200 text-indigo-700 hover:bg-indigo-100 font-bold text-xs flex items-center space-x-1 cursor-pointer"
                    >
                      <Copy className="w-4 h-4" />
                      <span>{copiedLabel === 'Registration Code' ? 'Copied!' : 'Copy'}</span>
                    </button>
                  </div>
                </div>

                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-left text-xs text-amber-900 space-y-1">
                  <p className="font-bold flex items-center space-x-1">
                    <Info className="w-4 h-4 text-amber-600" />
                    <span>Next Steps for Google Meet Access & Receipt:</span>
                  </p>
                  <p className="text-[11px] text-amber-800">
                    1. Ensure payment of the US$10 registration fee has been processed.<br />
                    2. An administrator will verify and approve your proof of payment in the Admin Console.<br />
                    3. Once verified, return to this portal to download your official PDF receipt and join the live Google Meet call.
                  </p>
                </div>

                <button
                  onClick={() => setShowRegModal(false)}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl text-xs uppercase tracking-wider shadow-md cursor-pointer"
                >
                  Done & Return to Portal
                </button>
              </div>
            ) : (
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
                    className="w-4 h-4 text-indigo-600 rounded cursor-pointer"
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
            )}
          </div>
        </div>
      )}

      {/* USER SUBMIT / UPDATE PROOF OF PAYMENT MODAL */}
      {showProofModal && accessResult?.registration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 md:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-[10px] font-black uppercase tracking-wider">
                  Payment Verification
                </span>
                <h3 className="text-xl font-black text-slate-900 mt-1">Submit Proof of Payment</h3>
                <p className="text-xs text-slate-500">
                  Provide your transaction details for admin verification and receipt generation.
                </p>
              </div>
              <button 
                onClick={() => setShowProofModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Educator Summary Box */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-bold">Educator:</span>
                <span className="font-black text-slate-900">{accessResult.registration.full_name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-bold">Registration Code:</span>
                <span className="font-mono font-bold text-indigo-700">
                  {accessResult.registration.registration_code || accessResult.registration.id}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-bold">Fee Amount Due:</span>
                <span className="font-black text-emerald-600">US$10.00</span>
              </div>
            </div>

            <form onSubmit={handleSubmitProofOfPayment} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Payment Method *</label>
                <select
                  value={proofForm.payment_method}
                  onChange={e => setProofForm({ ...proofForm, payment_method: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                >
                  <option value="EcoCash">EcoCash</option>
                  <option value="InnBucks">InnBucks</option>
                  <option value="Bank Transfer / Swipe">Bank Transfer / Card Swipe</option>
                  <option value="Direct Admin Verified">Direct Cash / Admin Verified</option>
                  <option value="Other">Other / International Transfer</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">
                  Transaction Reference / EcoCash Txn ID / Confirmation Code *
                </label>
                <input
                  type="text"
                  required
                  value={proofForm.payment_reference}
                  onChange={e => setProofForm({ ...proofForm, payment_reference: e.target.value })}
                  placeholder="e.g. MP260831.9921.B0001 or IB-98124"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-xs font-bold text-indigo-900 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
                <p className="text-[10px] text-slate-400">
                  Enter the SMS confirmation reference or receipt code you received after paying.
                </p>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Notes / Payer Name (Optional)</label>
                <input
                  type="text"
                  value={proofForm.notes}
                  onChange={e => setProofForm({ ...proofForm, notes: e.target.value })}
                  placeholder="e.g. Paid from EcoCash number 0771234567"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900 text-[11px] space-y-1">
                <p className="font-bold flex items-center space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Automatic Receipt Generation</span>
                </p>
                <p className="text-[10px] text-emerald-800">
                  Once an administrator approves your reference in the Admin Console, your downloadable official receipt and Google Meet live link will be unlocked immediately!
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowProofModal(false)}
                  className="px-4 py-2 text-slate-600 font-bold hover:text-slate-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingProof}
                  className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl shadow-md flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmittingProof ? 'Submitting...' : 'Submit Proof of Payment'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QUICK RECEIPT LOOKUP MODAL (BY USER FULL NAME & REFERENCE NUMBER) */}
      {showReceiptLookupModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 md:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-[10px] font-black uppercase tracking-wider">
                  Receipt Retrieval
                </span>
                <h3 className="text-xl font-black text-slate-900 mt-1">Download Payment Receipt</h3>
                <p className="text-xs text-slate-500">
                  Enter your full name and payment reference / registration code to render your receipt.
                </p>
              </div>
              <button 
                onClick={() => setShowReceiptLookupModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {receiptLookupError && (
              <div className="p-3 bg-red-50 rounded-xl border border-red-200 text-red-900 text-xs font-bold flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{receiptLookupError}</span>
              </div>
            )}

            <form onSubmit={handleLookupReceiptSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Full Name *</label>
                <input
                  type="text"
                  required
                  value={receiptLookupName}
                  onChange={e => setReceiptLookupName(e.target.value)}
                  placeholder="e.g. Tendai Mupfumi"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Payment Reference / Registration Code *</label>
                <input
                  type="text"
                  required
                  value={receiptLookupRef}
                  onChange={e => setReceiptLookupRef(e.target.value)}
                  placeholder="e.g. MP260831.9921 or YARA-AI-..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-xs font-bold text-indigo-900 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
                <p className="text-[10px] text-slate-400">
                  Enter your EcoCash reference, Innbucks code, or YARA registration code.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowReceiptLookupModal(false)}
                  className="px-4 py-2 text-slate-600 font-bold hover:text-slate-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLookingUpReceipt}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl shadow-md flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
                >
                  <FileCheck className="w-4 h-4" />
                  <span>{isLookingUpReceipt ? 'Generating Receipt...' : 'Generate & Download Receipt'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* OFFICIAL PRINTABLE & DOWNLOADABLE RECEIPT MODAL */}
      <EducatorReceiptModal
        isOpen={showReceiptModal}
        onClose={() => {
          setShowReceiptModal(false);
          setReceiptData(null);
        }}
        receipt={receiptData}
      />

      {/* OFFICIAL PRINTABLE & DOWNLOADABLE CERTIFICATE MODAL */}
      <EducatorCertificateModal
        isOpen={showCertificateModal}
        onClose={() => {
          setShowCertificateModal(false);
          setCertificateData(null);
        }}
        certificateData={certificateData}
      />
    </div>
  );
}
