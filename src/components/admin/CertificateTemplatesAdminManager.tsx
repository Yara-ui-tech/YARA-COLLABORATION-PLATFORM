import React, { useState } from 'react';
import { 
  Award, Edit3, Eye, Save, X, ChevronDown, ChevronUp,
  GraduationCap, Code2, Brain, Cpu, CheckCircle2, Palette,
  FileText, Shield, Star, Sparkles, RotateCcw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getLocal, setLocal } from '../../services/chaptersService';
import { cn } from '../../lib/utils';

// ----------------------------------------------------------------
// Types
// ----------------------------------------------------------------

interface CertificateTemplate {
  id: string;
  name: string;
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
// Default Templates
// ----------------------------------------------------------------

const DEFAULT_TEMPLATES: CertificateTemplate[] = [
  {
    id: 'cert-lms-robotics',
    name: 'YARA Robotics LMS Certificate',
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
  }
];

const CERT_ICONS: Record<string, React.ElementType> = {
  'cert-lms-robotics': Cpu,
  'cert-coding': Code2,
  'cert-ai-educators': Brain,
  'cert-capstone': GraduationCap
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
      <div className="bg-white rounded-3xl border border-slate-200 p-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-violet-600 flex items-center justify-center">
            <Award className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="font-black text-slate-900 text-lg">Certificate Templates</h2>
            <p className="text-sm text-slate-500 mt-0.5">
              Edit the design and content of all YARA certificate templates. Changes are applied system-wide.
            </p>
          </div>
          {saved && (
            <div className="ml-auto flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl text-sm font-bold border border-emerald-200">
              <CheckCircle2 className="w-4 h-4" />
              <span>Saved!</span>
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
            <motion.div
              key={template.id}
              layout
              className="bg-white rounded-3xl border border-slate-200 overflow-hidden"
            >
              {/* Card header with gradient */}
              <div
                className="h-24 flex items-center gap-4 px-5 relative overflow-hidden"
                style={{ background: `linear-gradient(135deg, ${template.primary_color}, ${template.secondary_color})` }}
              >
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg shrink-0"
                  style={{ background: template.accent_color }}
                >
                  <Icon className="w-6 h-6 text-slate-900" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-black text-white text-sm">{template.name}</h3>
                  <p className="text-white/70 text-[11px] truncate">{template.subtitle}</p>
                </div>
                <div
                  className="px-2.5 py-1 rounded-xl text-[10px] font-black shrink-0"
                  style={{ background: template.accent_color, color: '#111827' }}
                >
                  {template.badge_text}
                </div>

                {/* Decorative circles */}
                <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full opacity-10" style={{ background: template.accent_color }} />
              </div>

              {/* Card body */}
              <div className="p-5">
                {!isEditing ? (
                  <div className="space-y-3">
                    <p className="text-xs text-slate-600 line-clamp-2">{template.description}</p>
                    <div className="grid grid-cols-3 gap-2">
                      {['primary_color', 'secondary_color', 'accent_color'].map(key => (
                        <div key={key} className="flex items-center gap-1.5">
                          <div className="w-4 h-4 rounded-full border border-slate-200" style={{ background: (template as any)[key] }} />
                          <span className="text-[10px] font-mono text-slate-500 capitalize">{key.replace('_color', '')}</span>
                        </div>
                      ))}
                    </div>
                    <div className="pt-2 grid grid-cols-2 gap-2 text-[10px] text-slate-500 border-t border-slate-100">
                      <div>
                        <span className="font-bold">Sig 1:</span> {template.signatory_1_name}
                      </div>
                      <div>
                        <span className="font-bold">Sig 2:</span> {template.signatory_2_name}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                      <button
                        onClick={() => startEdit(template)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-indigo-600 text-white font-bold text-xs transition-all"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit Template</span>
                      </button>
                      <button
                        onClick={() => setPreviewId(previewId === template.id ? null : template.id)}
                        className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => resetToDefault(template.id)}
                        className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold text-xs transition-all"
                        title="Reset to default"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  /* ---- EDIT FORM ---- */
                  <div className="space-y-4">
                    {/* Certificate Name & Badge */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">Certificate Name</label>
                        <input
                          value={editForm!.name}
                          onChange={e => setField('name', e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-violet-500"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">Badge Label</label>
                        <input
                          value={editForm!.badge_text}
                          onChange={e => setField('badge_text', e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-violet-500"
                        />
                      </div>
                    </div>

                    {/* Subtitle */}
                    <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">Subtitle</label>
                      <input
                        value={editForm!.subtitle}
                        onChange={e => setField('subtitle', e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-violet-500"
                      />
                    </div>

                    {/* Completion Text */}
                    <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">Completion Statement</label>
                      <textarea
                        value={editForm!.completion_text}
                        onChange={e => setField('completion_text', e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-violet-500 resize-none"
                      />
                    </div>

                    {/* Colors */}
                    <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-2">Color Scheme</label>
                      <div className="grid grid-cols-3 gap-3">
                        {(['primary_color', 'secondary_color', 'accent_color'] as const).map(key => (
                          <div key={key}>
                            <label className="text-[10px] text-slate-400 capitalize block mb-1">{key.replace('_color', '')}</label>
                            <div className="flex items-center gap-2">
                              <input
                                type="color"
                                value={(editForm as any)![key]}
                                onChange={e => setField(key, e.target.value)}
                                className="w-8 h-8 rounded-lg border-0 cursor-pointer"
                              />
                              <input
                                type="text"
                                value={(editForm as any)![key]}
                                onChange={e => setField(key, e.target.value)}
                                className="flex-1 px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-[10px] font-mono focus:outline-none"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Signatories */}
                    <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-2">Signatories</label>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <input
                            value={editForm!.signatory_1_name}
                            onChange={e => setField('signatory_1_name', e.target.value)}
                            placeholder="Signatory 1 Name"
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-violet-500"
                          />
                          <input
                            value={editForm!.signatory_1_title}
                            onChange={e => setField('signatory_1_title', e.target.value)}
                            placeholder="Title / Role"
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-500 focus:outline-none focus:border-violet-500"
                          />
                        </div>
                        <div className="space-y-2">
                          <input
                            value={editForm!.signatory_2_name}
                            onChange={e => setField('signatory_2_name', e.target.value)}
                            placeholder="Signatory 2 Name"
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-violet-500"
                          />
                          <input
                            value={editForm!.signatory_2_title}
                            onChange={e => setField('signatory_2_title', e.target.value)}
                            placeholder="Title / Role"
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-500 focus:outline-none focus:border-violet-500"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Footer */}
                    <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">Footer Text</label>
                      <input
                        value={editForm!.footer_text}
                        onChange={e => setField('footer_text', e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-violet-500"
                      />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-2">
                      <button
                        onClick={cancelEdit}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all"
                      >
                        <X className="w-3.5 h-3.5" />
                        Cancel
                      </button>
                      <button
                        onClick={saveEdit}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-black text-xs transition-all shadow-md shadow-violet-600/20"
                      >
                        <Save className="w-3.5 h-3.5" />
                        Save Template
                      </button>
                    </div>
                  </div>
                )}

                {/* Preview Panel */}
                <AnimatePresence>
                  {previewId === template.id && !isEditing && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 overflow-hidden"
                    >
                      <CertificatePreview template={template} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// ----------------------------------------------------------------
// Certificate Preview Component
// ----------------------------------------------------------------

function CertificatePreview({ template }: { template: CertificateTemplate }) {
  return (
    <div
      className="rounded-2xl border-4 overflow-hidden relative"
      style={{ borderColor: template.accent_color, background: '#fafafa' }}
    >
      {/* Certificate Header */}
      <div
        className="py-5 px-6 text-center"
        style={{ background: `linear-gradient(135deg, ${template.primary_color}, ${template.secondary_color})` }}
      >
        <div
          className="text-[10px] font-black tracking-widest uppercase mb-1"
          style={{ color: template.accent_color }}
        >
          YARA — Young African Robotics Association
        </div>
        <div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black mb-2"
          style={{ background: template.accent_color, color: '#111827' }}
        >
          <Award className="w-3.5 h-3.5" />
          {template.badge_text}
        </div>
        <h3 className="font-black text-white text-base">{template.name}</h3>
        <p className="text-white/70 text-[10px] mt-0.5">{template.subtitle}</p>
      </div>

      {/* Certificate Body */}
      <div className="p-5 space-y-3 text-center">
        <p className="text-xs text-slate-500">{template.recipient_label}</p>
        <div
          className="text-xl font-black py-1 border-b-2 mx-auto inline-block px-8"
          style={{ color: template.primary_color, borderColor: template.accent_color }}
        >
          [Recipient Name]
        </div>
        <p className="text-[11px] text-slate-600 leading-relaxed max-w-md mx-auto">
          {template.completion_text}
        </p>

        {/* Signatories */}
        <div className="flex items-end justify-around pt-4 mt-4 border-t border-dashed border-slate-200">
          <div className="text-center">
            <div className="w-24 border-b border-slate-400 mb-1 mx-auto" />
            <p className="text-[10px] font-black text-slate-900">{template.signatory_1_name}</p>
            <p className="text-[9px] text-slate-500">{template.signatory_1_title}</p>
          </div>
          <div
            className="w-12 h-12 rounded-full border-2 flex items-center justify-center text-[8px] font-black"
            style={{ borderColor: template.accent_color, color: template.secondary_color }}
          >
            SEAL
          </div>
          <div className="text-center">
            <div className="w-24 border-b border-slate-400 mb-1 mx-auto" />
            <p className="text-[10px] font-black text-slate-900">{template.signatory_2_name}</p>
            <p className="text-[9px] text-slate-500">{template.signatory_2_title}</p>
          </div>
        </div>

        <p className="text-[9px] text-slate-400 pt-2">{template.footer_text}</p>
      </div>
    </div>
  );
}
