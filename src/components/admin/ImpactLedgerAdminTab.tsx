import React, { useState, useEffect } from 'react';
import { 
  BarChart3, DollarSign, Users, Award, ShieldCheck, 
  TrendingUp, CheckCircle2, Download, Search, Filter, 
  Building2, Sparkles, Heart, AlertCircle, RefreshCw, 
  UserCheck, Plus, X, Lock, Check, FileSpreadsheet, Calendar
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../AuthContext';
import { cn } from '../../lib/utils';
import { 
  ImpactLedgerEntry, 
  ExecutiveAuditor,
  getImpactLedgerEntries, 
  calculateMEIndicators, 
  getExecutiveAuditors, 
  authorizeExecutiveMember, 
  revokeExecutiveMember, 
  isAuthorizedExecutiveAuditor, 
  exportImpactLedgerToCsv,
  MASTER_ADMIN_EMAILS
} from '../../services/impactLedgerService';

export default function ImpactLedgerAdminTab() {
  const { profile, user } = useAuth();
  const [entries, setEntries] = useState<ImpactLedgerEntry[]>([]);
  const [auditors, setAuditors] = useState<ExecutiveAuditor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Executive Authorization Modal
  const [showAddAuditorModal, setShowAddAuditorModal] = useState(false);
  const [auditorForm, setAuditorForm] = useState({
    email: '',
    name: '',
    title: 'Executive Financial Auditor'
  });
  const [isSubmittingAuditor, setIsSubmittingAuditor] = useState(false);

  // Status message
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const currentUserEmail = user?.email || profile?.email || '';
  const isAuthorizedToDownload = isAuthorizedExecutiveAuditor(currentUserEmail, profile);
  const isMasterAdmin = MASTER_ADMIN_EMAILS.some(e => e.toLowerCase() === currentUserEmail.toLowerCase()) || profile?.role === 'admin';

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [fetchedEntries, fetchedAuditors] = await Promise.all([
        getImpactLedgerEntries(),
        getExecutiveAuditors()
      ]);
      setEntries(fetchedEntries);
      setAuditors(fetchedAuditors);
    } catch (err) {
      console.warn('Error loading impact ledger:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCsv = () => {
    const res = exportImpactLedgerToCsv(
      filteredEntries,
      profile?.display_name || 'Executive Auditor',
      currentUserEmail,
      profile
    );

    if (res.success) {
      setMessage({ type: 'success', text: res.message });
    } else {
      setMessage({ type: 'error', text: res.message });
    }
    setTimeout(() => setMessage(null), 5000);
  };

  const handleAddAuditor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auditorForm.email.trim() || !auditorForm.name.trim()) {
      setMessage({ type: 'error', text: 'Please fill in both email and full name.' });
      return;
    }

    setIsSubmittingAuditor(true);
    try {
      const res = await authorizeExecutiveMember(
        {
          email: auditorForm.email.trim(),
          name: auditorForm.name.trim(),
          title: auditorForm.title.trim(),
          authorized_by: currentUserEmail
        },
        currentUserEmail
      );

      if (res.success && res.data) {
        setAuditors(prev => [res.data!, ...prev.filter(a => a.email.toLowerCase() !== res.data!.email.toLowerCase())]);
        setShowAddAuditorModal(false);
        setAuditorForm({ email: '', name: '', title: 'Executive Financial Auditor' });
        setMessage({ type: 'success', text: `Authorized ${res.data.name} (${res.data.email}) for official M&E ledger access.` });
      } else {
        setMessage({ type: 'error', text: res.error || 'Failed to authorize executive member.' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Authorization failed.' });
    } finally {
      setIsSubmittingAuditor(false);
      setTimeout(() => setMessage(null), 4000);
    }
  };

  const handleRevokeAuditor = async (email: string) => {
    if (!window.confirm(`Revoke financial audit & export privileges for ${email}?`)) return;
    const ok = await revokeExecutiveMember(email);
    if (ok) {
      setAuditors(prev => prev.map(a => a.email.toLowerCase() === email.toLowerCase() ? { ...a, is_active: false } : a));
      setMessage({ type: 'success', text: `Revoked executive export authorization for ${email}.` });
      setTimeout(() => setMessage(null), 4000);
    }
  };

  const meStats = calculateMEIndicators(entries);

  const filteredEntries = entries.filter(item => {
    const matchesSearch = 
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.payer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.payer_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.school_institution.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.reference_id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = categoryFilter === 'all' || item.source_module === categoryFilter;
    const matchesStatus = statusFilter === 'all' || item.payment_status === statusFilter || item.approval_status === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="space-y-8 font-sans text-slate-800">
      
      {/* 1. Header & Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-6 sm:p-8 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl shadow-xl">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-black uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Centralized Financial & Impact Audit Ledger</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            M & E Monitoring, Auditing & Financial Ledger
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
            All fees collected from AI for Educators bootcamps, Robotics championships, platform subscriptions, and corporate grants feed into this central audited ledger.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={loadData}
            disabled={loading}
            className="p-3 bg-white/10 hover:bg-white/20 text-slate-200 rounded-2xl transition-all cursor-pointer"
            title="Refresh Ledger"
          >
            <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
          </button>

          {isMasterAdmin && (
            <button
              onClick={() => setShowAddAuditorModal(true)}
              className="px-4 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-xs font-bold transition flex items-center space-x-2 shadow-md cursor-pointer"
            >
              <UserCheck className="w-4 h-4" />
              <span>Authorize Executive Auditor</span>
            </button>
          )}

          <button
            onClick={handleExportCsv}
            disabled={!isAuthorizedToDownload}
            className={cn(
              "px-5 py-3 rounded-2xl text-xs font-black transition flex items-center space-x-2 shadow-lg cursor-pointer",
              isAuthorizedToDownload 
                ? "bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20" 
                : "bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-700"
            )}
            title={isAuthorizedToDownload ? "Export official M&E CSV file" : "Requires Executive Auditor authorization from Master Admin"}
          >
            {isAuthorizedToDownload ? (
              <FileSpreadsheet className="w-4 h-4" />
            ) : (
              <Lock className="w-4 h-4 text-amber-400" />
            )}
            <span>{isAuthorizedToDownload ? "Download M&E Audit Ledger (CSV)" : "Download Locked (Executive Clearance Required)"}</span>
          </button>
        </div>
      </div>

      {/* Messages */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={cn(
              "p-4 rounded-2xl flex items-center space-x-3 text-xs font-bold",
              message.type === 'success' ? "bg-emerald-50 text-emerald-800 border border-emerald-200" : "bg-red-50 text-red-800 border border-red-200"
            )}
          >
            {message.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-red-600" />}
            <span>{message.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. M&E KPI Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>Verified Inflows</span>
            <DollarSign className="w-5 h-5 text-emerald-600" />
          </div>
          <p className="text-3xl font-black text-slate-900 font-mono">
            ${meStats.total_inflow_usd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-xs font-bold text-slate-400">USD</span>
          </p>
          <p className="text-xs text-emerald-600 font-bold flex items-center space-x-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>100% Itemized & Audited</span>
          </p>
        </div>

        <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>Direct Beneficiaries</span>
            <Users className="w-5 h-5 text-indigo-600" />
          </div>
          <p className="text-3xl font-black text-slate-900 font-mono">
            {meStats.total_beneficiaries}
          </p>
          <p className="text-xs text-indigo-600 font-bold">
            Teachers, Students & Innovators
          </p>
        </div>

        <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>Girls in STEM Ratio</span>
            <Heart className="w-5 h-5 text-pink-600" />
          </div>
          <p className="text-3xl font-black text-slate-900 font-mono">
            {meStats.girls_ratio}%
          </p>
          <p className="text-xs text-pink-600 font-bold">
            {meStats.total_girls} Girls • Enforced Gender Parity
          </p>
        </div>

        <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>Institutions & Provinces</span>
            <Building2 className="w-5 h-5 text-amber-600" />
          </div>
          <p className="text-3xl font-black text-slate-900 font-mono">
            {meStats.institutions_reached} <span className="text-xs font-medium text-slate-400">Schools</span>
          </p>
          <p className="text-xs text-amber-600 font-bold">
            Across {meStats.provinces_covered} Administrative Provinces
          </p>
        </div>
      </div>

      {/* 3. Authorized Executive Auditors Panel */}
      <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h4 className="text-base font-black text-slate-900 flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Approved Executive Financial Auditors (Master Admin Authorized)</span>
            </h4>
            <p className="text-xs text-slate-500">
              Only executive members authorized by Master Admin ({MASTER_ADMIN_EMAILS[0]}) are granted download privileges for the full financial & M&E ledger.
            </p>
          </div>
          <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-bold">
            {auditors.filter(a => a.is_active).length} Active Auditors
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {auditors.map(auditor => (
            <div 
              key={auditor.id} 
              className={cn(
                "p-4 rounded-2xl border transition-all flex items-start justify-between gap-3",
                auditor.is_active 
                  ? "bg-slate-50 border-slate-200" 
                  : "bg-slate-100/60 border-slate-200 opacity-60"
              )}
            >
              <div className="space-y-1">
                <div className="flex items-center space-x-1.5">
                  <span className="font-bold text-xs text-slate-900">{auditor.name}</span>
                  {auditor.is_active ? (
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-md">Authorized</span>
                  ) : (
                    <span className="px-2 py-0.5 bg-slate-200 text-slate-600 text-[10px] font-bold rounded-md">Revoked</span>
                  )}
                </div>
                <p className="text-[11px] font-mono text-slate-600">{auditor.email}</p>
                <p className="text-[10px] text-slate-400">
                  Role: {auditor.title} • By: {auditor.authorized_by}
                </p>
              </div>

              {isMasterAdmin && auditor.is_active && !MASTER_ADMIN_EMAILS.includes(auditor.email.toLowerCase()) && (
                <button
                  onClick={() => handleRevokeAuditor(auditor.email)}
                  className="text-[10px] font-bold text-red-600 hover:text-red-800 hover:underline shrink-0"
                >
                  Revoke
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 4. Filters & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: 'all', label: 'All Modules' },
            { id: 'events', label: 'Bootcamps & Events' },
            { id: 'competitions', label: 'Competitions' },
            { id: 'donations', label: 'Grants & Sponsors' },
            { id: 'lms', label: 'Subscriptions' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setCategoryFilter(tab.id)}
              className={cn(
                "px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer",
                categoryFilter === tab.id 
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-200" 
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-80">
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search ref ID, payee, school..."
            className="w-full bg-white border border-slate-200 rounded-2xl py-2.5 pl-10 pr-4 text-xs font-medium text-slate-800 focus:outline-none focus:border-indigo-600 shadow-sm"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        </div>
      </div>

      {/* 5. Centralized Audit Ledger Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-600">
            Official Audit Transaction Registry ({filteredEntries.length} Records)
          </h4>
          <span className="text-[11px] text-slate-500 font-bold">
            Auditing Framework: ISO / IFRS for Non-Profit STEM Entities
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100/70 text-slate-600 font-black uppercase text-[10px] tracking-wider border-b border-slate-200">
                <th className="py-3 px-4">Date & Ref ID</th>
                <th className="py-3 px-4">Transaction / Module</th>
                <th className="py-3 px-4">Payer / Beneficiary Institution</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Payment & Method</th>
                <th className="py-3 px-4">M&E Impact Scope</th>
                <th className="py-3 px-4">Approval Sign-off</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredEntries.map(entry => (
                <tr key={entry.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 space-y-0.5">
                    <p className="font-mono text-slate-900 font-bold">{entry.reference_id}</p>
                    <p className="text-[10px] text-slate-400">
                      {new Date(entry.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </td>

                  <td className="py-3.5 px-4 space-y-0.5">
                    <p className="font-bold text-slate-900">{entry.title}</p>
                    <span className="inline-block px-2 py-0.5 rounded-md text-[9px] font-black uppercase bg-indigo-50 text-indigo-700">
                      {entry.source_module}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 space-y-0.5">
                    <p className="font-bold text-slate-900">{entry.payer_name}</p>
                    <p className="text-[10px] text-slate-500">{entry.school_institution} {entry.province ? `• ${entry.province}` : ''}</p>
                    {entry.payer_email && <p className="text-[10px] text-slate-400">{entry.payer_email}</p>}
                  </td>

                  <td className="py-3.5 px-4 font-mono font-black text-emerald-700 text-sm">
                    ${entry.amount.toFixed(2)} <span className="text-[10px] font-normal text-slate-500">{entry.currency}</span>
                  </td>

                  <td className="py-3.5 px-4 space-y-0.5">
                    <span className={cn(
                      "px-2 py-0.5 rounded-md text-[10px] font-bold",
                      entry.payment_status === 'verified' || entry.payment_status === 'audited'
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-amber-100 text-amber-800"
                    )}>
                      {entry.payment_status.toUpperCase()}
                    </span>
                    <p className="text-[10px] text-slate-500 truncate max-w-[140px]">{entry.payment_method}</p>
                  </td>

                  <td className="py-3.5 px-4 space-y-0.5">
                    <p className="text-slate-900 font-bold">{entry.beneficiaries_count || 1} Beneficiaries</p>
                    <p className="text-[10px] text-pink-600 font-bold">
                      {entry.girls_count || 0}G / {entry.boys_count || 0}B
                    </p>
                    {entry.sdg_targets && entry.sdg_targets.length > 0 && (
                      <p className="text-[9px] text-slate-400 truncate max-w-[160px]">{entry.sdg_targets.join(', ')}</p>
                    )}
                  </td>

                  <td className="py-3.5 px-4 space-y-0.5">
                    {entry.approval_status === 'approved' ? (
                      <div>
                        <span className="inline-flex items-center space-x-1 text-emerald-700 font-bold text-[10px]">
                          <Check className="w-3 h-3" />
                          <span>Approved</span>
                        </span>
                        <p className="text-[9px] text-slate-500 truncate max-w-[130px]">{entry.approved_by || 'Executive Board'}</p>
                      </div>
                    ) : (
                      <span className="px-2 py-0.5 bg-amber-50 text-amber-700 rounded-md text-[10px] font-bold">
                        Pending Sign-off
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Authorize Executive Auditor */}
      <AnimatePresence>
        {showAddAuditorModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-2">
                  <UserCheck className="w-5 h-5 text-indigo-600" />
                  <h3 className="font-black text-lg text-slate-900">Authorize Executive Auditor</h3>
                </div>
                <button 
                  onClick={() => setShowAddAuditorModal(false)}
                  className="p-1 rounded-xl text-slate-400 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                Approve an executive member to download and export the official YARA M&E Financial Audit Ledger.
              </p>

              <form onSubmit={handleAddAuditor} className="space-y-4">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase">Executive Member Name *</label>
                  <input
                    type="text"
                    required
                    value={auditorForm.name}
                    onChange={e => setAuditorForm({ ...auditorForm, name: e.target.value })}
                    placeholder="e.g. Tendai Chipo / Finance Trustee"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase">Member Email Address *</label>
                  <input
                    type="email"
                    required
                    value={auditorForm.email}
                    onChange={e => setAuditorForm({ ...auditorForm, email: e.target.value })}
                    placeholder="executive@yaria.org"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-mono text-slate-900 focus:outline-none focus:border-indigo-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase">Official Title</label>
                  <input
                    type="text"
                    value={auditorForm.title}
                    onChange={e => setAuditorForm({ ...auditorForm, title: e.target.value })}
                    placeholder="e.g. Executive Board Treasurer"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-medium text-slate-900 focus:outline-none focus:border-indigo-600"
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddAuditorModal(false)}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingAuditor}
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md disabled:opacity-50"
                  >
                    {isSubmittingAuditor ? "Authorizing..." : "Grant Authorization"}
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
