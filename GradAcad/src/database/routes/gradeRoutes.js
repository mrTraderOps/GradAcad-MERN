import express from 'express';
import { getTerms } from '../controllers/gradesController.js';

const router = express.Router();

router.get('/getTerms', getTerms);

// router.get('/getAllGrades', getAllGrades);

export default router;