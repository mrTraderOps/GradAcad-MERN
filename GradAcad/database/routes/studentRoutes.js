import express from 'express';
import { registerStudent, getStudentByDeptSect, addStudent, deleteStudent } from '../controllers/studentController.js';

const router = express.Router();

// Register route
router.post('/register', registerStudent);

// Get all student by department and section
router.post('/getSection', getStudentByDeptSect);

router.post('/addStudent', addStudent);

router.delete('/deleteStudent', deleteStudent);

export default router;