import userModel from '../models/User.js';
import Logger from '../utils/logger.js';

class UserController {
  /**
   * Busca perfil de usuário
   */
  async getProfile(req, res) {
    try {
      const { username } = req.params;

      const user = await userModel.findByUsername(username);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Usuário não encontrado'
        });
      }

      // Remover senha
      delete user.password;

      res.json({
        success: true,
        data: { user }
      });
    } catch (error) {
      Logger.logError(error, 'USER');
      
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar usuário'
      });
    }
  }

  /**
   * Atualiza perfil do usuário autenticado
   */
  async updateProfile(req, res) {
    try {
      const { bio, profileImage } = req.body;
      const userId = req.userId;

      const user = await userModel.update(userId, {
        bio,
        profileImage
      });

      delete user.password;

      res.json({
        success: true,
        message: 'Perfil atualizado com sucesso',
        data: { user }
      });
    } catch (error) {
      Logger.logError(error, 'USER');
      
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Seguir usuário
   */
  async followUser(req, res) {
    try {
      const { username } = req.params;
      const currentUserId = req.userId;

      const userToFollow = await userModel.findByUsername(username);
      
      if (!userToFollow) {
        return res.status(404).json({
          success: false,
          message: 'Usuário não encontrado'
        });
      }

      await userModel.follow(currentUserId, userToFollow._id.toString());

      res.json({
        success: true,
        message: `Você agora segue ${username}`
      });
    } catch (error) {
      Logger.logError(error, 'USER');
      
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Deixar de seguir usuário
   */
  async unfollowUser(req, res) {
    try {
      const { username } = req.params;
      const currentUserId = req.userId;

      const userToUnfollow = await userModel.findByUsername(username);
      
      if (!userToUnfollow) {
        return res.status(404).json({
          success: false,
          message: 'Usuário não encontrado'
        });
      }

      await userModel.unfollow(currentUserId, userToUnfollow._id.toString());

      res.json({
        success: true,
        message: `Você deixou de seguir ${username}`
      });
    } catch (error) {
      Logger.logError(error, 'USER');
      
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
}

export default new UserController();
