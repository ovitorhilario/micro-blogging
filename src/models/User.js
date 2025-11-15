import { ObjectId } from 'mongodb';
import Database from '../config/database.js';
import Validator from '../utils/validator.js';
import Logger from '../utils/logger.js';

import { 
  ValidationError, 
  DatabaseError, 
  NotFoundError, 
  DuplicateError,
} from '../utils/errors.js';

class User {
  constructor() {
    this.collectionName = 'users';
  }

  /**
   * Obtém a coleção de usuários
   */
  getCollection() {
    return Database.getCollection(this.collectionName);
  }

  /**
   * Cria um novo usuário
   */
  async create(userData) {
    try {
      // Validar campos obrigatórios
      Validator.validateRequired(['username', 'email', 'password'], userData);
      
      // Validar formato de email
      Validator.validateEmail(userData.email);
      
      // Validar username
      Validator.validateUsername(userData.username);

      // Validar password
      if (userData.password.length < 6) {
        throw new ValidationError('Senha deve ter pelo menos 6 caracteres');
      }

      // Verificar duplicidade de username
      const existingUsername = await this.findByUsername(userData.username);
      if (existingUsername) {
        throw new DuplicateError(`Username '${userData.username}' já está em uso`);
      }

      // Verificar duplicidade de email
      const collection = this.getCollection();
      const existingEmail = await collection.findOne({ email: userData.email });
      if (existingEmail) {
        throw new DuplicateError(`Email '${userData.email}' já está em uso`);
      }

      // Preparar dados do usuário
      const user = {
        username: userData.username,
        email: userData.email,
        password: userData.password, // Será hasheado no controller
        bio: userData.bio || '',
        profileImage: userData.profileImage || '',
        followers: [],
        following: [],
        createdAt: new Date()
      };

      // Inserir no banco
      const result = await collection.insertOne(user);
      
      Logger.logInfo(`Usuário criado: ${userData.username}`, 'MODEL');
      
      return {
        _id: result.insertedId,
        ...user
      };
    } catch (error) {
      Logger.logError(error, 'MODEL');
      throw error;
    }
  }

  /**
   * Busca usuário por ID
   */
  async findById(userId) {
    try {
      Validator.validateObjectId(userId, 'User ID');

      const collection = this.getCollection();
      const user = await collection.findOne({ _id: new ObjectId(userId) });

      if (!user) {
        throw new NotFoundError(`Usuário com ID '${userId}' não encontrado`);
      }

      return user;
    } catch (error) {
      Logger.logError(error, 'MODEL');
      throw error;
    }
  }

  /**
   * Busca usuário por username
   */
  async findByUsername(username) {
    try {
      if (!username) {
        throw new ValidationError('Username não fornecido');
      }

      const collection = this.getCollection();
      const user = await collection.findOne({ username: username });

      return user;
    } catch (error) {
      Logger.logError(error, 'MODEL');
      throw error;
    }
  }

  /**
   * Atualiza dados do usuário
   */
  async update(userId, userData) {
    try {
      Validator.validateObjectId(userId, 'User ID');

      // Verificar se usuário existe
      await this.findById(userId);

      // Validações condicionais
      if (userData.email) {
        Validator.validateEmail(userData.email);
        
        // Verificar se email já está em uso por outro usuário
        const collection = this.getCollection();
        const existingEmail = await collection.findOne({
          email: userData.email,
          _id: { $ne: new ObjectId(userId) }
        });
        
        if (existingEmail) {
          throw new DuplicateError(`Email '${userData.email}' já está em uso`);
        }
      }

      if (userData.username) {
        Validator.validateUsername(userData.username);
        
        // Verificar se username já está em uso por outro usuário
        const collection = this.getCollection();
        const existingUsername = await collection.findOne({
          username: userData.username,
          _id: { $ne: new ObjectId(userId) }
        });
        
        if (existingUsername) {
          throw new DuplicateError(`Username '${userData.username}' já está em uso`);
        }
      }

      // Campos permitidos para atualização
      const allowedFields = ['username', 'email', 'bio', 'profileImage'];
      const updateData = {};

      for (const field of allowedFields) {
        if (userData[field] !== undefined) {
          updateData[field] = userData[field];
        }
      }

      if (Object.keys(updateData).length === 0) {
        throw new ValidationError('Nenhum campo válido fornecido para atualização');
      }

      const collection = this.getCollection();
      const result = await collection.findOneAndUpdate(
        { _id: new ObjectId(userId) },
        { $set: updateData },
        { returnDocument: 'after' }
      );

      Logger.logInfo(`Usuário atualizado: ${userId}`, 'MODEL');
      
      return result;
    } catch (error) {
      Logger.logError(error, 'MODEL');
      throw error;
    }
  }

  /**
   * Deleta usuário
   */
  async delete(userId) {
    try {
      Validator.validateObjectId(userId, 'User ID');

      // Verificar se usuário existe
      await this.findById(userId);

      const collection = this.getCollection();
      const result = await collection.deleteOne({ _id: new ObjectId(userId) });

      if (result.deletedCount === 0) {
        throw new DatabaseError('Erro ao deletar usuário');
      }

      Logger.logInfo(`Usuário deletado: ${userId}`, 'MODEL');
      
      return { success: true, deletedCount: result.deletedCount };
    } catch (error) {
      Logger.logError(error, 'MODEL');
      throw error;
    }
  }

  /**
   * Seguir outro usuário
   */
  async follow(userId, targetUserId) {
    try {
      Validator.validateObjectId(userId, 'User ID');
      Validator.validateObjectId(targetUserId, 'Target User ID');

      if (userId === targetUserId) {
        throw new ValidationError('Usuário não pode seguir a si mesmo');
      }

      // Verificar se ambos os usuários existem
      await this.findById(userId);
      await this.findById(targetUserId);

      const collection = this.getCollection();

      // Verificar se já está seguindo
      const user = await collection.findOne({
        _id: new ObjectId(userId),
        following: new ObjectId(targetUserId)
      });

      if (user) {
        throw new ValidationError('Usuário já está sendo seguido');
      }

      // Adicionar targetUserId ao array following do userId
      await collection.updateOne(
        { _id: new ObjectId(userId) },
        { $addToSet: { following: new ObjectId(targetUserId) } }
      );

      // Adicionar userId ao array followers do targetUserId
      await collection.updateOne(
        { _id: new ObjectId(targetUserId) },
        { $addToSet: { followers: new ObjectId(userId) } }
      );

      Logger.logInfo(`Usuário ${userId} seguiu ${targetUserId}`, 'MODEL');
      
      return { success: true };
    } catch (error) {
      Logger.logError(error, 'MODEL');
      throw error;
    }
  }

  /**
   * Deixar de seguir usuário
   */
  async unfollow(userId, targetUserId) {
    try {
      Validator.validateObjectId(userId, 'User ID');
      Validator.validateObjectId(targetUserId, 'Target User ID');

      if (userId === targetUserId) {
        throw new ValidationError('Operação inválida');
      }

      // Verificar se ambos os usuários existem
      await this.findById(userId);
      await this.findById(targetUserId);

      const collection = this.getCollection();

      // Remover targetUserId do array following do userId
      await collection.updateOne(
        { _id: new ObjectId(userId) },
        { $pull: { following: new ObjectId(targetUserId) } }
      );

      // Remover userId do array followers do targetUserId
      await collection.updateOne(
        { _id: new ObjectId(targetUserId) },
        { $pull: { followers: new ObjectId(userId) } }
      );

      Logger.logInfo(`Usuário ${userId} deixou de seguir ${targetUserId}`, 'MODEL');
      
      return { success: true };
    } catch (error) {
      Logger.logError(error, 'MODEL');
      throw error;
    }
  }

  /**
   * Lista todos os usuários (com paginação)
   */
  async list(options = {}) {
    try {
      const limit = options.limit || 20;
      const skip = options.skip || 0;

      const collection = this.getCollection();
      const users = await collection
        .find({})
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray();

      return users;
    } catch (error) {
      Logger.logError(error, 'MODEL');
      throw error;
    }
  }
}

// Exporta uma instância única (singleton)
export default new User();
