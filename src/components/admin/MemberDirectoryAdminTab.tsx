import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Users, Search, Mail, Phone, MapPin, Building2, Shield, 
  Check, Copy, ExternalLink, MessageCircle, Edit3, CheckCircle2, 
  XCircle, Filter, ChevronDown, UserCheck, UserX, Clock, 
  Send, RefreshCw, AlertCircle, Award, Landmark, UserPlus,
  Layers, Upload, Download, FileSpreadsheet, CheckSquare, Square,
  MessageSquare, Sparkles, ChevronRight, Share2, Info, CreditCard,
  ShieldCheck, AlertTriangle, Key, Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../../lib/supabase';
import { cn } from '../../lib/utils';
import { getChapters } from '../../services/chaptersService';
import { Chapter } from '../../types/chapters';
import { yaraV3Service } from '../../services/v3/yaraV3Service';
import { 
  getAllSubscriptions, 
  approveUserSubscription 
} from '../../services/partnershipDonationService';
import { UserSubscription } from '../../types/partnershipsAndDonations';

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
  trial_ends_at?: string;
  subscription_status?: string;
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

export const NATIONAL_EXECUTIVE_ROLES = [
  'National Executive Director / President',
  'Deputy National Executive Director / Vice President',
  'National Secretary General',
  'Deputy National Secretary General',
  'National Treasurer / Director of Finance',
  'National Technical & Robotics Director',
  'National AI & IoT Innovation Director',
  'National Director of Education & Curriculum',
  'National PR & Communications Director',
  'National Logistics & Events Director',
  'National Partnerships & Resource Mobilization Director',
  'National Provincial & Chapters Coordinator',
  'National Youth & Gender Inclusion Officer',
  'Senior Patron & Executive Advisor',
  'National Executive Council Member'
];

export const CHAPTER_LEADERSHIP_ROLES = [
  'Member',
  'Chapter Lead / President',
  'Chapter Vice Lead',
  'Chapter Secretary',
  'Chapter Treasurer / Finance Lead',
  'Technical Lead / Robotics Marshal',
  'Faculty Patron / Advisor',
  'Communications & PR Officer',
  'Provincial Coordinator',
  'District Coordinator'
];

export const LEADERSHIP_POSITIONS = [
  ...NATIONAL_EXECUTIVE_ROLES,
  ...CHAPTER_LEADERSHIP_ROLES
];

export const isNationalExecutive = (member?: ExtendedUserProfile | null | { chapter_position?: string }): boolean => {
  if (!member || !member.chapter_position) return false;
  const pos = member.chapter_position.toLowerCase();
  return NATIONAL_EXECUTIVE_ROLES.some(r => r.toLowerCase() === pos) ||
         pos.startsWith('national') ||
         pos.includes('executive director') ||
         pos.includes('secretary general');
};

export default function MemberDirectoryAdminTab() {
  const [users, setUsers] = useState<ExtendedUserProfile[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [joinRequests, setJoinRequests] = useState<ChapterJoinRequestItem[]>([]);
  const [subscriptions, setSubscriptions] = useState<UserSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSubView, setActiveSubView] = useState<'directory' | 'pending_subs' | 'expired_trials' | 'join_requests'>('directory');

  // Filters & Display
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedChapterFilter, setSelectedChapterFilter] = useState('ALL');
  const [selectedPositionFilter, setSelectedPositionFilter] = useState('ALL');
  const [selectedProvinceFilter, setSelectedProvinceFilter] = useState('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('ALL');
  const [groupBy, setGroupBy] = useState<'flat' | 'chapter' | 'province'>('flat');

  // Multi-Selection
  const [selectedMemberIds, setSelectedMemberIds] = useState<Set<string>>(new Set());

  // Edit Member Modal & National Executive Assignment
  const [editingMember, setEditingMember] = useState<ExtendedUserProfile | null>(null);
  const [editLeadershipTier, setEditLeadershipTier] = useState<'national_exec' | 'chapter_lead' | 'member'>('member');
  const [editChapterId, setEditChapterId] = useState('');
  const [editPosition, setEditPosition] = useState('Member');
  const [editCustomNationalRole, setEditCustomNationalRole] = useState('');
  const [editGrantAdminAccess, setEditGrantAdminAccess] = useState(false);
  const [editMemberId, setEditMemberId] = useState('');
  const [isSavingMember, setIsSavingMember] = useState(false);

  // Email Native Modal
  const [emailModalMember, setEmailModalMember] = useState<ExtendedUserProfile | null>(null);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [emailStatus, setEmailStatus] = useState<string | null>(null);

  // Upgrade / Change Plan Modal
  const [planModalMember, setPlanModalMember] = useState<ExtendedUserProfile | null>(null);
  const [selectedPlanType, setSelectedPlanType] = useState<'pro_annual' | 'lifetime' | 'institutional' | 'free_trial'>('pro_annual');
  const [isUpdatingPlan, setIsUpdatingPlan] = useState(false);

  // Multi-Channel Messaging Composer Modal
  const [messageModalOpen, setMessageModalOpen] = useState(false);
  const [messageChannel, setMessageChannel] = useState<'email' | 'whatsapp' | 'in_app' | 'sms'>('email');
  const [messageAudienceType, setMessageAudienceType] = useState<'all' | 'filtered' | 'selected' | 'chapter' | 'province' | 'leaders'>('all');
  const [targetChapterId, setTargetChapterId] = useState('');
  const [targetProvince, setTargetProvince] = useState('');
  const [broadcastSubject, setBroadcastSubject] = useState('Important Update from YARA Executive Secretariat');
  const [broadcastBody, setBroadcastBody] = useState(
    'Hello {{name}},\n\nThis is an official announcement from the Young Africans Robotics Association (YARA) Secretariat regarding {{chapter}} in {{province}}.\n\nPosition: {{position}}\n\n[Write your message here]\n\nInnovate Local, Build Global.'
  );
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [whatsappLinksChecklist, setWhatsappLinksChecklist] = useState<Array<{ id: string; name: string; phone: string; url: string; opened: boolean }> | null>(null);

  // Add Member Manually Modal
  const [addMemberModalOpen, setAddMemberModalOpen] = useState(false);
  const [newMemberForm, setNewMemberForm] = useState({
    chapter_id: '',
    full_name: '',
    email: '',
    phone: '',
    whatsapp_number: '',
    position_key: 'Member',
    institution: '',
    gender: 'Prefer not to say',
    notes: ''
  });
  const [isAddingMember, setIsAddingMember] = useState(false);

  // Feedback notifications & WhatsApp notify helper
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [lastDecisionWhatsAppLink, setLastDecisionWhatsAppLink] = useState<{ name: string; url: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Users from v_admin_member_directory (with fallback)
      const directoryData = await yaraV3Service.getAdminMemberDirectory();
      if (directoryData && directoryData.length > 0) {
        const mappedUsers: ExtendedUserProfile[] = directoryData.map((d: any) => ({
          id: d.id,
          display_name: d.name || d.display_name || 'Member',
          email: d.email,
          phone: d.phone,
          whatsapp_number: d.whatsapp || d.whatsapp_number,
          member_id: d.yara_member_id || d.member_id || null,
          role: d.role || 'student',
          avatar_url: d.avatar_url,
          province: d.province,
          district: d.district,
          country: d.country_iso2 || 'ZW',
          institution: d.institution,
          chapter_id: d.chapter_id,
          chapter_name: d.chapter_name,
          chapter_position: d.position || d.chapter_position || 'Member',
          registration_paid: Boolean(d.registration_paid),
          subscription_expires_at: d.subscription_expires_at,
          trial_ends_at: d.trial_ends_at,
          subscription_status: d.subscription_status,
          is_halted: d.status === 'suspended' || d.is_halted,
          created_at: d.joined_date || d.created_at || new Date().toISOString()
        }));
        setUsers(mappedUsers);
      } else {
        const { data: userData } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
        setUsers(userData || []);
      }

      // 2. Fetch Chapters
      const chapterList = await getChapters(true);
      setChapters(chapterList);

      // 3. Fetch Chapter Join Requests
      const { data: reqData } = await supabase
        .from('chapter_join_requests')
        .select('*')
        .order('submitted_at', { ascending: false });

      if (reqData) setJoinRequests(reqData);

      // 4. Fetch Subscriptions & Proofs
      const subs = await getAllSubscriptions();
      setSubscriptions(subs || []);
    } catch (err: any) {
      console.error('Error fetching member directory data:', err);
      showToast('error', err.message || 'Failed to load member records.');
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

  const uniqueProvinces = useMemo(() => {
    const set = new Set<string>();
    users.forEach(u => { if (u.province) set.add(u.province); });
    return Array.from(set).sort();
  }, [users]);

  // Clean phone number for WhatsApp
  const formatPhoneForWhatsApp = (phoneStr?: string): string => {
    if (!phoneStr) return '';
    let cleaned = phoneStr.replace(/[^0-9]/g, '');
    if (cleaned.startsWith('0') && cleaned.length >= 10) {
      cleaned = '263' + cleaned.slice(1);
    }
    return cleaned;
  };

  // Compute expired free trial users
  const expiredTrialUsers = useMemo(() => {
    return users.filter(u => {
      if (u.role === 'admin' || u.role === 'mentor' || u.role === 'teacher') return false;
      if (u.registration_paid) return false;
      if (u.subscription_expires_at && new Date(u.subscription_expires_at) > new Date()) return false;
      if (u.trial_ends_at && new Date(u.trial_ends_at) < new Date()) return true;
      return false;
    });
  }, [users]);

  // Compute pending subscription approval requests
  const pendingSubscriptions = useMemo(() => {
    return subscriptions.filter(s => (s.status as string) === 'pending_verification' || (s.status as string) === 'pending');
  }, [subscriptions]);

  const pendingRequestsCount = useMemo(() => {
    return joinRequests.filter(r => r.status === 'pending').length;
  }, [joinRequests]);

  const nationalExecutiveMembers = useMemo(() => {
    return users.filter(u => isNationalExecutive(u));
  }, [users]);

  // Filtered members list
  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const q = searchTerm.toLowerCase();
      const matchSearch = 
        !q ||
        u.display_name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.member_id?.toLowerCase().includes(q) ||
        u.chapter_name?.toLowerCase().includes(q) ||
        u.institution?.toLowerCase().includes(q) ||
        u.phone?.toLowerCase().includes(q) ||
        u.whatsapp_number?.toLowerCase().includes(q);

      const matchChapter = selectedChapterFilter === 'ALL' || u.chapter_id === selectedChapterFilter || u.chapter_name === selectedChapterFilter;
      const matchPosition = 
        selectedPositionFilter === 'ALL' ? true :
        selectedPositionFilter === 'NATIONAL_EXECUTIVE' ? isNationalExecutive(u) :
        (u.chapter_position || 'Member') === selectedPositionFilter;
      const matchProvince = selectedProvinceFilter === 'ALL' || u.province === selectedProvinceFilter;
      
      const isTrialExp = !u.registration_paid && u.trial_ends_at && new Date(u.trial_ends_at) < new Date();
      const isPaid = u.registration_paid || (u.subscription_expires_at && new Date(u.subscription_expires_at) > new Date());

      const matchStatus = 
        selectedStatusFilter === 'ALL' ? true :
        selectedStatusFilter === 'suspended' ? u.is_halted :
        selectedStatusFilter === 'paid' ? isPaid :
        selectedStatusFilter === 'trial_expired' ? isTrialExp :
        selectedStatusFilter === 'national_exec' ? isNationalExecutive(u) :
        selectedStatusFilter === 'leaders' ? (u.chapter_position && u.chapter_position !== 'Member') :
        true;

      return matchSearch && matchChapter && matchPosition && matchProvince && matchStatus;
    });
  }, [users, searchTerm, selectedChapterFilter, selectedPositionFilter, selectedProvinceFilter, selectedStatusFilter]);

  // Multi-select handlers
  const handleToggleSelect = (id: string) => {
    setSelectedMemberIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSelectAll = () => {
    if (selectedMemberIds.size === filteredUsers.length) {
      setSelectedMemberIds(new Set());
    } else {
      setSelectedMemberIds(new Set(filteredUsers.map(u => u.id)));
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    const listToExport = selectedMemberIds.size > 0 
      ? users.filter(u => selectedMemberIds.has(u.id))
      : filteredUsers;

    const headers = ['YARA Member ID', 'Full Name', 'Email', 'Phone', 'WhatsApp', 'Chapter', 'Position', 'Province', 'District', 'Status', 'Trial End Date'];
    const rows = listToExport.map(u => [
      `"${u.member_id || ''}"`,
      `"${u.display_name || ''}"`,
      `"${u.email || ''}"`,
      `"${u.phone || ''}"`,
      `"${u.whatsapp_number || ''}"`,
      `"${u.chapter_name || 'No chapter'}"`,
      `"${u.chapter_position || 'Member'}"`,
      `"${u.province || ''}"`,
      `"${u.district || ''}"`,
      `"${u.is_halted ? 'Suspended' : u.registration_paid ? 'Active (Paid)' : 'Trial'}"`,
      `"${u.trial_ends_at ? new Date(u.trial_ends_at).toLocaleDateString() : 'N/A'}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `YARA_Members_Register_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('success', `Exported ${listToExport.length} members to CSV.`);
  };

  // CSV Bulk Import
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      if (!text) return;
      const lines = text.split('\n').filter(l => l.trim().length > 0);
      if (lines.length <= 1) {
        showToast('error', 'CSV file is empty or missing headers.');
        return;
      }

      let imported = 0;
      for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].split(',').map(p => p.trim().replace(/^"|"$/g, ''));
        if (parts.length >= 2) {
          const [fullName, email, phone, chapter, pos] = parts;
          try {
            await yaraV3Service.adminAddChapterMember({
              chapter_id: chapter || chapters[0]?.id || '',
              full_name: fullName || 'Innovator',
              email: email || '',
              phone: phone || '',
              position_key: pos || 'Member'
            });
            imported++;
          } catch {}
        }
      }
      showToast('success', `Imported ${imported} members from CSV.`);
      fetchData();
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Direct WhatsApp & Email actions
  const handleOpenWhatsApp = (member: ExtendedUserProfile) => {
    if (!member) return;
    const rawPhone = member.whatsapp_number || member.contact_phone || member.phone;
    const cleanPhone = formatPhoneForWhatsApp(rawPhone);

    if (!cleanPhone) {
      alert(`No valid telephone or WhatsApp number found for ${member.display_name}.`);
      return;
    }

    const prefilledText = encodeURIComponent(
      `Hello ${member.display_name},\n\nThis is the Young Africans Robotics Association (YARA) Secretariat regarding your membership${member.chapter_name ? ` with ${member.chapter_name}` : ''}.\n\nMember ID: ${member.member_id || 'Pending'}\nPosition: ${member.chapter_position || 'Member'}\n\nHow can we support your robotics innovation activities today?`
    );

    const waUrl = `https://wa.me/${cleanPhone}?text=${prefilledText}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  const handleOpenEmail = (member: ExtendedUserProfile) => {
    if (!member) return;
    setEmailModalMember(member);
    setEmailSubject(`YARA Notice: Official Update for ${member.display_name}`);
    setEmailBody(
      `Dear ${member.display_name},\n\nGreetings from the Young Africans Robotics Association (YARA) Secretariat.\n\nWe are writing to you regarding your active status with ${member.chapter_name || 'the YARA Pan-African Platform'}.\n\nMember ID: ${member.member_id || 'Not Assigned'}\nRole / Position: ${member.chapter_position || member.role || 'Member'}\n\n[Please enter your message here]\n\nBest regards,\nYARA Executive Secretariat\nInnovate Local, Build Global`
    );
  };

  const openInGmail = (recipients: string[], subject: string, body: string) => {
    if (recipients.length === 0) {
      showToast('error', 'No recipient emails specified.');
      return;
    }
    const validEmails = Array.from(new Set(recipients.map(e => (e || '').trim()).filter(e => e && e.includes('@'))));
    if (validEmails.length === 0) {
      showToast('error', 'None of the selected members have a valid email address.');
      return;
    }

    const to = validEmails.length === 1 ? validEmails[0] : '';
    const bcc = validEmails.length > 1 ? validEmails.join(',') : '';

    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(to)}&bcc=${encodeURIComponent(bcc)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(gmailUrl, '_blank', 'noopener,noreferrer');
  };

  const handleSendEmailNative = () => {
    if (!emailModalMember?.email) return;
    const mailto = `mailto:${encodeURIComponent(emailModalMember.email)}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
    window.location.href = mailto;
    setEmailStatus('Default email client opened!');
    setTimeout(() => {
      setEmailStatus(null);
      setEmailModalMember(null);
    }, 2000);
  };

  const handleSendEmailGmail = () => {
    if (!emailModalMember?.email) return;
    openInGmail([emailModalMember.email], emailSubject, emailBody);
    setEmailStatus('Gmail web composer opened in new tab!');
    setTimeout(() => {
      setEmailStatus(null);
      setEmailModalMember(null);
    }, 2000);
  };

  // Delete Single User Account
  const handleDeleteMember = async (member: ExtendedUserProfile) => {
    if (!member) return;
    const confirmed = window.confirm(
      `CRITICAL ACTION:\nAre you sure you want to permanently delete the account for "${member.display_name}" (${member.email})?\n\nThis will remove their member profile, chapter assignment, and progress. This action cannot be undone.`
    );
    if (!confirmed) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', member.id);

      if (error) throw error;

      setUsers(prev => prev.filter(u => u.id !== member.id));
      setSelectedMemberIds(prev => {
        const next = new Set(prev);
        next.delete(member.id);
        return next;
      });
      showToast('success', `Account for "${member.display_name}" was permanently deleted.`);
    } catch (err: any) {
      showToast('error', err.message || 'Failed to delete user account.');
    }
  };

  // Bulk Delete Selected Users
  const handleBulkDeleteSelected = async () => {
    if (selectedMemberIds.size === 0) return;
    const count = selectedMemberIds.size;
    const confirmed = window.confirm(
      `CRITICAL BULK ACTION:\nAre you sure you want to permanently delete ${count} selected user accounts?\n\nThis will delete their profiles from the database and cannot be undone.`
    );
    if (!confirmed) return;

    try {
      const idsToDelete = Array.from(selectedMemberIds);
      const { error } = await supabase
        .from('profiles')
        .delete()
        .in('id', idsToDelete);

      if (error) throw error;

      setUsers(prev => prev.filter(u => !selectedMemberIds.has(u.id)));
      setSelectedMemberIds(new Set());
      showToast('success', `Permanently deleted ${count} member accounts.`);
    } catch (err: any) {
      showToast('error', err.message || 'Failed to delete selected accounts.');
    }
  };

  // Change Plan Handler
  const handleSavePlanChange = async () => {
    if (!planModalMember) return;
    setIsUpdatingPlan(true);
    try {
      let isPaid = true;
      let expiresAt: string | null = null;
      let trialEndsAt: string | null = null;
      let planTitle = 'Annual Pro Membership';

      const now = new Date();
      if (selectedPlanType === 'pro_annual') {
        isPaid = true;
        expiresAt = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000).toISOString();
        planTitle = 'Annual Pro Membership ($15 USD / 1 Year)';
      } else if (selectedPlanType === 'lifetime') {
        isPaid = true;
        expiresAt = new Date(now.getTime() + 10 * 365 * 24 * 60 * 60 * 1000).toISOString();
        planTitle = 'Lifetime Innovator Access';
      } else if (selectedPlanType === 'institutional') {
        isPaid = true;
        expiresAt = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000).toISOString();
        planTitle = 'Institutional / School Partner Pass';
      } else if (selectedPlanType === 'free_trial') {
        isPaid = false;
        trialEndsAt = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString();
        expiresAt = null;
        planTitle = 'Free Trial (14 Days Extended)';
      }

      // Update profiles
      const { error: profErr } = await supabase
        .from('profiles')
        .update({
          registration_paid: isPaid,
          subscription_expires_at: expiresAt,
          trial_ends_at: trialEndsAt,
          updated_at: new Date().toISOString()
        })
        .eq('id', planModalMember.id);

      if (profErr) throw profErr;

      // Upsert into subscriptions
      try {
        await supabase.from('subscriptions').insert({
          id: 'sub_admin_' + planModalMember.id.slice(0, 6) + '_' + Date.now().toString(36),
          user_id: planModalMember.id,
          user_email: planModalMember.email,
          user_name: planModalMember.display_name,
          plan_type: selectedPlanType,
          amount: isPaid ? 15 : 0,
          currency: 'USD',
          payment_method: 'admin_manual_grant',
          payment_reference: 'ADMIN-' + Date.now().toString(36).toUpperCase(),
          status: isPaid ? 'active' : 'trial',
          starts_at: new Date().toISOString(),
          expires_at: expiresAt || new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString(),
          admin_notes: `Plan changed to ${planTitle} by Admin.`
        });
      } catch {
        // sync note
      }

      // Update state locally
      setUsers(prev => prev.map(u => {
        if (u.id === planModalMember.id) {
          return {
            ...u,
            registration_paid: isPaid,
            subscription_expires_at: expiresAt || undefined,
            trial_ends_at: trialEndsAt || undefined
          };
        }
        return u;
      }));

      showToast('success', `Updated plan for ${planModalMember.display_name} to ${planTitle}.`);
      setPlanModalMember(null);
    } catch (err: any) {
      showToast('error', err.message || 'Failed to update member plan.');
    } finally {
      setIsUpdatingPlan(false);
    }
  };

  // 1-Click Approve Subscription Handler
  const handleApproveSubscription = async (userId: string, userEmail: string, subId?: string) => {
    try {
      const oneYearAhead = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
      
      // 1. Update profiles table
      const { error: profErr } = await supabase.from('profiles').update({
        registration_paid: true,
        subscription_expires_at: oneYearAhead,
        updated_at: new Date().toISOString()
      }).eq('id', userId);

      if (profErr) {
        console.warn('Profile update note:', profErr.message);
      }

      // 2. Call approveUserSubscription service
      if (subId) {
        await approveUserSubscription(subId, userId, 365);
      }

      showToast('success', `Subscription APPROVED for ${userEmail}! Full LMS courses unlocked.`);
      fetchData();
    } catch (err: any) {
      showToast('error', err.message || 'Failed to approve subscription.');
    }
  };

  // Open Edit Modal with National Executive options
  const handleOpenEditModal = (member: ExtendedUserProfile, forceNationalExec = false) => {
    if (!member) return;
    setEditingMember(member);
    const isNat = forceNationalExec || isNationalExecutive(member);
    setEditLeadershipTier(isNat ? 'national_exec' : (member.chapter_position && member.chapter_position !== 'Member' ? 'chapter_lead' : 'member'));
    setEditChapterId(member.chapter_id || '');
    
    const currentPos = member.chapter_position || 'Member';
    setEditPosition(isNat && currentPos === 'Member' ? NATIONAL_EXECUTIVE_ROLES[0] : currentPos);
    
    if (isNat && !NATIONAL_EXECUTIVE_ROLES.includes(currentPos)) {
      setEditCustomNationalRole(currentPos);
    } else {
      setEditCustomNationalRole('');
    }
    
    setEditGrantAdminAccess(member.role === 'admin');
    setEditMemberId(member.member_id || '');
  };

  const handleSaveMemberAffiliation = async () => {
    if (!editingMember) return;
    setIsSavingMember(true);

    try {
      let finalPosition = editPosition;
      if (editLeadershipTier === 'national_exec') {
        if (editPosition === 'Custom Title' && editCustomNationalRole.trim()) {
          finalPosition = editCustomNationalRole.trim();
        } else if (!finalPosition || finalPosition === 'Member') {
          finalPosition = NATIONAL_EXECUTIVE_ROLES[0];
        }
      } else if (editLeadershipTier === 'member') {
        finalPosition = 'Member';
      }

      const selectedChapter = chapters.find(c => c.id === editChapterId);
      const chapterName = selectedChapter 
        ? selectedChapter.name 
        : (editLeadershipTier === 'national_exec' ? 'National Executive Secretariat' : null);

      await yaraV3Service.setMemberPosition(editingMember.id, finalPosition, editChapterId);

      const updatePayload: any = {
        chapter_id: editChapterId || null,
        chapter_name: chapterName,
        chapter_position: finalPosition,
        member_id: editMemberId.trim() || null,
        role: editGrantAdminAccess ? 'admin' : editingMember.role,
        updated_at: new Date().toISOString()
      };

      await supabase.from('profiles').update(updatePayload).eq('id', editingMember.id);

      setUsers(prev => prev.map(u => u.id === editingMember.id ? { ...u, ...updatePayload } : u));
      showToast('success', `Assigned ${finalPosition} to ${editingMember.display_name}.`);
      setEditingMember(null);
    } catch (err: any) {
      showToast('error', err.message || 'Failed to update member details.');
    } finally {
      setIsSavingMember(false);
    }
  };

  const handleToggleStatus = async (member: ExtendedUserProfile, newStatus: 'active' | 'suspended') => {
    if (!member) return;
    try {
      await yaraV3Service.setMemberStatus(member.id, newStatus);
      setUsers(prev => prev.map(u => u.id === member.id ? { ...u, is_halted: newStatus === 'suspended' } : u));
      showToast('success', `Member status changed to ${newStatus}.`);
    } catch (err: any) {
      showToast('error', err.message || 'Failed to change status.');
    }
  };

  // Approve Chapter Join Request
  const handleApproveJoinRequest = async (req: ChapterJoinRequestItem) => {
    try {
      const res = await yaraV3Service.reviewChapterJoinRequest({
        request_id: req.id,
        decision: 'approved',
        position_key: req.role_applying_for || 'Member',
        phone: req.phone,
        name: req.full_name
      });

      setJoinRequests(prev => prev.map(r => r.id === req.id ? { ...r, status: 'approved' } : r));
      showToast('success', `Approved ${req.full_name} for ${req.chapter_name || 'chapter'}!`);

      if (res?.notify_whatsapp_link) {
        setLastDecisionWhatsAppLink({
          name: req.full_name,
          url: res.notify_whatsapp_link
        });
      }
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
      const res = await yaraV3Service.reviewChapterJoinRequest({
        request_id: req.id,
        decision: 'rejected',
        message: reason,
        phone: req.phone,
        name: req.full_name
      });

      setJoinRequests(prev => prev.map(r => r.id === req.id ? { ...r, status: 'rejected' } : r));
      showToast('success', `Rejected request from ${req.full_name}.`);

      if (res?.notify_whatsapp_link) {
        setLastDecisionWhatsAppLink({
          name: req.full_name,
          url: res.notify_whatsapp_link
        });
      }
    } catch (err: any) {
      showToast('error', err.message || 'Failed to reject request.');
    }
  };

  // Add Member Manually Form submit
  const handleAddMemberSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberForm.full_name.trim() || !newMemberForm.email.trim() || !newMemberForm.chapter_id) {
      showToast('error', 'Please provide at least Name, Email, and Chapter.');
      return;
    }

    setIsAddingMember(true);
    try {
      await yaraV3Service.adminAddChapterMember({
        chapter_id: newMemberForm.chapter_id,
        full_name: newMemberForm.full_name.trim(),
        email: newMemberForm.email.trim().toLowerCase(),
        phone: newMemberForm.phone.trim(),
        position_key: newMemberForm.position_key,
        whatsapp_number: newMemberForm.whatsapp_number.trim() || newMemberForm.phone.trim(),
        institution: newMemberForm.institution.trim(),
        gender: newMemberForm.gender,
        notes: newMemberForm.notes.trim()
      });

      showToast('success', `Added ${newMemberForm.full_name} to chapter!`);
      setAddMemberModalOpen(false);
      setNewMemberForm({
        chapter_id: '',
        full_name: '',
        email: '',
        phone: '',
        whatsapp_number: '',
        position_key: 'Member',
        institution: '',
        gender: 'Prefer not to say',
        notes: ''
      });
      fetchData();
    } catch (err: any) {
      showToast('error', err.message || 'Failed to add member.');
    } finally {
      setIsAddingMember(false);
    }
  };

  // Calculate target audience for Broadcast
  const targetRecipients = useMemo(() => {
    let recs: ExtendedUserProfile[] = [];
    if (messageAudienceType === 'all') {
      recs = users;
    } else if (messageAudienceType === 'filtered') {
      recs = filteredUsers;
    } else if (messageAudienceType === 'selected') {
      recs = users.filter(u => selectedMemberIds.has(u.id));
    } else if (messageAudienceType === 'chapter') {
      recs = users.filter(u => u.chapter_id === targetChapterId || u.chapter_name === targetChapterId);
    } else if (messageAudienceType === 'province') {
      recs = users.filter(u => u.province === targetProvince);
    } else if (messageAudienceType === 'leaders') {
      recs = users.filter(u => u.chapter_position && u.chapter_position !== 'Member');
    }
    return recs;
  }, [messageAudienceType, users, filteredUsers, selectedMemberIds, targetChapterId, targetProvince]);

  // Handle Multi-Channel Broadcast Send
  const handleSendBroadcast = async () => {
    if (messageChannel === 'sms') {
      showToast('error', 'SMS Gateway is currently in Coming Soon mode. Please use Email, WhatsApp, or In-App.');
      return;
    }

    if (!broadcastBody.trim()) {
      showToast('error', 'Please provide message content.');
      return;
    }

    if (targetRecipients.length === 0) {
      showToast('error', 'No recipients match the selected audience criteria.');
      return;
    }

    setIsSendingMessage(true);
    try {
      const recipientPayload = targetRecipients.map(u => ({
        name: u.display_name,
        email: u.email,
        phone: u.whatsapp_number || u.phone || '',
        chapter: u.chapter_name || 'YARA Chapter',
        position: u.chapter_position || 'Member',
        province: u.province || 'Zimbabwe'
      }));

      const res = await yaraV3Service.adminComposeMessage({
        channel: messageChannel,
        audience: {
          type: messageAudienceType,
          count: targetRecipients.length,
          chapter_id: targetChapterId || null,
          province: targetProvince || null
        },
        subject: broadcastSubject,
        body: broadcastBody,
        recipients: recipientPayload
      });

      if (messageChannel === 'whatsapp' && res?.whatsapp_links) {
        setWhatsappLinksChecklist(res.whatsapp_links);
        showToast('success', `Generated ${res.whatsapp_links.length} personalized WhatsApp messages!`);
      } else {
        showToast('success', res?.message || `Dispatched ${messageChannel} to ${targetRecipients.length} members.`);
        setMessageModalOpen(false);
      }
    } catch (err: any) {
      showToast('error', err.message || 'Failed to dispatch message.');
    } finally {
      setIsSendingMessage(false);
    }
  };

  // Grouped members for grouped display mode
  const groupedData = useMemo(() => {
    if (groupBy === 'chapter') {
      const map: Record<string, ExtendedUserProfile[]> = {};
      filteredUsers.forEach(u => {
        const key = u.chapter_name || 'No Chapter (Awaiting Placement)';
        if (!map[key]) map[key] = [];
        map[key].push(u);
      });
      return map;
    }
    if (groupBy === 'province') {
      const map: Record<string, ExtendedUserProfile[]> = {};
      filteredUsers.forEach(u => {
        const key = u.province || 'National / Other';
        if (!map[key]) map[key] = [];
        map[key].push(u);
      });
      return map;
    }
    return null;
  }, [groupBy, filteredUsers]);

  // Safe Member Row Renderer (Defined at component level)
  const renderMemberRow = (member: ExtendedUserProfile) => {
    if (!member) return null;
    const phone = member.whatsapp_number || member.contact_phone || member.phone || '';
    const hasPhone = Boolean(phone);
    const isLeader = member.chapter_position && member.chapter_position !== 'Member';
    const isSelected = selectedMemberIds.has(member.id);
    const isTrialExpired = !member.registration_paid && member.trial_ends_at && new Date(member.trial_ends_at) < new Date();
    const isPaidActive = member.registration_paid || (member.subscription_expires_at && new Date(member.subscription_expires_at) > new Date());

    return (
      <tr key={member.id} className={cn("hover:bg-slate-50/60 transition group", isSelected && "bg-indigo-50/30")}>
        {/* Checkbox */}
        <td className="px-4 py-4 text-center">
          <button onClick={() => handleToggleSelect(member.id)} className="p-1 text-slate-400 hover:text-indigo-600 transition">
            {isSelected ? <CheckSquare className="w-4 h-4 text-indigo-600" /> : <Square className="w-4 h-4" />}
          </button>
        </td>

        {/* Member Info */}
        <td className="px-4 py-4">
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
          {isNationalExecutive(member) ? (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-gradient-to-r from-amber-100 via-amber-50 to-amber-100 border border-amber-300 text-amber-950 shadow-xs font-black text-[11px]">
              <span>👑</span>
              <span className="truncate max-w-[180px]">{member.chapter_position}</span>
              <span className="text-[8px] bg-amber-400 text-amber-950 px-1.5 py-0.5 rounded font-black uppercase tracking-wider">National Exec</span>
            </div>
          ) : (
            <div className="flex flex-col gap-1 items-start">
              <span className={cn(
                "px-2.5 py-1 rounded-lg text-[11px] font-black inline-block",
                isLeader
                  ? "bg-amber-100 text-amber-900 border border-amber-200"
                  : "bg-slate-100 text-slate-700"
              )}>
                {member.chapter_position || 'Member'}
              </span>
              {member.role === 'mentor' && (
                <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-purple-100 text-purple-900 border border-purple-200">
                  Mentor
                </span>
              )}
            </div>
          )}
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

        {/* Status: Active / Trial Expired / Suspended */}
        <td className="px-4 py-4 whitespace-nowrap">
          {member.is_halted ? (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-100 text-red-800">
              Suspended
            </span>
          ) : isPaidActive ? (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800">
              Active (Paid)
            </span>
          ) : isTrialExpired ? (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300">
              Trial Expired (Locked)
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-50 text-blue-800">
              Free Trial
            </span>
          )}
        </td>

        {/* Actions: Email, WhatsApp, Approve Sub, Edit, Status */}
        <td className="px-6 py-4 text-right whitespace-nowrap">
          <div className="flex items-center justify-end gap-1.5">
            {/* Quick 1-Click Approve Subscription Button if not paid */}
            {!isPaidActive && (
              <button
                onClick={() => handleApproveSubscription(member.id, member.email)}
                className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 shadow-xs transition"
                title="Activate / Approve Annual Subscription for Member"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Approve Access</span>
              </button>
            )}

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

            {/* Quick Assign / Edit National Executive Role */}
            <button
              onClick={() => handleOpenEditModal(member, true)}
              className={cn(
                "p-2 rounded-xl transition text-xs font-black shadow-xs",
                isNationalExecutive(member)
                  ? "bg-amber-100 text-amber-950 border border-amber-300 hover:bg-amber-200"
                  : "bg-slate-100 text-slate-500 hover:bg-amber-50 hover:text-amber-900"
              )}
              title="Assign or Update National Executive Council Role"
            >
              👑
            </button>

            {/* Edit Position & Chapter */}
            <button
              onClick={() => handleOpenEditModal(member, false)}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
              title="Change chapter or leadership position"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>

            {/* Change Plan / Upgrade from Trial */}
            <button
              onClick={() => {
                setPlanModalMember(member);
                setSelectedPlanType(member.registration_paid ? 'pro_annual' : 'pro_annual');
              }}
              className="p-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 transition"
              title="Upgrade or Change Member Plan"
            >
              <Award className="w-3.5 h-3.5" />
            </button>

            {/* Toggle Status (Suspend / Reactivate) */}
            <button
              onClick={() => handleToggleStatus(member, member.is_halted ? 'active' : 'suspended')}
              className={cn(
                "p-2 rounded-xl transition",
                member.is_halted
                  ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              )}
              title={member.is_halted ? "Re-activate Member" : "Suspend Member"}
            >
              {member.is_halted ? <UserCheck className="w-3.5 h-3.5" /> : <UserX className="w-3.5 h-3.5" />}
            </button>

            {/* If member is a mentor, show Revoke Mentor button */}
            {member.role === 'mentor' && (
              <button
                onClick={async () => {
                  if (window.confirm(`Are you sure you want to remove ${member.display_name} as a mentor? Their role will be reverted to innovator.`)) {
                    try {
                      const { error } = await supabase
                        .from('profiles')
                        .update({ role: 'innovator', updated_at: new Date().toISOString() })
                        .eq('id', member.id);
                      if (error) throw error;
                      setUsers(prev => prev.map(u => u.id === member.id ? { ...u, role: 'innovator' } : u));
                      showToast('success', `Removed mentor status for ${member.display_name}.`);
                    } catch (err: any) {
                      showToast('error', err.message || 'Failed to remove mentor.');
                    }
                  }
                }}
                className="p-2 rounded-xl bg-purple-50 hover:bg-red-50 text-purple-700 hover:text-red-600 transition"
                title="Remove Mentor Status (Revert to Innovator)"
              >
                <UserX className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Delete Member Account */}
            <button
              onClick={() => handleDeleteMember(member)}
              className="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 transition"
              title="Permanently Delete Member Account"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </td>
      </tr>
    );
  };

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

      {/* ADMIN NOTIFICATION 1: Pending Subscription Approvals */}
      {pendingSubscriptions.length > 0 && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-black text-emerald-950 block">
                🔔 Subscription Requests: {pendingSubscriptions.length} Member(s) Waiting for Approval
              </span>
              <span className="text-[11px] text-emerald-700">
                Payment proofs submitted. Approve their subscriptions to unlock all LMS modules and competition passes.
              </span>
            </div>
          </div>
          <button
            onClick={() => setActiveSubView('pending_subs')}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded-xl shadow-xs transition shrink-0"
          >
            Review &amp; Approve ({pendingSubscriptions.length})
          </button>
        </div>
      )}

      {/* ADMIN NOTIFICATION 2: Free Trial Expired Members */}
      {expiredTrialUsers.length > 0 && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-black text-amber-950 block">
                ⏳ Trial Expired: {expiredTrialUsers.length} Member(s) with Ended Free Trial
              </span>
              <span className="text-[11px] text-amber-800">
                Their courses and exclusive events are currently locked, while website and community updates remain accessible.
              </span>
            </div>
          </div>
          <button
            onClick={() => setActiveSubView('expired_trials')}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black rounded-xl shadow-xs transition shrink-0"
          >
            View Expired ({expiredTrialUsers.length})
          </button>
        </div>
      )}

      {/* WhatsApp Quick Notification Banner after Approval */}
      {lastDecisionWhatsAppLink && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-black text-emerald-950 block">
                Applicant Processed: {lastDecisionWhatsAppLink.name}
              </span>
              <span className="text-[11px] text-emerald-700">
                You can immediately notify them on WhatsApp with their official decision status.
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={lastDecisionWhatsAppLink.url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded-xl flex items-center gap-1.5 shadow-sm transition"
            >
              <span>Tell them on WhatsApp</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <button
              onClick={() => setLastDecisionWhatsAppLink(null)}
              className="text-emerald-700 hover:text-emerald-900 text-xs font-bold px-2 py-1"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Top Header & Sub-View Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-indigo-600" />
            <span>Master Member Directory &amp; Messaging Console</span>
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-1">
            YARA membership register, Member ID records, trial expiry alerts, subscription approvals, and multi-channel messaging.
          </p>
        </div>

        {/* View Switcher Chips */}
        <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl shrink-0 flex-wrap">
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
            onClick={() => {
              setActiveSubView('directory');
              setSelectedPositionFilter(selectedPositionFilter === 'NATIONAL_EXECUTIVE' ? 'ALL' : 'NATIONAL_EXECUTIVE');
            }}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all relative",
              selectedPositionFilter === 'NATIONAL_EXECUTIVE' 
                ? "bg-amber-100 text-amber-950 border border-amber-300 shadow-xs font-black" 
                : "text-slate-600 hover:text-slate-900"
            )}
            title="Filter by National Executive Council Members"
          >
            <span>👑</span>
            <span>National Executive ({nationalExecutiveMembers.length})</span>
          </button>

          <button
            onClick={() => setActiveSubView('pending_subs')}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all relative",
              activeSubView === 'pending_subs' 
                ? "bg-white text-slate-900 shadow-xs" 
                : "text-slate-600 hover:text-slate-900"
            )}
          >
            <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
            <span>Subscription Approvals</span>
            {pendingSubscriptions.length > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white font-black text-[10px] animate-pulse">
                {pendingSubscriptions.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveSubView('expired_trials')}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all relative",
              activeSubView === 'expired_trials' 
                ? "bg-white text-slate-900 shadow-xs" 
                : "text-slate-600 hover:text-slate-900"
            )}
          >
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>Trial Expired</span>
            {expiredTrialUsers.length > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white font-black text-[10px]">
                {expiredTrialUsers.length}
              </span>
            )}
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
            <UserPlus className="w-3.5 h-3.5 text-indigo-600" />
            <span>Join Requests</span>
            {pendingRequestsCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-indigo-500 text-white font-black text-[10px] animate-pulse">
                {pendingRequestsCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* VIEW 1: MASTER DIRECTORY */}
      {activeSubView === 'directory' && (
        <>
          {/* Summary Badges & Quick Action Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold text-slate-400 block uppercase">Total Registered</span>
              <span className="text-2xl font-black text-slate-900 mt-1 block">{users.length}</span>
            </div>
            <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold text-slate-400 block uppercase">Active &amp; Paid LMS</span>
              <span className="text-2xl font-black text-emerald-600 mt-1 block">
                {users.filter(u => u.registration_paid || (u.subscription_expires_at && new Date(u.subscription_expires_at) > new Date())).length}
              </span>
            </div>
            <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold text-slate-400 block uppercase">Trial Expired</span>
              <span className="text-2xl font-black text-amber-500 mt-1 block">
                {expiredTrialUsers.length}
              </span>
            </div>
            <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold text-slate-400 block uppercase">Selected Members</span>
              <span className="text-2xl font-black text-indigo-600 mt-1 block">
                {selectedMemberIds.size}
              </span>
            </div>
          </div>

          {/* Action Ribbon: Message Members, Add Member, Import/Export */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-900 text-white rounded-2xl shadow-sm">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-lg border border-amber-400/20">
                Action Center
              </span>
              <span className="text-xs text-slate-300">
                {selectedMemberIds.size > 0 ? `${selectedMemberIds.size} selected` : `${filteredUsers.length} in current view`}
              </span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Email Selected in Gmail */}
              {selectedMemberIds.size > 0 && (
                <button
                  onClick={() => {
                    const emails = users.filter(u => selectedMemberIds.has(u.id)).map(u => u.email).filter(Boolean);
                    openInGmail(emails, 'Official Update from YARA Secretariat', 'Dear YARA Members,\n\n[Write your message here]\n\nBest regards,\nYARA Executive Secretariat\nInnovate Local, Build Global');
                  }}
                  className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition"
                  title="Open Gmail web composer in new tab with all selected member emails"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Email in Gmail ({selectedMemberIds.size})</span>
                </button>
              )}

              {/* Bulk Delete Selected */}
              {selectedMemberIds.size > 0 && (
                <button
                  onClick={handleBulkDeleteSelected}
                  className="px-3.5 py-2 bg-red-600/30 hover:bg-red-600 text-white border border-red-500/50 rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
                  title="Permanently delete all selected member accounts"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Selected ({selectedMemberIds.size})</span>
                </button>
              )}

              {/* Message Members Button */}
              <button
                onClick={() => setMessageModalOpen(true)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Message Members</span>
              </button>

              {/* Add Member Manually */}
              <button
                onClick={() => setAddMemberModalOpen(true)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Add Member</span>
              </button>

              {/* CSV Bulk Import */}
              <input
                type="file"
                ref={fileInputRef}
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition border border-slate-700"
                title="Bulk register members from CSV"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Import CSV</span>
              </button>

              {/* Export CSV */}
              <button
                onClick={handleExportCSV}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition border border-slate-700"
                title="Export filtered or selected rows to CSV"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          {/* Search, Filter & Group-by Toolbar */}
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
                  <option key={c.id} value={c.id}>{c.name}</option>
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

              {/* Status Filter */}
              <select
                value={selectedStatusFilter}
                onChange={(e) => setSelectedStatusFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-hidden"
              >
                <option value="ALL">All Statuses</option>
                <option value="paid">Active (Paid)</option>
                <option value="trial_expired">Trial Expired</option>
                <option value="suspended">Suspended</option>
                <option value="leaders">Leaders Only</option>
              </select>

              {/* Group By Toggle */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl shrink-0">
                <button
                  onClick={() => setGroupBy('flat')}
                  className={cn("px-2.5 py-1 text-xs font-bold rounded-lg transition", groupBy === 'flat' ? "bg-white text-slate-900 shadow-xs" : "text-slate-500")}
                  title="Flat table view"
                >
                  Flat
                </button>
                <button
                  onClick={() => setGroupBy('chapter')}
                  className={cn("px-2.5 py-1 text-xs font-bold rounded-lg transition", groupBy === 'chapter' ? "bg-white text-slate-900 shadow-xs" : "text-slate-500")}
                  title="Group members by chapter"
                >
                  By Chapter
                </button>
                <button
                  onClick={() => setGroupBy('province')}
                  className={cn("px-2.5 py-1 text-xs font-bold rounded-lg transition", groupBy === 'province' ? "bg-white text-slate-900 shadow-xs" : "text-slate-500")}
                  title="Group members by province"
                >
                  By Province
                </button>
              </div>

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
                    <th className="px-4 py-4 w-10 text-center">
                      <button onClick={handleSelectAll} className="p-1 hover:text-indigo-600 transition">
                        {selectedMemberIds.size > 0 && selectedMemberIds.size === filteredUsers.length ? (
                          <CheckSquare className="w-4 h-4 text-indigo-600" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-400" />
                        )}
                      </button>
                    </th>
                    <th className="px-4 py-4">Member Info</th>
                    <th className="px-4 py-4">Member ID</th>
                    <th className="px-6 py-4">Assigned Chapter</th>
                    <th className="px-4 py-4">Position / Role</th>
                    <th className="px-4 py-4">Location &amp; Institution</th>
                    <th className="px-4 py-4">Subscription Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-12 text-center text-slate-400 font-bold">
                        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-600" />
                        <span>Loading member register...</span>
                      </td>
                    </tr>
                  ) : filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-12 text-center text-slate-400 font-medium">
                        No members match your search criteria.
                      </td>
                    </tr>
                  ) : groupBy === 'flat' ? (
                    filteredUsers.map(member => renderMemberRow(member))
                  ) : (
                    groupedData && Object.entries(groupedData).map(([groupTitle, groupMembers]) => (
                      <React.Fragment key={groupTitle}>
                        <tr className="bg-indigo-50/50">
                          <td colSpan={8} className="px-6 py-2.5 font-black text-indigo-950 text-xs flex items-center justify-between">
                            <span className="flex items-center gap-2">
                              <Layers className="w-3.5 h-3.5 text-indigo-600" />
                              <span>{groupTitle}</span>
                            </span>
                            <span className="text-[11px] text-indigo-600 font-bold bg-white px-2 py-0.5 rounded-full border border-indigo-200">
                              {groupMembers.length} Members
                            </span>
                          </td>
                        </tr>
                        {groupMembers.map(member => renderMemberRow(member))}
                      </React.Fragment>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* VIEW 2: PENDING SUBSCRIPTION APPROVALS */}
      {activeSubView === 'pending_subs' && (
        <div className="space-y-4">
          <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-slate-900">
                Pending Member Subscription Approvals ({pendingSubscriptions.length})
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Members who submitted proof of payment or requested access activation. 1-click execution updates their profile and unlocks all LMS courses.
              </p>
            </div>
            <button
              onClick={fetchData}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-bold text-slate-700 flex items-center gap-1.5"
            >
              <RefreshCw className={cn("w-3.5 h-3.5", loading && "animate-spin")} />
              <span>Refresh</span>
            </button>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-[11px] font-black text-slate-500 uppercase tracking-wider">
                    <th className="px-6 py-4">User Email / Name</th>
                    <th className="px-4 py-4">Plan Type</th>
                    <th className="px-4 py-4">Amount / Method</th>
                    <th className="px-4 py-4">Payment Reference</th>
                    <th className="px-4 py-4">Submitted At</th>
                    <th className="px-6 py-4 text-right">Approval Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {pendingSubscriptions.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-slate-400 font-medium">
                        No pending subscription verification requests at this moment.
                      </td>
                    </tr>
                  ) : (
                    pendingSubscriptions.map(sub => (
                      <tr key={sub.id} className="hover:bg-slate-50/60 transition">
                        <td className="px-6 py-4">
                          <span className="font-bold text-slate-900 block">{sub.user_name || sub.user_email}</span>
                          <span className="text-[11px] text-slate-400">{sub.user_email}</span>
                        </td>
                        <td className="px-4 py-4">
                          <span className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 font-bold text-[11px]">
                            {sub.plan_type || 'Annual Membership'}
                          </span>
                        </td>
                        <td className="px-4 py-4 font-bold text-slate-800">
                          {sub.amount ? `$${sub.amount}` : '$15'} ({sub.payment_method || 'EcoCash / Cash'})
                        </td>
                        <td className="px-4 py-4 font-mono font-bold text-indigo-700">
                          {sub.payment_reference || 'Ref Pending'}
                        </td>
                        <td className="px-4 py-4 text-slate-400 text-[11px]">
                          {new Date(sub.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleApproveSubscription(sub.user_id, sub.user_email, sub.id)}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-xs transition inline-flex items-center gap-1.5"
                          >
                            <ShieldCheck className="w-4 h-4" />
                            <span>Approve &amp; Unlock LMS</span>
                          </button>
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

      {/* VIEW 3: TRIAL EXPIRED MEMBERS */}
      {activeSubView === 'expired_trials' && (
        <div className="space-y-4">
          <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-slate-900">
                Members with Expired Free Trial ({expiredTrialUsers.length})
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                These users can still view public website updates, read announcements, and browse the platform, but LMS courses and premium events are locked. You can renew their access below.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-[11px] font-black text-slate-500 uppercase tracking-wider">
                    <th className="px-6 py-4">Member</th>
                    <th className="px-4 py-4">Member ID</th>
                    <th className="px-4 py-4">Chapter</th>
                    <th className="px-4 py-4">Trial Ended Date</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {expiredTrialUsers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-slate-400 font-medium">
                        No members currently have an expired trial.
                      </td>
                    </tr>
                  ) : (
                    expiredTrialUsers.map(member => (
                      <tr key={member.id} className="hover:bg-slate-50/60 transition">
                        <td className="px-6 py-4">
                          <span className="font-bold text-slate-900 block">{member.display_name}</span>
                          <span className="text-[11px] text-slate-400">{member.email}</span>
                          {member.phone && <span className="text-[10px] text-emerald-600 block">{member.phone}</span>}
                        </td>
                        <td className="px-4 py-4 font-mono font-bold text-slate-700">
                          {member.member_id || 'Pending'}
                        </td>
                        <td className="px-4 py-4 text-slate-700 font-medium">
                          {member.chapter_name || 'No Chapter'}
                        </td>
                        <td className="px-4 py-4 text-amber-600 font-bold">
                          {member.trial_ends_at ? new Date(member.trial_ends_at).toLocaleDateString() : 'Expired'}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleApproveSubscription(member.id, member.email)}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-xs transition"
                            >
                              Activate Subscription
                            </button>
                            <button
                              onClick={() => handleOpenWhatsApp(member)}
                              className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl"
                              title="Remind on WhatsApp"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                            </button>
                          </div>
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

      {/* VIEW 4: CHAPTER JOIN REQUESTS INBOX */}
      {activeSubView === 'join_requests' && (
        <div className="space-y-4">
          <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs">
            <h3 className="text-base font-black text-slate-900">
              Incoming Chapter Join Applications ({joinRequests.length})
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Review and approve membership requests from prospective students, researchers, and community innovators.
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-[11px] font-black text-slate-500 uppercase tracking-wider">
                    <th className="px-6 py-4">Applicant</th>
                    <th className="px-4 py-4">Target Chapter</th>
                    <th className="px-4 py-4">Institution</th>
                    <th className="px-4 py-4">Desired Role</th>
                    <th className="px-6 py-4">Motivation</th>
                    <th className="px-4 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Review Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {joinRequests.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-slate-400 font-medium">
                        No pending join applications found.
                      </td>
                    </tr>
                  ) : (
                    joinRequests.map(req => (
                      <tr key={req.id} className="hover:bg-slate-50/60 transition">
                        <td className="px-6 py-4">
                          <span className="font-bold text-slate-900 block">{req.full_name}</span>
                          <span className="text-[11px] text-slate-400 block">{req.email}</span>
                          <span className="text-[10px] text-emerald-600 font-medium flex items-center gap-1 mt-0.5">
                            <Phone className="w-2.5 h-2.5" />
                            <span>{req.phone}</span>
                          </span>
                        </td>
                        <td className="px-4 py-4 font-bold text-slate-800">
                          {req.chapter_name || 'Chapter #' + req.chapter_id}
                          {req.province && <span className="block text-[10px] text-slate-400 font-normal">{req.province}</span>}
                        </td>
                        <td className="px-4 py-4 text-slate-600">
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
                <h3 className="font-black text-slate-900 text-base">Assign Chapter &amp; Leadership Position</h3>
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

              {/* Leadership Governance Scope Switcher */}
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">Leadership Governance Tier</label>
                <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-2xl">
                  <button
                    type="button"
                    onClick={() => {
                      setEditLeadershipTier('national_exec');
                      if (!NATIONAL_EXECUTIVE_ROLES.includes(editPosition)) {
                        setEditPosition(NATIONAL_EXECUTIVE_ROLES[0]);
                      }
                    }}
                    className={cn(
                      "py-2 px-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1 transition-all cursor-pointer",
                      editLeadershipTier === 'national_exec'
                        ? "bg-amber-400 text-slate-950 shadow-xs font-black"
                        : "text-slate-600 hover:text-slate-900"
                    )}
                  >
                    <span>👑</span>
                    <span className="truncate">National Exec</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setEditLeadershipTier('chapter_lead');
                      if (editPosition === 'Member' || NATIONAL_EXECUTIVE_ROLES.includes(editPosition)) {
                        setEditPosition('Chapter Lead / President');
                      }
                    }}
                    className={cn(
                      "py-2 px-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1 transition-all cursor-pointer",
                      editLeadershipTier === 'chapter_lead'
                        ? "bg-white text-indigo-700 shadow-xs font-black"
                        : "text-slate-600 hover:text-slate-900"
                    )}
                  >
                    <span>🏫</span>
                    <span className="truncate">Chapter Lead</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setEditLeadershipTier('member');
                      setEditPosition('Member');
                    }}
                    className={cn(
                      "py-2 px-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1 transition-all cursor-pointer",
                      editLeadershipTier === 'member'
                        ? "bg-white text-slate-800 shadow-xs font-black"
                        : "text-slate-600 hover:text-slate-900"
                    )}
                  >
                    <span>👤</span>
                    <span className="truncate">Member</span>
                  </button>
                </div>
              </div>

              {/* Section if National Executive Tier */}
              {editLeadershipTier === 'national_exec' && (
                <div className="p-3.5 bg-gradient-to-br from-amber-50 to-amber-100/70 border border-amber-300 rounded-2xl space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">👑</span>
                    <div>
                      <span className="font-black text-amber-950 text-xs block">National Executive Council of YARA</span>
                      <span className="text-[10px] text-amber-800">Assign supreme executive directorship and continental governing council roles.</span>
                    </div>
                  </div>

                  <div>
                    <label className="block font-black text-amber-950 mb-1">National Executive Role</label>
                    <select
                      value={NATIONAL_EXECUTIVE_ROLES.includes(editPosition) ? editPosition : 'Custom Title'}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === 'Custom Title') {
                          setEditPosition('Custom Title');
                        } else {
                          setEditPosition(val);
                        }
                      }}
                      className="w-full bg-white border border-amber-300 rounded-xl px-3 py-2 text-slate-900 font-bold focus:outline-amber-500"
                    >
                      {NATIONAL_EXECUTIVE_ROLES.map(role => (
                        <option key={role} value={role}>{role}</option>
                      ))}
                      <option value="Custom Title">Other / Custom Executive Directorship</option>
                    </select>
                  </div>

                  {(editPosition === 'Custom Title' || !NATIONAL_EXECUTIVE_ROLES.includes(editPosition)) && (
                    <div>
                      <label className="block font-bold text-amber-950 mb-1">Enter Custom Executive Title *</label>
                      <input
                        type="text"
                        value={editCustomNationalRole}
                        onChange={(e) => setEditCustomNationalRole(e.target.value)}
                        placeholder="e.g. National Director of Academic Partnerships"
                        className="w-full bg-white border border-amber-300 rounded-xl px-3 py-2 text-slate-900 font-bold"
                      />
                    </div>
                  )}

                  <label className="flex items-center gap-2 cursor-pointer pt-1 bg-white/60 p-2.5 rounded-xl border border-amber-200">
                    <input
                      type="checkbox"
                      checked={editGrantAdminAccess}
                      onChange={(e) => setEditGrantAdminAccess(e.target.checked)}
                      className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4 cursor-pointer"
                    />
                    <span className="text-[11px] font-bold text-amber-950">
                      Grant Administrator Console Access (role: admin)
                    </span>
                  </label>
                </div>
              )}

              {/* Section if Chapter Leadership Tier */}
              {editLeadershipTier === 'chapter_lead' && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Assigned Chapter Leadership Position</label>
                  <select
                    value={editPosition}
                    onChange={(e) => setEditPosition(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-bold"
                  >
                    {CHAPTER_LEADERSHIP_ROLES.filter(r => r !== 'Member').map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Chapter Selection */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {editLeadershipTier === 'national_exec' 
                    ? 'Affiliated Provincial Chapter / Base (Optional)' 
                    : 'Assign to Registered Chapter *'}
                </label>
                <select
                  value={editChapterId}
                  onChange={(e) => setEditChapterId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-bold"
                >
                  <option value="">
                    {editLeadershipTier === 'national_exec' 
                      ? '-- National Executive Secretariat (Zimbabwe & Continental Base) --' 
                      : '-- No Chapter (Independent / Awaiting Placement) --'}
                  </option>
                  {chapters.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.province})
                    </option>
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

      {/* Modal: Multi-Channel Messaging Composer (Email, WhatsApp, In-App, SMS) */}
      {messageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-2xl bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-5 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-black text-slate-900 text-lg flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-indigo-600" />
                  <span>Multi-Channel Member Messaging Console</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Send targeted communications to members, chapters, provincial networks, or leaders.
                </p>
              </div>
              <button 
                onClick={() => { setMessageModalOpen(false); setWhatsappLinksChecklist(null); }}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl"
              >
                ✕
              </button>
            </div>

            {/* If WhatsApp checklist is generated, show checklist view */}
            {whatsappLinksChecklist ? (
              <div className="space-y-4">
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl">
                  <span className="font-bold text-emerald-950 text-xs block">
                    WhatsApp Message Queue ({whatsappLinksChecklist.length} Members)
                  </span>
                  <span className="text-[11px] text-emerald-700">
                    Click each member below to launch their pre-filled WhatsApp conversation in a new tab:
                  </span>
                </div>

                <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-2xl">
                  {whatsappLinksChecklist.map((item, idx) => (
                    <div key={item.id} className="p-3 flex items-center justify-between gap-3 hover:bg-slate-50">
                      <div>
                        <span className="font-bold text-slate-900 text-xs block">{item.name}</span>
                        <span className="text-[10px] text-slate-400">{item.phone}</span>
                      </div>
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => {
                          setWhatsappLinksChecklist(prev => prev ? prev.map((p, i) => i === idx ? { ...p, opened: true } : p) : null);
                        }}
                        className={cn(
                          "px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition",
                          item.opened
                            ? "bg-slate-100 text-slate-600 border border-slate-200"
                            : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs"
                        )}
                      >
                        {item.opened ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <MessageCircle className="w-3.5 h-3.5" />}
                        <span>{item.opened ? 'Opened' : 'Open WhatsApp'}</span>
                      </a>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end pt-3">
                  <button
                    onClick={() => { setWhatsappLinksChecklist(null); setMessageModalOpen(false); }}
                    className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                {/* 1. Channel Selector */}
                <div>
                  <label className="block font-bold text-slate-700 mb-2">1. Choose Communication Channel</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <button
                      type="button"
                      onClick={() => setMessageChannel('email')}
                      className={cn(
                        "p-3 rounded-2xl border text-left transition flex flex-col justify-between",
                        messageChannel === 'email' ? "border-indigo-600 bg-indigo-50/50 text-indigo-950 font-black ring-2 ring-indigo-500/20" : "border-slate-200 bg-slate-50 text-slate-600"
                      )}
                    >
                      <Mail className="w-4 h-4 mb-2 text-indigo-600" />
                      <span className="text-xs">Email</span>
                      <span className="text-[10px] text-slate-400 font-medium">Queued / Edge</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setMessageChannel('whatsapp')}
                      className={cn(
                        "p-3 rounded-2xl border text-left transition flex flex-col justify-between",
                        messageChannel === 'whatsapp' ? "border-emerald-600 bg-emerald-50/50 text-emerald-950 font-black ring-2 ring-emerald-500/20" : "border-slate-200 bg-slate-50 text-slate-600"
                      )}
                    >
                      <MessageCircle className="w-4 h-4 mb-2 text-emerald-600" />
                      <span className="text-xs">WhatsApp</span>
                      <span className="text-[10px] text-slate-400 font-medium">Pre-filled Chat</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setMessageChannel('in_app')}
                      className={cn(
                        "p-3 rounded-2xl border text-left transition flex flex-col justify-between",
                        messageChannel === 'in_app' ? "border-amber-600 bg-amber-50/50 text-amber-950 font-black ring-2 ring-amber-500/20" : "border-slate-200 bg-slate-50 text-slate-600"
                      )}
                    >
                      <Award className="w-4 h-4 mb-2 text-amber-600" />
                      <span className="text-xs">In-App</span>
                      <span className="text-[10px] text-slate-400 font-medium">Notifications</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setMessageChannel('sms')}
                      className={cn(
                        "p-3 rounded-2xl border text-left transition flex flex-col justify-between relative",
                        messageChannel === 'sms' ? "border-slate-400 bg-slate-100 text-slate-900" : "border-slate-200 bg-slate-50 text-slate-400"
                      )}
                    >
                      <Phone className="w-4 h-4 mb-2 text-slate-400" />
                      <span className="text-xs">SMS</span>
                      <span className="text-[9px] font-black uppercase tracking-wider text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded-full mt-1 inline-block">
                        Coming Soon
                      </span>
                    </button>
                  </div>
                </div>

                {/* 2. Target Audience Builder */}
                <div>
                  <label className="block font-bold text-slate-700 mb-2">
                    2. Target Audience ({targetRecipients.length} Recipients)
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      { id: 'all', label: `All Registered (${users.length})` },
                      { id: 'filtered', label: `Current Filter (${filteredUsers.length})` },
                      { id: 'selected', label: `Selected Rows (${selectedMemberIds.size})` },
                      { id: 'chapter', label: 'By Specific Chapter' },
                      { id: 'province', label: 'By Specific Province' },
                      { id: 'leaders', label: 'Chapter Leaders Only' }
                    ].map(aud => (
                      <button
                        key={aud.id}
                        type="button"
                        onClick={() => setMessageAudienceType(aud.id as any)}
                        className={cn(
                          "px-3 py-2 rounded-xl text-left border text-xs font-bold transition",
                          messageAudienceType === aud.id 
                            ? "bg-slate-900 text-white border-slate-900" 
                            : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                        )}
                      >
                        {aud.label}
                      </button>
                    ))}
                  </div>

                  {messageAudienceType === 'chapter' && (
                    <div className="mt-2">
                      <select
                        value={targetChapterId}
                        onChange={(e) => setTargetChapterId(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold"
                      >
                        <option value="">-- Choose Chapter --</option>
                        {chapters.map(c => (
                          <option key={c.id} value={c.id}>{c.name} ({c.province})</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {messageAudienceType === 'province' && (
                    <div className="mt-2">
                      <select
                        value={targetProvince}
                        onChange={(e) => setTargetProvince(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold"
                      >
                        <option value="">-- Choose Province --</option>
                        {uniqueProvinces.map(prov => (
                          <option key={prov} value={prov}>{prov}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {/* 3. Subject (for email / in-app) */}
                {messageChannel !== 'whatsapp' && (
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Subject</label>
                    <input
                      type="text"
                      value={broadcastSubject}
                      onChange={(e) => setBroadcastSubject(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold"
                    />
                  </div>
                )}

                {/* 4. Body with Placeholders */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-bold text-slate-700">Message Body</label>
                    <div className="flex items-center gap-1 text-[11px] text-slate-400">
                      <span>Placeholders:</span>
                      {['{{name}}', '{{chapter}}', '{{position}}', '{{province}}'].map(tag => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => setBroadcastBody(prev => prev + ' ' + tag)}
                          className="px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 rounded text-slate-700 font-mono text-[10px] font-bold"
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                  <textarea
                    rows={6}
                    value={broadcastBody}
                    onChange={(e) => setBroadcastBody(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 font-medium resize-none font-sans"
                  />
                </div>

                {/* Action button */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Info className="w-3.5 h-3.5" />
                    <span>Audience size: {targetRecipients.length} members</span>
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setMessageModalOpen(false)}
                      className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 font-bold text-xs"
                    >
                      Cancel
                    </button>
                    {messageChannel === 'email' && (
                      <button
                        type="button"
                        onClick={() => {
                          const emails = targetRecipients.map(r => r.email).filter(Boolean);
                          openInGmail(emails, broadcastSubject, broadcastBody);
                        }}
                        className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5"
                        title="Open Gmail in a new tab with all recipient emails in BCC"
                      >
                        <Mail className="w-3.5 h-3.5" />
                        <span>Send via Gmail ({targetRecipients.length})</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={handleSendBroadcast}
                      disabled={isSendingMessage}
                      className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition flex items-center gap-2"
                    >
                      {isSendingMessage ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                      <span>Dispatch Broadcast</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}

      {/* Modal: Add Member Manually */}
      {addMemberModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-black text-slate-900 text-base">Add Member Manually</h3>
                <p className="text-xs text-slate-500">Create a new student, innovator, or patron membership.</p>
              </div>
              <button 
                onClick={() => setAddMemberModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddMemberSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Target Chapter *</label>
                <select
                  value={newMemberForm.chapter_id}
                  onChange={(e) => setNewMemberForm({ ...newMemberForm, chapter_id: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold"
                  required
                >
                  <option value="">-- Select Chapter --</option>
                  {chapters.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.province})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  value={newMemberForm.full_name}
                  onChange={(e) => setNewMemberForm({ ...newMemberForm, full_name: e.target.value })}
                  placeholder="e.g. Farai Moyo"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    value={newMemberForm.email}
                    onChange={(e) => setNewMemberForm({ ...newMemberForm, email: e.target.value })}
                    placeholder="name@domain.com"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={newMemberForm.phone}
                    onChange={(e) => setNewMemberForm({ ...newMemberForm, phone: e.target.value })}
                    placeholder="0771 234 567"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Leadership Position</label>
                  <select
                    value={newMemberForm.position_key}
                    onChange={(e) => setNewMemberForm({ ...newMemberForm, position_key: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold"
                  >
                    <optgroup label="👑 National Executive Council">
                      {NATIONAL_EXECUTIVE_ROLES.map(p => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </optgroup>
                    <optgroup label="🏫 Chapter Leadership &amp; Members">
                      {CHAPTER_LEADERSHIP_ROLES.map(p => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </optgroup>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Gender</label>
                  <select
                    value={newMemberForm.gender}
                    onChange={(e) => setNewMemberForm({ ...newMemberForm, gender: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold"
                  >
                    <option value="Prefer not to say">Prefer not to say</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Institution or School</label>
                <input
                  type="text"
                  value={newMemberForm.institution}
                  onChange={(e) => setNewMemberForm({ ...newMemberForm, institution: e.target.value })}
                  placeholder="e.g. University of Zimbabwe / High School"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Admin Notes</label>
                <textarea
                  rows={2}
                  value={newMemberForm.notes}
                  onChange={(e) => setNewMemberForm({ ...newMemberForm, notes: e.target.value })}
                  placeholder="Optional internal notes..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setAddMemberModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAddingMember}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition flex items-center gap-2"
                >
                  {isAddingMember && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>Add Member</span>
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Modal: Email Single Member Native */}
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

            <div className="flex items-center justify-between pt-3 border-t border-slate-100 flex-wrap gap-2">
              <span className="text-[11px] text-slate-400">Choose your preferred email service</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEmailModalMember(null)}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 text-slate-600 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendEmailNative}
                  className="px-3.5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs transition flex items-center gap-1.5"
                  title="Open in system default mail app"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Mail App</span>
                </button>
                <button
                  onClick={handleSendEmailGmail}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5"
                  title="Open directly in Gmail web composer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send via Gmail</span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Modal: Change / Upgrade Member Plan */}
      {planModalMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-black text-slate-900 text-base">Change / Upgrade Member Plan</h3>
                <p className="text-xs text-slate-500">Member: {planModalMember.display_name} ({planModalMember.email})</p>
              </div>
              <button
                onClick={() => setPlanModalMember(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <label className="block font-bold text-slate-700">Select Target Plan:</label>
              {[
                { id: 'pro_annual', label: 'Annual Pro Member ($15 USD / 1 Year)', desc: 'Unlocks all 42+ LMS levels, robotics simulator, and certification.' },
                { id: 'lifetime', label: 'Lifetime Innovator Access (10 Years)', desc: 'Permanent unrestricted access for chapter executives & core contributors.' },
                { id: 'institutional', label: 'Institutional / School Partner Pass', desc: 'Covered under school or donor sponsorship.' },
                { id: 'free_trial', label: 'Reset to Free Trial (14 Days)', desc: 'Grants standard 14-day trial period.' }
              ].map(plan => (
                <label
                  key={plan.id}
                  onClick={() => setSelectedPlanType(plan.id as any)}
                  className={cn(
                    "block p-3.5 rounded-2xl border cursor-pointer transition",
                    selectedPlanType === plan.id
                      ? "border-indigo-600 bg-indigo-50/50"
                      : "border-slate-200 hover:border-slate-300"
                  )}
                >
                  <div className="flex items-center justify-between font-bold text-slate-900">
                    <span>{plan.label}</span>
                    <input
                      type="radio"
                      name="plan_type"
                      checked={selectedPlanType === plan.id}
                      onChange={() => setSelectedPlanType(plan.id as any)}
                      className="text-indigo-600"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">{plan.desc}</p>
                </label>
              ))}
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setPlanModalMember(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleSavePlanChange}
                disabled={isUpdatingPlan}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5"
              >
                {isUpdatingPlan ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                <span>Apply Plan Upgrade</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
