# ✅ Checklist de Instalação - JVX Desenvolvimento

Use este checklist para garantir que tudo está configurado corretamente.

## 📋 Pré-requisitos

- [ ] **Node.js instalado**
  - Teste: Abra CMD e digite `node --version`
  - Deve mostrar: v16.x.x ou superior
  - Download: https://nodejs.org/

- [ ] **XAMPP instalado**
  - Teste: Abra o XAMPP Control Panel
  - Download: https://www.apachefriends.org/

- [ ] **MySQL rodando**
  - No XAMPP Control Panel, MySQL deve estar verde
  - Se não estiver, clique em "Start"

## 🗄️ Banco de Dados

- [ ] **Banco "worksdb" criado**
  - Acesse: http://localhost/phpmyadmin
  - Verifique se "worksdb" aparece na lista lateral

- [ ] **Tabelas criadas**
  - Clique em "worksdb"
  - Deve ter 3 tabelas: `users`, `developers`, `works`

- [ ] **Dados iniciais carregados**
  - Execute: `npm run test-db`
  - Deve mostrar registros nas tabelas

## 📦 Dependências do Projeto

- [ ] **Pasta node_modules existe**
  - Se não existir, execute: `npm install`

- [ ] **Arquivo .env existe**
  - Se não existir, copie `.env.example` para `.env`

- [ ] **Configurações do .env corretas**
  ```
  DB_HOST=localhost
  DB_USER=root
  DB_PASSWORD=
  DB_NAME=worksdb
  PORT=3001
  ```

## 🧪 Testes de Funcionamento

- [ ] **Teste de conexão com banco**
  ```bash
  npm run test-db
  ```
  - Deve mostrar: "✓ TESTE CONCLUÍDO COM SUCESSO!"

- [ ] **Backend inicia sem erros**
  ```bash
  npm run server
  ```
  - Deve mostrar: "Servidor rodando na porta 3001"
  - Pressione Ctrl+C para parar

- [ ] **Frontend inicia sem erros**
  ```bash
  npm run dev
  ```
  - Deve mostrar: "Local: http://localhost:5173"
  - Pressione Ctrl+C para parar

## 🚀 Inicialização Automática

- [ ] **Script iniciar-projeto.bat funciona**
  - Duplo clique em `iniciar-projeto.bat`
  - Deve abrir 2 janelas (Backend e Frontend)
  - Não deve mostrar erros

- [ ] **Sistema acessível no navegador**
  - Acesse: http://localhost:5173
  - Deve carregar a tela de login

## 🔐 Teste de Login

- [ ] **Login como Master funciona**
  - Usuário: `jvxadmin`
  - Senha: `admin123`
  - Deve entrar no dashboard

- [ ] **Login como Desenvolvedor funciona**
  - Usuário: `leandro.dev`
  - Senha: `dev123`
  - Deve entrar no dashboard

## ✨ Funcionalidades Básicas

### Como Master (jvxadmin)

- [ ] **Dashboard carrega estatísticas**
  - Deve mostrar gráficos e números

- [ ] **Página "Sites" carrega projetos**
  - Deve mostrar lista de projetos

- [ ] **Botão "Adicionar Trabalho" aparece**
  - No topo da página Sites

- [ ] **Pode adicionar novo projeto**
  - Clique em "Adicionar Trabalho"
  - Preencha o formulário
  - Salve com sucesso

### Como Desenvolvedor (leandro.dev)

- [ ] **Dashboard carrega estatísticas pessoais**
  - Deve mostrar apenas dados do Leandro

- [ ] **Página "Sites" mostra apenas projetos do Leandro**
  - Não deve ver projetos de outros devs

- [ ] **Botão "Adicionar Trabalho" NÃO aparece**
  - Apenas visualização

- [ ] **Botão de status funciona**
  - Pode marcar projetos como concluídos

## 🛑 Teste de Parada

- [ ] **Script parar-projeto.bat funciona**
  - Duplo clique em `parar-projeto.bat`
  - Deve fechar os servidores

- [ ] **Portas liberadas**
  - Execute novamente `iniciar-projeto.bat`
  - Deve iniciar sem erro de porta em uso

## 📊 Resultado Final

**Total de itens marcados: _____ / 28**

- ✅ **28/28**: Perfeito! Sistema 100% funcional
- ✅ **24-27**: Muito bom! Pequenos ajustes podem ser necessários
- ⚠️ **20-23**: Funcional, mas revise os itens não marcados
- ❌ **< 20**: Revise a instalação seguindo o guia COMO-USAR.md

## 🆘 Problemas Encontrados?

Se algum item não foi marcado, consulte:

1. **COMO-USAR.md** - Guia completo de instalação
2. **INICIO-RAPIDO.md** - Guia rápido de 3 passos
3. **README.md** - Documentação técnica

Ou execute os comandos de diagnóstico:

```bash
# Testar conexão
npm run test-db

# Verificar dados
npm run verify

# Popular banco novamente
npm run populate
```

---

**Data da verificação:** ___/___/______

**Verificado por:** _________________

**Observações:**
```
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________
```
