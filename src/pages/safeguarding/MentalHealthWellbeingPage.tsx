import React from 'react';
import { 
  Sparkles, Heart, Users, ShieldCheck, CheckCircle2, 
  PhoneCall, ArrowRight, BookOpen, AlertCircle, Smile, HelpCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import EmergencyHelpBanner from '../../components/safeguarding/EmergencyHelpBanner';
import SafeguardingNav from '../../components/safeguarding/SafeguardingNav';

export default function MentalHealthWellbeingPage() {
  const wellbeingPillars = [
    {
      title: 'Managing Competition & Exam Anxiety',
      desc: 'Coding and autonomous robotics challenges can be stressful. We provide practical techniques for breathing, mindfulness, and healthy pacing so students thrive without debilitating pressure.'
    },
    {
      title: 'Peer Support & Positive Lab Culture',
      desc: 'Creating an encouraging club environment where errors and robot failures are celebrated as learning steps rather than sources of shame or peer ridicule.'
    },
    {
      title: 'Anti-Bullying & Cyber Safety',
      desc: 'Equipping young people to identify digital harassment, set personal boundaries on WhatsApp/Discord groups, and access peer mediators when conflicts arise.'
    },
    {
      title: 'Confidence & Imposter Syndrome Relief',
      desc: 'Specialized focus on young women and first-time coders from rural communities, helping them overcome doubts about their technical potential in engineering.'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 space-y-12 pb-20">
      <EmergencyHelpBanner />
      <SafeguardingNav />

      {/* Hero */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <div className="rounded-3xl p-8 sm:p-12 border border-purple-500/30 bg-gradient-to-br from-[#170828] via-[#0D47A1] to-[#0A1B4D] text-white shadow-2xl relative overflow-hidden">
          <div className="max-w-3xl space-y-4 relative z-10">
            <span className="px-3.5 py-1 rounded-full bg-purple-400 text-slate-950 font-black text-xs uppercase tracking-wider inline-flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Youth Emotional Resilience</span>
            </span>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight">
              Mental Health &amp; Emotional Wellbeing.
            </h1>
            <p className="text-purple-100 text-sm sm:text-base leading-relaxed">
              True innovation begins with a healthy mind. YARA supports youth builders not only in mastering circuits and algorithms, but also in developing emotional balance, self-esteem, healthy peer relationships, and resilience.
            </p>
            <div className="pt-2 flex flex-wrap gap-3">
              <a
                href="tel:+263779584755"
                className="px-5 py-3 rounded-2xl bg-purple-500 hover:bg-purple-400 text-slate-950 font-black text-xs uppercase tracking-wider transition shadow-lg flex items-center gap-2"
              >
                <PhoneCall className="w-4 h-4" />
                <span>Friendship Bench Helpline (+263 779 584 755)</span>
              </a>
              <Link
                to="/safeguarding/resources"
                className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition flex items-center gap-2"
              >
                <BookOpen className="w-4 h-4" />
                <span>Wellbeing Guidebooks</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Professional Medical Disclaimer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-400 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <strong className="text-white block font-bold">Important Psychological Care Notice:</strong>
            YARA’s educational guides, peer workshops, and wellbeing materials are designed for emotional literacy and general wellness. They do not substitute for licensed clinical psychological care, formal psychiatric evaluation, or emergency medical treatment. If you are experiencing acute distress or thoughts of self-harm, please connect with a qualified doctor or call <strong>Childline: 116</strong> immediately.
          </div>
        </div>
      </div>

      {/* Core Wellbeing Pillars */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div>
          <span className="text-xs font-black uppercase tracking-wider text-purple-400 block mb-1">
            Resilience Pillars
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white">
            Nurturing Healthy Minds in Robotics
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {wellbeingPillars.map((p, idx) => (
            <div key={idx} className="p-7 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Smile className="w-5 h-5 text-purple-400 shrink-0" />
                <span>{p.title}</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Friendship Bench Spotlight */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-purple-500/30 text-white space-y-6">
          <div className="max-w-3xl space-y-3">
            <span className="text-xs font-black uppercase tracking-wider text-cyan-400 block">
              Verified Youth Mental Health Partner
            </span>
            <h3 className="text-2xl sm:text-3xl font-black">
              Friendship Bench Zimbabwe
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Friendship Bench is an internationally celebrated Zimbabwean mental health initiative providing structured, evidence-based psychological problem-solving therapy. Youth and students feeling overwhelmed, depressed, or anxious can speak confidentially with a trained community counselor for free.
            </p>
          </div>

          <div className="pt-2 flex flex-wrap gap-4">
            <a
              href="https://www.friendshipbenchzimbabwe.org"
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-3 rounded-xl bg-purple-500 hover:bg-purple-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition"
            >
              Visit Friendship Bench Website ↗
            </a>
            <a
              href="tel:+263779584755"
              className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition flex items-center gap-2"
            >
              <PhoneCall className="w-4 h-4 text-emerald-400" />
              <span>WhatsApp / Call: +263 779 584 755</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
