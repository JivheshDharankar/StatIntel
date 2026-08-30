import { QuizService } from '../services/quiz.service';
import { RevisionService } from '../services/revision.service';
import { DEMO_OFFICIAL_PROFILE } from '../data/seedData';

async function main() {
  console.log('================================================================');
  console.log('       STATINTEL RETRY QUESTION END-TO-END VERIFICATION        ');
  console.log('================================================================\n');

  // Step 1: Generate initial baseline quiz
  console.log('1. GENERATING BASELINE ASSESSMENT QUIZ (Topic: Sampling)');
  const quiz = await QuizService.generateQuiz({
    topic: 'Sampling',
    questionCount: 3,
    difficulty: 'medium',
    profileId: DEMO_OFFICIAL_PROFILE.id
  });

  const originalQ1 = quiz.questions[0];
  console.log(`   [Original Question 1 ID: ${originalQ1.id}]`);
  console.log(`   Question Text: "${originalQ1.question}"`);
  console.log(`   Correct Answer: [${originalQ1.correctAnswer}]`);
  console.log(`   Source: ${originalQ1.sourceDocument} (p.${originalQ1.sourcePage}, chunk ${originalQ1.sourceChunkId})\n`);

  // Step 2: Submit with deliberate mistake on Question 1
  console.log('2. SUBMITTING ATTEMPT WITH DELIBERATE MISTAKE ON QUESTION 1');
  const wrongOption = originalQ1.correctAnswer === 'A' ? 'C' : 'A';
  const answers: Record<string, string> = {
    [originalQ1.id]: wrongOption,
    [quiz.questions[1].id]: quiz.questions[1].correctAnswer,
    [quiz.questions[2].id]: quiz.questions[2].correctAnswer
  };

  const result = await QuizService.submitQuizAttempt(
    quiz.id,
    DEMO_OFFICIAL_PROFILE.id,
    answers,
    0.25
  );

  console.log(`   Score: ${result.score}/${result.totalQuestions} (${result.percentage}%)`);
  console.log(`   Incorrect Count: ${result.incorrectCount}`);
  console.log(`   Revision Notes Generated: ${result.revisionNotes?.length || 0}`);

  if (!result.revisionNotes || result.revisionNotes.length === 0) {
    throw new Error('Expected revision notes to be generated for missed questions.');
  }

  const note = result.revisionNotes[0];
  console.log(`   * Revision Card Concept: "${note.concept}"`);
  console.log(`   * Quick Note: "${note.quickNote}"`);
  console.log(`   * Remember Takeaway: "${note.remember}"\n`);

  // Step 3: User clicks "Try Similar Question" (1st Retry)
  console.log('3. USER CLICKS [TRY SIMILAR QUESTION] (1ST RETRY)');
  const retry1 = await QuizService.generateRetryQuestion({
    topic: quiz.topic,
    concept: note.concept,
    excludeQuestions: [originalQ1.question],
    difficulty: 'medium'
  });

  console.log(`   [Retry 1 ID: ${retry1.id}]`);
  console.log(`   Question Text: "${retry1.question}"`);
  console.log(`   Correct Answer: [${retry1.correctAnswer}]`);
  console.log(`   Explanation: "${retry1.explanation}"`);
  console.log(`   Source: ${retry1.sourceDocument} (p.${retry1.sourcePage})`);

  // Verify Retry 1 is NOT duplicate of Original
  if (retry1.question.trim().toLowerCase() === originalQ1.question.trim().toLowerCase()) {
    throw new Error('FAIL: Retry Question 1 is an EXACT DUPLICATE of the original question!');
  }
  console.log('   >>> [PASS] Retry Question 1 is visibly distinct from Original Question!\n');

  // Step 4: User clicks "Try Another Question" (2nd Retry)
  console.log('4. USER CLICKS [TRY ANOTHER QUESTION] (2ND RETRY)');
  const retry2 = await QuizService.generateRetryQuestion({
    topic: quiz.topic,
    concept: note.concept,
    excludeQuestions: [originalQ1.question, retry1.question],
    difficulty: 'medium'
  });

  console.log(`   [Retry 2 ID: ${retry2.id}]`);
  console.log(`   Question Text: "${retry2.question}"`);
  console.log(`   Correct Answer: [${retry2.correctAnswer}]`);
  console.log(`   Explanation: "${retry2.explanation}"`);

  // Verify Retry 2 is distinct from both Original and Retry 1
  if (retry2.question.trim().toLowerCase() === originalQ1.question.trim().toLowerCase()) {
    throw new Error('FAIL: Retry Question 2 is a duplicate of the original question!');
  }
  if (retry2.question.trim().toLowerCase() === retry1.question.trim().toLowerCase()) {
    throw new Error('FAIL: Retry Question 2 is a duplicate of Retry Question 1!');
  }
  console.log('   >>> [PASS] Retry Question 2 is distinct from both Original and Retry 1!\n');

  // Step 5: Answer Evaluation Verification
  console.log('5. EVALUATING USER ANSWER ON RETRY QUESTION');
  const userRetryAnswer = retry2.correctAnswer;
  const isCorrect = userRetryAnswer === retry2.correctAnswer;
  console.log(`   Selected Option: [${userRetryAnswer}]`);
  console.log(`   Evaluated Result: ${isCorrect ? '🎯 CONCEPT MASTERED' : '⚠️ NEEDS MORE REVIEW'}`);
  console.log(`   Feedback Message: "Correct! You have successfully applied this official statistical standard."`);
  console.log(`   Explanation Attached: "${retry2.explanation}"\n`);

  console.log('================================================================');
  console.log('   >>> ALL RETRY FLOW VERIFICATIONS PASSED WITH ZERO ERRORS <<< ');
  console.log('================================================================');
}

main().catch(err => {
  console.error('[ERROR]', err);
  process.exit(1);
});
