import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  BarChart3, DollarSign, Users, Award, ShieldCheck, 
  TrendingUp, CheckCircle2, Heart, Download, PieChart as PieIcon,
  ArrowUpRight, ArrowDownLeft, Building2, Sparkles
} from 'lucide-react';
import { getRegistrations } from '../../services/yaraCompetitionService';
import { getSponsors, getFinancialTransactions, calculateImpactMetrics } from '../../services/competitionEcosystemService';
import { FinancialTransaction, SponsorRecord } from '../../types/competitionEcosystem';
import { YaraCompetitionRegistration } from '../../types/yaraCompetition';

export default function ImpactAndFinancials() {
  const [metrics, setMetrics] = useState({
    total_innovators: 120,
    girls_count: 60,
    boys_count: 60,
    girls_percentage: 50,
    underserved_schools_count: 8,
    provinces_represented: 7,
    total_sponsorship_raised: 4250,
    total_budget_allocated: 4250,
    prizes_funds: 1600,
    kits_and_hardware_funds: 1400,
    bursaries_and_meals_funds: 850,
    operations_funds: 400
  });

  const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
  const [sponsors, setSponsors] = useState<SponsorRecord[]>([]);

  useEffect(() => {
    Promise.all([
      calculateImpactMetrics(),
      getFinancialTransactions(),
      getSponsors()
    ]).then(([met, txs, sps]) => {
      setMetrics(met);
      setTransactions(txs);
      setSponsors(sps);
    });
  }, []);

  return (
    <div className="space-y-10 pb-16">
      {/* 1. HERO HEADER */}
      <div className="p-8 md:p-12 rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-4">
          <span className="px-3.5 py-1 rounded-full bg-emerald-400/20 text-emerald-300 border border-emerald-400/40 text-xs font-black uppercase tracking-wider">
            📊 Audited Impact & Public Financial Ledger
          </span>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Impact Metrics & Financial Transparency
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            YARA holds an unwavering commitment to full public financial transparency and measurable social impact. Explore live data on student participation, gender parity, and fund allocation.
          </p>
        </div>
      </div>

      {/* 2. TOP IMPACT KPI GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>Total Innovators</span>
            <Users className="w-5 h-5 text-indigo-600" />
          </div>
          <p className="text-3xl sm:text-4xl font-black text-slate-900 font-mono">
            {metrics.total_innovators}
          </p>
          <p className="text-xs text-emerald-600 font-bold flex items-center space-x-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Active Student Competitors</span>
          </p>
        </div>

        <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>Girls in Robotics</span>
            <Heart className="w-5 h-5 text-pink-600" />
          </div>
          <p className="text-3xl sm:text-4xl font-black text-slate-900 font-mono">
            {metrics.girls_percentage}%
          </p>
          <p className="text-xs text-pink-600 font-bold">
            {metrics.girls_count} Girls • Enforced 50/50 Rule
          </p>
        </div>

        <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>Underserved Schools</span>
            <Building2 className="w-5 h-5 text-amber-600" />
          </div>
          <p className="text-3xl sm:text-4xl font-black text-slate-900 font-mono">
            {metrics.underserved_schools_count}
          </p>
          <p className="text-xs text-amber-600 font-bold">
            Across {metrics.provinces_represented} Provinces Supported
          </p>
        </div>

        <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>Total Sponsorship</span>
            <DollarSign className="w-5 h-5 text-emerald-600" />
          </div>
          <p className="text-3xl sm:text-4xl font-black text-slate-900 font-mono">
            ${metrics.total_sponsorship_raised.toLocaleString()}
          </p>
          <p className="text-xs text-emerald-600 font-bold">
            100% Itemized & Subsidized
          </p>
        </div>
      </div>

      {/* 3. BUDGET ALLOCATION BREAKDOWN (PIE & BARS) */}
      <div className="p-6 md:p-8 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-6">
        <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-slate-900">Direct Resource Allocation Model</h2>
            <p className="text-xs text-slate-500">How every dollar is invested in youth robotics empowerment.</p>
          </div>
          <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-bold">
            Zero Administrative Overhead Loss
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 space-y-2">
            <span className="text-xs font-bold text-amber-900">🏆 Awards & Cash Prizes (38%)</span>
            <p className="text-2xl font-black text-amber-950 font-mono">${metrics.prizes_funds}</p>
            <p className="text-[11px] text-amber-800">
              Gold championship trophies, medals, and university tuition micro-grants for winners.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-blue-50 border border-blue-200 space-y-2">
            <span className="text-xs font-bold text-blue-900">🤖 Hardware & Starter Kits (33%)</span>
            <p className="text-2xl font-black text-blue-950 font-mono">${metrics.kits_and_hardware_funds}</p>
            <p className="text-[11px] text-blue-800">
              Microcontrollers, underwater motors, ultrasonic sensors, and soldering stations.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2">
            <span className="text-xs font-bold text-emerald-900">🎓 Rural Bursaries & Meals (20%)</span>
            <p className="text-2xl font-black text-emerald-950 font-mono">${metrics.bursaries_and_meals_funds}</p>
            <p className="text-[11px] text-emerald-800">
              Subsidized bus travel for rural schools, lodging stipends, and hot meals for teams.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-purple-50 border border-purple-200 space-y-2">
            <span className="text-xs font-bold text-purple-900">📦 Arena Operations & Tank (9%)</span>
            <p className="text-2xl font-black text-purple-950 font-mono">${metrics.operations_funds}</p>
            <p className="text-[11px] text-purple-800">
              Underwater testing tanks, labyrinth wooden maze build, and timing system sensors.
            </p>
          </div>
        </div>
      </div>

      {/* 4. REAL-TIME FINANCIAL AUDIT TRANSACTION LEDGER */}
      <div className="p-6 md:p-8 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-xl font-black text-slate-900 flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-indigo-600" />
            <span>Audited Financial Ledger (Real-time)</span>
          </h2>
          <span className="text-xs text-slate-400 font-mono">{transactions.length} Verified Transactions</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider font-bold">
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3">Type</th>
                <th className="py-3 px-3">Description / Payee</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3 text-right">Amount (USD)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transactions.map(tx => (
                <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-3 font-mono text-slate-500">{tx.date}</td>
                  <td className="py-3 px-3">
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase ${
                      tx.type === 'income' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {tx.type === 'income' ? '↓ Sponsorship Inflow' : '↑ Expense Allocation'}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-semibold text-slate-900">{tx.description}</td>
                  <td className="py-3 px-3 text-slate-500 capitalize">{tx.category.replace(/_/g, ' ')}</td>
                  <td className={`py-3 px-3 text-right font-mono font-bold text-sm ${
                    tx.type === 'income' ? 'text-emerald-600' : 'text-slate-900'
                  }`}>
                    {tx.type === 'income' ? `+$${tx.amount}` : `-$${tx.amount}`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
