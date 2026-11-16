import React, { useState, useMemo, useEffect } from 'react';
import { 
  Building2, MapPin, Calendar, Users, Cpu, FileText, 
  ExternalLink, Mail, Phone, ShieldCheck, Lock, Unlock, 
  CheckCircle2, AlertCircle, X, ChevronRight,
  Share2, Award, Clock, ArrowRight, Landmark, Search,
  GraduationCap, UserCheck, Shield, Globe, Edit2, Plus,
  ListChecks, CheckSquare, Rocket
} from 'lucide-react';
import { motion } from 'motion/react';
import { Chapter, ChapterMember, ChapterReport, ChapterClub } from '../../types/chapters';
import { cn } from '../../lib/utils';
import { getChapterReports, updateChapter } from '../../services/chaptersService';
import { getProvincialMinistries } from '../../constants/zimbabweHierarchy';
import ClubFormationModal from './ClubFormationModal';

interface ChapterDetailModalProps {
  chapter: Chapter;
  isAdmin?: boolean;
  currentUserEmail?: string;
  onClose: () => void;
  onOpenReportModal?: (chapter: Chapter) => void;
  onChapterUpdated?: (chapter: Chapter) => void;
}

export default function ChapterDetailModal({
  chapter,
  isAdmin = false,
  currentUserEmail,
  onClose,
  onOpenReportModal,
  onChapterUpdated
}: ChapterDetailModalProps) {
  const [currentChapter, setCurrentChapter] = useState<Chapter>(chapter);
  const [activeTab, setActiveTab] = useState<'overview' | 'members' | 'clubs' | 'minutes_agendas' | 'projects' | 'activities' | 'leadership' | 'confidential'>('overview');
  const [memberSearch, setMemberSearch] = useState('');
  const [memberRoleFilter, setMemberRoleFilter] = useState('ALL');
  const [isClubModalOpen, setIsClubModalOpen] = useState(false);

  // Website editing
  const [isEditingWebsite, setIsEditingWebsite] = useState(false);
  const [websiteInput, setWebsiteInput] = useState(chapter.website_url || '');
  const [isSavingWebsite, setIsSavingWebsite] = useState(false);

  // Minutes and Agendas
  const [meetingReports, setMeetingReports] = useState<ChapterReport[]>([]);
  const [isLoadingReports, setIsLoadingReports] = useState(false);
  const [reportsFilter, setReportsFilter] = useState<'all' | 'minutes' | 'agendas'>('all');

  useEffect(() => {
    setCurrentChapter(chapter);
    setWebsiteInput(chapter.website_url || '');
  }, [chapter]);

  useEffect(() => {
    let isMounted = true;
    setIsLoadingReports(true);
    getChapterReports(currentChapter.id)
      .then(reps => {
        if (!isMounted) return;
        const meetings = (reps || []).filter(r => 
          r.category === 'meeting_minutes' || 
          r.category === 'meeting_agenda' || 
          Boolean(r.meeting_minutes) || 
          Boolean(r.meeting_agenda)
        );
        setMeetingReports(meetings);
      })
      .catch(err => {
        console.error('Failed to load meeting reports:', err);
      })
      .finally(() => {
        if (isMounted) setIsLoadingReports(false);
      });
    return () => {
      isMounted = false;
    };
  }, [currentChapter.id]);

  const isChapterLeader = currentUserEmail && currentChapter.leaders?.some(
    l => l.email?.toLowerCase() === currentUserEmail.toLowerCase()
  );

  const isChapterMember = currentUserEmail && currentChapter.members?.some(
    m => m.email?.toLowerCase() === currentUserEmail.toLowerCase()
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

  const catStyle = categoryLabels[currentChapter.category] || { label: 'YARA Chapter', bg: 'bg-slate-100', text: 'text-slate-700' };

  // Filter members
  const filteredMembers = useMemo(() => {
    const memList = currentChapter.members || [];
    return memList.filter(m => {
      const matchSearch = 
        m.name.toLowerCase().includes(memberSearch.toLowerCase()) ||
        (m.email && m.email.toLowerCase().includes(memberSearch.toLowerCase())) ||
        (m.role && m.role.toLowerCase().includes(memberSearch.toLowerCase())) ||
        (m.student_or_staff_id && m.student_or_staff_id.toLowerCase().includes(memberSearch.toLowerCase()));

      const matchRole = memberRoleFilter === 'ALL' || (m.role && m.role.toLowerCase().includes(memberRoleFilter.toLowerCase()));

      return matchSearch && matchRole;
    });
  }, [currentChapter.members, memberSearch, memberRoleFilter]);

  const handleSaveWebsite = async () => {
    setIsSavingWebsite(true);
    try {
      const formattedUrl = websiteInput.trim();
      const updated = await updateChapter(currentChapter.id, { website_url: formattedUrl });
      if (updated) {
        setCurrentChapter(updated);
        onChapterUpdated?.(updated);
      } else {
        const next = { ...currentChapter, website_url: formattedUrl };
        setCurrentChapter(next);
        onChapterUpdated?.(next);
      }
      setIsEditingWebsite(false);
    } catch (err) {
      console.error('Failed to update chapter website:', err);
    } finally {
      setIsSavingWebsite(false);
    }
  };

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
          {currentChapter.banner_url ? (
            <img 
              src={currentChapter.banner_url} 
              alt={currentChapter.name}
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
            <div className="flex flex-wrap items-center gap-2">
              <span className={cn("px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider backdrop-blur-md", catStyle.bg, catStyle.text)}>
                {catStyle.label}
              </span>
              <span className="px-3 py-1 rounded-full text-[11px] font-mono font-bold bg-white/20 text-white backdrop-blur-md">
                {currentChapter.code}
              </span>
              {currentChapter.is_provincial_lead_university && (
                <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-400 text-slate-950 flex items-center space-x-1 shadow-sm">
                  <Landmark className="w-3 h-3" />
                  <span>Provincial University Lead</span>
                </span>
              )}
              <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500 text-white shadow-xs">
                {currentChapter.status}
              </span>
            </div>

            {onOpenReportModal && (
              <button
                onClick={() => {
                  onClose();
                  onOpenReportModal(currentChapter);
                }}
                className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center space-x-1.5 transition-all"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Submit Report / Minutes</span>
              </button>
            )}
          </div>
        </div>

        {/* Header Content */}
        <div className="p-6 md:p-8 pb-4 border-b border-slate-100 space-y-3 shrink-0">
          <div>
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center space-x-3">
                {currentChapter.logo_url && (
                  <img 
                    src={currentChapter.logo_url} 
                    alt="" 
                    className="w-10 h-10 rounded-xl object-cover border border-slate-200 shadow-xs shrink-0" 
                    referrerPolicy="no-referrer"
                  />
                )}
                <h2 className="text-2xl md:text-3xl font-black text-slate-900 leading-tight">
                  {currentChapter.name}
                </h2>
              </div>

              {/* Website Display / Attachment Action */}
              <div className="flex items-center space-x-2">
                {isEditingWebsite ? (
                  <div className="flex items-center space-x-1.5 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
                    <input
                      type="url"
                      placeholder="https://chapter-website.org"
                      value={websiteInput}
                      onChange={(e) => setWebsiteInput(e.target.value)}
                      className="px-2.5 py-1 text-xs font-medium rounded-lg border border-slate-300 bg-white text-black focus:outline-none focus:ring-2 focus:ring-indigo-600 w-48 sm:w-60"
                    />
                    <button
                      onClick={handleSaveWebsite}
                      disabled={isSavingWebsite}
                      className="px-3 py-1 text-xs font-bold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors disabled:opacity-50"
                    >
                      {isSavingWebsite ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      onClick={() => {
                        setWebsiteInput(currentChapter.website_url || '');
                        setIsEditingWebsite(false);
                      }}
                      className="px-2 py-1 text-xs font-medium rounded-lg text-slate-600 hover:bg-slate-200 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    {currentChapter.website_url && (
                      <a
                        href={currentChapter.website_url.startsWith('http') ? currentChapter.website_url : `https://${currentChapter.website_url}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs transition-colors border border-indigo-200/60 shadow-2xs"
                        title="Visit Official Chapter Website"
                      >
                        <Globe className="w-3.5 h-3.5 text-indigo-600" />
                        <span className="truncate max-w-[180px]">{currentChapter.website_url.replace(/^https?:\/\//, '')}</span>
                        <ExternalLink className="w-3 h-3 text-indigo-500" />
                      </a>
                    )}
                    {(isAdmin || isChapterLeader) && (
                      <button
                        onClick={() => setIsEditingWebsite(true)}
                        className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
                        title={currentChapter.website_url ? "Edit Chapter Website" : "Attach Chapter Website URL"}
                      >
                        <Edit2 className="w-3 h-3 text-slate-500" />
                        <span>{currentChapter.website_url ? 'Edit Website' : 'Attach Website'}</span>
                      </button>
                    )}
                    <button
                      onClick={() => setIsClubModalOpen(true)}
                      className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs shadow-sm transition-all"
                      title="Form a specialized robotics club using members in this university section"
                    >
                      <Rocket className="w-3.5 h-3.5" />
                      <span>Form a Club</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs font-semibold text-slate-500 mt-2">
              <span className="flex items-center space-x-1">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                <span>{currentChapter.institution_or_community}</span>
              </span>
              <span className="flex items-center space-x-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>{currentChapter.district_or_city}, {currentChapter.province}</span>
              </span>
              <span className="flex items-center space-x-1 text-indigo-600 font-bold">
                <Users className="w-3.5 h-3.5" />
                <span>{currentChapter.total_members_count || (currentChapter.members?.length || 0)} Registered Members</span>
              </span>
            </div>
          </div>

          {/* Navigation Sub-Tabs */}
          <div className="flex items-center space-x-1 overflow-x-auto pb-1 scrollbar-none pt-2">
            {[
              { id: 'overview', label: 'Chapter Overview' },
              { id: 'members', label: `👥 Members Roster (${currentChapter.members?.length || currentChapter.total_members_count || 0})` },
              { id: 'clubs', label: `🏛️ Clubs & Societies (${(currentChapter.clubs || []).length})` },
              { id: 'minutes_agendas', label: `📜 Meetings & Minutes (${meetingReports.length})` },
              { id: 'projects', label: `Projects (${currentChapter.projects?.length || 0})` },
              { id: 'activities', label: `Activities & Workshops (${currentChapter.activities?.length || 0})` },
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
              {/* Provincial Hierarchy Card */}
              {currentChapter.is_provincial_lead_university ? (
                <div className="p-5 bg-gradient-to-r from-amber-50 via-indigo-50 to-amber-50/50 rounded-2xl border border-amber-200/80 flex items-start space-x-3.5">
                  <div className="p-2.5 bg-amber-400 text-slate-950 rounded-xl shrink-0 mt-0.5">
                    <Landmark className="w-5 h-5" />
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center space-x-2">
                      <span className="font-black text-slate-900 text-sm">Provincial Lead Institution for {currentChapter.province}</span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-200 text-amber-900">Official Head Hub</span>
                    </div>
                    <p className="text-slate-600 font-medium leading-relaxed">
                      This chapter serves as the assigned Provincial Lead University for {currentChapter.province}. It provides engineering leadership, technical mentoring, hardware lab access, and competition coordination for all secondary, high school, and community youth robotics chapters across the province.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center space-x-2.5">
                    <Landmark className="w-4 h-4 text-indigo-600 shrink-0" />
                    <div>
                      <span className="text-slate-400 font-bold block text-[10px] uppercase">Provincial Leadership & Mentorship</span>
                      <span className="font-bold text-slate-800">
                        Led & Mentored by {currentChapter.assigned_provincial_university_name || 'Designated Provincial University Lead'}
                      </span>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-lg font-bold text-[10px]">
                    {currentChapter.province} Network
                  </span>
                </div>
              )}

              {/* Official Chapter Website Link in Overview */}
              {currentChapter.website_url && (
                <div className="p-4 bg-indigo-50/70 rounded-2xl border border-indigo-100 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center space-x-2.5">
                    <Globe className="w-4 h-4 text-indigo-600 shrink-0" />
                    <div>
                      <span className="text-slate-400 font-bold block text-[10px] uppercase">Official Chapter Portal & Website</span>
                      <a 
                        href={currentChapter.website_url.startsWith('http') ? currentChapter.website_url : `https://${currentChapter.website_url}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-bold text-indigo-700 hover:underline flex items-center space-x-1"
                      >
                        <span>{currentChapter.website_url}</span>
                        <ExternalLink className="w-3 h-3 inline" />
                      </a>
                    </div>
                  </div>
                  <a
                    href={currentChapter.website_url.startsWith('http') ? currentChapter.website_url : `https://${currentChapter.website_url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-[11px] shadow-sm transition-colors shrink-0"
                  >
                    Open Website
                  </a>
                </div>
              )}

              {/* Provincial Ministry & Youth Partners (User requirement: Ministries for each province and website links e.g. mopse, mhtest, zyc) */}
              <div className="p-5 bg-gradient-to-r from-slate-50 via-indigo-50/40 to-slate-50 rounded-2xl border border-slate-200/90 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Landmark className="w-4 h-4 text-indigo-600" />
                    <span className="font-bold text-slate-900 text-xs">
                      Provincial Government Ministries & Youth Authorities ({currentChapter.province})
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-bold">Official Portals</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Official ministries overseeing primary/secondary STEM curricula (MoPSE), university research & Education 5.0 (MHTESTD), youth empowerment & grants (ZYC), and community digital labs (POTRAZ):
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 pt-1">
                  {getProvincialMinistries(currentChapter.province).slice(0, 6).map(m => (
                    <a
                      key={m.id}
                      href={m.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 bg-white hover:bg-indigo-50/50 rounded-xl border border-slate-200/80 hover:border-indigo-300 transition-all flex flex-col justify-between group shadow-2xs"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className={cn("px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider border", m.badgeColor)}>
                            {m.abbreviation}
                          </span>
                          <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                        </div>
                        <h6 className="font-bold text-slate-900 text-[11px] leading-tight group-hover:text-indigo-700 transition-colors">
                          {m.provincialOffice}
                        </h6>
                        <p className="text-[10px] text-slate-500 line-clamp-2 mt-1">
                          {m.role}
                        </p>
                      </div>

                      <span className="text-[10px] text-indigo-600 font-bold mt-2 flex items-center space-x-1">
                        <span>Visit Website</span>
                        <ChevronRight className="w-3 h-3" />
                      </span>
                    </a>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">About This Chapter</h4>
                <p className="text-sm text-slate-700 font-medium leading-relaxed">
                  {currentChapter.description}
                </p>
              </div>

              {/* Quick Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentChapter.meeting_schedule && (
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Meeting Schedule</span>
                    <p className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
                      <Clock className="w-3.5 h-3.5 text-indigo-600" />
                      <span>{currentChapter.meeting_schedule}</span>
                    </p>
                  </div>
                )}

                {currentChapter.physical_location && (
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Lab / Workshop Location</span>
                    <p className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{currentChapter.physical_location}</span>
                    </p>
                  </div>
                )}
              </div>

              {/* Focus Areas */}
              {currentChapter.focus_areas && currentChapter.focus_areas.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Specialization & Focus Areas</h4>
                  <div className="flex flex-wrap gap-2">
                    {currentChapter.focus_areas.map(area => (
                      <span key={area} className="px-3 py-1 bg-indigo-50 text-indigo-800 font-bold text-xs rounded-xl">
                        #{area}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Public Contact */}
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-slate-900">Get Involved with this Chapter</span>
                  <p className="text-[11px] text-slate-500">Contact the chapter desk for inquiries, membership, or project collaborations.</p>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
                  {currentChapter.public_email && (
                    <a
                      href={`mailto:${currentChapter.public_email}`}
                      className="px-3 py-1.5 bg-white border border-slate-200 hover:border-indigo-500 rounded-xl text-slate-700 flex items-center space-x-1.5 shadow-2xs"
                    >
                      <Mail className="w-3 h-3 text-indigo-600" />
                      <span>{currentChapter.public_email}</span>
                    </a>
                  )}

                  {currentChapter.public_phone && (
                    <a
                      href={`tel:${currentChapter.public_phone}`}
                      className="px-3 py-1.5 bg-white border border-slate-200 hover:border-indigo-500 rounded-xl text-slate-700 flex items-center space-x-1.5 shadow-2xs"
                    >
                      <Phone className="w-3 h-3 text-emerald-600" />
                      <span>{currentChapter.public_phone}</span>
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ALL MEMBERS ROSTER (User requirement: All members of each chapter must be publicly visible with consent) */}
          {activeTab === 'members' && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">
                    Chapter Members & Student Innovators Roster
                  </h4>
                  <p className="text-xs text-slate-500">
                    All registered student members, developers, and makers enrolled in this chapter.
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search member name or skill..."
                      value={memberSearch}
                      onChange={e => setMemberSearch(e.target.value)}
                      className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 bg-white w-48 focus:w-64 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    />
                  </div>
                </div>
              </div>

              {/* Public Visibility & Consent Notice */}
              <div className="p-3.5 bg-emerald-50/70 border border-emerald-200/70 rounded-2xl flex items-center space-x-3 text-emerald-900 text-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  <strong>Public Chapter Directory:</strong> In accordance with YARA community guidelines, all registered student members and leaders have provided consent upon registration for their public directory profile and chapter affiliation to be visible.
                </span>
              </div>

              {!currentChapter.members || currentChapter.members.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-2">
                  <Users className="w-8 h-8 text-slate-400 mx-auto" />
                  <p className="text-slate-500 text-xs font-medium">
                    No individual member roster records loaded yet for this chapter. Total active member count: {currentChapter.total_members_count || 0}.
                  </p>
                </div>
              ) : filteredMembers.length === 0 ? (
                <div className="p-6 text-center bg-slate-50 rounded-2xl border border-slate-100 text-slate-500 text-xs">
                  No members matched "{memberSearch}".
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {filteredMembers.map((member, idx) => (
                    <div 
                      key={member.id || idx}
                      className="p-4 bg-slate-50 hover:bg-white rounded-2xl border border-slate-100 hover:border-slate-200 hover:shadow-xs transition-all space-y-2.5"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-2.5">
                          <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-800 font-bold text-xs flex items-center justify-center shrink-0">
                            {member.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h5 className="font-bold text-slate-900 text-xs">{member.name}</h5>
                            {member.student_or_staff_id && (
                              <span className="text-[10px] font-mono text-slate-400 block">{member.student_or_staff_id}</span>
                            )}
                          </div>
                        </div>
                        <span className={cn(
                          "px-2 py-0.5 rounded-md text-[9px] font-bold uppercase",
                          member.status === 'active' ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"
                        )}>
                          {member.status || 'Active'}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5">
                        {member.role && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-white text-indigo-700 border border-indigo-100 inline-block">
                            {member.role}
                          </span>
                        )}
                        <span className="px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-emerald-50 text-emerald-700 flex items-center space-x-1 border border-emerald-100">
                          <ShieldCheck className="w-2.5 h-2.5 text-emerald-600" />
                          <span>Public Member</span>
                        </span>
                      </div>

                      {(member.email || member.phone) && (
                        <div className="pt-2 border-t border-slate-100/80 space-y-1 text-[11px] text-slate-500 font-mono">
                          {member.email && (
                            <p className="truncate flex items-center space-x-1">
                              <Mail className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                              <span>{member.email}</span>
                            </p>
                          )}
                          {member.phone && (
                            <p className="truncate flex items-center space-x-1">
                              <Phone className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                              <span>{member.phone}</span>
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB: CLUBS & SOCIETIES (User requirement: Form a club using all those members in their university section) */}
          {activeTab === 'clubs' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-indigo-50/80 via-slate-50 to-amber-50/50 p-4 rounded-2xl border border-indigo-100">
                <div>
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center space-x-1.5">
                    <Rocket className="w-4 h-4 text-indigo-600" />
                    <span>University Robotics Clubs & Societies</span>
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Specialized clubs formed by members of {currentChapter.name} for competitions, research, and lab projects.
                  </p>
                </div>

                <button
                  onClick={() => setIsClubModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black shadow-md shadow-indigo-200 flex items-center space-x-1.5 transition-all self-start sm:self-center shrink-0"
                >
                  <Rocket className="w-3.5 h-3.5" />
                  <span>Form a Club in this Section</span>
                </button>
              </div>

              {(!currentChapter.clubs || currentChapter.clubs.length === 0) ? (
                <div className="p-10 text-center bg-slate-50/80 rounded-2xl border border-dashed border-slate-200 space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
                    <Rocket className="w-6 h-6" />
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-900 text-sm">No Specialized Clubs Formed Yet</h5>
                    <p className="text-slate-500 text-xs mt-1 max-w-md mx-auto">
                      Members of this university can assemble teams and submit a request to charter an autonomous rover squad, drone society, or AI hardware club using the registered members in this section!
                    </p>
                  </div>
                  <button
                    onClick={() => setIsClubModalOpen(true)}
                    className="mt-2 inline-flex items-center space-x-1.5 px-5 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 text-xs font-black rounded-xl shadow-md transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Propose the First Club</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {currentChapter.clubs.map(club => (
                    <div
                      key={club.id}
                      className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-3 flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-indigo-50 text-indigo-700">
                            {club.specialization}
                          </span>
                          <span className="px-2 py-0.5 rounded-md text-[9px] font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-100">
                            {club.status}
                          </span>
                        </div>

                        <h5 className="font-black text-slate-900 text-sm">{club.club_name}</h5>
                        <p className="text-xs text-slate-600 font-medium leading-relaxed">
                          {club.description}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-slate-100 space-y-2 text-xs">
                        <div className="flex items-center justify-between text-[11px] text-slate-500">
                          <span className="flex items-center space-x-1">
                            <Users className="w-3 h-3 text-indigo-500" />
                            <span>{club.founding_member_names?.length || 0} Founding Members</span>
                          </span>
                          <span className="font-bold text-slate-800">
                            Lead: {club.chairperson_name}
                          </span>
                        </div>

                        {club.lab_location && (
                          <div className="text-[10px] text-slate-500 flex items-center space-x-1">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            <span>{club.lab_location}</span>
                          </div>
                        )}

                        {club.founding_member_names && club.founding_member_names.length > 0 && (
                          <div className="flex flex-wrap gap-1 pt-1">
                            {club.founding_member_names.slice(0, 5).map(m => (
                              <span key={m} className="px-2 py-0.5 rounded-md bg-slate-50 text-slate-600 text-[9px] font-medium border border-slate-100">
                                {m}
                              </span>
                            ))}
                            {club.founding_member_names.length > 5 && (
                              <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 text-[9px] font-bold">
                                +{club.founding_member_names.length - 5} more
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB: MEETINGS, MINUTES & AGENDAS (User requirement: Leaders can attach website URL and send club meetings minutes as well as agendas) */}
          {activeTab === 'minutes_agendas' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div>
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center space-x-1.5">
                    <FileText className="w-4 h-4 text-indigo-600" />
                    <span>Official Club Meetings, Agendas & Minutes</span>
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Meeting records, agendas, resolutions, and action items posted by chapter leaders.
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <div className="flex rounded-xl bg-white p-1 border border-slate-200 text-xs font-bold">
                    <button
                      onClick={() => setReportsFilter('all')}
                      className={cn(
                        "px-2.5 py-1 rounded-lg transition-all",
                        reportsFilter === 'all' ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
                      )}
                    >
                      All ({meetingReports.length})
                    </button>
                    <button
                      onClick={() => setReportsFilter('minutes')}
                      className={cn(
                        "px-2.5 py-1 rounded-lg transition-all",
                        reportsFilter === 'minutes' ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
                      )}
                    >
                      Minutes
                    </button>
                    <button
                      onClick={() => setReportsFilter('agendas')}
                      className={cn(
                        "px-2.5 py-1 rounded-lg transition-all",
                        reportsFilter === 'agendas' ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
                      )}
                    >
                      Agendas
                    </button>
                  </div>

                  {(isAdmin || isChapterLeader) && onOpenReportModal && (
                    <button
                      onClick={() => {
                        onClose();
                        onOpenReportModal(currentChapter);
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm flex items-center space-x-1.5 transition-all"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Post Minutes / Agenda</span>
                    </button>
                  )}
                </div>
              </div>

              {isLoadingReports ? (
                <div className="p-12 text-center text-xs text-slate-500 font-medium">
                  Loading chapter meeting records...
                </div>
              ) : meetingReports.length === 0 ? (
                <div className="p-10 text-center bg-slate-50/80 rounded-2xl border border-dashed border-slate-200 space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-900 text-sm">No Club Meeting Minutes or Agendas Yet</h5>
                    <p className="text-slate-500 text-xs mt-1 max-w-md mx-auto">
                      Chapter executives and secretaries post their meeting agendas prior to sessions and document official minutes afterwards for member transparency.
                    </p>
                  </div>
                  {(isAdmin || isChapterLeader) && onOpenReportModal && (
                    <button
                      onClick={() => {
                        onClose();
                        onOpenReportModal(currentChapter);
                      }}
                      className="mt-2 inline-flex items-center space-x-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-200 transition-all"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Create First Meeting Record</span>
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {meetingReports
                    .filter(r => {
                      if (reportsFilter === 'minutes') return r.category === 'meeting_minutes' || Boolean(r.meeting_minutes);
                      if (reportsFilter === 'agendas') return r.category === 'meeting_agenda' || Boolean(r.meeting_agenda);
                      return true;
                    })
                    .map(rep => (
                      <div 
                        key={rep.id} 
                        className="p-5 md:p-6 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-4"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-2 pb-3 border-b border-slate-100">
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <span className={cn(
                                "px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider",
                                rep.category === 'meeting_minutes' ? "bg-emerald-100 text-emerald-800" :
                                rep.category === 'meeting_agenda' ? "bg-blue-100 text-blue-800" :
                                "bg-indigo-100 text-indigo-800"
                              )}>
                                {rep.category === 'meeting_minutes' ? '📝 Club Meeting Minutes' :
                                 rep.category === 'meeting_agenda' ? '📋 Meeting Agenda' :
                                 '📜 Chapter Report'}
                              </span>
                              <span className="text-xs font-bold text-slate-400">
                                {rep.reporting_period}
                              </span>
                            </div>
                            <h5 className="font-black text-slate-900 text-base">{rep.title}</h5>
                          </div>

                          <div className="flex items-center space-x-2 text-xs">
                            {rep.meeting_date && (
                              <span className="px-2.5 py-1 bg-slate-100 rounded-lg font-bold text-slate-700 flex items-center space-x-1 text-[11px]">
                                <Calendar className="w-3 h-3 text-slate-500" />
                                <span>{new Date(rep.meeting_date).toLocaleDateString(undefined, { dateStyle: 'medium' })}</span>
                              </span>
                            )}
                            {rep.meeting_location && (
                              <span className="px-2.5 py-1 bg-slate-100 rounded-lg font-bold text-slate-700 flex items-center space-x-1 text-[11px]">
                                <MapPin className="w-3 h-3 text-slate-500" />
                                <span>{rep.meeting_location}</span>
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Agenda Content */}
                        {rep.meeting_agenda && (
                          <div className="p-4 bg-blue-50/60 rounded-xl border border-blue-100 space-y-1.5">
                            <span className="text-[10px] font-black uppercase tracking-wider text-blue-700 flex items-center space-x-1">
                              <ListChecks className="w-3 h-3" />
                              <span>Agenda Topics & Order of Business</span>
                            </span>
                            <p className="text-xs text-slate-800 whitespace-pre-wrap font-medium leading-relaxed">
                              {rep.meeting_agenda}
                            </p>
                          </div>
                        )}

                        {/* Minutes Content */}
                        {rep.meeting_minutes && (
                          <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-100 space-y-1.5">
                            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 flex items-center space-x-1">
                              <FileText className="w-3 h-3" />
                              <span>Proceedings, Deliberations & Resolutions</span>
                            </span>
                            <p className="text-xs text-slate-800 whitespace-pre-wrap font-medium leading-relaxed">
                              {rep.meeting_minutes}
                            </p>
                          </div>
                        )}

                        {/* General Narrative / Summary */}
                        {rep.narrative_summary && !rep.meeting_minutes && !rep.meeting_agenda && (
                          <p className="text-xs text-slate-700 font-medium leading-relaxed whitespace-pre-wrap">
                            {rep.narrative_summary}
                          </p>
                        )}

                        {/* Next Meeting Date or Action Items */}
                        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
                          <div className="flex flex-wrap items-center gap-3">
                            {rep.attendees_count !== undefined && rep.attendees_count > 0 && (
                              <span className="font-bold text-slate-600 flex items-center space-x-1 text-[11px]">
                                <Users className="w-3 h-3 text-indigo-500" />
                                <span>{rep.attendees_count} Members in Attendance</span>
                              </span>
                            )}
                            {rep.next_meeting_date && (
                              <span className="font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg flex items-center space-x-1 text-[11px]">
                                <Clock className="w-3 h-3" />
                                <span>Next Meeting: {new Date(rep.next_meeting_date).toLocaleDateString(undefined, { dateStyle: 'medium' })}</span>
                              </span>
                            )}
                          </div>

                          <div className="text-[11px] text-slate-500">
                            Recorded by <span className="font-bold text-slate-800">{rep.submitted_by_name}</span> ({rep.submitted_by_role.replace('_', ' ')})
                          </div>
                        </div>

                        {/* Attachments if any */}
                        {rep.attachment_url && (
                          <div className="pt-1">
                            <a 
                              href={rep.attachment_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center space-x-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              <span>View Attached Minutes / Document PDF</span>
                            </a>
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: PROJECTS */}
          {activeTab === 'projects' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Active Hardware & Robotics Projects</h4>
                <span className="text-xs text-slate-400 font-medium">{currentChapter.projects?.length || 0} Projects Documented</span>
              </div>

              {!currentChapter.projects || currentChapter.projects.length === 0 ? (
                <div className="p-10 text-center bg-slate-50/80 rounded-2xl border border-dashed border-slate-200 space-y-2">
                  <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-200 inline-block">
                    Coming Soon
                  </span>
                  <p className="text-slate-700 text-xs font-bold block">
                    No active student hardware projects submitted for this chapter yet.
                  </p>
                  <p className="text-slate-400 text-[11px]">
                    Innovations and capstone rovers built by members of this chapter will appear here.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {currentChapter.projects.map(proj => (
                    <div key={proj.id} className="p-5 bg-white rounded-2xl border border-slate-100 shadow-2xs space-y-3 flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-700">
                            {proj.category.replace('_', ' ')}
                          </span>
                          <span className={cn(
                            "px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase",
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

          {/* TAB 4: ACTIVITIES */}
          {activeTab === 'activities' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Community Outreach & Events</h4>
                <span className="text-xs text-slate-400 font-medium">{currentChapter.activities?.length || 0} Events Logged</span>
              </div>

              {!currentChapter.activities || currentChapter.activities.length === 0 ? (
                <div className="p-10 text-center bg-slate-50/80 rounded-2xl border border-dashed border-slate-200 space-y-2">
                  <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-200 inline-block">
                    Coming Soon
                  </span>
                  <p className="text-slate-700 text-xs font-bold block">
                    No public workshops or outreach events logged yet for this chapter.
                  </p>
                  <p className="text-slate-400 text-[11px]">
                    Upcoming STEM bootcamps and community hackathons will be posted here.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {currentChapter.activities.map(act => (
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

          {/* TAB 5: LEADERSHIP */}
          {activeTab === 'leadership' && (
            <div className="space-y-6">
              <div className="space-y-3">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Executive Committee Leaders</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {currentChapter.leaders?.map(leader => (
                    <div key={leader.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-indigo-50 text-indigo-700 inline-block">
                          {leader.role.replace('_', ' ')}
                        </span>
                        {leader.is_approved_by_admin && (
                          <span className="flex items-center space-x-1 text-[10px] font-bold text-emerald-700">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Certified</span>
                          </span>
                        )}
                      </div>
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
              {currentChapter.patron_advisor && (
                <div className="p-5 bg-indigo-50/60 rounded-2xl border border-indigo-100 flex items-start space-x-3">
                  <div className="p-2.5 bg-indigo-600 text-white rounded-xl">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-indigo-700 block">Faculty Patron / Senior Advisor</span>
                    <h5 className="font-bold text-slate-900 text-sm">{currentChapter.patron_advisor.name}</h5>
                    <p className="text-xs text-slate-600 font-medium">
                      {currentChapter.patron_advisor.title} • {currentChapter.patron_advisor.organization}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 6: CONFIDENTIAL DATA */}
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
                      ${currentChapter.confidential_info?.internal_budget_balance_usd || 0}
                    </span>
                    <span className="text-xs font-bold text-slate-400">USD</span>
                  </div>
                  {currentChapter.confidential_info?.internal_bank_or_ecocash_details && (
                    <p className="text-xs font-mono text-slate-600 bg-white p-2.5 rounded-xl border border-slate-200 mt-2">
                      {currentChapter.confidential_info.internal_bank_or_ecocash_details}
                    </p>
                  )}
                </div>

                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">National Executive Supervisor</span>
                  <p className="text-sm font-bold text-slate-900">
                    {currentChapter.confidential_info?.national_patron_supervisor || 'Assigned by National Executive Secretariat'}
                  </p>
                  {currentChapter.confidential_info?.inventory_access_code && (
                    <div className="pt-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Lab / Locker Access Passcode:</span>
                      <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-md inline-block">
                        {currentChapter.confidential_info.inventory_access_code}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {currentChapter.confidential_info?.private_executive_notes && (
                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Confidential Executive Notes & Recommendations</span>
                  <p className="text-xs text-slate-700 font-medium leading-relaxed whitespace-pre-wrap">
                    {currentChapter.confidential_info.private_executive_notes}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="p-6 border-t border-slate-100 bg-slate-50/70 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-500 font-medium">
            Official YARA Chapter • Established {new Date(currentChapter.established_date).toLocaleDateString(undefined, { year: 'numeric', month: 'long' })}
          </div>

          <div className="flex items-center space-x-2">
            {onOpenReportModal && (
              <button
                onClick={() => {
                  onClose();
                  onOpenReportModal(currentChapter);
                }}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-200 flex items-center space-x-1.5 transition-all"
              >
                <FileText className="w-4 h-4" />
                <span>Submit Secretary Report / Minutes</span>
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

      {/* Club Formation Request Modal */}
      {isClubModalOpen && (
        <ClubFormationModal
          isOpen={isClubModalOpen}
          chapter={currentChapter}
          currentUserEmail={currentUserEmail}
          onClose={() => setIsClubModalOpen(false)}
          onSuccess={(newClub) => {
            const updatedClubs = [newClub, ...(currentChapter.clubs || []).filter(c => c.id !== newClub.id)];
            const next = { ...currentChapter, clubs: updatedClubs };
            setCurrentChapter(next);
            onChapterUpdated?.(next);
          }}
        />
      )}
    </div>
  );
}
