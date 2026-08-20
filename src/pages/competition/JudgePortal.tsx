import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Award, ShieldCheck, CheckCircle2, Lock, Unlock, 
  Sparkles, FileText, ChevronRight, Waves, Compass, 
  Lightbulb, Users, Clock, AlertCircle
} from 'lucide-react';
import { getJudges, getDigitalScores, submitJudgeScore, toggleScoreLock } from '../../services/competitionEcosystemService';
import { getRegistrations } from '../../services/yaraCompetitionService';
import { JudgeRecord, DigitalScoreSubmission } from '../../types/competitionEcosystem';
import { YaraCompetitionRegistration, CompetitionCategoryType } from '../../types/yaraCompetition';

export default function JudgePortal() {
  const [judges, setJudges] = useState<JudgeRecord[]>([]);
  const [activeJudge, setActiveJudge] = useState<JudgeRecord | null>(null);
  const [teams, setTeams] = useState<YaraCompetitionRegistration[]>([]);
  const [scores, setScores] = useState<DigitalScoreSubmission[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<YaraCompetitionRegistration | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<CompetitionCategoryType>('underwater_drone');

  // Scoring rubric state (Engineering Design /20, Innovation /20, Performance /40, Safety /10, Teamwork /10)
  const [engDesign, setEngDesign] = useState<number>(18);
  const [innovation, setInnovation] = useState<number>(17);
  const [performance, setPerformance] = useState<number>(35);
  const [safety, setSafety] = useState<number>(9);
  const [teamwork, setTeamwork] = useState<number>(9);
  const [judgeNotes, setJudgeNotes] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const loadData = async () => {
    const [allJudges, allTeams, allScores] = await Promise.all([
      getJudges(),
      getRegistrations(),
      getDigitalScores()
    ]);

    setJudges(allJudges);
    setTeams(allTeams);
    setScores(allScores);

    if (allJudges.length > 0) {
      setActiveJudge(allJudges[0]);
    }
    if (allTeams.length > 0) {
      setSelectedTeam(allTeams[0]);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // When selected team or category changes, load existing score if present
  useEffect(() => {
    if (!selectedTeam || !activeJudge) return;

    const existing = scores.find(
      s => s.team_id === selectedTeam.id && s.category === selectedCategory && s.judge_id === activeJudge.id
    );

    if (existing) {
      setEngDesign(existing.engineering_design);
      setInnovation(existing.innovation);
      setPerformance(existing.performance);
      setSafety(existing.safety);
      setTeamwork(existing.teamwork);
      setJudgeNotes(existing.notes || '');
    } else {
      // Set reasonable defaults
      setEngDesign(18);
      setInnovation(17);
      setPerformance(35);
      setSafety(9);
      setTeamwork(9);
      setJudgeNotes('');
    }
  }, [selectedTeam, selectedCategory, activeJudge, scores]);

  const currentTotal = engDesign + innovation + performance + safety + teamwork;

  const currentScoreRecord = selectedTeam && activeJudge
    ? scores.find(s => s.team_id === selectedTeam.id && s.category === selectedCategory && s.judge_id === activeJudge.id)
    : null;

  const handleSubmitScore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeam || !activeJudge) return;

    setSaving(true);
    setSuccessNotice(null);

    await submitJudgeScore({
      team_id: selectedTeam.id,
      team_name: selectedTeam.team_name,
      registration_id: selectedTeam.registration_id,
      category: selectedCategory,
      judge_id: activeJudge.id,
      judge_name: activeJudge.full_name,
      engineering_design: engDesign,
      innovation,
      performance,
      safety,
      teamwork,
      notes: judgeNotes,
      is_locked: true
    });

    setSuccessNotice(`Scores for ${selectedTeam.team_name} locked and submitted (${currentTotal}/100)!`);
    setSaving(false);
    loadData();
  };

  const handleToggleLock = async () => {
    if (!currentScoreRecord) return;
    await toggleScoreLock(currentScoreRecord.id, !currentScoreRecord.is_locked);
    loadData();
  };

  if (!activeJudge) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      {/* 1. JUDGE BANNER */}
      <div className="p-6 md:p-8 bg-slate-900 text-white rounded-3xl border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 bg-amber-400 text-slate-950 rounded-full text-xs font-black uppercase tracking-wider">
                ⚖️ YARA Robotics Competition — Official Judge Panel
              </span>
              {activeJudge.is_lead_judge && (
                <span className="px-3 py-1 bg-indigo-500/30 text-indigo-300 border border-indigo-400/40 rounded-full text-xs font-bold">
                  ⭐ Chief Marshal & Lead Judge
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-4xl font-black">{activeJudge.full_name}</h1>
            <p className="text-xs sm:text-sm text-slate-300">
              {activeJudge.designation} • <strong className="text-white">{activeJudge.organization}</strong>
            </p>
          </div>

          {/* Judge Switcher */}
          {judges.length > 1 && (
            <div className="p-3 bg-white/5 rounded-2xl border border-white/10 space-y-1 text-xs">
              <span className="text-slate-400 font-bold block">Switch Judge View:</span>
              <div className="flex gap-2">
                {judges.map(j => (
                  <button
                    key={j.id}
                    onClick={() => setActiveJudge(j)}
                    className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                      activeJudge.id === j.id ? 'bg-indigo-600 text-white' : 'bg-white/10 text-slate-300 hover:bg-white/20'
                    }`}
                  >
                    {j.full_name.split(' ')[1] || j.full_name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 2. MAIN SCORING ARENA GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Team Selection & Status */}
        <div className="space-y-4">
          <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900">Assigned Teams</h3>
              <span className="text-xs text-slate-500 font-bold">{teams.length} Teams Registered</span>
            </div>

            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
              {teams.map(team => {
                const isSelected = selectedTeam?.id === team.id;
                const hasScore = scores.some(s => s.team_id === team.id);

                return (
                  <button
                    key={team.id}
                    onClick={() => setSelectedTeam(team)}
                    className={`w-full text-left p-3.5 rounded-2xl border transition-all ${
                      isSelected
                        ? 'bg-indigo-50 border-indigo-400 shadow-xs'
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900">{team.team_name}</span>
                      {hasScore && (
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-md flex items-center space-x-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Scored</span>
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500">{team.school_organization} • {team.province}</p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right 2 Cols: Digital Score Sheet */}
        <div className="lg:col-span-2 space-y-6">
          {selectedTeam ? (
            <div className="p-6 md:p-8 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <span className="text-xs font-mono font-bold text-slate-400">Team: {selectedTeam.registration_id}</span>
                  <h2 className="text-2xl font-black text-slate-900">{selectedTeam.team_name}</h2>
                </div>

                {/* Challenge Selector */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedCategory('underwater_drone')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      selectedCategory === 'underwater_drone' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    🌊 Underwater
                  </button>
                  <button
                    onClick={() => setSelectedCategory('autonomous_maze')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      selectedCategory === 'autonomous_maze' ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    🤖 Maze
                  </button>
                  <button
                    onClick={() => setSelectedCategory('innovation_pitch')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      selectedCategory === 'innovation_pitch' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    💡 Pitch
                  </button>
                </div>
              </div>

              {successNotice && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center space-x-3 text-xs font-bold">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>{successNotice}</span>
                </div>
              )}

              {/* Rubric Sliders Form */}
              <form onSubmit={handleSubmitScore} className="space-y-6">
                <div className="space-y-5">
                  {/* 1. Engineering Design */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-800">1. Engineering Design & Mechanical Robustness</span>
                      <span className="font-mono text-indigo-600 bg-white px-3 py-1 rounded-xl border border-slate-200">
                        {engDesign} / 20 pts
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={20}
                      value={engDesign}
                      disabled={currentScoreRecord?.is_locked}
                      onChange={e => setEngDesign(parseInt(e.target.value))}
                      className="w-full accent-indigo-600 cursor-pointer"
                    />
                    <p className="text-[11px] text-slate-500">
                      Evaluates structural integrity, wiring neatness, waterproofing/chassis, and component reliability.
                    </p>
                  </div>

                  {/* 2. Innovation */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-800">2. Technical Innovation & Creativity</span>
                      <span className="font-mono text-amber-600 bg-white px-3 py-1 rounded-xl border border-slate-200">
                        {innovation} / 20 pts
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={20}
                      value={innovation}
                      disabled={currentScoreRecord?.is_locked}
                      onChange={e => setInnovation(parseInt(e.target.value))}
                      className="w-full accent-amber-600 cursor-pointer"
                    />
                    <p className="text-[11px] text-slate-500">
                      Novelty of algorithmic logic, local low-cost component adaptation, and unique engineering approaches.
                    </p>
                  </div>

                  {/* 3. Performance & Mission Execution */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-800">3. Arena Mission Performance & Time Efficiency</span>
                      <span className="font-mono text-emerald-600 bg-white px-3 py-1 rounded-xl border border-slate-200">
                        {performance} / 40 pts
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={40}
                      value={performance}
                      disabled={currentScoreRecord?.is_locked}
                      onChange={e => setPerformance(parseInt(e.target.value))}
                      className="w-full accent-emerald-600 cursor-pointer"
                    />
                    <p className="text-[11px] text-slate-500">
                      Course completion, target retrieval accuracy in tank, maze corridor resolution speed, or pitch presentation poise.
                    </p>
                  </div>

                  {/* 4. Safety & Operational Standards */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-800">4. Electrical & Physical Safety</span>
                      <span className="font-mono text-blue-600 bg-white px-3 py-1 rounded-xl border border-slate-200">
                        {safety} / 10 pts
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={10}
                      value={safety}
                      disabled={currentScoreRecord?.is_locked}
                      onChange={e => setSafety(parseInt(e.target.value))}
                      className="w-full accent-blue-600 cursor-pointer"
                    />
                    <p className="text-[11px] text-slate-500">
                      Proper insulation, battery fusing, smooth edges, kill switches, and safe operator handling.
                    </p>
                  </div>

                  {/* 5. Teamwork & Gender Inclusivity */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-800">5. Teamwork, Communication & Gender Collaboration</span>
                      <span className="font-mono text-purple-600 bg-white px-3 py-1 rounded-xl border border-slate-200">
                        {teamwork} / 10 pts
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={10}
                      value={teamwork}
                      disabled={currentScoreRecord?.is_locked}
                      onChange={e => setTeamwork(parseInt(e.target.value))}
                      className="w-full accent-purple-600 cursor-pointer"
                    />
                    <p className="text-[11px] text-slate-500">
                      Cohesive participation across all 4+ members (boys and girls actively defending code/mechanics).
                    </p>
                  </div>
                </div>

                {/* Judge Commentary Notes */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Official Judge Feedback & Commendations
                  </label>
                  <textarea
                    rows={3}
                    value={judgeNotes}
                    disabled={currentScoreRecord?.is_locked}
                    onChange={e => setJudgeNotes(e.target.value)}
                    placeholder="Enter constructive technical feedback for this team..."
                    className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden disabled:bg-slate-100"
                  />
                </div>

                {/* Total Calculated Score Display */}
                <div className="p-6 bg-slate-900 text-white rounded-2xl flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Total Evaluated Score</span>
                    <p className="text-xs text-slate-400">Summed across all 5 official rubric dimensions</p>
                  </div>
                  <div className="text-right">
                    <span className="text-4xl font-black text-white font-mono">{currentTotal}</span>
                    <span className="text-sm font-bold text-slate-400"> / 100</span>
                  </div>
                </div>

                {/* Submission & Locking Controls */}
                <div className="flex items-center justify-between pt-2">
                  {currentScoreRecord && (
                    <button
                      type="button"
                      onClick={handleToggleLock}
                      className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-100"
                    >
                      {currentScoreRecord.is_locked ? (
                        <>
                          <Unlock className="w-4 h-4 text-amber-600" />
                          <span>Reopen Score for Edit</span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-4 h-4 text-slate-600" />
                          <span>Lock Scores</span>
                        </>
                      )}
                    </button>
                  )}

                  <button
                    type="submit"
                    disabled={saving || currentScoreRecord?.is_locked}
                    className="ml-auto px-8 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md disabled:opacity-50 flex items-center space-x-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{saving ? 'Submitting...' : 'Submit & Lock Score'}</span>
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 shadow-sm text-slate-400">
              Select a team from the left roster to begin scoring.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
