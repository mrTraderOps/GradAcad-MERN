import express from 'express';
import { loginUser, registerUser, updateUser, deleteUser, getUserById, getAllUsers, approveAccount } from '../controllers/userController.js';

const router = express.Router();

// Login route
router.post('/login', loginUser);

// Register route
router.post('/register', registerUser);

// Get all users
router.get('/getUsersPending', getAllUsers);

// Update a user
router.put('/updateByUsername', updateUser);

// Delete a user
router.delete('/deleteByUsername', deleteUser);

// Approve a user
router.post('/approveAccount', approveAccount);

export default router;
