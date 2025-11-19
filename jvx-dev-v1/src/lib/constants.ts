/**
 * Constantes da aplicação
 * Centralizadas para facilitar manutenção e consistência
 */

// ============================================
// TIPOS DE SITE
// ============================================
export const SITE_TYPES = [
  "Site Institucional",
  "Site Corporativo",
  "Landing Page",
  "E-commerce",
  "Blog",
  "Portfólio"
] as const

export type SiteType = typeof SITE_TYPES[number]

// ============================================
// TIPOS DE PRAZO
// ============================================
export const DEADLINE_TYPES = [
  "Normal",
  "Prazo Reduzido"
] as const

export type DeadlineType = typeof DEADLINE_TYPES[number]

// ============================================
// STATUS DE ENTREGA
// ============================================
export const DELIVERY_STATUS = [
  "Entregue",
  "Não Entregue"
] as const

export type DeliveryStatus = typeof DELIVERY_STATUS[number]

// ============================================
// STATUS DE PAGAMENTO
// ============================================
export const PAYMENT_STATUS = [
  "Pago",
  "Não Pago",
  "Pendente"
] as const

export type PaymentStatus = typeof PAYMENT_STATUS[number]

// ============================================
// STATUS DO DESENVOLVEDOR
// ============================================
export const DEVELOPER_STATUS = [
  "Em Andamento",
  "Concluído"
] as const

export type DeveloperStatusType = typeof DEVELOPER_STATUS[number]

// ============================================
// TIPOS DE PIX
// ============================================
export const PIX_TYPES = [
  "CPF",
  "CNPJ",
  "E-mail",
  "Telefone",
  "Chave Aleatória"
] as const

export type PixType = typeof PIX_TYPES[number]

// ============================================
// ROLES DE USUÁRIO
// ============================================
export const USER_ROLES = {
  MASTER: 'master',
  STANDARD: 'standard'
} as const

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES]

// ============================================
// MESES DO ANO
// ============================================
export const MONTHS = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
] as const

export type Month = typeof MONTHS[number]

// Mapeamento de mês para número
export const MONTH_MAP: Record<string, number> = {
  "Janeiro": 1, "Fevereiro": 2, "Março": 3, "Abril": 4,
  "Maio": 5, "Junho": 6, "Julho": 7, "Agosto": 8,
  "Setembro": 9, "Outubro": 10, "Novembro": 11, "Dezembro": 12
}

// ============================================
// VALORES PADRÃO
// ============================================
export const DEFAULT_VALUES = {
  developer: "Interno",
  deadline_type: "Normal" as DeadlineType,
  site_type: "Site Institucional" as SiteType,
  status: "Não Entregue" as DeliveryStatus,
  payment_status: "Não Pago" as PaymentStatus,
  developer_status: "Em Andamento" as DeveloperStatusType,
  value: 0
} as const

// ============================================
// CONFIGURAÇÕES DE API
// ============================================
export const API_CONFIG = {
  get BASE_URL() {
    return (import.meta as { env?: { VITE_API_URL?: string } }).env?.VITE_API_URL || 'http://localhost:3001'
  },
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3
} as const

// ============================================
// CONFIGURAÇÕES DE PAGINAÇÃO
// ============================================
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 50,
  MAX_PAGE_SIZE: 100
} as const
