import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  ChevronDown, 
  Sparkles, 
  ExternalLink, 
  Layers, 
  CheckCircle2, 
  HelpCircle, 
  Activity,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getSiteSections, SiteContentSection, PageTarget } from '../services/siteContentService';

interface Props {
  page: PageTarget;
  className?: string;
}

export const DynamicSectionRenderer: React.FC<Props> = ({ page, className = '' }) => {
  const [sections, setSections] = useState<SiteContentSection[]>([]);
  const [openFaqId, setOpenFaqId] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    getSiteSections(page).then(data => {
      if (mounted) setSections(data);
    });
    return () => { mounted = false; };
  }, [page]);

  if (!sections || sections.length === 0) {
    return null;
  }

  const getThemeGradient = (color?: string) => {
    switch (color) {
      case 'emerald':
        return 'from-emerald-600 via-teal-600 to-emerald-800 text-white';
      case 'amber':
        return 'from-amber-600 via-orange-600 to-amber-800 text-white';
      case 'rose':
        return 'from-rose-600 via-pink-600 to-rose-800 text-white';
      case 'violet':
        return 'from-violet-600 via-purple-600 to-indigo-800 text-white';
      case 'cyan':
        return 'from-cyan-600 via-sky-600 to-blue-800 text-white';
      case 'slate':
        return 'from-slate-800 via-slate-900 to-black text-white';
      case 'indigo':
      default:
        return 'from-indigo-600 via-blue-600 to-indigo-900 text-white';
    }
  };

  const getBadgeStyle = (color?: string) => {
    switch (color) {
      case 'emerald': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'amber': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'rose': return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'violet': return 'bg-violet-100 text-violet-800 border-violet-200';
      case 'cyan': return 'bg-cyan-100 text-cyan-800 border-cyan-200';
      case 'slate': return 'bg-slate-100 text-slate-800 border-slate-200';
      case 'indigo':
      default: return 'bg-indigo-100 text-indigo-800 border-indigo-200';
    }
  };

  return (
    <div className={`space-y-12 my-12 ${className}`}>
      {sections.map((section) => {
        return (
          <div key={section.id} className="relative transition-all duration-300">
            {/* 1. HERO BANNER */}
            {section.sectionType === 'hero_banner' && (
              <div className={`relative overflow-hidden rounded-[2.5rem] p-8 md:p-14 bg-gradient-to-br ${getThemeGradient(section.themeColor)} shadow-2xl`}>
                {section.imageUrl && (
                  <div className="absolute inset-0 opacity-15 mix-blend-overlay">
                    <img src={section.imageUrl} alt="" className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="relative z-10 max-w-3xl">
                  {section.badgeText && (
                    <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-white/20 backdrop-blur-md text-white border border-white/30 mb-6">
                      <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                      {section.badgeText}
                    </span>
                  )}
                  <h2 className="text-3xl md:text-5xl font-black tracking-tight leading-tight mb-4">
                    {section.title}
                  </h2>
                  {section.subtitle && (
                    <p className="text-lg md:text-xl font-medium opacity-90 mb-4">
                      {section.subtitle}
                    </p>
                  )}
                  {section.content && (
                    <p className="text-sm md:text-base opacity-80 leading-relaxed mb-8">
                      {section.content}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-4 pt-2">
                    {section.ctaText && section.ctaLink && (
                      section.ctaLink.startsWith('http') ? (
                        <a 
                          href={section.ctaLink} 
                          target="_blank" 
                          rel="noreferrer"
                          className="px-6 py-3.5 bg-white text-slate-900 font-black text-sm rounded-2xl hover:bg-slate-100 transition shadow-lg flex items-center gap-2"
                        >
                          {section.ctaText} <ExternalLink className="w-4 h-4" />
                        </a>
                      ) : (
                        <Link 
                          to={section.ctaLink}
                          className="px-6 py-3.5 bg-white text-slate-900 font-black text-sm rounded-2xl hover:bg-slate-100 transition shadow-lg flex items-center gap-2"
                        >
                          {section.ctaText} <ArrowRight className="w-4 h-4" />
                        </Link>
                      )
                    )}

                    {section.secondaryCtaText && section.secondaryCtaLink && (
                      section.secondaryCtaLink.startsWith('http') ? (
                        <a 
                          href={section.secondaryCtaLink} 
                          target="_blank" 
                          rel="noreferrer"
                          className="px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold text-sm rounded-2xl transition flex items-center gap-2"
                        >
                          {section.secondaryCtaText}
                        </a>
                      ) : (
                        <Link 
                          to={section.secondaryCtaLink}
                          className="px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold text-sm rounded-2xl transition flex items-center gap-2"
                        >
                          {section.secondaryCtaText}
                        </Link>
                      )
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* 2. FEATURE GRID */}
            {section.sectionType === 'feature_grid' && (
              <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 md:p-12 shadow-xl shadow-slate-100/50">
                <div className="max-w-2xl mb-10">
                  {section.badgeText && (
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border mb-3 ${getBadgeStyle(section.themeColor)}`}>
                      {section.badgeText}
                    </span>
                  )}
                  <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight mb-2">
                    {section.title}
                  </h2>
                  {section.subtitle && (
                    <p className="text-sm md:text-base text-slate-600">
                      {section.subtitle}
                    </p>
                  )}
                </div>

                {section.items && section.items.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {section.items.map((item, idx) => (
                      <div key={item.id || idx} className="p-6 rounded-2xl bg-slate-50 border border-slate-100/80 hover:border-slate-300 hover:shadow-md transition">
                        {item.badge && (
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-700 mb-3">
                            {item.badge}
                          </span>
                        )}
                        <h3 className="text-base font-bold text-slate-900 mb-2">{item.title}</h3>
                        {item.description && (
                          <p className="text-xs md:text-sm text-slate-600 leading-relaxed">{item.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 3. TEXT BLOCK */}
            {section.sectionType === 'text_block' && (
              <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-[2.5rem] p-8 md:p-12 shadow-xl">
                <div className="max-w-3xl">
                  {section.badgeText && (
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-indigo-300 border border-white/10 mb-4">
                      {section.badgeText}
                    </span>
                  )}
                  <h2 className="text-2xl md:text-4xl font-black tracking-tight mb-3">
                    {section.title}
                  </h2>
                  {section.subtitle && (
                    <p className="text-base md:text-lg text-slate-300 font-medium mb-4">
                      {section.subtitle}
                    </p>
                  )}
                  {section.content && (
                    <p className="text-sm md:text-base text-slate-400 leading-relaxed mb-6 whitespace-pre-line">
                      {section.content}
                    </p>
                  )}
                  {section.ctaText && section.ctaLink && (
                    <Link to={section.ctaLink} className="inline-flex items-center gap-2 text-sm font-bold text-indigo-400 hover:text-indigo-300">
                      {section.ctaText} <ArrowRight className="w-4 h-4" />
                    </Link>
                  )}
                </div>
              </div>
            )}

            {/* 4. FAQ ACCORDION */}
            {section.sectionType === 'faq_accordion' && (
              <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 md:p-12 shadow-xl shadow-slate-100/50">
                <div className="text-center max-w-2xl mx-auto mb-10">
                  {section.badgeText && (
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border mb-3 ${getBadgeStyle(section.themeColor)}`}>
                      {section.badgeText}
                    </span>
                  )}
                  <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight mb-2">
                    {section.title}
                  </h2>
                  {section.subtitle && (
                    <p className="text-sm text-slate-600">{section.subtitle}</p>
                  )}
                </div>

                {section.items && section.items.length > 0 && (
                  <div className="max-w-3xl mx-auto space-y-3">
                    {section.items.map((item, idx) => {
                      const isOpen = openFaqId === (item.id || `faq_${idx}`);
                      return (
                        <div key={item.id || idx} className="border border-slate-200 rounded-2xl overflow-hidden transition">
                          <button
                            onClick={() => setOpenFaqId(isOpen ? null : (item.id || `faq_${idx}`))}
                            className="w-full text-left p-5 bg-slate-50/50 hover:bg-slate-50 flex items-center justify-between font-bold text-sm text-slate-900 transition"
                          >
                            <span>{item.title}</span>
                            <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                          </button>
                          <AnimatePresence>
                            {isOpen && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="p-5 bg-white text-xs md:text-sm text-slate-600 border-t border-slate-100 leading-relaxed"
                              >
                                {item.description}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* 5. CALL TO ACTION BANNER */}
            {section.sectionType === 'call_to_action' && (
              <div className="rounded-[2.5rem] bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white p-8 md:p-12 text-center shadow-xl">
                <div className="max-w-2xl mx-auto">
                  {section.badgeText && (
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 mb-4">
                      {section.badgeText}
                    </span>
                  )}
                  <h2 className="text-2xl md:text-4xl font-black mb-3">{section.title}</h2>
                  {section.subtitle && <p className="text-sm md:text-base text-indigo-200 mb-6">{section.subtitle}</p>}
                  {section.ctaText && section.ctaLink && (
                    <Link to={section.ctaLink} className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-indigo-950 font-black rounded-2xl hover:bg-indigo-50 transition shadow-lg text-sm">
                      {section.ctaText} <ArrowRight className="w-4 h-4" />
                    </Link>
                  )}
                </div>
              </div>
            )}

            {/* 6. CUSTOM HTML */}
            {section.sectionType === 'custom_html' && section.content && (
              <div 
                className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm overflow-hidden"
                dangerouslySetInnerHTML={{ __html: section.content }} 
              />
            )}
          </div>
        );
      })}
    </div>
  );
};
