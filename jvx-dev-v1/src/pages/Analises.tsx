import * as React from 'react'
import { PageHeader } from '@/components/common'
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
  PieChart as PieChartIcon,
  Activity
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
  Cell,
  AreaChart,
  Area
} from 'recharts'

// Nomes de meses em PT-BR — evita bugs de timezone com new Date()
const MONTH_NAMES_SHORT = [
  'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
  'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
]

function Analises() {
  const { works, loading } = useWorks()

  // ============================================
  // MÉTRICAS PRINCIPAIS
  // ============================================

  const mainMetrics = React.useMemo(() => {
    const totalProjects = works.length
    const deliveredProjects = works.filter(w => w.status === 'Entregue').length
    const pendingProjects = totalProjects - deliveredProjects
    const completedProjects = works.filter(w => w.developer_status === 'Concluído').length
    const inProgressProjects = totalProjects - completedProjects
    const paidProjects = works.filter(w => w.payment_status === 'Pago').length
    const unpaidProjects = totalProjects - paidProjects

    const totalRevenue = works.reduce((sum, w) => sum + parseValue(w.value), 0)
    const paidRevenue = works
      .filter(w => w.payment_status === 'Pago')
      .reduce((sum, w) => sum + parseValue(w.value), 0)
    const pendingRevenue = totalRevenue - paidRevenue

    const deliveryRate = totalProjects > 0 ? (deliveredProjects / totalProjects) * 100 : 0
    const paymentRate = totalProjects > 0 ? (paidProjects / totalProjects) * 100 : 0
    const completionRate = totalProjects > 0 ? (completedProjects / totalProjects) * 100 : 0

    const activeDevelopers = new Set(works.map(w => w.developer).filter(Boolean)).size

    return {
      totalProjects,
      deliveredProjects,
      pendingProjects,
      completedProjects,
      inProgressProjects,
      paidProjects,
      unpaidProjects,
      totalRevenue,
      paidRevenue,
      pendingRevenue,
      deliveryRate,
      paymentRate,
      completionRate,
      activeDevelopers
    }
  }, [works])

  // ============================================
  // ANÁLISE MENSAL (Últimos 12 meses)
  // ============================================

  const monthlyData = React.useMemo(() => {
    if (works.length === 0) return []

    const monthlyMap = new Map<string, {
      year: number
      month: number
      total: number
      delivered: number
      completed: number
      paid: number
      revenue: number
      paidRevenue: number
    }>()

    works.forEach(work => {
      const date = new Date(work.delivery_date)
      if (isNaN(date.getTime())) return

      const year = date.getFullYear()
      const month = date.getMonth() // 0-11
      const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`
      
      if (!monthlyMap.has(monthKey)) {
        monthlyMap.set(monthKey, { year, month, total: 0, delivered: 0, completed: 0, paid: 0, revenue: 0, paidRevenue: 0 })
      }

      const data = monthlyMap.get(monthKey)!
      const value = parseValue(work.value)

      data.total += 1
      data.revenue += value

      if (work.status === 'Entregue') {
        data.delivered += 1
      }

      if (work.developer_status === 'Concluído') {
        data.completed += 1
      }

      if (work.payment_status === 'Pago') {
        data.paid += 1
        data.paidRevenue += value
      }
    })

    return Array.from(monthlyMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-12)
      .map(([, data]) => ({
        // FIX: Usar array de nomes ao invés de new Date() para evitar bug de timezone
        // new Date('2025-02-01') em UTC-3 vira Jan/2025 — incorreto!
        month: `${MONTH_NAMES_SHORT[data.month]}/${data.year}`,
        total: data.total,
        entregues: data.delivered,
        concluidos: data.completed,
        pagos: data.paid,
        receita: data.revenue,
        receitaPaga: data.paidRevenue,
        receitaPendente: data.revenue - data.paidRevenue
      }))
  }, [works])

  // ============================================
  // DADOS DE RECEITA MENSAL (para gráfico de área)
  // ============================================

  const revenueMonthlyData = React.useMemo(() => {
    return monthlyData.map(d => ({
      month: d.month,
      receita: d.receita,
      recebida: d.receitaPaga,
      pendente: d.receitaPendente
    }))
  }, [monthlyData])

  // ============================================
  // ANÁLISE POR DESENVOLVEDOR (Top 10)
  // ============================================

  const developerData = React.useMemo(() => {
    if (works.length === 0) return []

    const devMap = new Map<string, {
      total: number
      delivered: number
      completed: number
      paid: number
      revenue: number
      paidRevenue: number
    }>()

    works.forEach(work => {
      const dev = work.developer || 'Não atribuído'
      
      if (!devMap.has(dev)) {
        devMap.set(dev, { total: 0, delivered: 0, completed: 0, paid: 0, revenue: 0, paidRevenue: 0 })
      }

      const data = devMap.get(dev)!
      const value = parseValue(work.value)

      data.total += 1
      data.revenue += value

      if (work.status === 'Entregue') {
        data.delivered += 1
      }

      if (work.developer_status === 'Concluído') {
        data.completed += 1
      }

      if (work.payment_status === 'Pago') {
        data.paid += 1
        data.paidRevenue += value
      }
    })

    return Array.from(devMap.entries())
      .map(([name, data]) => ({
        name: name.length > 12 ? name.substring(0, 12) + '…' : name,
        fullName: name,
        total: data.total,
        entregues: data.delivered,
        concluidos: data.completed,
        pagos: data.paid,
        receita: data.revenue,
        receitaPaga: data.paidRevenue,
        taxaConclusao: data.total > 0 ? (data.completed / data.total) * 100 : 0
      }))
      .sort((a, b) => b.receita - a.receita)
      .slice(0, 10)
  }, [works])

  // ============================================
  // ANÁLISE POR TIPO DE PROJETO
  // ============================================

  const typeData = React.useMemo(() => {
    if (works.length === 0) return []

    const typeMap = new Map<string, { count: number, revenue: number, paid: number }>()

    works.forEach(work => {
      const type = work.site_type || 'Outros'
      
      if (!typeMap.has(type)) {
        typeMap.set(type, { count: 0, revenue: 0, paid: 0 })
      }

      const data = typeMap.get(type)!
      data.count += 1
      data.revenue += parseValue(work.value)
      if (work.payment_status === 'Pago') {
        data.paid += 1
      }
    })

    return Array.from(typeMap.entries())
      .map(([name, data]) => ({
        name,
        value: data.count,
        receita: data.revenue,
        pagos: data.paid,
        percentage: works.length > 0 ? (data.count / works.length) * 100 : 0
      }))
      .sort((a, b) => b.value - a.value)
  }, [works])

  // ============================================
  // ANÁLISE POR STATUS DO DESENVOLVEDOR
  // ============================================

  const statusData = React.useMemo(() => {
    if (works.length === 0) return []

    const completed = works.filter(w => w.developer_status === 'Concluído').length
    const inProgress = works.filter(w => w.developer_status !== 'Concluído').length

    return [
      { name: 'Concluído', value: completed, percentage: works.length > 0 ? (completed / works.length) * 100 : 0 },
      { name: 'Em Andamento', value: inProgress, percentage: works.length > 0 ? (inProgress / works.length) * 100 : 0 }
    ]
  }, [works])

  // ============================================
  // CORES PARA GRÁFICOS
  // ============================================

  const COLORS = ['#5b93e5', '#3eba83', '#dba03e', '#e05858', '#8670d6', '#d46c9e', '#3aadbe', '#7fb82e']
  const STATUS_COLORS = ['#3eba83', '#dba03e']

  // ============================================
  // TOOLTIPS CUSTOMIZADOS
  // ============================================

  const MonthlyTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: typeof monthlyData[number] }> }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-popover text-popover-foreground border rounded-lg shadow-lg p-3 text-sm">
          <p className="font-semibold mb-2">{data.month}</p>
          <div className="space-y-1">
            <p className="text-xs"><span className="inline-block w-2.5 h-2.5 rounded-sm mr-1.5" style={{ backgroundColor: '#5b93e5' }} />Total: <strong>{data.total}</strong></p>
            <p className="text-xs"><span className="inline-block w-2.5 h-2.5 rounded-sm mr-1.5" style={{ backgroundColor: '#3eba83' }} />Concluídos: <strong>{data.concluidos}</strong></p>
            <p className="text-xs"><span className="inline-block w-2.5 h-2.5 rounded-sm mr-1.5" style={{ backgroundColor: '#8670d6' }} />Pagos: <strong>{data.pagos}</strong></p>
            <div className="border-t mt-2 pt-2">
              <p className="text-xs font-semibold">Receita: {formatCurrency(data.receita)}</p>
              <p className="text-xs text-emerald-600">Recebida: {formatCurrency(data.receitaPaga)}</p>
              <p className="text-xs text-amber-600">Pendente: {formatCurrency(data.receitaPendente)}</p>
            </div>
          </div>
        </div>
      )
    }
    return null
  }

  const RevenueTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: typeof revenueMonthlyData[number] }> }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-popover text-popover-foreground border rounded-lg shadow-lg p-3 text-sm">
          <p className="font-semibold mb-2">{data.month}</p>
          <div className="space-y-1">
            <p className="text-xs">Receita Total: <strong>{formatCurrency(data.receita)}</strong></p>
            <p className="text-xs text-emerald-600">Recebida: <strong>{formatCurrency(data.recebida)}</strong></p>
            <p className="text-xs text-amber-600">Pendente: <strong>{formatCurrency(data.pendente)}</strong></p>
          </div>
        </div>
      )
    }
    return null
  }

  const DeveloperTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: typeof developerData[number] }> }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-popover text-popover-foreground border rounded-lg shadow-lg p-3 text-sm">
          <p className="font-semibold mb-2">{data.fullName}</p>
          <div className="space-y-1">
            <p className="text-xs">Total: <strong>{data.total}</strong> projetos</p>
            <p className="text-xs text-emerald-600">Concluídos: <strong>{data.concluidos}</strong> ({data.taxaConclusao.toFixed(0)}%)</p>
            <p className="text-xs text-blue-600">Pagos: <strong>{data.pagos}</strong></p>
            <div className="border-t mt-2 pt-2">
              <p className="text-xs font-semibold">Receita: {formatCurrency(data.receita)}</p>
              <p className="text-xs text-emerald-600">Pgto Realizado: {formatCurrency(data.receitaPaga)}</p>
            </div>
          </div>
        </div>
      )
    }
    return null
  }

  const TypeTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: typeof typeData[number] }> }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-popover text-popover-foreground border rounded-lg shadow-lg p-3 text-sm">
          <p className="font-semibold mb-2">{data.name}</p>
          <div className="space-y-1">
            <p className="text-xs">Quantidade: <strong>{data.value}</strong> ({data.percentage.toFixed(1)}%)</p>
            <p className="text-xs">Pagos: <strong>{data.pagos}</strong></p>
            <div className="border-t mt-2 pt-2">
              <p className="text-xs font-semibold">Receita: {formatCurrency(data.receita)}</p>
            </div>
          </div>
        </div>
      )
    }
    return null
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-muted border-t-primary" />
          <p className="text-sm text-muted-foreground">Carregando análises...</p>
        </div>
      </div>
    )
  }

  if (works.length === 0) {
    return (
      <div className="space-y-5 pb-6">
        <PageHeader
          title="Análises e Gráficos"
          description="Visualize métricas, tendências e performance através de gráficos interativos."
        />
        <Card className="p-12 border-transparent bg-card text-center">
          <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
          <h3 className="text-lg font-semibold mb-1">Nenhum projeto cadastrado</h3>
          <p className="text-sm text-muted-foreground">Cadastre projetos na página de Projetos para ver análises e gráficos aqui.</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-5 pb-6">
      <PageHeader
        title="Análises e Gráficos"
        description="Visualize métricas, tendências e performance através de gráficos interativos."
      />

      {/* Cards de Métricas Principais */}
      <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
        <Card className="p-5 border-transparent bg-card">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Package className="h-4 w-4" />
            </div>
          </div>
          <p className="text-xs font-medium text-muted-foreground mb-0.5">Total de Projetos</p>
          <p className="text-xl font-bold tracking-tight">{mainMetrics.totalProjects}</p>
          <p className="text-[11px] text-muted-foreground mt-1">{mainMetrics.activeDevelopers} desenvolvedores</p>
        </Card>

        <Card className="p-5 border-transparent bg-card">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <CheckCircle className="h-4 w-4" />
            </div>
          </div>
          <p className="text-xs font-medium text-muted-foreground mb-0.5">Taxa de Conclusão</p>
          <p className="text-xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">{mainMetrics.completionRate.toFixed(1)}%</p>
          <p className="text-[11px] text-muted-foreground mt-1">{mainMetrics.completedProjects} de {mainMetrics.totalProjects} concluídos</p>
        </Card>
      </div>

      {/* Cards de Receita */}
      <div className="grid gap-3 grid-cols-1 sm:grid-cols-3">
        <Card className="p-5 border-transparent bg-card">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <BarChart3 className="h-4 w-4" />
            </div>
          </div>
          <p className="text-xs font-medium text-muted-foreground mb-0.5">Receita Total</p>
          <p className="text-xl font-bold tracking-tight">{formatCurrency(mainMetrics.totalRevenue)}</p>
          <p className="text-[11px] text-muted-foreground mt-1">Todos os projetos</p>
        </Card>

        <Card className="p-5 border-transparent bg-card">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <CheckCircle className="h-4 w-4" />
            </div>
          </div>
          <p className="text-xs font-medium text-muted-foreground mb-0.5">Pagamentos Realizados</p>
          <p className="text-xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">{formatCurrency(mainMetrics.paidRevenue)}</p>
          <p className="text-[11px] text-muted-foreground mt-1">{mainMetrics.paidProjects} projetos pagos</p>
        </Card>

        <Card className="p-5 border-transparent bg-card">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <p className="text-xs font-medium text-muted-foreground mb-0.5">Receita Pendente</p>
          <p className="text-xl font-bold tracking-tight text-amber-600 dark:text-amber-400">{formatCurrency(mainMetrics.pendingRevenue)}</p>
          <p className="text-[11px] text-muted-foreground mt-1">{mainMetrics.unpaidProjects} projetos não pagos</p>
        </Card>
      </div>

      {/* Gráfico de Evolução Mensal — Projetos */}
      {monthlyData.length > 0 && (
        <Card className="p-5 border-transparent bg-card">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Calendar className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold">Evolução Mensal — Projetos</h3>
              <p className="text-xs text-muted-foreground">Quantidade de projetos por mês (últimos 12 meses)</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={monthlyData} barGap={2}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
                tickLine={{ stroke: 'hsl(var(--border))' }}
              />
              <YAxis 
                allowDecimals={false}
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
                tickLine={{ stroke: 'hsl(var(--border))' }}
              />
              <Tooltip content={<MonthlyTooltip />} />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey="total" fill="#5b93e5" name="Total" radius={[4, 4, 0, 0]} maxBarSize={40} />
              <Bar dataKey="concluidos" fill="#3eba83" name="Concluídos" radius={[4, 4, 0, 0]} maxBarSize={40} />
              <Bar dataKey="pagos" fill="#8670d6" name="Pagos" radius={[4, 4, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Gráfico de Receita Mensal */}
      {revenueMonthlyData.length > 0 && (
        <Card className="p-5 border-transparent bg-card">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Activity className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold">Receita Mensal</h3>
              <p className="text-xs text-muted-foreground">Evolução da receita recebida vs pendente</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={revenueMonthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
                tickLine={{ stroke: 'hsl(var(--border))' }}
              />
              <YAxis 
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
                tickLine={{ stroke: 'hsl(var(--border))' }}
                tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<RevenueTooltip />} />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Area 
                type="monotone" 
                dataKey="recebida" 
                stroke="#3eba83" 
                fill="#3eba83" 
                fillOpacity={0.15}
                strokeWidth={2}
                name="Recebida" 
              />
              <Area 
                type="monotone" 
                dataKey="pendente" 
                stroke="#dba03e" 
                fill="#dba03e" 
                fillOpacity={0.1}
                strokeWidth={2}
                name="Pendente" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Grid de Gráficos */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Performance por Desenvolvedor */}
        {developerData.length > 0 && (
          <Card className="p-5 border-transparent bg-card">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Users className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold">Top Desenvolvedores</h3>
                <p className="text-xs text-muted-foreground">Ranking por receita gerada</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={Math.max(250, developerData.length * 50)}>
              <BarChart data={developerData} layout="vertical" barGap={2}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                <XAxis 
                  type="number" 
                  tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                  axisLine={{ stroke: 'hsl(var(--border))' }}
                  tickLine={{ stroke: 'hsl(var(--border))' }}
                />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                  axisLine={{ stroke: 'hsl(var(--border))' }}
                  tickLine={{ stroke: 'hsl(var(--border))' }}
                  width={100} 
                />
                <Tooltip content={<DeveloperTooltip />} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="total" fill="#5b93e5" name="Total" maxBarSize={20} radius={[0, 4, 4, 0]} />
                <Bar dataKey="concluidos" fill="#3eba83" name="Concluídos" maxBarSize={20} radius={[0, 4, 4, 0]} />
                <Bar dataKey="pagos" fill="#8670d6" name="Pagos" maxBarSize={20} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        )}

        {/* Distribuição por Tipo */}
        {typeData.length > 0 && (
          <Card className="p-5 border-transparent bg-card">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <PieChartIcon className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold">Distribuição por Tipo</h3>
                <p className="text-xs text-muted-foreground">Tipos de projetos mais comuns</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={380}>
              <PieChart>
                <Pie
                  data={typeData}
                  cx="50%"
                  cy="45%"
                  labelLine={true}
                  label={({ name, percentage }) => `${name}: ${percentage.toFixed(0)}%`}
                  outerRadius={110}
                  innerRadius={50}
                  fill="#8884d8"
                  dataKey="value"
                  paddingAngle={2}
                >
                  {typeData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<TypeTooltip />} />
              </PieChart>
            </ResponsiveContainer>

            {/* Legenda personalizada */}
            <div className="flex flex-wrap gap-3 justify-center mt-2">
              {typeData.map((item, index) => (
                <div key={item.name} className="flex items-center gap-1.5">
                  <div 
                    className="w-2.5 h-2.5 rounded-sm shrink-0" 
                    style={{ backgroundColor: COLORS[index % COLORS.length] }} 
                  />
                  <span className="text-[11px] text-muted-foreground">{item.name} ({item.value})</span>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>

      {/* Status e Receita por Tipo */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Status dos Desenvolvedores */}
        {statusData.length > 0 && (
          <Card className="p-5 border-transparent bg-card">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Activity className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold">Status dos Projetos</h3>
                <p className="text-xs text-muted-foreground">Concluídos vs Em Andamento</p>
              </div>
            </div>
            
            <div className="space-y-4 mt-2">
              {statusData.map((item, index) => (
                <div key={item.name}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: STATUS_COLORS[index] }} />
                      <span className="text-sm font-medium">{item.name}</span>
                    </div>
                    <span className="text-sm font-bold">{item.value} <span className="text-xs font-normal text-muted-foreground">({item.percentage.toFixed(1)}%)</span></span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-3">
                    <div 
                      className="h-3 rounded-full transition-all duration-500" 
                      style={{ 
                        width: `${item.percentage}%`, 
                        backgroundColor: STATUS_COLORS[index],
                        minWidth: item.value > 0 ? '8px' : '0'
                      }} 
                    />
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    innerRadius={45}
                    dataKey="value"
                    paddingAngle={3}
                  >
                    {statusData.map((_, index) => (
                      <Cell key={`status-${index}`} fill={STATUS_COLORS[index]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number, name: string) => [`${value} projetos`, name]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        )}

        {/* Receita por Tipo */}
        {typeData.length > 0 && (
          <Card className="p-5 border-transparent bg-card">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-400">
                <DollarSign className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold">Receita por Tipo de Projeto</h3>
                <p className="text-xs text-muted-foreground">Faturamento por categoria</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={Math.max(250, typeData.length * 55)}>
              <BarChart data={typeData} layout="vertical" barGap={2}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                <XAxis 
                  type="number" 
                  tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                  axisLine={{ stroke: 'hsl(var(--border))' }}
                  tickLine={{ stroke: 'hsl(var(--border))' }}
                  tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`}
                />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                  axisLine={{ stroke: 'hsl(var(--border))' }}
                  tickLine={{ stroke: 'hsl(var(--border))' }}
                  width={120} 
                />
                <Tooltip formatter={(value: number) => [formatCurrency(value), 'Receita']} contentStyle={{ fontSize: '12px' }} />
                <Bar dataKey="receita" name="Receita" radius={[0, 4, 4, 0]} maxBarSize={24}>
                  {typeData.map((_, index) => (
                    <Cell key={`revenue-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        )}
      </div>

      {/* Resumo Estatístico */}
      <Card className="p-5 border-primary/20 bg-primary/[0.03]">
        <h3 className="text-sm font-semibold mb-4">Resumo Estatístico</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div>
            <p className="text-xs font-medium text-muted-foreground">Projetos Entregues</p>
            <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{mainMetrics.deliveredProjects}</p>
            <p className="text-[11px] text-muted-foreground">{mainMetrics.deliveryRate.toFixed(1)}% do total</p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground">Projetos Concluídos</p>
            <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{mainMetrics.completedProjects}</p>
            <p className="text-[11px] text-muted-foreground">{mainMetrics.completionRate.toFixed(1)}% do total</p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground">Em Andamento</p>
            <p className="text-lg font-bold text-amber-600 dark:text-amber-400">{mainMetrics.inProgressProjects}</p>
            <p className="text-[11px] text-muted-foreground">{(100 - mainMetrics.completionRate).toFixed(1)}% do total</p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground">Projetos Pagos</p>
            <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{mainMetrics.paidProjects}</p>
            <p className="text-[11px] text-muted-foreground">{mainMetrics.paymentRate.toFixed(1)}% do total</p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground">Projetos Não Pagos</p>
            <p className="text-lg font-bold text-red-600 dark:text-red-400">{mainMetrics.unpaidProjects}</p>
            <p className="text-[11px] text-muted-foreground">{(100 - mainMetrics.paymentRate).toFixed(1)}% do total</p>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default Analises
