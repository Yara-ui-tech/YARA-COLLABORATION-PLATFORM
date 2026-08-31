import React from 'react';
import { 
  Sparkles, Building2, MapPin, Users, ArrowRight, ShieldCheck, 
  Landmark, UserCheck, CheckCircle2, ChevronRight, FileText
} from 'lucide-react';
import { motion } from 'motion/react';
import { Chapter } from '../../types/chapters';
import { cn } from '../../lib/utils';

interface ChapterAutoSuggestCardProps {
  detection: {
    chapter: Chapter;
    role: string;
    isLeader: boolean;
    matchField: 'email' | 'name' | 'phone';
    provincialLeadInfo?: {
      isLeadUniversity: boolean;
      assignedLeadName?: string;
    };
  };
  userName?: string;
  onEnterPortal: (chapter: Chapter) => void;
  onOpenReportModal?: (chapter: Chapter) => void;
}

export default function ChapterAutoSuggestCard({
  detection,
  userName,
  onEnterPortal,
  onOpenReportModal
}: ChapterAutoSuggestCardProps) {
  const { chapter, role, isLeader, matchField, provincialLeadInfo } = detection;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-900 text-white p-6 md:p-8 shadow-xl border border-indigo-700/40"
    >
      {/* Decorative Glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-3 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 bg-amber-400 text-slate-950 rounded-full text-xs font-black uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Chapter Recognized</span>
            </span>

            <span className="px-3 py-1 bg-white/10 text-indigo-200 border border-white/10 rounded-full text-xs font-bold">
              Matched by {matchField.toUpperCase()}
            </span>

            {isLeader && (
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-xs font-black uppercase tracking-wider flex items-center space-x-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Executive Officer</span>
              </span>
            )}
          </div>

          <h3 className="text-xl md:text-2xl font-black tracking-tight leading-tight">
            Welcome back{userName ? `, ${userName}` : ''}! You are registered with{' '}
            <span className="text-amber-300">{chapter.name}</span>
          </h3>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-300 font-medium">
            <span className="flex items-center space-x-1">
              <Building2 className="w-3.5 h-3.5 text-indigo-400" />
              <span>{chapter.institution_or_community}</span>
            </span>

            <span className="flex items-center space-x-1">
              <MapPin className="w-3.5 h-3.5 text-indigo-400" />
              <span>{chapter.district_or_city}, {chapter.province}</span>
            </span>

            <span className="flex items-center space-x-1 text-emerald-300 font-bold">
              <UserCheck className="w-3.5 h-3.5" />
              <span>Your Role: {role}</span>
            </span>
          </div>

          {/* Provincial Hierarchy Note */}
          <div className="pt-1 flex items-center space-x-2 text-xs text-slate-300">
            <Landmark className="w-4 h-4 text-amber-400 shrink-0" />
            {provincialLeadInfo?.isLeadUniversity ? (
              <span>Provincial Status: <strong>Designated Provincial Lead University</strong> for {chapter.province}.</span>
            ) : (
              <span>
                Provincial Hub: Mentored & led by <strong>{provincialLeadInfo?.assignedLeadName || chapter.assigned_provincial_university_name || 'Provincial Lead University'}</strong>.
              </span>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            onClick={() => onEnterPortal(chapter)}
            className="px-6 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shadow-lg shadow-amber-400/20 flex items-center space-x-2 transition-all"
          >
            <span>Enter Chapter Portal & Roster</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {isLeader && onOpenReportModal && (
            <button
              onClick={() => onOpenReportModal(chapter)}
              className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold text-xs flex items-center space-x-1.5 transition-all"
            >
              <FileText className="w-3.5 h-3.5 text-indigo-300" />
              <span>Submit Report</span>
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
