// Script para verificar a estrutura da tabela works
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'worksdb'
};

async function verificarEstrutura() {
  console.log('='.repeat(80));
  console.log('VERIFICAÇÃO DA ESTRUTURA DA TABELA WORKS');
  console.log('='.repeat(80));
  
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    // 1. Estrutura da tabela
    console.log('\n1. Estrutura da tabela works:');
    const [structure] = await connection.execute('DESCRIBE works');
    
    console.log('\nCampos da tabela:');
    structure.forEach(field => {
      console.log(`  - ${field.Field}: ${field.Type} ${field.Null === 'YES' ? '(NULL)' : '(NOT NULL)'} ${field.Key ? `[${field.Key}]` : ''} ${field.Default !== null ? `Default: ${field.Default}` : ''}`);
    });
    
    // 2. Dados de exemplo
    console.log('\n2. Primeiros 3 registros (todos os campos):');
    const [samples] = await connection.execute('SELECT * FROM works LIMIT 3');
    
    samples.forEach((row, i) => {
      console.log(`\n--- Registro ${i + 1} ---`);
      Object.keys(row).forEach(key => {
        console.log(`  ${key}: ${row[key]}`);
      });
    });
    
    // 3. Estatísticas dos campos
    console.log('\n3. Estatísticas dos campos:');
    const [stats] = await connection.execute(`
      SELECT 
        COUNT(*) as total_registros,
        COUNT(DISTINCT developer) as desenvolvedores_unicos,
        COUNT(DISTINCT delivery_date) as datas_unicas,
        MIN(delivery_date) as data_mais_antiga,
        MAX(delivery_date) as data_mais_recente,
        MIN(value) as menor_valor,
        MAX(value) as maior_valor,
        AVG(value) as valor_medio,
        COUNT(CASE WHEN status = 'Entregue' THEN 1 END) as entregues,
        COUNT(CASE WHEN payment_status = 'Pago' THEN 1 END) as pagos
      FROM works
    `);
    
    const s = stats[0];
    console.log(`\nTotal de registros: ${s.total_registros}`);
    console.log(`Desenvolvedores únicos: ${s.desenvolvedores_unicos}`);
    console.log(`Datas únicas: ${s.datas_unicas}`);
    console.log(`Período: ${s.data_mais_antiga} até ${s.data_mais_recente}`);
    console.log(`Valores: R$ ${parseFloat(s.menor_valor).toFixed(2)} - R$ ${parseFloat(s.maior_valor).toFixed(2)}`);
    console.log(`Valor médio: R$ ${parseFloat(s.valor_medio).toFixed(2)}`);
    console.log(`Entregues: ${s.entregues} (${((s.entregues/s.total_registros)*100).toFixed(1)}%)`);
    console.log(`Pagos: ${s.pagos} (${((s.pagos/s.total_registros)*100).toFixed(1)}%)`);
    
    // 4. Valores únicos dos campos categóricos
    console.log('\n4. Valores únicos dos campos categóricos:');
    
    const [developers] = await connection.execute('SELECT DISTINCT developer FROM works ORDER BY developer');
    console.log(`\nDesenvolvedores (${developers.length}):`);
    developers.forEach(d => console.log(`  - ${d.developer}`));
    
    const [deadlineTypes] = await connection.execute('SELECT DISTINCT deadline_type FROM works ORDER BY deadline_type');
    console.log(`\nTipos de Prazo (${deadlineTypes.length}):`);
    deadlineTypes.forEach(d => console.log(`  - ${d.deadline_type}`));
    
    const [siteTypes] = await connection.execute('SELECT DISTINCT site_type FROM works ORDER BY site_type');
    console.log(`\nTipos de Site (${siteTypes.length}):`);
    siteTypes.forEach(s => console.log(`  - ${s.site_type}`));
    
    const [statuses] = await connection.execute('SELECT DISTINCT status FROM works ORDER BY status');
    console.log(`\nStatus de Entrega (${statuses.length}):`);
    statuses.forEach(s => console.log(`  - ${s.status}`));
    
    const [paymentStatuses] = await connection.execute('SELECT DISTINCT payment_status FROM works ORDER BY payment_status');
    console.log(`\nStatus de Pagamento (${paymentStatuses.length}):`);
    paymentStatuses.forEach(p => console.log(`  - ${p.payment_status}`));
    
    await connection.end();
    
    console.log('\n' + '='.repeat(80));
    console.log('✓ VERIFICAÇÃO CONCLUÍDA');
    console.log('='.repeat(80));
    
  } catch (error) {
    console.error('\n✗ ERRO:', error.message);
    process.exit(1);
  }
}

verificarEstrutura();