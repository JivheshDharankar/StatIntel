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
   * Retrieves a quiz by ID
   */
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
      nextRecommendations: nextRecommendations.slice(0, 3)
    };

    return attemptResult;
  }
}
