import express from 'express';
import { getCountUsersRole, loginUser, registerUser } from '../controllers/authControllers.js';

const router = express.Router();

// Login route
router.post('/login', loginUser);

// Register route
router.post('/register', registerUser);

// Get Counts All role for Auto Generated ID
router.get('/getCountUsersRole', getCountUsersRole);

export default router;