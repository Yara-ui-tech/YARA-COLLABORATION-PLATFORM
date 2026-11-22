import React, { useState, useEffect } from 'react';
import { 
  Bot, 
  Cpu, 
  Award, 
  GraduationCap, 
  School, 
  FileCheck2, 
  BookOpen, 
  ArrowRight, 
  CheckCircle2, 
  Star, 
  Zap, 
  Clock, 
  DollarSign, 
  Plus, 
  Trash2, 
  Users, 
  Sparkles, 
  MapPin, 
  Calendar, 
  ShieldCheck, 
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Download,
  AlertCircle,
  HelpCircle,
  Package
} from 'lucide-react';
import { useAuth } from '../../AuthContext';
import { 
  roboticsTrainingService, 
  ROBOTICS_PROGRAMMES_CATALOG, 
  ROBOTICS_PATHWAYS_CATALOG,
  CORE_ROBOTICS_LEVEL_IDS
} from '../../../services/roboticsTrainingService';
import { 
  RoboticsProgrammeId, 
  RoboticsCertificationLevelId, 
  TrainingLocationOption, 
  StudentGroupEntry, 
  RoboticsLearningPassport 
} from '../../../types/roboticsTraining';
import { RoboticsDigitalCertificateModal } from './RoboticsDigitalCertificateModal';
import { RoboticsTrainerExamModal } from './RoboticsTrainerExamModal';

export type RoboticsSubTab = 
  | 'overview' 
  | 'programmes' 
  | 'pathways' 
  | 'teachers' 
  | 'schools' 
  | 'enrolment' 
  | 'passport';

interface Props {
  initialSubTab?: RoboticsSubTab;
  onNavigateTab?: (tab: any) => void;
}

export const RoboticsTrainingSection: React.FC<Props> = ({
  initialSubTab = 'overview',
  onNavigateTab
}) => {
  const { user, profile } = useAuth();
  const [activeSubTab, setActiveSubTab] = useState<RoboticsSubTab>(initialSubTab);

  // Enrolment Form State
  const [enrolmentType, setEnrolmentType] = useState<'individual' | 'parent_guardian' | 'school_group'>('individual');
  const [selectedProgrammeId, setSelectedProgrammeId] = useState<RoboticsProgrammeId>('curriculum_primary');
  const [selectedLevelId, setSelectedLevelId] = useState<RoboticsCertificationLevelId>('level_2_junior');
  const [primaryContactName, setPrimaryContactName] = useState(profile?.display_name || '');
  const [primaryContactEmail, setPrimaryContactEmail] = useState(user?.email || '');
  const [primaryContactPhone, setPrimaryContactPhone] = useState(profile?.phone || profile?.contact_phone || '');
  const [parentName, setParentName] = useState('');
  const [schoolOrChapterName, setSchoolOrChapterName] = useState(profile?.institution || profile?.school_institution || '');
  const [gradeLevel, setGradeLevel] = useState('Grade 5 (Primary)');
  const [locationOption, setLocationOption] = useState<TrainingLocationOption>('school_lab');
  const [preferredSchedule, setPreferredSchedule] = useState<'weekday_afternoon' | 'saturday_morning' | 'holiday_intensive' | 'custom'>('weekday_afternoon');
  const [includeHardwareKit, setIncludeHardwareKit] = useState(false);

  // Group Multi-Student Entry List
  const [studentsList, setStudentsList] = useState<StudentGroupEntry[]>([
    { id: 'st_1', fullName: '', ageOrGrade: '', gender: 'boy' }
  ]);

  // Teacher Form State
  const [teacherForm, setTeacherForm] = useState({
    name: profile?.display_name || '',
    email: user?.email || '',
    phone: profile?.phone || '',
    schoolName: profile?.institution || '',
    subject: 'Computer Science & STEM',
    province: 'Harare',
    city: 'Harare',
    includeKit: true
  });

  // School Partnership Form State
  const [schoolForm, setSchoolForm] = useState({
    schoolName: '',
    contactPerson: profile?.display_name || '',
    contactRole: 'Head of Science / Club Patron',
    email: user?.email || '',
    phone: '',
    province: 'Harare',
    city: 'Harare',
    schoolType: 'combined' as const,
    estimatedLearners: 45,
    hasLab: true,
    startDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
    offerings: [
      'curriculum_training', 
      'weekly_robotics_club', 
      'teacher_training'
    ] as any[],
    message: ''
  });

  // Learning Passport State
  const [passport, setPassport] = useState<RoboticsLearningPassport | null>(null);
  const [loadingPassport, setLoadingPassport] = useState(false);

  // Certificate Modal State
  const [selectedCert, setSelectedCert] = useState<{
    number: string;
    title: string;
    grade: string;
  } | null>(null);

  // Trainer Examination Modal State
  const [isTrainerExamOpen, setIsTrainerExamOpen] = useState(false);
  const [trainerEligibility, setTrainerEligibility] = useState<{
    isEligible: boolean;
    totalCompleted: number;
    completedLevels: RoboticsCertificationLevelId[];
  }>({
    isEligible: false,
    totalCompleted: 0,
    completedLevels: []
  });

  // Toast notice
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (activeSubTab === 'passport') {
      loadPassport();
    }
    if (activeSubTab === 'pathways') {
      loadTrainerEligibility();
    }
  }, [activeSubTab, user?.id]);

  const loadTrainerEligibility = async () => {
    try {
      const data = await roboticsTrainingService.checkTrainerEligibility(user?.id);
      setTrainerEligibility({
        isEligible: data.isEligible,
        totalCompleted: data.totalCompleted,
        completedLevels: data.completedLevels
      });
    } catch {}
  };

  const loadPassport = async () => {
    setLoadingPassport(true);
    try {
      const data = await roboticsTrainingService.getLearningPassport(
        user?.id,
        profile?.display_name || 'YARA Learner',
        profile?.institution || 'St. George’s Robotics Chapter'
      );
      setPassport(data);
    } catch (err) {
      console.error('Failed to load passport', err);
    } finally {
      setLoadingPassport(false);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Add / remove student in group registration
  const handleAddStudent = () => {
    setStudentsList(prev => [
      ...prev,
      { id: 'st_' + (prev.length + 1) + '_' + Date.now().toString(36), fullName: '', ageOrGrade: gradeLevel, gender: 'boy' }
    ]);
  };

  const handleRemoveStudent = (index: number) => {
    if (studentsList.length <= 1) return;
    setStudentsList(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpdateStudent = (index: number, field: keyof StudentGroupEntry, value: string) => {
    setStudentsList(prev => prev.map((item, i) => i === index ? { ...item, [field]: value } : item));
  };

  // Dynamic fee calculation
  const learnerCount = enrolmentType === 'school_group' ? Math.max(1, studentsList.length) : 1;
  const feeCalculation = roboticsTrainingService.calculateEnrolmentFee(
    selectedProgrammeId,
    learnerCount,
    includeHardwareKit,
    selectedLevelId
  );

  // Submit Enrolment
  const handleEnrolmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const prog = roboticsTrainingService.getProgrammeById(selectedProgrammeId);
      const cleanStudents = enrolmentType === 'school_group'
        ? studentsList.filter(s => s.fullName.trim() !== '')
        : [{ id: 'st_solo', fullName: primaryContactName, ageOrGrade: gradeLevel }];

      await roboticsTrainingService.submitEnrolment({
        userId: user?.id,
        enrolmentType,
        primaryContactName,
        primaryContactEmail,
        primaryContactPhone,
        parentOrGuardianName: enrolmentType === 'parent_guardian' ? parentName : undefined,
        schoolOrChapterName: schoolOrChapterName || 'Independent YARA Chapter',
        gradeOrEducationLevel: gradeLevel,
        programmeId: selectedProgrammeId,
        programmeTitle: prog?.title || 'Robotics & Engineering Programme',
        certificationLevelId: selectedLevelId,
        locationOption,
        preferredSchedule,
        studentsList: cleanStudents,
        learnerCount: Math.max(1, cleanStudents.length),
        calculatedFee: feeCalculation.calculatedFee,
        includeHardwareKit,
        hardwareKitFee: feeCalculation.hardwareKitFee,
        totalPayableAmount: feeCalculation.totalPayable,
        paymentStatus: 'pending',
        enrolmentStatus: 'submitted'
      });

      showToast(`Enrolment successfully submitted for ${cleanStudents.length} learner(s)!`);
      setActiveSubTab('passport');
      loadPassport();
    } catch (err) {
      console.error('Enrolment submission failed', err);
    } finally {
      setSubmitting(false);
    }
  };

  // Submit Teacher Registration
  const handleTeacherSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await roboticsTrainingService.registerTeacher({
        userId: user?.id,
        teacherName: teacherForm.name,
        email: teacherForm.email,
        phone: teacherForm.phone,
        schoolName: teacherForm.schoolName,
        subjectTaught: teacherForm.subject,
        province: teacherForm.province,
        city: teacherForm.city,
        purchasedRoboticsKit: teacherForm.includeKit,
        paymentStatus: 'pending'
      });
      showToast('Teacher Professional Development registration confirmed!');
    } catch (err) {
      console.error('Teacher registration error', err);
    } finally {
      setSubmitting(false);
    }
  };

  // Submit School Partnership Request
  const handleSchoolPartnershipSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await roboticsTrainingService.submitPartnershipRequest({
        schoolName: schoolForm.schoolName,
        contactPersonName: schoolForm.contactPerson,
        contactRole: schoolForm.contactRole,
        email: schoolForm.email,
        phone: schoolForm.phone,
        province: schoolForm.province,
        city: schoolForm.city,
        schoolType: schoolForm.schoolType,
        estimatedLearners: schoolForm.estimatedLearners,
        requestedOfferings: schoolForm.offerings,
        hasExistingLab: schoolForm.hasLab,
        preferredStartDate: schoolForm.startDate,
        additionalMessage: schoolForm.message
      });
      showToast('School partnership inquiry submitted! An academic director will contact you.');
    } catch (err) {
      console.error('School partnership error', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleTriggerEnrolProgramme = (progId: RoboticsProgrammeId) => {
    setSelectedProgrammeId(progId);
    setActiveSubTab('enrolment');
    window.scrollTo({ top: 350, behavior: 'smooth' });
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Toast Banner */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-[#0A1B4D] text-white px-5 py-3 rounded-2xl shadow-2xl border border-[#00C6FF]/40 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-[#00C6FF] shrink-0" />
          <span className="text-xs sm:text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* TOP SUB-NAVIGATION */}
      <div className="bg-white rounded-2xl border border-slate-200 p-2 shadow-xs flex items-center justify-between gap-1 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveSubTab('overview')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
            activeSubTab === 'overview'
              ? 'bg-[#0D47A1] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Bot className="w-4 h-4 text-[#00C6FF]" />
          Overview
        </button>

        <button
          onClick={() => setActiveSubTab('programmes')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
            activeSubTab === 'programmes'
              ? 'bg-[#0D47A1] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Training Programmes
        </button>

        <button
          onClick={() => setActiveSubTab('pathways')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
            activeSubTab === 'pathways'
              ? 'bg-[#0D47A1] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Award className="w-4 h-4" />
          Certification Pathways
        </button>

        <button
          onClick={() => setActiveSubTab('teachers')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
            activeSubTab === 'teachers'
              ? 'bg-[#0D47A1] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          Teacher Development
        </button>

        <button
          onClick={() => setActiveSubTab('schools')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
            activeSubTab === 'schools'
              ? 'bg-[#0D47A1] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <School className="w-4 h-4" />
          School Partnerships
        </button>

        <button
          onClick={() => setActiveSubTab('enrolment')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
            activeSubTab === 'enrolment'
              ? 'bg-[#0D47A1] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-500" />
          Learner Enrolment
        </button>

        <button
          onClick={() => setActiveSubTab('passport')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
            activeSubTab === 'passport'
              ? 'bg-gradient-to-r from-blue-700 to-indigo-700 text-white shadow-xs'
              : 'text-[#0D47A1] hover:bg-blue-50'
          }`}
        >
          <FileCheck2 className="w-4 h-4 text-emerald-400" />
          My Learning Passport
        </button>
      </div>

      {/* ===================================================================== */}
      {/* 1. OVERVIEW SUB-PAGE */}
      {/* ===================================================================== */}
      {activeSubTab === 'overview' && (
        <div className="space-y-10 animate-fade-in">
          {/* Hero Banner */}
          <div className="rounded-3xl bg-[#0A1B4D] text-white p-8 sm:p-12 relative overflow-hidden shadow-xl border border-[#0D47A1]/40">
            <div className="absolute -right-12 -bottom-12 w-96 h-96 bg-[#00C6FF]/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 max-w-3xl space-y-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1976D2]/30 border border-[#00C6FF]/40 text-[#00C6FF] text-xs font-bold uppercase tracking-wider">
                <Bot className="w-4 h-4" />
                YARA Academy Official Programme
              </div>
              <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
                YARA Robotics & Engineering Academy
              </h1>
              <p className="text-lg sm:text-xl text-blue-100 font-medium">
                “Developing Tomorrow’s Engineers, Innovators and Technology Leaders.”
              </p>
              <p className="text-xs sm:text-sm text-blue-200/90 leading-relaxed">
                YARA provides end-to-end robotics education from early childhood development (ECD) to tertiary level through practical, structured, and age-appropriate laboratory programmes. Our curriculum equips African youths with the hands-on mastery needed to design, code, build, and deploy innovative autonomous machines.
              </p>
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <button
                  onClick={() => setActiveSubTab('programmes')}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#00C6FF] to-[#1976D2] hover:from-[#1976D2] hover:to-[#0D47A1] text-white font-extrabold text-xs uppercase tracking-wider shadow-lg transition"
                >
                  Explore Programmes & Pricing
                </button>
                <button
                  onClick={() => setActiveSubTab('enrolment')}
                  className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition"
                >
                  Register Students Now
                </button>
              </div>
            </div>
          </div>

          {/* 6 Core Curriculum Pillars */}
          <div>
            <div className="text-center max-w-2xl mx-auto mb-8">
              <h2 className="text-2xl font-black text-[#0A1B4D]">
                Comprehensive STEM & Engineering Pillars
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Structured across 6 integrated learning domains taught by experienced robotics mentors and engineers.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  title: '1. Robotics & Electronics',
                  desc: 'Circuit fundamentals, breadboard prototyping, Ohm’s law, diodes, transistors, and safe electrical benchwork.',
                  icon: Cpu,
                  color: 'text-sky-600 bg-sky-50 border-sky-200'
                },
                {
                  title: '2. Programming & Microcontrollers',
                  desc: 'Visual Scratch block algorithms to embedded C++, Python, Arduino, ESP32, and register-level firmware.',
                  icon: Zap,
                  color: 'text-indigo-600 bg-indigo-50 border-indigo-200'
                },
                {
                  title: '3. Engineering & Robot Construction',
                  desc: 'Mechanical assemblies, chassis balancing, gear ratios, torque calculation, 3D CAD modeling, and laser cutting.',
                  icon: Bot,
                  color: 'text-blue-600 bg-blue-50 border-blue-200'
                },
                {
                  title: '4. Automation & Control Systems',
                  desc: 'Ultrasonic sonar, infrared line tracking, closed-loop PID algorithms, servo kinematics, and motor drivers.',
                  icon: TrendingUp,
                  color: 'text-purple-600 bg-purple-50 border-purple-200'
                },
                {
                  title: '5. Innovation & Practical Projects',
                  desc: '5 Whys root-cause problem identification, real-world community solutions, agriculture robotics, and health bots.',
                  icon: Sparkles,
                  color: 'text-amber-600 bg-amber-50 border-amber-200'
                },
                {
                  title: '6. Robotics Competitions & Trials',
                  desc: 'Autonomous maze trials, precision line-following courses, underwater ROV tank trials, and innovation defenses.',
                  icon: Award,
                  color: 'text-emerald-600 bg-emerald-50 border-emerald-200'
                }
              ].map((pillar, i) => {
                const Icon = pillar.icon;
                return (
                  <div key={i} className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-[#1976D2]/60 transition">
                    <div className={`w-12 h-12 rounded-xl border flex items-center justify-center mb-4 ${pillar.color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-bold text-[#0A1B4D] mb-1.5">{pillar.title}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">{pillar.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Enrolment Teaser */}
          <div className="p-8 rounded-3xl bg-[#E8F4FF] border border-[#1976D2]/30 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-[#0D47A1] uppercase tracking-wider">
                Flexible Delivery Options
              </span>
              <h3 className="text-xl font-black text-[#0A1B4D]">
                Bring YARA Robotics to Your School or Chapter
              </h3>
              <p className="text-xs text-slate-600 max-w-xl">
                We provide certified instructors, hardware kits, competition arenas, and accredited digital certificates directly to your school lab or community center.
              </p>
            </div>
            <button
              onClick={() => setActiveSubTab('schools')}
              className="px-6 py-3 rounded-xl bg-[#0D47A1] hover:bg-[#0A1B4D] text-white font-bold text-xs shadow-md transition shrink-0"
            >
              School Partnership Inquiry
            </button>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 2. TRAINING PROGRAMMES SUB-PAGE */}
      {/* ===================================================================== */}
      {activeSubTab === 'programmes' && (
        <div className="space-y-8 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-black text-[#0A1B4D]">Official Training Programmes</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Transparent fees and curriculum choices designed for schools, clubs, weekend workshops, and holiday intensives.
              </p>
            </div>
            <button
              onClick={() => setActiveSubTab('enrolment')}
              className="px-5 py-2.5 rounded-xl bg-[#0D47A1] hover:bg-[#0A1B4D] text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              Open Enrolment Form
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ROBOTICS_PROGRAMMES_CATALOG.map((prog) => (
              <div 
                key={prog.id} 
                className={`rounded-3xl bg-white border p-6 shadow-sm flex flex-col justify-between transition-all hover:shadow-md ${
                  prog.isPopular ? 'border-[#1976D2] ring-2 ring-[#1976D2]/20' : 'border-slate-200'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span className="px-3 py-1 rounded-full bg-[#E8F4FF] text-[#0D47A1] font-black text-xs">
                      {prog.badge}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-400 capitalize">
                      {prog.category}
                    </span>
                  </div>

                  <h3 className="text-lg font-black text-[#0A1B4D] mb-1">{prog.title}</h3>
                  <div className="text-xs text-slate-500 mb-3">
                    <strong>Target:</strong> {prog.targetAudience} • {prog.ageRange}
                  </div>
                  <p className="text-xs text-slate-600 mb-4 leading-relaxed">{prog.description}</p>

                  <div className="space-y-1.5 mb-5 pt-3 border-t border-slate-100">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Programme Highlights
                    </span>
                    {prog.features.map((feat, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-slate-700">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <div className="text-xs text-slate-400 font-medium">Standard Fee</div>
                    <div className="text-xl font-black text-[#0A1B4D]">
                      ${prog.feePerLearner}
                      <span className="text-xs text-slate-500 font-normal">
                        {prog.feeStructure === 'per_session' ? ' / session' : prog.feeStructure === 'per_lesson' ? ' / lesson' : ' / complete'}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleTriggerEnrolProgramme(prog.id)}
                    className="px-4 py-2 rounded-xl bg-[#0D47A1] hover:bg-[#0A1B4D] text-white font-bold text-xs transition shadow-sm flex items-center gap-1"
                  >
                    <span>Enrol</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 3. CERTIFICATION PATHWAYS SUB-PAGE */}
      {/* ===================================================================== */}
      {activeSubTab === 'pathways' && (
        <div className="space-y-8 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-[#0D47A1] border border-blue-200 text-xs font-bold uppercase mb-1">
                <Award className="w-3.5 h-3.5" />
                4 Core Robotics Levels + Trainer Credential
              </div>
              <h2 className="text-2xl font-black text-[#0A1B4D]">Visual Robotics Certification Pathways</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                All 4 foundational robotics levels are fully certifiable with official YARA Digital Credentials upon module completion and capstone defense.
              </p>
            </div>

            <button
              onClick={() => setIsTrainerExamOpen(true)}
              className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg transition flex items-center gap-2 self-start sm:self-auto cursor-pointer"
            >
              <Award className="w-4 h-4" />
              <span>Trainer &amp; Mentor Qualification</span>
            </button>
          </div>

          {/* Visual Progression Pipeline Banner */}
          <div className="p-6 rounded-3xl bg-slate-900 text-white overflow-hidden shadow-lg border border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <div className="text-xs font-bold uppercase tracking-widest text-[#00C6FF]">
                The 4 Certifiable Robotics Milestones
              </div>
              <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                100% Certifiable
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              {[
                { level: 'Level 1', name: 'Robotics Explorer', age: 'ECD / Infants', req: '10 Lessons ($50)', cert: 'Explorer Certificate' },
                { level: 'Level 2', name: 'Junior Robotics', age: 'Grades 3 – 7', req: '10 Lessons ($50)', cert: 'Junior Certificate' },
                { level: 'Level 3', name: 'Secondary Robotics', age: 'High School', req: '12 Sessions ($60)', cert: 'Secondary Certificate' },
                { level: 'Level 4', name: 'Advanced Robotics', age: 'Tertiary & Capstone', req: 'Engineering Defense', cert: 'Engineering Certificate' }
              ].map((step, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-white/5 border border-white/10 relative">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-[#00C6FF] uppercase">{step.level}</span>
                    <Award className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <div className="text-sm font-extrabold text-white mt-1">{step.name}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">{step.age}</div>
                  <div className="text-[10px] text-emerald-400 font-semibold mt-2">{step.req}</div>
                  <div className="mt-2 pt-2 border-t border-white/10 text-[10px] text-blue-200 font-medium">
                    🏆 {step.cert}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 4 CORE ROBOTICS LEVEL CARDS */}
          <div className="space-y-6">
            {ROBOTICS_PATHWAYS_CATALOG.filter(p => p.id !== 'yara_certified_trainer_mentor').map((pathway) => (
              <div 
                key={pathway.id}
                className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6 hover:border-[#1976D2]/50 transition"
              >
                <div className="max-w-2xl space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-[#E8F4FF] text-[#0D47A1] font-black text-xs">
                      Level {pathway.levelNumber}
                    </span>
                    <span className="text-xs font-bold text-slate-500">
                      Target: {pathway.targetAudience}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                      <Award className="w-3 h-3 text-emerald-600" />
                      Certificable Pathway
                    </span>
                    {pathway.isProvisionalPricing && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-800">
                        Provisional Pricing
                      </span>
                    )}
                  </div>

                  <h3 className="text-xl font-black text-[#0A1B4D]">{pathway.levelTitle}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{pathway.description}</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                    {pathway.learningOutcomes.map((out, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-slate-700">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#1976D2] shrink-0 mt-0.5" />
                        <span>{out}</span>
                      </div>
                    ))}
                  </div>

                  <div className="text-xs text-slate-500 pt-2 border-t border-slate-100 flex flex-wrap items-center gap-4">
                    <div>
                      <strong>Sample Project Milestone:</strong> {pathway.sampleProject}
                    </div>
                    {pathway.prerequisites && (
                      <div className="text-indigo-600 font-semibold">
                        <strong>Prerequisite:</strong> {pathway.prerequisites}
                      </div>
                    )}
                  </div>
                </div>

                <div className="lg:w-64 p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between shrink-0 space-y-4">
                  <div>
                    <div className="text-[11px] font-bold text-slate-400 uppercase">Requirements</div>
                    <div className="text-xs font-semibold text-slate-700 mt-1">
                      {pathway.minimumRequirements}
                    </div>
                  </div>

                  <div>
                    <div className="text-[11px] font-bold text-slate-400 uppercase">Pricing</div>
                    <div className="text-2xl font-black text-[#0A1B4D]">
                      ${pathway.minimumCost}
                      <span className="text-xs text-slate-500 font-normal"> min cost</span>
                    </div>
                    <div className="text-[11px] text-slate-500 font-medium">
                      ${pathway.feePerUnit} per session / lesson
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedLevelId(pathway.id);
                      setActiveSubTab('enrolment');
                    }}
                    className="w-full py-2.5 rounded-xl bg-[#0D47A1] hover:bg-[#0A1B4D] text-white font-bold text-xs transition shadow-sm text-center cursor-pointer"
                  >
                    Register for {pathway.levelTitle.split('–')[0]}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* PINNACLE QUALIFICATION: BECOME YARA CERTIFIED ROBOTICS TRAINER OR MENTOR */}
          <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-[#0A1B4D] via-[#0D47A1] to-[#0A1B4D] text-white shadow-2xl border-2 border-amber-400/40 relative overflow-hidden space-y-6">
            <div className="absolute -right-12 -top-12 w-80 h-80 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
              <div className="max-w-2xl space-y-3">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 text-xs font-extrabold uppercase tracking-wider">
                  <Award className="w-4 h-4 text-amber-400" />
                  Pinnacle Master Credential
                </div>

                <h3 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                  Become YARA Certified Robotics Trainer or Mentor
                </h3>

                <p className="text-xs sm:text-sm text-blue-100 leading-relaxed">
                  The highest operational robotics teaching qualification awarded by YARA. 
                  Strictly unlocks only for candidates who have completed <strong>all four foundational robotics levels</strong> (Explorer, Junior, Secondary, and Advanced). Candidates must pass our 20-question randomized pedagogical examination and submit verified proof of hands-on mentorship.
                </p>

                {/* 4 Levels Prerequisite Checklist */}
                <div className="pt-2">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-amber-300 mb-2">
                    Prerequisites Verification Status:
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: 'level_1_explorer' as RoboticsCertificationLevelId, title: 'Level 1: Explorer' },
                      { id: 'level_2_junior' as RoboticsCertificationLevelId, title: 'Level 2: Junior' },
                      { id: 'level_3_secondary' as RoboticsCertificationLevelId, title: 'Level 3: Secondary' },
                      { id: 'level_4_advanced' as RoboticsCertificationLevelId, title: 'Level 4: Advanced' }
                    ].map(l => {
                      const done = trainerEligibility.completedLevels.includes(l.id);
                      return (
                        <div key={l.id} className="p-2.5 rounded-xl bg-white/10 border border-white/10 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-white text-[11px]">{l.title}</span>
                            {done ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            ) : (
                              <Lock className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                            )}
                          </div>
                          <span className={`text-[10px] font-semibold mt-0.5 block ${done ? 'text-emerald-300' : 'text-slate-300'}`}>
                            {done ? 'Completed' : 'Required'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Action Column */}
              <div className="lg:w-72 p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex flex-col justify-between shrink-0 space-y-4 text-center sm:text-left">
                <div>
                  <div className="text-[10px] font-extrabold uppercase text-amber-300 tracking-wider">
                    Qualification Gate
                  </div>
                  <div className="text-xl font-black text-white mt-1">
                    Exam + Mentorship Proof
                  </div>
                  <p className="text-[11px] text-blue-200 mt-1">
                    Minimum 80% passing grade on the 20-question pedagogical exam + verification of coaching sessions.
                  </p>
                </div>

                <button
                  onClick={() => setIsTrainerExamOpen(true)}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-slate-950 font-black text-xs uppercase tracking-wider shadow-xl transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Award className="w-4 h-4" />
                  <span>Start Trainer Exam Suite</span>
                </button>

                <div className="text-[10px] text-slate-300 text-center">
                  Includes digital credential with online QR verification.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 4. TEACHER DEVELOPMENT SUB-PAGE */}
      {/* ===================================================================== */}
      {activeSubTab === 'teachers' && (
        <div className="space-y-8 animate-fade-in">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold uppercase mb-2">
              <GraduationCap className="w-3.5 h-3.5" />
              Teacher CPD Framework
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#0A1B4D]">
              Teacher Professional Development in Robotics
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Empowering primary, secondary, and tertiary educators to confidently lead school robotics clubs, teach syllabus coding, and coach competitive teams.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Info Card */}
            <div className="lg:col-span-1 space-y-4">
              <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
                <h3 className="text-base font-bold text-[#0A1B4D]">CPD Accreditation Structure</h3>
                <div className="space-y-3 text-xs text-slate-600">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span>Fee per session:</span>
                    <strong className="text-slate-900">$10 per session</strong>
                  </div>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span>Minimum training duration:</span>
                    <strong className="text-slate-900">5 Sessions ($50 minimum)</strong>
                  </div>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span>Optional Starter Hardware Kit:</span>
                    <strong className="text-slate-900">$50 personal kit</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Certificate Awarded:</span>
                    <strong className="text-emerald-700">YARA Certified Robotics Facilitator</strong>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-3xl bg-[#E8F4FF] border border-[#1976D2]/30 text-xs text-[#0D47A1] space-y-2">
                <span className="font-bold block text-sm">Classroom Kit Pack</span>
                <p>
                  Teachers who purchase the optional $50 kit receive their own Arduino/ESP32 experimentation set with sensors, breadboards, cables, and sample code libraries to practice at home.
                </p>
              </div>
            </div>

            {/* Registration Form */}
            <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
              <h3 className="text-lg font-bold text-[#0A1B4D] mb-4">
                Teacher Enrolment & Training Booking
              </h3>

              <form onSubmit={handleTeacherSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Teacher Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Tendai Chikore"
                      value={teacherForm.name}
                      onChange={(e) => setTeacherForm({ ...teacherForm, name: e.target.value })}
                      className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-200 bg-white text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      required
                      placeholder="teacher@school.ac.zw"
                      value={teacherForm.email}
                      onChange={(e) => setTeacherForm({ ...teacherForm, email: e.target.value })}
                      className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-200 bg-white text-slate-800"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">WhatsApp / Phone Number</label>
                    <input
                      type="tel"
                      required
                      placeholder="+263 77..."
                      value={teacherForm.phone}
                      onChange={(e) => setTeacherForm({ ...teacherForm, phone: e.target.value })}
                      className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-200 bg-white text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">School / Institution</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Churchill High School"
                      value={teacherForm.schoolName}
                      onChange={(e) => setTeacherForm({ ...teacherForm, schoolName: e.target.value })}
                      className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-200 bg-white text-slate-800"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Subject / Department</label>
                    <input
                      type="text"
                      placeholder="e.g. Mathematics, Science, ICT"
                      value={teacherForm.subject}
                      onChange={(e) => setTeacherForm({ ...teacherForm, subject: e.target.value })}
                      className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-200 bg-white text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Province / City</label>
                    <input
                      type="text"
                      placeholder="e.g. Harare, Bulawayo, Mutare"
                      value={teacherForm.city}
                      onChange={(e) => setTeacherForm({ ...teacherForm, city: e.target.value })}
                      className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-200 bg-white text-slate-800"
                    />
                  </div>
                </div>

                {/* Optional Hardware Kit Checkbox */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
                  <div>
                    <div className="text-xs font-bold text-[#0A1B4D]">Include Personal Robotics Hardware Starter Kit ($50)</div>
                    <div className="text-[11px] text-slate-500">Includes microcontroller, breadboard, motor chassis, sensors & USB connector.</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={teacherForm.includeKit}
                    onChange={(e) => setTeacherForm({ ...teacherForm, includeKit: e.target.checked })}
                    className="w-5 h-5 rounded text-[#0D47A1] focus:ring-[#1976D2]"
                  />
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <div className="text-xs text-slate-500">
                    Estimated Investment: <strong className="text-base font-black text-[#0A1B4D]">${teacherForm.includeKit ? '100' : '50'}</strong> (5 sessions + kit option)
                  </div>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2.5 rounded-xl bg-[#0D47A1] hover:bg-[#0A1B4D] text-white font-bold text-xs shadow-md transition"
                  >
                    {submitting ? 'Submitting...' : 'Register for CPD Training'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 5. SCHOOL PARTNERSHIPS SUB-PAGE */}
      {/* ===================================================================== */}
      {activeSubTab === 'schools' && (
        <div className="space-y-8 animate-fade-in">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-800 border border-blue-200 text-xs font-bold uppercase mb-2">
              <School className="w-3.5 h-3.5" />
              Institutional Alliances
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#0A1B4D]">
              School Partnership & Club Accreditation
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Partner with YARA to launch a vibrant robotics lab, integrate curriculum modules, and certify your learners under internationally competitive STEM benchmarks.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-1 space-y-4">
              <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3">
                <h4 className="text-sm font-bold text-[#0A1B4D]">What YARA Provides Partner Schools</h4>
                <div className="space-y-2 text-xs text-slate-600">
                  <div className="flex gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Complete primary or secondary robotics syllabus and lesson slides</span>
                  </div>
                  <div className="flex gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Vetted trainers and certified mentorship visits</span>
                  </div>
                  <div className="flex gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Hardware kits, obstacle arenas, and tank trial setups</span>
                  </div>
                  <div className="flex gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>School club branding, badges, and national championship qualification</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
              <h3 className="text-lg font-bold text-[#0A1B4D] mb-4">
                Institutional Partnership Application
              </h3>

              <form onSubmit={handleSchoolPartnershipSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Official School Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Prince Edward School"
                      value={schoolForm.schoolName}
                      onChange={(e) => setSchoolForm({ ...schoolForm, schoolName: e.target.value })}
                      className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-200 bg-white text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Contact Person Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Dr. M. Moyo (Headmaster / Patron)"
                      value={schoolForm.contactPerson}
                      onChange={(e) => setSchoolForm({ ...schoolForm, contactPerson: e.target.value })}
                      className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-200 bg-white text-slate-800"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Official School Email</label>
                    <input
                      type="email"
                      required
                      placeholder="admin@school.ac.zw"
                      value={schoolForm.email}
                      onChange={(e) => setSchoolForm({ ...schoolForm, email: e.target.value })}
                      className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-200 bg-white text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Direct Telephone / WhatsApp</label>
                    <input
                      type="tel"
                      required
                      placeholder="+263 242..."
                      value={schoolForm.phone}
                      onChange={(e) => setSchoolForm({ ...schoolForm, phone: e.target.value })}
                      className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-200 bg-white text-slate-800"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Province</label>
                    <input
                      type="text"
                      placeholder="e.g. Harare, Midlands"
                      value={schoolForm.province}
                      onChange={(e) => setSchoolForm({ ...schoolForm, province: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Estimated Learners</label>
                    <input
                      type="number"
                      min="5"
                      placeholder="40"
                      value={schoolForm.estimatedLearners}
                      onChange={(e) => setSchoolForm({ ...schoolForm, estimatedLearners: parseInt(e.target.value) || 10 })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-800 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Existing Lab Space?</label>
                    <select
                      value={schoolForm.hasLab ? 'yes' : 'no'}
                      onChange={(e) => setSchoolForm({ ...schoolForm, hasLab: e.target.value === 'yes' })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-800"
                    >
                      <option value="yes">Yes, Computer / Science Lab</option>
                      <option value="no">No, need portable setup</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">Requested Robotics Offerings</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {[
                      { id: 'curriculum_training', label: 'Curriculum-Based Robotics Syllabus' },
                      { id: 'weekly_robotics_club', label: 'Weekly Robotics Club Sessions ($5/session)' },
                      { id: 'monthly_workshops', label: 'Monthly Weekend Workshops' },
                      { id: 'holiday_bootcamps', label: 'Holiday Robotics Bootcamps' },
                      { id: 'teacher_training', label: 'Teacher CPD Training' },
                      { id: 'stem_competitions', label: 'STEM Competitions & Hackathons' }
                    ].map((item) => (
                      <label key={item.id} className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-slate-50/50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={schoolForm.offerings.includes(item.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSchoolForm({ ...schoolForm, offerings: [...schoolForm.offerings, item.id] });
                            } else {
                              setSchoolForm({ ...schoolForm, offerings: schoolForm.offerings.filter(o => o !== item.id) });
                            }
                          }}
                          className="rounded text-[#0D47A1]"
                        />
                        <span className="text-slate-800 font-medium">{item.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Additional Requirements / Objectives</label>
                  <textarea
                    rows={2}
                    placeholder="Describe timetable preferences, grade levels to prioritize..."
                    value={schoolForm.message}
                    onChange={(e) => setSchoolForm({ ...schoolForm, message: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-800"
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2.5 rounded-xl bg-[#0D47A1] hover:bg-[#0A1B4D] text-white font-bold text-xs shadow-md transition"
                  >
                    {submitting ? 'Submitting...' : 'Submit School Partnership Application'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 6. LEARNER ENROLMENT SUB-PAGE */}
      {/* ===================================================================== */}
      {activeSubTab === 'enrolment' && (
        <div className="space-y-8 animate-fade-in">
          <div>
            <h2 className="text-2xl font-black text-[#0A1B4D]">Learner Enrolment Portal</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Register individual students, parent-guided minors, or bulk school groups. Automatic fee calculations apply in real-time.
            </p>
          </div>

          <form onSubmit={handleEnrolmentSubmit} className="space-y-6">
            {/* Step 1: Enrolment Type Switcher */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-[#0A1B4D] uppercase tracking-wider">
                1. Select Registration Type
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { id: 'individual', title: 'Individual Learner', desc: 'Self-enrolment for independent students' },
                  { id: 'parent_guardian', title: 'Parent / Guardian', desc: 'Registering a minor under 18 years' },
                  { id: 'school_group', title: 'School / Group Roster', desc: 'Acquire registration for multiple learners' }
                ].map((type) => (
                  <div
                    key={type.id}
                    onClick={() => setEnrolmentType(type.id as any)}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition flex flex-col justify-between ${
                      enrolmentType === type.id
                        ? 'border-[#0D47A1] bg-[#E8F4FF]/50 text-[#0A1B4D]'
                        : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <div>
                      <div className="font-extrabold text-sm mb-1">{type.title}</div>
                      <div className="text-xs text-slate-500">{type.desc}</div>
                    </div>
                    <div className="mt-3 flex items-center gap-1.5 text-xs font-bold text-[#0D47A1]">
                      {enrolmentType === type.id && <CheckCircle2 className="w-4 h-4 text-[#1976D2]" />}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Step 2: Contact & School Information */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-[#0A1B4D] uppercase tracking-wider">
                2. Contact & Institution Details
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {enrolmentType === 'school_group' ? 'Teacher / Coordinator Name' : 'Primary Contact Name'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Full Name"
                    value={primaryContactName}
                    onChange={(e) => setPrimaryContactName(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="contact@email.com"
                    value={primaryContactEmail}
                    onChange={(e) => setPrimaryContactEmail(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">WhatsApp / Phone</label>
                  <input
                    type="tel"
                    required
                    placeholder="+263 77..."
                    value={primaryContactPhone}
                    onChange={(e) => setPrimaryContactPhone(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-800"
                  />
                </div>
              </div>

              {enrolmentType === 'parent_guardian' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Parent / Guardian Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Mrs. Chipo Moyo"
                      value={parentName}
                      onChange={(e) => setParentName(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Child’s Grade or Education Level</label>
                    <select
                      value={gradeLevel}
                      onChange={(e) => setGradeLevel(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-800 font-semibold"
                    >
                      <option value="ECD / Infants">ECD / Infants (Ages 4 – 6)</option>
                      <option value="Grades 1 – 2">Grades 1 – 2 (Early Primary)</option>
                      <option value="Grades 3 – 5">Grades 3 – 5 (Junior Primary)</option>
                      <option value="Grades 6 – 7">Grades 6 – 7 (Senior Primary)</option>
                      <option value="Forms 1 – 2">Forms 1 – 2 (Junior Secondary)</option>
                      <option value="Forms 3 – 4">Forms 3 – 4 (O-Level)</option>
                      <option value="Forms 5 – 6">Forms 5 – 6 (A-Level)</option>
                    </select>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">School / Chapter Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. St. George's College or YARA Innovation Chapter Harare"
                    value={schoolOrChapterName}
                    onChange={(e) => setSchoolOrChapterName(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Preferred Training Location</label>
                  <select
                    value={locationOption}
                    onChange={(e) => setLocationOption(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-800 font-semibold"
                  >
                    <option value="school_lab">On-site at School Computer / Science Lab</option>
                    <option value="yara_hub_harare">YARA Innovation Hub (Harare)</option>
                    <option value="bulawayo_center">Bulawayo Regional Innovation Center</option>
                    <option value="community_center">Local Community Chapter Center</option>
                    <option value="virtual_hybrid">Virtual / Hybrid Classroom with Kit</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Step 3: Multi-Student Names Entry (For School/Group Enrolment) */}
            {enrolmentType === 'school_group' && (
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-[#0A1B4D] uppercase tracking-wider">
                      3. Register Student Names & Grades ({studentsList.length} Learners)
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Add the names, grade levels, and guardian contacts for the students you are acquiring registration for.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddStudent}
                    className="px-3.5 py-1.5 rounded-xl bg-[#E8F4FF] hover:bg-[#1976D2] hover:text-white text-[#0D47A1] text-xs font-bold transition flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    Add Another Student
                  </button>
                </div>

                <div className="space-y-3">
                  {studentsList.map((st, index) => (
                    <div key={st.id || index} className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center gap-3">
                      <span className="font-bold text-xs text-[#0D47A1] w-6 shrink-0">
                        #{index + 1}
                      </span>
                      <input
                        type="text"
                        required
                        placeholder="Student Full Name"
                        value={st.fullName}
                        onChange={(e) => handleUpdateStudent(index, 'fullName', e.target.value)}
                        className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white text-slate-800"
                      />
                      <input
                        type="text"
                        placeholder="Grade (e.g. Grade 6 or Form 2)"
                        value={st.ageOrGrade}
                        onChange={(e) => handleUpdateStudent(index, 'ageOrGrade', e.target.value)}
                        className="w-32 px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white text-slate-800"
                      />
                      <select
                        value={st.gender || 'boy'}
                        onChange={(e) => handleUpdateStudent(index, 'gender', e.target.value)}
                        className="w-24 px-2 py-1.5 text-xs rounded-lg border border-slate-200 bg-white text-slate-800"
                      >
                        <option value="boy">Boy</option>
                        <option value="girl">Girl</option>
                        <option value="other">Other</option>
                      </select>
                      <input
                        type="tel"
                        placeholder="Parent Phone (optional)"
                        value={st.guardianPhone || ''}
                        onChange={(e) => handleUpdateStudent(index, 'guardianPhone', e.target.value)}
                        className="w-36 px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white text-slate-800"
                      />
                      {studentsList.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveStudent(index)}
                          className="p-1.5 text-slate-400 hover:text-red-600 transition"
                          title="Remove student from roster"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 4: Programme & Pathway Selection */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-[#0A1B4D] uppercase tracking-wider">
                {enrolmentType === 'school_group' ? '4' : '3'}. Select Training Programme & Certification
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Robotics Programme</label>
                  <select
                    value={selectedProgrammeId}
                    onChange={(e) => setSelectedProgrammeId(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-800 font-semibold"
                  >
                    <optgroup label="Curriculum-Based Programmes">
                      <option value="curriculum_primary">Curriculum-Based Robotics (Primary) – $25 Complete</option>
                      <option value="curriculum_highschool">Curriculum-Based Robotics (High School) – $40 Complete</option>
                    </optgroup>
                    <optgroup label="Weekly Robotics Clubs">
                      <option value="weekly_club_primary">Weekly Robotics Club (Primary) – $5 per session</option>
                      <option value="weekly_club_secondary">Weekly Robotics Club (Secondary) – $5 per session</option>
                    </optgroup>
                    <optgroup label="Monthly Workshops">
                      <option value="monthly_workshop_primary">Monthly Robotics Workshop (Primary) – $5 per session</option>
                      <option value="monthly_workshop_secondary">Monthly Robotics Workshop (Secondary) – $5 per session</option>
                    </optgroup>
                    <optgroup label="Accredited Certification Pathway">
                      <option value="comprehensive_certification">Comprehensive Robotics Training & Certification – $5 per lesson</option>
                    </optgroup>
                    <optgroup label="Holiday Break Bootcamps">
                      <option value="holiday_bootcamp_junior">Holiday Robotics Bootcamp (Junior Explorer) – $20</option>
                      <option value="holiday_bootcamp_senior">Holiday Robotics Bootcamp (Senior Innovators) – $35</option>
                    </optgroup>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Target Certification Level</label>
                  <select
                    value={selectedLevelId}
                    onChange={(e) => setSelectedLevelId(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-800 font-semibold"
                  >
                    <option value="level_1_explorer">Level 1 – Robotics Explorer Certificate (ECD / Infants)</option>
                    <option value="level_2_junior">Level 2 – Junior Robotics Certificate (Grades 3 – 7)</option>
                    <option value="level_3_secondary">Level 3 – Secondary Robotics Certificate (High School)</option>
                    <option value="level_4_advanced">Level 4 – Advanced Robotics & Engineering Certificate</option>
                    <option value="teacher_cpd">Teacher Professional Development Certificate</option>
                  </select>
                </div>
              </div>

              {/* Hardware Kit Addon */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-bold text-[#0A1B4D]">
                    Add Take-Home Hardware Starter Kit ($50 per learner)
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Includes personal microcontroller, breadboard, sensors, DC motors, and chassis.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={includeHardwareKit}
                  onChange={(e) => setIncludeHardwareKit(e.target.checked)}
                  className="w-5 h-5 rounded text-[#0D47A1] focus:ring-[#1976D2]"
                />
              </div>
            </div>

            {/* Step 5: Summary & Real-time Fee Breakdown */}
            <div className="p-6 rounded-3xl bg-[#0A1B4D] text-white shadow-xl border border-[#0D47A1]/40 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-[#00C6FF] uppercase tracking-wider">
                  Real-time Fee Calculation
                </span>
                <div className="text-sm font-medium text-blue-200">
                  {feeCalculation.breakdownText}
                  {includeHardwareKit && ` + ${learnerCount} × $50 Hardware Kit`}
                </div>
                <div className="text-xs text-blue-300">
                  Total Learners: <strong>{learnerCount}</strong> • Location: <strong className="capitalize">{locationOption.replace(/_/g, ' ')}</strong>
                </div>
              </div>

              <div className="text-right flex items-center gap-6">
                <div>
                  <div className="text-xs text-blue-300 font-medium">Total Payable</div>
                  <div className="text-3xl font-black text-white">
                    ${feeCalculation.totalPayable}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#00C6FF] to-[#1976D2] hover:from-[#1976D2] hover:to-[#0D47A1] text-white font-extrabold text-xs uppercase tracking-wider shadow-lg transition"
                >
                  {submitting ? 'Confirming...' : 'Complete Enrolment'}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 7. MY ROBOTICS LEARNING PASSPORT SUB-PAGE */}
      {/* ===================================================================== */}
      {activeSubTab === 'passport' && (
        <div className="space-y-8 animate-fade-in">
          <div>
            <h2 className="text-2xl font-black text-[#0A1B4D]">My Robotics Learning Passport</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Verified record of attendance, practical lab assemblies, assessment scores, and earned credentials.
            </p>
          </div>

          {loadingPassport ? (
            <div className="p-12 text-center text-slate-400">Loading passport records...</div>
          ) : !passport ? (
            <div className="p-8 bg-white rounded-3xl border border-slate-200 text-center space-y-3">
              <Bot className="w-10 h-10 text-slate-400 mx-auto" />
              <p className="text-xs font-semibold text-slate-600">No active robotics registration found for this account.</p>
              <button
                onClick={() => setActiveSubTab('enrolment')}
                className="px-5 py-2.5 rounded-xl bg-[#0D47A1] text-white text-xs font-bold"
              >
                Enrol Now to Initialize Passport
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Passport Header Badge */}
              <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#0A1B4D] via-[#0D47A1] to-[#1976D2] text-white shadow-xl relative overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-[#00C6FF] text-[11px] font-bold uppercase">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Verified Learner Passport
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-black tracking-tight">{passport.learnerName}</h3>
                    <p className="text-xs text-blue-200">
                      {passport.schoolName} • {passport.gradeLevel}
                    </p>
                  </div>

                  <div className="bg-white/10 p-4 rounded-2xl border border-white/20 text-center sm:text-right shrink-0">
                    <span className="text-[10px] uppercase font-bold text-blue-200 block">Current Milestone</span>
                    <span className="text-sm font-black text-white">{passport.levelTitle}</span>
                    <div className="text-xs text-emerald-400 font-bold mt-1">
                      {passport.sessionsAttended} of {passport.requiredSessions} Sessions Completed ({passport.progressPercentage}%)
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-6 pt-4 border-t border-white/10 space-y-1.5">
                  <div className="flex justify-between text-xs font-bold text-blue-200">
                    <span>Progress to Next Certificate</span>
                    <span>{passport.progressPercentage}%</span>
                  </div>
                  <div className="h-3 w-full bg-black/30 rounded-full overflow-hidden p-0.5">
                    <div 
                      className="h-full bg-gradient-to-r from-[#00C6FF] to-emerald-400 rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(5, passport.progressPercentage)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Grid: Completed Projects & Skills Badges */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Completed Projects */}
                <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
                  <h4 className="text-sm font-bold text-[#0A1B4D] uppercase tracking-wider flex items-center justify-between">
                    <span>Practical Robot Projects</span>
                    <span className="text-xs text-[#1976D2]">{passport.projectsCompleted.length} Completed</span>
                  </h4>

                  <div className="space-y-3">
                    {passport.projectsCompleted.map((proj) => (
                      <div key={proj.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-start justify-between gap-3">
                        <div>
                          <h5 className="text-xs font-bold text-[#0A1B4D]">{proj.title}</h5>
                          <p className="text-[11px] text-slate-500 mt-0.5">{proj.description}</p>
                          <span className="text-[10px] text-slate-400 block mt-1">
                            Completed on {proj.completedDate}
                          </span>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold text-[10px] whitespace-nowrap">
                          Score: {proj.score}/100
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Skills Acquired & Assessments */}
                <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
                  <h4 className="text-sm font-bold text-[#0A1B4D] uppercase tracking-wider">
                    Competency Skills Acquired
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {passport.skillsAcquired.map((skill, i) => (
                      <span key={i} className="px-3 py-1.5 rounded-xl bg-[#E8F4FF] text-[#0D47A1] text-xs font-bold border border-[#1976D2]/20">
                        ✓ {skill}
                      </span>
                    ))}
                  </div>

                  <div className="pt-4 border-t border-slate-100 space-y-2">
                    <span className="text-[11px] font-bold uppercase text-slate-400 block">Assessment Records</span>
                    {passport.assessmentResults.map((ass, i) => (
                      <div key={i} className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                        <div className="flex justify-between font-bold text-slate-800">
                          <span>{ass.assessmentName}</span>
                          <span className="text-emerald-600">{ass.score} / {ass.maxScore}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">{ass.feedback}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Earned Digital Certificates */}
              <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
                <h4 className="text-sm font-bold text-[#0A1B4D] uppercase tracking-wider flex items-center justify-between">
                  <span>Conferred Digital Certificates</span>
                  <Award className="w-4 h-4 text-[#0D47A1]" />
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {passport.certificatesEarned.map((cert, i) => (
                    <div key={i} className="p-5 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 flex items-center justify-between gap-4">
                      <div>
                        <span className="text-[10px] font-mono text-slate-500 font-bold">
                          #{cert.certificateNumber}
                        </span>
                        <h5 className="text-sm font-extrabold text-[#0A1B4D]">{cert.levelTitle}</h5>
                        <p className="text-[11px] text-slate-500">
                          Issued on {cert.issueDate} • Grade: <strong className="text-emerald-700">{cert.grade}</strong>
                        </p>
                      </div>

                      <button
                        onClick={() => setSelectedCert({
                          number: cert.certificateNumber,
                          title: cert.levelTitle,
                          grade: cert.grade
                        })}
                        className="px-3.5 py-2 rounded-xl bg-[#0D47A1] hover:bg-[#0A1B4D] text-white text-xs font-bold transition shrink-0 flex items-center gap-1.5 shadow-sm"
                      >
                        <Award className="w-3.5 h-3.5" />
                        View Credential
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Digital Certificate Modal */}
      {selectedCert && (
        <RoboticsDigitalCertificateModal
          isOpen={Boolean(selectedCert)}
          onClose={() => setSelectedCert(null)}
          certificateNumber={selectedCert.number}
          learnerName={passport?.learnerName || 'YARA Learner'}
          levelTitle={selectedCert.title}
          programmeCompleted="Robotics & Engineering Accredited Training"
          schoolName={passport?.schoolName || 'St. George’s Robotics Chapter'}
          grade={selectedCert.grade}
        />
      )}

      {/* Trainer & Mentor Examination Suite Modal */}
      <RoboticsTrainerExamModal
        isOpen={isTrainerExamOpen}
        onClose={() => {
          setIsTrainerExamOpen(false);
          loadTrainerEligibility();
        }}
        userId={user?.id}
        userEmail={user?.email}
        userName={profile?.display_name}
        userSchoolOrChapter={profile?.institution || profile?.school_institution}
        userPhone={profile?.phone || profile?.contact_phone}
        onCertificateIssued={(certNumber, title, grade) => {
          setSelectedCert({
            number: certNumber,
            title,
            grade
          });
          showToast(`Congratulations! You are officially certified as a YARA Robotics Trainer & Mentor (${certNumber}).`);
        }}
      />
    </div>
  );
};

