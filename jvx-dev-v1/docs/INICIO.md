# 🚀 Início Rápido - JVX Desenvolvimento

## ⚡ 3 Passos para Começar

### 1️⃣ Instale as Dependências
```bash
npm install
```

### 2️⃣ Configure o Banco de Dados
- Inicie o XAMPP e o MySQL
- Crie o banco `worksdb` no phpMyAdmin
- Execute o script `database/database-init-clean.sql`

### 3️⃣ Inicie o Projeto
```bash
# Windows:
bin\iniciar-projeto.bat

# Ou manualmente:
npm start
```

**Acesse:** http://localhost:5173  
**Login:** jvxadmin / admin123

---

## 📚 Documentação

### Guias Rápidos
- 📖 **[README.md](README.md)** - Visão geral do projeto
- ⚡ **[docs/GUIA-INICIO-RAPIDO.md](docs/GUIA-INICIO-RAPIDO.md)** - Guia de 3 passos
- 📘 **[docs/GUIA-COMPLETO.md](docs/GUIA-COMPLETO.md)** - Guia completo

### Documentação Técnica
- 🏗️ **[docs/ARQUITETURA.md](docs/ARQUITETURA.md)** - Arquitetura do sistema
- 📁 **[ORGANIZACAO.md](ORGANIZACAO.md)** - Estrutura do projeto
- 📊 **[RESUMO-ORGANIZACAO.md](RESUMO-ORGANIZACAO.md)** - Resumo da organização

---

## 🛠️ Comandos Úteis

### Desenvolvimento
```bash
npm start            # Inicia backend + frontend
npm run dev          # Apenas frontend
npm run server       # Apenas backend
```

### Banco de Dados
```bash
npm run test-db      # Testa conexão
npm run populate     # Popula com dados de exemplo
npm run verify       # Verifica integridade
npm run import       # Importa CSV
```

### Build
```bash
npm run build        # Build de produção
npm run lint         # Lint código
```

---

## 📁 Estrutura

```
jvx-dev-v1/
├── bin/            # Scripts executáveis (.bat)
├── database/       # SQL e exemplos CSV
├── docs/           # Documentação completa
├── scripts/        # Scripts utilitários
│   ├── database/  # Scripts de BD
│   ├── import/    # Scripts de importação
│   └── test/      # Scripts de teste
└── src/            # Código fonte frontend
```

---

## 🆘 Problemas?

### Erro de Conexão
```bash
# Verifique se MySQL está rodando
bin\diagnostico.bat

# Teste a conexão
npm run test-db
```

### Porta em Uso
```bash
# Pare todos os processos
bin\parar-projeto.bat
```

### Dados não Aparecem
```bash
# Popule o banco
npm run populate
```

---

## 📞 Mais Informações

- **Guia Completo:** [docs/GUIA-COMPLETO.md](docs/GUIA-COMPLETO.md)
- **Documentação:** [docs/README.md](docs/README.md)
- **Scripts:** [scripts/README.md](scripts/README.md)
- **Executáveis:** [bin/README.md](bin/README.md)

---

**Versão:** 2.0.0  
**Desenvolvido com ❤️ por JVX Desenvolvimento**
