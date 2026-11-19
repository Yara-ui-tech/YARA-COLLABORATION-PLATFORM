import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  AlertOctagon, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Search, 
  Filter, 
  MessageSquare, 
  Send, 
  FileText, 
  Eye, 
  EyeOff, 
  RefreshCw, 
  UserCheck, 
  Building2, 
  LogOut,
  Calendar,
  X,
  History
} from 'lucide-react';
import SafeguardingNav from '../../components/safeguarding/SafeguardingNav';
import EmergencyHelpBanner from '../../components/safeguarding/EmergencyHelpBanner';
import { safeguardingService } from '../../services/safeguardingService';
import { 
  SafeguardingReport, 
  SafeguardingMessage, 
  SafeguardingCaseNote, 
  SafeguardingAuditLog,
  ReportStatus,
  ReportPriority
} from '../../types/safeguarding';

const SafeguardingAdminDashboard: React.FC = () => {
  // Authentication PIN Gate
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [pinInput, setPinInput] = useState<string>('');
  const [authError, setAuthError] = useState<string | null>(null);

  // Data states
  const [reports, setReports] = useState<SafeguardingReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedReport, setSelectedReport] = useState<SafeguardingReport | null>(null);
  
  // Case Detail Drawer states
  const [messages, setMessages] = useState<SafeguardingMessage[]>([]);
  const [caseNotes, setCaseNotes] = useState<SafeguardingCaseNote[]>([]);
  const [auditLogs, setAuditLogs] = useState<SafeguardingAuditLog[]>([]);
  const [loadingCaseDetails, setLoadingCaseDetails] = useState(false);

  // Action Form states
  const [newOfficerMessage, setNewOfficerMessage] = useState('');
  const [newInternalNote, setNewInternalNote] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Check existing session
  useEffect(() => {
    const savedPin = sessionStorage.getItem('yara_safeguarding_officer_token');
    if (savedPin === 'YARA-SAFE-2026') {
      setIsAuthenticated(true);
      loadDashboardData();
    }
  }, []);

  const handlePinAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (safeguardingService.verifyOfficerPin(pinInput.trim())) {
      sessionStorage.setItem('yara_safeguarding_officer_token', 'YARA-SAFE-2026');
      setIsAuthenticated(true);
      setAuthError(null);
      loadDashboardData();
    } else {
      setAuthError('Access Denied. Invalid Safeguarding Officer Authorization Key.');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('yara_safeguarding_officer_token');
    setIsAuthenticated(false);
    setSelectedReport(null);
    setPinInput('');
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const data = await safeguardingService.getAllReports();
      setReports(data);
    } catch (err) {
      console.error('Failed to load safeguarding reports', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectReport = async (report: SafeguardingReport) => {
    setSelectedReport(report);
    setLoadingCaseDetails(true);
    try {
      const [msgs, notes, logs] = await Promise.all([
        safeguardingService.getMessages(report.id),
        safeguardingService.getCaseNotes(report.id),
        safeguardingService.getAuditLogs(report.id)
      ]);
      setMessages(msgs);
      setCaseNotes(notes);
      setAuditLogs(logs);

      // Audit log view
      await safeguardingService.logAuditAction(
        report.id,
        'VIEW_CASE',
        'Chief Safeguarding Officer',
        'Authorized review of sensitive report details'
      );
    } catch (err) {
      console.error('Failed to load case specifics', err);
    } finally {
      setLoadingCaseDetails(false);
    }
  };

  const handleStatusChange = async (newStatus: ReportStatus) => {
    if (!selectedReport) return;
    setUpdatingStatus(true);
    try {
      const updated = await safeguardingService.updateReportStatus(
        selectedReport.id,
        newStatus,
        'Chief Safeguarding Officer'
      );
      if (updated) {
        setSelectedReport(updated);
        setReports(prev => prev.map(r => r.id === updated.id ? updated : r));
        showToast(`Case status updated to ${newStatus.toUpperCase()}`);
        
        // Refresh audit logs
        const logs = await safeguardingService.getAuditLogs(updated.id);
        setAuditLogs(logs);
      }
    } catch (err) {
      console.error('Status update failed', err);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handlePriorityChange = async (newPriority: ReportPriority) => {
    if (!selectedReport) return;
    try {
      const updated = await safeguardingService.updateReportPriority(
        selectedReport.id,
        newPriority,
        'Chief Safeguarding Officer'
      );
      if (updated) {
        setSelectedReport(updated);
        setReports(prev => prev.map(r => r.id === updated.id ? updated : r));
        showToast(`Priority adjusted to ${newPriority.toUpperCase()}`);
      }
    } catch (err) {
      console.error('Priority update failed', err);
    }
  };

  const handleSendOfficerMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReport || !newOfficerMessage.trim()) return;

    try {
      const msg = await safeguardingService.postMessage({
        report_id: selectedReport.id,
        sender_type: 'officer',
        sender_name: 'Safeguarding Directorate',
        message: newOfficerMessage.trim()
      });

      if (msg) {
        setMessages(prev => [...prev, msg]);
        setNewOfficerMessage('');
        showToast('Official response published to reporter tracking portal');
      }
    } catch (err) {
      console.error('Failed to send message', err);
    }
  };

  const handleAddInternalNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReport || !newInternalNote.trim()) return;

    try {
      const note = await safeguardingService.addCaseNote(
        selectedReport.id,
        'Chief Safeguarding Officer',
        newInternalNote.trim(),
        true
      );

      if (note) {
        setCaseNotes(prev => [...prev, note]);
        setNewInternalNote('');
        showToast('Internal confidential note appended to case ledger');
      }
    } catch (err) {
      console.error('Failed to add note', err);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Metrics computation
  const totalCases = reports.length;
  const criticalCases = reports.filter(r => r.priority === 'critical' || r.is_immediate_danger).length;
  const minorsAtRisk = reports.filter(r => r.is_minor_at_risk).length;
  const openCases = reports.filter(r => r.status !== 'closed').length;

  const filteredReports = reports.filter(r => {
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || r.priority === priorityFilter;
    const matchesCategory = categoryFilter === 'all' || r.category === categoryFilter;
    const matchesSearch = 
      r.case_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.incident_description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.location_or_chapter && r.location_or_chapter.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesStatus && matchesPriority && matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#F8FAFF] text-[#1E293B]">
      <EmergencyHelpBanner />
      <SafeguardingNav />

      {/* Top Banner */}
      <section className="bg-[#0A1B4D] text-white py-8 px-4 sm:px-6 lg:px-8 border-b border-white/10">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[#00C6FF] text-xs font-bold uppercase tracking-wider mb-1">
              <Lock className="w-4 h-4" />
              Restricted Officer Console • Section 12 Child Protection Act (Zimbabwe)
            </div>
            <h1 className="text-2xl sm:text-3xl font-black">
              Safeguarding Incident Triage & Oversight
            </h1>
          </div>

          {isAuthenticated && (
            <div className="flex items-center gap-3">
              <button
                onClick={loadDashboardData}
                className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white flex items-center gap-1.5 transition-colors"
                title="Refresh Records"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <button
                onClick={handleLogout}
                className="px-3.5 py-2 rounded-xl bg-rose-600/80 hover:bg-rose-700 text-xs font-bold text-white flex items-center gap-1.5 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                Lock Console
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-[#0A1B4D] text-white border border-[#00C6FF] shadow-2xl flex items-center gap-3 text-xs font-bold animate-slide-up">
            <CheckCircle2 className="w-4 h-4 text-[#00C6FF]" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* PIN Authentication Gate */}
        {!isAuthenticated ? (
          <div className="max-w-md mx-auto py-16">
            <div className="bg-white rounded-3xl border border-[#CBD5E1] p-8 shadow-xl text-center">
              <div className="w-16 h-16 rounded-3xl bg-blue-50 text-[#0D47A1] border border-blue-200 flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-black text-[#0A1B4D] mb-2">Officer Access Gate</h2>
              <p className="text-xs text-slate-600 mb-6 leading-relaxed">
                Enter your designated Safeguarding Directorate credential to decrypt and review submitted incidents. General administrative accounts cannot view confidential victim reports.
              </p>

              {authError && (
                <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold">
                  {authError}
                </div>
              )}

              <form onSubmit={handlePinAuth} className="space-y-4">
                <div>
                  <input
                    type="password"
                    required
                    value={pinInput}
                    onChange={e => setPinInput(e.target.value)}
                    placeholder="Enter Safeguarding Officer PIN"
                    className="w-full text-center tracking-widest text-base font-mono px-4 py-3 rounded-xl border border-[#CBD5E1] bg-white text-[#1E293B] focus:ring-2 focus:ring-[#00C6FF]"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">Default Officer Key: <code className="text-slate-600 font-mono">YARA-SAFE-2026</code></p>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-[#0D47A1] text-white font-bold text-xs hover:bg-[#0A1B4D] transition-colors shadow"
                >
                  Authorize Console Access
                </button>
              </form>
            </div>
          </div>
        ) : (
          /* Authenticated Dashboard Workspace */
          <div className="space-y-8">
            
            {/* Metric KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-[#CBD5E1] shadow-sm">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Reports</span>
                <p className="text-3xl font-black text-[#0A1B4D] mt-1">{totalCases}</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-[#CBD5E1] shadow-sm">
                <span className="text-xs font-bold text-rose-600 uppercase tracking-wider">Critical / Danger</span>
                <p className="text-3xl font-black text-rose-600 mt-1">{criticalCases}</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-[#CBD5E1] shadow-sm">
                <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">Minors At Risk</span>
                <p className="text-3xl font-black text-amber-600 mt-1">{minorsAtRisk}</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-[#CBD5E1] shadow-sm">
                <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Active Investigations</span>
                <p className="text-3xl font-black text-emerald-600 mt-1">{openCases}</p>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="bg-white rounded-2xl border border-[#CBD5E1] p-4 shadow-sm flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search case reference, description keywords, location..."
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[#CBD5E1] bg-white text-[#1E293B] focus:ring-2 focus:ring-[#00C6FF]"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="px-3 py-2 text-xs rounded-xl border border-[#CBD5E1] bg-white text-[#1E293B]"
                >
                  <option value="all">All Statuses</option>
                  <option value="new">New Reports</option>
                  <option value="under_review">Under Review</option>
                  <option value="investigating">Investigating</option>
                  <option value="action_taken">Action Taken</option>
                  <option value="referred_to_authorities">Referred to Authorities</option>
                  <option value="closed">Closed Cases</option>
                </select>

                <select
                  value={priorityFilter}
                  onChange={e => setPriorityFilter(e.target.value)}
                  className="px-3 py-2 text-xs rounded-xl border border-[#CBD5E1] bg-white text-[#1E293B]"
                >
                  <option value="all">All Priorities</option>
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>

            {/* Main Split Layout: Report Table & Case Inspector */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Reports Table List (Left 7 Cols) */}
              <div className="lg:col-span-7 bg-white rounded-3xl border border-[#CBD5E1] p-5 shadow-sm overflow-hidden">
                <h3 className="text-base font-black text-[#0A1B4D] mb-4">
                  Incoming Incident Ledger ({filteredReports.length})
                </h3>

                {loading ? (
                  <div className="py-16 text-center">
                    <div className="w-8 h-8 border-4 border-[#0D47A1] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    <p className="text-xs text-slate-500">Decrypting reports...</p>
                  </div>
                ) : filteredReports.length === 0 ? (
                  <div className="py-12 text-center text-slate-500 text-xs">
                    No incident reports match current search parameters.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {filteredReports.map(rep => {
                      const isSelected = selectedReport?.id === rep.id;
                      return (
                        <div
                          key={rep.id}
                          onClick={() => handleSelectReport(rep)}
                          className={`p-4 rounded-2xl cursor-pointer transition-all my-1.5 ${
                            isSelected 
                              ? 'bg-[#E8F4FF] border border-[#0D47A1]' 
                              : 'hover:bg-slate-50 border border-transparent'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2 mb-1.5">
                            <span className="font-mono text-xs font-bold text-[#0D47A1]">
                              {rep.case_number}
                            </span>
                            <div className="flex items-center gap-1.5">
                              {rep.is_minor_at_risk || rep.is_child_at_risk ? (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900">
                                  Minor at Risk
                                </span>
                              ) : null}
                              {rep.is_immediate_danger && (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-900 animate-pulse">
                                  Danger
                                </span>
                              )}
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                rep.priority === 'critical' ? 'bg-red-600 text-white' :
                                rep.priority === 'high' ? 'bg-orange-500 text-white' :
                                rep.priority === 'medium' ? 'bg-blue-100 text-blue-900' :
                                'bg-slate-100 text-slate-800'
                              }`}>
                                {rep.priority}
                              </span>
                            </div>
                          </div>

                          <p className="text-xs font-bold text-[#0A1B4D] capitalize mb-1">
                            {rep.category.replace(/_/g, ' ')}
                          </p>
                          <p className="text-xs text-slate-600 line-clamp-2 mb-2 leading-relaxed">
                            {rep.incident_description}
                          </p>

                          <div className="flex items-center justify-between text-[11px] text-slate-400">
                            <span>
                              {rep.is_anonymous ? '🔒 Anonymous Reporter' : `👤 Identified: ${rep.reporter_name || 'Contact Attached'}`}
                            </span>
                            <span>{new Date(rep.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Case Detail Inspector (Right 5 Cols) */}
              <div className="lg:col-span-5 bg-white rounded-3xl border border-[#CBD5E1] p-6 shadow-sm flex flex-col justify-between">
                {!selectedReport ? (
                  <div className="py-24 text-center text-slate-400">
                    <Eye className="w-12 h-12 mx-auto mb-3 opacity-40" />
                    <p className="text-sm font-bold text-slate-600 mb-1">Select an incident to investigate</p>
                    <p className="text-xs text-slate-400 max-w-xs mx-auto">
                      Click any case from the left ledger to review full testimony, update triage milestone, and send encrypted messages.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Header */}
                    <div className="border-b border-[#CBD5E1] pb-4">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono text-sm font-black text-[#0D47A1]">
                          {selectedReport.case_number}
                        </span>
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                          {selectedReport.status.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <h4 className="text-base font-black text-[#0A1B4D] capitalize">
                        {selectedReport.category.replace(/_/g, ' ')}
                      </h4>
                    </div>

                    {/* Triage Status & Priority Controls */}
                    <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                          Case Status
                        </label>
                        <select
                          disabled={updatingStatus}
                          value={selectedReport.status}
                          onChange={e => handleStatusChange(e.target.value as ReportStatus)}
                          className="w-full py-1.5 px-2 text-xs rounded-lg border border-[#CBD5E1] bg-white font-bold text-[#0A1B4D]"
                        >
                          <option value="new">New</option>
                          <option value="under_review">Under Review</option>
                          <option value="investigating">Investigating</option>
                          <option value="action_taken">Action Taken</option>
                          <option value="referred_to_authorities">Referred to Police/Ministry</option>
                          <option value="closed">Closed</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                          Risk Priority
                        </label>
                        <select
                          value={selectedReport.priority}
                          onChange={e => handlePriorityChange(e.target.value as ReportPriority)}
                          className="w-full py-1.5 px-2 text-xs rounded-lg border border-[#CBD5E1] bg-white font-bold text-[#0A1B4D]"
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                          <option value="critical">Critical</option>
                        </select>
                      </div>
                    </div>

                    {/* Reporter Identity Info */}
                    <div className="p-3.5 rounded-2xl bg-[#E8F4FF] border border-blue-200 text-xs text-[#0A1B4D]">
                      <span className="font-bold block mb-1">Reporter Disclosure Mode:</span>
                      {selectedReport.is_anonymous ? (
                        <p className="text-slate-600">
                          🔒 <strong>Strictly Anonymous.</strong> No email, telephone number, or user account was collected. Reporter tracks via their secret token.
                        </p>
                      ) : (
                        <div className="space-y-1">
                          <p><strong>Name:</strong> {selectedReport.reporter_name || 'Not provided'}</p>
                          <p><strong>Email:</strong> {selectedReport.reporter_email || 'Not provided'}</p>
                          <p><strong>Phone:</strong> {selectedReport.reporter_phone || 'Not provided'}</p>
                          <p><strong>Relationship to YARA:</strong> {selectedReport.reporter_relationship || 'Unspecified'}</p>
                        </div>
                      )}
                    </div>

                    {/* Full Incident Testimony */}
                    <div>
                      <span className="text-xs font-bold text-[#0A1B4D] uppercase tracking-wider block mb-1">
                        Incident Description & Facts
                      </span>
                      <div className="p-3.5 rounded-2xl bg-white border border-[#CBD5E1] text-xs text-slate-700 leading-relaxed max-h-48 overflow-y-auto whitespace-pre-wrap">
                        {selectedReport.incident_description}
                      </div>
                      {selectedReport.location_or_chapter && (
                        <p className="text-xs text-slate-500 mt-2">
                          <strong>Location / Chapter:</strong> {selectedReport.location_or_chapter}
                        </p>
                      )}
                    </div>

                    {/* Officer Two-Way Communication */}
                    <div className="border-t border-[#CBD5E1] pt-4">
                      <h5 className="text-xs font-bold text-[#0A1B4D] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5 text-[#1976D2]" />
                        Secure Reporter Communications ({messages.length})
                      </h5>

                      {/* Message Thread */}
                      <div className="space-y-2 max-h-40 overflow-y-auto mb-3 p-2 bg-slate-50 rounded-xl border border-slate-200">
                        {messages.length === 0 ? (
                          <p className="text-[11px] text-slate-400 text-center py-2">
                            No direct messages exchanged yet.
                          </p>
                        ) : (
                          messages.map(m => (
                            <div 
                              key={m.id} 
                              className={`p-2 rounded-lg text-xs ${
                                m.sender_type === 'officer' 
                                  ? 'bg-[#E8F4FF] border border-blue-200 text-[#0A1B4D] ml-4' 
                                  : 'bg-white border border-slate-200 text-slate-800 mr-4'
                              }`}
                            >
                              <div className="flex justify-between text-[10px] text-slate-400 mb-0.5">
                                <span className="font-bold">{m.sender_name || m.sender_display_name}</span>
                                <span>{new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                              </div>
                              <p className="text-xs">{m.message}</p>
                            </div>
                          ))
                        )}
                      </div>

                      {/* Send Message */}
                      <form onSubmit={handleSendOfficerMessage} className="flex gap-2">
                        <input
                          type="text"
                          value={newOfficerMessage}
                          onChange={e => setNewOfficerMessage(e.target.value)}
                          placeholder="Send message to reporter via their tracking PIN..."
                          className="flex-1 px-3 py-2 text-xs rounded-xl border border-[#CBD5E1] bg-white text-[#1E293B] focus:ring-2 focus:ring-[#00C6FF]"
                        />
                        <button
                          type="submit"
                          className="px-3 py-2 rounded-xl bg-[#0D47A1] text-white text-xs font-bold hover:bg-[#0A1B4D] transition-colors"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </button>
                      </form>
                    </div>

                    {/* Internal Case Notes */}
                    <div className="border-t border-[#CBD5E1] pt-4">
                      <h5 className="text-xs font-bold text-[#0A1B4D] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-amber-600" />
                        Confidential Case Notes (Officer Only)
                      </h5>

                      <div className="space-y-1.5 max-h-32 overflow-y-auto mb-3">
                        {caseNotes.map(n => (
                          <div key={n.id} className="p-2 rounded-lg bg-amber-50/70 border border-amber-200 text-[11px] text-amber-950">
                            <span className="font-bold block">{n.officer_name} ({new Date(n.created_at).toLocaleDateString()}):</span>
                            <span>{n.note || n.note_text}</span>
                          </div>
                        ))}
                      </div>

                      <form onSubmit={handleAddInternalNote} className="flex gap-2">
                        <input
                          type="text"
                          value={newInternalNote}
                          onChange={e => setNewInternalNote(e.target.value)}
                          placeholder="Add internal investigation observation..."
                          className="flex-1 px-3 py-2 text-xs rounded-xl border border-[#CBD5E1] bg-white text-[#1E293B] focus:ring-2 focus:ring-amber-500"
                        />
                        <button
                          type="submit"
                          className="px-3 py-2 rounded-xl bg-amber-600 text-white text-xs font-bold hover:bg-amber-700 transition-colors"
                        >
                          Log Note
                        </button>
                      </form>
                    </div>

                    {/* Audit Logs */}
                    <div className="border-t border-[#CBD5E1] pt-3 text-[10px] text-slate-400">
                      <div className="flex items-center gap-1 mb-1 font-bold text-slate-500">
                        <History className="w-3 h-3" />
                        <span>Audit Log Trail:</span>
                      </div>
                      <div className="space-y-0.5 max-h-20 overflow-y-auto">
                        {auditLogs.map(l => (
                          <div key={l.id}>
                            • {new Date(l.created_at || l.timestamp || '').toLocaleTimeString()}: {l.action} by {l.performed_by || l.officer_name}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default SafeguardingAdminDashboard;