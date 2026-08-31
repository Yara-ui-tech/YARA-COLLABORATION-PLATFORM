import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Printer, ShieldCheck, CheckCircle2, Copy, 
  Download, School, Mail, Phone, Calendar, Hash,
  FileCheck, Sparkles, Building2, Check, Lock, ExternalLink, FileText, Loader2
} from 'lucide-react';
import { EducatorReceiptData } from '../../types/eventRegistration';
import { ASSETS } from '../../constants/assets';
import { printReceiptOnly, downloadReceiptAsHtmlFile, downloadReceiptAsPdf } from '../../utils/receiptPrinter';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  receipt: EducatorReceiptData | null;
}

export default function EducatorReceiptModal({ isOpen, onClose, receipt }: Props) {
  const [copied, setCopied] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const receiptRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !receipt) return null;

  const handleDownloadPdf = async () => {
    try {
      setIsDownloadingPdf(true);
      await downloadReceiptAsPdf(receipt, receiptRef.current);
    } catch (err) {
      console.error('Error generating PDF:', err);
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const handlePrint = () => {
    setIsPrinting(true);
    printReceiptOnly(receipt);
    setTimeout(() => setIsPrinting(false), 800);
  };

  const handleDownloadFile = () => {
    downloadReceiptAsHtmlFile(receipt);
  };

  const handleCopySummary = () => {
    const text = `=== YARA OFFICIAL RECEIPT ===
Receipt No: ${receipt.receipt_number}
Event: ${receipt.event_title}
Attendee: ${receipt.attendee_name}
Institution: ${receipt.school_institution}
Registration Code: ${receipt.registration_code}
Payment Ref: ${receipt.payment_reference}
Payment Method: ${receipt.payment_method}
Amount Paid: $${receipt.total_amount.toFixed(2)} USD
Status: ${receipt.payment_status === 'verified' ? 'VERIFIED & APPROVED' : 'SUBMITTED'}
Issued Date: ${receipt.issue_date}
Authorized by: ${receipt.approved_by_name || 'YARA Executive Administration'}
Verify at: https://yara.org/events/ai-for-educators-bootcamp`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const isVerified = receipt.payment_status === 'verified' || receipt.approval_status === 'approved';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 print:p-0 print:bg-white print:static receipt-modal-wrapper">
        {/* Scoped print styles ensuring ONLY the receipt element is printed */}
        <style dangerouslySetInnerHTML={{ __html: `
          @media print {
            body {
              visibility: hidden !important;
              background: #ffffff !important;
              margin: 0 !important;
              padding: 0 !important;
            }
            #printable-educator-receipt,
            #printable-educator-receipt * {
              visibility: visible !important;
            }
            #printable-educator-receipt {
              position: absolute !important;
              left: 0 !important;
              top: 0 !important;
              width: 100% !important;
              max-width: 100% !important;
              margin: 0 !important;
              padding: 20px !important;
              background: #ffffff !important;
              border: none !important;
              box-shadow: none !important;
              border-radius: 0 !important;
              overflow: visible !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .print\\:hidden,
            .no-print,
            header,
            footer,
            nav {
              display: none !important;
            }
            @page {
              size: portrait;
              margin: 10mm;
            }
          }
        ` }} />

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col my-auto print:border-none print:shadow-none print:max-w-full print:rounded-none"
        >
          {/* Top Control Bar (Hidden when printing) */}
          <div className="p-4 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 print:hidden">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-black text-white leading-tight">Official Payment Receipt</p>
                <p className="text-[10px] text-slate-400">AI for Educators Online Bootcamp</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleCopySummary}
                className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center space-x-1.5 transition-colors cursor-pointer"
                title="Copy receipt details as text"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">{copied ? 'Copied!' : 'Copy'}</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadPdf}
                disabled={isDownloadingPdf}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center space-x-1.5 shadow-md transition-all cursor-pointer disabled:opacity-50"
                title="Download genuine standalone PDF (Receipt ONLY)"
              >
                {isDownloadingPdf ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Download className="w-3.5 h-3.5" />
                )}
                <span>{isDownloadingPdf ? 'Creating PDF...' : 'Download PDF'}</span>
              </button>

              <button
                type="button"
                onClick={handlePrint}
                disabled={isPrinting}
                className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center space-x-1.5 shadow-md transition-all cursor-pointer disabled:opacity-50"
                title="Print receipt strictly without dashboard"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>{isPrinting ? 'Preparing...' : 'Print'}</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadFile}
                className="hidden md:flex px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium items-center space-x-1.5 transition-all border border-slate-700 cursor-pointer"
                title="Download offline standalone HTML receipt"
              >
                <FileText className="w-3.5 h-3.5 text-indigo-300" />
                <span>HTML</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer ml-1"
                title="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* PRINTABLE RECEIPT CONTAINER (Strictly isolated target) */}
          <div 
            id="printable-educator-receipt"
            ref={receiptRef}
            className="p-6 sm:p-10 bg-white text-slate-900 space-y-6 max-h-[85vh] overflow-y-auto print:overflow-visible print:max-h-none print:p-8 print:border-none print:shadow-none"
          >
            {/* Header with Organization Branding & Meta */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b-2 border-slate-900 pb-6">
              <div className="space-y-1.5">
                <div className="flex items-center space-x-2.5">
                  <div className="w-10 h-10 rounded-xl bg-indigo-900 flex items-center justify-center text-white font-black text-lg shadow-sm">
                    {ASSETS.LOGO ? (
                      <img src={ASSETS.LOGO} alt="YARA" className="w-full h-full object-cover rounded-xl" referrerPolicy="no-referrer" />
                    ) : (
                      'Y'
                    )}
                  </div>
                  <div>
                    <h2 className="text-sm font-black uppercase tracking-wider text-slate-900">
                      Young Africans Robotics Association
                    </h2>
                    <p className="text-[10px] font-bold text-amber-700 uppercase tracking-widest">
                      Academic & Educator Development Division
                    </p>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 pt-1">
                  Harare • Bulawayo • Sub-Saharan Regional STEM Network
                </p>
              </div>

              <div className="sm:text-right space-y-1 bg-slate-50 p-3 sm:p-0 sm:bg-transparent rounded-2xl">
                <span className="inline-block px-3 py-1 bg-slate-900 text-white text-[10px] font-black uppercase tracking-wider rounded-lg">
                  Official Receipt
                </span>
                <p className="text-xs font-mono font-black text-slate-900 pt-1">
                  No: {receipt.receipt_number}
                </p>
                <p className="text-[11px] text-slate-600 flex sm:justify-end items-center space-x-1">
                  <Calendar className="w-3 h-3 text-slate-400" />
                  <span>Date: <strong>{receipt.issue_date}</strong></span>
                </p>
              </div>
            </div>

            {/* Event Title Banner */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-950 text-white space-y-1 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-black uppercase tracking-wider text-amber-400 bg-amber-400/20 px-2 py-0.5 rounded border border-amber-400/30">
                  Live Virtual Training Stage
                </span>
                <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                  isVerified 
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                }`}>
                  {isVerified ? '✓ Payment Verified & Approved' : 'Payment Submitted'}
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-black tracking-tight text-white">
                {receipt.event_title}
              </h3>
              <p className="text-xs text-slate-300">
                Course: 5-Day Practical AI Pedagogy, Classroom Automation & Capstone Certification
              </p>
            </div>

            {/* Attendee Details Grid */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Educator / Attendee</span>
                <p className="font-black text-slate-900 text-sm">{receipt.attendee_name}</p>
                <p className="text-slate-600 font-medium">{receipt.role_title || 'Educator / Teacher'}</p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Institution / School</span>
                <p className="font-bold text-slate-900 flex items-center space-x-1">
                  <School className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span>{receipt.school_institution}</span>
                </p>
                <p className="text-slate-500 text-[11px]">{receipt.province || 'Zimbabwe'}</p>
              </div>

              <div className="space-y-1 pt-2 sm:border-t border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Contact Details</span>
                <p className="text-slate-700 flex items-center space-x-1.5">
                  <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                  <span>{receipt.email}</span>
                </p>
                {receipt.phone && (
                  <p className="text-slate-700 flex items-center space-x-1.5">
                    <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                    <span>{receipt.phone}</span>
                  </p>
                )}
              </div>

              <div className="space-y-1 pt-2 sm:border-t border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Assigned Registration Code</span>
                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-1 bg-white border border-indigo-200 text-indigo-900 font-mono font-black rounded-lg text-xs tracking-wider">
                    {receipt.registration_code}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400">Use to enter the Google Meet Hall & download credentials</p>
              </div>
            </div>

            {/* Financial Itemization Table */}
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-700">Payment Breakdown</h4>
              <div className="border border-slate-200 rounded-2xl overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-100 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-2.5 px-4">Item Description</th>
                      <th className="py-2.5 px-4 text-center">Type</th>
                      <th className="py-2.5 px-4 text-right">Amount (USD)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="py-3 px-4">
                        <p className="font-bold text-slate-900">AI for Educators Bootcamp Registration Fee</p>
                        <p className="text-[11px] text-slate-500">Live 5-day interactive training sessions & prompt repository</p>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] font-bold">Standard</span>
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-slate-900">
                        ${receipt.amount_paid.toFixed(2)}
                      </td>
                    </tr>

                    {receipt.continuous_support_opt_in && (
                      <tr>
                        <td className="py-3 px-4">
                          <p className="font-bold text-purple-900">Continuous Support & Termly Prompt Drops</p>
                          <p className="text-[11px] text-slate-500">Quarterly masterclasses, ongoing curriculum drops & educator mentorship</p>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="px-2 py-0.5 bg-purple-100 text-purple-800 rounded text-[10px] font-bold">Termly</span>
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-purple-900">
                          ${(receipt.support_amount || 15).toFixed(2)}
                        </td>
                      </tr>
                    )}
                  </tbody>
                  <tfoot className="bg-slate-50 border-t border-slate-200">
                    <tr>
                      <td colSpan={2} className="py-3 px-4 font-black text-slate-900 text-right uppercase tracking-wider text-[11px]">
                        Total Amount Paid:
                      </td>
                      <td className="py-3 px-4 text-right font-black text-base text-emerald-700">
                        ${receipt.total_amount.toFixed(2)} USD
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Payment Reference & Verification Details */}
            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">Payment Reference / Txn ID</span>
                <p className="font-mono font-black text-slate-900 text-xs">{receipt.payment_reference}</p>
                <p className="text-[10px] text-amber-700">Method: <strong>{receipt.payment_method}</strong></p>
              </div>

              <div className="space-y-0.5">
                <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">Verification Status</span>
                <p className="font-bold text-emerald-800 flex items-center space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Approved & Verified by Administration</span>
                </p>
                <p className="text-[10px] text-slate-500">
                  Officer: <strong>{receipt.approved_by_name || 'YARA Executive Secretariat'}</strong>
                </p>
              </div>
            </div>

            {/* Official Stamp & Signatures */}
            <div className="pt-4 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-6 items-end">
              {/* Circular Seal Simulation */}
              <div className="flex items-center justify-center sm:justify-start">
                <div className="w-24 h-24 rounded-full border-2 border-dashed border-indigo-800 p-1 flex items-center justify-center text-center rotate-[-6deg]">
                  <div className="w-full h-full rounded-full border border-indigo-700 bg-indigo-50/50 flex flex-col items-center justify-center text-[7px] font-bold text-indigo-900 leading-tight uppercase p-1">
                    <span>★ YARA SECRETARIAT ★</span>
                    <span className="font-black text-[9px] text-indigo-950 py-0.5">VERIFIED</span>
                    <span>ACADEMIC 2026</span>
                  </div>
                </div>
              </div>

              {/* Administrative Endorsement */}
              <div className="sm:col-span-2 space-y-3 text-center sm:text-right">
                <div className="space-y-1">
                  <p className="font-serif italic text-base text-slate-800 font-bold">
                    Executive Academic Secretariat
                  </p>
                  <div className="w-48 ml-auto border-t border-slate-400 pt-1">
                    <p className="text-[10px] font-bold text-slate-700 uppercase">
                      YARA Directorate of Education & Outreach
                    </p>
                  </div>
                </div>

                <p className="text-[9px] text-slate-400 leading-relaxed font-mono">
                  Receipt generated automatically upon administrative payment verification. Valid for YARA institutional audit and educational proof of enrollment.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

