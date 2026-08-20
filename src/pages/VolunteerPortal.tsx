import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Users, 
  Award, 
  Cpu, 
  Sparkles, 
  CheckCircle2, 
  Send, 
  Clock, 
  MapPin, 
  Mail, 
  Phone, 
  ShieldCheck,
  Video,
  HeartHandshake,
  Compass,
  AlertCircle
} from 'lucide-react';
import { VolunteerCategory } from '../types/partnershipsAndDonations';
import { submitVolunteerApplication } from '../services/partnershipDonationService';

export default function VolunteerPortal() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [category, setCategory] = useState<VolunteerCategory>('judge_technical');
  const [country, setCountry] = useState('Zimbabwe');
  const [province, setProvince] = useState('Harare');
  const [district, setDistrict] = useState('');
  const [skills, setSkills] = useState('');
  const [availability, setAvailability] = useState('Full Competition Days & Prep');
  const [motivation, setMotivation] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<{ success: boolean; text: string } | null>(null);

  const categories: { id: VolunteerCategory; title: string; desc: string; icon: any }[] = [
    {
      id: 'judge_technical',
      title: 'Technical Judge & Code Evaluator',
      desc: 'Evaluate autonomous algorithms, ROS/Arduino code, engineering design logs, and team defenses.',
      icon: Award
    },
    {
      id: 'robotics_mentor',
      title: 'Youth Squad Robotics Coach & Mentor',
      desc: 'Assist underprivileged and rural school teams with circuit troubleshooting and mechanical assembly.',
      icon: Cpu
    },
    {
      id: 'event_logistics',
      title: 'Arena Marshal & Event Logistics',
      desc: 'Coordinate match schedules, manage team pits, arena setups, and competition staging.',
      icon: Compass
    },
    {
      id: 'underwater_drone_safety',
      title: 'Underwater Drone Pool Safety Marshal',
      desc: 'Oversee testing pool safety, tether management, and recovery protocols for aquatic ROVs.',
      icon: ShieldCheck
    },
    {
      id: 'media_photo_video',
      title: 'Media, Photography & Video Livestream',
      desc: 'Capture match footage, interview young innovators, and produce highlight reels.',
      icon: Video
    },
    {
      id: 'community_outreach',
      title: 'Community Outreach & Youth Diversity Lead',
      desc: 'Facilitate gender parity initiatives, rural youth squad onboarding, and community engagement.',
      icon: Users
    },
    {
      id: 'medical_first_aid',
      title: 'Medical & First Aid Responder',
      desc: 'Provide health and safety coverage, first aid readiness, and student care during event days.',
      icon: HeartHandshake
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitResult(null);

    try {
      const res = await submitVolunteerApplication({
        full_name: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        category,
        country,
        province,
        district: district.trim() || undefined,
        skills_background: skills.trim() || undefined,
        availability,
        motivation: motivation.trim() || undefined
      });

      if (res.success) {
        setSubmitResult({
          success: true,
          text: 'Thank you for applying to volunteer with YARA! Our volunteer coordination committee will review your application and contact you with orientation and scheduling details.'
        });
        setFullName('');
        setEmail('');
        setPhone('');
        setDistrict('');
        setSkills('');
        setMotivation('');
      } else {
        setSubmitResult({
          success: false,
          text: res.error || 'Failed to submit application. Please try again.'
        });
      }
    } catch (err: any) {
      setSubmitResult({
        success: false,
        text: err.message || 'An unexpected error occurred.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-12 pb-16">
      {/* Hero */}
      <section className="rounded-[3rem] bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 border border-slate-800 text-white p-8 md:p-14 shadow-2xl space-y-4">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 text-xs font-bold uppercase tracking-wider">
          <HeartHandshake className="w-3.5 h-3.5" />
          <span>Join the Movement • Volunteer with YARA</span>
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
          YARA Volunteer & Mentorship Corps
        </h1>

        <p className="text-slate-300 text-sm sm:text-base max-w-3xl leading-relaxed">
          Be part of Africa's premier youth robotics movement. Whether you are an engineer, educator, university student, pool safety specialist, or event enthusiast, your time and talent ignite the spark in hundreds of underserved young innovators.
        </p>
      </section>

      {/* Volunteer Form Container */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 p-6 sm:p-10 shadow-xl shadow-indigo-50/50 space-y-8 max-w-4xl mx-auto">
        
        <div>
          <h2 className="text-2xl font-black text-slate-900 flex items-center space-x-2">
            <Users className="w-6 h-6 text-indigo-600" />
            <span>Volunteer Registration & Category Selection</span>
          </h2>
          <p className="text-slate-500 text-xs mt-1">
            Choose your volunteer role category and provide your details below.
          </p>
        </div>

        {submitResult && (
          <div className={`p-4 rounded-2xl flex items-start space-x-3 text-xs font-semibold border ${
            submitResult.success 
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}>
            {submitResult.success ? <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" /> : <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />}
            <p>{submitResult.text}</p>
          </div>
        )}

        {/* Categories Selection */}
        <div className="space-y-3">
          <label className="block text-xs font-bold text-slate-700 uppercase">
            Select Your Preferred Volunteer Category *
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {categories.map(cat => {
              const Icon = cat.icon;
              const isSelected = category === cat.id;
              return (
                <button
                  type="button"
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  className={`p-4 rounded-2xl border text-left transition-all flex items-start space-x-3 ${
                    isSelected 
                      ? 'bg-indigo-50/80 border-indigo-600 shadow-md ring-2 ring-indigo-600/20' 
                      : 'bg-slate-50 hover:bg-white border-slate-200/80'
                  }`}
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    isSelected ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 border border-slate-200'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-xs text-slate-900">{cat.title}</h4>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-indigo-600" />}
                    </div>
                    <p className="text-[11px] text-slate-500 leading-tight mt-0.5">{cat.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Application Form */}
        <form onSubmit={handleSubmit} className="space-y-6 pt-4 border-t border-slate-100">
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Full Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Tendai Moyo"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:border-indigo-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Email Address *</label>
              <input
                type="email"
                required
                placeholder="tendai@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:border-indigo-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Phone / WhatsApp *</label>
              <input
                type="tel"
                required
                placeholder="+263 78 895 3986"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:border-indigo-600 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Country</label>
              <input
                type="text"
                value={country}
                onChange={e => setCountry(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:border-indigo-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Province / Region</label>
              <select
                value={province}
                onChange={e => setProvince(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:border-indigo-600 focus:outline-none"
              >
                <option value="Harare">Harare</option>
                <option value="Bulawayo">Bulawayo</option>
                <option value="Manicaland">Manicaland</option>
                <option value="Mashonaland Central">Mashonaland Central</option>
                <option value="Mashonaland East">Mashonaland East</option>
                <option value="Mashonaland West">Mashonaland West</option>
                <option value="Masvingo">Masvingo</option>
                <option value="Matabeleland North">Matabeleland North</option>
                <option value="Matabeleland South">Matabeleland South</option>
                <option value="Midlands">Midlands</option>
                <option value="International">International / Remote</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">District / Town</label>
              <input
                type="text"
                placeholder="e.g. Chitungwiza or Mutare"
                value={district}
                onChange={e => setDistrict(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:border-indigo-600 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                Your Background & Skills (Hardware, Coding, First Aid, Media, etc.)
              </label>
              <textarea
                rows={3}
                placeholder="e.g. 3rd year Mechatronics engineering student at UZ, proficient in C++ & robotics hardware."
                value={skills}
                onChange={e => setSkills(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs text-slate-900 focus:border-indigo-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                Motivation / Why do you want to volunteer?
              </label>
              <textarea
                rows={3}
                placeholder="Share why you want to support African youth robotics and underserved students."
                value={motivation}
                onChange={e => setMotivation(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs text-slate-900 focus:border-indigo-600 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Availability</label>
            <select
              value={availability}
              onChange={e => setAvailability(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:border-indigo-600 focus:outline-none"
            >
              <option value="Full Competition Days & Prep">Full Competition Days & Prep (All Days)</option>
              <option value="Competition Finals Days Only">Competition Finals Days Only</option>
              <option value="Weekend Mentor Sessions Only">Weekend Mentor Sessions Only</option>
              <option value="Remote / Online Judging & Code Review">Remote / Online Judging & Code Review</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold py-4 rounded-2xl shadow-xl shadow-indigo-600/20 text-xs uppercase tracking-wider flex items-center justify-center space-x-2 transition hover:scale-[1.01]"
          >
            {isSubmitting ? (
              <span>Submitting Application...</span>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Submit Volunteer Application</span>
              </>
            )}
          </button>
        </form>

      </div>
    </div>
  );
}
