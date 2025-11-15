import Logger from '../utils/logger.js';

/**
 * Middleware para tratamento de erros
 */
export const errorHandler = (err, req, res) => {
  Logger.logError(err, 'ERROR_HANDLER');

  // Erros conhecidos
  const statusMap = {
    'ValidationError': 400,
    'NotFoundError': 404,
    'DuplicateError': 409,
    'DatabaseError': 500,
    'UnauthorizedError': 401,
    'ForbiddenError': 403
  };

  const status = statusMap[err.name] || 500;

  res.status(status).json({
    success: false,
    message: err.message || 'Erro interno do servidor',
    error: err.stack
  });
};

/**
 * Middleware para rotas não encontradas
 */
export const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Rota não encontrada'
  });
};
