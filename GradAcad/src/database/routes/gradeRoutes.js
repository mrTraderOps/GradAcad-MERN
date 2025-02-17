import express from 'express';
import { getTerms, getAllGrades } from '../controllers/gradesController.js';

const router = express.Router();

router.get('/getTerms', getTerms);

router.post('/getAllGrades', getAllGrades);

export default router;