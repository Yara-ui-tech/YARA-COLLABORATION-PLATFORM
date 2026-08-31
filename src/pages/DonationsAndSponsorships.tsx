import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, 
  DollarSign, 
  Cpu, 
  Building, 
  Users, 
  Truck, 
  CheckCircle2, 
  Send, 
  Sparkles, 
  Phone, 
  Mail, 
  MapPin, 
  CreditCard, 
  ShieldCheck, 
  Gift, 
  HelpCircle,
  Clock,
  Award,
  ChevronRight,
  Plus
} from 'lucide-react';
import { 
  DonationSponsorship, 
  SupportType 
} from '../types/partnershipsAndDonations';
import { 
  submitDonationOrSponsorship, 
  getApprovedPublicDonations, 
  YARA_PAYMENT_CONFIG 
} from '../services/partnershipDonationService';

export default function DonationsAndSponsorships() {
  const [supportType, setSupportType] = useState<SupportType>('financial');
  const [donorName, setDonorName] = useState('');
  const [organization, setOrganization] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [amount, setAmount] = useState('50');
  const [currency, setCurrency] = useState('USD');
  const [paymentMethod, setPaymentMethod] = useState('ecocash_0788953986');
  const [transactionReference, setTransactionReference] = useState('');
  const [inKindDescription, setInKindDescription] = useState('');
  const [message, setMessage] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<{ success: boolean; text: string } | null>(null);

  const [approvedDonations, setApprovedDonations] = useState<DonationSponsorship[]>([]);
  const [loadingDonations, setLoadingDonations] = useState(true);

  useEffect(() => {
    fetchApproved();
  }, []);

  const fetchApproved = async () => {
    setLoadingDonations(true);
    try {
      const list = await getApprovedPublicDonations();
      setApprovedDonations(list);
    } catch (e: any) {
      console.warn('Could not load public donations:', e?.message || e);
    } finally {
      setLoadingDonations(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitResult(null);

    try {
      const res = await submitDonationOrSponsorship({
        donor_name: donorName.trim(),
        organization: organization.trim() || undefined,
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        support_type: supportType,
        amount: supportType === 'financial' ? Number(amount) || 0 : undefined,
        currency,
        payment_method: supportType === 'financial' ? paymentMethod : 'in_kind_delivery',
        transaction_reference: transactionReference.trim() || undefined,
        in_kind_description: supportType !== 'financial' ? inKindDescription.trim() : undefined,
        message: message.trim() || undefined,
        is_anonymous: isAnonymous,
        pop_on_homepage: true,
        display_on_wall: true
      });

      if (res.success) {
        setSubmitResult({
          success: true,
          text: 'Thank you for your generous support! Your contribution has been submitted. Our administrators will verify and display it on our public community honors wall.'
        });
        // Reset form
        setDonorName('');
        setOrganization('');
        setEmail('');
        setPhone('');
        setTransactionReference('');
        setInKindDescription('');
        setMessage('');
        fetchApproved();
      } else {
        setSubmitResult({
          success: false,
          text: res.error || 'Failed to submit donation. Please try again or contact us directly.'
        });
      }
    } catch (err: any) {
      setSubmitResult({
        success: false,
        text: err.message || 'An unexpected error occurred.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const supportTypeOptions: { id: SupportType; title: string; icon: any; desc: string }[] = [
    {
      id: 'financial',
      title: 'Financial Contribution',
      icon: DollarSign,
      desc: 'EcoCash, USD cash, or bank wire to fund student hardware kits & prizes.'
    },
    {
      id: 'in_kind_hardware',
      title: 'Robotics Hardware / In-Kind',
      icon: Cpu,
      desc: 'Donate microcontrollers (ESP32/Arduino), motors, sensors, 3D filament or batteries.'
    },
    {
      id: 'venue_pool_facility',
      title: 'Pool / Arena Venue Facility',
      icon: Building,
      desc: 'Provide indoor testing pools for aquatic ROVs or gymnasium spaces.'
    },
    {
      id: 'mentorship_coaching',
      title: 'Pro-Bono Mentorship',
      icon: Users,
      desc: 'Offer expert engineering hours, code reviews, and masterclasses for youth.'
    },
    {
      id: 'student_meals_transport',
      title: 'Meals & Transport Support',
      icon: Truck,
      desc: 'Sponsor bus fares and meals for rural teams traveling to the competition arena.'
    }
  ];

  return (
    <div className="space-y-12 pb-16">
      {/* Hero Header */}
      <section className="relative overflow-hidden rounded-[3rem] bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 border border-slate-800 text-white p-8 md:p-14 shadow-2xl">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-bold uppercase tracking-wider">
            <Heart className="w-3.5 h-3.5 fill-amber-300" />
            <span>Fund the Future of African Youth Robotics</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
            Support, Sponsor & Donate to YARA
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Your generous financial donations and in-kind equipment contributions empower underprivileged youth across Zimbabwe and Africa with robotics kits, mentorship, and world-class STEM opportunities.
          </p>

          {/* Quick EcoCash Strip */}
          <div className="pt-4 flex flex-wrap items-center gap-4">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 px-5 py-3 rounded-2xl flex items-center space-x-3">
              <span className="text-xs text-amber-300 font-bold uppercase">EcoCash Number:</span>
              <span className="font-mono text-base font-black text-white">{YARA_PAYMENT_CONFIG.ecocashNumber}</span>
              <span className="text-[11px] text-slate-300">(Simbarashe Manongwa)</span>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/20 px-5 py-3 rounded-2xl flex items-center space-x-3 text-xs">
              <span className="text-indigo-300 font-bold uppercase">Inquiries:</span>
              <a href={`tel:${YARA_PAYMENT_CONFIG.inquiryPhone1.replace(/\s+/g, '')}`} className="font-mono font-bold text-white hover:underline">
                {YARA_PAYMENT_CONFIG.inquiryPhone1}
              </a>
              <span className="text-slate-400">/</span>
              <a href={`tel:${YARA_PAYMENT_CONFIG.inquiryPhone2.replace(/\s+/g, '')}`} className="font-mono font-bold text-white hover:underline">
                {YARA_PAYMENT_CONFIG.inquiryPhone2}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Main Form & Options Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Form (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-[2.5rem] border border-slate-100 p-6 sm:p-10 shadow-xl shadow-indigo-50/50 space-y-8">
          
          <div>
            <h2 className="text-2xl font-black text-slate-900 flex items-center space-x-2">
              <Gift className="w-6 h-6 text-indigo-600" />
              <span>1. Select Kind of Support</span>
            </h2>
            <p className="text-slate-500 text-xs mt-1">
              Choose how you would like to support YARA educational robotics initiatives.
            </p>
          </div>

          {/* Support Type Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {supportTypeOptions.map(opt => {
              const Icon = opt.icon;
              const isSelected = supportType === opt.id;
              return (
                <button
                  type="button"
                  key={opt.id}
                  onClick={() => setSupportType(opt.id)}
                  className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between space-y-2 ${
                    isSelected 
                      ? 'bg-indigo-50/80 border-indigo-600 shadow-md ring-2 ring-indigo-600/20' 
                      : 'bg-slate-50 hover:bg-white border-slate-200/80'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                      isSelected ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 border border-slate-200'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-indigo-600" />}
                  </div>

                  <div>
                    <h4 className="font-bold text-xs text-slate-900">{opt.title}</h4>
                    <p className="text-[10px] text-slate-500 leading-tight mt-0.5">{opt.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6 pt-4 border-t border-slate-100">
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <span>2. Contribution Details</span>
              </h3>
            </div>

            {submitResult && (
              <div className={`p-4 rounded-2xl flex items-start space-x-3 text-xs font-semibold border ${
                submitResult.success 
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                  : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}>
                {submitResult.success ? <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" /> : <ShieldCheck className="w-5 h-5 shrink-0 text-rose-600" />}
                <p>{submitResult.text}</p>
              </div>
            )}

            {/* Financial Specific Inputs */}
            {supportType === 'financial' && (
              <div className="bg-slate-50 border border-slate-200 rounded-3xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 uppercase">Donation Amount</span>
                  <div className="flex space-x-2">
                    {['15', '50', '100', '250', '500'].map(preset => (
                      <button
                        type="button"
                        key={preset}
                        onClick={() => setAmount(preset)}
                        className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                          amount === preset 
                            ? 'bg-indigo-600 text-white shadow-sm' 
                            : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        ${preset}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Custom Amount</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">$</span>
                      <input
                        type="number"
                        min="1"
                        required
                        value={amount}
                        onChange={e => setAmount(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl pl-7 pr-3 py-2 text-xs font-black text-slate-900 focus:border-indigo-600 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Currency</label>
                    <select
                      value={currency}
                      onChange={e => setCurrency(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:border-indigo-600 focus:outline-none"
                    >
                      <option value="USD">USD ($)</option>
                      <option value="ZiG">ZiG / Local Currency</option>
                      <option value="ZAR">South African Rand (ZAR)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Payment Method</label>
                    <select
                      value={paymentMethod}
                      onChange={e => setPaymentMethod(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:border-indigo-600 focus:outline-none"
                    >
                      <option value="ecocash_0788953986">EcoCash (0788953986)</option>
                      <option value="usd_cash">Cash / Direct Handover</option>
                      <option value="bank_transfer">Direct Bank Transfer</option>
                      <option value="card">Debit / Credit Card</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                    EcoCash / Bank Transaction Reference Code
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. MP2608-XXXX or Bank Ref ID"
                    value={transactionReference}
                    onChange={e => setTransactionReference(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900 focus:border-indigo-600 focus:outline-none"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Please send EcoCash to <strong className="text-slate-700">0788953986 (Simbarashe Manongwa)</strong> and paste the approval code here.
                  </p>
                </div>
              </div>
            )}

            {/* In-Kind & Other Support Inputs */}
            {supportType !== 'financial' && (
              <div className="bg-slate-50 border border-slate-200 rounded-3xl p-5 space-y-3">
                <label className="block text-xs font-bold text-slate-700 uppercase">
                  Description of In-Kind Support, Equipment or Facilities *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="e.g. Offering 15x Arduino Starter Kits, 3D printer spools, underwater pool testing space on weekends, or technical training."
                  value={inKindDescription}
                  onChange={e => setInKindDescription(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-2xl p-3 text-xs text-slate-900 font-medium focus:border-indigo-600 focus:outline-none"
                />
              </div>
            )}

            {/* Donor Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Donor / Sponsor Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Your Full Name or Title"
                  value={donorName}
                  onChange={e => setDonorName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:border-indigo-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Company / Organization (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Tech Foundation or Individual"
                  value={organization}
                  onChange={e => setOrganization(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:border-indigo-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="for acknowledgement & receipt"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:border-indigo-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Phone / WhatsApp Number</label>
                <input
                  type="tel"
                  placeholder="+263 78 895 3986"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:border-indigo-600 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Dedication Message / Words of Encouragement</label>
              <textarea
                rows={2}
                placeholder="Share a supportive note for our young African robotics teams (will be featured on our honors wall)."
                value={message}
                onChange={e => setMessage(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs text-slate-900 focus:border-indigo-600 focus:outline-none"
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="anon"
                checked={isAnonymous}
                onChange={e => setIsAnonymous(e.target.checked)}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <label htmlFor="anon" className="text-xs text-slate-600 font-medium">
                Keep my name anonymous on the public honors wall (display as "Anonymous Benefactor")
              </label>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold py-4 rounded-2xl shadow-xl shadow-indigo-600/20 text-xs uppercase tracking-wider flex items-center justify-center space-x-2 transition hover:scale-[1.01]"
            >
              {isSubmitting ? (
                <span>Submitting Contribution...</span>
              ) : (
                <>
                  <Heart className="w-4 h-4 fill-white" />
                  <span>Submit Donation & Support Request</span>
                </>
              )}
            </button>
          </form>

        </div>

        {/* Right Column: Direct Contact & Wall of Gratitude (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Direct Support Card */}
          <div className="bg-slate-900 text-white rounded-[2.5rem] p-6 sm:p-8 border border-slate-800 space-y-5 shadow-xl">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-300 flex items-center justify-center">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white">Direct Contact & Support</h3>
                <p className="text-[11px] text-slate-400">Speak directly with our leadership</p>
              </div>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700/60 space-y-1">
                <p className="text-[10px] text-slate-400 font-bold uppercase">EcoCash Instant Donation</p>
                <p className="font-mono text-base font-black text-amber-300">{YARA_PAYMENT_CONFIG.ecocashNumber}</p>
                <p className="text-[11px] text-slate-400">Account: <strong className="text-white">Simbarashe Manongwa</strong></p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700/60 space-y-1.5">
                <p className="text-[10px] text-indigo-400 font-bold uppercase">Information & Inquiries</p>
                <div className="space-y-1 font-mono text-xs font-bold text-slate-200">
                  <a href={`tel:${YARA_PAYMENT_CONFIG.inquiryPhone1.replace(/\s+/g, '')}`} className="hover:text-indigo-300 block">
                    {YARA_PAYMENT_CONFIG.inquiryPhone1}
                  </a>
                  <a href={`tel:${YARA_PAYMENT_CONFIG.inquiryPhone2.replace(/\s+/g, '')}`} className="hover:text-indigo-300 block">
                    {YARA_PAYMENT_CONFIG.inquiryPhone2}
                  </a>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700/60 space-y-1">
                <p className="text-[10px] text-slate-400 font-bold uppercase">Official Inquiries Email</p>
                <p className="font-mono text-xs text-indigo-300">{YARA_PAYMENT_CONFIG.contactEmail}</p>
              </div>
            </div>
          </div>

          {/* Public Wall of Gratitude */}
          <div className="bg-white rounded-[2.5rem] p-6 sm:p-8 border border-slate-100 shadow-xl shadow-indigo-50/50 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900 flex items-center space-x-2">
                <Award className="w-4 h-4 text-amber-500" />
                <span>Honors Wall of Supporters</span>
              </h3>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                {approvedDonations.length} Contributions
              </span>
            </div>

            <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
              {loadingDonations ? (
                <p className="text-xs text-slate-400">Loading supporters...</p>
              ) : approvedDonations.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl">
                  Be the first to donate and appear on our public honors wall!
                </div>
              ) : (
                approvedDonations.map(don => (
                  <div 
                    key={don.id}
                    className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 hover:border-indigo-100 transition space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900">
                        {don.is_anonymous ? 'Anonymous Benefactor' : don.donor_name}
                      </span>
                      {don.amount && (
                        <span className="font-mono font-black text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                          +${don.amount} {don.currency || 'USD'}
                        </span>
                      )}
                    </div>

                    {don.organization && (
                      <p className="text-[10px] text-indigo-600 font-semibold">{don.organization}</p>
                    )}

                    {don.in_kind_description && (
                      <p className="text-[11px] text-slate-600 italic leading-snug">
                        "{don.in_kind_description}"
                      </p>
                    )}

                    {don.message && (
                      <p className="text-[11px] text-slate-500 leading-snug">
                        "{don.message}"
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
