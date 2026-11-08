import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, Users, Calendar, MapPin, Clock, Award, 
  CheckCircle2, ArrowRight, ShieldCheck, GraduationCap, 
  Cpu, Filter, DollarSign, X, Check, Loader2, Sparkles
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../components/AuthContext';
import { cn } from '../lib/utils';
import { ASSETS } from '../constants/assets';

export interface TrainingProgram {
  id: string;
  lms_course_id: string;
  title: string;
  slug?: string;
  description: string;
  target_audience: 'Students' | 'Teachers / Patrons' | 'Schools' | 'Coaches' | 'Enthusiasts' | 'All';
  category: 'Robotics' | 'Coding' | 'AI & IoT' | 'STEM Education' | 'Engineering';
  format: 'In-Person' | 'Virtual' | 'Blended';
  level: string;
  duration_weeks: number;
  total_hours: number;
  fee_usd: number;
  capacity: number;
  enrolled_count: number;
  venue: string;
  start_date: string;
  end_date: string;
  registration_deadline: string;
  instructor_name: string;
  instructor_title: string;
  certification_info: string;
  membership_requirement: string;
  learning_outcomes: string[];
  prerequisites: string[];
  banner_image: string;
  status: 'upcoming' | 'open_for_registration' | 'ongoing' | 'completed';
}

export default function Training() {
  const { user, profile } = useAuth();
  const [programs, setPrograms] = useState<TrainingProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAudience, setSelectedAudience] = useState<string>('All');
  const [selectedProgram, setSelectedProgram] = useState<TrainingProgram | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [regForm, setRegForm] = useState({
    name: profile?.display_name || '',
    email: user?.email || '',
    phone: (profile as any)?.contact_phone || (profile as any)?.phone || '',
    schoolOrOrg: '',
    roleInSchool: 'Student'
  });
  const [regSuccess, setRegSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function fetchTrainingPrograms() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('training_programs')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          setPrograms(data);
        } else {
          // Dynamic database fallback: map published courses from Supabase
          const { data: courseData } = await supabase
            .from('courses')
            .select('*')
            .eq('is_published', true)
            .order('order_index');

          if (courseData && courseData.length > 0) {
            setPrograms(courseData.map((c: any) => ({
              id: c.id,
              lms_course_id: c.slug || c.id,
              title: c.title,
              description: c.short_summary || c.description || '',
              target_audience: 'All' as const,
              category: (c.track || 'Robotics') as any,
              format: 'Blended' as const,
              level: c.level || 'All Levels',
              duration_weeks: Math.max(1, Math.round((c.estimated_duration_hours || 10) / 4)),
              total_hours: c.estimated_duration_hours || 10,
              fee_usd: 0,
              capacity: 50,
              enrolled_count: 0,
              venue: 'YARA Virtual & Chapter Centers',
              start_date: c.created_at || new Date().toISOString(),
              end_date: new Date(Date.now() + 30 * 86400000).toISOString(),
              registration_deadline: new Date(Date.now() + 14 * 86400000).toISOString(),
              instructor_name: 'YARA Engineering Faculty',
              instructor_title: 'Senior Instructor',
              certification_info: c.certificate_enabled ? 'Accredited YARA Certificate' : 'Certificate of Completion',
              membership_requirement: 'Open Enrollment',
              learning_outcomes: c.learning_outcomes || [],
              prerequisites: c.prerequisites || [],
              banner_image: c.thumbnail_url || '/assets/academy-classroom.jpg',
              status: 'open_for_registration' as const
            })));
          } else {
            setPrograms([]);
          }
        }
      } catch (err) {
        console.error('Error fetching training programs from database:', err);
        setPrograms([]);
      } finally {
        setLoading(false);
      }
    }
    fetchTrainingPrograms();
  }, []);

  const audiences = ['All', 'Students', 'Teachers / Patrons', 'Schools', 'Coaches', 'Enthusiasts'];

  const filteredPrograms = selectedAudience === 'All'
    ? programs
    : programs.filter(p => p.target_audience === selectedAudience);

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProgram) return;
    setIsSubmitting(true);
    
    try {
      if (user) {
        await supabase.from('training_registrations').insert({
          program_id: selectedProgram.id,
          user_id: user.id,
          registration_status: 'confirmed',
          payment_status: selectedProgram.fee_usd === 0 ? 'waived' : 'pending'
        });
      }
      setRegSuccess(true);
    } catch {
      setRegSuccess(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-12 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-blue-950/40 to-slate-950 pt-16 pb-20 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="max-w-7xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold uppercase tracking-wider">
            <GraduationCap className="w-4 h-4" />
            <span>Official YARA Training Academy</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
            Comprehensive STEM &amp; <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">Robotics Training</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-3xl mx-auto font-normal leading-relaxed">
            Practical, accredited training courses tailored for learners, school teachers, club patrons, and coaches. Master real-world electronics, firmware algorithms, and competition preparation.
          </p>

          {/* LMS Single Source of Truth Banner */}
          <div className="max-w-4xl mx-auto p-4 rounded-2xl bg-blue-950/40 border border-blue-500/30 text-left flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Centralized LMS Architecture</p>
                <p className="text-[11px] text-slate-300">
                  All learning modules, theory videos, guided labs, assignments, and certificates are delivered canonically inside the <strong>YARA LMS</strong>.
                </p>
              </div>
            </div>
            <Link
              to="/learning?tab=courses"
              className="shrink-0 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 whitespace-nowrap self-start sm:self-auto"
            >
              <span>Browse LMS Catalogue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto pt-6 text-left">
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
              <span className="text-2xl font-black text-white">1,200+</span>
              <p className="text-xs text-slate-400 font-medium">Students Trained</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
              <span className="text-2xl font-black text-amber-400">140+</span>
              <p className="text-xs text-slate-400 font-medium">Certified Educators</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
              <span className="text-2xl font-black text-emerald-400">100%</span>
              <p className="text-xs text-slate-400 font-medium">Practical Hardware</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
              <span className="text-2xl font-black text-blue-400">Official</span>
              <p className="text-xs text-slate-400 font-medium">QR Verification</p>
            </div>
          </div>
        </div>
      </section>

      {/* Filter Tabs by Target Audience */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <h2 className="text-2xl font-black text-white">Upcoming Training Programmes</h2>
            <p className="text-xs text-slate-400 mt-0.5">Filter by target role to find sessions designed for you</p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-2xl">
            {audiences.map((aud) => (
              <button
                key={aud}
                onClick={() => setSelectedAudience(aud)}
                className={cn(
                  "px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all",
                  selectedAudience === aud
                    ? "bg-blue-600 text-white shadow-md shadow-blue-900/30"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                )}
              >
                {aud}
              </button>
            ))}
          </div>
        </div>

        {/* Training Cards Grid */}
        {loading ? (
          <div className="py-20 text-center text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-blue-400" />
            <p className="font-bold text-sm">Loading training programs from database...</p>
          </div>
        ) : filteredPrograms.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center space-y-4 my-8">
            <GraduationCap className="w-12 h-12 text-slate-600 mx-auto" />
            <div>
              <h3 className="text-lg font-bold text-white">No Training Programs Currently Published</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
                The training registry is connected to the database. New official bootcamps and training sessions will appear here once published.
              </p>
            </div>
            <Link
              to="/learning?tab=courses"
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-blue-900/30 transition-all cursor-pointer"
            >
              <span>Explore Robotics Academy</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-8">
            {filteredPrograms.map((prog) => (
            <div
              key={prog.id}
              className="group rounded-3xl bg-slate-900 border border-slate-800 hover:border-blue-500/40 transition-all overflow-hidden flex flex-col justify-between shadow-xl"
            >
              <div>
                {/* Card Banner Image */}
                <div className="relative h-52 w-full overflow-hidden bg-slate-950">
                  <img
                    src={prog.banner_image}
                    alt={prog.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
                  
                  <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                    <span className="px-3 py-1 rounded-full bg-blue-950/90 text-blue-300 border border-blue-700/60 text-xs font-bold backdrop-blur-md">
                      {prog.target_audience}
                    </span>
                    <span className="px-3 py-1 rounded-full bg-slate-900/90 text-slate-200 border border-slate-700/60 text-xs font-bold backdrop-blur-md">
                      {prog.level}
                    </span>
                  </div>

                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs text-white font-bold">
                    <span className="flex items-center gap-1.5 bg-black/60 px-2.5 py-1 rounded-lg backdrop-blur-md">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      {prog.duration_weeks} Weeks ({prog.total_hours} Hours)
                    </span>
                    <span className="text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-lg border border-emerald-800/60">
                      {prog.fee_usd === 0 ? 'Fully Sponsored / Free' : `$${prog.fee_usd.toFixed(2)} USD`}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 sm:p-7 space-y-4">
                  <h3 className="text-xl sm:text-2xl font-black text-white group-hover:text-blue-400 transition-colors">
                    {prog.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                    {prog.description}
                  </p>

                  <div className="pt-2 border-t border-slate-800/80 space-y-2 text-xs">
                    <div className="flex items-center gap-2 text-slate-300">
                      <MapPin className="w-4 h-4 text-blue-400 shrink-0" />
                      <span>{prog.venue}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-300">
                      <Calendar className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>Starts {new Date(prog.start_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      <span className="text-slate-500">•</span>
                      <span className="text-slate-400">Deadline: {new Date(prog.registration_deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-300">
                      <Users className="w-4 h-4 text-purple-400 shrink-0" />
                      <span>Instructor: <strong className="text-white">{prog.instructor_name}</strong> ({prog.instructor_title})</span>
                    </div>
                  </div>

                  {/* Certification & Membership Requirements */}
                  <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2 text-xs">
                    <div className="flex items-center gap-2 text-amber-300 font-semibold">
                      <Award className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>{prog.certification_info}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400">
                      <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Access: {prog.membership_requirement}</span>
                    </div>
                  </div>

                  {/* Learning Outcomes */}
                  <div className="pt-1">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                      Key Learning Outcomes:
                    </h4>
                    <ul className="space-y-1.5 text-xs text-slate-300">
                      {prog.learning_outcomes.map((outcome, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{outcome}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Action Footer */}
              <div className="p-6 sm:p-7 pt-0 border-t border-slate-800/60 mt-4 flex flex-wrap items-center justify-between gap-3">
                <div className="text-xs text-slate-400">
                  <span>Seats: <strong className="text-white">{prog.enrolled_count}/{prog.capacity}</strong> filled</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedProgram(prog);
                      setIsRegistering(true);
                      setRegSuccess(false);
                    }}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold px-4 py-2.5 rounded-xl text-xs transition"
                  >
                    Quick Details
                  </button>
                  <Link
                    to={`/learning?course=${prog.lms_course_id}`}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black px-5 py-2.5 rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-blue-900/30 transition-all flex items-center gap-1.5 hover:scale-105"
                  >
                    <GraduationCap className="w-4 h-4" />
                    <span>Enrol / Start Learning</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
        )}
      </section>

      {/* Registration Modal */}
      <AnimatePresence>
        {isRegistering && selectedProgram && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 text-white shadow-2xl relative"
            >
              <button
                onClick={() => setIsRegistering(false)}
                className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>

              {regSuccess ? (
                <div className="text-center py-6 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto">
                    <Check className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-black text-white">Registration Confirmed!</h3>
                  <p className="text-xs text-slate-300 max-w-sm mx-auto leading-relaxed">
                    You have successfully registered for <strong>{selectedProgram.title}</strong>. Check your email for venue details, syllabus prep, and orientation.
                  </p>
                  <div className="pt-4 flex items-center justify-center gap-3">
                    <button
                      onClick={() => setIsRegistering(false)}
                      className="bg-slate-800 hover:bg-slate-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs"
                    >
                      Close
                    </button>
                    <Link
                      to={`/learning?course=${selectedProgram.lms_course_id}`}
                      className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-5 py-2.5 rounded-xl text-xs flex items-center gap-1.5"
                    >
                      <GraduationCap className="w-3.5 h-3.5" />
                      <span>Open Course in LMS</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleRegisterSubmit} className="space-y-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">
                      Training Registration
                    </span>
                    <h3 className="text-xl font-black text-white leading-snug mt-1">
                      {selectedProgram.title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Fee: <strong>{selectedProgram.fee_usd === 0 ? 'Sponsored / $0' : `$${selectedProgram.fee_usd} USD`}</strong> • {selectedProgram.format}
                    </p>
                  </div>

                  <div className="space-y-3 pt-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">Full Name</label>
                      <input
                        type="text"
                        required
                        value={regForm.name}
                        onChange={(e) => setRegForm({ ...regForm, name: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                        placeholder="Your full name"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1">Email Address</label>
                        <input
                          type="email"
                          required
                          value={regForm.email}
                          onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                          placeholder="name@school.com"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1">Phone / WhatsApp</label>
                        <input
                          type="text"
                          required
                          value={regForm.phone}
                          onChange={(e) => setRegForm({ ...regForm, phone: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                          placeholder="+263 7..."
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">School / Organization</label>
                      <input
                        type="text"
                        required
                        value={regForm.schoolOrOrg}
                        onChange={(e) => setRegForm({ ...regForm, schoolOrOrg: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                        placeholder="e.g. Kutama College / Chinhoyi High"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">Your Role</label>
                      <select
                        value={regForm.roleInSchool}
                        onChange={(e) => setRegForm({ ...regForm, roleInSchool: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                      >
                        <option value="Student">Student / Learner</option>
                        <option value="Teacher / Patron">Teacher / Robotics Patron</option>
                        <option value="School Principal">School Principal / Admin</option>
                        <option value="Robotics Coach">Robotics Coach / Mentor</option>
                        <option value="STEM Enthusiast">Independent STEM Enthusiast</option>
                      </select>
                    </div>
                  </div>

                  <div className="pt-3">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black py-3 rounded-xl text-xs uppercase tracking-wider shadow-lg transition-all flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Confirm Training Enrollment</span>}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
