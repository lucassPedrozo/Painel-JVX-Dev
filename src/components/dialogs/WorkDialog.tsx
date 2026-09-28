import * as React from "react"
import { toast } from "sonner"
import { IconPlus } from "@tabler/icons-react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { FormField } from "@/components/common"
import { api } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import { SITE_TYPES, PAYMENT_STATUS, DEADLINE_TYPES } from '@/lib/constants'
import { normalizeUrl } from '@/lib/utils'

interface WorkDialogProps {
  onSubmitSuccess: () => void
}

export function WorkDialog({ onSubmitSuccess }: WorkDialogProps) {
  const { user } = useAuth()
  
  // Hooks devem ser chamados antes de qualquer return condicional
  const [developer, setDeveloper] = React.useState("")
  const [deadlineType, setDeadlineType] = React.useState("Normal")
  const [value, setValue] = React.useState("")
  const [domain, setDomain] = React.useState("")
  const [siteType, setSiteType] = React.useState("Site Institucional")
  const [template, setTemplate] = React.useState("")
  const [deliveryDate, setDeliveryDate] = React.useState("")
  const [paymentStatus, setPaymentStatus] = React.useState("Não Pago")
  const [observations, setObservations] = React.useState("")
  const [isOpen, setIsOpen] = React.useState(false)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  
  // Só mostrar para usuários master
  if (!user || user.role !== 'master') {
    return null
  }

  const resetForm = () => {
    setDeveloper("")
    setDeadlineType("Normal")
    setValue("")
    setDomain("")
    setSiteType("Site Institucional")
    setTemplate("")
    setDeliveryDate("")
    setPaymentStatus("Não Pago")
    setObservations("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSubmitting) return
    setIsSubmitting(true)

    try {
      // Construir data a partir da string YYYY-MM-DD
      const [year, month, day] = deliveryDate.split('-').map(Number)
      const dateObj = new Date(year, month - 1, day, 12, 0, 0)
      const timestamp = dateObj.getTime()
      
      // Extrair mês e ano
      const monthName = dateObj.toLocaleDateString('pt-BR', { month: 'long' })
      const yearNum = dateObj.getFullYear()
      
      // Garantir valor numérico
      const numericValue = parseFloat(value) || 0

      await api.createWork({
        developer: developer.trim(),
        deadline_type: deadlineType,
        value: numericValue,
        domain: domain.trim(),
        site_type: siteType,
        template: template.trim() || undefined,
        delivery_date: timestamp,
        delivery_month: monthName.charAt(0).toUpperCase() + monthName.slice(1),
        delivery_year: yearNum,
        status: 'Não Entregue',
        developer_status: 'Em Andamento',
        payment_status: paymentStatus,
        observations: observations.trim()
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
        <Button size="sm">
          <IconPlus className="h-3.5 w-3.5 mr-1.5" />
          Novo Projeto
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[600px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-base">Novo Projeto</DialogTitle>
          <DialogDescription className="text-xs">
            Preencha os dados do novo projeto de desenvolvimento.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          <form onSubmit={handleSubmit} className="space-y-5 py-1" id="work-form">
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
                    <SelectValue placeholder="Selecione o prazo" />
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
                className="h-10"
                required
              />
              <p className="text-xs text-muted-foreground mt-1.5">
                URL será automaticamente formatada para HTTPS
              </p>
            </FormField>

            <FormField label="Tipo de Site" required>
              <Select value={siteType} onValueChange={setSiteType} required>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {SITE_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            <FormField label="Status do Pagamento" required>
              <Select value={paymentStatus} onValueChange={setPaymentStatus} required>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Selecione o status" />
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
