import React, { useState, useEffect } from 'react';
import { 
  Megaphone, 
  Calendar, 
  MapPin, 
  Users, 
  CheckCircle2, 
  ArrowRight, 
  Download, 
  Sparkles,
  Heart,
  Globe,
  Share2
} from 'lucide-react';
import SafeguardingNav from '../../components/safeguarding/SafeguardingNav';
import EmergencyHelpBanner from '../../components/safeguarding/EmergencyHelpBanner';
import { safeguardingService } from '../../services/safeguardingService';
import { SafeguardingCampaign } from '../../types/safeguarding';

const AwarenessCampaignsPage: React.FC = () => {
  const [campaigns, setCampaigns] = useState<SafeguardingCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCampaign, setSelectedCampaign] = useState<SafeguardingCampaign | null>(null);
  const [showRsvpModal, setShowRsvpModal] = useState(false);
  const [rsvpData, setRsvpData] = useState({ name: '', email: '', chapter: '', role: 'Student / Participant' });
  const [rsvpSubmitted, setRsvpSubmitted] = useState(false);

  useEffect(() => {
    loadCampaigns();
  }, []);

  const loadCampaigns = async () => {
    try {
      setLoading(true);
      const data = await safeguardingService.getCampaigns();
      setCampaigns(data);
    } catch (err) {
      console.error('Failed to load campaigns', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRsvpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rsvpData.name || !rsvpData.email) return;
    setRsvpSubmitted(true);
    setTimeout(() => {
      setRsvpSubmitted(false);
      setShowRsvpModal(false);
      setRsvpData({ name: '', email: '', chapter: '', role: 'Student / Participant' });
    }, 2500);
  };

  const getStatusBadge = (status: SafeguardingCampaign['status']) => {
    switch (status) {
      case 'active':
        return <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Active Now</span>;
      case 'upcoming':
        return <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-100 text-blue-800">Upcoming</span>;
      case 'completed':
        return <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-100 text-slate-600">Completed</span>;
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
            <Megaphone className="w-4 h-4" />
            Empowerment, Advocacy & Prevention Initiatives
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight mb-4">
            Safeguarding Awareness Campaigns
          </h1>
          <p className="text-lg text-blue-100 max-w-3xl mx-auto leading-relaxed">
            Mobilizing young roboticists, educators, university mentors, and civil society partners to foster safe educational hubs, end gender-based discrimination in STEM, and eradicate digital bullying.
          </p>
        </div>
      </section>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Campaign Metrics Spotlight */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <div className="bg-white p-5 rounded-2xl border border-[#CBD5E1] shadow-sm text-center">
            <p className="text-3xl font-black text-[#0D47A1] mb-1">10 Provinces</p>
            <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Zimbabwe Coverage</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-[#CBD5E1] shadow-sm text-center">
            <p className="text-3xl font-black text-[#00C6FF] mb-1">5,000+</p>
            <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Youth Reached in 2026</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-[#CBD5E1] shadow-sm text-center">
            <p className="text-3xl font-black text-[#10B981] mb-1">100% Free</p>
            <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Open Community Workshops</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-[#CBD5E1] shadow-sm text-center">
            <p className="text-3xl font-black text-[#0A1B4D] mb-1">50/50</p>
            <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Gender Parity Mandate</p>
          </div>
        </div>

        {/* Campaigns Listing */}
        <div className="mb-14">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-black text-[#0A1B4D]">Current & Flagship Campaigns</h2>
              <p className="text-sm text-slate-600">Join our active outreach across universities, high schools, and rural community centres.</p>
            </div>
          </div>

          {loading ? (
            <div className="py-20 text-center">
              <div className="w-12 h-12 border-4 border-[#0D47A1] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-slate-600 font-medium">Loading YARA campaigns...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {campaigns.map(camp => (
                <div 
                  key={camp.id}
                  className="bg-white rounded-3xl border border-[#CBD5E1] overflow-hidden shadow-sm hover:shadow-lg transition-all flex flex-col justify-between"
                >
                  {/* Image Header */}
                  <div className="relative h-48 bg-slate-900 overflow-hidden">
                    <img 
                      src={camp.banner_image || 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80'} 
                      alt={camp.title}
                      className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-4 left-4">
                      {getStatusBadge(camp.status)}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-[#0A1B4D] mb-2 leading-snug">
                        {camp.title}
                      </h3>
                      <p className="text-sm text-slate-600 mb-4 leading-relaxed line-clamp-3">
                        {camp.description}
                      </p>

                      <div className="space-y-2 mb-6 text-xs text-slate-500">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-[#1976D2]" />
                          <span>{camp.start_date} to {camp.end_date}</span>
                        </div>
                        {camp.location && (
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-[#1976D2]" />
                            <span>{camp.location}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-[#1976D2]" />
                          <span>{camp.target_participants} Target Participants</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-[#CBD5E1] flex items-center justify-between">
                      <button
                        onClick={() => {
                          setSelectedCampaign(camp);
                          setShowRsvpModal(true);
                        }}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0D47A1] text-white hover:bg-[#0A1B4D] font-bold text-xs shadow-sm transition-colors"
                      >
                        Participate / RSVP
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>

                      <a
                        href="/safeguarding/resources"
                        className="p-2 rounded-xl text-slate-500 hover:text-[#0D47A1] hover:bg-[#E8F4FF] transition-colors"
                        title="Download Campaign Kit"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Campaign Calendar & Key Dates Section */}
        <section className="bg-white rounded-3xl border border-[#CBD5E1] p-8 sm:p-10 shadow-sm mb-14">
          <div className="max-w-3xl mb-8">
            <span className="text-xs font-bold text-[#1976D2] uppercase tracking-wider">Annual Observances</span>
            <h2 className="text-2xl font-black text-[#0A1B4D] mt-1 mb-2">Global & National Safeguarding Calendar</h2>
            <p className="text-sm text-slate-600">YARA actively commemorates and leads nationwide youth robotics advocacy during key international and regional awareness weeks.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 rounded-2xl bg-[#E8F4FF] border border-blue-200">
              <span className="text-xs font-black text-[#0D47A1] uppercase tracking-wider">February</span>
              <h4 className="text-base font-bold text-[#0A1B4D] mt-1 mb-1">Safer Internet Day</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Workshops focused on digital hygiene, cyberbullying defense, and preventing online grooming in robotics coding forums.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200">
              <span className="text-xs font-black text-amber-800 uppercase tracking-wider">June 16</span>
              <h4 className="text-base font-bold text-[#0A1B4D] mt-1 mb-1">Day of the African Child</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Celebrating equal rights to technology and inclusive STEM access for underserved girls and rural students across Zimbabwe.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-purple-50 border border-purple-200">
              <span className="text-xs font-black text-purple-800 uppercase tracking-wider">Nov 25 - Dec 10</span>
              <h4 className="text-base font-bold text-[#0A1B4D] mt-1 mb-1">16 Days of Activism Against GBV</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Orange STEM campaign: zero-tolerance dialogues and institutional safe space audits across all 10 provinces.
              </p>
            </div>
          </div>
        </section>

        {/* Bring Campaign to Your Chapter / School CTA */}
        <section className="bg-[#0A1B4D] text-white rounded-3xl p-8 sm:p-10 shadow-lg flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <h3 className="text-2xl font-black mb-2">Want YARA Safeguarding at Your School or Chapter?</h3>
            <p className="text-blue-100 text-sm max-w-xl">
              We provide free safeguarding workshops, policy toolkits, and mentor certification sessions for high schools, universities, and community clubs.
            </p>
          </div>
          <a
            href="/contact"
            className="px-6 py-3.5 bg-[#00C6FF] text-[#0A1B4D] hover:bg-cyan-300 font-extrabold text-sm rounded-xl whitespace-nowrap transition-colors shadow"
          >
            Request Safeguarding Workshop
          </a>
        </section>
      </main>

      {/* RSVP Modal */}
      {showRsvpModal && selectedCampaign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 border border-[#CBD5E1] shadow-2xl relative">
            <h3 className="text-xl font-black text-[#0A1B4D] mb-1">
              Join Campaign: {selectedCampaign.title}
            </h3>
            <p className="text-xs text-slate-600 mb-6">
              Register as a participant or volunteer advocate for this safeguarding outreach initiative.
            </p>

            {rsvpSubmitted ? (
              <div className="py-8 text-center">
                <CheckCircle2 className="w-14 h-14 text-emerald-500 mx-auto mb-3 animate-bounce" />
                <h4 className="text-lg font-bold text-[#0A1B4D] mb-1">Registration Confirmed!</h4>
                <p className="text-sm text-slate-600">
                  Thank you for standing up for safe learning spaces. We will email your event kit and briefing details shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleRsvpSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#0A1B4D] uppercase tracking-wider mb-1">
                    Your Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={rsvpData.name}
                    onChange={e => setRsvpData({ ...rsvpData, name: e.target.value })}
                    placeholder="e.g. Tendai Moyo"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#CBD5E1] bg-white text-[#1E293B] text-sm focus:outline-none focus:ring-2 focus:ring-[#00C6FF]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0A1B4D] uppercase tracking-wider mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={rsvpData.email}
                    onChange={e => setRsvpData({ ...rsvpData, email: e.target.value })}
                    placeholder="e.g. tendai@example.ac.zw"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#CBD5E1] bg-white text-[#1E293B] text-sm focus:outline-none focus:ring-2 focus:ring-[#00C6FF]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0A1B4D] uppercase tracking-wider mb-1">
                    School / University / Chapter
                  </label>
                  <input
                    type="text"
                    value={rsvpData.chapter}
                    onChange={e => setRsvpData({ ...rsvpData, chapter: e.target.value })}
                    placeholder="e.g. University of Zimbabwe / St. George's College"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#CBD5E1] bg-white text-[#1E293B] text-sm focus:outline-none focus:ring-2 focus:ring-[#00C6FF]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0A1B4D] uppercase tracking-wider mb-1">
                    Participation Role
                  </label>
                  <select
                    value={rsvpData.role}
                    onChange={e => setRsvpData({ ...rsvpData, role: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#CBD5E1] bg-white text-[#1E293B] text-sm focus:outline-none focus:ring-2 focus:ring-[#00C6FF]"
                  >
                    <option value="Student / Participant">Student / Participant</option>
                    <option value="Chapter Leader">Chapter Leader</option>
                    <option value="Educator / Teacher">Educator / Teacher</option>
                    <option value="Volunteer Mentor">Volunteer Mentor</option>
                    <option value="Partner Representative">Partner Representative</option>
                  </select>
                </div>

                <div className="pt-4 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowRsvpModal(false)}
                    className="px-4 py-2 rounded-xl border border-[#CBD5E1] text-slate-600 text-xs font-bold hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-[#0D47A1] text-white text-xs font-bold hover:bg-[#0A1B4D] transition-colors shadow"
                  >
                    Confirm Attendance
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

export default AwarenessCampaignsPage;
