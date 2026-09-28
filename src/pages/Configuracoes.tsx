import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useWorks } from '@/contexts/WorksContext'
import { PageHeader } from '@/components/common'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
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
import { toast } from 'sonner'
import { api } from '@/lib/api'
import {
  Download,
  Upload,
  Database,
  Trash2,
  RefreshCw,
  FileSpreadsheet,
  AlertTriangle,
  CheckCircle2,
  Info,
  HardDrive,
  Activity,
  TrendingUp,
  Users,
  ShieldCheck,
  MonitorSmartphone
} from 'lucide-react'

function Configuracoes() {
  const { isMaster, user } = useAuth()
  const { works, reload } = useWorks()
  const [importing, setImporting] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [showClearDialog, setShowClearDialog] = useState(false)
  const [clearPassword, setClearPassword] = useState('')
  const [clearing, setClearing] = useState(false)

  // Exportar para CSV
  const handleExportCSV = () => {
    setExporting(true)
    try {
      const headers = [
        'Desenvolvedor',
        'Prazo',
        'Valor R$',
        'Domínio Desenvolvimento',
        'Tipo de Site',
        'Data Entrega',
        'Mês',
        'Ano',
        'Status',
        'Pagamento',
        'OBS ou Template',
        'Status Desenvolvedor',
        'Template URL'
      ]

      const csvContent = [
        headers.join(','),
        ...works.map(work => {
          const date = new Date(work.delivery_date)
          const day = String(date.getDate()).padStart(2, '0')
          const month = String(date.getMonth() + 1).padStart(2, '0')
          const year = date.getFullYear()
          const dateStr = `${day}/${month}/${year}`

          const valueNum = typeof work.value === 'number' ? work.value : parseFloat(String(work.value)) || 0
          const valueStr = `R$ ${valueNum.toFixed(2).replace('.', ',')}`

          return [
            `"${work.developer}"`,
            `"${work.deadline_type}"`,
            `"${valueStr}"`,
            `"${work.domain}"`,
            `"${work.site_type}"`,
            dateStr,
            `"${work.delivery_month}"`,
            work.delivery_year,
            `"${work.status}"`,
            `"${work.payment_status}"`,
            `"${work.observations || ''}"`,
            `"${work.developer_status || 'Em Andamento'}"`,
            `"${work.template || ''}"`
          ].join(',')
        })
      ].join('\n')

      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)

      link.setAttribute('href', url)
      link.setAttribute('download', `relatorio-desenvolvimento-${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'

      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast.success(`✓ ${works.length} projetos exportados com sucesso!`)
    } catch (error) {
      console.error('Erro ao exportar:', error)
      toast.error('Erro ao exportar dados')
    } finally {
      setExporting(false)
    }
  }

  // Importar CSV
  const handleImportCSV = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setImporting(true)

    try {
      toast.info('Processando arquivo CSV...')
      const result = await api.importCSV(file)

      if (result.success) {
        toast.success(`✓ ${result.imported} projetos importados com sucesso!`)

        if (result.errors.length > 0) {
          toast.warning(`⚠ ${result.errors.length} erros encontrados. Verifique o console.`)
          console.group('Erros de Importação')
          result.errors.forEach(error => console.error(error))
          console.groupEnd()
        }

        reload()
      } else {
        toast.error('Falha na importação')
      }

    } catch (error) {
      console.error('Erro ao importar:', error)
      const message = error instanceof Error ? error.message : 'Erro ao processar arquivo CSV'
      toast.error(message)
    } finally {
      setImporting(false)
      event.target.value = ''
    }
  }

  // Baixar template CSV
  const handleDownloadTemplate = () => {
    const template = [
      'Desenvolvedor,Prazo,Valor R$,Domínio Desenvolvimento,Tipo de Site,Data Entrega,Mês,Ano,Status,Pagamento,OBS ou Template,Status Desenvolvedor,Template URL',
      'Dev Alpha,Normal,"R$ 200,00",cliente-alpha.example.com,Site Institucional,01/04/2024,Abril,2024,Entregue,Pago,,Concluído,',
      'Dev Beta,Prazo Reduzido,"R$ 150,00",cliente-bravo.example.com,Landing Page,15/05/2024,Maio,2024,Entregue,Pago,Template customizado,Concluído,https://themeforest.net/item/exemplo'
    ].join('\n')

    const blob = new Blob(['\uFEFF' + template], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)

    link.setAttribute('href', url)
    link.setAttribute('download', 'template-importacao-desenvolvimento.csv')
    link.style.visibility = 'hidden'

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast.success('Template baixado com sucesso!')
  }

  // Limpar banco de dados
  const handleClearDatabase = async () => {
    if (!clearPassword) {
      toast.error('Digite sua senha para confirmar')
      return
    }

    setClearing(true)
    try {
      await api.clearDatabase(clearPassword)
      toast.success('Banco de dados limpo com sucesso!')
      setClearPassword('')
      setShowClearDialog(false)
      reload()
    } catch (error) {
      console.error('Erro ao limpar banco:', error)
      const message = error instanceof Error ? error.message : 'Erro ao limpar banco de dados'
      toast.error(message)
    } finally {
      setClearing(false)
    }
  }

  // Recarregar dados
  const handleReloadData = () => {
    reload()
    toast.success('Dados recarregados!')
  }

  // Limpar cache
  const handleClearCache = () => {
    localStorage.removeItem('jvx_cache')
    sessionStorage.clear()
    toast.success('Cache limpo com sucesso!')
  }

  // Estatísticas computadas
  // "Entregues" = projetos concluídos pelo dev (developer_status) OU marcados como entregues (status)
  const stats = {
    total: works.length,
    entregues: works.filter(w => w.developer_status === 'Concluído' || w.status === 'Entregue').length,
    pagos: works.filter(w => w.payment_status === 'Pago').length,
    devs: new Set(works.map(w => w.developer).filter(Boolean)).size,
  }

  const taxaEntrega = stats.total > 0 ? Math.round((stats.entregues / stats.total) * 100) : 0
  const taxaPagamento = stats.total > 0 ? Math.round((stats.pagos / stats.total) * 100) : 0

  return (
    <div className="space-y-6 pb-6">
      <PageHeader
        title="Configurações"
        description="Gerencie dados, exportações e configurações do sistema"
      />

      {/* Informações da sessão */}
      <Card className="border-transparent bg-card overflow-hidden py-4">
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <MonitorSmartphone className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold truncate">{user?.username}</p>
                <Badge variant={isMaster ? 'default' : 'secondary'} className="text-[10px] px-1.5 py-0 shrink-0">
                  {isMaster ? 'Administrador' : 'Padrão'}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {isMaster ? 'Acesso total ao sistema' : `Desenvolvedor: ${user?.developerName || user?.developer_name || 'N/A'}`}
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
              Sessão ativa
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Painel de Estatísticas */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        <Card className="border-transparent bg-card overflow-hidden py-4">
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">Projetos</p>
                <p className="text-2xl font-bold tracking-tight">{stats.total}</p>
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                <Activity className="h-4 w-4 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-transparent bg-card overflow-hidden py-4">
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">Entregues</p>
                <div className="flex items-baseline gap-1.5">
                  <p className="text-2xl font-bold tracking-tight text-emerald-600">{stats.entregues}</p>
                  <span className="text-[11px] text-muted-foreground">{taxaEntrega}%</span>
                </div>
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-transparent bg-card overflow-hidden py-4">
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">Pagos</p>
                <div className="flex items-baseline gap-1.5">
                  <p className="text-2xl font-bold tracking-tight text-sky-600">{stats.pagos}</p>
                  <span className="text-[11px] text-muted-foreground">{taxaPagamento}%</span>
                </div>
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-500/10">
                <TrendingUp className="h-4 w-4 text-sky-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-transparent bg-card overflow-hidden py-4">
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">Devs</p>
                <p className="text-2xl font-bold tracking-tight">{stats.devs}</p>
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-500/10">
                <Users className="h-4 w-4 text-violet-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Gerenciar Dados */}
        <Card className="border-transparent bg-card overflow-hidden gap-3 py-4">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <FileSpreadsheet className="h-4 w-4 text-primary" />
              </div>
              <div>
                <CardTitle className="text-sm font-semibold">Gerenciar Dados</CardTitle>
                <CardDescription className="text-[11px]">
                  Exportação e importação de projetos
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              onClick={handleExportCSV}
              disabled={exporting || works.length === 0}
              className="w-full justify-start h-9 text-[13px]"
              variant="outline"
            >
              <Download className="h-3.5 w-3.5 mr-2" />
              {exporting ? 'Exportando...' : `Exportar ${works.length} projetos (CSV)`}
            </Button>

            {isMaster && (
              <>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={handleDownloadTemplate}
                    className="flex-1 h-9 text-[13px]"
                  >
                    <Download className="h-3.5 w-3.5 mr-2" />
                    Template
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => document.getElementById('csv-upload')?.click()}
                    disabled={importing}
                    className="flex-1 h-9 text-[13px]"
                  >
                    <Upload className="h-3.5 w-3.5 mr-2" />
                    {importing ? 'Importando...' : 'Importar CSV'}
                  </Button>
                  <input
                    id="csv-upload"
                    type="file"
                    accept=".csv"
                    onChange={handleImportCSV}
                    className="hidden"
                  />
                </div>

                <div className="rounded-lg border border-dashed p-3 mt-2">
                  <div className="flex items-start gap-2">
                    <Info className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      Para grandes volumes (100+), use: <code className="bg-muted px-1 py-0.5 rounded text-[10px]">node importar-csv-direto.js</code>
                    </p>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Manutenção */}
        <Card className="border-transparent bg-card overflow-hidden gap-3 py-4">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <HardDrive className="h-4 w-4 text-primary" />
              </div>
              <div>
                <CardTitle className="text-sm font-semibold">Manutenção</CardTitle>
                <CardDescription className="text-[11px]">
                  Sincronização, cache e banco de dados
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant="outline"
              onClick={handleReloadData}
              className="w-full justify-start h-9 text-[13px]"
            >
              <RefreshCw className="h-3.5 w-3.5 mr-2" />
              Recarregar dados do servidor
            </Button>

            <Button
              variant="outline"
              onClick={handleClearCache}
              className="w-full justify-start h-9 text-[13px]"
            >
              <Trash2 className="h-3.5 w-3.5 mr-2" />
              Limpar cache local
            </Button>

            {isMaster && (
              <>
                <Separator />
                <Button
                  variant="outline"
                  onClick={() => setShowClearDialog(true)}
                  className="w-full justify-start h-9 text-[13px] border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
                >
                  <Database className="h-3.5 w-3.5 mr-2" />
                  Limpar banco de dados
                </Button>
                <p className="text-[10px] text-muted-foreground pl-1">
                  Remove todos os projetos permanentemente
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Avisos */}
      {!isMaster && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-xs">
            Algumas funcionalidades estão disponíveis apenas para administradores.
          </AlertDescription>
        </Alert>
      )}

      {/* Dialog de Confirmação para Limpar Banco */}
      <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive">
              ⚠️ Limpar Banco de Dados
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-4">
              <p>
                Esta ação irá <strong>DELETAR PERMANENTEMENTE</strong> todos os {works.length} projetos do banco de dados.
              </p>
              <p className="text-destructive font-semibold">
                Esta ação NÃO PODE ser desfeita!
              </p>
              <div className="space-y-2">
                <Label htmlFor="clear-password">Digite sua senha para confirmar:</Label>
                <Input
                  id="clear-password"
                  type="password"
                  value={clearPassword}
                  onChange={(e) => setClearPassword(e.target.value)}
                  placeholder="Senha do usuário master"
                />
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setClearPassword('')}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleClearDatabase}
              disabled={clearing || !clearPassword}
              className="bg-destructive hover:bg-destructive/90"
            >
              {clearing ? 'Limpando...' : 'Confirmar e Limpar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default Configuracoes
