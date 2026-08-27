import React, { useState, useEffect } from 'react';
import { 
  Users, CheckCircle2, XCircle, Clock, DollarSign, Search, 
  Filter, ShieldCheck, AlertCircle, RefreshCw, Plus, UserPlus, 
  ExternalLink, Mail, Phone, School, Award, Sparkles, Check, 
  Trash2, Eye, ShieldAlert, ArrowUpRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { EventRegistration, EventPaymentStatus, EventApprovalStatus } from '../../types/eventRegistration';
import { 
  getEventRegistrations, 
  updateRegistrationStatus, 
  registerForEvent, 
  deleteEventRegistration,
  checkEventAccess,
  AI_FOR_EDUCATORS_EVENT
} from '../../services/eventRegistrationService';

export default function EventRegistrationsAdminTab() {
  const [registrations, setRegistrations] = useState<EventRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [eventFilter, setEventFilter] = useState<string>('ai_educators_bootcamp_2026');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected' | 'unpaid' | 'verified'>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

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

  const loadData = async () => {
    setIsRefreshing(true);
    try {
      const data = await getEventRegistrations(eventFilter || undefined);
      setRegistrations(data);
    } catch (err: any) {
      console.error('Error loading event registrations:', err);
    } finally {
      setIsRefreshing(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [eventFilter]);

  const showNotice = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
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
      'Verified payment ($10) & approved for live bootcamp access by Administrator.'
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

        showNotice('success', `Manually registered ${addForm.full_name} for AI for Educators Bootcamp!`);
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
    const matchesSearch = 
      r.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.school_institution.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.phone && r.phone.includes(searchTerm));

    if (!matchesSearch) return false;

    if (statusFilter === 'pending') return r.approval_status === 'pending';
    if (statusFilter === 'approved') return r.approval_status === 'approved';
    if (statusFilter === 'rejected') return r.approval_status === 'rejected';
    if (statusFilter === 'unpaid') return r.payment_status === 'unpaid' || r.payment_status === 'pending_verification';
    if (statusFilter === 'verified') return r.payment_status === 'verified';

    return true;
  });

  // Calculate metrics
  const totalCount = registrations.length;
  const verifiedPaymentsCount = registrations.filter(r => r.payment_status === 'verified').length;
  const totalRevenueCollected = verifiedPaymentsCount * 10;
  const pendingApprovalsCount = registrations.filter(r => r.approval_status === 'pending').length;
  const fullAccessGrantedCount = registrations.filter(r => r.payment_status === 'verified' && r.approval_status === 'approved').length;
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
          <button onClick={() => setNotification(null)} className="text-slate-400 hover:text-slate-700 ml-4">✕</button>
        </div>
      )}

      {/* Top Header Card */}
      <div className="p-6 md:p-8 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl text-white border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 bg-amber-400/20 text-amber-300 border border-amber-400/30 rounded-full text-[11px] font-black uppercase tracking-wider">
                🔒 Protected Access Control & Verification
              </span>
              <span className="px-3 py-1 bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 rounded-full text-[11px] font-black uppercase tracking-wider">
                Live Online Bootcamp
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Event Registration & Access Management
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Enforce strict entry validation for <strong>AI for Educators – Online Bootcamp</strong>. Participants can enter the live event room <em>ONLY</em> when their US$10 registration fee is verified AND their account is approved by an administrator.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
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

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
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
          <span className="text-[10px] text-indigo-600 font-bold">Paid & Approved (ENTER EVENT enabled)</span>
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

      {/* Filter and Search Bar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search educator name, email, school, or phone number..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
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
                  <th className="py-3.5 px-4">Educator / Institution</th>
                  <th className="py-3.5 px-4">Level & Exp</th>
                  <th className="py-3.5 px-4">Fee Status ($10)</th>
                  <th className="py-3.5 px-4">Approval</th>
                  <th className="py-3.5 px-4">Live Event Access</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(reg => {
                  const isAccessGranted = reg.payment_status === 'verified' && reg.approval_status === 'approved';
                  const isProcessing = actionLoadingId === reg.id;

                  return (
                    <tr key={reg.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Name & Contact */}
                      <td className="py-4 px-4">
                        <div className="space-y-0.5">
                          <div className="flex items-center space-x-2">
                            <span className="font-black text-slate-900 text-sm">{reg.full_name}</span>
                            {reg.continuous_support_opt_in && (
                              <span className="px-2 py-0.5 bg-purple-100 text-purple-800 rounded-md text-[9px] font-bold" title="Opted in for $15/term continuous support">
                                +Term Support
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
                            <span>{reg.school_institution} ({reg.city_province || 'Zimbabwe'})</span>
                          </div>
                        </div>
                      </td>

                      {/* Level & Exp */}
                      <td className="py-4 px-4">
                        <div className="space-y-1">
                          <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded-lg text-[10px] font-bold capitalize inline-block">
                            {reg.teaching_level || 'Educator'}
                          </span>
                          <p className="text-[10px] text-slate-400">{reg.years_experience || '3+ yrs exp'}</p>
                          <p className="text-[9px] text-slate-400">Reg: {new Date(reg.created_at).toLocaleDateString()}</p>
                        </div>
                      </td>

                      {/* Payment Status */}
                      <td className="py-4 px-4">
                        <div className="space-y-1.5">
                          {reg.payment_status === 'verified' && (
                            <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-full text-[10px] font-black flex items-center space-x-1 w-fit">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>Verified ($10 Paid)</span>
                            </span>
                          )}
                          {reg.payment_status === 'pending_verification' && (
                            <span className="px-2.5 py-1 bg-amber-100 text-amber-800 border border-amber-300 rounded-full text-[10px] font-black flex items-center space-x-1 w-fit">
                              <Clock className="w-3 h-3 text-amber-600" />
                              <span>Payment Submitted</span>
                            </span>
                          )}
                          {reg.payment_status === 'unpaid' && (
                            <span className="px-2.5 py-1 bg-rose-100 text-rose-800 border border-rose-300 rounded-full text-[10px] font-black flex items-center space-x-1 w-fit">
                              <XCircle className="w-3 h-3 text-rose-600" />
                              <span>Unpaid ($10 Due)</span>
                            </span>
                          )}
                          {reg.payment_status === 'refunded' && (
                            <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-full text-[10px] font-bold">
                              Refunded
                            </span>
                          )}

                          {/* Quick Payment Status buttons */}
                          <div className="flex items-center gap-1">
                            {reg.payment_status !== 'verified' ? (
                              <button
                                disabled={isProcessing}
                                onClick={() => handleUpdateStatus(reg.id, 'verified')}
                                className="px-2 py-0.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-bold transition-all"
                              >
                                Mark Paid
                              </button>
                            ) : (
                              <button
                                disabled={isProcessing}
                                onClick={() => handleUpdateStatus(reg.id, 'pending')}
                                className="text-[10px] text-slate-500 hover:text-slate-800 underline"
                              >
                                Reset to Unpaid
                              </button>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Approval Status */}
                      <td className="py-4 px-4">
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
                              <span>Pending Review</span>
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
                                className="px-2 py-0.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-[10px] font-bold transition-all"
                              >
                                Approve
                              </button>
                            )}
                            {reg.approval_status !== 'rejected' && (
                              <button
                                disabled={isProcessing}
                                onClick={() => handleUpdateStatus(reg.id, undefined, 'rejected')}
                                className="px-2 py-0.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded text-[10px] font-bold transition-all"
                              >
                                Reject
                              </button>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Live Event Access Result */}
                      <td className="py-4 px-4">
                        {isAccessGranted ? (
                          <div className="space-y-1">
                            <span className="px-2.5 py-1 bg-emerald-600 text-white rounded-xl text-[10px] font-black flex items-center space-x-1.5 shadow-xs w-fit">
                              <ShieldCheck className="w-3.5 h-3.5" />
                              <span>ACCESS GRANTED</span>
                            </span>
                            <p className="text-[10px] text-emerald-700 font-bold">
                              Enter Event unlocked
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <span className="px-2.5 py-1 bg-slate-100 text-slate-600 border border-slate-200 rounded-xl text-[10px] font-bold flex items-center space-x-1.5 w-fit">
                              <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
                              <span>ACCESS RESTRICTED</span>
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

                      {/* Combined Action Buttons */}
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {!isAccessGranted && (
                            <button
                              disabled={isProcessing}
                              onClick={() => handleQuickApproveBoth(reg)}
                              title="Verify payment and approve access simultaneously"
                              className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black text-[11px] shadow-xs flex items-center space-x-1 transition-all"
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Grant Full Access</span>
                            </button>
                          )}
                          <button
                            disabled={isProcessing}
                            onClick={() => handleDelete(reg.id, reg.full_name)}
                            title="Remove Registration"
                            className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-all"
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
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleManualAddSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1 uppercase tracking-wider">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={addForm.full_name}
                    onChange={e => setAddForm({ ...addForm, full_name: e.target.value })}
                    placeholder="e.g. Mrs. Florence Sibanda"
                    className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1 uppercase tracking-wider">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={addForm.email}
                    onChange={e => setAddForm({ ...addForm, email: e.target.value })}
                    placeholder="educator@school.ac.zw"
                    className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1 uppercase tracking-wider">Phone / WhatsApp</label>
                  <input
                    type="tel"
                    value={addForm.phone}
                    onChange={e => setAddForm({ ...addForm, phone: e.target.value })}
                    placeholder="+263 77 123 4567"
                    className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1 uppercase tracking-wider">School / Institution</label>
                  <input
                    type="text"
                    value={addForm.school_institution}
                    onChange={e => setAddForm({ ...addForm, school_institution: e.target.value })}
                    placeholder="e.g. St George's College / Bulawayo High"
                    className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1 uppercase tracking-wider">Teaching Level</label>
                  <select
                    value={addForm.teaching_level}
                    onChange={e => setAddForm({ ...addForm, teaching_level: e.target.value as any })}
                    className="w-full p-3 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  >
                    <option value="primary">Primary Education</option>
                    <option value="secondary">Secondary / High School</option>
                    <option value="tertiary">Tertiary / University / College</option>
                    <option value="tvet">TVET / Technical Institute</option>
                    <option value="non_formal">Non-Formal / Community STEM Centre</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1 uppercase tracking-wider">Years of Experience</label>
                  <select
                    value={addForm.years_experience}
                    onChange={e => setAddForm({ ...addForm, years_experience: e.target.value })}
                    className="w-full p-3 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  >
                    <option value="0-2 years">0 - 2 years (Early Career)</option>
                    <option value="3-5 years">3 - 5 years (Established)</option>
                    <option value="6-10 years">6 - 10 years (Senior Educator)</option>
                    <option value="10+ years">10+ years (Master Educator)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1 uppercase tracking-wider">Initial Payment Status</label>
                  <select
                    value={addForm.payment_status}
                    onChange={e => setAddForm({ ...addForm, payment_status: e.target.value as any })}
                    className="w-full p-3 rounded-xl border border-slate-200 bg-white font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  >
                    <option value="verified">Verified ($10.00 Paid)</option>
                    <option value="pending_verification">Payment Submitted (Pending check)</option>
                    <option value="unpaid">Unpaid ($10 Due)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1 uppercase tracking-wider">Initial Approval Status</label>
                  <select
                    value={addForm.approval_status}
                    onChange={e => setAddForm({ ...addForm, approval_status: e.target.value as any })}
                    className="w-full p-3 rounded-xl border border-slate-200 bg-white font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  >
                    <option value="approved">Approved (Active access)</option>
                    <option value="pending">Pending Admin Review</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>

              <div className="p-3 bg-purple-50 rounded-2xl border border-purple-100 flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="continuous_support"
                  checked={addForm.continuous_support_opt_in}
                  onChange={e => setAddForm({ ...addForm, continuous_support_opt_in: e.target.checked })}
                  className="w-4 h-4 text-indigo-600 rounded"
                />
                <label htmlFor="continuous_support" className="text-xs text-purple-900 font-bold cursor-pointer">
                  Continuous Support (US$15 per term ongoing educator mentorship & AI resource updates)
                </label>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoadingId === 'manual-add'}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black shadow-md disabled:opacity-50"
                >
                  {actionLoadingId === 'manual-add' ? 'Saving...' : 'Save & Enroll Educator'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
