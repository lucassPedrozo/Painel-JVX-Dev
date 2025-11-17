# 🔧 Scripts de Inicialização - Guia de Uso

## 📋 Scripts Disponíveis

### 1. iniciar-projeto.bat ⭐ (Recomendado)
**Descrição:** Script completo com todas as verificações e mensagens detalhadas.

**Funcionalidades:**
- ✅ Verifica Node.js instalado
- ✅ Instala dependências automaticamente
- ✅ Cria arquivo .env se não existir
- ✅ Testa conexão com MySQL
- ✅ Inicia backend e frontend
- ✅ Mensagens de debug detalhadas

**Quando usar:** Primeira instalação ou quando precisa de feedback detalhado.

---

### 2. iniciar-projeto-simples.bat 🚀 (Alternativa)
**Descrição:** Script simplificado sem verificações complexas.

**Funcionalidades:**
- ✅ Verificações básicas
- ✅ Inicia servidores rapidamente
- ✅ Menos mensagens, mais direto

**Quando usar:** 
- Quando o script completo não funciona
- Quando já sabe que tudo está configurado
- Para inicialização rápida

---

### 3. diagnostico.bat 🔍 (Debug)
**Descrição:** Script de diagnóstico completo do sistema.

**Funcionalidades:**
- ✅ Verifica Node.js e npm
- ✅ Lista arquivos importantes
- ✅ Verifica portas em uso
- ✅ Lista processos Node
- ✅ Testa conexão com banco

**Quando usar:**
- Quando algo não funciona
- Para identificar problemas
- Antes de pedir ajuda

---

### 4. parar-projeto.bat 🛑
**Descrição:** Para todos os servidores Node.js.

**Funcionalidades:**
- ✅ Mata todos os processos Node
- ✅ Libera portas 3001 e 5173

**Quando usar:**
- Para parar os servidores
- Quando porta está em uso
- Antes de reiniciar

---

## 🎯 Fluxo de Uso Recomendado

### Primeira Vez

```
1. diagnostico.bat          → Verificar sistema
2. iniciar-projeto.bat      → Iniciar completo
3. Se não funcionar:
   → iniciar-projeto-simples.bat
```

### Uso Diário

```
1. iniciar-projeto-simples.bat   → Início rápido
2. Trabalhar no sistema
3. parar-projeto.bat             → Parar ao final
```

### Quando Há Problemas

```
1. parar-projeto.bat        → Parar tudo
2. diagnostico.bat          → Ver o problema
3. Corrigir o problema
4. iniciar-projeto.bat      → Tentar novamente
```

---

## ❓ Problemas Comuns

### Script pisca e fecha

**Causa:** Erro silencioso no script.

**Solução:**
```
1. Abra CMD nesta pasta (Shift + Botão Direito → "Abrir janela de comando aqui")
2. Digite: iniciar-projeto.bat
3. Veja o erro que aparece
4. Ou use: diagnostico.bat
```

---

### "Node.js não encontrado"

**Causa:** Node.js não instalado ou não no PATH.

**Solução:**
```
1. Instale Node.js: https://nodejs.org/
2. Reinicie o computador
3. Teste: node --version
```

---

### "Porta já em uso"

**Causa:** Servidor já rodando.

**Solução:**
```
1. Execute: parar-projeto.bat
2. Ou: taskkill /F /IM node.exe
3. Tente novamente
```

---

### "Erro ao instalar dependências"

**Causa:** Problema com npm ou internet.

**Solução:**
```
1. Delete: node_modules
2. Delete: package-lock.json
3. Execute: npm install
```

---

### "Erro de conexão com banco"

**Causa:** MySQL não rodando ou banco não criado.

**Solução:**
```
1. Abra XAMPP Control Panel
2. Inicie MySQL (botão Start)
3. Acesse: http://localhost/phpmyadmin
4. Crie banco "worksdb"
5. Execute SQL de: database/database-init-clean.sql
```

---

## 🔧 Executar Manualmente (Sem Scripts)

Se nenhum script funcionar, execute manualmente:

### Terminal 1 - Backend
```bash
cd jvx-dev-v1
node server.js
```

### Terminal 2 - Frontend
```bash
cd jvx-dev-v1
npm run dev
```

---

## 📊 Comparação de Scripts

| Script | Verificações | Velocidade | Debug | Recomendado Para |
|--------|--------------|------------|-------|------------------|
| iniciar-projeto.bat | ✅✅✅ | 🐢 Lento | ✅✅✅ | Primeira vez |
| iniciar-projeto-simples.bat | ✅ | 🚀 Rápido | ✅ | Uso diário |
| diagnostico.bat | ✅✅✅ | 🐢 Lento | ✅✅✅ | Debug |
| parar-projeto.bat | - | ⚡ Instantâneo | - | Parar |

---

## 💡 Dicas

### Dica 1: Atalho no Desktop
```
1. Botão direito em iniciar-projeto-simples.bat
2. Enviar para → Área de trabalho (criar atalho)
3. Renomeie para "JVX Dev"
```

### Dica 2: Executar como Administrador
```
Se tiver problemas de permissão:
1. Botão direito no script
2. Executar como administrador
```

### Dica 3: Ver Logs
```
Os logs aparecem nas janelas que abrem:
- Janela "Backend" → Logs do servidor
- Janela "Frontend" → Logs do Vite
```

### Dica 4: Manter Janelas Abertas
```
NÃO feche as janelas do servidor!
Elas precisam ficar abertas enquanto usa o sistema.
```

---

## 🆘 Ainda Não Funciona?

1. **Execute diagnóstico:**
   ```
   diagnostico.bat
   ```

2. **Copie a saída completa**

3. **Consulte:**
   - SOLUCAO-PROBLEMAS.md
   - COMO-USAR.md

4. **Informações úteis para suporte:**
   - Versão do Node: `node --version`
   - Sistema: Windows X
   - Mensagem de erro completa
   - Saída do diagnostico.bat

---

**Última atualização:** Novembro 2025
