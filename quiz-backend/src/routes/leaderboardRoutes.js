import express from 'express';
import {
  addLeaderboardEntry,
  getLeaderboard
} from '../controllers/leaderboardController.js';

const router = express.Router();

router.post('/leaderboard', addLeaderboardEntry);
router.get('/leaderboard', getLeaderboard);

export default router;
