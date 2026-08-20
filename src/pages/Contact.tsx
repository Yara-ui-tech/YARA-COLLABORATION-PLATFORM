import React from 'react';
import { Mail, Phone, MapPin, Users, Shield, Award, Star, ExternalLink, Smartphone, MessageCircle, HelpCircle, CreditCard } from 'lucide-react';
import { YARA_PAYMENT_CONFIG } from '../services/partnershipDonationService';

export default function Contact() {
  return (
    <div className="space-y-12 pb-12">
      <header>
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">📞 Contact & Leadership</h2>
        <p className="text-slate-500 font-medium">Get in touch with the Young Africans Robotics Association (YARA) team.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <section className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-[2.5rem] p-8 md:p-12 border border-slate-100 shadow-xl shadow-indigo-50/50">
            <h3 className="text-2xl font-bold text-slate-900 mb-8 flex items-center space-x-3">
              <Users className="w-6 h-6 text-indigo-600" />
              <span>👥 Leadership & Governance</span>
            </h3>
            
            <div className="space-y-10">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                <div className="w-28 h-28 rounded-[2.5rem] bg-indigo-50 flex items-center justify-center text-indigo-600 text-3xl font-black border-4 border-white shadow-xl overflow-hidden flex-shrink-0">
                  <Users className="w-12 h-12" />
                </div>
                <div className="text-center md:text-left space-y-3">
                  <div>
                    <h4 className="text-2xl font-bold text-slate-900">YARA Executive Directorate</h4>
                    <p className="text-indigo-600 font-bold uppercase tracking-widest text-xs mt-1">Pan-African Robotics & AI Coalition</p>
                  </div>
                  <p className="text-slate-600 font-medium leading-relaxed italic max-w-xl">
                    "Innovating locally to build globally competitive African engineers, roboticists, and innovators."
                  </p>
                </div>
              </div>

              {/* Contact Channels Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-slate-100">
                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200/70 space-y-3">
                  <div className="flex items-center space-x-2.5 text-indigo-600">
                    <HelpCircle className="w-5 h-5" />
                    <h4 className="font-bold text-sm text-slate-900">Information & Inquiries</h4>
                  </div>
                  <p className="text-xs text-slate-500">
                    For general questions, competition guidelines, curriculum access, and school club setups:
                  </p>
                  <div className="space-y-2 pt-1 font-mono text-sm font-bold">
                    <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-slate-200">
                      <span className="text-slate-900">{YARA_PAYMENT_CONFIG.inquiryPhone1}</span>
                      <a 
                        href={`tel:${YARA_PAYMENT_CONFIG.inquiryPhone1.replace(/\s+/g, '')}`} 
                        className="text-xs text-indigo-600 hover:text-indigo-800 font-sans font-bold flex items-center space-x-1"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>Call</span>
                      </a>
                    </div>
                    <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-slate-200">
                      <span className="text-slate-900">{YARA_PAYMENT_CONFIG.inquiryPhone2}</span>
                      <a 
                        href={`tel:${YARA_PAYMENT_CONFIG.inquiryPhone2.replace(/\s+/g, '')}`} 
                        className="text-xs text-indigo-600 hover:text-indigo-800 font-sans font-bold flex items-center space-x-1"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>Call</span>
                      </a>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200/70 space-y-3">
                  <div className="flex items-center space-x-2.5 text-amber-600">
                    <CreditCard className="w-5 h-5" />
                    <h4 className="font-bold text-sm text-slate-900">Subscriptions & Finance</h4>
                  </div>
                  <p className="text-xs text-slate-500">
                    For subscription confirmations, EcoCash payments, receipts, and sponsorship billing:
                  </p>
                  <div className="space-y-2 pt-1 font-mono text-sm font-bold">
                    <div className="bg-white p-2.5 rounded-xl border border-slate-200 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-amber-600 font-black">{YARA_PAYMENT_CONFIG.ecocashNumber}</span>
                        <a 
                          href={`tel:${YARA_PAYMENT_CONFIG.directContactPhone.replace(/\s+/g, '')}`} 
                          className="text-xs text-indigo-600 hover:text-indigo-800 font-sans font-bold flex items-center space-x-1"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>Call / WhatsApp</span>
                        </a>
                      </div>
                      <p className="text-[11px] text-slate-400 font-sans font-medium">EcoCash Name: Simbarashe Manongwa</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats Strip */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
                {[
                  { label: 'Board Members', icon: Shield, count: '5+' },
                  { label: 'Mentors & Judges', icon: Award, count: '25+' },
                  { label: 'Volunteers & Champions', icon: Star, count: '50+' }
                ].map((stat, i) => (
                  <div key={i} className="bg-slate-50 p-5 rounded-3xl border border-slate-100 text-center space-y-1.5">
                    <div className="w-9 h-9 bg-white rounded-2xl flex items-center justify-center text-indigo-600 mx-auto shadow-sm">
                      <stat.icon className="w-4 h-4" />
                    </div>
                    <p className="text-xl font-black text-slate-900">{stat.count}</p>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Right Column: Contact Quick Sheet */}
        <section className="lg:col-span-1 space-y-8">
          <div className="bg-slate-900 rounded-[2.5rem] p-8 md:p-10 text-white shadow-xl h-full flex flex-col justify-between">
            <div className="space-y-8">
              <h3 className="text-2xl font-bold flex items-center space-x-3">
                <Mail className="w-6 h-6 text-indigo-400" />
                <span>Contact Details</span>
              </h3>
              
              <div className="space-y-6">
                <div className="space-y-1.5">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">General Information & Inquiries</p>
                  <div className="space-y-1">
                    <a href="tel:0719199274" className="text-base font-bold text-white hover:text-indigo-400 transition-colors flex items-center space-x-2 font-mono">
                      <Phone className="w-3.5 h-3.5 text-indigo-400" />
                      <span>0719 199 274</span>
                    </a>
                    <a href="tel:0717468236" className="text-base font-bold text-white hover:text-indigo-400 transition-colors flex items-center space-x-2 font-mono">
                      <Phone className="w-3.5 h-3.5 text-indigo-400" />
                      <span>0717 468 236</span>
                    </a>
                  </div>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-white/10">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Payment & EcoCash Line</p>
                  <a href={`tel:${YARA_PAYMENT_CONFIG.ecocashNumber}`} className="text-base font-bold text-amber-300 hover:text-amber-200 transition-colors flex items-center space-x-2 font-mono">
                    <Smartphone className="w-3.5 h-3.5 text-amber-400" />
                    <span>{YARA_PAYMENT_CONFIG.ecocashNumber}</span>
                  </a>
                  <p className="text-[11px] text-slate-400">Simbarashe Manongwa</p>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-white/10">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Official Email</p>
                  <a href="mailto:inforyaraorg@gmail.com" className="text-sm font-bold text-white hover:text-indigo-400 transition-colors flex items-center space-x-2 break-all">
                    <Mail className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span>inforyaraorg@gmail.com</span>
                  </a>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-white/10">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Headquarters / Hub Location</p>
                  <div className="flex items-start space-x-2 text-slate-300 text-xs font-medium leading-snug">
                    <MapPin className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                    <span>Chinhoyi University of Technology (CUT), Zimbabwe</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-8 mt-8 border-t border-white/10">
              <div className="bg-indigo-600 p-5 rounded-2xl text-center">
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-80 mb-1">Motto</p>
                <p className="text-base font-black italic">“Innovate Local, Build Global”</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
