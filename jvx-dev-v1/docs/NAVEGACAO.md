# 🧭 Guia de Navegação - JVX Desenvolvimento

Encontre rapidamente o que você precisa.

---

## 🎯 Você quer...

### Começar a usar o sistema agora
→ **[INICIO.md](INICIO.md)** (2 minutos)  
→ **[docs/GUIA-INICIO-RAPIDO.md](docs/GUIA-INICIO-RAPIDO.md)** (5 minutos)

### Entender o projeto completo
→ **[README.md](README.md)** (10 minutos)  
→ **[docs/GUIA-COMPLETO.md](docs/GUIA-COMPLETO.md)** (30 minutos)

### Ver a organização do projeto
→ **[ORGANIZACAO.md](ORGANIZACAO.md)** - Estrutura detalhada  
→ **[ANTES-E-DEPOIS.md](ANTES-E-DEPOIS.md)** - Comparação visual  
→ **[RESUMO-ORGANIZACAO.md](RESUMO-ORGANIZACAO.md)** - Resumo executivo

### Contribuir com código
→ **[docs/ARQUITETURA.md](docs/ARQUITETURA.md)** - Arquitetura técnica  
→ **[.kiro/steering/](. kiro/steering/)** - Regras de desenvolvimento

### Executar scripts
→ **[bin/README.md](bin/README.md)** - Scripts executáveis (.bat)  
→ **[scripts/README.md](scripts/README.md)** - Scripts utilitários (.js)

### Trabalhar com banco de dados
→ **[database/README.md](database/README.md)** - Documentação do banco  
→ `npm run test-db` - Testar conexão  
→ `npm run populate` - Popular banco

### Resolver problemas
→ **[docs/GUIA-COMPLETO.md](docs/GUIA-COMPLETO.md)** → Seção "Solução de Problemas"  
→ `bin/diagnostico.bat` - Diagnóstico automático

---

## 📁 Estrutura de Pastas

```
jvx-dev-v1/
│
├── 📁 bin/              → Scripts executáveis Windows (.bat)
├── 📁 database/         → SQL, CSV e documentação do banco
├── 📁 docs/             → Documentação completa do projeto
├── 📁 scripts/          → Scripts utilitários organizados
│   ├── database/       → Scripts de banco de dados
│   ├── import/         → Scripts de importação
│   └── test/           → Scripts de teste
└── 📁 src/              → Código fonte do frontend
```

---

## 📄 Arquivos na Raiz

### Documentação Principal
- **[README.md](README.md)** - Visão geral do projeto
- **[INICIO.md](INICIO.md)** - Guia rápido de início
- **[NAVEGACAO.md](NAVEGACAO.md)** - Este arquivo

### Documentação da Organização
- **[ORGANIZACAO.md](ORGANIZACAO.md)** - Estrutura detalhada
- **[RESUMO-ORGANIZACAO.md](RESUMO-ORGANIZACAO.md)** - Resumo executivo
- **[ANTES-E-DEPOIS.md](ANTES-E-DEPOIS.md)** - Comparação visual

### Configuração
- **[.env.example](.env.example)** - Exemplo de variáveis de ambiente
- **[package.json](package.json)** - Dependências e scripts
- **[vite.config.ts](vite.config.ts)** - Configuração do Vite
- **[tsconfig.json](tsconfig.json)** - Configuração do TypeScript

### Backend
- **[server.js](server.js)** - Servidor Express

---

## 🛠️ Comandos Rápidos

### Iniciar Sistema
```bash
# Windows (recomendado):
bin\iniciar-projeto.bat

# Manual:
npm start
```

### Desenvolvimento
```bash
npm run dev          # Frontend apenas
npm run server       # Backend apenas
npm start            # Ambos
```

### Banco de Dados
```bash
npm run test-db      # Testar conexão
npm run populate     # Popular com dados
npm run verify       # Verificar integridade
npm run import       # Importar CSV
```

### Testes
```bash
npm run test-api     # Testar API
```

### Build
```bash
npm run build        # Build produção
npm run lint         # Lint código
```

### Diagnóstico
```bash
# Windows:
bin\diagnostico.bat

# Manual:
npm run test-db
```

---

## 📚 Documentação por Nível

### Nível 1 - Iniciante (5-10 min)
1. [INICIO.md](INICIO.md)
2. [docs/GUIA-INICIO-RAPIDO.md](docs/GUIA-INICIO-RAPIDO.md)
3. Explorar o sistema

### Nível 2 - Usuário (20-30 min)
1. [README.md](README.md)
2. [docs/GUIA-COMPLETO.md](docs/GUIA-COMPLETO.md)
3. Usar todas as funcionalidades

### Nível 3 - Desenvolvedor (1-2 horas)
1. [README.md](README.md)
2. [docs/GUIA-COMPLETO.md](docs/GUIA-COMPLETO.md)
3. [docs/ARQUITETURA.md](docs/ARQUITETURA.md)
4. [.kiro/steering/](. kiro/steering/)
5. Código fonte em `src/`

### Nível 4 - Contribuidor (2-4 horas)
1. Toda documentação acima
2. [ORGANIZACAO.md](ORGANIZACAO.md)
3. [scripts/README.md](scripts/README.md)
4. [bin/README.md](bin/README.md)
5. Código fonte completo

---

## 🎯 Fluxos de Trabalho

### Primeira Instalação
```
1. Ler INICIO.md
2. Executar bin/iniciar-projeto.bat
3. Acessar http://localhost:5173
4. Login: jvxadmin / admin123
```

### Desenvolvimento Diário
```
1. Executar bin/iniciar-projeto.bat
2. Desenvolver
3. Testar
4. Executar bin/parar-projeto.bat
```

### Resolver Problema
```
1. Executar bin/diagnostico.bat
2. Consultar docs/GUIA-COMPLETO.md
3. Verificar logs
4. Aplicar solução
```

### Adicionar Funcionalidade
```
1. Ler docs/ARQUITETURA.md
2. Ler .kiro/steering/structure.md
3. Desenvolver
4. Testar
5. Documentar
```

---

## 🔍 Busca Rápida

### Por Tarefa

| Tarefa | Onde Encontrar |
|--------|----------------|
| Instalar sistema | [INICIO.md](INICIO.md) |
| Configurar banco | [database/README.md](database/README.md) |
| Executar scripts | [scripts/README.md](scripts/README.md) |
| Resolver problemas | [docs/GUIA-COMPLETO.md](docs/GUIA-COMPLETO.md) |
| Entender código | [docs/ARQUITETURA.md](docs/ARQUITETURA.md) |
| Contribuir | [.kiro/steering/](. kiro/steering/) |

### Por Tipo de Arquivo

| Tipo | Localização |
|------|-------------|
| Scripts .bat | [bin/](bin/) |
| Scripts .js | [scripts/](scripts/) |
| Documentação | [docs/](docs/) |
| SQL | [database/](database/) |
| Código fonte | [src/](src/) |
| Configuração | Raiz do projeto |

### Por Problema

| Problema | Solução |
|----------|---------|
| Não conecta no banco | `npm run test-db` |
| Porta em uso | `bin/parar-projeto.bat` |
| Dados não aparecem | `npm run populate` |
| Erro ao iniciar | `bin/diagnostico.bat` |
| Dúvida sobre uso | [docs/GUIA-COMPLETO.md](docs/GUIA-COMPLETO.md) |

---

## 📊 Mapa Visual

```
┌─────────────────────────────────────────────────────────┐
│                    JVX DESENVOLVIMENTO                   │
│                                                          │
│  🚀 INÍCIO RÁPIDO                                       │
│  ├─ INICIO.md                                           │
│  └─ docs/GUIA-INICIO-RAPIDO.md                         │
│                                                          │
│  📚 DOCUMENTAÇÃO                                        │
│  ├─ README.md                                           │
│  ├─ docs/GUIA-COMPLETO.md                              │
│  └─ docs/ARQUITETURA.md                                │
│                                                          │
│  🗂️ ORGANIZAÇÃO                                         │
│  ├─ ORGANIZACAO.md                                      │
│  ├─ RESUMO-ORGANIZACAO.md                              │
│  └─ ANTES-E-DEPOIS.md                                   │
│                                                          │
│  🛠️ FERRAMENTAS                                         │
│  ├─ bin/ (scripts .bat)                                │
│  ├─ scripts/ (scripts .js)                             │
│  └─ database/ (SQL e CSV)                              │
│                                                          │
│  💻 CÓDIGO                                              │
│  ├─ src/ (frontend)                                    │
│  └─ server.js (backend)                                │
└─────────────────────────────────────────────────────────┘
```

---

## 🎓 Dicas de Navegação

### Para Novos Usuários
- Comece por [INICIO.md](INICIO.md)
- Não tente ler tudo de uma vez
- Use os guias por nível de conhecimento
- Consulte a documentação quando precisar

### Para Desenvolvedores
- Leia a documentação técnica primeiro
- Explore a estrutura de pastas
- Entenda os padrões de código
- Consulte os READMEs de cada pasta

### Para Administradores
- Foque nos guias de instalação e configuração
- Entenda os scripts disponíveis
- Saiba onde encontrar logs e diagnósticos
- Conheça os comandos de manutenção

---

## 📞 Ajuda Rápida

### Não sei por onde começar
→ [INICIO.md](INICIO.md)

### Quero entender tudo
→ [docs/README.md](docs/README.md)

### Tenho um problema
→ [docs/GUIA-COMPLETO.md](docs/GUIA-COMPLETO.md) → Solução de Problemas

### Quero contribuir
→ [docs/ARQUITETURA.md](docs/ARQUITETURA.md)

### Preciso de um comando
→ [README.md](README.md) → Seção "Scripts Disponíveis"

---

**Versão:** 2.0.0  
**Última atualização:** Novembro 2025

**Desenvolvido com ❤️ por JVX Desenvolvimento**
