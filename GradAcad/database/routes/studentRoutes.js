import express from 'express';
import { authenticateJWT } from '../utils/jwt.js';
import { getStudentByDeptSect, addStudent, deleteStudent, getStudentInfoById, getAllStudentGrade } from '../controllers/studentController.js';

const router = express.Router();

router.post('/getSection', authenticateJWT, getStudentByDeptSect);

router.post('/addStudent', authenticateJWT, addStudent);

router.delete('/deleteStudent', authenticateJWT, deleteStudent);

router.post('/getStudentInfoById', authenticateJWT, getStudentInfoById);

router.post('/getAllStudentGrade', authenticateJWT, getAllStudentGrade);
export default router;