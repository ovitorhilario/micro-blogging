import { MongoClient } from 'mongodb';
import Logger from '../utils/logger.js';
import { DatabaseError } from '../utils/errors.js';

/**
 * Configurações do banco de dados
 */
export const databaseConfig = {
  uri: process.env.MONGODB_URI || 'mongodb://localhost:27017',
  dbName: process.env.DB_NAME || 'blog',
  options: {}
};

class Database {
  constructor() {
    this.client = null;
    this.db = null;
    this.isConnectedFlag = false;
  }

  /**
   * Estabelece conexão com o MongoDB
   */
  async connect(uri = null, dbName = null) {
    try {
      const connectionUri = uri || databaseConfig.uri;
      const databaseName = dbName || databaseConfig.dbName;

      if (this.isConnectedFlag) {
        Logger.logWarning('Já existe uma conexão ativa', 'DATABASE');
        return this.db;
      }

      this.client = new MongoClient(connectionUri, databaseConfig.options);
      await this.client.connect();
      
      this.db = this.client.db(databaseName);
      this.isConnectedFlag = true;

      Logger.logInfo(`Conectado ao banco de dados: ${databaseName}`, 'DATABASE');
      return this.db;
    } catch (error) {
      const dbError = new DatabaseError('Erro ao conectar ao banco de dados', error);
      Logger.logError(dbError, 'DATABASE');
      throw dbError;
    }
  }

  /**
   * Fecha conexão com o MongoDB
   */
  async disconnect() {
    try {
      if (!this.isConnectedFlag || !this.client) {
        Logger.logWarning('Nenhuma conexão ativa para fechar', 'DATABASE');
        return;
      }

      await this.client.close();
      this.client = null;
      this.db = null;
      this.isConnectedFlag = false;

      Logger.logInfo('Desconectado do banco de dados', 'DATABASE');
    } catch (error) {
      const dbError = new DatabaseError('Erro ao desconectar do banco de dados', error);
      Logger.logError(dbError, 'DATABASE');
      throw dbError;
    }
  }

  /**
   * Obtém uma coleção do banco
   */
  getCollection(collectionName) {
    try {
      if (!this.isConnectedFlag || !this.db) {
        throw new DatabaseError('Não há conexão ativa com o banco de dados');
      }

      return this.db.collection(collectionName);
    } catch (error) {
      Logger.logError(error, 'DATABASE');
      throw error;
    }
  }

  /**
   * Verifica se está conectado
   */
  isConnected() {
    return this.isConnectedFlag;
  }

  /**
   * Retorna a instância do banco
   */
  getDatabase() {
    if (!this.isConnectedFlag || !this.db) {
      throw new DatabaseError('Não há conexão ativa com o banco de dados');
    }
    return this.db;
  }
}

export default new Database();
