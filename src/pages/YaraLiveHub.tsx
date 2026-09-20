import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';
import { supabase } from '../lib/supabase';
import { 
  Radio, Video, Mic, MicOff, VideoOff, Monitor, Send, Users, 
  Sparkles, Calendar, Clock, Plus, Play, Shield, MessageSquare, 
  HelpCircle, Hand, AlertCircle, CheckCircle2, Copy, Share2, Volume2, VolumeX, Eye
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LiveSession {
  id: string;
  room_id: string;
  title: string;
  description: string;
  mentor_name: string;
  mentor_id: string;
  status: 'upcoming' | 'live' | 'ended';
  is_approved: boolean;
  scheduled_at: string;
  student_count: number;
  stream_url?: string;
  created_at: string;
}

interface ChatMessage {
  id: string;
  sender_name: string;
  message: string;
  timestamp: string;
  is_question?: boolean;
}

export default function YaraLiveHub() {
  const { profile, user } = useAuth();
  const navigate = useNavigate();

  // State
  const [sessions, setSessions] = useState<LiveSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSession, setActiveSession] = useState<LiveSession | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New Session Form
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newStreamUrl, setNewStreamUrl] = useState('');
  const [creating, setCreating] = useState(false);

  // Studio / Player Controls
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [handRaised, setHandRaised] = useState(false);

  // Live Chat
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { id: '1', sender_name: 'Dr. Simbarashe', message: 'Welcome everyone to today’s YARA Robotics & AI Masterclass!', timestamp: '20:00' },
    { id: '2', sender_name: 'Farai (Mentor)', message: 'Feel free to post your technical questions in the chat.', timestamp: '20:01' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isQuestionMode, setIsQuestionMode] = useState(false);

  // Video Ref for Local Camera Stream
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Fetch Live Sessions from Supabase
  const fetchSessions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('live_sessions')
        .select('*')
        .order('created_at', { ascending: false });

      if (data && !error) {
        setSessions(data);
      } else {
        // Fallback default active session if table is empty
        setSessions([
          {
            id: 'demo-1',
            room_id: 'yara-stem-masterclass-2026',
            title: 'YARA AI & Robotics National Bootcamp: Live Stream',
            description: 'Live interactive session covering Autonomous Navigation, ROS2 Nodes, and Sensor Integration.',
            mentor_name: 'Eng. Simbarashe Manongwa',
            mentor_id: user?.id || 'admin',
            status: 'live',
            is_approved: true,
            scheduled_at: new Date().toISOString(),
            student_count: 42,
            created_at: new Date().toISOString()
          }
        ]);
      }
    } catch (e) {
      console.warn('Error fetching live sessions:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  // WebRTC Camera stream initialization when entering stream mode
  useEffect(() => {
    if (activeSession && (profile?.role === 'admin' || profile?.role === 'mentor')) {
      navigator.mediaDevices?.getUserMedia({ video: true, audio: true })
        .then((stream) => {
          mediaStreamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch((err) => {
          console.warn('Media devices camera access error:', err);
        });
    }

    return () => {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [activeSession, profile?.role]);

  const toggleMic = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getAudioTracks().forEach(t => t.enabled = !isMicOn);
    }
    setIsMicOn(!isMicOn);
  };

  const toggleCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getVideoTracks().forEach(t => t.enabled = !isCameraOn);
    }
    setIsCameraOn(!isCameraOn);
  };

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const roomId = `room-${Date.now().toString(36)}`;
      const isHostAdmin = profile?.role === 'admin' || profile?.role === 'mentor';
      
      const newSessionObj = {
        room_id: roomId,
        title: newTitle.trim(),
        description: newDesc.trim(),
        mentor_name: profile?.display_name || 'YARA Host',
        mentor_id: user?.id || 'host',
        status: 'live',
        is_approved: isHostAdmin,
        student_count: 1,
        stream_url: newStreamUrl.trim() || undefined
      };

      const { data, error } = await supabase
        .from('live_sessions')
        .insert([newSessionObj])
        .select()
        .single();

      if (data && !error) {
        setSessions([data, ...sessions]);
        setActiveSession(data);
      } else {
        const fallback = { ...newSessionObj, id: roomId, scheduled_at: new Date().toISOString(), created_at: new Date().toISOString() } as LiveSession;
        setSessions([fallback, ...sessions]);
        setActiveSession(fallback);
      }

      setShowCreateModal(false);
      setNewTitle('');
      setNewDesc('');
      setNewStreamUrl('');
    } catch (e) {
      console.error('Error creating live session:', e);
    } finally {
      setCreating(false);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      sender_name: profile?.display_name || 'Participant',
      message: chatInput.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      is_question: isQuestionMode
    };

    setChatMessages(prev => [...prev, newMessage]);
    setChatInput('');
    setIsQuestionMode(false);
  };

  const isHost = activeSession && (activeSession.mentor_id === user?.id || profile?.role === 'admin' || profile?.role === 'mentor');

  return (
    <div className="space-y-8 pb-12">
      {/* Header Banner */}
      <div className="relative rounded-[2.5rem] bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-8 md:p-12 text-white overflow-hidden shadow-2xl border border-indigo-900/30">
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center space-x-2 bg-red-500/20 border border-red-500/40 px-3.5 py-1 rounded-full text-red-400 font-bold text-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
              <span>YARA Live Engine</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
              Live Streaming & Interactive Workshops
            </h1>
            <p className="text-slate-300 text-sm md:text-base leading-relaxed">
              Broadcast live masterclasses, join real-time mentorship streams, ask Q&A questions, and collaborate with innovators across Africa.
            </p>
          </div>

          {(profile?.role === 'admin' || profile?.role === 'mentor') && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-6 py-4 rounded-2xl shadow-xl shadow-indigo-600/30 flex items-center space-x-2 shrink-0 transition-all hover:scale-105"
            >
              <Plus className="w-5 h-5" />
              <span>Go Live / Create Session</span>
            </button>
          )}
        </div>
      </div>

      {/* ACTIVE LIVE STREAMING ROOM MODE */}
      {activeSession ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Video Screen & Broadcaster Studio */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-slate-950 rounded-3xl overflow-hidden aspect-video relative shadow-2xl border border-slate-800 flex items-center justify-center">
              {/* If host & camera is active, render local video stream */}
              {isHost ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`w-full h-full object-cover ${!isCameraOn ? 'hidden' : ''}`}
                />
              ) : activeSession.stream_url ? (
                <iframe
                  src={activeSession.stream_url.includes('embed') ? activeSession.stream_url : `https://www.youtube.com/embed/${activeSession.stream_url.split('v=')[1] || activeSession.stream_url}`}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title="Live Stream"
                />
              ) : null}

              {/* Avatar Placeholder when camera is OFF */}
              {(!isHost || !isCameraOn) && !activeSession.stream_url && (
                <div className="flex flex-col items-center justify-center text-center p-8">
                  <div className="w-24 h-24 bg-gradient-to-tr from-indigo-600 to-indigo-400 rounded-full flex items-center justify-center text-white text-3xl font-black mb-4 shadow-xl shadow-indigo-900/40 animate-pulse">
                    <Radio className="w-12 h-12 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-1">{activeSession.title}</h3>
                  <p className="text-slate-400 text-sm">Host: {activeSession.mentor_name}</p>
                  <span className="mt-3 px-3 py-1 bg-red-500/20 text-red-400 border border-red-500/30 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                    Broadcasting Live
                  </span>
                </div>
              )}

              {/* Stream Overlay Badges */}
              <div className="absolute top-4 left-4 flex items-center space-x-3 z-20">
                <div className="bg-red-600 text-white font-black px-3 py-1 rounded-full text-xs flex items-center space-x-1.5 shadow-lg">
                  <span className="w-2 h-2 bg-white rounded-full animate-ping" />
                  <span>LIVE</span>
                </div>
                <div className="bg-slate-900/80 backdrop-blur-md border border-slate-700 text-slate-200 font-bold px-3 py-1 rounded-full text-xs flex items-center space-x-1">
                  <Eye className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{activeSession.student_count + (handRaised ? 1 : 0)} Viewers</span>
                </div>
              </div>

              <div className="absolute top-4 right-4 z-20">
                <button
                  onClick={() => setActiveSession(null)}
                  className="bg-slate-900/80 hover:bg-slate-800 backdrop-blur-md text-white px-3 py-1.5 rounded-xl text-xs font-bold border border-slate-700 transition-all"
                >
                  Leave Session
                </button>
              </div>

              {/* Control Toolbar */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur-md border border-slate-800 px-6 py-3 rounded-2xl flex items-center space-x-4 shadow-2xl z-20">
                {isHost && (
                  <>
                    <button
                      onClick={toggleMic}
                      className={`p-3 rounded-xl transition-all ${isMicOn ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-red-500 text-white'}`}
                      title={isMicOn ? 'Mute Microphone' : 'Unmute Microphone'}
                    >
                      {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                    </button>
                    <button
                      onClick={toggleCamera}
                      className={`p-3 rounded-xl transition-all ${isCameraOn ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-red-500 text-white'}`}
                      title={isCameraOn ? 'Turn Off Camera' : 'Turn On Camera'}
                    >
                      {isCameraOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
                    </button>
                    <button
                      onClick={() => setIsScreenSharing(!isScreenSharing)}
                      className={`p-3 rounded-xl transition-all ${isScreenSharing ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
                      title="Share Screen"
                    >
                      <Monitor className="w-5 h-5" />
                    </button>
                  </>
                )}

                {!isHost && (
                  <button
                    onClick={() => setHandRaised(!handRaised)}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all ${handRaised ? 'bg-amber-500 text-white shadow-lg' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'}`}
                  >
                    <Hand className="w-4 h-4" />
                    <span>{handRaised ? 'Hand Raised' : 'Raise Hand'}</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    alert('Session link copied to clipboard!');
                  }}
                  className="p-3 bg-slate-800 text-slate-300 hover:text-white rounded-xl hover:bg-slate-700 transition-all"
                  title="Share Stream"
                >
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Session Information */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-900">{activeSession.title}</h2>
                <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-bold">
                  Verified Host: {activeSession.mentor_name}
                </span>
              </div>
              <p className="text-slate-600 text-sm leading-relaxed">{activeSession.description}</p>
            </div>
          </div>

          {/* Sidebar Chat & Live Q&A */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 flex flex-col h-[560px] overflow-hidden">
            {/* Chat Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center space-x-2">
                <MessageSquare className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-sm">Live Discussion &amp; Q&amp;A</h3>
              </div>
              <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
                {chatMessages.length} Messages
              </span>
            </div>

            {/* Chat Scroll List */}
            <div className="flex-1 p-4 space-y-3 overflow-y-auto bg-slate-50/50">
              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`p-3 rounded-2xl text-xs space-y-1 ${msg.is_question ? 'bg-amber-50 border border-amber-200' : 'bg-white border border-slate-100 shadow-2xs'}`}
                >
                  <div className="flex items-center justify-between text-slate-500 font-bold">
                    <span className="text-indigo-900">{msg.sender_name}</span>
                    <span className="text-[10px] text-slate-400">{msg.timestamp}</span>
                  </div>
                  {msg.is_question && (
                    <span className="inline-block px-2 py-0.5 bg-amber-200 text-amber-900 rounded font-black text-[9px] uppercase tracking-wider mb-1">
                      Question
                    </span>
                  )}
                  <p className="text-slate-800 leading-relaxed font-medium">{msg.message}</p>
                </div>
              ))}
            </div>

            {/* Chat Input */}
            <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-100 bg-white space-y-2">
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setIsQuestionMode(!isQuestionMode)}
                  className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all ${isQuestionMode ? 'bg-amber-500 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >
                  Ask Question
                </button>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder={isQuestionMode ? 'Type your technical question...' : 'Send a message to live chat...'}
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
                />
                <button
                  type="submit"
                  className="bg-indigo-600 text-white p-2.5 rounded-xl hover:bg-indigo-700 transition-all shadow-md shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {/* SESSIONS DIRECTORY GRID */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Upcoming &amp; Live Streams</h2>
            <p className="text-slate-500 text-xs">Join active broadcasts or schedule future live workshops.</p>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400">Loading YARA Live Sessions...</div>
        ) : sessions.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
            <Radio className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-900 mb-2">No Active Live Sessions</h3>
            <p className="text-slate-500 text-sm max-w-md mx-auto mb-6">
              Check back soon for upcoming masterclasses and mentorship broadcasts.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 hover:shadow-xl transition-all space-y-4 flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-red-100 text-red-700 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
                      Live Stream
                    </span>
                    <span className="text-xs text-slate-500 font-bold flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-indigo-600" />
                      {session.student_count} attending
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors leading-snug">
                    {session.title}
                  </h3>
                  <p className="text-slate-500 text-xs line-clamp-2">{session.description}</p>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Host / Instructor</p>
                    <p className="text-xs font-bold text-slate-800">{session.mentor_name}</p>
                  </div>

                  <button
                    onClick={() => setActiveSession(session)}
                    className="bg-indigo-600 text-white font-bold text-xs px-5 py-2.5 rounded-xl hover:bg-indigo-700 transition-all shadow-md shadow-indigo-200 flex items-center space-x-1.5"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Join Now</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CREATE STREAM MODAL */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-[300] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-lg rounded-[2.5rem] p-8 shadow-2xl space-y-6"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-bold">
                    <Radio className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Create Live Workshop Stream</h3>
                    <p className="text-xs text-slate-500">Launch a live video broadcast for YARA learners</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateSession} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase">Stream Title</label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. ROS2 Autonomous Robotics Masterclass"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-medium focus:outline-none focus:border-indigo-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase">Description</label>
                  <textarea
                    rows={3}
                    required
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    placeholder="What will learners discover during this live stream?"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-medium focus:outline-none focus:border-indigo-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase">External Embed Stream URL (Optional)</label>
                  <input
                    type="text"
                    value={newStreamUrl}
                    onChange={(e) => setNewStreamUrl(e.target.value)}
                    placeholder="YouTube Live / Vimeo embed URL (Leave blank to use WebRTC Studio camera)"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-medium focus:outline-none focus:border-indigo-600"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="w-1/3 bg-slate-100 text-slate-700 font-bold py-3.5 rounded-xl text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className="w-2/3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl text-xs shadow-lg shadow-indigo-200"
                  >
                    {creating ? 'Starting Stream...' : 'Start Live Broadcast'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
