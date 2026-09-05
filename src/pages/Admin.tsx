import React, { useEffect, useState } from 'react';
import { useAuth } from '../components/AuthContext';
import { supabase, safeSignOut } from '../lib/supabase';
import { Users, Search, User, Mail, Hash, Save, Loader2, CheckCircle2, AlertCircle, Send, ShieldOff, ShieldCheck, UserPlus, Trash2, MessageSquare, Star, X as CloseIcon, DollarSign, Video, XCircle, Calendar, Trophy, Plus, Edit2, Link as LinkIcon, MapPin, Clock, ExternalLink, BookOpen, Zap, Brain, CreditCard, Sparkles, Copy, Check, Building2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import CurriculumAdminTab from '../components/admin/CurriculumAdminTab';
import VirtualCompetitionAdminTab from '../components/admin/VirtualCompetitionAdminTab';
import FinanceAdminTab from '../components/admin/FinanceAdminTab';
import BrainstormingAdminTab from '../components/admin/BrainstormingAdminTab';
import CompetitionTeamsAdminTab from '../components/admin/CompetitionTeamsAdminTab';
import YaraCompetitionAdminTab from '../components/admin/YaraCompetitionAdminTab';
import CompetitionsAdminTab from '../components/admin/CompetitionsAdminTab';
import DonationsPartnersAdminTab from '../components/admin/DonationsPartnersAdminTab';
import OrganizationPostsAdminTab from '../components/admin/OrganizationPostsAdminTab';
import ChaptersAdminTab from '../components/admin/ChaptersAdminTab';
import { LmsAdminTab } from '../components/admin/LmsAdminTab';
import { LearningAcademyAdminCenter } from '../components/admin/LearningAcademyAdminCenter';
import EventRegistrationsAdminTab from '../components/admin/EventRegistrationsAdminTab';
import ImpactLedgerAdminTab from '../components/admin/ImpactLedgerAdminTab';
import AdminManagementSection from '../components/admin/AdminManagementSection';
import { SiteContentAdminTab } from '../components/admin/SiteContentAdminTab';
import { Sliders } from 'lucide-react';

interface UserProfile {
  id: string;
  display_name: string;
  email: string;
  member_id: string | null;
  avatar_url?: string;
  role: string;
  registration_paid: boolean;
  subscription_expires_at: string;
  is_halted: boolean;
  created_at: string;
  rating?: number;
  mentored_count?: number;
  total_commission?: number;
}

interface MentorshipRequest {
  id: string;
  requester_id: string;
  requester_name: string;
  mentor_id: string;
  mentor_name?: string;
  status: string;
  message: string;
  created_at: string;
}

interface MentorReview {
  id: string;
  mentor_id: string;
  mentor_name?: string;
  student_id: string;
  student_name?: string;
  rating: number;
  comment: string;
  created_at: string;
}

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  image_url: string;
  registration_link: string;
  is_upcoming: boolean;
  category: string;
  created_at: string;
}

interface Competition {
  id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  registration_link: string;
  image_url: string;
  status: string;
  created_at: string;
}

export default function Admin() {
  const { profile, user: authUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'site_content' | 'learning_academy' | 'event_registrations' | 'impact_ledger' | 'admin_management' | 'chapters' | 'members' | 'lms_evaluations' | 'curriculum' | 'virtual_comp' | 'brainstorming' | 'finance' | 'donations_partners' | 'org_posts' | 'yara_competition' | 'competition_teams' | 'events' | 'competitions' | 'mentorship' | 'reviews' | 'live' | 'mentor_req' | 'settings'>('site_content');
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [mentorshipRequests, setMentorshipRequests] = useState<MentorshipRequest[]>([]);
  const [mentorReviews, setMentorReviews] = useState<MentorReview[]>([]);
  const [pendingLiveSessions, setPendingLiveSessions] = useState<any[]>([]);
  const [autoMentorRequests, setAutoMentorRequests] = useState<any[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [editingCompId, setEditingCompId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showCompModal, setShowCompModal] = useState(false);
  
  // Settings State
  const [courseFee, setCourseFee] = useState({ amount: 15, currency: 'USD', message: 'To continue after your trial, the platform subscription and Virtual Training sessions cost USD$15.' });
  const [launchConfig, setLaunchConfig] = useState({
    duration_hours: 72,
    launch_date: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString().slice(0, 16),
    title: 'Official YARIA Global Launch',
    is_enabled: true,
    banner_text: 'Countdown to the Official YARIA Platform Launch — 72 Hours of Innovation & Robotics'
  });
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // Form States
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('innovator');
  const [newMemberId, setNewMemberId] = useState('');

  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    date: '',
    location: '',
    image_url: '',
    registration_link: '',
    is_upcoming: true,
    category: 'other'
  });

  const [compForm, setCompForm] = useState({
    title: '',
    description: '',
    start_date: '',
    end_date: '',
    registration_link: '',
    image_url: '',
    status: 'upcoming'
  });

  useEffect(() => {
    if (activeTab === 'members') fetchUsers();
    if (activeTab === 'mentorship') fetchMentorshipRequests();
    if (activeTab === 'reviews') fetchMentorReviews();
    if (activeTab === 'live') fetchPendingLiveSessions();
    if (activeTab === 'mentor_req') fetchAutoMentorRequests();
    if (activeTab === 'events') fetchEvents();
    if (activeTab === 'competitions') fetchCompetitions();
    if (activeTab === 'settings') fetchSettings();
  }, [activeTab]);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const { data: feeData } = await supabase
        .from('system_settings')
        .select('value')
        .eq('key', 'course_fee')
        .single();
      
      if (feeData?.value) {
        setCourseFee(feeData.value);
      }

      const { data: launchData } = await supabase
        .from('system_settings')
        .select('value')
        .eq('key', 'launch_time')
        .single();
      
      if (launchData?.value) {
        const val = launchData.value;
        setLaunchConfig({
          duration_hours: val.duration_hours || 72,
          launch_date: val.launch_date ? new Date(val.launch_date).toISOString().slice(0, 16) : new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString().slice(0, 16),
          title: val.title || 'Official YARIA Global Launch',
          is_enabled: val.is_enabled !== false,
          banner_text: val.banner_text || 'Countdown to the Official YARIA Platform Launch — 72 Hours of Innovation & Robotics'
        });
      }
    } catch (error: any) {
      console.error('Error fetching settings:', error);
      setErrorMessage('Failed to load settings.');
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setIsSavingSettings(true);
    try {
      const { error: feeError } = await supabase
        .from('system_settings')
        .upsert({
          key: 'course_fee',
          value: courseFee,
          updated_at: new Date().toISOString()
        });

      if (feeError) throw feeError;

      const { error: launchError } = await supabase
        .from('system_settings')
        .upsert({
          key: 'launch_time',
          value: {
            ...launchConfig,
            launch_date: new Date(launchConfig.launch_date).toISOString()
          },
          updated_at: new Date().toISOString()
        });

      if (launchError) throw launchError;

      setSuccessMessage('All settings and launch timer updated successfully.');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error: any) {
      setErrorMessage(error.message);
    } finally {
      setIsSavingSettings(false);
    }
  };

  const reset72HoursLaunch = async () => {
    const newTarget = new Date(Date.now() + 72 * 60 * 60 * 1000);
    const updated = {
      ...launchConfig,
      duration_hours: 72,
      launch_date: newTarget.toISOString().slice(0, 16),
      is_enabled: true
    };
    setLaunchConfig(updated);
    
    try {
      await supabase
        .from('system_settings')
        .upsert({
          key: 'launch_time',
          value: {
            ...updated,
            launch_date: newTarget.toISOString()
          },
          updated_at: new Date().toISOString()
        });
      setSuccessMessage('Launch countdown has been officially reset to 72 hours!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (e: any) {
      setErrorMessage('Could not reset timer: ' + e.message);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('id, display_name, email, member_id, role, registration_paid, subscription_expires_at, is_halted, created_at, rating, mentored_count, total_commission')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching users:', error);
      setErrorMessage('Failed to load users.');
    } else {
      setUsers(data || []);
    }
    setLoading(false);
  };

  const fetchMentorshipRequests = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('mentorship_requests')
      .select(`
        *,
        mentor:profiles!mentor_id(display_name)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching requests:', error);
      setErrorMessage('Failed to load mentorship requests.');
    } else {
      const formatted = data?.map((r: any) => ({
        ...r,
        mentor_name: r.mentor?.display_name || 'Unknown Mentor'
      }));
      setMentorshipRequests(formatted || []);
    }
    setLoading(false);
  };

  const fetchAutoMentorRequests = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('live_session_mentor_requests')
      .select('*, session:live_sessions(*, mentor:profiles!mentor_id(display_name))')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching auto mentor requests:', error);
      setErrorMessage('Failed to load mentor requests.');
    } else {
      setAutoMentorRequests(data || []);
    }
    setLoading(false);
  };

  const resolveMentorRequest = async (requestId: string) => {
    setUpdatingId(requestId);
    try {
      const { error } = await supabase
        .from('live_session_mentor_requests')
        .update({ status: 'resolved' })
        .eq('id', requestId);

      if (error) throw error;

      setAutoMentorRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: 'resolved' } : r));
      setSuccessMessage('Request marked as resolved.');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error: any) {
      setErrorMessage(error.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const fetchPendingLiveSessions = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('live_sessions')
      .select('*, mentor:profiles!mentor_id(display_name)')
      .eq('is_approved', false)
      .eq('is_live', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching live sessions:', error);
      setErrorMessage('Failed to load live sessions.');
    } else {
      setPendingLiveSessions(data || []);
    }
    setLoading(false);
  };

  const approveLiveSession = async (sessionId: string) => {
    setUpdatingId(sessionId);
    try {
      const { error } = await supabase
        .from('live_sessions')
        .update({ is_approved: true })
        .eq('id', sessionId);

      if (error) throw error;

      setPendingLiveSessions(prev => prev.filter(s => s.id !== sessionId));
      setSuccessMessage('Live session approved.');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error: any) {
      setErrorMessage(error.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const rejectLiveSession = async (sessionId: string) => {
    if (!window.confirm('Are you sure you want to reject and delete this live session?')) return;
    setUpdatingId(sessionId);
    try {
      const { error } = await supabase
        .from('live_sessions')
        .delete()
        .eq('id', sessionId);

      if (error) throw error;

      setPendingLiveSessions(prev => prev.filter(s => s.id !== sessionId));
      setSuccessMessage('Live session rejected.');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error: any) {
      setErrorMessage(error.message);
    } finally {
      setUpdatingId(null);
    }
  };
  const fetchEvents = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('date', { ascending: false });

    if (error) {
      console.error('Error fetching events:', error);
      setErrorMessage('Failed to load events.');
    } else {
      setEvents(data || []);
    }
    setLoading(false);
  };

  const fetchCompetitions = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('competitions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching competitions:', error);
      setErrorMessage('Failed to load competitions.');
    } else {
      setCompetitions(data || []);
    }
    setLoading(false);
  };

  const openCreateEventModal = () => {
    setEditingEventId(null);
    setEventForm({
      title: '',
      description: '',
      date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
      location: '',
      image_url: '',
      registration_link: '',
      is_upcoming: true,
      category: 'other'
    });
    setShowEventModal(true);
  };

  const openEditEventModal = (event: Event) => {
    setEditingEventId(event.id);
    setEventForm({
      title: event.title || '',
      description: event.description || '',
      date: event.date ? new Date(event.date).toISOString().slice(0, 16) : '',
      location: event.location || '',
      image_url: event.image_url || '',
      registration_link: event.registration_link || '',
      is_upcoming: event.is_upcoming !== false,
      category: event.category || 'other'
    });
    setShowEventModal(true);
  };

  const openCreateCompModal = () => {
    setEditingCompId(null);
    setCompForm({
      title: '',
      description: '',
      start_date: new Date().toISOString().split('T')[0],
      end_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      registration_link: '',
      image_url: '',
      status: 'upcoming'
    });
    setShowCompModal(true);
  };

  const openEditCompModal = (comp: Competition) => {
    setEditingCompId(comp.id);
    setCompForm({
      title: comp.title || '',
      description: comp.description || '',
      start_date: comp.start_date ? new Date(comp.start_date).toISOString().split('T')[0] : '',
      end_date: comp.end_date ? new Date(comp.end_date).toISOString().split('T')[0] : '',
      registration_link: comp.registration_link || '',
      image_url: comp.image_url || '',
      status: comp.status || 'upcoming'
    });
    setShowCompModal(true);
  };

  const saveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingEventId) {
        const { error } = await supabase
          .from('events')
          .update({
            ...eventForm,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingEventId);

        if (error) throw error;
        setSuccessMessage('Event updated successfully.');
      } else {
        const { error } = await supabase
          .from('events')
          .insert(eventForm);

        if (error) throw error;
        setSuccessMessage('Event created successfully.');
      }

      setShowEventModal(false);
      setEditingEventId(null);
      fetchEvents();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error: any) {
      setErrorMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const saveCompetition = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingCompId) {
        const { error } = await supabase
          .from('competitions')
          .update({
            ...compForm,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingCompId);

        if (error) throw error;
        setSuccessMessage('Competition updated successfully.');
      } else {
        const { error } = await supabase
          .from('competitions')
          .insert(compForm);

        if (error) throw error;
        setSuccessMessage('Competition created successfully.');
      }

      setShowCompModal(false);
      setEditingCompId(null);
      fetchCompetitions();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error: any) {
      setErrorMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteEvent = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    try {
      const { error } = await supabase.from('events').delete().eq('id', id);
      if (error) throw error;
      setEvents(prev => prev.filter(e => e.id !== id));
      setSuccessMessage('Event deleted.');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error: any) {
      setErrorMessage(error.message);
    }
  };

  const deleteCompetition = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this competition?')) return;
    try {
      const { error } = await supabase.from('competitions').delete().eq('id', id);
      if (error) throw error;
      setCompetitions(prev => prev.filter(c => c.id !== id));
      setSuccessMessage('Competition deleted.');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error: any) {
      setErrorMessage(error.message);
    }
  };

  const fetchMentorReviews = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('mentor_reviews')
      .select(`
        *,
        mentor:profiles!mentor_id(display_name),
        student:profiles!student_id(display_name)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching reviews:', error);
      setErrorMessage('Failed to load reviews.');
    } else {
      const formatted = data?.map((r: any) => ({
        ...r,
        mentor_name: r.mentor?.display_name || 'Unknown Mentor',
        student_name: r.student?.display_name || 'Unknown Student'
      }));
      setMentorReviews(formatted || []);
    }
    setLoading(false);
  };

  const addPreApprovedMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberEmail.trim()) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('pre_approvals')
        .insert({
          email: newMemberEmail.toLowerCase().trim(),
          role: newMemberRole,
          member_id: newMemberId.trim() || null
        });

      if (error) throw error;

      setSuccessMessage(`User ${newMemberEmail} pre-approved. They will be automatically activated when they sign up.`);
      setShowAddModal(false);
      setNewMemberEmail('');
      setNewMemberId('');
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (error: any) {
      setErrorMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleHalt = async (userId: string, currentHalt: boolean) => {
    setUpdatingId(userId);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_halted: !currentHalt })
        .eq('id', userId);

      if (error) throw error;

      setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_halted: !currentHalt } : u));
      setSuccessMessage(`User ${!currentHalt ? 'halted' : 'unhalted'} successfully.`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error: any) {
      setErrorMessage(error.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const updateSubscription = async (userId: string, newExpiry: string) => {
    setUpdatingId(userId);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ subscription_expires_at: newExpiry })
        .eq('id', userId);

      if (error) throw error;

      setUsers(prev => prev.map(u => u.id === userId ? { ...u, subscription_expires_at: newExpiry } : u));
      setSuccessMessage(`Subscription expiry updated.`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error: any) {
      setErrorMessage(error.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const updateMemberId = async (userId: string, currentEmail: string, currentName: string, newMemberId: string) => {
    if (!newMemberId.trim()) return;
    
    setUpdatingId(userId);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          member_id: newMemberId,
          registration_paid: true, // Automatically mark as paid when ID is assigned
        })
        .eq('id', userId);

      if (error) throw error;

      setSuccessMessage(`Member ID assigned and account activated for ${currentName}. Please manually send the ID (${newMemberId}) to ${currentEmail}.`);
      
      // Update local state
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, member_id: newMemberId, registration_paid: true } : u));
      
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (error: any) {
      console.error('Error updating member ID:', error);
      setErrorMessage(error.message || 'Failed to update Member ID.');
    } finally {
      setUpdatingId(null);
    }
  };

  const updateUserRole = async (userId: string, newRole: string) => {
    setUpdatingId(userId);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);

      if (error) throw error;

      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
      setSuccessMessage(`User role updated to ${newRole}.`);
      
      // If a user was promoted to mentor, they are now "approved"
      if (newRole === 'mentor') {
        setSuccessMessage(`User has been approved as a Mentor.`);
      }
      
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error: any) {
      setErrorMessage(error.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const revokeAccess = async (userId: string, currentName: string) => {
    if (!window.confirm(`Are you sure you want to revoke access for ${currentName}? This will clear their Member ID and deactivate their account.`)) return;
    
    setUpdatingId(userId);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          member_id: null,
          registration_paid: false,
        })
        .eq('id', userId);

      if (error) throw error;

      setUsers(prev => prev.map(u => u.id === userId ? { ...u, member_id: '', registration_paid: false } : u));
      setSuccessMessage(`Access revoked for ${currentName}.`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error: any) {
      setErrorMessage(error.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const wipeAllData = async () => {
    if (!window.confirm("CRITICAL WARNING: This will delete ALL ideas, projects, mentorship requests, reviews, and user profiles. This action is irreversible. You will be logged out. Are you absolutely sure?")) return;
    
    const secondConfirm = window.confirm("FINAL CONFIRMATION: Are you REALLY sure you want to wipe the entire database?");
    if (!secondConfirm) return;

    setLoading(true);
    setErrorMessage(null);
    try {
      // 1. Clear Storage Buckets
      const buckets = ['avatars', 'materials', 'resources', 'event-banners', 'project-images'];
      for (const bucket of buckets) {
        try {
          const { data: files } = await supabase.storage.from(bucket).list();
          if (files && files.length > 0) {
            await supabase.storage.from(bucket).remove(files.map(f => f.name));
          }
        } catch (storageErr) {
          console.error(`Error clearing storage bucket ${bucket}:`, storageErr);
        }
      }

      // 2. Clear Database Tables
      // Profiles first (cascades to others due to ON DELETE CASCADE)
      // CRITICAL: Exclude current admin to prevent session crash
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .neq('id', authUser?.id || '00000000-0000-0000-0000-000000000000');

      if (profileError) throw profileError;

      // Pre-approvals
      await supabase
        .from('pre_approvals')
        .delete()
        .neq('email', 'dummy@example.com');

      setSuccessMessage("Database wiped successfully. Logging out...");
      
      setTimeout(async () => {
        await safeSignOut();
        window.location.href = '/auth';
      }, 2000);

    } catch (error: any) {
      console.error('Wipe error:', error);
      setErrorMessage(error.message || "Failed to wipe data. Check if RLS policies are deployed.");
    } finally {
      setLoading(false);
    }
  };

  const deletePastData = async () => {
    if (!window.confirm("Are you sure you want to remove all expired events and competitions?")) return;
    
    setLoading(true);
    setErrorMessage(null);
    try {
      const now = new Date().toISOString();

      // 1. Delete past events
      const { error: eventError } = await supabase
        .from('events')
        .delete()
        .lt('date', now);

      if (eventError) throw eventError;

      // 2. Delete past competitions
      const { error: compError } = await supabase
        .from('competitions')
        .delete()
        .lt('end_date', now);

      if (compError) throw compError;

      setSuccessMessage("Expired events and competitions removed successfully.");
      fetchEvents();
      fetchCompetitions();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error: any) {
      console.error('Cleanup error:', error);
      setErrorMessage(error.message || "Failed to remove expired data.");
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(u => 
    u.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.member_id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isAdmin = profile?.role === 'admin';

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
        <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center text-red-600 mb-6">
          <AlertCircle className="w-10 h-10" />
        </div>
        <h2 className="text-3xl font-bold text-slate-900 mb-4">Access Denied</h2>
        <p className="text-slate-500 max-w-md">
          This section is reserved for YARIA Administrators only.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Admin Dashboard</h2>
          <p className="text-slate-500 font-medium">Manage YARIA members and assign identification numbers.</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={deletePastData}
            disabled={loading}
            className="flex items-center space-x-2 bg-amber-50 text-amber-600 px-6 py-3 rounded-2xl font-bold text-sm hover:bg-amber-100 transition-all border border-amber-100"
            title="Remove expired events and competitions"
          >
            <Clock className="w-4 h-4" />
            <span>Clean Expired</span>
          </button>
          <button
            onClick={wipeAllData}
            disabled={loading}
            className="flex items-center space-x-2 bg-red-50 text-red-600 px-6 py-3 rounded-2xl font-bold text-sm hover:bg-red-100 transition-all border border-red-100"
            title="Wipe all user data"
          >
            <Trash2 className="w-4 h-4" />
            <span>Wipe All Data</span>
          </button>
          <button
            onClick={() => {
              if (activeTab === 'events') openCreateEventModal();
              else if (activeTab === 'competitions') openCreateCompModal();
              else setShowAddModal(true);
            }}
            className="flex items-center space-x-2 bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>
              {activeTab === 'events' ? 'Add Event' : 
               activeTab === 'competitions' ? 'Add Competition' : 
               'Add Member'}
            </span>
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl w-fit max-w-full">
        <button
          onClick={() => setActiveTab('site_content')}
          className={cn(
            "px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-sm",
            activeTab === 'site_content' 
              ? "bg-violet-600 text-white shadow-violet-200" 
              : "bg-white/90 text-violet-800 hover:bg-white hover:text-violet-950 border border-violet-200"
          )}
        >
          <div className="flex items-center space-x-2">
            <Sliders className="w-4 h-4" />
            <span className="font-extrabold">Site Content & Dynamic CMS</span>
            <span className="px-2 py-0.5 rounded-full bg-violet-500/20 text-[10px] uppercase font-black tracking-wider">
              Universal Sections
            </span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('learning_academy')}
          className={cn(
            "px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-sm",
            activeTab === 'learning_academy' 
              ? "bg-indigo-600 text-white shadow-indigo-200" 
              : "bg-white/80 text-indigo-700 hover:bg-white hover:text-indigo-900 border border-indigo-100"
          )}
        >
          <div className="flex items-center space-x-2">
            <BookOpen className="w-4 h-4 text-indigo-300" />
            <span className="font-extrabold">Learning Academy & LMS</span>
            <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-[10px] uppercase font-black tracking-wider">
              16 Courses + Videos
            </span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('event_registrations')}
          className={cn(
            "px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-sm",
            activeTab === 'event_registrations' 
              ? "bg-amber-500 text-slate-950 font-black shadow-amber-200" 
              : "bg-white/90 text-amber-900 hover:bg-white hover:text-amber-950 border border-amber-200"
          )}
        >
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-amber-600" />
            <span className="font-extrabold">Event Registrations & Approvals</span>
            <span className="px-2 py-0.5 rounded-full bg-amber-200 text-amber-950 text-[10px] font-black uppercase tracking-wider">
              AI Bootcamp ($10)
            </span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('impact_ledger')}
          className={cn(
            "px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-sm",
            activeTab === 'impact_ledger' 
              ? "bg-emerald-600 text-white font-black shadow-emerald-200" 
              : "bg-white/90 text-emerald-900 hover:bg-white hover:text-emerald-950 border border-emerald-200"
          )}
        >
          <div className="flex items-center space-x-2">
            <DollarSign className="w-4 h-4 text-emerald-500" />
            <span className="font-extrabold">M&E Impact & Audit Ledger</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 text-[10px] font-black uppercase tracking-wider">
              Audited CSV
            </span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('admin_management')}
          className={cn(
            "px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-sm",
            activeTab === 'admin_management' 
              ? "bg-slate-900 text-white font-black shadow-slate-300" 
              : "bg-white/90 text-slate-800 hover:bg-white hover:text-slate-950 border border-slate-200"
          )}
        >
          <div className="flex items-center space-x-2">
            <UserPlus className="w-4 h-4 text-indigo-500" />
            <span className="font-extrabold">Admins & Permissions</span>
            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 text-[10px] font-black uppercase tracking-wider">
              Council
            </span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('chapters')}
          className={cn(
            "px-5 py-2.5 rounded-xl font-bold text-sm transition-all",
            activeTab === 'chapters' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
          )}
        >
          <div className="flex items-center space-x-2">
            <Building2 className="w-4 h-4 text-indigo-600" />
            <span>YARA Chapters & Secretaries</span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('competitions')}
          className={cn(
            "px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-sm",
            (activeTab === 'competitions' || activeTab === 'yara_competition')
              ? "bg-amber-500 text-slate-950 font-black shadow-amber-200" 
              : "text-slate-600 hover:text-slate-900 bg-white/70"
          )}
        >
          <div className="flex items-center space-x-2">
            <Trophy className="w-4 h-4 text-slate-950" />
            <span>Competitions & YARA 2026 Hub</span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('lms_evaluations')}
          className={cn(
            "px-5 py-2.5 rounded-xl font-bold text-sm transition-all",
            activeTab === 'lms_evaluations' ? "bg-white text-emerald-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
          )}
        >
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-emerald-500" />
            <span>LMS Capstones & Grading</span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('members')}
          className={cn(
            "px-5 py-2.5 rounded-xl font-bold text-sm transition-all",
            activeTab === 'members' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
          )}
        >
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4" />
            <span>Members</span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('curriculum')}
          className={cn(
            "px-5 py-2.5 rounded-xl font-bold text-sm transition-all",
            activeTab === 'curriculum' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
          )}
        >
          <div className="flex items-center space-x-2">
            <BookOpen className="w-4 h-4" />
            <span>Curriculum & LMS</span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('virtual_comp')}
          className={cn(
            "px-5 py-2.5 rounded-xl font-bold text-sm transition-all",
            activeTab === 'virtual_comp' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
          )}
        >
          <div className="flex items-center space-x-2">
            <Zap className="w-4 h-4" />
            <span>Virtual Arena</span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('brainstorming')}
          className={cn(
            "px-5 py-2.5 rounded-xl font-bold text-sm transition-all",
            activeTab === 'brainstorming' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
          )}
        >
          <div className="flex items-center space-x-2">
            <Brain className="w-4 h-4 text-amber-500" />
            <span>Critical Thinking Quizzes</span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('finance')}
          className={cn(
            "px-5 py-2.5 rounded-xl font-bold text-sm transition-all",
            activeTab === 'finance' ? "bg-white text-emerald-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
          )}
        >
          <div className="flex items-center space-x-2">
            <DollarSign className="w-4 h-4 text-emerald-600" />
            <span>Finance & Mentor Payouts</span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('donations_partners')}
          className={cn(
            "px-5 py-2.5 rounded-xl font-bold text-sm transition-all",
            activeTab === 'donations_partners' ? "bg-white text-rose-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
          )}
        >
          <div className="flex items-center space-x-2">
            <CreditCard className="w-4 h-4 text-rose-500" />
            <span>Donations, Sponsors & Fees</span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('org_posts')}
          className={cn(
            "px-5 py-2.5 rounded-xl font-bold text-sm transition-all",
            activeTab === 'org_posts' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
          )}
        >
          <div className="flex items-center space-x-2">
            <Send className="w-4 h-4 text-indigo-600" />
            <span>Posts & Social Syndication</span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('events')}
          className={cn(
            "px-5 py-2.5 rounded-xl font-bold text-sm transition-all",
            activeTab === 'events' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
          )}
        >
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4" />
            <span>Events</span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('competition_teams')}
          className={cn(
            "px-5 py-2.5 rounded-xl font-bold text-sm transition-all",
            activeTab === 'competition_teams' ? "bg-white text-emerald-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
          )}
        >
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4 text-emerald-600" />
            <span>Teams & Rosters (2B+2G)</span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('mentorship')}
          className={cn(
            "px-5 py-2.5 rounded-xl font-bold text-sm transition-all",
            activeTab === 'mentorship' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
          )}
        >
          <div className="flex items-center space-x-2">
            <MessageSquare className="w-4 h-4" />
            <span>Mentorship</span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('reviews')}
          className={cn(
            "px-5 py-2.5 rounded-xl font-bold text-sm transition-all",
            activeTab === 'reviews' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
          )}
        >
          <div className="flex items-center space-x-2">
            <Star className="w-4 h-4" />
            <span>Reviews</span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('live')}
          className={cn(
            "px-5 py-2.5 rounded-xl font-bold text-sm transition-all",
            activeTab === 'live' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
          )}
        >
          <div className="flex items-center space-x-2">
            <Video className="w-4 h-4" />
            <span>Live Approvals</span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('mentor_req')}
          className={cn(
            "px-5 py-2.5 rounded-xl font-bold text-sm transition-all",
            activeTab === 'mentor_req' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
          )}
        >
          <div className="flex items-center space-x-2">
            <UserPlus className="w-4 h-4" />
            <span>Mentor Requests</span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={cn(
            "px-5 py-2.5 rounded-xl font-bold text-sm transition-all",
            activeTab === 'settings' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
          )}
        >
          <div className="flex items-center space-x-2">
            <Save className="w-4 h-4" />
            <span>Settings</span>
          </div>
        </button>
      </div>

      <AnimatePresence>
        {showEventModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[2.5rem] p-10 max-w-2xl w-full shadow-2xl relative my-8"
            >
              <button 
                onClick={() => {
                  setShowEventModal(false);
                  setEditingEventId(null);
                }}
                className="absolute top-6 right-6 p-2 text-slate-400 hover:bg-slate-50 rounded-xl transition-colors"
              >
                <CloseIcon className="w-6 h-6" />
              </button>

              <h3 className="text-2xl font-bold text-slate-900 mb-2">
                {editingEventId ? 'Edit Event Details' : 'Create New Event'}
              </h3>
              <p className="text-slate-500 text-sm mb-8">
                {editingEventId ? 'Update event information and registration link.' : 'Add an upcoming event or outreach program.'}
              </p>

              <form onSubmit={saveEvent} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Event Title</label>
                    <input
                      type="text"
                      required
                      value={eventForm.title}
                      onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-4 focus:outline-none focus:border-indigo-600 transition-all font-medium"
                      placeholder="e.g. Robotics Workshop"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Category</label>
                    <select
                      value={eventForm.category}
                      onChange={(e) => setEventForm({ ...eventForm, category: e.target.value })}
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-4 focus:outline-none focus:border-indigo-600 transition-all font-medium"
                    >
                      <option value="competition">Competition</option>
                      <option value="workshop">Workshop</option>
                      <option value="outreach">Outreach</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Description</label>
                  <textarea
                    required
                    value={eventForm.description}
                    onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-4 focus:outline-none focus:border-indigo-600 transition-all font-medium min-h-[100px]"
                    placeholder="Tell us about the event..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Date & Time</label>
                    <input
                      type="datetime-local"
                      required
                      value={eventForm.date}
                      onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-4 focus:outline-none focus:border-indigo-600 transition-all font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Location</label>
                    <input
                      type="text"
                      required
                      value={eventForm.location}
                      onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-4 focus:outline-none focus:border-indigo-600 transition-all font-medium"
                      placeholder="e.g. Harare, Zimbabwe"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Image URL</label>
                    <input
                      type="url"
                      value={eventForm.image_url}
                      onChange={(e) => setEventForm({ ...eventForm, image_url: e.target.value })}
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-4 focus:outline-none focus:border-indigo-600 transition-all font-medium"
                      placeholder="https://..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Registration Link</label>
                    <input
                      type="url"
                      value={eventForm.registration_link}
                      onChange={(e) => setEventForm({ ...eventForm, registration_link: e.target.value })}
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-4 focus:outline-none focus:border-indigo-600 transition-all font-medium"
                      placeholder="Google Form or Website link"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <input
                    type="checkbox"
                    id="is_upcoming_event"
                    checked={eventForm.is_upcoming}
                    onChange={(e) => setEventForm({ ...eventForm, is_upcoming: e.target.checked })}
                    className="w-5 h-5 text-indigo-600 rounded-lg focus:ring-indigo-500 border-slate-300"
                  />
                  <label htmlFor="is_upcoming_event" className="text-sm font-bold text-slate-700 cursor-pointer">
                    Show in Upcoming Events section
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-indigo-600 text-white font-bold py-4 rounded-2xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center space-x-2"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>{editingEventId ? 'Save Event Changes' : 'Create Event'}</span>}
                </button>
              </form>
            </motion.div>
          </div>
        )}

        {showCompModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[2.5rem] p-10 max-w-2xl w-full shadow-2xl relative my-8"
            >
              <button 
                onClick={() => {
                  setShowCompModal(false);
                  setEditingCompId(null);
                }}
                className="absolute top-6 right-6 p-2 text-slate-400 hover:bg-slate-50 rounded-xl transition-colors"
              >
                <CloseIcon className="w-6 h-6" />
              </button>

              <h3 className="text-2xl font-bold text-slate-900 mb-2">
                {editingCompId ? 'Edit Competition Details' : 'Create New Competition'}
              </h3>
              <p className="text-slate-500 text-sm mb-8">
                {editingCompId ? 'Update dates, registration status, and guidelines.' : 'Add a new competition with registration links.'}
              </p>

              <form onSubmit={saveCompetition} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Competition Title</label>
                  <input
                    type="text"
                    required
                    value={compForm.title}
                    onChange={(e) => setCompForm({ ...compForm, title: e.target.value })}
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-4 focus:outline-none focus:border-indigo-600 transition-all font-medium"
                    placeholder="e.g. Micromouse 2026"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Description</label>
                  <textarea
                    required
                    value={compForm.description}
                    onChange={(e) => setCompForm({ ...compForm, description: e.target.value })}
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-4 focus:outline-none focus:border-indigo-600 transition-all font-medium min-h-[100px]"
                    placeholder="Details about the competition..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Start Date</label>
                    <input
                      type="date"
                      required
                      value={compForm.start_date}
                      onChange={(e) => setCompForm({ ...compForm, start_date: e.target.value })}
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-4 focus:outline-none focus:border-indigo-600 transition-all font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">End Date</label>
                    <input
                      type="date"
                      required
                      value={compForm.end_date}
                      onChange={(e) => setCompForm({ ...compForm, end_date: e.target.value })}
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-4 focus:outline-none focus:border-indigo-600 transition-all font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Status</label>
                    <select
                      value={compForm.status}
                      onChange={(e) => setCompForm({ ...compForm, status: e.target.value })}
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-4 focus:outline-none focus:border-indigo-600 transition-all font-medium"
                    >
                      <option value="upcoming">Upcoming</option>
                      <option value="active">Active (Ongoing)</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Image URL</label>
                    <input
                      type="url"
                      value={compForm.image_url}
                      onChange={(e) => setCompForm({ ...compForm, image_url: e.target.value })}
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-4 focus:outline-none focus:border-indigo-600 transition-all font-medium"
                      placeholder="https://..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Registration Link</label>
                    <input
                      type="url"
                      value={compForm.registration_link}
                      onChange={(e) => setCompForm({ ...compForm, registration_link: e.target.value })}
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-4 focus:outline-none focus:border-indigo-600 transition-all font-medium"
                      placeholder="Google Form link"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-indigo-600 text-white font-bold py-4 rounded-2xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center space-x-2"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>{editingCompId ? 'Save Competition Changes' : 'Create Competition'}</span>}
                </button>
              </form>
            </motion.div>
          </div>
        )}

        {showAddModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[2.5rem] p-10 max-w-md w-full shadow-2xl relative"
            >
              <button 
                onClick={() => setShowAddModal(false)}
                className="absolute top-6 right-6 p-2 text-slate-400 hover:bg-slate-50 rounded-xl transition-colors"
              >
                <CloseIcon className="w-6 h-6" />
              </button>

              <h3 className="text-2xl font-bold text-slate-900 mb-2">Add New Member</h3>
              <p className="text-slate-500 text-sm mb-8">Pre-approve a member by email. They will be automatically activated when they sign up.</p>

              <form onSubmit={addPreApprovedMember} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
                  <input
                    type="email"
                    required
                    value={newMemberEmail}
                    onChange={(e) => setNewMemberEmail(e.target.value)}
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-4 focus:outline-none focus:border-indigo-600 transition-all font-medium"
                    placeholder="member@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Role</label>
                  <select
                    value={newMemberRole}
                    onChange={(e) => setNewMemberRole(e.target.value)}
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-4 focus:outline-none focus:border-indigo-600 transition-all font-medium"
                  >
                    <option value="innovator">Innovator</option>
                    <option value="mentor">Mentor</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Member ID (Optional)</label>
                  <input
                    type="text"
                    value={newMemberId}
                    onChange={(e) => setNewMemberId(e.target.value)}
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-4 focus:outline-none focus:border-indigo-600 transition-all font-mono"
                    placeholder="YARIA-2026-XXXX"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-indigo-600 text-white font-bold py-4 rounded-2xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center space-x-2"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>Pre-approve Member</span>}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-emerald-50 border-2 border-emerald-100 rounded-2xl p-4 flex items-center space-x-3 text-emerald-700 font-bold"
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>{successMessage}</span>
          </motion.div>
        )}
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-red-50 border-2 border-red-100 rounded-2xl p-4 flex items-center space-x-3 text-red-700 font-bold"
          >
            <AlertCircle className="w-5 h-5" />
            <span>{errorMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <section className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-indigo-50/50 overflow-hidden">
        {activeTab === 'events' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 text-slate-500 text-xs font-black uppercase tracking-widest">
                  <th className="px-8 py-4">Event</th>
                  <th className="px-8 py-4">Category</th>
                  <th className="px-8 py-4">Date</th>
                  <th className="px-8 py-4">Location</th>
                  <th className="px-8 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  <tr><td colSpan={5} className="p-12 text-center"><Loader2 className="animate-spin mx-auto" /></td></tr>
                ) : events.length === 0 ? (
                  <tr><td colSpan={5} className="p-12 text-center text-slate-400">No events found.</td></tr>
                ) : (
                  events.map((e) => (
                    <tr key={e.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-8 py-6">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-xl bg-slate-100 overflow-hidden">
                            {e.image_url ? (
                              <img src={e.image_url} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <Calendar className="w-5 h-5 m-2.5 text-slate-400" />
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{e.title}</p>
                            <p className="text-xs text-slate-500 truncate max-w-[200px]">{e.description}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                          {e.category}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-sm font-medium text-slate-600">
                        {new Date(e.date).toLocaleDateString()}
                      </td>
                      <td className="px-8 py-6 text-sm text-slate-500">
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-3 h-3" />
                          <span>{e.location}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button 
                            onClick={() => openEditEventModal(e)}
                            className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                            title="Edit Event"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => deleteEvent(e.id)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                            title="Delete Event"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'event_registrations' && (
          <div className="p-6 md:p-8">
            <EventRegistrationsAdminTab />
          </div>
        )}

        {activeTab === 'impact_ledger' && (
          <div className="p-6 md:p-8">
            <ImpactLedgerAdminTab />
          </div>
        )}

        {activeTab === 'admin_management' && (
          <div className="p-6 md:p-8">
            <AdminManagementSection 
              users={users} 
              onRefresh={fetchUsers} 
            />
          </div>
        )}

        {(activeTab === 'competitions' || activeTab === 'yara_competition') && (
          <div className="p-6 md:p-8">
            <CompetitionsAdminTab />
          </div>
        )}

        {activeTab === 'chapters' && (
          <div className="p-6 md:p-8">
            <ChaptersAdminTab />
          </div>
        )}

        {activeTab === 'competition_teams' && (
          <CompetitionTeamsAdminTab />
        )}

        {activeTab === 'donations_partners' && (
          <div className="p-6 md:p-8">
            <DonationsPartnersAdminTab />
          </div>
        )}

        {activeTab === 'org_posts' && (
          <OrganizationPostsAdminTab />
        )}

        {activeTab === 'settings' && (
          <div className="p-8 md:p-12 space-y-10">
            {/* Launch Timer Configuration */}
            <div className="max-w-3xl bg-slate-50/70 rounded-[2.5rem] p-8 md:p-10 border border-slate-200/80 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 flex items-center space-x-3">
                    <Clock className="w-6 h-6 text-indigo-600" />
                    <span>Official 72-Hour Platform Launch Countdown</span>
                  </h3>
                  <p className="text-slate-500 text-sm font-medium mt-1">
                    Control the global launch countdown timer displayed on the homepage.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={reset72HoursLaunch}
                  className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-5 py-2.5 rounded-2xl font-bold text-xs border border-indigo-200 transition-all flex items-center space-x-2 self-start md:self-auto"
                >
                  <Clock className="w-4 h-4" />
                  <span>Reset to 72 Hours from Now</span>
                </button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Launch Title</label>
                    <input
                      type="text"
                      value={launchConfig.title}
                      onChange={(e) => setLaunchConfig({ ...launchConfig, title: e.target.value })}
                      className="w-full bg-white border-2 border-slate-200 rounded-2xl py-3 px-4 focus:outline-none focus:border-indigo-600 transition-all text-slate-900 font-bold"
                      placeholder="Official YARIA Global Launch"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Target Launch Date & Time</label>
                    <input
                      type="datetime-local"
                      value={launchConfig.launch_date}
                      onChange={(e) => setLaunchConfig({ ...launchConfig, launch_date: e.target.value })}
                      className="w-full bg-white border-2 border-slate-200 rounded-2xl py-3 px-4 focus:outline-none focus:border-indigo-600 transition-all text-slate-900 font-bold"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Banner Announcement Text</label>
                  <textarea
                    value={launchConfig.banner_text}
                    onChange={(e) => setLaunchConfig({ ...launchConfig, banner_text: e.target.value })}
                    className="w-full bg-white border-2 border-slate-200 rounded-2xl py-3 px-4 focus:outline-none focus:border-indigo-600 transition-all text-slate-900 font-medium min-h-[80px]"
                    placeholder="Announcement message displayed to users..."
                  />
                </div>

                <div className="flex items-center space-x-3 p-4 bg-white rounded-2xl border border-slate-200">
                  <input
                    type="checkbox"
                    id="launch_enabled"
                    checked={launchConfig.is_enabled}
                    onChange={(e) => setLaunchConfig({ ...launchConfig, is_enabled: e.target.checked })}
                    className="w-5 h-5 text-indigo-600 rounded-lg focus:ring-indigo-500 border-slate-300"
                  />
                  <label htmlFor="launch_enabled" className="text-sm font-bold text-slate-700 cursor-pointer">
                    Enable Launch Countdown Banner on Homepage
                  </label>
                </div>
              </div>
            </div>

            {/* Course & Platform Fees */}
            <div className="max-w-3xl bg-white rounded-[2.5rem] p-8 md:p-10 border border-slate-100 shadow-xl shadow-indigo-50/50">
              <h3 className="text-2xl font-bold text-slate-900 mb-8 flex items-center space-x-3">
                <DollarSign className="w-6 h-6 text-indigo-600" />
                <span>Course & Platform Fees</span>
              </h3>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Amount</label>
                    <div className="relative group">
                      <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                      <input
                        type="number"
                        value={courseFee.amount}
                        onChange={(e) => setCourseFee({ ...courseFee, amount: Number(e.target.value) })}
                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-6 focus:outline-none focus:border-indigo-600 focus:bg-white transition-all text-slate-900 font-bold pl-12"
                        placeholder="15"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Currency</label>
                    <input
                      type="text"
                      value={courseFee.currency}
                      onChange={(e) => setCourseFee({ ...courseFee, currency: e.target.value })}
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-6 focus:outline-none focus:border-indigo-600 focus:bg-white transition-all text-slate-900 font-bold"
                      placeholder="USD"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Popup Message</label>
                  <textarea
                    value={courseFee.message}
                    onChange={(e) => setCourseFee({ ...courseFee, message: e.target.value })}
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-6 focus:outline-none focus:border-indigo-600 focus:bg-white transition-all text-slate-900 font-medium min-h-[100px] resize-none"
                    placeholder="Enter the message users will see after signup..."
                  />
                  <p className="text-xs text-slate-400 font-medium ml-1">
                    Tip: This message appears in the "Welcome to YARIA" popup immediately after a new user registers.
                  </p>
                </div>

                <div className="pt-4">
                  <button
                    onClick={saveSettings}
                    disabled={isSavingSettings}
                    className="w-full bg-indigo-600 text-white font-bold py-4 rounded-2xl shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
                  >
                    {isSavingSettings ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    <span>Save All System Settings</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'members' && (
          <>
            <div className="p-8 border-b border-slate-100 bg-slate-50/50">
              <div className="relative group max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                <input
                  type="text"
                  placeholder="Search by name, email, or member ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white border-2 border-slate-200 rounded-2xl py-3 px-6 pl-12 focus:outline-none focus:border-indigo-600 transition-all font-medium text-slate-900"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 text-slate-500 text-xs font-black uppercase tracking-widest">
                    <th className="px-8 py-4">Member</th>
                    <th className="px-8 py-4">Role</th>
                    <th className="px-8 py-4">Stats</th>
                    <th className="px-8 py-4">Subscription Expiry</th>
                    <th className="px-8 py-4">ID Number</th>
                    <th className="px-8 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-8 py-12 text-center">
                        <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto" />
                        <p className="mt-4 text-slate-500 font-bold">Loading members...</p>
                      </td>
                    </tr>
                  ) : filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-8 py-12 text-center">
                        <p className="text-slate-400 font-medium italic">No members found matching your search.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <UserRow 
                        key={user.id} 
                        user={user} 
                        onUpdate={updateMemberId}
                        onToggleHalt={toggleHalt}
                        onUpdateSubscription={updateSubscription}
                        onUpdateRole={updateUserRole}
                        onRevoke={revokeAccess}
                        isUpdating={updatingId === user.id}
                      />
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {activeTab === 'mentorship' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 text-slate-500 text-xs font-black uppercase tracking-widest">
                  <th className="px-8 py-4">Student</th>
                  <th className="px-8 py-4">Mentor</th>
                  <th className="px-8 py-4">Status</th>
                  <th className="px-8 py-4">Message</th>
                  <th className="px-8 py-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  <tr><td colSpan={5} className="p-12 text-center"><Loader2 className="animate-spin mx-auto" /></td></tr>
                ) : mentorshipRequests.length === 0 ? (
                  <tr><td colSpan={5} className="p-12 text-center text-slate-400">No mentorship requests yet.</td></tr>
                ) : (
                  mentorshipRequests.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-8 py-6 font-bold text-slate-900">{r.requester_name}</td>
                      <td className="px-8 py-6 font-bold text-indigo-600">{r.mentor_name}</td>
                      <td className="px-8 py-6">
                        <span className={cn(
                          "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                          r.status === 'accepted' ? "bg-emerald-50 text-emerald-600" :
                          r.status === 'pending' ? "bg-amber-50 text-amber-600" : "bg-slate-50 text-slate-600"
                        )}>
                          {r.status}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-sm text-slate-500 max-w-xs truncate">{r.message}</td>
                      <td className="px-8 py-6 text-xs text-slate-400">{new Date(r.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 text-slate-500 text-xs font-black uppercase tracking-widest">
                  <th className="px-8 py-4">Mentor</th>
                  <th className="px-8 py-4">Student</th>
                  <th className="px-8 py-4">Rating</th>
                  <th className="px-8 py-4">Comment</th>
                  <th className="px-8 py-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  <tr><td colSpan={5} className="p-12 text-center"><Loader2 className="animate-spin mx-auto" /></td></tr>
                ) : mentorReviews.length === 0 ? (
                  <tr><td colSpan={5} className="p-12 text-center text-slate-400">No reviews yet.</td></tr>
                ) : (
                  mentorReviews.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-8 py-6 font-bold text-indigo-600">{r.mentor_name}</td>
                      <td className="px-8 py-6 font-bold text-slate-900">{r.student_name}</td>
                      <td className="px-8 py-6">
                        <div className="flex items-center text-amber-400">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={cn("w-3 h-3 fill-current", i >= r.rating && "text-slate-200")} />
                          ))}
                        </div>
                      </td>
                      <td className="px-8 py-6 text-sm text-slate-500 max-w-xs truncate">{r.comment}</td>
                      <td className="px-8 py-6 text-xs text-slate-400">{new Date(r.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
        {activeTab === 'live' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 text-slate-500 text-xs font-black uppercase tracking-widest">
                  <th className="px-8 py-4">Mentor</th>
                  <th className="px-8 py-4">Title</th>
                  <th className="px-8 py-4">Category</th>
                  <th className="px-8 py-4">Date</th>
                  <th className="px-8 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  <tr><td colSpan={5} className="p-12 text-center"><Loader2 className="animate-spin mx-auto" /></td></tr>
                ) : pendingLiveSessions.length === 0 ? (
                  <tr><td colSpan={5} className="p-12 text-center text-slate-400">No pending live sessions.</td></tr>
                ) : (
                  pendingLiveSessions.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-8 py-6 font-bold text-indigo-600">{s.mentor?.display_name || 'Unknown'}</td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900">{s.title}</span>
                          {s.is_external && (
                            <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest mt-1 flex items-center">
                              <ExternalLink className="w-3 h-3 mr-1" />
                              External Platform
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className="px-3 py-1 bg-slate-100 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-600">
                          {s.category}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-xs text-slate-400">{new Date(s.created_at).toLocaleString()}</td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => approveLiveSession(s.id)}
                            disabled={updatingId === s.id}
                            className="bg-emerald-600 text-white px-4 py-2 rounded-xl font-bold text-xs hover:bg-emerald-700 transition-all flex items-center space-x-1"
                          >
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Approve</span>
                          </button>
                          <button
                            onClick={() => rejectLiveSession(s.id)}
                            disabled={updatingId === s.id}
                            className="bg-red-50 text-red-600 px-4 py-2 rounded-xl font-bold text-xs hover:bg-red-100 transition-all flex items-center space-x-1"
                          >
                            <XCircle className="w-3 h-3" />
                            <span>Reject</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
        {activeTab === 'mentor_req' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 text-slate-500 text-xs font-black uppercase tracking-widest">
                  <th className="px-8 py-4">Session</th>
                  <th className="px-8 py-4">Mentor</th>
                  <th className="px-8 py-4">Students</th>
                  <th className="px-8 py-4">Required Skills</th>
                  <th className="px-8 py-4">Status</th>
                  <th className="px-8 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  <tr><td colSpan={6} className="p-12 text-center"><Loader2 className="animate-spin mx-auto" /></td></tr>
                ) : autoMentorRequests.length === 0 ? (
                  <tr><td colSpan={6} className="p-12 text-center text-slate-400">No automatic mentor requests.</td></tr>
                ) : (
                  autoMentorRequests.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-8 py-6 font-bold text-slate-900">{r.session?.title}</td>
                      <td className="px-8 py-6 text-indigo-600 font-bold">{r.session?.mentor?.display_name}</td>
                      <td className="px-8 py-6 font-black text-indigo-600">{r.student_count}</td>
                      <td className="px-8 py-6">
                        <div className="flex flex-wrap gap-1">
                          {r.session?.required_skills?.map((skill: string, idx: number) => (
                            <span key={idx} className="px-2 py-0.5 bg-slate-100 rounded-md text-[10px] font-bold text-slate-600">
                              {skill}
                            </span>
                          )) || <span className="text-slate-400 italic text-xs">None specified</span>}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className={cn(
                          "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                          r.status === 'pending' ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600"
                        )}>
                          {r.status}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        {r.status === 'pending' && (
                          <button
                            onClick={() => resolveMentorRequest(r.id)}
                            disabled={updatingId === r.id}
                            className="bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold text-xs hover:bg-indigo-700 transition-all"
                          >
                            Mark Resolved
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
        {activeTab === 'site_content' && (
          <div className="p-6 md:p-8">
            <SiteContentAdminTab />
          </div>
        )}
        {activeTab === 'learning_academy' && (
          <div className="p-6 md:p-8">
            <LearningAcademyAdminCenter adminUserId={authUser?.id || 'admin'} />
          </div>
        )}
        {activeTab === 'lms_evaluations' && (
          <div className="p-6 md:p-8">
            <LearningAcademyAdminCenter adminUserId={authUser?.id || 'admin'} />
          </div>
        )}
        {activeTab === 'curriculum' && (
          <div className="p-6 md:p-8">
            <LearningAcademyAdminCenter adminUserId={authUser?.id || 'admin'} />
          </div>
        )}
        {activeTab === 'virtual_comp' && (
          <div className="p-8">
            <VirtualCompetitionAdminTab />
          </div>
        )}
        {activeTab === 'brainstorming' && (
          <div className="p-8">
            <BrainstormingAdminTab />
          </div>
        )}
        {activeTab === 'finance' && (
          <div className="p-8">
            <FinanceAdminTab />
          </div>
        )}
      </section>
    </div>
  );
}

interface UserRowProps {
  key?: string;
  user: UserProfile;
  onUpdate: (id: string, email: string, name: string, newId: string) => Promise<void>;
  onToggleHalt: (id: string, currentHalt: boolean) => Promise<void>;
  onUpdateSubscription: (id: string, newExpiry: string) => Promise<void>;
  onUpdateRole: (id: string, role: string) => Promise<void>;
  onRevoke: (id: string, name: string) => Promise<void>;
  isUpdating: boolean;
}

function UserRow({ user, onUpdate, onToggleHalt, onUpdateSubscription, onUpdateRole, onRevoke, isUpdating }: UserRowProps) {
  const [newId, setNewId] = useState(user.member_id || '');
  const [copied, setCopied] = useState(false);
  const [expiryDate, setExpiryDate] = useState(user.subscription_expires_at ? new Date(user.subscription_expires_at).toISOString().split('T')[0] : '');

  // Synchronize internal newId state whenever user prop updates
  useEffect(() => {
    setNewId(user.member_id || '');
  }, [user.member_id]);

  const generateAutoId = () => {
    const year = new Date().getFullYear();
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    const generated = `YARIA-${year}-${randomDigits}`;
    setNewId(generated);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <tr className="hover:bg-slate-50/50 transition-colors group">
      <td className="px-8 py-6">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-lg overflow-hidden border-2 border-white shadow-sm">
            {user.avatar_url ? (
              <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
            ) : (
              user.display_name?.[0] || 'U'
            )}
          </div>
          <div>
            <p className="font-bold text-slate-900">{user.display_name}</p>
            <p className="text-sm text-slate-500 flex items-center">
              <Mail className="w-3 h-3 mr-1" />
              {user.email}
            </p>
          </div>
        </div>
      </td>
      <td className="px-8 py-6">
        <select
          value={user.role}
          onChange={(e) => onUpdateRole(user.id, e.target.value)}
          disabled={isUpdating}
          className="bg-white border-2 border-slate-200 rounded-xl py-1.5 px-3 text-sm font-bold text-slate-700 focus:outline-none focus:border-indigo-600 transition-all"
        >
          <option value="innovator">Innovator</option>
          <option value="mentor">Mentor</option>
          <option value="admin">Admin</option>
        </select>
      </td>
      <td className="px-8 py-6">
        {user.role === 'mentor' ? (
          <div className="space-y-1">
            <div className="flex items-center text-xs font-bold text-amber-500">
              <Star className="w-3 h-3 mr-1 fill-current" />
              <span>{user.rating || '0.0'}</span>
            </div>
            <div className="flex items-center text-[10px] font-bold text-slate-500">
              <Users className="w-3 h-3 mr-1" />
              <span>{user.mentored_count || 0} Mentees</span>
            </div>
            <div className="flex items-center text-[10px] font-bold text-emerald-600">
              <span className="mr-1">$</span>
              <span>{user.total_commission || '0.00'}</span>
            </div>
          </div>
        ) : (
          <span className="text-xs text-slate-400 italic">N/A</span>
        )}
      </td>
      <td className="px-8 py-6">
        <div className="flex items-center space-x-2">
          <input
            type="date"
            value={expiryDate}
            onChange={(e) => setExpiryDate(e.target.value)}
            className="bg-white border-2 border-slate-200 rounded-xl py-1.5 px-3 text-xs font-bold text-slate-700 focus:outline-none focus:border-indigo-600 transition-all"
          />
          <button
            onClick={() => onUpdateSubscription(user.id, new Date(expiryDate).toISOString())}
            disabled={isUpdating || expiryDate === (user.subscription_expires_at ? new Date(user.subscription_expires_at).toISOString().split('T')[0] : '')}
            className={cn(
              "p-1.5 rounded-lg transition-all",
              expiryDate === (user.subscription_expires_at ? new Date(user.subscription_expires_at).toISOString().split('T')[0] : '')
                ? "text-slate-300"
                : "text-indigo-600 hover:bg-indigo-50"
            )}
          >
            <Save className="w-4 h-4" />
          </button>
        </div>
      </td>
      <td className="px-8 py-6">
        <div className="space-y-1.5">
          {/* Active Member ID Status Badge */}
          <div className="flex items-center space-x-2">
            {user.member_id ? (
              <div className="flex items-center space-x-1.5 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-lg">
                <span className="font-mono text-[11px] font-black text-indigo-700">{user.member_id}</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(user.member_id!)}
                  className="text-indigo-400 hover:text-indigo-700 transition-colors"
                  title="Copy ID"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
            ) : (
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">
                No ID Assigned
              </span>
            )}
          </div>

          {/* Edit / Assign ID input bar */}
          <div className="flex items-center space-x-1.5">
            <div className="relative group/input max-w-[150px]">
              <input
                type="text"
                value={newId}
                onChange={(e) => setNewId(e.target.value)}
                className="w-full bg-white border-2 border-slate-200 rounded-xl py-1.5 px-3 focus:outline-none focus:border-indigo-600 transition-all font-mono text-xs font-bold text-slate-900"
                placeholder="e.g. YARIA-2026-..."
              />
            </div>
            <button
              type="button"
              onClick={generateAutoId}
              className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-all"
              title="Generate Random ID"
            >
              <Sparkles className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onUpdate(user.id, user.email, user.display_name, newId)}
              disabled={isUpdating || newId === user.member_id || !newId.trim()}
              className={cn(
                "p-1.5 rounded-xl transition-all",
                newId === user.member_id || !newId.trim()
                  ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                  : "bg-indigo-600 text-white shadow-md shadow-indigo-100 hover:bg-indigo-700"
              )}
              title="Save Member ID"
            >
              <Save className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </td>
      <td className="px-8 py-6">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onToggleHalt(user.id, user.is_halted)}
            disabled={isUpdating}
            className={cn(
              "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all border shadow-sm",
              user.is_halted 
                ? "bg-red-600 text-white border-red-700 hover:bg-red-700" 
                : "bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100"
            )}
          >
            {user.is_halted ? 'HALTED' : 'ACTIVE'}
          </button>
          {user.member_id && (
            <button
              onClick={() => onRevoke(user.id, user.display_name)}
              disabled={isUpdating}
              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
              title="Revoke Access"
            >
              <ShieldOff className="w-4 h-4" />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}

