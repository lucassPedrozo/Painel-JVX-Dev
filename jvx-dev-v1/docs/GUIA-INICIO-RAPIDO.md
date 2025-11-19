# ⚡ Guia de Início Rápido - JVX Desenvolvimento

## 🎯 3 Passos para Começar

### 1️⃣ Instalar Pré-requisitos (Apenas 1x)

- ✅ **Node.js** (v16+) → https://nodejs.org/
- ✅ **XAMPP** → https://www.apachefriends.org/

### 2️⃣ Configurar Banco de Dados (Apenas 1x)

1. Abrir XAMPP Control Panel
2. Clicar em "Start" no MySQL
3. Acessar http://localhost/phpmyadmin
4. Criar banco "worksdb"
5. Executar SQL do arquivo: `database/database-init-clean.sql`

### 3️⃣ Iniciar Sistema

**Opção 1 - Script Completo (Recomendado):**
```
🖱️ Duplo clique em: iniciar-projeto.bat
```

**Opção 2 - Script Simples:**
```
🖱️ Duplo clique em: iniciar-projeto-simples.bat
```

**Opção 3 - Manual:**
```bash
npm install
npm start
```

**Pronto!** Acesse: http://localhost:5173

---

## 🔑 Credenciais de Acesso

### Master (Administrador)
```
Usuário: jvxadmin
Senha: admin123
```

### Desenvolvedor (Teste)
```
Usuário: leandro.dev
Senha: dev123
```

⚠️ **Importante:** Altere as senhas padrão após o primeiro acesso!

---

## 🛑 Parar Sistema

```
🖱️ Duplo clique em: parar-projeto.bat
```

Ou feche as janelas do servidor manualmente.

---

## ❓ Problemas Comuns

### MySQL não conecta?
- ✓ XAMPP está aberto?
- ✓ MySQL está verde no XAMPP?
- ✓ Banco "worksdb" existe?

### Porta já em uso?
```bash
# Execute o script de parada
parar-projeto.bat
```

### Erro ao instalar dependências?
```bash
# Delete node_modules e reinstale
rmdir /s /q node_modules
npm install
```

### Erro de conexão com banco?
```bash
# Teste a conexão
npm run test-db
```

---

## 🚀 Comandos Úteis

```bash
npm run dev          # Apenas frontend (Vite)
npm run server       # Apenas backend (Express)
npm start            # Backend + Frontend
npm run test-db      # Testar conexão com banco
npm run populate     # Popular banco com dados de exemplo
npm run import       # Importar CSV
npm run verify       # Verificar dados no banco
```

---

## 📚 Próximos Passos

1. **Explorar o Dashboard** - Visualize estatísticas e gráficos
2. **Adicionar Projetos** - Teste o CRUD completo
3. **Importar Dados** - Use o CSV de exemplo em `database/exemplo-importacao.csv`
4. **Configurar Usuários** - Crie usuários para sua equipe
5. **Gerar Relatórios** - Exporte dados em PDF e CSV

---

## 📖 Documentação Completa

- **README.md** - Visão geral e documentação técnica
- **COMO-USAR.md** - Manual completo de uso
- **ARQUITETURA.md** - Estrutura técnica do projeto
- **SOLUCAO-PROBLEMAS.md** - Troubleshooting detalhado

---

**Desenvolvido por JVX Desenvolvimento** 🚀
