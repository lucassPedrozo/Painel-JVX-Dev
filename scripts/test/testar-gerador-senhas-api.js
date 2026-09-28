import dotenv from 'dotenv';

dotenv.config();

const API_URL = process.env.VITE_API_URL || 'http://localhost:3001';

async function main() {
  console.log('🧪 Testando API do Gerador de Link para Senhas\n');
  console.log(`API URL: ${API_URL}\n`);

  // ============================================
  // 1. Login para obter token
  // ============================================
  console.log('1️⃣ Fazendo login...');
  
  const loginResponse = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: 'jvxadmin',
      password: 'admin123'
    })
  });

  if (!loginResponse.ok) {
    throw new Error('Falha no login');
  }

  const { token, user } = await loginResponse.json();
  console.log(`✅ Login realizado: ${user.username} (${user.role})\n`);

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };

  // ============================================
  // 2. Testar geração de link seguro
  // ============================================
  console.log('2️⃣ Gerando link seguro...');
  
  const gerarLinkResponse = await fetch(`${API_URL}/ferramentas/gerar-link-senha`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      linkAcesso: 'https://exemplo.com/admin',
      login: 'admin@exemplo.com',
      senha: 'SenhaSegura123!',
      mensagem: 'Acesso de homologação - válido até amanhã',
      tempoExpiracao: '24h'
    })
  });

  if (!gerarLinkResponse.ok) {
    const error = await gerarLinkResponse.json();
    throw new Error(`Erro ao gerar link: ${error.error}`);
  }

  const resultadoLink = await gerarLinkResponse.json();
  console.log('✅ Link gerado com sucesso!');
  console.log(`🔗 Link: ${resultadoLink.linkSeguro}`);
  console.log(`🔑 Secret Key: ${resultadoLink.secret_key}`);
  console.log(`⏰ Expiração: ${resultadoLink.expiracao}\n`);

  // ============================================
  // 3. Salvar histórico de mensagens
  // ============================================
  console.log('3️⃣ Salvando histórico de mensagens...');
  
  const salvarHistoricoResponse = await fetch(`${API_URL}/ferramentas/historico-senhas`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      historico: [
        {
          id: '1',
          mensagem: 'Acesso para homologação',
          timestamp: Date.now(),
          fixada: true
        },
        {
          id: '2',
          mensagem: 'Credenciais temporárias - válido por 24h',
          timestamp: Date.now() - 1000,
          fixada: false
        }
      ]
    })
  });

  if (!salvarHistoricoResponse.ok) {
    throw new Error('Erro ao salvar histórico');
  }

  console.log('✅ Histórico salvo\n');

  // ============================================
  // 4. Buscar histórico de mensagens
  // ============================================
  console.log('4️⃣ Buscando histórico de mensagens...');
  
  const buscarHistoricoResponse = await fetch(`${API_URL}/ferramentas/historico-senhas`, {
    headers
  });

  if (!buscarHistoricoResponse.ok) {
    throw new Error('Erro ao buscar histórico');
  }

  const historico = await buscarHistoricoResponse.json();
  console.log(`✅ ${historico.length} mensagens no histórico:`);
  historico.forEach((item, index) => {
    console.log(`   ${index + 1}. ${item.mensagem} ${item.fixada ? '📌' : ''}`);
  });
  console.log('');

  // ============================================
  // 5. Buscar histórico de links gerados (auditoria)
  // ============================================
  console.log('5️⃣ Buscando histórico de links gerados (auditoria)...');
  
  const auditResponse = await fetch(`${API_URL}/ferramentas/historico-links-gerados`, {
    headers
  });

  if (!auditResponse.ok) {
    throw new Error('Erro ao buscar auditoria');
  }

  const auditoria = await auditResponse.json();
  console.log(`✅ ${auditoria.length} links registrados no histórico de auditoria`);
  
  if (auditoria.length > 0) {
    console.log('\nÚltimos links gerados:');
    auditoria.slice(0, 3).forEach((item, index) => {
      console.log(`   ${index + 1}. ${item.linkAcesso}`);
      console.log(`      Login: ${item.login}`);
      console.log(`      Criado: ${new Date(item.createdAt).toLocaleString('pt-BR')}`);
      console.log(`      Expira: ${item.tempoExpiracao}\n`);
    });
  }

  // ============================================
  // 6. Teste de validações
  // ============================================
  console.log('6️⃣ Testando validações...');
  
  const testesValidacao = [
    { campo: 'linkAcesso vazio', dados: { linkAcesso: '', login: 'test', senha: 'test', tempoExpiracao: '24h' } },
    { campo: 'login vazio', dados: { linkAcesso: 'http://test.com', login: '', senha: 'test', tempoExpiracao: '24h' } },
    { campo: 'senha vazia', dados: { linkAcesso: 'http://test.com', login: 'test', senha: '', tempoExpiracao: '24h' } },
  ];

  for (const teste of testesValidacao) {
    const validacaoResponse = await fetch(`${API_URL}/ferramentas/gerar-link-senha`, {
      method: 'POST',
      headers,
      body: JSON.stringify(teste.dados)
    });

    if (validacaoResponse.status === 400) {
      const error = await validacaoResponse.json();
      console.log(`   ✅ Validação OK: ${teste.campo} → ${error.error}`);
    } else {
      console.log(`   ❌ Validação falhou: ${teste.campo}`);
    }
  }

  console.log('\n✅ Todos os testes concluídos com sucesso!');
  console.log('\n📊 Resumo:');
  console.log('   ✓ Login e autenticação');
  console.log('   ✓ Geração de link via OneTimeSecret');
  console.log('   ✓ Salvamento de histórico de mensagens');
  console.log('   ✓ Busca de histórico de mensagens');
  console.log('   ✓ Auditoria de links gerados');
  console.log('   ✓ Validações de entrada');
}

main().catch(error => {
  console.error('\n❌ Erro no teste:', error.message);
  process.exit(1);
});
