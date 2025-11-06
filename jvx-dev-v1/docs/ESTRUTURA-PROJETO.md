# 📁 Estrutura do Projeto JVX Desenvolvimento

## 🎯 Arquivos Principais

### Raiz do Projeto
```
├── .env                          # Variáveis de ambiente (não versionado)
├── .env.example                  # Exemplo de configuração
├── .gitignore                    # Arquivos ignorados pelo Git
├── package.json                  # Dependências e scripts
├── pnpm-lock.yaml               # Lock file do pnpm
├── README.md                     # Documentação principal
├── LICENSE                       # Licença MIT
├── iniciar-projeto.bat          # Script de inicialização (Windows)
├── index.html                    # HTML principal
├── vite.config.ts               # Configuração do Vite
├── tsconfig.json                # Configuração TypeScript
├── tsconfig.app.json            # Config TS para app
├── tsconfig.node.json           # Config TS para Node
├── eslint.config.js             # Configuração ESLint
├── components.json              # Configuração Shadcn/ui
└── server.js                     # Servidor Express principal
```

### 📁 database/ - Scripts de Banco de Dados
```
├── database-init-clean.sql      # Script de inicialização do banco
└── README.md                     # Documentação do banco
```

### 📁 docs/ - Documentação
```
├── ESTRUTURA-PROJETO.md         # Este arquivo
├── INICIO-RAPIDO.md             # Guia de início rápido
├── LIMPEZA-REALIZADA.md         # Log de limpeza
├── RESUMO-LIMPEZA.txt           # Resumo executivo
└── README.md                     # Índice da documentação
```

### 📁 scripts/ - Scripts Utilitários
```
├── importar-csv-direto.js       # Importação de CSV
├── verificar-dados.js           # Verificação de dados
├── testar-conexao-db.js         # Teste de conexão
├── popular-banco-completo.js    # Popular banco com dados de exemplo
└── README.md                     # Documentação dos scripts
```

## 📂 Estrutura do Frontend (src/)

```
src/
├── assets/                       # Recursos estáticos
│   └── favicon.png
│
├── components/                   # Componentes React
│   ├── ui/                      # Componentes base (Shadcn/ui)
│   │   ├── accordion.tsx
│   │   ├── alert-dialog.tsx
│   │   ├── badge.tsx
│   │   ├── button.tsx
│   │   ├── calendar.tsx
│   │   ├── card.tsx
│   │   ├── chart.tsx
│   │   ├── dialog.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── mode-toggle.tsx
│   │   ├── popover.tsx
│   │   ├── scroll-area.tsx
│   │   ├── select.tsx
│   │   ├── separator.tsx
│   │   ├── skeleton.tsx
│   │   ├── table.tsx
│   │   ├── tabs.tsx
│   │   ├── textarea.tsx
│   │   ├── theme-provider.tsx
│   │   └── tooltip.tsx
│   │
│   ├── dashboard/               # Componentes do dashboard
│   │   ├── DeveloperPerformance.tsx
│   │   ├── MetricsCards.tsx
│   │   ├── PaymentTimeline.tsx
│   │   ├── ProjectsChart.tsx
│   │   ├── RecentActivity.tsx
│   │   ├── TechnologyStats.tsx
│   │   └── WorkTypeDistribution.tsx
│   │
│   ├── skeletons/               # Componentes de loading
│   │   ├── CardSkeleton.tsx
│   │   ├── ChartSkeleton.tsx
│   │   └── TableSkeleton.tsx
│   │
│   └── [Componentes principais]
│       ├── DeleteWorkDialog.tsx
│       ├── DeveloperInfoDialog.tsx
│       ├── DeveloperStatusButton.tsx
│       ├── EditWorkDialog.tsx
│       ├── ErrorBoundary.tsx
│       ├── FormField.tsx
│       ├── Header.tsx
│       ├── LoadingScreen.tsx
│       ├── NotificationPanel.tsx
│       ├── PageHeader.tsx
│       ├── ProtectedRoute.tsx
│       ├── QuickActions.tsx
│       ├── RatingDialog.tsx
│       ├── RatingStars.tsx
│       ├── ReportPreview.tsx
│       ├── StatsCards.tsx
│       ├── StatusBadge.tsx
│       ├── ValueCards.tsx
│       ├── WorkDialog.tsx
│       └── WorksTable.tsx
│
├── contexts/                     # Contextos React
│   ├── AuthContext.tsx          # Autenticação
│   ├── NotificationsContext.tsx # Notificações
│   └── WorksContext.tsx         # Gerenciamento de projetos
│
├── hooks/                        # Custom hooks
│   └── useWorks.ts
│
├── lib/                          # Bibliotecas e utilitários
│   ├── api.ts                   # Cliente API
│   ├── constants.ts             # Constantes
│   ├── pdf-export.ts            # Exportação PDF
│   └── utils.ts                 # Funções auxiliares
│
├── pages/                        # Páginas da aplicação
│   ├── Analises.tsx             # Análises e gráficos
│   ├── Calendario.tsx           # Calendário de entregas
│   ├── Configuracoes.tsx        # Configurações do sistema
│   ├── Equipe.tsx               # Gerenciamento de equipe
│   ├── GerenciarUsuarios.tsx    # Gerenciamento de usuários
│   ├── Home.tsx                 # Dashboard principal
│   ├── Login.tsx                # Página de login
│   ├── Relatorios.tsx           # Relatórios
│   └── Sites.tsx                # Listagem de projetos
│
├── App.tsx                       # Componente principal
├── main.tsx                      # Entry point
├── index.css                     # Estilos globais
└── vite-env.d.ts                # Tipos do Vite
```

## 🗄️ Estrutura do Banco de Dados

### Tabelas

#### `users`
- Usuários do sistema
- Campos: id, username, password, role, developer_name, active, created_at

#### `developers`
- Informações dos desenvolvedores
- Campos: id, name, phone, email, whatsapp, pixKey, pixType, bankName, agency, account, observations

#### `works`
- Projetos de desenvolvimento
- Campos: id, developer, deadline_type, value, domain, site_type, template, delivery_date, delivery_month, delivery_year, status, developer_status, completed_at, payment_status, observations

## 📜 Scripts NPM Disponíveis

### Desenvolvimento
- `npm run dev` - Inicia frontend (Vite)
- `npm run server` - Inicia backend (Express)
- `npm start` - Inicia backend e frontend simultaneamente

### Build
- `npm run build` - Build de produção
- `npm run preview` - Preview do build
- `npm run lint` - Executa ESLint

### Utilitários
- `npm run import` - Importa CSV diretamente no banco
- `npm run verify` - Verifica dados no banco
- `npm run test-db` - Testa conexão com banco de dados
- `npm run populate` - Popula banco com dados de exemplo

## 🔑 Credenciais Padrão

### Usuário Master
- **Usuário**: jvxadmin
- **Senha**: admin123

### Usuários de Exemplo (após popular banco)
- **Leandro**: leandro.dev / dev123
- **Heron**: heron.dev / dev123

## 🚀 Fluxo de Trabalho

1. **Instalação**: `npm install`
2. **Configuração**: Copiar `.env.example` para `.env`
3. **Banco de Dados**: Executar `database-init-clean.sql`
4. **Popular Dados**: `npm run populate` (opcional)
5. **Desenvolvimento**: `npm start`
6. **Acesso**: http://localhost:5173

## 📦 Tecnologias Principais

### Frontend
- React 19
- TypeScript
- Vite
- TailwindCSS
- Shadcn/ui
- Recharts
- React Router
- Tanstack Query

### Backend
- Node.js
- Express
- MySQL
- JWT
- bcrypt

## 🔒 Segurança

- Autenticação JWT
- Senhas criptografadas com bcrypt
- Controle de acesso por função (master/standard)
- Proteção contra SQL Injection
- CORS configurável

## 📝 Notas

- Todos os arquivos de teste e debug foram removidos
- Documentação consolidada no README.md
- Estrutura limpa e organizada
- Código otimizado e sem dependências não utilizadas
