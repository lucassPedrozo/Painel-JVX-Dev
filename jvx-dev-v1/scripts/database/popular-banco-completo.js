// Script único para popular o banco de dados com dados de exemplo
import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'worksdb'
};

// Dados de exemplo para popular o banco
const dadosExemplo = {
  users: [
    {
      username: 'jvxadmin',
      password: 'admin123',
      role: 'master',
      developer_name: null,
      active: true
    },
    {
      username: 'leandro.dev',
      password: 'dev123',
      role: 'standard',
      developer_name: 'Leandro',
      active: true
    },
    {
      username: 'heron.dev',
      password: 'dev123',
      role: 'standard',
      developer_name: 'Heron',
      active: true
    }
  ],
  
  developers: [
    {
      name: 'Leandro',
      phone: '(11) 99999-1111',
      email: 'leandro@example.com',
      whatsapp: '5511999991111',
      pixKey: 'leandro@example.com',
      pixType: 'Email',
      bankName: 'Banco do Brasil',
      agency: '1234-5',
      account: '12345-6',
      observations: 'Desenvolvedor sênior especializado em React'
    },
    {
      name: 'Heron',
      phone: '(11) 99999-2222',
      email: 'heron@example.com',
      whatsapp: '5511999992222',
      pixKey: '123.456.789-00',
      pixType: 'CPF',
      bankName: 'Itaú',
      agency: '5678-9',
      account: '98765-4',
      observations: 'Desenvolvedor full-stack com foco em Node.js'
    },
    {
      name: 'Alexandre',
      phone: '(11) 99999-3333',
      email: 'alexandre@example.com',
      whatsapp: '5511999993333',
      pixKey: 'alexandre@example.com',
      pixType: 'Email',
      bankName: 'Santander',
      agency: '9876-5',
      account: '54321-0',
      observations: 'Desenvolvedor frontend especializado em UI/UX'
    }
  ],
  
  works: [
    // Projetos de 2024 - Todos concluídos e entregues
    {
      developer: 'Leandro',
      deadline_type: 'Normal',
      value: 250.00,
      domain: 'empresa-exemplo.com.br',
      site_type: 'Site Institucional',
      delivery_date: '2024-01-15',
      delivery_month: 'Janeiro',
      delivery_year: 2024,
      status: 'Entregue',
      developer_status: 'Concluído',
      payment_status: 'Pago',
      observations: 'Site institucional com sistema de contato'
    },
    {
      developer: 'Heron',
      deadline_type: 'Prazo Reduzido',
      value: 300.00,
      domain: 'loja-virtual.com.br',
      site_type: 'Site Corporativo',
      delivery_date: '2024-01-20',
      delivery_month: 'Janeiro',
      delivery_year: 2024,
      status: 'Entregue',
      developer_status: 'Concluído',
      payment_status: 'Pago',
      observations: 'E-commerce completo com pagamento online'
    },
    {
      developer: 'Alexandre',
      deadline_type: 'Normal',
      value: 200.00,
      domain: 'landing-produto.com.br',
      site_type: 'Landing Page',
      delivery_date: '2024-02-01',
      delivery_month: 'Fevereiro',
      delivery_year: 2024,
      status: 'Entregue',
      developer_status: 'Concluído',
      payment_status: 'Pago',
      observations: 'Landing page para lançamento de produto'
    },
    {
      developer: 'Leandro',
      deadline_type: 'Normal',
      value: 280.00,
      domain: 'consultoria-tech.com.br',
      site_type: 'Site Corporativo',
      delivery_date: '2024-02-15',
      delivery_month: 'Fevereiro',
      delivery_year: 2024,
      status: 'Entregue',
      developer_status: 'Concluído',
      payment_status: 'Pago',
      observations: 'Site corporativo com blog integrado'
    },
    {
      developer: 'Heron',
      deadline_type: 'Normal',
      value: 220.00,
      domain: 'clinica-saude.com.br',
      site_type: 'Site Institucional',
      delivery_date: '2024-03-01',
      delivery_month: 'Março',
      delivery_year: 2024,
      status: 'Entregue',
      developer_status: 'Concluído',
      payment_status: 'Pago',
      observations: 'Site para clínica médica com agendamento online'
    },
    {
      developer: 'Alexandre',
      deadline_type: 'Prazo Reduzido',
      value: 350.00,
      domain: 'evento-tech.com.br',
      site_type: 'Landing Page',
      delivery_date: '2024-03-10',
      delivery_month: 'Março',
      delivery_year: 2024,
      status: 'Entregue',
      developer_status: 'Concluído',
      payment_status: 'Pago',
      observations: 'Landing page para evento de tecnologia'
    },
    
    // Projetos de 2025 - Alguns concluídos pelo dev mas ainda não entregues pelo master
    {
      developer: 'Leandro',
      deadline_type: 'Normal',
      value: 300.00,
      domain: 'startup-inovacao.com.br',
      site_type: 'Site Corporativo',
      delivery_date: '2025-01-15',
      delivery_month: 'Janeiro',
      delivery_year: 2025,
      status: 'Entregue',
      developer_status: 'Concluído',
      payment_status: 'Pago',
      observations: 'Site para startup de inovação tecnológica'
    },
    {
      developer: 'Heron',
      deadline_type: 'Normal',
      value: 250.00,
      domain: 'restaurante-gourmet.com.br',
      site_type: 'Site Institucional',
      delivery_date: '2025-02-01',
      delivery_month: 'Fevereiro',
      delivery_year: 2025,
      status: 'Entregue',
      developer_status: 'Concluído',
      payment_status: 'Pago',
      observations: 'Site para restaurante com cardápio online'
    },
    {
      developer: 'Alexandre',
      deadline_type: 'Normal',
      value: 180.00,
      domain: 'curso-online.com.br',
      site_type: 'Landing Page',
      delivery_date: '2025-02-15',
      delivery_month: 'Fevereiro',
      delivery_year: 2025,
      status: 'Entregue',
      developer_status: 'Concluído',
      payment_status: 'Pago',
      observations: 'Landing page para curso online'
    },
    {
      developer: 'Leandro',
      deadline_type: 'Prazo Reduzido',
      value: 400.00,
      domain: 'fintech-pagamentos.com.br',
      site_type: 'Site Corporativo',
      delivery_date: '2025-03-01',
      delivery_month: 'Março',
      delivery_year: 2025,
      status: 'Não Entregue',
      developer_status: 'Concluído',
      payment_status: 'Não Pago',
      observations: 'Projeto concluído pelo dev, aguardando aprovação do master'
    },
    
    // Projetos em andamento - Dev ainda trabalhando
    {
      developer: 'Heron',
      deadline_type: 'Normal',
      value: 320.00,
      domain: 'projeto-em-andamento.com.br',
      site_type: 'Site Corporativo',
      delivery_date: '2025-12-15',
      delivery_month: 'Dezembro',
      delivery_year: 2025,
      status: 'Não Entregue',
      developer_status: 'Em Andamento',
      payment_status: 'Não Pago',
      observations: 'Projeto em desenvolvimento - prazo dezembro'
    },
    {
      developer: 'Alexandre',
      deadline_type: 'Normal',
      value: 200.00,
      domain: 'landing-futura.com.br',
      site_type: 'Landing Page',
      delivery_date: '2025-11-30',
      delivery_month: 'Novembro',
      delivery_year: 2025,
      status: 'Não Entregue',
      developer_status: 'Em Andamento',
      payment_status: 'Não Pago',
      observations: 'Landing page em desenvolvimento'
    },
    
    // Projeto concluído pelo dev mas master ainda não aprovou
    {
      developer: 'Heron',
      deadline_type: 'Normal',
      value: 275.00,
      domain: 'aguardando-aprovacao.com.br',
      site_type: 'Site Institucional',
      delivery_date: '2025-10-15',
      delivery_month: 'Outubro',
      delivery_year: 2025,
      status: 'Não Entregue',
      developer_status: 'Concluído',
      payment_status: 'Não Pago',
      observations: 'Projeto finalizado pelo desenvolvedor, aguardando revisão e aprovação'
    }
  ]
};

async function popularBanco() {
  console.log('='.repeat(80));
  console.log('POPULANDO BANCO DE DADOS COMPLETO');
  console.log('='.repeat(80));
  
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    
    console.log('\n✓ Conectado ao banco de dados');
    
    // 1. Limpar tabelas existentes
    console.log('\n1. Limpando tabelas existentes...');
    await connection.execute('SET FOREIGN_KEY_CHECKS = 0');
    await connection.execute('DELETE FROM works');
    await connection.execute('DELETE FROM developers');
    await connection.execute('DELETE FROM users');
    await connection.execute('ALTER TABLE works AUTO_INCREMENT = 1');
    await connection.execute('ALTER TABLE developers AUTO_INCREMENT = 1');
    await connection.execute('ALTER TABLE users AUTO_INCREMENT = 1');
    await connection.execute('SET FOREIGN_KEY_CHECKS = 1');
    console.log('✓ Tabelas limpas');
    
    // 2. Inserir usuários
    console.log('\n2. Inserindo usuários...');
    for (const user of dadosExemplo.users) {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      await connection.execute(
        'INSERT INTO users (username, password, role, developer_name, active) VALUES (?, ?, ?, ?, ?)',
        [user.username, hashedPassword, user.role, user.developer_name, user.active]
      );
      console.log(`  ✓ Usuário criado: ${user.username} (${user.role})`);
    }
    
    // 3. Inserir desenvolvedores
    console.log('\n3. Inserindo desenvolvedores...');
    for (const dev of dadosExemplo.developers) {
      await connection.execute(
        'INSERT INTO developers (name, phone, email, whatsapp, pixKey, pixType, bankName, agency, account, observations) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [dev.name, dev.phone, dev.email, dev.whatsapp, dev.pixKey, dev.pixType, dev.bankName, dev.agency, dev.account, dev.observations]
      );
      console.log(`  ✓ Desenvolvedor criado: ${dev.name}`);
    }
    
    // 4. Atualizar estrutura da tabela works (adicionar developer_status)
    console.log('\n4. Atualizando estrutura da tabela...');
    try {
      await connection.execute(`
        ALTER TABLE works ADD COLUMN developer_status ENUM('Em Andamento', 'Concluído') NOT NULL DEFAULT 'Em Andamento' AFTER status
      `);
      console.log('  ✓ Campo developer_status adicionado');
    } catch (error) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log('  ✓ Campo developer_status já existe');
      } else {
        throw error;
      }
    }

    // 5. Inserir projetos
    console.log('\n5. Inserindo projetos...');
    for (const work of dadosExemplo.works) {
      await connection.execute(
        'INSERT INTO works (developer, deadline_type, value, domain, site_type, delivery_date, delivery_month, delivery_year, status, developer_status, payment_status, observations) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [work.developer, work.deadline_type, work.value, work.domain, work.site_type, work.delivery_date, work.delivery_month, work.delivery_year, work.status, work.developer_status, work.payment_status, work.observations]
      );
    }
    console.log(`  ✓ ${dadosExemplo.works.length} projetos criados`);
    
    // 6. Verificar dados inseridos
    console.log('\n6. Verificando dados inseridos...');
    
    const [userCount] = await connection.execute('SELECT COUNT(*) as total FROM users');
    console.log(`  ✓ Usuários: ${userCount[0].total}`);
    
    const [devCount] = await connection.execute('SELECT COUNT(*) as total FROM developers');
    console.log(`  ✓ Desenvolvedores: ${devCount[0].total}`);
    
    const [workCount] = await connection.execute('SELECT COUNT(*) as total FROM works');
    console.log(`  ✓ Projetos: ${workCount[0].total}`);
    
    // 7. Estatísticas finais
    console.log('\n7. Estatísticas finais:');
    const [stats] = await connection.execute(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'Entregue' THEN 1 ELSE 0 END) as entregues,
        SUM(CASE WHEN developer_status = 'Concluído' THEN 1 ELSE 0 END) as concluidos_dev,
        SUM(CASE WHEN payment_status = 'Pago' THEN 1 ELSE 0 END) as pagos,
        SUM(value) as valor_total,
        AVG(value) as valor_medio
      FROM works
    `);
    
    const s = stats[0];
    console.log(`  Total de projetos: ${s.total}`);
    console.log(`  Concluídos pelo dev: ${s.concluidos_dev} (${((s.concluidos_dev/s.total)*100).toFixed(1)}%)`);
    console.log(`  Entregues pelo master: ${s.entregues} (${((s.entregues/s.total)*100).toFixed(1)}%)`);
    console.log(`  Pagos: ${s.pagos} (${((s.pagos/s.total)*100).toFixed(1)}%)`);
    console.log(`  Valor total: R$ ${parseFloat(s.valor_total).toFixed(2)}`);
    console.log(`  Valor médio: R$ ${parseFloat(s.valor_medio).toFixed(2)}`);
    
    console.log('\n' + '='.repeat(80));
    console.log('✅ BANCO DE DADOS POPULADO COM SUCESSO!');
    console.log('='.repeat(80));
    console.log('\n🔐 Credenciais de acesso:');
    console.log('  Master: jvxadmin / admin123');
    console.log('  Dev Leandro: leandro.dev / dev123');
    console.log('  Dev Heron: heron.dev / dev123');
    console.log('\n🚀 Você pode agora:');
    console.log('  1. Iniciar o servidor: npm run server');
    console.log('  2. Iniciar o frontend: npm run dev');
    console.log('  3. Acessar: http://localhost:5173');
    
  } catch (error) {
    console.error('\n❌ ERRO:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Executar a função
popularBanco();

export { popularBanco, dadosExemplo };
