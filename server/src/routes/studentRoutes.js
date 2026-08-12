import express from 'express';
import { addStudent, editStudent, deleteStudent, getStudents, searchStudents } from '../controllers/studentController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// Protect all student routes
router.use(authMiddleware);

router.post('/', addStudent);
router.put('/:id', editStudent);
router.delete('/:id', deleteStudent);
router.get('/', getStudents);
router.get('/search', searchStudents);

export default router;
