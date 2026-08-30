import React from 'react';
import { 
  Award, 
  Target, 
  TrendingUp, 
  CheckCircle2, 
  FileText, 
  Sparkles, 
  ShieldCheck, 
  BrainCircuit, 
  Zap, 
  LineChart, 
  Layers,
  ArrowRight
} from 'lucide-react';
import { SkillGapItem } from '../services/api';
import { StatusBadge, getCategoryBadgeVariant } from './ui/StatusBadge';
import { StatCard } from './ui/StatCard';
import { PageHeader } from './ui/PageHeader';

interface EvidenceViewProps {
  skillGaps: SkillGapItem[];
  onStartQuiz: (topic: string) => void;
}

export function EvidenceView({
  skillGaps,
  onStartQuiz
}: EvidenceViewProps) {
  const criticalCount = skillGaps.filter(g => g.status === 'critical_gap').length;
  const moderateCount = skillGaps.filter(g => g.status === 'moderate_gap').length;
  const proficientCount = skillGaps.filter(g => g.status === 'proficient' || g.status === 'mastery').length;

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Page Header */}
      <PageHeader
        title="Evidence Ledger & Gap Closure Progression"
        subtitle="Bayesian evidence update pipeline tracking official statistical cadre capability through grounded AI assessments."
        icon={<Award className="w-5 h-5 text-emerald-500" />}
        badge={<StatusBadge variant="proficient" size="sm">{skillGaps.length} Tracked Skills</StatusBadge>}
      />

      {/* KPI Overview Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Tracked Competencies"
          value={skillGaps.length}
          subValue="Active"
          trend="Continuous Assessment"
          icon={<ShieldCheck className="w-4 h-4" />}
          variant="indigo"
        />
        <StatCard
          label="Critical Gaps"
          value={criticalCount}
          subValue="Action Flags"
          trend="Requires Evaluation"
          trendType="critical"
          icon={<Target className="w-4 h-4" />}
          variant="rose"
        />
        <StatCard
          label="Moderate Gaps"
          value={moderateCount}
          subValue="In Progress"
          trend="Partial Mastery"
          trendType="negative"
          icon={<Zap className="w-4 h-4" />}
          variant="amber"
        />
        <StatCard
          label="Proficient Areas"
          value={proficientCount}
          subValue="Verified"
          trend="Benchmark Satisfied"
          trendType="positive"
          icon={<CheckCircle2 className="w-4 h-4" />}
          variant="emerald"
        />
      </div>

      {/* Bayesian Methodology & Data Flow Architecture (2 Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Bayesian Update Mathematical Model */}
        <div className="glass-panel rounded-2xl p-6 space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-midnight-800 pb-3">
            <BrainCircuit className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
              Bayesian Evidence Calibration Model
            </h3>
          </div>

          <div className="space-y-3">
            <div className="p-3.5 bg-slate-50 dark:bg-midnight-850 rounded-xl border border-slate-200/80 dark:border-midnight-750 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                Step 1: Dynamic Evidence Weight
              </span>
              <code className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400 block">
                Weight = max(0.1, min(0.4, (Quiz Score / 100) * 0.5))
              </code>
            </div>

            <div className="p-3.5 bg-slate-50 dark:bg-midnight-850 rounded-xl border border-slate-200/80 dark:border-midnight-750 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                Step 2: Score Recalculation
              </span>
              <code className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 block">
                New Score = Old Score * (1 - Weight) + (Quiz Score * Weight)
              </code>
            </div>

            <div className="p-3.5 bg-slate-50 dark:bg-midnight-850 rounded-xl border border-slate-200/80 dark:border-midnight-750 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                Step 3: Remaining Gap & Closure
              </span>
              <code className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 block">
                New Gap = max(0, Benchmark Target - New Score)
              </code>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 dark:text-slate-400 italic pt-1">
            Note: StatIntel enforces a conservative evidence update model. Single assessment anomalies are dampened by the weight factor, requiring repeated demonstrated capability.
          </p>
        </div>

        {/* Right: Data Flow Architecture */}
        <div className="glass-panel rounded-2xl p-6 space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-midnight-800 pb-3">
            <Zap className="w-5 h-5 text-amber-500" />
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
              End-to-End Pipeline Architecture
            </h3>
          </div>

          <div className="relative pl-6 border-l-2 border-slate-200 dark:border-midnight-750 space-y-4 text-xs">
            {[
              {
                title: "1. FAISS Semantic Context Search",
                desc: "363 indexed MoSPI chunks retrieved based on selected competency domain.",
                color: "bg-blue-500"
              },
              {
                title: "2. Gemini 3.6 Flash Structured MCQ Formulation",
                desc: "Strictly grounded MCQs synthesized with Pydantic schema validation.",
                color: "bg-cyan-500"
              },
              {
                title: "3. Officer Assessment & Submission",
                desc: "5, 7, or 10 question evaluation submitted with impact weighting.",
                color: "bg-indigo-500"
              },
              {
                title: "4. Bayesian Evidence Ledger Mutation",
                desc: "Updated competency score recorded; gap closure recalculated live.",
                color: "bg-emerald-500"
              }
            ].map((step, idx) => (
              <div key={idx} className="relative">
                <div className={`absolute -left-[31px] top-0.5 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-midnight-950 ${step.color} shadow-sm`} />
                <h4 className="font-extrabold text-slate-900 dark:text-white">{step.title}</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Live Competency Audit Ledger Table */}
      <div className="glass-panel rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-midnight-800 flex justify-between items-center bg-slate-50/50 dark:bg-midnight-850/50">
          <div className="flex items-center space-x-2">
            <LineChart className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-white">
              Live Competency & Evidence State Ledger
            </h3>
          </div>
          <span className="text-xs text-rose-600 dark:text-rose-400 font-bold">
            {criticalCount} Critical Action Flags
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/60 dark:bg-midnight-900 text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-midnight-800">
              <tr>
                <th className="py-3.5 px-4">Priority</th>
                <th className="py-3.5 px-4">Competency Name</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Current Score</th>
                <th className="py-3.5 px-4">Target Benchmark</th>
                <th className="py-3.5 px-4">Remaining Gap</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Evidence Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-midnight-800/80 font-medium">
              {skillGaps.map((gap) => (
                <tr key={gap.competencyId} className="hover:bg-slate-50/70 dark:hover:bg-midnight-850/60 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">
                    #{gap.priorityRank}
                  </td>
                  <td className="py-3.5 px-4 font-extrabold text-slate-900 dark:text-white">
                    {gap.competencyName}
                  </td>
                  <td className="py-3.5 px-4">
                    <StatusBadge variant={getCategoryBadgeVariant(gap.category)} size="sm">
                      {gap.category}
                    </StatusBadge>
                  </td>
                  <td className="py-3.5 px-4 tabular-nums">
                    <span className="font-extrabold text-slate-900 dark:text-white">{gap.currentScore}</span>
                    <span className="text-slate-400 dark:text-slate-500"> / 100</span>
                  </td>
                  <td className="py-3.5 px-4 tabular-nums font-semibold text-slate-700 dark:text-slate-300">
                    {gap.requiredScore}
                  </td>
                  <td className="py-3.5 px-4 tabular-nums">
                    <span className={`font-extrabold ${gap.gap > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600'}`}>
                      {gap.gap > 0 ? `-${gap.gap} pts` : '0 (Target Met)'}
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
                      className="px-3 py-1.5 bg-gov-primary dark:bg-blue-600 hover:bg-gov-secondary text-white font-bold text-xs rounded-lg shadow-sm transition-all inline-flex items-center space-x-1"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      <span>Update Evidence</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
