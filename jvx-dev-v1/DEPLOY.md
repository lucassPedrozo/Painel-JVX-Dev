# 🚀 Guia de Deploy - JVX Desenvolvimento

Este guia fornece instruções detalhadas para fazer deploy do sistema em diferentes ambientes.

## 📋 Índice

- [Pré-requisitos](#pré-requisitos)
- [Preparação](#preparação)
- [Deploy em VPS (Ubuntu/Debian)](#deploy-em-vps-ubuntudebian)
- [Deploy com Docker](#deploy-com-docker)
- [Deploy no Vercel (Frontend)](#deploy-no-vercel-frontend)
- [Deploy no Heroku](#deploy-no-heroku)
- [Deploy no Railway](#deploy-no-railway)
- [Configuração de Domínio](#configuração-de-domínio)
- [SSL/HTTPS](#sslhttps)
- [Monitoramento](#monitoramento)
- [Backup e Recuperação](#backup-e-recuperação)

## 🔧 Pré-requisitos

Antes de fazer o deploy, certifique-se de ter:

- [ ] Código testado localmente
- [ ] Banco de dados configurado
- [ ] Variáveis de ambiente definidas
- [ ] Build de produção funcionando
- [ ] Domínio configurado (opcional)
- [ ] Certificado SSL (recomendado)

## 📦 Preparação

### 1. Build de Produção

```bash
# Instalar dependências
npm install

# Build do frontend
npm run build

# Testar build localmente
npm run preview
```

### 2. Configurar Variáveis de Ambiente

Crie um arquivo `.env.production`:

```env
# Banco de Dados
DB_HOST=seu-host-mysql
DB_USER=seu-usuario
DB_PASSWORD=sua-senha-segura
DB_NAME=worksdb

# Servidor
PORT=3001
NODE_ENV=production

# JWT
JWT_SECRET=sua-chave-secreta-muito-segura-aqui

# CORS
CORS_ORIGIN=https://seu-dominio.com

# Frontend
VITE_API_URL=https://api.seu-dominio.com
```

### 3. Otimizações de Produção

No `server.js`, adicione:

```javascript
// Compressão
import compression from 'compression'
app.use(compression())

// Rate limiting
import rateLimit from 'express-rate-limit'
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100 // limite de requisições
})
app.use('/api/', limiter)

// Helmet para segurança
import helmet from 'helmet'
app.use(helmet())
```

## 🖥️ Deploy em VPS (Ubuntu/Debian)

### 1. Preparar o Servidor

```bash
# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Instalar MySQL
sudo apt install -y mysql-server

# Instalar Nginx
sudo apt install -y nginx

# Instalar PM2 (gerenciador de processos)
sudo npm install -g pm2
```

### 2. Configurar MySQL

```bash
# Acessar MySQL
sudo mysql

# Criar banco e usuário
CREATE DATABASE worksdb;
CREATE USER 'jvxuser'@'localhost' IDENTIFIED BY 'senha-segura';
GRANT ALL PRIVILEGES ON worksdb.* TO 'jvxuser'@'localhost';
FLUSH PRIVILEGES;
EXIT;

# Importar estrutura
mysql -u jvxuser -p worksdb < database-init-clean.sql
```

### 3. Fazer Upload do Código

```bash
# No seu computador
scp -r dist/ server.js package.json user@seu-servidor:/var/www/jvx

# Ou usar Git
ssh user@seu-servidor
cd /var/www
git clone https://github.com/seu-usuario/jvx-desenvolvimento.git jvx
cd jvx
```

### 4. Instalar Dependências

```bash
cd /var/www/jvx
npm install --production
```

### 5. Configurar PM2

```bash
# Criar arquivo ecosystem.config.js
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'jvx-api',
    script: './server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    }
  }]
}
EOF

# Iniciar aplicação
pm2 start ecosystem.config.js

# Configurar para iniciar no boot
pm2 startup
pm2 save
```

### 6. Configurar Nginx

```bash
# Criar configuração
sudo nano /etc/nginx/sites-available/jvx
```

Adicione:

```nginx
# API Backend
server {
    listen 80;
    server_name api.seu-dominio.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Frontend
server {
    listen 80;
    server_name seu-dominio.com www.seu-dominio.com;
    root /var/www/jvx/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache de assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Compressão
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript application/json;
}
```

```bash
# Ativar site
sudo ln -s /etc/nginx/sites-available/jvx /etc/nginx/sites-enabled/

# Testar configuração
sudo nginx -t

# Reiniciar Nginx
sudo systemctl restart nginx
```

### 7. Configurar Firewall

```bash
sudo ufw allow 'Nginx Full'
sudo ufw allow OpenSSH
sudo ufw enable
```

## 🐳 Deploy com Docker

### 1. Criar Dockerfile

```dockerfile
# Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

# Copiar package files
COPY package*.json ./

# Instalar dependências
RUN npm ci

# Copiar código
COPY . .

# Build frontend
RUN npm run build

# Imagem de produção
FROM node:18-alpine

WORKDIR /app

# Copiar apenas necessário
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server.js ./
COPY --from=builder /app/package*.json ./

# Instalar apenas dependências de produção
RUN npm ci --production

EXPOSE 3001

CMD ["node", "server.js"]
```

### 2. Criar docker-compose.yml

```yaml
version: '3.8'

services:
  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: ${DB_PASSWORD}
      MYSQL_DATABASE: worksdb
    volumes:
      - mysql_data:/var/lib/mysql
      - ./database-init-clean.sql:/docker-entrypoint-initdb.d/init.sql
    ports:
      - "3306:3306"
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      timeout: 20s
      retries: 10

  api:
    build: .
    ports:
      - "3001:3001"
    environment:
      DB_HOST: mysql
      DB_USER: root
      DB_PASSWORD: ${DB_PASSWORD}
      DB_NAME: worksdb
      JWT_SECRET: ${JWT_SECRET}
      NODE_ENV: production
    depends_on:
      mysql:
        condition: service_healthy
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./dist:/usr/share/nginx/html
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - api
    restart: unless-stopped

volumes:
  mysql_data:
```

### 3. Deploy

```bash
# Build e iniciar
docker-compose up -d

# Ver logs
docker-compose logs -f

# Parar
docker-compose down
```

## ☁️ Deploy no Vercel (Frontend)

### 1. Preparar Projeto

```bash
# Instalar Vercel CLI
npm install -g vercel

# Login
vercel login
```

### 2. Configurar vercel.json

```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/assets/(.*)",
      "headers": {
        "cache-control": "public, max-age=31536000, immutable"
      }
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "env": {
    "VITE_API_URL": "@api_url"
  }
}
```

### 3. Deploy

```bash
# Deploy
vercel

# Deploy para produção
vercel --prod
```

### 4. Configurar Variáveis de Ambiente

No dashboard da Vercel:
1. Vá em Settings → Environment Variables
2. Adicione `VITE_API_URL` com a URL da sua API

## 🚂 Deploy no Railway

### 1. Criar Conta

Acesse [railway.app](https://railway.app) e crie uma conta.

### 2. Novo Projeto

1. Clique em "New Project"
2. Selecione "Deploy from GitHub repo"
3. Conecte seu repositório

### 3. Adicionar MySQL

1. Clique em "New"
2. Selecione "Database" → "MySQL"
3. Anote as credenciais

### 4. Configurar Variáveis

No painel do projeto:
- `DB_HOST`: (fornecido pelo Railway)
- `DB_USER`: (fornecido pelo Railway)
- `DB_PASSWORD`: (fornecido pelo Railway)
- `DB_NAME`: worksdb
- `JWT_SECRET`: sua-chave-secreta
- `PORT`: 3001

### 5. Deploy

O Railway faz deploy automático a cada push no GitHub.

## 🌐 Configuração de Domínio

### DNS Records

Configure os seguintes registros DNS:

```
# Frontend
A     @              IP-DO-SERVIDOR
A     www            IP-DO-SERVIDOR

# API
A     api            IP-DO-SERVIDOR

# Ou usando CNAME (se usar CDN)
CNAME @              seu-app.vercel.app
CNAME api            seu-app.railway.app
```

## 🔒 SSL/HTTPS

### Usando Let's Encrypt (Certbot)

```bash
# Instalar Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obter certificado
sudo certbot --nginx -d seu-dominio.com -d www.seu-dominio.com -d api.seu-dominio.com

# Renovação automática
sudo certbot renew --dry-run
```

### Usando Cloudflare

1. Adicione seu domínio no Cloudflare
2. Configure os DNS records
3. Ative SSL/TLS (Full ou Full Strict)
4. Ative "Always Use HTTPS"

## 📊 Monitoramento

### PM2 Monitoring

```bash
# Ver status
pm2 status

# Ver logs
pm2 logs

# Monitoramento em tempo real
pm2 monit

# Dashboard web
pm2 plus
```

### Logs do Nginx

```bash
# Access logs
sudo tail -f /var/log/nginx/access.log

# Error logs
sudo tail -f /var/log/nginx/error.log
```

### Monitoramento de Recursos

```bash
# CPU e Memória
htop

# Espaço em disco
df -h

# Conexões MySQL
mysqladmin -u root -p processlist
```

## 💾 Backup e Recuperação

### Backup Automático do Banco

```bash
# Criar script de backup
cat > /usr/local/bin/backup-jvx.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/jvx"
mkdir -p $BACKUP_DIR

# Backup do banco
mysqldump -u jvxuser -p'senha' worksdb | gzip > $BACKUP_DIR/worksdb_$DATE.sql.gz

# Manter apenas últimos 30 dias
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete

echo "Backup concluído: worksdb_$DATE.sql.gz"
EOF

# Tornar executável
sudo chmod +x /usr/local/bin/backup-jvx.sh

# Agendar no cron (diariamente às 2h)
sudo crontab -e
# Adicionar:
0 2 * * * /usr/local/bin/backup-jvx.sh
```

### Restaurar Backup

```bash
# Descompactar e restaurar
gunzip < backup.sql.gz | mysql -u jvxuser -p worksdb
```

### Backup de Arquivos

```bash
# Backup completo
tar -czf jvx-backup-$(date +%Y%m%d).tar.gz /var/www/jvx

# Restaurar
tar -xzf jvx-backup-20240101.tar.gz -C /
```

## 🔧 Manutenção

### Atualizar Aplicação

```bash
# Pull do código
cd /var/www/jvx
git pull

# Instalar dependências
npm install --production

# Build
npm run build

# Reiniciar PM2
pm2 restart jvx-api
```

### Atualizar Dependências

```bash
# Verificar atualizações
npm outdated

# Atualizar
npm update

# Ou atualizar tudo
npm install -g npm-check-updates
ncu -u
npm install
```

## 🐛 Troubleshooting

### Erro 502 Bad Gateway

```bash
# Verificar se API está rodando
pm2 status

# Verificar logs
pm2 logs jvx-api

# Reiniciar
pm2 restart jvx-api
```

### Erro de Conexão com Banco

```bash
# Verificar se MySQL está rodando
sudo systemctl status mysql

# Testar conexão
mysql -u jvxuser -p -h localhost worksdb

# Ver logs do MySQL
sudo tail -f /var/log/mysql/error.log
```

### Alto Uso de Memória

```bash
# Ver processos
pm2 monit

# Reiniciar com limite de memória
pm2 restart jvx-api --max-memory-restart 500M
```

## 📋 Checklist de Deploy

- [ ] Código testado localmente
- [ ] Build de produção funcionando
- [ ] Variáveis de ambiente configuradas
- [ ] Banco de dados criado e populado
- [ ] Servidor configurado (Nginx/Apache)
- [ ] PM2 ou Docker configurado
- [ ] Firewall configurado
- [ ] SSL/HTTPS ativado
- [ ] Domínio apontando corretamente
- [ ] Backup automático configurado
- [ ] Monitoramento ativo
- [ ] Logs configurados
- [ ] Senha padrão alterada
- [ ] Documentação atualizada

## 📞 Suporte

Para problemas de deploy:

- Consulte os logs: `pm2 logs` ou `docker-compose logs`
- Verifique a documentação do provedor
- Abra uma issue no GitHub

---

**Última atualização:** 20/10/2025
**Versão:** 2.0.0
