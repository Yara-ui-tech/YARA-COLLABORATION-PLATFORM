import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, MessageCircle, CheckCircle2 } from 'lucide-react';
import Breadcrumbs from '../components/Breadcrumbs';

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;
    setSubmitted(true);
  };

  return (
    <div className="min-h-[80vh] bg-slate-950 text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: 'Contact' }
          ]}
        />

        {/* Header: Clean & Minimal */}
        <div className="space-y-2 text-center sm:text-left">
          <span className="text-xs font-black uppercase tracking-widest text-blue-400">
            Get In Touch
          </span>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
            Contact YARA
          </h1>
          <p className="text-sm text-slate-400 font-light">
            We equip young Africans with hands-on robotics and engineering skills. Reach out directly.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start pt-4">
          
          {/* Direct Channels (Minimum & Clear) */}
          <div className="space-y-4">
            
            {/* Phone & WhatsApp */}
            <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-3">
              <div className="flex items-center gap-2.5 text-blue-400">
                <Phone className="w-5 h-5" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">Telephone &amp; WhatsApp</h2>
              </div>
              <div className="space-y-2 pt-1 font-mono text-sm font-bold">
                <div className="flex items-center justify-between">
                  <span className="text-white">0719 199 274</span>
                  <a 
                    href="tel:0719199274" 
                    className="text-xs font-sans text-blue-400 hover:text-blue-300 font-bold"
                  >
                    Call
                  </a>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white">0717 468 236</span>
                  <a 
                    href="https://wa.me/263717468236" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-xs font-sans text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1"
                  >
                    <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                  </a>
                </div>
              </div>
            </div>

            {/* Email */}
            <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-3">
              <div className="flex items-center gap-2.5 text-blue-400">
                <Mail className="w-5 h-5" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">Official Email</h2>
              </div>
              <div>
                <a 
                  href="mailto:inforyaraorg@gmail.com" 
                  className="text-sm font-bold text-white hover:text-blue-400 transition-colors break-all"
                >
                  inforyaraorg@gmail.com
                </a>
              </div>
            </div>

            {/* Location */}
            <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2.5 text-blue-400">
                <MapPin className="w-5 h-5" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">Headquarters</h2>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-medium">
                Chinhoyi University of Technology (CUT), Zimbabwe
              </p>
            </div>

          </div>

          {/* Quick Contact Form */}
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4">
            <h2 className="text-base font-black text-white">Send a Direct Message</h2>
            
            {submitted ? (
              <div className="p-6 rounded-2xl bg-emerald-950/60 border border-emerald-500/30 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                <p className="text-sm font-bold text-white">Message Delivered</p>
                <p className="text-xs text-slate-300 font-light">Thank you. Our directorate team will respond shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-400 font-bold uppercase tracking-wider text-[10px] mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Tendai Moyo"
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold uppercase tracking-wider text-[10px] mb-1">
                    Email or Phone
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    placeholder="e.g. tendai@example.com / 07..."
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold uppercase tracking-wider text-[10px] mb-1">
                    Message
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={formData.message}
                    onChange={e => setFormData({ ...formData, message: e.target.value })}
                    placeholder="How can we assist you?"
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 text-xs resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-wider text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Message</span>
                </button>
              </form>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
