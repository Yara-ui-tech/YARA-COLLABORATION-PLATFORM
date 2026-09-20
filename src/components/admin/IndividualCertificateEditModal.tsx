import React, { useState, useEffect, useRef } from 'react';
import { 
  Award, CheckCircle2, X, Save, Eye, Lock, Unlock, 
  Building2, MapPin, User, Calendar, FileText, Check, Upload,
  ImageIcon, ShieldCheck, Globe, RefreshCw, Sparkles, Image as ImageLucide
} from 'lucide-react';
import { motion } from 'motion/react';
import { 
  EventRegistration, 
  EducatorCertificateData 
} from '../../types/eventRegistration';
import { 
  buildEducatorCertificate,
  updateIndividualRegistrationCertificate,
  getCertificateTemplateConfig
} from '../../services/eventRegistrationService';
import EducatorCertificate from '../events/EducatorCertificate';
import ImageUploader from '../ImageUploader';

interface IndividualCertificateEditModalProps {
  isOpen: boolean;
  registration: EventRegistration | null;
  onClose: () => void;
  onUpdated: (updatedReg: EventRegistration) => void;
}

export const COUNTRY_PROVINCE_MAP: Record<string, string[]> = {
  'Zimbabwe': [
    'Harare',
    'Bulawayo',
    'Manicaland',
    'Mashonaland Central',
    'Mashonaland East',
    'Mashonaland West',
    'Masvingo',
    'Matabeleland North',
    'Matabeleland South',
    'Midlands'
  ],
  'South Africa': [
    'Gauteng',
    'Western Cape',
    'KwaZulu-Natal',
    'Eastern Cape',
    'Free State',
    'Limpopo',
    'Mpumalanga',
    'Northern Cape',
    'North West'
  ],
  'Nigeria': [
    'Lagos',
    'Abuja (FCT)',
    'Rivers',
    'Kano',
    'Oyo',
    'Kaduna',
    'Anambra',
    'Ogun',
    'Enugu',
    'Edo'
  ],
  'Kenya': [
    'Nairobi',
    'Mombasa',
    'Kisumu',
    'Nakuru',
    'Eldoret',
    'Machakos'
  ],
  'Ghana': [
    'Greater Accra',
    'Ashanti',
    'Western',
    'Central',
    'Eastern',
    'Northern'
  ],
  'Rwanda': [
    'Kigali City',
    'Eastern Province',
    'Western Province',
    'Northern Province',
    'Southern Province'
  ],
  'Uganda': [
    'Kampala',
    'Central Region',
    'Eastern Region',
    'Northern Region',
    'Western Region'
  ],
  'Zambia': [
    'Lusaka',
    'Copperbelt',
    'Southern Province',
    'Central Province',
    'Eastern Province'
  ],
  'United Kingdom': [
    'England',
    'Scotland',
    'Wales',
    'Northern Ireland'
  ],
  'United States': [
    'California',
    'New York',
    'Texas',
    'Florida',
    'Illinois',
    'Massachusetts'
  ],
  'Other / Custom': []
};

export default function IndividualCertificateEditModal({
  isOpen,
  registration,
  onClose,
  onUpdated
}: IndividualCertificateEditModalProps) {
  const tpl = getCertificateTemplateConfig();

  const [country, setCountry] = useState<string>('Zimbabwe');
  const [provinceInput, setProvinceInput] = useState<string>('Harare');
  const [isCustomProvince, setIsCustomProvince] = useState<boolean>(false);

  const [formData, setFormData] = useState({
    full_name: '',
    school_institution: '',
    role_title: '',
    certificate_number: '',
    certificate_grade: 'Certified Educator - AI & Digital Pedagogy (Honors)',
    certificate_unlocked: true,
    issue_date: '4 September 2026',
    certificate_title: 'YARA AI FOR EDUCATORS CERTIFICATE',
    certificate_subtitle: 'Five-Day Introductory Online Bootcamp',
    citation_text: 'for successfully completing the introductory training in Artificial Intelligence & Digital Tools for Educational Leadership',
    
    // Signatories & Signatures
    founder_name: 'Mr. S.O. Manongwa',
    founder_title: 'Founder & Lead Instructor\nYoung Africans Robotics Association (YARA)',
    founder_signature: '',
    
    regional_president_name: 'Ms. A.M. Chiambiro',
    regional_president_title: 'Regional President\nYARA Zimbabwe',
    regional_president_signature: '',
    
    // Seals & Logo
    seal_url: '',
    logo_url: ''
  });

  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // File input refs
  const founderSigFileRef = useRef<HTMLInputElement>(null);
  const presidentSigFileRef = useRef<HTMLInputElement>(null);
  const sealFileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (registration) {
      const code = (registration.registration_code || registration.id).toUpperCase();
      const defaultCertNum = registration.certificate_number || `YARA-AI-EDU-2026-${code.replace('YARA-AI-', '')}`;
      
      const currentProv = registration.province || 'Harare';
      let foundCountry = 'Zimbabwe';
      let inList = false;

      for (const [cName, pList] of Object.entries(COUNTRY_PROVINCE_MAP)) {
        if (pList.includes(currentProv)) {
          foundCountry = cName;
          inList = true;
          break;
        }
      }

      setCountry(foundCountry);
      setProvinceInput(currentProv);
      setIsCustomProvince(!inList);

      setFormData({
        full_name: registration.full_name || '',
        school_institution: registration.school_institution || '',
        role_title: registration.role_title || 'Educator / Teacher',
        certificate_number: defaultCertNum,
        certificate_grade: registration.certificate_grade || 'Certified Educator - AI & Digital Pedagogy (Honors)',
        certificate_unlocked: registration.certificate_unlocked ?? true,
        issue_date: registration.certificate_unlocked_at 
          ? new Date(registration.certificate_unlocked_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
          : '4 September 2026',
        certificate_title: registration.certificate_title || tpl.certificate_title || 'YARA AI FOR EDUCATORS CERTIFICATE',
        certificate_subtitle: tpl.certificate_subtitle || 'Five-Day Introductory Online Bootcamp',
        citation_text: tpl.citation_text || 'for successfully completing the introductory training in Artificial Intelligence & Digital Tools for Educational Leadership',
        founder_name: tpl.founder_name || 'Mr. S.O. Manongwa',
        founder_title: tpl.founder_title || 'Founder & Lead Instructor\nYoung Africans Robotics Association (YARA)',
        founder_signature: tpl.founder_signature_url || '',
        regional_president_name: tpl.regional_president_name || 'Ms. A.M. Chiambiro',
        regional_president_title: tpl.regional_president_title || 'Regional President\nYARA Zimbabwe',
        regional_president_signature: tpl.regional_president_signature_url || '',
        seal_url: tpl.seal_url || '',
        logo_url: tpl.logo_url || ''
      });

      setIsPreviewMode(false);
      setSaveSuccess(false);
    }
  }, [registration]);

  if (!isOpen || !registration) return null;

  // Country Change Handler
  const handleCountryChange = (newCountry: string) => {
    setCountry(newCountry);
    const provinces = COUNTRY_PROVINCE_MAP[newCountry] || [];
    if (provinces.length > 0) {
      setProvinceInput(provinces[0]);
      setIsCustomProvince(false);
    } else {
      setIsCustomProvince(true);
    }
  };

  // Image Upload Helper for Signatures / Seals
  const handleSignatureUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: 'founder_signature' | 'regional_president_signature' | 'seal_url' | 'logo_url'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select a valid signature/image file (PNG, JPG, SVG).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setFormData(prev => ({
        ...prev,
        [field]: dataUrl
      }));
    };
    reader.readAsDataURL(file);
  };

  const finalProvinceString = country && country !== 'Other / Custom' ? `${provinceInput}, ${country}` : provinceInput;

  const currentCertData: EducatorCertificateData = buildEducatorCertificate(registration, {
    recipient_name: formData.full_name,
    institution_name: formData.school_institution,
    province: finalProvinceString,
    role_title: formData.role_title,
    certificate_number: formData.certificate_number,
    certificate_title: formData.certificate_title,
    certificate_subtitle: formData.certificate_subtitle,
    citation_text: formData.citation_text,
    grade: formData.certificate_grade,
    issue_date: formData.issue_date,
    founder_name: formData.founder_name,
    founder_title: formData.founder_title,
    founder_signature: formData.founder_signature,
    regional_president_name: formData.regional_president_name,
    regional_president_title: formData.regional_president_title,
    regional_president_signature: formData.regional_president_signature,
    seal_url: formData.seal_url,
    logo_url: formData.logo_url,
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
          province: finalProvinceString,
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

  const availableProvinces = COUNTRY_PROVINCE_MAP[country] || [];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 print:hidden">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-amber-600 via-amber-700 to-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center text-white font-bold">
              <Award className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-black text-white">Full Certificate Customization Console</h3>
                <span className="px-2 py-0.5 bg-black/30 text-amber-200 text-[10px] font-mono font-bold rounded-md border border-amber-400/30">
                  {formData.certificate_number}
                </span>
              </div>
              <p className="text-xs text-amber-100">
                Upload signatures, country/province selector, credentials, signatory titles, and honors seal.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPreviewMode(!isPreviewMode)}
              className="px-3.5 py-1.5 bg-white/20 hover:bg-white/30 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer border border-white/20"
            >
              <Eye className="w-3.5 h-3.5 text-amber-300" />
              <span>{isPreviewMode ? 'Edit Form View' : 'Live Certificate Preview'}</span>
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
        <div className="p-6 flex-1 overflow-y-auto space-y-6">
          {isPreviewMode ? (
            <div className="space-y-4">
              <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl text-xs text-indigo-900 flex items-center justify-between">
                <span>Real-Time Certificate Rendering with Customized Attributes & Signatures:</span>
                <span className="font-bold font-mono text-indigo-700">{formData.certificate_number}</span>
              </div>
              <div className="border border-slate-300 rounded-2xl p-4 bg-slate-100 shadow-inner">
                <EducatorCertificate
                  data={currentCertData}
                  showPrintActions={false}
                />
              </div>
            </div>
          ) : (
            <form id="individual-cert-form" onSubmit={handleSave} className="space-y-6 text-xs">
              
              {/* SECTION 1: Recipient & Geographic Information */}
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
                <div className="flex items-center space-x-2 text-slate-800 border-b border-slate-200 pb-2">
                  <User className="w-4 h-4 text-amber-600" />
                  <h4 className="font-extrabold uppercase tracking-wider text-xs">1. Recipient & Geographic Identity</h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Educator / Recipient Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.full_name}
                      onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                      placeholder="e.g. Dr. Farai Muringani"
                    />
                  </div>

                  {/* School / Institution */}
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">School / Institution / Ministry *</label>
                    <input
                      type="text"
                      required
                      value={formData.school_institution}
                      onChange={e => setFormData({ ...formData, school_institution: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                      placeholder="e.g. Harare High School / Ministry of Education"
                    />
                  </div>

                  {/* Country Selector */}
                  <div>
                    <label className="font-bold text-slate-700 block mb-1 flex items-center space-x-1">
                      <Globe className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Country Selection *</span>
                    </label>
                    <select
                      value={country}
                      onChange={e => handleCountryChange(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-hidden cursor-pointer"
                    >
                      {Object.keys(COUNTRY_PROVINCE_MAP).map(cName => (
                        <option key={cName} value={cName}>{cName}</option>
                      ))}
                    </select>
                  </div>

                  {/* Dynamic Province / State Selector */}
                  <div>
                    <label className="font-bold text-slate-700 block mb-1 flex items-center space-x-1">
                      <MapPin className="w-3.5 h-3.5 text-amber-600" />
                      <span>Province / Region / State *</span>
                    </label>

                    {!isCustomProvince && availableProvinces.length > 0 ? (
                      <div className="flex space-x-2">
                        <select
                          value={provinceInput}
                          onChange={e => setProvinceInput(e.target.value)}
                          className="flex-1 px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-hidden cursor-pointer"
                        >
                          {availableProvinces.map(p => (
                            <option key={p} value={p}>{p}</option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => setIsCustomProvince(true)}
                          className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl text-[11px]"
                          title="Enter custom province name"
                        >
                          Custom
                        </button>
                      </div>
                    ) : (
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          required
                          value={provinceInput}
                          onChange={e => setProvinceInput(e.target.value)}
                          className="flex-1 px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-hidden font-bold"
                          placeholder="Enter province or state name..."
                        />
                        {availableProvinces.length > 0 && (
                          <button
                            type="button"
                            onClick={() => {
                              setIsCustomProvince(false);
                              setProvinceInput(availableProvinces[0]);
                            }}
                            className="px-3 py-2 bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold rounded-xl text-[11px]"
                          >
                            Dropdown List
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Professional Role Title */}
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Professional Role / Title</label>
                    <input
                      type="text"
                      value={formData.role_title}
                      onChange={e => setFormData({ ...formData, role_title: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                      placeholder="e.g. Senior Educator / STEM Coordinator"
                    />
                  </div>

                  {/* Issue Date */}
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Official Issue Date</label>
                    <input
                      type="text"
                      value={formData.issue_date}
                      onChange={e => setFormData({ ...formData, issue_date: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                      placeholder="e.g. 4 September 2026"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: Certificate Serial, Title & Honors Citation */}
              <div className="bg-amber-50/40 p-5 rounded-2xl border border-amber-200/80 space-y-4">
                <div className="flex items-center space-x-2 text-amber-900 border-b border-amber-200 pb-2">
                  <Award className="w-4 h-4 text-amber-600" />
                  <h4 className="font-extrabold uppercase tracking-wider text-xs">2. Certificate Serial, Title & Citation Text</h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Unique Serial Number */}
                  <div>
                    <label className="font-bold text-slate-800 block mb-1">Unique Certificate Serial Number *</label>
                    <input
                      type="text"
                      required
                      value={formData.certificate_number}
                      onChange={e => setFormData({ ...formData, certificate_number: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-white border border-amber-300 rounded-xl font-mono font-bold text-indigo-700 focus:ring-2 focus:ring-amber-500 focus:outline-hidden uppercase"
                    />
                  </div>

                  {/* Main Certificate Title */}
                  <div>
                    <label className="font-bold text-slate-800 block mb-1">Main Certificate Header Title</label>
                    <input
                      type="text"
                      value={formData.certificate_title}
                      onChange={e => setFormData({ ...formData, certificate_title: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-white border border-amber-300 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                {/* Honors & Distinction Badge Statement */}
                <div>
                  <label className="font-bold text-slate-800 block mb-1">Honors & Distinction Badge Statement</label>
                  <input
                    type="text"
                    value={formData.certificate_grade}
                    onChange={e => setFormData({ ...formData, certificate_grade: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border border-amber-400 rounded-xl font-bold text-amber-950 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                  />
                </div>

                {/* Official Citation Text */}
                <div>
                  <label className="font-bold text-slate-800 block mb-1">Official Citation Body Text</label>
                  <textarea
                    rows={2}
                    value={formData.citation_text}
                    onChange={e => setFormData({ ...formData, citation_text: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border border-amber-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* SECTION 3: Signatories & Signature File Uploads */}
              <div className="bg-indigo-50/40 p-5 rounded-2xl border border-indigo-200/80 space-y-4">
                <div className="flex items-center space-x-2 text-indigo-950 border-b border-indigo-200 pb-2">
                  <ShieldCheck className="w-4 h-4 text-indigo-600" />
                  <h4 className="font-extrabold uppercase tracking-wider text-xs">3. Signatories & Signature Image Uploads</h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Primary Signatory Block (Mr. S.O. Manongwa) */}
                  <div className="bg-white p-4 rounded-xl border border-indigo-100 space-y-3">
                    <span className="font-extrabold text-indigo-900 block text-xs border-b border-slate-100 pb-1">
                      Primary Signatory (Lead Instructor / Founder)
                    </span>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Signatory Name</label>
                      <input
                        type="text"
                        value={formData.founder_name}
                        onChange={e => setFormData({ ...formData, founder_name: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Signatory Title</label>
                      <input
                        type="text"
                        value={formData.founder_title}
                        onChange={e => setFormData({ ...formData, founder_title: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-[11px]"
                      />
                    </div>

                    {/* Signature File Upload */}
                    <div>
                      <label className="font-bold text-slate-700 block mb-1 flex items-center justify-between">
                        <span>Upload Signature Image</span>
                        <span className="text-[10px] font-normal text-slate-400">PNG / JPG / SVG</span>
                      </label>
                      
                      <div className="flex items-center space-x-3">
                        <input
                          type="file"
                          ref={founderSigFileRef}
                          accept="image/*"
                          onChange={e => handleSignatureUpload(e, 'founder_signature')}
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => founderSigFileRef.current?.click()}
                          className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center space-x-1.5 shadow-sm"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>Select Signature File</span>
                        </button>
                        {formData.founder_signature && (
                          <div className="w-16 h-8 border border-slate-200 rounded bg-slate-50 p-1 overflow-hidden">
                            <img src={formData.founder_signature} alt="Sig" className="w-full h-full object-contain" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Secondary Signatory Block (Ms. A.M. Chiambiro) */}
                  <div className="bg-white p-4 rounded-xl border border-indigo-100 space-y-3">
                    <span className="font-extrabold text-indigo-900 block text-xs border-b border-slate-100 pb-1">
                      Secondary Signatory (Regional President)
                    </span>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Signatory Name</label>
                      <input
                        type="text"
                        value={formData.regional_president_name}
                        onChange={e => setFormData({ ...formData, regional_president_name: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Signatory Title</label>
                      <input
                        type="text"
                        value={formData.regional_president_title}
                        onChange={e => setFormData({ ...formData, regional_president_title: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-[11px]"
                      />
                    </div>

                    {/* Signature File Upload */}
                    <div>
                      <label className="font-bold text-slate-700 block mb-1 flex items-center justify-between">
                        <span>Upload Signature Image</span>
                        <span className="text-[10px] font-normal text-slate-400">PNG / JPG / SVG</span>
                      </label>
                      
                      <div className="flex items-center space-x-3">
                        <input
                          type="file"
                          ref={presidentSigFileRef}
                          accept="image/*"
                          onChange={e => handleSignatureUpload(e, 'regional_president_signature')}
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => presidentSigFileRef.current?.click()}
                          className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center space-x-1.5 shadow-sm"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>Select Signature File</span>
                        </button>
                        {formData.regional_president_signature && (
                          <div className="w-16 h-8 border border-slate-200 rounded bg-slate-50 p-1 overflow-hidden">
                            <img src={formData.regional_president_signature} alt="Sig" className="w-full h-full object-contain" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Gold Seal Image Upload */}
                <div className="bg-white p-4 rounded-xl border border-indigo-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <span className="font-extrabold text-slate-900 block text-xs">Certified Gold & Blue Foil Seal Graphic</span>
                    <span className="text-[11px] text-slate-500">Upload official accreditation seal or organizational stamp.</span>
                  </div>

                  <div className="flex items-center space-x-3">
                    <input
                      type="file"
                      ref={sealFileRef}
                      accept="image/*"
                      onChange={e => handleSignatureUpload(e, 'seal_url')}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => sealFileRef.current?.click()}
                      className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl text-xs flex items-center space-x-1.5 shadow-sm"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Seal Image</span>
                    </button>
                    {formData.seal_url && (
                      <div className="w-10 h-10 border border-amber-300 rounded-full bg-amber-50 p-1 overflow-hidden shrink-0">
                        <img src={formData.seal_url} alt="Seal" className="w-full h-full object-contain" />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* SECTION 4: Unlocked / Locked Access Toggle Switch */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 block text-xs">Certificate Lock & Unlock State</span>
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
                <span>Certificate changes successfully saved!</span>
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
