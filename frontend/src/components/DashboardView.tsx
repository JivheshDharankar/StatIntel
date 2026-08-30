import React, { useMemo } from 'react';
import { 
  Sparkles, 
  Target, 
  BookOpen, 
  ArrowRight, 
  TrendingUp, 
  CheckCircle2, 
  AlertCircle, 
  FileText,
  Building2,
  Award,
  Layers,
  BarChart3,
  Radar as RadarIcon,
  ChevronRight,
  ShieldCheck,
  Zap,
  Check
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip as RechartsTooltip, 
  CartesianGrid, 
  Legend, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar 
} from 'recharts';
import { UserProfile, Recommendation } from '../types';
import { SkillGapItem } from '../services/api';
import { StatCard } from './ui/StatCard';
import { StatusBadge, getProviderBadgeVariant } from './ui/StatusBadge';
import { PageHeader } from './ui/PageHeader';

interface DashboardViewProps {
  profile: UserProfile | null;
  skillGaps: SkillGapItem[];
  recommendations: Recommendation[];
  onStartQuiz: (topic: string) => void;
}

export function DashboardView({
  profile,
  skillGaps,
  recommendations,
  onStartQuiz
}: DashboardViewProps) {
  const criticalGaps = useMemo(() => skillGaps.filter(g => g.status === 'critical_gap'), [skillGaps]);
  const moderateGaps = useMemo(() => skillGaps.filter(g => g.status === 'moderate_gap'), [skillGaps]);
  const proficientAreas = useMemo(() => skillGaps.filter(g => g.status === 'proficient' || g.status === 'mastery'), [skillGaps]);
  const topGap = skillGaps[0];

  const averageScore = useMemo(() => {
    if (skillGaps.length === 0) return 0;
    const sum = skillGaps.reduce((acc, curr) => acc + curr.currentScore, 0);
    return Math.round((sum / skillGaps.length) * 10) / 10;
  }, [skillGaps]);

  const averageGap = useMemo(() => {
    if (skillGaps.length === 0) return 0;
    const sum = skillGaps.reduce((acc, curr) => acc + curr.gap, 0);
    return Math.round((sum / skillGaps.length) * 10) / 10;
  }, [skillGaps]);

  // Data for Horizontal Competency Gap Bar Chart
  const gapChartData = useMemo(() => {
    return skillGaps.slice(0, 6).map(g => ({
      name: g.competencyName.length > 18 ? `${g.competencyName.substring(0, 16)}...` : g.competencyName,
      fullName: g.competencyName,
      Current: g.currentScore,
      Target: g.requiredScore,
      Gap: g.gap,
      category: g.category
    }));
  }, [skillGaps]);

  // Data for Radar Domain Mastery Chart
  const domainRadarData = useMemo(() => {
    const categories: Record<string, { currentTotal: number; targetTotal: number; count: number }> = {};
    skillGaps.forEach(g => {
      const cat = g.category || 'General';
      if (!categories[cat]) {
        categories[cat] = { currentTotal: 0, targetTotal: 0, count: 0 };
      }
      categories[cat].currentTotal += g.currentScore;
      categories[cat].targetTotal += g.requiredScore;
      categories[cat].count += 1;
    });

    return Object.keys(categories).map(cat => ({
      domain: cat.replace('/Managerial', '').replace(' Governance', ''),
      Current: Math.round(categories[cat].currentTotal / categories[cat].count),
      Benchmark: Math.round(categories[cat].targetTotal / categories[cat].count),
    }));
  }, [skillGaps]);

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* 1. Executive Officer Dossier Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden glass-panel-elevated border border-slate-200/80 dark:border-midnight-700/80 p-6 sm:p-8">
        {/* Ambient radial lighting */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-blue-600/10 via-indigo-600/10 to-transparent rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-midnight-800 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700/60 text-xs font-bold shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
              <span>Official Statistical Cadre Intelligence • MoSPI SIH26101</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight font-display">
              Good morning, {profile?.fullName ? profile.fullName.split(' ')[0] : 'Officer'}
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Your personalized competency dossier tracks <strong>{skillGaps.length} statistical competencies</strong> mapped to official Ministry standards. Bayesian evidence models continually calibrate your readiness based on verified RAG assessments.
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-2 text-xs text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-slate-800 dark:text-slate-200">{profile?.designation || 'Statistical Officer'}</span>
              <span>•</span>
              <span>{profile?.department || 'Field Operations Division (FOD)'}</span>
              <span>•</span>
              <span>{profile?.experienceYears || 6} Years Cadre Experience</span>
            </div>
          </div>

          {/* Primary Quick Action */}
          {topGap && (
            <div className="w-full lg:w-auto bg-slate-50 dark:bg-midnight-850 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-midnight-700 shadow-sm flex flex-col justify-between space-y-3 lg:min-w-[280px]">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                    #1 Priority Cadre Action
                  </span>
                  <div className="text-sm font-extrabold text-slate-900 dark:text-white">
                    {topGap.competencyName}
                  </div>
                </div>
                <StatusBadge variant="critical" size="sm">
                  -{topGap.gap} pts
                </StatusBadge>
              </div>

              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Target benchmark: <strong>{topGap.requiredScore} pts</strong> (Current: {topGap.currentScore})
              </p>

              <button
                onClick={() => onStartQuiz(topGap.competencyName)}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-gov-primary via-blue-700 to-gov-secondary hover:from-blue-900 hover:to-blue-800 text-white font-extrabold text-xs rounded-xl shadow-glow-blue transition-all flex items-center justify-center space-x-2 transform active:scale-[0.99]"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Launch Assessment ({topGap.competencyName})</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 2. Executive KPI Stat Cards Grid (5 Cards) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard
          label="Overall Competency"
          value={`${averageScore}`}
          subValue="/ 100"
          trend="Bayesian Weighted"
          trendType="positive"
          icon={<TrendingUp className="w-4 h-4" />}
          variant="indigo"
        />
        <StatCard
          label="Critical Skill Gaps"
          value={criticalGaps.length}
          subValue="Priorities"
          trend="Immediate Action Required"
          trendType="critical"
          icon={<AlertCircle className="w-4 h-4" />}
          variant="rose"
        />
        <StatCard
          label="Moderate Gaps"
          value={moderateGaps.length}
          subValue="Skills"
          trend="In Training Alignment"
          trendType="negative"
          icon={<Target className="w-4 h-4" />}
          variant="amber"
        />
        <StatCard
          label="Proficient Areas"
          value={proficientAreas.length}
          subValue="Verified"
          trend="Meeting Cadre Benchmark"
          trendType="positive"
          icon={<ShieldCheck className="w-4 h-4" />}
          variant="emerald"
        />
        <StatCard
          label="Learning Resources"
          value={recommendations.length}
          subValue="Modules"
          trend="iGOT / NSSTA / TPAC"
          trendType="neutral"
          icon={<BookOpen className="w-4 h-4" />}
          variant="blue"
        />
      </div>

      {/* 3. Recharts Analytics Intelligence Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Competency Readiness vs Benchmark Bar Chart */}
        <div className="glass-panel rounded-2xl p-6 space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 dark:border-midnight-800 pb-3">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Competency Readiness vs Benchmark Target</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Current score vs official MoSPI benchmark across high-priority gaps
              </p>
            </div>
            <StatusBadge variant="statistical" size="sm">Top 6 Gaps</StatusBadge>
          </div>

          <div className="h-[280px] w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={gapChartData} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.15)" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fill: 'currentColor', fontSize: 10, fontWeight: 600 }} 
                  axisLine={{ stroke: 'rgba(148, 163, 184, 0.2)' }}
                  tickLine={false}
                  angle={-20}
                  textAnchor="end"
                />
                <YAxis 
                  domain={[0, 100]}
                  tick={{ fill: 'currentColor', fontSize: 10 }} 
                  axisLine={false}
                  tickLine={false}
                />
                <RechartsTooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(8, 14, 26, 0.95)', 
                    borderColor: 'rgba(30, 48, 86, 0.8)', 
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.4)'
                  }}
                  itemStyle={{ padding: '2px 0' }}
                />
                <Legend verticalAlign="top" align="right" wrapperStyle={{ fontSize: '11px', paddingBottom: '8px' }} />
                <Bar dataKey="Current" fill="#3B82F6" radius={[4, 4, 0, 0]} maxBarSize={28} />
                <Bar dataKey="Target" fill="#10B981" radius={[4, 4, 0, 0]} maxBarSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Domain Mastery Radar Heatmap */}
        <div className="glass-panel rounded-2xl p-6 space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 dark:border-midnight-800 pb-3">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <RadarIcon className="w-4 h-4 text-indigo-500" />
                <span>Domain Mastery Radar Profile</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Aggregate cadre capability distributed across 4 core competency pillars
              </p>
            </div>
            <StatusBadge variant="mastery" size="sm">4 Pillars</StatusBadge>
          </div>

          <div className="h-[280px] w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={domainRadarData} outerRadius="75%">
                <PolarGrid stroke="rgba(148, 163, 184, 0.2)" />
                <PolarAngleAxis 
                  dataKey="domain" 
                  tick={{ fill: 'currentColor', fontSize: 10, fontWeight: 700 }} 
                />
                <PolarRadiusAxis domain={[0, 100]} stroke="rgba(148, 163, 184, 0.2)" />
                <Radar name="Current Score" dataKey="Current" stroke="#6366F1" fill="#6366F1" fillOpacity={0.45} />
                <Radar name="Benchmark" dataKey="Benchmark" stroke="#10B981" fill="#10B981" fillOpacity={0.15} />
                <Legend verticalAlign="bottom" wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <RechartsTooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(8, 14, 26, 0.95)', 
                    borderColor: 'rgba(30, 48, 86, 0.8)', 
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 4. Prioritized Skill Gap Action Ledger */}
      <div className="glass-panel rounded-2xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 dark:border-midnight-800 pb-3 gap-2">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Target className="w-4 h-4 text-rose-500" />
              <span>Prioritized Cadre Skill Gap Matrix</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Ranked descending by distance to benchmark target standard
            </p>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
            {skillGaps.length} Total Competencies Monitored
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-midnight-850 text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-midnight-800">
              <tr>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Competency Name</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Score / Target</th>
                <th className="py-3 px-4">Gap Magnitude</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Cadre Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-midnight-800 font-medium">
              {skillGaps.slice(0, 5).map((gap) => (
                <tr key={gap.competencyId} className="hover:bg-slate-50/60 dark:hover:bg-midnight-850/60 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">
                    #{gap.priorityRank}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900 dark:text-white">{gap.competencyName}</div>
                    <div className="text-[10px] font-mono text-slate-400">{gap.competencyCode}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <StatusBadge variant="statistical" size="sm">{gap.category}</StatusBadge>
                  </td>
                  <td className="py-3.5 px-4 tabular-nums">
                    <span className="font-bold text-slate-900 dark:text-white">{gap.currentScore}</span>
                    <span className="text-slate-400 dark:text-slate-500"> / {gap.requiredScore}</span>
                  </td>
                  <td className="py-3.5 px-4 tabular-nums">
                    <span className={`font-bold ${gap.gap > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600'}`}>
                      {gap.gap > 0 ? `-${gap.gap} pts` : 'Target Met'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <StatusBadge 
                      variant={gap.status === 'critical_gap' ? 'critical' : gap.status === 'moderate_gap' ? 'moderate' : 'proficient'} 
                      size="sm"
                    >
                      {gap.status.replace('_', ' ').toUpperCase()}
                    </StatusBadge>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => onStartQuiz(gap.competencyName)}
                      className="px-3 py-1.5 bg-gov-primary dark:bg-blue-600 hover:bg-gov-secondary text-white font-bold text-[11px] rounded-lg shadow-sm transition-all inline-flex items-center space-x-1"
                    >
                      <Sparkles className="w-3 h-3 text-amber-300" />
                      <span>Assess</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Explainable Personalized Learning Pathway */}
      <div className="glass-panel rounded-2xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 dark:border-midnight-800 pb-3 gap-2">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-500" />
              <span>Personalized Learning Interventions (iGOT / NSSTA / TPAC / MoSPI)</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Curriculum mappings targeted directly at closing your largest identified competency deficits
            </p>
          </div>
          <StatusBadge variant="igot" size="sm">
            {recommendations.length} Modules Recommended
          </StatusBadge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {recommendations.slice(0, 3).map((rec) => (
            <div
              key={rec.id}
              className="glass-panel-elevated p-5 rounded-2xl border border-slate-200/80 dark:border-midnight-750 flex flex-col justify-between space-y-4 hover:border-blue-400 dark:hover:border-blue-500 transition-all group"
            >
              <div className="space-y-2.5">
                <div className="flex justify-between items-start gap-2">
                  <StatusBadge variant={getProviderBadgeVariant(rec.resource?.source || 'iGOT')} size="sm">
                    {rec.resource?.source}
                  </StatusBadge>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                    {rec.matchScore}% Match
                  </span>
                </div>

                <h4 className="font-extrabold text-sm text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-snug">
                  {rec.resource?.title}
                </h4>

                <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                  {rec.resource?.description}
                </p>

                {/* Explainable Rationale */}
                <div className="bg-slate-50 dark:bg-midnight-900 p-2.5 rounded-xl border border-slate-200/60 dark:border-midnight-800 text-[11px] text-slate-600 dark:text-slate-300">
                  <span className="font-bold text-blue-600 dark:text-blue-400">Why Assigned:</span> {rec.rationale}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-midnight-800/80 flex items-center justify-between">
                <span className="text-[11px] font-mono text-slate-400">
                  {rec.resource?.durationHours} hrs • {rec.resource?.deliveryMode}
                </span>

                <button
                  onClick={() => onStartQuiz(rec.resource?.competencyName || 'Sampling')}
                  className="px-3 py-1.5 bg-slate-100 dark:bg-midnight-800 hover:bg-blue-600 hover:text-white text-slate-700 dark:text-slate-200 font-bold text-xs rounded-lg transition-colors flex items-center space-x-1"
                >
                  <span>Verify Skill</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
