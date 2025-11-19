// Script para executar migração: adicionar coluna completed_by
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'worksdb'
};

async function runMigration() {
  console.log('='.repeat(80));
  console.log('MIGRAÇÃO: Adicionar coluna completed_by');
  console.log('='.repeat(80));
  
  let connection;
  
  try {
    console.log('\n1. Conectando ao banco de dados...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✓ Conectado com sucesso!');
    
    // Verificar se a coluna já existe
    console.log('\n2. Verificando se a coluna completed_by já existe...');
    const [columns] = await connection.execute(
      "SHOW COLUMNS FROM works LIKE 'completed_by'"
    );
    
    if (columns.length > 0) {
      console.log('⚠ Coluna completed_by já existe!');
      console.log('  Nenhuma ação necessária.');
      
      // Mostrar estrutura atual
      console.log('\n3. Estrutura atual da coluna:');
      console.log(columns[0]);
      
      // Verificar índice
      console.log('\n4. Verificando índice...');
      const [indexes] = await connection.execute(
        "SHOW INDEX FROM works WHERE Column_name = 'completed_by'"
      );
      
      if (indexes.length > 0) {
        console.log('✓ Índice idx_completed_by já existe');
      } else {
        console.log('⚠ Índice não encontrado, criando...');
        await connection.execute(
          "CREATE INDEX idx_completed_by ON works(completed_by)"
        );
        console.log('✓ Índice idx_completed_by criado com sucesso!');
      }
    } else {
      console.log('✓ Coluna completed_by não existe, criando...');
      
      // Adicionar coluna
      console.log('\n3. Adicionando coluna completed_by...');
      await connection.execute(`
        ALTER TABLE works 
        ADD COLUMN completed_by VARCHAR(100) NULL 
        COMMENT 'Usuário que marcou o projeto como concluído' 
        AFTER completed_at
      `);
      console.log('✓ Coluna completed_by adicionada com sucesso!');
      
      // Criar índice
      console.log('\n4. Criando índice idx_completed_by...');
      await connection.execute(
        "CREATE INDEX idx_completed_by ON works(completed_by)"
      );
      console.log('✓ Índice idx_completed_by criado com sucesso!');
    }
    
    // Verificar estrutura final
    console.log('\n5. Verificando estrutura final da tabela works...');
    const [finalStructure] = await connection.execute("DESCRIBE works");
    
    console.log('\nColunas da tabela works:');
    finalStructure.forEach(col => {
      if (col.Field === 'completed_at' || col.Field === 'completed_by') {
        console.log(`  ✓ ${col.Field} (${col.Type}) - ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'}`);
      }
    });
    
    // Estatísticas
    console.log('\n6. Estatísticas de projetos concluídos:');
    const [stats] = await connection.execute(`
      SELECT 
        COUNT(*) as total_concluidos,
        SUM(CASE WHEN completed_by IS NOT NULL THEN 1 ELSE 0 END) as com_completed_by,
        SUM(CASE WHEN completed_by IS NULL THEN 1 ELSE 0 END) as sem_completed_by
      FROM works 
      WHERE developer_status = 'Concluído'
    `);
    
    if (stats[0].total_concluidos > 0) {
      console.log(`  Total de projetos concluídos: ${stats[0].total_concluidos}`);
      console.log(`  Com completed_by preenchido: ${stats[0].com_completed_by}`);
      console.log(`  Sem completed_by (antigos): ${stats[0].sem_completed_by}`);
      
      if (stats[0].sem_completed_by > 0) {
        console.log('\n⚠ Projetos concluídos antes da migração não têm completed_by');
        console.log('  Isso é normal. Novos projetos terão o campo preenchido.');
      }
    } else {
      console.log('  Nenhum projeto concluído encontrado.');
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('✅ MIGRAÇÃO CONCLUÍDA COM SUCESSO!');
    console.log('='.repeat(80));
    console.log('\n📝 Próximos passos:');
    console.log('  1. Reinicie o backend: npm run server');
    console.log('  2. Recarregue o frontend: Ctrl+Shift+R');
    console.log('  3. Teste marcando um projeto como "Entregue"');
    console.log('  4. Verifique se a coluna "Concluído Por" mostra o nome');
    
  } catch (error) {
    console.error('\n❌ ERRO NA MIGRAÇÃO:');
    console.error(`  ${error.message}`);
    console.error('\nDetalhes do erro:');
    console.error(error);
    console.error('\nVerifique:');
    console.error('  1. O MySQL está rodando?');
    console.error('  2. As credenciais no .env estão corretas?');
    console.error('  3. O banco worksdb existe?');
    console.error('  4. O usuário tem permissões para ALTER TABLE?');
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Executar migração
runMigration();
