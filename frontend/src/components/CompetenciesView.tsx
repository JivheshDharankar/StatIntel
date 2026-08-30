import React, { useState, useMemo } from 'react';
import { 
  Target, 
  Search, 
  Filter, 
  Sparkles, 
  Award, 
  TrendingUp, 
  CheckCircle2, 
  AlertCircle,
  BarChart2,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { Competency, UserCompetency } from '../types';
import { StatusBadge, getCategoryBadgeVariant } from './ui/StatusBadge';
import { StatCard } from './ui/StatCard';
import { PageHeader } from './ui/PageHeader';

interface CompetenciesViewProps {
  competencies: Competency[];
  userCompetencies: UserCompetency[];
  onStartQuiz: (topic: string) => void;
}

export function CompetenciesView({
  competencies,
  userCompetencies,
  onStartQuiz
}: CompetenciesViewProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories = [
    { id: 'all', label: 'All Framework Domains' },
    { id: 'Statistical', label: 'Statistical' },
    { id: 'Technical', label: 'Technical' },
    { id: 'Digital Governance', label: 'Digital Governance' },
    { id: 'Behavioural/Managerial', label: 'Behavioural' }
  ];

  // Map user competency score dictionary
  const userCompMap = useMemo(() => {
    const map = new Map<string, UserCompetency>();
    userCompetencies.forEach(uc => {
      map.set(uc.competencyId, uc);
      if (uc.competency?.code) {
        map.set(uc.competency.code, uc);
      }
    });
    return map;
  }, [userCompetencies]);

  const filteredCompetencies = useMemo(() => {
    return competencies.filter(c => {
      const matchCat = selectedCategory === 'all' || c.category === selectedCategory;
      const matchSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [competencies, selectedCategory, searchQuery]);

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Page Header */}
      <PageHeader
        title="Official Statistical Competency Framework"
        subtitle="33 Official MoSPI competencies mapped across Statistical, Technical, Digital Governance, and Behavioural domains."
        icon={<Target className="w-5 h-5 text-indigo-500" />}
        badge={<StatusBadge variant="statistical" size="sm">33 Standard Matrix</StatusBadge>}
      />

      {/* KPI Overview Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Total Competencies"
          value={competencies.length}
          subValue="Framework"
          trend="MoSPI Cadre Standards"
          icon={<Target className="w-4 h-4" />}
          variant="indigo"
        />
        <StatCard
          label="Assessed Skills"
          value={userCompetencies.length}
          subValue={`/ ${competencies.length}`}
          trend="Verified in Dossier"
          trendType="positive"
          icon={<ShieldCheck className="w-4 h-4" />}
          variant="blue"
        />
        <StatCard
          label="High Priority Gaps"
          value={userCompetencies.filter(uc => (uc.benchmarkScore - uc.estimatedScore) >= 30).length}
          subValue="Action Items"
          trend="Immediate Assessment Focus"
          trendType="critical"
          icon={<AlertCircle className="w-4 h-4" />}
          variant="rose"
        />
        <StatCard
          label="Benchmark Target"
          value="80.0"
          subValue="Average"
          trend="Senior Officer Standard"
          trendType="neutral"
          icon={<Award className="w-4 h-4" />}
          variant="emerald"
        />
      </div>

      {/* Filter & Search Bar */}
      <div className="glass-panel rounded-2xl p-4 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
        {/* Category Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-sm ring-1 ring-blue-500'
                    : 'bg-slate-100 dark:bg-midnight-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-midnight-750'
                }`}
              >
                {cat.label}
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
            placeholder="Search by name, code or topic..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-midnight-850 border border-slate-200 dark:border-midnight-750 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
        </div>
      </div>

      {/* Competency Data Matrix Table */}
      <div className="glass-panel rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-midnight-800 flex justify-between items-center bg-slate-50/50 dark:bg-midnight-850/50">
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Showing {filteredCompetencies.length} of {competencies.length} Competencies
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/60 dark:bg-midnight-900 text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-midnight-800">
              <tr>
                <th className="py-3.5 px-4">Code</th>
                <th className="py-3.5 px-4">Competency Name & Scope</th>
                <th className="py-3.5 px-4">Domain</th>
                <th className="py-3.5 px-4">Current / Target</th>
                <th className="py-3.5 px-4">Readiness Progress</th>
                <th className="py-3.5 px-4">Gap Status</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-midnight-800/80 font-medium">
              {filteredCompetencies.map((comp) => {
                const userComp = userCompMap.get(comp.id) || userCompMap.get(comp.code);
                const currentScore = userComp ? userComp.estimatedScore : 35;
                const benchmark = comp.benchmarkScore || 80;
                const gap = Math.max(0, benchmark - currentScore);
                const isCritical = gap >= 30;
                const isModerate = gap > 0 && gap < 30;
                const isProficient = gap === 0;

                return (
                  <tr key={comp.id} className="hover:bg-slate-50/70 dark:hover:bg-midnight-850/60 transition-colors">
                    <td className="py-4 px-4 font-mono font-bold text-blue-600 dark:text-blue-400">
                      {comp.code}
                    </td>

                    <td className="py-4 px-4 max-w-sm">
                      <div className="font-extrabold text-slate-900 dark:text-white text-sm">
                        {comp.name}
                      </div>
                      <div className="text-slate-500 dark:text-slate-400 text-[11px] line-clamp-1 mt-0.5">
                        {comp.description}
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <StatusBadge variant={getCategoryBadgeVariant(comp.category)} size="sm">
                        {comp.category}
                      </StatusBadge>
                    </td>

                    <td className="py-4 px-4 tabular-nums">
                      <span className="font-extrabold text-slate-900 dark:text-white">{currentScore}</span>
                      <span className="text-slate-400 dark:text-slate-500"> / {benchmark}</span>
                    </td>

                    <td className="py-4 px-4 min-w-[140px]">
                      <div className="space-y-1">
                        <div className="w-full bg-slate-200 dark:bg-midnight-750 h-2 rounded-full overflow-hidden flex">
                          <div 
                            className={`h-full ${
                              isCritical ? 'bg-rose-500' : isModerate ? 'bg-amber-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${Math.min(100, (currentScore / benchmark) * 100)}%` }}
                          />
                        </div>
                        <div className="text-[10px] text-slate-400 flex justify-between">
                          <span>{Math.round((currentScore / benchmark) * 100)}% of target</span>
                          <span className="font-bold">{gap > 0 ? `-${gap} pts` : 'Met'}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <StatusBadge 
                        variant={isCritical ? 'critical' : isModerate ? 'moderate' : 'proficient'} 
                        size="sm"
                      >
                        {isCritical ? 'CRITICAL GAP' : isModerate ? 'MODERATE GAP' : 'PROFICIENT'}
                      </StatusBadge>
                    </td>

                    <td className="py-4 px-4 text-right">
                      <button
                        onClick={() => onStartQuiz(comp.name)}
                        className="px-3 py-1.5 bg-gov-primary dark:bg-blue-600 hover:bg-gov-secondary text-white font-bold text-xs rounded-lg shadow-sm transition-all inline-flex items-center space-x-1"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                        <span>Assess</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
