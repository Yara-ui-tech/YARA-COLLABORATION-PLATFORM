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
    <div className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Clean, Simple Primary Tabs */}
        <div className="flex items-center space-x-1.5 overflow-x-auto py-2.5 scrollbar-none">
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
                      : "bg-slate-900 text-white shadow-xs"
                    : tab.highlight
                      ? "text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                )}
              >
                <Icon className={cn("w-4 h-4 shrink-0 transition-transform group-hover:scale-105 pointer-events-none", 
                  isActive ? "text-emerald-400" : tab.highlight ? "text-indigo-500" : "text-slate-400"
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
