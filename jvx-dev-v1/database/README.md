# 🗄️ Banco de Dados

Esta pasta contém os scripts SQL para inicialização e gerenciamento do banco de dados.

## 📄 Arquivos

### database-init-clean.sql
Script de inicialização completo do banco de dados.

**O que este script faz:**
- Cria o banco de dados `worksdb`
- Cria todas as tabelas necessárias
- Define estrutura e relacionamentos
- Cria usuário master padrão
- Configura charset UTF-8

## 🗃️ Estrutura do Banco

### Banco de Dados
- **Nome**: `worksdb`
- **Charset**: `utf8mb4`
- **Collation**: `utf8mb4_unicode_ci`

### Tabelas

#### 1. `users` - Usuários do Sistema
Armazena os usuários que podem acessar o sistema.

**Campos:**
- `id` (INT, AUTO_INCREMENT, PRIMARY KEY)
- `username` (VARCHAR(50), UNIQUE) - Nome de usuário
- `password` (VARCHAR(255)) - Senha criptografada (bcrypt)
- `role` (ENUM: 'master', 'standard') - Nível de acesso
- `developer_name` (VARCHAR(100), NULL) - Nome do desenvolvedor associado
- `active` (BOOLEAN, DEFAULT TRUE) - Status ativo/inativo
- `created_at` (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)

**Índices:**
- PRIMARY KEY (`id`)
- UNIQUE KEY (`username`)
- INDEX (`role`)

**Usuário Padrão:**
- Username: `jvxadmin`
- Password: `admin123` (criptografado)
- Role: `master`

---

#### 2. `developers` - Desenvolvedores
Armazena informações detalhadas dos desenvolvedores.

**Campos:**
- `id` (INT, AUTO_INCREMENT, PRIMARY KEY)
- `name` (VARCHAR(100), UNIQUE) - Nome do desenvolvedor
- `phone` (VARCHAR(20)) - Telefone
- `email` (VARCHAR(100)) - Email
- `whatsapp` (VARCHAR(20)) - WhatsApp
- `pixKey` (VARCHAR(100)) - Chave PIX
- `pixType` (VARCHAR(20)) - Tipo de chave PIX
- `bankName` (VARCHAR(100)) - Nome do banco
- `agency` (VARCHAR(20)) - Agência
- `account` (VARCHAR(20)) - Conta
- `observations` (TEXT) - Observações
- `created_at` (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)
- `updated_at` (TIMESTAMP, ON UPDATE CURRENT_TIMESTAMP)

**Índices:**
- PRIMARY KEY (`id`)
- UNIQUE KEY (`name`)

---

#### 3. `works` - Projetos
Armazena todos os projetos de desenvolvimento.

**Campos:**
- `id` (INT, AUTO_INCREMENT, PRIMARY KEY)
- `developer` (VARCHAR(100)) - Nome do desenvolvedor
- `deadline_type` (VARCHAR(50)) - Tipo de prazo
- `value` (DECIMAL(10,2)) - Valor do projeto
- `domain` (VARCHAR(255)) - Domínio/URL
- `site_type` (VARCHAR(100)) - Tipo de site
- `template` (VARCHAR(500), NULL) - URL do template
- `delivery_date` (DATE) - Data de entrega
- `delivery_month` (VARCHAR(20)) - Mês da entrega
- `delivery_year` (INT) - Ano da entrega
- `status` (ENUM: 'Entregue', 'Não Entregue') - Status de entrega
- `developer_status` (ENUM: 'Em Andamento', 'Concluído') - Status do desenvolvedor
- `completed_at` (TIMESTAMP, NULL) - Data/hora de conclusão
- `payment_status` (ENUM: 'Pago', 'Não Pago') - Status de pagamento
- `observations` (TEXT) - Observações
- `created_at` (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)
- `updated_at` (TIMESTAMP, ON UPDATE CURRENT_TIMESTAMP)

**Índices:**
- PRIMARY KEY (`id`)
- INDEX (`developer`)
- INDEX (`delivery_date`)
- INDEX (`status`)
- INDEX (`payment_status`)
- INDEX (`developer_status`)

---

## 🚀 Como Usar

### Método 1: MySQL CLI
```bash
# Conectar ao MySQL
mysql -u root -p

# Executar script
source database/database-init-clean.sql

# Ou em uma linha
mysql -u root -p < database/database-init-clean.sql
```

### Método 2: phpMyAdmin (XAMPP)
1. Acesse http://localhost/phpmyadmin
2. Clique na aba "SQL"
3. Copie e cole o conteúdo de `database-init-clean.sql`
4. Clique em "Executar"

### Método 3: MySQL Workbench
1. Abra o MySQL Workbench
2. Conecte ao servidor
3. File → Open SQL Script
4. Selecione `database-init-clean.sql`
5. Execute (⚡ ícone de raio)

## 🔄 Relacionamentos

```
users
  └─ developer_name → developers.name (soft reference)

works
  └─ developer → developers.name (soft reference)
```

**Nota:** Os relacionamentos são "soft" (não há FOREIGN KEY), permitindo maior flexibilidade.

## 📊 Diagrama ER Simplificado

```
┌─────────────┐
│    users    │
├─────────────┤
│ id          │
│ username    │
│ password    │
│ role        │
│ dev_name    │──┐
└─────────────┘  │
                 │
                 ▼
┌─────────────────┐
│   developers    │
├─────────────────┤
│ id              │
│ name            │◄──┐
│ phone           │   │
│ email           │   │
│ pix_info        │   │
│ bank_info       │   │
└─────────────────┘   │
                      │
┌─────────────────┐   │
│     works       │   │
├─────────────────┤   │
│ id              │   │
│ developer       │───┘
│ value           │
│ domain          │
│ delivery_date   │
│ status          │
│ payment_status  │
└─────────────────┘
```

## 🔒 Segurança

### Senhas
- Todas as senhas são criptografadas com **bcrypt**
- Salt rounds: 10
- Nunca armazene senhas em texto plano

### Usuários
- Usuário master tem acesso total
- Usuário standard tem acesso limitado
- Controle de acesso por role

### Conexão
- Use sempre variáveis de ambiente
- Não commite credenciais no Git
- Use SSL em produção

## 🛠️ Manutenção

### Backup
```bash
# Backup completo
mysqldump -u root -p worksdb > backup_$(date +%Y%m%d).sql

# Backup apenas estrutura
mysqldump -u root -p --no-data worksdb > structure.sql

# Backup apenas dados
mysqldump -u root -p --no-create-info worksdb > data.sql
```

### Restauração
```bash
# Restaurar backup
mysql -u root -p worksdb < backup_20251106.sql
```

### Limpeza
```bash
# Limpar apenas dados (manter estrutura)
mysql -u root -p worksdb -e "
  DELETE FROM works;
  DELETE FROM developers;
  DELETE FROM users WHERE username != 'jvxadmin';
"
```

## 📈 Otimização

### Índices Criados
- Índices em campos de busca frequente
- Índices em campos de filtro
- Índices em campos de ordenação

### Performance
- Use EXPLAIN para analisar queries
- Monitore queries lentas
- Considere particionamento para grandes volumes

## 🔍 Queries Úteis

### Estatísticas Gerais
```sql
SELECT 
  COUNT(*) as total_projetos,
  SUM(CASE WHEN status = 'Entregue' THEN 1 ELSE 0 END) as entregues,
  SUM(CASE WHEN payment_status = 'Pago' THEN 1 ELSE 0 END) as pagos,
  SUM(value) as valor_total
FROM works;
```

### Por Desenvolvedor
```sql
SELECT 
  developer,
  COUNT(*) as total,
  SUM(value) as valor_total,
  AVG(value) as valor_medio
FROM works
GROUP BY developer
ORDER BY total DESC;
```

### Projetos Pendentes
```sql
SELECT * FROM works 
WHERE status = 'Não Entregue' 
  OR payment_status = 'Não Pago'
ORDER BY delivery_date;
```

## 🐛 Solução de Problemas

### Erro: "Database already exists"
```sql
DROP DATABASE IF EXISTS worksdb;
-- Depois execute o script novamente
```

### Erro: "Access denied"
```sql
-- Verificar permissões
SHOW GRANTS FOR 'root'@'localhost';

-- Conceder permissões
GRANT ALL PRIVILEGES ON worksdb.* TO 'root'@'localhost';
FLUSH PRIVILEGES;
```

### Erro: "Table doesn't exist"
```bash
# Recriar estrutura
mysql -u root -p < database/database-init-clean.sql
```

## 📝 Changelog

### v2.0.0 (Novembro 2025)
- ✅ Estrutura inicial completa
- ✅ Tabelas: users, developers, works
- ✅ Índices otimizados
- ✅ Usuário master padrão
- ✅ Charset UTF-8
- ✅ Campos de timestamp automáticos

## 🔗 Links Relacionados

- [Scripts Utilitários](../scripts/)
- [Documentação Principal](../README.md)
- [Guia de Início Rápido](../docs/INICIO-RAPIDO.md)

---

**Última Atualização**: Novembro 2025  
**Versão**: 2.0.0
