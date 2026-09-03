import React, { useState, useEffect, useRef } from 'react';
import {
  Code2, Plus, Search, Filter, Play, CheckCircle2, Lock, Clock, Star,
  Award, Users, ChevronDown, ChevronUp, Edit3, Trash2, Eye, EyeOff,
  BookOpen, Layers, Sparkles, ArrowRight, Video, FileText, HelpCircle,
  FolderOpen, AlertCircle, X, Save, Upload, GraduationCap, Zap
} from 'lucide-react';
import {
  ProgrammingCourse,
  CourseCategory,
  CourseDifficulty,
  COURSE_CATEGORY_LABELS,
  COURSE_CATEGORY_COLORS,
  DIFFICULTY_LABELS,
  DIFFICULTY_COLORS,
  CourseFormData,
  CourseModule
} from '../../../types/lmsCourseTypes';
import {
  getAllCourses,
  getPublishedCourses,
  saveCourse,
  deleteCourse,
  toggleCoursePublish,
  enrollUserInCourse,
  getEnrollment,
  completeModule,
  getUserEnrollments,
  generateCourseId,
  generateModuleId,
  getUserCourseStats,
  getAllUserProgrammingCertificates,
} from '../../../services/programmingCoursesService';
import { useAuth } from '../../AuthContext';

interface Props {
  userId: string;
  studentName: string;
  userEmail: string;
  onNavigateTab?: (tab: any) => void;
}

const EMPTY_FORM: CourseFormData = {
  title: '',
  subtitle: '',
  description: '',
  category: 'python',
  difficulty: 'beginner',
  coverImageUrl: '',
  estimatedHours: 4,
  instructorName: 'YARA Faculty',
  instructorTitle: 'STEM Educator',
  tags: '',
  learningOutcomes: '',
  prerequisites: '',
  certificationEnabled: true,
  certificationTitle: '',
  isPublished: false,
};

// ─── Toast ────────────────────────────────────────────────────────────────────
const Toast: React.FC<{ msg: string; type?: 'success' | 'error'; onClose: () => void }> = ({ msg, type = 'success', onClose }) => {
  useEffect(() => { const t = setTimeout(onClose, 4000); return () => clearTimeout(t); }, []);
  return (
    <div className={`fixed bottom-6 right-6 z-[200] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl text-sm font-semibold animate-fade-up text-white ${type === 'success' ? '' : 'bg-red-600'}`}
      style={type === 'success' ? { background: 'linear-gradient(135deg, #059669, #4f46e5)' } : undefined}>
      {type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
      {msg}
      <button onClick={onClose} className="ml-1 opacity-70 hover:opacity-100"><X className="w-3.5 h-3.5" /></button>
    </div>
  );
};

// ─── Module Editor ─────────────────────────────────────────────────────────────
const ModuleEditor: React.FC<{
  modules: CourseModule[];
  courseId: string;
  onChange: (modules: CourseModule[]) => void;
}> = ({ modules, courseId, onChange }) => {
  const addModule = () => {
    const newMod: CourseModule = {
      id: generateModuleId(),
      courseId,
      title: '',
      description: '',
      type: 'video',
      order: modules.length + 1,
      durationMinutes: 20,
      videoUrl: '',
      quizQuestions: [],
    };
    onChange([...modules, newMod]);
  };

  const updateModule = (idx: number, updates: Partial<CourseModule>) => {
    const updated = modules.map((m, i) => i === idx ? { ...m, ...updates } : m);
    onChange(updated);
  };

  const removeModule = (idx: number) => {
    onChange(modules.filter((_, i) => i !== idx));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-700">Course Modules ({modules.length})</span>
        <button onClick={addModule} className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 transition">
          <Plus className="w-3.5 h-3.5" /> Add Module
        </button>
      </div>

      {modules.length === 0 && (
        <div className="p-6 border-2 border-dashed border-slate-200 rounded-xl text-center text-xs text-slate-400">
          No modules yet. Add your first module above.
        </div>
      )}

      {modules.map((mod, idx) => (
        <div key={mod.id} className="border border-slate-200 rounded-xl p-4 bg-slate-50 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-black flex items-center justify-center shrink-0">{idx + 1}</span>
            <input
              className="flex-1 input-premium text-xs py-1.5"
              placeholder="Module title…"
              value={mod.title}
              onChange={e => updateModule(idx, { title: e.target.value })}
            />
            <select
              className="input-premium text-xs py-1.5 w-32 shrink-0"
              value={mod.type}
              onChange={e => updateModule(idx, { type: e.target.value as any })}
            >
              <option value="video">📹 Video</option>
              <option value="reading">📖 Reading</option>
              <option value="quiz">❓ Quiz</option>
              <option value="project">🛠️ Project</option>
            </select>
            <input
              type="number"
              className="input-premium text-xs py-1.5 w-20 shrink-0"
              placeholder="Mins"
              value={mod.durationMinutes}
              onChange={e => updateModule(idx, { durationMinutes: parseInt(e.target.value) || 0 })}
            />
            <button onClick={() => removeModule(idx)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>

          <input
            className="w-full input-premium text-xs py-1.5"
            placeholder="Short description of this module…"
            value={mod.description}
            onChange={e => updateModule(idx, { description: e.target.value })}
          />

          {mod.type === 'video' && (
            <input
              className="w-full input-premium text-xs py-1.5"
              placeholder="Video URL (YouTube embed, Vimeo, or direct .mp4)…"
              value={mod.videoUrl || ''}
              onChange={e => updateModule(idx, { videoUrl: e.target.value })}
            />
          )}
          {mod.type === 'reading' && (
            <textarea
              className="w-full input-premium text-xs py-1.5 resize-none"
              rows={3}
              placeholder="Reading content (Markdown supported)…"
              value={mod.readingContent || ''}
              onChange={e => updateModule(idx, { readingContent: e.target.value })}
            />
          )}
          {mod.type === 'project' && (
            <textarea
              className="w-full input-premium text-xs py-1.5 resize-none"
              rows={3}
              placeholder="Project instructions…"
              value={mod.projectInstructions || ''}
              onChange={e => updateModule(idx, { projectInstructions: e.target.value })}
            />
          )}
        </div>
      ))}
    </div>
  );
};

// ─── Course Form Modal ──────────────────────────────────────────────────────────
const CourseFormModal: React.FC<{
  course?: ProgrammingCourse | null;
  onSave: (course: ProgrammingCourse) => void;
  onClose: () => void;
}> = ({ course, onSave, onClose }) => {
  const [form, setForm] = useState<CourseFormData>(
    course ? {
      title: course.title, subtitle: course.subtitle, description: course.description,
      category: course.category, difficulty: course.difficulty,
      coverImageUrl: course.coverImageUrl || '', estimatedHours: course.estimatedHours,
      instructorName: course.instructorName, instructorTitle: course.instructorTitle || '',
      tags: course.tags.join(', '), learningOutcomes: course.learningOutcomes.join('\n'),
      prerequisites: (course.prerequisites || []).join('\n'),
      certificationEnabled: course.certificationEnabled,
      certificationTitle: course.certificationTitle || '',
      isPublished: course.isPublished,
    } : EMPTY_FORM
  );
  const [modules, setModules] = useState<CourseModule[]>(course?.modules || []);
  const [saving, setSaving] = useState(false);

  const set = (key: keyof CourseFormData, val: any) => setForm(f => ({ ...f, [key]: val }));

  const handleSave = async () => {
    if (!form.title.trim() || !form.description.trim()) return;
    setSaving(true);
    const courseId = course?.id || generateCourseId();
    const newCourse: ProgrammingCourse = {
      id: courseId,
      title: form.title.trim(),
      subtitle: form.subtitle.trim(),
      description: form.description.trim(),
      category: form.category,
      difficulty: form.difficulty,
      coverImageUrl: form.coverImageUrl.trim() || undefined,
      estimatedHours: form.estimatedHours,
      instructorName: form.instructorName.trim(),
      instructorTitle: form.instructorTitle.trim(),
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      learningOutcomes: form.learningOutcomes.split('\n').map(l => l.trim()).filter(Boolean),
      prerequisites: form.prerequisites.split('\n').map(l => l.trim()).filter(Boolean),
      certificationEnabled: form.certificationEnabled,
      certificationTitle: form.certificationTitle.trim() || `YARA ${form.title} Certificate`,
      isPublished: form.isPublished,
      enrolledCount: course?.enrolledCount || 0,
      modules: modules.map((m, i) => ({ ...m, courseId, order: i + 1 })),
      createdAt: course?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const saved = saveCourse(newCourse);
    setSaving(false);
    onSave(saved);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-3xl my-8 bg-white rounded-3xl shadow-2xl border border-slate-200 animate-scale-in overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between"
          style={{ background: 'linear-gradient(135deg, #0f172a, #1e1b4b)' }}>
          <div>
            <h2 className="text-lg font-black text-white">{course ? 'Edit Course' : 'Create New Course'}</h2>
            <p className="text-xs text-slate-400 mt-0.5">All fields marked are required for a great learner experience</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Basic Info */}
          <section className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-2">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="text-xs font-bold text-slate-700 block mb-1.5">Course Title *</label>
                <input className="input-premium" placeholder="e.g. Python for Young Innovators" value={form.title} onChange={e => set('title', e.target.value)} />
              </div>
              <div className="md:col-span-2">
                <label className="text-xs font-bold text-slate-700 block mb-1.5">Subtitle</label>
                <input className="input-premium" placeholder="One-line course tagline…" value={form.subtitle} onChange={e => set('subtitle', e.target.value)} />
              </div>
              <div className="md:col-span-2">
                <label className="text-xs font-bold text-slate-700 block mb-1.5">Description *</label>
                <textarea className="input-premium resize-none" rows={3} placeholder="What will learners gain from this course?" value={form.description} onChange={e => set('description', e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">Category *</label>
                <select className="input-premium" value={form.category} onChange={e => set('category', e.target.value)}>
                  {(Object.keys(COURSE_CATEGORY_LABELS) as CourseCategory[]).map(cat => (
                    <option key={cat} value={cat}>{COURSE_CATEGORY_LABELS[cat]}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">Difficulty</label>
                <select className="input-premium" value={form.difficulty} onChange={e => set('difficulty', e.target.value)}>
                  <option value="beginner">🟢 Beginner</option>
                  <option value="intermediate">🟡 Intermediate</option>
                  <option value="advanced">🔴 Advanced</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">Estimated Hours</label>
                <input type="number" className="input-premium" value={form.estimatedHours} onChange={e => set('estimatedHours', parseFloat(e.target.value) || 0)} min={0.5} step={0.5} />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">Cover Image URL</label>
                <input className="input-premium" placeholder="https://… (Unsplash works great)" value={form.coverImageUrl} onChange={e => set('coverImageUrl', e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">Instructor Name</label>
                <input className="input-premium" value={form.instructorName} onChange={e => set('instructorName', e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">Instructor Title</label>
                <input className="input-premium" placeholder="e.g. STEM Education Specialist" value={form.instructorTitle} onChange={e => set('instructorTitle', e.target.value)} />
              </div>
              <div className="md:col-span-2">
                <label className="text-xs font-bold text-slate-700 block mb-1.5">Tags (comma-separated)</label>
                <input className="input-premium" placeholder="Python, Coding, STEM, Beginner…" value={form.tags} onChange={e => set('tags', e.target.value)} />
              </div>
              <div className="md:col-span-2">
                <label className="text-xs font-bold text-slate-700 block mb-1.5">Learning Outcomes (one per line)</label>
                <textarea className="input-premium resize-none" rows={3} placeholder={"Write Python scripts confidently\nUnderstand loops and functions\n…"} value={form.learningOutcomes} onChange={e => set('learningOutcomes', e.target.value)} />
              </div>
              <div className="md:col-span-2">
                <label className="text-xs font-bold text-slate-700 block mb-1.5">Prerequisites (one per line, or leave blank)</label>
                <textarea className="input-premium resize-none" rows={2} placeholder="e.g. Basic computer skills" value={form.prerequisites} onChange={e => set('prerequisites', e.target.value)} />
              </div>
            </div>
          </section>

          {/* Certification */}
          <section className="space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-2">Certification Settings</h3>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={form.certificationEnabled} onChange={e => set('certificationEnabled', e.target.checked)}
                className="w-4 h-4 rounded accent-indigo-600" />
              <span className="text-xs font-semibold text-slate-700">Award certificate upon completion</span>
            </label>
            {form.certificationEnabled && (
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">Certificate Title</label>
                <input className="input-premium" placeholder="e.g. YARA Python Fundamentals Certificate" value={form.certificationTitle} onChange={e => set('certificationTitle', e.target.value)} />
              </div>
            )}
          </section>

          {/* Modules */}
          <section className="space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-2">Course Modules</h3>
            <ModuleEditor modules={modules} courseId={course?.id || 'temp'} onChange={setModules} />
          </section>

          {/* Publish */}
          <section>
            <label className="flex items-center gap-3 cursor-pointer p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
              <input type="checkbox" checked={form.isPublished} onChange={e => set('isPublished', e.target.checked)}
                className="w-4 h-4 rounded accent-emerald-600" />
              <div>
                <span className="text-xs font-bold text-emerald-900 block">Publish immediately</span>
                <span className="text-[11px] text-emerald-700">Learners will see this course in the catalog</span>
              </div>
            </label>
          </section>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between gap-3 bg-slate-50">
          <button onClick={onClose} className="px-5 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200 rounded-xl transition">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !form.title.trim() || !form.description.trim()}
            className="flex items-center gap-2 px-6 py-2.5 text-xs font-black text-white rounded-xl transition disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #4f46e5, #059669)' }}
          >
            <Save className="w-3.5 h-3.5" />
            {saving ? 'Saving…' : course ? 'Save Changes' : 'Create Course'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Course Card ────────────────────────────────────────────────────────────────
const CourseCard: React.FC<{
  course: ProgrammingCourse;
  enrollment?: any;
  isAdmin: boolean;
  onEnroll: () => void;
  onContinue: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onTogglePublish: () => void;
  onOpenCourse: () => void;
}> = ({ course, enrollment, isAdmin, onEnroll, onContinue, onEdit, onDelete, onTogglePublish, onOpenCourse }) => {
  const [expanded, setExpanded] = useState(false);
  const colors = COURSE_CATEGORY_COLORS[course.category];
  const isEnrolled = !!enrollment;
  const isCompleted = enrollment?.isCompleted;
  const progress = enrollment?.progressPercent || 0;
  const moduleTypeIcons = { video: '📹', reading: '📖', quiz: '❓', project: '🛠️' };

  return (
    <div className={`bg-white border rounded-2xl overflow-hidden transition-all duration-200 group ${isCompleted ? 'border-emerald-200' : 'border-slate-200 hover:border-indigo-300'}`}
      style={{ boxShadow: '0 1px 4px rgba(15,23,42,0.06)' }}>
      {/* Course cover */}
      <div className="relative h-36 overflow-hidden">
        {course.coverImageUrl ? (
          <img src={course.coverImageUrl} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0f172a, #1e1b4b)' }}>
            <Code2 className="w-12 h-12 text-indigo-400/60" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          <span className={`badge ${colors.bg} ${colors.text} ${colors.border} border text-[9px]`}>
            {COURSE_CATEGORY_LABELS[course.category]}
          </span>
          <span className={`badge bg-white border border-slate-200 ${DIFFICULTY_COLORS[course.difficulty]} text-[9px]`}>
            {DIFFICULTY_LABELS[course.difficulty]}
          </span>
        </div>

        {/* Admin controls */}
        {isAdmin && (
          <div className="absolute top-3 right-3 flex gap-1">
            <button onClick={onEdit} className="p-1.5 bg-white/90 hover:bg-white rounded-lg text-slate-700 hover:text-indigo-600 transition shadow-sm">
              <Edit3 className="w-3 h-3" />
            </button>
            <button onClick={onTogglePublish} className={`p-1.5 rounded-lg transition shadow-sm ${course.isPublished ? 'bg-emerald-500/90 text-white' : 'bg-white/90 text-slate-500'}`}>
              {course.isPublished ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
            </button>
            <button onClick={onDelete} className="p-1.5 bg-red-500/90 hover:bg-red-600 rounded-lg text-white transition shadow-sm">
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* Status overlay for completed */}
        {isCompleted && (
          <div className="absolute bottom-3 right-3">
            <span className="flex items-center gap-1 px-2.5 py-1 bg-emerald-500 text-white text-[10px] font-black rounded-full shadow-md">
              <CheckCircle2 className="w-3 h-3" /> Completed
            </span>
          </div>
        )}

        {/* Draft badge */}
        {!course.isPublished && (
          <div className="absolute bottom-3 left-3">
            <span className="px-2 py-0.5 bg-slate-700/90 text-slate-300 text-[10px] font-bold rounded-full">Draft</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <div>
          <h3 className="text-sm font-black text-slate-900 leading-snug group-hover:text-indigo-700 transition line-clamp-2">{course.title}</h3>
          {course.subtitle && <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{course.subtitle}</p>}
        </div>

        {/* Meta */}
        <div className="flex items-center gap-3 text-[11px] text-slate-500">
          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {course.estimatedHours}h</span>
          <span className="flex items-center gap-1"><Layers className="w-3 h-3" /> {course.modules.length} modules</span>
          {course.certificationEnabled && (
            <span className="flex items-center gap-1 text-amber-600"><Award className="w-3 h-3" /> Certificate</span>
          )}
        </div>

        {/* Progress bar for enrolled */}
        {isEnrolled && !isCompleted && (
          <div className="space-y-1">
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>Progress</span><span className="font-bold text-indigo-600">{progress}%</span>
            </div>
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #4f46e5, #10b981)' }} />
            </div>
          </div>
        )}

        {/* Instructor */}
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-[9px] font-black shrink-0">
            {course.instructorName[0]}
          </div>
          <span className="text-[11px] text-slate-600 font-medium truncate">{course.instructorName}</span>
        </div>

        {/* Expandable outcomes */}
        {expanded && (
          <div className="bg-slate-50 rounded-xl p-3 space-y-2 border border-slate-100 animate-fade-up">
            {course.description && <p className="text-[11px] text-slate-600 leading-relaxed">{course.description}</p>}
            {course.learningOutcomes.length > 0 && (
              <div>
                <div className="text-[10px] font-black uppercase text-slate-500 mb-1.5">What you'll learn</div>
                <ul className="space-y-1">
                  {course.learningOutcomes.map((outcome, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-[11px] text-slate-700">
                      <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0 mt-0.5" />
                      {outcome}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {course.modules.length > 0 && (
              <div>
                <div className="text-[10px] font-black uppercase text-slate-500 mb-1.5">Modules</div>
                <ul className="space-y-1">
                  {course.modules.map((m, i) => (
                    <li key={i} className="flex items-center gap-1.5 text-[11px] text-slate-600">
                      <span>{(moduleTypeIcons as any)[m.type] || '📌'}</span>
                      <span>{m.title}</span>
                      <span className="text-slate-400 ml-auto">{m.durationMinutes}m</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
          <button onClick={() => setExpanded(e => !e)} className="text-[11px] text-slate-500 hover:text-slate-900 flex items-center gap-0.5 transition">
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            {expanded ? 'Less' : 'Preview'}
          </button>
          <div className="flex-1" />
          {isCompleted ? (
            <button onClick={onOpenCourse} className="flex items-center gap-1.5 px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold rounded-xl hover:bg-emerald-100 transition">
              <GraduationCap className="w-3.5 h-3.5" /> Certificate
            </button>
          ) : isEnrolled ? (
            <button onClick={onContinue} className="flex items-center gap-1.5 px-4 py-2 text-white text-xs font-black rounded-xl hover:opacity-90 transition"
              style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}>
              <Play className="w-3.5 h-3.5 fill-white" /> Continue
            </button>
          ) : (
            <button onClick={onEnroll} className="flex items-center gap-1.5 px-4 py-2 text-white text-xs font-black rounded-xl hover:opacity-90 transition"
              style={{ background: 'linear-gradient(135deg, #059669, #10b981)' }}>
              <Zap className="w-3.5 h-3.5" /> Enroll Free
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Course Player Modal ──────────────────────────────────────────────────────────
const CoursePlayerModal: React.FC<{
  course: ProgrammingCourse;
  enrollment: any;
  userId: string;
  studentName: string;
  onClose: () => void;
  onProgress: () => void;
  onCertificateEarned: (courseName: string) => void;
}> = ({ course, enrollment, userId, studentName, onClose, onProgress, onCertificateEarned }) => {
  const [activeModuleIdx, setActiveModuleIdx] = useState(0);
  const [marked, setMarked] = useState(false);

  const activeModule = course.modules[activeModuleIdx];
  const completedIds = enrollment?.completedModuleIds || [];
  const isModuleCompleted = completedIds.includes(activeModule?.id);

  const handleMarkComplete = () => {
    if (!activeModule) return;
    const { enrollment: updated, certificateEarned } = completeModule(userId, course.id, activeModule.id);
    setMarked(true);
    onProgress();
    if (certificateEarned) {
      onCertificateEarned(course.title);
    }
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-3 bg-slate-950/80 backdrop-blur-sm">
      <div className="w-full max-w-5xl max-h-[92vh] bg-slate-900 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl flex flex-col animate-scale-in">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-indigo-600/20 flex items-center justify-center">
              <Code2 className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-black text-white truncate">{course.title}</h3>
              <p className="text-[11px] text-slate-400">{COURSE_CATEGORY_LABELS[course.category]}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar – module list */}
          <div className="w-60 border-r border-slate-800 flex flex-col shrink-0 overflow-y-auto">
            <div className="p-3 border-b border-slate-800">
              <div className="text-[10px] font-black uppercase text-slate-500">Course Modules</div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                {completedIds.length} / {course.modules.length} completed
              </div>
              <div className="h-1.5 bg-slate-800 rounded-full mt-2 overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full transition-all"
                  style={{ width: `${course.modules.length > 0 ? (completedIds.length / course.modules.length) * 100 : 0}%` }} />
              </div>
            </div>
            {course.modules.map((m, i) => {
              const done = completedIds.includes(m.id);
              const icons = { video: <Video className="w-3 h-3" />, reading: <FileText className="w-3 h-3" />, quiz: <HelpCircle className="w-3 h-3" />, project: <FolderOpen className="w-3 h-3" /> };
              return (
                <button key={m.id} onClick={() => { setActiveModuleIdx(i); setMarked(false); }}
                  className={`w-full text-left px-3 py-3 flex items-start gap-2.5 border-b border-slate-800/60 transition text-xs ${activeModuleIdx === i ? 'bg-indigo-600/20 text-indigo-300' : done ? 'text-emerald-400 hover:bg-slate-800/50' : 'text-slate-400 hover:bg-slate-800/50'}`}>
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${done ? 'bg-emerald-500/20' : 'bg-slate-800'}`}>
                    {done ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : ((icons as any)[m.type] || <BookOpen className="w-3 h-3" />)}
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold leading-snug line-clamp-2">{m.title}</div>
                    <div className="text-[10px] opacity-60 mt-0.5">{m.durationMinutes}m</div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Main area */}
          <div className="flex-1 flex flex-col overflow-y-auto">
            {activeModule ? (
              <div className="p-6 space-y-5">
                <div>
                  <div className="text-xs text-slate-500 uppercase tracking-wider font-bold mb-1">Module {activeModuleIdx + 1}</div>
                  <h2 className="text-lg font-black text-white">{activeModule.title}</h2>
                  <p className="text-xs text-slate-400 mt-1">{activeModule.description}</p>
                </div>

                {/* Content area */}
                {activeModule.type === 'video' && (
                  <div className="aspect-video bg-slate-800 rounded-2xl flex items-center justify-center border border-slate-700 overflow-hidden">
                    {activeModule.videoUrl ? (
                      <iframe src={activeModule.videoUrl} className="w-full h-full" allowFullScreen title={activeModule.title} />
                    ) : (
                      <div className="text-center text-slate-500 space-y-2">
                        <Video className="w-10 h-10 mx-auto opacity-40" />
                        <p className="text-xs">No video URL configured</p>
                        <p className="text-[11px] text-slate-600">Admin: add a video URL to this module</p>
                      </div>
                    )}
                  </div>
                )}

                {activeModule.type === 'reading' && (
                  <div className="bg-slate-800/60 rounded-2xl p-5 border border-slate-700">
                    {activeModule.readingContent ? (
                      <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{activeModule.readingContent}</p>
                    ) : (
                      <p className="text-xs text-slate-500 italic">Reading content not yet added.</p>
                    )}
                  </div>
                )}

                {activeModule.type === 'project' && (
                  <div className="bg-slate-800/60 rounded-2xl p-5 border border-slate-700 space-y-3">
                    <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                      <FolderOpen className="w-4 h-4" /> Project Instructions
                    </div>
                    {activeModule.projectInstructions ? (
                      <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{activeModule.projectInstructions}</p>
                    ) : (
                      <p className="text-xs text-slate-500 italic">Project instructions not yet added.</p>
                    )}
                  </div>
                )}

                {activeModule.type === 'quiz' && (
                  <div className="bg-slate-800/60 rounded-2xl p-5 border border-slate-700 text-center space-y-3">
                    <HelpCircle className="w-10 h-10 text-indigo-400 mx-auto" />
                    <p className="text-sm text-slate-300">Quiz module</p>
                    <p className="text-xs text-slate-500">Interactive quiz coming soon — mark complete to proceed</p>
                  </div>
                )}

                {/* Mark complete */}
                <div className="flex items-center gap-3">
                  {isModuleCompleted || marked ? (
                    <div className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold rounded-xl">
                      <CheckCircle2 className="w-4 h-4" /> Module Completed
                    </div>
                  ) : (
                    <button onClick={handleMarkComplete} className="flex items-center gap-2 px-5 py-2.5 text-white text-xs font-black rounded-xl hover:opacity-90 transition"
                      style={{ background: 'linear-gradient(135deg, #059669, #4f46e5)' }}>
                      <CheckCircle2 className="w-4 h-4" /> Mark as Complete
                    </button>
                  )}

                  {activeModuleIdx < course.modules.length - 1 && (
                    <button onClick={() => { setActiveModuleIdx(i => i + 1); setMarked(false); }}
                      className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition">
                      Next Module <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-slate-500 text-xs">
                Select a module to start learning
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── MAIN COMPONENT ────────────────────────────────────────────────────────────
export const ProgrammingCoursesTab: React.FC<Props> = ({ userId, studentName, userEmail, onNavigateTab }) => {
  const { profile } = useAuth();
  const isAdmin = profile?.role === 'admin';

  const [courses, setCourses] = useState<ProgrammingCourse[]>([]);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<CourseCategory | 'all'>('all');
  const [difficultyFilter, setDifficultyFilter] = useState<CourseDifficulty | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<ProgrammingCourse | null>(null);
  const [activeCourse, setActiveCourse] = useState<ProgrammingCourse | null>(null);
  const [toast, setToast] = useState<{ msg: string; type?: 'success' | 'error' } | null>(null);
  const [stats, setStats] = useState({ enrolled: 0, completed: 0, certificatesEarned: 0, inProgress: 0 });

  const loadData = () => {
    const allCourses = isAdmin ? getAllCourses() : getPublishedCourses();
    setCourses(allCourses);
    setEnrollments(getUserEnrollments(userId));
    setStats(getUserCourseStats(userId));
  };

  useEffect(() => { loadData(); }, [userId, isAdmin]);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => setToast({ msg, type });

  const filteredCourses = courses.filter(c => {
    if (categoryFilter !== 'all' && c.category !== categoryFilter) return false;
    if (difficultyFilter !== 'all' && c.difficulty !== difficultyFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return c.title.toLowerCase().includes(q) || c.description.toLowerCase().includes(q) || c.tags.some(t => t.toLowerCase().includes(q));
    }
    return true;
  });

  const handleEnroll = (course: ProgrammingCourse) => {
    enrollUserInCourse(userId, course.id);
    loadData();
    showToast(`✅ Enrolled in "${course.title}"`);
  };

  const handleDelete = (course: ProgrammingCourse) => {
    if (!confirm(`Delete "${course.title}"? This cannot be undone.`)) return;
    deleteCourse(course.id);
    loadData();
    showToast(`Deleted "${course.title}"`, 'error');
  };

  const handleTogglePublish = (course: ProgrammingCourse) => {
    toggleCoursePublish(course.id);
    loadData();
    showToast(`${course.isPublished ? 'Unpublished' : 'Published'} "${course.title}"`);
  };

  const handleSaveCourse = (saved: ProgrammingCourse) => {
    loadData();
    setShowFormModal(false);
    setEditingCourse(null);
    showToast(`🎓 Course "${saved.title}" saved!`);
  };

  const certs = getAllUserProgrammingCertificates(userId);

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl text-white p-6 sm:p-10 border border-slate-800"
        style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0c1a2e 100%)' }}>
        <div className="orb w-80 h-80 bg-indigo-600/20 -top-20 -right-20" />
        <div className="orb-reverse orb w-60 h-60 bg-emerald-500/10 -bottom-10 left-1/3" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-4 max-w-2xl">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-2xl bg-indigo-600/30 border border-indigo-500/30 flex items-center justify-center">
                <Code2 className="w-5 h-5 text-indigo-300" />
              </div>
              <div>
                <div className="text-[9px] font-black uppercase tracking-widest text-indigo-400">YARA Learning Academy</div>
                <h1 className="text-xl sm:text-3xl font-black tracking-tight leading-tight text-white">
                  Programming Courses
                </h1>
              </div>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed max-w-xl">
              Learn Python, JavaScript, Scratch block coding, and more — with certification upon completion. 
              All courses are curated by YARA faculty for young innovators.
            </p>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
              {(['python', 'javascript', 'scratch', 'web_development', 'data_science'] as CourseCategory[]).map(cat => (
                <span key={cat} className={`px-2.5 py-1 rounded-full border text-[10px] font-bold ${COURSE_CATEGORY_COLORS[cat].bg} ${COURSE_CATEGORY_COLORS[cat].text} ${COURSE_CATEGORY_COLORS[cat].border}`}>
                  {COURSE_CATEGORY_LABELS[cat]}
                </span>
              ))}
            </div>
          </div>

          {/* Stats cards */}
          <div className="grid grid-cols-2 gap-3 w-full lg:w-auto shrink-0">
            {[
              { label: 'Enrolled', value: stats.enrolled, icon: BookOpen, color: 'text-indigo-400' },
              { label: 'Completed', value: stats.completed, icon: CheckCircle2, color: 'text-emerald-400' },
              { label: 'In Progress', value: stats.inProgress, icon: Zap, color: 'text-amber-400' },
              { label: 'Certificates', value: stats.certificatesEarned, icon: Award, color: 'text-purple-400' },
            ].map(stat => (
              <div key={stat.label} className="glass-dark rounded-2xl p-4">
                <stat.icon className={`w-4 h-4 ${stat.color} mb-2`} />
                <div className="text-2xl font-black text-white">{stat.value}</div>
                <div className="text-[10px] text-slate-400 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Certificates earned banner */}
      {certs.length > 0 && (
        <div className="p-4 rounded-2xl border border-amber-200 bg-amber-50 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
              <Award className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <div className="text-xs font-black text-amber-900">
                🎓 You have {certs.length} Programming Certificate{certs.length > 1 ? 's' : ''} earned!
              </div>
              <div className="text-[11px] text-amber-700">{certs.map(c => c.courseTitle).join(' · ')}</div>
            </div>
          </div>
          {onNavigateTab && (
            <button onClick={() => onNavigateTab('certificates')}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl transition shrink-0">
              View Certificates
            </button>
          )}
        </div>
      )}

      {/* Admin – Add Course CTA */}
      {isAdmin && (
        <div className="flex items-center justify-between p-4 rounded-2xl bg-indigo-50 border border-indigo-200">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-indigo-600" />
            </div>
            <div>
              <div className="text-xs font-black text-indigo-900">Admin: Course Management</div>
              <div className="text-[11px] text-indigo-700">Create, edit, and publish programming courses for learners</div>
            </div>
          </div>
          <button onClick={() => { setEditingCourse(null); setShowFormModal(true); }}
            className="flex items-center gap-2 px-5 py-2.5 text-white text-xs font-black rounded-xl hover:opacity-90 transition"
            style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}>
            <Plus className="w-4 h-4" /> Add New Course
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input type="text" placeholder="Search courses (Python, web, Scratch…)"
              value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition" />
          </div>
          <select value={difficultyFilter} onChange={e => setDifficultyFilter(e.target.value as any)}
            className="input-premium text-xs py-2.5 w-full sm:w-40 shrink-0">
            <option value="all">All Levels</option>
            <option value="beginner">🟢 Beginner</option>
            <option value="intermediate">🟡 Intermediate</option>
            <option value="advanced">🔴 Advanced</option>
          </select>
        </div>

        {/* Category pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1">
          <button onClick={() => setCategoryFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition shrink-0 ${categoryFilter === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
            All Languages
          </button>
          {(Object.keys(COURSE_CATEGORY_LABELS) as CourseCategory[]).map(cat => (
            <button key={cat} onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition shrink-0 ${categoryFilter === cat ? `${COURSE_CATEGORY_COLORS[cat].bg} ${COURSE_CATEGORY_COLORS[cat].text} border ${COURSE_CATEGORY_COLORS[cat].border}` : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
              {COURSE_CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>
      </div>

      {/* Course Grid */}
      {filteredCourses.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-16 text-center">
          <Code2 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-sm font-bold text-slate-500">No courses match your filter</p>
          <p className="text-xs text-slate-400 mt-1">Try resetting filters or adding a new course</p>
          {isAdmin && (
            <button onClick={() => setShowFormModal(true)} className="mt-4 px-5 py-2.5 text-white text-xs font-bold rounded-xl"
              style={{ background: 'linear-gradient(135deg, #4f46e5, #059669)' }}>
              <Plus className="w-3.5 h-3.5 inline mr-1.5" /> Create First Course
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredCourses.map(course => {
            const enrollment = enrollments.find(e => e.courseId === course.id);
            return (
              <CourseCard
                key={course.id}
                course={course}
                enrollment={enrollment}
                isAdmin={isAdmin}
                onEnroll={() => handleEnroll(course)}
                onContinue={() => setActiveCourse(course)}
                onOpenCourse={() => onNavigateTab?.('certificates')}
                onEdit={() => { setEditingCourse(course); setShowFormModal(true); }}
                onDelete={() => handleDelete(course)}
                onTogglePublish={() => handleTogglePublish(course)}
              />
            );
          })}
        </div>
      )}

      {/* Modals */}
      {showFormModal && (
        <CourseFormModal
          course={editingCourse}
          onSave={handleSaveCourse}
          onClose={() => { setShowFormModal(false); setEditingCourse(null); }}
        />
      )}

      {activeCourse && (
        <CoursePlayerModal
          course={activeCourse}
          enrollment={enrollments.find(e => e.courseId === activeCourse.id)}
          userId={userId}
          studentName={studentName}
          onClose={() => { setActiveCourse(null); loadData(); }}
          onProgress={loadData}
          onCertificateEarned={(courseName) => {
            showToast(`🎓 Certificate Earned: ${courseName}!`);
            loadData();
          }}
        />
      )}

      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};
