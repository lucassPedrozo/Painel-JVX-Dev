import * as React from 'react'
import { CheckCircle, XCircle, Clock } from 'lucide-react'
import { type Work } from '@/lib/api'
import { parseValue, formatCurrency, formatDate } from '@/lib/utils'
import { useHideValues } from '@/contexts/HideValuesContext'

interface RecentActivityProps {
  works: Work[]
}

export function RecentActivity({ works }: RecentActivityProps) {
  const { sensitive } = useHideValues()
  const recentWorks = React.useMemo(() => {
    return [...works]
      .sort((a, b) => new Date(b.delivery_date).getTime() - new Date(a.delivery_date).getTime())
      .slice(0, 8)
  }, [works])

  return (
    <div className="rounded-xl border bg-card shadow-sm p-6">
      <div className="mb-4">
        <h3 className="text-lg font-bold">Projetos Recentes</h3>
        <p className="text-sm text-muted-foreground">Últimos 8 projetos por data de entrega</p>
      </div>
      <div className="space-y-3">
        {recentWorks.map((work, index) => (
          <div key={work.id || index} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
            <div className={`p-2 rounded-lg flex-shrink-0 ${
              work.status === 'Entregue' 
                ? 'bg-green-100 text-green-600' 
                : 'bg-orange-100 text-orange-600'
            }`}>
              {work.status === 'Entregue' ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <Clock className="h-4 w-4" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{work.domain}</p>
                  <p className="text-xs text-muted-foreground">{work.developer || 'Não atribuído'}</p>
                  <p className="text-xs text-muted-foreground">{work.site_type}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-bold">{sensitive(formatCurrency(parseValue(work.value)))}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(work.delivery_date)}</p>
                  <div className={`inline-flex items-center text-xs px-2 py-0.5 rounded-md mt-1 ${
                    work.payment_status === 'Pago' 
                      ? 'bg-green-100 text-green-600' 
                      : 'bg-red-100 text-red-600'
                  }`}>
                    {work.payment_status === 'Pago' ? (
                      <CheckCircle className="h-3 w-3 mr-1" />
                    ) : (
                      <XCircle className="h-3 w-3 mr-1" />
                    )}
                    {work.payment_status}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
