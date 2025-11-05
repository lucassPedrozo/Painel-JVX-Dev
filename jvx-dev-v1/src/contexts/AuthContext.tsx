import * as React from 'react'

interface User {
  id: number
  username: string
  role: 'master' | 'standard'
  developerName?: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  loading: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => void
  isMaster: boolean
}

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
        setToken(storedToken)
        setUser(parsedUser)
      } catch (error) {
        console.error('Erro ao recuperar sessão:', error)
        localStorage.removeItem('jvx_token')
        localStorage.removeItem('jvx_user')
      }
    }
    setLoading(false)
  }, [])

  const login = React.useCallback(async (username: string, password: string) => {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'
    
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

  const logout = React.useCallback(() => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('jvx_token')
    localStorage.removeItem('jvx_user')
    // Recarregar a página para limpar cache de dados
    window.location.href = '/login'
  }, [])

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
