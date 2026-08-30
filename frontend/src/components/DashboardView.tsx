import React from 'react';
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
  Layers
} from 'lucide-react';
import { UserProfile, Recommendation } from '../types';
import { SkillGapItem } from '../services/api';

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
  const criticalGaps = skillGaps.filter(g => g.status === 'critical_gap');
  const moderateGaps = skillGaps.filter(g => g.status === 'moderate_gap');
  const topGap = skillGaps[0];

  return (
    <div className="space-y-6">
      {/* Executive Hero Banner */}
      <div className="bg-gradient-to-r from-gov-primary via-slate-900 to-gov-secondary rounded-2xl p-6 sm:p-8 text-white shadow-gov-lg relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold backdrop-blur-sm mb-3 border border-white/10">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>AI-Enabled Skill Intelligence & Personalized Learning Platform (SIH26101)</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2">
            Official Statistical Cadre Intelligence Dashboard
          </h1>

          <p className="text-slate-200 text-xs sm:text-sm leading-relaxed mb-4">
            Demonstrating end-to-end Competency Assessment → Skill Gap Discovery → iGOT/NSSTA/TPAC Recommendations → RAG Grounded Assessment → Evidence-Based Gap Closure for India's Official Statistical System.
          </p>

          {/* Primary CTA */}
          {topGap && (
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => onStartQuiz(topGap.competencyName)}
                className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-gov-md transition-all flex items-center space-x-2 transform hover:-translate-y-0.5"
              >
                <Sparkles className="w-4 h-4 text-slate-950" />
                <span>Start Skill Assessment: {topGap.competencyName}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <span className="text-xs text-slate-300">
                Primary Gap: <strong>{topGap.gap} pts</strong> needed to reach target benchmark ({topGap.requiredScore})
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Profile Overview Card */}
      {profile && (
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-gov-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 text-gov-primary flex items-center justify-center font-bold text-lg flex-shrink-0">
                SO
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-base font-bold text-slate-900">{profile.fullName}</h2>
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 rounded-md">
                    Demo Profile
                  </span>
                </div>
                <p className="text-xs text-slate-600 font-medium">
                  {profile.designation} • {profile.department}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Current Assignment: <strong>{profile.currentAssignment}</strong> • Experience: {profile.experienceYears} Years
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4 bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
              <div className="text-center px-2">
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Assessed Skills</span>
                <span className="text-sm font-bold text-slate-900">{skillGaps.length}</span>
              </div>
              <div className="h-6 w-px bg-slate-200" />
              <div className="text-center px-2">
                <span className="text-slate-500 block text-[10px] uppercase font-bold text-amber-700">Critical Gaps</span>
                <span className="text-sm font-bold text-amber-700">{criticalGaps.length}</span>
              </div>
              <div className="h-6 w-px bg-slate-200" />
              <div className="text-center px-2">
                <span className="text-slate-500 block text-[10px] uppercase font-bold text-blue-700">Moderate Gaps</span>
                <span className="text-sm font-bold text-blue-700">{moderateGaps.length}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Top 3 Prioritized Skill Gaps */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-gov-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 gap-2">
          <div>
            <div className="flex items-center space-x-2">
              <Target className="w-5 h-5 text-blue-600" />
              <h2 className="font-bold text-slate-900 text-base">Top Prioritized Competency Gaps</h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Ranked descending by gap magnitude: <code>gap = max(0, requiredScore - currentScore)</code>
            </p>
          </div>
          <span className="text-xs text-blue-800 bg-blue-50 px-3 py-1 rounded-full font-semibold border border-blue-200 self-start sm:self-auto">
            {criticalGaps.length} Critical Priority Action Items
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {skillGaps.slice(0, 3).map(gap => (
            <div 
              key={gap.competencyId}
              className={`p-4 rounded-xl border flex flex-col justify-between transition-all ${
                gap.status === 'critical_gap'
                  ? 'border-amber-200 bg-gradient-to-br from-amber-50/50 to-white shadow-sm'
                  : 'border-blue-100 bg-slate-50/50'
              }`}
            >
              <div>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="text-[10px] font-bold tracking-wider uppercase text-slate-500">
                      {gap.category}
                    </span>
                    <h3 className="font-bold text-slate-900 text-sm">{gap.competencyName}</h3>
                  </div>
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-amber-100 text-amber-800 border border-amber-200">
                    Rank #{gap.priorityRank}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1 mt-3">
                  <div className="flex justify-between text-xs font-medium text-slate-600">
                    <span>Current: <strong className="text-slate-900">{gap.currentScore}</strong></span>
                    <span>Target: <strong className="text-slate-900">{gap.requiredScore}</strong></span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden flex">
                    <div 
                      className={`h-full ${gap.status === 'critical_gap' ? 'bg-amber-500' : 'bg-blue-500'}`} 
                      style={{ width: `${gap.currentScore}%` }}
                    />
                    <div 
                      className="h-full bg-slate-300 opacity-60" 
                      style={{ width: `${gap.gap}%` }}
                      title={`Gap: ${gap.gap} points`}
                    />
                  </div>
                  <div className="flex justify-between items-center pt-1 text-[11px]">
                    <span className="text-slate-500">Gap Score:</span>
                    <span className="font-bold text-slate-800">+{gap.gap} pts needed</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100">
                <button
                  onClick={() => onStartQuiz(gap.competencyName)}
                  className="w-full py-1.5 px-3 bg-gov-primary hover:bg-gov-secondary text-white text-xs font-semibold rounded-lg shadow-sm transition-colors flex items-center justify-center space-x-1"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>Start Grounded Assessment</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Explainable Recommendations Card */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-gov-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 gap-2">
          <div>
            <div className="flex items-center space-x-2">
              <BookOpen className="w-5 h-5 text-emerald-600" />
              <h2 className="font-bold text-slate-900 text-base">
                Personalized Learning Recommendations (API-Ready Adapters)
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Matched deterministically across <strong>iGOT Karmayogi</strong>, <strong>NSSTA</strong>, <strong>TPAC</strong>, and <strong>MoSPI Handbooks</strong>.
            </p>
          </div>
          <span className="text-xs text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full font-semibold border border-emerald-200 self-start sm:self-auto">
            {recommendations.length} Prioritized Resources
          </span>
        </div>

        <div className="space-y-3">
          {recommendations.slice(0, 3).map(rec => (
            <div 
              key={rec.id}
              className="p-4 rounded-xl border border-slate-200 hover:border-blue-300 bg-white transition-all shadow-sm hover:shadow-md flex flex-col sm:flex-row justify-between gap-4"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                    rec.resource?.source === 'NSSTA' 
                      ? 'bg-purple-100 text-purple-800 border border-purple-200' 
                      : rec.resource?.source === 'iGOT'
                      ? 'bg-blue-100 text-blue-800 border border-blue-200'
                      : rec.resource?.source === 'TPAC'
                      ? 'bg-amber-100 text-amber-800 border border-amber-200'
                      : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  }`}>
                    {rec.resource?.source}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    {rec.resource?.resourceType} • {rec.resource?.durationHours} hrs • {rec.resource?.targetLevel} • {rec.resource?.deliveryMode}
                  </span>
                  <span className="ml-auto sm:ml-0 text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Match: {rec.matchScore}/100
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-sm">
                  {rec.resource?.title}
                </h3>
                
                <p className="text-xs text-slate-600 leading-relaxed">
                  {rec.resource?.description}
                </p>

                {/* Explainable Rationale Box */}
                <div className="bg-slate-50 border-l-2 border-blue-500 p-2.5 rounded-r text-[11px] text-slate-700">
                  <strong>Why Recommended:</strong> {rec.rationale}
                </div>

                <div className="text-[10px] text-slate-400 font-mono">
                  Provenance: {rec.resource?.sourceDocument} {rec.resource?.sourcePage ? `(Page ${rec.resource.sourcePage})` : ''}
                </div>
              </div>

              <div className="flex sm:flex-col justify-end items-end gap-2 flex-shrink-0">
                <span className="text-xs font-semibold text-slate-400">
                  Rank #{rec.priorityRank}
                </span>
                <button
                  onClick={() => onStartQuiz(rec.resource?.competencyName || 'Sampling')}
                  className="px-3 py-1.5 bg-gov-primary hover:bg-gov-secondary text-white text-xs font-semibold rounded-lg shadow-sm transition-colors flex items-center space-x-1"
                >
                  <span>Assess Module</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
