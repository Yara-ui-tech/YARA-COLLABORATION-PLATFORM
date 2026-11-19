import React, { useState, useEffect } from 'react';
import { 
  Building, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  UserCheck, 
  Search, 
  Mail, 
  Phone, 
  FileCheck2,
  FileSignature,
  HelpCircle,
  ExternalLink
} from 'lucide-react';
import SafeguardingNav from '../../components/safeguarding/SafeguardingNav';
import EmergencyHelpBanner from '../../components/safeguarding/EmergencyHelpBanner';
import { safeguardingService } from '../../services/safeguardingService';
import { SafeguardingChapterCompliance } from '../../types/safeguarding';

const ChapterSafeguardingPage: React.FC = () => {
  const [chapters, setChapters] = useState<SafeguardingChapterCompliance[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Digital pledge modal state
  const [showPledgeModal, setShowPledgeModal] = useState(false);
  const [pledgeForm, setPledgeForm] = useState({
    fullName: '',
    email: '',
    chapterName: '',
    role: 'Chapter Executive',
    agreedToAll: false
  });
  const [pledgeSigned, setPledgeSigned] = useState(false);

  useEffect(() => {
    loadChapters();
  }, []);

  const loadChapters = async () => {
    try {
      setLoading(true);
      const data = await safeguardingService.getChapterCompliance();
      setChapters(data);
    } catch (err) {
      console.error('Failed to load chapters', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePledgeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pledgeForm.fullName || !pledgeForm.email || !pledgeForm.agreedToAll) return;
    setPledgeSigned(true);
    setTimeout(() => {
      setPledgeSigned(false);
      setShowPledgeModal(false);
      setPledgeForm({
        fullName: '',
        email: '',
        chapterName: '',
        role: 'Chapter Executive',
        agreedToAll: false
      });
    }, 3500);
  };

  const filteredChapters = chapters.filter(chap => {
    const matchesStatus = statusFilter === 'all' || chap.compliance_status === statusFilter;
    const matchesSearch = 
      chap.chapter_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      chap.designated_officer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      chap.institution_type.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status: SafeguardingChapterCompliance['compliance_status']) => {
    switch (status) {
      case 'compliant':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Certified Compliant
          </span>
        );
      case 'under_review':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            Audit Under Review
          </span>
        );
      case 'overdue':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
            Compliance Overdue
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFF] text-[#1E293B]">
      <EmergencyHelpBanner />
      <SafeguardingNav />

      {/* Hero Header */}
      <section className="bg-gradient-to-r from-[#0A1B4D] via-[#0D47A1] to-[#1976D2] text-white py-14 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-[#00C6FF] text-xs font-semibold mb-4">
            <ShieldCheck className="w-4 h-4" />
            Decentralized Chapter Governance & Accountability
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight mb-4">
            Chapter Safeguarding & Compliance
          </h1>
          <p className="text-lg text-blue-100 max-w-3xl mx-auto leading-relaxed">
            Every university chapter, high school robotics club, and community maker space must appoint a vetted Designated Safeguarding Lead and maintain annual child protection certification.
          </p>
        </div>
      </section>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Three Chapter Mandates */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white p-6 rounded-2xl border border-[#CBD5E1] shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-[#E8F4FF] text-[#0D47A1] flex items-center justify-center font-bold mb-4">
              1
            </div>
            <h3 className="text-base font-bold text-[#0A1B4D] mb-1">Designated Safeguarding Lead (DSL)</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Every chapter must have at least one executive certified under the YARA Safeguarding Protocol to handle local disclosures and mentor vetting.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[#CBD5E1] shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-[#E8F4FF] text-[#0D47A1] flex items-center justify-center font-bold mb-4">
              2
            </div>
            <h3 className="text-base font-bold text-[#0A1B4D] mb-1">Annual Safety & Risk Audits</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Robotics labs, soldering stations, battery charging bays, and travel excursions must pass YARA safe environment criteria prior to hosting minors.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[#CBD5E1] shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-[#E8F4FF] text-[#0D47A1] flex items-center justify-center font-bold mb-4">
              3
            </div>
            <h3 className="text-base font-bold text-[#0A1B4D] mb-1">Zero Retaliation Guarantee</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Chapters found obstructing safeguarding reports, silencing whistleblowers, or covering misconduct face immediate charter revocation and legal referral.
            </p>
          </div>
        </div>

        {/* Digital Pledge Action Banner */}
        <div className="bg-gradient-to-r from-[#0A1B4D] to-[#0D47A1] rounded-3xl p-6 sm:p-8 text-white shadow-md mb-12 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#00C6FF]/20 border border-[#00C6FF]/40 text-[#00C6FF] flex items-center justify-center flex-shrink-0">
              <FileSignature className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Are You a Chapter Leader or Mentor?</h3>
              <p className="text-xs sm:text-sm text-blue-100 max-w-xl">
                Sign the official 2026 YARA Safeguarding & Child Protection Code of Conduct Pledge to activate your chapter's active status.
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowPledgeModal(true)}
            className="px-6 py-3 rounded-xl bg-[#00C6FF] text-[#0A1B4D] hover:bg-cyan-300 font-extrabold text-xs whitespace-nowrap transition-colors shadow"
          >
            Sign Digital Safeguarding Pledge
          </button>
        </div>

        {/* Chapter Compliance Directory */}
        <div className="bg-white rounded-3xl border border-[#CBD5E1] p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-black text-[#0A1B4D]">Chapter Safeguarding Compliance Registry</h2>
              <p className="text-xs text-slate-600">Real-time status of university chapters, polytechnics, and school clubs across Zimbabwe.</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  placeholder="Filter chapters or officers..."
                  className="pl-9 pr-3 py-2 text-xs rounded-xl border border-[#CBD5E1] bg-white text-[#1E293B] focus:ring-2 focus:ring-[#00C6FF]"
                />
              </div>

              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="px-3 py-2 text-xs rounded-xl border border-[#CBD5E1] bg-white text-[#1E293B] focus:ring-2 focus:ring-[#00C6FF]"
              >
                <option value="all">All Audit Statuses</option>
                <option value="compliant">Certified Compliant</option>
                <option value="under_review">Audit Under Review</option>
                <option value="overdue">Compliance Overdue</option>
              </select>
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div className="py-20 text-center">
              <div className="w-10 h-10 border-4 border-[#0D47A1] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-slate-600 text-sm">Verifying chapter compliance records...</p>
            </div>
          ) : filteredChapters.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-sm">
              No chapters match the selected criteria.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-[#1E293B]">
                <thead className="bg-[#E8F4FF] text-[#0A1B4D] uppercase font-bold tracking-wider">
                  <tr>
                    <th className="py-3 px-4 rounded-l-xl">Chapter / Institution</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Designated Safety Lead</th>
                    <th className="py-3 px-4">Contact</th>
                    <th className="py-3 px-4">Last Audit</th>
                    <th className="py-3 px-4 rounded-r-xl">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredChapters.map(chap => (
                    <tr key={chap.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-4 font-bold text-[#0A1B4D]">
                        <div className="flex items-center gap-2">
                          <Building className="w-4 h-4 text-[#1976D2] flex-shrink-0" />
                          <span>{chap.chapter_name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 capitalize text-slate-600">
                        {chap.institution_type}
                      </td>
                      <td className="py-4 px-4 font-semibold text-[#0A1B4D]">
                        {chap.designated_officer_name}
                      </td>
                      <td className="py-4 px-4 text-slate-500">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5">
                            <Mail className="w-3 h-3 text-slate-400" />
                            <span>{chap.designated_officer_email}</span>
                          </div>
                          {chap.designated_officer_phone && (
                            <div className="flex items-center gap-1.5">
                              <Phone className="w-3 h-3 text-slate-400" />
                              <span>{chap.designated_officer_phone}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-slate-500">
                        {chap.last_audit_date}
                      </td>
                      <td className="py-4 px-4">
                        {getStatusBadge(chap.compliance_status)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Digital Pledge Modal */}
      {showPledgeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 border border-[#CBD5E1] shadow-2xl relative">
            <h3 className="text-xl font-black text-[#0A1B4D] mb-1">
              YARA Safeguarding & Child Protection Pledge
            </h3>
            <p className="text-xs text-slate-600 mb-5">
              Mandatory digital declaration for Chapter Executives, Club Patrons, and Competition Referees.
            </p>

            {pledgeSigned ? (
              <div className="py-8 text-center">
                <CheckCircle2 className="w-14 h-14 text-emerald-500 mx-auto mb-3 animate-bounce" />
                <h4 className="text-lg font-bold text-[#0A1B4D] mb-1">Pledge Confirmed & Registered!</h4>
                <p className="text-xs text-slate-600 max-w-sm mx-auto">
                  Your commitment has been logged into the YARA National Safeguarding Audit Registry. Your digital certificate has been issued.
                </p>
              </div>
            ) : (
              <form onSubmit={handlePledgeSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#0A1B4D] uppercase tracking-wider mb-1">
                    Full Legal Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={pledgeForm.fullName}
                    onChange={e => setPledgeForm({ ...pledgeForm, fullName: e.target.value })}
                    placeholder="e.g. Farai Chidzero"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] bg-white text-[#1E293B] text-xs focus:ring-2 focus:ring-[#00C6FF]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0A1B4D] uppercase tracking-wider mb-1">
                    Official Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={pledgeForm.email}
                    onChange={e => setPledgeForm({ ...pledgeForm, email: e.target.value })}
                    placeholder="e.g. farai@uz.ac.zw"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] bg-white text-[#1E293B] text-xs focus:ring-2 focus:ring-[#00C6FF]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0A1B4D] uppercase tracking-wider mb-1">
                    Chapter / University / School *
                  </label>
                  <input
                    type="text"
                    required
                    value={pledgeForm.chapterName}
                    onChange={e => setPledgeForm({ ...pledgeForm, chapterName: e.target.value })}
                    placeholder="e.g. University of Zimbabwe Chapter"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] bg-white text-[#1E293B] text-xs focus:ring-2 focus:ring-[#00C6FF]"
                  />
                </div>

                {/* Commitments checklist */}
                <div className="p-4 rounded-xl bg-[#E8F4FF] border border-blue-200 text-xs text-[#0A1B4D] space-y-2">
                  <p className="font-bold">By signing, I solemnly commit to:</p>
                  <ul className="list-disc pl-4 space-y-1 text-slate-700">
                    <li>Never be alone in private with a minor student during YARA activities.</li>
                    <li>Ensure 50% female participation and equal access to robotics hardware.</li>
                    <li>Immediately escalate any disclosure of child abuse or GBV to the 116 Childline hotline and YARA Safeguarding Directorate.</li>
                    <li>Uphold the laws of Zimbabwe regarding child welfare, sexual offences, and youth safety.</li>
                  </ul>
                </div>

                <label className="flex items-start gap-2.5 cursor-pointer pt-2">
                  <input
                    type="checkbox"
                    required
                    checked={pledgeForm.agreedToAll}
                    onChange={e => setPledgeForm({ ...pledgeForm, agreedToAll: e.target.checked })}
                    className="mt-0.5 rounded text-[#0D47A1] focus:ring-[#00C6FF]"
                  />
                  <span className="text-xs text-slate-700 leading-snug">
                    I declare under penalty of immediate expulsion and statutory referral that I agree unconditionally to the YARA Safeguarding Policy & Code of Conduct.
                  </span>
                </label>

                <div className="pt-3 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowPledgeModal(false)}
                    className="px-4 py-2 rounded-xl border border-[#CBD5E1] text-slate-600 text-xs font-bold hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-[#0D47A1] text-white text-xs font-bold hover:bg-[#0A1B4D] transition-colors shadow"
                  >
                    Sign & Register Pledge
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChapterSafeguardingPage;