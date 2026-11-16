import React, { useState, useEffect, useMemo } from 'react';
import {
  X, ChevronRight, ChevronLeft, MapPin, Building2, School, Users, Cpu,
  BookOpen, CheckCircle2, Clock, AlertCircle, User, Mail, Phone,
  GraduationCap, Star, FileText, Send, Globe, Layers, Heart,
  UserPlus, Landmark, Shield, Search, Plus, Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Chapter, ChapterJoinRequest, ChapterCategory } from '../../types/chapters';
import { getChapters, submitJoinRequest, createChapter, PROVINCIAL_LEAD_UNIVERSITIES } from '../../services/chaptersService';
import { useAuth } from '../AuthContext';
import { cn } from '../../lib/utils';

interface JoinChapterModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedChapterId?: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  university: 'University / Tertiary',
  high_school: 'High School',
  primary_school: 'Primary School',
  community_youth: 'Community Youth',
  polytechnic: 'Polytechnic / College',
  provincial_hub: 'Provincial Hub'
};

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  university: Building2,
  high_school: School,
  primary_school: BookOpen,
  community_youth: Users,
  polytechnic: Cpu,
  provincial_hub: Landmark
};

const SKILL_OPTIONS = [
  'Arduino / Electronics', 'Python', 'C / C++', 'MicroPython', 'Raspberry Pi',
  'CAD / SolidWorks', '3D Printing', 'Soldering', 'Robotics Hardware',
  'IoT / Sensors', 'Artificial Intelligence', 'Web Development',
  'Project Management', 'Technical Writing', 'Public Speaking', 'Photography / Video'
];

export default function JoinChapterModal({ isOpen, onClose, preselectedChapterId }: JoinChapterModalProps) {
  const { profile, user } = useAuth();
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [publicConsent, setPublicConsent] = useState(true);
  const [error, setError] = useState('');

  // Step 1 — Province
  const [selectedProvince, setSelectedProvince] = useState('');
  // Step 2 — Chapter
  const [selectedChapterId, setSelectedChapterId] = useState(preselectedChapterId || '');
  // Step 2 — Search & Custom Section Creation (User requirement: leave room to add school, university, community)
  const [chapterSearch, setChapterSearch] = useState('');
  const [isAddingSection, setIsAddingSection] = useState(false);
  const [newSectionName, setNewSectionName] = useState('');
  const [newSectionCategory, setNewSectionCategory] = useState<ChapterCategory>('high_school');
  const [newSectionDistrict, setNewSectionDistrict] = useState('');
  const [newSectionDescription, setNewSectionDescription] = useState('');
  const [isCreatingSection, setIsCreatingSection] = useState(false);

  // Step 3 — Application form
  const [form, setForm] = useState({
    full_name: profile?.display_name || '',
    email: profile?.email || '',
    phone: profile?.phone_number || '',
    institution: '',
    grade_or_year: '',
    role_applying_for: 'Member',
    motivation: '',
    student_id: '',
    id_document_url: '',
    skills: [] as string[]
  });

  const provinces = Object.keys(PROVINCIAL_LEAD_UNIVERSITIES);

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    getChapters(false).then(data => {
      setChapters(data.filter(c => c.status !== 'archived'));
      setLoading(false);
      if (preselectedChapterId) {
        const ch = data.find(c => c.id === preselectedChapterId);
        if (ch) {
          setSelectedProvince(ch.province);
          setSelectedChapterId(ch.id);
          setStep(3);
        }
      }
    });
  }, [isOpen, preselectedChapterId]);

  useEffect(() => {
    setForm(f => ({
      ...f,
      full_name: profile?.display_name || f.full_name,
      email: profile?.email || f.email,
      phone: (profile as any)?.phone_number || f.phone
    }));
  }, [profile]);

  const chaptersByProvince = useMemo(() => {
    if (!selectedProvince) return [];
    let list = chapters.filter(c => 
      c.province.toLowerCase() === selectedProvince.toLowerCase() || 
      c.province.includes(selectedProvince)
    );
    if (chapterSearch.trim()) {
      const q = chapterSearch.toLowerCase();
      list = list.filter(c => 
        c.name.toLowerCase().includes(q) || 
        c.institution_or_community.toLowerCase().includes(q) ||
        (c.code && c.code.toLowerCase().includes(q))
      );
    }
    return list;
  }, [chapters, selectedProvince, chapterSearch]);

  const handleCreateNewSection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSectionName.trim()) {
      setError('Please enter your school, university, or community hub name.');
      return;
    }
    setError('');
    setIsCreatingSection(true);
    try {
      const provinceAbbr = (selectedProvince || 'ZW').replace(/[^a-zA-Z]/g, '').substring(0, 3).toUpperCase();
      const instAbbr = newSectionName.replace(/[^a-zA-Z]/g, '').substring(0, 3).toUpperCase();
      const code = `YARA-${provinceAbbr}-${instAbbr}-${Math.floor(10 + Math.random() * 90)}`;

      const newChap = await createChapter({
        name: `YARA ${newSectionName.trim()} Chapter`,
        code,
        category: newSectionCategory,
        institution_or_community: newSectionName.trim(),
        province: selectedProvince || 'Harare',
        district_or_city: newSectionDistrict.trim() || `${selectedProvince || 'Harare'} District`,
        description: newSectionDescription.trim() || `Official YARA robotics innovation section for ${newSectionName.trim()}.`,
        established_date: new Date().toISOString().split('T')[0],
        status: 'active',
        approval_status: 'approved',
        focus_areas: ['Robotics Hardware', 'STEM Education', 'Community Tech'],
        total_members_count: 0,
        active_projects_count: 0,
        leaders: [],
        members: [],
        clubs: [],
        projects: [],
        activities: []
      });

      setChapters(prev => [newChap, ...prev]);
      setSelectedChapterId(newChap.id);
      setForm(f => ({ ...f, institution: newChap.institution_or_community }));
      setIsAddingSection(false);
      setStep(3);
    } catch (err: any) {
      setError(err.message || 'Failed to create section. Please try again.');
    } finally {
      setIsCreatingSection(false);
    }
  };

  const selectedChapter = useMemo(() =>
    chapters.find(c => c.id === selectedChapterId) || null
  , [chapters, selectedChapterId]);

  const allProvinces = useMemo(() => {
    const fromChapters = [...new Set(chapters.map(c => c.province))].sort();
    return fromChapters;
  }, [chapters]);

  const toggleSkill = (skill: string) => {
    setForm(f => ({
      ...f,
      skills: f.skills.includes(skill)
        ? f.skills.filter(s => s !== skill)
        : [...f.skills, skill]
    }));
  };

  const handleSubmit = async () => {
    if (!selectedChapter) return;
    if (!form.full_name.trim() || !form.email.trim() || !form.phone.trim()) {
      setError('Please fill in your full name, email, and phone number.');
      return;
    }
    if (!form.institution.trim()) {
      setError('Please enter your institution or community name.');
      return;
    }
    if (!form.motivation.trim() || form.motivation.trim().length < 30) {
      setError('Please write a motivation statement of at least 30 characters.');
      return;
    }
    if (!publicConsent) {
      setError('You must agree to public member roster visibility consent to join this chapter.');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      await submitJoinRequest({
        chapter_id: selectedChapter.id,
        chapter_name: selectedChapter.name,
        chapter_code: selectedChapter.code,
        province: selectedChapter.province,
        chapter_category: selectedChapter.category,
        full_name: form.full_name.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
        institution: form.institution.trim(),
        grade_or_year: form.grade_or_year.trim(),
        role_applying_for: form.role_applying_for,
        motivation: form.motivation.trim(),
        student_id: form.student_id || undefined,
        id_document_url: form.id_document_url || undefined,
        public_consent: publicConsent,
        skills: form.skills,
        user_id: user?.id
      });
      setStep(4);
    } catch (e: any) {
      setError(e.message || 'Failed to submit application. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setSelectedProvince('');
    setSelectedChapterId('');
    setForm({
      full_name: profile?.display_name || '',
      email: profile?.email || '',
      phone: (profile as any)?.phone_number || '',
      institution: '',
      grade_or_year: '',
      role_applying_for: 'Member',
      motivation: '',
      student_id: '',
      id_document_url: '',
      skills: []
    });
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  const stepTitles = [
    'Choose Province',
    'Select Chapter',
    'Your Application',
    'Submitted!'
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={e => { if (e.target === e.currentTarget) handleClose(); }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', duration: 0.4 }}
            className="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="relative bg-gradient-to-r from-indigo-950 via-indigo-900 to-slate-900 text-white p-6 shrink-0">
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 p-2 rounded-xl bg-white/10 hover:bg-white/20 transition"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-2xl bg-amber-400 flex items-center justify-center">
                  <UserPlus className="w-5 h-5 text-slate-950" />
                </div>
                <div>
                  <h2 className="font-black text-lg">Join a YARA Chapter</h2>
                  <p className="text-indigo-300 text-xs">Step {step} of 4 — {stepTitles[step - 1]}</p>
                </div>
              </div>

              {/* Progress bar */}
              <div className="flex gap-1.5">
                {[1, 2, 3, 4].map(s => (
                  <div
                    key={s}
                    className={cn(
                      'h-1.5 rounded-full flex-1 transition-all duration-300',
                      s <= step ? 'bg-amber-400' : 'bg-white/20'
                    )}
                  />
                ))}
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6">
              <AnimatePresence mode="wait">

                {/* STEP 1: Province Selection */}
                {step === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    <div>
                      <h3 className="font-black text-slate-900 text-base">Choose Your Province</h3>
                      <p className="text-xs text-slate-500 mt-1">
                        YARA is organized by province. Each province has a lead university and multiple sub-chapters.
                      </p>
                    </div>

                    {loading ? (
                      <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-600 border-t-transparent" />
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {allProvinces.map(province => {
                          const lead = PROVINCIAL_LEAD_UNIVERSITIES[province];
                          const provinceChapters = chapters.filter(c => c.province === province);
                          return (
                            <button
                              key={province}
                              onClick={() => {
                                setSelectedProvince(province);
                                setSelectedChapterId('');
                              }}
                              className={cn(
                                'text-left p-4 rounded-2xl border-2 transition-all',
                                selectedProvince === province
                                  ? 'border-indigo-600 bg-indigo-50'
                                  : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
                              )}
                            >
                              <div className="flex items-start gap-3">
                                <div className={cn(
                                  'w-9 h-9 rounded-xl flex items-center justify-center shrink-0',
                                  selectedProvince === province ? 'bg-indigo-600' : 'bg-slate-100'
                                )}>
                                  <MapPin className={cn('w-4 h-4', selectedProvince === province ? 'text-white' : 'text-slate-500')} />
                                </div>
                                <div>
                                  <span className="font-black text-slate-900 text-sm block">{province}</span>
                                  <span className="text-[11px] text-slate-500 block mt-0.5">
                                    {provinceChapters.length} chapter{provinceChapters.length !== 1 ? 's' : ''}
                                  </span>
                                  {lead && (
                                    <span className="text-[10px] text-indigo-600 font-bold block mt-0.5 truncate">
                                      Lead: {lead.universityName}
                                    </span>
                                  )}
                                </div>
                                {selectedProvince === province && (
                                  <CheckCircle2 className="w-4 h-4 text-indigo-600 ml-auto shrink-0" />
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </motion.div>
                )}

                {/* STEP 2: Chapter Selection */}
                {step === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    <div>
                      <h3 className="font-black text-slate-900 text-base">
                        Choose a Chapter in {selectedProvince}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1">
                        Select the community, school, or university chapter you'd like to join.
                      </p>
                    </div>

                    {/* Search and Section Creator Bar */}
                    <div className="flex flex-col sm:flex-row gap-2">
                      <div className="relative flex-1">
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          placeholder="Search university, school, or community..."
                          value={chapterSearch}
                          onChange={e => setChapterSearch(e.target.value)}
                          className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-200 bg-white text-black font-medium text-xs focus:outline-none focus:ring-2 focus:ring-indigo-600"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsAddingSection(!isAddingSection)}
                        className="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs flex items-center justify-center space-x-1.5 transition-all shrink-0"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>{isAddingSection ? 'Close Form' : '+ Add Your Section'}</span>
                      </button>
                    </div>

                    {/* Inline Form to add a new University, School, or Community Section */}
                    {isAddingSection && (
                      <div className="p-4 bg-gradient-to-r from-amber-50 via-indigo-50 to-amber-50 rounded-2xl border-2 border-amber-300 space-y-3">
                        <div className="flex items-center space-x-2 text-amber-900 font-bold text-xs">
                          <Sparkles className="w-4 h-4 text-amber-600" />
                          <span>Register Your Institution or Community Section</span>
                        </div>
                        <p className="text-[11px] text-slate-600 leading-relaxed">
                          Enter your school, university, or community hub name. It will be immediately registered in {selectedProvince} so that you and all other members from your institution can join this section!
                        </p>

                        <div className="space-y-3 pt-1">
                          <div>
                            <label className="text-[11px] font-bold text-slate-700 block mb-1">
                              School / University / Community Hub Name *
                            </label>
                            <input
                              type="text"
                              placeholder="e.g. St. George's College, or Mabvuku Tech Hub"
                              value={newSectionName}
                              onChange={e => setNewSectionName(e.target.value)}
                              className="w-full px-3 py-1.5 rounded-xl border border-slate-300 bg-white text-black text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-600"
                            />
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="text-[11px] font-bold text-slate-700 block mb-1">Category *</label>
                              <select
                                value={newSectionCategory}
                                onChange={e => setNewSectionCategory(e.target.value as ChapterCategory)}
                                className="w-full px-3 py-1.5 rounded-xl border border-slate-300 bg-white text-black text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-600"
                              >
                                <option value="university">University / Higher Ed</option>
                                <option value="polytechnic">Polytechnic / College</option>
                                <option value="high_school">High School</option>
                                <option value="primary_school">Primary School</option>
                                <option value="community_youth">Community Youth Hub</option>
                                <option value="stem_club">Makerspace / Independent Club</option>
                              </select>
                            </div>

                            <div>
                              <label className="text-[11px] font-bold text-slate-700 block mb-1">District or City</label>
                              <input
                                type="text"
                                placeholder={`e.g. ${selectedProvince} Urban`}
                                value={newSectionDistrict}
                                onChange={e => setNewSectionDistrict(e.target.value)}
                                className="w-full px-3 py-1.5 rounded-xl border border-slate-300 bg-white text-black text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-600"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="text-[11px] font-bold text-slate-700 block mb-1">Brief Description (Optional)</label>
                            <input
                              type="text"
                              placeholder="e.g. High school student robotics lab and electronics team"
                              value={newSectionDescription}
                              onChange={e => setNewSectionDescription(e.target.value)}
                              className="w-full px-3 py-1.5 rounded-xl border border-slate-300 bg-white text-black text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-600"
                            />
                          </div>

                          <div className="flex justify-end gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => setIsAddingSection(false)}
                              className="px-3 py-1.5 rounded-xl bg-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-300 transition-colors"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={handleCreateNewSection}
                              disabled={isCreatingSection}
                              className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-200 transition-all disabled:opacity-50 flex items-center space-x-1.5"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>{isCreatingSection ? 'Registering...' : 'Save & Select Section'}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {chaptersByProvince.length === 0 ? (
                      <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200 p-6 space-y-3">
                        <p className="text-slate-600 text-sm font-medium">
                          No chapters matched your search in {selectedProvince}.
                        </p>
                        <button
                          type="button"
                          onClick={() => setIsAddingSection(true)}
                          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs inline-flex items-center space-x-1.5"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Your School or Community Section Now</span>
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {/* Group by category */}
                        {(['university', 'polytechnic', 'high_school', 'primary_school', 'community_youth'] as const).map(cat => {
                          const inCat = chaptersByProvince.filter(c => c.category === cat);
                          if (inCat.length === 0) return null;
                          const Icon = CATEGORY_ICONS[cat] || Building2;
                          return (
                            <div key={cat}>
                              <div className="flex items-center gap-2 mb-2">
                                <Icon className="w-3.5 h-3.5 text-slate-400" />
                                <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider">
                                  {CATEGORY_LABELS[cat]}
                                </span>
                              </div>
                              <div className="space-y-2">
                                {inCat.map(ch => (
                                  <button
                                    key={ch.id}
                                    onClick={() => setSelectedChapterId(ch.id)}
                                    className={cn(
                                      'w-full text-left p-4 rounded-2xl border-2 transition-all',
                                      selectedChapterId === ch.id
                                        ? 'border-indigo-600 bg-indigo-50'
                                        : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
                                    )}
                                  >
                                    <div className="flex items-center gap-3">
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                          <span className="font-bold text-slate-900 text-sm">{ch.name}</span>
                                          {ch.is_provincial_lead_university && (
                                            <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-black">
                                              Provincial Lead
                                            </span>
                                          )}
                                        </div>
                                        <span className="text-[11px] text-slate-500 block truncate">{ch.institution_or_community}</span>
                                        <div className="flex items-center gap-3 mt-1">
                                          <span className="text-[10px] text-slate-400 flex items-center gap-1">
                                            <Users className="w-3 h-3" />
                                            {ch.total_members_count} members
                                          </span>
                                          {ch.motto && (
                                            <span className="text-[10px] text-indigo-500 italic truncate">
                                              "{ch.motto}"
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                      {selectedChapterId === ch.id && (
                                        <CheckCircle2 className="w-5 h-5 text-indigo-600 shrink-0" />
                                      )}
                                    </div>
                                  </button>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </motion.div>
                )}

                {/* STEP 3: Application Form */}
                {step === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-5"
                  >
                    {/* Selected chapter summary */}
                    {selectedChapter && (
                      <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shrink-0">
                          <Building2 className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-black text-indigo-900 text-sm">{selectedChapter.name}</p>
                          <p className="text-[11px] text-indigo-600">{selectedChapter.province} • {CATEGORY_LABELS[selectedChapter.category]}</p>
                          {selectedChapter.motto && (
                            <p className="text-[11px] text-indigo-400 italic mt-0.5">"{selectedChapter.motto}"</p>
                          )}
                        </div>
                      </div>
                    )}

                    <div>
                      <h3 className="font-black text-slate-900 text-base mb-1">Your Membership Application</h3>
                      <p className="text-xs text-slate-500">All fields marked * are required. Your application will be reviewed by the chapter leadership.</p>
                    </div>

                    {/* Personal Info */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">Full Name *</label>
                        <div className="relative">
                          <User className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                          <input
                            type="text"
                            value={form.full_name}
                            onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
                            placeholder="Your full name"
                            className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">Email Address *</label>
                        <div className="relative">
                          <Mail className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                          <input
                            type="email"
                            value={form.email}
                            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                            placeholder="your@email.com"
                            className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">Phone Number *</label>
                        <div className="relative">
                          <Phone className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                          <input
                            type="tel"
                            value={form.phone}
                            onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                            placeholder="+263 77 123 4567"
                            className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">Institution / Community *</label>
                        <div className="relative">
                          <School className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                          <input
                            type="text"
                            value={form.institution}
                            onChange={e => setForm(f => ({ ...f, institution: e.target.value }))}
                            placeholder="Your school / university / community"
                            className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">Grade / Year / Class</label>
                        <div className="relative">
                          <GraduationCap className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                          <input
                            type="text"
                            value={form.grade_or_year}
                            onChange={e => setForm(f => ({ ...f, grade_or_year: e.target.value }))}
                            placeholder="e.g. Form 4, Year 2, N/A"
                            className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">Student / Member ID</label>
                        <div className="relative">
                          <FileText className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                          <input
                            type="text"
                            value={form.student_id}
                            onChange={e => setForm(f => ({ ...f, student_id: e.target.value }))}
                            placeholder="Optional student number"
                            className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Role applying for */}
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-2">Role Applying For *</label>
                      <div className="flex flex-wrap gap-2">
                        {['Member', 'Cadet', 'Hardware Builder', 'Programmer', 'CAD Designer', 'Media & PR', 'Finance Assistant', 'Other'].map(role => (
                          <button
                            key={role}
                            type="button"
                            onClick={() => setForm(f => ({ ...f, role_applying_for: role }))}
                            className={cn(
                              'px-3 py-1.5 rounded-xl text-xs font-bold transition-all border',
                              form.role_applying_for === role
                                ? 'bg-indigo-600 text-white border-indigo-600'
                                : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'
                            )}
                          >
                            {role}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Skills */}
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-2">Your Skills & Interests (select all that apply)</label>
                      <div className="flex flex-wrap gap-2">
                        {SKILL_OPTIONS.map(skill => (
                          <button
                            key={skill}
                            type="button"
                            onClick={() => toggleSkill(skill)}
                            className={cn(
                              'px-3 py-1.5 rounded-xl text-xs font-bold transition-all border',
                              form.skills.includes(skill)
                                ? 'bg-emerald-600 text-white border-emerald-600'
                                : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-300'
                            )}
                          >
                            {skill}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Motivation Statement */}
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Why do you want to join this chapter? *
                      </label>
                      <textarea
                        value={form.motivation}
                        onChange={e => setForm(f => ({ ...f, motivation: e.target.value }))}
                        rows={4}
                        placeholder="Tell the chapter leadership why you want to join, what you hope to contribute, and what you want to learn. Be specific — this is read by the chapter leadership who will approve your application."
                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 resize-none"
                      />
                      <p className={cn('text-[10px] mt-1', form.motivation.length < 30 ? 'text-red-400' : 'text-slate-400')}>
                        {form.motivation.length} / minimum 30 characters
                      </p>
                    </div>

                    {/* ID Document URL */}
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Student Card / ID Document URL (optional)
                      </label>
                      <div className="relative">
                        <Globe className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                        <input
                          type="url"
                          value={form.id_document_url}
                          onChange={e => setForm(f => ({ ...f, id_document_url: e.target.value }))}
                          placeholder="https://drive.google.com/... or any public link to your ID"
                          className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                        />
                      </div>
                    </div>

                    {/* Public Visibility Consent */}
                    <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-2xl space-y-2">
                      <label className="flex items-start gap-2.5 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          required
                          checked={publicConsent}
                          onChange={e => setPublicConsent(e.target.checked)}
                          className="mt-0.5 w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 cursor-pointer"
                        />
                        <div className="text-xs text-indigo-950 font-medium leading-snug">
                          <strong className="block font-bold text-indigo-900">
                            Public Chapter Member Visibility Agreement *
                          </strong>
                          I consent that upon approval, my name / username, role, and student status will be publicly visible to everyone on this chapter's public member roster.
                        </div>
                      </label>
                    </div>

                    {/* Consent */}
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3">
                      <Shield className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <p className="text-[11px] text-amber-800 font-medium leading-relaxed">
                        By submitting this application, you confirm that all information provided is accurate and truthful. 
                        Your application will be reviewed by the chapter's leadership team. You will be notified of the decision via email.
                        YARA reserves the right to approve or decline applications at the chapter leadership's discretion.
                      </p>
                    </div>

                    {/* Error */}
                    {error && (
                      <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{error}</span>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* STEP 4: Success */}
                {step === 4 && (
                  <motion.div
                    key="step4"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center text-center py-8 space-y-6"
                  >
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-200">
                      <CheckCircle2 className="w-10 h-10 text-white" />
                    </div>

                    <div>
                      <h3 className="font-black text-slate-900 text-xl">Application Submitted!</h3>
                      <p className="text-slate-500 text-sm mt-2 max-w-sm mx-auto leading-relaxed">
                        Your application to join <strong className="text-slate-900">{selectedChapter?.name}</strong> has been received and is now pending review by the chapter leadership.
                      </p>
                    </div>

                    <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl text-sm text-amber-800 font-medium max-w-sm text-left space-y-2">
                      <div className="flex items-center gap-2 font-black text-amber-900">
                        <Clock className="w-4 h-4" />
                        <span>What happens next?</span>
                      </div>
                      <ul className="space-y-1 text-xs">
                        <li>• Chapter leadership will review your application</li>
                        <li>• You'll receive a notification at <strong>{form.email}</strong></li>
                        <li>• Typical response time: 3–7 business days</li>
                        <li>• If approved, you'll be added as an official member</li>
                      </ul>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={handleClose}
                        className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm transition-all"
                      >
                        Done
                      </button>
                    </div>
                  </motion.div>
                )}

              </AnimatePresence>
            </div>

            {/* Footer Navigation */}
            {step < 4 && (
              <div className="p-6 pt-0 border-t border-slate-100 flex items-center justify-between gap-3 shrink-0">
                <button
                  onClick={() => {
                    if (step > 1) setStep((s) => (s - 1) as any);
                    else handleClose();
                  }}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 font-bold text-xs transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                  {step === 1 ? 'Cancel' : 'Back'}
                </button>

                <button
                  disabled={
                    (step === 1 && !selectedProvince) ||
                    (step === 2 && !selectedChapterId) ||
                    (step === 3 && submitting)
                  }
                  onClick={() => {
                    if (step === 3) {
                      handleSubmit();
                    } else {
                      setStep((s) => (s + 1) as any);
                    }
                  }}
                  className={cn(
                    'flex items-center gap-2 px-6 py-2.5 rounded-xl font-black text-xs transition-all',
                    ((step === 1 && !selectedProvince) || (step === 2 && !selectedChapterId) || (step === 3 && submitting))
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20'
                  )}
                >
                  {step === 3 ? (
                    submitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Submit Application</span>
                      </>
                    )
                  ) : (
                    <>
                      <span>Continue</span>
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
