import * as React from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { type Work } from '@/lib/api'
import { parseValue, formatCurrency } from '@/lib/utils'

interface TechnologyStatsProps {
  works: Work[]
}

export function TechnologyStats({ works }: TechnologyStatsProps) {
  const data = React.useMemo(() => {
    const techData = new Map<string, { count: number, value: number }>()
    
    works.forEach(work => {
      const tech = work.template || 'Não especificado'
      const value = parseValue(work.value)
      
      if (!techData.has(tech)) {
        techData.set(tech, { count: 0, value: 0 })
      }
      
      const current = techData.get(tech)!
      current.count += 1
      current.value += value
    })
    
    return Array.from(techData.entries())
      .map(([name, data]) => ({
        name,
        projetos: data.count,
        valor: data.value,
        average: data.value / data.count
      }))
      .sort((a, b) => b.projetos - a.projetos)
      .slice(0, 8)
  }, [works])

  const CustomTooltip = ({ active, payload }: any) => {
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
        <h3 className="text-lg font-bold">Templates Envato Mais Usados</h3>
        <p className="text-sm text-muted-foreground">Top 8 templates WordPress por quantidade de projetos</p>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis dataKey="name" className="text-xs" angle={-45} textAnchor="end" height={80} />
          <YAxis className="text-xs" />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="projetos" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
