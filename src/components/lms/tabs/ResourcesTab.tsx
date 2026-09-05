import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Check, 
  Phone, 
  MessageSquare, 
  FileText, 
  Download, 
  ShieldCheck, 
  Truck,
  Plus,
  X,
  Upload,
  Settings,
  Trash2,
  Image as ImageIcon
} from 'lucide-react';
import { YARA_HARDWARE_KITS } from '../../../constants/yaraLmsCatalog';
import { 
  CustomHardwareKit, 
  CustomDocument, 
  getCustomKits, 
  addCustomKit, 
  deleteCustomKit, 
  getCustomDocuments, 
  addCustomDocument, 
  deleteCustomDocument 
} from '../../../services/resourcesService';

export const ResourcesTab: React.FC = () => {
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [customKits, setCustomKits] = useState<CustomHardwareKit[]>([]);
  const [customDocs, setCustomDocs] = useState<CustomDocument[]>([]);

  // Modals state
  const [showAddKitModal, setShowAddKitModal] = useState(false);
  const [showAddDocModal, setShowAddDocModal] = useState(false);

  // Form states - Kit
  const [kitTitle, setKitTitle] = useState('');
  const [kitSubtitle, setKitSubtitle] = useState('');
  const [kitPrice, setKitPrice] = useState('');
  const [kitDesc, setKitDesc] = useState('');
  const [kitImage, setKitImage] = useState('');
  const [kitComponentInput, setKitComponentInput] = useState('');
  const [kitComponents, setKitComponents] = useState<string[]>([]);

  // Form states - Doc
  const [docTitle, setDocTitle] = useState('');
  const [docDesc, setDocDesc] = useState('');
  const [docType, setDocType] = useState('PDF Guide');
  const [docCategory, setDocCategory] = useState('');
  const [docFile, setDocFile] = useState('');

  const staticDocs = [
    { id: 'static_1', title: 'ESP32 & Arduino Pinout & Power Rail Cheat Sheet', desc: 'High-resolution PDF detailing GPIO pins, ADC channels, PWM timers, and I2C/SPI buses.', type: 'PDF Guide • 2.4 MB', category: 'Hardware', fileUrl: '' },
    { id: 'static_2', title: "Resistor Color Codes, Ohm's Law & Breadboard Handbook", desc: 'Visual chart for 4-band/5-band resistors, breadboard internal tie-points, and multimeter modes.', type: 'PDF Guide • 1.8 MB', category: 'Electronics', fileUrl: '' },
    { id: 'static_3', title: 'L298N & Dual H-Bridge Motor Driver Wiring Blueprint', desc: 'Schematic illustrating 2WD motor drive, enable jumpers, and common ground tie-ins.', type: 'Schematic • 1.2 MB', category: 'Robotics', fileUrl: '' },
    { id: 'static_4', title: '5 Whys Problem Discovery & Root Cause Worksheet', desc: 'Structured canvas template for field interviews, root-cause drilling, and How-Might-We framing.', type: 'Canvas Worksheet • 850 KB', category: 'Design Thinking', fileUrl: '' },
    { id: 'static_5', title: '21-Point Technical Capstone Engineering Specification Template', desc: 'Comprehensive document template covering functional specs, BOM, schematics, and test logs.', type: 'Docx Template • 1.1 MB', category: 'Innovation', fileUrl: '' },
    { id: 'static_6', title: '90-Second Innovation Pitch Deck & Demo Video Blueprint', desc: 'Time-stamped pitch script structure: Hook, Problem, Solution, Demo, Impact, and Vision.', type: 'Slide Deck • 3.5 MB', category: 'Pitch', fileUrl: '' }
  ];

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = () => {
    setCustomKits(getCustomKits());
    setCustomDocs(getCustomDocuments());
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, setter: (val: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("File is too large. Please select a file under 2MB for the MVP local storage.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setter(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddKit = () => {
    if (!kitTitle || !kitPrice || !kitImage) {
      alert("Please fill in Title, Price, and upload an Image.");
      return;
    }
    addCustomKit({
      title: kitTitle,
      subtitle: kitSubtitle,
      priceUsd: parseFloat(kitPrice) || 0,
      description: kitDesc,
      imageUrl: kitImage,
      includedComponents: kitComponents
    });
    refreshData();
    setShowAddKitModal(false);
    resetKitForm();
  };

  const handleAddDoc = () => {
    if (!docTitle || !docCategory || !docFile) {
      alert("Please fill in Title, Category, and upload a File/Document.");
      return;
    }
    addCustomDocument({
      title: docTitle,
      desc: docDesc,
      type: docType,
      category: docCategory,
      fileUrl: docFile
    });
    refreshData();
    setShowAddDocModal(false);
    resetDocForm();
  };

  const resetKitForm = () => {
    setKitTitle(''); setKitSubtitle(''); setKitPrice(''); setKitDesc(''); setKitImage(''); setKitComponentInput(''); setKitComponents([]);
  };

  const resetDocForm = () => {
    setDocTitle(''); setDocDesc(''); setDocType('PDF Guide'); setDocCategory(''); setDocFile('');
  };

  const handleDownload = (doc: any) => {
    if (doc.fileUrl) {
      // Trigger base64 download
      const a = document.createElement('a');
      a.href = doc.fileUrl;
      a.download = doc.title;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      alert(`Downloading static resource: "${doc.title}". (This is a placeholder for static content).`);
    }
  };

  const allKits = [...YARA_HARDWARE_KITS, ...customKits];
  const allDocs = [...staticDocs, ...customDocs];

  return (
    <div className="space-y-8 pb-12 relative">
      {/* Admin Toggle */}
      <div className="flex justify-end mb-4">
        <button
          onClick={() => setIsAdminMode(!isAdminMode)}
          className={`px-4 py-2 text-xs font-bold rounded-xl flex items-center gap-2 transition ${
            isAdminMode ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <Settings className="w-4 h-4" />
          {isAdminMode ? 'Exit Admin Mode' : 'Enable Admin Mode'}
        </button>
      </div>

      {/* 1. Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl">
        <div className="max-w-3xl space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
            <Package className="w-3.5 h-3.5" /> Hardware & Engineering Knowledge Base
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">Official Learning Kits & Technical Resources</h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Official hardware kits, downloadable pinout cheat sheets, design thinking canvases, and 21-point engineering templates.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-800 text-xs text-slate-300 relative z-10">
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
          {isAdminMode && (
            <button
              onClick={() => setShowAddKitModal(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition shadow-sm"
            >
              <Plus className="w-4 h-4" /> Add Custom Kit
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {allKits.map(kit => {
            const isCustom = 'id' in kit && typeof kit.id === 'string' && kit.id.startsWith('kit_');
            return (
              <div
                key={kit.id}
                className="bg-white border border-slate-200 rounded-3xl overflow-hidden flex flex-col justify-between shadow-xs hover:border-emerald-500/50 transition group relative"
              >
                {isAdminMode && isCustom && (
                  <button
                    onClick={() => {
                      deleteCustomKit(kit.id as string);
                      refreshData();
                    }}
                    className="absolute top-3 left-3 z-20 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
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

                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">{kit.description}</p>

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

                <div className="p-6 pt-0 space-y-2 mt-auto">
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950">
                    Need the components for this session? Contact YARA on <strong className="text-slate-900">0717468236</strong>.
                  </div>

                  <a
                    href={`https://wa.me/263717468236?text=Hello%20YARA,%20I%20would%20like%20to%20order%20the%20${encodeURIComponent(kit.title)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition shadow-xs"
                  >
                    <MessageSquare className="w-4 h-4" /> Order via WhatsApp
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Downloadable Resources & Catalogues */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-black text-slate-900">Technical Datasheets & Catalogues</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Download standard engineering blueprints, product catalogues, and specification files.
            </p>
          </div>
          {isAdminMode && (
            <button
              onClick={() => setShowAddDocModal(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition shadow-sm"
            >
              <Upload className="w-4 h-4" /> Upload Document
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {allDocs.map((doc) => {
            const isCustom = 'id' in doc && typeof doc.id === 'string' && doc.id.startsWith('doc_');
            return (
              <div
                key={doc.id}
                className="p-4 rounded-2xl border border-slate-200 hover:border-slate-300 bg-slate-50/50 flex items-start justify-between gap-4 transition relative group"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 shrink-0">
                    <FileText className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <span className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 text-[9px] font-black uppercase tracking-wider">
                      {doc.category}
                    </span>
                    <h3 className="text-xs font-bold text-slate-900 mt-1.5">{doc.title}</h3>
                    <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">{doc.desc}</p>
                    <div className="text-[10px] text-slate-400 font-medium mt-1.5">{doc.type}</div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 shrink-0">
                  <button
                    onClick={() => handleDownload(doc)}
                    className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition"
                    title="Download Resource"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  {isAdminMode && isCustom && (
                    <button
                      onClick={() => {
                        deleteCustomDocument(doc.id);
                        refreshData();
                      }}
                      className="p-2.5 rounded-xl bg-red-100 hover:bg-red-200 text-red-600 transition"
                      title="Delete Resource"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* --- ADD KIT MODAL --- */}
      {showAddKitModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <h3 className="text-lg font-black text-slate-900">Add New Hardware Kit</h3>
              <button onClick={() => setShowAddKitModal(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-500">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Kit Title *</label>
                  <input type="text" value={kitTitle} onChange={e => setKitTitle(e.target.value)} className="w-full p-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="e.g. Advanced Rover Kit" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Price (USD) *</label>
                  <input type="number" value={kitPrice} onChange={e => setKitPrice(e.target.value)} className="w-full p-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="e.g. 149.99" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Subtitle</label>
                <input type="text" value={kitSubtitle} onChange={e => setKitSubtitle(e.target.value)} className="w-full p-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="e.g. Everything you need for Level 5" />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
                <textarea value={kitDesc} onChange={e => setKitDesc(e.target.value)} className="w-full p-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none min-h-[80px]" placeholder="Detailed description of the kit..." />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Cover Image *</label>
                <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center hover:bg-slate-50 transition">
                  {kitImage ? (
                    <div className="relative inline-block">
                      <img src={kitImage} alt="Preview" className="h-32 rounded-lg object-cover" />
                      <button onClick={() => setKitImage('')} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"><X className="w-3 h-3" /></button>
                    </div>
                  ) : (
                    <>
                      <ImageIcon className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                      <p className="text-xs text-slate-500 mb-2">Upload a high-quality image (Max 2MB)</p>
                      <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, setKitImage)} className="text-xs" />
                    </>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Included Components</label>
                <div className="flex gap-2 mb-2">
                  <input type="text" value={kitComponentInput} onChange={e => setKitComponentInput(e.target.value)} onKeyDown={(e) => { if(e.key === 'Enter') { e.preventDefault(); if(kitComponentInput) { setKitComponents([...kitComponents, kitComponentInput]); setKitComponentInput(''); } } }} className="flex-1 p-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="e.g. 1x Arduino Uno" />
                  <button onClick={() => { if(kitComponentInput) { setKitComponents([...kitComponents, kitComponentInput]); setKitComponentInput(''); } }} className="px-4 bg-slate-800 text-white text-xs font-bold rounded-xl">Add</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {kitComponents.map((comp, idx) => (
                    <span key={idx} className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full flex items-center gap-1">
                      {comp} <button onClick={() => setKitComponents(kitComponents.filter((_, i) => i !== idx))}><X className="w-3 h-3" /></button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-slate-100 flex justify-end gap-3 sticky bottom-0 bg-white z-10">
              <button onClick={() => setShowAddKitModal(false)} className="px-5 py-2.5 text-slate-600 text-sm font-bold hover:bg-slate-100 rounded-xl transition">Cancel</button>
              <button onClick={handleAddKit} className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl transition shadow-md flex items-center gap-2">
                <Check className="w-4 h-4" /> Save Hardware Kit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- ADD DOC MODAL --- */}
      {showAddDocModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-black text-slate-900">Upload Catalogue / Document</h3>
              <button onClick={() => setShowAddDocModal(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-500">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Document Title *</label>
                <input type="text" value={docTitle} onChange={e => setDocTitle(e.target.value)} className="w-full p-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="e.g. 2026 Product Catalogue" />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Category (e.g. Catalogue, Datasheet) *</label>
                <input type="text" value={docCategory} onChange={e => setDocCategory(e.target.value)} className="w-full p-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="e.g. Catalogue" />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Document Type / Size</label>
                <input type="text" value={docType} onChange={e => setDocType(e.target.value)} className="w-full p-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="e.g. PDF • 1.5 MB" />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Short Description</label>
                <textarea value={docDesc} onChange={e => setDocDesc(e.target.value)} className="w-full p-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none min-h-[60px]" placeholder="Brief description of the document contents..." />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Upload File (PDF/Doc) *</label>
                <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center hover:bg-slate-50 transition">
                  {docFile ? (
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-2">
                        <Check className="w-6 h-6" />
                      </div>
                      <span className="text-xs font-bold text-indigo-700">File attached successfully</span>
                      <button onClick={() => setDocFile('')} className="text-xs text-red-500 font-bold mt-2 hover:underline">Remove</button>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                      <p className="text-xs text-slate-500 mb-2">Select a document file (Max 2MB)</p>
                      <input type="file" accept=".pdf,.doc,.docx" onChange={(e) => handleImageUpload(e, setDocFile)} className="text-xs" />
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-slate-100 flex justify-end gap-3">
              <button onClick={() => setShowAddDocModal(false)} className="px-5 py-2.5 text-slate-600 text-sm font-bold hover:bg-slate-100 rounded-xl transition">Cancel</button>
              <button onClick={handleAddDoc} className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl transition shadow-md flex items-center gap-2">
                <Upload className="w-4 h-4" /> Save Document
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
