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
  Building2, 
  LogOut,
  Calendar,
  X,
  History,
  Plus,
  Trash2,
  ExternalLink,
  Image as ImageIcon,
  Link as LinkIcon,
  PhoneCall,
  Download,
  Users,
  Megaphone,
  Handshake,
  Paperclip
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
  ReportPriority,
  SafeguardingResource,
  SafeguardingCampaign,
  SafeguardingPartner,
  SafeguardingEmergencyContact
} from '../../types/safeguarding';

type AdminTab = 'cases' | 'resources' | 'campaigns' | 'partners' | 'helplines';

const SafeguardingAdminDashboard: React.FC = () => {
  // Authentication PIN Gate
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [pinInput, setPinInput] = useState<string>('');
  const [authError, setAuthError] = useState<string | null>(null);

  // Active Tab
  const [activeTab, setActiveTab] = useState<AdminTab>('cases');

  // Data states
  const [reports, setReports] = useState<SafeguardingReport[]>([]);
  const [resources, setResources] = useState<SafeguardingResource[]>([]);
  const [campaigns, setCampaigns] = useState<SafeguardingCampaign[]>([]);
  const [partners, setPartners] = useState<SafeguardingPartner[]>([]);
  const [helplines, setHelplines] = useState<SafeguardingEmergencyContact[]>([]);
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
  const [newEvidenceUrl, setNewEvidenceUrl] = useState('');
  const [newEvidenceLabel, setNewEvidenceLabel] = useState('');

  // Modals for adding docs, campaigns, partners, helplines
  const [showAddResourceModal, setShowAddResourceModal] = useState(false);
  const [showAddCampaignModal, setShowAddCampaignModal] = useState(false);
  const [showAddPartnerModal, setShowAddPartnerModal] = useState(false);
  const [showAddHelplineModal, setShowAddHelplineModal] = useState(false);

  // New Resource Form
  const [resourceForm, setResourceForm] = useState({
    title: '',
    category: 'Child Protection Policy',
    description: '',
    format: 'PDF',
    version: '2026.1',
    file_url: '',
    file_size: '1.2 MB',
    target_audience: 'Mentors, Teachers, Students, Volunteers'
  });

  // New Campaign Form
  const [campaignForm, setCampaignForm] = useState({
    title: '',
    category: 'GBV Prevention & Digital Safety',
    description: '',
    banner_image: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    location: 'Nationwide & Regional Chapters',
    target_audience: 'Youth & Mentors',
    registration_link: '',
    status: 'active' as const
  });

  // New Partner Form
  const [partnerForm, setPartnerForm] = useState({
    name: '',
    partner_type: 'Child Rights & Wellbeing NGO',
    description: '',
    logo_url: '',
    website: '',
    collaboration_scope: 'Immediate referral, crisis counselling & legal shelter',
    contact_person: '',
    contact_email: '',
    contact_phone: '',
    country: 'Zimbabwe'
  });

  // New Helpline Form
  const [helplineForm, setHelplineForm] = useState({
    name: '',
    phone: '',
    category: 'child_protection' as const,
    toll_free: true,
    available_hours: '24/7 Hours',
    description: '',
    website: '',
    location: 'National Hotline (Zimbabwe)'
  });

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
      loadAllData();
    }
  }, []);

  const handlePinAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (safeguardingService.verifyOfficerPin(pinInput.trim())) {
      sessionStorage.setItem('yara_safeguarding_officer_token', 'YARA-SAFE-2026');
      setIsAuthenticated(true);
      setAuthError(null);
      loadAllData();
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

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [allReports, allResources, allCampaigns, allPartners, allHelplines] = await Promise.all([
        safeguardingService.getAllReports(),
        safeguardingService.getResources(),
        safeguardingService.getCampaigns(),
        safeguardingService.getPartners(),
        safeguardingService.getEmergencyContacts()
      ]);
      setReports(allReports);
      setResources(allResources);
      setCampaigns(allCampaigns);
      setPartners(allPartners);
      setHelplines(allHelplines);
    } catch (err) {
      console.error('Failed to load safeguarding data', err);
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

  const handleAttachEvidenceUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReport || !newEvidenceUrl.trim()) return;

    try {
      const ok = await safeguardingService.addCaseEvidenceUrl(
        selectedReport.id, 
        newEvidenceUrl.trim(), 
        newEvidenceLabel.trim() || undefined
      );
      if (ok) {
        setSelectedReport(prev => prev ? {
          ...prev,
          evidence_urls: [...(prev.evidence_urls || []), newEvidenceUrl.trim()]
        } : null);
        setNewEvidenceUrl('');
        setNewEvidenceLabel('');
        showToast('Evidence link securely attached to case file');
      }
    } catch (err) {
      console.error('Failed to attach evidence URL', err);
    }
  };

  // Add Policy / Doc
  const handleCreateResource = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const created = await safeguardingService.addResource({
        title: resourceForm.title,
        category: resourceForm.category,
        description: resourceForm.description,
        format: resourceForm.format,
        version: resourceForm.version,
        file_url: resourceForm.file_url || 'https://drive.google.com/file/d/sample-yara-safeguarding/view',
        file_size: resourceForm.file_size,
        approval_status: 'approved',
        approved_by: 'Safeguarding Board',
        review_date: '2027-01-01',
        target_audience: resourceForm.target_audience.split(',').map(s => s.trim())
      });
      setResources(prev => [created, ...prev]);
      setShowAddResourceModal(false);
      setResourceForm({
        title: '',
        category: 'Child Protection Policy',
        description: '',
        format: 'PDF',
        version: '2026.1',
        file_url: '',
        file_size: '1.2 MB',
        target_audience: 'Mentors, Teachers, Students, Volunteers'
      });
      showToast('New safeguarding policy/document published successfully');
    } catch (err) {
      console.error('Failed to add resource', err);
    }
  };

  const handleDeleteResource = async (id: string) => {
    if (!confirm('Are you sure you want to remove this published safeguarding resource?')) return;
    await safeguardingService.deleteResource(id);
    setResources(prev => prev.filter(r => r.id !== id));
    showToast('Resource removed from portal');
  };

  // Add Campaign / Media
  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const created = await safeguardingService.addCampaign({
        title: campaignForm.title,
        category: campaignForm.category,
        description: campaignForm.description,
        banner_image: campaignForm.banner_image || 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=80',
        cover_image: campaignForm.banner_image || 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=80',
        start_date: campaignForm.start_date,
        end_date: campaignForm.end_date,
        venue: campaignForm.location,
        location: campaignForm.location,
        target_audience: campaignForm.target_audience,
        registration_link: campaignForm.registration_link || 'https://yaria.tech/safeguarding/campaigns',
        status: campaignForm.status
      });
      setCampaigns(prev => [created, ...prev]);
      setShowAddCampaignModal(false);
      setCampaignForm({
        title: '',
        category: 'GBV Prevention & Digital Safety',
        description: '',
        banner_image: '',
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
        location: 'Nationwide & Regional Chapters',
        target_audience: 'Youth & Mentors',
        registration_link: '',
        status: 'active'
      });
      showToast('Campaign initiative published with media assets');
    } catch (err) {
      console.error('Failed to add campaign', err);
    }
  };

  const handleDeleteCampaign = async (id: string) => {
    if (!confirm('Delete this awareness campaign?')) return;
    await safeguardingService.deleteCampaign(id);
    setCampaigns(prev => prev.filter(c => c.id !== id));
    showToast('Campaign archived');
  };

  // Add Partner
  const handleCreatePartner = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const created = await safeguardingService.addPartner({
        name: partnerForm.name,
        partner_type: partnerForm.partner_type,
        type: partnerForm.partner_type,
        description: partnerForm.description,
        logo_url: partnerForm.logo_url || 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?auto=format&fit=crop&w=400&q=80',
        website: partnerForm.website || 'https://yaria.tech/safeguarding',
        collaboration_scope: partnerForm.collaboration_scope,
        contact_person: partnerForm.contact_person,
        contact_email: partnerForm.contact_email,
        contact_phone: partnerForm.contact_phone,
        country: partnerForm.country,
        status: 'confirmed'
      });
      setPartners(prev => [created, ...prev]);
      setShowAddPartnerModal(false);
      setPartnerForm({
        name: '',
        partner_type: 'Child Rights & Wellbeing NGO',
        description: '',
        logo_url: '',
        website: '',
        collaboration_scope: 'Immediate referral, crisis counselling & legal shelter',
        contact_person: '',
        contact_email: '',
        contact_phone: '',
        country: 'Zimbabwe'
      });
      showToast('Institutional partner added to strategic safeguarding directory');
    } catch (err) {
      console.error('Failed to add partner', err);
    }
  };

  const handleDeletePartner = async (id: string) => {
    if (!confirm('Remove partner from referral directory?')) return;
    await safeguardingService.deletePartner(id);
    setPartners(prev => prev.filter(p => p.id !== id));
    showToast('Partner removed');
  };

  // Add Helpline
  const handleCreateHelpline = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const created = await safeguardingService.addEmergencyContact({
        name: helplineForm.name,
        phone: helplineForm.phone,
        category: helplineForm.category,
        toll_free: helplineForm.toll_free,
        available_hours: helplineForm.available_hours,
        availability: helplineForm.available_hours,
        description: helplineForm.description,
        website: helplineForm.website,
        location: helplineForm.location,
        is_verified: true
      });
      setHelplines(prev => [created, ...prev]);
      setShowAddHelplineModal(false);
      setHelplineForm({
        name: '',
        phone: '',
        category: 'child_protection',
        toll_free: true,
        available_hours: '24/7 Hours',
        description: '',
        website: '',
        location: 'National Hotline (Zimbabwe)'
      });
      showToast('Emergency contact added to crisis hotlines');
    } catch (err) {
      console.error('Failed to add helpline', err);
    }
  };

  const handleDeleteHelpline = async (id: string) => {
    if (!confirm('Remove this emergency contact?')) return;
    await safeguardingService.deleteEmergencyContact(id);
    setHelplines(prev => prev.filter(h => h.id !== id));
    showToast('Emergency helpline removed');
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Metrics computation
  const totalCases = reports.length;
  const criticalCases = reports.filter(r => r.priority === 'critical' || r.is_immediate_danger).length;
  const minorsAtRisk = reports.filter(r => r.is_minor_at_risk || r.is_child_at_risk).length;
  const openCases = reports.filter(r => r.status !== 'closed').length;

  const filteredReports = reports.filter(r => {
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || r.priority === priorityFilter;
    const matchesCategory = categoryFilter === 'all' || r.category === categoryFilter;
    const matchesSearch = 
      r.case_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.incident_description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.location_or_chapter && r.location_or_chapter.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (r.chapter_or_location && r.chapter_or_location.toLowerCase().includes(searchQuery.toLowerCase()));
    
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
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1976D2]/30 border border-[#00C6FF]/40 text-[#00C6FF] text-xs font-semibold uppercase tracking-wider mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              Confidential Oversight Console
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Safeguarding & Case Intelligence Directorate
            </h1>
            <p className="text-blue-100 text-sm mt-1 max-w-2xl">
              Strict access management for Child Protection, GBV incident investigations, statutory reporting, awareness campaigns, and policy distribution.
            </p>
          </div>

          {isAuthenticated && (
            <div className="flex items-center gap-3">
              <button
                onClick={loadAllData}
                disabled={loading}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition"
                title="Refresh datasets"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                Sync Data
              </button>
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-200 border border-red-400/30 text-xs font-semibold transition"
              >
                <LogOut className="w-3.5 h-3.5" />
                End Session
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {toastMessage && (
          <div className="fixed top-4 right-4 z-50 bg-[#0A1B4D] text-white px-5 py-3 rounded-xl shadow-2xl border border-[#00C6FF]/40 flex items-center gap-3 animate-fade-in">
            <CheckCircle2 className="w-5 h-5 text-[#00C6FF]" />
            <span className="text-sm font-medium">{toastMessage}</span>
          </div>
        )}

        {!isAuthenticated ? (
          /* AUTHENTICATION GATE */
          <div className="max-w-md mx-auto my-12 bg-white rounded-2xl shadow-xl border border-[#CBD5E1] p-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#E8F4FF] border border-[#1976D2]/30 flex items-center justify-center mx-auto mb-4 text-[#0D47A1]">
              <Lock className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-[#0A1B4D]">Safeguarding Officer Authorization</h2>
            <p className="text-xs text-slate-500 mt-2 mb-6">
              Enter your designated Officer Authorization Key to access privileged child protection ledgers, case investigations, and published documents.
            </p>

            <form onSubmit={handlePinAuth} className="space-y-4">
              <div>
                <input
                  type="password"
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  placeholder="Enter Officer PIN (e.g. YARA-SAFE-2026)"
                  className="w-full px-4 py-3 text-center text-base tracking-widest font-mono rounded-xl border border-[#CBD5E1] bg-white text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-[#1976D2]"
                  required
                />
              </div>

              {authError && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-[#0D47A1] hover:bg-[#0A1B4D] text-white font-semibold text-sm transition shadow-lg shadow-blue-900/20"
              >
                Unlock Directorate Console
              </button>

              <div className="pt-3">
                <button
                  type="button"
                  onClick={() => {
                    setPinInput('YARA-SAFE-2026');
                  }}
                  className="text-xs text-[#1976D2] hover:underline font-medium"
                >
                  Quick Fill Default Officer Key (YARA-SAFE-2026)
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* AUTHENTICATED MANAGEMENT CONSOLE */
          <div className="space-y-8">
            {/* KPI METRIC CARDS */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              <div className="bg-white p-4 rounded-xl border border-[#CBD5E1] shadow-sm">
                <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase">
                  <span>Total Reports</span>
                  <FileText className="w-4 h-4 text-[#1976D2]" />
                </div>
                <div className="text-2xl font-black text-[#0A1B4D] mt-2">{totalCases}</div>
                <div className="text-[11px] text-slate-500 mt-0.5">{openCases} active investigations</div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-[#CBD5E1] shadow-sm">
                <div className="flex items-center justify-between text-red-600 text-xs font-semibold uppercase">
                  <span>Critical Danger</span>
                  <AlertOctagon className="w-4 h-4" />
                </div>
                <div className="text-2xl font-black text-red-600 mt-2">{criticalCases}</div>
                <div className="text-[11px] text-red-500 mt-0.5">Priority 1 immediate action</div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-[#CBD5E1] shadow-sm">
                <div className="flex items-center justify-between text-amber-600 text-xs font-semibold uppercase">
                  <span>Minors At Risk</span>
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div className="text-2xl font-black text-amber-600 mt-2">{minorsAtRisk}</div>
                <div className="text-[11px] text-amber-600 mt-0.5">Under age 18 cases</div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-[#CBD5E1] shadow-sm">
                <div className="flex items-center justify-between text-[#0D47A1] text-xs font-semibold uppercase">
                  <span>Published Docs</span>
                  <Download className="w-4 h-4" />
                </div>
                <div className="text-2xl font-black text-[#0D47A1] mt-2">{resources.length}</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Policies & toolkits</div>
              </div>

              <div className="col-span-2 sm:col-span-1 bg-white p-4 rounded-xl border border-[#CBD5E1] shadow-sm">
                <div className="flex items-center justify-between text-[#10B981] text-xs font-semibold uppercase">
                  <span>Partners & Hotlines</span>
                  <Handshake className="w-4 h-4" />
                </div>
                <div className="text-2xl font-black text-[#10B981] mt-2">{partners.length + helplines.length}</div>
                <div className="text-[11px] text-slate-500 mt-0.5">{campaigns.length} campaigns live</div>
              </div>
            </div>

            {/* TAB NAVIGATION */}
            <div className="flex flex-wrap items-center gap-2 border-b border-[#CBD5E1] pb-2">
              <button
                onClick={() => { setActiveTab('cases'); setSelectedReport(null); }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition ${
                  activeTab === 'cases'
                    ? 'bg-[#0D47A1] text-white shadow-md'
                    : 'bg-white text-slate-600 hover:bg-[#E8F4FF] hover:text-[#0D47A1] border border-[#CBD5E1]'
                }`}
              >
                <AlertOctagon className="w-4 h-4" />
                Incident Reports ({reports.length})
              </button>

              <button
                onClick={() => { setActiveTab('resources'); setSelectedReport(null); }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition ${
                  activeTab === 'resources'
                    ? 'bg-[#0D47A1] text-white shadow-md'
                    : 'bg-white text-slate-600 hover:bg-[#E8F4FF] hover:text-[#0D47A1] border border-[#CBD5E1]'
                }`}
              >
                <FileText className="w-4 h-4" />
                Policies & Docs ({resources.length})
              </button>

              <button
                onClick={() => { setActiveTab('campaigns'); setSelectedReport(null); }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition ${
                  activeTab === 'campaigns'
                    ? 'bg-[#0D47A1] text-white shadow-md'
                    : 'bg-white text-slate-600 hover:bg-[#E8F4FF] hover:text-[#0D47A1] border border-[#CBD5E1]'
                }`}
              >
                <Megaphone className="w-4 h-4" />
                Campaigns & Media ({campaigns.length})
              </button>

              <button
                onClick={() => { setActiveTab('partners'); setSelectedReport(null); }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition ${
                  activeTab === 'partners'
                    ? 'bg-[#0D47A1] text-white shadow-md'
                    : 'bg-white text-slate-600 hover:bg-[#E8F4FF] hover:text-[#0D47A1] border border-[#CBD5E1]'
                }`}
              >
                <Handshake className="w-4 h-4" />
                Referral Partners ({partners.length})
              </button>

              <button
                onClick={() => { setActiveTab('helplines'); setSelectedReport(null); }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition ${
                  activeTab === 'helplines'
                    ? 'bg-[#0D47A1] text-white shadow-md'
                    : 'bg-white text-slate-600 hover:bg-[#E8F4FF] hover:text-[#0D47A1] border border-[#CBD5E1]'
                }`}
              >
                <PhoneCall className="w-4 h-4" />
                Emergency Helplines ({helplines.length})
              </button>
            </div>

            {/* TAB 1: INCIDENT CASES & TRIAGE */}
            {activeTab === 'cases' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Reports List (2 cols on lg) */}
                <div className={`space-y-4 ${selectedReport ? 'lg:col-span-1' : 'lg:col-span-3'}`}>
                  {/* Filters Bar */}
                  <div className="bg-white p-4 rounded-xl border border-[#CBD5E1] shadow-sm space-y-3">
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search reference #, description, chapter..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-[#CBD5E1] bg-white text-[#1E293B] focus:ring-2 focus:ring-[#1976D2] focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-2 py-1.5 rounded-lg border border-[#CBD5E1] bg-white text-[#1E293B]"
                      >
                        <option value="all">All Statuses</option>
                        <option value="received">Received</option>
                        <option value="under_review">Under Review</option>
                        <option value="investigating">Investigating</option>
                        <option value="action_taken">Action Taken</option>
                        <option value="referred">Referred</option>
                        <option value="closed">Closed</option>
                      </select>

                      <select
                        value={priorityFilter}
                        onChange={(e) => setPriorityFilter(e.target.value)}
                        className="px-2 py-1.5 rounded-lg border border-[#CBD5E1] bg-white text-[#1E293B]"
                      >
                        <option value="all">All Priorities</option>
                        <option value="critical">Critical</option>
                        <option value="urgent">Urgent</option>
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                      </select>

                      <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="px-2 py-1.5 rounded-lg border border-[#CBD5E1] bg-white text-[#1E293B]"
                      >
                        <option value="all">All Categories</option>
                        <option value="child_abuse">Child Abuse</option>
                        <option value="gbv">GBV Prevention</option>
                        <option value="sexual_harassment">Sexual Harassment</option>
                        <option value="bullying">Bullying</option>
                        <option value="discrimination">Discrimination</option>
                        <option value="mentor_misconduct">Mentor Misconduct</option>
                        <option value="unsafe_environment">Unsafe Environment</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>

                  {/* List of Reports */}
                  <div className="space-y-3 max-h-[700px] overflow-y-auto pr-1">
                    {filteredReports.length === 0 ? (
                      <div className="bg-white p-8 rounded-xl border border-[#CBD5E1] text-center text-slate-500">
                        <FileText className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                        <p className="text-sm font-semibold">No incident reports match current filters</p>
                      </div>
                    ) : (
                      filteredReports.map((report) => {
                        const isSelected = selectedReport?.id === report.id;
                        return (
                          <div
                            key={report.id}
                            onClick={() => handleSelectReport(report)}
                            className={`p-4 rounded-xl border cursor-pointer transition shadow-sm ${
                              isSelected
                                ? 'bg-[#E8F4FF] border-[#1976D2] ring-2 ring-[#1976D2]/20'
                                : 'bg-white border-[#CBD5E1] hover:border-[#1976D2]/50 hover:bg-[#F8FAFF]'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2 mb-1.5">
                              <span className="font-mono text-xs font-bold text-[#0A1B4D]">
                                #{report.case_number}
                              </span>
                              <div className="flex items-center gap-1.5">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                  report.priority === 'critical' || report.priority === 'urgent'
                                    ? 'bg-red-100 text-red-700'
                                    : report.priority === 'high'
                                    ? 'bg-amber-100 text-amber-700'
                                    : 'bg-blue-100 text-blue-700'
                                }`}>
                                  {report.priority}
                                </span>
                                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                                  {report.status}
                                </span>
                              </div>
                            </div>

                            <p className="text-xs text-slate-600 line-clamp-2 mb-2 font-normal">
                              {report.incident_description}
                            </p>

                            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100">
                              <span className="capitalize font-medium text-slate-500">
                                {report.category.replace(/_/g, ' ')}
                              </span>
                              <span>
                                {new Date(report.created_at).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Case Detail Drawer (2 cols when selected) */}
                {selectedReport && (
                  <div className="lg:col-span-2 bg-white rounded-2xl border border-[#CBD5E1] shadow-lg p-6 space-y-6">
                    {/* Header */}
                    <div className="flex items-start justify-between border-b border-[#CBD5E1] pb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-xl font-black text-[#0A1B4D]">
                            Case #{selectedReport.case_number}
                          </h3>
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${
                            selectedReport.priority === 'critical' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                          }`}>
                            {selectedReport.priority}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          Category: <span className="font-semibold capitalize">{selectedReport.category.replace(/_/g, ' ')}</span> • Reported on {new Date(selectedReport.created_at).toLocaleString()}
                        </p>
                      </div>

                      <button
                        onClick={() => setSelectedReport(null)}
                        className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Status & Priority Triage Controllers */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#F8FAFF] p-4 rounded-xl border border-[#CBD5E1]">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Investigation Status
                        </label>
                        <select
                          value={selectedReport.status}
                          disabled={updatingStatus}
                          onChange={(e) => handleStatusChange(e.target.value as ReportStatus)}
                          className="w-full px-3 py-2 rounded-lg border border-[#CBD5E1] bg-white text-[#1E293B] text-xs font-semibold"
                        >
                          <option value="received">Received / Logged</option>
                          <option value="under_review">Under Formal Review</option>
                          <option value="investigating">Investigation In Progress</option>
                          <option value="action_taken">Protective Action Taken</option>
                          <option value="referred">Referred to Statutory Authorities</option>
                          <option value="closed">Closed / Resolved</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Triage Urgency Priority
                        </label>
                        <select
                          value={selectedReport.priority}
                          onChange={(e) => handlePriorityChange(e.target.value as ReportPriority)}
                          className="w-full px-3 py-2 rounded-lg border border-[#CBD5E1] bg-white text-[#1E293B] text-xs font-semibold"
                        >
                          <option value="critical">Critical (Immediate Danger)</option>
                          <option value="urgent">Urgent</option>
                          <option value="high">High</option>
                          <option value="medium">Medium</option>
                          <option value="low">Low</option>
                        </select>
                      </div>
                    </div>

                    {/* Full Incident Summary */}
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                        Official Incident Statement
                      </h4>
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-line">
                        {selectedReport.incident_description}
                      </div>

                      {selectedReport.chapter_or_location && (
                        <p className="text-xs text-slate-500 mt-2">
                          <span className="font-semibold">Reported Location/Chapter:</span> {selectedReport.chapter_or_location}
                        </p>
                      )}
                    </div>

                    {/* Evidence & Attached Links */}
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center justify-between">
                        <span>Attached Files & Document URLs</span>
                        <span className="text-[11px] text-[#1976D2] font-semibold">
                          {(selectedReport.evidence_files?.length || 0) + (selectedReport.evidence_urls?.length || 0)} Attachments
                        </span>
                      </h4>

                      <div className="space-y-2 mb-3">
                        {/* Evidence files */}
                        {selectedReport.evidence_files && selectedReport.evidence_files.length > 0 && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {selectedReport.evidence_files.map((file, i) => (
                              <a
                                key={i}
                                href={file.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 p-2.5 rounded-lg border border-[#CBD5E1] bg-white hover:bg-[#E8F4FF] text-xs text-[#0D47A1] font-medium transition"
                              >
                                <Paperclip className="w-3.5 h-3.5 shrink-0" />
                                <span className="truncate flex-1">{file.name}</span>
                                <ExternalLink className="w-3 h-3 text-slate-400" />
                              </a>
                            ))}
                          </div>
                        )}

                        {/* Evidence URLs */}
                        {selectedReport.evidence_urls && selectedReport.evidence_urls.length > 0 && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {selectedReport.evidence_urls.map((url, i) => (
                              <a
                                key={i}
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 p-2.5 rounded-lg border border-[#CBD5E1] bg-white hover:bg-[#E8F4FF] text-xs text-[#0D47A1] font-medium transition"
                              >
                                <LinkIcon className="w-3.5 h-3.5 shrink-0" />
                                <span className="truncate flex-1">{url}</span>
                                <ExternalLink className="w-3 h-3 text-slate-400" />
                              </a>
                            ))}
                          </div>
                        )}

                        {(!selectedReport.evidence_files || selectedReport.evidence_files.length === 0) &&
                         (!selectedReport.evidence_urls || selectedReport.evidence_urls.length === 0) && (
                          <div className="p-3 text-xs text-slate-400 bg-slate-50 rounded-lg border border-slate-200">
                            No files or evidence links currently attached.
                          </div>
                        )}
                      </div>

                      {/* Attach New Evidence URL Form */}
                      <form onSubmit={handleAttachEvidenceUrl} className="flex flex-col sm:flex-row gap-2">
                        <input
                          type="url"
                          placeholder="Attach Google Drive / Image / Doc URL"
                          value={newEvidenceUrl}
                          onChange={(e) => setNewEvidenceUrl(e.target.value)}
                          className="flex-1 px-3 py-2 text-xs rounded-lg border border-[#CBD5E1] bg-white text-[#1E293B]"
                          required
                        />
                        <input
                          type="text"
                          placeholder="Evidence Label (optional)"
                          value={newEvidenceLabel}
                          onChange={(e) => setNewEvidenceLabel(e.target.value)}
                          className="sm:w-44 px-3 py-2 text-xs rounded-lg border border-[#CBD5E1] bg-white text-[#1E293B]"
                        />
                        <button
                          type="submit"
                          className="px-4 py-2 rounded-lg bg-[#0D47A1] hover:bg-[#0A1B4D] text-white text-xs font-semibold whitespace-nowrap"
                        >
                          Attach Link
                        </button>
                      </form>
                    </div>

                    {/* Messages with Reporter */}
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                        Two-Way Secure Dialogue with Reporter
                      </h4>
                      <div className="space-y-2 max-h-48 overflow-y-auto p-3 bg-slate-50 rounded-xl border border-slate-200 mb-3">
                        {messages.length === 0 ? (
                          <p className="text-xs text-slate-400 text-center py-2">No messages exchanged yet.</p>
                        ) : (
                          messages.map((m) => (
                            <div
                              key={m.id}
                              className={`p-2.5 rounded-lg text-xs ${
                                m.sender_type === 'officer'
                                  ? 'bg-[#E8F4FF] border border-[#1976D2]/30 text-[#0A1B4D] ml-4'
                                  : 'bg-white border border-slate-200 text-slate-700 mr-4'
                              }`}
                            >
                              <div className="flex items-center justify-between font-bold text-[10px] text-slate-500 mb-1">
                                <span>{m.sender_name || (m.sender_type === 'officer' ? 'Safeguarding Directorate' : 'Reporter')}</span>
                                <span>{new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                              </div>
                              <p>{m.message}</p>
                            </div>
                          ))
                        )}
                      </div>

                      <form onSubmit={handleSendOfficerMessage} className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Send secure instruction/update to reporter portal..."
                          value={newOfficerMessage}
                          onChange={(e) => setNewOfficerMessage(e.target.value)}
                          className="flex-1 px-3 py-2 text-xs rounded-lg border border-[#CBD5E1] bg-white text-[#1E293B]"
                        />
                        <button
                          type="submit"
                          className="px-4 py-2 rounded-lg bg-[#0D47A1] text-white text-xs font-semibold hover:bg-[#0A1B4D] flex items-center gap-1.5"
                        >
                          <Send className="w-3.5 h-3.5" />
                          Send
                        </button>
                      </form>
                    </div>

                    {/* Internal Confidential Notes */}
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                        Privileged Internal Case Notes (Invisible to Public)
                      </h4>
                      <div className="space-y-2 max-h-36 overflow-y-auto p-3 bg-amber-50/50 rounded-xl border border-amber-200 mb-3">
                        {caseNotes.length === 0 ? (
                          <p className="text-xs text-slate-400 text-center py-1">No confidential notes added yet.</p>
                        ) : (
                          caseNotes.map((n) => (
                            <div key={n.id} className="p-2 rounded bg-white border border-amber-200 text-xs text-slate-700">
                              <div className="flex justify-between text-[10px] text-slate-400 font-semibold mb-0.5">
                                <span>{n.officer_name}</span>
                                <span>{new Date(n.created_at).toLocaleString()}</span>
                              </div>
                              <p>{n.note_text || n.note}</p>
                            </div>
                          ))
                        )}
                      </div>

                      <form onSubmit={handleAddInternalNote} className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Record investigative note, police liaison info, or statutory referral details..."
                          value={newInternalNote}
                          onChange={(e) => setNewInternalNote(e.target.value)}
                          className="flex-1 px-3 py-2 text-xs rounded-lg border border-[#CBD5E1] bg-white text-[#1E293B]"
                        />
                        <button
                          type="submit"
                          className="px-4 py-2 rounded-lg bg-slate-800 text-white text-xs font-semibold hover:bg-black"
                        >
                          Add Note
                        </button>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: POLICIES & DOCS MANAGER */}
            {activeTab === 'resources' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#CBD5E1] shadow-sm">
                  <div>
                    <h3 className="text-lg font-bold text-[#0A1B4D]">Safeguarding Policies & Document Repository</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Publish child protection manuals, mentor codes of conduct, and downloadable consent forms.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowAddResourceModal(true)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0D47A1] hover:bg-[#0A1B4D] text-white text-xs font-semibold shadow-md transition"
                  >
                    <Plus className="w-4 h-4" />
                    Upload / Add Policy Doc
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {resources.map((res) => (
                    <div key={res.id} className="bg-white rounded-xl border border-[#CBD5E1] p-5 shadow-sm hover:border-[#1976D2] transition flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <span className="px-2 py-0.5 rounded bg-[#E8F4FF] text-[#0D47A1] text-[10px] font-bold uppercase tracking-wider">
                            {res.category}
                          </span>
                          <span className="text-xs font-mono text-slate-400">
                            v{res.version || '1.0'}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-[#0A1B4D] mb-1">{res.title}</h4>
                        <p className="text-xs text-slate-600 line-clamp-3 mb-4">{res.description}</p>
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <a
                            href={res.file_url || '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#E8F4FF] hover:bg-[#1976D2] hover:text-white text-[#0D47A1] text-xs font-semibold transition"
                          >
                            <Download className="w-3.5 h-3.5" />
                            View Doc
                          </a>
                          <span className="text-[11px] text-slate-400">
                            {res.format || 'PDF'} • {res.file_size || '1.2 MB'}
                          </span>
                        </div>

                        <button
                          onClick={() => handleDeleteResource(res.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                          title="Delete policy document"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: AWARENESS CAMPAIGNS & MEDIA */}
            {activeTab === 'campaigns' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#CBD5E1] shadow-sm">
                  <div>
                    <h3 className="text-lg font-bold text-[#0A1B4D]">Awareness Campaigns & Youth Education</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Publish awareness drives, workshops, banner graphics, and registration URLs.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowAddCampaignModal(true)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0D47A1] hover:bg-[#0A1B4D] text-white text-xs font-semibold shadow-md transition"
                  >
                    <Plus className="w-4 h-4" />
                    New Campaign Initiative
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {campaigns.map((camp) => (
                    <div key={camp.id} className="bg-white rounded-2xl border border-[#CBD5E1] overflow-hidden shadow-sm flex flex-col justify-between">
                      <div>
                        <div className="h-44 w-full bg-slate-100 relative overflow-hidden">
                          <img
                            src={camp.banner_image || camp.cover_image || 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=80'}
                            alt={camp.title}
                            className="w-full h-full object-cover"
                          />
                          <span className={`absolute top-3 right-3 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            camp.status === 'active' ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-white'
                          }`}>
                            {camp.status}
                          </span>
                        </div>

                        <div className="p-5">
                          <div className="text-[11px] font-semibold text-[#1976D2] uppercase tracking-wider mb-1">
                            {camp.category || 'Awareness Drive'}
                          </div>
                          <h4 className="text-base font-bold text-[#0A1B4D] mb-2">{camp.title}</h4>
                          <p className="text-xs text-slate-600 line-clamp-3 mb-3">{camp.description}</p>
                          
                          <div className="text-xs text-slate-500 space-y-1 pt-2 border-t border-slate-100">
                            <div><span className="font-semibold">Duration:</span> {camp.start_date} to {camp.end_date}</div>
                            <div><span className="font-semibold">Venue:</span> {camp.location || camp.venue || 'Nationwide'}</div>
                          </div>
                        </div>
                      </div>

                      <div className="p-5 pt-0 flex items-center justify-between">
                        {camp.registration_link && (
                          <a
                            href={camp.registration_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs text-[#0D47A1] font-bold hover:underline"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            Event / Action Link
                          </a>
                        )}

                        <button
                          onClick={() => handleDeleteCampaign(camp.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 ml-auto transition"
                          title="Delete campaign"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 4: REFERRAL PARTNERS & ALLIANCES */}
            {activeTab === 'partners' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#CBD5E1] shadow-sm">
                  <div>
                    <h3 className="text-lg font-bold text-[#0A1B4D]">Strategic Safeguarding Referral Network</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Statutory child protection institutions, legal aid clinics, and psycho-social shelters.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowAddPartnerModal(true)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0D47A1] hover:bg-[#0A1B4D] text-white text-xs font-semibold shadow-md transition"
                  >
                    <Plus className="w-4 h-4" />
                    Add Referral Partner
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {partners.map((partner) => (
                    <div key={partner.id} className="bg-white rounded-2xl border border-[#CBD5E1] p-5 shadow-sm flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-3 mb-3">
                          <img
                            src={partner.logo_url || 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?auto=format&fit=crop&w=400&q=80'}
                            alt={partner.name}
                            className="w-12 h-12 rounded-xl object-cover border border-slate-200"
                          />
                          <div>
                            <h4 className="text-sm font-bold text-[#0A1B4D]">{partner.name}</h4>
                            <span className="text-[11px] text-[#1976D2] font-semibold">
                              {partner.partner_type || partner.type || 'Child Protection Partner'}
                            </span>
                          </div>
                        </div>

                        <p className="text-xs text-slate-600 mb-3">{partner.description}</p>
                        
                        {partner.collaboration_scope && (
                          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-[11px] text-slate-700 mb-3">
                            <span className="font-semibold block text-[#0A1B4D] mb-0.5">Collaboration Scope:</span>
                            {partner.collaboration_scope}
                          </div>
                        )}
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                        {partner.website && (
                          <a
                            href={partner.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs text-[#0D47A1] font-bold hover:underline"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            Official Portal
                          </a>
                        )}

                        <button
                          onClick={() => handleDeletePartner(partner.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 ml-auto transition"
                          title="Remove partner"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 5: EMERGENCY HELPLINES */}
            {activeTab === 'helplines' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#CBD5E1] shadow-sm">
                  <div>
                    <h3 className="text-lg font-bold text-[#0A1B4D]">Verified Emergency & Crisis Hotlines</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Hotlines displayed across emergency banners and child protection intake pages.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowAddHelplineModal(true)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0D47A1] hover:bg-[#0A1B4D] text-white text-xs font-semibold shadow-md transition"
                  >
                    <Plus className="w-4 h-4" />
                    Add Crisis Helpline
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {helplines.map((helpline) => (
                    <div key={helpline.id} className="bg-white rounded-xl border border-[#CBD5E1] p-5 shadow-sm flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <span className="px-2 py-0.5 rounded bg-red-50 text-red-700 text-[10px] font-bold uppercase tracking-wider">
                            {helpline.category.replace(/_/g, ' ')}
                          </span>
                          {helpline.toll_free && (
                            <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                              TOLL FREE
                            </span>
                          )}
                        </div>

                        <h4 className="text-base font-bold text-[#0A1B4D] mb-1">{helpline.name}</h4>
                        <div className="text-lg font-black text-[#0D47A1] font-mono mb-2">
                          {helpline.phone}
                        </div>
                        <p className="text-xs text-slate-600 mb-2">{helpline.description}</p>
                        
                        <div className="text-[11px] text-slate-400">
                          <span>Hours: {helpline.available_hours || helpline.availability || '24/7'}</span> • <span>{helpline.location || 'National'}</span>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between mt-3">
                        <a
                          href={`tel:${helpline.phone}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#E8F4FF] hover:bg-[#1976D2] hover:text-white text-[#0D47A1] text-xs font-bold transition"
                        >
                          <PhoneCall className="w-3.5 h-3.5" />
                          Test Dial
                        </a>

                        <button
                          onClick={() => handleDeleteHelpline(helpline.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                          title="Delete contact"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* ========================================================================= */}
      {/* MODAL: ADD POLICY / DOCUMENT */}
      {/* ========================================================================= */}
      {showAddResourceModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#CBD5E1] space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-[#0A1B4D]">Publish Safeguarding Policy / Doc</h3>
              <button onClick={() => setShowAddResourceModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateResource} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#1E293B] mb-1">Document Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. YARA Child Protection Code of Conduct 2026"
                  value={resourceForm.title}
                  onChange={(e) => setResourceForm({ ...resourceForm, title: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#CBD5E1] bg-white text-[#1E293B]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-[#1E293B] mb-1">Category</label>
                  <select
                    value={resourceForm.category}
                    onChange={(e) => setResourceForm({ ...resourceForm, category: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-[#CBD5E1] bg-white text-[#1E293B]"
                  >
                    <option value="Child Protection Policy">Child Protection Policy</option>
                    <option value="GBV Prevention Guideline">GBV Prevention Guideline</option>
                    <option value="Mentor Code of Conduct">Mentor Code of Conduct</option>
                    <option value="Digital Safety & Cyber Policy">Digital Safety & Cyber Policy</option>
                    <option value="Parental Consent Form">Parental Consent Form</option>
                    <option value="Whistleblower Protection">Whistleblower Protection</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1E293B] mb-1">Version & Format</label>
                  <input
                    type="text"
                    placeholder="v2026.1 (PDF)"
                    value={resourceForm.version}
                    onChange={(e) => setResourceForm({ ...resourceForm, version: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-[#CBD5E1] bg-white text-[#1E293B]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1E293B] mb-1">Document / Drive URL</label>
                <input
                  type="url"
                  placeholder="https://drive.google.com/file/d/... or https://yaria.tech/docs/..."
                  value={resourceForm.file_url}
                  onChange={(e) => setResourceForm({ ...resourceForm, file_url: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#CBD5E1] bg-white text-[#1E293B]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1E293B] mb-1">Summary / Objective</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Brief description of requirements, compliance mandates, and intended users..."
                  value={resourceForm.description}
                  onChange={(e) => setResourceForm({ ...resourceForm, description: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#CBD5E1] bg-white text-[#1E293B]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddResourceModal(false)}
                  className="px-4 py-2 rounded-lg border border-[#CBD5E1] text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#0D47A1] hover:bg-[#0A1B4D] text-white text-xs font-bold shadow-md"
                >
                  Publish Document
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD CAMPAIGN / MEDIA */}
      {/* ========================================================================= */}
      {showAddCampaignModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#CBD5E1] space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-[#0A1B4D]">Create Awareness Campaign</h3>
              <button onClick={() => setShowAddCampaignModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCampaign} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#1E293B] mb-1">Campaign Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 16 Days of Activism Against GBV in STEM"
                  value={campaignForm.title}
                  onChange={(e) => setCampaignForm({ ...campaignForm, title: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#CBD5E1] bg-white text-[#1E293B]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1E293B] mb-1">Banner Image URL</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/... or uploaded graphic URL"
                  value={campaignForm.banner_image}
                  onChange={(e) => setCampaignForm({ ...campaignForm, banner_image: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#CBD5E1] bg-white text-[#1E293B]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-[#1E293B] mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    value={campaignForm.start_date}
                    onChange={(e) => setCampaignForm({ ...campaignForm, start_date: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-[#CBD5E1] bg-white text-[#1E293B]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#1E293B] mb-1">End Date</label>
                  <input
                    type="date"
                    required
                    value={campaignForm.end_date}
                    onChange={(e) => setCampaignForm({ ...campaignForm, end_date: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-[#CBD5E1] bg-white text-[#1E293B]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1E293B] mb-1">Venue / Target Chapters</label>
                <input
                  type="text"
                  placeholder="e.g. Harare & Bulawayo Chapter Hubs + Virtual Streaming"
                  value={campaignForm.location}
                  onChange={(e) => setCampaignForm({ ...campaignForm, location: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#CBD5E1] bg-white text-[#1E293B]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1E293B] mb-1">Registration or Event Link</label>
                <input
                  type="url"
                  placeholder="https://yaria.tech/register or Google Form link"
                  value={campaignForm.registration_link}
                  onChange={(e) => setCampaignForm({ ...campaignForm, registration_link: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#CBD5E1] bg-white text-[#1E293B]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1E293B] mb-1">Initiative Scope</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Educational focus, guest speakers, student participation goals..."
                  value={campaignForm.description}
                  onChange={(e) => setCampaignForm({ ...campaignForm, description: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#CBD5E1] bg-white text-[#1E293B]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddCampaignModal(false)}
                  className="px-4 py-2 rounded-lg border border-[#CBD5E1] text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#0D47A1] hover:bg-[#0A1B4D] text-white text-xs font-bold shadow-md"
                >
                  Publish Campaign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD PARTNER */}
      {/* ========================================================================= */}
      {showAddPartnerModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#CBD5E1] space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-[#0A1B4D]">Add Strategic Referral Partner</h3>
              <button onClick={() => setShowAddPartnerModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePartner} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#1E293B] mb-1">Organization Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Musasa Project, Childline Zimbabwe"
                  value={partnerForm.name}
                  onChange={(e) => setPartnerForm({ ...partnerForm, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#CBD5E1] bg-white text-[#1E293B]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-[#1E293B] mb-1">Partner Type</label>
                  <input
                    type="text"
                    placeholder="e.g. GBV Shelter & Crisis Care"
                    value={partnerForm.partner_type}
                    onChange={(e) => setPartnerForm({ ...partnerForm, partner_type: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-[#CBD5E1] bg-white text-[#1E293B]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#1E293B] mb-1">Logo URL</label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={partnerForm.logo_url}
                    onChange={(e) => setPartnerForm({ ...partnerForm, logo_url: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-[#CBD5E1] bg-white text-[#1E293B]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1E293B] mb-1">Website / Portal URL</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={partnerForm.website}
                  onChange={(e) => setPartnerForm({ ...partnerForm, website: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#CBD5E1] bg-white text-[#1E293B]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1E293B] mb-1">Collaboration Scope</label>
                <input
                  type="text"
                  placeholder="e.g. Rapid trauma counseling, safe shelter, legal escalation"
                  value={partnerForm.collaboration_scope}
                  onChange={(e) => setPartnerForm({ ...partnerForm, collaboration_scope: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#CBD5E1] bg-white text-[#1E293B]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1E293B] mb-1">Mission & Referral Details</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Partner capabilities, emergency admission policies..."
                  value={partnerForm.description}
                  onChange={(e) => setPartnerForm({ ...partnerForm, description: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#CBD5E1] bg-white text-[#1E293B]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddPartnerModal(false)}
                  className="px-4 py-2 rounded-lg border border-[#CBD5E1] text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#0D47A1] hover:bg-[#0A1B4D] text-white text-xs font-bold shadow-md"
                >
                  Save Partner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD HELPLINE */}
      {/* ========================================================================= */}
      {showAddHelplineModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#CBD5E1] space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-[#0A1B4D]">Add Emergency Helpline</h3>
              <button onClick={() => setShowAddHelplineModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateHelpline} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#1E293B] mb-1">Helpline Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. National GBV Toll-Free Crisis Line"
                  value={helplineForm.name}
                  onChange={(e) => setHelplineForm({ ...helplineForm, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#CBD5E1] bg-white text-[#1E293B]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-[#1E293B] mb-1">Phone Number</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 116 or +263 8080074"
                    value={helplineForm.phone}
                    onChange={(e) => setHelplineForm({ ...helplineForm, phone: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-[#CBD5E1] bg-white text-[#1E293B]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#1E293B] mb-1">Category</label>
                  <select
                    value={helplineForm.category}
                    onChange={(e) => setHelplineForm({ ...helplineForm, category: e.target.value as any })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-[#CBD5E1] bg-white text-[#1E293B]"
                  >
                    <option value="child_protection">Child Protection</option>
                    <option value="gbv">Gender-Based Violence</option>
                    <option value="police">Police & Law Enforcement</option>
                    <option value="mental_health">Mental Health & Suicide</option>
                    <option value="counselling">Psychosocial Counseling</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 py-1">
                <input
                  type="checkbox"
                  id="toll_free_check"
                  checked={helplineForm.toll_free}
                  onChange={(e) => setHelplineForm({ ...helplineForm, toll_free: e.target.checked })}
                  className="rounded text-[#0D47A1] focus:ring-[#1976D2]"
                />
                <label htmlFor="toll_free_check" className="text-xs font-semibold text-slate-700">
                  Toll-Free Dial (Free of charge across networks)
                </label>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1E293B] mb-1">Operating Hours & Location</label>
                <input
                  type="text"
                  placeholder="24/7 Hours • National Coverage"
                  value={helplineForm.available_hours}
                  onChange={(e) => setHelplineForm({ ...helplineForm, available_hours: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#CBD5E1] bg-white text-[#1E293B]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1E293B] mb-1">Details & Specialization</label>
                <textarea
                  rows={2}
                  placeholder="Crisis triage, languages supported, anonymous call options..."
                  value={helplineForm.description}
                  onChange={(e) => setHelplineForm({ ...helplineForm, description: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#CBD5E1] bg-white text-[#1E293B]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddHelplineModal(false)}
                  className="px-4 py-2 rounded-lg border border-[#CBD5E1] text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#0D47A1] hover:bg-[#0A1B4D] text-white text-xs font-bold shadow-md"
                >
                  Save Helpline
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SafeguardingAdminDashboard;
