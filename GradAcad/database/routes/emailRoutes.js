import express from 'express';
import { forgotPassword, notifyEmailMissedSubjects, sendApprovalEmail, sendRejectionEmail } from '../controllers/emailControllers.js';

const router = express.Router();

router.post('/sendApprovalEmail', sendApprovalEmail);

router.post('/sendRejectionEmail', sendRejectionEmail);

router.post('/notifyEmailMissedSubjects', notifyEmailMissedSubjects);

router.post('/forgotPassword', forgotPassword);

export default router;