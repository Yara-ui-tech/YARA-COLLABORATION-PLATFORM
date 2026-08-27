import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Users, Award, Cpu, Sparkles, CheckCircle2, 
  Send, Clock, MapPin, Mail, Phone, ShieldCheck, 
  Video, HeartHandshake, Compass, AlertCircle, 
  FileCheck, Download, UserCheck, CheckSquare, Layers
} from 'lucide-react';
import { 
  getVolunteerApplications, 
  submitVolunteerApplication, 
  toggleVolunteerCheckIn,
  getCertificates,
  generateCertificate
} from '../../src/services/competitionEcosystemService';
import { VolunteerApplication, VolunteerDepartment, DigitalCertificate } from '../types/competitionEcosystem';
import DigitalCertificateModal from '../components/competition/DigitalCertificateModal';

const DEPARTMENTS: { 
  id: VolunteerDepartment; 
  title: string; 
  desc: string; 
  icon: string;
  category: 'leadership_grants' | 'technical_stem' | 'education_mentorship' | 'operations_logistics' | 'media_it';
}[] = [
  // 1. Leadership, Grants & Regional
  { 
    id: 'regional_representative', 
    title: 'Regional YARA Representative', 
    desc: 'Mobilize schools, coordinate provincial STEM clusters, and represent YARA in your province or district.', 
    icon: '🌍',
    category: 'leadership_grants'
  },
  { 
    id: 'grants_donations_specialist', 
    title: 'Grants & Donations Applications Volunteer', 
    desc: 'Research international STEM grants, prepare donor proposals, and support fundraising campaigns.', 
    icon: '💰',
    category: 'leadership_grants'
  },
  { 
    id: 'voluntary_internship', 
    title: 'Voluntary Internships (R&D / Software / Ops)', 
    desc: 'Gain practical experience in robotics R&D, curriculum engineering, web systems, or nonprofit operations.', 
    icon: '🎓',
    category: 'leadership_grants'
  },
  { 
    id: 'protocol', 
    title: 'Protocol & VIP Hosting', 
    desc: 'Welcome government dignitaries, international ambassadors, corporate sponsors, and keynote guests.', 
    icon: '🤝',
    category: 'leadership_grants'
  },

  // 2. Education & Mentorship
  { 
    id: 'educator_trainer_facilitator', 
    title: 'Educator STEM & AI Bootcamp Facilitator', 
    desc: 'Facilitate workshops for teachers on AI lesson planning, microcontroller coding, and practical STEM pedagogy.', 
    icon: '🧑‍🏫',
    category: 'education_mentorship'
  },
  { 
    id: 'chapter_patron_mentor', 
    title: 'Chapter Patron & Student Club Mentor', 
    desc: 'Coach primary, high school, or university robotics clubs, mentor student innovators, and host build nights.', 
    icon: '🌱',
    category: 'education_mentorship'
  },
  { 
    id: 'curriculum_translator', 
    title: 'Curriculum & Language Translator', 
    desc: 'Translate robotics guides, code explanations, and STEM materials into Shona, Ndebele, and local African languages.', 
    icon: '📖',
    category: 'education_mentorship'
  },

  // 3. Technical & Engineering
  { 
    id: 'hardware_assembly_lab', 
    title: 'Hardware Assembly & Electronics Lab Volunteer', 
    desc: 'Assemble robotics kits, test ESP32/Arduino boards, solder sensor harnesses, and prepare lab kits.', 
    icon: '🔬',
    category: 'technical_stem'
  },
  { 
    id: 'technical_support', 
    title: 'Technical Support & Pits Marshal', 
    desc: 'Help student teams with troubleshooting, electronic debugging, wiring, and motor driver calibration.', 
    icon: '🛠️',
    category: 'technical_stem'
  },
  { 
    id: 'underwater_challenge', 
    title: 'Underwater Drone Marshals', 
    desc: 'Supervise water test tanks, buoyancy trimming, safety tethers, and underwater mission timekeeping.', 
    icon: '🌊',
    category: 'technical_stem'
  },
  { 
    id: 'maze_challenge', 
    title: 'Maze & Autonomous Robotics Marshals', 
    desc: 'Calibrate micromouse maze gates, reset walls, verify optical sensor start lines, and record times.', 
    icon: '🤖',
    category: 'technical_stem'
  },
  { 
    id: 'innovation_pitch', 
    title: 'Innovation Pitch Staging & Presentation', 
    desc: 'Stage pitch presentations, manage microphones, slide clickers, timing clocks, and judge collations.', 
    icon: '💡',
    category: 'technical_stem'
  },
  { 
    id: 'judging_support', 
    title: 'Judging Secretariat Support', 
    desc: 'Assist adjudicators with digital score record logging, rubric verification, and audit trail checks.', 
    icon: '⚖️',
    category: 'technical_stem'
  },

  // 4. Operations, Fleet & Logistics
  { 
    id: 'voluntary_driver_logistics', 
    title: 'Voluntary Driving & Fleet Logistics', 
    desc: 'Transport equipment, student robot kits, competition arenas, and trainers across districts safely.', 
    icon: '🚐',
    category: 'operations_logistics'
  },
  { 
    id: 'logistics', 
    title: 'Logistics & Heavy Equipment Setup', 
    desc: 'Coordinate venue tables, arena carpeting, cable routing, audio/visual setups, and power distribution.', 
    icon: '📦',
    category: 'operations_logistics'
  },
  { 
    id: 'registration', 
    title: 'Registration & Welcome Secretariat', 
    desc: 'Manage participant check-in, issue ID badges, distribute educator kits, and guide attendees.', 
    icon: '📋',
    category: 'operations_logistics'
  },
  { 
    id: 'competition_operations', 
    title: 'Tournament Operations & Field Marshals', 
    desc: 'Coordinate match schedules, queue competing teams, manage arena clock, and update brackets.', 
    icon: '⏱️',
    category: 'operations_logistics'
  },
  { 
    id: 'hospitality', 
    title: 'Hospitality & Catering Operations', 
    desc: 'Organize meal distribution, hydration stations, and delegate care for participating students & guests.', 
    icon: '🍽️',
    category: 'operations_logistics'
  },
  { 
    id: 'crowd_management', 
    title: 'Crowd Management & Arena Safety', 
    desc: 'Ensure spectator safety behind barrier lines and maintain smooth foot-traffic between zones.', 
    icon: '🛡️',
    category: 'operations_logistics'
  },
  { 
    id: 'first_aid_safety', 
    title: 'First Aid & Emergency Safety', 
    desc: 'Provide immediate medical response, burn care, and first aid supplies for participants.', 
    icon: '🩹',
    category: 'operations_logistics'
  },

  // 5. Media, IT & Public Relations
  { 
    id: 'media_photography', 
    title: 'Media, Videography & Livestreaming', 
    desc: 'Photograph student teams, record robot trial matches, capture inventor interviews, and manage livestreams.', 
    icon: '📷',
    category: 'media_it'
  },
  { 
    id: 'social_media', 
    title: 'Social Media & Live Communications', 
    desc: 'Post real-time score updates, team spotlights, press stories, and engaging highlight clips across social platforms.', 
    icon: '📱',
    category: 'media_it'
  },
  { 
    id: 'it_support', 
    title: 'IT, Arena Wi-Fi & Live Scoring Server', 
    desc: 'Maintain arena Wi-Fi networks, scoring server uptime, projection feeds, and participant internet access.', 
    icon: '💻',
    category: 'media_it'
  },
  { 
    id: 'custom_voluntary_duty', 
    title: 'Other / Custom Voluntary Duty', 
    desc: 'Propose a specialized voluntary role, professional service, or unique contribution to YARA’s mission.', 
    icon: '✨',
    category: 'leadership_grants'
  }
];

export default function VolunteerPortal() {
  const [activeTab, setActiveTab] = useState<'apply' | 'dashboard'>('apply');
  const [volunteers, setVolunteers] = useState<VolunteerApplication[]>([]);
  const [activeVol, setActiveVol] = useState<VolunteerApplication | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Form states
  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState('22');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [organization, setOrganization] = useState('');
  const [province, setProvince] = useState('Harare');
  const [department, setDepartment] = useState<VolunteerDepartment>('regional_representative');
  const [customRoleDescription, setCustomRoleDescription] = useState('');
  const [availability, setAvailability] = useState<'all_days' | 'day_1' | 'day_2' | 'day_3' | 'virtual_prep' | 'weekends' | 'flexible_ongoing'>('flexible_ongoing');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [experience, setExperience] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  // Certificate Modal
  const [certModalOpen, setCertModalOpen] = useState(false);
  const [activeCert, setActiveCert] = useState<DigitalCertificate | null>(null);

  const loadData = async () => {
    const list = await getVolunteerApplications();
    setVolunteers(list);
    if (list.length > 0) {
      setActiveVol(list[0]);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setNotice(null);

    const record = await submitVolunteerApplication({
      full_name: fullName.trim(),
      age: parseInt(age) || 20,
      email: email.trim(),
      phone: phone.trim(),
      organization_school: organization.trim() || 'Independent Volunteer',
      province,
      custom_role_description: department === 'custom_voluntary_duty' ? customRoleDescription.trim() : undefined,
      skills: ['STEM Mentorship', 'Community Leadership', 'Technical Support'],
      previous_experience: experience.trim() || 'Eager to support youth innovation in robotics and STEM.',
      availability,
      preferred_department: department,
      emergency_contact: emergencyContact.trim() || 'Parent/Guardian',
      emergency_phone: emergencyPhone.trim() || phone.trim()
    });

    setNotice('Your volunteer application has been approved! You can now access your Volunteer Dashboard.');
    setActiveVol(record);
    setIsSubmitting(false);
    setActiveTab('dashboard');
    loadData();
  };

  const handleCheckInToggle = async () => {
    if (!activeVol) return;
    const updated = await toggleVolunteerCheckIn(activeVol.id);
    if (updated) {
      setActiveVol(updated);
      loadData();
    }
  };

  const handleViewCertificate = async (vol: VolunteerApplication) => {
    const certs = await getCertificates();
    let found = certs.find(c => c.recipient_name === vol.full_name && c.type === 'volunteer');

    if (!found) {
      found = await generateCertificate({
        certificate_id: `YARA-CERT-2026-${Math.floor(100000 + Math.random() * 900000)}`,
        recipient_name: vol.full_name,
        recipient_email: vol.email,
        type: 'volunteer',
        event_name: 'YARA Robotics Competition 2026',
        edition_year: 2026,
        achievement_title: `Distinguished Volunteer — ${vol.assigned_department ? vol.assigned_department.replace(/_/g, ' ').toUpperCase() : 'ORGANIZATIONAL DUTIES'}`,
        issued_date: new Date().toISOString().split('T')[0]
      });
    }

    setActiveCert(found);
    setCertModalOpen(true);
  };

  const filteredDepartments = selectedCategory === 'all'
    ? DEPARTMENTS
    : DEPARTMENTS.filter(d => d.category === selectedCategory);

  return (
    <div className="space-y-10 pb-16">
      {/* 1. HERO BANNER */}
      <div className="p-8 md:p-12 rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-4">
          <span className="px-3.5 py-1 rounded-full bg-emerald-400/20 text-emerald-300 border border-emerald-400/40 text-xs font-black uppercase tracking-wider">
            🙋 YARA Continental Volunteer & Leadership Corps
          </span>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Register for Any Voluntary Duty at YARA
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Support Africa’s next generation of robotics innovators. Register for regional representation, grants & donation writing, voluntary internships, voluntary driving, tournament operations, educator facilitation, or propose your own specialized voluntary contribution.
          </p>

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setActiveTab('apply')}
              className={`px-6 py-3 rounded-2xl text-xs font-bold transition-all ${
                activeTab === 'apply' ? 'bg-amber-400 text-slate-950 font-black' : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              Register Voluntary Duty
            </button>
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-6 py-3 rounded-2xl text-xs font-bold transition-all ${
                activeTab === 'dashboard' ? 'bg-indigo-600 text-white font-black' : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              Volunteer Dashboard ({volunteers.length})
            </button>
          </div>
        </div>
      </div>

      {/* TAB 1: VOLUNTEER APPLICATION */}
      {activeTab === 'apply' && (
        <div className="space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl font-black text-slate-900">Choose Your Voluntary Duty Track</h2>
            <p className="text-xs text-slate-500">Select an area where your skills, passion, or time can create the highest impact across YARA.</p>
            
            {/* Category Filter Pills */}
            <div className="flex flex-wrap justify-center gap-2 pt-3">
              {[
                { id: 'all', label: 'All Voluntary Roles' },
                { id: 'leadership_grants', label: 'Leadership & Grants' },
                { id: 'education_mentorship', label: 'Education & Mentorship' },
                { id: 'technical_stem', label: 'Robotics & Hardware Labs' },
                { id: 'operations_logistics', label: 'Operations, Fleet & Field' },
                { id: 'media_it', label: 'Media, IT & PR' }
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    selectedCategory === cat.id
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Departments Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDepartments.map(dept => (
              <div
                key={dept.id}
                onClick={() => setDepartment(dept.id)}
                className={`p-5 rounded-3xl border cursor-pointer transition-all ${
                  department === dept.id
                    ? 'bg-indigo-50 border-indigo-400 shadow-md ring-2 ring-indigo-300'
                    : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
                }`}
              >
                <div className="flex items-center space-x-3 mb-2">
                  <span className="text-2xl">{dept.icon}</span>
                  <h3 className="font-bold text-sm text-slate-900">{dept.title}</h3>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">{dept.desc}</p>
              </div>
            ))}
          </div>

          {/* Application Form */}
          <div className="p-6 md:p-8 bg-white rounded-3xl border border-slate-200 shadow-sm max-w-3xl mx-auto space-y-6">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-xl font-black text-slate-900">Voluntary Duty Registration</h3>
              <p className="text-xs text-slate-500">Selected Track: <strong className="text-indigo-600 capitalize">{department.replace(/_/g, ' ')}</strong></p>
            </div>

            {notice && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center space-x-3 text-xs font-bold">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>{notice}</span>
              </div>
            )}

            <form onSubmit={handleApply} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1 uppercase tracking-wider">Full Name</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    placeholder="e.g. Tinashe Chikwanha"
                    className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1 uppercase tracking-wider">Age</label>
                  <input
                    type="number"
                    required
                    value={age}
                    onChange={e => setAge(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1 uppercase tracking-wider">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="name@organization.org"
                    className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1 uppercase tracking-wider">Phone / WhatsApp</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="+263 77 123 4567"
                    className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1 uppercase tracking-wider">School / Organization / Employer</label>
                  <input
                    type="text"
                    value={organization}
                    onChange={e => setOrganization(e.target.value)}
                    placeholder="e.g. University of Zimbabwe / Independent"
                    className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1 uppercase tracking-wider">Province / Region</label>
                  <select
                    value={province}
                    onChange={e => setProvince(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  >
                    <option value="Harare">Harare</option>
                    <option value="Bulawayo">Bulawayo</option>
                    <option value="Manicaland">Manicaland</option>
                    <option value="Mashonaland Central">Mashonaland Central</option>
                    <option value="Mashonaland East">Mashonaland East</option>
                    <option value="Mashonaland West">Mashonaland West</option>
                    <option value="Masvingo">Masvingo</option>
                    <option value="Matabeleland North">Matabeleland North</option>
                    <option value="Matabeleland South">Matabeleland South</option>
                    <option value="Midlands">Midlands</option>
                    <option value="International/Diaspora">International / Diaspora Volunteer</option>
                  </select>
                </div>
              </div>

              {/* If custom duty selected */}
              {department === 'custom_voluntary_duty' && (
                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 space-y-2">
                  <label className="block font-bold text-amber-900 uppercase tracking-wider">Specify Your Custom Voluntary Duty</label>
                  <input
                    type="text"
                    required
                    value={customRoleDescription}
                    onChange={e => setCustomRoleDescription(e.target.value)}
                    placeholder="e.g. Legal Advisory, Solar Hardware Engineering, Sign Language Interpretation"
                    className="w-full p-3 rounded-xl border border-amber-300 bg-white focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                  />
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1 uppercase tracking-wider">Availability & Commitment</label>
                  <select
                    value={availability}
                    onChange={e => setAvailability(e.target.value as any)}
                    className="w-full p-3 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  >
                    <option value="flexible_ongoing">Flexible Ongoing (2-5 hrs / week)</option>
                    <option value="weekends">Weekends Only</option>
                    <option value="all_days">All Competition Days (Oct 16 - 18, 2026)</option>
                    <option value="day_1">Day 1 Only (Setup & Trials)</option>
                    <option value="day_2">Day 2 Only (Main Arena Matches)</option>
                    <option value="day_3">Day 3 Only (Finals & Awards)</option>
                    <option value="virtual_prep">Virtual Pre-Event Prep Support</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1 uppercase tracking-wider">Emergency Contact Name</label>
                  <input
                    type="text"
                    value={emergencyContact}
                    onChange={e => setEmergencyContact(e.target.value)}
                    placeholder="e.g. Parent / Next of Kin"
                    className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1 uppercase tracking-wider">Emergency Contact Phone</label>
                <input
                  type="tel"
                  value={emergencyPhone}
                  onChange={e => setEmergencyPhone(e.target.value)}
                  placeholder="+263 77 987 6543"
                  className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1 uppercase tracking-wider">Previous Experience / Motivation</label>
                <textarea
                  rows={3}
                  value={experience}
                  onChange={e => setExperience(e.target.value)}
                  placeholder="Share how your background aligns with this voluntary duty and why you want to support YARA's mission..."
                  className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div className="pt-4 flex items-center justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md disabled:opacity-50 transition-all cursor-pointer"
                >
                  {isSubmitting ? 'Submitting Registration...' : 'Complete Voluntary Duty Registration'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAB 2: VOLUNTEER DASHBOARD */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {activeVol ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left 2 Cols: Dashboard Roster & Status */}
              <div className="lg:col-span-2 space-y-6">
                <div className="p-6 md:p-8 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                    <div>
                      <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold">
                        🟢 Active Volunteer Staff
                      </span>
                      <h2 className="text-2xl font-black text-slate-900 mt-2">{activeVol.full_name}</h2>
                      <p className="text-xs text-slate-500">{activeVol.organization_school}</p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={handleCheckInToggle}
                        className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center space-x-1.5 transition-all ${
                          activeVol.checked_in_event_day
                            ? 'bg-emerald-600 text-white shadow-sm'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        <UserCheck className="w-4 h-4" />
                        <span>{activeVol.checked_in_event_day ? 'Checked-In on Event Day' : 'Event Day Check-In'}</span>
                      </button>

                      <button
                        onClick={() => handleViewCertificate(activeVol)}
                        className="px-4 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl font-bold text-xs flex items-center space-x-1.5"
                      >
                        <Award className="w-4 h-4" />
                        <span>Certificate</span>
                      </button>
                    </div>
                  </div>

                  {/* Assignment Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Assigned Department</span>
                      <p className="text-sm font-bold text-slate-900 capitalize">
                        {activeVol.assigned_department ? activeVol.assigned_department.replace(/_/g, ' ') : activeVol.preferred_department.replace(/_/g, ' ')}
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Assigned Supervisor</span>
                      <p className="text-sm font-bold text-indigo-600">
                        {activeVol.assigned_supervisor || 'Chief Marshal'}
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Shift Schedule</span>
                      <p className="text-sm font-bold text-slate-900">
                        {activeVol.shift_time || '08:00 - 17:00 CAT'}
                      </p>
                    </div>
                  </div>

                  {/* Responsibilities Checklist */}
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                    <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider">
                      Department Operational Duties:
                    </h4>
                    <div className="space-y-2 text-xs text-slate-700">
                      <div className="flex items-center space-x-2">
                        <CheckSquare className="w-4 h-4 text-emerald-600" />
                        <span>Participate in morning briefing at 07:30 AM in Main Arena Hall.</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckSquare className="w-4 h-4 text-emerald-600" />
                        <span>Ensure student teams have safety glasses before entering testing zones.</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckSquare className="w-4 h-4 text-emerald-600" />
                        <span>Coordinate with lead judges for digital score record submission.</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckSquare className="w-4 h-4 text-emerald-600" />
                        <span>Maintain emergency first aid hotline and marshal radio protocol.</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right 1 Col: Volunteer Directory */}
              <div className="space-y-4">
                <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="font-bold text-base text-slate-900">Volunteer Corps ({volunteers.length})</h3>
                    <span className="text-xs text-emerald-600 font-bold">All Approved</span>
                  </div>

                  <div className="space-y-2 max-h-[400px] overflow-y-auto">
                    {volunteers.map(vol => (
                      <button
                        key={vol.id}
                        onClick={() => setActiveVol(vol)}
                        className={`w-full text-left p-3 rounded-2xl border transition-all ${
                          activeVol.id === vol.id ? 'bg-indigo-50 border-indigo-400' : 'bg-slate-50 border-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-slate-900">{vol.full_name}</span>
                          {vol.checked_in_event_day && (
                            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-md">
                              Checked In
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 capitalize">
                          {vol.assigned_department ? vol.assigned_department.replace(/_/g, ' ') : vol.preferred_department.replace(/_/g, ' ')}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 shadow-sm text-slate-400">
              No volunteer applications registered yet.
            </div>
          )}
        </div>
      )}

      {/* Certificate Modal */}
      <DigitalCertificateModal
        isOpen={certModalOpen}
        onClose={() => setCertModalOpen(false)}
        certificate={activeCert}
      />
    </div>
  );
}
