import express from "express";
import cors from "cors";
import mysql from "mysql2/promise";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import dotenv from "dotenv";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import os from "os";

// Carregar variáveis de ambiente
dotenv.config();

const app = express();

app.disable("x-powered-by");

const NODE_ENV = process.env.NODE_ENV || "development";
const rawCorsOrigins = (process.env.CORS_ORIGIN || "").split(",").map((o) => o.trim()).filter(Boolean);

// Configurar CORS
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) {
      return callback(null, true);
    }

    if (rawCorsOrigins.length === 0) {
      if (NODE_ENV !== "production") {
        return callback(null, true);
      }
      return callback(new Error("CORS não permitido"));
    }

    if (rawCorsOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error("CORS não permitido"));
  },
  credentials: rawCorsOrigins.length > 0
};
app.use(cors(corsOptions));

// Headers de segurança
app.use(helmet());

// Rate limit global e para login
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Muitas tentativas. Tente novamente mais tarde." }
});

app.use(globalLimiter);
app.use("/auth/login", loginLimiter);

// Limite padrão de payload (10mb para suportar importações CSV via API)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Configurações
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET || JWT_SECRET.length < 32) {
  console.error("❌ JWT_SECRET ausente ou fraco. Configure uma chave com 32+ caracteres.");
  process.exit(1);
}

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
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: "Token não fornecido" });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    // Verificar sessão ativa no banco de dados
    const [rows] = await pool.execute(
      "SELECT session_token FROM users WHERE id = ? AND active = TRUE",
      [decoded.id]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: "Usuário não encontrado ou inativo" });
    }

    // Se o banco tem session_token, o JWT deve corresponder
    const dbSessionToken = rows[0].session_token;
    if (dbSessionToken && dbSessionToken !== decoded.sessionToken) {
      return res.status(401).json({
        error: "Sessão encerrada. Outro dispositivo fez login com esta conta.",
        code: "SESSION_REPLACED"
      });
    }

    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return res.status(403).json({ error: "Token inválido ou expirado" });
    }
    console.error("Erro na autenticação:", err);
    return res.status(500).json({ error: "Erro interno de autenticação" });
  }
};

// Middleware para verificar se é master
const requireMaster = (req, res, next) => {
  if (req.user.role !== 'master') {
    return res.status(403).json({ error: "Acesso negado. Apenas administradores." });
  }
  next();
};

// ============================================
// HEALTH CHECK (público, sem autenticação)
// ============================================
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString(), uptime: process.uptime() });
});

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

  // Gerar token de sessão único (invalida sessões anteriores em outros dispositivos)
  const sessionToken = crypto.randomUUID();

  await pool.execute(
    "UPDATE users SET session_token = ? WHERE id = ?",
    [sessionToken, user.id]
  );

  // Gerar token JWT (inclui sessionToken para validação)
  const token = jwt.sign(
    { 
      id: user.id, 
      username: user.username, 
      role: user.role,
      developerName: user.developer_name,
      sessionToken
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  console.log(`✓ Login bem-sucedido: ${user.username} (${user.role}) — sessão anterior invalidada`);

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

// Logout (invalidar sessão no servidor)
app.post("/auth/logout", authenticateToken, asyncHandler(async (req, res) => {
  await pool.execute(
    "UPDATE users SET session_token = NULL WHERE id = ?",
    [req.user.id]
  );

  console.log(`✓ Logout: ${req.user.username}`);

  res.json({ success: true, message: "Logout realizado com sucesso" });
}));

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
  const { developer, deadline_type, value, domain, site_type, template, delivery_date, delivery_month, delivery_year, status, developer_status, payment_status, observations, rating_aparencia, rating_complexidade, rating_satisfacao, rating_material, rating_observacoes } = req.body;

  // Validação de campos obrigatórios
  if (!developer || !domain || !site_type || !delivery_date) {
    return res.status(400).json({ error: "Campos obrigatórios: developer, domain, site_type, delivery_date" });
  }

  if (value === undefined || value === null || isNaN(Number(value))) {
    return res.status(400).json({ error: "Campo 'value' deve ser um número válido" });
  }

  // Garantir que o value é numérico
  const numericValue = Number(value);

  // Normalizar delivery_date para formato YYYY-MM-DD
  let normalizedDate = delivery_date;
  if (typeof delivery_date === 'string' && delivery_date.includes('T')) {
    normalizedDate = delivery_date.split('T')[0];
  }

  const sql = "INSERT INTO works (developer, deadline_type, value, domain, site_type, template, delivery_date, delivery_month, delivery_year, status, developer_status, payment_status, observations, rating_aparencia, rating_complexidade, rating_satisfacao, rating_material, rating_observacoes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
  
  const finalDeveloperStatus = developer_status || 'Em Andamento';
  const finalStatus = status || 'Não Entregue';
  const finalPaymentStatus = payment_status || 'Não Pago';

  const [result] = await pool.execute(sql, [developer.trim(), deadline_type || 'Normal', numericValue, domain.trim(), site_type, template || null, normalizedDate, delivery_month || '', delivery_year || new Date().getFullYear(), finalStatus, finalDeveloperStatus, finalPaymentStatus, observations || null, rating_aparencia || null, rating_complexidade || null, rating_satisfacao || null, rating_material || null, rating_observacoes || null]);
  
  console.log(`✓ Projeto criado: ID ${result.insertId} - ${domain}`);
  
  // Retornar dados normalizados com o ID gerado
  res.json({
    id: result.insertId,
    developer: developer.trim(),
    deadline_type: deadline_type || 'Normal',
    value: numericValue,
    domain: domain.trim(),
    site_type,
    template: template || null,
    delivery_date: normalizedDate,
    delivery_month: delivery_month || '',
    delivery_year: delivery_year || new Date().getFullYear(),
    status: finalStatus,
    developer_status: finalDeveloperStatus,
    payment_status: finalPaymentStatus,
    observations: observations || null
  });
}));

// PUT para atualizar work (apenas master)
app.put("/works/:id", authenticateToken, requireMaster, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { developer, deadline_type, value, domain, site_type, template, delivery_date, delivery_month, delivery_year, status, developer_status, payment_status, observations, rating_aparencia, rating_complexidade, rating_satisfacao, rating_material, rating_observacoes } = req.body;

  // Validação de campos obrigatórios
  if (!developer || !domain || !site_type || !delivery_date) {
    return res.status(400).json({ error: "Campos obrigatórios: developer, domain, site_type, delivery_date" });
  }

  if (value === undefined || value === null || isNaN(Number(value))) {
    return res.status(400).json({ error: "Campo 'value' deve ser um número válido" });
  }

  // Verificar se o registro existe
  const [existing] = await pool.execute("SELECT * FROM works WHERE id = ?", [id]);

  if (existing.length === 0) {
    return res.status(404).json({ error: "Trabalho não encontrado" });
  }

  const oldWork = existing[0];

  // Normalizar delivery_date para formato YYYY-MM-DD
  let normalizedDate = delivery_date;
  if (typeof delivery_date === 'string' && delivery_date.includes('T')) {
    normalizedDate = delivery_date.split('T')[0];
  }

  // Se o status mudou para "Entregue" e não estava "Entregue" antes,
  // marcar automaticamente como "Concluído" com logs
  let finalDeveloperStatus = developer_status;
  let completed_at = oldWork.completed_at;
  let completed_by = oldWork.completed_by;

  if (status === 'Entregue' && oldWork.status !== 'Entregue') {
    finalDeveloperStatus = 'Concluído';
    completed_at = new Date();
    completed_by = `${req.user.username} (Master)`;
    console.log(`✓ Status "Entregue" detectado - marcando automaticamente como "Concluído"`);
    console.log(`  Completado por: ${completed_by} em ${completed_at}`);
  }

  // Garantir que value é numérico
  const numericValue = Number(value);

  // Atualizar o registro
  const sql = "UPDATE works SET developer = ?, deadline_type = ?, value = ?, domain = ?, site_type = ?, template = ?, delivery_date = ?, delivery_month = ?, delivery_year = ?, status = ?, developer_status = ?, payment_status = ?, observations = ?, completed_at = ?, completed_by = ?, rating_aparencia = ?, rating_complexidade = ?, rating_satisfacao = ?, rating_material = ?, rating_observacoes = ? WHERE id = ?";
  
  await pool.execute(sql, [developer.trim(), deadline_type || 'Normal', numericValue, domain.trim(), site_type, template || null, normalizedDate, delivery_month || '', delivery_year || new Date().getFullYear(), status || 'Não Entregue', finalDeveloperStatus, payment_status || 'Não Pago', observations || null, completed_at, completed_by, rating_aparencia || null, rating_complexidade || null, rating_satisfacao || null, rating_material || null, rating_observacoes || null, id]);
  
  console.log(`✓ Projeto atualizado: ID ${id} - ${domain}`);
  console.log(`  Template: ${template || 'NULL'}`);
  console.log(`  Status: ${status} | Developer Status: ${finalDeveloperStatus}`);
  
  res.json({
    success: true,
    message: "Trabalho atualizado com sucesso",
    updatedWork: { id: Number(id), developer: developer.trim(), deadline_type: deadline_type || 'Normal', value: numericValue, domain: domain.trim(), site_type, template: template || null, delivery_date: normalizedDate, delivery_month: delivery_month || '', delivery_year: delivery_year || new Date().getFullYear(), status: status || 'Não Entregue', developer_status: finalDeveloperStatus, payment_status: payment_status || 'Não Pago', observations: observations || null, completed_at, completed_by, rating_aparencia: rating_aparencia || null, rating_complexidade: rating_complexidade || null, rating_satisfacao: rating_satisfacao || null, rating_material: rating_material || null, rating_observacoes: rating_observacoes || null }
  });
}));

// PATCH para marcar como pago rapidamente (apenas master)
app.patch("/works/:id/mark-paid", authenticateToken, requireMaster, asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Verificar se o projeto existe
  const [existing] = await pool.execute("SELECT id FROM works WHERE id = ?", [id]);
  if (existing.length === 0) {
    return res.status(404).json({ error: "Projeto não encontrado" });
  }

  await pool.execute("UPDATE works SET payment_status = 'Pago' WHERE id = ?", [id]);
  
  console.log(`✓ Projeto marcado como pago: ID ${id}`);
  
  res.json({ success: true, message: "Projeto marcado como pago" });
}));

// PATCH para marcar como concluído (Master ou Desenvolvedor responsável)
app.patch("/works/:id/mark-completed", authenticateToken, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { developer_status } = req.body;
  
  // Verificar se o projeto existe
  const [existing] = await pool.execute("SELECT * FROM works WHERE id = ?", [id]);
  
  if (existing.length === 0) {
    return res.status(404).json({ error: "Projeto não encontrado" });
  }
  
  const work = existing[0];
  
  // Verificar permissões: Master pode alterar qualquer projeto, Desenvolvedor apenas os seus
  const isMaster = req.user.role === 'master';
  const isDeveloperOwner = req.user.role === 'standard' && work.developer === req.user.developerName;
  
  if (!isMaster && !isDeveloperOwner) {
    return res.status(403).json({ error: "Você só pode alterar o status dos seus próprios projetos" });
  }
  
  // Validar status
  if (!['Em Andamento', 'Concluído'].includes(developer_status)) {
    return res.status(400).json({ error: "Status inválido. Use 'Em Andamento' ou 'Concluído'" });
  }
  
  // Se está marcando como concluído, salvar a data/hora atual e quem completou
  // Se está voltando para "Em Andamento", limpar a data e o responsável
  const completed_at = developer_status === 'Concluído' ? new Date() : null;
  const completed_by = developer_status === 'Concluído' 
    ? (isMaster ? `${req.user.username} (Master)` : req.user.developerName)
    : null;
  
  await pool.execute(
    "UPDATE works SET developer_status = ?, completed_at = ?, completed_by = ? WHERE id = ?", 
    [developer_status, completed_at, completed_by, id]
  );
  
  console.log(`✓ Status atualizado: ID ${id} - ${developer_status} por ${req.user.username} (${req.user.role})`);
  if (completed_by) {
    console.log(`  Completado por: ${completed_by} em ${completed_at}`);
  }
  
  res.json({ 
    success: true, 
    message: `Projeto marcado como ${developer_status.toLowerCase()}`,
    developer_status,
    completed_at,
    completed_by
  });
}));

// DELETE work (apenas master)
app.delete("/works/:id", authenticateToken, requireMaster, asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Verificar se o projeto existe
  const [existing] = await pool.execute("SELECT id FROM works WHERE id = ?", [id]);
  if (existing.length === 0) {
    return res.status(404).json({ error: "Projeto não encontrado" });
  }

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

  if (password.length < 6) {
    return res.status(400).json({ error: "A senha deve ter pelo menos 6 caracteres" });
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
    if (password.length < 6) {
      return res.status(400).json({ error: "A senha deve ter pelo menos 6 caracteres" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    updateFields.push("password = ?");
    updateValues.push(hashedPassword);
  }

  if (role) {
    updateFields.push("role = ?");
    updateValues.push(role);
    
    if (role === 'master') {
      updateFields.push("developer_name = ?");
      updateValues.push(null);
    } else if (role === 'standard') {
      if (!developerName) {
        return res.status(400).json({ error: "Usuário padrão deve ter um desenvolvedor associado" });
      }
      updateFields.push("developer_name = ?");
      updateValues.push(developerName);
    }
  } else if (developerName !== undefined) {
    // Permite atualizar developer_name mesmo sem alterar role
    updateFields.push("developer_name = ?");
    updateValues.push(developerName || null);
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

        const sql = "INSERT INTO works (developer, deadline_type, value, domain, site_type, template, delivery_date, delivery_month, delivery_year, status, developer_status, payment_status, observations) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        
        await connection.execute(sql, [
          row.developer.trim(),
          row.deadline_type || 'Normal',
          value,
          row.domain.trim(),
          row.site_type || 'Site Institucional',
          row.template || null,
          deliveryDate,
          row.delivery_month || '',
          parseInt(row.delivery_year) || new Date().getFullYear(),
          row.status || 'Não Entregue',
          row.developer_status || 'Em Andamento',
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

const HOST = process.env.HOST || "0.0.0.0";

app.listen(PORT, HOST, () => {
  const nets = os.networkInterfaces();
  const ips = [];
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        ips.push({ name, address: net.address });
      }
    }
  }

  console.log('='.repeat(80));
  console.log(`✓ Servidor rodando em http://localhost:${PORT}`);
  if (ips.length > 0) {
    for (const ip of ips) {
      console.log(`✓ Rede (${ip.name}): http://${ip.address}:${PORT}`);
    }
  }
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
