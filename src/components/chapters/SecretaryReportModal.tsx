import React, { useState, useMemo, useEffect } from 'react';
import { 
  FileText, Send, Loader2, AlertCircle, CheckCircle2, 
  Link as LinkIcon, Calendar, Users, Building2, HelpCircle, X,
  Lock, ShieldCheck, ShieldAlert, Key, UserCheck, Check, Sparkles,
  DollarSign, PieChart, Landmark, Layers, FileSpreadsheet
} from 'lucide-react';
import { motion } from 'motion/react';
import { Chapter, ReportPeriodType, ChapterReportCategory, ChapterLeader } from '../../types/chapters';
import { submitChapterReport, verifyLeadershipAuthorization, formatRoleName } from '../../services/chaptersService';

interface SecretaryReportModalProps {
  chapters: Chapter[];
  preselectedChapter?: Chapter | null;
  currentUserEmail?: string;
  currentUserName?: string;
  isAdmin?: boolean;
  onClose: () => void;
  onReportSubmitted: () => void;
}

export default function SecretaryReportModal({
  chapters,
  preselectedChapter,
  currentUserEmail,
  currentUserName,
  isAdmin = false,
  onClose,
  onReportSubmitted
}: SecretaryReportModalProps) {
  const [selectedChapterId, setSelectedChapterId] = useState<string>(
    preselectedChapter?.id || (chapters.length > 0 ? chapters[0].id : '')
  );

  const selectedChapter = useMemo(() => {
    return chapters.find(c => c.id === selectedChapterId) || chapters[0] || null;
  }, [chapters, selectedChapterId]);

  // Report Category toggle
  const [reportCategory, setReportCategory] = useState<ChapterReportCategory>('general');

  // Eligible leaders on this chapter for the chosen report category
  const eligibleLeaders = useMemo(() => {
    if (!selectedChapter?.leaders) return [];
    return selectedChapter.leaders.filter(l => {
      if (l.is_approved_by_admin === false) return false;
      if (reportCategory === 'financial') {
        return l.can_submit_financial_reports !== false && ['treasurer', 'chairperson', 'secretary', 'vice_chair', 'vice_secretary'].includes(l.role);
      }
      return l.can_submit_general_reports !== false && ['secretary', 'vice_secretary', 'chairperson', 'vice_chair'].includes(l.role);
    });
  }, [selectedChapter, reportCategory]);

  const defaultLeader = eligibleLeaders[0] || null;

  const [formData, setFormData] = useState({
    report_title: '',
    period_type: 'quarterly' as ReportPeriodType,
    period_date: 'Q1 2026',
    submitted_by_name: currentUserName || defaultLeader?.name || '',
    submitted_by_role: defaultLeader ? formatRoleName(defaultLeader.role) : 'Chapter Executive',
    submitted_by_email: currentUserEmail || defaultLeader?.email || '',
    executive_summary: '',
    activities_undertaken: '',
    attendance_count: 25,
    hardware_projects_update: '',
    challenges_and_needs: '',
    report_document_url: '',
    financial_statement_url: '',
    // Financial Data fields
    opening_balance_usd: 0,
    total_inflow_usd: 0,
    total_expenditure_usd: 0,
    closing_balance_usd: 0,
    grant_received_usd: 0,
    grant_acquittal_notes: '',
    hardware_and_components_usd: 0,
    logistics_and_transport_usd: 0,
    competition_and_events_usd: 0,
    workshop_materials_and_catering_usd: 0,
    tools_and_equipment_usd: 0,
    miscellaneous_usd: 0
  });

  const [accessPin, setAccessPin] = useState('');
  const [lockSubmission, setLockSubmission] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Auto calculate closing balance
  useEffect(() => {
    if (reportCategory === 'financial') {
      const closing = Number(formData.opening_balance_usd || 0) + Number(formData.total_inflow_usd || 0) - Number(formData.total_expenditure_usd || 0);
      setFormData(prev => ({ ...prev, closing_balance_usd: closing }));
    }
  }, [formData.opening_balance_usd, formData.total_inflow_usd, formData.total_expenditure_usd, reportCategory]);

  // Real-time Leadership Verification
  const verificationResult = useMemo(() => {
    if (!selectedChapter) {
      return { isAuthorized: false, reason: 'Please select a valid chapter.' };
    }
    return verifyLeadershipAuthorization(
      selectedChapter,
      formData.submitted_by_email,
      formData.submitted_by_name,
      accessPin,
      isAdmin,
      reportCategory,
      currentUserEmail
    );
  }, [selectedChapter, formData.submitted_by_email, formData.submitted_by_name, accessPin, isAdmin, reportCategory, currentUserEmail]);

  // Synchronize submitter name and role once verified via session or PIN
  useEffect(() => {
    if (verificationResult.isAuthorized) {
      if (isAdmin) {
        setFormData(prev => ({
          ...prev,
          submitted_by_name: currentUserName || 'National Executive Admin',
          submitted_by_role: 'National Executive Administrator',
          submitted_by_email: currentUserEmail || 'admin@yara.org.zw'
        }));
      } else if (verificationResult.matchedLeaderName) {
        const leader = selectedChapter?.leaders?.find(l => l.id === verificationResult.matchedLeaderId);
        setFormData(prev => ({
          ...prev,
          submitted_by_name: verificationResult.matchedLeaderName || prev.submitted_by_name,
          submitted_by_role: verificationResult.matchedRole || (leader ? formatRoleName(leader.role) : prev.submitted_by_role),
          submitted_by_email: leader?.email || currentUserEmail || prev.submitted_by_email
        }));
      }
    }
  }, [verificationResult.isAuthorized, verificationResult.matchedLeaderId, verificationResult.matchedLeaderName, verificationResult.matchedRole, isAdmin, currentUserName, currentUserEmail, selectedChapter]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChapter) {
      setErrorMsg('Please select a YARA chapter.');
      return;
    }

    if (!verificationResult.isAuthorized) {
      setErrorMsg(
        verificationResult.reason || 
        'Authorization Denied: Only individuals specifically approved by the National Executive Administrator for this chapter can submit official reports.'
      );
      return;
    }

    if (!formData.report_title.trim() || !formData.report_document_url.trim()) {
      setErrorMsg('Please provide a report title and the full cloud document URL.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const financialData = reportCategory === 'financial' ? {
        opening_balance_usd: Number(formData.opening_balance_usd) || 0,
        total_inflow_usd: Number(formData.total_inflow_usd) || 0,
        total_expenditure_usd: Number(formData.total_expenditure_usd) || 0,
        closing_balance_usd: Number(formData.closing_balance_usd) || 0,
        grant_received_usd: Number(formData.grant_received_usd) || 0,
        grant_acquittal_notes: formData.grant_acquittal_notes,
        category_breakdown: {
          hardware_and_components_usd: Number(formData.hardware_and_components_usd) || 0,
          logistics_and_transport_usd: Number(formData.logistics_and_transport_usd) || 0,
          competition_and_events_usd: Number(formData.competition_and_events_usd) || 0,
          workshop_materials_and_catering_usd: Number(formData.workshop_materials_and_catering_usd) || 0,
          tools_and_equipment_usd: Number(formData.tools_and_equipment_usd) || 0,
          miscellaneous_usd: Number(formData.miscellaneous_usd) || 0
        },
        treasurer_certified: true,
        treasurer_name: formData.submitted_by_name
      } : undefined;

      await submitChapterReport(
        {
          chapter_id: selectedChapter.id,
          chapter_name: selectedChapter.name,
          chapter_category: selectedChapter.category,
          report_title: formData.report_title,
          report_category: reportCategory,
          period_type: reportCategory === 'financial' ? 'financial' : formData.period_type,
          period_date: formData.period_date,
          submitted_by_name: formData.submitted_by_name || 'Chapter Leader',
          submitted_by_role: formData.submitted_by_role,
          submitted_by_email: formData.submitted_by_email,
          executive_summary: formData.executive_summary,
          activities_undertaken: formData.activities_undertaken,
          attendance_count: Number(formData.attendance_count) || 0,
          hardware_projects_update: formData.hardware_projects_update,
          challenges_and_needs: formData.challenges_and_needs,
          report_document_url: formData.report_document_url,
          financial_statement_url: formData.financial_statement_url || formData.report_document_url,
          financial_data: financialData
        },
        {
          secretarialAccessPin: accessPin,
          isAdmin: isAdmin,
          authenticatedUserEmail: currentUserEmail
        }
      );

      setSuccessMsg(
        lockSubmission
          ? '✓ Report transmitted, cryptographically sealed with National Seal, and LOCKED for Executive Assessment!'
          : '✓ Official Chapter Report submitted successfully to the YARA National Secretariat!'
      );
      setTimeout(() => {
        onReportSubmitted();
        onClose();
      }, 2200);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit chapter report.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 md:p-6 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="bg-white rounded-[2.5rem] max-w-3xl w-full shadow-2xl overflow-hidden my-6 border border-slate-100 flex flex-col max-h-[92vh]"
      >
        {/* Modal Header */}
        <div className="p-6 md:p-8 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="space-y-1">
            <div className="flex items-center space-x-2 text-amber-400 text-xs font-black uppercase tracking-wider">
              <Lock className="w-4 h-4" />
              <span>Admin-Approved Leadership Portal</span>
            </div>
            <h3 className="text-xl md:text-2xl font-black">Submit & Lock Official Chapter Report</h3>
            <p className="text-xs text-slate-300">
              Authorized filings by President, Secretary, or Treasurer for National Executive review & grant audit.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6 overflow-y-auto flex-1">
          {errorMsg && (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs font-bold flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-start space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* REPORT TYPE SELECTOR */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Select Submission Type *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setReportCategory('general')}
                className={`p-4 rounded-2xl border-2 text-left transition-all flex items-start space-x-3 ${
                  reportCategory === 'general'
                    ? 'border-indigo-600 bg-indigo-50/50 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className={`p-2.5 rounded-xl ${reportCategory === 'general' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-900">General Progress & Lab Report</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Activities, prototypes, hardware updates, learner attendance & needs.
                  </p>
                  <span className="inline-block mt-1 text-[10px] font-bold text-indigo-700">
                    Roles: Secretary, President / Chair
                  </span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setReportCategory('financial')}
                className={`p-4 rounded-2xl border-2 text-left transition-all flex items-start space-x-3 ${
                  reportCategory === 'financial'
                    ? 'border-emerald-600 bg-emerald-50/50 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className={`p-2.5 rounded-xl ${reportCategory === 'financial' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                  <Landmark className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-900">Financial Report & Treasury Acquittal</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Budget accounting, national grant acquittal, component procurement & balance sheets.
                  </p>
                  <span className="inline-block mt-1 text-[10px] font-bold text-emerald-700">
                    Roles: Treasurer, President, Secretary
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* Chapter Selection */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Select YARA Chapter *
            </label>
            <select
              value={selectedChapterId}
              onChange={e => setSelectedChapterId(e.target.value)}
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-4 text-xs font-bold text-slate-900 focus:border-indigo-600 outline-none"
              required
            >
              {chapters.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.province}) - Code: {c.code}
                </option>
              ))}
            </select>
          </div>

          {/* LEADERSHIP VERIFICATION BOX */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center space-x-1.5">
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                <span>Admin-Approved Leadership Verification</span>
              </span>
            </div>

            {verificationResult.isAuthorized ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-black text-emerald-950">
                        {verificationResult.matchedLeaderName || formData.submitted_by_name || 'Admin-Approved Submitter'}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                        {verificationResult.matchedRole || 'Certified Chapter Leader'}
                      </span>
                    </div>
                    <p className="text-[11px] text-emerald-800 mt-0.5">
                      {verificationResult.verificationMethod === 'admin_override'
                        ? 'Authenticated with Full National Executive Administrator authority.'
                        : verificationResult.verificationMethod === 'access_pin'
                        ? `Authenticated via Admin-Assigned Secret PIN • Approved by ${verificationResult.approvedBy || 'National Admin'}.`
                        : `Authenticated via verified session for ${currentUserEmail}.`}
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="px-3 py-1 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-wider shadow-2xs">
                    AUTHORIZED ✓
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-5 bg-amber-50/90 border border-amber-200 rounded-2xl space-y-3 shadow-2xs">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 shadow-xs mt-0.5 font-bold">
                    <Lock className="w-4 h-4" />
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs font-black text-amber-950 block">
                      Chapter Report Submission is Gated to Approved Individuals
                    </span>
                    <p className="text-[11px] text-amber-900 leading-relaxed">
                      To prevent unauthorized filings, only individuals specifically approved by the YARA National Executive Administrator for <strong>{selectedChapter?.name}</strong> can submit official progress or financial statements.
                    </p>
                  </div>
                </div>

                {/* Secret Access PIN verification field */}
                <div className="p-3.5 bg-white rounded-xl border border-amber-300 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
                      <Key className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Enter Admin-Assigned Access PIN to Unlock:</span>
                    </label>
                    <span className="text-[10px] font-mono font-bold text-slate-400">Case-Insensitive</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={accessPin}
                      onChange={e => setAccessPin(e.target.value.toUpperCase())}
                      placeholder="e.g. CUT-PRES-4921"
                      className="flex-1 bg-slate-50 border border-slate-300 rounded-xl py-2 px-3 text-xs font-mono font-black text-slate-900 focus:border-indigo-600 focus:bg-white outline-hidden uppercase tracking-wider"
                    />
                  </div>
                  {accessPin.trim().length > 0 && !verificationResult.isAuthorized && (
                    <p className="text-[11px] text-red-700 font-bold flex items-center space-x-1">
                      <AlertCircle className="w-3 h-3 text-red-600" />
                      <span>{verificationResult.reason}</span>
                    </p>
                  )}
                  <p className="text-[10px] text-slate-500 leading-normal">
                    * If you are an appointed chapter chairperson, secretary, or treasurer and do not have an Access PIN, please contact the YARA National Executive Administrator to approve your leadership profile in the Admin Console.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Submitter Details */}
          <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase text-slate-500 tracking-wider">
                Authorized Submitter Profile
              </span>
              {verificationResult.isAuthorized && (
                <span className="text-[10px] font-bold text-emerald-700 flex items-center space-x-1">
                  <Check className="w-3 h-3" />
                  <span>Profile Verified</span>
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-slate-600 uppercase">Leader Name *</label>
                <input
                  type="text"
                  required
                  value={formData.submitted_by_name}
                  onChange={e => setFormData({ ...formData, submitted_by_name: e.target.value })}
                  placeholder="e.g. Tariro Ndlovu"
                  disabled={verificationResult.isAuthorized && verificationResult.verificationMethod !== 'admin_override'}
                  className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs font-medium focus:border-indigo-600 outline-hidden disabled:bg-slate-100 disabled:text-slate-700"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-slate-600 uppercase">Chapter Role *</label>
                <input
                  type="text"
                  required
                  value={formData.submitted_by_role}
                  onChange={e => setFormData({ ...formData, submitted_by_role: e.target.value })}
                  placeholder="e.g. Chapter Secretary"
                  disabled={verificationResult.isAuthorized && verificationResult.verificationMethod !== 'admin_override'}
                  className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs font-medium focus:border-indigo-600 outline-hidden disabled:bg-slate-100 disabled:text-slate-700"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-slate-600 uppercase">Leadership Email *</label>
                <input
                  type="email"
                  required
                  value={formData.submitted_by_email}
                  onChange={e => setFormData({ ...formData, submitted_by_email: e.target.value })}
                  placeholder="leader@cut.ac.zw"
                  disabled={verificationResult.isAuthorized && verificationResult.verificationMethod !== 'admin_override'}
                  className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs font-medium focus:border-indigo-600 outline-hidden disabled:bg-slate-100 disabled:text-slate-700"
                />
              </div>
            </div>
          </div>

          {/* Report Title & Period */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                {reportCategory === 'financial' ? 'Financial Statement Title *' : 'Report Title / Heading *'}
              </label>
              <input
                type="text"
                required
                value={formData.report_title}
                onChange={e => setFormData({ ...formData, report_title: e.target.value })}
                placeholder={reportCategory === 'financial' ? 'e.g. Q1 2026 Treasury & Grant Acquittal Statement' : 'e.g. Q1 2026 Monthly Activities & Lab Report'}
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-4 text-xs font-bold text-slate-900 focus:border-indigo-600 outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Reporting Period *
              </label>
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={formData.period_type}
                  onChange={e => setFormData({ ...formData, period_type: e.target.value as any })}
                  className="bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-3 text-xs font-bold text-slate-900 focus:border-indigo-600 outline-none"
                >
                  {reportCategory === 'financial' ? (
                    <>
                      <option value="financial">Financial Period</option>
                      <option value="quarterly">Quarterly Acquittal</option>
                      <option value="annual">Annual Financials</option>
                    </>
                  ) : (
                    <>
                      <option value="monthly">Monthly Progress</option>
                      <option value="quarterly">Quarterly Audit</option>
                      <option value="special_event">Special Event</option>
                      <option value="project_milestone">Project Milestone</option>
                      <option value="annual">Annual Summary</option>
                    </>
                  )}
                </select>
                <input
                  type="text"
                  required
                  value={formData.period_date}
                  onChange={e => setFormData({ ...formData, period_date: e.target.value })}
                  placeholder="e.g. Q1 2026 or Feb 2026"
                  className="bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-3 text-xs font-bold text-slate-900 focus:border-indigo-600 outline-none"
                />
              </div>
            </div>
          </div>

          {/* FINANCIAL DATA SECTION (If Financial Statement) */}
          {reportCategory === 'financial' && (
            <div className="p-5 bg-emerald-50/70 rounded-2xl border border-emerald-200 space-y-4">
              <div className="flex items-center space-x-2 text-emerald-950">
                <Landmark className="w-5 h-5 text-emerald-700" />
                <h4 className="text-xs font-black uppercase tracking-wider">Chapter Financial Accounting (USD $)</h4>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-600 uppercase">Opening Balance ($)</label>
                  <input
                    type="number"
                    min={0}
                    step="any"
                    value={formData.opening_balance_usd}
                    onChange={e => setFormData({ ...formData, opening_balance_usd: Number(e.target.value) })}
                    className="w-full bg-white border border-emerald-200 rounded-xl py-2 px-3 text-xs font-bold text-slate-900 focus:border-emerald-600 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-600 uppercase">Total Inflows ($)</label>
                  <input
                    type="number"
                    min={0}
                    step="any"
                    value={formData.total_inflow_usd}
                    onChange={e => setFormData({ ...formData, total_inflow_usd: Number(e.target.value) })}
                    className="w-full bg-white border border-emerald-200 rounded-xl py-2 px-3 text-xs font-bold text-slate-900 focus:border-emerald-600 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-600 uppercase">Total Expenses ($)</label>
                  <input
                    type="number"
                    min={0}
                    step="any"
                    value={formData.total_expenditure_usd}
                    onChange={e => setFormData({ ...formData, total_expenditure_usd: Number(e.target.value) })}
                    className="w-full bg-white border border-emerald-200 rounded-xl py-2 px-3 text-xs font-bold text-slate-900 focus:border-emerald-600 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-emerald-900 uppercase">Closing Balance ($)</label>
                  <input
                    type="number"
                    readOnly
                    value={formData.closing_balance_usd}
                    className="w-full bg-emerald-100/80 border border-emerald-300 rounded-xl py-2 px-3 text-xs font-black text-emerald-900 outline-none cursor-default"
                  />
                </div>
              </div>

              {/* Grant Allocation & Acquittal Notes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-emerald-200/60">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-600 uppercase">National Grant Received ($)</label>
                  <input
                    type="number"
                    min={0}
                    step="any"
                    value={formData.grant_received_usd}
                    onChange={e => setFormData({ ...formData, grant_received_usd: Number(e.target.value) })}
                    placeholder="0.00"
                    className="w-full bg-white border border-emerald-200 rounded-xl py-2 px-3 text-xs font-medium text-slate-900 focus:border-emerald-600 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-600 uppercase">Grant Acquittal Summary</label>
                  <input
                    type="text"
                    value={formData.grant_acquittal_notes}
                    onChange={e => setFormData({ ...formData, grant_acquittal_notes: e.target.value })}
                    placeholder="e.g. Full grant applied to underwater drone hull fabrication"
                    className="w-full bg-white border border-emerald-200 rounded-xl py-2 px-3 text-xs font-medium text-slate-900 focus:border-emerald-600 outline-none"
                  />
                </div>
              </div>

              {/* Expenditure Breakdown */}
              <div className="pt-2 border-t border-emerald-200/60 space-y-2">
                <label className="block text-[10px] font-bold text-slate-700 uppercase">
                  Expenditure Breakdown by Category ($ USD)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Hardware & Electronics</span>
                    <input
                      type="number"
                      min={0}
                      value={formData.hardware_and_components_usd}
                      onChange={e => setFormData({ ...formData, hardware_and_components_usd: Number(e.target.value) })}
                      className="w-full bg-white border border-slate-200 rounded-lg py-1.5 px-2 text-xs font-medium"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Logistics & Transport</span>
                    <input
                      type="number"
                      min={0}
                      value={formData.logistics_and_transport_usd}
                      onChange={e => setFormData({ ...formData, logistics_and_transport_usd: Number(e.target.value) })}
                      className="w-full bg-white border border-slate-200 rounded-lg py-1.5 px-2 text-xs font-medium"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Competitions & Events</span>
                    <input
                      type="number"
                      min={0}
                      value={formData.competition_and_events_usd}
                      onChange={e => setFormData({ ...formData, competition_and_events_usd: Number(e.target.value) })}
                      className="w-full bg-white border border-slate-200 rounded-lg py-1.5 px-2 text-xs font-medium"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Workshop Materials</span>
                    <input
                      type="number"
                      min={0}
                      value={formData.workshop_materials_and_catering_usd}
                      onChange={e => setFormData({ ...formData, workshop_materials_and_catering_usd: Number(e.target.value) })}
                      className="w-full bg-white border border-slate-200 rounded-lg py-1.5 px-2 text-xs font-medium"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Tools & Machinery</span>
                    <input
                      type="number"
                      min={0}
                      value={formData.tools_and_equipment_usd}
                      onChange={e => setFormData({ ...formData, tools_and_equipment_usd: Number(e.target.value) })}
                      className="w-full bg-white border border-slate-200 rounded-lg py-1.5 px-2 text-xs font-medium"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Miscellaneous</span>
                    <input
                      type="number"
                      min={0}
                      value={formData.miscellaneous_usd}
                      onChange={e => setFormData({ ...formData, miscellaneous_usd: Number(e.target.value) })}
                      className="w-full bg-white border border-slate-200 rounded-lg py-1.5 px-2 text-xs font-medium"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Cloud Document Link */}
          <div className="space-y-2 p-5 bg-indigo-50/60 rounded-2xl border border-indigo-100">
            <div className="flex items-center space-x-2">
              <LinkIcon className="w-4 h-4 text-indigo-600" />
              <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider">
                {reportCategory === 'financial' ? 'Official Spreadsheet / Financial PDF Link *' : 'Official Document URL (Google Drive / Docs / PDF) *'}
              </label>
            </div>
            <p className="text-[11px] text-slate-500">
              Paste the URL of your chapter's official documentation or financial spreadsheet. This document will be locked with the submission.
            </p>
            <input
              type="url"
              required
              value={formData.report_document_url}
              onChange={e => setFormData({ ...formData, report_document_url: e.target.value })}
              placeholder={reportCategory === 'financial' ? 'https://docs.google.com/spreadsheets/d/... or OneDrive link' : 'https://docs.google.com/document/d/...'}
              className="w-full bg-white border-2 border-indigo-200 rounded-2xl py-3 px-4 text-xs font-mono font-medium text-slate-900 focus:border-indigo-600 outline-none"
            />
          </div>

          {/* Executive Summary */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              {reportCategory === 'financial' ? 'Financial Overview & Comptroller Summary *' : 'Executive Summary of the Period *'}
            </label>
            <textarea
              required
              rows={3}
              value={formData.executive_summary}
              onChange={e => setFormData({ ...formData, executive_summary: e.target.value })}
              placeholder={reportCategory === 'financial' ? 'Summary of chapter treasury balance, grant spending, component procurements, and audit compliance...' : 'Brief overview of major progress, key achievements, and student engagement numbers...'}
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 text-xs font-medium text-slate-900 focus:border-indigo-600 outline-none leading-relaxed"
            />
          </div>

          {/* Hardware & Activities Highlights (for general reports) */}
          {reportCategory === 'general' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Activities & Workshops Undertaken
                  </label>
                  <textarea
                    rows={3}
                    value={formData.activities_undertaken}
                    onChange={e => setFormData({ ...formData, activities_undertaken: e.target.value })}
                    placeholder="e.g. Hosted 4 lab classes, high school visit, 3D printing demos..."
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-3 text-xs font-medium text-slate-900 focus:border-indigo-600 outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Hardware Projects & Prototypes Update
                  </label>
                  <textarea
                    rows={3}
                    value={formData.hardware_projects_update}
                    onChange={e => setFormData({ ...formData, hardware_projects_update: e.target.value })}
                    placeholder="e.g. Submersible thruster testing completed, maze rover code in progress..."
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-3 text-xs font-medium text-slate-900 focus:border-indigo-600 outline-none"
                  />
                </div>
              </div>

              {/* Attendance and Challenges */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Average Lab Attendance (Learners)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={formData.attendance_count}
                    onChange={e => setFormData({ ...formData, attendance_count: Number(e.target.value) })}
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-4 text-xs font-bold text-slate-900"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Challenges & Required National Support
                  </label>
                  <input
                    type="text"
                    value={formData.challenges_and_needs}
                    onChange={e => setFormData({ ...formData, challenges_and_needs: e.target.value })}
                    placeholder="e.g. Need extra battery packs or soldering irons..."
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-4 text-xs font-medium text-slate-900"
                  />
                </div>
              </div>
            </>
          )}

          {/* LOCK TO NATIONAL TOGGLE */}
          <div className="p-4 bg-slate-900 text-white rounded-2xl flex items-center justify-between gap-4">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center shrink-0 mt-0.5">
                <Lock className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-amber-400 flex items-center space-x-1.5">
                  <span>Lock & Seal Submission to National Executive</span>
                </span>
                <p className="text-[11px] text-slate-300 leading-snug">
                  Applies a tamper-evident cryptographic seal ({reportCategory === 'financial' ? 'YARA-SEAL-FIN' : 'YARA-SEAL-NAT'}) and locks this submission against editing once transmitted.
                </p>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={lockSubmission}
                onChange={e => setLockSubmission(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-400"></div>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || !verificationResult.isAuthorized}
            className={`w-full font-bold py-4 rounded-2xl shadow-xl transition-all flex items-center justify-center space-x-2 ${
              verificationResult.isAuthorized
                ? reportCategory === 'financial'
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/20'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Transmitting & Locking Submission to National...</span>
              </>
            ) : !verificationResult.isAuthorized ? (
              <>
                <Lock className="w-4 h-4" />
                <span>Leadership Verification Required to Submit</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4 text-amber-300" />
                <span>Transmit, Seal & Lock {reportCategory === 'financial' ? 'Financial Statement' : 'Report'} to National Executive</span>
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}