# Micro Blogging
Desenvolvido em Node.js com MongoDB para a disciplina de Programação Web Back-End. 
#
Aluno: Vitor Barbosa Hilário

## Pré-requisitos

- Node.js (versão 16 ou superior)
- MongoDB

## Instalação

1. Clone o repositório:
```bash
git clone https://github.com/ovitorhilario/micro-blogging.git
cd micro-blogging
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
   - Crie um arquivo `.env` na raiz do projeto
   - Adicione as seguintes variáveis:
```env
MONGODB_URI=mongodb://localhost:27017/microblogging
SESSION_SECRET=sua-chave-secreta-aqui
PORT=3000
```

4. Certifique-se de que o MongoDB está rodando localmente na porta padrão (27017).

## Executando o projeto

### 1. Criar dados fictícios (recomendado antes de iniciar o comando abaixo)
```bash
npm run seed
```

### 2. Inicar api e web 
```bash
npm run start
```

A aplicação estará disponível em `http://localhost:3000`


## Populando o banco de dados

Para desenvolvimento e testes, você pode popular o banco de dados com dados de exemplo:

```bash
npm run seed
```

Este comando irá:
- Criar 5 usuários de exemplo
- Gerar 10 posts sobre tecnologia
- Adicionar comentários nos posts
- Simular curtidas

**Atenção**: Este comando limpa todos os dados existentes antes de criar os novos.

Para mais detalhes sobre o script de seeding, consulte `SEED_README.md`.


## Arquitetura MVC

Este projeto segue o padrão arquitetural **MVC (Model-View-Controller)**:

### 📁 Estrutura de Pastas

```
src/
├── config/          # Configurações (banco de dados, etc.)
├── controllers/     # **CONTROLLERS** - Lógica de negócio e rotas
├── middlewares/     # Middlewares (autenticação, validação, etc.)
├── models/          # **MODELS** - Representação dos dados e regras de negócio
├── routes/          # Definição das rotas da API
├── utils/           # Utilitários (logger, validator, errors)
└── index.js         # Ponto de entrada da aplicação

public/              # **VIEWS** - Arquivos estáticos (CSS, JS, imagens)
views/               # Templates HTML
```
