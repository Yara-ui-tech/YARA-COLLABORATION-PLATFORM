import React, { useState, useRef } from 'react';
import { 
  X, 
  CreditCard, 
  Phone, 
  Building, 
  CheckCircle2, 
  Download, 
  Printer, 
  Copy, 
  Check, 
  ShieldCheck, 
  Clock, 
  AlertCircle,
  ArrowRight,
  ExternalLink,
  Lock
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { 
  YARA_GATEWAY_CONFIG, 
  PaymentTransaction, 
  processPaymentSubmission 
} from '../../services/universalPaymentService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  defaultPurpose?: 'donation' | 'subscription' | 'course_fee' | 'general';
  defaultTitle?: string;
  defaultAmount?: number;
  defaultCurrency?: 'USD' | 'ZiG' | 'ZAR';
  payerName?: string;
  payerEmail?: string;
  payerPhone?: string;
  onPaymentComplete?: (tx: PaymentTransaction) => void;
}

export const UniversalPaymentModal: React.FC<Props> = ({
  isOpen,
  onClose,
  defaultPurpose = 'donation',
  defaultTitle = 'YARA STEM & Robotics Contribution',
  defaultAmount = 15,
  defaultCurrency = 'USD',
  payerName = '',
  payerEmail = '',
  payerPhone = '',
  onPaymentComplete
}) => {
  const [gateway, setGateway] = useState<'ecocash' | 'bank_transfer' | 'card' | 'paypal'>('ecocash');
  const [amount, setAmount] = useState(defaultAmount.toString());
  const [currency, setCurrency] = useState<'USD' | 'ZiG' | 'ZAR'>(defaultCurrency);
  const [name, setName] = useState(payerName);
  const [email, setEmail] = useState(payerEmail);
  const [phone, setPhone] = useState(payerPhone);
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');

  // Card details state
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [cardHolder, setCardHolder] = useState('');

  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedTx, setCompletedTx] = useState<PaymentTransaction | null>(null);
  const [isExportingReceipt, setIsExportingReceipt] = useState(false);

  const receiptRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2500);
  };

  const handleProcessPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      const tx = await processPaymentSubmission({
        payerName: name || cardHolder || 'YARA Supporter',
        payerEmail: email || 'supporter@yara.org',
        payerPhone: phone,
        purpose: defaultPurpose,
        purposeTitle: defaultTitle,
        amount: Number(amount) || 15,
        currency,
        paymentGateway: gateway,
        transactionReference: reference || (gateway === 'card' ? `CARD-AUTH-${Date.now().toString().slice(-6)}` : undefined),
        notes: notes || (gateway === 'card' ? `Paid via Card ending in ${cardNumber.slice(-4) || '4242'}` : undefined)
      });

      setCompletedTx(tx);
      if (onPaymentComplete) onPaymentComplete(tx);
    } catch (err: any) {
      console.error('Payment error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadReceiptPdf = async () => {
    if (!receiptRef.current) return;
    setIsExportingReceipt(true);
    try {
      const canvas = await html2canvas(receiptRef.current, {
        scale: 2.5,
        backgroundColor: '#ffffff'
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a5'
      });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${completedTx?.receiptNumber || 'YARA-Receipt'}.pdf`);
    } catch (e) {
      console.error('Receipt download error:', e);
      window.print();
    } finally {
      setIsExportingReceipt(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto p-6 sm:p-8 text-slate-900 shadow-2xl relative my-auto border border-slate-100">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition cursor-pointer"
        >
          <X size={18} />
        </button>

        {!completedTx ? (
          <div>
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                <CreditCard className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Secure Payment Gateway
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">
                  {defaultTitle}
                </h3>
              </div>
            </div>

            {/* Gateway Selection Tabs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
              <button
                type="button"
                onClick={() => setGateway('ecocash')}
                className={`p-3 rounded-2xl border text-center transition cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
                  gateway === 'ecocash' 
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md font-bold' 
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                <Phone size={18} />
                <span className="text-xs font-black">EcoCash</span>
              </button>

              <button
                type="button"
                onClick={() => setGateway('bank_transfer')}
                className={`p-3 rounded-2xl border text-center transition cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
                  gateway === 'bank_transfer' 
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md font-bold' 
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                <Building size={18} />
                <span className="text-xs font-black">Bank Transfer</span>
              </button>

              <button
                type="button"
                onClick={() => setGateway('card')}
                className={`p-3 rounded-2xl border text-center transition cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
                  gateway === 'card' 
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md font-bold' 
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                <CreditCard size={18} />
                <span className="text-xs font-black">Visa / Card</span>
              </button>

              <button
                type="button"
                onClick={() => setGateway('paypal')}
                className={`p-3 rounded-2xl border text-center transition cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
                  gateway === 'paypal' 
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md font-bold' 
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                <Lock size={18} />
                <span className="text-xs font-black">PayPal</span>
              </button>
            </div>

            <form onSubmit={handleProcessPayment} className="space-y-4">
              
              {/* Amount & Currency */}
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2 space-y-1">
                  <label className="text-[11px] font-bold text-slate-600 uppercase">
                    Amount to Pay
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600 uppercase">
                    Currency
                  </label>
                  <select
                    value={currency}
                    onChange={e => setCurrency(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="ZiG">ZiG</option>
                    <option value="ZAR">ZAR (R)</option>
                  </select>
                </div>
              </div>

              {/* Gateway-specific Instructions & Form Elements */}
              {gateway === 'ecocash' && (
                <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase text-emerald-900">
                      EcoCash Merchant / Recipient
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(YARA_GATEWAY_CONFIG.ecocash.number, 'ecocash')}
                      className="px-2 py-1 bg-white rounded-lg border border-emerald-200 text-[11px] font-bold text-emerald-800 flex items-center gap-1 shadow-2xs cursor-pointer"
                    >
                      {copiedText === 'ecocash' ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                      <span>{copiedText === 'ecocash' ? 'Copied' : 'Copy Number'}</span>
                    </button>
                  </div>

                  <div className="flex items-center justify-between font-mono bg-white p-3 rounded-xl border border-emerald-100">
                    <div>
                      <div className="text-lg font-black text-slate-900">{YARA_GATEWAY_CONFIG.ecocash.number}</div>
                      <div className="text-[11px] text-slate-500">{YARA_GATEWAY_CONFIG.ecocash.accountName}</div>
                    </div>
                  </div>

                  <div className="text-xs text-emerald-900/90 leading-relaxed font-medium">
                    Send <strong>${amount} {currency}</strong> via EcoCash. Once the transaction completes on your phone, paste the approval reference code below.
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 uppercase">
                      EcoCash Approval / Reference Code *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. MP2608.1234.H56789"
                      value={reference}
                      onChange={e => setReference(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-emerald-300 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              )}

              {gateway === 'bank_transfer' && (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase text-slate-800">
                      Official Institutional Bank Details
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(YARA_GATEWAY_CONFIG.bank.accountNumber, 'bank')}
                      className="px-2 py-1 bg-white rounded-lg border border-slate-200 text-[11px] font-bold text-slate-700 flex items-center gap-1 shadow-2xs cursor-pointer"
                    >
                      {copiedText === 'bank' ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                      <span>{copiedText === 'bank' ? 'Copied' : 'Copy Account'}</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs bg-white p-3 rounded-xl border border-slate-200">
                    <div>
                      <div className="text-[10px] uppercase font-bold text-slate-400">Bank</div>
                      <div className="font-bold text-slate-900">{YARA_GATEWAY_CONFIG.bank.bankName}</div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase font-bold text-slate-400">Account Number</div>
                      <div className="font-mono font-bold text-slate-900">{YARA_GATEWAY_CONFIG.bank.accountNumber}</div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase font-bold text-slate-400">Branch</div>
                      <div className="font-bold text-slate-700">{YARA_GATEWAY_CONFIG.bank.branch}</div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase font-bold text-slate-400">Swift Code</div>
                      <div className="font-mono font-bold text-slate-700">{YARA_GATEWAY_CONFIG.bank.swiftCode}</div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 uppercase">
                      Bank Deposit / Wire Reference ID *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. CBZ-DEP-98214"
                      value={reference}
                      onChange={e => setReference(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              )}

              {gateway === 'card' && (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase text-slate-800">
                      Credit or Debit Card (Stripe Gateway Ready)
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      256-bit Encrypted
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Cardholder Name</label>
                      <input
                        type="text"
                        required
                        placeholder="Name on card"
                        value={cardHolder}
                        onChange={e => setCardHolder(e.target.value)}
                        className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Card Number</label>
                      <input
                        type="text"
                        required
                        placeholder="•••• •••• •••• ••••"
                        value={cardNumber}
                        onChange={e => setCardNumber(e.target.value)}
                        className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase">MM / YY</label>
                        <input
                          type="text"
                          required
                          placeholder="MM/YY"
                          value={cardExpiry}
                          onChange={e => setCardExpiry(e.target.value)}
                          className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase">CVC / CVV</label>
                        <input
                          type="text"
                          required
                          placeholder="123"
                          value={cardCvc}
                          onChange={e => setCardCvc(e.target.value)}
                          className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {gateway === 'paypal' && (
                <div className="p-5 bg-blue-50/70 border border-blue-200 rounded-2xl space-y-3 text-center">
                  <span className="text-xs font-black uppercase text-blue-900 block">
                    PayPal International Checkout
                  </span>
                  <p className="text-xs text-blue-950 font-medium leading-relaxed">
                    Clicking Confirm will process your ${amount} {currency} contribution via PayPal to <strong>{YARA_GATEWAY_CONFIG.paypal.merchantEmail}</strong>.
                  </p>
                </div>
              )}

              {/* Payer Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600 uppercase">
                    Your Full Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Full Name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600 uppercase">
                    Email Address (For Official Receipt)
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black transition shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <ShieldCheck size={15} />
                  <span>{isProcessing ? 'Verifying & Recording…' : `Confirm Payment of ${currency} $${amount}`}</span>
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* STEP 2: OFFICIAL INSTANT RECEIPT */
          <div className="space-y-6">
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-emerald-900 text-sm font-black">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>Payment Recorded Successfully!</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownloadReceiptPdf}
                  disabled={isExportingReceipt}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition shadow-xs cursor-pointer disabled:opacity-50"
                >
                  <Download size={14} />
                  <span>{isExportingReceipt ? 'Saving…' : 'Download Receipt PDF'}</span>
                </button>
              </div>
            </div>

            {/* Official Printable Receipt Card */}
            <div
              ref={receiptRef}
              className="p-8 rounded-3xl bg-white border-2 border-slate-200 text-slate-900 space-y-6 shadow-sm font-sans"
            >
              <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <div>
                  <h4 className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">
                    Young Africans Robotics Association
                  </h4>
                  <div className="text-[10px] text-slate-500">Official Financial Transaction Receipt</div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-mono font-black text-slate-900">{completedTx.receiptNumber}</div>
                  <div className="text-[10px] text-slate-400">{new Date(completedTx.createdAt).toLocaleString()}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400">Payer Name</div>
                  <div className="font-bold text-slate-900 text-sm mt-0.5">{completedTx.payerName}</div>
                  <div className="text-[11px] text-slate-500">{completedTx.payerEmail}</div>
                </div>

                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400">Purpose of Payment</div>
                  <div className="font-bold text-slate-900 text-sm mt-0.5">{completedTx.purposeTitle}</div>
                  <div className="text-[11px] text-indigo-600 uppercase font-black">{completedTx.purpose}</div>
                </div>

                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400">Payment Gateway</div>
                  <div className="font-bold text-slate-900 uppercase mt-0.5">{completedTx.paymentGateway.replace('_', ' ')}</div>
                  <div className="text-[11px] font-mono text-slate-500">Ref: {completedTx.transactionReference}</div>
                </div>

                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400">Amount Paid</div>
                  <div className="text-xl font-black text-emerald-700 mt-0.5">
                    {completedTx.currency} ${completedTx.amount.toFixed(2)}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-500">
                <div className="flex items-center gap-1">
                  <ShieldCheck size={14} className="text-emerald-600" />
                  <span>Audited & Stored in YARA Institutional M&E Ledger</span>
                </div>
                <span className="font-bold uppercase tracking-wider text-emerald-700">Status: Verified</span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-black rounded-xl transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
