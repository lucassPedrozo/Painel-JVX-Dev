import * as React from "react"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { FormField } from "@/components/FormField"
import { api, type Work } from '@/lib/api'
import { SITE_TYPES, PAYMENT_STATUS, DEADLINE_TYPES, DELIVERY_STATUS } from '@/lib/constants'
import { normalizeUrl } from '@/lib/utils'

interface EditWorkDialogProps {
  work: Work
  isOpen: boolean
  onClose: () => void
  onSubmitSuccess: () => void
}

export function EditWorkDialog({ work, isOpen, onClose, onSubmitSuccess }: EditWorkDialogProps) {
  const [typeWork, setTypeWork] = React.useState(work.typeWork)
  const [paymentStatus, setPaymentStatus] = React.useState(work.paymentStatus)
  const [value, setValue] = React.useState(String(work.value))
  const [url, setUrl] = React.useState(work.url)
  const [date, setDate] = React.useState(new Date(work.date).toISOString().split('T')[0])
  const [developer, setDeveloper] = React.useState(work.developer || "")
  const [template, setTemplate] = React.useState(work.template || "")
  const [observations, setObservations] = React.useState(work.observations || "")
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  React.useEffect(() => {
    if (isOpen) {
      setTypeWork(work.typeWork)
      setPaymentStatus(work.paymentStatus)
      setValue(String(work.value))
      setUrl(work.url)
      setDate(new Date(work.date).toISOString().split('T')[0])
      setDeveloper(work.developer || "")
      setTemplate(work.template || "")
      setObservations(work.observations || "")
    }
  }, [isOpen, work])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      await api.updateWork(work.id!, {
        typeWork,
        paymentStatus,
        value,
        url,
        date,
        developer,
        template,
        observations
      })

      toast.success("Trabalho atualizado com sucesso!")
      onClose()
      onSubmitSuccess()
    } catch (error) {
      console.error("Erro ao atualizar trabalho:", error)
      toast.error(error instanceof Error ? error.message : "Erro ao atualizar trabalho")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Editar Trabalho</DialogTitle>
          <DialogDescription>
            Atualize as informações do projeto selecionado.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          <form onSubmit={handleSubmit} className="space-y-4" id="edit-work-form">
          <FormField label="Tipo de Trabalho" required>
            <Select value={typeWork} onValueChange={setTypeWork} required>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {WORK_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          <FormField label="Status do Pagamento" required>
            <Select value={paymentStatus} onValueChange={setPaymentStatus} required>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAYMENT_STATES.map((status) => (
                  <SelectItem key={status} value={status}>{status}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          <FormField label="Valor" required>
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="0.00"
              type="number"
              step="0.01"
              min="0"
              required
            />
          </FormField>

          <FormField label="URL do Site" required>
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onBlur={(e) => {
                const normalized = normalizeUrl(e.target.value)
                setUrl(normalized)
              }}
              placeholder="https://exemplo.com"
              type="url"
              required
            />
            <p className="text-xs text-muted-foreground mt-1">
              URL será automaticamente formatada para HTTPS
            </p>
          </FormField>

          <FormField label="Desenvolvedor" required>
            <Input
              value={developer}
              onChange={(e) => setDeveloper(e.target.value)}
              placeholder="Nome do desenvolvedor"
              required
            />
          </FormField>

          <FormField label="Data de Conclusão" required>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </FormField>

          <FormField label="Template Envato (WordPress)">
            <Input
              value={template}
              onChange={(e) => setTemplate(e.target.value)}
              onBlur={(e) => {
                const normalized = normalizeUrl(e.target.value)
                setTemplate(normalized)
              }}
              placeholder="https://themeforest.net/item/..."
              type="url"
            />
            <p className="text-xs text-muted-foreground mt-1">
              URL do template no Envato Market (ThemeForest)
            </p>
          </FormField>

          <FormField label="Observações">
            <Textarea
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              placeholder="Adicione observações sobre o projeto..."
              rows={3}
              className="resize-none mb-4"
            />
          </FormField>
        </form>
        </ScrollArea>

        <DialogFooter className="mt-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button type="submit" form="edit-work-form" disabled={isSubmitting}>
            {isSubmitting ? "Atualizando..." : "Atualizar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
