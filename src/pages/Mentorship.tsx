import React, { useEffect, useState } from 'react';
import { useAuth } from '../components/AuthContext';
import { supabase } from '../lib/supabase';
import { Users, Search, MessageSquare, CheckCircle2, XCircle, Clock, Star, Loader2, Send, DollarSign, Award, Video, Play, ExternalLink, Calendar, Plus, FileText, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { ASSETS } from '../constants/assets';
import PlaceholderImage from '../components/PlaceholderImage';

export default function Mentorship() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'mentors' | 'requests' | 'live' | 'materials'>('mentors');
  const [mentors, setMentors] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [liveSessions, setLiveSessions] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isRequesting, setIsRequesting] = useState<string | null>(null);
  const [isReviewing, setIsReviewing] = useState<any | null>(null);
  const [showLiveModal, setShowLiveModal] = useState(false);
  const [liveTitle, setLiveTitle] = useState('');
  const [liveCategory, setLiveCategory] = useState<'junior' | 'intermediate' | 'senior' | 'teachers'>('junior');
  const [liveVideoUrl, setLiveVideoUrl] = useState('');
  const [liveSkills, setLiveSkills] = useState('');
  const [isExternal, setIsExternal] = useState(false);
  const [externalAnnouncement, setExternalAnnouncement] = useState('');
  const [externalLink, setExternalLink] = useState('');
  const [requestMessage, setRequestMessage] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedLiveCategory, setSelectedLiveCategory] = useState<'all' | 'junior' | 'intermediate' | 'senior' | 'teachers'>('all');
  const [studyMaterials, setStudyMaterials] = useState<any[]>([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadDescription, setUploadDescription] = useState('');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadUrl, setUploadUrl] = useState('');
  const [uploadType, setUploadType] = useState<'pdf' | 'doc' | 'video' | 'other'>('pdf');

  useEffect(() => {
    const fetchMentors = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'mentor');
      
      if (error) console.error('Error fetching mentors:', error);
      else setMentors(data || []);
    };

    const fetchRequests = async () => {
      if (!user) return;
      const column = profile?.role === 'mentor' ? 'mentor_id' : 'requester_id';
      const { data, error } = await supabase
        .from('mentorship_requests')
        .select('*')
        .eq(column, user.id)
        .order('created_at', { ascending: false });
      
      if (error) console.error('Error fetching requests:', error);
      else setRequests(data || []);
    };

    const fetchLiveSessions = async () => {
      let query = supabase
        .from('live_sessions')
        .select('*, mentor:profiles!mentor_id(display_name)')
        .eq('is_live', true);
      
      // Non-admins only see approved sessions, or their own
      if (profile?.role !== 'admin') {
        query = query.or(`is_approved.eq.true,mentor_id.eq.${user?.id}`);
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) console.error('Error fetching live sessions:', error);
      else setLiveSessions(data || []);
    };

    const fetchStudyMaterials = async () => {
      const { data, error } = await supabase
        .from('study_materials')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) console.error('Error fetching materials:', error);
      else setStudyMaterials(data || []);
    };

    fetchMentors();
    fetchRequests();
    fetchLiveSessions();
    fetchStudyMaterials();

    const requestsSubscription = supabase
      .channel('mentorship_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'mentorship_requests' }, () => {
        fetchRequests();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'live_sessions' }, () => {
        fetchLiveSessions();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(requestsSubscription);
    };
  }, [user, profile?.role]);

  const startLiveSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !liveTitle.trim()) return;

    setLoading(true);
    try {
      const roomId = Math.random().toString(36).substring(2, 12);
      const { data, error } = await supabase.from('live_sessions').insert({
        mentor_id: user.id,
        title: liveTitle,
        category: liveCategory,
        room_id: roomId,
        video_url: isExternal ? externalLink.trim() : (liveVideoUrl.trim() || null),
        required_skills: liveSkills.split(',').map(s => s.trim()).filter(s => s),
        is_live: true,
        is_approved: profile?.role === 'admin', // Admins are auto-approved
        description: isExternal ? externalAnnouncement : null, // Assuming description exists or adding it
        is_external: isExternal
      }).select().single();

      if (error) throw error;

      setShowLiveModal(false);
      setLiveTitle('');
      setLiveVideoUrl('');
      setLiveSkills('');
      setIsExternal(false);
      setExternalAnnouncement('');
      setExternalLink('');
      
      if (profile?.role === 'admin') {
        navigate(`/live/${roomId}`);
      } else {
        alert('Your live session request has been sent to admins for approval.');
      }
    } catch (error) {
      console.error('Error starting live session:', error);
    } finally {
      setLoading(false);
    }
  };

  const endLiveSession = async (sessionId: string) => {
    try {
      const { error } = await supabase
        .from('live_sessions')
        .update({ is_live: false, ended_at: new Date().toISOString() })
        .eq('id', sessionId);
      if (error) throw error;
    } catch (error) {
      console.error('Error ending session:', error);
    }
  };

  const handleRequest = async (mentorId: string) => {
    if (!user) return;
    setLoading(true);
    try {
      const { error } = await supabase.from('mentorship_requests').insert({
        requester_id: user.id,
        requester_name: profile?.display_name || 'Anonymous',
        mentor_id: mentorId,
        status: 'pending',
        message: requestMessage,
      });
      if (error) throw error;
      setIsRequesting(null);
      setRequestMessage('');
    } catch (error) {
      console.error('Error requesting mentorship:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (requestId: string, status: 'accepted' | 'declined' | 'completed') => {
    try {
      const { error } = await supabase
        .from('mentorship_requests')
        .update({ status })
        .eq('id', requestId);
      if (error) throw error;
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleUploadMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || (!uploadFile && !uploadUrl.trim()) || !uploadTitle.trim()) return;

    setLoading(true);
    try {
      let finalUrl = uploadUrl.trim();

      if (uploadFile) {
        const fileExt = uploadFile.name.split('.').pop();
        const fileName = `${user.id}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `${fileName}`; // Simplified path

        const { error: uploadError } = await supabase.storage
          .from('materials')
          .upload(filePath, uploadFile, {
            upsert: true
          });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('materials')
          .getPublicUrl(filePath);
        
        finalUrl = publicUrl;
      }

      const { error } = await supabase.from('study_materials').insert({
        mentor_id: user.id,
        mentor_name: profile?.display_name || 'Anonymous',
        title: uploadTitle,
        description: uploadDescription,
        file_url: finalUrl,
        file_type: uploadType
      });

      if (error) throw error;

      setShowUploadModal(false);
      setUploadTitle('');
      setUploadDescription('');
      setUploadFile(null);
      setUploadUrl('');
      // fetchStudyMaterials();
    } catch (error: any) {
      console.error('Detailed material upload error:', error);
      alert(`Upload failed: ${error.message || 'Unknown error'}. 
      
Possible causes:
1. The "materials" storage bucket does not exist in your Supabase project.
2. The "materials" bucket is not set to "Public".
3. Row Level Security (RLS) policies for the "materials" bucket are missing or restrictive.`);
    } finally {
      setLoading(false);
    }
  };
  const handleSubmitReview = async () => {
    if (!user || !isReviewing) return;
    setLoading(true);
    try {
      const { error } = await supabase.from('mentor_reviews').insert({
        mentor_id: isReviewing.mentor_id,
        student_id: user.id,
        request_id: isReviewing.id,
        rating: reviewRating,
        comment: reviewComment,
      });
      if (error) throw error;

      setIsReviewing(null);
      setReviewRating(5);
      setReviewComment('');
    } catch (error) {
      console.error('Error submitting review:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredMentors = mentors.filter(mentor => 
    mentor.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mentor.skills?.some((skill: string) => skill.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-8 pb-12">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Mentorship Hub</h2>
          <p className="text-slate-500 font-medium">Connect with industry experts and accelerate your growth.</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white border-2 border-slate-100 rounded-2xl py-3 pl-12 pr-6 focus:outline-none focus:border-indigo-600 focus:bg-white transition-all font-medium w-full md:w-64 shadow-sm"
            />
          </div>
          {(profile?.role === 'mentor' || profile?.role === 'admin') && (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowUploadModal(true)}
                className="bg-white text-indigo-600 border-2 border-indigo-50 px-6 py-3 rounded-2xl font-bold shadow-sm hover:bg-indigo-50 transition-all flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Upload Doc</span>
              </button>
              <button
                onClick={() => setShowLiveModal(true)}
                className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center space-x-2"
              >
                <Video className="w-4 h-4" />
                <span>Go Live</span>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Tabs */}
      <div className="flex items-center space-x-2 bg-slate-100 p-1.5 rounded-2xl w-fit">
        <button
          onClick={() => setActiveTab('mentors')}
          className={cn(
            "px-6 py-2.5 rounded-xl font-bold text-sm transition-all",
            activeTab === 'mentors' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
          )}
        >
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4" />
            <span>Mentors</span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('requests')}
          className={cn(
            "px-6 py-2.5 rounded-xl font-bold text-sm transition-all",
            activeTab === 'requests' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
          )}
        >
          <div className="flex items-center space-x-2">
            <MessageSquare className="w-4 h-4" />
            <span>Requests</span>
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
            <div className="relative">
              <Video className="w-4 h-4" />
              {liveSessions.length > 0 && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              )}
            </div>
            <span>Live Sessions</span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('materials')}
          className={cn(
            "px-6 py-2.5 rounded-xl font-bold text-sm transition-all",
            activeTab === 'materials' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
          )}
        >
          <div className="flex items-center space-x-2">
            <FileText className="w-4 h-4" />
            <span>Study Materials</span>
          </div>
        </button>
      </div>

      {profile?.role === 'mentor' && (
        <section className="bg-indigo-600 rounded-[2.5rem] p-8 text-white shadow-xl shadow-indigo-100 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center space-x-6">
            <div className="w-16 h-16 bg-white/20 rounded-3xl flex items-center justify-center">
              <Award className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-2xl font-bold">Mentor Dashboard</h3>
              <p className="text-indigo-100 font-medium">You've mentored {profile.mentored_count || 0} students total.</p>
            </div>
          </div>
          <div className="flex items-center space-x-8 bg-white/10 px-8 py-4 rounded-3xl backdrop-blur-sm">
            <div className="text-center">
              <p className="text-xs font-bold uppercase tracking-widest opacity-70">Commission</p>
              <p className="text-2xl font-bold flex items-center justify-center">
                <DollarSign className="w-5 h-5 mr-1" />
                {profile.total_commission || '0.00'}
              </p>
            </div>
            <div className="w-px h-10 bg-white/20" />
            <div className="text-center">
              <p className="text-xs font-bold uppercase tracking-widest opacity-70">Rating</p>
              <p className="text-2xl font-bold flex items-center justify-center">
                <Star className="w-5 h-5 mr-1 fill-white" />
                {profile.rating || '0.0'}
              </p>
            </div>
          </div>
        </section>
      )}

      {activeTab === 'mentors' && (
        <section className="space-y-6">
          <h3 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center space-x-3">
            <Star className="w-6 h-6 text-indigo-600" />
            <span>Available Mentors</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredMentors.map((mentor, index) => (
              <motion.div
                key={mentor.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-[2.5rem] border border-slate-100 p-8 hover:shadow-2xl hover:shadow-indigo-50 transition-all group"
              >
                <div className="flex flex-col items-center text-center space-y-6">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-3xl bg-indigo-50 flex items-center justify-center overflow-hidden border-4 border-white shadow-xl group-hover:scale-105 transition-transform duration-500">
                      {mentor.avatar_url ? (
                        <img src={mentor.avatar_url} alt={mentor.display_name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <PlaceholderImage type="avatar" text={mentor.display_name} />
                      )}
                    </div>
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-emerald-500 rounded-full border-4 border-white flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{mentor.display_name}</h4>
                    <div className="flex items-center justify-center space-x-2 mt-1">
                      <div className="flex items-center text-amber-400">
                        <Star className="w-4 h-4 fill-amber-400" />
                        <span className="text-sm font-bold ml-1 text-slate-700">{mentor.rating || '0.0'}</span>
                      </div>
                      <span className="text-slate-300">•</span>
                      <span className="text-xs text-slate-500 font-bold uppercase tracking-widest">{mentor.mentored_count || 0} Mentored</span>
                    </div>
                  </div>
                  <p className="text-slate-600 font-medium line-clamp-3 leading-relaxed">
                    {mentor.bio || "No bio provided."}
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {(mentor.skills || []).map((skill: string) => (
                      <span key={skill} className="px-3 py-1 bg-slate-50 text-slate-600 rounded-full text-xs font-bold uppercase tracking-wider border border-slate-100">
                        {skill}
                      </span>
                    ))}
                  </div>
                  <button
                    onClick={() => setIsRequesting(mentor.id)}
                    disabled={profile?.role === 'mentor' || mentor.id === user?.id}
                    className="w-full bg-indigo-600 text-white px-6 py-4 rounded-2xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:hover:translate-y-0"
                  >
                    Request Mentorship
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {activeTab === 'requests' && (
        <section className="space-y-6">
          <h3 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center space-x-3">
            <MessageSquare className="w-6 h-6 text-indigo-600" />
            <span>Active Requests</span>
          </h3>
          <div className="grid gap-4">
            {requests.length === 0 ? (
              <div className="bg-white p-12 rounded-[2.5rem] border border-slate-100 text-center">
                <p className="text-slate-400 font-medium italic">No active mentorship requests.</p>
              </div>
            ) : (
              requests.map((request) => (
                <motion.div
                  key={request.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-xl">
                      {profile?.role === 'mentor' ? request.requester_name?.[0] : 'M'}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">
                        {profile?.role === 'mentor' ? request.requester_name : 'Mentorship Request'}
                      </h4>
                      <p className="text-sm text-slate-500 font-medium line-clamp-1">{request.message}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className={cn(
                      "px-4 py-2 rounded-xl text-sm font-bold flex items-center space-x-2",
                      request.status === 'pending' ? "bg-amber-50 text-amber-600" :
                      request.status === 'accepted' ? "bg-emerald-50 text-emerald-600" : 
                      request.status === 'completed' ? "bg-indigo-50 text-indigo-600" : "bg-red-50 text-red-600"
                    )}>
                      {request.status === 'pending' && <Clock className="w-4 h-4" />}
                      {request.status === 'accepted' && <CheckCircle2 className="w-4 h-4" />}
                      {request.status === 'completed' && <Award className="w-4 h-4" />}
                      {request.status === 'declined' && <XCircle className="w-4 h-4" />}
                      <span className="capitalize">{request.status}</span>
                    </div>
                    
                    {profile?.role === 'mentor' && request.status === 'pending' && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleUpdateStatus(request.id, 'accepted')}
                          className="p-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-100"
                        >
                          <CheckCircle2 className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(request.id, 'declined')}
                          className="p-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors shadow-lg shadow-red-100"
                        >
                          <XCircle className="w-5 h-5" />
                        </button>
                      </div>
                    )}

                    {profile?.role === 'mentor' && request.status === 'accepted' && (
                      <button
                        onClick={() => handleUpdateStatus(request.id, 'completed')}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors"
                      >
                        Complete Session
                      </button>
                    )}

                    {profile?.role !== 'mentor' && request.status === 'completed' && (
                      <button
                        onClick={() => setIsReviewing(request)}
                        className="px-4 py-2 bg-amber-500 text-white rounded-xl font-bold hover:bg-amber-600 transition-colors flex items-center space-x-2"
                      >
                        <Star className="w-4 h-4 fill-white" />
                        <span>Leave Review</span>
                      </button>
                    )}
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </section>
      )}

      {activeTab === 'materials' && (
        <section className="space-y-8">
          <h3 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center space-x-3">
            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-500">
              <FileText className="w-6 h-6" />
            </div>
            <span>Study Materials</span>
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {studyMaterials.length === 0 ? (
              <div className="col-span-full bg-white p-12 rounded-[2.5rem] border border-slate-100 text-center">
                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-300">
                  <FileText className="w-8 h-8" />
                </div>
                <p className="text-slate-400 font-medium italic">No study materials uploaded yet.</p>
              </div>
            ) : (
              studyMaterials.map((material) => (
                <motion.div
                  key={material.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-[2.5rem] p-8 border border-slate-100 hover:shadow-xl hover:shadow-indigo-50 transition-all flex flex-col"
                >
                  <div className="flex items-start justify-between mb-6">
                    <div className={cn(
                      "w-12 h-12 rounded-2xl flex items-center justify-center",
                      material.file_type === 'pdf' ? "bg-red-50 text-red-500" :
                      material.file_type === 'video' ? "bg-indigo-50 text-indigo-500" : "bg-emerald-50 text-emerald-500"
                    )}>
                      {material.file_type === 'pdf' ? <FileText className="w-6 h-6" /> : 
                       material.file_type === 'video' ? <Video className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                      {new Date(material.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <h4 className="text-xl font-bold text-slate-900 mb-2">{material.title}</h4>
                  <p className="text-slate-500 text-sm mb-6 line-clamp-2">{material.description}</p>
                  <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold">
                        {material.mentor_name[0]}
                      </div>
                      <span className="text-xs font-bold text-slate-600">{material.mentor_name}</span>
                    </div>
                    <a
                      href={material.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 font-bold text-sm hover:underline"
                    >
                      View Resource
                    </a>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </section>
      )}
      {activeTab === 'live' && (
        <section className="space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <h3 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center space-x-3">
              <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center text-red-500">
                <Video className="w-6 h-6" />
              </div>
              <span>Live Training Sessions</span>
            </h3>

            <div className="flex flex-wrap items-center gap-2 bg-slate-100 p-1.5 rounded-2xl">
              {[
                { id: 'all', label: 'All Classes' },
                { id: 'junior', label: 'Junior' },
                { id: 'intermediate', label: 'Intermediate' },
                { id: 'senior', label: 'Senior' },
                { id: 'teachers', label: 'Teachers' }
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedLiveCategory(cat.id as any)}
                  className={cn(
                    "px-4 py-2 rounded-xl text-xs font-bold transition-all",
                    selectedLiveCategory === cat.id 
                      ? "bg-white text-indigo-600 shadow-sm" 
                      : "text-slate-500 hover:text-slate-700"
                  )}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {liveSessions.filter(s => selectedLiveCategory === 'all' || s.category === selectedLiveCategory).length === 0 ? (
              <div className="col-span-full bg-white p-12 rounded-[2.5rem] border border-slate-100 text-center">
                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-300">
                  <Video className="w-8 h-8" />
                </div>
                <p className="text-slate-400 font-medium italic">No live sessions currently active.</p>
              </div>
            ) : (
              liveSessions
                .filter(s => selectedLiveCategory === 'all' || s.category === selectedLiveCategory)
                .map((session) => (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden hover:shadow-2xl hover:shadow-indigo-50 transition-all group"
                >
                  <div className="aspect-video bg-slate-900 relative flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent z-10" />
                    <div className="absolute top-4 left-4 z-20 flex items-center space-x-2">
                      <div className={cn(
                        "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center space-x-1.5",
                        session.is_approved ? "bg-red-500 text-white animate-pulse" : "bg-amber-500 text-white"
                      )}>
                        <span className="w-1.5 h-1.5 bg-white rounded-full" />
                        <span>{session.is_approved ? 'Live Now' : 'Pending Approval'}</span>
                      </div>
                      <div className="bg-white/20 backdrop-blur-md text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                        {session.category === 'junior' ? 'Junior (Form 1-2)' :
                         session.category === 'intermediate' ? 'Intermediate (Form 3-4)' :
                         session.category === 'senior' ? 'Senior (Form 5-6)' : 'Teachers'}
                      </div>
                    </div>
                    <Video className="w-12 h-12 text-white/20 relative z-0" />
                    <div className="absolute bottom-4 left-4 right-4 z-20">
                      <p className="text-white font-bold text-lg line-clamp-1">{session.title}</p>
                      <p className="text-white/70 text-sm font-medium">by {session.mentor?.display_name}</p>
                    </div>
                  </div>
                  <div className="p-6 space-y-4">
                    {session.is_external && session.description && (
                      <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl">
                        <p className="text-amber-800 text-[10px] font-black uppercase tracking-widest flex items-center mb-1">
                          <Info className="w-3 h-3 mr-1" />
                          External Announcement
                        </p>
                        <p className="text-amber-700 text-sm font-medium leading-relaxed">
                          {session.description}
                        </p>
                      </div>
                    )}
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center text-slate-500 font-medium">
                        <Calendar className="w-4 h-4 mr-2" />
                        {new Date(session.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div className="flex items-center text-indigo-600 font-bold">
                        <Users className="w-4 h-4 mr-2" />
                        {session.is_external ? 'External' : 'Active'}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {session.is_external ? (
                        <a
                          href={session.video_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 bg-amber-500 text-white py-3 rounded-xl font-bold hover:bg-amber-600 transition-all flex items-center justify-center space-x-2"
                        >
                          <ExternalLink className="w-4 h-4" />
                          <span>Join External Session</span>
                        </a>
                      ) : (
                        <>
                          <button
                            onClick={() => navigate(`/live/${session.room_id}`)}
                            className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all flex items-center justify-center space-x-2"
                          >
                            <Play className="w-4 h-4 fill-current" />
                            <span>Join Session</span>
                          </button>
                          {session.video_url && (
                            <a
                              href={session.video_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-3 bg-slate-50 text-slate-600 rounded-xl hover:bg-slate-100 transition-all"
                            >
                              <ExternalLink className="w-5 h-5" />
                            </a>
                          )}
                        </>
                      )}
                    </div>
                    {profile?.role === 'mentor' && session.mentor_id === user?.id && (
                      <button
                        onClick={() => endLiveSession(session.id)}
                        className="w-full py-2 text-red-600 font-bold text-xs hover:bg-red-50 rounded-lg transition-all"
                      >
                        End Session
                      </button>
                    )}
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </section>
      )}

      {/* Live Session Modal */}
      <AnimatePresence>
        {showLiveModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Start Live Session</h3>
                <button onClick={() => setShowLiveModal(false)} className="p-2 text-slate-400 hover:text-slate-600 rounded-xl transition-colors">
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
              <form onSubmit={startLiveSession} className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Session Title</label>
                    <input
                      type="text"
                      required
                      value={liveTitle}
                      onChange={(e) => setLiveTitle(e.target.value)}
                      placeholder="e.g., Advanced Robotics Workshop"
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-6 focus:outline-none focus:border-indigo-600 focus:bg-white transition-all font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Class Category</label>
                    <select
                      value={liveCategory}
                      onChange={(e) => setLiveCategory(e.target.value as any)}
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-6 focus:outline-none focus:border-indigo-600 focus:bg-white transition-all font-medium"
                    >
                      <option value="junior">Junior (Form 1 - 2)</option>
                      <option value="intermediate">Intermediate (Form 3 - 4)</option>
                      <option value="senior">Senior (Form 5 - 6)</option>
                      <option value="teachers">Teachers</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">External Video URL (Optional)</label>
                  <input
                    type="url"
                    value={liveVideoUrl}
                    onChange={(e) => setLiveVideoUrl(e.target.value)}
                    placeholder="https://youtube.com/live/..."
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-6 focus:outline-none focus:border-indigo-600 focus:bg-white transition-all font-medium"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Required Skills for Additional Mentors (Comma separated)</label>
                  <input
                    type="text"
                    value={liveSkills}
                    onChange={(e) => setLiveSkills(e.target.value)}
                    placeholder="e.g., Robotics, Python, Electronics"
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-6 focus:outline-none focus:border-indigo-600 focus:bg-white transition-all font-medium"
                  />
                </div>

                <div className="p-6 bg-slate-50 rounded-[2rem] border-2 border-slate-100 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900">External Session?</h4>
                      <p className="text-xs text-slate-500">Is this session taking place on another platform?</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsExternal(!isExternal)}
                      className={cn(
                        "w-12 h-6 rounded-full transition-all relative",
                        isExternal ? "bg-indigo-600" : "bg-slate-300"
                      )}
                    >
                      <div className={cn(
                        "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                        isExternal ? "left-7" : "left-1"
                      )} />
                    </button>
                  </div>

                  {isExternal && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="space-y-4 pt-2"
                    >
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Announcement / Platform Info</label>
                        <textarea
                          value={externalAnnouncement}
                          onChange={(e) => setExternalAnnouncement(e.target.value)}
                          placeholder="e.g., This session will be held on Zoom. Please join using the link below."
                          className="w-full bg-white border-2 border-slate-100 rounded-xl py-3 px-4 focus:outline-none focus:border-indigo-600 transition-all font-medium text-sm min-h-[80px] resize-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Invite / Platform Link</label>
                        <input
                          type="url"
                          required={isExternal}
                          value={externalLink}
                          onChange={(e) => setExternalLink(e.target.value)}
                          placeholder="https://zoom.us/j/..."
                          className="w-full bg-white border-2 border-slate-100 rounded-xl py-3 px-4 focus:outline-none focus:border-indigo-600 transition-all font-medium text-sm"
                        />
                      </div>
                    </motion.div>
                  )}
                </div>

                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => setShowLiveModal(false)}
                    className="px-8 py-4 rounded-2xl font-bold text-slate-600 hover:bg-slate-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !liveTitle.trim()}
                    className="bg-indigo-600 text-white px-10 py-4 rounded-2xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all flex items-center space-x-2 disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                      <>
                        <span>Start Session</span>
                        <Video className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Upload Modal */}
      <AnimatePresence>
        {showUploadModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Upload Study Material</h3>
                <button onClick={() => setShowUploadModal(false)} className="p-2 text-slate-400 hover:text-slate-600 rounded-xl transition-colors">
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
              <form onSubmit={handleUploadMaterial} className="p-8 space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Title</label>
                  <input
                    type="text"
                    required
                    value={uploadTitle}
                    onChange={(e) => setUploadTitle(e.target.value)}
                    placeholder="e.g., Intro to Robotics PDF"
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-6 focus:outline-none focus:border-indigo-600 focus:bg-white transition-all font-medium"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Description</label>
                  <textarea
                    value={uploadDescription}
                    onChange={(e) => setUploadDescription(e.target.value)}
                    placeholder="Briefly describe the content..."
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-6 focus:outline-none focus:border-indigo-600 focus:bg-white transition-all font-medium min-h-[100px] resize-none"
                  />
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Resource URL (Optional)</label>
                    <input
                      type="url"
                      value={uploadUrl}
                      onChange={(e) => setUploadUrl(e.target.value)}
                      placeholder="https://example.com/resource"
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-6 focus:outline-none focus:border-indigo-600 focus:bg-white transition-all font-medium"
                    />
                  </div>
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-100"></div>
                    </div>
                    <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-bold">
                      <span className="bg-white px-4 text-slate-400">Or Upload File</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">File</label>
                    <input
                      type="file"
                      onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                      className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => setShowUploadModal(false)}
                    className="px-8 py-4 rounded-2xl font-bold text-slate-600 hover:bg-slate-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading || (!uploadFile && !uploadUrl.trim())}
                    className="bg-indigo-600 text-white px-10 py-4 rounded-2xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all flex items-center space-x-2 disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                      <>
                        <span>Upload</span>
                        <Send className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {isRequesting && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Request Mentorship</h3>
                <button onClick={() => setIsRequesting(null)} className="p-2 text-slate-400 hover:text-slate-600 rounded-xl transition-colors">
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
              <div className="p-8 space-y-6">
                <p className="text-slate-600 font-medium leading-relaxed">
                  Briefly explain why you're seeking mentorship and what you hope to achieve.
                </p>
                <textarea
                  value={requestMessage}
                  onChange={(e) => setRequestMessage(e.target.value)}
                  placeholder="I'm working on a robotics project and need guidance on..."
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-6 focus:outline-none focus:border-indigo-600 focus:bg-white transition-all font-medium min-h-[150px] resize-none"
                />
                <div className="flex justify-end space-x-4">
                  <button
                    onClick={() => setIsRequesting(null)}
                    className="px-8 py-4 rounded-2xl font-bold text-slate-600 hover:bg-slate-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleRequest(isRequesting)}
                    disabled={loading || !requestMessage.trim()}
                    className="bg-indigo-600 text-white px-10 py-4 rounded-2xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all flex items-center space-x-2 disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                      <>
                        <span>Send Request</span>
                        <Send className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Review Modal */}
      <AnimatePresence>
        {isReviewing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Rate Your Mentor</h3>
                <button onClick={() => setIsReviewing(null)} className="p-2 text-slate-400 hover:text-slate-600 rounded-xl transition-colors">
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
              <div className="p-8 space-y-6">
                <div className="flex justify-center space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setReviewRating(star)}
                      className={cn(
                        "p-2 rounded-xl transition-all",
                        reviewRating >= star ? "text-amber-400 bg-amber-50" : "text-slate-300 bg-slate-50"
                      )}
                    >
                      <Star className={cn("w-10 h-10", reviewRating >= star && "fill-amber-400")} />
                    </button>
                  ))}
                </div>
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="How was your session? What did you learn?"
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-6 focus:outline-none focus:border-indigo-600 focus:bg-white transition-all font-medium min-h-[120px] resize-none"
                />
                <div className="flex justify-end space-x-4">
                  <button
                    onClick={() => setIsReviewing(null)}
                    className="px-8 py-4 rounded-2xl font-bold text-slate-600 hover:bg-slate-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmitReview}
                    disabled={loading || !reviewComment.trim()}
                    className="bg-amber-500 text-white px-10 py-4 rounded-2xl font-bold shadow-lg shadow-amber-100 hover:bg-amber-600 hover:-translate-y-0.5 transition-all flex items-center space-x-2 disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                      <>
                        <span>Submit Review</span>
                        <Star className="w-5 h-5 fill-white" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
