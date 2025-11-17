# ⚡ Início Rápido - JVX Desenvolvimento

## 🎯 3 Passos para Começar

### 1️⃣ Instalar Pré-requisitos (Apenas 1x)

```
✅ Node.js → https://nodejs.org/
✅ XAMPP → https://www.apachefriends.org/
```

### 2️⃣ Configurar Banco de Dados (Apenas 1x)

```
1. Abrir XAMPP Control Panel
2. Clicar em "Start" no MySQL
3. Acessar http://localhost/phpmyadmin
4. Criar banco "worksdb"
5. Executar SQL do arquivo: database/database-init-clean.sql
```

### 3️⃣ Iniciar Sistema

**Opção 1 - Script Completo:**
```
🖱️ Duplo clique em: iniciar-projeto.bat
```

**Opção 2 - Script Simples (se o primeiro não funcionar):**
```
🖱️ Duplo clique em: iniciar-projeto-simples.bat
```

**Opção 3 - Diagnóstico (se nada funcionar):**
```
🖱️ Duplo clique em: diagnostico.bat
```

**Pronto!** Acesse: http://localhost:5173

---

## 🔑 Login

### Master (Admin)
```
Usuário: jvxadmin
Senha: admin123
```

### Desenvolvedor (Teste)
```
Usuário: leandro.dev
Senha: dev123
```

---

## 🛑 Parar Sistema

```
🖱️ Duplo clique em: parar-projeto.bat
```

Ou feche as janelas do servidor.

---

## ❓ Problemas?

### MySQL não conecta?
```
✓ XAMPP está aberto?
✓ MySQL está verde no XAMPP?
✓ Banco "worksdb" existe?
```

### Porta já em uso?
```
Execute: parar-projeto.bat
```

### Erro ao instalar?
```
Delete: node_modules e package-lock.json
Execute: npm install
```

---

## 📚 Mais Informações

- **Guia Completo:** `COMO-USAR.md`
- **Documentação:** `README.md`
- **Suporte Técnico:** `docs/`

---

## 🚀 Comandos Úteis

```bash
npm run server    # Apenas backend
npm run dev       # Apenas frontend
npm start         # Backend + Frontend
npm run test-db   # Testar conexão
npm run populate  # Popular com dados
```

---

**Desenvolvido por JVX Desenvolvimento** 🎨
