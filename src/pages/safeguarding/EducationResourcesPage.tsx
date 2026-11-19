import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  Search, 
  Filter, 
  ShieldCheck, 
  BookOpen, 
  ExternalLink,
  Award,
  AlertCircle
} from 'lucide-react';
import SafeguardingNav from '../../components/safeguarding/SafeguardingNav';
import EmergencyHelpBanner from '../../components/safeguarding/EmergencyHelpBanner';
import { safeguardingService } from '../../services/safeguardingService';
import { SafeguardingResource } from '../../types/safeguarding';

const EducationResourcesPage: React.FC = () => {
  const [resources, setResources] = useState<SafeguardingResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [downloadNotice, setDownloadNotice] = useState<string | null>(null);

  useEffect(() => {
    loadResources();
  }, []);

  const loadResources = async () => {
    try {
      setLoading(true);
      const data = await safeguardingService.getResources();
      setResources(data);
    } catch (err) {
      console.error('Failed to load resources', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (resource: SafeguardingResource) => {
    try {
      await safeguardingService.incrementResourceDownload(resource.id);
      setResources(prev => prev.map(r => r.id === resource.id ? { ...r, download_count: r.download_count + 1 } : r));
      setDownloadNotice(`Downloading: "${resource.title}". This document is authorized under YARA Governance 2026.`);
      setTimeout(() => setDownloadNotice(null), 4500);

      // Trigger dummy download or link
      const blob = new Blob([
        `YOUNG AFRICANS ROBOTICS ASSOCIATION (YARA)
OFFICIAL GOVERNANCE & SAFEGUARDING DOCUMENTATION
------------------------------------------------------
Document Title: ${resource.title}
Category: ${resource.category.toUpperCase()}
Target Audience: ${resource.target_audience.join(', ')}
Version: ${resource.version} | Last Updated: ${resource.updated_at}
Document Status: Certified Active & Mandatory

SUMMARY & COMPLIANCE DIRECTIVE:
${resource.description}

COMPLIANCE MANDATE:
All YARA chapter executives, robotics club mentors, competition referees, and STEM volunteers
must read, sign, and adhere strictly to the protocols set forth in this document. Any breach
constitutes grounds for disciplinary termination and immediate referral to statutory authorities
under the laws of Zimbabwe and international child protection conventions.

Report concerns directly at: https://www.yaria.tech/safeguarding/report
24/7 Childline Zimbabwe: 116 (Toll-Free)
Musasa Project GBV Line: 08080074 (Toll-Free)
------------------------------------------------------
© 2026 Young Africans Robotics Association (YARA). All rights reserved.`
      ], { type: 'text/plain' });

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${resource.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_v${resource.version}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download tracking failed', err);
    }
  };

  const categories = [
    { id: 'all', label: 'All Documents' },
    { id: 'policy', label: 'Official Policies' },
    { id: 'code_of_conduct', label: 'Codes of Conduct' },
    { id: 'guide', label: 'Practical Guides' },
    { id: 'form', label: 'Consent & Audit Forms' },
    { id: 'training', label: 'Training Curricula' },
  ];

  const filteredResources = resources.filter(res => {
    const matchesCategory = selectedCategory === 'all' || res.category === selectedCategory;
    const matchesSearch = 
      res.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      res.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      res.target_audience.some(a => a.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#F8FAFF] text-[#1E293B]">
      <EmergencyHelpBanner />
      <SafeguardingNav />

      {/* Hero Header */}
      <section className="bg-gradient-to-r from-[#0A1B4D] via-[#0D47A1] to-[#1976D2] text-white py-14 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-[#00C6FF] text-xs font-semibold mb-4">
            <BookOpen className="w-4 h-4" />
            Official Governance, Compliance & Policy Library
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight mb-4">
            Safeguarding Policies & Training Resources
          </h1>
          <p className="text-lg text-blue-100 max-w-3xl mx-auto leading-relaxed">
            Institutional frameworks, downloadable codes of conduct, field trip protocols, and child-safe STEM guidelines enforceable across all YARA university chapters, school robotics clubs, and public competition arenas.
          </p>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Download notification banner */}
        {downloadNotice && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 flex items-center justify-between shadow-sm animate-fade-in">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <p className="text-sm font-semibold">{downloadNotice}</p>
            </div>
          </div>
        )}

        {/* Filter and Search Bar */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#CBD5E1] p-5 mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search policies, codes of conduct, checklists, consent forms..."
                className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-[#CBD5E1] bg-white text-[#1E293B] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00C6FF] focus:border-transparent text-sm transition-all shadow-inner"
              />
            </div>

            {/* Category Badges */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-thin">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    selectedCategory === cat.id
                      ? 'bg-[#0A1B4D] text-white shadow'
                      : 'bg-[#E8F4FF] text-[#0D47A1] hover:bg-blue-100'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Resource Cards Grid */}
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-12 h-12 border-4 border-[#0D47A1] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-600 font-medium">Loading YARA safeguarding document library...</p>
          </div>
        ) : filteredResources.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-[#CBD5E1] p-8">
            <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-[#0A1B4D] mb-1">No matching documents found</h3>
            <p className="text-slate-600 text-sm max-w-md mx-auto mb-4">
              Try adjusting your search terms or select "All Documents" to browse the full library.
            </p>
            <button
              onClick={() => { setSearchTerm(''); setSelectedCategory('all'); }}
              className="px-4 py-2 bg-[#0D47A1] text-white rounded-xl text-xs font-bold hover:bg-[#0A1B4D] transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResources.map(res => (
              <div 
                key={res.id}
                className="bg-white rounded-2xl border border-[#CBD5E1] shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
              >
                <div className="p-6">
                  {/* Category and Version */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#E8F4FF] text-[#0D47A1]">
                      {res.category.replace('_', ' ')}
                    </span>
                    <span className="text-xs font-mono text-slate-500">
                      v{res.version}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-bold text-[#0A1B4D] group-hover:text-[#1976D2] transition-colors mb-2 leading-snug">
                    {res.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-slate-600 mb-4 line-clamp-3 leading-relaxed">
                    {res.description}
                  </p>

                  {/* Target Audience Badges */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {res.target_audience.map((aud, i) => (
                      <span key={i} className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium">
                        {aud}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Footer bar */}
                <div className="p-4 bg-slate-50 border-t border-[#CBD5E1] flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-slate-400" />
                    <span>{res.file_size || 'PDF / Digital Text'}</span>
                    <span className="text-slate-300">•</span>
                    <span>{res.download_count} downloads</span>
                  </div>
                  <button
                    onClick={() => handleDownload(res)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0D47A1] text-white hover:bg-[#0A1B4D] transition-colors font-semibold text-xs shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Institutional Safeguarding Training Mandate Card */}
        <section className="mt-14 bg-gradient-to-br from-[#0A1B4D] to-[#0D47A1] text-white rounded-3xl p-8 sm:p-10 shadow-lg relative overflow-hidden">
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[#00C6FF] text-xs font-semibold mb-4">
              <Award className="w-4 h-4" />
              Annual Mandatory Accreditation
            </div>
            <h2 className="text-2xl sm:text-3xl font-black mb-3">
              YARA Safeguarding Certification Course (e-Learning)
            </h2>
            <p className="text-blue-100 text-sm sm:text-base leading-relaxed mb-6">
              All Chapter Leaders, Robotics Instructors, Mentors, and Competition Marshals must complete the 45-minute YARA Safeguarding & Ethics E-Module prior to supervising any youth robotics club or arena event.
            </p>
            <div className="flex flex-wrap gap-4">
              <a
                href="/learn"
                className="px-6 py-3 rounded-xl bg-[#00C6FF] text-[#0A1B4D] font-extrabold text-sm hover:bg-cyan-300 transition-colors shadow"
              >
                Enroll in Safeguarding Academy
              </a>
              <a
                href="/safeguarding/chapters"
                className="px-6 py-3 rounded-xl bg-white/10 border border-white/20 text-white font-bold text-sm hover:bg-white/20 transition-colors"
              >
                Verify Chapter Compliance
              </a>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default EducationResourcesPage;