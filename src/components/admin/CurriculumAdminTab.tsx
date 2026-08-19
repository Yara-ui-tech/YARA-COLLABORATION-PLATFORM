import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Video, 
  HelpCircle, 
  FileText, 
  Rocket, 
  Award, 
  Plus, 
  Trash2, 
  Save, 
  ExternalLink, 
  CheckCircle2, 
  Clock, 
  Search, 
  Edit2, 
  Check, 
  AlertCircle,
  Link as LinkIcon,
  Layers,
  Sparkles,
  ChevronRight,
  X,
  Loader2,
  FolderPlus
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { CURRICULUM, COURSE_LEVELS } from '../../constants/curriculum';
import { 
  CurriculumSession, 
  CourseLevel, 
  SessionQuestion, 
  SessionAssignment, 
  SessionProject, 
  SessionResource 
} from '../../types/curriculum';
import { cn } from '../../lib/utils';

export default function CurriculumAdminTab() {
  const [courses, setCourses] = useState<CourseLevel[]>(COURSE_LEVELS);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('course_level_1');
  const [sessions, setSessions] = useState<CurriculumSession[]>(CURRICULUM);
  const [selectedSessionId, setSelectedSessionId] = useState<string>('S01');
  const [activeSubTab, setActiveSubTab] = useState<'content' | 'submissions' | 'capstones'>('content');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Modals
  const [showAddCourseModal, setShowAddCourseModal] = useState(false);
  const [showAddSessionModal, setShowAddSessionModal] = useState(false);

  // New Course Form State
  const [newCourseForm, setNewCourseForm] = useState({
    title: 'Level 4: Master Industrial Robotics & ROS 2',
    levelNumber: 4,
    description: 'Master Robot Operating System (ROS 2), LiDAR SLAM navigation, kinematics and industrial manipulator control.',
    targetAudience: 'Advanced Engineering Graduates & Robotics Professionals',
    badge: 'Master Industrial Robotics Engineer'
  });

  // New Session Form State
  const [newSessionForm, setNewSessionForm] = useState({
    id: 'S' + (CURRICULUM.length + 1).toString().padStart(2, '0'),
    topic: 'Introduction to Sensor Fusion & Kalman Filtering',
    part: 'Robotics & Hardware' as const,
    type: 'online' as const,
    outcome: 'Fuse IMU accelerometer and gyroscope data to calculate exact robot orientation',
    description: 'Noise filtering, complimentary filters, and sensor fusion algorithms.'
  });

  // Editable session data
  const [sessionTopic, setSessionTopic] = useState('');
  const [sessionPart, setSessionPart] = useState<any>('Electronics');
  const [sessionType, setSessionType] = useState<'online' | 'physical'>('online');
  const [sessionOutcome, setSessionOutcome] = useState('');
  const [sessionDescription, setSessionDescription] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [resources, setResources] = useState<SessionResource[]>([]);
  const [questions, setQuestions] = useState<SessionQuestion[]>([]);
  const [assignments, setAssignments] = useState<SessionAssignment[]>([]);
  const [projects, setProjects] = useState<SessionProject[]>([]);

  // Submissions state
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [capstoneSubmissions, setCapstoneSubmissions] = useState<any[]>([]);
  const [gradingSubId, setGradingSubId] = useState<string | null>(null);
  const [gradeScore, setGradeScore] = useState<number>(100);
  const [gradeFeedback, setGradeFeedback] = useState<string>('');

  useEffect(() => {
    fetchDbSessions();
    fetchSubmissions();
    fetchCapstones();
  }, []);

  useEffect(() => {
    // Populate form when selected session changes
    const cur = sessions.find(s => s.id === selectedSessionId);
    if (cur) {
      setSessionTopic(cur.topic || '');
      setSessionPart(cur.part || 'Electronics');
      setSessionType(cur.type || 'online');
      setSessionOutcome(cur.outcome || '');
      setSessionDescription(cur.description || '');
      setVideoUrl(cur.video_url || '');
      setResources(cur.resources || []);
      setQuestions(cur.questions || []);
      setAssignments(cur.assignments || []);
      setProjects(cur.projects || []);
    }
  }, [selectedSessionId, sessions]);

  const fetchDbSessions = async () => {
    setLoading(true);
    try {
      const { data } = await supabase.from('curriculum_sessions').select('*');
      if (data && data.length > 0) {
        const merged = CURRICULUM.map(s => {
          const dbItem = data.find((d: any) => d.session_id === s.id);
          if (dbItem) {
            return {
              ...s,
              topic: dbItem.topic || s.topic,
              part: dbItem.part || s.part,
              type: dbItem.type || s.type,
              outcome: dbItem.outcome || s.outcome,
              description: dbItem.description || s.description,
              video_url: dbItem.video_url || s.video_url,
              resources: dbItem.resources || s.resources,
              questions: dbItem.questions || s.questions,
              assignments: dbItem.assignments || s.assignments,
              projects: dbItem.projects || s.projects
            };
          }
          return s;
        });

        // Add any extra db-only sessions
        const extraSessions = data.filter((d: any) => !CURRICULUM.some(c => c.id === d.session_id)).map((d: any) => ({
          id: d.session_id,
          topic: d.topic || 'Custom Session',
          part: d.part || 'Electronics',
          type: d.type || 'online',
          outcome: d.outcome || '',
          description: d.description || '',
          video_url: d.video_url || '',
          resources: d.resources || [],
          questions: d.questions || [],
          assignments: d.assignments || [],
          projects: d.projects || []
        }));

        setSessions([...merged, ...extraSessions]);
      }
    } catch (err) {
      console.error('Error fetching curriculum sessions from db:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubmissions = async () => {
    try {
      const { data } = await supabase
        .from('curriculum_submissions')
        .select('*, user:profiles!user_id(display_name, email)')
        .order('created_at', { ascending: false });

      setSubmissions(data || []);
    } catch (err) {
      console.error('Error fetching submissions:', err);
    }
  };

  const fetchCapstones = async () => {
    try {
      const { data } = await supabase
        .from('final_project_submissions')
        .select('*, user:profiles!user_id(display_name, email)')
        .order('created_at', { ascending: false });

      setCapstoneSubmissions(data || []);
    } catch (err) {
      console.error('Error fetching capstones:', err);
    }
  };

  const handleSaveSessionData = async () => {
    setSaving(true);
    setMessage(null);

    try {
      const payload = {
        session_id: selectedSessionId,
        topic: sessionTopic,
        part: sessionPart,
        type: sessionType,
        outcome: sessionOutcome,
        description: sessionDescription,
        video_url: videoUrl,
        resources: resources,
        questions: questions,
        assignments: assignments,
        projects: projects,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('curriculum_sessions')
        .upsert(payload, { onConflict: 'session_id' });

      // Update local state
      setSessions(prev => prev.map(s => s.id === selectedSessionId ? {
        ...s,
        topic: sessionTopic,
        part: sessionPart,
        type: sessionType,
        outcome: sessionOutcome,
        description: sessionDescription,
        video_url: videoUrl,
        resources,
        questions,
        assignments,
        projects
      } : s));

      setMessage({ type: 'success', text: `Session ${selectedSessionId} updated and published successfully!` });
      setTimeout(() => setMessage(null), 3500);
    } catch (err: any) {
      console.error('Error saving session:', err);
      // Fallback local update
      setSessions(prev => prev.map(s => s.id === selectedSessionId ? {
        ...s,
        topic: sessionTopic,
        part: sessionPart,
        type: sessionType,
        outcome: sessionOutcome,
        description: sessionDescription,
        video_url: videoUrl,
        resources,
        questions,
        assignments,
        projects
      } : s));
      setMessage({ type: 'success', text: `Session ${selectedSessionId} updated in local state.` });
      setTimeout(() => setMessage(null), 3500);
    } finally {
      setSaving(false);
    }
  };

  const handleCreateCourse = (e: React.FormEvent) => {
    e.preventDefault();
    const newId = 'course_level_' + newCourseForm.levelNumber;
    const newCourse: CourseLevel = {
      id: newId,
      levelNumber: newCourseForm.levelNumber,
      title: newCourseForm.title,
      description: newCourseForm.description,
      targetAudience: newCourseForm.targetAudience,
      badge: newCourseForm.badge,
      sessionsCount: 0
    };
    setCourses([...courses, newCourse]);
    setSelectedCourseId(newId);
    setShowAddCourseModal(false);
    setMessage({ type: 'success', text: `Course "${newCourseForm.title}" added to curriculum hierarchy!` });
    setTimeout(() => setMessage(null), 3500);
  };

  const handleCreateSession = (e: React.FormEvent) => {
    e.preventDefault();
    const newSession: CurriculumSession = {
      id: newSessionForm.id,
      topic: newSessionForm.topic,
      part: newSessionForm.part,
      type: newSessionForm.type,
      outcome: newSessionForm.outcome,
      description: newSessionForm.description,
      video_url: 'https://www.youtube.com/watch?v=8jB7p9aM0aY',
      resources: [
        {
          title: 'Simulation & Circuit Starter',
          url: 'https://wokwi.com/projects/new/arduino-uno',
          type: 'simulation',
          description: 'Interactive real-time simulator'
        }
      ],
      questions: [
        {
          id: `q_${newSessionForm.id}_1`,
          question: 'What is the primary objective of this robotics module?',
          options: ['Sensor Integration', 'Power Regulation', 'Algorithm Execution', 'Code Debugging'],
          correctIndex: 0,
          explanation: 'Demonstrates foundational integration principles.'
        }
      ],
      assignments: [
        {
          id: `a_${newSessionForm.id}_1`,
          title: `${newSessionForm.topic} Drill`,
          description: 'Complete the simulation schematic and submit your verified test code.',
          deliverables: ['Simulation link', 'Execution video or screenshot']
        }
      ],
      projects: [
        {
          id: `p_${newSessionForm.id}_1`,
          title: `${newSessionForm.topic} Prototype`,
          description: 'Build and demonstrate the functional circuit.',
          objectives: ['Wire properly without shorts', 'Achieve expected sensor outputs'],
          simulationPlatform: 'Wokwi Simulator'
        }
      ]
    };

    setSessions([...sessions, newSession]);
    setSelectedSessionId(newSession.id);
    setShowAddSessionModal(false);
    setMessage({ type: 'success', text: `New Session ${newSession.id} created!` });
    setTimeout(() => setMessage(null), 3500);
  };

  // Resources helpers
  const addResource = () => {
    setResources([...resources, {
      title: 'Interactive Simulator Lab',
      url: 'https://wokwi.com/projects/new/arduino-uno',
      type: 'simulation',
      description: 'Hands-on virtual simulation lab'
    }]);
  };

  const updateResource = (index: number, key: keyof SessionResource, value: any) => {
    const updated = [...resources];
    updated[index] = { ...updated[index], [key]: value };
    setResources(updated);
  };

  const removeResource = (index: number) => {
    setResources(resources.filter((_, i) => i !== index));
  };

  // Questions helpers
  const addQuestion = () => {
    const newId = `q_${selectedSessionId}_${Date.now().toString().slice(-4)}`;
    setQuestions([...questions, {
      id: newId,
      question: 'New Question Prompt',
      options: ['Option A', 'Option B', 'Option C', 'Option D'],
      correctIndex: 0,
      explanation: 'Explanation of correct concept.'
    }]);
  };

  const updateQuestion = (index: number, updatedQ: SessionQuestion) => {
    const updated = [...questions];
    updated[index] = updatedQ;
    setQuestions(updated);
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  // Assignments helpers
  const addAssignment = () => {
    const newId = `a_${selectedSessionId}_${Date.now().toString().slice(-4)}`;
    setAssignments([...assignments, {
      id: newId,
      title: 'New Hands-On Assignment',
      description: 'Assignment description and instructions.',
      instructions: ['Step 1: Build the circuit.', 'Step 2: Write test code.'],
      deliverables: ['Simulation Link', 'Code Snippet']
    }]);
  };

  const updateAssignment = (index: number, updatedA: SessionAssignment) => {
    const updated = [...assignments];
    updated[index] = updatedA;
    setAssignments(updated);
  };

  const removeAssignment = (index: number) => {
    setAssignments(assignments.filter((_, i) => i !== index));
  };

  // Projects helpers
  const addProject = () => {
    const newId = `p_${selectedSessionId}_${Date.now().toString().slice(-4)}`;
    setProjects([...projects, {
      id: newId,
      title: 'Milestone Build Project',
      description: 'Project requirements and hardware goals.',
      objectives: ['Integrate all components properly.', 'Verify telemetry in serial monitor.'],
      simulationPlatform: 'Tinkercad Circuits'
    }]);
  };

  const updateProject = (index: number, updatedP: SessionProject) => {
    const updated = [...projects];
    updated[index] = updatedP;
    setProjects(updated);
  };

  const removeProject = (index: number) => {
    setProjects(projects.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-8">
      {/* Header & Course Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-black uppercase tracking-wider">
              Curriculum & Course Management
            </span>
          </div>
          <h3 className="text-2xl font-black text-slate-900 mt-1">Manage Lessons, Videos, Questions & Courses</h3>
          <p className="text-slate-500 text-sm font-medium">
            Customize beginner modules, add next level courses, upload video tutorials, and grade student submissions.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowAddCourseModal(true)}
            className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-4 py-3 rounded-2xl shadow-sm text-xs flex items-center space-x-2 transition-all"
          >
            <FolderPlus className="w-4 h-4" />
            <span>+ Add Next Level Course</span>
          </button>
          <button
            onClick={() => setShowAddSessionModal(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-3 rounded-2xl shadow-lg shadow-indigo-100 text-xs flex items-center space-x-2 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Session</span>
          </button>
        </div>
      </div>

      {message && (
        <div className={cn(
          "p-4 rounded-2xl flex items-center space-x-2 text-sm font-bold",
          message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
        )}>
          <CheckCircle2 className="w-4 h-4" />
          <span>{message.text}</span>
        </div>
      )}

      {/* Courses / Levels Bar */}
      <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex items-center gap-2 overflow-x-auto">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-2 shrink-0">Course Levels:</span>
        {courses.map(crs => (
          <button
            key={crs.id}
            onClick={() => setSelectedCourseId(crs.id)}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center space-x-2",
              selectedCourseId === crs.id
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                : "bg-white text-slate-600 hover:bg-slate-100"
            )}
          >
            <span>{crs.title}</span>
          </button>
        ))}
      </div>

      {/* Sub Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-100 pb-2">
        <button
          onClick={() => setActiveSubTab('content')}
          className={cn(
            "px-5 py-2.5 rounded-2xl font-bold text-xs flex items-center space-x-2 transition-all",
            activeSubTab === 'content' ? "bg-slate-900 text-white shadow-md" : "text-slate-500 hover:text-slate-900"
          )}
        >
          <BookOpen className="w-4 h-4" />
          <span>Edit Course Content ({sessions.length} Sessions)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('submissions')}
          className={cn(
            "px-5 py-2.5 rounded-2xl font-bold text-xs flex items-center space-x-2 transition-all",
            activeSubTab === 'submissions' ? "bg-slate-900 text-white shadow-md" : "text-slate-500 hover:text-slate-900"
          )}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Session Submissions ({submissions.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('capstones')}
          className={cn(
            "px-5 py-2.5 rounded-2xl font-bold text-xs flex items-center space-x-2 transition-all",
            activeSubTab === 'capstones' ? "bg-slate-900 text-white shadow-md" : "text-slate-500 hover:text-slate-900"
          )}
        >
          <Award className="w-4 h-4" />
          <span>Capstone Project Submissions ({capstoneSubmissions.length})</span>
        </button>
      </div>

      {/* SUB-TAB 1: CONTENT EDITOR */}
      {activeSubTab === 'content' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Session Selector */}
          <div className="lg:col-span-1 space-y-2 max-h-[700px] overflow-y-auto pr-2">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest px-2 mb-2">Sessions List</p>
            {sessions.map(s => (
              <button
                key={s.id}
                onClick={() => setSelectedSessionId(s.id)}
                className={cn(
                  "w-full text-left p-3.5 rounded-2xl transition-all flex flex-col space-y-1 border",
                  selectedSessionId === s.id
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-100"
                    : "bg-white text-slate-700 border-slate-100 hover:border-slate-200"
                )}
              >
                <div className="flex items-center justify-between">
                  <span className={cn(
                    "text-[10px] font-black uppercase px-2 py-0.5 rounded-md",
                    selectedSessionId === s.id ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
                  )}>
                    {s.id}
                  </span>
                  <span className="text-[10px] font-bold opacity-80">{s.part}</span>
                </div>
                <p className="font-bold text-xs line-clamp-1">{s.topic}</p>
              </button>
            ))}
          </div>

          {/* Right Editor Pane */}
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white rounded-[2rem] p-6 md:p-8 border border-slate-100 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <span className="text-xs font-black uppercase tracking-widest text-indigo-600">{selectedSessionId}</span>
                  <h4 className="text-xl font-black text-slate-900">Edit Session Details & Resources</h4>
                </div>

                <button
                  onClick={handleSaveSessionData}
                  disabled={saving}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3 rounded-2xl shadow-lg shadow-emerald-100 flex items-center space-x-2 text-xs transition-all"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>Save & Publish Changes</span>
                </button>
              </div>

              {/* Core Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Lesson Title / Topic</label>
                  <input
                    type="text"
                    value={sessionTopic}
                    onChange={(e) => setSessionTopic(e.target.value)}
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-4 text-sm font-bold focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Category / Part</label>
                  <select
                    value={sessionPart}
                    onChange={(e) => setSessionPart(e.target.value as any)}
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-4 text-xs font-bold focus:border-indigo-600"
                  >
                    <option value="Electronics">Electronics</option>
                    <option value="Programming">Programming</option>
                    <option value="Innovation + Build">Innovation + Build</option>
                    <option value="Robotics & Hardware">Robotics & Hardware</option>
                    <option value="IoT & Networking">IoT & Networking</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Format</label>
                  <select
                    value={sessionType}
                    onChange={(e) => setSessionType(e.target.value as any)}
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-4 text-xs font-bold focus:border-indigo-600"
                  >
                    <option value="online">Online Video & Simulation</option>
                    <option value="physical">Physical Workshop / Lab</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Key Learning Outcome</label>
                  <input
                    type="text"
                    value={sessionOutcome}
                    onChange={(e) => setSessionOutcome(e.target.value)}
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-4 text-xs font-medium focus:border-indigo-600"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Detailed Description</label>
                  <textarea
                    value={sessionDescription}
                    onChange={(e) => setSessionDescription(e.target.value)}
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-4 text-xs font-medium focus:border-indigo-600 min-h-[60px]"
                  />
                </div>
              </div>

              {/* Video URL */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="block text-xs font-bold text-slate-700 uppercase">Video Source / Masterclass URL</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="url"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="flex-1 bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-4 text-xs font-medium focus:border-indigo-600"
                  />
                  {videoUrl && (
                    <a 
                      href={videoUrl} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="p-3 bg-slate-100 rounded-2xl hover:bg-slate-200 text-slate-700"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>

              {/* Study Resources */}
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 uppercase">Study Resources & Simulators ({resources.length})</label>
                  <button
                    onClick={addResource}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center space-x-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Resource</span>
                  </button>
                </div>

                {resources.map((res, rIdx) => (
                  <div key={rIdx} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <input
                        type="text"
                        value={res.title}
                        onChange={(e) => updateResource(rIdx, 'title', e.target.value)}
                        placeholder="Resource Title"
                        className="flex-1 bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs font-bold"
                      />
                      <select
                        value={res.type}
                        onChange={(e) => updateResource(rIdx, 'type', e.target.value)}
                        className="bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs font-bold"
                      >
                        <option value="simulation">Simulation</option>
                        <option value="video">Video</option>
                        <option value="doc">Documentation</option>
                        <option value="github">GitHub Repo</option>
                        <option value="tool">Tool</option>
                      </select>
                      <button
                        onClick={() => removeResource(rIdx)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <input
                      type="url"
                      value={res.url}
                      onChange={(e) => updateResource(rIdx, 'url', e.target.value)}
                      placeholder="https://..."
                      className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs font-medium text-slate-600"
                    />
                  </div>
                ))}
              </div>

              {/* Questions */}
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 uppercase">Knowledge Check Questions ({questions.length})</label>
                  <button
                    onClick={addQuestion}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center space-x-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Question</span>
                  </button>
                </div>

                {questions.map((q, qIdx) => (
                  <div key={qIdx} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase text-indigo-600">Question {qIdx + 1}</span>
                      <button
                        onClick={() => removeQuestion(qIdx)}
                        className="text-slate-400 hover:text-red-600"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <input
                      type="text"
                      value={q.question}
                      onChange={(e) => {
                        const copy = { ...q, question: e.target.value };
                        updateQuestion(qIdx, copy);
                      }}
                      placeholder="Question prompt"
                      className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs font-bold"
                    />
                    <div className="space-y-2">
                      {q.options.map((opt, oIdx) => (
                        <div key={oIdx} className="flex items-center space-x-2">
                          <input
                            type="radio"
                            name={`correct_${qIdx}`}
                            checked={q.correctIndex === oIdx}
                            onChange={() => {
                              const copy = { ...q, correctIndex: oIdx };
                              updateQuestion(qIdx, copy);
                            }}
                            className="w-4 h-4 text-emerald-600"
                          />
                          <span className="text-[11px] font-bold text-slate-400">{String.fromCharCode(65 + oIdx)}:</span>
                          <input
                            type="text"
                            value={opt}
                            onChange={(e) => {
                              const newOpts = [...q.options];
                              newOpts[oIdx] = e.target.value;
                              updateQuestion(qIdx, { ...q, options: newOpts });
                            }}
                            className="flex-1 bg-white border border-slate-200 rounded-xl py-1.5 px-3 text-xs"
                          />
                        </div>
                      ))}
                    </div>
                    <input
                      type="text"
                      value={q.explanation}
                      onChange={(e) => {
                        const copy = { ...q, explanation: e.target.value };
                        updateQuestion(qIdx, copy);
                      }}
                      placeholder="Explanation when answered"
                      className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-500 italic"
                    />
                  </div>
                ))}
              </div>

              {/* Save Button */}
              <div className="pt-6 border-t border-slate-100 flex justify-end">
                <button
                  onClick={handleSaveSessionData}
                  disabled={saving}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-8 py-3.5 rounded-2xl shadow-lg shadow-emerald-100 flex items-center space-x-2 text-xs transition-all"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>Save All Changes for {selectedSessionId}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add Next Level Course */}
      {showAddCourseModal && (
        <div className="fixed inset-0 z-[140] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-[2.5rem] p-8 max-w-lg w-full shadow-2xl relative">
            <button 
              onClick={() => setShowAddCourseModal(false)}
              className="absolute top-6 right-6 p-2 text-slate-400 hover:bg-slate-50 rounded-xl"
            >
              <X className="w-6 h-6" />
            </button>
            <h3 className="text-2xl font-black text-slate-900 mb-1">Add Next Level Course</h3>
            <p className="text-slate-500 text-xs mb-6">Expand the curriculum hierarchy with advanced robotics tracks.</p>

            <form onSubmit={handleCreateCourse} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Course Title</label>
                <input
                  type="text"
                  required
                  value={newCourseForm.title}
                  onChange={(e) => setNewCourseForm({ ...newCourseForm, title: e.target.value })}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-4 text-xs font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Level Number</label>
                  <input
                    type="number"
                    required
                    value={newCourseForm.levelNumber}
                    onChange={(e) => setNewCourseForm({ ...newCourseForm, levelNumber: Number(e.target.value) })}
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-4 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Badge Name</label>
                  <input
                    type="text"
                    required
                    value={newCourseForm.badge}
                    onChange={(e) => setNewCourseForm({ ...newCourseForm, badge: e.target.value })}
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-4 text-xs font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Course Description</label>
                <textarea
                  required
                  value={newCourseForm.description}
                  onChange={(e) => setNewCourseForm({ ...newCourseForm, description: e.target.value })}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-4 text-xs font-medium min-h-[70px]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Target Audience</label>
                <input
                  type="text"
                  required
                  value={newCourseForm.targetAudience}
                  onChange={(e) => setNewCourseForm({ ...newCourseForm, targetAudience: e.target.value })}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-4 text-xs font-medium"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 text-white font-bold py-4 rounded-2xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all text-xs"
              >
                Create Course & Add to Platform
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add New Session */}
      {showAddSessionModal && (
        <div className="fixed inset-0 z-[140] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-[2.5rem] p-8 max-w-lg w-full shadow-2xl relative">
            <button 
              onClick={() => setShowAddSessionModal(false)}
              className="absolute top-6 right-6 p-2 text-slate-400 hover:bg-slate-50 rounded-xl"
            >
              <X className="w-6 h-6" />
            </button>
            <h3 className="text-2xl font-black text-slate-900 mb-1">Create New Session</h3>
            <p className="text-slate-500 text-xs mb-6">Add a new lesson to the active course curriculum.</p>

            <form onSubmit={handleCreateSession} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Session ID</label>
                  <input
                    type="text"
                    required
                    value={newSessionForm.id}
                    onChange={(e) => setNewSessionForm({ ...newSessionForm, id: e.target.value })}
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-4 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Category / Part</label>
                  <select
                    value={newSessionForm.part}
                    onChange={(e) => setNewSessionForm({ ...newSessionForm, part: e.target.value as any })}
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-4 text-xs font-bold"
                  >
                    <option value="Electronics">Electronics</option>
                    <option value="Programming">Programming</option>
                    <option value="Innovation + Build">Innovation + Build</option>
                    <option value="Robotics & Hardware">Robotics & Hardware</option>
                    <option value="IoT & Networking">IoT & Networking</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Session Topic</label>
                <input
                  type="text"
                  required
                  value={newSessionForm.topic}
                  onChange={(e) => setNewSessionForm({ ...newSessionForm, topic: e.target.value })}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-4 text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Outcome</label>
                <input
                  type="text"
                  required
                  value={newSessionForm.outcome}
                  onChange={(e) => setNewSessionForm({ ...newSessionForm, outcome: e.target.value })}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-4 text-xs font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Description</label>
                <textarea
                  required
                  value={newSessionForm.description}
                  onChange={(e) => setNewSessionForm({ ...newSessionForm, description: e.target.value })}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-4 text-xs font-medium min-h-[60px]"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 text-white font-bold py-4 rounded-2xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all text-xs"
              >
                Add Session to Curriculum
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
