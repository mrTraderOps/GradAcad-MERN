import express from 'express';
import { getSubjectsByUsername, getAcadYrSem, getSubjectsByRefId, getAllSubjectsEnrollment, getAllInstructor, updateSubjectOffered, getAllSubjectsArchived, restoreSubject, archiveSubject} from '../controllers/subjectController.js';

const router = express.Router();

router.post('/getSubjectsByUsername', getSubjectsByUsername);

router.post('/getSubjectsByRefId', getSubjectsByRefId);

router.post('/updateSubjectOffered', updateSubjectOffered);

router.post('/restoreSubject', restoreSubject);

router.post('/archiveSubject', archiveSubject);

router.get('/getAcadYrSem', getAcadYrSem);

router.get('/getAllInstructor', getAllInstructor);

router.get('/getAllSubjectsEnrollment', getAllSubjectsEnrollment);

router.get('/getAllSubjectsArchived', getAllSubjectsArchived)

export default router;
