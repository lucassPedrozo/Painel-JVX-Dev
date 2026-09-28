import * as React from 'react'
import { api } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import type { Work, WorksContextType } from '@/types'

const WorksContext = React.createContext<WorksContextType | undefined>(undefined)

export function WorksProvider({ children }: { children: React.ReactNode }) {
  const [works, setWorks] = React.useState<Work[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<Error | null>(null)
  const loadingRef = React.useRef(false)
  const { user, loading: authLoading } = useAuth()

  const loadWorks = React.useCallback(() => {
    // Prevenir reloads simultâneos
    if (loadingRef.current) return
    loadingRef.current = true
    setLoading(true)
    setError(null)
    api.getWorks()
      .then(data => {
        setWorks(data)
        setLoading(false)
        loadingRef.current = false
      })
      .catch(err => {
        console.error("Erro ao carregar trabalhos:", err)
        setError(err)
        setLoading(false)
        loadingRef.current = false
      })
  }, [])

  React.useEffect(() => {
    // Só buscar dados depois que a sessão (cookie) for confirmada pelo backend
    if (authLoading) return
    if (user) {
      loadWorks()
    } else {
      setLoading(false)
    }
  }, [authLoading, user, loadWorks])

  const value = React.useMemo(
    () => ({ works, loading, error, reload: loadWorks }),
    [works, loading, error, loadWorks]
  )

  return <WorksContext.Provider value={value}>{children}</WorksContext.Provider>
}

export function useWorks() {
  const context = React.useContext(WorksContext)
  if (context === undefined) {
    throw new Error('useWorks must be used within a WorksProvider')
  }
  return context
}
