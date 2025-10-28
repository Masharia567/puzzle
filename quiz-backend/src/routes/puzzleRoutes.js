import express from 'express';
import {
  createPuzzle,
  getPuzzles,
  getPuzzleById,
  updatePuzzle,
  deletePuzzle,
  validateSolution, // Ensure this is imported
  completePuzzle,
  getMyCompletions,
  getPuzzleStats
} from '../controllers/puzzleController.js';

const router = express.Router();

// Get user's completions (No auth)
router.get('/my-completions', getMyCompletions);

// Main puzzle routes
router.route('/')
  .get(getPuzzles)
  .post(createPuzzle);

// Specific puzzle routes
router.route('/:id')
  .get(getPuzzleById)
  .put(updatePuzzle)
  .delete(deletePuzzle);

// Completion, validation, and stats routes
router.post('/:id/validate', validateSolution); // Add this route
router.post('/:id/complete', completePuzzle);
router.get('/:id/stats', getPuzzleStats);

export default router;