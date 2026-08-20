import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Handshake, 
  GraduationCap, 
  School, 
  Building2, 
  Landmark, 
  HeartHandshake, 
  CheckCircle2, 
  Send, 
  Sparkles, 
  Globe, 
  Mail, 
  Phone, 
  Cpu, 
  Award, 
  ShieldCheck, 
  ArrowRight,
  PlusCircle,
  ExternalLink
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { 
  PartnershipRequest, 
  SpecialtyArea, 
  PartnershipType 
} from '../types/partnershipsAndDonations';
import { 
  submitPartnershipRequest, 
  getApprovedPartners, 
  YARA_PAYMENT_CONFIG 
} from '../services/partnershipDonationService';

export default function Partners() {
  const [approvedPartners, setApprovedPartners] = useState<PartnershipRequest[]>([]);
  const [loadingPartners, setLoadingPartners] = useState(true);

  // Form State
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [orgName, setOrgName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [specialtyArea, setSpecialtyArea] = useState<SpecialtyArea>('Robotics & Hardware');
  const [partnershipType, setPartnershipType] = useState<PartnershipType>('Technical Partner');
  const [logoUrl, setLogoUrl] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [expectations, setExpectations] = useState('');
  const [country, setCountry] = useState('Zimbabwe');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<{ success: boolean; text: string } | null>(null);

  useEffect(() => {
    fetchPartners();
  }, []);

  const fetchPartners = async () => {
    setLoadingPartners(true);
    try {
      const list = await getApprovedPartners();
      setApprovedPartners(list);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingPartners(false);
    }
  };

  const handlePartnerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitResult(null);

    try {
      const res = await submitPartnershipRequest({
        organization_name: orgName.trim(),
        contact_person: contactPerson.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        specialty_area: specialtyArea,
        partnership_type: partnershipType,
        logo_url: logoUrl.trim() || undefined,
        website_url: websiteUrl.trim() || undefined,
        expectations: expectations.trim(),
        country: country.trim() || 'Zimbabwe',
        display_on_website: false
      });

      if (res.success) {
        setSubmitResult({
          success: true,
          text: 'Thank you for reaching out to partner with YARA! Your partnership proposal has been received. Our executive committee will review and connect with you shortly.'
        });
        setOrgName('');
        setContactPerson('');
        setEmail('');
        setPhone('');
        setLogoUrl('');
        setWebsiteUrl('');
        setExpectations('');
        fetchPartners();
      } else {
        setSubmitResult({
          success: false,
          text: res.error || 'Failed to submit proposal. Please try again.'
        });
      }
    } catch (err: any) {
      setSubmitResult({
        success: false,
        text: err.message || 'An error occurred while submitting.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const specialties: SpecialtyArea[] = [
    'Robotics & Hardware',
    'AI & Software Engineering',
    'STEM & TVET Education',
    'Renewable Energy & IoT',
    'Government & Policy',
    'Corporate Social Responsibility (CSR)',
    'Media, Film & Outreach',
    'Logistics & Infrastructure',
    'Other'
  ];

  const partnerTypes: PartnershipType[] = [
    'Technical Partner',
    'Equipment & Hardware Sponsor',
    'Venue, Pool & Lab Facility',
    'Curriculum Co-Developer',
    'Prize & Scholarship Sponsor',
    'Funding & Grant Partner',
    'Academic & University Partner'
  ];

  return (
    <div className="space-y-12 pb-16">
      {/* Hero Header */}
      <section className="rounded-[3rem] bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 border border-slate-800 text-white p-8 md:p-14 shadow-2xl space-y-6">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-bold uppercase tracking-wider">
          <Handshake className="w-3.5 h-3.5" />
          <span>Strategic Partnerships & Collaborations</span>
        </div>

        <div className="max-w-3xl space-y-4">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
            Partner with YARA to Pioneer African Robotics
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Collaborate with the Young Africans Robotics Association to foster STEM innovation, build sustainable community robotics labs, empower girls in tech, and sponsor high-impact competitions.
          </p>
        </div>

        <div className="flex flex-wrap gap-4 pt-2">
          <button
            onClick={() => setShowRequestForm(true)}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3.5 rounded-2xl font-bold text-xs flex items-center space-x-2 shadow-lg shadow-indigo-600/30 transition hover:scale-105"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Submit Partnership Request</span>
          </button>

          <Link
            to="/donate"
            className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 px-8 py-3.5 rounded-2xl font-bold text-xs flex items-center space-x-2 transition"
          >
            <HeartHandshake className="w-4 h-4 text-rose-400" />
            <span>Donations & In-Kind Support</span>
          </Link>
        </div>
      </section>

      {/* Approved Partners Showcase */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-2xl font-black text-slate-900 flex items-center space-x-2">
              <Award className="w-6 h-6 text-amber-500" />
              <span>Official Partners & Collaborators</span>
            </h2>
            <p className="text-slate-500 text-xs mt-0.5">
              Distinguished institutions, tech enterprises, and foundations powering YARA programs.
            </p>
          </div>

          <button
            onClick={() => setShowRequestForm(!showRequestForm)}
            className="inline-flex items-center space-x-2 text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-xl transition"
          >
            <span>{showRequestForm ? 'Hide Form' : 'Apply for Partnership'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {loadingPartners ? (
            <p className="text-xs text-slate-400">Loading partners...</p>
          ) : approvedPartners.length === 0 ? (
            <div className="col-span-full p-8 text-center bg-white rounded-3xl border border-slate-100 text-slate-400 text-xs">
              No approved partners to display yet. Submit a partnership request to join us!
            </div>
          ) : (
            approvedPartners.map(partner => (
              <div 
                key={partner.id}
                className="bg-white rounded-3xl p-6 border border-slate-100 shadow-lg shadow-indigo-50/40 hover:shadow-xl transition-all space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-black text-lg overflow-hidden">
                      {partner.logo_url ? (
                        <img 
                          src={partner.logo_url} 
                          alt={partner.organization_name} 
                          className="w-full h-full object-contain p-1"
                          referrerPolicy="no-referrer"
                          onError={(e: any) => { e.currentTarget.style.display = 'none'; }}
                        />
                      ) : (
                        partner.organization_name.charAt(0)
                      )}
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-bold text-[10px]">
                      {partner.partnership_type}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-black text-slate-900 text-base">{partner.organization_name}</h3>
                    <p className="text-[11px] text-indigo-600 font-bold mt-0.5">{partner.specialty_area}</p>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {partner.expectations}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <span>{partner.country || 'Zimbabwe'}</span>
                  {partner.website_url && (
                    <a 
                      href={partner.website_url.startsWith('http') ? partner.website_url : `https://${partner.website_url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 font-bold flex items-center space-x-1 hover:underline"
                    >
                      <span>Website</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Partnership Request Form (Collapsible / Modal) */}
      <AnimatePresence>
        {showRequestForm && (
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="bg-white rounded-[2.5rem] border border-indigo-100 p-6 sm:p-10 shadow-2xl shadow-indigo-100/60 space-y-8"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-slate-900 flex items-center space-x-2">
                  <Handshake className="w-6 h-6 text-indigo-600" />
                  <span>Submit Partnership Proposal</span>
                </h2>
                <p className="text-slate-500 text-xs mt-1">
                  Tell us about your organization, specialty, and how we can collaborate.
                </p>
              </div>

              <button
                onClick={() => setShowRequestForm(false)}
                className="text-xs text-slate-400 hover:text-slate-600 font-bold"
              >
                Close ✕
              </button>
            </div>

            {submitResult && (
              <div className={`p-4 rounded-2xl flex items-start space-x-3 text-xs font-semibold border ${
                submitResult.success 
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                  : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}>
                {submitResult.success ? <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" /> : <ShieldCheck className="w-5 h-5 shrink-0 text-rose-600" />}
                <p>{submitResult.text}</p>
              </div>
            )}

            <form onSubmit={handlePartnerSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                    Organization / Company Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Acme Robotics Lab"
                    value={orgName}
                    onChange={e => setOrgName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:border-indigo-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                    Contact Person Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. K. Ncube"
                    value={contactPerson}
                    onChange={e => setContactPerson(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:border-indigo-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                    Official Email *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="partner@company.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:border-indigo-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                    Phone / WhatsApp Number
                  </label>
                  <input
                    type="tel"
                    placeholder="+263 78 895 3986"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:border-indigo-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                    Specialty Area *
                  </label>
                  <select
                    value={specialtyArea}
                    onChange={e => setSpecialtyArea(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:border-indigo-600 focus:outline-none"
                  >
                    {specialties.map(spec => (
                      <option key={spec} value={spec}>{spec}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                    Partnership Category *
                  </label>
                  <select
                    value={partnershipType}
                    onChange={e => setPartnershipType(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:border-indigo-600 focus:outline-none"
                  >
                    {partnerTypes.map(pt => (
                      <option key={pt} value={pt}>{pt}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                    Logo Image URL (Optional)
                  </label>
                  <input
                    type="url"
                    placeholder="https://example.com/logo.png"
                    value={logoUrl}
                    onChange={e => setLogoUrl(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:border-indigo-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                    Website URL (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="https://company.org"
                    value={websiteUrl}
                    onChange={e => setWebsiteUrl(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:border-indigo-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                    Country / Base Location
                  </label>
                  <input
                    type="text"
                    value={country}
                    onChange={e => setCountry(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:border-indigo-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                  Partnership Scope & Expectations *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Outline the collaboration scope: e.g. sponsoring hardware kits, providing testing facilities, mentoring student squads, or co-branding regional hackathons."
                  value={expectations}
                  onChange={e => setExpectations(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs text-slate-900 focus:border-indigo-600 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold py-4 rounded-2xl shadow-xl shadow-indigo-600/20 text-xs uppercase tracking-wider flex items-center justify-center space-x-2 transition hover:scale-[1.01]"
              >
                {isSubmitting ? (
                  <span>Submitting Proposal...</span>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Submit Strategic Partnership Request</span>
                  </>
                )}
              </button>
            </form>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Direct Contact Footer */}
      <section className="bg-slate-900 rounded-[3rem] p-8 md:p-12 text-white border border-slate-800 space-y-6">
        <div className="max-w-2xl space-y-2">
          <h3 className="text-2xl font-bold">Direct Partnership & CSR Inquiries</h3>
          <p className="text-slate-400 text-xs">
            For urgent institutional memorandums of understanding (MOUs) or large-scale STEM sponsorships:
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-slate-800 border border-slate-700/60 space-y-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase">General Inquiries & Info</span>
            <div className="font-mono text-xs font-bold text-amber-300 space-y-0.5">
              <p>{YARA_PAYMENT_CONFIG.inquiryPhone1}</p>
              <p>{YARA_PAYMENT_CONFIG.inquiryPhone2}</p>
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-800 border border-slate-700/60 space-y-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase">Official Inquiries Email</span>
            <p className="font-mono text-sm font-bold text-indigo-300">{YARA_PAYMENT_CONFIG.contactEmail}</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-800 border border-slate-700/60 space-y-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase">EcoCash & Finance Line</span>
            <p className="font-mono text-sm font-bold text-emerald-300">{YARA_PAYMENT_CONFIG.ecocashNumber}</p>
            <p className="text-[10px] text-slate-400">Simbarashe Manongwa</p>
          </div>
        </div>
      </section>
    </div>
  );
}
