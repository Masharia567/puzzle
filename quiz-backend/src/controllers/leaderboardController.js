import { initializeModels } from '../models/index.js';

/**
 * @desc Create a new leaderboard entry (quiz or puzzle)
 * @route POST /api/leaderboard
 */
export async function addLeaderboardEntry(req, res, next) {
  try {
    const { Leaderboard } = await initializeModels();
    const { user_id, quiz_id, puzzle_id, score, time_taken_seconds } = req.body;

    // Validation
    if (!user_id || score == null || time_taken_seconds == null) {
      return res.status(400).json({
        success: false,
        message: 'user_id, score, and time_taken_seconds are required'
      });
    }

    if (!quiz_id && !puzzle_id) {
      return res.status(400).json({
        success: false,
        message: 'Either quiz_id or puzzle_id must be provided'
      });
    }

    // Create entry
    const entry = await Leaderboard.create({
      user_id,
      quiz_id,
      puzzle_id,
      score,
      time_taken_seconds,
      created_at: new Date()
    });

    res.status(201).json({
      success: true,
      message: 'Leaderboard entry added successfully',
      data: entry
    });
  } catch (error) {
    console.error('Error adding leaderboard entry:', error);
    next(error);
  }
}

/**
 * @desc Get top leaderboard entries (combined for quizzes and puzzles)
 * @route GET /api/leaderboard
 */
export async function getLeaderboard(req, res, next) {
  try {
    const { Leaderboard, User, Quiz, Puzzle } = await initializeModels();

    const topEntries = await Leaderboard.findAll({
      include: [
        { model: User, as: 'user', attributes: ['id', 'USERNAME', 'EMAIL'] },
        { model: Quiz, as: 'quiz', attributes: ['QUIZ_ID', 'TITLE'] },
        { model: Puzzle, as: 'puzzle', attributes: ['PUZZLE_ID', 'TITLE'] }
      ],
      order: [
        ['score', 'DESC'],
        ['time_taken_seconds', 'ASC']
      ],
      limit: 20
    });

    res.json({
      success: true,
      message: 'Leaderboard fetched successfully',
      data: topEntries
    });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    next(error);
  }
}

/**
 * @desc Get leaderboard for a specific quiz or puzzle
 * @route GET /api/leaderboard/:type/:id
 * @example /api/leaderboard/quiz/3 or /api/leaderboard/puzzle/2
 */
export async function getLeaderboardByType(req, res, next) {
  try {
    const { type, id } = req.params;
    const { Leaderboard, User, Quiz, Puzzle } = await initializeModels();

    if (!['quiz', 'puzzle'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Type must be either "quiz" or "puzzle"'
      });
    }

    const condition = type === 'quiz' ? { quiz_id: id } : { puzzle_id: id };

    const entries = await Leaderboard.findAll({
      where: condition,
      include: [
        { model: User, as: 'user', attributes: ['id', 'USERNAME', 'EMAIL'] },
        { model: Quiz, as: 'quiz', attributes: ['QUIZ_ID', 'TITLE'] },
        { model: Puzzle, as: 'puzzle', attributes: ['PUZZLE_ID', 'TITLE'] }
      ],
      order: [
        ['score', 'DESC'],
        ['time_taken_seconds', 'ASC']
      ]
    });

    res.json({
      success: true,
      message: `${type} leaderboard fetched successfully`,
      data: entries
    });
  } catch (error) {
    console.error('Error fetching leaderboard by type:', error);
    next(error);
  }
}
