import React from 'react';
import { 
  Package, 
  Check, 
  Phone, 
  MessageSquare, 
  ShoppingBag, 
  ShieldCheck, 
  Truck, 
  ExternalLink,
  Wrench
} from 'lucide-react';
import { YARA_HARDWARE_KITS } from '../../constants/yaraLmsCatalog';

export const YaraLmsStarterKitStore: React.FC = () => {
  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-2xl">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-2">
            <Package size={14} /> Official YARA Hardware Kits
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">Robotics Starter Kits & Lab Hardware</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Everything needed to build real circuits, program microcontrollers, assemble autonomous rovers, and complete physical laboratory milestones.
          </p>
        </div>

        {/* Value Props */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-800 text-xs text-slate-300">
          <div className="flex items-center gap-2.5">
            <ShieldCheck size={18} className="text-emerald-400" />
            <span>100% Quality-Tested Microcontrollers & Sensors</span>
          </div>
          <div className="flex items-center gap-2.5">
            <Truck size={18} className="text-emerald-400" />
            <span>Nationwide Distribution across Zimbabwe & Southern Africa</span>
          </div>
          <div className="flex items-center gap-2.5">
            <Phone size={18} className="text-emerald-400" />
            <span>Direct Support & Inquiries: <strong className="text-white">0717468236</strong></span>
          </div>
        </div>
      </div>

      {/* Kit Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {YARA_HARDWARE_KITS.map(kit => (
          <div
            key={kit.id}
            className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden flex flex-col justify-between shadow-xl hover:border-emerald-500/40 transition group"
          >
            <div>
              <div className="h-48 w-full bg-slate-950 relative overflow-hidden">
                <img
                  src={kit.imageUrl}
                  alt={kit.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500 opacity-85"
                />
                <div className="absolute top-3 right-3 bg-slate-950/80 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-emerald-400 border border-emerald-500/30">
                  ${kit.priceUsd} USD
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-white">{kit.title}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{kit.subtitle}</p>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">{kit.description}</p>

                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-2">
                    Included Components ({kit.includedComponents.length})
                  </h4>
                  <ul className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    {kit.includedComponents.map((item, idx) => (
                      <li key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                        <Check size={14} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="p-6 pt-0 space-y-3">
              <a
                href={`https://wa.me/263717468236?text=Hello%20YARA,%20I%20would%20like%20to%20order%20the%20${encodeURIComponent(kit.title)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition shadow-lg"
              >
                <MessageSquare size={16} /> Order via WhatsApp (0717468236)
              </a>

              <a
                href="https://inforyaraorg.wixsite.com/my-site-2"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-xl flex items-center justify-center gap-2 transition"
              >
                <ExternalLink size={14} /> View on Official YARA Site
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
