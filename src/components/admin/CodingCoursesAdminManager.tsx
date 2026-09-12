import React, { useState, useEffect } from 'react';
import { 
  Code, Plus, Edit2, Trash2, Eye, EyeOff, Save, X, Search, 
  Sparkles, CheckCircle2, BookOpen, Video, Layers, Award, RefreshCw, AlertCircle
} from 'lucide-react';
import { 
  ProgrammingCourse, 
  CourseCategory, 
  CourseDifficulty, 
  CourseModule 
} from '../../types/lmsCourseTypes';
import { 
  getAllCourses, 
  saveCourse, 
  deleteCourse, 
  toggleCoursePublish,
  generateCourseId,
  generateModuleId
} from '../../services/programmingCoursesService';

export const CodingCoursesAdminManager: React.FC = () => {
  const [courses, setCourses] = useState<ProgrammingCourse[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<ProgrammingCourse | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form state
  const [form, setForm] = useState({
    title: '',
    subtitle: '',
    description: '',
    category: 'python' as CourseCategory,
    difficulty: 'beginner' as CourseDifficulty,
    estimatedHours: 12,
    instructorName: 'YARA Engineering Faculty',
    instructorTitle: 'Senior Robotics & Coding Instructor',
    coverImageUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80',
    tags: 'python, coding, robotics',
    prerequisites: 'Basic Computer Literacy',
    learningOutcomes: 'Write Python programs, Control motors & sensors, Understand algorithms',
    certificationEnabled: true,
    certificationTitle: 'Certified Python Developer for Robotics',
    isPublished: true,
    modules: [
      {
        id: generateModuleId(),
        courseId: '',
        title: 'Module 1: Introduction & Fundamentals',
        description: 'Getting started with syntax, variables, and basic commands.',
        type: 'video' as const,
        order: 1,
        durationMinutes: 20,
        videoUrl: 'https://www.youtube.com/watch?v=kqtD5dpn9C8',
        readingContent: 'Welcome to coding with YARA! Practice running code snippets.'
      }
    ]
  });

  const refreshCourses = () => {
    setCourses(getAllCourses());
  };

  useEffect(() => {
    refreshCourses();
  }, []);

  const showNotice = (type: 'success' | 'error', text: string) => {
    setNotification({ type, text });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleOpenAdd = () => {
    setEditingCourse(null);
    setForm({
      title: '',
      subtitle: '',
      description: '',
      category: 'python',
      difficulty: 'beginner',
      estimatedHours: 10,
      instructorName: 'YARA Engineering Faculty',
      instructorTitle: 'Senior Coding & Robotics Lead',
      coverImageUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80',
      tags: 'coding, python, stem',
      prerequisites: 'Basic Computer Operations',
      learningOutcomes: 'Understand logic, Build programs, Code real hardware',
      certificationEnabled: true,
      certificationTitle: 'Accredited YARA Coding Certificate',
      isPublished: true,
      modules: [
        {
          id: generateModuleId(),
          courseId: '',
          title: 'Lesson 1: Introduction to Logic',
          description: 'Overview of programming fundamentals and setup.',
          type: 'video',
          order: 1,
          durationMinutes: 15,
          videoUrl: 'https://www.youtube.com/watch?v=rfscVS0vtbw',
          readingContent: 'Read through key concepts and try running your first script.'
        }
      ]
    });
    setShowModal(true);
  };

  const handleOpenEdit = (course: ProgrammingCourse) => {
    setEditingCourse(course);
    setForm({
      title: course.title,
      subtitle: course.subtitle || '',
      description: course.description,
      category: course.category,
      difficulty: course.difficulty,
      estimatedHours: course.estimatedHours,
      instructorName: course.instructorName,
      instructorTitle: course.instructorTitle || '',
      coverImageUrl: course.coverImageUrl || '',
      tags: course.tags?.join(', ') || '',
      prerequisites: course.prerequisites?.join(', ') || '',
      learningOutcomes: course.learningOutcomes?.join(', ') || '',
      certificationEnabled: course.certificationEnabled,
      certificationTitle: course.certificationTitle || '',
      isPublished: course.isPublished,
      modules: course.modules && course.modules.length > 0 ? course.modules : [
        {
          id: generateModuleId(),
          courseId: course.id,
          title: 'Module 1: Getting Started',
          description: 'Introduction to course topics.',
          type: 'video',
          order: 1,
          durationMinutes: 15,
          videoUrl: '',
          readingContent: ''
        }
      ]
    });
    setShowModal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      showNotice('error', 'Course title is required.');
      return;
    }

    const courseId = editingCourse ? editingCourse.id : generateCourseId();

    const courseToSave: ProgrammingCourse = {
      id: courseId,
      title: form.title.trim(),
      subtitle: form.subtitle.trim(),
      description: form.description.trim(),
      category: form.category,
      difficulty: form.difficulty,
      coverImageUrl: form.coverImageUrl.trim() || 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80',
      estimatedHours: Number(form.estimatedHours) || 10,
      instructorName: form.instructorName.trim() || 'YARA Faculty',
      instructorTitle: form.instructorTitle.trim() || 'Instructor',
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      prerequisites: form.prerequisites.split(',').map(p => p.trim()).filter(Boolean),
      learningOutcomes: form.learningOutcomes.split(',').map(l => l.trim()).filter(Boolean),
      certificationEnabled: form.certificationEnabled,
      certificationTitle: form.certificationTitle.trim() || form.title,
      isPublished: form.isPublished,
      enrolledCount: editingCourse ? editingCourse.enrolledCount : 0,
      rating: editingCourse ? editingCourse.rating : 4.9,
      createdAt: editingCourse ? editingCourse.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      modules: form.modules.map((m, idx) => ({
        ...m,
        courseId,
        order: idx + 1
      }))
    };

    saveCourse(courseToSave);
    refreshCourses();
    setShowModal(false);
    showNotice('success', `Course "${courseToSave.title}" saved successfully! Available in student catalog.`);
  };

  const handleTogglePublish = (courseId: string) => {
    const updated = toggleCoursePublish(courseId);
    if (updated) {
      refreshCourses();
      showNotice('success', `Course "${updated.title}" is now ${updated.isPublished ? 'PUBLISHED (Visible to students)' : 'UNPUBLISHED (Draft mode)'}`);
    }
  };

  const handleDelete = (courseId: string, title: string) => {
    if (confirm(`Are you sure you want to delete the course "${title}"?`)) {
      deleteCourse(courseId);
      refreshCourses();
      showNotice('success', `Course "${title}" removed.`);
    }
  };

  const addModuleRow = () => {
    setForm(prev => ({
      ...prev,
      modules: [
        ...prev.modules,
        {
          id: generateModuleId(),
          courseId: editingCourse ? editingCourse.id : '',
          title: `Module ${prev.modules.length + 1}: New Lesson Topic`,
          description: 'Lesson description and hands-on practice.',
          type: 'video',
          order: prev.modules.length + 1,
          durationMinutes: 15,
          videoUrl: '',
          readingContent: ''
        }
      ]
    }));
  };

  const removeModuleRow = (index: number) => {
    if (form.modules.length <= 1) {
      alert('Course must have at least one module.');
      return;
    }
    setForm(prev => ({
      ...prev,
      modules: prev.modules.filter((_, i) => i !== index)
    }));
  };

  const filtered = courses.filter(c => {
    const matchesQuery = 
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.instructorName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = categoryFilter === 'all' || c.category === categoryFilter;
    return matchesQuery && matchesCat;
  });

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-wider border border-blue-500/30">
              Admin Course Management
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-black uppercase tracking-wider border border-emerald-500/30">
              Coding & Robotics Tracks
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white">Coding Courses & Curriculum Manager</h3>
          <p className="text-xs text-slate-300">
            Create, edit, publish, and structure programming courses (Python, Scratch, Web Dev, C++ Embedded, Robotics).
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs flex items-center space-x-2 shadow-lg cursor-pointer shrink-0 transition-all"
        >
          <Plus size={16} />
          <span>Create New Course</span>
        </button>
      </div>

      {notification && (
        <div className={`p-4 rounded-2xl text-xs font-bold flex items-center justify-between ${
          notification.type === 'success' ? 'bg-emerald-50 text-emerald-900 border border-emerald-200' : 'bg-red-50 text-red-900 border border-red-200'
        }`}>
          <span>{notification.text}</span>
          <button onClick={() => setNotification(null)} className="text-xs opacity-60 hover:opacity-100">✕</button>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search coding courses..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-600"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <span className="text-xs font-bold text-slate-500 shrink-0">Category:</span>
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-600"
          >
            <option value="all">All Categories ({courses.length})</option>
            <option value="python">Python Programming</option>
            <option value="javascript">JavaScript</option>
            <option value="scratch">Scratch Visual Coding</option>
            <option value="web_development">Web Development</option>
            <option value="robotics_programming">Robotics & C++ Embedded</option>
            <option value="data_science">Data Science & AI</option>
          </select>
        </div>
      </div>

      {/* Courses Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(course => (
          <div key={course.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden hover:border-blue-300 transition-all flex flex-col justify-between">
            <div>
              {/* Cover Image & Category Pill */}
              <div className="relative h-36 bg-slate-900 overflow-hidden">
                <img 
                  src={course.coverImageUrl} 
                  alt={course.title} 
                  className="w-full h-full object-cover opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent" />
                <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-blue-600/90 text-white text-[10px] font-black uppercase tracking-wider">
                  {course.category.replace('_', ' ')}
                </span>
                <span className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                  course.isPublished ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-slate-950'
                }`}>
                  {course.isPublished ? 'Published' : 'Draft Mode'}
                </span>
              </div>

              {/* Course Info */}
              <div className="p-5 space-y-3">
                <div>
                  <h4 className="text-base font-black text-slate-900 leading-tight">{course.title}</h4>
                  {course.subtitle && <p className="text-xs text-slate-500 font-medium mt-0.5">{course.subtitle}</p>}
                </div>
                <p className="text-xs text-slate-600 line-clamp-2">{course.description}</p>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                  <span>Instructor: <strong className="text-slate-800">{course.instructorName}</strong></span>
                  <span>{course.modules?.length || 0} Modules ({course.estimatedHours}h)</span>
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
              <button
                onClick={() => handleTogglePublish(course.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1 transition cursor-pointer ${
                  course.isPublished ? 'bg-amber-100 text-amber-900 hover:bg-amber-200' : 'bg-emerald-100 text-emerald-900 hover:bg-emerald-200'
                }`}
              >
                {course.isPublished ? <EyeOff size={13} /> : <Eye size={13} />}
                <span>{course.isPublished ? 'Unpublish' : 'Publish'}</span>
              </button>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleOpenEdit(course)}
                  className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold rounded-xl text-xs flex items-center space-x-1 cursor-pointer"
                >
                  <Edit2 size={13} />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleDelete(course.id, course.title)}
                  className="px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 font-bold rounded-xl text-xs flex items-center space-x-1 cursor-pointer"
                >
                  <Trash2 size={13} />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Course Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-3xl w-full p-6 space-y-6 shadow-2xl my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center space-x-2">
                <Code className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-black text-slate-900">
                  {editingCourse ? 'Edit Coding Course' : 'Create New Coding Course'}
                </h3>
              </div>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Course Title *</label>
                  <input
                    type="text"
                    required
                    value={form.title}
                    onChange={e => setForm({ ...form, title: e.target.value })}
                    placeholder="e.g. Python Programming Fundamentals"
                    className="input-premium"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Subtitle / Tagline</label>
                  <input
                    type="text"
                    value={form.subtitle}
                    onChange={e => setForm({ ...form, subtitle: e.target.value })}
                    placeholder="e.g. Master code logic and algorithms"
                    className="input-premium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Category</label>
                  <select
                    value={form.category}
                    onChange={e => setForm({ ...form, category: e.target.value as any })}
                    className="input-premium"
                  >
                    <option value="python">Python Programming</option>
                    <option value="javascript">JavaScript</option>
                    <option value="scratch">Scratch Visual Coding</option>
                    <option value="web_development">Web Development</option>
                    <option value="robotics_programming">Robotics & C++ Embedded</option>
                    <option value="data_science">Data Science & AI</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Difficulty</label>
                  <select
                    value={form.difficulty}
                    onChange={e => setForm({ ...form, difficulty: e.target.value as any })}
                    className="input-premium"
                  >
                    <option value="beginner">Beginner (Level 0-2)</option>
                    <option value="intermediate">Intermediate (Level 3-5)</option>
                    <option value="advanced">Advanced (Level 6-8)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Est. Hours</label>
                  <input
                    type="number"
                    value={form.estimatedHours}
                    onChange={e => setForm({ ...form, estimatedHours: Number(e.target.value) || 10 })}
                    className="input-premium"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Description</label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="Detailed course description for learners..."
                  className="input-premium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Instructor Name</label>
                  <input
                    type="text"
                    value={form.instructorName}
                    onChange={e => setForm({ ...form, instructorName: e.target.value })}
                    className="input-premium"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Cover Image URL</label>
                  <input
                    type="text"
                    value={form.coverImageUrl}
                    onChange={e => setForm({ ...form, coverImageUrl: e.target.value })}
                    className="input-premium"
                  />
                </div>
              </div>

              {/* Modules & Video Lessons Manager */}
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    Course Modules & Lessons ({form.modules.length})
                  </h4>
                  <button
                    type="button"
                    onClick={addModuleRow}
                    className="px-3 py-1 bg-blue-50 text-blue-700 font-bold rounded-lg text-xs flex items-center space-x-1 cursor-pointer"
                  >
                    <Plus size={12} />
                    <span>Add Module</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {form.modules.map((mod, i) => (
                    <div key={i} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-700">Module {i + 1}</span>
                        <button
                          type="button"
                          onClick={() => removeModuleRow(i)}
                          className="text-red-500 hover:text-red-700 text-xs font-bold"
                        >
                          Remove
                        </button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={mod.title}
                          onChange={e => {
                            const updated = [...form.modules];
                            updated[i].title = e.target.value;
                            setForm({ ...form, modules: updated });
                          }}
                          placeholder="Module Title"
                          className="input-premium"
                        />
                        <input
                          type="text"
                          value={mod.videoUrl || ''}
                          onChange={e => {
                            const updated = [...form.modules];
                            updated[i].videoUrl = e.target.value;
                            setForm({ ...form, modules: updated });
                          }}
                          placeholder="Video URL (YouTube/MP4)"
                          className="input-premium font-mono text-xs"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs flex items-center space-x-1.5 cursor-pointer shadow-lg"
                >
                  <Save size={14} />
                  <span>{editingCourse ? 'Save Changes' : 'Create & Publish Course'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
