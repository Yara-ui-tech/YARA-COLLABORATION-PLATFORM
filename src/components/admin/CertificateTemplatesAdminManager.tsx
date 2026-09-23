import React, { useState } from 'react';
import { 
  Award, Edit3, Eye, Save, X, ChevronDown, ChevronUp,
  GraduationCap, Code2, Brain, Cpu, CheckCircle2, Palette,
  FileText, Shield, Star, Sparkles, RotateCcw, Trophy, Users, Heart
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getLocal, setLocal } from '../../services/chaptersService';
import { cn } from '../../lib/utils';

// ----------------------------------------------------------------
// Types
// ----------------------------------------------------------------

export interface CertificateTemplate {
  id: string;
  name: string;
  section: string;
  subtitle: string;
  description: string;
  recipient_label: string;
  completion_text: string;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  signatory_1_name: string;
  signatory_1_title: string;
  signatory_2_name: string;
  signatory_2_title: string;
  footer_text: string;
  badge_text: string;
  is_active: boolean;
}

// ----------------------------------------------------------------
// Default Templates for All Sections
// ----------------------------------------------------------------

const DEFAULT_TEMPLATES: CertificateTemplate[] = [
  {
    id: 'cert-lms-robotics',
    name: 'YARA Robotics LMS Certificate',
    section: 'Learning Academy & LMS',
    subtitle: 'Completion of Robotics Learning Management System Programme',
    description: 'Awarded to learners who successfully complete the YARA Robotics Academy online learning modules, including embedded systems, drone telemetry, and autonomous programming.',
    recipient_label: 'This is to certify that',
    completion_text: 'has successfully completed the YARA Robotics Academy LMS Programme and demonstrated proficiency in robotics engineering, embedded systems, and autonomous systems design.',
    primary_color: '#0f172a',
    secondary_color: '#4f46e5',
    accent_color: '#fbbf24',
    signatory_1_name: 'Eng. T. Chidzero',
    signatory_1_title: 'National Director, YARA Academy',
    signatory_2_name: 'Dr. E. Munetsi',
    signatory_2_title: 'Academic Patron, Robotics Division',
    footer_text: 'YARA — Young African Robotics Association | yara.org.zw',
    badge_text: 'LMS',
    is_active: true
  },
  {
    id: 'cert-coding',
    name: 'YARA Coding & Programming Certificate',
    section: 'Coding Bootcamp & Software',
    subtitle: 'Certificate of Completion — Coding & Software Engineering Track',
    description: 'Awarded to participants who complete the YARA Coding curriculum covering Python, C++, web development, and application engineering fundamentals.',
    recipient_label: 'This certifies that',
    completion_text: 'has demonstrated mastery of programming fundamentals, software design principles, and practical coding skills through the YARA Coding & Programming Track.',
    primary_color: '#064e3b',
    secondary_color: '#059669',
    accent_color: '#34d399',
    signatory_1_name: 'Eng. T. Chidzero',
    signatory_1_title: 'National Director, YARA Academy',
    signatory_2_name: 'Ms. R. Mutongi',
    signatory_2_title: 'Lead Software Instructor, YARA',
    footer_text: 'YARA — Young African Robotics Association | yara.org.zw',
    badge_text: 'CODE',
    is_active: true
  },
  {
    id: 'cert-ai-educators',
    name: 'AI for Educators Certificate',
    section: 'Educator Portal & AI Bootcamp',
    subtitle: 'Certificate of Completion — Artificial Intelligence for Educators Programme',
    description: 'Awarded to educators who complete the YARA AI for Educators bootcamp, equipping them with skills to teach AI concepts in schools and communities across Zimbabwe.',
    recipient_label: 'This is to certify that',
    completion_text: 'has successfully completed the AI for Educators Programme and is now certified to deliver foundational Artificial Intelligence education in their school or community.',
    primary_color: '#1e1b4b',
    secondary_color: '#7c3aed',
    accent_color: '#a78bfa',
    signatory_1_name: 'Eng. T. Chidzero',
    signatory_1_title: 'National Director, YARA Academy',
    signatory_2_name: 'Prof. M. Chikosi',
    signatory_2_title: 'AI Programme Lead, YARA',
    footer_text: 'YARA — Young African Robotics Association | yara.org.zw',
    badge_text: 'AI EDU',
    is_active: true
  },
  {
    id: 'cert-capstone',
    name: 'YARA Capstone Project Certificate',
    section: 'Hardware & Capstone Projects',
    subtitle: 'Certificate of Excellence — Capstone Innovation Project',
    description: 'Awarded to teams and individuals who successfully design, build, and present a completed capstone robotics or technology project at the YARA national or provincial showcase.',
    recipient_label: 'This certifies that',
    completion_text: 'has successfully designed, built, and presented a Capstone Innovation Project, demonstrating exceptional technical skill, teamwork, and creative problem-solving in the field of robotics and technology.',
    primary_color: '#431407',
    secondary_color: '#b45309',
    accent_color: '#f59e0b',
    signatory_1_name: 'Eng. T. Chidzero',
    signatory_1_title: 'National Director, YARA Academy',
    signatory_2_name: 'Engr. B. Moyo',
    signatory_2_title: 'Capstone Evaluation Committee Chair',
    footer_text: 'YARA — Young African Robotics Association | yara.org.zw',
    badge_text: 'CAPSTONE',
    is_active: true
  },
  {
    id: 'cert-competition',
    name: 'YARA National Robotics Competition Certificate',
    section: 'Competitions & Micromouse Arena',
    subtitle: 'Certificate of Achievement — YARA Robotics Championship',
    description: 'Awarded to participants and teams taking part in the YARA Educational Robotics Competition, Micromouse Maze Solving, and Underwater Drone Arena.',
    recipient_label: 'This is to certify that',
    completion_text: 'has participated in the YARA National Robotics Competition, demonstrating outstanding performance in autonomous navigation, engineering design, and teamwork.',
    primary_color: '#78350f',
    secondary_color: '#d97706',
    accent_color: '#fef3c7',
    signatory_1_name: 'Eng. T. Chidzero',
    signatory_1_title: 'National Director, YARA',
    signatory_2_name: 'Dr. G. Mpofu',
    signatory_2_title: 'Chief Competition Judge',
    footer_text: 'YARA — Young African Robotics Association | yara.org.zw',
    badge_text: 'ARENA 2026',
    is_active: true
  },
  {
    id: 'cert-kids',
    name: 'YARA Kids Early STEM Explorer Certificate',
    section: 'YARA Kids Track (Ages 3-8)',
    subtitle: 'Certificate of Discovery — Junior STEM & Robotics Explorer',
    description: 'Awarded to young children completing introductory YARA Kids interactive STEM challenges and introductory logic activities.',
    recipient_label: 'Super STEM Star Certificate for',
    completion_text: 'has completed the YARA Kids Early STEM Exploration Track and shown awesome curiosity, creativity, and problem-solving skills!',
    primary_color: '#831843',
    secondary_color: '#db2777',
    accent_color: '#fbcfe8',
    signatory_1_name: 'Eng. T. Chidzero',
    signatory_1_title: 'National Director, YARA',
    signatory_2_name: 'Auntie Sarah',
    signatory_2_title: 'YARA Kids Learning Specialist',
    footer_text: 'YARA Kids — Young African Robotics Association | yara.org.zw',
    badge_text: 'STEM STAR',
    is_active: true
  },
  {
    id: 'cert-mentorship',
    name: 'YARA Certified Mentor & Peer Educator Certificate',
    section: 'Mentorship & Leadership',
    subtitle: 'Certificate of Recognition — Master Mentor & Peer Leader',
    description: 'Awarded to verified robotics mentors who contribute 50+ hours of peer guidance, technical assistance, and chapter support.',
    recipient_label: 'This certificate of honor is presented to',
    completion_text: 'in recognition of exemplary leadership, selfless technical mentorship, and dedication to raising the next generation of African technology leaders.',
    primary_color: '#14532d',
    secondary_color: '#16a34a',
    accent_color: '#bbf7d0',
    signatory_1_name: 'Eng. T. Chidzero',
    signatory_1_title: 'National Director, YARA',
    signatory_2_name: 'Mr. P. Mutero',
    signatory_2_title: 'Mentorship Council President',
    footer_text: 'YARA — Young African Robotics Association | yara.org.zw',
    badge_text: 'MENTOR',
    is_active: true
  }
];

const CERT_ICONS: Record<string, React.ElementType> = {
  'cert-lms-robotics': Cpu,
  'cert-coding': Code2,
  'cert-ai-educators': Brain,
  'cert-capstone': GraduationCap,
  'cert-competition': Trophy,
  'cert-kids': Sparkles,
  'cert-mentorship': Users
};

const STORAGE_KEY = 'yara_certificate_templates';

export default function CertificateTemplatesAdminManager() {
  const savedTemplates = getLocal<CertificateTemplate[]>(STORAGE_KEY, DEFAULT_TEMPLATES);
  const [templates, setTemplates] = useState<CertificateTemplate[]>(savedTemplates);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<CertificateTemplate | null>(null);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const saveTemplates = (updated: CertificateTemplate[]) => {
    setLocal(STORAGE_KEY, updated);
    setTemplates(updated);
  };

  const startEdit = (t: CertificateTemplate) => {
    setEditingId(t.id);
    setEditForm({ ...t });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm(null);
  };

  const saveEdit = () => {
    if (!editForm) return;
    const updated = templates.map(t => t.id === editForm.id ? editForm : t);
    saveTemplates(updated);
    setEditingId(null);
    setEditForm(null);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const resetToDefault = (id: string) => {
    const def = DEFAULT_TEMPLATES.find(t => t.id === id);
    if (!def) return;
    const updated = templates.map(t => t.id === id ? { ...def } : t);
    saveTemplates(updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const setField = (field: keyof CertificateTemplate, value: any) => {
    if (!editForm) return;
    setEditForm({ ...editForm, [field]: value });
  };

  const previewTemplate = templates.find(t => t.id === previewId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-violet-600 flex items-center justify-center text-white shadow-lg shadow-violet-200">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-black text-slate-900 text-xl tracking-tight">Section Certificate Templates</h2>
              <p className="text-sm text-slate-500 font-medium mt-0.5">
                Manage, edit, and preview certificate templates across all ecosystem sections (LMS, Coding, AI Bootcamp, Competitions, Capstone, Kids & Mentorship).
              </p>
            </div>
          </div>
          {saved && (
            <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl text-sm font-bold border border-emerald-200">
              <CheckCircle2 className="w-4 h-4" />
              <span>Saved System-Wide!</span>
            </div>
          )}
        </div>
      </div>

      {/* Template Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {templates.map(template => {
          const Icon = CERT_ICONS[template.id] || Award;
          const isEditing = editingId === template.id;

          return (
            <div
              key={template.id}
              className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 hover:border-violet-300 transition-all shadow-sm"
            >
              {/* Card Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-md"
                    style={{ backgroundColor: template.secondary_color }}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-violet-600 bg-violet-50 px-2 py-0.5 rounded-md border border-violet-100">
                      {template.section}
                    </span>
                    <h3 className="font-extrabold text-slate-900 text-lg mt-0.5">{template.name}</h3>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider text-slate-700 bg-slate-100 border border-slate-200">
                  {template.badge_text}
                </span>
              </div>

              <p className="text-xs text-slate-500 font-medium line-clamp-2 leading-relaxed">
                {template.description}
              </p>

              {/* Actions Bar */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100 gap-2">
                <button
                  onClick={() => setPreviewId(template.id)}
                  className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-700 hover:text-violet-600 bg-slate-50 hover:bg-violet-50 px-4 py-2 rounded-xl transition border border-slate-200"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Preview Certificate</span>
                </button>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => resetToDefault(template.id)}
                    className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition"
                    title="Reset to Default Template"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => startEdit(template)}
                    className="inline-flex items-center space-x-1.5 text-xs font-bold text-white bg-violet-600 hover:bg-violet-700 px-4 py-2 rounded-xl transition shadow-md shadow-violet-200"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Template</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Template Modal */}
      <AnimatePresence>
        {isEditing && editForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6 md:p-8 max-w-2xl w-full shadow-2xl space-y-6 my-8"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <span className="text-xs font-black uppercase text-violet-600">{editForm.section}</span>
                  <h3 className="text-xl font-black text-slate-900">Edit {editForm.name}</h3>
                </div>
                <button
                  onClick={cancelEdit}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Certificate Title Name</label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={e => setField('name', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-900 focus:outline-none focus:border-violet-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Subtitle / Heading</label>
                  <input
                    type="text"
                    value={editForm.subtitle}
                    onChange={e => setField('subtitle', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-900 focus:outline-none focus:border-violet-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Recipient Intro Text</label>
                  <input
                    type="text"
                    value={editForm.recipient_label}
                    onChange={e => setField('recipient_label', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-900 focus:outline-none focus:border-violet-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Completion Citation / Body Text</label>
                  <textarea
                    rows={3}
                    value={editForm.completion_text}
                    onChange={e => setField('completion_text', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-900 focus:outline-none focus:border-violet-600"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Signatory 1 Name</label>
                    <input
                      type="text"
                      value={editForm.signatory_1_name}
                      onChange={e => setField('signatory_1_name', e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-medium text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Signatory 1 Title</label>
                    <input
                      type="text"
                      value={editForm.signatory_1_title}
                      onChange={e => setField('signatory_1_title', e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-medium text-slate-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Signatory 2 Name</label>
                    <input
                      type="text"
                      value={editForm.signatory_2_name}
                      onChange={e => setField('signatory_2_name', e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-medium text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Signatory 2 Title</label>
                    <input
                      type="text"
                      value={editForm.signatory_2_title}
                      onChange={e => setField('signatory_2_title', e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-medium text-slate-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Primary Color</label>
                    <input
                      type="color"
                      value={editForm.primary_color}
                      onChange={e => setField('primary_color', e.target.value)}
                      className="w-full h-10 rounded-xl border border-slate-200 cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Secondary Color</label>
                    <input
                      type="color"
                      value={editForm.secondary_color}
                      onChange={e => setField('secondary_color', e.target.value)}
                      className="w-full h-10 rounded-xl border border-slate-200 cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Badge Text</label>
                    <input
                      type="text"
                      value={editForm.badge_text}
                      onChange={e => setField('badge_text', e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold uppercase"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 border-t border-slate-100 pt-4">
                <button
                  onClick={cancelEdit}
                  className="px-5 py-2.5 rounded-xl font-bold text-xs text-slate-600 hover:bg-slate-100 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={saveEdit}
                  className="px-6 py-2.5 rounded-xl font-bold text-xs bg-violet-600 hover:bg-violet-700 text-white shadow-lg shadow-violet-200 transition flex items-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Template Changes</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Preview Modal */}
      <AnimatePresence>
        {previewTemplate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
          >
            <div className="max-w-4xl w-full bg-white rounded-3xl p-8 relative shadow-2xl border-4" style={{ borderColor: previewTemplate.secondary_color }}>
              <button
                onClick={() => setPreviewId(null)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-xl bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center space-y-6 py-8 px-6 border-2 border-dashed border-slate-200 rounded-2xl relative bg-slate-50/50">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full text-white text-2xl font-black shadow-lg" style={{ backgroundColor: previewTemplate.secondary_color }}>
                  Y
                </div>

                <div>
                  <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">YARA OFFICIAL CERTIFICATE OF ACCOMPLISHMENT</h4>
                  <h2 className="text-3xl font-black text-slate-900 mt-2" style={{ color: previewTemplate.primary_color }}>
                    {previewTemplate.name}
                  </h2>
                  <p className="text-sm font-semibold text-slate-500 mt-1">{previewTemplate.subtitle}</p>
                </div>

                <div className="py-4 space-y-2">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{previewTemplate.recipient_label}</p>
                  <h3 className="text-2xl font-black text-indigo-700 underline decoration-indigo-300 decoration-wavy">
                    [ SAMPLE RECIPIENT NAME ]
                  </h3>
                  <p className="text-sm text-slate-600 max-w-xl mx-auto font-medium leading-relaxed pt-2">
                    {previewTemplate.completion_text}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-8 pt-8 border-t border-slate-200 max-w-lg mx-auto">
                  <div className="text-center space-y-1">
                    <div className="border-b border-slate-400 pb-1 font-serif text-sm font-bold text-slate-800 italic">
                      {previewTemplate.signatory_1_name}
                    </div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase">{previewTemplate.signatory_1_title}</p>
                  </div>
                  <div className="text-center space-y-1">
                    <div className="border-b border-slate-400 pb-1 font-serif text-sm font-bold text-slate-800 italic">
                      {previewTemplate.signatory_2_name}
                    </div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase">{previewTemplate.signatory_2_title}</p>
                  </div>
                </div>

                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest pt-4">
                  {previewTemplate.footer_text}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
