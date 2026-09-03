import React from 'react';
import { 
  FolderGit2, 
  Award, 
  BookOpen, 
  Lightbulb, 
  Cpu, 
  Bot, 
  CheckCircle, 
  ExternalLink,
  Printer,
  Zap,
  Layers,
  ArrowRight
} from 'lucide-react';
import { LearnerPortfolio } from '../../types/yaraLms';

interface Props {
  portfolio: LearnerPortfolio;
  onOpenCapstone: () => void;
}

export const YaraLmsPortfolioView: React.FC<Props> = ({ portfolio, onOpenCapstone }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-2xl">
        <div className="absolute -right-16 -bottom-16 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-2">
              <Zap size={14} /> Automated Innovation Portfolio
            </div>
            <h1 className="text-2xl sm:text-3xl font-black">{portfolio.studentName}'s Robotics Portfolio</h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Curated evidence of research, 5 Whys problem discovery, circuits, code repositories, and physical builds.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl border border-slate-700 flex items-center gap-2 transition"
            >
              <Printer size={14} /> Print / Export PDF
            </button>
          </div>
        </div>

        {/* Badges Grid */}
        <div className="mt-6 pt-6 border-t border-slate-800 flex flex-wrap gap-2">
          {portfolio.badgesUnlocked.map((badge, idx) => (
            <span
              key={idx}
              className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold text-slate-200 flex items-center gap-1.5"
            >
              {badge}
            </span>
          ))}
        </div>
      </div>

      {/* Grid of Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 1. Problem Statements & 5 Whys */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Lightbulb size={18} className="text-amber-400" /> Problem Discovery & 5 Whys
            </h3>
            <span className="text-xs text-slate-400">{portfolio.problemStatements.length} Logged</span>
          </div>

          {portfolio.problemStatements.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-500">
              No problem discovery logs recorded yet. Complete Session S29.
            </div>
          ) : (
            <div className="space-y-3">
              {portfolio.problemStatements.map((ps, i) => (
                <div key={i} className="bg-slate-950 border border-slate-800/80 rounded-2xl p-4 space-y-2">
                  <div className="text-xs font-bold text-white">{ps.problem}</div>
                  <div className="text-[11px] text-slate-400">
                    <span className="font-semibold text-emerald-400">Root Causes:</span> {ps.rootCauses.join(', ')}
                  </div>
                  <div className="text-[11px] text-slate-300 font-medium italic">
                    "{ps.hmwQuestion}"
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 2. Research & Stakeholder Insights */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <BookOpen size={18} className="text-blue-400" /> Field Research & Dossiers
            </h3>
            <span className="text-xs text-slate-400">{portfolio.researchNotes.length} Entries</span>
          </div>

          {portfolio.researchNotes.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-500">
              No research dossiers submitted yet. Complete Sessions S28–S31.
            </div>
          ) : (
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
              {portfolio.researchNotes.map((rn, i) => (
                <div key={i} className="bg-slate-950 border border-slate-800/80 rounded-2xl p-4 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-emerald-400">{rn.sessionId}</span>
                    <span className="text-[10px] text-slate-500">{new Date(rn.date).toLocaleDateString()}</span>
                  </div>
                  <div className="text-xs font-semibold text-white">{rn.title}</div>
                  <p className="text-xs text-slate-400 line-clamp-3">{rn.notes}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 3. Circuits & Simulations */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Cpu size={18} className="text-purple-400" /> Circuit Designs & Simulations
            </h3>
            <span className="text-xs text-slate-400">{portfolio.circuitDesigns.length} Circuits</span>
          </div>

          {portfolio.circuitDesigns.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-500">
              No circuit simulations recorded yet. Submit links in Levels 1–3 mini-projects.
            </div>
          ) : (
            <div className="space-y-2.5">
              {portfolio.circuitDesigns.map((cd, i) => (
                <div key={i} className="bg-slate-950 border border-slate-800/80 rounded-2xl p-3.5 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-white">{cd.title}</div>
                    <div className="text-[11px] text-slate-400">{cd.platform}</div>
                  </div>
                  <a
                    href={cd.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-slate-900 hover:bg-slate-800 rounded-xl text-emerald-400 transition"
                  >
                    <ExternalLink size={14} />
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 4. Physical Robot Hardware Builds */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Bot size={18} className="text-emerald-400" /> Physical Robot Builds
            </h3>
            <span className="text-xs text-slate-400">{portfolio.hardwareBuilds.length} Builds</span>
          </div>

          {portfolio.hardwareBuilds.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-500">
              No physical robot builds logged yet. Complete Level 4 & 5 physical labs.
            </div>
          ) : (
            <div className="space-y-2.5">
              {portfolio.hardwareBuilds.map((hb, i) => (
                <div key={i} className="bg-slate-950 border border-slate-800/80 rounded-2xl p-3.5 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-white">{hb.title}</div>
                    <div className="text-[11px] text-slate-400">{hb.description}</div>
                  </div>
                  <a
                    href={hb.photoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-slate-900 hover:bg-slate-800 rounded-xl text-emerald-400 transition"
                  >
                    <ExternalLink size={14} />
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Capstone Showcase Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Capstone Graduation Project</span>
            <h2 className="text-xl font-bold text-white mt-1">
              {portfolio.capstone ? portfolio.capstone.title : 'Compulsory Innovation Capstone (P04 & P05)'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
              {portfolio.capstone
                ? portfolio.capstone.problemStatement
                : 'Solve an authentic African challenge in Agriculture, Clean Water, Healthcare, or Energy to complete your graduation portfolio.'}
            </p>
          </div>

          <div>
            {portfolio.capstone ? (
              <div className="text-right">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${portfolio.capstone.status === 'approved' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'}`}>
                  Status: {portfolio.capstone.status.toUpperCase()}
                </span>
                {portfolio.capstone.totalScorePercentage && (
                  <div className="text-sm font-bold text-emerald-400 mt-1">
                    Score: {portfolio.capstone.totalScorePercentage}%
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenCapstone}
                className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-xl transition flex items-center gap-2 shadow-lg"
              >
                Submit Capstone Package <ArrowRight size={14} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
