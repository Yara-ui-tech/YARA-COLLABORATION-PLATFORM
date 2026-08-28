import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building2, School, Users, Cpu, MapPin, Search, Filter, 
  Sparkles, FileText, ExternalLink, ChevronRight, CheckCircle2, 
  Plus, Shield, Globe, Award, BookOpen, Layers, ArrowUpRight
} from 'lucide-react';
import { Chapter, ChapterCategory } from '../types/chapters';
import { getChapters } from '../services/chaptersService';
import { useAuth } from '../components/AuthContext';
import ChapterDetailModal from '../components/chapters/ChapterDetailModal';
import SecretaryReportModal from '../components/chapters/SecretaryReportModal';
import { cn } from '../lib/utils';

export default function Chapters() {
  const { profile } = useAuth();
  const isAdmin = profile?.role === 'admin';

  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedProvince, setSelectedProvince] = useState<string>('ALL');

  // Modals
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportChapter, setReportChapter] = useState<Chapter | null>(null);

  const fetchChapterData = async () => {
    setLoading(true);
    const data = await getChapters(isAdmin);
    setChapters(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchChapterData();
  }, [isAdmin]);

  // Categories list
  const categoryFilters = [
    { id: 'ALL', label: 'All Chapters', icon: Layers },
    { id: 'university', label: 'University Chapters (CUT, UZ...)', icon: Building2 },
    { id: 'high_school', label: 'High School Chapters', icon: School },
    { id: 'primary_school', label: 'Primary School Chapters', icon: BookOpen },
    { id: 'community_youth', label: 'Community Youths Chapters', icon: Users },
    { id: 'polytechnic', label: 'Polytechnics & Colleges', icon: Cpu }
  ];

  // Provinces
  const provinces = [
    'ALL', 'Harare', 'Bulawayo', 'Mashonaland West', 'Mashonaland Central', 
    'Mashonaland East', 'Manicaland', 'Midlands', 'Masvingo', 
    'Matabeleland North', 'Matabeleland South'
  ];

  // Filtered Chapters
  const filteredChapters = useMemo(() => {
    return chapters.filter(c => {
      const matchSearch = 
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.institution_or_community.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.province.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.district_or_city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.focus_areas?.some(f => f.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchCat = selectedCategory === 'ALL' || c.category === selectedCategory;
      const matchProv = selectedProvince === 'ALL' || c.province === selectedProvince;

      return matchSearch && matchCat && matchProv;
    });
  }, [chapters, searchQuery, selectedCategory, selectedProvince]);

  // Aggregated Stats
  const stats = useMemo(() => {
    const totalChapters = chapters.length;
    const totalMembers = chapters.reduce((acc, c) => acc + (c.total_members_count || 0), 0);
    const totalProjects = chapters.reduce((acc, c) => acc + (c.projects?.length || c.active_projects_count || 0), 0);
    const uniqueProvinces = new Set(chapters.map(c => c.province)).size;

    return { totalChapters, totalMembers, totalProjects, uniqueProvinces };
  }, [chapters]);

  const handleOpenReportModal = (chap?: Chapter) => {
    setReportChapter(chap || (chapters.length > 0 ? chapters[0] : null));
    setReportModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50/50 py-8 md:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 md:space-y-12">
        
        {/* Top Hero Banner */}
        <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 text-white p-8 md:p-12 shadow-2xl border border-slate-800">
          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-amber-400/20 text-amber-300 border border-amber-400/30 rounded-full text-xs font-black uppercase tracking-wider">
              <Globe className="w-3.5 h-3.5" />
              <span>YARA National Robotics Chapters Network</span>
            </div>

            <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
              YARA Chapters & Innovation Hubs
            </h1>

            <p className="text-slate-300 text-sm md:text-base leading-relaxed">
              Explore hands-on robotics chapters across Zimbabwean universities (CUT, UZ), polytechnics, high schools, primary schools, and community youth centers. Discover ongoing projects, activities, and submit official secretary reports for National Executive assessment.
            </p>

            {/* Quick Action Buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={() => handleOpenReportModal()}
                className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center space-x-2 transition-all"
              >
                <FileText className="w-4 h-4" />
                <span>Submit Secretary Report</span>
              </button>

              {isAdmin && (
                <a
                  href="/admin?tab=chapters"
                  className="px-6 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold text-xs flex items-center space-x-2 transition-all"
                >
                  <Shield className="w-4 h-4 text-amber-400" />
                  <span>Admin: Manage Chapters & Assess Reports</span>
                </a>
              )}
            </div>
          </div>

          {/* Stats Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-8 border-t border-white/10 relative z-10">
            <div>
              <span className="text-2xl sm:text-3xl font-black text-white">{stats.totalChapters}</span>
              <span className="text-xs font-bold text-slate-400 block">Active Chapters</span>
            </div>
            <div>
              <span className="text-2xl sm:text-3xl font-black text-amber-400">{stats.totalMembers}+</span>
              <span className="text-xs font-bold text-slate-400 block">Student Innovators</span>
            </div>
            <div>
              <span className="text-2xl sm:text-3xl font-black text-emerald-400">{stats.totalProjects}</span>
              <span className="text-xs font-bold text-slate-400 block">Hardware Prototypes</span>
            </div>
            <div>
              <span className="text-2xl sm:text-3xl font-black text-indigo-400">{stats.uniqueProvinces} / 10</span>
              <span className="text-xs font-bold text-slate-400 block">Provinces Represented</span>
            </div>
          </div>
        </div>

        {/* Search & Category Filter Bar */}
        <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search chapters by institution (e.g. CUT, UZ), city, or project keywords..."
                className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>

            {/* Province Selector */}
            <div className="flex items-center space-x-2 shrink-0">
              <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
              <select
                value={selectedProvince}
                onChange={e => setSelectedProvince(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-hidden"
              >
                {provinces.map(p => (
                  <option key={p} value={p}>
                    {p === 'ALL' ? 'All Provinces' : p}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Category Chips */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
            {categoryFilters.map(cat => {
              const Icon = cat.icon;
              const isSelected = selectedCategory === cat.id;

              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={cn(
                    "px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap flex items-center space-x-2 transition-all shrink-0",
                    isSelected
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                      : "bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-100"
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Chapters Cards Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-600 border-t-transparent"></div>
          </div>
        ) : filteredChapters.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-slate-200 space-y-3">
            <Building2 className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="font-bold text-slate-700 text-base">No YARA Chapters Match Your Filter</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Try adjusting your search query, province, or category selection to find active chapters.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredChapters.map(chapter => {
              const catBadgeColor = 
                chapter.category === 'university' ? 'bg-indigo-50 text-indigo-700' :
                chapter.category === 'high_school' ? 'bg-blue-50 text-blue-700' :
                chapter.category === 'primary_school' ? 'bg-emerald-50 text-emerald-700' :
                chapter.category === 'community_youth' ? 'bg-amber-50 text-amber-700' : 'bg-purple-50 text-purple-700';

              return (
                <div
                  key={chapter.id}
                  className="bg-white rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
                >
                  {/* Card Cover & Header */}
                  <div>
                    <div className="relative h-44 bg-slate-900 overflow-hidden">
                      {chapter.banner_url ? (
                        <img 
                          src={chapter.banner_url} 
                          alt={chapter.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-r from-slate-950 to-indigo-950 flex items-center justify-center">
                          <Building2 className="w-12 h-12 text-indigo-400/40" />
                        </div>
                      )}

                      <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
                        <span className={cn("px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider backdrop-blur-md", catBadgeColor)}>
                          {chapter.category.replace('_', ' ')}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-black/60 text-white backdrop-blur-md">
                          {chapter.code}
                        </span>
                      </div>

                      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] font-bold text-white z-10">
                        <span className="flex items-center space-x-1 bg-black/50 px-2 py-0.5 rounded-md backdrop-blur-md">
                          <MapPin className="w-3 h-3 text-amber-400" />
                          <span>{chapter.province}</span>
                        </span>
                        <span className="bg-black/50 px-2 py-0.5 rounded-md backdrop-blur-md">
                          {chapter.total_members_count} Members
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-3">
                      <div>
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                          {chapter.institution_or_community}
                        </span>
                        <h3 className="font-black text-slate-900 text-lg group-hover:text-indigo-600 transition-colors line-clamp-2">
                          {chapter.name}
                        </h3>
                      </div>

                      <p className="text-xs text-slate-600 font-medium leading-relaxed line-clamp-3">
                        {chapter.description}
                      </p>

                      {/* Focus Area Tags */}
                      {chapter.focus_areas && chapter.focus_areas.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {chapter.focus_areas.slice(0, 3).map(area => (
                            <span key={area} className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                              #{area}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card Footer Actions */}
                  <div className="p-6 pt-0 border-t border-slate-100 flex items-center justify-between gap-2 mt-4">
                    <button
                      onClick={() => handleOpenReportModal(chapter)}
                      className="px-3 py-2 rounded-xl text-slate-600 hover:text-indigo-600 hover:bg-slate-50 text-xs font-bold transition-all flex items-center space-x-1"
                      title="File Secretary Report"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Report</span>
                    </button>

                    <button
                      onClick={() => setSelectedChapter(chapter)}
                      className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-indigo-600 text-white font-bold text-xs flex items-center space-x-1.5 transition-all shadow-xs"
                    >
                      <span>Explore Chapter</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* Chapter Detail Modal */}
      <AnimatePresence>
        {selectedChapter && (
          <ChapterDetailModal
            chapter={selectedChapter}
            isAdmin={isAdmin}
            currentUserEmail={profile?.email}
            onClose={() => setSelectedChapter(null)}
            onOpenReportModal={(chap) => handleOpenReportModal(chap)}
          />
        )}
      </AnimatePresence>

      {/* Secretary Report Submission Modal */}
      <AnimatePresence>
        {reportModalOpen && (
          <SecretaryReportModal
            chapters={chapters}
            preselectedChapter={reportChapter}
            currentUserEmail={profile?.email}
            currentUserName={profile?.full_name}
            isAdmin={isAdmin}
            onClose={() => {
              setReportModalOpen(false);
              setReportChapter(null);
            }}
            onReportSubmitted={() => {
              fetchChapterData();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
