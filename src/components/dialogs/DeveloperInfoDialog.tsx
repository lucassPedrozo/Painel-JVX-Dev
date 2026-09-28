import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Phone, CreditCard, Building2, Save, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface DeveloperInfo {
  contacts: {
    phone?: string
    email?: string
    whatsapp?: string
  }
  payment: {
    pixKey?: string
    pixType?: string
    bankName?: string
    agency?: string
    account?: string
  }
  observations?: string
}

interface DeveloperInfoDialogProps {
  developerName: string
  isOpen: boolean
  onClose: () => void
}

import { API_URL } from '@/lib/api-url'

// A autenticação vai no cookie HttpOnly de sessão (credentials: 'include')
const requestOptions = {
  credentials: 'include' as const,
  headers: { 'Content-Type': 'application/json' }
}

export function DeveloperInfoDialog({ developerName, isOpen, onClose }: DeveloperInfoDialogProps) {
  const [info, setInfo] = React.useState<DeveloperInfo>({
    contacts: {},
    payment: {},
    observations: ""
  })
  const [loading, setLoading] = React.useState(false)
  const [saving, setSaving] = React.useState(false)

  // Carregar dados do banco ao abrir
  React.useEffect(() => {
    if (isOpen && developerName) {
      setLoading(true)
      fetch(`${API_URL}/developers/${encodeURIComponent(developerName)}`, requestOptions)
        .then(res => {
          if (!res.ok) throw new Error('Erro ao carregar dados')
          return res.json()
        })
        .then(data => {
          if (data) {
            setInfo({
              contacts: {
                phone: data.phone || "",
                email: data.email || "",
                whatsapp: data.whatsapp || ""
              },
              payment: {
                pixKey: data.pixKey || "",
                pixType: data.pixType || "",
                bankName: data.bankName || "",
                agency: data.agency || "",
                account: data.account || ""
              },
              observations: data.observations || ""
            })
          }
        })
        .catch(err => {
          console.error("Erro ao carregar dados:", err)
          toast.error("Erro ao carregar informações do desenvolvedor")
        })
        .finally(() => setLoading(false))
    }
  }, [isOpen, developerName])

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch(`${API_URL}/developers`, {
        ...requestOptions,
        method: 'POST',
        body: JSON.stringify({
          name: developerName,
          phone: info.contacts.phone || null,
          email: info.contacts.email || null,
          whatsapp: info.contacts.whatsapp || null,
          pixKey: info.payment.pixKey || null,
          pixType: info.payment.pixType || null,
          bankName: info.payment.bankName || null,
          agency: info.payment.agency || null,
          account: info.payment.account || null,
          observations: info.observations || null
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Erro ao salvar informações')
      }

      toast.success("Informações salvas com sucesso!")
      onClose()
    } catch (error) {
      console.error("Erro ao salvar:", error)
      toast.error(error instanceof Error ? error.message : "Erro ao salvar informações")
    } finally {
      setSaving(false)
    }
  }

  const updateContact = (field: keyof DeveloperInfo["contacts"], value: string) => {
    setInfo((prev) => ({
      ...prev,
      contacts: { ...prev.contacts, [field]: value },
    }))
  }

  const updatePayment = (field: keyof DeveloperInfo["payment"], value: string) => {
    setInfo((prev) => ({
      ...prev,
      payment: { ...prev.payment, [field]: value },
    }))
  }

  const updateObservations = (value: string) => {
    setInfo((prev) => ({ ...prev, observations: value }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Informações do Desenvolvedor</DialogTitle>
          <DialogDescription>
            Gerencie contatos, dados de pagamento e observações sobre {developerName}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="contacts" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="contacts">Contatos</TabsTrigger>
            <TabsTrigger value="payment">Pagamento</TabsTrigger>
            <TabsTrigger value="notes">Observações</TabsTrigger>
          </TabsList>

          {/* Aba de Contatos */}
          <TabsContent value="contacts" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Informações de Contato
                </CardTitle>
                <CardDescription>
                  Adicione telefones, e-mails e outros contatos
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    placeholder="(00) 00000-0000"
                    value={info.contacts.phone || ""}
                    onChange={(e) => updateContact("phone", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="whatsapp">WhatsApp</Label>
                  <Input
                    id="whatsapp"
                    placeholder="(00) 00000-0000"
                    value={info.contacts.whatsapp || ""}
                    onChange={(e) => updateContact("whatsapp", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="desenvolvedor@email.com"
                    value={info.contacts.email || ""}
                    onChange={(e) => updateContact("email", e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba de Pagamento */}
          <TabsContent value="payment" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Chave PIX
                </CardTitle>
                <CardDescription>
                  Informações para transferências via PIX
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="pixType">Tipo de Chave</Label>
                  <Input
                    id="pixType"
                    placeholder="CPF, E-mail, Telefone, Aleatória"
                    value={info.payment.pixType || ""}
                    onChange={(e) => updatePayment("pixType", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pixKey">Chave PIX</Label>
                  <Input
                    id="pixKey"
                    placeholder="Digite a chave PIX"
                    value={info.payment.pixKey || ""}
                    onChange={(e) => updatePayment("pixKey", e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Dados Bancários
                </CardTitle>
                <CardDescription>
                  Informações para transferências bancárias
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="bankName">Banco</Label>
                  <Input
                    id="bankName"
                    placeholder="Nome do banco"
                    value={info.payment.bankName || ""}
                    onChange={(e) => updatePayment("bankName", e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="agency">Agência</Label>
                    <Input
                      id="agency"
                      placeholder="0000"
                      value={info.payment.agency || ""}
                      onChange={(e) => updatePayment("agency", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="account">Conta</Label>
                    <Input
                      id="account"
                      placeholder="00000-0"
                      value={info.payment.account || ""}
                      onChange={(e) => updatePayment("account", e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba de Observações */}
          <TabsContent value="notes" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Observações</CardTitle>
                <CardDescription>
                  Adicione notas e informações adicionais sobre o desenvolvedor
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Digite suas observações aqui..."
                  className="min-h-[200px]"
                  value={info.observations || ""}
                  onChange={(e) => updateObservations(e.target.value)}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Botões de Ação */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={saving || loading}>
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Salvar Informações
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
