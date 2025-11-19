# 📦 Scripts Utilitários

Scripts organizados por categoria para facilitar o gerenciamento do projeto.

---

## 📁 Estrutura

```
scripts/
├── database/              # Scripts de banco de dados
│   ├── testar-conexao-db.js      # Testa conexão com MySQL
│   ├── popular-banco-completo.js # Popula banco com dados de exemplo
│   └── verificar-dados.js        # Verifica integridade dos dados
├── import/                # Scripts de importação
│   └── importar-csv-direto.js    # Importa dados de CSV
└── test/                  # Scripts de teste
    └── testar-api.js             # Testa endpoints da API
```

---

## 🗄️ Scripts de Banco de Dados

### testar-conexao-db.js
Testa a conexão com o banco de dados MySQL e verifica a estrutura.

```bash
npm run test-db
```

**O que faz:**
- Testa conexão com MySQL
- Lista bancos de dados disponíveis
- Verifica se o banco `worksdb` existe
- Lista tabelas e contagem de registros

---

### popular-banco-completo.js
Popula o banco de dados com dados de exemplo para testes.

```bash
npm run populate
```

**O que faz:**
- Limpa tabelas existentes
- Cria usuários de teste (jvxadmin, leandro.dev, heron.dev)
- Cria desenvolvedores de exemplo
- Insere projetos de exemplo (2024 e 2025)
- Exibe estatísticas finais

**Usuários criados:**
- Master: jvxadmin / admin123
- Dev: leandro.dev / dev123
- Dev: heron.dev / dev123

---

### verificar-dados.js
Verifica a integridade e exibe estatísticas dos dados no banco.

```bash
npm run verify
```

**O que faz:**
- Conta total de registros
- Exibe primeiros 5 registros
- Mostra estatísticas gerais (entregues, pagos, valores)
- Lista top 10 desenvolvedores
- Agrupa projetos por ano

---

## 📥 Scripts de Importação

### importar-csv-direto.js
Importa dados de arquivo CSV diretamente no banco de dados.

```bash
npm run import
```

**O que faz:**
- Lê arquivo `database/exemplo-importacao.csv`
- Valida formato dos dados
- Limpa tabela works (opcional)
- Importa registros com validação
- Exibe progresso e erros
- Mostra estatísticas finais

**Formato do CSV:**
```csv
Desenvolvedor,Prazo,Valor R$,Domínio Desenvolvimento,Tipo de Site,Data Entrega,Mês,Ano,Status,Pagamento,OBS ou Template
Alexandre,Normal,"R$ 200,00",exemplo.com.br,Site Institucional,01/04/2024,Abril,2024,Entregue,Pago,
```

---

## 🧪 Scripts de Teste

### testar-api.js
Testa os endpoints da API REST.

```bash
npm run test-api
```

**O que faz:**
- Testa endpoint de login
- Valida token JWT
- Testa busca de projetos
- Exibe dados do primeiro projeto

**Pré-requisito:** O servidor deve estar rodando (`npm run server`)

---

## 🔧 Como Usar

### Executar via npm
```bash
# Testar conexão
npm run test-db

# Popular banco
npm run populate

# Verificar dados
npm run verify

# Importar CSV
npm run import

# Testar API
npm run test-api
```

### Executar diretamente
```bash
# Testar conexão
node scripts/database/testar-conexao-db.js

# Popular banco
node scripts/database/popular-banco-completo.js

# Verificar dados
node scripts/database/verificar-dados.js

# Importar CSV
node scripts/import/importar-csv-direto.js

# Testar API
node scripts/test/testar-api.js
```

---

## ⚙️ Configuração

Todos os scripts utilizam as variáveis de ambiente do arquivo `.env`:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=worksdb
PORT=3001
JWT_SECRET=sua_chave_secreta
```

---

## 🐛 Solução de Problemas

### Erro: "Cannot find module"
```bash
npm install
```

### Erro: "Connection refused"
- Verifique se o MySQL está rodando (XAMPP)
- Confirme as credenciais no `.env`

### Erro: "Database not found"
```bash
# Execute o script de inicialização:
mysql -u root -p < database/database-init-clean.sql
```

---

## 📝 Notas

- Todos os scripts usam ES Modules (`import/export`)
- Requerem Node.js ≥16.0.0
- Utilizam `dotenv` para variáveis de ambiente
- Exibem mensagens coloridas e formatadas no console

---

Para mais informações, consulte a [documentação completa](../docs/GUIA-COMPLETO.md).
