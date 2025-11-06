import express from 'express';
import {
  createPuzzle,
  getPuzzles,
  getPuzzleById,
  updatePuzzle,
  deletePuzzle,
  togglePublishPuzzle,
  validateSolution,
  completePuzzle,
  getPuzzleAttempts,
  getMyCompletions,
  getPuzzleStats
} from '../controllers/puzzleController.js';

const router = express.Router();

// Get user's completions (must be before /:id routes)
router.get('/my-completions', getMyCompletions);

// Main puzzle routes
router.route('/')
  .get(getPuzzles)
  .post(createPuzzle);

// Specific puzzle action routes (must be before /:id)
router.post('/:id/validate', validateSolution);
router.post('/:id/complete', completePuzzle);
router.get('/:id/attempts', getPuzzleAttempts);
router.get('/:id/stats', getPuzzleStats);
router.patch('/:id/publish', togglePublishPuzzle);

// Specific puzzle routes (must be last)
router.route('/:id')
  .get(getPuzzleById)
  .put(updatePuzzle)
  .delete(deletePuzzle);

export default router;