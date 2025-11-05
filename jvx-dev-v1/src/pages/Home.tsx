import * as React from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, TrendingUp, DollarSign, Users, BarChart3 } from 'lucide-react'
import { StatsCards } from '@/components/StatsCards'
import { ValueCards } from '@/components/ValueCards'
import { PageHeader } from '@/components/PageHeader'
import { useWorks } from '@/contexts/WorksContext'
import { parseValue, formatCurrency } from '@/lib/utils'
import { Button } from '@/components/ui/button'

export function Home() {
  const { works, loading } = useWorks()

  const stats = React.useMemo(() => ({
    totalSites: works.length,
    pagamentosPendentes: works.filter((w) => 
      w.paymentStatus && w.paymentStatus.toLowerCase() !== 'pago'
    ).length,
  }), [works])

  const totalPago = React.useMemo(() => {
    const total = works.reduce((acc, w) => acc + parseValue(w.value), 0)
    return formatCurrency(total)
  }, [works])

  const totalPendente = React.useMemo(() => {
    const total = works
      .filter(w => !(w.paymentStatus && String(w.paymentStatus).toLowerCase() === 'pago'))
      .reduce((acc, w) => acc + parseValue(w.value), 0)
    return formatCurrency(total)
  }, [works])

  const recentWorks = React.useMemo(() => {
    return [...works]
      .sort((a, b) => Number(b.date) - Number(a.date))
      .slice(0, 5)
  }, [works])

  const quickStats = React.useMemo(() => {
    const thisMonth = new Date()
    thisMonth.setDate(1)
    thisMonth.setHours(0, 0, 0, 0)
    
    const thisMonthWorks = works.filter(w => new Date(w.date) >= thisMonth)
    const thisMonthValue = thisMonthWorks.reduce((acc, w) => acc + parseValue(w.value), 0)
    
    const developers = new Set(works.map(w => w.developer).filter(Boolean)).size
    const averageTicket = works.length > 0 ? works.reduce((acc, w) => acc + parseValue(w.value), 0) / works.length : 0
    
    return {
      thisMonthValue,
      thisMonthCount: thisMonthWorks.length,
      developers,
      averageTicket
    }
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
      {/* Header da Página */}
      <PageHeader
        title="Dashboard"
        description="Bem-vindo ao seu painel de controle. Visão geral dos seus projetos e métricas principais."
      />

      {/* Cards de Estatísticas e Valores */}
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCards 
          totalSites={stats.totalSites} 
          pagamentosPendentes={stats.pagamentosPendentes} 
        />
        <ValueCards 
          totalPago={totalPago} 
          totalPendente={totalPendente} 
        />
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border bg-card shadow-sm p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 rounded-lg bg-purple-100 text-purple-600 dark:bg-purple-950">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <p className="text-sm text-muted-foreground mb-1">Este Mês</p>
          <p className="text-2xl font-bold">{formatCurrency(quickStats.thisMonthValue)}</p>
          <p className="text-xs text-muted-foreground mt-1">{quickStats.thisMonthCount} projetos</p>
        </div>

        <div className="rounded-xl border bg-card shadow-sm p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 rounded-lg bg-green-100 text-green-600 dark:bg-green-950">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
          <p className="text-sm text-muted-foreground mb-1">Ticket Médio</p>
          <p className="text-2xl font-bold">{formatCurrency(quickStats.averageTicket)}</p>
          <p className="text-xs text-muted-foreground mt-1">Por projeto</p>
        </div>

        <div className="rounded-xl border bg-card shadow-sm p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 rounded-lg bg-cyan-100 text-cyan-600 dark:bg-cyan-950">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <p className="text-sm text-muted-foreground mb-1">Desenvolvedores</p>
          <p className="text-2xl font-bold">{quickStats.developers}</p>
          <p className="text-xs text-muted-foreground mt-1">Ativos</p>
        </div>

        <Link to="/analises" className="rounded-xl border bg-gradient-to-br from-primary/10 to-primary/5 shadow-sm p-5 hover:shadow-md transition-all hover:scale-[1.02] group">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 rounded-lg bg-primary/20 text-primary">
              <BarChart3 className="h-5 w-5" />
            </div>
            <ArrowRight className="h-4 w-4 text-primary group-hover:translate-x-1 transition-transform" />
          </div>
          <p className="text-sm text-muted-foreground mb-1">Análises Avançadas</p>
          <p className="text-lg font-bold text-primary">Ver Relatórios</p>
          <p className="text-xs text-muted-foreground mt-1">Gráficos e métricas</p>
        </Link>
      </div>

      {/* Grid Principal */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Projetos Recentes */}
        <div className="lg:col-span-2 rounded-xl border bg-card shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold">Projetos Recentes</h3>
              <p className="text-sm text-muted-foreground">Últimos 5 trabalhos cadastrados</p>
            </div>
            <Link to="/sites">
              <Button variant="outline" size="sm">
                Ver Todos
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
          <div className="space-y-3">
            {recentWorks.map((work, index) => (
              <div key={index} className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-md bg-primary/10 text-primary">
                      {work.typeWork}
                    </span>
                    {work.template && (
                      <a 
                        href={work.template} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-xs px-2 py-0.5 rounded-md bg-blue-100 text-blue-600 dark:bg-blue-950 hover:bg-blue-200 dark:hover:bg-blue-900 transition-colors"
                        title="Ver template no Envato"
                      >
                        Template
                      </a>
                    )}
                  </div>
                  <p className="text-sm font-medium truncate">{work.url}</p>
                  <p className="text-xs text-muted-foreground">{work.developer || 'Não atribuído'}</p>
                </div>
                <div className="text-right ml-4">
                  <p className="text-sm font-bold">{formatCurrency(parseValue(work.value))}</p>
                  <span className={`inline-flex items-center text-xs px-2 py-0.5 rounded-md ${
                    work.paymentStatus === 'Pago' 
                      ? 'bg-green-100 text-green-600 dark:bg-green-950' 
                      : 'bg-red-100 text-red-600 dark:bg-red-950'
                  }`}>
                    {work.paymentStatus}
                  </span>
                </div>
              </div>
            ))}
          </div>
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
                <TrendingUp className="h-4 w-4 mr-2" />
                Gerenciar Projetos
              </Button>
            </Link>
            <Link to="/analises" className="block">
              <Button variant="outline" className="w-full justify-start" size="lg">
                <BarChart3 className="h-4 w-4 mr-2" />
                Ver Análises
              </Button>
            </Link>
            <Link to="/equipe" className="block">
              <Button variant="outline" className="w-full justify-start" size="lg">
                <Users className="h-4 w-4 mr-2" />
                Gerenciar Equipe
              </Button>
            </Link>
          </div>

          <div className="mt-6 p-4 rounded-lg bg-muted/50">
            <p className="text-xs font-semibold text-muted-foreground mb-2">DICA DO DIA</p>
            <p className="text-sm">
              Use os filtros avançados na página de Sites para encontrar projetos específicos rapidamente.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home
