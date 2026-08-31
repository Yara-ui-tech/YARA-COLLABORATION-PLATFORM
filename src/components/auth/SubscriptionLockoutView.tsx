import React, { useState } from 'react';
import { 
  Lock, 
  CreditCard, 
  Phone, 
  CheckCircle2, 
  AlertCircle, 
  Send, 
  Sparkles, 
  Clock, 
  RefreshCw,
  LogOut,
  HelpCircle,
  Smartphone
} from 'lucide-react';
import { safeSignOut } from '../../lib/supabase';
import { useAuth } from '../AuthContext';
import { 
  checkAndVerifyUserSubscription, 
  submitSubscriptionPaymentProof, 
  YARA_PAYMENT_CONFIG 
} from '../../services/partnershipDonationService';

interface SubscriptionLockoutViewProps {
  type: 'trial_expired' | 'subscription_expired';
}

export default function SubscriptionLockoutView({ type }: SubscriptionLockoutViewProps) {
  const { user, profile, refreshProfile } = useAuth();
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{
    checked: boolean;
    success: boolean;
    message: string;
  } | null>(null);

  const [showSubmitProof, setShowSubmitProof] = useState(false);
  const [paymentReference, setPaymentReference] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'ecocash_0788953986' | 'usd_cash' | 'bank_transfer'>('ecocash_0788953986');
  const [amount, setAmount] = useState('15');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  const handleCheckDatabaseSubscription = async () => {
    if (!user) return;
    setIsVerifying(true);
    setVerificationResult(null);

    try {
      const result = await checkAndVerifyUserSubscription(user.id, user.email || '');

      if (result.isSubscribed) {
        setVerificationResult({
          checked: true,
          success: true,
          message: 'Subscription verified! Unlocking platform access...'
        });
        if (refreshProfile) {
          await refreshProfile();
        }
        setTimeout(() => {
          window.location.reload();
        }, 800);
      } else {
        setVerificationResult({
          checked: true,
          success: false,
          message: result.message || 'No active payment found in database for this account. Please submit your EcoCash reference below.'
        });
      }
    } catch (err: any) {
      setVerificationResult({
        checked: true,
        success: false,
        message: err.message || 'Verification check could not complete. Please retry or contact support.'
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSubmitProof = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !paymentReference.trim()) return;

    setIsSubmitting(true);
    setSubmitSuccess(null);

    try {
      const res = await submitSubscriptionPaymentProof({
        userId: user.id,
        userEmail: user.email || '',
        userName: profile?.display_name || user.email?.split('@')[0],
        memberId: profile?.member_id || undefined,
        planType: 'course_fee_monthly',
        amount: Number(amount) || 15,
        paymentMethod: paymentMethod === 'ecocash_0788953986' ? 'EcoCash 0788953986' : paymentMethod,
        paymentReference: paymentReference.trim(),
        notes: notes.trim()
      });

      if (res.success) {
        setSubmitSuccess(res.message);
        setPaymentReference('');
        setNotes('');
        // Re-check
        if (refreshProfile) await refreshProfile();
      } else {
        alert(res.message || 'Could not submit payment reference.');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to submit payment reference.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isTrial = type === 'trial_expired';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex items-center justify-center p-4 md:p-8 text-white">
      <div className="max-w-2xl w-full bg-slate-900/90 border border-slate-800 backdrop-blur-xl rounded-[2.5rem] p-6 sm:p-10 shadow-2xl space-y-8">
        
        {/* Top Header & Icon */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 bg-gradient-to-tr from-amber-500 to-amber-300 rounded-3xl flex items-center justify-center text-slate-950 mx-auto shadow-lg shadow-amber-500/20">
            <Lock className="w-8 h-8" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            {isTrial ? 'Trial Period Ended' : 'Subscription Expired'}
          </h2>

          <p className="text-slate-400 text-xs sm:text-sm max-w-md mx-auto leading-relaxed">
            {isTrial 
              ? 'Your 4-day free trial has concluded. To continue accessing the full robotics curriculum, virtual simulators, and live mentorship, please confirm your active subscription.' 
              : `Your previous subscription period has ended (${profile?.subscription_expires_at ? new Date(profile.subscription_expires_at).toLocaleDateString() : 'N/A'}). Please renew to continue.`}
          </p>

          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-[11px] text-slate-300 font-mono">
            <span>Member ID:</span>
            <strong className="text-indigo-400">{profile?.member_id || 'Generating...'}</strong>
            <span className="text-slate-500">|</span>
            <span className="text-slate-400">{user?.email}</span>
          </div>
        </div>

        {/* Status Verification Message Banner */}
        {verificationResult && (
          <div className={`p-4 rounded-2xl flex items-start space-x-3 text-xs font-semibold border ${
            verificationResult.success 
              ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300' 
              : 'bg-amber-950/40 border-amber-500/30 text-amber-300'
          }`}>
            {verificationResult.success ? <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" /> : <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />}
            <div>
              <p className="font-bold">{verificationResult.message}</p>
              {!verificationResult.success && (
                <p className="text-[11px] text-amber-400/80 mt-1">
                  If you paid via EcoCash or bank transfer, please enter your transaction code below for instant verification.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Primary Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={handleCheckDatabaseSubscription}
            disabled={isVerifying}
            className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold py-3.5 px-6 rounded-2xl shadow-lg shadow-indigo-600/30 flex items-center justify-center space-x-2 text-xs transition-all hover:scale-[1.02]"
          >
            {isVerifying ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Checking Database...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>I've Subscribed / Verify Status</span>
              </>
            )}
          </button>

          <button
            onClick={() => setShowSubmitProof(!showSubmitProof)}
            className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold py-3.5 px-6 rounded-2xl flex items-center justify-center space-x-2 text-xs transition-all"
          >
            <CreditCard className="w-4 h-4 text-amber-400" />
            <span>{showSubmitProof ? 'Hide Payment Form' : 'Submit Payment Reference'}</span>
          </button>
        </div>

        {/* EcoCash & Direct Payment Instructions */}
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-5 space-y-4 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-300 uppercase tracking-wider text-[10px] flex items-center space-x-1.5">
              <Smartphone className="w-4 h-4 text-amber-400" />
              <span>Official Payment Instructions (Zimbabwe & Pan-Africa)</span>
            </span>
            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold">
              $15.00 USD / Monthly
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-300">
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
              <p className="text-[10px] text-amber-400 font-bold uppercase">EcoCash & Subscription Line</p>
              <p className="font-mono text-sm font-black text-white">{YARA_PAYMENT_CONFIG.ecocashNumber}</p>
              <p className="text-[11px] text-slate-400">Name: <strong className="text-slate-200">Simbarashe Manongwa</strong></p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
              <p className="text-[10px] text-indigo-400 font-bold uppercase">Info & Inquiries</p>
              <div className="space-y-0.5 font-mono text-xs font-bold text-slate-200">
                <a href={`tel:${YARA_PAYMENT_CONFIG.inquiryPhone1.replace(/\s+/g, '')}`} className="hover:text-indigo-400 block">
                  {YARA_PAYMENT_CONFIG.inquiryPhone1}
                </a>
                <a href={`tel:${YARA_PAYMENT_CONFIG.inquiryPhone2.replace(/\s+/g, '')}`} className="hover:text-indigo-400 block">
                  {YARA_PAYMENT_CONFIG.inquiryPhone2}
                </a>
              </div>
              <p className="text-[10px] text-slate-400">Email: <span className="text-slate-300">{YARA_PAYMENT_CONFIG.contactEmail}</span></p>
            </div>
          </div>
        </div>

        {/* Submit Payment Reference Form */}
        {showSubmitProof && (
          <form onSubmit={handleSubmitProof} className="bg-slate-950 border border-indigo-500/30 rounded-3xl p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <Send className="w-4 h-4 text-indigo-400" />
                <span>Submit Subscription Transaction Reference</span>
              </h3>
            </div>

            {submitSuccess && (
              <div className="p-3 rounded-xl bg-emerald-950/50 border border-emerald-500/40 text-emerald-300 font-semibold">
                {submitSuccess}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-medium focus:border-indigo-500 focus:outline-none"
                >
                  <option value="ecocash_0788953986">EcoCash (0788953986)</option>
                  <option value="usd_cash">USD Cash / In-Person</option>
                  <option value="bank_transfer">Bank Wire / Transfer</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">EcoCash Approval Code / Reference *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. MP2608.1234.H89 or Ref Code"
                  value={paymentReference}
                  onChange={(e) => setPaymentReference(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono font-bold focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Additional Notes / Sender Name (Optional)</label>
              <input
                type="text"
                placeholder="Sender name on EcoCash or special note"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-medium focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center space-x-2"
            >
              {isSubmitting ? (
                <span>Submitting Reference...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Submit Payment for Approval</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* Footer & Sign Out */}
        <div className="pt-2 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-400">
          <span>Inquiries: <strong className="text-slate-200">{YARA_PAYMENT_CONFIG.inquiryPhone1}</strong> / <strong className="text-slate-200">{YARA_PAYMENT_CONFIG.inquiryPhone2}</strong> • EcoCash: <strong className="text-amber-300">{YARA_PAYMENT_CONFIG.ecocashNumber}</strong></span>
          <button
            onClick={() => safeSignOut()}
            className="text-rose-400 hover:text-rose-300 font-bold flex items-center space-x-1 transition-colors self-start sm:self-auto"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>

      </div>
    </div>
  );
}
