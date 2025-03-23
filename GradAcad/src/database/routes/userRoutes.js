import express from 'express';
import { loginUser, registerUser, updateUser, deleteUser, approveAccount, getPendingUsers, getAllUsers } from '../controllers/userController.js';

const router = express.Router();

// Login route
router.post('/login', loginUser);

// Register route
router.post('/register', registerUser);

router.get('/getAllUsers', getAllUsers);

// Get all users
router.get('/getPendingUsers', getPendingUsers);

// Update a user
router.put('/updateByUsername', updateUser);

// Delete a user
router.delete('/deleteByUsername', deleteUser);

// Approve a user
router.post('/approveAccount', approveAccount);

export default router;
