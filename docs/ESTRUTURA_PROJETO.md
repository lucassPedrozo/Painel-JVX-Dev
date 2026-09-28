# Estrutura Do Projeto

Este documento descreve a organização profissional do repositório, os papéis de cada diretório e as convenções recomendadas para manter o projeto previsível.

## Mapa Geral

```text
.
├── database/
├── docs/
├── scripts/
├── src/
├── .env.example
├── components.json
├── eslint.config.js
├── index.html
├── package.json
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
├── server.js
├── tsconfig*.json
└── vite.config.ts
```

## Camadas

### Frontend

Local: `src/`

Responsabilidades:

- Renderização da aplicação autenticada.
- Controle de rotas protegidas.
- Consumo da API via `src/lib/api.ts`.
- Experiência de dashboard, gestão, relatórios e ferramentas internas.

Organização:

- `src/pages/`: telas roteadas (`Home`, `Sites`, `Analises`, `Calendario`, `Equipe`, `Relatorios`, `Configuracoes`, `Ferramentas`, `GerenciarUsuarios`, `Login`).
- `src/components/`: componentes compartilhados e agrupados por domínio.
- `src/components/ui/`: componentes de base visual, alinhados ao `components.json`.
- `src/components/dialogs/`: modais de criação, edição, exclusão, rating e informações.
- `src/components/dashboard/`: widgets e visualizações do dashboard.
- `src/components/reports/`: componentes de visualização/exportação de relatórios.
- `src/components/common/`: componentes utilitários, proteção de rota, erro e loading.
- `src/components/skeletons/`: estados de carregamento.
- `src/contexts/`: estados globais de autenticação, trabalhos e ocultação de valores.
- `src/ferramentas/`: ferramentas internas independentes do CRUD principal.
- `src/lib/`: cliente de API, URL dinâmica, constantes, utilitários e exportação PDF.
- `src/types/`: contratos TypeScript compartilhados.
- `src/__tests__/`: testes unitários e setup do Vitest.

### Backend

Local: `server.js`

Responsabilidades:

- API REST Express.
- Autenticação JWT e controle de sessão única.
- Autorização por perfil (`master` e `standard`).
- CRUD de trabalhos, usuários e desenvolvedores.
- Importação CSV e limpeza administrativa do banco.
- Ferramentas de geração de links seguros e monitoramento de sites.
- Headers, CORS, rate limiting e tratamento global de erros.

Observação: o backend está funcional, mas concentrado em um arquivo único. Caso o volume de regras aumente, a próxima organização recomendada é separar em:

```text
server/
├── index.js
├── config/
├── db/
├── middleware/
├── routes/
├── services/
└── validators/
```

Essa refatoração deve ser feita com testes de integração cobrindo autenticação, autorização e rotas críticas antes da movimentação.

### Banco De Dados

Local: `database/`

Arquivos:

- `database-init-clean.sql`: cria banco limpo, tabelas principais e usuário master inicial.
- `add-password-history.sql`: adiciona tabelas relacionadas ao gerador de links seguros.
- `exemplo-importacao.csv`: modelo de importação com dados fictícios.

Tabelas esperadas:

- `users`
- `developers`
- `works`
- `password_history`
- `password_links_audit`
- `monitored_sites`
- `site_check_history`

### Scripts Operacionais

Local: `scripts/`

Organização:

- `scripts/database/`: conexão, seed, verificação, correção de sessão e validação de tabelas.
- `scripts/import/`: importação direta de CSV para o banco.
- `scripts/test/`: testes de integração da API e das ferramentas.

Convenção: scripts que dependem de banco ou API devem documentar pré-requisitos no cabeçalho do próprio arquivo.

### Documentação

Local: `docs/`

Documentos atuais:

- `BACKEND_GERADOR_SENHAS.md`: documentação detalhada do backend da ferramenta de link seguro.
- `ESTRUTURA_PROJETO.md`: mapa técnico do repositório.
- `GUIA_PENTEST.md`: metodologia e checklist de pentest autorizado.

## Fluxo De Dados

```text
React/Vite
  ↓ fetch com JWT
Express API
  ↓ mysql2/promise
MySQL

Express API
  ↓ HTTPS externo
OneTimeSecret

Express API
  ↓ HTTP/HTTPS/DNS
Sites monitorados pelo Down Detector
```

## Convenções De Manutenção

- Novas páginas devem ficar em `src/pages/` e ser registradas em `src/App.tsx`.
- Novos componentes reutilizáveis devem ficar em `src/components/common/` ou em subpasta de domínio.
- Componentes de UI genéricos devem permanecer em `src/components/ui/`.
- Chamadas HTTP devem passar por `src/lib/api.ts` para manter tratamento de sessão consistente.
- Novos tipos compartilhados devem entrar em `src/types/index.ts`.
- Novas constantes de domínio devem entrar em `src/lib/constants.ts`.
- Scripts SQL versionados devem ficar em `database/`.
- Scripts Node operacionais devem ficar em `scripts/<dominio>/`.
- Documentação técnica deve ficar em `docs/`; o `README.md` deve permanecer como entrada principal.

## Pontos De Atenção Técnica

- `server.js` concentra muitas responsabilidades; isso facilita execução local, mas reduz isolamento de testes e manutenção.
- O cliente armazena JWT no `localStorage`, o que deve ser avaliado no pentest para risco de XSS e roubo de sessão.
- A ferramenta Down Detector faz requisições de saída a URLs cadastradas; isso deve ser testado contra SSRF e restrições de rede.
- A tabela `password_links_audit` registra metadados de links gerados; retenção, acesso e mascaramento devem ser tratados como dados sensíveis.
- O usuário master inicial é conveniente para bootstrap, mas deve ser trocado antes de uso real.

## Critério Para Novas Mudanças

Antes de aceitar alterações estruturais:

1. A mudança respeita a separação por domínio?
2. Existe comando de teste ou verificação para a área alterada?
3. A documentação afetada foi atualizada?
4. A mudança não introduz segredo, dump, backup ou dado real no repositório?
5. O impacto em autenticação, autorização e banco foi revisado?
