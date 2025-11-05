import * as React from 'react'
import { api, type Work } from '@/lib/api'

export function useWorks() {
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

  return {
    works,
    loading,
    error,
    reload: loadWorks
  }
}
