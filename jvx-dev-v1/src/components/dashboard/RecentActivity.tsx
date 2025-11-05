import * as React from 'react'
import { CheckCircle, XCircle } from 'lucide-react'
import { type Work } from '@/lib/api'
import { parseValue, formatCurrency, formatDate } from '@/lib/utils'

interface RecentActivityProps {
  works: Work[]
}

export function RecentActivity({ works }: RecentActivityProps) {
  const recentWorks = React.useMemo(() => {
    return [...works]
      .sort((a, b) => Number(b.date) - Number(a.date))
      .slice(0, 8)
  }, [works])

  return (
    <div className="rounded-xl border bg-card shadow-sm p-6">
      <div className="mb-4">
        <h3 className="text-lg font-bold">Atividade Recente</h3>
        <p className="text-sm text-muted-foreground">Últimos 8 projetos cadastrados</p>
      </div>
      <div className="space-y-3">
        {recentWorks.map((work, index) => (
          <div key={index} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
            <div className={`p-2 rounded-lg flex-shrink-0 ${
              work.paymentStatus === 'Pago' 
                ? 'bg-green-100 text-green-600 dark:bg-green-950' 
                : 'bg-red-100 text-red-600 dark:bg-red-950'
            }`}>
              {work.paymentStatus === 'Pago' ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <XCircle className="h-4 w-4" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{work.typeWork}</p>
                  <p className="text-xs text-muted-foreground">{work.developer || 'Não atribuído'}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-bold">{formatCurrency(parseValue(work.value))}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(work.date)}</p>
                </div>
              </div>
              {work.template && (
                <a 
                  href={work.template} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-xs px-2 py-0.5 rounded-md bg-blue-100 text-blue-600 dark:bg-blue-950 mt-1 hover:bg-blue-200 dark:hover:bg-blue-900 transition-colors"
                  title="Ver template no Envato"
                >
                  Template Envato
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
