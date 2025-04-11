import express from 'express';
import { notifyEmailMissedSubjects, sendApprovalEmail, sendRejectionEmail } from '../controllers/emailControllers.js';

const router = express.Router();

router.post('/sendApprovalEmail', sendApprovalEmail);

router.post('/sendRejectionEmail', sendRejectionEmail);

router.post('/notifyEmailMissedSubjects', notifyEmailMissedSubjects);

export default router;