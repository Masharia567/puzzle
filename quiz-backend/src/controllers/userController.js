import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { initializeModels } from '../models/index.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

/* ============================================================================
 * AUTHENTICATION CONTROLLERS
 * ============================================================================
 */

/**
 * Register a new user
 */
export async function register(req, res, next) {
  try {
    const { User } = await initializeModels();
    const { USERNAME, EMAIL, PASSWORD, ROLE_ID, DEPARTMENT_ID } = req.body;

    if (!USERNAME || !EMAIL || !PASSWORD) {
      return res.status(400).json({
        success: false,
        message: 'USERNAME, EMAIL, and PASSWORD are required.'
      });
    }

    const existingUser = await User.findOne({ where: { EMAIL: EMAIL.toLowerCase() } });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Email already exists.'
      });
    }

    // Hash password before saving
    const hashedPassword = await bcrypt.hash(PASSWORD, 10);

    const newUser = await User.create({
      USERNAME,
      EMAIL: EMAIL.toLowerCase(),
      PASSWORD: hashedPassword,
      ROLE_ID: ROLE_ID || 1,
      DEPARTMENT_ID,
      STATUS: 'active',
      EMAIL_VERIFIED: false,
      CREATED_AT: new Date(),
    });

    const token = jwt.sign(
      {
        userId: newUser.USER_ID,
        email: newUser.EMAIL,
        username: newUser.USERNAME,
        roleId: newUser.ROLE_ID,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    const userResponse = { ...newUser.toJSON() };
    delete userResponse.PASSWORD;

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: { user: userResponse, token },
    });
  } catch (error) {
    console.error('Error registering user:', error);
    next(error);
  }
}

/**
 * Login user
 */
export async function login(req, res, next) {
  try {
    const { User } = await initializeModels();
    const { EMAIL, PASSWORD } = req.body;

    if (!EMAIL || !PASSWORD) {
      return res.status(400).json({
        success: false,
        message: 'EMAIL and PASSWORD are required.'
      });
    }

    const user = await User.findOne({ where: { EMAIL: EMAIL.toLowerCase() } });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    if (user.STATUS !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'Account is not active. Please contact support.'
      });
    }

    // Compare input password with hashed password stored in DB
    const isPasswordValid = await bcrypt.compare(PASSWORD, user.PASSWORD);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    await user.update({
      LAST_LOGIN: new Date(),
      UPDATED_AT: new Date(),
    });

    const token = jwt.sign(
      {
        userId: user.USER_ID,
        email: user.EMAIL,
        username: user.USERNAME,
        roleId: user.ROLE_ID,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    const userResponse = { ...user.toJSON() };
    delete userResponse.PASSWORD;

    res.json({
      success: true,
      message: 'Login successful',
      data: { user: userResponse, token },
    });
  } catch (error) {
    console.error('Error logging in:', error);
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

    const userResponse = { ...user.toJSON() };
    delete userResponse.PASSWORD;

    res.json({ success: true, data: userResponse });
  } catch (error) {
    console.error('Error fetching profile:', error);
    next(error);
  }
}

/**
 * Change password
 */
export async function changePassword(req, res, next) {
  try {
    const { User } = await initializeModels();
    const { CURRENT_PASSWORD, NEW_PASSWORD } = req.body;
    const userId = req.user.userId;

    if (!CURRENT_PASSWORD || !NEW_PASSWORD) {
      return res.status(400).json({
        success: false,
        message: 'CURRENT_PASSWORD and NEW_PASSWORD are required.'
      });
    }

    if (NEW_PASSWORD.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long.'
      });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const isPasswordValid = await bcrypt.compare(CURRENT_PASSWORD, user.PASSWORD);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect.'
      });
    }

    const hashedNewPassword = await bcrypt.hash(NEW_PASSWORD, 10);

    await user.update({
      PASSWORD: hashedNewPassword,
      UPDATED_AT: new Date(),
    });

    res.json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    console.error('Error changing password:', error);
    next(error);
  }
}

/**
 * Logout
 */
export async function logout(req, res, next) {
  try {
    res.json({
      success: true,
      message: 'Logout successful',
    });
  } catch (error) {
    console.error('Error logging out:', error);
    next(error);
  }
}

/* ============================================================================
 * USER MANAGEMENT CRUD
 * ============================================================================
 */

export async function createUser(req, res, next) {
  return register(req, res, next); // reuse register
}

export async function getAllUsers(req, res, next) {
  try {
    const { User } = await initializeModels();
    const users = await User.findAll({
      attributes: { exclude: ['PASSWORD'] },
      order: [['CREATED_AT', 'DESC']],
    });
    res.json({ success: true, data: users });
  } catch (error) {
    console.error('Error fetching all users:', error);
    next(error);
  }
}

export async function getUserById(req, res, next) {
  try {
    const { User } = await initializeModels();
    const { id } = req.params;

    const user = await User.findByPk(id, {
      attributes: { exclude: ['PASSWORD'] },
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, data: user });
  } catch (error) {
    console.error('Error fetching user:', error);
    next(error);
  }
}

export async function updateUser(req, res, next) {
  try {
    const { User } = await initializeModels();
    const { id } = req.params;
    const { USERNAME, EMAIL, PASSWORD, ROLE_ID, DEPARTMENT_ID, STATUS } = req.body;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    let hashedPassword = user.PASSWORD;
    if (PASSWORD) {
      hashedPassword = await bcrypt.hash(PASSWORD, 10);
    }

    await user.update({
      USERNAME: USERNAME || user.USERNAME,
      EMAIL: EMAIL ? EMAIL.toLowerCase() : user.EMAIL,
      PASSWORD: hashedPassword,
      ROLE_ID: ROLE_ID || user.ROLE_ID,
      DEPARTMENT_ID: DEPARTMENT_ID || user.DEPARTMENT_ID,
      STATUS: STATUS || user.STATUS,
      UPDATED_AT: new Date(),
    });

    const updatedUser = { ...user.toJSON() };
    delete updatedUser.PASSWORD;

    res.json({
      success: true,
      message: 'User updated successfully',
      data: updatedUser,
    });
  } catch (error) {
    console.error('Error updating user:', error);
    next(error);
  }
}

export async function deleteUser(req, res, next) {
  try {
    const { User } = await initializeModels();
    const { id } = req.params;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    await user.destroy();

    res.json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    next(error);
  }
}
