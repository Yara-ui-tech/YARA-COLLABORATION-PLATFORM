import React, { useState, useEffect } from 'react';
import { 
  Handshake, 
  Globe, 
  ExternalLink, 
  ShieldCheck, 
  Mail, 
  Building2, 
  PhoneCall, 
  CheckCircle2,
  Users2,
  FileCheck
} from 'lucide-react';
import SafeguardingNav from '../../components/safeguarding/SafeguardingNav';
import EmergencyHelpBanner from '../../components/safeguarding/EmergencyHelpBanner';
import { safeguardingService } from '../../services/safeguardingService';
import { SafeguardingPartner } from '../../types/safeguarding';

const PartnersCollaborationsPage: React.FC = () => {
  const [partners, setPartners] = useState<SafeguardingPartner[]>([]);
  const [loading, setLoading] = useState(true);
  const [partnerTypeFilter, setPartnerTypeFilter] = useState<string>('all');
  
  // Partnership enquiry form state
  const [enquiry, setEnquiry] = useState({
    organisation: '',
    contactName: '',
    email: '',
    phone: '',
    partnerType: 'ngo',
    message: ''
  });
  const [enquirySent, setEnquirySent] = useState(false);

  useEffect(() => {
    loadPartners();
  }, []);

  const loadPartners = async () => {
    try {
      setLoading(true);
      const data = await safeguardingService.getPartners();
      setPartners(data);
    } catch (err) {
      console.error('Failed to load partners', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEnquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!enquiry.organisation || !enquiry.email) return;
    setEnquirySent(true);
    setTimeout(() => {
      setEnquirySent(false);
      setEnquiry({
        organisation: '',
        contactName: '',
        email: '',
        phone: '',
        partnerType: 'ngo',
        message: ''
      });
    }, 4000);
  };

  const filterTabs = [
    { id: 'all', label: 'All Collaborators' },
    { id: 'statutory', label: 'Statutory & Government' },
    { id: 'un_agency', label: 'UN Agencies' },
    { id: 'gbv_support', label: 'GBV Response' },
    { id: 'mental_health', label: 'Psychosocial Care' },
    { id: 'ngo', label: 'Civil Society & NGOs' }
  ];

  const filteredPartners = partners.filter(p => {
    if (partnerTypeFilter === 'all') return true;
    return p.partner_type === partnerTypeFilter;
  });

  return (
    <div className="min-h-screen bg-[#F8FAFF] text-[#1E293B]">
      <EmergencyHelpBanner />
      <SafeguardingNav />

      {/* Hero Header */}
      <section className="bg-gradient-to-r from-[#0A1B4D] via-[#0D47A1] to-[#1976D2] text-white py-14 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-[#00C6FF] text-xs font-semibold mb-4">
            <Handshake className="w-4 h-4" />
            Strategic Referral Alliances & Institutional Alliances
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight mb-4">
            Safeguarding Partners & Referral Network
          </h1>
          <p className="text-lg text-blue-100 max-w-3xl mx-auto leading-relaxed">
            Protecting young roboticists through certified multi-sector partnerships with statutory child protection bodies, UN agencies, certified GBV shelters, clinical trauma providers, and government ministries across Zimbabwe.
          </p>
        </div>
      </section>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Core Pillars of Collaboration */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white p-6 rounded-2xl border border-[#CBD5E1] shadow-sm flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#E8F4FF] text-[#0D47A1] flex items-center justify-center flex-shrink-0">
              <PhoneCall className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#0A1B4D] mb-1">Direct 24/7 Crisis Escalation</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Toll-free hotlines integrated with Childline (116) and Musasa (08080074) for immediate emergency intervention and rescue.
              </p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[#CBD5E1] shadow-sm flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center flex-shrink-0">
              <FileCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#0A1B4D] mb-1">Standardized Vetting & Audits</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Mentor background vetting, criminal record reviews, and child safety compliance audits validated with youth development ministries.
              </p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[#CBD5E1] shadow-sm flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center flex-shrink-0">
              <Users2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#0A1B4D] mb-1">Psychosocial Rehabilitation</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Evidence-based mental health counseling via Friendship Bench and clinical post-exposure prophylaxis (PEP) at Parirenyatwa ARC.
              </p>
            </div>
          </div>
        </div>

        {/* Filter Badges */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-thin">
          {filterTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setPartnerTypeFilter(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                partnerTypeFilter === tab.id
                  ? 'bg-[#0A1B4D] text-white shadow'
                  : 'bg-white border border-[#CBD5E1] text-slate-700 hover:bg-[#E8F4FF]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Partners Grid */}
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-12 h-12 border-4 border-[#0D47A1] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-600 font-medium">Loading partner directory...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {filteredPartners.map(partner => (
              <div
                key={partner.id}
                className="bg-white rounded-3xl border border-[#CBD5E1] p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#E8F4FF] text-[#0D47A1]">
                      {partner.partner_type.replace('_', ' ')}
                    </span>
                    <span className="text-xs font-medium text-slate-400">
                      {partner.country}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-[#0A1B4D] group-hover:text-[#1976D2] transition-colors mb-2">
                    {partner.name}
                  </h3>

                  <p className="text-sm text-slate-600 mb-4 line-clamp-3 leading-relaxed">
                    {partner.description}
                  </p>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 mb-4">
                    <p className="text-xs font-bold text-[#0A1B4D] mb-1">Collaboration Scope:</p>
                    <p className="text-xs text-slate-600">{partner.collaboration_scope}</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#CBD5E1] flex items-center justify-between">
                  {partner.website ? (
                    <a
                      href={partner.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0D47A1] hover:text-[#00C6FF] transition-colors"
                    >
                      <Globe className="w-3.5 h-3.5" />
                      Visit Portal
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <span className="text-xs text-slate-400">Institutional Partner</span>
                  )}

                  {partner.contact_person && (
                    <span className="text-xs text-slate-500 font-mono">
                      Ref: {partner.contact_person}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Partnership Enquiry Section */}
        <section className="bg-white rounded-3xl border border-[#CBD5E1] p-8 sm:p-12 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8F4FF] text-[#0D47A1] text-xs font-bold uppercase tracking-wider mb-4">
                <Handshake className="w-4 h-4" />
                Partner With YARA
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-[#0A1B4D] mb-4">
                Become a Certified Safeguarding & Youth Welfare Partner
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed mb-6">
                Are you an NGO, academic institution, healthcare provider, legal aid clinic, or development partner working on child rights and gender equality? Join our national coalition to expand safe STEM opportunities for African youth.
              </p>

              <div className="space-y-3 text-xs text-slate-600">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Joint training workshops & child rights advocacy</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Cross-referral mechanisms for youth in distress</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Co-branded resource toolkits and safety audits</span>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="bg-[#F8FAFF] p-6 sm:p-8 rounded-2xl border border-[#CBD5E1]">
              {enquirySent ? (
                <div className="py-10 text-center">
                  <CheckCircle2 className="w-14 h-14 text-emerald-500 mx-auto mb-3 animate-bounce" />
                  <h3 className="text-lg font-bold text-[#0A1B4D] mb-1">Partnership Enquiry Submitted!</h3>
                  <p className="text-xs text-slate-600 max-w-sm mx-auto">
                    Thank you. Our Chief Safeguarding Officer will review your organisation details and reach out within 2 business days.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleEnquirySubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#0A1B4D] uppercase tracking-wider mb-1">
                        Organisation Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={enquiry.organisation}
                        onChange={e => setEnquiry({ ...enquiry, organisation: e.target.value })}
                        placeholder="e.g. Save the Children / Youth Tech Org"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] bg-white text-[#1E293B] text-xs focus:ring-2 focus:ring-[#00C6FF]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#0A1B4D] uppercase tracking-wider mb-1">
                        Contact Person Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={enquiry.contactName}
                        onChange={e => setEnquiry({ ...enquiry, contactName: e.target.value })}
                        placeholder="e.g. Dr. Nyasha Ndlovu"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] bg-white text-[#1E293B] text-xs focus:ring-2 focus:ring-[#00C6FF]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#0A1B4D] uppercase tracking-wider mb-1">
                        Official Email *
                      </label>
                      <input
                        type="email"
                        required
                        value={enquiry.email}
                        onChange={e => setEnquiry({ ...enquiry, email: e.target.value })}
                        placeholder="e.g. partnerships@org.org"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] bg-white text-[#1E293B] text-xs focus:ring-2 focus:ring-[#00C6FF]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#0A1B4D] uppercase tracking-wider mb-1">
                        Phone / WhatsApp
                      </label>
                      <input
                        type="text"
                        value={enquiry.phone}
                        onChange={e => setEnquiry({ ...enquiry, phone: e.target.value })}
                        placeholder="+263 77..."
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] bg-white text-[#1E293B] text-xs focus:ring-2 focus:ring-[#00C6FF]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#0A1B4D] uppercase tracking-wider mb-1">
                      Partner Category
                    </label>
                    <select
                      value={enquiry.partnerType}
                      onChange={e => setEnquiry({ ...enquiry, partnerType: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] bg-white text-[#1E293B] text-xs focus:ring-2 focus:ring-[#00C6FF]"
                    >
                      <option value="ngo">Civil Society / Non-Governmental Organization</option>
                      <option value="statutory">Government Agency / Ministry</option>
                      <option value="un_agency">UN Agency or International Diplomatic Mission</option>
                      <option value="gbv_support">GBV / Crisis Response Shelter</option>
                      <option value="mental_health">Mental Health & Psychological Services</option>
                      <option value="corporate">Corporate / CSR Foundation</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#0A1B4D] uppercase tracking-wider mb-1">
                      Proposed Collaboration Scope
                    </label>
                    <textarea
                      rows={3}
                      value={enquiry.message}
                      onChange={e => setEnquiry({ ...enquiry, message: e.target.value })}
                      placeholder="Outline how your organisation wishes to support YARA safeguarding, child protection, or mental health initiatives..."
                      className="w-full px-3.5 py-2 rounded-xl border border-[#CBD5E1] bg-white text-[#1E293B] text-xs focus:ring-2 focus:ring-[#00C6FF]"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-[#0D47A1] text-white font-bold text-xs hover:bg-[#0A1B4D] transition-colors shadow"
                  >
                    Submit Partnership Expression of Interest
                  </button>
                </form>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default PartnersCollaborationsPage;
