import React, { useState } from 'react';
import { 
  Brain, 
  Sparkles, 
  HelpCircle, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  Trophy, 
  Flame, 
  RotateCcw, 
  ExternalLink, 
  X as CloseIcon, 
  Zap, 
  Eye, 
  Lightbulb, 
  Cpu, 
  Compass, 
  Layers 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { BrainstormingQuestion } from '../../types/brainstorming';
import { INITIAL_BRAINSTORMING_QUESTIONS } from '../../constants/brainstormingData';
import { cn } from '../../lib/utils';
import { useAuth } from '../AuthContext';
import { supabase } from '../../lib/supabase';

interface BrainstormingQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BrainstormingQuizModal({ isOpen, onClose }: BrainstormingQuizModalProps) {
  const { user, profile } = useAuth();
  const [questions, setQuestions] = useState<BrainstormingQuestion[]>(INITIAL_BRAINSTORMING_QUESTIONS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [showImageZoom, setShowImageZoom] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [highestStreak, setHighestStreak] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredQuestions = selectedCategory === 'all' 
    ? questions 
    : questions.filter(q => q.category === selectedCategory);

  const currentQ = filteredQuestions[currentIndex] || filteredQuestions[0];

  if (!isOpen) return null;

  const handleSelectOption = (idx: number) => {
    if (isAnswered) return;
    setSelectedOption(idx);
    setIsAnswered(true);

    const isCorrect = idx === currentQ.correctIndex;
    if (isCorrect) {
      const newScore = score + currentQ.points;
      const newStreak = streak + 1;
      setScore(newScore);
      setStreak(newStreak);
      if (newStreak > highestStreak) setHighestStreak(newStreak);
    } else {
      setStreak(0);
    }
  };

  const handleNext = () => {
    if (currentIndex < filteredQuestions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
      setShowHint(false);
    } else {
      setCompleted(true);
      saveAttempt();
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setShowHint(false);
    setScore(0);
    setStreak(0);
    setCompleted(false);
  };

  const saveAttempt = async () => {
    if (!user) return;
    try {
      await supabase.from('brainstorming_attempts').insert({
        user_id: user.id,
        user_name: profile?.display_name || 'Anonymous Innovator',
        score: score,
        total_questions: filteredQuestions.length,
        streak: highestStreak,
        category: selectedCategory
      });
    } catch (err) {
      console.error('Error saving quiz attempt:', err);
    }
  };

  const categoryLabels: Record<string, { label: string; icon: any; color: string }> = {
    circuit_fault: { label: 'Circuit Diagnostics', icon: Zap, color: 'text-amber-500 bg-amber-500/10' },
    robot_navigation: { label: 'Rover Kinematics', icon: Compass, color: 'text-indigo-500 bg-indigo-500/10' },
    code_tracing: { label: 'Embedded Logic', icon: Cpu, color: 'text-emerald-500 bg-emerald-500/10' },
    mechanical_logic: { label: 'Power & Dynamics', icon: Layers, color: 'text-rose-500 bg-rose-500/10' },
    schematic_analysis: { label: 'Schematics & EMF', icon: Brain, color: 'text-cyan-500 bg-cyan-500/10' }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 md:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-[2.5rem] max-w-4xl w-full shadow-2xl overflow-hidden border border-slate-100 relative my-8"
      >
        {/* Header Bar */}
        <div className="bg-slate-900 text-white p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              <Brain className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-amber-400 text-xs font-black uppercase tracking-wider">Visual IQ & Diagnostics</span>
                <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-300 rounded-full text-[10px] font-bold">Live Arena</span>
              </div>
              <h3 className="text-xl md:text-2xl font-black tracking-tight text-white">
                Brainstorming & Critical Thinking Image Quiz
              </h3>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-slate-800/80 px-4 py-2 rounded-2xl border border-slate-700">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-bold text-slate-200">{score} pts</span>
            </div>
            <div className="flex items-center space-x-2 bg-slate-800/80 px-4 py-2 rounded-2xl border border-slate-700">
              <Flame className="w-4 h-4 text-orange-400" />
              <span className="text-sm font-bold text-orange-300">{streak} Streak</span>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
            >
              <CloseIcon className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Category Filters */}
        <div className="p-4 md:px-8 bg-slate-50 border-b border-slate-100 flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => { setSelectedCategory('all'); setCurrentIndex(0); setIsAnswered(false); setSelectedOption(null); }}
            className={cn(
              "px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all",
              selectedCategory === 'all' ? "bg-slate-900 text-white shadow-sm" : "bg-white text-slate-600 hover:bg-slate-100"
            )}
          >
            All Challenges ({questions.length})
          </button>
          {Object.entries(categoryLabels).map(([catKey, catMeta]) => (
            <button
              key={catKey}
              onClick={() => { setSelectedCategory(catKey); setCurrentIndex(0); setIsAnswered(false); setSelectedOption(null); }}
              className={cn(
                "px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center space-x-1.5",
                selectedCategory === catKey ? "bg-indigo-600 text-white shadow-sm" : "bg-white text-slate-600 hover:bg-slate-100"
              )}
            >
              <span>{catMeta.label}</span>
            </button>
          ))}
        </div>

        {/* Content Body */}
        <div className="p-6 md:p-8">
          {completed ? (
            <div className="text-center py-12 space-y-6 max-w-md mx-auto">
              <div className="w-20 h-20 bg-amber-50 rounded-[2rem] flex items-center justify-center text-amber-500 mx-auto shadow-inner">
                <Trophy className="w-10 h-10" />
              </div>
              <div className="space-y-2">
                <h4 className="text-2xl font-black text-slate-900 tracking-tight">Challenge Sprint Completed!</h4>
                <p className="text-slate-500 text-sm">
                  You completed all visual diagnostics in this category with flying colors.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-6 rounded-3xl border border-slate-100">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Final Score</p>
                  <p className="text-3xl font-black text-indigo-600 mt-1">{score} pts</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Highest Streak</p>
                  <p className="text-3xl font-black text-amber-500 mt-1">{highestStreak} 🔥</p>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleRestart}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-4 rounded-2xl transition-all flex items-center justify-center space-x-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Try Again</span>
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-2xl shadow-xl shadow-indigo-100 transition-all flex items-center justify-center space-x-2"
                >
                  <span>Finish & Return</span>
                </button>
              </div>
            </div>
          ) : currentQ ? (
            <div className="space-y-6">
              {/* Progress & Metadata */}
              <div className="flex items-center justify-between text-xs text-slate-500 font-bold">
                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-1 bg-slate-100 rounded-lg text-slate-700">
                    Question {currentIndex + 1} of {filteredQuestions.length}
                  </span>
                  <span className={cn(
                    "px-2.5 py-1 rounded-lg uppercase tracking-wider text-[10px] font-black",
                    categoryLabels[currentQ.category]?.color || 'bg-indigo-50 text-indigo-600'
                  )}>
                    {categoryLabels[currentQ.category]?.label || currentQ.category}
                  </span>
                </div>
                <span className="text-amber-600">+{currentQ.points} Points</span>
              </div>

              {/* Question Text */}
              <h4 className="text-lg md:text-xl font-bold text-slate-900 leading-snug">
                {currentQ.question}
              </h4>

              {/* Main Visual Image Card */}
              <div className="relative rounded-3xl overflow-hidden bg-slate-900 border border-slate-200 max-h-72 group">
                <img
                  src={currentQ.image_url}
                  alt={currentQ.title}
                  className="w-full h-72 object-cover object-center group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                  <span className="text-white font-bold text-sm drop-shadow-md">
                    {currentQ.title}
                  </span>
                  <button
                    onClick={() => setShowImageZoom(true)}
                    className="px-3 py-1.5 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Expand Diagram</span>
                  </button>
                </div>
              </div>

              {/* Options Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                {currentQ.options.map((opt, oIdx) => {
                  let optStyle = "bg-white border-2 border-slate-100 hover:border-indigo-200 text-slate-700";
                  
                  if (isAnswered) {
                    if (oIdx === currentQ.correctIndex) {
                      optStyle = "bg-emerald-50 border-2 border-emerald-500 text-emerald-900 font-bold shadow-md shadow-emerald-50";
                    } else if (selectedOption === oIdx) {
                      optStyle = "bg-rose-50 border-2 border-rose-500 text-rose-900 font-bold";
                    } else {
                      optStyle = "bg-slate-50 border-2 border-slate-100 opacity-50 text-slate-400";
                    }
                  } else if (selectedOption === oIdx) {
                    optStyle = "bg-indigo-50 border-2 border-indigo-600 text-indigo-900";
                  }

                  return (
                    <button
                      key={oIdx}
                      onClick={() => handleSelectOption(oIdx)}
                      disabled={isAnswered}
                      className={cn(
                        "p-4 rounded-2xl text-left text-xs md:text-sm font-medium transition-all flex items-start space-x-3 cursor-pointer",
                        optStyle
                      )}
                    >
                      <span className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center font-bold text-xs shrink-0 text-slate-600">
                        {String.fromCharCode(65 + oIdx)}
                      </span>
                      <span className="flex-1">{opt}</span>
                      {isAnswered && oIdx === currentQ.correctIndex && (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                      )}
                      {isAnswered && selectedOption === oIdx && oIdx !== currentQ.correctIndex && (
                        <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Hint and Explanation Breakdown */}
              <div className="space-y-4 pt-2">
                {!isAnswered && (
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => setShowHint(!showHint)}
                      className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center space-x-1.5 transition-colors"
                    >
                      <Lightbulb className="w-4 h-4" />
                      <span>{showHint ? 'Hide Hint' : 'Need a Critical Thinking Hint?'}</span>
                    </button>
                  </div>
                )}

                {showHint && !isAnswered && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-amber-50/80 rounded-2xl border border-amber-200 text-xs text-amber-900 font-medium flex items-start space-x-2"
                  >
                    <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span><strong>Diagnostic Clue:</strong> {currentQ.hint}</span>
                  </motion.div>
                )}

                {isAnswered && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-5 rounded-3xl bg-slate-900 text-white space-y-3"
                  >
                    <div className="flex items-center space-x-2 text-amber-400 font-black text-xs uppercase tracking-wider">
                      <Sparkles className="w-4 h-4" />
                      <span>The Engineering & Physics Principle: {currentQ.critical_thinking_principle}</span>
                    </div>
                    <p className="text-slate-300 text-xs md:text-sm leading-relaxed">
                      {currentQ.explanation}
                    </p>
                    <div className="pt-2 flex justify-end">
                      <button
                        onClick={handleNext}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-2xl font-bold text-xs flex items-center space-x-2 shadow-lg shadow-indigo-600/30 transition-all"
                      >
                        <span>{currentIndex < filteredQuestions.length - 1 ? 'Next Diagnostic Challenge' : 'Complete Challenge'}</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-slate-400">No questions found in this category.</div>
          )}
        </div>

        {/* Modal for Expanded Image View */}
        {showImageZoom && (
          <div className="fixed inset-0 z-[150] bg-slate-950/90 flex items-center justify-center p-6 backdrop-blur-md">
            <div className="max-w-4xl w-full bg-slate-900 rounded-3xl overflow-hidden border border-slate-700 relative p-4 space-y-4">
              <div className="flex items-center justify-between text-white">
                <span className="font-bold text-sm">{currentQ?.title} — Full Resolution Diagnostic View</span>
                <button
                  onClick={() => setShowImageZoom(false)}
                  className="p-2 text-slate-400 hover:text-white rounded-xl"
                >
                  <CloseIcon className="w-6 h-6" />
                </button>
              </div>
              <img
                src={currentQ?.image_url}
                alt=""
                className="w-full max-h-[70vh] object-contain rounded-2xl bg-black"
              />
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
