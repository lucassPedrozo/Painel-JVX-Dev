# 🚀 Início Rápido - JVX Desenvolvimento

## ⚡ Instalação Rápida

### 1. Instalar Dependências
```bash
npm install
```

### 2. Configurar Ambiente
```bash
# Copiar arquivo de exemplo
copy .env.example .env

# Editar .env com suas configurações
# DB_HOST=localhost
# DB_USER=root
# DB_PASSWORD=sua_senha
# DB_NAME=worksdb
```

### 3. Criar Banco de Dados
```bash
# Opção 1: Via MySQL CLI
mysql -u root -p < database-init-clean.sql

# Opção 2: Via phpMyAdmin (XAMPP)
# 1. Acesse http://localhost/phpmyadmin
# 2. Clique na aba SQL
# 3. Cole o conteúdo de database-init-clean.sql
# 4. Clique em Executar
```

### 4. Popular com Dados de Exemplo (Opcional)
```bash
npm run populate
```

### 5. Iniciar Aplicação
```bash
# Opção 1: Iniciar tudo de uma vez
npm start

# Opção 2: Iniciar separadamente
# Terminal 1
npm run server

# Terminal 2
npm run dev
```

### 6. Acessar Sistema
```
URL: http://localhost:5173
Usuário: jvxadmin
Senha: admin123
```

## 🎯 Scripts Disponíveis

### Desenvolvimento
```bash
npm run dev          # Frontend (Vite) - porta 5173
npm run server       # Backend (Express) - porta 3001
npm start            # Ambos simultaneamente
```

### Build
```bash
npm run build        # Build de produção
npm run preview      # Preview do build
npm run lint         # Verificar código
```

### Utilitários
```bash
npm run import       # Importar CSV
npm run verify       # Verificar dados
npm run test-db      # Testar conexão
npm run populate     # Popular banco
```

## 📋 Checklist de Verificação

- [ ] Node.js instalado (v16+)
- [ ] MySQL rodando
- [ ] Dependências instaladas (`npm install`)
- [ ] Arquivo `.env` configurado
- [ ] Banco de dados criado
- [ ] Servidor backend rodando (porta 3001)
- [ ] Frontend rodando (porta 5173)
- [ ] Login funcionando

## 🔧 Solução de Problemas

### Erro: "Banco de dados não encontrado"
```bash
# Criar banco manualmente
mysql -u root -p < database-init-clean.sql
```

### Erro: "Token inválido"
```bash
# Limpar cache do navegador
# Fazer logout e login novamente
```

### Erro: "Conexão recusada"
```bash
# Verificar se MySQL está rodando
# Verificar credenciais no .env
# Testar conexão
npm run test-db
```

### Erro: "Porta já em uso"
```bash
# Backend (3001)
# Parar processo na porta 3001

# Frontend (5173)
# Parar processo na porta 5173
```

## 📦 Importar Dados

### Via Interface Web
1. Acesse **Configurações**
2. Clique em **Importar CSV**
3. Selecione o arquivo
4. Aguarde importação

### Via Script (Recomendado para grandes volumes)
```bash
npm run import
```

### Formato do CSV
```csv
Desenvolvedor,Prazo,Valor R$,Domínio,Tipo de Site,Data Entrega,Mês,Ano,Status,Pagamento,OBS
Alexandre,Normal,"R$ 200,00",exemplo.com.br,Site Institucional,01/04/2024,Abril,2024,Entregue,Pago,
```

## 🎨 Estrutura de Pastas

```
jvx-desenvolvimento/
├── src/                    # Frontend React
│   ├── components/        # Componentes
│   ├── pages/            # Páginas
│   ├── contexts/         # Contextos
│   ├── lib/              # Utilitários
│   └── hooks/            # Custom hooks
├── server.js              # Backend Express
├── database-init-clean.sql # SQL inicial
└── package.json           # Dependências
```

## 🔐 Usuários Padrão

### Master (Acesso Total)
- **Usuário**: jvxadmin
- **Senha**: admin123

### Desenvolvedores (Após popular banco)
- **Leandro**: leandro.dev / dev123
- **Heron**: heron.dev / dev123

## 📱 Funcionalidades Principais

### Dashboard
- Visão geral de projetos
- Estatísticas em tempo real
- Gráficos de produtividade

### Projetos
- Criar/Editar/Deletar
- Marcar como pago
- Status de desenvolvedor
- Filtros e busca

### Análises
- Gráficos de desempenho
- Análise por desenvolvedor
- Relatórios de pagamento

### Calendário
- Visualização de entregas
- Prazos e deadlines

### Equipe
- Gerenciar desenvolvedores
- Informações de pagamento
- Dados bancários

### Relatórios
- Exportar PDF
- Relatórios customizados
- Análises detalhadas

### Configurações
- Importar/Exportar CSV
- Limpar banco de dados
- Gerenciar usuários (Master)

## 🌐 Deploy

### Build de Produção
```bash
npm run build
```

### Variáveis de Ambiente (Produção)
```env
DB_HOST=seu_host
DB_USER=seu_usuario
DB_PASSWORD=sua_senha
DB_NAME=worksdb
PORT=3001
JWT_SECRET=chave_secreta_forte
CORS_ORIGIN=https://seu-dominio.com
VITE_API_URL=https://api.seu-dominio.com
```

## 📞 Suporte

Para dúvidas ou problemas:
1. Consulte o README.md
2. Verifique ESTRUTURA-PROJETO.md
3. Revise LIMPEZA-REALIZADA.md

## ✅ Próximos Passos

1. ✅ Alterar senha padrão
2. ✅ Criar usuários para desenvolvedores
3. ✅ Importar dados existentes
4. ✅ Configurar backup automático
5. ✅ Personalizar sistema

---

**Versão**: 2.0.0  
**Última Atualização**: Novembro 2025  
**Status**: ✅ Pronto para uso
