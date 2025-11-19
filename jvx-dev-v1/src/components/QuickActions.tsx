import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu'
import { MoreVertical, CheckCircle, Edit, Trash2 } from 'lucide-react'
import { type Work, api } from '@/lib/api'
import { toast } from 'sonner'
import { RatingDialog } from './dialogs'
import { useAuth } from '@/contexts/AuthContext'

interface QuickActionsProps {
  work: Work
  onEdit: (work: Work) => void
  onDelete: (work: Work) => void
  onUpdate: () => void
}

export function QuickActions({ work, onEdit, onDelete, onUpdate }: QuickActionsProps) {
  const { isMaster } = useAuth()
  const [ratingOpen, setRatingOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleMarkAsPaid = async () => {
    if (!work.id) return
    
    setLoading(true)
    try {
      await api.markAsPaid(work.id)
      toast.success('Projeto marcado como pago!')
      onUpdate()
    } catch {
      toast.error('Erro ao marcar como pago')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveRating = async (ratings: Record<string, unknown>) => {
    if (!work.id) return

    try {
      await api.updateWork(work.id, {
        ...work,
        ...ratings
      })
      toast.success('Avaliação salva com sucesso!')
      setRatingOpen(false)
      onUpdate()
    } catch {
      toast.error('Erro ao salvar avaliação')
    }
  }

  const isPaid = work.payment_status === 'Pago'

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {isMaster && (
            <>
              <DropdownMenuItem onClick={() => onEdit(work)}>
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </DropdownMenuItem>
              
              {!isPaid && (
                <DropdownMenuItem onClick={handleMarkAsPaid} disabled={loading}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {loading ? 'Marcando...' : 'Marcar como Pago'}
                </DropdownMenuItem>
              )}
              

              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem 
                onClick={() => onDelete(work)}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Deletar
              </DropdownMenuItem>
            </>
          )}
          
          {!isMaster && (
            <DropdownMenuItem disabled>
              Sem ações disponíveis
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <RatingDialog
        work={work}
        open={ratingOpen}
        onOpenChange={setRatingOpen}
        onSave={handleSaveRating}
      />
    </>
  )
}
