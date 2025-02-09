import express from 'express';
import { getTerms, getAllGrades } from '../controllers/gradesController.js';

const router = express.Router();

// Login route
router.get('/getTerms', getTerms);

router.get('/getAllGrades', getAllGrades);

export default router;