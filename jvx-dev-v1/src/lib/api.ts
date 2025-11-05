const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

// Helper para obter token
const getAuthHeaders = () => {
  const token = localStorage.getItem('jvx_token')
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  }
}

export interface Work {
  id?: number
  developer: string
  deadline_type: string
  value: string | number
  domain: string
  site_type: string
  delivery_date: number | string
  delivery_month: string
  delivery_year: number
  status: string
  payment_status: string
  observations?: string
}

export interface User {
  id: number
  username: string
  role: 'master' | 'standard'
  developer_name?: string
  active: boolean
  created_at: string
}

export const api = {
  async getWorks(): Promise<Work[]> {
    const response = await fetch(`${API_URL}/works`, {
      headers: getAuthHeaders()
    })
    if (!response.ok) throw new Error('Erro ao carregar trabalhos')
    const data = await response.json()
    return data.map((w: any) => {
      // Converter data do formato YYYY-MM-DD para timestamp
      // Adicionar timezone offset para evitar problemas de fuso horário
      let deliveryTimestamp = new Date().getTime()
      if (w.delivery_date) {
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
    const response = await fetch(`${API_URL}/works`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        ...work,
        delivery_date: new Date(work.delivery_date).toISOString(),
        observations: work.observations || null
      })
    })
    if (!response.ok) throw new Error('Erro ao criar trabalho')
    return response.json()
  },

  async updateWork(id: number, work: Omit<Work, 'id'>): Promise<Work> {
    const response = await fetch(`${API_URL}/works/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        ...work,
        delivery_date: new Date(work.delivery_date).toISOString(),
        observations: work.observations || null
      })
    })
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Erro ao atualizar trabalho')
    }
    return response.json()
  },

  async deleteWork(id: number): Promise<void> {
    const response = await fetch(`${API_URL}/works/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    })
    if (!response.ok) throw new Error('Erro ao deletar trabalho')
  },

  async markAsPaid(id: number): Promise<void> {
    const response = await fetch(`${API_URL}/works/${id}/mark-paid`, {
      method: 'PATCH',
      headers: getAuthHeaders()
    })
    if (!response.ok) throw new Error('Erro ao marcar como pago')
  },

  // Rotas de usuários
  async getUsers(): Promise<User[]> {
    const response = await fetch(`${API_URL}/users`, {
      headers: getAuthHeaders()
    })
    if (!response.ok) throw new Error('Erro ao carregar usuários')
    return response.json()
  },

  async createUser(userData: { username: string; password: string; role: string; developerName?: string }): Promise<void> {
    const response = await fetch(`${API_URL}/users`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(userData)
    })
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Erro ao criar usuário')
    }
  },

  async updateUser(id: number, userData: Partial<User & { password?: string }>): Promise<void> {
    const response = await fetch(`${API_URL}/users/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(userData)
    })
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Erro ao atualizar usuário')
    }
  },

  async deleteUser(id: number): Promise<void> {
    const response = await fetch(`${API_URL}/users/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
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
          const csvData = dataLines.map((line, index) => {
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
              observations: values[10] || ''
            }
          })

          const response = await fetch(`${API_URL}/import/csv`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ csvData })
          })

          if (!response.ok) {
            const error = await response.json()
            throw new Error(error.error || 'Erro ao importar CSV')
          }

          const result = await response.json()
          resolve(result)
        } catch (error: any) {
          reject(error)
        }
      }

      reader.onerror = () => reject(new Error('Erro ao ler arquivo'))
      reader.readAsText(file, 'UTF-8')
    })
  },

  // Limpar banco de dados
  async clearDatabase(password: string): Promise<void> {
    const response = await fetch(`${API_URL}/database/clear`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ password })
    })
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Erro ao limpar banco de dados')
    }
  }
}
