import React, { useState } from 'react';
import { 
  Building2, MapPin, Calendar, Users, Cpu, FileText, 
  ExternalLink, Mail, Phone, ShieldCheck, Lock, Unlock, 
  CheckCircle2, Sparkles, AlertCircle, X, ChevronRight,
  Share2, Award, Clock, ArrowRight
} from 'lucide-react';
import { motion } from 'motion/react';
import { Chapter, ChapterReport } from '../../types/chapters';
import { cn } from '../../lib/utils';

interface ChapterDetailModalProps {
  chapter: Chapter;
  isAdmin?: boolean;
  currentUserEmail?: string;
  onClose: () => void;
  onOpenReportModal?: (chapter: Chapter) => void;
}

export default function ChapterDetailModal({
  chapter,
  isAdmin = false,
  currentUserEmail,
  onClose,
  onOpenReportModal
}: ChapterDetailModalProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'projects' | 'activities' | 'leadership' | 'confidential'>('overview');

  const isChapterLeader = currentUserEmail && chapter.leaders?.some(
    l => l.email?.toLowerCase() === currentUserEmail.toLowerCase()
  );

  const canViewConfidential = isAdmin || isChapterLeader;

  const categoryLabels: Record<string, { label: string; bg: string; text: string }> = {
    university: { label: 'University Chapter', bg: 'bg-indigo-50', text: 'text-indigo-700' },
    high_school: { label: 'High School Chapter', bg: 'bg-blue-50', text: 'text-blue-700' },
    primary_school: { label: 'Primary School Chapter', bg: 'bg-emerald-50', text: 'text-emerald-700' },
    community_youth: { label: 'Community Youth Hub', bg: 'bg-amber-50', text: 'text-amber-700' },
    polytechnic: { label: 'Polytechnic College', bg: 'bg-purple-50', text: 'text-purple-700' },
    provincial_hub: { label: 'Provincial Hub', bg: 'bg-rose-50', text: 'text-rose-700' }
  };

  const catStyle = categoryLabels[chapter.category] || { label: 'YARA Chapter', bg: 'bg-slate-100', text: 'text-slate-700' };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 md:p-6 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="bg-white rounded-[2.5rem] max-w-4xl w-full shadow-2xl overflow-hidden my-6 border border-slate-100 flex flex-col max-h-[90vh]"
      >
        {/* Modal Hero / Banner */}
        <div className="relative h-48 sm:h-56 bg-slate-900 overflow-hidden shrink-0">
          {chapter.banner_url ? (
            <img 
              src={chapter.banner_url} 
              alt={chapter.name}
              className="w-full h-full object-cover opacity-60"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 flex items-center justify-center opacity-80">
              <Building2 className="w-16 h-16 text-indigo-400/30" />
            </div>
          )}

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2.5 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-md transition-all z-10"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Code & Category Pill */}
          <div className="absolute bottom-4 left-6 right-6 flex flex-wrap items-center justify-between gap-2 z-10">
            <div className="flex items-center space-x-2">
              <span className={cn("px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider backdrop-blur-md", catStyle.bg, catStyle.text)}>
                {catStyle.label}
              </span>
              <span className="px-3 py-1 rounded-full text-[11px] font-mono font-bold bg-white/20 text-white backdrop-blur-md">
                {chapter.code}
              </span>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500 text-white shadow-xs">
                {chapter.status}
              </span>
            </div>

            {onOpenReportModal && (
              <button
                onClick={() => {
                  onClose();
                  onOpenReportModal(chapter);
                }}
                className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center space-x-1.5 transition-all"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Submit Secretary Report</span>
              </button>
            )}
          </div>
        </div>

        {/* Header Content */}
        <div className="p-6 md:p-8 pb-4 border-b border-slate-100 space-y-3 shrink-0">
          <div>
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 leading-tight">
              {chapter.name}
            </h2>
            <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs font-semibold text-slate-500 mt-1.5">
              <span className="flex items-center space-x-1">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                <span>{chapter.institution_or_community}</span>
              </span>
              <span className="flex items-center space-x-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>{chapter.district_or_city}, {chapter.province}</span>
              </span>
              <span className="flex items-center space-x-1">
                <Users className="w-3.5 h-3.5 text-slate-400" />
                <span>{chapter.total_members_count} Active Members</span>
              </span>
            </div>
          </div>

          {/* Navigation Sub-Tabs */}
          <div className="flex items-center space-x-1 overflow-x-auto pb-1 scrollbar-none pt-2">
            {[
              { id: 'overview', label: 'Chapter Overview' },
              { id: 'projects', label: `Projects (${chapter.projects?.length || 0})` },
              { id: 'activities', label: `Activities & Workshops (${chapter.activities?.length || 0})` },
              { id: 'leadership', label: 'Leadership & Patron' },
              ...(canViewConfidential ? [{ id: 'confidential', label: '🔒 Confidential & Executive' }] : [])
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all",
                  activeTab === tab.id
                    ? "bg-slate-900 text-white shadow-sm"
                    : "bg-slate-50 hover:bg-slate-100 text-slate-600"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-6 md:p-8 overflow-y-auto space-y-6 flex-1">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="space-y-2">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">About This Chapter</h4>
                <p className="text-sm text-slate-700 font-medium leading-relaxed">
                  {chapter.description}
                </p>
              </div>

              {/* Quick Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {chapter.meeting_schedule && (
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Meeting Schedule</span>
                    <p className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
                      <Clock className="w-3.5 h-3.5 text-indigo-600" />
                      <span>{chapter.meeting_schedule}</span>
                    </p>
                  </div>
                )}

                {chapter.physical_location && (
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Lab / Workshop Location</span>
                    <p className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{chapter.physical_location}</span>
                    </p>
                  </div>
                )}
              </div>

              {/* Focus Areas */}
              {chapter.focus_areas && chapter.focus_areas.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Specialization & Focus Areas</h4>
                  <div className="flex flex-wrap gap-2">
                    {chapter.focus_areas.map(area => (
                      <span key={area} className="px-3 py-1 bg-indigo-50 text-indigo-800 font-bold text-xs rounded-xl">
                        #{area}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Public Contact & Socials */}
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-slate-900">Get Involved with this Chapter</span>
                  <p className="text-[11px] text-slate-500">Contact the chapter desk for inquiries, membership, or project collaborations.</p>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
                  {chapter.public_email && (
                    <a
                      href={`mailto:${chapter.public_email}`}
                      className="px-3 py-1.5 bg-white border border-slate-200 hover:border-indigo-500 rounded-xl text-slate-700 flex items-center space-x-1.5 shadow-2xs"
                    >
                      <Mail className="w-3 h-3 text-indigo-600" />
                      <span>{chapter.public_email}</span>
                    </a>
                  )}

                  {chapter.public_social_links?.twitter && (
                    <a
                      href={chapter.public_social_links.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-white border border-slate-200 hover:text-indigo-600 rounded-xl text-slate-600"
                      title="Twitter / X"
                    >
                      X
                    </a>
                  )}

                  {chapter.public_social_links?.linkedin && (
                    <a
                      href={chapter.public_social_links.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-white border border-slate-200 hover:text-indigo-600 rounded-xl text-slate-600"
                      title="LinkedIn"
                    >
                      in
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PROJECTS */}
          {activeTab === 'projects' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Active Hardware & Robotics Projects</h4>
                <span className="text-xs text-slate-400 font-medium">{chapter.projects?.length || 0} Projects Documented</span>
              </div>

              {!chapter.projects || chapter.projects.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-400 text-xs">
                  No active projects documented yet for this chapter.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {chapter.projects.map(proj => (
                    <div key={proj.id} className="p-5 bg-white rounded-2xl border border-slate-100 shadow-2xs space-y-3 flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-700">
                            {proj.category.replace('_', ' ')}
                          </span>
                          <span className={cn(
                            "px-2 py-0.5 rounded-md text-[10px] font-bold uppercase",
                            proj.status === 'completed' ? "bg-emerald-50 text-emerald-700" :
                            proj.status === 'testing' ? "bg-amber-50 text-amber-700" : "bg-indigo-50 text-indigo-700"
                          )}>
                            {proj.status.replace('_', ' ')}
                          </span>
                        </div>

                        {proj.image_url && (
                          <div className="h-36 rounded-xl overflow-hidden bg-slate-100">
                            <img 
                              src={proj.image_url} 
                              alt={proj.title}
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                        )}

                        <h5 className="font-bold text-slate-900 text-sm">{proj.title}</h5>
                        <p className="text-xs text-slate-600 font-medium leading-relaxed line-clamp-3">
                          {proj.description}
                        </p>
                      </div>

                      {proj.hardware_stack && proj.hardware_stack.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-2 border-t border-slate-100">
                          {proj.hardware_stack.map(h => (
                            <span key={h} className="text-[10px] font-mono font-bold bg-slate-50 text-slate-500 px-2 py-0.5 rounded-md">
                              {h}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: ACTIVITIES */}
          {activeTab === 'activities' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Community Outreach & Events</h4>
                <span className="text-xs text-slate-400 font-medium">{chapter.activities?.length || 0} Events Logged</span>
              </div>

              {!chapter.activities || chapter.activities.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-400 text-xs">
                  No public workshops or events logged yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {chapter.activities.map(act => (
                    <div key={act.id} className="p-5 bg-slate-50/70 rounded-2xl border border-slate-100 flex flex-col md:flex-row md:items-start justify-between gap-3">
                      <div className="space-y-1 max-w-xl">
                        <div className="flex items-center space-x-2">
                          <h5 className="font-bold text-slate-900 text-sm">{act.title}</h5>
                          <span className="text-[11px] font-bold text-slate-400">
                            • {new Date(act.date).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 font-medium leading-relaxed">
                          {act.description}
                        </p>
                      </div>

                      {act.impact_metric && (
                        <span className="px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold shrink-0 self-start">
                          ✨ {act.impact_metric}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: LEADERSHIP */}
          {activeTab === 'leadership' && (
            <div className="space-y-6">
              {/* Chapter Leaders Roster */}
              <div className="space-y-3">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Executive Committee Leaders</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {chapter.leaders?.map(leader => (
                    <div key={leader.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-indigo-50 text-indigo-700 inline-block">
                        {leader.role.replace('_', ' ')}
                      </span>
                      <h5 className="font-bold text-slate-900 text-sm">{leader.name}</h5>
                      {leader.department_or_grade && (
                        <p className="text-[11px] text-slate-500 font-medium">{leader.department_or_grade}</p>
                      )}
                      {leader.is_public_contact && leader.email && (
                        <p className="text-[11px] text-indigo-600 font-mono pt-1 truncate">{leader.email}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Patron / Advisor */}
              {chapter.patron_advisor && (
                <div className="p-5 bg-indigo-50/60 rounded-2xl border border-indigo-100 flex items-start space-x-3">
                  <div className="p-2.5 bg-indigo-600 text-white rounded-xl">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-indigo-700 block">Faculty Patron / Senior Advisor</span>
                    <h5 className="font-bold text-slate-900 text-sm">{chapter.patron_advisor.name}</h5>
                    <p className="text-xs text-slate-600 font-medium">
                      {chapter.patron_advisor.title} • {chapter.patron_advisor.organization}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: CONFIDENTIAL & EXECUTIVE DATA (Only visible to Admin or Chapter Leader) */}
          {activeTab === 'confidential' && canViewConfidential && (
            <div className="space-y-6">
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start space-x-3 text-amber-900">
                <Lock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <span className="font-bold block">CONFIDENTIAL CHAPTER EXECUTIVE DATA</span>
                  <p className="text-amber-800">
                    This section is strictly hidden from public visitors. Only registered Chapter Leaders and YARA National Executive Administrators can view these financial balances, private notes, and internal access credentials.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Internal Chapter Account Balance</span>
                  <div className="flex items-baseline space-x-1">
                    <span className="text-2xl font-black text-slate-900">
                      ${chapter.confidential_info?.internal_budget_balance_usd || 0}
                    </span>
                    <span className="text-xs font-bold text-slate-400">USD</span>
                  </div>
                  {chapter.confidential_info?.internal_bank_or_ecocash_details && (
                    <p className="text-xs font-mono text-slate-600 bg-white p-2.5 rounded-xl border border-slate-200 mt-2">
                      {chapter.confidential_info.internal_bank_or_ecocash_details}
                    </p>
                  )}
                </div>

                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">National Executive Supervisor</span>
                  <p className="text-sm font-bold text-slate-900">
                    {chapter.confidential_info?.national_patron_supervisor || 'Assigned by National Executive Secretariat'}
                  </p>
                  {chapter.confidential_info?.inventory_access_code && (
                    <div className="pt-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Lab / Locker Access Passcode:</span>
                      <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-md inline-block">
                        {chapter.confidential_info.inventory_access_code}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {chapter.confidential_info?.private_executive_notes && (
                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Confidential Executive Notes & Recommendations</span>
                  <p className="text-xs text-slate-700 font-medium leading-relaxed whitespace-pre-wrap">
                    {chapter.confidential_info.private_executive_notes}
                  </p>
                </div>
              )}

              {chapter.confidential_info?.internal_drive_link && (
                <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-200">
                  <span className="text-xs font-bold text-slate-800">Chapter Internal Google Drive Folder</span>
                  <a
                    href={chapter.confidential_info.internal_drive_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-xl text-xs"
                  >
                    <span>Open Drive</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="p-6 border-t border-slate-100 bg-slate-50/70 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-500 font-medium">
            Official YARA Chapter • Established {new Date(chapter.established_date).toLocaleDateString(undefined, { year: 'numeric', month: 'long' })}
          </div>

          <div className="flex items-center space-x-2">
            {onOpenReportModal && (
              <button
                onClick={() => {
                  onClose();
                  onOpenReportModal(chapter);
                }}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-200 flex items-center space-x-1.5 transition-all"
              >
                <FileText className="w-4 h-4" />
                <span>Submit Secretary Report</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs transition-all"
            >
              Close
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
