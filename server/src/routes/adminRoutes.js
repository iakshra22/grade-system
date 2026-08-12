import express from 'express';
import { login, changePassword, register } from '../controllers/adminController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/login', login);
router.post('/register', register);
router.post('/change-password', authMiddleware, changePassword);

export default router;
