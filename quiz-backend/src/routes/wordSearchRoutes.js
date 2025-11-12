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
router.get('/wordsearch', getAllPuzzles);
router.get('/wordsearch/:id', getPuzzleById);
router.post('/wordsearch', createPuzzle);
router.put('/wordsearch/:id', updatePuzzle);
router.delete('/wordsearch/:id', deletePuzzle);
router.patch('/wordsearch/:id/publish', togglePublish);

// Game Play Routes
router.post('/wordsearch/start', startPuzzle);
router.post('/completions', startPuzzle); // ✨ ADD THIS ALIAS
router.put('/completions/:completionId', submitCompletion);

// User Progress Routes
router.get('/users/:userId/completions', getUserCompletions);

// Statistics Routes
router.get('/puzzles/:id/stats', getPuzzleStats);

export default router;