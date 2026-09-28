import { describe, it, expect } from 'vitest'
import { SITE_TYPES, DEADLINE_TYPES, DELIVERY_STATUS, PAYMENT_STATUS, DEVELOPER_STATUS, PIX_TYPES, MONTHS, MONTH_MAP, USER_ROLES } from '../lib/constants'

describe('Constants', () => {
  describe('SITE_TYPES', () => {
    it('contém os tipos de site esperados', () => {
      expect(SITE_TYPES).toContain('Site Institucional')
      expect(SITE_TYPES).toContain('E-commerce')
      expect(SITE_TYPES).toContain('Landing Page')
      expect(SITE_TYPES.length).toBeGreaterThan(0)
    })

    it('não tem duplicatas', () => {
      const unique = new Set(SITE_TYPES)
      expect(unique.size).toBe(SITE_TYPES.length)
    })
  })

  describe('DEADLINE_TYPES', () => {
    it('contém Normal e Prazo Reduzido', () => {
      expect(DEADLINE_TYPES).toContain('Normal')
      expect(DEADLINE_TYPES).toContain('Prazo Reduzido')
      expect(DEADLINE_TYPES.length).toBe(2)
    })
  })

  describe('DELIVERY_STATUS', () => {
    it('contém Entregue e Não Entregue', () => {
      expect(DELIVERY_STATUS).toContain('Entregue')
      expect(DELIVERY_STATUS).toContain('Não Entregue')
      expect(DELIVERY_STATUS.length).toBe(2)
    })
  })

  describe('PAYMENT_STATUS', () => {
    it('contém status de pagamento', () => {
      expect(PAYMENT_STATUS).toContain('Pago')
      expect(PAYMENT_STATUS).toContain('Não Pago')
      expect(PAYMENT_STATUS).toContain('Pendente')
    })
  })

  describe('DEVELOPER_STATUS', () => {
    it('contém Em Andamento e Concluído', () => {
      expect(DEVELOPER_STATUS).toContain('Em Andamento')
      expect(DEVELOPER_STATUS).toContain('Concluído')
      expect(DEVELOPER_STATUS.length).toBe(2)
    })
  })

  describe('PIX_TYPES', () => {
    it('contém tipos de PIX válidos', () => {
      expect(PIX_TYPES).toContain('CPF')
      expect(PIX_TYPES).toContain('CNPJ')
      expect(PIX_TYPES).toContain('E-mail')
      expect(PIX_TYPES).toContain('Telefone')
      expect(PIX_TYPES).toContain('Chave Aleatória')
    })
  })

  describe('USER_ROLES', () => {
    it('define master e standard', () => {
      expect(USER_ROLES.MASTER).toBe('master')
      expect(USER_ROLES.STANDARD).toBe('standard')
    })
  })

  describe('MONTHS', () => {
    it('contém 12 meses', () => {
      expect(MONTHS.length).toBe(12)
      expect(MONTHS[0]).toBe('Janeiro')
      expect(MONTHS[11]).toBe('Dezembro')
    })
  })

  describe('MONTH_MAP', () => {
    it('mapeia meses para números corretamente', () => {
      expect(MONTH_MAP['Janeiro']).toBe(1)
      expect(MONTH_MAP['Junho']).toBe(6)
      expect(MONTH_MAP['Dezembro']).toBe(12)
    })

    it('tem 12 entradas', () => {
      expect(Object.keys(MONTH_MAP).length).toBe(12)
    })
  })
})
