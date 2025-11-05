# 🤝 Guia de Contribuição

Obrigado por considerar contribuir com o JVX Desenvolvimento! Este documento fornece diretrizes para contribuir com o projeto.

## 📋 Código de Conduta

Este projeto adere a um Código de Conduta. Ao participar, você concorda em manter um ambiente respeitoso e inclusivo.

## 🚀 Como Contribuir

### Reportar Bugs

Se você encontrou um bug:

1. **Verifique** se o bug já foi reportado nas [Issues](https://github.com/seu-usuario/jvx-desenvolvimento/issues)
2. Se não encontrou, **crie uma nova issue** com:
   - Título claro e descritivo
   - Descrição detalhada do problema
   - Passos para reproduzir
   - Comportamento esperado vs atual
   - Screenshots (se aplicável)
   - Ambiente (OS, Node version, etc.)

### Sugerir Melhorias

Para sugerir uma nova funcionalidade:

1. **Verifique** se já não existe uma issue similar
2. **Crie uma issue** descrevendo:
   - O problema que a funcionalidade resolve
   - Como você imagina que funcionaria
   - Exemplos de uso
   - Alternativas consideradas

### Pull Requests

1. **Fork** o repositório
2. **Clone** seu fork:
   ```bash
   git clone https://github.com/seu-usuario/jvx-desenvolvimento.git
   ```

3. **Crie uma branch** para sua feature:
   ```bash
   git checkout -b feature/minha-feature
   ```

4. **Faça suas mudanças** seguindo os padrões do projeto

5. **Commit** suas mudanças:
   ```bash
   git commit -m "feat: adiciona nova funcionalidade"
   ```

6. **Push** para seu fork:
   ```bash
   git push origin feature/minha-feature
   ```

7. **Abra um Pull Request** no repositório original

## 📝 Padrões de Código

### Commits

Usamos [Conventional Commits](https://www.conventionalcommits.org/):

```
tipo(escopo): descrição curta

Descrição mais detalhada (opcional)
```

**Tipos:**
- `feat`: Nova funcionalidade
- `fix`: Correção de bug
- `docs`: Documentação
- `style`: Formatação (não afeta código)
- `refactor`: Refatoração
- `test`: Testes
- `chore`: Manutenção

**Exemplos:**
```bash
feat(auth): adiciona autenticação com Google
fix(api): corrige erro na importação de CSV
docs(readme): atualiza instruções de instalação
```

### TypeScript/JavaScript

- Use **TypeScript** quando possível
- Siga o **ESLint** configurado
- Use **nomes descritivos** para variáveis e funções
- Adicione **comentários** para lógica complexa
- Mantenha funções **pequenas e focadas**

```typescript
// ✅ Bom
function calculateTotalValue(works: Work[]): number {
  return works.reduce((total, work) => total + parseValue(work.value), 0)
}

// ❌ Evite
function calc(w: any): any {
  let t = 0
  for (let i = 0; i < w.length; i++) {
    t += parseFloat(w[i].v)
  }
  return t
}
```

### React

- Use **componentes funcionais** com hooks
- Extraia **lógica complexa** para custom hooks
- Use **TypeScript** para props
- Mantenha componentes **pequenos e reutilizáveis**

```typescript
// ✅ Bom
interface ButtonProps {
  label: string
  onClick: () => void
  variant?: 'primary' | 'secondary'
}

export function Button({ label, onClick, variant = 'primary' }: ButtonProps) {
  return (
    <button onClick={onClick} className={`btn btn-${variant}`}>
      {label}
    </button>
  )
}

// ❌ Evite
export function Button(props: any) {
  return <button onClick={props.onClick}>{props.label}</button>
}
```

### CSS/TailwindCSS

- Use **classes do Tailwind** quando possível
- Agrupe **classes relacionadas**
- Use **componentes do shadcn/ui**

```tsx
// ✅ Bom
<div className="flex items-center gap-4 p-4 rounded-lg bg-card">
  <span className="text-sm font-medium">Conteúdo</span>
</div>

// ❌ Evite
<div className="flex p-4 items-center rounded-lg gap-4 bg-card">
  <span className="font-medium text-sm">Conteúdo</span>
</div>
```

## 🧪 Testes

Antes de submeter um PR:

1. **Teste localmente**:
   ```bash
   npm run dev
   ```

2. **Verifique o build**:
   ```bash
   npm run build
   ```

3. **Execute o linter**:
   ```bash
   npm run lint
   ```

4. **Teste a importação de dados**:
   ```bash
   node testar-importacao-csv.js
   ```

## 📚 Documentação

- Atualize o **README.md** se necessário
- Adicione **comentários** no código
- Atualize o **CHANGELOG.md**
- Documente **novas funcionalidades**

## 🔍 Revisão de Código

Seu PR será revisado considerando:

- ✅ Funcionalidade implementada corretamente
- ✅ Código limpo e legível
- ✅ Testes passando
- ✅ Documentação atualizada
- ✅ Sem conflitos com main
- ✅ Segue os padrões do projeto

## 🎯 Áreas para Contribuir

### Funcionalidades Desejadas

- [ ] Testes automatizados (Jest/Vitest)
- [ ] Integração com APIs externas
- [ ] Notificações por email
- [ ] Exportação para Excel
- [ ] Gráficos mais avançados
- [ ] Modo offline
- [ ] App mobile (React Native)

### Melhorias

- [ ] Performance de carregamento
- [ ] Acessibilidade (a11y)
- [ ] Internacionalização (i18n)
- [ ] Dark mode melhorado
- [ ] Responsividade mobile
- [ ] PWA (Progressive Web App)

### Documentação

- [ ] Tutoriais em vídeo
- [ ] Exemplos de uso
- [ ] API documentation
- [ ] Guias de troubleshooting
- [ ] FAQ

## 💬 Comunicação

- **Issues**: Para bugs e sugestões
- **Discussions**: Para perguntas e ideias
- **Pull Requests**: Para contribuições de código

## 📄 Licença

Ao contribuir, você concorda que suas contribuições serão licenciadas sob a mesma licença MIT do projeto.

## 🙏 Agradecimentos

Obrigado por contribuir! Sua ajuda é muito apreciada. 🎉

---

**Dúvidas?** Abra uma [Discussion](https://github.com/seu-usuario/jvx-desenvolvimento/discussions) ou entre em contato.
