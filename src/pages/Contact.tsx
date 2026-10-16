import React from 'react';
import { Mail, Phone, MapPin, Users, Shield, Award, Star, ExternalLink, Smartphone, MessageCircle, HelpCircle, CreditCard } from 'lucide-react';
import { YARA_PAYMENT_CONFIG } from '../services/partnershipDonationService';

export default function Contact() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 text-slate-100">
      <header className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold uppercase tracking-wider">
          <Phone className="w-3.5 h-3.5" />
          <span>Contact &amp; Governance</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">Contact &amp; Leadership</h1>
        <p className="text-slate-400 text-sm font-medium">Get in touch directly with the Young Africans Robotics Association (YARA) team.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <section className="lg:col-span-2 space-y-8">
          <div className="bg-slate-900 rounded-3xl p-8 md:p-10 border border-slate-800 shadow-xl space-y-8">
            <h2 className="text-2xl font-black text-white flex items-center space-x-3">
              <Users className="w-6 h-6 text-blue-400" />
              <span>Leadership &amp; Governance</span>
            </h2>
            
            <div className="space-y-8">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                <div className="w-24 h-24 rounded-3xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 text-3xl font-black shadow-lg shrink-0">
                  <Users className="w-10 h-10" />
                </div>
                <div className="text-center md:text-left space-y-2">
                  <div>
                    <h3 className="text-xl font-black text-white">YARA Executive Directorate</h3>
                    <p className="text-blue-400 font-bold uppercase tracking-wider text-xs mt-0.5">Pan-African Robotics &amp; AI Coalition</p>
                  </div>
                  <p className="text-slate-300 font-normal leading-relaxed italic text-sm max-w-xl">
                    "Innovating locally to build globally competitive African engineers, roboticists, and innovators."
                  </p>
                </div>
              </div>

              {/* Contact Channels Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-800">
                <div className="bg-slate-950/80 p-5 rounded-2xl border border-slate-800/80 space-y-3">
                  <div className="flex items-center space-x-2 text-blue-400">
                    <HelpCircle className="w-4 h-4" />
                    <h4 className="font-bold text-xs uppercase tracking-wider text-white">Information &amp; Inquiries</h4>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    General questions, competition guidelines, curriculum access, and school club setups:
                  </p>
                  <div className="space-y-2 pt-1 font-mono text-xs font-bold">
                    <div className="flex items-center justify-between bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                      <span className="text-white">{YARA_PAYMENT_CONFIG.inquiryPhone1}</span>
                      <a 
                        href={`tel:${YARA_PAYMENT_CONFIG.inquiryPhone1.replace(/\s+/g, '')}`} 
                        className="text-xs text-blue-400 hover:text-blue-300 font-sans font-bold flex items-center space-x-1"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>Call</span>
                      </a>
                    </div>
                    <div className="flex items-center justify-between bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                      <span className="text-white">{YARA_PAYMENT_CONFIG.inquiryPhone2}</span>
                      <a 
                        href={`tel:${YARA_PAYMENT_CONFIG.inquiryPhone2.replace(/\s+/g, '')}`} 
                        className="text-xs text-blue-400 hover:text-blue-300 font-sans font-bold flex items-center space-x-1"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>Call</span>
                      </a>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-950/80 p-5 rounded-2xl border border-slate-800/80 space-y-3">
                  <div className="flex items-center space-x-2 text-amber-400">
                    <CreditCard className="w-4 h-4" />
                    <h4 className="font-bold text-xs uppercase tracking-wider text-white">Subscriptions &amp; Dues</h4>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Subscription confirmations, EcoCash payments, and sponsorship invoicing:
                  </p>
                  <div className="space-y-2 pt-1 font-mono text-xs font-bold">
                    <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-amber-400 font-black">{YARA_PAYMENT_CONFIG.ecocashNumber}</span>
                        <a 
                          href={`tel:${YARA_PAYMENT_CONFIG.directContactPhone.replace(/\s+/g, '')}`} 
                          className="text-xs text-emerald-400 hover:text-emerald-300 font-sans font-bold flex items-center space-x-1"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>Call / WhatsApp</span>
                        </a>
                      </div>
                      <p className="text-[10px] text-slate-400 font-sans font-normal">EcoCash Name: Simbarashe Manongwa</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats Strip */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                {[
                  { label: 'Executive Directorate', icon: Shield, count: '5+' },
                  { label: 'Mentors & Judges', icon: Award, count: '25+' },
                  { label: 'Volunteers & Champions', icon: Star, count: '50+' }
                ].map((stat, i) => (
                  <div key={i} className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80 text-center space-y-1">
                    <div className="w-8 h-8 bg-slate-900 rounded-xl flex items-center justify-center text-blue-400 mx-auto border border-slate-800">
                      <stat.icon className="w-4 h-4" />
                    </div>
                    <p className="text-lg font-black text-white">{stat.count}</p>
                    <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Right Column: Contact Quick Sheet */}
        <section className="lg:col-span-1 space-y-8">
          <div className="bg-slate-900 rounded-3xl p-8 md:p-10 text-white border border-slate-800 shadow-xl h-full flex flex-col justify-between">
            <div className="space-y-6">
              <h3 className="text-xl font-black text-white flex items-center space-x-2.5">
                <Mail className="w-5 h-5 text-blue-400" />
                <span>Contact Details</span>
              </h3>
              
              <div className="space-y-5 text-xs">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Direct Telephone Lines</p>
                  <div className="space-y-1 pt-1">
                    <a href="tel:0719199274" className="text-sm font-bold text-white hover:text-blue-400 transition-colors flex items-center space-x-2 font-mono">
                      <Phone className="w-3.5 h-3.5 text-blue-400" />
                      <span>0719 199 274</span>
                    </a>
                    <a href="tel:0717468236" className="text-sm font-bold text-white hover:text-blue-400 transition-colors flex items-center space-x-2 font-mono">
                      <Phone className="w-3.5 h-3.5 text-blue-400" />
                      <span>0717 468 236</span>
                    </a>
                  </div>
                </div>

                <div className="space-y-1 pt-3 border-t border-slate-800">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Payment &amp; EcoCash Line</p>
                  <a href={`tel:${YARA_PAYMENT_CONFIG.ecocashNumber}`} className="text-sm font-bold text-amber-300 hover:text-amber-200 transition-colors flex items-center space-x-2 font-mono pt-1">
                    <Smartphone className="w-3.5 h-3.5 text-amber-400" />
                    <span>{YARA_PAYMENT_CONFIG.ecocashNumber}</span>
                  </a>
                  <p className="text-[10px] text-slate-400">Simbarashe Manongwa</p>
                </div>

                <div className="space-y-1 pt-3 border-t border-slate-800">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Official Directorate Email</p>
                  <a href="mailto:inforyaraorg@gmail.com" className="text-xs font-bold text-white hover:text-blue-400 transition-colors flex items-center space-x-2 break-all pt-1">
                    <Mail className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span>inforyaraorg@gmail.com</span>
                  </a>
                </div>

                <div className="space-y-1 pt-3 border-t border-slate-800">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Headquarters / Hub Location</p>
                  <div className="flex items-start space-x-2 text-slate-300 text-xs font-normal leading-snug pt-1">
                    <MapPin className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                    <span>Chinhoyi University of Technology (CUT), Zimbabwe</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-slate-800">
              <div className="bg-blue-600/10 border border-blue-500/30 p-4 rounded-2xl text-center">
                <p className="text-[9px] font-bold uppercase tracking-widest text-blue-300 mb-0.5">Motto</p>
                <p className="text-sm font-black text-white italic">“Innovate Local, Build Global”</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
