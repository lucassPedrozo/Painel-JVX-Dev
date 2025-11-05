// Script para testar as rotas de estatísticas diretamente
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'worksdb'
};

async function testarQueries() {
  console.log('='.repeat(80));
  console.log('TESTE DAS QUERIES DE ESTATÍSTICAS');
  console.log('='.repeat(80));
  
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    // 1. Query por data (para gráfico de barras)
    console.log('\n1. Testando query por data:');
    const sqlByDate = `
      SELECT 
        DATE(delivery_date) as date,
        COUNT(*) as total
      FROM works
      WHERE delivery_date IS NOT NULL
      GROUP BY DATE(delivery_date) 
      ORDER BY date DESC
      LIMIT 10
    `;
    
    const [byDateResults] = await connection.execute(sqlByDate);
    console.log(`✓ Registros por data: ${byDateResults.length}`);
    console.log('\nPrimeiros 5 registros:');
    byDateResults.slice(0, 5).forEach(row => {
      console.log(`  ${row.date}: ${row.total} projetos`);
    });
    
    // 2. Query por desenvolvedor (para gráfico radar)
    console.log('\n2. Testando query por desenvolvedor:');
    const sqlByDev = `
      SELECT 
        developer as dev,
        COUNT(*) as total,
        SUM(CASE WHEN status = 'Entregue' THEN 1 ELSE 0 END) as entregues,
        SUM(CASE WHEN payment_status = 'Pago' THEN 1 ELSE 0 END) as pagos,
        SUM(value) as valor_total
      FROM works
      GROUP BY developer 
      ORDER BY total DESC
      LIMIT 10
    `;
    
    const [byDevResults] = await connection.execute(sqlByDev);
    console.log(`✓ Desenvolvedores: ${byDevResults.length}`);
    console.log('\nTop 5 desenvolvedores:');
    byDevResults.slice(0, 5).forEach(row => {
      console.log(`  ${row.dev}: ${row.total} projetos (${row.entregues} entregues, ${row.pagos} pagos, R$ ${parseFloat(row.valor_total).toFixed(2)})`);
    });
    
    // 3. Query estatísticas gerais
    console.log('\n3. Testando query de estatísticas gerais:');
    const sqlGeneral = `
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'Entregue' THEN 1 ELSE 0 END) as entregues,
        SUM(CASE WHEN payment_status = 'Pago' THEN 1 ELSE 0 END) as pagos,
        SUM(value) as valor_total,
        AVG(value) as valor_medio,
        COUNT(DISTINCT developer) as total_desenvolvedores
      FROM works
    `;
    
    const [generalResults] = await connection.execute(sqlGeneral);
    const stats = generalResults[0];
    console.log('✓ Estatísticas gerais:');
    console.log(`  Total: ${stats.total}`);
    console.log(`  Entregues: ${stats.entregues} (${((stats.entregues/stats.total)*100).toFixed(1)}%)`);
    console.log(`  Pagos: ${stats.pagos} (${((stats.pagos/stats.total)*100).toFixed(1)}%)`);
    console.log(`  Valor total: R$ ${parseFloat(stats.valor_total).toFixed(2)}`);
    console.log(`  Valor médio: R$ ${parseFloat(stats.valor_medio).toFixed(2)}`);
    console.log(`  Desenvolvedores: ${stats.total_desenvolvedores}`);
    
    await connection.end();
    
    console.log('\n' + '='.repeat(80));
    console.log('✓ TODAS AS QUERIES FUNCIONARAM!');
    console.log('='.repeat(80));
    
  } catch (error) {
    console.error('\n✗ ERRO:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

testarQueries();