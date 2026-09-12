import React from 'react';
import { Lock, ShieldAlert, Sparkles, CheckCircle2, Clock, X, ArrowRight, CreditCard, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  courseTitle?: string;
  isPendingApproval?: boolean;
}

export const LmsMembershipLockModal: React.FC<Props> = ({
  isOpen,
  onClose,
  courseTitle,
  isPendingApproval
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl border border-slate-200 max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl relative my-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition"
        >
          <X size={18} />
        </button>

        {/* Lock Icon Header */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-3xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-500 mx-auto shadow-lg shadow-amber-500/10">
            <Lock size={32} />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-200 text-[11px] font-black uppercase tracking-wider">
            <Sparkles size={12} className="text-amber-600" />
            <span>Free Trial Completed • Membership Required</span>
          </div>

          <h3 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
            Unlock Full YARA LMS & Coding Academy
          </h3>
          {courseTitle && (
            <p className="text-xs font-bold text-blue-700">
              Target Course: "{courseTitle}"
            </p>
          )}
        </div>

        {/* Friendly Non-Technical Explanation */}
        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3 text-xs text-slate-700 leading-relaxed">
          <p className="font-medium">
            <strong className="text-slate-900 font-bold">Course 1 is 100% Free to Trial for everyone!</strong> You have reached the end of the free trial course.
          </p>
          <p>
            To unlock access to all remaining <strong>42+ Robotics Academy Levels</strong>, <strong>Coding & Web Development Tracks</strong>, and <strong>Hardware Simulator Labs</strong>, you must register as a YARA Member by paying the <strong>$15 USD once-off membership fee</strong> and receiving administrator approval.
          </p>
        </div>

        {/* 3 Step Visual Progress Guide */}
        <div className="p-4 bg-blue-50/60 rounded-2xl border border-blue-100 space-y-2">
          <span className="text-[10px] font-black uppercase text-blue-800 tracking-wider">How Access Works:</span>
          <div className="space-y-1.5 text-xs">
            <div className="flex items-center space-x-2 text-emerald-700 font-bold">
              <CheckCircle2 size={14} className="shrink-0 text-emerald-600" />
              <span>Step 1: Free Trial Course 1 (Done)</span>
            </div>
            <div className={`flex items-center space-x-2 font-bold ${isPendingApproval ? 'text-amber-800' : 'text-blue-800'}`}>
              <Clock size={14} className={`shrink-0 ${isPendingApproval ? 'text-amber-600' : 'text-blue-600'}`} />
              <span>Step 2: $15 YARA Membership & Admin Approval</span>
            </div>
            <div className="flex items-center space-x-2 text-slate-400">
              <Sparkles size={14} className="shrink-0" />
              <span>Step 3: Unlimited LMS Courses & Certified Diploma</span>
            </div>
          </div>
        </div>

        {/* Status or Registration Action */}
        {isPendingApproval ? (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold text-center space-y-1">
            <p className="flex items-center justify-center gap-1.5">
              <Clock size={14} className="text-amber-600 animate-spin" />
              Payment Submitted — Awaiting Admin Approval
            </p>
            <p className="text-[11px] font-normal text-amber-800">
              Your membership payment reference is under review by the YARA administrator team. Access will be unlocked automatically upon approval.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <Link
              to="/educators-portal"
              onClick={onClose}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-blue-500/25 flex items-center justify-center space-x-2 transition-all transform hover:scale-[1.01]"
            >
              <CreditCard size={16} />
              <span>Register & Pay $15 YARA Membership</span>
              <ArrowRight size={16} />
            </Link>

            <button
              onClick={onClose}
              className="w-full py-2 text-xs font-bold text-slate-500 hover:text-slate-800"
            >
              Continue Browsing Free Trial Course 1
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
