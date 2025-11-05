import express from "express";
import cors from "cors";
import mysql from "mysql2";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypto from "crypto";

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

// Pool de conexões MySQL
const db = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "worksdb",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

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
      return res.status(403).json({ error: "Token inválido" });
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
app.post("/auth/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Usuário e senha são obrigatórios" });
  }

  db.query(
    "SELECT * FROM users WHERE username = ? AND active = TRUE",
    [username],
    async (err, results) => {
      if (err) {
        console.error("Erro no login:", err);
        return res.status(500).json({ error: "Erro no servidor" });
      }

      if (results.length === 0) {
        return res.status(401).json({ error: "Usuário ou senha inválidos" });
      }

      const user = results[0];
      
      // Verificar senha (suporta SHA2 legado e bcrypt)
      let passwordValid = false;
      
      // Calcular SHA2 da senha fornecida
      const sha2Hash = crypto.createHash('sha256').update(password).digest('hex');
      
      // Tentar bcrypt primeiro (hash começa com $2)
      if (user.password.startsWith('$2')) {
        try {
          passwordValid = await bcrypt.compare(password, user.password);
        } catch (e) {
          console.error("Erro no bcrypt:", e);
          passwordValid = false;
        }
      } else {
        // Tentar SHA2 (hash tem 64 caracteres hexadecimais)
        passwordValid = user.password === sha2Hash;
        
        // Se válido com SHA2, atualizar para bcrypt
        if (passwordValid) {
          const hashedPassword = await bcrypt.hash(password, 10);
          db.query("UPDATE users SET password = ? WHERE id = ?", [hashedPassword, user.id]);
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

      res.json({
        token,
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
          developerName: user.developer_name
        }
      });
    }
  );
});

// Verificar token
app.get("/auth/verify", authenticateToken, (req, res) => {
  res.json({ valid: true, user: req.user });
});

// ============================================
// ROTAS DE GERENCIAMENTO DE USUÁRIOS (APENAS MASTER)
// ============================================

// Listar todos os usuários
app.get("/users", authenticateToken, requireMaster, (req, res) => {
  db.query(
    "SELECT id, username, role, developer_name, active, created_at FROM users ORDER BY created_at DESC",
    (err, results) => {
      if (err) return res.status(500).json({ error: "Erro ao buscar usuários" });
      res.json(results);
    }
  );
});

// Criar novo usuário
app.post("/users", authenticateToken, requireMaster, async (req, res) => {
  const { username, password, role, developerName } = req.body;

  if (!username || !password || !role) {
    return res.status(400).json({ error: "Dados incompletos" });
  }

  if (role === 'standard' && !developerName) {
    return res.status(400).json({ error: "Usuário padrão deve ter um desenvolvedor associado" });
  }

  try {
    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 10);

    db.query(
      "INSERT INTO users (username, password, role, developer_name) VALUES (?, ?, ?, ?)",
      [username, hashedPassword, role, role === 'standard' ? developerName : null],
      (err, result) => {
        if (err) {
          if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: "Nome de usuário já existe" });
          }
          console.error("Erro ao criar usuário:", err);
          return res.status(500).json({ error: "Erro ao criar usuário" });
        }
        res.json({ 
          success: true, 
          message: "Usuário criado com sucesso",
          id: result.insertId 
        });
      }
    );
  } catch (error) {
    console.error("Erro ao processar senha:", error);
    res.status(500).json({ error: "Erro ao processar dados" });
  }
});

// Atualizar usuário
app.put("/users/:id", authenticateToken, requireMaster, async (req, res) => {
  const { id } = req.params;
  const { username, password, role, developerName, active } = req.body;

  try {
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

    db.query(sql, updateValues, (err, result) => {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(400).json({ error: "Nome de usuário já existe" });
        }
        console.error("Erro ao atualizar usuário:", err);
        return res.status(500).json({ error: "Erro ao atualizar usuário" });
      }
      res.json({ success: true, message: "Usuário atualizado com sucesso" });
    });
  } catch (error) {
    console.error("Erro ao processar atualização:", error);
    res.status(500).json({ error: "Erro ao processar dados" });
  }
});

// Deletar usuário
app.delete("/users/:id", authenticateToken, requireMaster, (req, res) => {
  const { id } = req.params;

  // Não permitir deletar o próprio usuário
  if (parseInt(id) === req.user.id) {
    return res.status(400).json({ error: "Não é possível deletar seu próprio usuário" });
  }

  db.query("DELETE FROM users WHERE id = ?", [id], (err, result) => {
    if (err) {
      console.error("Erro ao deletar usuário:", err);
      return res.status(500).json({ error: "Erro ao deletar usuário" });
    }
    res.json({ success: true, message: "Usuário deletado com sucesso" });
  });
});

// ============================================
// ROTAS DE WORKS (COM CONTROLE DE ACESSO)
// ============================================

// GET todos os works (filtrado por desenvolvedor para usuários padrão)
app.get("/works", authenticateToken, (req, res) => {
  let sql = "SELECT * FROM works";
  let params = [];

  // Se for usuário padrão, filtrar apenas seus trabalhos
  if (req.user.role === 'standard' && req.user.developerName) {
    sql += " WHERE developer = ?";
    params.push(req.user.developerName);
  }

  db.query(sql, params, (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});

// POST novo work (apenas master)
app.post("/works", authenticateToken, requireMaster, (req, res) => {
  const { developer, deadline_type, value, domain, site_type, delivery_date, delivery_month, delivery_year, status, payment_status, observations } = req.body;
  const sql = "INSERT INTO works (developer, deadline_type, value, domain, site_type, delivery_date, delivery_month, delivery_year, status, payment_status, observations) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
  db.query(sql, [developer, deadline_type, value, domain, site_type, delivery_date, delivery_month, delivery_year, status, payment_status, observations], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ id: result.insertId, ...req.body });
  });
});

// PUT para atualizar work (apenas master)
app.put("/works/:id", authenticateToken, requireMaster, (req, res) => {
  const { id } = req.params;
  const { developer, deadline_type, value, domain, site_type, delivery_date, delivery_month, delivery_year, status, payment_status, observations } = req.body;

  // Verificar se o registro existe
  db.query("SELECT * FROM works WHERE id = ?", [id], (err, results) => {
    if (err) {
      console.error("Erro ao verificar registro:", err);
      return res.status(500).json({ error: "Erro ao verificar o registro" });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "Trabalho não encontrado" });
    }

    // Atualizar o registro
    const sql = "UPDATE works SET developer = ?, deadline_type = ?, value = ?, domain = ?, site_type = ?, delivery_date = ?, delivery_month = ?, delivery_year = ?, status = ?, payment_status = ?, observations = ? WHERE id = ?";
    db.query(sql, [developer, deadline_type, value, domain, site_type, delivery_date, delivery_month, delivery_year, status, payment_status, observations, id], (err, result) => {
      if (err) {
        console.error("Erro na atualização:", err);
        return res.status(500).json({ error: "Erro ao atualizar o trabalho" });
      }
      res.json({
        success: true,
        message: "Trabalho atualizado com sucesso",
        updatedWork: { id, developer, deadline_type, value, domain, site_type, delivery_date, delivery_month, delivery_year, status, payment_status, observations }
      });
    });
  });
});

// PATCH para marcar como pago rapidamente (apenas master)
app.patch("/works/:id/mark-paid", authenticateToken, requireMaster, (req, res) => {
  const { id } = req.params;
  
  db.query("UPDATE works SET payment_status = 'Pago' WHERE id = ?", [id], (err, result) => {
    if (err) {
      console.error("Erro ao marcar como pago:", err);
      return res.status(500).json({ error: "Erro ao atualizar status" });
    }
    res.json({ success: true, message: "Projeto marcado como pago" });
  });
});

// DELETE work (apenas master)
app.delete("/works/:id", authenticateToken, requireMaster, (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM works WHERE id = ?", [id], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ success: true });
  });
});

// ============================================
// ROTAS DE DEVELOPERS
// ============================================

// GET informações de um desenvolvedor
app.get("/developers/:name", authenticateToken, (req, res) => {
  const { name } = req.params;
  
  // Usuários padrão só podem ver seus próprios dados
  if (req.user.role === 'standard' && req.user.developerName !== name) {
    return res.status(403).json({ error: "Acesso negado" });
  }

  db.query("SELECT * FROM developers WHERE name = ?", [name], (err, results) => {
    if (err) return res.status(500).json(err);
    if (results.length === 0) {
      return res.json(null);
    }
    res.json(results[0]);
  });
});

// GET todos os desenvolvedores (apenas master)
app.get("/developers", authenticateToken, requireMaster, (req, res) => {
  db.query("SELECT * FROM developers ORDER BY name", (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});

// POST/PUT informações de desenvolvedor (apenas master)
app.post("/developers", authenticateToken, requireMaster, (req, res) => {
  const { name, phone, email, whatsapp, pixKey, pixType, bankName, agency, account, observations } = req.body;
  
  // Verificar se já existe
  db.query("SELECT * FROM developers WHERE name = ?", [name], (err, results) => {
    if (err) return res.status(500).json(err);
    
    if (results.length > 0) {
      // Atualizar
      const sql = "UPDATE developers SET phone = ?, email = ?, whatsapp = ?, pixKey = ?, pixType = ?, bankName = ?, agency = ?, account = ?, observations = ? WHERE name = ?";
      db.query(sql, [phone, email, whatsapp, pixKey, pixType, bankName, agency, account, observations, name], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ success: true, message: "Desenvolvedor atualizado" });
      });
    } else {
      // Inserir
      const sql = "INSERT INTO developers (name, phone, email, whatsapp, pixKey, pixType, bankName, agency, account, observations) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
      db.query(sql, [name, phone, email, whatsapp, pixKey, pixType, bankName, agency, account, observations], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ success: true, message: "Desenvolvedor criado", id: result.insertId });
      });
    }
  });
});

// ============================================
// ROTAS DE IMPORTAÇÃO E LIMPEZA
// ============================================

// Importar CSV
app.post("/import/csv", authenticateToken, requireMaster, (req, res) => {
  const { csvData } = req.body;
  
  if (!csvData || !Array.isArray(csvData)) {
    return res.status(400).json({ error: "Dados CSV inválidos" });
  }

  let imported = 0;
  let errors = [];
  let completed = 0;

  if (csvData.length === 0) {
    return res.json({ success: true, imported: 0, errors: [] });
  }

  csvData.forEach((row, index) => {
    // Converter valor de string para número
    let value = 0;
    if (row.value) {
      const valueStr = row.value.toString()
        .replace(/R\$/g, '')
        .replace(/\s/g, '')
        .replace(/\./g, '')
        .replace(',', '.');
      value = parseFloat(valueStr) || 0;
    }

    // Converter data DD/MM/YYYY para YYYY-MM-DD
    let deliveryDate = null;
    if (row.delivery_date) {
      const dateParts = row.delivery_date.trim().split('/');
      if (dateParts.length === 3) {
        const day = dateParts[0].padStart(2, '0');
        const month = dateParts[1].padStart(2, '0');
        const year = dateParts[2];
        
        // Validar se a data é válida
        const dateObj = new Date(`${year}-${month}-${day}`);
        if (!isNaN(dateObj.getTime())) {
          deliveryDate = `${year}-${month}-${day}`;
        }
      }
    }

    if (!deliveryDate) {
      errors.push(`Linha ${index + 2}: Data inválida (${row.delivery_date})`);
      completed++;
      if (completed === csvData.length) {
        res.json({ success: true, imported, errors });
      }
      return;
    }

    // Validar campos obrigatórios
    if (!row.developer || !row.domain) {
      errors.push(`Linha ${index + 2}: Desenvolvedor ou domínio ausente`);
      completed++;
      if (completed === csvData.length) {
        res.json({ success: true, imported, errors });
      }
      return;
    }

    const sql = "INSERT INTO works (developer, deadline_type, value, domain, site_type, delivery_date, delivery_month, delivery_year, status, payment_status, observations) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    
    db.query(sql, [
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
    ], (err, result) => {
      completed++;
      
      if (err) {
        console.error("Erro ao importar linha:", err);
        errors.push(`Linha ${index + 2}: ${err.message}`);
      } else {
        imported++;
      }

      if (completed === csvData.length) {
        res.json({ success: true, imported, errors });
      }
    });
  });
});

// Limpar banco de dados
app.post("/database/clear", authenticateToken, requireMaster, async (req, res) => {
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({ error: "Senha é obrigatória" });
  }

  // Verificar senha do usuário master
  db.query(
    "SELECT * FROM users WHERE id = ? AND role = 'master'",
    [req.user.id],
    async (err, results) => {
      if (err) {
        console.error("Erro ao verificar usuário:", err);
        return res.status(500).json({ error: "Erro no servidor" });
      }

      if (results.length === 0) {
        return res.status(403).json({ error: "Usuário não autorizado" });
      }

      const user = results[0];
      
      // Verificar senha
      let passwordValid = false;
      const sha2Hash = crypto.createHash('sha256').update(password).digest('hex');
      
      if (user.password.startsWith('$2')) {
        try {
          passwordValid = await bcrypt.compare(password, user.password);
        } catch (e) {
          passwordValid = false;
        }
      } else {
        passwordValid = user.password === sha2Hash;
      }

      if (!passwordValid) {
        return res.status(401).json({ error: "Senha incorreta" });
      }

      // Limpar tabela works
      db.query("DELETE FROM works", (err, result) => {
        if (err) {
          console.error("Erro ao limpar banco:", err);
          return res.status(500).json({ error: "Erro ao limpar banco de dados" });
        }
        
        // Resetar auto increment
        db.query("ALTER TABLE works AUTO_INCREMENT = 1", (err2) => {
          if (err2) {
            console.error("Erro ao resetar auto increment:", err2);
          }
          res.json({ success: true, message: "Banco de dados limpo com sucesso" });
        });
      });
    }
  );
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
  console.log("Sistema de autenticação ativo");
});
