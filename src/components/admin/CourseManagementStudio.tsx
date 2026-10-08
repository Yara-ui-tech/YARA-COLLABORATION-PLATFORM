import React, { useState, useEffect } from 'react';
import { 
  BookOpen, Plus, Edit2, Trash2, Eye, EyeOff, Save, X, Search, 
  CheckCircle2, Video, Layers, Award, RefreshCw, AlertCircle, 
  Archive, Filter, Sparkles, Check, HelpCircle, ShieldAlert,
  ChevronRight, ChevronLeft, Wrench, BarChart3, Users, Clock
} from 'lucide-react';
import { 
  UnifiedCourse, 
  CourseTrack, 
  CourseCategory, 
  CourseLevel, 
  CourseModule 
} from '../../types/unifiedCourseTypes';
import { 
  getAllCourses, 
  saveCourse, 
  deleteCourse, 
  toggleCoursePublish, 
  archiveCourse, 
  checkDuplicateCourse, 
  getLmsReportingOverview 
} from '../../services/unifiedCourseService';
import { UniversalCoursePlayerModal } from '../lms/UniversalCoursePlayerModal';

export const CourseManagementStudio: React.FC = () => {
  const [courses, setCourses] = useState<UnifiedCourse[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTrack, setSelectedTrack] = useState<CourseTrack | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'published' | 'draft'>('all');

  // Wizard modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<UnifiedCourse | null>(null);
  const [currentStep, setCurrentStep] = useState(1);

  // Preview modal state
  const [previewCourse, setPreviewCourse] = useState<UnifiedCourse | null>(null);

  // Notification state
  const [notification, setNotification] = useState<{ type: 'success' | 'error' | 'warning'; text: string } | null>(null);

  // Course Form state
  const [form, setForm] = useState<Partial<UnifiedCourse>>({
    code: '',
    title: '',
    slug: '',
    version: '1.0',
    track: 'technology',
    category: 'python',
    level: 'Beginner',
    estimatedDurationHours: 12,
    shortSummary: '',
    description: '',
    thumbnailUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80',
    instructorName: 'YARA Engineering Faculty',
    instructorTitle: 'Senior Robotics Instructor',
    hardwareRequired: [],
    learningOutcomes: [],
    prerequisites: [],
    accessRule: 'free',
    membershipRequired: false,
    certificationEnabled: true,
    certificationTitle: 'Certificate of Competence',
    certificationFeeUsd: 5,
    isPublished: true,
    isDraft: false,
    isFeatured: false,
    modules: []
  });

  // Duplicate Warning state
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);

  const refreshCourses = () => {
    setCourses(getAllCourses());
  };

  useEffect(() => {
    refreshCourses();
  }, []);

  const reportingStats = getLmsReportingOverview();

  const showNotice = (type: 'success' | 'error' | 'warning', text: string) => {
    setNotification({ type, text });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleOpenAdd = () => {
    setEditingCourse(null);
    setCurrentStep(1);
    setDuplicateWarning(null);
    setForm({
      id: `yara-crs-${Date.now()}`,
      code: `YARA-CRS-${Math.floor(100 + Math.random() * 900)}`,
      title: '',
      slug: '',
      version: '1.0',
      track: 'technology',
      category: 'python',
      level: 'Beginner',
      estimatedDurationHours: 14,
      shortSummary: '',
      description: '',
      thumbnailUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=800&q=80',
      instructorName: 'YARA Engineering Faculty',
      instructorTitle: 'Senior Robotics Instructor',
      hardwareRequired: ['Basic Breadboard Kit', 'Microcontroller Board'],
      learningOutcomes: ['Understand fundamental concepts', 'Complete hands-on practical lab', 'Build working capstone'],
      prerequisites: ['Basic curiosity to learn'],
      accessRule: 'free',
      membershipRequired: false,
      certificationEnabled: true,
      certificationTitle: 'YARA Certificate of Technical Competence',
      certificationFeeUsd: 5,
      isPublished: true,
      isDraft: false,
      isFeatured: false,
      enrolledCount: 0,
      rating: 4.9,
      modules: [
        {
          id: `mod-${Date.now()}-1`,
          courseId: '',
          moduleNumber: 1,
          order: 1,
          title: 'Module 1: Foundations & Systems Overview',
          coherentSkillArea: 'Core Systems Knowledge',
          description: 'Introduction to fundamentals and core taxonomy.',
          durationMinutes: 45,
          theoryOverview: 'Understanding the fundamentals of this technical discipline.',
          theoryKeyConcepts: ['Core Concepts', 'Bench Safety'],
          videoUrl: 'https://www.youtube.com/watch?v=0hYg4q6MvdE',
          resources: [],
          guidedLab: {
            id: `lab-${Date.now()}-1`,
            title: 'Lab 1: Hands-on Setup & Validation',
            objective: 'Validate bench hardware and setup development toolchain.',
            equipment: ['Computer', 'Breadboard starter components'],
            safetyRules: ['Do not short power rails'],
            instructions: 'Follow standard testing protocols to verify setup.',
            expectedResult: 'System tests pass without faults.',
            troubleshootingTips: ['Check loose cables and power connectors.']
          },
          assignment: {
            id: `asg-${Date.now()}-1`,
            title: 'Assignment 1: Technical Documentation & Build Test',
            instructions: 'Submit your calculated readings or source code.',
            rubric: [
              { criteria: 'Technical accuracy', points: 50 },
              { criteria: 'Documentation clarity', points: 50 }
            ],
            maxPoints: 100,
            submissionRequirements: ['Written report or code submission']
          },
          quizQuestions: [
            {
              id: `q-${Date.now()}-1`,
              question: 'Which component provides logic processing in an embedded robot?',
              options: ['Battery', 'Microcontroller / CPU', 'Chassis', 'Wheel'],
              correctIndex: 1,
              explanation: 'The microcontroller or CPU executes instructions and processes sensor telemetry.'
            }
          ]
        }
      ]
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (course: UnifiedCourse) => {
    setEditingCourse(course);
    setCurrentStep(1);
    setDuplicateWarning(null);
    setForm({ ...course });
    setIsModalOpen(true);
  };

  const handleTitleOrCodeChange = (newTitle?: string, newCode?: string) => {
    const t = newTitle !== undefined ? newTitle : form.title || '';
    const c = newCode !== undefined ? newCode : form.code || '';
    if (t.trim() && c.trim()) {
      const dup = checkDuplicateCourse(t, c, editingCourse?.id);
      if (dup.isDuplicate) {
        setDuplicateWarning(`Warning: A similar course "${dup.matchingCourse?.title}" (${dup.matchingCourse?.code}) already exists!`);
      } else {
        setDuplicateWarning(null);
      }
    }
  };

  const handleSave = () => {
    if (!form.title?.trim() || !form.code?.trim()) {
      showNotice('error', 'Course title and course code are required.');
      return;
    }

    const courseToSave: UnifiedCourse = {
      id: form.id || `yara-crs-${Date.now()}`,
      code: form.code.trim().toUpperCase(),
      title: form.title.trim(),
      slug: form.slug || form.title.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      version: form.version || '1.0',
      track: form.track || 'technology',
      category: form.category || 'python',
      level: form.level || 'Beginner',
      estimatedDurationHours: Number(form.estimatedDurationHours) || 10,
      shortSummary: form.shortSummary || form.description?.substring(0, 120) || '',
      description: form.description || '',
      thumbnailUrl: form.thumbnailUrl || 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80',
      instructorName: form.instructorName || 'YARA Engineering Faculty',
      instructorTitle: form.instructorTitle || 'Senior Robotics Instructor',
      hardwareRequired: form.hardwareRequired || [],
      learningOutcomes: form.learningOutcomes || [],
      prerequisites: form.prerequisites || [],
      accessRule: form.accessRule || 'free',
      membershipRequired: form.membershipRequired || false,
      certificationEnabled: form.certificationEnabled ?? true,
      certificationTitle: form.certificationTitle || `${form.title} Certificate`,
      certificationFeeUsd: Number(form.certificationFeeUsd) || 0,
      isPublished: form.isPublished ?? true,
      isDraft: form.isDraft ?? false,
      isFeatured: form.isFeatured ?? false,
      enrolledCount: form.enrolledCount || 0,
      rating: form.rating || 4.9,
      modules: form.modules || [],
      totalModulesCount: form.modules?.length || 0,
      createdAt: form.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    saveCourse(courseToSave);
    refreshCourses();
    setIsModalOpen(false);
    showNotice('success', `Course "${courseToSave.title}" saved successfully to LMS!`);
  };

  const filteredCourses = courses.filter(c => {
    if (selectedTrack !== 'all' && c.track !== selectedTrack) return false;
    if (selectedStatus === 'published' && (!c.isPublished || c.isDraft)) return false;
    if (selectedStatus === 'draft' && (c.isPublished && !c.isDraft)) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        c.title.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q) ||
        c.shortSummary.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Reporting Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-2xl">
          <div className="text-[10px] font-bold text-slate-400 uppercase">Total Courses</div>
          <div className="text-xl font-black text-white mt-1">{reportingStats.totalCourses}</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-2xl">
          <div className="text-[10px] font-bold text-slate-400 uppercase">Published</div>
          <div className="text-xl font-black text-emerald-400 mt-1">{reportingStats.totalPublishedCourses}</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-2xl">
          <div className="text-[10px] font-bold text-slate-400 uppercase">Active Learners</div>
          <div className="text-xl font-black text-blue-400 mt-1">{reportingStats.totalLearnersEnrolled}</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-2xl">
          <div className="text-[10px] font-bold text-slate-400 uppercase">Labs Completed</div>
          <div className="text-xl font-black text-purple-400 mt-1">{reportingStats.totalLabsCompleted}</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-2xl">
          <div className="text-[10px] font-bold text-slate-400 uppercase">Assignments</div>
          <div className="text-xl font-black text-amber-400 mt-1">{reportingStats.totalAssignmentsSubmitted}</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-2xl">
          <div className="text-[10px] font-bold text-slate-400 uppercase">Certificates</div>
          <div className="text-xl font-black text-emerald-400 mt-1">{reportingStats.totalCertificatesIssued}</div>
        </div>
      </div>

      {/* Notification Banner */}
      {notification && (
        <div className={`p-4 rounded-2xl text-xs font-bold flex items-center gap-2 ${
          notification.type === 'success' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
          notification.type === 'warning' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
          'bg-red-500/20 text-red-300 border border-red-500/30'
        }`}>
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{notification.text}</span>
        </div>
      )}

      {/* Control Bar: Search, Track filter, New Course Button */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full md:w-auto flex-1">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search courses by code or title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto scrollbar-none">
            {[
              { id: 'all', label: 'All Tracks' },
              { id: 'robotics_academy', label: 'Robotics' },
              { id: 'technology', label: 'Technology' },
              { id: 'stem', label: 'STEM' },
              { id: 'specialized', label: 'Specialized' }
            ].map(t => (
              <button
                key={t.id}
                onClick={() => setSelectedTrack(t.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                  selectedTrack === t.id
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleOpenAdd}
          className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-lg transition flex items-center gap-1.5 shrink-0 cursor-pointer w-full md:w-auto justify-center"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Course</span>
        </button>
      </div>

      {/* Courses Table / Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCourses.map(course => (
          <div
            key={course.id}
            className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 flex flex-col justify-between transition shadow-sm space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                  {course.code}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  course.isPublished
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}>
                  {course.isPublished ? 'Published' : 'Draft'}
                </span>
              </div>

              <div>
                <h4 className="text-sm font-black text-white line-clamp-1">{course.title}</h4>
                <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                  {course.shortSummary}
                </p>
              </div>

              <div className="flex items-center gap-3 text-[11px] text-slate-400 font-medium">
                <span>{course.level}</span>
                <span>•</span>
                <span>{course.modules.length} Modules</span>
                <span>•</span>
                <span>{course.estimatedDurationHours}h</span>
                <span>•</span>
                <span className="text-emerald-400 font-bold">{course.membershipRequired ? '$15 Member' : course.certificationFeeUsd > 0 ? `$${course.certificationFeeUsd} Cert` : 'Free'}</span>
              </div>
            </div>

            {/* Actions Bar */}
            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
              <button
                onClick={() => setPreviewCourse(course)}
                className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                title="Preview Course exactly as learner"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Preview</span>
              </button>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    toggleCoursePublish(course.id);
                    refreshCourses();
                    showNotice('success', `Toggled publish state for ${course.title}`);
                  }}
                  className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl transition cursor-pointer"
                  title={course.isPublished ? 'Unpublish' : 'Publish'}
                >
                  {course.isPublished ? <EyeOff className="w-3.5 h-3.5 text-amber-400" /> : <Eye className="w-3.5 h-3.5 text-emerald-400" />}
                </button>

                <button
                  onClick={() => handleOpenEdit(course)}
                  className="p-2 bg-indigo-600/30 hover:bg-indigo-600 text-indigo-300 hover:text-white rounded-xl transition cursor-pointer"
                  title="Edit Course"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => {
                    if (confirm(`Are you sure you want to delete course "${course.title}"?`)) {
                      deleteCourse(course.id);
                      refreshCourses();
                      showNotice('warning', `Deleted course ${course.title}`);
                    }
                  }}
                  className="p-2 bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white rounded-xl transition cursor-pointer"
                  title="Delete Course"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Guided Course Creation / Editing Modal (Steps 1–14 workflow) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col text-white shadow-2xl overflow-hidden relative">
            {/* Modal Header */}
            <div className="p-4 sm:p-6 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-indigo-400">
                  {editingCourse ? 'Course Editor Studio' : 'Guided Course Creation Wizard'}
                </span>
                <h3 className="text-lg font-black text-white mt-0.5">
                  {form.title || 'New YARA LMS Course'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Duplicate Warning Alert */}
            {duplicateWarning && (
              <div className="bg-amber-500/20 border-b border-amber-500/30 px-6 py-2.5 text-xs font-bold text-amber-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{duplicateWarning}</span>
              </div>
            )}

            {/* Wizard Steps Tabs */}
            <div className="px-6 py-2 bg-slate-950/40 border-b border-slate-800 flex items-center gap-2 overflow-x-auto scrollbar-none text-xs">
              {[
                { step: 1, label: '1. Basic Info' },
                { step: 2, label: '2. Modules & Labs' },
                { step: 3, label: '3. Rules & Certification' }
              ].map(s => (
                <button
                  key={s.step}
                  onClick={() => setCurrentStep(s.step)}
                  className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition cursor-pointer ${
                    currentStep === s.step
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
              {currentStep === 1 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-slate-300 mb-1">Course Code</label>
                      <input
                        type="text"
                        value={form.code}
                        onChange={(e) => {
                          setForm({ ...form, code: e.target.value });
                          handleTitleOrCodeChange(undefined, e.target.value);
                        }}
                        placeholder="e.g. YARA-TECH-PY101"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-300 mb-1">Course Title</label>
                      <input
                        type="text"
                        value={form.title}
                        onChange={(e) => {
                          setForm({ ...form, title: e.target.value });
                          handleTitleOrCodeChange(e.target.value, undefined);
                        }}
                        placeholder="e.g. Python Programming for Robotics"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block font-bold text-slate-300 mb-1">Track</label>
                      <select
                        value={form.track}
                        onChange={(e) => setForm({ ...form, track: e.target.value as any })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                      >
                        <option value="robotics_academy">YARA Robotics Academy</option>
                        <option value="technology">Technology & Programming</option>
                        <option value="stem">STEM Education & Pedagogy</option>
                        <option value="specialized">Specialized & Industrial</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-300 mb-1">Level</label>
                      <select
                        value={form.level}
                        onChange={(e) => setForm({ ...form, level: e.target.value as any })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                      >
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                        <option value="Masterclass">Masterclass</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-300 mb-1">Estimated Hours</label>
                      <input
                        type="number"
                        value={form.estimatedDurationHours}
                        onChange={(e) => setForm({ ...form, estimatedDurationHours: Number(e.target.value) })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Short Summary (1-2 sentences)</label>
                    <textarea
                      rows={2}
                      value={form.shortSummary}
                      onChange={(e) => setForm({ ...form, shortSummary: e.target.value })}
                      placeholder="Concise overview displayed on cards..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-indigo-500 resize-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Full Course Description</label>
                    <textarea
                      rows={4}
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      placeholder="Detailed learning objectives and background..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-indigo-500 resize-none"
                    />
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-white">Course Modules ({form.modules?.length || 0})</h4>
                      <p className="text-[11px] text-slate-400">Each module contains theory, short video, lab, assignment, and quiz.</p>
                    </div>
                    <button
                      onClick={() => {
                        const newModNumber = (form.modules?.length || 0) + 1;
                        const newMod: CourseModule = {
                          id: `mod-${Date.now()}-${newModNumber}`,
                          courseId: form.id || '',
                          moduleNumber: newModNumber,
                          order: newModNumber,
                          title: `Module ${newModNumber}: New Topic`,
                          coherentSkillArea: 'Applied Skill',
                          description: 'Description of module competencies.',
                          durationMinutes: 45,
                          theoryOverview: 'Theoretical framework.',
                          theoryKeyConcepts: ['Concept A', 'Concept B'],
                          videoUrl: '',
                          resources: [],
                          guidedLab: {
                            id: `lab-${Date.now()}-${newModNumber}`,
                            title: `Lab ${newModNumber}: Practical Exercise`,
                            objective: 'Execute bench procedure.',
                            equipment: ['Standard Kit'],
                            safetyRules: ['Safety first'],
                            instructions: 'Detailed steps.',
                            expectedResult: 'Pass.',
                            troubleshootingTips: []
                          },
                          quizQuestions: []
                        };
                        setForm({ ...form, modules: [...(form.modules || []), newMod] });
                      }}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Module</span>
                    </button>
                  </div>

                  <div className="space-y-3">
                    {form.modules?.map((m, idx) => (
                      <div key={m.id} className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-indigo-400">Module {m.moduleNumber}</span>
                          <button
                            onClick={() => {
                              const filtered = form.modules?.filter(x => x.id !== m.id);
                              setForm({ ...form, modules: filtered });
                            }}
                            className="text-red-400 hover:text-red-300 font-bold"
                          >
                            Remove
                          </button>
                        </div>
                        <input
                          type="text"
                          value={m.title}
                          onChange={(e) => {
                            const updated = [...(form.modules || [])];
                            updated[idx].title = e.target.value;
                            setForm({ ...form, modules: updated });
                          }}
                          placeholder="Module Title"
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white"
                        />
                        <textarea
                          rows={2}
                          value={m.theoryOverview}
                          onChange={(e) => {
                            const updated = [...(form.modules || [])];
                            updated[idx].theoryOverview = e.target.value;
                            setForm({ ...form, modules: updated });
                          }}
                          placeholder="Theory Overview"
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white resize-none"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-slate-300 mb-1">Access Rule</label>
                      <select
                        value={form.membershipRequired ? 'membership_required' : 'free'}
                        onChange={(e) => setForm({ ...form, membershipRequired: e.target.value === 'membership_required' })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                      >
                        <option value="free">Free Enrolment & Learning</option>
                        <option value="membership_required">Requires Active $15 YARA Membership</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-300 mb-1">Certification Fee (USD)</label>
                      <input
                        type="number"
                        value={form.certificationFeeUsd}
                        onChange={(e) => setForm({ ...form, certificationFeeUsd: Number(e.target.value) })}
                        placeholder="0 or 5"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Certificate Title</label>
                    <input
                      type="text"
                      value={form.certificationTitle}
                      onChange={(e) => setForm({ ...form, certificationTitle: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                    />
                  </div>

                  <div className="pt-2 flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.isPublished}
                        onChange={(e) => setForm({ ...form, isPublished: e.target.checked, isDraft: !e.target.checked })}
                      />
                      <span className="font-bold text-slate-300">Publish immediately in LMS Catalogue</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.isFeatured}
                        onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
                      />
                      <span className="font-bold text-slate-300">Featured Course on Home Page</span>
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
              <div>
                {currentStep > 1 && (
                  <button
                    onClick={() => setCurrentStep(prev => prev - 1)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold"
                  >
                    Previous Step
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                {currentStep < 3 ? (
                  <button
                    onClick={() => setCurrentStep(prev => prev + 1)}
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold"
                  >
                    Next Step
                  </button>
                ) : (
                  <button
                    onClick={handleSave}
                    className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black shadow-lg"
                  >
                    Save & Publish Course
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Course Preview Modal */}
      {previewCourse && (
        <UniversalCoursePlayerModal
          course={previewCourse}
          isOpen={true}
          onClose={() => setPreviewCourse(null)}
          userId="admin_preview_user"
          userName="Admin Preview"
          userEmail="admin@yara.org"
        />
      )}
    </div>
  );
};
