import { ObjectId } from 'mongodb';
import Database from '../config/database.js';
import Validator from '../utils/validator.js';
import Logger from '../utils/logger.js';
import User from './User.js';

import { 
  ValidationError, 
  DatabaseError, 
  NotFoundError, 
} from '../utils/errors.js';

class Post {
  constructor() {
    this.collectionName = 'posts';
    this.maxContentLength = 280;
  }

  /**
   * Obtém a coleção de posts
   */
  getCollection() {
    return Database.getCollection(this.collectionName);
  }

  /**
   * Extrai hashtags do conteúdo
   */
  extractHashtags(content) {
    const hashtagRegex = /#(\w+)/g;
    const hashtags = [];
    let match;

    while ((match = hashtagRegex.exec(content)) !== null) {
      hashtags.push(match[1].toLowerCase());
    }

    return [...new Set(hashtags)]; // Remove duplicatas
  }

  /**
   * Cria uma nova postagem
   */
  async create(postData) {
    try {
      // Validar campos obrigatórios
      Validator.validateRequired(['userId', 'content'], postData);
      
      // Validar userId
      Validator.validateObjectId(postData.userId, 'User ID');
      
      // Validar tamanho do conteúdo
      Validator.validateStringLength(
        postData.content,
        1,
        this.maxContentLength,
        'Conteúdo'
      );

      // Verificar se o usuário existe
      await User.findById(postData.userId);

      // Extrair hashtags
      const hashtags = this.extractHashtags(postData.content);

      // Preparar dados da postagem
      const post = {
        userId: new ObjectId(postData.userId),
        content: postData.content,
        hashtags: hashtags,
        media: postData.media || [],
        likes: [],
        retweets: [],
        createdAt: new Date()
      };

      // Validar media se fornecido
      if (post.media.length > 0) {
        Validator.validateArray(post.media, 'Media');
      }

      // Inserir no banco
      const collection = this.getCollection();
      const result = await collection.insertOne(post);
      
      Logger.logInfo(`Post criado: ${result.insertedId}`, 'MODEL');
      
      return {
        _id: result.insertedId,
        ...post
      };
    } catch (error) {
      Logger.logError(error, 'MODEL');
      throw error;
    }
  }

  /**
   * Busca post por ID
   */
  async findById(postId) {
    try {
      Validator.validateObjectId(postId, 'Post ID');

      const collection = this.getCollection();
      const post = await collection.findOne({ _id: new ObjectId(postId) });

      if (!post) {
        throw new NotFoundError(`Post com ID '${postId}' não encontrado`);
      }

      return post;
    } catch (error) {
      Logger.logError(error, 'MODEL');
      throw error;
    }
  }

  /**
   * Busca posts de um usuário
   */
  async findByUser(userId, options = {}) {
    try {
      Validator.validateObjectId(userId, 'User ID');

      // Verificar se usuário existe
      await User.findById(userId);

      const limit = options.limit || 20;
      const skip = options.skip || 0;

      const collection = this.getCollection();
      const commentsCollection = Database.getCollection('comments');
      
      const posts = await collection
        .find({ userId: new ObjectId(userId) })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray();

      // Adicionar contador de comentários
      for (const post of posts) {
        post.commentsCount = await commentsCollection.countDocuments({ 
          postId: post._id.toString() 
        });
      }

      return posts;
    } catch (error) {
      Logger.logError(error, 'MODEL');
      throw error;
    }
  }

  /**
   * Busca posts por hashtag
   */
  async findByHashtag(hashtag, options = {}) {
    try {
      if (!hashtag) {
        throw new ValidationError('Hashtag não fornecida');
      }

      // Remove # se presente
      const cleanHashtag = hashtag.replace('#', '').toLowerCase();

      const limit = options.limit || 20;
      const skip = options.skip || 0;

      const collection = this.getCollection();
      const posts = await collection
        .find({ hashtags: cleanHashtag })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray();

      return posts;
    } catch (error) {
      Logger.logError(error, 'MODEL');
      throw error;
    }
  }

  /**
   * Busca timeline do usuário (todos os posts)
   */
  async findTimeline(userId, options = {}) {
    try {
      Validator.validateObjectId(userId, 'User ID');

      const limit = options.limit || 20;
      const skip = options.skip || 0;

      const collection = this.getCollection();
      const commentsCollection = Database.getCollection('comments');
      
      const posts = await collection
        .find({})
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray();

      // Adicionar contador de comentários
      for (const post of posts) {
        post.commentsCount = await commentsCollection.countDocuments({ 
          postId: post._id.toString() 
        });
      }

      return posts;
    } catch (error) {
      Logger.logError(error, 'MODEL');
      throw error;
    }
  }

  /**
   * Atualiza post
   */
  async update(postId, postData) {
    try {
      Validator.validateObjectId(postId, 'Post ID');

      // Verificar se post existe
      await this.findById(postId);

      // Validar conteúdo se fornecido
      if (postData.content) {
        Validator.validateStringLength(
          postData.content,
          1,
          this.maxContentLength,
          'Conteúdo'
        );
      }

      // Campos permitidos para atualização
      const allowedFields = ['content', 'media'];
      const updateData = {};

      for (const field of allowedFields) {
        if (postData[field] !== undefined) {
          updateData[field] = postData[field];
        }
      }

      // Se o conteúdo foi atualizado, recalcular hashtags
      if (updateData.content) {
        updateData.hashtags = this.extractHashtags(updateData.content);
      }

      if (Object.keys(updateData).length === 0) {
        throw new ValidationError('Nenhum campo válido fornecido para atualização');
      }

      const collection = this.getCollection();
      const result = await collection.findOneAndUpdate(
        { _id: new ObjectId(postId) },
        { $set: updateData },
        { returnDocument: 'after' }
      );

      Logger.logInfo(`Post atualizado: ${postId}`, 'MODEL');
      
      return result;
    } catch (error) {
      Logger.logError(error, 'MODEL');
      throw error;
    }
  }

  /**
   * Deleta post
   */
  async delete(postId) {
    try {
      Validator.validateObjectId(postId, 'Post ID');

      // Verificar se post existe
      await this.findById(postId);

      const collection = this.getCollection();
      const result = await collection.deleteOne({ _id: new ObjectId(postId) });

      if (result.deletedCount === 0) {
        throw new DatabaseError('Erro ao deletar post');
      }

      Logger.logInfo(`Post deletado: ${postId}`, 'MODEL');
      
      return { success: true, deletedCount: result.deletedCount };
    } catch (error) {
      Logger.logError(error, 'MODEL');
      throw error;
    }
  }

  /**
   * Curtir post
   */
  async like(postId, userId) {
    try {
      Validator.validateObjectId(postId, 'Post ID');
      Validator.validateObjectId(userId, 'User ID');

      // Verificar se post e usuário existem
      await this.findById(postId);
      await User.findById(userId);

      const collection = this.getCollection();

      // Verificar se já curtiu
      const post = await collection.findOne({
        _id: new ObjectId(postId),
        likes: new ObjectId(userId)
      });

      if (post) {
        throw new ValidationError('Post já foi curtido por este usuário');
      }

      // Adicionar like
      const result = await collection.findOneAndUpdate(
        { _id: new ObjectId(postId) },
        { $addToSet: { likes: new ObjectId(userId) } },
        { returnDocument: 'after' }
      );

      Logger.logInfo(`Post ${postId} curtido por ${userId}`, 'MODEL');
      
      return result;
    } catch (error) {
      Logger.logError(error, 'MODEL');
      throw error;
    }
  }

  /**
   * Descurtir post
   */
  async unlike(postId, userId) {
    try {
      Validator.validateObjectId(postId, 'Post ID');
      Validator.validateObjectId(userId, 'User ID');

      // Verificar se post existe
      await this.findById(postId);

      const collection = this.getCollection();

      // Remover like
      const result = await collection.findOneAndUpdate(
        { _id: new ObjectId(postId) },
        { $pull: { likes: new ObjectId(userId) } },
        { returnDocument: 'after' }
      );

      Logger.logInfo(`Post ${postId} descurtido por ${userId}`, 'MODEL');
      
      return result;
    } catch (error) {
      Logger.logError(error, 'MODEL');
      throw error;
    }
  }

  /**
   * Retweet
   */
  async retweet(postId, userId) {
    try {
      Validator.validateObjectId(postId, 'Post ID');
      Validator.validateObjectId(userId, 'User ID');

      // Verificar se post e usuário existem
      await this.findById(postId);
      await User.findById(userId);

      const collection = this.getCollection();

      // Verificar se já fez retweet
      const post = await collection.findOne({
        _id: new ObjectId(postId),
        retweets: new ObjectId(userId)
      });

      if (post) {
        throw new ValidationError('Retweet já foi feito por este usuário');
      }

      // Adicionar retweet
      const result = await collection.findOneAndUpdate(
        { _id: new ObjectId(postId) },
        { $addToSet: { retweets: new ObjectId(userId) } },
        { returnDocument: 'after' }
      );

      Logger.logInfo(`Post ${postId} retweetado por ${userId}`, 'MODEL');
      
      return result;
    } catch (error) {
      Logger.logError(error, 'MODEL');
      throw error;
    }
  }
}

// Exporta uma instância única (singleton)
export default new Post();
