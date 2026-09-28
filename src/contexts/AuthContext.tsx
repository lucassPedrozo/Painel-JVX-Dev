import * as React from 'react'
import type { User, AuthContextType } from '@/types'
import { API_URL } from '@/lib/api-url'

const AuthContext = React.createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null)
  const [token, setToken] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(true)

  // Verificar token ao carregar
  React.useEffect(() => {
    const storedToken = localStorage.getItem('jvx_token')
    const storedUser = localStorage.getItem('jvx_user')

    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser)
        
        // Verificar se o token ainda é válido no backend
        fetch(`${API_URL}/auth/verify`, {
          headers: { 'Authorization': `Bearer ${storedToken}` }
        })
          .then(res => {
            if (res.ok) {
              setToken(storedToken)
              setUser(parsedUser)
            } else {
              // Token inválido/expirado — limpar sessão
              localStorage.removeItem('jvx_token')
              localStorage.removeItem('jvx_user')
            }
          })
          .catch(() => {
            // Se o servidor estiver offline, confiar no token armazenado
            setToken(storedToken)
            setUser(parsedUser)
          })
          .finally(() => setLoading(false))
        return
      } catch (error) {
        console.error('Erro ao recuperar sessão:', error)
        localStorage.removeItem('jvx_token')
        localStorage.removeItem('jvx_user')
      }
    }
    setLoading(false)
  }, [])

  const login = React.useCallback(async (username: string, password: string) => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Erro ao fazer login')
    }

    const data = await response.json()
    
    setToken(data.token)
    setUser(data.user)
    
    localStorage.setItem('jvx_token', data.token)
    localStorage.setItem('jvx_user', JSON.stringify(data.user))
    
    // Recarregar a página para limpar cache de dados
    window.location.href = '/'
  }, [])

  // Limpar sessão local (sem chamar o servidor)
  const clearSession = React.useCallback(() => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('jvx_token')
    localStorage.removeItem('jvx_user')
    window.location.href = '/login'
  }, [])

  const logout = React.useCallback(() => {
    // Notificar o servidor para invalidar a sessão (fire and forget)
    const currentToken = localStorage.getItem('jvx_token')
    if (currentToken) {
      fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${currentToken}` }
      }).catch(() => {})
    }
    clearSession()
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
      token,
      loading,
      login,
      logout,
      isMaster: user?.role === 'master'
    }),
    [user, token, loading, login, logout]
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
