import axios from 'axios';
import { QuestionSubmissionResult, QuickRevisionNote } from '../types';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

export class RevisionService {
  /**
   * Generates grounded, deduplicated quick revision notes for incorrect questions.
   */
  static async generateRevisionNotes(
    incorrectQuestions: QuestionSubmissionResult[],
    topic: string = 'Sampling'
  ): Promise<QuickRevisionNote[]> {
    if (!incorrectQuestions || incorrectQuestions.length === 0) {
      return [];
    }

    // Deduplicate questions by underlying concept/key subject
    const conceptMap = new Map<string, QuestionSubmissionResult[]>();

    for (const q of incorrectQuestions) {
      const conceptKey = this.extractConceptKey(q);
      const existing = conceptMap.get(conceptKey) || [];
      existing.push(q);
      conceptMap.set(conceptKey, existing);
    }

    const revisionNotes: QuickRevisionNote[] = [];

    // Attempt AI Service generation for enhanced notes if online
    try {
      const payloadMistakes = Array.from(conceptMap.entries()).map(([conceptName, questions]) => ({
        concept: conceptName,
        questions: questions.map(q => ({
          question: q.question,
          userAnswer: q.userAnswer,
          correctAnswer: q.correctAnswer,
          correctText: q.options[q.correctAnswer as keyof typeof q.options],
          explanation: q.explanation,
          sourceDocument: q.sourceDocument,
          sourcePage: q.sourcePage,
          sourceChunkId: q.sourceChunkId
        }))
      }));

      const res = await axios.post(
        `${AI_SERVICE_URL}/quiz/revision-notes`,
        { mistakes: payloadMistakes, topic },
        { timeout: 8000 }
      );

      if (res.data && Array.isArray(res.data.notes) && res.data.notes.length > 0) {
        return res.data.notes.map((n: any, idx: number) => ({
          id: `rev_${Date.now()}_${idx}`,
          concept: n.concept || 'Statistical Concept',
          quickNote: n.quickNote || n.note || '',
          remember: n.remember || '',
          source: {
            documentTitle: n.source?.documentTitle || n.sourceDocument || 'MoSPI Reference Manual',
            page: n.source?.page || n.sourcePage || 1,
            chunkId: n.source?.chunkId || n.sourceChunkId || 'chunk_default'
          },
          relatedQuestionIds: n.relatedQuestionIds || []
        }));
      }
    } catch {
      // Graceful fallback to deterministic grounded note synthesis
    }

    // Deterministic grounded synthesis using official question rationale & metadata
    let noteIndex = 0;
    for (const [conceptName, questions] of conceptMap.entries()) {
      noteIndex++;
      const primaryQ = questions[0];
      const note = this.synthesizeGroundedNote(conceptName, questions);

      revisionNotes.push({
        id: `rev_${Date.now()}_${noteIndex}`,
        concept: conceptName,
        quickNote: note.quickNote,
        remember: note.remember,
        source: {
          documentTitle: primaryQ.sourceDocument || 'MoSPI Reference Manual: Sample Design and Estimation Procedures',
          page: primaryQ.sourcePage || 1,
          chunkId: primaryQ.sourceChunkId || 'chunk_00503'
        },
        relatedQuestionIds: questions.map(q => q.questionId)
      });
    }

    return revisionNotes;
  }

  /**
   * Infers concept key from question text and official explanation for deduplication.
   */
  private static extractConceptKey(q: QuestionSubmissionResult): string {
    const text = `${q.question} ${q.explanation}`.toLowerCase();

    if (text.includes('sub-stratum') || text.includes('stratum') || text.includes('child workers')) {
      return 'Stratified Sampling & Sub-Stratum Allocation';
    }
    if (text.includes('ppswr') || text.includes('proportional to size') || text.includes('selection of sample villages')) {
      return 'Probability Proportional to Size (PPSWR) Selection';
    }
    if (text.includes('d*') || text.includes('hamlet-group') || text.includes('sub-block')) {
      return 'Hamlet-Group Formation & Multiplier Adjustment (D*)';
    }
    if (text.includes('non-response') || text.includes('casualty') || text.includes('re-weighting')) {
      return 'Non-Response & Casualty Adjustment Factor';
    }
    if (text.includes('non-sampling') || text.includes('capi') || text.includes('recall bias') || text.includes('measurement')) {
      return 'Non-Sampling Error Mitigation & CAPI Validation';
    }
    if (text.includes('design effect') || text.includes('deff') || text.includes('variance')) {
      return 'Design Effect (Deff) & Variance Estimation';
    }
    if (text.includes('python') || text.includes('pandas') || text.includes('data quality')) {
      return 'Automated Microdata Validation & Wrangling';
    }
    if (text.includes('gdp') || text.includes('national accounts') || text.includes('gva')) {
      return 'Gross Value Added (GVA) & National Accounts Compilation';
    }

    // Default concept extraction from first 6 words of question
    const words = q.question.replace(/[?.,]/g, '').split(/\s+/).slice(0, 5).join(' ');
    return words.charAt(0).toUpperCase() + words.slice(1);
  }

  /**
   * Synthesizes short, 2-5 sentence grounded note with a memorable takeaway.
   */
  private static synthesizeGroundedNote(
    conceptName: string,
    questions: QuestionSubmissionResult[]
  ): { quickNote: string; remember: string } {
    const primaryQ = questions[0];
    const cleanExpl = primaryQ.explanation.trim();

    // Map known official concepts to high-impact concise summaries
    if (conceptName.includes('Sub-Stratum')) {
      return {
        quickNote: "In NSS multi-stage stratified designs, rural strata are subdivided to ensure adequate representation of special demographic domains. Sub-stratum 1 specifically aggregates villages with high child-worker proportions (p > 2P, where P is the State/UT average), while Sub-stratum 2 contains remaining villages.",
        remember: "Sub-stratum 1 = villages with child worker proportion p > 2P (double state average)."
      };
    }

    if (conceptName.includes('Probability Proportional to Size')) {
      return {
        quickNote: "Under MoSPI large-scale sample surveys, First Stage Units (FSUs/villages) in rural sectors are drawn using Probability Proportional to Size With Replacement (PPSWR). Size is defined strictly by the Census population of the village to ensure larger units have a proportionally higher selection probability.",
        remember: "PPSWR size metric = Census population of the village (larger population = higher selection probability)."
      };
    }

    if (conceptName.includes('Hamlet-Group') || conceptName.includes('D*')) {
      return {
        quickNote: "When sample FSUs exceed population thresholds, they are partitioned into D hamlet-groups or sub-blocks to keep listing manageable. In the estimation formula, D* is defined as 0 when D = 1, and equals (D - 1) when D > 1, ensuring unbiased multiplier calibration.",
        remember: "Hamlet multiplier factor: D* = 0 when D = 1; D* = (D - 1) when D > 1."
      };
    }

    if (conceptName.includes('Non-Response')) {
      return {
        quickNote: "Casualty households and non-responding sample units are compensated through design-weight adjustment factors. The base sampling weight is multiplied by the ratio of allocated sample units to successfully completed interviews within each explicit stratum cell.",
        remember: "Re-weighting multiplier = Base Weight × (Allocated Units / Completed Units)."
      };
    }

    if (conceptName.includes('Non-Sampling')) {
      return {
        quickNote: "Non-sampling errors (such as recall bias and data entry inaccuracies) arise during field data collection rather than from random sampling. Implementing CAPI real-time consistency rules and standard interviewer probing minimizes measurement variance.",
        remember: "CAPI validation checks reduce non-sampling errors; sampling errors are controlled via sample size."
      };
    }

    if (conceptName.includes('Design Effect')) {
      return {
        quickNote: "The Design Effect (Deff) measures the ratio of the variance of a complex multistage sample estimator to the variance of an equivalent simple random sample (SRS). A Deff > 1 indicates variance inflation caused by geographic clustering.",
        remember: "Deff = Variance(Complex Design) / Variance(SRS). Higher clustering increases Deff."
      };
    }

    // Dynamic generation from question explanation
    const sentences = cleanExpl.split(/(?<=[.?!])\s+/);
    const conciseNote = sentences.slice(0, 3).join(' ') || cleanExpl;
    const correctOpt = primaryQ.options[primaryQ.correctAnswer as keyof typeof primaryQ.options];

    return {
      quickNote: conciseNote,
      remember: `Key Rule: Correct standard is "${correctOpt.length > 80 ? correctOpt.substring(0, 80) + '...' : correctOpt}".`
    };
  }
}
