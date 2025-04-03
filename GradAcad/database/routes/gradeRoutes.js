import express from 'express';
import { getTerms, getAllGrades, updateGrade, insertGrade, generateReport, getStudentGrades, getTermsV2, updateGradeV2, updateRemarks, generateReportForRegistrar, updateGradingPeriodNewAcadYr, updateGradingPeriodChangeSem, updateGradingPeriodChangeTerm, updateGradingPeriodTermDone, pendingGradingPeriod, getGradingPeriod, setRequest, revisionRequest, fetchAllRequest, closeRequest, fetchAllRequestById, enlistmentReport } from '../controllers/gradesController.js';

const router = express.Router();

router.get('/getTerms', getTerms);

router.get('/getTermsV2', getTermsV2);

router.get('/generateReportForRegistrar', generateReportForRegistrar);

router.get('/pendingGradingPeriod', pendingGradingPeriod);

router.get('/getGradingPeriod', getGradingPeriod);

router.get('/fetchAllRequest', fetchAllRequest);

router.post('/getAllGrades', getAllGrades);

router.post('/insertGrade', insertGrade);

router.post('/setRequest', setRequest);

router.post('/revisionRequest', revisionRequest);

router.post('/closeRequest', closeRequest);

router.put('/updateGrade', updateGrade);

router.put('/updateRemarks', updateRemarks);

router.put('/updateGradeV2', updateGradeV2);

router.put('/updateGradingPeriod', updateGradingPeriodNewAcadYr);

router.put('/updateGradingPeriodV2', updateGradingPeriodChangeTerm);

router.put('/updateGradingPeriodV3', updateGradingPeriodChangeSem);

router.put('/updateGradingPeriodV4', updateGradingPeriodTermDone);

router.post('/generateReport', generateReport);

router.post('/enlistmentReport', enlistmentReport);

router.post('/getStudentGrades', getStudentGrades);

router.post('/fetchAllRequestById', fetchAllRequestById);



export default router;