import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldAlert, EyeOff, UserCheck, AlertCircle, CheckCircle2, 
  Copy, Check, Download, ArrowRight, Lock, Key, 
  Calendar, MapPin, Upload, FileText, PhoneCall, HelpCircle, AlertTriangle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import EmergencyHelpBanner from '../../components/safeguarding/EmergencyHelpBanner';
import SafeguardingNav from '../../components/safeguarding/SafeguardingNav';
import { submitSafeguardingReport, SubmitReportResult } from '../../services/safeguardingService';
import { SafeguardingReportCategory } from '../../types/safeguarding';

const CATEGORIES: { id: SafeguardingReportCategory; label: string; desc: string }[] = [
  { id: 'child_abuse', label: 'Child Abuse (Physical or Emotional)', desc: 'Harm, physical violence, or severe emotional cruelty towards a minor.' },
  { id: 'child_neglect', label: 'Child Neglect / Endangerment', desc: 'Failure to provide safe conditions, food, or supervision during trips/labs.' },
  { id: 'gbv', label: 'Gender-Based Violence (GBV)', desc: 'Violence, threats, or coercion directed against an individual based on their gender.' },
  { id: 'sexual_harassment', label: 'Sexual Harassment', desc: 'Unwelcome sexual comments, propositions, touches, or inappropriate jokes.' },
  { id: 'sexual_exploitation', label: 'Sexual Exploitation & Abuse', desc: 'Abuse of authority, gifts, or awards for sexual conduct.' },
  { id: 'bullying', label: 'Bullying & Intimidation', desc: 'Persistent verbal mockery, physical harassment, exclusion, or digital cyberbullying.' },
  { id: 'discrimination', label: 'Discrimination (Gender, Disability, Race, Region)', desc: 'Unfair exclusion from kits, coding slots, or tournament representation.' },
  { id: 'abuse_of_authority', label: 'Abuse of Authority / Leadership Misconduct', desc: 'Misuse of club power, retaliation against students, or silencing complaints.' },
  { id: 'mentor_misconduct', label: 'Mentor or Volunteer Boundary Violation', desc: 'Inappropriate unmonitored communication, secret meetings, or unethical contact.' },
  { id: 'unsafe_environment', label: 'Unsafe Physical Lab or Arena Environment', desc: 'Electrical hazards, dangerous tank setups, or lack of emergency first aid.' },
  { id: 'other', label: 'Other Safeguarding Concern', desc: 'Any other matter affecting the safety, wellbeing, or dignity of participants.' }
];

export default function ReportConcernPage() {
  const [reportType, setReportType] = useState<'anonymous' | 'confidential'>('anonymous');

  // Form states
  const [category, setCategory] = useState<SafeguardingReportCategory>('child_abuse');
  const [description, setDescription] = useState('');
  const [incidentDate, setIncidentDate] = useState('');
  const [locationOrChapter, setLocationOrChapter] = useState('');
  const [isChildAtRisk, setIsChildAtRisk] = useState(true);
  const [isImmediateDanger, setIsImmediateDanger] = useState(false);
  const [isOngoing, setIsOngoing] = useState(false);

  // Optional Contact info (Confidential mode)
  const [reporterName, setReporterName] = useState('');
  const [reporterEmail, setReporterEmail] = useState('');
  const [reporterPhone, setReporterPhone] = useState('');
  const [reporterRole, setReporterRole] = useState<'student' | 'mentor' | 'volunteer' | 'parent' | 'teacher' | 'chapter_member' | 'guest'>('student');

  // Submission state
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<SubmitReportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedCase, setCopiedCase] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || description.trim().length < 20) {
      setError('Please provide a detailed description of the incident (minimum 20 characters) so our safeguarding officers can assess the concern appropriately.');
      return;
    }

    if (reportType === 'confidential' && !reporterEmail.trim() && !reporterPhone.trim()) {
      setError('In confidential mode, please provide an email address or telephone number so our safeguarding officer can contact you securely.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await submitSafeguardingReport({
        category,
        incident_description: description,
        incident_date: incidentDate,
        chapter_or_location: locationOrChapter,
        is_child_at_risk: isChildAtRisk,
        is_immediate_danger: isImmediateDanger,
        is_ongoing: isOngoing,
        is_anonymous: reportType === 'anonymous',
        reporter_name: reportType === 'confidential' ? reporterName : undefined,
        reporter_email: reportType === 'confidential' ? reporterEmail : undefined,
        reporter_phone: reportType === 'confidential' ? reporterPhone : undefined,
        reporter_role: reportType === 'confidential' ? reporterRole : undefined
      });

      setResult(res);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred while logging your report. Please try again or call Childline at 116.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopy = (text: string, isSecretKey: boolean) => {
    navigator.clipboard.writeText(text);
    if (isSecretKey) {
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2500);
    } else {
      setCopiedCase(true);
      setTimeout(() => setCopiedCase(false), 2500);
    }
  };

  const handleDownloadReceipt = () => {
    if (!result) return;
    const content = `========================================================
YARA SAFEGUARDING & CHILD PROTECTION CONFIDENTIAL RECEIPT
========================================================

Case Reference Number: ${result.case_number}
Secret Tracking PIN:   ${result.secret_access_key}
Category:             ${category}
Date Logged:          ${new Date().toLocaleString()}

IMPORTANT INSTRUCTIONS:
1. Store this receipt securely. Do not share your Secret PIN.
2. Track your case and message safeguarding officers at:
   https://www.yaria.tech/safeguarding/track
3. If in immediate danger, contact Childline Zimbabwe at 116 (Toll-free 24/7)
   or Musasa GBV at 08080074.

========================================================
Young Africans Robotics Association (YARA)
"Safe Spaces. Protected Voices. Empowered Young People."
========================================================`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${result.case_number}_SafeReceipt.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 space-y-12 pb-20">
      <EmergencyHelpBanner />
      <SafeguardingNav />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        {/* If report already submitted successfully, render confirmation view */}
        {result ? (
          <div className="p-8 sm:p-12 rounded-3xl bg-slate-900 border-2 border-emerald-500/50 space-y-8 shadow-2xl text-white">
            <div className="text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-black uppercase tracking-wider inline-block">
                Report Successfully Received
              </span>
              <h2 className="text-2xl sm:text-4xl font-black">
                Your Report Has Been Safely Logged.
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
                Thank you for your courage in speaking up. A designated YARA safeguarding officer is now reviewing your disclosure in accordance with our Child Protection and GBV policies.
              </p>
            </div>

            {/* Credentials Card */}
            <div className="p-6 sm:p-8 rounded-3xl bg-slate-950 border border-amber-400/30 space-y-6">
              <div className="space-y-1 text-center">
                <span className="text-[11px] font-black uppercase tracking-wider text-amber-400 flex items-center justify-center gap-1.5">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Important: Save Your Tracking Credentials</span>
                </span>
                <p className="text-xs text-slate-400">
                  You will need both your Case Reference and your Secret PIN to track your report and communicate with officers. This secret PIN will only be shown once.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Case Reference Number</span>
                  <div className="flex items-center justify-between">
                    <span className="text-base sm:text-lg font-black font-mono text-white">{result.case_number}</span>
                    <button
                      onClick={() => handleCopy(result.case_number, false)}
                      className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1 transition"
                      title="Copy Reference"
                    >
                      {copiedCase ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1.5">
                  <span className="text-[10px] font-bold text-amber-400 uppercase">Secret Access PIN (Keep Private)</span>
                  <div className="flex items-center justify-between">
                    <span className="text-base sm:text-lg font-black font-mono text-amber-400 tracking-wider">
                      {result.secret_access_key}
                    </span>
                    <button
                      onClick={() => handleCopy(result.secret_access_key, true)}
                      className="p-2 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs flex items-center gap-1 transition"
                      title="Copy Secret PIN"
                    >
                      {copiedKey ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={handleDownloadReceipt}
                  className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Safe Receipt (.txt)</span>
                </button>

                <Link
                  to="/safeguarding/track"
                  className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition"
                >
                  <Key className="w-4 h-4" />
                  <span>Open Tracking Portal Now</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            <div className="text-center">
              <button
                onClick={() => {
                  setResult(null);
                  setDescription('');
                }}
                className="text-xs text-slate-400 hover:text-white underline"
              >
                Submit another report or inquiry
              </button>
            </div>
          </div>
        ) : (
          /* Report Submission Form */
          <div className="space-y-8">
            {/* Header info */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-red-500/20 text-red-400 border border-red-500/40 flex items-center justify-center font-bold">
                  <ShieldAlert className="w-4 h-4" />
                </span>
                <span className="text-xs font-black uppercase tracking-wider text-red-400">
                  Confidential &amp; Anonymous Reporting Channel
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                Report a Safeguarding or Wellbeing Concern
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                You do not need a YARA account to submit this report. Your disclosure will be treated with absolute seriousness, confidentiality, and care by authorized child protection personnel.
              </p>
            </div>

            {/* Immediate danger warning callout */}
            <div className="p-4 sm:p-5 rounded-2xl bg-red-950/60 border border-red-500/40 flex items-start gap-3.5 text-xs text-red-200">
              <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block font-bold mb-0.5">Is someone in immediate physical danger right now?</strong>
                Online reporting is assessed during operational hours. If a child or individual requires immediate rescue or emergency medical assistance, please contact local police at <strong>999</strong> or call <strong>Childline: 116 (Toll-Free)</strong> immediately.
              </div>
            </div>

            {/* Mode Selector: Anonymous vs Confidential */}
            <div className="p-1.5 rounded-2xl bg-slate-900 border border-slate-800 grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setReportType('anonymous')}
                className={`py-3 px-4 rounded-xl font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                  reportType === 'anonymous'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <EyeOff className="w-4 h-4" />
                <span>Option 1: 100% Anonymous Report</span>
              </button>

              <button
                type="button"
                onClick={() => setReportType('confidential')}
                className={`py-3 px-4 rounded-xl font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                  reportType === 'confidential'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <UserCheck className="w-4 h-4" />
                <span>Option 2: Confidential Identified Report</span>
              </button>
            </div>

            {error && (
              <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Main Form */}
            <form onSubmit={handleSubmit} className="p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-6">
              {/* Category Selector */}
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-wider text-slate-300 block">
                  1. Concern Category <span className="text-red-400">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.id)}
                      className={`p-3 rounded-2xl border text-left transition text-xs space-y-1 cursor-pointer ${
                        category === cat.id
                          ? 'bg-indigo-950/80 border-cyan-400 text-white shadow-sm ring-1 ring-cyan-400'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="font-bold text-white flex items-center justify-between">
                        <span>{cat.label}</span>
                        {category === cat.id && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                      </div>
                      <p className="text-[11px] text-slate-400">{cat.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Incident Description */}
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-wider text-slate-300 block">
                  2. Incident Description <span className="text-red-400">*</span>
                </label>
                <p className="text-[11px] text-slate-400">
                  Please describe what happened, who was involved, and any specific statements or conduct observed. Be as specific as possible.
                </p>
                <textarea
                  rows={6}
                  required
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Provide detailed facts: date, what happened, who was affected, and any actions taken..."
                  className="w-full p-4 rounded-2xl bg-white text-slate-900 border border-slate-300 text-xs focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              {/* Context Details (Date, Location/Chapter) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Date or Approximate Period (Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={incidentDate}
                    onChange={e => setIncidentDate(e.target.value)}
                    placeholder="e.g. Yesterday afternoon, October 2026, Ongoing"
                    className="w-full p-3 rounded-xl bg-white text-slate-900 border border-slate-300 text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                    <span>School, Chapter or Location (Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={locationOrChapter}
                    onChange={e => setLocationOrChapter(e.target.value)}
                    placeholder="e.g. Harare High Chapter, Robofest Arena, Lab 2"
                    className="w-full p-3 rounded-xl bg-white text-slate-900 border border-slate-300 text-xs"
                  />
                </div>
              </div>

              {/* Urgency & Risk Checkboxes */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                  3. Risk Assessment Indicators
                </span>

                <div className="space-y-2 text-xs">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isChildAtRisk}
                      onChange={e => setIsChildAtRisk(e.target.checked)}
                      className="w-4 h-4 rounded text-indigo-600 focus:ring-0"
                    />
                    <span className="text-slate-200">
                      A minor (child under 18 years of age) is involved or potentially at risk.
                    </span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isImmediateDanger}
                      onChange={e => setIsImmediateDanger(e.target.checked)}
                      className="w-4 h-4 rounded text-red-600 focus:ring-0"
                    />
                    <span className="text-slate-200">
                      There is immediate physical danger or risk of severe harm.
                    </span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isOngoing}
                      onChange={e => setIsOngoing(e.target.checked)}
                      className="w-4 h-4 rounded text-amber-500 focus:ring-0"
                    />
                    <span className="text-slate-200">
                      The conduct is ongoing or likely to happen again.
                    </span>
                  </label>
                </div>
              </div>

              {/* Optional Confidential Contact Info */}
              {reportType === 'confidential' && (
                <div className="p-5 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 space-y-4">
                  <div>
                    <span className="text-xs font-bold text-white block">
                      Optional Contact Details for Follow-Up
                    </span>
                    <p className="text-[11px] text-slate-400">
                      Your identity will be kept strictly confidential within the Safeguarding Team and will never be disclosed to the subject of the report.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-300">Your Full Name (Optional)</label>
                      <input
                        type="text"
                        value={reporterName}
                        onChange={e => setReporterName(e.target.value)}
                        placeholder="e.g. Jane Doe"
                        className="w-full p-2.5 rounded-xl bg-white text-slate-900 border border-slate-300"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-300">Your Role / Relationship</label>
                      <select
                        value={reporterRole}
                        onChange={e => setReporterRole(e.target.value as any)}
                        className="w-full p-2.5 rounded-xl bg-white text-slate-900 border border-slate-300"
                      >
                        <option value="student">Student / Competitor</option>
                        <option value="chapter_member">Club Member</option>
                        <option value="parent">Parent / Guardian</option>
                        <option value="teacher">Teacher / Educator</option>
                        <option value="mentor">Mentor</option>
                        <option value="volunteer">Volunteer</option>
                        <option value="guest">Guest / Observer</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-300">Email Address</label>
                      <input
                        type="email"
                        value={reporterEmail}
                        onChange={e => setReporterEmail(e.target.value)}
                        placeholder="yourname@example.com"
                        className="w-full p-2.5 rounded-xl bg-white text-slate-900 border border-slate-300"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-300">Phone Number (WhatsApp or Call)</label>
                      <input
                        type="tel"
                        value={reporterPhone}
                        onChange={e => setReporterPhone(e.target.value)}
                        placeholder="e.g. +263 77..."
                        className="w-full p-2.5 rounded-xl bg-white text-slate-900 border border-slate-300"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Submit CTA */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-4 rounded-2xl bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-black text-sm uppercase tracking-wider transition shadow-xl shadow-red-900/40 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {submitting ? (
                    <span>Encrypting &amp; Submitting Report...</span>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>Submit {reportType === 'anonymous' ? 'Anonymous' : 'Confidential'} Report</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
                <p className="text-[11px] text-slate-500 text-center mt-2.5">
                  Encrypted submission. IP addresses are not stored. Access credentials will be provided upon submission.
                </p>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
