// src/controllers/leagueController.js
import { Op } from 'sequelize';
import { initializeModels } from '../models/index.js';

/* -------------------------------------------------------------------------- */
/*  Helper – generate a random 8-char league code (A-Z0-9)                   */
/* -------------------------------------------------------------------------- */
const generateLeagueCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  return Array.from({ length: 8 }, () => 
    chars[Math.floor(Math.random() * chars.length)]
  ).join('');
};

/* -------------------------------------------------------------------------- */
/*  1. List all leagues (my + discover)                                      */
/* -------------------------------------------------------------------------- */
export async function getLeagues(req, res, next) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'Unauthenticated' 
      });
    }

    const { League, LeagueMember, User } = await initializeModels();

    // ---- My leagues (member + admin) ----
    const myMemberships = await LeagueMember.findAll({
      where: { user_id: userId },
      attributes: ['league_id', 'is_admin'],
    });

    const myLeagueIds = myMemberships.map(m => m.league_id);
    const myLeagues = myLeagueIds.length > 0 
      ? await League.findAll({
          where: { id: { [Op.in]: myLeagueIds } },
          include: [
            { model: User, as: 'creator', attributes: ['id', 'username'] },
            { model: LeagueMember, attributes: ['user_id'] },
          ],
        })
      : [];

    // ---- Public leagues (not already a member) ----
    const publicLeagues = await League.findAll({
      where: {
        type: 'public',
        ...(myLeagueIds.length > 0 && { id: { [Op.notIn]: myLeagueIds } }),
      },
      include: [
        { model: User, as: 'creator', attributes: ['id', 'username'] },
        { model: LeagueMember, attributes: ['user_id'] },
      ],
    });

    // ---- Enrich my leagues with user-specific data ----
    const enrichedMy = myLeagues.map(league => {
      const membership = myMemberships.find(m => m.league_id === league.id);
      const memberCount = league.LeagueMembers?.length ?? 0;

      // Dummy rank / points – replace with real leaderboard calc if needed
      const userRank = memberCount > 0 ? Math.floor(Math.random() * memberCount) + 1 : 1;
      const previousRank = userRank > 1 
        ? Math.max(1, userRank - Math.floor(Math.random() * 3)) 
        : null;

      return {
        id: league.id,
        name: league.name,
        code: league.code,
        description: league.description,
        type: league.type,
        createdBy: league.creator?.username ?? 'Unknown',
        createdAt: league.created_at,
        memberCount,
        isAdmin: membership?.is_admin ?? false,
        isMember: true,
        userRank,
        previousRank,
        userPoints: Math.floor(Math.random() * 5000),
        userWeeklyPoints: Math.floor(Math.random() * 600),
      };
    });

    // ---- Enrich public leagues (no user data) ----
    const enrichedPublic = publicLeagues.map(league => ({
      id: league.id,
      name: league.name,
      code: league.code,
      description: league.description,
      type: league.type,
      createdBy: league.creator?.username ?? 'Unknown',
      createdAt: league.created_at,
      memberCount: league.LeagueMembers?.length ?? 0,
      isAdmin: false,
      isMember: false,
      userRank: 0,
      previousRank: null,
      userPoints: 0,
      userWeeklyPoints: 0,
    }));

    return res.json({
      success: true,
      data: { 
        myLeagues: enrichedMy, 
        publicLeagues: enrichedPublic 
      },
    });
  } catch (err) {
    console.error('getLeagues error:', err);
    next(err);
  }
}

/* -------------------------------------------------------------------------- */
/*  2. Create a new league                                                   */
/* -------------------------------------------------------------------------- */
export async function createLeague(req, res, next) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'Unauthenticated' 
      });
    }

    const { name, description = '', type = 'private' } = req.body;
    
    if (!name?.trim()) {
      return res.status(400).json({ 
        success: false, 
        message: 'League name required' 
      });
    }
    
    if (name.length > 50) {
      return res.status(400).json({ 
        success: false, 
        message: 'Name must be 50 characters or less' 
      });
    }

    const { League, LeagueMember, User } = await initializeModels();

    const code = generateLeagueCode();

    const [league] = await League.findOrCreate({
      where: { code },
      defaults: {
        name: name.trim(),
        description: description.trim(),
        type,
        creator_id: userId,
        code,
        created_at: new Date(),
      },
    });

    // Add creator as admin member
    await LeagueMember.create({
      league_id: league.id,
      user_id: userId,
      is_admin: true,
      joined_at: new Date(),
    });

    const creator = await User.findByPk(userId, { 
      attributes: ['username'] 
    });

    return res.status(201).json({
      success: true,
      message: 'League created',
      data: {
        id: league.id,
        name: league.name,
        code: league.code,
        description: league.description,
        type: league.type,
        createdBy: creator?.username ?? 'You',
        createdAt: league.created_at,
        memberCount: 1,
        isAdmin: true,
        isMember: true,
        userRank: 1,
        previousRank: null,
        userPoints: 0,
        userWeeklyPoints: 0,
      },
    });
  } catch (err) {
    console.error('createLeague error:', err);
    next(err);
  }
}

/* -------------------------------------------------------------------------- */
/*  3. Join a league by code                                                */
/* -------------------------------------------------------------------------- */
export async function joinLeague(req, res, next) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'Unauthenticated' 
      });
    }

    const { code } = req.body;
    const normalized = (code ?? '').toString().trim().toUpperCase();
    
    if (normalized.length !== 8) {
      return res.status(400).json({ 
        success: false, 
        message: 'Code must be 8 characters' 
      });
    }

    const { League, LeagueMember } = await initializeModels();

    const league = await League.findOne({ 
      where: { code: normalized } 
    });
    
    if (!league) {
      return res.status(404).json({ 
        success: false, 
        message: 'Invalid league code' 
      });
    }

    const alreadyMember = await LeagueMember.findOne({
      where: { league_id: league.id, user_id: userId },
    });
    
    if (alreadyMember) {
      return res.status(400).json({ 
        success: false, 
        message: 'Already a member' 
      });
    }

    await LeagueMember.create({
      league_id: league.id,
      user_id: userId,
      is_admin: false,
      joined_at: new Date(),
    });

    const memberCount = await LeagueMember.count({ 
      where: { league_id: league.id } 
    });

    return res.json({
      success: true,
      message: `Joined "${league.name}"`,
      data: {
        id: league.id,
        name: league.name,
        code: league.code,
        description: league.description,
        type: league.type,
        createdBy: '…',
        createdAt: league.created_at,
        memberCount,
        isAdmin: false,
        isMember: true,
        userRank: memberCount,
        previousRank: null,
        userPoints: 0,
        userWeeklyPoints: 0,
      },
    });
  } catch (err) {
    console.error('joinLeague error:', err);
    next(err);
  }
}

/* -------------------------------------------------------------------------- */
/*  4. Get league details (standings + games)                               */
/* -------------------------------------------------------------------------- */
export async function getLeagueDetails(req, res, next) {
  try {
    const userId = req.user?.id;
    const { leagueId } = req.params;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'Unauthenticated' 
      });
    }

    const { League, LeagueMember, User } = await initializeModels();

    // ---- League base data ----
    const league = await League.findByPk(leagueId, {
      include: [
        { model: User, as: 'creator', attributes: ['username'] }
      ],
    });
    
    if (!league) {
      return res.status(404).json({ 
        success: false, 
        message: 'League not found' 
      });
    }

    const membership = await LeagueMember.findOne({
      where: { league_id: league.id, user_id: userId },
    });
    
    const isMember = !!membership;
    const isAdmin = membership?.is_admin ?? false;

    // ---- Members (standings) ----
    const membersRaw = await LeagueMember.findAll({
      where: { league_id: league.id },
      include: [
        { model: User, attributes: ['id', 'username'] }
      ],
    });

    // Calculate dummy points – replace with real aggregation
    const members = membersRaw.map((m, idx) => {
      const totalScore = Math.floor(Math.random() * 5000) + 500;
      const weekly = Math.floor(Math.random() * 600);
      const rank = idx + 1;
      const previousRank = rank > 1 
        ? Math.max(1, rank - Math.floor(Math.random() * 3)) 
        : null;

      return {
        userId: m.user.id,
        username: m.user.username,
        totalScore,
        weeklyPoints: weekly,
        quizzesTaken: Math.floor(Math.random() * 50) + 10,
        puzzlesSolved: Math.floor(Math.random() * 40) + 5,
        rank,
        previousRank,
        joinedAt: m.joined_at,
        isCurrentUser: m.user.id === userId,
      };
    });

    // ---- Games (ongoing + upcoming) ----
    const now = new Date();

    const ongoingGames = Array.from({ length: 3 }).map((_, i) => {
      const start = new Date(now.getTime() - (i + 1) * 60 * 60 * 1000);
      const end = new Date(now.getTime() + (3 - i) * 60 * 60 * 1000);
      
      return {
        id: `ongoing-${i}`,
        title: `Ongoing Game ${i + 1}`,
        type: i % 2 === 0 ? 'quiz' : 'puzzle',
        difficulty: ['easy', 'medium', 'hard'][i % 3],
        status: 'ongoing',
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        participants: Math.floor(Math.random() * 15) + 3,
        maxParticipants: 20,
        points: 400 + i * 100,
        description: 'Live challenge – join now!',
      };
    });

    const upcomingGames = Array.from({ length: 2 }).map((_, i) => {
      const start = new Date(now.getTime() + (i + 1) * 60 * 60 * 1000);
      const end = new Date(start.getTime() + 4 * 60 * 60 * 1000);
      
      return {
        id: `upcoming-${i}`,
        title: `Upcoming Game ${i + 1}`,
        type: i % 2 === 0 ? 'quiz' : 'puzzle',
        difficulty: ['easy', 'medium'][i % 2],
        status: 'upcoming',
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        participants: 0,
        maxParticipants: 25,
        points: 350 + i * 150,
        description: 'Get ready – starts soon!',
      };
    });

    const games = [...ongoingGames, ...upcomingGames];

    // ---- Final league payload ----
    const currentUser = members.find(m => m.isCurrentUser);
    
    const payload = {
      id: league.id,
      name: league.name,
      code: league.code,
      description: league.description,
      type: league.type,
      createdBy: league.creator?.username ?? 'Unknown',
      createdAt: league.created_at,
      memberCount: members.length,
      isAdmin,
      isMember,
      userRank: isMember ? (currentUser?.rank ?? members.length) : 0,
      previousRank: isMember ? (currentUser?.previousRank ?? null) : null,
      userPoints: isMember ? (currentUser?.totalScore ?? 0) : 0,
      userWeeklyPoints: isMember ? (currentUser?.weeklyPoints ?? 0) : 0,
    };

    return res.json({
      success: true,
      data: { league: payload, members, games },
    });
  } catch (err) {
    console.error('getLeagueDetails error:', err);
    next(err);
  }
}

/* -------------------------------------------------------------------------- */
/*  5. Delete league (admin only)                                           */
/* -------------------------------------------------------------------------- */
export async function deleteLeague(req, res, next) {
  try {
    const userId = req.user?.id;
    const { leagueId } = req.params;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'Unauthenticated' 
      });
    }

    const { League, LeagueMember } = await initializeModels();

    const membership = await LeagueMember.findOne({
      where: { 
        league_id: leagueId, 
        user_id: userId, 
        is_admin: true 
      },
    });
    
    if (!membership) {
      return res.status(403).json({ 
        success: false, 
        message: 'Admin rights required' 
      });
    }

    await LeagueMember.destroy({ 
      where: { league_id: leagueId } 
    });
    
    await League.destroy({ 
      where: { id: leagueId } 
    });

    return res.json({ 
      success: true, 
      message: 'League deleted' 
    });
  } catch (err) {
    console.error('deleteLeague error:', err);
    next(err);
  }
}

/* -------------------------------------------------------------------------- */
/*  6. Leave league                                                         */
/* -------------------------------------------------------------------------- */
export async function leaveLeague(req, res, next) {
  try {
    const userId = req.user?.id;
    const { leagueId } = req.params;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'Unauthenticated' 
      });
    }

    const { League, LeagueMember } = await initializeModels();

    const membership = await LeagueMember.findOne({
      where: { 
        league_id: leagueId, 
        user_id: userId 
      },
    });
    
    if (!membership) {
      return res.status(404).json({ 
        success: false, 
        message: 'Not a member of this league' 
      });
    }

    // Check if user is the only admin
    if (membership.is_admin) {
      const adminCount = await LeagueMember.count({
        where: { 
          league_id: leagueId, 
          is_admin: true 
        },
      });
      
      if (adminCount === 1) {
        const memberCount = await LeagueMember.count({
          where: { league_id: leagueId },
        });
        
        if (memberCount > 1) {
          return res.status(400).json({ 
            success: false, 
            message: 'Transfer admin rights before leaving' 
          });
        }
      }
    }

    await LeagueMember.destroy({
      where: { 
        league_id: leagueId, 
        user_id: userId 
      },
    });

    // Delete league if no members left
    const remainingMembers = await LeagueMember.count({
      where: { league_id: leagueId },
    });
    
    if (remainingMembers === 0) {
      await League.destroy({ 
        where: { id: leagueId } 
      });
    }

    return res.json({ 
      success: true, 
      message: 'Left league successfully' 
    });
  } catch (err) {
    console.error('leaveLeague error:', err);
    next(err);
  }
}