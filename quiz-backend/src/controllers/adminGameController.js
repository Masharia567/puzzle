// controllers/adminGameController.js
import { initializeModels } from '../models/index.js';

/**
 * Utility function to get models
 */
async function getModels() {
  const db = await initializeModels();
  return db;
}

/**
 * @desc Create a new puzzle (Admin only)
 * @route POST /api/admin/puzzles
 */
export const createPuzzle = async (req, res) => {
  try {
    const { WordLegendPuzzle } = await getModels();
    const { category, difficulty, gridSize, gridData, possibleWords, createdBy } = req.body;

    // Validation
    if (!gridData || !possibleWords || !Array.isArray(possibleWords)) {
      return res.status(400).json({ success: false, message: "Grid data and possible words are required" });
    }
    if (!gridSize || gridSize < 3 || gridSize > 6) {
      return res.status(400).json({ success: false, message: "Grid size must be between 3 and 6" });
    }

    const puzzle = await WordLegendPuzzle.create({
      CATEGORY: category || "General",
      DIFFICULTY: difficulty || "medium",
      GRID_SIZE: gridSize,
      GRID_DATA: JSON.stringify(gridData),
      POSSIBLE_WORDS: JSON.stringify(possibleWords),
      TOTAL_WORDS: possibleWords.length,
      CREATED_BY: createdBy || null,
      IS_ACTIVE: true,
    });

    res.status(201).json({ success: true, message: "Puzzle created successfully", data: puzzle });
  } catch (error) {
    console.error("Create puzzle error:", error);
    res.status(500).json({ success: false, message: "Error creating puzzle", error: error.message });
  }
};

/**
 * @desc Get all puzzles (Admin view)
 * @route GET /api/admin/puzzles
 */
export const getAllPuzzlesAdmin = async (req, res) => {
  try {
    const { WordLegendPuzzle } = await getModels();
    const { category, difficulty, isActive, page = 1, limit = 10 } = req.query;

    const where = {};
    if (category) where.CATEGORY = category;
    if (difficulty) where.DIFFICULTY = difficulty;
    if (isActive !== undefined) where.IS_ACTIVE = isActive === "true";

    const offset = (page - 1) * limit;
    const { count, rows: puzzles } = await WordLegendPuzzle.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["CREATED_AT", "DESC"]],
    });

    res.status(200).json({
      success: true,
      data: puzzles,
      pagination: { total: count, page: parseInt(page), pages: Math.ceil(count / limit) },
    });
  } catch (error) {
    console.error("Get all puzzles error:", error);
    res.status(500).json({ success: false, message: "Error fetching puzzles", error: error.message });
  }
};

/**
 * @desc Get puzzle by ID (Admin)
 * @route GET /api/admin/puzzles/:id
 */
export const getPuzzleByIdAdmin = async (req, res) => {
  try {
    const { WordLegendPuzzle } = await getModels();
    const puzzle = await WordLegendPuzzle.findByPk(req.params.id);

    if (!puzzle) return res.status(404).json({ success: false, message: "Puzzle not found" });

    res.status(200).json({ success: true, data: puzzle });
  } catch (error) {
    console.error("Get puzzle error:", error);
    res.status(500).json({ success: false, message: "Error fetching puzzle", error: error.message });
  }
};

/**
 * @desc Update puzzle
 * @route PUT /api/admin/puzzles/:id
 */
export const updatePuzzle = async (req, res) => {
  try {
    const { WordLegendPuzzle } = await getModels();
    const puzzle = await WordLegendPuzzle.findByPk(req.params.id);

    if (!puzzle) return res.status(404).json({ success: false, message: "Puzzle not found" });

    const { category, difficulty, gridSize, gridData, possibleWords, isActive } = req.body;

    if (category) puzzle.CATEGORY = category;
    if (difficulty) puzzle.DIFFICULTY = difficulty;
    if (gridSize) puzzle.GRID_SIZE = gridSize;
    if (gridData) puzzle.GRID_DATA = JSON.stringify(gridData);
    if (possibleWords) {
      puzzle.POSSIBLE_WORDS = JSON.stringify(possibleWords);
      puzzle.TOTAL_WORDS = possibleWords.length;
    }
    if (isActive !== undefined) puzzle.IS_ACTIVE = isActive;

    await puzzle.save();

    res.status(200).json({ success: true, message: "Puzzle updated successfully", data: puzzle });
  } catch (error) {
    console.error("Update puzzle error:", error);
    res.status(500).json({ success: false, message: "Error updating puzzle", error: error.message });
  }
};

/**
 * @desc Delete puzzle
 * @route DELETE /api/admin/puzzles/:id
 */
export const deletePuzzle = async (req, res) => {
  try {
    const { WordLegendPuzzle } = await getModels();
    const puzzle = await WordLegendPuzzle.findByPk(req.params.id);

    if (!puzzle) return res.status(404).json({ success: false, message: "Puzzle not found" });

    await puzzle.destroy();
    res.status(200).json({ success: true, message: "Puzzle deleted successfully" });
  } catch (error) {
    console.error("Delete puzzle error:", error);
    res.status(500).json({ success: false, message: "Error deleting puzzle", error: error.message });
  }
};

/**
 * @desc Toggle puzzle active status
 * @route PATCH /api/admin/puzzles/:id/toggle
 */
export const togglePuzzleStatus = async (req, res) => {
  try {
    const { WordLegendPuzzle } = await getModels();
    const puzzle = await WordLegendPuzzle.findByPk(req.params.id);

    if (!puzzle) return res.status(404).json({ success: false, message: "Puzzle not found" });

    puzzle.IS_ACTIVE = !puzzle.IS_ACTIVE;
    await puzzle.save();

    res.status(200).json({ success: true, message: `Puzzle ${puzzle.IS_ACTIVE ? "activated" : "deactivated"}`, data: puzzle });
  } catch (error) {
    console.error("Toggle status error:", error);
    res.status(500).json({ success: false, message: "Error toggling puzzle status", error: error.message });
  }
};

/**
 * @desc Get puzzle statistics
 * @route GET /api/admin/puzzles/:id/stats
 */
export const getPuzzleStats = async (req, res) => {
  try {
    const { WordLegendPuzzle, WordLegendUserProgress } = await getModels();

    const puzzle = await WordLegendPuzzle.findByPk(req.params.id, {
      include: [{ model: WordLegendUserProgress, as: "userProgress" }],
    });

    if (!puzzle) return res.status(404).json({ success: false, message: "Puzzle not found" });

    const stats = {
      puzzleId: puzzle.PUZZLE_ID,
      category: puzzle.CATEGORY,
      difficulty: puzzle.DIFFICULTY,
      totalPlays: puzzle.PLAYS_COUNT,
      avgCompletionTime: puzzle.AVG_COMPLETION_TIME,
      completionRate: puzzle.userProgress
        ? (puzzle.userProgress.filter((p) => p.COMPLETED).length / puzzle.userProgress.length) * 100
        : 0,
    };

    res.status(200).json({ success: true, data: stats });
  } catch (error) {
    console.error("Get stats error:", error);
    res.status(500).json({ success: false, message: "Error fetching statistics", error: error.message });
  }
  
};
export const getActivePuzzles = async (req, res) => {
  try {
    const { WordLegendPuzzle } = await initializeModels();

    const puzzles = await WordLegendPuzzle.findAll({
      where: { IS_ACTIVE: true },
      order: [["CREATED_AT", "DESC"]],
    });

    res.status(200).json({ success: true, data: puzzles });
  } catch (error) {
    console.error("Get active puzzles error:", error);
    res.status(500).json({ success: false, message: "Error fetching active puzzles", error: error.message });
  }
};
export const getPuzzleForPlay = async (req, res) => {
  try {
    const { WordLegendPuzzle } = await initializeModels();

    // Example: fetch a random active puzzle
    const puzzles = await WordLegendPuzzle.findAll({
      where: { IS_ACTIVE: true },
      order: [["CREATED_AT", "DESC"]],
    });

    if (!puzzles.length) {
      return res.status(404).json({ success: false, message: "No active puzzles found" });
    }

    // Pick one puzzle randomly
    const puzzle = puzzles[Math.floor(Math.random() * puzzles.length)];

    res.status(200).json({ success: true, data: puzzle });
  } catch (error) {
    console.error("Get puzzle for play error:", error);
    res.status(500).json({ success: false, message: "Error fetching puzzle", error: error.message });
  }
};
export const getUserProgress = async (req, res) => {
  try {
    const { WordLegendUserProgress, WordLegendPuzzle, User } = await initializeModels();
    const { userId } = req.params;

    // Fetch all progress for the user
    const progress = await WordLegendUserProgress.findAll({
      where: { USER_ID: userId },
      include: [
        {
          model: WordLegendPuzzle,
          as: 'puzzle',
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'email'], // optional
        },
      ],
    });

    res.status(200).json({ success: true, data: progress });
  } catch (error) {
    console.error("Get user progress error:", error);
    res.status(500).json({ success: false, message: "Error fetching user progress", error: error.message });
  }
};
export const startPuzzle = async (req, res) => {
  try {
    const { WordLegendUserProgress, WordLegendPuzzle } = await initializeModels();
    const { userId, puzzleId } = req.body;

    const puzzle = await WordLegendPuzzle.findByPk(puzzleId);
    if (!puzzle || !puzzle.IS_ACTIVE) {
      return res.status(404).json({ success: false, message: "Puzzle not found or inactive" });
    }

    const existing = await WordLegendUserProgress.findOne({
      where: { USER_ID: userId, PUZZLE_ID: puzzleId },
    });

    if (existing) {
      return res.status(200).json({ success: true, data: existing });
    }

    const progress = await WordLegendUserProgress.create({
      USER_ID: userId,
      PUZZLE_ID: puzzleId,
      COMPLETED: false,
      STARTED_AT: new Date(),
    });

    res.status(201).json({ success: true, data: progress });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error starting puzzle", error: error.message });
  }
};
export const submitWord = async (req, res) => {
  try {
    const { WordLegendPuzzle, WordLegendUserProgress, WordLegendSubmission } = await initializeModels();
    const { userId, puzzleId, word } = req.body;

    const puzzle = await WordLegendPuzzle.findByPk(puzzleId);
    if (!puzzle || !puzzle.IS_ACTIVE) {
      return res.status(404).json({ success: false, message: "Puzzle not found or inactive" });
    }

    const possibleWords = JSON.parse(puzzle.POSSIBLE_WORDS);
    const isCorrect = possibleWords.includes(word);

    const submission = await WordLegendSubmission.create({
      USER_ID: userId,
      PUZZLE_ID: puzzleId,
      WORD: word,
      IS_CORRECT: isCorrect,
      SUBMITTED_AT: new Date(),
    });

    // Update user progress
    let progress = await WordLegendUserProgress.findOne({
      where: { USER_ID: userId, PUZZLE_ID: puzzleId },
    });

    if (!progress) {
      progress = await WordLegendUserProgress.create({
        USER_ID: userId,
        PUZZLE_ID: puzzleId,
        COMPLETED: false,
        STARTED_AT: new Date(),
      });
    }

    if (isCorrect) {
      const correctCount = await WordLegendSubmission.count({
        where: { USER_ID: userId, PUZZLE_ID: puzzleId, IS_CORRECT: true },
      });

      if (correctCount >= possibleWords.length) {
        progress.COMPLETED = true;
        progress.COMPLETED_AT = new Date();
        await progress.save();
      }
    }

    res.status(201).json({
      success: true,
      message: isCorrect ? "Correct word!" : "Incorrect word",
      data: submission,
    });
  } catch (error) {
    console.error("Submit word error:", error);
    res.status(500).json({ success: false, message: "Error submitting word", error: error.message });
  }
};
export const updateTimeSpent = async (req, res) => {
  try {
    const { WordLegendUserProgress } = await initializeModels();
    const { userId, puzzleId, timeSpent } = req.body;

    // Find user progress
    const progress = await WordLegendUserProgress.findOne({
      where: { USER_ID: userId, PUZZLE_ID: puzzleId },
    });

    if (!progress) {
      return res.status(404).json({ success: false, message: "User progress not found" });
    }

    // Update time spent
    progress.TIME_SPENT = (progress.TIME_SPENT || 0) + timeSpent; // assuming TIME_SPENT is in seconds
    await progress.save();

    res.status(200).json({ success: true, message: "Time updated successfully", data: progress });
  } catch (error) {
    console.error("Update time spent error:", error);
    res.status(500).json({ success: false, message: "Error updating time spent", error: error.message });
  }
};
