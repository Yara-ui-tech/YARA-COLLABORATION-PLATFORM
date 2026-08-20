import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Trophy, Heart, ShieldCheck, CheckCircle2, Sparkles, 
  DollarSign, FileText, Download, Printer, ArrowRight, 
  Users, Layers, Award, BarChart3, Building2, Mail, Phone, Globe
} from 'lucide-react';
import { getSponsors, submitSponsorApplication } from '../../services/competitionEcosystemService';
import { SponsorRecord, SponsorshipTier } from '../../types/competitionEcosystem';

const PACKAGES: {
  id: SponsorshipTier;
  title: string;
  amount: string;
  badge: string;
  description: string;
  benefits: string[];
  recommended?: boolean;
}[] = [
  {
    id: 'title_sponsor',
    title: '🏆 Title Sponsor',
    amount: '$1,000+',
    badge: 'Exclusive Flagship Partner',
    description: 'Premier organizational naming rights, keynote podium address, VIP judging seat, and top-tier branding across all arena materials & live broadcasts.',
    benefits: [
      'Top logo placement on arena test tanks & maze walls',
      'VIP trophy presentation during live award ceremony',
      'Dedicated exhibition booth at the Innovation Complex',
      'Full-page feature in national STEM competition catalog',
      'Direct pipeline to top graduating robotics students'
    ],
    recommended: true
  },
  {
    id: 'gold_sponsor',
    title: '🥇 Gold Sponsor',
    amount: '$500',
    badge: 'Major STEM Benefactor',
    description: 'Directly subsidizes hardware kits and competition fees for 4 underserved provincial school teams.',
    benefits: [
      'Prominent logo on official team jerseys & badges',
      'Named challenge partner for Underwater Drone Challenge',
      'Feature in press releases and national broadcasts',
      'Certificate of High Distinction & framed plaque'
    ]
  },
  {
    id: 'silver_sponsor',
    title: '🥈 Silver Sponsor',
    amount: '$250',
    badge: 'Community Sponsor',
    description: 'Funds arena safety gear, electronic sensors, and travel bursaries for rural student innovators.',
    benefits: [
      'Logo on competition website & live stream lower-thirds',
      'Certificate of Corporate Social Responsibility',
      'Invitation to championship VIP networking dinner'
    ]
  },
  {
    id: 'tech_sponsor',
    title: '🤖 Technology Sponsor',
    amount: 'In-Kind Hardware',
    badge: 'Equipment & Tooling Partner',
    description: 'Donate microcontrollers (ESP32/Arduino), sensors, 3D printing filament, batteries, or drone electronics.',
    benefits: [
      'Official Hardware Supplier designation',
      'Product demo spotlight during technical review',
      'Logo on all technical documentation and schematics'
    ]
  },
  {
    id: 'food_sponsor',
    title: '🍽️ Food Sponsor',
    amount: 'Meals Support',
    badge: 'Hospitality Partner',
    description: 'Provides hot nutritious lunch packs, fruit, and hydration for 120+ participants, mentors, and volunteers.',
    benefits: [
      'Branded lunch pavilion & beverage distribution banners',
      'Special announcement thank-you before meal breaks'
    ]
  },
  {
    id: 'awards_sponsor',
    title: '🏆 Awards Sponsor',
    amount: '$350',
    badge: 'Prizes & Trophies Partner',
    description: 'Supports engraved championship trophies, medals, certificates, and student cash innovation grants.',
    benefits: [
      'Name engraved on Grand Championship trophy base',
      'Present winning certificates on stage'
    ]
  },
  {
    id: 'education_sponsor',
    title: '🎓 Education Sponsor',
    amount: '$400',
    badge: 'Underserved Youth Champion',
    description: 'Covers travel, lodging, and kit sponsorship for rural schools with limited STEM access.',
    benefits: [
      'Direct matching report with sponsored rural school',
      'Impact metrics dossier showcasing student outcomes'
    ]
  }
];

export default function SponsorPortal() {
  const [sponsors, setSponsors] = useState<SponsorRecord[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<SponsorshipTier>('gold_sponsor');
  const [isApplying, setIsApplying] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form State
  const [orgName, setOrgName] = useState('');
  const [contactName, setContactName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [website, setWebsite] = useState('');
  const [amount, setAmount] = useState('500');
  const [targetFocus, setTargetFocus] = useState('Hardware Kits for Rural High Schools');
  const [description, setDescription] = useState('');

  useEffect(() => {
    getSponsors().then(res => {
      setSponsors(res);
      setLoading(false);
    });
  }, []);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount) || 500;

    await submitSponsorApplication({
      organization_name: orgName,
      contact_person: contactName,
      email,
      phone,
      website,
      tier: selectedPackage,
      contribution_type: selectedPackage === 'tech_sponsor' ? 'in_kind' : 'cash',
      committed_amount: numAmount,
      received_amount: numAmount,
      target_focus: targetFocus,
      description: description || 'Supporting national youth robotics innovation for underserved youth.',
      allocations: {
        prizes_amount: Math.round(numAmount * 0.4),
        equipment_amount: Math.round(numAmount * 0.3),
        underserved_subsidies: Math.round(numAmount * 0.2),
        operations_materials: Math.round(numAmount * 0.1)
      }
    });

    setSubmitted(true);
    setIsApplying(false);
    const updated = await getSponsors();
    setSponsors(updated);
  };

  return (
    <div className="space-y-12 pb-16">
      {/* 1. HERO SPONSOR HEADER */}
      <div className="p-8 md:p-12 rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-4">
          <span className="px-3.5 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 text-xs font-black uppercase tracking-wider">
            🤝 Institutional & Corporate Partnership Hub
          </span>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Partner With the YARA Flagship Robotics Championship 2026
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Invest in Africa's next generation of engineers, AI programmers, and hardware inventors. Your sponsorship equips underserved learners with robotics kits, mentorship, and life-changing competition exposure.
          </p>

          <div className="flex flex-wrap gap-4 pt-2">
            <button
              onClick={() => setIsApplying(true)}
              className="px-8 py-4 rounded-2xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg transition-transform hover:scale-105 active:scale-95"
            >
              Apply for Sponsorship
            </button>
            <a
              href="#packages"
              className="px-6 py-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center space-x-2"
            >
              <span>Explore Packages & Impact</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>

      {/* 2. WHY SPONSOR YARA? (VALUE PROPOSITION) */}
      <div className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">Why Sponsor YARA?</h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Measurable, high-impact corporate social investment in STEM education and youth inclusion.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900">Youth STEM Inclusion</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Democratizing high-end robotics tools for talented learners in rural and underserved districts across all 10 provinces.
            </p>
          </div>

          <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <Building2 className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900">CSR & ESG Alignment</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Tangible evidence of corporate social responsibility aligning with UN SDGs (Quality Education, Reduced Inequalities).
            </p>
          </div>

          <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
              <Trophy className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900">Elite Talent Pipeline</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Connect early with the nation's brightest young software programmers, mechanical builders, and problem solvers.
            </p>
          </div>

          <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900">100% Fund Transparency</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Real-time audit dashboard showing itemized allocations towards student prizes, hardware, and travel bursaries.
            </p>
          </div>
        </div>
      </div>

      {/* 3. SPONSORSHIP PACKAGES DIRECTORY */}
      <div id="packages" className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-2xl font-black text-slate-900">Sponsorship Packages & Tiers</h2>
            <p className="text-xs text-slate-500">Select the tier that aligns with your organization's mission.</p>
          </div>
          <button
            onClick={() => setIsApplying(true)}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-sm self-start sm:self-auto"
          >
            Apply for Sponsorship
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {PACKAGES.map((pkg) => (
            <div
              key={pkg.id}
              className={`p-6 rounded-3xl border transition-all flex flex-col justify-between ${
                pkg.recommended
                  ? 'bg-slate-900 text-white border-amber-500 shadow-xl ring-2 ring-amber-400/20'
                  : 'bg-white text-slate-900 border-slate-200 hover:border-indigo-300 shadow-sm'
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full ${
                    pkg.recommended ? 'bg-amber-400 text-slate-950' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {pkg.badge}
                  </span>
                  <span className="text-xl font-black font-mono text-amber-400">{pkg.amount}</span>
                </div>

                <div>
                  <h3 className="text-lg font-bold">{pkg.title}</h3>
                  <p className={`text-xs mt-1 leading-relaxed ${pkg.recommended ? 'text-slate-300' : 'text-slate-500'}`}>
                    {pkg.description}
                  </p>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${pkg.recommended ? 'text-amber-400' : 'text-slate-400'}`}>
                    Benefits Included:
                  </span>
                  <ul className="space-y-1.5 text-xs">
                    {pkg.benefits.map((b, bIdx) => (
                      <li key={bIdx} className="flex items-start space-x-2">
                        <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${pkg.recommended ? 'text-amber-400' : 'text-indigo-600'}`} />
                        <span className={pkg.recommended ? 'text-slate-200' : 'text-slate-600'}>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-6">
                <button
                  onClick={() => {
                    setSelectedPackage(pkg.id);
                    setIsApplying(true);
                  }}
                  className={`w-full py-3 rounded-2xl text-xs font-bold transition-all ${
                    pkg.recommended
                      ? 'bg-amber-400 hover:bg-amber-500 text-slate-950 font-black'
                      : 'bg-slate-100 hover:bg-indigo-600 hover:text-white text-slate-900'
                  }`}
                >
                  Select {pkg.title.split(' ')[1] || 'Package'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. SPONSOR IMPACT & TRANSPARENCY DASHBOARD */}
      <div className="space-y-6">
        <div className="border-b border-slate-200 pb-3">
          <h2 className="text-2xl font-black text-slate-900">Current Sponsors & Fund Transparency</h2>
          <p className="text-xs text-slate-500">Every dollar committed is itemized directly for youth innovation.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {sponsors.map(sponsor => (
            <div key={sponsor.id} className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-bold text-base text-slate-900">{sponsor.organization_name}</h3>
                  <span className="text-[11px] text-slate-400">{sponsor.contact_person}</span>
                </div>
                <span className="px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-full text-xs font-black font-mono">
                  ${sponsor.committed_amount}
                </span>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed italic">
                “{sponsor.description}”
              </p>

              {/* Fund Breakdown Transparency Box */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                <span className="font-bold text-slate-700 block">Where this contribution is going:</span>
                <div className="space-y-1 text-slate-600">
                  <div className="flex justify-between">
                    <span>🏆 Innovation Prizes & Medals</span>
                    <strong className="text-slate-900">${sponsor.allocations.prizes_amount}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>🤖 Hardware & Robotics Equipment</span>
                    <strong className="text-slate-900">${sponsor.allocations.equipment_amount}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>🎓 Underserved School Bursaries</span>
                    <strong className="text-slate-900">${sponsor.allocations.underserved_subsidies}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>📦 Arena & Event Materials</span>
                    <strong className="text-slate-900">${sponsor.allocations.operations_materials}</strong>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 text-[11px] text-slate-400 font-medium">
                <span>Status: <strong className="text-emerald-600 uppercase font-bold">{sponsor.status}</strong></span>
                <span>Verified YARA Partner</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. SPONSOR APPLICATION MODAL */}
      {isApplying && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-xl font-black text-slate-900">Sponsorship Application</h3>
                <p className="text-xs text-slate-500">Partner with YARA Robotics Competition 2026</p>
              </div>
              <button
                onClick={() => setIsApplying(false)}
                className="p-2 rounded-xl text-slate-400 hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleApply} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1 uppercase tracking-wider">Organization Name</label>
                  <input
                    type="text"
                    required
                    value={orgName}
                    onChange={e => setOrgName(e.target.value)}
                    placeholder="e.g. Acme Tech Solutions"
                    className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1 uppercase tracking-wider">Contact Person & Title</label>
                  <input
                    type="text"
                    required
                    value={contactName}
                    onChange={e => setContactName(e.target.value)}
                    placeholder="e.g. Farai Moyo, Head of CSR"
                    className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1 uppercase tracking-wider">Official Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="csr@organization.com"
                    className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1 uppercase tracking-wider">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="+263 77 123 4567"
                    className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1 uppercase tracking-wider">Sponsorship Package</label>
                  <select
                    value={selectedPackage}
                    onChange={e => setSelectedPackage(e.target.value as any)}
                    className="w-full p-3 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  >
                    {PACKAGES.map(p => (
                      <option key={p.id} value={p.id}>{p.title} ({p.amount})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1 uppercase tracking-wider">Amount (USD) or Value</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1 uppercase tracking-wider">Target Focus Area</label>
                <input
                  type="text"
                  value={targetFocus}
                  onChange={e => setTargetFocus(e.target.value)}
                  placeholder="e.g. Subsidizing rural schools, hardware kits, or female engineer awards"
                  className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1 uppercase tracking-wider">Organization Description & Mission</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Tell us about your organization and your vision for supporting young innovators in Africa..."
                  className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div className="pt-4 flex items-center justify-end space-x-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsApplying(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md"
                >
                  Submit Sponsorship Commitment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
