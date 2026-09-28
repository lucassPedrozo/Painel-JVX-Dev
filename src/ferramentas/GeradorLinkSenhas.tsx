import * as React from 'react'
import { PageHeader } from '@/components/common'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import {
  KeyRound,
  Link as LinkIcon,
  Copy,
  Clock,
  Pin,
  Trash2,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle2
} from 'lucide-react'
import { api } from '@/lib/api'

interface HistoricoItem {
  id: string
  mensagem: string
  timestamp: number
  fixada: boolean
}

function GeradorLinkSenhas() {
  const [linkAcesso, setLinkAcesso] = React.useState('')
  const [login, setLogin] = React.useState('')
  const [senha, setSenha] = React.useState('')
  const [mensagem, setMensagem] = React.useState('')
  const [mostrarSenha, setMostrarSenha] = React.useState(false)
  const [gerando, setGerando] = React.useState(false)
  const [linkGerado, setLinkGerado] = React.useState('')
  const [historico, setHistorico] = React.useState<HistoricoItem[]>([])
  const [tempoExpiracao, setTempoExpiracao] = React.useState('24h')

  // Carregar histórico ao montar
  React.useEffect(() => {
    carregarHistorico()
  }, [])

  const carregarHistorico = async () => {
    try {
      const data = await api.getHistoricoSenhas()
      setHistorico(data)
    } catch {
      // Se falhar, tenta carregar do localStorage como fallback
      const localHistorico = localStorage.getItem('jvx_historico_senhas')
      if (localHistorico) {
        setHistorico(JSON.parse(localHistorico))
      }
    }
  }

  const salvarHistorico = async (novoHistorico: HistoricoItem[]) => {
    try {
      await api.salvarHistoricoSenhas(novoHistorico)
      setHistorico(novoHistorico)
    } catch {
      // Fallback para localStorage
      localStorage.setItem('jvx_historico_senhas', JSON.stringify(novoHistorico))
      setHistorico(novoHistorico)
    }
  }

  const handleGerarLink = async () => {
    if (!linkAcesso.trim()) {
      toast.error('Preencha o link de acesso')
      return
    }

    if (!login.trim()) {
      toast.error('Preencha o login')
      return
    }

    if (!senha.trim()) {
      toast.error('Preencha a senha')
      return
    }

    setGerando(true)
    setLinkGerado('')

    try {
      // Chamar API do backend que fará a integração com OneTimeSecret
      const resultado = await api.gerarLinkSeguro({
        linkAcesso: linkAcesso.trim(),
        login: login.trim(),
        senha: senha.trim(),
        mensagem: mensagem.trim() || undefined,
        tempoExpiracao,
      })

      setLinkGerado(resultado.linkSeguro)
      toast.success('Link gerado com sucesso!')

      // Adicionar ao histórico se houver mensagem
      if (mensagem.trim()) {
        const novoItem: HistoricoItem = {
          id: Date.now().toString(),
          mensagem: mensagem.trim(),
          timestamp: Date.now(),
          fixada: false,
        }

        // Manter apenas as 5 mensagens mais recentes + fixadas
        const historicoFiltrado = historico.filter(h => h.fixada)
        const historicoNaoFixado = historico.filter(h => !h.fixada)
        const novoHistorico = [
          ...historicoFiltrado,
          novoItem,
          ...historicoNaoFixado,
        ].slice(0, 5)

        await salvarHistorico(novoHistorico)
      }
    } catch (error) {
      console.error('Erro ao gerar link:', error)
      const errorMessage = error instanceof Error ? error.message : 'Erro ao gerar link de acesso seguro'
      toast.error(errorMessage)
    } finally {
      setGerando(false)
    }
  }

  const copiarLink = () => {
    if (linkGerado) {
      navigator.clipboard.writeText(linkGerado)
      toast.success('Link copiado para área de transferência!')
    }
  }

  const limparFormulario = () => {
    setLinkAcesso('')
    setLogin('')
    setSenha('')
    setMensagem('')
    setLinkGerado('')
  }

  const usarMensagem = (msg: string) => {
    setMensagem(msg)
    toast.success('Mensagem carregada!')
  }

  const toggleFixarMensagem = async (id: string) => {
    const novoHistorico = historico.map(item =>
      item.id === id ? { ...item, fixada: !item.fixada } : item
    )
    await salvarHistorico(novoHistorico)
  }

  const removerMensagem = async (id: string) => {
    const novoHistorico = historico.filter(item => item.id !== id)
    await salvarHistorico(novoHistorico)
    toast.success('Mensagem removida do histórico')
  }

  const formatarData = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="space-y-6 pb-6">
      <PageHeader
        title="Gerador de Link para Senhas"
        description="Crie links seguros e temporários para compartilhar credenciais de acesso"
      />

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Formulário Principal */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="border-transparent bg-card overflow-hidden gap-4 py-4">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                  <KeyRound className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-sm font-semibold">Credenciais de Acesso</CardTitle>
                  <CardDescription className="text-[11px]">
                    Preencha os dados que deseja compartilhar de forma segura
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="link-acesso">Link de Acesso *</Label>
                <Input
                  id="link-acesso"
                  type="url"
                  placeholder="https://exemplo.com/admin"
                  value={linkAcesso}
                  onChange={(e) => setLinkAcesso(e.target.value)}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="login">Login / Usuário *</Label>
                  <Input
                    id="login"
                    placeholder="usuario@exemplo.com"
                    value={login}
                    onChange={(e) => setLogin(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="senha">Senha *</Label>
                  <div className="relative">
                    <Input
                      id="senha"
                      type={mostrarSenha ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={senha}
                      onChange={(e) => setSenha(e.target.value)}
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setMostrarSenha(!mostrarSenha)}
                    >
                      {mostrarSenha ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="mensagem">Mensagem Adicional (Opcional)</Label>
                <Textarea
                  id="mensagem"
                  placeholder="Ex: Acesso para homologação - válido até 15/03"
                  rows={3}
                  value={mensagem}
                  onChange={(e) => setMensagem(e.target.value)}
                />
                <p className="text-[11px] text-muted-foreground">
                  Esta mensagem será salva no histórico para reutilização
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="expiracao">Tempo de Expiração</Label>
                <Select value={tempoExpiracao} onValueChange={setTempoExpiracao}>
                  <SelectTrigger id="expiracao">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1h">1 hora</SelectItem>
                    <SelectItem value="6h">6 horas</SelectItem>
                    <SelectItem value="12h">12 horas</SelectItem>
                    <SelectItem value="24h">24 horas</SelectItem>
                    <SelectItem value="48h">48 horas</SelectItem>
                    <SelectItem value="7d">7 dias</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="flex gap-2">
                <Button
                  onClick={handleGerarLink}
                  disabled={gerando}
                  className="flex-1"
                >
                  {gerando ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Gerando...
                    </>
                  ) : (
                    <>
                      <LinkIcon className="h-4 w-4 mr-2" />
                      Gerar Link Seguro
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={limparFormulario}
                  disabled={gerando}
                >
                  Limpar
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Link Gerado */}
          {linkGerado && (
            <Card className="border-emerald-200 bg-emerald-50 overflow-hidden gap-4 py-4">
              <CardContent>
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-500/10">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div className="flex-1 min-w-0 space-y-2">
                    <div>
                      <p className="text-sm font-semibold text-emerald-900">
                        Link Gerado com Sucesso!
                      </p>
                      <p className="text-xs text-emerald-700 mt-0.5">
                        Este link pode ser visualizado apenas uma vez e expira em {tempoExpiracao === '24h' ? '24 horas' : tempoExpiracao}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Input
                        value={linkGerado}
                        readOnly
                        className="bg-white border-emerald-300 text-xs font-mono"
                      />
                      <Button
                        size="sm"
                        onClick={copiarLink}
                        className="shrink-0 bg-emerald-600 hover:bg-emerald-700"
                      >
                        <Copy className="h-3.5 w-3.5 mr-1.5" />
                        Copiar
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Histórico de Mensagens */}
        <div>
          <Card className="border-transparent bg-card overflow-hidden gap-4 py-4">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-500/10">
                  <Clock className="h-4 w-4 text-violet-500" />
                </div>
                <div>
                  <CardTitle className="text-sm font-semibold">Histórico de Mensagens</CardTitle>
                  <CardDescription className="text-[11px]">
                    Últimas 5 mensagens utilizadas
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {historico.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-xs">Nenhuma mensagem no histórico</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {historico.map((item) => (
                    <div
                      key={item.id}
                      className="group relative rounded-lg border p-3 hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-start gap-2 mb-2">
                        {item.fixada && (
                          <Pin className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
                        )}
                        <p className="text-xs flex-1 line-clamp-2">{item.mensagem}</p>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] text-muted-foreground">
                          {formatarData(item.timestamp)}
                        </span>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => usarMensagem(item.mensagem)}
                            title="Usar mensagem"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className={`h-6 w-6 p-0 ${item.fixada ? 'text-amber-500' : ''}`}
                            onClick={() => toggleFixarMensagem(item.id)}
                            title={item.fixada ? 'Desafixar' : 'Fixar'}
                          >
                            <Pin className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 text-destructive"
                            onClick={() => removerMensagem(item.id)}
                            title="Remover"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Aviso de Segurança */}
          <Card className="border-amber-200 bg-amber-50 overflow-hidden gap-3 py-3 mt-4">
            <CardContent>
              <div className="flex items-start gap-2">
                <KeyRound className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-amber-900">
                    Atenção: Links de Uso Único
                  </p>
                  <p className="text-[11px] text-amber-700 leading-relaxed">
                    Os links gerados podem ser visualizados apenas uma vez. Após isso, são
                    automaticamente destruídos. Certifique-se de enviá-los apenas para o destinatário correto.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default GeradorLinkSenhas
