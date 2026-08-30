import React, { useState } from 'react';
import { 
  Sparkles, 
  BookOpen, 
  CheckCircle2, 
  ArrowRight, 
  FileText, 
  Award, 
  HelpCircle,
  AlertCircle,
  TrendingUp,
  RefreshCw
} from 'lucide-react';
import { GeneratedQuizResponse, QuizSubmissionResponse } from '../services/api';

interface AssessmentViewProps {
  activeQuiz: GeneratedQuizResponse | null;
  quizLoading: boolean;
  submittingQuiz: boolean;
  quizResult: QuizSubmissionResponse['data'] | null;
  userAnswers: Record<string, string>;
  onStartQuiz: (topic: string) => void;
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
  const [selectedTopic, setSelectedTopic] = useState<string>('Sampling');

  const topics = [
    { name: 'Sampling', doc: 'Sampling Design.pdf', badge: 'Critical Gap (Primary Demo)' },
    { name: 'Data Quality', doc: 'Data Quality.pdf', badge: 'MoSPI Framework' },
    { name: 'Survey Design', doc: 'Sampling + Survey Methodology.pdf', badge: 'Methodology' }
  ];

  return (
    <div className="space-y-6">
      {/* 1. Assessment Launcher / Setup (When no quiz is active and no results) */}
      {!activeQuiz && !quizResult && !quizLoading && (
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-gov-sm space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-2 border border-blue-200">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>RAG Grounded Assessment Engine</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900">Official Statistical Competency Assessment</h2>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl">
              Generates multiple-choice assessments strictly grounded in official MoSPI reference handbooks using FAISS semantic retrieval and Gemini 3.6 Flash.
            </p>
          </div>

          {/* Topic Selection */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Select Competency to Assess:
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {topics.map(t => (
                <button
                  key={t.name}
                  type="button"
                  onClick={() => setSelectedTopic(t.name)}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    selectedTopic === t.name
                      ? 'border-blue-500 bg-blue-50/60 shadow-sm'
                      : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100/60'
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-bold text-sm text-slate-900">{t.name}</span>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">
                      {t.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-mono">
                    Corpus: {t.doc}
                  </p>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={() => onStartQuiz(selectedTopic)}
              className="px-6 py-3 bg-gov-primary hover:bg-gov-secondary text-white text-xs font-bold rounded-xl shadow-gov-md transition-all flex items-center space-x-2"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Generate Grounded Assessment for {selectedTopic}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 2. Loading State */}
      {quizLoading && (
        <div className="bg-white rounded-xl p-8 border border-blue-200 text-center shadow-gov-sm space-y-4">
          <div className="inline-block p-3.5 rounded-full bg-blue-50 text-blue-600 animate-pulse">
            <Sparkles className="w-8 h-8" />
          </div>
          <h3 className="font-bold text-slate-800 text-base">Retrieving Source Material & Generating Questions</h3>
          <div className="max-w-md mx-auto space-y-1.5 text-xs text-slate-600">
            <div className="flex items-center space-x-2 justify-center text-emerald-600 font-medium">
              <CheckCircle2 className="w-4 h-4" />
              <span>Querying precomputed FAISS index (363 chunks)</span>
            </div>
            <div className="flex items-center space-x-2 justify-center text-blue-600 font-medium">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Formulating strictly grounded MCQs via Gemini 3.6 Flash</span>
            </div>
            <p className="text-[11px] text-slate-400 pt-1">
              Enforcing Pydantic schema validation and document page citations.
            </p>
          </div>
        </div>
      )}

      {/* 3. Interactive Quiz Form */}
      {activeQuiz && !quizResult && !quizLoading && (
        <div className="bg-white rounded-xl p-6 border-2 border-blue-500 shadow-gov-md space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-2">
            <div>
              <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-1 border border-blue-200">
                <BookOpen className="w-3 h-3" />
                <span>Grounded Assessment: {activeQuiz.topic}</span>
              </div>
              <h2 className="font-bold text-slate-900 text-lg">Official Statistical Cadre Competency Evaluation</h2>
              <p className="text-xs text-slate-500">
                Grounding Document: <strong>{activeQuiz.sourceDocument}</strong> • {activeQuiz.totalQuestions} Questions
              </p>
            </div>

            <button 
              onClick={onResetQuiz}
              className="text-xs text-slate-400 hover:text-slate-600 font-semibold self-start sm:self-auto"
            >
              Cancel Assessment
            </button>
          </div>

          {/* Question Cards */}
          <div className="space-y-6">
            {activeQuiz.questions.map((q) => (
              <div key={q.id} className="p-4 sm:p-5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold text-slate-900 text-sm leading-relaxed">
                    <span className="text-blue-600 mr-1.5">Q{q.questionNumber}.</span>
                    {q.question}
                  </h3>
                  <span className="text-[10px] font-mono text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200 whitespace-nowrap">
                    Page {q.sourcePage}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  {(['A', 'B', 'C', 'D'] as const).map((key) => {
                    const isSelected = userAnswers[q.id] === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => onSelectOption(q.id, key)}
                        className={`p-3 rounded-lg text-left text-xs font-medium border transition-all flex items-start space-x-2.5 ${
                          isSelected 
                            ? 'bg-blue-50 border-blue-500 text-blue-950 font-semibold shadow-sm ring-1 ring-blue-500' 
                            : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                        }`}
                      >
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${
                          isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {key}
                        </span>
                        <span className="leading-snug">{q.options[key]}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Submit Action */}
          <div className="flex flex-col sm:flex-row justify-between items-center pt-3 border-t border-slate-100 gap-3">
            <span className="text-xs text-slate-500">
              Answered <strong>{Object.keys(userAnswers).length}</strong> of <strong>{activeQuiz.questions.length}</strong> questions
            </span>

            <button
              onClick={onSubmitQuiz}
              disabled={submittingQuiz || Object.keys(userAnswers).length < activeQuiz.questions.length}
              className="w-full sm:w-auto px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white text-xs font-bold rounded-lg shadow-sm transition-colors flex items-center justify-center space-x-2"
            >
              <span>{submittingQuiz ? 'Evaluating & Updating Competency...' : 'Submit Answers for Evidence Update'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 4. Results Screen & Competency Evidence Update */}
      {quizResult && (
        <div className="bg-white rounded-xl p-6 border-2 border-emerald-500 shadow-gov-lg space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-2">
            <div>
              <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold mb-1 border border-emerald-200">
                <CheckCircle2 className="w-3 h-3" />
                <span>Competency Evidence Recorded</span>
              </div>
              <h2 className="font-bold text-slate-900 text-lg">Assessment Results & Evidence-Based Gap Closure</h2>
              <p className="text-xs text-slate-500">
                Competency: <strong>{quizResult.competencyName}</strong> • Evidence Record: <code>{quizResult.evidenceId}</code>
              </p>
            </div>

            <button 
              onClick={onResetQuiz}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg self-start sm:self-auto transition-colors"
            >
              Take Another Assessment
            </button>
          </div>

          {/* 4 Score Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
              <span className="text-[11px] text-slate-500 font-medium">Quiz Score</span>
              <div className="text-2xl font-bold text-slate-900 mt-1">
                {quizResult.score}/{quizResult.totalQuestions}
              </div>
              <span className="text-[10px] text-emerald-600 font-bold">{quizResult.percentage}% Accuracy</span>
            </div>

            <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-center">
              <span className="text-[11px] text-blue-700 font-medium">Competency Update</span>
              <div className="text-2xl font-bold text-blue-900 mt-1">
                {quizResult.competencyBefore} → {quizResult.competencyAfter}
              </div>
              <span className="text-[10px] text-blue-600 font-bold">
                +{(quizResult.competencyAfter - quizResult.competencyBefore).toFixed(2)} pts (Target: {quizResult.targetScore})
              </span>
            </div>

            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-center">
              <span className="text-[11px] text-amber-700 font-medium">Remaining Gap</span>
              <div className="text-2xl font-bold text-amber-900 mt-1">
                {quizResult.newGap} pts
              </div>
              <span className="text-[10px] text-amber-600 font-bold">Reduced from {quizResult.oldGap} pts</span>
            </div>

            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
              <span className="text-[11px] text-emerald-700 font-medium">Estimated Gap Closed</span>
              <div className="text-2xl font-bold text-emerald-900 mt-1">
                {quizResult.gapClosedPercentage}%
              </div>
              <span className="text-[10px] text-emerald-600 font-bold">Conservative Model (Weight 0.25)</span>
            </div>
          </div>

          {/* Question-by-Question Review */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-1.5">
              <FileText className="w-4 h-4 text-blue-600" />
              <span>Official Source Grounding & Attribution</span>
            </h3>

            {quizResult.questionResults.map((qr) => (
              <div 
                key={qr.questionId}
                className={`p-4 rounded-xl border text-xs space-y-2.5 ${
                  qr.isCorrect 
                    ? 'bg-emerald-50/40 border-emerald-200' 
                    : 'bg-rose-50/40 border-rose-200'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="font-semibold text-slate-900">
                    <span className="mr-1">Q{qr.questionNumber}.</span>
                    {qr.question}
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    qr.isCorrect ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                  }`}>
                    {qr.isCorrect ? 'CORRECT (+1)' : 'INCORRECT (0)'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>Your Answer: <strong>Option {qr.userAnswer}</strong></div>
                  <div>Correct Answer: <strong className="text-emerald-700">Option {qr.correctAnswer}</strong></div>
                </div>

                <div className="bg-white/90 p-3 rounded-lg border border-slate-200 text-slate-700 text-[11px] leading-relaxed">
                  <strong>Official Rationale:</strong> {qr.explanation}
                </div>

                <div className="text-[10px] text-slate-400 font-mono flex items-center space-x-1">
                  <span>Grounding Document:</span>
                  <strong className="text-slate-600">{qr.sourceDocument}</strong>
                  <span>(Page {qr.sourcePage}, Chunk ID: {qr.sourceChunkId})</span>
                </div>
              </div>
            ))}
          </div>

          {/* Next Recommended Learning Resource */}
          {quizResult.nextRecommendations && quizResult.nextRecommendations.length > 0 && (
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-1.5">
                <Award className="w-4 h-4 text-emerald-600" />
                <span>Next Recommended Learning Resource (Post Gap-Closure Recalculation)</span>
              </h3>

              <div className="p-4 rounded-xl border border-emerald-300 bg-emerald-50/40 flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                      {quizResult.nextRecommendations[0].resource?.sourceCategory || quizResult.nextRecommendations[0].resource?.source}
                    </span>
                    <span className="text-xs text-slate-500">
                      Match Score: <strong>{quizResult.nextRecommendations[0].matchScore}/100</strong>
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">
                    {quizResult.nextRecommendations[0].resource?.title}
                  </h4>
                  <p className="text-xs text-slate-600">
                    {quizResult.nextRecommendations[0].rationale}
                  </p>
                </div>
                <button 
                  onClick={() => onStartQuiz(quizResult.nextRecommendations[0].resource?.competencyName || 'AI/ML')}
                  className="px-4 py-2 bg-gov-primary hover:bg-gov-secondary text-white text-xs font-bold rounded-lg shadow-sm whitespace-nowrap"
                >
                  Start Next Assessment
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
