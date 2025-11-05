// Script para testar a importação do CSV
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ler o CSV com encoding correto
const csvPath = path.join(__dirname, 'public', 'Relatório de Desenvolvimento - Desenvolvimento.csv');
const csvContent = fs.readFileSync(csvPath, { encoding: 'utf-8' });

// Parse CSV
const lines = csvContent.split('\n').filter(line => line.trim());
const header = lines[0];
const dataLines = lines.slice(1);

console.log('='.repeat(80));
console.log('TESTE DE IMPORTAÇÃO DO CSV');
console.log('='.repeat(80));
console.log(`\nArquivo: ${csvPath}`);
console.log(`Total de linhas (incluindo cabeçalho): ${lines.length}`);
console.log(`Total de registros: ${dataLines.length}`);
console.log(`\nCabeçalho:\n${header}`);

// Testar parse de algumas linhas
console.log('\n' + '='.repeat(80));
console.log('TESTE DE PARSE - Primeiras 3 linhas');
console.log('='.repeat(80));

const regex = /,(?=(?:(?:[^"]*"){2})*[^"]*$)/;

dataLines.slice(0, 3).forEach((line, index) => {
  const values = line.split(regex).map(v => v.trim().replace(/^"|"$/g, ''));
  
  console.log(`\n--- Linha ${index + 2} ---`);
  console.log(`Desenvolvedor: ${values[0]}`);
  console.log(`Prazo: ${values[1]}`);
  console.log(`Valor: ${values[2]}`);
  console.log(`Domínio: ${values[3]}`);
  console.log(`Tipo de Site: ${values[4]}`);
  console.log(`Data Entrega: ${values[5]}`);
  console.log(`Mês: ${values[6]}`);
  console.log(`Ano: ${values[7]}`);
  console.log(`Status: ${values[8]}`);
  console.log(`Pagamento: ${values[9]}`);
  console.log(`Observações: ${values[10] || '(vazio)'}`);
  
  // Testar conversão de data
  const dateParts = values[5].trim().split('/');
  if (dateParts.length === 3) {
    const day = dateParts[0].padStart(2, '0');
    const month = dateParts[1].padStart(2, '0');
    const year = dateParts[2];
    const mysqlDate = `${year}-${month}-${day}`;
    console.log(`Data MySQL: ${mysqlDate}`);
    
    // Validar data
    const dateObj = new Date(mysqlDate);
    console.log(`Data válida: ${!isNaN(dateObj.getTime())}`);
    console.log(`Data formatada: ${dateObj.toLocaleDateString('pt-BR')}`);
  }
  
  // Testar conversão de valor
  const valueStr = values[2].toString()
    .replace(/R\$/g, '')
    .replace(/\s/g, '')
    .replace(/\./g, '')
    .replace(',', '.');
  const valueNum = parseFloat(valueStr) || 0;
  console.log(`Valor numérico: ${valueNum}`);
});

// Estatísticas
console.log('\n' + '='.repeat(80));
console.log('ESTATÍSTICAS DO CSV');
console.log('='.repeat(80));

const stats = {
  desenvolvedores: new Set(),
  tipos_site: new Set(),
  status: new Set(),
  pagamento: new Set(),
  anos: new Set(),
  meses: new Set(),
  prazos: new Set()
};

let erros = [];

dataLines.forEach((line, index) => {
  const values = line.split(regex).map(v => v.trim().replace(/^"|"$/g, ''));
  
  stats.desenvolvedores.add(values[0]);
  stats.prazos.add(values[1]);
  stats.tipos_site.add(values[4]);
  stats.status.add(values[8]);
  stats.pagamento.add(values[9]);
  stats.anos.add(values[7]);
  stats.meses.add(values[6]);
  
  // Validar data
  const dateParts = values[5].trim().split('/');
  if (dateParts.length !== 3) {
    erros.push(`Linha ${index + 2}: Data inválida (${values[5]})`);
  }
  
  // Validar campos obrigatórios
  if (!values[0]) erros.push(`Linha ${index + 2}: Desenvolvedor vazio`);
  if (!values[3]) erros.push(`Linha ${index + 2}: Domínio vazio`);
});

console.log(`\nDesenvolvedores únicos (${stats.desenvolvedores.size}):`);
[...stats.desenvolvedores].sort().forEach(d => console.log(`  - ${d}`));

console.log(`\nTipos de Prazo (${stats.prazos.size}):`);
[...stats.prazos].sort().forEach(t => console.log(`  - ${t}`));

console.log(`\nTipos de Site (${stats.tipos_site.size}):`);
[...stats.tipos_site].sort().forEach(t => console.log(`  - ${t}`));

console.log(`\nStatus de Entrega (${stats.status.size}):`);
[...stats.status].sort().forEach(s => console.log(`  - ${s}`));

console.log(`\nStatus de Pagamento (${stats.pagamento.size}):`);
[...stats.pagamento].sort().forEach(p => console.log(`  - ${p}`));

console.log(`\nAnos (${stats.anos.size}):`);
[...stats.anos].sort().forEach(a => console.log(`  - ${a}`));

console.log(`\nMeses (${stats.meses.size}):`);
[...stats.meses].sort().forEach(m => console.log(`  - ${m}`));

if (erros.length > 0) {
  console.log('\n' + '='.repeat(80));
  console.log(`ERROS ENCONTRADOS (${erros.length})`);
  console.log('='.repeat(80));
  erros.slice(0, 10).forEach(e => console.log(`  - ${e}`));
  if (erros.length > 10) {
    console.log(`  ... e mais ${erros.length - 10} erros`);
  }
} else {
  console.log('\n✓ Nenhum erro encontrado! CSV pronto para importação.');
}

console.log('\n' + '='.repeat(80));
