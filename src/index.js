import 'dotenv/config';
import express from 'express';
import session from 'express-session';
import path from 'path';
import { fileURLToPath } from 'url';
import Database from './config/database.js';
import Logger from './utils/logger.js';

// Rotas
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import postRoutes from './routes/postRoutes.js';
import commentRoutes from './routes/commentRoutes.js';

// Middlewares
import { errorHandler, notFoundHandler } from './middlewares/errorMiddleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares globais
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configurar express-session
app.use(session({
  secret: process.env.SESSION_SECRET || 'seu-secret-aqui-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 dias
    httpOnly: true,
    secure: false, // HTTPS em produção
    sameSite: 'lax'
  }
}));

// Servir arquivos estáticos
app.use(express.static(path.join(__dirname, '../public')));
app.use(express.static(path.join(__dirname, '../views')));

// Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);

// Rota raiz
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../views/login.html'));
});

// Middlewares de erro (devem vir por último)
app.use(notFoundHandler);
app.use(errorHandler);

// Inicializar servidor
async function startServer() {
  try {
    // Conectar ao banco de dados
    await Database.connect();
    Logger.logInfo('Banco de dados conectado com sucesso', 'SERVER');

    // Iniciar servidor
    app.listen(PORT, () => {
      Logger.logInfo(`Servidor rodando na porta ${PORT}`, 'SERVER');
      console.log(`\n🚀 Servidor iniciado em http://localhost:${PORT}`);
      console.log(`📚 API disponível em http://localhost:${PORT}/api`);
    });
  } catch (error) {
    Logger.logError(error, 'SERVER');
    process.exit(1);
  }
}

// Tratamento de encerramento
process.on('SIGINT', async () => {
  Logger.logInfo('Encerrando servidor...', 'SERVER');
  await Database.disconnect();
  process.exit(0);
});

startServer();
