import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';
import { Loader2, X, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

import DailyIframe from '@daily-co/daily-js';

export default function LiveRoom() {
  const { roomId } = useParams();
  const { profile, user } = useAuth();
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const callFrameRef = useRef<any>(null);
  const [isApproved, setIsApproved] = useState<boolean | null>(null);
  const [sessionData, setSessionData] = useState<any>(null);

  useEffect(() => {
    const checkApproval = async () => {
      if (!roomId) return;
      const { data, error } = await supabase
        .from('live_sessions')
        .select('*')
        .eq('room_id', roomId)
        .single();
      
      if (error || !data) {
        navigate('/mentorship');
        return;
      }

      setSessionData(data);
      setIsApproved(data.is_approved);

      // If not approved and not the mentor/admin, kick them out
      if (!data.is_approved && data.mentor_id !== user?.id && profile?.role !== 'admin') {
        navigate('/mentorship');
      }
    };

    checkApproval();
  }, [roomId, user, profile, navigate]);

  useEffect(() => {
    if (isApproved === null || !roomId || !containerRef.current) return;

    // Initialize Daily Call Frame
    // Note: In a real production app, you would fetch a room URL from your backend
    // For this implementation, we use a placeholder domain that the user can configure
    const dailyDomain = import.meta.env.VITE_DAILY_DOMAIN || 'yaria';
    const roomUrl = `https://${dailyDomain}.daily.co/${roomId}`;

    const callFrame = DailyIframe.createFrame(containerRef.current, {
      iframeStyle: {
        width: '100%',
        height: '100%',
        border: '0',
      },
      showLeaveButton: true,
      showFullscreenButton: true,
    });

    callFrameRef.current = callFrame;

    callFrame.join({ 
      url: roomUrl,
      userName: profile?.display_name || 'YARIA User'
    });

    // Event Listeners
    callFrame.on('left-meeting', () => {
      navigate('/mentorship');
    });

    callFrame.on('participant-joined', async () => {
      const { data: current } = await supabase
        .from('live_sessions')
        .select('student_count')
        .eq('room_id', roomId)
        .single();
      
      await supabase
        .from('live_sessions')
        .update({ student_count: (current?.student_count || 0) + 1 })
        .eq('room_id', roomId);
    });

    callFrame.on('participant-left', async () => {
      const { data: current } = await supabase
        .from('live_sessions')
        .select('student_count')
        .eq('room_id', roomId)
        .single();
      
      await supabase
        .from('live_sessions')
        .update({ student_count: Math.max(0, (current?.student_count || 0) - 1) })
        .eq('room_id', roomId);
    });

    return () => {
      if (callFrameRef.current) {
        callFrameRef.current.destroy();
      }
    };
  }, [roomId, profile, navigate, isApproved]);

  if (isApproved === false && sessionData?.mentor_id !== user?.id && profile?.role !== 'admin') {
    return (
      <div className="fixed inset-0 bg-slate-900 flex items-center justify-center p-8 text-center">
        <div className="max-w-md">
          <AlertCircle className="w-16 h-16 text-amber-500 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-white mb-4">Pending Approval</h2>
          <p className="text-slate-400 mb-8">This live session is currently waiting for administrator approval. Please check back later.</p>
          <button onClick={() => navigate('/mentorship')} className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-bold">
            Back to Hub
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[200] bg-slate-900 flex flex-col">
      <div className="bg-slate-800 p-4 flex items-center justify-between border-b border-slate-700">
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold">Y</div>
          <div>
            <h2 className="text-white font-bold">YARIA Live Session</h2>
            <p className="text-slate-400 text-xs">Room ID: {roomId}</p>
          </div>
        </div>
        <button 
          onClick={() => navigate('/mentorship')}
          className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-xl transition-all"
        >
          <X className="w-6 h-6" />
        </button>
      </div>
      <div className="flex-1 relative bg-slate-900">
        <div ref={containerRef} className="absolute inset-0" />
        {!roomId && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
          </div>
        )}
      </div>
    </div>
  );
}
