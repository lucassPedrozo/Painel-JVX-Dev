import * as React from 'react'
import { Download, FileText, Calendar, TrendingUp, Users, Package, DollarSign, Filter, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { PageHeader } from '@/components/PageHeader'
import { useWorks } from '@/contexts/WorksContext'
import { SITE_TYPES, PAYMENT_STATUS } from '@/lib/constants'
import { parseValue, formatCurrency, formatDate } from '@/lib/utils'
import { toast } from 'sonner'
import { generatePDF } from '@/lib/pdf-export'
import { ReportPreview } from '@/components/ReportPreview'
import { CustomReportPreview } from '@/components/CustomReportPreview'

export function Relatorios() {
  const { works } = useWorks()
  const [startDate, setStartDate] = React.useState('')
  const [endDate, setEndDate] = React.useState('')
  const [filterType, setFilterType] = React.useState('all')
  const [filterPayment, setFilterPayment] = React.useState('all')
  const [filterDeveloper, setFilterDeveloper] = React.useState('all')
  const [previewReport, setPreviewReport] = React.useState<{ 
    id: string
    title: string
    action: () => void
    getData: () => any[]
  } | null>(null)

  // Função para obter colunas baseadas no tipo de relatório
  const getColumnsForReport = (reportId: string) => {
    switch (reportId) {
      case 'productivity':
        return [
          { key: 'typeWork', label: 'Desenvolvedor' },
          { key: 'developer', label: 'Concluídos/Total' },
          { key: 'url', label: 'Taxa de Conclusão' },
          { key: 'value', label: 'Receita Total', format: (v: number) => formatCurrency(v) },
          { key: 'template', label: 'Ticket Médio' }
        ]
      case 'financial':
        return [
          { key: 'typeWork', label: 'Métrica' },
          { key: 'url', label: 'Valor' }
        ]
      case 'monthly':
        return [
          { key: 'typeWork', label: 'Mês' },
          { key: 'template', label: 'Projetos' },
          { key: 'developer', label: 'Concluídos/Total' },
          { key: 'value', label: 'Receita', format: (v: number) => formatCurrency(v) },
          { key: 'url', label: 'Ticket Médio' }
        ]
      case 'type':
        return [
          { key: 'typeWork', label: 'Tipo' },
          { key: 'developer', label: 'Quantidade' },
          { key: 'value', label: 'Receita', format: (v: number) => formatCurrency(v) },
          { key: 'url', label: 'Ticket Médio' }
        ]
      case 'template':
        return [
          { key: 'typeWork', label: 'Template' },
          { key: 'developer', label: 'Usos' },
          { key: 'url', label: 'Percentual' },
          { key: 'value', label: 'Receita', format: (v: number) => formatCurrency(v) },
          { key: 'template', label: 'Ticket Médio' }
        ]
      default:
        return [
          { key: 'typeWork', label: 'Tipo' },
          { key: 'developer', label: 'Desenvolvedor' },
          { key: 'value', label: 'Valor', format: (v: number) => formatCurrency(v) },
          { key: 'paymentStatus', label: 'Status' }
        ]
    }
  }

  const developers = React.useMemo(() => {
    const devs = new Set(works.map(w => w.developer).filter(Boolean) as string[])
    return Array.from(devs).sort()
  }, [works])

  const filteredWorks = React.useMemo(() => {
    return works.filter(work => {
      const workDate = new Date(work.date)
      const start = startDate ? new Date(startDate) : null
      const end = endDate ? new Date(endDate) : null

      const matchesDate = (!start || workDate >= start) && (!end || workDate <= end)
      const matchesType = filterType === 'all' || work.typeWork === filterType
      const matchesPayment = filterPayment === 'all' || work.paymentStatus === filterPayment
      const matchesDev = filterDeveloper === 'all' || work.developer === filterDeveloper

      return matchesDate && matchesType && matchesPayment && matchesDev
    })
  }, [works, startDate, endDate, filterType, filterPayment, filterDeveloper])

  const generateCSV = (data: string[][], filename: string) => {
    const BOM = "\uFEFF"
    const csv = BOM + data.map(row => row.map(cell => `"${cell}"`).join(";")).join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${filename}-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
    toast.success(`Relatório ${filename} baixado com sucesso!`)
  }

  // Função para obter dados do relatório completo
  const getCompleteReportData = () => {
    return filteredWorks
  }

  const downloadCompleteReport = () => {
    const headers = ["#", "Tipo", "Desenvolvedor", "Template", "Valor", "Status", "Data", "URL", "Observações"]
    const rows = filteredWorks.map((work, index) => [
      (index + 1).toString(),
      work.typeWork,
      work.developer || "-",
      work.template || "-",
      formatCurrency(parseValue(work.value)),
      work.paymentStatus,
      formatDate(work.date),
      work.url,
      work.observations || "-"
    ])
    generateCSV([headers, ...rows], "relatorio-completo")
  }

  // Função para obter dados de produtividade
  const getProductivityReportData = () => {
    const devStats = new Map<string, { total: number, completed: number, pending: number, revenue: number }>()

    filteredWorks.forEach(work => {
      const dev = work.developer || 'Não atribuído'
      if (!devStats.has(dev)) {
        devStats.set(dev, { total: 0, completed: 0, pending: 0, revenue: 0 })
      }
      const stats = devStats.get(dev)!
      stats.total += 1
      stats.revenue += parseValue(work.value)
      if (work.paymentStatus === 'Pago') {
        stats.completed += 1
      } else {
        stats.pending += 1
      }
    })

    return Array.from(devStats.entries())
      .sort(([, a], [, b]) => b.total - a.total)
      .map(([dev, stats]) => ({
        typeWork: dev,
        developer: `${stats.completed}/${stats.total}`,
        url: `${((stats.completed / stats.total) * 100).toFixed(1)}%`,
        value: stats.revenue,
        template: formatCurrency(stats.revenue / stats.total)
      }))
  }

  const downloadProductivityReport = () => {
    const devStats = new Map<string, { total: number, completed: number, pending: number, revenue: number }>()

    filteredWorks.forEach(work => {
      const dev = work.developer || 'Não atribuído'
      if (!devStats.has(dev)) {
        devStats.set(dev, { total: 0, completed: 0, pending: 0, revenue: 0 })
      }
      const stats = devStats.get(dev)!
      stats.total += 1
      stats.revenue += parseValue(work.value)
      if (work.paymentStatus === 'Pago') {
        stats.completed += 1
      } else {
        stats.pending += 1
      }
    })

    const headers = ["Desenvolvedor", "Total Projetos", "Concluídos", "Pendentes", "Taxa Conclusão", "Receita Total", "Ticket Médio"]
    const rows = Array.from(devStats.entries())
      .sort(([, a], [, b]) => b.total - a.total)
      .map(([dev, stats]) => [
        dev,
        stats.total.toString(),
        stats.completed.toString(),
        stats.pending.toString(),
        `${((stats.completed / stats.total) * 100).toFixed(1)}%`,
        formatCurrency(stats.revenue),
        formatCurrency(stats.revenue / stats.total)
      ])

    generateCSV([headers, ...rows], "relatorio-produtividade")
  }

  // Função para obter dados financeiros
  const getFinancialReportData = () => {
    const totalRevenue = filteredWorks.reduce((acc, w) => acc + parseValue(w.value), 0)
    const paidRevenue = filteredWorks.filter(w => w.paymentStatus === 'Pago').reduce((acc, w) => acc + parseValue(w.value), 0)
    const pendingRevenue = totalRevenue - paidRevenue

    return [
      {
        typeWork: 'Total de Projetos',
        url: filteredWorks.length.toString(),
        value: 0
      },
      {
        typeWork: 'Projetos Concluídos',
        url: filteredWorks.filter(w => w.paymentStatus === 'Pago').length.toString(),
        value: 0
      },
      {
        typeWork: 'Projetos Pendentes',
        url: filteredWorks.filter(w => w.paymentStatus !== 'Pago').length.toString(),
        value: 0
      },
      {
        typeWork: 'Receita Total',
        url: formatCurrency(totalRevenue),
        value: totalRevenue
      },
      {
        typeWork: 'Receita Recebida',
        url: formatCurrency(paidRevenue),
        value: paidRevenue
      },
      {
        typeWork: 'Receita Pendente',
        url: formatCurrency(pendingRevenue),
        value: pendingRevenue
      },
      {
        typeWork: 'Ticket Médio',
        url: formatCurrency(totalRevenue / filteredWorks.length),
        value: totalRevenue / filteredWorks.length
      }
    ]
  }

  const downloadFinancialReport = () => {
    const totalRevenue = filteredWorks.reduce((acc, w) => acc + parseValue(w.value), 0)
    const paidRevenue = filteredWorks.filter(w => w.paymentStatus === 'Pago').reduce((acc, w) => acc + parseValue(w.value), 0)
    const pendingRevenue = totalRevenue - paidRevenue

    const headers = ["Métrica", "Valor"]
    const rows = [
      ["Total de Projetos", filteredWorks.length.toString()],
      ["Projetos Concluídos", filteredWorks.filter(w => w.paymentStatus === 'Pago').length.toString()],
      ["Projetos Pendentes", filteredWorks.filter(w => w.paymentStatus !== 'Pago').length.toString()],
      ["Receita Total", formatCurrency(totalRevenue)],
      ["Receita Recebida", formatCurrency(paidRevenue)],
      ["Receita Pendente", formatCurrency(pendingRevenue)],
      ["Ticket Médio", formatCurrency(totalRevenue / filteredWorks.length)],
      ["Taxa de Conclusão", `${((filteredWorks.filter(w => w.paymentStatus === 'Pago').length / filteredWorks.length) * 100).toFixed(1)}%`]
    ]

    generateCSV([headers, ...rows], "relatorio-financeiro")
  }

  // Função para obter dados mensais
  const getMonthlyReportData = () => {
    const monthlyData = new Map<string, { total: number, completed: number, revenue: number }>()

    filteredWorks.forEach(work => {
      const date = new Date(work.date)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      if (!monthlyData.has(monthKey)) {
        monthlyData.set(monthKey, { total: 0, completed: 0, revenue: 0 })
      }
      const data = monthlyData.get(monthKey)!
      data.total += 1
      data.revenue += parseValue(work.value)
      if (work.paymentStatus === 'Pago') {
        data.completed += 1
      }
    })

    return Array.from(monthlyData.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, data]) => ({
        typeWork: new Date(month + '-01').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }),
        template: `${data.total}`,
        developer: `${data.completed}/${data.total}`,
        value: data.revenue,
        url: formatCurrency(data.revenue / data.total)
      }))
  }

  const downloadMonthlyReport = () => {
    const monthlyData = new Map<string, { total: number, completed: number, revenue: number }>()

    filteredWorks.forEach(work => {
      const date = new Date(work.date)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      if (!monthlyData.has(monthKey)) {
        monthlyData.set(monthKey, { total: 0, completed: 0, revenue: 0 })
      }
      const data = monthlyData.get(monthKey)!
      data.total += 1
      data.revenue += parseValue(work.value)
      if (work.paymentStatus === 'Pago') {
        data.completed += 1
      }
    })

    const headers = ["Mês", "Total Projetos", "Concluídos", "Pendentes", "Receita", "Ticket Médio"]
    const rows = Array.from(monthlyData.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, data]) => [
        new Date(month + '-01').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }),
        data.total.toString(),
        data.completed.toString(),
        (data.total - data.completed).toString(),
        formatCurrency(data.revenue),
        formatCurrency(data.revenue / data.total)
      ])

    generateCSV([headers, ...rows], "relatorio-mensal")
  }

  // Função para obter dados por tipo
  const getTypeReportData = () => {
    const typeData = new Map<string, { count: number, revenue: number }>()

    filteredWorks.forEach(work => {
      if (!typeData.has(work.typeWork)) {
        typeData.set(work.typeWork, { count: 0, revenue: 0 })
      }
      const data = typeData.get(work.typeWork)!
      data.count += 1
      data.revenue += parseValue(work.value)
    })

    return Array.from(typeData.entries())
      .sort(([, a], [, b]) => b.count - a.count)
      .map(([type, data]) => ({
        typeWork: type,
        developer: `${data.count} (${((data.count / filteredWorks.length) * 100).toFixed(1)}%)`,
        value: data.revenue,
        url: formatCurrency(data.revenue / data.count)
      }))
  }

  const downloadTypeReport = () => {
    const typeData = new Map<string, { count: number, revenue: number }>()

    filteredWorks.forEach(work => {
      if (!typeData.has(work.typeWork)) {
        typeData.set(work.typeWork, { count: 0, revenue: 0 })
      }
      const data = typeData.get(work.typeWork)!
      data.count += 1
      data.revenue += parseValue(work.value)
    })

    const headers = ["Tipo", "Quantidade", "Percentual", "Receita", "Ticket Médio"]
    const rows = Array.from(typeData.entries())
      .sort(([, a], [, b]) => b.count - a.count)
      .map(([type, data]) => [
        type,
        data.count.toString(),
        `${((data.count / filteredWorks.length) * 100).toFixed(1)}%`,
        formatCurrency(data.revenue),
        formatCurrency(data.revenue / data.count)
      ])

    generateCSV([headers, ...rows], "relatorio-por-tipo")
  }

  // Função para obter dados de templates
  const getTemplateReportData = () => {
    const templateData = new Map<string, { count: number, revenue: number }>()

    filteredWorks.forEach(work => {
      const template = work.template || 'Não especificado'
      if (!templateData.has(template)) {
        templateData.set(template, { count: 0, revenue: 0 })
      }
      const data = templateData.get(template)!
      data.count += 1
      data.revenue += parseValue(work.value)
    })

    return Array.from(templateData.entries())
      .sort(([, a], [, b]) => b.count - a.count)
      .map(([template, data]) => ({
        typeWork: template,
        developer: `${data.count}`,
        url: `${((data.count / filteredWorks.length) * 100).toFixed(1)}%`,
        value: data.revenue,
        template: formatCurrency(data.revenue / data.count)
      }))
  }

  const downloadTemplateReport = () => {
    const templateData = new Map<string, { count: number, revenue: number }>()

    filteredWorks.forEach(work => {
      const template = work.template || 'Não especificado'
      if (!templateData.has(template)) {
        templateData.set(template, { count: 0, revenue: 0 })
      }
      const data = templateData.get(template)!
      data.count += 1
      data.revenue += parseValue(work.value)
    })

    const headers = ["Template", "Quantidade", "Percentual", "Receita", "Ticket Médio"]
    const rows = Array.from(templateData.entries())
      .sort(([, a], [, b]) => b.count - a.count)
      .map(([template, data]) => [
        template,
        data.count.toString(),
        `${((data.count / filteredWorks.length) * 100).toFixed(1)}%`,
        formatCurrency(data.revenue),
        formatCurrency(data.revenue / data.count)
      ])

    generateCSV([headers, ...rows], "relatorio-templates")
  }

  const reports = [
    {
      id: 'complete',
      title: 'Relatório Completo',
      description: 'Todos os projetos com informações detalhadas',
      icon: FileText,
      color: 'text-blue-600 bg-blue-100 dark:bg-blue-950',
      action: downloadCompleteReport,
      getData: getCompleteReportData
    },
    {
      id: 'productivity',
      title: 'Produtividade por Desenvolvedor',
      description: 'Análise de entregas e performance da equipe',
      icon: Users,
      color: 'text-green-600 bg-green-100 dark:bg-green-950',
      action: downloadProductivityReport,
      getData: getProductivityReportData
    },
    {
      id: 'financial',
      title: 'Resumo Financeiro',
      description: 'Métricas financeiras e receitas',
      icon: DollarSign,
      color: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-950',
      action: downloadFinancialReport,
      getData: getFinancialReportData
    },
    {
      id: 'monthly',
      title: 'Relatório Mensal',
      description: 'Evolução de projetos mês a mês',
      icon: Calendar,
      color: 'text-purple-600 bg-purple-100 dark:bg-purple-950',
      action: downloadMonthlyReport,
      getData: getMonthlyReportData
    },
    {
      id: 'type',
      title: 'Análise por Tipo',
      description: 'Distribuição entre Sites e Landing Pages',
      icon: Package,
      color: 'text-orange-600 bg-orange-100 dark:bg-orange-950',
      action: downloadTypeReport,
      getData: getTypeReportData
    },
    {
      id: 'template',
      title: 'Análise de Templates',
      description: 'Templates Envato mais utilizados',
      icon: TrendingUp,
      color: 'text-cyan-600 bg-cyan-100 dark:bg-cyan-950',
      action: downloadTemplateReport,
      getData: getTemplateReportData
    }
  ]

  return (
    <div className="space-y-6 pb-6">
      <PageHeader
        title="Relatórios e Exportações"
        description="Gere relatórios personalizados e exporte dados em formato CSV para análise externa."
      />

      {/* Filtros */}
      <div className="rounded-xl border bg-card shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-5 w-5 text-muted-foreground" />
          <h3 className="text-lg font-semibold">Filtros de Dados</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-6">
          Aplique filtros para gerar relatórios personalizados. Os filtros afetam todos os relatórios abaixo.
        </p>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div className="space-y-2">
            <label className="text-sm font-medium">Data Início</label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Data Fim</label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Tipo</label>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {SITE_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Status</label>
            <Select value={filterPayment} onValueChange={setFilterPayment}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {PAYMENT_STATUS.map((status) => (
                  <SelectItem key={status} value={status}>{status}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Desenvolvedor</label>
            <Select value={filterDeveloper} onValueChange={setFilterDeveloper}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {developers.map((dev) => (
                  <SelectItem key={dev} value={dev}>{dev}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{filteredWorks.length}</span> de {works.length} projetos selecionados
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setStartDate('')
              setEndDate('')
              setFilterType('all')
              setFilterPayment('all')
              setFilterDeveloper('all')
            }}
          >
            Limpar Filtros
          </Button>
        </div>
      </div>

      {/* Relatórios Disponíveis */}
      <div>
        <h3 className="text-lg font-bold mb-4">Relatórios Disponíveis</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {reports.map((report) => (
            <Card key={report.id} className="p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-lg ${report.color}`}>
                  <report.icon className="h-6 w-6" />
                </div>
              </div>
              <h4 className="font-bold mb-2">{report.title}</h4>
              <p className="text-sm text-muted-foreground mb-4">{report.description}</p>
              <div className="space-y-2">
                <Button
                  onClick={() => setPreviewReport(report)}
                  variant="outline"
                  className="w-full"
                  disabled={filteredWorks.length === 0}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Visualizar
                </Button>
                <div className="flex gap-2">
                  <Button
                    onClick={report.action}
                    variant="outline"
                    className="flex-1"
                    disabled={filteredWorks.length === 0}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    CSV
                  </Button>
                  <Button
                    onClick={() => {
                      generatePDF(filteredWorks, report.title)
                      toast.success('PDF gerado com sucesso!')
                    }}
                    className="flex-1"
                    disabled={filteredWorks.length === 0}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    PDF
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Informações */}
      <div className="rounded-xl border bg-muted/50 p-6">
        <h4 className="font-semibold mb-2">ℹ️ Sobre os Relatórios</h4>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• Clique em "Visualizar" para ver o relatório antes de exportar</li>
          <li>• Todos os relatórios são exportados em formato CSV (compatível com Excel) ou PDF</li>
          <li>• Use os filtros acima para personalizar os dados exportados</li>
          <li>• Os arquivos incluem a data de geração no nome</li>
          <li>• Codificação UTF-8 com BOM para suporte a caracteres especiais</li>
        </ul>
      </div>

      {/* Preview Dialog */}
      {previewReport && previewReport.id === 'complete' && (
        <ReportPreview
          isOpen={true}
          onClose={() => setPreviewReport(null)}
          works={previewReport.getData()}
          title={previewReport.title}
          onDownloadCSV={() => {
            previewReport.action()
            setPreviewReport(null)
          }}
        />
      )}
      
      {previewReport && previewReport.id !== 'complete' && (
        <CustomReportPreview
          isOpen={true}
          onClose={() => setPreviewReport(null)}
          title={previewReport.title}
          data={previewReport.getData()}
          columns={getColumnsForReport(previewReport.id)}
          onDownloadCSV={() => {
            previewReport.action()
            setPreviewReport(null)
          }}
        />
      )}
    </div>
  )
}

export default Relatorios
