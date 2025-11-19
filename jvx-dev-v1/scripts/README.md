# 🔧 Scripts Utilitários

Esta pasta contém scripts auxiliares para gerenciamento do banco de dados e importação de dados.

## 📜 Scripts Disponíveis

### 📥 importar-csv-direto.js
**Uso**: `npm run import`

Importa dados de um arquivo CSV diretamente no banco de dados.

**Características:**
- Importação em lote otimizada
- Validação de dados
- Tratamento de erros
- Progresso em tempo real
- Suporte a grandes volumes (100+ registros)

**Quando usar:**
- Importação inicial de dados
- Migração de dados de outro sistema
- Backup e restauração
- Grandes volumes de dados

**Arquivo CSV esperado:**
- Localização: `database/exemplo-importacao.csv`
- Formato: CSV com cabeçalho
- Encoding: UTF-8

---

### ✅ verificar-dados.js
**Uso**: `npm run verify`

Verifica a integridade e consistência dos dados no banco.

**O que verifica:**
- Total de registros
- Primeiros registros (amostra)
- Estatísticas gerais
- Distribuição por desenvolvedor
- Distribuição por ano
- Valores totais e médios

**Quando usar:**
- Após importação de dados
- Para auditoria de dados
- Verificação de integridade
- Análise rápida do banco

---

### 🔌 testar-conexao-db.js
**Uso**: `npm run test-db`

Testa a conexão com o banco de dados MySQL.

**O que testa:**
- Conexão com MySQL
- Existência do banco `worksdb`
- Tabelas criadas
- Contagem de registros por tabela

**Quando usar:**
- Antes de iniciar o projeto
- Após configurar o .env
- Para diagnosticar problemas de conexão
- Verificar se o MySQL está rodando

---

### 🎲 popular-banco-completo.js
**Uso**: `npm run populate`

Popula o banco de dados com dados de exemplo para desenvolvimento e testes.

**O que cria:**
- Usuários de exemplo (master e desenvolvedores)
- Desenvolvedores com informações completas
- Projetos de exemplo (2024 e 2025)
- Diferentes status de projetos
- Dados realistas para testes

**Dados criados:**
- 3 usuários (1 master + 2 desenvolvedores)
- 3 desenvolvedores cadastrados
- ~13 projetos de exemplo
- Projetos com diferentes status

**Quando usar:**
- Primeira configuração do projeto
- Ambiente de desenvolvimento
- Testes de funcionalidades
- Demonstrações

**⚠️ Atenção:** Este script limpa os dados existentes antes de popular!

---

## 🚀 Como Usar

### Execução via NPM (Recomendado)
```bash
# Importar CSV
npm run import

# Verificar dados
npm run verify

# Testar conexão
npm run test-db

# Popular banco
npm run populate
```

### Execução Direta
```bash
# Importar CSV
node scripts/importar-csv-direto.js

# Verificar dados
node scripts/verificar-dados.js

# Testar conexão
node scripts/testar-conexao-db.js

# Popular banco
node scripts/popular-banco-completo.js
```

## 📋 Pré-requisitos

Todos os scripts requerem:
- Node.js instalado
- MySQL rodando
- Arquivo `.env` configurado
- Dependências instaladas (`npm install`)

## ⚙️ Configuração

Os scripts usam as variáveis de ambiente do arquivo `.env`:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=sua_senha
DB_NAME=worksdb
```

## 🔄 Fluxo Recomendado

### Primeira Instalação
1. `npm run test-db` - Verificar conexão
2. `npm run populate` - Popular com dados de exemplo
3. `npm run verify` - Verificar dados criados

### Importação de Dados Reais
1. `npm run test-db` - Verificar conexão
2. Colocar CSV em `public/`
3. `npm run import` - Importar dados
4. `npm run verify` - Verificar importação

### Manutenção
1. `npm run verify` - Verificar estado atual
2. `npm run test-db` - Testar conexão periodicamente

## 🐛 Solução de Problemas

### Erro: "Banco de dados não encontrado"
```bash
# Criar banco manualmente
mysql -u root -p < database/database-init-clean.sql
```

### Erro: "Conexão recusada"
- Verificar se MySQL está rodando
- Verificar credenciais no `.env`
- Verificar porta 3306

### Erro: "Arquivo CSV não encontrado"
- Verificar se o arquivo está em `public/`
- Verificar nome do arquivo
- Verificar encoding (UTF-8)

### Erro: "Permissão negada"
- Verificar permissões do usuário MySQL
- Verificar se o usuário tem acesso ao banco

## 📊 Formato do CSV

Para o script de importação, o CSV deve ter o seguinte formato:

```csv
Desenvolvedor,Prazo,Valor R$,Domínio Desenvolvimento,Tipo de Site,Data Entrega,Mês,Ano,Status,Pagamento,OBS ou Template
Alexandre,Normal,"R$ 200,00",exemplo.com.br,Site Institucional,01/04/2024,Abril,2024,Entregue,Pago,Observações aqui
```

**Campos:**
1. Desenvolvedor (obrigatório)
2. Prazo: "Normal" ou "Prazo Reduzido"
3. Valor R$: formato "R$ 200,00"
4. Domínio (obrigatório)
5. Tipo de Site
6. Data Entrega: DD/MM/YYYY
7. Mês: nome do mês
8. Ano: YYYY
9. Status: "Entregue" ou "Não Entregue"
10. Pagamento: "Pago" ou "Não Pago"
11. Observações: texto livre

## 🔒 Segurança

- Scripts usam conexões seguras com o banco
- Senhas são criptografadas com bcrypt
- Validação de dados antes de inserir
- Transações para garantir integridade

## 📝 Logs

Todos os scripts exibem logs detalhados:
- ✅ Operações bem-sucedidas
- ❌ Erros encontrados
- 📊 Estatísticas e contadores
- ⚠️ Avisos importantes

## 🔗 Links Relacionados

- [Documentação Principal](../README.md)
- [Estrutura do Banco](../database/)
- [Documentação Completa](../docs/)

---

**Última Atualização**: Novembro 2025  
**Versão**: 2.0.0
