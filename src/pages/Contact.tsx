import React from 'react';
import { motion } from 'motion/react';
import { Mail, Phone, MapPin, Users, Shield, Award, Star, ExternalLink } from 'lucide-react';

export default function Contact() {
  return (
    <div className="space-y-12 pb-12">
      <header>
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">📞 Contact & Leadership</h2>
        <p className="text-slate-500 font-medium">Get in touch with the YARA team.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <section className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-[2.5rem] p-8 md:p-12 border border-slate-100 shadow-xl shadow-indigo-50/50">
            <h3 className="text-2xl font-bold text-slate-900 mb-10 flex items-center space-x-3">
              <Users className="w-6 h-6 text-indigo-600" />
              <span>👥 Leadership</span>
            </h3>
            
            <div className="space-y-12">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                <div className="w-32 h-32 rounded-[2.5rem] bg-indigo-50 flex items-center justify-center text-indigo-600 text-4xl font-black border-4 border-white shadow-xl overflow-hidden flex-shrink-0">
                    <Users className="w-12 h-12" />
                  </div>
                  <div className="text-center md:text-left space-y-4">
                    <div>
                      <h4 className="text-2xl font-bold text-slate-900">Leadership Team</h4>
                      <p className="text-indigo-600 font-bold uppercase tracking-widest text-xs mt-1">Executive Team</p>
                    </div>
                    <p className="text-slate-600 font-medium leading-relaxed italic">
                      "Innovate Local, Build Global"
                    </p>
                  </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8 border-t border-slate-50">
                {[
                  { label: 'Board Members', icon: Shield, count: '5+' },
                  { label: 'Mentors', icon: Award, count: '15+' },
                  { label: 'Volunteers', icon: Star, count: '50+' }
                ].map((stat, i) => (
                  <div key={i} className="bg-slate-50 p-6 rounded-3xl border border-slate-100 text-center space-y-2">
                    <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center text-indigo-600 mx-auto shadow-sm">
                      <stat.icon className="w-5 h-5" />
                    </div>
                    <p className="text-2xl font-black text-slate-900">{stat.count}</p>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="lg:col-span-1 space-y-8">
          <div className="bg-slate-900 rounded-[2.5rem] p-8 md:p-10 text-white shadow-xl h-full">
            <h3 className="text-2xl font-bold mb-10 flex items-center space-x-3">
              <Mail className="w-6 h-6 text-indigo-400" />
              <span>Contact Info</span>
            </h3>
            
            <div className="space-y-8">
              <div className="space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Email Address</p>
                <a href="mailto:inforyaraorg@gmail.com" className="text-lg font-bold hover:text-indigo-400 transition-colors flex items-center space-x-2">
                  <span>inforyaraorg@gmail.com</span>
                  <ExternalLink className="w-4 h-4 opacity-50" />
                </a>
              </div>

              <div className="space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Phone Numbers</p>
                <div className="space-y-1">
                  <p className="text-lg font-bold">0719 199 274</p>
                  <p className="text-lg font-bold">0717 468 236</p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Location</p>
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-indigo-400 mt-1 flex-shrink-0" />
                  <p className="text-lg font-bold leading-tight">Chinhoyi University of Technology (CUT), Zimbabwe</p>
                </div>
              </div>

              <div className="pt-8 border-t border-white/10">
                <div className="bg-indigo-600 p-6 rounded-3xl text-center">
                  <p className="text-xs font-bold uppercase tracking-widest opacity-70 mb-1">Tagline</p>
                  <p className="text-xl font-black italic">“Innovate Local, Build Global”</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
