import React, { useState } from 'react';
import { Award, CheckCircle2, XCircle, AlertCircle, HelpCircle, ArrowRight, RotateCcw, Sparkles, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { FinalExamQuestion, FinalExamAttempt, Certificate } from '../../types/curriculum';
import { FINAL_EXAM_QUESTIONS } from '../../constants/curriculum';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../AuthContext';

interface FinalExamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExamPassed: (cert: Certificate) => void;
  existingAttempt?: FinalExamAttempt | null;
}

export default function FinalExamModal({ isOpen, onClose, onExamPassed, existingAttempt }: FinalExamModalProps) {
  const { profile } = useAuth();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [examResult, setExamResult] = useState<{
    score: number;
    total: number;
    percentage: number;
    passed: boolean;
  } | null>(null);
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const totalQuestions = FINAL_EXAM_QUESTIONS.length;
  const currentQ = FINAL_EXAM_QUESTIONS[currentIdx];
  const answeredCount = Object.keys(selectedAnswers).length;
  const progressPercent = Math.round((answeredCount / totalQuestions) * 100);

  const handleSelectOption = (questionId: string, optionIndex: number) => {
    if (isSubmitted) return;
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: optionIndex
    }));
  };

  const calculateResults = async () => {
    let correctCount = 0;
    FINAL_EXAM_QUESTIONS.forEach(q => {
      if (selectedAnswers[q.id] === q.correctIndex) {
        correctCount += 1;
      }
    });

    const percentage = Math.round((correctCount / totalQuestions) * 100);
    const passed = percentage >= 70; // 70% passing grade

    const result = {
      score: correctCount,
      total: totalQuestions,
      percentage,
      passed
    };

    setExamResult(result);
    setIsSubmitted(true);
    setSaving(true);

    try {
      if (profile?.id) {
        // Record exam attempt
        await supabase.from('final_exam_attempts').insert({
          user_id: profile.id,
          score: correctCount,
          total_questions: totalQuestions,
          percentage,
          passed,
          answers: selectedAnswers
        });

        if (passed) {
          // Generate or fetch certificate
          const certNum = `YARIA-CERT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
          const grade = percentage >= 90 ? 'Distinction' : percentage >= 80 ? 'Merit' : 'Pass';

          const newCert: Certificate = {
            id: certNum,
            user_id: profile.id,
            certificate_number: certNum,
            student_name: profile.display_name || 'YARIA Innovator',
            course_title: 'Robotics & Embedded Systems Engineering Mastery',
            score: percentage,
            grade,
            issue_date: new Date().toISOString()
          };

          const { data: insertedCert } = await supabase.from('certificates').insert({
            user_id: profile.id,
            certificate_number: certNum,
            student_name: newCert.student_name,
            course_title: newCert.course_title,
            score: percentage,
            grade,
            issue_date: newCert.issue_date,
            metadata: { exam_score: percentage }
          }).select().single();

          if (insertedCert) {
            onExamPassed(insertedCert);
          } else {
            onExamPassed(newCert);
          }
        }
      }
    } catch (err) {
      console.error('Error saving exam attempt:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleRetake = () => {
    setSelectedAnswers({});
    setIsSubmitted(false);
    setExamResult(null);
    setCurrentIdx(0);
  };

  return (
    <div className="fixed inset-0 z-[140] flex items-center justify-center p-4 md:p-6 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl overflow-hidden my-auto border border-slate-100 flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">YARIA Final Comprehensive Exam</h3>
              <p className="text-xs text-slate-400">Pass with 70%+ to graduate and earn your verified certificate</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Exam Body */}
        <div className="p-6 md:p-8 flex-1 overflow-y-auto">
          {!isSubmitted ? (
            <div className="space-y-6">
              {/* Progress & Navigator Bar */}
              <div>
                <div className="flex justify-between items-center text-xs font-bold text-slate-500 mb-2">
                  <span>Question {currentIdx + 1} of {totalQuestions}</span>
                  <span>{answeredCount} of {totalQuestions} answered ({progressPercent}%)</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-indigo-600 transition-all duration-300 rounded-full"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>

                {/* Quick Question Selector Pills */}
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {FINAL_EXAM_QUESTIONS.map((q, idx) => (
                    <button
                      key={q.id}
                      onClick={() => setCurrentIdx(idx)}
                      className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                        idx === currentIdx
                          ? 'bg-indigo-600 text-white ring-2 ring-indigo-400/50'
                          : selectedAnswers[q.id] !== undefined
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  ))}
                </div>
              </div>

              {/* Question Card */}
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200/80">
                <div className="inline-block px-3 py-1 bg-indigo-100 text-indigo-700 font-bold text-xs rounded-full mb-3">
                  {currentQ.category}
                </div>
                <h4 className="text-base md:text-lg font-bold text-slate-900 mb-5 leading-snug">
                  {currentIdx + 1}. {currentQ.question}
                </h4>

                {/* Options */}
                <div className="space-y-3">
                  {currentQ.options.map((option, oIdx) => {
                    const isSelected = selectedAnswers[currentQ.id] === oIdx;
                    return (
                      <button
                        key={oIdx}
                        onClick={() => handleSelectOption(currentQ.id, oIdx)}
                        className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-start space-x-3 text-sm font-medium ${
                          isSelected
                            ? 'border-indigo-600 bg-indigo-50/50 text-indigo-950 font-semibold shadow-sm'
                            : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 shrink-0 ${
                          isSelected ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-300'
                        }`}>
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <span className="flex-1">{option}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Pagination Controls */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button
                  onClick={() => setCurrentIdx(prev => Math.max(0, prev - 1))}
                  disabled={currentIdx === 0}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-sm hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Previous
                </button>

                {currentIdx < totalQuestions - 1 ? (
                  <button
                    onClick={() => setCurrentIdx(prev => Math.min(totalQuestions - 1, prev + 1))}
                    className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-200 transition-all flex items-center space-x-2"
                  >
                    <span>Next</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={calculateResults}
                    disabled={answeredCount < totalQuestions}
                    className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span>Submit Examination</span>
                    <Sparkles className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* Results View */
            <div className="space-y-8 text-center py-4">
              {examResult?.passed ? (
                <div className="space-y-4">
                  <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-xl shadow-emerald-100">
                    <Award className="w-10 h-10" />
                  </div>
                  <h3 className="text-2xl md:text-3xl font-black text-slate-900">
                    Congratulations! You Passed!
                  </h3>
                  <p className="text-slate-600 max-w-md mx-auto text-sm">
                    You scored <strong className="text-emerald-600 font-bold">{examResult.percentage}%</strong> ({examResult.score}/{examResult.total} questions correct). Your official YARIA Certificate has been issued!
                  </p>

                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl max-w-md mx-auto text-xs text-emerald-800 flex items-center space-x-3 text-left">
                    <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                    <span>Your certificate is now available for download and display on your profile!</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto">
                    <AlertCircle className="w-10 h-10" />
                  </div>
                  <h3 className="text-2xl md:text-3xl font-black text-slate-900">
                    Score: {examResult?.percentage}%
                  </h3>
                  <p className="text-slate-600 max-w-md mx-auto text-sm">
                    You scored {examResult?.score}/{examResult?.total}. You need 70% to pass. Review the explanations below and try again!
                  </p>
                  <button
                    onClick={handleRetake}
                    className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl transition-all inline-flex items-center space-x-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Retake Examination</span>
                  </button>
                </div>
              )}

              {/* Detailed Breakdown Review */}
              <div className="text-left pt-6 border-t border-slate-100 space-y-4">
                <h4 className="font-bold text-slate-900 text-base">Detailed Question Review</h4>
                <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
                  {FINAL_EXAM_QUESTIONS.map((q, idx) => {
                    const userAns = selectedAnswers[q.id];
                    const isCorrect = userAns === q.correctIndex;
                    return (
                      <div 
                        key={q.id}
                        className={`p-4 rounded-xl border text-xs space-y-2 ${
                          isCorrect ? 'bg-emerald-50/60 border-emerald-200' : 'bg-rose-50/60 border-rose-200'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-bold text-slate-800">
                            {idx + 1}. {q.question}
                          </span>
                          {isCorrect ? (
                            <span className="px-2 py-0.5 bg-emerald-200 text-emerald-800 rounded font-bold shrink-0">Correct</span>
                          ) : (
                            <span className="px-2 py-0.5 bg-rose-200 text-rose-800 rounded font-bold shrink-0">Incorrect</span>
                          )}
                        </div>
                        <div className="text-slate-600 space-y-1">
                          <p><strong>Your Answer:</strong> {userAns !== undefined ? q.options[userAns] : 'Not answered'}</p>
                          {!isCorrect && <p><strong>Correct Answer:</strong> {q.options[q.correctIndex]}</p>}
                        </div>
                        <div className="p-2.5 bg-white/80 rounded-lg border border-slate-200/50 text-slate-700">
                          <strong>Explanation:</strong> {q.explanation}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
