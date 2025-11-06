import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function testar() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'worksdb'
  });

  console.log('🔍 Testando dados retornados pela API:\n');
  
  const [works] = await connection.execute('SELECT * FROM works LIMIT 1');
  
  if (works.length === 0) {
    console.log('⚠️  Nenhum projeto encontrado no banco');
  } else {
    const work = works[0];
    console.log('📊 Primeiro projeto:');
    console.log(`   ID: ${work.id}`);
    console.log(`   Developer: ${work.developer}`);
    console.log(`   Site Type: ${work.site_type}`);
    console.log(`   Template: ${work.template || 'NULL'} ${work.template ? '✅' : '❌'}`);
    console.log(`   Developer Status: ${work.developer_status}`);
    console.log(`   Completed At: ${work.completed_at || 'NULL'} ${work.completed_at ? '✅' : '❌'}`);
    console.log(`   Domain: ${work.domain}`);
  }

  await connection.end();
}

testar();
