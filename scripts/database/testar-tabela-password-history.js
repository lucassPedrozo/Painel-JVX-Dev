import dotenv from 'dotenv';
import mysql from 'mysql2/promise';

dotenv.config();

async function main() {
  console.log('🔧 Testando tabelas do Gerador de Link para Senhas...\n');

  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'worksdb',
  });

  try {
    // ============================================
    // Tabela password_history
    // ============================================
    console.log('📋 Verificando tabela: password_history\n');
    
    await conn.execute(`
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
    console.log('✅ Tabela password_history criada/verificada');

    const [columnsHistory] = await conn.execute('DESCRIBE password_history');
    console.table(columnsHistory);

    const [countHistory] = await conn.execute('SELECT COUNT(*) as total FROM password_history');
    console.log(`📊 Total de registros: ${countHistory[0].total}\n`);

    // ============================================
    // Tabela password_links_audit
    // ============================================
    console.log('📋 Verificando tabela: password_links_audit\n');
    
    await conn.execute(`
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
    console.log('✅ Tabela password_links_audit criada/verificada');

    const [columnsAudit] = await conn.execute('DESCRIBE password_links_audit');
    console.table(columnsAudit);

    const [countAudit] = await conn.execute('SELECT COUNT(*) as total FROM password_links_audit');
    console.log(`📊 Total de registros: ${countAudit[0].total}\n`);

    console.log('✅ Todas as tabelas estão prontas para uso!');

  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await conn.end();
  }
}

main();
