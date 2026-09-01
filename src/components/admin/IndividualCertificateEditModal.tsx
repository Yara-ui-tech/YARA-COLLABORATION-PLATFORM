import React, { useState, useEffect } from 'react';
import { 
  Award, CheckCircle2, X, Save, Eye, Lock, Unlock, 
  Building2, MapPin, User, Calendar, FileText, Check, Printer
} from 'lucide-react';
import { motion } from 'motion/react';
import { 
  EventRegistration, 
  EducatorCertificateData 
} from '../../types/eventRegistration';
import { 
  buildEducatorCertificate,
  updateIndividualRegistrationCertificate
} from '../../services/eventRegistrationService';
import EducatorCertificate from '../events/EducatorCertificate';

interface IndividualCertificateEditModalProps {
  isOpen: boolean;
  registration: EventRegistration | null;
  onClose: () => void;
  onUpdated: (updatedReg: EventRegistration) => void;
}

export default function IndividualCertificateEditModal({
  isOpen,
  registration,
  onClose,
  onUpdated
}: IndividualCertificateEditModalProps) {
  const [formData, setFormData] = useState({
    full_name: '',
    school_institution: '',
    province: '',
    role_title: '',
    certificate_number: '',
    certificate_grade: 'Certified Educator - AI & Digital Pedagogy (Honors)',
    certificate_unlocked: true,
    issue_date: '4 September 2026'
  });

  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (registration) {
      const code = (registration.registration_code || registration.id).toUpperCase();
      const defaultCertNum = registration.certificate_number || `YARA-AI-EDU-2026-${code.replace('YARA-AI-', '')}`;
      
      setFormData({
        full_name: registration.full_name || '',
        school_institution: registration.school_institution || '',
        province: registration.province || 'Harare',
        role_title: registration.role_title || 'Educator / Teacher',
        certificate_number: defaultCertNum,
        certificate_grade: registration.certificate_grade || 'Certified Educator - AI & Digital Pedagogy (Honors)',
        certificate_unlocked: registration.certificate_unlocked ?? true,
        issue_date: registration.certificate_unlocked_at 
          ? new Date(registration.certificate_unlocked_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
          : '4 September 2026'
      });
      setIsPreviewMode(false);
      setSaveSuccess(false);
    }
  }, [registration]);

  if (!isOpen || !registration) return null;

  const currentCertData: EducatorCertificateData = buildEducatorCertificate(registration, {
    recipient_name: formData.full_name,
    institution_name: formData.school_institution,
    province: formData.province,
    role_title: formData.role_title,
    certificate_number: formData.certificate_number,
    grade: formData.certificate_grade,
    issue_date: formData.issue_date,
    status: formData.certificate_unlocked ? 'unlocked' : 'locked'
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const updated = await updateIndividualRegistrationCertificate(
        registration.id,
        {
          full_name: formData.full_name,
          school_institution: formData.school_institution,
          province: formData.province,
          role_title: formData.role_title,
          certificate_number: formData.certificate_number,
          certificate_grade: formData.certificate_grade,
          certificate_unlocked: formData.certificate_unlocked,
          issue_date: formData.issue_date
        },
        'YARA Executive Board'
      );

      if (updated) {
        onUpdated(updated);
        setSaveSuccess(true);
        setTimeout(() => {
          setSaveSuccess(false);
          onClose();
        }, 1200);
      }
    } catch (err) {
      console.error('Error saving individual certificate:', err);
      alert('Failed to update certificate details.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 print:hidden">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-amber-600 to-amber-700 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center text-white font-bold">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-black text-white">Edit Participant Certificate</h3>
                <span className="px-2 py-0.5 bg-black/20 text-white text-[10px] font-mono font-bold rounded-md">
                  {formData.certificate_number}
                </span>
              </div>
              <p className="text-xs text-amber-100">
                Customize attendee credentials, school name, honors distinction, and unlocked state.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPreviewMode(!isPreviewMode)}
              className="px-3.5 py-1.5 bg-white/20 hover:bg-white/30 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{isPreviewMode ? 'Form View' : 'Live Preview'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-white/80 hover:text-white rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 flex-1 overflow-y-auto">
          {isPreviewMode ? (
            <div className="space-y-4">
              <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl text-xs text-indigo-900 flex items-center justify-between">
                <span>Certificate preview with current customized attributes:</span>
                <span className="font-bold font-mono">{formData.certificate_number}</span>
              </div>
              <div className="border border-slate-300 rounded-2xl p-4 bg-slate-100 shadow-inner">
                <EducatorCertificate
                  data={currentCertData}
                  showPrintActions={false}
                />
              </div>
            </div>
          ) : (
            <form id="individual-cert-form" onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Full Name */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Educator / Recipient Name *</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={formData.full_name}
                      onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                {/* School / Institution */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">School / Institution / Ministry *</label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={formData.school_institution}
                      onChange={e => setFormData({ ...formData, school_institution: e.target.value })}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                {/* Province */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Province / Region</label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={formData.province}
                      onChange={e => setFormData({ ...formData, province: e.target.value })}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                {/* Role Title */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Professional Role / Title</label>
                  <input
                    type="text"
                    value={formData.role_title}
                    onChange={e => setFormData({ ...formData, role_title: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                  />
                </div>

                {/* Certificate Number */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Unique Certificate Number *</label>
                  <input
                    type="text"
                    required
                    value={formData.certificate_number}
                    onChange={e => setFormData({ ...formData, certificate_number: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-indigo-700 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-hidden uppercase"
                  />
                </div>

                {/* Issue Date */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Official Issue Date</label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={formData.issue_date}
                      onChange={e => setFormData({ ...formData, issue_date: e.target.value })}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                      placeholder="e.g. 4 September 2026"
                    />
                  </div>
                </div>

              </div>

              {/* Honors / Distinction */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Honors & Distinction Badge Statement</label>
                <input
                  type="text"
                  value={formData.certificate_grade}
                  onChange={e => setFormData({ ...formData, certificate_grade: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-amber-50/50 border border-amber-300 rounded-xl font-bold text-amber-950 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                />
              </div>

              {/* Unlocked / Locked Toggle */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 block">Certificate Access State</span>
                  <span className="text-slate-500 text-[11px]">
                    {formData.certificate_unlocked 
                      ? 'Unlocked: Attendee can view, download, print high-res PDF and share certificate link.'
                      : 'Locked: Attendee sees preview watermark with verification pending banner.'}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, certificate_unlocked: !formData.certificate_unlocked })}
                  className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center space-x-1.5 cursor-pointer transition-all ${
                    formData.certificate_unlocked
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-amber-100 text-amber-800 border border-amber-300'
                  }`}
                >
                  {formData.certificate_unlocked ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                  <span>{formData.certificate_unlocked ? 'Unlocked & Active' : 'Locked (Pending)'}</span>
                </button>
              </div>

            </form>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div>
            {saveSuccess && (
              <span className="text-xs font-bold text-emerald-600 flex items-center space-x-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>Certificate successfully updated!</span>
              </span>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="individual-cert-form"
              disabled={isSaving}
              className="px-6 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl text-xs flex items-center space-x-1.5 shadow-md cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Saving...' : 'Save Certificate Changes'}</span>
            </button>
          </div>
        </div>

      </motion.div>
    </div>
  );
}
