// src/routes/storyRoutes.js
import express from 'express';
import * as storyController from '../controllers/storyController.js';

const router = express.Router();

router.post('/stories', storyController.createStory);
router.get('/stories', storyController.getAllStories);
router.get('/stories/:id', storyController.getStoryById);
router.put('/stories/:id', storyController.updateStory);
router.delete('/stories/:id', storyController.deleteStory);

export default router;