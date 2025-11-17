# 🏗️ Arquitetura do Sistema - JVX Desenvolvimento

Visão geral da arquitetura e fluxo de dados do sistema.

---

## 📐 Arquitetura Geral

```
┌─────────────────────────────────────────────────────────────┐
│                      NAVEGADOR (Cliente)                     │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │           React 19 + TypeScript + Vite                 │ │
│  │                                                        │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐           │ │
│  │  │  Pages   │  │Components│  │ Contexts │           │ │
│  │  │          │  │          │  │          │           │ │
│  │  │ - Home   │  │ - Header │  │ - Auth   │           │ │
│  │  │ - Sites  │  │ - Table  │  │ - Works  │           │ │
│  │  │ - Login  │  │ - Dialog │  │ - Notif  │           │ │
│  │  └──────────┘  └──────────┘  └──────────┘           │ │
│  │                                                        │ │
│  │  ┌──────────────────────────────────────────────┐    │ │
│  │  │         TanStack Query (Cache)               │    │ │
│  │  └──────────────────────────────────────────────┘    │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│                    http://localhost:5173                     │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP/REST
                              │ (JSON)
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    SERVIDOR (Backend)                        │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              Express.js + Node.js                      │ │
│  │                                                        │ │
│  │  ┌──────────────────────────────────────────────┐    │ │
│  │  │            Middleware                        │    │ │
│  │  │  - CORS                                      │    │ │
│  │  │  - JSON Parser                               │    │ │
│  │  │  - JWT Verification                          │    │ │
│  │  └──────────────────────────────────────────────┘    │ │
│  │                                                        │ │
│  │  ┌──────────────────────────────────────────────┐    │ │
│  │  │            Rotas (Endpoints)                 │    │ │
│  │  │                                              │    │ │
│  │  │  POST   /auth/login                          │    │ │
│  │  │  GET    /works                               │    │ │
│  │  │  POST   /works                               │    │ │
│  │  │  PUT    /works/:id                           │    │ │
│  │  │  DELETE /works/:id                           │    │ │
│  │  │  PATCH  /works/:id/mark-completed            │    │ │
│  │  │  GET    /developers                          │    │ │
│  │  │  GET    /statistics                          │    │ │
│  │  └──────────────────────────────────────────────┘    │ │
│  │                                                        │ │
│  │  ┌──────────────────────────────────────────────┐    │ │
│  │  │         Autenticação (JWT + bcrypt)          │    │ │
│  │  └──────────────────────────────────────────────┘    │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│                    http://localhost:3001                     │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ SQL
                              │ (mysql2)
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   BANCO DE DADOS (MySQL)                     │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │                    worksdb                             │ │
│  │                                                        │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐           │ │
│  │  │  users   │  │developers│  │  works   │           │ │
│  │  │          │  │          │  │          │           │ │
│  │  │ id       │  │ id       │  │ id       │           │ │
│  │  │ username │  │ name     │  │ title    │           │ │
│  │  │ password │  │ email    │  │ client   │           │ │
│  │  │ role     │  │ phone    │  │ dev_id ──┼──┐        │ │
│  │  │ name     │  │ pix      │  │ status   │  │        │ │
│  │  │ email    │  │ username │  │ value    │  │        │ │
│  │  └──────────┘  └──────────┘  └──────────┘  │        │ │
│  │                      ▲                       │        │ │
│  │                      └───────────────────────┘        │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│                    localhost:3306 (XAMPP)                    │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 Fluxo de Dados

### 1. Autenticação (Login)

```
┌─────────┐                ┌─────────┐                ┌─────────┐
│ Cliente │                │ Backend │                │  MySQL  │
└────┬────┘                └────┬────┘                └────┬────┘
     │                          │                          │
     │ POST /auth/login         │                          │
     │ {username, password}     │                          │
     ├─────────────────────────>│                          │
     │                          │                          │
     │                          │ SELECT * FROM users      │
     │                          │ WHERE username = ?       │
     │                          ├─────────────────────────>│
     │                          │                          │
     │                          │ <─────────────────────── │
     │                          │ User data                │
     │                          │                          │
     │                          │ bcrypt.compare()         │
     │                          │ (valida senha)           │
     │                          │                          │
     │                          │ jwt.sign()               │
     │                          │ (gera token)             │
     │                          │                          │
     │ <─────────────────────── │                          │
     │ {token, user}            │                          │
     │                          │                          │
     │ Armazena token           │                          │
     │ (localStorage)           │                          │
     │                          │                          │
```

### 2. Buscar Projetos (GET /works)

```
┌─────────┐                ┌─────────┐                ┌─────────┐
│ Cliente │                │ Backend │                │  MySQL  │
└────┬────┘                └────┬────┘                └────┬────┘
     │                          │                          │
     │ GET /works               │                          │
     │ Authorization: Bearer... │                          │
     ├─────────────────────────>│                          │
     │                          │                          │
     │                          │ Verifica JWT             │
     │                          │ (middleware)             │
     │                          │                          │
     │                          │ SELECT w.*, d.name       │
     │                          │ FROM works w             │
     │                          │ JOIN developers d        │
     │                          │ WHERE ...                │
     │                          ├─────────────────────────>│
     │                          │                          │
     │                          │ <─────────────────────── │
     │                          │ Array de projetos        │
     │                          │                          │
     │ <─────────────────────── │                          │
     │ JSON com projetos        │                          │
     │                          │                          │
     │ Atualiza UI              │                          │
     │ (React re-render)        │                          │
     │                          │                          │
```

### 3. Adicionar Projeto (POST /works)

```
┌─────────┐                ┌─────────┐                ┌─────────┐
│ Cliente │                │ Backend │                │  MySQL  │
└────┬────┘                └────┬────┘                └────┬────┘
     │                          │                          │
     │ POST /works              │                          │
     │ {title, client, ...}     │                          │
     ├─────────────────────────>│                          │
     │                          │                          │
     │                          │ Verifica JWT             │
     │                          │ Verifica role = master   │
     │                          │                          │
     │                          │ INSERT INTO works        │
     │                          │ VALUES (...)             │
     │                          ├─────────────────────────>│
     │                          │                          │
     │                          │ <─────────────────────── │
     │                          │ insertId                 │
     │                          │                          │
     │ <─────────────────────── │                          │
     │ {success, id}            │                          │
     │                          │                          │
     │ Atualiza cache           │                          │
     │ (TanStack Query)         │                          │
     │                          │                          │
```

---

## 🔐 Segurança

### Camadas de Proteção

```
┌─────────────────────────────────────────────────────────────┐
│                    1. Frontend (Cliente)                     │
│  - Validação de formulários (Zod)                           │
│  - Verificação de role antes de mostrar botões              │
│  - Sanitização de inputs                                    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    2. Transporte (HTTPS)                     │
│  - Token JWT no header Authorization                        │
│  - CORS configurado                                         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    3. Backend (Servidor)                     │
│  - Verificação de JWT em todas as rotas protegidas         │
│  - Validação de role (master/standard)                     │
│  - Prepared statements (SQL Injection protection)          │
│  - Rate limiting (futuro)                                  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    4. Banco de Dados                         │
│  - Senhas criptografadas (bcrypt)                          │
│  - Constraints e foreign keys                               │
│  - Usuário MySQL com permissões limitadas                  │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 Fluxo de Estado (React)

```
┌─────────────────────────────────────────────────────────────┐
│                      Contextos Globais                       │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ AuthContext  │  │ WorksContext │  │NotifContext  │     │
│  │              │  │              │  │              │     │
│  │ - user       │  │ - works[]    │  │ - toast()    │     │
│  │ - token      │  │ - loading    │  │              │     │
│  │ - login()    │  │ - error      │  │              │     │
│  │ - logout()   │  │ - refresh()  │  │              │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    TanStack Query Cache                      │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Query Keys:                                         │  │
│  │  - ['works']           → Lista de projetos          │  │
│  │  - ['developers']      → Lista de desenvolvedores   │  │
│  │  - ['statistics']      → Estatísticas do dashboard  │  │
│  │                                                      │  │
│  │  Mutations:                                          │  │
│  │  - createWork          → Adicionar projeto          │  │
│  │  - updateWork          → Editar projeto             │  │
│  │  - deleteWork          → Excluir projeto            │  │
│  │  - markCompleted       → Marcar como concluído      │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      Componentes React                       │
│                                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Home    │  │  Sites   │  │ Analises │  │  Login   │   │
│  │          │  │          │  │          │  │          │   │
│  │ Dashboard│  │ Tabela   │  │ Gráficos │  │ Form     │   │
│  │ Gráficos │  │ Filtros  │  │ Relatóri │  │          │   │
│  │ Cards    │  │ Dialogs  │  │          │  │          │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## 🗄️ Modelo de Dados

```
┌─────────────────────────────────────────────────────────────┐
│                         users                                │
├─────────────────────────────────────────────────────────────┤
│ id (PK)                                                      │
│ username (UNIQUE)                                            │
│ password (bcrypt hash)                                       │
│ role (master/standard)                                       │
│ name                                                         │
│ email                                                        │
│ created_at                                                   │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ 1:1
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      developers                              │
├─────────────────────────────────────────────────────────────┤
│ id (PK)                                                      │
│ name                                                         │
│ email                                                        │
│ phone                                                        │
│ pix                                                          │
│ username (FK → users.username)                               │
│ created_at                                                   │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ 1:N
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                         works                                │
├─────────────────────────────────────────────────────────────┤
│ id (PK)                                                      │
│ title                                                        │
│ client                                                       │
│ developer_id (FK → developers.id)                            │
│ status (Pendente/Em Andamento/Concluído/Cancelado)         │
│ work_type (Site/Landing Page/E-commerce/...)               │
│ technologies (JSON array)                                    │
│ value (DECIMAL)                                              │
│ payment_status (Pendente/Pago/Parcial)                      │
│ start_date                                                   │
│ delivery_date                                                │
│ developer_status (Pendente/Em Andamento/Concluído)         │
│ notes                                                        │
│ created_at                                                   │
│ updated_at                                                   │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Fluxo de Deploy (Futuro)

```
┌─────────────────────────────────────────────────────────────┐
│                    1. Desenvolvimento                        │
│  - Código local                                             │
│  - npm run dev                                              │
│  - Testes manuais                                           │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    2. Build                                  │
│  - npm run build                                            │
│  - Gera pasta dist/                                         │
│  - Otimização e minificação                                 │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    3. Servidor de Produção                   │
│  - Upload para VPS/Cloud                                    │
│  - Nginx como proxy reverso                                 │
│  - PM2 para gerenciar Node.js                               │
│  - MySQL em servidor dedicado                               │
│  - SSL/HTTPS (Let's Encrypt)                                │
└─────────────────────────────────────────────────────────────┘
```

---

## 📈 Escalabilidade (Futuro)

```
                    ┌─────────────┐
                    │ Load Balancer│
                    └──────┬──────┘
                           │
          ┌────────────────┼────────────────┐
          │                │                │
    ┌─────▼─────┐    ┌─────▼─────┐    ┌─────▼─────┐
    │ Backend 1 │    │ Backend 2 │    │ Backend 3 │
    └─────┬─────┘    └─────┬─────┘    └─────┬─────┘
          │                │                │
          └────────────────┼────────────────┘
                           │
                    ┌──────▼──────┐
                    │   MySQL     │
                    │  (Master)   │
                    └──────┬──────┘
                           │
          ┌────────────────┼────────────────┐
          │                │                │
    ┌─────▼─────┐    ┌─────▼─────┐    ┌─────▼─────┐
    │  Replica  │    │  Replica  │    │  Replica  │
    │  (Read)   │    │  (Read)   │    │  (Read)   │
    └───────────┘    └───────────┘    └───────────┘
```

---

## 🔧 Tecnologias por Camada

### Frontend
```
React 19.1.1          → UI Framework
TypeScript 5.8.3      → Type Safety
Vite 7.1.2            → Build Tool
TanStack Query 5.90.5 → State Management
TailwindCSS 4.1.12    → Styling
Radix UI              → Components
Recharts 2.15.4       → Charts
React Router 7.8.2    → Routing
Zod 4.1.12            → Validation
```

### Backend
```
Node.js 22.x          → Runtime
Express.js 5.1.0      → Web Framework
mysql2 3.14.3         → Database Driver
jsonwebtoken 9.0.2    → Authentication
bcryptjs 3.0.2        → Password Hashing
dotenv 17.2.1         → Environment Config
cors 2.8.5            → CORS Handling
```

### Database
```
MySQL 8.0+            → Relational Database
XAMPP                 → Development Environment
phpMyAdmin            → Database Management
```

### DevOps (Futuro)
```
PM2                   → Process Manager
Nginx                 → Reverse Proxy
Let's Encrypt         → SSL Certificates
Docker                → Containerization
```

---

**Última atualização:** Novembro 2025
