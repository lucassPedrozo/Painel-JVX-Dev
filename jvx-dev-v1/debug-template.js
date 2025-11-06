import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function debug() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'worksdb'
  });

  console.log('🔍 DEBUG: Verificando campo template\n');

  // Buscar todos os projetos com template
  const [withTemplate] = await connection.execute(
    'SELECT id, domain, template FROM works WHERE template IS NOT NULL'
  );

  console.log(`📊 Projetos COM template: ${withTemplate.length}\n`);
  
  if (withTemplate.length > 0) {
    withTemplate.forEach(work => {
      console.log(`   ID ${work.id}: ${work.domain}`);
      console.log(`   Template: ${work.template}\n`);
    });
  }

  // Buscar todos os projetos sem template
  const [withoutTemplate] = await connection.execute(
    'SELECT id, domain FROM works WHERE template IS NULL LIMIT 5'
  );

  console.log(`📊 Projetos SEM template: ${withoutTemplate.length} (mostrando 5)\n`);
  
  if (withoutTemplate.length > 0) {
    withoutTemplate.forEach(work => {
      console.log(`   ID ${work.id}: ${work.domain}`);
    });
  }

  console.log('\n═══════════════════════════════════════════════════');
  console.log('💡 DICA: Para testar o template:');
  console.log('═══════════════════════════════════════════════════\n');
  console.log('1. Edite um projeto no sistema');
  console.log('2. Adicione uma URL no campo "Template (URL)"');
  console.log('3. Salve o projeto');
  console.log('4. Execute: node debug-template.js');
  console.log('5. Verifique se o projeto aparece na lista "COM template"\n');
  console.log('6. Se aparecer aqui mas não no sistema:');
  console.log('   - Problema está no frontend (cache)');
  console.log('   - Solução: Ctrl+Shift+R para hard refresh\n');
  console.log('7. Se NÃO aparecer aqui:');
  console.log('   - Problema está no backend (não está salvando)');
  console.log('   - Verifique os logs do servidor\n');

  await connection.end();
}

debug().catch(console.error);
