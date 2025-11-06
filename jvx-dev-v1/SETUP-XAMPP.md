# 🚀 Guia de Instalação - XAMPP

Este guia mostra como configurar e executar o projeto JVX Desenvolvimento usando XAMPP no Windows.

---

## 📋 Pré-requisitos

### 1. XAMPP
- **Download**: https://www.apachefriends.org/download.html
- **Versão**: 8.0 ou superior (com MySQL/MariaDB)
- **Instalação**: Instale em `C:\xampp` (padrão)

### 2. Node.js
- **Download**: https://nodejs.org/
- **Versão**: 16.0 ou superior
- **Verificar instalação**:
  ```bash
  node --version
  npm --version
  ```

---

## 🔧 Passo 1: Configurar XAMPP

### 1.1 Iniciar Serviços
1. Abra o **XAMPP Control Panel**
2. Clique em **Start** no módulo **MySQL**
3. Aguarde até o status ficar verde

### 1.2 Verificar MySQL
1. Clique em **Admin** no módulo MySQL (abre phpMyAdmin)
2. Ou acesse: http://localhost/phpmyadmin
3. Verifique se está funcionando

---

## 🗄️ Passo 2: Criar Banco de Dados

### Opção A: Via phpMyAdmin (Recomendado)
1. Acesse http://localhost/phpmyadmin
2. Clique na aba **SQL**
3. Copie todo o conteúdo do arquivo `database-init-clean.sql`
4. Cole na área de texto
5. Clique em **Executar**
6. Verifique se o banco `worksdb` foi criado

### Opção B: Via Linha de Comando
```bash
# Navegue até a pasta do XAMPP
cd C:\xampp\mysql\bin

# Execute o script SQL
mysql -u root -p < "C:\caminho\para\jvx-dev-v1\database-init-clean.sql"

# Quando pedir senha, apenas pressione Enter (senha vazia por padrão)
```

### Verificar Criação
No phpMyAdmin, você deve ver:
- ✅ Banco de dados: `worksdb`
- ✅ Tabelas: `users`, `developers`, `works`
- ✅ Usuário master criado: `jvxadmin`

---

## 📦 Passo 3: Instalar Dependências

Abra o terminal (CMD ou PowerShell) na pasta do projeto:

```bash
# Navegue até a pasta do projeto
cd C:\caminho\para\jvx-dev-v1

# Instale as dependências
npm install
```

**Aguarde**: Este processo pode levar alguns minutos.

---

## ⚙️ Passo 4: Configurar Variáveis de Ambiente

O arquivo `.env` já está configurado para XAMPP com as seguintes configurações:

```env
# Backend
PORT=3001
JWT_SECRET=REMOVED-SECRET
CORS_ORIGIN=http://localhost:5173

# Database (XAMPP padrão)
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=worksdb

# Frontend
VITE_API_URL=http://localhost:3001
```

**Nota**: Se você configurou uma senha no MySQL do XAMPP, altere `DB_PASSWORD=` para `DB_PASSWORD=sua_senha`

---

## 🚀 Passo 5: Executar o Projeto

### 5.1 Iniciar Backend (Terminal 1)
```bash
npm run server
```

**Saída esperada**:
```
[timestamp] Servidor rodando na porta 3001
[timestamp] Conectado ao MySQL
```

### 5.2 Iniciar Frontend (Terminal 2)
Abra um **novo terminal** na mesma pasta:

```bash
npm run dev
```

**Saída esperada**:
```
VITE v7.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

---

## 🌐 Passo 6: Acessar o Sistema

1. Abra seu navegador
2. Acesse: **http://localhost:5173**
3. Faça login com as credenciais padrão:
   - **Usuário**: `jvxadmin`
   - **Senha**: `admin123`

---

## 📊 Passo 7: Importar Dados (Opcional)

Se você tem um arquivo CSV com dados para importar:

### Via Interface Web
1. Faça login no sistema
2. Vá em **Configurações**
3. Clique em **Importar CSV**
4. Selecione seu arquivo
5. Aguarde a importação

### Via Script
```bash
# Certifique-se de que o backend está rodando
npm run import
```

---

## 🔍 Verificação e Testes

### Verificar Conexão com Banco
```bash
npm run test-db
```

### Verificar Dados no Banco
```bash
npm run verify
```

### Verificar Estrutura das Tabelas
```bash
npm run check-structure
```

---

## ⚠️ Solução de Problemas

### Problema: "Erro ao conectar ao MySQL"
**Solução**:
1. Verifique se o MySQL está rodando no XAMPP Control Panel
2. Confirme que a porta 3306 não está sendo usada por outro programa
3. Verifique as credenciais no arquivo `.env`

### Problema: "Port 3001 already in use"
**Solução**:
```bash
# Windows - Encontrar processo usando a porta
netstat -ano | findstr :3001

# Matar o processo (substitua PID pelo número encontrado)
taskkill /PID <PID> /F

# Ou altere a porta no .env
PORT=3002
```

### Problema: "Port 5173 already in use"
**Solução**:
```bash
# Feche outros projetos Vite rodando
# Ou o Vite irá automaticamente usar a próxima porta disponível (5174, 5175, etc)
```

### Problema: "Token inválido"
**Solução**:
1. Faça logout
2. Limpe o cache do navegador (Ctrl + Shift + Del)
3. Faça login novamente

### Problema: "Cannot find module"
**Solução**:
```bash
# Reinstale as dependências
rm -rf node_modules package-lock.json
npm install
```

---

## 📝 Comandos Úteis

### Desenvolvimento
```bash
npm run dev          # Frontend (Vite)
npm run server       # Backend (Express)
npm start            # Ambos simultaneamente (requer concurrently)
```

### Build
```bash
npm run build        # Build de produção
npm run preview      # Preview do build
```

### Banco de Dados
```bash
npm run import       # Importar CSV
npm run test-csv     # Testar CSV
npm run verify       # Verificar dados
npm run test-db      # Testar conexão
```

### Qualidade
```bash
npm run lint         # Verificar código
```

---

## 🔐 Segurança

### Alterar Senha Padrão
1. Faça login como `jvxadmin`
2. Vá em **Gerenciar Usuários**
3. Edite o usuário `jvxadmin`
4. Altere a senha
5. Salve

### Alterar JWT Secret
1. Edite o arquivo `.env`
2. Altere `JWT_SECRET` para uma string aleatória longa
3. Reinicie o backend

---

## 📂 Estrutura de Pastas

```
jvx-dev-v1/
├── src/                    # Código fonte frontend
├── public/                 # Arquivos públicos
├── server.js              # Backend Express
├── database-init-clean.sql # Script SQL
├── .env                   # Configurações (XAMPP)
├── package.json           # Dependências
└── SETUP-XAMPP.md        # Este arquivo
```

---

## 🆘 Suporte

### Logs do Backend
Os logs aparecem no terminal onde você executou `npm run server`

### Logs do Frontend
Abra o Console do navegador (F12) para ver erros

### Verificar MySQL
Acesse phpMyAdmin: http://localhost/phpmyadmin

---

## ✅ Checklist de Instalação

- [ ] XAMPP instalado e MySQL rodando
- [ ] Node.js instalado (v16+)
- [ ] Banco de dados `worksdb` criado
- [ ] Dependências instaladas (`npm install`)
- [ ] Arquivo `.env` configurado
- [ ] Backend rodando (porta 3001)
- [ ] Frontend rodando (porta 5173)
- [ ] Login funcionando (jvxadmin/admin123)
- [ ] Senha padrão alterada

---

## 🎉 Pronto!

Seu sistema JVX Desenvolvimento está rodando localmente com XAMPP!

**Próximos passos**:
1. Altere a senha padrão
2. Crie usuários para sua equipe
3. Importe seus dados (se tiver)
4. Comece a gerenciar seus projetos!

---

**Desenvolvido com ❤️ por JVX Desenvolvimento**
