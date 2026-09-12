import React, { useState, useEffect } from 'react';
import { 
  BookOpen, Plus, Edit2, Trash2, ShieldCheck, Lock, Unlock, 
  FileText, CheckCircle2, AlertCircle, Save, X, Eye, Sparkles, RefreshCw
} from 'lucide-react';
import { 
  BootcampDocument, 
  getBootcampDocuments, 
  addBootcampDocument, 
  updateBootcampDocument, 
  deleteBootcampDocument,
  OFFICIAL_AI_HANDBOOK
} from '../../services/bootcampDocumentService';

export default function BootcampDocumentsAdminSection() {
  const [documents, setDocuments] = useState<BootcampDocument[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingDoc, setEditingDoc] = useState<BootcampDocument | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Form state for adding/editing a document
  const [form, setForm] = useState({
    title: '',
    subtitle: '',
    category: 'handbook' as BootcampDocument['category'],
    author: 'Young Africans Robotics Association (YARA)',
    institution: 'Chinhoyi University of Technology (CUT)',
    version: '2026 Edition',
    publicationDate: '2026',
    accessLevel: 'approved_educators_only' as BootcampDocument['accessLevel'],
    allowDownload: false, // Protected download restricted by default
    description: '',
    rawContent: '' // Quick text/module input
  });

  const refreshDocs = () => {
    setDocuments(getBootcampDocuments());
  };

  useEffect(() => {
    refreshDocs();
  }, []);

  const handleOpenAdd = () => {
    setEditingDoc(null);
    setForm({
      title: '',
      subtitle: '',
      category: 'guide',
      author: 'YARA Education Team',
      institution: 'Chinhoyi University of Technology (CUT)',
      version: '2026 Edition',
      publicationDate: '2026',
      accessLevel: 'approved_educators_only',
      allowDownload: false,
      description: '',
      rawContent: ''
    });
    setShowAddModal(true);
  };

  const handleOpenEdit = (doc: BootcampDocument) => {
    setEditingDoc(doc);
    setForm({
      title: doc.title,
      subtitle: doc.subtitle || '',
      category: doc.category,
      author: doc.author,
      institution: doc.institution,
      version: doc.version,
      publicationDate: doc.publicationDate,
      accessLevel: doc.accessLevel,
      allowDownload: doc.allowDownload,
      description: doc.description,
      rawContent: doc.modules?.map(m => `--- Module: ${m.title} ---\n${m.summary || ''}\n${m.sections?.map(s => `## ${s.heading}\n${Array.isArray(s.content) ? s.content.join('\n') : s.content}`).join('\n\n')}`).join('\n\n') || ''
    });
    setShowAddModal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      setNotification({ type: 'error', message: 'Document Title is required.' });
      return;
    }

    // Convert rawContent into structured modules if provided
    const parsedModules = form.rawContent.trim() ? [
      {
        id: `m_custom_${Date.now()}`,
        number: 1,
        title: form.title,
        summary: form.description,
        sections: [
          {
            heading: 'Overview & Content',
            content: form.rawContent.split('\n\n')
          }
        ]
      }
    ] : [
      {
        id: `m_default_${Date.now()}`,
        number: 1,
        title: 'Core Materials',
        summary: form.description,
        sections: [
          {
            heading: 'Document Summary',
            content: form.description || 'Supplementary training resource.'
          }
        ]
      }
    ];

    try {
      if (editingDoc) {
        updateBootcampDocument(editingDoc.id, {
          title: form.title.trim(),
          subtitle: form.subtitle.trim(),
          category: form.category,
          author: form.author.trim(),
          institution: form.institution.trim(),
          version: form.version.trim(),
          accessLevel: form.accessLevel,
          allowDownload: form.allowDownload,
          description: form.description.trim(),
          modules: editingDoc.modules?.length ? editingDoc.modules : parsedModules
        });
        setNotification({ type: 'success', message: 'Document updated successfully.' });
      } else {
        addBootcampDocument({
          title: form.title.trim(),
          subtitle: form.subtitle.trim(),
          category: form.category,
          author: form.author.trim(),
          institution: form.institution.trim(),
          version: form.version.trim(),
          publicationDate: form.publicationDate,
          accessLevel: form.accessLevel,
          allowDownload: form.allowDownload,
          description: form.description.trim(),
          modules: parsedModules
        });
        setNotification({ type: 'success', message: 'New Bootcamp document added to vault.' });
      }
      setShowAddModal(false);
      refreshDocs();
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message || 'Failed to save document.' });
    }
  };

  const handleDelete = (id: string, title: string) => {
    if (id === OFFICIAL_AI_HANDBOOK.id) {
      alert('The core official YARA AI for Educators handbook cannot be deleted.');
      return;
    }
    if (confirm(`Are you sure you want to delete "${title}" from the bootcamp vault?`)) {
      try {
        deleteBootcampDocument(id);
        setNotification({ type: 'success', message: 'Document removed from vault.' });
        refreshDocs();
      } catch (err: any) {
        setNotification({ type: 'error', message: err.message });
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="p-6 bg-slate-900 text-white rounded-3xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-wider border border-blue-500/30">
              Admin Resource Manager
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-black uppercase tracking-wider border border-emerald-500/30 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> DRM Protected Vault
            </span>
          </div>
          <h3 className="text-xl font-black text-white">AI Bootcamp Documents & Handbooks</h3>
          <p className="text-xs text-slate-300">
            Manage handbooks and guides accessible only to registered and admin-approved educators.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs flex items-center space-x-2 transition-all shadow-lg cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Bootcamp Document</span>
        </button>
      </div>

      {notification && (
        <div className={`p-4 rounded-2xl text-xs font-bold flex items-center justify-between ${
          notification.type === 'success' ? 'bg-emerald-50 text-emerald-900 border border-emerald-200' : 'bg-red-50 text-red-900 border border-red-200'
        }`}>
          <span>{notification.message}</span>
          <button onClick={() => setNotification(null)} className="text-xs opacity-60 hover:opacity-100">×</button>
        </div>
      )}

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {documents.map((doc) => (
          <div key={doc.id} className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-blue-300 transition-all space-y-4 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 text-[9px] font-black uppercase">
                  {doc.category}
                </span>
                <div className="flex items-center space-x-1">
                  {doc.allowDownload ? (
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-[9px] font-bold flex items-center gap-1">
                      <Unlock className="w-3 h-3" /> Download Allowed
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 bg-amber-100 text-amber-900 rounded-full text-[9px] font-bold flex items-center gap-1">
                      <Lock className="w-3 h-3" /> DRM Protected (No Download)
                    </span>
                  )}
                </div>
              </div>

              <h4 className="text-lg font-black text-slate-900">{doc.title}</h4>
              {doc.subtitle && <p className="text-xs font-medium text-slate-500">{doc.subtitle}</p>}
              <p className="text-xs text-slate-600 line-clamp-2">{doc.description}</p>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
              <span className="font-medium text-slate-500">{doc.modules?.length || 0} Modules</span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleOpenEdit(doc)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs flex items-center space-x-1 cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
                {doc.id !== OFFICIAL_AI_HANDBOOK.id && (
                  <button
                    onClick={() => handleDelete(doc.id, doc.title)}
                    className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-lg text-xs flex items-center space-x-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-2xl w-full p-6 space-y-6 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                  <BookOpen className="w-4 h-4" />
                </div>
                <h3 className="text-lg font-black text-slate-900">
                  {editingDoc ? 'Edit Bootcamp Document' : 'Add New Bootcamp Document'}
                </h3>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Document Title *</label>
                  <input
                    type="text"
                    required
                    value={form.title}
                    onChange={e => setForm({ ...form, title: e.target.value })}
                    placeholder="e.g. AI Prompt Engineering Handbook"
                    className="input-premium"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Subtitle / Tagline</label>
                  <input
                    type="text"
                    value={form.subtitle}
                    onChange={e => setForm({ ...form, subtitle: e.target.value })}
                    placeholder="e.g. Practical Guide for Teachers"
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
                    <option value="handbook">Handbook</option>
                    <option value="guide">Guide</option>
                    <option value="worksheet">Worksheet</option>
                    <option value="prompt_library">Prompt Library</option>
                    <option value="admin_doc">Admin Document</option>
                    <option value="other">Other Resource</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Version / Edition</label>
                  <input
                    type="text"
                    value={form.version}
                    onChange={e => setForm({ ...form, version: e.target.value })}
                    placeholder="e.g. 2026 Edition"
                    className="input-premium"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Access Control</label>
                  <select
                    value={form.accessLevel}
                    onChange={e => setForm({ ...form, accessLevel: e.target.value as any })}
                    className="input-premium"
                  >
                    <option value="approved_educators_only">Approved Educators Only</option>
                    <option value="all_registered">All Registered Users</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Description / Overview</label>
                <textarea
                  rows={2}
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="Summary of what this bootcamp document covers..."
                  className="input-premium"
                />
              </div>

              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                    <Lock className="w-4 h-4 text-amber-600" />
                    Strict DRM Download Protection
                  </span>
                  <label className="flex items-center space-x-2 text-xs text-amber-900 font-bold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.allowDownload}
                      onChange={e => setForm({ ...form, allowDownload: e.target.checked })}
                      className="rounded border-amber-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span>Allow PDF Download</span>
                  </label>
                </div>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  When download protection is ON (default), educators can read the full document on-screen in the secured reader, but right-clicking, selecting text, printing, and downloading are disabled.
                </p>
              </div>

              {!editingDoc && (
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Document Text / Sections Content</label>
                  <textarea
                    rows={4}
                    value={form.rawContent}
                    onChange={e => setForm({ ...form, rawContent: e.target.value })}
                    placeholder="Paste document text or module notes here..."
                    className="input-premium font-mono text-xs"
                  />
                </div>
              )}

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs flex items-center space-x-1.5 cursor-pointer shadow-lg"
                >
                  <Save className="w-4 h-4" />
                  <span>{editingDoc ? 'Update Document' : 'Save Document to Vault'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
