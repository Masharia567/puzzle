// routes/userRoutes.js
import express from 'express';
import {
  register,
  login,
  getProfile,
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  changePassword,
  logout,
} from '../controllers/userController.js';

const router = express.Router();

/* ============================================================================
 * AUTHENTICATION ROUTES
 * ============================================================================ */

/**
 * @route   POST /api/users/register
 * @desc    Register new user (first-time login via Microsoft)
 * @access  Public
 */
router.post('/register', register);

/**
 * @route   POST /api/users/login
 * @desc    Login user (email or microsoftId)
 * @access  Public
 */
router.post('/login', login);

/**
 * @route   GET /api/users/profile
 * @desc    Get current user profile (JWT protected)
 * @access  Private
 */
router.get('/profile', getProfile);

/**
 * @route   POST /api/users/change-password
 * @desc    Not supported
 * @access  Public
 */
router.post('/change-password', changePassword);

/**
 * @route   POST /api/users/logout
 * @desc    Logout (client-side)
 * @access  Public
 */
router.post('/logout', logout);

/* ============================================================================
 * USER MANAGEMENT CRUD
 * ============================================================================ */

/**
 * @route   POST /api/users
 * @desc    Create new user (admin)
 * @access  Private (admin)
 */
router.post('/', createUser);

/**
 * @route   GET /api/users
 * @desc    Get all users
 * @access  Private (admin)
 */
router.get('/', getAllUsers);

/**
 * @route   GET /api/users/:id
 * @desc    Get user by ID
 * @access  Private (admin or self)
 */
router.get('/:id', getUserById);

/**
 * @route   PUT /api/users/:id
 * @desc    Update user by ID
 * @access  Private (admin or self)
 */
router.put('/:id', updateUser);

/**
 * @route   DELETE /api/users/:id
 * @desc    Delete user by ID
 * @access  Private (admin)
 */
router.delete('/:id', deleteUser);

export default router;