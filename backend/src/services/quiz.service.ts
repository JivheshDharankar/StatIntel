import axios from 'axios';
import { 
  QuizItem, 
  QuizQuestionItem, 
  QuizSubmissionResult, 
  QuestionSubmissionResult,
  CompetencyEvidenceItem 
} from '../types';
import { MASTER_COMPETENCIES, DEMO_OFFICIAL_PROFILE } from '../data/seedData';
import { ProfileService } from './profile.service';
import { CompetencyScoringService } from './competency.service';
import { RecommendationEngineService } from './recommendation.service';
import { RevisionService } from './revision.service';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

// In-memory persistent store for quizzes during prototype session
const storedQuizzes = new Map<string, QuizItem>();

export class QuizService {
  /**
   * Generates a grounded quiz via AI Service and persists it
   */
  static async generateQuiz(params: {
    topic: string;
    questionCount?: number;
    difficulty?: string;
    profileId?: string;
  }): Promise<QuizItem> {
    const topic = params.topic || 'Sampling';
    const count = params.questionCount || 5;
    const diff = params.difficulty || 'medium';
    const profileId = params.profileId || DEMO_OFFICIAL_PROFILE.id;

    // Find competency metadata
    const comp = MASTER_COMPETENCIES.find(
      c => c.name.toLowerCase() === topic.toLowerCase() || c.code.toLowerCase() === topic.toLowerCase()
    ) || MASTER_COMPETENCIES[1]; // default Sampling

    let generatedQuestions: any[] = [];

    // Call AI Service
    try {
      const response = await axios.post(`${AI_SERVICE_URL}/quiz/generate`, {
        topic,
        question_count: count,
        difficulty: diff
      }, { timeout: 45000 });

      if (response.data && response.data.questions) {
        generatedQuestions = response.data.questions;
      }
    } catch (err: any) {
      console.warn(`[QuizService] AI Service live call warning: ${err.message}. Using deterministic fallback questions.`);
      // Deterministic fallback citing official MoSPI learning materials
      generatedQuestions = [
        {
          question: "In the NSS 66th Round sample design, how is sub-stratum 1 defined within rural strata to net an adequate number of child workers?",
          options: {
            A: "All villages with proportion of child workers (p) > 2P, where P is the average proportion of child workers for the state/UT as per Census 2001",
            B: "All villages with proportion of child workers (p) > P, where P is the national average proportion of child workers as per Census 2001",
            C: "All villages with proportion of child workers (p) < 2P, where P is the state/UT average proportion of child workers as per Census 2001",
            D: "All villages with proportion of child workers (p) > 0.5P, where P is the average proportion of child workers for the state/UT as per Census 2001"
          },
          correct_answer: "A",
          explanation: "According to section 3.4 of the sample design document for the NSS 66th round, each rural stratum is divided into 2 sub-strata, where sub-stratum 1 consists of all villages with proportion of child workers (p) > 2P (where P is the average proportion of child workers for the state/UT as per Census 2001).",
          source_document: "Sampling Design.pdf",
          source_page: 4,
          source_chunk_id: "chunk_00503"
        },
        {
          question: "Which sampling method and size metric were used for the selection of sample villages (FSUs) from each stratum/sub-stratum in the rural sector under the NSS 66th Round?",
          options: {
            A: "Simple Random Sampling Without Replacement (SRSWOR), with size being the total number of households",
            B: "Probability Proportional to Size With Replacement (PPSWR), with size being the population of the village as per Census 2001",
            C: "Systematic Sampling, with size being the geographical area of the village in hectares",
            D: "Stratified Random Sampling, with size being the total agricultural workforce as per Census 2001"
          },
          correct_answer: "B",
          explanation: "Section 3.9 specifies that for the rural sector, from each stratum/sub-stratum, the required number of sample villages has been selected by probability proportional to size with replacement (PPSWR), where size is defined as the population of the village as per Census 2001.",
          source_document: "Sampling Design.pdf",
          source_page: 4,
          source_chunk_id: "chunk_00503"
        },
        {
          question: "In the estimation procedure notations for the NSS 66th Round, how is the term D* defined based on the total number of hamlet-groups/sub-blocks (D) formed in a sample FSU?",
          options: {
            A: "D* = 1 if D = 1, and D* = D for FSUs with D > 1",
            B: "D* = 0 if D = 1, and D* = (D – 1) for FSUs with D > 1",
            C: "D* = D for all sample FSUs regardless of D",
            D: "D* = D / 2 for sample FSUs with D > 1"
          },
          correct_answer: "B",
          explanation: "Section 7.1 of the estimation procedure defines D* explicitly as: D* = 0 if D = 1, and D* = (D – 1) for FSUs with D > 1, where D is the total number of hamlet-groups/sub-blocks formed in the sample FSU.",
          source_document: "Sampling Design.pdf",
          source_page: 7,
          source_chunk_id: "chunk_00507"
        },
        {
          question: "What is the key objective of forming Hamlet-Groups (hg) / Sub-Blocks (sb) during NSSO field survey operations?",
          options: {
            A: "To reduce listing workload in large FSUs exceeding approximate population thresholds",
            B: "To combine multiple non-contiguous villages into a single large sample unit",
            C: "To eliminate the second-stage stratification of households completely",
            D: "To replace probability sampling with convenience sampling in urban areas"
          },
          correct_answer: "A",
          explanation: "Hamlet-group/sub-block formation is specified in Section 4.1 to reduce listing workload in large sample FSUs while maintaining unbiased probability selection.",
          source_document: "Sampling Design.pdf",
          source_page: 5,
          source_chunk_id: "chunk_00504"
        },
        {
          question: "In the estimation of ratio R = Y / X for the NSS 66th Round, how is the estimate R^ computed?",
          options: {
            A: "R^ = Y^ / X^, where Y^ and X^ are the unbiased aggregate estimates of Y and X respectively",
            B: "R^ = Average of individual sample ratios across all FSUs without weights",
            C: "R^ = Geometric mean of Y and X across surveyed rural strata",
            D: "R^ = Y^ - X^ multiplied by the design effect coefficient"
          },
          correct_answer: "A",
          explanation: "Section 7.3 defines the ratio estimator R^ as the ratio of aggregate estimates Y^ and X^ computed from the weighted sample totals.",
          source_document: "Sampling Design.pdf",
          source_page: 8,
          source_chunk_id: "chunk_00508"
        },
        {
          question: "Under the MoSPI National Data Quality Framework, what is the primary statistical criterion for detecting multivariate outliers in complex survey microdata?",
          options: {
            A: "Mahalanobis distance exceeding critical chi-square value at p < 0.001",
            B: "Simple univariate z-score cutoff of +/- 1.96",
            C: "Interquartile range (IQR) multiplier of 0.5 without weight adjustment",
            D: "Elimination of top 5% of records based on household size alone"
          },
          correct_answer: "A",
          explanation: "MoSPI Data Quality Framework specifies Mahalanobis distance with appropriate degrees of freedom as the standard robust metric for multidimensional outlier detection in microdata verification.",
          source_document: "Data Quality.pdf",
          source_page: 12,
          source_chunk_id: "chunk_00312"
        },
        {
          question: "In second-stage stratification (SSS) of households in NSS surveys, what criterion is typically used to classify relatively affluent households into SSS 1?",
          options: {
            A: "Household possessing specified luxury consumer durables or high monthly per capita expenditure (MPCE)",
            B: "Households with more than 10 members irrespective of income",
            C: "Only households where all members are university graduates",
            D: "Any household residing in a multi-story concrete building"
          },
          correct_answer: "A",
          explanation: "NSS Survey Design manuals specify that SSS 1 is formed to capture relatively affluent households based on dynamic MPCE cutoffs and high-value asset possession to ensure representation of upper income deciles.",
          source_document: "Sampling Design.pdf",
          source_page: 6,
          source_chunk_id: "chunk_00505"
        },
        {
          question: "How are sample weights (multipliers) adjusted in NSS estimation when an FSU has non-response or casualty households in a specific stratum?",
          options: {
            A: "Re-weighting by multiplying the design weight by the inverse of the response rate within the sub-stratum/SSS",
            B: "Substituting casualty households with the nearest available neighbour",
            C: "Discarding the entire FSU from national aggregation",
            D: "Setting the casualty household weight to 1.0 automatically"
          },
          correct_answer: "A",
          explanation: "The official estimation procedure dictates non-response adjustment factors calculated as the ratio of allocated sample units to successfully surveyed units within each explicit design cell.",
          source_document: "Sampling Design.pdf",
          source_page: 9,
          source_chunk_id: "chunk_00509"
        },
        {
          question: "Which of the following is considered a non-sampling error that can be mitigated through rigorous interviewer training and CAPI validation rules?",
          options: {
            A: "Measurement and recall bias during household expenditure elicitation",
            B: "Standard error arising purely from random probability sample selection",
            C: "Finite population correction factor shrinkage",
            D: "Sample variance increase due to smaller sample allocation"
          },
          correct_answer: "A",
          explanation: "Survey Methodology guidelines distinguish non-sampling errors (reporting error, recall bias, data entry slips) from sampling variance, noting that CAPI field range checks directly reduce measurement error.",
          source_document: "Survey Methodology.pdf",
          source_page: 15,
          source_chunk_id: "chunk_00215"
        },
        {
          question: "In complex survey analysis, what is the design effect (Deff) defined as?",
          options: {
            A: "Ratio of the variance of the estimator under complex multistage design to the variance under simple random sampling (SRS) of the same sample size",
            B: "Difference between the sample mean and the population parameter",
            C: "Square root of the total sample size divided by the number of strata",
            D: "Correlation coefficient between primary stage units across quarters"
          },
          correct_answer: "A",
          explanation: "Design effect (Deff = Var_complex / Var_srs) measures the inflation of sampling variance due to clustering and stratification relative to an unweighted simple random sample.",
          source_document: "Sampling Design.pdf",
          source_page: 11,
          source_chunk_id: "chunk_00511"
        }
      ].slice(0, count);
    }

    const quizId = `quiz_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const questions: QuizQuestionItem[] = generatedQuestions.map((q, idx) => ({
      id: `q_${quizId}_${idx + 1}`,
      quizId,
      questionNumber: idx + 1,
      question: q.question,
      options: {
        A: q.options.A || (Array.isArray(q.options) ? q.options[0] : 'Option A'),
        B: q.options.B || (Array.isArray(q.options) ? q.options[1] : 'Option B'),
        C: q.options.C || (Array.isArray(q.options) ? q.options[2] : 'Option C'),
        D: q.options.D || (Array.isArray(q.options) ? q.options[3] : 'Option D')
      },
      correctAnswer: (q.correct_answer || 'A') as 'A' | 'B' | 'C' | 'D',
      explanation: q.explanation || 'Based on official MoSPI survey methodology.',
      sourceDocument: q.source_document || 'Sampling Design.pdf',
      sourcePage: Number(q.source_page) || 1,
      sourceChunkId: q.source_chunk_id || `chunk_${idx}`
    }));

    const quizItem: QuizItem = {
      id: quizId,
      topic,
      competencyId: comp.id,
      competencyName: comp.name,
      difficulty: diff,
      totalQuestions: questions.length,
      sourceDocument: questions[0]?.sourceDocument || 'Sampling Design.pdf',
      questions,
      createdAt: new Date().toISOString()
    };

    // Store in memory
    storedQuizzes.set(quizId, quizItem);

    return quizItem;
  }

  /**
   * Generates a novel retry question targeting a specific concept while explicitly
   * excluding previous/original questions with multi-attempt duplicate validation.
   */
  static async generateRetryQuestion(params: {
    topic: string;
    concept?: string;
    excludeQuestions?: string[];
    difficulty?: string;
  }): Promise<QuizQuestionItem> {
    const topic = params.topic || 'Sampling';
    const concept = params.concept || topic;
    const excludeList = (params.excludeQuestions || []).filter(q => q && q.trim().length > 0);
    const diff = params.difficulty || 'medium';

    let candidateQuestion: any = null;

    // 1. Attempt AI Service generation with novelty enforcement and up to 3 attempts
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const response = await axios.post(`${AI_SERVICE_URL}/quiz/generate`, {
          topic,
          concept_focus: concept,
          exclude_questions: excludeList,
          is_retry: true,
          question_count: 1,
          difficulty: diff
        }, { timeout: 35000 });

        if (response.data && response.data.questions && response.data.questions.length > 0) {
          const q = response.data.questions[0];
          if (!this.isTooSimilar(q.question, excludeList)) {
            candidateQuestion = q;
            break;
          }
        }
      } catch {
        // Continue to next attempt or fallback
      }
    }

    // 2. Fallback to scenario-based non-duplicate questions if AI is unavailable or duplicates were rejected
    if (!candidateQuestion) {
      candidateQuestion = this.getFallbackRetryQuestion(concept, topic, excludeList);
    }

    const quizId = `retry_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const questionItem: QuizQuestionItem = {
      id: `q_${quizId}_1`,
      quizId,
      questionNumber: 1,
      question: candidateQuestion.question,
      options: {
        A: candidateQuestion.options.A || 'Option A',
        B: candidateQuestion.options.B || 'Option B',
        C: candidateQuestion.options.C || 'Option C',
        D: candidateQuestion.options.D || 'Option D'
      },
      correctAnswer: (candidateQuestion.correct_answer || candidateQuestion.correctAnswer || 'A') as 'A' | 'B' | 'C' | 'D',
      explanation: candidateQuestion.explanation || 'Based on official MoSPI survey methodology standard.',
      sourceDocument: candidateQuestion.source_document || candidateQuestion.sourceDocument || 'Sampling Design.pdf',
      sourcePage: Number(candidateQuestion.source_page || candidateQuestion.sourcePage) || 1,
      sourceChunkId: candidateQuestion.source_chunk_id || candidateQuestion.sourceChunkId || 'chunk_retry'
    };

    return questionItem;
  }

  /**
   * Deterministic duplicate detector: verifies exact and Jaccard word-overlap similarity.
   */
  private static isTooSimilar(genQuestion: string, excludeList: string[], threshold: number = 0.55): boolean {
    if (!genQuestion || !excludeList || excludeList.length === 0) return false;

    const normGen = genQuestion.toLowerCase().replace(/[^\w\s]/g, ' ').trim();
    const genWords = new Set(normGen.split(/\s+/).filter(w => w.length > 2));
    if (genWords.size === 0) return false;

    for (const excl of excludeList) {
      const normExcl = excl.toLowerCase().replace(/[^\w\s]/g, ' ').trim();
      if (normGen === normExcl) return true;

      const exclWords = new Set(normExcl.split(/\s+/).filter(w => w.length > 2));
      if (exclWords.size === 0) continue;

      let intersection = 0;
      for (const w of genWords) {
        if (exclWords.has(w)) intersection++;
      }
      const union = new Set([...genWords, ...exclWords]).size;
      const similarity = union > 0 ? intersection / union : 0;
      if (similarity >= threshold) return true;
    }
    return false;
  }

  /**
   * Generates a grounded, scenario-based retry question with distinct wording from original assessment.
   */
  private static getFallbackRetryQuestion(concept: string, topic: string, excludeList: string[]): any {
    const conceptLower = `${concept} ${topic}`.toLowerCase();

    const bank = [
      // Sub-Stratum Allocation Variants
      {
        tag: 'sub-stratum',
        question: "A state NSS field director notices that child labour incidence varies drastically across rural districts. Under official sample design guidelines, what threshold determines whether a village is assigned to Sub-stratum 1 versus Sub-stratum 2?",
        options: {
          A: "Village child worker proportion exceeding double the State/UT average proportion (p > 2P)",
          B: "Total district agricultural landholding exceeding 5,000 hectares",
          C: "Literacy rate falling below 40% in Census 2001",
          D: "Village distance exceeding 50 km from the nearest district headquarters"
        },
        correct_answer: "A",
        explanation: "MoSPI Sample Design Section 3.4 specifies that Sub-stratum 1 is demarcated by villages with proportion of child workers p > 2P, where P is the State/UT average.",
        source_document: "Sampling Design.pdf",
        source_page: 4,
        source_chunk_id: "chunk_00503"
      },
      {
        tag: 'sub-stratum',
        question: "In designing the rural sample for the NSS 68th Round Consumer Expenditure Survey, a state statistical officer needs to isolate high-density agricultural wage clusters into Sub-stratum 1. According to MoSPI stratification protocols, how is the cut-off criterion computed?",
        options: {
          A: "Equal probability division irrespective of economic indicators",
          B: "Double the state average benchmark (p > 2P) based on Census population baseline",
          C: "Geographic distance from the state capital exceeding 100 kilometres",
          D: "Total village electrification rate below 50%"
        },
        correct_answer: "B",
        explanation: "Official MoSPI stratification protocols mandate establishing Sub-stratum 1 for demographic focus areas using the threshold p > 2P relative to the state benchmark.",
        source_document: "Sampling Design.pdf",
        source_page: 4,
        source_chunk_id: "chunk_00503"
      },
      {
        tag: 'sub-stratum',
        question: "During sample stratification across North-Eastern states, district officials must ensure rural artisan communities are not omitted from primary stage selection. What stratification rule applies when sub-strata boundaries are established within rural sectors?",
        options: {
          A: "Divide rural strata into 2 sub-strata where Sub-stratum 1 isolates high-proportion target clusters (p > 2P)",
          B: "Eliminate all habitations with population under 500 from the sampling frame",
          C: "Group all administrative headquarters into a single unstratified stratum",
          D: "Assign equal sample allocation to all villages without sub-stratification"
        },
        correct_answer: "A",
        explanation: "Rural sector stratification divides each stratum into 2 sub-strata, with sub-stratum 1 capturing specialized population densities with p > 2P.",
        source_document: "Sampling Design.pdf",
        source_page: 4,
        source_chunk_id: "chunk_00503"
      },

      // PPSWR Selection Variants
      {
        tag: 'ppswr',
        question: "During rural sample allocation, an investigator inquires why larger habitations have a higher chance of selection. Which sampling design property explains this mechanism?",
        options: {
          A: "Probability Proportional to Size With Replacement (PPSWR) using Census population as size measure",
          B: "Simple Random Sampling with uniform probabilities regardless of village size",
          C: "Cluster sampling restricted exclusively to electrified villages",
          D: "Systematic sampling ordered strictly by geographical longitude"
        },
        correct_answer: "A",
        explanation: "In official MoSPI rural sampling, FSUs are selected with probability proportional to size (PPSWR), where size equals Census 2001 population.",
        source_document: "Sampling Design.pdf",
        source_page: 4,
        source_chunk_id: "chunk_00503"
      },
      {
        tag: 'ppswr',
        question: "When selecting 12 sample villages (FSUs) from a rural stratum in Uttar Pradesh, the sampling team utilizes the Cumulative Total Method. Which probability model and size parameter are mandated by MoSPI standards?",
        options: {
          A: "Equal probability SRSWOR using total arable land area in square kilometers",
          B: "Stratified systematic selection using household telephone registrations",
          C: "Probability Proportional to Size With Replacement (PPSWR) using Census village population as size metric",
          D: "Convenience quota sampling centered on district headquarters"
        },
        correct_answer: "C",
        explanation: "Section 3.9 specifies that rural FSUs are drawn via PPSWR with size defined by the Census population.",
        source_document: "Sampling Design.pdf",
        source_page: 4,
        source_chunk_id: "chunk_00503"
      },
      {
        tag: 'ppswr',
        question: "A newly inducted statistical officer questions why simple random sampling without replacement (SRSWOR) is not employed for village selection in national socio-economic surveys. What primary methodological advantage does PPSWR selection offer in this context?",
        options: {
          A: "It guarantees zero non-sampling errors during household listing",
          B: "It yields self-weighting sample designs and reduces variance for population aggregate estimators",
          C: "It eliminates the need for secondary stage household sampling",
          D: "It allows field enumerators to survey only easily accessible habitations"
        },
        correct_answer: "B",
        explanation: "PPSWR sampling in multi-stage surveys ensures that larger units have proportionally higher representation, creating self-weighting sample designs and minimizing variance.",
        source_document: "Sampling Design.pdf",
        source_page: 5,
        source_chunk_id: "chunk_00504"
      },

      // Hamlet-Group Formation & Multiplier Adjustment (D*) Variants
      {
        tag: 'hamlet',
        question: "In an extensive FSU containing 4 distinct hamlet-groups (D = 4), what value must D* take in the official multiplier formula when calculating aggregate population totals?",
        options: {
          A: "3 (since D* = D - 1 for FSUs with D > 1)",
          B: "4 (equal to total hamlet groups D)",
          C: "0 (regardless of the number of hamlets)",
          D: "2 (half of total hamlet groups)"
        },
        correct_answer: "A",
        explanation: "Section 7.1 defines D* as 0 when D = 1, and (D - 1) when D > 1. For D = 4, D* = 3.",
        source_document: "Sampling Design.pdf",
        source_page: 7,
        source_chunk_id: "chunk_00507"
      },
      {
        tag: 'hamlet',
        question: "A field survey team encounters a large village with 2,400 households and subdivides it into 6 equal hamlet-groups (D = 6). In the MoSPI estimation notation for multiplier calculations, what numerical value is assigned to D*?",
        options: {
          A: "6 (equal to total hamlets)",
          B: "5 (because D* = D - 1 when D > 1)",
          C: "1 (standard constant default)",
          D: "0 (because sub-division cancels the weight)"
        },
        correct_answer: "B",
        explanation: "Under official MoSPI estimation rules, when D = 6 (> 1), the multiplier correction factor D* = 6 - 1 = 5.",
        source_document: "Sampling Design.pdf",
        source_page: 7,
        source_chunk_id: "chunk_00507"
      },
      {
        tag: 'hamlet',
        question: "In a small tribal village where no hamlet-groups are created (D = 1), what value does the multiplier factor D* assume in the official NSS estimation formulas?",
        options: {
          A: "D* = 0 (because no hamlet subdivision was required)",
          B: "D* = 1 (equal to D)",
          C: "D* = -1 (decrement factor)",
          D: "D* = 0.5 (half-unit weighting)"
        },
        correct_answer: "A",
        explanation: "Section 7.1 explicitly states D* = 0 when D = 1, ensuring the primary listing multiplier remains uninflated.",
        source_document: "Sampling Design.pdf",
        source_page: 7,
        source_chunk_id: "chunk_00507"
      },

      // Non-Response & Casualty Variants
      {
        tag: 'non-response',
        question: "If 2 out of 10 sampled households in a selected village refuse to participate during survey operations, how does the estimation formula account for this non-response?",
        options: {
          A: "The sampling weight is adjusted upward by the ratio of total allocated units to successfully completed units",
          B: "The village data is discarded entirely from state aggregates",
          C: "Unsurveyed households are replaced by non-random neighbour substitutes",
          D: "The missing values are imputed as zero with zero sampling weight"
        },
        correct_answer: "A",
        explanation: "Official MoSPI estimation protocols dictate non-response re-weighting factors equal to (Allocated Sample / Surveyed Sample).",
        source_document: "Sampling Design.pdf",
        source_page: 9,
        source_chunk_id: "chunk_00509"
      },
      {
        tag: 'non-response',
        question: "During field operations for PLFS in an urban block, 3 casualty households are recorded due to locked residences. According to MoSPI guidelines, how are the estimation weights adjusted to prevent downward estimation bias?",
        options: {
          A: "Exclude the entire urban block from the sampling frame",
          B: "Multiply base respondent weights by the casualty factor (n_allocated / n_surveyed)",
          C: "Arbitrarily duplicate responses from the first 3 surveyed households",
          D: "Reduce aggregate state population totals by the uncollected count"
        },
        correct_answer: "B",
        explanation: "Casualty households are compensated by inflating respondent sampling weights by (n_allocated / n_surveyed) within the same stratum.",
        source_document: "Sampling Design.pdf",
        source_page: 9,
        source_chunk_id: "chunk_00509"
      },
      {
        tag: 'non-response',
        question: "An ISS officer analyzing non-response in household surveys notes that simply dropping casualty households underestimates total aggregate expenditure. What formula calibration resolves this discrepancy?",
        options: {
          A: "Allocating zero weight to all households in the district",
          B: "Multiplying design weights by the ratio of allocated sample units to completed interviews",
          C: "Substituting commercial retail estimates for missing household data",
          D: "Capping all household expenditure values at the 50th percentile"
        },
        correct_answer: "B",
        explanation: "Design weight calibration by the ratio (Allocated Units / Completed Interviews) preserves unbiased aggregate totals.",
        source_document: "Sampling Design.pdf",
        source_page: 9,
        source_chunk_id: "chunk_00509"
      },

      // Non-Sampling Error Mitigation & CAPI Validation Variants
      {
        tag: 'non-sampling',
        question: "A quality assurance audit reports that field investigators occasionally misclassify informal enterprise revenues. What operational measure most effectively curbs this non-sampling error?",
        options: {
          A: "Implementing real-time CAPI validation rules and structured probing protocols",
          B: "Increasing the sample size of FSUs across urban blocks",
          C: "Applying post-stratification weights during macro estimation",
          D: "Switching from multistage sampling to unstratified simple random sampling"
        },
        correct_answer: "A",
        explanation: "Non-sampling errors stem from measurement and reporting inaccuracies; CAPI automated range validations directly prevent field data entry errors.",
        source_document: "Survey Methodology.pdf",
        source_page: 15,
        source_chunk_id: "chunk_00215"
      },
      {
        tag: 'non-sampling',
        question: "During periodic labour force data entry, an enumerator enters a weekly working hours total of 168 hours for a casual labourer. Which data quality mechanism in official MoSPI surveys intercepts this error at source?",
        options: {
          A: "Computer-Assisted Personal Interviewing (CAPI) automated hard-range validation rules and logical consistency constraints",
          B: "Post-survey variance estimation formulas",
          C: "Stratum weight adjustment factors",
          D: "Annual benchmark revisions by the National Statistical Commission"
        },
        correct_answer: "A",
        explanation: "CAPI digital entry tools embed hard and soft validation constraints that instantly block illogical or out-of-range responses in real time.",
        source_document: "Survey Methodology.pdf",
        source_page: 15,
        source_chunk_id: "chunk_00215"
      },
      {
        tag: 'non-sampling',
        question: "Comparing sampling errors versus non-sampling errors, an MoSPI survey director wants to minimize respondent recall decay and enumerator recording bias. Which strategy directly tackles this non-sampling distortion?",
        options: {
          A: "Deploying structured 7-day recall reference periods and standardized CAPI digital questionnaires with validation rules",
          B: "Doubling the number of primary stage sampling units without changing survey instruments",
          C: "Applying Finite Population Correction to final variance estimates",
          D: "Restricting data collection to telephone interviews only"
        },
        correct_answer: "A",
        explanation: "Non-sampling errors are mitigated through optimized recall periods and rigorous CAPI questionnaire validation.",
        source_document: "Survey Methodology.pdf",
        source_page: 15,
        source_chunk_id: "chunk_00215"
      },

      // Design Effect (Deff) Variants
      {
        tag: 'design effect',
        question: "When evaluating survey efficiency, a statistician observes that clustering increased estimation variance by 40% compared to simple random sampling. What metric represents this ratio?",
        options: {
          A: "Design Effect (Deff = 1.40)",
          B: "Relative Standard Error (RSE = 40%)",
          C: "Finite Population Correction (FPC = 0.60)",
          D: "Coefficient of Variation (CV = 1.40)"
        },
        correct_answer: "A",
        explanation: "The Design Effect (Deff = Var_complex / Var_srs) measures the variance inflation factor due to clustering and stratification relative to SRS.",
        source_document: "Sampling Design.pdf",
        source_page: 11,
        source_chunk_id: "chunk_00511"
      },
      {
        tag: 'design effect',
        question: "In assessing the multi-stage cluster design of the Household Consumption Survey, the calculated Design Effect (Deff) for rural per-capita expenditure is 1.75. How should this finding be interpreted?",
        options: {
          A: "The survey estimator has 75% higher variance than an equivalent simple random sample due to intra-cluster correlation",
          B: "The sample size should be reduced by 75% to achieve efficiency",
          C: "75% of households refused to answer the questionnaire",
          D: "The estimate has a 75% margin of non-sampling error"
        },
        correct_answer: "A",
        explanation: "Deff = 1.75 indicates that cluster homogeneity increases the variance of the estimator by 75% compared to SRS of the same size.",
        source_document: "Sampling Design.pdf",
        source_page: 11,
        source_chunk_id: "chunk_00511"
      },
      {
        tag: 'design effect',
        question: "A survey methodologist wants to calculate the effective sample size for a complex survey with sample size n = 1,200 and estimated Deff = 1.5. What is the equivalent simple random sample size (n_eff)?",
        options: {
          A: "800 (calculated as n / Deff = 1,200 / 1.5)",
          B: "1,800 (calculated as n * Deff)",
          C: "1,200 (equal to nominal sample size)",
          D: "600 (half of sample size)"
        },
        correct_answer: "A",
        explanation: "Effective sample size n_eff is calculated as Nominal Sample Size divided by Deff (1,200 / 1.5 = 800).",
        source_document: "Sampling Design.pdf",
        source_page: 11,
        source_chunk_id: "chunk_00511"
      }
    ];

    // Find first question in bank matching concept that isn't in excludeList
    for (const item of bank) {
      if (conceptLower.includes(item.tag) && !this.isTooSimilar(item.question, excludeList)) {
        return item;
      }
    }

    // Secondary pass: any non-duplicate in bank
    for (const item of bank) {
      if (!this.isTooSimilar(item.question, excludeList)) {
        return item;
      }
    }

    return bank[0];
  }
  static getQuizById(quizId: string): QuizItem | null {
    return storedQuizzes.get(quizId) || null;
  }

  /**
   * Stores a preconstructed quiz into the store (useful for deterministic tests)
   */
  static storeQuiz(quiz: QuizItem): void {
    storedQuizzes.set(quiz.id, quiz);
  }

  /**
   * Submits and scores a quiz attempt, calculates competency evidence, updates user competency,
   * calculates gap closure percentage, and returns the next recommendation.
   */
  static async submitQuizAttempt(
    quizId: string,
    profileId: string,
    answers: Record<string, string>,
    impactWeight: number = 0.25
  ): Promise<QuizSubmissionResult> {
    const quiz = storedQuizzes.get(quizId);
    if (!quiz) {
      throw new Error(`Quiz '${quizId}' not found.`);
    }

    if (!answers || Object.keys(answers).length === 0) {
      throw new Error("No answers provided for submission.");
    }

    // Grade each question
    let correctCount = 0;
    const questionResults: QuestionSubmissionResult[] = [];

    quiz.questions.forEach(q => {
      const userAnswerRaw = answers[q.id] || answers[String(q.questionNumber)] || '';
      const userAnswer = userAnswerRaw.trim().toUpperCase();
      const isCorrect = userAnswer === q.correctAnswer;

      if (isCorrect) {
        correctCount++;
      }

      questionResults.push({
        questionId: q.id,
        questionNumber: q.questionNumber,
        question: q.question,
        options: q.options,
        userAnswer: userAnswer || 'Unanswered',
        correctAnswer: q.correctAnswer,
        isCorrect,
        explanation: q.explanation,
        sourceDocument: q.sourceDocument,
        sourcePage: q.sourcePage,
        sourceChunkId: q.sourceChunkId
      });
    });

    const totalQuestions = quiz.questions.length;
    const incorrectCount = totalQuestions - correctCount;
    const score = correctCount;
    const percentage = Math.round((correctCount / totalQuestions) * 100 * 100) / 100;

    // Retrieve user baseline for this competency
    const userCompetencies = await ProfileService.getUserCompetencies(profileId);
    const existingComp = userCompetencies.find(
      uc => uc.competencyId === quiz.competencyId || 
            uc.competency?.code === quiz.competencyId ||
            uc.competency?.name.toLowerCase() === quiz.competencyName.toLowerCase()
    );

    const previousScore = existingComp ? existingComp.estimatedScore : 35;
    const targetScore = existingComp?.benchmarkScore || 80;

    // Calculate updated competency & gap closure with weight = 0.25
    const scoreCalc = CompetencyScoringService.calculateUpdatedCompetency(
      previousScore,
      score,
      totalQuestions,
      targetScore,
      impactWeight
    );

    // Update user competency in repository
    await ProfileService.updateUserCompetencyScore(
      profileId,
      quiz.competencyId,
      scoreCalc.newEstimatedScore
    );

    // Record competency evidence
    const evidenceId = `evi_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const evidenceItem: CompetencyEvidenceItem = {
      id: evidenceId,
      userId: profileId,
      competencyId: quiz.competencyId,
      evidenceType: 'quiz',
      quizId,
      score: percentage,
      impactWeight,
      previousScore,
      newScore: scoreCalc.newEstimatedScore,
      targetScore,
      oldGap: scoreCalc.oldGap,
      newGap: scoreCalc.newGap,
      gapClosedPercentage: scoreCalc.gapClosedPercentage,
      rationale: scoreCalc.evidenceExplanation,
      createdAt: new Date().toISOString()
    };
    await ProfileService.recordCompetencyEvidence(evidenceItem);

    // Retrieve refreshed competencies to compute updated gaps & next recommendations
    const updatedUserCompetencies = await ProfileService.getUserCompetencies(profileId);
    const nextRecommendations = RecommendationEngineService.generateRecommendations(
      updatedUserCompetencies,
      undefined,
      'Statistical Officer'
    );

    // Generate Quick Revision Notes for missed questions
    const incorrectQuestions = questionResults.filter(q => !q.isCorrect);
    const revisionNotes = await RevisionService.generateRevisionNotes(incorrectQuestions, quiz.topic);

    const attemptResult: QuizSubmissionResult = {
      attemptId: `att_${Date.now()}`,
      quizId,
      userId: profileId,
      topic: quiz.topic,
      competencyId: quiz.competencyId,
      competencyName: quiz.competencyName,
      totalQuestions,
      correctCount,
      incorrectCount,
      score,
      percentage,
      competencyBefore: previousScore,
      competencyAfter: scoreCalc.newEstimatedScore,
      targetScore,
      oldGap: scoreCalc.oldGap,
      newGap: scoreCalc.newGap,
      gapClosedPercentage: scoreCalc.gapClosedPercentage,
      evidenceWeight: impactWeight,
      evidenceId,
      submittedAt: new Date().toISOString(),
      questionResults,
      nextRecommendations: nextRecommendations.slice(0, 3),
      revisionNotes
    };

    return attemptResult;
  }
}
