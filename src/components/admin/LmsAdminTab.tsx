import React, { useState, useEffect } from 'react';
import { 
  Bot, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  ExternalLink, 
  Award, 
  Sliders, 
  Video, 
  FileText, 
  Save, 
  Layers, 
  Sparkles,
  Users,
  Search
} from 'lucide-react';
import { CapstoneProjectSubmission } from '../../types/yaraLms';
import { getAllCapstoneSubmissions, reviewCapstoneSubmission } from '../../services/yaraLmsService';

interface Props {
  adminUserId: string;
}

const RUBRIC_CRITERIA = [
  { key: 'problemSignificance', label: '1. Problem Significance & 5 Whys Depth', max: 10 },
  { key: 'hardwareCircuitDesign', label: '2. Electrical Circuit & Power Design', max: 10 },
  { key: 'firmwareArchitecture', label: '3. Firmware Algorithms & Code Quality', max: 10 },
  { key: 'mechanicalExecution', label: '4. Mechanical Design & CoG Stability', max: 10 },
  { key: 'prototypeVideoQuality', label: '5. Working Prototype Demonstration', max: 10 },
  { key: 'technicalReportQuality', label: '6. 21-Point Technical Report Rigor', max: 10 },
  { key: 'pitchPresentationQuality', label: '7. 90-Second Innovation Pitch', max: 10 },
  { key: 'economicFeasibility', label: '8. Unit Economics & BOM Optimization', max: 10 },
  { key: 'socialImpactInAfrica', label: '9. African Community Societal Impact', max: 10 },
  { key: 'stressTestingVerification', label: '10. Experimental Testing & Data', max: 10 },
  { key: 'innovationNovelty', label: '11. Innovation Novelty & Creativity', max: 10 },
  { key: 'defenseReadiness', label: '12. Project Defense Readiness', max: 10 }
];

export const LmsAdminTab: React.FC<Props> = ({ adminUserId }) => {
  const [submissions, setSubmissions] = useState<CapstoneProjectSubmission[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<CapstoneProjectSubmission | null>(null);
  const [rubricScores, setRubricScores] = useState<Record<string, number>>({});
  const [feedback, setFeedback] = useState('');
  const [reviewStatus, setReviewStatus] = useState<'approved' | 'revision_requested' | 'rejected'>('approved');
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadSubmissions();
  }, []);

  const loadSubmissions = () => {
    const list = getAllCapstoneSubmissions();
    setSubmissions(list);
  };

  const handleSelectSubmission = (sub: CapstoneProjectSubmission) => {
    setSelectedSubmission(sub);
    setReviewStatus(sub.status === 'approved' ? 'approved' : 'approved');
    setFeedback(sub.instructorFeedback || '');

    const initialScores: Record<string, number> = {};
    RUBRIC_CRITERIA.forEach(c => {
      initialScores[c.key] = sub.rubricScores?.[c.key as keyof typeof sub.rubricScores] || 8;
    });
    setRubricScores(initialScores);
  };

  const calculateTotalScore = () => {
    const total = (Object.values(rubricScores) as number[]).reduce((a: number, b: number) => a + (Number(b) || 0), 0);
    return Math.round((total / 120) * 100);
  };

  const handleSaveReview = async () => {
    if (!selectedSubmission) return;
    setSaving(true);
    try {
      await reviewCapstoneSubmission(
        selectedSubmission.id,
        reviewStatus,
        rubricScores as any,
        feedback,
        adminUserId
      );
      loadSubmissions();
      setSelectedSubmission(null);
    } catch (e) {
      console.error('Review error:', e);
    } finally {
      setSaving(false);
    }
  };

  const filtered = submissions.filter(s => 
    s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.thematicArea.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Faculty Evaluation Directorate</span>
          <h2 className="text-xl sm:text-2xl font-black text-white mt-1">YARA LMS & Capstone Project Reviews</h2>
          <p className="text-xs text-slate-400 mt-1">
            Grade Capstone project submissions across the 12-criterion rubric, issue instructor feedback, and certify graduates.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search submissions..."
              className="bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* Submissions List & Grading Pane */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Submissions Queue */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center justify-between">
            <span>Submitted Projects</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
              {filtered.length} total
            </span>
          </h3>

          {filtered.length === 0 ? (
            <div className="text-center py-12 text-xs text-slate-500">
              No capstone submissions currently in queue.
            </div>
          ) : (
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
              {filtered.map(sub => (
                <button
                  key={sub.id}
                  onClick={() => handleSelectSubmission(sub)}
                  className={`w-full text-left p-4 rounded-2xl border transition ${
                    selectedSubmission?.id === sub.id
                      ? 'bg-slate-950 border-emerald-500 shadow-md shadow-emerald-500/10'
                      : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-950 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                      {sub.thematicArea}
                    </span>
                    <span className={`text-[10px] font-bold ${sub.status === 'approved' ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {sub.status.toUpperCase()}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-white line-clamp-1">{sub.title}</h4>
                  <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
                    <span>{sub.studentName}</span>
                    <span>{new Date(sub.submittedAt).toLocaleDateString()}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right column: Interactive Rubric Evaluation Form */}
        <div className="lg:col-span-2">
          {selectedSubmission ? (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 text-white">
              {/* Submission Header */}
              <div className="border-b border-slate-800 pb-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                    {selectedSubmission.thematicArea} • Student: {selectedSubmission.studentName}
                  </span>
                  <span className="text-xs text-slate-500">ID: {selectedSubmission.id}</span>
                </div>
                <h2 className="text-xl font-bold mt-1">{selectedSubmission.title}</h2>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">{selectedSubmission.problemStatement}</p>

                {/* Deliverables Links */}
                <div className="flex items-center gap-2 flex-wrap mt-4">
                  {selectedSubmission.prototypeVideoUrl && (
                    <a
                      href={selectedSubmission.prototypeVideoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-emerald-400 flex items-center gap-1.5 transition"
                    >
                      <Video size={14} /> Prototype Video <ExternalLink size={10} />
                    </a>
                  )}
                  {selectedSubmission.pitchVideoUrl && (
                    <a
                      href={selectedSubmission.pitchVideoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-amber-400 flex items-center gap-1.5 transition"
                    >
                      <Video size={14} /> 90s Pitch <ExternalLink size={10} />
                    </a>
                  )}
                  {selectedSubmission.technicalReportPdfUrl && (
                    <a
                      href={selectedSubmission.technicalReportPdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-blue-400 flex items-center gap-1.5 transition"
                    >
                      <FileText size={14} /> 21-Point Report <ExternalLink size={10} />
                    </a>
                  )}
                  {selectedSubmission.softwareRepoUrl && (
                    <a
                      href={selectedSubmission.softwareRepoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-purple-400 flex items-center gap-1.5 transition"
                    >
                      <Layers size={14} /> Source Repo <ExternalLink size={10} />
                    </a>
                  )}
                </div>
              </div>

              {/* 12-Criterion Rubric */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Sliders size={16} className="text-emerald-400" /> 12-Criterion Grading Rubric (120 Points Max)
                  </h3>
                  <div className="text-right">
                    <span className="text-xs text-slate-400">Total Rubric Score: </span>
                    <span className="text-base font-black text-emerald-400">{calculateTotalScore()}%</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {RUBRIC_CRITERIA.map(crit => (
                    <div key={crit.key} className="bg-slate-950 border border-slate-800 rounded-2xl p-3.5 space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                        <span className="truncate pr-2">{crit.label}</span>
                        <span className="text-emerald-400 font-bold font-mono">{rubricScores[crit.key] || 0}/10</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="10"
                        step="1"
                        value={rubricScores[crit.key] || 0}
                        onChange={e => setRubricScores(prev => ({ ...prev, [crit.key]: Number(e.target.value) }))}
                        className="w-full accent-emerald-500"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Feedback & Verdict */}
              <div className="space-y-4 pt-4 border-t border-slate-800">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Instructor Evaluation Notes & Feedback
                  </label>
                  <textarea
                    value={feedback}
                    onChange={e => setFeedback(e.target.value)}
                    placeholder="Provide constructive feedback on mechanical integrity, code efficiency, or presentation..."
                    rows={3}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setReviewStatus('approved')}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                        reviewStatus === 'approved'
                          ? 'bg-emerald-500 text-slate-950 font-black'
                          : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <CheckCircle size={14} /> Approve Capstone (≥75%)
                    </button>
                    <button
                      type="button"
                      onClick={() => setReviewStatus('revision_requested')}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                        reviewStatus === 'revision_requested'
                          ? 'bg-amber-500 text-slate-950 font-black'
                          : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <AlertTriangle size={14} /> Request Revision
                    </button>
                  </div>

                  <button
                    onClick={handleSaveReview}
                    disabled={saving}
                    className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-xl shadow-lg transition flex items-center justify-center gap-2"
                  >
                    <Save size={14} /> {saving ? 'Saving...' : 'Save & Issue Evaluation'}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center text-slate-500 text-xs">
              Select a student submission on the left to begin rubric evaluation.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
