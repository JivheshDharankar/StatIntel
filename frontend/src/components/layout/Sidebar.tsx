import React from 'react';
import { 
  LayoutDashboard, 
  Target, 
  BookOpen, 
  Sparkles, 
  Award, 
  Activity, 
  ShieldCheck, 
  Sun, 
  Moon,
  ChevronLeft,
  ChevronRight,
  User,
  Server,
  BrainCircuit,
  ExternalLink
} from 'lucide-react';
import { UserProfile } from '../../types';
import { BackendHealthResponse } from '../../services/api';

export type NavTab = 'dashboard' | 'competencies' | 'learning' | 'assessment' | 'evidence';

interface SidebarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  profile: UserProfile | null;
  backendHealth: BackendHealthResponse | null;
  aiStatus: 'checking' | 'online' | 'offline';
  criticalGapsCount?: number;
  learningCount?: number;
  isDarkMode?: boolean;
  onToggleTheme?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export function Sidebar({
  activeTab,
  setActiveTab,
  profile,
  backendHealth,
  aiStatus,
  criticalGapsCount = 4,
  learningCount = 13,
  isDarkMode = false,
  onToggleTheme,
  isCollapsed = false,
  onToggleCollapse,
  mobileOpen = false,
  onCloseMobile
}: SidebarProps) {
  const backendOnline = backendHealth?.status === 'ok';

  const navItems = [
    {
      id: 'dashboard' as NavTab,
      label: 'Dashboard',
      subtitle: 'Executive Cadre Intelligence',
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      id: 'competencies' as NavTab,
      label: 'Competencies',
      subtitle: '33 Framework Matrix',
      icon: <Target className="w-4 h-4" />,
    },
    {
      id: 'learning' as NavTab,
      label: 'Learning Catalogue',
      subtitle: 'iGOT / NSSTA / TPAC',
      icon: <BookOpen className="w-4 h-4" />,
      badge: learningCount > 0 ? `${learningCount}` : undefined,
      badgeVariant: 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300'
    },
    {
      id: 'assessment' as NavTab,
      label: 'AI Assessments',
      subtitle: 'RAG Grounded Evaluation',
      icon: <Sparkles className="w-4 h-4 text-amber-500" />,
      highlight: true
    },
    {
      id: 'evidence' as NavTab,
      label: 'Evidence & Gaps',
      subtitle: 'Bayesian Update Ledger',
      icon: <Award className="w-4 h-4" />,
      badge: criticalGapsCount > 0 ? `${criticalGapsCount} Gaps` : undefined,
      badgeVariant: 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300'
    }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div 
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-40 lg:hidden animate-fade-in"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 bg-white/95 dark:bg-midnight-950/95 backdrop-blur-xl border-r border-slate-200 dark:border-midnight-800 flex flex-col justify-between transition-all duration-300 ${
          isCollapsed ? 'w-20' : 'w-72'
        } ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Top Branding */}
        <div className="p-4 border-b border-slate-100 dark:border-midnight-850">
          <div className="flex items-center justify-between">
            <div 
              onClick={() => setActiveTab('dashboard')}
              className="flex items-center space-x-3 cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gov-primary via-slate-900 to-blue-700 dark:from-blue-700 dark:to-gov-primary flex items-center justify-center text-white font-extrabold shadow-glow-blue flex-shrink-0 group-hover:scale-105 transition-transform">
                <span className="text-base tracking-wider font-display">SI</span>
              </div>

              {!isCollapsed && (
                <div className="overflow-hidden">
                  <div className="flex items-center space-x-1.5">
                    <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white font-display">
                      StatIntel
                    </span>
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                      SIH26101
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium truncate">
                    Official Statistical Cadre Intelligence
                  </p>
                </div>
              )}
            </div>

            {/* Collapse Toggle (Desktop) */}
            {onToggleCollapse && (
              <button
                onClick={onToggleCollapse}
                className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-midnight-800 transition-colors"
                title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
              >
                {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
              </button>
            )}
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            {!isCollapsed ? 'Platform Workspaces' : '•'}
          </div>

          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setActiveTab(item.id);
                  if (onCloseMobile) onCloseMobile();
                }}
                className={`w-full flex items-center justify-between p-3 rounded-xl text-left font-medium transition-all group relative overflow-hidden ${
                  isActive
                    ? 'bg-blue-50/80 dark:bg-midnight-800/90 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-700/60 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-midnight-850/60 border border-transparent'
                }`}
                title={isCollapsed ? item.label : undefined}
              >
                {isActive && (
                  <div className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-blue-600 dark:bg-blue-400" />
                )}

                <div className="flex items-center space-x-3 min-w-0">
                  <div className={`p-1 rounded-lg flex-shrink-0 transition-transform ${
                    isActive ? 'scale-110 text-blue-600 dark:text-blue-400' : 'group-hover:scale-110'
                  }`}>
                    {item.icon}
                  </div>

                  {!isCollapsed && (
                    <div className="truncate">
                      <div className={`text-xs font-bold ${isActive ? 'text-slate-900 dark:text-white' : ''}`}>
                        {item.label}
                      </div>
                      <div className="text-[10px] text-slate-400 dark:text-slate-500 font-normal">
                        {item.subtitle}
                      </div>
                    </div>
                  )}
                </div>

                {!isCollapsed && item.badge && (
                  <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full border border-current/20 flex-shrink-0 ${item.badgeVariant}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom Section: Service Status & Profile Dossier */}
        <div className="p-3 border-t border-slate-100 dark:border-midnight-850 space-y-3">
          {/* Real-time System Status */}
          {!isCollapsed ? (
            <div className="bg-slate-50 dark:bg-midnight-900/90 p-2.5 rounded-xl border border-slate-200 dark:border-midnight-800 space-y-2">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-medium">
                  <Server className="w-3 h-3 text-slate-400" />
                  API Gateway
                </span>
                <span className={`inline-flex items-center gap-1 font-bold text-[10px] ${
                  backendOnline ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${backendOnline ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                  {backendOnline ? '5000 Online' : 'Offline'}
                </span>
              </div>

              <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-slate-200/60 dark:border-midnight-800">
                <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-medium">
                  <BrainCircuit className="w-3 h-3 text-cyan-400" />
                  Gemini RAG
                </span>
                <span className={`inline-flex items-center gap-1 font-bold text-[10px] ${
                  aiStatus === 'online' ? 'text-cyan-600 dark:text-cyan-400' : 'text-amber-500'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${aiStatus === 'online' ? 'bg-cyan-400 animate-pulse' : 'bg-amber-400'}`} />
                  {aiStatus === 'online' ? '363 Chunks' : 'Checking'}
                </span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-2 py-1">
              <span className={`w-2 h-2 rounded-full ${backendOnline ? 'bg-emerald-500' : 'bg-rose-500'}`} title="Backend 5000" />
              <span className={`w-2 h-2 rounded-full ${aiStatus === 'online' ? 'bg-cyan-400' : 'bg-amber-400'}`} title="Gemini RAG 8000" />
            </div>
          )}

          {/* Officer Profile Dossier Card */}
          {profile && (
            <div className="flex items-center justify-between bg-white dark:bg-midnight-850 p-2.5 rounded-xl border border-slate-200 dark:border-midnight-750 shadow-sm">
              <div className="flex items-center space-x-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-gov-primary dark:bg-blue-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0 shadow-sm">
                  SO
                </div>
                {!isCollapsed && (
                  <div className="min-w-0">
                    <div className="text-xs font-extrabold text-slate-900 dark:text-white truncate">
                      {profile.fullName}
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                      {profile.designation}
                    </div>
                  </div>
                )}
              </div>

              {/* Theme toggle */}
              {onToggleTheme && !isCollapsed && (
                <button
                  onClick={onToggleTheme}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-midnight-800 transition-colors"
                  title={isDarkMode ? "Light Mode" : "Dark Mode"}
                >
                  {isDarkMode ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-slate-600" />}
                </button>
              )}
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
