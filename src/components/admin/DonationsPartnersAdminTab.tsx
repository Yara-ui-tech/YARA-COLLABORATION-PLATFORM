import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  Handshake, 
  Users, 
  CreditCard, 
  CheckCircle2, 
  XCircle, 
  Eye, 
  Trash2, 
  Sparkles, 
  DollarSign, 
  Building, 
  Search, 
  RefreshCw, 
  Plus, 
  Edit3, 
  Save, 
  Smartphone, 
  ExternalLink,
  ShieldCheck,
  Award
} from 'lucide-react';
import { 
  PartnershipRequest, 
  DonationSponsorship, 
  Volunteer, 
  UserSubscription,
  ChallengeFeeConfig 
} from '../../types/partnershipsAndDonations';
import { 
  getPartnershipRequests, 
  updatePartnershipStatus,
  getDonationsAndSponsorships,
  updateDonationStatus,
  getVolunteers,
  updateVolunteerStatus,
  getAllSubscriptions,
  approveUserSubscription,
  getChallengeFeesConfig,
  saveChallengeFeesConfig,
  YARA_PAYMENT_CONFIG
} from '../../services/partnershipDonationService';

export default function DonationsPartnersAdminTab() {
  const [subTab, setSubTab] = useState<'subscriptions' | 'donations' | 'partnerships' | 'volunteers' | 'fees'>('subscriptions');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Subscriptions State
  const [subscriptions, setSubscriptions] = useState<UserSubscription[]>([]);
  
  // Donations State
  const [donations, setDonations] = useState<DonationSponsorship[]>([]);

  // Partnerships State
  const [partnerships, setPartnerships] = useState<PartnershipRequest[]>([]);

  // Volunteers State
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);

  // Challenge Fees State
  const [challengeFees, setChallengeFees] = useState<ChallengeFeeConfig[]>([]);
  const [isSavingFees, setIsSavingFees] = useState(false);

  // Filter
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadAllData();
  }, [subTab]);

  const loadAllData = async () => {
    setLoading(true);
    try {
      if (subTab === 'subscriptions') {
        const subs = await getAllSubscriptions();
        setSubscriptions(subs);
      } else if (subTab === 'donations') {
        const dons = await getDonationsAndSponsorships();
        setDonations(dons);
      } else if (subTab === 'partnerships') {
        const parts = await getPartnershipRequests();
        setPartnerships(parts);
      } else if (subTab === 'volunteers') {
        const vols = await getVolunteers();
        setVolunteers(vols);
      } else if (subTab === 'fees') {
        const fees = await getChallengeFeesConfig();
        setChallengeFees(fees);
      }
    } catch (e: any) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const showMsg = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 3500);
  };

  // Subscription Handlers
  const handleApproveSubscription = async (sub: UserSubscription) => {
    const success = await approveUserSubscription(sub.id, sub.user_id, 30);
    if (success) {
      showMsg(`Subscription approved for ${sub.user_email}! User now has active access.`);
      loadAllData();
    } else {
      showMsg('Failed to approve subscription.');
    }
  };

  // Partnership Handlers
  const handlePartnerAction = async (id: string, status: 'approved' | 'rejected', display: boolean) => {
    const ok = await updatePartnershipStatus(id, status, display);
    if (ok) {
      showMsg(`Partnership updated to ${status}.`);
      loadAllData();
    }
  };

  // Donation Handlers
  const handleDonationAction = async (id: string, status: 'pending' | 'approved' | 'received', popHome: boolean, wall: boolean) => {
    const ok = await updateDonationStatus(id, status, popHome, wall);
    if (ok) {
      showMsg(`Donation status updated to ${status}.`);
      loadAllData();
    }
  };

  // Volunteer Handlers
  const handleVolunteerAction = async (id: string, status: 'approved' | 'rejected') => {
    const ok = await updateVolunteerStatus(id, status);
    if (ok) {
      showMsg(`Volunteer status updated to ${status}.`);
      loadAllData();
    }
  };

  // Challenge Fees Handlers
  const handleFeeChange = (index: number, field: keyof ChallengeFeeConfig, val: any) => {
    const updated = [...challengeFees];
    updated[index] = { ...updated[index], [field]: val };
    setChallengeFees(updated);
  };

  const handleSaveFees = async () => {
    setIsSavingFees(true);
    try {
      const ok = await saveChallengeFeesConfig(challengeFees);
      if (ok) showMsg('Competition & Challenge Registration Fees saved successfully!');
    } catch (e: any) {
      showMsg('Failed to save fees: ' + e.message);
    } finally {
      setIsSavingFees(false);
    }
  };

  const handleAddChallengeFee = () => {
    const newId = 'challenge_' + Date.now();
    setChallengeFees([
      ...challengeFees,
      {
        challenge_id: newId,
        challenge_name: 'New Custom Robotics Challenge',
        fee_amount: 10,
        currency: 'USD',
        is_required: true,
        payment_instructions: `EcoCash to ${YARA_PAYMENT_CONFIG.ecocashNumber} (${YARA_PAYMENT_CONFIG.accountName})`,
        ecocash_number: YARA_PAYMENT_CONFIG.ecocashNumber,
        account_name: YARA_PAYMENT_CONFIG.accountName
      }
    ]);
  };

  const handleRemoveChallengeFee = (index: number) => {
    const updated = challengeFees.filter((_, i) => i !== index);
    setChallengeFees(updated);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner / Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
            <Heart className="w-5 h-5 text-rose-500" />
            <span>Donations, Partnerships & Subscriptions Hub</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Verify member subscriptions, approve sponsors & donations, manage volunteers, and set challenge fees.
          </p>
        </div>

        <div className="flex flex-wrap gap-1.5 p-1 bg-slate-100 rounded-2xl">
          {[
            { id: 'subscriptions', label: 'Subscriptions & Proofs', icon: CreditCard },
            { id: 'donations', label: 'Donations & Sponsors', icon: Heart },
            { id: 'partnerships', label: 'Partnership Requests', icon: Handshake },
            { id: 'volunteers', label: 'Volunteers', icon: Users },
            { id: 'fees', label: 'Challenge Fees', icon: DollarSign },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = subTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSubTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
                  isActive 
                    ? 'bg-white text-indigo-600 shadow-sm' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {feedback && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center space-x-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Subtab 1: Subscriptions Verification */}
      {subTab === 'subscriptions' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-base text-slate-900">Member Subscription Approvals</h3>
              <p className="text-xs text-slate-500">
                Verify user payment references (EcoCash {YARA_PAYMENT_CONFIG.ecocashNumber}) and activate 30-day access with 1 click.
              </p>
            </div>

            <button
              onClick={loadAllData}
              disabled={loading}
              className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase border-b border-slate-100">
                <tr>
                  <th className="p-3">User / Email</th>
                  <th className="p-3">Method & Reference</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Submitted</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {subscriptions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400">
                      No subscription payment submissions recorded yet.
                    </td>
                  </tr>
                ) : (
                  subscriptions.map(sub => (
                    <tr key={sub.id} className="hover:bg-slate-50/60">
                      <td className="p-3">
                        <p className="font-bold text-slate-900">{sub.user_name || sub.user_email}</p>
                        <p className="text-[11px] text-slate-400 font-mono">{sub.user_email}</p>
                        {sub.member_id && <span className="text-[10px] text-indigo-600 font-mono">{sub.member_id}</span>}
                      </td>
                      <td className="p-3">
                        <span className="font-bold text-slate-800">{sub.payment_method}</span>
                        <p className="font-mono text-indigo-600 font-bold">{sub.payment_reference}</p>
                      </td>
                      <td className="p-3 font-bold font-mono">
                        ${sub.amount} {sub.currency}
                      </td>
                      <td className="p-3">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          sub.status === 'active' 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : sub.status === 'pending_verification'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          {sub.status}
                        </span>
                      </td>
                      <td className="p-3 text-slate-400">
                        {new Date(sub.created_at).toLocaleDateString()}
                      </td>
                      <td className="p-3 text-right space-x-2">
                        {sub.status !== 'active' && (
                          <button
                            onClick={() => handleApproveSubscription(sub)}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1.5 rounded-xl text-xs shadow-sm transition"
                          >
                            Approve & Activate
                          </button>
                        )}
                        {sub.status === 'active' && (
                          <span className="text-xs text-emerald-600 font-bold">Active</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Subtab 2: Donations & Sponsors */}
      {subTab === 'donations' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-slate-900">Donations & Support Submissions</h3>
              <p className="text-xs text-slate-500">
                Approve donor names and contributions to display on the public honors wall.
              </p>
            </div>
            <button
              onClick={loadAllData}
              className="text-xs text-slate-600 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl font-bold transition"
            >
              Refresh
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase border-b border-slate-100">
                <tr>
                  <th className="p-3">Donor / Organization</th>
                  <th className="p-3">Type & Details</th>
                  <th className="p-3">Contact</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {donations.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-400">
                      No donations submitted yet.
                    </td>
                  </tr>
                ) : (
                  donations.map(don => (
                    <tr key={don.id} className="hover:bg-slate-50/60">
                      <td className="p-3">
                        <p className="font-bold text-slate-900">
                          {don.donor_name} {don.is_anonymous && '(Anon)'}
                        </p>
                        {don.organization && <p className="text-[11px] text-slate-500">{don.organization}</p>}
                      </td>
                      <td className="p-3 space-y-1">
                        <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-bold text-[10px] uppercase">
                          {don.support_type}
                        </span>
                        {don.amount && (
                          <p className="font-bold text-emerald-600 font-mono">
                            ${don.amount} {don.currency} • Ref: {don.transaction_reference || 'N/A'}
                          </p>
                        )}
                        {don.in_kind_description && (
                          <p className="text-slate-600 text-[11px] italic max-w-xs">{don.in_kind_description}</p>
                        )}
                        {don.message && <p className="text-slate-400 text-[10px]">"{don.message}"</p>}
                      </td>
                      <td className="p-3 text-slate-500">
                        <p>{don.email || '-'}</p>
                        <p>{don.phone || '-'}</p>
                      </td>
                      <td className="p-3">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          don.status === 'approved' || don.status === 'received'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {don.status}
                        </span>
                      </td>
                      <td className="p-3 text-right space-x-2">
                        {don.status !== 'approved' && don.status !== 'received' ? (
                          <button
                            onClick={() => handleDonationAction(don.id, 'approved', true, true)}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1.5 rounded-xl text-xs transition"
                          >
                            Approve for Wall
                          </button>
                        ) : (
                          <button
                            onClick={() => handleDonationAction(don.id, 'pending', false, false)}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-3 py-1.5 rounded-xl text-xs transition"
                          >
                            Unpublish
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Subtab 3: Partnerships */}
      {subTab === 'partnerships' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-slate-900">Strategic Partnership Requests</h3>
              <p className="text-xs text-slate-500">
                Review organizational specialty, expectations, and approve logos to appear on the Partners page.
              </p>
            </div>
            <button onClick={loadAllData} className="text-xs text-slate-600 bg-slate-100 px-3 py-1.5 rounded-xl font-bold">
              Refresh
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {partnerships.length === 0 ? (
              <div className="col-span-full p-8 text-center text-slate-400 text-xs">
                No partnership requests found.
              </div>
            ) : (
              partnerships.map(partner => (
                <div key={partner.id} className="p-5 rounded-2xl border border-slate-200/80 bg-slate-50 space-y-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-black text-sm text-slate-900">{partner.organization_name}</h4>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        partner.status === 'approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {partner.status}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2 text-[10px]">
                      <span className="bg-indigo-100 text-indigo-800 font-bold px-2 py-0.5 rounded">
                        {partner.specialty_area}
                      </span>
                      <span className="bg-slate-200 text-slate-700 font-bold px-2 py-0.5 rounded">
                        {partner.partnership_type}
                      </span>
                    </div>

                    <p className="text-xs text-slate-700 leading-relaxed font-medium">
                      <strong>Expectations:</strong> {partner.expectations}
                    </p>

                    <div className="text-[11px] text-slate-500">
                      <span>Contact: <strong>{partner.contact_person}</strong> ({partner.email} | {partner.phone || 'No phone'})</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                    <div className="text-[10px] text-slate-400">
                      {new Date(partner.created_at).toLocaleDateString()}
                    </div>

                    <div className="space-x-2">
                      {partner.status !== 'approved' ? (
                        <button
                          onClick={() => handlePartnerAction(partner.id, 'approved', true)}
                          className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-3 py-1.5 rounded-xl text-xs transition"
                        >
                          Approve & Publish
                        </button>
                      ) : (
                        <button
                          onClick={() => handlePartnerAction(partner.id, 'rejected', false)}
                          className="bg-rose-100 hover:bg-rose-200 text-rose-800 font-bold px-3 py-1.5 rounded-xl text-xs transition"
                        >
                          Revoke / Hide
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Subtab 4: Volunteers */}
      {subTab === 'volunteers' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-slate-900">Volunteer Corps Applications</h3>
              <p className="text-xs text-slate-500">
                Review applicants by category (Technical Judges, Youth Mentors, Logistics, Safety).
              </p>
            </div>
            <button onClick={loadAllData} className="text-xs text-slate-600 bg-slate-100 px-3 py-1.5 rounded-xl font-bold">
              Refresh
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase border-b border-slate-100">
                <tr>
                  <th className="p-3">Applicant Name</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Location & Availability</th>
                  <th className="p-3">Skills / Motivation</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {volunteers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400">
                      No volunteer applications received yet.
                    </td>
                  </tr>
                ) : (
                  volunteers.map(vol => (
                    <tr key={vol.id} className="hover:bg-slate-50/60">
                      <td className="p-3">
                        <p className="font-bold text-slate-900">{vol.full_name}</p>
                        <p className="text-[11px] text-slate-400">{vol.email} • {vol.phone}</p>
                      </td>
                      <td className="p-3">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-800 uppercase">
                          {vol.category.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="p-3 text-slate-600">
                        <p className="font-bold">{vol.province || vol.country}</p>
                        <p className="text-[10px] text-slate-400">{vol.availability}</p>
                      </td>
                      <td className="p-3 max-w-xs">
                        <p className="text-slate-700 truncate font-medium">{vol.skills_background || 'None specified'}</p>
                        {vol.motivation && <p className="text-[10px] text-slate-400 italic truncate">"{vol.motivation}"</p>}
                      </td>
                      <td className="p-3">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          vol.status === 'approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {vol.status}
                        </span>
                      </td>
                      <td className="p-3 text-right space-x-2">
                        {vol.status !== 'approved' ? (
                          <button
                            onClick={() => handleVolunteerAction(vol.id, 'approved')}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1.5 rounded-xl text-xs transition"
                          >
                            Approve
                          </button>
                        ) : (
                          <button
                            onClick={() => handleVolunteerAction(vol.id, 'rejected')}
                            className="bg-slate-200 text-slate-700 font-bold px-3 py-1.5 rounded-xl text-xs transition"
                          >
                            Reject
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Subtab 5: Challenge Registration Fees */}
      {subTab === 'fees' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-base text-slate-900">Competition & Challenge Registration Fees</h3>
              <p className="text-xs text-slate-500">
                Configure required entry fees for specific robotics challenges (set to $0 for free entry).
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={handleAddChallengeFee}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-3.5 py-2 rounded-xl text-xs flex items-center space-x-1.5 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Challenge Entry</span>
              </button>

              <button
                type="button"
                onClick={handleSaveFees}
                disabled={isSavingFees}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-5 py-2 rounded-xl text-xs flex items-center space-x-1.5 shadow-md shadow-indigo-600/20 transition"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isSavingFees ? 'Saving...' : 'Save Fee Settings'}</span>
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {challengeFees.map((fee, idx) => (
              <div key={fee.challenge_id || idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                  <div className="sm:col-span-5">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Challenge / Category Name</label>
                    <input
                      type="text"
                      value={fee.challenge_name}
                      onChange={e => handleFeeChange(idx, 'challenge_name', e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:border-indigo-600 focus:outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Fee ($ / USD)</label>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={fee.fee_amount}
                      onChange={e => handleFeeChange(idx, 'fee_amount', Number(e.target.value))}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-black text-slate-900 focus:border-indigo-600 focus:outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Currency</label>
                    <select
                      value={fee.currency}
                      onChange={e => handleFeeChange(idx, 'currency', e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:border-indigo-600 focus:outline-none"
                    >
                      <option value="USD">USD ($)</option>
                      <option value="ZiG">ZiG</option>
                      <option value="ZAR">ZAR</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2 flex items-center pt-4">
                    <label className="flex items-center space-x-2 text-xs text-slate-700 font-bold">
                      <input
                        type="checkbox"
                        checked={fee.is_required}
                        onChange={e => handleFeeChange(idx, 'is_required', e.target.checked)}
                        className="rounded text-indigo-600"
                      />
                      <span>Fee Required</span>
                    </label>
                  </div>

                  <div className="sm:col-span-1 pt-4 text-right">
                    <button
                      type="button"
                      onClick={() => handleRemoveChallengeFee(idx)}
                      className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                    Payment Instructions & EcoCash Details
                  </label>
                  <input
                    type="text"
                    value={fee.payment_instructions || ''}
                    onChange={e => handleFeeChange(idx, 'payment_instructions', e.target.value)}
                    placeholder={`e.g. EcoCash to ${YARA_PAYMENT_CONFIG.ecocashNumber} (${YARA_PAYMENT_CONFIG.accountName})`}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:border-indigo-600 focus:outline-none"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
