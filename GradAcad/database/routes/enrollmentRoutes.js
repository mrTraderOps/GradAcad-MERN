import express from 'express';
import { insertOrUpdateEnrollment } from '../controllers/enrollmentControllers.js';

const router = express.Router();

router.post('/insertOrUpdateEnrollment', insertOrUpdateEnrollment);

export default router;