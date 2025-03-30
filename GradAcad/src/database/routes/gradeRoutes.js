import express from 'express';
import { getTerms, getAllGrades, updateGrade, insertGrade, generateReport, getStudentGrades, getTermsV2, updateGradeV2, updateRemarks, generateReportForRegistrar, updateGradingPeriod, updateGradingPeriodV2 } from '../controllers/gradesController.js';

const router = express.Router();

router.get('/getTerms', getTerms);

router.get('/getTermsV2', getTermsV2);

router.get('/generateReportForRegistrar', generateReportForRegistrar);

router.post('/getAllGrades', getAllGrades);

router.post('/insertGrade', insertGrade);

router.put('/updateGrade', updateGrade);

router.put('/updateRemarks', updateRemarks);

router.put('/updateGradeV2', updateGradeV2);

router.put('/updateGradingPeriod', updateGradingPeriod);

router.put('/updateGradingPeriodV2', updateGradingPeriodV2);

router.post('/generateReport', generateReport);

router.post('/getStudentGrades', getStudentGrades);

export default router;