import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Check, Lock, Unlock, Trophy, Waves, Compass, Lightbulb, 
  CheckCircle2, AlertCircle, Save, Star, FileText
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { 
  YaraCompetitionRegistration, 
  CompetitionCategoryType, 
  CategoryScoreSheet 
} from '../../types/yaraCompetition';
import { saveScoreSheet } from '../../services/yaraCompetitionService';

interface JudgeScoringModalProps {
  isOpen: boolean;
  onClose: () => void;
  team: YaraCompetitionRegistration;
  category: CompetitionCategoryType;
  judgeName: string;
  judgeId: string;
  existingScoreSheet?: CategoryScoreSheet;
  isAdmin?: boolean;
  onScoreSaved?: () => void;
}

export default function JudgeScoringModal({
  isOpen,
  onClose,
  team,
  category,
  judgeName,
  judgeId,
  existingScoreSheet,
  isAdmin = false,
  onScoreSaved
}: JudgeScoringModalProps) {
  const [isLocked, setIsLocked] = useState<boolean>(existingScoreSheet?.is_locked || false);
  const [judgeNotes, setJudgeNotes] = useState<string>(existingScoreSheet?.notes || '');
  const [saving, setSaving] = useState(false);

  // Underwater Drone Scores
  const [underwater, setUnderwater] = useState({
    mission_completion: existingScoreSheet?.underwater_scores?.mission_completion ?? 20, // max 25
    navigation: existingScoreSheet?.underwater_scores?.navigation ?? 12,                // max 15
    precision: existingScoreSheet?.underwater_scores?.precision ?? 12,                  // max 15
    engineering_design: existingScoreSheet?.underwater_scores?.engineering_design ?? 12,// max 15
    innovation: existingScoreSheet?.underwater_scores?.innovation ?? 8,                 // max 10
    reliability: existingScoreSheet?.underwater_scores?.reliability ?? 8,               // max 10
    safety: existingScoreSheet?.underwater_scores?.safety ?? 4,                         // max 5
    teamwork: existingScoreSheet?.underwater_scores?.teamwork ?? 4                      // max 5
  });

  // Maze Scores
  const [maze, setMaze] = useState({
    completion: existingScoreSheet?.maze_scores?.completion ?? 22,                     // max 25
    time_efficiency: existingScoreSheet?.maze_scores?.time_efficiency ?? 13,           // max 15
    navigation_accuracy: existingScoreSheet?.maze_scores?.navigation_accuracy ?? 13,   // max 15
    autonomous_operation: existingScoreSheet?.maze_scores?.autonomous_operation ?? 13,// max 15
    engineering_design: existingScoreSheet?.maze_scores?.engineering_design ?? 8,      // max 10
    programming_cleanliness: existingScoreSheet?.maze_scores?.programming_cleanliness ?? 9, // max 10
    reliability: existingScoreSheet?.maze_scores?.reliability ?? 8                    // max 10
  });

  // Pitch Scores
  const [pitch, setPitch] = useState({
    problem_understanding: existingScoreSheet?.pitch_scores?.problem_understanding ?? 18, // max 20
    innovation: existingScoreSheet?.pitch_scores?.innovation ?? 17,                       // max 20
    technical_feasibility: existingScoreSheet?.pitch_scores?.technical_feasibility ?? 17, // max 20
    social_impact: existingScoreSheet?.pitch_scores?.social_impact ?? 18,                 // max 20
    sustainability: existingScoreSheet?.pitch_scores?.sustainability ?? 8,                // max 10
    presentation_delivery: existingScoreSheet?.pitch_scores?.presentation_delivery ?? 9  // max 10
  });

  // Totals calculation
  const totalScore = useMemo(() => {
    if (category === 'underwater_drone') {
      return (
        underwater.mission_completion +
        underwater.navigation +
        underwater.precision +
        underwater.engineering_design +
        underwater.innovation +
        underwater.reliability +
        underwater.safety +
        underwater.teamwork
      );
    } else if (category === 'autonomous_maze') {
      return (
        maze.completion +
        maze.time_efficiency +
        maze.navigation_accuracy +
        maze.autonomous_operation +
        maze.engineering_design +
        maze.programming_cleanliness +
        maze.reliability
      );
    } else {
      return (
        pitch.problem_understanding +
        pitch.innovation +
        pitch.technical_feasibility +
        pitch.social_impact +
        pitch.sustainability +
        pitch.presentation_delivery
      );
    }
  }, [category, underwater, maze, pitch]);

  const handleSaveScore = async (lockOnSubmit = true) => {
    setSaving(true);
    const scoreSheet: CategoryScoreSheet = {
      id: existingScoreSheet?.id || `score-${Date.now()}`,
      registration_id: team.registration_id,
      team_id: team.id,
      team_name: team.team_name,
      category,
      judge_id: judgeId,
      judge_name: judgeName,
      is_locked: lockOnSubmit,
      submitted_at: new Date().toISOString(),
      notes: judgeNotes,
      final_category_score: totalScore,
      underwater_scores: category === 'underwater_drone' ? { ...underwater, total: totalScore } : undefined,
      maze_scores: category === 'autonomous_maze' ? { ...maze, total: totalScore } : undefined,
      pitch_scores: category === 'innovation_pitch' ? { ...pitch, total: totalScore } : undefined
    };

    await saveScoreSheet(scoreSheet);
    setSaving(false);
    setIsLocked(lockOnSubmit);
    if (onScoreSaved) onScoreSaved();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full my-auto overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
                <Trophy className="w-4 h-4" />
                <span>Official Judging Scorecard</span>
              </div>
              <h3 className="text-xl font-bold mt-1">{team.team_name}</h3>
              <p className="text-xs text-slate-400">{team.school_organization} • {team.registration_id}</p>
            </div>

            <div className="flex items-center space-x-3">
              <div className="text-right">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Score (/100)</span>
                <span className="text-2xl font-black text-amber-400 font-mono">{totalScore}</span>
              </div>
              <button onClick={onClose} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Form Content */}
          <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
            {isLocked && !isAdmin && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center space-x-3 text-amber-800 font-bold">
                <Lock className="w-5 h-5 shrink-0" />
                <span>This scorecard has been officially submitted and locked. Contact the technical committee to unlock.</span>
              </div>
            )}

            {/* UNDERWATER DRONE CRITERIA */}
            {category === 'underwater_drone' && (
              <div className="space-y-4">
                <h4 className="font-black text-sm text-slate-900 flex items-center space-x-2">
                  <Waves className="w-4 h-4 text-blue-600" />
                  <span>Underwater Drone Mission Challenge Rubric</span>
                </h4>

                <div className="space-y-3">
                  {[
                    { key: 'mission_completion' as const, label: 'Mission Completion (Object Retrieval & Recovery)', max: 25 },
                    { key: 'navigation' as const, label: 'Underwater Course Navigation & Depth Control', max: 15 },
                    { key: 'precision' as const, label: 'Target Alignment & Precision Handling', max: 15 },
                    { key: 'engineering_design' as const, label: 'Waterproofing, Buoyancy & Frame Robustness', max: 15 },
                    { key: 'innovation' as const, label: 'Sensory Telemetry & Mechanical Innovation', max: 10 },
                    { key: 'reliability' as const, label: 'Thruster Stability & Zero Loss of Control', max: 10 },
                    { key: 'safety' as const, label: 'Electrical & Waterproofing Safety Protocols', max: 5 },
                    { key: 'teamwork' as const, label: 'Pilot / Co-Pilot Communication & Synergy', max: 5 }
                  ].map(field => (
                    <div key={field.key} className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                      <span className="font-bold text-slate-800 pr-2">{field.label}</span>
                      <div className="flex items-center space-x-2 shrink-0">
                        <input
                          type="number"
                          min="0"
                          max={field.max}
                          disabled={isLocked && !isAdmin}
                          value={underwater[field.key]}
                          onChange={e => {
                            const val = Math.min(field.max, Math.max(0, Number(e.target.value)));
                            setUnderwater(prev => ({ ...prev, [field.key]: val }));
                          }}
                          className="w-16 text-center font-bold font-mono py-1.5 px-2 bg-white border border-slate-300 rounded-xl"
                        />
                        <span className="text-slate-400 font-medium">/ {field.max}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* AUTONOMOUS MAZE CRITERIA */}
            {category === 'autonomous_maze' && (
              <div className="space-y-4">
                <h4 className="font-black text-sm text-slate-900 flex items-center space-x-2">
                  <Compass className="w-4 h-4 text-amber-600" />
                  <span>Autonomous Maze Solving Challenge Rubric</span>
                </h4>

                <div className="space-y-3">
                  {[
                    { key: 'completion' as const, label: 'Maze Route Resolution & Destination Arrival', max: 25 },
                    { key: 'time_efficiency' as const, label: 'Traversal Speed & Lap Time Efficiency', max: 15 },
                    { key: 'navigation_accuracy' as const, label: 'Wall Clearance & Collision Avoidance', max: 15 },
                    { key: 'autonomous_operation' as const, label: 'Full Sensor-Driven Autonomous Autonomy', max: 15 },
                    { key: 'engineering_design' as const, label: 'Chassis Balance, Drive Train & Wiring', max: 10 },
                    { key: 'programming_cleanliness' as const, label: 'Firmware Logic, State Machine & PID Tuning', max: 10 },
                    { key: 'reliability' as const, label: 'Error Recovery & Dead-End Backtracking', max: 10 }
                  ].map(field => (
                    <div key={field.key} className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                      <span className="font-bold text-slate-800 pr-2">{field.label}</span>
                      <div className="flex items-center space-x-2 shrink-0">
                        <input
                          type="number"
                          min="0"
                          max={field.max}
                          disabled={isLocked && !isAdmin}
                          value={maze[field.key]}
                          onChange={e => {
                            const val = Math.min(field.max, Math.max(0, Number(e.target.value)));
                            setMaze(prev => ({ ...prev, [field.key]: val }));
                          }}
                          className="w-16 text-center font-bold font-mono py-1.5 px-2 bg-white border border-slate-300 rounded-xl"
                        />
                        <span className="text-slate-400 font-medium">/ {field.max}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* INNOVATION PITCH CRITERIA */}
            {category === 'innovation_pitch' && (
              <div className="space-y-4">
                <h4 className="font-black text-sm text-slate-900 flex items-center space-x-2">
                  <Lightbulb className="w-4 h-4 text-emerald-600" />
                  <span>Innovation Pitch: Technology for Underserved Youth</span>
                </h4>

                <div className="space-y-3">
                  {[
                    { key: 'problem_understanding' as const, label: 'Problem Understanding & Stakeholder Empathy (20%)', max: 20 },
                    { key: 'innovation' as const, label: 'Originality & Technical Innovation (20%)', max: 20 },
                    { key: 'technical_feasibility' as const, label: 'Technical Feasibility & Prototype Quality (20%)', max: 20 },
                    { key: 'social_impact' as const, label: 'Real-World Social Impact for Underserved Youth (20%)', max: 20 },
                    { key: 'sustainability' as const, label: 'Affordability, Scalability & Resource Efficiency (10%)', max: 10 },
                    { key: 'presentation_delivery' as const, label: 'Pitch Delivery & 3-Min Q&A Defense (10%)', max: 10 }
                  ].map(field => (
                    <div key={field.key} className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                      <span className="font-bold text-slate-800 pr-2">{field.label}</span>
                      <div className="flex items-center space-x-2 shrink-0">
                        <input
                          type="number"
                          min="0"
                          max={field.max}
                          disabled={isLocked && !isAdmin}
                          value={pitch[field.key]}
                          onChange={e => {
                            const val = Math.min(field.max, Math.max(0, Number(e.target.value)));
                            setPitch(prev => ({ ...prev, [field.key]: val }));
                          }}
                          className="w-16 text-center font-bold font-mono py-1.5 px-2 bg-white border border-slate-300 rounded-xl"
                        />
                        <span className="text-slate-400 font-medium">/ {field.max}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Judges Feedback Notes */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">Judge Qualitative Feedback & Commendations</label>
              <textarea
                rows={3}
                disabled={isLocked && !isAdmin}
                value={judgeNotes}
                onChange={e => setJudgeNotes(e.target.value)}
                placeholder="Detail technical commendations, safety notes, or suggestions for the young builders..."
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-slate-900 focus:outline-none focus:border-indigo-600"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 md:p-6 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs">
              {isAdmin && isLocked && (
                <button
                  type="button"
                  onClick={() => setIsLocked(false)}
                  className="px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold rounded-xl flex items-center space-x-1"
                >
                  <Unlock className="w-3.5 h-3.5" />
                  <span>Admin: Unlock Score</span>
                </button>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-xl font-bold text-xs"
              >
                Cancel
              </button>

              {(!isLocked || isAdmin) && (
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => handleSaveScore(true)}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-md shadow-indigo-200 flex items-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'Saving...' : 'Submit & Lock Score'}</span>
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
