import React, { useState, useEffect } from 'react';
import { 
  Users, CheckCircle2, XCircle, Clock, DollarSign, Search, 
  Filter, ShieldCheck, AlertCircle, RefreshCw, Plus, UserPlus, 
  Edit3, Save, Trash2, Eye, Download, Printer, School, Mail, Phone,
  ChevronDown, X, Award, Check, FileSpreadsheet, Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  EventRegistration, 
  EventPaymentStatus, 
  EventApprovalStatus, 
  AI_FOR_EDUCATORS_EVENT 
} from '../../types/eventRegistration';
import { 
  getAllEventRegistrations, 
  registerForEvent, 
  updateRegistrationStatus, 
  deleteEventRegistration,
  generateRegistrationCode 
} from '../../services/eventRegistrationService';
import { useAuth } from '../AuthContext';

export default function EventSignupsManager() {
  const { profile } = useAuth();
  const isAdmin = profile?.role === 'admin' || profile?.email === 'manongwasimbarashe394@gmail.com' || profile?.email === 'goyaracorp@gmail.com';

  const [registrations, setRegistrations] = useState<EventRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'verified' | 'pending' | 'unpaid' | 'approved' | 'rejected'>('all');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Edit Modal State
  const [editingRegistration, setEditingRegistration] = useState<EventRegistration | null>(null);
  const [editForm, setEditForm] = useState<{
    full_name: string;
    email: string;
    phone: string;
    school_institution: string;
    role_title: string;
    payment_status: EventPaymentStatus;
    approval_status: EventApprovalStatus;
    certificate_unlocked: boolean;
    admin_notes: string;
  }>({
    full_name: '',
    email: '',
    phone: '',
    school_institution: '',
    role_title: 'Educator / Teacher',
    payment_status: 'pending',
    approval_status: 'pending',
    certificate_unlocked: false,
    admin_notes: ''
  });
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Delete Modal State
  const [deletingRegistration, setDeletingRegistration] = useState<EventRegistration | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Add Manual Registrant State
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
    payment_status: 'verified' as EventPaymentStatus,
    approval_status: 'approved' as EventApprovalStatus,
    admin_notes: 'Enrolled via Events Portal Manager'
  });
  const [isSubmittingAdd, setIsSubmittingAdd] = useState(false);

  const loadData = async () => {
    setIsRefreshing(true);
    try {
      const list = await getAllEventRegistrations(AI_FOR_EDUCATORS_EVENT.id);
      setRegistrations(list);
    } catch (err) {
      console.error('Error fetching signups:', err);
    } finally {
      setIsRefreshing(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const showNotice = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  // Filtered registrations
  const filteredList = registrations.filter(item => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      item.full_name?.toLowerCase().includes(searchLower) ||
      item.email?.toLowerCase().includes(searchLower) ||
      item.school_institution?.toLowerCase().includes(searchLower) ||
      item.registration_code?.toLowerCase().includes(searchLower) ||
      item.phone?.toLowerCase().includes(searchLower);

    if (!matchesSearch) return false;

    if (statusFilter === 'all') return true;
    if (statusFilter === 'verified') return item.payment_status === 'verified';
    if (statusFilter === 'pending') return item.approval_status === 'pending' || item.payment_status === 'pending';
    if (statusFilter === 'unpaid') return item.payment_status === 'unpaid';
    if (statusFilter === 'approved') return item.approval_status === 'approved';
    if (statusFilter === 'rejected') return item.approval_status === 'rejected';

    return true;
  });

  // Open Edit Modal
  const handleOpenEdit = (item: EventRegistration) => {
    setEditingRegistration(item);
    setEditForm({
      full_name: item.full_name || '',
      email: item.email || '',
      phone: item.phone || '',
      school_institution: item.school_institution || '',
      role_title: item.role_title || 'Educator / Teacher',
      payment_status: item.payment_status || 'pending',
      approval_status: item.approval_status || 'pending',
      certificate_unlocked: !!item.certificate_unlocked,
      admin_notes: item.admin_notes || ''
    });
  };

  // Save Edit
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRegistration) return;

    setIsSavingEdit(true);
    try {
      const updated = await updateRegistrationStatus(editingRegistration.id, {
        payment_status: editForm.payment_status,
        approval_status: editForm.approval_status,
        certificate_unlocked: editForm.certificate_unlocked,
        admin_notes: editForm.admin_notes,
      });

      // Update in memory & reload
      setRegistrations(prev => prev.map(r => r.id === editingRegistration.id ? {
        ...r,
        full_name: editForm.full_name.trim(),
        email: editForm.email.trim(),
        phone: editForm.phone.trim(),
        school_institution: editForm.school_institution.trim(),
        role_title: editForm.role_title.trim(),
        payment_status: editForm.payment_status,
        approval_status: editForm.approval_status,
        certificate_unlocked: editForm.certificate_unlocked,
        admin_notes: editForm.admin_notes,
      } : r));

      setEditingRegistration(null);
      showNotice('success', `Updated registration for ${editForm.full_name}!`);
      loadData();
    } catch (err: any) {
      showNotice('error', err.message || 'Failed to update registration.');
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Delete Registration
  const handleDeleteConfirm = async () => {
    if (!deletingRegistration) return;

    setIsDeleting(true);
    try {
      await deleteEventRegistration(deletingRegistration.id);
      setRegistrations(prev => prev.filter(r => r.id !== deletingRegistration.id));
      showNotice('success', `Removed registration for ${deletingRegistration.full_name}.`);
      setDeletingRegistration(null);
    } catch (err: any) {
      showNotice('error', err.message || 'Could not remove registration.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Manual Add Registration
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.full_name || !addForm.email) return;

    setIsSubmittingAdd(true);
    try {
      const newReg = await registerForEvent({
        event_id: AI_FOR_EDUCATORS_EVENT.id,
        full_name: addForm.full_name.trim(),
        email: addForm.email.trim().toLowerCase(),
        phone: addForm.phone.trim(),
        school_institution: addForm.school_institution.trim(),
        role_title: addForm.role_title.trim(),
        teaching_level: addForm.teaching_level,
        years_experience: addForm.years_experience,
        country: addForm.country,
        city_province: addForm.city_province,
        continuous_support_opt_in: true,
        payment_status: addForm.payment_status,
        approval_status: addForm.approval_status,
        admin_notes: addForm.admin_notes
      });

      showNotice('success', `Enrolled ${addForm.full_name} into AI for Educators!`);
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
        payment_status: 'verified',
        approval_status: 'approved',
        admin_notes: 'Enrolled via Events Portal Manager'
      });
      loadData();
    } catch (err: any) {
      showNotice('error', err.message || 'Failed to enroll participant.');
    } finally {
      setIsSubmittingAdd(false);
    }
  };

  // Export CSV
  const handleExportCsv = () => {
    if (registrations.length === 0) return;
    const headers = ['Reg Code', 'Full Name', 'Email', 'Phone', 'School/Institution', 'Role', 'Payment Status', 'Approval Status', 'Date'];
    const rows = filteredList.map(r => [
      `"${r.registration_code || ''}"`,
      `"${r.full_name || ''}"`,
      `"${r.email || ''}"`,
      `"${r.phone || ''}"`,
      `"${r.school_institution || ''}"`,
      `"${r.role_title || ''}"`,
      `"${r.payment_status || ''}"`,
      `"${r.approval_status || ''}"`,
      `"${new Date(r.created_at).toLocaleDateString()}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `YARA_AI_for_Educators_Registrants_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const verifiedCount = registrations.filter(r => r.payment_status === 'verified').length;
  const approvedCount = registrations.filter(r => r.approval_status === 'approved').length;

  return (
    <div className="bg-white border border-slate-200/80 rounded-[2.5rem] p-6 md:p-8 shadow-xl space-y-6">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`p-4 rounded-2xl flex items-center justify-between text-xs font-bold ${
              notification.type === 'success' 
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' 
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}
          >
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{notification.message}</span>
            </div>
            <button onClick={() => setNotification(null)} className="text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header & Stats */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center space-x-2 text-indigo-600 text-xs font-black uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Official Event Roster & Signups Manager</span>
          </div>
          <h3 className="text-2xl font-black text-slate-900 tracking-tight">
            AI for Educators — Enrolled Participants
          </h3>
          <p className="text-slate-500 text-xs font-medium mt-1">
            Manage registrations, verify payments, update attendee credentials, or edit and remove records.
          </p>
        </div>

        {/* Quick Actions & Badges */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-2xl text-xs font-bold">
            <Users className="w-4 h-4 text-indigo-600" />
            <span>Total: <strong className="text-slate-900">{registrations.length}</strong></span>
          </div>

          <div className="flex items-center space-x-2 bg-emerald-50 border border-emerald-200 px-3.5 py-2 rounded-2xl text-xs font-bold text-emerald-700">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Verified: <strong>{verifiedCount}</strong></span>
          </div>

          <button
            onClick={loadData}
            disabled={isRefreshing}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all"
            title="Refresh List"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handleExportCsv}
            className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-xl font-bold text-xs flex items-center space-x-1.5 transition-all shadow-sm"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-bold text-xs flex items-center space-x-1.5 transition-all shadow-lg shadow-indigo-600/20"
          >
            <UserPlus className="w-4 h-4" />
            <span>Manual Enroll</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, email, school, code..."
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-2.5 text-xs font-medium text-slate-900 focus:outline-none focus:border-indigo-600 transition-all"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center space-x-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'All Registrants' },
            { id: 'verified', label: 'Verified Paid' },
            { id: 'approved', label: 'Approved' },
            { id: 'pending', label: 'Pending Action' },
            { id: 'unpaid', label: 'Unpaid' },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setStatusFilter(f.id as any)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition-all ${
                statusFilter === f.id 
                  ? 'bg-indigo-600 text-white shadow-sm' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Registrants Table */}
      {loading ? (
        <div className="py-16 text-center text-slate-400 space-y-3">
          <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
          <p className="text-xs font-bold">Loading registrant records...</p>
        </div>
      ) : filteredList.length === 0 ? (
        <div className="py-16 text-center border-2 border-dashed border-slate-200 rounded-3xl space-y-3">
          <Users className="w-12 h-12 text-slate-300 mx-auto" />
          <p className="text-slate-700 font-bold text-sm">No registrants found matching your query.</p>
          <p className="text-slate-400 text-xs">Try clearing your search filter or add a manual participant above.</p>
        </div>
      ) : (
        <div className="overflow-x-auto border border-slate-200/80 rounded-2xl">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                <th className="p-4">Participant / Institution</th>
                <th className="p-4">Contact</th>
                <th className="p-4">Code / Date</th>
                <th className="p-4">Payment</th>
                <th className="p-4">Approval</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredList.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-4">
                    <div className="font-bold text-slate-900">{item.full_name}</div>
                    <div className="text-[11px] text-slate-500 flex items-center space-x-1 mt-0.5">
                      <School className="w-3 h-3 text-slate-400" />
                      <span>{item.school_institution || 'Independent Educator'}</span>
                      <span className="text-slate-300">•</span>
                      <span className="text-indigo-600 font-semibold">{item.role_title || 'Teacher'}</span>
                    </div>
                  </td>

                  <td className="p-4">
                    <div className="text-slate-800 flex items-center space-x-1">
                      <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="truncate max-w-[160px]">{item.email}</span>
                    </div>
                    {item.phone && (
                      <div className="text-[11px] text-slate-400 flex items-center space-x-1 mt-0.5">
                        <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>{item.phone}</span>
                      </div>
                    )}
                  </td>

                  <td className="p-4 font-mono text-[11px]">
                    <div className="font-bold text-indigo-600">{item.registration_code || item.id.substring(0, 8)}</div>
                    <div className="text-[10px] text-slate-400 font-sans mt-0.5">
                      {new Date(item.created_at).toLocaleDateString()}
                    </div>
                  </td>

                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase inline-flex items-center space-x-1 ${
                      item.payment_status === 'verified' 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : item.payment_status === 'pending'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {item.payment_status === 'verified' && <CheckCircle2 className="w-3 h-3" />}
                      <span>{item.payment_status || 'pending'}</span>
                    </span>
                  </td>

                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase inline-flex items-center space-x-1 ${
                      item.approval_status === 'approved' 
                        ? 'bg-indigo-100 text-indigo-800' 
                        : item.approval_status === 'rejected'
                        ? 'bg-slate-100 text-slate-600'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      <span>{item.approval_status || 'pending'}</span>
                    </span>
                  </td>

                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end space-x-1.5">
                      <button
                        onClick={() => handleOpenEdit(item)}
                        className="p-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl transition-all"
                        title="Edit Participant Details"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => setDeletingRegistration(item)}
                        className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-all"
                        title="Remove Registration"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Registration Modal */}
      <AnimatePresence>
        {editingRegistration && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white max-w-lg w-full rounded-[2.5rem] p-6 sm:p-8 shadow-2xl space-y-6"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center font-bold">
                    <Edit3 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Edit Participant Signup</h3>
                    <p className="text-xs text-slate-400">Code: {editingRegistration.registration_code}</p>
                  </div>
                </div>
                <button onClick={() => setEditingRegistration(null)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Full Name</label>
                    <input
                      type="text"
                      value={editForm.full_name}
                      onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-semibold text-slate-900"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Email Address</label>
                    <input
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-semibold text-slate-900"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Phone Number</label>
                    <input
                      type="text"
                      value={editForm.phone}
                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-semibold text-slate-900"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">School / Institution</label>
                    <input
                      type="text"
                      value={editForm.school_institution}
                      onChange={(e) => setEditForm({ ...editForm, school_institution: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-semibold text-slate-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Payment Status</label>
                    <select
                      value={editForm.payment_status}
                      onChange={(e) => setEditForm({ ...editForm, payment_status: e.target.value as EventPaymentStatus })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-bold text-slate-900"
                    >
                      <option value="verified">Verified (Paid)</option>
                      <option value="pending">Pending Verification</option>
                      <option value="unpaid">Unpaid</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Approval Status</label>
                    <select
                      value={editForm.approval_status}
                      onChange={(e) => setEditForm({ ...editForm, approval_status: e.target.value as EventApprovalStatus })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-bold text-slate-900"
                    >
                      <option value="approved">Approved</option>
                      <option value="pending">Pending Approval</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center space-x-2 pt-2">
                  <input
                    type="checkbox"
                    id="cert_unlocked_edit"
                    checked={editForm.certificate_unlocked}
                    onChange={(e) => setEditForm({ ...editForm, certificate_unlocked: e.target.checked })}
                    className="w-4 h-4 text-indigo-600 rounded"
                  />
                  <label htmlFor="cert_unlocked_edit" className="font-bold text-slate-700 cursor-pointer">
                    Unlock Official Certificate Access
                  </label>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Administrative Notes</label>
                  <textarea
                    value={editForm.admin_notes}
                    onChange={(e) => setEditForm({ ...editForm, admin_notes: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 min-h-[70px]"
                    placeholder="Internal reference notes..."
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setEditingRegistration(null)}
                    className="px-5 py-3 rounded-xl font-bold bg-slate-100 hover:bg-slate-200 text-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingEdit}
                    className="px-6 py-3 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/20 flex items-center space-x-2"
                  >
                    {isSavingEdit ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    <span>Save Changes</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deletingRegistration && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white max-w-md w-full rounded-[2.5rem] p-6 sm:p-8 shadow-2xl space-y-6 text-center"
            >
              <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
                <Trash2 className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-bold text-slate-900">Remove Registration?</h3>
                <p className="text-slate-500 text-xs">
                  Are you sure you want to remove <strong className="text-slate-900">{deletingRegistration.full_name}</strong> ({deletingRegistration.email}) from AI for Educators?
                </p>
              </div>

              <div className="flex justify-center space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setDeletingRegistration(null)}
                  className="px-5 py-3 rounded-xl font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteConfirm}
                  disabled={isDeleting}
                  className="px-6 py-3 rounded-xl font-bold bg-red-600 hover:bg-red-700 text-white text-xs shadow-lg shadow-red-600/20 flex items-center space-x-2"
                >
                  {isDeleting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  <span>Confirm Removal</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Manual Add Participant Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white max-w-lg w-full rounded-[2.5rem] p-6 sm:p-8 shadow-2xl space-y-6"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center font-bold">
                    <UserPlus className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Manual Participant Enrollment</h3>
                    <p className="text-xs text-slate-400">Add an educator directly into the event roster</p>
                  </div>
                </div>
                <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Full Name *</label>
                    <input
                      type="text"
                      value={addForm.full_name}
                      onChange={(e) => setAddForm({ ...addForm, full_name: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-semibold text-slate-900"
                      placeholder="e.g. Tendai Moyo"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Email Address *</label>
                    <input
                      type="email"
                      value={addForm.email}
                      onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-semibold text-slate-900"
                      placeholder="e.g. tendai@school.ac.zw"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Phone Number</label>
                    <input
                      type="text"
                      value={addForm.phone}
                      onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-semibold text-slate-900"
                      placeholder="+263 77 000 0000"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">School / Institution</label>
                    <input
                      type="text"
                      value={addForm.school_institution}
                      onChange={(e) => setAddForm({ ...addForm, school_institution: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-semibold text-slate-900"
                      placeholder="e.g. Harare High School"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Payment Status</label>
                    <select
                      value={addForm.payment_status}
                      onChange={(e) => setAddForm({ ...addForm, payment_status: e.target.value as EventPaymentStatus })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-bold text-slate-900"
                    >
                      <option value="verified">Verified (Paid)</option>
                      <option value="pending">Pending</option>
                      <option value="unpaid">Unpaid</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Approval Status</label>
                    <select
                      value={addForm.approval_status}
                      onChange={(e) => setAddForm({ ...addForm, approval_status: e.target.value as EventApprovalStatus })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-bold text-slate-900"
                    >
                      <option value="approved">Approved</option>
                      <option value="pending">Pending</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-5 py-3 rounded-xl font-bold bg-slate-100 hover:bg-slate-200 text-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingAdd}
                    className="px-6 py-3 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/20 flex items-center space-x-2"
                  >
                    {isSubmittingAdd ? <RefreshCw className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                    <span>Enroll Participant</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
