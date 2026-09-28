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
import { normalizeUrl, parseValue } from '@/lib/utils'

interface EditWorkDialogProps {
  work: Work
  isOpen: boolean
  onClose: () => void
  onSubmitSuccess: () => void
}

export function EditWorkDialog({ work, isOpen, onClose, onSubmitSuccess }: EditWorkDialogProps) {
  const [developer, setDeveloper] = React.useState(work.developer || "")
  const [deadlineType, setDeadlineType] = React.useState(work.deadline_type || "Normal")
  const [value, setValue] = React.useState(String(parseValue(work.value)))
  const [domain, setDomain] = React.useState(work.domain || "")
  const [siteType, setSiteType] = React.useState(work.site_type || "Site Institucional")
  const [template, setTemplate] = React.useState(work.template || "")
  const [deliveryDate, setDeliveryDate] = React.useState(() => {
    // Converter delivery_date para formato YYYY-MM-DD de forma segura
    try {
      const d = new Date(work.delivery_date)
      if (isNaN(d.getTime())) return ''
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    } catch {
      return ''
    }
  })
  const [status, setStatus] = React.useState(work.status || "Não Entregue")
  const [paymentStatus, setPaymentStatus] = React.useState(work.payment_status || "Não Pago")
  const [observations, setObservations] = React.useState(work.observations || "")
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  React.useEffect(() => {
    if (isOpen) {
      setDeveloper(work.developer || "")
      setDeadlineType(work.deadline_type || "Normal")
      setValue(String(parseValue(work.value)))
      setDomain(work.domain || "")
      setSiteType(work.site_type || "Site Institucional")
      setTemplate(work.template || "")
      try {
        const d = new Date(work.delivery_date)
        if (!isNaN(d.getTime())) {
          setDeliveryDate(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`)
        } else {
          setDeliveryDate('')
        }
      } catch {
        setDeliveryDate('')
      }
      setStatus(work.status || "Não Entregue")
      setPaymentStatus(work.payment_status || "Não Pago")
      setObservations(work.observations || "")
    }
  }, [isOpen, work])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSubmitting) return
    setIsSubmitting(true)

    try {
      // Construir data a partir da string YYYY-MM-DD
      const [year, month, day] = deliveryDate.split('-').map(Number)
      const dateObj = new Date(year, month - 1, day, 12, 0, 0)
      const deliveryMonth = dateObj.toLocaleDateString('pt-BR', { month: 'long' })
      const deliveryYear = dateObj.getFullYear()

      // Detectar se está marcando como "Entregue" para mostrar mensagem apropriada
      const isMarkingAsDelivered = status === "Entregue" && work.status !== "Entregue"
      
      // Garantir valor numérico
      const numericValue = parseValue(value)

      await api.updateWork(work.id!, {
        developer: developer.trim(),
        deadline_type: deadlineType,
        value: numericValue,
        domain: normalizeUrl(domain),
        site_type: siteType,
        template: template.trim() || undefined,
        delivery_date: dateObj.getTime(),
        delivery_month: deliveryMonth.charAt(0).toUpperCase() + deliveryMonth.slice(1),
        delivery_year: deliveryYear,
        status,
        developer_status: status === 'Entregue' ? 'Concluído' : (work.developer_status || "Em Andamento"),
        payment_status: paymentStatus,
        observations: observations.trim()
      })

      // Mostrar mensagem apropriada
      if (isMarkingAsDelivered) {
        toast.success("Projeto marcado como Entregue e Concluído!")
      } else {
        toast.success("Projeto atualizado com sucesso!")
      }
      
      // Fechar modal primeiro, depois atualizar lista
      // Isso evita que o modal tente atualizar state de um componente desmontado
      onClose()
      // Pequeno delay para garantir que o state do modal foi limpo
      setTimeout(() => onSubmitSuccess(), 100)
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
          <DialogTitle className="text-base">Editar Projeto</DialogTitle>
          <DialogDescription className="text-xs">
            Atualize as informações do projeto selecionado.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          <form onSubmit={handleSubmit} className="space-y-5 py-1" id="edit-work-form">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Desenvolvedor" required>
                <Input
                  value={developer}
                  onChange={(e) => setDeveloper(e.target.value)}
                  placeholder="Nome do desenvolvedor"
                  className="h-10"
                  required
                />
              </FormField>

              <FormField label="Tipo de Prazo" required>
                <Select value={deadlineType} onValueChange={setDeadlineType} required>
                  <SelectTrigger className="h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DEADLINE_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Valor (R$)" required>
                <Input
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder="200.00"
                  type="number"
                  step="0.01"
                  min="0"
                  className="h-10"
                  required
                />
              </FormField>

              <FormField label="Data de Início" required>
                <Input
                  type="date"
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  className="h-10"
                  required
                />
                <p className="text-xs text-muted-foreground mt-1.5">
                  Data de início do desenvolvimento
                </p>
              </FormField>
            </div>

            <FormField label="Domínio/URL do Projeto" required>
              <Input
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="exemplo.com.br"
                className="h-10"
                required
              />
            </FormField>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Tipo de Projeto" required>
                <Select value={siteType} onValueChange={setSiteType} required>
                  <SelectTrigger className="h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SITE_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>

              <FormField label="Status de Entrega" required>
                <Select value={status} onValueChange={setStatus} required>
                  <SelectTrigger className="h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DELIVERY_STATUS.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
            </div>

            <FormField label="Status de Pagamento" required>
              <Select value={paymentStatus} onValueChange={setPaymentStatus} required>
                <SelectTrigger className="h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_STATUS.map((status) => (
                    <SelectItem key={status} value={status}>{status}</SelectItem>
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
                className="h-10"
              />
              <p className="text-xs text-muted-foreground mt-1.5">
                URL do template utilizado (ThemeForest, Envato, etc)
              </p>
            </FormField>

            <FormField label="Observações">
              <Textarea
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
                placeholder="Adicione observações sobre o projeto..."
                rows={4}
                className="resize-none"
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
