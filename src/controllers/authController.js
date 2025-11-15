import userModel from '../models/User.js';
import Logger from '../utils/logger.js';

class AuthController {
  /**
   * Registro de novo usuário
   */
  async register(req, res) {
    try {
      const { username, email, password, bio, profileImage } = req.body;

      // Validar campos obrigatórios
      if (!username || !email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Campos obrigatórios: username, email, password'
        });
      }

      // Criar usuário
      const user = await userModel.create({
        username,
        email,
        password,
        bio,
        profileImage
      });

      // Remover senha do retorno
      delete user.password;

      // Criar sessão
      req.session.userId = user._id;
      req.session.username = user.username;

      Logger.logInfo(`Usuário registrado: ${username}`, 'AUTH');

      res.status(201).json({
        success: true,
        message: 'Usuário registrado com sucesso',
        data: { user }
      });
    } catch (error) {
      Logger.logError(error, 'AUTH');
      
      const status = error.name === 'DuplicateError' ? 409 : 400;
      
      res.status(status).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Login de usuário
   */
  async login(req, res) {
    try {
      const { username, password } = req.body;

      // Validar campos obrigatórios
      if (!username || !password) {
        return res.status(400).json({
          success: false,
          message: 'Campos obrigatórios: username, password'
        });
      }

      // Buscar usuário
      const user = await userModel.findByUsername(username);
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Usuário ou senha inválidos'
        });
      }

      // Verificar senha
      if (password !== user.password) {
        return res.status(401).json({
          success: false,
          message: 'Usuário ou senha inválidos'
        });
      }

      // Remover senha do retorno
      delete user.password;

      // Criar sessão
      req.session.userId = user._id;
      req.session.username = user.username;

      Logger.logInfo(`Usuário autenticado: ${username}`, 'AUTH');

      res.json({
        success: true,
        message: 'Login realizado com sucesso',
        data: { user }
      });
    } catch (error) {
      Logger.logError(error, 'AUTH');
      
      res.status(500).json({
        success: false,
        message: 'Erro ao realizar login'
      });
    }
  }

  /**
   * Verifica sessão do usuário
   */
  async verifySession(req, res) {
    try {
      const user = await userModel.findById(req.userId);
      delete user.password;

      res.json({
        success: true,
        data: { user }
      });
    } catch (error) {
      Logger.logError(error, 'AUTH');
      
      res.status(500).json({
        success: false,
        message: 'Erro ao verificar sessão'
      });
    }
  }

  /**
   * Logout do usuário
   */
  async logout(req, res) {
    try {
      req.session.destroy((err) => {
        if (err) {
          Logger.logError(err, 'AUTH');
          return res.status(500).json({
            success: false,
            message: 'Erro ao realizar logout'
          });
        }

        res.clearCookie('connect.sid');
        res.json({
          success: true,
          message: 'Logout realizado com sucesso'
        });
      });
    } catch (error) {
      Logger.logError(error, 'AUTH');
      
      res.status(500).json({
        success: false,
        message: 'Erro ao realizar logout'
      });
    }
  }
}

export default new AuthController();
