import express from 'express';
import { addSubject, getSubjects, deleteSubject } from '../controllers/subjectController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// Protect all subject routes
router.use(authMiddleware);

router.post('/', addSubject);
router.get('/', getSubjects);
router.delete('/:id', deleteSubject);

export default router;
