import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger, 
  DropdownMenuSeparator 
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { MoreVertical, CheckCircle, Edit, Trash2, Loader2 } from 'lucide-react'
import { type Work, api } from '@/lib/api'
import { toast } from 'sonner'
import { RatingDialog } from './dialogs'
import { useAuth } from '@/contexts/AuthContext'

interface QuickActionsProps {
  work: Work
  onEdit: (work: Work) => void
  onDelete: () => void
  onUpdate: () => void
}

export function QuickActions({ work, onEdit, onDelete, onUpdate }: QuickActionsProps) {
  const { isMaster } = useAuth()
  const [ratingOpen, setRatingOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const handleMarkAsPaid = async () => {
    if (!work.id) {
      toast.error('ID do projeto não encontrado')
      return
    }
    
    setLoading(true)
    try {
      await api.markAsPaid(work.id)
      toast.success('Projeto marcado como pago!')
      onUpdate()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao marcar como pago'
      toast.error(message)
      console.error('Erro ao marcar como pago:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!work.id) {
      toast.error('ID do projeto não encontrado')
      return
    }

    setDeleting(true)
    try {
      await api.deleteWork(work.id)
      toast.success('Projeto deletado com sucesso!')
      setDeleteDialogOpen(false)
      onDelete() // Atualiza a lista
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao deletar projeto'
      toast.error(message)
      console.error('Erro ao deletar projeto:', error)
    } finally {
      setDeleting(false)
    }
  }

  const handleSaveRating = async (ratings: Record<string, unknown>) => {
    if (!work.id) {
      toast.error('ID do projeto não encontrado')
      return
    }

    try {
      // Enviar apenas os campos necessários para atualizar, não spread do work inteiro
      const updateData = {
        developer: work.developer,
        deadline_type: work.deadline_type,
        value: work.value,
        domain: work.domain,
        site_type: work.site_type,
        template: work.template,
        delivery_date: work.delivery_date,
        delivery_month: work.delivery_month,
        delivery_year: work.delivery_year,
        status: work.status,
        developer_status: work.developer_status,
        payment_status: work.payment_status,
        observations: work.observations,
        ...ratings
      } as Omit<Work, 'id'>
      await api.updateWork(work.id, updateData)
      toast.success('Avaliação salva com sucesso!')
      setRatingOpen(false)
      onUpdate()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao salvar avaliação'
      toast.error(message)
      console.error('Erro ao salvar avaliação:', error)
    }
  }

  const isPaid = work.payment_status === 'Pago'

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0"
            aria-label="Ações do projeto"
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          {isMaster ? (
            <>
              <DropdownMenuItem 
                onClick={() => onEdit(work)}
                className="cursor-pointer"
              >
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </DropdownMenuItem>
              
              {!isPaid && (
                <DropdownMenuItem 
                  onClick={handleMarkAsPaid} 
                  disabled={loading}
                  className="cursor-pointer"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <CheckCircle className="h-4 w-4 mr-2" />
                  )}
                  {loading ? 'Marcando...' : 'Marcar como Pago'}
                </DropdownMenuItem>
              )}
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem 
                onClick={handleDeleteClick}
                className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Deletar
              </DropdownMenuItem>
            </>
          ) : (
            <DropdownMenuItem disabled className="text-muted-foreground">
              Sem ações disponíveis
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Dialog de Confirmação de Exclusão */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>Tem certeza que deseja deletar este projeto?</p>
              <div className="mt-3 p-3 bg-muted rounded-md text-sm">
                <p className="font-semibold text-foreground">{work.domain}</p>
                <p className="text-muted-foreground mt-1">
                  Desenvolvedor: {work.developer}
                </p>
                <p className="text-muted-foreground">
                  Tipo: {work.site_type}
                </p>
              </div>
              <p className="text-red-600 font-medium mt-3">
                Esta ação não pode ser desfeita!
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {deleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deletando...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Deletar Projeto
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog de Avaliação */}
      <RatingDialog
        work={work}
        open={ratingOpen}
        onOpenChange={setRatingOpen}
        onSave={handleSaveRating}
      />
    </>
  )
}
