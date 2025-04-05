import express from 'express';
import { sendApprovalEmail, sendRejectionEmail } from '../controllers/emailControllers.js';

const router = express.Router();

router.post('/sendApprovalEmail', sendApprovalEmail);

router.post('/sendRejectionEmail', sendRejectionEmail);

export default router;