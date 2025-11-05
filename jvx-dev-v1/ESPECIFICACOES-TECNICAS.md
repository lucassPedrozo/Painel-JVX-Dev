# Especificações Técnicas - JVX Desenvolvimento

## 📋 Visão Geral do Projeto

Sistema de gerenciamento de projetos de desenvolvimento web com controle de entregas, pagamentos e gestão de desenvolvedores. Aplicação full-stack com autenticação JWT e controle de acesso baseado em roles.

---

## 🎯 Arquitetura da Aplicação

**Tipo:** Full-Stack Web Application  
**Padrão:** SPA (Single Page Application) + REST API  
**Versão:** 2.0.0

---

## 🖥️ Backend

### Node.js & Runtime
- **Node.js:** >= 16.0.0 (recomendado 18.x ou superior)
- **NPM:** >= 8.0.0
- **Tipo de Módulo:** ESM (ES Modules)

### Framework & Servidor
- **Express.js:** ^5.1.0
- **Porta Padrão:** 3001 (configurável via `PORT`)

### Banco de Dados
- **Sistema:** MySQL / MariaDB
- **Driver:** mysql2 ^3.14.3
- **Pool de Conexões:**
  - Connection Limit: 10
  - Queue Limit: 0 (ilimitado)
  - Wait for Connections: true

### Autenticação & Segurança
- **JWT (JSON Web Tokens):** jsonwebtoken ^9.0.2
  - Expiração: 24 horas
  - Secret Key: configurável via `JWT_SECRET`
- **Criptografia de Senhas:** bcryptjs ^3.0.2
  - Salt Rounds: 10
  - Suporte a migração de SHA256 para bcrypt
- **CORS:** cors ^2.8.5
  - Origin configurável via `CORS_ORIGIN`
  - Credentials: true

### Funcionalidades do Backend
- Sistema de autenticação com roles (master/standard)
- CRUD completo de projetos (works)
- Gerenciamento de usuários
- Gerenciamento de desenvolvedores
- Importação de dados via CSV (limite 50MB)
- Limpeza de banco de dados com confirmação

### Variáveis de Ambiente (.env)
```
PORT=3001
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=worksdb
JWT_SECRET=REMOVED-SECRET
CORS_ORIGIN=*
```

---

## 🎨 Frontend

### Framework & Build Tool
- **React:** ^19.1.1
- **React DOM:** ^19.1.1
- **Vite:** ^7.1.2
- **TypeScript:** ~5.8.3

### Roteamento
- **React Router DOM:** ^7.8.2

### Gerenciamento de Estado & Dados
- **TanStack Query (React Query):** ^5.90.5
  - Cache e sincronização de dados do servidor
  - Invalidação automática de queries

### UI Framework & Componentes

#### Biblioteca de Componentes Base
- **Radix UI:** Conjunto completo de componentes acessíveis
  - @radix-ui/react-accordion: ^1.2.12
  - @radix-ui/react-alert-dialog: ^1.1.15
  - @radix-ui/react-dialog: ^1.1.15
  - @radix-ui/react-dropdown-menu: ^2.1.16
  - @radix-ui/react-label: ^2.1.7
  - @radix-ui/react-navigation-menu: ^1.2.14
  - @radix-ui/react-popover: ^1.1.15
  - @radix-ui/react-scroll-area: ^1.2.10
  - @radix-ui/react-select: ^2.2.6
  - @radix-ui/react-separator: ^1.1.7
  - @radix-ui/react-slot: ^1.2.3
  - @radix-ui/react-tabs: ^1.1.13
  - @radix-ui/react-tooltip: ^1.2.8

#### Ícones
- **Lucide React:** ^0.541.0
- **Tabler Icons React:** ^3.34.1

### Estilização

#### CSS Framework
- **TailwindCSS:** ^4.1.12
- **@tailwindcss/vite:** ^4.1.12 (plugin Vite)
- **Utilitários:**
  - tailwind-merge: ^3.3.1 (merge de classes)
  - class-variance-authority: ^0.7.1 (variantes de componentes)
  - clsx: ^2.1.1 (construção condicional de classes)

#### Temas
- **next-themes:** ^0.4.6 (suporte a dark/light mode)

### Formulários & Validação
- **React Hook Form:** via @hookform/resolvers ^5.2.2
- **Zod:** ^4.1.12 (validação de schemas)

### Utilitários & Bibliotecas Auxiliares

#### Datas
- **date-fns:** ^4.1.0 (manipulação de datas)
- **react-day-picker:** ^9.9.0 (seletor de datas)

#### Gráficos & Visualização
- **Recharts:** 2.15.4 (gráficos e dashboards)

#### Notificações
- **Sonner:** ^2.0.7 (toast notifications)

#### Upload de Arquivos
- **Multer:** ^2.0.2 (middleware para upload)

### Configuração de Build

#### Otimizações Vite
- **Target:** esnext
- **Minificação:** esbuild
- **Chunk Size Warning:** 1000kb

#### Code Splitting (Manual Chunks)
- **react-vendor:** React, React DOM, React Router DOM
- **ui-vendor:** Lucide React, Radix UI components
- **chart-vendor:** Recharts
- **utils-vendor:** Sonner, date-fns

#### Otimização de Dependências
- Pre-bundling de: React, React DOM, React Router DOM, Lucide React, Recharts

---

## 🛠️ Ferramentas de Desenvolvimento

### Linting & Code Quality
- **ESLint:** ^9.33.0
- **@eslint/js:** ^9.33.0
- **TypeScript ESLint:** ^8.39.1
- **Plugins:**
  - eslint-plugin-react-hooks: ^5.2.0
  - eslint-plugin-react-refresh: ^0.4.20

### TypeScript
- **Versão:** ~5.8.3
- **Configurações:**
  - tsconfig.json (root)
  - tsconfig.app.json (aplicação)
  - tsconfig.node.json (configuração Node)
- **Path Aliases:** `@/*` → `./src/*`

### Type Definitions
- @types/bcryptjs: ^3.0.0
- @types/jsonwebtoken: ^9.0.10
- @types/node: ^24.3.0
- @types/react: ^19.1.10
- @types/react-dom: ^19.1.7

### Utilitários de Build
- **globals:** ^16.3.0
- **tw-animate-css:** ^1.3.7 (animações TailwindCSS)

---

## 📦 Scripts Disponíveis

### Desenvolvimento
```bash
npm run dev          # Inicia servidor Vite (frontend)
npm run server       # Inicia servidor Express (backend)
npm start            # Inicia ambos simultaneamente
```

### Build & Preview
```bash
npm run build        # Build de produção (TypeScript + Vite)
npm run preview      # Preview do build de produção
```

### Qualidade de Código
```bash
npm run lint         # Executa ESLint
```

### Utilitários de Dados
```bash
npm run import       # Importa dados de CSV
npm run test-csv     # Testa importação de CSV
npm run verify       # Verifica dados no banco
```

---

## 🗄️ Estrutura do Banco de Dados

### Tabelas Principais

#### `users`
- Gerenciamento de usuários do sistema
- Roles: master (admin) / standard (desenvolvedor)
- Autenticação com bcrypt
- Campos: id, username, password, role, developer_name, active, created_at

#### `works`
- Projetos de desenvolvimento
- Campos: id, developer, deadline_type, value, domain, site_type, delivery_date, delivery_month, delivery_year, status, payment_status, observations

#### `developers`
- Informações de contato e pagamento dos desenvolvedores
- Campos: name, phone, email, whatsapp, pixKey, pixType, bankName, agency, account, observations

---

## 🔐 Sistema de Autenticação

### Fluxo de Autenticação
1. Login com username/password
2. Geração de JWT token (validade 24h)
3. Token enviado no header `Authorization: Bearer <token>`
4. Middleware valida token em rotas protegidas

### Níveis de Acesso
- **Master:** Acesso total (CRUD de projetos, usuários e desenvolvedores)
- **Standard:** Visualização apenas dos próprios projetos

---

## 🚀 Requisitos de Sistema

### Servidor
- **Sistema Operacional:** Linux, Windows, macOS
- **Node.js:** >= 16.0.0
- **Banco de Dados:** MySQL 5.7+ ou MariaDB 10.3+
- **Memória RAM:** Mínimo 512MB (recomendado 2GB+)
- **Espaço em Disco:** Mínimo 500MB

### Cliente (Navegador)
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Suporte a ES2020+

---

## 📝 Licença

**MIT License**

---

## 🔗 Repositório

```
https://github.com/seu-usuario/jvx-desenvolvimento.git
```

---

## 📞 Suporte

Para issues e bugs, acesse:
```
https://github.com/seu-usuario/jvx-desenvolvimento/issues
```

---

**Última Atualização:** Versão 2.0.0  
**Autor:** JVX Desenvolvimento
