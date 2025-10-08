import express from 'express';
import {
  createQuiz,
  getAllQuizzes,
  getQuizById,
  startQuizAttempt,
  submitAnswer,
  completeQuizAttempt,
  getUserAttempts,
  deleteQuiz
} from '../controllers/quizController.js';

const router = express.Router();

// Quiz routes
router.post('/quizzes', createQuiz);
router.get('/quizzes', getAllQuizzes);
router.get('/quizzes/:id', getQuizById);
router.delete('/quizzes/:id', deleteQuiz);

// Quiz attempt routes
router.post('/attempts/start', startQuizAttempt);
router.post('/attempts/answer', submitAnswer);
router.put('/attempts/:attemptId/complete', completeQuizAttempt);
router.get('/attempts/user/:userId', getUserAttempts);

export default router;