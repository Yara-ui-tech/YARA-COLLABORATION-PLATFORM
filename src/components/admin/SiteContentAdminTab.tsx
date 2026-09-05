import React, { useState, useEffect } from 'react';
import { 
  Layers, 
  Plus, 
  Trash2, 
  Edit3, 
  Eye, 
  EyeOff, 
  ArrowUp, 
  ArrowDown, 
  Save, 
  X, 
  Check, 
  Sparkles, 
  Link as LinkIcon, 
  Image as ImageIcon,
  Layout,
  HelpCircle,
  Zap,
  Globe,
  RefreshCw,
  Sliders,
  ExternalLink
} from 'lucide-react';
import { 
  SiteContentSection, 
  SectionType, 
  PageTarget, 
  SiteSectionItem,
  getAllSiteSectionsForAdmin, 
  addSiteSection, 
  updateSiteSection, 
  deleteSiteSection, 
  saveSiteSections 
} from '../../services/siteContentService';

export const SiteContentAdminTab: React.FC = () => {
  const [sections, setSections] = useState<SiteContentSection[]>([]);
  const [selectedPageFilter, setSelectedPageFilter] = useState<PageTarget | 'all_pages'>('all_pages');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);

  // Form State
  const [page, setPage] = useState<PageTarget>('home');
  const [sectionType, setSectionType] = useState<SectionType>('hero_banner');
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [content, setContent] = useState('');
  const [badgeText, setBadgeText] = useState('');
  const [themeColor, setThemeColor] = useState('indigo');
  const [imageUrl, setImageUrl] = useState('');
  const [ctaText, setCtaText] = useState('');
  const [ctaLink, setCtaLink] = useState('');
  const [secondaryCtaText, setSecondaryCtaText] = useState('');
  const [secondaryCtaLink, setSecondaryCtaLink] = useState('');
  const [items, setItems] = useState<SiteSectionItem[]>([]);

  // Item Sub-Form State (for feature_grid and faq_accordion)
  const [itemTitle, setItemTitle] = useState('');
  const [itemDesc, setItemDesc] = useState('');
  const [itemBadge, setItemBadge] = useState('');

  // Live Preview State
  const [previewSection, setPreviewSection] = useState<SiteContentSection | null>(null);

  useEffect(() => {
    loadSections();
  }, []);

  const loadSections = async () => {
    setLoading(true);
    const data = await getAllSiteSectionsForAdmin();
    setSections(data);
    setLoading(false);
  };

  const handleOpenAddModal = () => {
    setEditingSectionId(null);
    setPage('home');
    setSectionType('hero_banner');
    setTitle('');
    setSubtitle('');
    setContent('');
    setBadgeText('');
    setThemeColor('indigo');
    setImageUrl('');
    setCtaText('');
    setCtaLink('');
    setSecondaryCtaText('');
    setSecondaryCtaLink('');
    setItems([]);
    setItemTitle('');
    setItemDesc('');
    setItemBadge('');
    setShowModal(true);
  };

  const handleOpenEditModal = (sec: SiteContentSection) => {
    setEditingSectionId(sec.id);
    setPage(sec.page);
    setSectionType(sec.sectionType);
    setTitle(sec.title);
    setSubtitle(sec.subtitle || '');
    setContent(sec.content || '');
    setBadgeText(sec.badgeText || '');
    setThemeColor(sec.themeColor || 'indigo');
    setImageUrl(sec.imageUrl || '');
    setCtaText(sec.ctaText || '');
    setCtaLink(sec.ctaLink || '');
    setSecondaryCtaText(sec.secondaryCtaText || '');
    setSecondaryCtaLink(sec.secondaryCtaLink || '');
    setItems(sec.items ? [...sec.items] : []);
    setItemTitle('');
    setItemDesc('');
    setItemBadge('');
    setShowModal(true);
  };

  const handleAddItem = () => {
    if (!itemTitle.trim()) return;
    const newItem: SiteSectionItem = {
      id: `item_${Date.now()}`,
      title: itemTitle.trim(),
      description: itemDesc.trim(),
      badge: itemBadge.trim() || undefined
    };
    setItems([...items, newItem]);
    setItemTitle('');
    setItemDesc('');
    setItemBadge('');
  };

  const handleRemoveItem = (id: string) => {
    setItems(items.filter(it => it.id !== id));
  };

  const handleSaveForm = async () => {
    if (!title.trim()) {
      alert('Please provide a section title.');
      return;
    }

    setSaving(true);
    if (editingSectionId) {
      await updateSiteSection(editingSectionId, {
        page,
        sectionType,
        title: title.trim(),
        subtitle: subtitle.trim() || undefined,
        content: content.trim() || undefined,
        badgeText: badgeText.trim() || undefined,
        themeColor,
        imageUrl: imageUrl.trim() || undefined,
        ctaText: ctaText.trim() || undefined,
        ctaLink: ctaLink.trim() || undefined,
        secondaryCtaText: secondaryCtaText.trim() || undefined,
        secondaryCtaLink: secondaryCtaLink.trim() || undefined,
        items: items.length > 0 ? items : undefined
      });
    } else {
      await addSiteSection({
        page,
        sectionType,
        title: title.trim(),
        subtitle: subtitle.trim() || undefined,
        content: content.trim() || undefined,
        badgeText: badgeText.trim() || undefined,
        themeColor,
        imageUrl: imageUrl.trim() || undefined,
        ctaText: ctaText.trim() || undefined,
        ctaLink: ctaLink.trim() || undefined,
        secondaryCtaText: secondaryCtaText.trim() || undefined,
        secondaryCtaLink: secondaryCtaLink.trim() || undefined,
        items: items.length > 0 ? items : undefined,
        sortOrder: sections.length + 1,
        isActive: true
      });
    }

    await loadSections();
    setSaving(false);
    setShowModal(false);
  };

  const handleDelete = async (id: string, secTitle: string) => {
    if (confirm(`Are you sure you want to delete "${secTitle}"? This will immediately remove it from public pages.`)) {
      await deleteSiteSection(id);
      await loadSections();
    }
  };

  const handleToggleActive = async (sec: SiteContentSection) => {
    await updateSiteSection(sec.id, { isActive: !sec.isActive });
    await loadSections();
  };

  const handleMoveOrder = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sections.length) return;

    const newSections = [...sections];
    const temp = newSections[index];
    newSections[index] = newSections[targetIndex];
    newSections[targetIndex] = temp;

    // update sortOrder values
    const reordered = newSections.map((s, idx) => ({ ...s, sortOrder: idx + 1 }));
    setSections(reordered);
    await saveSiteSections(reordered);
  };

  const filteredSections = sections.filter(sec => {
    if (selectedPageFilter === 'all_pages') return true;
    return sec.page === selectedPageFilter;
  });

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white p-8 md:p-10 rounded-[2.5rem] shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 rounded-full text-xs font-black uppercase bg-indigo-500/20 text-indigo-200 border border-indigo-400/30 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5" />
              Universal CMS & Dynamic Section Engine
            </span>
          </div>
          <h2 className="text-2xl md:text-3xl font-black tracking-tight">
            Site Content & Section Manager
          </h2>
          <p className="text-sm text-indigo-100/80 max-w-2xl mt-1">
            Create, modify, reorder, or remove any page banner, announcement, feature card, FAQ, or call-to-action across the entire platform.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="px-6 py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm rounded-2xl transition shadow-lg flex items-center gap-2 flex-shrink-0"
        >
          <Plus className="w-4 h-4" /> Add New Section
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 p-2 bg-slate-100 rounded-2xl w-fit">
        {[
          { key: 'all_pages', label: 'All Pages' },
          { key: 'home', label: 'Home Page' },
          { key: 'about', label: 'About Us' },
          { key: 'programs', label: 'Programs' },
          { key: 'resources', label: 'Resources' },
          { key: 'events', label: 'Events' },
          { key: 'competitions', label: 'Competitions' },
          { key: 'contact', label: 'Contact' }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setSelectedPageFilter(tab.key as any)}
            className={`px-4 py-2 rounded-xl text-xs font-black transition ${
              selectedPageFilter === tab.key
                ? 'bg-white text-indigo-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Sections List */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-12 text-center text-slate-400 font-medium">Loading content sections...</div>
        ) : filteredSections.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-slate-200">
            <Layout className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h4 className="text-base font-bold text-slate-700">No sections found for this page filter</h4>
            <p className="text-xs text-slate-500 mt-1 mb-4">Click below to create your first dynamic section.</p>
            <button onClick={handleOpenAddModal} className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-md">
              Create Section
            </button>
          </div>
        ) : (
          filteredSections.map((sec, idx) => (
            <div 
              key={sec.id}
              className={`bg-white rounded-3xl border p-6 transition shadow-sm hover:shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${
                sec.isActive ? 'border-slate-200' : 'border-slate-200/50 opacity-60 bg-slate-50/50'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="flex flex-col items-center gap-1 pt-1">
                  <button 
                    onClick={() => handleMoveOrder(idx, 'up')}
                    disabled={idx === 0}
                    className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700 disabled:opacity-20"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[10px] font-black text-slate-400">#{sec.sortOrder}</span>
                  <button 
                    onClick={() => handleMoveOrder(idx, 'down')}
                    disabled={idx === filteredSections.length - 1}
                    className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700 disabled:opacity-20"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-100">
                      Page: {sec.page}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                      Type: {sec.sectionType.replace('_', ' ')}
                    </span>
                    {sec.badgeText && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700">
                        {sec.badgeText}
                      </span>
                    )}
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                      sec.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {sec.isActive ? 'LIVE' : 'HIDDEN'}
                    </span>
                  </div>

                  <h3 className="text-base font-black text-slate-900">{sec.title}</h3>
                  {sec.subtitle && (
                    <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{sec.subtitle}</p>
                  )}
                  {sec.ctaText && sec.ctaLink && (
                    <p className="text-[11px] text-indigo-600 font-bold mt-1 flex items-center gap-1">
                      <LinkIcon className="w-3 h-3" /> {sec.ctaText} &rarr; {sec.ctaLink}
                    </p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 w-full md:w-auto justify-end border-t md:border-t-0 pt-3 md:pt-0">
                <button
                  onClick={() => handleToggleActive(sec)}
                  className={`p-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                    sec.isActive ? 'bg-slate-100 text-slate-700 hover:bg-slate-200' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                  }`}
                  title={sec.isActive ? 'Hide Section' : 'Publish Live'}
                >
                  {sec.isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>

                <button
                  onClick={() => handleOpenEditModal(sec)}
                  className="px-4 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                >
                  <Edit3 className="w-3.5 h-3.5" /> Edit
                </button>

                <button
                  onClick={() => handleDelete(sec.id, sec.title)}
                  className="p-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-bold transition"
                  title="Delete Section"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* --- ADD / EDIT SECTION MODAL --- */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl my-8 max-h-[90vh] flex flex-col overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <div>
                <h3 className="text-xl font-black text-slate-900">
                  {editingSectionId ? 'Edit Content Section' : 'Create New Section'}
                </h3>
                <p className="text-xs text-slate-500">Configure visual layout, copy, actions, and media</p>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-500">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6">
              {/* Row 1: Target Page & Section Type */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Target Page *</label>
                  <select
                    value={page}
                    onChange={e => setPage(e.target.value as PageTarget)}
                    className="w-full p-3 text-sm bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="home">Home Page (Landing)</option>
                    <option value="about">About Us</option>
                    <option value="programs">Programs & Curriculum</option>
                    <option value="resources">Resources & Kits</option>
                    <option value="events">Events & Workshops</option>
                    <option value="competitions">Competitions</option>
                    <option value="contact">Contact & Support</option>
                    <option value="all">Global (All Pages)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Section Layout Type *</label>
                  <select
                    value={sectionType}
                    onChange={e => setSectionType(e.target.value as SectionType)}
                    className="w-full p-3 text-sm bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="hero_banner">Hero Banner (High-Impact Card)</option>
                    <option value="feature_grid">Feature Grid (3-Column Pillar Cards)</option>
                    <option value="text_block">Dark Editorial Text Block</option>
                    <option value="faq_accordion">FAQ Accordion (Interactive Q&A)</option>
                    <option value="call_to_action">Call To Action Banner</option>
                    <option value="custom_html">Custom HTML / Embed</option>
                  </select>
                </div>
              </div>

              {/* Row 2: Title & Badge */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Main Title *</label>
                  <input
                    type="text"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    className="w-full p-3 text-sm bg-slate-50 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="e.g. Pan-African AI & Robotics Challenge 2026"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Badge Tag</label>
                  <input
                    type="text"
                    value={badgeText}
                    onChange={e => setBadgeText(e.target.value)}
                    className="w-full p-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="e.g. 🌟 Major Announcement"
                  />
                </div>
              </div>

              {/* Row 3: Subtitle & Theme Color */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Subtitle / Headline</label>
                  <input
                    type="text"
                    value={subtitle}
                    onChange={e => setSubtitle(e.target.value)}
                    className="w-full p-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="e.g. Registrations are now open for teams and mentors across Africa."
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Theme Color</label>
                  <select
                    value={themeColor}
                    onChange={e => setThemeColor(e.target.value)}
                    className="w-full p-3 text-sm bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="indigo">Indigo / Royal Blue</option>
                    <option value="emerald">Emerald / Teal</option>
                    <option value="amber">Amber / Orange</option>
                    <option value="rose">Rose / Pink</option>
                    <option value="violet">Violet / Purple</option>
                    <option value="cyan">Cyan / Sky</option>
                    <option value="slate">Dark Slate / Midnight</option>
                  </select>
                </div>
              </div>

              {/* Row 4: Body Content */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Detailed Content / Copy</label>
                <textarea
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  className="w-full p-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none min-h-[100px]"
                  placeholder="Detailed paragraph, markdown, or HTML copy..."
                />
              </div>

              {/* Row 5: CTA Buttons */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3">
                <span className="text-xs font-black uppercase text-slate-600 block">Call to Action Buttons</span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Primary Button Text</label>
                    <input
                      type="text"
                      value={ctaText}
                      onChange={e => setCtaText(e.target.value)}
                      className="w-full p-2.5 text-xs bg-white border border-slate-200 rounded-xl"
                      placeholder="e.g. Register Team"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Primary Button Link / URL</label>
                    <input
                      type="text"
                      value={ctaLink}
                      onChange={e => setCtaLink(e.target.value)}
                      className="w-full p-2.5 text-xs bg-white border border-slate-200 rounded-xl"
                      placeholder="e.g. /competitions or https://..."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Secondary Button Text</label>
                    <input
                      type="text"
                      value={secondaryCtaText}
                      onChange={e => setSecondaryCtaText(e.target.value)}
                      className="w-full p-2.5 text-xs bg-white border border-slate-200 rounded-xl"
                      placeholder="e.g. Download Kit"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Secondary Button Link / URL</label>
                    <input
                      type="text"
                      value={secondaryCtaLink}
                      onChange={e => setSecondaryCtaLink(e.target.value)}
                      className="w-full p-2.5 text-xs bg-white border border-slate-200 rounded-xl"
                      placeholder="e.g. /resources"
                    />
                  </div>
                </div>
              </div>

              {/* Row 6: Image / Background URL */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Cover / Background Image URL</label>
                <input
                  type="text"
                  value={imageUrl}
                  onChange={e => setImageUrl(e.target.value)}
                  className="w-full p-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="https://images.unsplash.com/..."
                />
              </div>

              {/* Sub-Items builder for Feature Grids and FAQs */}
              {(sectionType === 'feature_grid' || sectionType === 'faq_accordion') && (
                <div className="bg-indigo-50/50 p-5 rounded-2xl border border-indigo-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase text-indigo-900">
                      {sectionType === 'faq_accordion' ? 'FAQ Questions & Answers' : 'Grid Cards / Feature Columns'} ({items.length})
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <input
                      type="text"
                      value={itemTitle}
                      onChange={e => setItemTitle(e.target.value)}
                      placeholder={sectionType === 'faq_accordion' ? 'Question title...' : 'Card title...'}
                      className="p-2 text-xs bg-white border border-slate-200 rounded-xl md:col-span-2"
                    />
                    <input
                      type="text"
                      value={itemBadge}
                      onChange={e => setItemBadge(e.target.value)}
                      placeholder="Optional badge/tag..."
                      className="p-2 text-xs bg-white border border-slate-200 rounded-xl"
                    />
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={itemDesc}
                      onChange={e => setItemDesc(e.target.value)}
                      placeholder={sectionType === 'faq_accordion' ? 'Answer description...' : 'Card body copy...'}
                      className="flex-1 p-2 text-xs bg-white border border-slate-200 rounded-xl"
                    />
                    <button
                      type="button"
                      onClick={handleAddItem}
                      className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl shadow-sm hover:bg-indigo-700"
                    >
                      Add Item
                    </button>
                  </div>

                  {items.length > 0 && (
                    <div className="space-y-2 pt-2">
                      {items.map((it, i) => (
                        <div key={it.id || i} className="p-3 bg-white rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                          <div>
                            <span className="font-bold text-slate-800">{it.title}</span>
                            {it.badge && <span className="ml-2 px-1.5 py-0.5 bg-slate-100 text-slate-600 text-[10px] rounded font-bold">{it.badge}</span>}
                            <p className="text-slate-500 text-[11px] line-clamp-1">{it.description}</p>
                          </div>
                          <button onClick={() => handleRemoveItem(it.id)} className="text-red-500 hover:text-red-700 p-1">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="p-6 border-t border-slate-100 flex justify-end gap-3 sticky bottom-0 bg-white z-10">
              <button
                onClick={() => setShowModal(false)}
                className="px-5 py-2.5 text-slate-600 text-sm font-bold hover:bg-slate-100 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveForm}
                disabled={saving}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl transition shadow-md flex items-center gap-2"
              >
                <Check className="w-4 h-4" /> {saving ? 'Saving...' : 'Save & Publish Section'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
