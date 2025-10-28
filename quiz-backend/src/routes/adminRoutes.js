import express from "express";
import {
  createPuzzle,
  getAllPuzzles,
  getPuzzleById,
  updatePuzzle,
  deletePuzzle,
  togglePuzzleStatus,
} from "../controllers/adminController.js";

const router = express.Router();

// Admin routes
router.post("/puzzles", createPuzzle);
router.get("/puzzles", getAllPuzzles);
router.get("/puzzles/:id", getPuzzleById);
router.put("/puzzles/:id", updatePuzzle);
router.delete("/puzzles/:id", deletePuzzle);
router.patch("/puzzles/:id/toggle", togglePuzzleStatus);

export default router;
