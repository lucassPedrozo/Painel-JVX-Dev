# 🚀 Guia Completo de Migração

Execute estas migrações para atualizar seu banco de dados com os novos recursos.

---

## 📋 Migrações Disponíveis

### 1. Campo `completed_at` (Data de Conclusão)
Registra quando um projeto foi marcado como concluído.

```bash
npm run migrate
```

### 2. Campo `template` (URL do Template)
Campo específico para armazenar URL do template utilizado.

```bash
npm run migrate-template
```

---

## ⚡ Executar Todas as Migrações

```bash
# Executar em sequência
npm run migrate && npm run migrate-template

# Testar se tudo está OK
npm run test-completed

# Reiniciar serviços
npm run server  # Terminal 1
npm run dev     # Terminal 2
```

---

## 🎯 O que cada migração faz?

### Migração 1: completed_at
- ✅ Adiciona coluna `completed_at` (TIMESTAMP NULL)
- ✅ Registra data/hora quando projeto é marcado como "Concluído"
- ✅ Limpa data quando volta para "Em Andamento"
- ✅ Tooltip mostra data ao passar mouse sobre "Concluído"

### Migração 2: template
- ✅ Adiciona coluna `template` (VARCHAR 500)
- ✅ Campo específico para URL do template
- ✅ Migra URLs existentes de `observations` para `template`
- ✅ Botão "Ver Template" na tabela

---

## 🔍 Verificar Status

```bash
# Verificar estrutura da tabela
npm run check-structure

# Testar completed_at
npm run test-completed

# Testar conexão geral
npm run test-xampp
```

---

## 📊 Estrutura Final da Tabela

```sql
works
├── id (INT)
├── developer (VARCHAR)
├── deadline_type (VARCHAR)
├── value (DECIMAL)
├── developer_status (VARCHAR)
├── completed_at (TIMESTAMP) ← NOVO
├── domain (VARCHAR)
├── site_type (VARCHAR)
├── template (VARCHAR) ← NOVO
├── delivery_date (DATE)
├── delivery_month (VARCHAR)
├── delivery_year (INT)
├── status (VARCHAR)
├── payment_status (VARCHAR)
├── observations (TEXT)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)
```

---

## ✅ Checklist Pós-Migração

- [ ] Migração `completed_at` executada
- [ ] Migração `template` executada
- [ ] Backend reiniciado
- [ ] Frontend reiniciado
- [ ] Testado: adicionar projeto com template
- [ ] Testado: marcar projeto como concluído
- [ ] Testado: tooltip mostra data de conclusão
- [ ] Testado: botão "Ver Template" funciona

---

## 🆘 Problemas?

### Erro: "Column already exists"
**Solução**: Migração já foi aplicada. Nenhuma ação necessária.

### Erro: "Table doesn't exist"
**Solução**: Execute primeiro `database-init-clean.sql`

### Erro: "Access denied"
**Solução**: Verifique credenciais no `.env`

---

## 📝 Rollback (Se Necessário)

```sql
-- Remover completed_at
ALTER TABLE works DROP COLUMN completed_at;

-- Remover template
ALTER TABLE works DROP COLUMN template;
```

**⚠️ Atenção**: Isso apagará todos os dados dessas colunas!

---

**JVX Desenvolvimento** 🚀
