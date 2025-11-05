import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function parseValue(v: string | number): number {
  if (typeof v === 'number') return v
  
  const s = String(v || '').trim()
  
  // Se já é um número válido como string
  if (/^\d+(\.\d+)?$/.test(s)) {
    return parseFloat(s)
  }
  
  // Remove espaços e símbolos de moeda
  let cleaned = s.replace(/\s/g, '').replace(/R\$/g, '')
  
  // Detecta se usa vírgula como decimal (formato BR)
  const hasComma = cleaned.includes(',')
  const hasDot = cleaned.includes('.')
  
  if (hasComma && hasDot) {
    // Formato: 1.234,56 (BR) -> remove pontos de milhar, troca vírgula por ponto
    cleaned = cleaned.replace(/\./g, '').replace(',', '.')
  } else if (hasComma) {
    // Formato: 1234,56 (BR) -> troca vírgula por ponto
    cleaned = cleaned.replace(',', '.')
  }
  // Se só tem ponto, assume formato US (1234.56)
  
  // Remove caracteres não numéricos exceto ponto decimal
  cleaned = cleaned.replace(/[^0-9.]/g, '')
  
  const n = parseFloat(cleaned)
  return Number.isFinite(n) ? n : 0
}

export function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', { 
    style: 'currency', 
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

export function formatDate(date: number | string | Date): string {
  if (!date) return '-'
  
  // Se for timestamp (número)
  if (typeof date === 'number') {
    const d = new Date(date)
    const day = String(d.getDate()).padStart(2, '0')
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const year = d.getFullYear()
    return `${day}/${month}/${year}`
  }
  
  // Se for string no formato YYYY-MM-DD
  if (typeof date === 'string' && date.includes('-')) {
    const [year, month, day] = date.split('T')[0].split('-')
    return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`
  }
  
  // Caso padrão
  const d = new Date(date)
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()
  return `${day}/${month}/${year}`
}

export function normalizeUrl(url: string): string {
  if (!url) return ''
  
  // Remove espaços
  let normalized = url.trim()
  
  // Se não tem protocolo, adiciona https://
  if (!normalized.match(/^https?:\/\//i)) {
    normalized = 'https://' + normalized
  }
  
  // Converte http para https
  normalized = normalized.replace(/^http:\/\//i, 'https://')
  
  return normalized
}

export function isValidUrl(url: string): boolean {
  if (!url) return false
  
  try {
    const normalized = normalizeUrl(url)
    new URL(normalized)
    return true
  } catch {
    return false
  }
}
