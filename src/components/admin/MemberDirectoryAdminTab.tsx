import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, Search, Mail, Phone, MapPin, Building2, Shield, 
  Check, Copy, ExternalLink, MessageCircle, Edit3, CheckCircle2, 
  XCircle, Filter, ChevronDown, UserCheck, UserX, Clock, 
  Send, RefreshCw, AlertCircle, Award, Landmark, UserPlus
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../../lib/supabase';
import { cn } from '../../lib/utils';
import { getChapters } from '../../services/chaptersService';
import { Chapter } from '../../types/chapters';

export interface ExtendedUserProfile {
  id: string;
  display_name: string;
  email: string;
  phone?: string;
  contact_phone?: string;
  whatsapp_number?: string;
  member_id: string | null;
  avatar_url?: string;
  role: string;
  country?: string;
  province?: string;
  district?: string;
  institution?: string;
  chapter_id?: string;
  chapter_name?: string;
  chapter_position?: string;
  registration_paid: boolean;
  subscription_expires_at?: string;
  is_halted: boolean;
  created_at: string;
  rating?: number;
  mentored_count?: number;
  total_commission?: number;
}

export interface ChapterJoinRequestItem {
  id: string;
  chapter_id: string;
  chapter_name?: string;
  province?: string;
  full_name: string;
  email: string;
  phone: string;
  institution: string;
  role_applying_for?: string;
  motivation?: string;
  status: 'pending' | 'approved' | 'rejected';
  user_id?: string;
  submitted_at: string;
}

const LEADERSHIP_POSITIONS = [
  'Member',
  'President / Chairperson',
  'Vice President',
  'Secretary General',
  'Vice Secretary',
  'Treasurer / Finance Lead',
  'Technical Lead / Robotics Marshal',
  'Faculty Patron / Advisor',
  'Communications & PR Officer',
  'Provincial Coordinator',
  'District Coordinator'
];

export default function MemberDirectoryAdminTab() {
  const [users, setUsers] = useState<ExtendedUserProfile[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [joinRequests, setJoinRequests] = useState<ChapterJoinRequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSubView, setActiveSubView] = useState<'directory' | 'join_requests'>('directory');

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedChapterFilter, setSelectedChapterFilter] = useState('ALL');
  const [selectedPositionFilter, setSelectedPositionFilter] = useState('ALL');
  const [selectedProvinceFilter, setSelectedProvinceFilter] = useState('ALL');

  // Edit Member Modal
  const [editingMember, setEditingMember] = useState<ExtendedUserProfile | null>(null);
  const [editChapterId, setEditChapterId] = useState('');
  const [editPosition, setEditPosition] = useState('Member');
  const [editMemberId, setEditMemberId] = useState('');
  const [isSavingMember, setIsSavingMember] = useState(false);

  // Email Modal
  const [emailModalMember, setEmailModalMember] = useState<ExtendedUserProfile | null>(null);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [emailStatus, setEmailStatus] = useState<string | null>(null);

  // Feedback notifications
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Users
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (userError) throw userError;
      setUsers(userData || []);

      // 2. Fetch Chapters
      const chapterList = await getChapters(true);
      setChapters(chapterList);

      // 3. Fetch Chapter Join Requests
      const { data: reqData, error: reqError } = await supabase
        .from('chapter_join_requests')
        .select('*')
        .order('submitted_at', { ascending: false });

      if (!reqError) {
        setJoinRequests(reqData || []);
      }
    } catch (err: any) {
      console.error('Error fetching member directory data:', err);
      setFeedback({ type: 'error', text: err.message || 'Failed to load member records.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const showToast = (type: 'success' | 'error', text: string) => {
    setFeedback({ type, text });
    setTimeout(() => setFeedback(null), 4000);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filtered members list
  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const q = searchTerm.toLowerCase();
      const matchSearch = 
        u.display_name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.member_id?.toLowerCase().includes(q) ||
        u.chapter_name?.toLowerCase().includes(q) ||
        u.institution?.toLowerCase().includes(q) ||
        u.phone?.toLowerCase().includes(q) ||
        u.whatsapp_number?.toLowerCase().includes(q);

      const matchChapter = selectedChapterFilter === 'ALL' || u.chapter_id === selectedChapterFilter || u.chapter_name === selectedChapterFilter;
      const matchPosition = selectedPositionFilter === 'ALL' || (u.chapter_position || 'Member') === selectedPositionFilter;
      const matchProvince = selectedProvinceFilter === 'ALL' || u.province === selectedProvinceFilter;

      return matchSearch && matchChapter && matchPosition && matchProvince;
    });
  }, [users, searchTerm, selectedChapterFilter, selectedPositionFilter, selectedProvinceFilter]);

  const pendingRequestsCount = useMemo(() => {
    return joinRequests.filter(r => r.status === 'pending').length;
  }, [joinRequests]);

  // Clean phone number for WhatsApp
  const formatPhoneForWhatsApp = (phoneStr?: string): string => {
    if (!phoneStr) return '';
    let cleaned = phoneStr.replace(/[^0-9]/g, '');
    // Zimbabwe local numbers starting with 07... -> 2637...
    if (cleaned.startsWith('0') && cleaned.length >= 10) {
      cleaned = '263' + cleaned.slice(1);
    }
    return cleaned;
  };

  const handleOpenWhatsApp = (member: ExtendedUserProfile) => {
    const rawPhone = member.whatsapp_number || member.contact_phone || member.phone;
    const cleanPhone = formatPhoneForWhatsApp(rawPhone);

    if (!cleanPhone) {
      alert(`No valid telephone or WhatsApp number found for ${member.display_name}.`);
      return;
    }

    const prefilledText = encodeURIComponent(
      `Hello ${member.display_name},\n\nThis is the Young Africans Robotics Association (YARA) Secretariat regarding your membership${member.chapter_name ? ` with the ${member.chapter_name}` : ''}.\n\nMember ID: ${member.member_id || 'Pending'}\nPosition: ${member.chapter_position || 'Member'}\n\nHow can we support your robotics innovation activities today?`
    );

    const waUrl = `https://wa.me/${cleanPhone}?text=${prefilledText}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  const handleOpenEmail = (member: ExtendedUserProfile) => {
    setEmailModalMember(member);
    setEmailSubject(`YARA Notice: Official Update for ${member.display_name}`);
    setEmailBody(
      `Dear ${member.display_name},\n\nGreetings from the Young Africans Robotics Association (YARA) Secretariat.\n\nWe are writing to you regarding your active status with ${member.chapter_name || 'the YARA Pan-African Platform'}.\n\nMember ID: ${member.member_id || 'Not Assigned'}\nRole / Position: ${member.chapter_position || member.role || 'Member'}\n\n[Please enter your message here]\n\nBest regards,\nYARA Executive Secretariat\nInnovate Local, Build Global`
    );
  };

  const handleSendEmailNative = () => {
    if (!emailModalMember?.email) return;
    const mailto = `mailto:${encodeURIComponent(emailModalMember.email)}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
    window.location.href = mailto;
    setEmailStatus('Email client opened successfully!');
    setTimeout(() => {
      setEmailStatus(null);
      setEmailModalMember(null);
    }, 2000);
  };

  // Open Edit Modal
  const handleOpenEditModal = (member: ExtendedUserProfile) => {
    setEditingMember(member);
    setEditChapterId(member.chapter_id || '');
    setEditPosition(member.chapter_position || 'Member');
    setEditMemberId(member.member_id || '');
  };

  const handleSaveMemberAffiliation = async () => {
    if (!editingMember) return;
    setIsSavingMember(true);

    try {
      const selectedChapter = chapters.find(c => c.id === editChapterId);
      const chapterName = selectedChapter ? selectedChapter.name : null;

      const updatePayload: any = {
        chapter_id: editChapterId || null,
        chapter_name: chapterName,
        chapter_position: editPosition,
        member_id: editMemberId.trim() || null,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('profiles')
        .update(updatePayload)
        .eq('id', editingMember.id);

      if (error) throw error;

      // Update state locally
      setUsers(prev => prev.map(u => u.id === editingMember.id ? { ...u, ...updatePayload } : u));
      showToast('success', `Updated affiliation and position for ${editingMember.display_name}!`);
      setEditingMember(null);
    } catch (err: any) {
      console.error('Error updating member:', err);
      showToast('error', err.message || 'Failed to update member affiliation.');
    } finally {
      setIsSavingMember(false);
    }
  };

  // Approve Chapter Join Request
  const handleApproveJoinRequest = async (req: ChapterJoinRequestItem) => {
    if (!window.confirm(`Approve ${req.full_name} to join ${req.chapter_name || 'selected chapter'}?`)) return;

    try {
      // 1. Update request status
      const { error: reqErr } = await supabase
        .from('chapter_join_requests')
        .update({
          status: 'approved',
          reviewed_by: 'YARA Master Administrator',
          reviewed_at: new Date().toISOString()
        })
        .eq('id', req.id);

      if (reqErr) throw reqErr;

      // 2. If user_id exists or match by email, update profile
      const targetUser = users.find(u => (req.user_id && u.id === req.user_id) || u.email.toLowerCase() === req.email.toLowerCase());
      if (targetUser) {
        await supabase
          .from('profiles')
          .update({
            chapter_id: req.chapter_id,
            chapter_name: req.chapter_name,
            chapter_position: req.role_applying_for || 'Member',
            province: req.province || targetUser.province
          })
          .eq('id', targetUser.id);
      }

      setJoinRequests(prev => prev.map(r => r.id === req.id ? { ...r, status: 'approved' } : r));
      showToast('success', `Approved ${req.full_name} for ${req.chapter_name}! Profile updated.`);
      fetchData();
    } catch (err: any) {
      console.error('Approval failed:', err);
      showToast('error', err.message || 'Failed to approve join request.');
    }
  };

  // Reject Chapter Join Request
  const handleRejectJoinRequest = async (req: ChapterJoinRequestItem) => {
    const reason = window.prompt(`Provide optional rejection reason for ${req.full_name}:`, 'Capacity limit reached for this session.');
    if (reason === null) return;

    try {
      const { error } = await supabase
        .from('chapter_join_requests')
        .update({
          status: 'rejected',
          reviewed_by: 'YARA Master Administrator',
          reviewed_at: new Date().toISOString(),
          review_notes: reason
        })
        .eq('id', req.id);

      if (error) throw error;

      setJoinRequests(prev => prev.map(r => r.id === req.id ? { ...r, status: 'rejected' } : r));
      showToast('success', `Rejected request from ${req.full_name}.`);
    } catch (err: any) {
      showToast('error', err.message || 'Failed to reject request.');
    }
  };

  const uniqueProvinces = useMemo(() => {
    const set = new Set<string>();
    users.forEach(u => { if (u.province) set.add(u.province); });
    return Array.from(set).sort();
  }, [users]);

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={cn(
              "p-4 rounded-2xl flex items-center justify-between text-xs font-bold shadow-lg",
              feedback.type === 'success' 
                ? "bg-emerald-50 text-emerald-800 border border-emerald-200" 
                : "bg-red-50 text-red-800 border border-red-200"
            )}
          >
            <div className="flex items-center gap-2">
              {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-red-600" />}
              <span>{feedback.text}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Header & Sub-View Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-indigo-600" />
            <span>Central Member Register & Leadership Portal</span>
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Every registered YARA member with institution, assigned chapter, and leadership position. Directly contact via Email or WhatsApp.
          </p>
        </div>

        {/* View Switcher Chips */}
        <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl shrink-0">
          <button
            onClick={() => setActiveSubView('directory')}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all",
              activeSubView === 'directory' 
                ? "bg-white text-slate-900 shadow-xs" 
                : "text-slate-600 hover:text-slate-900"
            )}
          >
            <Users className="w-3.5 h-3.5 text-indigo-600" />
            <span>All Members ({users.length})</span>
          </button>

          <button
            onClick={() => setActiveSubView('join_requests')}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all relative",
              activeSubView === 'join_requests' 
                ? "bg-white text-slate-900 shadow-xs" 
                : "text-slate-600 hover:text-slate-900"
            )}
          >
            <UserPlus className="w-3.5 h-3.5 text-emerald-600" />
            <span>Chapter Join Requests</span>
            {pendingRequestsCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white font-black text-[10px] animate-pulse">
                {pendingRequestsCount} Pending
              </span>
            )}
          </button>
        </div>
      </div>

      {activeSubView === 'directory' ? (
        <>
          {/* Summary Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold text-slate-400 block uppercase">Total Registered</span>
              <span className="text-2xl font-black text-slate-900 mt-1 block">{users.length}</span>
            </div>
            <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold text-slate-400 block uppercase">In Active Chapters</span>
              <span className="text-2xl font-black text-indigo-600 mt-1 block">
                {users.filter(u => u.chapter_id || u.chapter_name).length}
              </span>
            </div>
            <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold text-slate-400 block uppercase">Leadership Officers</span>
              <span className="text-2xl font-black text-amber-500 mt-1 block">
                {users.filter(u => u.chapter_position && u.chapter_position !== 'Member').length}
              </span>
            </div>
            <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold text-slate-400 block uppercase">Dues Verified</span>
              <span className="text-2xl font-black text-emerald-600 mt-1 block">
                {users.filter(u => u.registration_paid).length}
              </span>
            </div>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name, email, member ID, chapter, institution, or phone..."
                  className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              {/* Chapter Filter */}
              <select
                value={selectedChapterFilter}
                onChange={(e) => setSelectedChapterFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-hidden max-w-xs"
              >
                <option value="ALL">All Chapters ({chapters.length})</option>
                {chapters.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>

              {/* Position Filter */}
              <select
                value={selectedPositionFilter}
                onChange={(e) => setSelectedPositionFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-hidden"
              >
                <option value="ALL">All Positions</option>
                {LEADERSHIP_POSITIONS.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>

              {/* Province Filter */}
              <select
                value={selectedProvinceFilter}
                onChange={(e) => setSelectedProvinceFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-hidden"
              >
                <option value="ALL">All Provinces</option>
                {uniqueProvinces.map(prov => (
                  <option key={prov} value={prov}>{prov}</option>
                ))}
              </select>

              <button
                onClick={fetchData}
                className="p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-600 transition"
                title="Refresh Records"
              >
                <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
              </button>
            </div>
          </div>

          {/* Members Table */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-[11px] font-black text-slate-500 uppercase tracking-wider">
                    <th className="px-6 py-4">Member Info</th>
                    <th className="px-4 py-4">Member ID</th>
                    <th className="px-6 py-4">Assigned Chapter</th>
                    <th className="px-4 py-4">Position / Role</th>
                    <th className="px-4 py-4">Location & Institution</th>
                    <th className="px-4 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Contact & Manage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-slate-400 font-bold">
                        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-600" />
                        <span>Loading member register...</span>
                      </td>
                    </tr>
                  ) : filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-slate-400 font-medium">
                        No members match your search criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map(member => {
                      const phone = member.whatsapp_number || member.contact_phone || member.phone;
                      const hasPhone = Boolean(phone);
                      const isLeader = member.chapter_position && member.chapter_position !== 'Member';

                      return (
                        <tr key={member.id} className="hover:bg-slate-50/60 transition group">
                          {/* Member Info */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center font-black text-indigo-700 text-sm shrink-0 overflow-hidden">
                                {member.avatar_url ? (
                                  <img src={member.avatar_url} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  member.display_name?.[0] || 'M'
                                )}
                              </div>
                              <div className="min-w-0">
                                <span className="font-bold text-slate-900 block truncate">{member.display_name}</span>
                                <span className="text-[11px] text-slate-400 block truncate">{member.email}</span>
                                {phone && (
                                  <span className="text-[10px] text-emerald-600 font-medium flex items-center gap-1 mt-0.5">
                                    <Phone className="w-2.5 h-2.5" />
                                    <span>{phone}</span>
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Member ID */}
                          <td className="px-4 py-4 whitespace-nowrap">
                            {member.member_id ? (
                              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-indigo-50/80 border border-indigo-200/80 rounded-lg">
                                <span className="font-mono font-black text-[11px] text-indigo-700">{member.member_id}</span>
                                <button
                                  onClick={() => copyToClipboard(member.member_id!, member.id)}
                                  className="text-indigo-400 hover:text-indigo-700 transition"
                                  title="Copy ID"
                                >
                                  {copiedId === member.id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                                </button>
                              </div>
                            ) : (
                              <span className="text-[10px] text-amber-600 font-bold bg-amber-50 px-2 py-0.5 rounded-md">
                                Unassigned
                              </span>
                            )}
                          </td>

                          {/* Assigned Chapter */}
                          <td className="px-6 py-4">
                            {member.chapter_name ? (
                              <div className="space-y-0.5">
                                <span className="font-bold text-slate-900 block line-clamp-1">{member.chapter_name}</span>
                                <span className="text-[10px] text-slate-400 flex items-center gap-1">
                                  <Building2 className="w-3 h-3 text-indigo-500" />
                                  <span>{member.province || 'National'}</span>
                                </span>
                              </div>
                            ) : (
                              <span className="text-[10px] font-bold text-slate-400 italic bg-slate-100 px-2.5 py-1 rounded-lg">
                                Awaiting Chapter Placement
                              </span>
                            )}
                          </td>

                          {/* Position */}
                          <td className="px-4 py-4 whitespace-nowrap">
                            <span className={cn(
                              "px-2.5 py-1 rounded-lg text-[11px] font-black inline-block",
                              isLeader
                                ? "bg-amber-100 text-amber-900 border border-amber-200"
                                : "bg-slate-100 text-slate-700"
                            )}>
                              {member.chapter_position || 'Member'}
                            </span>
                          </td>

                          {/* Location & Institution */}
                          <td className="px-4 py-4">
                            <span className="text-[11px] font-semibold text-slate-700 block truncate">
                              {member.institution || 'Individual Innovator'}
                            </span>
                            <span className="text-[10px] text-slate-400 block truncate">
                              {member.district ? `${member.district}, ` : ''}{member.province || 'Zimbabwe'}
                            </span>
                          </td>

                          {/* Status */}
                          <td className="px-4 py-4 whitespace-nowrap">
                            <span className={cn(
                              "px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider",
                              member.registration_paid 
                                ? "bg-emerald-100 text-emerald-800" 
                                : "bg-slate-100 text-slate-600"
                            )}>
                              {member.registration_paid ? 'Active & Paid' : 'Standard'}
                            </span>
                          </td>

                          {/* Actions: Email, WhatsApp, Edit */}
                          <td className="px-6 py-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Email button */}
                              <button
                                onClick={() => handleOpenEmail(member)}
                                className="p-2 rounded-xl bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 transition"
                                title="Compose Email"
                              >
                                <Mail className="w-3.5 h-3.5" />
                              </button>

                              {/* WhatsApp button */}
                              <button
                                onClick={() => handleOpenWhatsApp(member)}
                                disabled={!hasPhone}
                                className={cn(
                                  "p-2 rounded-xl transition",
                                  hasPhone 
                                    ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 shadow-xs" 
                                    : "bg-slate-100 text-slate-300 cursor-not-allowed"
                                )}
                                title={hasPhone ? `WhatsApp: ${phone}` : "No phone provided"}
                              >
                                <MessageCircle className="w-3.5 h-3.5" />
                              </button>

                              {/* Edit Affiliation / Position */}
                              <button
                                onClick={() => handleOpenEditModal(member)}
                                className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-indigo-600 text-white font-bold text-[11px] flex items-center gap-1 transition"
                              >
                                <Edit3 className="w-3 h-3" />
                                <span>Assign</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        /* CHAPTER JOIN REQUESTS SUB-VIEW */
        <div className="space-y-4">
          <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-emerald-600" />
              <span>Pending Chapter Membership Applications ({pendingRequestsCount})</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Approval is mandatory before applicants are granted membership in any university, high school, or community chapter. Approving updates the member’s official profile automatically.
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-[11px] font-black text-slate-500 uppercase tracking-wider">
                    <th className="px-6 py-4">Applicant</th>
                    <th className="px-6 py-4">Target Chapter</th>
                    <th className="px-4 py-4">Institution / School</th>
                    <th className="px-4 py-4">Requested Role</th>
                    <th className="px-6 py-4">Motivation & Details</th>
                    <th className="px-4 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Decision</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {joinRequests.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-slate-400 font-medium">
                        No chapter join requests recorded yet.
                      </td>
                    </tr>
                  ) : (
                    joinRequests.map(req => (
                      <tr key={req.id} className="hover:bg-slate-50/60 transition">
                        <td className="px-6 py-4">
                          <span className="font-bold text-slate-900 block">{req.full_name}</span>
                          <span className="text-[11px] text-slate-400 block">{req.email}</span>
                          <span className="text-[10px] text-emerald-600 font-medium block">{req.phone}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-bold text-slate-900 block">{req.chapter_name || 'Chapter'}</span>
                          <span className="text-[10px] text-indigo-500 font-medium">{req.province || 'National'}</span>
                        </td>
                        <td className="px-4 py-4 font-medium text-slate-700">
                          {req.institution}
                        </td>
                        <td className="px-4 py-4">
                          <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 font-bold rounded-lg text-[11px]">
                            {req.role_applying_for || 'Member'}
                          </span>
                        </td>
                        <td className="px-6 py-4 max-w-xs">
                          <p className="text-slate-600 line-clamp-2 text-[11px]">
                            {req.motivation || 'General student membership request.'}
                          </p>
                          <span className="text-[10px] text-slate-400 block mt-1">
                            Submitted: {new Date(req.submitted_at).toLocaleDateString()}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className={cn(
                            "px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider",
                            req.status === 'approved' ? "bg-emerald-100 text-emerald-800" :
                            req.status === 'rejected' ? "bg-red-100 text-red-800" :
                            "bg-amber-100 text-amber-800 animate-pulse"
                          )}>
                            {req.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right whitespace-nowrap">
                          {req.status === 'pending' ? (
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleApproveJoinRequest(req)}
                                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs transition"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleRejectJoinRequest(req)}
                                className="px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs transition"
                              >
                                Reject
                              </button>
                            </div>
                          ) : (
                            <span className="text-slate-400 text-xs font-semibold capitalize">Processed</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Edit Chapter Affiliation & Leadership Position */}
      {editingMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-5"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-black text-slate-900 text-base">Assign Chapter & Leadership Position</h3>
                <p className="text-xs text-slate-500">Updating member: <strong>{editingMember.display_name}</strong></p>
              </div>
              <button 
                onClick={() => setEditingMember(null)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Official Member ID Number</label>
                <input
                  type="text"
                  value={editMemberId}
                  onChange={(e) => setEditMemberId(e.target.value)}
                  placeholder="e.g. YARA-2026-1042"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Assign to Registered Chapter</label>
                <select
                  value={editChapterId}
                  onChange={(e) => setEditChapterId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-bold"
                >
                  <option value="">-- No Chapter (Independent / Awaiting Placement) --</option>
                  {chapters.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.province})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Assigned Leadership Position</label>
                <select
                  value={editPosition}
                  onChange={(e) => setEditPosition(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-bold"
                >
                  {LEADERSHIP_POSITIONS.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
              <button
                onClick={() => setEditingMember(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveMemberAffiliation}
                disabled={isSavingMember}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition flex items-center gap-2"
              >
                {isSavingMember && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>Save Changes</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Modal: Email Member */}
      {emailModalMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-black text-slate-900 text-base">Direct Member Communication</h3>
                <p className="text-xs text-slate-500">Recipient: <strong>{emailModalMember.display_name}</strong> ({emailModalMember.email})</p>
              </div>
              <button 
                onClick={() => setEmailModalMember(null)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl"
              >
                ✕
              </button>
            </div>

            {emailStatus && (
              <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-bold">
                {emailStatus}
              </div>
            )}

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Subject</label>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Message Content</label>
                <textarea
                  rows={6}
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 font-medium resize-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <span className="text-[11px] text-slate-400">Launches configured mail client or native composer</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEmailModalMember(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendEmailNative}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition flex items-center gap-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Message</span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
