import React, { useState } from 'react';
import { BookOpen, Sparkles, Search, Clock, Award, Globe, ArrowRight } from 'lucide-react';
import { LearningResource } from '../types';

interface LearningCatalogueViewProps {
  resources: LearningResource[];
  onStartQuiz: (topic: string) => void;
}

export function LearningCatalogueView({
  resources,
  onStartQuiz
}: LearningCatalogueViewProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories = ['All', 'iGOT', 'NSSTA', 'TPAC', 'Learning Material'];

  const filteredResources = resources.filter(res => {
    const matchesCategory = selectedCategory === 'All' || res.source === selectedCategory || (res as any).sourceCategory === selectedCategory;
    const matchesSearch = !searchQuery || 
      res.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (res.competencyName && res.competencyName.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header & Filter Controls */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-gov-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center space-x-2">
              <BookOpen className="w-5 h-5 text-emerald-600" />
              <h2 className="text-lg font-bold text-slate-900">Integrated Statistical Learning Catalogue</h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Harmonized across <strong>iGOT Karmayogi</strong>, <strong>NSSTA</strong>, <strong>TPAC</strong>, and <strong>MoSPI Reference Handbooks</strong> (21 Courses & Modules)
            </p>
          </div>
          <span className="text-xs text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full font-semibold border border-emerald-200 self-start sm:self-auto">
            {filteredResources.length} Modules Available
          </span>
        </div>

        {/* Search & Category Filter */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search courses, topics, or competencies (e.g. Sampling, Python, Data Quality)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
            />
          </div>

          <div className="flex flex-wrap gap-1.5">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-2 text-xs font-semibold rounded-lg transition-colors ${
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
      </div>

      {/* Resources Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredResources.map(res => (
          <div 
            key={res.id}
            className="p-5 rounded-xl border border-slate-200 bg-white hover:border-blue-300 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                  res.source === 'NSSTA' 
                    ? 'bg-purple-100 text-purple-800 border border-purple-200' 
                    : res.source === 'iGOT'
                    ? 'bg-blue-100 text-blue-800 border border-blue-200'
                    : res.source === 'TPAC'
                    ? 'bg-amber-100 text-amber-800 border border-amber-200'
                    : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                }`}>
                  {res.source}
                </span>

                <span className="text-[11px] text-slate-500 font-medium">
                  {res.resourceType} • {res.targetLevel}
                </span>

                <span className="ml-auto text-[11px] text-slate-500 flex items-center space-x-1 font-medium">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span>{res.durationHours} hrs</span>
                </span>
              </div>

              <h3 className="font-bold text-slate-900 text-sm leading-snug">
                {res.title}
              </h3>

              <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                {res.description}
              </p>

              <div className="pt-2 text-[10px] text-slate-400 font-mono flex items-center space-x-1">
                <span>Source:</span>
                <strong className="text-slate-600">{res.sourceDocument}</strong>
                {res.sourcePage && <span>(Page {res.sourcePage})</span>}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
              <span className="text-[11px] text-slate-500 font-medium">
                Delivery: <strong>{res.deliveryMode}</strong>
              </span>

              <button
                onClick={() => onStartQuiz(res.competencyName || 'Sampling')}
                className="px-3.5 py-1.5 bg-gov-primary hover:bg-gov-secondary text-white text-xs font-semibold rounded-lg shadow-sm transition-colors flex items-center space-x-1"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Assess Competency</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
