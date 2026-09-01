import React, { useState, useEffect, useRef } from 'react';
import { 
  Award, ShieldCheck, Upload, Trash2, RefreshCw, Save, 
  X, Eye, CheckCircle2, AlertCircle, FileText, Image as ImageIcon,
  Check, Sparkles, Building2, UserCheck, HelpCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CertificateTemplateConfig,
  EducatorCertificateData
} from '../../types/eventRegistration';
import { 
  getCertificateTemplateConfig,
  updateCertificateTemplateConfig,
  DEFAULT_CERTIFICATE_TEMPLATE_CONFIG
} from '../../services/eventRegistrationService';
import { ASSETS } from '../../constants/assets';
import EducatorCertificate from '../events/EducatorCertificate';

interface CertificateSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: (cfg: CertificateTemplateConfig) => void;
}

export default function CertificateSettingsModal({
  isOpen,
  onClose,
  onSaved
}: CertificateSettingsModalProps) {
  const [config, setConfig] = useState<CertificateTemplateConfig>(() => getCertificateTemplateConfig());
  const [activeTab, setActiveTab] = useState<'signatories' | 'text' | 'preview'>('signatories');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // File upload input refs
  const founderSigRef = useRef<HTMLInputElement>(null);
  const presidentSigRef = useRef<HTMLInputElement>(null);
  const sealFileRef = useRef<HTMLInputElement>(null);
  const logoFileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setConfig(getCertificateTemplateConfig());
      setSaveSuccess(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Helper to handle image files and convert to base64 Data URLs
  const handleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: keyof CertificateTemplateConfig
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (PNG, JPG, SVG, WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setConfig(prev => ({
        ...prev,
        [field]: dataUrl
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await updateCertificateTemplateConfig(config, 'YARA Administrator');
      setConfig(updated);
      setSaveSuccess(true);
      if (onSaved) onSaved(updated);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to save certificate template config:', err);
      alert('Failed to save certificate configuration. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleResetToDefaults = () => {
    if (confirm('Are you sure you want to reset all certificate layout, titles, and signatures to official default settings?')) {
      setConfig(DEFAULT_CERTIFICATE_TEMPLATE_CONFIG);
    }
  };

  // Mock certificate data for live preview
  const sampleCertificateData: EducatorCertificateData = {
    certificate_number: 'YARA-AI-EDU-2026-PREVIEW',
    recipient_name: 'Dr. Evelyn Chidhumo',
    recipient_email: 'evelyn.chidhumo@school.ac.zw',
    institution_name: 'Prince Edward School',
    role_title: 'Head of STEM & Computer Science',
    province: 'Harare Province',
    event_title: 'AI for Educators Online Bootcamp 2026',
    event_dates: '28 August – 04 September 2026',
    issue_date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
    organization_name: config.organization_name,
    sub_organization_name: config.sub_organization_name,
    certificate_title: config.certificate_title,
    certificate_subtitle: config.certificate_subtitle,
    citation_text: config.citation_text,
    founder_name: config.founder_name,
    founder_title: config.founder_title,
    founder_signature: config.founder_signature_url,
    regional_president_name: config.regional_president_name,
    regional_president_title: config.regional_president_title,
    regional_president_signature: config.regional_president_signature_url,
    seal_url: config.seal_url,
    logo_url: config.logo_url,
    verification_url: `${window.location.origin}/verify-certificate?id=YARA-AI-EDU-2026-PREVIEW`,
    qr_code_value: `${window.location.origin}/verify-certificate?id=YARA-AI-EDU-2026-PREVIEW`,
    status: 'unlocked',
    grade: config.default_grade,
    honors: config.honors_badge_text
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 print:hidden">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between border-b border-white/10 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base sm:text-lg font-black text-white">Certificate Design & Signatures Studio</h2>
                <span className="px-2.5 py-0.5 bg-amber-400/20 text-amber-300 border border-amber-400/30 rounded-full text-[10px] font-bold">
                  Live Accreditation Engine
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Upload official executive signatures, gold seals, organization crests, and customize certificate copy.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Sub-nav Tabs */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-2.5 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveTab('signatories')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                activeTab === 'signatories'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Signatures, Seals & Logo</span>
            </button>

            <button
              onClick={() => setActiveTab('text')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                activeTab === 'text'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Titles, Citation & Honors</span>
            </button>

            <button
              onClick={() => setActiveTab('preview')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                activeTab === 'preview'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Interactive Live Preview</span>
            </button>
          </div>

          <div className="flex items-center space-x-2">
            {saveSuccess && (
              <span className="text-xs font-bold text-emerald-600 flex items-center space-x-1 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Saved & Synchronized!</span>
              </span>
            )}
            <button
              type="button"
              onClick={handleResetToDefaults}
              className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 font-semibold hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              Reset Defaults
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'signatories' && (
            <div className="space-y-6">
              
              {/* Executive Signatories Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* 1. Founder & Lead Instructor: Mr. S.O. Manongwa */}
                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">
                        1
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">Lead Signatory (Founder)</h4>
                        <p className="text-[11px] text-slate-500">Mr. S.O. Manongwa</p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-md text-[10px] font-bold">
                      Left Signature
                    </span>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Signatory Full Name</label>
                      <input
                        type="text"
                        value={config.founder_name}
                        onChange={e => setConfig({ ...config, founder_name: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Signatory Title & Affiliation</label>
                      <textarea
                        rows={2}
                        value={config.founder_title}
                        onChange={e => setConfig({ ...config, founder_title: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1.5">Official Signature Image</label>
                      <div className="p-3 bg-amber-50/40 rounded-xl border border-amber-200/60 flex items-center justify-between gap-4">
                        <div className="h-16 flex-1 bg-white rounded-lg border border-slate-200 p-1 flex items-center justify-center overflow-hidden">
                          {config.founder_signature_url ? (
                            <img
                              src={config.founder_signature_url}
                              alt="Mr S.O. Manongwa Signature"
                              className="max-h-full max-w-full object-contain mix-blend-multiply"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <span className="text-[11px] text-slate-400 italic">No signature image uploaded</span>
                          )}
                        </div>

                        <div className="flex flex-col gap-2">
                          <input
                            type="file"
                            ref={founderSigRef}
                            onChange={e => handleImageUpload(e, 'founder_signature_url')}
                            accept="image/*"
                            className="hidden"
                          />
                          <button
                            type="button"
                            onClick={() => founderSigRef.current?.click()}
                            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold flex items-center space-x-1.5 cursor-pointer shadow-xs transition-colors"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            <span>Upload Signature</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfig({ ...config, founder_signature_url: ASSETS.SIGNATURE_MANONGWA })}
                            className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer text-center"
                          >
                            Use Default
                          </button>
                        </div>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1">
                        High-contrast blue or black pen signature on white paper is automatically transparency-blended on the certificate.
                      </p>
                    </div>
                  </div>
                </div>

                {/* 2. Regional President: Ms. A.M. Chiambiro */}
                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-xs">
                        2
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">Accrediting Signatory (Regional)</h4>
                        <p className="text-[11px] text-slate-500">Ms. A.M. Chiambiro</p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 bg-purple-50 text-purple-700 rounded-md text-[10px] font-bold">
                      Right Signature
                    </span>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Signatory Full Name</label>
                      <input
                        type="text"
                        value={config.regional_president_name}
                        onChange={e => setConfig({ ...config, regional_president_name: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Signatory Title & Affiliation</label>
                      <textarea
                        rows={2}
                        value={config.regional_president_title}
                        onChange={e => setConfig({ ...config, regional_president_title: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1.5">Official Signature Image</label>
                      <div className="p-3 bg-amber-50/40 rounded-xl border border-amber-200/60 flex items-center justify-between gap-4">
                        <div className="h-16 flex-1 bg-white rounded-lg border border-slate-200 p-1 flex items-center justify-center overflow-hidden">
                          {config.regional_president_signature_url ? (
                            <img
                              src={config.regional_president_signature_url}
                              alt="Ms A.M. Chiambiro Signature"
                              className="max-h-full max-w-full object-contain mix-blend-multiply"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <span className="text-[11px] text-slate-400 italic">No signature image uploaded</span>
                          )}
                        </div>

                        <div className="flex flex-col gap-2">
                          <input
                            type="file"
                            ref={presidentSigRef}
                            onChange={e => handleImageUpload(e, 'regional_president_signature_url')}
                            accept="image/*"
                            className="hidden"
                          />
                          <button
                            type="button"
                            onClick={() => presidentSigRef.current?.click()}
                            className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold flex items-center space-x-1.5 cursor-pointer shadow-xs transition-colors"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            <span>Upload Signature</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfig({ ...config, regional_president_signature_url: ASSETS.SIGNATURE_CHIAMBIRO })}
                            className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer text-center"
                          >
                            Use Default
                          </button>
                        </div>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1">
                        High-contrast ink signature for A.M. Chiambiro automatically blends on the certificate canvas.
                      </p>
                    </div>
                  </div>
                </div>

              </div>

              {/* Official Seal & Official Logo Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Official Gold & Royal Blue Foil Seal */}
                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs">
                        <Award className="w-4 h-4" />
                      </div>
                      <h4 className="text-xs font-black text-slate-900 uppercase">Official Center Seal (Gold Foil)</h4>
                    </div>
                    <span className="px-2 py-0.5 bg-amber-100 text-amber-900 rounded text-[10px] font-bold">
                      Accreditation Seal
                    </span>
                  </div>

                  <div className="flex items-center gap-4 pt-1">
                    <div className="w-24 h-24 rounded-2xl bg-amber-50/50 border border-amber-200 p-2 flex items-center justify-center shrink-0">
                      <img
                        src={config.seal_url || ASSETS.EDUCATOR_SEAL}
                        alt="Accredited Seal"
                        className="max-h-full max-w-full object-contain drop-shadow-md"
                        referrerPolicy="no-referrer"
                      />
                    </div>

                    <div className="space-y-2 flex-1">
                      <p className="text-xs text-slate-600 leading-snug">
                        Upload custom high-res seal badge for AI for Educators Bootcamp, STEM Accreditation, or YARA Academy.
                      </p>
                      <input
                        type="file"
                        ref={sealFileRef}
                        onChange={e => handleImageUpload(e, 'seal_url')}
                        accept="image/*"
                        className="hidden"
                      />
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => sealFileRef.current?.click()}
                          className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl text-xs flex items-center space-x-1.5 shadow-xs transition-colors cursor-pointer"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>Upload New Seal</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfig({ ...config, seal_url: ASSETS.EDUCATOR_SEAL })}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                        >
                          Reset Seal
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Organization Official Crest / Logo */}
                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-800 flex items-center justify-center font-bold text-xs">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <h4 className="text-xs font-black text-slate-900 uppercase">Top Institutional Header Logo</h4>
                    </div>
                    <span className="px-2 py-0.5 bg-indigo-100 text-indigo-900 rounded text-[10px] font-bold">
                      Header Emblem
                    </span>
                  </div>

                  <div className="flex items-center gap-4 pt-1">
                    <div className="w-24 h-24 rounded-2xl bg-slate-50 border border-slate-200 p-2 flex items-center justify-center shrink-0">
                      <img
                        src={config.logo_url || ASSETS.LOGO}
                        alt="YARA Academy Crest"
                        className="max-h-full max-w-full object-contain rounded-xl shadow-xs"
                        referrerPolicy="no-referrer"
                      />
                    </div>

                    <div className="space-y-2 flex-1">
                      <p className="text-xs text-slate-600 leading-snug">
                        Official institutional crest displayed in the gold-bordered header banner of all issued certificates.
                      </p>
                      <input
                        type="file"
                        ref={logoFileRef}
                        onChange={e => handleImageUpload(e, 'logo_url')}
                        accept="image/*"
                        className="hidden"
                      />
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => logoFileRef.current?.click()}
                          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center space-x-1.5 shadow-xs transition-colors cursor-pointer"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>Upload New Logo</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfig({ ...config, logo_url: ASSETS.LOGO })}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                        >
                          Reset Logo
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          )}

          {activeTab === 'text' && (
            <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Organization Header Title</label>
                  <input
                    type="text"
                    value={config.organization_name}
                    onChange={e => setConfig({ ...config, organization_name: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Sub-Organization / Directorate Line</label>
                  <input
                    type="text"
                    value={config.sub_organization_name}
                    onChange={e => setConfig({ ...config, sub_organization_name: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Main Certificate Title</label>
                  <input
                    type="text"
                    value={config.certificate_title}
                    onChange={e => setConfig({ ...config, certificate_title: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-serif font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Certificate Subtitle / Track</label>
                  <input
                    type="text"
                    value={config.certificate_subtitle}
                    onChange={e => setConfig({ ...config, certificate_subtitle: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Citation Body Text (Curriculum Mastery Statement)</label>
                <textarea
                  rows={3}
                  value={config.citation_text}
                  onChange={e => setConfig({ ...config, citation_text: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 leading-relaxed focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  placeholder="Citation text detailing masterclass achievements..."
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Note: Any duration markers (e.g. "5-day") have been removed to emphasize mastery of curriculum competencies.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Default Honors & Accreditation Badge</label>
                  <input
                    type="text"
                    value={config.honors_badge_text}
                    onChange={e => setConfig({ ...config, honors_badge_text: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-amber-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Default Grade / Distinction</label>
                  <input
                    type="text"
                    value={config.default_grade}
                    onChange={e => setConfig({ ...config, default_grade: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'preview' && (
            <div className="space-y-4">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between text-xs text-amber-900">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span><strong>Live Interactive Rendering</strong>: Any edits made to signatures, seals, and text reflect instantly below.</span>
                </div>
                <span className="font-mono text-[11px] text-amber-800 font-bold">A4 High-Res Vector</span>
              </div>

              <div className="border border-slate-300 rounded-3xl p-4 bg-slate-100/70 shadow-inner">
                <EducatorCertificate
                  data={sampleCertificateData}
                  showPrintActions={false}
                />
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center space-x-2 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Changes are stored to cloud database and synced to all recipient certificates immediately.</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
            >
              Close
            </button>

            <button
              type="button"
              disabled={saving}
              onClick={handleSave}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-xs flex items-center space-x-2 shadow-lg shadow-emerald-600/20 transition-all cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save & Publish Certificate Template'}</span>
            </button>
          </div>
        </div>

      </motion.div>
    </div>
  );
}
