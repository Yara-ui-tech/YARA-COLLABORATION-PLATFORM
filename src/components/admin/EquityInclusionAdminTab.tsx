import React, { useState, useEffect } from 'react';
import { 
  Building2, MapPin, UserPlus, Users, Search, 
  Trash2, Plus, CheckCircle2, AlertCircle, ShieldCheck, 
  GraduationCap, Globe, HeartHandshake, Loader2, Sparkles,
  RefreshCw, Check, X, FileText, Award
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { 
  getUnderservedSchools, addUnderservedSchool, deleteUnderservedSchool, UnderservedSchool,
  getUnderservedRegions, addUnderservedRegion, deleteUnderservedRegion, UnderservedRegion,
  getFreeAccessWhitelist, addFreeWhitelistUser, deleteFreeWhitelistUser, FreeWhitelistEntry,
  grantFreeAccessToUser, revokeFreeAccessFromUser
} from '../../services/equityService';
import { cn } from '../../lib/utils';

export default function EquityInclusionAdminTab() {
  const [activeSection, setActiveSection] = useState<'schools' | 'regions' | 'whitelist' | 'beneficiaries'>('schools');
  
  // Data States
  const [schools, setSchools] = useState<UnderservedSchool[]>([]);
  const [regions, setRegions] = useState<UnderservedRegion[]>([]);
  const [whitelist, setWhitelist] = useState<FreeWhitelistEntry[]>([]);
  const [beneficiaries, setBeneficiaries] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form States
  const [schoolForm, setSchoolForm] = useState({ name: '', district: '', province: 'Mashonaland West', country: 'Zimbabwe', notes: '' });
  const [regionForm, setRegionForm] = useState({ region_name: '', province_state: 'Mashonaland West', country: 'Zimbabwe', notes: '' });
  const [whitelistForm, setWhitelistForm] = useState({ email: '', full_name: '', reason: 'Equity & Inclusion Scholarship' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const showToast = (type: 'success' | 'error', text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [sData, rData, wData] = await Promise.all([
        getUnderservedSchools(),
        getUnderservedRegions(),
        getFreeAccessWhitelist()
      ]);
      setSchools(sData);
      setRegions(rData);
      setWhitelist(wData);

      // Fetch active scholarship recipients from profiles
      const { data: bData } = await supabase
        .from('profiles')
        .select('id, display_name, email, member_id, school_institution, location_region, disability_type, underserved_scholarship_reason, subscription_expires_at, created_at')
        .or('is_fee_exempt.eq.true,is_underserved_scholarship.eq.true')
        .order('created_at', { ascending: false });

      setBeneficiaries(bData || []);
    } catch (err: any) {
      showToast('error', err.message || 'Failed to load inclusion records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Handlers
  const handleAddSchool = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schoolForm.name.trim()) return;
    setIsSubmitting(true);
    try {
      const newSchool = await addUnderservedSchool(schoolForm);
      setSchools(prev => [newSchool, ...prev]);
      setSchoolForm({ name: '', district: '', province: 'Mashonaland West', country: 'Zimbabwe', notes: '' });
      showToast('success', `Added "${newSchool.name}". Students from this school will receive automatic free access!`);
    } catch (err: any) {
      showToast('error', err.message || 'Could not save school.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSchool = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to remove "${name}" from the underserved schools registry?`)) return;
    try {
      await deleteUnderservedSchool(id);
      setSchools(prev => prev.filter(s => s.id !== id));
      showToast('success', `Removed "${name}".`);
    } catch (err: any) {
      showToast('error', err.message || 'Failed to remove school.');
    }
  };

  const handleAddRegion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regionForm.region_name.trim()) return;
    setIsSubmitting(true);
    try {
      const newRegion = await addUnderservedRegion(regionForm);
      setRegions(prev => [newRegion, ...prev]);
      setRegionForm({ region_name: '', province_state: 'Mashonaland West', country: 'Zimbabwe', notes: '' });
      showToast('success', `Added "${newRegion.region_name}". Users from this location receive automatic free access!`);
    } catch (err: any) {
      showToast('error', err.message || 'Could not save region.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteRegion = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to remove "${name}" from underserved regions?`)) return;
    try {
      await deleteUnderservedRegion(id);
      setRegions(prev => prev.filter(r => r.id !== id));
      showToast('success', `Removed "${name}".`);
    } catch (err: any) {
      showToast('error', err.message || 'Failed to remove region.');
    }
  };

  const handleAddWhitelist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!whitelistForm.email.trim()) return;
    setIsSubmitting(true);
    try {
      const newEntry = await addFreeWhitelistUser(whitelistForm);
      setWhitelist(prev => [newEntry, ...prev]);
      setWhitelistForm({ email: '', full_name: '', reason: 'Equity & Inclusion Scholarship' });
      showToast('success', `Whitelisted ${newEntry.email} for 100% free lifetime access!`);
      loadAllData();
    } catch (err: any) {
      showToast('error', err.message || 'Could not whitelist user.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteWhitelist = async (id: string, email: string) => {
    if (!window.confirm(`Revoke free access whitelist for ${email}?`)) return;
    try {
      await deleteFreeWhitelistUser(id, email);
      setWhitelist(prev => prev.filter(w => w.id !== id));
      showToast('success', `Revoked whitelist entry for ${email}.`);
      loadAllData();
    } catch (err: any) {
      showToast('error', err.message || 'Failed to revoke whitelist.');
    }
  };

  const handleRevokeBeneficiary = async (userId: string, name: string) => {
    if (!window.confirm(`Revoke free scholarship access for ${name}?`)) return;
    try {
      await revokeFreeAccessFromUser(userId);
      setBeneficiaries(prev => prev.filter(b => b.id !== userId));
      showToast('success', `Revoked scholarship access for ${name}.`);
    } catch (err: any) {
      showToast('error', err.message || 'Failed to revoke access.');
    }
  };

  // Filtered lists
  const filteredSchools = schools.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (s.district && s.district.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredRegions = regions.filter(r => 
    r.region_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (r.province_state && r.province_state.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredWhitelist = whitelist.filter(w => 
    w.email.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (w.full_name && w.full_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredBeneficiaries = beneficiaries.filter(b => 
    (b.display_name && b.display_name.toLowerCase().includes(searchTerm.toLowerCase())) || 
    (b.email && b.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (b.school_institution && b.school_institution.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Toast Alert */}
      {toastMessage && (
        <div className={cn(
          "p-4 rounded-2xl flex items-center justify-between text-sm font-bold shadow-lg transition-all",
          toastMessage.type === 'success' ? "bg-emerald-500 text-white shadow-emerald-500/20" : "bg-red-500 text-white shadow-red-500/20"
        )}>
          <div className="flex items-center gap-2">
            {toastMessage.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <span>{toastMessage.text}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="p-1 hover:bg-white/20 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 text-white p-8 md:p-10 border border-indigo-500/30 shadow-2xl shadow-indigo-950/40">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 text-xs font-bold uppercase tracking-wider">
              <HeartHandshake className="w-4 h-4 text-cyan-400" />
              <span>Leave No One Behind • Equity Engine</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
              Underserved Communities & Free Access Council
            </h1>
            <p className="text-sm md:text-base text-slate-300 font-medium leading-relaxed">
              Ensure every student, school, and disabled innovator in underserved or rural communities gains 
              <span className="text-cyan-300 font-bold"> 100% free, fee-exempt lifetime access</span> to courses, kits, mentorship, and competitions.
            </p>
          </div>

          <button
            onClick={loadAllData}
            disabled={loading}
            className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs flex items-center gap-2 transition cursor-pointer"
          >
            <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
            <span>Sync Live Records</span>
          </button>
        </div>

        {/* 4 KPI Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-8 border-t border-white/10">
          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Free Scholarships Active</p>
            <p className="text-3xl font-black text-white mt-1">{beneficiaries.length}</p>
            <p className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1">
              <Check className="w-3 h-3" /> Students with $0 fee
            </p>
          </div>
          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Underserved Schools</p>
            <p className="text-3xl font-black text-cyan-300 mt-1">{schools.length}</p>
            <p className="text-[10px] text-slate-400 mt-1">Automatic signup waivers</p>
          </div>
          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Priority Locations</p>
            <p className="text-3xl font-black text-purple-300 mt-1">{regions.length}</p>
            <p className="text-[10px] text-slate-400 mt-1">Districts & rural provinces</p>
          </div>
          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Whitelisted Users</p>
            <p className="text-3xl font-black text-amber-300 mt-1">{whitelist.length}</p>
            <p className="text-[10px] text-slate-400 mt-1">Direct individual grants</p>
          </div>
        </div>
      </div>

      {/* Navigation Pills & Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
          {[
            { id: 'schools', label: 'Underserved Schools', icon: Building2, count: schools.length },
            { id: 'regions', label: 'Underserved Locations', icon: MapPin, count: regions.length },
            { id: 'whitelist', label: 'Free Access Whitelist', icon: UserPlus, count: whitelist.length },
            { id: 'beneficiaries', label: 'Active Scholarship Students', icon: GraduationCap, count: beneficiaries.length }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeSection === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSection(tab.id as any)}
                className={cn(
                  "px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer",
                  isActive
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                )}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                <span className={cn(
                  "px-1.5 py-0.2 rounded-full text-[10px]",
                  isActive ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700"
                )}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search records..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-2xl py-2 pl-10 pr-4 text-xs font-medium focus:outline-none focus:border-indigo-600"
          />
        </div>
      </div>

      {/* SECTION 1: UNDERSERVED SCHOOLS */}
      {activeSection === 'schools' && (
        <div className="space-y-6">
          {/* Add School Form */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-900 text-base mb-1 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-indigo-600" />
              <span>Add Underserved School (Auto-Free Access)</span>
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              When any student from this school signs up, our system automatically waives their subscription and grants 100% free lifetime platform access.
            </p>

            <form onSubmit={handleAddSchool} className="grid grid-cols-1 md:grid-cols-5 gap-3">
              <div className="md:col-span-2">
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">School Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Binga High School"
                  required
                  value={schoolForm.name}
                  onChange={(e) => setSchoolForm({ ...schoolForm, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-600 font-medium"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">District</label>
                <input
                  type="text"
                  placeholder="e.g. Binga District"
                  value={schoolForm.district}
                  onChange={(e) => setSchoolForm({ ...schoolForm, district: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-600 font-medium"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Province</label>
                <input
                  type="text"
                  placeholder="e.g. Matabeleland North"
                  value={schoolForm.province}
                  onChange={(e) => setSchoolForm({ ...schoolForm, province: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-600 font-medium"
                />
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shadow-md shadow-indigo-600/20"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  <span>Register School</span>
                </button>
              </div>
            </form>
          </div>

          {/* School List Table */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <span className="font-bold text-slate-900 text-xs">
                Registered Underserved Schools ({filteredSchools.length})
              </span>
              <span className="text-[11px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md font-bold">
                ✓ Auto-Fee Waiver Active
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase font-black text-[10px] tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-3.5">School Name</th>
                    <th className="px-6 py-3.5">District</th>
                    <th className="px-6 py-3.5">Province</th>
                    <th className="px-6 py-3.5">Waiver Status</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {filteredSchools.map(school => (
                    <tr key={school.id} className="hover:bg-slate-50/80 transition">
                      <td className="px-6 py-4 font-bold text-slate-900 flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-indigo-600" />
                        <span>{school.name}</span>
                      </td>
                      <td className="px-6 py-4">{school.district || 'Rural Cluster'}</td>
                      <td className="px-6 py-4">{school.province || 'National'}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <Check className="w-3 h-3" />
                          <span>100% Free Access</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDeleteSchool(school.id, school.name)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition cursor-pointer"
                          title="Remove School"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredSchools.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400 font-medium">
                        No schools matched your search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: UNDERSERVED LOCATIONS */}
      {activeSection === 'regions' && (
        <div className="space-y-6">
          {/* Add Region Form */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-900 text-base mb-1 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-purple-600" />
              <span>Add Underserved Location / District</span>
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Any student registering from or residing in this location or district will automatically be awarded a free equity scholarship.
            </p>

            <form onSubmit={handleAddRegion} className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="md:col-span-2">
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Region / District Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Binga, Mudzi, Epworth, Mwenezi"
                  required
                  value={regionForm.region_name}
                  onChange={(e) => setRegionForm({ ...regionForm, region_name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-purple-600 font-medium"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Province / State</label>
                <input
                  type="text"
                  placeholder="e.g. Masvingo"
                  value={regionForm.province_state}
                  onChange={(e) => setRegionForm({ ...regionForm, province_state: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-purple-600 font-medium"
                />
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shadow-md shadow-purple-600/20"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  <span>Register Location</span>
                </button>
              </div>
            </form>
          </div>

          {/* Region Table */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <span className="font-bold text-slate-900 text-xs">
                Monitored Underserved Areas ({filteredRegions.length})
              </span>
              <span className="text-[11px] text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md font-bold">
                ✓ Geo-Eligibility Active
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase font-black text-[10px] tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-3.5">Region / District</th>
                    <th className="px-6 py-3.5">Province</th>
                    <th className="px-6 py-3.5">Country</th>
                    <th className="px-6 py-3.5">Equity Policy</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {filteredRegions.map(region => (
                    <tr key={region.id} className="hover:bg-slate-50/80 transition">
                      <td className="px-6 py-4 font-bold text-slate-900 flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-purple-600" />
                        <span>{region.region_name}</span>
                      </td>
                      <td className="px-6 py-4">{region.province_state || 'Rural District'}</td>
                      <td className="px-6 py-4">{region.country || 'Zimbabwe'}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-purple-50 text-purple-700 border border-purple-200">
                          <Check className="w-3 h-3" />
                          <span>Fee-Exempt Priority Zone</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDeleteRegion(region.id, region.region_name)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition cursor-pointer"
                          title="Remove Region"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: FREE ACCESS WHITELIST */}
      {activeSection === 'whitelist' && (
        <div className="space-y-6">
          {/* Add User Whitelist Form */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-900 text-base mb-1 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-emerald-600" />
              <span>Grant Direct Free Access (Whitelist Email)</span>
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Add individual students, disabled learners, or community fellows for immediate 100% free platform access.
            </p>

            <form onSubmit={handleAddWhitelist} className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">User Email *</label>
                <input
                  type="email"
                  placeholder="student@example.com"
                  required
                  value={whitelistForm.email}
                  onChange={(e) => setWhitelistForm({ ...whitelistForm, email: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-600 font-medium"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Full Name (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Tendai Moyo"
                  value={whitelistForm.full_name}
                  onChange={(e) => setWhitelistForm({ ...whitelistForm, full_name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-600 font-medium"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Grant Reason / Accommodations</label>
                <input
                  type="text"
                  placeholder="e.g. Disabled STEM Fellow / Rural Grant"
                  value={whitelistForm.reason}
                  onChange={(e) => setWhitelistForm({ ...whitelistForm, reason: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-600 font-medium"
                />
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shadow-md shadow-emerald-600/20"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  <span>Grant Free Access</span>
                </button>
              </div>
            </form>
          </div>

          {/* Whitelist Table */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <span className="font-bold text-slate-900 text-xs">
                Direct Free Access Whitelist ({filteredWhitelist.length})
              </span>
              <span className="text-[11px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md font-bold">
                ✓ Immediate Exemption
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase font-black text-[10px] tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-3.5">Email Address</th>
                    <th className="px-6 py-3.5">Learner Name</th>
                    <th className="px-6 py-3.5">Grant Reason</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {filteredWhitelist.map(item => (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition">
                      <td className="px-6 py-4 font-bold text-slate-900">{item.email}</td>
                      <td className="px-6 py-4">{item.full_name || 'Registered Innovator'}</td>
                      <td className="px-6 py-4">
                        <span className="text-slate-600 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                          {item.reason}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <Check className="w-3 h-3" />
                          <span>Active Exemption</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDeleteWhitelist(item.id, item.email)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition cursor-pointer"
                          title="Revoke Free Access"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 4: ACTIVE SCHOLARSHIP BENEFICIARIES */}
      {activeSection === 'beneficiaries' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-500" />
                <span>Active Equity & Underserved Scholarship Beneficiaries</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Students currently enjoying verified $0 fee access across courses, mentorship, and competitions.
              </p>
            </div>
            <span className="text-xs font-black bg-indigo-50 text-indigo-700 px-3 py-1 rounded-xl">
              {filteredBeneficiaries.length} Enrolled
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-black text-[10px] tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3.5">Learner & Member ID</th>
                  <th className="px-6 py-3.5">School / Location</th>
                  <th className="px-6 py-3.5">Disability Accommodations</th>
                  <th className="px-6 py-3.5">Scholarship Qualification</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredBeneficiaries.map(ben => (
                  <tr key={ben.id} className="hover:bg-slate-50/80 transition">
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-900">{ben.display_name || 'Innovator'}</p>
                      <p className="text-[11px] text-slate-400 font-mono">{ben.email}</p>
                      {ben.member_id && (
                        <span className="text-[9px] bg-slate-100 font-bold px-1.5 py-0.5 rounded text-slate-600 inline-block mt-0.5">
                          {ben.member_id}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-indigo-700">{ben.school_institution || 'Independent Rural Learner'}</p>
                      <p className="text-[10px] text-slate-400">{ben.location_region || 'Zimbabwe'}</p>
                    </td>
                    <td className="px-6 py-4">
                      {ben.disability_type && ben.disability_type !== 'none' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                          ♿ {ben.disability_type.toUpperCase()}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[10px]">Standard Support</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg text-[10px] font-black inline-block">
                        {ben.underserved_scholarship_reason || 'Underserved Area Exemption'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleRevokeBeneficiary(ben.id, ben.display_name)}
                        className="px-3 py-1 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-[10px] font-bold transition cursor-pointer"
                        title="Revoke Scholarship Access"
                      >
                        Revoke
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredBeneficiaries.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400 font-medium">
                      No scholarship beneficiaries found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
