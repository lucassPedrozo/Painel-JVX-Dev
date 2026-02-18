import { describe, it, expect } from 'vitest'
import { parseValue, formatCurrency, formatDate, normalizeUrl, isValidUrl, cn } from '../lib/utils'

// ============================================
// parseValue
// ============================================
describe('parseValue', () => {
  it('retorna 0 para valores vazios/inválidos', () => {
    expect(parseValue('')).toBe(0)
    expect(parseValue('abc')).toBe(0)
    expect(parseValue(undefined as unknown as string)).toBe(0)
    expect(parseValue(null as unknown as string)).toBe(0)
  })

  it('converte número direto', () => {
    expect(parseValue(150)).toBe(150)
    expect(parseValue(0)).toBe(0)
    expect(parseValue(99.99)).toBe(99.99)
  })

  it('converte string numérica simples', () => {
    expect(parseValue('100')).toBe(100)
    expect(parseValue('99.99')).toBe(99.99)
    expect(parseValue('0')).toBe(0)
  })

  it('converte formato brasileiro (vírgula como decimal)', () => {
    expect(parseValue('100,50')).toBe(100.50)
    expect(parseValue('1234,99')).toBe(1234.99)
  })

  it('converte formato brasileiro com milhar (ponto + vírgula)', () => {
    expect(parseValue('1.234,56')).toBe(1234.56)
    expect(parseValue('10.000,00')).toBe(10000)
  })

  it('converte formato com R$', () => {
    expect(parseValue('R$ 100,00')).toBe(100)
    expect(parseValue('R$ 1.234,56')).toBe(1234.56)
    expect(parseValue('R$500')).toBe(500)
  })

  it('converte formato americano (ponto como decimal)', () => {
    expect(parseValue('1234.56')).toBe(1234.56)
  })
})

// ============================================
// formatCurrency
// ============================================
describe('formatCurrency', () => {
  it('formata valores em BRL', () => {
    const result = formatCurrency(1234.56)
    expect(result).toContain('1.234,56')
    expect(result).toContain('R$')
  })

  it('formata zero', () => {
    const result = formatCurrency(0)
    expect(result).toContain('0,00')
  })

  it('formata valor negativo', () => {
    const result = formatCurrency(-500)
    expect(result).toContain('500,00')
  })
})

// ============================================
// formatDate
// ============================================
describe('formatDate', () => {
  it('retorna "-" para valor falsy', () => {
    expect(formatDate('')).toBe('-')
    expect(formatDate(0)).toBe('-')
    expect(formatDate(null as unknown as string)).toBe('-')
    expect(formatDate(undefined as unknown as string)).toBe('-')
  })

  it('formata timestamp numérico', () => {
    // 15 de março de 2024, meio-dia (horário local)
    const date = new Date(2024, 2, 15, 12, 0, 0) // mês é 0-indexed
    const result = formatDate(date.getTime())
    expect(result).toBe('15/03/2024')
  })

  it('formata string YYYY-MM-DD', () => {
    expect(formatDate('2024-03-15')).toBe('15/03/2024')
  })

  it('formata string ISO com T', () => {
    expect(formatDate('2024-03-15T12:00:00.000Z')).toBe('15/03/2024')
  })

  it('formata objeto Date', () => {
    const date = new Date(2024, 2, 15, 12, 0, 0)
    const result = formatDate(date)
    expect(result).toBe('15/03/2024')
  })
})

// ============================================
// normalizeUrl
// ============================================
describe('normalizeUrl', () => {
  it('retorna vazio para input vazio', () => {
    expect(normalizeUrl('')).toBe('')
    expect(normalizeUrl(undefined as unknown as string)).toBe('')
  })

  it('adiciona https:// se não tem protocolo', () => {
    expect(normalizeUrl('example.com')).toBe('https://example.com')
    expect(normalizeUrl('www.example.com')).toBe('https://www.example.com')
  })

  it('converte http para https', () => {
    expect(normalizeUrl('http://example.com')).toBe('https://example.com')
  })

  it('mantém https', () => {
    expect(normalizeUrl('https://example.com')).toBe('https://example.com')
  })

  it('remove espaços', () => {
    expect(normalizeUrl('  example.com  ')).toBe('https://example.com')
  })
})

// ============================================
// isValidUrl
// ============================================
describe('isValidUrl', () => {
  it('retorna false para vazio', () => {
    expect(isValidUrl('')).toBe(false)
  })

  it('valida URLs válidas', () => {
    expect(isValidUrl('https://example.com')).toBe(true)
    expect(isValidUrl('example.com')).toBe(true)
    expect(isValidUrl('http://localhost:3000')).toBe(true)
  })

  it('retorna false para URLs inválidas', () => {
    expect(isValidUrl('não é url')).toBe(false)
  })
})

// ============================================
// cn (classnames merge)
// ============================================
describe('cn', () => {
  it('mescla classes simples', () => {
    expect(cn('px-2', 'py-1')).toBe('px-2 py-1')
  })

  it('resolve conflitos Tailwind', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4')
  })

  it('ignora valores falsy', () => {
    expect(cn('px-2', false && 'py-1', undefined, null)).toBe('px-2')
  })

  it('suporta condicionais', () => {
    const isActive = true
    expect(cn('base', isActive && 'active')).toBe('base active')
  })
})
