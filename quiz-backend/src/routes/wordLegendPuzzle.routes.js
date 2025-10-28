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

// Game routes
router.get("/puzzles", getActivePuzzles);
router.get("/puzzles/:id", getPuzzleForPlay);
router.post("/start/:puzzleId", startPuzzle);
router.post("/submit", submitWord);
router.get("/progress/:userId/:puzzleId", getUserProgress);
router.patch("/progress/:userId/:puzzleId/time", updateTimeSpent);

export default router;
