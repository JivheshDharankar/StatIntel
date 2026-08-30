import React from 'react';
import { Award, Target, TrendingUp, CheckCircle2, FileText, Sparkles } from 'lucide-react';
import { SkillGapItem } from '../services/api';

interface EvidenceViewProps {
  skillGaps: SkillGapItem[];
  onStartQuiz: (topic: string) => void;
}

export function EvidenceView({
  skillGaps,
  onStartQuiz
}: EvidenceViewProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-gov-sm space-y-2">
        <div className="flex items-center space-x-2">
          <Award className="w-5 h-5 text-emerald-600" />
          <h2 className="text-lg font-bold text-slate-900">Competency Evidence & Gap Closure Progression</h2>
        </div>
        <p className="text-xs text-slate-500 leading-relaxed max-w-3xl">
          StatIntel implements a conservative Bayesian evidence update model. Quiz performances serve as competency evidence signals that update baseline ratings without unrealistic jumps.
        </p>
      </div>

      {/* Model Specification Card */}
      <div className="bg-gradient-to-br from-blue-50/60 to-white rounded-xl p-5 border border-blue-200 shadow-sm space-y-3">
        <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-blue-600" />
          <span>Evidence Scoring Methodology</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-white rounded-lg border border-slate-200">
            <span className="font-bold text-slate-800 block mb-1">1. Bayesian Update Formula</span>
            <code className="text-[11px] text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded block">
              new = prev × 0.75 + quiz × 0.25
            </code>
          </div>
          <div className="p-3 bg-white rounded-lg border border-slate-200">
            <span className="font-bold text-slate-800 block mb-1">2. Remaining Gap Formula</span>
            <code className="text-[11px] text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded block">
              new_gap = max(0, target - new)
            </code>
          </div>
          <div className="p-3 bg-white rounded-lg border border-slate-200">
            <span className="font-bold text-slate-800 block mb-1">3. Gap Closed Percentage</span>
            <code className="text-[11px] text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded block">
              ((old_gap - new_gap) / old_gap) × 100
            </code>
          </div>
        </div>
      </div>

      {/* Competency Gap Status Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-gov-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/60 flex justify-between items-center">
          <h3 className="font-bold text-slate-800 text-sm">Official Competency Status & Progress</h3>
          <span className="text-xs text-slate-500 font-medium">{skillGaps.length} Tracked Skills</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/75 text-slate-600 font-semibold border-b border-slate-200 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Competency</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Current Score</th>
                <th className="py-3 px-4">Target</th>
                <th className="py-3 px-4">Remaining Gap</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {skillGaps.map(gap => (
                <tr key={gap.competencyId} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-900">#{gap.priorityRank}</td>
                  <td className="py-3 px-4 font-bold text-slate-900">{gap.competencyName}</td>
                  <td className="py-3 px-4 text-slate-500">{gap.category}</td>
                  <td className="py-3 px-4">
                    <span className="font-bold text-slate-900">{gap.currentScore}</span> / 100
                  </td>
                  <td className="py-3 px-4">{gap.requiredScore}</td>
                  <td className="py-3 px-4">
                    <span className={`font-bold ${gap.gap > 0 ? 'text-amber-700' : 'text-emerald-700'}`}>
                      {gap.gap > 0 ? `+${gap.gap} pts` : '0 pts (Met)'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      gap.status === 'critical_gap' 
                        ? 'bg-amber-100 text-amber-800' 
                        : gap.status === 'moderate_gap'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {gap.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => onStartQuiz(gap.competencyName)}
                      className="px-2.5 py-1 bg-gov-primary hover:bg-gov-secondary text-white text-[11px] font-semibold rounded shadow-sm transition-colors"
                    >
                      Assess
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
