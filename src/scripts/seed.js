import Database from '../config/database.js';
import User from '../models/User.js';
import Post from '../models/Post.js';
import Comment from '../models/Comment.js';
import Logger from '../utils/logger.js';

/**
 * Script para popular o banco de dados com dados de exemplo
 */
class DatabaseSeeder {
  constructor() {
    this.users = [];
    this.posts = [];
  }

  /**
   * Executa o seeding do banco
   */
  async seed() {
    try {
      Logger.logInfo('Iniciando seeding do banco de dados...', 'SEEDER');

      // Limpar dados existentes
      await this.clearDatabase();

      // Criar usuários
      await this.createUsers();

      // Criar posts
      await this.createPosts();

      // Criar comentários
      await this.createComments();

      // Adicionar curtidas
      await this.addLikes();

      Logger.logInfo('Seeding concluído com sucesso!', 'SEEDER');

    } catch (error) {
      Logger.logError(error, 'SEEDER');
      throw error;
    }
  }

  /**
   * Limpa dados existentes
   */
  async clearDatabase() {
    Logger.logInfo('Limpando dados existentes...', 'SEEDER');

    const db = Database.getDatabase();

    // Limpar em ordem reversa (devido às dependências)
    await db.collection('comments').deleteMany({});
    await db.collection('posts').deleteMany({});
    await db.collection('users').deleteMany({});
    await db.collection('sessions').deleteMany({});

    Logger.logInfo('Dados limpos!', 'SEEDER');
  }

  /**
   * Cria usuários de exemplo
   */
  async createUsers() {
    Logger.logInfo('Criando usuários...', 'SEEDER');

    const usersData = [
      {
        username: 'alice_dev',
        email: 'alice@example.com',
        password: 'senha123',
        bio: 'Desenvolvedora apaixonada por Node.js e React',
        profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alice'
      },
      {
        username: 'bob_coder',
        email: 'bob@example.com',
        password: 'senha123',
        bio: 'Full-stack developer | Coffee enthusiast ☕',
        profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=bob'
      },
      {
        username: 'carla_design',
        email: 'carla@example.com',
        password: 'senha123',
        bio: 'UX/UI Designer | Amante de pixel perfeito',
        profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=carla'
      },
      {
        username: 'david_startup',
        email: 'david@example.com',
        password: 'senha123',
        bio: 'Empreendedor | Tech lover | Sempre aprendendo',
        profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=david'
      },
      {
        username: 'eva_tech',
        email: 'eva@example.com',
        password: 'senha123',
        bio: 'DevOps Engineer | Cloud enthusiast | Kubernetes fan',
        profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=eva'
      }
    ];

    for (const userData of usersData) {
      const user = await User.create(userData);
      this.users.push(user);
      Logger.logInfo(`Usuário criado: ${user.username}`, 'SEEDER');
    }
  }

  /**
   * Cria posts de exemplo
   */
  async createPosts() {
    Logger.logInfo('Criando posts...', 'SEEDER');

    const postsData = [
      {
        userId: this.users[0]._id.toString(),
        content: 'Acabei de lançar minha primeira API REST com Node.js! 🚀 Estou muito empolgada com o resultado. O projeto usa Express, MongoDB e JWT para autenticação. #nodejs #api #backend'
      },
      {
        userId: this.users[1]._id.toString(),
        content: 'Dica do dia: Sempre valide suas entradas no backend! Nunca confie apenas na validação do frontend. Segurança first! 🔒 #seguranca #backend #javascript'
      },
      {
        userId: this.users[2]._id.toString(),
        content: 'Trabalhando em um novo design de dashboard. Adorei como ficou o layout responsivo! 📱💻 O que vocês acham de usar mais cores vibrantes em interfaces? #ux #ui #design'
      },
      {
        userId: this.users[3]._id.toString(),
        content: 'Ideia para startup: Uma plataforma que conecta freelancers com empresas de tecnologia. Já existe algo similar? Quais features vocês considerariam essenciais? 💡 #startup #freelance #tech'
      },
      {
        userId: this.users[4]._id.toString(),
        content: 'Deploy automatizado com GitHub Actions + Docker é simplesmente incrível! ⛵ Minha pipeline CI/CD está rodando perfeitamente. Recomendo para todos! #devops #docker #github'
      },
      {
        userId: this.users[0]._id.toString(),
        content: 'Alguém mais tem dificuldade para escolher entre SQL e NoSQL? Estou indecisa para meu próximo projeto... 🤔 #database #sql #nosql'
      },
      {
        userId: this.users[1]._id.toString(),
        content: 'Refatorando código legado é sempre um desafio, mas o resultado vale a pena! Código limpo e bem estruturado faz toda diferença. 🧹 #refactoring #cleancode #programming'
      },
      {
        userId: this.users[2]._id.toString(),
        content: 'Novo projeto: App de receitas culinárias com interface moderna e intuitiva. O que vocês gostariam de ver em um app de receitas? 🍳📱 #mobile #app #food'
      },
      {
        userId: this.users[3]._id.toString(),
        content: 'Li um artigo interessante sobre microserviços vs monólitos. Qual abordagem vocês preferem e por quê? Arquitetura de software é fascinante! 🏗️ #microservices #architecture #software'
      },
      {
        userId: this.users[4]._id.toString(),
        content: 'Kubernetes é poderoso, mas a curva de aprendizado é íngreme. Dicas para quem está começando? 📚 #kubernetes #cloud #devops'
      }
    ];

    for (const postData of postsData) {
      const post = await Post.create(postData);
      this.posts.push(post);
      Logger.logInfo(`Post criado: ${post.content.substring(0, 50)}...`, 'SEEDER');
    }
  }

  /**
   * Cria comentários de exemplo
   */
  async createComments() {
    Logger.logInfo('Criando comentários...', 'SEEDER');

    const commentsData = [
      {
        postId: this.posts[0]._id.toString(),
        userId: this.users[1]._id.toString(),
        content: 'Parabéns! Que tecnologia você usou para autenticação?'
      },
      {
        postId: this.posts[0]._id.toString(),
        userId: this.users[0]._id.toString(),
        content: 'Obrigada! Usei JWT com bcrypt para hash das senhas. E você?'
      },
      {
        postId: this.posts[1]._id.toString(),
        userId: this.users[2]._id.toString(),
        content: 'Concordo totalmente! Validação no backend é crucial. Já vi muitos ataques por falta disso.'
      },
      {
        postId: this.posts[2]._id.toString(),
        userId: this.users[3]._id.toString(),
        content: 'Adorei a ideia! Cores vibrantes podem tornar a interface mais engajante, mas é preciso cuidado para não cansar o usuário.'
      },
      {
        postId: this.posts[3]._id.toString(),
        userId: this.users[4]._id.toString(),
        content: 'Já existe algo similar, mas sempre há espaço para inovação! Features essenciais: sistema de avaliação, chat integrado, contratos digitais.'
      },
      {
        postId: this.posts[4]._id.toString(),
        userId: this.users[0]._id.toString(),
        content: 'Docker + GitHub Actions é imbatível! Como você configura os secrets?'
      },
      {
        postId: this.posts[5]._id.toString(),
        userId: this.users[3]._id.toString(),
        content: 'Depende do caso de uso! SQL para dados relacionais, NoSQL para dados flexíveis. Qual tipo de aplicação você vai desenvolver?'
      },
      {
        postId: this.posts[6]._id.toString(),
        userId: this.users[4]._id.toString(),
        content: 'Refatorar código legado é uma arte! Que técnicas você usa para manter a qualidade durante o processo?'
      },
      {
        postId: this.posts[7]._id.toString(),
        userId: this.users[1]._id.toString(),
        content: 'Adorei! Features essenciais: filtros por ingredientes, modo offline, compartilhamento de receitas, lista de compras automática.'
      },
      {
        postId: this.posts[8]._id.toString(),
        userId: this.users[2]._id.toString(),
        content: 'Prefiro microserviços para escalabilidade, mas monólitos são mais simples para começar. Tudo depende da complexidade do projeto!'
      },
      {
        postId: this.posts[9]._id.toString(),
        userId: this.users[0]._id.toString(),
        content: 'Comece com minikube localmente! Depois estude os conceitos básicos: pods, services, deployments. A documentação oficial é excelente.'
      }
    ];

    for (const commentData of commentsData) {
      const comment = await Comment.create(commentData);
      Logger.logInfo(`Comentário criado no post ${commentData.postId}`, 'SEEDER');
    }
  }

  /**
   * Adiciona curtidas de exemplo
   */
  async addLikes() {
    Logger.logInfo('Adicionando curtidas...', 'SEEDER');

    // Curtir alguns posts
    const postLikes = [
      { postId: this.posts[0]._id.toString(), userId: this.users[1]._id.toString() },
      { postId: this.posts[0]._id.toString(), userId: this.users[2]._id.toString() },
      { postId: this.posts[1]._id.toString(), userId: this.users[0]._id.toString() },
      { postId: this.posts[2]._id.toString(), userId: this.users[1]._id.toString() },
      { postId: this.posts[3]._id.toString(), userId: this.users[2]._id.toString() },
      { postId: this.posts[4]._id.toString(), userId: this.users[3]._id.toString() },
    ];

    for (const like of postLikes) {
      await Post.like(like.postId, like.userId);
      Logger.logInfo(`Curtida adicionada ao post ${like.postId}`, 'SEEDER');
    }

    // Curtir alguns comentários
    const commentLikes = [
      { commentId: 'comment_id_1', userId: this.users[0]._id.toString() }, // Substituir pelos IDs reais se necessário
    ];

    // Nota: Para simplificar, não estamos curtindo comentários específicos aqui
    // pois seria necessário buscar os IDs dos comentários criados
  }
}

// Executar seeding se o script for chamado diretamente
const seeder = new DatabaseSeeder();

Database.connect()
  .then(() => seeder.seed())
  .then(() => {
    Logger.logInfo('Seeding finalizado!', 'SEEDER');
    process.exit(0);
  })
  .catch((error) => {
    Logger.logError(error, 'SEEDER');
    process.exit(1);
  });

export default DatabaseSeeder;