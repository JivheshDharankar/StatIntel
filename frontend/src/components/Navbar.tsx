import React from 'react';
import { RefreshCw, LayoutDashboard, Target, BookOpen, Sparkles, Award } from 'lucide-react';
import { UserProfile } from '../types';
import { BackendHealthResponse } from '../services/api';

export type NavTab = 'dashboard' | 'competencies' | 'learning' | 'assessment' | 'evidence';

interface NavbarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  profile: UserProfile | null;
  backendHealth: BackendHealthResponse | null;
  aiStatus: 'checking' | 'online' | 'offline';
  loading: boolean;
  onRefresh: () => void;
}

export function Navbar({
  activeTab,
  setActiveTab,
  profile,
  backendHealth,
  aiStatus,
  loading,
  onRefresh
}: NavbarProps) {
  const backendOnline = backendHealth?.status === 'ok';

  return (
    <div className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
      {/* Top Tricolor Band */}
      <div className="gov-top-band w-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-gov-primary flex items-center justify-center text-white font-bold shadow-gov-sm">
              <span className="text-xl tracking-wider">SI</span>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg text-slate-900 tracking-tight">StatIntel</span>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 rounded-full">
                  SIH26101 Functional Prototype
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
                Ministry of Statistics & Programme Implementation • Official Statistical Cadre Intelligence
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors ${
                activeTab === 'dashboard'
                  ? 'bg-slate-100 text-gov-primary border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => setActiveTab('competencies')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors ${
                activeTab === 'competencies'
                  ? 'bg-slate-100 text-gov-primary border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Target className="w-3.5 h-3.5" />
              <span>Competencies</span>
            </button>

            <button
              onClick={() => setActiveTab('learning')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors ${
                activeTab === 'learning'
                  ? 'bg-slate-100 text-gov-primary border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Learning Catalogue</span>
            </button>

            <button
              onClick={() => setActiveTab('assessment')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors ${
                activeTab === 'assessment'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>AI Assessment</span>
            </button>

            <button
              onClick={() => setActiveTab('evidence')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors ${
                activeTab === 'evidence'
                  ? 'bg-slate-100 text-gov-primary border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>Evidence & Gaps</span>
            </button>
          </nav>

          {/* Right Header Status & Profile */}
          <div className="flex items-center space-x-3">
            {/* Service Health Indicators */}
            <div className="hidden lg:flex items-center space-x-2 text-[11px] font-medium bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
              <div className="flex items-center space-x-1.5">
                <span className={`w-2 h-2 rounded-full ${backendOnline ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                <span className="text-slate-700">API</span>
              </div>
              <span className="text-slate-300">|</span>
              <div className="flex items-center space-x-1.5">
                <span className={`w-2 h-2 rounded-full ${aiStatus === 'online' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                <span className="text-slate-700">Gemini RAG</span>
              </div>
            </div>

            {/* Refresh */}
            <button 
              onClick={onRefresh}
              disabled={loading}
              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
              title="Refresh Live Data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            {/* Demo Profile Pill */}
            {profile && (
              <div className="flex items-center space-x-2 text-xs text-slate-700 bg-blue-50/50 border border-blue-200/60 rounded-lg px-2.5 py-1">
                <div className="w-6 h-6 rounded-full bg-gov-primary text-white flex items-center justify-center text-[10px] font-bold">
                  SO
                </div>
                <div className="text-left hidden sm:block">
                  <div className="text-xs font-bold text-slate-800 leading-tight">{profile.fullName}</div>
                  <div className="text-[10px] text-slate-500 flex items-center space-x-1">
                    <span>{profile.designation}</span>
                    <span className="text-[9px] bg-amber-100 text-amber-800 px-1 rounded font-semibold">Demo Profile</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
