import type { Work, User, Developer } from '@/types'

// Re-exportar tipos para compatibilidade
export type { Work, User, Developer }

import { API_URL } from '@/lib/api-url'

// Helper para obter headers de autenticação
const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem('jvx_token')
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  }
}

// Fetch wrapper com tratamento automático de sessão expirada/invalidada
async function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...(options.headers as Record<string, string> || {}),
    }
  })

  if (response.status === 401) {
    localStorage.removeItem('jvx_token')
    localStorage.removeItem('jvx_user')
    window.dispatchEvent(new CustomEvent('auth:session-expired'))
    throw new Error('Sessão expirada. Faça login novamente.')
  }

  return response
}

export interface APIUser {
  id: number
  username: string
  role: 'master' | 'standard'
  developer_name?: string
  active: boolean
  created_at: string
}

export const api = {
  async getWorks(): Promise<Work[]> {
    const response = await apiFetch('/works')
    if (!response.ok) throw new Error('Erro ao carregar trabalhos')
    const data = await response.json()
    return data.map((w: Record<string, unknown>) => {
      // Converter data do formato YYYY-MM-DD para timestamp
      // Adicionar timezone offset para evitar problemas de fuso horário
      let deliveryTimestamp = new Date().getTime()
      if (w.delivery_date && typeof w.delivery_date === 'string') {
        const dateStr = w.delivery_date.split('T')[0] // Pegar apenas a parte da data
        const [year, month, day] = dateStr.split('-')
        // Criar data no horário local (meio-dia para evitar problemas de timezone)
        deliveryTimestamp = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), 12, 0, 0).getTime()
      }
      
      return {
        ...w,
        delivery_date: deliveryTimestamp,
        value: typeof w.value === 'number' ? w.value : (w.value || '0')
      }
    })
  },

  async createWork(work: Omit<Work, 'id'>): Promise<Work> {
    // Converter delivery_date para formato YYYY-MM-DD que o backend/MySQL espera
    let deliveryDateStr: string
    if (typeof work.delivery_date === 'number') {
      const d = new Date(work.delivery_date)
      deliveryDateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    } else if (typeof work.delivery_date === 'string' && work.delivery_date.includes('T')) {
      deliveryDateStr = work.delivery_date.split('T')[0]
    } else {
      deliveryDateStr = String(work.delivery_date)
    }

    const response = await apiFetch('/works', {
      method: 'POST',
      body: JSON.stringify({
        ...work,
        delivery_date: deliveryDateStr,
        value: typeof work.value === 'string' ? parseFloat(work.value) || 0 : work.value,
        developer_status: work.developer_status || 'Em Andamento',
        observations: work.observations || null,
        template: work.template || null
      })
    })
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Erro ao criar trabalho' }))
      throw new Error(error.error || 'Erro ao criar trabalho')
    }
    return response.json()
  },

  async updateWork(id: number, work: Omit<Work, 'id'>): Promise<Work> {
    // Converter delivery_date para formato YYYY-MM-DD que o backend/MySQL espera
    let deliveryDateStr: string
    if (typeof work.delivery_date === 'number') {
      const d = new Date(work.delivery_date)
      deliveryDateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    } else if (typeof work.delivery_date === 'string' && work.delivery_date.includes('T')) {
      deliveryDateStr = work.delivery_date.split('T')[0]
    } else {
      deliveryDateStr = String(work.delivery_date)
    }

    const response = await apiFetch(`/works/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        ...work,
        delivery_date: deliveryDateStr,
        value: typeof work.value === 'string' ? parseFloat(String(work.value)) || 0 : work.value,
        observations: work.observations || null,
        template: work.template || null
      })
    })
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Erro ao atualizar trabalho' }))
      throw new Error(error.error || 'Erro ao atualizar trabalho')
    }
    const data = await response.json()
    // O backend retorna { success, message, updatedWork } - extrair o work atualizado
    return data.updatedWork || data
  },

  async updateDeveloperStatus(id: number, status: 'Em Andamento' | 'Concluído'): Promise<{ success: boolean; developer_status: string; completed_at: string | null; completed_by: string | null }> {
    const response = await apiFetch(`/works/${id}/mark-completed`, {
      method: 'PATCH',
      body: JSON.stringify({ developer_status: status })
    })
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Erro ao atualizar status' }))
      throw new Error(error.error || 'Erro ao atualizar status')
    }
    return response.json()
  },

  async deleteWork(id: number): Promise<void> {
    const response = await apiFetch(`/works/${id}`, {
      method: 'DELETE'
    })
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Erro ao deletar trabalho' }))
      throw new Error(error.error || 'Erro ao deletar trabalho')
    }
  },

  async markAsPaid(id: number): Promise<void> {
    const response = await apiFetch(`/works/${id}/mark-paid`, {
      method: 'PATCH'
    })
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Erro ao marcar como pago' }))
      throw new Error(error.error || 'Erro ao marcar como pago')
    }
  },

  // Rotas de usuários
  async getUsers(): Promise<User[]> {
    const response = await apiFetch('/users')
    if (!response.ok) throw new Error('Erro ao carregar usuários')
    return response.json()
  },

  async createUser(userData: { username: string; password: string; role: string; developerName?: string }): Promise<void> {
    const response = await apiFetch('/users', {
      method: 'POST',
      body: JSON.stringify(userData)
    })
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Erro ao criar usuário')
    }
  },

  async updateUser(id: number, userData: Partial<User & { password?: string }>): Promise<void> {
    const response = await apiFetch(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData)
    })
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Erro ao atualizar usuário')
    }
  },

  async deleteUser(id: number): Promise<void> {
    const response = await apiFetch(`/users/${id}`, {
      method: 'DELETE'
    })
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Erro ao deletar usuário')
    }
  },

  // Importar CSV
  async importCSV(file: File): Promise<{ success: boolean; imported: number; errors: string[] }> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      
      reader.onload = async (e) => {
        try {
          const text = e.target?.result as string
          const lines = text.split('\n').filter(line => line.trim())
          
          if (lines.length < 2) {
            throw new Error('Arquivo CSV vazio ou inválido')
          }

          // Pular o cabeçalho
          const dataLines = lines.slice(1)

          // Parse CSV com suporte a campos entre aspas
          const csvData = dataLines.map((line) => {
            // Regex para split CSV respeitando aspas
            const regex = /,(?=(?:(?:[^"]*"){2})*[^"]*$)/
            const values = line.split(regex).map(v => v.trim().replace(/^"|"$/g, ''))
            
            // Campos do CSV:
            // 0: Desenvolvedor
            // 1: Prazo
            // 2: Valor R$
            // 3: Domínio Desenvolvimento
            // 4: Tipo de Site
            // 5: Data Entrega (DD/MM/YYYY)
            // 6: Mês
            // 7: Ano
            // 8: Status
            // 9: Pagamento
            // 10: OBS ou Template
            // 11: Status Desenvolvedor (opcional)
            // 12: Template URL (opcional)
            
            return {
              developer: values[0] || 'Interno',
              deadline_type: values[1] || 'Normal',
              value: values[2] || 'R$ 0,00',
              domain: values[3] || '',
              site_type: values[4] || 'Site Institucional',
              delivery_date: values[5] || '',
              delivery_month: values[6] || '',
              delivery_year: parseInt(values[7]) || new Date().getFullYear(),
              status: values[8] || 'Não Entregue',
              payment_status: values[9] || 'Não Pago',
              observations: values[10] || '',
              developer_status: values[11] || 'Em Andamento',
              template: values[12] || ''
            }
          })

          const response = await apiFetch('/import/csv', {
            method: 'POST',
            body: JSON.stringify({ csvData })
          })

          if (!response.ok) {
            const error = await response.json()
            throw new Error(error.error || 'Erro ao importar CSV')
          }

          const result = await response.json()
          resolve(result)
        } catch (error) {
          reject(error instanceof Error ? error : new Error('Erro desconhecido'))
        }
      }

      reader.onerror = () => reject(new Error('Erro ao ler arquivo'))
      reader.readAsText(file, 'UTF-8')
    })
  },

  // Limpar banco de dados
  async clearDatabase(password: string): Promise<void> {
    const response = await apiFetch('/database/clear', {
      method: 'POST',
      body: JSON.stringify({ password })
    })
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Erro ao limpar banco de dados')
    }
  }
}
