# Backend - Gerador de Link para Senhas

Documentação completa do backend da ferramenta de geração de links seguros para compartilhamento de senhas.

## 📋 Índice

- [Arquitetura](#arquitetura)
- [Banco de Dados](#banco-de-dados)
- [Endpoints](#endpoints)
- [Integração OneTimeSecret](#integração-onetimesecret)
- [Segurança](#segurança)
- [Auditoria](#auditoria)
- [Testes](#testes)

## 🏗️ Arquitetura

O backend utiliza:
- **Node.js + Express** para a API REST
- **MySQL** para persistência de dados
- **OneTimeSecret** como serviço externo de criptografia
- **JWT** para autenticação
- **bcrypt** para hash de senhas dos usuários

### Fluxo de Dados

```
Frontend → Backend API → OneTimeSecret API
                ↓
         MySQL (Auditoria)
```

## 🗄️ Banco de Dados

### Tabela: `password_history`

Armazena histórico de mensagens reutilizáveis por usuário.

```sql
CREATE TABLE password_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  mensagem TEXT NOT NULL,
  timestamp BIGINT NOT NULL,
  fixada BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_timestamp (user_id, timestamp DESC)
);
```

**Campos:**
- `id`: Identificador único
- `user_id`: Referência ao usuário (FK)
- `mensagem`: Texto da mensagem
- `timestamp`: Timestamp em millisegundos
- `fixada`: Se a mensagem está fixada no topo
- `created_at`: Data de criação

### Tabela: `password_links_audit`

Registra todos os links gerados para auditoria e rastreabilidade.

```sql
CREATE TABLE password_links_audit (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  username VARCHAR(50) NOT NULL,
  link_acesso VARCHAR(500) NOT NULL,
  login_compartilhado VARCHAR(255) NOT NULL,
  mensagem TEXT,
  tempo_expiracao VARCHAR(10),
  secret_key VARCHAR(100) NOT NULL,
  link_gerado VARCHAR(500) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_created (user_id, created_at DESC),
  INDEX idx_secret_key (secret_key)
);
```

**Campos:**
- `id`: Identificador único
- `user_id`: Usuário que gerou o link
- `username`: Nome do usuário (para consultas rápidas)
- `link_acesso`: URL compartilhada
- `login_compartilhado`: Login/usuário compartilhado
- `mensagem`: Mensagem adicional opcional
- `tempo_expiracao`: Tempo configurado (1h, 24h, etc)
- `secret_key`: Chave do OneTimeSecret
- `link_gerado`: URL completa do link seguro
- `created_at`: Data/hora de criação

## 🔌 Endpoints

### 1. GET `/ferramentas/historico-senhas`

Busca histórico de mensagens do usuário autenticado.

**Autenticação:** Requerida (JWT)

**Resposta:**
```json
[
  {
    "id": "1",
    "mensagem": "Acesso para homologação",
    "timestamp": 1708290000000,
    "fixada": true
  }
]
```

**Comportamento:**
- Cria a tabela `password_history` se não existir
- Retorna até 5 mensagens
- Mensagens fixadas aparecem primeiro
- Ordenado por timestamp DESC

---

### 2. POST `/ferramentas/historico-senhas`

Salva histórico de mensagens do usuário.

**Autenticação:** Requerida (JWT)

**Body:**
```json
{
  "historico": [
    {
      "id": "1",
      "mensagem": "Texto da mensagem",
      "timestamp": 1708290000000,
      "fixada": false
    }
  ]
}
```

**Resposta:**
```json
{
  "success": true,
  "message": "Histórico salvo com sucesso"
}
```

**Comportamento:**
- Remove histórico anterior do usuário
- Insere novo histórico completo
- Limite de 5 mensagens (controlado pelo frontend)

---

### 3. POST `/ferramentas/gerar-link-senha`

Gera link seguro via OneTimeSecret.

**Autenticação:** Requerida (JWT)

**Body:**
```json
{
  "linkAcesso": "https://exemplo.com/admin",
  "login": "admin@exemplo.com",
  "senha": "SenhaSegura123!",
  "mensagem": "Acesso temporário",
  "tempoExpiracao": "24h"
}
```

**Campos obrigatórios:**
- `linkAcesso`: URL do sistema (string não vazia)
- `login`: Login/usuário (string não vazia)
- `senha`: Senha (string não vazia)
- `tempoExpiracao`: Tempo de validade

**Tempos de expiração válidos:**
- `1h`: 1 hora (3600 segundos)
- `6h`: 6 horas (21600 segundos)
- `12h`: 12 horas (43200 segundos)
- `24h`: 24 horas (86400 segundos) - **padrão**
- `48h`: 48 horas (172800 segundos)
- `7d`: 7 dias (604800 segundos)

**Resposta de Sucesso:**
```json
{
  "success": true,
  "linkSeguro": "https://onetimesecret.com/secret/abc123xyz",
  "secret_key": "abc123xyz",
  "expiracao": "24h",
  "metadata": {
    "created": "2026-02-18T10:30:00.000Z",
    "ttl_seconds": 86400
  }
}
```

**Resposta de Erro:**
```json
{
  "error": "Link de acesso é obrigatório"
}
```

**Comportamento:**
- Valida todos os campos obrigatórios
- Formata conteúdo com emojis e informações
- Chama API do OneTimeSecret
- Salva em `password_links_audit` para auditoria
- Retorna link gerado

**Formato do conteúdo enviado ao OneTimeSecret:**
```
🔐 Credenciais de Acesso

📍 Link: https://exemplo.com/admin
👤 Login: admin@exemplo.com
🔑 Senha: SenhaSegura123!

📝 Mensagem: Acesso temporário

---
⚠️ Este link expira automaticamente e só pode ser visualizado UMA vez.
🔒 Gerado através do sistema JVX em 18/02/2026 10:30:00
```

---

### 4. GET `/ferramentas/historico-links-gerados`

Busca histórico de links gerados (auditoria).

**Autenticação:** Requerida (JWT)

**Permissões:**
- **Master**: Vê todos os links (últimos 50)
- **Standard**: Vê apenas os próprios (últimos 20)

**Resposta (Master):**
```json
[
  {
    "id": 1,
    "username": "jvxadmin",
    "linkAcesso": "https://exemplo.com",
    "login": "admin",
    "mensagem": "Teste",
    "tempoExpiracao": "24h",
    "secretKey": "abc123",
    "createdAt": "2026-02-18T10:30:00.000Z"
  }
]
```

**Resposta (Standard):**
```json
[
  {
    "id": 1,
    "linkAcesso": "https://exemplo.com",
    "login": "admin",
    "mensagem": "Teste",
    "tempoExpiracao": "24h",
    "secretKey": "abc123",
    "createdAt": "2026-02-18T10:30:00.000Z"
  }
]
```

## 🔐 Integração OneTimeSecret

### API Endpoint
```
POST https://onetimesecret.com/api/v1/share
```

### Parâmetros
```
Content-Type: application/x-www-form-urlencoded

secret: <conteúdo criptografado>
ttl: <tempo em segundos>
```

### Resposta
```json
{
  "secret_key": "abc123xyz",
  "metadata_key": "def456uvw",
  "ttl": 86400
}
```

### Link Gerado
```
https://onetimesecret.com/secret/{secret_key}
```

### Características
- ✅ Uso único: Link se auto-destrói após visualização
- ✅ Expiração: Link expira após TTL configurado
- ✅ Sem cadastro: API pública gratuita
- ✅ Criptografia: AES-256-CBC
- ✅ HTTPS: Sempre criptografado em trânsito

## 🔒 Segurança

### Autenticação
- Todos os endpoints requerem JWT válido
- Token verificado via middleware `authenticateToken`
- Sessão única por usuário (invalidação remota)

### Validações
- Campos obrigatórios verificados
- Sanitização de entradas
- Limite de tamanho dos campos
- Validação de formato de tempo de expiração

### Auditoria
- Todos os links gerados são registrados
- Rastreamento por usuário e timestamp
- Secret key armazenada para referência
- Não armazena senha em texto plano (apenas no OneTimeSecret)

### Boas Práticas
- ✅ Senhas NUNCA são armazenadas no banco
- ✅ Links são de uso único
- ✅ Expiração automática
- ✅ Logging de ações
- ✅ Segregação por usuário

## 📊 Auditoria

### Dados Registrados
Para cada link gerado, o sistema registra:
- Usuário que gerou
- Link de acesso compartilhado
- Login compartilhado
- Mensagem adicional (se houver)
- Tempo de expiração configurado
- Secret key do OneTimeSecret
- Link completo gerado
- Data/hora de criação

### Relatórios
Os usuários master podem:
- Ver todos os links gerados no sistema
- Filtrar por usuário via query
- Exportar para análise

### Retenção
- Histórico mantido indefinidamente
- Pode ser limpo manualmente por master
- DELETE CASCADE ao remover usuário

## 🧪 Testes

### Teste das Tabelas
```bash
node scripts/database/testar-tabela-password-history.js
```

**Valida:**
- Criação das tabelas
- Estrutura dos campos
- Índices e foreign keys
- Contagem de registros

### Teste da API Completa
```bash
node scripts/test/testar-gerador-senhas-api.js
```

**Testa:**
1. Login e autenticação
2. Geração de link seguro
3. Salvamento de histórico
4. Busca de histórico
5. Auditoria de links
6. Validações de entrada

**Saída esperada:**
```
✅ Todos os testes concluídos com sucesso!

📊 Resumo:
   ✓ Login e autenticação
   ✓ Geração de link via OneTimeSecret
   ✓ Salvamento de histórico de mensagens
   ✓ Busca de histórico de mensagens
   ✓ Auditoria de links gerados
   ✓ Validações de entrada
```

### Teste Manual com cURL

```bash
# 1. Login
TOKEN=$(curl -s -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"jvxadmin","password":"admin123"}' \
  | jq -r '.token')

# 2. Gerar link
curl -X POST http://localhost:3001/ferramentas/gerar-link-senha \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "linkAcesso": "https://exemplo.com/admin",
    "login": "admin@exemplo.com",
    "senha": "SenhaSegura123!",
    "mensagem": "Teste via cURL",
    "tempoExpiracao": "24h"
  }'

# 3. Ver auditoria
curl http://localhost:3001/ferramentas/historico-links-gerados \
  -H "Authorization: Bearer $TOKEN"
```

## 🚀 Deploy

### Variáveis de Ambiente
Certifique-se de configurar no `.env`:
```env
# Banco de dados
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=sua_senha
DB_NAME=worksdb

# JWT
JWT_SECRET=sua_chave_minimo_32_caracteres

# API
PORT=3001
NODE_ENV=production
```

### Inicialização do Banco
```bash
# Executar script SQL
mysql -u root -p worksdb < database/add-password-history.sql

# Ou via script Node
node scripts/database/testar-tabela-password-history.js
```

### Verificação
Após deploy, execute:
```bash
node scripts/test/testar-gerador-senhas-api.js
```

## 📝 Logs

O sistema gera logs para:
- Cada link gerado (usuário, timestamp, expiração)
- Erros na API do OneTimeSecret
- Validações falhadas

**Exemplo de log:**
```
✓ Link seguro gerado por jvxadmin (ID: 1) - Expira em: 24h
```

## 🔄 Manutenção

### Limpeza de Auditoria Antiga
```sql
-- Remover registros com mais de 1 ano
DELETE FROM password_links_audit 
WHERE created_at < DATE_SUB(NOW(), INTERVAL 1 YEAR);
```

### Backup
```bash
# Backup das tabelas de auditoria
mysqldump -u root -p worksdb \
  password_history \
  password_links_audit \
  > backup_gerador_senhas.sql
```

## 🐛 Troubleshooting

### Erro: "Erro ao gerar link seguro"
- Verifique conectividade com OneTimeSecret
- Confirme que o servidor tem acesso à internet
- Verifique se não há firewall bloqueando

### Erro: "Unknown table 'password_history'"
- Execute o script de criação das tabelas
- Verifique permissões do usuário do banco

### Erro: "Session expired"
- Token JWT inválido ou expirado
- Faça login novamente

## 📚 Referências

- [OneTimeSecret API Docs](https://onetimesecret.com/docs/api)
- [Express.js Documentation](https://expressjs.com/)
- [MySQL Documentation](https://dev.mysql.com/doc/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc7519)
