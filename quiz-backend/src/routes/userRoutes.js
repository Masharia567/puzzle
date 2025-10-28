import express from 'express';
import {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  login // 👈 added login import only
} from '../controllers/userController.js';

const router = express.Router();

/**
 * @route POST /api/users/login
 * @desc Login user
 */
router.post('/login', login); // 👈 added login route

/**
 * @route POST /api/users
 * @desc Create new user
 */
router.post('/', createUser);

/**
 * @route GET /api/users
 * @desc Get all users
 */
router.get('/', getAllUsers);

/**
 * @route GET /api/users/:id
 * @desc Get user by ID
 */
router.get('/:id', getUserById);

/**
 * @route PUT /api/users/:id
 * @desc Update user by ID
 */
router.put('/:id', updateUser);

/**
 * @route DELETE /api/users/:id
 * @desc Delete user by ID
 */
router.delete('/:id', deleteUser);

export default router;
