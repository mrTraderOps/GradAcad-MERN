import express from 'express';
import { authenticateJWT } from '../utils/jwt.js';
import { registerStudent, getStudentByDeptSect, addStudent, deleteStudent } from '../controllers/studentController.js';

const router = express.Router();

router.post('/register', authenticateJWT, registerStudent);

router.post('/getSection', authenticateJWT, getStudentByDeptSect);

router.post('/addStudent', authenticateJWT, addStudent);

router.delete('/deleteStudent', authenticateJWT, deleteStudent);

export default router;