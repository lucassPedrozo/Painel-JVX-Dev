# 🔧 Solução de Problemas - JVX Desenvolvimento

Guia completo para resolver os problemas mais comuns.

## 📑 Índice Rápido

- [Problemas de Instalação](#-problemas-de-instalação)
- [Problemas de Conexão](#-problemas-de-conexão)
- [Problemas de Porta](#-problemas-de-porta)
- [Problemas de Login](#-problemas-de-login)
- [Problemas de Dados](#-problemas-de-dados)
- [Problemas de Performance](#-problemas-de-performance)

---

## 🔨 Problemas de Instalação

### ❌ "Script pisca e fecha imediatamente"

**Sintoma:** Ao executar `iniciar-projeto.bat`, a janela abre e fecha rapidamente.

**Solução 1 - Usar script simplificado:**
```
Duplo clique em: iniciar-projeto-simples.bat
```

**Solução 2 - Executar diagnóstico:**
```
Duplo clique em: diagnostico.bat
Veja qual é o erro específico
```

**Solução 3 - Executar manualmente:**
```
1. Abra CMD nesta pasta
2. Digite: iniciar-projeto.bat
3. Veja o erro que aparece
```

---

### ❌ "Node.js não encontrado"

**Sintoma:** Ao executar `iniciar-projeto.bat`, aparece erro de Node.js não encontrado.

**Solução:**
```bash
1. Baixe Node.js: https://nodejs.org/
2. Instale a versão LTS (recomendada)
3. Reinicie o computador
4. Teste: abra CMD e digite "node --version"
```

**Verificação:**
```bash
node --version
# Deve mostrar: v16.x.x ou superior
```

---

### ❌ "npm install falhou"

**Sintoma:** Erro ao instalar dependências.

**Solução 1 - Limpar cache:**
```bash
npm cache clean --force
npm install
```

**Solução 2 - Reinstalar do zero:**
```bash
# Delete as pastas:
- node_modules
- package-lock.json

# Reinstale:
npm install
```

**Solução 3 - Usar versão específica do Node:**
```bash
# Verifique sua versão:
node --version

# Se for muito antiga (< 16), atualize:
# Baixe em: https://nodejs.org/
```

---

### ❌ "Erro de permissão ao instalar"

**Sintoma:** "EACCES" ou "permission denied" durante npm install.

**Solução Windows:**
```bash
# Execute CMD como Administrador
# Clique com botão direito no CMD
# Escolha "Executar como administrador"
npm install
```

---

## 🔌 Problemas de Conexão

### ❌ "Erro na conexão com o banco de dados"

**Sintoma:** Script de inicialização falha ao conectar com MySQL.

**Verificações:**

1. **XAMPP está rodando?**
   ```
   ✓ Abra XAMPP Control Panel
   ✓ MySQL deve estar verde
   ✓ Se não estiver, clique em "Start"
   ```

2. **Banco existe?**
   ```
   ✓ Acesse: http://localhost/phpmyadmin
   ✓ Procure "worksdb" na lista lateral
   ✓ Se não existir, crie o banco
   ```

3. **Credenciais corretas?**
   ```
   Verifique o arquivo .env:
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=
   DB_NAME=worksdb
   ```

**Teste de conexão:**
```bash
npm run test-db
```

---

### ❌ "Can't connect to MySQL server"

**Sintoma:** Erro ao tentar conectar no MySQL.

**Solução 1 - Reiniciar MySQL:**
```
1. Abra XAMPP Control Panel
2. Clique em "Stop" no MySQL
3. Aguarde 5 segundos
4. Clique em "Start" no MySQL
```

**Solução 2 - Verificar porta:**
```
1. No XAMPP, clique em "Config" do MySQL
2. Verifique se a porta é 3306
3. Se for diferente, atualize o .env:
   DB_PORT=3306
```

**Solução 3 - Firewall:**
```
1. Abra Firewall do Windows
2. Permita conexões na porta 3306
3. Ou desative temporariamente para testar
```

---

### ❌ "Access denied for user 'root'"

**Sintoma:** Erro de autenticação no MySQL.

**Solução:**
```
1. Abra phpMyAdmin: http://localhost/phpmyadmin
2. Clique em "Contas de usuário"
3. Verifique o usuário "root"
4. Se tiver senha, atualize o .env:
   DB_PASSWORD=sua_senha_aqui
```

---

## 🚪 Problemas de Porta

### ❌ "Porta 3001 já em uso"

**Sintoma:** Backend não inicia, erro "EADDRINUSE".

**Solução 1 - Parar processos:**
```bash
# Execute:
parar-projeto.bat

# Ou manualmente:
taskkill /F /IM node.exe
```

**Solução 2 - Mudar porta:**
```
Edite o arquivo .env:
PORT=3002

Edite o arquivo src/lib/api.ts:
const API_URL = 'http://localhost:3002';
```

**Verificar processos:**
```bash
# Ver processos Node rodando:
tasklist | findstr node.exe

# Matar processo específico:
taskkill /PID [número_do_pid] /F
```

---

### ❌ "Porta 5173 já em uso"

**Sintoma:** Frontend não inicia, erro de porta ocupada.

**Solução 1 - Parar Vite:**
```bash
# Feche todas as janelas do terminal
# Ou pressione Ctrl+C no terminal do frontend
```

**Solução 2 - Mudar porta do Vite:**
```javascript
// Edite vite.config.ts:
export default defineConfig({
  server: {
    port: 5174, // Nova porta
  }
})
```

---

## 🔐 Problemas de Login

### ❌ "Credenciais inválidas"

**Sintoma:** Não consegue fazer login com jvxadmin/admin123.

**Verificação:**
```bash
# Teste se o usuário existe:
npm run test-db

# Deve mostrar:
# users: 1 ou mais registros
```

**Solução - Recriar usuário:**
```sql
-- Acesse phpMyAdmin
-- Execute este SQL:

DELETE FROM users WHERE username = 'jvxadmin';

INSERT INTO users (username, password, role, name, email) 
VALUES (
  'jvxadmin',
  '$2a$10$rZ5qH8qF9xK3yL2mN4pO1.vW7sT6uV8wX9yA0bC1dE2fG3hI4jK5l',
  'master',
  'Administrador',
  'admin@jvx.com'
);
```

---

### ❌ "Token expirado"

**Sintoma:** Deslogado automaticamente após algum tempo.

**Solução:**
```
Isso é normal! O token JWT expira por segurança.
Faça login novamente.

Para aumentar o tempo de expiração:
Edite server.js, linha do jwt.sign:
expiresIn: '24h' // Era '8h'
```

---

## 📊 Problemas de Dados

### ❌ "Nenhum projeto aparece"

**Sintoma:** Dashboard e página Sites estão vazios.

**Verificação:**
```bash
npm run test-db
# Verifique: works: X registros
```

**Solução - Popular banco:**
```bash
npm run populate
```

**Solução - Verificar filtros:**
```
1. Na página Sites, verifique os filtros
2. Limpe todos os filtros
3. Verifique se está logado como desenvolvedor
   (desenvolvedores só veem seus projetos)
```

---

### ❌ "Erro ao salvar projeto"

**Sintoma:** Formulário não salva, erro no console.

**Verificação:**
```
1. Abra DevTools (F12)
2. Vá na aba Console
3. Veja o erro específico
```

**Soluções comuns:**
```
- Campos obrigatórios vazios
- Data inválida
- Valor numérico inválido
- Desenvolvedor não selecionado
```

---

### ❌ "Dados desatualizados"

**Sintoma:** Alterações não aparecem imediatamente.

**Solução:**
```
1. Pressione F5 para recarregar
2. Ou Ctrl+Shift+R (hard refresh)
3. Limpe o cache do navegador
```

---

## ⚡ Problemas de Performance

### ❌ "Sistema lento"

**Sintoma:** Páginas demoram para carregar.

**Verificações:**

1. **Muitos registros?**
   ```bash
   npm run test-db
   # Se works > 10.000, considere arquivar antigos
   ```

2. **MySQL lento?**
   ```
   - Reinicie o MySQL no XAMPP
   - Aumente memória do MySQL (my.ini)
   ```

3. **Navegador lento?**
   ```
   - Feche abas desnecessárias
   - Limpe cache do navegador
   - Use Chrome ou Edge (mais rápidos)
   ```

---

### ❌ "Gráficos não carregam"

**Sintoma:** Dashboard mostra loading infinito.

**Solução:**
```
1. Abra DevTools (F12)
2. Vá na aba Network
3. Veja se há erros 500 ou 404
4. Verifique o console do backend
```

**Verificar backend:**
```
Na janela do backend, procure por erros
Se houver erro de SQL, o banco pode estar corrompido
```

---

## 🔍 Diagnóstico Geral

### Comandos de Diagnóstico

```bash
# 1. Testar conexão
npm run test-db

# 2. Verificar dados
npm run verify

# 3. Ver versões
node --version
npm --version

# 4. Verificar processos
tasklist | findstr node.exe

# 5. Testar backend isolado
npm run server

# 6. Testar frontend isolado
npm run dev
```

---

## 📝 Logs e Debug

### Ver logs do Backend

```
Os logs aparecem na janela "JVX Backend"
Procure por:
- Erros em vermelho
- Warnings em amarelo
- Requisições HTTP
```

### Ver logs do Frontend

```
1. Abra DevTools (F12)
2. Aba Console
3. Procure por erros em vermelho
```

### Ativar modo debug

```javascript
// No arquivo .env, adicione:
DEBUG=true
LOG_LEVEL=verbose
```

---

## 🆘 Último Recurso

### Reinstalação Completa

```bash
# 1. Backup do banco
# Exporte worksdb no phpMyAdmin

# 2. Delete tudo
- node_modules/
- package-lock.json
- .env

# 3. Reinstale
npm install
copy .env.example .env

# 4. Recrie banco
# Execute database-init-clean.sql

# 5. Teste
npm run test-db
```

---

## 📞 Suporte

Se nenhuma solução funcionou:

1. **Documente o erro:**
   - Tire prints das mensagens
   - Copie logs do console
   - Anote os passos que causam o erro

2. **Verifique a documentação:**
   - README.md
   - COMO-USAR.md
   - docs/

3. **Informações úteis para suporte:**
   ```
   - Versão do Node: node --version
   - Sistema operacional: Windows X
   - Versão do XAMPP
   - Mensagem de erro completa
   - Passos para reproduzir
   ```

---

**Última atualização:** Novembro 2025
