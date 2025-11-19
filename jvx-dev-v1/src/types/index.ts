// Tipos compartilhados da aplicação

// Tipos para Recharts Tooltips
export interface TooltipProps<T = Record<string, unknown>> {
  active?: boolean
  payload?: Array<{ payload: T }>
}

export interface User {
  id: number
  username: string
  role: 'master' | 'standard'
  developerName?: string
  developer_name?: string
  active?: boolean
  created_at?: string
}

export interface Work {
  id?: number
  developer: string
  deadline_type: string
  value: number | string
  domain: string
  site_type: string
  template?: string
  delivery_date: number | string
  delivery_month: string
  delivery_year: number
  status: string
  developer_status: 'Em Andamento' | 'Concluído'
  payment_status: string
  observations?: string
  completed_at?: string | null
  completed_by?: string | null
  created_at?: string
  updated_at?: string
}

export interface Developer {
  id?: number
  name: string
  phone?: string
  email?: string
  whatsapp?: string
  pixKey?: string
  pixType?: string
  bankName?: string
  agency?: string
  account?: string
  observations?: string
}

export interface AuthContextType {
  user: User | null
  token: string | null
  loading: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => void
  isMaster: boolean
}

export interface WorksContextType {
  works: Work[]
  loading: boolean
  error: Error | null
  reload: () => void
}
