import React, { useState } from 'react';
import { Sidebar, NavTab } from './Sidebar';
import { Header } from './Header';
import { UserProfile } from '../../types';
import { BackendHealthResponse } from '../../services/api';

interface AppShellProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  profile: UserProfile | null;
  backendHealth: BackendHealthResponse | null;
  aiStatus: 'checking' | 'online' | 'offline';
  criticalGapsCount?: number;
  learningCount?: number;
  loading: boolean;
  onRefresh: () => void;
  isDarkMode?: boolean;
  onToggleTheme?: () => void;
  children: React.ReactNode;
}

export function AppShell({
  activeTab,
  setActiveTab,
  profile,
  backendHealth,
  aiStatus,
  criticalGapsCount,
  learningCount,
  loading,
  onRefresh,
  isDarkMode,
  onToggleTheme,
  children
}: AppShellProps) {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-midnight-950 text-slate-800 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* Background subtle technical grid */}
      <div className="fixed inset-0 bg-tech-grid opacity-60 pointer-events-none z-0" />

      {/* Left Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        profile={profile}
        backendHealth={backendHealth}
        aiStatus={aiStatus}
        criticalGapsCount={criticalGapsCount}
        learningCount={learningCount}
        isDarkMode={isDarkMode}
        onToggleTheme={onToggleTheme}
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(prev => !prev)}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col transition-all duration-300 relative z-10 ${
        isCollapsed ? 'lg:pl-20' : 'lg:pl-72'
      }`}>
        {/* Top Header */}
        <Header
          activeTab={activeTab}
          profile={profile}
          loading={loading}
          onRefresh={onRefresh}
          isDarkMode={isDarkMode}
          onToggleTheme={onToggleTheme}
          onOpenMobile={() => setMobileOpen(true)}
        />

        {/* Dynamic Page Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {children}
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-200/80 dark:border-midnight-800/80 py-4 px-6 text-xs text-slate-500 dark:text-slate-400 bg-white/40 dark:bg-midnight-950/40 backdrop-blur-md transition-colors mt-auto">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
            <div className="flex items-center space-x-2">
              <span className="font-bold text-slate-700 dark:text-slate-300">StatIntel</span>
              <span>• Official Statistical Cadre Intelligence & Personalized Learning Platform</span>
            </div>
            <span className="text-slate-400 dark:text-slate-500 text-[11px]">
              Ministry of Statistics & Programme Implementation (MoSPI) • SIH26101
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
}
