# 🔧 Troubleshooting: Tooltip de Data de Conclusão

Se o tooltip não está aparecendo ao passar o mouse sobre "Concluído", siga este guia.

---

## ✅ Checklist Rápido

Execute estes comandos na ordem:

```bash
# 1. Verificar se a migração foi aplicada
npm run test-completed

# 2. Se a coluna não existir, executar migração
npm run migrate

# 3. Reiniciar backend
npm run server

# 4. Reiniciar frontend (novo terminal)
npm run dev
```

---

## 🔍 Diagnóstico Detalhado

### Problema 1: Coluna completed_at não existe

**Sintoma**: Script `test-completed` mostra "Coluna completed_at NÃO EXISTE"

**Solução**:
```bash
npm run migrate
```

### Problema 2: Projetos marcados antes da migração

**Sintoma**: Projetos já marcados como "Concluído" não têm data

**Explicação**: Projetos marcados antes da migração não têm `completed_at` preenchido

**Solução**: 
1. Mude o status para "Em Andamento"
2. Marque novamente como "Concluído"
3. Agora terá a data registrada

### Problema 3: Tooltip não aparece

**Possíveis causas**:

#### A) Backend não foi reiniciado
```bash
# Pare o backend (Ctrl+C)
npm run server
```

#### B) Frontend não foi reiniciado
```bash
# Pare o frontend (Ctrl+C)
npm run dev
```

#### C) Cache do navegador
```
1. Pressione Ctrl+Shift+R (hard refresh)
2. Ou limpe o cache: Ctrl+Shift+Del
```

#### D) Projeto não tem completed_at
```bash
# Verificar no banco
npm run test-completed
```

---

## 🧪 Teste Manual

### 1. Verificar no Banco de Dados

Via phpMyAdmin:
```sql
SELECT id, developer, developer_status, completed_at 
FROM works 
WHERE developer_status = 'Concluído';
```

Via terminal:
```bash
npm run test-completed
```

### 2. Testar no Sistema

1. Acesse: http://localhost:5173
2. Vá para página "Projetos"
3. Marque um projeto como "Concluído"
4. Passe o mouse sobre o badge verde "Concluído"
5. Deve aparecer: "Concluído em: DD/MM/AAAA HH:MM"

---

## 🐛 Debug no Console

Abra o Console do navegador (F12) e execute:

```javascript
// Verificar se os dados têm completed_at
console.log('Projetos:', window.localStorage.getItem('jvx_token'));

// Verificar requisição
fetch('http://localhost:3001/works', {
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('jvx_token')
  }
})
.then(r => r.json())
.then(data => {
  const concluidos = data.filter(w => w.developer_status === 'Concluído');
  console.log('Projetos concluídos:', concluidos);
  console.log('Têm completed_at?', concluidos.map(w => ({
    id: w.id,
    completed_at: w.completed_at
  })));
});
```

---

## 📊 Estrutura Esperada

### Banco de Dados
```
works
├── id
├── developer
├── developer_status ('Em Andamento' | 'Concluído')
├── completed_at (TIMESTAMP NULL) ← DEVE EXISTIR
├── ...
```

### API Response
```json
{
  "id": 1,
  "developer": "João",
  "developer_status": "Concluído",
  "completed_at": "2025-11-05T14:30:00.000Z",
  ...
}
```

### Frontend (Work interface)
```typescript
interface Work {
  id?: number;
  developer_status: string;
  completed_at?: string | null; // ← DEVE EXISTIR
  ...
}
```

---

## ✅ Verificação Final

Execute todos os testes:

```bash
# 1. Testar conexão
npm run test-xampp

# 2. Testar migração
npm run test-completed

# 3. Verificar estrutura
npm run check-structure
```

Se todos passarem, o sistema está correto!

---

## 🆘 Ainda não funciona?

1. **Verifique os logs do backend**
   - Procure por erros ao atualizar status
   - Deve mostrar: "Status do desenvolvedor atualizado"

2. **Verifique a Network tab (F12)**
   - Veja a resposta do PATCH /works/:id/mark-completed
   - Deve incluir `completed_at` na resposta

3. **Verifique o componente**
   - Arquivo: `src/components/WorksTable.tsx`
   - Linha ~187: Badge com Tooltip
   - Condição: `work.developer_status === 'Concluído' && work.completed_at`

---

## 📞 Suporte

Se nada funcionar:
1. Execute: `npm run test-completed`
2. Copie a saída completa
3. Verifique os logs do backend
4. Verifique o console do navegador (F12)

---

**JVX Desenvolvimento** 🚀
