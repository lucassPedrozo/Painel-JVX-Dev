// @vitest-environment node
import { describe, it, expect } from 'vitest'
import { isBlockedIp, validateMonitorUrl, safeLookup } from '../../server/ssrf-guard.js'

describe('isBlockedIp', () => {
  it.each([
    '127.0.0.1', '10.1.2.3', '172.16.0.1', '192.168.0.10', '169.254.169.254',
    '100.64.0.1', '0.0.0.0', '224.0.0.1', '::1', '::', 'fe80::1', 'fd00::1',
    '::ffff:127.0.0.1', '::ffff:a00:1',
  ])('bloqueia %s', (ip) => {
    expect(isBlockedIp(ip)).toBe(true)
  })

  it.each(['8.8.8.8', '1.1.1.1', '2606:4700:4700::1111', '::ffff:808:808'])('permite %s', (ip) => {
    expect(isBlockedIp(ip)).toBe(false)
  })

  it('trata valor que não é IP como bloqueado', () => {
    expect(isBlockedIp('nao-e-ip')).toBe(true)
  })
})

describe('validateMonitorUrl', () => {
  it.each([
    'https://example.com',
    'http://example.com.br/pagina?x=1',
    'https://example.com:8443/',
    'http://8.8.8.8',
  ])('aceita %s', (url) => {
    expect(() => validateMonitorUrl(url)).not.toThrow()
  })

  it.each([
    ['http://localhost', /rede interna/],
    ['http://localhost:3001', /Porta/],
    ['http://127.0.0.1', /rede interna/],
    ['http://2130706433', /rede interna/],          // 127.0.0.1 em decimal
    ['http://0x7f000001', /rede interna/],          // 127.0.0.1 em hexadecimal
    ['http://169.254.169.254/latest/meta-data', /rede interna/],
    ['http://[::1]', /rede interna/],
    ['http://[::ffff:10.0.0.1]', /rede interna/],
    ['http://intranet', /rede interna/],
    ['http://servidor.local', /rede interna/],
    ['http://api.internal', /rede interna/],
    ['https://example.com:3306', /Porta/],
    ['https://user:senha@example.com', /credenciais/],
    ['file:///etc/passwd', /http ou https/],
    ['gopher://example.com', /http ou https/],
    ['nao é url', /inválida/],
    ['', /inválida/],
  ])('rejeita %s', (url, message) => {
    expect(() => validateMonitorUrl(url)).toThrow(message)
  })

  it('rejeita valores que não são string', () => {
    expect(() => validateMonitorUrl(123)).toThrow(/inválida/)
    expect(() => validateMonitorUrl(null)).toThrow(/inválida/)
  })
})

describe('safeLookup', () => {
  const lookup = (host: string) =>
    new Promise<{ err: NodeJS.ErrnoException | null; address?: string }>((resolve) => {
      safeLookup(host, {}, (err, address) => resolve({ err, address: address as string }))
    })

  it('bloqueia hostnames que resolvem para endereço interno', async () => {
    const { err } = await lookup('localhost')
    expect(err?.code).toBe('EBLOCKEDDEST')
  })
})
