import postModel from '../models/Post.js';
import Logger from '../utils/logger.js';

class PostController {
  /**
   * Cria novo post
   */
  async createPost(req, res) {
    try {
      const { content, media } = req.body;
      const userId = req.userId;

      if (!content) {
        return res.status(400).json({
          success: false,
          message: 'Campo obrigatório: content'
        });
      }

      const post = await postModel.create({
        userId,
        content,
        media
      });

      res.status(201).json({
        success: true,
        message: 'Post criado com sucesso',
        data: { post }
      });
    } catch (error) {
      Logger.logError(error, 'POST');
      
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Busca posts de um usuário
   */
  async getUserPosts(req, res) {
    try {
      const { username } = req.params;
      const { limit = 20, skip = 0 } = req.query;

      // Buscar usuário por username
      const userModel = (await import('../models/User.js')).default;
      const user = await userModel.findByUsername(username);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Usuário não encontrado'
        });
      }

      const posts = await postModel.findByUser(user._id.toString(), {
        limit: parseInt(limit),
        skip: parseInt(skip)
      });

      res.json({
        success: true,
        data: { posts }
      });
    } catch (error) {
      Logger.logError(error, 'POST');
      
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar posts'
      });
    }
  }

  /**
   * Busca timeline do usuário (posts de quem ele segue)
   */
  async getTimeline(req, res) {
    try {
      const userId = req.userId;
      const { limit = 20, skip = 0 } = req.query;

      const posts = await postModel.findTimeline(userId, {
        limit: parseInt(limit),
        skip: parseInt(skip)
      });

      // Enriquecer posts com informações do usuário
      const userModel = (await import('../models/User.js')).default;
      
      const enrichedPosts = await Promise.all(
        posts.map(async (post) => {
          try {
            const user = await userModel.findById(post.userId.toString());
            return { ...post, username: user.username };
          } catch {
            return { ...post, username: 'unknown' };
          }
        })
      );

      res.json({
        success: true,
        data: { posts: enrichedPosts }
      });
    } catch (error) {
      Logger.logError(error, 'POST');
      
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar timeline'
      });
    }
  }

  /**
   * Busca posts por hashtag
   */
  async getPostsByHashtag(req, res) {
    try {
      const { hashtag } = req.params;
      const { limit = 20, skip = 0 } = req.query;

      const posts = await postModel.findByHashtag(hashtag, {
        limit: parseInt(limit),
        skip: parseInt(skip)
      });

      res.json({
        success: true,
        data: { posts }
      });
    } catch (error) {
      Logger.logError(error, 'POST');
      
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar posts'
      });
    }
  }

  /**
   * Curtir post
   */
  async likePost(req, res) {
    try {
      const { postId } = req.params;
      const userId = req.userId;

      await postModel.like(postId, userId);

      res.json({
        success: true,
        message: 'Post curtido com sucesso'
      });
    } catch (error) {
      Logger.logError(error, 'POST');
      
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Remover curtida do post
   */
  async unlikePost(req, res) {
    try {
      const { postId } = req.params;
      const userId = req.userId;

      await postModel.unlike(postId, userId);

      res.json({
        success: true,
        message: 'Curtida removida com sucesso'
      });
    } catch (error) {
      Logger.logError(error, 'POST');
      
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Deletar post
   */
  async deletePost(req, res) {
    try {
      const { postId } = req.params;
      const userId = req.userId;

      // Verificar se o post pertence ao usuário
      const post = await postModel.findById(postId);
      
      if (post.userId.toString() !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Você não tem permissão para deletar este post'
        });
      }

      await postModel.delete(postId);

      res.json({
        success: true,
        message: 'Post deletado com sucesso'
      });
    } catch (error) {
      Logger.logError(error, 'POST');
      
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
}

export default new PostController();
