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

const DEPARTMENTS: { id: VolunteerDepartment; title: string; desc: string; icon: string }[] = [
  { id: 'registration', title: 'Registration & Welcome', desc: 'Manage participant check-in, team badge distribution, and orientation.', icon: '📋' },
  { id: 'competition_operations', title: 'Competition Operations', desc: 'Coordinate match schedules, timekeeping, and match queuing.', icon: '⏱️' },
  { id: 'technical_support', title: 'Technical Support & Pits', desc: 'Help teams with electronics, soldering, circuit checks, and tools.', icon: '🛠️' },
  { id: 'underwater_challenge', title: 'Underwater Drone Marshals', desc: 'Supervise the water test tank, buoyancy testing, and recovery tether.', icon: '🌊' },
  { id: 'maze_challenge', title: 'Maze Challenge Marshals', desc: 'Reset maze walls, calibrate start gates, and monitor infrared timing.', icon: '🤖' },
  { id: 'innovation_pitch', title: 'Innovation Pitch Staging', desc: 'Stage pitch presentations, manage microphones, slide clickers, and timers.', icon: '💡' },
  { id: 'media_photography', title: 'Media & Photography', desc: 'Photograph student teams, record robot trial matches, and livestream.', icon: '📷' },
  { id: 'social_media', title: 'Social Media & Live Updates', desc: 'Post real-time score updates, team spotlights, and stories.', icon: '📱' },
  { id: 'hospitality', title: 'Hospitality & Catering', desc: 'Organize meal distribution and hydration stations for teams & guests.', icon: '🍽️' },
  { id: 'logistics', title: 'Logistics & Equipment', desc: 'Coordinate table setups, cable routing, spare parts, and venue transport.', icon: '📦' },
  { id: 'crowd_management', title: 'Crowd Management & Safety', desc: 'Ensure spectator safety lines and smooth flow between arena zones.', icon: '🛡️' },
  { id: 'first_aid_safety', title: 'First Aid & Safety', desc: 'Provide immediate medical response, burn care, and first aid supplies.', icon: '🩹' },
  { id: 'it_support', title: 'IT & Network Support', desc: 'Maintain arena Wi-Fi, scoring server connectivity, and projection screens.', icon: '💻' },
  { id: 'protocol', title: 'Protocol & VIP Hosting', desc: 'Welcome government dignitaries, corporate sponsors, and keynote judges.', icon: '🤝' },
  { id: 'judging_support', title: 'Judging Secretariat Support', desc: 'Assist lead judges with digital score logging and rubric collation.', icon: '⚖️' }
];

export default function VolunteerPortal() {
  const [activeTab, setActiveTab] = useState<'apply' | 'dashboard'>('apply');
  const [volunteers, setVolunteers] = useState<VolunteerApplication[]>([]);
  const [activeVol, setActiveVol] = useState<VolunteerApplication | null>(null);

  // Form states
  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState('22');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [organization, setOrganization] = useState('');
  const [department, setDepartment] = useState<VolunteerDepartment>('technical_support');
  const [availability, setAvailability] = useState<'all_days' | 'day_1' | 'day_2' | 'day_3' | 'virtual_prep'>('all_days');
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
      skills: ['STEM Mentorship', 'Event Logistics'],
      previous_experience: experience.trim() || 'Eager to support youth innovation in robotics.',
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
        achievement_title: `Distinguished Volunteer — ${vol.assigned_department ? vol.assigned_department.replace(/_/g, ' ').toUpperCase() : 'EVENT OPERATIONS'}`,
        issued_date: new Date().toISOString().split('T')[0]
      });
    }

    setActiveCert(found);
    setCertModalOpen(true);
  };

  return (
    <div className="space-y-10 pb-16">
      {/* 1. HERO BANNER */}
      <div className="p-8 md:p-12 rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-4">
          <span className="px-3.5 py-1 rounded-full bg-emerald-400/20 text-emerald-300 border border-emerald-400/40 text-xs font-black uppercase tracking-wider">
            🙋 YARA Robotics Competition 2026 Volunteer Corps
          </span>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Volunteer for the YARA Robotics Flagship Championship
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Join 35+ passionate engineers, teachers, tech enthusiasts, and student leaders making high-impact STEM competition possible for underserved youth across Zimbabwe.
          </p>

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setActiveTab('apply')}
              className={`px-6 py-3 rounded-2xl text-xs font-bold transition-all ${
                activeTab === 'apply' ? 'bg-amber-400 text-slate-950 font-black' : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              Apply to Volunteer
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
            <h2 className="text-2xl font-black text-slate-900">Volunteer Departments & Opportunities</h2>
            <p className="text-xs text-slate-500">Choose from 15 specialized event operational areas.</p>
          </div>

          {/* 15 Departments Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {DEPARTMENTS.map(dept => (
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
              <h3 className="text-xl font-black text-slate-900">Volunteer Application Form</h3>
              <p className="text-xs text-slate-500">Selected Department: <strong className="text-indigo-600 capitalize">{department.replace(/_/g, ' ')}</strong></p>
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
                    placeholder="name@university.ac.zw"
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
                  <label className="block font-bold text-slate-700 mb-1 uppercase tracking-wider">School / Organization</label>
                  <input
                    type="text"
                    value={organization}
                    onChange={e => setOrganization(e.target.value)}
                    placeholder="e.g. University of Zimbabwe Mechatronics Dept"
                    className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1 uppercase tracking-wider">Availability</label>
                  <select
                    value={availability}
                    onChange={e => setAvailability(e.target.value as any)}
                    className="w-full p-3 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  >
                    <option value="all_days">All Competition Days (Oct 16 - 18, 2026)</option>
                    <option value="day_1">Day 1 Only (Setup & Trials)</option>
                    <option value="day_2">Day 2 Only (Main Arena Matches)</option>
                    <option value="day_3">Day 3 Only (Finals & Awards)</option>
                    <option value="virtual_prep">Virtual Pre-Event Prep Support</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

                <div>
                  <label className="block font-bold text-slate-700 mb-1 uppercase tracking-wider">Emergency Phone</label>
                  <input
                    type="tel"
                    value={emergencyPhone}
                    onChange={e => setEmergencyPhone(e.target.value)}
                    placeholder="+263 77 987 6543"
                    className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1 uppercase tracking-wider">Previous STEM / Event Experience</label>
                <textarea
                  rows={3}
                  value={experience}
                  onChange={e => setExperience(e.target.value)}
                  placeholder="Share any past volunteering, robotics club coaching, or event coordination experience..."
                  className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div className="pt-4 flex items-center justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md disabled:opacity-50"
                >
                  {isSubmitting ? 'Submitting Application...' : 'Submit Volunteer Application'}
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
