import * as React from 'react'
import { PageHeader } from '@/components/PageHeader'
import { useWorks } from '@/contexts/WorksContext'
import { Card } from '@/components/ui/card'
import { 
  TrendingUp, 
  DollarSign, 
  Package, 
  Users, 
  CheckCircle,
  Clock,
  Calendar,
  BarChart3,
  PieChart as PieChartIcon
} from 'lucide-react'
import { parseValue, formatCurrency } from '@/lib/utils'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts'

function Analises() {
  const { works, loading } = useWorks()

  // ============================================
  // MÉTRICAS PRINCIPAIS
  // ============================================

  const mainMetrics = React.useMemo(() => {
    const totalProjects = works.length
    const deliveredProjects = works.filter(w => w.status === 'Entregue').length
    const pendingProjects = totalProjects - deliveredProjects
    const paidProjects = works.filter(w => w.payment_status === 'Pago').length
    const unpaidProjects = totalProjects - paidProjects

    const totalRevenue = works.reduce((sum, w) => sum + parseValue(w.value), 0)
    const paidRevenue = works
      .filter(w => w.payment_status === 'Pago')
      .reduce((sum, w) => sum + parseValue(w.value), 0)
    const pendingRevenue = totalRevenue - paidRevenue

    const averageTicket = totalProjects > 0 ? totalRevenue / totalProjects : 0
    const deliveryRate = totalProjects > 0 ? (deliveredProjects / totalProjects) * 100 : 0
    const paymentRate = totalProjects > 0 ? (paidProjects / totalProjects) * 100 : 0

    const activeDevelopers = new Set(works.map(w => w.developer).filter(Boolean)).size

    return {
      totalProjects,
      deliveredProjects,
      pendingProjects,
      paidProjects,
      unpaidProjects,
      totalRevenue,
      paidRevenue,
      pendingRevenue,
      averageTicket,
      deliveryRate,
      paymentRate,
      activeDevelopers
    }
  }, [works])

  // ============================================
  // ANÁLISE MENSAL (Últimos 6 meses)
  // ============================================

  const monthlyData = React.useMemo(() => {
    const monthlyMap = new Map<string, {
      total: number
      delivered: number
      paid: number
      revenue: number
      paidRevenue: number
    }>()

    works.forEach(work => {
      const date = new Date(work.delivery_date)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      
      if (!monthlyMap.has(monthKey)) {
        monthlyMap.set(monthKey, { total: 0, delivered: 0, paid: 0, revenue: 0, paidRevenue: 0 })
      }

      const data = monthlyMap.get(monthKey)!
      const value = parseValue(work.value)

      data.total += 1
      data.revenue += value

      if (work.status === 'Entregue') {
        data.delivered += 1
      }

      if (work.payment_status === 'Pago') {
        data.paid += 1
        data.paidRevenue += value
      }
    })

    return Array.from(monthlyMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([month, data]) => ({
        month: new Date(month + '-01').toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }),
        monthKey: month,
        total: data.total,
        entregues: data.delivered,
        pagos: data.paid,
        receita: data.revenue,
        receitaPaga: data.paidRevenue
      }))
  }, [works])

  // ============================================
  // ANÁLISE POR DESENVOLVEDOR (Top 10)
  // ============================================

  const developerData = React.useMemo(() => {
    const devMap = new Map<string, {
      total: number
      delivered: number
      paid: number
      revenue: number
      paidRevenue: number
    }>()

    works.forEach(work => {
      const dev = work.developer || 'Não atribuído'
      
      if (!devMap.has(dev)) {
        devMap.set(dev, { total: 0, delivered: 0, paid: 0, revenue: 0, paidRevenue: 0 })
      }

      const data = devMap.get(dev)!
      const value = parseValue(work.value)

      data.total += 1
      data.revenue += value

      if (work.status === 'Entregue') {
        data.delivered += 1
      }

      if (work.payment_status === 'Pago') {
        data.paid += 1
        data.paidRevenue += value
      }
    })

    return Array.from(devMap.entries())
      .map(([name, data]) => ({
        name: name.length > 15 ? name.substring(0, 15) + '...' : name,
        fullName: name,
        total: data.total,
        entregues: data.delivered,
        pagos: data.paid,
        receita: data.revenue,
        receitaPaga: data.paidRevenue,
        ticketMedio: data.total > 0 ? data.revenue / data.total : 0
      }))
      .sort((a, b) => b.receita - a.receita)
      .slice(0, 10)
  }, [works])

  // ============================================
  // ANÁLISE POR TIPO DE PROJETO
  // ============================================

  const typeData = React.useMemo(() => {
    const typeMap = new Map<string, { count: number, revenue: number }>()

    works.forEach(work => {
      const type = work.site_type
      
      if (!typeMap.has(type)) {
        typeMap.set(type, { count: 0, revenue: 0 })
      }

      const data = typeMap.get(type)!
      data.count += 1
      data.revenue += parseValue(work.value)
    })

    return Array.from(typeMap.entries())
      .map(([name, data]) => ({
        name,
        value: data.count,
        receita: data.revenue,
        percentage: works.length > 0 ? (data.count / works.length) * 100 : 0
      }))
      .sort((a, b) => b.value - a.value)
  }, [works])

  // ============================================
  // CORES PARA GRÁFICOS
  // ============================================

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

  // ============================================
  // TOOLTIPS CUSTOMIZADOS
  // ============================================

  const MonthlyTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-card border rounded-lg shadow-lg p-3">
          <p className="font-semibold text-sm mb-2">{data.month}</p>
          <p className="text-xs">Total: {data.total} projetos</p>
          <p className="text-xs text-green-600">Entregues: {data.entregues}</p>
          <p className="text-xs text-blue-600">Pagos: {data.pagos}</p>
          <p className="text-xs font-semibold mt-1">Receita: {formatCurrency(data.receita)}</p>
          <p className="text-xs text-green-600">Recebida: {formatCurrency(data.receitaPaga)}</p>
        </div>
      )
    }
    return null
  }

  const DeveloperTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-card border rounded-lg shadow-lg p-3">
          <p className="font-semibold text-sm mb-2">{data.fullName}</p>
          <p className="text-xs">Total: {data.total} projetos</p>
          <p className="text-xs text-green-600">Entregues: {data.entregues}</p>
          <p className="text-xs text-blue-600">Pagos: {data.pagos}</p>
          <p className="text-xs font-semibold mt-1">Receita: {formatCurrency(data.receita)}</p>
          <p className="text-xs text-green-600">Recebida: {formatCurrency(data.receitaPaga)}</p>
          <p className="text-xs text-muted-foreground">Ticket Médio: {formatCurrency(data.ticketMedio)}</p>
        </div>
      )
    }
    return null
  }

  const TypeTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0]
      return (
        <div className="bg-card border rounded-lg shadow-lg p-3">
          <p className="font-semibold text-sm mb-2">{data.name}</p>
          <p className="text-xs">Quantidade: {data.value} projetos</p>
          <p className="text-xs">Percentual: {data.payload.percentage.toFixed(1)}%</p>
          <p className="text-xs font-semibold mt-1">Receita: {formatCurrency(data.payload.receita)}</p>
        </div>
      )
    }
    return null
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Carregando análises...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-6">
      <PageHeader
        title="Análises e Gráficos"
        description="Visualize métricas, tendências e performance através de gráficos interativos."
      />

      {/* Cards de Métricas Principais */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-950">
              <Package className="h-5 w-5" />
            </div>
          </div>
          <p className="text-sm text-muted-foreground mb-1">Total de Projetos</p>
          <p className="text-2xl font-bold">{mainMetrics.totalProjects}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {mainMetrics.activeDevelopers} desenvolvedores
          </p>
        </Card>

        <Card className="p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 rounded-lg bg-green-100 text-green-600 dark:bg-green-950">
              <CheckCircle className="h-5 w-5" />
            </div>
          </div>
          <p className="text-sm text-muted-foreground mb-1">Taxa de Entrega</p>
          <p className="text-2xl font-bold text-green-600">{mainMetrics.deliveryRate.toFixed(1)}%</p>
          <p className="text-xs text-muted-foreground mt-1">
            {mainMetrics.deliveredProjects} de {mainMetrics.totalProjects} entregues
          </p>
        </Card>

        <Card className="p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-950">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
          <p className="text-sm text-muted-foreground mb-1">Taxa de Pagamento</p>
          <p className="text-2xl font-bold text-emerald-600">{mainMetrics.paymentRate.toFixed(1)}%</p>
          <p className="text-xs text-muted-foreground mt-1">
            {mainMetrics.paidProjects} de {mainMetrics.totalProjects} pagos
          </p>
        </Card>

        <Card className="p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 rounded-lg bg-purple-100 text-purple-600 dark:bg-purple-950">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <p className="text-sm text-muted-foreground mb-1">Ticket Médio</p>
          <p className="text-2xl font-bold">{formatCurrency(mainMetrics.averageTicket)}</p>
          <p className="text-xs text-muted-foreground mt-1">Por projeto</p>
        </Card>
      </div>

      {/* Cards de Receita */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        <Card className="p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-950">
              <BarChart3 className="h-5 w-5" />
            </div>
          </div>
          <p className="text-sm text-muted-foreground mb-1">Receita Total</p>
          <p className="text-2xl font-bold">{formatCurrency(mainMetrics.totalRevenue)}</p>
          <p className="text-xs text-muted-foreground mt-1">Todos os projetos</p>
        </Card>

        <Card className="p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 rounded-lg bg-green-100 text-green-600 dark:bg-green-950">
              <CheckCircle className="h-5 w-5" />
            </div>
          </div>
          <p className="text-sm text-muted-foreground mb-1">Receita Recebida</p>
          <p className="text-2xl font-bold text-green-600">{formatCurrency(mainMetrics.paidRevenue)}</p>
          <p className="text-xs text-muted-foreground mt-1">{mainMetrics.paidProjects} projetos pagos</p>
        </Card>

        <Card className="p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 rounded-lg bg-orange-100 text-orange-600 dark:bg-orange-950">
              <Clock className="h-5 w-5" />
            </div>
          </div>
          <p className="text-sm text-muted-foreground mb-1">Receita Pendente</p>
          <p className="text-2xl font-bold text-orange-600">{formatCurrency(mainMetrics.pendingRevenue)}</p>
          <p className="text-xs text-muted-foreground mt-1">{mainMetrics.unpaidProjects} projetos não pagos</p>
        </Card>
      </div>

      {/* Gráfico de Evolução Mensal */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="h-5 w-5 text-primary" />
          <div>
            <h3 className="text-lg font-bold">Evolução Mensal</h3>
            <p className="text-sm text-muted-foreground">Projetos e receita dos últimos 6 meses</p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="month" className="text-xs" />
            <YAxis className="text-xs" />
            <Tooltip content={<MonthlyTooltip />} />
            <Legend />
            <Bar dataKey="total" fill="#3b82f6" name="Total" radius={[4, 4, 0, 0]} />
            <Bar dataKey="entregues" fill="#10b981" name="Entregues" radius={[4, 4, 0, 0]} />
            <Bar dataKey="pagos" fill="#8b5cf6" name="Pagos" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Grid de Gráficos */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Performance por Desenvolvedor */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Users className="h-5 w-5 text-primary" />
            <div>
              <h3 className="text-lg font-bold">Top 10 Desenvolvedores</h3>
              <p className="text-sm text-muted-foreground">Ranking por receita gerada</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={developerData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis type="number" className="text-xs" />
              <YAxis dataKey="name" type="category" className="text-xs" width={100} />
              <Tooltip content={<DeveloperTooltip />} />
              <Legend />
              <Bar dataKey="total" fill="#3b82f6" name="Total" />
              <Bar dataKey="pagos" fill="#10b981" name="Pagos" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Distribuição por Tipo */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <PieChartIcon className="h-5 w-5 text-primary" />
            <div>
              <h3 className="text-lg font-bold">Distribuição por Tipo</h3>
              <p className="text-sm text-muted-foreground">Tipos de projetos mais comuns</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={typeData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percentage }) => `${name}: ${percentage.toFixed(0)}%`}
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
              >
                {typeData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<TypeTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Resumo Estatístico */}
      <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <h3 className="text-lg font-bold mb-4">Resumo Estatístico</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-sm text-muted-foreground">Projetos Entregues</p>
            <p className="text-xl font-bold text-green-600">{mainMetrics.deliveredProjects}</p>
            <p className="text-xs text-muted-foreground">{mainMetrics.deliveryRate.toFixed(1)}% do total</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Projetos Pendentes</p>
            <p className="text-xl font-bold text-orange-600">{mainMetrics.pendingProjects}</p>
            <p className="text-xs text-muted-foreground">{(100 - mainMetrics.deliveryRate).toFixed(1)}% do total</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Projetos Pagos</p>
            <p className="text-xl font-bold text-emerald-600">{mainMetrics.paidProjects}</p>
            <p className="text-xs text-muted-foreground">{mainMetrics.paymentRate.toFixed(1)}% do total</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Projetos Não Pagos</p>
            <p className="text-xl font-bold text-red-600">{mainMetrics.unpaidProjects}</p>
            <p className="text-xs text-muted-foreground">{(100 - mainMetrics.paymentRate).toFixed(1)}% do total</p>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default Analises
