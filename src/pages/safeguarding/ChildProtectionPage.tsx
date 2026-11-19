import React from 'react';
import { 
  Shield, CheckCircle2, AlertCircle, Users, BookOpen, 
  Camera, Compass, Award, PhoneCall, ArrowRight, Download, Lock
} from 'lucide-react';
import { Link } from 'react-router-dom';
import EmergencyHelpBanner from '../../components/safeguarding/EmergencyHelpBanner';
import SafeguardingNav from '../../components/safeguarding/SafeguardingNav';

export default function ChildProtectionPage() {
  const childRights = [
    { title: 'Right to Safety & Protection', desc: 'Every child participating in YARA activities has the absolute right to be protected from physical violence, sexual harm, emotional cruelty, and neglect.' },
    { title: 'Right to Equal Opportunity in STEM', desc: 'Protection against bias, gender-based exclusion, or socioeconomic discrimination when accessing robotics kits, mentorship, and competitions.' },
    { title: 'Right to Dignity & Respect', desc: 'Freedom from humiliation, intimidation, aggressive language, or condescension by mentors, judges, peers, or educators.' },
    { title: 'Right to be Heard & Believed', desc: 'Children have the right to voice concerns and report misconduct without fear of punishment, disqualification, or loss of club membership.' },
    { title: 'Right to Privacy & Digital Protection', desc: 'No minor may be photographed, recorded, or publicly tagged on social media without signed parental and personal consent.' }
  ];

  const safetyProtocols = [
    {
      title: 'Robotics Clubs & Maker Space Safety',
      points: [
        'All club sessions must be overseen by at least two certified adult facilitators or vetted educators.',
        'Never allow one-on-one closed-door private meetings between an adult and a student.',
        'Strict electrical, soldering, battery, and water tank trial safety protocols enforced at all times.',
        'Physical boundaries: adults must not engage in unwarranted physical contact or rough play.'
      ]
    },
    {
      title: 'Tournaments & Educational Field Trips',
      points: [
        'Mandatory written parental/guardian consent forms submitted 7 days prior to any regional or national trip.',
        'Gender-segregated chaperone arrangements: female chaperones required for female students.',
        'Strict curfew and accommodation oversight with zero adult entry into student sleeping quarters.',
        'Emergency medical contact details and verified health profiles carried by the head trip coordinator.'
      ]
    },
    {
      title: 'Digital & Online Communication Conduct',
      points: [
        'All official team communication must occur on designated group channels (WhatsApp/Discord/LMS).',
        'Private direct messaging (DMs) between mentors and minors regarding non-academic topics is strictly prohibited.',
        'Sharing of inappropriate imagery, crude humor, or adult media is grounds for immediate lifetime expulsion.'
      ]
    },
    {
      title: 'Photography & Media Consent Protocol',
      points: [
        'Media teams must verify consent badges before taking close-up photos or video interviews of minors.',
        'Never publish a child’s full address, personal phone number, or vulnerable background in media posts.',
        'Parents and students reserve the unconditional right to request removal of any published image.'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 space-y-12 pb-20">
      <EmergencyHelpBanner />
      <SafeguardingNav />

      {/* Hero */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <div className="rounded-3xl p-8 sm:p-12 border border-blue-500/30 bg-gradient-to-br from-[#0A1B4D] via-[#0D47A1] to-[#0A1B4D] text-white shadow-2xl relative overflow-hidden">
          <div className="max-w-3xl space-y-4 relative z-10">
            <span className="px-3.5 py-1 rounded-full bg-cyan-400 text-slate-950 font-black text-xs uppercase tracking-wider inline-flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" />
              <span>YARA Institutional Child Protection Charter</span>
            </span>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight">
              Safeguarding Children in STEM &amp; Robotics.
            </h1>
            <p className="text-blue-100 text-sm sm:text-base leading-relaxed">
              YARA prioritizes the welfare, safety, and dignity of every child above all organizational goals. 
              We operate an uncompromising child protection framework ensuring young learners build, code, 
              and compete in supportive spaces free from harm, exploitation, or abuse.
            </p>
            <div className="pt-2 flex flex-wrap gap-3">
              <Link
                to="/safeguarding/report"
                className="px-5 py-3 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider transition shadow-lg flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4" />
                <span>Report Child Safety Concern</span>
              </Link>
              <a
                href="#policies"
                className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition flex items-center gap-2"
              >
                <BookOpen className="w-4 h-4" />
                <span>Download Policy PDF</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Children's Rights in YARA Activities */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div>
          <span className="text-xs font-black uppercase tracking-wider text-cyan-400 block mb-1">
            Fundamental Rights
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white">
            Children’s Rights in YARA Programmes
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Aligned with the UN Convention on the Rights of the Child (UNCRC) and the Constitution of Zimbabwe Section 81.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {childRights.map((r, i) => (
            <div key={i} className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-cyan-400 flex items-center justify-center font-black text-xs">
                0{i + 1}
              </div>
              <h3 className="font-bold text-base text-white">{r.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{r.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Safety Protocols Across Activities */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div>
          <span className="text-xs font-black uppercase tracking-wider text-emerald-400 block mb-1">
            Operational Protocols
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white">
            Child Protection Across Club &amp; Arena Activities
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {safetyProtocols.map((p, idx) => (
            <div key={idx} className="p-7 rounded-3xl bg-slate-900/70 border border-slate-800 space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0" />
                <span>{p.title}</span>
              </h3>
              <ul className="space-y-2.5 text-xs text-slate-300">
                {p.points.map((pt, i) => (
                  <li key={i} className="flex items-start gap-2 leading-relaxed">
                    <span className="text-cyan-400 font-bold shrink-0">•</span>
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Step-by-Step Reporting Pathway */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-6">
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-amber-400 block mb-1">
              Escalation Pathway
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-white">
              What Happens When a Child Protection Concern is Raised?
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="text-amber-400 font-black font-mono text-sm">Step 01</span>
              <h4 className="font-bold text-white text-sm">Secure Submission</h4>
              <p className="text-slate-400 leading-relaxed">
                Report logged anonymously or confidentially. Reference number and private PIN issued to reporter.
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="text-cyan-400 font-black font-mono text-sm">Step 02</span>
              <h4 className="font-bold text-white text-sm">Immediate Risk Triage</h4>
              <p className="text-slate-400 leading-relaxed">
                Designated child safety officer conducts urgent risk assessment. If child is in immediate danger, statutory services are engaged immediately.
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="text-indigo-400 font-black font-mono text-sm">Step 03</span>
              <h4 className="font-bold text-white text-sm">Precautionary Measures</h4>
              <p className="text-slate-400 leading-relaxed">
                Accused mentor/patron is immediately suspended from contact with minors pending independent inquiry. Never notified of the reporter’s identity.
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="text-emerald-400 font-black font-mono text-sm">Step 04</span>
              <h4 className="font-bold text-white text-sm">Statutory Escalation &amp; Care</h4>
              <p className="text-slate-400 leading-relaxed">
                Referral to Childline Zimbabwe, Social Welfare, and ZRP Child Friendly Bureau. Psychological counseling provided to the student.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Downloadable Policies Section */}
      <div id="policies" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-cyan-400" />
            <span>Downloadable Child Protection Guidelines</span>
          </h3>
          <Link to="/safeguarding/resources" className="text-xs text-cyan-400 hover:underline font-bold">
            All Policies &amp; Resources →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-bold text-cyan-400 uppercase">Version 2.4 • Approved</span>
              <h4 className="font-bold text-sm text-white">YARA Child Protection &amp; Safeguarding Policy</h4>
              <p className="text-xs text-slate-400 mt-0.5">Comprehensive institutional protocol (1.4 MB PDF)</p>
            </div>
            <a
              href="/assets/policies/YARA_Child_Safeguarding_Policy_v2.4.pdf"
              download
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </a>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-bold text-emerald-400 uppercase">Version 3.0 • Mandatory</span>
              <h4 className="font-bold text-sm text-white">Mentor &amp; Volunteer Code of Conduct</h4>
              <p className="text-xs text-slate-400 mt-0.5">Binding ethical agreement for all adult patrons (890 KB PDF)</p>
            </div>
            <a
              href="/assets/policies/YARA_Mentor_Code_of_Conduct_v3.0.pdf"
              download
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
