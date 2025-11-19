// Script para testar conexão com o banco de dados
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  port: 3306
};

async function testarConexao() {
  console.log('='.repeat(80));
  console.log('TESTE DE CONEXÃO COM O BANCO DE DADOS');
  console.log('='.repeat(80));
  
  console.log('\nConfigurações:');
  console.log(`Host: ${dbConfig.host}`);
  console.log(`User: ${dbConfig.user}`);
  console.log(`Password: ${dbConfig.password ? '***' : '(vazio)'}`);
  console.log(`Port: ${dbConfig.port}`);
  
  try {
    console.log('\n1. Testando conexão com MySQL...');
    const connection = await mysql.createConnection(dbConfig);
    console.log('✓ Conexão com MySQL estabelecida!');
    
    console.log('\n2. Verificando bancos de dados existentes...');
    const [databases] = await connection.execute('SHOW DATABASES');
    console.log('Bancos encontrados:');
    databases.forEach(db => console.log(`  - ${db.Database}`));
    
    const worksdbExists = databases.some(db => db.Database === 'worksdb');
    
    if (!worksdbExists) {
      console.log('\n⚠ Banco "worksdb" NÃO encontrado!');
      console.log('\nPara criar o banco, execute:');
      console.log('  mysql -u root -p < database/database-init-clean.sql');
      console.log('\nOu execute no MySQL:');
      console.log('  CREATE DATABASE worksdb CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;');
    } else {
      console.log('\n✓ Banco "worksdb" encontrado!');
      
      // Conectar ao banco worksdb
      await connection.changeUser({ database: 'worksdb' });
      
      console.log('\n3. Verificando tabelas...');
      const [tables] = await connection.execute('SHOW TABLES');
      
      if (tables.length === 0) {
        console.log('⚠ Nenhuma tabela encontrada no banco "worksdb"!');
        console.log('\nPara criar as tabelas, execute:');
        console.log('  mysql -u root -p worksdb < database/database-init-clean.sql');
      } else {
        console.log('Tabelas encontradas:');
        tables.forEach(table => {
          const tableName = table[`Tables_in_worksdb`];
          console.log(`  - ${tableName}`);
        });
        
        // Verificar registros em cada tabela
        console.log('\n4. Verificando registros...');
        for (const table of tables) {
          const tableName = table[`Tables_in_worksdb`];
          const [rows] = await connection.execute(`SELECT COUNT(*) as total FROM ${tableName}`);
          console.log(`  ${tableName}: ${rows[0].total} registros`);
        }
      }
    }
    
    await connection.end();
    
    console.log('\n' + '='.repeat(80));
    console.log('✓ TESTE CONCLUÍDO COM SUCESSO!');
    console.log('='.repeat(80));
    
  } catch (error) {
    console.error('\n✗ ERRO NA CONEXÃO:');
    console.error(`  ${error.message}`);
    console.error('\nVerifique:');
    console.error('  1. O MySQL está rodando? (XAMPP Control Panel)');
    console.error('  2. As credenciais estão corretas no arquivo .env');
    console.error('  3. A porta 3306 está disponível');
    console.error('\n' + '='.repeat(80));
    process.exit(1);
  }
}

testarConexao();
