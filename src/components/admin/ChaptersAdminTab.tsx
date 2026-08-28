import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building2, School, Users, FileText, CheckCircle2, AlertCircle, 
  ExternalLink, Search, Filter, Plus, Trash2, Edit3, Shield, 
  Lock, Unlock, Award, Clock, DollarSign, Send, ChevronDown, 
  ChevronUp, Check, X, Sparkles, AlertTriangle, Key, Copy, CheckCheck,
  UserCheck, UserX, Eye, EyeOff, ShieldCheck, ShieldAlert, RefreshCw,
  Landmark, Layers, Briefcase, Zap
} from 'lucide-react';
import { 
  Chapter, ChapterReport, ChapterCategory, ChapterStatus, 
  NationalExecutiveAssessment, ReportStatus, ChapterLeader, ChapterLeaderRole 
} from '../../types/chapters';
import { 
  getChapters, createChapter, updateChapter, deleteChapter,
  getChapterReports, assessChapterReport, updateChapterReportStatus, deleteChapterReport,
  toggleChapterReportLock, approveChapterLeader, revokeChapterLeaderApproval,
  approveChapterSecretary, revokeChapterSecretary,
  addChapterLeader, updateChapterLeader, deleteChapterLeader
} from '../../services/chaptersService';
import { cn } from '../../lib/utils';

export default function ChaptersAdminTab() {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [reports, setReports] = useState<ChapterReport[]>([]);
  const [loading, setLoading] = useState(true);

  // Sub-tabs: 'chapters' | 'leaders' | 'reports'
  const [activeSubTab, setActiveSubTab] = useState<'chapters' | 'secretaries' | 'reports'>('chapters');

  // Chapter Creation / Edit Modal
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingChapterId, setEditingChapterId] = useState<string | null>(null);
  const [chapterForm, setChapterForm] = useState({
    name: '',
    code: '',
    category: 'university' as ChapterCategory,
    institution_or_community: '',
    province: 'Harare',
    district_or_city: '',
    banner_url: '',
    description: '',
    established_date: '2026-01-01',
    status: 'chartered' as ChapterStatus,
    total_members_count: 20,
    public_email: '',
    public_phone: '',
    meeting_schedule: '',
    physical_location: '',
    focus_areas_str: 'Underwater Drone, Autonomous Maze, IoT, Embedded C',
    confidential_budget: 500,
    confidential_bank_info: '',
    confidential_notes: ''
  });

  // Report Assessment Modal State
  const [assessingReport, setAssessingReport] = useState<ChapterReport | null>(null);
  const [assessmentForm, setAssessmentForm] = useState({
    grade: 'Outstanding (A)' as NationalExecutiveAssessment['grade'],
    score_out_of_100: 90,
    national_executive_feedback: '',
    action_items_for_chapter: '',
    grant_allocation_recommended: false,
    recommended_grant_usd: 150
  });

  // Add / Edit Leader / Secretary Modal State
  const [isSecretaryModalOpen, setIsSecretaryModalOpen] = useState(false);
  const [secretaryModalTargetChapterId, setSecretaryModalTargetChapterId] = useState<string>('');
  const [editingLeaderId, setEditingLeaderId] = useState<string | null>(null);
  const [secretaryForm, setSecretaryForm] = useState({
    name: '',
    role: 'secretary' as ChapterLeaderRole,
    email: '',
    phone: '',
    department_or_grade: '',
    is_public_contact: true,
    is_approved_by_admin: true,
    can_submit_general_reports: true,
    can_submit_financial_reports: false,
    secretary_access_pin: ''
  });

  // PIN visibility state for leaders
  const [revealedPins, setRevealedPins] = useState<Record<string, boolean>>({});
  const [copiedPinId, setCopiedPinId] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [reportStatusFilter, setReportStatusFilter] = useState<string>('ALL');
  const [secretaryFilterStatus, setSecretaryFilterStatus] = useState<'ALL' | 'APPROVED' | 'FINANCIAL' | 'GENERAL' | 'PENDING'>('ALL');
  const [leaderFilterRole, setLeaderFilterRole] = useState<string>('ALL');
  const [secretaryFilterChapter, setSecretaryFilterChapter] = useState<string>('ALL');

  const [notice, setNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showNotification = (type: 'success' | 'error', text: string) => {
    setNotice({ type, text });
    setTimeout(() => setNotice(null), 4000);
  };

  const loadData = async () => {
    setLoading(true);
    const [allChapters, allReports] = await Promise.all([
      getChapters(true), // load full with confidential info
      getChapterReports()
    ]);
    setChapters(allChapters);
    setReports(allReports);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAddChapter = () => {
    setEditingChapterId(null);
    setChapterForm({
      name: '',
      code: `YARA-CH-${Date.now().toString(36).toUpperCase().slice(-4)}`,
      category: 'university',
      institution_or_community: '',
      province: 'Harare',
      district_or_city: '',
      banner_url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80',
      description: '',
      established_date: new Date().toISOString().split('T')[0],
      status: 'chartered',
      total_members_count: 15,
      public_email: '',
      public_phone: '',
      meeting_schedule: 'Wednesdays 16:00 CAT',
      physical_location: 'Innovation & Robotics Lab',
      focus_areas_str: 'Robotics, Electronics, Code, Competition',
      confidential_budget: 300,
      confidential_bank_info: '',
      confidential_notes: ''
    });
    setIsFormOpen(true);
  };

  const handleOpenEditChapter = (ch: Chapter) => {
    setEditingChapterId(ch.id);
    setChapterForm({
      name: ch.name,
      code: ch.code,
      category: ch.category,
      institution_or_community: ch.institution_or_community,
      province: ch.province,
      district_or_city: ch.district_or_city,
      banner_url: ch.banner_url || '',
      description: ch.description,
      established_date: ch.established_date,
      status: ch.status,
      total_members_count: ch.total_members_count,
      public_email: ch.public_email || '',
      public_phone: ch.public_phone || '',
      meeting_schedule: ch.meeting_schedule || '',
      physical_location: ch.physical_location || '',
      focus_areas_str: ch.focus_areas?.join(', ') || '',
      confidential_budget: ch.confidential_info?.internal_budget_balance_usd || 0,
      confidential_bank_info: ch.confidential_info?.internal_bank_or_ecocash_details || '',
      confidential_notes: ch.confidential_info?.private_executive_notes || ''
    });
    setIsFormOpen(true);
  };

  const handleSaveChapter = async (e: React.FormEvent) => {
    e.preventDefault();
    const focus_areas = chapterForm.focus_areas_str.split(',').map(s => s.trim()).filter(Boolean);

    try {
      if (editingChapterId) {
        await updateChapter(editingChapterId, {
          name: chapterForm.name,
          code: chapterForm.code,
          category: chapterForm.category,
          institution_or_community: chapterForm.institution_or_community,
          province: chapterForm.province,
          district_or_city: chapterForm.district_or_city,
          banner_url: chapterForm.banner_url || undefined,
          description: chapterForm.description,
          established_date: chapterForm.established_date,
          status: chapterForm.status,
          total_members_count: Number(chapterForm.total_members_count) || 0,
          public_email: chapterForm.public_email || undefined,
          public_phone: chapterForm.public_phone || undefined,
          meeting_schedule: chapterForm.meeting_schedule || undefined,
          physical_location: chapterForm.physical_location || undefined,
          focus_areas,
          confidential_info: {
            internal_budget_balance_usd: Number(chapterForm.confidential_budget) || 0,
            internal_bank_or_ecocash_details: chapterForm.confidential_bank_info || undefined,
            private_executive_notes: chapterForm.confidential_notes || undefined
          }
        });
        showNotification('success', 'Chapter updated successfully.');
      } else {
        await createChapter({
          name: chapterForm.name,
          code: chapterForm.code,
          category: chapterForm.category,
          institution_or_community: chapterForm.institution_or_community,
          province: chapterForm.province,
          district_or_city: chapterForm.district_or_city,
          banner_url: chapterForm.banner_url || undefined,
          description: chapterForm.description,
          established_date: chapterForm.established_date,
          status: chapterForm.status,
          total_members_count: Number(chapterForm.total_members_count) || 0,
          active_projects_count: 0,
          public_email: chapterForm.public_email || undefined,
          public_phone: chapterForm.public_phone || undefined,
          meeting_schedule: chapterForm.meeting_schedule || undefined,
          physical_location: chapterForm.physical_location || undefined,
          focus_areas,
          leaders: [],
          projects: [],
          activities: [],
          confidential_info: {
            internal_budget_balance_usd: Number(chapterForm.confidential_budget) || 0,
            internal_bank_or_ecocash_details: chapterForm.confidential_bank_info || undefined,
            private_executive_notes: chapterForm.confidential_notes || undefined
          }
        });
        showNotification('success', 'New YARA Chapter chartered and published.');
      }
      setIsFormOpen(false);
      loadData();
    } catch (err: any) {
      showNotification('error', err.message || 'Failed to save chapter.');
    }
  };

  const handleDeleteChapter = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete chapter "${name}"?`)) return;
    await deleteChapter(id);
    showNotification('success', `Chapter "${name}" removed.`);
    loadData();
  };

  // Helper functions for leader role defaults
  const getRolePinPrefix = (role: ChapterLeaderRole) => {
    switch (role) {
      case 'chairperson':
      case 'vice_chair':
        return 'PRES';
      case 'treasurer':
        return 'TREAS';
      case 'secretary':
      case 'vice_secretary':
        return 'SEC';
      case 'tech_lead':
        return 'TECH';
      case 'lab_coordinator':
        return 'LAB';
      case 'faculty_advisor':
        return 'ADV';
      default:
        return 'LEAD';
    }
  };

  const getDefaultPermissionsForRole = (role: ChapterLeaderRole) => {
    switch (role) {
      case 'chairperson':
      case 'vice_chair':
        return { can_submit_general_reports: true, can_submit_financial_reports: true };
      case 'treasurer':
        return { can_submit_general_reports: false, can_submit_financial_reports: true };
      case 'secretary':
      case 'vice_secretary':
        return { can_submit_general_reports: true, can_submit_financial_reports: false };
      case 'tech_lead':
      case 'lab_coordinator':
      case 'faculty_advisor':
      case 'pr_lead':
      default:
        return { can_submit_general_reports: false, can_submit_financial_reports: false };
    }
  };

  // Leader Management Actions
  const handleOpenAddSecretary = (chapterId?: string, defaultRole: ChapterLeaderRole = 'secretary') => {
    const targetId = chapterId || (chapters.length > 0 ? chapters[0].id : '');
    const targetChap = chapters.find(c => c.id === targetId);
    const code = targetChap ? targetChap.code.replace(/[^A-Z0-9]/gi, '') : 'CH';
    const rolePrefix = getRolePinPrefix(defaultRole);
    const pin = `${code}-${rolePrefix}-${Math.floor(1000 + Math.random() * 9000)}`;
    const defaults = getDefaultPermissionsForRole(defaultRole);

    setSecretaryModalTargetChapterId(targetId);
    setEditingLeaderId(null);
    setSecretaryForm({
      name: '',
      role: defaultRole,
      email: '',
      phone: '',
      department_or_grade: '',
      is_public_contact: true,
      is_approved_by_admin: true,
      can_submit_general_reports: defaults.can_submit_general_reports,
      can_submit_financial_reports: defaults.can_submit_financial_reports,
      secretary_access_pin: pin
    });
    setIsSecretaryModalOpen(true);
  };

  const handleOpenEditSecretary = (chapterId: string, leader: ChapterLeader) => {
    const defaults = getDefaultPermissionsForRole(leader.role);
    setSecretaryModalTargetChapterId(chapterId);
    setEditingLeaderId(leader.id);
    setSecretaryForm({
      name: leader.name,
      role: leader.role,
      email: leader.email || '',
      phone: leader.phone || '',
      department_or_grade: leader.department_or_grade || '',
      is_public_contact: leader.is_public_contact,
      is_approved_by_admin: leader.is_approved_by_admin !== false,
      can_submit_general_reports: leader.can_submit_general_reports ?? defaults.can_submit_general_reports,
      can_submit_financial_reports: leader.can_submit_financial_reports ?? defaults.can_submit_financial_reports,
      secretary_access_pin: leader.secretary_access_pin || leader.access_pin || ''
    });
    setIsSecretaryModalOpen(true);
  };

  const handleSaveSecretary = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!secretaryModalTargetChapterId) {
      showNotification('error', 'Please select a chapter.');
      return;
    }

    try {
      if (editingLeaderId) {
        await updateChapterLeader(secretaryModalTargetChapterId, editingLeaderId, {
          name: secretaryForm.name,
          role: secretaryForm.role,
          email: secretaryForm.email || undefined,
          phone: secretaryForm.phone || undefined,
          department_or_grade: secretaryForm.department_or_grade || undefined,
          is_public_contact: secretaryForm.is_public_contact,
          is_approved_by_admin: secretaryForm.is_approved_by_admin,
          can_submit_general_reports: secretaryForm.can_submit_general_reports,
          can_submit_financial_reports: secretaryForm.can_submit_financial_reports,
          approved_by_admin_at: secretaryForm.is_approved_by_admin ? new Date().toISOString() : undefined,
          approved_by_admin_name: secretaryForm.is_approved_by_admin ? 'National Executive Admin' : undefined,
          secretary_access_pin: secretaryForm.secretary_access_pin || undefined,
          access_pin: secretaryForm.secretary_access_pin || undefined
        });
        showNotification('success', `Updated credentials and permissions for "${secretaryForm.name}".`);
      } else {
        await addChapterLeader(secretaryModalTargetChapterId, {
          name: secretaryForm.name,
          role: secretaryForm.role,
          email: secretaryForm.email || undefined,
          phone: secretaryForm.phone || undefined,
          department_or_grade: secretaryForm.department_or_grade || undefined,
          is_public_contact: secretaryForm.is_public_contact,
          is_approved_by_admin: secretaryForm.is_approved_by_admin,
          can_submit_general_reports: secretaryForm.can_submit_general_reports,
          can_submit_financial_reports: secretaryForm.can_submit_financial_reports,
          secretary_access_pin: secretaryForm.secretary_access_pin || undefined,
          access_pin: secretaryForm.secretary_access_pin || undefined
        });
        showNotification('success', `Registered & Certified new chapter leader "${secretaryForm.name}".`);
      }
      setIsSecretaryModalOpen(false);
      loadData();
    } catch (err: any) {
      showNotification('error', err.message || 'Failed to save leader appointment.');
    }
  };

  const handleApproveSecretary = async (chapterId: string, leaderId: string, leaderName: string) => {
    try {
      await approveChapterLeader(chapterId, leaderId, undefined, 'National Executive Admin');
      showNotification('success', `✓ Successfully approved & certified ${leaderName} as official Chapter Leader.`);
      loadData();
    } catch (err: any) {
      showNotification('error', err.message || 'Failed to approve leader.');
    }
  };

  const handleRevokeSecretary = async (chapterId: string, leaderId: string, leaderName: string) => {
    if (!window.confirm(`Revoke official report submission authorization for "${leaderName}"?`)) return;
    try {
      await revokeChapterLeaderApproval(chapterId, leaderId, 'National Executive Admin');
      showNotification('success', `Revoked approval for ${leaderName}. Submissions locked.`);
      loadData();
    } catch (err: any) {
      showNotification('error', err.message || 'Failed to revoke leader approval.');
    }
  };

  const handleToggleGeneralReportPermission = async (chapterId: string, leader: ChapterLeader) => {
    const nextState = !(leader.can_submit_general_reports ?? (leader.role === 'secretary' || leader.role === 'chairperson' || leader.role === 'vice_chair' || leader.role === 'vice_secretary'));
    try {
      await updateChapterLeader(chapterId, leader.id, {
        can_submit_general_reports: nextState
      });
      showNotification('success', `General report submission permission for ${leader.name} set to ${nextState ? 'ENABLED' : 'DISABLED'}.`);
      loadData();
    } catch (err: any) {
      showNotification('error', err.message || 'Failed to update permission.');
    }
  };

  const handleToggleFinancialReportPermission = async (chapterId: string, leader: ChapterLeader) => {
    const nextState = !(leader.can_submit_financial_reports ?? (leader.role === 'treasurer' || leader.role === 'chairperson' || leader.role === 'secretary'));
    try {
      await updateChapterLeader(chapterId, leader.id, {
        can_submit_financial_reports: nextState
      });
      showNotification('success', `Financial report submission permission for ${leader.name} set to ${nextState ? 'ENABLED' : 'DISABLED'}.`);
      loadData();
    } catch (err: any) {
      showNotification('error', err.message || 'Failed to update permission.');
    }
  };

  const handleDeleteSecretaryLeader = async (chapterId: string, leaderId: string, leaderName: string) => {
    if (!window.confirm(`Delete leader record for "${leaderName}"?`)) return;
    try {
      await deleteChapterLeader(chapterId, leaderId);
      showNotification('success', `Removed leader "${leaderName}".`);
      loadData();
    } catch (err: any) {
      showNotification('error', err.message || 'Failed to delete leader.');
    }
  };

  const handleCopyPin = (pin: string, id: string) => {
    navigator.clipboard.writeText(pin);
    setCopiedPinId(id);
    setTimeout(() => setCopiedPinId(null), 2500);
  };

  const togglePinVisibility = (id: string) => {
    setRevealedPins(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Assessment Modals
  const handleOpenAssessment = (report: ChapterReport) => {
    setAssessingReport(report);
    if (report.executive_assessment) {
      setAssessmentForm({
        grade: report.executive_assessment.grade,
        score_out_of_100: report.executive_assessment.score_out_of_100,
        national_executive_feedback: report.executive_assessment.national_executive_feedback,
        action_items_for_chapter: report.executive_assessment.action_items_for_chapter || '',
        grant_allocation_recommended: !!report.executive_assessment.grant_allocation_recommended,
        recommended_grant_usd: report.executive_assessment.recommended_grant_usd || 150
      });
    } else {
      setAssessmentForm({
        grade: 'Outstanding (A)',
        score_out_of_100: 92,
        national_executive_feedback: 'Well-articulated report demonstrating robust lab operations and clear student growth.',
        action_items_for_chapter: '',
        grant_allocation_recommended: false,
        recommended_grant_usd: 150
      });
    }
  };

  const handleSaveAssessment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assessingReport) return;

    try {
      await assessChapterReport(assessingReport.id, {
        assessed_by_name: 'National Executive Assessment Committee',
        assessed_by_email: 'national.exec@yara.org.zw',
        assessed_at: new Date().toISOString(),
        grade: assessmentForm.grade,
        score_out_of_100: Number(assessmentForm.score_out_of_100),
        national_executive_feedback: assessmentForm.national_executive_feedback,
        action_items_for_chapter: assessmentForm.action_items_for_chapter || undefined,
        grant_allocation_recommended: assessmentForm.grant_allocation_recommended,
        recommended_grant_usd: assessmentForm.grant_allocation_recommended ? Number(assessmentForm.recommended_grant_usd) : undefined
      });

      showNotification('success', 'National Executive Assessment recorded and official grade assigned.');
      setAssessingReport(null);
      loadData();
    } catch (err: any) {
      showNotification('error', err.message || 'Failed to submit assessment.');
    }
  };

  const handleToggleReportLock = async (report: ChapterReport) => {
    const nextLockState = !report.is_locked;
    try {
      await toggleChapterReportLock(report.id, nextLockState, 'National Executive Admin');
      showNotification(
        'success', 
        nextLockState 
          ? `Report locked and sealed with National Audit Hash.` 
          : `Report unlocked for chapter secretarial revision.`
      );
      loadData();
    } catch (err: any) {
      showNotification('error', err.message || 'Failed to update report lock status.');
    }
  };

  const handleDeleteReport = async (report: ChapterReport) => {
    if (report.is_locked) {
      showNotification('error', 'Cannot delete a locked report. Please unlock the submission first.');
      return;
    }
    if (!window.confirm(`Delete report "${report.report_title}"?`)) return;
    try {
      await deleteChapterReport(report.id);
      showNotification('success', 'Report removed.');
      loadData();
    } catch (err: any) {
      showNotification('error', err.message || 'Failed to delete report.');
    }
  };

  // Aggregated all chapter leaders across all chapters
  const allLeadersList = useMemo(() => {
    const list: { chapter: Chapter; leader: ChapterLeader; isApproved: boolean }[] = [];
    chapters.forEach(ch => {
      (ch.leaders || []).forEach(lead => {
        list.push({
          chapter: ch,
          leader: lead,
          isApproved: lead.is_approved_by_admin !== false
        });
      });
    });
    return list;
  }, [chapters]);

  const approvedLeadersCount = useMemo(() => {
    return allLeadersList.filter(s => s.isApproved).length;
  }, [allLeadersList]);

  const filteredLeaders = useMemo(() => {
    return allLeadersList.filter(item => {
      const matchSearch = 
        item.leader.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.leader.email && item.leader.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
        item.chapter.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.chapter.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.leader.secretary_access_pin && item.leader.secretary_access_pin.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchRole =
        leaderFilterRole === 'ALL' || item.leader.role === leaderFilterRole;

      const isFinancial = item.leader.can_submit_financial_reports ?? (['treasurer', 'chairperson', 'secretary'].includes(item.leader.role));
      const isGeneral = item.leader.can_submit_general_reports ?? (['secretary', 'vice_secretary', 'chairperson', 'vice_chair'].includes(item.leader.role));

      const matchStatus = 
        secretaryFilterStatus === 'ALL' ||
        (secretaryFilterStatus === 'APPROVED' && item.isApproved) ||
        (secretaryFilterStatus === 'FINANCIAL' && item.isApproved && isFinancial) ||
        (secretaryFilterStatus === 'GENERAL' && item.isApproved && isGeneral) ||
        (secretaryFilterStatus === 'PENDING' && !item.isApproved);

      const matchChapter = 
        secretaryFilterChapter === 'ALL' || item.chapter.id === secretaryFilterChapter;

      return matchSearch && matchRole && matchStatus && matchChapter;
    });
  }, [allLeadersList, searchQuery, leaderFilterRole, secretaryFilterStatus, secretaryFilterChapter]);

  const filteredChapters = useMemo(() => {
    return chapters.filter(c => 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.institution_or_community.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.code.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [chapters, searchQuery]);

  const filteredReports = useMemo(() => {
    return reports.filter(r => {
      const matchSearch = 
        r.chapter_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.report_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.submitted_by_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (r.document_seal_code && r.document_seal_code.toLowerCase().includes(searchQuery.toLowerCase()));

      if (reportStatusFilter === 'ALL') return matchSearch;
      if (reportStatusFilter === 'financial') return matchSearch && (r.report_category === 'financial' || !!r.financial_data);
      if (reportStatusFilter === 'general') return matchSearch && (r.report_category === 'general' || !r.report_category);
      if (reportStatusFilter === 'locked') return matchSearch && r.is_locked;
      if (reportStatusFilter === 'unlocked') return matchSearch && !r.is_locked;
      return matchSearch && r.status === reportStatusFilter;
    });
  }, [reports, searchQuery, reportStatusFilter]);

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="p-6 md:p-8 bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 rounded-3xl text-white flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-amber-400 text-xs font-black uppercase tracking-widest">
            <Shield className="w-4 h-4" />
            <span>National Chapters & Executive Leadership Authority</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-black tracking-tight">
            YARA Chapters & Leadership Administration
          </h2>
          <p className="text-slate-300 text-xs md:text-sm max-w-2xl leading-relaxed">
            Charter and manage tertiary (CUT, UZ), secondary, primary, and community youth chapters. Assign, approve, and configure granular report & financial submission permissions for Presidents, Secretaries, and Treasurers.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            onClick={() => handleOpenAddSecretary(undefined, 'secretary')}
            className="px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs shadow-lg flex items-center space-x-2 transition-all"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Approve & Certify Leader</span>
          </button>

          <button
            onClick={handleOpenAddChapter}
            className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center space-x-2 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add New YARA Chapter</span>
          </button>
        </div>
      </div>

      {/* Notification Toast */}
      {notice && (
        <div className={cn(
          "p-4 rounded-2xl border text-xs font-bold flex items-center space-x-2",
          notice.type === 'success' ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-red-50 border-red-200 text-red-800"
        )}>
          {notice.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-red-600" />}
          <span>{notice.text}</span>
        </div>
      )}

      {/* Navigation Sub-Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveSubTab('chapters')}
            className={cn(
              "px-5 py-2.5 rounded-2xl font-bold text-xs transition-all flex items-center space-x-2",
              activeSubTab === 'chapters'
                ? "bg-slate-900 text-white shadow-md"
                : "bg-slate-100 hover:bg-slate-200 text-slate-700"
            )}
          >
            <Building2 className="w-4 h-4" />
            <span>Chapter Registry ({chapters.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('secretaries')}
            className={cn(
              "px-5 py-2.5 rounded-2xl font-bold text-xs transition-all flex items-center space-x-2",
              activeSubTab === 'secretaries'
                ? "bg-amber-500 text-slate-950 shadow-md font-black"
                : "bg-slate-100 hover:bg-slate-200 text-slate-700"
            )}
          >
            <ShieldCheck className="w-4 h-4 text-amber-900" />
            <span>Chapter Leadership & Permissions ({approvedLeadersCount}/{allLeadersList.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('reports')}
            className={cn(
              "px-5 py-2.5 rounded-2xl font-bold text-xs transition-all flex items-center space-x-2",
              activeSubTab === 'reports'
                ? "bg-indigo-600 text-white shadow-md"
                : "bg-slate-100 hover:bg-slate-200 text-slate-700"
            )}
          >
            <FileText className="w-4 h-4" />
            <span>Reports & Financial Statements ({reports.length})</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative max-w-xs w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search chapters, secretaries, or reports..."
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-hidden"
          />
        </div>
      </div>

      {/* SUB-TAB 1: CHAPTER REGISTRY */}
      {activeSubTab === 'chapters' && (
        <div className="space-y-4">
          {filteredChapters.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 text-slate-400">
              No chapters found matching search.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredChapters.map(chapter => {
                const chapSecretaries = (chapter.leaders || []).filter(l => l.role === 'secretary' || l.role === 'vice_secretary' || l.is_approved_by_admin);
                const approvedSecs = chapSecretaries.filter(l => l.is_approved_by_admin !== false);

                return (
                  <div
                    key={chapter.id}
                    className="p-6 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-indigo-50 text-indigo-700">
                          {chapter.category.replace('_', ' ')}
                        </span>
                        <span className="text-xs font-mono font-bold text-slate-400">{chapter.code}</span>
                      </div>

                      <h4 className="font-bold text-slate-900 text-base">{chapter.name}</h4>
                      <p className="text-xs text-slate-500 font-medium">
                        {chapter.institution_or_community} • {chapter.district_or_city}, {chapter.province}
                      </p>

                      <p className="text-xs text-slate-600 font-medium line-clamp-2 pt-1">
                        {chapter.description}
                      </p>

                      {/* Approved Secretary Summary Badge */}
                      <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-700 flex items-center space-x-1.5">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Approved Secretaries:</span>
                        </span>
                        {approvedSecs.length > 0 ? (
                          <div className="flex items-center space-x-1">
                            <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold text-[11px]">
                              {approvedSecs.map(s => s.name).join(', ')}
                            </span>
                          </div>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 font-bold text-[11px]">
                            None Approved (Submissions Blocked)
                          </span>
                        )}
                      </div>

                      {/* Confidential Info Summary for Admin */}
                      <div className="p-3.5 bg-amber-50/70 border border-amber-200/60 rounded-2xl space-y-1 text-xs">
                        <div className="flex items-center justify-between text-amber-900 font-bold">
                          <span className="flex items-center space-x-1">
                            <Lock className="w-3 h-3 text-amber-700" />
                            <span>Confidential Balance:</span>
                          </span>
                          <span>${chapter.confidential_info?.internal_budget_balance_usd || 0} USD</span>
                        </div>
                        {chapter.confidential_info?.inventory_access_code && (
                          <div className="flex items-center justify-between text-[11px] text-amber-800">
                            <span>Chapter Key:</span>
                            <span className="font-mono font-bold">{chapter.confidential_info.inventory_access_code}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                      <span className="text-xs font-bold text-slate-500">
                        {chapter.total_members_count} Members • {chapter.projects?.length || 0} Projects
                      </span>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleOpenAddSecretary(chapter.id)}
                          className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold text-xs flex items-center space-x-1"
                          title="Add Secretary to this chapter"
                        >
                          <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
                          <span>Add Secretary</span>
                        </button>
                        <button
                          onClick={() => handleOpenEditChapter(chapter)}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center space-x-1"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleDeleteChapter(chapter.id, chapter.name)}
                          className="p-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600"
                          title="Delete Chapter"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 2: APPROVED CHAPTER LEADERSHIP & REPORTING ACCESS DIRECTORY */}
      {activeSubTab === 'secretaries' && (
        <div className="space-y-6">
          {/* Top Filter and Add Row */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-xs font-bold text-slate-500 mr-1">Status:</span>
                {[
                  { id: 'ALL', label: 'All Leaders' },
                  { id: 'APPROVED', label: '✓ Certified' },
                  { id: 'FINANCIAL', label: '💰 Financial Access' },
                  { id: 'GENERAL', label: '📝 General Access' },
                  { id: 'PENDING', label: '⏳ Blocked' }
                ].map(f => (
                  <button
                    key={f.id}
                    onClick={() => setSecretaryFilterStatus(f.id as any)}
                    className={cn(
                      "px-3 py-1.5 rounded-xl text-xs font-bold transition-all",
                      secretaryFilterStatus === f.id ? "bg-slate-900 text-white shadow-xs" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    )}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-slate-500">Role:</span>
                <select
                  value={leaderFilterRole}
                  onChange={e => setLeaderFilterRole(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-700"
                >
                  <option value="ALL">All Leadership Roles</option>
                  <option value="chairperson">President / Chairperson</option>
                  <option value="vice_chair">Vice Chairperson</option>
                  <option value="secretary">Chapter Secretary</option>
                  <option value="vice_secretary">Vice Secretary</option>
                  <option value="treasurer">Treasurer / Finance</option>
                  <option value="tech_lead">Technical Lead</option>
                  <option value="advisor">Faculty / Advisor</option>
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-slate-500">Chapter:</span>
                <select
                  value={secretaryFilterChapter}
                  onChange={e => setSecretaryFilterChapter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-700"
                >
                  <option value="ALL">All Chapters</option>
                  {chapters.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={() => handleOpenAddSecretary(undefined, 'secretary')}
              className="px-5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs shadow-md flex items-center space-x-2 transition-all self-start lg:self-auto shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Approve & Certify New Leader</span>
            </button>
          </div>

          {/* Leaders List */}
          {filteredLeaders.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-slate-200 space-y-3">
              <ShieldAlert className="w-12 h-12 text-slate-300 mx-auto" />
              <h4 className="font-bold text-slate-700 text-base">No Chapter Leaders Found</h4>
              <p className="text-xs text-slate-500">
                Click "Approve & Certify New Leader" above to appoint and assign submission access for any chapter.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredLeaders.map(({ chapter, leader, isApproved }) => {
                const isPinRevealed = revealedPins[leader.id];
                const pin = leader.secretary_access_pin || `${chapter.code.replace(/[^A-Z0-9]/gi, '')}-${getRolePinPrefix(leader.role)}-PIN`;
                
                const hasGeneralAccess = leader.can_submit_general_reports ?? (['secretary', 'vice_secretary', 'chairperson', 'vice_chair'].includes(leader.role));
                const hasFinancialAccess = leader.can_submit_financial_reports ?? (['treasurer', 'chairperson', 'secretary'].includes(leader.role));

                const getRoleBadgeStyle = (role: string) => {
                  switch (role) {
                    case 'chairperson':
                    case 'president':
                      return 'bg-purple-100 text-purple-900 border-purple-200';
                    case 'treasurer':
                      return 'bg-amber-100 text-amber-900 border-amber-300 font-black';
                    case 'secretary':
                      return 'bg-blue-100 text-blue-900 border-blue-200';
                    case 'vice_secretary':
                    case 'vice_chair':
                      return 'bg-sky-100 text-sky-900 border-sky-200';
                    default:
                      return 'bg-slate-100 text-slate-800 border-slate-200';
                  }
                };

                return (
                  <div
                    key={`${chapter.id}-${leader.id}`}
                    className={cn(
                      "p-5 rounded-3xl border shadow-xs space-y-4 flex flex-col justify-between transition-all relative overflow-hidden",
                      isApproved 
                        ? "bg-white border-emerald-200/80 hover:border-emerald-300 hover:shadow-md" 
                        : "bg-amber-50/40 border-amber-200 hover:border-amber-300"
                    )}
                  >
                    <div className="space-y-3">
                      {/* Chapter and Status Header */}
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-800">
                          {chapter.code}
                        </span>

                        {isApproved ? (
                          <span className="px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center space-x-1">
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span>Admin Approved</span>
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider bg-red-100 text-red-800 border border-red-200 flex items-center space-x-1">
                            <X className="w-3 h-3 text-red-600" />
                            <span>Unapproved / Blocked</span>
                          </span>
                        )}
                      </div>

                      {/* Name & Role */}
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="font-black text-slate-900 text-base">{leader.name}</h4>
                          <span className={cn("px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider border", getRoleBadgeStyle(leader.role))}>
                            {leader.role.replace('_', ' ')}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">{chapter.name}</p>
                      </div>

                      {/* Explicit Permissions Checkbox Badges */}
                      <div className="p-3 bg-slate-50 rounded-2xl space-y-2 border border-slate-100">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">
                          Assigned Reporting Permissions:
                        </span>
                        
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="flex items-center space-x-1.5 font-bold text-slate-700">
                              <FileText className="w-3.5 h-3.5 text-indigo-600" />
                              <span>General Reports</span>
                            </span>
                            {hasGeneralAccess && isApproved ? (
                              <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[10px] font-black border border-indigo-200 flex items-center space-x-1">
                                <Check className="w-2.5 h-2.5" />
                                <span>Authorized</span>
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-md bg-slate-200/60 text-slate-500 text-[10px] font-bold">
                                Not Permitted
                              </span>
                            )}
                          </div>

                          <div className="flex items-center justify-between text-xs">
                            <span className="flex items-center space-x-1.5 font-bold text-slate-700">
                              <DollarSign className="w-3.5 h-3.5 text-amber-600" />
                              <span>Financial Reports</span>
                            </span>
                            {hasFinancialAccess && isApproved ? (
                              <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 text-[10px] font-black border border-amber-300 flex items-center space-x-1">
                                <Check className="w-2.5 h-2.5" />
                                <span>Authorized</span>
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-md bg-slate-200/60 text-slate-500 text-[10px] font-bold">
                                Not Permitted
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Contact & Grade */}
                      <div className="p-3 bg-slate-50/70 rounded-2xl space-y-1 text-xs text-slate-600">
                        {leader.email && (
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400">Email:</span>
                            <span className="font-bold text-slate-800 truncate max-w-[180px]">{leader.email}</span>
                          </div>
                        )}
                        {leader.phone && (
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400">Phone:</span>
                            <span className="font-bold text-slate-800">{leader.phone}</span>
                          </div>
                        )}
                        {leader.department_or_grade && (
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400">Dept/Grade:</span>
                            <span className="font-medium text-slate-700 truncate max-w-[180px]">{leader.department_or_grade}</span>
                          </div>
                        )}
                      </div>

                      {/* Access PIN Box */}
                      <div className="p-3 bg-indigo-50/60 border border-indigo-100 rounded-2xl space-y-1.5">
                        <div className="flex items-center justify-between text-[11px] font-bold text-indigo-900">
                          <span className="flex items-center space-x-1">
                            <Key className="w-3.5 h-3.5 text-indigo-600" />
                            <span>Executive Access Key / PIN</span>
                          </span>
                          <button
                            onClick={() => togglePinVisibility(leader.id)}
                            className="text-indigo-600 hover:text-indigo-800 text-[10px] flex items-center space-x-0.5 font-bold"
                          >
                            {isPinRevealed ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                            <span>{isPinRevealed ? 'Hide' : 'Reveal'}</span>
                          </button>
                        </div>

                        <div className="flex items-center justify-between bg-white px-3 py-1.5 rounded-xl border border-indigo-200/80">
                          <span className="font-mono text-xs font-black text-slate-900">
                            {isPinRevealed ? pin : '••••••••••••'}
                          </span>
                          <button
                            onClick={() => handleCopyPin(pin, leader.id)}
                            className="p-1 text-slate-400 hover:text-indigo-600 rounded transition-colors"
                            title="Copy PIN"
                          >
                            {copiedPinId === leader.id ? (
                              <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Approval Metadata */}
                      {leader.approved_by_admin_at && (
                        <p className="text-[10px] text-slate-400 font-medium">
                          Certified on {new Date(leader.approved_by_admin_at).toLocaleDateString()} by {leader.approved_by_admin_name || 'National Admin'}
                        </p>
                      )}
                    </div>

                    {/* Actions Row */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      {isApproved ? (
                        <button
                          onClick={() => handleRevokeSecretary(chapter.id, leader.id, leader.name)}
                          className="px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs flex items-center space-x-1 transition-colors"
                          title="Revoke permission to submit reports"
                        >
                          <UserX className="w-3.5 h-3.5" />
                          <span>Revoke</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleApproveSecretary(chapter.id, leader.id, leader.name)}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center space-x-1 shadow-sm transition-colors"
                          title="Approve and allow this leader to submit reports"
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>Approve & Certify</span>
                        </button>
                      )}

                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => handleOpenEditSecretary(chapter.id, leader)}
                          className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700"
                          title="Edit Permissions & Details"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteSecretaryLeader(chapter.id, leader.id, leader.name)}
                          className="p-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600"
                          title="Remove Leader"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 3: REPORTS & FINANCIAL STATEMENTS (NATIONAL ASSESSMENTS) */}
      {activeSubTab === 'reports' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-bold text-slate-500 mr-1">Filter:</span>
              {[
                { id: 'ALL', label: 'All Submissions' },
                { id: 'general', label: '📝 General Reports' },
                { id: 'financial', label: '💰 Financial Statements' },
                { id: 'submitted', label: '⏳ Pending Assessment' },
                { id: 'assessed', label: '✓ Graded' },
                { id: 'locked', label: '🔒 Locked & Sealed' }
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setReportStatusFilter(f.id)}
                  className={cn(
                    "px-3 py-1.5 rounded-xl text-xs font-bold transition-all",
                    reportStatusFilter === f.id ? "bg-slate-900 text-white shadow-xs" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <span className="text-xs font-bold text-slate-400">
              Showing {filteredReports.length} of {reports.length} Reports
            </span>
          </div>

          {filteredReports.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 text-slate-400">
              No reports or financial statements matching criteria.
            </div>
          ) : (
            <div className="space-y-4">
              {filteredReports.map(report => {
                const isFinancial = report.report_category === 'financial' || !!report.financial_data;

                return (
                  <div
                    key={report.id}
                    className="p-6 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-4"
                  >
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-slate-100 pb-4">
                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-indigo-50 text-indigo-700">
                            {report.chapter_name}
                          </span>
                          <span className="text-xs text-slate-400 font-bold">
                            • {report.period_date} ({report.period_type})
                          </span>

                          {/* Category Badge */}
                          {isFinancial ? (
                            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300 flex items-center space-x-1">
                              <DollarSign className="w-3 h-3" />
                              <span>Financial Statement</span>
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-blue-50 text-blue-800 border border-blue-200 flex items-center space-x-1">
                              <FileText className="w-3 h-3" />
                              <span>Activity & Status Report</span>
                            </span>
                          )}

                          {/* Approved Verification Badge */}
                          <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200/60 flex items-center space-x-1">
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span>Certified Submitter ({report.submitted_by_role})</span>
                          </span>

                          {/* Lock / Seal Badge */}
                          {report.is_locked ? (
                            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-slate-900 text-amber-300 flex items-center space-x-1 shadow-2xs">
                              <Lock className="w-3 h-3" />
                              <span>Locked & Sealed ({report.document_seal_code || 'NATIONAL-AUDIT'})</span>
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200 flex items-center space-x-1">
                              <Unlock className="w-3 h-3 text-amber-600" />
                              <span>Unlocked (Modifiable)</span>
                            </span>
                          )}
                        </div>

                        <h4 className="font-bold text-slate-900 text-lg">{report.report_title}</h4>
                        
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 font-medium">
                          <span>
                            Filed by: <strong className="text-slate-800">{report.submitted_by_name}</strong> ({report.submitted_by_role})
                          </span>
                          <span>• Email: <strong className="text-slate-700">{report.submitted_by_email}</strong></span>
                          {report.locked_at && (
                            <span className="text-slate-400">
                              • Sealed on: {new Date(report.locked_at).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 shrink-0">
                        <span className={cn(
                          "px-3 py-1.5 rounded-xl text-xs font-black uppercase",
                          report.status === 'assessed' ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                        )}>
                          {report.status === 'assessed' ? 'Assessed' : 'Pending Assessment'}
                        </span>

                        {/* Lock / Unlock Toggle Button */}
                        <button
                          onClick={() => handleToggleReportLock(report)}
                          title={report.is_locked ? "Unlock report for editing/revision" : "Lock and freeze document submission"}
                          className={cn(
                            "px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all shadow-2xs border",
                            report.is_locked 
                              ? "bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200" 
                              : "bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-200"
                          )}
                        >
                          {report.is_locked ? (
                            <>
                              <Unlock className="w-3.5 h-3.5 text-slate-600" />
                              <span>Unlock</span>
                            </>
                          ) : (
                            <>
                              <Lock className="w-3.5 h-3.5 text-amber-700" />
                              <span>Lock</span>
                            </>
                          )}
                        </button>

                        <a
                          href={report.report_document_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center space-x-1.5 shadow-2xs transition-colors"
                        >
                          <span>Open Document</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>

                        <button
                          onClick={() => handleDeleteReport(report)}
                          title="Delete Report"
                          className="p-1.5 text-slate-400 hover:text-red-600 rounded-xl hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Financial Data Summary Box if category is financial */}
                    {report.financial_data && (
                      <div className="p-4 bg-amber-50/60 border border-amber-200 rounded-2xl space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black uppercase text-amber-900 flex items-center space-x-1.5">
                            <DollarSign className="w-4 h-4 text-amber-700" />
                            <span>Financial & Treasury Breakdown</span>
                          </span>
                          <span className="text-xs font-mono font-bold text-amber-950">
                            Currency: {report.financial_data.currency || 'USD'}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                          <div className="p-3 bg-white rounded-xl border border-amber-200/80">
                            <span className="text-[10px] text-slate-400 font-bold block">Opening Balance</span>
                            <span className="text-sm font-bold text-slate-800">
                              ${report.financial_data.opening_balance_usd?.toLocaleString() ?? 0}
                            </span>
                          </div>
                          <div className="p-3 bg-white rounded-xl border border-emerald-200">
                            <span className="text-[10px] text-emerald-600 font-bold block">Total Income</span>
                            <span className="text-sm font-black text-emerald-700">
                              +${report.financial_data.total_income_usd?.toLocaleString() ?? 0}
                            </span>
                          </div>
                          <div className="p-3 bg-white rounded-xl border border-red-200">
                            <span className="text-[10px] text-red-600 font-bold block">Total Expenses</span>
                            <span className="text-sm font-black text-red-700">
                              -${report.financial_data.total_expenses_usd?.toLocaleString() ?? 0}
                            </span>
                          </div>
                          <div className="p-3 bg-white rounded-xl border border-indigo-200">
                            <span className="text-[10px] text-indigo-600 font-bold block">Closing Balance</span>
                            <span className="text-sm font-black text-indigo-900">
                              ${report.financial_data.closing_balance_usd?.toLocaleString() ?? 0}
                            </span>
                          </div>
                        </div>

                        {(report.financial_data.hardware_expenditure_usd || report.financial_data.operational_expenditure_usd || report.financial_data.grant_requested_usd) && (
                          <div className="flex flex-wrap items-center gap-3 text-xs pt-1 text-amber-900 font-medium">
                            {report.financial_data.hardware_expenditure_usd !== undefined && (
                              <span>Hardware Spend: <strong>${report.financial_data.hardware_expenditure_usd}</strong></span>
                            )}
                            {report.financial_data.operational_expenditure_usd !== undefined && (
                              <span>• Operational Spend: <strong>${report.financial_data.operational_expenditure_usd}</strong></span>
                            )}
                            {report.financial_data.grant_requested_usd !== undefined && (
                              <span>• Grant Requested: <strong>${report.financial_data.grant_requested_usd}</strong></span>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Summary & Hardware Highlights */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-medium text-slate-700">
                      <div className="p-4 bg-slate-50 rounded-2xl space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Executive Summary</span>
                        <p className="line-clamp-3 leading-relaxed">{report.executive_summary}</p>
                      </div>

                      <div className="p-4 bg-slate-50 rounded-2xl space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Hardware & Projects Progress</span>
                        <p className="line-clamp-3 leading-relaxed">{report.hardware_projects_update || 'No hardware notes provided.'}</p>
                      </div>
                    </div>

                    {/* Existing Assessment or Assessment Action */}
                    {report.executive_assessment ? (
                      <div className="p-5 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <span className="text-xs font-bold text-emerald-900">National Executive Assessment Verdict:</span>
                            <span className="px-2 py-0.5 bg-emerald-600 text-white font-black text-xs rounded-md">
                              {report.executive_assessment.grade}
                            </span>
                            <span className="text-xs font-mono font-bold text-emerald-800">
                              ({report.executive_assessment.score_out_of_100}/100 pts)
                            </span>
                          </div>

                          <button
                            onClick={() => handleOpenAssessment(report)}
                            className="text-xs font-bold text-emerald-700 hover:underline"
                          >
                            Re-evaluate
                          </button>
                        </div>

                        <p className="text-xs text-emerald-900 font-medium">
                          "{report.executive_assessment.national_executive_feedback}"
                        </p>

                        {report.executive_assessment.grant_allocation_recommended && (
                          <span className="inline-block px-3 py-1 bg-white text-emerald-800 font-bold text-xs rounded-xl border border-emerald-200">
                            💰 Grant Approved: ${report.executive_assessment.recommended_grant_usd} USD
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center justify-between pt-2">
                        <span className="text-xs text-amber-700 font-medium">
                          Awaiting review & score by National Executive.
                        </span>

                        <button
                          onClick={() => handleOpenAssessment(report)}
                          className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md flex items-center space-x-1.5"
                        >
                          <Award className="w-4 h-4" />
                          <span>Perform Executive Assessment & Grade</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* CHAPTER ADD / EDIT MODAL */}
      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[2.5rem] max-w-2xl w-full shadow-2xl p-6 md:p-8 space-y-6 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-xl font-black text-slate-900">
                    {editingChapterId ? 'Edit YARA Chapter' : 'Charter New YARA Chapter'}
                  </h3>
                  <p className="text-xs text-slate-500">Configure public information and confidential chapter credentials.</p>
                </div>
                <button onClick={() => setIsFormOpen(false)} className="p-2 text-slate-400 hover:text-slate-700">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveChapter} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 uppercase">Chapter Name *</label>
                    <input
                      type="text"
                      required
                      value={chapterForm.name}
                      onChange={e => setChapterForm({ ...chapterForm, name: e.target.value })}
                      placeholder="e.g. YARA CUT Chapter"
                      className="w-full p-3 rounded-xl border border-slate-200 text-xs font-medium"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 uppercase">Chapter Code *</label>
                    <input
                      type="text"
                      required
                      value={chapterForm.code}
                      onChange={e => setChapterForm({ ...chapterForm, code: e.target.value })}
                      placeholder="e.g. YARA-CUT-01"
                      className="w-full p-3 rounded-xl border border-slate-200 text-xs font-mono font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 uppercase">Category *</label>
                    <select
                      value={chapterForm.category}
                      onChange={e => setChapterForm({ ...chapterForm, category: e.target.value as any })}
                      className="w-full p-3 rounded-xl border border-slate-200 text-xs font-bold"
                    >
                      <option value="university">University</option>
                      <option value="high_school">High School</option>
                      <option value="primary_school">Primary School</option>
                      <option value="community_youth">Community Youths</option>
                      <option value="polytechnic">Polytechnic / College</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 uppercase">Province *</label>
                    <select
                      value={chapterForm.province}
                      onChange={e => setChapterForm({ ...chapterForm, province: e.target.value })}
                      className="w-full p-3 rounded-xl border border-slate-200 text-xs font-bold"
                    >
                      {['Harare', 'Bulawayo', 'Mashonaland West', 'Mashonaland Central', 'Mashonaland East', 'Manicaland', 'Midlands', 'Masvingo', 'Matabeleland North', 'Matabeleland South'].map(p => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 uppercase">City / District *</label>
                    <input
                      type="text"
                      required
                      value={chapterForm.district_or_city}
                      onChange={e => setChapterForm({ ...chapterForm, district_or_city: e.target.value })}
                      placeholder="e.g. Chinhoyi"
                      className="w-full p-3 rounded-xl border border-slate-200 text-xs font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase">Host Institution or Community *</label>
                  <input
                    type="text"
                    required
                    value={chapterForm.institution_or_community}
                    onChange={e => setChapterForm({ ...chapterForm, institution_or_community: e.target.value })}
                    placeholder="e.g. Chinhoyi University of Technology"
                    className="w-full p-3 rounded-xl border border-slate-200 text-xs font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase">Public Chapter Description *</label>
                  <textarea
                    rows={3}
                    required
                    value={chapterForm.description}
                    onChange={e => setChapterForm({ ...chapterForm, description: e.target.value })}
                    placeholder="Describe chapter goals, robotics specializations, and lab activities..."
                    className="w-full p-3 rounded-xl border border-slate-200 text-xs font-medium"
                  />
                </div>

                {/* Confidential Section */}
                <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-2xl space-y-3">
                  <div className="flex items-center space-x-2 text-amber-900 font-bold text-xs uppercase">
                    <Lock className="w-4 h-4 text-amber-700" />
                    <span>Confidential Information (Admin & Chapter Executives Only)</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-amber-900">Internal Balance ($ USD)</label>
                      <input
                        type="number"
                        value={chapterForm.confidential_budget}
                        onChange={e => setChapterForm({ ...chapterForm, confidential_budget: Number(e.target.value) })}
                        className="w-full p-2.5 bg-white rounded-xl border border-amber-200 text-xs font-bold"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-amber-900">Bank / Ecocash Details</label>
                      <input
                        type="text"
                        value={chapterForm.confidential_bank_info}
                        onChange={e => setChapterForm({ ...chapterForm, confidential_bank_info: e.target.value })}
                        placeholder="Internal payout details..."
                        className="w-full p-2.5 bg-white rounded-xl border border-amber-200 text-xs"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-amber-900">Executive Private Notes</label>
                    <textarea
                      rows={2}
                      value={chapterForm.confidential_notes}
                      onChange={e => setChapterForm({ ...chapterForm, confidential_notes: e.target.value })}
                      placeholder="Private notes about chapter performance, subsidies, or hardware needs..."
                      className="w-full p-2.5 bg-white rounded-xl border border-amber-200 text-xs"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="px-5 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md"
                  >
                    Save Chapter
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* REGISTER / EDIT LEADER & SECRETARY MODAL */}
      <AnimatePresence>
        {isSecretaryModalOpen && (
          <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[2.5rem] max-w-xl w-full shadow-2xl p-6 md:p-8 space-y-6 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <span className="text-[10px] font-black uppercase text-amber-600 flex items-center space-x-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Executive Certification & Access Control</span>
                  </span>
                  <h3 className="text-xl font-black text-slate-900">
                    {editingLeaderId ? 'Edit Leader Credentials & Permissions' : 'Approve & Certify Chapter Leader'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Only leaders approved by the National Executive Admin can submit official activity and financial reports.
                  </p>
                </div>
                <button onClick={() => setIsSecretaryModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-700">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveSecretary} className="space-y-4">
                {/* Chapter Select */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase">Assigned Chapter *</label>
                  <select
                    value={secretaryModalTargetChapterId}
                    onChange={e => {
                      const newChapId = e.target.value;
                      setSecretaryModalTargetChapterId(newChapId);
                      const targetChap = chapters.find(c => c.id === newChapId);
                      const code = targetChap ? targetChap.code.replace(/[^A-Z0-9]/gi, '') : 'CH';
                      const prefix = getRolePinPrefix(secretaryForm.role);
                      setSecretaryForm({
                        ...secretaryForm,
                        secretary_access_pin: `${code}-${prefix}-${Math.floor(1000 + Math.random() * 9000)}`
                      });
                    }}
                    className="w-full p-3 rounded-xl border border-slate-200 text-xs font-bold"
                    required
                  >
                    {chapters.map(c => (
                      <option key={c.id} value={c.id}>{c.name} ({c.code})</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 uppercase">Leader Full Name *</label>
                    <input
                      type="text"
                      required
                      value={secretaryForm.name}
                      onChange={e => setSecretaryForm({ ...secretaryForm, name: e.target.value })}
                      placeholder="e.g. Kudzai Moyo"
                      className="w-full p-3 rounded-xl border border-slate-200 text-xs font-medium"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 uppercase">Leadership Role *</label>
                    <select
                      value={secretaryForm.role}
                      onChange={e => {
                        const newRole = e.target.value as any;
                        const defaultPerms = getDefaultPermissionsForRole(newRole);
                        const targetChap = chapters.find(c => c.id === secretaryModalTargetChapterId);
                        const code = targetChap ? targetChap.code.replace(/[^A-Z0-9]/gi, '') : 'CH';
                        const prefix = getRolePinPrefix(newRole);
                        
                        setSecretaryForm({
                          ...secretaryForm,
                          role: newRole,
                          can_submit_general_reports: defaultPerms.can_submit_general_reports,
                          can_submit_financial_reports: defaultPerms.can_submit_financial_reports,
                          secretary_access_pin: `${code}-${prefix}-${Math.floor(1000 + Math.random() * 9000)}`
                        });
                      }}
                      className="w-full p-3 rounded-xl border border-slate-200 text-xs font-bold"
                    >
                      <option value="chairperson">Chairperson / President</option>
                      <option value="vice_chair">Vice Chairperson</option>
                      <option value="secretary">Chapter Secretary (General Lead)</option>
                      <option value="vice_secretary">Vice Secretary</option>
                      <option value="treasurer">Treasurer (Financial Lead)</option>
                      <option value="tech_lead">Technical Lead / Lab Coord</option>
                      <option value="advisor">Faculty / Community Advisor</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 uppercase">Official Email Address *</label>
                    <input
                      type="email"
                      required
                      value={secretaryForm.email}
                      onChange={e => setSecretaryForm({ ...secretaryForm, email: e.target.value })}
                      placeholder="kudzai.m@cut.ac.zw"
                      className="w-full p-3 rounded-xl border border-slate-200 text-xs font-medium"
                    />
                    <span className="text-[10px] text-slate-400 block">Used for report author verification.</span>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 uppercase">Phone / WhatsApp</label>
                    <input
                      type="tel"
                      value={secretaryForm.phone}
                      onChange={e => setSecretaryForm({ ...secretaryForm, phone: e.target.value })}
                      placeholder="+263 77 123 4567"
                      className="w-full p-3 rounded-xl border border-slate-200 text-xs font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase">Department, Faculty, or Grade Level</label>
                  <input
                    type="text"
                    value={secretaryForm.department_or_grade}
                    onChange={e => setSecretaryForm({ ...secretaryForm, department_or_grade: e.target.value })}
                    placeholder="e.g. Computer Science Yr 2, Upper 6 Sciences, or Electronics Dept"
                    className="w-full p-3 rounded-xl border border-slate-200 text-xs font-medium"
                  />
                </div>

                {/* Secretarial / Leader Access PIN */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase flex items-center space-x-1.5">
                    <Key className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Admin-Issued Access Key / PIN</span>
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={secretaryForm.secretary_access_pin}
                      onChange={e => setSecretaryForm({ ...secretaryForm, secretary_access_pin: e.target.value.toUpperCase() })}
                      placeholder="e.g. CUT-PRES-8842"
                      className="flex-1 p-3 rounded-xl border border-slate-200 text-xs font-mono font-bold"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const targetChap = chapters.find(c => c.id === secretaryModalTargetChapterId);
                        const code = targetChap ? targetChap.code.replace(/[^A-Z0-9]/gi, '') : 'CH';
                        const prefix = getRolePinPrefix(secretaryForm.role);
                        setSecretaryForm({
                          ...secretaryForm,
                          secretary_access_pin: `${code}-${prefix}-${Math.floor(1000 + Math.random() * 9000)}`
                        });
                      }}
                      className="px-3 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center space-x-1"
                      title="Generate new PIN"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Regen</span>
                    </button>
                  </div>
                </div>

                {/* Admin Approval Master Switch */}
                <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-2xl flex items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <span className="text-xs font-black text-emerald-900 flex items-center space-x-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-700" />
                      <span>National Admin Approval Status</span>
                    </span>
                    <p className="text-[11px] text-emerald-800">
                      When enabled, this leader is officially certified by National Executive Admin.
                    </p>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={secretaryForm.is_approved_by_admin}
                      onChange={e => setSecretaryForm({ ...secretaryForm, is_approved_by_admin: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>

                {/* Granular Report Permissions Panel */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                  <div className="flex items-center space-x-1.5 text-xs font-black uppercase text-slate-800">
                    <Lock className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Report Submission Permissions</span>
                  </div>

                  <div className="space-y-2.5">
                    {/* General Reports Toggle */}
                    <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between gap-3">
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold text-slate-900 flex items-center space-x-1.5">
                          <FileText className="w-3.5 h-3.5 text-indigo-600" />
                          <span>General Activity & Status Reports</span>
                        </span>
                        <p className="text-[11px] text-slate-500">
                          Permit submission of quarterly summaries, project milestones, hardware inventories, and membership logs. (Typical: Secretary, President).
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer shrink-0">
                        <input
                          type="checkbox"
                          checked={secretaryForm.can_submit_general_reports}
                          onChange={e => setSecretaryForm({ ...secretaryForm, can_submit_general_reports: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-10 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                      </label>
                    </div>

                    {/* Financial Reports Toggle */}
                    <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between gap-3">
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold text-slate-900 flex items-center space-x-1.5">
                          <DollarSign className="w-3.5 h-3.5 text-amber-600" />
                          <span>Financial & Treasury Statements</span>
                        </span>
                        <p className="text-[11px] text-slate-500">
                          Permit filing chapter income, operational expenditures, hardware procurement costs, bank proofs, and grant requests. (Typical: Treasurer, President, Secretary).
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer shrink-0">
                        <input
                          type="checkbox"
                          checked={secretaryForm.can_submit_financial_reports}
                          onChange={e => setSecretaryForm({ ...secretaryForm, can_submit_financial_reports: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-10 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-600"></div>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsSecretaryModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs shadow-md"
                  >
                    Save & Certify Leader Permissions
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* REPORT ASSESSMENT MODAL */}
      <AnimatePresence>
        {assessingReport && (
          <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[2.5rem] max-w-xl w-full shadow-2xl p-6 md:p-8 space-y-6 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <span className="text-[10px] font-black uppercase text-indigo-600">Official National Secretariat Review</span>
                  <h3 className="text-xl font-black text-slate-900">Assess Chapter Secretary Report</h3>
                  <p className="text-xs text-slate-500 font-medium">{assessingReport.chapter_name}</p>
                </div>
                <button onClick={() => setAssessingReport(null)} className="p-2 text-slate-400 hover:text-slate-700">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveAssessment} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 uppercase">Assessment Grade *</label>
                    <select
                      value={assessmentForm.grade}
                      onChange={e => setAssessmentForm({ ...assessmentForm, grade: e.target.value as any })}
                      className="w-full p-3 rounded-xl border border-slate-200 text-xs font-bold"
                    >
                      <option value="Outstanding (A)">Outstanding (A)</option>
                      <option value="Good (B)">Good (B)</option>
                      <option value="Satisfactory (C)">Satisfactory (C)</option>
                      <option value="Needs Improvement (D)">Needs Improvement (D)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 uppercase">Score (0-100) *</label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      required
                      value={assessmentForm.score_out_of_100}
                      onChange={e => setAssessmentForm({ ...assessmentForm, score_out_of_100: Number(e.target.value) })}
                      className="w-full p-3 rounded-xl border border-slate-200 text-xs font-mono font-bold"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase">National Executive Feedback *</label>
                  <textarea
                    rows={4}
                    required
                    value={assessmentForm.national_executive_feedback}
                    onChange={e => setAssessmentForm({ ...assessmentForm, national_executive_feedback: e.target.value })}
                    placeholder="Provide constructive official feedback and assessment remarks..."
                    className="w-full p-3 rounded-xl border border-slate-200 text-xs font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase">Required Action Items</label>
                  <input
                    type="text"
                    value={assessmentForm.action_items_for_chapter}
                    onChange={e => setAssessmentForm({ ...assessmentForm, action_items_for_chapter: e.target.value })}
                    placeholder="e.g. Submit updated roster by next Friday..."
                    className="w-full p-3 rounded-xl border border-slate-200 text-xs"
                  />
                </div>

                {/* Grant Recommendation */}
                <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-2xl space-y-3">
                  <label className="flex items-center space-x-2 text-xs font-bold text-emerald-900 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={assessmentForm.grant_allocation_recommended}
                      onChange={e => setAssessmentForm({ ...assessmentForm, grant_allocation_recommended: e.target.checked })}
                      className="rounded-md accent-emerald-600"
                    />
                    <span>Recommend Chapter Development Grant Allocation</span>
                  </label>

                  {assessmentForm.grant_allocation_recommended && (
                    <div className="space-y-1 pt-1">
                      <label className="text-[11px] font-bold text-emerald-800 uppercase">Recommended Grant Amount ($ USD)</label>
                      <input
                        type="number"
                        min={50}
                        step={25}
                        value={assessmentForm.recommended_grant_usd}
                        onChange={e => setAssessmentForm({ ...assessmentForm, recommended_grant_usd: Number(e.target.value) })}
                        className="w-full p-2.5 bg-white border border-emerald-300 rounded-xl text-xs font-bold text-emerald-950"
                      />
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setAssessingReport(null)}
                    className="px-5 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md"
                  >
                    Submit Official Assessment
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
