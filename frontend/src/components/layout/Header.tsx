import React from 'react';
import { 
  Menu, 
  RefreshCw, 
  Sparkles, 
  Search, 
  Sun, 
  Moon, 
  ShieldCheck,
  Building2,
  Bell
} from 'lucide-react';
import { NavTab } from './Sidebar';
import { UserProfile } from '../../types';

interface HeaderProps {
  activeTab: NavTab;
  profile: UserProfile | null;
  loading: boolean;
  onRefresh: () => void;
  isDarkMode?: boolean;
  onToggleTheme?: () => void;
  onOpenMobile?: () => void;
}

export function Header({
  activeTab,
  profile,
  loading,
  onRefresh,
  isDarkMode = false,
  onToggleTheme,
  onOpenMobile
}: HeaderProps) {
  const getTabBreadcrumb = () => {
    switch (activeTab) {
      case 'dashboard': return 'Executive Intelligence';
      case 'competencies': return 'Competency Framework (33)';
      case 'learning': return 'Personalized Learning Discovery';
      case 'assessment': return 'AI Competency Assessment Engine';
      case 'evidence': return 'Bayesian Evidence Ledger & Gaps';
      default: return 'Intelligence';
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-midnight-950/80 backdrop-blur-xl border-b border-slate-200/80 dark:border-midnight-800 transition-colors duration-200">
      {/* Top Tricolor Band */}
      <div className="gov-top-band w-full" />

      <div className="px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
        {/* Left: Mobile Toggle & Breadcrumb */}
        <div className="flex items-center space-x-3">
          {onOpenMobile && (
            <button
              onClick={onOpenMobile}
              className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-midnight-800 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <div className="space-y-0.5">
            <div className="flex items-center space-x-2 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              <span>StatIntel Platform</span>
              <span>/</span>
              <span className="text-blue-600 dark:text-blue-400">{getTabBreadcrumb()}</span>
            </div>
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white capitalize font-display hidden sm:block">
              {activeTab === 'assessment' ? 'AI Grounded Competency Assessment' : activeTab}
            </h2>
          </div>
        </div>

        {/* Right: Quick Actions & Status */}
        <div className="flex items-center space-x-3">
          {/* Government Badge */}
          <div className="hidden md:flex items-center space-x-2 bg-slate-100/80 dark:bg-midnight-850 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-midnight-750 text-xs font-semibold text-slate-700 dark:text-slate-300">
            <Building2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span className="truncate max-w-[200px]">MoSPI • Official Statistical Cadre</span>
          </div>

          {/* Theme Switcher */}
          {onToggleTheme && (
            <button
              onClick={onToggleTheme}
              className="p-2 rounded-xl border border-slate-200 dark:border-midnight-750 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-midnight-800 transition-colors"
              title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>
          )}

          {/* Live Data Refresh */}
          <button
            onClick={onRefresh}
            disabled={loading}
            className="p-2 rounded-xl border border-slate-200 dark:border-midnight-750 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-midnight-800 transition-colors flex items-center gap-1.5 text-xs font-bold"
            title="Refresh Live Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-500' : ''}`} />
            <span className="hidden sm:inline">Sync</span>
          </button>
        </div>
      </div>
    </header>
  );
}
