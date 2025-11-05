// Script para testar a atualização de status do desenvolvedor
import fetch from 'node-fetch';

const API_URL = 'http://localhost:3001';

async function testarStatusDev() {
  console.log('='.repeat(80));
  console.log('TESTE DE ATUALIZAÇÃO DE STATUS DO DESENVOLVEDOR');
  console.log('='.repeat(80));
  
  try {
    // 1. Login como desenvolvedor
    console.log('\n1. Fazendo login como desenvolvedor...');
    const loginResponse = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'leandro.dev',
        password: 'dev123'
      })
    });
    
    if (!loginResponse.ok) {
      throw new Error(`Login falhou: ${loginResponse.status}`);
    }
    
    const loginData = await loginResponse.json();
    console.log('✓ Login bem-sucedido!');
    console.log(`  Usuário: ${loginData.user.username}`);
    console.log(`  Role: ${loginData.user.role}`);
    console.log(`  Developer: ${loginData.user.developerName}`);
    
    const token = loginData.token;
    
    // 2. Buscar projetos do desenvolvedor
    console.log('\n2. Buscando projetos do desenvolvedor...');
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
      console.log('\n  Primeiro projeto:');
      console.log(`    ID: ${firstWork.id}`);
      console.log(`    Domínio: ${firstWork.domain}`);
      console.log(`    Status atual: ${firstWork.developer_status}`);
      
      // 3. Tentar atualizar o status
      console.log('\n3. Tentando atualizar status do desenvolvedor...');
      const newStatus = firstWork.developer_status === 'Concluído' ? 'Em Andamento' : 'Concluído';
      
      const updateResponse = await fetch(`${API_URL}/works/${firstWork.id}/mark-completed`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ developer_status: newStatus })
      });
      
      console.log(`  Status da resposta: ${updateResponse.status}`);
      
      if (!updateResponse.ok) {
        const errorText = await updateResponse.text();
        console.log(`  Erro: ${errorText}`);
        throw new Error(`Atualização falhou: ${updateResponse.status}`);
      }
      
      const updateData = await updateResponse.json();
      console.log('✓ Status atualizado com sucesso!');
      console.log(`  Novo status: ${updateData.developer_status || newStatus}`);
      
      // 4. Verificar se a atualização foi persistida
      console.log('\n4. Verificando se a atualização foi persistida...');
      const verifyResponse = await fetch(`${API_URL}/works`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const verifyWorks = await verifyResponse.json();
      const updatedWork = verifyWorks.find(w => w.id === firstWork.id);
      
      if (updatedWork) {
        console.log('✓ Projeto encontrado após atualização:');
        console.log(`  Status: ${updatedWork.developer_status}`);
        
        if (updatedWork.developer_status === newStatus) {
          console.log('✓ Status foi persistido corretamente!');
        } else {
          console.log('✗ Status NÃO foi persistido!');
        }
      }
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('✓ TESTE CONCLUÍDO!');
    console.log('='.repeat(80));
    
  } catch (error) {
    console.error('\n✗ ERRO NO TESTE:');
    console.error(`  ${error.message}`);
    console.error(error.stack);
    process.exit(1);
  }
}

testarStatusDev();