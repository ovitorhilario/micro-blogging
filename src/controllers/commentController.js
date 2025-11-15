import commentModel from '../models/Comment.js';
import Logger from '../utils/logger.js';

class CommentController {
  /**
   * Cria novo comentário
   */
  async createComment(req, res) {
    try {
      const { postId, content, parentCommentId } = req.body;
      const userId = req.userId;
      const username = req.username;

      if (!postId || !content) {
        return res.status(400).json({
          success: false,
          message: 'Campos obrigatórios: postId, content'
        });
      }

      const comment = await commentModel.create({
        postId,
        userId,
        content,
        parentCommentId
      });

      // Adicionar username ao comentário retornado
      comment.username = username;

      res.status(201).json({
        success: true,
        message: 'Comentário criado com sucesso',
        data: { comment }
      });
    } catch (error) {
      Logger.logError(error, 'COMMENT');
      
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Busca comentários de um post
   */
  async getPostComments(req, res) {
    try {
      const { postId } = req.params;
      const { limit = 50, skip = 0 } = req.query;

      const comments = await commentModel.findByPost(postId, {
        limit: parseInt(limit),
        skip: parseInt(skip)
      });

      res.json({
        success: true,
        data: { comments }
      });
    } catch (error) {
      Logger.logError(error, 'COMMENT');
      
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar comentários'
      });
    }
  }

  /**
   * Busca respostas de um comentário
   */
  async getCommentReplies(req, res) {
    try {
      const { commentId } = req.params;
      const { limit = 20, skip = 0 } = req.query;

      const replies = await commentModel.findReplies(commentId, {
        limit: parseInt(limit),
        skip: parseInt(skip)
      });

      res.json({
        success: true,
        data: { replies }
      });
    } catch (error) {
      Logger.logError(error, 'COMMENT');
      
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar respostas'
      });
    }
  }

  /**
   * Curtir comentário
   */
  async likeComment(req, res) {
    try {
      const { commentId } = req.params;
      const userId = req.userId;

      await commentModel.like(commentId, userId);

      res.json({
        success: true,
        message: 'Comentário curtido com sucesso'
      });
    } catch (error) {
      Logger.logError(error, 'COMMENT');
      
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Remover curtida do comentário
   */
  async unlikeComment(req, res) {
    try {
      const { commentId } = req.params;
      const userId = req.userId;

      await commentModel.unlike(commentId, userId);

      res.json({
        success: true,
        message: 'Curtida removida com sucesso'
      });
    } catch (error) {
      Logger.logError(error, 'COMMENT');
      
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Deletar comentário
   */
  async deleteComment(req, res) {
    try {
      const { commentId } = req.params;
      const userId = req.userId;

      // Verificar se o comentário pertence ao usuário
      const comment = await commentModel.findById(commentId);
      
      if (comment.userId.toString() !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Você não tem permissão para deletar este comentário'
        });
      }

      await commentModel.delete(commentId);

      res.json({
        success: true,
        message: 'Comentário deletado com sucesso'
      });
    } catch (error) {
      Logger.logError(error, 'COMMENT');
      
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
}

export default new CommentController();
