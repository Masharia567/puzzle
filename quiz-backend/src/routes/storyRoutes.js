// src/routes/storyRoutes.js
import express from 'express';
import * as storyController from '../controllers/storyController.js';

const router = express.Router();

// 📝 Story CRUD
router.post('/stories', storyController.createStory);
router.get('/stories', storyController.getAllStories);
router.get('/stories/:id', storyController.getStoryById);
router.put('/stories/:id', storyController.updateStory);
router.delete('/stories/:id', storyController.deleteStory);

// 💬 Comment on a story
router.post('/stories/:id/comments', storyController.createCommentForStory);
router.get('/stories/:id/comments', storyController.getCommentsByStory);

// ❤️ Like / Unlike a story
router.post('/stories/:id/like', storyController.likeStory);
router.post('/stories/:id/unlike', storyController.unlikeStory);

export default router;
