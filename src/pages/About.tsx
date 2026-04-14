import React from 'react';
import { motion } from 'motion/react';
import { Info, Target, Eye, Heart } from 'lucide-react';

export default function About() {
  return (
    <div className="space-y-12 pb-12">
      <header>
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">About YARA</h2>
        <p className="text-slate-500 font-medium">Young Africans Robotics Association</p>
      </header>

      <section className="bg-white rounded-[2.5rem] p-8 md:p-12 border border-slate-100 shadow-xl shadow-indigo-50/50">
        <div className="flex items-start space-x-6">
          <div className="w-16 h-16 bg-indigo-50 rounded-3xl flex items-center justify-center text-indigo-600 flex-shrink-0">
            <Info className="w-8 h-8" />
          </div>
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-slate-900">🧭 About YARA</h3>
            <div className="space-y-4 text-slate-600 leading-relaxed text-lg font-medium">
              <p>
                The Young Africans Robotics Association (YARA) is a youth-led, volunteer-driven organization committed to advancing STEM education, robotics, innovation, and digital literacy across Zimbabwe and Africa.
              </p>
              <p>
                YARA focuses on empowering young people—especially in underserved communities—with practical, hands-on skills that enable them to become innovators, problem-solvers, and future technology leaders.
              </p>
              <p>
                Through outreach programmes, mentorship, competitions, and collaborative learning platforms, YARA is building a sustainable innovation ecosystem that connects schools, universities, and industry.
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
          className="bg-indigo-600 rounded-[2.5rem] p-8 text-white shadow-xl shadow-indigo-100"
        >
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
              <Target className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold">🎯 Mission</h3>
          </div>
          <p className="text-indigo-50 text-lg font-medium leading-relaxed">
            To empower young Africans with practical STEM skills, robotics knowledge, and innovation capacity to solve real-world challenges and compete globally.
          </p>
        </motion.section>

        <motion.section 
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-xl shadow-slate-100"
        >
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
              <Eye className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold">🌟 Vision</h3>
          </div>
          <p className="text-slate-300 text-lg font-medium leading-relaxed">
            To become Africa’s leading youth-driven robotics and innovation ecosystem, producing globally competitive innovators and engineers.
          </p>
        </motion.section>
      </div>

      <section className="space-y-8">
        <h3 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center space-x-3">
          <Heart className="w-6 h-6 text-red-500" />
          <span>💡 Core Values</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { title: 'Innovation', desc: 'Encouraging creativity and problem-solving' },
            { title: 'Inclusivity', desc: 'Reaching underserved and less privileged communities' },
            { title: 'Collaboration', desc: 'Building strong networks between learners and institutions' },
            { title: 'Excellence', desc: 'Promoting high standards in STEM education' },
            { title: 'Integrity', desc: 'Operating with transparency and professionalism' }
          ].map((value, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all"
            >
              <h4 className="text-lg font-bold text-indigo-600 mb-2">{value.title}</h4>
              <p className="text-slate-500 font-medium text-sm">{value.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
