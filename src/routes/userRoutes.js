import express from 'express';
import userController from '../controllers/userController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Rotas públicas
router.get('/:username', userController.getProfile);

// Rotas protegidas
router.put('/profile', authMiddleware, userController.updateProfile);
router.post('/:username/follow', authMiddleware, userController.followUser);
router.delete('/:username/follow', authMiddleware, userController.unfollowUser);

export default router;
