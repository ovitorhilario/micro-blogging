import express from 'express';
import postController from '../controllers/postController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Rotas públicas
router.get('/user/:username', postController.getUserPosts);
router.get('/hashtag/:hashtag', postController.getPostsByHashtag);

// Rotas protegidas
router.post('/', authMiddleware, postController.createPost);
router.get('/timeline', authMiddleware, postController.getTimeline);
router.post('/:postId/like', authMiddleware, postController.likePost);
router.delete('/:postId/like', authMiddleware, postController.unlikePost);
router.delete('/:postId', authMiddleware, postController.deletePost);

export default router;
