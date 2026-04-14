import React from 'react';
import { motion } from 'motion/react';
import { BarChart3, Rocket, Globe, CheckCircle2, ArrowRight } from 'lucide-react';

export default function Impact() {
  const impacts = [
    'Engaged learners across multiple districts',
    'Established growing STEM communities',
    'Increased awareness of robotics and innovation',
    'Inspired students to pursue STEM careers',
    'Built partnerships with schools and institutions'
  ];

  const goals = [
    'Expand to all provinces in Zimbabwe',
    'Establish YARA chapters in all major universities',
    'Build a national robotics competition platform',
    'Launch an innovation marketplace',
    'Connect African innovators to global opportunities'
  ];

  return (
    <div className="space-y-12 pb-12">
      <header>
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">📊 Impact & Future</h2>
        <p className="text-slate-500 font-medium">Measuring our success and looking ahead.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <section className="bg-white rounded-[2.5rem] p-8 md:p-12 border border-slate-100 shadow-xl shadow-indigo-50/50">
          <div className="flex items-center space-x-4 mb-8">
            <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900">Impact (So Far)</h3>
          </div>
          <div className="space-y-4">
            {impacts.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex items-start space-x-4 p-4 bg-slate-50 rounded-2xl border border-slate-100"
              >
                <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span className="text-slate-700 font-medium">{item}</span>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="bg-slate-900 rounded-[2.5rem] p-8 md:p-12 text-white shadow-xl">
          <div className="flex items-center space-x-4 mb-8">
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-indigo-400">
              <Rocket className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold">🚀 Future Goals</h3>
          </div>
          <div className="space-y-4">
            {goals.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex items-start space-x-4 p-4 bg-white/5 rounded-2xl border border-white/10"
              >
                <ArrowRight className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
                <span className="text-slate-300 font-medium">{item}</span>
              </motion.div>
            ))}
          </div>
        </section>
      </div>

      <section className="bg-indigo-600 rounded-[3rem] p-8 md:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-8 overflow-hidden relative">
        <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full -ml-32 -mt-32 blur-3xl" />
        <div className="relative z-10">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
              <Globe className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold">🌍 Geographical Reach</h3>
          </div>
          <p className="text-indigo-50 text-lg font-medium leading-relaxed max-w-xl">
            YARA operates across Zimbabwe with plans to expand across Africa, reaching both urban and rural communities. We are committed to bridging the digital divide wherever it exists.
          </p>
        </div>
        <div className="relative z-10 bg-white/10 backdrop-blur-md p-8 rounded-[2.5rem] border border-white/20 text-center">
          <p className="text-4xl font-black mb-2">10+</p>
          <p className="text-xs font-bold uppercase tracking-widest opacity-70">Districts Reached</p>
        </div>
      </section>
    </div>
  );
}
