# 🏗️ Estrutura do Projeto - JVX Desenvolvimento

## 📊 Visão Geral

```
jvx-dev-v1/
│
├── 📁 bin/                          Scripts executáveis Windows
├── 📁 database/                     Banco de dados e exemplos
├── 📁 docs/                         Documentação completa
├── 📁 scripts/                      Scripts utilitários organizados
├── 📁 src/                          Código fonte frontend
│
├── 📄 README.md                     Visão geral do projeto
├── 📄 INICIO.md                     Guia rápido de início
├── 📄 NAVEGACAO.md                  Guia de navegação
├── 📄 INDICE.md                     Índice geral
├── 📄 ESTRUTURA.md                  Este arquivo
│
├── 📄 ORGANIZACAO.md                Documentação da organização
├── 📄 RESUMO-ORGANIZACAO.md         Resumo executivo
├── 📄 ANTES-E-DEPOIS.md             Comparação visual
│
├── 📄 server.js                     Servidor backend Express
├── 📄 package.json                  Dependências e scripts
├── 📄 vite.config.ts                Configuração Vite
└── 📄 [outros arquivos de config]
```

---

## 📁 Detalhamento das Pastas

### 📁 bin/ - Scripts Executáveis
```
bin/
├── iniciar-projeto.bat      Inicia o sistema completo
├── parar-projeto.bat         Para todos os processos
├── diagnostico.bat           Diagnóstico do sistema
└── README.md                 Documentação dos scripts
```

**Uso:**
- Duplo clique nos arquivos .bat
- Ou execute via linha de comando

---

### 📁 database/ - Banco de Dados
```
database/
├── database-init-clean.sql   Script de inicialização do banco
├── exemplo-importacao.csv    Exemplo de arquivo CSV
└── README.md                 Documentação do banco
```

**Conteúdo:**
- Schema completo do banco
- Dados iniciais (usuário admin)
- Exemplos de importação

---

### 📁 docs/ - Documentação
```
docs/
├── GUIA-INICIO-RAPIDO.md     Guia de 3 passos (5 min)
├── GUIA-COMPLETO.md          Guia completo (30 min)
├── ARQUITETURA.md            Documentação técnica
└── README.md                 Índice da documentação
```

**Níveis:**
- Iniciante → GUIA-INICIO-RAPIDO.md
- Intermediário → GUIA-COMPLETO.md
- Avançado → ARQUITETURA.md

---

### 📁 scripts/ - Scripts Utilitários
```
scripts/
├── database/                 Scripts de banco de dados
│   ├── testar-conexao-db.js     Testa conexão MySQL
│   ├── popular-banco-completo.js Popula banco com dados
│   └── verificar-dados.js       Verifica integridade
│
├── import/                   Scripts de importação
│   └── importar-csv-direto.js   Importa CSV no banco
│
├── test/                     Scripts de teste
│   └── testar-api.js            Testa endpoints da API
│
└── README.md                 Documentação dos scripts
```

**Execução:**
```bash
npm run test-db      # scripts/database/testar-conexao-db.js
npm run populate     # scripts/database/popular-banco-completo.js
npm run verify       # scripts/database/verificar-dados.js
npm run import       # scripts/import/importar-csv-direto.js
npm run test-api     # scripts/test/testar-api.js
```

---

### 📁 src/ - Código Fonte Frontend
```
src/
├── assets/                   Imagens e recursos estáticos
├── components/               Componentes React
│   ├── ui/                      Componentes base (Shadcn)
│   ├── dashboard/               Componentes do dashboard
│   ├── dialogs/                 Modais e diálogos
│   └── [outros componentes]
│
├── contexts/                 Contextos React
│   ├── AuthContext.tsx          Autenticação
│   ├── WorksContext.tsx         Projetos
│   └── NotificationsContext.tsx Notificações
│
├── hooks/                    Custom hooks
│   └── useWorks.ts              Hook de projetos
│
├── lib/                      Utilitários e constantes
│   ├── api.ts                   Cliente API
│   ├── utils.ts                 Funções utilitárias
│   └── constants.ts             Constantes
│
├── pages/                    Páginas da aplicação
│   ├── Home.tsx                 Dashboard
│   ├── Sites.tsx                Gerenciamento de projetos
│   ├── Login.tsx                Autenticação
│   └── [outras páginas]
│
├── types/                    Tipos TypeScript
│
├── App.tsx                   Componente principal
├── main.tsx                  Entry point
└── index.css                 Estilos globais
```

---

## 📄 Arquivos na Raiz

### Documentação
| Arquivo | Descrição | Tamanho |
|---------|-----------|---------|
| **README.md** | Visão geral do projeto | ~200 linhas |
| **INICIO.md** | Guia rápido de início | ~100 linhas |
| **NAVEGACAO.md** | Guia de navegação | ~300 linhas |
| **INDICE.md** | Índice geral | ~200 linhas |
| **ESTRUTURA.md** | Este arquivo | ~150 linhas |

### Organização
| Arquivo | Descrição | Tamanho |
|---------|-----------|---------|
| **ORGANIZACAO.md** | Estrutura detalhada | ~400 linhas |
| **RESUMO-ORGANIZACAO.md** | Resumo executivo | ~300 linhas |
| **ANTES-E-DEPOIS.md** | Comparação visual | ~400 linhas |

### Configuração
| Arquivo | Descrição |
|---------|-----------|
| **.env.example** | Exemplo de variáveis de ambiente |
| **package.json** | Dependências e scripts npm |
| **vite.config.ts** | Configuração do Vite |
| **tsconfig.json** | Configuração do TypeScript |
| **eslint.config.js** | Configuração do ESLint |
| **components.json** | Configuração Shadcn/ui |

### Backend
| Arquivo | Descrição |
|---------|-----------|
| **server.js** | Servidor Express (backend) |

---

## 📊 Estatísticas

### Pastas
- **5 pastas principais** (bin, database, docs, scripts, src)
- **3 subpastas em scripts/** (database, import, test)
- **7+ subpastas em src/** (components, contexts, hooks, etc.)

### Arquivos de Documentação
- **7 arquivos .md na raiz** (principais + organização)
- **4 arquivos .md em docs/** (guias)
- **4 arquivos README.md** (um em cada pasta)
- **Total: ~15 arquivos de documentação**

### Scripts
- **3 scripts .bat** em bin/
- **5 scripts .js** em scripts/ (organizados em subpastas)
- **Total: 8 scripts utilitários**

### Código Fonte
- **1 arquivo backend** (server.js)
- **Múltiplos arquivos frontend** em src/
- **Componentes React** organizados por funcionalidade

---

## 🎯 Organização por Função

### Execução
```
bin/                    Scripts para executar o sistema
├── iniciar-projeto.bat    Inicia tudo
├── parar-projeto.bat      Para tudo
└── diagnostico.bat        Diagnostica problemas
```

### Dados
```
database/               Tudo relacionado ao banco
├── SQL                    Schema e inicialização
└── CSV                    Exemplos de importação
```

### Documentação
```
docs/                   Toda a documentação
├── Guias                  Para usuários
└── Arquitetura            Para desenvolvedores
```

### Utilitários
```
scripts/                Scripts Node.js
├── database/              Gerenciamento de BD
├── import/                Importação de dados
└── test/                  Testes
```

### Código
```
src/                    Código fonte
├── Frontend               React + TypeScript
└── Backend (raiz)         Express (server.js)
```

---

## 🔍 Como Encontrar Algo

### Preciso executar o sistema
→ `bin/iniciar-projeto.bat`

### Preciso de documentação
→ `docs/` ou arquivos .md na raiz

### Preciso executar um script
→ `scripts/` (organizados por função)

### Preciso configurar o banco
→ `database/`

### Preciso ver o código
→ `src/` (frontend) ou `server.js` (backend)

### Preciso de configuração
→ Arquivos na raiz (.env.example, package.json, etc.)

---

## ✅ Benefícios da Estrutura

### Clareza
- ✅ Cada pasta tem um propósito claro
- ✅ Fácil de encontrar o que precisa
- ✅ Estrutura lógica e intuitiva

### Organização
- ✅ Arquivos agrupados por função
- ✅ Subpastas quando necessário
- ✅ READMEs contextuais

### Escalabilidade
- ✅ Fácil adicionar novos scripts
- ✅ Fácil adicionar nova documentação
- ✅ Estrutura preparada para crescer

### Manutenção
- ✅ Fácil de manter
- ✅ Fácil de atualizar
- ✅ Fácil de documentar

---

## 📚 Documentação Relacionada

- **[README.md](README.md)** - Visão geral
- **[ORGANIZACAO.md](ORGANIZACAO.md)** - Detalhes da organização
- **[NAVEGACAO.md](NAVEGACAO.md)** - Como navegar
- **[INDICE.md](INDICE.md)** - Índice completo

---

**Versão:** 2.0.0  
**Última atualização:** Novembro 2025

**Desenvolvido com ❤️ por JVX Desenvolvimento**
