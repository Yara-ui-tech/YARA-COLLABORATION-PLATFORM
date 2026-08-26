import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building2, School, Users, FileText, CheckCircle2, AlertCircle, 
  ExternalLink, Search, Filter, Plus, Trash2, Edit3, Shield, 
  Lock, Unlock, Award, Clock, DollarSign, Send, ChevronDown, 
  ChevronUp, Check, X, Sparkles, AlertTriangle
} from 'lucide-react';
import { 
  Chapter, ChapterReport, ChapterCategory, ChapterStatus, 
  NationalExecutiveAssessment, ReportStatus 
} from '../../types/chapters';
import { 
  getChapters, createChapter, updateChapter, deleteChapter,
  getChapterReports, assessChapterReport, updateChapterReportStatus, deleteChapterReport
} from '../../services/chaptersService';
import { cn } from '../../lib/utils';

export default function ChaptersAdminTab() {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [reports, setReports] = useState<ChapterReport[]>([]);
  const [loading, setLoading] = useState(true);

  // Sub-tabs: 'chapters' | 'reports'
  const [activeSubTab, setActiveSubTab] = useState<'chapters' | 'reports'>('chapters');

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

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [reportStatusFilter, setReportStatusFilter] = useState<string>('ALL');

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
        r.submitted_by_name.toLowerCase().includes(searchQuery.toLowerCase());

      const matchStatus = reportStatusFilter === 'ALL' || r.status === reportStatusFilter;
      return matchSearch && matchStatus;
    });
  }, [reports, searchQuery, reportStatusFilter]);

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="p-6 md:p-8 bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 rounded-3xl text-white flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-amber-400 text-xs font-black uppercase tracking-widest">
            <Shield className="w-4 h-4" />
            <span>National Chapters & Secretary Assessment Center</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-black tracking-tight">
            YARA Chapters Administration
          </h2>
          <p className="text-slate-300 text-xs md:text-sm max-w-xl">
            Charter and manage tertiary (CUT, UZ), secondary, primary, and community youth chapters. Review and grade official Secretary Reports, evaluate progress, and allocate grants.
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
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
        <div className="flex items-center space-x-2">
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
            onClick={() => setActiveSubTab('reports')}
            className={cn(
              "px-5 py-2.5 rounded-2xl font-bold text-xs transition-all flex items-center space-x-2",
              activeSubTab === 'reports'
                ? "bg-indigo-600 text-white shadow-md"
                : "bg-slate-100 hover:bg-slate-200 text-slate-700"
            )}
          >
            <FileText className="w-4 h-4" />
            <span>Secretary Reports & Assessments ({reports.length})</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative max-w-xs w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search chapters or reports..."
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
              {filteredChapters.map(chapter => (
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

                    {/* Confidential Info Summary for Admin */}
                    <div className="p-3.5 bg-amber-50/70 border border-amber-200/60 rounded-2xl space-y-1 text-xs">
                      <div className="flex items-center justify-between text-amber-900 font-bold">
                        <span className="flex items-center space-x-1">
                          <Lock className="w-3 h-3 text-amber-700" />
                          <span>Confidential Balance:</span>
                        </span>
                        <span>${chapter.confidential_info?.internal_budget_balance_usd || 0} USD</span>
                      </div>
                      {chapter.confidential_info?.private_executive_notes && (
                        <p className="text-[11px] text-amber-800 italic line-clamp-1">
                          Note: {chapter.confidential_info.private_executive_notes}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <span className="text-xs font-bold text-slate-500">
                      {chapter.total_members_count} Members • {chapter.projects?.length || 0} Projects
                    </span>

                    <div className="flex items-center space-x-2">
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
              ))}
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 2: SECRETARY REPORTS & NATIONAL ASSESSMENTS */}
      {activeSubTab === 'reports' && (
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-slate-500">Filter Status:</span>
            {['ALL', 'submitted', 'assessed'].map(status => (
              <button
                key={status}
                onClick={() => setReportStatusFilter(status)}
                className={cn(
                  "px-3 py-1 rounded-xl text-xs font-bold transition-all",
                  reportStatusFilter === status ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600"
                )}
              >
                {status === 'ALL' ? 'All Reports' : status === 'submitted' ? 'Pending Assessment' : 'Assessed & Graded'}
              </button>
            ))}
          </div>

          {filteredReports.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 text-slate-400">
              No secretary reports matching criteria.
            </div>
          ) : (
            <div className="space-y-4">
              {filteredReports.map(report => (
                <div
                  key={report.id}
                  className="p-6 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-4"
                >
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-slate-100 pb-4">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-indigo-50 text-indigo-700">
                          {report.chapter_name}
                        </span>
                        <span className="text-xs text-slate-400 font-bold">
                          • {report.period_date} ({report.period_type})
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-900 text-lg">{report.report_title}</h4>
                      <p className="text-xs text-slate-500 font-medium">
                        Submitted by: <strong className="text-slate-800">{report.submitted_by_name}</strong> ({report.submitted_by_role}) • {report.submitted_by_email}
                      </p>
                    </div>

                    <div className="flex items-center space-x-3 shrink-0">
                      <span className={cn(
                        "px-3 py-1 rounded-xl text-xs font-black uppercase",
                        report.status === 'assessed' ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                      )}>
                        {report.status === 'assessed' ? 'Assessed' : 'Pending Assessment'}
                      </span>

                      <a
                        href={report.report_document_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center space-x-1.5 shadow-2xs"
                      >
                        <span>Open Document</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>

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
              ))}
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
