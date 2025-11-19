import * as React from 'react'
import { CheckCircle, Clock, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
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
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao atualizar status'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  const isCompleted = work.developer_status === 'Concluído'
  
  // Formatar data de conclusão
  const getCompletedDate = () => {
    if (!work.completed_at) return null
    const date = new Date(work.completed_at)
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const completedDate = getCompletedDate()

  const button = (
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

  // Se estiver concluído e tiver data, mostrar tooltip
  if (isCompleted && completedDate) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {button}
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-xs">Concluído em: {completedDate}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return button
}