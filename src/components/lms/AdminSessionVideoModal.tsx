import React, { useState, useEffect } from 'react';
import { 
  X, 
  Plus, 
  Trash2, 
  Edit2, 
  ArrowUp, 
  ArrowDown, 
  Play, 
  Video, 
  Upload, 
  Link as LinkIcon, 
  Clock, 
  Check, 
  RotateCcw, 
  AlertCircle,
  Zap,
  ShieldCheck,
  Film
} from 'lucide-react';
import { SessionVideoClip } from '../../types/yaraLms';
import { 
  getSessionVideos, 
  saveSessionVideos, 
  addSessionVideoClip, 
  updateSessionVideoClip, 
  removeSessionVideoClip, 
  resetSessionVideosToDefault 
} from '../../services/yaraLmsService';

interface Props {
  sessionId: string;
  sessionTitle: string;
  isOpen: boolean;
  onClose: () => void;
  onVideosUpdated: () => void;
}

export const AdminSessionVideoModal: React.FC<Props> = ({
  sessionId,
  sessionTitle,
  isOpen,
  onClose,
  onVideosUpdated
}) => {
  const [clips, setClips] = useState<SessionVideoClip[]>([]);
  const [editingClipId, setEditingClipId] = useState<string | null>(null);
  
  // Form State
  const [title, setTitle] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(4);
  const [durationSeconds, setDurationSeconds] = useState(0);
  const [clipType, setClipType] = useState<SessionVideoClip['clipType']>('concept');
  const [description, setDescription] = useState('');
  const [inputMode, setInputMode] = useState<'url' | 'upload'>('url');
  
  // UI states
  const [previewClip, setPreviewClip] = useState<SessionVideoClip | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadClips();
    }
  }, [sessionId, isOpen]);

  const loadClips = () => {
    const loaded = getSessionVideos(sessionId);
    setClips(loaded);
    if (loaded.length > 0 && !previewClip) {
      setPreviewClip(loaded[0]);
    }
  };

  if (!isOpen) return null;

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setFeedbackMsg({ text, type });
    setTimeout(() => setFeedbackMsg(null), 3500);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadedFileName(file.name);
    // Create a local object URL for preview and session playback
    const objectUrl = URL.createObjectURL(file);
    setVideoUrl(objectUrl);
    showToast(`Video file "${file.name}" loaded successfully.`);
  };

  const handleResetForm = () => {
    setEditingClipId(null);
    setTitle('');
    setVideoUrl('');
    setDurationMinutes(4);
    setDurationSeconds(0);
    setClipType('concept');
    setDescription('');
    setUploadedFileName('');
  };

  const handleStartEdit = (clip: SessionVideoClip) => {
    setEditingClipId(clip.id);
    setTitle(clip.title);
    setVideoUrl(clip.videoUrl);
    const mins = Math.floor(clip.durationSeconds / 60);
    const secs = clip.durationSeconds % 60;
    setDurationMinutes(mins);
    setDurationSeconds(secs);
    setClipType(clip.clipType || 'concept');
    setDescription(clip.description || '');
    setInputMode('url');
  };

  const handleSaveClip = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      showToast('Please enter a lesson title.', 'error');
      return;
    }
    if (!videoUrl.trim()) {
      showToast('Please provide a valid video link or upload a file.', 'error');
      return;
    }

    // Calculate total duration in seconds (capped at 420s / 7 mins)
    const totalSecs = Math.min(420, Math.max(30, Number(durationMinutes) * 60 + Number(durationSeconds)));

    if (editingClipId) {
      updateSessionVideoClip(sessionId, editingClipId, {
        title: title.trim(),
        videoUrl: videoUrl.trim(),
        durationSeconds: totalSecs,
        clipType,
        description: description.trim()
      });
      showToast('Video clip updated successfully!');
    } else {
      addSessionVideoClip(sessionId, {
        title: title.trim(),
        videoUrl: videoUrl.trim(),
        durationSeconds: totalSecs,
        clipType,
        description: description.trim()
      });
      showToast('New video micro-lesson added successfully!');
    }

    handleResetForm();
    loadClips();
    onVideosUpdated();
  };

  const handleDeleteClip = (clipId: string) => {
    if (clips.length <= 1) {
      if (!confirm('This is the only video clip for this session. Are you sure you want to remove it?')) {
        return;
      }
    }
    removeSessionVideoClip(sessionId, clipId);
    showToast('Video clip removed from course session.');
    loadClips();
    onVideosUpdated();
  };

  const handleMoveClip = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= clips.length) return;

    const newClips = [...clips];
    const temp = newClips[index];
    newClips[index] = newClips[targetIdx];
    newClips[targetIdx] = temp;

    saveSessionVideos(sessionId, newClips);
    loadClips();
    onVideosUpdated();
  };

  const handleResetToDefaults = () => {
    if (confirm('Reset all videos for this session back to YARA factory defaults?')) {
      resetSessionVideosToDefault(sessionId);
      loadClips();
      onVideosUpdated();
      showToast('Session videos restored to factory default playlist.');
    }
  };

  const formatSecs = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-slate-100 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-400 font-mono text-[10px] font-bold">
                  {sessionId}
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Admin Studio
                </span>
                <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-semibold">
                  Max 7-Min Micro-Lessons
                </span>
              </div>
              <h2 className="text-lg font-black text-white mt-1">Manage Course Videos: {sessionTitle}</h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleResetToDefaults}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 flex items-center gap-1.5 transition"
              title="Reset to default video list"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset Defaults
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Feedback Alert */}
        {feedbackMsg && (
          <div className={`px-6 py-2.5 text-xs font-bold flex items-center gap-2 ${
            feedbackMsg.type === 'success' ? 'bg-emerald-500/20 text-emerald-300 border-b border-emerald-500/30' : 'bg-red-500/20 text-red-300 border-b border-red-500/30'
          }`}>
            <Zap className="w-4 h-4" /> {feedbackMsg.text}
          </div>
        )}

        {/* Modal Body */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 overflow-y-auto flex-1">
          
          {/* Left Column: Clips List (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Video className="w-4 h-4 text-emerald-400" />
                Lesson Playlist ({clips.length} Micro-Lessons)
              </h3>
              <button
                onClick={handleResetForm}
                className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add New Clip
              </button>
            </div>

            <div className="space-y-2.5">
              {clips.map((clip, idx) => (
                <div
                  key={clip.id}
                  className={`p-3.5 rounded-2xl border transition ${
                    editingClipId === clip.id 
                      ? 'bg-indigo-950/40 border-indigo-500' 
                      : previewClip?.id === clip.id
                      ? 'bg-slate-800/80 border-emerald-500/50'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 cursor-pointer" onClick={() => setPreviewClip(clip)}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="w-5 h-5 rounded-full bg-slate-800 text-[10px] font-bold text-slate-300 flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <span className="text-xs font-bold text-white line-clamp-1">
                          {clip.title}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-[10px] text-slate-400">
                        <span className="px-1.5 py-0.5 rounded bg-slate-800 font-mono text-emerald-400 flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" /> {formatSecs(clip.durationSeconds)}
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-slate-800 capitalize">
                          {clip.clipType || 'concept'}
                        </span>
                        {clip.durationSeconds <= 420 && (
                          <span className="text-emerald-500 font-semibold">✓ &le; 7 min</span>
                        )}
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleMoveClip(idx, 'up')}
                        disabled={idx === 0}
                        className="p-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-300"
                        title="Move Up"
                      >
                        <ArrowUp className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleMoveClip(idx, 'down')}
                        disabled={idx === clips.length - 1}
                        className="p-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-300"
                        title="Move Down"
                      >
                        <ArrowDown className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleStartEdit(clip)}
                        className="p-1 rounded bg-slate-800 hover:bg-indigo-600 text-slate-300 transition"
                        title="Edit Clip"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleDeleteClip(clip.id)}
                        className="p-1 rounded bg-slate-800 hover:bg-red-600 text-slate-300 transition"
                        title="Remove Clip"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {clips.length === 0 && (
              <div className="py-8 text-center text-slate-500 text-xs border border-dashed border-slate-800 rounded-2xl">
                No video clips defined. Click "Add New Clip" to add micro-lessons.
              </div>
            )}
          </div>

          {/* Right Column: Editor & Preview (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Form */}
            <form onSubmit={handleSaveClip} className="p-5 rounded-3xl bg-slate-950/70 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  {editingClipId ? <Edit2 className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                  {editingClipId ? 'Edit Micro-Lesson Video' : 'Add New Micro-Lesson (Max 7 Min)'}
                </h3>
                {editingClipId && (
                  <button
                    type="button"
                    onClick={handleResetForm}
                    className="text-[11px] font-semibold text-slate-400 hover:text-white"
                  >
                    Cancel Editing
                  </button>
                )}
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Lesson Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Part 1: Fundamentals of GPIO Pull-Up Resistors"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              {/* Source Mode Toggle */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-300">
                    Video Source *
                  </label>
                  <div className="flex items-center gap-1 p-0.5 rounded-lg bg-slate-900 border border-slate-800 text-[10px]">
                    <button
                      type="button"
                      onClick={() => setInputMode('url')}
                      className={`px-2.5 py-1 rounded-md font-bold transition flex items-center gap-1 ${
                        inputMode === 'url' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <LinkIcon className="w-2.5 h-2.5" /> Web Link / YouTube
                    </button>
                    <button
                      type="button"
                      onClick={() => setInputMode('upload')}
                      className={`px-2.5 py-1 rounded-md font-bold transition flex items-center gap-1 ${
                        inputMode === 'upload' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Upload className="w-2.5 h-2.5" /> Upload File
                    </button>
                  </div>
                </div>

                {inputMode === 'url' ? (
                  <input
                    type="text"
                    value={videoUrl}
                    onChange={e => setVideoUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=... or https://cdn.yara.org/videos/part1.mp4"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                    required
                  />
                ) : (
                  <div className="space-y-2">
                    <label className="border-2 border-dashed border-slate-700 hover:border-emerald-500 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition bg-slate-900/50">
                      <Upload className="w-6 h-6 text-slate-400 mb-1" />
                      <span className="text-xs font-bold text-slate-200">Choose MP4, WebM, or Video File</span>
                      <span className="text-[10px] text-slate-400 mt-0.5">Supports direct browser video streaming</span>
                      <input
                        type="file"
                        accept="video/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                    {uploadedFileName && (
                      <div className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                        <Check className="w-3 h-3" /> Selected: {uploadedFileName}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Duration & Clip Type */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Duration (Max 7 mins)
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 flex items-center gap-1 bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5">
                      <input
                        type="number"
                        min="0"
                        max="7"
                        value={durationMinutes}
                        onChange={e => setDurationMinutes(Math.min(7, Math.max(0, parseInt(e.target.value) || 0)))}
                        className="w-12 bg-transparent text-xs text-white font-bold focus:outline-none"
                      />
                      <span className="text-[10px] text-slate-400 font-semibold">min</span>
                    </div>
                    <div className="flex-1 flex items-center gap-1 bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5">
                      <input
                        type="number"
                        min="0"
                        max="59"
                        value={durationSeconds}
                        onChange={e => setDurationSeconds(Math.min(59, Math.max(0, parseInt(e.target.value) || 0)))}
                        className="w-12 bg-transparent text-xs text-white font-bold focus:outline-none"
                      />
                      <span className="text-[10px] text-slate-400 font-semibold">sec</span>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">Total: {durationMinutes * 60 + durationSeconds}s / 420s max</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Lesson Category
                  </label>
                  <select
                    value={clipType}
                    onChange={e => setClipType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="concept">Core Concept / Theory</option>
                    <option value="demonstration">Practical Demonstration / Lab</option>
                    <option value="walkthrough">Code & Logic Walkthrough</option>
                    <option value="troubleshooting">Troubleshooting & Diagnostics</option>
                    <option value="recap">Takeaways & Innovation Impact</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Key Takeaways / Clip Summary
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Key concepts covered in this bite-sized video clip..."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Submit button */}
              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black flex items-center gap-1.5 transition shadow-lg shadow-emerald-500/20"
                >
                  <Check className="w-3.5 h-3.5" />
                  {editingClipId ? 'Save Changes' : 'Add to Course Videos'}
                </button>
              </div>
            </form>

            {/* Video Live Preview Box */}
            {previewClip && (
              <div className="p-4 rounded-3xl bg-slate-950/60 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                    <Play className="w-3.5 h-3.5 text-emerald-400" /> Active Video Preview: {previewClip.title}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {formatSecs(previewClip.durationSeconds)}
                  </span>
                </div>
                
                <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black border border-slate-800 relative">
                  {previewClip.videoUrl.includes('youtube.com') || previewClip.videoUrl.includes('youtu.be') ? (
                    <iframe
                      src={previewClip.videoUrl.replace('watch?v=', 'embed/').replace('youtu.be/', 'www.youtube.com/embed/')}
                      title="Preview"
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  ) : (
                    <video
                      src={previewClip.videoUrl}
                      controls
                      className="w-full h-full object-contain"
                    ></video>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Micro-lesson enforcement: Max 7 minutes per clip ensures maximum student retention and completion rates.</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
