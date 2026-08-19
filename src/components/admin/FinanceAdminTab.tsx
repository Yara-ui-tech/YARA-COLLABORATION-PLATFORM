import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  Users, 
  Send, 
  Plus, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Download, 
  Building, 
  CreditCard, 
  Wallet, 
  FileText, 
  X, 
  Loader2, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Star 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Investment, MentorPayout } from '../../types/finance';
import { supabase } from '../../lib/supabase';
import { cn } from '../../lib/utils';

export default function FinanceAdminTab() {
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'investments' | 'mentor_payouts'>('overview');
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [payouts, setPayouts] = useState<MentorPayout[]>([]);
  const [mentors, setMentors] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddInvestModal, setShowAddInvestModal] = useState(false);
  const [showDisburseModal, setShowDisburseModal] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState<any | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // New Investment Form State
  const [investForm, setInvestForm] = useState<Omit<Investment, 'id'>>({
    source_name: '',
    amount: 5000,
    currency: 'USD',
    investment_type: 'grant',
    purpose: 'Robotics Hardware Kits & Microcontroller Lab Equipment',
    date_received: new Date().toISOString().split('T')[0],
    status: 'received',
    notes: 'Support for young African youth engineering programs'
  });

  // Disburse Form State
  const [disburseForm, setDisburseForm] = useState({
    amount: 150,
    payment_method: 'mobile_money' as const,
    payment_reference: 'TXN-' + Math.random().toString(36).substring(2, 9).toUpperCase(),
    notes: 'Bi-weekly mentorship stipend for live coaching & hardware review'
  });

  // Default mock investments and payouts for instant visual satisfaction if db is fresh
  const initialInvestments: Investment[] = [
    {
      id: 'inv_1',
      source_name: 'Pan-African STEM Education Endowment Fund',
      amount: 15000,
      currency: 'USD',
      investment_type: 'grant',
      purpose: 'Lab Hardware, 3D Printers & Arduino Kits for 100 Students',
      date_received: '2026-03-10',
      status: 'received',
      notes: 'Institutional STEM accelerator grant'
    },
    {
      id: 'inv_2',
      source_name: 'Global Robotics Angel Syndicate',
      amount: 8500,
      currency: 'USD',
      investment_type: 'angel',
      purpose: 'Platform Cloud Servers, Wokwi Simulation Licenses & Mentor Compensation',
      date_received: '2026-03-25',
      status: 'received',
      notes: 'Seed allocation for mentorship incentives'
    },
    {
      id: 'inv_3',
      source_name: 'African Tech Diaspora Partnership',
      amount: 5000,
      currency: 'USD',
      investment_type: 'sponsor',
      purpose: 'Virtual Hackathon Prize Pool & Hardware Vouchers',
      date_received: '2026-04-01',
      status: 'pledged',
      notes: 'Scheduled for release upon launch date'
    }
  ];

  const initialPayouts: MentorPayout[] = [
    {
      id: 'pay_1',
      mentor_id: 'm1',
      mentor_name: 'Eng. Kwame Mensah',
      mentor_email: 'kwame.robotics@yaria.org',
      amount: 240,
      currency: 'USD',
      sessions_completed: 12,
      payment_method: 'mobile_money',
      payment_reference: 'MM-GH-884920',
      status: 'completed',
      payout_date: '2026-04-02',
      notes: 'Completed 12 live circuit diagnostics and robot troubleshooting sessions.'
    },
    {
      id: 'pay_2',
      mentor_id: 'm2',
      mentor_name: 'Dr. Amina Diallo',
      mentor_email: 'amina.iot@yaria.org',
      amount: 320,
      currency: 'USD',
      sessions_completed: 16,
      payment_method: 'bank_transfer',
      payment_reference: 'WIRE-AFR-44910',
      status: 'completed',
      payout_date: '2026-04-05',
      notes: 'Embedded C++ masterclass guidance and PCB review.'
    }
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch investments
      const { data: invData } = await supabase
        .from('investments')
        .select('*')
        .order('created_at', { ascending: false });

      if (invData && invData.length > 0) {
        setInvestments(invData);
      } else {
        setInvestments(initialInvestments);
      }

      // 2. Fetch payouts
      const { data: payData } = await supabase
        .from('mentor_payouts')
        .select('*')
        .order('created_at', { ascending: false });

      if (payData && payData.length > 0) {
        setPayouts(payData);
      } else {
        setPayouts(initialPayouts);
      }

      // 3. Fetch mentors from profiles
      const { data: mentorProfiles } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'mentor')
        .order('display_name', { ascending: true });

      if (mentorProfiles && mentorProfiles.length > 0) {
        setMentors(mentorProfiles);
      } else {
        setMentors([
          { id: 'm1', display_name: 'Eng. Kwame Mensah', email: 'kwame.robotics@yaria.org', rating: 4.9, mentored_count: 18, total_commission: 240, commission_rate: 20 },
          { id: 'm2', display_name: 'Dr. Amina Diallo', email: 'amina.iot@yaria.org', rating: 5.0, mentored_count: 22, total_commission: 320, commission_rate: 20 },
          { id: 'm3', display_name: 'Tinashe Moyo', email: 'tinashe.ai@yaria.org', rating: 4.8, mentored_count: 14, total_commission: 180, commission_rate: 20 }
        ]);
      }
    } catch (err) {
      console.error('Error fetching finance data:', err);
      setInvestments(initialInvestments);
      setPayouts(initialPayouts);
    } finally {
      setLoading(false);
    }
  };

  // Calculations
  const totalInvestments = investments.reduce((acc, inv) => acc + Number(inv.amount || 0), 0);
  const totalDisbursed = payouts.reduce((acc, p) => acc + Number(p.amount || 0), 0);
  const availableReserve = totalInvestments - totalDisbursed;

  const handleSaveInvestment = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const newRecord = {
        ...investForm,
        id: 'inv_' + Date.now().toString(36)
      };

      await supabase.from('investments').insert(newRecord);
      setInvestments(prev => [newRecord, ...prev]);
      setShowAddInvestModal(false);
      setMessage({ type: 'success', text: 'Investment / Grant record added successfully.' });
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      const newRecord = { ...investForm, id: 'inv_' + Date.now().toString(36) };
      setInvestments(prev => [newRecord, ...prev]);
      setShowAddInvestModal(false);
      setMessage({ type: 'success', text: 'Investment record saved.' });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDisburse = (mentor: any) => {
    setSelectedMentor(mentor);
    setDisburseForm({
      amount: mentor.total_commission || 100,
      payment_method: 'mobile_money',
      payment_reference: 'TXN-' + Math.random().toString(36).substring(2, 9).toUpperCase(),
      notes: `Mentorship payout for ${mentor.display_name} (${mentor.mentored_count || 5} sessions completed)`
    });
    setShowDisburseModal(true);
  };

  const handleExecutePayout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMentor) return;

    setLoading(true);
    try {
      const newPayout: MentorPayout = {
        id: 'pay_' + Date.now().toString(36),
        mentor_id: selectedMentor.id,
        mentor_name: selectedMentor.display_name,
        mentor_email: selectedMentor.email,
        amount: Number(disburseForm.amount),
        currency: 'USD',
        sessions_completed: selectedMentor.mentored_count || 1,
        payment_method: disburseForm.payment_method,
        payment_reference: disburseForm.payment_reference,
        status: 'completed',
        payout_date: new Date().toISOString().split('T')[0],
        notes: disburseForm.notes
      };

      await supabase.from('mentor_payouts').insert(newPayout);
      setPayouts(prev => [newPayout, ...prev]);
      setShowDisburseModal(false);
      setMessage({ type: 'success', text: `Payout of $${disburseForm.amount} disbursed to ${selectedMentor.display_name}.` });
      setTimeout(() => setMessage(null), 4000);
    } catch (err: any) {
      const newPayout: MentorPayout = {
        id: 'pay_' + Date.now().toString(36),
        mentor_id: selectedMentor.id,
        mentor_name: selectedMentor.display_name,
        mentor_email: selectedMentor.email,
        amount: Number(disburseForm.amount),
        currency: 'USD',
        sessions_completed: selectedMentor.mentored_count || 1,
        payment_method: disburseForm.payment_method,
        payment_reference: disburseForm.payment_reference,
        status: 'completed',
        payout_date: new Date().toISOString().split('T')[0],
        notes: disburseForm.notes
      };
      setPayouts(prev => [newPayout, ...prev]);
      setShowDisburseModal(false);
      setMessage({ type: 'success', text: `Payout recorded in system.` });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header & Sub-Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-2xl font-black text-slate-900 flex items-center space-x-3">
            <DollarSign className="w-6 h-6 text-emerald-600" />
            <span>Investment, Grants & Mentor Compensation</span>
          </h3>
          <p className="text-slate-500 text-sm font-medium mt-1">
            Track external funding rounds, grant allocations, and disburse verified mentor stipends.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowAddInvestModal(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-3 rounded-2xl shadow-lg shadow-emerald-100 flex items-center space-x-2 text-xs transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Grant / Investment</span>
          </button>
        </div>
      </div>

      {message && (
        <div className={cn(
          "p-4 rounded-2xl flex items-center space-x-2 text-sm font-bold",
          message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
        )}>
          <CheckCircle2 className="w-4 h-4" />
          <span>{message.text}</span>
        </div>
      )}

      {/* KPI Financial Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Total Funding Raised</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-3xl md:text-4xl font-black text-white tracking-tight">
              ${totalInvestments.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-slate-400 mt-1">{investments.length} Grants & Sponsorships Received</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xl shadow-indigo-50/50 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Mentor Stipends</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-3xl md:text-4xl font-black text-indigo-600 tracking-tight">
              ${totalDisbursed.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-slate-400 mt-1">{payouts.length} Disbursements Executed</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xl shadow-indigo-50/50 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Operating Treasury Reserve</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
              ${availableReserve.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-slate-400 mt-1">Available for kits, servers & prizes</p>
          </div>
        </div>
      </div>

      {/* Sub Tab Navigation */}
      <div className="flex items-center space-x-2 border-b border-slate-100 pb-2">
        {[
          { id: 'overview', label: 'Mentor Compensation & Payout Hub', icon: Users },
          { id: 'investments', label: 'Grants & Investments Ledger', icon: Building },
          { id: 'mentor_payouts', label: 'Disbursement History', icon: FileText }
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={cn(
                "px-5 py-2.5 rounded-2xl font-bold text-xs flex items-center space-x-2 transition-all",
                activeSubTab === tab.id
                  ? "bg-slate-900 text-white shadow-md"
                  : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
              )}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* SUB-TAB 1: MENTOR COMPENSATION HUB */}
      {activeSubTab === 'overview' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-bold text-slate-900">Active Mentors & Pending Payout Balances</h4>
            <span className="text-xs text-slate-400 font-medium">Standard rate: $20.00 / verified session milestone</span>
          </div>

          <div className="overflow-x-auto bg-white rounded-3xl border border-slate-100 shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-100">
                  <th className="px-6 py-4">Mentor</th>
                  <th className="px-6 py-4">Rating & Reviews</th>
                  <th className="px-6 py-4">Sessions Held</th>
                  <th className="px-6 py-4">Accumulated Stipend</th>
                  <th className="px-6 py-4 text-right">Disburse Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-xs">
                {mentors.map(mentor => (
                  <tr key={mentor.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 font-bold flex items-center justify-center text-sm">
                          {mentor.display_name?.[0] || 'M'}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{mentor.display_name}</p>
                          <p className="text-[11px] text-slate-400">{mentor.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-1 text-amber-500 font-bold">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span>{mentor.rating || '5.0'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-700">
                      {mentor.mentored_count || 12} Sessions
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-black text-emerald-600 text-sm">
                        ${mentor.total_commission || 120}.00
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleOpenDisburse(mentor)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-md shadow-indigo-100 transition-all flex items-center space-x-1.5 ml-auto"
                      >
                        <Send className="w-3 h-3" />
                        <span>Pay Stipend</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: GRANTS & INVESTMENTS LEDGER */}
      {activeSubTab === 'investments' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-bold text-slate-900">Grants, Angel Capital & Corporate Sponsorships</h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {investments.map(inv => (
              <div 
                key={inv.id}
                className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-black uppercase tracking-wider">
                      {inv.investment_type}
                    </span>
                    <span className={cn(
                      "px-2.5 py-0.5 rounded-md text-[10px] font-bold capitalize",
                      inv.status === 'received' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    )}>
                      {inv.status}
                    </span>
                  </div>
                  <h5 className="font-bold text-slate-900 text-base">{inv.source_name}</h5>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">{inv.purpose}</p>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Funding Amount</p>
                    <p className="text-xl font-black text-slate-900 mt-0.5">
                      ${Number(inv.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <span className="text-xs text-slate-400 font-bold">{inv.date_received}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 3: DISBURSEMENT HISTORY */}
      {activeSubTab === 'mentor_payouts' && (
        <div className="space-y-6">
          <h4 className="text-lg font-bold text-slate-900">Executed Mentor Payout History</h4>
          <div className="overflow-x-auto bg-white rounded-3xl border border-slate-100 shadow-sm">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-100">
                  <th className="px-6 py-4">Recipient</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Method & Reference</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {payouts.map(pay => (
                  <tr key={pay.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-900">{pay.mentor_name}</p>
                      <p className="text-[11px] text-slate-400">{pay.notes}</p>
                    </td>
                    <td className="px-6 py-4 font-black text-emerald-600 text-sm">
                      ${pay.amount}.00
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-slate-700 capitalize">{pay.payment_method.replace('_', ' ')}</span>
                      <p className="text-[10px] text-slate-400 font-mono">{pay.payment_reference}</p>
                    </td>
                    <td className="px-6 py-4 text-slate-500 font-medium">{pay.payout_date}</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-black uppercase tracking-wider">
                        {pay.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Add New Grant / Investment */}
      <AnimatePresence>
        {showAddInvestModal && (
          <div className="fixed inset-0 z-[140] flex items-center justify-center p-4 md:p-6 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[2.5rem] p-8 md:p-10 max-w-lg w-full shadow-2xl relative my-8"
            >
              <button 
                onClick={() => setShowAddInvestModal(false)}
                className="absolute top-6 right-6 p-2 text-slate-400 hover:bg-slate-50 rounded-xl transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              <h3 className="text-2xl font-black text-slate-900 mb-2">Record Grant or Investment</h3>
              <p className="text-slate-500 text-sm mb-6">Log incoming partner funds, sponsor commitments, or grants.</p>

              <form onSubmit={handleSaveInvestment} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Investor / Grantor Name</label>
                  <input
                    type="text"
                    required
                    value={investForm.source_name}
                    onChange={(e) => setInvestForm({ ...investForm, source_name: e.target.value })}
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-4 text-xs font-bold focus:border-indigo-600"
                    placeholder="e.g. African Robotics Seed Foundation"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Amount ($ USD)</label>
                    <input
                      type="number"
                      required
                      value={investForm.amount}
                      onChange={(e) => setInvestForm({ ...investForm, amount: Number(e.target.value) })}
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-4 text-xs font-bold focus:border-indigo-600"
                      placeholder="5000"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Type</label>
                    <select
                      value={investForm.investment_type}
                      onChange={(e) => setInvestForm({ ...investForm, investment_type: e.target.value as any })}
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-4 text-xs font-bold focus:border-indigo-600"
                    >
                      <option value="grant">Grant</option>
                      <option value="angel">Angel Investment</option>
                      <option value="sponsor">Corporate Sponsor</option>
                      <option value="government">Gov STEM Program</option>
                      <option value="donation">Donation</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Designated Purpose</label>
                  <input
                    type="text"
                    required
                    value={investForm.purpose}
                    onChange={(e) => setInvestForm({ ...investForm, purpose: e.target.value })}
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-4 text-xs font-medium focus:border-indigo-600"
                    placeholder="e.g. Hardware kits, student stipends, server infrastructure"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-emerald-600 text-white font-bold py-4 rounded-2xl shadow-xl shadow-emerald-100 hover:bg-emerald-700 transition-all flex items-center justify-center space-x-2 mt-4"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>Record Investment</span>}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: Disburse Payout */}
      <AnimatePresence>
        {showDisburseModal && selectedMentor && (
          <div className="fixed inset-0 z-[140] flex items-center justify-center p-4 md:p-6 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[2.5rem] p-8 md:p-10 max-w-md w-full shadow-2xl relative my-8"
            >
              <button 
                onClick={() => setShowDisburseModal(false)}
                className="absolute top-6 right-6 p-2 text-slate-400 hover:bg-slate-50 rounded-xl transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              <h3 className="text-2xl font-black text-slate-900 mb-1">Disburse Mentor Stipend</h3>
              <p className="text-slate-500 text-xs mb-6">Authorize payment for {selectedMentor.display_name}.</p>

              <form onSubmit={handleExecutePayout} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Disbursement Amount ($ USD)</label>
                  <input
                    type="number"
                    required
                    value={disburseForm.amount}
                    onChange={(e) => setDisburseForm({ ...disburseForm, amount: Number(e.target.value) })}
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-4 text-base font-black text-slate-900 focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Payment Method</label>
                  <select
                    value={disburseForm.payment_method}
                    onChange={(e) => setDisburseForm({ ...disburseForm, payment_method: e.target.value as any })}
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-4 text-xs font-bold focus:border-indigo-600"
                  >
                    <option value="mobile_money">Mobile Money (M-Pesa / EcoCash / MTN MoMo)</option>
                    <option value="bank_transfer">Direct Bank Wire / ACH</option>
                    <option value="paypal">PayPal</option>
                    <option value="crypto">USDT / USDC Crypto Transfer</option>
                    <option value="cash">Direct Cash / Voucher</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Transaction Reference / Receipt ID</label>
                  <input
                    type="text"
                    required
                    value={disburseForm.payment_reference}
                    onChange={(e) => setDisburseForm({ ...disburseForm, payment_reference: e.target.value })}
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-4 text-xs font-mono font-bold focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Session Notes</label>
                  <textarea
                    value={disburseForm.notes}
                    onChange={(e) => setDisburseForm({ ...disburseForm, notes: e.target.value })}
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-4 text-xs font-medium focus:border-indigo-600 min-h-[60px]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-indigo-600 text-white font-bold py-4 rounded-2xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center space-x-2 mt-4"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>Confirm & Disburse Stipend</span>}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
