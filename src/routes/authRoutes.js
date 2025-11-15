import express from 'express';
import authController from '../controllers/authController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Rotas públicas
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);

// Rotas protegidas
router.get('/verify', authMiddleware, authController.verifySession);

export default router;
