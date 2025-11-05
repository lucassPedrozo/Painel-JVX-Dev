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
    
    const averageTicket = works.length > 0 ? totalValue / works.length : 0
    
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
      averageTicket,
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
      color: 'text-blue-600 bg-blue-100 dark:bg-blue-950'
    },
    {
      title: 'Projetos Entregues',
      value: metrics.deliveredCount.toString(),
      icon: TrendingUp,
      description: `${((metrics.deliveredCount / works.length) * 100).toFixed(1)}% do total`,
      color: 'text-green-600 bg-green-100 dark:bg-green-950'
    },
    {
      title: 'Projetos Pendentes',
      value: metrics.pendingCount.toString(),
      icon: TrendingDown,
      description: 'Aguardando entrega',
      color: 'text-orange-600 bg-orange-100 dark:bg-orange-950'
    },
    {
      title: 'Pagamentos Recebidos',
      value: metrics.paidCount.toString(),
      icon: DollarSign,
      description: `${((metrics.paidCount / works.length) * 100).toFixed(1)}% do total`,
      color: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-950'
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
      icon: Calendar,
      description: `Ticket médio: ${formatCurrency(metrics.averageTicket)}`,
      color: 'text-purple-600 bg-purple-100 dark:bg-purple-950'
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
