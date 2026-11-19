import React, { useState } from 'react';
import { 
  Lock, Key, Search, ArrowRight, ShieldCheck, 
  Clock, AlertCircle, CheckCircle2, MessageSquare, 
  Send, User, Shield, HelpCircle
} from 'lucide-react';
import EmergencyHelpBanner from '../../components/safeguarding/EmergencyHelpBanner';
import SafeguardingNav from '../../components/safeguarding/SafeguardingNav';
import { 
  lookupReportByCredentials, 
  sendReporterFollowupMessage, 
  TrackingResult 
} from '../../services/safeguardingService';
import { SafeguardingReportStatus } from '../../types/safeguarding';

const STATUS_STEPS: { id: SafeguardingReportStatus; label: string; desc: string }[] = [
  { id: 'received', label: 'Received', desc: 'Logged securely in the YARA Safeguarding Vault.' },
  { id: 'awaiting_assessment', label: 'Awaiting Assessment', desc: 'Queued for immediate child safety and risk evaluation.' },
  { id: 'under_review', label: 'Under Review', desc: 'Active inquiry underway by designated safeguarding personnel.' },
  { id: 'action_in_progress', label: 'Action in Progress', desc: 'Precautionary safeguards or institutional interventions implemented.' },
  { id: 'referred', label: 'Referred to Support Partner', desc: 'Referred to statutory child protection / GBV support authorities.' },
  { id: 'closed', label: 'Case Closed', desc: 'Inquiry finalized and protective/disciplinary actions implemented.' }
];

export default function ReportTrackingPage() {
  const [caseNumber, setCaseNumber] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TrackingResult | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Message follow-up state
  const [newMessage, setNewMessage] = useState('');
  const [sendingMsg, setSendingMsg] = useState(false);
  const [msgSuccess, setMsgSuccess] = useState<string | null>(null);

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!caseNumber.trim() || !secretKey.trim()) {
      setSearchError('Please provide both your Case Reference Number and your Secret Access PIN.');
      return;
    }

    setLoading(true);
    setSearchError(null);

    try {
      const res = await lookupReportByCredentials(caseNumber, secretKey);
      if (!res.found) {
        setSearchError(res.error || 'No matching case found for the supplied credentials. Please double check your reference number and PIN.');
        setResult(null);
      } else {
        setResult(res);
      }
    } catch (err: any) {
      setSearchError(err.message || 'Error communicating with the safeguarding vault.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !caseNumber || !secretKey) return;

    setSendingMsg(true);
    setMsgSuccess(null);

    try {
      const success = await sendReporterFollowupMessage(caseNumber, secretKey, newMessage);
      if (success) {
        setNewMessage('');
        setMsgSuccess('Your message was encrypted and forwarded to the safeguarding officer.');
        // Refresh messages
        const refreshed = await lookupReportByCredentials(caseNumber, secretKey);
        if (refreshed.found) {
          setResult(refreshed);
        }
      }
    } catch (err) {
      console.warn('Message send error:', err);
    } finally {
      setSendingMsg(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 space-y-12 pb-20">
      <EmergencyHelpBanner />
      <SafeguardingNav />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 flex items-center justify-center font-bold">
              <Lock className="w-4 h-4" />
            </span>
            <span className="text-xs font-black uppercase tracking-wider text-cyan-400">
              Encrypted Report Tracker
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Track Your Report &amp; Follow-Up Securely
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            Enter your Case Reference Number and Secret PIN generated at the time of your report. You can review non-confidential progress milestones and message safeguarding officers directly.
          </p>
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleLookup} className="p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase tracking-wider text-slate-300 block">
                Case Reference Number
              </label>
              <input
                type="text"
                required
                value={caseNumber}
                onChange={e => setCaseNumber(e.target.value.toUpperCase())}
                placeholder="e.g. YARA-SAFE-2026-123456"
                className="w-full p-3.5 rounded-xl bg-white text-slate-900 border border-slate-300 font-mono text-xs uppercase"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase tracking-wider text-amber-400 block">
                Secret Access PIN
              </label>
              <input
                type="text"
                required
                value={secretKey}
                onChange={e => setSecretKey(e.target.value.toUpperCase())}
                placeholder="e.g. K7M9-P4Q2"
                className="w-full p-3.5 rounded-xl bg-white text-slate-900 border border-slate-300 font-mono text-xs uppercase tracking-wider"
              />
            </div>
          </div>

          {searchError && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{searchError}</span>
            </div>
          )}

          <div className="pt-1 flex items-center justify-between">
            <span className="text-[11px] text-slate-500 flex items-center gap-1">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Credentials were shown only on your confirmation receipt.</span>
            </span>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider transition shadow-lg flex items-center gap-2 cursor-pointer"
            >
              {loading ? (
                <span>Checking Credentials...</span>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>Access Report</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Report Found View */}
        {result && result.report && (
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-indigo-500/30 space-y-8 shadow-2xl">
            {/* Header info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest block">
                  Official Case Dossier
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-white font-mono">
                  {result.report.case_number}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Category: <span className="text-white font-bold capitalize">{result.report.category.replace('_', ' ')}</span> • Mode: {result.report.is_anonymous ? 'Anonymous' : 'Confidential Identified'}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-indigo-500/20 text-cyan-300 border border-indigo-500/30">
                  Status: {result.report.status.replace(/_/g, ' ')}
                </span>
                <span className={`px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider border ${
                  result.report.priority === 'urgent' 
                    ? 'bg-red-500/20 text-red-400 border-red-500/30 animate-pulse'
                    : 'bg-slate-800 text-slate-300 border-slate-700'
                }`}>
                  Priority: {result.report.priority}
                </span>
              </div>
            </div>

            {/* Status Pipeline Timeline */}
            <div className="space-y-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
                Case Assessment Progress Milestones
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-xs">
                {STATUS_STEPS.map((s, idx) => {
                  const isCurrent = result.report?.status === s.id;
                  const stepIndex = STATUS_STEPS.findIndex(x => x.id === result.report?.status);
                  const isPast = idx < stepIndex;

                  return (
                    <div
                      key={s.id}
                      className={`p-3 rounded-2xl border transition ${
                        isCurrent
                          ? 'bg-cyan-500/10 border-cyan-400 text-cyan-300 ring-1 ring-cyan-400'
                          : isPast
                            ? 'bg-slate-950/60 border-emerald-500/30 text-emerald-400'
                            : 'bg-slate-950/40 border-slate-800 text-slate-600'
                      }`}
                    >
                      <span className="text-[10px] font-mono block opacity-75">Step 0{idx + 1}</span>
                      <strong className="block text-xs mt-0.5">{s.label}</strong>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Secure Two-Way Messaging Thread */}
            <div className="space-y-4 pt-4 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-cyan-400" />
                  <span>Secure Communication Channel</span>
                </h3>
                <span className="text-[11px] text-slate-400">
                  Two-way encrypted thread with Safeguarding Officers
                </span>
              </div>

              {/* Message History */}
              <div className="space-y-3 max-h-96 overflow-y-auto p-4 rounded-2xl bg-slate-950 border border-slate-800">
                {result.messages && result.messages.length > 0 ? (
                  result.messages.map(m => {
                    const isOfficer = m.sender_type === 'officer';
                    return (
                      <div
                        key={m.id}
                        className={`p-4 rounded-2xl border text-xs space-y-1 max-w-xl ${
                          isOfficer
                            ? 'bg-indigo-950/40 border-indigo-500/30 text-slate-200 mr-auto'
                            : 'bg-slate-800/80 border-slate-700 text-white ml-auto'
                        }`}
                      >
                        <div className="flex items-center justify-between font-bold text-[11px] text-cyan-400 pb-1 border-b border-white/5">
                          <span>{m.sender_display_name}</span>
                          <span className="text-[10px] text-slate-500 font-normal">
                            {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(m.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="leading-relaxed whitespace-pre-wrap">{m.message}</p>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-xs text-slate-500 text-center py-4">
                    No additional messages logged yet.
                  </p>
                )}
              </div>

              {/* Send Additional Message Form */}
              {result.canMessage ? (
                <form onSubmit={handleSendMessage} className="space-y-2">
                  {msgSuccess && (
                    <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs">
                      {msgSuccess}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={e => setNewMessage(e.target.value)}
                      placeholder="Type additional details or respond to the safeguarding officer..."
                      className="flex-1 p-3 rounded-xl bg-white text-slate-900 border border-slate-300 text-xs"
                    />
                    <button
                      type="submit"
                      disabled={sendingMsg || !newMessage.trim()}
                      className="px-5 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-bold text-xs transition flex items-center gap-1.5 shrink-0 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Send</span>
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-500">
                    Your reply is forwarded securely to the assigned safeguarding officer while strictly maintaining your anonymity.
                  </p>
                </form>
              ) : (
                <div className="p-3 rounded-xl bg-slate-950 text-center text-xs text-slate-500">
                  This case has been resolved and closed. If new concerns arise, please log a new report.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

