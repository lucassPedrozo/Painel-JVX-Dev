import * as React from 'react'
import { CheckCircle, Clock, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { api, type Work } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'

interface DeveloperStatusButtonProps {
  work: Work
  onUpdate?: () => void
}

export function DeveloperStatusButton({ work, onUpdate }: DeveloperStatusButtonProps) {
  const { user } = useAuth()
  const [loading, setLoading] = React.useState(false)

  // Só mostrar para desenvolvedores padrão em seus próprios projetos
  if (!user || user.role !== 'standard' || work.developer !== user.developerName) {
    return null
  }

  const handleToggleStatus = async () => {
    setLoading(true)
    try {
      const newStatus = work.developer_status === 'Concluído' ? 'Em Andamento' : 'Concluído'
      await api.updateDeveloperStatus(work.id!, newStatus)
      
      toast.success(
        newStatus === 'Concluído' 
          ? 'Projeto marcado como concluído!' 
          : 'Projeto marcado como em andamento!'
      )
      
      onUpdate?.()
    } catch (error: any) {
      toast.error(error.message || 'Erro ao atualizar status')
    } finally {
      setLoading(false)
    }
  }

  const isCompleted = work.developer_status === 'Concluído'

  return (
    <Button
      variant={isCompleted ? "default" : "outline"}
      size="sm"
      onClick={handleToggleStatus}
      disabled={loading}
      className={`gap-2 ${
        isCompleted 
          ? 'bg-green-600 hover:bg-green-700 text-white' 
          : 'border-orange-300 text-orange-600 hover:bg-orange-50'
      }`}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : isCompleted ? (
        <CheckCircle className="h-4 w-4" />
      ) : (
        <Clock className="h-4 w-4" />
      )}
      {loading ? 'Atualizando...' : isCompleted ? 'Concluído' : 'Em Andamento'}
    </Button>
  )
}