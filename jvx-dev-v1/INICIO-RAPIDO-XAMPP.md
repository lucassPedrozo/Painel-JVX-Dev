# ⚡ Início Rápido - XAMPP

Guia super rápido para rodar o projeto com XAMPP em 5 minutos!

---

## 🎯 Pré-requisitos

- ✅ XAMPP instalado (com MySQL)
- ✅ Node.js instalado (v16+)

---

## 🚀 Passos Rápidos

### 1️⃣ Iniciar MySQL no XAMPP
```
1. Abra XAMPP Control Panel
2. Clique em "Start" no MySQL
3. Aguarde ficar verde
```

### 2️⃣ Criar Banco de Dados
```
1. Acesse: http://localhost/phpmyadmin
2. Clique na aba "SQL"
3. Cole todo o conteúdo de: database-init-clean.sql
4. Clique em "Executar"
```

### 3️⃣ Instalar Dependências
```bash
npm install
```

### 4️⃣ Testar Conexão
```bash
npm run test-xampp
```

Se aparecer "✅ TUDO OK!", prossiga!

### 5️⃣ Iniciar Backend
```bash
npm run server
```

### 6️⃣ Iniciar Frontend (novo terminal)
```bash
npm run dev
```

### 7️⃣ Acessar Sistema
```
URL: http://localhost:5173
Usuário: jvxadmin
Senha: admin123
```

---

## ✅ Pronto!

Seu sistema está rodando! 🎉

---

## 🆘 Problemas?

### MySQL não conecta?
```bash
# Verifique se está rodando no XAMPP
# Porta padrão: 3306
```

### Banco não existe?
```bash
# Execute o SQL novamente no phpMyAdmin
```

### Porta 3001 em uso?
```bash
# Altere PORT no .env para 3002
```

---

## 📚 Documentação Completa

Para mais detalhes, veja: **SETUP-XAMPP.md**

---

**JVX Desenvolvimento** 🚀
