import React from 'react';
import { 
  Heart, Shield, AlertCircle, Users, CheckCircle2, 
  PhoneCall, ArrowRight, Download, BookOpen, Lock, Sparkles, Scale
} from 'lucide-react';
import { Link } from 'react-router-dom';
import EmergencyHelpBanner from '../../components/safeguarding/EmergencyHelpBanner';
import SafeguardingNav from '../../components/safeguarding/SafeguardingNav';

export default function GbvPreventionPage() {
  const gbvForms = [
    {
      title: 'Sexual Harassment & Innuendo',
      desc: 'Unwelcome sexual comments, suggestive jokes, persistent uninvited romantic advances, or requests for sexual favors by mentors, judges, or peers.'
    },
    {
      title: 'Sexual Exploitation & Abuse (SEA)',
      desc: 'Abuse of a position of vulnerability, differential power, or trust for sexual purposes, including promising hardware kits, competition awards, or travel slots in exchange for favors.'
    },
    {
      title: 'Gender-Based Discrimination & Exclusion',
      desc: 'Denying girls hands-on programming time, delegating female builders only to clerical/pitch tasks, or claiming robotics is "not for women".'
    },
    {
      title: 'Online Cyber-Harassment & Stalking',
      desc: 'Non-consensual sharing of private messages, derogatory memes targeting female students in club group chats, or persistent uninvited digital contact.'
    },
    {
      title: 'Physical & Emotional Intimidation',
      desc: 'Aggressive body language, blocking physical paths, verbal demeaning, or creating a hostile, threatening atmosphere in maker spaces.'
    },
    {
      title: 'Abuse of Authority & Gaslighting',
      desc: 'Threatening to dismiss or fail a student if they speak up about harassment, or manipulating club hierarchies to silence victims.'
    }
  ];

  const supportAlliances = [
    {
      org: 'Musasa Project Zimbabwe',
      role: 'Emergency Shelter & GBV Legal Advocacy',
      hotline: '08080074 (Toll-Free 24/7)',
      service: 'Confidential temporary shelter, psychological trauma counseling, and court preparation for survivors of domestic violence and sexual assault.'
    },
    {
      org: 'Adult Rape Clinic (ARC)',
      role: 'Emergency Clinical Intervention within 72 Hours',
      hotline: '+263 242 795 869',
      service: 'Critical post-exposure prophylaxis (PEP for HIV prevention), emergency contraception, forensic swabs, and trauma treatment in Harare.'
    },
    {
      org: 'ZRP Victim Friendly Unit (VFU)',
      role: 'Specialized Police Protection & Prosecution',
      hotline: '+263 242 703 631',
      service: 'Trained female and male detectives operating in private counseling rooms to take formal statements without secondary victimization.'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 space-y-12 pb-20">
      <EmergencyHelpBanner />
      <SafeguardingNav />

      {/* Hero */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <div className="rounded-3xl p-8 sm:p-12 border border-red-500/30 bg-gradient-to-br from-[#1a051d] via-[#0D47A1] to-[#0A1B4D] text-white shadow-2xl relative overflow-hidden">
          <div className="max-w-3xl space-y-4 relative z-10">
            <span className="px-3.5 py-1 rounded-full bg-red-400 text-slate-950 font-black text-xs uppercase tracking-wider inline-flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5" />
              <span>Zero Tolerance Charter</span>
            </span>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight">
              Gender-Based Violence &amp; Sexual Harassment Prevention.
            </h1>
            <p className="text-blue-100 text-sm sm:text-base leading-relaxed">
              YARA is committed to dismantling gender barriers and enforcing zero tolerance for sexual harassment, 
              coercion, and discrimination. We foster safe, respectful spaces where girls, young women, and all youths 
              lead, program, and innovate without fear.
            </p>
            <div className="pt-2 flex flex-wrap gap-3">
              <Link
                to="/safeguarding/report"
                className="px-5 py-3 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider transition shadow-lg flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4" />
                <span>Confidential GBV Incident Report</span>
              </Link>
              <Link
                to="/safeguarding/emergency"
                className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition flex items-center gap-2"
              >
                <PhoneCall className="w-4 h-4 text-emerald-400" />
                <span>Musasa Hotline: 08080074</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Prohibited Forms of Conduct */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div>
          <span className="text-xs font-black uppercase tracking-wider text-red-400 block mb-1">
            Prohibited Actions
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white">
            Recognizing Prohibited GBV &amp; Harassment
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            All participants, mentors, educators, and guests are strictly bound by these prohibitions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {gbvForms.map((item, idx) => (
            <div key={idx} className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-2.5">
              <div className="w-8 h-8 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center font-bold text-xs">
                {idx + 1}
              </div>
              <h3 className="font-bold text-base text-white">{item.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Empowering Girls in STEM Policy */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/30 text-white space-y-6">
          <div className="max-w-3xl space-y-3">
            <span className="text-xs font-black uppercase tracking-wider text-cyan-400 block">
              Active Inclusion Policy
            </span>
            <h3 className="text-2xl sm:text-3xl font-black">
              Gender Parity &amp; Respect in Robotics Teams
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              YARA championships enforce mandatory 50/50 gender quotas (minimum 2 boys and 2 girls per 4-person registered team) to eradicate historic male monopolies in technology clubs. Mentors are instructed to ensure female students take primary hands-on roles in microcontrollers, mechanics, and autonomous code execution.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1">
              <span className="text-xl font-black text-cyan-400">50/50 Quota</span>
              <p className="text-xs text-slate-400">Mandatory equal gender representation in all national competition teams.</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1">
              <span className="text-xl font-black text-emerald-400">Zero Retaliation</span>
              <p className="text-xs text-slate-400">Reporters of harassment are protected under strict anti-victimization statutes.</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1">
              <span className="text-xl font-black text-pink-400">Female Leadership</span>
              <p className="text-xs text-slate-400">Over 48% of YARA student club captains in 2026 are young women.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Confidential Support & Referral Pathways */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div>
          <span className="text-xs font-black uppercase tracking-wider text-emerald-400 block mb-1">
            Victim-Centered Support
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white">
            Specialist Referral Pathways in Zimbabwe
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Confidential assistance for affected individuals without public exposure or organizational compromise.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {supportAlliances.map((s, idx) => (
            <div key={idx} className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">{s.role}</span>
                <h3 className="font-bold text-base text-white">{s.org}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{s.service}</p>
              </div>
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400">Hotline:</span>
                <span className="text-xs font-black font-mono text-emerald-400">{s.hotline}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Download Policy */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold text-red-400 uppercase">Institutional Charter</span>
            <h4 className="font-bold text-base text-white">YARA Gender-Based Violence &amp; Sexual Harassment Policy</h4>
            <p className="text-xs text-slate-400">Version 2.1 • Official YARA Executive Council Approval (1.2 MB PDF)</p>
          </div>
          <a
            href="/assets/policies/YARA_GBV_Harassment_Policy_v2.1.pdf"
            download
            className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0"
          >
            <Download className="w-4 h-4" />
            <span>Download Official Policy</span>
          </a>
        </div>
      </div>
    </div>
  );
}

