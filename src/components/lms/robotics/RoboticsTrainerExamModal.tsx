import React, { useState, useEffect } from 'react';
import { 
  X, 
  Award, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  HelpCircle, 
  Lock, 
  Unlock, 
  ArrowRight, 
  ArrowLeft, 
  Send, 
  Sparkles, 
  FileText, 
  Video, 
  Users, 
  RefreshCw,
  ExternalLink,
  BookOpen
} from 'lucide-react';
import { 
  roboticsTrainingService, 
  YARA_TRAINER_EXAM_QUESTIONS,
  CORE_ROBOTICS_LEVEL_IDS,
  ROBOTICS_PATHWAYS_CATALOG
} from '../../../services/roboticsTrainingService';
import { 
  RoboticsCertificationLevelId, 
  TrainerMentorshipSubmission 
} from '../../../types/roboticsTraining';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
  userEmail?: string;
  userName?: string;
  userSchoolOrChapter?: string;
  userPhone?: string;
  onCertificateIssued?: (certNumber: string, title: string, grade: string) => void;
}

export const RoboticsTrainerExamModal: React.FC<Props> = ({
  isOpen,
  onClose,
  userId = 'guest',
  userEmail = '',
  userName = 'YARA Educator',
  userSchoolOrChapter = 'YARA Robotics Chapter',
  userPhone = '',
  onCertificateIssued
}) => {
  // Tabs / Steps: 'prerequisites' | 'examination' | 'mentorship_proof' | 'result'
  const [activeStep, setActiveStep] = useState<'prerequisites' | 'examination' | 'mentorship_proof' | 'result'>('prerequisites');

  // Prerequisite check state
  const [eligibility, setEligibility] = useState<{
    isEligible: boolean;
    completedLevels: RoboticsCertificationLevelId[];
    missingLevels: RoboticsCertificationLevelId[];
    totalCompleted: number;
  }>({
    isEligible: false,
    completedLevels: [],
    missingLevels: CORE_ROBOTICS_LEVEL_IDS,
    totalCompleted: 0
  });

  const [loadingEligibility, setLoadingEligibility] = useState(true);

  // Examination State
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [examSubmitted, setExamSubmitted] = useState(false);
  const [examScore, setExamScore] = useState(0); // 0 to 100
  const [examPassed, setExamPassed] = useState(false);

  // Mentorship Portfolio State
  const [portfolioForm, setPortfolioForm] = useState({
    fullName: userName,
    email: userEmail,
    phone: userPhone,
    schoolOrChapter: userSchoolOrChapter,
    mentorshipSummary: '',
    portfolioUrl: '',
    demonstrationVideoUrl: '',
    referenceDetails: ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<TrainerMentorshipSubmission | null>(null);

  // Load user completed levels when modal opens
  useEffect(() => {
    if (isOpen) {
      loadEligibility();
    }
  }, [isOpen, userId]);

  const loadEligibility = async () => {
    setLoadingEligibility(true);
    try {
      const data = await roboticsTrainingService.checkTrainerEligibility(userId);
      if (data) {
        setEligibility({
          isEligible: Boolean(data.isEligible),
          completedLevels: Array.isArray(data.completedLevels) ? data.completedLevels : [],
          missingLevels: Array.isArray(data.missingLevels) ? data.missingLevels : [],
          totalCompleted: Number(data.totalCompleted) || 0
        });
        if (data.isEligible) {
          // If already completed all 4, start directly on prerequisites confirmation or exam
          setActiveStep('prerequisites');
        }
      }
    } catch (err) {
      console.error('Failed to check trainer eligibility:', err);
      setEligibility({
        isEligible: false,
        completedLevels: [],
        missingLevels: [...CORE_ROBOTICS_LEVEL_IDS],
        totalCompleted: 0
      });
    } finally {
      setLoadingEligibility(false);
    }
  };

  const handleSimulateAllLevels = () => {
    // Allows testing/admin fast-track
    roboticsTrainingService.setUserCompletedLevels(userId, [...CORE_ROBOTICS_LEVEL_IDS]);
    setEligibility({
      isEligible: true,
      completedLevels: [...CORE_ROBOTICS_LEVEL_IDS],
      missingLevels: [],
      totalCompleted: 4
    });
  };

  const handleResetLevels = () => {
    roboticsTrainingService.setUserCompletedLevels(userId, ['level_1_explorer']);
    setEligibility({
      isEligible: false,
      completedLevels: ['level_1_explorer'],
      missingLevels: ['level_2_junior', 'level_3_secondary', 'level_4_advanced'],
      totalCompleted: 1
    });
  };

  const handleSelectOption = (questionId: string, optionIndex: number) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: optionIndex
    }));
  };

  const calculateExamScore = () => {
    let correctCount = 0;
    YARA_TRAINER_EXAM_QUESTIONS.forEach(q => {
      if (answers[q.id] === q.correctIndex) {
        correctCount += 1;
      }
    });

    const scorePercent = Math.round((correctCount / YARA_TRAINER_EXAM_QUESTIONS.length) * 100);
    const passed = scorePercent >= 80;

    setExamScore(scorePercent);
    setExamPassed(passed);
    setExamSubmitted(true);

    if (passed) {
      setActiveStep('mentorship_proof');
    }
  };

  const handleSubmitFinalPortfolio = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!portfolioForm.mentorshipSummary.trim()) {
      alert('Please provide a summary of your robotics mentorship or teaching experience.');
      return;
    }

    setSubmitting(true);
    try {
      const submission = await roboticsTrainingService.submitTrainerExamination({
        userId,
        fullName: portfolioForm.fullName || userName,
        email: portfolioForm.email || userEmail,
        phone: portfolioForm.phone || userPhone,
        schoolOrChapter: portfolioForm.schoolOrChapter || userSchoolOrChapter,
        mentorshipExperienceSummary: portfolioForm.mentorshipSummary,
        portfolioUrl: portfolioForm.portfolioUrl,
        demonstrationVideoUrl: portfolioForm.demonstrationVideoUrl,
        menteeOrPatronReference: portfolioForm.referenceDetails,
        examScore,
        examPassed
      });

      setSubmissionResult(submission);
      setActiveStep('result');

      if (submission.certificateNumber && onCertificateIssued) {
        onCertificateIssued(
          submission.certificateNumber,
          'Become YARA Certified Robotics Trainer or Mentor',
          examScore >= 95 ? 'Mastery Distinction' : 'Certified'
        );
      }
    } catch (err) {
      console.error('Error submitting trainer portfolio:', err);
      alert('An error occurred submitting your qualification. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const currentQ = YARA_TRAINER_EXAM_QUESTIONS[currentQuestionIndex];
  const totalQuestions = YARA_TRAINER_EXAM_QUESTIONS.length;
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="px-6 py-5 bg-[#0A1B4D] text-white flex items-center justify-between border-b border-[#0D47A1]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-amber-400 text-slate-950">
                  Pinnacle Qualification
                </span>
                <span className="text-xs text-blue-200 font-semibold">
                  Accredited by YARA
                </span>
              </div>
              <h3 className="text-lg font-black text-white mt-0.5">
                Become YARA Certified Robotics Trainer or Mentor
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-white/10 text-white/80 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stepper Navigation */}
        <div className="px-6 py-3 bg-slate-100 border-b border-slate-200 flex items-center justify-between gap-2 overflow-x-auto text-xs font-bold">
          <button
            onClick={() => setActiveStep('prerequisites')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl transition ${
              activeStep === 'prerequisites' ? 'bg-[#0A1B4D] text-white' : 'text-slate-600 hover:text-slate-950'
            }`}
          >
            <span>1. 4-Level Prerequisites</span>
            {eligibility.isEligible ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <Lock className="w-3.5 h-3.5 text-amber-500" />
            )}
          </button>

          <button
            onClick={() => {
              if (eligibility.isEligible) setActiveStep('examination');
            }}
            disabled={!eligibility.isEligible}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl transition ${
              !eligibility.isEligible ? 'opacity-50 cursor-not-allowed text-slate-400' :
              activeStep === 'examination' ? 'bg-[#0A1B4D] text-white' : 'text-slate-600 hover:text-slate-950'
            }`}
          >
            <span>2. Trainer Examination (20 Qs)</span>
            {examSubmitted && (
              <span className={`text-[10px] px-1.5 py-0.2 rounded font-extrabold ${examPassed ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
                {examScore}%
              </span>
            )}
          </button>

          <button
            onClick={() => {
              if (examPassed) setActiveStep('mentorship_proof');
            }}
            disabled={!examPassed}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl transition ${
              !examPassed ? 'opacity-50 cursor-not-allowed text-slate-400' :
              activeStep === 'mentorship_proof' ? 'bg-[#0A1B4D] text-white' : 'text-slate-600 hover:text-slate-950'
            }`}
          >
            <span>3. Mentorship Proof</span>
            <Users className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => {
              if (submissionResult) setActiveStep('result');
            }}
            disabled={!submissionResult}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl transition ${
              !submissionResult ? 'opacity-50 cursor-not-allowed text-slate-400' :
              activeStep === 'result' ? 'bg-[#0A1B4D] text-white' : 'text-slate-600 hover:text-slate-950'
            }`}
          >
            <span>4. Official Credential</span>
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* STEP 1: PREREQUISITES VERIFICATION */}
          {activeStep === 'prerequisites' && (
            <div className="space-y-6 animate-fade-in">
              <div className="p-5 rounded-2xl bg-[#E8F4FF] border border-[#1976D2]/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-[11px] font-black uppercase text-[#0D47A1] tracking-wider">
                    Mandatory Qualification Rule
                  </span>
                  <h4 className="text-base font-extrabold text-[#0A1B4D]">
                    Strict Completion of All 4 Robotics Levels Required
                  </h4>
                  <p className="text-xs text-slate-600 max-w-xl">
                    To maintain international instructional standards and child safety across African robotics clubs, this certification is exclusively offered to innovators who have completed all four foundational robotics levels, demonstrated pedagogical competence in an examination, and verified practical mentorship.
                  </p>
                </div>
                <div className="text-center sm:text-right shrink-0">
                  <div className="text-2xl font-black text-[#0A1B4D]">
                    {eligibility.totalCompleted} / 4
                  </div>
                  <div className="text-[11px] font-bold text-slate-500 uppercase">
                    Levels Completed
                  </div>
                </div>
              </div>

              {/* 4 Core Robotics Levels Checklist */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  {
                    id: 'level_1_explorer' as RoboticsCertificationLevelId,
                    num: 'Level 1',
                    title: 'Robotics Explorer Certificate',
                    audience: 'ECD / Infants / Early Primary',
                    desc: 'Foundational electronics, Scratch visual logic, and closed-circuit safety.'
                  },
                  {
                    id: 'level_2_junior' as RoboticsCertificationLevelId,
                    num: 'Level 2',
                    title: 'Junior Robotics Certificate',
                    audience: 'Grades 3 – 7 (Primary)',
                    desc: 'Sensor dividers, dual-motor chassis mechanics, and autonomous obstacle navigation.'
                  },
                  {
                    id: 'level_3_secondary' as RoboticsCertificationLevelId,
                    num: 'Level 3',
                    title: 'Secondary Robotics Certificate',
                    audience: 'High School (Forms 1 – 6)',
                    desc: 'Embedded C++, Arduino/ESP32, PID line tracking, and competition trials.'
                  },
                  {
                    id: 'level_4_advanced' as RoboticsCertificationLevelId,
                    num: 'Level 4',
                    title: 'Advanced Robotics & Engineering Certificate',
                    audience: 'Tertiary & Advanced High School',
                    desc: 'Computer vision, underwater ROVs, IoT telemetry, and 21-point engineering jury defense.'
                  }
                ].map(lvl => {
                  const isDone = Boolean(eligibility?.completedLevels?.includes(lvl.id));
                  return (
                    <div 
                      key={lvl.id}
                      className={`p-4 rounded-2xl border transition-all ${
                        isDone 
                          ? 'bg-emerald-500/10 border-emerald-500/30' 
                          : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                          isDone ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-700'
                        }`}>
                          {lvl.num}
                        </span>
                        {isDone ? (
                          <div className="flex items-center gap-1 text-xs font-bold text-emerald-700">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <span>Completed &amp; Verified</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-xs font-bold text-amber-600">
                            <Lock className="w-3.5 h-3.5" />
                            <span>Pending Completion</span>
                          </div>
                        )}
                      </div>
                      <h5 className="text-sm font-extrabold text-[#0A1B4D]">{lvl.title}</h5>
                      <div className="text-[11px] text-slate-500 font-semibold mb-1">{lvl.audience}</div>
                      <p className="text-xs text-slate-600 leading-relaxed">{lvl.desc}</p>
                    </div>
                  );
                })}
              </div>

              {/* Developer / Admin Test Simulation Controls */}
              <div className="p-4 rounded-2xl bg-slate-100 border border-slate-200 text-xs text-slate-600 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="font-bold text-slate-900 block">Candidate Testing &amp; Simulation Controls</span>
                  <p className="text-[11px] text-slate-500">
                    Admins and mentors can fast-track or toggle completion status to inspect the full Trainer exam and credential generation pipeline.
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={handleSimulateAllLevels}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] transition cursor-pointer"
                  >
                    Simulate All 4 Levels Completed
                  </button>
                  <button
                    onClick={handleResetLevels}
                    className="px-3 py-1.5 rounded-xl bg-slate-300 hover:bg-slate-400 text-slate-800 font-bold text-[11px] transition cursor-pointer"
                  >
                    Reset to 1 Level
                  </button>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-2 flex justify-end">
                {eligibility.isEligible ? (
                  <button
                    onClick={() => setActiveStep('examination')}
                    className="px-6 py-3 rounded-2xl bg-[#0A1B4D] hover:bg-[#0D47A1] text-white font-extrabold text-xs uppercase tracking-wider shadow-lg transition flex items-center gap-2 cursor-pointer"
                  >
                    <span>Proceed to Trainer Examination</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <div className="flex items-center gap-2 text-amber-700 bg-amber-50 border border-amber-200 px-4 py-2.5 rounded-xl text-xs font-bold">
                    <Lock className="w-4 h-4 shrink-0" />
                    <span>Complete all 4 robotics levels first or use the simulation control above to unlock.</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 2: TRAINER & MENTOR EXAMINATION */}
          {activeStep === 'examination' && (
            <div className="space-y-6 animate-fade-in">
              {/* Exam Header Bar */}
              <div className="p-4 rounded-2xl bg-[#0A1B4D] text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] font-black uppercase text-[#00C6FF] tracking-wider">
                    Competency Assessment
                  </span>
                  <h4 className="text-base font-extrabold text-white mt-0.5">
                    YARA Certified Robotics Trainer Qualification Examination
                  </h4>
                  <p className="text-xs text-blue-200">
                    20 randomized questions covering pedagogy, lab safety, firmware, electronics fault diagnosis, and competition coaching. Minimum 80% required to pass.
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-lg font-black text-amber-400">
                    {answeredCount} / {totalQuestions}
                  </div>
                  <div className="text-[10px] font-bold text-blue-200 uppercase">Answered</div>
                </div>
              </div>

              {/* Question Navigation Bubbles */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {YARA_TRAINER_EXAM_QUESTIONS.map((q, idx) => {
                  const isAnswered = answers[q.id] !== undefined;
                  const isCurrent = idx === currentQuestionIndex;
                  return (
                    <button
                      key={q.id}
                      onClick={() => setCurrentQuestionIndex(idx)}
                      className={`w-8 h-8 rounded-xl text-xs font-bold transition flex items-center justify-center cursor-pointer ${
                        isCurrent
                          ? 'bg-[#0A1B4D] text-white ring-2 ring-[#00C6FF]'
                          : isAnswered
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>

              {/* Current Question Display */}
              <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-[#1976D2] uppercase tracking-wider">
                    Question {currentQuestionIndex + 1} of {totalQuestions} • {currentQ.category}
                  </span>
                  {answers[currentQ.id] !== undefined && (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      Answer Selected
                    </span>
                  )}
                </div>

                <h5 className="text-base font-bold text-[#0A1B4D] leading-relaxed">
                  {currentQ.question}
                </h5>

                <div className="space-y-2.5 pt-2">
                  {currentQ.options.map((opt, optIdx) => {
                    const isSelected = answers[currentQ.id] === optIdx;
                    return (
                      <button
                        key={optIdx}
                        type="button"
                        onClick={() => handleSelectOption(currentQ.id, optIdx)}
                        className={`w-full p-4 rounded-2xl text-left text-xs font-semibold border transition cursor-pointer flex items-start gap-3 ${
                          isSelected
                            ? 'bg-[#0D47A1] text-white border-[#0D47A1] shadow-md'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-100/50'
                        }`}
                      >
                        <span className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 text-[10px] font-black ${
                          isSelected ? 'bg-white text-[#0D47A1] border-white' : 'border-slate-300 text-slate-500'
                        }`}>
                          {String.fromCharCode(65 + optIdx)}
                        </span>
                        <span className="flex-1 leading-relaxed">{opt}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Exam Bottom Navigation Controls */}
              <div className="flex items-center justify-between gap-3 pt-2">
                <button
                  onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                  disabled={currentQuestionIndex === 0}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs disabled:opacity-40 transition flex items-center gap-1 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>

                <div className="flex items-center gap-2">
                  {currentQuestionIndex < totalQuestions - 1 ? (
                    <button
                      onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
                      className="px-5 py-2.5 rounded-xl bg-[#0D47A1] hover:bg-[#0A1B4D] text-white font-bold text-xs transition flex items-center gap-1 cursor-pointer"
                    >
                      <span>Next Question</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={calculateExamScore}
                      disabled={answeredCount < totalQuestions}
                      className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-300 text-white font-extrabold text-xs uppercase tracking-wider transition shadow-md flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>Submit Examination &amp; Grade</span>
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: MENTORSHIP & PRACTICAL DEMONSTRATION PROOF */}
          {activeStep === 'mentorship_proof' && (
            <form onSubmit={handleSubmitFinalPortfolio} className="space-y-6 animate-fade-in">
              <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-base font-extrabold text-emerald-900">
                    Trainer Examination Passed: {examScore}% (Distinction Level)
                  </h4>
                  <p className="text-xs text-emerald-700 mt-0.5">
                    You have demonstrated mastery in pedagogy, bench safety, and engineering fault finding. To complete your certification, submit proof of your practical mentoring or teaching experience.
                  </p>
                </div>
              </div>

              <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200 space-y-4">
                <h4 className="text-base font-bold text-[#0A1B4D]">
                  Mentorship &amp; Instructional Experience Profile
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Candidate Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={portfolioForm.fullName}
                      onChange={e => setPortfolioForm({ ...portfolioForm, fullName: e.target.value })}
                      placeholder="e.g. Tendai Moyo"
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#0D47A1]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      School, Club or Chapter Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={portfolioForm.schoolOrChapter}
                      onChange={e => setPortfolioForm({ ...portfolioForm, schoolOrChapter: e.target.value })}
                      placeholder="e.g. YARA Innovation Hub or High School Robotics Chapter"
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#0D47A1]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Mentorship &amp; Teaching Summary * (Describe your hands-on coaching)
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={portfolioForm.mentorshipSummary}
                    onChange={e => setPortfolioForm({ ...portfolioForm, mentorshipSummary: e.target.value })}
                    placeholder="Provide details on sessions conducted: how many learners mentored, age groups, robotics kits used, and how you supported student troubleshooting and competition prep..."
                    className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-[#0D47A1] resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Demonstration Video URL (Optional but recommended)
                    </label>
                    <input
                      type="url"
                      value={portfolioForm.demonstrationVideoUrl}
                      onChange={e => setPortfolioForm({ ...portfolioForm, demonstrationVideoUrl: e.target.value })}
                      placeholder="https://youtube.com/... or Google Drive video link"
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#0D47A1]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Portfolio / GitHub / Project Link (Optional)
                    </label>
                    <input
                      type="url"
                      value={portfolioForm.portfolioUrl}
                      onChange={e => setPortfolioForm({ ...portfolioForm, portfolioUrl: e.target.value })}
                      placeholder="https://github.com/... or portfolio site"
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#0D47A1]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Patron, Principal, or Mentee Recommendation Reference
                  </label>
                  <input
                    type="text"
                    value={portfolioForm.referenceDetails}
                    onChange={e => setPortfolioForm({ ...portfolioForm, referenceDetails: e.target.value })}
                    placeholder="e.g. Mrs. R. Chidzero (Head of Science / Club Patron) — +263 77 000 0000"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#0D47A1]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveStep('examination')}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs transition"
                >
                  Review Examination
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Generating Accredited Credential...</span>
                    </>
                  ) : (
                    <>
                      <span>Complete Certification &amp; Issue Credential</span>
                      <Sparkles className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* STEP 4: FINAL ACCREDITED CREDENTIAL RESULT */}
          {activeStep === 'result' && submissionResult && (
            <div className="space-y-6 text-center py-4 animate-fade-in">
              <div className="w-20 h-20 rounded-3xl bg-amber-500/20 border-2 border-amber-500 text-amber-500 flex items-center justify-center mx-auto shadow-lg">
                <Award className="w-10 h-10" />
              </div>

              <div className="max-w-md mx-auto space-y-2">
                <span className="text-[11px] font-black uppercase tracking-widest text-amber-600">
                  Accreditation Confirmed
                </span>
                <h3 className="text-2xl font-black text-[#0A1B4D]">
                  Congratulations, Certified YARA Trainer!
                </h3>
                <p className="text-xs text-slate-600">
                  You have successfully satisfied all prerequisites, achieved a passing score on the Trainer Examination, and submitted your mentorship portfolio.
                </p>
              </div>

              {submissionResult.certificateNumber && (
                <div className="p-6 rounded-3xl bg-slate-900 text-white max-w-lg mx-auto shadow-xl border border-slate-800 space-y-3">
                  <div className="text-[10px] font-bold text-[#00C6FF] uppercase tracking-widest">
                    Digital Credential Identifier
                  </div>
                  <div className="text-2xl font-black text-amber-400 tracking-wider">
                    {submissionResult.certificateNumber}
                  </div>
                  <div className="text-xs text-slate-300">
                    Awarded to: <strong>{submissionResult.fullName}</strong>
                  </div>
                  <div className="text-[11px] text-emerald-400 font-semibold">
                    Qualification: YARA Certified Robotics Trainer &amp; Mentor
                  </div>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
                {submissionResult.certificateNumber && onCertificateIssued && (
                  <button
                    onClick={() => {
                      onCertificateIssued(
                        submissionResult.certificateNumber!,
                        'Become YARA Certified Robotics Trainer or Mentor',
                        examScore >= 95 ? 'Mastery Distinction' : 'Certified'
                      );
                      onClose();
                    }}
                    className="px-6 py-3 rounded-2xl bg-[#0A1B4D] hover:bg-[#0D47A1] text-white font-extrabold text-xs uppercase tracking-wider shadow-lg transition flex items-center gap-2 cursor-pointer"
                  >
                    <Award className="w-4 h-4 text-[#00C6FF]" />
                    <span>View Official Certificate</span>
                  </button>
                )}

                <button
                  onClick={onClose}
                  className="px-5 py-3 rounded-2xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs transition cursor-pointer"
                >
                  Close &amp; Return to Academy
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

