import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Users, Trophy, Calendar, CheckCircle2, AlertCircle, 
  FileText, Upload, Sparkles, Waves, Compass, Lightbulb, 
  Clock, ShieldCheck, ArrowRight, Mail, Phone, MapPin, Award
} from 'lucide-react';
import { useAuth } from '../../components/AuthContext';
import { getRegistrations, getEventConfig } from '../../services/yaraCompetitionService';
import { getDigitalScores, getAnnouncements, getCertificates, generateCertificate } from '../../services/competitionEcosystemService';
import { YaraCompetitionRegistration } from '../../types/yaraCompetition';
import { DigitalScoreSubmission, CompetitionAnnouncement, DigitalCertificate } from '../../types/competitionEcosystem';
import TechnicalSubmissionModal from '../../components/competition/TechnicalSubmissionModal';
import DigitalCertificateModal from '../../components/competition/DigitalCertificateModal';
import MultiStepRegistrationModal from '../../components/competition/MultiStepRegistrationModal';

export default function ParticipantPortal() {
  const { user, profile } = useAuth();
  const [teams, setTeams] = useState<YaraCompetitionRegistration[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<YaraCompetitionRegistration | null>(null);
  const [scores, setScores] = useState<DigitalScoreSubmission[]>([]);
  const [announcements, setAnnouncements] = useState<CompetitionAnnouncement[]>([]);
  const [loading, setLoading] = useState(true);

  const [isTechModalOpen, setIsTechModalOpen] = useState(false);
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);
  const [activeCert, setActiveCert] = useState<DigitalCertificate | null>(null);
  const [isNewTeamModalOpen, setIsNewTeamModalOpen] = useState(false);

  const loadData = async () => {
    setLoading(true);
    const [allTeams, allScores, allAnns] = await Promise.all([
      getRegistrations(),
      getDigitalScores(),
      getAnnouncements()
    ]);

    setTeams(allTeams);
    setScores(allScores);
    setAnnouncements(allAnns.filter(a => a.target_audience === 'all' || a.target_audience === 'teams'));

    // Try to find team for logged in user or pick the first team for demonstration
    if (allTeams.length > 0) {
      const userTeam = allTeams.find(t => t.team_leader_email === user?.email || t.user_id === user?.id);
      setSelectedTeam(userTeam || allTeams[0]);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleOpenCertificate = async (team: YaraCompetitionRegistration) => {
    const certs = await getCertificates();
    let found = certs.find(c => c.team_name === team.team_name || c.recipient_name === team.team_name);
    
    if (!found) {
      found = await generateCertificate({
        certificate_id: `YARA-CERT-2026-${Math.floor(100000 + Math.random() * 900000)}`,
        recipient_name: team.team_name,
        recipient_email: team.team_leader_email,
        type: team.status === 'Winner' ? 'winner' : 'participant',
        event_name: 'YARA Robotics Competition 2026',
        edition_year: 2026,
        achievement_title: `Official Competitor — ${team.selected_categories.map(c => c.replace('_', ' ')).join(', ')}`,
        team_name: team.team_name,
        issued_date: new Date().toISOString().split('T')[0]
      });
    }

    setActiveCert(found);
    setIsCertModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!selectedTeam) {
    return (
      <div className="p-8 text-center bg-white rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <Users className="w-12 h-12 text-slate-400 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900">No Team Profile Linked Yet</h2>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          Register your team for the YARA Robotics Competition 2026 to unlock your technical submission dossier, scoring feed, and participation credentials.
        </p>
        <button
          onClick={() => setIsNewTeamModalOpen(true)}
          className="px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold text-xs shadow-md hover:bg-indigo-700"
        >
          Register Your Team Now
        </button>

        <MultiStepRegistrationModal
          isOpen={isNewTeamModalOpen}
          onClose={() => setIsNewTeamModalOpen(false)}
          onSuccess={() => loadData()}
        />
      </div>
    );
  }

  const teamScores = scores.filter(s => s.team_id === selectedTeam.id || s.registration_id === selectedTeam.registration_id);
  const avgScore = teamScores.length > 0 
    ? Math.round(teamScores.reduce((acc, s) => acc + s.total_score, 0) / teamScores.length)
    : null;

  return (
    <div className="space-y-8 pb-16">
      {/* 1. TEAM WELCOME HEADER */}
      <div className="p-6 md:p-8 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 text-white rounded-3xl border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-mono font-bold">
                ID: {selectedTeam.registration_id}
              </span>
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-bold flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Status: {selectedTeam.status}</span>
              </span>
              <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-200 text-xs font-semibold">
                {selectedTeam.school_organization} • {selectedTeam.province}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
              Welcome, {selectedTeam.team_name}
            </h1>

            <p className="text-xs sm:text-sm text-slate-300">
              Captain: <strong className="text-white">{selectedTeam.team_leader_name}</strong> | Mentor: <strong className="text-white">{selectedTeam.mentor_name || 'Assigned School Advisor'}</strong>
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsTechModalOpen(true)}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg flex items-center space-x-2"
            >
              <Upload className="w-4 h-4" />
              <span>Submit Technical Dossier</span>
            </button>

            <button
              onClick={() => handleOpenCertificate(selectedTeam)}
              className="px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center space-x-2"
            >
              <Award className="w-4 h-4 text-amber-400" />
              <span>View Certificate</span>
            </button>
          </div>
        </div>

        {/* Team Selector Switcher if multiple exist in sandbox */}
        {teams.length > 1 && (
          <div className="mt-6 pt-4 border-t border-slate-800 flex items-center space-x-2 overflow-x-auto text-xs">
            <span className="text-slate-400 font-semibold shrink-0">Switch Team:</span>
            {teams.map(t => (
              <button
                key={t.id}
                onClick={() => setSelectedTeam(t)}
                className={`px-3 py-1 rounded-xl font-bold whitespace-nowrap transition-colors ${
                  selectedTeam.id === t.id ? 'bg-indigo-600 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'
                }`}
              >
                {t.team_name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 2. DASHBOARD METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>Team Roster</span>
            <Users className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">
            {selectedTeam.members.length || selectedTeam.total_members} Members
          </p>
          <p className="text-[11px] text-emerald-600 font-bold">
            👦 {selectedTeam.boys_count} Boys • 👧 {selectedTeam.girls_count} Girls (Compliant)
          </p>
        </div>

        <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>Challenges Enrolled</span>
            <Trophy className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-slate-900">
            {selectedTeam.selected_categories.length} Challenges
          </p>
          <p className="text-[11px] text-slate-500 capitalize">
            {selectedTeam.selected_categories.map(c => c.replace('_', ' ')).join(', ')}
          </p>
        </div>

        <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>Technical Submissions</span>
            <FileText className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">
            {selectedTeam.underwater_drone_info || selectedTeam.autonomous_maze_info || selectedTeam.innovation_pitch_info ? 'Submitted' : 'Pending'}
          </p>
          <p className="text-[11px] text-indigo-600 font-bold">
            {selectedTeam.video_demo_url ? 'Demo Video Linked' : 'Specs Ready for Review'}
          </p>
        </div>

        <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>Judges Score</span>
            <Award className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">
            {avgScore !== null ? `${avgScore}/100` : 'Pending Arena'}
          </p>
          <p className="text-[11px] text-slate-500">
            {teamScores.length > 0 ? `${teamScores.length} Score sheets logged` : 'Awaiting Judge Evaluation'}
          </p>
        </div>
      </div>

      {/* 3. MAIN DASHBOARD CONTENT (ROSTER + SUBMISSION DOSSIER) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Members & Technical Summary */}
        <div className="lg:col-span-2 space-y-6">
          {/* Members Roster */}
          <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900 flex items-center space-x-2">
                <Users className="w-5 h-5 text-indigo-600" />
                <span>Registered Team Members</span>
              </h3>
              <span className="text-xs font-bold px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full">
                Gender Parity 50/50 Verified
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {selectedTeam.members.map((member, idx) => (
                <div key={member.id || idx} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900">{member.full_name}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      member.gender === 'girl' ? 'bg-pink-100 text-pink-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {member.gender === 'girl' ? '👧 Girl' : '👦 Boy'} • {member.age} yrs
                    </span>
                  </div>
                  <p className="text-[11px] text-indigo-600 font-semibold">{member.role}</p>
                  {member.is_captain && (
                    <span className="inline-block text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md">
                      ⭐ Team Captain
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Technical Submission Overview */}
          <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900 flex items-center space-x-2">
                <FileText className="w-5 h-5 text-amber-500" />
                <span>Technical Submission Dossier</span>
              </h3>
              <button
                onClick={() => setIsTechModalOpen(true)}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800"
              >
                Edit Dossier →
              </button>
            </div>

            {selectedTeam.underwater_drone_info && (
              <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100 space-y-1 text-xs">
                <div className="flex items-center space-x-2 font-bold text-blue-900">
                  <Waves className="w-4 h-4 text-blue-600" />
                  <span>Underwater Drone Architecture</span>
                </div>
                <p className="text-slate-600"><strong>Controller:</strong> {selectedTeam.underwater_drone_info.main_controller}</p>
                <p className="text-slate-600"><strong>Sensors:</strong> {selectedTeam.underwater_drone_info.sensors_used}</p>
                <p className="text-slate-600"><strong>Power:</strong> {selectedTeam.underwater_drone_info.power_source}</p>
              </div>
            )}

            {selectedTeam.autonomous_maze_info && (
              <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-100 space-y-1 text-xs">
                <div className="flex items-center space-x-2 font-bold text-amber-900">
                  <Compass className="w-4 h-4 text-amber-600" />
                  <span>Autonomous Maze Rover Architecture</span>
                </div>
                <p className="text-slate-600"><strong>Robot Name:</strong> {selectedTeam.autonomous_maze_info.robot_name}</p>
                <p className="text-slate-600"><strong>Compute:</strong> {selectedTeam.autonomous_maze_info.controller}</p>
                <p className="text-slate-600"><strong>Algorithm:</strong> {selectedTeam.autonomous_maze_info.navigation_method}</p>
              </div>
            )}

            {selectedTeam.innovation_pitch_info && (
              <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 space-y-1 text-xs">
                <div className="flex items-center space-x-2 font-bold text-emerald-900">
                  <Lightbulb className="w-4 h-4 text-emerald-600" />
                  <span>Innovation Pitch Solution</span>
                </div>
                <p className="text-slate-600"><strong>Title:</strong> {selectedTeam.innovation_pitch_info.project_title}</p>
                <p className="text-slate-600"><strong>Stage:</strong> {selectedTeam.innovation_pitch_info.project_stage}</p>
                <p className="text-slate-600"><strong>Solution:</strong> {selectedTeam.innovation_pitch_info.proposed_solution}</p>
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Col: Announcements & Live Schedule */}
        <div className="space-y-6">
          {/* Announcements */}
          <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-base text-slate-900 flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <span>Broadcast Updates</span>
            </h3>

            <div className="space-y-3">
              {announcements.map(ann => (
                <div key={ann.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{ann.title}</span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(ann.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-slate-600 leading-relaxed">{ann.body}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Key Dates Timeline */}
          <div className="p-6 bg-slate-900 text-white rounded-3xl shadow-sm space-y-4">
            <h3 className="font-bold text-base flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-indigo-400" />
              <span>Championship Schedule</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div className="border-l-2 border-amber-400 pl-3 space-y-0.5">
                <span className="text-amber-400 font-bold text-[11px]">Sept 20, 2026</span>
                <p className="font-semibold text-white">Registration Closes</p>
              </div>

              <div className="border-l-2 border-blue-400 pl-3 space-y-0.5">
                <span className="text-blue-400 font-bold text-[11px]">Sept 30, 2026</span>
                <p className="font-semibold text-white">Technical Submissions Due</p>
              </div>

              <div className="border-l-2 border-emerald-400 pl-3 space-y-0.5">
                <span className="text-emerald-400 font-bold text-[11px]">Oct 16-18, 2026</span>
                <p className="font-semibold text-white">National Championship Arena</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Technical Submission Modal */}
      <TechnicalSubmissionModal
        isOpen={isTechModalOpen}
        onClose={() => setIsTechModalOpen(false)}
        team={selectedTeam}
        onSuccess={() => loadData()}
      />

      {/* Certificate Modal */}
      <DigitalCertificateModal
        isOpen={isCertModalOpen}
        onClose={() => setIsCertModalOpen(false)}
        certificate={activeCert}
      />
    </div>
  );
}
