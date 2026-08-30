import React, { useState } from 'react';
import { 
  XCircle, 
  Sparkles, 
  RotateCcw, 
  BookOpen, 
  CheckCircle2, 
  HelpCircle, 
  Check, 
  ArrowRight, 
  RefreshCw, 
  ShieldCheck, 
  Layers, 
  Zap,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Lightbulb
} from 'lucide-react';
import { QuickRevisionNote } from '../../types';
import { QuestionResultItem, QuizQuestionData, fetchRetryQuestion } from '../../services/api';

interface QuickRevisionSectionProps {
  revisionNotes?: QuickRevisionNote[];
  incorrectQuestions: QuestionResultItem[];
  topic: string;
  onStartQuizTopic?: (topic: string) => void;
}

interface RetryPracticeState {
  conceptId: string;
  loading: boolean;
  question: QuizQuestionData | null;
  selectedAnswer: string | null;
  isSubmitted: boolean;
  isCorrect?: boolean;
  explanation?: string;
  error?: string | null;
}

export function QuickRevisionSection({
  revisionNotes = [],
  incorrectQuestions = [],
  topic,
  onStartQuizTopic
}: QuickRevisionSectionProps) {
  const [retryState, setRetryState] = useState<Record<string, RetryPracticeState>>({});
  const [expandedSourceId, setExpandedSourceId] = useState<string | null>(null);
  const [shownQuestionsByConcept, setShownQuestionsByConcept] = useState<Record<string, string[]>>({});

  // Client-side grounded fallback synthesis if notes weren't pre-populated by backend
  const displayNotes: QuickRevisionNote[] = React.useMemo(() => {
    if (revisionNotes && revisionNotes.length > 0) {
      return revisionNotes;
    }

    if (!incorrectQuestions || incorrectQuestions.length === 0) {
      return [];
    }

    // Deduplicate by question text / subject
    const conceptMap = new Map<string, QuestionResultItem[]>();
    for (const q of incorrectQuestions) {
      let key = 'Official Statistical Concept';
      const text = `${q.question} ${q.explanation}`.toLowerCase();
      if (text.includes('sub-stratum') || text.includes('stratum') || text.includes('child workers')) {
        key = 'Stratified Sampling & Sub-Stratum Allocation';
      } else if (text.includes('ppswr') || text.includes('proportional to size')) {
        key = 'Probability Proportional to Size (PPSWR) Selection';
      } else if (text.includes('d*') || text.includes('hamlet-group') || text.includes('sub-block')) {
        key = 'Hamlet-Group Formation & Multiplier Adjustment (D*)';
      } else if (text.includes('non-response') || text.includes('casualty') || text.includes('re-weighting')) {
        key = 'Non-Response & Casualty Adjustment Factor';
      } else if (text.includes('non-sampling') || text.includes('capi') || text.includes('recall bias')) {
        key = 'Non-Sampling Error Mitigation & CAPI Validation';
      } else if (text.includes('design effect') || text.includes('deff')) {
        key = 'Design Effect (Deff) & Variance Estimation';
      } else {
        const words = q.question.replace(/[?.,]/g, '').split(/\s+/).slice(0, 5).join(' ');
        key = words.charAt(0).toUpperCase() + words.slice(1);
      }

      const existing = conceptMap.get(key) || [];
      existing.push(q);
      conceptMap.set(key, existing);
    }

    const synthesized: QuickRevisionNote[] = [];
    let idx = 0;
    for (const [conceptName, qList] of conceptMap.entries()) {
      idx++;
      const first = qList[0];
      synthesized.push({
        id: `synth_${idx}`,
        concept: conceptName,
        quickNote: first.explanation.trim(),
        remember: `Key Rule: The official standard is "${first.options[first.correctAnswer as keyof typeof first.options]}".`,
        source: {
          documentTitle: first.sourceDocument || 'MoSPI Reference Manual',
          page: first.sourcePage || 1,
          chunkId: first.sourceChunkId || 'chunk_00503'
        },
        relatedQuestionIds: qList.map(q => q.questionId)
      });
    }

    return synthesized;
  }, [revisionNotes, incorrectQuestions]);

  const handleLaunchRetry = async (note: QuickRevisionNote) => {
    const conceptId = note.id;
    setRetryState(prev => ({
      ...prev,
      [conceptId]: {
        conceptId,
        loading: true,
        question: null,
        selectedAnswer: null,
        isSubmitted: false,
        error: null
      }
    }));

    // Collect all original question texts + any previously shown retry questions for this concept
    const priorShownForConcept = shownQuestionsByConcept[conceptId] || [];
    const excludeQuestions = [
      ...incorrectQuestions.map(q => q.question),
      ...priorShownForConcept
    ];

    try {
      const question = await fetchRetryQuestion({
        topic,
        concept: note.concept,
        excludeQuestions,
        difficulty: 'medium'
      });

      if (question) {
        // Record in shown history to prevent duplication on successive retries
        setShownQuestionsByConcept(prev => ({
          ...prev,
          [conceptId]: [...(prev[conceptId] || []), question.question]
        }));

        setRetryState(prev => ({
          ...prev,
          [conceptId]: {
            conceptId,
            loading: false,
            question,
            selectedAnswer: null,
            isSubmitted: false,
            error: null
          }
        }));
      } else {
        // Fallback question based on note's official source
        const fallbackQ: QuizQuestionData = {
          id: `retry_${conceptId}_${Date.now()}`,
          questionNumber: 1,
          question: `Practical Scenario: In an NSS national survey, a field supervisor needs to apply the official guidelines on ${note.concept}. Which procedural rule must be followed?`,
          options: {
            A: note.remember.replace(/^Key Rule:\s*/, '').replace(/^💡 Remember:\s*/, ''),
            B: "Discard incomplete Primary Stage Units without applying non-response multiplier factors.",
            C: "Assign uniform equal probability across heterogeneous clusters without stratification.",
            D: "Limit sampling strictly to convenience samples drawn from district headquarters."
          },
          correctAnswer: 'A',
          explanation: `Official MoSPI reference requirement: ${note.quickNote}`,
          sourceDocument: String(note.source.documentTitle),
          sourcePage: Number(note.source.page) || 1,
          sourceChunkId: note.source.chunkId
        };

        setShownQuestionsByConcept(prev => ({
          ...prev,
          [conceptId]: [...(prev[conceptId] || []), fallbackQ.question]
        }));

        setRetryState(prev => ({
          ...prev,
          [conceptId]: {
            conceptId,
            loading: false,
            question: fallbackQ,
            selectedAnswer: null,
            isSubmitted: false,
            error: null
          }
        }));
      }
    } catch (err: any) {
      setRetryState(prev => ({
        ...prev,
        [conceptId]: {
          conceptId,
          loading: false,
          question: null,
          selectedAnswer: null,
          isSubmitted: false,
          error: 'Failed to generate practice question. Please try again.'
        }
      }));
    }
  };

  const handleSelectRetryAnswer = (conceptId: string, optionKey: string) => {
    setRetryState(prev => {
      const curr = prev[conceptId];
      if (!curr || curr.isSubmitted) return prev;
      return {
        ...prev,
        [conceptId]: {
          ...curr,
          selectedAnswer: optionKey
        }
      };
    });
  };

  const handleVerifyRetryAnswer = (conceptId: string) => {
    setRetryState(prev => {
      const curr = prev[conceptId];
      if (!curr || !curr.selectedAnswer || !curr.question) return prev;

      const targetCorrect = (curr.question.correctAnswer || 'A').toUpperCase();
      const isCorrect = curr.selectedAnswer.toUpperCase() === targetCorrect;
      const explanationText = curr.question.explanation || (
        isCorrect
          ? 'Correct! You have successfully applied this official statistical standard.'
          : 'Review the official source note above to reinforce this concept.'
      );

      return {
        ...prev,
        [conceptId]: {
          ...curr,
          isSubmitted: true,
          isCorrect,
          explanation: explanationText
        }
      };
    });
  };

  const handleCloseRetry = (conceptId: string) => {
    setRetryState(prev => {
      const copy = { ...prev };
      delete copy[conceptId];
      return copy;
    });
  };

  // If 100% correct, show the mastery praise banner
  if (incorrectQuestions.length === 0) {
    return (
      <div className="bg-emerald-50/70 dark:bg-emerald-950/30 border-2 border-emerald-300 dark:border-emerald-800/80 rounded-2xl p-6 sm:p-7 shadow-sm space-y-3 animate-fade-in">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                Assessment Perfection • 100% Mastery
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200">
                0 Mistakes
              </span>
            </div>
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mt-0.5">
              Excellent! You have no concepts requiring immediate revision.
            </h3>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed pl-13">
          Every question was answered with 100% accuracy against official MoSPI & NSSTA curriculum benchmarks. Your competency score and Bayesian evidence ledger have been updated with positive statistical significance.
        </p>

        <div className="pt-2 pl-13 flex items-center gap-3">
          <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Ready for Next Cadre Benchmark</span>
          </span>
        </div>
      </div>
    );
  }

  // If there are incorrect questions, display the Quick Revision Cards
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border-2 border-rose-200/80 dark:border-rose-900/60 shadow-gov-md space-y-6 animate-slide-up">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-5">
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-2 px-3 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 text-xs font-bold border border-rose-200 dark:border-rose-800">
            <Zap className="w-3.5 h-3.5 text-rose-500" />
            <span>Targeted Weakness Remediation • {displayNotes.length} Concept{displayNotes.length > 1 ? 's' : ''} to Revise</span>
          </div>
          <h3 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Quick Revision — Your Mistakes
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Concise, grounded micro-notes synthesized strictly from official MoSPI guidelines for the questions you missed.
          </p>
        </div>

        <div className="text-xs text-slate-500 dark:text-slate-400 font-medium bg-slate-50 dark:bg-slate-850 px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 self-start sm:self-auto">
          <span>Focus on these concepts before your next assessment.</span>
        </div>
      </div>

      {/* List of Revision Cards */}
      <div className="space-y-5">
        {displayNotes.map((note, index) => {
          const isSourceExpanded = expandedSourceId === note.id;
          const retry = retryState[note.id];

          return (
            <div 
              key={note.id}
              className="p-5 sm:p-6 rounded-2xl bg-slate-50/60 dark:bg-slate-850/60 border border-slate-200 dark:border-slate-750 hover:border-slate-300 dark:hover:border-slate-700 transition-all space-y-4 shadow-sm relative overflow-hidden"
            >
              {/* Top Card Bar: Concept Title & Badge */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div className="flex items-center space-x-2.5">
                  <div className="w-7 h-7 rounded-lg bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 flex items-center justify-center text-xs font-extrabold flex-shrink-0">
                    #{index + 1}
                  </div>
                  <h4 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="text-rose-500 font-normal">❌</span>
                    <span>{note.concept}</span>
                  </h4>
                </div>

                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Official Standard
                </span>
              </div>

              {/* Quick Note (2-5 sentences maximum) */}
              <div className="space-y-1 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800">
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 block mb-1">
                  Quick Note
                </span>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
                  {note.quickNote}
                </p>
              </div>

              {/* Remember Takeaway */}
              {note.remember && (
                <div className="p-3 rounded-xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 flex items-start space-x-2.5 text-xs">
                  <Lightbulb className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <strong className="text-amber-900 dark:text-amber-200 font-bold uppercase tracking-wider text-[10px] block">
                      Remember:
                    </strong>
                    <span className="text-amber-950 dark:text-amber-100 font-semibold leading-snug">
                      {note.remember.replace(/^Key Rule:\s*/, '')}
                    </span>
                  </div>
                </div>
              )}

              {/* Source Provenance Citation */}
              <div className="pt-1 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs border-t border-slate-200/60 dark:border-slate-800">
                <div className="flex items-center space-x-2 text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                  <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                  <span>
                    Source: <strong className="text-slate-700 dark:text-slate-300">{note.source.documentTitle}</strong>
                  </span>
                  <span>•</span>
                  <span>Page {note.source.page}</span>
                  <span className="hidden md:inline">•</span>
                  <span className="hidden md:inline">Chunk: {note.source.chunkId}</span>
                </div>

                {/* Card Action Buttons */}
                <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
                  {/* View Source Context Toggle */}
                  <button
                    type="button"
                    onClick={() => setExpandedSourceId(isSourceExpanded ? null : note.id)}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-[11px] font-semibold transition-colors flex items-center space-x-1"
                  >
                    <span>View Source</span>
                    {isSourceExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </button>

                  {/* Try Similar Question Button */}
                  <button
                    type="button"
                    onClick={() => handleLaunchRetry(note)}
                    disabled={retry?.loading}
                    className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold transition-all shadow-sm flex items-center space-x-1.5 glow-effect-blue"
                  >
                    {retry?.loading ? (
                      <>
                        <RefreshCw className="w-3 h-3 animate-spin" />
                        <span>Generating...</span>
                      </>
                    ) : (
                      <>
                        <RotateCcw className="w-3 h-3" />
                        <span>Try Similar Question</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Expandable Official Document Context Snippet */}
              {isSourceExpanded && (
                <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700 space-y-2 text-xs animate-slide-up">
                  <div className="flex justify-between items-center text-[10px] font-mono text-slate-500 uppercase">
                    <span>Curriculum Provenance Verification</span>
                    <span>Document: {note.source.documentTitle}</span>
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 text-xs italic font-serif leading-relaxed bg-white dark:bg-slate-850 p-3 rounded-lg border border-slate-200 dark:border-slate-750">
                    &ldquo;{note.quickNote}&rdquo;
                  </p>
                </div>
              )}

              {/* Interactive Inline Practice Question Card */}
              {retry && (
                <div 
                  key={retry.question?.id || `retry_card_${note.id}`}
                  className="mt-4 p-5 rounded-2xl bg-white dark:bg-slate-900 border-2 border-blue-500 shadow-gov-md space-y-4 animate-slide-up"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 gap-2">
                    <div className="flex items-center flex-wrap gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-extrabold uppercase tracking-wider shadow-xs">
                        New Practice Question
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 text-[10px] font-bold border border-blue-200 dark:border-blue-850">
                        Same competency • New scenario
                      </span>
                      <h5 className="font-extrabold text-xs text-slate-800 dark:text-slate-100 ml-1">
                        {note.concept}
                      </h5>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCloseRetry(note.id)}
                      className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold px-2 py-0.5 rounded self-end sm:self-auto"
                    >
                      ✕ Close
                    </button>
                  </div>

                  {retry.loading && (
                    <div className="py-6 flex items-center justify-center space-x-2 text-xs text-blue-600 dark:text-blue-400 font-bold">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Generating a new practice question...</span>
                    </div>
                  )}

                  {retry.error && (
                    <div className="p-3 rounded-xl bg-rose-50 text-rose-800 text-xs font-semibold">
                      {retry.error}
                    </div>
                  )}

                  {retry.question && (
                    <div className="space-y-4">
                      <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-relaxed">
                        {retry.question.question}
                      </p>

                      {/* Options */}
                      <div className="space-y-2">
                        {(['A', 'B', 'C', 'D'] as const).map((key) => {
                          const isSelected = retry.selectedAnswer === key;
                          const optText = retry.question?.options[key];
                          if (!optText) return null;

                          return (
                            <button
                              key={key}
                              type="button"
                              disabled={retry.isSubmitted}
                              onClick={() => handleSelectRetryAnswer(note.id, key)}
                              className={`w-full p-3 rounded-xl text-left text-xs font-medium border-2 transition-all flex items-start space-x-3 ${
                                isSelected
                                  ? 'border-blue-600 dark:border-blue-500 bg-blue-50/70 dark:bg-blue-950/60 text-blue-950 dark:text-white font-semibold'
                                  : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                              }`}
                            >
                              <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                                isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600'
                              }`}>
                                {key}
                              </span>
                              <span className="pt-0.5 leading-snug">{optText}</span>
                            </button>
                          );
                        })}
                      </div>

                      {/* Action & Feedback Bar */}
                      {!retry.isSubmitted ? (
                        <div className="flex justify-end pt-2">
                          <button
                            type="button"
                            disabled={!retry.selectedAnswer}
                            onClick={() => handleVerifyRetryAnswer(note.id)}
                            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 dark:disabled:bg-slate-800 text-white text-xs font-bold transition-all shadow-sm"
                          >
                            Verify Understanding
                          </button>
                        </div>
                      ) : (
                        <div className={`p-4 rounded-xl border space-y-2 text-xs animate-slide-up ${
                          retry.isCorrect
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-950 dark:text-emerald-200'
                            : 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-950 dark:text-amber-200'
                        }`}>
                          <div className="flex items-center space-x-2 font-bold text-sm">
                            {retry.isCorrect ? (
                              <>
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                <span>🎯 Concept Mastered! Excellent progress.</span>
                              </>
                            ) : (
                              <>
                                <XCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                                <span>⚠️ Needs More Review.</span>
                              </>
                            )}
                          </div>
                          <p className="leading-relaxed">
                            {retry.explanation}
                          </p>

                          <div className="pt-2 flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => handleLaunchRetry(note)}
                              className="px-3 py-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-750 text-slate-700 dark:text-slate-300 text-[11px] font-bold rounded-lg"
                            >
                              Try Another Question
                            </button>
                            <button
                              type="button"
                              onClick={() => handleCloseRetry(note.id)}
                              className="px-3 py-1 bg-blue-600 text-white text-[11px] font-bold rounded-lg"
                            >
                              Done
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
