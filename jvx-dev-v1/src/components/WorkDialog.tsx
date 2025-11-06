import * as React from "react"
import { toast } from "sonner"
import { IconPlus } from "@tabler/icons-react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { FormField } from "@/components/FormField"
import { api } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import { SITE_TYPES, PAYMENT_STATUS, DEADLINE_TYPES, DELIVERY_STATUS } from '@/lib/constants'
import { normalizeUrl } from '@/lib/utils'

interface WorkDialogProps {
  onSubmitSuccess: () => void
}

export function WorkDialog({ onSubmitSuccess }: WorkDialogProps) {
  const { user } = useAuth()
  
  // Só mostrar para usuários master
  if (!user || user.role !== 'master') {
    return null
  }
  const [developer, setDeveloper] = React.useState("")
  const [deadlineType, setDeadlineType] = React.useState("Normal")
  const [value, setValue] = React.useState("")
  const [domain, setDomain] = React.useState("")
  const [siteType, setSiteType] = React.useState("Site Institucional")
  const [template, setTemplate] = React.useState("")
  const [deliveryDate, setDeliveryDate] = React.useState("")
  const [status, setStatus] = React.useState("Não Entregue")
  const [paymentStatus, setPaymentStatus] = React.useState("Não Pago")
  const [observations, setObservations] = React.useState("")
  const [isOpen, setIsOpen] = React.useState(false)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const resetForm = () => {
    setDeveloper("")
    setDeadlineType("Normal")
    setValue("")
    setDomain("")
    setSiteType("Site Institucional")
    setTemplate("")
    setDeliveryDate("")
    setStatus("Não Entregue")
    setPaymentStatus("Não Pago")
    setObservations("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Converter data para timestamp
      const dateObj = new Date(deliveryDate + 'T12:00:00')
      const timestamp = dateObj.getTime()
      
      // Extrair mês e ano
      const month = dateObj.toLocaleDateString('pt-BR', { month: 'long' })
      const year = dateObj.getFullYear()

      await api.createWork({
        developer,
        deadline_type: deadlineType,
        value: parseFloat(value) || 0,
        domain,
        site_type: siteType,
        template: template || undefined,
        delivery_date: timestamp,
        delivery_month: month.charAt(0).toUpperCase() + month.slice(1),
        delivery_year: year,
        status,
        developer_status: 'Em Andamento',
        payment_status: paymentStatus,
        observations
      })

      toast.success("Trabalho adicionado com sucesso!")
      setIsOpen(false)
      resetForm()
      onSubmitSuccess()
    } catch (error) {
      console.error("Erro ao adicionar projeto:", error)
      toast.error("Erro ao adicionar projeto")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <IconPlus className="h-4 w-4 mr-2" />
          Adicionar Projeto
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[600px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Adicionar Novo Projeto</DialogTitle>
          <DialogDescription>
            Preencha os dados do novo projeto de desenvolvimento.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          <form onSubmit={handleSubmit} className="space-y-4" id="work-form">
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
                  <SelectValue placeholder="Selecione o prazo" />
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
                placeholder="200.00"
                type="number"
                step="0.01"
                min="0"
                required
              />
            </FormField>

            <FormField label="Domínio/URL" required>
              <Input
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                onBlur={(e) => {
                  const normalized = normalizeUrl(e.target.value)
                  setDomain(normalized)
                }}
                placeholder="https://exemplo.com"
                type="url"
                required
              />
              <p className="text-xs text-muted-foreground mt-1">
                URL será automaticamente formatada para HTTPS
              </p>
            </FormField>

            <FormField label="Tipo de Site" required>
              <Select value={siteType} onValueChange={setSiteType} required>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
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
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  {DELIVERY_STATUS.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            <FormField label="Status do Pagamento" required>
              <Select value={paymentStatus} onValueChange={setPaymentStatus} required>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_STATUS.map((status) => (
                    <SelectItem key={status} value={status}>{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            <FormField label="Observações ou Template">
              <Textarea
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
                placeholder="Adicione observações sobre o projeto ou link do template..."
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
            onClick={() => setIsOpen(false)}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button type="submit" form="work-form" disabled={isSubmitting}>
            {isSubmitting ? "Adicionando..." : "Adicionar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
