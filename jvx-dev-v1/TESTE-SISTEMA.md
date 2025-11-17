# 🧪 Teste do Sistema - Guia Completo

## ✅ Sistema Testado e Funcionando

O sistema foi testado e está funcionando corretamente:
- ✅ Banco de dados: 360 projetos, 3 usuários, 3 desenvolvedores
- ✅ API Backend: Respondendo corretamente
- ✅ Autenticação: Login funcionando
- ✅ Dados: Sendo retornados pela API

## 🔍 Testes Realizados

### 1. Teste de Conexão com Banco
```bash
node scripts/testar-conexao-db.js
```

**Resultado:**
```
✓ Conexão com MySQL estabelecida!
✓ Banco "worksdb" encontrado!
✓ Tabelas: developers, users, works
✓ Registros: 360 projetos
```

### 2. Teste da API
```bash
node testar-api.js
```

**Resultado:**
```
✓ Login bem-sucedido
✓ 360 projetos encontrados
✓ API respondendo corretamente
```

## 🚀 Como Iniciar o Sistema

### Opção 1: Script Simples (Recomendado)
```
Duplo clique em: iniciar-projeto-simples.bat
```

### Opção 2: Script Completo
```
Duplo clique em: iniciar-projeto.bat
```

### Opção 3: Manual
```bash
# Terminal 1 - Backend
node server.js

# Terminal 2 - Frontend
npm run dev
```

## 🔧 Verificação Passo a Passo

### 1. Verificar XAMPP
```
✓ XAMPP Control Panel aberto
✓ MySQL rodando (verde)
✓ Porta 3306 disponível
```

### 2. Verificar Banco de Dados
```bash
node scripts/testar-conexao-db.js
```

Deve mostrar:
- ✓ Conexão estabelecida
- ✓ Banco worksdb encontrado
- ✓ 3 tabelas criadas
- ✓ Registros presentes

### 3. Iniciar Backend
```bash
node server.js
```

Deve mostrar:
```
✓ Servidor rodando em http://localhost:3001
✓ Sistema de autenticação ativo
✓ Banco de dados: worksdb
```

### 4. Testar API
```bash
# Em outro terminal
node testar-api.js
```

Deve mostrar:
- ✓ Login bem-sucedido
- ✓ Projetos encontrados
- ✓ Dados retornados

### 5. Iniciar Frontend
```bash
npm run dev
```

Deve mostrar:
```
VITE ready in XXX ms
Local: http://localhost:5173
```

### 6. Acessar Sistema
```
URL: http://localhost:5173
Login: jvxadmin
Senha: admin123
```

## 🐛 Troubleshooting

### Problema: "Nenhum dado aparece no frontend"

**Possíveis causas:**

1. **Backend não está rodando**
   ```bash
   # Verificar se está rodando
   netstat -ano | findstr :3001
   
   # Se não estiver, iniciar
   node server.js
   ```

2. **Frontend não está conectando na API**
   ```
   # Abrir DevTools (F12)
   # Aba Console
   # Procurar erros de CORS ou 404
   ```

3. **Token expirado ou inválido**
   ```
   # Fazer logout e login novamente
   # Ou limpar localStorage:
   localStorage.clear()
   ```

4. **Porta errada**
   ```
   # Verificar .env
   VITE_API_URL=http://localhost:3001
   
   # Verificar se backend está na porta 3001
   ```

### Problema: "Erro de CORS"

**Solução:**
```
1. Verificar .env:
   CORS_ORIGIN=http://localhost:5173

2. Reiniciar backend:
   Ctrl+C
   node server.js
```

### Problema: "401 Unauthorized"

**Solução:**
```
1. Fazer logout
2. Fazer login novamente
3. Verificar se o token está sendo enviado:
   DevTools → Network → Headers → Authorization
```

## 📊 Dados de Teste

### Usuários Disponíveis

**Master:**
- Username: jvxadmin
- Password: admin123
- Permissões: Total

**Desenvolvedor:**
- Username: leandro.dev
- Password: dev123
- Permissões: Visualizar apenas seus projetos

### Desenvolvedores no Sistema
- Leandro
- Heron
- Interno

### Projetos
- Total: 360 projetos
- Diversos status: Não Entregue, Entregue, Em Andamento
- Diversos tipos: Site Institucional, Landing Page, E-commerce

## 🔍 Comandos de Diagnóstico

```bash
# 1. Testar conexão com banco
node scripts/testar-conexao-db.js

# 2. Testar API
node testar-api.js

# 3. Verificar sistema completo
.\diagnostico.bat

# 4. Ver processos Node rodando
tasklist | findstr node.exe

# 5. Ver portas em uso
netstat -ano | findstr :3001
netstat -ano | findstr :5173

# 6. Parar todos os servidores
.\parar-projeto.bat
```

## ✅ Checklist de Funcionamento

- [ ] XAMPP rodando
- [ ] MySQL ativo (verde)
- [ ] Banco worksdb existe
- [ ] Tabelas criadas (users, developers, works)
- [ ] Dados populados (360 projetos)
- [ ] Backend rodando (porta 3001)
- [ ] Frontend rodando (porta 5173)
- [ ] Login funciona
- [ ] Dados aparecem no dashboard
- [ ] Tabela de projetos carrega
- [ ] Filtros funcionam

## 🎯 Teste Completo

Execute este teste para validar tudo:

```bash
# 1. Parar tudo
.\parar-projeto.bat

# 2. Testar banco
node scripts/testar-conexao-db.js

# 3. Iniciar sistema
.\iniciar-projeto-simples.bat

# 4. Aguardar 10 segundos

# 5. Testar API
node testar-api.js

# 6. Acessar frontend
# http://localhost:5173

# 7. Fazer login
# jvxadmin / admin123

# 8. Verificar dashboard
# Deve mostrar estatísticas

# 9. Ir em "Sites"
# Deve mostrar lista de projetos

# 10. Testar filtros
# Filtrar por desenvolvedor, status, etc.
```

## 📝 Logs Importantes

### Backend
```
Logs aparecem no terminal do backend:
- [timestamp] GET /works
- [timestamp] POST /auth/login
- ✓ Login bem-sucedido: username (role)
- ✓ Carregados X projetos para username
```

### Frontend
```
Logs aparecem no DevTools Console (F12):
- Requisições HTTP
- Erros de API
- Avisos de React
```

## 🆘 Ainda Não Funciona?

1. **Execute diagnóstico completo:**
   ```bash
   .\diagnostico.bat
   ```

2. **Copie todas as saídas**

3. **Verifique:**
   - Versão do Node: `node --version` (deve ser ≥16)
   - Versão do npm: `npm --version`
   - XAMPP rodando
   - MySQL ativo

4. **Tente reinstalação limpa:**
   ```bash
   # Parar tudo
   .\parar-projeto.bat
   
   # Deletar
   rmdir /s /q node_modules
   del package-lock.json
   
   # Reinstalar
   npm install
   
   # Testar
   node scripts/testar-conexao-db.js
   node testar-api.js
   ```

---

**Última atualização:** Novembro 2025

**Status:** ✅ Sistema testado e funcionando
