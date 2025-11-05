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
- [Deploy](#-deploy)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Scripts Disponíveis](#-scripts-disponíveis)
- [Contribuindo](#-contribuindo)
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

### � Segaurança

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
source database-init-clean.sql
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
node importar-csv-direto.js
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

Antes de importar, valide o CSV:

```bash
node testar-importacao-csv.js
```

Após importar, verifique os dados:

```bash
node verificar-dados.js
```

## 🌐 Deploy

Consulte o arquivo [DEPLOY.md](./DEPLOY.md) para instruções detalhadas de deploy em diferentes ambientes:

- Vercel
- Netlify
- VPS (Ubuntu/Debian)
- Docker
- Heroku

## 📁 Estrutura do Projeto

```
jvx-desenvolvimento/
├── public/                      # Arquivos públicos
│   └── Relatório de Desenvolvimento - Desenvolvimento.csv
├── src/
│   ├── assets/                  # Imagens e recursos
│   ├── components/              # Componentes React
│   │   ├── ui/                  # Componentes base (shadcn)
│   │   ├── dashboard/           # Componentes do dashboard
│   │   ├── Header.tsx
│   │   ├── WorksTable.tsx
│   │   └── ...
│   ├── contexts/                # Contextos React
│   │   ├── AuthContext.tsx
│   │   ├── WorksContext.tsx
│   │   └── NotificationsContext.tsx
│   ├── hooks/                   # Custom hooks
│   ├── lib/                     # Utilitários
│   │   ├── api.ts              # Cliente API
│   │   ├── utils.ts            # Funções auxiliares
│   │   ├── constants.ts        # Constantes
│   │   └── pdf-export.ts       # Exportação PDF
│   ├── pages/                   # Páginas
│   │   ├── Home.tsx
│   │   ├── Sites.tsx
│   │   ├── Analises.tsx
│   │   ├── Calendario.tsx
│   │   ├── Equipe.tsx
│   │   ├── Relatorios.tsx
│   │   ├── Configuracoes.tsx
│   │   └── GerenciarUsuarios.tsx
│   ├── App.tsx                  # Componente principal
│   ├── main.tsx                 # Entry point
│   └── index.css                # Estilos globais
├── database-init-clean.sql      # Script de inicialização do banco
├── server.js                    # Servidor Express
├── importar-csv-direto.js       # Script de importação
├── testar-importacao-csv.js     # Script de validação
├── verificar-dados.js           # Script de verificação
├── .env.example                 # Exemplo de variáveis de ambiente
├── package.json                 # Dependências
├── vite.config.ts              # Configuração Vite
├── tsconfig.json               # Configuração TypeScript
└── README.md                    # Este arquivo
```

## 📜 Scripts Disponíveis

### Desenvolvimento

```bash
npm run dev          # Inicia frontend (Vite)
npm run server       # Inicia backend (Express)
```

### Build

```bash
npm run build        # Build de produção
npm run preview      # Preview do build
```

### Utilitários

```bash
node importar-csv-direto.js      # Importa CSV diretamente no banco
node testar-importacao-csv.js    # Valida arquivo CSV
node verificar-dados.js          # Verifica dados no banco
```

### Linting

```bash
npm run lint         # Executa ESLint
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

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor:

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

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
