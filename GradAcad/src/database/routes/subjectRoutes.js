import express from 'express';
import { getSubjectsByUsername, getAcadYrSem} from '../controllers/subjectController.js';

const router = express.Router();

router.post('/getSubjectsByUsername', getSubjectsByUsername);

router.get('/getAcadYrSem', getAcadYrSem);

export default router;
