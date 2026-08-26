import React, { useState, useEffect, useMemo } from 'react';
import { 
  Trophy, Plus, Search, Edit2, Trash2, Calendar, MapPin, 
  ExternalLink, Sparkles, AlertCircle, CheckCircle2, 
  X, Filter, DollarSign, Users, Award, ShieldCheck, 
  RefreshCw, Star, Layers, Compass, ArrowRight, Eye
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Competition } from '../../types/competition';
import { 
  getCompetitions, 
  createCompetition, 
  updateCompetition, 
  deleteCompetition 
} from '../../services/competitionsService';
import { cn } from '../../lib/utils';
import YaraCompetitionAdminTab from './YaraCompetitionAdminTab';

const CATEGORY_OPTIONS = [
  { value: 'flagship_robotics', label: 'Flagship Robotics Championship', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  { value: 'underwater_rov', label: 'Underwater Drone & ROV Challenge', color: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
  { value: 'autonomous_vehicles', label: 'Autonomous Vehicles & Maze Derby', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  { value: 'hackathon', label: 'Smart AgTech & AI Hackathon', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { value: 'junior_stem', label: 'Junior STEM & Primary Bot Open', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  { value: 'robotics_open', label: 'General Open Robotics Tournament', color: 'bg-slate-50 text-slate-700 border-slate-200' }
];

export default function CompetitionsAdminTab() {
  const [activeSection, setActiveSection] = useState<'all_competitions' | 'yara_2026_hub'>('all_competitions');
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingComp, setEditingComp] = useState<Competition | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<Competition>>({
    title: '',
    subtitle: '',
    description: '',
    category: 'flagship_robotics',
    format: 'hybrid',
    status: 'upcoming',
    start_date: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 16),
    end_date: new Date(Date.now() + 32 * 86400000).toISOString().slice(0, 16),
    registration_deadline: new Date(Date.now() + 20 * 86400000).toISOString().slice(0, 16),
    location: 'Harare, Zimbabwe',
    image_url: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=80',
    registration_link: '/competition/participant',
    internal_route: '/competitions/yara-2026',
    prize_pool: '$10,000 + STEM Grants',
    entry_fee: 0,
    currency: 'USD',
    max_teams: 50,
    eligibility: 'High Schools, Polytechnics, Universities & Community Youth Teams (2 Boys + 2 Girls ratio mandatory)',
    rules_summary: 'Hardware inspection, autonomous rounds scoring, and innovation pitch presentation.',
    is_featured: false,
    tags: ['Robotics', 'Innovation']
  });

  const [tagInput, setTagInput] = useState('');

  const loadData = async () => {
    setLoading(true);
    const comps = await getCompetitions();
    setCompetitions(comps);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredCompetitions = useMemo(() => {
    return competitions.filter(c => {
      const matchSearch = (c.title + ' ' + (c.subtitle || '') + ' ' + (c.description || '') + ' ' + (c.location || ''))
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchStatus = statusFilter === 'ALL' || c.status === statusFilter;
      const matchCategory = categoryFilter === 'ALL' || c.category === categoryFilter;
      return matchSearch && matchStatus && matchCategory;
    });
  }, [competitions, searchQuery, statusFilter, categoryFilter]);

  const stats = useMemo(() => {
    const total = competitions.length;
    const active = competitions.filter(c => c.status === 'active').length;
    const upcoming = competitions.filter(c => c.status === 'upcoming').length;
    const featured = competitions.filter(c => c.is_featured).length;
    return { total, active, upcoming, featured };
  }, [competitions]);

  const openAddModal = () => {
    setEditingComp(null);
    setFormData({
      title: '',
      subtitle: '',
      description: '',
      category: 'flagship_robotics',
      format: 'hybrid',
      status: 'upcoming',
      start_date: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 16),
      end_date: new Date(Date.now() + 32 * 86400000).toISOString().slice(0, 16),
      registration_deadline: new Date(Date.now() + 20 * 86400000).toISOString().slice(0, 16),
      location: 'YARA National Science Arena, Harare',
      image_url: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=80',
      registration_link: '/competition/participant',
      internal_route: '/competitions/yara-2026',
      prize_pool: '$10,000 + STEM Grants',
      entry_fee: 0,
      currency: 'USD',
      max_teams: 50,
      eligibility: 'High Schools, Polytechnics, Universities & Community Youth Teams (2 Boys + 2 Girls ratio mandatory)',
      rules_summary: 'Hardware telemetry inspection, autonomous rounds scoring, and innovation pitch presentation.',
      is_featured: false,
      tags: ['Robotics', 'Innovation']
    });
    setTagInput('');
    setIsModalOpen(true);
  };

  const openEditModal = (comp: Competition) => {
    setEditingComp(comp);
    setFormData({
      ...comp,
      start_date: comp.start_date ? new Date(comp.start_date).toISOString().slice(0, 16) : '',
      end_date: comp.end_date ? new Date(comp.end_date).toISOString().slice(0, 16) : '',
      registration_deadline: comp.registration_deadline ? new Date(comp.registration_deadline).toISOString().slice(0, 16) : ''
    });
    setTagInput('');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title?.trim()) {
      setErrorMessage('Competition title is required.');
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);

    try {
      if (editingComp) {
        await updateCompetition(editingComp.id, {
          ...formData,
          start_date: formData.start_date ? new Date(formData.start_date).toISOString() : undefined,
          end_date: formData.end_date ? new Date(formData.end_date).toISOString() : undefined,
          registration_deadline: formData.registration_deadline ? new Date(formData.registration_deadline).toISOString() : undefined,
        });
        setSuccessMessage(`Updated "${formData.title}" successfully.`);
      } else {
        await createCompetition({
          ...formData,
          start_date: formData.start_date ? new Date(formData.start_date).toISOString() : undefined,
          end_date: formData.end_date ? new Date(formData.end_date).toISOString() : undefined,
          registration_deadline: formData.registration_deadline ? new Date(formData.registration_deadline).toISOString() : undefined,
        });
        setSuccessMessage(`Created new competition "${formData.title}" successfully.`);
      }

      setIsModalOpen(false);
      await loadData();
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to save competition.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (comp: Competition) => {
    if (!window.confirm(`Are you sure you want to delete "${comp.title}"? This cannot be undone.`)) {
      return;
    }

    try {
      await deleteCompetition(comp.id);
      setSuccessMessage(`Competition "${comp.title}" removed.`);
      await loadData();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to delete competition.');
    }
  };

  const toggleFeatured = async (comp: Competition) => {
    try {
      await updateCompetition(comp.id, { is_featured: !comp.is_featured });
      await loadData();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to toggle featured state.');
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags?.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...(formData.tags || []), tagInput.trim()]
      });
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags?.filter(t => t !== tagToRemove) || []
    });
  };

  return (
    <div className="space-y-8">
      {/* Top Header & Sub-Navigation */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 shadow-sm">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Competitions Management Center</h2>
              <p className="text-xs text-slate-500 font-medium">
                Add, edit, remove, and manage all national robotics tournaments, hackathons, and the Flagship YARA 2026 Hub.
              </p>
            </div>
          </div>
        </div>

        {/* Section Switcher & Action Button */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setActiveSection('all_competitions')}
              className={cn(
                "px-4 py-2 rounded-lg text-xs font-bold transition-all",
                activeSection === 'all_competitions'
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              )}
            >
              <div className="flex items-center space-x-2">
                <Layers className="w-4 h-4 text-indigo-600" />
                <span>All Competitions Directory ({competitions.length})</span>
              </div>
            </button>
            <button
              onClick={() => setActiveSection('yara_2026_hub')}
              className={cn(
                "px-4 py-2 rounded-lg text-xs font-bold transition-all",
                activeSection === 'yara_2026_hub'
                  ? "bg-white text-amber-700 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              )}
            >
              <div className="flex items-center space-x-2">
                <Trophy className="w-4 h-4 text-amber-500" />
                <span>YARA 2026 Flagship Command Center</span>
              </div>
            </button>
          </div>

          {activeSection === 'all_competitions' && (
            <button
              onClick={openAddModal}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-200 transition-all flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Competition</span>
            </button>
          )}
        </div>
      </div>

      {/* Notifications */}
      <AnimatePresence>
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-emerald-800 text-sm font-semibold"
          >
            <div className="flex items-center space-x-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
            <button onClick={() => setSuccessMessage(null)} className="p-1 hover:bg-emerald-100 rounded-lg">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}

        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-between text-rose-800 text-sm font-semibold"
          >
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button onClick={() => setErrorMessage(null)} className="p-1 hover:bg-rose-100 rounded-lg">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* RENDER VIEW ACCORDING TO ACTIVE SUB-SECTION */}
      {activeSection === 'yara_2026_hub' ? (
        <YaraCompetitionAdminTab />
      ) : (
        <div className="space-y-6">
          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Competitions</p>
              <p className="text-2xl font-black text-slate-900 mt-1">{stats.total}</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active / In Progress</p>
              <p className="text-2xl font-black text-emerald-600 mt-1">{stats.active}</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Upcoming Tournaments</p>
              <p className="text-2xl font-black text-indigo-600 mt-1">{stats.upcoming}</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Featured Flagships</p>
              <p className="text-2xl font-black text-amber-500 mt-1">{stats.featured}</p>
            </div>
          </div>

          {/* Search & Filters */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by title, location, category, or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-indigo-500"
              >
                <option value="ALL">All Categories</option>
                {CATEGORY_OPTIONS.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-indigo-500"
              >
                <option value="ALL">All Statuses</option>
                <option value="upcoming">Upcoming</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="archived">Archived</option>
              </select>

              <button
                onClick={loadData}
                className="p-2.5 text-slate-500 hover:text-slate-800 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors"
                title="Refresh"
              >
                <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
              </button>
            </div>
          </div>

          {/* Competitions Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-black uppercase tracking-wider">
                    <th className="py-3.5 px-4">Competition</th>
                    <th className="py-3.5 px-4">Category & Format</th>
                    <th className="py-3.5 px-4">Dates & Location</th>
                    <th className="py-3.5 px-4">Prize Pool & Teams</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-center">Featured</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-500" />
                        <p className="font-semibold text-xs">Loading competitions database...</p>
                      </td>
                    </tr>
                  ) : filteredCompetitions.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        <Trophy className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                        <p className="font-bold text-slate-700 text-sm">No competitions found</p>
                        <p className="text-xs text-slate-400 mt-1">Try adjusting your search criteria or click "Add New Competition".</p>
                      </td>
                    </tr>
                  ) : (
                    filteredCompetitions.map((comp) => {
                      const catInfo = CATEGORY_OPTIONS.find(c => c.value === comp.category);
                      return (
                        <tr key={comp.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-4 px-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200 relative group">
                                <img
                                  src={comp.image_url || 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=300&q=80'}
                                  alt={comp.title}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="min-w-0 max-w-xs">
                                <div className="flex items-center space-x-2">
                                  <p className="font-bold text-slate-900 truncate">{comp.title}</p>
                                </div>
                                {comp.subtitle && (
                                  <p className="text-[11px] text-slate-500 truncate">{comp.subtitle}</p>
                                )}
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {comp.tags?.slice(0, 3).map((tag, idx) => (
                                    <span key={idx} className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-[9px] font-semibold">
                                      #{tag}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="py-4 px-4">
                            <div className="space-y-1">
                              <span className={cn(
                                "inline-block px-2.5 py-1 rounded-full text-[10px] font-bold border",
                                catInfo?.color || "bg-slate-100 text-slate-700 border-slate-200"
                              )}>
                                {catInfo?.label || comp.category}
                              </span>
                              <p className="text-[11px] text-slate-500 font-medium capitalize">
                                Format: <span className="font-bold text-slate-700">{comp.format}</span>
                              </p>
                            </div>
                          </td>

                          <td className="py-4 px-4">
                            <div className="space-y-1 text-[11px]">
                              <div className="flex items-center space-x-1.5 text-slate-700 font-semibold">
                                <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                                <span>{new Date(comp.start_date).toLocaleDateString()}</span>
                              </div>
                              <div className="flex items-center space-x-1.5 text-slate-500">
                                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                <span className="truncate max-w-[150px]">{comp.location}</span>
                              </div>
                            </div>
                          </td>

                          <td className="py-4 px-4">
                            <div className="space-y-1">
                              <p className="font-black text-amber-600 text-xs">{comp.prize_pool || '$5,000'}</p>
                              <div className="flex items-center space-x-1 text-[11px] text-slate-500">
                                <Users className="w-3.5 h-3.5 text-slate-400" />
                                <span>{comp.registered_teams_count || 0} / {comp.max_teams || 50} Teams</span>
                              </div>
                            </div>
                          </td>

                          <td className="py-4 px-4">
                            <span className={cn(
                              "px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider",
                              comp.status === 'active' ? "bg-emerald-100 text-emerald-800" :
                              comp.status === 'upcoming' ? "bg-indigo-100 text-indigo-800" :
                              "bg-slate-100 text-slate-600"
                            )}>
                              {comp.status}
                            </span>
                          </td>

                          <td className="py-4 px-4 text-center">
                            <button
                              onClick={() => toggleFeatured(comp)}
                              className={cn(
                                "p-1.5 rounded-lg transition-colors",
                                comp.is_featured ? "text-amber-500 hover:bg-amber-50" : "text-slate-300 hover:text-slate-500 hover:bg-slate-100"
                              )}
                              title={comp.is_featured ? "Featured on Home & Hub" : "Not featured"}
                            >
                              <Star className={cn("w-4 h-4", comp.is_featured && "fill-amber-500")} />
                            </button>
                          </td>

                          <td className="py-4 px-4 text-right">
                            <div className="flex items-center justify-end space-x-1">
                              {comp.internal_route ? (
                                <a
                                  href={comp.internal_route}
                                  className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                  title="View Public Arena"
                                >
                                  <Eye className="w-4 h-4" />
                                </a>
                              ) : comp.registration_link ? (
                                <a
                                  href={comp.registration_link}
                                  className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                  title="View Link"
                                >
                                  <ExternalLink className="w-4 h-4" />
                                </a>
                              ) : null}

                              <button
                                onClick={() => openEditModal(comp)}
                                className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                title="Edit Competition"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>

                              <button
                                onClick={() => handleDelete(comp)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                title="Delete Competition"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ADD / EDIT COMPETITION MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-2xl w-full p-6 md:p-8 shadow-2xl border border-slate-200 my-8 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <Trophy className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900">
                      {editingComp ? 'Edit Competition Details' : 'Add New Competition'}
                    </h3>
                    <p className="text-xs text-slate-500">Configure tournament details, rules, registration links, and prize pool.</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 text-slate-400 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-5 mt-6 text-xs">
                {/* Title & Subtitle */}
                <div className="space-y-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Competition Title *</label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g. YARA 2026 National Robotics Championship"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Subtitle / Tagline</label>
                    <input
                      type="text"
                      value={formData.subtitle || ''}
                      onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                      placeholder="e.g. Engineering Opportunity: Robotics and Innovation for Underserved Youth"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600 font-medium"
                    />
                  </div>
                </div>

                {/* Category, Format & Status */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:border-indigo-600"
                    >
                      {CATEGORY_OPTIONS.map(c => (
                        <option key={c.value} value={c.value}>{c.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Format</label>
                    <select
                      value={formData.format}
                      onChange={(e) => setFormData({ ...formData, format: e.target.value as any })}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:border-indigo-600"
                    >
                      <option value="hybrid">Hybrid (Physical + Virtual)</option>
                      <option value="in_person">In-Person Arena</option>
                      <option value="virtual">Virtual Simulation</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:border-indigo-600"
                    >
                      <option value="upcoming">Upcoming</option>
                      <option value="active">Active / In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Full Description *</label>
                  <textarea
                    required
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Provide full background, mission goals, challenges, and scoring breakdown..."
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600 font-medium resize-none"
                  />
                </div>

                {/* Dates & Location */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Start Date & Time</label>
                    <input
                      type="datetime-local"
                      value={formData.start_date || ''}
                      onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:border-indigo-600"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">End Date & Time</label>
                    <input
                      type="datetime-local"
                      value={formData.end_date || ''}
                      onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:border-indigo-600"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Registration Deadline</label>
                    <input
                      type="datetime-local"
                      value={formData.registration_deadline || ''}
                      onChange={(e) => setFormData({ ...formData, registration_deadline: e.target.value })}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:border-indigo-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Venue / Physical Location</label>
                    <input
                      type="text"
                      value={formData.location || ''}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="e.g. Harare Science Arena & Innovation Hub"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Prize Pool / Awards</label>
                    <input
                      type="text"
                      value={formData.prize_pool || ''}
                      onChange={(e) => setFormData({ ...formData, prize_pool: e.target.value })}
                      placeholder="e.g. $15,000 + STEM Grants"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600 font-medium"
                    />
                  </div>
                </div>

                {/* Media & Routes */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Banner Image URL</label>
                    <input
                      type="url"
                      value={formData.image_url || ''}
                      onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Internal Route / Public Arena URL</label>
                    <input
                      type="text"
                      value={formData.internal_route || ''}
                      onChange={(e) => setFormData({ ...formData, internal_route: e.target.value })}
                      placeholder="e.g. /competitions/yara-2026"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600 font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Max Teams Capacity</label>
                    <input
                      type="number"
                      value={formData.max_teams || 50}
                      onChange={(e) => setFormData({ ...formData, max_teams: Number(e.target.value) })}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Registration Link (if external)</label>
                    <input
                      type="text"
                      value={formData.registration_link || ''}
                      onChange={(e) => setFormData({ ...formData, registration_link: e.target.value })}
                      placeholder="e.g. /competition/participant"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600 font-medium"
                    />
                  </div>
                </div>

                {/* Eligibility & Rules */}
                <div className="space-y-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Eligibility Criteria</label>
                    <input
                      type="text"
                      value={formData.eligibility || ''}
                      onChange={(e) => setFormData({ ...formData, eligibility: e.target.value })}
                      placeholder="e.g. Open to High Schools, Universities & Youth Clubs (2B+2G mandatory)"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Rules & Scoring Summary</label>
                    <textarea
                      rows={2}
                      value={formData.rules_summary || ''}
                      onChange={(e) => setFormData({ ...formData, rules_summary: e.target.value })}
                      placeholder="e.g. 35% Underwater ROV, 35% Autonomous Maze, 30% Innovation Pitch"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600 font-medium resize-none"
                    />
                  </div>
                </div>

                {/* Tags & Featured */}
                <div className="space-y-3 pt-2">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Tags (Press Add)</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddTag(); } }}
                        placeholder="e.g. Micromouse, Underwater, ESP32"
                        className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600 font-medium"
                      />
                      <button
                        type="button"
                        onClick={handleAddTag}
                        className="px-4 py-2 bg-slate-200 hover:bg-slate-300 font-bold rounded-xl text-slate-700 transition-colors"
                      >
                        Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {formData.tags?.map((tag, idx) => (
                        <span key={idx} className="inline-flex items-center space-x-1 px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-[10px] font-bold">
                          <span>#{tag}</span>
                          <button type="button" onClick={() => handleRemoveTag(tag)} className="hover:text-indigo-900">
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <input
                      type="checkbox"
                      id="is_featured_check"
                      checked={formData.is_featured}
                      onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                      className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                    />
                    <label htmlFor="is_featured_check" className="font-bold text-slate-800 cursor-pointer">
                      Feature on Homepage & Pinnacle Hub Banner (Flagship Spotlight)
                    </label>
                  </div>
                </div>

                {/* Modal Actions */}
                <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl font-bold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all flex items-center space-x-2 disabled:opacity-50"
                  >
                    {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                    <span>{editingComp ? 'Update Competition' : 'Create Competition'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
