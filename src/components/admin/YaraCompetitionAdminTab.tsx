import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, Users, ShieldCheck, Download, Search, Filter, CheckCircle2, 
  XCircle, Clock, AlertTriangle, Eye, Edit3, Trash2, Calendar, 
  MapPin, Building2, Mail, Phone, FileText, Settings, Award, 
  RefreshCw, Check, Sparkles, Send, Waves, Compass, Lightbulb, Lock, Unlock
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { 
  YaraCompetitionRegistration, 
  CompetitionEventConfig, 
  CompetitionCategoryType, 
  CategoryScoreSheet 
} from '../../types/yaraCompetition';
import { DigitalScoreSubmission, JudgeRecord } from '../../types/competitionEcosystem';
import { 
  getRegistrations, 
  updateRegistrationStatus, 
  getEventConfig, 
  updateEventConfig,
  exportRegistrationsToCSV,
  getScoreSheets,
  getEmailNotifications
} from '../../services/yaraCompetitionService';
import { getDigitalScores, toggleScoreLock, getJudges } from '../../services/competitionEcosystemService';
import { ZIMBABWE_PROVINCES_AND_DISTRICTS } from '../../constants/yaraCompetitionData';
import JudgeScoringModal from '../competition/JudgeScoringModal';

export default function YaraCompetitionAdminTab() {
  const [registrations, setRegistrations] = useState<YaraCompetitionRegistration[]>([]);
  const [eventConfig, setEventConfig] = useState<CompetitionEventConfig | null>(null);
  const [scoreSheets, setScoreSheets] = useState<CategoryScoreSheet[]>([]);
  const [digitalScores, setDigitalScores] = useState<DigitalScoreSubmission[]>([]);
  const [judgesList, setJudgesList] = useState<JudgeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [scoreActionNotice, setScoreActionNotice] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [provinceFilter, setProvinceFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [judgeLockFilter, setJudgeLockFilter] = useState<'ALL' | 'locked' | 'unlocked'>('ALL');

  // Selected Team for Detail Dossier Modal
  const [selectedTeam, setSelectedTeam] = useState<YaraCompetitionRegistration | null>(null);

  // Correction Request dialog state
  const [correctionNote, setCorrectionNote] = useState('');
  const [isRequestingCorrection, setIsRequestingCorrection] = useState(false);

  // Judge scoring modal state
  const [scoringTeam, setScoringTeam] = useState<{ team: YaraCompetitionRegistration; category: CompetitionCategoryType } | null>(null);

  // Event settings editing mode
  const [isEditingSettings, setIsEditingSettings] = useState(false);
  const [settingsForm, setSettingsForm] = useState<CompetitionEventConfig | null>(null);
  const [savingSettings, setSavingSettings] = useState(false);

  const [activeSubTab, setActiveSubTab] = useState<'teams' | 'judges_scores' | 'settings' | 'notifications'>('teams');

  const fetchData = async () => {
    setLoading(true);
    const [regs, config, scores, digScores, judges] = await Promise.all([
      getRegistrations(),
      getEventConfig(),
      getScoreSheets(),
      getDigitalScores(),
      getJudges()
    ]);
    setRegistrations(regs);
    setEventConfig(config);
    setSettingsForm(config);
    setScoreSheets(scores);
    setDigitalScores(digScores);
    setJudgesList(judges);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Compute Dashboard Metrics
  const metrics = useMemo(() => {
    const totalTeams = registrations.length;
    const totalParticipants = registrations.reduce((acc, r) => acc + (r.total_members || 0), 0);
    const uniqueSchools = new Set(registrations.map(r => r.school_organization.trim().toLowerCase())).size;
    const uniqueProvinces = new Set(registrations.map(r => r.province)).size;
    const underwaterCount = registrations.filter(r => r.selected_categories.includes('underwater_drone')).length;
    const mazeCount = registrations.filter(r => r.selected_categories.includes('autonomous_maze')).length;
    const innovationCount = registrations.filter(r => r.selected_categories.includes('innovation_pitch')).length;
    const approvedCount = registrations.filter(r => r.status === 'Approved').length;
    const pendingCount = registrations.filter(r => r.status === 'Submitted' || r.status === 'Under Review').length;

    return {
      totalTeams,
      totalParticipants,
      uniqueSchools,
      uniqueProvinces,
      underwaterCount,
      mazeCount,
      innovationCount,
      approvedCount,
      pendingCount
    };
  }, [registrations]);

  // Filtered List
  const filteredRegistrations = useMemo(() => {
    return registrations.filter(r => {
      const matchSearch = 
        r.team_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.school_organization.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.registration_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.team_leader_name.toLowerCase().includes(searchQuery.toLowerCase());

      const matchProv = provinceFilter === 'ALL' || r.province === provinceFilter;
      const matchCat = categoryFilter === 'ALL' || r.selected_categories.includes(categoryFilter as any);
      const matchStatus = statusFilter === 'ALL' || r.status === statusFilter;

      return matchSearch && matchProv && matchCat && matchStatus;
    });
  }, [registrations, searchQuery, provinceFilter, categoryFilter, statusFilter]);

  const handleStatusChange = async (regId: string, newStatus: YaraCompetitionRegistration['status'], note?: string) => {
    await updateRegistrationStatus(regId, newStatus, note);
    fetchData();
    if (selectedTeam && selectedTeam.id === regId) {
      setSelectedTeam(prev => prev ? { ...prev, status: newStatus, admin_notes: note } : null);
    }
  };

  const handleSaveSettings = async () => {
    if (!settingsForm) return;
    setSavingSettings(true);
    await updateEventConfig(settingsForm);
    setEventConfig(settingsForm);
    setIsEditingSettings(false);
    setSavingSettings(false);
  };

  const handleToggleScoreLock = async (score: DigitalScoreSubmission) => {
    const newLockState = !score.is_locked;
    await toggleScoreLock(score.id, newLockState);
    if (newLockState) {
      setScoreActionNotice(`Scorecard for "${score.team_name}" has been locked.`);
    } else {
      setScoreActionNotice(`Scorecard for "${score.team_name}" unlocked! Judge ${score.judge_name} can now modify their score in the Judge Portal.`);
    }
    setTimeout(() => setScoreActionNotice(null), 5000);
    fetchData();
  };

  const filteredDigitalScores = useMemo(() => {
    return digitalScores.filter(s => {
      const matchSearch = 
        s.team_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.judge_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.registration_id.toLowerCase().includes(searchQuery.toLowerCase());

      const matchCat = categoryFilter === 'ALL' || s.category === categoryFilter;
      const matchLock = 
        judgeLockFilter === 'ALL' || 
        (judgeLockFilter === 'locked' && s.is_locked) || 
        (judgeLockFilter === 'unlocked' && !s.is_locked);

      return matchSearch && matchCat && matchLock;
    });
  }, [digitalScores, searchQuery, categoryFilter, judgeLockFilter]);

  const emailLogs = getEmailNotifications();

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="p-6 md:p-8 bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 rounded-3xl text-white flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
        <div>
          <div className="flex items-center space-x-2 text-amber-400 text-xs font-black uppercase tracking-widest mb-1.5">
            <ShieldCheck className="w-4 h-4" />
            <span>YARA Technical Administration & Competition Control</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-black tracking-tight">
            YARA Educational Robotics Competition 2026
          </h2>
          <p className="text-slate-300 text-xs md:text-sm mt-1 max-w-xl">
            Manage registrations, 2B+2G mandatory roster verification, judge score entries, event dates & broadcast leaderboards.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={() => exportRegistrationsToCSV(registrations)}
            className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center space-x-2 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={fetchData}
            className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center space-x-2 transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* 9 METRICS CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Teams</span>
          <span className="text-2xl font-black text-slate-900 font-mono mt-0.5 block">{metrics.totalTeams}</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Participants</span>
          <span className="text-2xl font-black text-indigo-600 font-mono mt-0.5 block">{metrics.totalParticipants}</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Schools Represented</span>
          <span className="text-2xl font-black text-slate-800 font-mono mt-0.5 block">{metrics.uniqueSchools}</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Provinces</span>
          <span className="text-2xl font-black text-slate-800 font-mono mt-0.5 block">{metrics.uniqueProvinces}</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block">Approved Teams</span>
          <span className="text-2xl font-black text-emerald-600 font-mono mt-0.5 block">{metrics.approvedCount}</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider block">Pending Review</span>
          <span className="text-2xl font-black text-amber-600 font-mono mt-0.5 block">{metrics.pendingCount}</span>
        </div>

        <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-200/80 shadow-sm">
          <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider block">Underwater Teams</span>
          <span className="text-2xl font-black text-blue-700 font-mono mt-0.5 block">{metrics.underwaterCount}</span>
        </div>

        <div className="p-4 bg-amber-50/50 rounded-2xl border border-amber-200/80 shadow-sm">
          <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block">Maze Teams</span>
          <span className="text-2xl font-black text-amber-700 font-mono mt-0.5 block">{metrics.mazeCount}</span>
        </div>

        <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-200/80 shadow-sm col-span-2 sm:col-span-1">
          <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">Innovation Pitches</span>
          <span className="text-2xl font-black text-emerald-700 font-mono mt-0.5 block">{metrics.innovationCount}</span>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveSubTab('teams')}
          className={cn(
            "px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2",
            activeSubTab === 'teams' ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
          )}
        >
          <Users className="w-4 h-4" />
          <span>Registered Teams ({registrations.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('judges_scores')}
          className={cn(
            "px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2",
            activeSubTab === 'judges_scores' ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20" : "text-slate-600 hover:bg-slate-100"
          )}
        >
          <Award className="w-4 h-4" />
          <span>⚖️ Judge Scorecards & Unlock Control ({digitalScores.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('settings')}
          className={cn(
            "px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2",
            activeSubTab === 'settings' ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
          )}
        >
          <Settings className="w-4 h-4" />
          <span>Competition Settings & Dates</span>
        </button>

        <button
          onClick={() => setActiveSubTab('notifications')}
          className={cn(
            "px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2",
            activeSubTab === 'notifications' ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
          )}
        >
          <Send className="w-4 h-4" />
          <span>Email Notifications ({emailLogs.length})</span>
        </button>
      </div>

      {/* SUBTAB 1: TEAMS DIRECTORY & DOSSIER */}
      {activeSubTab === 'teams' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search team, registration ID, school or leader..."
                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
              />
            </div>

            <select
              value={provinceFilter}
              onChange={e => setProvinceFilter(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-700 font-medium"
            >
              <option value="ALL">All Provinces</option>
              {Object.keys(ZIMBABWE_PROVINCES_AND_DISTRICTS).map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>

            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-700 font-medium"
            >
              <option value="ALL">All Challenges</option>
              <option value="underwater_drone">Underwater Drone</option>
              <option value="autonomous_maze">Autonomous Maze</option>
              <option value="innovation_pitch">Innovation Pitch</option>
            </select>

            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-700 font-medium"
            >
              <option value="ALL">All Statuses</option>
              <option value="Submitted">Submitted</option>
              <option value="Approved">Approved</option>
              <option value="Under Review">Under Review</option>
              <option value="Corrections Required">Corrections Required</option>
              <option value="Rejected">Rejected</option>
              <option value="Winner">Winner</option>
            </select>
          </div>

          {/* Teams Table */}
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200 text-[10px]">
                  <tr>
                    <th className="py-3.5 px-4">Registration ID</th>
                    <th className="py-3.5 px-4">Team & School</th>
                    <th className="py-3.5 px-4">Province</th>
                    <th className="py-3.5 px-4">Composition (2B+2G)</th>
                    <th className="py-3.5 px-4">Challenges</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRegistrations.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400">
                        No team registrations match the specified criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredRegistrations.map((team) => (
                      <tr key={team.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-indigo-700">
                          {team.registration_id}
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="font-bold text-slate-900 block">{team.team_name}</span>
                          <span className="text-[11px] text-slate-500">{team.school_organization}</span>
                        </td>

                        <td className="py-3.5 px-4 text-slate-600 font-medium">
                          {team.province} ({team.district})
                        </td>

                        <td className="py-3.5 px-4">
                          <span className={cn(
                            "px-2.5 py-1 rounded-full text-[10px] font-bold inline-flex items-center space-x-1",
                            team.is_gender_eligible 
                              ? "bg-emerald-100 text-emerald-800" 
                              : "bg-amber-100 text-amber-800"
                          )}>
                            <span>{team.boys_count}B + {team.girls_count}G ({team.total_members} total)</span>
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="flex flex-wrap gap-1">
                            {team.selected_categories.map(c => (
                              <span key={c} className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-semibold">
                                {c === 'underwater_drone' ? 'Underwater' : c === 'autonomous_maze' ? 'Maze' : 'Pitch'}
                              </span>
                            ))}
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className={cn(
                            "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase",
                            team.status === 'Approved' ? "bg-emerald-100 text-emerald-800" :
                            team.status === 'Submitted' ? "bg-blue-100 text-blue-800" :
                            team.status === 'Corrections Required' ? "bg-amber-100 text-amber-800" :
                            team.status === 'Winner' ? "bg-purple-100 text-purple-800" :
                            "bg-slate-100 text-slate-700"
                          )}>
                            {team.status}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-right space-x-2">
                          <button
                            onClick={() => setSelectedTeam(team)}
                            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs"
                          >
                            Review Dossier
                          </button>

                          <button
                            onClick={() => {
                              const firstCat = team.selected_categories[0] || 'underwater_drone';
                              setScoringTeam({ team, category: firstCat });
                            }}
                            className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs"
                          >
                            Enter Scores
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Notice Banner for Score Actions */}
      {scoreActionNotice && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl flex items-center space-x-2 text-xs font-bold shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{scoreActionNotice}</span>
        </div>
      )}

      {/* SUBTAB: JUDGE SCORECARDS & UNLOCK CONTROL */}
      {activeSubTab === 'judges_scores' && (
        <div className="space-y-6">
          <div className="p-6 bg-slate-900 text-white rounded-3xl space-y-2">
            <div className="flex items-center space-x-2 text-amber-400 text-xs font-black uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              <span>National Championship Technical Scoring Ledger</span>
            </div>
            <h3 className="text-xl md:text-2xl font-black">Official Judge Scorecards & Lock Controls</h3>
            <p className="text-slate-300 text-xs max-w-3xl leading-relaxed">
              In accordance with YARA Championship regulations, when judges submit evaluations, the scorecards are locked to prevent unauthorized tampering. 
              Only authorized National Administrators can unlock a scorecard to permit a judge to re-score or adjust rubric marks in the live portal.
            </p>
          </div>

          {/* Filters for Judge Scorecards */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs text-xs">
            <div className="flex items-center space-x-2">
              <span className="font-bold text-slate-500">Lock State:</span>
              {(['ALL', 'locked', 'unlocked'] as const).map(mode => (
                <button
                  key={mode}
                  onClick={() => setJudgeLockFilter(mode)}
                  className={cn(
                    "px-3 py-1.5 rounded-xl font-bold transition-all",
                    judgeLockFilter === mode ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  )}
                >
                  {mode === 'ALL' ? 'All Scorecards' : mode === 'locked' ? '🔒 Locked Only' : '🔓 Unlocked Only'}
                </button>
              ))}
            </div>

            <div className="flex items-center space-x-2">
              <span className="font-bold text-slate-500">Category:</span>
              <select
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
                className="p-1.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 text-xs"
              >
                <option value="ALL">All Categories</option>
                <option value="underwater_drone">Underwater Robotics</option>
                <option value="autonomous_maze">Autonomous Maze Navigation</option>
                <option value="innovation_pitch">Innovation & Pitch</option>
              </select>
            </div>
          </div>

          {/* Scores List */}
          {filteredDigitalScores.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 text-slate-400">
              No judge scorecards recorded matching current filters.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredDigitalScores.map(score => {
                const totalScore = 
                  (score.engineering_design_points || 0) +
                  (score.innovation_points || 0) +
                  (score.mission_performance_points || 0) +
                  (score.safety_compliance_points || 0) +
                  (score.teamwork_presentation_points || 0);

                return (
                  <div
                    key={score.id}
                    className="p-6 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      {/* Header */}
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[10px] font-mono font-bold text-indigo-600 uppercase tracking-wider block">
                            {score.registration_id} • {score.category.replace('_', ' ')}
                          </span>
                          <h4 className="text-base font-black text-slate-900">{score.team_name}</h4>
                          <p className="text-xs text-slate-500">
                            Evaluated by: <strong className="text-slate-800">{score.judge_name}</strong>
                          </p>
                        </div>

                        {/* Lock Status Badge */}
                        <span className={cn(
                          "px-3 py-1 rounded-xl text-xs font-black uppercase flex items-center space-x-1",
                          score.is_locked ? "bg-amber-100 text-amber-800" : "bg-blue-100 text-blue-800"
                        )}>
                          {score.is_locked ? <Lock className="w-3.5 h-3.5 mr-1" /> : <Unlock className="w-3.5 h-3.5 mr-1" />}
                          <span>{score.is_locked ? 'Locked' : 'Unlocked (Editable)'}</span>
                        </span>
                      </div>

                      {/* Rubric Breakdown Grid */}
                      <div className="grid grid-cols-5 gap-1.5 p-3 bg-slate-50 rounded-2xl text-center text-[10px]">
                        <div className="p-1 bg-white rounded-lg border border-slate-200/60">
                          <span className="text-slate-400 block font-bold">Design</span>
                          <span className="font-mono font-black text-slate-800">{score.engineering_design_points}/20</span>
                        </div>
                        <div className="p-1 bg-white rounded-lg border border-slate-200/60">
                          <span className="text-slate-400 block font-bold">Innov</span>
                          <span className="font-mono font-black text-slate-800">{score.innovation_points}/20</span>
                        </div>
                        <div className="p-1 bg-white rounded-lg border border-slate-200/60">
                          <span className="text-slate-400 block font-bold">Perf</span>
                          <span className="font-mono font-black text-slate-800">{score.mission_performance_points}/40</span>
                        </div>
                        <div className="p-1 bg-white rounded-lg border border-slate-200/60">
                          <span className="text-slate-400 block font-bold">Safety</span>
                          <span className="font-mono font-black text-slate-800">{score.safety_compliance_points}/10</span>
                        </div>
                        <div className="p-1 bg-white rounded-lg border border-slate-200/60">
                          <span className="text-slate-400 block font-bold">Team</span>
                          <span className="font-mono font-black text-slate-800">{score.teamwork_presentation_points}/10</span>
                        </div>
                      </div>

                      {/* Total Score & Feedback */}
                      <div className="flex items-center justify-between p-3 bg-indigo-50/70 border border-indigo-100 rounded-2xl text-xs">
                        <span className="font-bold text-indigo-900">Total Evaluated Score</span>
                        <span className="text-lg font-black font-mono text-indigo-950">{totalScore} / 100</span>
                      </div>

                      {score.judge_notes && (
                        <p className="text-xs text-slate-600 font-medium italic bg-slate-50 p-3 rounded-xl border border-slate-100">
                          "{score.judge_notes}"
                        </p>
                      )}
                    </div>

                    {/* Admin Unlock Action */}
                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[11px] text-slate-400 font-mono">
                        Updated: {new Date(score.updated_at || score.submitted_at || Date.now()).toLocaleTimeString()}
                      </span>

                      <button
                        type="button"
                        onClick={() => handleToggleScoreLock(score)}
                        className={cn(
                          "px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-xs transition-all",
                          score.is_locked
                            ? "bg-amber-600 hover:bg-amber-700 text-white shadow-amber-600/20"
                            : "bg-slate-900 hover:bg-slate-800 text-white"
                        )}
                      >
                        {score.is_locked ? (
                          <>
                            <Unlock className="w-3.5 h-3.5" />
                            <span>Unlock for Judge Edit</span>
                          </>
                        ) : (
                          <>
                            <Lock className="w-3.5 h-3.5" />
                            <span>Re-Lock Scorecard</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SUBTAB 2: EVENT SETTINGS & EDITABLE DATES */}
      {activeSubTab === 'settings' && settingsForm && (
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 space-y-6 max-w-3xl">
          <div>
            <h3 className="text-xl font-bold text-slate-900">Event Configuration & Year Scaling</h3>
            <p className="text-slate-500 text-xs mt-1">
              Store editable dates, venues, registration deadlines, and configure future competition editions (2027/2028).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1.5 md:col-span-2">
              <label className="font-bold text-slate-700 uppercase tracking-wider">Competition Name</label>
              <input
                type="text"
                value={settingsForm.name}
                onChange={e => setSettingsForm({ ...settingsForm, name: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 font-bold"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 uppercase tracking-wider">Edition Year</label>
              <input
                type="number"
                value={settingsForm.edition_year}
                onChange={e => setSettingsForm({ ...settingsForm, edition_year: Number(e.target.value) })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 font-bold"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 uppercase tracking-wider">Organizer</label>
              <input
                type="text"
                value={settingsForm.organizer}
                onChange={e => setSettingsForm({ ...settingsForm, organizer: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 font-medium"
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="font-bold text-slate-700 uppercase tracking-wider">Theme</label>
              <input
                type="text"
                value={settingsForm.theme}
                onChange={e => setSettingsForm({ ...settingsForm, theme: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900"
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="font-bold text-slate-700 uppercase tracking-wider">Tagline</label>
              <input
                type="text"
                value={settingsForm.tagline}
                onChange={e => setSettingsForm({ ...settingsForm, tagline: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 uppercase tracking-wider">Competition Dates Display</label>
              <input
                type="text"
                value={settingsForm.date_display}
                onChange={e => setSettingsForm({ ...settingsForm, date_display: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 uppercase tracking-wider">Registration Deadline</label>
              <input
                type="text"
                value={settingsForm.registration_deadline_display}
                onChange={e => setSettingsForm({ ...settingsForm, registration_deadline_display: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900"
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="font-bold text-slate-700 uppercase tracking-wider">Venue Location</label>
              <input
                type="text"
                value={settingsForm.venue_display}
                onChange={e => setSettingsForm({ ...settingsForm, venue_display: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900"
              />
            </div>
          </div>

          {/* Toggle Switches */}
          <div className="pt-4 border-t border-slate-200 space-y-3">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settingsForm.is_registration_open}
                onChange={e => setSettingsForm({ ...settingsForm, is_registration_open: e.target.checked })}
                className="w-4 h-4 rounded text-indigo-600"
              />
              <span className="text-xs font-bold text-slate-800">Allow Online Team Registrations (Open / Closed)</span>
            </label>

            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settingsForm.is_leaderboard_published}
                onChange={e => setSettingsForm({ ...settingsForm, is_leaderboard_published: e.target.checked })}
                className="w-4 h-4 rounded text-indigo-600"
              />
              <span className="text-xs font-bold text-slate-800">Publish Live Arena Leaderboard to Public Participants</span>
            </label>
          </div>

          <button
            type="button"
            disabled={savingSettings}
            onClick={handleSaveSettings}
            className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-200"
          >
            {savingSettings ? 'Saving Settings...' : 'Save & Publish Event Settings'}
          </button>
        </div>
      )}

      {/* SUBTAB 3: EMAIL NOTIFICATIONS LOGS */}
      {activeSubTab === 'notifications' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 space-y-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Automated Notification Dispatch Records</h3>
            <p className="text-xs text-slate-500">
              Review delivery status of confirmation receipts, approval letters, and correction notices dispatched to team leaders.
            </p>
          </div>

          <div className="space-y-3">
            {emailLogs.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No email notifications recorded yet.</p>
            ) : (
              emailLogs.map((log) => (
                <div key={log.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-indigo-700">{log.subject}</span>
                    <span className="text-slate-400">{new Date(log.sent_at).toLocaleString()}</span>
                  </div>
                  <p className="text-slate-600 text-[11px] whitespace-pre-line bg-white p-3 rounded-xl border border-slate-200/60 font-mono">
                    {log.body}
                  </p>
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span>Recipient: {log.recipient_email}</span>
                    <span>Team: {log.team_name} ({log.registration_id})</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* INDIVIDUAL REGISTRATION DOSSIER MODAL */}
      {selectedTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-3xl w-full my-auto max-h-[90vh] overflow-y-auto flex flex-col">
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <div>
                <span className="text-amber-400 font-mono text-xs font-bold uppercase">{selectedTeam.registration_id}</span>
                <h3 className="text-xl font-black mt-0.5">{selectedTeam.team_name}</h3>
                <p className="text-xs text-slate-400">{selectedTeam.school_organization} • {selectedTeam.province} ({selectedTeam.district})</p>
              </div>

              <button onClick={() => setSelectedTeam(null)} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              {/* Status Action Buttons */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Current Registration Status</span>
                  <span className="text-sm font-bold text-indigo-700">{selectedTeam.status}</span>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleStatusChange(selectedTeam.id, 'Approved', 'Approved by YARA technical committee')}
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-sm"
                  >
                    Approve Entry
                  </button>

                  <button
                    onClick={() => setIsRequestingCorrection(true)}
                    className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-xs shadow-sm"
                  >
                    Request Corrections
                  </button>

                  <button
                    onClick={() => handleStatusChange(selectedTeam.id, 'Rejected', 'Does not meet minimum requirements')}
                    className="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs shadow-sm"
                  >
                    Reject
                  </button>
                </div>
              </div>

              {/* Correction Request Note Box */}
              {isRequestingCorrection && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl space-y-3">
                  <span className="font-bold text-amber-900">Specify Corrections for Team Leader:</span>
                  <textarea
                    rows={2}
                    value={correctionNote}
                    onChange={e => setCorrectionNote(e.target.value)}
                    placeholder="e.g. Please update team roster to satisfy the mandatory 2 boys + 2 girls requirement..."
                    className="w-full bg-white border border-amber-300 rounded-xl p-2 text-xs"
                  />
                  <div className="flex justify-end space-x-2">
                    <button onClick={() => setIsRequestingCorrection(false)} className="px-3 py-1.5 text-slate-600 font-bold">
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        handleStatusChange(selectedTeam.id, 'Corrections Required', correctionNote);
                        setIsRequestingCorrection(false);
                      }}
                      className="px-4 py-1.5 bg-amber-600 text-white font-bold rounded-xl"
                    >
                      Send Correction Notice
                    </button>
                  </div>
                </div>
              )}

              {/* Team Leader & Mentor */}
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div>
                  <span className="font-bold text-slate-800">Team Leader:</span>
                  <p className="text-slate-600">{selectedTeam.team_leader_name}</p>
                  <p className="text-slate-500">{selectedTeam.team_leader_email} • {selectedTeam.team_leader_phone || 'No phone'}</p>
                </div>
                <div>
                  <span className="font-bold text-slate-800">Mentor / Teacher:</span>
                  <p className="text-slate-600">{selectedTeam.mentor_name || 'Not provided'}</p>
                  <p className="text-slate-500">{selectedTeam.mentor_email || ''} • {selectedTeam.mentor_phone || ''}</p>
                </div>
              </div>

              {/* Roster & Gender Composition */}
              <div className="space-y-2">
                <span className="font-bold text-slate-800">Roster Participants ({selectedTeam.members.length} members — {selectedTeam.boys_count} Boys, {selectedTeam.girls_count} Girls):</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedTeam.members.map((m, idx) => (
                    <div key={m.id || idx} className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-slate-900">{m.full_name} {m.is_captain && '(Captain)'}</span>
                        <p className="text-[11px] text-slate-500">{m.role} • Age {m.age} ({m.grade_level || 'N/A'})</p>
                      </div>
                      <span className={cn("px-2 py-0.5 rounded text-[10px] font-bold", m.gender === 'boy' ? "bg-blue-100 text-blue-800" : "bg-pink-100 text-pink-800")}>
                        {m.gender === 'boy' ? 'Boy' : 'Girl'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Consents Recorded */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
                <span className="font-bold text-slate-800">Consents & Verification:</span>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600">
                  <div>✓ Rules Compliance: {selectedTeam.consents.competition_rules_agreed ? 'Yes' : 'No'}</div>
                  <div>✓ Minor Consent: {selectedTeam.consents.parent_guardian_consent_minor ? 'Yes' : 'No'}</div>
                  <div>✓ Event Participation: {selectedTeam.consents.event_participation_consent ? 'Yes' : 'No'}</div>
                  <div>✓ Media / Photo: {selectedTeam.consents.media_photo_video_consent ? 'Yes' : 'No'}</div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end shrink-0">
              <button
                onClick={() => setSelectedTeam(null)}
                className="px-6 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-xs"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* JUDGE SCORING MODAL */}
      {scoringTeam && (
        <JudgeScoringModal
          isOpen={!!scoringTeam}
          onClose={() => setScoringTeam(null)}
          team={scoringTeam.team}
          category={scoringTeam.category}
          judgeName="Chief Technical Judge"
          judgeId="judge-admin-01"
          isAdmin={true}
          onScoreSaved={fetchData}
        />
      )}
    </div>
  );
}
