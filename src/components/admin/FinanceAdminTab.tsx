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
  Star,
  Printer,
  PieChart,
  Percent,
  Search,
  Filter,
  UserCheck,
  ShieldCheck,
  Sparkles,
  Info,
  Save,
  Edit2,
  Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Investment, MentorPayout } from '../../types/finance';
import { StipendSlip, NpoBudgetPercentages, RecipientCategory } from '../../types/stipends';
import { stipendService } from '../../services/stipendService';
import { downloadStipendSlipPdf, printStipendSlip } from '../../utils/stipendSlipPrinter';
import { supabase } from '../../lib/supabase';
import { cn } from '../../lib/utils';
import { useAuth } from '../AuthContext';

export default function FinanceAdminTab() {
  const { profile } = useAuth();
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'npo_budget' | 'stipend_slips' | 'investments'>('overview');
  
  // Data States
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [payouts, setPayouts] = useState<MentorPayout[]>([]);
  const [stipendSlips, setStipendSlips] = useState<StipendSlip[]>([]);
  const [personnel, setPersonnel] = useState<any[]>([]);
  const [budgetPercentages, setBudgetPercentages] = useState<NpoBudgetPercentages>({
    direct_program_stipends_percent: 50,
    allowances_percent: 15,
    travel_and_subsistence_percent: 15,
    hardware_and_equipment_percent: 10,
    admin_and_governance_percent: 10
  });

  const [loading, setLoading] = useState(false);
  const [savingBudget, setSavingBudget] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [slipRoleFilter, setSlipRoleFilter] = useState<string>('all');

  // Modals
  const [showAddInvestModal, setShowAddInvestModal] = useState(false);
  const [showDisburseModal, setShowDisburseModal] = useState(false);
  const [selectedRecipient, setSelectedRecipient] = useState<any | null>(null);
  const [selectedSlipForPreview, setSelectedSlipForPreview] = useState<StipendSlip | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // New Investment Form
  const [investForm, setInvestForm] = useState<Omit<Investment, 'id'>>({
    source_name: '',
    amount: 1000,
    currency: 'USD',
    investment_type: 'grant',
    purpose: 'Robotics Hardware Kits & Microcontroller Lab Equipment',
    date_received: new Date().toISOString().split('T')[0],
    status: 'received',
    notes: ''
  });

  // Disburse Stipend Form
  const [disburseForm, setDisburseForm] = useState({
    recipient_role: 'mentor' as RecipientCategory,
    base_stipend: 100,
    allowance_amount: 30,
    travel_subsistence_ts: 20,
    withholding_deductions: 0,
    budget_category: 'program_stipends' as StipendSlip['budget_category'],
    payment_method: 'mobile_money' as StipendSlip['payment_method'],
    payment_reference: 'TXN-' + Math.random().toString(36).substring(2, 9).toUpperCase(),
    notes: 'Program instruction & technical robotics coaching delivery'
  });

  // Stipend Slip Modal State (Add custom slip from scratch or edit all sections)
  const [showSlipModal, setShowSlipModal] = useState(false);
  const [isEditingSlip, setIsEditingSlip] = useState(false);
  const [slipFormData, setSlipFormData] = useState<StipendSlip>({
    id: '',
    recipient_id: '',
    recipient_name: '',
    recipient_role: 'mentor',
    member_id: 'YARA-MEM-001',
    recipient_email: '',
    recipient_phone: '',
    base_stipend: 150,
    allowance_amount: 40,
    travel_subsistence_ts: 25,
    withholding_deductions: 0,
    gross_amount: 215,
    net_amount_received: 215,
    currency: 'USD',
    budget_category: 'program_stipends',
    payment_method: 'bank_transfer',
    payment_reference: 'YARA-TXN-' + Math.random().toString(36).substring(2, 9).toUpperCase(),
    disbursement_date: new Date().toISOString().split('T')[0],
    status: 'completed',
    notes: 'Program instruction, lab assembly defense, & technical mentoring.',
    approved_by_admin: 'YARA Treasury Directorate',
    created_at: new Date().toISOString()
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch investments
      let storedInv: Investment[] = [];
      try {
        const rawInv = localStorage.getItem('yaria_investments');
        if (rawInv) storedInv = JSON.parse(rawInv);
      } catch {}

      const { data: invData, error: invError } = await supabase
        .from('investments')
        .select('*')
        .order('created_at', { ascending: false });

      if (!invError && invData && invData.length > 0) {
        setInvestments(invData);
        localStorage.setItem('yaria_investments', JSON.stringify(invData));
      } else {
        setInvestments(storedInv);
      }

      // 2. Fetch stipend slips
      const slips = await stipendService.getAllStipends();
      setStipendSlips(slips);

      // 3. Fetch budget percentages
      const budget = await stipendService.getBudgetPercentages();
      setBudgetPercentages(budget);

      // 4. Fetch personnel (mentors, employees, trainers, coaches, volunteers)
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('*')
        .in('role', ['mentor', 'employee', 'trainer', 'coach', 'educator', 'admin', 'volunteer'])
        .order('display_name', { ascending: true });

      if (profilesData && profilesData.length > 0) {
        setPersonnel(profilesData);
      } else {
        // Fallback default mock mentors if empty
        setPersonnel([
          {
            id: 'm-1',
            display_name: 'Eng. Tinashe Moyo',
            email: 'tinashe@yara.org',
            role: 'mentor',
            member_id: 'YARA-2026-M01',
            mentored_count: 14,
            rating: '4.9',
            total_commission: 150
          },
          {
            id: 'm-2',
            display_name: 'Farai Chidzero',
            email: 'farai.trainer@yara.org',
            role: 'trainer',
            member_id: 'YARA-2026-TR02',
            mentored_count: 18,
            rating: '5.0',
            total_commission: 180
          },
          {
            id: 'm-3',
            display_name: 'Nyasha Ruzvidzo',
            email: 'nyasha.emp@yara.org',
            role: 'employee',
            member_id: 'YARA-2026-EMP03',
            mentored_count: 22,
            rating: '4.8',
            total_commission: 250
          }
        ]);
      }
    } catch (err) {
      console.warn('Finance data load status:', err);
    } finally {
      setLoading(false);
    }
  };

  // Financial KPI calculations
  const totalInvestments = investments.reduce((acc, inv) => acc + Number(inv.amount || 0), 0);
  const totalStipendsDisbursed = stipendSlips.reduce((acc, s) => acc + Number(s.net_amount_received || 0), 0);
  const availableReserve = totalInvestments - totalStipendsDisbursed;

  // NPO Dynamic Budget Calculations based on Total Raised
  const budgetAllocationStipends = (totalInvestments * (budgetPercentages.direct_program_stipends_percent / 100));
  const budgetAllocationAllowances = (totalInvestments * (budgetPercentages.allowances_percent / 100));
  const budgetAllocationTS = (totalInvestments * (budgetPercentages.travel_and_subsistence_percent / 100));
  const budgetAllocationHardware = (totalInvestments * (budgetPercentages.hardware_and_equipment_percent / 100));
  const budgetAllocationAdmin = (totalInvestments * (budgetPercentages.admin_and_governance_percent / 100));

  // Current actual expenditures in categories
  const actualStipendSpent = stipendSlips.reduce((acc, s) => acc + Number(s.base_stipend || 0), 0);
  const actualAllowanceSpent = stipendSlips.reduce((acc, s) => acc + Number(s.allowance_amount || 0), 0);
  const actualTSSpent = stipendSlips.reduce((acc, s) => acc + Number(s.travel_subsistence_ts || 0), 0);

  const handleSaveBudgetPercentages = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingBudget(true);
    try {
      const sum = 
        Number(budgetPercentages.direct_program_stipends_percent) +
        Number(budgetPercentages.allowances_percent) +
        Number(budgetPercentages.travel_and_subsistence_percent) +
        Number(budgetPercentages.hardware_and_equipment_percent) +
        Number(budgetPercentages.admin_and_governance_percent);

      if (Math.round(sum) !== 100) {
        alert(`Budget percentages must total exactly 100%. Current total: ${sum}%`);
        setSavingBudget(false);
        return;
      }

      await stipendService.saveBudgetPercentages(budgetPercentages);
      setMessage({ type: 'success', text: 'NPO budget allocation percentages updated & persisted.' });
      setTimeout(() => setMessage(null), 4000);
    } catch {
      setMessage({ type: 'error', text: 'Failed to save budget settings.' });
    } finally {
      setSavingBudget(false);
    }
  };

  const handleOpenDisburse = (person: any) => {
    setSelectedRecipient(person);

    // Auto-calculate smart defaults based on role and NPO guidance
    const baseDefault = person.role === 'employee' ? 200 : person.role === 'trainer' ? 120 : 100;
    const allowanceDefault = Math.round(baseDefault * (budgetPercentages.allowances_percent / budgetPercentages.direct_program_stipends_percent));
    const tsDefault = Math.round(baseDefault * (budgetPercentages.travel_and_subsistence_percent / budgetPercentages.direct_program_stipends_percent));

    let detectedRole: RecipientCategory = 'mentor';
    if (person.role === 'employee' || person.role === 'trainer' || person.role === 'coach' || person.role === 'volunteer') {
      detectedRole = person.role as RecipientCategory;
    }

    setDisburseForm({
      recipient_role: detectedRole,
      base_stipend: baseDefault,
      allowance_amount: allowanceDefault || 25,
      travel_subsistence_ts: tsDefault || 20,
      withholding_deductions: 0,
      budget_category: 'program_stipends',
      payment_method: 'mobile_money',
      payment_reference: 'TXN-' + Math.random().toString(36).substring(2, 9).toUpperCase(),
      notes: `${person.display_name} - Verified sessions and training modules milestone compensation`
    });
    setShowDisburseModal(true);
  };

  const handleExecuteStipendDisbursement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRecipient) return;

    setLoading(true);
    try {
      const gross = Number(disburseForm.base_stipend) + Number(disburseForm.allowance_amount) + Number(disburseForm.travel_subsistence_ts);
      const net = Math.max(0, gross - Number(disburseForm.withholding_deductions));

      const newSlip = await stipendService.createStipendSlip({
        recipient_id: selectedRecipient.id,
        recipient_name: selectedRecipient.display_name || 'YARA Team Member',
        recipient_email: selectedRecipient.email || '',
        recipient_phone: selectedRecipient.contact_phone || '',
        recipient_role: disburseForm.recipient_role,
        member_id: selectedRecipient.member_id || `YARA-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
        currency: 'USD',
        base_stipend: Number(disburseForm.base_stipend),
        allowance_amount: Number(disburseForm.allowance_amount),
        travel_subsistence_ts: Number(disburseForm.travel_subsistence_ts),
        gross_amount: gross,
        withholding_deductions: Number(disburseForm.withholding_deductions),
        net_amount_received: net,
        budget_category: disburseForm.budget_category,
        payment_method: disburseForm.payment_method,
        payment_reference: disburseForm.payment_reference,
        disbursement_date: new Date().toISOString().split('T')[0],
        status: 'completed',
        approved_by_admin: profile?.display_name || 'YARA Treasury Directorate',
        notes: disburseForm.notes
      });

      setStipendSlips(prev => [newSlip, ...prev]);
      setShowDisburseModal(false);

      // Offer immediate slip download/preview
      setSelectedSlipForPreview(newSlip);
      setMessage({
        type: 'success',
        text: `Stipend of $${net.toFixed(2)} USD disbursed to ${selectedRecipient.display_name}. Slip generated automatically.`
      });
      setTimeout(() => setMessage(null), 5000);
    } catch (err: any) {
      setMessage({ type: 'error', text: 'Failed to record disbursement: ' + (err.message || 'Unknown error') });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveInvestment = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const generatedId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'inv_' + Date.now().toString(36);
      const newRecord: Investment = {
        ...investForm,
        id: generatedId,
        amount: Number(investForm.amount)
      };

      const updated = [newRecord, ...investments];
      setInvestments(updated);
      localStorage.setItem('yaria_investments', JSON.stringify(updated));

      try {
        await supabase.from('investments').insert({
          id: generatedId,
          source_name: newRecord.source_name,
          amount: newRecord.amount,
          currency: newRecord.currency,
          investment_type: newRecord.investment_type,
          purpose: newRecord.purpose,
          date_received: newRecord.date_received,
          status: newRecord.status,
          notes: newRecord.notes
        });
      } catch {}

      setShowAddInvestModal(false);
      setInvestForm({
        source_name: '',
        amount: 1000,
        currency: 'USD',
        investment_type: 'grant',
        purpose: 'Robotics Hardware Kits & Microcontroller Lab Equipment',
        date_received: new Date().toISOString().split('T')[0],
        status: 'received',
        notes: ''
      });
      setMessage({ type: 'success', text: 'Investment / Grant record added successfully.' });
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      setMessage({ type: 'error', text: 'Could not record investment: ' + (err.message || 'Unknown error') });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateSlip = () => {
    setIsEditingSlip(false);
    const newId = `STP-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    setSlipFormData({
      id: newId,
      recipient_id: 'REC-' + Math.random().toString(36).substring(2, 7),
      recipient_name: '',
      recipient_role: 'mentor',
      member_id: `YARA-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      recipient_email: '',
      recipient_phone: '',
      base_stipend: 150,
      allowance_amount: 40,
      travel_subsistence_ts: 25,
      withholding_deductions: 0,
      gross_amount: 215,
      net_amount_received: 215,
      currency: 'USD',
      budget_category: 'program_stipends',
      payment_method: 'bank_transfer',
      payment_reference: 'TXN-' + Math.random().toString(36).substring(2, 9).toUpperCase(),
      disbursement_date: new Date().toISOString().split('T')[0],
      status: 'completed',
      notes: 'Program instruction, lab assembly defense, & technical mentoring.',
      approved_by_admin: profile?.display_name || profile?.full_name || 'YARA Treasury Directorate',
      created_at: new Date().toISOString()
    });
    setShowSlipModal(true);
  };

  const handleOpenEditSlip = (slip: StipendSlip) => {
    setIsEditingSlip(true);
    setSlipFormData({ ...slip });
    setShowSlipModal(true);
  };

  const handleDeleteSlip = async (slipId: string) => {
    if (!window.confirm(`Are you sure you want to delete stipend slip #${slipId}? This will remove it from official audit records.`)) {
      return;
    }
    try {
      await stipendService.deleteStipendSlip(slipId);
      setStipendSlips(prev => prev.filter(s => s.id !== slipId));
      if (selectedSlipForPreview?.id === slipId) {
        setSelectedSlipForPreview(null);
      }
      setMessage({ type: 'success', text: `Stipend slip #${slipId} successfully deleted.` });
      setTimeout(() => setMessage(null), 4000);
    } catch (err: any) {
      setMessage({ type: 'error', text: 'Failed to delete slip: ' + (err.message || 'Unknown error') });
    }
  };

  const handleSaveSlipForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slipFormData.recipient_name.trim()) {
      setMessage({ type: 'error', text: 'Please enter a valid payee / recipient name.' });
      return;
    }

    setLoading(true);
    try {
      const gross = Number(slipFormData.base_stipend) + Number(slipFormData.allowance_amount) + Number(slipFormData.travel_subsistence_ts);
      const net = Math.max(0, gross - Number(slipFormData.withholding_deductions));

      const preparedSlip: StipendSlip = {
        ...slipFormData,
        base_stipend: Number(slipFormData.base_stipend),
        allowance_amount: Number(slipFormData.allowance_amount),
        travel_subsistence_ts: Number(slipFormData.travel_subsistence_ts),
        withholding_deductions: Number(slipFormData.withholding_deductions),
        gross_amount: gross,
        net_amount_received: net
      };

      if (isEditingSlip) {
        const updated = await stipendService.updateStipendSlip(preparedSlip);
        setStipendSlips(prev => prev.map(s => s.id === updated.id ? updated : s));
        if (selectedSlipForPreview?.id === updated.id) {
          setSelectedSlipForPreview(updated);
        }
        setMessage({ type: 'success', text: `Stipend slip #${updated.id} successfully updated.` });
      } else {
        const created = await stipendService.createStipendSlip(preparedSlip);
        setStipendSlips(prev => [created, ...prev]);
        setSelectedSlipForPreview(created);
        setMessage({ type: 'success', text: `New stipend slip #${created.id} created successfully.` });
      }

      setShowSlipModal(false);
      setTimeout(() => setMessage(null), 5000);
    } catch (err: any) {
      setMessage({ type: 'error', text: 'Failed to save stipend slip: ' + (err.message || 'Unknown error') });
    } finally {
      setLoading(false);
    }
  };

  const filteredPersonnel = personnel.filter(p => {
    const matchesSearch = searchQuery === '' || 
      (p.display_name && p.display_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.email && p.email.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesRole = roleFilter === 'all' || p.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const filteredSlips = stipendSlips.filter(s => {
    const matchesRole = slipRoleFilter === 'all' || s.recipient_role === slipRoleFilter;
    const matchesSearch = searchQuery === '' ||
      s.recipient_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.payment_reference.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRole && matchesSearch;
  });

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-2xl font-black text-slate-900 flex items-center space-x-3">
            <DollarSign className="w-6 h-6 text-emerald-600" />
            <span>NPO Finance, Stipends &amp; Disbursement Slips Hub</span>
          </h3>
          <p className="text-slate-500 text-sm font-medium mt-1">
            Authorise stipends, allowances, and T&amp;S for mentors, employees, trainers, and coaches with automatic verifiable slip generation.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setActiveSubTab('npo_budget')}
            className="bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold px-4 py-2.5 rounded-2xl border border-purple-200 flex items-center space-x-2 text-xs transition-all cursor-pointer shadow-2xs"
          >
            <Percent className="w-4 h-4 text-purple-600" />
            <span>NPO Budget Allocations ({budgetPercentages.direct_program_stipends_percent}% Stipends)</span>
          </button>

          <button
            onClick={() => setShowAddInvestModal(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2.5 rounded-2xl shadow-lg shadow-emerald-100 flex items-center space-x-2 text-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Grant / Investment</span>
          </button>
        </div>
      </div>

      {message && (
        <div className={cn(
          "p-4 rounded-2xl flex items-center space-x-2 text-sm font-bold animate-in fade-in",
          message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
        )}>
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{message.text}</span>
        </div>
      )}

      {/* KPI Financial Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Total Funding Raised</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-3xl font-black text-white tracking-tight">
              ${totalInvestments.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-slate-400 mt-1">{investments.length} Grants &amp; Institutional Donors</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xl shadow-indigo-50/50 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Stipends Disbursed</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-3xl font-black text-indigo-600 tracking-tight">
              ${totalStipendsDisbursed.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-slate-400 mt-1">{stipendSlips.length} Official Slips Generated</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xl shadow-purple-50/50 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">T &amp; S and Allowances</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <PieChart className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-3xl font-black text-purple-700 tracking-tight">
              ${(actualAllowanceSpent + actualTSSpent).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-slate-400 mt-1">Allowances: ${actualAllowanceSpent} | T&amp;S: ${actualTSSpent}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xl shadow-indigo-50/50 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Treasury Reserve</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-3xl font-black text-slate-900 tracking-tight">
              ${availableReserve.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-slate-400 mt-1">Available for kits, servers &amp; operations</p>
          </div>
        </div>
      </div>

      {/* Sub Tab Navigation */}
      <div className="flex items-center space-x-2 border-b border-slate-100 pb-2 overflow-x-auto">
        {[
          { id: 'overview', label: 'Disburse Compensation Hub', icon: Users, count: personnel.length },
          { id: 'stipend_slips', label: 'Stipend Slips & Records', icon: FileText, count: stipendSlips.length },
          { id: 'npo_budget', label: 'NPO Budget % Guidelines', icon: PieChart },
          { id: 'investments', label: 'Grants & Investments Ledger', icon: Building, count: investments.length }
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={cn(
                "px-5 py-2.5 rounded-2xl font-bold text-xs flex items-center space-x-2 transition-all whitespace-nowrap cursor-pointer",
                activeSubTab === tab.id
                  ? "bg-slate-900 text-white shadow-md"
                  : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
              )}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {typeof tab.count === 'number' && (
                <span className={cn(
                  "px-2 py-0.5 rounded-full text-[10px]",
                  activeSubTab === tab.id ? "bg-slate-800 text-slate-200" : "bg-slate-100 text-slate-600"
                )}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* =========================================================================
          SUB-TAB 1: DISBURSE COMPENSATION HUB (Mentors, Employees, Trainers, Coaches)
         ========================================================================= */}
      {activeSubTab === 'overview' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h4 className="text-lg font-bold text-slate-900">YARA Staff, Mentors, Trainers &amp; Coaches</h4>
              <p className="text-xs text-slate-400">Select any individual to disburse stipends, allowances, and generate official downloadable slips.</p>
            </div>

            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search personnel..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-600"
                />
              </div>

              {/* Filter */}
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 py-1.5 px-3 focus:outline-none focus:border-indigo-600"
              >
                <option value="all">All Roles</option>
                <option value="mentor">Mentors</option>
                <option value="trainer">Trainers</option>
                <option value="employee">Employees / Staff</option>
                <option value="coach">Coaches</option>
                <option value="volunteer">Volunteers</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto bg-white rounded-3xl border border-slate-100 shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-100">
                  <th className="px-6 py-4">Recipient &amp; Member ID</th>
                  <th className="px-6 py-4">Role / Designation</th>
                  <th className="px-6 py-4">Rating / Sessions</th>
                  <th className="px-6 py-4">Pending / Standard Rate</th>
                  <th className="px-6 py-4 text-right">Payment Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-xs">
                {filteredPersonnel.map(person => (
                  <tr key={person.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 font-bold flex items-center justify-center text-sm shadow-2xs">
                          {person.display_name?.[0] || 'Y'}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-sm">{person.display_name}</p>
                          <p className="text-[11px] text-slate-400 font-mono">{person.member_id || person.email || 'Verified YARA Personnel'}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider",
                        person.role === 'employee' ? "bg-blue-50 text-blue-700 border border-blue-200" :
                        person.role === 'trainer' ? "bg-emerald-50 text-emerald-700 border border-emerald-200" :
                        person.role === 'coach' ? "bg-amber-50 text-amber-700 border border-amber-200" :
                        "bg-purple-50 text-purple-700 border border-purple-200"
                      )}>
                        {person.role || 'Personnel'}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-1 text-slate-700 font-bold">
                        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                        <span>{person.rating || '5.0'}</span>
                        <span className="text-slate-400 font-normal ml-1">({person.mentored_count || 10} sessions)</span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span className="font-black text-emerald-600 text-sm">
                        ${person.total_commission || (person.role === 'employee' ? 200 : person.role === 'trainer' ? 120 : 100)}.00
                      </span>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleOpenDisburse(person)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-md shadow-indigo-100 transition-all flex items-center space-x-1.5 ml-auto cursor-pointer"
                      >
                        <Send className="w-3 h-3" />
                        <span>Pay Stipend &amp; Issue Slip</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          SUB-TAB 2: STIPEND SLIPS REGISTRY (Auditing & PDF Download for Admin & User)
         ========================================================================= */}
      {activeSubTab === 'stipend_slips' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h4 className="text-lg font-bold text-slate-900">Official Stipend &amp; Allowance Disbursement Slips</h4>
              <p className="text-xs text-slate-400">Verifiable computerized payment receipts for audit, grants, and personal records keeping.</p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <select
                value={slipRoleFilter}
                onChange={(e) => setSlipRoleFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 py-2 px-3 focus:outline-none focus:border-indigo-600 cursor-pointer"
              >
                <option value="all">All Recipient Categories</option>
                <option value="mentor">Mentors</option>
                <option value="trainer">Trainers</option>
                <option value="employee">Employees</option>
                <option value="coach">Coaches</option>
                <option value="volunteer">Volunteers</option>
              </select>

              <button
                type="button"
                onClick={handleOpenCreateSlip}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md shadow-indigo-100 cursor-pointer whitespace-nowrap"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Custom Slip</span>
              </button>
            </div>
          </div>

          {filteredSlips.length === 0 ? (
            <div className="bg-white rounded-3xl border border-dashed border-slate-200 p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                <FileText className="w-6 h-6" />
              </div>
              <h5 className="font-bold text-slate-900">No Stipend Slips Recorded Yet</h5>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                When you pay a mentor, trainer, coach, or employee in the Compensation Hub, an official stipend slip will be automatically generated here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto bg-white rounded-3xl border border-slate-100 shadow-sm">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-100">
                    <th className="px-6 py-4">Slip Ref &amp; Date</th>
                    <th className="px-6 py-4">Recipient</th>
                    <th className="px-6 py-4">Role</th>
                    <th className="px-6 py-4">Breakdown (Base + Allowance + T&amp;S)</th>
                    <th className="px-6 py-4">Net Amount</th>
                    <th className="px-6 py-4">Method &amp; Txn</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredSlips.map(slip => (
                    <tr key={slip.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-mono font-bold text-slate-900">{slip.id}</p>
                        <p className="text-[10px] text-slate-400">{slip.disbursement_date}</p>
                      </td>

                      <td className="px-6 py-4">
                        <p className="font-bold text-slate-900 text-sm">{slip.recipient_name}</p>
                        <p className="text-[11px] text-slate-400">{slip.recipient_email || 'Verified Member'}</p>
                      </td>

                      <td className="px-6 py-4">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-700">
                          {slip.recipient_role}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-slate-600">
                        <div className="space-y-0.5 text-[11px]">
                          <div>Base: <span className="font-bold text-slate-800">${Number(slip.base_stipend).toFixed(2)}</span></div>
                          <div>Allowance: <span className="font-bold text-slate-800">${Number(slip.allowance_amount).toFixed(2)}</span> • T&amp;S: <span className="font-bold text-slate-800">${Number(slip.travel_subsistence_ts).toFixed(2)}</span></div>
                        </div>
                      </td>

                      <td className="px-6 py-4 font-black text-emerald-600 text-sm">
                        ${Number(slip.net_amount_received).toFixed(2)} {slip.currency}
                      </td>

                      <td className="px-6 py-4">
                        <span className="font-bold text-slate-700 capitalize">{slip.payment_method.replace('_', ' ')}</span>
                        <p className="text-[10px] text-slate-400 font-mono">{slip.payment_reference}</p>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedSlipForPreview(slip)}
                            className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all cursor-pointer"
                            title="View Slip Details"
                          >
                            <FileText className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenEditSlip(slip)}
                            className="p-2 text-amber-600 hover:bg-amber-50 rounded-xl transition-all cursor-pointer"
                            title="Edit Slip (All Sections)"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => printStipendSlip(slip)}
                            className="p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
                            title="Print Slip"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => downloadStipendSlipPdf(slip)}
                            className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1 transition-all cursor-pointer"
                            title="Download PDF"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>PDF</span>
                          </button>
                          <button
                            onClick={() => handleDeleteSlip(slip.id)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-all cursor-pointer"
                            title="Delete Slip Record"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          SUB-TAB 3: NPO BUDGET PERCENTAGES & GUIDELINES
         ========================================================================= */}
      {activeSubTab === 'npo_budget' && (
        <div className="space-y-6">
          <div className="bg-purple-900/10 border border-purple-200 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-bold uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>NPO Statutory &amp; Grant Compliance</span>
              </div>
              <h4 className="text-xl font-black text-slate-900">
                Non-Profit Budget Percentage Distribution
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                As a registered Non-Profit STEM Organization, incoming donor funds, angel capital, and educational grants must adhere to transparent allocation percentages across program stipends, allowances, and travel &amp; subsistence (T&amp;S).
              </p>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-purple-200 text-center min-w-[200px] shadow-sm">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Grant Treasury</p>
              <p className="text-2xl font-black text-purple-700 mt-1">${totalInvestments.toLocaleString('en-US')}</p>
              <p className="text-[11px] text-emerald-600 font-bold mt-0.5">100% Program Allocated</p>
            </div>
          </div>

          {/* Allocation Breakdown Cards based on current total grant pool */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-slate-100 shadow-sm space-y-2">
              <span className="text-[10px] font-black uppercase text-indigo-600 tracking-wider">1. Program Stipends</span>
              <p className="text-xl font-black text-slate-900">{budgetPercentages.direct_program_stipends_percent}%</p>
              <p className="text-xs font-bold text-emerald-600">${budgetAllocationStipends.toLocaleString('en-US', { maximumFractionDigits: 0 })} Pool</p>
              <p className="text-[10px] text-slate-400 leading-snug">Instruction, mentor milestones, robot design guidance.</p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-100 shadow-sm space-y-2">
              <span className="text-[10px] font-black uppercase text-emerald-600 tracking-wider">2. Prep Allowances</span>
              <p className="text-xl font-black text-slate-900">{budgetPercentages.allowances_percent}%</p>
              <p className="text-xs font-bold text-emerald-600">${budgetAllocationAllowances.toLocaleString('en-US', { maximumFractionDigits: 0 })} Pool</p>
              <p className="text-[10px] text-slate-400 leading-snug">Curriculum prep, soldering bench setup, kit staging.</p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-100 shadow-sm space-y-2">
              <span className="text-[10px] font-black uppercase text-amber-600 tracking-wider">3. Travel &amp; Subsistence</span>
              <p className="text-xl font-black text-slate-900">{budgetPercentages.travel_and_subsistence_percent}%</p>
              <p className="text-xs font-bold text-emerald-600">${budgetAllocationTS.toLocaleString('en-US', { maximumFractionDigits: 0 })} Pool</p>
              <p className="text-[10px] text-slate-400 leading-snug">Rural school transit, bus fares, regional meals.</p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-100 shadow-sm space-y-2">
              <span className="text-[10px] font-black uppercase text-blue-600 tracking-wider">4. Hardware Lab Kits</span>
              <p className="text-xl font-black text-slate-900">{budgetPercentages.hardware_and_equipment_percent}%</p>
              <p className="text-xs font-bold text-emerald-600">${budgetAllocationHardware.toLocaleString('en-US', { maximumFractionDigits: 0 })} Pool</p>
              <p className="text-[10px] text-slate-400 leading-snug">ESP32 boards, microcontrollers, sonar sensors, tools.</p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-100 shadow-sm space-y-2">
              <span className="text-[10px] font-black uppercase text-purple-600 tracking-wider">5. Admin &amp; Audit</span>
              <p className="text-xl font-black text-slate-900">{budgetPercentages.admin_and_governance_percent}%</p>
              <p className="text-xs font-bold text-emerald-600">${budgetAllocationAdmin.toLocaleString('en-US', { maximumFractionDigits: 0 })} Pool</p>
              <p className="text-[10px] text-slate-400 leading-snug">Fiscal accounting, compliance seals, legal audit.</p>
            </div>
          </div>

          {/* Form to tweak percentage guidelines */}
          <form onSubmit={handleSaveBudgetPercentages} className="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
            <h5 className="font-black text-slate-900 text-base">Adjust NPO Standard Budget Percentages</h5>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Direct Stipends (%)</label>
                <input
                  type="number"
                  min="10"
                  max="90"
                  required
                  value={budgetPercentages.direct_program_stipends_percent}
                  onChange={(e) => setBudgetPercentages({ ...budgetPercentages, direct_program_stipends_percent: Number(e.target.value) })}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-4 text-sm font-bold text-slate-900 focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Allowances (%)</label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  required
                  value={budgetPercentages.allowances_percent}
                  onChange={(e) => setBudgetPercentages({ ...budgetPercentages, allowances_percent: Number(e.target.value) })}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-4 text-sm font-bold text-slate-900 focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-2">T &amp; S Travel (%)</label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  required
                  value={budgetPercentages.travel_and_subsistence_percent}
                  onChange={(e) => setBudgetPercentages({ ...budgetPercentages, travel_and_subsistence_percent: Number(e.target.value) })}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-4 text-sm font-bold text-slate-900 focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Hardware Kits (%)</label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  required
                  value={budgetPercentages.hardware_and_equipment_percent}
                  onChange={(e) => setBudgetPercentages({ ...budgetPercentages, hardware_and_equipment_percent: Number(e.target.value) })}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-4 text-sm font-bold text-slate-900 focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Admin / Audit (%)</label>
                <input
                  type="number"
                  min="0"
                  max="30"
                  required
                  value={budgetPercentages.admin_and_governance_percent}
                  onChange={(e) => setBudgetPercentages({ ...budgetPercentages, admin_and_governance_percent: Number(e.target.value) })}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-4 text-sm font-bold text-slate-900 focus:border-indigo-600"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <span className="text-xs font-bold text-slate-500">
                Sum Total: <strong className={cn(
                  (Number(budgetPercentages.direct_program_stipends_percent) +
                  Number(budgetPercentages.allowances_percent) +
                  Number(budgetPercentages.travel_and_subsistence_percent) +
                  Number(budgetPercentages.hardware_and_equipment_percent) +
                  Number(budgetPercentages.admin_and_governance_percent)) === 100 ? "text-emerald-600" : "text-red-500"
                )}>
                  {Number(budgetPercentages.direct_program_stipends_percent) +
                  Number(budgetPercentages.allowances_percent) +
                  Number(budgetPercentages.travel_and_subsistence_percent) +
                  Number(budgetPercentages.hardware_and_equipment_percent) +
                  Number(budgetPercentages.admin_and_governance_percent)}%
                </strong> (must equal 100%)
              </span>

              <button
                type="submit"
                disabled={savingBudget}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-3 rounded-2xl text-xs shadow-md shadow-indigo-100 transition-all cursor-pointer flex items-center gap-2"
              >
                {savingBudget ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>Save Percentage Model</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* =========================================================================
          SUB-TAB 4: GRANTS & INVESTMENTS LEDGER
         ========================================================================= */}
      {activeSubTab === 'investments' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-lg font-bold text-slate-900">Grants, Angel Capital &amp; Corporate Sponsorships</h4>
              <p className="text-xs text-slate-400">All registered institutional grant allocations &amp; treasury records.</p>
            </div>
            <button
              onClick={() => setShowAddInvestModal(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Record</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {investments.map(inv => (
              <div key={inv.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {inv.investment_type}
                    </span>
                    <span className="text-xs font-bold text-emerald-600 capitalize">{inv.status}</span>
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

      {/* =========================================================================
          MODAL: DISBURSE STIPEND & AUTO-GENERATE SLIP
         ========================================================================= */}
      <AnimatePresence>
        {showDisburseModal && selectedRecipient && (
          <div className="fixed inset-0 z-[140] flex items-center justify-center p-4 md:p-6 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[2.5rem] p-8 md:p-10 max-w-lg w-full shadow-2xl relative my-8"
            >
              <button 
                onClick={() => setShowDisburseModal(false)}
                className="absolute top-6 right-6 p-2 text-slate-400 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="space-y-1 mb-6">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-bold uppercase tracking-wider">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Official NPO Stipend Disbursement</span>
                </div>
                <h3 className="text-2xl font-black text-slate-900">Authorize Stipend Payment</h3>
                <p className="text-slate-500 text-xs">For <strong>{selectedRecipient.display_name}</strong> ({selectedRecipient.role || 'Member'}).</p>
              </div>

              <form onSubmit={handleExecuteStipendDisbursement} className="space-y-4">
                {/* Role / Designation */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Recipient Designation</label>
                  <select
                    value={disburseForm.recipient_role}
                    onChange={(e) => setDisburseForm({ ...disburseForm, recipient_role: e.target.value as any })}
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-2.5 px-4 text-xs font-bold text-slate-800 focus:border-indigo-600"
                  >
                    <option value="mentor">Mentor (Technical Coaching &amp; Guidance)</option>
                    <option value="trainer">Trainer (Academy &amp; Robotics Bootcamps)</option>
                    <option value="employee">YARA Employee / Core Operations Staff</option>
                    <option value="coach">School Robotics Chapter Coach</option>
                    <option value="volunteer">STEM Volunteer / Lab Coordinator</option>
                  </select>
                </div>

                {/* Financial Component Breakdown */}
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Base Stipend ($)</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={disburseForm.base_stipend}
                      onChange={(e) => setDisburseForm({ ...disburseForm, base_stipend: Number(e.target.value) })}
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl py-2 px-3 text-sm font-black text-slate-900 focus:border-indigo-600"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Allowance ($)</label>
                    <input
                      type="number"
                      min="0"
                      value={disburseForm.allowance_amount}
                      onChange={(e) => setDisburseForm({ ...disburseForm, allowance_amount: Number(e.target.value) })}
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl py-2 px-3 text-sm font-black text-slate-900 focus:border-indigo-600"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">T &amp; S Travel ($)</label>
                    <input
                      type="number"
                      min="0"
                      value={disburseForm.travel_subsistence_ts}
                      onChange={(e) => setDisburseForm({ ...disburseForm, travel_subsistence_ts: Number(e.target.value) })}
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl py-2 px-3 text-sm font-black text-slate-900 focus:border-indigo-600"
                    />
                  </div>
                </div>

                {/* Calculated Net Confirmation Box */}
                <div className="p-3.5 bg-purple-50 rounded-2xl border border-purple-100 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold text-purple-700 uppercase tracking-wider">Total Net Amount Payable</p>
                    <p className="text-xs text-purple-600">Base + Allowances + Travel &amp; Subsistence</p>
                  </div>
                  <div className="text-xl font-black text-purple-900">
                    ${(Number(disburseForm.base_stipend) + Number(disburseForm.allowance_amount) + Number(disburseForm.travel_subsistence_ts) - Number(disburseForm.withholding_deductions)).toFixed(2)} USD
                  </div>
                </div>

                {/* Payment Method & Reference */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Payment Channel</label>
                    <select
                      value={disburseForm.payment_method}
                      onChange={(e) => setDisburseForm({ ...disburseForm, payment_method: e.target.value as any })}
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-2.5 px-3 text-xs font-bold text-slate-800 focus:border-indigo-600"
                    >
                      <option value="mobile_money">EcoCash / M-Pesa / MoMo</option>
                      <option value="bank_transfer">Direct Bank Transfer</option>
                      <option value="cash">Direct Cash / Voucher</option>
                      <option value="paypal">PayPal</option>
                      <option value="crypto">USDT / USDC Crypto</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Transaction Ref / Receipt</label>
                    <input
                      type="text"
                      required
                      value={disburseForm.payment_reference}
                      onChange={(e) => setDisburseForm({ ...disburseForm, payment_reference: e.target.value })}
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-2.5 px-3 text-xs font-mono font-bold text-slate-800 focus:border-indigo-600"
                    />
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Performance Memorandum / Purpose</label>
                  <textarea
                    value={disburseForm.notes}
                    onChange={(e) => setDisburseForm({ ...disburseForm, notes: e.target.value })}
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-2.5 px-3 text-xs font-medium focus:border-indigo-600 min-h-[60px]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-indigo-600 text-white font-bold py-4 rounded-2xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center space-x-2 mt-4 cursor-pointer"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                    <>
                      <span>Confirm Disbursement &amp; Generate Slip</span>
                      <Download className="w-4 h-4 ml-1" />
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* =========================================================================
          MODAL: PREVIEW & DOWNLOAD SLIP
         ========================================================================= */}
      <AnimatePresence>
        {selectedSlipForPreview && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 md:p-6 bg-slate-950/85 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[2.5rem] p-6 md:p-10 max-w-xl w-full shadow-2xl relative my-8 space-y-6"
            >
              <button 
                onClick={() => setSelectedSlipForPreview(null)}
                className="absolute top-6 right-6 p-2 text-slate-400 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-xl font-black text-slate-900">Official Stipend Slip</h4>
                  <p className="text-xs text-slate-500 font-mono">Reference: {selectedSlipForPreview.id}</p>
                </div>
              </div>

              {/* Slip Card Details */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-4">
                <div className="flex justify-between items-start text-xs">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Recipient</span>
                    <p className="font-bold text-slate-900 text-sm">{selectedSlipForPreview.recipient_name}</p>
                    <p className="text-slate-500 capitalize">{selectedSlipForPreview.recipient_role}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Net Disbursed</span>
                    <p className="font-black text-purple-700 text-base">
                      ${Number(selectedSlipForPreview.net_amount_received).toFixed(2)} {selectedSlipForPreview.currency}
                    </p>
                    <p className="text-slate-500">{selectedSlipForPreview.disbursement_date}</p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200/60 grid grid-cols-3 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-400 block text-[9px] uppercase font-bold">Base Stipend</span>
                    <span className="font-bold text-slate-800">${Number(selectedSlipForPreview.base_stipend).toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[9px] uppercase font-bold">Allowances</span>
                    <span className="font-bold text-slate-800">${Number(selectedSlipForPreview.allowance_amount).toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[9px] uppercase font-bold">T &amp; S</span>
                    <span className="font-bold text-slate-800">${Number(selectedSlipForPreview.travel_subsistence_ts).toFixed(2)}</span>
                  </div>
                </div>

                <div className="pt-2 text-slate-600 text-[11px]">
                  <strong>Notes:</strong> {selectedSlipForPreview.notes || 'Official YARA technical and mentoring stipend.'}
                </div>
              </div>

              {/* Action Buttons: Download PDF, Print, and Edit Slip */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => downloadStipendSlipPdf(selectedSlipForPreview)}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 px-4 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-100 transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Official PDF Slip</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const slipToEdit = selectedSlipForPreview;
                    setSelectedSlipForPreview(null);
                    handleOpenEditSlip(slipToEdit);
                  }}
                  className="bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold py-3.5 px-5 rounded-2xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Edit2 className="w-4 h-4" />
                  <span>Edit Slip</span>
                </button>

                <button
                  type="button"
                  onClick={() => printStipendSlip(selectedSlipForPreview)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3.5 px-5 rounded-2xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Slip</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* =========================================================================
          MODAL: ADD OR EDIT STIPEND SLIP (ALL SECTIONS EDITABLE)
         ========================================================================= */}
      <AnimatePresence>
        {showSlipModal && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 md:p-6 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[2.5rem] p-6 md:p-8 max-w-3xl w-full shadow-2xl relative my-8 border border-slate-100 max-h-[92vh] overflow-y-auto"
            >
              <button 
                onClick={() => setShowSlipModal(false)}
                className="absolute top-6 right-6 p-2 text-slate-400 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900">
                    {isEditingSlip ? `Edit Stipend Payslip #${slipFormData.id}` : 'Create Custom Stipend Payslip'}
                  </h3>
                  <p className="text-slate-400 text-xs">
                    All sections on this stipend slip are customizable for official auditing &amp; recipient records.
                  </p>
                </div>
              </div>

              <form onSubmit={handleSaveSlipForm} className="space-y-6 mt-6">
                {/* Section 1: Payee / Beneficiary Details */}
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                    <span className="text-[11px] font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                      <UserCheck className="w-4 h-4 text-indigo-600" />
                      1. Payee &amp; Beneficiary Details
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 font-bold">
                      Ref: {slipFormData.id}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={slipFormData.recipient_name}
                        onChange={(e) => setSlipFormData({ ...slipFormData, recipient_name: e.target.value })}
                        placeholder="e.g. Farai Moyo"
                        className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs font-bold text-slate-900 focus:border-indigo-600 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                        Corporate Role / Designation <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={slipFormData.recipient_role}
                        onChange={(e) => setSlipFormData({ ...slipFormData, recipient_role: e.target.value as any })}
                        className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs font-bold text-slate-900 focus:border-indigo-600 focus:outline-none capitalize"
                      >
                        <option value="mentor">Mentor</option>
                        <option value="trainer">Trainer</option>
                        <option value="coach">Coach</option>
                        <option value="employee">Employee / Staff</option>
                        <option value="judge">Competition Judge</option>
                        <option value="volunteer">Volunteer Lead</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                        Staff / Member ID
                      </label>
                      <input
                        type="text"
                        value={slipFormData.member_id || ''}
                        onChange={(e) => setSlipFormData({ ...slipFormData, member_id: e.target.value })}
                        placeholder="e.g. YARA-MEM-2026-081"
                        className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs font-mono font-bold text-slate-900 focus:border-indigo-600 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={slipFormData.recipient_email || ''}
                        onChange={(e) => setSlipFormData({ ...slipFormData, recipient_email: e.target.value })}
                        placeholder="recipient@yara.org"
                        className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs font-medium text-slate-900 focus:border-indigo-600 focus:outline-none"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                        Contact Phone / WhatsApp
                      </label>
                      <input
                        type="text"
                        value={slipFormData.recipient_phone || ''}
                        onChange={(e) => setSlipFormData({ ...slipFormData, recipient_phone: e.target.value })}
                        placeholder="+263 77 123 4567"
                        className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs font-medium text-slate-900 focus:border-indigo-600 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 2: Remuneration Breakdown & Allowances */}
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                    <span className="text-[11px] font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                      <DollarSign className="w-4 h-4 text-emerald-600" />
                      2. Remuneration Breakdown &amp; Allowances
                    </span>
                    <span className="text-[10px] font-black text-slate-500 uppercase">
                      Currency: {slipFormData.currency}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                        Base Stipend ($)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        required
                        value={slipFormData.base_stipend}
                        onChange={(e) => setSlipFormData({ ...slipFormData, base_stipend: Number(e.target.value) })}
                        className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs font-black text-slate-900 focus:border-indigo-600 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                        Allowances ($)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        required
                        value={slipFormData.allowance_amount}
                        onChange={(e) => setSlipFormData({ ...slipFormData, allowance_amount: Number(e.target.value) })}
                        className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs font-black text-slate-900 focus:border-indigo-600 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                        T &amp; S Travel ($)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        required
                        value={slipFormData.travel_subsistence_ts}
                        onChange={(e) => setSlipFormData({ ...slipFormData, travel_subsistence_ts: Number(e.target.value) })}
                        className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs font-black text-slate-900 focus:border-indigo-600 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                        Deductions ($)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={slipFormData.withholding_deductions}
                        onChange={(e) => setSlipFormData({ ...slipFormData, withholding_deductions: Number(e.target.value) })}
                        className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs font-black text-red-600 focus:border-indigo-600 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Real-time Calculation Summary Banner */}
                  <div className="bg-slate-900 text-white rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-6 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase font-bold">Gross Remuneration</span>
                        <span className="text-sm font-black text-slate-100">
                          ${(Number(slipFormData.base_stipend) + Number(slipFormData.allowance_amount) + Number(slipFormData.travel_subsistence_ts)).toFixed(2)}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase font-bold">Total Deductions</span>
                        <span className="text-sm font-black text-rose-400">
                          -${Number(slipFormData.withholding_deductions).toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-emerald-400 block uppercase font-bold tracking-wider">Net Amount Received</span>
                      <span className="text-xl font-black text-emerald-300">
                        ${Math.max(0, (Number(slipFormData.base_stipend) + Number(slipFormData.allowance_amount) + Number(slipFormData.travel_subsistence_ts)) - Number(slipFormData.withholding_deductions)).toFixed(2)} {slipFormData.currency}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Section 3: Disbursement & Payment Clearance */}
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                    <span className="text-[11px] font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                      <CreditCard className="w-4 h-4 text-purple-600" />
                      3. Transaction Clearance &amp; Budget Compliance
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                        Payment Method
                      </label>
                      <select
                        value={slipFormData.payment_method}
                        onChange={(e) => setSlipFormData({ ...slipFormData, payment_method: e.target.value as any })}
                        className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs font-bold text-slate-900 focus:border-indigo-600 focus:outline-none capitalize"
                      >
                        <option value="bank_transfer">Bank Transfer (EFT / RTGS)</option>
                        <option value="mobile_money">Mobile Money (EcoCash / InnBucks)</option>
                        <option value="cash">Direct Cash Voucher</option>
                        <option value="paypal">PayPal / International Transfer</option>
                        <option value="crypto">Crypto / Digital Stablecoin</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                        Txn / Payment Reference
                      </label>
                      <input
                        type="text"
                        required
                        value={slipFormData.payment_reference}
                        onChange={(e) => setSlipFormData({ ...slipFormData, payment_reference: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs font-mono font-bold text-slate-900 focus:border-indigo-600 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                        Disbursement Date
                      </label>
                      <input
                        type="date"
                        required
                        value={slipFormData.disbursement_date}
                        onChange={(e) => setSlipFormData({ ...slipFormData, disbursement_date: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs font-bold text-slate-900 focus:border-indigo-600 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                        Disbursement Status
                      </label>
                      <select
                        value={slipFormData.status}
                        onChange={(e) => setSlipFormData({ ...slipFormData, status: e.target.value as any })}
                        className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs font-bold text-slate-900 focus:border-indigo-600 focus:outline-none capitalize"
                      >
                        <option value="completed">Completed / Disbursed</option>
                        <option value="processing">Processing</option>
                        <option value="pending">Pending Verification</option>
                        <option value="flagged">Flagged for Audit</option>
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                        NPO Budget Allocation Category
                      </label>
                      <select
                        value={slipFormData.budget_category}
                        onChange={(e) => setSlipFormData({ ...slipFormData, budget_category: e.target.value as any })}
                        className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs font-bold text-slate-900 focus:border-indigo-600 focus:outline-none"
                      >
                        <option value="program_stipends">1. Direct Program Stipends (Instruction &amp; Mentorship)</option>
                        <option value="training_allowances">2. Training &amp; Session Allowances</option>
                        <option value="travel_and_subsistence">3. Travel &amp; Subsistence (T&amp;S)</option>
                        <option value="admin_operations">4. Governance &amp; Administration</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Section 4: Audit & Signatory Notes */}
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                    <span className="text-[11px] font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-indigo-600" />
                      4. Governance, Signatory &amp; Purpose Notes
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                        Authorizing Officer / Signatory
                      </label>
                      <input
                        type="text"
                        value={slipFormData.approved_by_admin || ''}
                        onChange={(e) => setSlipFormData({ ...slipFormData, approved_by_admin: e.target.value })}
                        placeholder="e.g. YARA Director of Treasury &amp; Fiscal Compliance"
                        className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs font-bold text-slate-900 focus:border-indigo-600 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                        Performance Memorandum / Purpose Notes
                      </label>
                      <textarea
                        rows={2}
                        value={slipFormData.notes || ''}
                        onChange={(e) => setSlipFormData({ ...slipFormData, notes: e.target.value })}
                        placeholder="Detailed deliverables, training modules covered, practical lab assembly defense..."
                        className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs font-medium text-slate-900 focus:border-indigo-600 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowSlipModal(false)}
                    className="px-5 py-3 rounded-2xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-3 rounded-2xl text-xs shadow-lg shadow-indigo-100 transition-all flex items-center gap-2 cursor-pointer"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    <span>{isEditingSlip ? 'Save Slip Changes' : 'Generate & Record Slip'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* =========================================================================
          MODAL: ADD GRANT / INVESTMENT
         ========================================================================= */}
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
                className="absolute top-6 right-6 p-2 text-slate-400 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>

              <h3 className="text-2xl font-black text-slate-900 mb-1">Add Grant / Investment</h3>
              <p className="text-slate-500 text-xs mb-6">Log incoming corporate grant, donor round, or capital injection.</p>

              <form onSubmit={handleSaveInvestment} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Funder / Investor Source Name</label>
                  <input
                    type="text"
                    required
                    value={investForm.source_name}
                    onChange={(e) => setInvestForm({ ...investForm, source_name: e.target.value })}
                    placeholder="e.g. African STEM Foundation, Ministry of Higher Ed"
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-4 text-xs font-bold focus:border-indigo-600"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Amount ($ USD)</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={investForm.amount}
                      onChange={(e) => setInvestForm({ ...investForm, amount: Number(e.target.value) })}
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-4 text-xs font-black focus:border-indigo-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Funding Type</label>
                    <select
                      value={investForm.investment_type}
                      onChange={(e) => setInvestForm({ ...investForm, investment_type: e.target.value as any })}
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-4 text-xs font-bold focus:border-indigo-600"
                    >
                      <option value="grant">Grant (Non-Profit)</option>
                      <option value="sponsor">Corporate Sponsorship</option>
                      <option value="donation">Individual Donation</option>
                      <option value="government">Government Subvention</option>
                      <option value="angel">Angel Philanthropy</option>
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
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-emerald-600 text-white font-bold py-4 rounded-2xl shadow-xl shadow-emerald-100 hover:bg-emerald-700 transition-all flex items-center justify-center space-x-2 mt-4 cursor-pointer"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>Confirm &amp; Record Funding</span>}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
