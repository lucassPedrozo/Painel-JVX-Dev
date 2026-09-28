/**
 * Testes de integração para a API do servidor.
 * 
 * Pré-requisitos:
 *   1. MySQL rodando no XAMPP
 *   2. Banco 'worksdb' criado com as tabelas
 *   3. .env configurado com JWT_SECRET (32+ chars)
 *   4. Servidor rodando: node server.js
 * 
 * Execução: node scripts/test/testar-api-completo.js
 */

const API_URL = process.env.VITE_API_URL || 'http://localhost:3001'

let masterToken = null
let createdWorkId = null

// ============================================
// Helpers
// ============================================
async function request(method, path, body = null, token = null) {
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const opts = { method, headers }
  if (body) opts.body = JSON.stringify(body)

  const res = await fetch(`${API_URL}${path}`, opts)
  const data = await res.json().catch(() => null)
  return { status: res.status, data, ok: res.ok }
}

function assert(condition, msg) {
  if (!condition) throw new Error(`FALHOU: ${msg}`)
}

let passed = 0
let failed = 0
const failures = []

async function test(name, fn) {
  try {
    await fn()
    passed++
    console.log(`  ✓ ${name}`)
  } catch (err) {
    failed++
    failures.push({ name, error: err.message })
    console.log(`  ✗ ${name} → ${err.message}`)
  }
}

// ============================================
// Testes
// ============================================

async function run() {
  console.log('\n=== TESTES DE INTEGRAÇÃO DA API ===\n')

  // ----- AUTH -----
  console.log('▸ Auth')

  await test('POST /auth/login - campos obrigatórios', async () => {
    const r = await request('POST', '/auth/login', {})
    assert(r.status === 400, `Esperado 400, veio ${r.status}`)
  })

  await test('POST /auth/login - credenciais inválidas', async () => {
    const r = await request('POST', '/auth/login', { username: '__inexistente__', password: 'abc' })
    assert(r.status === 401, `Esperado 401, veio ${r.status}`)
  })

  await test('POST /auth/login - login master bem-sucedido', async () => {
    const r = await request('POST', '/auth/login', { username: 'jvxadmin', password: 'admin123' })
    if (!r.ok) {
      console.log('    ⚠ Verifique se o usuário jvxadmin/admin123 existe no banco')
      throw new Error(`Login falhou: ${r.status} - ${JSON.stringify(r.data)}`)
    }
    assert(r.data.token, 'Token não retornado')
    assert(r.data.user.role === 'master', 'Role deveria ser master')
    masterToken = r.data.token
  })

  await test('GET /auth/verify - token válido', async () => {
    const r = await request('GET', '/auth/verify', null, masterToken)
    assert(r.ok, `Esperado 200, veio ${r.status}`)
    assert(r.data.valid === true, 'Esperado valid=true')
  })

  await test('GET /auth/verify - token inválido', async () => {
    const r = await request('GET', '/auth/verify', null, 'token-invalido')
    assert(r.status === 403, `Esperado 403, veio ${r.status}`)
  })

  await test('GET /works - sem token retorna 401', async () => {
    const r = await request('GET', '/works')
    assert(r.status === 401, `Esperado 401, veio ${r.status}`)
  })

  // ----- WORKS CRUD -----
  console.log('\n▸ Works CRUD')

  await test('GET /works - lista works com token', async () => {
    const r = await request('GET', '/works', null, masterToken)
    assert(r.ok, `Esperado 200, veio ${r.status}`)
    assert(Array.isArray(r.data), 'Esperado array')
  })

  await test('POST /works - validação campos obrigatórios', async () => {
    const r = await request('POST', '/works', { value: 100 }, masterToken)
    assert(r.status === 400, `Esperado 400, veio ${r.status}`)
  })

  await test('POST /works - criar work válido', async () => {
    const r = await request('POST', '/works', {
      developer: 'Test Dev',
      deadline_type: 'Normal',
      value: 250,
      domain: 'https://test-api.com',
      site_type: 'Site Institucional',
      delivery_date: new Date().toISOString(),
      delivery_month: 'Junho',
      delivery_year: 2025,
      status: 'Não Entregue',
      developer_status: 'Em Andamento',
      payment_status: 'Não Pago',
      observations: 'Teste API'
    }, masterToken)
    assert(r.ok, `Esperado 200/201, veio ${r.status}: ${JSON.stringify(r.data)}`)
    assert(r.data.id, 'ID não retornado')
    createdWorkId = r.data.id
  })

  await test('PUT /works/:id - atualizar work', async () => {
    if (!createdWorkId) throw new Error('Sem work criado para atualizar')
    const r = await request('PUT', `/works/${createdWorkId}`, {
      developer: 'Test Dev Updated',
      deadline_type: 'Normal',
      value: 350,
      domain: 'https://test-api-updated.com',
      site_type: 'Landing Page',
      delivery_date: new Date().toISOString(),
      delivery_month: 'Junho',
      delivery_year: 2025,
      status: 'Não Entregue',
      developer_status: 'Em Andamento',
      payment_status: 'Não Pago',
      observations: 'Atualizado'
    }, masterToken)
    assert(r.ok, `Esperado 200, veio ${r.status}`)
  })

  await test('PUT /works/99999 - work inexistente retorna 404', async () => {
    const r = await request('PUT', '/works/99999', {
      developer: 'X', deadline_type: 'Normal', value: 1, domain: 'x.com',
      site_type: 'Blog', delivery_date: new Date().toISOString(),
      delivery_month: 'Jan', delivery_year: 2025, status: 'Não Entregue',
      developer_status: 'Em Andamento', payment_status: 'Não Pago'
    }, masterToken)
    assert(r.status === 404, `Esperado 404, veio ${r.status}`)
  })

  await test('PATCH /works/:id/mark-paid - marcar como pago', async () => {
    if (!createdWorkId) throw new Error('Sem work criado')
    const r = await request('PATCH', `/works/${createdWorkId}/mark-paid`, null, masterToken)
    assert(r.ok, `Esperado 200, veio ${r.status}`)
  })

  await test('PATCH /works/99999/mark-paid - inexistente retorna 404', async () => {
    const r = await request('PATCH', '/works/99999/mark-paid', null, masterToken)
    assert(r.status === 404, `Esperado 404, veio ${r.status}`)
  })

  await test('PATCH /works/:id/mark-completed - marcar concluído', async () => {
    if (!createdWorkId) throw new Error('Sem work criado')
    const r = await request('PATCH', `/works/${createdWorkId}/mark-completed`, { developer_status: 'Concluído' }, masterToken)
    assert(r.ok, `Esperado 200, veio ${r.status}`)
  })

  await test('PATCH /works/:id/mark-completed - status inválido', async () => {
    if (!createdWorkId) throw new Error('Sem work criado')
    const r = await request('PATCH', `/works/${createdWorkId}/mark-completed`, { developer_status: 'Invalido' }, masterToken)
    assert(r.status === 400, `Esperado 400, veio ${r.status}`)
  })

  await test('DELETE /works/:id - deletar work criado', async () => {
    if (!createdWorkId) throw new Error('Sem work criado')
    const r = await request('DELETE', `/works/${createdWorkId}`, null, masterToken)
    assert(r.ok, `Esperado 200, veio ${r.status}`)
  })

  await test('DELETE /works/99999 - inexistente retorna 404', async () => {
    const r = await request('DELETE', '/works/99999', null, masterToken)
    assert(r.status === 404, `Esperado 404, veio ${r.status}`)
  })

  // ----- STATS -----
  console.log('\n▸ Stats')

  await test('GET /stats/general - estatísticas gerais', async () => {
    const r = await request('GET', '/stats/general', null, masterToken)
    assert(r.ok, `Esperado 200, veio ${r.status}`)
    assert(r.data.total !== undefined, 'Campo total ausente')
  })

  await test('GET /stats/by-developer - por desenvolvedor', async () => {
    const r = await request('GET', '/stats/by-developer', null, masterToken)
    assert(r.ok, `Esperado 200, veio ${r.status}`)
    assert(Array.isArray(r.data), 'Esperado array')
  })

  await test('GET /stats/by-date - por data', async () => {
    const r = await request('GET', '/stats/by-date', null, masterToken)
    assert(r.ok, `Esperado 200, veio ${r.status}`)
    assert(Array.isArray(r.data), 'Esperado array')
  })

  // ----- HEALTH CHECK -----
  console.log('\n▸ Health')

  await test('GET /health - retorna ok', async () => {
    const r = await request('GET', '/health')
    assert(r.ok, `Esperado 200, veio ${r.status}`)
    assert(r.data.status === 'ok', 'Esperado status: ok')
  })

  // ----- 404 -----
  console.log('\n▸ Rotas')

  await test('GET /rota-inexistente - retorna 404', async () => {
    const r = await request('GET', '/rota-inexistente')
    assert(r.status === 404, `Esperado 404, veio ${r.status}`)
  })

  // ----- RESULTADO -----
  console.log('\n' + '='.repeat(50))
  console.log(`✓ ${passed} passou | ✗ ${failed} falhou | Total: ${passed + failed}`)
  
  if (failures.length > 0) {
    console.log('\nFalhas:')
    failures.forEach(f => console.log(`  ✗ ${f.name}: ${f.error}`))
  }
  
  console.log('='.repeat(50) + '\n')
  
  process.exit(failed > 0 ? 1 : 0)
}

run().catch(err => {
  console.error('Erro fatal:', err)
  process.exit(1)
})
