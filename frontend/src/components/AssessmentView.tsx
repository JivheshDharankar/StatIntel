import React, { useState, useEffect, useMemo } from 'react';
import { 
  Sparkles, 
  BookOpen, 
  CheckCircle2, 
  XCircle,
  ArrowRight, 
  ArrowLeft,
  FileText, 
  Award, 
  HelpCircle,
  AlertCircle,
  TrendingUp,
  RefreshCw,
  Clock,
  ChevronRight,
  ChevronDown,
  Layers,
  Zap,
  RotateCcw,
  Check,
  Search,
  ExternalLink,
  ShieldCheck,
  Target
} from 'lucide-react';
import { GeneratedQuizResponse, QuizSubmissionResponse } from '../services/api';

interface AssessmentViewProps {
  activeQuiz: GeneratedQuizResponse | null;
  quizLoading: boolean;
  submittingQuiz: boolean;
  quizResult: QuizSubmissionResponse['data'] | null;
  userAnswers: Record<string, string>;
  onStartQuiz: (topic: string, questionCount?: number, difficulty?: string) => void;
  onSelectOption: (questionId: string, optionKey: string) => void;
  onSubmitQuiz: () => void;
  onResetQuiz: () => void;
}

export function AssessmentView({
  activeQuiz,
  quizLoading,
  submittingQuiz,
  quizResult,
  userAnswers,
  onStartQuiz,
  onSelectOption,
  onSubmitQuiz,
  onResetQuiz
}: AssessmentViewProps) {
  // Configuration State
  const [selectedTopic, setSelectedTopic] = useState<string>('Sampling');
  const [selectedCount, setSelectedCount] = useState<number>(5);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('medium');

  // In-Quiz Interaction State
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [inReviewMode, setInReviewMode] = useState<boolean>(false);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [expandedExplanationId, setExpandedExplanationId] = useState<string | null>(null);
  const [resultsFilter, setResultsFilter] = useState<'all' | 'correct' | 'incorrect'>('all');

  // Topic Options with official MoSPI reference sources
  const topics = [
    { 
      name: 'Sampling', 
      doc: 'Sampling Design.pdf', 
      benchmark: 85,
      current: 35,
      gap: 50,
      badge: 'Critical Gap (Top Priority)',
      badgeColor: 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
    },
    { 
      name: 'Data Quality', 
      doc: 'Data Quality.pdf', 
      benchmark: 85,
      current: 48,
      gap: 37,
      badge: 'MoSPI National Framework',
      badgeColor: 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
    },
    { 
      name: 'Survey Methodology', 
      doc: 'Survey Methodology.pdf', 
      benchmark: 80,
      current: 70,
      gap: 10,
      badge: 'Field Ops & CAPI Standard',
      badgeColor: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
    },
    { 
      name: 'AI/ML in Official Statistics', 
      doc: 'Big Data Analytics & AI.pdf', 
      benchmark: 75,
      current: 30,
      gap: 45,
      badge: 'Cadre Gap (Technical)',
      badgeColor: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800'
    },
    { 
      name: 'Python Data Processing', 
      doc: 'Python Microdata Wrangling.pdf', 
      benchmark: 80,
      current: 42,
      gap: 38,
      badge: 'Modern Tooling',
      badgeColor: 'bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800'
    },
    { 
      name: 'National Accounts', 
      doc: 'National Accounts Statistics.pdf', 
      benchmark: 80,
      current: 60,
      gap: 20,
      badge: 'SACS Benchmark',
      badgeColor: 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800'
    }
  ];

  // Timer Effect when assessment is active
  useEffect(() => {
    let interval: any = null;
    if (activeQuiz && !quizResult && !quizLoading) {
      interval = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      setElapsedSeconds(0);
      setCurrentQuestionIndex(0);
      setInReviewMode(false);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeQuiz, quizResult, quizLoading]);

  // Keyboard Shortcuts (A, B, C, D, Arrow Keys)
  useEffect(() => {
    if (!activeQuiz || quizResult || inReviewMode) return;

    const currentQ = activeQuiz.questions[currentQuestionIndex];
    if (!currentQ) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if typing in an input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      const key = e.key.toUpperCase();
      if (['A', 'B', 'C', 'D'].includes(key)) {
        onSelectOption(currentQ.id, key);
      } else if (key === '1') {
        onSelectOption(currentQ.id, 'A');
      } else if (key === '2') {
        onSelectOption(currentQ.id, 'B');
      } else if (key === '3') {
        onSelectOption(currentQ.id, 'C');
      } else if (key === '4') {
        onSelectOption(currentQ.id, 'D');
      } else if (e.key === 'ArrowRight' && currentQuestionIndex < activeQuiz.questions.length - 1) {
        setCurrentQuestionIndex((prev) => prev + 1);
      } else if (e.key === 'ArrowLeft' && currentQuestionIndex > 0) {
        setCurrentQuestionIndex((prev) => prev - 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeQuiz, currentQuestionIndex, inReviewMode, quizResult, onSelectOption]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const estimatedMinutes = useMemo(() => {
    if (selectedCount === 10) return 10;
    if (selectedCount === 7) return 7;
    return 5;
  }, [selectedCount]);

  const activeTopicObj = useMemo(() => {
    return topics.find(t => t.name === selectedTopic) || topics[0];
  }, [selectedTopic]);

  // =========================================================================
  // 1. ASSESSMENT SETUP & CONFIGURATION SCREEN
  // =========================================================================
  if (!activeQuiz && !quizResult && !quizLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        {/* Header Banner */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 dark:bg-blue-400/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-xs font-bold mb-3 border border-blue-200 dark:border-blue-800">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
              <span>RAG-Grounded AI Assessment Engine (Gemini 3.6 Flash)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Official Statistical Competency Assessment
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
              Synthesize adaptive multiple-choice assessments strictly grounded in 363 indexed MoSPI statistical handbooks. 
              Submissions update your official Bayesian competency record and adjust cadre skill gaps in real time.
            </p>
          </div>
        </div>

        {/* Configuration Matrix */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Topic & Settings Selection */}
          <div className="lg:col-span-2 space-y-6">
            {/* 1. Topic Selection */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Target className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                    1. Select Target Competency
                  </label>
                </div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  {topics.length} MoSPI Domains Available
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {topics.map((t) => {
                  const isSelected = selectedTopic === t.name;
                  return (
                    <button
                      key={t.name}
                      type="button"
                      onClick={() => setSelectedTopic(t.name)}
                      className={`p-4 rounded-xl border text-left transition-all relative overflow-hidden group ${
                        isSelected
                          ? 'border-blue-500 dark:border-blue-400 bg-blue-50/70 dark:bg-blue-950/50 shadow-sm ring-1 ring-blue-500 dark:ring-blue-400'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 hover:bg-slate-100/60 dark:hover:bg-slate-800/60 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-1.5">
                        <span className="font-bold text-sm text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {t.name}
                        </span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${t.badgeColor}`}>
                          {t.badge}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mt-2">
                        <span className="font-mono truncate max-w-[170px] flex items-center gap-1">
                          <FileText className="w-3 h-3 text-slate-400" /> {t.doc}
                        </span>
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          Score: {t.current}/{t.benchmark}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Parameters: Question Count & Difficulty */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Question Count */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex items-center space-x-2">
                  <Layers className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                    2. Question Count
                  </label>
                </div>

                <div className="grid grid-cols-3 gap-2.5">
                  {[5, 7, 10].map((count) => {
                    const isSelected = selectedCount === count;
                    return (
                      <button
                        key={count}
                        type="button"
                        onClick={() => setSelectedCount(count)}
                        className={`py-3 px-2 rounded-xl border text-center transition-all ${
                          isSelected
                            ? 'border-blue-500 dark:border-blue-400 bg-blue-600 text-white font-bold shadow-sm'
                            : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                        }`}
                      >
                        <div className="text-lg font-extrabold">{count}</div>
                        <div className={`text-[10px] ${isSelected ? 'text-blue-100' : 'text-slate-500 dark:text-slate-400'}`}>
                          {count === 5 ? 'Quick (~5m)' : count === 7 ? 'Standard' : 'Deep (~10m)'}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Difficulty */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex items-center space-x-2">
                  <Zap className="w-4 h-4 text-amber-500" />
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                    3. Target Difficulty
                  </label>
                </div>

                <div className="grid grid-cols-3 gap-2.5">
                  {[
                    { key: 'easy', label: 'Easy', desc: 'Foundational' },
                    { key: 'medium', label: 'Medium', desc: 'Standard Ops' },
                    { key: 'hard', label: 'Hard', desc: 'Advanced Design' }
                  ].map((d) => {
                    const isSelected = selectedDifficulty === d.key;
                    return (
                      <button
                        key={d.key}
                        type="button"
                        onClick={() => setSelectedDifficulty(d.key)}
                        className={`py-3 px-2 rounded-xl border text-center transition-all ${
                          isSelected
                            ? 'border-amber-500 bg-amber-500 text-white font-bold shadow-sm'
                            : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                        }`}
                      >
                        <div className="text-xs font-extrabold">{d.label}</div>
                        <div className={`text-[10px] mt-0.5 ${isSelected ? 'text-amber-100' : 'text-slate-500 dark:text-slate-400'}`}>
                          {d.desc}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Right Col: Assessment Specification Summary & CTA */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center justify-between">
                <span>Assessment Specification</span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  Ready to Synthesize
                </span>
              </h3>

              <div className="space-y-3.5 text-xs">
                <div className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400">Target Competency:</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">{selectedTopic}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400">Questions:</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400">{selectedCount} MCQs</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400">Estimated Duration:</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" /> ~{estimatedMinutes} Minutes
                  </span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400">Difficulty:</span>
                  <span className="font-bold text-amber-600 dark:text-amber-400 capitalize">{selectedDifficulty}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400">Grounding Corpus:</span>
                  <span className="font-mono text-[11px] text-slate-700 dark:text-slate-300 truncate max-w-[140px]">
                    {activeTopicObj.doc}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-500 dark:text-slate-400">Evidence Weight:</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">0.25 (Bayesian update)</span>
                </div>
              </div>

              {/* Start Assessment CTA */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => onStartQuiz(selectedTopic, selectedCount, selectedDifficulty)}
                  className="w-full py-3.5 px-6 bg-gradient-to-r from-gov-primary via-blue-700 to-gov-secondary hover:from-blue-900 hover:to-blue-800 text-white text-xs font-extrabold rounded-xl shadow-gov-md glow-effect-blue transition-all transform active:scale-[0.99] flex items-center justify-center space-x-2"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Start Assessment ({selectedCount} Questions)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <div className="text-[11px] text-slate-400 dark:text-slate-500 text-center flex items-center justify-center space-x-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Strict MoSPI Grounding • Pydantic Validated</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 2. LOADING STATE (MULTI-PHASE RAG RETRIEVAL)
  // =========================================================================
  if (quizLoading) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-10 border border-blue-200 dark:border-blue-900 text-center shadow-gov-md space-y-6 max-w-2xl mx-auto my-8 animate-fade-in">
        <div className="relative inline-flex">
          <div className="w-20 h-20 rounded-2xl bg-blue-50 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-inner">
            <Sparkles className="w-10 h-10 animate-pulse text-amber-500" />
          </div>
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900 animate-ping" />
        </div>

        <div className="space-y-2">
          <h3 className="font-extrabold text-slate-900 dark:text-white text-xl">
            Synthesizing Grounded Assessment for {selectedTopic}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Generating {selectedCount} multiple-choice questions strictly verified against official statistical curriculum handbooks.
          </p>
        </div>

        {/* Phase Progress Card */}
        <div className="max-w-md mx-auto space-y-2.5 text-xs text-left bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
          <div className="flex items-center space-x-3 text-emerald-600 dark:text-emerald-400 font-medium">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>Phase 1: Retrieving {selectedCount + 2} context chunks from FAISS index</span>
          </div>
          <div className="flex items-center space-x-3 text-blue-600 dark:text-blue-400 font-medium">
            <RefreshCw className="w-4 h-4 animate-spin flex-shrink-0" />
            <span>Phase 2: Gemini 3.6 Flash structured MCQ formulation ({selectedDifficulty})</span>
          </div>
          <div className="flex items-center space-x-3 text-slate-400 dark:text-slate-500">
            <div className="w-4 h-4 rounded-full border border-slate-300 dark:border-slate-600 flex-shrink-0" />
            <span>Phase 3: Validating Pydantic schema & page citations</span>
          </div>
        </div>

        <div className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">
          Model: gemini-3.6-flash • Corpus: {activeTopicObj.doc}
        </div>
      </div>
    );
  }

  // =========================================================================
  // 3. PRE-SUBMISSION REVIEW SCREEN
  // =========================================================================
  if (activeQuiz && inReviewMode && !quizResult) {
    const answeredCount = Object.keys(userAnswers).length;
    const totalCount = activeQuiz.questions.length;
    const unansweredCount = totalCount - answeredCount;

    return (
      <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-gov-md space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                Pre-Submission Verification
              </span>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white mt-0.5">
                Review Assessment: {activeQuiz.topic}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Ensure all questions are answered before committing to the official evidence update ledger.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setInReviewMode(false)}
              className="px-3.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-lg transition-colors flex items-center space-x-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Question View</span>
            </button>
          </div>

          {/* Stats & Unanswered Warning */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 text-center">
              <span className="text-[11px] text-blue-700 dark:text-blue-300 font-bold">Total Questions</span>
              <div className="text-2xl font-extrabold text-blue-900 dark:text-blue-100 mt-0.5">{totalCount}</div>
            </div>
            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-center">
              <span className="text-[11px] text-emerald-700 dark:text-emerald-300 font-bold">Answered</span>
              <div className="text-2xl font-extrabold text-emerald-900 dark:text-emerald-100 mt-0.5">{answeredCount}</div>
            </div>
            <div className={`p-4 rounded-xl border text-center ${
              unansweredCount > 0 
                ? 'bg-amber-50 dark:bg-amber-950/50 border-amber-300 dark:border-amber-700' 
                : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'
            }`}>
              <span className={`text-[11px] font-bold ${unansweredCount > 0 ? 'text-amber-700 dark:text-amber-300' : 'text-slate-500 dark:text-slate-400'}`}>
                Unanswered
              </span>
              <div className={`text-2xl font-extrabold mt-0.5 ${unansweredCount > 0 ? 'text-amber-900 dark:text-amber-100' : 'text-slate-700 dark:text-slate-300'}`}>
                {unansweredCount}
              </div>
            </div>
          </div>

          {unansweredCount > 0 && (
            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 flex items-start space-x-3 text-xs text-amber-900 dark:text-amber-200">
              <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <strong>Notice:</strong> You have {unansweredCount} unanswered question{unansweredCount > 1 ? 's' : ''}. Unanswered questions will receive 0 points in Bayesian evidence calculation. Click on any item below to jump back and answer it.
              </div>
            </div>
          )}

          {/* Question Grid List */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              Question Summary Matrix (Click to Edit)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {activeQuiz.questions.map((q, idx) => {
                const ans = userAnswers[q.id];
                const isAnswered = Boolean(ans);
                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => {
                      setCurrentQuestionIndex(idx);
                      setInReviewMode(false);
                    }}
                    className={`p-3.5 rounded-xl border text-left transition-all flex items-start justify-between gap-3 group ${
                      isAnswered
                        ? 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 hover:border-blue-400'
                        : 'border-amber-300 dark:border-amber-700 bg-amber-50/40 dark:bg-amber-950/30 hover:border-amber-400'
                    }`}
                  >
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-[10px] font-bold flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-1">
                          {q.question}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 pl-7">
                        {isAnswered ? `Selected Option ${ans}: "${q.options[ans as keyof typeof q.options]}"` : '⚠️ Not answered yet'}
                      </p>
                    </div>

                    <div className="flex-shrink-0 pt-0.5">
                      {isAnswered ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                          Option {ans}
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                          Pending
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Final Submit Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-center pt-4 border-t border-slate-100 dark:border-slate-800 gap-3">
            <button
              type="button"
              onClick={() => setInReviewMode(false)}
              className="w-full sm:w-auto px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl transition-colors"
            >
              Continue Assessment
            </button>

            <button
              type="button"
              onClick={onSubmitQuiz}
              disabled={submittingQuiz}
              className="w-full sm:w-auto px-8 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white text-xs font-extrabold rounded-xl shadow-gov-md glow-effect-emerald transition-all flex items-center justify-center space-x-2"
            >
              {submittingQuiz ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Computing Bayesian Update & Gap Closure...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 text-emerald-200" />
                  <span>Confirm & Submit Assessment ({answeredCount}/{totalCount})</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 4. ACTIVE ASSESSMENT INTERFACE (MAANG-LEVEL STEPPER & NAVIGATOR)
  // =========================================================================
  if (activeQuiz && !quizResult && !quizLoading) {
    const questions = activeQuiz.questions;
    const currentQ = questions[currentQuestionIndex];
    const answeredCount = Object.keys(userAnswers).length;
    const totalCount = questions.length;
    const progressPct = Math.round(((currentQuestionIndex + 1) / totalCount) * 100);

    return (
      <div className="space-y-6 animate-fade-in max-w-4xl mx-auto pb-12">
        {/* Top Assessment Header & Live Progress */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-xs font-bold border border-blue-200 dark:border-blue-800">
                  {activeQuiz.topic}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 text-[10px] font-bold uppercase border border-amber-200 dark:border-amber-800">
                  {activeQuiz.difficulty}
                </span>
                <span className="text-xs text-slate-400 hidden sm:inline">•</span>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-mono hidden sm:inline truncate max-w-[200px]">
                  {activeQuiz.sourceDocument}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Official Statistical Cadre Competency Evaluation
              </h2>
            </div>

            {/* Timer & Abort Control */}
            <div className="flex items-center space-x-3 self-end sm:self-auto">
              <div className="flex items-center space-x-1.5 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-mono text-xs font-bold">
                <Clock className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>{formatTimer(elapsedSeconds)}</span>
              </div>

              <button
                type="button"
                onClick={onResetQuiz}
                className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:text-rose-700 px-2.5 py-1 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
              >
                Abort
              </button>
            </div>
          </div>

          {/* Animated Progress Bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-slate-400">
              <span>Question {currentQuestionIndex + 1} of {totalCount}</span>
              <span>{answeredCount} of {totalCount} Answered ({Math.round((answeredCount/totalCount)*100)}%)</span>
            </div>
            <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-600 to-emerald-500 transition-all duration-300 rounded-full"
                style={{ width: `${((currentQuestionIndex + 1) / totalCount) * 100}%` }}
              />
            </div>
          </div>

          {/* Interactive Question Navigator Grid (1..N) */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 mr-1 hidden sm:inline">
              Jump:
            </span>
            {questions.map((q, idx) => {
              const isCurrent = idx === currentQuestionIndex;
              const isAnswered = Boolean(userAnswers[q.id]);
              return (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => setCurrentQuestionIndex(idx)}
                  className={`w-8 h-8 rounded-lg text-xs font-bold transition-all flex items-center justify-center relative ${
                    isCurrent
                      ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-500/50 scale-105'
                      : isAnswered
                      ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                  }`}
                  title={`Question ${idx + 1}: ${isAnswered ? 'Answered' : 'Unanswered'}`}
                >
                  <span>{idx + 1}</span>
                  {isAnswered && !isCurrent && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border border-white dark:border-slate-900" />
                  )}
                </button>
              );
            })}

            <button
              type="button"
              onClick={() => setInReviewMode(true)}
              className="ml-auto text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline px-2 py-1 rounded"
            >
              Review All ({answeredCount}/{totalCount}) →
            </button>
          </div>
        </div>

        {/* Current Question Card */}
        {currentQ && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-gov-md space-y-6 animate-slide-up">
            {/* Question Text & Provenance Meta */}
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="px-2.5 py-1 rounded-lg bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-200 font-extrabold text-xs font-mono">
                  QUESTION #{currentQuestionIndex + 1}
                </span>
                <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
                  Grounded: Page {currentQ.sourcePage}
                </span>
              </div>

              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 leading-relaxed">
                {currentQ.question}
              </h3>
            </div>

            {/* Answer Options (A, B, C, D) */}
            <div className="space-y-3 pt-2">
              {(['A', 'B', 'C', 'D'] as const).map((key) => {
                const isSelected = userAnswers[currentQ.id] === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => onSelectOption(currentQ.id, key)}
                    className={`w-full p-4 rounded-xl text-left text-xs sm:text-sm font-medium border-2 transition-all flex items-start space-x-3.5 group relative ${
                      isSelected
                        ? 'border-blue-600 dark:border-blue-500 bg-blue-50/70 dark:bg-blue-950/60 text-blue-950 dark:text-white font-semibold shadow-sm ring-1 ring-blue-500'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-200'
                    }`}
                  >
                    <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-extrabold flex-shrink-0 transition-colors ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 group-hover:bg-slate-200 dark:group-hover:bg-slate-700'
                    }`}>
                      {key}
                    </span>
                    <span className="leading-relaxed pt-0.5 flex-1">{currentQ.options[key]}</span>
                  </button>
                );
              })}
            </div>

            {/* Micro-Instructions */}
            <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
              <span>Keyboard: Press <strong>A, B, C, D</strong> to select • <strong>← / →</strong> to navigate</span>
              <span>{userAnswers[currentQ.id] ? '✅ Option Selected' : '⚪ Choose an option'}</span>
            </div>

            {/* Stepper Navigation Footer */}
            <div className="flex justify-between items-center pt-2">
              <button
                type="button"
                onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
                disabled={currentQuestionIndex === 0}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-bold transition-all flex items-center space-x-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              <div className="flex items-center space-x-2">
                {currentQuestionIndex < totalCount - 1 ? (
                  <button
                    type="button"
                    onClick={() => setCurrentQuestionIndex((prev) => Math.min(totalCount - 1, prev + 1))}
                    className="px-5 py-2.5 rounded-xl bg-gov-primary dark:bg-blue-600 hover:bg-gov-secondary text-white text-xs font-bold shadow-sm transition-all flex items-center space-x-1.5"
                  >
                    <span>Next Question</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setInReviewMode(true)}
                    className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold shadow-gov-md glow-effect-emerald transition-all flex items-center space-x-1.5"
                  >
                    <span>Review Assessment</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // =========================================================================
  // 5. RESULTS SCREEN & BAYESIAN EVIDENCE UPDATE (POST-SUBMISSION)
  // =========================================================================
  if (quizResult) {
    const accuracy = quizResult.percentage;
    const isPassing = accuracy >= 60;
    const scoreDelta = Number((quizResult.competencyAfter - quizResult.competencyBefore).toFixed(2));
    const gapReduction = Number((quizResult.oldGap - quizResult.newGap).toFixed(2));

    const filteredQuestionResults = quizResult.questionResults.filter(qr => {
      if (resultsFilter === 'correct') return qr.isCorrect;
      if (resultsFilter === 'incorrect') return !qr.isCorrect;
      return true;
    });

    return (
      <div className="space-y-6 animate-fade-in max-w-4xl mx-auto pb-16">
        {/* Executive Score & Competency Banner */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border-2 border-emerald-500/80 dark:border-emerald-500 shadow-gov-lg space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />

          {/* Top Title & Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-5 gap-3">
            <div>
              <div className="inline-flex items-center space-x-1.5 px-3 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 text-xs font-bold mb-2 border border-emerald-200 dark:border-emerald-800">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Bayesian Evidence Recorded • Score Ledger Updated</span>
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                Assessment Results & Competency Impact
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Competency: <strong className="text-slate-800 dark:text-slate-200">{quizResult.competencyName}</strong> • Evidence ID: <code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded font-mono">{quizResult.evidenceId}</code>
              </p>
            </div>

            <button 
              type="button"
              onClick={onResetQuiz}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl transition-colors flex items-center space-x-1.5 self-start sm:self-auto"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Configure New Assessment</span>
            </button>
          </div>

          {/* 4 Performance Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
            {/* 1. Quiz Score */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-center">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Assessment Score</span>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
                {quizResult.score} / {quizResult.totalQuestions}
              </div>
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
                {quizResult.percentage}% Accuracy
              </span>
            </div>

            {/* 2. Competency Update */}
            <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-center">
              <span className="text-[11px] text-blue-700 dark:text-blue-300 font-bold uppercase tracking-wider">Competency Score</span>
              <div className="text-2xl sm:text-3xl font-extrabold text-blue-900 dark:text-blue-100 mt-1">
                {quizResult.competencyBefore} → {quizResult.competencyAfter}
              </div>
              <span className="text-[11px] text-blue-600 dark:text-blue-400 font-bold">
                +{scoreDelta} pts (Target: {quizResult.targetScore})
              </span>
            </div>

            {/* 3. Gap Reduction */}
            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-center">
              <span className="text-[11px] text-amber-700 dark:text-amber-300 font-bold uppercase tracking-wider">Remaining Gap</span>
              <div className="text-2xl sm:text-3xl font-extrabold text-amber-900 dark:text-amber-100 mt-1">
                {quizResult.newGap} pts
              </div>
              <span className="text-[11px] text-amber-600 dark:text-amber-400 font-bold">
                Reduced from {quizResult.oldGap} pts
              </span>
            </div>

            {/* 4. Gap Closed % */}
            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-center">
              <span className="text-[11px] text-emerald-700 dark:text-emerald-300 font-bold uppercase tracking-wider">Gap Closed</span>
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-900 dark:text-emerald-100 mt-1">
                {quizResult.gapClosedPercentage}%
              </div>
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
                Weight: {quizResult.evidenceWeight * 100}%
              </span>
            </div>
          </div>

          {/* Bayesian Model Transparency */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 flex items-start space-x-3">
            <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <strong>Bayesian Competency Ledger Impact:</strong> 
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                Candidate scored {quizResult.score}/{quizResult.totalQuestions} ({quizResult.percentage}%) on official RAG assessment, providing statistical evidence to adjust competency estimate from <strong>{quizResult.competencyBefore}</strong> to <strong>{quizResult.competencyAfter}</strong> (weight {quizResult.evidenceWeight * 100}%).
              </p>
            </div>
          </div>
        </div>

        {/* Question-by-Question Review with Filter Tabs */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center space-x-2">
                <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Question-by-Question Source Attribution & Review</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Every question is verified against official MoSPI reference documentation.
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold">
              <button
                type="button"
                onClick={() => setResultsFilter('all')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  resultsFilter === 'all'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                All ({quizResult.totalQuestions})
              </button>
              <button
                type="button"
                onClick={() => setResultsFilter('correct')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  resultsFilter === 'correct'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-emerald-600 dark:text-emerald-400 hover:text-emerald-700'
                }`}
              >
                Correct ({quizResult.correctCount})
              </button>
              <button
                type="button"
                onClick={() => setResultsFilter('incorrect')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  resultsFilter === 'incorrect'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'text-rose-600 dark:text-rose-400 hover:text-rose-700'
                }`}
              >
                Incorrect ({quizResult.incorrectCount})
              </button>
            </div>
          </div>

          {/* List of Question Reviews */}
          <div className="space-y-4">
            {filteredQuestionResults.map((qr) => {
              const isExpanded = expandedExplanationId === qr.questionId;
              return (
                <div 
                  key={qr.questionId}
                  className={`p-5 rounded-xl border transition-all space-y-3 ${
                    qr.isCorrect 
                      ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/60' 
                      : 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-xs text-slate-500 dark:text-slate-400 font-mono">
                          Q#{qr.questionNumber}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          qr.isCorrect 
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' 
                            : 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                        }`}>
                          {qr.isCorrect ? 'CORRECT (+1)' : 'INCORRECT (0)'}
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 leading-snug">
                        {qr.question}
                      </h4>
                    </div>
                  </div>

                  {/* Answers Comparison */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div className={`p-2.5 rounded-lg border ${
                      qr.isCorrect 
                        ? 'bg-white dark:bg-slate-850 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200' 
                        : 'bg-white dark:bg-slate-850 border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200'
                    }`}>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                        Your Answer ({qr.userAnswer}):
                      </span>
                      <span className="font-semibold">{qr.options[qr.userAnswer as keyof typeof qr.options] || 'Unanswered'}</span>
                    </div>

                    {!qr.isCorrect && (
                      <div className="p-2.5 rounded-lg border bg-white dark:bg-slate-850 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block mb-0.5">
                          Correct Answer ({qr.correctAnswer}):
                        </span>
                        <span className="font-semibold">{qr.options[qr.correctAnswer as keyof typeof qr.options]}</span>
                      </div>
                    )}
                  </div>

                  {/* Official Grounded Rationale */}
                  <div className="bg-white/90 dark:bg-slate-850/90 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5 text-xs">
                    <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center space-x-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Official Curriculum Rationale:</span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px]">
                      {qr.explanation}
                    </p>
                  </div>

                  {/* Citation Provenance Tag */}
                  <div className="text-[10px] text-slate-400 dark:text-slate-500 font-mono flex items-center justify-between flex-wrap gap-1 pt-1">
                    <span>Source: <strong>{qr.sourceDocument}</strong> (Page {qr.sourcePage})</span>
                    <span>Chunk ID: {qr.sourceChunkId}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Next Recommended Learning Step */}
        {quizResult.nextRecommendations && quizResult.nextRecommendations.length > 0 && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-blue-950 rounded-2xl p-6 border border-blue-200 dark:border-blue-800 shadow-sm space-y-4">
            <div className="flex items-center space-x-2">
              <Award className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                Next Recommended Learning Step (Post-Assessment Optimization)
              </h3>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-blue-200 dark:border-blue-700 flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center">
              <div className="space-y-1 max-w-xl">
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                    {quizResult.nextRecommendations[0].resource?.sourceCategory || quizResult.nextRecommendations[0].resource?.source}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    Match Relevance: <strong>{quizResult.nextRecommendations[0].matchScore}/100</strong>
                  </span>
                </div>
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                  {quizResult.nextRecommendations[0].resource?.title}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {quizResult.nextRecommendations[0].rationale}
                </p>
              </div>

              <button 
                type="button"
                onClick={() => onStartQuiz(quizResult.nextRecommendations[0].resource?.competencyName || 'AI/ML', 5, 'medium')}
                className="px-5 py-2.5 bg-gov-primary dark:bg-blue-600 hover:bg-gov-secondary text-white text-xs font-bold rounded-xl shadow-sm whitespace-nowrap flex items-center space-x-1.5"
              >
                <span>Assess Next Skill</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
}
