import { Request, Response } from 'express';
import { QuizService } from '../services/quiz.service';
import { DEMO_OFFICIAL_PROFILE } from '../data/seedData';

export class QuizController {
  /**
   * Generates a grounded assessment quiz via RAG + Gemini
   */
  static async generateQuiz(req: Request, res: Response) {
    try {
      const { 
        topic = 'Sampling', 
        question_count = 5, 
        num_questions, 
        difficulty = 'medium',
        target_level,
        profileId = DEMO_OFFICIAL_PROFILE.id 
      } = req.body;

      const count = Number(num_questions || question_count) || 5;
      const diff = target_level || difficulty || 'medium';

      const quiz = await QuizService.generateQuiz({
        topic,
        questionCount: count,
        difficulty: diff,
        profileId
      });

      // Return sanitized questions (without exposing server-side correctAnswer directly if frontend just displays options)
      const sanitizedQuestions = quiz.questions.map(q => ({
        id: q.id,
        questionNumber: q.questionNumber,
        question: q.question,
        options: q.options,
        sourceDocument: q.sourceDocument,
        sourcePage: q.sourcePage,
        sourceChunkId: q.sourceChunkId
      }));

      return res.json({
        success: true,
        quizId: quiz.id,
        topic: quiz.topic,
        competencyId: quiz.competencyId,
        competencyName: quiz.competencyName,
        difficulty: quiz.difficulty,
        totalQuestions: quiz.totalQuestions,
        sourceDocument: quiz.sourceDocument,
        questions: sanitizedQuestions,
        createdAt: quiz.createdAt
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        error: 'Failed to generate assessment quiz',
        message: err.message
      });
    }
  }

  /**
   * Retrieves a generated quiz by ID
   */
  static async getQuizById(req: Request, res: Response) {
    try {
      const { quizId } = req.params;
      const quiz = QuizService.getQuizById(quizId);

      if (!quiz) {
        return res.status(404).json({
          success: false,
          error: `Quiz '${quizId}' not found.`
        });
      }

      const sanitizedQuestions = quiz.questions.map(q => ({
        id: q.id,
        questionNumber: q.questionNumber,
        question: q.question,
        options: q.options,
        sourceDocument: q.sourceDocument,
        sourcePage: q.sourcePage,
        sourceChunkId: q.sourceChunkId
      }));

      return res.json({
        success: true,
        data: {
          ...quiz,
          questions: sanitizedQuestions
        }
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        error: 'Internal server error while fetching quiz',
        message: err.message
      });
    }
  }

  /**
   * Submits user answers, calculates score, records competency evidence, updates user competency,
   * calculates gap closure percentage, and returns next recommendations.
   */
  static async submitQuiz(req: Request, res: Response) {
    try {
      const { quizId } = req.params;
      const { 
        answers, 
        profileId = DEMO_OFFICIAL_PROFILE.id, 
        impactWeight = 0.25 
      } = req.body;

      if (!answers || Object.keys(answers).length === 0) {
        return res.status(400).json({
          success: false,
          error: 'No answers provided for submission.'
        });
      }

      const result = await QuizService.submitQuizAttempt(
        quizId,
        profileId,
        answers,
        Number(impactWeight) || 0.25
      );

      return res.json({
        success: true,
        data: result
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        error: 'Quiz submission error',
        message: err.message
      });
    }
  }

  /**
   * Generates grounded quick revision notes for mistaken questions
   */
  static async generateRevisionNotes(req: Request, res: Response) {
    try {
      const { incorrectQuestions = [], topic = 'Sampling' } = req.body;
      const { RevisionService } = await import('../services/revision.service');
      const notes = await RevisionService.generateRevisionNotes(incorrectQuestions, topic);
      return res.json({
        success: true,
        topic,
        count: notes.length,
        notes
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        error: 'Failed to generate revision notes',
        message: err.message
      });
    }
  }

  /**
   * Generates a novel scenario retry question targeting a specific weak concept
   * while strictly avoiding duplication of original assessment questions.
   */
  static async generateRetryQuestion(req: Request, res: Response) {
    try {
      const { topic = 'Sampling', concept, excludeQuestions = [], difficulty = 'medium' } = req.body;
      const question = await QuizService.generateRetryQuestion({
        topic,
        concept,
        excludeQuestions,
        difficulty
      });

      return res.json({
        success: true,
        topic,
        concept: concept || topic,
        question: {
          id: question.id,
          questionNumber: 1,
          question: question.question,
          options: question.options,
          correctAnswer: question.correctAnswer,
          explanation: question.explanation,
          sourceDocument: question.sourceDocument,
          sourcePage: question.sourcePage,
          sourceChunkId: question.sourceChunkId
        }
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        error: 'Failed to generate retry question',
        message: err.message
      });
    }
  }
}
