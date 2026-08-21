import React, { useState } from 'react';
import { 
  FolderGit2, 
  Sparkles, 
  Lightbulb, 
  Layers, 
  Cpu, 
  Bot, 
  CheckCircle2, 
  ExternalLink, 
  Printer, 
  ArrowRight,
  FileText,
  UploadCloud,
  Award
} from 'lucide-react';
import { LearnerPortfolio, CapstoneProjectSubmission } from '../../../types/yaraLms';

interface Props {
  portfolio: LearnerPortfolio;
  capstoneSubmission: CapstoneProjectSubmission | null;
  onOpenCapstoneModal: () => void;
  onOpenSession: (sessionId: string) => void;
}

export const ProjectsTab: React.FC<Props> = ({
  portfolio,
  capstoneSubmission,
  onOpenCapstoneModal,
  onOpenSession
}) => {
  const [selectedTheme, setSelectedTheme] = useState<string>('all');

  const thematicAreas = [
    'Agriculture',
    'Water',
    'Education',
    'Environment',
    'Accessibility',
    'Healthcare',
    'Energy',
    'Safety',
    'Transport',
    'Community Development',
    'Youth Empowerment'
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* 1. Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
              <FolderGit2 className="w-3.5 h-3.5" /> Innovation Portfolio & Capstone
            </div>
            <h1 className="text-2xl sm:text-3xl font-black">
              {portfolio.studentName}'s Robotics Innovation Portfolio
            </h1>
            <p className="text-xs sm:text-sm text-slate-300">
              Curated repository of community research, 5 Whys discovery, breadboard circuits, ESP32 IoT telemetry, obstacle rovers, and your 21-point Capstone project.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => window.print()}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 flex items-center gap-2 transition"
            >
              <Printer className="w-4 h-4" /> Print Portfolio
            </button>
            <button
              onClick={onOpenCapstoneModal}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded-xl flex items-center gap-2 transition shadow-lg shadow-emerald-600/20"
            >
              <Sparkles className="w-4 h-4" />
              <span>{capstoneSubmission ? 'Edit Capstone (P04)' : 'Submit Capstone Project (P04)'}</span>
            </button>
          </div>
        </div>

        {/* Unlocked Badges Bar */}
        <div className="mt-6 pt-6 border-t border-slate-800 flex flex-wrap gap-2">
          {(portfolio.badgesUnlocked || []).map((badge, idx) => (
            <span
              key={idx}
              className="px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-bold text-slate-200 flex items-center gap-1.5"
            >
              <Award className="w-3.5 h-3.5 text-emerald-400" />
              {badge}
            </span>
          ))}
        </div>
      </div>

      {/* 2. Capstone Submission Status Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600">
              P04 • Compulsory Capstone Innovation Project
            </span>
            <h2 className="text-xl font-black text-slate-900 mt-0.5">
              {capstoneSubmission ? capstoneSubmission.title : 'No Capstone Project Submitted Yet'}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {capstoneSubmission
                ? `Thematic Focus: ${capstoneSubmission.thematicArea} • Status: ${capstoneSubmission.status.toUpperCase()}`
                : 'Formulate an authentic community challenge and build a complete physical robotics prototype backed by 21-point engineering documentation.'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {capstoneSubmission ? (
              <span className={`px-3 py-1.5 rounded-full text-xs font-bold capitalize ${
                capstoneSubmission.status === 'approved'
                  ? 'bg-emerald-100 text-emerald-800'
                  : capstoneSubmission.status === 'revision_requested'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-indigo-100 text-indigo-800'
              }`}>
                Status: {capstoneSubmission.status.replace('_', ' ')}
              </span>
            ) : null}
            <button
              onClick={onOpenCapstoneModal}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition"
            >
              {capstoneSubmission ? 'View / Update 21-Point Specs' : 'Open 21-Point Submission Form'}
            </button>
          </div>
        </div>

        {capstoneSubmission && (
          <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <strong className="text-slate-900 block font-bold mb-1">Problem & 5 Whys Root Cause:</strong>
              <p className="text-slate-600 line-clamp-3">{capstoneSubmission.problemDiscovery || 'Logged in submission.'}</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <strong className="text-slate-900 block font-bold mb-1">Engineering Solution:</strong>
              <p className="text-slate-600 line-clamp-3">{capstoneSubmission.solutionSummary}</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <strong className="text-slate-900 block font-bold mb-1">Instructor Review / Feedback:</strong>
              <p className="text-slate-600 line-clamp-3">{capstoneSubmission.instructorFeedback || 'Awaiting formal faculty review.'}</p>
              {capstoneSubmission.finalScore && (
                <div className="mt-2 text-xs font-black text-emerald-600">
                  Rubric Score: {capstoneSubmission.finalScore}%
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 3. Portfolio Sections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* A. 5 Whys & Problem Discovery */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              <span>Problem Discovery & 5 Whys (S29)</span>
            </h3>
            <span className="text-xs text-slate-400 font-bold">{(portfolio.problemStatements || []).length} Logged</span>
          </div>

          {(portfolio.problemStatements || []).length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400 space-y-2">
              <p>No 5 Whys problem logs recorded yet.</p>
              <button
                onClick={() => onOpenSession('S29')}
                className="text-xs font-bold text-emerald-600 hover:text-emerald-700"
              >
                Complete Session S29 →
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {(portfolio.problemStatements || []).map((item, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <div className="text-xs font-bold text-slate-900">{item.problem}</div>
                  {item.rootCauses && item.rootCauses.length > 0 && (
                    <div className="text-[11px] text-slate-600">
                      <span className="font-semibold text-emerald-600">Root Causes:</span> {item.rootCauses.join(' → ')}
                    </div>
                  )}
                  {item.hmwQuestion && (
                    <div className="text-[11px] text-slate-700 italic font-medium">"{item.hmwQuestion}"</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* B. Research & Field Data */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-500" />
              <span>Applied Community Research (S28)</span>
            </h3>
            <span className="text-xs text-slate-400 font-bold">{(portfolio.researchNotes || []).length} Logged</span>
          </div>

          {(portfolio.researchNotes || []).length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400 space-y-2">
              <p>No community field notes logged yet.</p>
              <button
                onClick={() => onOpenSession('S28')}
                className="text-xs font-bold text-emerald-600 hover:text-emerald-700"
              >
                Complete Session S28 →
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {(portfolio.researchNotes || []).map((item, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="text-xs font-bold text-slate-900">{item.title}</div>
                  <p className="text-[11px] text-slate-700 mt-1 whitespace-pre-wrap">{item.notes}</p>
                  {item.date && (
                    <div className="text-[10px] text-slate-400 mt-1">Logged: {new Date(item.date).toLocaleDateString()}</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* C. Physical Circuits & Schematics */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-blue-500" />
              <span>Circuit Schematics & Hardware Builds</span>
            </h3>
            <span className="text-xs text-slate-400 font-bold">
              {((portfolio.circuitDesigns || []).length + (portfolio.hardwareBuilds || []).length)} Logged
            </span>
          </div>

          {((portfolio.circuitDesigns || []).length === 0 && (portfolio.hardwareBuilds || []).length === 0) ? (
            <div className="py-8 text-center text-xs text-slate-400 space-y-2">
              <p>No circuit schematics or hardware builds logged yet.</p>
              <button
                onClick={() => onOpenSession('S04')}
                className="text-xs font-bold text-emerald-600 hover:text-emerald-700"
              >
                Complete Session S04 / P01 →
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {(portfolio.circuitDesigns || []).map((item, idx) => (
                <div key={`circ_${idx}`} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">{item.title}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-semibold">{item.platform}</span>
                  </div>
                  {item.url && (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] font-bold text-emerald-600 flex items-center gap-1 mt-1 hover:underline"
                    >
                      View Schematic <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              ))}
              {(portfolio.hardwareBuilds || []).map((item, idx) => (
                <div key={`hw_${idx}`} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="text-xs font-bold text-slate-900">{item.title}</div>
                  <p className="text-[11px] text-slate-600">{item.description}</p>
                  {item.photoUrl && (
                    <a
                      href={item.photoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] font-bold text-emerald-600 flex items-center gap-1 mt-1 hover:underline"
                    >
                      View Build Asset <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* D. Code Repositories & Firmware */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
              <Bot className="w-4 h-4 text-emerald-500" />
              <span>Firmware Repositories & Code Deliverables</span>
            </h3>
            <span className="text-xs text-slate-400 font-bold">{(portfolio.codeRepositories || []).length} Logged</span>
          </div>

          {(portfolio.codeRepositories || []).length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400 space-y-2">
              <p>No firmware repositories logged yet.</p>
              <button
                onClick={() => onOpenSession('S13')}
                className="text-xs font-bold text-emerald-600 hover:text-emerald-700"
              >
                Complete Session S13 / S21 →
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {(portfolio.codeRepositories || []).map((item, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">{item.title}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 font-mono text-slate-700">{item.language}</span>
                  </div>
                  {item.url && (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] font-bold text-emerald-600 flex items-center gap-1 mt-1 hover:underline"
                    >
                      View Code Deliverable <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
