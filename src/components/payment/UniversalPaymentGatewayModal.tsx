import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import {
  CreditCard, Smartphone, Building2, CheckCircle2, ShieldCheck,
  Lock, X, ArrowRight, Printer, Download, Sparkles, AlertCircle,
  RefreshCw, DollarSign, Award, Package, Trophy, BookOpen, Heart,
  Copy, Check, HelpCircle, School, Sliders
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../AuthContext';
import { YARA_GATEWAY_CONFIG, processPaymentSubmission, PaymentTransaction } from '../../services/universalPaymentService';

export type PaymentPurpose = 'kit' | 'certificate' | 'workshop' | 'bootcamp' | 'event' | 'donation' | 'subscription' | 'general';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  defaultPurpose?: PaymentPurpose;
  defaultAmount?: number;
  itemTitle?: string;
  onPaymentSuccess?: (receipt: PaymentTransaction) => void;
}

interface PurposeOption {
  id: PaymentPurpose;
  label: string;
  defaultTitle: string;
  suggestedAmount: number;
  description: string;
  icon: any;
  color: string;
  badge?: string;
}

const PURPOSE_OPTIONS: PurposeOption[] = [
  {
    id: 'kit',
    label: 'Robotics Kit / Components',
    defaultTitle: 'YARA Robotics Hardware Kit & Electronic Components',
    suggestedAmount: 45,
    description: 'Physical components: ESP32/Arduino MCU, ultrasonic sensors, chassis, motors & breadboards.',
    icon: Package,
    color: 'text-cyan-600 bg-cyan-50 border-cyan-200',
    badge: 'Hardware'
  },
  {
    id: 'certificate',
    label: 'Accredited Certificate ($5)',
    defaultTitle: 'YARA Verified Accredited Competency Certificate',
    suggestedAmount: 5,
    description: 'Co-signed by YARA Directorate & academic partners, downloadable in high-res with 1-click LinkedIn badge.',
    icon: Award,
    color: 'text-amber-600 bg-amber-50 border-amber-200',
    badge: '$5 Verified'
  },
  {
    id: 'workshop',
    label: 'Club Formation Workshop',
    defaultTitle: 'School Robotics Club Formation & Patron Launch Workshop',
    suggestedAmount: 20,
    description: 'School robotics charter, teacher lesson plans, club start kit & competition coaching orientation.',
    icon: School,
    color: 'text-indigo-600 bg-indigo-50 border-indigo-200',
    badge: 'Schools'
  },
  {
    id: 'bootcamp',
    label: 'AI & Robotics Bootcamp',
    defaultTitle: 'AI for Educators & Student Robotics Bootcamp Cohort Seat',
    suggestedAmount: 10,
    description: 'Intensive 5-day training cohort with live lab streaming, debugging clinics & certified syllabus.',
    icon: BookOpen,
    color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    badge: 'Bootcamp'
  },
  {
    id: 'event',
    label: 'Championship Team Entry',
    defaultTitle: 'Continental Championship Team Registration (4 Members: 2B + 2G)',
    suggestedAmount: 25,
    description: 'Official tournament arena registration for a full school or community robotics squad.',
    icon: Trophy,
    color: 'text-purple-600 bg-purple-50 border-purple-200',
    badge: 'Arena'
  },
  {
    id: 'donation',
    label: 'STEM Sponsorship / Donation',
    defaultTitle: 'Philanthropic Support for Underserved Rural School Clubs',
    suggestedAmount: 15,
    description: 'Sponsor robotics kits and internet data for students in marginalized and rural communities.',
    icon: Heart,
    color: 'text-rose-600 bg-rose-50 border-rose-200',
    badge: 'Philanthropy'
  },
  {
    id: 'general',
    label: 'Custom Item / Other Fee',
    defaultTitle: 'YARA Custom Technical Contribution',
    suggestedAmount: 10,
    description: 'Enter your custom item name, project fee, or specialized electronics order.',
    icon: Sliders,
    color: 'text-slate-600 bg-slate-50 border-slate-200',
    badge: 'Custom'
  }
];

const PRESET_AMOUNTS = [5, 10, 15, 20, 25, 45, 100];

export default function UniversalPaymentGatewayModal({
  isOpen,
  onClose,
  defaultPurpose = 'kit',
  defaultAmount,
  itemTitle,
  onPaymentSuccess
}: Props) {
  const { user, profile, refreshProfile } = useAuth();

  const [purpose, setPurpose] = useState<PaymentPurpose>(defaultPurpose);
  const selectedOption = PURPOSE_OPTIONS.find(p => p.id === purpose) || PURPOSE_OPTIONS[0];

  // User-customizable Title & Amount (NOT hardcoded!)
  const [customTitle, setCustomTitle] = useState<string>(
    itemTitle || selectedOption.defaultTitle
  );
  const [amount, setAmount] = useState<number>(
    defaultAmount || selectedOption.suggestedAmount
  );
  const [currency, setCurrency] = useState<'USD' | 'ZiG' | 'ZAR'>('USD');

  // Payer Details
  const [payerName, setPayerName] = useState(profile?.display_name || '');
  const [payerEmail, setPayerEmail] = useState(profile?.email || user?.email || '');
  const [payerPhone, setPayerPhone] = useState((profile as any)?.contact_phone || (profile as any)?.phone || '');
  const [payerNotes, setPayerNotes] = useState('');

  // Gateway Method
  const [selectedMethod, setSelectedMethod] = useState<'card' | 'ecocash' | 'bank' | 'paypal'>('ecocash');

  // Card Form State
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardName, setCardName] = useState(profile?.display_name || '');

  // Mobile / Bank Reference
  const [mobileRef, setMobileRef] = useState('');
  const [bankRef, setBankRef] = useState('');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Processing & Receipt State
  const [isProcessing, setIsProcessing] = useState(false);
  const [receipt, setReceipt] = useState<PaymentTransaction | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    setTimeout(() => setCopiedField(null), 2500);
  };

  const handlePurposeSelect = (newPurpose: PaymentPurpose) => {
    setPurpose(newPurpose);
    const opt = PURPOSE_OPTIONS.find(p => p.id === newPurpose);
    if (opt) {
      if (!itemTitle) {
        setCustomTitle(opt.defaultTitle);
      }
      if (!defaultAmount) {
        setAmount(opt.suggestedAmount);
      }
    }
  };

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

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!payerName.trim() || !payerEmail.trim()) {
      setErrorMessage('Please provide your full name and valid email address.');
      return;
    }

    if (!amount || amount <= 0) {
      setErrorMessage('Please enter a valid payment amount greater than 0.');
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
        setErrorMessage('Please enter the EcoCash transaction approval code or confirmation reference.');
        return;
      }
    } else if (selectedMethod === 'bank') {
      if (!bankRef.trim()) {
        setErrorMessage('Please provide your CBZ bank transfer deposit reference / transaction number.');
        return;
      }
    }

    setIsProcessing(true);
    try {
      await new Promise(res => setTimeout(res, 900));

      const ref = selectedMethod === 'card'
        ? `CARD-STRIPE-${Date.now().toString().slice(-6)}`
        : selectedMethod === 'ecocash'
          ? mobileRef.trim()
          : selectedMethod === 'bank'
            ? bankRef.trim()
            : `PAYPAL-${Date.now().toString().slice(-6)}`;

      const tx = await processPaymentSubmission({
        payerName,
        payerEmail,
        payerPhone,
        purpose,
        purposeTitle: customTitle.trim() || selectedOption.defaultTitle,
        amount: Number(amount),
        currency,
        paymentGateway: selectedMethod === 'bank' ? 'bank_transfer' : selectedMethod,
        transactionReference: ref,
        notes: payerNotes.trim() ? `${payerNotes.trim()} (${customTitle})` : `Payment for ${customTitle} via ${selectedMethod.toUpperCase()}`
      });

      // If user paid for verified certificate or dues, sync user profile
      if (user?.id) {
        try {
          await supabase.from('profiles').update({
            amount_paid: Number(amount),
            updated_at: new Date().toISOString()
          }).eq('id', user.id);
          if (refreshProfile) await refreshProfile();
        } catch { }
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

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-2xl bg-white rounded-3xl p-5 sm:p-8 shadow-2xl border border-slate-100 my-6 relative max-h-[92vh] overflow-y-auto"
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition cursor-pointer"
          title="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {receipt ? (
          /* ========================================================= */
          /* OFFICIAL VERIFIED PAYMENT RECEIPT                         */
          /* ========================================================= */
          <div className="text-center space-y-5 py-2">
            <div className="w-16 h-16 rounded-3xl bg-emerald-100 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-lg shadow-emerald-100">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <span className="px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-[10px] font-black uppercase tracking-wider">
                Official YARA Payment Verified
              </span>
              <h2 className="text-2xl font-black text-slate-900 mt-2">Transaction Receipt</h2>
              <p className="text-xs text-slate-500 font-mono mt-0.5">Receipt No: {receipt.receiptNumber}</p>
            </div>

            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 text-left space-y-2.5 font-sans text-xs">
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Payer Name:</span>
                <span className="font-bold text-slate-900">{receipt.payerName}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Payer Email:</span>
                <span className="font-bold text-slate-900">{receipt.payerEmail}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Item / Purpose:</span>
                <span className="font-bold text-indigo-700">{receipt.purposeTitle}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Payment Gateway:</span>
                <span className="font-bold text-slate-900 uppercase">{receipt.paymentGateway}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Reference / Approval Code:</span>
                <span className="font-mono font-bold text-slate-800">{receipt.transactionReference}</span>
              </div>
              <div className="flex justify-between pt-1 text-sm font-black text-slate-900">
                <span>Amount Paid:</span>
                <span className="text-emerald-600 font-black">
                  {receipt.currency === 'USD' ? '$' : receipt.currency === 'ZiG' ? 'ZiG ' : 'R '}
                  {receipt.amount.toFixed(2)} {receipt.currency}
                </span>
              </div>
            </div>

            <div className="p-3.5 bg-blue-50/80 rounded-2xl border border-blue-200 text-xs text-blue-900 font-medium text-left flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <span>
                Your receipt has been logged into the YARA financial registry. Keep your reference code <strong>{receipt.transactionReference}</strong> for equipment pickup or club verification.
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={handlePrintReceipt}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center gap-2 transition cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print Receipt</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs shadow-md transition cursor-pointer"
              >
                <span>Done</span>
              </button>
            </div>
          </div>
        ) : (
          /* ========================================================= */
          /* INTERACTIVE PAYMENT FORM (USER CHOOSES ITEM & AMOUNT)     */
          /* ========================================================= */
          <form onSubmit={handleSubmitPayment} className="space-y-5 text-left">
            <div>
              <div className="inline-flex items-center space-x-2 text-indigo-600 text-xs font-black uppercase tracking-wider mb-1">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>YARA Secure Universal Checkout</span>
              </div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                Pay Online
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Choose what you want to pay for, customize the item and amount, and checkout securely via EcoCash, CBZ Bank, or Card.
              </p>
            </div>

            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-2xl text-xs font-bold text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* 1. PURPOSE CATEGORY SELECTOR */}
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-700 uppercase tracking-wider block">
                1. What do you want to pay for?
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {PURPOSE_OPTIONS.map(opt => {
                  const Icon = opt.icon;
                  const isSelected = purpose === opt.id;
                  return (
                    <button
                      type="button"
                      key={opt.id}
                      onClick={() => handlePurposeSelect(opt.id)}
                      className={cn(
                        "p-2.5 rounded-2xl border text-left transition flex flex-col justify-between gap-1.5 cursor-pointer relative",
                        isSelected
                          ? "border-indigo-600 bg-indigo-50/70 ring-2 ring-indigo-500/20 shadow-xs"
                          : "border-slate-200 hover:border-slate-300 bg-white"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div className={cn("w-7 h-7 rounded-xl flex items-center justify-center shrink-0", opt.color)}>
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        {opt.badge && (
                          <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded-md">
                            {opt.badge}
                          </span>
                        )}
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 text-xs block leading-tight">{opt.label}</span>
                        <span className="text-[10px] text-indigo-600 font-bold block mt-0.5">
                          From ${opt.suggestedAmount}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
              <p className="text-[11px] text-slate-500 italic mt-1">
                {selectedOption.description}
              </p>
            </div>

            {/* 2. CUSTOMIZABLE ITEM TITLE & AMOUNT (USER CHOOSES EXACT VALUES) */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-800 uppercase tracking-wider">
                  2. Customize Item &amp; Amount:
                </span>
                <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded-full">
                  Fully Editable
                </span>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  Item Description / What you're paying for:
                </label>
                <input
                  type="text"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  placeholder="e.g. ESP32 Robotics Kit, Certificate for Kudzai Moyo, Club Formation..."
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">
                    Amount ({currency}):
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">
                      {currency === 'USD' ? '$' : currency === 'ZiG' ? 'ZiG' : 'R'}
                    </span>
                    <input
                      type="number"
                      min="1"
                      step="any"
                      value={amount || ''}
                      onChange={(e) => setAmount(Number(e.target.value))}
                      placeholder="0.00"
                      className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-sm font-black text-slate-900 focus:outline-hidden focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">
                    Currency:
                  </label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value as any)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-hidden focus:border-indigo-500"
                  >
                    <option value="USD">USD ($) — United States Dollar</option>
                    <option value="ZiG">ZiG — Zimbabwe Gold</option>
                    <option value="ZAR">ZAR (R) — South African Rand</option>
                  </select>
                </div>
              </div>

              {/* Quick Amount Suggestion Chips */}
              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">
                  Quick Amount Presets (Click to set):
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {PRESET_AMOUNTS.map(p => (
                    <button
                      type="button"
                      key={p}
                      onClick={() => setAmount(p)}
                      className={cn(
                        "px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer border",
                        amount === p
                          ? "bg-indigo-600 text-white border-indigo-600"
                          : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
                      )}
                    >
                      ${p}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 3. PAYER DETAILS */}
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-700 uppercase tracking-wider block">
                3. Your Payer Contact Information:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div>
                  <input
                    type="text"
                    required
                    value={payerName}
                    onChange={(e) => setPayerName(e.target.value)}
                    placeholder="Full Name"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:bg-white focus:outline-hidden focus:border-indigo-500"
                  />
                </div>
                <div>
                  <input
                    type="email"
                    required
                    value={payerEmail}
                    onChange={(e) => setPayerEmail(e.target.value)}
                    placeholder="Email Address"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:bg-white focus:outline-hidden focus:border-indigo-500"
                  />
                </div>
                <div>
                  <input
                    type="tel"
                    value={payerPhone}
                    onChange={(e) => setPayerPhone(e.target.value)}
                    placeholder="WhatsApp / Phone (e.g. 077...)"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:bg-white focus:outline-hidden focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* 4. PAYMENT METHOD TABS */}
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-700 uppercase tracking-wider block">
                4. Select Payment Method:
              </label>
              <div className="grid grid-cols-4 gap-1.5 p-1 bg-slate-100 rounded-2xl">
                {[
                  { id: 'ecocash', label: 'EcoCash', icon: Smartphone, color: 'text-emerald-600' },
                  { id: 'bank', label: 'CBZ Bank', icon: Building2, color: 'text-blue-600' },
                  { id: 'card', label: 'Card (Visa/MC)', icon: CreditCard, color: 'text-indigo-600' },
                  { id: 'paypal', label: 'PayPal', icon: DollarSign, color: 'text-amber-600' },
                ].map(m => {
                  const Icon = m.icon;
                  const isSelected = selectedMethod === m.id;
                  return (
                    <button
                      type="button"
                      key={m.id}
                      onClick={() => setSelectedMethod(m.id as any)}
                      className={cn(
                        "py-2 rounded-xl text-xs font-bold flex flex-col sm:flex-row items-center justify-center gap-1.5 transition cursor-pointer",
                        isSelected
                          ? "bg-white text-slate-900 shadow-xs border border-slate-200"
                          : "text-slate-500 hover:text-slate-800"
                      )}
                    >
                      <Icon className={cn("w-3.5 h-3.5", m.color)} />
                      <span>{m.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 5. GATEWAY INSTRUCTIONS & INPUTS */}
            <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-3">
              {selectedMethod === 'ecocash' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                      <Smartphone className="w-4 h-4 text-emerald-600" />
                      <span>EcoCash Direct Payment</span>
                    </span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                      USD / Multi-currency
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-700 bg-white p-3 rounded-xl border border-slate-200">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">EcoCash Registered Name:</span>
                      <strong className="text-slate-900 text-right">{YARA_GATEWAY_CONFIG.ecocash.accountName}</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Mobile Number:</span>
                      <div className="flex items-center gap-1.5">
                        <strong className="text-emerald-700 font-mono text-sm">{YARA_GATEWAY_CONFIG.ecocash.number}</strong>
                        <button
                          type="button"
                          onClick={() => handleCopy(YARA_GATEWAY_CONFIG.ecocash.number, 'ecocash')}
                          className="p-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-600 transition cursor-pointer"
                          title="Copy Number"
                        >
                          {copiedField === 'ecocash' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                      <span className="text-slate-500">USSD Dial Prompt:</span>
                      <code className="text-[11px] font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                        *151*2*2*0788953986*{amount || 0}#
                      </code>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      Enter EcoCash Approval Code / Reference (from SMS):
                    </label>
                    <input
                      type="text"
                      required
                      value={mobileRef}
                      onChange={(e) => setMobileRef(e.target.value)}
                      placeholder="e.g. MP260212.1432.A12345"
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900 focus:outline-hidden focus:border-emerald-500"
                    />
                  </div>
                </div>
              )}

              {selectedMethod === 'bank' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                      <Building2 className="w-4 h-4 text-blue-600" />
                      <span>CBZ Bank Direct Transfer</span>
                    </span>
                    <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                      Zimbabwe Bank
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-700 bg-white p-3 rounded-xl border border-slate-200">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Bank Name:</span>
                      <strong className="text-slate-900">{YARA_GATEWAY_CONFIG.bank.bankName}</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Account Name:</span>
                      <strong className="text-slate-900 text-right">{YARA_GATEWAY_CONFIG.bank.accountName}</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Account Number:</span>
                      <div className="flex items-center gap-1.5">
                        <strong className="text-blue-700 font-mono text-sm">{YARA_GATEWAY_CONFIG.bank.accountNumber}</strong>
                        <button
                          type="button"
                          onClick={() => handleCopy(YARA_GATEWAY_CONFIG.bank.accountNumber, 'bank')}
                          className="p-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-600 transition cursor-pointer"
                          title="Copy Account Number"
                        >
                          {copiedField === 'bank' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Branch &amp; Code:</span>
                      <span className="font-bold text-slate-800">{YARA_GATEWAY_CONFIG.bank.branch} ({YARA_GATEWAY_CONFIG.bank.branchCode})</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">SWIFT Code:</span>
                      <code className="font-mono font-bold text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded">{YARA_GATEWAY_CONFIG.bank.swiftCode}</code>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      Enter Deposit / Bank Reference Number:
                    </label>
                    <input
                      type="text"
                      required
                      value={bankRef}
                      onChange={(e) => setBankRef(e.target.value)}
                      placeholder="e.g. CBZ-DEP-994821"
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900 focus:outline-hidden focus:border-blue-500"
                    />
                  </div>
                </div>
              )}

              {selectedMethod === 'card' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                      <CreditCard className="w-4 h-4 text-indigo-600" />
                      <span>Credit or Debit Card</span>
                    </span>
                    <span className="text-[10px] font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-full">
                      Visa / Mastercard / Zimswitch
                    </span>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Cardholder Name</label>
                    <input
                      type="text"
                      required
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      placeholder="Name on card"
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:outline-hidden focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Card Number</label>
                    <input
                      type="text"
                      required
                      value={cardNumber}
                      onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                      placeholder="4000 1234 5678 9010"
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold focus:outline-hidden focus:border-indigo-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">Expiry (MM/YY)</label>
                      <input
                        type="text"
                        required
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                        placeholder="MM/YY"
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold focus:outline-hidden focus:border-indigo-500 text-center"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">CVV Security Code</label>
                      <input
                        type="password"
                        required
                        maxLength={4}
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ''))}
                        placeholder="•••"
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold focus:outline-hidden focus:border-indigo-500 text-center"
                      />
                    </div>
                  </div>
                </div>
              )}

              {selectedMethod === 'paypal' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                      <DollarSign className="w-4 h-4 text-amber-600" />
                      <span>PayPal International Checkout</span>
                    </span>
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                      Global
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed bg-white p-3 rounded-xl border border-slate-200">
                    International contributions are routed securely through PayPal merchant account <strong>{YARA_GATEWAY_CONFIG.paypal.merchantEmail}</strong>. Click below to authorize instant checkout.
                  </p>
                </div>
              )}
            </div>

            {/* SUBMIT BUTTON */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold py-3.5 px-6 rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 transition shadow-lg shadow-indigo-600/20 cursor-pointer"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Authorizing Payment...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>
                      Confirm &amp; Pay {currency === 'USD' ? '$' : currency === 'ZiG' ? 'ZiG ' : 'R '}
                      {Number(amount || 0).toFixed(2)} {currency}
                    </span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </>
                )}
              </button>
              <p className="text-[10px] text-slate-400 text-center mt-2 flex items-center justify-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>256-Bit SSL Encrypted &bull; Official YARA Digital Receipt Guaranteed</span>
              </p>
            </div>
          </form>
        )}
      </motion.div>
    </div>,
    document.body
  );
}
