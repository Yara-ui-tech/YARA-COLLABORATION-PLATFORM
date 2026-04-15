import React from 'react';
import { motion } from 'motion/react';
import { Cpu, School, GraduationCap, Trophy, Shield, Users, Lightbulb, MessageSquare, Brain } from 'lucide-react';

export default function Programs() {
  const activities = [
    {
      icon: Cpu,
      title: '1️⃣ STEM & Robotics Outreach',
      desc: 'We conduct outreach programs in schools and communities to introduce robotics and engineering concepts, promote digital literacy, and inspire innovation among young learners.',
      color: 'bg-indigo-50 text-indigo-600'
    },
    {
      icon: School,
      title: '2️⃣ School Robotics Clubs',
      desc: 'YARA establishes STEM and Robotics Clubs in schools to ensure continuous learning, hands-on project development, and peer collaboration and mentorship.',
      color: 'bg-emerald-50 text-emerald-600'
    },
    {
      icon: GraduationCap,
      title: '3️⃣ University Chapters',
      desc: 'We partner with universities to create YARA Chapters, which mentor school robotics clubs, lead provincial STEM outreach, and act as innovation hubs.',
      color: 'bg-amber-50 text-amber-600'
    },
    {
      icon: Trophy,
      title: '4️⃣ Competitions & Hackathons',
      desc: 'YARA organizes robotics competitions, hackathons, and innovation challenges to encourage practical problem solving, engineering design, and teamwork.',
      color: 'bg-purple-50 text-purple-600'
    },
    {
      icon: Shield,
      title: '5️⃣ Cybersecurity Awareness',
      desc: 'We educate communities on safe internet usage, digital responsibility, and cybersecurity basics.',
      color: 'bg-red-50 text-red-600'
    },
    {
      icon: Users,
      title: '6️⃣ Career Guidance & Mentorship',
      desc: 'We provide STEM career guidance sessions, exposure to real-world opportunities, and mentorship from experienced individuals.',
      color: 'bg-blue-50 text-blue-600'
    },
    {
      icon: Lightbulb,
      title: '7️⃣ Innovation Promotion',
      desc: 'YARA supports local innovations, youth-led projects, and global exposure of African solutions.',
      color: 'bg-orange-50 text-orange-600'
    },
    {
      icon: Brain,
      title: '8️⃣ Master Curriculum 2025-26',
      desc: 'A revised, 14-session intensive program (Electronics, Programming, Build) where every learner builds a real robot to solve community problems.',
      color: 'bg-purple-50 text-purple-600'
    }
  ];

  return (
    <div className="space-y-12 pb-12">
      <header>
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">🏗 What We Do</h2>
        <p className="text-slate-500 font-medium">Our programs and initiatives across the continent.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {activities.map((activity, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm hover:shadow-xl transition-all group"
          >
            <div className={`w-14 h-14 rounded-2xl ${activity.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
              <activity.icon className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-4">{activity.title}</h3>
            <p className="text-slate-600 font-medium leading-relaxed">{activity.desc}</p>
          </motion.div>
        ))}
      </div>

      <section className="bg-slate-900 rounded-[3rem] p-8 md:p-12 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full -mr-32 -mt-32 blur-3xl" />
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 space-y-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold">🤝 YARA Learning Ecosystem</h3>
            </div>
            <p className="text-slate-300 text-lg leading-relaxed">
              YARA operates a collaborative learning ecosystem through WhatsApp where learners share projects, mentors provide guidance, and discussions are moderated professionally.
            </p>
            <ul className="space-y-3 text-slate-400 font-medium">
              <li className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />
                <span>Weekly sessions and knowledge sharing</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />
                <span>Low-cost, accessible digital classroom</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />
                <span>Real-time project feedback</span>
              </li>
            </ul>
          </div>
          <div className="bg-white/5 backdrop-blur-md p-8 rounded-[2.5rem] border border-white/10 w-full md:w-80">
            <h4 className="text-indigo-400 font-bold uppercase tracking-widest text-xs mb-6">🏆 Key Programs</h4>
            <div className="space-y-4">
              {[
                'Robotics Outreach Programs',
                'YARA Robotics Competitions',
                'Innovation Showcases',
                'School Club Development',
                'University Chapter Expansion',
                'Cybersecurity Awareness'
              ].map((prog, i) => (
                <div key={i} className="flex items-center space-x-3">
                  <Trophy className="w-4 h-4 text-amber-500" />
                  <span className="text-sm font-bold text-slate-200">{prog}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
