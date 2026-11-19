import React, { useState, useEffect } from 'react';
import { 
  PhoneCall, AlertTriangle, ShieldCheck, Clock, 
  MapPin, Globe, ExternalLink, Heart, AlertCircle, Shield
} from 'lucide-react';
import EmergencyHelpBanner from '../../components/safeguarding/EmergencyHelpBanner';
import SafeguardingNav from '../../components/safeguarding/SafeguardingNav';
import { getEmergencyContacts } from '../../services/safeguardingService';
import { SafeguardingEmergencyContact } from '../../types/safeguarding';

export default function EmergencyHotlinesPage() {
  const [contacts, setContacts] = useState<SafeguardingEmergencyContact[]>([]);
  const [filter, setFilter] = useState<'all' | 'child_protection' | 'gbv' | 'police' | 'counselling' | 'medical'>('all');

  useEffect(() => {
    async function init() {
      const data = await getEmergencyContacts();
      setContacts(data);
    }
    init();
  }, []);

  const filtered = contacts.filter(c => filter === 'all' || c.category === filter);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 space-y-12 pb-20">
      <EmergencyHelpBanner />
      <SafeguardingNav />

      {/* Hero Warning */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-r from-red-950 via-slate-900 to-indigo-950 border-2 border-red-500/50 text-white space-y-4 shadow-2xl">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30">
              <AlertTriangle className="w-5 h-5 animate-pulse" />
            </span>
            <span className="text-xs font-black uppercase tracking-wider text-red-400">
              24/7 Verified Crisis Response &amp; Emergency Directory
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight">
            Emergency Contacts &amp; Crisis Hotlines
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-3xl leading-relaxed">
            If you or a child is in immediate physical danger, suffering active violence, or requiring emergency medical rescue, <strong>do not wait for an online form response</strong>. Please reach out to the verified national support numbers below immediately.
          </p>

          <div className="pt-2 flex flex-wrap gap-4 text-xs font-bold">
            <a
              href="tel:116"
              className="px-5 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black uppercase tracking-wider flex items-center gap-2 shadow-lg transition"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Call Childline: 116 (Toll-Free)</span>
            </a>
            <a
              href="tel:08080074"
              className="px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black uppercase tracking-wider flex items-center gap-2 shadow-lg transition"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Call Musasa GBV: 0808 0074</span>
            </a>
          </div>
        </div>
      </div>

      {/* Critical First 72 Hours Clinical Notice (PEP Protocol) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-indigo-500/30 space-y-3 text-xs leading-relaxed">
          <div className="flex items-center gap-2 text-sm font-bold text-cyan-400">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span>Time-Sensitive Medical Emergency: The First 72 Hours</span>
          </div>
          <p className="text-slate-300">
            In any case of sexual assault or rape, seek emergency medical care <strong>within 72 hours</strong>. Post-Exposure Prophylaxis (PEP) can prevent HIV transmission if started within this window. Emergency contraception and forensic documentation can also be provided at government hospitals, the Adult Rape Clinic (ARC) at Parirenyatwa, or through Musasa.
          </p>
          <p className="text-slate-400">
            Do not bathe or change clothes prior to examination if possible, but prioritize receiving immediate medical attention above all else.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'all' as const, label: 'All Emergency Numbers' },
            { id: 'child_protection' as const, label: 'Child Protection (116)' },
            { id: 'gbv' as const, label: 'GBV & Domestic Violence' },
            { id: 'police' as const, label: 'Police & VFU' },
            { id: 'counselling' as const, label: 'Mental Health & Counseling' },
            { id: 'medical' as const, label: 'Medical & Ambulance' }
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setFilter(t.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition border cursor-pointer ${
                filter === t.id
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-md'
                  : 'bg-slate-900 text-slate-400 hover:text-white border-slate-800'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Contacts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(contact => (
            <div
              key={contact.id}
              className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4 flex flex-col justify-between hover:border-cyan-400/40 transition"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${
                    contact.toll_free 
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
                      : 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                  }`}>
                    {contact.toll_free ? '100% Toll-Free' : 'Direct Line'}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{contact.availability}</span>
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white">{contact.name}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{contact.description}</p>

                {contact.location && (
                  <div className="flex items-start gap-1.5 text-xs text-slate-400">
                    <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                    <span>{contact.location}</span>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-slate-800 space-y-2">
                <a
                  href={`tel:${contact.phone}`}
                  className="w-full py-3 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow transition"
                >
                  <PhoneCall className="w-4 h-4" />
                  <span>Call Primary: {contact.phone}</span>
                </a>

                {contact.secondary_phone && (
                  <a
                    href={`tel:${contact.secondary_phone}`}
                    className="w-full py-2 text-center text-xs text-slate-400 hover:text-white block font-mono"
                  >
                    Alternative: {contact.secondary_phone}
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
