import express from 'express';
import { registerStudent, getStudentByDeptSect, getStudentById, deleteStudent, updateStudent } from '../controllers/studentController.js';

const router = express.Router();

// Register route
router.post('/register', registerStudent);

// Get all student by department and section
router.post('/getSection', getStudentByDeptSect);

// Get a user by ID
router.get('/:id', getStudentById);

// Update a user
router.put('/:id', updateStudent);

// Delete a user
router.delete('/:id', deleteStudent);

export default router;