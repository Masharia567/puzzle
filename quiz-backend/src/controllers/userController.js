import jwt from 'jsonwebtoken';
import { initializeModels } from '../models/index.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

/* ============================================================================
 * AUTHENTICATION CONTROLLERS
 * ============================================================================ */

/**
 * Register a new user (called from frontend on first login)
 */
export async function register(req, res, next) {
  try {
    const { User } = await initializeModels();

    const {
      displayName,
      mail,
      userPrincipalName,
      role = 'user',
      mobilePhone,
      businessPhones,
      nickname,
      department,
      microsoftId,
    } = req.body;

    if (!mail || !displayName) {
      return res.status(400).json({
        success: false,
        message: 'mail and displayName are required.',
      });
    }

    // Check duplicates
    const existingUser = await User.findOne({
      where: { MAIL: mail.toLowerCase() },
    });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Email already exists.',
      });
    }

    if (microsoftId) {
      const existingByMsId = await User.findOne({
        where: { MICROSOFT_ID: microsoftId },
      });
      if (existingByMsId) {
        return res.status(409).json({
          success: false,
          message: 'Microsoft account already linked.',
        });
      }
    }

    // Only include defined fields — let DB set CREATED_AT, CREATED_BY
    const userData = {
      DISPLAYNAME: displayName,
      MAIL: mail.toLowerCase(),
      USERPRINCIPALNAME: userPrincipalName ?? null,
      ROLE: role,
      MOBILEPHONE: mobilePhone?.trim() || null,
      BUSINESSPHONES: businessPhones?.trim() || null,
      NICKNAME: nickname?.trim() || null,
      DEPARTMENT: department?.trim() || null,
      MICROSOFT_ID: microsoftId ?? null,
      CREATED_BY: mail.toLowerCase(), // ← email as creator
      // CREATED_AT: DB default SYSDATE
    };

    const newUser = await User.create(userData);

    const token = jwt.sign(
      {
        userId: newUser.ID,
        mail: newUser.MAIL,
        displayName: newUser.DISPLAYNAME,
        role: newUser.ROLE,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: { user: newUser, token },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Login user (email or Microsoft ID)
 */
export async function login(req, res, next) {
  try {
    const { User } = await initializeModels();
    const { mail, microsoftId } = req.body;

    if (!mail && !microsoftId) {
      return res.status(400).json({
        success: false,
        message: 'mail or microsoftId is required.',
      });
    }

    const whereClause = mail
      ? { MAIL: mail.toLowerCase() }
      : { MICROSOFT_ID: microsoftId };

    const user = await User.findOne({ where: whereClause });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials.',
      });
    }

    // Touch row — DB sets UPDATED_AT via default
    await user.update({ UPDATED_BY: user.MAIL });

    const token = jwt.sign(
      {
        userId: user.ID,
        mail: user.MAIL,
        displayName: user.DISPLAYNAME,
        role: user.ROLE,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    return res.json({
      success: true,
      message: 'Login successful',
      data: { user, token },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get current user profile
 */
export async function getProfile(req, res, next) {
  try {
    const { User } = await initializeModels();
    const userId = req.user.userId;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    return res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
}

/**
 * Change password - Not applicable
 */
export async function changePassword(req, res, next) {
  return res.status(400).json({
    success: false,
    message: 'Password change not supported for Microsoft-linked accounts.',
  });
}

/**
 * Logout (client-side)
 */
export async function logout(req, res, next) {
  return res.json({ success: true, message: 'Logged out successfully' });
}

/* ============================================================================
 * USER MANAGEMENT CRUD
 * ============================================================================ */

export async function createUser(req, res, next) {
  return register(req, res, next);
}

export async function getAllUsers(req, res, next) {
  try {
    const { User } = await initializeModels();
    const users = await User.findAll({
      order: [['CREATED_AT', 'DESC']],
      attributes: { exclude: ['CREATED_BY', 'UPDATED_BY'] },
    });
    return res.json({ success: true, data: users });
  } catch (error) {
    next(error);
  }
}

export async function getUserById(req, res, next) {
  try {
    const { User } = await initializeModels();
    const { id } = req.params;

    const user = await User.findOne({
      where: { MICROSOFT_ID: id }, // Query by MICROSOFT_ID instead of ID
    });

    console.log(user)

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    return res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
}

/**
 * Update user - safe for Oracle
 */
export async function updateUser(req, res, next) {
  try {
    const { User } = await initializeModels();
    const { id } = req.params;

    const {
      displayName,
      mail,
      userPrincipalName,
      role,
      mobilePhone,
      businessPhones,
      nickname,
      department,
    } = req.body;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (mail && mail.toLowerCase() !== user.MAIL) {
      const existing = await User.findOne({ where: { MAIL: mail.toLowerCase() } });
      if (existing) {
        return res.status(409).json({
          success: false,
          message: 'Email already in use by another account.',
        });
      }
    }

    const updateData = {
      UPDATED_BY: user.MAIL // ← email as updater
    };

    if (displayName !== undefined) updateData.DISPLAYNAME = displayName;
    if (mail !== undefined) updateData.MAIL = mail.toLowerCase();
    if (userPrincipalName !== undefined) updateData.USERPRINCIPALNAME = userPrincipalName;
    if (role !== undefined) updateData.ROLE = role;
    if (mobilePhone !== undefined) updateData.MOBILEPHONE = mobilePhone?.trim() || null;
    if (businessPhones !== undefined) updateData.BUSINESSPHONES = businessPhones?.trim() || null;
    if (nickname !== undefined) updateData.NICKNAME = nickname?.trim() || null;
    if (department !== undefined) updateData.DEPARTMENT = department?.trim() || null;

    await user.update(updateData);

    return res.json({
      success: true,
      message: 'User updated successfully',
      data: user,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Delete user
 */
export async function deleteUser(req, res, next) {
  try {
    const { User } = await initializeModels();
    const { id } = req.params;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    await user.destroy();

    return res.json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    next(error);
  }
}