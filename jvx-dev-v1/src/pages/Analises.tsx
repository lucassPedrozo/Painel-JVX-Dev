import { PageHeader } from '@/components/PageHeader'
import { useWorks } from '@/contexts/WorksContext'
import { MetricsCards } from '@/components/dashboard/MetricsCards'
import { ProjectsChart } from '@/components/dashboard/ProjectsChart'
import { DeveloperPerformance } from '@/components/dashboard/DeveloperPerformance'
import { WorkTypeDistribution } from '@/components/dashboard/WorkTypeDistribution'
import { TechnologyStats } from '@/components/dashboard/TechnologyStats'
import { PaymentTimeline } from '@/components/dashboard/PaymentTimeline'
import { RecentActivity } from '@/components/dashboard/RecentActivity'

export function Analises() {
  const { works, loading } = useWorks()

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
      {/* Header da Página */}
      <PageHeader
        title="Análises de Produtividade"
        description="Acompanhe a quantidade de projetos entregues, produtividade da equipe e estatísticas de desenvolvimento."
      />

      {/* Cards de Métricas */}
      <MetricsCards works={works} />

      {/* Gráfico de Projetos - Destaque */}
      <ProjectsChart works={works} />

      {/* Grid de Gráficos - 2 Colunas */}
      <div className="grid gap-6 lg:grid-cols-2">
        <DeveloperPerformance works={works} />
        <WorkTypeDistribution works={works} />
      </div>

      {/* Grid de Gráficos - 2 Colunas */}
      <div className="grid gap-6 lg:grid-cols-2">
        <TechnologyStats works={works} />
        <PaymentTimeline works={works} />
      </div>

      {/* Atividade Recente */}
      <RecentActivity works={works} />
    </div>
  )
}

export default Analises
