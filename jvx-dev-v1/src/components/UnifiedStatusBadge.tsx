import * as React from 'react'
import { CheckCircle, Clock, Loader2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { api, type Work } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'

interface UnifiedStatusBadgeProps {
  work: Work
  onUpdate?: () => void
}

export function UnifiedStatusBadge({ work, onUpdate }: UnifiedStatusBadgeProps) {
  const { user } = useAuth()
  const [loading, setLoading] = React.useState(false)

  // Se o projeto está pago, considerar como concluído
  const isPaid = work.payment_status === 'Pago'
  const isCompleted = isPaid || work.developer_status === 'Concluído'
  const isDeveloper = user?.role === 'standard' && work.developer === user.developerName

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

  const handleToggleStatus = async () => {
    if (!isDeveloper) return
    
    setLoading(true)
    try {
      const newStatus = isCompleted ? 'Em Andamento' : 'Concluído'
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

  // Badge visual (igual para todos)
  const badge = (
    <Badge 
      variant={isCompleted ? "default" : "secondary"}
      className={`font-medium text-xs inline-flex items-center gap-1 ${
        isCompleted 
          ? 'bg-green-600 hover:bg-green-700' 
          : 'border-orange-300 text-orange-600 bg-orange-50 dark:bg-orange-950'
      } ${isDeveloper ? 'cursor-pointer' : 'cursor-default'}`}
      onClick={isDeveloper ? handleToggleStatus : undefined}
    >
      {loading ? (
        <Loader2 className="h-3 w-3 animate-spin" />
      ) : isCompleted ? (
        <CheckCircle className="h-3 w-3" />
      ) : (
        <Clock className="h-3 w-3" />
      )}
      {loading ? 'Atualizando...' : isCompleted ? 'Concluído' : 'Em Andamento'}
    </Badge>
  )

  // Se estiver concluído e tiver data, mostrar tooltip
  if (isCompleted && completedDate) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="w-fit">
              {badge}
            </div>
          </TooltipTrigger>
          <TooltipContent side="left" className="bg-foreground text-background">
            <p className="text-xs font-medium">Concluído em:</p>
            <p className="text-xs">{completedDate}</p>
            {isDeveloper && (
              <p className="text-xs text-muted-foreground mt-1">Clique para alterar</p>
            )}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  // Se for desenvolvedor e não tiver data, mostrar tooltip com instrução
  if (isDeveloper) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="w-fit">
              {badge}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-xs">Clique para marcar como {isCompleted ? 'em andamento' : 'concluído'}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return badge
}
