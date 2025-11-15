# Micro Blogging
Desenvolvido em Node.js com MongoDB para a disciplina de Programação Web Back-End. <br/>
**Aluno**: Vitor Barbosa Hilário

<img width="1503" height="912" alt="image" src="https://github.com/user-attachments/assets/bf737f0f-1e58-4002-8934-8ab73d9a5424" />


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
# Configurações do Banco de Dados
MONGODB_URI=mongodb://localhost:27017
DB_NAME=blog
SESSION_SECRET=sua-chave-secreta-aqui

# Configurações do Servidor
PORT=3000
```

4. Certifique-se de que o MongoDB está rodando localmente na porta padrão (27017).

## Executando o projeto

## Passo 1: Populando o banco de dados

Rodando esse comando o blog já irá conter alguns posts, usuários e comentários.

```bash
npm run seed
```

### Passo 2: Inicar API e Web 
```bash
npm run start
```

A aplicação estará disponível em `http://localhost:3000`

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
