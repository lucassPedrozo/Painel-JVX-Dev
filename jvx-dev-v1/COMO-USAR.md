# 🚀 Como Usar o Sistema JVX Desenvolvimento

## 📋 Pré-requisitos

### 1. Instalar Node.js
- Baixe em: https://nodejs.org/
- Versão recomendada: 16.x ou superior
- Verifique a instalação: `node --version`

### 2. Instalar XAMPP
- Baixe em: https://www.apachefriends.org/
- Inicie o XAMPP Control Panel
- Inicie o serviço **MySQL** (botão Start)

### 3. Criar o Banco de Dados
1. Acesse: http://localhost/phpmyadmin
2. Clique em **"Novo"** no menu lateral
3. Nome do banco: `worksdb`
4. Clique em **"Criar"**
5. Selecione o banco `worksdb`
6. Clique na aba **"SQL"**
7. Abra o arquivo `database/database-init-clean.sql`
8. Copie todo o conteúdo e cole na área SQL
9. Clique em **"Executar"**

## 🎯 Iniciar o Sistema

### Método 1: Script Automático (Recomendado)
1. Dê duplo clique em: `iniciar-projeto.bat`
2. Aguarde as verificações automáticas
3. Duas janelas serão abertas (Backend e Frontend)
4. Acesse: http://localhost:5173

### Método 2: Manual
```bash
# Terminal 1 - Backend
cd jvx-dev-v1
npm run server

# Terminal 2 - Frontend
cd jvx-dev-v1
npm run dev
```

## 🛑 Parar o Sistema

### Método 1: Script Automático
- Dê duplo clique em: `parar-projeto.bat`

### Método 2: Manual
- Feche as janelas do servidor
- Ou pressione `Ctrl+C` em cada terminal

## 👤 Usuários Padrão

### Master (Administrador)
- **Login:** jvxadmin
- **Senha:** admin123
- **Permissões:** Acesso total ao sistema

### Desenvolvedor (Teste)
- **Login:** leandro.dev
- **Senha:** dev123
- **Permissões:** Visualizar apenas seus projetos

## 🔧 Comandos Úteis

```bash
# Instalar dependências
npm install

# Iniciar backend e frontend juntos
npm start

# Apenas backend
npm run server

# Apenas frontend
npm run dev

# Testar conexão com banco
npm run test-db

# Popular banco com dados de exemplo
npm run populate

# Importar dados de CSV
npm run import

# Verificar integridade dos dados
npm run verify

# Build para produção
npm run build
```

## 📁 Estrutura de Portas

- **Frontend (Vite):** http://localhost:5173
- **Backend (Express):** http://localhost:3001
- **MySQL (XAMPP):** localhost:3306
- **phpMyAdmin:** http://localhost/phpmyadmin

## ⚠️ Problemas Comuns

### Erro: "Node.js não encontrado"
- Instale o Node.js: https://nodejs.org/
- Reinicie o terminal/computador após instalação

### Erro: "Conexão com banco falhou"
- Verifique se o XAMPP está aberto
- Verifique se o MySQL está rodando (verde no XAMPP)
- Verifique se o banco `worksdb` existe

### Erro: "Porta 3001 já em uso"
- Feche outros processos Node.js
- Execute: `parar-projeto.bat`
- Ou use: `taskkill /F /IM node.exe`

### Erro: "Porta 5173 já em uso"
- Feche outros servidores Vite
- Ou altere a porta no `vite.config.ts`

### Erro: "npm install falhou"
- Delete a pasta `node_modules`
- Delete o arquivo `package-lock.json`
- Execute novamente: `npm install`

## 📊 Funcionalidades Principais

### Para Master (jvxadmin)
- ✅ Adicionar novos projetos
- ✅ Editar todos os projetos
- ✅ Excluir projetos
- ✅ Ver todos os projetos de todos os desenvolvedores
- ✅ Acessar dashboard completo com estatísticas
- ✅ Gerenciar desenvolvedores
- ✅ Exportar relatórios

### Para Desenvolvedor (leandro.dev)
- ✅ Ver apenas seus projetos
- ✅ Marcar projetos como concluídos
- ✅ Ver estatísticas pessoais
- ❌ Não pode adicionar/editar/excluir projetos
- ❌ Não vê projetos de outros desenvolvedores

## 🔐 Segurança

- Senhas são criptografadas com bcrypt
- Autenticação via JWT (JSON Web Token)
- Sessões expiram após inatividade
- Validação de permissões no backend

## 📝 Logs e Debug

Os logs do servidor aparecem na janela do Backend:
- Requisições HTTP
- Erros de banco de dados
- Autenticação de usuários
- Operações CRUD

## 🆘 Suporte

Se encontrar problemas:
1. Verifique os logs nas janelas do servidor
2. Teste a conexão: `npm run test-db`
3. Verifique o arquivo `.env`
4. Consulte a documentação em `docs/`

## 📚 Documentação Adicional

- `README.md` - Visão geral do projeto
- `docs/` - Documentação técnica completa
- `.kiro/steering/` - Guias de desenvolvimento
