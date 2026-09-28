import * as React from 'react'
import type { User, AuthContextType } from '@/types'
import { API_URL } from '@/lib/api-url'

const AuthContext = React.createContext<AuthContextType | undefined>(undefined)

// Chaves usadas por versões anteriores (token em localStorage) — removidas na carga
const LEGACY_STORAGE_KEYS = ['jvx_token', 'jvx_user']

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null)
  const [loading, setLoading] = React.useState(true)

  // Restaurar sessão: o JWT fica em cookie HttpOnly, então quem confirma a sessão é o backend
  React.useEffect(() => {
    LEGACY_STORAGE_KEYS.forEach(key => localStorage.removeItem(key))

    fetch(`${API_URL}/auth/verify`, { credentials: 'include' })
      .then(async res => {
        if (res.ok) {
          const data = await res.json()
          setUser(data.user)
        }
      })
      .catch(() => {
        // Servidor offline: permanece deslogado
      })
      .finally(() => setLoading(false))
  }, [])

  const login = React.useCallback(async (username: string, password: string) => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Erro ao fazer login')
    }

    const data = await response.json()
    setUser(data.user)

    // Recarregar a página para limpar cache de dados
    window.location.href = '/'
  }, [])

  // Limpar sessão local (sem chamar o servidor)
  const clearSession = React.useCallback(() => {
    setUser(null)
    if (window.location.pathname !== '/login') {
      window.location.href = '/login'
    }
  }, [])

  const logout = React.useCallback(() => {
    // O servidor invalida a sessão e remove o cookie HttpOnly
    fetch(`${API_URL}/auth/logout`, {
      method: 'POST',
      credentials: 'include'
    })
      .catch(() => {})
      .finally(clearSession)
  }, [clearSession])

  // Listener para sessão expirada/substituída por outro dispositivo
  React.useEffect(() => {
    const handleSessionExpired = () => clearSession()
    window.addEventListener('auth:session-expired', handleSessionExpired)
    return () => window.removeEventListener('auth:session-expired', handleSessionExpired)
  }, [clearSession])

  const value = React.useMemo(
    () => ({
      user,
      loading,
      login,
      logout,
      isMaster: user?.role === 'master'
    }),
    [user, loading, login, logout]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = React.useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
