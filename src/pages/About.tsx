import React from 'react';
import { motion } from 'motion/react';
import { Info, Target, Eye, Heart } from 'lucide-react';
import { DynamicSectionRenderer } from '../components/DynamicSectionRenderer';

export default function About() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12 text-slate-100">
      <header className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold uppercase tracking-wider">
          <Info className="w-3.5 h-3.5" />
          <span>About the Association</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">About YARA</h1>
        <p className="text-slate-400 text-sm font-medium">Young Africans Robotics Association • "Innovate Local, Build Global"</p>
      </header>

      {/* Admin Managed Dynamic Sections */}
      <DynamicSectionRenderer page="about" />

      <section className="bg-slate-900 rounded-3xl p-8 md:p-12 border border-slate-800 shadow-xl">
        <div className="flex flex-col md:flex-row items-start gap-6">
          <div className="w-16 h-16 bg-blue-500/10 border border-blue-500/30 rounded-2xl flex items-center justify-center text-blue-400 shrink-0">
            <Info className="w-8 h-8" />
          </div>
          <div className="space-y-4">
            <h2 className="text-2xl font-black text-white">Who We Are</h2>
            <div className="space-y-4 text-slate-300 leading-relaxed text-base font-normal">
              <p>
                The <strong className="text-white">Young Africans Robotics Association (YARA)</strong> is a youth-led, volunteer-driven movement committed to advancing STEM education, robotics engineering, artificial intelligence, and digital literacy across Zimbabwe and the African continent.
              </p>
              <p>
                YARA focuses on empowering young people—especially in underserved rural and peri-urban communities—with practical, hands-on skills that enable them to become creators, problem-solvers, and future technology pioneers.
              </p>
              <p>
                Through grass-roots school outreach, structured curriculum tiers, mentorship hubs, and continental competitions, YARA is building a self-sustaining innovation ecosystem bridging primary/secondary schools, technical universities, and industry.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <motion.section 
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="bg-gradient-to-br from-blue-950 via-slate-900 to-indigo-950 rounded-3xl p-8 text-white border border-blue-800/40 shadow-xl"
        >
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-12 h-12 bg-blue-500/20 border border-blue-500/40 rounded-2xl flex items-center justify-center text-blue-400">
              <Target className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-black text-white">Our Mission</h3>
          </div>
          <p className="text-blue-100/90 text-sm sm:text-base font-normal leading-relaxed">
            To empower young Africans with practical STEM skills, physical computing knowledge, and engineering capacity to solve critical local challenges and compete at the highest global levels.
          </p>
        </motion.section>

        <motion.section 
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 rounded-3xl p-8 text-white border border-slate-800 shadow-xl"
        >
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-12 h-12 bg-amber-500/20 border border-amber-500/40 rounded-2xl flex items-center justify-center text-amber-400">
              <Eye className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-black text-white">Our Vision</h3>
          </div>
          <p className="text-slate-300 text-sm sm:text-base font-normal leading-relaxed">
            To become Africa’s leading youth-driven robotics and innovation ecosystem, producing globally competitive innovators, roboticists, and ethical technological leaders.
          </p>
        </motion.section>
      </div>

      <section className="space-y-6">
        <h3 className="text-2xl font-black text-white tracking-tight flex items-center space-x-3">
          <Heart className="w-6 h-6 text-red-400" />
          <span>Core Values</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            { title: 'Innovation', desc: 'Encouraging bold creativity, iterative design, and authentic problem-solving.' },
            { title: 'Inclusivity & Parity', desc: 'Active inclusion for rural schools and a mandatory 2 boys + 2 girls gender parity rule.' },
            { title: 'Practical Collaboration', desc: 'Building strong networks between students, patrons, universities, and industry.' },
            { title: 'Engineering Excellence', desc: 'Adhering to high engineering standards, clean wiring, and documented code.' },
            { title: 'Integrity & Ethics', desc: 'Operating with full transparency, open-source principles, and professionalism.' }
          ].map((value, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="bg-slate-900/90 p-6 rounded-3xl border border-slate-800 hover:border-slate-700 shadow-sm transition-all"
            >
              <h4 className="text-base font-bold text-blue-400 mb-2">{value.title}</h4>
              <p className="text-slate-400 font-normal text-xs leading-relaxed">{value.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
