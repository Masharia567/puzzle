import { initializeModels } from '../models/index.js';
import { validatePuzzleData, verifySolution } from '../routes/utils/puzzleHelpers.js';

const { Puzzle, PuzzleCompletion } = await initializeModels();

// @desc    Create a new puzzle
// @route   POST /api/puzzles
// @access  Private (Admin/Manager)
export const createPuzzle = async (req, res) => {
  try {
    const { title, type, difficulty, xpReward, timeLimit, content, solution } = req.body;

    // Validation
    if (!title || !type || !difficulty || xpReward === undefined || !content) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: title, type, difficulty, xpReward, and content'
      });
    }

    // Validate solution is provided
    if (!solution) {
      return res.status(400).json({
        success: false,
        message: 'Solution is required for puzzle creation'
      });
    }

    // Validate enum values
    const validTypes = ['sudoku', 'crossword', 'word_search'];
    const validDifficulties = ['easy', 'medium', 'hard'];

    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid puzzle type. Must be: sudoku, crossword, or word_search'
      });
    }

    if (!validDifficulties.includes(difficulty)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid difficulty. Must be: easy, medium, or hard'
      });
    }

    // Validate XP reward
    if (xpReward < 0) {
      return res.status(400).json({
        success: false,
        message: 'XP reward cannot be negative'
      });
    }

    // Validate time limit
    if (timeLimit !== undefined && timeLimit <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Time limit must be greater than 0'
      });
    }

    // Validate puzzle content based on type
    const validationResult = validatePuzzleData(type, content);
    if (!validationResult.isValid) {
      return res.status(400).json({
        success: false,
        message: validationResult.error
      });
    }

    // Validate solution matches the puzzle for Sudoku specifically
    if (type === 'sudoku') {
      if (!Array.isArray(solution) || solution.length !== 9 ||
          !solution.every(row => Array.isArray(row) && row.length === 9)) {
        return res.status(400).json({
          success: false,
          message: 'Solution must be a 9x9 array for Sudoku puzzles'
        });
      }

      // Check puzzle pre-filled cells match solution
      for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
          if (content[i][j] !== 0 && content[i][j] !== solution[i][j]) {
            return res.status(400).json({
              success: false,
              message: 'Puzzle content conflicts with provided solution'
            });
          }
        }
      }
    }

    // Create the puzzle
    const puzzle = await Puzzle.create({
      TITLE: title,
      TYPE: type,
      DIFFICULTY: difficulty,
      XP_REWARD: parseInt(xpReward),
      TIME_LIMIT: timeLimit ? parseInt(timeLimit) : null,
      PUZZLE_DATA: JSON.stringify({
        content: validationResult.processedData,
        solution
      }),
      CREATED_BY: req.user?.USER_ID || 1,
      IS_ACTIVE: true,
      COMPLETIONS_COUNT: 0,
      AVERAGE_TIME: null
    });

    res.status(201).json({
      success: true,
      message: 'Puzzle created successfully',
      data: {
        puzzleId: puzzle.PUZZLE_ID,
        title: puzzle.TITLE,
        type: puzzle.TYPE,
        difficulty: puzzle.DIFFICULTY,
        xpReward: puzzle.XP_REWARD,
        timeLimit: puzzle.TIME_LIMIT
      }
    });

  } catch (error) {
    console.error('Create puzzle error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating puzzle',
      error: error.message
    });
  }
};

// @desc    Get all puzzles with filters
// @route   GET /api/puzzles
// @access  Private
export const getPuzzles = async (req, res) => {
  try {
    const { type, difficulty, isActive, limit = 50, offset = 0 } = req.query;

    const where = {};
    const validTypes = ['sudoku', 'crossword', 'word_search'];
    const validDifficulties = ['easy', 'medium', 'hard'];

    if (type && validTypes.includes(type)) {
      where.TYPE = type;
    }

    if (difficulty && validDifficulties.includes(difficulty)) {
      where.DIFFICULTY = difficulty;
    }

    if (isActive !== undefined) {
      where.IS_ACTIVE = isActive === 'true';
    }

    const puzzles = await Puzzle.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['CREATED_AT', 'DESC']],
      attributes: [
        'PUZZLE_ID',
        'TITLE',
        'TYPE',
        'DIFFICULTY',
        'XP_REWARD',
        'TIME_LIMIT',
        'IS_ACTIVE',
        'COMPLETIONS_COUNT',
        'AVERAGE_TIME',
        'CREATED_AT',
        'UPDATED_AT',
        'PUZZLE_DATA'
      ]
    });

    // Remove solution from puzzle data before sending
    const sanitizedPuzzles = puzzles.rows.map(puzzle => {
      const puzzleObj = puzzle.toJSON();
      try {
        const puzzleData = JSON.parse(puzzleObj.PUZZLE_DATA);
        puzzleObj.PUZZLE_DATA = puzzleData.content || puzzleData;
      } catch (e) {
        console.error('Error parsing puzzle data:', e);
      }
      return puzzleObj;
    });

    res.status(200).json({
      success: true,
      count: puzzles.count,
      data: sanitizedPuzzles,
      pagination: {
        total: puzzles.count,
        limit: parseInt(limit),
        offset: parseInt(offset),
        pages: Math.ceil(puzzles.count / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Get puzzles error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching puzzles',
      error: error.message
    });
  }
};

// @desc    Get single puzzle by ID
// @route   GET /api/puzzles/:id
// @access  Private
export const getPuzzleById = async (req, res) => {
  try {
    const puzzle = await Puzzle.findByPk(req.params.id);

    if (!puzzle) {
      return res.status(404).json({
        success: false,
        message: 'Puzzle not found'
      });
    }

    const puzzleObj = puzzle.toJSON();

    try {
      const puzzleData = JSON.parse(puzzleObj.PUZZLE_DATA);
      puzzleObj.PUZZLE_DATA = puzzleData.content || puzzleData;
    } catch (e) {
      console.error('Error parsing puzzle data:', e);
    }

    res.status(200).json({
      success: true,
      data: puzzleObj
    });

  } catch (error) {
    console.error('Get puzzle error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching puzzle',
      error: error.message
    });
  }
};

// @desc    Update puzzle
// @route   PUT /api/puzzles/:id
// @access  Private (Admin/Manager)
export const updatePuzzle = async (req, res) => {
  try {
    const { title, type, difficulty, xpReward, timeLimit, content, solution, isActive } = req.body;

    const puzzle = await Puzzle.findByPk(req.params.id);

    if (!puzzle) {
      return res.status(404).json({
        success: false,
        message: 'Puzzle not found'
      });
    }

    if (content && type) {
      const validationResult = validatePuzzleData(type, content);
      if (!validationResult.isValid) {
        return res.status(400).json({
          success: false,
          message: validationResult.error
        });
      }

      const existingData = JSON.parse(puzzle.PUZZLE_DATA);
      puzzle.PUZZLE_DATA = JSON.stringify({
        content: validationResult.processedData,
        solution: solution || existingData.solution
      });
    }

    if (title) puzzle.TITLE = title;
    if (type) puzzle.TYPE = type;
    if (difficulty) puzzle.DIFFICULTY = difficulty;
    if (xpReward !== undefined) puzzle.XP_REWARD = parseInt(xpReward);
    if (timeLimit !== undefined) puzzle.TIME_LIMIT = timeLimit ? parseInt(timeLimit) : null;
    if (isActive !== undefined) puzzle.IS_ACTIVE = isActive;

    await puzzle.save();

    res.status(200).json({
      success: true,
      message: 'Puzzle updated successfully',
      data: puzzle
    });

  } catch (error) {
    console.error('Update puzzle error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating puzzle',
      error: error.message
    });
  }
};

// @desc    Delete puzzle (soft delete - set IS_ACTIVE to false)
// @route   DELETE /api/puzzles/:id
// @access  Private (Admin/Manager)
export const deletePuzzle = async (req, res) => {
  try {
    const puzzle = await Puzzle.findByPk(req.params.id);

    if (!puzzle) {
      return res.status(404).json({
        success: false,
        message: 'Puzzle not found'
      });
    }

    puzzle.IS_ACTIVE = false;
    await puzzle.save();

    res.status(200).json({
      success: true,
      message: 'Puzzle deleted successfully'
    });

  } catch (error) {
    console.error('Delete puzzle error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting puzzle',
      error: error.message
    });
  }
};

// @desc    Validate user's solution (without completing)
// @route   POST /api/puzzles/:id/validate
// @access  Private
export const validateSolution = async (req, res) => {
  try {
    const { userSolution } = req.body;

    if (!userSolution) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a solution to validate'
      });
    }

    const puzzle = await Puzzle.findByPk(req.params.id);

    if (!puzzle) {
      return res.status(404).json({
        success: false,
        message: 'Puzzle not found'
      });
    }

    if (!puzzle.IS_ACTIVE) {
      return res.status(400).json({
        success: false,
        message: 'This puzzle is no longer active'
      });
    }

    const puzzleData = JSON.parse(puzzle.PUZZLE_DATA);
    const correctSolution = puzzleData.solution;

    if (!correctSolution) {
      return res.status(500).json({
        success: false,
        message: 'No solution available for this puzzle'
      });
    }

    let isCorrect = true;
    let incorrectCells = [];

    if (puzzle.TYPE === 'sudoku') {
      for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
          if (userSolution[i][j] !== correctSolution[i][j]) {
            isCorrect = false;
            incorrectCells.push({ row: i, col: j });
          }
        }
      }
    } else {
      isCorrect = verifySolution(puzzle.TYPE, puzzleData.content, userSolution);
    }

    res.status(200).json({
      success: true,
      isCorrect,
      incorrectCells: isCorrect ? [] : incorrectCells,
      message: isCorrect
        ? 'Congratulations! Solution is correct!'
        : `${incorrectCells.length} cell(s) are incorrect.`
    });

  } catch (error) {
    console.error('Validate solution error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error validating solution',
      error: error.message
    });
  }
};

// @desc    Submit puzzle completion
// @route   POST /api/puzzles/:id/complete
// @access  Private
export const completePuzzle = async (req, res) => {
  let transaction;

  try {
    const { timeTaken, solution } = req.body;
    const userId = req.user?.USER_ID || 1;

    if (!timeTaken || !solution) {
      return res.status(400).json({
        success: false,
        message: 'Please provide timeTaken and solution',
      });
    }

    const puzzle = await Puzzle.findByPk(req.params.id);

    if (!puzzle) {
      return res.status(404).json({
        success: false,
        message: 'Puzzle not found',
      });
    }

    if (!puzzle.IS_ACTIVE) {
      return res.status(400).json({
        success: false,
        message: 'This puzzle is no longer active',
      });
    }

    const puzzleData = JSON.parse(puzzle.PUZZLE_DATA);
    const correctSolution = puzzleData.solution;

    // Check existing attempts (for tracking attempt numbers)
    const existingAttempts = await PuzzleCompletion.findAll({
      where: { PUZZLE_ID: puzzle.PUZZLE_ID, USER_ID: userId }
    });

    const attemptNumber = existingAttempts.length;
    const attemptsRemaining = Math.max(0, 3 - attemptNumber);

    // Check if user has exceeded maximum attempts
    if (attemptNumber >= 3) {
      return res.status(403).json({
        success: false,
        message: 'Maximum attempts (3) reached for this puzzle. You cannot submit anymore.',
        data: {
          attemptNumber: attemptNumber,
          attemptsRemaining: 0,
          maxAttemptsReached: true
        }
      });
    }

    // Check if user has already completed this puzzle successfully
    const successfulCompletion = existingAttempts.find(attempt => attempt.IS_CORRECT === true);
    if (successfulCompletion) {
      return res.status(400).json({
        success: false,
        message: 'You have already successfully completed this puzzle!',
        data: {
          attemptNumber: attemptNumber,
          attemptsRemaining: 0,
          alreadyCompleted: true
        }
      });
    }

    // Verify the solution correctness
    let isCorrect = true;
    let incorrectCells = [];

    if (puzzle.TYPE === 'sudoku') {
      for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
          if (solution[i][j] !== correctSolution[i][j]) {
            isCorrect = false;
            incorrectCells.push({ row: i, col: j });
          }
        }
      }
    } else {
      isCorrect = verifySolution(puzzle.TYPE, puzzleData.content, solution);
    }

    // Start transaction
    transaction = await Puzzle.sequelize.transaction();

    // Record the attempt (whether correct or incorrect)
    await PuzzleCompletion.create(
      {
        PUZZLE_ID: puzzle.PUZZLE_ID,
        USER_ID: userId,
        TIME_TAKEN: timeTaken,
        XP_EARNED: isCorrect ? puzzle.XP_REWARD : 0,
        IS_CORRECT: isCorrect,
        SOLUTION_DATA: JSON.stringify(solution)
      },
      { transaction }
    );    

    if (!isCorrect) {
      await transaction.commit();
      return res.status(400).json({
        success: false,
        message: attemptsRemaining > 0 
          ? `Submitted solution is incorrect. You have ${attemptsRemaining} attempt(s) remaining.`
          : 'Submitted solution is incorrect. No more attempts remaining.',
        data: {
          attemptNumber: attemptNumber + 1,
          attemptsRemaining: attemptsRemaining,
          incorrectCells: incorrectCells.slice(0, 5) // Limit to first 5 for performance
        }
      });
    }

    // Update puzzle statistics (only for correct solutions)
    puzzle.COMPLETIONS_COUNT += 1;
    if (puzzle.AVERAGE_TIME === null) {
      puzzle.AVERAGE_TIME = timeTaken;
    } else {
      puzzle.AVERAGE_TIME = (puzzle.AVERAGE_TIME * (puzzle.COMPLETIONS_COUNT - 1) + timeTaken) / puzzle.COMPLETIONS_COUNT;
    }
    await puzzle.save({ transaction });

    await transaction.commit();

    res.status(200).json({
      success: true,
      message: 'Puzzle completed successfully',
      xpAwarded: puzzle.XP_REWARD,
      data: {
        attemptNumber: attemptNumber + 1,
        attemptsRemaining: attemptsRemaining
      }
    });
  } catch (error) {
    if (transaction) await transaction.rollback();
    console.error('Complete puzzle error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error completing puzzle',
      error: error.message,
    });
  }
};

// @desc    Get user's puzzle completions
// @route   GET /api/puzzles/my-completions
// @access  Private
export const getMyCompletions = async (req, res) => {
  try {
    const userId = req.user?.USER_ID || 1;
    const { limit = 50, offset = 0, isCorrect } = req.query;

    const where = { USER_ID: userId };
    
    // Filter by correct/incorrect if specified
    if (isCorrect !== undefined) {
      where.IS_CORRECT = isCorrect === 'true';
    }

    const completions = await PuzzleCompletion.findAndCountAll({
      where,
      include: [
        {
          model: Puzzle,
          as: 'puzzle',
          attributes: [
            'PUZZLE_ID',
            'TITLE',
            'TYPE',
            'DIFFICULTY',
            'XP_REWARD',
            'TIME_LIMIT',
            'COMPLETIONS_COUNT',
            'AVERAGE_TIME'
          ]
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['COMPLETED_AT', 'DESC']]
    });

    // Calculate summary statistics
    const stats = {
      totalAttempts: completions.count,
      correctAttempts: completions.rows.filter(c => c.IS_CORRECT).length,
      incorrectAttempts: completions.rows.filter(c => !c.IS_CORRECT).length,
      totalXPEarned: completions.rows.reduce((sum, c) => sum + (c.XP_EARNED || 0), 0),
      averageTime: completions.rows.length > 0 
        ? Math.round(completions.rows.reduce((sum, c) => sum + c.TIME_TAKEN, 0) / completions.rows.length)
        : 0
    };

    res.status(200).json({
      success: true,
      count: completions.count,
      data: completions.rows,
      stats,
      pagination: {
        total: completions.count,
        limit: parseInt(limit),
        offset: parseInt(offset),
        pages: Math.ceil(completions.count / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Get my completions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching completions',
      error: error.message
    });
  }
};

// @desc    Get puzzle statistics
// @route   GET /api/puzzles/:id/stats
// @access  Private
export const getPuzzleStats = async (req, res) => {
  try {
    const puzzle = await Puzzle.findByPk(req.params.id, {
      attributes: [
        'PUZZLE_ID',
        'TITLE',
        'TYPE',
        'DIFFICULTY',
        'COMPLETIONS_COUNT',
        'AVERAGE_TIME',
        'CREATED_AT'
      ]
    });

    if (!puzzle) {
      return res.status(404).json({
        success: false,
        message: 'Puzzle not found'
      });
    }

    // Get completion statistics
    const completions = await PuzzleCompletion.findAll({
      where: { PUZZLE_ID: req.params.id },
      attributes: ['TIME_TAKEN', 'COMPLETED_AT'],
      order: [['TIME_TAKEN', 'ASC']]
    });

    // Calculate statistics
    const stats = {
      puzzle: puzzle.toJSON(),
      totalCompletions: completions.length,
      averageTime: puzzle.AVERAGE_TIME,
      fastestTime: completions.length > 0 ? completions[0].TIME_TAKEN : null,
      slowestTime: completions.length > 0 ? completions[completions.length - 1].TIME_TAKEN : null,
      recentCompletions: completions.slice(0, 10).map(c => ({
        timeTaken: c.TIME_TAKEN,
        completedAt: c.COMPLETED_AT
      }))
    };

    res.status(200).json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Get puzzle stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching puzzle statistics',
      error: error.message
    });
  }
};