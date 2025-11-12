// routes/opencircle.routes.js
import express from 'express';
import { quizController, commentController } from '../controllers/OpencircleQuiz.js';

const router = express.Router();

// Quiz endpoints
router.post('/askquiz', quizController.createQuiz);
router.get('/askquiz', quizController.getAllQuizzes);
router.get('/askquiz/:id', quizController.getQuizById);
router.put('/askquiz/:id', quizController.updateQuiz);
router.delete('/askquiz/:id', quizController.deleteQuiz);

// Comment endpoints nested under a quiz
router.post('/askquiz/:quizId/comments', commentController.createComment);
router.get('/askquiz/:quizId/comments', commentController.getCommentsForQuiz);
router.delete('/askquiz/:quizId/comments/:id', commentController.deleteComment);

export default router;
