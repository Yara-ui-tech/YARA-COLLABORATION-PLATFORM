import React, { useState, useEffect } from 'react';
import { 
  Users, CheckCircle2, XCircle, Clock, DollarSign, Search, 
  Filter, ShieldCheck, AlertCircle, RefreshCw, Plus, UserPlus, 
  ExternalLink, Mail, Phone, School, Award, Sparkles, Check, 
  Trash2, Eye, ShieldAlert, ArrowUpRight, Video, Copy, Link, 
  Edit3, Save, Key, Calendar, Share2, FileText, Download, Printer,
  Lock, Unlock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  EventRegistration, 
  EventPaymentStatus, 
  EventApprovalStatus, 
  EventMeetingConfig,
  EducatorReceiptData,
  EducatorCertificateData
} from '../../types/eventRegistration';
import { 
  getEventRegistrations, 
  updateRegistrationStatus, 
  registerForEvent, 
  deleteEventRegistration,
  checkEventAccess,
  getEventMeetingConfig,
  fetchEventMeetingConfig,
  updateEventMeetingConfig,
  subscribeToEventMeetingConfig,
  buildEducatorReceipt,
  generateEducatorReceiptByNameAndRef,
  buildEducatorCertificate,
  unlockEducatorCertificate,
  batchUnlockEducatorCertificates,
  AI_FOR_EDUCATORS_EVENT
} from '../../services/eventRegistrationService';
import EducatorReceiptModal from '../events/EducatorReceiptModal';
import EducatorCertificateModal from '../events/EducatorCertificateModal';
import CertificateSettingsModal from './CertificateSettingsModal';
import IndividualCertificateEditModal from './IndividualCertificateEditModal';

export default function EventRegistrationsAdminTab() {
  const [registrations, setRegistrations] = useState<EventRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [eventFilter, setEventFilter] = useState<string>(AI_FOR_EDUCATORS_EVENT.id);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected' | 'unpaid' | 'verified'>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Meeting Management State
  const [meetingConfig, setMeetingConfig] = useState<EventMeetingConfig>(() => getEventMeetingConfig(AI_FOR_EDUCATORS_EVENT.id));
  const [isEditingMeeting, setIsEditingMeeting] = useState(false);
  const [meetingForm, setMeetingForm] = useState<EventMeetingConfig>(() => getEventMeetingConfig(AI_FOR_EDUCATORS_EVENT.id));
  const [isSavingMeeting, setIsSavingMeeting] = useState(false);

  // Certificate Modal & Batch State
  const [selectedCertificate, setSelectedCertificate] = useState<EducatorCertificateData | null>(null);
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [showCertificateSettingsModal, setShowCertificateSettingsModal] = useState(false);
  const [editingIndividualRegistration, setEditingIndividualRegistration] = useState<EventRegistration | null>(null);
  const [isBatchUnlocking, setIsBatchUnlocking] = useState(false);

  // Manual Add Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    school_institution: '',
    role_title: 'Educator / Teacher',
    teaching_level: 'secondary' as const,
    years_experience: '3-5 years',
    country: 'Zimbabwe',
    city_province: 'Harare',
    continuous_support_opt_in: true,
    payment_status: 'verified' as EventPaymentStatus,
    approval_status: 'approved' as EventApprovalStatus,
    admin_notes: 'Manual administrator enrollment'
  });

  // Receipt Generation & View State
  const [selectedReceipt, setSelectedReceipt] = useState<EducatorReceiptData | null>(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [showGenerateReceiptModal, setShowGenerateReceiptModal] = useState(false);
  const [generateReceiptForm, setGenerateReceiptForm] = useState({
    user_name: '',
    ref_number: '',
    email: '',
    school_institution: '',
    amount_paid: 10,
    continuous_support_opt_in: false,
    payment_method: 'EcoCash'
  });
  const [isGeneratingReceipt, setIsGeneratingReceipt] = useState(false);

  const loadData = async () => {
    setIsRefreshing(true);
    try {
      const data = await getEventRegistrations(eventFilter || undefined);
      setRegistrations(data);
      const mCfg = await fetchEventMeetingConfig(eventFilter || AI_FOR_EDUCATORS_EVENT.id);
      setMeetingConfig(mCfg);
      if (!isEditingMeeting) {
        setMeetingForm(mCfg);
      }
    } catch (err: any) {
      console.error('Error loading event registrations:', err);
    } finally {
      setIsRefreshing(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    // Subscribe to live meeting link changes
    const unsubscribe = subscribeToEventMeetingConfig(eventFilter || AI_FOR_EDUCATORS_EVENT.id, (updatedCfg) => {
      setMeetingConfig(updatedCfg);
      if (!isEditingMeeting) {
        setMeetingForm(updatedCfg);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [eventFilter]);

  const showNotice = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    showNotice('success', `Copied ${label} to clipboard!`);
    setTimeout(() => setCopiedText(null), 2500);
  };

  const handleSaveMeetingConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingMeeting(true);
    try {
      const targetEventId = eventFilter || AI_FOR_EDUCATORS_EVENT.id;
      const updated = await updateEventMeetingConfig(
        targetEventId,
        meetingForm,
        'YARA Admin Console'
      );
      setMeetingConfig(updated);
      setMeetingForm(updated);
      setIsEditingMeeting(false);
      showNotice('success', `Google Meet link successfully updated and synchronized for all users! Link: ${updated.meeting_url}`);
    } catch (err: any) {
      showNotice('error', err.message || 'Failed to update meeting details.');
    } finally {
      setIsSavingMeeting(false);
    }
  };

  const handleGenerateGoogleMeetLink = () => {
    const randomMeetCode = 'yara-' + Math.random().toString(36).substring(2, 6) + '-' + Math.random().toString(36).substring(2, 6);
    setMeetingForm(prev => ({
      ...prev,
      platform: 'google_meet',
      meeting_url: `https://meet.google.com/${randomMeetCode}`,
      meeting_code: randomMeetCode
    }));
  };

  const handleUpdateStatus = async (
    regId: string, 
    payment_status?: EventPaymentStatus, 
    approval_status?: EventApprovalStatus,
    notes?: string
  ) => {
    setActionLoadingId(regId);
    try {
      const updated = await updateRegistrationStatus(regId, {
        payment_status,
        approval_status,
        admin_notes: notes
      });

      if (updated) {
        setRegistrations(prev => prev.map(r => r.id === regId ? updated : r));
        showNotice('success', `Updated registration for ${updated.full_name}. Access status: ${updated.payment_status === 'verified' && updated.approval_status === 'approved' ? 'GRANTED' : 'RESTRICTED'}`);
      } else {
        showNotice('error', 'Failed to update registration status.');
      }
    } catch (err: any) {
      showNotice('error', err.message || 'Error occurred updating registration.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleQuickApproveBoth = async (reg: EventRegistration) => {
    await handleUpdateStatus(
      reg.id, 
      'verified', 
      'approved', 
      'Verified payment ($10) & approved for live bootcamp access by Administrator in Admin Console.'
    );
  };

  const handleDelete = async (regId: string, name: string) => {
    if (!confirm(`Are you sure you want to remove the registration for "${name}"? This cannot be undone.`)) {
      return;
    }
    setActionLoadingId(regId);
    try {
      const ok = await deleteEventRegistration(regId);
      if (ok) {
        setRegistrations(prev => prev.filter(r => r.id !== regId));
        showNotice('success', `Registration for ${name} has been removed.`);
      }
    } catch (err: any) {
      showNotice('error', err.message || 'Failed to delete registration.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleManualAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoadingId('manual-add');
    try {
      const res = await registerForEvent({
        event_id: AI_FOR_EDUCATORS_EVENT.id,
        event_title: AI_FOR_EDUCATORS_EVENT.title,
        full_name: addForm.full_name.trim(),
        email: addForm.email.trim(),
        phone: addForm.phone.trim(),
        school_institution: addForm.school_institution.trim() || 'Independent Educator',
        role_title: addForm.role_title.trim(),
        province: addForm.city_province || 'Harare',
        continuous_support_opt_in: addForm.continuous_support_opt_in
      });

      if (res && res.id) {
        if (addForm.payment_status !== 'pending' || addForm.approval_status !== 'pending') {
          await updateRegistrationStatus(res.id, {
            payment_status: addForm.payment_status,
            approval_status: addForm.approval_status,
            admin_notes: addForm.admin_notes
          });
        }

        showNotice('success', `Manually registered ${addForm.full_name}! Code: ${res.registration_code || res.id}`);
        setShowAddModal(false);
        setAddForm({
          full_name: '',
          email: '',
          phone: '',
          school_institution: '',
          role_title: 'Educator / Teacher',
          teaching_level: 'secondary',
          years_experience: '3-5 years',
          country: 'Zimbabwe',
          city_province: 'Harare',
          continuous_support_opt_in: true,
          payment_status: 'verified',
          approval_status: 'approved',
          admin_notes: 'Manual administrator enrollment'
        });
        loadData();
      } else {
        showNotice('error', 'Failed to save registration');
      }
    } catch (err: any) {
      showNotice('error', err.message || 'Failed to add registration');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Filter registrations
  const filtered = registrations.filter(r => {
    const codeStr = r.registration_code || '';
    const matchesSearch = 
      r.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.school_institution.toLowerCase().includes(searchTerm.toLowerCase()) ||
      codeStr.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.phone && r.phone.includes(searchTerm));

    if (!matchesSearch) return false;

    if (statusFilter === 'pending') return r.approval_status === 'pending';
    if (statusFilter === 'approved') return r.approval_status === 'approved';
    if (statusFilter === 'rejected') return r.approval_status === 'rejected';
    if (statusFilter === 'unpaid') return r.payment_status === 'pending' || r.payment_status === 'rejected';
    if (statusFilter === 'verified') return r.payment_status === 'verified';

    return true;
  });

  // Open receipt for specific table registration
  const handleOpenReceiptForRegistration = (reg: EventRegistration) => {
    const receipt = buildEducatorReceipt(reg);
    setSelectedReceipt(receipt);
    setShowReceiptModal(true);
  };

  // Submit admin generator by user name and ref number
  const handleAdminGenerateReceiptSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!generateReceiptForm.user_name.trim() || !generateReceiptForm.ref_number.trim()) {
      showNotice('error', 'Please provide both the Educator Full Name and Reference Number.');
      return;
    }
    setIsGeneratingReceipt(true);
    try {
      const receipt = await generateEducatorReceiptByNameAndRef(
        generateReceiptForm.user_name.trim(),
        generateReceiptForm.ref_number.trim(),
        {
          email: generateReceiptForm.email.trim() || undefined,
          school_institution: generateReceiptForm.school_institution.trim() || undefined,
          amount_paid: Number(generateReceiptForm.amount_paid) || 10,
          continuous_support_opt_in: generateReceiptForm.continuous_support_opt_in,
          payment_method: generateReceiptForm.payment_method
        }
      );
      setSelectedReceipt(receipt);
      setShowGenerateReceiptModal(false);
      setShowReceiptModal(true);
      showNotice('success', `Official receipt generated for ${receipt.attendee_name}!`);
    } catch (err: any) {
      showNotice('error', err.message || 'Failed to generate receipt.');
    } finally {
      setIsGeneratingReceipt(false);
    }
  };

  // Auto-fill generator form when typing existing name or selecting
  const handleSelectRegisteredUserForReceipt = (reg: EventRegistration) => {
    setGenerateReceiptForm({
      user_name: reg.full_name,
      ref_number: reg.payment_reference || reg.registration_code || reg.id,
      email: reg.email,
      school_institution: reg.school_institution,
      amount_paid: reg.registration_fee || 10,
      continuous_support_opt_in: Boolean(reg.continuous_support_opt_in),
      payment_method: reg.payment_method ? reg.payment_method.toUpperCase().replace('_', ' ') : 'EcoCash'
    });
  };

  // Certificate Actions
  const handleOpenCertificate = (reg: EventRegistration) => {
    const cert = buildEducatorCertificate(reg);
    setSelectedCertificate(cert);
    setShowCertificateModal(true);
  };

  const handleToggleCertificateUnlock = async (reg: EventRegistration) => {
    const newUnlockedState = !reg.certificate_unlocked;
    setActionLoadingId(reg.id);
    try {
      const updated = await unlockEducatorCertificate(reg.id, newUnlockedState, 'YARA Administrator');
      if (updated) {
        setRegistrations(prev => prev.map(r => r.id === reg.id ? updated : r));
        showNotice(
          'success', 
          newUnlockedState 
            ? `Certificate unlocked for ${reg.full_name}! User can now download/print.` 
            : `Certificate download locked for ${reg.full_name}.`
        );
      }
    } catch (err: any) {
      showNotice('error', err.message || 'Failed to update certificate status.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleBatchUnlockApproved = async () => {
    const eligibleRegistrations = registrations.filter(
      r => r.payment_status === 'verified' && r.approval_status === 'approved' && !r.certificate_unlocked
    );
    
    if (eligibleRegistrations.length === 0) {
      showNotice('error', 'No pending approved registrations found to unlock.');
      return;
    }

    if (!window.confirm(`Unlock official certificates for ${eligibleRegistrations.length} approved educators? They will immediately be able to download their certified diplomas.`)) {
      return;
    }

    setIsBatchUnlocking(true);
    try {
      const ids = eligibleRegistrations.map(r => r.id);
      const count = await batchUnlockEducatorCertificates(ids, 'YARA Executive Board');
      await loadData();
      showNotice('success', `Successfully unlocked ${count} educator certificates!`);
    } catch (err: any) {
      showNotice('error', err.message || 'Batch unlock failed.');
    } finally {
      setIsBatchUnlocking(false);
    }
  };

  // Calculate metrics
  const totalCount = registrations.length;
  const verifiedPaymentsCount = registrations.filter(r => r.payment_status === 'verified').length;
  const totalRevenueCollected = verifiedPaymentsCount * 10;
  const pendingApprovalsCount = registrations.filter(r => r.approval_status === 'pending').length;
  const fullAccessGrantedCount = registrations.filter(r => r.payment_status === 'verified' && r.approval_status === 'approved').length;
  const unlockedCertificatesCount = registrations.filter(r => r.certificate_unlocked).length;
  const continuousSupportCount = registrations.filter(r => r.continuous_support_opt_in).length;

  return (
    <div className="space-y-6">
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

      {/* Top Header Card */}
      <div className="p-6 md:p-8 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl text-white border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 bg-amber-400/20 text-amber-300 border border-amber-400/30 rounded-full text-[11px] font-black uppercase tracking-wider">
                🔒 Protected Admin Console
              </span>
              <span className="px-3 py-1 bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 rounded-full text-[11px] font-black uppercase tracking-wider">
                Google Meet Approval Portal
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Event Registration & Google Meet Access Portal
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Manage participant approval decisions, verify US$10 payments, provide registration codes, and configure the Google Meet room link. Participants can only enter the live Google Meet call after approval.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowCertificateSettingsModal(true)}
              className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-xl text-xs flex items-center space-x-2 shadow-md transition-all cursor-pointer"
              title="Edit certificate template, upload signatures (A.M. Chiambiro & S.O. Manongwa), upload seal & logo, and customize certificate copy"
            >
              <Award className="w-4 h-4 text-slate-950" />
              <span>Certificate Studio & Signatures</span>
            </button>
            <button
              onClick={() => setShowGenerateReceiptModal(true)}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-xl text-xs flex items-center space-x-2 shadow-md transition-all cursor-pointer"
              title="Generate a downloadable payment receipt by providing educator name & reference number"
            >
              <FileText className="w-4 h-4" />
              <span>Generate Receipt (Name & Ref)</span>
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-xl text-xs flex items-center space-x-2 shadow-md transition-all cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Enroll Participant Manually</span>
            </button>
            <button
              onClick={loadData}
              disabled={isRefreshing}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-xs flex items-center space-x-2 border border-white/20 transition-all cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Google Meet & Live Room Configuration Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <Video className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-black text-slate-900">Google Meet Live Room Configuration</h3>
                <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-black uppercase">
                  Active Meeting Destination
                </span>
              </div>
              <p className="text-xs text-slate-500">
                This meeting link is served to approved participants through the registration code portal.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isEditingMeeting ? (
              <>
                <button
                  onClick={() => handleCopy(meetingConfig.meeting_url, 'Meeting Link')}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center space-x-1.5 transition-all cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedText === 'Meeting Link' ? 'Copied!' : 'Copy Link'}</span>
                </button>
                <button
                  onClick={() => setIsEditingMeeting(true)}
                  className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center space-x-1.5 shadow-sm transition-all cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Configure Link & Times</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  setMeetingForm(meetingConfig);
                  setIsEditingMeeting(false);
                }}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl text-xs cursor-pointer"
              >
                Cancel
              </button>
            )}
          </div>
        </div>

        {!isEditingMeeting ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Live Meeting URL</span>
              <div className="flex items-center justify-between gap-2">
                <a 
                  href={meetingConfig.meeting_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs font-black text-indigo-600 hover:underline truncate"
                >
                  {meetingConfig.meeting_url}
                </a>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              </div>
              <p className="text-[10px] text-slate-500">Platform: <strong className="uppercase">{meetingConfig.platform.replace('_', ' ')}</strong></p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Schedule & Passcode</span>
              <p className="text-xs font-black text-slate-800">{meetingConfig.daily_schedule_time}</p>
              <p className="text-[10px] text-slate-500">
                Passcode: <span className="font-mono font-bold bg-white px-1.5 py-0.5 rounded border border-slate-200 text-indigo-700">{meetingConfig.passcode || 'None'}</span>
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Attendee Instructions</span>
              <p className="text-xs text-slate-600 line-clamp-2">{meetingConfig.instructions}</p>
              <p className="text-[9px] text-slate-400">Last updated by {meetingConfig.updated_by_name || 'Admin'}</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSaveMeetingConfig} className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
              <div className="space-y-1 sm:col-span-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-700">Google Meet / Live Meeting URL *</label>
                  <button
                    type="button"
                    onClick={handleGenerateGoogleMeetLink}
                    className="text-[11px] text-indigo-600 font-bold hover:underline flex items-center space-x-1"
                  >
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    <span>Generate Instant Meet Link</span>
                  </button>
                </div>
                <input
                  type="url"
                  required
                  value={meetingForm.meeting_url}
                  onChange={e => setMeetingForm({ ...meetingForm, meeting_url: e.target.value })}
                  placeholder="https://meet.google.com/xxx-yyyy-zzz"
                  className="w-full px-3.5 py-2.5 bg-white rounded-xl border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Platform</label>
                <select
                  value={meetingForm.platform}
                  onChange={e => setMeetingForm({ ...meetingForm, platform: e.target.value as any })}
                  className="w-full px-3 py-2.5 bg-white rounded-xl border border-slate-300 font-bold text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                >
                  <option value="google_meet">Google Meet (Recommended)</option>
                  <option value="zoom">Zoom</option>
                  <option value="teams">Microsoft Teams</option>
                  <option value="custom">Custom WebRTC / Other</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Meeting Room Code (Optional)</label>
                <input
                  type="text"
                  value={meetingForm.meeting_code || ''}
                  onChange={e => setMeetingForm({ ...meetingForm, meeting_code: e.target.value })}
                  placeholder="e.g. yara-ai-educators"
                  className="w-full px-3.5 py-2.5 bg-white rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Meeting Passcode</label>
                <input
                  type="text"
                  value={meetingForm.passcode || ''}
                  onChange={e => setMeetingForm({ ...meetingForm, passcode: e.target.value })}
                  placeholder="e.g. YARA2026"
                  className="w-full px-3.5 py-2.5 bg-white rounded-xl border border-slate-300 text-xs font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Daily Session Schedule</label>
                <input
                  type="text"
                  value={meetingForm.daily_schedule_time}
                  onChange={e => setMeetingForm({ ...meetingForm, daily_schedule_time: e.target.value })}
                  placeholder="17:00 – 19:30 CAT (Daily: 31 Aug – 4 Sep 2026)"
                  className="w-full px-3.5 py-2.5 bg-white rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div className="space-y-1 sm:col-span-2 lg:col-span-3">
                <label className="font-bold text-slate-700">Attendee Entry Instructions</label>
                <textarea
                  rows={2}
                  value={meetingForm.instructions}
                  onChange={e => setMeetingForm({ ...meetingForm, instructions: e.target.value })}
                  placeholder="Instructions for participants before entering the Google Meet room..."
                  className="w-full px-3.5 py-2 bg-white rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsEditingMeeting(false)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-bold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSavingMeeting}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-xs flex items-center space-x-1.5 shadow-md cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{isSavingMeeting ? 'Saving...' : 'Save & Publish Meet Link'}</span>
              </button>
            </div>
          </form>
        )}
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Enrolled</span>
            <Users className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">{totalCount}</p>
          <span className="text-[10px] text-slate-400 font-medium">Educators registered</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-emerald-600">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Payments Verified</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-emerald-600">${totalRevenueCollected}</p>
          <span className="text-[10px] text-emerald-600 font-bold">{verifiedPaymentsCount} / {totalCount} verified ($10 fee)</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-amber-500">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Pending Review</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-amber-600">{pendingApprovalsCount}</p>
          <span className="text-[10px] text-amber-600 font-bold">Awaiting Admin Decision</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-indigo-600">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Active Live Access</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-indigo-600">{fullAccessGrantedCount}</p>
          <span className="text-[10px] text-indigo-600 font-bold">Paid & Approved (Google Meet)</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-amber-600">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Certificates Unlocked</span>
            <Award className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-amber-600">{unlockedCertificatesCount}</p>
          <span className="text-[10px] text-amber-600 font-bold">{unlockedCertificatesCount} / {totalCount} downloadable</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-purple-600">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Support Subscribers</span>
            <Sparkles className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl font-black text-purple-600">{continuousSupportCount}</p>
          <span className="text-[10px] text-purple-600 font-medium">$15/term support opt-ins</span>
        </div>
      </div>

      {/* Filter and Search Bar with Batch Certificate Unlock */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search educator name, registration code (e.g. YARA-AI-...), email, or school..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            disabled={isBatchUnlocking}
            onClick={handleBatchUnlockApproved}
            className="px-3.5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black rounded-xl text-xs flex items-center space-x-1.5 shadow-xs transition-all cursor-pointer disabled:opacity-50"
            title="Batch unlock certificates for all approved attendees"
          >
            <Award className="w-3.5 h-3.5 text-slate-950" />
            <span>{isBatchUnlocking ? 'Unlocking...' : 'Batch Unlock Certificates'}</span>
          </button>

          <select
            value={eventFilter}
            onChange={e => setEventFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-hidden"
          >
            <option value="ai_educators_bootcamp_2026">AI for Educators – Online Bootcamp</option>
            <option value="">All Events</option>
          </select>

          <div className="flex items-center bg-slate-100 p-1 rounded-xl gap-1 text-[11px] font-bold">
            {(['all', 'pending', 'approved', 'verified', 'unpaid', 'rejected'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={`px-3 py-1.5 rounded-lg capitalize transition-all cursor-pointer ${
                  statusFilter === tab ? 'bg-white text-indigo-600 shadow-xs font-black' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Registrations Table / List */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-600" />
            Loading registered educators...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs space-y-2">
            <Users className="w-8 h-8 mx-auto text-slate-300" />
            <p className="font-bold text-slate-600">No event registrations found.</p>
            <p>Try adjusting your search query or status filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3.5 px-4">Registration Code</th>
                  <th className="py-3.5 px-4">Educator / Institution</th>
                  <th className="py-3.5 px-4">Fee Status ($10)</th>
                  <th className="py-3.5 px-4">Admin Approval</th>
                  <th className="py-3.5 px-4">Live Room Access</th>
                  <th className="py-3.5 px-4">Certificate (Diploma)</th>
                  <th className="py-3.5 px-4 text-right">Approval Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(reg => {
                  const isAccessGranted = reg.payment_status === 'verified' && reg.approval_status === 'approved';
                  const isProcessing = actionLoadingId === reg.id;
                  const code = reg.registration_code || reg.id;
                  const isCertUnlocked = Boolean(reg.certificate_unlocked);

                  const inviteText = `Hi ${reg.full_name},\nYour registration for the YARA AI for Educators Online Bootcamp is confirmed!\n\nRegistration Code: ${code}\nPortal: https://yara.org/events/ai-for-educators-bootcamp\nGoogle Meet: ${meetingConfig.meeting_url}\nPasscode: ${meetingConfig.passcode || 'YARA2026'}\nTime: ${meetingConfig.daily_schedule_time}`;

                  return (
                    <tr key={reg.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Registration Code */}
                      <td className="py-4 px-4 align-top">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-1.5">
                            <span className="px-2.5 py-1 bg-indigo-50 border border-indigo-200 text-indigo-900 rounded-lg font-mono font-black text-xs tracking-wider">
                              {code}
                            </span>
                            <button
                              onClick={() => handleCopy(code, 'Registration Code')}
                              title="Copy code to share with educator"
                              className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-all cursor-pointer"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <button
                            onClick={() => handleCopy(inviteText, 'Educator Invitation')}
                            className="text-[10px] text-slate-500 hover:text-indigo-600 flex items-center space-x-1 font-medium cursor-pointer"
                          >
                            <Share2 className="w-2.5 h-2.5" />
                            <span>Copy Invite</span>
                          </button>
                        </div>
                      </td>

                      {/* Name & Contact */}
                      <td className="py-4 px-4 align-top">
                        <div className="space-y-0.5">
                          <div className="flex items-center space-x-2">
                            <span className="font-black text-slate-900 text-sm">{reg.full_name}</span>
                            {reg.continuous_support_opt_in && (
                              <span className="px-2 py-0.5 bg-purple-100 text-purple-800 rounded-md text-[9px] font-bold" title="Opted in for $15/term continuous support">
                                +Support
                              </span>
                            )}
                          </div>
                          <div className="flex items-center space-x-3 text-slate-500 text-[11px]">
                            <span className="flex items-center space-x-1">
                              <Mail className="w-3 h-3" />
                              <span>{reg.email}</span>
                            </span>
                            {reg.phone && (
                              <span className="flex items-center space-x-1">
                                <Phone className="w-3 h-3" />
                                <span>{reg.phone}</span>
                              </span>
                            )}
                          </div>
                          <div className="flex items-center space-x-1 text-slate-600 text-[11px] font-medium">
                            <School className="w-3 h-3 text-indigo-500" />
                            <span>{reg.school_institution} ({reg.province || 'Zimbabwe'})</span>
                          </div>
                        </div>
                      </td>

                      {/* Payment Status */}
                      <td className="py-4 px-4 align-top">
                        <div className="space-y-1.5">
                          {reg.payment_status === 'verified' && (
                            <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-full text-[10px] font-black flex items-center space-x-1 w-fit">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>Verified ($10 Paid)</span>
                            </span>
                          )}
                          {reg.payment_status === 'submitted' && (
                            <span className="px-2.5 py-1 bg-amber-100 text-amber-800 border border-amber-300 rounded-full text-[10px] font-black flex items-center space-x-1 w-fit">
                              <Clock className="w-3 h-3 text-amber-600" />
                              <span>Payment Submitted</span>
                            </span>
                          )}
                          {reg.payment_status === 'pending' && (
                            <span className="px-2.5 py-1 bg-rose-100 text-rose-800 border border-rose-300 rounded-full text-[10px] font-black flex items-center space-x-1 w-fit">
                              <XCircle className="w-3 h-3 text-rose-600" />
                              <span>Unpaid ($10 Due)</span>
                            </span>
                          )}
                          {reg.payment_status === 'rejected' && (
                            <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-full text-[10px] font-bold">
                              Rejected
                            </span>
                          )}

                          {/* Quick Payment Status buttons */}
                          <div className="flex items-center gap-1">
                            {reg.payment_status !== 'verified' ? (
                              <button
                                disabled={isProcessing}
                                onClick={() => handleUpdateStatus(reg.id, 'verified')}
                                className="px-2 py-0.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-bold transition-all cursor-pointer"
                              >
                                Mark Paid ($10)
                              </button>
                            ) : (
                              <button
                                disabled={isProcessing}
                                onClick={() => handleUpdateStatus(reg.id, 'pending')}
                                className="text-[10px] text-slate-500 hover:text-slate-800 underline cursor-pointer"
                              >
                                Reset Unpaid
                              </button>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Approval Status */}
                      <td className="py-4 px-4 align-top">
                        <div className="space-y-1.5">
                          {reg.approval_status === 'approved' && (
                            <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-full text-[10px] font-black flex items-center space-x-1 w-fit">
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span>Approved</span>
                            </span>
                          )}
                          {reg.approval_status === 'pending' && (
                            <span className="px-2.5 py-1 bg-amber-100 text-amber-800 border border-amber-300 rounded-full text-[10px] font-black flex items-center space-x-1 w-fit">
                              <Clock className="w-3 h-3 text-amber-600" />
                              <span>Pending Admin Decision</span>
                            </span>
                          )}
                          {reg.approval_status === 'rejected' && (
                            <span className="px-2.5 py-1 bg-rose-100 text-rose-800 border border-rose-300 rounded-full text-[10px] font-black flex items-center space-x-1 w-fit">
                              <XCircle className="w-3 h-3 text-rose-600" />
                              <span>Rejected</span>
                            </span>
                          )}

                          <div className="flex items-center gap-1">
                            {reg.approval_status !== 'approved' && (
                              <button
                                disabled={isProcessing}
                                onClick={() => handleUpdateStatus(reg.id, undefined, 'approved')}
                                className="px-2 py-0.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-[10px] font-bold transition-all cursor-pointer"
                              >
                                Approve
                              </button>
                            )}
                            {reg.approval_status !== 'rejected' && (
                              <button
                                disabled={isProcessing}
                                onClick={() => handleUpdateStatus(reg.id, undefined, 'rejected')}
                                className="px-2 py-0.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded text-[10px] font-bold transition-all cursor-pointer"
                              >
                                Reject
                              </button>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Live Portal Access Result */}
                      <td className="py-4 px-4 align-top">
                        {isAccessGranted ? (
                          <div className="space-y-1">
                            <span className="px-2.5 py-1 bg-emerald-600 text-white rounded-xl text-[10px] font-black flex items-center space-x-1.5 shadow-xs w-fit">
                              <ShieldCheck className="w-3.5 h-3.5" />
                              <span>ACCESS GRANTED</span>
                            </span>
                            <p className="text-[10px] text-emerald-700 font-bold">
                              Google Meet unlocked
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <span className="px-2.5 py-1 bg-slate-100 text-slate-600 border border-slate-200 rounded-xl text-[10px] font-bold flex items-center space-x-1.5 w-fit">
                              <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
                              <span>RESTRICTED</span>
                            </span>
                            <p className="text-[9px] text-slate-500">
                              {reg.payment_status !== 'verified' && reg.approval_status !== 'approved'
                                ? 'Unpaid & Not Approved'
                                : reg.payment_status !== 'verified'
                                ? 'Awaiting Payment ($10)'
                                : 'Awaiting Admin Approval'}
                            </p>
                          </div>
                        )}
                      </td>

                      {/* Certificate Status & Unlock Toggle */}
                      <td className="py-4 px-4 align-top">
                        <div className="space-y-2">
                          {isCertUnlocked ? (
                            <span className="px-2.5 py-1 bg-amber-50 border border-amber-300 text-amber-900 rounded-full text-[10px] font-black flex items-center space-x-1 w-fit">
                              <Award className="w-3 h-3 text-amber-600" />
                              <span>Unlocked / Downloadable</span>
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 bg-slate-100 text-slate-600 border border-slate-200 rounded-full text-[10px] font-bold flex items-center space-x-1 w-fit">
                              <Lock className="w-3 h-3 text-slate-400" />
                              <span>Locked / In Progress</span>
                            </span>
                          )}

                          <div className="flex items-center gap-1.5">
                            <button
                              disabled={isProcessing}
                              onClick={() => handleToggleCertificateUnlock(reg)}
                              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all flex items-center space-x-1 cursor-pointer ${
                                isCertUnlocked
                                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                                  : 'bg-amber-500 hover:bg-amber-600 text-slate-950 font-black shadow-xs'
                              }`}
                            >
                              {isCertUnlocked ? <Lock className="w-3 h-3 text-slate-500" /> : <Unlock className="w-3 h-3 text-slate-950" />}
                              <span>{isCertUnlocked ? 'Lock Cert' : 'Unlock Certificate'}</span>
                            </button>

                            <button
                              onClick={() => handleOpenCertificate(reg)}
                              title="Preview certificate modal"
                              className="p-1 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded-lg text-[10px] font-bold transition-all cursor-pointer"
                            >
                              <Award className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => setEditingIndividualRegistration(reg)}
                              title="Edit attendee certificate attributes (name, honors, school, cert #, unlock state)"
                              className="p-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-[10px] font-bold transition-all cursor-pointer"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </td>

                      {/* Combined Action Buttons */}
                      <td className="py-4 px-4 text-right align-top">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenReceiptForRegistration(reg)}
                            title="Generate / View Official Downloadable Receipt"
                            className="px-2.5 py-1.5 bg-slate-100 hover:bg-indigo-50 text-indigo-700 hover:text-indigo-900 border border-slate-200 hover:border-indigo-300 rounded-xl font-bold text-[11px] flex items-center space-x-1 transition-all cursor-pointer"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>Receipt</span>
                          </button>

                          {!isAccessGranted && (
                            <button
                              disabled={isProcessing}
                              onClick={() => handleQuickApproveBoth(reg)}
                              title="Verify payment and approve access simultaneously in admin console"
                              className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black text-[11px] shadow-xs flex items-center space-x-1 transition-all cursor-pointer"
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              <span>1-Click Approve</span>
                            </button>
                          )}
                          <button
                            disabled={isProcessing}
                            onClick={() => handleDelete(reg.id, reg.full_name)}
                            title="Remove Registration"
                            className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-all cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Manual Registration Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-xl w-full p-6 md:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-[10px] font-black uppercase">
                  Admin Manual Enrollment
                </span>
                <h3 className="text-xl font-black text-slate-900 mt-1">Enroll Educator into Bootcamp</h3>
              </div>
              <button 
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleManualAddSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={addForm.full_name}
                    onChange={e => setAddForm({ ...addForm, full_name: e.target.value })}
                    placeholder="e.g. Dr. Tendai Moyo"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={addForm.email}
                    onChange={e => setAddForm({ ...addForm, email: e.target.value })}
                    placeholder="e.g. tendai.moyo@school.ac.zw"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Phone / WhatsApp</label>
                  <input
                    type="tel"
                    value={addForm.phone}
                    onChange={e => setAddForm({ ...addForm, phone: e.target.value })}
                    placeholder="e.g. +263 77 123 4567"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">School or Institution</label>
                  <input
                    type="text"
                    value={addForm.school_institution}
                    onChange={e => setAddForm({ ...addForm, school_institution: e.target.value })}
                    placeholder="e.g. St. George's College / Independent"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Role / Designation</label>
                  <input
                    type="text"
                    value={addForm.role_title}
                    onChange={e => setAddForm({ ...addForm, role_title: e.target.value })}
                    placeholder="e.g. High School STEM Lead"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Province</label>
                  <select
                    value={addForm.city_province}
                    onChange={e => setAddForm({ ...addForm, city_province: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
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
                    <option value="International">International / Online</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Payment Status</label>
                  <select
                    value={addForm.payment_status}
                    onChange={e => setAddForm({ ...addForm, payment_status: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  >
                    <option value="verified">Verified (Fee Paid - $10)</option>
                    <option value="pending">Pending / Unpaid</option>
                    <option value="submitted">Submitted (Awaiting Check)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Admin Approval Status</label>
                  <select
                    value={addForm.approval_status}
                    onChange={e => setAddForm({ ...addForm, approval_status: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  >
                    <option value="approved">Approved (Live Room Access Allowed)</option>
                    <option value="pending">Pending Admin Decision</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>

              <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100 flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="modalSupportOptIn"
                  checked={addForm.continuous_support_opt_in}
                  onChange={e => setAddForm({ ...addForm, continuous_support_opt_in: e.target.checked })}
                  className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                />
                <label htmlFor="modalSupportOptIn" className="text-slate-800 font-bold cursor-pointer">
                  Opt-in for Termly Continuous Support ($15/term)
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-slate-600 font-bold hover:text-slate-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl shadow-md cursor-pointer"
                >
                  Save & Enroll Participant
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Downloadable Receipt Generator Modal (By User Name & Ref Number) */}
      {showGenerateReceiptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 md:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-[10px] font-black uppercase tracking-wider">
                  Admin Receipt Engine
                </span>
                <h3 className="text-xl font-black text-slate-900 mt-1">Generate Downloadable Receipt</h3>
                <p className="text-xs text-slate-500">Provide educator name and reference number to render the official receipt.</p>
              </div>
              <button 
                onClick={() => setShowGenerateReceiptModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Quick Auto-Fill Selector from Existing Registrations */}
            {registrations.length > 0 && (
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                  Quick Select Enrolled Educator (Auto-fills Details)
                </label>
                <select
                  onChange={(e) => {
                    const found = registrations.find(r => r.id === e.target.value);
                    if (found) handleSelectRegisteredUserForReceipt(found);
                  }}
                  defaultValue=""
                  className="w-full px-3 py-2 bg-white rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                >
                  <option value="" disabled>-- Or choose an enrolled educator from list --</option>
                  {registrations.map(r => (
                    <option key={r.id} value={r.id}>
                      {r.full_name} • Ref: {r.payment_reference || r.registration_code || r.id} ({r.school_institution})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <form onSubmit={handleAdminGenerateReceiptSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Educator Full Name *</label>
                <input
                  type="text"
                  required
                  value={generateReceiptForm.user_name}
                  onChange={e => setGenerateReceiptForm({ ...generateReceiptForm, user_name: e.target.value })}
                  placeholder="e.g. Dr. Tendai Moyo"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Reference Number / Registration Code *</label>
                <input
                  type="text"
                  required
                  value={generateReceiptForm.ref_number}
                  onChange={e => setGenerateReceiptForm({ ...generateReceiptForm, ref_number: e.target.value })}
                  placeholder="e.g. MP260831.9921 or YARA-AI-4K2P"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-xs font-bold text-indigo-900 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
                <p className="text-[10px] text-slate-400">Can be EcoCash Txn ID, Innbucks Ref, or YARA registration code</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Email Address (Optional)</label>
                  <input
                    type="email"
                    value={generateReceiptForm.email}
                    onChange={e => setGenerateReceiptForm({ ...generateReceiptForm, email: e.target.value })}
                    placeholder="educator@school.ac.zw"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">School / Institution</label>
                  <input
                    type="text"
                    value={generateReceiptForm.school_institution}
                    onChange={e => setGenerateReceiptForm({ ...generateReceiptForm, school_institution: e.target.value })}
                    placeholder="e.g. St George's College"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Amount Paid ($ USD)</label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={generateReceiptForm.amount_paid}
                    onChange={e => setGenerateReceiptForm({ ...generateReceiptForm, amount_paid: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Payment Method</label>
                  <select
                    value={generateReceiptForm.payment_method}
                    onChange={e => setGenerateReceiptForm({ ...generateReceiptForm, payment_method: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  >
                    <option value="EcoCash">EcoCash</option>
                    <option value="InnBucks">InnBucks</option>
                    <option value="Bank Transfer / Swipe">Direct Bank Transfer / Swipe</option>
                    <option value="Debit/Credit Card">Debit / Credit Card</option>
                    <option value="ZIPIT Transfer">ZIPIT Transfer</option>
                    <option value="Direct Admin Verified">Direct Admin Verified</option>
                  </select>
                </div>
              </div>

              <div className="p-3 bg-purple-50/70 rounded-xl border border-purple-100 flex items-center space-x-2.5">
                <input
                  type="checkbox"
                  id="adminReceiptSupportOptIn"
                  checked={generateReceiptForm.continuous_support_opt_in}
                  onChange={e => setGenerateReceiptForm({ ...generateReceiptForm, continuous_support_opt_in: e.target.checked })}
                  className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                />
                <label htmlFor="adminReceiptSupportOptIn" className="text-slate-800 font-bold cursor-pointer">
                  Include Continuous Support Mentorship (+$15/term)
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowGenerateReceiptModal(false)}
                  className="px-4 py-2 text-slate-600 font-bold hover:text-slate-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isGeneratingReceipt}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl shadow-md flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
                >
                  <FileText className="w-4 h-4" />
                  <span>{isGeneratingReceipt ? 'Generating...' : 'Render Downloadable Receipt'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Official Printable & Downloadable Receipt Modal */}
      <EducatorReceiptModal
        isOpen={showReceiptModal}
        onClose={() => {
          setShowReceiptModal(false);
          setSelectedReceipt(null);
        }}
        receipt={selectedReceipt}
      />

      {/* Official Printable & Downloadable Certificate Modal */}
      <EducatorCertificateModal
        isOpen={showCertificateModal}
        onClose={() => {
          setShowCertificateModal(false);
          setSelectedCertificate(null);
        }}
        certificateData={selectedCertificate}
        isAdmin={true}
      />

      {/* Certificate Studio & Signatures Configuration Modal */}
      <CertificateSettingsModal
        isOpen={showCertificateSettingsModal}
        onClose={() => setShowCertificateSettingsModal(false)}
        onSaved={() => {
          setNotification({
            type: 'success',
            message: 'Official certificate template, signatures, seal, and branding have been saved and synchronized!'
          });
        }}
      />

      {/* Individual Participant Certificate Customizer Modal */}
      <IndividualCertificateEditModal
        isOpen={!!editingIndividualRegistration}
        registration={editingIndividualRegistration}
        onClose={() => setEditingIndividualRegistration(null)}
        onUpdated={(updated) => {
          setRegistrations(prev => prev.map(r => r.id === updated.id ? updated : r));
          setNotification({
            type: 'success',
            message: `Certificate for ${updated.full_name} (${updated.certificate_number || 'Updated'}) has been saved!`
          });
        }}
      />
    </div>
  );
}
