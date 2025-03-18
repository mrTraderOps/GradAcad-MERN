import express from 'express';
import { getSubjectsByUsername, getAcadYrSem, getSubjectsByRefId} from '../controllers/subjectController.js';

const router = express.Router();

router.post('/getSubjectsByUsername', getSubjectsByUsername);

router.post('/getSubjectsByRefId', getSubjectsByRefId);

router.get('/getAcadYrSem', getAcadYrSem);

export default router;
