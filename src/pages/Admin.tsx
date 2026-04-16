import React, { useEffect, useState } from 'react';
import { useAuth } from '../components/AuthContext';
import { supabase } from '../lib/supabase';
import { Users, Search, User, Mail, Hash, Save, Loader2, CheckCircle2, AlertCircle, Send, ShieldOff, UserPlus, Trash2, MessageSquare, Star, X as CloseIcon, DollarSign, Video, XCircle, Calendar, Trophy, Plus, Edit2, Link as LinkIcon, MapPin, Clock, ExternalLink, Brain, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { CURRICULUM } from '../constants/curriculum';

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
  const [activeTab, setActiveTab] = useState<'members' | 'mentorship' | 'reviews' | 'live' | 'mentor_req' | 'events' | 'competitions' | 'settings' | 'curriculum' | 'finances'>('members');
  const [partners, setPartners] = useState<any[]>([]);
  const [partnerForm, setPartnerForm] = useState({ name: '', website_url: '', description: '', logo_url: '', contact_email: '' });
  const [curriculumFeedbacks, setCurriculumFeedbacks] = useState<any[]>([]);
  const [financialLogs, setFinancialLogs] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [newAmountPaid, setNewAmountPaid] = useState('');
  const [newTotalDues, setNewTotalDues] = useState('');
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [mentorshipRequests, setMentorshipRequests] = useState<MentorshipRequest[]>([]);
  const [mentorReviews, setMentorReviews] = useState<MentorReview[]>([]);
  const [pendingLiveSessions, setPendingLiveSessions] = useState<any[]>([]);
  const [mentorsList, setMentorsList] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignSessionId, setAssignSessionId] = useState<string | null>(null);
  const [assignMentorId, setAssignMentorId] = useState<string | null>(null);
  const [assignNotes, setAssignNotes] = useState('');
  const [autoMentorRequests, setAutoMentorRequests] = useState<any[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [competitions, setCompetitions] = useState<Competition[]>([]);
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
    if (activeTab === 'live') fetchMentorsForAssign();
    if (activeTab === 'live') fetchAssignments();
    if (activeTab === 'mentor_req') fetchAutoMentorRequests();
    if (activeTab === 'events') fetchEvents();
    if (activeTab === 'competitions') fetchCompetitions();
    if (activeTab === 'settings') fetchSettings();
    if (activeTab === 'curriculum') fetchCurriculumFeedbacks();
    if (activeTab === 'finances') fetchFinancials();
    if (activeTab === 'partners') fetchPartners();
  }, [activeTab]);

  const fetchPartners = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('partners').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setPartners(data || []);
    } catch (err: any) {
      console.error('Error fetching partners:', err);
    } finally {
      setLoading(false);
    }
  };

  const savePartner = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.from('partners').insert(partnerForm);
      if (error) throw error;
      setPartnerForm({ name: '', website_url: '', description: '', logo_url: '', contact_email: '' });
      fetchPartners();
    } catch (err: any) {
      console.error('Error saving partner:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchFinancials = async () => {
    setLoading(true);
    try {
      const { data: logs, error: logsError } = await supabase
        .from('mentor_session_logs')
        .select(`
          *,
          mentor:profiles(display_name, email)
        `)
        .order('created_at', { ascending: false });
      
      if (logsError) throw logsError;
      setFinancialLogs(logs || []);
      
      // Also fetch users for payment management
      if (users.length === 0) fetchUsers();
    } catch (error: any) {
      console.error('Error fetching financials:', error);
      setErrorMessage('Failed to load financial data.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePayment = async (userId: string) => {
    if (!newAmountPaid && !newTotalDues) return;
    setLoading(true);
    try {
      const updates: any = {};
      if (newAmountPaid) updates.amount_paid = parseFloat(newAmountPaid);
      if (newTotalDues) updates.total_dues = parseFloat(newTotalDues);

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId);
      
      if (error) throw error;
      setSuccessMessage('Payment status updated successfully!');
      setSelectedUser(null);
      setNewAmountPaid('');
      setNewTotalDues('');
      fetchUsers();
    } catch (error: any) {
      console.error('Error updating payment:', error);
      setErrorMessage('Failed to update payment.');
    } finally {
      setLoading(false);
    }
  };

  const fetchCurriculumFeedbacks = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('curriculum_feedback')
        .select(`
          *,
          profile:profiles(display_name, email)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setCurriculumFeedbacks(data || []);
    } catch (error: any) {
      console.error('Error fetching curriculum feedbacks:', error);
      setErrorMessage('Failed to load curriculum feedbacks.');
    } finally {
      setLoading(false);
    }
  };

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('value')
        .eq('key', 'course_fee')
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      if (data?.value) {
        setCourseFee(data.value);
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
      const { error } = await supabase
        .from('system_settings')
        .upsert({
          key: 'course_fee',
          value: courseFee,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      setSuccessMessage('Settings saved successfully.');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error: any) {
      setErrorMessage(error.message);
    } finally {
      setIsSavingSettings(false);
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

  const fetchMentorsForAssign = async () => {
    try {
      const { data, error } = await supabase.from('profiles').select('id, display_name').eq('role', 'mentor').order('display_name');
      if (error) throw error;
      setMentorsList(data || []);
    } catch (err) {
      console.error('Error fetching mentors:', err);
    }
  };

  const fetchAssignments = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('session_assignments')
        .select(`*, session:live_sessions(*), mentor:profiles(display_name), assigned_by:profiles!assigned_by(display_name), replacement:profiles!replacement_mentor_id(display_name)`)        
        .order('created_at', { ascending: false });
      if (error) throw error;
      setAssignments(data || []);
    } catch (err: any) {
      console.error('Error fetching assignments:', err);
    } finally {
      setLoading(false);
    }
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

  const openAssignModal = (sessionId: string) => {
    setAssignSessionId(sessionId);
    setAssignMentorId(null);
    setAssignNotes('');
    setShowAssignModal(true);
  };

  const assignMentorToSession = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!assignSessionId || !assignMentorId) return alert('Select a mentor');
    setLoading(true);
    try {
      const { error } = await supabase.from('session_assignments').insert({
        session_id: assignSessionId,
        mentor_id: assignMentorId,
        assigned_by: profile?.id,
        admin_notes: assignNotes
      });
      if (error) throw error;
      setShowAssignModal(false);
      fetchAssignments();
      setSuccessMessage('Mentor assigned to session.');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to assign mentor');
    } finally {
      setLoading(false);
    }
  };

  const markAssignmentDone = async (assignmentId: string, paidAmount?: number) => {
    setUpdatingId(assignmentId);
    try {
      const updates: any = { status: 'completed', admin_marked_done_at: new Date().toISOString() };
      if (typeof paidAmount === 'number') updates.paid_amount = paidAmount;

      const { error } = await supabase.from('session_assignments').update(updates).eq('id', assignmentId);
      if (error) throw error;

      // If paidAmount provided, add to mentor profile amount_paid
      if (typeof paidAmount === 'number') {
        const { data: ass } = await supabase.from('session_assignments').select('mentor_id').eq('id', assignmentId).single();
        const mentorId = ass?.mentor_id;
        if (mentorId) {
          const { data: mentorProfile } = await supabase.from('profiles').select('amount_paid').eq('id', mentorId).single();
          const currentPaid = parseFloat((mentorProfile?.amount_paid || 0).toString());
          const newPaid = currentPaid + paidAmount;
          await supabase.from('profiles').update({ amount_paid: newPaid }).eq('id', mentorId);
        }
      }

      fetchAssignments();
      fetchFinancials();
      setSuccessMessage('Assignment marked completed.');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to mark done');
    } finally {
      setUpdatingId(null);
    }
  };

  const markAssignmentFailed = async (assignmentId: string, reason?: string, replacerId?: string) => {
    setUpdatingId(assignmentId);
    try {
      const updates: any = { status: 'failed', failure_reason: reason || null };
      if (replacerId) updates.replacement_mentor_id = replacerId;

      const { error } = await supabase.from('session_assignments').update(updates).eq('id', assignmentId);
      if (error) throw error;

      fetchAssignments();
      setSuccessMessage('Assignment marked failed.');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to mark failed');
    } finally {
      setUpdatingId(null);
    }
  };

  const approveCommissionLog = async (log: any) => {
    setUpdatingId(log.id);
    try {
      // Mark the log as approved
      const { error: approveError } = await supabase
        .from('mentor_session_logs')
        .update({ admin_approved: true })
        .eq('id', log.id);
      if (approveError) throw approveError;

      // Fetch mentor current amount_paid
      const { data: mentorProfile, error: profileErr } = await supabase
        .from('profiles')
        .select('amount_paid')
        .eq('id', log.mentor_id)
        .single();
      if (profileErr) throw profileErr;

      const currentPaid = parseFloat((mentorProfile?.amount_paid || 0).toString());
      const newPaid = currentPaid + parseFloat(log.amount_received);

      const { error: updateErr } = await supabase
        .from('profiles')
        .update({ amount_paid: newPaid })
        .eq('id', log.mentor_id);
      if (updateErr) throw updateErr;

      // Refresh data
      fetchFinancials();
      fetchUsers();
      setSuccessMessage('Commission log approved and mentor balance updated.');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error: any) {
      console.error('Error approving commission log:', error);
      setErrorMessage(error.message || 'Failed to approve log');
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

  const saveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase
        .from('events')
        .insert(eventForm);

      if (error) throw error;

      setSuccessMessage('Event created successfully.');
      setShowEventModal(false);
      setEventForm({
        title: '',
        description: '',
        date: '',
        location: '',
        image_url: '',
        registration_link: '',
        is_upcoming: true,
        category: 'other'
      });
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
      const { error } = await supabase
        .from('competitions')
        .insert(compForm);

      if (error) throw error;

      setSuccessMessage('Competition created successfully.');
      setShowCompModal(false);
      setCompForm({
        title: '',
        description: '',
        start_date: '',
        end_date: '',
        registration_link: '',
        image_url: '',
        status: 'upcoming'
      });
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
      const buckets = ['avatars', 'materials'];
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
        await supabase.auth.signOut();
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
              if (activeTab === 'events') setShowEventModal(true);
              else if (activeTab === 'competitions') setShowCompModal(true);
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
      <div className="flex items-center space-x-2 bg-slate-100 p-1.5 rounded-2xl w-fit">
        <button
          onClick={() => setActiveTab('members')}
          className={cn(
            "px-6 py-2.5 rounded-xl font-bold text-sm transition-all",
            activeTab === 'members' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
          )}
        >
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4" />
            <span>Members</span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('mentorship')}
          className={cn(
            "px-6 py-2.5 rounded-xl font-bold text-sm transition-all",
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
            "px-6 py-2.5 rounded-xl font-bold text-sm transition-all",
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
            "px-6 py-2.5 rounded-xl font-bold text-sm transition-all",
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
            "px-6 py-2.5 rounded-xl font-bold text-sm transition-all",
            activeTab === 'mentor_req' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
          )}
        >
          <div className="flex items-center space-x-2">
            <UserPlus className="w-4 h-4" />
            <span>Mentor Requests</span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('events')}
          className={cn(
            "px-6 py-2.5 rounded-xl font-bold text-sm transition-all",
            activeTab === 'events' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
          )}
        >
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4" />
            <span>Events</span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('competitions')}
          className={cn(
            "px-6 py-2.5 rounded-xl font-bold text-sm transition-all",
            activeTab === 'competitions' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
          )}
        >
          <div className="flex items-center space-x-2">
            <Trophy className="w-4 h-4" />
            <span>Competitions</span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('partners')}
          className={cn(
            "px-6 py-2.5 rounded-xl font-bold text-sm transition-all",
            activeTab === 'partners' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
          )}
        >
          <div className="flex items-center space-x-2">
            <LinkIcon className="w-4 h-4" />
            <span>Partners</span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('curriculum')}
          className={cn(
            "px-6 py-2.5 rounded-xl font-bold text-sm transition-all",
            activeTab === 'curriculum' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
          )}
        >
          <div className="flex items-center space-x-2">
            <Brain className="w-4 h-4" />
            <span>Curriculum</span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('finances')}
          className={cn(
            "px-6 py-2.5 rounded-xl font-bold text-sm transition-all",
            activeTab === 'finances' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
          )}
        >
          <div className="flex items-center space-x-2">
            <DollarSign className="w-4 h-4" />
            <span>Finances</span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={cn(
            "px-6 py-2.5 rounded-xl font-bold text-sm transition-all",
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
                onClick={() => setShowEventModal(false)}
                className="absolute top-6 right-6 p-2 text-slate-400 hover:bg-slate-50 rounded-xl transition-colors"
              >
                <CloseIcon className="w-6 h-6" />
              </button>

              <h3 className="text-2xl font-bold text-slate-900 mb-2">Create New Event</h3>
              <p className="text-slate-500 text-sm mb-8">Add an upcoming event or outreach program.</p>

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

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-indigo-600 text-white font-bold py-4 rounded-2xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center space-x-2"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>Create Event</span>}
                </button>
              </form>
            </motion.div>
          </div>
        )}
        {activeTab === 'live' && (
          <div className="p-8">
            <h3 className="text-xl font-bold mb-4">Current Assignments</h3>
            <div className="bg-white rounded-2xl border p-4">
              {assignments.length === 0 ? (
                <div className="text-slate-400 p-12 text-center">No assignments yet.</div>
              ) : (
                <ul className="space-y-3">
                  {assignments.map(a => (
                    <li key={a.id} className="p-3 border rounded-lg flex items-center justify-between">
                      <div>
                        <div className="font-bold">{a.session?.title || a.session?.name || 'Untitled'}</div>
                        <div className="text-xs text-slate-500">Mentor: {a.mentor?.display_name || 'Unassigned'}</div>
                        <div className="text-xs text-slate-400">Status: {a.status}</div>
                      </div>
                      <div className="space-x-2">
                        <button onClick={() => {
                          const paid = window.prompt('Enter paid amount (leave blank if none)');
                          const parsed = paid ? parseFloat(paid) : undefined;
                          markAssignmentDone(a.id, parsed);
                        }} className="bg-emerald-600 text-white px-3 py-1 rounded-lg text-sm">Mark Done</button>
                        <button onClick={() => {
                          const reason = window.prompt('Reason for failure (optional)');
                          const replacer = window.prompt('Replacement mentor id (optional)');
                          markAssignmentFailed(a.id, reason || undefined, replacer || undefined);
                        }} className="bg-red-50 text-red-600 px-3 py-1 rounded-lg text-sm">Mark Failed</button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
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
                onClick={() => setShowCompModal(false)}
                className="absolute top-6 right-6 p-2 text-slate-400 hover:bg-slate-50 rounded-xl transition-colors"
              >
                <CloseIcon className="w-6 h-6" />
              </button>

              <h3 className="text-2xl font-bold text-slate-900 mb-2">Create New Competition</h3>
              <p className="text-slate-500 text-sm mb-8">Add a new competition with registration links.</p>

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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>Create Competition</span>}
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

        <AnimatePresence>
          {showAssignModal && (
            <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-[2.5rem] p-8 max-w-lg w-full shadow-2xl relative"
              >
                <button onClick={() => setShowAssignModal(false)} className="absolute top-6 right-6 p-2 text-slate-400 hover:bg-slate-50 rounded-xl transition-colors">
                  <CloseIcon className="w-6 h-6" />
                </button>

                <h3 className="text-2xl font-bold mb-2">Assign Mentor to Session</h3>
                <p className="text-slate-500 text-sm mb-6">Select a mentor to assign for this session.</p>

                <form onSubmit={(e) => { e.preventDefault(); assignMentorToSession(); }} className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Mentor</label>
                    <select required value={assignMentorId || ''} onChange={e => setAssignMentorId(e.target.value)} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-4">
                      <option value="">Select mentor</option>
                      {mentorsList.map(m => (<option key={m.id} value={m.id}>{m.display_name}</option>))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Admin Notes (optional)</label>
                    <textarea value={assignNotes} onChange={e => setAssignNotes(e.target.value)} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-4 min-h-[80px]" />
                  </div>

                  <div className="flex items-center justify-end gap-3">
                    <button type="button" onClick={() => setShowAssignModal(false)} className="px-4 py-2 rounded-xl border">Cancel</button>
                    <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-xl">Assign</button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
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
                        <button 
                          onClick={() => deleteEvent(e.id)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

                {activeTab === 'partners' && (
                  <div className="space-y-6">
                    <div className="p-6 bg-white rounded-2xl border">
                      <h3 className="text-xl font-bold mb-3">Add Partner</h3>
                      <form onSubmit={savePartner} className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <input required placeholder="Name" value={partnerForm.name} onChange={e=>setPartnerForm({...partnerForm,name:e.target.value})} className="p-3 border rounded" />
                        <input placeholder="Website URL" value={partnerForm.website_url} onChange={e=>setPartnerForm({...partnerForm,website_url:e.target.value})} className="p-3 border rounded" />
                        <input placeholder="Contact email" value={partnerForm.contact_email} onChange={e=>setPartnerForm({...partnerForm,contact_email:e.target.value})} className="p-3 border rounded" />
                        <input placeholder="Logo URL" value={partnerForm.logo_url} onChange={e=>setPartnerForm({...partnerForm,logo_url:e.target.value})} className="p-3 border rounded" />
                        <textarea placeholder="Description" value={partnerForm.description} onChange={e=>setPartnerForm({...partnerForm,description:e.target.value})} className="p-3 border rounded md:col-span-2" />
                        <div className="md:col-span-2">
                          <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded">Save Partner</button>
                        </div>
                      </form>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {partners.map(p => (
                        <div key={p.id} className="p-4 bg-white rounded shadow">
                          <div className="flex items-center space-x-4">
                            <img src={p.logo_url || '/assets/placeholders/partner.png'} alt={p.name} className="w-12 h-12 object-cover rounded" />
                            <div>
                              <div className="font-bold">{p.name}</div>
                              {p.website_url && <a href={p.website_url} target="_blank" rel="noreferrer" className="text-sm text-indigo-600">{p.website_url}</a>}
                            </div>
                          </div>
                          <p className="mt-3 text-sm text-slate-600">{p.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

        {activeTab === 'competitions' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 text-slate-500 text-xs font-black uppercase tracking-widest">
                  <th className="px-8 py-4">Competition</th>
                  <th className="px-8 py-4">Status</th>
                  <th className="px-8 py-4">Dates</th>
                  <th className="px-8 py-4">Reg. Link</th>
                  <th className="px-8 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  <tr><td colSpan={5} className="p-12 text-center"><Loader2 className="animate-spin mx-auto" /></td></tr>
                ) : competitions.length === 0 ? (
                  <tr><td colSpan={5} className="p-12 text-center text-slate-400">No competitions found.</td></tr>
                ) : (
                  competitions.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-8 py-6">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-xl bg-slate-100 overflow-hidden">
                            {c.image_url ? (
                              <img src={c.image_url} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <Trophy className="w-5 h-5 m-2.5 text-slate-400" />
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{c.title}</p>
                            <p className="text-xs text-slate-500 truncate max-w-[200px]">{c.description}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className={cn(
                          "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                          c.status === 'active' ? "bg-emerald-50 text-emerald-600" :
                          c.status === 'upcoming' ? "bg-amber-50 text-amber-600" : "bg-slate-50 text-slate-600"
                        )}>
                          {c.status}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-xs font-medium text-slate-600">
                        {new Date(c.start_date).toLocaleDateString()} - {new Date(c.end_date).toLocaleDateString()}
                      </td>
                      <td className="px-8 py-6">
                        {c.registration_link && (
                          <a 
                            href={c.registration_link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-indigo-600 hover:underline flex items-center space-x-1"
                          >
                            <LinkIcon className="w-3 h-3" />
                            <span className="text-xs font-bold">Link</span>
                          </a>
                        )}
                      </td>
                      <td className="px-8 py-6 text-right">
                        <button 
                          onClick={() => deleteCompetition(c.id)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'curriculum' && (
          <div className="space-y-8 p-8">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold text-slate-900">Curriculum Mastery Report</h3>
              <div className="flex gap-4">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Done</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded-full">
                  <Clock className="w-4 h-4" />
                  <span>Partial</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-red-600 bg-red-50 px-3 py-1 rounded-full">
                  <HelpCircle className="w-4 h-4" />
                  <span>Struggling</span>
                </div>
              </div>
            </div>

            <div className="grid gap-6">
              {CURRICULUM.map(session => {
                const sessionFeedbacks = curriculumFeedbacks.filter(f => f.session_id === session.id);
                const doneCount = sessionFeedbacks.filter(f => f.status === 'done').length;
                const partialCount = sessionFeedbacks.filter(f => f.status === 'partially').length;
                const struggleCount = sessionFeedbacks.filter(f => f.status === 'struggling').length;

                return (
                  <div key={session.id} className="bg-slate-50 rounded-3xl p-6 border border-slate-100">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-black text-indigo-600 bg-white px-2 py-0.5 rounded-md border border-indigo-100 uppercase tracking-widest">{session.id}</span>
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{session.part}</span>
                        </div>
                        <h4 className="text-lg font-bold text-slate-900">{session.topic}</h4>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Participants</p>
                        <p className="text-xl font-black text-indigo-600">{sessionFeedbacks.length}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div className="bg-white p-4 rounded-2xl border border-slate-100">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-emerald-600">Done</span>
                          <span className="text-sm font-black">{doneCount}</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500" style={{ width: `${sessionFeedbacks.length ? (doneCount/sessionFeedbacks.length)*100 : 0}%` }} />
                        </div>
                      </div>
                      <div className="bg-white p-4 rounded-2xl border border-slate-100">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-amber-600">Partial</span>
                          <span className="text-sm font-black">{partialCount}</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-amber-500" style={{ width: `${sessionFeedbacks.length ? (partialCount/sessionFeedbacks.length)*100 : 0}%` }} />
                        </div>
                      </div>
                      <div className="bg-white p-4 rounded-2xl border border-slate-100">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-red-600">Struggling</span>
                          <span className="text-sm font-black">{struggleCount}</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-red-500" style={{ width: `${sessionFeedbacks.length ? (struggleCount/sessionFeedbacks.length)*100 : 0}%` }} />
                        </div>
                      </div>
                    </div>

                    {sessionFeedbacks.length > 0 && (
                      <div className="space-y-3">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Learner Comments</p>
                        <div className="grid gap-2">
                          {sessionFeedbacks.map(fb => (
                            <div key={fb.id} className="bg-white p-4 rounded-2xl border border-slate-100 flex items-start gap-4">
                              <div className={cn(
                                "w-2 h-2 rounded-full mt-1.5 shrink-0",
                                fb.status === 'done' ? "bg-emerald-500" : 
                                fb.status === 'partially' ? "bg-amber-500" : "bg-red-500"
                              )} />
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-slate-900 mb-1">{fb.profile?.display_name || 'Anonymous'}</p>
                                {fb.success_comment && <p className="text-xs text-slate-600 mb-1"><span className="font-bold text-emerald-600">Success:</span> {fb.success_comment}</p>}
                                {fb.struggle_comment && <p className="text-xs text-slate-600"><span className="font-bold text-red-600">Struggle:</span> {fb.struggle_comment}</p>}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'finances' && (
          <div className="space-y-8 p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* User Payment Management */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-slate-900 leading-tight">Learner Investment Accounts</h3>
                  <div className="flex items-center space-x-2 bg-indigo-50 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-indigo-600">
                    <Users className="w-3 h-3" />
                    <span>{users.filter(u => u.role === 'innovator').length} Innovators</span>
                  </div>
                </div>
                
                <div className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden shadow-sm">
                  <div className="max-h-[600px] overflow-y-auto">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50 sticky top-0 z-10">
                        <tr>
                          <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Innovator</th>
                          <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Financials</th>
                          <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {users.filter(u => u.role === 'innovator').map(u => (
                          <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-6 py-4 text-sm font-bold text-slate-900">{u.display_name}</td>
                            <td className="px-6 py-4">
                              <div className="space-y-1">
                                <p className="text-xs font-medium text-slate-500 flex items-center justify-between">
                                  <span>Paid:</span>
                                  <span className="font-black text-indigo-600">${u.amount_paid || '0.00'}</span>
                                </p>
                                <p className="text-xs font-medium text-slate-500 flex items-center justify-between">
                                  <span>Total:</span>
                                  <span className="font-black text-slate-900">${u.total_dues || '15.00'}</span>
                                </p>
                                <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                                  <div className="h-full bg-emerald-500" style={{ width: `${Math.min(100, (((u as any).amount_paid || 0) / ((u as any).total_dues || 15)) * 100)}%` }} />
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <button 
                                onClick={() => {
                                  setSelectedUser(u);
                                  setNewAmountPaid((u as any).amount_paid?.toString() || '0');
                                  setNewTotalDues((u as any).total_dues?.toString() || '15');
                                }}
                                className="p-2 text-indigo-600 hover:bg-white rounded-xl transition-all shadow-sm border border-indigo-50"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Mentor Commission Evaluations */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-slate-900 leading-tight">Mentor Commission Logs</h3>
                  <div className="flex items-center space-x-2 bg-amber-50 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-amber-600">
                    <DollarSign className="w-3 h-3" />
                    <span>Evaluation Needed</span>
                  </div>
                </div>

                <div className="grid gap-4">
                  {financialLogs.map(log => (
                    <div key={log.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-600 font-black">
                          {log.mentor?.display_name?.[0]}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{log.mentor?.display_name}</p>
                          <p className="text-xs text-slate-500 flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {log.session_id} • {new Date(log.session_date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Commission</p>
                        <p className="text-xl font-black text-emerald-600">${log.amount_received}</p>
                        <div className="mt-3 flex items-center justify-end gap-2">
                          {log.admin_approved ? (
                            <span className="text-xs font-semibold text-emerald-600">Approved</span>
                          ) : (
                            <button
                              onClick={() => approveCommissionLog(log)}
                              disabled={updatingId === log.id}
                              className="bg-indigo-600 text-white px-3 py-2 rounded-xl text-sm font-bold"
                            >
                              {updatingId === log.id ? 'Approving...' : 'Approve'}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {financialLogs.length === 0 && (
                    <div className="bg-slate-50 p-12 rounded-3xl text-center border-2 border-dashed border-slate-200">
                      <p className="text-slate-400 font-medium">No mentor commission logs found.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Edit Payment Modal */}
            <AnimatePresence>
              {selectedUser && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl space-y-8"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-2xl font-black text-slate-900 leading-tight">Update Investment</h4>
                        <p className="text-slate-500 font-medium">Managing finances for {selectedUser.display_name}</p>
                      </div>
                      <button onClick={() => setSelectedUser(null)} className="p-2 text-slate-400 hover:text-slate-600 rounded-xl transition-colors">
                        <XCircle className="w-6 h-6" />
                      </button>
                    </div>

                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Amount Paid (USD)</label>
                        <div className="relative">
                          <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input
                            type="number"
                            step="0.01"
                            value={newAmountPaid}
                            onChange={(e) => setNewAmountPaid(e.target.value)}
                            className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 pl-10 pr-6 focus:outline-none focus:border-indigo-600 focus:bg-white transition-all font-bold"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Total Target (USD)</label>
                        <div className="relative">
                          <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input
                            type="number"
                            step="0.01"
                            value={newTotalDues}
                            onChange={(e) => setNewTotalDues(e.target.value)}
                            className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 pl-10 pr-6 focus:outline-none focus:border-indigo-600 focus:bg-white transition-all font-bold"
                          />
                        </div>
                      </div>

                      <button
                        onClick={() => handleUpdatePayment(selectedUser.id)}
                        disabled={loading}
                        className="w-full bg-indigo-600 text-white font-black py-4 rounded-2xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center space-x-2"
                      >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                        <span>Save Changes</span>
                      </button>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="max-w-2xl bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-xl shadow-indigo-50/50">
            <h3 className="text-2xl font-bold text-slate-900 mb-8 flex items-center space-x-3">
              <DollarSign className="w-6 h-6 text-indigo-600" />
              <span>Course & Platform Fees</span>
            </h3>
            
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1 uppercase tracking-wider">Amount</label>
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
                  <label className="text-sm font-bold text-slate-700 ml-1 uppercase tracking-wider">Currency</label>
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
                <label className="text-sm font-bold text-slate-700 ml-1 uppercase tracking-wider">Popup Message</label>
                <textarea
                  value={courseFee.message}
                  onChange={(e) => setCourseFee({ ...courseFee, message: e.target.value })}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-6 focus:outline-none focus:border-indigo-600 focus:bg-white transition-all text-slate-900 font-medium min-h-[120px] resize-none"
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
                  <span>Save System Settings</span>
                </button>
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
                          <button
                            onClick={() => openAssignModal(s.id)}
                            disabled={updatingId === s.id}
                            className="bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold text-xs hover:bg-indigo-700 transition-all flex items-center space-x-1"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Assign Mentor</span>
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
  const [expiryDate, setExpiryDate] = useState(user.subscription_expires_at ? new Date(user.subscription_expires_at).toISOString().split('T')[0] : '');

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
        <div className="flex items-center space-x-2">
          <div className="relative group/input max-w-[160px]">
            <input
              type="text"
              value={newId}
              onChange={(e) => setNewId(e.target.value)}
              className="w-full bg-white border-2 border-slate-200 rounded-xl py-2 px-4 focus:outline-none focus:border-indigo-600 transition-all font-mono text-xs font-bold text-slate-900"
              placeholder="ID Number"
            />
          </div>
          <button
            onClick={() => onUpdate(user.id, user.email, user.display_name, newId)}
            disabled={isUpdating || newId === user.member_id || !newId.trim()}
            className={cn(
              "p-2 rounded-xl transition-all",
              newId === user.member_id || !newId.trim()
                ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                : "bg-indigo-600 text-white shadow-lg shadow-indigo-100 hover:bg-indigo-700"
            )}
            title="Update ID"
          >
            <Save className="w-4 h-4" />
          </button>
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
