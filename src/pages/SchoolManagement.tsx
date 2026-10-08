import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Building2, School, Users, Trophy, Award, Calendar, 
  MapPin, Phone, Mail, CheckCircle2, Search, Plus, 
  ArrowRight, ShieldCheck, Cpu, Filter, X, Check, Loader2
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../components/AuthContext';
import { cn } from '../lib/utils';

export interface SchoolProfile {
  id: string;
  name: string;
  province: string;
  district: string;
  address: string;
  principal_name: string;
  patron_name: string;
  patron_email: string;
  patron_phone: string;
  has_active_robotics_club: boolean;
  club_meeting_schedule: string;
  student_count: number;
  teams_entered_2026: number;
  kits_deployed: number;
  status: 'active' | 'forming' | 'partner';
  achievements: string[];
}

const DEFAULT_SCHOOLS: SchoolProfile[] = [
  {
    id: 'sch_01',
    name: 'Chinhoyi High School',
    province: 'Mashonaland West',
    district: 'Makonde',
    address: 'Private Bag 7720, Chinhoyi',
    principal_name: 'Mr. E. Mupamhanga',
    patron_name: 'Mr. K. Nyashanu',
    patron_email: 'nyashanu.k@chinhoyihigh.ac.zw',
    patron_phone: '+263 77 234 5678',
    has_active_robotics_club: true,
    club_meeting_schedule: 'Fridays 14:00 - 16:30',
    student_count: 48,
    teams_entered_2026: 2,
    kits_deployed: 4,
    status: 'active',
    achievements: ['2025 Mashwest Provincial Hackathon 1st Place', 'Autonomous Maze Solver Finalist']
  },
  {
    id: 'sch_02',
    name: 'Kutama College',
    province: 'Mashonaland West',
    district: 'Zvimba',
    address: 'P.O. Box 40, Norton',
    principal_name: 'Br. N. Mukonori',
    patron_name: 'Mrs. S. Marange',
    patron_email: 'marange.s@kutama.ac.zw',
    patron_phone: '+263 71 890 1234',
    has_active_robotics_club: true,
    club_meeting_schedule: 'Wednesdays & Saturdays 15:00',
    student_count: 65,
    teams_entered_2026: 3,
    kits_deployed: 6,
    status: 'active',
    achievements: ['2025 STEM Innovation Trophy', '100% Female & Male Team Gender Parity Award']
  },
  {
    id: 'sch_03',
    name: 'Nemakonde High School',
    province: 'Mashonaland West',
    district: 'Makonde',
    address: 'Stand 448, Cold Stream, Chinhoyi',
    principal_name: 'Mrs. F. Mutsvangwa',
    patron_name: 'Mr. P. Chiware',
    patron_email: 'chiware.p@nemakonde.ac.zw',
    patron_phone: '+263 77 456 7890',
    has_active_robotics_club: true,
    club_meeting_schedule: 'Thursdays 14:00 - 16:00',
    student_count: 36,
    teams_entered_2026: 2,
    kits_deployed: 3,
    status: 'active',
    achievements: ['Community Agri-Bot Prototype Defense Top 3']
  },
  {
    id: 'sch_04',
    name: 'Banket High School',
    province: 'Mashonaland West',
    district: 'Zvimba',
    address: 'Main St, Banket',
    principal_name: 'Mr. T. Mashava',
    patron_name: 'Ms. R. Hove',
    patron_email: 'hove.r@bankethigh.ac.zw',
    patron_phone: '+263 78 321 6549',
    has_active_robotics_club: true,
    club_meeting_schedule: 'Tuesdays 15:00 - 17:00',
    student_count: 30,
    teams_entered_2026: 1,
    kits_deployed: 2,
    status: 'active',
    achievements: ['2025 Grassroots Outreach Outstanding Initiative']
  },
  {
    id: 'sch_05',
    name: 'Kabidza Secondary School',
    province: 'Mashonaland West',
    district: 'Kadoma',
    address: 'Kabidza Rural Growth Point',
    principal_name: 'Mr. G. Chitepo',
    patron_name: 'Mr. D. Moyo',
    patron_email: 'moyo.d@kabidza.org',
    patron_phone: '+263 77 876 5432',
    has_active_robotics_club: true,
    club_meeting_schedule: 'Fridays 13:30 - 15:30',
    student_count: 42,
    teams_entered_2026: 1,
    kits_deployed: 2,
    status: 'active',
    achievements: ['Solar Micro-Irrigation Automated Model Recognition']
  }
];

export default function SchoolManagement() {
  const { user, profile } = useAuth();
  const [schools, setSchools] = useState<SchoolProfile[]>(() => {
    try {
      const stored = localStorage.getItem('yara_schools_directory_cache');
      return stored ? JSON.parse(stored) : DEFAULT_SCHOOLS;
    } catch {
      return DEFAULT_SCHOOLS;
    }
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSchool, setSelectedSchool] = useState<SchoolProfile | null>(null);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [newSchoolForm, setNewSchoolForm] = useState({
    name: '',
    province: 'Mashonaland West',
    district: '',
    principal_name: '',
    patron_name: '',
    patron_email: '',
    patron_phone: '',
    student_count: 25,
    club_schedule: 'Fridays 14:00 - 16:00'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [regSuccess, setRegSuccess] = useState(false);

  useEffect(() => {
    async function fetchDbSchools() {
      try {
        const { data, error } = await supabase.from('schools').select('*');
        if (!error && data && data.length > 0) {
          const mapped: SchoolProfile[] = data.map((d: any) => ({
            id: d.id,
            name: d.name,
            province: d.province || 'Mashonaland West',
            district: d.district || '',
            address: d.address || '',
            principal_name: d.principal_name || '',
            patron_name: d.patron_name || '',
            patron_email: d.patron_email || '',
            patron_phone: d.patron_phone || '',
            has_active_robotics_club: d.has_active_robotics_club ?? true,
            club_meeting_schedule: 'Fridays 14:00',
            student_count: d.student_count || 30,
            teams_entered_2026: 1,
            kits_deployed: 2,
            status: d.status || 'active',
            achievements: []
          }));
          setSchools(mapped);
        }
      } catch {
        // Fallback to defaults
      }
    }
    fetchDbSchools();
  }, []);

  const filteredSchools = schools.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.province.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRegisterSchool = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const newSchool: SchoolProfile = {
      id: `sch_${Date.now()}`,
      name: newSchoolForm.name,
      province: newSchoolForm.province,
      district: newSchoolForm.district,
      address: `${newSchoolForm.district}, ${newSchoolForm.province}`,
      principal_name: newSchoolForm.principal_name,
      patron_name: newSchoolForm.patron_name,
      patron_email: newSchoolForm.patron_email,
      patron_phone: newSchoolForm.patron_phone,
      has_active_robotics_club: true,
      club_meeting_schedule: newSchoolForm.club_schedule,
      student_count: Number(newSchoolForm.student_count),
      teams_entered_2026: 1,
      kits_deployed: 2,
      status: 'active',
      achievements: ['New Accredited School Club 2026']
    };

    const updated = [newSchool, ...schools];
    setSchools(updated);
    try {
      localStorage.setItem('yara_schools_directory_cache', JSON.stringify(updated));
      await supabase.from('schools').insert({
        name: newSchool.name,
        province: newSchool.province,
        district: newSchool.district,
        principal_name: newSchool.principal_name,
        patron_name: newSchool.patron_name,
        patron_email: newSchool.patron_email,
        patron_phone: newSchool.patron_phone,
        has_active_robotics_club: true
      });
    } catch {}

    setIsSubmitting(false);
    setRegSuccess(true);
  };

  return (
    <div className="space-y-10 pb-20">
      {/* Header Banner */}
      <section className="bg-gradient-to-b from-slate-900 via-blue-950/40 to-slate-950 pt-16 pb-16 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="max-w-7xl mx-auto space-y-4 text-center sm:text-left flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold uppercase tracking-wider">
              <School className="w-3.5 h-3.5" />
              <span>YARA Institutional Network</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
              School Management &amp; <span className="text-blue-400">Robotics Clubs</span>
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Empowering primary and secondary schools across Zimbabwe with structured robotics clubs, trained teacher patrons, hardware lab kits, and national competition pathways.
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-col gap-3 shrink-0">
            <button
              onClick={() => {
                setIsRegisterModalOpen(true);
                setRegSuccess(false);
              }}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black px-6 py-3.5 rounded-2xl text-xs uppercase tracking-wider shadow-xl shadow-blue-900/40 transition-all flex items-center gap-2 hover:scale-105"
            >
              <Plus className="w-4 h-4" />
              <span>Register School Club</span>
            </button>

            <Link
              to="/educator-portal"
              className="bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 font-bold px-6 py-3.5 rounded-2xl text-xs text-center transition-all"
            >
              Teacher / Patron Workbench
            </Link>
          </div>
        </div>
      </section>

      {/* Directory & Search */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by school name, district, or province..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
            <span>Showing <strong className="text-white">{filteredSchools.length}</strong> active schools</span>
          </div>
        </div>

        {/* Schools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSchools.map((sch) => (
            <div
              key={sch.id}
              className="rounded-3xl bg-slate-900 border border-slate-800 hover:border-blue-500/40 p-6 transition-all shadow-xl flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="w-12 h-12 rounded-2xl bg-blue-950 border border-blue-800 flex items-center justify-center text-blue-400 shrink-0">
                    <School className="w-6 h-6" />
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-bold uppercase tracking-wider">
                    {sch.status} club
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-black text-white group-hover:text-blue-400 transition-colors">
                    {sch.name}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span>{sch.district ? `${sch.district}, ` : ''}{sch.province}</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 py-3 px-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 text-center">
                  <div>
                    <span className="text-base font-black text-white">{sch.student_count}</span>
                    <p className="text-[10px] text-slate-500 font-semibold">Members</p>
                  </div>
                  <div>
                    <span className="text-base font-black text-amber-400">{sch.teams_entered_2026}</span>
                    <p className="text-[10px] text-slate-500 font-semibold">2026 Teams</p>
                  </div>
                  <div>
                    <span className="text-base font-black text-emerald-400">{sch.kits_deployed}</span>
                    <p className="text-[10px] text-slate-500 font-semibold">Lab Kits</p>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-slate-300">
                  <p><strong>Robotics Patron:</strong> {sch.patron_name}</p>
                  <p className="text-slate-400 text-[11px]">Meetings: {sch.club_meeting_schedule}</p>
                </div>

                {sch.achievements.length > 0 && (
                  <div className="pt-2 border-t border-slate-800/80">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1 mb-1">
                      <Trophy className="w-3 h-3" />
                      <span>Accolades</span>
                    </span>
                    <p className="text-[11px] text-slate-300 line-clamp-2">
                      {sch.achievements.join(' • ')}
                    </p>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
                <button
                  onClick={() => setSelectedSchool(sch)}
                  className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1"
                >
                  <span>View Details &amp; Contact</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* School Detail Modal */}
      {selectedSchool && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 text-white shadow-2xl relative space-y-5">
            <button
              onClick={() => setSelectedSchool(null)}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">
                Official School Profile
              </span>
              <h3 className="text-2xl font-black text-white">{selectedSchool.name}</h3>
              <p className="text-xs text-slate-400">{selectedSchool.address}</p>
            </div>

            <div className="space-y-3 pt-2 text-xs border-t border-slate-800">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950">
                <span className="text-slate-400">Head / Principal:</span>
                <strong className="text-white">{selectedSchool.principal_name}</strong>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950">
                <span className="text-slate-400">Robotics Patron:</span>
                <strong className="text-white">{selectedSchool.patron_name}</strong>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950">
                <span className="text-slate-400">Patron Email:</span>
                <a href={`mailto:${selectedSchool.patron_email}`} className="text-blue-400 hover:underline">{selectedSchool.patron_email}</a>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950">
                <span className="text-slate-400">Patron Contact:</span>
                <span className="text-slate-200">{selectedSchool.patron_phone}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950">
                <span className="text-slate-400">Meeting Schedule:</span>
                <span className="text-amber-400 font-bold">{selectedSchool.club_meeting_schedule}</span>
              </div>
            </div>

            <div className="pt-2">
              <Link
                to="/competitions/yara-2026"
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2"
              >
                <span>Enter School Team in YARA 2026</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Registration Modal */}
      {isRegisterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 text-white shadow-2xl relative space-y-4">
            <button
              onClick={() => setIsRegisterModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            {regSuccess ? (
              <div className="text-center py-6 space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto">
                  <Check className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-black text-white">School Club Registered!</h3>
                <p className="text-xs text-slate-300 max-w-sm mx-auto leading-relaxed">
                  Your school has been added to the official YARA network directory. Our provincial coordinator will reach out regarding starter lab kit deployment.
                </p>
                <button
                  onClick={() => setIsRegisterModalOpen(false)}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-2.5 rounded-xl text-xs"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleRegisterSchool} className="space-y-3.5">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">
                    New Institution Enrollment
                  </span>
                  <h3 className="text-xl font-black text-white mt-1">Register School Robotics Club</h3>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">School Full Name</label>
                  <input
                    type="text"
                    required
                    value={newSchoolForm.name}
                    onChange={(e) => setNewSchoolForm({ ...newSchoolForm, name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                    placeholder="e.g. St. Francis Secondary School"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Province</label>
                    <input
                      type="text"
                      required
                      value={newSchoolForm.province}
                      onChange={(e) => setNewSchoolForm({ ...newSchoolForm, province: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                      placeholder="e.g. Mashonaland West"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">District</label>
                    <input
                      type="text"
                      required
                      value={newSchoolForm.district}
                      onChange={(e) => setNewSchoolForm({ ...newSchoolForm, district: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                      placeholder="e.g. Makonde / Chinhoyi"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Principal / Head</label>
                    <input
                      type="text"
                      required
                      value={newSchoolForm.principal_name}
                      onChange={(e) => setNewSchoolForm({ ...newSchoolForm, principal_name: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                      placeholder="Head's name"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Robotics Patron / Teacher</label>
                    <input
                      type="text"
                      required
                      value={newSchoolForm.patron_name}
                      onChange={(e) => setNewSchoolForm({ ...newSchoolForm, patron_name: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                      placeholder="Teacher coordinator"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Patron Email</label>
                    <input
                      type="email"
                      required
                      value={newSchoolForm.patron_email}
                      onChange={(e) => setNewSchoolForm({ ...newSchoolForm, patron_email: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                      placeholder="patron@school.ac.zw"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Patron Phone</label>
                    <input
                      type="text"
                      required
                      value={newSchoolForm.patron_phone}
                      onChange={(e) => setNewSchoolForm({ ...newSchoolForm, patron_phone: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                      placeholder="+263 7..."
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-3 rounded-xl text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Submit School Registration</span>}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
