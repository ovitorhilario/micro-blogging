import { ObjectId } from 'mongodb';
import Database from '../config/database.js';
import Validator from '../utils/validator.js';
import Logger from '../utils/logger.js';
import User from './User.js';
import Post from './Post.js';

import { 
  ValidationError, 
  DatabaseError, 
  NotFoundError, 
} from '../utils/errors.js';

class Comment {
  constructor() {
    this.collectionName = 'comments';
  }

  /**
   * Obtém a coleção de comentários
   */
  getCollection() {
    return Database.getCollection(this.collectionName);
  }

  /**
   * Cria um novo comentário
   */
  async create(commentData) {
    try {
      // Validar campos obrigatórios
      Validator.validateRequired(['postId', 'userId', 'content'], commentData);
      
      // Validar IDs
      Validator.validateObjectId(commentData.postId, 'Post ID');
      Validator.validateObjectId(commentData.userId, 'User ID');
      
      // Validar conteúdo
      Validator.validateStringLength(commentData.content, 1, 500, 'Conteúdo');

      // Verificar se post e usuário existem
      await Post.findById(commentData.postId);
      await User.findById(commentData.userId);

      // Se for uma resposta a outro comentário, validar
      if (commentData.parentCommentId) {
        Validator.validateObjectId(commentData.parentCommentId, 'Parent Comment ID');
        await this.findById(commentData.parentCommentId);
      }

      // Preparar dados do comentário
      const comment = {
        postId: commentData.postId, // Manter como string para consistência
        userId: new ObjectId(commentData.userId),
        content: commentData.content,
        parentCommentId: commentData.parentCommentId 
          ? new ObjectId(commentData.parentCommentId) 
          : null,
        likes: [],
        createdAt: new Date()
      };

      // Inserir no banco
      const collection = this.getCollection();
      const result = await collection.insertOne(comment);
      
      Logger.logInfo(`Comentário criado: ${result.insertedId}`, 'MODEL');
      
      return {
        _id: result.insertedId,
        ...comment
      };
    } catch (error) {
      Logger.logError(error, 'MODEL');
      throw error;
    }
  }

  /**
   * Busca comentário por ID
   */
  async findById(commentId) {
    try {
      Validator.validateObjectId(commentId, 'Comment ID');

      const collection = this.getCollection();
      const comment = await collection.findOne({ _id: new ObjectId(commentId) });

      if (!comment) {
        throw new NotFoundError(`Comentário com ID '${commentId}' não encontrado`);
      }

      return comment;
    } catch (error) {
      Logger.logError(error, 'MODEL');
      throw error;
    }
  }

  /**
   * Busca comentários de uma postagem
   */
  async findByPost(postId, options = {}) {
    try {
      Validator.validateObjectId(postId, 'Post ID');

      // Verificar se post existe
      await Post.findById(postId);

      const limit = options.limit || 50;
      const skip = options.skip || 0;

      const collection = this.getCollection();
      const usersCollection = Database.getCollection('users');
      
      const comments = await collection
        .find({ 
          postId: postId, // Comparar como string
          parentCommentId: null // Apenas comentários principais (não respostas)
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray();

      // Popular dados do usuário para cada comentário
      for (const comment of comments) {
        const user = await usersCollection.findOne(
          { _id: comment.userId },
          { projection: { username: 1, profileImage: 1 } }
        );
        if (user) {
          comment.username = user.username;
          comment.profileImage = user.profileImage;
        }
      }

      return comments;
    } catch (error) {
      Logger.logError(error, 'MODEL');
      throw error;
    }
  }

  /**
   * Busca respostas de um comentário
   */
  async findReplies(commentId, options = {}) {
    try {
      Validator.validateObjectId(commentId, 'Comment ID');

      // Verificar se comentário existe
      await this.findById(commentId);

      const limit = options.limit || 20;
      const skip = options.skip || 0;

      const collection = this.getCollection();
      const replies = await collection
        .find({ parentCommentId: new ObjectId(commentId) })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray();

      return replies;
    } catch (error) {
      Logger.logError(error, 'MODEL');
      throw error;
    }
  }

  /**
   * Atualiza comentário
   */
  async update(commentId, commentData) {
    try {
      Validator.validateObjectId(commentId, 'Comment ID');

      // Verificar se comentário existe
      await this.findById(commentId);

      // Validar conteúdo se fornecido
      if (commentData.content) {
        Validator.validateStringLength(commentData.content, 1, 500, 'Conteúdo');
      }

      // Apenas o conteúdo pode ser atualizado
      if (!commentData.content) {
        throw new ValidationError('Conteúdo não fornecido para atualização');
      }

      const collection = this.getCollection();
      const result = await collection.findOneAndUpdate(
        { _id: new ObjectId(commentId) },
        { $set: { content: commentData.content } },
        { returnDocument: 'after' }
      );

      Logger.logInfo(`Comentário atualizado: ${commentId}`, 'MODEL');
      
      return result;
    } catch (error) {
      Logger.logError(error, 'MODEL');
      throw error;
    }
  }

  /**
   * Deleta comentário
   */
  async delete(commentId) {
    try {
      Validator.validateObjectId(commentId, 'Comment ID');

      // Verificar se comentário existe
      await this.findById(commentId);

      const collection = this.getCollection();
      
      // Deletar também todas as respostas a este comentário
      await collection.deleteMany({ parentCommentId: new ObjectId(commentId) });
      
      // Deletar o comentário
      const result = await collection.deleteOne({ _id: new ObjectId(commentId) });

      if (result.deletedCount === 0) {
        throw new DatabaseError('Erro ao deletar comentário');
      }

      Logger.logInfo(`Comentário deletado: ${commentId}`, 'MODEL');
      
      return { success: true, deletedCount: result.deletedCount };
    } catch (error) {
      Logger.logError(error, 'MODEL');
      throw error;
    }
  }

  /**
   * Curtir comentário
   */
  async like(commentId, userId) {
    try {
      Validator.validateObjectId(commentId, 'Comment ID');
      Validator.validateObjectId(userId, 'User ID');

      // Verificar se comentário e usuário existem
      await this.findById(commentId);
      await User.findById(userId);

      const collection = this.getCollection();

      // Verificar se já curtiu
      const comment = await collection.findOne({
        _id: new ObjectId(commentId),
        likes: new ObjectId(userId)
      });

      if (comment) {
        throw new ValidationError('Comentário já foi curtido por este usuário');
      }

      // Adicionar like
      const result = await collection.findOneAndUpdate(
        { _id: new ObjectId(commentId) },
        { $addToSet: { likes: new ObjectId(userId) } },
        { returnDocument: 'after' }
      );

      Logger.logInfo(`Comentário ${commentId} curtido por ${userId}`, 'MODEL');
      
      return result;
    } catch (error) {
      Logger.logError(error, 'MODEL');
      throw error;
    }
  }

  /**
   * Descurtir comentário
   */
  async unlike(commentId, userId) {
    try {
      Validator.validateObjectId(commentId, 'Comment ID');
      Validator.validateObjectId(userId, 'User ID');

      // Verificar se comentário existe
      await this.findById(commentId);

      const collection = this.getCollection();

      // Remover like
      const result = await collection.findOneAndUpdate(
        { _id: new ObjectId(commentId) },
        { $pull: { likes: new ObjectId(userId) } },
        { returnDocument: 'after' }
      );

      Logger.logInfo(`Comentário ${commentId} descurtido por ${userId}`, 'MODEL');
      
      return result;
    } catch (error) {
      Logger.logError(error, 'MODEL');
      throw error;
    }
  }
}

// Exporta uma instância única (singleton)
export default new Comment();
