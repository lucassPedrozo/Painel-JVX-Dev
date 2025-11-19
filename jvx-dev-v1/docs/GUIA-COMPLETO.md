# 📚 Guia Completo - JVX Desenvolvimento

## 🎯 Início Rápido

### Instalação em 3 Passos

1. **Instale as dependências**
   - Node.js ≥16.0.0: https://nodejs.org/
   - XAMPP (MySQL): https://www.apachefriends.org/

2. **Configure o banco de dados**
   ```bash
   # Acesse phpMyAdmin: http://localhost/phpmyadmin
   # Crie o banco 'worksdb'
   # Execute o script: database/database-init-clean.sql
   ```

3. **Inicie o projeto**
   ```bash
   # Duplo clique em: bin/iniciar-projeto.bat
   # Ou execute: npm start
   ```

Acesse: http://localhost:5173
Login: jvxadmin / admin123

---

## 📦 Estrutura do Projeto

```
jvx-dev-v1/
├── bin/                        # Scripts executáveis
│   ├── iniciar-projeto.bat    # Inicia o sistema
│   ├── parar-projeto.bat      # Para o sistema
│   └── diagnostico.bat        # Diagnóstico do sistema
├── database/                   # Banco de dados
│   ├── database-init-clean.sql # Script de inicialização
│   ├── exemplo-importacao.csv  # Exemplo de CSV
│   └── README.md
├── docs/                       # Documentação
│   ├── GUIA-COMPLETO.md       # Este arquivo
│   ├── GUIA-INICIO-RAPIDO.md  # Guia rápido
│   └── ARQUITETURA.md         # Arquitetura técnica
├── scripts/                    # Scripts utilitários
│   ├── database/              # Scripts de banco
│   │   ├── testar-conexao-db.js
│   │   ├── popular-banco-completo.js
│   │   └── verificar-dados.js
│   ├── import/                # Scripts de importação
│   │   └── importar-csv-direto.js
│   └── test/                  # Scripts de teste
│       └── testar-api.js
├── src/                        # Código fonte frontend
│   ├── components/            # Componentes React
│   ├── contexts/              # Contextos
│   ├── hooks/                 # Custom hooks
│   ├── lib/                   # Utilitários
│   ├── pages/                 # Páginas
│   └── types/                 # Tipos TypeScript
├── .env.example               # Exemplo de variáveis
├── package.json               # Dependências
├── server.js                  # Backend Express
├── vite.config.ts             # Configuração Vite
└── README.md                  # Visão geral
```

---

## 🛠️ Comandos Disponíveis

### Desenvolvimento
```bash
npm run dev          # Inicia frontend (Vite)
npm run server       # Inicia backend (Express)
npm start            # Inicia ambos simultaneamente
```

### Build e Deploy
```bash
npm run build        # Build de produção
npm run preview      # Preview do build
npm run lint         # Executa ESLint
```

### Banco de Dados
```bash
npm run test-db      # Testa conexão com banco
npm run populate     # Popula banco com dados de exemplo
npm run verify       # Verifica integridade dos dados
npm run import       # Importa dados de CSV
```

### Testes
```bash
npm run test-api     # Testa endpoints da API
```

---

## 🔧 Configuração

### Variáveis de Ambiente (.env)

```env
# Banco de Dados
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=worksdb

# Servidor
PORT=3001

# JWT
JWT_SECRET=sua_chave_secreta_aqui

# CORS
CORS_ORIGIN=http://localhost:5173

# Frontend
VITE_API_URL=http://localhost:3001
```

### Banco de Dados

O script `database/database-init-clean.sql` cria:
- Banco de dados `worksdb`
- Tabela `users` (usuários do sistema)
- Tabela `developers` (desenvolvedores)
- Tabela `works` (projetos)
- Usuário master padrão: jvxadmin / admin123

---

## 👥 Usuários e Permissões

### Master (Administrador)
- Acesso total ao sistema
- Gerenciar todos os projetos
- Criar/editar/deletar usuários
- Importar/exportar dados
- Limpar banco de dados

### Standard (Desenvolvedor)
- Ver apenas seus próprios projetos
- Marcar projetos como concluídos
- Ver estatísticas pessoais
- Não pode gerenciar usuários

---

## 📥 Importação de Dados

### Via Interface Web
1. Acesse **Configurações**
2. Clique em **Importar CSV**
3. Selecione o arquivo CSV
4. Aguarde a importação

### Via Script (Recomendado para grandes volumes)
```bash
npm run import
```

### Formato do CSV
```csv
Desenvolvedor,Prazo,Valor R$,Domínio Desenvolvimento,Tipo de Site,Data Entrega,Mês,Ano,Status,Pagamento,OBS ou Template
Alexandre,Normal,"R$ 200,00",exemplo.com.br,Site Institucional,01/04/2024,Abril,2024,Entregue,Pago,
```

---

## 🐛 Solução de Problemas

### Erro: "Banco de dados não encontrado"
```bash
# Acesse phpMyAdmin e execute:
# database/database-init-clean.sql
```

### Erro: "Conexão recusada"
- Verifique se o MySQL está rodando no XAMPP
- Confirme as credenciais no `.env`
- Teste: `npm run test-db`

### Erro: "Porta em uso"
```bash
# Para todos os processos Node.js:
bin/parar-projeto.bat
# Ou: taskkill /F /IM node.exe
```

### Dados não aparecem
```bash
# Verifique se há dados no banco:
npm run verify

# Popule com dados de exemplo:
npm run populate
```

---

## 🚀 Deploy para Produção

### 1. Build
```bash
npm run build
```

### 2. Configurar Variáveis de Ambiente
```env
DB_HOST=seu_host_mysql
DB_USER=seu_usuario
DB_PASSWORD=sua_senha_forte
DB_NAME=worksdb
PORT=3001
JWT_SECRET=chave_secreta_forte_e_unica
CORS_ORIGIN=https://seu-dominio.com
VITE_API_URL=https://api.seu-dominio.com
```

### 3. Deploy
- Frontend: Pasta `dist/` para serviço de hospedagem estática
- Backend: `server.js` para serviço Node.js

---

## 📊 Tecnologias

### Frontend
- React 19.1.1 + TypeScript 5.8.3
- Vite 7.1.2
- TailwindCSS 4.1.12
- Radix UI + Shadcn/ui
- TanStack Query 5.90.5
- React Router DOM 7.8.2
- Recharts 2.15.4

### Backend
- Node.js ≥16.0.0
- Express 5.1.0
- MySQL/MariaDB
- JWT + bcrypt
- CORS

---

## 📄 Licença

MIT License - Veja [LICENSE](../LICENSE) para detalhes.

---

## 📞 Suporte

Para suporte, consulte:
- [GUIA-INICIO-RAPIDO.md](GUIA-INICIO-RAPIDO.md) - Guia rápido
- [ARQUITETURA.md](ARQUITETURA.md) - Documentação técnica
- [README.md](../README.md) - Visão geral do projeto

---

Desenvolvido com ❤️ por JVX Desenvolvimento
