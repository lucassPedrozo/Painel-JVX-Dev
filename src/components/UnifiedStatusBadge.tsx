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

interface UnifiedStatusBadgeProps {
  work: Work
  onUpdate?: () => void
}

export function UnifiedStatusBadge({ work, onUpdate }: UnifiedStatusBadgeProps) {
  const { user } = useAuth()
  const [loading, setLoading] = React.useState(false)

  // Usar APENAS developer_status para determinar se está concluído
  // payment_status NÃO deve afetar o toggle de status do desenvolvedor
  const isCompleted = work.developer_status === 'Concluído'
  
  // Verificar permissões: Master pode alterar qualquer projeto, Desenvolvedor apenas os seus
  const isMaster = user?.role === 'master'
  const isDeveloper = user?.role === 'standard' && work.developer === (user.developerName || user.developer_name)
  const canEdit = isMaster || isDeveloper

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

  // Formatar quem completou
  const getCompletedBy = () => {
    if (!work.completed_by) return null
    return work.completed_by
  }

  const completedDate = getCompletedDate()
  const completedBy = getCompletedBy()

  const handleToggleStatus = async () => {
    if (!canEdit || loading) return
    
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
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao atualizar status'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  // Botão redesenhado seguindo o padrão do sistema
  const statusButton = (
    <Button
      variant={isCompleted ? "default" : "outline"}
      size="sm"
      className={`h-7 px-3 text-xs font-medium transition-all ${
        isCompleted 
          ? 'bg-green-600 hover:bg-green-700 text-white border-green-600' 
          : 'border-orange-300 text-orange-600 hover:bg-orange-50'
      } ${canEdit ? 'cursor-pointer' : 'cursor-default opacity-80'}`}
      onClick={canEdit ? handleToggleStatus : undefined}
      disabled={loading || !canEdit}
    >
      {loading ? (
        <>
          <Loader2 className="h-3 w-3 mr-1.5 animate-spin" />
          Atualizando...
        </>
      ) : isCompleted ? (
        <>
          <CheckCircle className="h-3 w-3 mr-1.5" />
          Concluído
        </>
      ) : (
        <>
          <Clock className="h-3 w-3 mr-1.5" />
          Em Andamento
        </>
      )}
    </Button>
  )

  // Se estiver concluído e tiver data, mostrar tooltip com informações
  if (isCompleted && (completedDate || completedBy)) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="w-fit">
              {statusButton}
            </div>
          </TooltipTrigger>
          <TooltipContent side="left" className="max-w-xs">
            <div className="space-y-1">
              {completedDate && (
                <>
                  <p className="text-xs font-semibold">Concluído em:</p>
                  <p className="text-xs text-muted-foreground">{completedDate}</p>
                </>
              )}
              {completedBy && (
                <>
                  <p className="text-xs font-semibold mt-2">Por:</p>
                  <p className="text-xs text-muted-foreground">{completedBy}</p>
                </>
              )}
              {canEdit && (
                <p className="text-xs text-muted-foreground mt-2 pt-2 border-t">
                  Clique para alterar o status
                </p>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  // Se puder editar, mostrar tooltip com instrução
  if (canEdit) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="w-fit">
              {statusButton}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-xs">
              Clique para marcar como {isCompleted ? 'em andamento' : 'concluído'}
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return statusButton
}
