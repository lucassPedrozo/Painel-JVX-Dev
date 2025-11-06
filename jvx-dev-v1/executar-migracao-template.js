import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

console.log('🔄 Executando migração: Adicionar campo template\n');

async function executarMigracao() {
  let connection;
  
  try {
    console.log('📡 Conectando ao MySQL...');
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'worksdb'
    });

    console.log('✅ Conectado ao MySQL\n');

    // Verificar se a coluna já existe
    console.log('🔍 Verificando se a coluna template já existe...');
    const [columns] = await connection.execute(
      "SHOW COLUMNS FROM works LIKE 'template'"
    );

    if (columns.length > 0) {
      console.log('⚠️  A coluna template já existe!\n');
      
      // Migrar dados de observations para template (URLs)
      console.log('📝 Migrando URLs de observations para template...');
      const [result] = await connection.execute(`
        UPDATE works 
        SET template = observations 
        WHERE observations IS NOT NULL 
        AND (observations LIKE 'http%' OR observations LIKE '%themeforest%' OR observations LIKE '%envato%')
      `);
      
      console.log(`✅ ${result.affectedRows} registro(s) migrado(s)\n`);
      await connection.end();
      return;
    }

    console.log('📝 Coluna não encontrada. Adicionando...\n');

    // Adicionar a coluna
    await connection.execute(`
      ALTER TABLE works 
      ADD COLUMN template VARCHAR(500) 
      COMMENT 'URL do template utilizado (ThemeForest, etc)'
      AFTER site_type
    `);

    console.log('✅ Coluna template adicionada com sucesso!\n');

    // Migrar dados de observations para template (URLs)
    console.log('📝 Migrando URLs de observations para template...');
    const [result] = await connection.execute(`
      UPDATE works 
      SET template = observations 
      WHERE observations IS NOT NULL 
      AND (observations LIKE 'http%' OR observations LIKE '%themeforest%' OR observations LIKE '%envato%')
    `);
    
    console.log(`✅ ${result.affectedRows} registro(s) migrado(s)\n`);

    console.log('═══════════════════════════════════════════════════');
    console.log('✅ MIGRAÇÃO CONCLUÍDA COM SUCESSO!');
    console.log('═══════════════════════════════════════════════════\n');
    console.log('📝 Próximos passos:');
    console.log('   1. Reinicie o backend: npm run server');
    console.log('   2. Reinicie o frontend: npm run dev');
    console.log('   3. Agora você pode adicionar templates nos projetos\n');

  } catch (error) {
    console.error('❌ Erro ao executar migração:\n');
    console.error(`   ${error.message}\n`);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

executarMigracao();
