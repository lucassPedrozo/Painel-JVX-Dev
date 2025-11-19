# 📑 Índice Geral - JVX Desenvolvimento

## 🚀 Início Rápido

| Arquivo | Descrição | Tempo |
|---------|-----------|-------|
| **[INICIO.md](INICIO.md)** | Guia de 3 passos para começar | 2 min |
| **[README.md](README.md)** | Visão geral do projeto | 10 min |
| **[NAVEGACAO.md](NAVEGACAO.md)** | Guia de navegação completo | 5 min |

---

## 📚 Documentação

### Guias de Uso
| Arquivo | Descrição | Nível |
|---------|-----------|-------|
| **[docs/GUIA-INICIO-RAPIDO.md](docs/GUIA-INICIO-RAPIDO.md)** | Guia rápido de instalação | Iniciante |
| **[docs/GUIA-COMPLETO.md](docs/GUIA-COMPLETO.md)** | Guia completo com tudo | Intermediário |
| **[docs/ARQUITETURA.md](docs/ARQUITETURA.md)** | Documentação técnica | Avançado |
| **[docs/README.md](docs/README.md)** | Índice da documentação | Todos |

### Documentação da Organização
| Arquivo | Descrição |
|---------|-----------|
| **[ORGANIZACAO.md](ORGANIZACAO.md)** | Estrutura detalhada do projeto |
| **[RESUMO-ORGANIZACAO.md](RESUMO-ORGANIZACAO.md)** | Resumo executivo da organização |
| **[ANTES-E-DEPOIS.md](ANTES-E-DEPOIS.md)** | Comparação visual antes/depois |

---

## 🛠️ Scripts e Ferramentas

### Scripts Executáveis (.bat)
| Localização | Descrição |
|-------------|-----------|
| **[bin/](bin/)** | Scripts Windows para execução |
| **[bin/README.md](bin/README.md)** | Documentação dos scripts .bat |

**Arquivos:**
- `bin/iniciar-projeto.bat` - Inicia o sistema
- `bin/parar-projeto.bat` - Para o sistema
- `bin/diagnostico.bat` - Diagnóstico completo

### Scripts Utilitários (.js)
| Localização | Descrição |
|-------------|-----------|
| **[scripts/](scripts/)** | Scripts Node.js organizados |
| **[scripts/README.md](scripts/README.md)** | Documentação dos scripts .js |

**Subpastas:**
- `scripts/database/` - Scripts de banco de dados
- `scripts/import/` - Scripts de importação
- `scripts/test/` - Scripts de teste

---

## 🗄️ Banco de Dados

| Localização | Descrição |
|-------------|-----------|
| **[database/](database/)** | Scripts SQL e exemplos CSV |
| **[database/README.md](database/README.md)** | Documentação do banco |

**Arquivos:**
- `database/database-init-clean.sql` - Script de inicialização
- `database/exemplo-importacao.csv` - Exemplo de CSV

---

## 💻 Código Fonte

| Localização | Descrição |
|-------------|-----------|
| **[src/](src/)** | Código fonte do frontend |
| **[server.js](server.js)** | Servidor backend Express |

**Subpastas do src/:**
- `src/components/` - Componentes React
- `src/contexts/` - Contextos
- `src/hooks/` - Custom hooks
- `src/lib/` - Utilitários
- `src/pages/` - Páginas
- `src/types/` - Tipos TypeScript

---

## ⚙️ Configuração

| Arquivo | Descrição |
|---------|-----------|
| **[.env.example](.env.example)** | Exemplo de variáveis de ambiente |
| **[package.json](package.json)** | Dependências e scripts npm |
| **[vite.config.ts](vite.config.ts)** | Configuração do Vite |
| **[tsconfig.json](tsconfig.json)** | Configuração do TypeScript |
| **[eslint.config.js](eslint.config.js)** | Configuração do ESLint |
| **[components.json](components.json)** | Configuração Shadcn/ui |

---

## 📋 Comandos npm

### Desenvolvimento
```bash
npm start            # Inicia backend + frontend
npm run dev          # Apenas frontend
npm run server       # Apenas backend
```

### Banco de Dados
```bash
npm run test-db      # Testa conexão
npm run populate     # Popula banco
npm run verify       # Verifica dados
npm run import       # Importa CSV
```

### Testes
```bash
npm run test-api     # Testa API
```

### Build
```bash
npm run build        # Build produção
npm run lint         # Lint código
npm run preview      # Preview build
```

---

## 🎯 Fluxo de Navegação

### Novo no Projeto?
```
1. INICIO.md
2. docs/GUIA-INICIO-RAPIDO.md
3. Explorar o sistema
```

### Quer Entender Tudo?
```
1. README.md
2. docs/GUIA-COMPLETO.md
3. docs/ARQUITETURA.md
```

### Vai Contribuir?
```
1. README.md
2. docs/ARQUITETURA.md
3. .kiro/steering/*.md
4. Código fonte
```

### Tem um Problema?
```
1. bin/diagnostico.bat
2. docs/GUIA-COMPLETO.md → Solução de Problemas
3. Logs do servidor
```

---

## 📊 Estrutura Visual

```
jvx-dev-v1/
│
├── 📄 Documentação Principal
│   ├── README.md
│   ├── INICIO.md
│   ├── NAVEGACAO.md
│   └── INDICE.md (este arquivo)
│
├── 📄 Documentação da Organização
│   ├── ORGANIZACAO.md
│   ├── RESUMO-ORGANIZACAO.md
│   └── ANTES-E-DEPOIS.md
│
├── 📁 Pastas Organizadas
│   ├── bin/           (scripts .bat)
│   ├── database/      (SQL e CSV)
│   ├── docs/          (documentação)
│   ├── scripts/       (scripts .js)
│   └── src/           (código fonte)
│
└── ⚙️ Configuração
    ├── .env.example
    ├── package.json
    ├── vite.config.ts
    └── [outros configs]
```

---

## 🔍 Busca Rápida

### Preciso de...

| O que | Onde |
|-------|------|
| Começar agora | [INICIO.md](INICIO.md) |
| Visão geral | [README.md](README.md) |
| Guia completo | [docs/GUIA-COMPLETO.md](docs/GUIA-COMPLETO.md) |
| Documentação técnica | [docs/ARQUITETURA.md](docs/ARQUITETURA.md) |
| Executar scripts | [bin/](bin/) ou [scripts/](scripts/) |
| Configurar banco | [database/README.md](database/README.md) |
| Resolver problema | [docs/GUIA-COMPLETO.md](docs/GUIA-COMPLETO.md) |
| Entender organização | [ORGANIZACAO.md](ORGANIZACAO.md) |
| Ver mudanças | [ANTES-E-DEPOIS.md](ANTES-E-DEPOIS.md) |
| Navegar projeto | [NAVEGACAO.md](NAVEGACAO.md) |

---

## 📞 Links Úteis

### Documentação
- [Índice da Documentação](docs/README.md)
- [Guia de Início Rápido](docs/GUIA-INICIO-RAPIDO.md)
- [Guia Completo](docs/GUIA-COMPLETO.md)
- [Arquitetura](docs/ARQUITETURA.md)

### Scripts
- [Scripts Executáveis](bin/README.md)
- [Scripts Utilitários](scripts/README.md)
- [Banco de Dados](database/README.md)

### Organização
- [Estrutura Detalhada](ORGANIZACAO.md)
- [Resumo](RESUMO-ORGANIZACAO.md)
- [Antes e Depois](ANTES-E-DEPOIS.md)

### Navegação
- [Guia de Navegação](NAVEGACAO.md)
- [Índice Geral](INDICE.md) (este arquivo)

---

## ✅ Checklist de Uso

### Primeira Vez
- [ ] Ler [INICIO.md](INICIO.md)
- [ ] Executar `npm install`
- [ ] Configurar banco de dados
- [ ] Executar `bin/iniciar-projeto.bat`
- [ ] Acessar http://localhost:5173

### Desenvolvimento
- [ ] Ler [docs/GUIA-COMPLETO.md](docs/GUIA-COMPLETO.md)
- [ ] Ler [docs/ARQUITETURA.md](docs/ARQUITETURA.md)
- [ ] Explorar código em `src/`
- [ ] Entender estrutura de pastas

### Contribuição
- [ ] Ler toda documentação
- [ ] Entender padrões de código
- [ ] Seguir regras em `.kiro/steering/`
- [ ] Documentar mudanças

---

**Versão:** 2.0.0  
**Última atualização:** Novembro 2025

**Desenvolvido com ❤️ por JVX Desenvolvimento**
