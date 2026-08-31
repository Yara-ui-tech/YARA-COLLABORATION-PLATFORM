import React, { useState } from 'react';
import { 
  Building2, School, Users, Cpu, MapPin, Sparkles, X, Plus, 
  Trash2, CheckCircle2, AlertCircle, Shield, Image, BookOpen, 
  HelpCircle, ChevronRight, FileText, Phone, Mail, Award, Landmark
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChapterCategory, ChapterRegistrationRequest, ChapterMember, 
  ChapterLeaderRole 
} from '../../types/chapters';
import { 
  submitChapterRegistrationRequest, 
  PROVINCIAL_LEAD_UNIVERSITIES 
} from '../../services/chaptersService';
import { cn } from '../../lib/utils';

interface ChapterRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newReq: ChapterRegistrationRequest) => void;
}

export default function ChapterRegistrationModal({
  isOpen,
  onClose,
  onSuccess
}: ChapterRegistrationModalProps) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    proposed_name: 'YARA ',
    category: 'high_school' as ChapterCategory,
    institution_or_community: '',
    province: 'Mashonaland West',
    district_or_city: '',
    physical_location: '',
    logo_url: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=200&q=80',
    banner_url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80',
    description: '',
    meeting_schedule: 'Every Wednesday & Friday 2:30 PM - 4:30 PM',
    lab_equipment: 'Arduino Starter Kits, Raspberry Pi 4, Soldering Station, Basic 3D Printer',
    focus_areas_str: 'Robotics, IoT, Embedded Systems, STEM Education',
    public_email: '',
    public_phone: '',
    patron_name: '',
    patron_email: '',
    patron_phone: '',
    patron_title: 'Senior Science & ICT Department Head'
  });

  // Leadership State
  const [leaders, setLeaders] = useState<Array<{
    name: string;
    role: ChapterLeaderRole;
    email: string;
    phone: string;
    department_or_grade: string;
  }>>([
    { name: '', role: 'chairperson', email: '', phone: '', department_or_grade: 'Upper Sixth / Final Year' },
    { name: '', role: 'vice_chair', email: '', phone: '', department_or_grade: 'Lower Sixth / Year 3' },
    { name: '', role: 'secretary', email: '', phone: '', department_or_grade: 'Lower Sixth / Year 2' },
    { name: '', role: 'treasurer', email: '', phone: '', department_or_grade: 'Upper Sixth / Year 3' },
    { name: '', role: 'tech_lead', email: '', phone: '', department_or_grade: 'Robotics Marshal / Lead Coder' }
  ]);

  // Members Roster State
  const [members, setMembers] = useState<Array<{
    name: string;
    email?: string;
    phone?: string;
    role?: string;
    student_id?: string;
  }>>([
    { name: '', email: '', phone: '', role: 'Hardware Builder', student_id: '' },
    { name: '', email: '', phone: '', role: 'MicroPython Programmer', student_id: '' },
    { name: '', email: '', phone: '', role: 'CAD / 3D Design', student_id: '' }
  ]);

  const [bulkMemberText, setBulkMemberText] = useState('');
  const [bulkMode, setBulkMode] = useState(false);

  const provinces = [
    'Mashonaland West', 'Harare', 'Bulawayo', 'Midlands', 'Manicaland', 
    'Masvingo', 'Mashonaland Central', 'Mashonaland East', 
    'Matabeleland North', 'Matabeleland South'
  ];

  const currentProvincialLead = PROVINCIAL_LEAD_UNIVERSITIES[formData.province];

  const handleLeaderChange = (index: number, field: string, value: string) => {
    const updated = [...leaders];
    (updated[index] as any)[field] = value;
    setLeaders(updated);
  };

  const handleAddMember = () => {
    setMembers([...members, { name: '', email: '', phone: '', role: 'Member', student_id: '' }]);
  };

  const handleRemoveMember = (idx: number) => {
    setMembers(members.filter((_, i) => i !== idx));
  };

  const handleMemberChange = (index: number, field: string, value: string) => {
    const updated = [...members];
    (updated[index] as any)[field] = value;
    setMembers(updated);
  };

  const handleImportBulkMembers = () => {
    if (!bulkMemberText.trim()) return;
    const lines = bulkMemberText.split('\n');
    const newItems: typeof members = [];

    lines.forEach(line => {
      const parts = line.split(',').map(s => s.trim());
      if (parts[0]) {
        newItems.push({
          name: parts[0],
          email: parts[1] || '',
          phone: parts[2] || '',
          role: parts[3] || 'Member',
          student_id: parts[4] || ''
        });
      }
    });

    if (newItems.length > 0) {
      setMembers([...members.filter(m => m.name.trim().length > 0), ...newItems]);
      setBulkMemberText('');
      setBulkMode(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      // Validate Chapter Name format
      let formattedName = formData.proposed_name.trim();
      if (!formattedName.toUpperCase().includes('YARA')) {
        formattedName = `YARA ${formattedName}`;
      }

      if (!formData.institution_or_community.trim()) {
        throw new Error('Please enter the Institution, School, or Community Center name.');
      }

      if (!formData.district_or_city.trim()) {
        throw new Error('Please specify the District or City.');
      }

      // Filter valid leaders
      const validLeaders = leaders
        .filter(l => l.name.trim().length > 0)
        .map((l, i) => ({
          id: `lead-reg-${i}-${Date.now().toString(36)}`,
          name: l.name.trim(),
          role: l.role,
          email: l.email.trim().toLowerCase(),
          phone: l.phone.trim(),
          department_or_grade: l.department_or_grade.trim(),
          is_public_contact: l.role === 'secretary' || l.role === 'chairperson',
          is_approved_by_admin: false,
          can_submit_general_reports: l.role === 'secretary' || l.role === 'chairperson',
          can_submit_financial_reports: l.role === 'treasurer' || l.role === 'chairperson'
        }));

      if (validLeaders.length === 0) {
        throw new Error('Please enter at least the Chairperson or Secretary in the leadership roster.');
      }

      // Filter valid members
      const validMembers: ChapterMember[] = members
        .filter(m => m.name.trim().length > 0)
        .map((m, i) => ({
          id: `mem-reg-${i}-${Date.now().toString(36)}`,
          name: m.name.trim(),
          email: m.email?.trim().toLowerCase(),
          phone: m.phone?.trim(),
          role: m.role?.trim() || 'Member',
          student_or_staff_id: m.student_id?.trim(),
          status: 'active',
          joined_date: new Date().toISOString().split('T')[0]
        }));

      const totalMemberCount = Math.max(validMembers.length + validLeaders.length, validMembers.length);

      const focusAreas = formData.focus_areas_str
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);

      const patronAdvisor = formData.patron_name.trim() ? {
        name: formData.patron_name.trim(),
        title: formData.patron_title.trim() || 'Faculty Advisor',
        organization: formData.institution_or_community.trim() || 'Institution',
        email: formData.patron_email.trim().toLowerCase(),
        phone: formData.patron_phone.trim()
      } : undefined;

      const newRequest = await submitChapterRegistrationRequest({
        proposed_name: formattedName,
        category: formData.category,
        institution_or_community: formData.institution_or_community.trim(),
        province: formData.province,
        district_or_city: formData.district_or_city.trim(),
        physical_location: formData.physical_location.trim(),
        logo_url: formData.logo_url.trim(),
        banner_url: formData.banner_url.trim(),
        description: formData.description.trim() || `Official YARA Robotics chapter chartered at ${formData.institution_or_community}. Dedicated to hands-on STEM innovation, competitions, and community outreach.`,
        leaders: validLeaders,
        members: validMembers,
        total_members_count: totalMemberCount,
        patron_advisor: patronAdvisor,
        meeting_schedule: formData.meeting_schedule.trim(),
        available_equipment: formData.lab_equipment.trim(),
        focus_areas: focusAreas,
        public_email: formData.public_email.trim() || validLeaders[0]?.email,
        public_phone: formData.public_phone.trim() || validLeaders[0]?.phone,
        submitted_by_name: validLeaders[0]?.name || 'Chapter Lead',
        submitted_by_email: validLeaders[0]?.email || 'lead@yara.org',
        submitted_by_phone: validLeaders[0]?.phone || '',
        assigned_provincial_university_name: formData.category === 'university'
          ? `${formData.institution_or_community} (Provincial University Lead)`
          : (currentProvincialLead ? currentProvincialLead.defaultChapterName : 'Designated Provincial University')
      });

      setSuccessMsg(`✓ Application for "${formattedName}" submitted successfully to the YARA National Executive Secretariat! An administrator will assess and charter your chapter.`);
      
      setTimeout(() => {
        onSuccess(newRequest);
        onClose();
      }, 2500);

    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit chapter registration.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 md:p-6 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white rounded-[2.5rem] max-w-4xl w-full shadow-2xl overflow-hidden my-6 border border-slate-100 flex flex-col max-h-[92vh]"
      >
        {/* Header Hero */}
        <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 text-white p-6 md:p-8 relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="max-w-2xl space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-amber-400/20 text-amber-300 border border-amber-400/30 rounded-full text-xs font-black uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Chapter Charter Application</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight">
              Register a New YARA Robotics Chapter
            </h2>
            <p className="text-slate-300 text-xs md:text-sm">
              Establish an official robotics chapter at your university, high school, primary school, or community hub. All smaller chapters in a province are guided & mentored by the designated Provincial University.
            </p>
          </div>

          {/* Stepper Tabs */}
          <div className="grid grid-cols-4 gap-2 mt-6 pt-4 border-t border-white/10">
            {[
              { num: 1, title: 'Chapter Info', desc: 'Name, Category & Province' },
              { num: 2, title: 'Leadership', desc: 'Executive Committee' },
              { num: 3, title: 'Members Roster', desc: 'Names & Contacts' },
              { num: 4, title: 'Facilities & Review', desc: 'Labs & Submit' }
            ].map(s => (
              <button
                key={s.num}
                type="button"
                onClick={() => setStep(s.num as any)}
                className={cn(
                  "text-left p-2.5 rounded-xl transition-all border",
                  step === s.num
                    ? "bg-white/20 border-white/40 text-white shadow-xs"
                    : "bg-white/5 border-transparent text-slate-400 hover:text-white"
                )}
              >
                <div className="flex items-center space-x-2">
                  <span className={cn(
                    "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black",
                    step === s.num ? "bg-amber-400 text-slate-950" : "bg-white/10 text-slate-300"
                  )}>
                    {s.num}
                  </span>
                  <span className="text-xs font-bold truncate">{s.title}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6 md:p-8 overflow-y-auto space-y-6 flex-1">
          {errorMsg && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start space-x-3 text-red-700 text-xs font-semibold">
              <AlertCircle className="w-5 h-5 shrink-0 text-red-600 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start space-x-3 text-emerald-800 text-xs font-semibold">
              <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* STEP 1: CHAPTER BASICS */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Proposed Name */}
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center justify-between">
                    <span>Proposed Chapter Name (Must include YARA) *</span>
                    <span className="text-[11px] text-indigo-600 font-normal">e.g. YARA Lomagundi College Chapter</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.proposed_name}
                    onChange={e => setFormData({ ...formData, proposed_name: e.target.value })}
                    placeholder="YARA [Institution / Community] Chapter"
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600 text-sm font-semibold text-slate-900"
                  />
                </div>

                {/* Chapter Category */}
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-700 uppercase tracking-wider">
                    Chapter Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value as ChapterCategory })}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600 text-sm font-semibold text-slate-900 bg-white"
                  >
                    <option value="high_school">High School Chapter (Form 1 - 6)</option>
                    <option value="university">University / Tertiary Chapter (CUT, UZ, NUST...)</option>
                    <option value="primary_school">Primary / Junior Robotics Club (Grade 3 - 7)</option>
                    <option value="community_youth">Community Youth Hub / Makerspace</option>
                    <option value="polytechnic">Polytechnic / Technical Vocational College</option>
                  </select>
                </div>

                {/* Institution / Community Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-700 uppercase tracking-wider">
                    Host Institution / School / Center Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.institution_or_community}
                    onChange={e => setFormData({ ...formData, institution_or_community: e.target.value })}
                    placeholder="e.g. Lomagundi College, Chinhoyi High, CUT"
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600 text-sm font-semibold text-slate-900"
                  />
                </div>

                {/* Province */}
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-700 uppercase tracking-wider">
                    Province *
                  </label>
                  <select
                    value={formData.province}
                    onChange={e => setFormData({ ...formData, province: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600 text-sm font-semibold text-slate-900 bg-white"
                  >
                    {provinces.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>

                {/* District / City */}
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-700 uppercase tracking-wider">
                    District or City *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.district_or_city}
                    onChange={e => setFormData({ ...formData, district_or_city: e.target.value })}
                    placeholder="e.g. Chinhoyi, Harare Central, Bulawayo East"
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600 text-sm font-semibold text-slate-900"
                  />
                </div>
              </div>

              {/* Provincial Lead Hierarchy Banner */}
              <div className="p-5 bg-gradient-to-r from-amber-50 to-indigo-50 rounded-2xl border border-amber-200/80 flex items-start space-x-3">
                <Landmark className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-1 text-xs">
                  <h4 className="font-black text-slate-900">
                    Provincial Robotics Mentorship Hierarchy
                  </h4>
                  <p className="text-slate-600 leading-relaxed font-medium">
                    {formData.category === 'university' ? (
                      <span>
                        As a university chapter in <strong>{formData.province}</strong>, this chapter will serve as the <strong>Designated Provincial Lead Institution</strong> heading, supporting, and mentoring all high school and community clubs in the province.
                      </span>
                    ) : (
                      <span>
                        In <strong>{formData.province}</strong>, all high schools, primary schools, and community clubs are led, supported, and mentored by the designated Provincial University Lead: <strong className="text-indigo-700">{currentProvincialLead?.universityName || 'Provincial University'}</strong>.
                      </span>
                    )}
                  </p>
                </div>
              </div>

              {/* Logo and Banner URLs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-700 uppercase tracking-wider">
                    Chapter Logo URL
                  </label>
                  <input
                    type="url"
                    value={formData.logo_url}
                    onChange={e => setFormData({ ...formData, logo_url: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-700 uppercase tracking-wider">
                    Chapter Banner Image URL
                  </label>
                  <input
                    type="url"
                    value={formData.banner_url}
                    onChange={e => setFormData({ ...formData, banner_url: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: LEADERSHIP ROSTER */}
          {step === 2 && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-slate-900">Executive Committee Leadership</h3>
                  <p className="text-xs text-slate-500">Provide the names, emails, and contacts for key chapter officers.</p>
                </div>
                <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-bold">
                  {leaders.filter(l => l.name.trim()).length} of {leaders.length} Leaders Listed
                </span>
              </div>

              <div className="space-y-4">
                {leaders.map((leader, idx) => (
                  <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-1 rounded-lg text-[11px] font-black uppercase tracking-wider bg-indigo-600 text-white">
                        {leader.role.replace('_', ' ')}
                      </span>
                      <span className="text-[11px] text-slate-400 font-semibold">Executive Officer {idx + 1}</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Full Name *</label>
                        <input
                          type="text"
                          value={leader.name}
                          onChange={e => handleLeaderChange(idx, 'name', e.target.value)}
                          placeholder="e.g. Kudzai Moyo"
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 bg-white"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Email Address</label>
                        <input
                          type="email"
                          value={leader.email}
                          onChange={e => handleLeaderChange(idx, 'email', e.target.value)}
                          placeholder="officer@school.ac.zw"
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 bg-white"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Phone / WhatsApp</label>
                        <input
                          type="tel"
                          value={leader.phone}
                          onChange={e => handleLeaderChange(idx, 'phone', e.target.value)}
                          placeholder="+263 77 123 4567"
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 bg-white"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Grade / Department</label>
                        <input
                          type="text"
                          value={leader.department_or_grade}
                          onChange={e => handleLeaderChange(idx, 'department_or_grade', e.target.value)}
                          placeholder="e.g. Lower 6 Science"
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 bg-white"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Faculty Patron / Advisor Section */}
              <div className="p-5 bg-indigo-50/70 rounded-2xl border border-indigo-100 space-y-3">
                <div className="flex items-center space-x-2">
                  <Award className="w-4 h-4 text-indigo-700" />
                  <h4 className="text-xs font-black text-indigo-950 uppercase tracking-wider">
                    Faculty Patron / Teacher Advisor (Recommended)
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-600 uppercase">Patron Name</label>
                    <input
                      type="text"
                      value={formData.patron_name}
                      onChange={e => setFormData({ ...formData, patron_name: e.target.value })}
                      placeholder="e.g. Mr. T. Chigwada"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 bg-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-600 uppercase">Patron Email</label>
                    <input
                      type="email"
                      value={formData.patron_email}
                      onChange={e => setFormData({ ...formData, patron_email: e.target.value })}
                      placeholder="patron@school.ac.zw"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 bg-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-600 uppercase">Patron Phone</label>
                    <input
                      type="tel"
                      value={formData.patron_phone}
                      onChange={e => setFormData({ ...formData, patron_phone: e.target.value })}
                      placeholder="+263 77..."
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 bg-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: MEMBERS ROSTER */}
          {step === 3 && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-black text-slate-900">Student & Innovator Member Roster</h3>
                  <p className="text-xs text-slate-500">
                    Add member names, emails, and phone numbers. When users sign in with matching credentials, YARA will automatically link them to this chapter.
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setBulkMode(!bulkMode)}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all"
                  >
                    {bulkMode ? 'Table View' : 'Bulk Paste (CSV)'}
                  </button>
                  <button
                    type="button"
                    onClick={handleAddMember}
                    className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center space-x-1 transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Member</span>
                  </button>
                </div>
              </div>

              {bulkMode ? (
                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                  <label className="text-xs font-bold text-slate-700 block">
                    Paste Member List (One member per line: Name, Email, Phone, Role, Student ID)
                  </label>
                  <textarea
                    rows={6}
                    value={bulkMemberText}
                    onChange={e => setBulkMemberText(e.target.value)}
                    placeholder="Tinashe Zhou, tinashe@mail.com, +26377111222, CAD Designer, STU-102&#10;Ruvimbo Moyo, ruvimbo@mail.com, +26377333444, Programmer, STU-103"
                    className="w-full p-3 rounded-xl border border-slate-200 text-xs font-mono text-slate-800 bg-white"
                  />
                  <button
                    type="button"
                    onClick={handleImportBulkMembers}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold"
                  >
                    Import Parsed Members
                  </button>
                </div>
              ) : (
                <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                  {members.map((member, idx) => (
                    <div key={idx} className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 flex flex-col md:flex-row items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 text-[11px] font-bold flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>

                      <input
                        type="text"
                        value={member.name}
                        onChange={e => handleMemberChange(idx, 'name', e.target.value)}
                        placeholder="Member Full Name *"
                        className="w-full md:w-1/4 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-900 bg-white"
                      />

                      <input
                        type="email"
                        value={member.email}
                        onChange={e => handleMemberChange(idx, 'email', e.target.value)}
                        placeholder="Email (Auto-detect)"
                        className="w-full md:w-1/4 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-800 bg-white"
                      />

                      <input
                        type="tel"
                        value={member.phone}
                        onChange={e => handleMemberChange(idx, 'phone', e.target.value)}
                        placeholder="Phone / WhatsApp"
                        className="w-full md:w-1/5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-800 bg-white"
                      />

                      <input
                        type="text"
                        value={member.role}
                        onChange={e => handleMemberChange(idx, 'role', e.target.value)}
                        placeholder="Role / Skill (e.g. Coder)"
                        className="w-full md:w-1/5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-800 bg-white"
                      />

                      <button
                        type="button"
                        onClick={() => handleRemoveMember(idx)}
                        className="p-1.5 text-slate-400 hover:text-red-600 transition-colors shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}

                  <div className="pt-2 text-center">
                    <button
                      type="button"
                      onClick={handleAddMember}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-800 inline-flex items-center space-x-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add another member to roster</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 4: FACILITIES, DETAILS & REVIEW */}
          {step === 4 && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-700 uppercase tracking-wider">
                    Meeting Schedule & Venue
                  </label>
                  <input
                    type="text"
                    value={formData.meeting_schedule}
                    onChange={e => setFormData({ ...formData, meeting_schedule: e.target.value })}
                    placeholder="e.g. Wednesdays 2:30 PM, Physics Lab"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-900"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-700 uppercase tracking-wider">
                    Physical Campus / Center Address
                  </label>
                  <input
                    type="text"
                    value={formData.physical_location}
                    onChange={e => setFormData({ ...formData, physical_location: e.target.value })}
                    placeholder="e.g. Science Block Room 14"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-900"
                  />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-black text-slate-700 uppercase tracking-wider">
                    Hardware Tools, Kits & Equipment Currently Available
                  </label>
                  <input
                    type="text"
                    value={formData.lab_equipment}
                    onChange={e => setFormData({ ...formData, lab_equipment: e.target.value })}
                    placeholder="e.g. 5 Arduino kits, 1 3D printer, 10 soldering irons"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-900"
                  />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-black text-slate-700 uppercase tracking-wider">
                    Chapter Mission & Planned Target Projects
                  </label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe what your chapter plans to build, competitions you are preparing for, and impact goals."
                    className="w-full p-3 rounded-xl border border-slate-200 text-xs font-medium text-slate-900"
                  />
                </div>
              </div>

              {/* Review Summary Box */}
              <div className="p-5 bg-slate-900 text-white rounded-2xl space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center space-x-2">
                    <Shield className="w-5 h-5 text-amber-400" />
                    <span className="font-bold text-sm">Chapter Charter Application Summary</span>
                  </div>
                  <span className="text-xs text-slate-400">Ready for National Review</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Proposed Name</span>
                    <span className="font-bold text-white truncate block">{formData.proposed_name}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Category</span>
                    <span className="font-bold text-amber-300">{formData.category.replace('_', ' ')}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Province</span>
                    <span className="font-bold text-indigo-300">{formData.province}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Total Members</span>
                    <span className="font-bold text-emerald-400">
                      {members.filter(m => m.name.trim()).length + leaders.filter(l => l.name.trim()).length} Members
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-300">
                  <span>🏛️ Assigned Provincial Lead: <strong>{currentProvincialLead?.universityName || 'Provincial Lead'}</strong></span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between shrink-0">
          <div>
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep((step - 1) as any)}
                className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all"
              >
                Previous Step
              </button>
            )}
          </div>

          <div className="flex items-center space-x-3">
            {step < 4 ? (
              <button
                type="button"
                onClick={() => setStep((step + 1) as any)}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center space-x-1.5 shadow-md shadow-indigo-600/20 transition-all"
              >
                <span>Continue</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                disabled={loading}
                onClick={handleSubmit}
                className="px-7 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center space-x-2 shadow-lg shadow-emerald-600/30 transition-all disabled:opacity-50"
              >
                {loading ? (
                  <span>Submitting Application...</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Submit Chapter Application for Approval</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
