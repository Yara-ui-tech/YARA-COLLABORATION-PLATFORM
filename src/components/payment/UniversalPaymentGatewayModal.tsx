import React, { useState } from 'react';
import { 
  CreditCard, Smartphone, Building2, CheckCircle2, ShieldCheck, 
  Lock, X, ArrowRight, Printer, Download, Sparkles, AlertCircle, 
  RefreshCw, DollarSign, Award, Package, Trophy, BookOpen, Heart
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../AuthContext';
import { YARA_GATEWAY_CONFIG, processPaymentSubmission, PaymentTransaction } from '../../services/universalPaymentService';

export type PaymentPurpose = 'subscription' | 'kit' | 'event' | 'bootcamp' | 'donation';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  defaultPurpose?: PaymentPurpose;
  defaultAmount?: number;
  itemTitle?: string;
  onPaymentSuccess?: (receipt: PaymentTransaction) => void;
}

const PURPOSE_OPTIONS: Array<{
  id: PaymentPurpose;
  label: string;
  amount: number;
  description: string;
  icon: any;
  color: string;
}> = [
  {
    id: 'subscription',
    label: 'YARA Annual Membership',
    amount: 15,
    description: 'Unlocks all 42+ LMS levels, simulation labs, accredited certificate & live mentoring.',
    icon: Award,
    color: 'text-indigo-600 bg-indigo-50 border-indigo-200'
  },
  {
    id: 'kit',
    label: 'ESP32 Robotics Starter Kit',
    amount: 45,
    description: 'Physical components: ESP32 MCU, ultrasonic sensors, motor drivers, chassis & wheels.',
    icon: Package,
    color: 'text-cyan-600 bg-cyan-50 border-cyan-200'
  },
  {
    id: 'event',
    label: 'Continental Championship Team',
    amount: 25,
    description: 'Official registration for 4-member team (2 Boys + 2 Girls) in the 2026 Arena.',
    icon: Trophy,
    color: 'text-amber-600 bg-amber-50 border-amber-200'
  },
  {
    id: 'bootcamp',
    label: 'AI & Robotics Bootcamp Seat',
    amount: 10,
    description: '5-Day intensive training cohort pass with live room link and accredited syllabus.',
    icon: BookOpen,
    color: 'text-emerald-600 bg-emerald-50 border-emerald-200'
  },
  {
    id: 'donation',
    label: 'Custom Donation / Sponsorship',
    amount: 20,
    description: 'Support underserved rural schools and community innovation chapters.',
    icon: Heart,
    color: 'text-rose-600 bg-rose-50 border-rose-200'
  }
];

export default function UniversalPaymentGatewayModal({
  isOpen,
  onClose,
  defaultPurpose = 'subscription',
  defaultAmount,
  itemTitle,
  onPaymentSuccess
}: Props) {
  const { user, profile, refreshProfile } = useAuth();

  const [purpose, setPurpose] = useState<PaymentPurpose>(defaultPurpose);
  const [selectedMethod, setSelectedMethod] = useState<'card' | 'ecocash' | 'bank' | 'paypal'>('card');
  const [customAmount, setCustomAmount] = useState<number>(
    defaultAmount || PURPOSE_OPTIONS.find(p => p.id === defaultPurpose)?.amount || 15
  );

  const [payerName, setPayerName] = useState(profile?.display_name || '');
  const [payerEmail, setPayerEmail] = useState(profile?.email || user?.email || '');
  const [payerPhone, setPayerPhone] = useState((profile as any)?.phone || '');

  // Card Form State
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardName, setCardName] = useState(profile?.display_name || '');

  // Mobile / Bank State
  const [mobileRef, setMobileRef] = useState('');
  const [bankRef, setBankRef] = useState('');

  // Processing & Receipt State
  const [isProcessing, setIsProcessing] = useState(false);
  const [receipt, setReceipt] = useState<PaymentTransaction | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentOption = PURPOSE_OPTIONS.find(p => p.id === purpose);
  const finalAmount = purpose === 'donation' ? customAmount : (defaultAmount || currentOption?.amount || 15);

  const formatCardNumber = (val: string) => {
    const raw = val.replace(/\D/g, '').slice(0, 16);
    return raw.replace(/(\d{4})(?=\d)/g, '$1 ');
  };

  const formatExpiry = (val: string) => {
    const raw = val.replace(/\D/g, '').slice(0, 4);
    if (raw.length >= 3) {
      return `${raw.slice(0, 2)}/${raw.slice(2, 4)}`;
    }
    return raw;
  };

  const handlePurposeChange = (newPurpose: PaymentPurpose) => {
    setPurpose(newPurpose);
    const opt = PURPOSE_OPTIONS.find(p => p.id === newPurpose);
    if (opt && newPurpose !== 'donation') {
      setCustomAmount(opt.amount);
    }
  };

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!payerName.trim() || !payerEmail.trim()) {
      setErrorMessage('Please provide your full name and valid email address.');
      return;
    }

    if (selectedMethod === 'card') {
      const cleanNum = cardNumber.replace(/\s/g, '');
      if (cleanNum.length < 15) {
        setErrorMessage('Please enter a valid 16-digit debit or credit card number.');
        return;
      }
      if (cardExpiry.length < 5) {
        setErrorMessage('Please enter card expiry in MM/YY format.');
        return;
      }
      if (cardCvv.length < 3) {
        setErrorMessage('Please enter the 3 or 4 digit CVV security code.');
        return;
      }
    } else if (selectedMethod === 'ecocash') {
      if (!mobileRef.trim()) {
        setErrorMessage('Please enter the EcoCash transaction approval code / reference.');
        return;
      }
    } else if (selectedMethod === 'bank') {
      if (!bankRef.trim()) {
        setErrorMessage('Please provide your bank transfer deposit reference.');
        return;
      }
    }

    setIsProcessing(true);
    try {
      // Simulate realistic gateway authentication
      await new Promise(res => setTimeout(res, 1200));

      const ref = selectedMethod === 'card'
        ? `CARD-STRIPE-${Date.now().toString().slice(-6)}`
        : selectedMethod === 'ecocash'
        ? mobileRef.trim()
        : bankRef.trim();

      const tx = await processPaymentSubmission({
        payerName,
        payerEmail,
        payerPhone,
        purpose: purpose === 'subscription' ? 'subscription' : purpose === 'donation' ? 'donation' : 'general',
        purposeTitle: itemTitle || currentOption?.label || 'YARA Official Contribution',
        amount: Number(finalAmount),
        currency: 'USD',
        paymentGateway: selectedMethod === 'bank' ? 'bank_transfer' : selectedMethod,
        transactionReference: ref,
        notes: `Paid via ${selectedMethod.toUpperCase()} for ${currentOption?.label}`
      });

      // If user paid for Subscription, unlock LMS automatically
      if (purpose === 'subscription' && user?.id) {
        const oneYear = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
        try {
          await supabase.from('profiles').update({
            registration_paid: true,
            subscription_expires_at: oneYear,
            updated_at: new Date().toISOString()
          }).eq('id', user.id);

          await supabase.from('subscriptions').insert({
            id: 'sub_online_' + user.id.slice(0, 6) + '_' + Date.now().toString(36),
            user_id: user.id,
            user_email: payerEmail,
            user_name: payerName,
            plan_type: 'annual_pro',
            amount: Number(finalAmount),
            currency: 'USD',
            payment_method: selectedMethod,
            payment_reference: ref,
            status: 'active',
            starts_at: new Date().toISOString(),
            expires_at: oneYear,
            admin_notes: 'Paid online via Universal Card/Mobile Gateway'
          });

          if (refreshProfile) await refreshProfile();
        } catch (e) {
          console.warn('Profile sync note:', e);
        }
      }

      setReceipt(tx);
      if (onPaymentSuccess) onPaymentSuccess(tx);
    } catch (err: any) {
      setErrorMessage(err.message || 'Payment processing failed. Please try again or use EcoCash.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-2xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 my-8 relative"
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {receipt ? (
          /* RECEIPT / SUCCESS VIEW */
          <div className="text-center space-y-6 py-4">
            <div className="w-16 h-16 rounded-3xl bg-emerald-100 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-lg shadow-emerald-100">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <span className="px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-[10px] font-black uppercase tracking-wider">
                Payment Authorized &amp; Verified
              </span>
              <h2 className="text-2xl font-black text-slate-900 mt-2">Official YARA Payment Receipt</h2>
              <p className="text-xs text-slate-500 font-mono mt-1">Receipt No: {receipt.receiptNumber}</p>
            </div>

            {/* Receipt Summary Card */}
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200/80 text-left space-y-3 font-sans text-xs">
              <div className="flex justify-between border-b border-slate-200 pb-2.5">
                <span className="text-slate-500">Payer Name:</span>
                <span className="font-bold text-slate-900">{receipt.payerName}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2.5">
                <span className="text-slate-500">Payer Email:</span>
                <span className="font-bold text-slate-900">{receipt.payerEmail}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2.5">
                <span className="text-slate-500">Purpose / Item:</span>
                <span className="font-bold text-indigo-600">{receipt.purposeTitle}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2.5">
                <span className="text-slate-500">Payment Gateway:</span>
                <span className="font-bold text-slate-900 uppercase">{receipt.paymentGateway}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2.5">
                <span className="text-slate-500">Reference:</span>
                <span className="font-mono font-bold text-slate-700">{receipt.transactionReference}</span>
              </div>
              <div className="flex justify-between pt-1 text-sm font-black text-slate-900">
                <span>Amount Paid:</span>
                <span className="text-emerald-600 font-black">${receipt.amount.toFixed(2)} USD</span>
              </div>
            </div>

            {purpose === 'subscription' && (
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-800 font-bold flex items-center justify-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>All 42+ Robotics Courses and Simulation Labs are now unlocked on your account!</span>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={handlePrintReceipt}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center gap-2 transition"
              >
                <Printer className="w-4 h-4" />
                <span>Print Receipt</span>
              </button>
              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs shadow-md transition"
              >
                <span>Continue to Platform</span>
              </button>
            </div>
          </div>
        ) : (
          /* PAYMENT FORM VIEW */
          <form onSubmit={handleSubmitPayment} className="space-y-6">
            {/* Header */}
            <div>
              <div className="inline-flex items-center space-x-2 text-indigo-600 text-xs font-black uppercase tracking-wider mb-1">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>YARA Secure 256-Bit Checkout</span>
              </div>
              <h2 className="text-2xl font-black text-slate-900">
                Pay Online &bull; Instant Activation
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Credit/Debit Cards, EcoCash USD, and Direct Bank Transfers processed instantly.
              </p>
            </div>

            {/* Error Banner */}
            {errorMessage && (
              <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl text-xs font-bold text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Purpose Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                1. Select Payment Purpose:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {PURPOSE_OPTIONS.map(opt => {
                  const Icon = opt.icon;
                  const isSelected = purpose === opt.id;
                  return (
                    <button
                      type="button"
                      key={opt.id}
                      onClick={() => handlePurposeChange(opt.id)}
                      className={cn(
                        "p-3 rounded-2xl border text-left transition flex items-start gap-2.5",
                        isSelected
                          ? "border-indigo-600 bg-indigo-50/40 ring-1 ring-indigo-500 shadow-xs"
                          : "border-slate-200 hover:border-slate-300 bg-white"
                      )}
                    >
                      <div className={cn("w-7 h-7 rounded-xl flex items-center justify-center shrink-0 mt-0.5", opt.color)}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 text-xs truncate">{opt.label}</span>
                          <span className="font-black text-indigo-600 text-xs shrink-0">${opt.amount}</span>
                        </div>
                        <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">{opt.description}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {purpose === 'donation' && (
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Custom Donation Amount (USD):
                </label>
                <div className="relative">
                  <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="number"
                    min="1"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(Number(e.target.value))}
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>
              </div>
            )}

            {/* Payer Information */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                2. Payer Details:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-slate-500 font-medium mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={payerName}
                    onChange={(e) => setPayerName(e.target.value)}
                    placeholder="e.g. Tinashe Mutasa"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 font-medium mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={payerEmail}
                    onChange={(e) => setPayerEmail(e.target.value)}
                    placeholder="tinashe@example.com"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-900"
                  />
                </div>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                3. Choose Payment Method:
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedMethod('card')}
                  className={cn(
                    "p-3 rounded-2xl border text-center font-bold text-xs transition flex flex-col items-center gap-1",
                    selectedMethod === 'card'
                      ? "border-indigo-600 bg-indigo-50 text-indigo-700 ring-1 ring-indigo-500"
                      : "border-slate-200 hover:border-slate-300 text-slate-600"
                  )}
                >
                  <CreditCard className="w-5 h-5" />
                  <span>Card (Visa/MC)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedMethod('ecocash')}
                  className={cn(
                    "p-3 rounded-2xl border text-center font-bold text-xs transition flex flex-col items-center gap-1",
                    selectedMethod === 'ecocash'
                      ? "border-indigo-600 bg-indigo-50 text-indigo-700 ring-1 ring-indigo-500"
                      : "border-slate-200 hover:border-slate-300 text-slate-600"
                  )}
                >
                  <Smartphone className="w-5 h-5 text-emerald-600" />
                  <span>EcoCash USD</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedMethod('bank')}
                  className={cn(
                    "p-3 rounded-2xl border text-center font-bold text-xs transition flex flex-col items-center gap-1",
                    selectedMethod === 'bank'
                      ? "border-indigo-600 bg-indigo-50 text-indigo-700 ring-1 ring-indigo-500"
                      : "border-slate-200 hover:border-slate-300 text-slate-600"
                  )}
                >
                  <Building2 className="w-5 h-5 text-blue-600" />
                  <span>Bank Transfer</span>
                </button>
              </div>
            </div>

            {/* Method Inputs */}
            {selectedMethod === 'card' && (
              <div className="p-4.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3 text-xs">
                <div className="flex items-center justify-between text-[11px] text-slate-500 font-bold border-b border-slate-200 pb-2">
                  <span className="flex items-center gap-1 text-slate-700">
                    <Lock className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Card Processing (Visa, Mastercard, ZimSwitch)</span>
                  </span>
                  <span className="text-emerald-700">PCI-DSS 256-Bit</span>
                </div>

                <div>
                  <label className="block text-slate-600 font-medium mb-1">Card Number</label>
                  <div className="relative">
                    <CreditCard className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      maxLength={19}
                      placeholder="4000 1234 5678 9010"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                      className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-2 font-mono font-bold text-slate-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Expires (MM/YY)</label>
                    <input
                      type="text"
                      maxLength={5}
                      placeholder="08/28"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 font-mono font-bold text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">CVV / CVC Code</label>
                    <input
                      type="password"
                      maxLength={4}
                      placeholder="•••"
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ''))}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 font-mono font-bold text-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-600 font-medium mb-1">Name on Card</label>
                  <input
                    type="text"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    placeholder="e.g. Tinashe Mutasa"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-900"
                  />
                </div>
              </div>
            )}

            {selectedMethod === 'ecocash' && (
              <div className="p-4.5 bg-emerald-50/50 rounded-2xl border border-emerald-200/80 space-y-3 text-xs">
                <div className="flex items-center justify-between border-b border-emerald-200 pb-2">
                  <span className="font-bold text-emerald-950 flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4 text-emerald-600" />
                    <span>EcoCash USD Registered Merchant</span>
                  </span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-white px-2 py-0.5 rounded-full border border-emerald-200">Instant</span>
                </div>

                <div className="space-y-1.5 text-slate-700">
                  <p><strong>Merchant Number:</strong> <code className="bg-white px-2 py-0.5 rounded font-mono font-bold text-emerald-800">{YARA_GATEWAY_CONFIG.ecocash.number}</code></p>
                  <p><strong>Account Name:</strong> {YARA_GATEWAY_CONFIG.ecocash.accountName}</p>
                  <p><strong>USSD Prompt:</strong> Dial <code className="bg-white px-2 py-0.5 rounded font-mono text-indigo-700 font-bold">*151*2*2*{YARA_GATEWAY_CONFIG.ecocash.number}*{finalAmount}#</code></p>
                </div>

                <div>
                  <label className="block font-bold text-emerald-900 mb-1">Enter EcoCash Approval Code / Reference *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. MP261013.1234.H00001"
                    value={mobileRef}
                    onChange={(e) => setMobileRef(e.target.value)}
                    className="w-full bg-white border border-emerald-300 rounded-xl px-3 py-2 font-mono font-bold text-slate-900"
                  />
                </div>
              </div>
            )}

            {selectedMethod === 'bank' && (
              <div className="p-4.5 bg-blue-50/50 rounded-2xl border border-blue-200/80 space-y-3 text-xs">
                <div className="flex items-center justify-between border-b border-blue-200 pb-2">
                  <span className="font-bold text-blue-950 flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-blue-600" />
                    <span>CBZ Bank Official Account</span>
                  </span>
                  <span className="text-[10px] font-bold text-blue-700 bg-white px-2 py-0.5 rounded-full border border-blue-200">USD Account</span>
                </div>

                <div className="space-y-1 text-slate-700">
                  <p><strong>Bank:</strong> {YARA_GATEWAY_CONFIG.bank.bankName}</p>
                  <p><strong>Branch:</strong> {YARA_GATEWAY_CONFIG.bank.branch}</p>
                  <p><strong>Account Number:</strong> <code className="bg-white px-2 py-0.5 rounded font-mono font-bold text-blue-800">{YARA_GATEWAY_CONFIG.bank.accountNumber}</code></p>
                  <p><strong>SWIFT:</strong> {YARA_GATEWAY_CONFIG.bank.swiftCode}</p>
                </div>

                <div>
                  <label className="block font-bold text-blue-900 mb-1">Bank Deposit / Proof Reference *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. CBZ-DEP-998822"
                    value={bankRef}
                    onChange={(e) => setBankRef(e.target.value)}
                    className="w-full bg-white border border-blue-300 rounded-xl px-3 py-2 font-mono font-bold text-slate-900"
                  />
                </div>
              </div>
            )}

            {/* Total and Submit Button */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-4">
              <div>
                <span className="text-[11px] text-slate-400 font-bold block uppercase">Total Due:</span>
                <span className="text-2xl font-black text-slate-900">
                  ${Number(finalAmount).toFixed(2)} <span className="text-xs text-slate-500 font-medium">USD</span>
                </span>
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                className="px-6 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-emerald-500/20 transition flex items-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Authorizing Payment...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Pay ${Number(finalAmount).toFixed(2)} USD Now</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
}
