// Script para testar a API completa
import fetch from 'node-fetch';

const API_URL = 'http://localhost:3001';

async function testarAPI() {
  console.log('='.repeat(80));
  console.log('TESTE COMPLETO DA API');
  console.log('='.repeat(80));
  
  try {
    // 1. Testar login
    console.log('\n1. Testando login...');
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
    console.log('✓ Login bem-sucedido!');
    console.log(`  Usuário: ${loginData.user.username}`);
    console.log(`  Role: ${loginData.user.role}`);
    console.log(`  Token: ${loginData.token.substring(0, 20)}...`);
    
    const token = loginData.token;
    
    // 2. Testar busca de works
    console.log('\n2. Testando busca de projetos...');
    const worksResponse = await fetch(`${API_URL}/works`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!worksResponse.ok) {
      throw new Error(`Busca de works falhou: ${worksResponse.status}`);
    }
    
    const works = await worksResponse.json();
    console.log(`✓ Projetos carregados: ${works.length} registros`);
    
    if (works.length > 0) {
      const firstWork = works[0];
      console.log('\n  Exemplo de projeto:');
      console.log(`    ID: ${firstWork.id}`);
      console.log(`    Desenvolvedor: ${firstWork.developer}`);
      console.log(`    Domínio: ${firstWork.domain}`);
      console.log(`    Valor: R$ ${parseFloat(firstWork.value).toFixed(2)}`);
      console.log(`    Status: ${firstWork.status}`);
      console.log(`    Pagamento: ${firstWork.payment_status}`);
    }
    
    // 3. Estatísticas
    console.log('\n3. Estatísticas:');
    const entregues = works.filter(w => w.status === 'Entregue').length;
    const pagos = works.filter(w => w.payment_status === 'Pago').length;
    const valorTotal = works.reduce((sum, w) => sum + parseFloat(w.value || 0), 0);
    
    console.log(`  Total de projetos: ${works.length}`);
    console.log(`  Entregues: ${entregues} (${((entregues/works.length)*100).toFixed(1)}%)`);
    console.log(`  Pagos: ${pagos} (${((pagos/works.length)*100).toFixed(1)}%)`);
    console.log(`  Valor total: R$ ${valorTotal.toFixed(2)}`);
    
    // 4. Desenvolvedores únicos
    const developers = [...new Set(works.map(w => w.developer))];
    console.log(`\n4. Desenvolvedores: ${developers.length} únicos`);
    developers.slice(0, 5).forEach(dev => {
      const count = works.filter(w => w.developer === dev).length;
      console.log(`  - ${dev}: ${count} projetos`);
    });
    
    console.log('\n' + '='.repeat(80));
    console.log('✓ TODOS OS TESTES PASSARAM!');
    console.log('='.repeat(80));
    console.log('\n✅ A conexão com o banco de dados está funcionando perfeitamente!');
    console.log('✅ A API está respondendo corretamente!');
    console.log('✅ Os dados estão sendo carregados!');
    console.log('\n🚀 Você pode acessar o frontend em: http://localhost:5173');
    console.log('👤 Login: jvxadmin / admin123');
    
  } catch (error) {
    console.error('\n✗ ERRO NO TESTE:');
    console.error(`  ${error.message}`);
    console.error('\nVerifique:');
    console.error('  1. O servidor está rodando? (npm run server)');
    console.error('  2. O MySQL está ativo no XAMPP?');
    console.error('  3. O arquivo .env está configurado corretamente?');
    process.exit(1);
  }
}

testarAPI();
