// src/controllers/wordSearchController.js
import { initializeModels } from '../models/index.js';
import { Sequelize } from 'sequelize';

// Get models (lazy initialization)
let modelsCache = null;

async function getModels() {
  if (!modelsCache) {
    const models = await initializeModels();
    // Map WordSearchModel to WordSearch for consistency
    modelsCache = {
      ...models,
      WordSearch: models.WordSearchModel
    };
  }
  return modelsCache;
}

// Get all word search puzzles
export const getAllPuzzles = async (req, res) => {
  try {
    const { WordSearch } = await getModels();
    const { published } = req.query;
    
    const where = {};
    if (published !== undefined) {
      where.is_published = published === 'true';
    }

    const puzzles = await WordSearch.findAll({
      where,
      attributes: ['puzzle_id', 'title', 'category', 'difficulty', 'grid_size', 'is_published', 'created_at'],
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      data: puzzles
    });
  } catch (error) {
    console.error('Error fetching puzzles:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch puzzles',
      error: error.message
    });
  }
};

// Get single puzzle by ID
export const getPuzzleById = async (req, res) => {
  try {
    const { WordSearch } = await getModels();
    const { id } = req.params;

    const puzzle = await WordSearch.findByPk(id);

    if (!puzzle) {
      return res.status(404).json({
        success: false,
        message: 'Puzzle not found'
      });
    }

    res.json({
      success: true,
      data: puzzle
    });
  } catch (error) {
    console.error('Error fetching puzzle:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch puzzle',
      error: error.message
    });
  }
};

// Create new puzzle
export const createPuzzle = async (req, res) => {
  try {
    const { WordSearch } = await getModels();
    const { title, category, difficulty, words, grid, word_placements, grid_size, is_published, created_by } = req.body;

    // Validate required fields
    if (!title || !words || !grid) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: title, words, and grid are required'
      });
    }

    const puzzle = await WordSearch.create({
      title,
      category,
      difficulty: difficulty || 'medium',
      words,
      grid,
      word_placements,
      grid_size: grid_size || 15,
      is_published: is_published || false,
      created_by
    });

    res.status(201).json({
      success: true,
      message: 'Puzzle created successfully',
      data: puzzle
    });
  } catch (error) {
    console.error('Error creating puzzle:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create puzzle',
      error: error.message
    });
  }
};

// Update puzzle
export const updatePuzzle = async (req, res) => {
  try {
    const { WordSearch } = await getModels();
    const { id } = req.params;
    const updates = req.body;

    const puzzle = await WordSearch.findByPk(id);

    if (!puzzle) {
      return res.status(404).json({
        success: false,
        message: 'Puzzle not found'
      });
    }

    await puzzle.update(updates);

    res.json({
      success: true,
      message: 'Puzzle updated successfully',
      data: puzzle
    });
  } catch (error) {
    console.error('Error updating puzzle:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update puzzle',
      error: error.message
    });
  }
};

// Delete puzzle
export const deletePuzzle = async (req, res) => {
  try {
    const { WordSearch, WordSearchCompletion } = await getModels();
    const { id } = req.params;

    const puzzle = await WordSearch.findByPk(id);

    if (!puzzle) {
      return res.status(404).json({
        success: false,
        message: 'Puzzle not found'
      });
    }

    // Delete associated completions first (if not using CASCADE)
    await WordSearchCompletion.destroy({
      where: { puzzle_id: id }
    });

    await puzzle.destroy();

    res.json({
      success: true,
      message: 'Puzzle deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting puzzle:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete puzzle',
      error: error.message
    });
  }
};

// Toggle publish status
export const togglePublish = async (req, res) => {
  try {
    const { WordSearch } = await getModels();
    const { id } = req.params;

    const puzzle = await WordSearch.findByPk(id);

    if (!puzzle) {
      return res.status(404).json({
        success: false,
        message: 'Puzzle not found'
      });
    }

    puzzle.is_published = !puzzle.is_published;
    await puzzle.save();

    res.json({
      success: true,
      message: `Puzzle ${puzzle.is_published ? 'published' : 'unpublished'} successfully`,
      data: puzzle
    });
  } catch (error) {
    console.error('Error toggling publish status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle publish status',
      error: error.message
    });
  }
};

// Start a puzzle attempt
export const startPuzzle = async (req, res) => {
  try {
    const { WordSearch, WordSearchCompletion } = await getModels();
    const { puzzle_id, user_id } = req.body;

    if (!puzzle_id || !user_id) {
      return res.status(400).json({
        success: false,
        message: 'puzzle_id and user_id are required'
      });
    }

    // Check if puzzle exists
    const puzzle = await WordSearch.findByPk(puzzle_id);
    if (!puzzle) {
      return res.status(404).json({
        success: false,
        message: 'Puzzle not found'
      });
    }

    // Check for existing incomplete attempt
    const existingAttempt = await WordSearchCompletion.findOne({
      where: {
        puzzle_id,
        user_id,
        is_completed: false
      }
    });

    if (existingAttempt) {
      return res.json({
        success: true,
        message: 'Resuming existing attempt',
        data: existingAttempt
      });
    }

    // Create new attempt
    const completion = await WordSearchCompletion.create({
      puzzle_id,
      user_id,
      words_found: [],
      started_at: new Date()
    });

    res.status(201).json({
      success: true,
      message: 'Puzzle attempt started',
      data: completion
    });
  } catch (error) {
    console.error('Error starting puzzle:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to start puzzle',
      error: error.message
    });
  }
};

// Submit puzzle completion
export const submitCompletion = async (req, res) => {
  try {
    const { WordSearch, WordSearchCompletion } = await getModels();
    const { completionId } = req.params;
    const { words_found, time_taken } = req.body;

    const completion = await WordSearchCompletion.findByPk(completionId, {
      include: [{
        model: WordSearch,
        as: 'puzzle'
      }]
    });

    if (!completion) {
      return res.status(404).json({
        success: false,
        message: 'Completion record not found'
      });
    }

    const totalWords = completion.puzzle.words.length;
    const wordsFoundCount = words_found.length;
    const percentage = (wordsFoundCount / totalWords) * 100;
    const isCompleted = wordsFoundCount === totalWords;

    // Calculate score (10 points per word, bonus for completion)
    let score = wordsFoundCount * 10;
    if (isCompleted) {
      score += 50; // Completion bonus
    }

    await completion.update({
      words_found,
      time_taken,
      score,
      percentage: percentage.toFixed(2),
      is_completed: isCompleted,
      completed_at: isCompleted ? new Date() : null
    });

    res.json({
      success: true,
      message: isCompleted ? 'Puzzle completed!' : 'Progress saved',
      data: completion
    });
  } catch (error) {
    console.error('Error submitting completion:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit completion',
      error: error.message
    });
  }
};

// Get user's completions
export const getUserCompletions = async (req, res) => {
  try {
    const { WordSearch, WordSearchCompletion } = await getModels();
    const { userId } = req.params;

    const completions = await WordSearchCompletion.findAll({
      where: { user_id: userId },
      include: [{
        model: WordSearch,
        as: 'puzzle',
        attributes: ['puzzle_id', 'title', 'category', 'difficulty']
      }],
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      data: completions
    });
  } catch (error) {
    console.error('Error fetching user completions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user completions',
      error: error.message
    });
  }
};

// Get puzzle statistics
export const getPuzzleStats = async (req, res) => {
  try {
    const { WordSearchCompletion } = await getModels();
    const { id } = req.params;

    const completions = await WordSearchCompletion.findAll({
      where: { puzzle_id: id }
    });

    const totalAttempts = completions.length;
    const completedAttempts = completions.filter(c => c.is_completed).length;
    const avgTime = completions.length > 0
      ? completions.reduce((sum, c) => sum + (c.time_taken || 0), 0) / completions.length
      : 0;
    const avgScore = completions.length > 0
      ? completions.reduce((sum, c) => sum + (c.score || 0), 0) / completions.length
      : 0;

    res.json({
      success: true,
      data: {
        total_attempts: totalAttempts,
        completed_attempts: completedAttempts,
        completion_rate: totalAttempts > 0 ? (completedAttempts / totalAttempts * 100).toFixed(2) : 0,
        average_time: avgTime.toFixed(2),
        average_score: avgScore.toFixed(2)
      }
    });
  } catch (error) {
    console.error('Error fetching puzzle stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch puzzle statistics',
      error: error.message
    });
  }
};