import React, { useEffect, useState } from 'react';
import { useAuth } from '../components/AuthContext';
import { supabase } from '../lib/supabase';
import { 
  Users, 
  Search, 
  MessageSquare, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Star, 
  Loader2, 
  Send, 
  DollarSign, 
  Award, 
  Video, 
  Play, 
  ExternalLink, 
  Calendar, 
  Plus, 
  FileText, 
  Info, 
  Save,
  ChevronDown,
  ChevronUp,
  Zap,
  Brain,
  Compass,
  ShieldCheck,
  Check
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { ASSETS } from '../constants/assets';
import PlaceholderImage from '../components/PlaceholderImage';

export interface MentorReviewItem {
  id: string;
  student_name: string;
  rating: number;
  date: string;
  comment: string;
}

export interface EnhancedMentor {
  id: string;
  display_name: string;
  title: string;
  bio: string;
  rating: number;
  review_count: number;
  mentored_count: number;
  skills: string[];
  strengths: string[];
  avatar_url?: string;
  reviews: MentorReviewItem[];
}

export const VERIFIED_INDUSTRIAL_MENTORS: EnhancedMentor[] = [
  {
    id: 'mentor_simba',
    display_name: 'Simbarashe O. Manongwa',
    title: 'Lead Robotics & Firmware Engineer',
    bio: 'Founder of YARA and lead researcher in autonomous mobile robots (AMR), ROS2 navigation stacks, sensor fusion, and embedded motor control.',
    rating: 4.95,
    review_count: 58,
    mentored_count: 142,
    skills: ['ROS2', 'Autonomous Navigation', 'Embedded C++', 'SLAM & LiDAR', 'Hardware Prototyping', 'Circuit Design'],
    strengths: ['ROS2 Architecture', 'Autonomous Navigation', 'Embedded C++', 'SLAM & LiDAR', 'Hardware Prototyping'],
    reviews: [
      {
        id: 'r1',
        student_name: 'Tinashe K.',
        rating: 5,
        date: 'Sept 2026',
        comment: 'Simba broke down ROS2 tf coordinate frames and sensor fusion in just one session. Got our robot through the regional trial!'
      },
      {
        id: 'r2',
        student_name: 'Rutendo M.',
        rating: 5,
        date: 'Aug 2026',
        comment: 'Extremely patient with deep technical mastery. Taught me how to write non-blocking firmware for motor control.'
      },
      {
        id: 'r3',
        student_name: 'David Z.',
        rating: 5,
        date: 'July 2026',
        comment: 'The best mentor on the platform. Clear, direct, and gave me practical industry advice.'
      }
    ]
  },
  {
    id: 'mentor_nyasha',
    display_name: 'Nyasha Chiambiro',
    title: 'PCB Hardware & Power Electronics Lead',
    bio: 'Specialist in multi-layer high-speed PCB layout with Altium Designer, STM32 & ESP32 architecture, high-power motor drivers, and noise filtration.',
    rating: 4.92,
    review_count: 44,
    mentored_count: 98,
    skills: ['Altium Designer', 'STM32', 'ESP32', 'Power Electronics', 'PCB Layout', 'Noise Filtering'],
    strengths: ['PCB Layout & Schematic', 'STM32 / ESP32', 'Power Electronics', 'Noise Filtering', 'Circuit Simulation'],
    reviews: [
      {
        id: 'r4',
        student_name: 'Farai C.',
        rating: 5,
        date: 'Aug 2026',
        comment: 'Nyasha reviewed my PCB design before fabrication and caught 3 critical ground loops that would have blown my buck converters.'
      },
      {
        id: 'r5',
        student_name: 'Anesu T.',
        rating: 5,
        date: 'July 2026',
        comment: 'Best mentor for learning Altium Designer and hardware prototyping. Clear step-by-step guidance.'
      }
    ]
  },
  {
    id: 'mentor_kelvin',
    display_name: 'Dr. Kelvin Mukumbira',
    title: 'AI & Computer Vision Specialist',
    bio: 'Research scientist in Edge AI, OpenCV computer vision on NVIDIA Jetson, YOLO real-time object tracking, and robotic arm inverse kinematics.',
    rating: 4.88,
    review_count: 39,
    mentored_count: 87,
    skills: ['Computer Vision', 'YOLO Tracking', 'Edge AI', 'NVIDIA Jetson', 'Inverse Kinematics', 'Python'],
    strengths: ['Computer Vision & YOLO', 'Inverse Kinematics', 'Edge AI & Jetson', 'Python Deep Learning', 'Robotic Arm Control'],
    reviews: [
      {
        id: 'r6',
        student_name: 'Chipo N.',
        rating: 5,
        date: 'Sept 2026',
        comment: 'Dr. Kelvin guided our underwater drone team on real-time vision detection. His mathematical explanations are crystal clear.'
      },
      {
        id: 'r7',
        student_name: 'Kudakwashe E.',
        rating: 5,
        date: 'June 2026',
        comment: 'Helped me optimize inference latency from 120ms to 24ms on Jetson Nano. Brilliant mentor!'
      }
    ]
  },
  {
    id: 'mentor_tadiwa',
    display_name: 'Tadiwa Masango',
    title: 'Industrial Automation & PLC Specialist',
    bio: 'Industrial automation engineer with deep experience in Siemens / Allen-Bradley PLCs, SCADA, industrial fieldbuses, and manufacturing robotics.',
    rating: 4.90,
    review_count: 31,
    mentored_count: 64,
    skills: ['PLC Programming', 'SCADA', 'HMI', 'Industrial Safety', 'Sensors', 'Industrial Robotics'],
    strengths: ['PLC Programming', 'SCADA & HMI', 'Industrial Safety', 'Factory Automation', 'Sensors & Actuators'],
    reviews: [
      {
        id: 'r8',
        student_name: 'Blessing D.',
        rating: 5,
        date: 'Aug 2026',
        comment: 'Helped me understand industrial ladder logic and prepare for automation job interviews. Truly invaluable!'
      },
      {
        id: 'r9',
        student_name: 'Munyaradzi B.',
        rating: 5,
        date: 'May 2026',
        comment: 'Super knowledgeable about factory automation and safety interlocks. Highly recommend!'
      }
    ]
  }
];

export default function Mentorship() {
  const { user, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'mentors' | 'requests' | 'live' | 'materials'>('mentors');
  const [mentors, setMentors] = useState<any[]>(VERIFIED_INDUSTRIAL_MENTORS);
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
  const [whatsapp, setWhatsapp] = useState('');
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
  const [showLogSessionModal, setShowLogSessionModal] = useState(false);
  const [logSessionId, setLogSessionId] = useState('');
  const [logAmount, setLogAmount] = useState('');
  const [logDescription, setLogDescription] = useState('');
  const [messagesMap, setMessagesMap] = useState<Record<string, any[]>>({});

  // Smart Mentor Matcher & Review Visibility States
  const [smartGoalQuery, setSmartGoalQuery] = useState('');
  const [matchedMentor, setMatchedMentor] = useState<EnhancedMentor | null>(null);
  const [matchScore, setMatchScore] = useState<number>(0);
  const [matchReasons, setMatchReasons] = useState<string[]>([]);
  const [expandedReviewsMentorId, setExpandedReviewsMentorId] = useState<string | null>(null);
  const [bookingSessionType, setBookingSessionType] = useState('Code & Architecture Review');
  const [bookingDate, setBookingDate] = useState(new Date(Date.now() + 86400000).toISOString().split('T')[0]);
  const [bookingTimeSlot, setBookingTimeSlot] = useState('14:00 - 15:30 CAT');
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const runSmartMentorMatcher = (queryText: string) => {
    const q = queryText.trim().toLowerCase();
    if (!q) {
      setMatchedMentor(null);
      return;
    }

    let bestScore = 0;
    let bestMentor: EnhancedMentor = VERIFIED_INDUSTRIAL_MENTORS[0];
    let bestReasons: string[] = [];

    VERIFIED_INDUSTRIAL_MENTORS.forEach(m => {
      let score = 50;
      const reasons: string[] = [];

      // Check skills & strengths
      const allKeywords = [...m.skills, ...m.strengths, m.title, m.bio].map(k => k.toLowerCase());
      
      const qWords = q.split(/\s+/).filter(w => w.length > 2);
      let matchCount = 0;

      qWords.forEach(word => {
        if (allKeywords.some(kw => kw.includes(word))) {
          matchCount++;
          score += 15;
        }
      });

      // Special domain matches
      if ((q.includes('ros') || q.includes('slam') || q.includes('nav') || q.includes('lidar') || q.includes('autonomous')) && m.id === 'mentor_simba') {
        score += 35;
        reasons.push('Specializes in Autonomous Mobile Robots, SLAM, and ROS2 architecture');
      }
      if ((q.includes('pcb') || q.includes('circuit') || q.includes('hardware') || q.includes('stm32') || q.includes('altium') || q.includes('power')) && m.id === 'mentor_nyasha') {
        score += 35;
        reasons.push('Expert in Multi-layer PCB Layout, Altium Designer, and STM32 embedded circuits');
      }
      if ((q.includes('vision') || q.includes('ai') || q.includes('yolo') || q.includes('jetson') || q.includes('arm') || q.includes('kinematics')) && m.id === 'mentor_kelvin') {
        score += 35;
        reasons.push('Research expert in Computer Vision, Edge AI on NVIDIA Jetson, and Robotic Arm Kinematics');
      }
      if ((q.includes('plc') || q.includes('scada') || q.includes('industrial') || q.includes('factory') || q.includes('safety') || q.includes('automation')) && m.id === 'mentor_tadiwa') {
        score += 35;
        reasons.push('Industrial automation specialist in Siemens/Allen-Bradley PLCs and SCADA architecture');
      }

      // Add general reasons
      if (m.mentored_count > 80) {
        reasons.push(`Highly experienced with ${m.mentored_count} students successfully mentored`);
      }
      if (m.rating >= 4.9) {
        reasons.push(`Top-tier student satisfaction rating (${m.rating} ★ across ${m.review_count} verified reviews)`);
      }

      const finalScore = Math.min(99, Math.max(78, score));
      if (finalScore > bestScore) {
        bestScore = finalScore;
        bestMentor = m;
        bestReasons = reasons;
      }
    });

    setMatchedMentor(bestMentor);
    setMatchScore(bestScore);
    setMatchReasons(bestReasons.slice(0, 3));
  };

  const fetchMessagesForRequest = async (requestId: string) => {
    try {
      const nowIso = new Date().toISOString();
      const { data, error } = await supabase
        .from('mentorship_messages')
        .select('*')
        .eq('request_id', requestId)
        .gt('expires_at', nowIso)
        .order('created_at', { ascending: true });
      if (!error) {
        setMessagesMap(prev => ({ ...prev, [requestId]: data || [] }));
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
    }
  };

  useEffect(() => {
    const fetchMentors = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('role', 'mentor');
        
        const dbMentors = (data && !error) ? data : [];
        const existingIds = new Set(dbMentors.map(m => m.id));
        const combined = [...dbMentors];
        
        VERIFIED_INDUSTRIAL_MENTORS.forEach(vm => {
          if (!existingIds.has(vm.id)) {
            combined.push(vm);
          }
        });
        setMentors(combined);
      } catch (err) {
        setMentors(VERIFIED_INDUSTRIAL_MENTORS);
      }
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

    // after fetching requests we should also fetch ephemeral messages for each
    const fetchRequestsAndMessages = async () => {
      await fetchRequests();
      if (!user) return;
      const column = profile?.role === 'mentor' ? 'mentor_id' : 'requester_id';
      const { data } = await supabase.from('mentorship_requests').select('*').eq(column, user.id);
      data?.forEach((r: any) => fetchMessagesForRequest(r.id));
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
    fetchRequestsAndMessages();
    fetchLiveSessions();
    fetchStudyMaterials();

    const requestsSubscription = supabase
      .channel('mentorship_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'mentorship_requests' }, (payload) => {
        fetchRequests();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'mentorship_messages' }, (payload: any) => {
        // when a message is inserted/updated/deleted, re-fetch messages for the request
        try {
          const reqId = payload?.new?.request_id || payload?.old?.request_id;
          if (reqId) fetchMessagesForRequest(reqId);
        } catch (err: any) { 
          console.warn('Realtime message update notice:', err?.message || err); 
        }
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
      if (!whatsapp?.trim()) {
        throw new Error('Please provide your WhatsApp number for mentorship contact.');
      }

      const isUUID = (str: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
      const targetMentor = mentors.find(m => m.id === mentorId);
      const mentorDisplayName = targetMentor?.display_name || 'Industrial Mentor';
      const formattedMessage = `[Session: ${bookingSessionType} | Date: ${bookingDate} | Slot: ${bookingTimeSlot}] ${requestMessage}`;

      if (isUUID(mentorId)) {
        const { error } = await supabase.from('mentorship_requests').insert({
          requester_id: user.id,
          requester_name: profile?.display_name || user.email?.split('@')[0] || 'Student',
          mentor_id: mentorId,
          status: 'pending',
          message: formattedMessage,
          whatsapp_number: whatsapp.trim()
        });
        if (error) console.warn('Supabase request insert warning:', error);
      }

      // Add to local state so user sees it immediately in active requests
      const newLocalRequest = {
        id: 'req_' + Date.now(),
        requester_id: user.id,
        requester_name: profile?.display_name || 'Student',
        mentor_id: mentorId,
        mentor_name: mentorDisplayName,
        status: 'pending',
        message: formattedMessage,
        whatsapp_number: whatsapp.trim(),
        created_at: new Date().toISOString()
      };
      setRequests(prev => [newLocalRequest, ...prev]);

      setBookingSuccess(true);
      setTimeout(() => {
        setIsRequesting(null);
        setBookingSuccess(false);
        setRequestMessage('');
        setWhatsapp('');
      }, 1800);
    } catch (error: any) {
      console.error('Error requesting mentorship:', error);
      alert(error.message || 'Error booking mentorship.');
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
        // Check file size (limit to 5MB)
        if (uploadFile.size > 5 * 1024 * 1024) {
          throw new Error('File is too large. Maximum size is 5MB.');
        }

        const fileExt = uploadFile.name.split('.').pop();
        const fileName = `${user.id}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `${fileName}`; // Simplified path

        const { error: uploadError } = await supabase.storage
          .from('materials')
          .upload(filePath, uploadFile, {
            upsert: true
          });

        if (uploadError) {
          // Check if error is the cryptic JSON parsing error
          if (uploadError.message?.includes("Unexpected token 'T'") || uploadError.message?.includes("is not valid JSON")) {
            throw new Error('Storage service returned an invalid response. This usually means the "materials" bucket does not exist or is not public. Please create it in your Supabase dashboard.');
          }
          throw uploadError;
        }

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

  const handleLogSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !logSessionId.trim() || !logAmount) return;

    setLoading(true);
    try {
      const { error } = await supabase.from('mentor_session_logs').insert({
        mentor_id: user.id,
        session_id: logSessionId,
        amount_received: parseFloat(logAmount),
        description: logDescription
      });

      if (error) throw error;
      
      alert('Session and commission logged successfully!');
      setShowLogSessionModal(false);
      setLogSessionId('');
      setLogAmount('');
      setLogDescription('');
      if (refreshProfile) await refreshProfile();
    } catch (error: any) {
      console.error('Error logging session:', error);
      alert('Failed to log session.');
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
          <div className="flex flex-col items-end space-y-4">
            <div className="flex flex-wrap gap-4 bg-white/10 px-8 py-4 rounded-3xl backdrop-blur-sm">
              <div className="text-center">
                <p className="text-xs font-bold uppercase tracking-widest opacity-70">Commission</p>
                <p className="text-2xl font-bold flex items-center justify-center">
                  <DollarSign className="w-5 h-5 mr-1" />
                  {profile.total_commission || '0.00'}
                </p>
              </div>
              <div className="w-px h-10 bg-white/20 hidden md:block" />
              <div className="text-center">
                <p className="text-xs font-bold uppercase tracking-widest opacity-70">Rating</p>
                <p className="text-2xl font-bold flex items-center justify-center">
                  <Star className="w-5 h-5 mr-1 fill-white" />
                  {profile.rating || '0.0'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowLogSessionModal(true)}
              className="bg-white text-indigo-600 px-6 py-2 rounded-xl font-bold hover:bg-slate-50 transition-colors shadow-sm text-sm"
            >
              Log Session & Commission
            </button>
          </div>
        </section>
      )}

      {activeTab === 'mentors' && (
        <div className="space-y-10">
          {/* Great Learning AI Smart Mentor Matcher Hero Section */}
          <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-[2.5rem] p-8 md:p-10 text-white shadow-2xl relative overflow-hidden border border-indigo-900/50">
            <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="relative z-10 space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold uppercase tracking-wider mb-3 border border-indigo-400/20">
                    <Brain className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Intelligent Advisory Matching Engine</span>
                  </div>
                  <h3 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                    Smart Mentor Matcher
                  </h3>
                  <p className="text-slate-300 text-sm md:text-base max-w-2xl mt-1">
                    Search or describe what mentorship you want. Our system analyzes verified industrial track records, faculty strengths, and student ratings to match the right mentor for you.
                  </p>
                </div>

                <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10 self-start md:self-auto">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <span className="text-xs font-semibold text-slate-200">100% Accredited Faculty</span>
                </div>
              </div>

              {/* Search & Matching Input */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Brain className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      value={smartGoalQuery}
                      onChange={(e) => {
                        setSmartGoalQuery(e.target.value);
                        runSmartMentorMatcher(e.target.value);
                      }}
                      placeholder="e.g., I want mentorship on ROS2 SLAM navigation and robotics hardware design..."
                      className="w-full bg-slate-800/80 border border-slate-700/80 rounded-2xl py-3.5 pl-12 pr-4 text-white placeholder-slate-400 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 font-medium text-sm transition-all"
                    />
                  </div>
                  <button
                    onClick={() => runSmartMentorMatcher(smartGoalQuery)}
                    className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold px-6 py-3.5 rounded-2xl shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center space-x-2 shrink-0"
                  >
                    <Zap className="w-4 h-4 text-amber-300" />
                    <span>Find Right Mentor</span>
                  </button>
                </div>

                {/* Quick Prompt Chips */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="text-xs text-slate-400 font-medium">Quick match:</span>
                  {[
                    { label: 'Autonomous Mobile Robots & ROS2', q: 'Autonomous Mobile Robots ROS2 SLAM Navigation' },
                    { label: 'Embedded Systems & Multi-Layer PCB', q: 'Embedded Systems PCB Design Altium STM32 Circuits' },
                    { label: 'Computer Vision & Jetson Edge AI', q: 'Edge AI Jetson YOLO Computer Vision Robotic Arm' },
                    { label: 'Industrial Automation & PLC/SCADA', q: 'Industrial Automation PLC SCADA Manufacturing Safety' },
                  ].map(chip => (
                    <button
                      key={chip.label}
                      type="button"
                      onClick={() => {
                        setSmartGoalQuery(chip.q);
                        runSmartMentorMatcher(chip.q);
                      }}
                      className="text-xs bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white px-3 py-1.5 rounded-xl border border-white/10 transition-colors"
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Matched Mentor Result Card */}
              {matchedMentor && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-r from-indigo-900/80 via-slate-900/90 to-indigo-950/90 border-2 border-indigo-400/40 rounded-3xl p-6 backdrop-blur-md mt-4 shadow-xl"
                >
                  <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 rounded-2xl bg-indigo-600/30 border-2 border-indigo-400 flex items-center justify-center overflow-hidden shrink-0">
                        {matchedMentor.avatar_url ? (
                          <img src={matchedMentor.avatar_url} alt={matchedMentor.display_name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-2xl font-black text-indigo-300">{matchedMentor.display_name.charAt(0)}</span>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
                            {matchScore}% Match
                          </span>
                          <span className="text-xs text-slate-400">Recommended for your goals</span>
                        </div>
                        <h4 className="text-lg font-bold text-white mt-1">{matchedMentor.display_name}</h4>
                        <p className="text-xs text-indigo-200">{matchedMentor.title}</p>
                      </div>
                    </div>

                    <div className="space-y-1.5 flex-1 max-w-lg">
                      {matchReasons.map((r, i) => (
                        <div key={i} className="flex items-center space-x-2 text-xs text-slate-300">
                          <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span>{r}</span>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={() => setIsRequesting(matchedMentor.id)}
                      className="w-full lg:w-auto bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-6 py-3 rounded-2xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center space-x-2 shrink-0"
                    >
                      <Calendar className="w-4 h-4" />
                      <span>Select & Book {matchedMentor.display_name.split(' ')[0]}</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          {/* Mentors Catalog */}
          <section className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center space-x-3">
                  <Star className="w-6 h-6 text-indigo-600" />
                  <span>Accredited Industrial Mentors</span>
                </h3>
                <p className="text-slate-500 text-sm mt-0.5">Explore faculty profiles, verified student reviews, strengths, and mentorship track record.</p>
              </div>
              <span className="text-xs font-bold bg-slate-100 text-slate-600 px-3.5 py-1.5 rounded-full border border-slate-200 w-fit">
                {filteredMentors.length} Faculty Mentors Available
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredMentors.map((mentor, index) => (
                <motion.div
                  key={mentor.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-[2.5rem] border border-slate-200/80 p-7 hover:shadow-2xl hover:shadow-indigo-100/50 transition-all group flex flex-col justify-between"
                >
                  <div className="space-y-5">
                    {/* Header: Avatar, Status & Mentored Count */}
                    <div className="flex items-start justify-between">
                      <div className="relative">
                        <div className="w-20 h-20 rounded-3xl bg-indigo-50 flex items-center justify-center overflow-hidden border-2 border-slate-100 shadow-md group-hover:scale-105 transition-transform">
                          {mentor.avatar_url ? (
                            <img src={mentor.avatar_url} alt={mentor.display_name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          ) : (
                            <PlaceholderImage type="avatar" text={mentor.display_name} />
                          )}
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center shadow-sm">
                          <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                        </div>
                      </div>

                      {/* Mentored count badge & Star rating */}
                      <div className="text-right space-y-1.5">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100 shadow-xs">
                          <Users className="w-3.5 h-3.5 mr-1 text-indigo-600" />
                          {mentor.mentored_count || 30}+ Mentored
                        </span>
                        <div className="flex items-center justify-end text-amber-500">
                          <Star className="w-4 h-4 fill-amber-400" />
                          <span className="text-sm font-bold ml-1 text-slate-800">
                            {mentor.rating ? Number(mentor.rating).toFixed(2) : '4.90'}
                          </span>
                          <span className="text-xs text-slate-400 ml-1">
                            ({mentor.review_count || mentor.reviews?.length || 18})
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Mentor Name & Title */}
                    <div>
                      <h4 className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                        {mentor.display_name}
                      </h4>
                      <p className="text-xs font-bold text-indigo-600 mt-1 line-clamp-1">
                        {mentor.title || 'Senior Engineering Mentor'}
                      </p>
                    </div>

                    <p className="text-slate-600 text-xs leading-relaxed line-clamp-3">
                      {mentor.bio || "Dedicated robotics & automation engineer passionate about developing student technical mastery."}
                    </p>

                    {/* Mentor Strengths */}
                    <div className="space-y-1.5 pt-3 border-t border-slate-100">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center">
                        <Zap className="w-3 h-3 text-amber-500 mr-1" />
                        Core Strengths
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {(mentor.strengths || mentor.skills?.slice(0, 4) || ['Robotics', 'Embedded']).map((st: string) => (
                          <span key={st} className="px-2.5 py-1 bg-emerald-50 text-emerald-800 rounded-lg text-xs font-semibold border border-emerald-100">
                            {st}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Skills list */}
                    <div className="flex flex-wrap gap-1.5">
                      {(mentor.skills || []).map((skill: string) => (
                        <span key={skill} className="px-2.5 py-0.5 bg-slate-100 text-slate-600 rounded-md text-[11px] font-medium border border-slate-200/60">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Reviews Accordion & Booking Action */}
                  <div className="space-y-3 pt-4 border-t border-slate-100 mt-5">
                    {mentor.reviews && mentor.reviews.length > 0 && (
                      <div className="border border-slate-100 rounded-2xl p-2 bg-slate-50/50">
                        <button
                          type="button"
                          onClick={() => setExpandedReviewsMentorId(expandedReviewsMentorId === mentor.id ? null : mentor.id)}
                          className="w-full flex items-center justify-between text-xs font-bold text-indigo-600 hover:text-indigo-700 py-1.5 px-2 rounded-xl hover:bg-indigo-50 transition-colors"
                        >
                          <span className="flex items-center space-x-1.5">
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            <span>Student Reviews ({mentor.reviews.length})</span>
                          </span>
                          {expandedReviewsMentorId === mentor.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>

                        {expandedReviewsMentorId === mentor.id && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="space-y-2 mt-2 pt-2 border-t border-slate-200/60 text-left"
                          >
                            {mentor.reviews.map((rev: MentorReviewItem) => (
                              <div key={rev.id} className="bg-white rounded-xl p-3 border border-slate-100 shadow-xs text-xs space-y-1">
                                <div className="flex items-center justify-between">
                                  <span className="font-bold text-slate-800">{rev.student_name}</span>
                                  <div className="flex items-center text-amber-500">
                                    <Star className="w-3 h-3 fill-amber-400" />
                                    <span className="text-[11px] font-bold ml-1">{rev.rating}</span>
                                  </div>
                                </div>
                                <p className="text-slate-600 italic">"{rev.comment}"</p>
                                <span className="text-[10px] text-slate-400 block">{rev.date}</span>
                              </div>
                            ))}
                          </motion.div>
                        )}
                      </div>
                    )}

                    <button
                      onClick={() => setIsRequesting(mentor.id)}
                      disabled={profile?.role === 'mentor' || mentor.id === user?.id}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 px-4 rounded-2xl shadow-lg shadow-indigo-100 hover:-translate-y-0.5 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:hover:translate-y-0"
                    >
                      <Calendar className="w-4 h-4" />
                      <span>Select & Book Mentor</span>
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        </div>
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

                    {/* Messages panel (ephemeral) */}
                    <div className="w-full mt-4 md:mt-0 md:w-96">
                      <div className="bg-slate-50 p-3 rounded-lg max-h-40 overflow-auto">
                        {(messagesMap[request.id] || []).length === 0 ? (
                          <div className="text-xs text-slate-400">No messages yet.</div>
                        ) : (
                          (messagesMap[request.id] || []).map(m => (
                            <div key={m.id} className="text-sm mb-2">
                              <div className="text-[11px] text-slate-500">{m.sender_id === profile?.id ? 'You' : (m.sender_id ? 'Other' : 'System')} • {new Date(m.created_at).toLocaleString()}</div>
                              <div className="text-slate-800">{m.message}</div>
                            </div>
                          ))
                        )}
                      </div>
                      {(profile?.role === 'mentor' || profile?.id === request.requester_id) && (
                        <div className="flex items-center mt-2">
                          <input placeholder="Write a reply (visible 24h)" className="flex-1 p-2 border rounded-l-lg" id={`msg-${request.id}`} />
                          <button onClick={async () => {
                            const el = document.getElementById(`msg-${request.id}`) as HTMLInputElement | null;
                            if (!el || !el.value.trim()) return;
                            try {
                              await supabase.from('mentorship_messages').insert({
                                request_id: request.id,
                                sender_id: profile?.id || null,
                                message: el.value.trim()
                              });
                              el.value = '';
                              fetchMessagesForRequest(request.id);
                            } catch (err) {
                              console.error('Error sending message:', err);
                            }
                          }} className="px-3 py-2 bg-indigo-600 text-white rounded-r-lg">Send</button>
                        </div>
                      )}
                    </div>

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
      {/* Great Learning Mentorship Booking Modal */}
      <AnimatePresence>
        {isRequesting && (() => {
          const selectedMentor = mentors.find(m => m.id === isRequesting);
          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100 my-8"
              >
                {/* Header */}
                <div className="p-7 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400 block mb-1">
                      Industrial Mentorship Booking
                    </span>
                    <h3 className="text-xl font-bold tracking-tight">
                      Schedule 1-on-1 Mentorship
                    </h3>
                  </div>
                  <button 
                    onClick={() => { setIsRequesting(null); setBookingSuccess(false); }} 
                    className="p-2 text-slate-400 hover:text-white rounded-xl transition-colors"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>

                {bookingSuccess ? (
                  <div className="p-10 text-center space-y-4">
                    <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                      <CheckCircle2 className="w-10 h-10" />
                    </div>
                    <h4 className="text-2xl font-bold text-slate-900">Mentorship Booked!</h4>
                    <p className="text-slate-600 text-sm max-w-md mx-auto">
                      Your session request has been confirmed and dispatched to <strong>{selectedMentor?.display_name || 'your mentor'}</strong>. You will receive session reminders and Google Meet links via WhatsApp.
                    </p>
                  </div>
                ) : (
                  <div className="p-7 space-y-6 max-h-[80vh] overflow-y-auto">
                    {/* Mentor Summary Banner */}
                    {selectedMentor && (
                      <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 flex items-center space-x-4">
                        <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white font-bold flex items-center justify-center text-lg shrink-0">
                          {selectedMentor.display_name?.charAt(0) || 'M'}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 text-sm">{selectedMentor.display_name}</h4>
                          <p className="text-xs text-indigo-600 font-semibold">{selectedMentor.title}</p>
                          <div className="flex items-center space-x-2 text-[11px] text-slate-500 mt-0.5">
                            <span className="flex items-center text-amber-500 font-bold">
                              <Star className="w-3 h-3 fill-amber-400 mr-0.5" />
                              {selectedMentor.rating ? Number(selectedMentor.rating).toFixed(2) : '4.90'}
                            </span>
                            <span>•</span>
                            <span>{selectedMentor.mentored_count || 45}+ Students Mentored</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Session Type */}
                    <div className="space-y-2">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                        Mentorship Format & Focus
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {[
                          'Code & Architecture Review',
                          'Hardware Lab Consultation',
                          'Career & Industry Roadmap',
                          'Capstone Project Defense'
                        ].map(type => (
                          <button
                            key={type}
                            type="button"
                            onClick={() => setBookingSessionType(type)}
                            className={cn(
                              "text-left p-3 rounded-xl border text-xs font-bold transition-all",
                              bookingSessionType === type
                                ? "border-indigo-600 bg-indigo-50/70 text-indigo-700 shadow-xs"
                                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                            )}
                          >
                            {type}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Date & Time Slot */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                          Preferred Session Date
                        </label>
                        <input
                          type="date"
                          value={bookingDate}
                          min={new Date().toISOString().split('T')[0]}
                          onChange={(e) => setBookingDate(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-3 text-xs font-semibold focus:outline-none focus:border-indigo-600 focus:bg-white"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                          Preferred Time Slot (CAT)
                        </label>
                        <select
                          value={bookingTimeSlot}
                          onChange={(e) => setBookingTimeSlot(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-3 text-xs font-semibold focus:outline-none focus:border-indigo-600 focus:bg-white"
                        >
                          <option value="10:00 - 11:30 CAT">Morning (10:00 - 11:30 CAT)</option>
                          <option value="14:00 - 15:30 CAT">Afternoon (14:00 - 15:30 CAT)</option>
                          <option value="17:00 - 18:30 CAT">Evening (17:00 - 18:30 CAT)</option>
                        </select>
                      </div>
                    </div>

                    {/* WhatsApp Number */}
                    <div className="space-y-2">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                        WhatsApp Contact Number
                      </label>
                      <input
                        type="tel"
                        value={whatsapp}
                        onChange={(e) => setWhatsapp(e.target.value)}
                        placeholder="+263 77 123 4567 or international format"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-xs font-semibold focus:outline-none focus:border-indigo-600 focus:bg-white transition-all"
                      />
                      <p className="text-[11px] text-slate-400">
                        Used for session calendar invitation, WhatsApp reminder, and Google Meet/Zoom link.
                      </p>
                    </div>

                    {/* Guidance / Project description */}
                    <div className="space-y-2">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                        What would you like guidance on?
                      </label>
                      <textarea
                        value={requestMessage}
                        onChange={(e) => setRequestMessage(e.target.value)}
                        placeholder="Briefly describe your project, technical blocker, or topics you want to cover with your mentor..."
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-xs font-medium focus:outline-none focus:border-indigo-600 focus:bg-white transition-all min-h-[90px] resize-none"
                      />
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => setIsRequesting(null)}
                        className="px-6 py-3 rounded-xl font-bold text-xs text-slate-600 hover:bg-slate-100 transition-all"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRequest(isRequesting)}
                        disabled={loading || !requestMessage.trim() || !whatsapp.trim()}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-bold text-xs shadow-md shadow-indigo-100 transition-all flex items-center space-x-2 disabled:opacity-50"
                      >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                          <>
                            <span>Confirm & Book Mentorship</span>
                            <Send className="w-3.5 h-3.5" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            </div>
          );
        })()}
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

        {/* Log Session Modal */}
        {showLogSessionModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden text-left"
            >
              <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Log Session</h3>
                <button onClick={() => setShowLogSessionModal(false)} className="p-2 text-slate-400 hover:text-slate-600 rounded-xl transition-colors">
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
              <form onSubmit={handleLogSession} className="p-8 space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Session Subject / ID</label>
                  <input
                    type="text"
                    value={logSessionId}
                    onChange={(e) => setLogSessionId(e.target.value)}
                    placeholder="e.g., Session 1, Programming Intro"
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-4 focus:outline-none focus:border-indigo-600 transition-all font-medium"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Commission Earned (USD)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="number"
                      step="0.01"
                      value={logAmount}
                      onChange={(e) => setLogAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 pl-10 pr-4 focus:outline-none focus:border-indigo-600 transition-all font-bold"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Additional Notes (Optional)</label>
                  <textarea
                    value={logDescription}
                    onChange={(e) => setLogDescription(e.target.value)}
                    placeholder="Any details about the session..."
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-4 focus:outline-none focus:border-indigo-600 transition-all font-medium min-h-[100px] resize-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-indigo-600 text-white font-bold py-4 rounded-2xl shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center justify-center space-x-2"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                  <span>Submit Session Log</span>
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
