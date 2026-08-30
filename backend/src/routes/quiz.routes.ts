import { Router } from 'express';
import { QuizController } from '../controllers/quiz.controller';

const router = Router();

// Generate grounded quiz via RAG + Gemini
router.post('/generate', QuizController.generateQuiz);

// Get quiz by ID
router.get('/:quizId', QuizController.getQuizById);

// Submit quiz answers for scoring, evidence update, and gap closure
router.post('/:quizId/submit', QuizController.submitQuiz);
router.post('/submit', QuizController.submitQuiz);

export default router;
