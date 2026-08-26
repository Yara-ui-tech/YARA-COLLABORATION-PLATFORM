import React, { useState } from 'react';
import { 
  FileText, Send, Loader2, AlertCircle, CheckCircle2, 
  Link as LinkIcon, Calendar, Users, Building2, HelpCircle, X
} from 'lucide-react';
import { motion } from 'motion/react';
import { Chapter, ReportPeriodType } from '../../types/chapters';
import { submitChapterReport } from '../../services/chaptersService';

interface SecretaryReportModalProps {
  chapters: Chapter[];
  preselectedChapter?: Chapter | null;
  currentUserEmail?: string;
  currentUserName?: string;
  onClose: () => void;
  onReportSubmitted: () => void;
}

export default function SecretaryReportModal({
  chapters,
  preselectedChapter,
  currentUserEmail,
  currentUserName,
  onClose,
  onReportSubmitted
}: SecretaryReportModalProps) {
  const [selectedChapterId, setSelectedChapterId] = useState<string>(
    preselectedChapter?.id || (chapters.length > 0 ? chapters[0].id : '')
  );

  const [formData, setFormData] = useState({
    report_title: '',
    period_type: 'monthly' as ReportPeriodType,
    period_date: 'February 2026',
    submitted_by_name: currentUserName || '',
    submitted_by_role: 'Chapter Secretary',
    submitted_by_email: currentUserEmail || '',
    executive_summary: '',
    activities_undertaken: '',
    attendance_count: 25,
    hardware_projects_update: '',
    challenges_and_needs: '',
    report_document_url: '',
    financial_statement_url: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChapterId) {
      setErrorMsg('Please select a YARA chapter.');
      return;
    }

    if (!formData.report_title.trim() || !formData.report_document_url.trim()) {
      setErrorMsg('Please provide a report title and the cloud document link (Google Docs / Drive / PDF).');
      return;
    }

    const targetChapter = chapters.find(c => c.id === selectedChapterId);
    if (!targetChapter) {
      setErrorMsg('Selected chapter not found.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      await submitChapterReport({
        chapter_id: targetChapter.id,
        chapter_name: targetChapter.name,
        chapter_category: targetChapter.category,
        report_title: formData.report_title,
        period_type: formData.period_type,
        period_date: formData.period_date,
        submitted_by_name: formData.submitted_by_name || 'Chapter Secretary',
        submitted_by_role: formData.submitted_by_role,
        submitted_by_email: formData.submitted_by_email || 'secretary@chapter.yara.org.zw',
        executive_summary: formData.executive_summary,
        activities_undertaken: formData.activities_undertaken,
        attendance_count: Number(formData.attendance_count) || 0,
        hardware_projects_update: formData.hardware_projects_update,
        challenges_and_needs: formData.challenges_and_needs,
        report_document_url: formData.report_document_url,
        financial_statement_url: formData.financial_statement_url || undefined
      });

      setSuccessMsg('Secretary Report submitted successfully to the YARA National Executive Secretariat!');
      setTimeout(() => {
        onReportSubmitted();
        onClose();
      }, 2000);
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
        className="bg-white rounded-[2.5rem] max-w-2xl w-full shadow-2xl overflow-hidden my-6 border border-slate-100 flex flex-col max-h-[90vh]"
      >
        {/* Modal Header */}
        <div className="p-6 md:p-8 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="space-y-1">
            <div className="flex items-center space-x-2 text-amber-400 text-xs font-black uppercase tracking-wider">
              <FileText className="w-4 h-4" />
              <span>Chapter Secretary Report Filing</span>
            </div>
            <h3 className="text-xl md:text-2xl font-black">Submit Official Chapter Report</h3>
            <p className="text-xs text-slate-300">
              For review, grading, and grant assessment by the YARA National Executive Committee.
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
            <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs font-bold flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

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
                  {c.name} ({c.province})
                </option>
              ))}
            </select>
          </div>

          {/* Report Title & Period */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Report Title / Heading *
              </label>
              <input
                type="text"
                required
                value={formData.report_title}
                onChange={e => setFormData({ ...formData, report_title: e.target.value })}
                placeholder="e.g. Q1 2026 Monthly Activities & Lab Report"
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-4 text-xs font-bold text-slate-900 focus:border-indigo-600 outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Period & Timing *
              </label>
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={formData.period_type}
                  onChange={e => setFormData({ ...formData, period_type: e.target.value as any })}
                  className="bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-3 text-xs font-bold text-slate-900 focus:border-indigo-600 outline-none"
                >
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="special_event">Special Event</option>
                  <option value="project_milestone">Project Milestone</option>
                  <option value="financial">Financial Report</option>
                  <option value="annual">Annual</option>
                </select>
                <input
                  type="text"
                  required
                  value={formData.period_date}
                  onChange={e => setFormData({ ...formData, period_date: e.target.value })}
                  placeholder="e.g. Feb 2026 or Q1"
                  className="bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-3 text-xs font-bold text-slate-900 focus:border-indigo-600 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Submitter Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 bg-slate-50/70 rounded-2xl border border-slate-100">
            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-slate-600 uppercase">Secretary / Submitter Name</label>
              <input
                type="text"
                required
                value={formData.submitted_by_name}
                onChange={e => setFormData({ ...formData, submitted_by_name: e.target.value })}
                placeholder="Full Name"
                className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs font-medium"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-slate-600 uppercase">Chapter Role</label>
              <input
                type="text"
                required
                value={formData.submitted_by_role}
                onChange={e => setFormData({ ...formData, submitted_by_role: e.target.value })}
                placeholder="e.g. Chapter Secretary"
                className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs font-medium"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-slate-600 uppercase">Official Email</label>
              <input
                type="email"
                required
                value={formData.submitted_by_email}
                onChange={e => setFormData({ ...formData, submitted_by_email: e.target.value })}
                placeholder="name@yara.org.zw"
                className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs font-medium"
              />
            </div>
          </div>

          {/* Cloud Document Link (Google Drive / Docs / OneDrive / PDF) */}
          <div className="space-y-2 p-5 bg-indigo-50/60 rounded-2xl border border-indigo-100">
            <div className="flex items-center space-x-2">
              <LinkIcon className="w-4 h-4 text-indigo-600" />
              <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider">
                Full Cloud Document Link (Google Drive / Docs / PDF / OneDrive) *
              </label>
            </div>
            <p className="text-[11px] text-slate-500">
              Paste your shared document URL so the National Executive can open, review, and evaluate your detailed write-up, tables, and photos.
            </p>
            <input
              type="url"
              required
              value={formData.report_document_url}
              onChange={e => setFormData({ ...formData, report_document_url: e.target.value })}
              placeholder="https://docs.google.com/document/d/... or https://drive.google.com/..."
              className="w-full bg-white border-2 border-indigo-200 rounded-2xl py-3 px-4 text-xs font-mono font-medium text-slate-900 focus:border-indigo-600 outline-none"
            />
          </div>

          {/* Executive Summary */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Executive Summary of the Period *
            </label>
            <textarea
              required
              rows={3}
              value={formData.executive_summary}
              onChange={e => setFormData({ ...formData, executive_summary: e.target.value })}
              placeholder="Brief overview of major progress, key achievements, and student engagement numbers..."
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 text-xs font-medium text-slate-900 focus:border-indigo-600 outline-none leading-relaxed"
            />
          </div>

          {/* Hardware & Activities Highlights */}
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

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-2xl shadow-xl shadow-indigo-100 transition-all flex items-center justify-center space-x-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Transmitting Report to National Executive...</span>
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                <span>Submit Official Report for National Assessment</span>
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
