import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Check, ChevronRight, ChevronLeft, Trophy, Users, ShieldCheck, 
  Upload, FileText, CheckCircle2, AlertCircle, Sparkles, Building2, 
  MapPin, Phone, Mail, User, Layers, Waves, Compass, Lightbulb, 
  Plus, Trash2, Crown, Download, Printer, ArrowRight, Video, FileCheck, Info
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuth } from '../AuthContext';
import { 
  ParticipantType, 
  CompetitionCategoryType, 
  YaraTeamMember, 
  UnderwaterDroneDetails,
  AutonomousMazeDetails,
  InnovationPitchDetails,
  TeamUploadedDocument,
  TeamConsents,
  YaraCompetitionRegistration 
} from '../../types/yaraCompetition';
import { 
  ZIMBABWE_PROVINCES_AND_DISTRICTS, 
  YARA_EVENT_2026_DEFAULT 
} from '../../constants/yaraCompetitionData';
import { 
  generateRegistrationId, 
  saveRegistration 
} from '../../services/yaraCompetitionService';
import { computeTeamCompositionStatus } from '../../lib/teamValidation';

interface MultiStepRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCategory?: CompetitionCategoryType;
  onSuccess?: (registration: YaraCompetitionRegistration) => void;
}

const PARTICIPANT_TYPES: ParticipantType[] = [
  'School',
  'Robotics Club',
  'University/College Team',
  'Independent Youth Team',
  'Community Innovation Group',
  'Other'
];

const MEMBER_ROLES = [
  'Team Leader',
  'Programmer',
  'Mechanical Engineer',
  'Electronics Engineer',
  'Designer',
  'Researcher',
  'Presenter',
  'Other'
] as const;

export default function MultiStepRegistrationModal({
  isOpen,
  onClose,
  initialCategory,
  onSuccess
}: MultiStepRegistrationModalProps) {
  const { user, profile } = useAuth();

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [submitting, setSubmitting] = useState(false);
  const [submittedRegistration, setSubmittedRegistration] = useState<YaraCompetitionRegistration | null>(null);

  // STEP 1: Participant Type
  const [participantType, setParticipantType] = useState<ParticipantType>('School');
  const [participantTypeOther, setParticipantTypeOther] = useState('');

  // STEP 2: Team Info
  const [teamName, setTeamName] = useState('');
  const [schoolOrg, setSchoolOrg] = useState('');
  const [province, setProvince] = useState<string>('Harare');
  const [district, setDistrict] = useState<string>('Harare Urban');
  const [cityTown, setCityTown] = useState<string>('');

  const [leaderName, setLeaderName] = useState(profile?.display_name || '');
  const [leaderEmail, setLeaderEmail] = useState(profile?.email || user?.email || '');
  const [leaderPhone, setLeaderPhone] = useState('');

  const [mentorName, setMentorName] = useState('');
  const [mentorEmail, setMentorEmail] = useState('');
  const [mentorPhone, setMentorPhone] = useState('');

  const [selectedCategories, setSelectedCategories] = useState<CompetitionCategoryType[]>(
    initialCategory ? [initialCategory] : ['underwater_drone', 'autonomous_maze', 'innovation_pitch']
  );

  // STEP 3: Members
  const [members, setMembers] = useState<YaraTeamMember[]>([
    { id: 'm-1', full_name: '', age: 16, gender: 'boy', role: 'Team Leader', is_captain: true, grade_level: 'Form 4' },
    { id: 'm-2', full_name: '', age: 16, gender: 'boy', role: 'Programmer', is_captain: false, grade_level: 'Form 4' },
    { id: 'm-3', full_name: '', age: 15, gender: 'girl', role: 'Mechanical Engineer', is_captain: false, grade_level: 'Form 3' },
    { id: 'm-4', full_name: '', age: 15, gender: 'girl', role: 'Electronics Engineer', is_captain: false, grade_level: 'Form 3' }
  ]);

  // STEP 4: Category Specifics
  const [underwaterInfo, setUnderwaterInfo] = useState<UnderwaterDroneDetails>({
    has_rov: true,
    will_build_own: true,
    robot_description: '',
    main_controller: 'ESP32-WROOM / Arduino Mega',
    sensors_used: 'Depth Sensor, Waterproof HD Camera, Gyro IMU',
    communication_method: 'Tethered Cat6 Ethernet / RS485 Serial',
    power_source: '12V 3S LiPo Battery Box',
    estimated_dimensions: '40cm x 30cm x 25cm'
  });

  const [mazeInfo, setMazeInfo] = useState<AutonomousMazeDetails>({
    robot_name: '',
    controller: 'STM32 / Raspberry Pi Pico',
    sensors: 'HC-SR04 Ultrasonic Array + VL53L0X ToF Laser',
    programming_language: 'C++ (Arduino IDE) / MicroPython',
    navigation_method: 'FloodFill Algorithm & Wall-Following PID',
    robot_dimensions: '18cm x 15cm x 12cm'
  });

  const [pitchInfo, setPitchInfo] = useState<InnovationPitchDetails>({
    project_title: '',
    problem_addressed: '',
    target_beneficiaries: 'Underserved rural secondary students & farming communities',
    proposed_solution: '',
    technology_used: 'Low-cost IoT Telemetry, Solar Power, AI Vision, Recycled Components',
    expected_social_impact: '',
    project_stage: 'Working Prototype',
    has_prototype: true,
    proposal_summary: ''
  });

  // STEP 5: Project Uploads
  const [documents, setDocuments] = useState<TeamUploadedDocument[]>([]);
  const [videoUrl, setVideoUrl] = useState('');
  const [uploadingDoc, setUploadingDoc] = useState(false);

  // STEP 6: Consents
  const [consents, setConsents] = useState<TeamConsents>({
    competition_rules_agreed: false,
    parent_guardian_consent_minor: false,
    event_participation_consent: false,
    media_photo_video_consent: false,
    promotional_educational_use_consent: false,
    consented_by_name: profile?.display_name || '',
    consented_at: new Date().toISOString()
  });

  const [validationError, setValidationError] = useState<string | null>(null);

  // Composition calculation
  const compositionStatus = useMemo(() => {
    return computeTeamCompositionStatus(
      members.map(m => ({
        id: m.id,
        name: m.full_name,
        gender: m.gender,
        is_captain: !!m.is_captain,
        age: m.age,
        grade_or_level: m.grade_level
      }))
    );
  }, [members]);

  const districts = useMemo(() => {
    return ZIMBABWE_PROVINCES_AND_DISTRICTS[province] || ['District Central'];
  }, [province]);

  const handleToggleCategory = (cat: CompetitionCategoryType) => {
    if (selectedCategories.includes(cat)) {
      if (selectedCategories.length === 1) {
        alert('You must select at least one competition challenge.');
        return;
      }
      setSelectedCategories(prev => prev.filter(c => c !== cat));
    } else {
      setSelectedCategories(prev => [...prev, cat]);
    }
  };

  const handleAddMember = () => {
    const nextGender: 'boy' | 'girl' = compositionStatus.boysCount <= compositionStatus.girlsCount ? 'boy' : 'girl';
    setMembers(prev => [
      ...prev,
      {
        id: `m-${Date.now()}`,
        full_name: '',
        age: 16,
        gender: nextGender,
        role: 'Researcher',
        is_captain: false,
        grade_level: 'Form 4'
      }
    ]);
  };

  const handleRemoveMember = (id: string) => {
    if (members.length <= 4) {
      alert('Every team must maintain at least 4 participants (min 2 boys and 2 girls).');
      return;
    }
    const filtered = members.filter(m => m.id !== id);
    if (members.find(m => m.id === id)?.is_captain && filtered.length > 0) {
      filtered[0].is_captain = true;
    }
    setMembers(filtered);
  };

  const handleSetCaptain = (id: string) => {
    setMembers(prev => prev.map(m => ({
      ...m,
      is_captain: m.id === id
    })));
  };

  const handleSimulateFileUpload = (type: TeamUploadedDocument['type']) => {
    setUploadingDoc(true);
    setTimeout(() => {
      const typeLabels: Record<string, string> = {
        project_proposal: 'YARA_Project_Proposal.pdf',
        robot_description: 'Technical_Robot_Schematics.pdf',
        technical_doc: 'Firmware_Flowchart_BillOfMaterials.pdf',
        image: 'Robot_Prototype_Photo.jpg',
        pitch_deck_pdf: 'Innovation_Pitch_Deck_2026.pdf',
        video_link: 'Demonstration_Video.mp4'
      };
      const newDoc: TeamUploadedDocument = {
        id: `doc-${Date.now()}`,
        name: typeLabels[type] || 'Uploaded_Document.pdf',
        type,
        file_url: 'https://storage.yara-platform.org/documents/yara-2026-doc.pdf',
        size_kb: Math.floor(1200 + Math.random() * 2400),
        uploaded_at: new Date().toISOString()
      };
      setDocuments(prev => [...prev, newDoc]);
      setUploadingDoc(false);
    }, 600);
  };

  // Step Validation & Navigation
  const validateAndNext = () => {
    setValidationError(null);

    if (currentStep === 1) {
      if (participantType === 'Other' && !participantTypeOther.trim()) {
        setValidationError('Please specify your participant category organization.');
        return;
      }
    } else if (currentStep === 2) {
      if (!teamName.trim()) {
        setValidationError('Please provide a team name.');
        return;
      }
      if (!schoolOrg.trim()) {
        setValidationError('Please provide your school, university, or organization name.');
        return;
      }
      if (!leaderName.trim() || !leaderEmail.trim()) {
        setValidationError('Please provide the team leader contact name and email address.');
        return;
      }
      if (selectedCategories.length === 0) {
        setValidationError('Please choose at least one competition challenge.');
        return;
      }
    } else if (currentStep === 3) {
      const emptyNames = members.some(m => !m.full_name.trim());
      if (emptyNames) {
        setValidationError('Please fill in the full names for all roster participants.');
        return;
      }
      if (!compositionStatus.isEligible) {
        setValidationError('Team is not eligible. Every team must include at least 4 participants with a minimum of 2 boys and 2 girls.');
        return;
      }
    } else if (currentStep === 4) {
      if (selectedCategories.includes('innovation_pitch') && !pitchInfo.project_title.trim()) {
        setValidationError('Please provide the title of your Innovation Pitch project.');
        return;
      }
    } else if (currentStep === 6) {
      if (!consents.competition_rules_agreed) {
        setValidationError('You must agree to the YARA Educational Robotics Competition 2026 rules.');
        return;
      }
      if (!consents.parent_guardian_consent_minor) {
        setValidationError('Parent/Guardian consent for minor participants is required.');
        return;
      }
      if (!consents.event_participation_consent || !consents.media_photo_video_consent) {
        setValidationError('Please complete all mandatory consent checkboxes before proceeding.');
        return;
      }
    }

    setCurrentStep(prev => Math.min(prev + 1, 7));
  };

  const handleFinalSubmit = async () => {
    setValidationError(null);
    setSubmitting(true);

    try {
      const regId = generateRegistrationId();
      const newRegistration: YaraCompetitionRegistration = {
        id: `reg-${Date.now()}`,
        registration_id: regId,
        event_id: 'yara-competition-2026',
        event_name: YARA_EVENT_2026_DEFAULT.name,
        participant_type: participantType,
        participant_type_other: participantType === 'Other' ? participantTypeOther : undefined,
        team_name: teamName.trim(),
        school_organization: schoolOrg.trim(),
        province,
        district,
        city_town: cityTown.trim() || district,
        team_leader_name: leaderName.trim(),
        team_leader_email: leaderEmail.trim(),
        team_leader_phone: leaderPhone.trim(),
        mentor_name: mentorName.trim() || undefined,
        mentor_email: mentorEmail.trim() || undefined,
        mentor_phone: mentorPhone.trim() || undefined,
        selected_categories: selectedCategories,
        members,
        boys_count: compositionStatus.boysCount,
        girls_count: compositionStatus.girlsCount,
        total_members: compositionStatus.totalCount,
        is_gender_eligible: compositionStatus.isEligible,
        underwater_drone_info: selectedCategories.includes('underwater_drone') ? underwaterInfo : undefined,
        autonomous_maze_info: selectedCategories.includes('autonomous_maze') ? mazeInfo : undefined,
        innovation_pitch_info: selectedCategories.includes('innovation_pitch') ? pitchInfo : undefined,
        documents,
        video_demo_url: videoUrl.trim() || undefined,
        consents: {
          ...consents,
          consented_by_name: leaderName.trim() || consents.consented_by_name,
          consented_at: new Date().toISOString()
        },
        status: 'Submitted',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_id: user?.id
      };

      const result = await saveRegistration(newRegistration);
      if (result.success && result.data) {
        setSubmittedRegistration(result.data);
        if (onSuccess) onSuccess(result.data);
      } else {
        setValidationError(result.error || 'Failed to submit registration. Please try again.');
      }
    } catch (e: any) {
      setValidationError(e.message || 'Submission error');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePrintConfirmation = () => {
    window.print();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 overflow-y-auto bg-slate-950/70 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white rounded-3xl md:rounded-[2.5rem] border border-slate-100 shadow-2xl max-w-4xl w-full max-h-[94vh] overflow-y-auto my-auto flex flex-col"
        >
          {/* Header Banner */}
          <div className="p-6 md:p-8 bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 text-white rounded-t-3xl md:rounded-t-[2.5rem] relative shrink-0">
            <button
              onClick={onClose}
              className="absolute top-6 right-6 p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-2 text-amber-400 font-black text-xs uppercase tracking-widest mb-1.5">
              <Trophy className="w-4 h-4" />
              <span>YARA Official Registration Portal • 2026 Edition</span>
            </div>

            <h2 className="text-2xl md:text-3xl font-black tracking-tight">
              YARA Educational Robotics Competition 2026
            </h2>
            <p className="text-indigo-200 text-xs md:text-sm mt-1 max-w-2xl font-medium">
              “Engineering Opportunity: Robotics and Innovation for Underserved Youth” — <em>Innovate for Inclusion. Build for Impact.</em>
            </p>

            {/* Step Progress Pills */}
            {!submittedRegistration && (
              <div className="mt-6 flex items-center justify-between gap-1 md:gap-2 overflow-x-auto py-1">
                {[
                  { step: 1, label: 'Type' },
                  { step: 2, label: 'Team Info' },
                  { step: 3, label: 'Members' },
                  { step: 4, label: 'Challenge' },
                  { step: 5, label: 'Uploads' },
                  { step: 6, label: 'Consent' },
                  { step: 7, label: 'Review' }
                ].map((s) => (
                  <button
                    key={s.step}
                    type="button"
                    onClick={() => {
                      if (s.step < currentStep) setCurrentStep(s.step);
                    }}
                    className={cn(
                      "flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0",
                      currentStep === s.step
                        ? "bg-amber-400 text-slate-950 shadow-md font-black"
                        : currentStep > s.step
                        ? "bg-white/20 text-emerald-300 hover:bg-white/30"
                        : "bg-white/5 text-slate-400 cursor-not-allowed"
                    )}
                  >
                    <span className="w-4 h-4 rounded-full bg-black/20 flex items-center justify-center text-[10px]">
                      {currentStep > s.step ? "✓" : s.step}
                    </span>
                    <span className="hidden sm:inline">{s.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Body Content */}
          <div className="p-6 md:p-8 flex-1 overflow-y-auto space-y-6">
            {/* Validation Banner */}
            {validationError && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center space-x-3 text-red-700 text-xs font-bold">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{validationError}</span>
              </div>
            )}

            {/* SUCCESS SCREEN */}
            {submittedRegistration ? (
              <div className="text-center py-6 space-y-6">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-xl">
                  <CheckCircle2 className="w-10 h-10" />
                </div>

                <div>
                  <h3 className="text-2xl font-black text-slate-900">Registration Successfully Submitted!</h3>
                  <p className="text-slate-500 text-sm mt-1 max-w-md mx-auto">
                    Your team is officially registered for the <strong>YARA Educational Robotics Competition 2026</strong>.
                  </p>
                </div>

                {/* Receipt Card */}
                <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 max-w-lg mx-auto text-left space-y-4 shadow-sm">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                    <div>
                      <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">Official Registration ID</span>
                      <p className="text-xl font-black text-indigo-700 font-mono">{submittedRegistration.registration_id}</p>
                    </div>
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-black uppercase rounded-full">
                      {submittedRegistration.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-slate-400 font-medium">Team Name:</span>
                      <p className="font-bold text-slate-900">{submittedRegistration.team_name}</p>
                    </div>
                    <div>
                      <span className="text-slate-400 font-medium">School / Org:</span>
                      <p className="font-bold text-slate-900">{submittedRegistration.school_organization}</p>
                    </div>
                    <div>
                      <span className="text-slate-400 font-medium">Province / District:</span>
                      <p className="font-bold text-slate-900">{submittedRegistration.province} ({submittedRegistration.district})</p>
                    </div>
                    <div>
                      <span className="text-slate-400 font-medium">Team Size:</span>
                      <p className="font-bold text-slate-900">{submittedRegistration.total_members} Members ({submittedRegistration.boys_count} Boys, {submittedRegistration.girls_count} Girls)</p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200">
                    <span className="text-slate-400 text-xs font-medium">Registered Challenges:</span>
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {submittedRegistration.selected_categories.map(cat => (
                        <span key={cat} className="px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-[11px] font-bold">
                          {cat === 'underwater_drone' ? '🌊 Underwater Drone Mission' : cat === 'autonomous_maze' ? '⚡ Autonomous Maze Solving' : '💡 Innovation Pitch'}
                        </span>
                      ))}
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400 italic pt-2">
                    A formal confirmation email has been dispatched to <strong>{submittedRegistration.team_leader_email}</strong>.
                  </p>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handlePrintConfirmation}
                    className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center space-x-2 transition-all"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Print Confirmation Slip</span>
                  </button>

                  <button
                    type="button"
                    onClick={onClose}
                    className="w-full sm:w-auto px-8 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-lg shadow-indigo-200 transition-all"
                  >
                    Done & Return to Competitions
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* STEP 1: PARTICIPANT TYPE */}
                {currentStep === 1 && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-black text-slate-900">Step 1 — Who are you registering as?</h3>
                      <p className="text-slate-500 text-xs mt-1">
                        Select the organizational structure representing your youth robotics cohort.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {PARTICIPANT_TYPES.map(type => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setParticipantType(type)}
                          className={cn(
                            "p-4 rounded-2xl border text-left transition-all flex flex-col justify-between h-28",
                            participantType === type
                              ? "bg-indigo-50/80 border-indigo-600 text-indigo-950 shadow-md ring-2 ring-indigo-600/20"
                              : "bg-white border-slate-200 hover:border-slate-300 text-slate-700"
                          )}
                        >
                          <div className="flex items-center justify-between">
                            <Building2 className={cn("w-5 h-5", participantType === type ? "text-indigo-600" : "text-slate-400")} />
                            {participantType === type && <CheckCircle2 className="w-4 h-4 text-indigo-600" />}
                          </div>
                          <span className="font-bold text-sm">{type}</span>
                        </button>
                      ))}
                    </div>

                    {participantType === 'Other' && (
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Specify Organization Category *</label>
                        <input
                          type="text"
                          value={participantTypeOther}
                          onChange={e => setParticipantTypeOther(e.target.value)}
                          placeholder="e.g. Rural Science Hub, Orphanage STEM Initiative, Maker Cohort"
                          className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-600"
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* STEP 2: TEAM INFORMATION */}
                {currentStep === 2 && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-black text-slate-900">Step 2 — Team & Institutional Details</h3>
                      <p className="text-slate-500 text-xs mt-1">
                        Provide your team identity, regional location in Zimbabwe, and choose competition challenges.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Team Name *</label>
                        <input
                          type="text"
                          value={teamName}
                          onChange={e => setTeamName(e.target.value)}
                          placeholder="e.g. Matabeleland Cyber Rovers"
                          className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-600"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">School / Organization *</label>
                        <input
                          type="text"
                          value={schoolOrg}
                          onChange={e => setSchoolOrg(e.target.value)}
                          placeholder="e.g. Fletcher High School / STEM Hub"
                          className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 text-xs font-medium text-slate-900 focus:outline-none focus:border-indigo-600"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Province *</label>
                        <select
                          value={province}
                          onChange={e => {
                            const newProv = e.target.value;
                            setProvince(newProv);
                            setDistrict(ZIMBABWE_PROVINCES_AND_DISTRICTS[newProv]?.[0] || 'District Central');
                          }}
                          className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 text-xs font-medium text-slate-900 focus:outline-none focus:border-indigo-600"
                        >
                          {Object.keys(ZIMBABWE_PROVINCES_AND_DISTRICTS).map(p => (
                            <option key={p} value={p}>{p}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">District *</label>
                        <select
                          value={district}
                          onChange={e => setDistrict(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 text-xs font-medium text-slate-900 focus:outline-none focus:border-indigo-600"
                        >
                          {districts.map(d => (
                            <option key={d} value={d}>{d}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1.5 md:col-span-2">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Town / City / Community</label>
                        <input
                          type="text"
                          value={cityTown}
                          onChange={e => setCityTown(e.target.value)}
                          placeholder="e.g. Gweru, Mutare, Bulawayo, Bindura"
                          className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 text-xs font-medium text-slate-900 focus:outline-none focus:border-indigo-600"
                        />
                      </div>
                    </div>

                    {/* Team Leader & Mentor Contacts */}
                    <div className="p-5 bg-slate-50/80 rounded-2xl border border-slate-200 space-y-4">
                      <div className="flex items-center space-x-2 text-xs font-black uppercase tracking-wider text-slate-800">
                        <User className="w-4 h-4 text-indigo-600" />
                        <span>Team Leader & Teacher / Mentor Contacts</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <input
                          type="text"
                          value={leaderName}
                          onChange={e => setLeaderName(e.target.value)}
                          placeholder="Team Leader Full Name *"
                          className="bg-white border border-slate-200 rounded-xl py-2.5 px-3 text-xs text-slate-900 font-bold focus:outline-none focus:border-indigo-600"
                        />
                        <input
                          type="email"
                          value={leaderEmail}
                          onChange={e => setLeaderEmail(e.target.value)}
                          placeholder="Leader Email *"
                          className="bg-white border border-slate-200 rounded-xl py-2.5 px-3 text-xs text-slate-900 font-medium focus:outline-none focus:border-indigo-600"
                        />
                        <input
                          type="text"
                          value={leaderPhone}
                          onChange={e => setLeaderPhone(e.target.value)}
                          placeholder="Leader Phone / WhatsApp"
                          className="bg-white border border-slate-200 rounded-xl py-2.5 px-3 text-xs text-slate-900 font-medium focus:outline-none focus:border-indigo-600"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 border-t border-slate-200/80">
                        <input
                          type="text"
                          value={mentorName}
                          onChange={e => setMentorName(e.target.value)}
                          placeholder="Teacher / Mentor Name (Recorded separately)"
                          className="bg-white border border-slate-200 rounded-xl py-2.5 px-3 text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
                        />
                        <input
                          type="email"
                          value={mentorEmail}
                          onChange={e => setMentorEmail(e.target.value)}
                          placeholder="Teacher / Mentor Email"
                          className="bg-white border border-slate-200 rounded-xl py-2.5 px-3 text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
                        />
                        <input
                          type="text"
                          value={mentorPhone}
                          onChange={e => setMentorPhone(e.target.value)}
                          placeholder="Teacher / Mentor Phone"
                          className="bg-white border border-slate-200 rounded-xl py-2.5 px-3 text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
                        />
                      </div>
                    </div>

                    {/* Challenge Category Selection */}
                    <div className="space-y-3">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Select Competition Challenges (Select one or more):
                      </label>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {[
                          { id: 'underwater_drone' as const, title: 'Underwater Drone Mission', icon: Waves, weight: '35%' },
                          { id: 'autonomous_maze' as const, title: 'Autonomous Maze Solving', icon: Compass, weight: '35%' },
                          { id: 'innovation_pitch' as const, title: 'Innovation Pitch Challenge', icon: Lightbulb, weight: '30%' }
                        ].map(c => {
                          const isSelected = selectedCategories.includes(c.id);
                          return (
                            <button
                              key={c.id}
                              type="button"
                              onClick={() => handleToggleCategory(c.id)}
                              className={cn(
                                "p-4 rounded-2xl border text-left transition-all flex items-start justify-between",
                                isSelected 
                                  ? "bg-indigo-50/80 border-indigo-600 text-indigo-950 shadow-sm" 
                                  : "bg-white border-slate-200 hover:border-slate-300 text-slate-600"
                              )}
                            >
                              <div className="space-y-1">
                                <div className="flex items-center space-x-2">
                                  <c.icon className={cn("w-4 h-4", isSelected ? "text-indigo-600" : "text-slate-400")} />
                                  <span className="font-bold text-xs">{c.title}</span>
                                </div>
                                <p className="text-[11px] text-slate-400">Overall Weight: {c.weight}</p>
                              </div>

                              <div className={cn(
                                "w-5 h-5 rounded-md border flex items-center justify-center text-xs shrink-0 ml-2",
                                isSelected ? "bg-indigo-600 border-indigo-600 text-white" : "border-slate-300"
                              )}>
                                {isSelected && <Check className="w-3.5 h-3.5" />}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 3: TEAM MEMBERS & 2 BOYS + 2 GIRLS RULE */}
                {currentStep === 3 && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-black text-slate-900">Step 3 — Team Members & Mandatory Composition</h3>
                      <p className="text-slate-500 text-xs mt-1">
                        Every team must consist of <strong>at least 4 participants</strong> with a minimum of <strong>2 boys and 2 girls</strong>.
                      </p>
                    </div>

                    {/* Real-time Status Card */}
                    <div className={cn(
                      "p-4 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-3",
                      compositionStatus.isEligible ? "bg-emerald-50 border-emerald-200" : "bg-amber-50 border-amber-200"
                    )}>
                      <div className="flex items-center space-x-3">
                        <div className={cn(
                          "w-8 h-8 rounded-xl flex items-center justify-center text-white font-bold shrink-0",
                          compositionStatus.isEligible ? "bg-emerald-600" : "bg-amber-600"
                        )}>
                          {compositionStatus.isEligible ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                        </div>
                        <div>
                          <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900">
                            {compositionStatus.isEligible ? "✓ Mandatory Composition Satisfied" : "⚠ Team Not Yet Eligible"}
                          </h4>
                          <p className="text-[11px] text-slate-600">
                            {compositionStatus.isEligible 
                              ? "Ready: 2+ boys and 2+ girls present." 
                              : "Must have at least 2 boys and 2 girls (minimum 4 members)."}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 text-xs font-bold shrink-0">
                        <span className={cn("px-2.5 py-1 rounded-lg border", compositionStatus.hasMinBoys ? "bg-blue-100 border-blue-200 text-blue-800" : "bg-white border-amber-300 text-amber-800")}>
                          👦 Boys: {compositionStatus.boysCount}/2
                        </span>
                        <span className={cn("px-2.5 py-1 rounded-lg border", compositionStatus.hasMinGirls ? "bg-pink-100 border-pink-200 text-pink-800" : "bg-white border-amber-300 text-amber-800")}>
                          👧 Girls: {compositionStatus.girlsCount}/2
                        </span>
                        <span className={cn("px-2.5 py-1 rounded-lg border", compositionStatus.hasMinTotal ? "bg-emerald-100 border-emerald-200 text-emerald-800" : "bg-white border-amber-300 text-amber-800")}>
                          👥 Total: {compositionStatus.totalCount}/4
                        </span>
                      </div>
                    </div>

                    {/* Member Rows */}
                    <div className="space-y-3">
                      {members.map((member, idx) => (
                        <div
                          key={member.id}
                          className={cn(
                            "p-4 rounded-2xl border transition-all space-y-3",
                            member.is_captain ? "bg-amber-50/40 border-amber-200" : "bg-white border-slate-200"
                          )}
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center space-x-2">
                              <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center">
                                {idx + 1}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleSetCaptain(member.id)}
                                className={cn(
                                  "px-2.5 py-1 rounded-xl text-[11px] font-bold flex items-center space-x-1 transition-all",
                                  member.is_captain
                                    ? "bg-amber-500 text-white shadow-sm"
                                    : "bg-slate-100 text-slate-500 hover:bg-amber-100 hover:text-amber-800"
                                )}
                              >
                                <Crown className="w-3 h-3" />
                                <span>{member.is_captain ? "Team Captain" : "Make Captain"}</span>
                              </button>
                            </div>

                            {/* Gender Switch */}
                            <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl">
                              <button
                                type="button"
                                onClick={() => {
                                  setMembers(prev => prev.map(m => m.id === member.id ? { ...m, gender: 'boy' } : m));
                                }}
                                className={cn(
                                  "px-2.5 py-1 rounded-lg text-xs font-bold transition-all",
                                  member.gender === 'boy' ? "bg-blue-600 text-white shadow-sm" : "text-slate-600"
                                )}
                              >
                                👦 Boy
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setMembers(prev => prev.map(m => m.id === member.id ? { ...m, gender: 'girl' } : m));
                                }}
                                className={cn(
                                  "px-2.5 py-1 rounded-lg text-xs font-bold transition-all",
                                  member.gender === 'girl' ? "bg-pink-600 text-white shadow-sm" : "text-slate-600"
                                )}
                              >
                                👧 Girl
                              </button>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                            <input
                              type="text"
                              value={member.full_name}
                              onChange={e => {
                                setMembers(prev => prev.map(m => m.id === member.id ? { ...m, full_name: e.target.value } : m));
                              }}
                              placeholder={`Participant #${idx + 1} Full Name *`}
                              className="bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-600"
                            />

                            <input
                              type="number"
                              min="8"
                              max="28"
                              value={member.age}
                              onChange={e => {
                                setMembers(prev => prev.map(m => m.id === member.id ? { ...m, age: Number(e.target.value) } : m));
                              }}
                              placeholder="Age (Years)"
                              className="bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-medium text-slate-900 focus:outline-none focus:border-indigo-600"
                            />

                            <select
                              value={member.role}
                              onChange={e => {
                                setMembers(prev => prev.map(m => m.id === member.id ? { ...m, role: e.target.value as any } : m));
                              }}
                              className="bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-bold text-slate-700 focus:outline-none focus:border-indigo-600"
                            >
                              {MEMBER_ROLES.map(r => (
                                <option key={r} value={r}>{r}</option>
                              ))}
                            </select>

                            <div className="flex items-center space-x-2">
                              <input
                                type="text"
                                value={member.grade_level || ''}
                                onChange={e => {
                                  setMembers(prev => prev.map(m => m.id === member.id ? { ...m, grade_level: e.target.value } : m));
                                }}
                                placeholder="Grade / Form / Level"
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-medium text-slate-900 focus:outline-none focus:border-indigo-600"
                              />

                              {members.length > 4 && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveMember(member.id)}
                                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                                  title="Remove Member"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={handleAddMember}
                      className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center space-x-2 transition-all"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Additional Team Member</span>
                    </button>
                  </div>
                )}

                {/* STEP 4: CHALLENGE INFORMATION */}
                {currentStep === 4 && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-black text-slate-900">Step 4 — Technical Challenge Specifications</h3>
                      <p className="text-slate-500 text-xs mt-1">
                        Fill in specific parameters for your selected competition challenges.
                      </p>
                    </div>

                    {/* Underwater Drone Challenge Specs */}
                    {selectedCategories.includes('underwater_drone') && (
                      <div className="p-5 bg-blue-50/50 rounded-2xl border border-blue-200/80 space-y-4">
                        <div className="flex items-center space-x-2 text-blue-900 font-bold text-sm">
                          <Waves className="w-4 h-4 text-blue-600" />
                          <span>Underwater Drone Mission Challenge Specifications</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-700">Do you currently have an ROV / Underwater Robot?</label>
                            <div className="flex space-x-2 pt-1">
                              <button
                                type="button"
                                onClick={() => setUnderwaterInfo(prev => ({ ...prev, has_rov: true }))}
                                className={cn("px-4 py-2 rounded-xl text-xs font-bold", underwaterInfo.has_rov ? "bg-blue-600 text-white" : "bg-white text-slate-700 border")}
                              >
                                Yes
                              </button>
                              <button
                                type="button"
                                onClick={() => setUnderwaterInfo(prev => ({ ...prev, has_rov: false }))}
                                className={cn("px-4 py-2 rounded-xl text-xs font-bold", !underwaterInfo.has_rov ? "bg-blue-600 text-white" : "bg-white text-slate-700 border")}
                              >
                                No (In Development)
                              </button>
                            </div>
                          </div>

                          <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-700">Will you build your own custom ROV frame?</label>
                            <div className="flex space-x-2 pt-1">
                              <button
                                type="button"
                                onClick={() => setUnderwaterInfo(prev => ({ ...prev, will_build_own: true }))}
                                className={cn("px-4 py-2 rounded-xl text-xs font-bold", underwaterInfo.will_build_own ? "bg-blue-600 text-white" : "bg-white text-slate-700 border")}
                              >
                                Yes (Custom Build)
                              </button>
                              <button
                                type="button"
                                onClick={() => setUnderwaterInfo(prev => ({ ...prev, will_build_own: false }))}
                                className={cn("px-4 py-2 rounded-xl text-xs font-bold", !underwaterInfo.will_build_own ? "bg-blue-600 text-white" : "bg-white text-slate-700 border")}
                              >
                                Kit / Adapted Frame
                              </button>
                            </div>
                          </div>

                          <div className="space-y-1.5 md:col-span-2">
                            <label className="text-xs font-bold text-slate-700">Robot Description & Buoyancy Approach</label>
                            <textarea
                              rows={2}
                              value={underwaterInfo.robot_description}
                              onChange={e => setUnderwaterInfo(prev => ({ ...prev, robot_description: e.target.value }))}
                              placeholder="Describe thruster layout, waterproofing approach, and grabber/retrieval arm mechanism..."
                              className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700">Main Controller</label>
                            <input
                              type="text"
                              value={underwaterInfo.main_controller}
                              onChange={e => setUnderwaterInfo(prev => ({ ...prev, main_controller: e.target.value }))}
                              className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-900"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700">Sensors & Cameras Used</label>
                            <input
                              type="text"
                              value={underwaterInfo.sensors_used}
                              onChange={e => setUnderwaterInfo(prev => ({ ...prev, sensors_used: e.target.value }))}
                              className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-900"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700">Communication & Tether Method</label>
                            <input
                              type="text"
                              value={underwaterInfo.communication_method}
                              onChange={e => setUnderwaterInfo(prev => ({ ...prev, communication_method: e.target.value }))}
                              className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-900"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700">Dimensions & Power Source</label>
                            <input
                              type="text"
                              value={underwaterInfo.power_source}
                              onChange={e => setUnderwaterInfo(prev => ({ ...prev, power_source: e.target.value }))}
                              className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-900"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Autonomous Maze Specs */}
                    {selectedCategories.includes('autonomous_maze') && (
                      <div className="p-5 bg-amber-50/50 rounded-2xl border border-amber-200/80 space-y-4">
                        <div className="flex items-center space-x-2 text-amber-900 font-bold text-sm">
                          <Compass className="w-4 h-4 text-amber-600" />
                          <span>Autonomous Maze Solving Challenge Specifications</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700">Robot Name</label>
                            <input
                              type="text"
                              value={mazeInfo.robot_name}
                              onChange={e => setMazeInfo(prev => ({ ...prev, robot_name: e.target.value }))}
                              placeholder="e.g. Minotaur-X1"
                              className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-900"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700">Microcontroller / Board</label>
                            <input
                              type="text"
                              value={mazeInfo.controller}
                              onChange={e => setMazeInfo(prev => ({ ...prev, controller: e.target.value }))}
                              className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-900"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700">Sensors Array</label>
                            <input
                              type="text"
                              value={mazeInfo.sensors}
                              onChange={e => setMazeInfo(prev => ({ ...prev, sensors: e.target.value }))}
                              placeholder="Ultrasonic / ToF Laser / IR array"
                              className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-900"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700">Programming Language & Algorithms</label>
                            <input
                              type="text"
                              value={mazeInfo.navigation_method}
                              onChange={e => setMazeInfo(prev => ({ ...prev, navigation_method: e.target.value }))}
                              placeholder="e.g. FloodFill / Left-hand Wall PID in C++"
                              className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-900"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Innovation Pitch Specs */}
                    {selectedCategories.includes('innovation_pitch') && (
                      <div className="p-5 bg-emerald-50/50 rounded-2xl border border-emerald-200/80 space-y-4">
                        <div className="flex items-center space-x-2 text-emerald-900 font-bold text-sm">
                          <Lightbulb className="w-4 h-4 text-emerald-600" />
                          <span>Innovation Pitch Challenge (Technology for the Underserved)</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1.5 md:col-span-2">
                            <label className="text-xs font-bold text-slate-700">Project Title *</label>
                            <input
                              type="text"
                              required
                              value={pitchInfo.project_title}
                              onChange={e => setPitchInfo(prev => ({ ...prev, project_title: e.target.value }))}
                              placeholder="e.g. Solar-Powered Smart Irrigation for Rural Youth Farm Cooperatives"
                              className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs font-bold text-slate-900"
                            />
                          </div>

                          <div className="space-y-1.5 md:col-span-2">
                            <label className="text-xs font-bold text-slate-700">Problem Being Addressed for Underserved Youth</label>
                            <textarea
                              rows={2}
                              value={pitchInfo.problem_addressed}
                              onChange={e => setPitchInfo(prev => ({ ...prev, problem_addressed: e.target.value }))}
                              placeholder="Describe the real-world limitation in STEM education, agriculture, healthcare, or digital access..."
                              className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-900"
                            />
                          </div>

                          <div className="space-y-1.5 md:col-span-2">
                            <label className="text-xs font-bold text-slate-700">Proposed Technology Solution & Impact</label>
                            <textarea
                              rows={2}
                              value={pitchInfo.proposed_solution}
                              onChange={e => setPitchInfo(prev => ({ ...prev, proposed_solution: e.target.value }))}
                              placeholder="How your robotics, embedded device, or AI innovation creates measurable opportunity..."
                              className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-900"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700">Project Stage</label>
                            <select
                              value={pitchInfo.project_stage}
                              onChange={e => setPitchInfo(prev => ({ ...prev, project_stage: e.target.value as any }))}
                              className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-900"
                            >
                              <option value="Concept">Concept & Research</option>
                              <option value="Working Prototype">Working Hardware / Software Prototype</option>
                              <option value="Tested & Deployed">Tested in Field / Community Deployed</option>
                            </select>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700">Pitch Format</label>
                            <p className="text-xs text-slate-500 pt-2 font-medium">
                              5-Minute Presentation + 3-Minute Judges Defense
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* STEP 5: PROJECT SUBMISSIONS / UPLOADS */}
                {currentStep === 5 && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-black text-slate-900">Step 5 — Project Documentation & Media Uploads</h3>
                      <p className="text-slate-500 text-xs mt-1">
                        Upload your engineering proposal, circuit diagrams, pitch deck, or demonstration video link.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {[
                        { type: 'project_proposal' as const, label: 'Project Proposal', icon: FileText },
                        { type: 'robot_description' as const, label: 'Robot Description / Specs', icon: Layers },
                        { type: 'pitch_deck_pdf' as const, label: 'Pitch Deck (PDF)', icon: Lightbulb },
                        { type: 'technical_doc' as const, label: 'Technical Schematics', icon: FileCheck },
                        { type: 'image' as const, label: 'Hardware Photo', icon: Upload }
                      ].map(item => (
                        <button
                          key={item.type}
                          type="button"
                          disabled={uploadingDoc}
                          onClick={() => handleSimulateFileUpload(item.type)}
                          className="p-4 rounded-2xl border border-dashed border-indigo-200 bg-indigo-50/40 hover:bg-indigo-50 text-indigo-950 flex flex-col items-center justify-center text-center space-y-2 transition-all hover:scale-[1.02]"
                        >
                          <item.icon className="w-6 h-6 text-indigo-600" />
                          <span className="font-bold text-xs">{item.label}</span>
                          <span className="text-[10px] text-indigo-500">PDF / DOC / JPG (Max 10MB)</span>
                        </button>
                      ))}
                    </div>

                    {uploadingDoc && (
                      <div className="p-3 bg-indigo-50 rounded-xl flex items-center space-x-3 text-xs text-indigo-700 font-bold animate-pulse">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-indigo-600 border-t-transparent"></div>
                        <span>Uploading and validating document...</span>
                      </div>
                    )}

                    {/* Uploaded Documents List */}
                    {documents.length > 0 && (
                      <div className="space-y-2">
                        <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Uploaded Documents ({documents.length})</span>
                        <div className="space-y-2">
                          {documents.map(doc => (
                            <div key={doc.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                              <div className="flex items-center space-x-2">
                                <FileCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                                <span className="font-bold text-slate-800">{doc.name}</span>
                                <span className="text-slate-400">({doc.size_kb} KB)</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => setDocuments(prev => prev.filter(d => d.id !== doc.id))}
                                className="text-slate-400 hover:text-red-600 p-1"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Video URL */}
                    <div className="space-y-1.5 pt-2">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center space-x-1.5">
                        <Video className="w-4 h-4 text-indigo-600" />
                        <span>Demonstration Video URL (YouTube, Vimeo, Google Drive)</span>
                      </label>
                      <input
                        type="url"
                        value={videoUrl}
                        onChange={e => setVideoUrl(e.target.value)}
                        placeholder="https://youtu.be/... or https://drive.google.com/..."
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
                      />
                    </div>
                  </div>
                )}

                {/* STEP 6: DECLARATION & CONSENTS */}
                {currentStep === 6 && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-black text-slate-900">Step 6 — Declaration & Consent Management</h3>
                      <p className="text-slate-500 text-xs mt-1">
                        Please review each consent requirement separately. Minor participant privacy is strictly protected.
                      </p>
                    </div>

                    <div className="space-y-4">
                      {/* Checkbox 1: Rules Agreement */}
                      <label className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-start space-x-3 cursor-pointer hover:bg-slate-100/70 transition-all">
                        <input
                          type="checkbox"
                          checked={consents.competition_rules_agreed}
                          onChange={e => setConsents(prev => ({ ...prev, competition_rules_agreed: e.target.checked }))}
                          className="mt-0.5 w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                        />
                        <div className="text-xs">
                          <span className="font-bold text-slate-900">Competition Rules & Fair Play Agreement *</span>
                          <p className="text-slate-500 mt-0.5">
                            “I confirm that the information provided is accurate and that my team agrees to comply with the YARA Educational Robotics Competition 2026 rules and regulations.”
                          </p>
                        </div>
                      </label>

                      {/* Checkbox 2: Minor Consent */}
                      <label className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-start space-x-3 cursor-pointer hover:bg-slate-100/70 transition-all">
                        <input
                          type="checkbox"
                          checked={consents.parent_guardian_consent_minor}
                          onChange={e => setConsents(prev => ({ ...prev, parent_guardian_consent_minor: e.target.checked }))}
                          className="mt-0.5 w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                        />
                        <div className="text-xs">
                          <span className="font-bold text-slate-900">Parent / Guardian Consent for Minors *</span>
                          <p className="text-slate-500 mt-0.5">
                            I verify that explicit authorization has been secured from parents or legal guardians for all underage participants in this cohort.
                          </p>
                        </div>
                      </label>

                      {/* Checkbox 3: Event Participation */}
                      <label className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-start space-x-3 cursor-pointer hover:bg-slate-100/70 transition-all">
                        <input
                          type="checkbox"
                          checked={consents.event_participation_consent}
                          onChange={e => setConsents(prev => ({ ...prev, event_participation_consent: e.target.checked }))}
                          className="mt-0.5 w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                        />
                        <div className="text-xs">
                          <span className="font-bold text-slate-900">Event Attendance & Participation Consent *</span>
                          <p className="text-slate-500 mt-0.5">
                            Consent for team members to participate in the physical arena rounds, live stream broadcasts, and judging evaluation sessions.
                          </p>
                        </div>
                      </label>

                      {/* Checkbox 4: Media, Photo & Video */}
                      <label className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-start space-x-3 cursor-pointer hover:bg-slate-100/70 transition-all">
                        <input
                          type="checkbox"
                          checked={consents.media_photo_video_consent}
                          onChange={e => setConsents(prev => ({ ...prev, media_photo_video_consent: e.target.checked }))}
                          className="mt-0.5 w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                        />
                        <div className="text-xs">
                          <span className="font-bold text-slate-900">Photography & Videography Consent *</span>
                          <p className="text-slate-500 mt-0.5">
                            Consent to photography, videography, and interviews during the competition for event record-keeping.
                          </p>
                        </div>
                      </label>

                      {/* Checkbox 5: Educational / Promotional Use */}
                      <label className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-start space-x-3 cursor-pointer hover:bg-slate-100/70 transition-all">
                        <input
                          type="checkbox"
                          checked={consents.promotional_educational_use_consent}
                          onChange={e => setConsents(prev => ({ ...prev, promotional_educational_use_consent: e.target.checked }))}
                          className="mt-0.5 w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                        />
                        <div className="text-xs">
                          <span className="font-bold text-slate-900">Educational & Non-Profit Promotional Use</span>
                          <p className="text-slate-500 mt-0.5">
                            Permission for YARA to feature robot photos and project summaries to inspire youth across Africa.
                          </p>
                        </div>
                      </label>
                    </div>
                  </div>
                )}

                {/* STEP 7: REVIEW & SUBMIT */}
                {currentStep === 7 && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-black text-slate-900">Step 7 — Registration Dossier Summary</h3>
                      <p className="text-slate-500 text-xs mt-1">
                        Please review all submitted information before finalizing your entry.
                      </p>
                    </div>

                    <div className="bg-slate-50 rounded-3xl p-6 border border-slate-200 space-y-4 text-xs">
                      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                        <div>
                          <span className="font-black text-slate-900 text-base">{teamName}</span>
                          <p className="text-slate-500">{schoolOrg} • {province} ({district})</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setCurrentStep(2)}
                          className="text-indigo-600 font-bold hover:underline"
                        >
                          Edit Details
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <span className="font-bold text-slate-700">Leader & Contacts:</span>
                          <p className="text-slate-600">{leaderName} ({leaderEmail} | {leaderPhone || 'No phone'})</p>
                          {mentorName && <p className="text-slate-500 mt-0.5">Mentor: {mentorName} ({mentorEmail || 'No email'})</p>}
                        </div>

                        <div>
                          <span className="font-bold text-slate-700">Registered Challenges:</span>
                          <p className="text-slate-600 font-medium">{selectedCategories.join(', ')}</p>
                        </div>
                      </div>

                      {/* Members Summary */}
                      <div className="pt-2 border-t border-slate-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-slate-700">Roster ({members.length} participants — {compositionStatus.boysCount} Boys, {compositionStatus.girlsCount} Girls):</span>
                          <button
                            type="button"
                            onClick={() => setCurrentStep(3)}
                            className="text-indigo-600 font-bold hover:underline"
                          >
                            Edit Members
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {members.map(m => (
                            <div key={m.id} className="p-2.5 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
                              <span className="font-bold text-slate-800">{m.full_name} {m.is_captain && '(Captain)'}</span>
                              <span className="text-[11px] text-slate-500">{m.gender === 'boy' ? '👦 Boy' : '👧 Girl'} • {m.role}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer Controls */}
          {!submittedRegistration && (
            <div className="p-6 md:px-8 border-t border-slate-100 bg-slate-50/50 rounded-b-3xl md:rounded-b-[2.5rem] flex items-center justify-between shrink-0">
              <button
                type="button"
                disabled={currentStep === 1 || submitting}
                onClick={() => setCurrentStep(prev => Math.max(prev - 1, 1))}
                className={cn(
                  "px-5 py-2.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all",
                  currentStep > 1 ? "bg-white border border-slate-200 text-slate-700 hover:bg-slate-100" : "opacity-0 cursor-default"
                )}
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              {currentStep < 7 ? (
                <button
                  type="button"
                  onClick={validateAndNext}
                  className="px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200 flex items-center space-x-1.5 transition-all"
                >
                  <span>Continue</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  disabled={submitting || !compositionStatus.isEligible}
                  onClick={handleFinalSubmit}
                  className={cn(
                    "px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all flex items-center space-x-2 shadow-lg",
                    compositionStatus.isEligible && !submitting
                      ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200"
                      : "bg-slate-200 text-slate-400 cursor-not-allowed"
                  )}
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      <span>Submitting Registration...</span>
                    </>
                  ) : (
                    <>
                      <span>Submit YARA 2026 Registration</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
