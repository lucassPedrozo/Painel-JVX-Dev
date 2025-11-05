import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useWorks } from '@/contexts/WorksContext'
import { PageHeader } from '@/components/PageHeader'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '../components/ui/alert'
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
  Info
} from 'lucide-react'

export function Configuracoes() {
  const { isMaster } = useAuth()
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
        'OBS ou Template'
      ]

      const csvContent = [
        headers.join(','),
        ...works.map(work => {
          // Converter timestamp para data DD/MM/YYYY
          const date = new Date(work.delivery_date)
          const day = String(date.getDate()).padStart(2, '0')
          const month = String(date.getMonth() + 1).padStart(2, '0')
          const year = date.getFullYear()
          const dateStr = `${day}/${month}/${year}`

          // Formatar valor
          const valueNum = typeof work.value === 'number' ? work.value : parseFloat(work.value.toString()) || 0
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
            `"${work.observations || ''}"`
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

      // A função api.importCSV já faz todo o processamento
      const result = await api.importCSV(file)

      if (result.success) {
        toast.success(`✓ ${result.imported} projetos importados com sucesso!`)

        if (result.errors.length > 0) {
          toast.warning(`⚠ ${result.errors.length} erros encontrados. Verifique o console.`)
          console.group('Erros de Importação')
          result.errors.forEach(error => console.error(error))
          console.groupEnd()
        }

        // Recarregar dados
        reload()
      } else {
        toast.error('Falha na importação')
      }

    } catch (error: any) {
      console.error('Erro ao importar:', error)
      toast.error(error.message || 'Erro ao processar arquivo CSV')
    } finally {
      setImporting(false)
      event.target.value = ''
    }
  }

  // Baixar template CSV
  const handleDownloadTemplate = () => {
    const template = [
      'Desenvolvedor,Prazo,Valor R$,Domínio Desenvolvimento,Tipo de Site,Data Entrega,Mês,Ano,Status,Pagamento,OBS ou Template',
      'Alexandre,Normal,"R$ 200,00",exemplo-com-br.example.com,Site Institucional,01/04/2024,Abril,2024,Entregue,Pago,',
      'Leandro,Prazo Reduzido,"R$ 150,00",exemplo2-com-br.example.com,Landing Page,15/05/2024,Maio,2024,Entregue,Pago,Template customizado'
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
    } catch (error: any) {
      console.error('Erro ao limpar banco:', error)
      toast.error(error.message || 'Erro ao limpar banco de dados')
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

  return (
    <div className="space-y-6 pb-6">
      <PageHeader
        title="Configurações"
        description="Gerencie dados, exportações e configurações do sistema"
      />

      {/* Exportar/Importar Dados */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-primary" />
            <CardTitle>Gerenciar Dados</CardTitle>
          </div>
          <CardDescription>
            Exporte ou importe projetos em formato CSV
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Exportar */}
          <div className="space-y-2">
            <Label>Exportar Projetos</Label>
            <div className="flex gap-2">
              <Button
                onClick={handleExportCSV}
                disabled={exporting || works.length === 0}
                className="flex-1"
              >
                <Download className="h-4 w-4 mr-2" />
                {exporting ? 'Exportando...' : `Exportar ${works.length} Projetos`}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Baixe todos os projetos em formato CSV para backup ou análise externa
            </p>
          </div>

          <Separator />

          {/* Importar */}
          {isMaster && (
            <>
              <div className="space-y-2">
                <Label>Importar Projetos (CSV)</Label>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={handleDownloadTemplate}
                    className="flex-1"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Baixar Template
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => document.getElementById('csv-upload')?.click()}
                    disabled={importing}
                    className="flex-1"
                  >
                    <Upload className="h-4 w-4 mr-2" />
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
                <p className="text-xs text-muted-foreground">
                  Baixe o template, preencha com seus dados e importe de volta
                </p>
              </div>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription className="text-xs space-y-2">
                  <div>
                    <strong>Formato do CSV:</strong> Desenvolvedor, Prazo, Valor R$, Domínio, Tipo de Site,
                    Data Entrega (DD/MM/YYYY), Mês, Ano, Status, Pagamento, Observações
                  </div>
                  <div className="pt-2 border-t">
                    <strong>💡 Dica:</strong> Para grandes volumes de dados (100+ registros),
                    use o script direto: <code className="bg-muted px-1 py-0.5 rounded">node importar-csv-direto.js</code>
                  </div>
                </AlertDescription>
              </Alert>
            </>
          )}
        </CardContent>
      </Card>

      {/* Manutenção de Dados */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" />
            <CardTitle>Manutenção de Dados</CardTitle>
          </div>
          <CardDescription>
            Ferramentas para gerenciar e otimizar dados do sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Recarregar Dados */}
          <div className="space-y-2">
            <Label>Atualizar Dados</Label>
            <Button
              variant="outline"
              onClick={handleReloadData}
              className="w-full"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Recarregar Dados do Servidor
            </Button>
            <p className="text-xs text-muted-foreground">
              Sincroniza os dados locais com o servidor
            </p>
          </div>

          <Separator />

          {/* Limpar Cache */}
          <div className="space-y-2">
            <Label>Cache do Navegador</Label>
            <Button
              variant="outline"
              onClick={handleClearCache}
              className="w-full"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Limpar Cache Local
            </Button>
            <p className="text-xs text-muted-foreground">
              Remove dados temporários armazenados no navegador
            </p>
          </div>

          {isMaster && (
            <>
              <Separator />

              {/* Limpar Banco de Dados */}
              <div className="space-y-2">
                <Label className="text-destructive">Limpar Banco de Dados</Label>
                <Button
                  variant="destructive"
                  onClick={() => setShowClearDialog(true)}
                  className="w-full"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Limpar Todos os Projetos
                </Button>
                <p className="text-xs text-muted-foreground">
                  <strong className="text-destructive">ATENÇÃO:</strong> Esta ação remove TODOS os projetos do banco de dados permanentemente
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Estatísticas do Sistema */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            <CardTitle>Estatísticas do Sistema</CardTitle>
          </div>
          <CardDescription>
            Informações sobre os dados armazenados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Total de Projetos</p>
              <p className="text-2xl font-bold">{works.length}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Projetos Entregues</p>
              <p className="text-2xl font-bold text-green-600">
                {works.filter(w => w.status === 'Entregue').length}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Projetos Pagos</p>
              <p className="text-2xl font-bold text-blue-600">
                {works.filter(w => w.payment_status === 'Pago').length}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Desenvolvedores</p>
              <p className="text-2xl font-bold">
                {new Set(works.map(w => w.developer).filter(Boolean)).size}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Avisos */}
      {!isMaster && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Algumas funcionalidades estão disponíveis apenas para usuários administradores.
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
