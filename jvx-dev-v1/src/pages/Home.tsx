import * as React from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, TrendingUp, DollarSign, Users, BarChart3, Package, CheckCircle } from 'lucide-react'
import { PageHeader } from '@/components/PageHeader'
import { useWorks } from '@/contexts/WorksContext'
import { parseValue, formatCurrency, formatDate } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

function Home() {
  const { works, loading } = useWorks()

  // ============================================
  // CÁLCULOS FINANCEIROS PRECISOS
  // ============================================

  const financialMetrics = React.useMemo(() => {
    // Total de projetos
    const totalProjects = works.length

    // Projetos pagos e não pagos
    const paidProjects = works.filter(w => w.payment_status === 'Pago').length
    const unpaidProjects = totalProjects - paidProjects

    // Receita total (TODOS os projetos)
    const totalRevenue = works.reduce((sum, w) => sum + parseValue(w.value), 0)

    // Receita recebida (apenas PAGOS)
    const paidRevenue = works
      .filter(w => w.payment_status === 'Pago')
      .reduce((sum, w) => sum + parseValue(w.value), 0)

    // Receita pendente (NÃO PAGOS)
    const pendingRevenue = works
      .filter(w => w.payment_status !== 'Pago')
      .reduce((sum, w) => sum + parseValue(w.value), 0)

    // Ticket médio
    const averageTicket = totalProjects > 0 ? totalRevenue / totalProjects : 0

    // Taxa de pagamento
    const paymentRate = totalProjects > 0 ? (paidProjects / totalProjects) * 100 : 0

    return {
      totalProjects,
      paidProjects,
      unpaidProjects,
      totalRevenue,
      paidRevenue,
      pendingRevenue,
      averageTicket,
      paymentRate
    }
  }, [works])

  // ============================================
  // MÉTRICAS DO MÊS ATUAL
  // ============================================

  const monthlyMetrics = React.useMemo(() => {
    const now = new Date()
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    firstDayOfMonth.setHours(0, 0, 0, 0)

    const thisMonthWorks = works.filter(w => {
      const workDate = new Date(w.delivery_date)
      return workDate >= firstDayOfMonth
    })

    const thisMonthRevenue = thisMonthWorks.reduce((sum, w) => sum + parseValue(w.value), 0)
    const thisMonthPaid = thisMonthWorks.filter(w => w.payment_status === 'Pago').length

    return {
      count: thisMonthWorks.length,
      revenue: thisMonthRevenue,
      paid: thisMonthPaid
    }
  }, [works])

  // ============================================
  // DESENVOLVEDORES ATIVOS
  // ============================================

  const activeDevelopers = React.useMemo(() => {
    const devs = new Set(works.map(w => w.developer).filter(Boolean))
    return devs.size
  }, [works])

  // ============================================
  // PROJETOS RECENTES
  // ============================================

  const recentWorks = React.useMemo(() => {
    return [...works]
      .sort((a, b) => Number(b.delivery_date) - Number(a.delivery_date))
      .slice(0, 5)
  }, [works])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Carregando dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-6">
      <PageHeader
        title="Dashboard"
        description="Visão geral financeira e métricas principais dos seus projetos."
      />

      {/* Cards Principais - Métricas Financeiras */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {/* Receita Total */}
        <Card className="p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-950">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
          <p className="text-sm text-muted-foreground mb-1">Receita Total</p>
          <p className="text-2xl font-bold">{formatCurrency(financialMetrics.totalRevenue)}</p>
          <p className="text-xs text-muted-foreground mt-1">{financialMetrics.totalProjects} projetos</p>
        </Card>

        {/* Receita Recebida */}
        <Card className="p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 rounded-lg bg-green-100 text-green-600 dark:bg-green-950">
              <CheckCircle className="h-5 w-5" />
            </div>
          </div>
          <p className="text-sm text-muted-foreground mb-1">Receita Recebida</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
            {formatCurrency(financialMetrics.paidRevenue)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {financialMetrics.paidProjects} pagos ({financialMetrics.paymentRate.toFixed(0)}%)
          </p>
        </Card>

        {/* Receita Pendente */}
        <Card className="p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 rounded-lg bg-orange-100 text-orange-600 dark:bg-orange-950">
              <Package className="h-5 w-5" />
            </div>
          </div>
          <p className="text-sm text-muted-foreground mb-1">Receita Pendente</p>
          <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
            {formatCurrency(financialMetrics.pendingRevenue)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">{financialMetrics.unpaidProjects} não pagos</p>
        </Card>

        {/* Ticket Médio */}
        <Card className="p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 rounded-lg bg-purple-100 text-purple-600 dark:bg-purple-950">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <p className="text-sm text-muted-foreground mb-1">Ticket Médio</p>
          <p className="text-2xl font-bold">{formatCurrency(financialMetrics.averageTicket)}</p>
          <p className="text-xs text-muted-foreground mt-1">Por projeto</p>
        </Card>
      </div>

      {/* Cards Secundários - Métricas Adicionais */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {/* Este Mês */}
        <Card className="p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 rounded-lg bg-cyan-100 text-cyan-600 dark:bg-cyan-950">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <p className="text-sm text-muted-foreground mb-1">Receita Este Mês</p>
          <p className="text-2xl font-bold">{formatCurrency(monthlyMetrics.revenue)}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {monthlyMetrics.count} projetos • {monthlyMetrics.paid} pagos
          </p>
        </Card>

        {/* Desenvolvedores */}
        <Card className="p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-950">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <p className="text-sm text-muted-foreground mb-1">Desenvolvedores</p>
          <p className="text-2xl font-bold">{activeDevelopers}</p>
          <p className="text-xs text-muted-foreground mt-1">Ativos no sistema</p>
        </Card>

        {/* Link para Análises */}
        <Link 
          to="/analises" 
          className="rounded-xl border bg-gradient-to-br from-primary/10 to-primary/5 shadow-sm p-6 hover:shadow-md transition-all hover:scale-[1.02] group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 rounded-lg bg-primary/20 text-primary">
              <BarChart3 className="h-5 w-5" />
            </div>
            <ArrowRight className="h-4 w-4 text-primary group-hover:translate-x-1 transition-transform" />
          </div>
          <p className="text-sm text-muted-foreground mb-1">Análises Detalhadas</p>
          <p className="text-lg font-bold text-primary">Ver Relatórios</p>
          <p className="text-xs text-muted-foreground mt-1">Gráficos e métricas completas</p>
        </Link>
      </div>

      {/* Grid Principal */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Projetos Recentes */}
        <div className="lg:col-span-2 rounded-xl border bg-card shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold">Projetos Recentes</h3>
              <p className="text-sm text-muted-foreground">Últimos 5 projetos cadastrados</p>
            </div>
            <Link to="/sites">
              <Button variant="outline" size="sm">
                Ver Todos
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>

          {recentWorks.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Nenhum projeto cadastrado ainda</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentWorks.map((work) => (
                <div 
                  key={work.id} 
                  className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-md bg-primary/10 text-primary">
                        {work.site_type}
                      </span>
                      {work.template && (
                        <a 
                          href={work.template} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-xs px-2 py-0.5 rounded-md bg-blue-100 text-blue-600 dark:bg-blue-950 hover:bg-blue-200 dark:hover:bg-blue-900 transition-colors"
                          title="Ver template"
                        >
                          Template
                        </a>
                      )}
                    </div>
                    <p className="text-sm font-medium truncate">{work.domain}</p>
                    <p className="text-xs text-muted-foreground">
                      {work.developer || 'Não atribuído'} • {formatDate(work.delivery_date)}
                    </p>
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-sm font-bold">{formatCurrency(parseValue(work.value))}</p>
                    <span className={`inline-flex items-center text-xs px-2 py-0.5 rounded-md ${
                      work.payment_status === 'Pago' 
                        ? 'bg-green-100 text-green-600 dark:bg-green-950' 
                        : 'bg-orange-100 text-orange-600 dark:bg-orange-950'
                    }`}>
                      {work.payment_status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Ações Rápidas */}
        <div className="rounded-xl border bg-card shadow-sm p-6">
          <div className="mb-4">
            <h3 className="text-lg font-bold">Ações Rápidas</h3>
            <p className="text-sm text-muted-foreground">Acesso rápido às principais funções</p>
          </div>
          <div className="space-y-3">
            <Link to="/sites" className="block">
              <Button variant="outline" className="w-full justify-start" size="lg">
                <Package className="h-4 w-4 mr-2" />
                Gerenciar Projetos
              </Button>
            </Link>
            <Link to="/relatorios" className="block">
              <Button variant="outline" className="w-full justify-start" size="lg">
                <BarChart3 className="h-4 w-4 mr-2" />
                Relatórios Financeiros
              </Button>
            </Link>
            <Link to="/analises" className="block">
              <Button variant="outline" className="w-full justify-start" size="lg">
                <TrendingUp className="h-4 w-4 mr-2" />
                Análises e Gráficos
              </Button>
            </Link>
            <Link to="/equipe" className="block">
              <Button variant="outline" className="w-full justify-start" size="lg">
                <Users className="h-4 w-4 mr-2" />
                Gerenciar Equipe
              </Button>
            </Link>
          </div>

          {/* Resumo Financeiro */}
          <div className="mt-6 p-4 rounded-lg bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20">
            <p className="text-xs font-semibold text-primary mb-2">RESUMO FINANCEIRO</p>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total:</span>
                <span className="font-semibold">{formatCurrency(financialMetrics.totalRevenue)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Recebido:</span>
                <span className="font-semibold text-green-600">{formatCurrency(financialMetrics.paidRevenue)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Pendente:</span>
                <span className="font-semibold text-orange-600">{formatCurrency(financialMetrics.pendingRevenue)}</span>
              </div>
              <div className="pt-2 border-t border-primary/20">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Taxa de Pagamento:</span>
                  <span className="font-semibold">{financialMetrics.paymentRate.toFixed(1)}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home
