// src/controllers/leagueController.js
import { Op, where } from 'sequelize';
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
/*  Helper – get user ID from request (Azure token)                          */
/* -------------------------------------------------------------------------- */
const getUserId = (req) => {
  const azureOid = req.azureUser?.oid;
  const userOid = req.user?.oid;
  const userId = req.user?.ID;

  console.log('getUserId → azureUser.oid:', azureOid);
  console.log('getUserId → req.user.oid:', userOid);
  console.log('getUserId → req.user.ID:', userId);

  return azureOid || userOid || userId;
};

/* -------------------------------------------------------------------------- */
/*  1. List all leagues (my + discover)                                      */
/* -------------------------------------------------------------------------- */
export async function getLeagues(req, res, next) {
  try {
    const userId = getUserId(req);
    if (!userId) {
      console.warn('getLeagues → No user ID found in request');
      return res.status(401).json({ success: false, message: 'Unauthenticated' });
    }

    console.log(`getLeagues → userId: ${userId}`);

    const { League, LeagueMember, User } = await initializeModels();

    // ---- My memberships ----
    console.log('getLeagues → Fetching memberships for USER_ID:', userId);
    const myMemberships = await LeagueMember.findAll({
      where: { USER_ID: userId },
      attributes: ['LEAGUE_ID', 'IS_ADMIN'],
    });

    console.log('getLeagues → myMemberships:', myMemberships.map(m => m.toJSON()));

    const myLeagueIds = myMemberships.map((m) => m.dataValues.LEAGUE_ID);
    console.log('getLeagues → myLeagueIds:', myLeagueIds);

    const myLeagues = myLeagueIds.length
      ? await League.findAll({
        where: { ID: { [Op.in]: myLeagueIds } },
        include: [
          { model: User, as: 'creator', attributes: ['ID', 'DISPLAYNAME'] },
          { model: LeagueMember, as: 'memberships', attributes: ['USER_ID'] },
        ],
      })
      : [];

    console.log('getLeagues → myLeagues count:', myLeagues.length);
    myLeagues.forEach(l => console.log('myLeague →', l.toJSON()));

    // ---- Public leagues ----
    const publicWhere = {
      TYPE: 'public',
      ...(myLeagueIds.length && { ID: { [Op.notIn]: myLeagueIds } }),
    };
    console.log('getLeagues → publicLeagues where:', publicWhere);

    const publicLeagues = await League.findAll({
      where: publicWhere,
      include: [
        { model: User, as: 'creator', attributes: ['ID', 'DISPLAYNAME'] },
        { model: LeagueMember, as: 'memberships', attributes: ['USER_ID'] },
      ],
    });

    console.log('getLeagues → publicLeagues count:', publicLeagues.length);

    // ---- Enrich my leagues ----
    // ---- Enrich my leagues ----
    const enrichedMy = myLeagues.map((league) => {
      const leagueJson = league.toJSON(); // Add this line
      const membership = myMemberships.find((m) => m.dataValues.LEAGUE_ID === leagueJson.id);
      const memberCount = leagueJson.memberships?.length ?? 0;
      const userRank = memberCount ? Math.floor(Math.random() * memberCount) + 1 : 1;
      const previousRank = userRank > 1 ? Math.max(1, userRank - Math.floor(Math.random() * 3)) : null;

      const result = {
        id: leagueJson.id,                    // Use leagueJson
        name: leagueJson.name,                // Use leagueJson
        code: leagueJson.code,                // Use leagueJson
        description: leagueJson.description,  // Use leagueJson
        type: leagueJson.type,                // Use leagueJson
        createdBy: leagueJson.creator?.DISPLAYNAME ?? 'Unknown',
        createdAt: leagueJson.createdAt,
        memberCount,
        isAdmin: membership?.dataValues.IS_ADMIN === 'Y', // Also fix this
        isMember: true,
        userRank,
        previousRank,
        userPoints: Math.floor(Math.random() * 5000),
        userWeeklyPoints: Math.floor(Math.random() * 600),
      };

      console.log('enrichedMy →', result);
      return result;
    });

    // ---- Enrich public leagues ----
    const enrichedPublic = publicLeagues.map((league) => {
      const leagueJson = league.toJSON(); // Add this line

      const result = {
        id: leagueJson.id,                    // Use leagueJson
        name: leagueJson.name,                // Use leagueJson
        code: leagueJson.code,                // Use leagueJson
        description: leagueJson.description,  // Use leagueJson
        type: leagueJson.type,                // Use leagueJson
        createdBy: leagueJson.creator?.DISPLAYNAME ?? 'Unknown',
        createdAt: leagueJson.createdAt,
        memberCount: leagueJson.memberships?.length ?? 0,
        isAdmin: false,
        isMember: false,
        userRank: 0,
        previousRank: null,
        userPoints: 0,
        userWeeklyPoints: 0,
      };

      console.log('enrichedPublic →', result);
      return result;
    });

    return res.json({
      success: true,
      myLeagues: enrichedMy,
      publicLeagues: enrichedPublic,
    });
  } catch (err) {
    console.error('getLeagues FATAL ERROR:', err);
    console.error('Stack:', err.stack);
    next(err);
  }
}

/* -------------------------------------------------------------------------- */
/*  2. Create a new league                                                   */
/* -------------------------------------------------------------------------- */
export async function createLeague(req, res, next) {
  try {
    const userId = getUserId(req);
    if (!userId) {
      console.warn('createLeague → No user ID');
      return res.status(401).json({ success: false, message: 'Unauthenticated' });
    }

    console.log(`createLeague → userId: ${userId}`);
    console.log('createLeague → body:', req.body);

    const { name, description = '', type = 'private' } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({ success: false, message: 'League name required' });
    }
    if (name.length > 50) {
      return res.status(400).json({ success: false, message: 'Name must be ≤ 50 chars' });
    }

    const { League, LeagueMember, User } = await initializeModels();

    const code = generateLeagueCode();
    console.log('createLeague → generated code:', code);

    const league = await League.create({
      name,
      code,
      description,
      type,
      creatorId: userId,
      createdAt: new Date()
    });

    console.log('createLeague → league created:', league.toJSON());

    const leagueMemberData = {
      userId: userId,
      league_id: league.id,
      is_admin: 'Y',
      joined_at: new Date(),
    };

    console.log('createLeague → creating admin membership:', leagueMemberData);

    await LeagueMember.create(leagueMemberData);

    console.log('createLeague → admin membership created');

    const creator = await User.findOne(
      { where: { 'MICROSOFT_ID': userId }, attributes: ['DISPLAYNAME'] },
    );

    console.log('createLeague → creator:', creator?.toJSON());

    return res.status(201).json({
      success: true,
      message: 'League created successfully',
      id: league.ID,
      name: league.NAME,
      code: league.CODE,
      description: league.DESCRIPTION,
      type: league.TYPE,
      createdBy: creator?.DISPLAYNAME ?? req.azureUser?.name ?? 'You',
      createdAt: league.CREATED_AT,
      memberCount: 1,
      isAdmin: true,
      isMember: true,
      userRank: 1,
      previousRank: null,
      userPoints: 0,
      userWeeklyPoints: 0,
    });
  } catch (err) {
    console.error('createLeague FATAL ERROR:', err);
    console.error('Stack:', err.stack);
    next(err);
  }
}

/* -------------------------------------------------------------------------- */
/*  3. Join a league by code                                                */
/* -------------------------------------------------------------------------- */
export async function joinLeague(req, res, next) {
  try {
    const userId = getUserId(req);
    if (!userId) {
      console.warn('joinLeague → No user ID');
      return res.status(401).json({ success: false, message: 'Unauthenticated' });
    }

    const { code } = req.body;
    const normalized = (code ?? '').toString().trim().toUpperCase();

    console.log(`joinLeague → userId: ${userId}, code: ${normalized}`);

    if (normalized.length !== 8) {
      return res.status(400).json({ success: false, message: 'Code must be 8 characters' });
    }

    const { League, LeagueMember, User } = await initializeModels();

    const league = await League.findOne({
      where: { CODE: normalized },
      include: [{ model: User, as: 'creator', attributes: ['DISPLAYNAME'] }],
    });

    console.log('joinLeague → league found:', league ? league.toJSON() : null);

    if (!league) {
      return res.status(404).json({ success: false, message: 'Invalid league code' });
    }

    // FIX: Get the ID value properly using .get() method or dataValues
    const leagueId = league.get('id'); // This gets the aliased lowercase 'id'
    console.log('joinLeague → leagueId extracted:', leagueId);

    const alreadyMember = await LeagueMember.findOne({
      where: { LEAGUE_ID: leagueId, USER_ID: userId }, // Use the extracted leagueId
    });

    if (alreadyMember) {
      console.log('joinLeague → already a member');
      return res.status(400).json({ success: false, message: 'Already a member' });
    }

    await LeagueMember.create({
      LEAGUE_ID: leagueId, // Use the extracted leagueId
      USER_ID: userId,
      IS_ADMIN: 'N', // FIX: Should be 'N' not false
      JOINED_AT: new Date(),
    });

    console.log('joinLeague → joined successfully');

    const memberCount = await LeagueMember.count({ where: { LEAGUE_ID: leagueId } }); // Use the extracted leagueId
    console.log('joinLeague → memberCount:', memberCount);

    return res.json({
      success: true,
      message: `Joined "${league.get('name')}"`,
      id: leagueId,
      name: league.get('name'),
      code: league.get('code'),
      description: league.get('description'),
      type: league.get('type'),
      createdBy: league.get('creator')?.DISPLAYNAME ?? 'Unknown',
      createdAt: league.get('createdAt'),
      memberCount,
      isAdmin: false,
      isMember: true,
      userRank: memberCount,
      previousRank: null,
      userPoints: 0,
      userWeeklyPoints: 0,
    });
  } catch (err) {
    console.error('joinLeague FATAL ERROR:', err);
    console.error('Stack:', err.stack);
    next(err);
  }
}

/* -------------------------------------------------------------------------- */
/*  4. Get league details (standings + games)                               */
/* -------------------------------------------------------------------------- */
export async function getLeagueDetails(req, res, next) {
  try {
    const userId = getUserId(req);
    const { leagueId } = req.params;

    console.log(`getLeagueDetails → userId: ${userId}, leagueId: ${leagueId}`);

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthenticated' });
    }

    const { League, LeagueMember, User } = await initializeModels();

    const league = await League.findByPk(leagueId, {
      include: [{ model: User, as: 'creator', attributes: ['DISPLAYNAME'] }],
    });

    console.log('getLeagueDetails → league:', league ? league.toJSON() : null);

    if (!league) {
      return res.status(404).json({ success: false, message: 'League not found' });
    }

    // FIX: Use lowercase 'id' from the aliased field
    const leagueIdValue = league.get('id'); // or league.dataValues.id

    const membership = await LeagueMember.findOne({
      where: { LEAGUE_ID: league.id, USER_ID: userId, IS_ADMIN: true },
    });

    console.log('getLeagueDetails → membership:', membership?.toJSON());

    const isMember = !!membership;
    const isAdmin = membership?.IS_ADMIN === 'Y'; // Also fix this check

    // ---- Standings ----
    const membersRaw = await LeagueMember.findAll({
      where: { LEAGUE_ID: leagueIdValue }, // Use the extracted value
      include: [{ model: User, as: 'user', attributes: ['ID', 'DISPLAYNAME'] }],
    });

    // ... rest of your code remains the same

    console.log('getLeagueDetails → membersRaw count:', membersRaw.length);

    const members = membersRaw.map((m, idx) => {
      const totalScore = Math.floor(Math.random() * 5000) + 500;
      const weekly = Math.floor(Math.random() * 600);
      const rank = idx + 1;
      const previousRank = rank > 1 ? Math.max(1, rank - Math.floor(Math.random() * 3)) : null;

      const user = m.USER || {};
      const result = {
        userId: user.ID,
        username: user.DISPLAYNAME ?? 'Unknown',
        totalScore,
        weeklyPoints: weekly,
        quizzesTaken: Math.floor(Math.random() * 50) + 10,
        puzzlesSolved: Math.floor(Math.random() * 40) + 5,
        rank,
        previousRank,
        joinedAt: m.JOINED_AT,
        isCurrentUser: user.ID === userId,
      };

      console.log('member →', result);
      return result;
    });

    // ---- Games (mock) ----
    const now = new Date();
    const ongoingGames = Array.from({ length: 3 }, (_, i) => ({
      id: `ongoing-${i}`,
      title: `Ongoing Game ${i + 1}`,
      type: i % 2 === 0 ? 'quiz' : 'puzzle',
      difficulty: ['easy', 'medium', 'hard'][i % 3],
      status: 'ongoing',
      startTime: new Date(now - (i + 1) * 3600000).toISOString(),
      endTime: new Date(now.getTime() + (3 - i) * 3600000).toISOString(),
      participants: Math.floor(Math.random() * 15) + 3,
      maxParticipants: 20,
      points: 400 + i * 100,
      description: 'Live challenge – join now!',
    }));

    const upcomingGames = Array.from({ length: 2 }, (_, i) => ({
      id: `upcoming-${i}`,
      title: `Upcoming Game ${i + 1}`,
      type: i % 2 === 0 ? 'quiz' : 'puzzle',
      difficulty: ['easy', 'medium'][i % 2],
      status: 'upcoming',
      startTime: new Date(now.getTime() + (i + 1) * 3600000).toISOString(),
      endTime: new Date(now.getTime() + (i + 5) * 3600000).toISOString(),
      participants: 0,
      maxParticipants: 25,
      points: 350 + i * 150,
      description: 'Get ready – starts soon!',
    }));

    const currentUser = members.find((m) => m.isCurrentUser);
    console.log('currentUser →', currentUser);

    const leagueData = {
      id: league.get('id'),
      name: league.get('name'),
      code: league.get('code'),
      description: league.get('description'),
      type: league.get('type'),
      createdBy: league.get('creator')?.DISPLAYNAME ?? 'Unknown',
      createdAt: league.get('createdAt'),
      memberCount: members.length,
      isAdmin,
      isMember,
      userRank: isMember ? currentUser?.rank ?? members.length : 0,
      previousRank: isMember ? currentUser?.previousRank ?? null : null,
      userPoints: isMember ? currentUser?.totalScore ?? 0 : 0,
      userWeeklyPoints: isMember ? currentUser?.weeklyPoints ?? 0 : 0,
    };

    return res.json({
      success: true,
      league: leagueData,
      members,
      games: [...ongoingGames, ...upcomingGames],
    });
  } catch (err) {
    console.error('getLeagueDetails FATAL ERROR:', err);
    console.error('Stack:', err.stack);
    next(err);
  }
}

/* -------------------------------------------------------------------------- */
/*  5. Delete league (admin only)                                           */
/* -------------------------------------------------------------------------- */
export async function deleteLeague(req, res, next) {
  try {
    const userId = getUserId(req);
    const { league_id } = req.params;

    console.log(`deleteLeague → userId: ${userId}, leagueId: ${leagueId}`);

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthenticated' });
    }

    const { League, LeagueMember } = await initializeModels();

    const membership = await LeagueMember.findOne({
      where: { LEAGUE_ID: leagueId, USER_ID: userId, IS_ADMIN: true },
    });

    console.log('deleteLeague → admin check:', !!membership);

    if (!membership) {
      return res.status(403).json({ success: false, message: 'Admin rights required' });
    }

    await LeagueMember.destroy({ where: { LEAGUE_ID: leagueId } });
    await League.destroy({ where: { ID: leagueId } });

    console.log('deleteLeague → league deleted');

    return res.json({ success: true, message: 'League deleted' });
  } catch (err) {
    console.error('deleteLeague FATAL ERROR:', err);
    console.error('Stack:', err.stack);
    next(err);
  }
}

/* -------------------------------------------------------------------------- */
/*  6. Leave league                                                         */
/* -------------------------------------------------------------------------- */
export async function leaveLeague(req, res, next) {
  try {
    const userId = getUserId(req);
    const { leagueId } = req.params;

    console.log(`leaveLeague → userId: ${userId}, leagueId: ${leagueId}`);

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthenticated' });
    }

    const { League, LeagueMember } = await initializeModels();

    const membership = await LeagueMember.findOne({
      where: { LEAGUE_ID: leagueId, USER_ID: userId },
    });

    console.log('leaveLeague → membership:', membership?.toJSON());

    if (!membership) {
      return res.status(404).json({ success: false, message: 'Not a member of this league' });
    }

    if (membership.IS_ADMIN) {
      const adminCount = await LeagueMember.count({
        where: { LEAGUE_ID: leagueId, IS_ADMIN: true },
      });

      console.log('leaveLeague → adminCount:', adminCount);

      if (adminCount === 1) {
        const totalMembers = await LeagueMember.count({
          where: { LEAGUE_ID: leagueId },
        });

        if (totalMembers > 1) {
          return res.status(400).json({
            success: false,
            message: 'Transfer admin rights before leaving',
          });
        }
      }
    }

    await LeagueMember.destroy({
      where: { LEAGUE_ID: leagueId, USER_ID: userId },
    });

    console.log('leaveLeague → left league');

    const remaining = await LeagueMember.count({ where: { LEAGUE_ID: leagueId } });
    if (remaining === 0) {
      await League.destroy({ where: { ID: leagueId } });
      console.log('leaveLeague → empty league deleted');
    }

    return res.json({ success: true, message: 'Left league successfully' });
  } catch (err) {
    console.error('leaveLeague FATAL ERROR:', err);
    console.error('Stack:', err.stack);
    next(err);
  }
}