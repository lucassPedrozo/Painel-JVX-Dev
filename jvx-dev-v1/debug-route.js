import fetch from 'node-fetch';

async function debug() {
  try {
    // Login
    console.log('1. Fazendo login...');
    const loginRes = await fetch('http://localhost:3001/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'jvxadmin', password: 'admin123' })
    });
    
    const loginData = await loginRes.json();
    console.log('✓ Token obtido');
    
    // Test stats/by-date
    console.log('\n2. Testando /stats/by-date...');
    const statsRes = await fetch('http://localhost:3001/stats/by-date', {
      headers: { 
        'Authorization': `Bearer ${loginData.token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Status:', statsRes.status);
    console.log('Status Text:', statsRes.statusText);
    console.log('Content-Type:', statsRes.headers.get('content-type'));
    
    const text = await statsRes.text();
    console.log('\nResponse (primeiros 500 chars):');
    console.log(text.substring(0, 500));
    
    if (statsRes.status === 200) {
      try {
        const json = JSON.parse(text);
        console.log('\n✓ JSON válido!');
        console.log('Registros:', json.length);
      } catch (e) {
        console.log('\n✗ Não é JSON válido');
      }
    }
    
  } catch (err) {
    console.error('\nError:', err.message);
    console.error(err.stack);
  }
}

debug();
