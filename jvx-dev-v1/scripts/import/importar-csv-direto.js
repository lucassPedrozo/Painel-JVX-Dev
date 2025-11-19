// Script para importar CSV diretamente no banco
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuração do banco
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'worksdb',
  charset: 'utf8mb4'
};

async function importarCSV() {
  let connection;
  
  try {
    console.log('='.repeat(80));
    console.log('IMPORTAÇÃO DIRETA DO CSV');
    console.log('='.repeat(80));
    
    // Conectar ao banco
    console.log('\n1. Conectando ao banco de dados...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✓ Conectado com sucesso!');
    
    // Ler o CSV
    console.log('\n2. Lendo arquivo CSV...');
    const csvPath = path.join(__dirname, '..', '..', 'database', 'exemplo-importacao.csv');
    const csvContent = fs.readFileSync(csvPath, { encoding: 'utf-8' });
    
    // Parse CSV
    const lines = csvContent.split('\n').filter(line => line.trim());
    const dataLines = lines.slice(1); // Pular cabeçalho
    
    console.log(`✓ Arquivo lido: ${dataLines.length} registros encontrados`);
    
    // Limpar tabela (opcional)
    console.log('\n3. Limpando tabela works...');
    await connection.execute('DELETE FROM works');
    await connection.execute('ALTER TABLE works AUTO_INCREMENT = 1');
    console.log('✓ Tabela limpa');
    
    // Importar dados
    console.log('\n4. Importando registros...');
    const regex = /,(?=(?:(?:[^"]*"){2})*[^"]*$)/;
    let imported = 0;
    let errors = [];
    
    for (let i = 0; i < dataLines.length; i++) {
      const line = dataLines[i];
      const values = line.split(regex).map(v => v.trim().replace(/^"|"$/g, ''));
      
      // Campos do CSV:
      // 0: Desenvolvedor
      // 1: Prazo
      // 2: Valor R$
      // 3: Domínio Desenvolvimento
      // 4: Tipo de Site
      // 5: Data Entrega (DD/MM/YYYY)
      // 6: Mês
      // 7: Ano
      // 8: Status
      // 9: Pagamento
      // 10: OBS ou Template
      
      try {
        // Converter valor
        const valueStr = values[2].toString()
          .replace(/R\$/g, '')
          .replace(/\s/g, '')
          .replace(/\./g, '')
          .replace(',', '.');
        const value = parseFloat(valueStr) || 0;
        
        // Converter data DD/MM/YYYY para YYYY-MM-DD
        const dateParts = values[5].trim().split('/');
        if (dateParts.length !== 3) {
          errors.push(`Linha ${i + 2}: Data inválida (${values[5]})`);
          continue;
        }
        
        const day = dateParts[0].padStart(2, '0');
        const month = dateParts[1].padStart(2, '0');
        const year = dateParts[2];
        const deliveryDate = `${year}-${month}-${day}`;
        
        // Validar data
        const dateObj = new Date(deliveryDate);
        if (isNaN(dateObj.getTime())) {
          errors.push(`Linha ${i + 2}: Data inválida (${values[5]})`);
          continue;
        }
        
        // Validar campos obrigatórios
        if (!values[0] || !values[3]) {
          errors.push(`Linha ${i + 2}: Desenvolvedor ou domínio ausente`);
          continue;
        }
        
        // Inserir no banco
        const sql = `
          INSERT INTO works (
            developer, deadline_type, value, domain, site_type, 
            delivery_date, delivery_month, delivery_year, 
            status, payment_status, observations
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        await connection.execute(sql, [
          values[0].trim(),
          values[1] || 'Normal',
          value,
          values[3].trim(),
          values[4] || 'Site Institucional',
          deliveryDate,
          values[6] || '',
          parseInt(values[7]) || new Date().getFullYear(),
          values[8] || 'Não Entregue',
          values[9] || 'Não Pago',
          values[10] || null
        ]);
        
        imported++;
        
        // Mostrar progresso a cada 50 registros
        if (imported % 50 === 0) {
          console.log(`  Importados: ${imported}/${dataLines.length}`);
        }
        
      } catch (err) {
        errors.push(`Linha ${i + 2}: ${err.message}`);
      }
    }
    
    console.log(`✓ Importação concluída: ${imported} registros`);
    
    // Mostrar erros se houver
    if (errors.length > 0) {
      console.log('\n⚠ Erros encontrados:');
      errors.slice(0, 10).forEach(e => console.log(`  - ${e}`));
      if (errors.length > 10) {
        console.log(`  ... e mais ${errors.length - 10} erros`);
      }
    }
    
    // Verificar resultado
    console.log('\n5. Verificando resultado...');
    const [rows] = await connection.execute('SELECT COUNT(*) as total FROM works');
    console.log(`✓ Total de registros no banco: ${rows[0].total}`);
    
    const [devs] = await connection.execute('SELECT developer, COUNT(*) as total FROM works GROUP BY developer ORDER BY total DESC');
    console.log('\nRegistros por desenvolvedor:');
    devs.forEach(d => console.log(`  ${d.developer}: ${d.total}`));
    
    console.log('\n' + '='.repeat(80));
    console.log('✓ IMPORTAÇÃO CONCLUÍDA COM SUCESSO!');
    console.log('='.repeat(80));
    
  } catch (error) {
    console.error('\n✗ Erro na importação:', error.message);
    console.error(error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Executar
importarCSV();
