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
      .filter(w => w.payment_status === 'Pago')
      .reduce((acc, w) => acc + parseValue(w.value), 0)
    const pendingValue = totalValue - paidValue
    
    const developers = new Set(works.map(w => w.developer).filter(Boolean)).size
    
    const thisMonth = new Date()
    thisMonth.setDate(1)
    thisMonth.setHours(0, 0, 0, 0)
    
    const thisMonthWorks = works.filter(w => {
      const deliveryDate = new Date(w.delivery_date)
      return deliveryDate >= thisMonth
    })
    const thisMonthValue = thisMonthWorks.reduce((acc, w) => acc + parseValue(w.value), 0)
    
    const lastMonth = new Date(thisMonth)
    lastMonth.setMonth(lastMonth.getMonth() - 1)
    const lastMonthWorks = works.filter(w => {
      const deliveryDate = new Date(w.delivery_date)
      return deliveryDate >= lastMonth && deliveryDate < thisMonth
    })
    const lastMonthValue = lastMonthWorks.length > 0 
      ? lastMonthWorks.reduce((acc, w) => acc + parseValue(w.value), 0) 
      : 0
    
    const monthGrowth = lastMonthValue > 0 
      ? ((thisMonthValue - lastMonthValue) / lastMonthValue) * 100 
      : 0
    
    const deliveredCount = works.filter(w => w.status === 'Entregue').length
    const paidCount = works.filter(w => w.payment_status === 'Pago').length
    const pendingCount = works.filter(w => w.status === 'Não Entregue').length
    
    return {
      totalValue,
      paidValue,
      pendingValue,
      developers,
      thisMonthValue,
      monthGrowth,
      deliveredCount,
      paidCount,
      pendingCount,
      thisMonthCount: thisMonthWorks.length
    }
  }, [works])

  const cards = [
    {
      title: 'Total de Projetos',
      value: works.length.toString(),
      icon: Package,
      description: 'Projetos cadastrados',
      color: 'text-blue-600 bg-blue-500/10 dark:text-blue-400'
    },
    {
      title: 'Projetos Entregues',
      value: metrics.deliveredCount.toString(),
      icon: TrendingUp,
      description: `${((metrics.deliveredCount / works.length) * 100).toFixed(1)}% do total`,
      color: 'text-green-600 bg-green-500/10 dark:text-green-400'
    },
    {
      title: 'Projetos Pendentes',
      value: metrics.pendingCount.toString(),
      icon: TrendingDown,
      description: 'Aguardando entrega',
      color: 'text-orange-600 bg-orange-500/10 dark:text-orange-400'
    },
    {
      title: 'Pagamentos Recebidos',
      value: metrics.paidCount.toString(),
      icon: DollarSign,
      description: `${((metrics.paidCount / works.length) * 100).toFixed(1)}% do total`,
      color: 'text-emerald-600 bg-emerald-500/10 dark:text-emerald-400'
    },
    {
      title: 'Desenvolvedores Ativos',
      value: metrics.developers.toString(),
      icon: Users,
      description: 'Equipe trabalhando',
      color: 'text-cyan-600 bg-cyan-500/10 dark:text-cyan-400'
    },
    {
      title: 'Receita Total',
      value: formatCurrency(metrics.totalValue),
      icon: Calendar,
      description: `Pgto recebido: ${formatCurrency(metrics.paidValue)}`,
      color: 'text-purple-600 bg-purple-500/10 dark:text-purple-400'
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
