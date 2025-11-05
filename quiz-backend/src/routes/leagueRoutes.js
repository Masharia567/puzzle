import express from 'express';
import {
  getLeagues,
  createLeague,
  joinLeague,
  getLeagueDetails,
  deleteLeague,
  leaveLeague
} from '../controllers/leagueController.js';

const router = express.Router();

/**
 * @route GET /api/leagues
 * @desc Get all leagues (user's leagues + public leagues to discover)
 * @access Protected (requires authentication)
 */
router.get('/', getLeagues);

/**
 * @route POST /api/leagues
 * @desc Create a new league
 * @body { name, description?, type? }
 * @access Protected (requires authentication)
 */
router.post('/', createLeague);

/**
 * @route POST /api/leagues/join
 * @desc Join a league using an 8-character code
 * @body { code }
 * @access Protected (requires authentication)
 */
router.post('/join', joinLeague);

/**
 * @route GET /api/leagues/:leagueId
 * @desc Get detailed league information including standings and games
 * @access Protected (requires authentication)
 */
router.get('/:leagueId', getLeagueDetails);

/**
 * @route DELETE /api/leagues/:leagueId
 * @desc Delete a league (admin only)
 * @access Protected (requires authentication + admin rights)
 */
router.delete('/:leagueId', deleteLeague);

/**
 * @route POST /api/leagues/:leagueId/leave
 * @desc Leave a league
 * @access Protected (requires authentication)
 */
router.post('/:leagueId/leave', leaveLeague);

export default router;