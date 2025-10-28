// src/routes/commentRoutes.js
import express from 'express';
import * as storyController from '../controllers/storyController.js';

const router = express.Router();

router.post('/comments', storyController.createComment);
router.get('/comments/story/:story_id', storyController.getCommentsByStory);
router.get('/comments/:id', storyController.getCommentById);
router.put('/comments/:id', storyController.updateComment);
router.delete('/comments/:id', storyController.deleteComment);
router.post('/comments/:id/like', storyController.likeComment);
router.post('/comments/:id/unlike', storyController.unlikeComment);

export default router;