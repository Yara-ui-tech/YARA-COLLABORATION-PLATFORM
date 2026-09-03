import React from 'react';
import { 
  Package, 
  Check, 
  Phone, 
  MessageSquare, 
  FileText, 
  Download, 
  ShieldCheck, 
  Truck, 
  ExternalLink, 
  Cpu, 
  Wrench, 
  BookOpen, 
  Zap 
} from 'lucide-react';
import { YARA_HARDWARE_KITS } from '../../../constants/yaraLmsCatalog';

export const ResourcesTab: React.FC = () => {
  const downloadableDocs = [
    {
      title: 'ESP32 & Arduino Pinout & Power Rail Cheat Sheet',
      desc: 'High-resolution PDF detailing GPIO pins, ADC channels, PWM timers, and I2C/SPI buses.',
      type: 'PDF Guide • 2.4 MB',
      category: 'Hardware'
    },
    {
      title: "Resistor Color Codes, Ohm's Law & Breadboard Handbook",
      desc: 'Visual chart for 4-band/5-band resistors, breadboard internal tie-points, and multimeter modes.',
      type: 'PDF Guide • 1.8 MB',
      category: 'Electronics'
    },
    {
      title: 'L298N & Dual H-Bridge Motor Driver Wiring Blueprint',
      desc: 'Schematic illustrating 2WD motor drive, enable jumpers, and common ground tie-ins.',
      type: 'Schematic • 1.2 MB',
      category: 'Robotics'
    },
    {
      title: '5 Whys Problem Discovery & Root Cause Worksheet',
      desc: 'Structured canvas template for field interviews, root-cause drilling, and How-Might-We framing.',
      type: 'Canvas Worksheet • 850 KB',
      category: 'Design Thinking'
    },
    {
      title: '21-Point Technical Capstone Engineering Specification Template',
      desc: 'Comprehensive document template covering functional specs, BOM, schematics, and test logs.',
      type: 'Docx Template • 1.1 MB',
      category: 'Innovation'
    },
    {
      title: '90-Second Innovation Pitch Deck & Demo Video Blueprint',
      desc: 'Time-stamped pitch script structure: Hook, Problem, Solution, Demo, Impact, and Vision.',
      type: 'Slide Deck • 3.5 MB',
      category: 'Pitch'
    }
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* 1. Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl">
        <div className="max-w-3xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
            <Package className="w-3.5 h-3.5" /> Hardware & Engineering Knowledge Base
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">Official Learning Kits & Technical Resources</h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Official hardware kits, downloadable pinout cheat sheets, design thinking canvases, and 21-point engineering templates.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-800 text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>100% Tested & Verified Components</span>
          </div>
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-emerald-400" />
            <span>Regional Distribution across Southern Africa</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-emerald-400" />
            <span>Direct Orders: <strong className="text-white">0717468236</strong></span>
          </div>
        </div>
      </div>

      {/* 2. Hardware Kits Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-slate-900">Official YARA Hardware Starter Kits</h2>
            <p className="text-xs text-slate-500">
              Pre-packaged component sets required for physical laboratory sessions (P01–P05) and rover builds.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {YARA_HARDWARE_KITS.map(kit => (
            <div
              key={kit.id}
              className="bg-white border border-slate-200 rounded-3xl overflow-hidden flex flex-col justify-between shadow-xs hover:border-emerald-500/50 transition group"
            >
              <div>
                <div className="h-44 w-full bg-slate-950 relative overflow-hidden">
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
                    <h3 className="text-base font-black text-slate-900">{kit.title}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{kit.subtitle}</p>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">{kit.description}</p>

                  <div>
                    <h4 className="text-[11px] font-black uppercase tracking-wider text-emerald-700 mb-2">
                      Included Components ({kit.includedComponents.length})
                    </h4>
                    <ul className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                      {kit.includedComponents.map((item, idx) => (
                        <li key={idx} className="text-xs text-slate-600 flex items-start gap-2">
                          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <div className="p-6 pt-0 space-y-2">
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950">
                  Need the components for this session? Contact YARA on <strong className="text-slate-900">0717468236</strong> to purchase/obtain the required learning components.
                </div>

                <a
                  href={`https://wa.me/263717468236?text=Hello%20YARA,%20I%20would%20like%20to%20order%20the%20${encodeURIComponent(kit.title)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition shadow-xs"
                >
                  <MessageSquare className="w-4 h-4" /> Order via WhatsApp (0717468236)
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Downloadable Resources & Canvases */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
        <div>
          <h2 className="text-base font-black text-slate-900">Technical Datasheets & Documentation Templates</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Download standard engineering blueprints, 5 Whys discovery worksheets, and 21-point specification files.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {downloadableDocs.map((doc, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl border border-slate-200 hover:border-slate-300 bg-slate-50/50 flex items-start justify-between gap-4 transition"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 shrink-0">
                  <FileText className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <span className="px-2 py-0.2 rounded bg-slate-200 text-slate-700 text-[9px] font-bold uppercase">
                    {doc.category}
                  </span>
                  <h3 className="text-xs font-bold text-slate-900 mt-1">{doc.title}</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">{doc.desc}</p>
                  <div className="text-[10px] text-slate-400 font-medium mt-1">{doc.type}</div>
                </div>
              </div>

              <button
                onClick={() => alert(`Downloading "${doc.title}". File will be saved to your device.`)}
                className="p-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 shrink-0 transition"
                title="Download Resource"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
