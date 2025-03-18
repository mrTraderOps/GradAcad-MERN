import express from 'express';
import { getTerms, getAllGrades, updateGrade, insertGrade, generateReport, getStudentGrades, getTermsV2, updateGradeV2 } from '../controllers/gradesController.js';

const router = express.Router();

router.get('/getTerms', getTerms);

router.get('/getTermsV2', getTermsV2);

router.post('/getAllGrades', getAllGrades);

router.post('/insertGrade', insertGrade);

router.put('/updateGrade', updateGrade);

router.put('/updateGradeV2', updateGradeV2);

router.post('/generateReport', generateReport);

router.post('/getStudentGrades', getStudentGrades);

export default router;