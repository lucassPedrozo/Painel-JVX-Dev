import express from "express";
import cors from "cors";
import mysql from "mysql2/promise";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import dotenv from "dotenv";

// Carregar variáveis de ambiente
dotenv.config();

const app = express();

// Configurar CORS
const corsOptions = {
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
};
app.use(cors(corsOptions));

// Aumentar limite de payload para importação de CSV
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Configurações
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || "REMOVED-SECRET";

// Pool de conexões MySQL com Promises
const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "worksdb",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

// Middleware de logging
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  next();
});

// Middleware para tratamento de erros
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// ============================================
// MIDDLEWARE DE AUTENTICAÇÃO
// ============================================
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: "Token não fornecido" });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      console.error("Erro na verificação do token:", err.message);
      return res.status(403).json({ error: "Token inválido ou expirado" });
    }
    req.user = user;
    next();
  });
};

// Middleware para verificar se é master
const requireMaster = (req, res, next) => {
  if (req.user.role !== 'master') {
    return res.status(403).json({ error: "Acesso negado. Apenas administradores." });
  }
  next();
};

// ============================================
// ROTAS DE AUTENTICAÇÃO
// ============================================

// Login
app.post("/auth/login", asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Usuário e senha são obrigatórios" });
  }

  const [results] = await pool.execute(
    "SELECT * FROM users WHERE username = ? AND active = TRUE",
    [username]
  );

  if (results.length === 0) {
    return res.status(401).json({ error: "Usuário ou senha inválidos" });
  }

  const user = results[0];
  
  // Verificar senha (suporta SHA2 legado e bcrypt)
  let passwordValid = false;
  const sha2Hash = crypto.createHash('sha256').update(password).digest('hex');
  
  if (user.password.startsWith('$2')) {
    passwordValid = await bcrypt.compare(password, user.password);
  } else {
    passwordValid = user.password === sha2Hash;
    
    // Se válido com SHA2, atualizar para bcrypt
    if (passwordValid) {
      const hashedPassword = await bcrypt.hash(password, 10);
      await pool.execute("UPDATE users SET password = ? WHERE id = ?", [hashedPassword, user.id]);
    }
  }

  if (!passwordValid) {
    return res.status(401).json({ error: "Usuário ou senha inválidos" });
  }

  // Gerar token JWT
  const token = jwt.sign(
    { 
      id: user.id, 
      username: user.username, 
      role: user.role,
      developerName: user.developer_name
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  console.log(`✓ Login bem-sucedido: ${user.username} (${user.role})`);

  res.json({
    token,
    user: {
      id: user.id,
      username: user.username,
      role: user.role,
      developerName: user.developer_name
    }
  });
}));

// Verificar token
app.get("/auth/verify", authenticateToken, (req, res) => {
  res.json({ valid: true, user: req.user });
});

// ============================================
// ROTAS DE WORKS (COM CONTROLE DE ACESSO)
// ============================================

// GET todos os works (filtrado por desenvolvedor para usuários padrão)
app.get("/works", authenticateToken, asyncHandler(async (req, res) => {
  let sql = "SELECT * FROM works ORDER BY delivery_date DESC";
  let params = [];

  // Se for usuário padrão, filtrar apenas seus trabalhos
  if (req.user.role === 'standard' && req.user.developerName) {
    sql = "SELECT * FROM works WHERE developer = ? ORDER BY delivery_date DESC";
    params.push(req.user.developerName);
  }

  const [results] = await pool.execute(sql, params);
  
  console.log(`✓ Carregados ${results.length} projetos para ${req.user.username}`);
  
  res.json(results);
}));

// POST novo work (apenas master)
app.post("/works", authenticateToken, requireMaster, asyncHandler(async (req, res) => {
  const { developer, deadline_type, value, domain, site_type, template, delivery_date, delivery_month, delivery_year, status, developer_status, payment_status, observations } = req.body;
  
  const sql = "INSERT INTO works (developer, deadline_type, value, domain, site_type, template, delivery_date, delivery_month, delivery_year, status, developer_status, payment_status, observations) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
  
  const [result] = await pool.execute(sql, [developer, deadline_type, value, domain, site_type, template || null, delivery_date, delivery_month, delivery_year, status, developer_status || 'Em Andamento', payment_status, observations]);
  
  console.log(`✓ Projeto criado: ID ${result.insertId} - ${domain}`);
  
  res.json({ id: result.insertId, ...req.body });
}));

// PUT para atualizar work (apenas master)
app.put("/works/:id", authenticateToken, requireMaster, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { developer, deadline_type, value, domain, site_type, template, delivery_date, delivery_month, delivery_year, status, developer_status, payment_status, observations } = req.body;

  // Verificar se o registro existe
  const [existing] = await pool.execute("SELECT * FROM works WHERE id = ?", [id]);

  if (existing.length === 0) {
    return res.status(404).json({ error: "Trabalho não encontrado" });
  }

  // Atualizar o registro
  const sql = "UPDATE works SET developer = ?, deadline_type = ?, value = ?, domain = ?, site_type = ?, template = ?, delivery_date = ?, delivery_month = ?, delivery_year = ?, status = ?, developer_status = ?, payment_status = ?, observations = ? WHERE id = ?";
  
  await pool.execute(sql, [developer, deadline_type, value, domain, site_type, template || null, delivery_date, delivery_month, delivery_year, status, developer_status, payment_status, observations, id]);
  
  console.log(`✓ Projeto atualizado: ID ${id} - ${domain}`);
  console.log(`  Template: ${template || 'NULL'}`);
  
  res.json({
    success: true,
    message: "Trabalho atualizado com sucesso",
    updatedWork: { id, developer, deadline_type, value, domain, site_type, delivery_date, delivery_month, delivery_year, status, developer_status, payment_status, observations }
  });
}));

// PATCH para marcar como pago rapidamente (apenas master)
app.patch("/works/:id/mark-paid", authenticateToken, requireMaster, asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  await pool.execute("UPDATE works SET payment_status = 'Pago' WHERE id = ?", [id]);
  
  console.log(`✓ Projeto marcado como pago: ID ${id}`);
  
  res.json({ success: true, message: "Projeto marcado como pago" });
}));

// PATCH para desenvolvedor marcar como concluído (apenas seus próprios projetos)
app.patch("/works/:id/mark-completed", authenticateToken, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { developer_status } = req.body;
  
  // Verificar se o projeto existe e se pertence ao desenvolvedor (para usuários padrão)
  const [existing] = await pool.execute("SELECT * FROM works WHERE id = ?", [id]);
  
  if (existing.length === 0) {
    return res.status(404).json({ error: "Projeto não encontrado" });
  }
  
  const work = existing[0];
  
  // Se for usuário padrão, só pode alterar seus próprios projetos
  if (req.user.role === 'standard' && work.developer !== req.user.developerName) {
    return res.status(403).json({ error: "Você só pode alterar o status dos seus próprios projetos" });
  }
  
  // Validar status
  if (!['Em Andamento', 'Concluído'].includes(developer_status)) {
    return res.status(400).json({ error: "Status inválido. Use 'Em Andamento' ou 'Concluído'" });
  }
  
  // Se está marcando como concluído, salvar a data/hora atual
  // Se está voltando para "Em Andamento", limpar a data
  const completed_at = developer_status === 'Concluído' ? new Date() : null;
  
  await pool.execute(
    "UPDATE works SET developer_status = ?, completed_at = ? WHERE id = ?", 
    [developer_status, completed_at, id]
  );
  
  console.log(`✓ Status do desenvolvedor atualizado: ID ${id} - ${developer_status} por ${req.user.username}`);
  
  res.json({ 
    success: true, 
    message: `Projeto marcado como ${developer_status.toLowerCase()}`,
    developer_status,
    completed_at 
  });
}));

// DELETE work (apenas master)
app.delete("/works/:id", authenticateToken, requireMaster, asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  await pool.execute("DELETE FROM works WHERE id = ?", [id]);
  
  console.log(`✓ Projeto deletado: ID ${id}`);
  
  res.json({ success: true });
}));

// ============================================
// ROTAS DE ESTATÍSTICAS (PARA GRÁFICOS)
// ============================================

// Estatísticas por data (para gráfico de barras)
app.get("/stats/by-date", authenticateToken, asyncHandler(async (req, res) => {
  let sql = `
    SELECT 
      DATE(delivery_date) as date,
      COUNT(*) as total
    FROM works
    WHERE delivery_date IS NOT NULL
  `;
  
  let params = [];
  
  // Se for usuário padrão, filtrar apenas seus trabalhos
  if (req.user.role === 'standard' && req.user.developerName) {
    sql += " AND developer = ?";
    params.push(req.user.developerName);
  }
  
  sql += " GROUP BY DATE(delivery_date) ORDER BY date DESC";
  
  const [results] = await pool.execute(sql, params);
  
  res.json(results);
}));

// Estatísticas por desenvolvedor (para gráfico radar)
app.get("/stats/by-developer", authenticateToken, asyncHandler(async (req, res) => {
  let sql = `
    SELECT 
      developer as dev,
      COUNT(*) as total,
      SUM(CASE WHEN status = 'Entregue' THEN 1 ELSE 0 END) as entregues,
      SUM(CASE WHEN payment_status = 'Pago' THEN 1 ELSE 0 END) as pagos,
      SUM(value) as valor_total
    FROM works
  `;
  
  let params = [];
  
  // Se for usuário padrão, filtrar apenas seus trabalhos
  if (req.user.role === 'standard' && req.user.developerName) {
    sql += " WHERE developer = ?";
    params.push(req.user.developerName);
  }
  
  sql += " GROUP BY developer ORDER BY total DESC";
  
  const [results] = await pool.execute(sql, params);
  
  res.json(results);
}));

// Estatísticas gerais
app.get("/stats/general", authenticateToken, asyncHandler(async (req, res) => {
  let sql = `
    SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN status = 'Entregue' THEN 1 ELSE 0 END) as entregues,
      SUM(CASE WHEN payment_status = 'Pago' THEN 1 ELSE 0 END) as pagos,
      SUM(value) as valor_total,
      AVG(value) as valor_medio,
      COUNT(DISTINCT developer) as total_desenvolvedores
    FROM works
  `;
  
  let params = [];
  
  // Se for usuário padrão, filtrar apenas seus trabalhos
  if (req.user.role === 'standard' && req.user.developerName) {
    sql += " WHERE developer = ?";
    params.push(req.user.developerName);
  }
  
  const [results] = await pool.execute(sql, params);
  
  res.json(results[0]);
}));

// ============================================
// ROTAS DE GERENCIAMENTO DE USUÁRIOS (APENAS MASTER)
// ============================================

// Listar todos os usuários
app.get("/users", authenticateToken, requireMaster, asyncHandler(async (req, res) => {
  const [results] = await pool.execute(
    "SELECT id, username, role, developer_name, active, created_at FROM users ORDER BY created_at DESC"
  );
  res.json(results);
}));

// Criar novo usuário
app.post("/users", authenticateToken, requireMaster, asyncHandler(async (req, res) => {
  const { username, password, role, developerName } = req.body;

  if (!username || !password || !role) {
    return res.status(400).json({ error: "Dados incompletos" });
  }

  if (role === 'standard' && !developerName) {
    return res.status(400).json({ error: "Usuário padrão deve ter um desenvolvedor associado" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const [result] = await pool.execute(
      "INSERT INTO users (username, password, role, developer_name) VALUES (?, ?, ?, ?)",
      [username, hashedPassword, role, role === 'standard' ? developerName : null]
    );
    
    console.log(`✓ Usuário criado: ${username} (${role})`);
    
    res.json({ 
      success: true, 
      message: "Usuário criado com sucesso",
      id: result.insertId 
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: "Nome de usuário já existe" });
    }
    throw error;
  }
}));

// Atualizar usuário
app.put("/users/:id", authenticateToken, requireMaster, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { username, password, role, developerName, active } = req.body;

  let updateFields = [];
  let updateValues = [];

  if (username) {
    updateFields.push("username = ?");
    updateValues.push(username);
  }

  if (password) {
    const hashedPassword = await bcrypt.hash(password, 10);
    updateFields.push("password = ?");
    updateValues.push(hashedPassword);
  }

  if (role) {
    updateFields.push("role = ?");
    updateValues.push(role);
    
    if (role === 'standard' && developerName) {
      updateFields.push("developer_name = ?");
      updateValues.push(developerName);
    } else if (role === 'master') {
      updateFields.push("developer_name = NULL");
    }
  }

  if (typeof active === 'boolean') {
    updateFields.push("active = ?");
    updateValues.push(active);
  }

  if (updateFields.length === 0) {
    return res.status(400).json({ error: "Nenhum campo para atualizar" });
  }

  updateValues.push(id);
  const sql = `UPDATE users SET ${updateFields.join(", ")} WHERE id = ?`;

  try {
    await pool.execute(sql, updateValues);
    console.log(`✓ Usuário atualizado: ID ${id}`);
    res.json({ success: true, message: "Usuário atualizado com sucesso" });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: "Nome de usuário já existe" });
    }
    throw error;
  }
}));

// Deletar usuário
app.delete("/users/:id", authenticateToken, requireMaster, asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (parseInt(id) === req.user.id) {
    return res.status(400).json({ error: "Não é possível deletar seu próprio usuário" });
  }

  await pool.execute("DELETE FROM users WHERE id = ?", [id]);
  
  console.log(`✓ Usuário deletado: ID ${id}`);
  
  res.json({ success: true, message: "Usuário deletado com sucesso" });
}));

// ============================================
// ROTAS DE DEVELOPERS
// ============================================

// GET informações de um desenvolvedor
app.get("/developers/:name", authenticateToken, asyncHandler(async (req, res) => {
  const { name } = req.params;
  
  if (req.user.role === 'standard' && req.user.developerName !== name) {
    return res.status(403).json({ error: "Acesso negado" });
  }

  const [results] = await pool.execute("SELECT * FROM developers WHERE name = ?", [name]);
  
  if (results.length === 0) {
    return res.json(null);
  }
  
  res.json(results[0]);
}));

// GET todos os desenvolvedores (apenas master)
app.get("/developers", authenticateToken, requireMaster, asyncHandler(async (req, res) => {
  const [results] = await pool.execute("SELECT * FROM developers ORDER BY name");
  res.json(results);
}));

// POST/PUT informações de desenvolvedor (apenas master)
app.post("/developers", authenticateToken, requireMaster, asyncHandler(async (req, res) => {
  const { name, phone, email, whatsapp, pixKey, pixType, bankName, agency, account, observations } = req.body;
  
  const [existing] = await pool.execute("SELECT * FROM developers WHERE name = ?", [name]);
  
  if (existing.length > 0) {
    // Atualizar
    const sql = "UPDATE developers SET phone = ?, email = ?, whatsapp = ?, pixKey = ?, pixType = ?, bankName = ?, agency = ?, account = ?, observations = ? WHERE name = ?";
    await pool.execute(sql, [phone, email, whatsapp, pixKey, pixType, bankName, agency, account, observations, name]);
    res.json({ success: true, message: "Desenvolvedor atualizado" });
  } else {
    // Inserir
    const sql = "INSERT INTO developers (name, phone, email, whatsapp, pixKey, pixType, bankName, agency, account, observations) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    const [result] = await pool.execute(sql, [name, phone, email, whatsapp, pixKey, pixType, bankName, agency, account, observations]);
    res.json({ success: true, message: "Desenvolvedor criado", id: result.insertId });
  }
}));

// ============================================
// ROTAS DE IMPORTAÇÃO E LIMPEZA
// ============================================

// Importar CSV
app.post("/import/csv", authenticateToken, requireMaster, asyncHandler(async (req, res) => {
  const { csvData } = req.body;
  
  if (!csvData || !Array.isArray(csvData)) {
    return res.status(400).json({ error: "Dados CSV inválidos" });
  }

  if (csvData.length === 0) {
    return res.json({ success: true, imported: 0, errors: [] });
  }

  let imported = 0;
  let errors = [];

  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    for (let index = 0; index < csvData.length; index++) {
      const row = csvData[index];
      
      try {
        // Converter valor
        let value = 0;
        if (row.value) {
          const valueStr = row.value.toString()
            .replace(/R\$/g, '')
            .replace(/\s/g, '')
            .replace(/\./g, '')
            .replace(',', '.');
          value = parseFloat(valueStr) || 0;
        }

        // Converter data
        let deliveryDate = null;
        if (row.delivery_date) {
          const dateParts = row.delivery_date.trim().split('/');
          if (dateParts.length === 3) {
            const day = dateParts[0].padStart(2, '0');
            const month = dateParts[1].padStart(2, '0');
            const year = dateParts[2];
            deliveryDate = `${year}-${month}-${day}`;
          }
        }

        if (!deliveryDate) {
          errors.push(`Linha ${index + 2}: Data inválida`);
          continue;
        }

        if (!row.developer || !row.domain) {
          errors.push(`Linha ${index + 2}: Desenvolvedor ou domínio ausente`);
          continue;
        }

        const sql = "INSERT INTO works (developer, deadline_type, value, domain, site_type, delivery_date, delivery_month, delivery_year, status, payment_status, observations) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        
        await connection.execute(sql, [
          row.developer.trim(),
          row.deadline_type || 'Normal',
          value,
          row.domain.trim(),
          row.site_type || 'Site Institucional',
          deliveryDate,
          row.delivery_month || '',
          parseInt(row.delivery_year) || new Date().getFullYear(),
          row.status || 'Não Entregue',
          row.payment_status || 'Não Pago',
          row.observations || null
        ]);
        
        imported++;
      } catch (err) {
        errors.push(`Linha ${index + 2}: ${err.message}`);
      }
    }

    await connection.commit();
    console.log(`✓ Importação concluída: ${imported} registros`);
    
    res.json({ success: true, imported, errors });
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}));

// Limpar banco de dados
app.post("/database/clear", authenticateToken, requireMaster, asyncHandler(async (req, res) => {
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({ error: "Senha é obrigatória" });
  }

  const [results] = await pool.execute(
    "SELECT * FROM users WHERE id = ? AND role = 'master'",
    [req.user.id]
  );

  if (results.length === 0) {
    return res.status(403).json({ error: "Usuário não autorizado" });
  }

  const user = results[0];
  
  // Verificar senha
  let passwordValid = false;
  const sha2Hash = crypto.createHash('sha256').update(password).digest('hex');
  
  if (user.password.startsWith('$2')) {
    passwordValid = await bcrypt.compare(password, user.password);
  } else {
    passwordValid = user.password === sha2Hash;
  }

  if (!passwordValid) {
    return res.status(401).json({ error: "Senha incorreta" });
  }

  // Limpar tabela works
  await pool.execute("DELETE FROM works");
  await pool.execute("ALTER TABLE works AUTO_INCREMENT = 1");
  
  console.log(`✓ Banco de dados limpo por ${req.user.username}`);
  
  res.json({ success: true, message: "Banco de dados limpo com sucesso" });
}));

// ============================================
// TRATAMENTO DE ERROS
// ============================================

// Rota não encontrada
app.use((req, res) => {
  res.status(404).json({ error: "Rota não encontrada" });
});

// Tratamento global de erros
app.use((err, req, res, next) => {
  console.error("❌ Erro:", err);
  
  res.status(err.status || 500).json({
    error: err.message || "Erro interno do servidor",
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// ============================================
// INICIAR SERVIDOR
// ============================================

app.listen(PORT, () => {
  console.log('='.repeat(80));
  console.log(`✓ Servidor rodando em http://localhost:${PORT}`);
  console.log(`✓ Sistema de autenticação ativo`);
  console.log(`✓ Banco de dados: ${process.env.DB_NAME || 'worksdb'}`);
  console.log(`✓ Ambiente: ${process.env.NODE_ENV || 'development'}`);
  console.log('='.repeat(80));
});

// Tratamento de encerramento gracioso
process.on('SIGTERM', async () => {
  console.log('\n⚠ SIGTERM recebido. Encerrando servidor...');
  await pool.end();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('\n⚠ SIGINT recebido. Encerrando servidor...');
  await pool.end();
  process.exit(0);
});
