// Script para verificar dados importados
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'worksdb',
  charset: 'utf8mb4'
};

async function verificarDados() {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    
    console.log('='.repeat(80));
    console.log('VERIFICAÇÃO DOS DADOS IMPORTADOS');
    console.log('='.repeat(80));
    
    // Total de registros
    const [total] = await connection.execute('SELECT COUNT(*) as total FROM works');
    console.log(`\nTotal de registros: ${total[0].total}`);
    
    // Primeiros 5 registros
    console.log('\n' + '-'.repeat(80));
    console.log('PRIMEIROS 5 REGISTROS:');
    console.log('-'.repeat(80));
    
    const [rows] = await connection.execute(`
      SELECT id, developer, value, domain, delivery_date, 
             delivery_month, delivery_year, status, payment_status 
      FROM works 
      ORDER BY id 
      LIMIT 5
    `);
    
    rows.forEach(row => {
      console.log(`\nID: ${row.id}`);
      console.log(`Desenvolvedor: ${row.developer}`);
      console.log(`Valor: R$ ${parseFloat(row.value).toFixed(2)}`);
      console.log(`Domínio: ${row.domain}`);
      console.log(`Data: ${row.delivery_date}`);
      console.log(`Mês/Ano: ${row.delivery_month}/${row.delivery_year}`);
      console.log(`Status: ${row.status}`);
      console.log(`Pagamento: ${row.payment_status}`);
    });
    
    // Estatísticas
    console.log('\n' + '-'.repeat(80));
    console.log('ESTATÍSTICAS:');
    console.log('-'.repeat(80));
    
    const [stats] = await connection.execute(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'Entregue' THEN 1 ELSE 0 END) as entregues,
        SUM(CASE WHEN payment_status = 'Pago' THEN 1 ELSE 0 END) as pagos,
        SUM(value) as valor_total,
        AVG(value) as valor_medio
      FROM works
    `);
    
    const s = stats[0];
    console.log(`\nTotal de projetos: ${s.total}`);
    console.log(`Projetos entregues: ${s.entregues} (${((s.entregues/s.total)*100).toFixed(1)}%)`);
    console.log(`Projetos pagos: ${s.pagos} (${((s.pagos/s.total)*100).toFixed(1)}%)`);
    console.log(`Valor total: R$ ${parseFloat(s.valor_total).toFixed(2)}`);
    console.log(`Valor médio: R$ ${parseFloat(s.valor_medio).toFixed(2)}`);
    
    // Por desenvolvedor
    console.log('\n' + '-'.repeat(80));
    console.log('TOP 10 DESENVOLVEDORES:');
    console.log('-'.repeat(80));
    
    const [devs] = await connection.execute(`
      SELECT 
        developer,
        COUNT(*) as total,
        SUM(CASE WHEN status = 'Entregue' THEN 1 ELSE 0 END) as entregues,
        SUM(CASE WHEN payment_status = 'Pago' THEN 1 ELSE 0 END) as pagos,
        SUM(value) as valor_total
      FROM works
      GROUP BY developer
      ORDER BY total DESC
      LIMIT 10
    `);
    
    devs.forEach((d, i) => {
      console.log(`\n${i+1}. ${d.developer}`);
      console.log(`   Total: ${d.total} | Entregues: ${d.entregues} | Pagos: ${d.pagos}`);
      console.log(`   Valor total: R$ ${parseFloat(d.valor_total).toFixed(2)}`);
    });
    
    // Por ano
    console.log('\n' + '-'.repeat(80));
    console.log('POR ANO:');
    console.log('-'.repeat(80));
    
    const [years] = await connection.execute(`
      SELECT 
        delivery_year,
        COUNT(*) as total,
        SUM(value) as valor_total
      FROM works
      GROUP BY delivery_year
      ORDER BY delivery_year
    `);
    
    years.forEach(y => {
      console.log(`\n${y.delivery_year}: ${y.total} projetos - R$ ${parseFloat(y.valor_total).toFixed(2)}`);
    });
    
    console.log('\n' + '='.repeat(80));
    console.log('✓ VERIFICAÇÃO CONCLUÍDA');
    console.log('='.repeat(80));
    
  } catch (error) {
    console.error('\n✗ Erro:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

verificarDados();
