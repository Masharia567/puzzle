// routes/gameRoutes.js
import express from "express";
import {
  getActivePuzzles,
  getPuzzleForPlay,
  startPuzzle,
  submitWord,
  getUserProgress,
  updateTimeSpent,
} from "../controllers/adminGameController.js";


const router = express.Router();

// User game routes
router.get("/puzzles", getActivePuzzles);                             // Get all active puzzles
router.get("/puzzles/:id", getPuzzleForPlay);                         // Get single puzzle for playing
router.post("/puzzles/:id/start", startPuzzle);                       // Start a puzzle
router.post("/puzzles/:id/submit", submitWord);                       // Submit a word
router.get("/puzzles/:id/progress/:userId", getUserProgress);         // Get user progress
router.patch("/puzzles/:id/time", updateTimeSpent);                   // Update time spent

export default router;