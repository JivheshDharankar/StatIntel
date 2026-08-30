import { Router } from 'express';
import { QuizController } from '../controllers/quiz.controller';

const router = Router();

// Generate grounded quiz via RAG + Gemini
router.post('/generate', QuizController.generateQuiz);

// Get quiz by ID
router.get('/:quizId', QuizController.getQuizById);

// Submit quiz answers for scoring, evidence update, and gap closure
router.post('/:quizId/submit', QuizController.submitQuiz);
// Generate quick revision notes for mistakes
router.post('/revision-notes', QuizController.generateRevisionNotes);

// Generate novel retry question testing weak concept without duplicates
router.post('/retry', QuizController.generateRetryQuestion);

export default router;
