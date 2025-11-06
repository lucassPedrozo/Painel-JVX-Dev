import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function verificar() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'worksdb'
  });

  console.log('📊 Estrutura da tabela works:\n');
  const [columns] = await connection.execute('DESCRIBE works');
  
  columns.forEach(col => {
    const marker = (col.Field === 'template' || col.Field === 'completed_at') ? '✅' : '  ';
    console.log(`${marker} ${col.Field.padEnd(20)} ${col.Type.padEnd(20)} ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'}`);
  });

  await connection.end();
}

verificar();
