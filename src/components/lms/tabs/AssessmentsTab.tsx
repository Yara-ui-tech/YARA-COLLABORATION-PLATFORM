import React, { useState } from 'react';
import { 
  CheckSquare, 
  Search, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Award, 
  AlertCircle, 
  HelpCircle, 
  ChevronRight, 
  RotateCcw,
  ShieldCheck,
  Play
} from 'lucide-react';
import { COMPLETE_YARA_SESSIONS } from '../../../constants/yaraLmsCatalog';
import { generateRandomizedQuiz, evaluateQuizSubmission, RandomizedQuestionPayload } from '../../../services/yaraLmsService';

interface Props {
  userId: string;
  onNavigateSession: (sessionId: string) => void;
}

export const AssessmentsTab: React.FC<Props> = ({
  userId,
  onNavigateSession
}) => {
  const [selectedSessionId, setSelectedSessionId] = useState<string>('S01');
  const [activeQuiz, setActiveQuiz] = useState<{
    sessionId: string;
    questions: RandomizedQuestionPayload[];
    passingScore: number;
  } | null>(null);
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});
  const [quizResult, setQuizResult] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [selectedLevel, setSelectedLevel] = useState<number | 'all'>('all');

  const sessionsWithQuizzes = COMPLETE_YARA_SESSIONS.filter(s => s.quizQuestions && s.quizQuestions.length > 0);

  const filteredSessions = sessionsWithQuizzes.filter(s => {
    if (selectedLevel !== 'all' && s.levelNumber !== selectedLevel) return false;
    return true;
  });

  const handleStartQuiz = (sessionId: string) => {
    setSelectedSessionId(sessionId);
    const generated = generateRandomizedQuiz(sessionId);
    setActiveQuiz(generated);
    setUserAnswers({});
    setQuizResult(null);
    setStartTime(Date.now());
  };

  const handleSelectOption = (questionId: string, optionIdx: number) => {
    if (quizResult) return; // Locked after submission
    setUserAnswers(prev => ({ ...prev, [questionId]: optionIdx }));
  };

  const handleSubmitQuiz = async () => {
    if (!activeQuiz) return;
    setIsSubmitting(true);
    const duration = Math.round((Date.now() - startTime) / 1000);
    try {
      const result = await evaluateQuizSubmission(userId, activeQuiz.sessionId, userAnswers, duration);
      setQuizResult(result);
    } catch (e) {
      console.error('Quiz submit error:', e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentSessionData = COMPLETE_YARA_SESSIONS.find(s => s.id === (activeQuiz?.sessionId || selectedSessionId));

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl">
        <div className="max-w-3xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
            <CheckSquare className="w-3.5 h-3.5" /> Examination & Assessment Engine
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">Randomized Quiz & Exam Hub</h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Validated knowledge assessments with randomized question banks, scenario testing, anti-cheat duration tracking, and instant engineering explanations.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Session Quiz Selector */}
        <div className="lg:col-span-1 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
              Quiz Question Banks ({filteredSessions.length})
            </h3>
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-slate-700 font-bold"
            >
              <option value="all">All Levels</option>
              {[0, 1, 2, 3, 4, 5, 6, 7, 8].map(l => (
                <option key={l} value={l}>Level {l}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {filteredSessions.map(session => {
              const isSelected = (activeQuiz?.sessionId || selectedSessionId) === session.id;
              return (
                <div
                  key={session.id}
                  onClick={() => handleStartQuiz(session.id)}
                  className={`p-3.5 rounded-xl border text-left cursor-pointer transition flex items-center justify-between ${
                    isSelected
                      ? 'bg-emerald-50 border-emerald-400 text-emerald-950 shadow-xs'
                      : 'bg-white border-slate-200/80 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-black">{session.id}</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-bold">
                        L{session.levelNumber}
                      </span>
                    </div>
                    <div className="text-xs font-bold text-slate-900 mt-0.5 line-clamp-1">{session.title}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      {session.quizQuestions?.length || 0} Questions • Passing: {session.quizPassingScore || 70}%
                    </div>
                  </div>
                  <ChevronRight className={`w-4 h-4 shrink-0 ${isSelected ? 'text-emerald-600' : 'text-slate-400'}`} />
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Interactive Quiz Player */}
        <div className="lg:col-span-2 space-y-6">
          {!activeQuiz ? (
            <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center shadow-xs space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckSquare className="w-6 h-6" />
              </div>
              <h3 className="text-base font-black text-slate-900">Select a Quiz Question Bank</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Choose any session on the left to launch randomized questions, test your knowledge, and earn milestone mastery points.
              </p>
              <button
                onClick={() => handleStartQuiz('S01')}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition shadow-xs"
              >
                Launch Session S01 Quiz
              </button>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
              {/* Quiz Active Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-black px-2 py-0.5 rounded bg-slate-900 text-white">
                      {activeQuiz.sessionId}
                    </span>
                    <span className="text-xs font-bold text-slate-900">{currentSessionData?.title}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    Passing requirement: <strong>{activeQuiz.passingScore}%</strong> • Total Questions: <strong>{activeQuiz.questions.length}</strong>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleStartQuiz(activeQuiz.sessionId)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg flex items-center gap-1 transition"
                  >
                    <RotateCcw className="w-3 h-3" /> Reshuffle Quiz
                  </button>
                </div>
              </div>

              {/* Quiz Result Banner if Submitted */}
              {quizResult && (
                <div className={`p-5 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                  quizResult.passed ? 'bg-emerald-50 border-emerald-300 text-emerald-950' : 'bg-red-50 border-red-300 text-red-950'
                }`}>
                  <div className="flex items-center gap-3.5">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-black text-base shrink-0 ${
                      quizResult.passed ? 'bg-emerald-600' : 'bg-red-600'
                    }`}>
                      {quizResult.percentage}%
                    </div>
                    <div>
                      <h4 className="text-sm font-black">
                        {quizResult.passed ? '🎉 Assessment Passed!' : '⚠️ Passing Score Not Met'}
                      </h4>
                      <p className="text-xs mt-0.5 opacity-90">
                        {quizResult.score} of {quizResult.totalQuestions} correct ({quizResult.percentage}%). Required: {activeQuiz.passingScore}%.
                      </p>
                      <div className="text-[10px] font-mono opacity-70 mt-1">
                        Attempt ID: {quizResult.attemptId}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleStartQuiz(activeQuiz.sessionId)}
                      className="px-4 py-2 bg-white text-slate-900 text-xs font-bold rounded-xl border shadow-xs hover:bg-slate-50 transition"
                    >
                      Retake Quiz
                    </button>
                    <button
                      onClick={() => onNavigateSession(activeQuiz.sessionId)}
                      className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition"
                    >
                      Open Full Session
                    </button>
                  </div>
                </div>
              )}

              {/* Questions List */}
              <div className="space-y-6">
                {activeQuiz.questions.map((q, qIndex) => {
                  const selectedOpt = userAnswers[q.id];
                  const feedbackItem = quizResult?.feedback?.find((f: any) => f.questionId === q.id);

                  return (
                    <div
                      key={q.id}
                      className="p-5 rounded-2xl border border-slate-200/90 bg-slate-50/40 space-y-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <span className="text-xs font-black text-slate-900 leading-relaxed">
                          {qIndex + 1}. {q.question}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 shrink-0">
                          {q.points} Pts
                        </span>
                      </div>

                      {/* Options */}
                      <div className="space-y-2">
                        {q.options.map((opt, optIdx) => {
                          const isChosen = selectedOpt === optIdx;
                          let optStyle = "bg-white border-slate-200 text-slate-700 hover:border-emerald-300";

                          if (quizResult && feedbackItem) {
                            if (optIdx === feedbackItem.correctChoice) {
                              optStyle = "bg-emerald-50 border-emerald-500 text-emerald-950 font-bold ring-1 ring-emerald-500";
                            } else if (isChosen && !feedbackItem.isCorrect) {
                              optStyle = "bg-red-50 border-red-400 text-red-950 font-bold";
                            } else {
                              optStyle = "bg-white border-slate-200 opacity-60 text-slate-500";
                            }
                          } else if (isChosen) {
                            optStyle = "bg-emerald-50 border-emerald-500 text-emerald-950 font-bold ring-1 ring-emerald-500";
                          }

                          return (
                            <button
                              key={optIdx}
                              disabled={!!quizResult}
                              onClick={() => handleSelectOption(q.id, optIdx)}
                              className={`w-full p-3 rounded-xl border text-left text-xs transition flex items-center justify-between gap-3 ${optStyle}`}
                            >
                              <span>{opt}</span>
                              {quizResult && optIdx === feedbackItem?.correctChoice && (
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                              )}
                              {quizResult && isChosen && !feedbackItem?.isCorrect && (
                                <XCircle className="w-4 h-4 text-red-600 shrink-0" />
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {/* Explanation if submitted */}
                      {quizResult && feedbackItem && (
                        <div className="p-3.5 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-700 space-y-1">
                          <strong className="text-slate-900 block font-bold">💡 Engineering Explanation:</strong>
                          <p>{feedbackItem.explanation}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Submit Quiz Action */}
              {!quizResult && (
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="text-xs text-slate-500">
                    Answered: <strong>{Object.keys(userAnswers).length}</strong> of {activeQuiz.questions.length}
                  </div>
                  <button
                    disabled={isSubmitting || Object.keys(userAnswers).length < activeQuiz.questions.length}
                    onClick={handleSubmitQuiz}
                    className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-black rounded-xl transition shadow-md shadow-emerald-600/20"
                  >
                    {isSubmitting ? 'Evaluating Submission...' : 'Submit Assessment for Grading'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
