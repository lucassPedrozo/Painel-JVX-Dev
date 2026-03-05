import * as React from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, TrendingUp, DollarSign, Users, BarChart3, Package, CheckCircle } from 'lucide-react'
import { PageHeader } from '@/components/common'
import { useWorks } from '@/contexts/WorksContext'
import { useHideValues } from '@/contexts/HideValuesContext'
import { parseValue, formatCurrency, formatDate } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

function Home() {
  const { works, loading } = useWorks()
  const { sensitive } = useHideValues()

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

    // Taxa de pagamento
    const paymentRate = totalProjects > 0 ? (paidProjects / totalProjects) * 100 : 0

    return {
      totalProjects,
      paidProjects,
      unpaidProjects,
      totalRevenue,
      paidRevenue,
      pendingRevenue,
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
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    lastDayOfMonth.setHours(23, 59, 59, 999)

    const thisMonthWorks = works.filter(w => {
      const workDate = new Date(w.delivery_date)
      return workDate >= firstDayOfMonth && workDate <= lastDayOfMonth
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
          <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-muted border-t-primary" />
          <p className="text-sm text-muted-foreground">Carregando dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5 pb-6">
      <PageHeader
        title="Dashboard"
        description="Visão geral financeira e métricas dos seus projetos."
      />

      {/* Cards Principais — Métricas Financeiras */}
      <div className="grid gap-3 grid-cols-1 sm:grid-cols-3">
        {/* Receita Total */}
        <Card className="p-5 group hover:shadow-md transition-all border-transparent bg-card">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <p className="text-xs font-medium text-muted-foreground mb-0.5">Receita Total</p>
          <p className="text-xl font-bold tracking-tight">{sensitive(formatCurrency(financialMetrics.totalRevenue))}</p>
          <p className="text-[11px] text-muted-foreground mt-1">{financialMetrics.totalProjects} projetos</p>
        </Card>

        {/* Pagamentos Realizados */}
        <Card className="p-5 group hover:shadow-md transition-all border-transparent bg-card">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600">
              <CheckCircle className="h-4 w-4" />
            </div>
          </div>
          <p className="text-xs font-medium text-muted-foreground mb-0.5">Pagamentos Realizados</p>
          <p className="text-xl font-bold tracking-tight text-emerald-600">
            {sensitive(formatCurrency(financialMetrics.paidRevenue))}
          </p>
          <p className="text-[11px] text-muted-foreground mt-1">
            {financialMetrics.paidProjects} pagos ({financialMetrics.paymentRate.toFixed(0)}%)
          </p>
        </Card>

        {/* Receita Pendente */}
        <Card className="p-5 group hover:shadow-md transition-all border-transparent bg-card">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600">
              <Package className="h-4 w-4" />
            </div>
          </div>
          <p className="text-xs font-medium text-muted-foreground mb-0.5">Receita Pendente</p>
          <p className="text-xl font-bold tracking-tight text-amber-600">
            {sensitive(formatCurrency(financialMetrics.pendingRevenue))}
          </p>
          <p className="text-[11px] text-muted-foreground mt-1">{financialMetrics.unpaidProjects} não pagos</p>
        </Card>
      </div>

      {/* Cards Secundários */}
      <div className="grid gap-3 grid-cols-1 sm:grid-cols-3">
        {/* Este Mês */}
        <Card className="p-5 hover:shadow-md transition-all border-transparent bg-card">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sky-500/10 text-sky-600">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <p className="text-xs font-medium text-muted-foreground mb-0.5">Receita Este Mês</p>
          <p className="text-xl font-bold tracking-tight">{sensitive(formatCurrency(monthlyMetrics.revenue))}</p>
          <p className="text-[11px] text-muted-foreground mt-1">
            {monthlyMetrics.count} projetos &middot; {monthlyMetrics.paid} pagos
          </p>
        </Card>

        {/* Desenvolvedores */}
        <Card className="p-5 hover:shadow-md transition-all border-transparent bg-card">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <p className="text-xs font-medium text-muted-foreground mb-0.5">Desenvolvedores</p>
          <p className="text-xl font-bold tracking-tight">{activeDevelopers}</p>
          <p className="text-[11px] text-muted-foreground mt-1">Ativos no sistema</p>
        </Card>

        {/* Link para Análises */}
        <Link 
          to="/analises" 
          className="rounded-xl border border-primary/20 bg-primary/[0.04] p-5 hover:bg-primary/[0.08] transition-all group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <BarChart3 className="h-4 w-4" />
            </div>
            <ArrowRight className="h-4 w-4 text-primary opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
          </div>
          <p className="text-xs font-medium text-muted-foreground mb-0.5">Análises Detalhadas</p>
          <p className="text-lg font-bold tracking-tight text-primary">Ver Relatórios</p>
          <p className="text-[11px] text-muted-foreground mt-1">Gráficos e métricas completas</p>
        </Link>
      </div>

      {/* Grid Principal */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Projetos Recentes */}
        <Card className="lg:col-span-2 p-0 overflow-hidden border-transparent bg-card">
          <div className="flex items-center justify-between p-5 pb-0">
            <div>
              <h3 className="text-sm font-semibold">Projetos Recentes</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Últimos 5 projetos cadastrados</p>
            </div>
            <Link to="/sites">
              <Button variant="ghost" size="sm" className="text-xs h-8 gap-1.5 text-muted-foreground hover:text-foreground">
                Ver Todos
                <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </div>

          <div className="p-5">
            {recentWorks.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                <Package className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Nenhum projeto cadastrado ainda</p>
              </div>
            ) : (
              <div className="space-y-1.5">
                {recentWorks.map((work) => (
                  <div 
                    key={work.id} 
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="inline-flex items-center text-[10px] font-semibold px-1.5 py-0.5 rounded bg-primary/10 text-primary uppercase tracking-wide">
                          {work.site_type}
                        </span>
                        {work.template && (
                          <a 
                            href={work.template} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-[10px] px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-600 hover:bg-sky-500/20 transition-colors"
                            title="Ver template"
                          >
                            Template
                          </a>
                        )}
                      </div>
                      <p className="text-sm font-medium truncate">{work.domain}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {work.developer || 'Não atribuído'} &middot; {formatDate(work.delivery_date)}
                      </p>
                    </div>
                    <div className="text-right ml-4 shrink-0">
                      <p className="text-sm font-semibold">{sensitive(formatCurrency(parseValue(work.value)))}</p>
                      <span className={`inline-flex items-center text-[10px] font-medium px-1.5 py-0.5 rounded ${
                        work.payment_status === 'Pago' 
                          ? 'bg-emerald-500/10 text-emerald-600' 
                          : 'bg-amber-500/10 text-amber-600'
                      }`}>
                        {work.payment_status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>

        {/* Ações Rápidas + Resumo */}
        <div className="space-y-4">
          <Card className="p-5 border-transparent bg-card">
            <h3 className="text-sm font-semibold mb-1">Ações Rápidas</h3>
            <p className="text-xs text-muted-foreground mb-4">Acesso rápido às funções principais</p>
            <div className="space-y-1.5">
              <Link to="/sites" className="block">
                <Button variant="ghost" className="w-full justify-start h-9 text-sm font-normal text-muted-foreground hover:text-foreground">
                  <Package className="h-4 w-4 mr-2.5 text-primary" />
                  Gerenciar Projetos
                </Button>
              </Link>
              <Link to="/relatorios" className="block">
                <Button variant="ghost" className="w-full justify-start h-9 text-sm font-normal text-muted-foreground hover:text-foreground">
                  <BarChart3 className="h-4 w-4 mr-2.5 text-primary" />
                  Relatórios Financeiros
                </Button>
              </Link>
              <Link to="/analises" className="block">
                <Button variant="ghost" className="w-full justify-start h-9 text-sm font-normal text-muted-foreground hover:text-foreground">
                  <TrendingUp className="h-4 w-4 mr-2.5 text-primary" />
                  Análises e Gráficos
                </Button>
              </Link>
              <Link to="/equipe" className="block">
                <Button variant="ghost" className="w-full justify-start h-9 text-sm font-normal text-muted-foreground hover:text-foreground">
                  <Users className="h-4 w-4 mr-2.5 text-primary" />
                  Gerenciar Equipe
                </Button>
              </Link>
            </div>
          </Card>

          {/* Resumo Financeiro */}
          <Card className="p-5 border-primary/20 bg-primary/[0.03]">
            <p className="text-[10px] font-bold text-primary tracking-wider uppercase mb-3">Resumo Financeiro</p>
            <div className="space-y-2.5">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Total</span>
                <span className="font-semibold">{sensitive(formatCurrency(financialMetrics.totalRevenue))}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Recebido</span>
                <span className="font-semibold text-emerald-600">{sensitive(formatCurrency(financialMetrics.paidRevenue))}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Pendente</span>
                <span className="font-semibold text-amber-600">{sensitive(formatCurrency(financialMetrics.pendingRevenue))}</span>
              </div>
              <div className="pt-2.5 border-t">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground">Taxa de Pagamento</span>
                  <span className="font-semibold">{financialMetrics.paymentRate.toFixed(1)}%</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default Home
