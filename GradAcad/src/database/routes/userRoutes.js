import express from 'express';
import { loginUser, registerUser, updateUser, deleteUser, getUserById, getAllUsers } from '../controllers/userController.js';

const router = express.Router();

// Login route
router.post('/login', loginUser);

// Register route
router.post('/register', registerUser);

// Get all users
router.get('/', getAllUsers);

// Get a user by ID
router.get('/:id', getUserById);

// Update a user
router.put('/:id', updateUser);

// Delete a user
router.delete('/:id', deleteUser);

export default router;
