import express from 'express';
import { authenticateJWT } from '../utils/jwt.js';
import { getSubjectsByUsername, getAcadYrSem, getSubjectsByRefId, getAllSubjectsEnrollment, getAllInstructor, updateSubjectOffered, getAllSubjectsArchived, restoreSubject, archiveSubject} from '../controllers/subjectController.js';

const router = express.Router();

router.post('/getSubjectsByUsername', authenticateJWT, getSubjectsByUsername);

router.post('/getSubjectsByRefId', authenticateJWT, getSubjectsByRefId);

router.post('/updateSubjectOffered', authenticateJWT, updateSubjectOffered);

router.post('/restoreSubject', authenticateJWT, restoreSubject);

router.post('/archiveSubject', authenticateJWT, archiveSubject);

router.get('/getAcadYrSem', authenticateJWT, getAcadYrSem);

router.get('/getAllInstructor', authenticateJWT, getAllInstructor);

router.get('/getAllSubjectsEnrollment', authenticateJWT, getAllSubjectsEnrollment);

router.get('/getAllSubjectsArchived', authenticateJWT, getAllSubjectsArchived)

export default router;
