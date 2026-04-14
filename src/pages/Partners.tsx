import React from 'react';
import { motion } from 'motion/react';
import { Handshake, GraduationCap, School, Building2, Landmark, HeartHandshake, CheckCircle2 } from 'lucide-react';

export default function Partners() {
  const partners = [
    { name: 'Universities', icon: GraduationCap },
    { name: 'Schools', icon: School },
    { name: 'NGOs', icon: HeartHandshake },
    { name: 'Tech Companies', icon: Building2 },
    { name: 'Government Institutions', icon: Landmark }
  ];

  const areas = [
    'Sponsorship',
    'Training support',
    'Equipment donations',
    'Joint innovation programs'
  ];

  return (
    <div className="space-y-12 pb-12">
      <header>
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">🤝 Partnership</h2>
        <p className="text-slate-500 font-medium">Building a sustainable innovation ecosystem together.</p>
      </header>

      <section className="bg-white rounded-[2.5rem] p-8 md:p-12 border border-slate-100 shadow-xl shadow-indigo-50/50">
        <div className="flex items-center space-x-4 mb-10">
          <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
            <Handshake className="w-6 h-6" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900">Partnership Opportunities</h3>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-12">
          {partners.map((partner, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="flex flex-col items-center text-center space-y-4 p-6 bg-slate-50 rounded-3xl border border-slate-100 hover:bg-white hover:shadow-lg transition-all"
            >
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm">
                <partner.icon className="w-6 h-6" />
              </div>
              <span className="text-sm font-bold text-slate-700 leading-tight">{partner.name}</span>
            </motion.div>
          ))}
        </div>

        <div className="bg-indigo-600 rounded-[2.5rem] p-8 md:p-10 text-white">
          <h4 className="text-xl font-bold mb-8">Partnership Areas Include:</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {areas.map((area, i) => (
              <div key={i} className="flex items-center space-x-4 p-4 bg-white/10 rounded-2xl border border-white/10">
                <CheckCircle2 className="w-5 h-5 text-indigo-300" />
                <span className="font-bold">{area}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-900 rounded-[3rem] p-12 text-center text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 to-transparent" />
        <div className="relative z-10 max-w-2xl mx-auto space-y-6">
          <h3 className="text-3xl font-bold">Ready to Collaborate?</h3>
          <p className="text-slate-400 text-lg font-medium">
            Join us in our mission to empower the next generation of African innovators. Let's build a brighter future together.
          </p>
          <div className="pt-4">
            <a 
              href="mailto:inforyaraorg@gmail.com"
              className="inline-flex items-center space-x-2 bg-indigo-600 text-white px-10 py-4 rounded-2xl font-bold shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 transition-all"
            >
              <span>Become a Partner</span>
              <Handshake className="w-5 h-5" />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
