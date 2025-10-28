// routes/adminGameRoutes.js
import express from "express";
import {
  createPuzzle,
  getAllPuzzlesAdmin,
  getPuzzleByIdAdmin,
  updatePuzzle,
  deletePuzzle,
  togglePuzzleStatus,
  getPuzzleStats,
}  from "../controllers/adminGameController.js";
 // ✅ fixed path

const router = express.Router();

// Admin puzzle management routes
router.post("/game", createPuzzle);                          // Create puzzle
router.get("/game", getAllPuzzlesAdmin);                     // Get all puzzles (with filters)
router.get("/game/:id", getPuzzleByIdAdmin);                 // Get single puzzle
router.put("/game/:id", updatePuzzle);                       // Update puzzle
router.delete("/game/:id", deletePuzzle);                    // Delete puzzle
router.patch("/game/:id/toggle", togglePuzzleStatus);        // Toggle active status
router.get("/game/:id/stats", getPuzzleStats);               // Get puzzle statistics

export default router;
