import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const API_URL = 'http://localhost:3001';

async function testarAPI() {
  console.log('========================================');
  console.log('TESTE DA API');
  console.log('========================================\n');

  try {
    // 1. Testar login
    console.log('1. Testando login...');
    const loginResponse = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'jvxadmin',
        password: 'admin123'
      })
    });

    if (!loginResponse.ok) {
      throw new Error(`Login falhou: ${loginResponse.status}`);
    }

    const loginData = await loginResponse.json();
    console.log('✓ Login bem-sucedido');
    console.log(`  Token: ${loginData.token.substring(0, 20)}...`);
    console.log(`  User: ${loginData.user.username} (${loginData.user.role})\n`);

    const token = loginData.token;

    // 2. Testar busca de works
    console.log('2. Testando busca de works...');
    const worksResponse = await fetch(`${API_URL}/works`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!worksResponse.ok) {
      throw new Error(`Busca de works falhou: ${worksResponse.status}`);
    }

    const works = await worksResponse.json();
    console.log(`✓ ${works.length} projetos encontrados`);
    
    if (works.length > 0) {
      console.log('\nPrimeiro projeto:');
      const first = works[0];
      console.log(`  ID: ${first.id}`);
      console.log(`  Domínio: ${first.domain}`);
      console.log(`  Desenvolvedor: ${first.developer}`);
      console.log(`  Status: ${first.status}`);
      console.log(`  Valor: ${first.value}`);
    } else {
      console.log('⚠ Nenhum projeto encontrado no banco!');
    }

    console.log('\n========================================');
    console.log('✓ TESTE CONCLUÍDO COM SUCESSO!');
    console.log('========================================');

  } catch (error) {
    console.error('\n✗ ERRO NO TESTE:');
    console.error(`  ${error.message}`);
    console.error('\nVerifique:');
    console.error('  1. O servidor está rodando? (npm run server)');
    console.error('  2. A porta 3001 está disponível?');
    console.error('  3. O banco de dados está acessível?');
    console.error('\n========================================');
    process.exit(1);
  }
}

// Verificar se o servidor está rodando
console.log('Aguardando servidor iniciar...\n');
setTimeout(testarAPI, 2000);
