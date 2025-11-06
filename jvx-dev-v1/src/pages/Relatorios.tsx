import * as React from 'react'
import { Download, FileText, Filter, TrendingUp, DollarSign, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { PageHeader } from '@/components/PageHeader'
import { useWorks } from '@/contexts/WorksContext'
import { SITE_TYPES, PAYMENT_STATUS } from '@/lib/constants'
import { parseValue, formatCurrency, formatDate } from '@/lib/utils'
import { toast } from 'sonner'

function Relatorios() {
  const { works } = useWorks()
  const [startDate, setStartDate] = React.useState('')
  const [endDate, setEndDate] = React.useState('')
  const [filterType, setFilterType] = React.useState('all')
  const [filterPayment, setFilterPayment] = React.useState('all')
  const [filterDeveloper, setFilterDeveloper] = React.useState('all')

  // Lista de desenvolvedores únicos
  const developers = React.useMemo(() => {
    const devs = new Set(works.map(w => w.developer).filter(Boolean) as string[])
    return Array.from(devs).sort()
  }, [works])

  // Filtrar projetos
  const filteredWorks = React.useMemo(() => {
    return works.filter(work => {
      const workDate = new Date(work.delivery_date)
      const start = startDate ? new Date(startDate) : null
      const end = endDate ? new Date(endDate) : null

      const matchesDate = (!start || workDate >= start) && (!end || workDate <= end)
      const matchesType = filterType === 'all' || work.site_type === filterType
      const matchesPayment = filterPayment === 'all' || work.payment_status === filterPayment
      const matchesDev = filterDeveloper === 'all' || work.developer === filterDeveloper

      return matchesDate && matchesType && matchesPayment && matchesDev
    })
  }, [works, startDate, endDate, filterType, filterPayment, filterDeveloper])

  // ============================================
  // CÁLCULOS FINANCEIROS PRECISOS
  // ============================================

  const financialMetrics = React.useMemo(() => {
    const totalProjects = filteredWorks.length
    const completedProjects = filteredWorks.filter(w => w.status === 'Entregue').length
    const pendingProjects = totalProjects - completedProjects
    
    const paidProjects = filteredWorks.filter(w => w.payment_status === 'Pago').length
    const unpaidProjects = totalProjects - paidProjects

    // Receita total (soma de TODOS os projetos)
    const totalRevenue = filteredWorks.reduce((sum, w) => sum + parseValue(w.value), 0)
    
    // Receita recebida (apenas projetos PAGOS)
    const paidRevenue = filteredWorks
      .filter(w => w.payment_status === 'Pago')
      .reduce((sum, w) => sum + parseValue(w.value), 0)
    
    // Receita pendente (projetos NÃO PAGOS)
    const pendingRevenue = filteredWorks
      .filter(w => w.payment_status !== 'Pago')
      .reduce((sum, w) => sum + parseValue(w.value), 0)

    // Ticket médio
    const averageTicket = totalProjects > 0 ? totalRevenue / totalProjects : 0

    // Taxa de conclusão
    const completionRate = totalProjects > 0 ? (completedProjects / totalProjects) * 100 : 0

    // Taxa de pagamento
    const paymentRate = totalProjects > 0 ? (paidProjects / totalProjects) * 100 : 0

    return {
      totalProjects,
      completedProjects,
      pendingProjects,
      paidProjects,
      unpaidProjects,
      totalRevenue,
      paidRevenue,
      pendingRevenue,
      averageTicket,
      completionRate,
      paymentRate
    }
  }, [filteredWorks])

  // ============================================
  // ANÁLISE POR DESENVOLVEDOR
  // ============================================

  const developerStats = React.useMemo(() => {
    const stats = new Map<string, {
      total: number
      completed: number
      paid: number
      totalRevenue: number
      paidRevenue: number
      pendingRevenue: number
    }>()

    filteredWorks.forEach(work => {
      const dev = work.developer || 'Não atribuído'
      if (!stats.has(dev)) {
        stats.set(dev, {
          total: 0,
          completed: 0,
          paid: 0,
          totalRevenue: 0,
          paidRevenue: 0,
          pendingRevenue: 0
        })
      }

      const devStats = stats.get(dev)!
      const value = parseValue(work.value)

      devStats.total += 1
      devStats.totalRevenue += value

      if (work.status === 'Entregue') {
        devStats.completed += 1
      }

      if (work.payment_status === 'Pago') {
        devStats.paid += 1
        devStats.paidRevenue += value
      } else {
        devStats.pendingRevenue += value
      }
    })

    return Array.from(stats.entries())
      .map(([developer, data]) => ({
        developer,
        ...data,
        averageTicket: data.total > 0 ? data.totalRevenue / data.total : 0,
        completionRate: data.total > 0 ? (data.completed / data.total) * 100 : 0,
        paymentRate: data.total > 0 ? (data.paid / data.total) * 100 : 0
      }))
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
  }, [filteredWorks])

  // ============================================
  // ANÁLISE POR TIPO DE PROJETO
  // ============================================

  const typeStats = React.useMemo(() => {
    const stats = new Map<string, {
      count: number
      revenue: number
      paid: number
      paidRevenue: number
    }>()

    filteredWorks.forEach(work => {
      const type = work.site_type
      if (!stats.has(type)) {
        stats.set(type, { count: 0, revenue: 0, paid: 0, paidRevenue: 0 })
      }

      const typeData = stats.get(type)!
      const value = parseValue(work.value)

      typeData.count += 1
      typeData.revenue += value

      if (work.payment_status === 'Pago') {
        typeData.paid += 1
        typeData.paidRevenue += value
      }
    })

    return Array.from(stats.entries())
      .map(([type, data]) => ({
        type,
        ...data,
        percentage: filteredWorks.length > 0 ? (data.count / filteredWorks.length) * 100 : 0,
        averageTicket: data.count > 0 ? data.revenue / data.count : 0
      }))
      .sort((a, b) => b.count - a.count)
  }, [filteredWorks])

  // ============================================
  // ANÁLISE MENSAL
  // ============================================

  const monthlyStats = React.useMemo(() => {
    const stats = new Map<string, {
      total: number
      completed: number
      paid: number
      revenue: number
      paidRevenue: number
    }>()

    filteredWorks.forEach(work => {
      const date = new Date(work.delivery_date)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      
      if (!stats.has(monthKey)) {
        stats.set(monthKey, { total: 0, completed: 0, paid: 0, revenue: 0, paidRevenue: 0 })
      }

      const monthData = stats.get(monthKey)!
      const value = parseValue(work.value)

      monthData.total += 1
      monthData.revenue += value

      if (work.status === 'Entregue') {
        monthData.completed += 1
      }

      if (work.payment_status === 'Pago') {
        monthData.paid += 1
        monthData.paidRevenue += value
      }
    })

    return Array.from(stats.entries())
      .map(([month, data]) => ({
        month: new Date(month + '-01').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }),
        monthKey: month,
        ...data,
        averageTicket: data.total > 0 ? data.revenue / data.total : 0
      }))
      .sort((a, b) => a.monthKey.localeCompare(b.monthKey))
  }, [filteredWorks])

  // ============================================
  // EXPORTAR CSV
  // ============================================

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
    toast.success(`Relatório exportado com sucesso!`)
  }

  const exportFinancialReport = () => {
    const headers = ["Métrica", "Valor"]
    const rows = [
      ["Total de Projetos", financialMetrics.totalProjects.toString()],
      ["Projetos Concluídos", financialMetrics.completedProjects.toString()],
      ["Projetos Pendentes", financialMetrics.pendingProjects.toString()],
      ["Projetos Pagos", financialMetrics.paidProjects.toString()],
      ["Projetos Não Pagos", financialMetrics.unpaidProjects.toString()],
      ["", ""],
      ["Receita Total", formatCurrency(financialMetrics.totalRevenue)],
      ["Receita Recebida", formatCurrency(financialMetrics.paidRevenue)],
      ["Receita Pendente", formatCurrency(financialMetrics.pendingRevenue)],
      ["Ticket Médio", formatCurrency(financialMetrics.averageTicket)],
      ["", ""],
      ["Taxa de Conclusão", `${financialMetrics.completionRate.toFixed(1)}%`],
      ["Taxa de Pagamento", `${financialMetrics.paymentRate.toFixed(1)}%`]
    ]
    generateCSV([headers, ...rows], "relatorio-financeiro")
  }

  const exportDeveloperReport = () => {
    const headers = ["Desenvolvedor", "Total", "Concluídos", "Pagos", "Receita Total", "Receita Recebida", "Receita Pendente", "Ticket Médio", "Taxa Conclusão", "Taxa Pagamento"]
    const rows = developerStats.map(dev => [
      dev.developer,
      dev.total.toString(),
      dev.completed.toString(),
      dev.paid.toString(),
      formatCurrency(dev.totalRevenue),
      formatCurrency(dev.paidRevenue),
      formatCurrency(dev.pendingRevenue),
      formatCurrency(dev.averageTicket),
      `${dev.completionRate.toFixed(1)}%`,
      `${dev.paymentRate.toFixed(1)}%`
    ])
    generateCSV([headers, ...rows], "relatorio-desenvolvedores")
  }

  const exportTypeReport = () => {
    const headers = ["Tipo", "Quantidade", "Percentual", "Receita Total", "Receita Paga", "Ticket Médio"]
    const rows = typeStats.map(type => [
      type.type,
      type.count.toString(),
      `${type.percentage.toFixed(1)}%`,
      formatCurrency(type.revenue),
      formatCurrency(type.paidRevenue),
      formatCurrency(type.averageTicket)
    ])
    generateCSV([headers, ...rows], "relatorio-tipos")
  }

  const exportMonthlyReport = () => {
    const headers = ["Mês", "Total", "Concluídos", "Pagos", "Receita Total", "Receita Paga", "Ticket Médio"]
    const rows = monthlyStats.map(month => [
      month.month,
      month.total.toString(),
      month.completed.toString(),
      month.paid.toString(),
      formatCurrency(month.revenue),
      formatCurrency(month.paidRevenue),
      formatCurrency(month.averageTicket)
    ])
    generateCSV([headers, ...rows], "relatorio-mensal")
  }

  const exportCompleteReport = () => {
    const headers = ["#", "Tipo", "Desenvolvedor", "Valor", "Status Entrega", "Status Pagamento", "Data", "Domínio", "Observações"]
    const rows = filteredWorks.map((work, index) => [
      (index + 1).toString(),
      work.site_type,
      work.developer || "-",
      formatCurrency(parseValue(work.value)),
      work.status,
      work.payment_status,
      formatDate(work.delivery_date),
      work.domain,
      work.observations || "-"
    ])
    generateCSV([headers, ...rows], "relatorio-completo")
  }

  return (
    <div className="space-y-6 pb-6">
      <PageHeader
        title="Relatórios Financeiros"
        description="Análise detalhada e precisa de receitas, pagamentos e performance do projeto."
      />

      {/* Filtros */}
      <div className="rounded-xl border bg-card shadow-sm">
        <div className="border-b bg-muted/10">
          <div className="p-4 space-y-3">
            {/* Linha 1: Filtros de Data e Contador */}
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-col sm:flex-row gap-2 flex-1">
                <div className="flex items-center gap-2">
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="h-10"
                  />
                  <span className="text-xs text-muted-foreground">até</span>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="h-10"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <div className="px-3 py-1.5 rounded-md bg-primary/10 text-primary text-sm font-medium whitespace-nowrap">
                  {filteredWorks.length} de {works.length} projeto(s)
                </div>
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
                  <Filter className="h-4 w-4 mr-1.5" />
                  Limpar
                </Button>
              </div>
            </div>

            {/* Linha 2: Filtros Principais */}
            <div className="flex flex-wrap gap-3">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Tipo de Projeto" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Tipos</SelectItem>
                  {SITE_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filterDeveloper} onValueChange={setFilterDeveloper}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Desenvolvedor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Desenvolvedores</SelectItem>
                  {developers.map((dev) => (
                    <SelectItem key={dev} value={dev}>{dev}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filterPayment} onValueChange={setFilterPayment}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Status de Pagamento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Pagamentos</SelectItem>
                  {PAYMENT_STATUS.map((status) => (
                    <SelectItem key={status} value={status}>{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Resumo Financeiro */}
      <div>
        <h3 className="text-lg font-bold mb-4">Resumo Financeiro</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Receita Total</p>
              <DollarSign className="h-5 w-5 text-blue-600" />
            </div>
            <p className="text-2xl font-bold">{formatCurrency(financialMetrics.totalRevenue)}</p>
            <p className="text-xs text-muted-foreground mt-1">{financialMetrics.totalProjects} projetos</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Receita Recebida</p>
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(financialMetrics.paidRevenue)}</p>
            <p className="text-xs text-muted-foreground mt-1">{financialMetrics.paidProjects} pagos ({financialMetrics.paymentRate.toFixed(1)}%)</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Receita Pendente</p>
              <Package className="h-5 w-5 text-orange-600" />
            </div>
            <p className="text-2xl font-bold text-orange-600">{formatCurrency(financialMetrics.pendingRevenue)}</p>
            <p className="text-xs text-muted-foreground mt-1">{financialMetrics.unpaidProjects} não pagos</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Ticket Médio</p>
              <FileText className="h-5 w-5 text-purple-600" />
            </div>
            <p className="text-2xl font-bold">{formatCurrency(financialMetrics.averageTicket)}</p>
            <p className="text-xs text-muted-foreground mt-1">Por projeto</p>
          </Card>
        </div>

        <div className="mt-4">
          <Button onClick={exportFinancialReport} className="w-full sm:w-auto">
            <Download className="h-4 w-4 mr-2" />
            Exportar Resumo Financeiro
          </Button>
        </div>
      </div>

      {/* Por Desenvolvedor */}
      <div>
        <h3 className="text-lg font-bold mb-4">Análise por Desenvolvedor</h3>
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold">Desenvolvedor</th>
                  <th className="text-right px-4 py-3 font-semibold">Total</th>
                  <th className="text-right px-4 py-3 font-semibold">Pagos</th>
                  <th className="text-right px-4 py-3 font-semibold">Receita Total</th>
                  <th className="text-right px-4 py-3 font-semibold">Recebida</th>
                  <th className="text-right px-4 py-3 font-semibold">Pendente</th>
                  <th className="text-right px-4 py-3 font-semibold">Ticket Médio</th>
                </tr>
              </thead>
              <tbody>
                {developerStats.map((dev, index) => (
                  <tr key={index} className="border-b hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium">{dev.developer}</td>
                    <td className="text-right px-4 py-3">{dev.total}</td>
                    <td className="text-right px-4 py-3 text-green-600">{dev.paid}</td>
                    <td className="text-right px-4 py-3 font-semibold">{formatCurrency(dev.totalRevenue)}</td>
                    <td className="text-right px-4 py-3 text-green-600">{formatCurrency(dev.paidRevenue)}</td>
                    <td className="text-right px-4 py-3 text-orange-600">{formatCurrency(dev.pendingRevenue)}</td>
                    <td className="text-right px-4 py-3">{formatCurrency(dev.averageTicket)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <div className="mt-4">
          <Button onClick={exportDeveloperReport} variant="outline" className="w-full sm:w-auto">
            <Download className="h-4 w-4 mr-2" />
            Exportar Análise por Desenvolvedor
          </Button>
        </div>
      </div>

      {/* Por Tipo */}
      <div>
        <h3 className="text-lg font-bold mb-4">Análise por Tipo de Projeto</h3>
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold">Tipo</th>
                  <th className="text-right px-4 py-3 font-semibold">Quantidade</th>
                  <th className="text-right px-4 py-3 font-semibold">%</th>
                  <th className="text-right px-4 py-3 font-semibold">Receita Total</th>
                  <th className="text-right px-4 py-3 font-semibold">Receita Paga</th>
                  <th className="text-right px-4 py-3 font-semibold">Ticket Médio</th>
                </tr>
              </thead>
              <tbody>
                {typeStats.map((type, index) => (
                  <tr key={index} className="border-b hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium">{type.type}</td>
                    <td className="text-right px-4 py-3">{type.count}</td>
                    <td className="text-right px-4 py-3">{type.percentage.toFixed(1)}%</td>
                    <td className="text-right px-4 py-3 font-semibold">{formatCurrency(type.revenue)}</td>
                    <td className="text-right px-4 py-3 text-green-600">{formatCurrency(type.paidRevenue)}</td>
                    <td className="text-right px-4 py-3">{formatCurrency(type.averageTicket)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <div className="mt-4">
          <Button onClick={exportTypeReport} variant="outline" className="w-full sm:w-auto">
            <Download className="h-4 w-4 mr-2" />
            Exportar Análise por Tipo
          </Button>
        </div>
      </div>

      {/* Mensal */}
      <div>
        <h3 className="text-lg font-bold mb-4">Análise Mensal</h3>
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold">Mês</th>
                  <th className="text-right px-4 py-3 font-semibold">Total</th>
                  <th className="text-right px-4 py-3 font-semibold">Concluídos</th>
                  <th className="text-right px-4 py-3 font-semibold">Pagos</th>
                  <th className="text-right px-4 py-3 font-semibold">Receita Total</th>
                  <th className="text-right px-4 py-3 font-semibold">Receita Paga</th>
                  <th className="text-right px-4 py-3 font-semibold">Ticket Médio</th>
                </tr>
              </thead>
              <tbody>
                {monthlyStats.map((month, index) => (
                  <tr key={index} className="border-b hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium">{month.month}</td>
                    <td className="text-right px-4 py-3">{month.total}</td>
                    <td className="text-right px-4 py-3">{month.completed}</td>
                    <td className="text-right px-4 py-3 text-green-600">{month.paid}</td>
                    <td className="text-right px-4 py-3 font-semibold">{formatCurrency(month.revenue)}</td>
                    <td className="text-right px-4 py-3 text-green-600">{formatCurrency(month.paidRevenue)}</td>
                    <td className="text-right px-4 py-3">{formatCurrency(month.averageTicket)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <div className="mt-4">
          <Button onClick={exportMonthlyReport} variant="outline" className="w-full sm:w-auto">
            <Download className="h-4 w-4 mr-2" />
            Exportar Análise Mensal
          </Button>
        </div>
      </div>

      {/* Relatório Completo */}
      <div>
        <h3 className="text-lg font-bold mb-4">Relatório Completo</h3>
        <Card className="p-6">
          <p className="text-sm text-muted-foreground mb-4">
            Exporte todos os {filteredWorks.length} projetos selecionados com informações detalhadas.
          </p>
          <Button onClick={exportCompleteReport} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar Relatório Completo
          </Button>
        </Card>
      </div>

      {/* Informações */}
      <Card className="p-6 bg-muted/50">
        <h4 className="font-semibold mb-2">ℹ️ Sobre os Cálculos</h4>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• <strong>Receita Total:</strong> Soma de todos os valores dos projetos filtrados</li>
          <li>• <strong>Receita Recebida:</strong> Soma apenas dos projetos com status "Pago"</li>
          <li>• <strong>Receita Pendente:</strong> Soma dos projetos com status diferente de "Pago"</li>
          <li>• <strong>Ticket Médio:</strong> Receita total dividida pelo número de projetos</li>
          <li>• <strong>Taxa de Pagamento:</strong> Percentual de projetos pagos em relação ao total</li>
          <li>• Todos os cálculos são precisos e validados para uso financeiro</li>
        </ul>
      </Card>
    </div>
  )
}

export default Relatorios
