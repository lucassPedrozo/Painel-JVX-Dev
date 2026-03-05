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
import https from "https";
import http from "http";
import dns from "dns";
import { promisify } from "util";

const dnsResolve4 = promisify(dns.resolve4);

// ============================================
// DOWN DETECTOR — Módulos reutilizáveis
// ============================================

// Agents HTTP com keep-alive para reutilizar conexões TCP/TLS
const keepAliveHttpAgent = new http.Agent({ keepAlive: true, maxSockets: 50, timeout: 10000 });
const keepAliveHttpsAgent = new https.Agent({ keepAlive: true, maxSockets: 50, timeout: 10000 });
const keepAliveHttpsInsecureAgent = new https.Agent({ keepAlive: true, maxSockets: 50, timeout: 10000, rejectUnauthorized: false });

// Cache DNS persistente com TTL (evita resolver o mesmo domínio repetidamente)
const DNS_CACHE_TTL_MS = 120_000; // 2 minutos
const dnsCacheMap = new Map();

async function cachedDnsResolve(hostname) {
  const entry = dnsCacheMap.get(hostname);
  if (entry && Date.now() - entry.ts < DNS_CACHE_TTL_MS) return entry.ip;
  try {
    const addrs = await dnsResolve4(hostname);
    const ip = addrs[0] || null;
    dnsCacheMap.set(hostname, { ip, ts: Date.now() });
    return ip;
  } catch {
    dnsCacheMap.set(hostname, { ip: null, ts: Date.now() });
    return null;
  }
}

// Semáforo assíncrono baseado em fila (zero polling, zero desperdício)
function createSemaphore(max) {
  let count = 0;
  const queue = [];
  return {
    acquire() {
      return new Promise(resolve => {
        if (count < max) { count++; resolve(); }
        else queue.push(resolve);
      });
    },
    release() {
      count--;
      if (queue.length > 0) { count++; queue.shift()(); }
    }
  };
}

// Semáforo global para conexões de saída do Down Detector
const ddGlobalSemaphore = createSemaphore(30);

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
// FERRAMENTAS - GERADOR DE SENHAS
// ============================================

// GET histórico de mensagens do gerador de senhas
app.get("/ferramentas/historico-senhas", authenticateToken, asyncHandler(async (req, res) => {
  const userId = req.user.id;

  // Criar tabela se não existir
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS password_history (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      mensagem TEXT NOT NULL,
      timestamp BIGINT NOT NULL,
      fixada BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      INDEX idx_user_timestamp (user_id, timestamp DESC)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  // Buscar histórico do usuário
  const [rows] = await pool.execute(
    "SELECT id, mensagem, timestamp, fixada FROM password_history WHERE user_id = ? ORDER BY fixada DESC, timestamp DESC LIMIT 5",
    [userId]
  );

  res.json(rows.map(row => ({
    id: String(row.id),
    mensagem: row.mensagem,
    timestamp: Number(row.timestamp),
    fixada: Boolean(row.fixada)
  })));
}));

// POST salvar histórico de mensagens
app.post("/ferramentas/historico-senhas", authenticateToken, asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { historico } = req.body;

  if (!Array.isArray(historico)) {
    return res.status(400).json({ error: "Histórico inválido" });
  }

  // Remover histórico anterior do usuário
  await pool.execute("DELETE FROM password_history WHERE user_id = ?", [userId]);

  // Inserir novo histórico
  if (historico.length > 0) {
    const values = historico.map(item => [
      userId,
      item.mensagem,
      item.timestamp,
      item.fixada ? 1 : 0
    ]);

    const placeholders = values.map(() => "(?, ?, ?, ?)").join(", ");
    const flatValues = values.flat();

    await pool.execute(
      `INSERT INTO password_history (user_id, mensagem, timestamp, fixada) VALUES ${placeholders}`,
      flatValues
    );
  }

  res.json({ success: true, message: "Histórico salvo com sucesso" });
}));

// POST gerar link seguro via OneTimeSecret
app.post("/ferramentas/gerar-link-senha", authenticateToken, asyncHandler(async (req, res) => {
  const { linkAcesso, login, senha, mensagem, tempoExpiracao } = req.body;
  const userId = req.user.id;
  const username = req.user.username;

  // Validações
  if (!linkAcesso || !linkAcesso.trim()) {
    return res.status(400).json({ error: "Link de acesso é obrigatório" });
  }

  if (!login || !login.trim()) {
    return res.status(400).json({ error: "Login é obrigatório" });
  }

  if (!senha || !senha.trim()) {
    return res.status(400).json({ error: "Senha é obrigatória" });
  }

  // Mapear tempo de expiração para segundos
  const ttlMap = {
    '1h': 3600,
    '6h': 21600,
    '12h': 43200,
    '24h': 86400,
    '48h': 172800,
    '7d': 604800,
  };

  const ttl = ttlMap[tempoExpiracao] || 86400; // Default: 24h

  // Montar conteúdo secreto
  const conteudo = `🔐 Credenciais de Acesso

📍 Link: ${linkAcesso.trim()}
👤 Login: ${login.trim()}
🔑 Senha: ${senha.trim()}
${mensagem && mensagem.trim() ? `\n📝 Mensagem: ${mensagem.trim()}` : ''}

---
⚠️ Este link expira automaticamente e só pode ser visualizado UMA vez.
🔒 Gerado através do sistema JVX em ${new Date().toLocaleString('pt-BR')}`;

  try {
    // Chamar API do OneTimeSecret
    const otsResponse = await fetch('https://onetimesecret.com/api/v1/share', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        secret: conteudo,
        ttl: String(ttl),
      }),
    });

    if (!otsResponse.ok) {
      const errorText = await otsResponse.text();
      console.error('Erro OneTimeSecret:', errorText);
      throw new Error('Falha ao gerar link seguro. Tente novamente.');
    }

    const otsData = await otsResponse.json();
    const linkSeguro = `https://onetimesecret.com/secret/${otsData.secret_key}`;

    // Log de auditoria (criar tabela se não existir)
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS password_links_audit (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        username VARCHAR(50) NOT NULL,
        link_acesso VARCHAR(500) NOT NULL,
        login_compartilhado VARCHAR(255) NOT NULL,
        mensagem TEXT,
        tempo_expiracao VARCHAR(10),
        secret_key VARCHAR(100) NOT NULL,
        link_gerado VARCHAR(500) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_created (user_id, created_at DESC),
        INDEX idx_secret_key (secret_key)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Salvar log de auditoria
    await pool.execute(
      `INSERT INTO password_links_audit 
       (user_id, username, link_acesso, login_compartilhado, mensagem, tempo_expiracao, secret_key, link_gerado) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        username,
        linkAcesso.trim(),
        login.trim(),
        mensagem ? mensagem.trim() : null,
        tempoExpiracao,
        otsData.secret_key,
        linkSeguro
      ]
    );

    console.log(`✓ Link seguro gerado por ${username} (ID: ${userId}) - Expira em: ${tempoExpiracao}`);

    res.json({
      success: true,
      linkSeguro,
      secret_key: otsData.secret_key,
      expiracao: tempoExpiracao,
      metadata: {
        created: new Date().toISOString(),
        ttl_seconds: ttl
      }
    });

  } catch (error) {
    console.error('Erro ao gerar link seguro:', error);
    throw new Error(error.message || 'Erro ao gerar link seguro');
  }
}));

// GET histórico de links gerados (auditoria)
app.get("/ferramentas/historico-links-gerados", authenticateToken, asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const isMaster = req.user.role === 'master';
  
  // Verificar se tabela existe
  const [tables] = await pool.execute(
    "SHOW TABLES LIKE 'password_links_audit'"
  );
  
  if (tables.length === 0) {
    return res.json([]);
  }

  // Master pode ver todos, usuário padrão vê apenas os seus
  const query = isMaster
    ? `SELECT id, username, link_acesso, login_compartilhado, mensagem, tempo_expiracao, 
       secret_key, created_at 
       FROM password_links_audit 
       ORDER BY created_at DESC 
       LIMIT 50`
    : `SELECT id, link_acesso, login_compartilhado, mensagem, tempo_expiracao, 
       secret_key, created_at 
       FROM password_links_audit 
       WHERE user_id = ? 
       ORDER BY created_at DESC 
       LIMIT 20`;

  const params = isMaster ? [] : [userId];
  const [rows] = await pool.execute(query, params);

  res.json(rows.map(row => ({
    id: row.id,
    ...(isMaster && { username: row.username }),
    linkAcesso: row.link_acesso,
    login: row.login_compartilhado,
    mensagem: row.mensagem,
    tempoExpiracao: row.tempo_expiracao,
    secretKey: row.secret_key,
    createdAt: row.created_at
  })));
}));

// ============================================
// FERRAMENTAS - DOWN DETECTOR
// ============================================

// Criar tabela de sites monitorados (executa on-demand)
async function ensureDownDetectorTable() {
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS monitored_sites (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      url VARCHAR(500) NOT NULL,
      status ENUM('online', 'offline', 'pending', 'ssl') DEFAULT 'pending',
      status_code INT NULL,
      ip_address VARCHAR(45) NULL,
      last_checked BIGINT NULL,
      added_at BIGINT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      INDEX idx_user_sites (user_id),
      INDEX idx_status (status)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  // Migrar ENUM caso tabela já exista sem o valor 'ssl'
  try {
    await pool.execute(`ALTER TABLE monitored_sites MODIFY COLUMN status ENUM('online', 'offline', 'pending', 'ssl') DEFAULT 'pending'`);
  } catch {
    // Ignora se já está atualizado
  }

  // Adicionar coluna ip_address se não existir
  try {
    await pool.execute(`ALTER TABLE monitored_sites ADD COLUMN ip_address VARCHAR(45) NULL AFTER status_code`);
  } catch {
    // Ignora se já existe
  }

  // Tabela de histórico de verificações
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS site_check_history (
      id INT AUTO_INCREMENT PRIMARY KEY,
      site_id INT NOT NULL,
      status ENUM('online', 'offline', 'ssl') NOT NULL,
      status_code INT NULL,
      checked_at BIGINT NOT NULL,
      INDEX idx_site_checked (site_id, checked_at),
      FOREIGN KEY (site_id) REFERENCES monitored_sites(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
}

// GET listar sites monitorados do usuário
app.get("/ferramentas/down-detector/sites", authenticateToken, asyncHandler(async (req, res) => {
  await ensureDownDetectorTable();

  const [rows] = await pool.execute(
    "SELECT id, url, status, status_code, ip_address, last_checked, added_at FROM monitored_sites ORDER BY added_at DESC"
  );

  res.json(rows.map(row => ({
    id: String(row.id),
    url: row.url,
    status: row.status,
    statusCode: row.status_code,
    ipAddress: row.ip_address || null,
    lastChecked: row.last_checked ? Number(row.last_checked) : null,
    addedAt: Number(row.added_at)
  })));
}));

// POST adicionar site
app.post("/ferramentas/down-detector/sites", authenticateToken, asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { url } = req.body;
  await ensureDownDetectorTable();

  if (!url || !url.trim()) {
    return res.status(400).json({ error: "URL é obrigatória" });
  }

  // Verificar duplicata (global, não por usuário)
  const [existing] = await pool.execute(
    "SELECT id FROM monitored_sites WHERE LOWER(url) = LOWER(?)",
    [url.trim()]
  );

  if (existing.length > 0) {
    return res.status(409).json({ error: "Este site já está na lista" });
  }

  const addedAt = Date.now();
  const [result] = await pool.execute(
    "INSERT INTO monitored_sites (user_id, url, status, added_at) VALUES (?, ?, 'pending', ?)",
    [userId, url.trim(), addedAt]
  );

  res.status(201).json({
    id: String(result.insertId),
    url: url.trim(),
    status: 'pending',
    statusCode: null,
    ipAddress: null,
    lastChecked: null,
    addedAt
  });
}));

// POST adicionar múltiplos sites (importação CSV)
app.post("/ferramentas/down-detector/sites/import", authenticateToken, asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { urls } = req.body;
  await ensureDownDetectorTable();

  if (!Array.isArray(urls) || urls.length === 0) {
    return res.status(400).json({ error: "Lista de URLs vazia" });
  }

  // Buscar URLs existentes (global)
  const [existing] = await pool.execute(
    "SELECT LOWER(url) as url FROM monitored_sites"
  );
  const existingUrls = new Set(existing.map(r => r.url));

  const now = Date.now();
  const newSites = [];
  const skipped = [];

  for (const rawUrl of urls) {
    const url = rawUrl.trim();
    if (!url) continue;

    if (existingUrls.has(url.toLowerCase())) {
      skipped.push(url);
      continue;
    }

    existingUrls.add(url.toLowerCase());
    newSites.push(url);
  }

  if (newSites.length > 0) {
    const values = newSites.map(url => [userId, url, 'pending', now]);
    const placeholders = values.map(() => "(?, ?, ?, ?)").join(", ");
    const flatValues = values.flat();

    await pool.execute(
      `INSERT INTO monitored_sites (user_id, url, status, added_at) VALUES ${placeholders}`,
      flatValues
    );
  }

  // Buscar lista atualizada
  const [rows] = await pool.execute(
    "SELECT id, url, status, status_code, ip_address, last_checked, added_at FROM monitored_sites ORDER BY added_at DESC"
  );

  res.json({
    success: true,
    imported: newSites.length,
    skipped: skipped.length,
    sites: rows.map(row => ({
      id: String(row.id),
      url: row.url,
      status: row.status,
      statusCode: row.status_code,
      ipAddress: row.ip_address || null,
      lastChecked: row.last_checked ? Number(row.last_checked) : null,
      addedAt: Number(row.added_at)
    }))
  });
}));

// DELETE remover site
app.delete("/ferramentas/down-detector/sites/:id", authenticateToken, asyncHandler(async (req, res) => {
  const siteId = req.params.id;
  await ensureDownDetectorTable();

  const [result] = await pool.execute(
    "DELETE FROM monitored_sites WHERE id = ?",
    [siteId]
  );

  if (result.affectedRows === 0) {
    return res.status(404).json({ error: "Site não encontrado" });
  }

  res.json({ success: true });
}));

// DELETE remover múltiplos sites
app.post("/ferramentas/down-detector/sites/remove-bulk", authenticateToken, asyncHandler(async (req, res) => {
  const { ids } = req.body;
  await ensureDownDetectorTable();

  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: "Lista de IDs vazia" });
  }

  const placeholders = ids.map(() => "?").join(", ");
  await pool.execute(
    `DELETE FROM monitored_sites WHERE id IN (${placeholders})`,
    [...ids]
  );

  res.json({ success: true });
}));

// POST verificar status de sites (todos ou por IDs específicos)
app.post("/ferramentas/down-detector/check", authenticateToken, asyncHandler(async (req, res) => {
  await ensureDownDetectorTable();

  const { ids } = req.body || {};

  // --- Validação de entrada ---
  if (ids !== undefined && !Array.isArray(ids)) {
    return res.status(400).json({ error: 'O campo ids deve ser um array' });
  }

  let rows;
  if (Array.isArray(ids) && ids.length > 0) {
    const safeIds = ids.map(id => String(id)).filter(id => /^\d+$/.test(id));
    if (safeIds.length === 0) return res.json({ success: true, results: [] });
    const placeholders = safeIds.map(() => "?").join(", ");
    const [selected] = await pool.execute(
      `SELECT id, url FROM monitored_sites WHERE id IN (${placeholders})`,
      safeIds
    );
    rows = selected;
  } else {
    const [all] = await pool.execute("SELECT id, url FROM monitored_sites");
    rows = all;
  }

  if (rows.length === 0) {
    return res.json({ success: true, results: [] });
  }

  const now = Date.now();
  const MAX_REDIRECTS = 5;
  const TIMEOUT_MS = 4000;
  const MAX_PER_HOST = 5;
  const DELAY_PER_HOST_MS = 100;

  const sleep = (ms) => new Promise(r => setTimeout(r, ms));

  // --- checkUrl: HEAD com fallback GET, keep-alive, limite de redirects ---
  function checkUrl(url, rejectUnauthorized = true, redirectCount = 0, method = 'HEAD') {
    return new Promise((resolve, reject) => {
      if (redirectCount > MAX_REDIRECTS) {
        return reject(new Error('Too many redirects'));
      }

      let parsedUrl;
      try { parsedUrl = new URL(url); } catch { return reject(new Error('Invalid URL')); }

      const isHttps = parsedUrl.protocol === 'https:';
      const lib = isHttps ? https : http;
      const agent = isHttps
        ? (rejectUnauthorized ? keepAliveHttpsAgent : keepAliveHttpsInsecureAgent)
        : keepAliveHttpAgent;

      const options = {
        hostname: parsedUrl.hostname,
        port: parsedUrl.port || (isHttps ? 443 : 80),
        path: parsedUrl.pathname + parsedUrl.search,
        method,
        timeout: TIMEOUT_MS,
        agent,
        headers: {
          'User-Agent': 'JVX-DownDetector/1.0',
          Connection: 'keep-alive',
        },
      };

      const req = lib.request(options, (response) => {
        if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
          response.resume();
          try {
            const redirectUrl = new URL(response.headers.location, url).toString();
            checkUrl(redirectUrl, rejectUnauthorized, redirectCount + 1, method)
              .then(resolve).catch(reject);
          } catch { reject(new Error('Invalid redirect URL')); }
          return;
        }
        response.resume();
        resolve({ statusCode: response.statusCode });
      });

      req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
      req.on('error', (err) => {
        // Se HEAD falhar por motivo não-SSL, tenta GET como fallback
        if (method === 'HEAD' && !err.message?.includes('CERT') && !err.message?.includes('SSL')) {
          checkUrl(url, rejectUnauthorized, redirectCount, 'GET').then(resolve).catch(reject);
          return;
        }
        const msg = err.message || '';
        const isSslError = msg.includes('CERT') || msg.includes('SSL') || msg.includes('certificate')
          || err.code === 'UNABLE_TO_VERIFY_LEAF_SIGNATURE'
          || err.code === 'ERR_TLS_CERT_ALTNAME_INVALID'
          || err.code === 'DEPTH_ZERO_SELF_SIGNED_CERT'
          || err.code === 'SELF_SIGNED_CERT_IN_CHAIN';
        reject({ isSslError, originalError: err });
      });
      req.end();
    });
  }

  // --- checkSite: verifica um site individual ---
  async function checkSite(site, preResolvedIp) {
    let status = 'offline';
    let statusCode = null;
    const ipAddress = preResolvedIp;

    try {
      const result = await checkUrl(site.url, true);
      statusCode = result.statusCode;
      status = (statusCode >= 200 && statusCode < 300) ? 'online' : 'offline';
    } catch (err) {
      if (err && err.isSslError) {
        try {
          const result2 = await checkUrl(site.url, false);
          statusCode = result2.statusCode;
          status = (statusCode >= 200 && statusCode < 300) ? 'ssl' : 'offline';
        } catch {
          status = 'offline';
          statusCode = null;
        }
      }
    }

    return { id: String(site.id), url: site.url, status, statusCode, ipAddress, lastChecked: now };
  }

  // --- FASE 1: Resolver DNS de todos os sites (cache persistente, muito rápido) ---
  const resolvedSites = await Promise.all(
    rows.map(async (site) => {
      try {
        const hostname = new URL(site.url).hostname;
        const ip = await cachedDnsResolve(hostname);
        return { ...site, resolvedIp: ip || 'unknown' };
      } catch {
        return { ...site, resolvedIp: 'unknown' };
      }
    })
  );

  // --- FASE 2: Agrupar por IP de destino ---
  const byIp = new Map();
  for (const site of resolvedSites) {
    const ip = site.resolvedIp;
    if (!byIp.has(ip)) byIp.set(ip, []);
    byIp.get(ip).push(site);
  }

  // --- FASE 3: Verificar com controle de concorrência ---
  // Cada grupo de IP processa mini-lotes de MAX_PER_HOST com delay entre eles.
  // O semáforo global limita o total de conexões de saída simultâneas.
  const results = [];

  async function processHostGroup(sites) {
    const groupResults = [];
    for (let i = 0; i < sites.length; i += MAX_PER_HOST) {
      const batch = sites.slice(i, i + MAX_PER_HOST);
      const batchResults = await Promise.all(
        batch.map(async (site) => {
          await ddGlobalSemaphore.acquire();
          try {
            return await checkSite(site, site.resolvedIp);
          } finally {
            ddGlobalSemaphore.release();
          }
        })
      );
      groupResults.push(...batchResults);
      // Delay entre mini-lotes para o mesmo IP (evita bloqueio)
      if (i + MAX_PER_HOST < sites.length) {
        await sleep(DELAY_PER_HOST_MS);
      }
    }
    return groupResults;
  }

  // Processar todos os grupos de IPs em paralelo
  const allGroupResults = await Promise.all(
    Array.from(byIp.values()).map(group => processHostGroup(group))
  );
  for (const gr of allGroupResults) results.push(...gr);

  // --- FASE 4: Batch UPDATE no banco com queries parametrizadas ---
  const DB_BATCH_SIZE = 500;
  for (let i = 0; i < results.length; i += DB_BATCH_SIZE) {
    const chunk = results.slice(i, i + DB_BATCH_SIZE);
    const caseStatus = chunk.map(() => `WHEN ? THEN ?`).join(' ');
    const caseCode = chunk.map(r => `WHEN ? THEN ${r.statusCode !== null ? '?' : 'NULL'}`).join(' ');
    const caseIp = chunk.map(r => `WHEN ? THEN ${r.ipAddress ? '?' : 'NULL'}`).join(' ');
    const idPlaceholders = chunk.map(() => '?').join(',');

    const params = [];
    // CASE status
    for (const r of chunk) { params.push(r.id, r.status); }
    // CASE status_code
    for (const r of chunk) { params.push(r.id); if (r.statusCode !== null) params.push(r.statusCode); }
    // CASE ip_address
    for (const r of chunk) { params.push(r.id); if (r.ipAddress) params.push(r.ipAddress); }
    // last_checked
    params.push(now);
    // WHERE IN
    for (const r of chunk) { params.push(r.id); }

    await pool.execute(`
      UPDATE monitored_sites SET
        status = CASE id ${caseStatus} END,
        status_code = CASE id ${caseCode} END,
        ip_address = CASE id ${caseIp} END,
        last_checked = ?
      WHERE id IN (${idPlaceholders})
    `, params);
  }

  // --- FASE 5: Gravar histórico de verificações ---
  const HISTORY_BATCH = 500;
  for (let i = 0; i < results.length; i += HISTORY_BATCH) {
    const chunk = results.slice(i, i + HISTORY_BATCH);
    const placeholders = chunk.map(() => '(?, ?, ?, ?)').join(', ');
    const histParams = [];
    for (const r of chunk) {
      histParams.push(r.id, r.status, r.statusCode, now);
    }
    await pool.execute(
      `INSERT INTO site_check_history (site_id, status, status_code, checked_at) VALUES ${placeholders}`,
      histParams
    );
  }

  // Limpar registros antigos (manter apenas últimos 50 por site)
  try {
    await pool.execute(`
      DELETE h FROM site_check_history h
      INNER JOIN (
        SELECT site_id, checked_at
        FROM (
          SELECT site_id, checked_at,
            ROW_NUMBER() OVER (PARTITION BY site_id ORDER BY checked_at DESC) as rn
          FROM site_check_history
        ) ranked
        WHERE rn > 50
      ) old ON h.site_id = old.site_id AND h.checked_at = old.checked_at
    `);
  } catch {
    // Ignora erro de limpeza
  }

  res.json({ success: true, results, total: rows.length });
}));

// GET histórico de verificações de um site
app.get("/ferramentas/down-detector/sites/:id/history", authenticateToken, asyncHandler(async (req, res) => {
  await ensureDownDetectorTable();
  const siteId = req.params.id;
  const limit = Math.min(parseInt(req.query.limit) || 30, 50);

  const [rows] = await pool.execute(
    `SELECT status, status_code, checked_at FROM site_check_history WHERE site_id = ? ORDER BY checked_at DESC LIMIT ?`,
    [siteId, limit]
  );

  res.json(rows.map(r => ({
    status: r.status,
    statusCode: r.status_code,
    checkedAt: Number(r.checked_at)
  })).reverse());
}));

// GET histórico de todos os sites (bulk) — retorna últimas N verificações de cada site
app.get("/ferramentas/down-detector/history", authenticateToken, asyncHandler(async (req, res) => {
  await ensureDownDetectorTable();
  const limit = Math.min(parseInt(req.query.limit) || 30, 50);

  const [rows] = await pool.execute(`
    SELECT site_id, status, status_code, checked_at
    FROM (
      SELECT site_id, status, status_code, checked_at,
        ROW_NUMBER() OVER (PARTITION BY site_id ORDER BY checked_at DESC) as rn
      FROM site_check_history
    ) ranked
    WHERE rn <= ?
    ORDER BY site_id, checked_at ASC
  `, [limit]);

  // Agrupar por site_id
  const history = {};
  for (const r of rows) {
    const sid = String(r.site_id);
    if (!history[sid]) history[sid] = [];
    history[sid].push({
      status: r.status,
      statusCode: r.status_code,
      checkedAt: Number(r.checked_at)
    });
  }

  res.json(history);
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
