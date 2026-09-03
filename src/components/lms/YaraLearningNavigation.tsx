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
  Package,
  Code2
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
  | 'resources'
  | 'programming';

interface TabItem {
  id: LearningTabId;
  label: string;
  icon: any;
  badge?: string;
  highlight?: boolean;
}

export const LEARNING_NAV_TABS: TabItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'courses', label: 'Robotics Courses', icon: BookOpen, badge: 'L0–L8' },
  { id: 'programming', label: 'Programming', icon: Code2, badge: 'Python · JS · Scratch', highlight: true },
  { id: 'my-courses', label: 'My Courses', icon: GraduationCap },
  { id: 'progress', label: 'Progress', icon: TrendingUp },
  { id: 'assessments', label: 'Assessments', icon: CheckSquare },
  { id: 'projects', label: 'Projects', icon: FolderGit2, badge: 'Portfolio' },
  { id: 'certificates', label: 'Certificates', icon: Award },
  { id: 'subscription', label: 'Subscription', icon: CreditCard },
  { id: 'resources', label: 'Resources', icon: Package }
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
    <div className="bg-white border-b border-slate-200 sticky top-0 z-30" style={{ boxShadow: '0 1px 12px rgba(15,23,42,0.06)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Upper branding bar */}
        <div className="py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-md" style={{ background: 'linear-gradient(135deg, #059669, #4f46e5)' }}>
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-base sm:text-lg font-black text-slate-900 tracking-tight leading-none">
                  YARA LEARNING ACADEMY
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
                  MVP 2026
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium mt-0.5 hidden sm:block">
                Robotics · Electronics · Python · JavaScript · Scratch · Certification
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <div className="text-[10px] uppercase font-bold text-slate-400">Foundation Progress</div>
              <div className="text-xs font-black text-emerald-600">{progressPercent}% Complete</div>
            </div>
            <div className="relative w-28 sm:w-40 h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
              <div 
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{ 
                  width: `${progressPercent}%`,
                  background: 'linear-gradient(90deg, #059669, #10b981, #4f46e5)'
                }}
              />
            </div>
          </div>
        </div>

        {/* Horizontal Navigation Tabs */}
        <div className="flex items-center space-x-0.5 overflow-x-auto py-2 scrollbar-none">
          {LEARNING_NAV_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className={cn(
                  "flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-150 shrink-0 group relative",
                  isActive
                    ? tab.highlight
                      ? "text-white shadow-md"
                      : "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                    : tab.highlight
                      ? "text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700"
                      : "text-slate-500 hover:text-slate-900 hover:bg-slate-100/80"
                )}
                style={isActive && tab.highlight ? { background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', boxShadow: '0 4px 12px rgba(79,70,229,0.3)' } : undefined}
              >
                <Icon className={cn("w-3.5 h-3.5 shrink-0 transition-transform group-hover:scale-110", 
                  isActive ? "text-white" : tab.highlight ? "text-indigo-500" : "text-slate-400"
                )} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className={cn(
                    "px-1.5 rounded-md text-[8px] font-black uppercase leading-4",
                    isActive 
                      ? "bg-white/20 text-white" 
                      : tab.highlight 
                        ? "bg-indigo-100 text-indigo-700"
                        : "bg-slate-100 text-slate-500"
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

