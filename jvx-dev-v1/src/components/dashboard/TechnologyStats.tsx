import * as React from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { type Work } from '@/lib/api'
import { parseValue, formatCurrency } from '@/lib/utils'

interface TechnologyStatsProps {
  works: Work[]
}

export function TechnologyStats({ works }: TechnologyStatsProps) {
  const data = React.useMemo(() => {
    const deadlineData = new Map<string, { count: number, value: number }>()
    
    works.forEach(work => {
      const deadline = work.deadline_type || 'Normal'
      const value = parseValue(work.value)
      
      if (!deadlineData.has(deadline)) {
        deadlineData.set(deadline, { count: 0, value: 0 })
      }
      
      const current = deadlineData.get(deadline)!
      current.count += 1
      current.value += value
    })
    
    return Array.from(deadlineData.entries())
      .map(([name, data]) => ({
        name,
        projetos: data.count,
        valor: data.value,
        average: data.value / data.count
      }))
      .sort((a, b) => b.projetos - a.projetos)
  }, [works])

  interface TechData {
    name: string
    projetos: number
    valor: number
    average: number
  }

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: TechData }> }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-card border rounded-lg shadow-lg p-3">
          <p className="font-semibold text-sm mb-1">{data.name}</p>
          <p className="text-xs text-muted-foreground">Projetos: {data.projetos}</p>
          <p className="text-xs text-muted-foreground">Valor Total: {formatCurrency(data.valor)}</p>
          <p className="text-xs text-muted-foreground">Ticket Médio: {formatCurrency(data.average)}</p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="rounded-xl border bg-card shadow-sm p-6">
      <div className="mb-4">
        <h3 className="text-lg font-bold">Projetos por Tipo de Prazo</h3>
        <p className="text-sm text-muted-foreground">Distribuição entre prazos normais e reduzidos</p>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis dataKey="name" className="text-xs" />
          <YAxis className="text-xs" />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="projetos" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
