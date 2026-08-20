import React, { useState } from 'react';
import { X, UploadCloud, CheckCircle, AlertTriangle, Layers, Video, FileText, Cpu, Check } from 'lucide-react';
import { CapstoneThematicArea } from '../../types/yaraLms';
import { submitCapstoneProject } from '../../services/yaraLmsService';

interface Props {
  userId: string;
  studentName: string;
  isOpen: boolean;
  onClose: () => void;
  onSubmitted: () => void;
}

const THEMATIC_AREAS: { id: CapstoneThematicArea; label: string; icon: string }[] = [
  { id: 'agriculture', label: 'Agriculture & Food Security', icon: '🌾' },
  { id: 'water', label: 'Clean Water & Sanitation', icon: '💧' },
  { id: 'healthcare', label: 'Healthcare & Medical Delivery', icon: '🏥' },
  { id: 'energy', label: 'Clean Energy & Power', icon: '⚡' },
  { id: 'environment', label: 'Environment & Climate Resilience', icon: '🌱' },
  { id: 'accessibility', label: 'Accessibility & Assistive Tech', icon: '♿' },
  { id: 'education', label: 'Education & STEM Access', icon: '📚' },
  { id: 'safety', label: 'Public Safety & Disaster Response', icon: '🛡️' },
  { id: 'transport', label: 'Transport & Logistics', icon: '🚚' },
  { id: 'community', label: 'Community Development', icon: '🏘️' },
  { id: 'empowerment', label: 'Youth Empowerment & Inclusion', icon: '🚀' }
];

export const YaraLmsCapstoneSubmissionModal: React.FC<Props> = ({
  userId,
  studentName,
  isOpen,
  onClose,
  onSubmitted
}) => {
  const [thematicArea, setThematicArea] = useState<CapstoneThematicArea>('agriculture');
  const [title, setTitle] = useState('');
  const [problemStatement, setProblemStatement] = useState('');
  const [researchSummary, setResearchSummary] = useState('');
  const [quantitativeRequirements, setQuantitativeRequirements] = useState('');
  const [prototypeVideoUrl, setPrototypeVideoUrl] = useState('');
  const [pitchVideoUrl, setPitchVideoUrl] = useState('');
  const [technicalReportPdfUrl, setTechnicalReportPdfUrl] = useState('');
  const [circuitDiagramUrl, setCircuitDiagramUrl] = useState('');
  const [softwareRepoUrl, setSoftwareRepoUrl] = useState('');
  const [bomCostUsd, setBomCostUsd] = useState(35);
  const [submitting, setSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await submitCapstoneProject({
        userId,
        studentName,
        thematicArea,
        title,
        problemStatement,
        researchSummary,
        quantitativeRequirements: quantitativeRequirements.split('\n').filter(Boolean),
        prototypeVideoUrl,
        pitchVideoUrl,
        technicalReportPdfUrl,
        circuitDiagramUrl,
        softwareRepoUrl,
        bomCostUsd: Number(bomCostUsd) || 35
      });

      setSubmittedSuccess(true);
      setTimeout(() => {
        onSubmitted();
        onClose();
      }, 2500);
    } catch (err) {
      console.error('Capstone submit error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 text-white shadow-2xl relative my-8">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white transition"
        >
          <X size={18} />
        </button>

        <div className="mb-6">
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Compulsory Graduation Requirement</span>
          <h2 className="text-2xl font-black mt-1">YARA Innovation Capstone Project (P04)</h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Submit your complete 21-point engineering report, working prototype demonstration video, 90-second innovation pitch, and open-source repo.
          </p>
        </div>

        {submittedSuccess ? (
          <div className="py-12 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle size={36} />
            </div>
            <h3 className="text-xl font-bold">Capstone Submitted Successfully!</h3>
            <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
              Your submission has been dispatched to the YARA Engineering Faculty Review Board. You will receive rubric grading and defense scheduling shortly.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Thematic Area */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                1. Select Thematic Societal Domain *
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {THEMATIC_AREAS.map(area => (
                  <button
                    key={area.id}
                    type="button"
                    onClick={() => setThematicArea(area.id)}
                    className={`p-2.5 rounded-xl border text-left text-xs transition flex items-center gap-2 ${
                      thematicArea === area.id
                        ? 'bg-emerald-950/50 border-emerald-500 text-emerald-300 font-bold'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <span>{area.icon}</span>
                    <span className="truncate">{area.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                2. Project Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Solar-Powered Autonomous Weed Detection & Removal Agricultural Rover"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500"
                required
              />
            </div>

            {/* Problem Statement */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                3. Problem Statement & 5 Whys Root Cause *
              </label>
              <textarea
                value={problemStatement}
                onChange={e => setProblemStatement(e.target.value)}
                placeholder="Detail who suffers, the quantified financial/human cost, and the systemic root cause discovered..."
                rows={3}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500"
                required
              />
            </div>

            {/* Quantitative Requirements */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                4. Quantitative Engineering Requirements (One per line) *
              </label>
              <textarea
                value={quantitativeRequirements}
                onChange={e => setQuantitativeRequirements(e.target.value)}
                placeholder="e.g.&#10;Battery runtime >= 3.5 hours on single solar charge&#10;Obstacle avoidance detection within 25cm at 0.4 m/s&#10;Total BOM cost <= $40"
                rows={3}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                required
              />
            </div>

            {/* Videos Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Video size={14} className="text-emerald-400" /> 5. Prototype Demonstration Video URL *
                </label>
                <input
                  type="url"
                  value={prototypeVideoUrl}
                  onChange={e => setPrototypeVideoUrl(e.target.value)}
                  placeholder="https://youtube.com/watch?v=... or Google Drive"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Video size={14} className="text-amber-400" /> 6. 90-Second Innovation Pitch Video URL *
                </label>
                <input
                  type="url"
                  value={pitchVideoUrl}
                  onChange={e => setPitchVideoUrl(e.target.value)}
                  placeholder="https://youtube.com/watch?v=... or Loom"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>
            </div>

            {/* 21-point Report & Repo Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <FileText size={14} className="text-blue-400" /> 7. 21-Point Report (PDF URL) *
                </label>
                <input
                  type="url"
                  value={technicalReportPdfUrl}
                  onChange={e => setTechnicalReportPdfUrl(e.target.value)}
                  placeholder="https://drive.google.com/..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Cpu size={14} className="text-purple-400" /> 8. Schematic / CAD URL
                </label>
                <input
                  type="url"
                  value={circuitDiagramUrl}
                  onChange={e => setCircuitDiagramUrl(e.target.value)}
                  placeholder="Tinkercad / EasyEDA URL"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Layers size={14} className="text-emerald-400" /> 9. Source Code Repo URL
                </label>
                <input
                  type="url"
                  value={softwareRepoUrl}
                  onChange={e => setSoftwareRepoUrl(e.target.value)}
                  placeholder="https://github.com/..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between border-t border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-xl shadow-lg transition flex items-center gap-2"
              >
                <UploadCloud size={16} /> {submitting ? 'Submitting Capstone...' : 'Submit Final Capstone Package'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
