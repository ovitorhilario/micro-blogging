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

### Desenvolvimento
```bash
npm run dev
```

### Produção
```bash
npm start
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
