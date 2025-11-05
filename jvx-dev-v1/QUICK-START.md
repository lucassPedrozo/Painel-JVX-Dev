# ⚡ Quick Start - JVX Desenvolvimento

Guia rápido para começar a usar o sistema em 5 minutos.

## 🚀 Início Rápido

### 1️⃣ Instalar (2 minutos)

```bash
# Clone
git clone https://github.com/seu-usuario/jvx-desenvolvimento.git
cd jvx-desenvolvimento

# Instale
npm install
```

### 2️⃣ Configurar (1 minuto)

```bash
# Copie o .env
cp .env.example .env

# Edite com suas configurações
# DB_PASSWORD=sua_senha
# JWT_SECRET=sua_chave_secreta
```

### 3️⃣ Banco de Dados (1 minuto)

```bash
# Acesse MySQL
mysql -u root -p

# Execute (dentro do MySQL)
source database-init-clean.sql
exit
```

### 4️⃣ Importar Dados (1 minuto)

```bash
# Importe o CSV de exemplo
npm run import
```

### 5️⃣ Iniciar (30 segundos)

```bash
# Terminal 1
npm run server

# Terminal 2
npm run dev
```

### 6️⃣ Acessar

Abra: **http://localhost:5173**

**Login:**
- Usuário: `jvxadmin`
- Senha: `admin123`

## 🎯 Pronto!

Você agora tem:
- ✅ Sistema rodando
- ✅ 360 projetos importados
- ✅ Dashboard funcionando
- ✅ Todos os recursos disponíveis

## 📚 Próximos Passos

1. **Altere a senha padrão** em Configurações
2. **Explore o dashboard** e veja as estatísticas
3. **Crie novos usuários** em Gerenciar Usuários
4. **Importe seus dados** via CSV
5. **Gere relatórios** em PDF

## 📖 Documentação Completa

- [README.md](./README.md) - Documentação completa
- [DEPLOY.md](./DEPLOY.md) - Guia de deploy
- [CONTRIBUTING.md](./CONTRIBUTING.md) - Como contribuir

## 🆘 Problemas?

### Erro: "Banco não encontrado"
```bash
mysql -u root -p < database-init-clean.sql
```

### Erro: "Token inválido"
- Faça logout e login novamente
- Limpe o cache (Ctrl+Shift+Del)

### Erro: "Conexão recusada"
- Verifique se MySQL está rodando
- Confirme credenciais no `.env`

## 💡 Dicas

- Use `npm run test-csv` para validar CSV antes de importar
- Use `npm run verify` para verificar dados no banco
- Consulte logs do servidor para debug
- Use F12 no navegador para ver erros do frontend

---

**Tempo total:** ~5 minutos ⏱️  
**Dificuldade:** Fácil 🟢
