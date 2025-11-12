import express from 'express';
import {
  createQuiz,
  getAllQuizzes,
  getQuizById,
  updateQuiz,
  updateQuizStatus,
  toggleQuizPublish, // ADD THIS
  startQuizAttempt,
  submitAnswer,
  submitQuizAnswers,
  completeQuizAttempt,
  getUserAttempts,
  deleteQuiz
} from '../controllers/quizController.js';

const router = express.Router();

// Quiz routes
router.post('/quizzes', createQuiz);
router.get('/quizzes', getAllQuizzes);
router.get('/quizzes/:id', getQuizById);
router.put('/quizzes/:id', updateQuiz);
router.patch('/quizzes/:id/status', updateQuizStatus);
router.patch('/quizzes/:id/publish', toggleQuizPublish); // ADD THIS LINE
router.delete('/quizzes/:id', deleteQuiz);

// Quiz submission route
router.post('/quizzes/:id/submit', submitQuizAnswers);

// Quiz attempt routes (individual answer submission)
router.post('/attempts/start', startQuizAttempt);
router.post('/attempts/answer', submitAnswer);
router.put('/attempts/:attemptId/complete', completeQuizAttempt);
router.get('/attempts/user/:userId', getUserAttempts);

export default router;