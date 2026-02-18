import dotenv from 'dotenv';
import mysql from 'mysql2/promise';

dotenv.config();

async function main() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'worksdb',
  });

  try {
    await conn.execute('SELECT session_token FROM users LIMIT 1');
    console.log('✅ Coluna session_token já existe.');
  } catch (e) {
    if (e.message.includes('Unknown column')) {
      await conn.execute(
        "ALTER TABLE users ADD COLUMN session_token VARCHAR(64) NULL COMMENT 'Token de sessão único — novo login invalida o anterior' AFTER active"
      );
      console.log('✅ Coluna session_token adicionada com sucesso.');
    } else {
      console.error('❌ Erro inesperado:', e.message);
    }
  }

  await conn.end();
}

main().catch((e) => {
  console.error('❌ Erro de conexão:', e.message);
  process.exit(1);
});
