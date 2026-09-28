# Gerador de Link para Senhas

Ferramenta segura para compartilhar credenciais de acesso através de links criptografados que expiram automaticamente.

## 🔐 Recursos

- **Links de uso único**: Cada link pode ser visualizado apenas uma vez
- **Expiração automática**: Configure o tempo de validade (1h a 7 dias)
- **Histórico de mensagens**: Salva as últimas 5 mensagens para reutilização
- **Fixar mensagens**: Mantenha mensagens importantes no topo do histórico
- **Criptografia externa**: Utiliza OneTimeSecret para máxima segurança

## 📝 Como Usar

1. **Preencha as credenciais**:
   - Link de acesso (URL do sistema)
   - Login/usuário
   - Senha
   - Mensagem adicional (opcional)

2. **Configure a expiração**:
   - Escolha o tempo de validade do link (padrão: 24 horas)

3. **Gere o link**:
   - Clique em "Gerar Link Seguro"
   - O link será criado e pode ser copiado

4. **Compartilhe com segurança**:
   - Envie o link apenas para o destinatário correto
   - O link só pode ser visualizado UMA VEZ
   - Após visualização, as informações são destruídas automaticamente

## ⚠️ Importante

- **Links de uso único**: Não há como recuperar as informações após visualização
- **Expiração**: Links expiram automaticamente após o tempo configurado
- **Histórico local**: As mensagens salvas são armazenadas por usuário no banco de dados
- **Segurança**: Nunca compartilhe links em canais públicos ou inseguros

## 🔄 Histórico de Mensagens

O sistema mantém um histórico das últimas 5 mensagens utilizadas:

- **Reutilizar**: Clique no ícone de cópia para usar novamente
- **Fixar**: Mantenha mensagens importantes sempre visíveis
- **Remover**: Limpe mensagens antigas do histórico

Mensagens fixadas permanecem no histórico independente de quantas novas mensagens forem adicionadas.

## 🛠️ API Externa

Esta ferramenta utiliza o [OneTimeSecret](https://onetimesecret.com/) para gerar links seguros e criptografados. A API é gratuita e não requer cadastro para uso básico.

### Alternativas de API

Se desejar usar outra API de links seguros, você pode modificar a função `handleGerarLink` no arquivo:
```
src/ferramentas/GeradorLinkSenhas.tsx
```

Algumas alternativas:
- **PrivateBin**: https://privatebin.info/
- **Yopass**: https://yopass.se/
- **Password Pusher**: https://pwpush.com/

## 📊 Banco de Dados

A tabela `password_history` armazena o histórico por usuário:

```sql
CREATE TABLE password_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  mensagem TEXT NOT NULL,
  timestamp BIGINT NOT NULL,
  fixada BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

Para criar a tabela manualmente:
```bash
mysql -u root -p worksdb < database/add-password-history.sql
```

## 🎯 Casos de Uso

1. **Compartilhar acessos de homologação** com clientes
2. **Enviar credenciais temporárias** para colaboradores
3. **Transferir senhas de forma segura** entre equipes
4. **Compartilhar acessos de sistemas terceiros**

## 🔒 Boas Práticas

✅ **Faça:**
- Use links para compartilhamento temporário
- Configure expiração adequada ao uso
- Verifique o destinatário antes de enviar
- Use mensagens descritivas para contexto

❌ **Não faça:**
- Compartilhar links em canais públicos
- Reutilizar o mesmo link (não é possível)
- Confiar em links após expiração
- Guardar informações sensíveis no histórico
