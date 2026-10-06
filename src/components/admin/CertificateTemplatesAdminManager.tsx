import React, { useState, useEffect } from 'react';
import { 
  Award, Edit3, Eye, Save, X, Plus, ChevronDown, ChevronUp,
  GraduationCap, Code2, Brain, Cpu, CheckCircle2, Palette,
  FileText, Shield, Star, RotateCcw, Trophy, Users, Heart,
  Building2, Sparkles, Image, Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import { ASSETS } from '../../constants/assets';
import { 
  CertificateTemplate, 
  getAllCertificateTemplates, 
  saveCertificateTemplate, 
  createCertificateTemplate,
  deleteCertificateTemplate,
  autoCreateCertificateTemplateForCourse,
  DEFAULT_TEMPLATES 
} from '../../services/certificateTemplateService';
import { getAllCourses } from '../../services/programmingCoursesService';
import { YaraAccreditedCertificateCanvas } from '../lms/YaraAccreditedCertificateCanvas';

export type { CertificateTemplate };

const CERT_ICONS: Record<string, React.ElementType> = {
  'cert-lms-robotics': Cpu,
  'cert-coding': Code2,
  'cert-ai-educators': Brain,
  'cert-capstone': GraduationCap,
  'cert-competition': Trophy,
  'cert-kids': Star,
  'cert-mentorship': Users
};

export default function CertificateTemplatesAdminManager() {
  const [templates, setTemplates] = useState<CertificateTemplate[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<CertificateTemplate | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const isEditing = Boolean(editingId && editForm);

  // Form state for creating a new template
  const [createForm, setCreateForm] = useState<Omit<CertificateTemplate, 'id'>>({
    name: '',
    section: 'Learning Academy & LMS',
    subtitle: 'Certificate of Completion & Technical Proficiency',
    description: 'Awarded to participants demonstrating verified competence and completion of hands-on assessments.',
    recipient_label: 'This is to certify that',
    completion_text: 'has successfully completed all required modules, practical labs, and assessments, demonstrating verified technical excellence.',
    primary_color: '#0f172a',
    secondary_color: '#0b4ea2',
    accent_color: '#f59e0b',
    logo_url: ASSETS.LOGO,
    seal_enabled: true,
    seal_type: 'gold_embossed',
    seal_label: '★ VERIFIED ★ ACCREDITED',
    seal_emblem_text: 'Y',
    bg_pattern: 'guilloche',
    watermark_enabled: true,
    watermark_text: 'YARA',
    watermark_opacity: 0.06,
    has_partner: false,
    partner_name: '',
    partner_logo_url: '',
    partner_badge_label: 'In Collaboration With',
    signatory_1_name: 'Eng. T. Chidzero',
    signatory_1_title: 'National Director, YARA Academy',
    signatory_1_signature_url: ASSETS.SIGNATURE_MANONGWA,
    signatory_2_name: 'Mr. S.O. Manongwa',
    signatory_2_title: 'Lead Instructor & Evaluation Patron',
    signatory_2_signature_url: ASSETS.SIGNATURE_CHIAMBIRO,
    signatory_partner_name: '',
    signatory_partner_title: '',
    footer_text: 'YARA — Young African Robotics Association | yara.org.zw',
    badge_text: 'ACCREDITED',
    is_active: true
  });

  // Sync courses and load templates
  useEffect(() => {
    // 1. Ensure any newly added courses have matching certificate templates
    try {
      const courses = getAllCourses();
      courses.forEach(c => {
        autoCreateCertificateTemplateForCourse({
          id: c.id,
          title: c.title,
          category: c.category,
          instructorName: c.instructorName,
          instructorTitle: c.instructorTitle
        });
      });
    } catch (e) {
      console.warn('Could not sync courses to certificate templates:', e);
    }

    setTemplates(getAllCertificateTemplates());
  }, []);

  const refreshTemplates = () => {
    setTemplates(getAllCertificateTemplates());
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
    const updated = saveCertificateTemplate(editForm);
    setTemplates(updated);
    setEditingId(null);
    setEditForm(null);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleCreateNewTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.name.trim()) return;

    createCertificateTemplate(createForm);
    refreshTemplates();
    setShowCreateModal(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleDeleteTemplate = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete the template "${name}"?`)) {
      const updated = deleteCertificateTemplate(id);
      setTemplates(updated);
    }
  };

  const resetToDefault = (id: string) => {
    const def = DEFAULT_TEMPLATES.find(t => t.id === id);
    if (!def) return;
    const updated = saveCertificateTemplate(def);
    setTemplates(updated);
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
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#0b4ea2] to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-black text-slate-900 text-xl tracking-tight">Accredited Certificate Templates</h2>
              <p className="text-sm text-slate-500 font-medium mt-0.5">
                Corporate branded diplomas with official seal, logo, guilloche patterns, watermarks, and partner co-branding.
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {saved && (
              <div className="flex items-center gap-2 px-3.5 py-2 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-bold border border-emerald-200">
                <CheckCircle2 className="w-4 h-4" />
                <span>Saved System-Wide!</span>
              </div>
            )}

            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-xl text-xs flex items-center space-x-1.5 shadow-md shadow-amber-500/20 cursor-pointer transition"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Category Template</span>
            </button>
          </div>
        </div>
      </div>

      {/* Template Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {templates.map(template => {
          const Icon = CERT_ICONS[template.id] || Award;

          return (
            <div
              key={template.id}
              className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 hover:border-blue-300 transition-all shadow-sm"
            >
              {/* Card Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-md"
                    style={{ backgroundColor: template.secondary_color || '#0b4ea2' }}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#0b4ea2] bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                      {template.section}
                    </span>
                    <h3 className="font-extrabold text-slate-900 text-lg mt-0.5">{template.name}</h3>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  {template.has_partner && (
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider text-amber-900 bg-amber-100 border border-amber-200">
                      Partnered
                    </span>
                  )}
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider text-slate-700 bg-slate-100 border border-slate-200">
                    {template.badge_text}
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-500 font-medium line-clamp-2 leading-relaxed">
                {template.description}
              </p>

              {/* Attributes Chips */}
              <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] font-bold text-slate-600">
                <span className="px-2 py-0.5 bg-slate-100 rounded-md">
                  Pattern: {template.bg_pattern || 'guilloche'}
                </span>
                <span className="px-2 py-0.5 bg-slate-100 rounded-md">
                  Seal: {template.seal_type || 'gold_embossed'}
                </span>
                <span className="px-2 py-0.5 bg-slate-100 rounded-md">
                  Watermark: {template.watermark_text || 'YARA'}
                </span>
              </div>

              {/* Actions Bar */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100 gap-2">
                <button
                  onClick={() => setPreviewId(template.id)}
                  className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-700 hover:text-[#0b4ea2] bg-slate-50 hover:bg-blue-50 px-4 py-2 rounded-xl transition border border-slate-200"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Preview Full Diploma</span>
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
                    className="inline-flex items-center space-x-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 px-4 py-2 rounded-xl transition shadow-md"
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

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 1. Create New Template Modal */}
      {/* ───────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showCreateModal && (
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
              className="bg-white rounded-3xl p-6 md:p-8 max-w-3xl w-full shadow-2xl space-y-6 my-8 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <span className="text-xs font-black uppercase text-amber-600">New Category</span>
                  <h3 className="text-xl font-black text-slate-900">Create Certificate Template</h3>
                </div>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateNewTemplate} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Template Name</label>
                    <input
                      type="text"
                      required
                      value={createForm.name}
                      onChange={e => setCreateForm({ ...createForm, name: e.target.value })}
                      placeholder="e.g. Autonomous Drone Telemetry & Avionics"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-900 focus:outline-none focus:border-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Section Category</label>
                    <select
                      value={createForm.section}
                      onChange={e => setCreateForm({ ...createForm, section: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-900 focus:outline-none focus:border-blue-600"
                    >
                      <option value="Learning Academy & LMS">Learning Academy & LMS</option>
                      <option value="Coding Bootcamp & Software">Coding Bootcamp & Software</option>
                      <option value="Educator Portal & AI Bootcamp">Educator Portal & AI Bootcamp</option>
                      <option value="Hardware & Capstone Projects">Hardware & Capstone Projects</option>
                      <option value="Competitions & Micromouse Arena">Competitions & Arena</option>
                      <option value="YARA Kids Track (Ages 3-8)">YARA Kids STEM</option>
                      <option value="Mentorship & Leadership">Mentorship & Leadership</option>
                      <option value="Partner Training & Accreditation">Partner Training & Accreditation</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Subtitle / Program Track</label>
                  <input
                    type="text"
                    value={createForm.subtitle}
                    onChange={e => setCreateForm({ ...createForm, subtitle: e.target.value })}
                    placeholder="Certificate of Completion — Advanced Avionics Track"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Citation Statement</label>
                  <textarea
                    rows={2}
                    value={createForm.completion_text}
                    onChange={e => setCreateForm({ ...createForm, completion_text: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm text-slate-900"
                  />
                </div>

                {/* Seal & Background Customizer */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Seal Style</label>
                    <select
                      value={createForm.seal_type}
                      onChange={e => setCreateForm({ ...createForm, seal_type: e.target.value as any })}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold"
                    >
                      <option value="gold_embossed">Gold Embossed Official</option>
                      <option value="royal_navy">Royal Navy Accredited</option>
                      <option value="emerald_verified">Emerald Verified</option>
                      <option value="gold_ribbon">Gold Ribbon Medal</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Background Pattern</label>
                    <select
                      value={createForm.bg_pattern}
                      onChange={e => setCreateForm({ ...createForm, bg_pattern: e.target.value as any })}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold"
                    >
                      <option value="guilloche">Guilloche Bank-Note Waves</option>
                      <option value="circuit">Robotics Circuit Traces</option>
                      <option value="crest_waves">Royal Luxury Arcs</option>
                      <option value="minimal">Minimal Platinum Pinstripe</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Watermark Text</label>
                    <input
                      type="text"
                      value={createForm.watermark_text}
                      onChange={e => setCreateForm({ ...createForm, watermark_text: e.target.value })}
                      placeholder="e.g. YARA"
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold"
                    />
                  </div>
                </div>

                {/* Partner Training Section */}
                <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-200/80 space-y-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="create_partner_check"
                      checked={createForm.has_partner}
                      onChange={e => setCreateForm({ ...createForm, has_partner: e.target.checked })}
                      className="w-4 h-4 text-amber-500 rounded"
                    />
                    <label htmlFor="create_partner_check" className="text-xs font-bold text-amber-900 cursor-pointer">
                      Training Has Partner Organization (Add Partner Logo & Signatory)
                    </label>
                  </div>

                  {createForm.has_partner && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 uppercase">Partner Name</label>
                        <input
                          type="text"
                          value={createForm.partner_name || ''}
                          onChange={e => setCreateForm({ ...createForm, partner_name: e.target.value })}
                          placeholder="e.g. Ministry of ICT / IEEE"
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 uppercase">Partner Logo URL (Optional)</label>
                        <input
                          type="text"
                          value={createForm.partner_logo_url || ''}
                          onChange={e => setCreateForm({ ...createForm, partner_logo_url: e.target.value })}
                          placeholder="https://.../partner.png"
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 uppercase">Partner Signatory Name</label>
                        <input
                          type="text"
                          value={createForm.signatory_partner_name || ''}
                          onChange={e => setCreateForm({ ...createForm, signatory_partner_name: e.target.value })}
                          placeholder="e.g. Director T. Mavetera"
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 uppercase">Partner Signatory Title</label>
                        <input
                          type="text"
                          value={createForm.signatory_partner_title || ''}
                          onChange={e => setCreateForm({ ...createForm, signatory_partner_title: e.target.value })}
                          placeholder="e.g. Permanent Secretary"
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Signatories */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] font-black uppercase text-slate-500">Signatory 1 (Director)</span>
                    <input
                      type="text"
                      value={createForm.signatory_1_name}
                      onChange={e => setCreateForm({ ...createForm, signatory_1_name: e.target.value })}
                      placeholder="Name"
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold"
                    />
                    <input
                      type="text"
                      value={createForm.signatory_1_title}
                      onChange={e => setCreateForm({ ...createForm, signatory_1_title: e.target.value })}
                      placeholder="Title"
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs"
                    />
                  </div>

                  <div className="space-y-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] font-black uppercase text-slate-500">Signatory 2 (Patron / Instructor)</span>
                    <input
                      type="text"
                      value={createForm.signatory_2_name}
                      onChange={e => setCreateForm({ ...createForm, signatory_2_name: e.target.value })}
                      placeholder="Name"
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold"
                    />
                    <input
                      type="text"
                      value={createForm.signatory_2_title}
                      onChange={e => setCreateForm({ ...createForm, signatory_2_title: e.target.value })}
                      placeholder="Title"
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-5 py-2.5 rounded-xl font-bold text-xs text-slate-600 hover:bg-slate-100 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl font-bold text-xs bg-slate-900 hover:bg-slate-800 text-white shadow-lg transition flex items-center space-x-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create Template</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 2. Edit Template Modal */}
      {/* ───────────────────────────────────────────────────────────── */}
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
              className="bg-white rounded-3xl p-6 md:p-8 max-w-3xl w-full shadow-2xl space-y-6 my-8 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <span className="text-xs font-black uppercase text-[#0b4ea2]">{editForm.section}</span>
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
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Subtitle / Heading</label>
                  <input
                    type="text"
                    value={editForm.subtitle}
                    onChange={e => setField('subtitle', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Completion Citation / Body Text</label>
                  <textarea
                    rows={3}
                    value={editForm.completion_text}
                    onChange={e => setField('completion_text', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>

                {/* Seal & Background Pattern */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Seal Style</label>
                    <select
                      value={editForm.seal_type || 'gold_embossed'}
                      onChange={e => setField('seal_type', e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold"
                    >
                      <option value="gold_embossed">Gold Embossed Official</option>
                      <option value="royal_navy">Royal Navy Accredited</option>
                      <option value="emerald_verified">Emerald Verified</option>
                      <option value="gold_ribbon">Gold Ribbon Medal</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Background Pattern</label>
                    <select
                      value={editForm.bg_pattern || 'guilloche'}
                      onChange={e => setField('bg_pattern', e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold"
                    >
                      <option value="guilloche">Guilloche Bank-Note Waves</option>
                      <option value="circuit">Robotics Circuit Traces</option>
                      <option value="crest_waves">Royal Luxury Arcs</option>
                      <option value="minimal">Minimal Platinum Pinstripe</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Watermark Text</label>
                    <input
                      type="text"
                      value={editForm.watermark_text || 'YARA'}
                      onChange={e => setField('watermark_text', e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold"
                    />
                  </div>
                </div>

                {/* Partner Training Support */}
                <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-200/80 space-y-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="edit_partner_check"
                      checked={Boolean(editForm.has_partner)}
                      onChange={e => setField('has_partner', e.target.checked)}
                      className="w-4 h-4 text-amber-500 rounded"
                    />
                    <label htmlFor="edit_partner_check" className="text-xs font-bold text-amber-900 cursor-pointer">
                      Training Has Partner Organization (Add Partner Logo & Signatory)
                    </label>
                  </div>

                  {editForm.has_partner && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 uppercase">Partner Name</label>
                        <input
                          type="text"
                          value={editForm.partner_name || ''}
                          onChange={e => setField('partner_name', e.target.value)}
                          placeholder="e.g. Ministry of ICT / IEEE"
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 uppercase">Partner Logo URL</label>
                        <input
                          type="text"
                          value={editForm.partner_logo_url || ''}
                          onChange={e => setField('partner_logo_url', e.target.value)}
                          placeholder="https://.../partner.png"
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 uppercase">Partner Signatory Name</label>
                        <input
                          type="text"
                          value={editForm.signatory_partner_name || ''}
                          onChange={e => setField('signatory_partner_name', e.target.value)}
                          placeholder="e.g. Director T. Mavetera"
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 uppercase">Partner Signatory Title</label>
                        <input
                          type="text"
                          value={editForm.signatory_partner_title || ''}
                          onChange={e => setField('signatory_partner_title', e.target.value)}
                          placeholder="e.g. Patron & Director"
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold"
                        />
                      </div>
                    </div>
                  )}
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
              </div>

              <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => handleDeleteTemplate(editForm.id, editForm.name)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 transition"
                >
                  Delete Template
                </button>

                <div className="flex items-center space-x-3">
                  <button
                    onClick={cancelEdit}
                    className="px-5 py-2.5 rounded-xl font-bold text-xs text-slate-600 hover:bg-slate-100 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveEdit}
                    className="px-6 py-2.5 rounded-xl font-bold text-xs bg-slate-900 hover:bg-slate-800 text-white shadow-lg transition flex items-center space-x-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Changes</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 3. WYSIWYG Full Certificate Preview Modal */}
      {/* ───────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {previewTemplate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
          >
            <div className="max-w-5xl w-full bg-slate-900 rounded-3xl p-6 sm:p-8 relative shadow-2xl border border-slate-800">
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
                <div>
                  <span className="text-[10px] font-black uppercase text-amber-400">Live WYSIWYG Preview</span>
                  <h3 className="text-lg font-bold text-white">{previewTemplate.name}</h3>
                </div>
                <button
                  onClick={() => setPreviewId(null)}
                  className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800 hover:bg-slate-700 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Render High-Definition Canvas */}
              <div className="flex justify-center overflow-x-auto p-1 bg-slate-950 rounded-2xl border border-slate-800">
                <YaraAccreditedCertificateCanvas
                  data={{
                    certificateNumber: 'GLA-YARA-2026-DEMO99',
                    studentName: 'Simbarashe Obvious Manongwa',
                    courseTitle: previewTemplate.name,
                    certificateType: previewTemplate.id.includes('coding') ? 'programming' : previewTemplate.id.includes('educator') ? 'educator' : 'robotics',
                    roboticsLevel: 2,
                    issueDate: new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }),
                    verificationUrl: 'https://yara.org/verify-certificate?id=GLA-YARA-2026-DEMO99',
                    directorName: previewTemplate.signatory_1_name,
                    directorTitle: previewTemplate.signatory_1_title,
                    organizationName: 'YARA Learning Academy',
                    coSignerName: previewTemplate.signatory_2_name,
                    coSignerTitle: previewTemplate.signatory_2_title,
                    citationText: previewTemplate.completion_text,
                    logoUrl: previewTemplate.logo_url || ASSETS.LOGO,
                    sealEnabled: previewTemplate.seal_enabled !== false,
                    sealType: previewTemplate.seal_type || 'gold_embossed',
                    sealLabel: previewTemplate.seal_label || '★ VERIFIED ★ CERTIFICATE',
                    sealEmblemText: previewTemplate.seal_emblem_text || 'Y',
                    bgPattern: previewTemplate.bg_pattern || 'guilloche',
                    watermarkEnabled: previewTemplate.watermark_enabled !== false,
                    watermarkText: previewTemplate.watermark_text || 'YARA',
                    watermarkOpacity: previewTemplate.watermark_opacity ?? 0.06,
                    hasPartner: previewTemplate.has_partner,
                    partnerName: previewTemplate.partner_name,
                    partnerLogoUrl: previewTemplate.partner_logo_url,
                    partnerBadgeLabel: previewTemplate.partner_badge_label,
                    partnerSignerName: previewTemplate.signatory_partner_name,
                    partnerSignerTitle: previewTemplate.signatory_partner_title
                  }}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
