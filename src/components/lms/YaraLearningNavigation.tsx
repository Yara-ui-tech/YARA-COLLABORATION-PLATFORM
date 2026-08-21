import React from 'react';
import { 
  LayoutDashboard, 
  BookOpen, 
  GraduationCap, 
  TrendingUp, 
  CheckSquare, 
  FolderGit2, 
  Award, 
  CreditCard, 
  Sparkles,
  Package
} from 'lucide-react';
import { cn } from '../../lib/utils';

export type LearningTabId = 
  | 'dashboard' 
  | 'courses' 
  | 'my-courses' 
  | 'progress' 
  | 'assessments' 
  | 'projects' 
  | 'certificates' 
  | 'subscription' 
  | 'resources';

interface TabItem {
  id: LearningTabId;
  label: string;
  icon: any;
  badge?: string;
}

export const LEARNING_NAV_TABS: TabItem[] = [
  { id: 'dashboard', label: 'Learning Dashboard', icon: LayoutDashboard },
  { id: 'courses', label: 'Courses', icon: BookOpen, badge: 'Foundations' },
  { id: 'my-courses', label: 'My Courses', icon: GraduationCap },
  { id: 'progress', label: 'Progress', icon: TrendingUp },
  { id: 'assessments', label: 'Assessments', icon: CheckSquare },
  { id: 'projects', label: 'Projects', icon: FolderGit2, badge: 'Portfolio' },
  { id: 'certificates', label: 'Certificates', icon: Award },
  { id: 'subscription', label: 'Subscription', icon: CreditCard },
  { id: 'resources', label: 'Learning Resources', icon: Package }
];

interface Props {
  activeTab: LearningTabId;
  onSelectTab: (tab: LearningTabId) => void;
  progressPercent?: number;
}

export const YaraLearningNavigation: React.FC<Props> = ({
  activeTab,
  onSelectTab,
  progressPercent = 0
}) => {
  return (
    <div className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Upper branding bar */}
        <div className="py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-base sm:text-lg font-black text-slate-900 tracking-tight leading-none">
                  YARA LEARNING ACADEMY
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Level 0 → Level 8
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                Learn → Simulate → Build → Test → Debug → Research → Innovate → Demonstrate
              </p>
            </div>
          </div>

          {/* Quick Progress Bar */}
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <div className="text-[10px] uppercase font-bold text-slate-400">Foundation Mastery</div>
              <div className="text-xs font-black text-emerald-600">{progressPercent}% Completed</div>
            </div>
            <div className="w-28 sm:w-36 h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
              <div 
                className="h-full bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-600 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Horizontal Navigation Tabs */}
        <div className="flex items-center space-x-1 overflow-x-auto py-2 scrollbar-none">
          {LEARNING_NAV_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className={cn(
                  "flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-150 shrink-0",
                  isActive
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
                )}
              >
                <Icon className={cn("w-3.5 h-3.5 shrink-0", isActive ? "text-white" : "text-slate-400")} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className={cn(
                    "px-1.5 py-0.2 rounded-md text-[9px] font-black uppercase",
                    isActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
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
