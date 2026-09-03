import React, { useState } from 'react';
import { 
  CreditCard, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ShieldCheck, 
  DollarSign, 
  Phone, 
  UploadCloud, 
  FileText, 
  Zap,
  MessageSquare
} from 'lucide-react';

interface Props {
  userId: string;
  userEmail: string;
  subscriptionStatus: {
    isActive: boolean;
    statusText: string;
    tier: string;
  };
}

export const SubscriptionTab: React.FC<Props> = ({
  userId,
  userEmail,
  subscriptionStatus
}) => {
  const [selectedPlan, setSelectedPlan] = useState<'innovator' | 'student'>('innovator');
  const [paymentMethod, setPaymentMethod] = useState<'ecocash' | 'bank' | 'card'>('ecocash');
  const [transactionRef, setTransactionRef] = useState('');
  const [receiptUrl, setReceiptUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleSubmitPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!transactionRef.trim()) return;

    setSubmitting(true);
    setTimeout(() => {
      // Record locally
      const pendingSub = {
        userId,
        userEmail,
        plan: selectedPlan,
        method: paymentMethod,
        ref: transactionRef,
        receiptUrl,
        submittedAt: new Date().toISOString(),
        status: 'awaiting_approval'
      };
      localStorage.setItem(`yara_sub_submission_${userId}`, JSON.stringify(pendingSub));
      setSubmitting(false);
      setSubmitSuccess(true);
    }, 1000);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* 1. Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl">
        <div className="max-w-3xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
            <CreditCard className="w-3.5 h-3.5" /> Institutional Membership & Accreditation
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">YARA Membership & Subscription</h1>
          <p className="text-xs sm:text-sm text-slate-300">
            A valid and verified YARA membership is required for accredited certificate issuance, physical maker-lab workbench access, and subsidized hardware kits.
          </p>
        </div>
      </div>

      {/* 2. Current Status Banner */}
      <div className={`p-6 rounded-3xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs ${
        subscriptionStatus.isActive
          ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
          : 'bg-amber-50 border-amber-200 text-amber-950'
      }`}>
        <div className="flex items-start gap-3.5">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 ${
            subscriptionStatus.isActive ? 'bg-emerald-600' : 'bg-amber-600'
          }`}>
            {subscriptionStatus.isActive ? <CheckCircle2 className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-black">
                {subscriptionStatus.isActive ? 'Active & Approved YARA Membership' : 'Membership Approval Pending'}
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-white/80 border">
                {subscriptionStatus.tier} Tier
              </span>
            </div>
            <p className="text-xs mt-0.5 opacity-90">
              Account: <strong>{userEmail}</strong> • Status: <strong className="uppercase">{subscriptionStatus.statusText}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          <a
            href="https://wa.me/263717468236?text=Hello%20YARA,%20I%20would%20like%20to%20verify%20my%20membership%20subscription"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-white text-slate-900 text-xs font-bold rounded-xl border shadow-xs hover:bg-slate-50 transition flex items-center gap-1.5"
          >
            <MessageSquare className="w-4 h-4 text-emerald-600" />
            <span>Support Helpline (0717468236)</span>
          </a>
        </div>
      </div>

      {/* 3. Pricing Tiers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Innovator Plan */}
        <div 
          onClick={() => setSelectedPlan('innovator')}
          className={`p-6 rounded-3xl border bg-white cursor-pointer transition shadow-xs flex flex-col justify-between ${
            selectedPlan === 'innovator'
              ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-md'
              : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-black uppercase tracking-wider text-emerald-600">Standard Tier</span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black">
                Most Popular
              </span>
            </div>
            <h3 className="text-xl font-black text-slate-900">Annual Innovator Membership</h3>
            <div className="text-2xl font-black text-slate-900 mt-2">$30 <span className="text-xs text-slate-500 font-normal">/ year (or KES 3,900)</span></div>
            <p className="text-xs text-slate-500 mt-2">Comprehensive membership for individual robotics innovators and aspiring engineers.</p>

            <ul className="mt-4 space-y-2 text-xs text-slate-700">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> Full access to all 42 sessions & online simulators</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> Official accredited graduation certificate issuance</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> 20% discount on YARA hardware starter kits</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> Physical maker-lab workbench access & tool usage</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> Admission into YARA 2026 Arena competitions</li>
            </ul>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100">
            <span className={`w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center ${
              selectedPlan === 'innovator' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700'
            }`}>
              {selectedPlan === 'innovator' ? 'Selected Plan' : 'Select Innovator Plan'}
            </span>
          </div>
        </div>

        {/* Student Plan */}
        <div 
          onClick={() => setSelectedPlan('student')}
          className={`p-6 rounded-3xl border bg-white cursor-pointer transition shadow-xs flex flex-col justify-between ${
            selectedPlan === 'student'
              ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-md'
              : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-black uppercase tracking-wider text-indigo-600">Subsidized Tier</span>
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 text-[10px] font-black">
                Students & Youth
              </span>
            </div>
            <h3 className="text-xl font-black text-slate-900">Student Subsidized Membership</h3>
            <div className="text-2xl font-black text-slate-900 mt-2">$15 <span className="text-xs text-slate-500 font-normal">/ year (or KES 1,950)</span></div>
            <p className="text-xs text-slate-500 mt-2">Discounted tier for primary, secondary, and tertiary students with valid student ID.</p>

            <ul className="mt-4 space-y-2 text-xs text-slate-700">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> Full access to all 42 sessions & online simulators</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> Official accredited graduation certificate issuance</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> 10% discount on YARA hardware starter kits</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> Group maker-lab sessions & mentor office hours</li>
            </ul>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100">
            <span className={`w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center ${
              selectedPlan === 'student' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700'
            }`}>
              {selectedPlan === 'student' ? 'Selected Plan' : 'Select Student Plan'}
            </span>
          </div>
        </div>
      </div>

      {/* 4. Payment Submission Form */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
        <h3 className="text-base font-black text-slate-900">
          Payment Reference & Admin Approval Submission
        </h3>

        {submitSuccess ? (
          <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 space-y-2">
            <div className="flex items-center gap-2 text-sm font-black">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>Payment Reference Submitted Successfully!</span>
            </div>
            <p className="text-xs text-emerald-800">
              Your transaction reference (<strong>{transactionRef}</strong>) has been queued for administrator verification. Once verified, your status will turn Active.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmitPayment} className="space-y-5">
            {/* Payment Method Switcher */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-2">Select Payment Channel:</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { id: 'ecocash', title: 'EcoCash / M-Pesa / Mobile', desc: 'Dial 0717468236 / Merchant Code' },
                  { id: 'bank', title: 'Bank Direct Transfer', desc: 'NMB / CBZ / Standard Chartered' },
                  { id: 'card', title: 'Credit Card / PayPal', desc: 'Online instant checkout' }
                ].map(m => (
                  <div
                    key={m.id}
                    onClick={() => setPaymentMethod(m.id as any)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition ${
                      paymentMethod === m.id
                        ? 'bg-emerald-50 border-emerald-500 ring-1 ring-emerald-500 text-emerald-950 font-bold'
                        : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    <div className="text-xs font-bold">{m.title}</div>
                    <div className="text-[10px] text-slate-500 font-normal mt-0.5">{m.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Instruction Box */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1">
              <div className="font-bold text-slate-900">Payment Instructions:</div>
              <p>
                Send payment for the selected <strong>{selectedPlan.toUpperCase()}</strong> plan to YARA via EcoCash / Mobile Money on <strong className="text-slate-900">0717468236</strong>.
              </p>
              <p className="text-[11px] text-slate-500">
                After completing the transfer, enter the confirmation SMS transaction code below and click Submit for instant queuing.
              </p>
            </div>

            {/* Transaction Ref Input */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Transaction Confirmation Code / Ref ID *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. MP260821.1845.A10294"
                  value={transactionRef}
                  onChange={(e) => setTransactionRef(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Receipt Image Link (Optional)
                </label>
                <input
                  type="url"
                  placeholder="https://imgur.com/receipt.jpg"
                  value={receiptUrl}
                  onChange={(e) => setReceiptUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl transition shadow-md shadow-emerald-600/20"
            >
              {submitting ? 'Submitting Reference...' : 'Submit Payment for Administrator Approval'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
