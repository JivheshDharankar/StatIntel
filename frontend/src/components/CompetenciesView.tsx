import React, { useState } from 'react';
import { Target, Sparkles, CheckCircle2, AlertCircle, Filter } from 'lucide-react';
import { Competency, UserCompetency } from '../types';

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
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', 'Statistical', 'Technical', 'Digital Governance', 'Behavioural/Managerial'];

  const filteredCompetencies = selectedCategory === 'All'
    ? competencies
    : competencies.filter(c => c.category === selectedCategory);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-gov-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Target className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-bold text-slate-900">Official Statistical Cadre Competency Matrix</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Standardized MoSPI Framework • 33 Competencies Across 4 Core Operational Domains
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-1.5">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${
                selectedCategory === cat
                  ? 'bg-gov-primary text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCompetencies.map(comp => {
          const userComp = userCompetencies.find(
            uc => uc.competencyId === comp.id || uc.competency?.code === comp.code
          );
          const hasScore = userComp !== undefined;
          const currentScore = userComp?.estimatedScore || 0;
          const benchmarkScore = comp.benchmarkScore || 80;
          const gap = Math.max(0, benchmarkScore - currentScore);

          return (
            <div 
              key={comp.id}
              className={`p-4 rounded-xl border flex flex-col justify-between transition-all ${
                hasScore && gap >= 35
                  ? 'border-amber-200 bg-amber-50/20'
                  : hasScore && gap > 0
                  ? 'border-blue-100 bg-white'
                  : hasScore && gap === 0
                  ? 'border-emerald-200 bg-emerald-50/20'
                  : 'border-slate-200 bg-white'
              }`}
            >
              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                    {comp.code}
                  </span>
                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                    comp.category === 'Statistical'
                      ? 'bg-purple-100 text-purple-800'
                      : comp.category === 'Technical'
                      ? 'bg-blue-100 text-blue-800'
                      : comp.category === 'Digital Governance'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {comp.category}
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-sm">{comp.name}</h3>
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {comp.description}
                </p>

                {/* Score Status */}
                <div className="pt-2 border-t border-slate-100 space-y-1 text-xs">
                  <div className="flex justify-between font-medium">
                    <span className="text-slate-500">
                      {hasScore ? `Current: ${currentScore}` : 'Not Assessed Yet'}
                    </span>
                    <span className="text-slate-700">Target: {benchmarkScore}</span>
                  </div>

                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden flex">
                    <div 
                      className={`h-full ${gap >= 35 ? 'bg-amber-500' : 'bg-gov-primary'}`} 
                      style={{ width: `${currentScore}%` }}
                    />
                  </div>

                  {hasScore && (
                    <div className="flex justify-between text-[11px] pt-0.5">
                      <span className="text-slate-500">Gap Score:</span>
                      <span className={`font-bold ${gap > 0 ? 'text-amber-700' : 'text-emerald-700'}`}>
                        {gap > 0 ? `+${gap} pts needed` : 'Benchmark Met'}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100">
                <button
                  onClick={() => onStartQuiz(comp.name)}
                  className="w-full py-1.5 px-3 bg-slate-100 hover:bg-gov-primary hover:text-white text-slate-700 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center space-x-1"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Launch Assessment</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
