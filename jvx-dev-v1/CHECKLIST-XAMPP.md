# ✅ Checklist de Instalação - XAMPP

Use este checklist para garantir que tudo está configurado corretamente.

---

## 📋 Pré-Instalação

- [ ] **XAMPP instalado**
  - Download: https://www.apachefriends.org/
  - Versão: 8.0 ou superior
  - Localização: `C:\xampp` (padrão)

- [ ] **Node.js instalado**
  - Download: https://nodejs.org/
  - Versão: 16.0 ou superior
  - Verificar: `node --version`

---

## 🔧 Configuração XAMPP

- [ ] **XAMPP Control Panel aberto**
  - Localização: `C:\xampp\xampp-control.exe`

- [ ] **MySQL iniciado**
  - Status: Verde ✅
  - Porta: 3306
  - Botão: "Start" clicado

- [ ] **phpMyAdmin acessível**
  - URL: http://localhost/phpmyadmin
  - Carrega sem erros

---

## 🗄️ Banco de Dados

- [ ] **Script SQL executado**
  - Arquivo: `database-init-clean.sql`
  - Método: phpMyAdmin → SQL → Executar

- [ ] **Banco criado**
  - Nome: `worksdb`
  - Visível no phpMyAdmin

- [ ] **Tabelas criadas**
  - [ ] `users` (1 registro)
  - [ ] `developers` (0 registros)
  - [ ] `works` (0 registros)

- [ ] **Usuário master criado**
  - Username: `jvxadmin`
  - Senha: `admin123`
  - Role: `master`

---

## 📦 Projeto

- [ ] **Pasta do projeto**
  - Localização conhecida
  - Exemplo: `C:\projetos\jvx-dev-v1`

- [ ] **Dependências instaladas**
  - Comando: `npm install`
  - Pasta `node_modules` criada
  - Sem erros

- [ ] **Arquivo .env criado**
  - Existe na raiz do projeto
  - Configurações corretas:
    ```
    DB_HOST=localhost
    DB_USER=root
    DB_PASSWORD=
    DB_NAME=worksdb
    PORT=3001
    ```

---

## 🧪 Testes

- [ ] **Teste de conexão**
  - Comando: `npm run test-xampp`
  - Resultado: ✅ TUDO OK!

- [ ] **Backend inicia**
  - Comando: `npm run server`
  - Mensagem: "Servidor rodando na porta 3001"
  - Sem erros

- [ ] **Frontend inicia**
  - Comando: `npm run dev` (novo terminal)
  - Mensagem: "Local: http://localhost:5173"
  - Sem erros

---

## 🌐 Acesso ao Sistema

- [ ] **Navegador aberto**
  - URL: http://localhost:5173
  - Página carrega

- [ ] **Login funciona**
  - Usuário: `jvxadmin`
  - Senha: `admin123`
  - Redireciona para dashboard

- [ ] **Dashboard carrega**
  - Sem erros no console (F12)
  - Cards de estatísticas visíveis
  - Menu de navegação funcional

---

## 🔐 Segurança

- [ ] **Senha alterada**
  - Menu: Gerenciar Usuários
  - Usuário: `jvxadmin`
  - Nova senha definida

- [ ] **JWT Secret alterado**
  - Arquivo: `.env`
  - Variável: `JWT_SECRET`
  - Valor único e longo

---

## 📊 Dados (Opcional)

- [ ] **CSV importado**
  - Via: Configurações → Importar CSV
  - Ou: `npm run import`
  - Projetos visíveis na página "Projetos"

- [ ] **Desenvolvedores cadastrados**
  - Via: Equipe → Adicionar Desenvolvedor
  - Informações de pagamento preenchidas

---

## ✅ Verificação Final

- [ ] **Sistema totalmente funcional**
  - [ ] Login/Logout
  - [ ] Dashboard com estatísticas
  - [ ] Página Projetos
  - [ ] Adicionar projeto
  - [ ] Editar projeto
  - [ ] Deletar projeto
  - [ ] Filtros funcionando
  - [ ] Exportar CSV/PDF
  - [ ] Página Análises
  - [ ] Página Calendário
  - [ ] Página Equipe
  - [ ] Página Relatórios
  - [ ] Página Configurações

---

## 🎉 Conclusão

Se todos os itens estão marcados, seu sistema está **100% funcional**!

### Próximos Passos:
1. ✅ Alterar senha padrão
2. ✅ Criar usuários para equipe
3. ✅ Importar dados existentes
4. ✅ Começar a usar!

---

## 🆘 Problemas?

Se algum item não está marcado, consulte:
- **SETUP-XAMPP.md** - Guia completo
- **INICIO-RAPIDO-XAMPP.md** - Guia rápido
- Seção "Solução de Problemas" no SETUP-XAMPP.md

---

**Data da instalação**: ___/___/______

**Instalado por**: _____________________

**Notas**: 
_____________________________________________
_____________________________________________
_____________________________________________

---

**JVX Desenvolvimento** 🚀
