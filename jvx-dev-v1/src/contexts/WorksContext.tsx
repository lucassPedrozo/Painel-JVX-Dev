import * as React from 'react'
import { api, type Work } from '@/lib/api'

interface WorksContextType {
  works: Work[]
  loading: boolean
  error: Error | null
  reload: () => void
}

const WorksContext = React.createContext<WorksContextType | undefined>(undefined)

export function WorksProvider({ children }: { children: React.ReactNode }) {
  const [works, setWorks] = React.useState<Work[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<Error | null>(null)

  const loadWorks = React.useCallback(() => {
    setLoading(true)
    setError(null)
    api.getWorks()
      .then(data => {
        setWorks(data)
        setLoading(false)
      })
      .catch(err => {
        console.error("Erro ao carregar trabalhos:", err)
        setError(err)
        setLoading(false)
      })
  }, [])

  React.useEffect(() => {
    loadWorks()
  }, [loadWorks])

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
