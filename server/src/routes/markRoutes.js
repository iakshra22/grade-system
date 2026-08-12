import express from 'express';
import { assignMark, getStudentReport, getAllStudentReports } from '../controllers/markController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// Protect all marks routes
router.use(authMiddleware);

router.post('/', assignMark);
router.get('/reports', getAllStudentReports);
router.get('/student/:studentId', getStudentReport);

export default router;
