import express from 'express';
import { getTerms, getAllGrades, updateGrade, insertGrade } from '../controllers/gradesController.js';

const router = express.Router();

router.get('/getTerms', getTerms);

router.post('/getAllGrades', getAllGrades);

router.post('/insertGrade', insertGrade);

router.put('/updateGrade', updateGrade);

export default router;