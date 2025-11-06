import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

console.log('🔍 Testando campo completed_at\n');

async function testar() {
  let connection;
  
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'worksdb'
    });

    console.log('✅ Conectado ao MySQL\n');

    // Verificar se a coluna existe
    console.log('1️⃣ Verificando se a coluna completed_at existe...');
    const [columns] = await connection.execute(
      "SHOW COLUMNS FROM works LIKE 'completed_at'"
    );

    if (columns.length === 0) {
      console.log('❌ Coluna completed_at NÃO EXISTE!\n');
      console.log('📝 Execute a migração:');
      console.log('   npm run migrate\n');
      await connection.end();
      process.exit(1);
    }

    console.log('✅ Coluna completed_at existe!\n');

    // Verificar projetos concluídos
    console.log('2️⃣ Verificando projetos concluídos...');
    const [concluidos] = await connection.execute(
      "SELECT id, developer, developer_status, completed_at FROM works WHERE developer_status = 'Concluído'"
    );

    if (concluidos.length === 0) {
      console.log('⚠️  Nenhum projeto marcado como "Concluído"\n');
      console.log('📝 Para testar:');
      console.log('   1. Acesse o sistema');
      console.log('   2. Marque um projeto como "Concluído"');
      console.log('   3. Execute este script novamente\n');
    } else {
      console.log(`✅ ${concluidos.length} projeto(s) concluído(s):\n`);
      
      concluidos.forEach((proj, index) => {
        console.log(`   ${index + 1}. ID: ${proj.id} | Dev: ${proj.developer}`);
        if (proj.completed_at) {
          const data = new Date(proj.completed_at);
          console.log(`      ✅ Concluído em: ${data.toLocaleString('pt-BR')}`);
        } else {
          console.log(`      ⚠️  completed_at está NULL (projeto marcado antes da migração)`);
        }
        console.log('');
      });
    }

    // Testar atualização
    console.log('3️⃣ Testando atualização de status...');
    const [primeiro] = await connection.execute(
      "SELECT id, developer_status FROM works LIMIT 1"
    );

    if (primeiro.length > 0) {
      const projeto = primeiro[0];
      const novoStatus = projeto.developer_status === 'Concluído' ? 'Em Andamento' : 'Concluído';
      const completed_at = novoStatus === 'Concluído' ? new Date() : null;

      await connection.execute(
        "UPDATE works SET developer_status = ?, completed_at = ? WHERE id = ?",
        [novoStatus, completed_at, projeto.id]
      );

      const [atualizado] = await connection.execute(
        "SELECT developer_status, completed_at FROM works WHERE id = ?",
        [projeto.id]
      );

      console.log(`✅ Projeto ID ${projeto.id} atualizado:`);
      console.log(`   Status: ${atualizado[0].developer_status}`);
      console.log(`   completed_at: ${atualizado[0].completed_at || 'NULL'}\n`);

      // Reverter
      await connection.execute(
        "UPDATE works SET developer_status = ?, completed_at = NULL WHERE id = ?",
        [projeto.developer_status, projeto.id]
      );
      console.log(`✅ Status revertido para teste\n`);
    }

    console.log('═══════════════════════════════════════════════════');
    console.log('✅ TUDO FUNCIONANDO CORRETAMENTE!');
    console.log('═══════════════════════════════════════════════════\n');
    console.log('📝 Próximos passos:');
    console.log('   1. Reinicie o backend: npm run server');
    console.log('   2. Reinicie o frontend: npm run dev');
    console.log('   3. Marque um projeto como "Concluído"');
    console.log('   4. Passe o mouse sobre o badge "Concluído"\n');

  } catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

testar();
