import express from 'express';
import { getSubjectsByUsername } from '../controllers/subjectController.js';

const router = express.Router();

router.post('/getSubjectsByUsername', getSubjectsByUsername);

export default router;
