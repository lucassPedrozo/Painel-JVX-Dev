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

// Dados de exemplo 100% fictícios (equipe, clientes e valores inventados).
// Gerados de forma determinística para que o seed produza sempre o mesmo resultado.

const MESES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

const CLIENTES = [
  'padaria-bom-sabor', 'clinica-vida-plena', 'advocacia-martins', 'construtora-horizonte', 'pet-shop-amigo-fiel',
  'escola-aprender', 'oficina-motor-forte', 'imobiliaria-casa-nova', 'studio-pilates-equilibrio', 'restaurante-sabor-caseiro',
  'contabilidade-exata', 'otica-visao-clara', 'academia-corpo-ativo', 'floricultura-jardim', 'transportadora-rota-sul',
  'dentista-sorriso', 'loja-moda-urbana', 'cafeteria-grao-nobre', 'engenharia-estrutural', 'agencia-viagens-mundo',
  'marcenaria-arte-madeira', 'veterinaria-patas', 'energia-solar-sol', 'consultoria-rh-talentos', 'grafica-impressao-rapida',
  'hotel-serra-azul', 'eventos-celebrar', 'seguros-protecao', 'tecnologia-nuvem', 'nutricionista-equilibrio',
  'arquitetura-linhas', 'fisioterapia-movimento', 'eletrica-alta-tensao', 'vidracaria-cristal', 'buffet-festa-boa',
  'metalurgica-aco-forte', 'cursos-online-saber', 'barbearia-classica', 'lavanderia-express', 'psicologia-bem-estar'
];

const TIPOS = [
  { type: 'Site Institucional', base: 250 },
  { type: 'Site Institucional', base: 250 },
  { type: 'Site Institucional', base: 280 },
  { type: 'Landing Page', base: 180 },
  { type: 'Landing Page', base: 200 },
  { type: 'Site Corporativo', base: 380 },
  { type: 'E-commerce', base: 650 },
  { type: 'Blog', base: 220 },
  { type: 'Portfólio', base: 200 }
];

const TEMPLATES = [
  'https://themeforest.net/item/exemplo-business',
  'https://themeforest.net/item/exemplo-clinic',
  'https://themeforest.net/item/exemplo-shop',
  null,
  null
];

const DEVS = ['Ana Ribeiro', 'Bruno Carvalho', 'Carla Mendes', 'Diego Santos'];

// Gerador pseudoaleatório com semente fixa (mulberry32)
function criarRandom(seed) {
  return () => {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function gerarProjetos() {
  const rand = criarRandom(2026);
  const pick = (arr) => arr[Math.floor(rand() * arr.length)];
  const works = [];
  let cliente = 0;

  // Janeiro/2025 até Setembro/2026, com volume crescente
  for (let ano = 2025; ano <= 2026; ano++) {
    const ultimoMes = ano === 2026 ? 8 : 11;
    for (let mes = 0; mes <= ultimoMes; mes++) {
      const recente = ano === 2026 && mes >= 7;
      const quantidade = 2 + Math.floor(rand() * 3) + (ano === 2026 ? 1 : 0);

      for (let i = 0; i < quantidade; i++) {
        const tipo = pick(TIPOS);
        const prazoReduzido = rand() < 0.2;
        const valor = tipo.base + (prazoReduzido ? 50 : 0) + Math.floor(rand() * 4) * 10;
        const dia = 1 + Math.floor(rand() * 27);
        const data = `${ano}-${String(mes + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
        const nome = CLIENTES[cliente++ % CLIENTES.length];

        // Projetos antigos: entregues e pagos. Mais recentes: mistura de estados.
        let status = 'Entregue';
        let developerStatus = 'Concluído';
        let pagamento = 'Pago';
        if (recente) {
          const r = rand();
          if (r < 0.35) { status = 'Não Entregue'; developerStatus = 'Em Andamento'; pagamento = 'Não Pago'; }
          else if (r < 0.6) { status = 'Não Entregue'; pagamento = 'Não Pago'; }
          else if (r < 0.8) { pagamento = 'Não Pago'; }
        } else if (ano === 2026 && mes >= 5 && rand() < 0.3) {
          pagamento = 'Não Pago';
        }

        const avaliado = status === 'Entregue' && rand() < 0.8;
        const nota = () => 3 + Math.floor(rand() * 3);

        works.push({
          developer: pick(DEVS),
          deadline_type: prazoReduzido ? 'Prazo Reduzido' : 'Normal',
          value: valor,
          domain: `${nome}.example.com`,
          site_type: tipo.type,
          template: pick(TEMPLATES),
          delivery_date: data,
          delivery_month: MESES[mes],
          delivery_year: ano,
          status,
          developer_status: developerStatus,
          payment_status: pagamento,
          observations: prazoReduzido ? 'Entrega antecipada a pedido do cliente' : null,
          rating_aparencia: avaliado ? nota() : null,
          rating_complexidade: avaliado ? nota() : null,
          rating_satisfacao: avaliado ? nota() : null,
          rating_material: avaliado ? nota() : null
        });
      }
    }
  }
  return works;
}

const dadosExemplo = {
  users: [
    { username: 'jvxadmin', password: 'admin123', role: 'master', developer_name: null, active: true },
    { username: 'ana.dev', password: 'dev123', role: 'standard', developer_name: 'Ana Ribeiro', active: true },
    { username: 'bruno.dev', password: 'dev123', role: 'standard', developer_name: 'Bruno Carvalho', active: true }
  ],

  developers: [
    {
      name: 'Ana Ribeiro', phone: '(11) 90000-0001', email: 'ana@example.com', whatsapp: '5511900000001',
      pixKey: 'ana@example.com', pixType: 'Email', bankName: 'Banco Exemplo', agency: '0001', account: '10001-0',
      observations: 'Front-end, especialista em sites institucionais'
    },
    {
      name: 'Bruno Carvalho', phone: '(11) 90000-0002', email: 'bruno@example.com', whatsapp: '5511900000002',
      pixKey: 'bruno@example.com', pixType: 'Email', bankName: 'Banco Exemplo', agency: '0001', account: '10002-0',
      observations: 'Full-stack, foco em e-commerce'
    },
    {
      name: 'Carla Mendes', phone: '(11) 90000-0003', email: 'carla@example.com', whatsapp: '5511900000003',
      pixKey: 'carla@example.com', pixType: 'Email', bankName: 'Banco Exemplo', agency: '0001', account: '10003-0',
      observations: 'UI/UX e landing pages'
    },
    {
      name: 'Diego Santos', phone: '(11) 90000-0004', email: 'diego@example.com', whatsapp: '5511900000004',
      pixKey: 'diego@example.com', pixType: 'Email', bankName: 'Banco Exemplo', agency: '0001', account: '10004-0',
      observations: 'WordPress e blogs'
    }
  ],

  works: gerarProjetos()
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
        'INSERT INTO works (developer, deadline_type, value, domain, site_type, template, delivery_date, delivery_month, delivery_year, status, developer_status, payment_status, observations, rating_aparencia, rating_complexidade, rating_satisfacao, rating_material) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [work.developer, work.deadline_type, work.value, work.domain, work.site_type, work.template, work.delivery_date, work.delivery_month, work.delivery_year, work.status, work.developer_status, work.payment_status, work.observations, work.rating_aparencia, work.rating_complexidade, work.rating_satisfacao, work.rating_material]
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
    console.log('  Dev Ana: ana.dev / dev123');
    console.log('  Dev Bruno: bruno.dev / dev123');
    console.log('\n🚀 Você pode agora:');
    console.log('  1. Iniciar o servidor: pnpm run server');
    console.log('  2. Iniciar o frontend: pnpm run dev');
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
