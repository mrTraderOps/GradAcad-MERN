import express from 'express';
import { authenticateJWT } from '../utils/jwt.js';
import { getTerms, getAllGrades, updateGrade, insertGrade, generateReport, getStudentGrades, getTermsV2, updateGradeV2, updateRemarks, generateReportForRegistrar, updateGradingPeriodNewAcadYr, updateGradingPeriodChangeSem, updateGradingPeriodChangeTerm, updateGradingPeriodTermDone, pendingGradingPeriod, getGradingPeriod, setRequest, revisionRequest, fetchAllRequest, closeRequest, fetchAllRequestById, enlistmentReport, fetchMissingEnrollmentByDept, fetchCompletedEnrollmentByDept, getStudentGradesV2 } from '../controllers/gradesController.js';

const router = express.Router();

router.get('/getTerms',authenticateJWT, getTerms);

router.get('/getTermsV2', authenticateJWT, getTermsV2);

router.get('/generateReportForRegistrar', authenticateJWT, generateReportForRegistrar);

router.get('/pendingGradingPeriod',authenticateJWT, pendingGradingPeriod);

router.get('/getGradingPeriod', authenticateJWT, getGradingPeriod);

router.get('/fetchAllRequest', authenticateJWT, fetchAllRequest);

router.post('/getAllGrades', authenticateJWT, getAllGrades);

router.post('/insertGrade', authenticateJWT, insertGrade);

router.post('/setRequest', authenticateJWT, setRequest);

router.post('/revisionRequest', authenticateJWT, revisionRequest);

router.post('/closeRequest', authenticateJWT, closeRequest);

router.put('/updateGrade', authenticateJWT, updateGrade);

router.put('/updateRemarks', authenticateJWT, updateRemarks);

router.put('/updateGradeV2', authenticateJWT, updateGradeV2);

router.put('/updateGradingPeriod', authenticateJWT, updateGradingPeriodNewAcadYr);

router.put('/updateGradingPeriodV2', authenticateJWT, updateGradingPeriodChangeTerm);

router.put('/updateGradingPeriodV3', authenticateJWT,updateGradingPeriodChangeSem);

router.put('/updateGradingPeriodV4', authenticateJWT, updateGradingPeriodTermDone);

router.post('/generateReport', authenticateJWT, generateReport);

router.post('/enlistmentReport', authenticateJWT, enlistmentReport);

router.post('/getStudentGrades', authenticateJWT, getStudentGrades);

router.post('/getStudentGradesV2', authenticateJWT, getStudentGradesV2);

router.post('/fetchAllRequestById',  authenticateJWT, fetchAllRequestById);

router.post('/fetchMissingEnrollmentByDept',  authenticateJWT, fetchMissingEnrollmentByDept);

router.post('/fetchCompletedEnrollmentByDept',  authenticateJWT, fetchCompletedEnrollmentByDept);

export default router;