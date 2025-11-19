import * as React from "react"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { FormField } from "@/components/common"
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
  const [developer, setDeveloper] = React.useState(work.developer || "")
  const [deadlineType, setDeadlineType] = React.useState(work.deadline_type || "Normal")
  const [value, setValue] = React.useState(String(work.value))
  const [domain, setDomain] = React.useState(work.domain || "")
  const [siteType, setSiteType] = React.useState(work.site_type || "Site Institucional")
  const [template, setTemplate] = React.useState(work.template || "")
  const [deliveryDate, setDeliveryDate] = React.useState(new Date(work.delivery_date).toISOString().split('T')[0])
  const [status, setStatus] = React.useState(work.status || "Não Entregue")
  const [paymentStatus, setPaymentStatus] = React.useState(work.payment_status || "Não Pago")
  const [observations, setObservations] = React.useState(work.observations || "")
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  React.useEffect(() => {
    if (isOpen) {
      setDeveloper(work.developer || "")
      setDeadlineType(work.deadline_type || "Normal")
      setValue(String(work.value))
      setDomain(work.domain || "")
      setSiteType(work.site_type || "Site Institucional")
      setTemplate(work.template || "")
      setDeliveryDate(new Date(work.delivery_date).toISOString().split('T')[0])
      setStatus(work.status || "Não Entregue")
      setPaymentStatus(work.payment_status || "Não Pago")
      setObservations(work.observations || "")
    }
  }, [isOpen, work])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const dateObj = new Date(deliveryDate)
      const deliveryMonth = dateObj.toLocaleDateString('pt-BR', { month: 'long' })
      const deliveryYear = dateObj.getFullYear()

      await api.updateWork(work.id!, {
        developer,
        deadline_type: deadlineType,
        value,
        domain: normalizeUrl(domain),
        site_type: siteType,
        template: template.trim() || undefined,
        delivery_date: dateObj.getTime(),
        delivery_month: deliveryMonth.charAt(0).toUpperCase() + deliveryMonth.slice(1),
        delivery_year: deliveryYear,
        status,
        developer_status: work.developer_status || "Em Andamento",
        payment_status: paymentStatus,
        observations
      })

      toast.success("Projeto atualizado com sucesso!")
      onClose()
      onSubmitSuccess()
    } catch (error) {
      console.error("Erro ao atualizar projeto:", error)
      toast.error(error instanceof Error ? error.message : "Erro ao atualizar projeto")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Editar Projeto</DialogTitle>
          <DialogDescription>
            Atualize as informações do projeto selecionado.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          <form onSubmit={handleSubmit} className="space-y-4" id="edit-work-form">
            <FormField label="Desenvolvedor" required>
              <Input
                value={developer}
                onChange={(e) => setDeveloper(e.target.value)}
                placeholder="Nome do desenvolvedor"
                required
              />
            </FormField>

            <FormField label="Tipo de Prazo" required>
              <Select value={deadlineType} onValueChange={setDeadlineType} required>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DEADLINE_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            <FormField label="Valor (R$)" required>
              <Input
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="R$ 0,00"
                required
              />
            </FormField>

            <FormField label="Domínio/URL do Projeto" required>
              <Input
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="exemplo.com.br"
                required
              />
            </FormField>

            <FormField label="Tipo de Projeto" required>
              <Select value={siteType} onValueChange={setSiteType} required>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SITE_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            <FormField label="Template (URL)">
              <Input
                value={template}
                onChange={(e) => setTemplate(e.target.value)}
                onBlur={(e) => {
                  if (e.target.value) {
                    const normalized = normalizeUrl(e.target.value)
                    setTemplate(normalized)
                  }
                }}
                placeholder="https://themeforest.net/item/..."
                type="url"
              />
              <p className="text-xs text-muted-foreground mt-1">
                URL do template utilizado (ThemeForest, Envato, etc)
              </p>
            </FormField>

            <FormField label="Data de Entrega" required>
              <Input
                type="date"
                value={deliveryDate}
                onChange={(e) => setDeliveryDate(e.target.value)}
                required
              />
            </FormField>

            <FormField label="Status de Entrega" required>
              <Select value={status} onValueChange={setStatus} required>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DELIVERY_STATUS.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            <FormField label="Status de Pagamento" required>
              <Select value={paymentStatus} onValueChange={setPaymentStatus} required>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_STATUS.map((status) => (
                    <SelectItem key={status} value={status}>{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
