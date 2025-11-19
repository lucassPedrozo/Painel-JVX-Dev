# 🔧 Scripts Executáveis

Scripts `.bat` para Windows que facilitam o gerenciamento do projeto.

---

## 📁 Arquivos Disponíveis

### iniciar-projeto.bat
Inicia o projeto completo com verificações automáticas.

**Como usar:**
- Duplo clique no arquivo
- Ou execute: `bin\iniciar-projeto.bat`

**O que faz:**
1. Verifica se Node.js está instalado
2. Instala dependências (se necessário)
3. Verifica arquivo `.env`
4. Testa conexão com banco de dados
5. Inicia backend (porta 3001)
6. Inicia frontend (porta 5173)

**Resultado:**
- Duas janelas de terminal abertas (Backend e Frontend)
- Sistema acessível em http://localhost:5173

---

### parar-projeto.bat
Para todos os processos Node.js em execução.

**Como usar:**
- Duplo clique no arquivo
- Ou execute: `bin\parar-projeto.bat`

**O que faz:**
- Finaliza todos os processos `node.exe`
- Libera as portas 3001 e 5173

**Quando usar:**
- Ao finalizar o trabalho
- Quando as portas estão em uso
- Para reiniciar o sistema

---

### diagnostico.bat
Executa diagnóstico completo do sistema.

**Como usar:**
- Duplo clique no arquivo
- Ou execute: `bin\diagnostico.bat`

**O que faz:**
1. Verifica instalação do Node.js
2. Verifica instalação do npm
3. Verifica pasta `node_modules`
4. Verifica arquivo `.env`
5. Verifica estrutura de pastas
6. Testa conexão com banco de dados

**Quando usar:**
- Ao encontrar problemas
- Após instalação inicial
- Para validar configuração

---

## 🚀 Fluxo de Uso Recomendado

### Primeira Vez
```
1. diagnostico.bat       # Verificar instalação
2. iniciar-projeto.bat   # Iniciar sistema
3. Acessar http://localhost:5173
```

### Uso Diário
```
1. iniciar-projeto.bat   # Iniciar
2. Trabalhar no sistema
3. parar-projeto.bat     # Finalizar
```

### Problemas
```
1. parar-projeto.bat     # Parar tudo
2. diagnostico.bat       # Diagnosticar
3. Corrigir problemas
4. iniciar-projeto.bat   # Reiniciar
```

---

## ⚙️ Requisitos

- Windows 7 ou superior
- Node.js ≥16.0.0 instalado
- XAMPP com MySQL rodando
- Banco de dados `worksdb` criado

---

## 🐛 Solução de Problemas

### Script não executa
- Clique com botão direito → "Executar como administrador"
- Verifique se a extensão `.bat` está associada ao CMD

### Erro: "Node.js não encontrado"
- Instale Node.js: https://nodejs.org/
- Reinicie o computador após instalação

### Erro: "Conexão com banco falhou"
- Abra o XAMPP Control Panel
- Inicie o serviço MySQL (botão Start)
- Verifique se o banco `worksdb` existe no phpMyAdmin

### Portas em uso
```bash
# Execute:
bin\parar-projeto.bat

# Ou manualmente:
taskkill /F /IM node.exe
```

---

## 📝 Notas

- Scripts otimizados para Windows
- Usam codificação UTF-8 para caracteres especiais
- Exibem mensagens coloridas e formatadas
- Pausam ao final para visualização de resultados

---

## 🔄 Alternativas

Se preferir não usar os scripts `.bat`, você pode executar manualmente:

```bash
# Instalar dependências
npm install

# Iniciar backend
npm run server

# Iniciar frontend (em outro terminal)
npm run dev

# Parar (Ctrl+C em cada terminal)
```

---

Para mais informações, consulte a [documentação completa](../docs/GUIA-COMPLETO.md).
