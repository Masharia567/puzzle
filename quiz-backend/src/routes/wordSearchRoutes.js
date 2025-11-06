// src/routes/wordSearchRoutes.js
import express from 'express';
import {
  getAllPuzzles,
  getPuzzleById,
  createPuzzle,
  updatePuzzle,
  deletePuzzle,
  togglePublish,
  startPuzzle,
  submitCompletion,
  getUserCompletions,
  getPuzzleStats
} from '../controllers/wordSearchController.js';

const router = express.Router();

// Puzzle Management Routes
router.get('/wordsearch', getAllPuzzles);                    // Get all puzzles
router.get('/wordsearch/:id', getPuzzleById);                // Get single puzzle
router.post('/wordsearch', createPuzzle);                    // Create new puzzle
router.put('/wordsearch/:id', updatePuzzle);                 // Update puzzle
router.delete('/wordsearch/:id', deletePuzzle);              // Delete puzzle
router.patch('/wordsearch/:id/publish', togglePublish);      // Toggle publish status

// Game Play Routes
router.post('/wordsearch/start', startPuzzle);               // Start puzzle attempt
router.put('/completions/:completionId', submitCompletion); // Submit/update completion

// User Progress Routes
router.get('/users/:userId/completions', getUserCompletions); // Get user's completions

// Statistics Routes
router.get('/puzzles/:id/stats', getPuzzleStats);         // Get puzzle statistics

export default router;