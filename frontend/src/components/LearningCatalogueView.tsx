import React, { useState, useMemo } from 'react';
import { 
  BookOpen, 
  Search, 
  Filter, 
  Clock, 
  ExternalLink, 
  Award, 
  ArrowRight, 
  Sparkles,
  Building2,
  GraduationCap,
  Layers,
  CheckCircle2,
  ShieldCheck
} from 'lucide-react';
import { LearningResource } from '../types';
import { StatusBadge, getProviderBadgeVariant } from './ui/StatusBadge';
import { StatCard } from './ui/StatCard';
import { PageHeader } from './ui/PageHeader';

interface LearningCatalogueViewProps {
  resources: LearningResource[];
  onStartQuiz: (topic: string) => void;
}

export function LearningCatalogueView({
  resources,
  onStartQuiz
}: LearningCatalogueViewProps) {
  const [selectedProvider, setSelectedProvider] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const providers = [
    { id: 'all', label: 'All Learning Portals' },
    { id: 'iGOT', label: 'iGOT Karmayogi' },
    { id: 'NSSTA', label: 'NSSTA Greater Noida' },
    { id: 'TPAC', label: 'TPAC Training' },
    { id: 'MoSPI', label: 'MoSPI Reference Handbooks' }
  ];

  const filteredResources = useMemo(() => {
    return resources.filter(res => {
      const matchProvider = selectedProvider === 'all' || res.source === selectedProvider;
      const matchSearch = res.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          res.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (res.competencyName && res.competencyName.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchProvider && matchSearch;
    });
  }, [resources, selectedProvider, searchQuery]);

  const providerCounts = useMemo(() => {
    const counts: Record<string, number> = { iGOT: 0, NSSTA: 0, TPAC: 0, MoSPI: 0 };
    resources.forEach(r => {
      if (counts[r.source] !== undefined) counts[r.source] += 1;
    });
    return counts;
  }, [resources]);

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Page Header */}
      <PageHeader
        title="Personalized Learning Discovery Catalogue"
        subtitle="Multi-portal curriculum aggregation mapping official iGOT Karmayogi, NSSTA, TPAC, and MoSPI reference manuals."
        icon={<BookOpen className="w-5 h-5 text-emerald-500" />}
        badge={<StatusBadge variant="igot" size="sm">{resources.length} Modules Indexed</StatusBadge>}
      />

      {/* Provider Overview KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="iGOT Karmayogi"
          value={providerCounts['iGOT'] || 10}
          subValue="Courses"
          trend="Mission Karmayogi"
          icon={<Building2 className="w-4 h-4 text-blue-500" />}
          variant="blue"
        />
        <StatCard
          label="NSSTA Greater Noida"
          value={providerCounts['NSSTA'] || 3}
          subValue="Workshops"
          trend="Official In-Person & Blended"
          icon={<GraduationCap className="w-4 h-4 text-purple-500" />}
          variant="indigo"
        />
        <StatCard
          label="TPAC Training"
          value={providerCounts['TPAC'] || 5}
          subValue="Programs"
          trend="Advanced Statistical Methods"
          icon={<Award className="w-4 h-4 text-amber-500" />}
          variant="amber"
        />
        <StatCard
          label="MoSPI Handbooks"
          value={providerCounts['MoSPI'] || 3}
          subValue="Handbooks"
          trend="FAISS Indexed Grounding"
          icon={<Layers className="w-4 h-4 text-emerald-500" />}
          variant="emerald"
        />
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel rounded-2xl p-4 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
        {/* Provider Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {providers.map((p) => {
            const isSelected = selectedProvider === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setSelectedProvider(p.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-sm ring-1 ring-blue-500'
                    : 'bg-slate-100 dark:bg-midnight-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-midnight-750'
                }`}
              >
                {p.label}
              </button>
            );
          })}
        </div>

        {/* Live Search Input */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search courses, handbooks or skills..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-midnight-850 border border-slate-200 dark:border-midnight-750 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
        </div>
      </div>

      {/* Learning Resource Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredResources.map((res) => (
          <div
            key={res.id}
            className="glass-panel-elevated p-5 rounded-2xl border border-slate-200/80 dark:border-midnight-750 flex flex-col justify-between space-y-4 hover:border-blue-400 dark:hover:border-blue-500/80 transition-all group"
          >
            <div className="space-y-3">
              <div className="flex justify-between items-start gap-2">
                <StatusBadge variant={getProviderBadgeVariant(res.source)} size="sm">
                  {res.source}
                </StatusBadge>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-midnight-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-midnight-700">
                  {res.targetLevel}
                </span>
              </div>

              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-snug">
                {res.title}
              </h3>

              <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed">
                {res.description}
              </p>

              <div className="space-y-1 pt-1 text-[11px] text-slate-500 dark:text-slate-400">
                <div className="flex items-center space-x-1.5">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Competency:</span>
                  <span className="text-blue-600 dark:text-blue-400 font-bold">{res.competencyName || 'Statistical Analysis'}</span>
                </div>
                <div className="flex items-center space-x-1.5 font-mono text-[10px] text-slate-400">
                  <span>Source: {res.sourceDocument}</span>
                  {res.sourcePage && <span>(Page {res.sourcePage})</span>}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-midnight-800/80 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" /> {res.durationHours} hrs • {res.deliveryMode}
              </span>

              <button
                onClick={() => onStartQuiz(res.competencyName || 'Sampling')}
                className="px-3.5 py-1.5 bg-gov-primary dark:bg-blue-600 hover:bg-gov-secondary text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center space-x-1"
              >
                <span>Assess Skill</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
