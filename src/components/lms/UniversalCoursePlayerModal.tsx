import React, { useState, useEffect } from 'react';
import { 
  X, CheckCircle2, Play, BookOpen, Clock, Award, 
  HelpCircle, ChevronRight, ChevronLeft, Wrench, ShieldAlert,
  FileText, Download, Check, Sparkles, Send, Users, Laptop,
  Cpu, Layers, Rocket, Brain, AlertCircle
} from 'lucide-react';
import { 
  UnifiedCourse, 
  CourseModule, 
  UnifiedEnrollment 
} from '../../types/unifiedCourseTypes';
import { 
  getEnrollment, 
  enrollInCourse, 
  updateModuleCompletion, 
  submitPracticalLab, 
  submitPracticalAssignment, 
  submitQuizAnswers,
  checkCourseCertificationEligibility
} from '../../services/unifiedCourseService';
import { MentorHelpModal } from './MentorHelpModal';
import { GreatLearningCertificateModal } from './GreatLearningCertificateModal';

interface Props {
  course: UnifiedCourse;
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userName: string;
  userEmail: string;
}

export const UniversalCoursePlayerModal: React.FC<Props> = ({
  course,
  isOpen,
  onClose,
  userId,
  userName,
  userEmail
}) => {
  const [activeModuleIndex, setActiveModuleIndex] = useState(0);
  const [enrollment, setEnrollment] = useState<UnifiedEnrollment | null>(null);
  const [activeTab, setActiveTab] = useState<'theory' | 'lab' | 'assignment' | 'quiz' | 'resources'>('theory');

  // Interactive Quiz state
  const [selectedQuizAnswers, setSelectedQuizAnswers] = useState<Record<string, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState<number | null>(null);

  // Practical Lab state
  const [labNotes, setLabNotes] = useState('');
  const [labDone, setLabDone] = useState(false);

  // Assignment state
  const [assignmentText, setAssignmentText] = useState('');
  const [assignmentFileUrl, setAssignmentFileUrl] = useState('');
  const [assignmentSubmitted, setAssignmentSubmitted] = useState(false);

  // Modals state
  const [isMentorModalOpen, setIsMentorModalOpen] = useState(false);
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);

  useEffect(() => {
    async function initEnrollment() {
      let enr = getEnrollment(userId, course.id);
      if (!enr) {
        enr = await enrollInCourse(userId, course.id);
      }
      setEnrollment(enr);
    }
    if (isOpen) {
      initEnrollment();
      setActiveModuleIndex(0);
      setActiveTab('theory');
      setQuizSubmitted(false);
      setSelectedQuizAnswers({});
    }
  }, [isOpen, course.id, userId]);

  if (!isOpen) return null;

  const currentModule: CourseModule | undefined = course.modules[activeModuleIndex];
  const isModuleCompleted = currentModule ? enrollment?.completedModuleIds.includes(currentModule.id) : false;
  const certCheck = checkCourseCertificationEligibility(userId, course.id);

  const handleToggleModuleComplete = async () => {
    if (!currentModule) return;
    const updated = await updateModuleCompletion(userId, course.id, currentModule.id, !isModuleCompleted);
    setEnrollment(updated);
  };

  const handleLabSubmit = async () => {
    if (!currentModule) return;
    const updated = await submitPracticalLab(userId, course.id, currentModule.id, labNotes);
    setEnrollment(updated);
    setLabDone(true);
  };

  const handleAssignmentSubmit = async () => {
    if (!currentModule || !assignmentText.trim()) return;
    const updated = await submitPracticalAssignment(userId, course.id, currentModule.id, assignmentText, assignmentFileUrl);
    setEnrollment(updated);
    setAssignmentSubmitted(true);
  };

  const handleQuizSubmit = async () => {
    if (!currentModule || !currentModule.quizQuestions.length) return;
    const res = await submitQuizAnswers(userId, course.id, currentModule.id, selectedQuizAnswers, currentModule.quizQuestions);
    setQuizSubmitted(true);
    setQuizScore(res.scorePercentage);
    setEnrollment(res.enrollment);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-xs">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-6xl h-[92vh] flex flex-col text-white shadow-2xl overflow-hidden relative">
        {/* Top Header Bar */}
        <div className="p-4 sm:px-6 bg-slate-950 border-b border-slate-800 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shrink-0">
              {course.track.replace('_', ' ').toUpperCase()}
            </span>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-black text-white truncate">
                {course.title}
              </h2>
              <p className="text-[11px] text-slate-400 font-medium">
                {course.level} • {course.estimatedDurationHours} Hours • {course.modules.length} Modules
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Need Help? Mentor Button */}
            <button
              onClick={() => setIsMentorModalOpen(true)}
              className="bg-indigo-600/30 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/40 px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
              <Users className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Need Help?</span>
            </button>

            {/* Certificate Claim Button */}
            <button
              onClick={() => setIsCertModalOpen(true)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                certCheck.isEligible
                  ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-black shadow-lg shadow-amber-500/20'
                  : 'bg-slate-800 text-slate-300 hover:text-white border border-slate-700'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{certCheck.isEligible ? 'Claim Certificate' : 'Certificate'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Body: 2 Columns (Sidebar syllabus + Main Content) */}
        <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
          {/* Left Column: Modules List */}
          <div className="w-full md:w-80 bg-slate-950/70 border-r border-slate-800 flex flex-col shrink-0 overflow-y-auto">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Course Syllabus</span>
                <div className="text-xs font-bold text-white mt-0.5">
                  {enrollment?.completedModuleIds.length || 0} of {course.modules.length} Completed
                </div>
              </div>
              <span className="text-xs font-black text-emerald-400">
                {enrollment?.progressPercentage || 0}%
              </span>
            </div>

            <div className="p-2 space-y-1 overflow-y-auto flex-1">
              {course.modules.map((mod, idx) => {
                const isSelected = idx === activeModuleIndex;
                const isDone = enrollment?.completedModuleIds.includes(mod.id);
                return (
                  <button
                    key={mod.id}
                    onClick={() => {
                      setActiveModuleIndex(idx);
                      setActiveTab('theory');
                      setQuizSubmitted(false);
                    }}
                    className={`w-full text-left p-3 rounded-2xl transition flex items-start gap-2.5 cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-600/20 border border-indigo-500/40 text-white'
                        : 'bg-slate-900/60 border border-transparent text-slate-300 hover:bg-slate-800/60'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5 ${
                      isDone
                        ? 'bg-emerald-500 text-white'
                        : isSelected
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}>
                      {isDone ? '✓' : idx + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold truncate leading-snug">{mod.title}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-2">
                        <span>{mod.durationMinutes}m</span>
                        {mod.guidedLab && <span>• 🧪 Lab</span>}
                        {mod.assignment && <span>• 📝 Task</span>}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Module Viewer */}
          <div className="flex-1 flex flex-col min-h-0 bg-slate-900 overflow-y-auto">
            {currentModule ? (
              <div className="p-4 sm:p-6 space-y-6 flex-1">
                {/* Module Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-indigo-400">
                      Module {currentModule.moduleNumber} • {currentModule.coherentSkillArea}
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black text-white mt-1">
                      {currentModule.title}
                    </h3>
                  </div>

                  <button
                    onClick={handleToggleModuleComplete}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 self-start sm:self-auto cursor-pointer ${
                      isModuleCompleted
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{isModuleCompleted ? 'Completed ✓' : 'Mark Complete'}</span>
                  </button>
                </div>

                {/* Sub-Tabs: Theory & Video, Practical Lab, Assignment, Quiz, Resources */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-800 scrollbar-none">
                  {[
                    { id: 'theory', label: '📖 Theory & Video' },
                    { id: 'lab', label: '🧪 Practical Lab', show: !!currentModule.guidedLab },
                    { id: 'assignment', label: '📝 Assignment', show: !!currentModule.assignment },
                    { id: 'quiz', label: '🧠 Knowledge Quiz', show: currentModule.quizQuestions.length > 0 },
                    { id: 'resources', label: '📦 Resources', show: currentModule.resources.length > 0 }
                  ]
                    .filter(t => t.show !== false)
                    .map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                          activeTab === tab.id
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : 'bg-slate-800/70 text-slate-400 hover:text-white hover:bg-slate-800'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                </div>

                {/* TAB 1: Theory & Micro-Video */}
                {activeTab === 'theory' && (
                  <div className="space-y-6">
                    {/* Short Micro-Lesson Video */}
                    {currentModule.videoUrl && (
                      <div className="space-y-2">
                        <div className="text-xs font-bold text-slate-300 flex items-center gap-2">
                          <Play className="w-3.5 h-3.5 text-indigo-400 fill-indigo-400" />
                          <span>Short Learning Video (3–8 Minutes)</span>
                        </div>
                        <div className="aspect-video w-full rounded-2xl overflow-hidden border border-slate-800 bg-black shadow-lg">
                          {currentModule.videoUrl.includes('youtube.com') || currentModule.videoUrl.includes('youtu.be') ? (
                            <iframe
                              src={currentModule.videoUrl.replace('watch?v=', 'embed/')}
                              title={currentModule.title}
                              className="w-full h-full border-0"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            />
                          ) : (
                            <video
                              controls
                              className="w-full h-full"
                              src={currentModule.videoUrl}
                            />
                          )}
                        </div>
                      </div>
                    )}

                    {/* Theory Overview */}
                    <div className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-5 space-y-3">
                      <h4 className="text-sm font-black text-indigo-300 uppercase tracking-wider flex items-center gap-2">
                        <BookOpen className="w-4 h-4" />
                        <span>Core Engineering Theory & Concepts</span>
                      </h4>
                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                        {currentModule.theoryOverview}
                      </p>

                      {currentModule.theoryKeyConcepts.length > 0 && (
                        <div className="pt-2">
                          <div className="text-[11px] font-bold text-slate-400 mb-2">Key Competencies to Master:</div>
                          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                            {currentModule.theoryKeyConcepts.map((c, i) => (
                              <li key={i} className="flex items-center gap-2 text-slate-300">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                <span>{c}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    {/* Troubleshooting Guidance */}
                    {currentModule.troubleshootingGuide && (
                      <div className="bg-amber-950/20 border border-amber-500/30 rounded-2xl p-4 text-xs space-y-1.5">
                        <div className="font-bold text-amber-300 flex items-center gap-1.5">
                          <Wrench className="w-4 h-4" />
                          <span>Bench Troubleshooting & Common Pitfalls</span>
                        </div>
                        <p className="text-slate-300 leading-relaxed">
                          {currentModule.troubleshootingGuide}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 2: Guided Practical Lab */}
                {activeTab === 'lab' && currentModule.guidedLab && (
                  <div className="space-y-6">
                    <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-base font-black text-white flex items-center gap-2">
                          <span>🧪 {currentModule.guidedLab.title}</span>
                        </h4>
                        {currentModule.guidedLab.simulationUrl && (
                          <a
                            href={currentModule.guidedLab.simulationUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold px-3 py-1.5 rounded-xl transition flex items-center gap-1"
                          >
                            <span>Open Simulator (Wokwi / Tinkercad)</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed">
                        <strong>Objective:</strong> {currentModule.guidedLab.objective}
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                          <div className="font-bold text-indigo-300 mb-1">Required Components:</div>
                          <ul className="list-disc list-inside text-slate-400 space-y-0.5">
                            {currentModule.guidedLab.equipment.map((eq, i) => (
                              <li key={i}>{eq}</li>
                            ))}
                          </ul>
                        </div>

                        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                          <div className="font-bold text-amber-300 mb-1">Safety Protocols:</div>
                          <ul className="list-disc list-inside text-slate-400 space-y-0.5">
                            {currentModule.guidedLab.safetyRules.map((sf, i) => (
                              <li key={i}>{sf}</li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div className="space-y-2 pt-2">
                        <div className="font-bold text-white text-xs">Lab Step-by-Step Instructions:</div>
                        <p className="text-xs text-slate-300 whitespace-pre-line leading-relaxed bg-slate-900/80 p-4 rounded-xl border border-slate-800">
                          {currentModule.guidedLab.instructions}
                        </p>
                      </div>

                      <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-xs">
                        <span className="font-bold text-emerald-400">Expected Result: </span>
                        <span className="text-slate-300">{currentModule.guidedLab.expectedResult}</span>
                      </div>

                      {/* Lab Completion form */}
                      <div className="pt-3 border-t border-slate-800 space-y-3">
                        <label className="block text-xs font-bold text-slate-300">
                          Lab Observations & Bench Notes:
                        </label>
                        <textarea
                          rows={3}
                          value={labNotes}
                          onChange={(e) => setLabNotes(e.target.value)}
                          placeholder="Record your measured voltage/current readings, observed sensor behavior, or simulation outcome..."
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-indigo-500 resize-none"
                        />
                        <button
                          onClick={handleLabSubmit}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-5 py-2.5 rounded-xl text-xs transition flex items-center gap-2 cursor-pointer"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>{labDone ? 'Lab Verified ✓' : 'Submit Lab Evidence & Mark Completed'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 3: Practical Assignment */}
                {activeTab === 'assignment' && currentModule.assignment && (
                  <div className="space-y-6">
                    <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4">
                      <h4 className="text-base font-black text-white">
                        📝 {currentModule.assignment.title}
                      </h4>
                      <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
                        {currentModule.assignment.instructions}
                      </p>

                      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                        <div className="text-xs font-bold text-indigo-300 mb-2">Grading Rubric ({currentModule.assignment.maxPoints} pts):</div>
                        <div className="space-y-1.5 text-xs">
                          {currentModule.assignment.rubric.map((r, i) => (
                            <div key={i} className="flex items-center justify-between text-slate-300 border-b border-slate-800/60 pb-1">
                              <span>{r.criteria}</span>
                              <span className="font-bold text-emerald-400">{r.points} pts</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Assignment Submission */}
                      <div className="pt-3 border-t border-slate-800 space-y-3">
                        <label className="block text-xs font-bold text-slate-300">
                          Submit Your Assignment Solution (Code / Text / Analysis):
                        </label>
                        <textarea
                          rows={4}
                          value={assignmentText}
                          onChange={(e) => setAssignmentText(e.target.value)}
                          placeholder="Paste your source code, schematic description, or mathematical calculations here..."
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white font-mono focus:outline-none focus:border-indigo-500 resize-none"
                        />

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[11px] font-bold text-slate-400 mb-1">
                              Supporting Link or File URL (Optional):
                            </label>
                            <input
                              type="url"
                              value={assignmentFileUrl}
                              onChange={(e) => setAssignmentFileUrl(e.target.value)}
                              placeholder="e.g. GitHub repo link, Wokwi simulation URL, or Google Drive link"
                              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                            />
                          </div>
                        </div>

                        <button
                          onClick={handleAssignmentSubmit}
                          disabled={!assignmentText.trim()}
                          className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold px-5 py-2.5 rounded-xl text-xs transition flex items-center gap-2 cursor-pointer"
                        >
                          <Send className="w-4 h-4" />
                          <span>{assignmentSubmitted ? 'Submitted & Graded ✓' : 'Submit Assignment for Grading'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 4: Knowledge Quiz */}
                {activeTab === 'quiz' && currentModule.quizQuestions.length > 0 && (
                  <div className="space-y-6">
                    <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-base font-black text-white flex items-center gap-2">
                          <Brain className="w-4 h-4 text-purple-400" />
                          <span>Knowledge Assessment (Passing Score: 70%)</span>
                        </h4>
                        {quizScore !== null && (
                          <span className={`px-3 py-1 rounded-full text-xs font-black ${
                            quizScore >= 70 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'
                          }`}>
                            Score: {quizScore}% {quizScore >= 70 ? '(Passed ✓)' : '(Try Again)'}
                          </span>
                        )}
                      </div>

                      <div className="space-y-4 pt-2">
                        {currentModule.quizQuestions.map((q, idx) => (
                          <div key={q.id} className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                            <div className="text-xs font-bold text-white">
                              {idx + 1}. {q.question}
                            </div>

                            <div className="space-y-1.5 pt-1">
                              {q.options.map((opt, optIdx) => {
                                const isSelected = selectedQuizAnswers[q.id] === optIdx;
                                const isCorrect = q.correctIndex === optIdx;
                                return (
                                  <label
                                    key={optIdx}
                                    className={`flex items-center gap-2.5 p-2 rounded-xl border text-xs cursor-pointer transition ${
                                      quizSubmitted
                                        ? isCorrect
                                          ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300'
                                          : isSelected
                                          ? 'border-red-500 bg-red-500/10 text-red-300'
                                          : 'border-slate-800 bg-slate-950/40 text-slate-400'
                                        : isSelected
                                        ? 'border-indigo-500 bg-indigo-500/10 text-white'
                                        : 'border-slate-800 bg-slate-950/40 text-slate-300 hover:border-slate-700'
                                    }`}
                                  >
                                    <input
                                      type="radio"
                                      name={q.id}
                                      disabled={quizSubmitted && (quizScore || 0) >= 70}
                                      checked={isSelected}
                                      onChange={() => {
                                        setSelectedQuizAnswers(prev => ({ ...prev, [q.id]: optIdx }));
                                      }}
                                    />
                                    <span>{opt}</span>
                                  </label>
                                );
                              })}
                            </div>

                            {quizSubmitted && q.explanation && (
                              <div className="text-[11px] text-slate-400 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800 mt-2">
                                💡 <em>{q.explanation}</em>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      <div className="pt-2 flex items-center justify-end">
                        <button
                          onClick={handleQuizSubmit}
                          className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-6 py-2.5 rounded-xl text-xs transition cursor-pointer"
                        >
                          Submit Assessment
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 5: Supporting Resources */}
                {activeTab === 'resources' && currentModule.resources.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="text-sm font-black text-white">Supporting Learning Resources & Downloads</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {currentModule.resources.map(res => (
                        <div key={res.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                              <FileText className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="text-xs font-bold text-white">{res.title}</div>
                              <div className="text-[10px] text-slate-400 uppercase">{res.type}</div>
                            </div>
                          </div>
                          <a
                            href={res.fileUrl}
                            download
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                          >
                            <Download className="w-4 h-4" />
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Next/Prev Navigation Footer */}
                <div className="pt-6 border-t border-slate-800 flex items-center justify-between">
                  <button
                    disabled={activeModuleIndex === 0}
                    onClick={() => {
                      setActiveModuleIndex(prev => Math.max(0, prev - 1));
                      setActiveTab('theory');
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-xs font-bold text-slate-200 transition flex items-center gap-1 cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Previous Module</span>
                  </button>

                  <button
                    disabled={activeModuleIndex === course.modules.length - 1}
                    onClick={() => {
                      setActiveModuleIndex(prev => Math.min(course.modules.length - 1, prev + 1));
                      setActiveTab('theory');
                    }}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 text-xs font-bold text-white transition flex items-center gap-1 cursor-pointer"
                  >
                    <span>Next Module</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-12 text-center text-slate-500 text-xs">
                Select a module from the syllabus to begin learning.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mentor Help Modal */}
      <MentorHelpModal
        isOpen={isMentorModalOpen}
        onClose={() => setIsMentorModalOpen(false)}
        userId={userId}
        userName={userName}
        userEmail={userEmail}
        courseId={course.id}
        courseTitle={course.title}
        moduleId={currentModule?.id}
        moduleTitle={currentModule?.title}
      />

      {/* Great Learning Certificate Modal */}
      <GreatLearningCertificateModal
        isOpen={isCertModalOpen}
        onClose={() => setIsCertModalOpen(false)}
        userId={userId}
        userEmail={userEmail}
        defaultStudentName={userName}
        courseId={course.id}
        courseTitle={course.title}
        courseCategory="robotics"
      />
    </div>
  );
};
