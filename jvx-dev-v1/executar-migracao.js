import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import fs from 'fs';

// Carregar variáveis de ambiente
dotenv.config();

console.log('🔄 Executando migração: Adicionar campo completed_at\n');

async function executarMigracao() {
  let connection;
  
  try {
    // Conectar ao MySQL
    console.log('📡 Conectando ao MySQL...');
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'worksdb'
    });

    console.log('✅ Conectado ao MySQL\n');

    // Verificar se a coluna já existe
    console.log('🔍 Verificando se a coluna completed_at já existe...');
    const [columns] = await connection.execute(
      "SHOW COLUMNS FROM works LIKE 'completed_at'"
    );

    if (columns.length > 0) {
      console.log('⚠️  A coluna completed_at já existe!');
      console.log('   Nenhuma alteração necessária.\n');
      await connection.end();
      return;
    }

    console.log('📝 Coluna não encontrada. Adicionando...\n');

    // Adicionar a coluna
    await connection.execute(`
      ALTER TABLE works 
      ADD COLUMN completed_at TIMESTAMP NULL 
      COMMENT 'Data e hora em que o projeto foi marcado como concluído'
      AFTER developer_status
    `);

    console.log('✅ Coluna completed_at adicionada com sucesso!\n');

    // Verificar a estrutura da tabela
    console.log('📊 Estrutura atualizada da tabela works:');
    const [structure] = await connection.execute('DESCRIBE works');
    
    console.log('\n┌─────────────────────┬──────────────┬──────┬─────┐');
    console.log('│ Campo               │ Tipo         │ Null │ Key │');
    console.log('├─────────────────────┼──────────────┼──────┼─────┤');
    
    structure.forEach(col => {
      const field = col.Field.padEnd(19);
      const type = col.Type.substring(0, 12).padEnd(12);
      const nullable = col.Null.padEnd(4);
      const key = col.Key.padEnd(3);
      console.log(`│ ${field} │ ${type} │ ${nullable} │ ${key} │`);
    });
    
    console.log('└─────────────────────┴──────────────┴──────┴─────┘\n');

    console.log('═══════════════════════════════════════════════════');
    console.log('✅ MIGRAÇÃO CONCLUÍDA COM SUCESSO!');
    console.log('═══════════════════════════════════════════════════\n');
    console.log('📝 Próximos passos:');
    console.log('   1. Reinicie o backend: npm run server');
    console.log('   2. Reinicie o frontend: npm run dev');
    console.log('   3. Teste marcando um projeto como concluído');
    console.log('   4. Passe o mouse sobre o badge "Concluído"\n');

  } catch (error) {
    console.error('❌ Erro ao executar migração:\n');
    console.error(`   ${error.message}\n`);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('   ⚠️  MySQL não está rodando!');
      console.error('   📝 Solução: Inicie o MySQL no XAMPP Control Panel\n');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.error('   ⚠️  Banco de dados não encontrado!');
      console.error('   📝 Solução: Execute o script database-init-clean.sql\n');
    }
    
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

executarMigracao();
