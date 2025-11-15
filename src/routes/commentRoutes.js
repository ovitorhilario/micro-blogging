import express from 'express';
import commentController from '../controllers/commentController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Rotas públicas
router.get('/post/:postId', commentController.getPostComments);
router.get('/:commentId/replies', commentController.getCommentReplies);

// Rotas protegidas
router.post('/', authMiddleware, commentController.createComment);
router.post('/:commentId/like', authMiddleware, commentController.likeComment);
router.delete('/:commentId/like', authMiddleware, commentController.unlikeComment);
router.delete('/:commentId', authMiddleware, commentController.deleteComment);

export default router;
