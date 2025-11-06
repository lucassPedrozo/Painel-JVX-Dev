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

  console.log('🧪 Testando atualização de template\n');

  // Pegar primeiro projeto
  const [works] = await connection.execute('SELECT id, domain, template FROM works LIMIT 1');
  
  if (works.length === 0) {
    console.log('❌ Nenhum projeto encontrado');
    await connection.end();
    return;
  }

  const work = works[0];
  console.log('📊 Projeto antes da atualização:');
  console.log(`   ID: ${work.id}`);
  console.log(`   Domain: ${work.domain}`);
  console.log(`   Template: ${work.template || 'NULL'}\n`);

  // Atualizar template
  const testTemplate = 'https://themeforest.net/item/teste-' + Date.now();
  console.log(`📝 Atualizando template para: ${testTemplate}\n`);
  
  await connection.execute(
    'UPDATE works SET template = ? WHERE id = ?',
    [testTemplate, work.id]
  );

  // Verificar atualização
  const [updated] = await connection.execute(
    'SELECT id, domain, template FROM works WHERE id = ?',
    [work.id]
  );

  console.log('✅ Projeto após atualização:');
  console.log(`   ID: ${updated[0].id}`);
  console.log(`   Domain: ${updated[0].domain}`);
  console.log(`   Template: ${updated[0].template}\n`);

  if (updated[0].template === testTemplate) {
    console.log('✅ SUCESSO! Template foi salvo corretamente no banco\n');
    console.log('📝 Próximos passos:');
    console.log('   1. Verifique se o backend está retornando o campo template');
    console.log('   2. Verifique o console do navegador (F12) na aba Network');
    console.log('   3. Veja a resposta do GET /works');
    console.log('   4. Confirme se o campo "template" está presente\n');
  } else {
    console.log('❌ ERRO! Template não foi salvo corretamente\n');
  }

  await connection.end();
}

testar().catch(console.error);
