// Tipos de site baseados no CSV
export const SITE_TYPES = [
  "Site Institucional",
  "Site Corporativo",
  "Landing Page"
] as const

// Tipos de prazo
export const DEADLINE_TYPES = [
  "Normal",
  "Prazo Reduzido"
] as const

// Status de entrega
export const DELIVERY_STATUS = [
  "Entregue",
  "Não Entregue"
] as const

// Status de pagamento
export const PAYMENT_STATUS = [
  "Pago",
  "Não Pago"
] as const

export type SiteType = typeof SITE_TYPES[number]
export type DeadlineType = typeof DEADLINE_TYPES[number]
export type DeliveryStatus = typeof DELIVERY_STATUS[number]
export type PaymentStatus = typeof PAYMENT_STATUS[number]

// Meses do ano
export const MONTHS = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
] as const

// Mapeamento de mês para número
export const MONTH_MAP: Record<string, number> = {
  "Janeiro": 1, "Fevereiro": 2, "Março": 3, "Abril": 4,
  "Maio": 5, "Junho": 6, "Julho": 7, "Agosto": 8,
  "Setembro": 9, "Outubro": 10, "Novembro": 11, "Dezembro": 12
}

// Valores padrão
export const DEFAULT_VALUES = {
  developer: "Interno",
  deadline_type: "Normal" as DeadlineType,
  site_type: "Site Institucional" as SiteType,
  status: "Não Entregue" as DeliveryStatus,
  payment_status: "Não Pago" as PaymentStatus,
  value: 0
} as const
