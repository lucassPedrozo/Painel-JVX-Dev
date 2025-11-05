import * as React from 'react'
import { TrendingUp, TrendingDown, DollarSign, Calendar, Users, Package } from 'lucide-react'
import { type Work } from '@/lib/api'
import { parseValue, formatCurrency } from '@/lib/utils'

interface MetricsCardsProps {
  works: Work[]
}

export function MetricsCards({ works }: MetricsCardsProps) {
  const metrics = React.useMemo(() => {
    const totalValue = works.reduce((acc, w) => acc + parseValue(w.value), 0)
    const paidValue = works
      .filter(w => w.paymentStatus === 'Pago')
      .reduce((acc, w) => acc + parseValue(w.value), 0)
    const pendingValue = totalValue - paidValue
    
    const averageTicket = works.length > 0 ? totalValue / works.length : 0
    
    const developers = new Set(works.map(w => w.developer).filter(Boolean)).size
    
    const thisMonth = new Date()
    thisMonth.setDate(1)
    thisMonth.setHours(0, 0, 0, 0)
    
    const thisMonthWorks = works.filter(w => new Date(w.date) >= thisMonth)
    const thisMonthValue = thisMonthWorks.reduce((acc, w) => acc + parseValue(w.value), 0)
    
    const lastMonth = new Date(thisMonth)
    lastMonth.setMonth(lastMonth.getMonth() - 1)
    const lastMonthWorks = works.filter(w => {
      const date = new Date(w.date)
      return date >= lastMonth && date < thisMonth
    })
    const lastMonthValue = lastMonthWorks.length > 0 
      ? lastMonthWorks.reduce((acc, w) => acc + parseValue(w.value), 0) 
      : 0
    
    const monthGrowth = lastMonthValue > 0 
      ? ((thisMonthValue - lastMonthValue) / lastMonthValue) * 100 
      : 0
    
    const conversionRate = works.length > 0 
      ? (works.filter(w => w.paymentStatus === 'Pago').length / works.length) * 100 
      : 0
    
    return {
      totalValue,
      paidValue,
      pendingValue,
      averageTicket,
      developers,
      thisMonthValue,
      monthGrowth,
      conversionRate,
      thisMonthCount: thisMonthWorks.length
    }
  }, [works])

  const cards = [
    {
      title: 'Total de Projetos',
      value: works.length.toString(),
      icon: Package,
      description: 'Desenvolvimentos realizados',
      color: 'text-blue-600 bg-blue-100 dark:bg-blue-950'
    },
    {
      title: 'Projetos Este Mês',
      value: metrics.thisMonthCount.toString(),
      icon: Calendar,
      description: `${metrics.monthGrowth >= 0 ? '+' : ''}${metrics.monthGrowth.toFixed(0)}% vs mês anterior`,
      trend: metrics.monthGrowth,
      color: 'text-purple-600 bg-purple-100 dark:bg-purple-950'
    },
    {
      title: 'Projetos Concluídos',
      value: works.filter(w => w.paymentStatus === 'Pago').length.toString(),
      icon: TrendingUp,
      description: `${metrics.conversionRate.toFixed(1)}% do total`,
      color: 'text-green-600 bg-green-100 dark:bg-green-950'
    },
    {
      title: 'Em Aberto',
      value: works.filter(w => w.paymentStatus !== 'Pago').length.toString(),
      icon: TrendingDown,
      description: 'Aguardando pagamento',
      color: 'text-orange-600 bg-orange-100 dark:bg-orange-950'
    },
    {
      title: 'Desenvolvedores Ativos',
      value: metrics.developers.toString(),
      icon: Users,
      description: 'Equipe trabalhando',
      color: 'text-cyan-600 bg-cyan-100 dark:bg-cyan-950'
    },
    {
      title: 'Receita Total',
      value: formatCurrency(metrics.totalValue),
      icon: DollarSign,
      description: `Ticket médio: ${formatCurrency(metrics.averageTicket)}`,
      color: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-950'
    }
  ]

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {cards.map((card, index) => (
        <div key={index} className="rounded-xl border bg-card shadow-sm p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className={`p-2 rounded-lg ${card.color}`}>
              <card.icon className="h-4 w-4" />
            </div>
            {card.trend !== undefined && (
              <div className={`flex items-center text-xs font-medium ${card.trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {card.trend >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                {Math.abs(card.trend).toFixed(1)}%
              </div>
            )}
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">{card.title}</p>
            <p className="text-xl font-bold">{card.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{card.description}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
