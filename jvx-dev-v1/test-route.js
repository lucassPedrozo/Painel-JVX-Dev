import fetch from 'node-fetch';

async function test() {
  try {
    // Login
    const loginRes = await fetch('http://localhost:3001/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'jvxadmin', password: 'admin123' })
    });
    
    const loginData = await loginResponse.json();
    console.log('Token:', loginData.token.substring(0, 20));
    
    // Test stats
    const statsRes = await fetch('http://localhost:3001/stats/by-date', {
      headers: { 'Authorization': `Bearer ${loginData.token}` }
    });
    
    console.log('Status:', statsRes.status);
    console.log('Headers:', statsRes.headers.raw());
    
    const text = await statsRes.text();
    console.log('Response:', text.substring(0, 200));
    
  } catch (err) {
    console.error('Error:', err.message);
  }
}

test();
