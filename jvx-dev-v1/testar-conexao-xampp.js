import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

console.log('🔍 Testando conexão com MySQL (XAMPP)...\n');

async function testarConexao() {
  try {
    // Tentar conectar ao MySQL
    console.log('📡 Conectando ao MySQL...');
    console.log(`   Host: ${process.env.DB_HOST || 'localhost'}`);
    console.log(`   User: ${process.env.DB_USER || 'root'}`);
    console.log(`   Database: ${process.env.DB_NAME || 'worksdb'}\n`);

    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'worksdb'
    });

    console.log('✅ Conexão estabelecida com sucesso!\n');

    // Verificar tabelas
    console.log('📊 Verificando tabelas...');
    const [tables] = await connection.execute('SHOW TABLES');
    
    if (tables.length === 0) {
      console.log('⚠️  Nenhuma tabela encontrada!');
      console.log('   Execute o script database-init-clean.sql primeiro.\n');
    } else {
      console.log(`✅ ${tables.length} tabela(s) encontrada(s):`);
      tables.forEach(table => {
        const tableName = Object.values(table)[0];
        console.log(`   - ${tableName}`);
      });
      console.log('');
    }

    // Verificar usuários
    console.log('👤 Verificando usuários...');
    const [users] = await connection.execute('SELECT username, role FROM users');
    
    if (users.length === 0) {
      console.log('⚠️  Nenhum usuário encontrado!');
    } else {
      console.log(`✅ ${users.length} usuário(s) encontrado(s):`);
      users.forEach(user => {
        console.log(`   - ${user.username} (${user.role})`);
      });
      console.log('');
    }

    // Verificar projetos
    console.log('📁 Verificando projetos...');
    const [works] = await connection.execute('SELECT COUNT(*) as total FROM works');
    console.log(`✅ ${works[0].total} projeto(s) cadastrado(s)\n`);

    await connection.end();

    console.log('═══════════════════════════════════════════');
    console.log('✅ TUDO OK! Sistema pronto para uso!');
    console.log('═══════════════════════════════════════════\n');
    console.log('📝 Próximos passos:');
    console.log('   1. Execute: npm run server');
    console.log('   2. Em outro terminal: npm run dev');
    console.log('   3. Acesse: http://localhost:5173');
    console.log('   4. Login: jvxadmin / admin123\n');

  } catch (error) {
    console.error('❌ Erro ao conectar ao MySQL:\n');
    
    if (error.code === 'ECONNREFUSED') {
      console.error('   ⚠️  MySQL não está rodando!');
      console.error('   📝 Solução:');
      console.error('      1. Abra o XAMPP Control Panel');
      console.error('      2. Clique em "Start" no módulo MySQL');
      console.error('      3. Aguarde até ficar verde');
      console.error('      4. Execute este script novamente\n');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.error('   ⚠️  Banco de dados não encontrado!');
      console.error('   📝 Solução:');
      console.error('      1. Acesse http://localhost/phpmyadmin');
      console.error('      2. Clique na aba "SQL"');
      console.error('      3. Cole o conteúdo de database-init-clean.sql');
      console.error('      4. Clique em "Executar"');
      console.error('      5. Execute este script novamente\n');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('   ⚠️  Acesso negado!');
      console.error('   📝 Solução:');
      console.error('      1. Verifique o arquivo .env');
      console.error('      2. Confirme DB_USER e DB_PASSWORD');
      console.error('      3. Padrão XAMPP: root / (senha vazia)\n');
    } else {
      console.error(`   Erro: ${error.message}`);
      console.error(`   Código: ${error.code}\n`);
    }

    process.exit(1);
  }
}

testarConexao();
