// Script para verificar usuário no banco
import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'worksdb'
};

async function verificarUsuario() {
  console.log('='.repeat(80));
  console.log('VERIFICAÇÃO DE USUÁRIO');
  console.log('='.repeat(80));
  
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    console.log('\n1. Buscando usuários...');
    const [users] = await connection.execute('SELECT * FROM users');
    
    console.log(`\nTotal de usuários: ${users.length}`);
    
    for (const user of users) {
      console.log('\n' + '-'.repeat(80));
      console.log(`ID: ${user.id}`);
      console.log(`Username: ${user.username}`);
      console.log(`Role: ${user.role}`);
      console.log(`Active: ${user.active}`);
      console.log(`Developer Name: ${user.developer_name || '(nenhum)'}`);
      console.log(`Password (primeiros 20 chars): ${user.password.substring(0, 20)}...`);
      console.log(`Password length: ${user.password.length}`);
      console.log(`Password type: ${user.password.startsWith('$2') ? 'bcrypt' : 'SHA256'}`);
      
      // Testar senha padrão
      console.log('\n2. Testando senha "admin123"...');
      
      let passwordValid = false;
      const testPassword = 'admin123';
      const sha2Hash = crypto.createHash('sha256').update(testPassword).digest('hex');
      
      if (user.password.startsWith('$2')) {
        // bcrypt
        passwordValid = await bcrypt.compare(testPassword, user.password);
        console.log(`  Teste bcrypt: ${passwordValid ? '✓ VÁLIDA' : '✗ INVÁLIDA'}`);
      } else {
        // SHA256
        passwordValid = user.password === sha2Hash;
        console.log(`  Teste SHA256: ${passwordValid ? '✓ VÁLIDA' : '✗ INVÁLIDA'}`);
        console.log(`  Hash esperado: ${sha2Hash.substring(0, 20)}...`);
        console.log(`  Hash no banco: ${user.password.substring(0, 20)}...`);
      }
      
      if (!passwordValid) {
        console.log('\n⚠ SENHA NÃO CONFERE!');
        console.log('\nRecriando usuário com senha correta...');
        
        const hashedPassword = await bcrypt.hash('admin123', 10);
        await connection.execute(
          'UPDATE users SET password = ? WHERE id = ?',
          [hashedPassword, user.id]
        );
        
        console.log('✓ Senha atualizada para "admin123" com bcrypt');
      } else {
        console.log('\n✓ Senha está correta!');
      }
    }
    
    await connection.end();
    
    console.log('\n' + '='.repeat(80));
    console.log('✓ VERIFICAÇÃO CONCLUÍDA');
    console.log('='.repeat(80));
    
  } catch (error) {
    console.error('\n✗ ERRO:', error.message);
    process.exit(1);
  }
}

verificarUsuario();
