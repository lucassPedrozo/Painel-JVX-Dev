# 🚀 JVX Desenvolvimento - Sistema de Gerenciamento de Projetos

Sistema completo para gerenciamento de projetos de desenvolvimento web, com controle de pagamentos, relatórios e análises de produtividade.

![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D16.0.0-green.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

## 📋 Índice

- [Características](#-características)
- [Tecnologias](#-tecnologias)
- [Pré-requisitos](#-pré-requisitos)
- [Instalação](#-instalação)
- [Configuração](#-configuração)
- [Uso](#-uso)
- [Importação de Dados](#-importação-de-dados)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Scripts Disponíveis](#-scripts-disponíveis)
- [Licença](#-licença)

## ✨ Características

### 🎯 Funcionalidades Principais

- **Dashboard Interativo**: Visão geral com estatísticas e gráficos em tempo real
- **Gerenciamento de Projetos**: CRUD completo de projetos de desenvolvimento
- **Controle de Pagamentos**: Acompanhamento de pagamentos e valores pendentes
- **Análises e Relatórios**: Gráficos de produtividade e relatórios em PDF
- **Calendário**: Visualização de entregas e prazos
- **Gestão de Equipe**: Cadastro de desenvolvedores com dados de pagamento
- **Importação/Exportação**: Suporte a CSV para backup e migração de dados
- **Multi-usuário**: Sistema de autenticação com níveis de acesso (Master/Standard)

### 🔒 Segurança

- Autenticação JWT
- Senhas criptografadas com bcrypt
- Controle de acesso por função
- Proteção contra SQL Injection
- CORS configurável

### 📊 Relatórios e Análises

- Gráficos de produtividade por desenvolvedor
- Análise de pagamentos e receitas
- Relatórios exportáveis em PDF
- Estatísticas por período
- Comparativos mensais e anuais

## 🛠 Tecnologias

### Frontend
- **React 18** - Biblioteca UI
- **TypeScript** - Tipagem estática
- **Vite** - Build tool
- **TailwindCSS** - Estilização
- **Shadcn/ui** - Componentes UI
- **Recharts** - Gráficos
- **React Router** - Roteamento
- **Tanstack Query** - Gerenciamento de estado

### Backend
- **Node.js** - Runtime
- **Express** - Framework web
- **MySQL** - Banco de dados
- **JWT** - Autenticação
- **bcrypt** - Criptografia

## 📦 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Node.js** >= 16.0.0 ([Download](https://nodejs.org/))
- **MySQL** >= 8.0 ([Download](https://dev.mysql.com/downloads/))
- **npm** ou **pnpm** (gerenciador de pacotes)

## 🚀 Instalação

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/jvx-desenvolvimento.git
cd jvx-desenvolvimento
```

### 2. Instale as dependências

```bash
npm install
# ou
pnpm install
```

### 3. Configure o banco de dados

```bash
# Acesse o MySQL
mysql -u root -p

# Execute o script de inicialização
source database/database-init-clean.sql
```

### 4. Configure as variáveis de ambiente

Copie o arquivo `.env.example` para `.env` e configure:

```bash
cp .env.example .env
```

Edite o arquivo `.env`:

```env
# Banco de Dados
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=sua_senha
DB_NAME=worksdb

# Servidor
PORT=3001

# JWT
JWT_SECRET=sua_chave_secreta_aqui

# CORS
CORS_ORIGIN=http://localhost:5173

# Frontend (para build)
VITE_API_URL=http://localhost:3001
```

## ⚙️ Configuração

### Banco de Dados

O script `database-init-clean.sql` cria:

- Banco de dados `worksdb`
- Tabela `users` (usuários do sistema)
- Tabela `developers` (desenvolvedores)
- Tabela `works` (projetos)
- Usuário master padrão:
  - **Usuário**: `jvxadmin`
  - **Senha**: `admin123`

### Estrutura de Dados

#### Tabela `works`
```sql
- id (INT, AUTO_INCREMENT)
- developer (VARCHAR) - Nome do desenvolvedor
- deadline_type (VARCHAR) - Tipo de prazo
- value (DECIMAL) - Valor do projeto
- domain (VARCHAR) - URL do projeto
- site_type (VARCHAR) - Tipo de site
- delivery_date (DATE) - Data de entrega
- delivery_month (VARCHAR) - Mês da entrega
- delivery_year (INT) - Ano da entrega
- status (VARCHAR) - Status de entrega
- payment_status (VARCHAR) - Status de pagamento
- observations (TEXT) - Observações
```

## 🎮 Uso

### Desenvolvimento

Inicie o backend e frontend em terminais separados:

```bash
# Terminal 1 - Backend
npm run server
# ou
node server.js

# Terminal 2 - Frontend
npm run dev
```

Acesse: http://localhost:5173

### Login Padrão

- **Usuário**: `jvxadmin`
- **Senha**: `admin123`

⚠️ **Importante**: Altere a senha padrão após o primeiro acesso!

### Build para Produção

```bash
npm run build
```

Os arquivos otimizados estarão em `dist/`

## 📥 Importação de Dados

### Método 1: Via Interface Web

1. Acesse **Configurações**
2. Clique em **Importar CSV**
3. Selecione o arquivo CSV
4. Aguarde a importação

### Método 2: Script Direto (Recomendado para grandes volumes)

```bash
npm run import
```

**Vantagens:**
- Mais rápido para grandes volumes (100+ registros)
- Mostra progresso em tempo real
- Melhor tratamento de erros

### Formato do CSV

```csv
Desenvolvedor,Prazo,Valor R$,Domínio Desenvolvimento,Tipo de Site,Data Entrega,Mês,Ano,Status,Pagamento,OBS ou Template
Alexandre,Normal,"R$ 200,00",exemplo.com.br,Site Institucional,01/04/2024,Abril,2024,Entregue,Pago,
```

**Campos:**
1. Desenvolvedor (obrigatório)
2. Prazo: "Normal" ou "Prazo Reduzido"
3. Valor R$: "R$ 200,00"
4. Domínio (obrigatório)
5. Tipo de Site: "Site Institucional", "Site Corporativo" ou "Landing Page"
6. Data Entrega: DD/MM/YYYY
7. Mês: Nome do mês
8. Ano: YYYY
9. Status: "Entregue" ou "Não Entregue"
10. Pagamento: "Pago" ou "Não Pago"
11. Observações: Texto livre ou URL de template

### Validação de Dados

Após importar, verifique os dados:

```bash
npm run verify
```

## 🌐 Deploy

### Build de Produção

```bash
npm run build
```

Os arquivos otimizados estarão em `dist/`

### Variáveis de Ambiente para Produção

Configure as seguintes variáveis no seu ambiente de produção:

```env
DB_HOST=seu_host_mysql
DB_USER=seu_usuario
DB_PASSWORD=sua_senha
DB_NAME=worksdb
PORT=3001
JWT_SECRET=sua_chave_secreta_forte
CORS_ORIGIN=https://seu-dominio.com
VITE_API_URL=https://api.seu-dominio.com
```

## 📁 Estrutura do Projeto

```
jvx-desenvolvimento/
├── database/                    # Scripts de banco de dados
│   └── database-init-clean.sql # Script de inicialização
├── docs/                        # Documentação
│   ├── ESTRUTURA-PROJETO.md    # Estrutura detalhada
│   ├── INICIO-RAPIDO.md        # Guia de início rápido
│   ├── LIMPEZA-REALIZADA.md    # Log de limpeza
│   └── RESUMO-LIMPEZA.txt      # Resumo executivo
├── public/                      # Arquivos públicos
│   └── Relatório de Desenvolvimento - Desenvolvimento.csv
├── scripts/                     # Scripts utilitários
│   ├── importar-csv-direto.js  # Importação de CSV
│   ├── popular-banco-completo.js # Popular banco
│   ├── testar-conexao-db.js    # Teste de conexão
│   └── verificar-dados.js      # Verificação de dados
├── src/                         # Código fonte frontend
│   ├── assets/                 # Imagens e recursos
│   ├── components/             # Componentes React
│   │   ├── ui/                 # Componentes base (shadcn)
│   │   ├── dashboard/          # Componentes do dashboard
│   │   ├── skeletons/          # Loading skeletons
│   │   └── [...]               # Outros componentes
│   ├── contexts/               # Contextos React
│   ├── hooks/                  # Custom hooks
│   ├── lib/                    # Utilitários
│   ├── pages/                  # Páginas da aplicação
│   ├── App.tsx                 # Componente principal
│   ├── main.tsx                # Entry point
│   └── index.css               # Estilos globais
├── .env.example                # Exemplo de variáveis de ambiente
├── .gitignore                  # Arquivos ignorados pelo Git
├── components.json             # Configuração Shadcn/ui
├── eslint.config.js            # Configuração ESLint
├── index.html                  # HTML principal
├── iniciar-projeto.bat         # Script de inicialização (Windows)
├── LICENSE                     # Licença MIT
├── package.json                # Dependências e scripts
├── README.md                   # Este arquivo
├── server.js                   # Servidor Express (Backend)
├── tsconfig.json               # Configuração TypeScript
└── vite.config.ts              # Configuração Vite
```

## 📜 Scripts Disponíveis

### Desenvolvimento

```bash
npm run dev          # Inicia frontend (Vite)
npm run server       # Inicia backend (Express)
npm start            # Inicia backend e frontend simultaneamente
```

### Build

```bash
npm run build        # Build de produção
npm run preview      # Preview do build
npm run lint         # Executa ESLint
```

### Utilitários

```bash
npm run import       # Importa CSV diretamente no banco
npm run verify       # Verifica dados no banco
npm run test-db      # Testa conexão com banco de dados
npm run populate     # Popula banco com dados de exemplo
```

## 👥 Gerenciamento de Usuários

### Tipos de Usuário

1. **Master**: Acesso total ao sistema
   - Gerenciar todos os projetos
   - Criar/editar/deletar usuários
   - Importar/exportar dados
   - Limpar banco de dados

2. **Standard**: Acesso limitado
   - Ver apenas seus próprios projetos
   - Não pode gerenciar usuários
   - Não pode importar/exportar

### Criar Novo Usuário

1. Faça login como Master
2. Acesse **Gerenciar Usuários**
3. Clique em **Adicionar Usuário**
4. Preencha os dados:
   - Nome de usuário
   - Senha
   - Tipo (Master/Standard)
   - Desenvolvedor associado (se Standard)

## 🔒 Segurança

### Boas Práticas

1. **Altere a senha padrão** após primeiro acesso
2. **Use senhas fortes** (mínimo 8 caracteres)
3. **Configure JWT_SECRET** com valor único
4. **Mantenha .env fora do controle de versão**
5. **Use HTTPS em produção**
6. **Faça backups regulares** do banco de dados

### Backup do Banco

```bash
# Exportar banco
mysqldump -u root -p worksdb > backup.sql

# Importar banco
mysql -u root -p worksdb < backup.sql
```

## 🐛 Troubleshooting

### Erro: "Banco de dados não encontrado"

```bash
mysql -u root -p < database-init-clean.sql
```

### Erro: "Token inválido"

- Faça logout e login novamente
- Limpe o cache do navegador
- Verifique se JWT_SECRET está configurado

### Erro: "Conexão recusada"

- Verifique se o MySQL está rodando
- Confirme as credenciais no `.env`
- Teste a conexão: `mysql -u root -p`

### Dados não aparecem

- Verifique se há dados no banco: `node verificar-dados.js`
- Verifique o console do navegador (F12)
- Verifique os logs do servidor

## 📈 Performance

### Otimizações Implementadas

- Lazy loading de páginas
- Paginação de tabelas
- Cache de dados
- Compressão de assets
- Code splitting
- Índices no banco de dados

### Recomendações

- Use paginação para grandes volumes (100+ registros)
- Faça limpeza periódica de cache
- Otimize imagens antes do upload
- Use CDN para assets estáticos em produção



## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 📞 Suporte

Para suporte, entre em contato:

- Email: suporte@jvxdesenvolvimento.com.br
- Issues: [GitHub Issues](https://github.com/seu-usuario/jvx-desenvolvimento/issues)

## 🙏 Agradecimentos

- [React](https://reactjs.org/)
- [Vite](https://vitejs.dev/)
- [TailwindCSS](https://tailwindcss.com/)
- [Shadcn/ui](https://ui.shadcn.com/)
- [Express](https://expressjs.com/)
- [MySQL](https://www.mysql.com/)

---

Desenvolvido com ❤️ por JVX Desenvolvimento
