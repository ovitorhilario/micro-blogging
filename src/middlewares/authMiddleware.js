import Logger from '../utils/logger.js';

/**
 * Middleware de autenticação usando express-session
 */
export const authMiddleware = (req, res, next) => {
  try {
    // Verificar se existe sessão
    if (!req.session || !req.session.userId) {
      return res.status(401).json({
        success: false,
        message: 'Não autenticado'
      });
    }

    // Adicionar userId ao request
    req.userId = req.session.userId;
    req.username = req.session.username;

    next();
  } catch (error) {
    Logger.logError(error, 'AUTH_MIDDLEWARE');
    
    return res.status(401).json({
      success: false,
      message: 'Erro ao verificar autenticação'
    });
  }
};
