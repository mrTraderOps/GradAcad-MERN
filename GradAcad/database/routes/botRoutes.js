import express from 'express';
import { authenticateJWT } from '../utils/jwt.js';
import { barChatBot, pieChatBot } from '../controllers/botControllers.js';

const router = express.Router();

router.post('/pieChatBot', authenticateJWT, pieChatBot);

router.post('/barChatBot', authenticateJWT, barChatBot);

export default router;