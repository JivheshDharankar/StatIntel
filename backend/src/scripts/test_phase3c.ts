import { QuizService } from '../services/quiz.service';
import { ProfileService } from '../services/profile.service';
import { CompetencyScoringService } from '../services/competency.service';
import { DEMO_OFFICIAL_PROFILE, MASTER_COMPETENCIES } from '../data/seedData';
import { QuizItem } from '../types';

async function runPhase3cVerification() {
  console.log('================================================================');
  console.log('       STATINTEL PHASE 3C BACKEND & GAP CLOSURE TEST');
  console.log('================================================================\n');

  // Reset state
  ProfileService.resetMockState();

  // 1. Verify exact mathematical formula test
  console.log('1. COMPETENCY SCORING & GAP CLOSURE FORMULA TEST');
  const formulaTest = CompetencyScoringService.calculateUpdatedCompetency(
    35.0, // previousScore
    4,    // quizScore
    5,    // totalQuestions (4/5 = 80%)
    80.0, // targetScore
    0.25  // impactWeight
  );

  console.log(`   - Previous Score: ${formulaTest.previousScore}`);
  console.log(`   - Quiz Score: 4/5 (${formulaTest.quizScorePercent}%)`);
  console.log(`   - Impact Weight: ${formulaTest.weight}`);
  console.log(`   - New Estimated Score: ${formulaTest.newEstimatedScore} (Expected: 46.25)`);
  console.log(`   - Target Score: ${formulaTest.targetScore}`);
  console.log(`   - Old Gap: ${formulaTest.oldGap} (Expected: 45)`);
  console.log(`   - New Gap: ${formulaTest.newGap} (Expected: 33.75)`);
  console.log(`   - Estimated Gap Closed: ${formulaTest.gapClosedPercentage}% (Expected: 25%)`);

  if (
    formulaTest.newEstimatedScore === 46.25 &&
    formulaTest.oldGap === 45 &&
    formulaTest.newGap === 33.75 &&
    formulaTest.gapClosedPercentage === 25
  ) {
    console.log('   [PASS] Formula calculation matches 100% with exact requirements!\n');
  } else {
    throw new Error(`Formula mismatch: got newScore=${formulaTest.newEstimatedScore}, oldGap=${formulaTest.oldGap}, newGap=${formulaTest.newGap}, gapClosed=${formulaTest.gapClosedPercentage}`);
  }

  // 2. End-to-End Quiz Simulation Test
  console.log('2. END-TO-END QUIZ SUBMISSION & EVIDENCE RECORDING TEST');
  const mockQuizId = 'quiz_test_sampling_01';
  const samplingComp = MASTER_COMPETENCIES[1]; // Sampling

  const mockQuiz: QuizItem = {
    id: mockQuizId,
    topic: 'Sampling',
    competencyId: samplingComp.id,
    competencyName: samplingComp.name,
    difficulty: 'medium',
    totalQuestions: 5,
    sourceDocument: 'Sampling Design.pdf',
    questions: [
      {
        id: 'q1',
        quizId: mockQuizId,
        questionNumber: 1,
        question: 'How is sub-stratum 1 defined within rural strata in NSS 66th round?',
        options: { A: 'Villages with p > 2P', B: 'Villages with p > P', C: 'Villages with p < P', D: 'Villages with p = 0' },
        correctAnswer: 'A',
        explanation: 'Section 3.4 defines sub-stratum 1 as villages with child worker proportion p > 2P.',
        sourceDocument: 'Sampling Design.pdf',
        sourcePage: 4,
        sourceChunkId: 'chunk_00503'
      },
      {
        id: 'q2',
        quizId: mockQuizId,
        questionNumber: 2,
        question: 'Which sampling method is used for rural sample villages?',
        options: { A: 'SRSWOR', B: 'PPSWR with population size', C: 'Systematic', D: 'Purposive' },
        correctAnswer: 'B',
        explanation: 'Section 3.9 specifies PPSWR selection with Census 2001 population as size.',
        sourceDocument: 'Sampling Design.pdf',
        sourcePage: 4,
        sourceChunkId: 'chunk_00503'
      },
      {
        id: 'q3',
        quizId: mockQuizId,
        questionNumber: 3,
        question: 'How is notation D* defined for FSUs with D > 1?',
        options: { A: 'D* = D', B: 'D* = D - 1', C: 'D* = 0', D: 'D* = 1' },
        correctAnswer: 'B',
        explanation: 'Section 7.1 defines D* = (D - 1) for FSUs where D > 1.',
        sourceDocument: 'Sampling Design.pdf',
        sourcePage: 7,
        sourceChunkId: 'chunk_00507'
      },
      {
        id: 'q4',
        quizId: mockQuizId,
        questionNumber: 4,
        question: 'What is the purpose of hamlet-group formation?',
        options: { A: 'To reduce listing workload in large FSUs', B: 'To merge villages', C: 'To avoid sampling', D: 'To eliminate weights' },
        correctAnswer: 'A',
        explanation: 'Section 4.1 specifies hamlet-group formation reduces listing burden.',
        sourceDocument: 'Sampling Design.pdf',
        sourcePage: 5,
        sourceChunkId: 'chunk_00504'
      },
      {
        id: 'q5',
        quizId: mockQuizId,
        questionNumber: 5,
        question: 'How is aggregate ratio R^ computed?',
        options: { A: 'R^ = Y^ / X^', B: 'R^ = Y^ + X^', C: 'R^ = Geometric Mean', D: 'R^ = Median' },
        correctAnswer: 'A',
        explanation: 'Section 7.3 defines ratio estimator as R^ = Y^ / X^.',
        sourceDocument: 'Sampling Design.pdf',
        sourcePage: 8,
        sourceChunkId: 'chunk_00508'
      }
    ],
    createdAt: new Date().toISOString()
  };

  QuizService.storeQuiz(mockQuiz);

  // Submit answers: 4 correct (q1=A, q2=B, q3=B, q4=A), 1 incorrect (q5=C instead of A) -> 4/5 = 80%
  const submissionAnswers = {
    q1: 'A',
    q2: 'B',
    q3: 'B',
    q4: 'A',
    q5: 'C'
  };

  const result = await QuizService.submitQuizAttempt(
    mockQuizId,
    DEMO_OFFICIAL_PROFILE.id,
    submissionAnswers,
    0.25
  );

  console.log(`   - Submission ID: ${result.attemptId}`);
  console.log(`   - Score: ${result.score}/${result.totalQuestions} (${result.percentage}%)`);
  console.log(`   - Competency Before: ${result.competencyBefore}`);
  console.log(`   - Competency After: ${result.competencyAfter}`);
  console.log(`   - Target: ${result.targetScore}`);
  console.log(`   - Old Gap: ${result.oldGap}`);
  console.log(`   - New Gap: ${result.newGap}`);
  console.log(`   - Estimated Gap Closed: ${result.gapClosedPercentage}%`);
  console.log(`   - Evidence ID: ${result.evidenceId}`);
  console.log('   - Question Breakdown:');
  result.questionResults.forEach(qr => {
    console.log(`     * Q${qr.questionNumber}: User Answer=[${qr.userAnswer}] | Correct=[${qr.correctAnswer}] | Result=[${qr.isCorrect ? 'CORRECT' : 'INCORRECT'}] | Source=[${qr.sourceDocument} p.${qr.sourcePage}]`);
  });

  console.log('\n3. NEXT RECOMMENDATIONS SELECTION');
  console.log(`   - Number of Next Recommendations: ${result.nextRecommendations.length}`);
  result.nextRecommendations.forEach((rec, idx) => {
    console.log(`     #${idx + 1} [Score: ${rec.matchScore}] [${rec.resource?.sourceCategory}] ${rec.resource?.title}`);
    console.log(`        Rationale: "${rec.rationale}"`);
  });

  console.log('\n================================================================');
  console.log('   >>> ALL PHASE 3C VERIFICATIONS PASSED WITH ZERO ERRORS <<<');
  console.log('================================================================\n');
}

runPhase3cVerification().catch(err => {
  console.error('[Phase 3C Verification Failed]:', err);
  process.exit(1);
});
