import React from 'react';
import { 
  BookOpen, 
  TrendingUp, 
  Package, 
  Award, 
  ShieldCheck,
  Zap
} from 'lucide-react';
import { cn } from '../../lib/utils';

export type LearningTabId = 
  | 'courses' 
  | 'progress' 
  | 'resources' 
  | 'certificates' 
  | 'admin-center'
  // Backward compatibility aliases
  | 'dashboard'
  | 'my-courses'
  | 'assessments'
  | 'projects'
  | 'subscription'
  | 'programming';

interface TabItem {
  id: LearningTabId;
  label: string;
  icon: any;
  badge?: string;
  highlight?: boolean;
}

export const LEARNING_NAV_TABS: TabItem[] = [
  { id: 'courses', label: 'Robotics Courses', icon: BookOpen },
  { id: 'progress', label: 'Curriculum Roadmap', icon: TrendingUp },
  { id: 'resources', label: 'Study Materials', icon: Package },
  { id: 'certificates', label: 'Certificates', icon: Award },
  { id: 'admin-center', label: 'Admin LMS Studio', icon: ShieldCheck, badge: 'Admin', highlight: true }
];

interface Props {
  activeTab: LearningTabId;
  onSelectTab: (tab: LearningTabId) => void;
  progressPercent?: number;
  isAdmin?: boolean;
}

export const YaraLearningNavigation: React.FC<Props> = ({
  activeTab,
  onSelectTab,
  progressPercent = 0,
  isAdmin = false
}) => {
  // Admin center visible to admins only
  const visibleTabs = LEARNING_NAV_TABS.filter(tab => tab.id !== 'admin-center' || isAdmin);

  const handleTabClick = (tabId: LearningTabId) => {
    React.startTransition(() => {
      onSelectTab(tabId);
    });
  };

  // Normalize legacy tab selection to the 4 core tabs
  const normalizedActiveTab = 
    activeTab === 'dashboard' || activeTab === 'my-courses' || activeTab === 'assessments' || activeTab === 'projects' || activeTab === 'programming'
      ? 'courses'
      : activeTab;

  return (
    <div className="bg-white border-b border-slate-200 sticky top-0 z-30" style={{ boxShadow: '0 1px 12px rgba(15,23,42,0.06)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Upper branding bar */}
        <div className="py-3 flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-md bg-gradient-to-tr from-emerald-600 to-indigo-600">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-sm sm:text-base font-black text-slate-900 tracking-tight leading-none">
                  YARA ROBOTICS ACADEMY
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Curriculum
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium mt-0.5 hidden sm:block">
                Level 0 Foundations · Electronics · MicroPython · C++ Embedded · Robotics Engineering
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <div className="text-[10px] uppercase font-bold text-slate-400">Mastery Progress</div>
              <div className="text-xs font-black text-emerald-600">{progressPercent}% Complete</div>
            </div>
            <div className="relative w-28 sm:w-36 h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
              <div 
                className="h-full rounded-full transition-all duration-700 ease-out bg-gradient-to-r from-emerald-500 to-teal-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Clean, Simple Primary Tabs */}
        <div className="flex items-center space-x-1 overflow-x-auto py-2 scrollbar-none">
          {visibleTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = normalizedActiveTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabClick(tab.id)}
                className={cn(
                  "flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-150 shrink-0 group relative cursor-pointer",
                  isActive
                    ? tab.highlight
                      ? "text-white shadow-md bg-gradient-to-r from-purple-600 to-indigo-600"
                      : "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                    : tab.highlight
                      ? "text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                )}
              >
                <Icon className={cn("w-4 h-4 shrink-0 transition-transform group-hover:scale-105 pointer-events-none", 
                  isActive ? "text-white" : tab.highlight ? "text-indigo-500" : "text-slate-400"
                )} />
                <span className="pointer-events-none">{tab.label}</span>
                {tab.badge && (
                  <span className={cn(
                    "px-1.5 py-0.5 rounded text-[8px] font-black uppercase pointer-events-none",
                    isActive 
                      ? "bg-white/20 text-white" 
                      : "bg-purple-100 text-purple-700"
                  )}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
