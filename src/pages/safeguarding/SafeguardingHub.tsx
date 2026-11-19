import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Shield, Heart, Users, FileText, PhoneCall, 
  Sparkles, Award, Lock, BookOpen, AlertCircle, 
  ArrowRight, CheckCircle2, ChevronRight, EyeOff, ShieldCheck,
  Scale, Globe, HeartHandshake, Compass
} from 'lucide-react';
import { Link } from 'react-router-dom';
import EmergencyHelpBanner from '../../components/safeguarding/EmergencyHelpBanner';
import SafeguardingNav from '../../components/safeguarding/SafeguardingNav';
import { getEmergencyContacts, getSafeguardingResources, getSafeguardingCampaigns } from '../../services/safeguardingService';
import { SafeguardingEmergencyContact, SafeguardingResource, SafeguardingCampaign } from '../../types/safeguarding';

export default function SafeguardingHub() {
  const [emergencyContacts, setEmergencyContacts] = useState<SafeguardingEmergencyContact[]>([]);
  const [resources, setResources] = useState<SafeguardingResource[]>([]);
  const [campaigns, setCampaigns] = useState<SafeguardingCampaign[]>([]);

  useEffect(() => {
    async function loadData() {
      const [em, res, camp] = await Promise.all([
        getEmergencyContacts(),
        getSafeguardingResources(),
        getSafeguardingCampaigns()
      ]);
      setEmergencyContacts(em.slice(0, 3));
      setResources(res.slice(0, 3));
      setCampaigns(camp.slice(0, 2));
    }
    loadData();
  }, []);

  const coreModules = [
    {
      title: 'Child Protection',
      description: 'Defending children’s rights, preventing physical & emotional abuse, safeguarding during robotics competitions, and regulating mentor conduct.',
      icon: Shield,
      path: '/safeguarding/child-protection',
      color: 'blue'
    },
    {
      title: 'Gender-Based Violence (GBV)',
      description: 'Zero-tolerance charter against sexual harassment, exploitation, gender discrimination, and online abuse in student maker spaces.',
      icon: Heart,
      path: '/safeguarding/gbv',
      color: 'red'
    },
    {
      title: 'Anonymous Reporting System',
      description: 'Submit an incident report without an account. Receive a unique Case Reference and separate Secret Key for secure tracking.',
      icon: EyeOff,
      path: '/safeguarding/report',
      color: 'amber',
      badge: 'Confidential'
    },
    {
      title: 'Case Tracking & Follow-Up',
      description: 'Safely track the progress of your submitted report and communicate with designated safeguarding officers through encrypted messaging.',
      icon: Lock,
      path: '/safeguarding/track',
      color: 'emerald'
    },
    {
      title: 'Mental Health & Wellbeing',
      description: 'Youth emotional resilience, peer support guidelines, stress management during exams/tournaments, and professional counseling referrals.',
      icon: Sparkles,
      path: '/safeguarding/wellbeing',
      color: 'purple'
    },
    {
      title: 'Emergency Hotlines',
      description: 'Direct verified hotlines: Childline Zimbabwe (116), Musasa Project GBV (08080074), ZRP Child Friendly Bureau, and ambulance dispatch.',
      icon: PhoneCall,
      path: '/safeguarding/emergency',
      color: 'cyan'
    },
    {
      title: 'Policies & Governance',
      description: 'Download official approved policies including Mentor Code of Conduct, Student Photography Consent, Whistleblowing, and Safeguarding Protocols.',
      icon: BookOpen,
      path: '/safeguarding/resources',
      color: 'indigo'
    },
    {
      title: 'Awareness Campaigns',
      description: 'Upcoming school outreach, GBV prevention forums, digital safety workshops, and gender inclusion campaigns across Zimbabwe.',
      icon: Award,
      path: '/safeguarding/campaigns',
      color: 'pink'
    },
    {
      title: 'Chapter Safety & Compliance',
      description: 'Mandatory safeguarding standards, designated chapter safety contacts, and signed codes of conduct for all university and school clubs.',
      icon: Users,
      path: '/safeguarding/chapters',
      color: 'slate'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 space-y-12 pb-20">
      {/* 1. Emergency Safety Banner */}
      <EmergencyHelpBanner />

      {/* 2. Safeguarding Secondary Navbar */}
      <SafeguardingNav />

      {/* 3. Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <div className="relative rounded-3xl overflow-hidden p-8 sm:p-12 md:p-16 border border-indigo-500/30 bg-gradient-to-br from-[#0A1B4D] via-[#0D47A1] to-[#0A1B4D] shadow-2xl text-white">
          <div className="relative z-10 max-w-3xl space-y-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3.5 py-1 rounded-full bg-cyan-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-sm flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-slate-950" />
                <span>YARA Safeguarding &amp; Wellbeing</span>
              </span>
              <span className="px-3 py-1 rounded-full bg-white/10 text-cyan-200 border border-white/20 text-xs font-semibold">
                Motto: "Safe Spaces. Protected Voices. Empowered Young People."
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight leading-tight">
              Safeguarding, Child Protection &amp; Youth Wellbeing.
            </h1>

            <p className="text-base sm:text-lg text-blue-100 leading-relaxed">
              Every child, student, and youth builder deserves an inspiring, respectful, and protected environment. 
              YARA enforces a comprehensive, zero-tolerance framework against child abuse, sexual harassment, 
              gender-based violence, bullying, and intimidation across all our robotics labs, competitions, and schools.
            </p>

            {/* Main Action CTAs */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Link
                to="/safeguarding/report"
                className="px-6 py-3.5 bg-red-600 hover:bg-red-500 text-white font-black text-xs sm:text-sm uppercase tracking-wider rounded-2xl shadow-xl shadow-red-900/40 flex items-center gap-2 transition cursor-pointer"
              >
                <AlertCircle className="w-4 h-4" />
                <span>Report a Concern (Anonymous)</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                to="/safeguarding/track"
                className="px-5 py-3.5 bg-slate-900/90 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm rounded-2xl border border-slate-700 hover:border-cyan-400 transition flex items-center gap-2"
              >
                <Lock className="w-4 h-4 text-cyan-400" />
                <span>Track My Report</span>
              </Link>

              <Link
                to="/safeguarding/emergency"
                className="px-5 py-3.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm rounded-2xl border border-white/20 transition flex items-center gap-2"
              >
                <PhoneCall className="w-4 h-4 text-emerald-400" />
                <span>Helplines Directory</span>
              </Link>
            </div>
          </div>

          {/* Decorative ambient background */}
          <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute right-10 top-10 w-64 h-64 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />
        </div>
      </div>

      {/* 4. Three Core Institutional Guarantees */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/40 transition space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-cyan-400 border border-blue-500/20 flex items-center justify-center font-bold">
              <EyeOff className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Complete Technical Anonymity</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Anyone can report abuse or misconduct without creating an account or providing a name, phone, or email. Case tracking relies on an independent secret credential.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-red-500/40 transition space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 flex items-center justify-center font-bold">
              <Scale className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Zero Tolerance &amp; Independent Triage</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Accused individuals are never given access to reports or allowed to oversee inquiries. Reports are routed to designated child protection officers and statutory authorities.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/40 transition space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center font-bold">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Trauma-Informed &amp; Restorative Support</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Direct connection to professional child counseling (Childline 116), GBV crisis shelters (Musasa 08080074), and community psychological first aid (Friendship Bench).
            </p>
          </div>
        </div>
      </div>

      {/* 5. Main Safeguarding Modules Directory */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
            <span>Explore Safeguarding &amp; Wellbeing Sections</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Access child protection guidelines, reporting channels, policy documents, and mental wellness initiatives.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {coreModules.map(mod => {
            const Icon = mod.icon;
            return (
              <Link
                key={mod.title}
                to={mod.path}
                className="group p-6 rounded-3xl bg-slate-900/70 border border-slate-800 hover:border-cyan-400/50 hover:bg-slate-900 transition-all flex flex-col justify-between space-y-4 shadow-lg hover:shadow-cyan-500/10"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-[#0D47A1]/20 text-cyan-400 border border-[#0D47A1]/40 flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
                      <Icon className="w-6 h-6" />
                    </div>
                    {mod.badge && (
                      <span className="px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 text-[10px] font-black uppercase">
                        {mod.badge}
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors">
                    {mod.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {mod.description}
                  </p>
                </div>

                <div className="pt-2 flex items-center text-xs font-bold text-cyan-400 group-hover:text-cyan-300 gap-1">
                  <span>Open Section</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* 6. Emergency Contacts Quick Spotlight */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-emerald-400 block mb-1">
                Verified Emergency Hotlines (Zimbabwe)
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-white">
                Urgent Assistance &amp; Crisis Numbers
              </h3>
            </div>
            <Link
              to="/safeguarding/emergency"
              className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
            >
              <span>View All Emergency Contacts</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {emergencyContacts.map(c => (
              <div key={c.id} className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-white">{c.name}</span>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    {c.toll_free ? 'Toll-Free' : 'National Line'}
                  </span>
                </div>
                <p className="text-xs text-slate-400 line-clamp-2">{c.description}</p>
                <div className="pt-1 flex items-center justify-between text-xs">
                  <span className="text-slate-500 text-[11px]">{c.availability}</span>
                  <a
                    href={`tel:${c.phone}`}
                    className="font-mono font-black text-cyan-400 hover:text-cyan-300 underline"
                  >
                    Call: {c.phone}
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 7. Institutional Accountability & Legal Compliance Notice */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/60 border border-slate-800/80 text-xs text-slate-400 space-y-3 leading-relaxed">
          <div className="flex items-center gap-2 font-bold text-white text-sm">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span>Human-Governed Safeguarding Commitment &amp; Legal Compliance</span>
          </div>
          <p>
            The YARA Safeguarding &amp; Wellbeing platform complies with the Constitution of Zimbabwe (Section 81 on the Rights of Children), the Children’s Act [Chapter 5:06], the Domestic Violence Act [Chapter 5:16], and international conventions on child rights and gender equality.
          </p>
          <p>
            YARA enforces strict human review: automated artificial intelligence is <strong>never</strong> used to assess the truthfulness of disclosures, dismiss safeguarding reports, or make punitive determinations. Disclosures involving active child abuse or statutory offences are referred to appropriate professional bodies (Childline Zimbabwe, Musasa, ZRP Victim Friendly Bureau, or Ministry of Public Service, Labour and Social Welfare) in accordance with mandatory reporting laws.
          </p>
        </div>
      </div>
    </div>
  );
}

